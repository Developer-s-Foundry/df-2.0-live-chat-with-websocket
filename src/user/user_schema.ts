import mongoose, {Schema, Document} from 'mongoose';

// creat an interface representing a user document in MongoDB
export interface IUser extends Document {
  socketId: string;
  username: string;
  email: string;
  password: string;
  role: string;
  isOnline?: boolean;
}

// define the user schema
const userSchema: Schema = new Schema({
  socketId: {type: String, required: false},
  username: {type: String, required: true},
  email: {type: String, required: true, 
    unique: true, lowercase: true,
  match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"]},
  password: {type: String, required: true},
  role: {type: String, default: 'customer'},
  isOnline: {type: Boolean, default: false},
    },
  { 
    timestamps: true
  }
);

// create and export the user model
export const userModel = mongoose.model<IUser>('User', userSchema);

