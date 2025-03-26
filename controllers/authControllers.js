/* eslint-disable no-useless-return */
/* eslint-disable no-underscore-dangle */

import nodemailer from 'nodemailer'
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ParsedLog from "../models/ParsedLog.js";
// import generator from 'generate-password'
import {
  registerValidation,
  loginValidation,
  tokenValidation,
  ensureEmailValidation,
  passwordResetValidation,
  passwordChangeValidation,
  userEditValidation
} from "../utils/validation.js";

import randomTokenGen from "../utils/generateToken.js";
import passwordEncrypt from "../utils/passwordEncrypt.js";
import {
  getChangePassword,
  getUser
} from "../services/user.services.js";
import {
  getToken
} from "../services/Token.services.js";
// import { use } from 'chai';
import Session from "../models/Session.js";
import SessionStat from "../models/SessionStat.js";
const validation = {
  register: registerValidation,
  login: loginValidation,
  verifyUser: tokenValidation,
  ensureEmail: ensureEmailValidation,
  passwordReset: passwordResetValidation,
  passwordChange: passwordChangeValidation,
  editUser: userEditValidation
};

const handleValidation = (body, res, type) => {
  const {
    error
  } = validation[type](body);
  if (error) {
    throw Error(error.details[0].message);
  }
};

export const registerUser = async (req, res) => {

  // Validate data before creating a user

  //   Hash password
  try {
    await handleValidation(req.body, res, 'register');
    //   Checking if the user is already in the db
    const emailExist = await User.findOne({
      email: req.body.email
    });

    if (emailExist) {
      return res.status(400).json({
        error_msg: 'E-Mail already exists'
      });
    }
    req.body.password = await passwordEncrypt(req.body.password);

    // Create a new user
    const user = new User(req.body);

    const savedUser = await user.save();
    // Generate and send token
    const token = await randomTokenGen(savedUser);
    // const userToken = new Token({ _userId: savedUser._id, token: token })
    // await userToken.save()
    if (!token) {
      res.status(500).json({
        error_msg: 'An error occured'
      });
    }
    // Send email using sendgrid here
    return res.status(201).json({
      data: savedUser
    });
  } catch (err) {
    console.log({
      err
    });
    return res.status(400).json({
      error_msg: err.message
    });
  }
};

export const loginUser = async (req, res) => {

  console.log("--------->loginUser", req.body);
  // Validate data before creating a user
  handleValidation(req.body, res, 'login');

  try {
    //   Checking if the user is already in the db
    const user = await getUser({
      email: req.body.email
    });
    console.log("--------->loginUser");
    //   Password check
    const validPass = await bcrypt.compare(req.body.password, user.password);

    if (!validPass) {
      return res.status(400).json({
        error_msg: 'Error : Invalid password'
      });
    }
    //   Create and assign a token
    const token = jwt.sign({
        _id: user._id,
        role: user.role
      },
      process.env.TOKEN_SECRET
    );

    return res.status(200).json({
      access_token: token,
      roles: user.role
    });
  } catch (err) {
    return res.status(400).json({
      error_msg: err.message
    });
  }
};

// const editUserAction = (req, res) => {
//   handleValidation(req.body, res, 'editUser');
// };

export const verifyUserRegistration = async (req, res) => {
  // Validate the incoming data
  handleValidation(req.body, res, 'verifyUser');
  try {
    const token = await getToken({
      token: req.body.token
    });
    const user = await getUser({
      email: req.body.email
    });

    if (user.isActive) {
      return res.status(400).json({
        error_msg: 'User already verified'
      });
    }

    // This should not even happen. I am checking if the user email matches the user id in the token
    if (!(token._userId !== user._id)) {
      return res.status(400).json({
        error_msg: 'Token does not match user'
      });
    }

    user.isActive = true;
    await user.save();
    await token.remove();
    return res.status(200).json({
      data: 'success'
    });
  } catch (err) {
    return res.status(400).json({
      error_msg: err.message
    });
  }
};

export const resendVerificationToken = async (req, res) => {
  try {
    handleValidation(req.body, res, 'ensureEmail');

    const {
      email
    } = req.body;
    const user = await getUser({
      email
    });
    if (user.isActive) {
      return res
        .status(400)
        .json({
          error_msg: 'This user is already verified'
        });
    }
    // Generate and send token
    const token = await randomTokenGen(user);
    // send email using the token to user
    return res.status(200).json({
      data: 'success'
    });
  } catch (err) {
    return res.status(400).json({
      error_msg: err.message
    });
  }
};

export const sendPasswordResetToken = async (req, res) => {
  try {
    handleValidation(req.body, res, 'ensureEmail');

    const {
      email
    } = req.body;
    const user = await getUser({
      email
    });
    // Generate and send token
    const token = await randomTokenGen(user);
    // send email to user
    return res.status(200).json({
      data: token
    });
  } catch (err) {
    return res.status(400).json({
      error_msg: err.message
    });
  }
};

