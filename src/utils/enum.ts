export function enumKeys<T>(e: T): string[] {
  return Object.keys(e).filter((k) => typeof k === 'string' && isNaN(k as unknown as number));
}

export function enumValues<T>(e: T): T[keyof T][] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return enumKeys(e).map((k) => (e as any)[k]);
}
