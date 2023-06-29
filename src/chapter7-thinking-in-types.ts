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
//@ts-ignore
declare function createService<S extends ServiceDefinition>(
  serviceDefinition: S,
  handler: RequestHandler<S>
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

// JSX is a syntax extension to Javascript that allows us to write HTML like syntax in our JS files. It's not a templating language, it's a syntax extension. It's not a templating language because it doesn't have logic, it's just a way to write HTML like syntax in JS files.

// Let's implement a factory function that will create a DOM node

// Much looser implementation of Function
type Fun = (...args: any[]) => any;

// Now we need to type the element. If it's in the HTML spec, we want to make sure that it's a valid element. We can do this by using the HTMLElementTagNameMap otherwise we'll just use HTMLElement
type AllElementKeys = keyof HTMLElementTagNameMap;

type CreatedElement<T> = T extends AllElementKeys
  ? HTMLElementTagNameMap[T]
  : HTMLElement;

type Props<T> = T extends Fun
  ? Parameters<T>[0]
  : T extends string
  ? Partial<CreatedElement<T>>
  : never;

function DOMcreateElement<T extends string>(
  element: T,
  properties: Props<T>,
  ...children: PossibleChildren[]
): HTMLElement;

function DOMcreateElement<F extends Fun>(
  element: F,
  properties: Props<F>,
  ...children: PossibleChildren[]
): HTMLElement;

function DOMcreateElement(
  element: any,
  properties: any,
  ...children: any[]
): HTMLElement {
  if (typeof element === "function") {
    return element({
      // We're using the nonNull function to make sure that we don't pass in undefined values
      // We're using the spread operator to pass in the properties and children
      ...nonNull(properties, {}),
      children,
    });
  }

  return DOMparseNode(element, properties, children);
}

function nonNull<T, U>(value: T, defaultValue: U) {
  return Boolean(value) ? value : defaultValue;
}

function DOMparseNode<T extends string>(
  element: T,
  properties: Props<T>,
  children: PossibleChildren[]
) {
  // Creating a DOM node object
  const el = Object.assign(document.createElement(element), properties);

  // We're going to parse the children and append them to the DOM node
  DOMparseChildren(children).forEach((child) => el.appendChild(child));

  return el;
}

// If it's a string we just create a text node
// If it's an object we create a DOM node
// These will be used in the DOMparseNode function to append to their parent node
type PossibleChildren = string | Text | HTMLElement;

function DOMparseChildren(children: PossibleChildren[]) {
  return children.map((child) => {
    if (typeof child === "string") {
      return document.createTextNode(child);
    }

    return child;
  });
}

// !-----------------------------------!
// ! LESSON 47: DOM JSX Engine, part 2

// turning back on noImplicitAny 🤯 all of the content for this chapter besides the namespace stuff is just putting types on the above code from part 1 :)

// we can extend the JSX namespace
declare namespace JSX {
  type OurIntrinsicElements = {
    [P in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[P]>;
  };

  interface IntrinsicElements extends OurIntrinsicElements {}

  interface Element extends HTMLElement {}
}

// !-----------------------------------!
// ! LESSON 48: Extending Object, Part 1

// Typescripts control flow analysis lets us narrow down types really well. Objects can be a bit more difficult to narrow down.

// This is how you would do type narrowing in JS
function print(msg: any) {
  if (typeof msg === "string") {
    console.log(msg.toUpperCase());
  } else if (typeof msg === "number") {
    console.log(msg.toFixed(2));
  }
}

let obj = await fetch("https://jsonplaceholder.typicode.com/todos/1");
obj = await obj.json();

// right now the type of obj is Promise<any>
if (typeof obj === "object" && "prop" in obj) {
  console.assert(typeof obj.prop === "undefined");
}

if (typeof obj === "object" && obj.hasOwnProperty("prop")) {
  // @ts-expect-error
  console.assert(typeof obj.prop === "undefined");
}

// Typescript doesn't know that obj is an object, it just knows that it's a promise. We can use a helper function to help typescript narrow down the type of obj

// Two generics X and Y. X is the object and Y is the property key
// X extends {} means IF X is an object
// Y extends PropertyKey means IF Y is a property key
// No need to defined the generics as they are inferred
// obj is X & Record<Y, unknown> means that obj is X and it has a property Y
// This is a type predicate
function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop);
}

