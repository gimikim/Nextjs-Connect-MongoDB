const mongoose = require('mongoose');

// Manually load .env if fs is available, or just use the URI from the environment if it exists.
// Since I can't easily install dotenv, I'll try to find the URI.
// Or I can read .env file directly.

const fs = require('fs');
const path = require('path');

function getMongoUri() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI=(.*)/);
    return match ? match[1].trim() : null;
  } catch (e) {
    return null;
  }
}

const uri = getMongoUri();
if (!uri) {
  console.error('MONGODB_URI not found in .env');
  process.exit(1);
}

mongoose.connect(uri)
  .then(async () => {
    const products = await mongoose.connection.db.collection('product').find({}).toArray();
    console.log(`Total products: ${products.length}`);
    if (products.length > 0) {
      console.log('Sample product fields:', Object.keys(products[0]));
      console.log('Sample product category:', products[0].category);
      console.log('Sample product isAvailable:', products[0].isAvailable);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
