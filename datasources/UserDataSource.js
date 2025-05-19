import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../schema/utils/auth.js';
import { GraphQLError } from 'graphql';

class UserDataSource {
  async getUsers() {
    return await User.find({});
  }

  async getUserById(id) {
    return await User.findById(id);
  }

  async register(username, email, password) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new GraphQLError('User already exists with this email', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user);
    return { token, user };
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new GraphQLError('User not found', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new GraphQLError('Invalid password', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const token = generateToken(user);
    return { token, user };
  }

  async updateUser(id, userData) {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  }

  async deleteUser(id) {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }
}

export default UserDataSource;