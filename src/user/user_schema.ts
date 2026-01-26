import mongoose, {Schema, Document} from 'mongoose';

// creat an interface representing a user document in MongoDB
export interface IUser extends Document {
  socketId: string;
  email: string;
  password: string;
  role: string;
}

// define the user schema
const userSchema: Schema = new Schema({
  socketId: {type: String, required: false},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  role: {type: String, default: 'customer'},
    },
  { 
    timestamps: true
  }
);

// create and export the user model
export const userModel = mongoose.model<IUser>('User', userSchema);

