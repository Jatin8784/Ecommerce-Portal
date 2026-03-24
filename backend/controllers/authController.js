import ErrorHandler from "../middleware/errorMiddlewares.js";
import { catchAsyncErrors } from "../middleware/catchAsyncError.js";
import database from "../database/db.js";
import bcrypt from "bcrypt";
import { sendToken } from "../utils/jwtToken.js";
import { generateResetPasswordToken } from "../utils/generateResetPasswordToken.js";
import { generateEmailTemplate } from "../utils/generateForgotPasswordEmailTemplate.js";
import { generateOtpTemplate } from "../utils/generateOtpTemplate.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

export const sendOtpForRegistration = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }

  if (password.length < 8 || password.length > 16) {
    return next(
      new ErrorHandler("Password must be between 8 and 16 characters", 400)
    );
  }

  const isAlreadyRegistered = await database.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  if (isAlreadyRegistered.rows.length > 0) {
    return next(
      new ErrorHandler("User already registered with this email", 400)
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await database.query(
    "INSERT INTO otps (email, otp, expires_at) VALUES ($1, $2, $3)",
    [email, otp, expiresAt]
  );

  const message = generateOtpTemplate(otp);

  try {
    await sendEmail({
      email,
      subject: "Verify Your Email Address",
      message,
    });
    res.status(200).json({
      success: true,
      message: "OTP sent to your email address",
    });
  } catch (error) {
    console.error("Email Error:", error);
    return next(new ErrorHandler("Email could not be sent.", 500));
  }
});

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, otp } = req.body;
  if (!name || !email || !password || !otp) {
    return next(new ErrorHandler("Please enter all fields including OTP", 400));
  }

  if (password.length < 8 || password.length > 16) {
    return next(
      new ErrorHandler("Password must be between 8 and 16 characters", 400)
    );
  }

  const otpRecord = await database.query(
    "SELECT * FROM otps WHERE email = $1 AND otp = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
    [email, otp]
  );

  if (otpRecord.rows.length === 0) {
    return next(new ErrorHandler("Invalid or expired OTP", 400));
  }

  const isAlreadyRegistered = await database.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  if (isAlreadyRegistered.rows.length > 0) {
    return next(
      new ErrorHandler("User already registered with this email", 400)
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await database.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
    [name, email, hashedPassword]
  );
  
  await database.query("DELETE FROM otps WHERE email = $1", [email]);

  sendToken(newUser.rows[0], 201, "Registered Successfully", res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }
  const user = await database.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
  if (user.rows.length === 0) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  const isPasswordMatched = await bcrypt.compare(
    password,
    user.rows[0].password
  );
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  sendToken(user.rows[0], 200, "Login Successfully", res);
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const { frontendUrl } = req.query;
  let userResults = await database.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
  if (userResults.rows.length === 0) {
    return next(new ErrorHandler("User not found with this email", 404));
  }
  const user = userResults.rows[0];
  const { hashedToken, resetPasswordExpireTime, resetToken } =
    generateResetPasswordToken();

  await database.query(
    "UPDATE users SET reset_password_token = $1, reset_password_expire = to_timestamp($2) WHERE email = $3",
    [hashedToken, resetPasswordExpireTime / 1000, email]
  );

  const resetPasswordUrl = `${frontendUrl}/password/reset/${resetToken}`;

  const message = generateEmailTemplate(resetPasswordUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "Ecommerce Password Recovery",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    await database.query(
      "UPDATE users SET reset_password_token = NULL, reset_password_expire = NULL WHERE email = $1",
      [email]
    );
    console.error("Nodemailer Error:", error);
    return next(new ErrorHandler(error.message || "Email could not be sent.", 500));
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await database.query(
    "SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expire > NOW()",
    [resetPasswordToken]
  );
  if (user.rows.length === 0) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }
  if (
    req.body.password?.length < 8 ||
    req.body.confirmPassword?.length > 16 ||
    req.body.confirmPassword?.length < 8 ||
    req.body.confirmPassword?.length > 16
  ) {
    return next(
      new ErrorHandler("Password must be between 8 and 20 characters", 400)
    );
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const updatedUser = await database.query(
    "UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expire = NULL WHERE id = $2 RETURNING *",
    [hashedPassword, user.rows[0].id]
  );
  sendToken(updatedUser.rows[0], 200, "Password Reset Successfully", res);
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }
  const isPasswordMatched = await bcrypt.compare(
    currentPassword,
    req.user.password
  );
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Current Password is incorrect", 400));
  }
  if (newPassword !== confirmNewPassword) {
    return next(new ErrorHandler("New Passwords do not match", 400));
  }
  if (
    newPassword.length < 8 ||
    newPassword.length > 16 ||
    confirmNewPassword.length < 8 ||
    confirmNewPassword.length > 16
  ) {
    return next(
      new ErrorHandler("Password must be between 8 and 16 characters", 400)
    );
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await database.query("UPDATE users SET password = $1 WHERE id = $2", [
    hashedPassword,
    req.user.id,
  ]);
  res.status(200).json({
    success: true,
    message: "Password Updated Successfully",
  });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }
  if (name.trim().length === 0 || email.trim().length === 0) {
    return next(new ErrorHandler("Fields cannot be empty", 400));
  }
  let avatarData = {};
  if (req.files && req.files.avatar) {
    const { avatar } = req.files;
    if (req.user?.avatar?.public_id) {
      await cloudinary.uploader.destroy(req.user.avatar.public_id);
    }

    const newProfileImage = await cloudinary.uploader.upload(
      avatar.tempFilePath,
      {
        folder: "Ecommerce_Avatar",
        width: 150,
        crop: "scale",
      }
    );
    avatarData = {
      public_id: newProfileImage.public_id,
      url: newProfileImage.secure_url,
    };
  }

  let user;
  if (Object.keys(avatarData).length === 0) {
    user = await database.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, req.user.id]
    );
  } else {
    user = await database.query(
      "UPDATE users SET name = $1, email = $2, avatar = $3 WHERE id = $4 RETURNING *",
      [name, email, avatarData, req.user.id]
    );
  }

  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully",
    user: user.rows[0],
  });
});
