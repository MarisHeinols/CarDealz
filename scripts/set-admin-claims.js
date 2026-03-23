const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

/**
 * USAGE:
 * 1. Download service-account.json from Firebase Console (Settings -> Service Accounts)
 * 2. Place it in the root of the project.
 * 3. Run: node scripts/set-admin-claims.js <USER_UID>
 */

const UID = process.argv[2];
const SA_PATH = path.join(__dirname, "..", "service-account.json");

if (!UID) {
  console.error("Please provide a UID as an argument.");
  process.exit(1);
}

if (!fs.existsSync(SA_PATH)) {
  console.error(`Service account file not found at ${SA_PATH}`);
  console.error("Please download it from Firebase Console (Settings -> Service Accounts) and rename it to 'service-account.json'.");
  process.exit(1);
}

const serviceAccount = require(SA_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim(uid) {
  try {
    const user = await admin.auth().getUser(uid);
    console.log(`Found user: ${user.email} (${uid})`);

    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log("SUCCESS: Custom 'admin' claim set to true.");
    console.log("Please ask the user to log out and log back in to see the changes.");
  } catch (error) {
    console.error("Error setting admin claim:", error);
  } finally {
    process.exit();
  }
}

setAdminClaim(UID);
