import {Shape} from './Shape.js'
import { cShape } from '../shapetype.js';
import * as THREE from 'three';
import Global from '../Global.js';



class Ngon extends Shape{

    constructor(scene, x, y, label, radius, ngons, color, b, offsetRot, iNode, cornerCnt, radius2 ) {
        super(cShape.NGON, scene, y, x, label, color);
        this.radius = radius;
        this.radius2 = radius2 != null? radius2: radius;
        this.n = ngons;
        this.node = iNode?null:[];                  //definiuj liste jeśli true
        this.offsetRot = offsetRot?Math.PI/4:0;     //dla Rectangle PI/4.
        this.b = b?b:radius;
        this.cornerCnt = cornerCnt;

    }
    rmShape() {
        this.node?.forEach((pt) => pt.rmShape());
        super.rmShape();
    }
    select(flag) {
        !flag && super.select(flag); 
        this.node?.forEach((pt) => {
            pt.mesh && (pt.mesh.visible = flag);
            pt.linie && (pt.linie.visible = flag);
        });
        return this.node;
    }
    mvShape(start, stop) {

        if(!this.parent ) 
        {
            super.mvShape(start, stop);
            return;
        }
        
        //przesuwamy cornery

        console.log("Wchodzi");
        this.parent.linie.geometry.attributes.position.needsUpdate = true;
        this.parent.mesh.geometry.attributes.position.needsUpdate = true;
        const linie = this.parent.linie.geometry.attributes.position.array;
        const mesh = this.parent.mesh.geometry.attributes.position.array;

        for(let i = 0; i < mesh.length; i+=3) {
               if(mesh[i] == linie[this.cornerCnt*3] && mesh[i + 1] == linie[this.cornerCnt*3 + 1]) {
                    mesh[i] += stop[0] - start[0];
                    mesh[i + 1] += stop[1] - start[1];
               }
        }

        linie[this.cornerCnt*3] += stop[0] - start[0];
        linie[this.cornerCnt*3+1] += stop[1] - start[1];
        if(this.cornerCnt === 0) {
            linie[(linie.length  - 3)] += stop[0] - start[0];
            linie[(linie.length - 3)+1] += stop[1] - start[1];
        }
        
        //przetwarzamy mesh
        super.mvShape(start, stop);     //przesuwa same czarne cornery NGONa
        if(this.parent.type== cShape.POLYGON) {
            const cc = this.cornerCnt;
            // this.parent.recreateMesh(true);
            //this.node?.forEach(n => n.cornerCnt === cc && n.select(true));
            // this.select(true);
        }
    }

