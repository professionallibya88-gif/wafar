import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { file, success, buildPaginationMeta } from '../utils/ApiResponse';
import { parsePagination } from '../utils/pagination';
import { SmartSearch } from '../services/SmartSearch';
import { searchService } from '../services/SearchService';
import { AuthenticatedRequest } from '../types';

export const smart = asyncHandler(async (req: Request, res: Response) => {
  const {
    q,
    supplier_id,
    pdf_file_id,
    brand,
    quality_grade,
    min_price,
    max_price,
    maker,
    car_model,
  } = req.query;
  const results = await SmartSearch.search(q as string, {
    supplier_id,
    pdf_file_id,
    brand,
    quality_grade,
    min_price: min_price ? parseFloat(min_price as string) : undefined,
    max_price: max_price ? parseFloat(max_price as string) : undefined,
    maker,
    car_model,
  });
  return success(res, {
    data: {
      type: results.type,
      query: results.query,
      groups: results.groups,
    },
    meta: {
      total: results.total,
      page: 1,
      limit: results.total,
      totalPages: 1,
    },
  });
});

export const derived = asyncHandler(async (req: Request, res: Response) => {
  const { maker, car_model, part_type, year, side } = req.query;
  const criteria = {
    maker,
    car_model,
    part_type,
    year: year ? parseInt(year as string, 10) : undefined,
    side,
  };
  const data = await SmartSearch.searchByDerived(criteria, req.query);
  return success(res, { data });
});

export const legacy = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { limit, page } = parsePagination(req.query);
  const { q, category, brand, quality_grade, supplier_id, min_price, max_price, pdf_file_id } =
    req.query;

  const { rows, count } = await searchService.legacySearch({
    userId: req.user?.id,
    query: q as string,
    filters: {
      category,
      brand,
      quality_grade,
      supplier_id,
      pdf_file_id,
      min_price,
      max_price,
    },
    pagination: { limit, offset: (page - 1) * limit },
    sort: { field: 'part_name', order: 'ASC' },
  });

  return success(res, {
    data: { parts: rows },
    meta: buildPaginationMeta({ total: count, page, limit }),
  });
});

export const compare = asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.query;
  const partIds = typeof ids === 'string' ? ids.split(',') : [];
  const results = await searchService.compare(partIds);
  return success(res, { data: results });
});

export const history = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { limit, page } = parsePagination(req.query);
  const userId = req.user ? req.user.id : undefined;
  if (!userId) {
    return success(res, {
      data: { history: [] },
      meta: buildPaginationMeta({ total: 0, page, limit }),
    });
  }
  const data = await searchService.getHistory({
    userId,
    limit,
    offset: (page - 1) * limit,
  });
  return success(res, {
    data: { history: data.rows || [] },
    meta: buildPaginationMeta({ total: data.count || 0, page, limit }),
  });
});

export const categories = asyncHandler(async (_req: Request, res: Response) => {
  const data = await searchService.getCategories();
  return success(res, { data });
});

export const brands = asyncHandler(async (_req: Request, res: Response) => {
  const data = await searchService.getBrands();
  return success(res, { data });
});

export const exportExcel = asyncHandler(async (req: Request, res: Response) => {
  const { q, category, brand, quality_grade, supplier_id, min_price, max_price, pdf_file_id } =
    req.query;

  const buffer = await searchService.exportToExcel({
    q: q as string | undefined,
    category: category as string | undefined,
    brand: brand as string | undefined,
    quality_grade: quality_grade as string | undefined,
    supplier_id: supplier_id as string | undefined,
    pdf_file_id: pdf_file_id as string | undefined,
    min_price: min_price ? parseFloat(min_price as string) : undefined,
    max_price: max_price ? parseFloat(max_price as string) : undefined,
  });

  return file(res, {
    data: buffer,
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileName: 'parts_export.xlsx',
  });
});
