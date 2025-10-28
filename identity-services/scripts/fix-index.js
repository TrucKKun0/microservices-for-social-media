require("dotenv").config();
const mongoose = require("mongoose");

async function fixIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get the User collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    // List all indexes
    console.log("\nCurrent indexes:");
    const indexes = await usersCollection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Drop the corrupted index if it exists
    try {
      await usersCollection.dropIndex("usernma_1");
      console.log("\n✓ Successfully dropped corrupted index 'usernma_1'");
    } catch (err) {
      if (err.code === 27) {
        console.log("\n✓ Index 'usernma_1' doesn't exist (already fixed)");
      } else {
        throw err;
      }
    }

    // List indexes after fix
    console.log("\nIndexes after fix:");
    const indexesAfter = await usersCollection.indexes();
    console.log(JSON.stringify(indexesAfter, null, 2));

    console.log("\n✓ Index fix completed successfully!");
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error fixing index:", error);
    process.exit(1);
  }
}

fixIndex();

