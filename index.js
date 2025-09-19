const express = require('express')
const { createHandler } = require('graphql-http/lib/use/express')
const { buildSchema } = require('graphql')
var cors = require('cors')

const products = require('./data/products')

const schema = buildSchema(`
  type Query {
    products: [Product!]!
    product(id: ID!): Product
    "Schema version"
    version: String
  }

  type Mutation {
    addProduct(product: ProductInput!): Product
  }

  type Product {
    id: ID!
    title: String!
    price: Float!
    description: String!
    category: String!
    image: String!
    rating: Rating!
  }

  type Rating {
    rate: Float!
    count: Int!
  }

  input ProductInput {
    title: String!
    price: Float!
    description: String!
    category: String!
    image: String!
    rate: Float!
    count: Int!
  }
`)

const app = express()
const expressWs = require('express-ws')(app);

const root = {
  version: () => '1.0.0',

  product({id}) {
    const product = products.find(product => product.id == id)
    return product
  },

  products: () => products,

  addProduct({ product }) {
    const newRating = {
        'rate': product.rate,
        'count': product.count
    }

    const newProduct = {
      'id': products.length + 1,
      'title': product.title,
      'price': product.price,
      'description': product.description,
      'category': product.category,
      'image': product.image,
      'rating': newRating
    }

    products.push(newProduct)

    broadcast(makeEvent('updateProducts', products))

    return root.product({id: newProduct.id})
  }
}

app.use(cors())

app.use('/graphql', createHandler({
  schema: schema,
  rootValue: root
}))

const port = 4000
app.listen(port)
console.log(`Server started at ${port} port.`)

function broadcast(message) {
  expressWs.getWss().clients.forEach(c => c.send(message))
}

function makeEvent(eventName, data = null) {
  return JSON.stringify({ event: eventName, data })
}
