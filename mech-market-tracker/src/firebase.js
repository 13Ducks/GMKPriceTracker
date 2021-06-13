import firebase from 'firebase'
const firebaseConfig = {
    apiKey: "AIzaSyAcBmvPhJ0uJjEyeTZRiGC_fsTF8GDCRSA",
    authDomain: "mm-tracker-760cf.firebaseapp.com",
    projectId: "mm-tracker-760cf",
    storageBucket: "mm-tracker-760cf.appspot.com",
    messagingSenderId: "692582051190",
    appId: "1:692582051190:web:0d71918a4278a62657de57"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.enablePersistence()
    .catch((err) => {
        console.error(err)
    });


export default db;