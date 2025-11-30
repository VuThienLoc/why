import Instrument, { type IInstrument } from "../../db/models/Instrument.model.js";
import { generateInstrumentCode } from "../../utils/instrumentCode.util.js";

export interface PaginationOptions {
  page: number;
  limit: number;
  sort: "created_at" | "instrument_name";
  status?: IInstrument["status"];
  is_active?: boolean;
  manufacturer?: string;
}

export const createInstrument = async (
  payload: Pick<IInstrument, "instrument_name" | "instrument_type" | "location" | "manufacturer"> & {
    created_by?: string;
  }
): Promise<IInstrument> => {
  const instrumentDoc = await Instrument.create({
    instrument_code: generateInstrumentCode(),
    instrument_name: payload.instrument_name,
    instrument_type: payload.instrument_type,
    manufacturer: payload.manufacturer,
    location: payload.location,
    created_by: payload.created_by,
  });

  // Cloning reagents/configs will be implemented once models are available.

  return instrumentDoc.toObject<IInstrument>();
};

export const findInstruments = async ({
  page,
  limit,
  sort,
  status,
  is_active,
  manufacturer,
}: PaginationOptions): Promise<{ data: IInstrument[]; total: number }> => {
  const filter: Record<string, unknown> = { is_deleted: false };
  if (status) filter.status = status;
  if (typeof is_active === "boolean") filter.is_active = is_active;
  if (manufacturer) filter.manufacturer = manufacturer;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Instrument.find(filter)
      .sort({ [sort]: sort === "instrument_name" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v')
     .lean<IInstrument>(),
    Instrument.countDocuments(filter),
  ]);

  return { data, total };
};

export const findInstrumentById = async (id: string): Promise<IInstrument | null> => {
  return Instrument.findOne({ _id: id, is_deleted: false }).select('-__v').lean<IInstrument>();
};

export const updateInstrumentById = async (
  id: string,
  update: Partial<Pick<IInstrument, "instrument_name" | "instrument_type" | "manufacturer" | "location" | "status" | "is_active" | "updated_by">>
): Promise<IInstrument | null> => {
  const updatePayload = {
    ...update,
    updated_at: new Date(),
  };
  
  return Instrument.findOneAndUpdate({ _id: id, is_deleted: false }, updatePayload, {
    new: true,
  }).select('-__v').lean<IInstrument>();
};

export const softDeleteInstrumentById = async (
  id: string,
  deletedBy?: string
): Promise<IInstrument | null> => {
  return Instrument.findOneAndUpdate(
    { _id: id, is_deleted: false },
    {
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: deletedBy,
      is_active: false,
    },
    { new: true }
  )
    .select('-__v')
    .lean<IInstrument>();
};


export const searchInstrumentsRepo = async (
  keyword: string,
  page: number,
  limit: number
): Promise<{ data: IInstrument[]; total: number }> => {
  const skip = (page - 1) * limit;

  const query: Record<string, any> = { is_deleted: false };
  if (keyword && keyword.trim() !== "") {
    const kw = keyword.trim();
    query["$or"] = [
      { instrument_name: { $regex: kw, $options: "i" } },
      { instrument_code: { $regex: kw, $options: "i" } },
      { manufacturer: { $regex: kw, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    Instrument.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })
      .select("-__v")
      .lean<IInstrument[]>(),
    Instrument.countDocuments(query),
  ]);

  return { data, total };
};