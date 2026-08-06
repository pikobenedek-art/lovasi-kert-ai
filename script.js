const kep =
document.getElementById("kep");


kep.addEventListener(
"change",
function(){

let fajl=this.files[0];

if(fajl){

let olvaso=new FileReader();


olvaso.onload=function(e){

document.getElementById("elozetesKep").src=e.target.result;

}


olvaso.readAsDataURL(fajl);

}

});





async function elemzes(){


let fajl =
document.getElementById("kep").files[0];


let adat =
new FormData();


adat.append(
"kep",
fajl
);



document.getElementById("eredmeny").innerHTML=
"AI elemzés folyamatban...";



let valasz =
await fetch(
"http://localhost:3000/elemzes",
{
method:"POST",
body:adat
}
);



let eredmeny =
await valasz.json();



document.getElementById("eredmeny").innerHTML=

`
<h3>AI ajánlat</h3>

<p>
${eredmeny.eredmeny}
</p>

`;

}
