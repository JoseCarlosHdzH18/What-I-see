
var res;
var hablando = false;
var recognition = new webkitSpeechRecognition()

//capturar video ó imagen
const video = document.querySelector(".video");
const canvas = document.querySelector(".canvas");
const audio = document.getElementById("myAudio");
const audiofinal = document.getElementById("audiofinal");
const audioshot = document.getElementById("audioshot");
const camara_lect = document.getElementById("camara_lect");

//speak foto
const speak_button = document.querySelector(".speak-btn");

//tomar foto lectura
const read = document.querySelector(".read-btn");

//tomar foto
const ask = document.querySelector(".ask-btn");

//tomar foto
const button = document.querySelector(".start-btn");

//mostrar foto
const photo = document.querySelector(".photo");

//constrains
/*
Aquí enviamos las caracteristicas del video y
audio que solicitamos
*/

const constraints = {
  video: { width: 420, height: 340 },
  audio: false,
};


//acceso a la webcam
/*
Aquí recibimos la respuesta del navegador, es una promesa
 */
const getVideo = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSucces(stream);
    // console.log(stream);
  } catch (error) {
    console.log(error);
  }
};

//3. -----------> si la promesa tiene exito
const handleSucces = (stream) => {
  video.srcObject = stream;
  video.play();
};

//4.------------>Llamada a la función get
getVideo();

//4. ----------> Button y foto
button.addEventListener("click", () => {
  audioshot.play();
  let context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, 420, 340);
  let data = canvas.toDataURL("image/png");
  photo.setAttribute("src", data);

  data = data.replace(/^data:image\/(png|jpg);base64,/, "");

  SEND_IMG_GOOGLE_API(data);

});



recognition.lang = 'es-ES'
recognition.continuous = true
recognition.onresult = event => {
  for (const result of event.results) {
        console.log(result[0].transcript);
        $("#texto").text(result[0].transcript);
        var msg = new SpeechSynthesisUtterance();
        msg.text = result[0].transcript;
    }
    // CON ESTO EL NAVEGADOR "HABLA"
    window.speechSynthesis.speak(msg);
}

//5. ----------> Hablar y detener
speak_button.addEventListener("click", () => {
  if(hablando){
    audio.play();
    hablando = false;
    recognition.stop();
    
  }else{
    audiofinal.play();
    hablando = true;
    recognition.start();
  }

});

//6. ----------> Preguntar a CHATGPT jaja
ask.addEventListener("click", () => {
  printAsyncResult();
});

//7. ----------> Reconocimiento de Texto
read.addEventListener("click", () => {
  let context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, 420, 340);
  let data = canvas.toDataURL("image/png");
  photo.setAttribute("src", data);

  data = data.replace(/^data:image\/(png|jpg);base64,/, "");

  camara_lect.play();
  read_text(data);
});

function eliminarRepetidos(array) {
  var resultado = [];
  for (var i = 0; i < array.length; i++) {
    if (resultado.indexOf(array[i]) === -1) {
      resultado.push(array[i]);
    }
  }
  return resultado;
}

// Mandar a la API de Google para lectura de Texto
async function read_text(dataImage){
  const url = 'https://vision.googleapis.com/v1/files:annotate?key=AIzaSyB2v2LwxXOHuZYBmhlRhsyKg-y6XbVHius';
  const url2= 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyB2v2LwxXOHuZYBmhlRhsyKg-y6XbVHius';
  
  const response = await fetch(url2, {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      body: JSON.stringify({
          "requests":[
              {
                  "image":{
                      "content": dataImage
                  },
                  "features":[
                      {
                          "maxResults": 50,
                          "model": "builtin/latest",
                          "type": "DOCUMENT_TEXT_DETECTION"
                      },
                  ]
              }
          ]
      })
    })
  .then(function(response) {
      if(response.ok) {
          return response.text();
      } else {
          throw "Error en la llamada Ajax";
      }
  })
  .then(function(info_obj) {
    res = JSON.parse(info_obj);
    console.log(res.responses[0].fullTextAnnotation.text);

    $("#texto2").text(res.responses[0].fullTextAnnotation.text);
  })
}

// Mandar a la API de Google
async function SEND_IMG_GOOGLE_API(dataImage){
  const url2= 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyB2v2LwxXOHuZYBmhlRhsyKg-y6XbVHius';
  
  const response = await fetch(url2, {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      body: JSON.stringify({
          "requests":[
              {
                  "image":{
                      "content": dataImage
                  },
                  "features":[
                      {
                          "maxResults": 50,
                          "model": "builtin/latest",
                          "type": "OBJECT_LOCALIZATION"
                      },
                  ]
              }
          ]
      })
    })
  .then(function(response) {
      if(response.ok) {
          return response.text();
      } else {
          throw "Error en la llamada Ajax";
      }
  })
  .then(function(info_obj) {
    res = JSON.parse(info_obj);
    console.log(res);

    let objs = get_just_objects(res);

    if(objs){
        $("#texto2").text(objs.join());
        var msg = new SpeechSynthesisUtterance();
        msg.text = objs.join();

        // window.speechSynthesis.speak(msg);
    }

  })
}

async function printAsyncResult() {
  try {
    const result = await ask_openai();
    var msg = new SpeechSynthesisUtterance();
    msg.text = result;
    window.speechSynthesis.speak(msg);
    console.log(result); // Log the result
  } catch (error) {
    console.error(error); // Handle any errors
  }
}

async function ask_openai() {
  const url2 = 'http://localhost:3000/chatgpt?instruction='+$("#texto").text()+"&objects="+$("#texto2").text();
  console.log($("#texto").text()+"&objects="+$("#texto2").text());
  try {
    const response = await fetch(url2, {
      method: 'GET',
      dataType: "json",
      data: {
          'instruction': $("#texto").text(),
          'objects': $("#texto2").text()
      },
    });

    if (response.ok) {
      const info_obj = await response.text();
      return info_obj;
    } else {
      throw "Error en la llamada Ajax";
    }
  } catch (error) {
    console.error(error); // Handle the error if needed
    throw error; // Re-throw the error if necessary
  }
}

const get_just_objects = (res) => {
  const annotations = res.responses[0].localizedObjectAnnotations;
  let objs = []
  // Iterate through the array and extract the "name" property of each object
  for (const annotation of annotations) {
      const name = annotation.name;
      objs.push(name);
  }
  objs = eliminarRepetidos(objs);
  return objs;
}

