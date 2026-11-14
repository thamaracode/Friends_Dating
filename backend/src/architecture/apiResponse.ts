import { Response } from 'express';
import { ApiResponse, ErrorCode, PaginationParams, SortingParams } from './types';

export function createSuccessResponse<T>(
  data: T,
  meta?: ApiResponse<T>['meta']
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: Date.now(),
      version: 'v1',
      ...meta
    }
  };
}

export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: any
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details
    },
    meta: {
      timestamp: Date.now(),
      version: 'v1'
    }
  };
}

export function parsePagination(
  query: Record<string, any>,
  defaultLimit: number = 20,
  maxLimit: number = 100
): PaginationParams {
  let page = parseInt(query.page as string, 10);
  if (isNaN(page) || page < 1) page = 1;

  let limit = parseInt(query.limit as string, 10);
  if (isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function parseSorting(
  query: Record<string, any>,
  allowedFields: string[] = ['created_at', 'updated_at', 'id'],
  defaultField: string = 'created_at',
  defaultOrder: 'asc' | 'desc' = 'desc'
): SortingParams {
  let sortBy = (query.sortBy || query.sort_by) as string;
  if (!sortBy || !allowedFields.includes(sortBy)) {
    sortBy = defaultField;
  }

  let sortOrder = ((query.sortOrder || query.sort_order || '').toLowerCase()) as 'asc' | 'desc';
  if (sortOrder !== 'asc' && sortOrder !== 'desc') {
    sortOrder = defaultOrder;
  }

  return { sortBy, sortOrder };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  meta?: ApiResponse<T>['meta'],
  statusCode: number = 200
): Response {
  return res.status(statusCode).json(createSuccessResponse(data, meta));
}

export function sendError(
  res: Response,
  code: ErrorCode,
  message: string,
  statusCode: number = 400,
  details?: any
): Response {
  return res.status(statusCode).json(createErrorResponse(code, message, details));
}
