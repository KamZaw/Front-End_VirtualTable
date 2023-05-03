import {Shape} from './Shape.js'
import { cShape } from '../shapetype.js';

class ChatMessage extends Shape {
    constructor(scene,  label, color) {
        super(cShape.CHATMSG, scene, 0, 0, label, color);
        this.iColor = color;    //kolor to wzorzec w3c, np "w3-red"
    }
    drawShape() {}
    setMirrorX() {}
    setRotate(rot) {}
    setMirrorY() {}
    //ignoruj wszystkie metody graficzne
    mX(v) {}
    mY(v) {}
    ZPlus(){}
    ZMinus(){}
    toSVG() {}
    setScaleX(val) {}
    setScaleY(val) {}
    rescale() {}


    rmShape() {}
    mvShape(start, stop) {}
 
    //zachowujemy dla zapisu do FB
    toJSON() {
        return { 
            type: this.type,
            x: 0,
            y: 0,
            Z: 0,
            label: this.label,
            color: this.iColor,
            wireframe: false,
            transparent: false,
            mirrorX: 1,
            mirrorY: 1,
            opacity: 1.0,
            rotate: 0,
        };
    }
    carbonCopy(obj) {
        if(!obj) return this;
        super.carbonCopy(obj);
        obj.label = this.label;
        obj.iColor = this.iColor;
    }

    //tworzy i wraca kopię obiektu
    clone() {
        const obj = new ChatMessage(this.scene,this.label, this.iColor);
        obj.id = this.id;
        obj.mesh = null;
        obj.scene = this.scene;
        this.linie = null;
        return obj;
    }

    //TODO: tutaj wpisz do konsoli tekst który ma być wyświetlany
    recreateShape(obj) {
        if(obj == null) return;
        this.ticks = obj.ticks;
        this.date = obj.date !== undefined?obj.date:obj.Date;
        this.iColor = obj.iColor;
        this.label = obj.label;
    }

    select(flag) {}

    setDefaultColor() {}
    setFillColor(fillColor){}
    getFillColor(){}
}

export {ChatMessage}