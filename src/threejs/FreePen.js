import {Shape} from './Shape.js'
import { cShape } from '../shapetype.js';
import * as THREE from '../threejs/three.module.js';

class FreePen extends Shape{

    constructor(THREE, scene, x, y, prev, label, a, b, color, ignoreZ ) {
        super(cShape.FREEPEN, THREE, scene, x, y, label,ignoreZ);
        this.iColor = parseInt(color);
        this.scene = scene;
        this.b = b;
        this.a = a;
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
        
        
   

        
        const verts = [];
        const normals = [];

        for(let i = 0; i < prev.length-1; i++) {
            
            let a = parseInt(this.a);
            let b = parseInt(this.b);            
            
            let x = prev[i][0];
            let y = prev[i][1];
            
            
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
    
    
        let box = new THREE.Mesh(geometry, material);
        box.name = "name";
        box.position.set(0,0, this.Z);
        this.scene.add(box);
        
        
        console.log(box.boundingBox);

        // box.position.set(this.y , -this.x );
        
        this.mesh = box;

        this.mesh.name = `${this.label}_${this.x}x${this.y}_mesh`;
    }
    // przysłania domyślną procedurę zaznaczania figury
    setDefaultColor() {
        //this.mesh.material.color.setHex( this.iColor );
        this.mesh.material.color.setHex( this.iColor );
    }

    setFillColor(color) {
        //this.mesh.material.color = color;
        this.mesh.material.color.setHex( color );
    }
}


export {FreePen}