export interface Cache {
  tarballs: Record<string, string[]>;
  tags: Record<string, Record<string, string[]>>;
}
