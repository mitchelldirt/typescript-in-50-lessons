// ! The below is an example of typing functions by "implementing" a typical website search bar that returns a list of results.

// This is the type we expect to receive from the backend. This is a helper type :)
type Result = {
  title: string;
  url: string;
  abstract: string;
};

// Iteration 1:
// Takes a query and x amount of tags and returns a list of results from the backend.
// ! Issues:
// ! What if we don't have any tags? We need to make tags optional.
// ! This is a synchronous function. Most calls to a backend will be asynchronous. We need to make this function asynchronous.
declare function search(query: string, tags: string[]): Result[];

// Iteration 2:
// ! Issues:
// ! We still need to make this function asynchronous. Let's do that in iteration 3.
declare function search2(query: string, tags?: string[]): Result[];

// Iteration 3:
// * Now we've made the function asynchronous. We also provided a return type in the function head because the default return type for a fetch call is Promise<any>.
async function search3(query: string, tags?: string[]): Promise<Result[]> {
  // Build the query string
  let queryString = `?query=${query}`;

  // If we have tags, add them to the query string
  if (tags && tags.length) {
    queryString += `&tags=${tags.join(",")}`;
  }

  // Fetch the results and return them as JSON
  return fetch(`https://example.com/api/search${queryString}`).then((res) =>
    res.json()
  );
}

// We could can also use function types within objects
type Query = {
  query: string;
  tags?: string[];
  assemble: (includeTags: boolean) => string;
};

// Example of how we can use the Query type
// * This is different to the earlier implementation because we're using a function type within an object. You could argue this is more flexible because we can change the implementation of the function on the fly.
const myQuery: Query = {
  query: "Rock climbing",
  tags: ["outdoors", "fitness"],
  assemble(includeTags = true) {
    let queryString = `?query=${this.query}`;

    // If we have tags, add them to the query string
    if (includeTags && this.tags && this.tags.length) {
      queryString += `&tags=${this.tags.join(",")}`;
    }

    return queryString;
  },
};

// We can also predefine the function type
type assembleFn = (includeTags: boolean) => string;

// Then use it within the type definition
// * This is the same as the above example, but we're using the assembleFn type instead of defining the function type inline.
type Query2 = {
  query: string;
  tags?: string[];
  assemble: assembleFn;
};

// We might want multiple search functions with slightly different implementations, but they always take the same arguments and return the same type.

// i.e. query, tags, and return a promise of an array of results.

// We can you use a callback function to achieve this.

type searchFn = (
  query: string,
  tags?: string[] | undefined
) => Promise<Result[]>;

// For this example we'll select the element the user inputs the query into, call the search function, and then render the results to the page.

// The arguments for this function are:
// * The ID of the input element
// * The ID of the element to render the results to
// * The search function to call
// ! The return type is void since we don't plan on actually returning anything from this function. It will be used to interact with the DOM.

declare function displaySearch(
  inputId: string,
  outputId: string,
  search: searchFn
): void;

// We can use the previously defined search3 function as the search function for this example.
displaySearch("search-input", "search-results", search3);

// or create an anonymous function
displaySearch("search-input", "search-results", async (query, tags) => {
  // Build the query string
  let queryString = `?query=${query}`;

  // If we have tags, add them to the query string
  if (tags && tags.length) {
    queryString += `&tags=${tags.join(",")}`;
  }

  // Fetch the results and return them as JSON
  return fetch(`https://example.com/api/search${queryString}`).then((res) =>
    res.json()
  );
});

// Notice how you can use the searchFn type to define the search function without needing to include tags in the function definition.

// ! Also notice that I use the argument `term` instead of `query`. This is because the argument name doesn't matter. Only the type matters.
const testSearch: searchFn = async (term) => {
  return fetch(`https://example.com/api/search?query=${term}`).then((res) =>
    res.json()
  );
};

// * Typescript uses something called substitutability
// This means that you can have more or less arguments than the type definition and it will still work. If you try to use a variable that isn't defined in the type definition, you'll get an error.
// Typescript is a bit loose with this to allow for more flexibility like javascript.

// This won't work because we're calling the function with the searchFn type that expects at least 1 argument, but we're not passing any arguments.

// @ts-expect-error
testSearch();

// This is totally fine because the function doesn't call any variables that aren't currently being passed in.
const dummySearchFunction: searchFn = function () {
  return Promise.resolve([
    {
      title: "Rock climbing",
      url: "https://example.com/rock-climbing",
      abstract: "Rock climbing is a sport that involves climbing rocks.",
    },
  ]);
};

// ! This won't work because we typed the function as searchFn which again - expects at least 1 argument.

// @ts-expect-error
dummySearchFunction();

// * We can also use substitutability with function return types, but only for the return type void.
// This is because void is a special type that means the function doesn't return anything. It basically means undefined.

// Take the search function from above for example. We can remove the return type and instead include a call back that returns void.
function search4(
  query: string,
  tags?: string[],
  callback?: (results: Result[]) => void
) {
  // Build the query string
  let queryString = `?query=${query}`;

  // If we have tags, add them to the query string
  if (tags && tags.length) {
    queryString += `&tags=${tags.join(",")}`;
  }

  // Fetch the results and return them as JSON
  fetch(`https://example.com/api/search${queryString}`)
    .then((res) => res.json())
    .then((results) => {
      // If we have a callback, call it with the results
      if (callback) {
        callback(results);
      }
    });
}

