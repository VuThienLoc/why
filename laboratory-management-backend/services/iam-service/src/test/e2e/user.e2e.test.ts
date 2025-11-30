import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

import routes from "../../routes/index.js";
import { UserService } from "../../services/user.service.js";
import { errorHandler, notFoundHandler } from "../../middlewares/error.middleware.js";

const authState: { user: any | null } = { user: null };
vi.mock("../../middlewares/authenticate.middleware.js", () => ({
  default: {
    authenticateUser: (req: any, res: any, next: any) => {
      if (!authState.user) {
        return res.status(401).json({ message: "Not authorized, no token" });
      }
      req.user = authState.user;
      next();
    },
    refreshTokenValidation: (_req: any, _res: any, next: any) => next(),
  },
}));

vi.mock("../../middlewares/authorize.middleware.js", () => ({
  authorize: (_: string[]) => (_req: any, _res: any, next: any) => next(),
}));

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe("User E2E - /api/user", () => {
  let app: express.Express;

  beforeEach(() => {
    app = makeApp();
    authState.user = { _id: "U-1", email: "u@example.com" } as any;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("200 get current user profile", async () => {
    vi.spyOn(UserService.prototype, "getUser").mockResolvedValue({
      _id: "U-1",
      email: "u@example.com",
      fullName: "User One",
    } as any);

    const res = await request(app).get("/api/user/profile/U-1");

    expect(res.status).toBe(200);
    expect(res.body?.user?.email).toBe("u@example.com");
  });

  it("401 when missing auth", async () => {
    authState.user = null;
    const res = await request(app).get("/api/user/profile/U-1");
    expect(res.status).toBe(401);
  });

  it("404 get user by id when not found", async () => {
    vi.spyOn(UserService.prototype, "getUser").mockResolvedValue(null as any);
    const res = await request(app).get("/api/user/U-404");
    expect(res.status).toBe(404);
    expect(res.body?.error?.message).toBe("User not found");
  });

  it("201 update user success", async () => {
    vi.spyOn(UserService.prototype, "updateUser").mockResolvedValue({
      _id: "U-1",
      email: "new@example.com",
    } as any);

    const res = await request(app)
      .put("/api/user/update/U-1")
      .send({ email: "new@example.com" });

    expect(res.status).toBe(201);
    expect(res.body?.message).toBe("User updated successfully!");
  });

  it("200 lock user toggles isActive", async () => {
    vi.spyOn(UserService.prototype, "lockUser").mockResolvedValue({
      _id: "U-1",
      isActive: false,
    } as any);

    const res = await request(app)
      .put("/api/user/lock/U-1")
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body?.message).toBe("User locked successfully!");
  });
});
