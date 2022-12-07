import {Shape} from './Shape.js'
import Point from './Point';
import { cShape } from '../shapetype.js';
import { Rectangle} from './Rectangle'
import * as THREE from '../threejs/three.module.js';
import Global from '../Global.js';



class Ngon extends Shape{

    constructor(THREE, scene, x, y, label, radius, ngons, color ) {
        super(cShape.NGON, THREE, scene, y, x, label);
        this.iColor = parseInt(color);
        this.scene = scene;
        this.radius = radius;
        this.n = ngons;
        this.points = [];
        this.node = [];

    }
    rmShape() {
        this.node.length> 0 && this.node.map((pt) => pt.rmShape());
        super.rmShape();
    }
    select(flag) {
        !flag && super.select(flag);
        this.node.map((pt) => {
            pt.mesh && (pt.mesh.visible = flag);
            pt.linie && (pt.linie.visible = flag);
        });
        return this.node;
    }
    mvShape(start, stop) {
        super.mvShape(start, stop); //rusza kornerem NGONa
        if(this.parent) {
            
            
            return;
        }
        else {      //przesuń całą figurę wraz z kornerami

        }

        this.node.map((pt) => {
            pt.x += stop[0] - start[0];
        pt.y += stop[1] - start[1];
        pt.mesh && pt.mesh.position.set(pt.x, pt.y, pt.Z);
        pt.linie && pt.linie.position.set(pt.x, pt.y, pt.Z);
        });
    }
    drawShape() {
        if(this.mesh !== null)
            return; //już jest dodany
        const verts = [];
        const normals = [];
        const pkt = [];    
        const halfSize = Global.halfSize;
        const cornerSize = Global.cornerSize;

        let segmentCount = this.n;
        let radius = this.radius;
        for (let i = segmentCount; i > 0; i--) {
            let theta = (i / segmentCount) * Math.PI * 2;
            let x = ~~(Math.cos(theta) * radius);
            let y = ~~(Math.sin(theta) * radius);
            this.node.push(new Rectangle(THREE, this.scene, x-halfSize + this.x, y-halfSize + this.y, "corner",cornerSize,cornerSize, "0x000000", 0, true,segmentCount - i ));
            verts.push( x,y, 0);
            normals.push(0,0,1);
            pkt.push(new THREE.Vector3(x, y, 0));

            theta = ((i-1) / segmentCount) * Math.PI * 2;
            x = ~~(Math.cos(theta) * radius);
            y = ~~(Math.sin(theta) * radius);
            

            verts.push( x, y, 0);
            normals.push(0,0,1);
            pkt.push(new THREE.Vector3(x, y, 0));

            verts.push(1,1, 0);
            normals.push(0,0,1);
        }
        for(let c of this.node)
            c.parent = this;        

        if (THREE == null)
            return;
        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    
    
        const material = new THREE.MeshStandardMaterial({
            color: this.iColor,//0xE9E9E9,
            wireframe: !true,
        });
        material.side = THREE.DoubleSide; 
    
    
        let box = new THREE.Mesh(geometry, material);
        box.name = "name";
        this.scene.add(box);

        
        
    
    
        const materialL = new THREE.LineBasicMaterial({
            color: 0x000000,
            // transparent: true,
            linewidth: 1,
            // opacity: 0.7,
        });
        const geometryL = new THREE.BufferGeometry().setFromPoints(pkt);
        const linie = new THREE.LineSegments(geometryL, materialL);
    
        this.scene.add(linie);
        box.position.set(this.x , this.y, this.Z );
        linie.position.set(this.x , this.y, this.Z);
        this.mesh = box;
        this.linie = linie;

        this.mesh.name = `${this.label}_${this.x}x${this.y}_mesh`;
        this.linie.name = `${this.label}_${this.x}x${this.y}_linie`;
  

        this.node.map((pt) => pt.drawShape());
    }
}


export {Ngon}