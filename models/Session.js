import mongoose from "mongoose";
const SessionSchema = new mongoose.Schema(
  {
    depositionOf: String,
    statusID: String,
    classType: String,
    meeting_required: String,
    created:Date,
    started: Date,
    finished: Date,
    role:String,
    totalUsers:Number,
    Members:Number,
    Witness:Number,
    TemporaryWitness:Number,
    WitnessMember:Number,
    Guest:Number,
    ID:Number,
  },
  { timestamps: true }
);

const Session = mongoose.model("depositionstats", SessionSchema);
export default Session;
