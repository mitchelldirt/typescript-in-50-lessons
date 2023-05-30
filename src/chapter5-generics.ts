// ! LESSON 29: I don't know what I want, but I know how to get it

// ! The premise for this chapter is that we are building a video player portal that features video streams of differing quality, subtitles in different languages, and user centric features.

type videoFormatUrls = {
  format360p: URL;
  format480p: URL;
  format720p: URL;
  format1080p: URL;
};

// We want to provide a function that can format URLs in different ways

declare const videos: videoFormatUrls;
declare function loadFormat(format: string): void;

// to ensure that the format is one of the keys of the videoFormatUrls type, we can use a type predicate
// This looks more complicated than a union type, but it is more flexible. If you added 4K video to the videoFormatUrls type, you would not need to update the isFormatAvailable function.
function isFormatAvailable(
  obj: videoFormatUrls,
  key: string
): key is keyof videoFormatUrls {
  return key in obj;
}

// Now we have a similar situation, but for subtitles
type subtitles = {
  english: URL;
  german: URL;
  dutch: URL;
  french: URL;
};

function subtitlesAvailable(
  obj: subtitles,
  key: string
): key is keyof subtitles {
  return key in obj;
}

// The above is repetitive, so we can use a generic type to make it more flexible
// First let's look at how we would solve the above using just javascript
// You would just pass in the object and the key you want to check and return key in obj
// In typescript we can use a generic type to make this more flexible
// Note that key could be a string, number, or symbol, so we need to use a union type and that Formats extends object because we want to ensure that Formats is an object, otherwise we get an error.
// ! The extends keyword is used to constrain the generic type to a specific type otherwise it would be too flexible
function isAvailable<Formats extends object>(
  obj: Formats,
  key: string | number | symbol
): key is keyof Formats {
  return key in obj;
}

// Notice how we can now use the same function for both videos and subtitles
// Also, the type of the object is inferred by the type of the first argument passed to the function
if (isAvailable<videoFormatUrls>(videos, "format360p")) {
  loadFormat("format360p");
}

// I've already seen generics before in other code that I've read

// This returns a promise with a generic type of number
async function randomNumber() {
  return Math.random();
}

// You can also instantiate an array with a generic type
let notGenericArray: number[] = [];

let genericArray: Array<number>;

// The above use case for generics may not look very useful, but when you have an array that utilizes multiple types, using a generic with a union type can be very useful

let genericUnionArray: Array<number | string | boolean>;

// !-----------------------------------!
// ! LESSON 30: Generic Constraints

// The below type specifies an object that contains
// strings as keys that return
// URLs as values
type URLList = {
  [k: string]: URL;
};

// * Notice how we extend URLList instead of object because we want to ensure that the generic type is an object that contains strings as keys and URLs as values. This a great example of how to use generic constraints.
function loadFile<Formats extends URLList>(
  fileFormats: Formats,
  format: string
) {
  if (isAvailable(fileFormats, format)) {
    loadFormat(format);
  }
}

// !-----------------------------------!
// ! LESSON 31: Working with keys

// ? What's the downside of the above URLList type?
// You can pass in a string that doesn't correlate to an actual format such as "format9999p"

// First we can bring back our old friend keyof
function loadFile2<Formats extends URLList>(
  fileFormats: Formats,
  format: keyof Formats
) {
  if (isAvailable(fileFormats, format) && typeof format === "string") {
    loadFormat(format);
  }
}

// Now we can't pass in a string that doesn't correlate to an actual format
// @ts-expect-error
loadFile2(videos, "format9999p");

// Here is an actual example of a loadFile implementation
async function loadFile3<Formats extends URLList>(
  fileFormats: Formats,
  format: keyof Formats
) {
  const res = await fetch(fileFormats[format].href);
  return {
    format,
    loaded: res.status === 200,
  };
}

const result = await loadFile3(videos, "format360p");

if (result.format !== "format360p") {
  throw new Error("Unexpected format");
}

// To make sure we're implementing the right format, we defined a return type of the format key

type Loaded<key> = {
  format: key;
  loaded: boolean;
};

// Now we can use the Loaded type to define the return type of the loadFile function
// We also create a generic type for the key of the format
async function loadFile4<Formats extends URLList, Key extends keyof Formats>(
  fileFormats: Formats,
  format: Key
): Promise<Loaded<Key>> {
  const res = await fetch(fileFormats[format].href);
  return {
    format,
    loaded: res.status === 200,
  };
}

// Now we see the return type of data is Loaded<"format360p">
const data = await loadFile4(videos, "format360p");

// !-----------------------------------!
// ! LESSON 32: Generic Mapped Types

// !-----------------------------------!
// ! LESSON 33: Mapped Type Modifiers

// !-----------------------------------!
// ! LESSON 34: Binding Generics

// !-----------------------------------!
// ! LESSON 35: Generic Type Defaults

export {};
