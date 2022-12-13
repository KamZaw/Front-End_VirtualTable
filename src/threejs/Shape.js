import { cShape } from '../shapetype.js';
import * as THREE from '../threejs/three.module.js';
import Global from '../Global.js';

const rozmiarPola = 50;

class Shape {
    static Z = -100;       //pozycja na osi Z
    static Zmin = -100;       //pozycja na osi Z
    static Zmax = -100;       //pozycja na osi Z
    static dateToTicks = (date) => date.getTime() * 10000 + 621355968000000000;
    constructor(shapeType, THREE, scene,  y, x, label, ignoreZ) {
        const dt = new Date();
        this.type = shapeType;
        this.scene = scene;
        this.siz = rozmiarPola;                             //rozmiar boku kwadratu węzła
        this.label = label?label: this.constructor.name;    //domyślnba etykieta to nazwa klasy, unikalna - sam obiekt Rectangle
        this.x = x;
        this.y = y;
        this.scaleX = 1;
        this.scaleY = 1;
        this.mesh = null;       //rysowane obiekty threejs
        this.linie = null;
        this.iColor = 0xE9E9E9;
        this.date = dt.toISOString();
        this.ticks = `${Shape.dateToTicks(dt)}`;
        this.Z = Shape.Z;
        
        !ignoreZ ? Shape.Z++:this.Z--;
        !ignoreZ && (Shape.Zmax = Shape.Z+1);
    }
    

    ZPlus(){
//        if(this.Z >= Shape.Zmax) return;       //nie ma potrzeby dodawać, już jest na wierzchu
        this.Z+=2;
        this.mesh && (this.mesh.position.z = this.Z);
        this.linie && (this.linie.position.z = this.Z+1);
        this.node  && this.node.map(pt=> {
            pt.mesh && (pt.mesh.position.z = this.Z);
            pt.linie && (pt.linie.position.z = this.Z+1);
        });
    }
    ZMinus(){
  //      if(this.Z <= -100) return;       //nie ma potrzeby dodawać, już jest na dnie
        this.Z-=2;
        this.mesh && (this.mesh.position.z = this.Z);
        this.linie && (this.linie.position.z = this.Z+1);
        this.node  && this.node.map(pt=> {
            pt.mesh && (pt.mesh.position.z = this.Z);
            pt.linie && (pt.linie.position.z = this.Z+1);
        });
    }
    setScaleX(val) {
        this.scaleX = val;
        this.rescale();
    }
    rescale() {
        this.mesh.scale.set(this.scaleX, this.scaleY);
        this.linie?.scale.set(this.scaleX, this.scaleY);
        this.mvShape([0, 0], [0, 0]);
    }

    setScaleY(val) {
        this.scaleY = val;
        this.rescale();
    }

    rmShape() {
        this.mesh && this.scene.remove(this.mesh);
        this.linie && this.scene.remove(this.linie);
        this.mesh = this.linie = null;
    }
    mvShape(start, stop) {
        this.x += stop[0] - start[0];
        this.y += stop[1] - start[1];
        this.mesh?.position.set(this.x, this.y, this.Z);
        this.linie?.position.set(this.x, this.y, this.Z+1);
    }
 
    //tworzy i wraca kopię obiektu
    
    clone() {
        const obj = new Shape(this.type,THREE,this.scene,this.y,this.x,this.label+"_cc");
        obj.mesh = this.mesh.clone();
        obj.scene = this.scene;
        obj.scene.add(obj.mesh);
        this.linie && (obj.linie = this.linie.clone());
        this.linie && obj.scene.add(obj.linie);
        
        //klonuj na lewo

        switch(obj.type) {
            case cShape.RECT:
                {
                    obj.mesh.position.set(this.mesh.position.x - this.b,this.mesh.position.y,this.mesh.position.z);
                    obj.linie && obj.linie.position.set(this.linie.position.x - this.b,this.linie.position.y,this.linie.position.z);
                            }
                break;
            case cShape.NGON:
                {
                    obj.mesh.position.set(this.mesh.position.x - this.radius*2,this.mesh.position.y,this.mesh.position.z);
                    obj.linie && obj.linie.position.set(this.linie.position.x - this.radius*2,this.linie.position.y,this.linie.position.z);
                }

            default:
                break;
        }


        return obj;
    }

