import {Shape} from './Shape.js'
import Point from './Point';

class Rectangle extends Shape{

    constructor(THREE, scene, y, x, label, a, b, color ) {
        super(THREE, scene, y, x, label);
        this.iColor = parseInt(color);
        this.scene = scene;
        this.b = b;
        this.a = a;
        this.points = [];
    }
    drawShape() {
        if(this.mesh !== null)
            return; //już jest dodany
        const a = this.a;
        const b = this.b;

        const verts = [];
        const normals = [];
    
        //2
        verts.push(0,a,0);
        this.points.push(new Point(0 + this.y,a - this.x));
        normals.push(0,0,1);
        //1
        verts.push(0,0,0);
        this.points.push(new Point(0 + this.y,0 - this.x));
        normals.push(0,0,1);
        //4
        verts.push(b,a,0);
        this.points.push(new Point(parseInt(b)+ this.y,a - this.x));
        normals.push(0,0,1);

        //4
        verts.push(b,a,0);
        this.points.push(new Point(parseInt(b) + this.y,a - this.x));
        normals.push(0,0,1);
        verts.push(b,0,0);
        this.points.push(new Point(parseInt(b) + this.y,0 - this.x));
        normals.push(0,0,1);
        
        //2
        verts.push(0,0,0);
        this.points.push(new Point(0 + this.y,0 - this.x));
        normals.push(0,0,1);
        //3
        verts.push(b,0,0);
        this.points.push(new Point(parseInt(b)+ this.y,0 - this.x));
        normals.push(0,0,1);
            
         
        if (this.THREE == null)
            return;
        let geometry = new this.THREE.BufferGeometry();
        geometry.setAttribute('position', new this.THREE.Float32BufferAttribute(verts, 3));
        geometry.setAttribute('normal', new this.THREE.Float32BufferAttribute(normals, 3));
    
    
        const material = new this.THREE.MeshStandardMaterial({
            color: this.iColor,//0xE9E9E9,
        });
        material.side = this.THREE.DoubleSide; 
    
    
        let box = new this.THREE.Mesh(geometry, material);
        box.name = "name";
        this.scene.add(box);
        const pkt = [];
        
        
        pkt.push(new this.THREE.Vector3(0, 0, 0));
        pkt.push(new this.THREE.Vector3(0, a, 0));
        
        pkt.push(new this.THREE.Vector3(0, a, 0));
        pkt.push(new this.THREE.Vector3(b, a, 0));
        
        pkt.push(new this.THREE.Vector3(b, a, 0));
        pkt.push(new this.THREE.Vector3(b, 0, 0));
        
        pkt.push(new this.THREE.Vector3(b, 0, 0));
        pkt.push(new this.THREE.Vector3(0, 0, 0));
    
    
        const materialL = new this.THREE.LineDashedMaterial({
            color: 0x000000,
            linewidth: 3,
            dashSize: 3,
            gapSize: 1,
        });
        const geometryL = new this.THREE.BufferGeometry().setFromPoints(pkt);
        const linie = new this.THREE.LineSegments(geometryL, materialL);
    
        this.scene.add(linie);
        box.position.set(this.y , -this.x );
        linie.position.set(this.y , -this.x);
        this.mesh = box;
        this.linie = linie;

        this.mesh.name = `${this.label}_${this.x}x${this.y}_mesh`;
        this.linie.name = `${this.label}_${this.x}x${this.y}_linie`;
    }
}


export {Rectangle}