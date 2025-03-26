import User from "../models/User.js";

// export const getUser = async (query) => {
//   try {
//     const user = await User.findOne(query).select('+password');
//     if (!user || !user.isActive) {
//       throw Error('Email does not exist');
//     }

//     return user;
//   } catch (err) {
//     throw Error(err);
//   }
// };

export const getUser = async (query) => {
  try {
    const user = await User.findOne(query).select('+password');
    if (!user) {
      throw new Error('Error : Email does not exist');
    }
    if (!user.isActive) {
      throw new Error('Error : User is not active');
    }

    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};

export const getAndEditUser = async (query, newData) => {
  try {
    const user = await User.findOneAndUpdate(query, newData, {
      new: true,
      runValidators: true
    });

    return user;
  } catch (err) {
    throw Error(err);
  }
};

export const getSingleUserService = async (query) => {
  try {
    const user = await User.findOne(query).select('+password');
    return user;
  } catch (err) {
    throw Error(err);
  }
};

export const getUsers = async (query) => {
  try {
    const users = await User.find(query).find({ role: ['member', 'staff'] });
    return users;
  } catch (err) {
    throw Error(err);
  }
};

export const getActiveUsers = async (query) => {
  try {
    const user = await User.find(query).find({ role: ['member', 'staff'] });
    return user;
  } catch (err) {
    throw Error(err);
  }
};

export const getChangePassword = async (query, newData) => {
  // console.log(query,newData);
  try {
    const user = await User.updateOne({email: query},
    {$set: {'password': newData,
    }}, {upsert: true})
    // console.log(user);
    return user;
  } catch (err) {
    throw Error(err);
  }
};

