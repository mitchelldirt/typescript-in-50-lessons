// ! LESSON 22: Modeling Data

/*

* Background for this entire chapter:

The idea is that we'll be building a website that lists different kinds of tech events like conferences, meetups, and webinars.

Tech Conferences: Meet at a location, listen to talks, pay for a ticket

Meetups: Meet at a location, listen to / partake in talks, free

Webinars: Need a URL, only one talk, free OR paid

All tech events have common properties:
- Date
- Description
- Max number of attendees
- RSVP Count
- Kind of event (conference, meetup, webinar)
*/

// All events share a "Talk"

type Talk = {
  title: string;
  abstract: string;
  speaker: string;
};

type ConferenceDraft = {
  description: string;
  date: Date;
  capacity: number;
  rsvp: number;
  kind: string;
  location: string;
  price: number;
  talks: Talk[];
};

type MeetupDraft = {
  title: string;
  description: string;
  date: Date;
  capacity: number;
  rsvp: number;
  kind: string;
  location: string;
  price: string;
  talks: Talk[];
};

type WebinarDraft = {
  title: string;
  description: string;
  date: Date;
  capacity: number;
  RSVP: number;
  kind: string;
  url: string;
  price?: number;
  talks: Talk;
};

// You'll notice above that a lot of these types share multiple properties. We're going to create a TechEventBase type to hold those common properties

type TechEventBase = {
  title: string;
  description: string;
  date: Date;
  capacity: number;
  rsvp: number;
  kind: string;
};

// Now with the above base type we can extend that to make the others
// * The below would be called "intersection types "

type Conference = TechEventBase & {
  location: string;
  price: number;
  talks: Talk[];
};

type Meetup = TechEventBase & {
  location: string;
  price: string;
  talks: Talk[];
};

type Webinar = TechEventBase & {
  url: string;
  price?: number;
  talks: Talk;
};

// We can use union types to handle a tech event where the kind of event could be either a Webinar, Meetup, or a Conference

type TechEvent = Webinar | Conference | Meetup;

// Say we're getting an event from an API - we don't know exactly what type of event it will be yet. We can use the TechEvent type and type narrowing to print out information about the event.

function printEvent(event: TechEvent) {
  if (event.price) {
    if (typeof event.price === "number") {
      console.log(`The event will be $${event.price}`);
    } else {
      console.log("ayeee you event is free!");
    }
  }

  if (Array.isArray(event.talks)) {
    event.talks.forEach((talk) => {
      console.log(talk.title);
    });
  } else {
    console.log(event.talks.title);
  }
}

/* We use type intersection to unify all of the properties that the events share. Then we use a union to create a TechEvent type from the each events type. The union type only uses the shared properties:

talks and price

The url property from a webinar wouldn't be shared on the TechEvent type and you would need more information to narrow down to that type.
*/

// !-----------------------------------!
// ! LESSON 23: Moving in the type space

// In the previous chapter used intersection (combining types) and union types (lowest common denominator between types)
// ? Why do we call them intersection and union types though?

/* let's take a look at the different types of types

Top Types: 
    any and unknown
    
    These types encapsulate all other types

Primitive Types:
    string, number, boolean, object, and symbol

    These are one level below the top types - if you use a union type it allows for number OR string

Value Types:
    1000, "mitchell", true, false, NaN

    These are literal values of a certain type and are a level below Primitives (and are primitives)

*/

type Name = {
  name: string;
};

type Age = {
  age: number;
};

// This is a valid value of type Age
const midlifeCrisis = {
  age: 40,
  useVim: true,
};

// This is a valid value of both type Age and Name
const me = {
  age: 23,
  name: "Mitchell Mudd",
};

// We need to have both Name and Age
type PersonWithAge = Name & Age;

// Can be either age or name. Set gets wider and there are more compatible options
type NameOrAge = Name | Age;

// Example of how you can keep going narrower all the way down to value types
let any: any = "conference";
let stringType: string = "conference";
const valueType: "conference" = "conference";

// This is implicitly typed as 'string'
let conference = "conference";

// this is implicitly typed as 'conference' because it's a const
const conf = "conference";

