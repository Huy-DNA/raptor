export type PrimitiveType = number | bigint | boolean | string | symbol | null | undefined;
export type NonPrimitiveType = Exclude<unknown, PrimitiveType> & object;
