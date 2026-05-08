import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the project's root .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY ?? process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Firebase Admin Error: Missing environment variables');
    console.log('Project ID:', !!projectId);
    console.log('Client Email:', !!clientEmail);
    console.log('Private Key:', !!privateKey);
  } else {
    // Remove surrounding quotes and convert escaped newlines to real line breaks
    privateKey = privateKey.replace(/^['"]|['"]$/g, '').replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log('Firebase Admin Initialized successfully');
  }
}

export default admin;
