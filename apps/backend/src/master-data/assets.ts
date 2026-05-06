import { makerKeys, type AssetRegistry, type MakerKey } from './types';

export const masterDataAssetFallback = '/assets/master-data/fallback.svg';

const makerLogoEntries = makerKeys.map(
  (maker) => [maker, `/assets/master-data/makers/${maker}.svg`] as const
);

const makerLogoMap = Object.fromEntries(makerLogoEntries) as Record<MakerKey, string>;

export const makerLogoRegistry: AssetRegistry<MakerKey> = Object.freeze({
  fallback: masterDataAssetFallback,
  map: Object.freeze(makerLogoMap),
});

export const hasMakerLogo = (maker: string): maker is MakerKey =>
  (makerKeys as readonly string[]).includes(maker);

export const resolveMakerLogo = (maker: string | null | undefined): string => {
  if (!maker) {
    return makerLogoRegistry.fallback;
  }

  const normalizedMaker = maker.trim().toLowerCase();

  if (!hasMakerLogo(normalizedMaker)) {
    return makerLogoRegistry.fallback;
  }

  return makerLogoRegistry.map[normalizedMaker] ?? makerLogoRegistry.fallback;
};
