import {

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
onAuthStateChanged

}

from "./firebase.js";




/* ============================
   VARIABLES
============================ */
/* ============================
   CLOUDINARY CONFIG
============================ */


const CLOUD_NAME =
"dup5sa0wi";



const UPLOAD_PRESET =
"aft_journal";

let trades = [];
let usuario = null;


let modoActual =

localStorage.getItem("modo")

||

"Backtesting";




let fechaActual =

modoActual==="Backtesting"

&&

localStorage.getItem("fechaBT")

?

new Date(

localStorage.getItem("fechaBT")

)

:

new Date();





let editando = null;


let tradeReview = null;


/* BLOQUEO DOBLE SAVE */

let guardandoTrade = false;








/* ============================
   FIREBASE LOAD
============================ */

async function cargarFirebase(){


if(!usuario){

console.log("BLOQUEADO - SIN LOGIN");

return;

}



trades = [];



let snapshot =

await getDocs(

collection(db,"trades")

);



snapshot.forEach(

docu=>{



trades.push({


firebaseID:

docu.id,



...docu.data()



});



}

);



actualizar();



}










/* ============================
   FIREBASE SAVE
============================ */


async function guardarFirebase(trade){



if(

trade.firebaseID

){



const ref = doc(

db,

"trades",

trade.firebaseID

);





await updateDoc(

ref,

trade

);




}else{





await addDoc(

collection(db,"trades"),

trade

);




}






await cargarFirebase();



}










/* ============================
   CAMBIAR MODO
============================ */


function cambiarModo(modo){



modoActual = modo;




localStorage.setItem(

"modo",

modo

);





btnBack.classList.remove(

"active"

);



btnLive.classList.remove(

"active"

);







if(

modo==="Backtesting"

){



btnBack.classList.add(

"active"

);



environmentFiltro.style.display=

"none";





let guardado =

localStorage.getItem(

"fechaBT"

);





if(guardado){



fechaActual=

new Date(

guardado

);



}



}else{





btnLive.classList.add(

"active"

);




environmentFiltro.style.display=

"block";




fechaActual=

new Date();



}





actualizar();



}










/* ============================
   MODAL NUEVO
============================ */


function abrirTrade(

fechaTrade=null

){



editando=null;



tituloModal.innerText=

"Nuevo Trade";




limpiarFormulario();





if(fechaTrade){



fecha.value=

fechaTrade;



}




tipo.value=

modoActual;




controlEnvironment();




modal.style.display=

"flex";



}









function cerrarTrade(){



modal.style.display=

"none";



}










function limpiarFormulario(){



fecha.value="";

rr.value="";

analisis.value="";





[

entryHTF,

entryLTF,

entryAux,

exitImg,

postImg

]

.forEach(

x=>x.value=""

);






[

previewHTF,

previewLTF,

previewAux,

previewExit,

previewPost

]

.forEach(

x=>x.innerHTML=""

);



}










function controlEnvironment(){



environmentBox.style.display =


tipo.value==="Backtesting"


?


"none"


:


"block";



}









/* ============================
   IMÁGENES
============================ */


function previewIndividual(input,id){



let box=

document.getElementById(id);



box.innerHTML="";




if(!input.files[0])

return;





let reader=

new FileReader();




reader.onload=e=>{



box.innerHTML=`

<img

src="${e.target.result}"

onclick="abrirImagen(this.src)"

>

`;



};





reader.readAsDataURL(

input.files[0]

);



}

/* ============================
   SUBIR CLOUDINARY
============================ */


