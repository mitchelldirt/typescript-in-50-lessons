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

// !-----------------------------------!
// ! LESSON 38: Distributive conditionals

// !-----------------------------------!
// ! LESSON 39: Filtering with never

// !-----------------------------------!
// ! LESSON 40: Composing helper types

// !-----------------------------------!
// ! LESSON 41: The infer keyword

// !-----------------------------------!
// ! LESSON 42: Working with null
