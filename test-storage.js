const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadString } = require('firebase/storage');
global.XMLHttpRequest = require("xhr2"); // We might need this for Firebase Storage in Node, but let's see.

const firebaseConfigAppspot = {
    apiKey: "AIzaSyDk5gwNjJJYfRtAs540q_acwhYgZzMUGn8",
    authDomain: "vidcheck-3c3bc.firebaseapp.com",
    projectId: "vidcheck-3c3bc",
    storageBucket: "vidcheck-3c3bc.firebasestorage.app",
    messagingSenderId: "785391713841",
    appId: "1:785391713841:web:9b5064429a23dbc7e89f10",
    measurementId: "G-YJ4PVFKL90",
};

const app = initializeApp(firebaseConfigAppspot, "appspot");
const storage = getStorage(app);

async function testStorage() {
    try {
        console.log("Testing upload to .appspot.com...");
        const storageRef = ref(storage, 'test-storage.txt');
        await uploadString(storageRef, 'Hello World!');
        console.log("Upload succeeded to .appspot.com!");
    } catch (e) {
        console.error("Upload failed to .appspot.com:", e.code || e);
    }
}

testStorage();
+++E