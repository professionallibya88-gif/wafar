import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/ApiResponse';
import { masterDataService } from '../services/MasterDataService';

export const getMasterData = asyncHandler(async (_req: Request, res: Response) => {
  const data = masterDataService.getMasterData();
  return success(res, { data });
});
