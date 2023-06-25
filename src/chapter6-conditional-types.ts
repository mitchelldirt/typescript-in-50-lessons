// Premise for this lesson: We are going to look at an e-commerce application that sells physical audio media to collectors like CDs, vinyl, and cassettes.

// ! LESSON 36: If this, then that

type Customer = {
  CustomerId: number;
  firstName: string;
  lastName: string;
};

const customer = {
  CustomerId: 1,
  firstName: "John",
  lastName: "Doe",
};

type Product = {
  productId: number;
  title: string;
  price: number;
};

const product = {
  productId: 22,
  title: "Greatest Hits",
  price: 19.99,
};

type Order = {
  orderId: number;
  customer: Customer;
  products: Product[];
  date: Date;
};

// After creating this simplified start for an E-Commerce store we want to provide a function called "fetchOrder".

// If a customer is provided we want to return a list of orders from that customer.

// If a product is provided we want to return a list of orders that contain that product.

// If an orderId is provided we want to return a single order.

// ? Our first thought for implementing this may be to use function overloads.

declare function fetchOrder(customer: Customer): Order[];
declare function fetchOrder(product: Product): Order[];
declare function fetchOrder(orderId: number): Order;

// This is a good start, but with just 3 different overloads we already have 7 different combinations of arguments that we need to handle.

// We can use conditional types to simplify this.

// Here is an example of how that might look. It's essential a ternary operator for types.
// @ts-expect-error
type Conditional<T> = T extends U ? A : B;

// First let's create a union of all the different types that we want to handle as parameters.
type FetchParams = Customer | Product | number;

// Now we can use a conditional type to determine what the return type should be based on the type of the parameter.

type FetchReturn<Param extends FetchParams> = Param extends Customer
  ? Order[]
  : Param extends Product
  ? Order[]
  : Order;

// In Typescript jargon you would say the conditional type resolves to Order[] if the parameter is a Customer or Product, otherwise it resolves to Order.

function fetchOrder2<Param extends FetchParams>(
  param: Param
  // @ts-expect-error
): FetchReturn<Param> {
  // Implementation would go here
}

fetchOrder2(customer); // Order[]
fetchOrder2(product); // Order[]
fetchOrder2(1); // Order

let x: unknown;

// Throws an error because unknown is not assignable to FetchParams
// @ts-expect-error
fetchOrder2(x); // Order

// !-----------------------------------!
// ! LESSON 37: Combining function overloads and conditional types

// Conditional types are great for simplifying function overloads. Sometimes you may want to combine the two. This is especially true when dealing with optional parameters.

// if we wanted to do two fetch order functions that are both asynchronous. One that takes input and returns a promise and another that takes input with a callback and returns void we'd be better off using function overloads.
type Callback<Res> = (result: Res) => void;

declare function asyncFetchOrder<Param extends FetchParams>(
  param: Param
): Promise<FetchReturn<Param>>;

declare function asyncFetchOrder<Param extends FetchParams>(
  param: Param,
  func: Callback<FetchReturn<Param>>
): void;

// We can also use the rest parameter syntax to allow for multiple parameters.
declare function asyncFetchOrder<Param extends FetchParams>(
  ...params: [param: Param, func?: Callback<FetchReturn<Param>>]
): void;

declare function asyncFetchOrder<Param extends FetchParams>(
  ...params: [param: Param]
): Promise<FetchReturn<Param>>;

// We could create some helper types so that we don't need to do function overloads like the above example.

type FetchCb<T extends FetchParams> = Callback<FetchReturn<T>>;

type AsyncResult<FHead, Par extends FetchParams> = FHead extends [
  Par,
  FetchCb<Par>
]
  ? void
  : FHead extends [Par]
  ? Promise<FetchReturn<Par>>
  : never;

// This is incredibly flexible. We can now use any combination of parameters and get the correct return type. It sacrafices big time on readability though.
declare function asyncFetchOrder2<Param extends FetchParams, FHead>(
  ...args: [FHead]
): AsyncResult<FHead, Param>;

// if your input types rely on a union and you need to select a respective return type based on that input then conditional types are the way to go.

// If the function shape is totally different i.e. optional parameters, relationship between input args are different, and the return type is easy to follow then function overloads might be a better choice.
// !-----------------------------------!
// ! LESSON 38: Distributive conditionals

// Let's dwell more on these types

type FetchParams2 = Customer | Product | number;

