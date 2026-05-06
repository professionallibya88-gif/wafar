import { masterDataCatalog, makerLogoRegistry } from '../master-data';

export type MasterDataResponse = {
  makers: readonly string[];
  car_models_by_maker: Record<string, readonly string[]>;
  maker_keywords_by_maker: Record<string, readonly string[]>;
  part_type_keywords_by_type: Record<string, readonly string[]>;
  assets: {
    maker_logos: Record<string, string>;
    fallback: string;
  };
};

export class MasterDataService {
  getMasterData(): MasterDataResponse {
    return {
      makers: masterDataCatalog.makers,
      car_models_by_maker: masterDataCatalog.carModelsByMaker,
      maker_keywords_by_maker: masterDataCatalog.makerKeywordsByMaker,
      part_type_keywords_by_type: masterDataCatalog.partTypeKeywordsByType,
      assets: {
        maker_logos: makerLogoRegistry.map,
        fallback: makerLogoRegistry.fallback,
      },
    };
  }
}

export const masterDataService = new MasterDataService();
