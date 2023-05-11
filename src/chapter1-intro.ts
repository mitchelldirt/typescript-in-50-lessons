// Starting on lesson 3 because the first two were more introductory

// Lesson 3: Types

// Primitive types
let string = "Hello world"; 
let number = 3.14;
let boolean = true; 

// Composite data types
let array = [1, 2, 3];
let object = { name: "John", age: 30 };
function func(): string { return "Hello world"; }

// Javascript is weakly typed while Typescript is strongly typed.

// Primitive types are straightforward and have a set amount of values where composite types have a range of values that are allowed and are therefore much more complex.

// If you hover isDevelopment, you'll see that it's type is boolean. This is because we've declared it as a boolean in ambient.d.ts.
console.log(isDevelopment);

// We can run tsc --noEmit to check for errors without compiling the code.