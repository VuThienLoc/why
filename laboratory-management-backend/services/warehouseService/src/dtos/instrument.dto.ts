import type { IInstrument } from "../db/models/Instrument.model.js";

export interface InstrumentListResponse {
  message: string;
  data?: IInstrument[];
  total?: number;
  page?: number;
  limit?: number;
  details?: unknown;
}

export interface InstrumentResponse {
  message: string;
  data?: IInstrument;
  details?: unknown;
}


