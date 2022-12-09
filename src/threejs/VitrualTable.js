import '../assets/main.css';
// import $ from 'jquery'
import Global from '../Global';
import {
    Ngon
} from './Ngon'
import {
    FreePen
} from './FreePen'
import {
    cShape,
    cAction
} from '../shapetype';
import Point from './Point';

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
        this.init();
    }


    init() {

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
        
        this.action !== cAction.FREEPEN && this.type !== cShape.FREEPEN && node.setFillColor(0xffffff);
        this.action === cAction.NONE && this.putData(node);
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
                        const node = new FreePen(this.THREE, this.scene, (event.clientX - targetPanel.offsetLeft),
                            (event.clientY - targetPanel.offsetTop), [this.prevPoint], "freePen",  parseInt(document.getElementById("radius").value), parseInt(document.getElementById("radius").value), "0x" + document.getElementById('color').value, true);
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
    //wybiera obiekty do przeglądania przy klikaniu
    //obsluga zdarzenia kliku na planszę
    onClick(event, targetPanel, camera, wd, hd) {

        this.action = cAction.NONE;
        switch (event.which) {
            case 1: //left
                switch (this.type) {
                    case cShape.RECT: {
                        const node = new Ngon(this.THREE, this.scene, (event.clientX - targetPanel.offsetLeft),
                            (event.clientY - targetPanel.offsetTop), "prostokat", document.getElementById("rect_height").value, 4, "0x" + document.getElementById('color').value, document.getElementById("rect_width").value,true);                            
                        this.onNewShape(node);
                        break;
                    }
                    case cShape.NGON: {
                        const node = new Ngon(this.THREE, this.scene, (event.clientX - targetPanel.offsetLeft),
                            (event.clientY - targetPanel.offsetTop), "ngon", document.getElementById("radius").value, document.getElementById("ngons").value, "0x" + document.getElementById('color').value);
                        this.onNewShape(node);
                        break;
                    }
                    case cShape.CIRCLE:
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
        const node = new FreePen(this.THREE, this.scene, this.prevPoint[0],
            this.prevPoint[1], this.freePenPoints, "freePen", parseInt(document.getElementById("radius").value), parseInt(document.getElementById("radius").value), "0x" + document.getElementById('color').value);
        this.deleteTempNodes();
        this.tmpNodes = null;
        this.onNewShape(node);
        //console.log(this.freePenPoints);
        //this.tmpNodes.push(node);
        this.freePenPoints = [];
        this.prevPoint = null;
    }
    onSelection(event, targetPanel) {
        const mouse3D = new this.THREE.Vector3((event.clientX - targetPanel.offsetLeft - 0),
            (event.clientY - targetPanel.offsetTop - 0), -1000); //z == camera.far
        const raycaster = new this.THREE.Raycaster();
        raycaster.set(mouse3D, new this.THREE.Vector3(0, 0, 1));

        const intersects = raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
            //TODO: dodac sortowanie po buferze Z
            this.select(intersects[intersects.length-1].object);
        }
        else
            this.select(null);
    }
    carbonCopy() {
        if(!this.selectedNode) return;
        const node = this.selectedNode.carbonCopy();

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
            if (pole === null || shape.mesh !== pole)
                shape.select(false);
            else if (pole != null) {
                if(shape.label == "freePen")
                    shape.setFillColor(0xAAAAAA);
                else
                    shape.setFillColor(0xffffff);
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