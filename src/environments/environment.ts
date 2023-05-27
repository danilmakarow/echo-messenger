// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  projectId: 'project-echo-01',
  appId: '1:822906463628:web:12e7b848318fc09eb9a2a9',
  storageBucket: 'project-echo-01.appspot.com',
  apiKey: 'AIzaSyD1d4kv-gGmvR9-R_6soZIpXi5Fw1DUQHk',
  authDomain: 'project-echo-01.firebaseapp.com',
  messagingSenderId: '822906463628',
  measurementId: 'G-5XE6G7SPJ0',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const environment = {
  production: false,
  firebase: {
    projectId: 'project-echo-01',
    appId: '1:822906463628:web:12e7b848318fc09eb9a2a9',
    storageBucket: 'project-echo-01.appspot.com',
    apiKey: 'AIzaSyD1d4kv-gGmvR9-R_6soZIpXi5Fw1DUQHk',
    authDomain: 'project-echo-01.firebaseapp.com',
    messagingSenderId: '822906463628',
    measurementId: 'G-5XE6G7SPJ0',
  }
};

