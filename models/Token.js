import mongoose from "mongoose";
const { Schema, model } = mongoose

const TokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  _userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 43200,
  },
})


const Token = mongoose.model("Token", TokenSchema);
export default Token;

