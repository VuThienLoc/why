import { describe, it, beforeEach, expect, vi } from "vitest";
import { RoomService } from "../../services/room.service.js";
import * as RepositoryIndex from "../../repositories/index.js";
import * as PaginationModule from "../../../../shared/src/utils/pagination.util.js";
import * as NotifAdapter from "../../../../shared/src/notif-service/adapter/notif.adapter.js";

const room = {
  _id: "R-0001",
  name: "General",
  participants: ["U-0001", "U-0002"],
  createdBy: "U-0001",
} as any;

describe("RoomService - getRoomById", () => {
  let service: RoomService;
  beforeEach(() => { service = new RoomService(); vi.clearAllMocks(); });

  it("should return a room by id", async () => {
    const spy = vi.spyOn(RepositoryIndex.roomRepository, "findById").mockResolvedValue(room as any);
    const result = await service.getRoomById(room._id);

    expect(spy).toHaveBeenCalledWith(room._id);
    expect(result).toEqual(room);
  });
});

describe("RoomService - listRooms", () => {
  let service: RoomService;
  beforeEach(() => { service = new RoomService(); vi.clearAllMocks(); });

  it("should merge filters and format response", async () => {
    const options: any = { limit: 10, sortBy: "updatedAt", sortOrder: "desc", filters: { createdBy: "U-0001" } };
    const extra = { participants: "U-0002" };
    const repoResult = { data: [room], hasNextPage: false, totalCount: 1 };

    const findMock = vi.spyOn(RepositoryIndex.roomRepository, "findWithPagination").mockResolvedValue(repoResult as any);
    const formatted = { data: [room], pagination: { limit: 10, hasNextPage: false, totalCount: 1 } } as any;
    const formatMock = vi.spyOn(PaginationModule.PaginationUtils, "formatResponse").mockReturnValue(formatted);

    const result = await service.listRooms({ ...options }, extra);

    const expectedOptions = { ...options, filters: { ...options.filters, ...extra } };

    expect(findMock).toHaveBeenCalledWith(expectedOptions);
    expect(formatMock).toHaveBeenCalledWith(repoResult.data, repoResult.hasNextPage, expectedOptions, repoResult.totalCount);
    expect(result).toEqual(formatted);
  });
});

describe("RoomService - createRoom", () => {
  let service: RoomService;
  beforeEach(() => { service = new RoomService(); vi.clearAllMocks(); });

  it("should create room; suffix name until unique", async () => {
    const findByNameMock = vi
      .spyOn(RepositoryIndex.roomRepository, "findByName")
      .mockResolvedValueOnce([room] as any)
      .mockResolvedValueOnce([] as any);

    const createMock = vi
      .spyOn(RepositoryIndex.roomRepository, "create")
      .mockResolvedValue({ ...room, name: "General's Room (2)" } as any);

    const result = await service.createRoom("General", ["U-1", "U-2"], "U-1");

    expect(findByNameMock).toHaveBeenCalledTimes(2);
    expect(createMock).toHaveBeenCalledWith({ name: "General's Room (2)", participants: ["U-1", "U-2"], createdBy: "U-1" });
    expect(result.name).toBe("General's Room (2)");
  });

  it("should throw if name still exists after loop check (defensive)", async () => {
    vi.spyOn(RepositoryIndex.roomRepository, "findByName").mockResolvedValue([room] as any);

    await expect(service.createRoom("General's Room (2)", ["U-1"], "U-1")).rejects.toThrow("Room with current name already exists");
  });
});

