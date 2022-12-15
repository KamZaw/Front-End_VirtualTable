import {Shape} from './Shape.js'
import { cShape } from '../shapetype.js';
import * as THREE from 'three';

class FreePen extends Shape{

    constructor(scene, x, y, prev, label, size, color, ignoreZ ) {
        super(cShape.FREEPEN, scene, x, y, label, color, ignoreZ);
        this.size = parseInt(size);
        this.x = this.y = 0;
        this.points = [];
        this.prev = prev[0]?[...prev,[x,y]]:[[x,y], [x,y]];
    }
    drawShape() {
        if(this.mesh !== null)
            return; //już jest dodany
        if (THREE == null)
            return;

        const prev = this.prev;
        
        
   

        let minX = 9999, minY = 99999, maxX = -99999, maxY = -99999;
        
        const verts = [];
        const normals = [];

        for(let i = 0; i < prev.length-1; i++) {
            
            let a = this.size;
            let b = this.size;            
            
            let x = prev[i][0];
            let y = prev[i][1];
            
            if(x < minX)
                minX = x;
            if(x > maxX)
                maxX = x;
            if(y < minY)
                minY = y;
            if(y > maxY)
                maxY = y;
            
            const sX = prev[i+1][0];
            const sY = prev[i+1][1];
            if (i < prev.length-2)
                if(sX == prev[i+2][0] && sY == prev[i+2][1]) {
                    i++;
                    continue;
                }


            if(x < sX) {
                a = -a;
            }
            
            if(y > sY) {
                b = -b;
            }
            //buduj w lewo/prawo a nie w dół.górę
            if(Math.abs(y-sY) < Math.abs(x - sX)) {     //dodawaj nowy z punktów 4 i 3 a nie 2 i 4
                //2
                verts.push(sX,b+sY,0);
                normals.push(0,0,1);
                //1
                verts.push(sX,sY,0);
                normals.push(0,0,1);
                //4
                verts.push(x,y,0);
                normals.push(0,0,1);

                //4
                verts.push(x,y,0);
                normals.push(0,0,1);
                
                //2
                verts.push(sX,b+sY,0);
                normals.push(0,0,1);
                //3
                verts.push(x,b+y,0);
                normals.push(0,0,1);
            }
            else {
                //2
                verts.push(sX,b+sY,0);
                //this.points.push(new Point(0 + sX,a + sY));
                normals.push(0,0,1);
                //1
                verts.push(x,y,0);
                //this.points.push(new Point(0 + x,0 + y));
                normals.push(0,0,1);
                //4
                verts.push(a+sX,b+sY,0);
                //this.points.push(new Point(b)+ sX,a + sY);
                normals.push(0,0,1);

                //4
                verts.push(a+sX,b+sY,0);
                //this.points.push(new Point((b) + sX,a + sY));
                normals.push(0,0,1);
                
                //2
                verts.push(x,y,0);
                //this.points.push(new Point(sX,sY));
                normals.push(0,0,1);
                //3
                verts.push(a+x,y,0);
                //this.points.push(new Point((b)+ x,y));
                normals.push(0,0,1);
            }
        }            
         
        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    
    
        const material = new THREE.MeshStandardMaterial({
            color: this.iColor,//0xE9E9E9,
            wireframe: !true,
        });
        material.side = THREE.DoubleSide; 
    
    
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.name = "name";
        this.mesh.position.set(0,0, this.Z);
        this.scene.add(this.mesh);
        this.mesh.name = `${this.label}_${this.x}x${this.y}_mesh`;

        let b = this.size; 
        const path = new THREE.Path();
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
        this.linie.position.set(this.x, this.y, this.Z+1);
        if(prev.length > 2)
            this.scene.add(this.linie);
        
        this.linie.name = `${this.label}_${this.x}x${this.y}_linie`;
        
    }
    // przysłania domyślną procedurę zaznaczania figury
    setFillColor(color) {
        this.mesh.material.color.setHex( color ^ this.iColor );
    }
    setDefaultColor() {
        this.mesh.material.color.setHex( this.iColor );
    }
    rescale() {
        super.rescale();
        this.mvShape([0, 0], [0, 0]);
    }

    select(flag) {
        !flag && super.select(flag);
        this.linie && (this.linie.visible = flag);
        return this.node;
    }

    toJSON() {
        this.prev.pop();        
        const obj = super.toJSON();
        return {
            ...obj,
            prev: this.prev.toString(),
            size: this.size, 
            points: this.linie?.geometry.attributes.position.array.toString(),
        };
    }
    //tworzy i wraca kopię obiektu
    carbonCopy(bDraw) {
        let obj = new FreePen(this.scene,this.x,this.y, this.prev, this.label,this.size,this.iColor, this.ignoreZ);
        
        //obj = new Shape(this.type,THREE,this.scene,this.y,this.x,this.label);

        obj.mesh= new THREE.Mesh( 
            this.mesh.geometry.clone(), 
            new THREE.MeshStandardMaterial().copy( this.mesh.material )
        );
        //obj.mesh.position.set(this.mesh.position.x,this.mesh.position.y,this.mesh.position.z);
        obj.mesh.name=this.mesh.name;
        obj.scene = this.scene;
        bDraw && obj.scene.add(obj.mesh);
        if(this.linie) {
            obj.linie = new THREE.Line( 
                this.linie.geometry.clone(), 
                new THREE.LineBasicMaterial().copy( this.linie.material )
            );
            obj.linie.name=this.linie.name;
            bDraw && obj.scene.add(obj.linie);
            //obj.linie.position.set(this.linie.position.x,this.linie.position.y,this.linie.position.z);
        }
        
        this.node && (obj.node = []);
        this.node?.map((n)=>{
            const crn = n.carbonCopy(true);
            crn.parent = obj;
            crn.mesh= new THREE.Mesh( 
                n.mesh.geometry.clone(), 
                new THREE.MeshStandardMaterial().copy( n.mesh.material )
            );
            obj.mesh.position.set(n.x,n.y,n.Z);
            crn.mesh.name=n.mesh.name;
            bDraw && crn.scene.add(crn.mesh);
            if(n.linie) {
                crn.linie = new THREE.LineSegments( 
                    n.linie.geometry.clone(), 
                    new THREE.LineBasicMaterial().copy( n.linie.material )
                );
                crn.scene.add(crn.linie);
                obj.linie.position.set(n.x,n.y,n.Z);
                crn.linie.name=n.linie.name;
            }
                
            obj.node.push(crn);
        });

        this.node && obj.mvShape([0,0],[0,0]);
        
        // this.node && obj.mesh.material.color.setHex(0xFF0000);
        return obj;
    }

        
}


export {FreePen}