import Session from "../models/Session.js";
import SessionStat from "../models/SessionStat.js";
import ParsedLog from "../models/ParsedLog.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import getCountryIso3 from "country-iso-2-to-3";

export const getSessions = async (req, res) => {
  console.log("----------------->getSessions");
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
    // console.log(sessionsWithStats);
    let filesMatched=[]
    const currentDate = new Date()
    currentDate.setDate(currentDate.getDate()-30)
    let dateString = currentDate.toISOString().split('T')[0]
    const startDate = new Date().toISOString().split("T")[0]
    const endDate = new Date(dateString).toISOString().split("T")[0]
    Object.values(sessionsWithStats).forEach((item)=>{
      const sliced = item.created.toISOString().split("T")[0]
      if (sliced <= startDate && sliced  >=endDate) {
        filesMatched.push(item)
     }
   })
    res.status(200).json(filesMatched);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getParsedLogs = async (req, res) => {
  let filesMatched = [];
  const startDate = new Date().toISOString().split("T")[0]
  const endDate = new Date().toISOString().split("T")[0]
  try {
    const parsedlogs = await ParsedLog.find();
    Object.values(parsedlogs).forEach((item)=>{
       const sliced = item.eventtimestamp.slice(0,10)
       if (sliced >= startDate && sliced  <=endDate) {
        filesMatched.push(item)
      }
    })
    res.status(200).json(filesMatched);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ role: "user" }).select("-password");
    // console.log("------------------>",customers.length);
    res.status(200).json(customers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    console.log("------------------>",users);
    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};


export const putAddUser = async (req, res) => {
  //  console.log("-------putAddUser----------->",req.body);
  try {
    const output = await User.insertMany(req.body);
    // console.log("-------putAddUser insertMany----------->",output);
    
    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    // sort should look like this: { "field": "userId", "sort": "desc"}
    const { page = 1, pageSize = 20, sort = null, search = "" } = req.query;

    // formatted sort should look like { userId: -1 }
    const generateSort = () => {
      const sortParsed = JSON.parse(sort);
      const sortFormatted = {
        [sortParsed.field]: (sortParsed.sort = "asc" ? 1 : -1),
      };

      return sortFormatted;
    };
    const sortFormatted = Boolean(sort) ? generateSort() : {};

    const transactions = await Transaction.find({
      $or: [
        { cost: { $regex: new RegExp(search, "i") } },
        { userId: { $regex: new RegExp(search, "i") } },
      ],
    })
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize);

    const total = await Transaction.countDocuments({
      name: { $regex: search, $options: "i" },
    });

    res.status(200).json({
      transactions,
      total,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getGeography = async (req, res) => {
  try {
    const users = await User.find();

    const mappedLocations = users.reduce((acc, { country }) => {
      const countryISO3 = getCountryIso3(country);
      if (!acc[countryISO3]) {
        acc[countryISO3] = 0;
      }
      acc[countryISO3]++;
      return acc;
    }, {});

    const formattedLocations = Object.entries(mappedLocations).map(
      ([country, count]) => {
        return { id: country, value: count };
      }
    );

    res.status(200).json(formattedLocations);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getadmin = async (req, res) => {
  const {email} = req.body
  try {
    const users = await User.find({email:email});
    console.log("------------------>",users[0].organization);
    res.status(200).json(users[0].organization);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};