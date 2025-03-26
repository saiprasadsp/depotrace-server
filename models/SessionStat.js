import mongoose from "mongoose";

const SessionStatSchema = new mongoose.Schema(
  {
    sessionId: String,
    yearlySessionsTotal: Number,
    yearlyTotalUsers: Number,
    year: Number,
    monthlyData: [
      {
        month: String,
        totalSessions: Number,
        totalUsers: Number,
      },
    ],
    dailyData: [
      {
        date: String,
        totalSessions: Number,
        totalUsers: Number,
      },
    ],
  },
  { timestamps: true }
);

const SessionStat = mongoose.model("SessionStat", SessionStatSchema);
export default SessionStat;
