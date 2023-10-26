import { config } from 'dotenv'
config()
import { OpenAI } from 'openai'

const openai = new OpenAI( { apiKey: process.env.API_KEY } );

// openai.chat.completions.create({ 
//     model: "gpt-3.5-turbo",
//     messages: [
//         { role: "user", content: "HOW TO LEARN ENGLISH?" }
//     ]
// }).then(res => {
//     console.log(res)
//     res.choices.forEach( out => console.log(out.message) );
// });


import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.get('/chatgpt', (req, res) => {
    console.log()
    // res.send('Hola, este es un ejemplo de solicitud GET');
    openai.chat.completions.create({ 
        model: "gpt-3.5-turbo",
        messages: [
            { role: "user", content: "concretamente y en muy resumidas palabras, " + req.query.instruction + "[" + req.query.objects + "]"}
        ]
    }).then(text_res => {
        // console.log(res)
        res.send(text_res.choices[0].message.content);
        // res.choices.forEach( out => console.log(out.message) );
    });
});

const puerto = 3000;
app.listen(puerto, () => {
  console.log(`Servidor Express escuchando en el puerto ${puerto}`);
});