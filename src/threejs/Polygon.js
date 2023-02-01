import {Shape} from './Shape.js'
import Point from './Point.js'
import {Ngon} from './Ngon.js'
import { cShape } from '../shapetype.js';
import * as THREE from 'three';
import Global from '../Global.js';
import { Points } from 'three';

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
    recreateMesh(bDraw) {

        const path = new THREE.Shape();
        const linie = this.linie.geometry.attributes.position.array;
        path.moveTo(linie[0], linie[1]);
        for(let i = 3; i < linie.length; i+=3)
        {
            path.lineTo(linie[i], linie[i+1] );
        }
        // path.lineTo(linie[0]-this.x, linie[1] - this.y);

        //jak będzie gotowe mesh MESH
        if(this.figureIsClosed) {
            this.scene.remove(this.mesh);
            const material = new THREE.MeshStandardMaterial({
                color: this.iColor, //0xE9E9E9,
                side:  THREE.DoubleSide,
            });

            const geometry = new THREE.ShapeGeometry(path);
            this.mesh = new THREE.Mesh( geometry, material );
            this.mesh.position.set(this.x, this.y, this.Z);
            bDraw && this.scene.add( this.mesh ); 
        }
    }
    drawShape() {
        const targetPanel = document.getElementById('plansza');
        const wd = targetPanel.offsetWidth ; // parseInt(dh.offsetWidth);
        const hd = targetPanel.offsetHeight; //parseInt(window.innerHeight * .6);
        const cornerSize = Global.cornerSize;
        
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
        this.pts.map(p => path.lineTo(p.x, p.y));
        
        const dist = Point.distance([p.x,p.y],[this.pts[0].x, this.pts[0].y]);
        console.log(dist);
        if(dist < 5) {
            this.figureIsClosed = true;
            this.recreateMesh(true);
        }
        else {
            path.lineTo(p.x+1, p.y);
            const node = new Ngon(this.scene, p.x + this.x , p.y + this.y , "corner",cornerSize,4, "0x000000", cornerSize, true, true, this.node.length)
            node.parent = this;
            node.drawShape();
            this.node?.push(node);
        }

        const points = path.getPoints();
        //console.log(points.length);
        //points.map(p => console.log(p));
        const geometryL = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
            color: 0xffffff,//this.iColor,
            linewidth: 1,
        });
        
        this.linie = new THREE.Line(geometryL, mat);
        this.linie.position.set(this.x, this.y, this.Z);
        this.scene.add(this.linie);
    }

    rescale() {
        super.rescale();
        this.recreateMesh(true);
        this.mvShape([0, 0], [0, 0]);
    }
    toJSON() {
        const obj = super.toJSON()
        return { ...obj, 
            points: this.linie?.geometry.attributes.position.array.toString(),
        };
    }

    
    //tworzy i wraca kopię obiektu
    carbonCopy(bDraw) {
        let obj = new Polygon(this.scene,{x:this.x,y:this.y},this.label,this.iColor);
        super.carbonCopy(obj);
        
        if(this.linie) {
            obj.linie = new THREE.Line( 
                this.linie.geometry.clone(), 
                new THREE.LineBasicMaterial().copy( this.linie.material )
            );
            obj.linie.name=this.linie.name;
            obj.scene = this.scene;
            bDraw && obj.scene.add(obj.linie);

            obj.recreateMesh(bDraw);
            // obj.mesh.name=this.mesh.name;
            
            // bDraw && obj.scene.add(obj.mesh);
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
    mvShape(start, stop) {
    super.mvShape(start, stop);
    this.node?.map((pt) => {
        pt.x += stop[0] - start[0];
        pt.y += stop[1] - start[1];
        pt.mesh && pt.mesh.position.set(pt.x, pt.y, pt.Z);
        pt.linie && pt.linie.position.set(pt.x, pt.y, pt.Z+1);
    });
    }
}

export {Polygon};
