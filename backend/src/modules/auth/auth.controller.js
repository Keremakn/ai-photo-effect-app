const asyncHandler = require("../../utils/asyncHandler");

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  login = asyncHandler(async (req, res) => {
    const authResult = await this.authService.login(req.body);

    res.status(200).json({
      success: true,
      data: authResult,
    });
  });

  register = asyncHandler(async (req, res) => {
    const user = await this.authService.register(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
  });

  me = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  });

  getUsers = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: await this.authService.getUsers(),
    });
  });

  updateUserRole = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: await this.authService.updateUserRole(req.params.id, req.body.role),
    });
  });
}

module.exports = AuthController;
