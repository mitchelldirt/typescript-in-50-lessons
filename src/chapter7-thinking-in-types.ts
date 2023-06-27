// ! LESSON 43: Promisify

// Going from a Promise based workflow to a callback based workflow can be a pain. Stefan Baumgartner shows us how to use the promisify function to make this easier. (crazy that GitHub CoPilot wrote that last sentence for me lol)

declare function loadFile(fileName: string, cb: (result: string) => void): void;

// But, we'd really prefer to use a promise rather than a call back because callbacks can be confusing, especially for someone like me who is used to the ES6 and beyond way of doing things.

declare function promisify<Fun extends FunctionWithCallback>(
  fun: Fun
): PromisifiedFunction<Fun>;

// ! AHHHHH, this is hard to read and follow, but we can simplify it using a variadic tuple type.
type FunctionWithCallback =
  | ((arg1: any, cb: (result: any) => any) => any)
  | ((arg1: any, arg2: any, cb: (result: any) => any) => any)
  | ((arg1: any, arg2: any, arg3: any, cb: (result: any) => any) => any);

type FunctionWithCallback2<T extends any = any[]> = (
  ...t: [...T[], (...args: any) => any]
) => any;

type PromisifiedFunction<T> = (
  ...args: InferedArguments<T>
) => Promise<InferedCallbackResult<T>>;

type InferedArguments<T> = T extends (
  ...t: [...infer R, (...args: any) => any]
) => any
  ? R
  : never;

type InferedCallbackResult<T> = T extends (
  ...t: [...infer T, (res: infer R) => any]
) => any
  ? R
  : never;

function promisify2<Fun extends FunctionWithCallback>(
  fun: Fun
): PromisifiedFunction<Fun> {
  return (...args: InferedArguments<Fun>) => {
    return new Promise((resolve, reject) => {
      function callback(result: InferedCallbackResult<Fun>) {
        resolve(result);
      }
      args.push(callback);
      // @ts-ignore
      fun.call(null, ...args);
    });
  };
}

// ? Closing notes: This chapter was definitely a challenge. I understand everything presented on a conceptual level, but the benefits of the Promisify functions are a bit lost on me. The implementation is also hard to follow with all of the spread operator single letter typing.

// !-----------------------------------!
// ! LESSON 44: JSONify

class Serializer<T> {
  serialize(inp: T): string {
    return JSON.stringify(inp);
  }

  deserialize(inp: string): T {
    return JSON.parse(inp);
  }
}

// JSON.parse and JSON.stringify are useful for serializing and deserializing JSON data
// It's actually faster to parse JSON data than it is to parse an object

type Widget = {
  toJSON(): {
    kind: "Widget";
    date: Date;
  };
};

type Item = {
  text: string;
  count: number;
  choice: "yes" | "no" | null;

  // Dropping the functions from the object
  func: () => void;

  // We need to parse nested elements
  nested: {
    isSaved: boolean;
    data: [1, undefined, 2];
  };

  // A pointer to another type of widget
  widget: Widget;

  // The same item references again
  children?: Item[];
};

// There is a difference between JSON and JS Objects. Below we'll be showing that off using JSONified

type JSONified<T> = JSONifiedValue<T extends { toJSON(): infer U } ? U : T>;

type JSONifiedValue<T> = T extends string | number | boolean | null
  ? T
  : T extends Function
  ? never
  : T extends object
  ? JSONifiedObject<T>
  : T extends Array<infer U>
  ? JSONifiedArray<U>
  : never;

// This is a mapped type where we run through each property and apply the JSONified type to it. This is also an example of a recursive type. Typescript allows non circular recursive types.
type JSONifiedObject<T> = {
  [K in keyof T]: JSONified<T[K]>;
};

// We need to remap undefined types to null
type UndefinedAsNull<T> = T extends undefined ? null : T;

type JSONifiedArray<T> = Array<JSONified<UndefinedAsNull<T>>>;

