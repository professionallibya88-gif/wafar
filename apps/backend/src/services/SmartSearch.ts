import { partRepository } from '../repositories';

export class SmartSearch {
  static getPriceBounds(suppliers: Array<{ price_cash?: number | null }>): {
    cheapest: number | null;
    most_expensive: number | null;
  } {
    const prices = suppliers
      .map((supplier) => supplier.price_cash)
      .filter((price): price is number => typeof price === 'number' && !Number.isNaN(price));

    if (prices.length === 0) {
      return { cheapest: null, most_expensive: null };
    }

    return {
      cheapest: Math.min(...prices),
      most_expensive: Math.max(...prices),
    };
  }

  static async search(query: string, filters: any = {}): Promise<any> {
    const q = query.trim();
    if (!q) {
      return {
        type: 'unified',
        query: q,
        groups: [],
        total: 0,
      };
    }

    const results = await partRepository.smartSearchUnified(q, filters);
    const groups = this.groupByName(results);

    return {
      type: 'unified',
      query: q,
      groups,
      total: results.length,
    };
  }

  static detectType(query: string): string {
    const q = query.trim();
    if (!q) return 'name';

    if (/^[A-Z0-9./-]{6,}$/i.test(q) && /\d/.test(q)) {
      return 'oem';
    }

    if (/^\d{1,5}$/.test(q)) return 'item_number';

    return 'name';
  }

  static async searchByOEM(oem: string, filters: any): Promise<any> {
    const results = await partRepository.smartSearchExactMatch('oem_number', oem, filters);

    if (results.length === 0) {
      return {
        type: 'oem',
        query: oem,
        groups: [],
        total: 0,
      };
    }

    const suppliers = results.map((r: any) => ({
      supplier: r.supplier?.name || r.supplier_name_text,
      supplier_name_text: r.supplier_name_text,
      supplier_id: r.supplier_id,
      price_cash: r.price_cash,
      price_bank: r.price_bank,
      price_wholesale: r.price_wholesale,
      price_wholesale_small: r.price_wholesale_small,
      brand: r.brand,
      origin_country: r.origin_country,
      car_model: r.derived?.car_model,
      quantity_available: r.quantity_available,
      in_stock: r.in_stock,
      quality: r.quality_grade,
      file_id: r.pdf_file_id,
      part_id: r.id,
    }));
    const priceBounds = this.getPriceBounds(suppliers);

    const groups = [
      {
        oem_number: oem,
        part_name: (results[0] as any)?.part_name || (results[0] as any)?.item_name,
        part_code: (results[0] as any)?.part_code,
        suppliers,
        cheapest: priceBounds.cheapest,
        most_expensive: priceBounds.most_expensive,
      },
    ];

    return {
      type: 'oem',
      query: oem,
      groups,
      total: results.length,
    };
  }

  static async searchByItemNumber(itemNumber: string, filters: any): Promise<any> {
    const results = await partRepository.smartSearchExactMatch('item_number', itemNumber, filters);

    if (results.length === 0) {
      return {
        type: 'item_number',
        query: itemNumber,
        groups: [],
        total: 0,
      };
    }

    const suppliers = results.map((r: any) => ({
      supplier: r.supplier?.name || r.supplier_name_text,
      supplier_name_text: r.supplier_name_text,
      supplier_id: r.supplier_id,
      price_cash: r.price_cash,
      price_bank: r.price_bank,
      price_wholesale: r.price_wholesale,
      price_wholesale_small: r.price_wholesale_small,
      brand: r.brand,
      origin_country: r.origin_country,
      car_model: r.derived?.car_model,
      quantity_available: r.quantity_available,
      in_stock: r.in_stock,
      quality: r.quality_grade,
      file_id: r.pdf_file_id,
      part_id: r.id,
    }));
    const priceBounds = this.getPriceBounds(suppliers);

    const groups = [
      {
        item_number: itemNumber,
        part_name: (results[0] as any)?.part_name || (results[0] as any)?.item_name,
        part_code: (results[0] as any)?.part_code,
        suppliers,
        cheapest: priceBounds.cheapest,
        most_expensive: priceBounds.most_expensive,
      },
    ];

    return {
      type: 'item_number',
      query: itemNumber,
      groups,
      total: results.length,
    };
  }

  static async searchByName(name: string, filters: any): Promise<any> {
    let results = await this.searchByTrigram(name, filters);

    if (results.length === 0) {
      results = await this.searchByTsvector(name, filters);
    }

    if (results.length === 0) {
      results = await this.searchByLike(name, filters);
    }

    const groups = this.groupByName(results);

    return {
      type: 'name',
      query: name,
      groups,
      total: results.length,
    };
  }

  static async searchByTrigram(name: string, filters: any): Promise<any[]> {
    return await partRepository.smartSearchByName(name, filters, true);
  }

  static async searchByTsvector(name: string, filters: any): Promise<any[]> {
    return this.searchByLike(name, filters);
  }

  static async searchByLike(name: string, filters: any): Promise<any[]> {
    return await partRepository.smartSearchByName(name, filters, false);
  }

  /**
   * @deprecated استخدام PartRepository.applySmartSearchFilters بدلاً من ذلك
   */
  static applyFilters(filters: any): any {
    return partRepository.applySmartSearchFilters(filters);
  }

  static groupByName(results: any[]): any[] {
    const groups: any = {};

    results.forEach((r) => {
      const key = r.part_name || r.item_name || r.oem_number || r.item_number;
      if (!groups[key]) {
        groups[key] = {
          part_name: r.part_name || r.item_name,
          part_code: r.part_code,
          oem_number: r.oem_number,
          item_number: r.item_number,
          suppliers: [],
        };
      }
      groups[key].suppliers.push({
        supplier: r.supplier?.name || r.supplier_name_text,
        supplier_name_text: r.supplier_name_text,
        supplier_id: r.supplier_id,
        price_cash: r.price_cash,
        price_bank: r.price_bank,
        price_wholesale: r.price_wholesale,
        price_wholesale_small: r.price_wholesale_small,
        brand: r.brand,
        origin_country: r.origin_country,
        car_model: r.derived?.car_model,
        quantity_available: r.quantity_available,
        in_stock: r.in_stock,
        quality: r.quality_grade,
        file_id: r.pdf_file_id,
        part_id: r.id,
      });
    });

    return Object.values(groups).map((g: any) => ({
      ...g,
      ...this.getPriceBounds(g.suppliers),
    }));
  }

  static async searchByDerived(criteria: any, filters: any = {}): Promise<any[]> {
    return await partRepository.smartSearchByDerived(criteria, filters);
  }
}
