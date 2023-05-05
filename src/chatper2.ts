// One way to help guard against type errors is default values.

function add(a: any, b: number = 0) {
  // could return NaN if a is not a number
  return a + b
}

function betterAdd(a: number, b: number = 0) {
  // a and b will have type number, b has a default value of 0
  return a + b
}

// Left-hand typing is being *explicit* by specifying the type of the variable.
const myNum: number = 5

// Right-hand typing is being *implicit* by not specifying the type of the variable.
const myOtherNum = 5

// Any should be used sparingly, here is an example of an any variable and how you can call any method on it.
let myAny: any = 'hello'
myAny.wow() // no error

// this is an example of type narrowing
function myFunction(myParam: any) {
  if (typeof myParam === 'string') {
    myParam.toUpperCase() // no error because typescript knows it is a string
  } else {
    myParam.toFixed() // no error because myParam is of type any
  }
}

// super types and sub types
// a super type is a "parent" type, a sub type is a "child" type
// any is a super type of all types
// HTMLDivElement is a sub type of HTMLElement

// unknown is a super type of all types and a better alternative to any
function myFunction2(myParam: unknown) {
  if (typeof myParam === 'string') {
    myParam.toUpperCase() // no error because typescript knows it is a string
  } else {
    //@ts-expect-error
    myParam.toFixed() // error on this line because myParam is of type unknown and therefore cannot call toFixed()
  }
}