// This type is a union of three value types
type EventKind = "Conference" | "Webinar" | "Meetup";

// The below won't work because concert isn't one of the value types defined in EventKind
//@ts-expect-error
let tomorrowsEvent: EventKind = "concert";

// !-----------------------------------!
// ! LESSON 24: Working with value types

// We can now create a new TechEventBase type to utilize a value type union for kind

// We also will need new TechEvent types haha
type TechEventBaseNew = {
  title: string;
  description: string;
  date: Date;
  capacity: number;
  rsvp: number;
};

// ! But instead of using kind in the TechEventBaseNew we can throw the kind in each of these TechEvent types!
type ConferenceNew = TechEventBaseNew & {
  location: string;
  price: number;
  talks: Talk[];
  kind: "Conference";
};

type MeetupNew = TechEventBaseNew & {
  location: string;
  price: string;
  talks: Talk[];
  kind: "Meetup";
};

type WebinarNew = TechEventBaseNew & {
  url: string;
  price?: number;
  talks: Talk;
  kind: "Webinar";
};

type TechEventNew = WebinarNew | ConferenceNew | MeetupNew;

// ! WHOA - now that the `kind` property is on each TechEvent Type you can be certain which properties you can pull off of it
// * For example you know that if `kind` is meetup there will be a location property
function getEventTeaser(event: TechEventNew) {
  switch (event.kind) {
    case "Webinar":
      return `${event.title} Webinar. ` + `Available online at ${event.url}`;
    case "Conference":
      return `${event.title} Conference. ` + `Priced at ${event.price} USD`;
    case "Meetup":
      return `${event.title} Meetup. ` + `Hosted at ${event.location}`;
    // case "u" returns an error because it's not possible in event.kind
    // @ts-expect-error
    case "u":
      return ``;
    default:
      throw new Error("Whoops - bad move");
  }
}

// Example TechEvent object
const script19: TechEventNew = {
  title: string,
  date: new Date("2023-06-15"),
  capacity: 300,
  rsvp: 289,
  description: "The feel-good JS conference",
  // ? Why the 'as const' it tells typescript the type of kind should be 'Conference' not string
  kind: "Conference" as const,
  price: 129,
  location: "Amsterdam",
  talks: [
    {
      speaker: "Mitchell Mudd",
      title: "How not to write C# code",
      abstract: "...",
    },
  ],
};

// ! We can't do the below unless script19 is actually typed as a TechEvent. If it's not it will infer kind as string not conference. To fix that you can use as const
getEventTeaser(script19);

// !-----------------------------------!
// ! LESSON 25: Dynamic Unions

function filterByEvent(list: TechEventNew[], kind: EventKind) {
  return list.filter((event) => {
    event.kind === kind;
  });
}

declare const eventList: TechEventNew[];

// You get auto complete on the kind of event
filterByEvent(eventList, "Conference");
filterByEvent(eventList, "Meetup");
filterByEvent(eventList, "Webinar");

// This won't work because TypeScript KNOWS it won't return anything
// @ts-expect-error
filterByEvent(eventList, "Concert");

// Uh oh a new event type is incoming!
type Hackathon = TechEventBaseNew & {
  location: string;
  price?: number;
  kind: "Hackathon";
};

type TechEventNewer = ConferenceNew | WebinarNew | Hackathon | MeetupNew;

// ! Oh no! This doesn't work because there's a disconnect between EventKind and TechEvent
// @ts-expect-error
filterByEvent(eventList, "Hackathon");

// To fix this we can make a lookup or index access type
// Instead of setting EventKind to a list of the string we use TechEvent["kind"] which will grab all the current possible kinds of events
type EventKind2 = TechEventNewer["kind"];

function filterByEvent2(list: TechEventNew[], kind: EventKind2) {
  return list.filter((event) => {
    event.kind === kind;
  });
}

// * Now it works!!
filterByEvent2(eventList, "Hackathon");

// ? Next we ask what the heck are mapped types?

type GroupedEvents = {
  Conference: ConferenceNew[];
  Hackathon: Hackathon[];
  Meetup: MeetupNew[];
  Webinar: WebinarNew[];
};

