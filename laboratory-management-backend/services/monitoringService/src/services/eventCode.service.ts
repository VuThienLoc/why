import EventCode, { type IEventCode } from "../db/models/EventCode.model.js";
import { resolveServiceNameVariants, type ServiceName } from "../constants/event.constant.js";

export interface CreateEventCodePayload {
  event_code: string;
  event_name: string;
  description: string;
  service_name: ServiceName;
  is_active?: boolean;
}

export interface UpdateEventCodePayload {
  event_name?: string;
  description?: string;
  service_name?: ServiceName;
  is_active?: boolean;
}

export interface EventCodeFilters {
  service_name?: ServiceName;
  is_active?: boolean;
}

class EventCodeService {
  /**
   * Get all event codes with optional filters and pagination
   */
  async getAllEventCodes(
    filters: EventCodeFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{ codes: IEventCode[]; total: number; page: number; totalPages: number }> {
    const query: Record<string, unknown> = {};

    if (filters.service_name) {
      query.service_name = { $in: resolveServiceNameVariants(filters.service_name) };
    }
    if (typeof filters.is_active === "boolean") {
      query.is_active = filters.is_active;
    }

    const skip = (page - 1) * limit;
    const [codes, total] = await Promise.all([
      EventCode.find(query).sort({ event_code: 1 }).skip(skip).limit(limit).lean<IEventCode[]>(),
      EventCode.countDocuments(query),
    ]);

    return {
      codes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get event code by code
   */
  async getEventCodeByCode(eventCode: string): Promise<IEventCode | null> {
    return EventCode.findOne({ event_code: eventCode }).lean<IEventCode | null>();
  }

  /**
   * Create new event code
   */
  async createEventCode(payload: CreateEventCodePayload): Promise<IEventCode> {
    const eventCode = new EventCode(payload);
    return eventCode.save();
  }

  /**
   * Update event code
   */
  async updateEventCode(eventCode: string, payload: UpdateEventCodePayload): Promise<IEventCode | null> {
    return EventCode.findOneAndUpdate(
      { event_code: eventCode },
      { $set: payload },
      { new: true, runValidators: true }
    ).lean<IEventCode | null>();
  }

  /**
   * Delete event code (soft delete by setting is_active to false)
   */
  async deleteEventCode(eventCode: string): Promise<boolean> {
    const result = await EventCode.findOneAndUpdate(
      { event_code: eventCode },
      { $set: { is_active: false } },
      { new: true }
    );
    return result !== null;
  }

  /**
   * Hard delete event code
   */
  async hardDeleteEventCode(eventCode: string): Promise<boolean> {
    const result = await EventCode.findOneAndDelete({ event_code: eventCode });
    return result !== null;
  }

  /**
   * Get event codes for a specific service
   */
  async getEventCodesByService(serviceName: ServiceName): Promise<IEventCode[]> {
    return EventCode.find({
      service_name: { $in: resolveServiceNameVariants(serviceName) },
      is_active: true,
    })
      .sort({ event_code: 1 })
      .lean<IEventCode[]>();
  }
}

export default new EventCodeService();