// This conditional type translates to
/*
RETURN: A type representing what a function should return based on its input.

PARAM: Is one of the types in the union of FetchParams2

IF PARAM is a Customer then RETURN Order[]

IF PARAM is a Product then RETURN Order[]

IF PARAM is a number then RETURN Order  
*/
type FetchReturn2<Param extends FetchParams2> = Param extends Customer
  ? Order[]
  : Param extends Product
  ? Order[]
  : Order;

// Conditional typing gets a little different when we use unions. Let's look at a different example.

// ! This will actually run as a union of conditional types and return a union of the possible results. It won't return duplicate types or those that could never be returned.
type FetchByProductOrId = FetchReturn2<Product | number>;

// Here's an example of what that would look like.

type FetchByProductOrId2 =
  | (Product extends Customer
      ? Order[]
      : Product extends Product
      ? Order[]
      : Order)
  | (number extends Customer
      ? Order[]
      : number extends Product
      ? Order[]
      : Order);

// Naked types are defined as types that are not wrapped in any other type, including tuples, arrays, and conditional types. An example of a naked type is Order, while [number] is not a naked type because it is wrapped in an array type

// Non-naked types can have side effects especially when used in a conditional type. Let's look at an example.

type FetchReturn3<Param extends FetchParams2> = [Param] extends [Customer]
  ? Order[]
  : [Param] extends [Product]
  ? Order[]
  : Order;

// This is valid
type FetchByCustomer = FetchReturn3<Customer>;

// This is not valid
type FetchByCustomerOrId = FetchReturn3<Customer | number>;
// When it checks if [Customer | number] extends [Customer] it will return false because [Customer | number] is not a naked type. It is wrapped in a union type. This means that the conditional type will resolve to Order.

// A way to fix this behavior is by providing a base case for the conditional type.
// This is valid now because the above type that failed before will now resolve to never
type FetchReturn4<Param extends FetchParams2> = [Param] extends [Customer]
  ? Order[]
  : [Param] extends [Product]
  ? Order[]
  : [Param] extends [number]
  ? Order
  : never;

// !-----------------------------------!
// ! LESSON 39: Filtering with never

// Filtering with never can be incredibly useful. We want to create the types model of our application such that types don't need to be actively maintained and can rely upon the base types model.

// Now we want to create different mediums of music for our e commerce store
type Medium = {
  id: number;
  title: string;
  artist: string;
};

type TrackInfo = {
  duration: number;
  tracks: number;
};

type CD = Medium &
  TrackInfo & {
    kind: "cd";
  };

type Vinyl = Medium & {
  a: TrackInfo;
  b: TrackInfo;
} & {
  kind: "vinyl";
};

type AllMedia = CD | Vinyl;
type MediaKinds = AllMedia["kind"]; // 'cd' | 'vinyl'

// Now that we have our base types we can create a function called createMedium which has 2 parameters:

// 1. Takes a medium kind

// 2. Takes the remaining information needed

// Then it returns the newly created medium
// the info parameter and the return type need to be improved upon
declare function createMedium<Kind extends MediaKinds>(
  kind: Kind,
  // @ts-expect-error
  info
): AllMedia;

// Now let's focus on the output
type SelectBranch<Branch, Kind> = Branch extends { kind: Kind }
  ? Branch
  : never;

// The return type for this function is a conditional type. If the Branch type extends the kind then it will return the Branch type. Otherwise it will return never.
type SelectCD = SelectBranch<AllMedia, "cd">;

// Now the return type is any type that extends the kind or never
declare function createMedium<Kind extends MediaKinds>(
  kind: Kind,
  // @ts-expect-error
  info
): SelectBranch<AllMedia, Kind>;

// Another way to handle that would be to use the Extract utility type
// The extract utility type will extract all types from a union that are assignable to the provided type
declare function createMedium<Kind extends MediaKinds>(
  kind: Kind,
  // @ts-expect-error
  info
): Extract<AllMedia, { kind: Kind }>;

// !-----------------------------------!
// ! LESSON 40: Composing helper types

// We want to focus on adding the missing information. We're trying to add everything that's necessary to create the medium. we don't need id or kind as id is generated and kind is something we will have already defined.

// Here's examples of what those types would look like
type CDInfo = {
  title: string;
  description: string;
  tracks: number;
  duration: number;
};

