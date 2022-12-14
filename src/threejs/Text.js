import {Shape} from './Shape.js'
import { cShape } from '../shapetype.js';
import * as THREE from 'three';
import Global from '../Global.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from'three/examples/jsm/geometries/TextGeometry.js'




class Text extends Shape{

    static font = null;
    static loadFontOnce() {
        const loader = new FontLoader();
        loader.load( 'http://localhost:3000/helvetiker_regular.typeface.json', (font) => Text.font = font);
    }
    constructor(THREE, scene, x, y, label, color,  size, height) {
        super(cShape.TEXT, THREE, scene, y, x, label);
        this.size = parseInt(size);
        this.height = parseInt(height);
        this.iColor = parseInt(color);
    }
    toJSON() {
        return {
            type: this.type,
            ticks: this.ticks,
            x: this.x,
            y: this.y,
            label: this.label,
            size: this.size,
            height: this.height,
            color: this.iColor,
            wireframe: false,
            transparent: false,
            opacity: 1.0,
        };
    }
    carbonCopy(bDraw) {
        const obj = new Text(THREE,this.scene, this.x, this.y, this.label,this.iColor,this.size,this.height);
        this.drawShape(bDraw);

        return obj;
    }
    drawShape(bDraw) {
        const geometry = new TextGeometry( this.label, {
            font: Text.font,
            size: this.size,
            height: this.height,
            curveSegments: 12,
            bevelEnabled: !true,
        } );

        const material = new THREE.MeshStandardMaterial({
            color: this.iColor, //0xE9E9E9,
                //wireframe: true,
            // transparent: this.cornerCnt?false:true,
            // opacity: 0.7,
            side:  THREE.DoubleSide,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        !bDraw && this.scene.add(this.mesh);
        this.mesh.position.set(this.x, this.y, this.Z);
        this.mesh.scale.set(1,-1,1);     //obróć domyślnie bo tego wymaga
    }
}

export {Text}
