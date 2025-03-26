import mongoose from "mongoose";

const ParsedLogSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: false,
      min: 2,
      max: 100,
    },
    referenceid: {
      type: String,
      required: false,
      min: 2,
      max: 100,
    },
    username: {
      type: String,
      required: false,
      max: 50,      
    },
    operationname: {
      type: String,
      required: false,
      min: 5,
    },
    direction: String,
    fromserver: String,
    toserver: String,
    status: String,
    eventtimestamp: String,
    logmessage: String
    
  },
  { timestamps: false }
);

const ParsedLog = mongoose.model("ParsedLog", ParsedLogSchema);
export default ParsedLog;
