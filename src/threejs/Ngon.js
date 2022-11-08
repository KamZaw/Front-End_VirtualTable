import {Shape} from './Shape.js'
import Point from './Point';

class Ngon extends Shape{

    constructor(THREE, scene, y, x, label, radius, ngons, color ) {
        super(THREE, scene, y, x, label);
        this.iColor = parseInt(color);
        this.scene = scene;
        this.radius = radius;
        this.n = ngons;
        this.points = [];
    }
    drawShape() {
        if(this.mesh !== null)
            return; //już jest dodany
        const verts = [];
        const normals = [];
        const pkt = [];    

        let segmentCount = this.n;
        let radius = this.radius;
        for (let i = segmentCount; i > 0; i--) {
            let theta = (i / segmentCount) * Math.PI * 2;
            let x = ~~(Math.cos(theta) * radius);
            let y = ~~(Math.sin(theta) * radius);
            verts.push( x,y, 0);
            normals.push(0,0,1);
            this.points.push(new Point(x + this.y,y - this.x));
            pkt.push(new this.THREE.Vector3(x, y, 0));

            theta = ((i-1) / segmentCount) * Math.PI * 2;
            x = ~~(Math.cos(theta) * radius);
            y = ~~(Math.sin(theta) * radius);
            verts.push( x, y, 0);
            normals.push(0,0,1);
            this.points.push(new Point(x + this.y,y - this.x));
            pkt.push(new this.THREE.Vector3(x, y, 0));

            verts.push(0,0, 0);
            normals.push(0,0,1);
            this.points.push(new Point( this.y, - this.x));
        }
        

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

        
        
    
    
        const materialL = new this.THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            width: 1,
            opacity: 0.7,
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


export {Ngon}