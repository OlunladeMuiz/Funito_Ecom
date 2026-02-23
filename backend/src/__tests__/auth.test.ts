import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../utils/password";

describe("Auth API", () => {
  describe("POST /api/auth/signup", () => {
    it("should create a new user and return tokens", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user");
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.user.email).toBe("test@example.com");
      expect(res.body.user.name).toBe("Test User");
      expect(res.body.user).not.toHaveProperty("passwordHash");
    });

    it("should return 400 for invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          email: "invalid-email",
          password: "password123",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid payload");
    });

    it("should return 400 for password less than 8 characters", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          email: "test@example.com",
          password: "short",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid payload");
    });

    it("should return 409 if email already exists", async () => {
      // Create user first
      await prisma.user.create({
        data: {
          email: "existing@example.com",
          passwordHash: await hashPassword("password123"),
        },
      });

      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          email: "existing@example.com",
          password: "password123",
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Email already in use");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a test user
      await prisma.user.create({
        data: {
          email: "user@example.com",
          passwordHash: await hashPassword("password123"),
          name: "Test User",
        },
      });
    });

    it("should login with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.user.email).toBe("user@example.com");
    });

    it("should return 401 for non-existent user", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "noone@example.com",
          password: "password123",
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("should return 401 for wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "user@example.com",
          password: "wrongpassword",
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("should return 400 for invalid payload", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "not-an-email",
          password: "short",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid payload");
    });

    it("should store refresh token in database", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        });

      expect(res.status).toBe(200);

      const user = await prisma.user.findUnique({
        where: { email: "user@example.com" },
        include: { refreshTokens: true },
      });

      expect(user?.refreshTokens.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/auth/refresh", () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Create user and get tokens
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          email: "refresh@example.com",
          password: "password123",
        });

      refreshToken = res.body.refreshToken;
    });

    it("should return new tokens with valid refresh token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      // Just verify we get valid token strings
      expect(typeof res.body.refreshToken).toBe("string");
      expect(res.body.refreshToken.length).toBeGreaterThan(0);
    });

    it("should return 401 for invalid refresh token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "invalid-token" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid refresh token");
    });

    it("should return 400 for missing refresh token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid payload");
    });

    it("should revoke old refresh token after use", async () => {
      // Use the refresh token and get a new one
      const firstRes = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken });

      expect(firstRes.status).toBe(200);
      const newRefreshToken = firstRes.body.refreshToken;

      // The new token should work
      const secondRes = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: newRefreshToken });

      expect(secondRes.status).toBe(200);

      // Verify the old token is revoked in the database
      const user = await prisma.user.findFirst({
        where: { email: "refresh@example.com" },
        include: { refreshTokens: true },
      });

      const revokedTokens = user?.refreshTokens.filter((t) => t.revokedAt !== null);
      expect(revokedTokens?.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/auth/logout", () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Create user and get tokens
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          email: "logout@example.com",
          password: "password123",
        });

      refreshToken = res.body.refreshToken;
    });

    it("should logout and revoke refresh token", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged out");

      // Verify token is revoked
      const refreshRes = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken });

      expect(refreshRes.status).toBe(401);
    });

    it("should return 400 for missing refresh token", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid payload");
    });

    it("should succeed even with invalid token", async () => {
      // Logout should not fail even if token doesn't exist
      const res = await request(app)
        .post("/api/auth/logout")
        .send({ refreshToken: "some-invalid-token" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged out");
    });
  });
});
