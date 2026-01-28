// class that creates and login users to the database
import { userModel } from "./user_schema";
import bcrypt from 'bcrypt';
import mongoose from "mongoose";



export const userRepo = {
  createUser: async (userData: {email: string; password: string, username: string}) => {
    // hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    userData.password = hashedPassword;
    const user = new userModel(userData);
    return await user.save();
  },


  loginUser: async(email: string, password: string) => {
    const user =  await userModel.findOne({email, password});
    // compare hashed passwords
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      } 
    }
    return user;
  },

  updateUser: async (userId: string, socketId: string, isOnline: boolean) => {
    return await userModel.findByIdAndUpdate(new mongoose.Types.ObjectId(userId), {socketId}, {new: true});
  },

  upgradeToAgent: async (userId: string) => {
    return await userModel.findByIdAndUpdate(new mongoose.Types.ObjectId(userId), {role: 'agent'}, {new: true});
  },

  fetchUserByRole: async (role: string) => {
    const user = await userModel.find({role});
    return user;
  },

  fetchAllUsers: async (userId: string) => {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
     }

    const users = await userModel.find({
      _id: { $ne: new mongoose.Types.ObjectId(userId) }
    });
    return users;
  }
};