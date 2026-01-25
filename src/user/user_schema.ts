import mongoose, {Schema, Document} from 'mongoose';

// creat an interface representing a user document in MongoDB
export interface IUser extends Document {
  socketId: string;
  email: string;
  password: string;
}

// define the user schema
const userSchema: Schema = new Schema({
  socketId: {type: String, required: false},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true}
    },
  { 
    timestamps: true
  }
);

// create and export the user model
export const userModel = mongoose.model<IUser>('User', userSchema);