async function subirImagen(input, old=""){


if(!input.files[0]){


return old;


}




let data = new FormData();




data.append(

"file",

input.files[0]

);





data.append(

"upload_preset",

UPLOAD_PRESET

);






let respuesta = await fetch(


`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,


{


method:"POST",


body:data


}


);






let archivo = await respuesta.json();





return archivo.secure_url;



}










/* ============================
   CARGAR PREVIEW GUARDADO
============================ */


function cargarPreview(id,img){


let box =
document.getElementById(id);



if(!img){


box.innerHTML="";


return;


}




box.innerHTML=`

<img

src="${img}"

onclick="abrirImagen(this.src)"

>

`;


}










/* ============================
   GUARDAR TRADE
============================ */


/* ============================
   GUARDAR TRADE
============================ */

async function guardarTrade(){


if(guardandoTrade){

return;

}
if(

rr.value === ""

){


alert(

"Ingresa el resultado en R antes de guardar"

);


return;


}

guardandoTrade = true;


let botonGuardar =
document.querySelector(".save");


botonGuardar.disabled = true;


botonGuardar.innerText =
"GUARDANDO...";


try{

let viejo =

editando!==null

?

trades[editando]

:

null;






let trade={






id:

viejo?.id ||

crypto.randomUUID(),






fecha:

fecha.value,






tipo:

tipo.value,







environment:

tipo.value==="Live Journal"

?

environment.value

:

"",







mercado:

mercado.value,







setup:

setup.value,







direction:

direction.value,







rr:

Number(rr.value),







analisis:

analisis.value,








imagenes:{






entryHTF:

await subirImagen(
entryHTF,

viejo?.imagenes?.entryHTF

),








entryLTF:

await subirImagen(
entryLTF,

viejo?.imagenes?.entryLTF

),








entryAux:

await subirImagen(
entryAux,

viejo?.imagenes?.entryAux

),








exit:

await subirImagen(
exitImg,

viejo?.imagenes?.exit

),








post:

await subirImagen(
postImg,

viejo?.imagenes?.post

)






},









asr:

viejo?.asr || "",








ai:

viejo?.ai ||

{

estado:"pending",

score:null,

review:""

}



};







// SOLO AÑADIR firebaseID CUANDO YA EXISTE

if(

viejo?.firebaseID

){



trade.firebaseID =

viejo.firebaseID;



}








await guardarFirebase(

trade

);



modal.style.display=

"none";



}catch(error){


console.error(
"ERROR AL GUARDAR:",
error
);


alert(
"Falló al guardar, mira consola"
);


}
finally{


guardandoTrade = false;


botonGuardar.disabled =
false;


botonGuardar.innerText =
"SAVE TRADE";


}


}







/* ============================
   EDITAR TRADE
============================ */


function editarTrade(i){



let t=

trades[i];




editando=i;




cerrarReview();




tituloModal.innerText=

"Editar Trade";







fecha.value=

t.fecha;





tipo.value=

t.tipo;






environment.value=

t.environment || "Demo";






mercado.value=

t.mercado;






setup.value=

t.setup;






direction.value=

t.direction;






rr.value=

t.rr;






analisis.value=

t.analisis;








cargarPreview(

"previewHTF",

t.imagenes?.entryHTF

);





cargarPreview(

"previewLTF",

t.imagenes?.entryLTF

);






cargarPreview(

"previewAux",

t.imagenes?.entryAux

);






cargarPreview(

"previewExit",

t.imagenes?.exit

);






cargarPreview(

"previewPost",

t.imagenes?.post

);







controlEnvironment();





modal.style.display=

"flex";



}









/* ============================
   ACTUALIZAR
============================ */


function actualizar(){



let data=

trades.filter(

t=>{



let ok =

t.tipo===modoActual;






if(

modoActual==="Live Journal"

&&

environmentFiltro.value!=="Todos"

){



ok =

ok &&

t.environment===environmentFiltro.value;



}





return ok;



}

);






actualizarStats(data);



crearCalendario(data);



pintarTabla(data);



pintarUltimos(data);



}









/* ============================
   MÉTRICAS
============================ */


function actualizarStats(data){



let total =

data.reduce(

(a,b)=>a+b.rr,

0

);




totalR.innerText=

total.toFixed(2)+"R";






let wins=

data.filter(

t=>t.rr>0

).length;





winrate.innerText=

data.length

?

Math.round(

wins/data.length*100

)+"%"

:

"0%";







let ganancias=

data

.filter(t=>t.rr>0)

.reduce(

(a,b)=>a+b.rr,

0

);







let perdidas=

Math.abs(

data

.filter(t=>t.rr<0)

.reduce(

(a,b)=>a+b.rr,

0

)

);







pf.innerText=

perdidas

?

(ganancias/perdidas).toFixed(2)

:

"0";







avgR.innerText=

data.length

?

(total/data.length).toFixed(2)+"R"

:

"0R";







let equity=0;

let peak=0;

let dd=0;






data.forEach(

t=>{



equity+=t.rr;




peak=Math.max(

peak,

equity

);




dd=Math.min(

dd,

equity-peak

);



}

);







drawdown.innerText=

dd.toFixed(2)+"R";







bestTrade.innerText=

data.length

?

Math.max(

...data.map(t=>t.rr)

)+"R"

:

"0R";








worstTrade.innerText=

data.length

?

Math.min(

...data.map(t=>t.rr)

)+"R"

:

"0R";







calcularStreak(

data

);



}

/* ============================
   STREAK
============================ */


function calcularStreak(data){


if(!data.length){

streak.innerText="0";

return;

}



let orden =

[...data].sort(

(a,b)=>new Date(a.fecha)-new Date(b.fecha)

);



let positivo =

orden[orden.length-1].rr > 0;



let count=0;



for(

let i=orden.length-1;

i>=0;

i--

){


if(

(orden[i].rr>0)===positivo

){


count++;


}else{


break;


}


}




streak.innerText =

positivo

?

count+"W"

:

count+"L";


}









/* ============================
   CALENDARIO
============================ */


function crearCalendario(data){



calendar.innerHTML="";



let y=fechaActual.getFullYear();

let m=fechaActual.getMonth();




let meses=[

"Enero","Febrero","Marzo",
"Abril","Mayo","Junio",
"Julio","Agosto","Septiembre",
"Octubre","Noviembre","Diciembre"

];




mesTexto.innerText=meses[m];

year.innerText=y;





let inicio =

new Date(y,m,1).getDay();




inicio =

inicio===0

?

6

:

inicio-1;





for(let i=0;i<inicio;i++){


calendar.innerHTML+=`

<div class="empty-day"></div>

`;


}







let dias =

new Date(y,m+1,0).getDate();






for(let d=1;d<=dias;d++){



let f=

`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;





let td =

data.filter(

t=>t.fecha===f

);





let suma =

td.reduce(

(a,b)=>a+b.rr,

0

);






calendar.innerHTML+=`

<div

class="day ${

td.length ?

(suma>=0?"win":"loss")

:

""

}"

onclick="abrirTrade('${f}')"

>


<h4>${d}</h4>


${

td.length ?

`

<div class="profit">

${suma}R

</div>


<p>

${td.length} trades

</p>

`

:

""

}


</div>

`;


}





if(modoActual==="Backtesting"){


localStorage.setItem(

"fechaBT",

fechaActual

);


}


}










