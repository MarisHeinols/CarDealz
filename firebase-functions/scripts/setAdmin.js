const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

/**
 * USAGE:
 * 1. Go to Firebase Console -> Settings -> Service Accounts
 * 2. Click "Generate new private key", download it.
 * 3. Place it in this folder (firebase-functions/scripts/) as "service-account.json"
 * 4. From the root of the project, run: 
 *    node firebase-functions/scripts/setAdmin.js [USER_UID]
 */

const UID = process.argv[2];
const SA_PATH = path.join(__dirname, "service-account.json");

if (!UID) {
  console.error("❌ ERROR: Please provide a UID as an argument.");
  console.log("Example: node firebase-functions/scripts/setAdmin.js my-user-uid-123");
  process.exit(1);
}

if (!fs.existsSync(SA_PATH)) {
  console.error(`❌ ERROR: Service account file not found at ${SA_PATH}`);
  console.log("Please download it from Firebase Console (Settings -> Service Accounts) and place it here as 'service-account.json'.");
  process.exit(1);
}

const serviceAccount = require(SA_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim(uid) {
  try {
    const user = await admin.auth().getUser(uid);
    console.log(`✅ Found user: ${user.email} (${uid})`);

    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log("🚀 SUCCESS: Custom 'admin' claim set to true.");
    console.log("Note: After running this, please LOG OUT and LOG BACK IN to refresh your credentials.");
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
        console.error("❌ ERROR: No user found with that UID. Check the UID and try again.");
    } else {
        console.error("❌ ERROR:", error.message);
    }
  } finally {
    process.exit();
  }
}

setAdminClaim(UID);