// We can call this function with a callback that logs the results to the console.
search4("Rock climbing", ["outdoors", "fitness"], function (results) {
  console.log(results);
});

function searchHandler(results: Result[]) {
  console.log(results);
}

// We can also pass in a function that we've defined elsewhere. This is the same as the above example on using callbacks :)
search4("Rock climbing", ["outdoors", "fitness"], searchHandler);

// But we can also change the return type of the searchHandler to something like string and it will still work. This is because the return type is void, so it doesn't matter what we return. You won't be able to use the return value though because void means undefined.
function searchHandler2(results: Result[]): string {
  console.log(results);

  return "Hello world";
}

// This will still work because the return type is void.
search4("Rock climbing", ["outdoors", "fitness"], searchHandler2);

// ! You can't use that value in the search function though because it's void.
// Here's an example
function search5(
  query: string,
  tags?: string[],
  callback?: (results: Result[]) => void
) {
  // Build the query string
  let queryString = `?query=${query}`;

  // If we have tags, add them to the query string
  if (tags && tags.length) {
    queryString += `&tags=${tags.join(",")}`;
  }

  // Fetch the results and return them as JSON
  fetch(`https://example.com/api/search${queryString}`)
    .then((res) => res.json())
    .then((results) => {
      // If we have a callback, call it with the results
      if (callback) {
        let preBoldMove = "Hello world";
        const boldMove = callback(results);

        // ! This will throw an error because the return type is void, so we can't use the return value.

        // @ts-expect-error
        preBoldMove.concat(boldMove);
      }
    });
}

// If you want to avoid having a return type come into play at all then you can use the type `undefined` instead of `void`. Alternatively you could do this
// * .then(results => void callback(results))

// Next we'll look at how we can display the results of a search as we type our query

// ? What do we need to have to gather the query?
// A form with an input

// @ts-expect-error
```html
<form action="/search" method="POST">
  <label for="search-input">Search</label>
  <input type="text" id="search-input" name="search-input" />
  <button type="submit">Search</button>
</form>
<div id="search-results"></div>
```;

// Once we get a 'change' event fired off of the input we'll want to trigger our search function to be activated.

function displaySearch2(
  inputId: string,
  outputId: string,
  search: searchFn
): void {
  document.getElementById(inputId)?.addEventListener("change", function () {
    this.parentElement?.classList.add("active");

    // ! Notice how we need to check that the element IS an HTMLInputElement. That's because TypeScript will always
    // ! assume the lowest common denominator on types... in this case HTMLElement
    if (this instanceof HTMLInputElement) {
      const query = this.value;

      // TODO: The inner of this function will be covered later
      search(query).then();
    }
  });
}

// If we want to extract the call back function into its own function though
// ! We lose our ability to use `this` >:(

function inputChangeHandler() {
  // The below throws an error because `this` is not defined
  // @ts-expect-error
  this.parentElement?.classList.add("active");
}

// ? How do we use the `this` keyword then to access our HTMLElement on an event handler?
// ! With this!

function inputChangeHandler2(this: HTMLElement) {
  this.parentElement?.classList.add("active");
}

/* -------------------------------------------------- */
// Lesson 19: The Function Type Tool Belt

// ? I guess I'm going to start marking lesson start points?? It'll be more helpful now since I'm getting into things I don't know about haha

const term = "Remix";
const results = 15;

const searchResult = `You searched for ${term} and received ${results} results!`;

// The above is a template literal and they're so much better than how string concatenation used to be handled in Javascript

// ? Say we need a highlight tag that allows us to replace parts of text with highlighting. We could do something like the below

// We want to replace @@starthl@@text@@endhl@@ with the HTML <mark> element

const resultItem = {
  title: "A guide to how awesome @@starthl@@Remix@@endhl@@ is!",
  url: "https://remix.run",
  description: "The React framework @@starthl@@Remix@@endhl@@ in a nutshell",
};

// To do that we can create a `tag`. Below will be the function we'll use for the tag

function highlight(strings: TemplateStringsArray, ...values: string[]) {
  let resultStr = "";

  strings.forEach((templ, i) => {
    // fetch the expression from the same position
    // or assign an empty string
    let expr =
      values[i].replace("@@starthl@@", "<em>").replace("@@endhl@@", "</em>") ??
      "";

    resultStr += templ + expr;
  });

  return resultStr;
}

// Now anywhere the highlight tags show up we can replace it :)
function createResultsTemplate(results: Result[]): string {
  return `<ul>
  ${results.map((result) => highlight`<li>${result.title}</li>`)}
`;
}

// The ... syntax is called 'Rest parameters' it basically says that it could be an infinite amount of whatever is being called
// For example in our search function we could use ...tags to include tags of length 0 to ??? a lot I guess

declare function search6(term: string, ...tags: string[]): Promise<Result>;

search6(
  "Search term",
  "so",
  "many",
  "tags",
  "because",
  "of",
  "rest",
  "parameters",
  ":)"
);

// The below function will automatically be of return type Promise<string> because it's an async function
async function sendMessage() {
  return "HELLO!?!";
}

/* -------------------------------------------------- */
// Lesson 20: Function Overloading
