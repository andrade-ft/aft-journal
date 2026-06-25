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




const db = getFirestore(

app

);








/* ============================
   EXPORTS
============================ */


export {


db,


collection,


addDoc,


getDocs,


doc,


updateDoc,


deleteDoc


};