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

// the pick utility type allows you to grab certain properties from a type
type HDVideo = Pick<videoFormatUrls, "format1080p" | "format720p">;

// A record type can specify a key and a value type. Earlier we used a record type to specify that the key type was a string and the value type was a URL. This is a much cleaner way to do that.

// ! OLD WAY
type URLList2 = {
  [k: string]: URL;
};

// ! NEW WAY
type URLObject = Record<string, URL>;

const urlObject: URLObject = {
  format360p: new URL("https://www.example.com/360p"),
  format480p: new URL("https://www.example.com/480p"),
  format720p: new URL("https://www.example.com/720p"),
  format1080p: new URL("https://www.example.com/1080p"),
};

// What if we only wanted to require at least one of the formats to be available?
// We could define each format as a type and then use a union type to combine them
type format360p = {
  format360p: URL;
};

type format480p = {
  format480p: URL;
};

type format720p = {
  format720p: URL;
};

type format1080p = {
  format1080p: URL;
};

type videoFormats = format360p | format480p | format720p | format1080p;

// WOW THOUGH, that's a lot of code and maintaining that would be a nightmare
// Instead let's use a mapped type to create the same thing
// THis creates a union type of all the keys in the videoFormatUrls type as value types
type split = keyof videoFormatUrls;

// If we wanted a type which uses the key as the value type, we can use a mapped type
type split2 = {
  [K in keyof videoFormatUrls]: K;
};

// The above is the same as the below
type split3 = {
  format360p: "format360p";
  format480p: "format480p";
  format720p: "format720p";
  format1080p: "format1080p";
};

// If we wanted to get the property types in a union instead of the property names / keys, we can use the following
// We're creating the mapped type which is the same as the split2 type above, but then we're accessing the values like you would in an object/array
type split4 = {
  [K in keyof videoFormatUrls]: K;
}[keyof videoFormatUrls];

// This gives us a union type of Records where the key is the key and the value is that keys value. You can hover over the recordSplit type to see the type definition
type recordSplit = {
  [K in keyof videoFormatUrls]: Record<K, videoFormatUrls[K]>;
}[keyof videoFormatUrls];

// Now let's build a generic out of it
type Split<Obj> = {
  [Prop in keyof Obj]: Record<Prop, Obj[Prop]>;
}[keyof Obj];

// Now we can use the Split generic to create a union type of all the keys in the videoFormatUrls type as value types
// ? Why is this useful?
// Whenever we update the videoFormatUrls type, the Split generic will automatically update to reflect the changes
type videoFormats2 = Split<videoFormatUrls>;
// !-----------------------------------!
// ! LESSON 33: Mapped Type Modifiers

// Once the user is signed in they can set their preferences for videos
// keyof is used to prevent manual maintenance and theme uses a union of value types "dark" and "light" to prevent typos
type UserPreferences = {
  format: keyof videoFormatUrls;
  subtitles: {
    active: boolean;
    language: keyof subtitles;
  };
  theme: "dark" | "light";
};

// Usually we would want to infer the type, but with defaults we want to be explicit and take the time to maintain them
const defaultUserPreferences: Readonly<UserPreferences> = {
  format: "format360p",
  subtitles: {
    active: false,
    language: "english",
  },
  theme: "dark",
};

// ! Can't do this because it's readonly
// @ts-expect-error
defaultUserPreferences.format = "format720p";

// We can create a function that overwrites the default preferences with the user preferences

// We use the Partial utility type to make all the properties optional since we don't know which ones the user will set. The Required utility type does the opposite and makes all the properties required
function mergePreferences(
  defaultPreferences: UserPreferences,
  userPreferences: Partial<UserPreferences>
) {
  return {
    ...defaultPreferences,
    ...userPreferences,
  };
}

// Readonly can be used to make all the properties readonly; however, it doesn't mean you can't make modifications in javascript. To prevent this, we can use Object.freeze
function genDefaults(obj: UserPreferences) {
  return Object.freeze(obj);
}

// I typed this as Readonly, but it's not necessary because genDefaults returns a frozen object which is readonly. Try hovering over the defaultUserPreferences2 variable to see the type
const defaultUserPreferences2 = genDefaults({
  format: "format360p",
  subtitles: {
    active: false,
    language: "english",
  },
  theme: "dark",
});

mergePreferences(defaultUserPreferences2, {
  // ! The below returns an error because the subtitles property is not optional, the whole object must be passed in. This is because we used the standard Partial utility type
  // @ts-expect-error
  subtitles: {
    language: "german",
  },
});

// Below we see how to use readonly and partial on nested objects
type DeepReadonly<Obj> = {
  readonly [Key in keyof Obj]: DeepReadonly<Obj[Key]>;
};

function genDefaults2(obj: UserPreferences): DeepReadonly<UserPreferences> {
  return Object.freeze(obj);
}

const defaultUserPreferences3 = genDefaults2({
  format: "format360p",
  subtitles: {
    active: false,
    language: "english",
  },
  theme: "dark",
});

// Now we can't modify the properties within the nested property active or language because they are readonly
// @ts-ignore
defaultUserPreferences3.subtitles.active = true;

// The same as the above, but with the partial utility type
type DeepPartial<Obj> = {
  [Key in keyof Obj]?: DeepPartial<Obj[Key]>;
};

