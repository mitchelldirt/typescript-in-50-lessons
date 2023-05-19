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

// !-----------------------------------!
// ! LESSON 25: Dynamic Unions

// !-----------------------------------!
// ! LESSON 26: Object Types and Type predicates

// !-----------------------------------!
// ! LESSON 27: Down at the bottom: never

// !-----------------------------------!
// ! LESSON 28: Undefined and Null
