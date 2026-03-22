/* eslint-disable */
// @ts-nocheck
const mongoose = require('mongoose')

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nextjs-connect')
  const db = mongoose.connection.useDb('test') // Nextjs-Connect-MongoDB might be 'test' by default
  const orders = await mongoose.connection.collection('orders').find({}).toArray()
  console.log(`Orders count: ${orders.length}`)
  if (orders.length > 0) {
    console.log(`Sample order ID: ${orders[0]._id}`)
  }
  mongoose.disconnect()
}

main().catch(console.error)
