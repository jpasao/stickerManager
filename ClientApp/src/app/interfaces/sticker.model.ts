import { Tag } from "./tag.model";

export interface Sticker {
  IdSticker: number;
  StickerName: string;
  Tag: Tag[]
}