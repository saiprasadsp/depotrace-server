import User from "../models/User.js";
import OverallStat from "../models/OverallStat.js";
import Transaction from "../models/Transaction.js";

export const getUser = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({
      message: error.message
    });
  }
};
export const getDashboardStats = async (req, res) => {
  try {
    // hardcoded values
    // const currentMonth = "September";
    // const currentYear = 2023;
    // const currentDay = "2021-04-10";
    /* Recent Transactions */
    const transactions = await Transaction.find()
      .limit(50)
      .sort({
        createdOn: -1
      });

    /* Overall Stats */
    const overallStat = await OverallStat.find();
    const {
      totalSessions,
      totalUsers,
      totalCases,
      yearlyData,
      monthlyData,
      dailyData,
      casesData,
      sessionsCountByCategory,
    } = overallStat[0];

    // const thisMonthStats = overallStat[0].monthlyData.find(({ month }) => {
    //   return month === currentMonth;
    // });
    // console.log("months",thisMonthStats)
    // const todayStats = overallStat[0].dailyData.find(({ date }) => {
    //   return date === currentDay;
    // });
    // console.log("today",todayStats);

    res.status(200).json({
      totalSessions,
      totalUsers,
      totalCases,
      dailyData,
      monthlyData,
      yearlyData,
      casesData,
      sessionsCountByCategory,
      // thisMonthStats,
      // todayStats,
      transactions,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message
    });
  }
};