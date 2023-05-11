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

// Typescript adhers to a structural contract, not a nominal contract'

// This means if when assigning an object to a type after instantiation, the object must have the same properties as the type, but can also contain addtional properties.

// If you specify the type during instantiation then the object must have the same properties as the type and cannot contain additional properties. This is referred to as the excess property check.

// This is an example of a structural contract
type Person = {
  name: string
  age: number
}

// This would throw an error because the object has an additional property
const person: Person = {
  name: 'Todd',
  age: 27,
  // @ts-expect-error
  height: 6,
}

const bob = {
  name: 'Bob',
  age: 27,
  height: 6,
}

const awesomePerson: Person = bob // no error because bob has the same properties as Person and fulfills the structural contract

// The same rules apply to functions
function myFunc(Person: { name: string }): string {
  return Person.name;
}

// This would throw an error because the object has an additional property
myFunc({
  name: 'Todd',
  // @ts-expect-error
  age: 27,
})

// This wouldn't though because my man bob fulfills the structural contract
myFunc(bob);

// Sometimes you have deeply nested objects and you need to create a type or types for it. You can do this with one large type or you can break it up into smaller types.

// This is an example of a large type
type order = {
  article: {
    id: number
    name: string
    price: number
  },
  customer: {
    id: number
    name: string
    address: string
  },
  items: {
    id: number
    name: string
    price: number
  }[]
};

// This is an example of smaller types
type article = {
  id: number
  name: string
  price: number
}

type customer = {
  id: number
  name: string
  address: string
}

type items = {
  id: number
  name: string
  price: number
}[]

// Here's how you can take an object and make it a type
const myOrder = {
  article: {
    id: 1,
    name: 'My Article',
    price: 10,
  },
  customer: {
    id: 1,
    name: 'Todd',
    address: '123 Main St',
  },
  items: [
    {
      id: 1,
      name: 'My Article',
      price: 10,
    },
  ],
}

type myOrderType = typeof myOrder;

// You can also have optional properties on an object
// In the below type - article is optional :)
type myOptionalOrder = {
  article?: {
    id: number
    name: string
    price: number
  },
  customer: {
    id: number
    name: string
    address: string
  },
  items: {
    id: number
    name: string
    price: number
  }[]
};

// Classes in Javascript can actually be used as types in Typescript
// Since I've given each property of dog a type, I can use it as a type anywhere in my code
class Dog {
  breed: string
  age: number
  weight: number

  constructor(breed: string, age: number, weight: number) {
    this.breed = breed
    this.age = age
    this.weight = weight
  }

  barkAtPerson(person: Person) {
    console.log(`WOOF @ ${person.name}`)
  }
}

// Classes contain two parts, the constructor and the prototype
// The constructor is the part that is called when you instantiate a class
// The prototype is the part that contains all the methods and properties of the class

// You can technically apply an object that fulfills the structural contract to the type generate by a class

// Below is an example using the dog class. It doesn't throw an error because the object fulfills the structural contract, but it's not a true instance of the class. This doesn't really make sense to do, but it's permissable.
const myDog: Dog = {
  breed: 'Lab',
  age: 5,
  weight: 60,
  barkAtPerson(person: Person) {
    console.log(`WOOF @ ${person.name}`)
  }
}

// We can also extend the dog class and the as long as the shape stays the same, and their types are totally interchangeable
class LoudDog extends Dog {
  barkAtPerson(person: Person) {
    console.log(`WOOF WOOF WOOF @ ${person.name}`)
  }
}

// but if you add more properties to the class, then it's no longer interchangeable and follows the same rules as objects
class QuietDog extends Dog {
  isQuiet: boolean

  constructor(breed: string, age: number, weight: number, isQuiet: boolean) {
    super(breed, age, weight)
    this.isQuiet = isQuiet
  }


}

// @ts-expect-error
const myQuietDog: QuietDog = {
  breed: 'Lab',
  age: 5,
  weight: 60,
  // There should be a property called isQuiet here, but there isn't
  barkAtPerson(person: Person) {
    console.log(`WOOF @ ${person.name}`)
  }
}

// Interfaces are just slightly different syntactically than types

// This is an example of an interface
interface DogInterface {
  breed: string
  age: number
  weight: number
}

// You can create a class and implement an interface or a type
class Dog2 implements DogInterface {
  breed: string
  age: number
  weight: number

  constructor(breed: string, age: number, weight: number) {
    this.breed = breed
    this.age = age
    this.weight = weight
  }
}

// Interfaces are useful for declaration merging, a great example of that is the global window object

// This is an example of declaration merging

// There is an error because we aren't in a ambient declaration file or a module
//@ts-expect-error
declare global {
  interface Window {
    isDevelopment: boolean
  }
}

// Now `isDevelopment` is a property on the window object and available globally

