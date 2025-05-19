const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    email: String!
    todos: [Todo!]
  }

  type Todo {
    id: ID!
    title: String!
    description: String
    completed: Boolean!
    user: User!
    createdAt: String
    updatedAt: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    hello: String
    me: User
    todos: [Todo!]!
    todo(id: ID!): Todo
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createTodo(title: String!, description: String): Todo!
    updateTodo(id: ID!, title: String, description: String, completed: Boolean): Todo!
    deleteTodo(id: ID!): Boolean!
  }
`;

export default typeDefs;
