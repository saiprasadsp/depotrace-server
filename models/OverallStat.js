import mongoose from "mongoose";

const OverallStatSchema = new mongoose.Schema(
  {
    totalSessions:Number,
    totalUsers:Number,
    totalCases:Number,
    yearlyData:[
      {
        totalSessions: Number,
        totalUsers: Number,
        month: String,
        year: Number,
      },
    ],
    monthlyData: [
      {
        month: String,
        totalSessions: Number,
        totalUsers: Number,
        year: Number,
      },
    ],
    dailyData: [
      {
        month: Number,
        sessiondate:Date,
        totalSessions: Number,
        totalUsers: Number,
        year: Number,
      },
    ],
    casesData: [
      {
        month: Number,
        year: Number,
        totalCases:String,
      },
    ],
    sessionsCountByCategory: [{
      sessionsCategory: String,
      sessionsCategoryCount: Number,
    }],
  },
  { timestamps: true }
);

const OverallStat = mongoose.model("OverallStats", OverallStatSchema);
export default OverallStat;