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
