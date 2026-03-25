const admin = require('firebase-admin');
const serviceAccount = require('./firebase-functions/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const uid = 'NZO0sglj6OUDPSCUCGo3j1TUZVk1'; // <--- PUT YOUR UID HERE
async function promoteToAdmin() {
  try {
    // 1. Set Security Claims
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    
    // 2. Update Firestore Role to 'admin' (This hides you from Businesses list)
    const db = admin.firestore();
    const update = { 
      role: 'admin', 
      dealerVerified: true, 
      dealerVerificationStatus: 'approved' 
    };
    
    await db.doc('publicUsers/' + uid).set(update, { merge: true });
    await db.doc('privateUsers/' + uid).set(update, { merge: true });
    
    console.log('SUCCESS: User ' + uid + ' is now a hidden Admin.');
    process.exit(0);
  } catch (err) {
    console.error('FAILED:', err);
    process.exit(1);
  }
}
promoteToAdmin();
