import { initializeApp } from "firebase/app";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const FirebaseConfig = {
  apiKey: "AIzaSyBpUVyQajZIZErZ4oEK_7F7811TryOlmmU",
  authDomain: "sp-authoexam.firebaseapp.com",
  projectId: "sp-authoexam",
  storageBucket: "sp-authoexam.appspot.com",
  messagingSenderId: "205164436846",
  appId: "1:205164436846:web:b0f30f3c6c403cc775757f",
  measurementId: "G-X467K4W3LT",
  databaseURL: "https://sp-authoexam-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const FirebaseApp = initializeApp(FirebaseConfig);

export{
    FirebaseApp
};