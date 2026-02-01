// Firebase設定 - Game Project

const firebaseConfig = {
  apiKey: "AIzaSyBeOt-od3ZSxCjViTLwnEYjns0zTX0NJrQ",
  authDomain: "game-project-1a04b.firebaseapp.com",
  projectId: "game-project-1a04b",
  storageBucket: "game-project-1a04b.firebasestorage.app",
  messagingSenderId: "1002233402576",
  appId: "1:1002233402576:web:0e847712cf54fd07253ad5"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
