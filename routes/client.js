import express from "express";
import {
  getSessions,
  getParsedLogs,
  getCustomers,
  getUsers,
  getTransactions,
  getGeography,
  putAddUser,
  getadmin
} from "../controllers/client.js";

const router = express.Router();

router.get("/sessions", getSessions);
router.get("/parsedlogs", getParsedLogs);
router.get("/users", getUsers);
router.get("/customers", getCustomers);
router.get("/transactions", getTransactions);
router.get("/geography", getGeography);
router.get("/geography", getGeography);
router.post("/getadmin", getadmin);
router.put("/adduser", putAddUser);


export default router;
