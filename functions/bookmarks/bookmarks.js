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
// const authors = [
//   {
//     id: 1,
//     url: "https://github.com/gatsbyjs/gatsby-starter-hello-world",
//     description: "this is a github gatsby official repository",
//   },
//   {
//     id: 2,
//     url: "https://github.com/gatsbyjs/gatsby-starter-hello-world",
//     description: "this is a github gatsby official repository",
//   },
//   {
//     id: 3,
//     url: "https://github.com/gatsbyjs/gatsby-starter-hello-world",
//     description: "this is a github gatsby official repository",
//   },
// ]
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
            q.Paginate(q.Documents(q.Collection("tech"))),
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
          q.Create(q.Collection("tech"), {
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
          q.Delete(q.Ref(q.Collection("tech"), id))
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