// We can also modify our mergePreferences function to use the DeepPartial utility type
function mergePreferences2(
  defaultPreferences: UserPreferences,
  userPreferences: DeepPartial<UserPreferences>
) {
  return {
    ...defaultPreferences,
    ...userPreferences,
  };
}

// Huzzah! No errors!
mergePreferences2(defaultUserPreferences3, {
  subtitles: {
    language: "german",
  },
});

// !-----------------------------------!
// ! LESSON 34: Binding Generics

// In this chapter we're exploring type annotations, type inference, and generic type binding

// This works great :)
mergePreferences2(defaultUserPreferences3, {
  format: "format720p",
  theme: "light",
});

const newPreferences = {
  format: "format720p",
  theme: "dark",
};

// ? WHAT? Why doesn't this work? It's the same as the above
// Well without explicitly typing the newPreferences variable, typescript infers the type as the properties as type string. This is because typescript infers the type of the object as the most general type possible
// @ts-expect-error
mergePreferences2(defaultUserPreferences3, newPreferences);

const newPreferences2 = {
  format: "format720p",
  theme: "dark",
} as const;

// This works because the as const keyword prevents the variable from being modified before it's passed into the function. Typescript KNOWS that the properties are of type "format720p" and "dark"
mergePreferences2(defaultUserPreferences3, newPreferences2);

// ! This would also work, and in my opinion is the best way to do it
const newPreferences3: Partial<UserPreferences> = {
  format: "format720p",
  theme: "dark",
};

// The process of substituting a concrete type for a generic type is called binding

function combinePreferences<UserPref extends Partial<UserPreferences>>(
  defaultPreferences: UserPreferences,
  userPreferences: UserPref
) {
  return {
    defaultP: defaultPreferences,
    userP: userPreferences,
  };
}

// The above creates an intersection type of the defaultPreferences and userPreferences types where "format720p" and "dark" are value types that override the default types
// ! Be careful though, if you make the defaultPreferences readonly, the resulting type of an intersection of readonly and value types will be never - therefore theme and format would be unusable

// !-----------------------------------!
// ! LESSON 35: Generic Type Defaults

// In the last chapter we used a "video" element to demonstrate how to use generics. In real life we might have a class that abstracts away the video element and provides a more robust api that's easier for our coworkers to use

// The behavior of our class should be as follows
// 1. We can instantiate as many instances of the class as we want and pass our user preferences to each instance

// 2. We can attach any HTML elements to the class. If it's a video element, we can immediately start playing the video, otherwise we use it as a wrapper for the video element. (video elements are the default)

// 3. The element is not required for instantiation, it can be left as undefined and loaded in later

// This class helps make a property optional
type Nullable<G> = G | null;

class Container {
  #element?: Nullable<HTMLElement>;
  #prefs: UserPreferences;

  constructor(prefs: UserPreferences) {
    this.#prefs = prefs;
  }

  set element(value: Nullable<HTMLElement>) {
    this.#element = value;
  }

  get element(): Nullable<HTMLElement> {
    return this.#element ?? null;
  }

  loadVideo(formats: videoFormatUrls) {
    const selectedFormat = formats[this.#prefs.format].href;

    if (this.#element instanceof HTMLVideoElement) {
      this.#element.src = selectedFormat;
    } else if (this.#element) {
      const video = document.createElement("video");
      this.#element.appendChild(video);
      video.src = selectedFormat;
    } else {
      throw new Error("No element provided");
    }
  }
}

const container = new Container(defaultUserPreferences3);
container.element = document.createElement("video");
container.loadVideo(videos);

// For some the HTMLElement type is too general, so we can use a generic type to make it more specific

// By providing the default = HTMLVideoElement, we can instantiate the class without passing in a generic type
class Container2<GElement extends HTMLElement = HTMLVideoElement> {
  #element?: Nullable<GElement>;
  #prefs: UserPreferences;

  constructor(prefs: UserPreferences) {
    this.#prefs = prefs;
  }

  set element(value: Nullable<GElement>) {
    this.#element = value;
  }

  get element(): Nullable<GElement> {
    return this.#element ?? null;
  }
}

// If you hover container2 you'll see that the generic type is HTMLVideoElement
const container2 = new Container2(defaultUserPreferences3);

// Here we declare a new function to create a video. We can use the generic type to make the return type more specific
declare function createVideo<GElement extends HTMLElement = HTMLVideoElement>(
  prefs: UserPreferences,
  formats: videoFormatUrls,
  element?: GElement
): HTMLVideoElement;

// Be careful with providing default types though, because it can lead to unexpected behavior. If you wanted to pass in HTMLAudioElement, you'd get an HTMLVideoElement as the return type

const a = createVideo<HTMLAudioElement>(defaultUserPreferences3, videos);

// ! WORDS OF WISDOM FROM STEFAN BAUMGARTNER ABOUT NAMING GENERIC TYPES
// Uppercase words and no single letters i.e. T U V W X Y Z

// Abbreviate, but keep it readable Obj > Object > O

// Use prefixes where applicable i.e. URLObj = URL Object or GElement = Generic Element

// If we have a URLObj then the keys could be of type UKey

// Readability > Conciseness
export {};
