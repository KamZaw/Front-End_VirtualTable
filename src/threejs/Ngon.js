import {Shape} from './Shape.js'
import { cShape } from '../shapetype.js';
import * as THREE from '../threejs/three.module.js';
import Global from '../Global.js';



class Ngon extends Shape{

    constructor(THREE, scene, x, y, label, radius, ngons, color, b, offsetRot, iNode, cornerCnt ) {
        super(cShape.NGON, THREE, scene, y, x, label);
        this.iColor = parseInt(color);
        this.scene = scene;
        this.radius = radius;
        this.n = ngons;
        this.node = iNode?null:[];                  //definiuj liste jeśli true
        this.offsetRot = offsetRot?Math.PI/4:0;     //dla Rectangle PI/4.
        this.b = b?b:radius;
        this.cornerCnt = cornerCnt;

    }
    rmShape() {
        this.node?.map((pt) => pt.rmShape());
        super.rmShape();
    }
    select(flag) {
        !flag && super.select(flag);
        this.node?.map((pt) => {
            pt.mesh && (pt.mesh.visible = flag);
            pt.linie && (pt.linie.visible = flag);
        });
        return this.node;
    }
    mvShape(start, stop) {
        
        if(!this.parent ) {
            super.mvShape(start, stop);
                 this.node?.map((pt) => {
                    pt.x += stop[0] - start[0];
                    pt.y += stop[1] - start[1];
                    pt.mesh && pt.mesh.position.set(pt.x, pt.y, pt.Z);
                    pt.linie && pt.linie.position.set(pt.x, pt.y, pt.Z);
                });
            return;
        }

        //przesuwamy cornery
        this.parent.linie.geometry.attributes.position.needsUpdate = true;
        this.parent.linie.geometry.attributes.position.array[this.cornerCnt*6] += stop[0] - start[0];
        this.parent.linie.geometry.attributes.position.array[this.cornerCnt*6 + 1] += stop[1] - start[1];
        const indxX = this.cornerCnt == 0?  this.parent.linie.geometry.attributes.position.array.length-3:this.cornerCnt*6-3;
        const indxY = this.cornerCnt == 0?  this.parent.linie.geometry.attributes.position.array.length-2:this.cornerCnt*6-3+1;
        this.parent.linie.geometry.attributes.position.array[indxX] += stop[0] - start[0];
        this.parent.linie.geometry.attributes.position.array[indxY] += stop[1] - start[1];


        this.parent.mesh.geometry.attributes.position.needsUpdate = true;
        this.parent.mesh.geometry.attributes.position.array[this.cornerCnt*9] += stop[0] - start[0];
        this.parent.mesh.geometry.attributes.position.array[this.cornerCnt*9 + 1] += stop[1] - start[1];
        const indxXm = this.cornerCnt == 0?  this.parent.mesh.geometry.attributes.position.array.length-6:this.cornerCnt*9-6;
        const indxYm = this.cornerCnt == 0?  this.parent.mesh.geometry.attributes.position.array.length-5:this.cornerCnt*9-6+1;
        this.parent.mesh.geometry.attributes.position.array[indxXm] += stop[0] - start[0];
        this.parent.mesh.geometry.attributes.position.array[indxYm] += stop[1] - start[1];
        super.mvShape(start, stop);     //przesuwa same czarne cornery NGONa
    }
        //tworzy i wraca kopię obiektu
    carbonCopy() {
        let obj = new Ngon(THREE,this.scene,this.x,this.y,this.label,this.radius,this.n,this.iColor,this.b, this.offsetRot, this.node == null, this.cornerCnt);
        
        //obj = new Shape(this.type,THREE,this.scene,this.y,this.x,this.label);

        obj.mesh= new THREE.Mesh( 
            this.mesh.geometry.clone(), 
            new THREE.MeshStandardMaterial().copy( this.mesh.material )
        );
        //obj.mesh.position.set(this.mesh.position.x,this.mesh.position.y,this.mesh.position.z);
        obj.mesh.name=this.mesh.name;
        obj.scene = this.scene;
        obj.scene.add(obj.mesh);
        if(this.linie) {
            obj.linie = new THREE.LineSegments( 
                this.linie.geometry.clone(), 
                new THREE.LineBasicMaterial().copy( this.linie.material )
            );
            obj.linie.name=this.linie.name;
            obj.scene.add(obj.linie);
            //obj.linie.position.set(this.linie.position.x,this.linie.position.y,this.linie.position.z);
        }
        
        this.node && (obj.node = []);
        this.node?.map((n)=>{
            const crn = n.carbonCopy();
            crn.parent = obj;
            

            crn.mesh= new THREE.Mesh( 
                n.mesh.geometry.clone(), 
                new THREE.MeshStandardMaterial().copy( n.mesh.material )
            );
            obj.mesh.position.set(n.x,n.y,n.Z);
            crn.mesh.name=n.mesh.name;
            crn.scene.add(crn.mesh);
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
        
        this.node && obj.mesh.material.color.setHex(0xFF0000);
        return obj;
    }

    drawShape() {
        if(this.mesh !== null)
            return; //już jest dodany
        const verts = [];
        const normals = [];
        const pkt = [];    
        const cornerSize = Global.cornerSize;

        let segmentCount = this.n;
        const radius = this.radius*Math.SQRT2/2;//Math.sqrt((this.radius*this.radius + this.b * this.b)/4)
        const b = (this.b/this.radius);
        for (let i = segmentCount; i > 0; i--) {
            let theta = (i / segmentCount) * Math.PI * 2 +this.offsetRot;
            let x = Math.round(Math.cos(theta) * radius *b);
            let y = Math.round(Math.sin(theta) * radius);
            this.node?.push(new Ngon(THREE, this.scene, x + this.x, y + this.y, "corner",cornerSize,4, "0x000000", cornerSize, true, true, segmentCount - i));
            verts.push( x,y, 0);
            normals.push(0,0,1);
            pkt.push(new THREE.Vector3(x, y, 0));

            theta = ((i-1) / segmentCount) * Math.PI * 2+this.offsetRot;
            x = Math.round(Math.cos(theta) * radius *b);
            y = Math.round(Math.sin(theta) * radius);
            

            verts.push( x, y, 0);
            normals.push(0,0,1);
            pkt.push(new THREE.Vector3(x, y, 0));

            verts.push(1,1, 0);
            normals.push(0,0,1);
        }
        if(this.node){
            for(let c of this.node)
                c.parent = this;        
        }
        
        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    
    
        const material = new THREE.MeshStandardMaterial({
            color: this.iColor,//0xE9E9E9,
            // wireframe: true,
            // transparent: this.cornerCnt?false:true,
            // opacity: 0.7,
            
        });
        material.side = THREE.DoubleSide; 
    
    
        let box = new THREE.Mesh(geometry, material);
        box.name = "name";
        this.scene.add(box);
        
    
    
        const materialL = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 1,
            transparent: false,
        });
        const geometryL = new THREE.BufferGeometry().setFromPoints(pkt);
        const linie = new THREE.LineSegments(geometryL, materialL);
    
        this.scene.add(linie);
        box.position.set(this.x , this.y, this.Z );
        linie.position.set(this.x , this.y, this.Z+1);
        this.mesh = box;
        this.linie = linie;

        this.mesh.name = `${this.label}_${this.x}x${this.y}_mesh`;
        this.linie.name = `${this.label}_${this.x}x${this.y}_linie`;
  

        this.node?.map((pt) => pt.drawShape());
    }
}


export {Ngon}