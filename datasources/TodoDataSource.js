import Todo from '../models/Todo.js';
import User from '../models/User.js';

const { GraphQLError } = require('graphql');

class TodoDataSource {
  constructor(context) {
    this.context = context;
  }

  async getTodos() {
    return await Todo.find({});
  }

  async getTodoById(id) {
    return await Todo.findById(id);
  }

  async getUserTodos(userId) {
    return await Todo.find({ user: userId });
  }

  async addTodo(todoData) {
    const { user } = this.context;
    
    const todo = new Todo({
      ...todoData,
      user: user.id
    });
    
    const savedTodo = await todo.save();
    
    await User.findByIdAndUpdate(
      user.id,
      { $push: { todos: savedTodo.id } }
    );
    
    return savedTodo;
  }

  async updateTodo(id, todoData) {
    const { user } = this.context;
    
    const todo = await Todo.findById(id);
    if (!todo) {
      throw new GraphQLError('Todo not found', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    
    if (todo.user.toString() !== user.id) {
      throw new GraphQLError('Not authorized to update this todo', {
        extensions: { code: 'FORBIDDEN' },
      });
    }
    
    return await Todo.findByIdAndUpdate(id, todoData, { new: true });
  }

  async deleteTodo(id) {
    const { user } = this.context;
    
    const todo = await Todo.findById(id);
    if (!todo) {
      throw new GraphQLError('Todo not found', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    
    if (todo.user.toString() !== user.id) {
      throw new GraphQLError('Not authorized to delete this todo', {
        extensions: { code: 'FORBIDDEN' },
      });
    }
    
    await User.findByIdAndUpdate(
      user.id,
      { $pull: { todos: id } }
    );
    
    const result = await Todo.findByIdAndDelete(id);
    return !!result;
  }
}

module.exports = TodoDataSource;