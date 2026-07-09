const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../../config/env");
const ApiError = require("../../utils/ApiError");

class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required.");
    }

    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const safeUser = this.toSafeUser(user);
    const token = jwt.sign(
      {
        sub: user.id,
        role: user.role,
        email: user.email,
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    return {
      token,
      user: safeUser,
    };
  }

  async register({ email, password }) {
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required.");
    }

    if (password.length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters.");
    }

    const existingUser = await this.authRepository.findByEmail(email);

    if (existingUser) {
      throw new ApiError(409, "Email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.authRepository.create({
      id: randomUUID(),
      email,
      passwordHash,
      role: "user",
    });

    return this.toSafeUser(user);
  }

  async getUserById(id) {
    const user = await this.authRepository.findById(id);

    if (!user) {
      throw new ApiError(401, "User account not found.");
    }

    return this.toSafeUser(user);
  }

  async getUsers() {
    const users = await this.authRepository.findAll();
    return users.map(this.toSafeUser);
  }

  async updateUserRole(id, role) {
    const allowedRoles = new Set(["user", "admin"]);

    if (!allowedRoles.has(role)) {
      throw new ApiError(400, "Role must be user or admin.");
    }

    const user = await this.authRepository.updateRole(id, role);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    return this.toSafeUser(user);
  }

  toSafeUser(user) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

module.exports = AuthService;
