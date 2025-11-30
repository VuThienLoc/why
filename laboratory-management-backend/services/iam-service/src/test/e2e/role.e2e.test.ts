import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

import routes from "../../routes/index.js";
import { RoleService } from "../../services/role.service.js";
import { errorHandler, notFoundHandler } from "../../middlewares/error.middleware.js";

const authState: { user: any | null } = { user: null };
vi.mock("../../middlewares/authenticate.middleware.js", () => ({
  default: {
    authenticateUser: (req: any, res: any, next: any) => {
      if (!authState.user) return res.status(401).json({ message: "Not authorized, no token" });
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

describe("Role E2E - /api/role", () => {
  let app: express.Express;

  beforeEach(() => {
    app = makeApp();
    authState.user = { _id: "U-ADMIN", email: "admin@example.com", role: ["ADMIN"] } as any;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("200 list roles with pagination", async () => {
    vi.spyOn(RoleService.prototype, "getRolesWithPagination").mockResolvedValue({
      data: [{ _id: "R-1", roleCode: "USER", roleName: "User" }],
      pagination: { limit: 10, hasNextPage: false, totalCount: 1 },
    } as any);

    const res = await request(app).get("/api/role/all");
    expect(res.status).toBe(200);
    expect(res.body?.data?.[0]?.roleCode).toBe("USER");
  });

  it("404 get role by id not found", async () => {
    vi.spyOn(RoleService.prototype, "getRole").mockResolvedValue(null as any);
    const res = await request(app).get("/api/role/ROLE-404");
    expect(res.status).toBe(404);
    expect(res.body?.error?.message).toBe("Role not found");
  });

  it("201 create role success", async () => {
    vi.spyOn(RoleService.prototype, "createRole").mockResolvedValue({ _id: "ROLE-1" } as any);
    const res = await request(app)
      .post("/api/role/create")
      .send({ roleCode: "LAB_USER", roleName: "Lab User", isActive: true, isSystemRole: false });

    expect(res.status).toBe(201);
    expect(res.body?.message).toBe("Role created successfully!");
  });

  it("200 update role success", async () => {
    vi.spyOn(RoleService.prototype, "updateRole").mockResolvedValue({ _id: "ROLE-1", isActive: false } as any);
    const res = await request(app)
      .put("/api/role/update/ROLE-1")
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body?.message).toBe("Role updated successfully!");
  });

  it("200 delete role success", async () => {
    vi.spyOn(RoleService.prototype, "deleteRole").mockResolvedValue({ _id: "ROLE-1" } as any);
    const res = await request(app).delete("/api/role/delete/ROLE-1");

    expect(res.status).toBe(200);
    expect(res.body?.message).toBe("Role deleted successfully!");
  });

  it("200 assign privileges", async () => {
    vi.spyOn(RoleService.prototype, "assignPrivilegesToRole").mockResolvedValue({ _id: "ROLE-1" } as any);
    const res = await request(app)
      .put("/api/role/assign/ROLE-1")
      .send({ privileges: ["read:user", "update:user"] });

    expect(res.status).toBe(200);
    expect(res.body?.message).toBe("Role updated successfully!");
  });

  it("200 remove privileges", async () => {
    vi.spyOn(RoleService.prototype, "removePrivilegesFromRole").mockResolvedValue({ _id: "ROLE-1" } as any);
    const res = await request(app)
      .put("/api/role/remove/ROLE-1")
      .send({ privileges: ["update:user"] });

    expect(res.status).toBe(200);
    expect(res.body?.message).toBe("Role updated successfully!");
  });
});