/* ============================
   TABLA
============================ */


function pintarTabla(data){



listaTrades.innerHTML="";


data

.slice()

.sort(

(a,b)=> new Date(b.fecha) - new Date(a.fecha)

)

.forEach(t=>{


let i = trades.indexOf(t);



let completo =

t.asr &&

t.asr.trim().length>0;






listaTrades.innerHTML+=`

<tr onclick="abrirReview(${i})">


<td>${t.fecha}</td>


<td>${t.setup}</td>


<td>${t.direction}</td>


<td class="${t.rr>=0?'green':'red'}">

${t.rr}R

</td>



<td>


<span class="status ${completo?'complete':'pending'}">


● ${completo?'COMPLETE':'PENDING'}


</span>


</td>


</tr>

`;



});


}









/* ============================
   RECIENTES
============================ */


function pintarUltimos(data){



ultimosTrades.innerHTML="";



data

.slice()

.reverse()

.slice(0,15)

.forEach(t=>{



let i=trades.indexOf(t);




ultimosTrades.innerHTML+=`

<div

class="mini-trade"

onclick="abrirReview(${i})"

>


<h3>${t.mercado}</h3>


<p>${t.fecha}</p>



<h2 class="${t.rr>=0?'green':'red'}">


${t.rr}R


</h2>



</div>

`;



});


}









/* ============================
   REVIEW
============================ */


