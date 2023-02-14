class TimeLapse {
    static dateToTicks = (date) => date.getTime() * 10000 + 621355968000000000;
    static dateFromTicks = (date) => (date - 621355968000000000)/10000;
    
    constructor() {
        this.startTime = null;
        this.lastOne = 0;
    }

    setMap(mapa) {
        this.mapa = mapa;
        for (const i in mapa) {
            this.startTime = parseInt(i);
            break;
            const tim = parseInt(i); 
        }
    }
    //odpala podmianę 
    start(callback) {
        this.lastOne = 0;
        const audio = document.getElementById("audio1");
        audio.removeAttribute("hidden");
    
        const that = this;
        audio.ontimeupdate = () => {
            const tim = audio.currentTime * 1000;
            
            let current = that.startTime;
            for (const i in that.mapa) {
                const tm = TimeLapse.dateFromTicks(parseInt(i)) - TimeLapse.dateFromTicks(parseInt(this.startTime)); 
                if(tm >= tim) 
                break;
                else
                current = parseInt(i);
            }
            if(that.lastOne != current) {
                that.lastOne = current;
                const tm = TimeLapse.dateFromTicks(current) - TimeLapse.dateFromTicks(parseInt(this.startTime)); 
                console.log(`tim: ${tim} tm: ${tm}`);
                console.log("zmienia");
                callback(that.mapa, current);
            }
    
        };
    }

    push(frame) {
        this.frames.push(frame);
    }
}

export default TimeLapse;