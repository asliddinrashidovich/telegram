const BaseError = require("../errors/base.error");
const User = require("../models/user.model");
const mailService = require("../service/mail.service");

class AuthControlller {
  async login(req, res, next) {
    try {
      const { email, firstName, lastName } = req.body;
      const isExistUser = await User.findOne({ email });
      if (isExistUser) {
        await mailService.sendOtp(isExistUser.email);
        return res.status(200).json({ message: "existing_user" });
      }
      const createdUser = await User.create({ email, firstName, lastName });
      await mailService.sendOtp(createdUser.email);
      res.status(200).json({ message: createdUser.email});
    } catch (err) {
      next(err);
    }
  }
  async verify(req, res, next) {
    try {
      const { email, otp } = req.body;
      const result = await mailService.verifyOtp(email, otp);
      if (result) {
        const user = await User.findOneAndUpdate({ email }, { isVerified: true });
        res.status(200).json({ user });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthControlller();
