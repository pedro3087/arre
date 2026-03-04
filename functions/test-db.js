const admin = require("firebase-admin");

// Initialize with application default credentials (if available) or the emulator
if (!admin.apps.length) {
    admin.initializeApp({ projectId: "arre-app-dev" }); // Use the DEV project ID.
}

const db = admin.firestore();

async function check() {
  console.log('Querying users...');
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }

  let foundIntegrations = 0;
  for (const doc of snapshot.docs) {
    console.log(`User ID: ${doc.id}`);
    
    // Check integrations collection
    const integrations = await doc.ref.collection('integrations').doc('googleTasks').get();
    if (integrations.exists) {
        console.log(` -> \`googleTasks\` integration exists for user: ${doc.id}`);
        foundIntegrations++;
    } else {
        console.log(` -> \`googleTasks\` integration missing for user: ${doc.id}`);
    }
  }
  console.log(`Total users with integration connected: ${foundIntegrations}`);
}

check().catch(console.error);
