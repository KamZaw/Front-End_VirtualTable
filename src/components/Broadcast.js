import Global from "../Global";
import {
    getStorage,
    uploadBytes,
    ref,
    getDownloadURL
} from "firebase/storage";



class Broadcast {
    constructor() {
        this.audio = null;
        this.rec = null;
        this.dataArray = [];

        this.fileName = "";
    }

    onPlay(src) {

        const storage = getStorage();
        getDownloadURL(ref(storage, `${src}.ogg`)) //audio_sesje/
            .then((url) => {
                const playAudio = document.getElementById('audio1');
                playAudio.setAttribute("controls", "");
                playAudio.src = url;
                playAudio.play();
            })
            .catch(() => {
                if(src != 'ambient')
                    this.onPlay("ambient")

            });
    }

    async broadcast() {
        this.dataArray = [];

        navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia ||
            navigator.mediaDevices.webkitGetUserMedia ||
            navigator.mediaDevices.mozGetUserMedia ||
            navigator.mediaDevices.msGetUserMedia;

        const that = this;
        this.audio = document.getElementById('audio1');
        let stream = null;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });
        } catch (err) {
            // console.log(err);
            return;
        }

        if ("srcObject" in this.audio) {
            this.audio.srcObject = stream;
        } else {
            this.audio.src = window.URL
                .createObjectURL(stream);
        }


        this.rec = new MediaRecorder(stream, {
            mimeType: "audio/ogg"
        });
        this.audio.onloadedmetadata = function (ev) {
            that.audio.muted = true;
            that.audio.play();
            that.rec.start();
            console.log(that.rec.state);
        };

        this.rec.ondataavailable = (ev) => {
            that.dataArray.push(ev.data);
            // let audioData = new Blob(that.dataArray, {
            //     'type': 'audio/ogg;'
            // });
            // let audioSrc = window.URL
            //     .createObjectURL(ev.data);

            // console.log("PUSH:"+JSON.stringify(that.dataArray));
            // that.putData(audioSrc, that.dataArray.length);

        }
        this.rec.onstop = function (ev) {
            let audioData = new Blob(that.dataArray, {
                'type': 'audio/ogg;'
            });
            const file = new File([audioData], `${that.fileName}.ogg`, {
                type: "audio/ogg"
            });
            const storage = getStorage();
            const storageRef = ref(storage, `${that.fileName}.ogg`); //audio_sesje/

            // 'file' comes from the Blob or File API
            uploadBytes(storageRef, file).then((snapshot) => {
                console.log(`${that.fileName}.ogg Wrzucono na FB!`);
            });

            // const a = document.createElement('a');
            // a.download = 'demo.ogg';
            // a.href = URL.createObjectURL(audioData);
            // a.addEventListener('click', (e) => {
            // setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);});
            // a.click();

            that.dataArray = [];
            // const audioSrc = window.URL.createObjectURL(audioData);
            // console.log(JSON.stringify(audioData));
            // console.log(JSON.stringify(audioSrc));

            // const playAudio = document.createElement('audio');
            // playAudio.src = audioSrc;
            //playAudio.play();
        }
    }
    async putData(obj, id) {
        try {
            const o = {
                streamUrl: obj,
                id: id,
            }

            //console.log(JSON.stringify(o));
            const res = await fetch(`${Global.baseURL}/Shape/AudioChunk`, {
                mode: 'cors',
                method: "put",
                headers: {
                    'Access-Control-Allow-Origin': `${Global.localURL}`,
                    "Content-Type": "application/json",
                    // "x-access-token": "token-value",
                },
                body: JSON.stringify(o),
            });

            if (!res.ok) {
                const message = `An error has occured: ${res.status} - ${res.statusText}`;
                throw new Error(message);
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    onStop(fileName) {
        this.fileName = fileName;
        if (!this.rec || !this.audio) {
            return;
        };
        this.audio.pause();
        this.rec.stop();
        console.log(this.rec.state);
    }
}

export default Broadcast;