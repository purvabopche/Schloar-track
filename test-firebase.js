const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyACuXyUM42U5o_iEIlMfBU196oa-1fSJ-s",
    authDomain: "track-of-scholar-project-final.firebaseapp.com",
    projectId: "track-of-scholar-project-final",
    storageBucket: "track-of-scholar-project-final.firebasestorage.app",
    messagingSenderId: "778059123746",
    appId: "1:778059123746:web:f80662344aa34f2a96ce7b",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function test() {
    try {
        console.log('Testing authentication...');
        await signInWithEmailAndPassword(auth, "test@example.com", "password123");
        console.log("Logged in!");
    } catch (error) {
        console.error("Login failed:", error.code, error.message);
    }
}

test();
