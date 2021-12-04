declare module 'untar-to-memory' {
  export interface ReadOptions {
    ignoreCase?: boolean;
    wildcards?: boolean;
    wildcardsMatchSlash?: boolean;
  }

  export function readEntry(
    tarball: string,
    filename: string,
    options: ReadOptions,
    callback: (error: Error, buffer: Buffer) => void
  ): void;

  export interface ListOptions extends ReadOptions {
    pattern?: string;
    recursion?: boolean;
    anchored?: boolean;
  }

  export function list(
    tarball: string,
    options: ListOptions,
    callback: (error: Error, entries: string[]) => void
  ): void;
}
