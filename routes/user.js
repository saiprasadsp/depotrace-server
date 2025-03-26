import express from "express";
const router = express.Router();

import {
  ensureAuth,
  checkAdmin
} from "./verifyJwtToken.js";
import {
  getLoggedInUser,
  getAllUsers,
  getAllActiveUsers,
  getSingleUser,
  editUserAction,
  deleteUserAction
} from "../controllers/userController.js";

import ConvertIntToMonth from "../helpers/ConvertIntToMonth.js";
import User from "../models/User.js";

router.get('/', ensureAuth, getAllUsers);
router.get('/me', ensureAuth, getLoggedInUser);

router.get('/active', ensureAuth, getAllActiveUsers);
router.get('/single/:id', getSingleUser);
router.get('/delete/:id', [ensureAuth, checkAdmin], deleteUserAction);

router.patch('/edit-user', ensureAuth, editUserAction);

router.get(
  '/group/group-by-month',
  [ensureAuth, checkAdmin],
  async (req, res) => {
    try {
      const users = await User.aggregate([
        {
          $group: {
            // _id: '$_id',
            _id: { month: { $month: '$date' } },
            count: { $sum: 1 }
          }
        }
      ]);

      const response = users.map((user) => ({
        month: ConvertIntToMonth(user._id.month),
        count: user.count
      }));

      return res.json(response);
      // console.log(user);
    } catch (err) {
      return res.status(400).json({ error_msg: err });
    }
  }
);

//module.exports = router;
export default router;
