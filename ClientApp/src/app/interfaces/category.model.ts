import { Tag } from "./tag.model";

export interface Category {
    IdCategory: number;
    CategoryName: string;
    Tag: Tag[]
  }