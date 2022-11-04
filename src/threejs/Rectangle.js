import {Shape} from './Nodes.js'

const rozmiarPola = 50;

class Rectangle extends Shape{

    constructor(THREE, scene, y, x, label, a, b, color ) {
        super(THREE, scene, y, x, label);
        this.defaultFillColor = color;
        this.b = b;
        this.a = a;
    }
    drawShape() {

        let i = 0;
        let iMax = 1;
        if(this.mesh !== null)
            return; //już jest dodany
        const a = this.a;
        const b = this.b;

        const uvs = [];
        const verts = [];
        const vertsWF = [];
        const normals = [];
    
        //2
        verts.push(0,a,0);
        normals.push(0,0,1);
        uvs.push(i * 1/iMax,0);
        //1
        verts.push(0,0,0);
        normals.push(0,0,1);
        uvs.push((i+1) * 1/iMax,0);
        //4
        verts.push(b,a,0);
        normals.push(0,0,1);
        uvs.push((i+0)*1/iMax,1);           

        //4
        verts.push(b,a,0);
        normals.push(0,0,1);
        uvs.push((i+0)*1/iMax,1);           
        verts.push(b,0,0);
        normals.push(0,0,1);
        uvs.push((i + 1) * 1/iMax,1);
        
        //2
        verts.push(0,0,0);
        normals.push(0,0,1);
        uvs.push((i+1) * 1/iMax,0);
        //3
        verts.push(b,0,0);
        normals.push(0,0,1);
        uvs.push((i + 1)*1/iMax,1);
            
         
        if (this.THREE == null)
            return;
        let geometry = new this.THREE.BufferGeometry();
        geometry.setAttribute('position', new this.THREE.Float32BufferAttribute(verts, 3));
        geometry.setAttribute('normal', new this.THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new this.THREE.Float32BufferAttribute(uvs, 2));
    
    
        const material = new this.THREE.MeshStandardMaterial({
            color: this.defaultFillColor,//0xE9E9E9,
        });
        material.side = this.THREE.DoubleSide;
    
    
        let box = new this.THREE.Mesh(geometry, material);
        box.name = name;
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
    
    
        const materialL = new this.THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.2,
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

class Oval extends Node {
    constructor(THREE, scene, texture, y, x, label) {
        super(THREE, scene, texture, y, x, label);
    }
}


export {Rectangle, Oval}