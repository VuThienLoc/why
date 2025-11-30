import { describe, it, beforeEach, expect, vi, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

import routes from "../../routes/index.js";

import bcrypt from "bcryptjs";
import * as JwtUtil from "../../utils/jwt.util.js";

import { UserService } from "../../services/user.service.js";
import patientServiceClient from "../../services/patientService.client.js";
import {
  errorHandler,
  notFoundHandler,
} from "../../middlewares/error.middleware.js";

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe("Auth E2E - POST /api/login", () => {
  let app: express.Express;

  beforeEach(() => {
    app = makeApp();
    vi.clearAllMocks();
  });

  it("401 when no lastPasswordChange and no password history", async () => {
    const userNoHistory = {
      _id: "U-NH",
      email: "nohistory@example.com",
      passwordHash: "hashed",
      role: ["USER"],
      // lastPasswordChange intentionally undefined
    } as any;
    vi.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(userNoHistory);
    vi.spyOn(UserService.prototype, "getLatestPasswordHistory").mockResolvedValue(null as any);

    const res = await request(app).post("/api/login").send({
      identifier: userNoHistory.email,
      password: "any",
    });

    expect(res.status).toBe(401);
    expect(res.body?.error?.message).toBe("Password expired");
  });

  it("429 when account is locked (lockedUntil in future)", async () => {
    const lockedUser = {
      _id: "U-2",
      email: "locked@example.com",
      passwordHash: "hashed",
      role: ["USER"],
      lockedUntil: new Date(Date.now() + 5 * 60_000),
      lastPasswordChange: new Date(),
    } as any;
    vi.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(
      lockedUser
    );

    const res = await request(app).post("/api/login").send({
      identifier: lockedUser.email,
      password: "anything",
    });

    expect(res.status).toBe(429);
    expect(res.body?.error?.message).toBe("Try again later");
  });

  it("401 when password expired (90+ days)", async () => {
    const expiredUser = {
      _id: "U-3",
      email: "expired@example.com",
      passwordHash: "hashed",
      role: ["USER"],
      lastPasswordChange: new Date(Date.now() - 91 * 86_400_000),
    } as any;

    vi.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(
      expiredUser
    );

    vi.spyOn(
      UserService.prototype,
      "getLatestPasswordHistory"
    ).mockResolvedValue(null as any);
    const res = await request(app).post("/api/login").send({
      identifier: expiredUser.email,
      password: "anything",
    });

    expect(res.status).toBe(401);
    expect(res.body?.error?.message).toBe("Password expired");
  });

  it("400 invalid password increments attempts and may set lock", async () => {
    const user = {
      _id: "U-4",
      email: "inc@example.com",
      passwordHash: "hashed",
      role: ["USER"],
      lastPasswordChange: new Date(),
      failedLoginAttempts: 4, // nextAttempts -> 5 (triggers 5 min lock)
    } as any;
    vi.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(user);
    vi.spyOn(
      UserService.prototype,
      "getLatestPasswordHistory"
    ).mockResolvedValue(null as any);
    vi.spyOn(bcrypt, "compare").mockResolvedValue(false as any);
    const updateSpy = vi
      .spyOn(UserService.prototype, "updateUserInternal")
      .mockResolvedValue({} as any);

    const res = await request(app).post("/api/login").send({
      identifier: user.email,
      password: "wrong",
    });

    expect(res.status).toBe(400);
    expect(res.body?.error?.message).toBe("Invalid password!");
    expect(updateSpy).toHaveBeenCalled();
    const first = updateSpy.mock.calls[0]!;
    const [_id, payload] = first;
    expect(_id).toBe(user._id);
    expect((payload as any).failedLoginAttempts).toBe(5);
    expect((payload as any).lockedUntil).toBeInstanceOf(Date);
  });

  it("200 success resets failed attempts and lock fields", async () => {
    const user = {
      _id: "U-5",
      email: "ok@example.com",
      passwordHash: "hashed",
      role: ["USER"],
      lastPasswordChange: new Date(),
      failedLoginAttempts: 3,
      lockedUntil: new Date(Date.now() - 60_000),
      lastFailedAt: new Date(Date.now() - 120_000),
    } as any;
    vi.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(user);
    vi.spyOn(
      UserService.prototype,
      "getLatestPasswordHistory"
    ).mockResolvedValue(null as any);
    vi.spyOn(bcrypt, "compare").mockResolvedValue(true as any);
    const updateSpy = vi
      .spyOn(UserService.prototype, "updateUserInternal")
      .mockResolvedValue({} as any);

    const res = await request(app).post("/api/login").send({
      identifier: user.email,
      password: "correct",
    });

    expect(res.status).toBe(200);
    // Ensure reset was attempted
    expect(updateSpy).toHaveBeenCalled();
    const payloads = updateSpy.mock.calls.map((c) => c[1]);
    expect(
      payloads.some(
        (p: any) =>
          p && p.failedLoginAttempts === 0 && p.lockedUntil === undefined
      )
    ).toBe(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("400 when missing credentials", async () => {
    const res = await request(app).post("/api/login").send({});
    expect(res.status).toBe(400);
    expect(res.body?.error?.message).toBe("Missing credentials");
  });

  it("400 when user not found (email)", async () => {
    vi.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(
      null as any
    );
    vi.spyOn(
      UserService.prototype,
      "getLatestPasswordHistory"
    ).mockResolvedValue(null as any);
    const res = await request(app).post("/api/login").send({
      identifier: "nope@example.com",
      password: "x",
    });
    expect(res.status).toBe(400);
    expect(res.body?.error?.message).toBe("User not found!");
  });

  it("400 when invalid password", async () => {
    const fakeUser = {
      _id: "U-1",
      email: "u@example.com",
      passwordHash: "hashed",
      role: ["USER"],
      lastPasswordChange: new Date(),
    } as any;
    vi.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(
      fakeUser
    );
    vi.spyOn(UserService.prototype, "getLatestPasswordHistory").mockResolvedValue({} as any);
    vi.spyOn(bcrypt, "compare").mockResolvedValue(false as any);
    vi.spyOn(UserService.prototype, "updateUserInternal").mockResolvedValue({} as any);

    const res = await request(app).post("/api/login").send({
      identifier: "u@example.com",
      password: "wrong",
    });

    expect(res.status).toBe(400);
    expect(res.body?.error?.message).toBe("Invalid password!");
  });

  it("200 when valid login (sets cookies and returns user)", async () => {
    const fakeUser = {
      _id: "U-1",
      email: "u@example.com",
      phoneNumber: "123",
      fullName: "User",
      passwordHash: "hashed",
      role: ["USER"],
      lastPasswordChange: new Date(),
    } as any;

    vi.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(
      fakeUser
    );
    vi.spyOn(
      UserService.prototype,
      "getLatestPasswordHistory"
    ).mockResolvedValue(null as any);
    vi.spyOn(bcrypt, "compare").mockResolvedValue(true as any);

    vi.spyOn(JwtUtil, "generateJWT").mockImplementation((res: any) => {
      res.cookie("accessToken", "fake", { httpOnly: true });
      res.cookie("refreshToken", "fake", { httpOnly: true });
    });
    vi.spyOn(UserService.prototype, "updateUserInternal").mockResolvedValue({} as any);

    const res = await request(app).post("/api/login").send({
      identifier: "u@example.com",
      password: "correct",
    });

    expect(res.status).toBe(200);
    expect(res.body?.message).toBe("Login successful!");
    expect(res.body?.user?.email).toBe(fakeUser.email);
    const setCookieHeader = res.headers["set-cookie"];
    const setCookies: string[] = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : setCookieHeader
      ? [setCookieHeader]
      : [];
    expect(setCookies.some((c) => c.startsWith("accessToken="))).toBe(true);
    expect(setCookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
  });
});

describe("Auth E2E - POST /api/register", () => {
  let app: express.Express;

  beforeEach(() => {
    app = makeApp();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("400 when missing credentials", async () => {
    const res = await request(app).post("/api/register").send({});
    expect(res.status).toBe(400);
    expect(res.body?.error?.message).toSatisfy((m: string) =>
      [
        "Email is required",
        "Password is required",
        "Full name is required",
        "Identity number is required",
      ].includes(m)
    );
  });

  it("400 when user already exists (email)", async () => {
    const fakeUser = {
      _id: "U-1",
      email: "u@example.com",
      passwordHash: "hashed",
      role: ["USER"],
    } as any;

    const registerData = {
      email: "u@example.com",
      fullName: "User1",
      password: "Xa1223456789",
      identityNumber: "1234958687",
      dateOfBirth: "2002-02-13",
      gender: "Male",
      age: 12,
      phoneNumber: "1002939394",
      address: "123 Street",
    } as any;
    vi.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(
      fakeUser
    );
    vi.spyOn(UserService.prototype, "getUserByPhoneNumber").mockResolvedValue(
      null as any
    );
    const res = await request(app).post("/api/register").send(registerData);
    expect(res.status).toBe(400);
    expect(res.body?.error?.message).toBe("Email already exists!");
  });

  it("200 when valid register", async () => {
    const registerData = {
      email: "new@example.com",
      fullName: "New User",
      password: "Xa122345678",
      identityNumber: "1234958687",
      dateOfBirth: "2002-02-13",
      gender: "Male",
      age: 12,
      phoneNumber: "1002939394",
      address: "123 Street",
    } as any;

    vi.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(
      null as any
    );
    vi.spyOn(UserService.prototype, "getUserByPhoneNumber").mockResolvedValue(
      null as any
    );
    vi.spyOn(UserService.prototype, "createUser").mockResolvedValue({
      _id: "U-2",
      email: registerData.email,
      fullName: registerData.fullName,
      phoneNumber: registerData.phoneNumber,
      role: ["USER"],
    } as any);
    vi.spyOn(patientServiceClient, "createPatientForUser").mockResolvedValue(
      undefined as any
    );

    const res = await request(app).post("/api/register").send(registerData);

    expect(res.status).toBe(200);
    expect(res.body?.message).toBe("User created successfully!");
  });
});
