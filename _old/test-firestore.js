const admin = require('firebase-admin');
const serviceAccount = require('./firebaseConfig.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testFirestore() {
  try {
    console.log('Testing Firestore connection...');
    
    // Get all carts
    const cartsSnapshot = await db.collection('carts').get();
    console.log(`Found ${cartsSnapshot.size} carts:`);
    
    cartsSnapshot.forEach(doc => {
      console.log(`  ${doc.id}:`, doc.data());
    });
    
    // Get all rentals
    const rentalsSnapshot = await db.collection('rentals').get();
    console.log(`\nFound ${rentalsSnapshot.size} rentals`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

testFirestore();