// A common thing you may do with objects is iterate over keys and perform an action for each one. Typescript doesn't like this because it doesn't know what the keys are. We can use a helper function to help typescript narrow down the type of obj

const author = {
  name: "Stefan",
  age: 30,
};

Object.keys(author).map((key) => {
  // ! We don't know what 'key' is!
  // haha now that we have the new keys property on the Object constructor we do know what key is
  console.log(author[key]);
});

// With the helper function if we pass a number we'll return an empty array
// If we pass an array or string we get a string array
// If we pass an object we get the actual keys

// In the ambient type file we'll define the keys property on the Object constructor

// !-----------------------------------!
// ! LESSON 49: Extending Object, Part 2

const storage = {
  currentValue: 0,
};

// This won't work because we're trying to assign a value to a readonly property
Object.defineProperty(storage, "maxValue", {
  value: 9001,
  writable: false,
});

// ! This used to give us an error. Now that define property has a new overload that uses the correct type this doesn't throw an error anymore! :)
console.log(storage.maxValue);

// We can use assertion signatures to tell typescript that we know what we're doing
// This is similar to the below in node js

function assertIsNum(val: any): asserts val is number {
  if (typeof val !== "number") {
    throw new Error("Not a number!");
  }
}

// This will either return number or throw an error
function multiply(x: any, y: any) {
  assertIsNum(x);
  assertIsNum(y);

  return x * y;
}

// Now we're going to implement our own defineProperty function
// ! Warning: do not try and use this in production code, this is just for learning purposes
//@ts-expect-error
function defineProperty<
  Obj extends object,
  Key extends PropertyKey,
  PDesc extends PropertyDescriptor
>(obj: Obj, prop: Key, desc: PDesc) {
  Object.defineProperty(obj, prop, desc);
}

// There are 3 generics in the above function
// Obj extends object means that Obj is an object
// Key extends PropertyKey means that Key is a property key so it's string | number | symbol
// PDesc extends PropertyDescriptor. This allows us to define the property with all features like writable, enumerable, etc

// let's implement another function signature for this
// @ts-expect-error
function defineProperty<
  Obj extends object,
  Key extends PropertyKey,
  PDesc extends PropertyDescriptor
>(
  obj: Obj,
  prop: Key,
  desc: PDesc
): asserts obj is Obj & DefineProperty<Key, PDesc> {
  Object.defineProperty(obj, prop, desc);
}

// ! My brain melted trying to even type this lol
/*
1. If we set writable to any property accessor (get, set) then we don't want to return anything
2. If we set writable to false, the property is read only so we want to return a readonly version of the property which we use infer to get the type of the property
3. If we set writable to true, the property is writable so we want to return the property
4. The last case is the default case where we return a readonly version of the property
*/
type DefineProperty<
  Prop extends PropertyKey,
  Desc extends PropertyDescriptor
> = Desc extends {
  writable: any;
  set(value: any): any;
}
  ? never
  : Desc extends {
      writable: any;
      get(): any;
    }
  ? never
  : Desc extends {
      writable: false;
    }
  ? Readonly<InferValue<Prop, Desc>>
  : Desc extends {
      writable: true;
    }
  ? InferValue<Prop, Desc>
  : Readonly<InferValue<Prop, Desc>>;

type InferValue<Prop extends PropertyKey, Desc> = Desc extends {
  get(): any;
  value: any;
}
  ? never
  : Desc extends { value: infer T }
  ? Record<Prop, T>
  : Desc extends { get(): infer T }
  ? Record<Prop, T>
  : never;

// We defined the above types on the ObjectConstructor and now the error that was happening at storage.maxValue is gone! woot woot!

// !-----------------------------------!
// ! LESSON 50: Epilogue

// In this chapter Stefan provided links to resources that will help me continue learning Typescript and stay up to date with the latest features. I'm excited to continue building upon what I've learned so far and I'm looking forward to learning more about Typescript!

export {};