describe("RoomService - updateRoom", () => {
  let service: RoomService;
  beforeEach(() => { service = new RoomService(); vi.clearAllMocks(); });

  it("should update when authorized and data valid", async () => {
    vi.spyOn(RepositoryIndex.roomRepository, "findById").mockResolvedValue(room as any);

    const updateMock = vi.spyOn(RepositoryIndex.roomRepository, "updateById").mockResolvedValue({ ...room, name: "New" } as any);

    const result = await service.updateRoom(room._id, { name: "New", participants: ["U-0001", "U-0003"] }, room.createdBy, false);

    expect(updateMock).toHaveBeenCalledWith(room._id, { name: "New", participants: ["U-0001", "U-0003"] });
    expect(result?.name).toBe("New");
  });

  it("should block same name", async () => {
    vi.spyOn(RepositoryIndex.roomRepository, "findById").mockResolvedValue({ ...room, name: "Same" } as any);

    await expect(service.updateRoom(room._id, { name: "Same", participants: ["U-1"] }, room.createdBy, false)).rejects.toThrow("Room with current name already exists");
  });

  it("should block same participants set", async () => {
    vi.spyOn(RepositoryIndex.roomRepository, "findById").mockResolvedValue({ ...room, participants: ["A", "B"] } as any);

    await expect(service.updateRoom(room._id, { participants: ["A", "B"] }, room.createdBy, false)).rejects.toThrow("Room with current participants already exists");
  });

  it("should block unauthorized user", async () => {
    vi.spyOn(RepositoryIndex.roomRepository, "findById").mockResolvedValue(room as any);

    await expect(service.updateRoom(room._id, { name: "New" }, "OTHER", false)).rejects.toThrow("You are not authorized to update this room");
  });
});

describe("RoomService - deleteRoom", () => {
  let service: RoomService;
  beforeEach(() => { service = new RoomService(); vi.clearAllMocks(); });

  it("should delete when authorized", async () => {
    vi.spyOn(service, "getRoomById").mockResolvedValue(room as any);

    const delMock = vi.spyOn(RepositoryIndex.roomRepository, "deleteById").mockResolvedValue(room as any);

    const result = await service.deleteRoom(room._id, room.createdBy, false);

    expect(delMock).toHaveBeenCalledWith(room._id);
    expect(result).toEqual(room);
  });

  it("should block unauthorized user", async () => {
    vi.spyOn(service, "getRoomById").mockResolvedValue(room as any);

    await expect(service.deleteRoom(room._id, "OTHER", false)).rejects.toThrow("You are not authorized to delete this room");
  });
});

describe("RoomService - joinRoom", () => {
  let service: RoomService;
  beforeEach(() => { service = new RoomService(); vi.clearAllMocks(); });

  it("should join and notify room owner", async () => {
    vi.spyOn(service, "getRoomById").mockResolvedValue({ ...room, participants: ["U-0001"] } as any);

    const joinMock = vi.spyOn(RepositoryIndex.roomRepository, "joinRoom").mockResolvedValue({ ...room, participants: ["U-0001", "U-0002"] } as any);
    const notifMock = vi.spyOn(NotifAdapter.default, "notifyRoomJoin").mockResolvedValue(undefined as any);

    const result = await service.joinRoom(room._id, "U-0002", "User Two");

    expect(joinMock).toHaveBeenCalledWith(room._id, "U-0002");
    expect(notifMock).toHaveBeenCalledWith(room.createdBy, expect.stringContaining("has joined your room"), { roomId: room._id, userId: "U-0002" });
    expect(result?.participants).toContain("U-0002");
  });

  it("should throw if already in room", async () => {
    vi.spyOn(service, "getRoomById").mockResolvedValue({ ...room, participants: ["U-0001", "U-0002"] } as any);

    await expect(service.joinRoom(room._id, "U-0002", "User Two")).rejects.toThrow("User already in room");
  });

  it("should throw if room not found", async () => {
    vi.spyOn(service, "getRoomById").mockResolvedValue(null as any);
    await expect(service.joinRoom("NA", "U-1", "User")).rejects.toThrow("Room not found");
  });
});

describe("RoomService - leaveRoom", () => {
  let service: RoomService;
  beforeEach(() => { service = new RoomService(); vi.clearAllMocks(); });

  it("should delegate to repository", async () => {
    const leaveMock = vi.spyOn(RepositoryIndex.roomRepository, "leaveRoom").mockResolvedValue({ ...room, participants: ["U-0001"] } as any);

    const result = await service.leaveRoom(room._id, "U-0002");

    expect(leaveMock).toHaveBeenCalledWith(room._id, "U-0002");
    expect(result?.participants).toEqual(["U-0001"]);
  });
});
