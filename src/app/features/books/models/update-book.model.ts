export interface UpdateBook {
  readonly title: string;
  readonly author: string;
  readonly description: string;
  readonly rating: number | null;
}