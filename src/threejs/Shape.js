import { cShape } from '../shapetype.js';
import * as THREE from 'three';
// import Global from '../Global.js';

const rozmiarPola = 50;

class Shape {
    static Z = 0;       //pozycja na osi Z
    static Zmin = -500;       //pozycja na osi Z
    static Zmax = 500;       //pozycja na osi Z
    static dateToTicks = (date) => date.getTime() * 10000 + 621355968000000000;
    static pad = (num, size) => String(num).padStart(size, '0')
    constructor(shapeType, scene,  y, x, label, color, ignoreZ) {
        const dt = new Date();
        this.type = shapeType;
        this.scene = scene;
        this.iColor = parseInt(color);
        this.siz = rozmiarPola;                             //rozmiar boku kwadratu węzła
        this.label = label?label: this.constructor.name;    //domyślnba etykieta to nazwa klasy, unikalna - sam obiekt Rectangle
        this.x = x;
        this.y = y;
        this.scaleX = 1;
        this.scaleY = 1;
        this.mesh = null;       //rysowane obiekty threejs
        this.linie = null;
        this.date = dt.toISOString();
        this.ticks = `${Shape.dateToTicks(dt)}`;
        this.id = parseInt(Math.random()*100000000000000000);
        this.Z = Shape.Z;
        this.mirrorX = 1;
        this.mirrorY = 1;
        this.rotate = 0;
        
        // !ignoreZ ? Shape.Z++:this.Z--;
        // !ignoreZ && (Shape.Zmax = Shape.Z+1);
    }
    drawShape() {}
    setMirrorX() {
        this.mirrorX *= -1;
        this.rescale();
    }
    mX(mX) {
        if(!mX) return;
        this.mirrorX = mX;
        this.rescale();
    }
    
    mY(mY) {
        if(!mY) return;
        this.mirrorY = mY;
        this.rescale();
    }

    setMirrorY() {
        this.mirrorY *= -1;
        this.rescale();
    }

    setRotate(rot) {
        if(rot !== 0)
            if(!rot) return;
        try {
            this.rotate = rot;
            rot = -(Math.PI * rot)/180.0;
            this.mesh && (this.mesh.rotation.z = rot);
            this.node?.forEach(n => {
                n.mesh && (n.label !== 'linie' && (n.mesh.rotation.z = -rot));   //nie obracaj węzłów
            });
        }
        catch(err) {
            
        }
    }
    ZPlus(){
//        if(this.Z >= Shape.Zmax) return;       //nie ma potrzeby dodawać, już jest na wierzchu
        this.Z+=10;
        this.mesh && (this.mesh.position.z = this.Z);
        // this.linie && (this.linie.position.z = this.Z+1);
    }
    ZMinus(){
  //      if(this.Z <= -100) return;       //nie ma potrzeby dodawać, już jest na dnie
        this.Z-=10;
        this.mesh && (this.mesh.position.z-=4);
        // this.linie && (this.linie.position.z-=4);
    }
    setZ(Z) {
        this.Z = Z;
        this.mesh && (this.mesh.position.z = Z);
    }
    //metoda do przysłonięcia w każdej klasie
    toSVG() {}

    setScaleX(val) {
        if(!val || val === 0) return;
        this.scaleX = val;
        this.rescale();
    }
    rescale() {
        
        this.mesh?.scale.set(this.scaleX * this.mirrorX, this.scaleY * this.mirrorY);
        this.node?.forEach(n => {
            //reskaluje do normalnej wielkości punkty node aby nie rosły/malały wraz z całą figurą
            n.mesh && (n.label !== 'linie' && (n.mesh.scale.set((1.0/this.scaleX) * this.mirrorX, (1.0/this.scaleY) * this.mirrorY)));   //nie obracaj węzłów
        });
    }

    setScaleY(val) {
        if(!val || val === 0) return;
        this.scaleY = val;
        this.rescale();
    }

    rmShape() {
        this.mesh && this.scene.remove(this.mesh);
        this.mesh = this.linie = null;
    }
    mvShape(start, stop) {
        this.x += stop[0] - start[0];
        this.y += stop[1] - start[1];
        this.mesh?.position.set(this.x, this.y, this.mesh?.position.z);
        //this.linie?.position.set(this.x, this.y, this.Z+1);
    }
 
    toJSON() {
        return { 
            type: this.type,
            // ticks: this.ticks,
            x: this.x,
            y: this.y,
            Z: this.Z,
            label: this.label,
            color: this.iColor,
            mirrorX: this.mirrorX,
            mirrorY: this.mirrorY,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            opacity: 1.0,
            rotate: this.rotate,
            id: this.id,
        };
    }
    carbonCopy(obj) {

        if(typeof obj === "boolean") return this;        //to nie jest obiekt graficzny
        if(!obj) return this;
        obj.mirrorX = this.mirrorX;
        obj.mirrorY = this.mirrorY;
        obj.id = this.id;
        obj.Z = this.Z;
        obj.rotate = this.rotate;
        obj.scaleX = this.scaleX;
        obj.scaleY = this.scaleY;
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
                obj.mesh.position.set(this.mesh.position.x - this.b,this.mesh.position.y,this.mesh.position.z);
                obj.linie && obj.linie.position.set(this.linie.position.x - this.b,this.linie.position.y,this.linie.position.z);
                break;
            case cShape.NGON:
                obj.mesh.position.set(this.mesh.position.x - this.radius*2,this.mesh.position.y,this.mesh.position.z);
                obj.linie && obj.linie.position.set(this.linie.position.x - this.radius*2,this.linie.position.y,this.linie.position.z);
                break;
            default:
                break;
        }
        obj.id = this.id;

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
        if(obj.points.length === 7) {
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