// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Last<T extends any[]> = T extends [...infer _, infer L] ? L : never; 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataParameter<F extends (...args: any) =>any> = Last<Parameters<F>>;

export type ObserversUnknownData<T extends string> = {
  [k in T]: (() => void)[] 
};