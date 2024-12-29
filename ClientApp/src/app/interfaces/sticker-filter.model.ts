import { Sticker } from './sticker.model';

export interface StickerFilter {
    Start: number;
    Size: number;
    OrderByName: boolean;
    Ascending: boolean;
    Sticker: Sticker
  }