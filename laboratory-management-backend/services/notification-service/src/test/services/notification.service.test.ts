import { describe, it, beforeEach, expect, vi } from "vitest";
import { NotificationService } from "../../services/notification.service.js";
import * as RepositoryIndex from "../../repositories/index.js";
import * as PaginationModule from "../../../../shared/src/utils/pagination.util.js";

const notif = {
  _id: "N-0001",
  userId: "U-0001",
  type: "GENERIC",
  title: "New notification",
  body: "hello",
  data: { a: 1 },
  isRead: false,
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

describe("NotificationService - getNotificationId", () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
    vi.clearAllMocks();
  });

  it("should return a notification by id", async () => {
    const spy = vi
      .spyOn(RepositoryIndex.notificationRepository, "findById")
      .mockResolvedValue(notif as any);

    const result = await service.getNotificationId(notif._id);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(notif._id);
    expect(result).toEqual(notif);
  });
});

describe("NotificationService - listNotifs", () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
    vi.clearAllMocks();
  });

  it("should merge extra filters and format pagination response", async () => {
    const options: any = { limit: 10, sortBy: "updatedAt", sortOrder: "desc", filters: { isRead: false } };
    const extra = { userId: "U-0001" };

    const repoResult = {
      data: [notif],
      hasNextPage: true,
      totalCount: 1,
    };

    const formatted = {
      data: [notif],
      pagination: { hasNextPage: true, hasPreviousPage: false, nextCursor: notif.updatedAt, previousCursor: undefined, limit: options.limit, totalCount: 1 },
    } as any;

    const findWithPaginationMock = vi
      .spyOn(RepositoryIndex.notificationRepository, "findWithPagination")
      .mockResolvedValue(repoResult as any);

    const formatResponseMock = vi
      .spyOn(PaginationModule.PaginationUtils, "formatResponse")
      .mockReturnValue(formatted);

    const result = await service.listNotifs({ ...options }, extra);

    const expectedOptions = { ...options, filters: { ...options.filters, ...extra } };

    expect(findWithPaginationMock).toHaveBeenCalledTimes(1);
    expect(findWithPaginationMock).toHaveBeenCalledWith(expectedOptions);

    expect(formatResponseMock).toHaveBeenCalledTimes(1);
    expect(formatResponseMock).toHaveBeenCalledWith(
      repoResult.data,
      repoResult.hasNextPage,
      expectedOptions,
      repoResult.totalCount,
    );

    expect(result).toEqual(formatted);
  });
});

describe("NotificationService - notifyUser", () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
    vi.clearAllMocks();
  });

  it("should create notification with mapped title when known type", async () => {
    const payload = { userId: "U-1", type: "GENERIC", body: "Body", data: { a: 1 } } as any;

    const createMock = vi
      .spyOn(RepositoryIndex.notificationRepository, "create")
      .mockResolvedValue({ ...notif, ...payload } as any);

    const result = await service.notifyUser(payload.userId, payload.type, payload.body, payload.data);

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: payload.userId,
        type: payload.type,
        title: "New notification",
        body: payload.body,
        data: payload.data,
      })
    );
    expect(result).toEqual({ ...notif, ...payload });
  });

  it("should create notification with default title when unknown type", async () => {
    const payload = { userId: "U-1", type: "UNKNOWN_TYPE", body: "Body", data: { a: 1 } } as any;

    const createMock = vi
      .spyOn(RepositoryIndex.notificationRepository, "create")
      .mockResolvedValue({ ...notif, ...payload, title: "New notification" } as any);

    await service.notifyUser(payload.userId, payload.type, payload.body, payload.data);

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "New notification" })
    );
  });
});

describe("NotificationService - notifyManyUsers", () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
    vi.clearAllMocks();
  });

  it("should create many notifications with mapped title", async () => {
    const payload = { userId: ["U-1", "U-2"], type: "GENERIC", body: "Body", data: { a: 1 } } as any;

    const createManyMock = vi
      .spyOn(RepositoryIndex.notificationRepository, "createMany")
      .mockResolvedValue([notif] as any);

    const result = await service.notifyManyUsers(payload.userId, payload.type, payload.body, payload.data);

    expect(createManyMock).toHaveBeenCalledTimes(1);
    expect(createManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: payload.userId,
        type: payload.type,
        title: "New notification",
        body: payload.body,
        data: payload.data,
      })
    );
    expect(result).toEqual([notif]);
  });
});

describe("NotificationService - markAsRead", () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
    vi.clearAllMocks();
  });

  it("should mark a notification as read", async () => {
    const updated = { ...notif, isRead: true } as any;

    const markSpy = vi
      .spyOn(RepositoryIndex.notificationRepository, "markAsRead")
      .mockResolvedValue(updated as any);

    const result = await service.markAsRead(notif._id);

    expect(markSpy).toHaveBeenCalledTimes(1);
    expect(markSpy).toHaveBeenCalledWith(notif._id);
    expect(result).toEqual(updated);
  });

  it("should throw when notification not found", async () => {
    vi
      .spyOn(RepositoryIndex.notificationRepository, "markAsRead")
      .mockResolvedValue(null as any);

    await expect(service.markAsRead("NA"))
      .rejects.toThrow("Notification not found");
  });
});

describe("NotificationService - deleteNotification", () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
    vi.clearAllMocks();
  });

  it("should delete a notification by id", async () => {
    const findSpy = vi
      .spyOn(service, "getNotificationId")
      .mockResolvedValue(notif as any);

    const deleteSpy = vi
      .spyOn(RepositoryIndex.notificationRepository, "deleteById")
      .mockResolvedValue(notif as any);

    const result = await service.deleteNotification(notif._id, notif.userId);

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith(notif._id);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(notif._id);

    expect(result).toEqual(notif);
  });

  it("should throw when notification does not exist", async () => {
    vi
      .spyOn(service, "getNotificationId")
      .mockResolvedValue(null as any);

    await expect(service.deleteNotification("NA", "U-1"))
      .rejects.toThrow("No notifications are found");
  });
});
