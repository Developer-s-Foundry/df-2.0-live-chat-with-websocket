import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/ecommerce'); // ecommerce doesn't exist yet

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model('User', userSchema);

async function run() {
  await User.create({ username: 'alice', password: '1234' }); // <— first insert
  console.log('Inserted user');
}

run();
