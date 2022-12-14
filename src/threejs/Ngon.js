import {Shape} from './Shape.js'
import { cShape } from '../shapetype.js';
import * as THREE from 'three';
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
                    pt.linie && pt.linie.position.set(pt.x, pt.y, pt.Z+1);
                });
            return;
        }
        
        //przesuwamy cornery
        this.parent.linie.geometry.attributes.position.needsUpdate = true;
        const linie = this.parent.linie.geometry.attributes.position.array;
        linie[this.cornerCnt*3] += stop[0] - start[0];
        linie[this.cornerCnt*3+1] += stop[1] - start[1];
        if(this.cornerCnt == 0) {
            linie[(linie.length  - 3)] += stop[0] - start[0];
            linie[(linie.length - 3)+1] += stop[1] - start[1];
        }
        //przetwarzamy mesh
        this.parent.recreateMesh(true);
        super.mvShape(start, stop);     //przesuwa same czarne cornery NGONa
    }

    //odtwarza obiekt z obiektu JSON przesłanego z bazy danych
    drawFromPoints(pointsS){
        const pts = pointsS.split(",").map(Number);
        const path = new THREE.Shape();
        path.moveTo(pts[0],pts[1]);
        const cornerSize = Global.cornerSize;
        this.node = [];
        this.node.push(new Ngon(THREE, this.scene, pts[0] + this.x, pts[1] + this.y, "corner",cornerSize,4, "0x000000", cornerSize, true, true, 0));
        for(let i = 3; i < pts.length; i+=3) {
            path.lineTo(pts[i],pts[i+1]);
            this.node.push(new Ngon(THREE, this.scene, pts[i] + this.x, pts[i+1] + this.y, "corner",cornerSize,4, "0x000000", cornerSize, true, true, i/3));
        }
        this.node.pop();
        
        const points = path.getPoints();
        const materialL = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 1,
            transparent: false,
        });        
        const geometryL = new THREE.BufferGeometry().setFromPoints(points);
        this.linie = new THREE.Line(geometryL, materialL);
        this.linie.position.set(this.x, this.y, this.Z+1);
        this.scene.add(this.linie);
        this.recreateMesh(true);
        this.node?.map((pt) => {
            pt.drawShape();
            pt.parent = this;
        });
    }
    recreateMesh(bDraw) {

        const path = new THREE.Shape();
        const linie = this.linie.geometry.attributes.position.array;
        path.moveTo(linie[0], linie[1]);
        for(let i = 3; i < linie.length; i+=3)
        {
            path.lineTo(linie[i], linie[i+1]);
        }
        path.lineTo(linie[0], linie[1]);
        this.scene.remove(this.mesh);
        const material = new THREE.MeshStandardMaterial({
            color: this.iColor, //0xE9E9E9,
                //wireframe: true,
            // transparent: this.cornerCnt?false:true,
            // opacity: 0.7,
            side:  THREE.DoubleSide,
        });

        const geometry = new THREE.ShapeGeometry(path);
        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.position.set(this.x, this.y, this.Z);
        bDraw && this.scene.add( this.mesh );        

    }

    toJSON() {
        return {
            type: this.type,
            ticks: this.ticks,
            x: this.x,
            y: this.y,
            label: this.label,
            radius: this.radius,
            n: this.n,
            color: this.iColor,
            b: this.b, 
            offsetRot: this.offsetRot,
            wireframe: false,
            transparent: false,
            opacity: 1.0,
            points: this.linie?.geometry.attributes.position.array.toString(),
        };
    }

    
    //tworzy i wraca kopię obiektu
    carbonCopy(bDraw) {
        let obj = new Ngon(THREE,this.scene,this.x,this.y,this.label,this.radius,this.n,this.iColor,this.b, this.offsetRot, this.node == null, this.cornerCnt);
        
        const material = new THREE.MeshStandardMaterial({
            color: this.iColor, //0xE9E9E9,
                //wireframe: true,
            // transparent: this.cornerCnt?false:true,
            // opacity: 0.7,
            side:  THREE.DoubleSide,
        });

        obj.mesh= new THREE.Mesh( 
            this.mesh.geometry.clone(), 
            material,
        );

        if(this.linie) {
            obj.linie = new THREE.Line( 
                this.linie.geometry.clone(), 
                new THREE.LineBasicMaterial().copy( this.linie.material )
            );
            obj.linie.name=this.linie.name;
            obj.scene = this.scene;
            bDraw && obj.scene.add(obj.linie);

            obj.recreateMesh(bDraw);
            obj.mesh.name=this.mesh.name;
            
            bDraw && obj.scene.add(obj.mesh);
        }
        
        this.node && (obj.node = []);
        this.node?.map((n)=>{
            const crn = n.carbonCopy(bDraw);
            crn.parent = obj;
            obj.node.push(crn);
        });

        bDraw && this.node && obj.mvShape([0,0],[0,0]);
        

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
        const path = new THREE.Shape();

        
        
        for (let i = 0; i < segmentCount; i++) {
            let theta = ((i) / segmentCount) * Math.PI * 2 +this.offsetRot;
            let x = Math.round(Math.cos(theta) * radius *b);
            let y = Math.round(Math.sin(theta) * radius);
            this.node?.push(new Ngon(THREE, this.scene, x + this.x, y + this.y, "corner",cornerSize,4, "0x000000", cornerSize, true, true, i));
            if(i === 0)
                path.moveTo(x,y);
            else
                path.lineTo( x, y );
        }
        let theta =  Math.PI * 2 +this.offsetRot;
        let x = Math.round(Math.cos(theta) * radius *b);
        let y = Math.round(Math.sin(theta) * radius);
        path.lineTo(x,y);

        const points = path.getPoints();
        const geometry = new THREE.ShapeGeometry(path);
        const materialL = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 1,
            transparent: false,
        });
        const material = new THREE.MeshStandardMaterial({
            color: this.iColor, //0xE9E9E9,
                //wireframe: true,
            // transparent: this.cornerCnt?false:true,
            // opacity: 0.7,
            side:  THREE.DoubleSide,
        });

        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.position.set(this.x, this.y, this.Z);
        this.scene.add( this.mesh );

        if(this.node){
            for(let c of this.node)
                c.parent = this;        
        }
        
        const geometryL = new THREE.BufferGeometry().setFromPoints(points);
        this.linie = new THREE.Line(geometryL, materialL);
        this.linie.position.set(this.x, this.y, this.Z+1);
        this.scene.add(this.linie);
        this.mesh.name = `${this.label}_${this.x}x${this.y}_mesh`;
        this.linie.name = `${this.label}_${this.x}x${this.y}_linie`;


        this.node?.map((pt) => pt.drawShape());
        //this.createMesh(verts, normals, pkt);
    }

    createMesh(verts, normals, pkt) {
        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));


        const material = new THREE.MeshStandardMaterial({
            color: this.iColor, //0xE9E9E9,
            // wireframe: true,
            // transparent: this.cornerCnt?false:true,
            // opacity: 0.7,
            side:  THREE.DoubleSide,
        });


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
        box.position.set(this.x, this.y, this.Z);
        linie.position.set(this.x, this.y, this.Z + 1);
        this.mesh = box;
        this.linie = linie;

        this.mesh.name = `${this.label}_${this.x}x${this.y}_mesh`;
        this.linie.name = `${this.label}_${this.x}x${this.y}_linie`;


        this.node?.map((pt) => pt.drawShape());
    }
}


export {Ngon}