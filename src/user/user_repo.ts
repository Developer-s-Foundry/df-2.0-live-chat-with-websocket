// class that creates and login users to the database
import { userModel } from "./user_schema";
import bcrypt from 'bcrypt';

export const userRepo = {
  createUser: async (userData: {email: string; password: string}) => {
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
      if (isMatch) {
        throw new Error('Invalid credentials');
      } 
    }
    return user;
  }
};