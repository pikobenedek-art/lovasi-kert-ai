import nodemailer from "nodemailer";
import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.static("public"));


const upload = multer({
    dest: "uploads/"
});


const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});



app.post("/elemzes", upload.array("kepek", 10), async (req, res) => {

try {


if (!req.files || req.files.length === 0) {

return res.status(400).json({
hiba:"Nem érkezett kép!"
});

}



let kepek=[];


for(const file of req.files){

const kep = fs.readFileSync(file.path);


kepek.push({

inlineData:{

mimeType:file.mimetype,

data:kep.toString("base64")

}

});


}

const transporter = nodemailer.createTransport({

    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
        user: "lovasi.kertgondozas@gmail.com",
        pass: process.env.EMAIL_JELSZO
    },

    tls: {
        rejectUnauthorized: false
    }

});
const prompt = `

Készíts rövid, ügyfélnek küldhető kertészeti ajánlatot.

Magyar nyelven írj.

Fontos szabályok:

- 5-8 mondat legyen.
- Udvarias, egyszerű megfogalmazás.
- Ne használj csillag karaktert.
- Ne írj szerszámokról.
- Ne írj gépekről.
- Ne írj szakmai magyarázatot.
- Ne részletezd túl.


Ügyfél adatai:


Név:
${req.body.nev || "Nincs megadva"}


Település:
${req.body.telepules || "Nincs megadva"}


Email:
${req.body.email || "Nincs megadva"}



A képek alapján becsüld meg:

- szükséges kertészeti munkát
- várható munkamennyiséget
- becsült árat


A munkadíj magasabb minőségű kertfenntartási szolgáltatás alapján készüljön.


Az ajánlatban szerepeljen:

Munkák:
${req.body.munkak || "Nincs megadva"}


Költség bontás:

Munkadíj:
(kb. becsült összeg)


Esetleges külön tételek:

Becsült végösszeg:


Ne ajánld fel automatikusan a zöldhulladék elszállítást.


A munkák megnevezése pontosan:

Fűnyírás

Virágágyások gondozása

Gazolás

Bokrok metszése

Bozót irtás

Fakivágás



Munkaterület:

Csak Veszprém 20 km-es körzetében vállalunk munkát.

Ha a település ezen kívül van, ezt írd:

"A megadott helyszín sajnos kívül esik a munkavégzési területünkön, ezért a munkát nem tudjuk elvállalni."



Ügyfél megjegyzése:

${req.body.megjegyzes || "Nincs megadva"}



Fontos:

Ne írd ki külön az óradíjat az ügyfélnek.


Az ajánlat végére mindig írd:

"Ajánlatkérését elküldtük, hamarosan felvesszük Önnel a kapcsolatot."

`;





const response = await ai.models.generateContent({


model:"gemini-3.1-flash-lite",


contents:[

{

role:"user",

parts:[

{
text:prompt
},

...kepek

]

}

]


});






let eredmeny=response.text.replaceAll("*","");

console.log(req.files);

// IDE MÁSOLD AZ EMAIL KÜLDÉST
console.log("EMAIL KÜLDÉS INDUL");
    

await transporter.sendMail({

from:"Lovasi Kertgondozás <lovasi.kertgondozas@gmail.com>",

to:"lovasi.kertgondozas@gmail.com",

subject:"Új kertészeti ajánlatkérés",

text:`

Új ajánlatkérés érkezett!


Név:
${req.body.nev || ""}


Település:
${req.body.telepules || ""}


Email:
${req.body.email || ""}


Kért munkák:
${req.body.munkak || ""}


Megjegyzés:
${req.body.megjegyzes || ""}


AI ajánlat:

${eredmeny}

`,


attachments: req.files.map((file)=>({

filename:file.originalname,

content:fs.readFileSync(file.path),

contentType:file.mimetype

}))


});

console.log("EMAIL ELKÜLDVE");
// EZ MARAD AZ EREDETI RÉSZED

res.json({

eredmeny:eredmeny

});



}

catch(error){

console.error("TELJES HIBA:", error);

res.status(500).json({
hiba:error.message
});

}

});   


app.listen(3000,()=>{

console.log("AI szerver fut: 3000");

});