type LPInfo = {
  title: string;
  description: string;
  sides: {
    a: {
      tracks: number;
      duration: number;
    };
    b: {
      tracks: number;
      duration: number;
    };
  };
};

// ? What if we don't want to maintain those types??
// Let's figure out which keys we don't need

type Removable = "id" | "kind";

// Now we need to filter out those properties from the type
// This reads as if A is in B remove it otherwise returns A. It basically will loop over type B until it either removes or adds each property
type Remove<A, B> = A extends B ? never : A;

type CDKeys = keyof CD;

// This is removing types from CDKeys that are in Removable
type BetterCDKeys = Remove<CDKeys, Removable>;

// This is the built in TypeScript way of accomplishing that
type EvenBetterCDKeys = Exclude<CDKeys, "kind" | "id">;

// Now we need a type that represents those keys
// This Picks out only those properties of CD which aren't kind and id then makes a type out of them
type NewCDInfo = Pick<CD, Exclude<keyof CD, "kind" | "id">>;

// ! But wait! There's a better, cleaner, more typescript way to do the above... the Omit utility type
type BetterNewCDInfo = Omit<CD, "id" | "kind">;

// The last thing we need to do is compose everything into a createMedium function
// To do that we need to pass the selected branch (vinyl or cd) to Omit

type GetInfo<Med> = Omit<Med, Removable>;

declare function createMedium<Kind extends MediaKinds>(
  kind: Kind,
  info: GetInfo<SelectBranch<AllMedia, Kind>>
): SelectBranch<AllMedia, Kind>;

// !-----------------------------------!
// ! LESSON 41: The infer keyword

let userId = 0;

// @ts-ignore
function createUser(names, roles) {
  return {
    id: userId++,
    names,
    roles,
  };
}

// The above simple. We have a function that takes names and roles and returns an object with an id, names, and roles. The id is incremented each time the function is called.

// The roles that we are to be divided between admin, maintenance, and shipping where admin has the most permissions and shipping has the least.

function createUser2(
  name: string,
  role: "admin" | "maintenance" | "shipping",
  isActive: boolean
) {
  return {
    id: userId++,
    name,
    role,
    isActive,
    createdAt: new Date(),
  };
}

// The type of user should be the return type of the function createUser2

type GetReturn<Fun> = Fun extends (...args: any[]) => any ? Fun : never;

// Another way to accomplish the above is by using the infer keyword

type GetReturn2<Fun> = Fun extends (...args: any[]) => infer Return
  ? Return
  : never;

// Helper types are great when we care more about the behavior of the type than the type itself.

type Unpack<T> = T extends Promise<infer Result> ? Result : T;

type A = Unpack<Promise<string>>; // string

// !-----------------------------------!
// ! LESSON 42: Working with null

// We learned that null and undefined are subtypes of all other types. By setting strictNullChecks to true we can prevent null and undefined from being assignable to other types.

// Sometimes have one of these bottom types is inevitable.

declare function fetchOrderList(input: Customer | Product): Promise<Order[]>;

// The function above is flawed because if we use fetch then the return type will actually be any. We can let typescript know that there's the possibility of null by using the union type.

// This is much safer because it forces us to check if the incoming data is null or not.
declare function fetchOrderList2(
  input: Customer | Product
): Promise<Order[] | null>;

// To handle null we have two options. The first of which being what we just did above

declare function listOrders(orders: Order[] | null): void;

// We have to check if the value is null in the above function, but we could also handle this issue by making sure that null can't be passed in the first place.

declare function listOrders(orders: Order[]): void;

declare function isAvailable<Obj>(obj: Obj): obj is NonNullable<Obj>;

// The NonNullable utility type in TypeScript translates to

// IF type T is null OR undefined then return never ELSE return T

type NonNullable2<T> = T extends null | undefined ? never : T;

// Here is a better implementation of isAvailable that returns a boolean

function isAvailable2<Obj>(obj: Obj): obj is NonNullable<Obj> {
  return obj !== null && obj !== undefined;
}

// ! RECAP

// Conditional types are great to use to make connections between input types and outputs types

// Using function overloading and conditional typing can help keep our application more readable

// A conditional type of union types is like a union type of conditional types

// We can filter with the never type which makes our unions safer and more explicit

// We can use helper function like Pick, Extract, and Omit to make our types more readable

// We learned about the infer keyword which allows us to extract types from other types

// We learned how to work with null return types and use the NonNullable utility type in a type predicate
