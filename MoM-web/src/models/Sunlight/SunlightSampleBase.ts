/**
 * Sunlight Blue commissions and 90s record catalog contracts.
 * Implements Constitution Brendup Title II and Title V.
 */

export type SunlightMediaKind = 'cover' | 'music';
export type SunlightCategory = 'digital_art' | 'custom_song';

export interface SunlightSampleBase {
  SampleID: number | null;
  Key: string;
  Title: string;
  Category: SunlightCategory;
  Kind: SunlightMediaKind;
  PriceUsd: number;
  PriceMxn: number;
  MediaUrl: string;
  ImageBinary?: string | null;
  AudioBinary?: string | null;
  AudioUrl?: string | null;
  Description?: string | null;
  Duration?: string | null;
  TrackNumber?: number | null;
  HasVinylDisc?: boolean;
  AspectRatio?: string | null;
  CassetteTitle?: string | null;
  CassetteIndex?: number | null;
  Side?: 'A' | 'B' | null;
  Order: number;
  IsActive: boolean;
  IsDeleted: boolean;
}

export interface SunlightCompiledCassette {
  id: string;
  tapeNumber: number;
  title: string;
  sideA: SunlightSampleBase;
  sideB?: SunlightSampleBase | null;
}
