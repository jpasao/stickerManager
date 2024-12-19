import { Sticker } from './sticker.model';

export interface Gallery {
    Start: number;
    Size: number;
    Ascending: boolean;
    Sticker: Sticker
  }