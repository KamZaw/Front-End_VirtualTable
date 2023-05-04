import {Shape} from './Shape.js'
import Point from './Point.js'
import {Ngon} from './Ngon.js'
import { cShape } from '../shapetype.js';
import * as THREE from 'three';
import Global from '../Global.js';


class Polygon extends Shape {
    constructor(scene, p, color) {
        super(cShape.POLYGON, scene, p.y, p.x, "polygon", color);
        this.node = [];
        this.figureIsClosed = false;  //czy figura jest zamknięta (wtedy można wypełnić kolorem i rysować mesh)
        this.pts = [{x:0,y:0}];
        
        this.init();
    }
    
    init() {
    
    }

    getPts() {
        
        if(!this.node) {
            this.pts = JSON.parse(JSON.stringify(this.pts));
            return;
        }
        this.pts = [];
        for(let i = 0; i < this.node.length; i++) {
            this.pts.push({x:this.node[i].x, y:this.node[i].y});
        }
        this.pts.push({x:this.node[0].x, y:this.node[0].y});
    }
    drawFromPoints(pointsS){
        this.figureIsClosed = true;
        const pts = pointsS.split(",").map(Number);
        this.pts = [];//pts;
        const path = new THREE.Shape();
        path.moveTo(pts[0],pts[1]);
        const cornerSize = Global.cornerSize;

        this.pts.push({x:pts[0], y:pts[1]});
        for(let i = 3; i < pts.length; i+=3) {
            path.lineTo(pts[i], pts[i+1]);
            this.pts.push({x:pts[i], y:pts[i+1]});
        }    


        const points = path.getPoints();
        const materialL = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 1,
            transparent: false,
        });        
        const geometryL = new THREE.BufferGeometry().setFromPoints(points);
        this.linie = new THREE.Line(geometryL, materialL);
        this.recreateMesh(true);        
        this.mesh.add(this.linie);
    }

    recreateMesh(bDraw) {
        const path = new THREE.Shape();
        const linie = this.linie.geometry.attributes.position.array;
        path.moveTo(linie[0], linie[1]);
        for(let i = 0; i < linie.length-3; i+=3)
        {
            path.lineTo(linie[i], linie[i+1] );
        }
        path.lineTo(linie[0], linie[1]);
        //jak będzie gotowe MESH
        //(linii nie trzeba zmieniać, te się same modyfikują)
        if(this.figureIsClosed) {
            this.scene.remove(this.mesh);
            const oldrot = this.mesh?.rotate;
            //this.node?.forEach(n => this.scene.remove(n.rmShape()));
            
            const material = new THREE.MeshStandardMaterial({
                color: this.iColor, //0xE9E9E9,
                side:  THREE.DoubleSide,
            });
            
            
            const geometry = new THREE.ShapeGeometry(path);
            this.mesh = new THREE.Mesh( geometry, material );
            this.mesh.position.set(this.x, this.y, this.Z);
            this.mesh.name = `${this.label}_${this.x}x${this.y}_mesh`;
            
            //ODBUDOWA WĘZŁÓW
            this.node = [];
            const cornerSize = Global.cornerSize;
            for(let i = 0; i < linie.length-3; i+=3)
            {
                const node = new Ngon(this.mesh, linie[i], linie[i+1] , "corner",cornerSize,4, "0x000000", cornerSize, true, true, this.node.length)
                node.parent = this;
                node.drawShape();
                node.setRotate(-oldrot);
                // node.mesh.position.set(0,0,1);
                // node.linie.position.set(0,0,1);
                this.node?.push(node); 
            }

            const points = path.getPoints();
            const materialL = new THREE.LineBasicMaterial({
                color: 0x000000,
                linewidth: 1,
                transparent: false,
            });        
            const geometryL = new THREE.BufferGeometry().setFromPoints(points);

            this.scene.remove(this.linie);
            this.mesh.remove(this.linie);
            this.linie = new THREE.Line(geometryL, materialL);
            //this.linie.position.set(this.x, this.y, this.linie.position.z);
            
            
            if(bDraw) {
                this.scene.add( this.mesh ); 
                this.linie.position.set(0,0,this.mesh.position.z + 1);
                this.mesh.add(this.linie);
                this.setRotate(oldrot);
            }
        }
    }
    drawShape() {
        // const targetPanel = document.getElementById('plansza');
        // const wd = targetPanel.offsetWidth ; // parseInt(dh.offsetWidth);
        // const hd = targetPanel.offsetHeight; //parseInt(window.innerHeight * .6);
        const cornerSize = Global.cornerSize;
        if(this.x + this.y === 0 ) return;
        const node = new Ngon(this.scene, this.x, this.y, "corner",cornerSize,4, "0x000000", cornerSize, true, true, this.node.length)
        node.parent = this;
        node.drawShape();
        node.mesh.visible = true;
        this.node?.push(node);
    }
    updateLastPos(p) {
        // return;
        if(this.linie) {
            this.linie.geometry.attributes.position.needsUpdate = true;
            const linie = this.linie.geometry.attributes.position.array;
            linie[linie.length-3] = p.x - this.x;
            linie[linie.length-2] = p.y - this.y;
        }
    }
    addPoint(p) {
        
        if(this.figureIsClosed === true) return;

        const cornerSize = Global.cornerSize;
        
        //path.moveTo(this.startPoint.x, this.startPoint.y);
        if(this.linie) {
            this.scene.remove(this.linie);
        }
        const path = new THREE.Path();
        p.x -= this.x;
        p.y -= this.y;
        this.pts.push(p);
        
        path.moveTo(this.pts[0].x, this.pts[0].y);
        this.pts.forEach(p => path.lineTo(p.x, p.y));
        
        const dist = Point.distance([p.x,p.y],[this.pts[0].x, this.pts[0].y]);
        //console.log(dist);
        if(dist > cornerSize/2 || this.pts.length == 1) {
            path.lineTo(p.x+1, p.y);
            const node = new Ngon(this.scene, p.x + this.x , p.y + this.y , "corner",cornerSize,4, "0x000000", cornerSize, true, true, this.node.length)
            node.parent = this;
            node.drawShape();
            this.node?.push(node);
        }
        const points = path.getPoints();
        //console.log(points.length);
        //points.forEach(p => console.log(p));
        const geometryL = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
            color: 0xffffff,//this.iColor,
            linewidth: 1,
        });
        
        this.linie = new THREE.Line(geometryL, mat);
        this.linie.position.set(this.x, this.y, 1);
        
        this.linie.name = `${this.label}_${this.x}x${this.y}_linie`;
        this.scene.add(this.linie);
        
        
        if(dist <= cornerSize/2) {
            this.figureIsClosed = true;
            this.node?.forEach((n)=>{ n.rmShape();  });
            // this.scene.remove(this.linie);
            this.recreateMesh(true);
        }

    }
    //usuwa ostatni punkt
    delPoint() {
        
        if(this.node?.length.length <= 1) return;
        
        if(this.linie) {
            this.scene.remove(this.linie);
        }
        const path = new THREE.Path();

        
        this.node?.pop().rmShape();
        
        
        path.moveTo(this.pts[0].x, this.pts[0].y);
        this.pts.forEach(p => path.lineTo(p.x, p.y));
        
        
        while(this.pts.length > this.node.length)
            this.pts.pop();
        
        
        const p = {x:this.node[this.node.length-1]?.x - this.x, y:this.node[this.node.length-1]?.y - this.y};
        this.pts.push(p);
        path.lineTo(p.x, p.y);
        const points = path.getPoints();
        
        //console.log(points.length);
        //points.forEach(p => console.log(p));
        const geometryL = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
            color: 0xffffff,//this.iColor,
            linewidth: 1,
        });
        
        this.linie = new THREE.Line(geometryL, mat);
        this.linie.position.set(this.x, this.y, this.Z+1);
        
        this.linie.name = `${this.label}_${this.x}x${this.y}_linie`;
        this.linie.visible = true;

        this.scene.add(this.linie);
    }

    rmShape() {
        //this.node?.forEach((pt) => pt.rmShape());
        super.rmShape();
    }
    rescale() {
        super.rescale();
        // this.recreateMesh(true);
        // this.mvShape([0, 0], [0, 0]);
    }
    toJSON() {
        const obj = super.toJSON()
        return { ...obj, 
            points: this.linie?.geometry.attributes.position.array.toString(),
        };
    }
    select(flag) {
        !flag && super.select(flag);
        this.node?.forEach((pt) => {
            pt.mesh && (pt.mesh.visible = flag);
            pt.linie && (pt.linie.visible = flag);
        });
        return this.node;
    }
 
    toSVG() {
        let str = "";

        str += ` <path
        style="fill:#${Shape.pad(this.iColor.toString(16),6)};stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
        d="m `;
        this.getPts()
        const pts = this.pts; //JSON.parse(JSON.stringify(this.pts));
        pts.pop();
        
        str += `${pts[0].x + this.x},${pts[0].y + this.y} `;
        for(let i = 1; i < pts.length; i++)
            str += `${(pts[i].x - pts[i-1].x)},${(pts[i].y - pts[i-1].y)} `;
        str += `z"
        id="${this.linie.name}" />\n`

        return str;
    }
    //tworzy i wraca kopię obiektu
    carbonCopy(bDraw) {

        let obj = new Polygon(this.scene,{x:this.x,y:this.y},this.iColor);
        super.carbonCopy(obj);
        obj.figureIsClosed = this.figureIsClosed;
        

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
        
        bDraw && obj.scene.add(obj.mesh);
        if(this.linie) {
            obj.linie = new THREE.Line( 
                this.linie.geometry.clone(), 
                new THREE.LineBasicMaterial().copy( this.linie.material )
            );
            obj.linie.name=this.linie.name;
            obj.scene = this.scene;
            
            obj.recreateMesh(bDraw);
            obj.mesh.name=this.mesh.name;
            obj.linie.position.z = obj.mesh.position.z + 1;
            bDraw && obj.mesh.add(obj.linie);
        }

        bDraw && this.node && obj.mvShape([0,0],[0,0]);
        

        return obj;
    }

    mvShape(start, stop) {
        
        if(this.parent) {
            console.log("Wchodzi");
            
            this.parent.linie.geometry.attributes.position.needsUpdate = true;
            this.parent.mesh.geometry.attributes.position.needsUpdate = true;
            const linie = this.parent.linie.geometry.attributes.position.array;
            // const mesh = this.parent.mesh.geometry.attributes.position.array;

            // linie[(this.cornerCnt+0)*3] += stop[0] - start[0];
            // linie[(this.cornerCnt+0)*3+1] += stop[1] - start[1];
            // if(this.cornerCnt === 0) {
            //     linie[(linie.length  - 3)] += stop[0] - start[0];
            //     linie[(linie.length - 3)+1] += stop[1] - start[1];
            //     // mesh[mesh.length - 3] += stop[0] - start[0];
            //     // mesh[mesh.length - 3 + 1] += stop[1] - start[1];
            // }
            
            this.parent.recreateMesh(true);
            // this.parent.mvShape([0,0],[0,0]);
            // return;
        }
        else
            super.mvShape(start, stop);
        
        // this.recreateMesh(true);
    }
    
}

export {Polygon};
