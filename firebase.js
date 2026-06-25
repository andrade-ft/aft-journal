import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";


import {

getFirestore,
collection,
addDoc,
getDocs,
doc,
updateDoc,
deleteDoc

}

from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {

getAuth,
GoogleAuthProvider,
signInWithPopup,
signOut,
onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";




/* ============================
   FIREBASE CONFIG
============================ */


const firebaseConfig = {


apiKey: "AIzaSyCMDhPsh4Oz5H-kPMiwYujEWr4iAAd0H2Y",


authDomain: "aft-journal.firebaseapp.com",


projectId: "aft-journal",


storageBucket: "aft-journal.firebasestorage.app",


messagingSenderId: "957294770056",


appId: "1:957294770056:web:824d9b6ec3147f1c92c3d"


};







/* ============================
   INIT FIREBASE
============================ */


const app = initializeApp(

firebaseConfig

);




const db = 
getFirestore(app);

const auth =
getAuth(app);



const provider =
new GoogleAuthProvider();






/* ============================
   EXPORTS
============================ */


export {

db,
auth,
provider,


collection,
addDoc,
getDocs,
doc,
updateDoc,
deleteDoc,


signInWithPopup,
signOut,
onAuthStateChanged

};