import '../assets/main.css';
import * as THREE from 'three';
// import $ from 'jquery'
import Global from '../Global';
import {Shape} from "./Shape"
import {Ngon} from './Ngon'
import {Text} from "./Text"
import {FreePen} from './FreePen'
import {cShape, cAction} from '../shapetype';
import Point from './Point';
import { getDatabase, ref, set, get, child, onValue,off } from "firebase/database";

class VitrualTable {
    constructor(THREE, scene, selectMenuCallback) {
        this.type = cShape.NONE;
        this.action = cAction.NONE;
        this.THREE = THREE;
        this.scene = scene;
        this.OBJECTS = [];
        this.scene = scene;
        this.selectedNode = null;
        this.selectedCorner = null;
        this.meshes = [];
        this.freePenPoints = []; //tablica na punkty FreePena
        this.prevPoint = null;
        this.tmpNodes = null;
        this.freePenSeparator = false;      //klika gdy luzujemy przycisk myszki, ważne 
        this.selectMenu = selectMenuCallback;
        this.histStack = [];
        this.histPointer = -1;
        this.init();
    }


    init() {
        Text.loadFontOnce();        //inicjacja fotnów
    }

    async deleteShape(ticks) {
        try {
            let result = null;
            const headers = {
                'Access-Control-Allow-Origin': `${Global.localURL}`,
            };

            result = await fetch(`${Global.baseURL}/Shape/delete/${ticks}`, {
                mode: 'cors',
                headers: headers,
                method: 'DELETE',
            }); //.then(responce => {return responce.json()}).then(responceData => {return responceData});

            const res = await result.text();
            console.log(res);
        } catch (err) {
            console.log(err.message);
        }
    }
    //zamienia datę na ticks w formacie C#

    async putData(obj) {
        try {
            const o = {
                iColor: obj.iColor,
                sDescription: obj.mesh.name,
                points: obj.points,
                date: obj.date,
                ticks: obj.ticks
            }

            //console.log(JSON.stringify(o));
            const res = await fetch(`${Global.baseURL}/Shape/AddShape`, {
                mode: 'cors',
                method: "put",
                headers: {
                    'Access-Control-Allow-Origin': `${Global.localURL}`,
                    "Content-Type": "application/json",
                    "x-access-token": "token-value",
                },
                body: JSON.stringify(o),
            });

            if (!res.ok) {
                const message = `An error has occured: ${res.status} - ${res.statusText}`;
                throw new Error(message);
            }

            const data = await res.json();

            const result = {
                status: res.status + "-" + res.statusText,
                headers: {
                    "Content-Type": res.headers.get("Content-Type")
                },
                data: data,
            };

            console.log(result);
        } catch (err) {
            console.log(err.message);
        }
    }
    //dodaje kształt z bazy firebase
    addShape(node) {
        this.OBJECTS.push(node);
        this.meshes.push(node.mesh);
    }

    onNewShape(node) {
        node.drawShape();
        this.addShape(node);
        
        this.select(node.mesh);
        
        
        Global.selectedShape = this.selectedNode;
        
        this.action !== cAction.FREEPEN && (this.type !== cShape.FREEPEN && this.type !== cShape.TEXT) && node.setFillColor(0xffffff);
        //this.action === cAction.NONE && this.putData(node);

        this.type !== cShape.FREEPEN && this.historyAdd();
        // this.type = cShape.SELECT;
    }
    
    onMouseMove(event, targetPanel, camera, wd, hd) {
        this.action == cAction.FREEPEN && this.onMouseDown(event, targetPanel, camera, wd, hd);
        //this.action == cAction.MOVE && 
        this.type != cShape.FREEPEN && this.tmpNodes && this.cancelFreePenFig();     //usuwa rysunek freePen jeśli nie zatwierdzony a kliknięto na inną opcję
    }