    //odtwarza obiekt z obiektu JSON przesłanego z bazy danych
    drawFromPoints(pointsS){
        const pts = pointsS.split(",").map(Number);
        const path = new THREE.Shape();
        path.moveTo(pts[0],pts[1]);
        const cornerSize = Global.cornerSize;

        for(let i = 3; i < pts.length; i+=3)
            path.lineTo(pts[i], pts[i+1]);
        
        const points = path.getPoints();
        const materialL = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 1,
            transparent: false,
        });        
        const geometryL = new THREE.BufferGeometry().setFromPoints(points);
        this.linie = new THREE.Line(geometryL, materialL);
        //this.linie.position.set(this.x, this.y, this.linie.position.z);
        this.recreateMesh(true);
        this.mesh.add(this.linie);
        this.node = [];
        this.node.push(new Ngon(this.mesh, pts[0] , pts[1] , "corner",cornerSize,4, "0x000000", cornerSize, true, true, 0));
        for(let i = 3; i < pts.length; i+=3) {
            path.lineTo(pts[i],pts[i+1]);
            this.node.push(new Ngon(this.mesh, pts[i] , pts[i+1] , "corner",cornerSize,4, "0x000000", cornerSize, true, true, i/3));
        }
        this.node.pop();        
        this.node?.forEach((pt) => {
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
        const material = new THREE.MeshStandardMaterial({
            color: this.iColor, //0xE9E9E9,
                //wireframe: true,
                // transparent: this.cornerCnt?false:true,
                // opacity: 0.7,
                side:  THREE.DoubleSide,
            });
            
        const oldmesh = this.mesh;
        const geometry = new THREE.ShapeGeometry(path);
        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.position.set(this.x, this.y, this.mesh.position.z);
        if(bDraw && oldmesh) {
            this.mesh.rotateZ(oldmesh.rotation.z);
            console.log(oldmesh.children.length);
            oldmesh.children.forEach(chld => {
                oldmesh.remove(chld);
                this.mesh.add(chld);
                chld.visible = true;
            });   //kopiuj linie i kornery
            console.warn("Old: " +oldmesh.id);
            this.scene.remove(oldmesh);
        }
        bDraw && this.scene.add( this.mesh );
        console.warn("New: " +this.mesh.id);
        
        

        //this.linie.position.set(-this.x,-this.y,0);
        
    }

    rescale() {
        super.rescale();
        this.mvShape([0, 0], [0, 0]);
    }
    toJSON() {
        const obj = super.toJSON()
        return { ...obj, 
            radius: this.radius,
            n: this.n,
            b: this.b, 
            offsetRot: this.offsetRot,
            points: this.linie?.geometry.attributes.position.array.toString(),
        };
    }

    
    //tworzy i wraca kopię obiektu
    carbonCopy(bDraw) {
        
        let obj = new Ngon(this.scene,this.x,this.y,this.label,this.radius,this.n,this.iColor,this.b, this.offsetRot, this.node == null, this.cornerCnt);
        super.carbonCopy(obj);
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
        this.node?.forEach((n)=>{
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

        const cornerSize = Global.cornerSize;

        let segmentCount = this.n;
        let radius = this.radius*Math.SQRT2/2;//Math.sqrt((this.radius*this.radius + this.b * this.b)/4)
        const b = (this.b/this.radius);
        const path = new THREE.Shape();
        
        const RAD = this.radius;
        const rad = this.radius2;
        for (let i = 0; i < segmentCount; i++) {
            let theta = ((i) / segmentCount) * Math.PI * 2 +this.offsetRot;
            
            //parametr dla tyu STAR
            radius = (i % 2)?rad:RAD;

            let x = Math.round(Math.cos(theta) * radius *b);
            let y = Math.round(Math.sin(theta) * radius);
            if(i === 0)
                path.moveTo(x,y);
            else
                path.lineTo( x, y );
        }
        let theta =  Math.PI * 2 +this.offsetRot;
        //parametr dla tyu STAR
        radius = (segmentCount % 2)?rad:RAD;

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
        this.mesh.position.set(this.x, this.y, this.mesh.position.z);
        this.scene.add( this.mesh );

    
        
        const geometryL = new THREE.BufferGeometry().setFromPoints(points);
        this.linie = new THREE.Line(geometryL, materialL);
        //this.linie.position.set(this.x, this.y, this.Z+1);
        this.linie.name = `${this.label}_${this.x}x${this.y}_linie`;
        this.mesh.name = `${this.label}_${this.x}x${this.y}_mesh`;
        this.linie.position.z = 1;
        this.mesh.add(this.linie);
        
        for (let i = 0; i < segmentCount; i++) {
            let theta = ((i) / segmentCount) * Math.PI * 2 +this.offsetRot;
            //parametr dla tyu STAR
            radius = (i % 2)?rad:RAD;

            let x = Math.round(Math.cos(theta) * radius *b);
            let y = Math.round(Math.sin(theta) * radius);
            const node = new Ngon(this.mesh, x , y , "corner",cornerSize,4, "0x000000", cornerSize, true, true, i);
            node.parent = this;
            
            this.node?.push(node);
        }

        this.node?.forEach((pt) =>{ 
            pt.drawShape();
            pt.mesh.position.z = 1;
        });
    }
    
    toSVG() {
        let str = "";
        if(this.offsetRot) //tzn. RECT
        {
        str += `<rect
            style="fill:#${Shape.pad(this.iColor.toString(16),6)};stroke:#000000;stroke-width:1px;stroke-linecap:round;stroke-linejoin:bevel"
            id="${this.mesh.name}"
            width="${this.b}"
            height="${this.radius}"
            x="${this.x - this.b/2}"
            y="${this.y - this.radius/2}" />`;
        }
        else  {
            str += ` <path
            style="fill:#${Shape.pad(this.iColor.toString(16),6)};stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
            d="m `;

            let segmentCount = this.n;
            let radius = this.radius*Math.SQRT2/2;//Math.sqrt((this.radius*this.radius + this.b * this.b)/4)
            const b = (this.b/this.radius);
            const pts = [];

            const RAD = this.radius;
            const rad = this.radius2;

            for (let i = 0; i < segmentCount; i++) {
                let theta = ((i) / segmentCount) * Math.PI * 2 +this.offsetRot;
                radius = (i % 2)?rad:RAD;
                let x = Math.round(Math.cos(theta) * radius *b);
                let y = Math.round(Math.sin(theta) * radius);
                pts.push({x:x,y:y});
            }

            str += `${pts[0].x + this.x},${pts[0].y + this.y} `;
            for(let i = 1; i < pts.length; i++)
                str += `${(pts[i].x - pts[i-1].x)},${(pts[i].y - pts[i-1].y)} `;
            str += `z"
            id="${this.linie.name}" />\n`
        }
        return str;
    }           
}


export {Ngon}