function abrirReview(i){



tradeReview=i;


let t=trades[i];



editarBtn.onclick=

()=>editarTrade(i);






reviewContent.innerHTML=`

<h2>ANÁLISIS</h2>


<p>${t.analisis}</p>





<h3>ENTRY</h3>


${img(t.imagenes?.entryHTF)}

${img(t.imagenes?.entryLTF)}

${img(t.imagenes?.entryAux)}






<h3>EXIT</h3>


${img(t.imagenes?.exit)}






<h3>POST TRADE</h3>


${img(t.imagenes?.post)}






<h3>ASR POST TRADE</h3>


<textarea id="asrReview">

${t.asr || ""}

</textarea>






<div class="ai-box">

<h3>AFT AI COACH</h3>

<p>Status: Pending</p>

</div>


<button 
class="delete-btn"
onclick="borrarTrade()">

DELETE TRADE

</button>
`;




review.style.display="flex";


}









async function guardarASR(){



if(tradeReview===null)

return;




trades[tradeReview].asr =

document

.getElementById("asrReview")

.value

.trim();





await guardarFirebase(

trades[tradeReview]

);



}










function img(src){



return src ?

`

<img

class="review-img"

src="${src}"

onclick="abrirImagen(this.src)"

>

`

:

"";


}









function cerrarReview(){

review.style.display="none";

}

async function borrarTrade(){


if(tradeReview===null)

return;



let confirmar =
confirm(
"¿Eliminar este trade definitivamente?"
);



if(!confirmar)

return;




let trade =
trades[tradeReview];




if(trade.firebaseID){


await deleteDoc(

doc(
db,
"trades",
trade.firebaseID
)

);


}




review.style.display="none";



await cargarFirebase();


}



function abrirImagen(src){


imagenFull.src=src;

visor.style.display="flex";


}



function cerrarImagen(){


visor.style.display="none";


}






function cambiarMes(n){


fechaActual.setMonth(

fechaActual.getMonth()+n

);



actualizar();


}









function exportarJSON(){



let a=document.createElement("a");



a.href=

URL.createObjectURL(

new Blob(

[JSON.stringify(trades)],

{type:"application/json"}

)

);



a.download=

"aft-journal-backup.json";



a.click();


}

/* ============================
   GOOGLE AUTH
============================ */


async function loginGoogle(){


await signInWithPopup(

auth,

provider

);


}



onAuthStateChanged(

auth,

(user)=>{


if(user){


usuario = user;


console.log(

"LOGIN UID:",

user.uid

);


document.getElementById("loginScreen").style.display =
"none";


document.getElementById("appContent").style.display =
"block";


cargarFirebase();


}else{


usuario = null;


document.getElementById("loginScreen").style.display =
"flex";


document.getElementById("appContent").style.display =
"none";


console.log(

"SIN LOGIN"

);


}


}

);


/* ============================
   PEGAR IMÁGENES CTRL + V
============================ */


document.addEventListener(
"DOMContentLoaded",
()=>{


document.querySelectorAll(".paste-zone")
.forEach(zone=>{


zone.addEventListener(
"paste",
(e)=>{


e.preventDefault();


let imagen =
Array.from(e.clipboardData.items)
.find(
item => item.type.includes("image")
);



if(!imagen){

return;

}



let archivo =
imagen.getAsFile();




let input =
document.getElementById(

zone.dataset.input

);




let transferencia =
new DataTransfer();




transferencia.items.add(

archivo

);



input.files =
transferencia.files;





// activar tu preview viejo

previewIndividual(

input,

zone.dataset.preview

);



console.log(

"IMAGEN PEGADA:",

zone.dataset.input

);



});


});


}

);




/* ============================
   MODULE FIX 🔥
============================ */


window.abrirTrade = abrirTrade;

window.loginGoogle = loginGoogle;

window.cerrarTrade = cerrarTrade;

window.guardarTrade = guardarTrade;

window.cambiarModo = cambiarModo;

window.actualizar = actualizar;

window.controlEnvironment = controlEnvironment;

window.previewIndividual = previewIndividual;

window.guardarASR = guardarASR;

window.cerrarReview = cerrarReview;

window.abrirImagen = abrirImagen;

window.cerrarImagen = cerrarImagen;

window.cambiarMes = cambiarMes;

window.exportarJSON = exportarJSON;

window.editarTrade = editarTrade;

window.abrirReview = abrirReview;

window.borrarTrade = borrarTrade;



/* ============================
   START APP
============================ */


cambiarModo(

modoActual

);