/*
Here's what it will look like in action
I don't fully understand how this is useful, but the more I look at weird typescript magic the more I understand it, bit by bit.

const itemSerializer = new Serializer<Item>();

const serialization = itemSerializer.serialize(anItem);

const obj = itemSerializer.deserialize(serialization);
*/

// !-----------------------------------!
// ! LESSON 45: Service Definitions

// In this lesson we'll be seeing
/*
- Mapped types
- Conditional types
- String and Number constructors
- Control flow analysis
*/

// We're trying to help our colleagues defined a service through a js object. This example will be for opening, closing, and writing to a file.

const serviceDefinition = {
  open: { filename: String },
  insert: { pos: Number, text: String },
  delete: { post: Number, len: Number },
  close: {},
};

// In the above String and Number are constructors NOT Typescript types.

// We want to have a function createService that we pass two things to
// 1. The service definition in the format described above
// 2. A request handler. This function will receive messages and payloads. We expect to get a message open where the payload will be the filename

// First we're going to create the initial function head without a lot of the content present

declare function createService<S extends ServiceDefinition>(
  serviceDefinition: S,
  handler: RequestHanlder<S>
): ServiceObject<S>;

// A service definition has keys that we don't know yet and lots of method definitions
type ServiceDefinition = {
  [methodName: string]: MethodDefinition;
};

// This is the "payload" for each method
// a key we don't know yet and either a string or a number constructor (as seen earlier)
// paramName key is either a StringConstructor or a NumberConstructor
type MethodDefinition = {
  [paramName: string]: StringConstructor | NumberConstructor;
};

// The type provided should be ServiceDefinition and the return type will be a boolean based on if the request was successful or not
type RequestHandler<T extends ServiceDefinition> = (
  req: RequestObject<T>
) => boolean;

// The request object is defined by the service definition that we pass in. Each key is a message and the object after it is the payload

type RequestObject<T extends ServiceDefinition> = {
  [P in keyof T]: {
    message: P;
    payload: RequestPayload<T[P]>;
  };
}[keyof T]; // The keyof T will create a union of all of the keys in the service definition

// The request payload is defined by the object of eadch key in the service definition

type RequestPayload<T extends MethodDefinition> =
  // Is the object empty?
  {} extends T
    ? undefined
    : {
        [P in keyof T]: TypeFromConstructor<T[P]>;
      };

type TypeFromConstructor<T> = T extends StringConstructor
  ? string
  : T extends NumberConstructor
  ? number
  : never;

// Now we are going to create the ServiceObject type

type ServiceObject<T extends ServiceDefinition> = {
  [P in keyof T]: ServiceMethod<T[P]>;
};

// Each service method will take a payload that's defined in the object after each key in the service definition. This is what ServiceMethod will be

// If the object is empty, we don't need to define the payload. Otherwise we pass in the payload that we defined earlier
type ServiceMethod<T extends MethodDefinition> = {} extends T
  ? () => boolean
  : (payload: RequestPayload<T>) => boolean;

function createService<S extends ServiceDefinition>(
  serviceDef: S,
  handler: RequestHandler<S>
): ServiceObject<S> {
  const service: Record<string, Function> = {};

  for (const methodName in serviceDef) {
    service[methodName] = (payload: any) =>
      handler({ message: methodName, payload });
  }

  // Typecast to provide some type safety since we can't know for sure what type the service object will be
  return service as ServiceObject<S>;
}

// This is what the service object will look like
const service = createService(serviceDefinition, (req: any) => {
  switch (req.message) {
    case "open":
      req.payload.filename;
      break;
    case "insert":
      req.payload.pos;
      req.payload.text;
      break;
    case "delete":
      req.payload.pos;
      req.payload.len;
      break;
    case "close":
      break;
    default:
      return false;
  }
  return true;
});

// !-----------------------------------!
// ! LESSON 46: DOM JSX Engine, part 1

// !-----------------------------------!
// ! LESSON 47: DOM JSX Engine, part 2

// !-----------------------------------!
// ! LESSON 48: Extending Object, Part 1

// !-----------------------------------!
// ! LESSON 49: Extending Object, Part 2

// !-----------------------------------!
// ! LESSON 50: Epilogue
