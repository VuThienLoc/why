import { describe, it, beforeEach, expect, vi } from "vitest";
import {
  OAuthService,
  type CreateOAuthUserData,
} from "../../services/oauth.service.js";
import * as RepositoryIndex from "../../repositories/index.js";

const oauthUser = {
  _id: "U-0001",
  email: "oauth@example.com",
  fullName: "OAuth User",
  identityNumber: "OAUTH_google_1234567890_abc12345",
  provider: "google",
  providerId: "google-12345",
  avatar: "https://example.com/avatar.jpg",
  role: ["USER"],
  isActive: true,
  isDeleted: false,
} as any;

const localUser = {
  _id: "U-0002",
  email: "local@example.com",
  fullName: "Local User",
  identityNumber: "1234567890",
  provider: "local",
  providerId: "",
  passwordHash: "hashedpassword",
  role: ["USER"],
  isActive: true,
  isDeleted: false,
} as any;

let repoResult = { ...localUser };

describe("OAuthService - createOAuthUser", () => {
  let oauthService: OAuthService;

  beforeEach(() => {
    oauthService = new OAuthService();
    vi.clearAllMocks();
  });

  it("should create new OAuth user when no existing user found", async () => {
    const oauthData: CreateOAuthUserData = {
      email: "newuser@example.com",
      fullName: "New User",
      provider: "google",
      providerId: "google-new-123",
      avatar: "https://example.com/new-avatar.jpg",
    };

    const newUserData = {
      ...oauthData,
      identityNumber: expect.stringMatching(/^OAUTH_google_\d+_[a-f0-9]{8}$/),
      role: "USER",
      isActive: true,
      isDeleted: false,
    };

    const findProviderMock = vi
      .spyOn(RepositoryIndex.userRepository, "findOne")
      .mockResolvedValue(null);

    const findEmailMock = vi
      .spyOn(RepositoryIndex.userRepository, "findOne")
      .mockResolvedValue(null);

    const createMock = vi
      .spyOn(RepositoryIndex.userRepository, "create")
      .mockResolvedValue({ _id: "U-0003", ...newUserData } as any);

    const result = await oauthService.createOAuthUser(oauthData);

    expect(findProviderMock).toHaveBeenCalledWith({
      provider: "google",
      providerId: "google-new-123",
    });

    expect(findEmailMock).toHaveBeenCalledWith({
      email: "newuser@example.com",
      provider: "local",
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "newuser@example.com",
        fullName: "New User",
        provider: "google",
        providerId: "google-new-123",
        avatar: "https://example.com/new-avatar.jpg",
        role: "USER",
        isActive: true,
        isDeleted: false,
        identityNumber: expect.stringMatching(/^OAUTH_google_\d+_[a-f0-9]{8}$/),
      })
    );

    expect(result).toEqual({ _id: "U-0003", ...newUserData });
  });

  it("should return existing OAuth user when found", async () => {
    const oauthData: CreateOAuthUserData = {
      email: "oauth@example.com",
      fullName: "OAuth User",
      provider: "google",
      providerId: "google-12345",
    };

    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findOne")
      .mockResolvedValue(oauthUser);

    const result = await oauthService.createOAuthUser(oauthData);

    expect(findMock).toHaveBeenCalledWith({
      provider: "google",
      providerId: "google-12345",
    });

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(oauthUser);
  });

  it("should link OAuth account to existing local user", async () => {
    const oauthData = {
      email: "local@example.com",
      fullName: "Local User",
      provider: "google",
      providerId: "google-link-123",
      avatar: "https://example.com/link-avatar.jpg",
    } as any;

    const findOneMock = vi
      .spyOn(RepositoryIndex.userRepository, "findOne")
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(repoResult);

    const updatedData = {
      ...repoResult,
      provider: "google",
      providerId: "google-link-123",
      avatar: "https://example.com/link-avatar.jpg",
    } as any;

    const updateMock = vi
      .spyOn(RepositoryIndex.userRepository, "updateById")
      .mockResolvedValue(updatedData);

    const result = await oauthService.createOAuthUser(oauthData);

    expect(findOneMock).toHaveBeenCalledTimes(2);
    expect(findOneMock).toHaveBeenNthCalledWith(1, {
      provider: "google",
      providerId: "google-link-123",
    });
    expect(findOneMock).toHaveBeenNthCalledWith(2, {
      email: "local@example.com",
      provider: "local",
    });

    expect(updateMock).toHaveBeenCalledWith(repoResult._id, {
      provider: "google",
      providerId: "google-link-123",
      avatar: "https://example.com/link-avatar.jpg",
    });

    expect(result).toEqual(updatedData);
  });
});