    onMouseDown(event, targetPanel, camera, wd, hd) {
        

        switch (event.which) {
            case 1: //left
                switch (this.type) {
                    case cShape.RECT: {
                        break;
                    }
                    case cShape.NGON: {
                        break;
                    }
                    case cShape.CIRCLE:
                        break;
                    case cShape.FREEPEN: {
                        if(this.prevPoint) {
                            //this.prevPoint = [this.OBJECTS[this.OBJECTS.length-1].y,-this.OBJECTS[this.OBJECTS.length-1].x];
                            if(this.freePenSeparator === true)
                            {
                                this.freePenSeparator = false;
                                this.prevPoint = [(event.clientX - targetPanel.offsetLeft), (event.clientY - targetPanel.offsetTop)];
                                this.freePenPoints.push([(event.clientX - targetPanel.offsetLeft), (event.clientY - targetPanel.offsetTop)]);  
                            }
                            else
                                this.prevPoint = this.freePenPoints[this.freePenPoints.length - 1];
                        }
                        //else 
                        {
                            
                        }
                        const node = new FreePen(this.scene, (event.clientX - targetPanel.offsetLeft),
                            (event.clientY - targetPanel.offsetTop), 
                            [this.prevPoint], "freePen",  
                            parseInt(document.getElementById("size").value), "0x" + document.getElementById('color').value, true);
                        this.onNewShape(node);

                        if(this.tmpNodes == null) {
                            this.tmpNodes = [];
                        }
                        this.tmpNodes.push(node);
                        
                        this.action = cAction.FREEPEN;
                        this.prevPoint = [(event.clientX - targetPanel.offsetLeft), (event.clientY - targetPanel.offsetTop)];
                        this.freePenPoints.push([(event.clientX - targetPanel.offsetLeft), (event.clientY - targetPanel.offsetTop)]);
                        break;
                    }
                    case cShape.SELECT:
                        if(!this.selectedNode) 
                            this.onSelection(event, targetPanel);
                    case cShape.MOVE:
                            
                        if(!this.selectedNode) break;
                        const selected = this.selectedCorner != null?this.selectedCorner:this.selectedNode;
                        if(!this.prevPoint) {
                            (this.prevPoint = [(event.clientX - targetPanel.offsetLeft),  (event.clientY - targetPanel.offsetTop)]);
                        }
                        else {
                            selected.mvShape(this.prevPoint, [(event.clientX - targetPanel.offsetLeft),  (event.clientY - targetPanel.offsetTop)]);
                            this.prevPoint = null;
                        }
                        break;

                    case cShape.POLYGON:
                        break;
                    default:
                        break;
                }
                return;
            case 3: //right
                break;
            default:
                break;
        }

    }
    isRedo() {
        if(this.histPointer == (this.histStack.length - 1)) return false;
        return true;
    }
    historyRedo() {
        this.histPointer+=2;
        this.historyPop();
    }
    //zapamiętuje stan tablicy w okreslonym momencie czasu
    //stąd też następuje zapis do bazy danych
    loadDataFromSession(session) {
        if(!Global.user) {
            alert("nie zalogowany");   
            return;
        }
        
        if(Global.nodeRef)
            off(Global.nodeRef);

        const dbRef = ref(Global.fb);
        //console.log(`Sessions/${Global.currentSession+"/"+Global.user.uid}/`);
   
        Global.nodeRef = child(dbRef, `Sessions/${Global.currentSession}/`);
        onValue(Global.nodeRef, (snapshot) => {
        if (snapshot.exists()) {
            const mapa = snapshot.val();
            let last = null;
            for(const i in mapa) {
                last = i; 
            }
            this.sceneClear();
            this.historyClear();
            for(const j in mapa[last]) { 
                const o = mapa[last][j];
                let shape
                if(o.type == cShape.NGON) {
                    shape = new Ngon(this.scene, o.x,o.y,o.label,o.radius, o.n, "0x"+o.color.toString(16), o.b,o.offsetRot);
                    shape.Z = o.Z;
                    shape.drawFromPoints(o.points);
                    this.addShape(shape);                
                }
                else if(o.type == cShape.FREEPEN) {
                    const pts = o.prev.split(",").map(Number)
                    const points = [];
                    for(let i =0; i < pts.length-1;i+=2) {
                        points.push([pts[i], pts[i+1]]);
                    }
                    shape = new FreePen(this.scene, points[0],
                    points[1], points, "freePen", o.size, "0x" + o.color.toString(16));
                    shape.Z = o.Z;
                    shape.drawShape();
                    this.addShape(shape);                
                }
                else if(o.type == cShape.TEXT) {
                    shape = new Text(this.scene, o.x,o.y,o.label, "0x"+o.color.toString(16), o.size,o.height);
                    shape.Z = o.Z;
                    this.onNewShape(shape);
                }
            }
            this.select(null);
            this.type = cShape.SELECT;
    } else {
            console.log("No data available");
        }
        }, {
            onlyOnce: Global.user.uid == 'VRGQyqLSB0axkDKbmgye3wyDGJo1'
          });

    }
    historyAdd() {
        //jesli dodajemy nowy obiekt to usuwamy historię (jesli jakakolwiek jest!) wszystkich elementów do przodu
        //czyli wskaźnik zawsze przy dodawaniu musi wskazywać na aktualny element 
        while(this.histStack.length > 0 && this.histPointer < (this.histStack.length - 1)) this.histStack.pop();
        const timStamp = [];
        const firebaseData = [];
        this.OBJECTS.forEach(obj => {
            const o = obj.carbonCopy(false);
            timStamp.push(o);
            firebaseData.push({...o.toJSON(), author: Global.user?.uid});
        });

        //tylko jeśli nowy ślad różni się od poprzedniego wpisu (ignoruje ruchy typu selekcja == mvShape(0,0))
        if(Global.user?.uid == 'VRGQyqLSB0axkDKbmgye3wyDGJo1')
            if(JSON.stringify(timStamp) != JSON.stringify(this.histStack[this.histPointer]))  {
                Global.user && Global.fb && set(ref(Global.fb, `Sessions/${Global.currentSession+"/"}/${Shape.dateToTicks(new Date())}`), 
                    firebaseData);
                this.histStack.push(timStamp);
                this.histPointer++;
            }
    }

