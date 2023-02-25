import {Shape} from './Shape.js'
import {Text} from './Text'
import { cShape } from '../shapetype.js';
import * as THREE from 'three';
// import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';


class Chart extends Shape{

    constructor(scene, x, y, width, height, json, color ) {
        super(cShape.CHART, scene, y, x, json.title, color);

        this.json = JSON.parse(json);
        this.width = width;
        this.height = height;
        this.title = null;
        this.axis = null;
        this.Z = parseInt(this.Z);
    }

    drawShape() {
        const path = new THREE.Shape();
        path.moveTo(0, 0);
        path.lineTo(this.width, 0 );
        path.lineTo(this.width,this.height );
        path.lineTo(0, this.height );
        path.lineTo(0, 0);

        //jak będzie gotowe MESH
        //(linii nie trzeba zmieniać, te się same modyfikują)
        const material = new THREE.MeshStandardMaterial({
            color: this.iColor, //0xE9E9E9,
            side:  THREE.DoubleSide,
        });
        const points = path.getPoints();
        const geometryL = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
            color: 0xffffff,//this.iColor,
            linewidth: 1,
        });
        
        this.linie = new THREE.Line(geometryL, mat);
        this.linie.position.set(this.x, this.y, this.Z+1);
        this.linie.name = `${this.label}_${this.x}x${this.y}_linie`;
        this.scene.add(this.linie);

        const geometry = new THREE.ShapeGeometry(path);
        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.position.set(this.x, this.y, this.Z);
        this.mesh.name = `${this.label}_${this.x}x${this.y}_mesh`;
        this.scene.add(this.mesh);
    }
    movePoint(p) {
        this.width = p.x - this.x;
        this.height = p.y - this.y;
        this.mesh && this.scene.remove(this.mesh);
        this.linie && this.scene.remove(this.linie);
        this.drawShape();
    }
    recreateMesh(bDraw) {

    }

    drawAxis() {
        const margin = 25;
        const path = new THREE.Shape();
        path.moveTo(margin, margin);
        path.lineTo(margin, this.height - margin + 5 );
        path.lineTo(margin,this.height - margin );
        path.lineTo(5,this.height - margin );
        path.lineTo(this.width - margin, this.height -margin );

        const points = path.getPoints();
        const geometryL = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
            color: 0x444444,
            linewidth: 1,
        });
        
        this.axis = new THREE.Line(geometryL, mat);
        this.axis.position.set(0,0, 1);
        this.axis.name = `${this.label}_${this.x}x${this.y}_axis`;
        
        this.mesh.add(this.axis);
    }
    drawBar(p, w,h, color) {
        const path = new THREE.Shape();
        path.moveTo(w, h);
        path.lineTo(w, 0 );
        path.lineTo(0,0 );
        path.lineTo(0, h );
        //path.lineTo(0, 0);

        //jak będzie gotowe MESH
        //(linii nie trzeba zmieniać, te się same modyfikują)
        const material = new THREE.MeshStandardMaterial({
            color: color, //0xE9E9E9,
            side:  THREE.DoubleSide,
        });
        const points = path.getPoints();
        const geometryL = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
            color: 0x000000,//this.iColor,
            linewidth: 1,
        });
        
        const linie = new THREE.Line(geometryL, mat);
        linie.position.set(p.x, p.y, 1);
        linie.name = `${"bar"}_${this.x}x${this.y}_linie`;
        this.mesh.add(linie);

        const geometry = new THREE.ShapeGeometry(path);
        const mesh = new THREE.Mesh( geometry, material );
        mesh.position.set(p.x, p.y, 0);
        
        mesh.name = `${"bar"}_${p.x}x${p.y}_mesh`;
        this.mesh.add(mesh);
        
    }
    fillChart() {
        const margin = 25;
        const barWidth = (this.width - 2 * (margin+10) - 10)/this.json.data.length;

        this.drawAxis();
        const w = this.width - margin;
        const h = this.height - margin;

        let min = 9999999;
        let max = -9999999;
        this.json.data.forEach(d => {  
            max = d.value > max?d.value:max;
            min = d.value < min?d.value:min;
        });
        const mul = (h - margin)/(max - min);
        for(let i = 0; i < this.json.data.length;i++) {
            const d = this.json.data[i];
            const hh = (d.value - min) * mul;
            this.drawBar({x: margin+ 5 + (barWidth+5)*i,y:h - hh}, barWidth,hh, parseInt(d.color));

            const node = new Text(this.mesh, margin+ 5 + (barWidth+5)*i, h+20, d.label,"0x000000",10, 10);
            node.drawShape();
            node.linie.visible = false;
            node.mesh.position.z = 0;
    
        }

        const node = new Text(this.mesh, w/2 - this.json.title.length/2 * 10, 20, this.json.title,"0x000000",12, 10);
        node.drawShape();
        node.linie.visible = false;
        node.mesh.position.z = 0;



    }
}

export default Chart;