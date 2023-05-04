class TimeLapse {
    static dateToTicks = (date) => date.getTime() * 10000 + 621355968000000000;
    static dateFromTicks = (date) => (date - 621355968000000000)/10000;
    
    constructor() {
        this.startTime = null;
        this.lastOne = 0;
    }

    setMap(mapa) {
        this.mapa = new Map();
        for (const i in mapa) {
            this.startTime = parseInt(i);
            break;
        }
        const list = [];
        for (const i in mapa) {
            list.push(mapa[i][0]);
            this.mapa.set(parseInt(i), [...list]);
        }    
    }
    stop() {
        const audio = document.getElementById("audio1");
        audio.setAttribute("hidden", true);
        audio.currentTime = 0;
        audio.pause();
    }
    //odpala podmianę 
    start(callback) {
        this.lastOne = 0;
        const audio = document.getElementById("audio1");
        audio.removeAttribute("hidden");
    
        const that = this;
        const live = false;
        audio.ontimeupdate = () => {
            const tim = audio.currentTime * 1000;
            
            let current = that.startTime;
            for(let i of this.mapa.keys() ) {
                const tm = TimeLapse.dateFromTicks(parseInt(i)) - TimeLapse.dateFromTicks((this.startTime)); 
                if(tm >= tim) 
                break;
                else
                current = parseInt(i);
            }
            if(that.lastOne !== current) {
                that.lastOne = current;
                const tm = TimeLapse.dateFromTicks(current) - TimeLapse.dateFromTicks((this.startTime)); 
                console.log(`tim: ${tim} tm: ${tm}`);
                console.log("zmienia");
                callback(that.mapa, current, live);
            }
    
        };
    }

    push(frame) {
        this.frames.push(frame);
    }
}

export default TimeLapse;