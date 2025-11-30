import { describe, it, beforeEach, expect, vi } from "vitest";
import { MessageService } from "../../services/message.service.js";
import * as RepositoryIndex from "../../repositories/index.js";
import * as PaginationModule from "../../../../shared/src/utils/pagination.util.js";
import * as EncryptUtils from "../../utils/encrypt.utils.js";
import * as NotifAdapter from "../../../../shared/src/notif-service/adapter/notif.adapter.js";

const message = {
  _id: "M-0001",
  roomId: "R-0001",
  userId: "U-0001",
  text: "encrypted:text",
  isDeleted: false,
  toObject() { return { ...this }; },
} as any;

const room = {
  _id: "R-0001",
  name: "General",
  participants: ["U-0001", "U-0002", "U-0003"],
  createdBy: "U-0001",
} as any;

describe("MessageService - getMessageById", () => {
  let service: MessageService;

  beforeEach(() => {
    service = new MessageService();
    vi.clearAllMocks();
  });

  it("should return decrypted message", async () => {
    vi.spyOn(RepositoryIndex.messageRepository, "findById").mockResolvedValue(message as any);
    vi.spyOn(EncryptUtils, "decryptText").mockReturnValue("hello");

    const result = await service.getMessageById(message._id);

    expect(result?.text).toBe("hello");
  });

  it("should throw when not found", async () => {
    vi.spyOn(RepositoryIndex.messageRepository, "findById").mockResolvedValue(null as any);

    await expect(service.getMessageById("NA")).rejects.toThrow("Message not found");
  });
});

describe("MessageService - createMessage", () => {
  let service: MessageService;

  beforeEach(() => {
    service = new MessageService();
    vi.clearAllMocks();
  });

  it("should create message, encrypt text, and notify other participants", async () => {
    vi.spyOn(RepositoryIndex.roomRepository, "findById").mockResolvedValue(room as any);
    const createMock = vi.spyOn(RepositoryIndex.messageRepository, "create").mockResolvedValue({ ...message, _id: "M-0002" } as any);
    vi.spyOn(EncryptUtils, "encryptText").mockReturnValue("enc:hello");

    const notifMock = vi.spyOn(NotifAdapter.default, "notifyNewMessageMany").mockResolvedValue(undefined as any);

    const result = await service.createMessage(room._id, "U-0001", "hello");

    expect(createMock).toHaveBeenCalledWith({ roomId: room._id, userId: "U-0001", text: "enc:hello" });
    expect(notifMock).toHaveBeenCalledTimes(1);
    expect(notifMock).toHaveBeenCalledWith(["U-0002", "U-0003"], expect.stringContaining("room General"), { roomId: room._id, messageId: "M-0002" });
    expect(result._id).toBe("M-0002");
  });

  it("should throw when room not found", async () => {
    vi.spyOn(RepositoryIndex.roomRepository, "findById").mockResolvedValue(null as any);

    await expect(service.createMessage("NA", "U-1", "x")).rejects.toThrow("Room not found");
  });
});

describe("MessageService - updateMessage", () => {
  let service: MessageService;
  beforeEach(() => { service = new MessageService(); vi.clearAllMocks(); });

  it("should update own message and return decrypted text", async () => {
    vi.spyOn(RepositoryIndex.roomRepository, "findById").mockResolvedValue(room as any);
    vi.spyOn(RepositoryIndex.messageRepository, "findById").mockResolvedValue({ ...message, userId: "U-0001", roomId: room._id } as any);
    vi.spyOn(EncryptUtils, "encryptText").mockReturnValue("enc:new");
    vi.spyOn(EncryptUtils, "decryptText").mockReturnValue("new");

    const updateMock = vi.spyOn(RepositoryIndex.messageRepository, "updateById").mockResolvedValue({ ...message, text: "enc:new" } as any);

    const result = await service.updateMessage(room._id, message._id, "U-0001", "new");

    expect(updateMock).toHaveBeenCalledWith(room._id, message._id, { text: "enc:new" });
    expect(result.text).toBe("new");
  });

  it("should throw when editing others' message", async () => {
    vi.spyOn(RepositoryIndex.roomRepository, "findById").mockResolvedValue(room as any);
    vi.spyOn(RepositoryIndex.messageRepository, "findById").mockResolvedValue({ ...message, userId: "OTHER", roomId: room._id } as any);

    await expect(service.updateMessage(room._id, message._id, "U-0001", "new")).rejects.toThrow("You can only edit your own messages");
  });
});

describe("MessageService - deleteMessage", () => {
  let service: MessageService;
  beforeEach(() => { service = new MessageService(); vi.clearAllMocks(); });

  it("should delete own message and return decrypted text", async () => {
    vi.spyOn(RepositoryIndex.roomRepository, "findById").mockResolvedValue(room as any);
    vi.spyOn(RepositoryIndex.messageRepository, "findById").mockResolvedValue({ ...message, userId: "U-0001", roomId: room._id } as any);
    vi.spyOn(EncryptUtils, "decryptText").mockReturnValue("bye");

    const delMock = vi.spyOn(RepositoryIndex.messageRepository, "deleteById").mockResolvedValue({ ...message } as any);

    const result = await service.deleteMessage(room._id, message._id, "U-0001");

    expect(delMock).toHaveBeenCalledWith(room._id, message._id);
    expect(result.text).toBe("bye");
  });

  it("should throw when deleting others' message", async () => {
    vi.spyOn(RepositoryIndex.roomRepository, "findById").mockResolvedValue(room as any);
    vi.spyOn(RepositoryIndex.messageRepository, "findById").mockResolvedValue({ ...message, userId: "OTHER", roomId: room._id } as any);

    await expect(service.deleteMessage(room._id, message._id, "U-0001")).rejects.toThrow("You can only delete your own messages");
  });
});

describe("MessageService - getMessagesByRoomId", () => {
  let service: MessageService;
  beforeEach(() => { service = new MessageService(); vi.clearAllMocks(); });

  it("should decrypt messages and format pagination response", async () => {
    const options: any = { limit: 10 };
    const repoResult = { data: [message], hasNextPage: false, totalCount: 1 };

    vi.spyOn(RepositoryIndex.messageRepository, "findWithPagination").mockResolvedValue(repoResult as any);
    vi.spyOn(EncryptUtils, "decryptText").mockReturnValue("hello");

    const formatted = { data: [{ ...message, text: "hello" }], pagination: { limit: 10, hasNextPage: false } } as any;
    const formatMock = vi.spyOn(PaginationModule.PaginationUtils, "formatResponse").mockReturnValue(formatted);

    const result = await service.getMessagesByRoomId(room._id, options);

    expect(formatMock).toHaveBeenCalled();
    expect(result).toEqual(formatted);
  });
});