// This is a mapped type. We loop over EventKind2 to extract all of the 'kinds' out of it
// This is not only simpler, but it makes sure that if we add a new type to EventKind2
// That it stays up to date
// ! This is a little less specific now as the types will all be `TechEventNewer`, but it automatically maps the key for us :) when we add a new type it will automatically add THAT key as well
type GroupedEvents2 = {
  [kind in EventKind2]: TechEventNewer[];
};

function groupEvents(events: TechEventNewer[]): GroupedEvents2 {
  const grouped = {
    Conference: <ConferenceNew[]>[],
    Hackathon: <Hackathon[]>[],
    Meetup: <MeetupNew[]>[],
    Webinar: <WebinarNew[]>[],
  };

  events.forEach((event) => {
    // Couldn't find a reason this gives an error, but it does....
    // @ts-ignore
    grouped[event.kind].push(event);
  });

  return grouped;
}
// !-----------------------------------!
// ! LESSON 26: Object Types and Type predicates
// We're going to add some more complexity to our fake "events" system
// Now there are users that can 'watch' events
// They can also 'subscribe' to events meaning they plan to attend or did attend
// If they are attending their status is 'responded'
// Users can also have 'attended' events in the past
// Lastly, a user can be 'signed off' meaning they are no longer interested in the event

type userEvents = {
  watching: TechEventNewer[];
  rsvp: TechEventNewer[];
  attended: TechEventNewer[];
  signedOff: TechEventNewer[];
};

// We want to provide a function that will filter out events based on the user's status and the event type
// This keyof keyword grabs all the keys from the userEvents type and makes them into a union
type UserEventCategory = keyof userEvents;

// Now we can use the UserEventCategory type to make sure the category is valid
function filterUserEvent(
  userEventList: userEvents,
  category: UserEventCategory,
  filterKind: EventKind2
) {
  const filteredList = userEventList[category];

  if (filterKind) {
    return filteredList.filter((event) => event.kind === filterKind);
  }

  return filteredList;
}

// ? What if this code is for someone else to use? What if they aren't using TypeScript? That's where type predicates come in

// We could do something like this

function isUserEventList(list: userEvents, category: string) {
  return Object.keys(list).includes(category);
}

// This is safer and guarantees that the category is a valid key otherwise the function won't execute anything
function filterUserEvent2(
  userEventList: userEvents,
  category: UserEventCategory,
  filterKind: EventKind2
) {
  if (isUserEventList(userEventList, category)) {
    const filteredList = userEventList[category];

    if (filterKind) {
      return filteredList.filter((event) => event.kind === filterKind);
    }

    return filteredList;
  }
}

// ! Uh oh though, now we've lost all connection to userEvents and the type safety it provides and category is just a string

// ? Type predicates to the rescue!
// This is a type predicate. It's a function that returns a boolean and tells TypeScript that the type is what you say it is
function isUserEventList2(
  list: userEvents,
  category: string
): category is keyof userEvents {
  return Object.keys(list).includes(category);
}

// !-----------------------------------!
// ! LESSON 27: Down at the bottom: never

// There is a type that's even narrower than a value type - never
// This is the anti-type of any. It's a type that can never be assigned to anything and doesn't allow any operations to be performed on it.
// ? So why would you use it?

// We saw never earlier with the getEventTeaser function
function getEventTeaser2(event: TechEventNew) {
  switch (event.kind) {
    case "Webinar":
      return `${event.title} Webinar. ` + `Available online at ${event.url}`;
    case "Conference":
      return `${event.title} Conference. ` + `Priced at ${event.price} USD`;
    case "Meetup":
      return `${event.title} Meetup. ` + `Hosted at ${event.location}`;
    // case "u" returns an error because it's not possible in event.kind
    // @ts-expect-error
    case "u":
      return ``;
    default:
      // This 'event' is a never type because it's impossible to get here - we've covered all the cases
      event;
      throw new Error("Whoops - bad move");
  }
}

// So when we're at the end of a switch statement or an if else where the else shouldn't be reached we should explicitly specify that it's a never type

