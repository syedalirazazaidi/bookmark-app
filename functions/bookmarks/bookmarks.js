const { ApolloServer, gql } = require("apollo-server-lambda")
var dotenv = require("dotenv")
dotenv.config()
const faunadb = require("faunadb"),
  q = faunadb.query

const typeDefs = gql`
  type Query {
    bookmark: [Bookmark!]
  }
  type Bookmark {
    id: ID!
    url: String!
    description: String!
  }
  type Mutation {
    addBookmark(url: String!, description: String!): Bookmark
    removeBookmark(id: ID!): Bookmark
  }
`

const resolvers = {
  Query: {
    bookmark: async (parent, args, context) => {
      try {
        // access faunadb
        const client = new faunadb.Client({
          secret: process.env.FAUNA_SERVER_SECRET,
        })

        const result = await client.query(
          q.Map(
            q.Paginate(q.Documents(q.Collection("book"))),
            q.Lambda(x => q.Get(x))
          )
        )
        return result.data.map(item => {
          return {
            id: item.ref.id,
            url: item.data.url,
            description: item.data.description,
          }
        })
      } catch (error) {
        console.log(error)
      }
    },
  },

  Mutation: {
    addBookmark: async (_, { url, description }) => {
      try {
        const client = new faunadb.Client({
          secret: process.env.FAUNA_SERVER_SECRET,
        })

        const result = await client.query(
          q.Create(q.Collection("book"), {
            data: {
              url: url,
              description: description,
            },
          })
        )
        return result.ref.data
      } catch (error) {
        console.log(error)
      }
    },
    removeBookmark: async (_, { id }) => {
      console.log(id, "IDENTITY")
      try {
        const client = new faunadb.Client({
          secret: process.env.FAUNA_SERVER_SECRET,
        })

        const result = await client.query(
          q.Delete(q.Ref(q.Collection("book"), id))
        )

        console.log("id", id)
        console.log(result)
      } catch (error) {
        console.log(error)
      }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})
exports.handler = server.createHandler()

// "graphql": "^15.5.0",

// "dependencies": {
//   "apollo-server": "^2.20.0",
//   "apollo-server-lambda": "^2.17.0",
//   "faunadb": "^3.0.1",
//   "graphql": "^14.7.0"
// }
// "apollo-server": "^2.22.2",
// "apollo-server-lambda": "^2.22.2",
// "graphql": "^15.5.0"

// "apollo-server": "^2.20.0",
//     "apollo-server-lambda": "^2.17.0",
//     "graphql": "^14.7.0",
//     "faunadb": "^3.0.1",
