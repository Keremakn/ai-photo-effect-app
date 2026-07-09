const bcrypt = require("bcryptjs");
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

    const admin = await this.authRepository.findByEmail(email);

    if (!admin) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const safeAdmin = this.toSafeAdmin(admin);
    const token = jwt.sign(
      {
        sub: admin.id,
        role: admin.role,
        email: admin.email,
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    return {
      token,
      admin: safeAdmin,
    };
  }

  async getAdminById(id) {
    const admin = await this.authRepository.findById(id);

    if (!admin) {
      throw new ApiError(401, "Admin account not found.");
    }

    return this.toSafeAdmin(admin);
  }

  toSafeAdmin(admin) {
    return {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
    };
  }
}

module.exports = AuthService;
