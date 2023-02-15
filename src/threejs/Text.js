import {Shape} from './Shape.js'
import { cShape } from '../shapetype.js';
import * as THREE from 'three';
import Global from '../Global.js';
import { FontLoader } from './FontLoader.js';
import { TextGeometry } from'./TextGeometry.js'




class Text extends Shape{

    static font = null;
    static loadFontOnce() {
        const loader = new FontLoader();
        loader.load( 'http://localhost:3000/helvetiker_regular.typeface.json', (font) => Text.font = font);
    }
    constructor(scene, x, y, label, color,  size, height) {
        super(cShape.TEXT, scene, y, x, label, color);
        this.size = parseInt(size);
        this.height = parseInt(height);
        this.mirrorY = -1;
    }
    toJSON() {
        const obj = super.toJSON();
        return {
            ...obj,
            size: this.size,
            height: this.height,
        };
    }
    setFillColor(color) {
        //this.mesh.material.color = color;
        this.mesh.material.color.setHex( color );
    }
    setDefaultColor() {
        this.mesh.material.color.setHex( this.iColor );
    }
    carbonCopy(bDraw) {
        
        let obj = new Text(this.scene, this.x, this.y, this.label,this.iColor,this.size,this.height);
        super.carbonCopy(obj);
        obj.drawText(bDraw);
        
        return obj;
    }
    rescale() {
        super.rescale();
        super.mvShape([0, 0], [0, 0]);
    }

    toSVG() {
        let str = "";

        str += `<text
        xml:space="preserve"
        style="font-style:normal;font-weight:bold;font-size:${this.size}px;line-height:1.25;font-family:sans-serif;fill:#${Shape.pad(this.iColor.toString(16),6)};fill-opacity:1;stroke:none"
        x="${this.x}"
        y="${this.y}"
        id="text1904"><tspan
          sodipodi:role="line"
          id="tspan1902"
          x="${this.x}"
          y="${this.y}">${this.label}</tspan></text>\n`;

        return str;
    }

    mvShape(start, stop) {
        // this.linie && (this.linie.geometry.attributes.position.needsUpdate = true);
        // this.mesh && (this.mesh.geometry.attributes.position.needsUpdate = true);
        // super.mvShape(start,stop);
        this.x += stop[0] - start[0];
        this.y += stop[1] - start[1];
        this.scene.remove(this.mesh);
        this.scene.remove(this.linie);
        this.drawShape();
        this.select(true);
        // this.mesh?.position.set(this.x, this.y, this.Z);
        // this.linie?.position.set(this.x, this.y, this.Z+1);

    }
    drawShape = () => this.drawText(true);

    drawText(bDraw) {

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
        bDraw && this.scene.add(this.mesh);
        
        
        this.mesh.position.set(this.x, this.y, this.Z);
        super.rescale();
        this.drawBoundingLines(bDraw);
    }

    select(flag) {
        !flag && super.select(flag);
        // flag && this.setFillColor(0xff0000);

        this.linie && (this.linie.visible = flag);
        return this.node;
    }

    drawBoundingLines(bDraw) {
   
        var boundingBox = new THREE.Box3().setFromObject(this.mesh);


        const minX = boundingBox?.min.x;
        const maxX = boundingBox?.max.x;
        const minY = boundingBox?.min.y;
        const maxY = boundingBox?.max.y;

        if(!minX) return;
        let b = 0; 
        const path = new THREE.Shape();
        path.moveTo(minX-b, minY-b);
        path.lineTo(maxX+b, minY-b);
        path.lineTo(maxX+b, maxY+b);
        path.lineTo(minX-b, maxY+b);
        path.lineTo(minX-b, minY-b);
        const materialL = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 1,
            transparent: true,
            opacity:0.5,
        });
        
        const points = path.getPoints();
        const geometryL = new THREE.BufferGeometry().setFromPoints(points);
        
        this.linie = new THREE.Line(geometryL, materialL);
        // this.linie.position.set(this.x, this.y, boundingBox.max.z);
        // this.x = this.y = 0;
        // this.linie.visible = !false;
        bDraw && this.scene.add(this.linie);
        this.linie.name = `${this.label}_${this.x}x${this.y}_linie`;
    }
}

export {Text}
