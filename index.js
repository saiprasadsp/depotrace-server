import express from 'express';
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import clientRoutes from "./routes/client.js";
import generalRoutes from "./routes/general.js";
import managementRoutes from "./routes/management.js";
import salesRoutes from "./routes/sales.js";

import postRoute from "./routes/post.js";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/user.js";

// data imports
import User from "./models/User.js";
import Token from "./models/Token.js";
import Customer from "./models/Customer.js";
import ParsedLog from "./models/ParsedLog.js";
import Session from "./models/Session.js";
import SessionStat from "./models/SessionStat.js";
import Transaction from "./models/Transaction.js";
import OverallStat from "./models/OverallStat.js";
import AffiliateStat from "./models/AffiliateStat.js";
import {
  dataCustomer,
  dataUser,
  dataToken,
  dataSession,
  dataSessionStat,
  dataTransaction,
  dataOverallStat,
  dataAffiliateStat,
  dataParsedLog,
} from "./data/index.js";




// const cors = require('cors');
//const path = require('path');


/* CONFIGURATION */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Norgan
app.use(morgan('tiny'));

// Middleware
// app.use(express.json())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

/* ROUTES */
// Route authentication
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
//app.use('/api/v1', docsRoute);
app.use('/api/post', postRoute);

app.use("/client", clientRoutes);
app.use("/general", generalRoutes);
app.use("/management", managementRoutes);
app.use("/sales", salesRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 9000;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ONLY ADD DATA ONE TIME */
    // AffiliateStat.insertMany(dataAffiliateStat);
    // OverallStat.insertMany(dataOverallStat);
    // Session.insertMany(dataSession);
    // SessionStat.insertMany(dataSessionStat);
    // Transaction.insertMany(dataTransaction);
    User.insertMany(dataUser);
    // Token.insertMany(dataToken);
    // Customer.insertMany(dataCustomer);
    // ParsedLog.insertMany(dataParsedLog);

  })
  .catch((error) => console.log(`${error} did not connect`));
