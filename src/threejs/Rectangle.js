import {Shape} from './Shape.js'
import Point from './Point';
import { cShape } from '../shapetype.js';
import * as THREE from '../threejs/three.module.js';
import Global from '../Global.js';


const cornermap = [
    {mesh:[3,4,9,10], linie:[0,1,21,22]},
    {mesh:[6,7], linie:[3,4,6,7]},
    {mesh:[0,1,12,13], linie:[9,10,12,13]},
    {mesh:[15,16], linie:[15,16,18,19]},
];

//3 1 2 2 3 4
class Rectangle extends Shape{

    constructor(THREE, scene, x, y, label, a, b, color, rot, bNode, cornerCnt ) {
        super(cShape.RECT, THREE, scene, y, x, label, bNode);
        this.iColor = parseInt(color);
        this.scene = scene;
        this.b = parseInt(b);
        this.a = parseInt(a);
        this.points = [];
        this.node = [];
        this.rot = rot/180.0 * Math.PI;     //zamiana na radiany
        //przechowuje id wierzchołka dla 
        this.cornerCnt = cornerCnt;
        if(!bNode) {
            const halfSize = Global.halfSize;
            const cornerSize = Global.cornerSize;
            this.node.push(new Rectangle(THREE, this.scene, x-halfSize,            y-halfSize + this.a, "corner",cornerSize,cornerSize, "0x000000", rot, true,1 ));
            this.node.push(new Rectangle(THREE, this.scene, x-halfSize,            y-halfSize, "corner",cornerSize,cornerSize, "0x000000", rot, true , 0));    //(0,0)
            this.node.push(new Rectangle(THREE, this.scene, x-halfSize + this.b,   y-halfSize + this.a, "corner",cornerSize,cornerSize, "0x000000", rot, true,2 ));
            this.node.push(new Rectangle(THREE, this.scene, x-halfSize + this.b,   y-halfSize, "corner",cornerSize,cornerSize, "0x000000", rot, true,3 ));
            for(let c of this.node)
                c.parent = this;
        }

    }

    //tworzy i wraca kopię obiektu
    carbonCopy() {
        let obj = new Rectangle(this.THREE, this.scene, this.x, this.y, this.label, this.a, this.b, this.iColor, 0);                              

        obj.mesh= new THREE.Mesh( 
            this.mesh.geometry.clone(), 
            new THREE.MeshStandardMaterial().copy( this.mesh.material )
        );
        obj.mesh.position.set(this.mesh.position.x,this.mesh.position.y,this.mesh.position.z);
        obj.scene = this.scene;
        obj.scene.add(obj.mesh);
        if(this.linie) {
            obj.linie = new THREE.LineSegments( 
                this.linie.geometry.clone(), 
                new THREE.LineBasicMaterial().copy( this.mesh.material )
            );
            obj.scene.add(obj.linie);
            obj.linie.position.set(this.linie.position.x,this.linie.position.y,this.linie.position.z);
        }

        obj.node.map((pt) => pt.drawShape());
        // obj.node = [];
        // this.node.map((n)=>{
        //     const crn = n.carbonCopy();
        //     this.cornerCnt &&(crn.cornerCnt = this.cornerCnt);
        //     crn.type = n.type;
        //     crn.label = this.label;
        //     crn.node = [];
        //     crn.parent = obj;
        //     obj.node.push(crn);
        // })
        return obj;
    }
    //TODO: tworzymy kopię dla historii i bazy firebase
    copy() {
        let obj = new Rectangle(this.THREE, this.scene, this.x, this.y, this.label, this.a, this.b, this.iColor, 0);                              

        obj.createFromPoints(this.mesh.geometry.attributes.position.array);

        obj.mesh.position.set(this.mesh.position.x,this.mesh.position.y,this.mesh.position.z);
        obj.scene = this.scene;
        obj.scene.add(obj.mesh);
        if(this.linie) {
            obj.linie = new THREE.LineSegments( 
                this.linie.geometry.clone(), 
                new THREE.LineBasicMaterial().copy( this.mesh.material )
            );
            obj.scene.add(obj.linie);
            obj.linie.position.set(this.linie.position.x,this.linie.position.y,this.linie.position.z);
        }

        obj.node.map((pt) => pt.drawShape());
    }
    
