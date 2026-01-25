import mongooseConnection from "../config/database";

const userSchema = new mongooseConnection.Schema({
    email: String,
    username: String,
    password: String
});

const User = mongoose.model('User', userSchema);

async function run() {
  await User.create({ username: 'alice', password: '1234' }); // <— first insert
  console.log('Inserted user');
}

run();
