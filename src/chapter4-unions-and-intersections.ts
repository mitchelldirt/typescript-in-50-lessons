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

// !-----------------------------------!
// ! LESSON 27: Down at the bottom: never

// !-----------------------------------!
// ! LESSON 28: Undefined and Null
