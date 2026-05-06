import { carModelsByMakerData, makerKeywordsByMakerData, partTypeKeywordsByTypeData } from './data';
import {
  makerKeys,
  partTypeKeys,
  type MakerKey,
  type MasterDataCatalog,
  type MasterDataMap,
  type PartTypeKey,
} from './types';

const isString = (value: unknown): value is string => typeof value === 'string';

const toStringArray = (value: unknown): readonly string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isString);
};

const toMasterDataMap = <K extends string>(
  source: Record<string, unknown>,
  keys: readonly K[]
): MasterDataMap<K> => {
  const entries = keys.map((key) => [key, toStringArray(source[key])] as const);
  return Object.fromEntries(entries) as MasterDataMap<K>;
};

export const carModelsByMaker = Object.freeze(
  toMasterDataMap(carModelsByMakerData as unknown as Record<string, unknown>, makerKeys)
) as MasterDataMap<MakerKey>;

export const makerKeywordsByMaker = Object.freeze(
  toMasterDataMap(makerKeywordsByMakerData as unknown as Record<string, unknown>, makerKeys)
) as MasterDataMap<MakerKey>;

export const partTypeKeywordsByType = Object.freeze(
  toMasterDataMap(partTypeKeywordsByTypeData as unknown as Record<string, unknown>, partTypeKeys)
) as MasterDataMap<PartTypeKey>;

export const masterDataCatalog: MasterDataCatalog = Object.freeze({
  makers: makerKeys,
  carModelsByMaker,
  makerKeywordsByMaker,
  partTypeKeywordsByType,
});