export const passwordReset = async (req, res) => {
  try {
    const {
      email
    } = req.body;
    const user = await getUser({
      email
    });
    user.password = await passwordEncrypt(req.body.password);
    await user.save();
    return res.status(200).json({
      data_msg: 'Password has been changed successfully'
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error_msg: err.message
    });
  }
};

// export const changePassword = async (req, res) => {
//   try {
//     const { newPassword, oldPassword, admin } = req.body;
//     const user = await getUser({ _id: req.user._id });
//     if (user.role === 'admin') {
//       return res.status(401).json({ error_msg: 'Nice try' });
//     }
//     if (admin) {
//       user.password = await passwordEncrypt(newPassword);
//     } else {
//       handleValidation(req.body, res, 'passwordChange');

//       if (newPassword === oldPassword) {
//         return res.status(400).json({
//           error_msg: 'New and Current password is the same, use a new password'
//         });
//       }

//       // Ensure old password is equal to db pass
//       const validPass = await bcrypt.compare(oldPassword, user.password);

//       if (!validPass) {
//         return res.status(400).json({ error_msg: 'Current password is wrong' });
//       }
//       user.password = await passwordEncrypt(newPassword);
//     }
//     // Ensure new password not equals to old password
//     await user.save();
//     return res.json('Success');
//   } catch (err) {
//     console.log(err);
//     return res.status(400).json({ error_msg: err.message });
//   }
// };

export const forgotPassword = async (req, res) => {
  const URL = process.env.BASE_URL
  console.log(URL)
  try {
    const {
      email
    } = req.body
    console.log("merndashApi", req.body);
    const user = await getUser({
      email: email
    })
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: 'noreply@genysoft.com', // enter your mail address
        pass: 'S3mail80SS5' // enter mail password
      }
    });
    const mailData = {
      from: 'noreply@genysoft.com', // sender address
      to: email, // list of receivers
      subject: 'Depotrace - Password recovery',
      text: 'That was easy!',
      html: `<div>
        <article>Hi ${user.username},</article>
        <p>Greetings from DepoTrace.</p>
        <p>Password change request has been issued.</p>
        <p>To change the password proceed to the following link,</p>
        <a href="${URL}user/PasswordReset" style="color:red">Link to reset password</a>
        <p>Yours sincerely,<br>
         DepoTrace Admin.</p>

        </div>`,
    };
    if (user) {
      res.status(200).send({
        Message_id: "Sucess:Password reset link has been Successfully sent to your email "
      })
      transporter.sendMail(mailData, function (err, info) {
        if (err) {
          res.status(400).send({
            error_msg: err.message
          })
        } else {
          res.status(200).send({
            Message_id: "Sucess:Password reset link has been Successfully sent to your email"
          })
        }
      });
    }
  } catch (err) {
    res.status(400).send({
      error_msg: err.message
    })
  }
}

export const changePassword = async (req, res) => {
  try {
    const {
      email
    } = req.body
    // console.log(email,password);
    const user = await getUser({
      email: email
    });
    req.body.password = await passwordEncrypt(req.body.password)
    if (!user) {
      res.status(400).json({
        error_msg: 'Nice try'
      })
    }
    if (user) {
      const resetPassword = await getChangePassword(req.body.email, req.body.password);
      res.status(200).json({
        data: resetPassword.upsertedId
      })
    }
  } catch (err) {
    res.status(400).json({
      err_msg: err.message
    })
  }
};
export const getParsedLogs = async (req, res) => {
  let filesMatched = [];
  const startDate = req.body.fromDate
  const endDate = req.body.toDate
  try {
    const parsedlogs = await ParsedLog.find();
    Object.values(parsedlogs).forEach((item) => {
      const sliced = item.eventtimestamp.slice(0, 10)
      if (sliced >= startDate && sliced <= endDate) {
        filesMatched.push(item)
      }
    })
    res.status(200).json(filesMatched);
  } catch (error) {
    res.status(404).json({
      message: error.message
    });
  }
};

export const getSessions = async (req, res) => {
  const startDate = req.body.fromDate
  const endDate = req.body.toDate
  console.log(startDate, endDate);
  try {
    const sessions = await Session.find();
    const sessionsWithStats = await Promise.all(
      sessions.map(async (session) => {
        const stat = await SessionStat.find({
          sessionId: session._id,
        });
        return {
          ...session._doc,
          stat,
        };
      })
    );
    let filesMatched = []
    Object.values(sessionsWithStats).forEach((item) => {
      const sliced = item.created.toISOString().split("T")[0]
      if (sliced >= startDate && sliced <= endDate) {
        filesMatched.push(item)
      }
    })
    res.status(200).json(filesMatched);
  } catch (error) {
    res.status(404).json({
      message: error.message
    });
  }
}