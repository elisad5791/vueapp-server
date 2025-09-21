import express from 'express'
import { createHandler } from 'graphql-http/lib/use/express'
import { buildSchema } from 'graphql'
import cors from 'cors'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { products } from './data/products.js'
import { Product, Rating, ProductArgs, AddProductArgs } from './types'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

io.on('connection', (socket) => {
  console.log('new connection', socket.id)

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });
});

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

const root = {
  version: ():string => '1.0.0',

  product({ id }: ProductArgs): Product|undefined {
    const product = products.find(product => product.id == parseInt(id))
    return product
  },

  products: (): Product[] => products,

  addProduct({ product }: AddProductArgs): Product | undefined {
    const newRating: Rating = {
        'rate': product.rate,
        'count': product.count
    }

    const newProduct: Product = {
      'id': products.length + 1,
      'title': product.title,
      'price': product.price,
      'description': product.description,
      'category': product.category,
      'image': product.image,
      'rating': newRating
    }

    products.push(newProduct)

    io.emit('update-products', JSON.stringify(products))

    return root.product({ id: newProduct.id.toString() })
  }
}

app.use(cors())

app.use('/images', express.static('images'))

app.use('/graphql', createHandler({
  schema: schema,
  rootValue: root
}))

const port = 4000
httpServer.listen(port)
console.log(`Server started at ${port} port.`)
console.log('WS Server is up')
