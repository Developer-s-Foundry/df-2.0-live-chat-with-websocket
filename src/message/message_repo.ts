// create new file message_repo.ts
import { IMessage, MessageModel } from '../message/message_schema';

export class MessageRepository {
  // Create a new message
  async createMessage(senderId: string, receiverId: string, message: string): Promise<IMessage> {
    const newMessage = new MessageModel({ senderId, receiverId, message });
    return await newMessage.save();
  }

  // Get messages between two users
  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<IMessage[]> {
    return await MessageModel.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ]
    }).sort({ createdAt: 1 });
  }
}