    sceneClear() {
        while(this.scene.children.length > 0){ 
            this.scene.remove(this.scene.children[0]); 
        }
        const lightA = new THREE.AmbientLight( 0xffffff );
        lightA.position.set( 0, 20, 0);
        this.scene.add( lightA );
    }
    historyClear() {
        this.histStack = [];
    }
    historyPop() {
        if(this.histPointer == 0) return;
        //this.histStack.pop();
        this.histPointer--;

        const list = this.histStack[this.histPointer];
        this.OBJECTS = [];
        this.meshes = [];
        list?.forEach(obj => {
            const o = obj.carbonCopy(true);
            this.OBJECTS.push(o);
            this.meshes.push(o);
        });
        list && this.select(null);
    }
    //wybiera obiekty do przeglądania przy klikaniu
    //obsluga zdarzenia kliku na planszę
    onClick(event, targetPanel, camera, wd, hd) {

        this.action = cAction.NONE;
        switch (event.which) {
            case 1: //left
                switch (this.type) {
                    case cShape.RECT: {
                        const node = new Ngon(this.scene, (event.clientX - targetPanel.offsetLeft),
                            (event.clientY - targetPanel.offsetTop), "prostokat", document.getElementById("rect_height").value, 4, "0x" + document.getElementById('color').value, document.getElementById("rect_width").value,true);                            
                        this.onNewShape(node);
                        // const o = node.toJSON();
                        // console.log(o);
                        // const node1 = new Ngon(this.scene, o.x+20,o.y+20,o.label,o.radius, o.n, "0x"+o.color.toString(16), o.b,o.offsetRot);
                        // node1.drawFromPoints(o.points);
                        // this.addShape(node1);
                        break;
                    }
                    case cShape.NGON: {
                        const node = new Ngon(this.scene, (event.clientX - targetPanel.offsetLeft),
                            (event.clientY - targetPanel.offsetTop), "ngon", document.getElementById("radius").value, document.getElementById("ngons").value, "0x" + document.getElementById('color').value);
                        this.onNewShape(node);
                        break;
                    }
                    case cShape.TEXT:
                        const node = new Text(this.scene, (event.clientX - targetPanel.offsetLeft),
                            (event.clientY - targetPanel.offsetTop), document.getElementById('txt').value,
                              "0x" + document.getElementById('color').value, 
                              document.getElementById('txt_size').value, 
                            //   document.getElementById('txt_height').value
                            10);
                        this.onNewShape(node);
                        break;
                    case cShape.FREEPEN: {
                        //this.finalizeFreePenFig(targetPanel);
                        this.freePenSeparator = true;
                        
                        break;
                    }
                    case cShape.POLYGON:
                        break;
                    case cShape.SELECT:
                        if(this.prevPoint && Point.distance(this.prevPoint, [event.clientX, event.clientY])<10) {
                            this.onSelection(event, targetPanel);
                        } 
                    case cShape.MOVE:    
                        if(!this.prevPoint) return;
                        const selected = this.selectedCorner !== null?this.selectedCorner:this.selectedNode;
                        selected && selected.mvShape(this.prevPoint, [(event.clientX - targetPanel.offsetLeft),  (event.clientY - targetPanel.offsetTop)]);
                        this.historyAdd();
                        this.prevPoint = null;
                        break;
    
                    default:
                        break;
                }
                return;
            case 3: //right
                break;
            default:
                break;
        }
    }
    cancelFreePenFig( targetPanel) {
        this.deleteTempNodes();
        this.tmpNodes = null;
        this.freePenPoints = [];
        this.prevPoint = null;
    }
    finalizeFreePenFig( targetPanel) {
        if(!this.prevPoint) return;
        const node = new FreePen(this.scene, this.prevPoint[0],
            this.prevPoint[1], this.freePenPoints, "freePen", parseInt(document.getElementById("size").value), "0x" + document.getElementById('color').value);
        this.deleteTempNodes();
        this.tmpNodes = null;
        this.onNewShape(node);
        //console.log(this.freePenPoints);
        //this.tmpNodes.push(node);
        this.freePenPoints = [];
        this.prevPoint = null;
        this.historyAdd();
    }
    onSelection(event, targetPanel) {
        const mouse3D = new this.THREE.Vector3((event.clientX - targetPanel.offsetLeft - 0),
            (event.clientY - targetPanel.offsetTop - 0), -1000); //z == camera.far
        const raycaster = new this.THREE.Raycaster();
        raycaster.set(mouse3D, new this.THREE.Vector3(0, 0, 1));

        const intersects = raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
            //TODO: dodac sortowanie po buferze Z
            // for(let i = intersects.length-1; i>=0; i--)
            // if(intersects[i].object.visible)
            {
                const i = intersects.length-1;
                this.select(intersects[i].object);
                return;
            }
        }
        else
            this.select(null);
    }
    carbonCopy() {
        if(!this.selectedNode) return;
        const node = this.selectedNode.carbonCopy(true);

        // this.onNewShape(node);
        this.addShape(node);
        this.type = cShape.SELECT;        
    }
    Clone() {
        if(!this.selectedNode) return;
        const node = this.selectedNode.clone();

        this.onNewShape(node);
        this.type = cShape.SELECT;        
    }
    deleteTempNodes() {
        if(!this.tmpNodes) return;

        this.tmpNodes.map( (selectedNode) => {
            if(selectedNode === null) return;
            this.scene.remove(selectedNode.mesh);
            selectedNode.linie && this.scene.remove(selectedNode.linie);
            this.OBJECTS = this.OBJECTS.filter((obj) => obj !== selectedNode);
            this.meshes = this.meshes.filter((obj) => obj !== selectedNode.mesh);
        });
    }
    select(pole) {
        //sprawdź czy nie chwytamy za róg
        if(this.selectedNode && pole != null && pole.name.indexOf("corner") === 0) {
            for (let shape of this.selectedNode.node) {
                if(pole === shape.mesh) {
                    shape.select(true);
                    shape.setFillColor(0xffffff);
                    this.selectedCorner = shape;
                    break;
                }
                else {
                    shape.setFillColor(0x000000);
                    shape === this.selectedCorner && (this.selectedCorner = null);
                }
            }
            return;
        }
        
        for (let shape of this.OBJECTS) {
            if (pole === null || (shape.mesh?.id !== pole.id ))
                shape.select(false);
            else if (pole != null) {
                if(shape.type != cShape.FREEPEN && shape.type != cShape.TEXT)
                    shape.setDefaultColor();
                // else
                //     shape.setFillColor(0xFFFFFF);

                this.selectedNode = shape;
                Global.selectedShape = this.selectedNode;
                //this.selectMenu(shape.type);
                //this.type = cShape.SELECT;

                this.selectedCorner = null;
                if(this.selectedNode.node )
                    for (let shape of this.selectedNode.node) {
                        shape.setFillColor(0x000000);
                    }

                shape.select(true);
            }
        }
        if(pole === null) {
            this.selectedNode = null;
            Global.selectedShape = this.selectedNode;
            this.selectedCorner = null;
        }
    }
}

export {
    VitrualTable
}