describe("OAuthService - findUserByProvider", () => {
  let oauthService: OAuthService;

  beforeEach(() => {
    oauthService = new OAuthService();
    vi.clearAllMocks();
  });

  it("should find user by provider and providerId", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findOne")
      .mockResolvedValue(oauthUser);

    const result = await oauthService.findUserByProvider(
      "google",
      "google-12345"
    );

    expect(findMock).toHaveBeenCalledWith({
      provider: "google",
      providerId: "google-12345",
    });

    expect(result).toEqual(oauthUser);
  });

  it("should return null when user not found", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findOne")
      .mockResolvedValue(null);

    const result = await oauthService.findUserByProvider(
      "google",
      "nonexistent"
    );

    expect(findMock).toHaveBeenCalledWith({
      provider: "google",
      providerId: "nonexistent",
    });

    expect(result).toBeNull();
  });
});

describe("OAuthService - findUserByEmailAndProvider", () => {
  let oauthService: OAuthService;

  beforeEach(() => {
    oauthService = new OAuthService();
    vi.clearAllMocks();
  });

  it("should find user by email and provider", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findOne")
      .mockResolvedValue(repoResult);

    const result = await oauthService.findUserByEmailAndProvider(
      "local@example.com",
      "local"
    );

    expect(findMock).toHaveBeenCalledWith({
      email: "local@example.com",
      provider: "local",
    });

    expect(result).toEqual(repoResult);
  });

  it("should return null when user not found", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findOne")
      .mockResolvedValue(null);

    const result = await oauthService.findUserByEmailAndProvider(
      "nonexistent@example.com",
      "local"
    );

    expect(findMock).toHaveBeenCalledWith({
      email: "nonexistent@example.com",
      provider: "local",
    });

    expect(result).toBeNull();
  });
});

describe("OAuthService - linkOAuthAccount", () => {
  let oauthService: OAuthService;

  beforeEach(() => {
    oauthService = new OAuthService();
    vi.clearAllMocks();
  });

  it("should link OAuth account to existing user", async () => {
    const oauthData = {
      email: "local@example.com",
      fullName: "Local User",
      provider: "google",
      providerId: "google-link-456",
      avatar: "https://example.com/new-avatar.jpg",
    } as any;

    const updatedData = {
      ...repoResult,
      provider: "google",
      providerId: "google-link-456",
      avatar: "https://example.com/new-avatar.jpg",
    };

    const updateMock = vi
      .spyOn(RepositoryIndex.userRepository, "updateById")
      .mockResolvedValue(updatedData);

    const result = await oauthService.linkOAuthAccount(repoResult, oauthData);

    expect(updateMock).toHaveBeenCalledWith(repoResult._id, {
      provider: "google",
      providerId: "google-link-456",
      avatar: "https://example.com/new-avatar.jpg",
    });

    expect(result).toEqual({
      ...repoResult,
      provider: "google",
      providerId: "google-link-456",
      avatar: "https://example.com/new-avatar.jpg",
    });
  });

  it("should preserve existing avatar when OAuth avatar not provided", async () => {
    const userWithAvatar = {
      ...repoResult,
      avatar: "https://example.com/existing-avatar.jpg",
    };

    const oauthData: CreateOAuthUserData = {
      email: "local@example.com",
      fullName: "Local User",
      provider: "google",
      providerId: "google-link-789",
    };

    const updatedData = {
      ...userWithAvatar,
      provider: "google",
      providerId: "google-link-789",
    };

    const updateMock = vi
      .spyOn(RepositoryIndex.userRepository, "updateById")
      .mockResolvedValue(updatedData);

    const result = await oauthService.linkOAuthAccount(
      userWithAvatar,
      oauthData
    );

    expect(updateMock).toHaveBeenCalledWith(userWithAvatar._id, {
      provider: "google",
      providerId: "google-link-789",
      avatar: "https://example.com/existing-avatar.jpg",
    });

    expect(result).toEqual({
      ...userWithAvatar,
      provider: "google",
      providerId: "google-link-789",
    });
  });
});

describe("OAuthService - getOAuthUserStatus", () => {
  let oauthService: OAuthService;

  beforeEach(() => {
    oauthService = new OAuthService();
    vi.clearAllMocks();
  });

  it("should return OAuth user status for OAuth user", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findById")
      .mockResolvedValue(oauthUser);

    const result = await oauthService.getOAuthUserStatus(oauthUser._id);

    expect(findMock).toHaveBeenCalledWith(oauthUser._id);

    expect(result).toEqual({
      isOAuthUser: true,
      provider: "google",
      hasPassword: false,
      avatar: "https://example.com/avatar.jpg",
    });
  });

  it("should return OAuth user status for local user", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findById")
      .mockResolvedValue(localUser);

    const result = await oauthService.getOAuthUserStatus(localUser._id);

    expect(findMock).toHaveBeenCalledWith(localUser._id);

    expect(result).toEqual({
      isOAuthUser: false,
      provider: "local",
      hasPassword: true,
      avatar: undefined,
    });
  });

  it("should throw when user not found", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findById")
      .mockResolvedValue(null);

    await expect(
      oauthService.getOAuthUserStatus("nonexistent-user-id")
    ).rejects.toThrow("User not found");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith("nonexistent-user-id");
  });
});
