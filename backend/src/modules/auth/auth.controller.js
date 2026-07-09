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

  me = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: req.admin,
    });
  });
}

module.exports = AuthController;
