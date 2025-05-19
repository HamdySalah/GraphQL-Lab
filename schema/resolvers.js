import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Todo from '../models/Todo.js';
import { authenticate } from './utils/auth.js';

const resolvers = {
  Query: {
    hello: () => 'Hello World!',
    me: async (_, __, { token }) => {
      try {
        const userId = authenticate(token);
        
        return await User.findById(userId);
      } catch (error) {
        console.error('Error in me resolver:', error);
        throw error;
      }
    },
    todos: async (_, __, { token }) => {
      try {
        const userId = authenticate(token);
        return await Todo.find({ user: userId });
      } catch (error) {
        console.error('Error in todos resolver:', error);
        throw error;
      }
    },
    todo: async (_, { id }, { token }) => {
      try {
        const userId = authenticate(token);
        
        const todo = await Todo.findById(id);
        
        if (!todo || todo.user.toString() !== userId) {
          throw new Error('Todo not found');
        }
        
        return todo;
      } catch (error) {
        console.error('Error in todo resolver:', error);
        throw error;
      }
    }
  },
  Mutation: {
    register: async (_, { username, email, password }) => {
      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error('User already exists');
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
          username,
          email,
          password: hashedPassword
        });
        
        await user.save();
        
        const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '1d' }
        );
        
        return { token, user };
      } catch (error) {
        console.error('Error in register resolver:', error);
        throw error;
      }
    },
    login: async (_, { email, password }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error('Invalid credentials');
        }
        

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '1d' }
        );
        
        return { token, user };
      } catch (error) {
        console.error('Error in login resolver:', error);
        throw error;
      }
    },
    createTodo: async (_, { title, description }, { token }) => {
      try {
        const userId = authenticate(token);

        const todo = new Todo({
          title,
          description,
          completed: false,
          user: userId
        });
        
        await todo.save();
        
        return todo;
      } catch (error) {
        console.error('Error in createTodo resolver:', error);
        throw error;
      }
    },
    updateTodo: async (_, { id, title, description, completed }, { token }) => {
      try {
        const userId = authenticate(token);
      
        const todo = await Todo.findById(id);
        if (!todo || todo.user.toString() !== userId) {
          throw new Error('Todo not found');
        }

        if (title !== undefined) todo.title = title;
        if (description !== undefined) todo.description = description;
        if (completed !== undefined) todo.completed = completed;
        
        await todo.save();
        
        return todo;
      } catch (error) {
        console.error('Error in updateTodo resolver:', error);
        throw error;
      }
    },
    deleteTodo: async (_, { id }, { token }) => {
      try {
        const userId = authenticate(token);
        const todo = await Todo.findById(id);
        
        if (!todo || todo.user.toString() !== userId) {
          throw new Error('Todo not found');
        }
        
        await Todo.findByIdAndDelete(id);
        
        return true;
      } catch (error) {
        console.error('Error in deleteTodo resolver:', error);
        throw error;
      }
    }
  },
  User: {
    todos: async (parent) => {
      try {
        return await Todo.find({ user: parent.id });
      } catch (error) {
        console.error('Error in User.todos resolver:', error);
        throw error;
      }
    }
  },
  Todo: {
    user: async (parent) => {
      try {
        return await User.findById(parent.user);
      } catch (error) {
        console.error('Error in Todo.user resolver:', error);
        throw error;
      }
    }
  }
};

export default resolvers;



