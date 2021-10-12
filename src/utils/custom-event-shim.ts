import { Event } from 'event-target-shim';

// TODO: & Event<TEventType> isn't what we want, probably should ditch event-target-shim and override EventTarget's type myself
export type TypedTypeCustomEvent<T = any, TEventType extends string = string> = CustomEvent<T> & { readonly type: TEventType; } & Event<TEventType>;

export type CustomEventConstructor = {
  prototype: CustomEvent;
  new <T, TEventType extends string>(typeArg: TEventType, eventInitDict?: CustomEventInit<T>): TypedTypeCustomEvent<T, TEventType>;
};
