import express from "express";
const router = express.Router();


import { ensureAuth } from "./verifyJwtToken.js";

router.get('/', ensureAuth, (req, res) => {
  res.json({ posts: { title: 'My first post', content: req.user } });
});

//module.exports = router;
export default router;
