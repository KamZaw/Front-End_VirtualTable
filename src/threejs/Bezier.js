// import {Shape} from './Shape.js'
// import Point from './Point.js'
import {Ngon} from './Ngon.js'
// import { cShape } from '../shapetype.js';
import * as THREE from 'three';
import Global from '../Global.js';
// import { onIdTokenChanged } from 'firebase/auth';


//punkt p0 beziera
class Bezier extends Ngon {
    constructor(scene, x, y, label, radius, ngons, color, b, offsetRot, iNode, cornerCnt, node, prev, next ) {
        super(scene, x, y, label, radius, ngons, color, b, offsetRot, iNode, cornerCnt)
        this.next = next;   //punkt p3
        this.prev = prev;   //punkt p0
        this.isBezier = true;
        this.radius = radius;
        this.n = ngons;
        this.offsetRot = offsetRot?Math.PI/4:0;     //dla Rectangle PI/4.
        this.b = b?b:radius;
        this.cornerCnt = cornerCnt;
        this.node = [];
        this.Node = node;
        this.mesh = node.mesh;
        this.linie = node.linie;
        this.parent = node.parent;

        const curve = new THREE.CubicBezierCurve(
            new THREE.Vector2( prev.x, prev.y ),
            new THREE.Vector2( parseInt((this.x + next.x)/2), parseInt((this.y + next.y)/2) ),
            new THREE.Vector2( parseInt(this.x *.5), parseInt(this.y*.5) ),
            new THREE.Vector2( next.x, next.y )
        );
        this.pts = curve.getPoints(50);          //punkty na łuk beziera

        this.arms = [];                         //na ramiona krzywej
        this.init();
    }

    //tworzy i wraca kopię obiektu bezier
    carbonCopy(bDraw) {
        return this;

        let obj = new Bezier(this.scene,this.x,this.y,this.label,this.radius,this.n,this.iColor,this.b, this.offsetRot, this.node == null, this.cornerCnt,
            this.Node,
            this.prev,
            this.next);

        super.carbonCopy(obj);
        const material = new THREE.MeshStandardMaterial({
            color: this.iColor, //0xE9E9E9,
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
        
        //klonuje wierzchołki ramion wodzączych (p1 i p2)
        this.node && (obj.node = []);
        this.node?.map((n)=>{
            const crn = n.carbonCopy(bDraw);
            crn.parent = obj;
            obj.node.push(crn);
        });

        //klonuje linie ramion
        this.arms && (obj.arms = []);
        this.arms?.map((n)=>{
            const crn = new THREE.Line( 
                n.geometry.clone(), 
                new THREE.LineBasicMaterial().copy( n.material )
            );
            crn.parent = obj;
            obj.arms.push(crn);
        });

        bDraw && this.node && obj.mvShape([0,0],[0,0]);
        

        return obj;
    }
    init() {

    }

    drawShape() {
        // super.drawShape();
        // const n = new Ngon(this.scene, this.x, this.y, "corner", Global.cornerSize, 4, "0x000000", Global.cornerSize, true, true, this.prev.cornerCnt+1);
        // n.parent = this;
        // n.drawShape();
        // this.node.push(n);

        this.drawArm(this.next, 2, 0);
        this.drawArm(this.prev, -2, 1);
        
    }
    rmShape() {
        this.node?.map((pt) => pt.rmShape());
        this.arms?.map((line) => this.scene.remove(line));
        super.rmShape();  
    }
    mvShape(start, stop, mvFig) {
        //przesuń ramiona
        //przesuwa główny wierzchołek
        // super.mvShape(start, stop);  
        const p={x:this.x, y:this.y};
        this.x += stop[0] - start[0];
        this.y += stop[1] - start[1];

        this.mesh.position.set(this.x, this.y, this.mesh.position.z);
        this.linie.position.set(this.x, this.y, this.linie.position.z);

        if(!mvFig) {
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
        }
        // const p={x:arm.position.x, y:arm.position.y};
        
        
        //przesuń linie wodzące
        if(!this.isBezier) 
        {
            this.arms.map( arm => {
                const p={x:arm.position.x, y:arm.position.y};
                p.x += stop[0] - start[0];
                p.y += stop[1] - start[1];
                
                arm.position.set(p.x, p.y, this.parent.Z+1)
            });
        }
        
        const arms = this.arms;
        //przesuń węzły
        this.node?.map((pt) => {
            let p={x:pt.mesh.position.x, y:pt.mesh.position.y};
            p.x += stop[0] - start[0];
            p.y += stop[1] - start[1];
            pt.mesh && pt.mesh.position.set(p.x, p.y, pt.mesh.position.z);

            p={x:pt.linie.position.x, y:pt.linie.position.y};
            p.x += stop[0] - start[0];
            p.y += stop[1] - start[1];
            pt.linie && pt.linie.position.set(p.x, p.y, pt.mesh.position.z);

            arms[pt.cornerCnt].geometry.attributes.position.needsUpdate = true;
            const linie = arms[pt.cornerCnt].geometry.attributes.position.array;
            linie[3] += stop[0] - start[0];
            linie[4] += stop[1] - start[1];

        });

       
    }

    select(flag) {
        !flag && super.select(flag);
        this.arms?.map( arm =>
            { 
            arm.visible = flag;
            arm.visible = flag;
        });
        this.node?.map((pt) => {
            pt.mesh && (pt.mesh.visible = flag);
            pt.linie && (pt.linie.visible = flag);
        });
        return this.node;
    }

    drawArm(next, s, cnt) {
        const cornerSize = Global.cornerSize;
        const armL = new THREE.Path();
        armL.moveTo(next.x - this.x, next.y - this.y);
        armL.lineTo(parseInt((this.x + next.x) / 2) + s - this.x, parseInt((this.y + next.y) / 2) + s - this.y);

        const points = armL.getPoints();
        const geometryL = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 1,
        });

        
        const armNode = new Ngon(this.scene, parseInt((this.x + next.x) / 2) + s, parseInt((this.y + next.y) / 2) + s, "bezier", cornerSize-2, 4, "0x555555", cornerSize-2, true, true, cnt);
        
        armNode.parent = this;
        armNode.drawShape();
        armNode.mesh.visible = true;
        armNode.mesh.name = `bezier_${this.x}x${this.y}_mesh`;
        armNode.linie.name = `bezier_${this.x}x${this.y}_linie`;

        
        const linie = new THREE.Line(geometryL, mat);
        linie.position.set(this.x, this.y, this.parent.Z-1);        //linie ramion mają być nieco schowane
        
        linie.name = `bezier_${this.x}x${this.y}_linie`;

        this.scene.add(linie);
        this.arms.push(linie);
        
        this.node.push(armNode);

        // next.mesh.add(armNode.mesh);
        // next.mesh.add(armNode.linie);
        // next.mesh.add(linie);
    }
}

export {Bezier}
