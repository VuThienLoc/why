import type { IInstrument } from "../../db/models/Instrument.model.js";
import {
  createInstrument,
  findInstrumentById,
  findInstruments,
  softDeleteInstrumentById,
  updateInstrumentById,
  type PaginationOptions,
  searchInstrumentsRepo,
} from "../../repositories/instrument/instrument.repository.js";

export const createInstrumentService = async (
  payload: Parameters<typeof createInstrument>[0]
): Promise<IInstrument> => {
  return createInstrument(payload);
};

export const getInstrumentsService = async (
  options: PaginationOptions
): Promise<{ data: IInstrument[]; total: number; page: number; limit: number }> => {
  const { data, total } = await findInstruments(options);
  return { data, total, page: options.page, limit: options.limit };
};

export const getInstrumentByIdService = async (id: string): Promise<IInstrument | null> => {
  return findInstrumentById(id);
};

export const updateInstrumentService = async (
  id: string,
  updatePayload: Parameters<typeof updateInstrumentById>[1]
): Promise<IInstrument | null> => {
  return updateInstrumentById(id, updatePayload);
};

export const deleteInstrumentService = async (
  id: string,
  deletedBy?: string
): Promise<IInstrument | null> => {
  return softDeleteInstrumentById(id, deletedBy);
};


export const searchInstrumentsService = async (
  keyword: string,
  page: number,
  limit: number
): Promise<{ data: any[]; total: number }> => {
  return searchInstrumentsRepo(keyword, page, limit);
};