function neverError(message: string, token: never) {
  return new Error(`${message}. ${token} should not exist`);
}

// * Now let's replace the default case in the switch statement with this
// If we don't include an event Typescript will be mad at us which is good
function getEventTeaser3(event: TechEventNewer) {
  switch (event.kind) {
    case "Webinar":
      return `${event.title} Webinar. ` + `Available online at ${event.url}`;
    case "Conference":
      return `${event.title} Conference. ` + `Priced at ${event.price} USD`;
    case "Meetup":
      return `${event.title} Meetup. ` + `Hosted at ${event.location}`;
    case "Hackathon":
      return `${event.title} Hackathon. ` + `Hosted at ${event.location}`;
    // case "u" returns an error because it's not possible in event.kind
    // @ts-expect-error
    case "u":
      return ``;
    default:
      throw neverError("Whoops - bad move", event);
  }
}

// !-----------------------------------!
// ! LESSON 28: Undefined and Null

// Null and undefined are known as bottom values and have no actual value.

// People argue about whether there need to be bottom values in a type system.

// Most people agree there definitely doesn't need to be two of them.

let age: number;

// TypeScript will complain about this because age is undefined
// @ts-expect-error
age = age + 1;

// This can get worse though
// Take for example trying to add some HTML to the DOM

function getTeaserHTML(event: TechEventNewer) {
  return `
 <h2>${event.title}</h2>
 <p>${event.description}</p> 
  `;
}

function getTeaserListElement(event: TechEventNewer) {
  const content = getTeaserHTML(event);
  const li = document.createElement("li");
  li.classList.add("event-teaser");
  li.innerHTML = content;
  return li;
}

function appendToList(event: TechEventNewer) {
  const list = document.querySelector("#event-list");
  const element = getTeaserListElement(event);

  // This will throw an error because list could be null
  // we can fix this with optional chaining or the ? operator
  // Now if list is null it will just return undefined and not throw an error
  list?.appendChild(element);
}

// We can catch these potential errors by either utilizing strictNullChecks or strict mode in our tsconfig.json file
// Doing so will move null and undefined from the value type under (string, number, boolean, symbol, bigint) to their own type

// ! If you must use a bottom value, stick with one. It's easier to reason about if you do so.

// Recap:

/* RECAP:

1. Learned about union and intersection types

2. Learned about discriminated unions and value types

3. Learned about the const context and how it can be used to narrow types

4. Found ways to dynamically create types through lookup and mapped types

5. Build our own type predicates as custom type guards

6. Learned about the never type and how it can be used to make our code safer

7. Learned about the bottom values null and undefined and how to avoid them


*/

// INTERLUDE:

// Arrays have other subtypes that we can use to make our code safer
// An example of this is the tuple or readonly array type

// First let's consider this function
declare function useToggleState(id: number): {
  state: boolean;
  updateState: () => void;
};

// This function returns an object with a state property and an updateState function. It's similar to useState in React
// We want to use object destructuring to get the state and updateState function out of the object

const { state, updateState } = useToggleState(1);

// But what if we want to use this function twice? We can't because the state and updateState variables will be overwritten. So we need to rename them like below which is annoying... and a bit ugly
const { state: state2, updateState: updateState2 } = useToggleState(2);

// If we used a tuple instead it would be much cleaner
declare function useToggleState2(id: number): [boolean, () => void];

const [consentBtn, updateConsentBtn] = useToggleState2(1);
const [newsletterBtn, updateNewsletterBtn] = useToggleState2(2);

// Tuples cannot be inferred by TypeScript so we need to explicitly type them

// This is just an array of string | number
let fakeTuple = ["Mitchell", 23];

// This is a tuple of string and number
// The const at the beginning is just for consistency to show you that it's a constant variable
// The const keyword at the end makes the array read-only and in turn a tuple
const realTuple = ["Mitchell", 23] as const;

// Now we explore what a toggleState function could look like with a tuple
// This is also a custom react hook... in essence
function useToggleState3(id: number): [boolean, () => void] {
  let state = false;

  function updateState() {
    state = !state;
  }

  return [state, updateState];
}
