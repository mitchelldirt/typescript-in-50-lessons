declare const isDevelopment: boolean;

// This extends the Object interface to allow for the use of hasOwnProperty. It is an overload on the existing hasOwnProperty method
interface Object {
  hasOwnProperty<X extends {}, Y extends PropertyKey>(
    obj: X,
    prop: Y
  ): obj is X & Record<Y, unknown>;
}

type ReturnKeys<O> = O extends number
  ? []
  : O extends string | any[]
  ? string[]
  : O extends object
  ? Array<keyof O>
  : never;

interface ObjectConstructor {
  keys<O>(obj: O): ReturnKeys<O>;
}

type DefineProperty<
  Prop extends PropertyKey,
  Desc extends PropertyDescriptor
> = Desc extends {
  writable: any;
  set(value: any): any;
}
  ? never
  : Desc extends {
      writable: any;
      get(): any;
    }
  ? never
  : Desc extends {
      writable: false;
    }
  ? Readonly<InferValue<Prop, Desc>>
  : Desc extends {
      writable: true;
    }
  ? InferValue<Prop, Desc>
  : Readonly<InferValue<Prop, Desc>>;

type InferValue<Prop extends PropertyKey, Desc> = Desc extends {
  get(): any;
  value: any;
}
  ? never
  : Desc extends { value: infer T }
  ? Record<Prop, T>
  : Desc extends { get(): infer T }
  ? Record<Prop, T>
  : never;

interface ObjectConstructor {
  defineProperty<
    Obj extends object,
    Key extends PropertyKey,
    PDesc extends PropertyDescriptor
  >(
    obj: Obj,
    prop: Key,
    val: PDesc
  ): asserts obj is Obj & DefineProperty<Key, PDesc>;
}
