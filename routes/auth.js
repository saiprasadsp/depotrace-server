/* eslint-disable no-underscore-dangle */
import express from "express";
const router = express.Router();
//const { verifiedFunction: ensureAuth } = require('./verifyJwtToken');

import {  ensureAuth } from "./verifyJwtToken.js";

import {
  registerUser,
  loginUser,
  verifyUserRegistration,
  resendVerificationToken,
  sendPasswordResetToken,
  passwordReset,
  changePassword,
  forgotPassword,
  getParsedLogs,
  getSessions
} from "../controllers/authControllers.js";

router.post('/forgotPassword', forgotPassword)

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/verify', verifyUserRegistration);
router.post('/parsed-Logs', getParsedLogs);
router.post('/sessions', getSessions);

router.post('/resend-verification-token', resendVerificationToken);

// Password reset token
router.post('/send-password-reset-token', sendPasswordResetToken);

// Password reset
router.post('/password-reset', passwordReset);

// User change password
router.post('/change-password', changePassword);//ensure auth has been removed

//module.exports = router;
export default router;
