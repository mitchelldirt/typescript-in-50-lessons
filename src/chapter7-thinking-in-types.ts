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
