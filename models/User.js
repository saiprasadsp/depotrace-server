import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    
    firstname: {
      type: String,
      required: true,
      min: 2,
      max: 100,
    },
    lastname: {
      type: String,
      required: true,
      min: 2,
      max: 100,
    },
    username: {
      type: String,
      required: true,
      min: 2,
      max: 100,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    organization: {
      type: String,
      required: true,
      min: 5,
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "superadmin",
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      max: 50,      
    },
    occupation: {
      type: String,
      required: true,
      max: 50,      
    },
    email: {
      type: String,
      required: true,
      max: 50,
      
    },
    phoneNumber: String,
    city: String,
    state: String,
    country: String,
  }
);

const User = mongoose.model("User", UserSchema);
export default User;