    recreateShape(obj) {

        if(obj == null) return;
        this.ticks = obj.ticks;
        this.date = obj.date !== undefined?obj.date:obj.Date;
        this.sDescription = obj.sDescription;
        this.iColor = obj.iColor;
        this.points = obj.points;

        if(this.mesh !== null) {
            if(this.mesh) 
            this.scene.remove(this.scene.getObjectByName(this.mesh.name));
        if(this.linie)
            this.scene.remove(this.scene.getObjectByName(this.linie.name));
            this.scene.remove(this.mesh);
            this.scene.remove(this.linie);
            //return; //już jest dodany
        }

        // this.texture.repeat.set(1, 1);
        const verts = [];
        const normals = [];
        const pkt = [];
    
        //2
        for(let i=0; i < obj.points.length; i++) {
            verts.push(obj.points[i].x, obj.points[i].y,0);
            normals.push(0,0,1);
            
        }
        if(obj.points.length == 7) {
            pkt.push(new THREE.Vector3(obj.points[1].x, obj.points[1].y, 0));
            pkt.push(new THREE.Vector3(obj.points[0].x, obj.points[0].y, 0));
            pkt.push(new THREE.Vector3(obj.points[0].x, obj.points[0].y, 0));
            pkt.push(new THREE.Vector3(obj.points[2].x, obj.points[2].y, 0));
            pkt.push(new THREE.Vector3(obj.points[2].x, obj.points[2].y, 0));
            pkt.push(new THREE.Vector3(obj.points[4].x, obj.points[4].y, 0));
            pkt.push(new THREE.Vector3(obj.points[4].x, obj.points[4].y, 0));
            pkt.push(new THREE.Vector3(obj.points[1].x, obj.points[1].y, 0));//zamykamy obwód
        }
        else {
            for(let i=0; i < obj.points.length - 1 ; i++) {
                pkt.push(new THREE.Vector3(obj.points[i].x, obj.points[i].y, 0));
                
                pkt.push(new THREE.Vector3(obj.points[i+1].x, obj.points[i+1].y, 0));
            }
            pkt.push(new THREE.Vector3(obj.points[0].x, obj.points[0].y, 0));
        }         
        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    
    
        const material = new THREE.MeshStandardMaterial({
            color: this.iColor,
        });
        material.side = THREE.DoubleSide;
    
    
        let box = new THREE.Mesh(geometry, material);
        box.name = "name";
        //box.position.set(this.x , this.y );
        this.scene.add(box);
    
        const materialL = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            linewidth: 3,
            opacity: 0.7,
        });
        const geometryL = new THREE.BufferGeometry().setFromPoints(pkt);
        const linie = new THREE.LineSegments(geometryL, materialL);
    
        this.scene.add(linie);
       
        //linie.position.set(this.x * a, this.y * a);
        this.mesh = box;
        this.linie = linie;

        this.mesh.name = obj.name;
        this.linie.name = `${obj.name}_linie`;
    }

    select(flag) {
        !flag && this.setDefaultColor();
    }
    drawShape() {

        if(this.mesh !== null)
            return; //już jest dodany

        const a = this.siz;
        const verts = [];
        const normals = [];
    
        //2
        verts.push(0,a,0);
        normals.push(0,0,1);
        //1
        verts.push(0,0,0);
        normals.push(0,0,1);
        //4
        verts.push(a,a,0);
        normals.push(0,0,1);

        //4
        verts.push(a,a,0);
        normals.push(0,0,1);

        verts.push(a,0,0);
        normals.push(0,0,1);
        
        //2
        verts.push(0,0,0);
        normals.push(0,0,1);
        //3
        verts.push(a,0,0);
        normals.push(0,0,1);
            
        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    
        const material = new THREE.MeshStandardMaterial({
            color: this.iColor,
        });
        material.side = THREE.DoubleSide;
    
    
        let box = new THREE.Mesh(geometry, material);
        box.name = "name";
        box.position.set(this.x * a, this.y * a);
        this.scene.add(box);
        const pkt = [];
        
        
        pkt.push(new THREE.Vector3(0, 0, 0));
        pkt.push(new THREE.Vector3(0, a, 0));
        pkt.push(new THREE.Vector3(a, a, 0));
        pkt.push(new THREE.Vector3(a, 0, 0));
        pkt.push(new THREE.Vector3(0, 0, 0));
    
    
        const materialL = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            linewidth: 3,
            opacity: 0.7,
        });
        const geometryL = new THREE.BufferGeometry().setFromPoints(pkt);
        const linie = new THREE.LineSegments(geometryL, materialL);
    
        this.scene.add(linie);
       
        linie.position.set(this.x * a, this.y * a);
        this.mesh = box;
        this.linie = linie;

        this.mesh.name = `${this.label}_${this.x}x${this.y}_mesh`;
        this.linie.name = `${this.mesh.name}_linie`;
        
    }
    setDefaultColor() {
        //this.mesh.material.color.setHex( this.iColor );
        this.linie?.material.color.setHex( 0x000000 );
    }
    setFillColor(fillColor){
        this.linie?.material.color.setHex( fillColor );
    }
    getFillColor(){
        return this.linie? this.linie.material.color:0;
    }
}
export {Shape}