    mvShape(start, stop) {
        //przesuwamy corner
        if(!this.parent ) {
            //super.mvShape(start, stop);
            this.node && this.node.map((pt) => {
                pt.mvShape(start, stop);
            });            
            return;
        }

        if(this.parent.type === cShape.RECT) {
            {   
                this.parent.mesh.geometry.attributes.position.needsUpdate = true;

                for(let i = 0; i < cornermap[this.cornerCnt].mesh.length; i+=2)
                {
                    this.parent.mesh.geometry.attributes.position.array[cornermap[this.cornerCnt].mesh[i]] += stop[0] - start[0];
                    this.parent.mesh.geometry.attributes.position.array[cornermap[this.cornerCnt].mesh[i+1]] += stop[1] - start[1];
                }
                this.parent.linie.geometry.attributes.position.needsUpdate = true;
                this.parent.linie.geometry.attributes.position.array[cornermap[this.cornerCnt].linie[0]] += stop[0] - start[0];
                this.parent.linie.geometry.attributes.position.array[cornermap[this.cornerCnt].linie[1]] += stop[1] - start[1];
                this.parent.linie.geometry.attributes.position.array[cornermap[this.cornerCnt].linie[2]] += stop[0] - start[0];
                this.parent.linie.geometry.attributes.position.array[cornermap[this.cornerCnt].linie[3]] += stop[1] - start[1];
                super.mvShape(start, stop);     //przesuwa cornery RECTa
            }
        }
        if(this.parent.type === cShape.NGON) {
            {   
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
                super.mvShape(start, stop);     //przesuwa cornery NGONa
            }
        }
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
    drawShape() {
        if(this.mesh !== null)
            return; //już jest dodany
        const a = this.a;
        const b = this.b;

        const verts = [];
        const normals = [];
    
  
        //3
        verts.push(b,a,0);
        normals.push(0,0,1);
      //1
        verts.push(0,0,0);
        normals.push(0,0,1);       
    
       //2
        verts.push(0,a,0);
        normals.push(0,0,1);     

        
        //2
        verts.push(0,0,0);
        normals.push(0,0,1);
        
        //3
        verts.push(b,a,0);
        normals.push(0,0,1);
          //4
        verts.push(b,0,0);
        normals.push(0,0,1);          
         

        let geometry = new THREE.BufferGeometry();
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.attributes.position.needsUpdate = true;
    
        const material = new THREE.MeshStandardMaterial({
            color: this.iColor,//0xE9E9E9,
        });
        // material.side = THREE.DoubleSide; 
    
    
        let box = new THREE.Mesh(geometry, material);
        box.name = "name";
        this.scene.add(box);
        const pkt = [];
        
        
        pkt.push(new THREE.Vector3(0, 0, 0));
        pkt.push(new THREE.Vector3(0, a, 0));
        
        pkt.push(new THREE.Vector3(0, a, 0));
        pkt.push(new THREE.Vector3(b, a, 0));
        
        pkt.push(new THREE.Vector3(b, a, 0));
        pkt.push(new THREE.Vector3(b, 0, 0));
        
        pkt.push(new THREE.Vector3(b, 0, 0));
        pkt.push(new THREE.Vector3(0, 0, 0));

    
        const materialL = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 1,
        });
        const geometryL = new THREE.BufferGeometry().setFromPoints(pkt);
        const linie = new THREE.LineSegments(geometryL, materialL);
    
        this.scene.add(linie);
        box.position.set(this.x , this.y , this.Z);
        linie.position.set(this.x , this.y, this.Z);
        box.rotation.set(0,0, this.rot);
        linie.rotation.set(0,0, this.rot);
        this.mesh = box;
        this.linie = linie;

        this.mesh.name = `${this.label}_${this.x}x${this.y}_mesh`;
        this.linie.name = `${this.label}_${this.x}x${this.y}_linie`;
        
        this.node.map((pt) => pt.drawShape());
    }
}


export {Rectangle}