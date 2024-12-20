import { Sticker } from './sticker.model';

export interface Gallery {
    Start: number;
    Size: number;
    OrderByName: boolean;
    Ascending: boolean;
    Sticker: Sticker
  }