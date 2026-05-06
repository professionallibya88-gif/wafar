import { carModelsByMakerData, partTypeKeywordsByTypeData } from './data';

export const makerKeys = Object.freeze(
  Object.keys(carModelsByMakerData)
) as readonly (keyof typeof carModelsByMakerData)[];

export type MakerKey = (typeof makerKeys)[number];

export const partTypeKeys = Object.freeze(
  Object.keys(partTypeKeywordsByTypeData)
) as readonly (keyof typeof partTypeKeywordsByTypeData)[];

export type PartTypeKey = (typeof partTypeKeys)[number];

export type MasterDataMap<K extends string> = Record<K, readonly string[]>;

export type AssetRegistry<K extends string> = {
  fallback: string;
  map: Record<K, string>;
};

export type MasterDataCatalog = {
  makers: readonly MakerKey[];
  carModelsByMaker: MasterDataMap<MakerKey>;
  makerKeywordsByMaker: MasterDataMap<MakerKey>;
  partTypeKeywordsByType: MasterDataMap<PartTypeKey>;
};
