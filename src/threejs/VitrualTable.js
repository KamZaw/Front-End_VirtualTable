import '../assets/main.css';
import $ from 'jquery'
import Global from '../Global';
import {
    Rectangle
} from './Rectangle'
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

const pxSize = 4;

class VitrualTable {
    constructor(THREE, scene) {
        this.type = cShape.NONE;
        this.action = cAction.NONE;
        this.THREE = THREE;
        this.scene = scene;
        this.OBJECTS = [];
        this.scene = scene;
        this.selectedNode = null;
        this.meshes = [];
        this.freePenPoints = []; //tablica na punkty FreePena
        this.prevPoint = null;
        this.tmpNodes = null;
        this.init();
    }


    init() {
        // $('#rect_color').on('input', function() { 
        //     //$(this).val()
        //     $("#colorpicker").css("background-color", "#"+$(this).val());
        // });
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
        this.selectedNode = node;
        this.select(null);
        this.action != cAction.FREEPEN && this.type != cShape.FREEPEN && node.setFillColor(0xffffff);
        this.action == cAction.NONE && this.putData(node);
    }
    onMouseMove(event, targetPanel, camera, wd, hd) {
        this.action == cAction.FREEPEN && this.onMouseDown(event, targetPanel, camera, wd, hd);
        
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
                            this.prevPoint = this.freePenPoints[this.freePenPoints.length - 1];
                        }
                        else {
                            this.freePenPoints.push([(event.clientX - targetPanel.offsetLeft), (event.clientY - targetPanel.offsetTop)]);
                        }
                        const node = new FreePen(this.THREE, this.scene, (event.clientX - targetPanel.offsetLeft),
                            (event.clientY - targetPanel.offsetTop), [this.prevPoint], "freePen",  parseInt($("#radius").val()), parseInt($("#radius").val()), "0x" + $('#freepen_color').val());
                        this.onNewShape(node);
                        //const pts = [[824,-229],[746,-196],[700,-199],[680,-207],[659,-219],[650,-226],[640,-236],[630,-258],[629,-266],[628,-279],[628,-289],[633,-304],[636,-307],[637,-310],[639,-310],[639,-311]]

                        if(this.tmpNodes == null) {
                            this.tmpNodes = [];
                        }
                        this.tmpNodes.push(node);
                        
                        this.action = cAction.FREEPEN;
                        this.prevPoint = [(event.clientX - targetPanel.offsetLeft), (event.clientY - targetPanel.offsetTop)];
                        this.freePenPoints.push([(event.clientX - targetPanel.offsetLeft), (event.clientY - targetPanel.offsetTop)]);
                        break;
                    }
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

        let bLeft = true;

        // console.log(bLeft);
        const mouse3D = new this.THREE.Vector3((event.clientX - targetPanel.offsetLeft - 0),
            (event.clientY - targetPanel.offsetTop - 0), 1000); //z == camera.far

        //console.log(mouse3D);

        this.action = cAction.NONE;
        switch (event.which) {
            case 1: //left
                switch (this.type) {
                    case cShape.RECT: {
                        const node = new Rectangle(this.THREE, this.scene, (event.clientX - targetPanel.offsetLeft - 21),
                            -(event.clientY - targetPanel.offsetTop - 24), "prostokat", $("#rect_height").val(), $("#rect_width").val(), "0x" + $('#rect_color').val());
                        this.onNewShape(node);
                        break;
                    }
                    case cShape.NGON: {
                        const node = new Ngon(this.THREE, this.scene, (event.clientX - targetPanel.offsetLeft - 21),
                            -(event.clientY - targetPanel.offsetTop - 24), "ngon", $("#radius").val(), $("#ngons").val(), "0x" + $('#ngon_color').val());
                        this.onNewShape(node);
                        break;
                    }
                    case cShape.CIRCLE:
                        break;
                    case cShape.FREEPEN: {
                        const node = new FreePen(this.THREE, this.scene, (event.clientX - targetPanel.offsetLeft),
                            (event.clientY - targetPanel.offsetTop), this.freePenPoints, "freePen", parseInt($("#radius").val()), parseInt($("#radius").val()), "0x" + $('#freepen_color').val());
                        this.deleteTempNodes();
                        this.tmpNodes = null;   
                        this.onNewShape(node);
                        console.log(this.freePenPoints);
                        //this.tmpNodes.push(node);

                        this.freePenPoints = [];
                        this.prevPoint = null;
                        break;
                    }
                    case cShape.POLYGON:
                        break;
                    default:
                        break;
                }
                return;
            case 3: //right
                bLeft = false;
                break;
            default:
                break;
        }


        const raycaster = new this.THREE.Raycaster();
        raycaster.set(mouse3D, new this.THREE.Vector3(0, 0, -1));

        const intersects = raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
            //TODO: dodac sortowanie po buferze Z
            this.select(intersects[0].object);
        } else
            this.select(null);
    }

    deleteTempNodes() {
        if(!this.tmpNodes) return;

        this.tmpNodes.map( (selectedNode) => {
            if(selectedNode == null) return;
            this.scene.remove(selectedNode.mesh);
            selectedNode.linie && this.scene.remove(selectedNode.linie);
            this.OBJECTS = this.OBJECTS.filter((obj) => obj != selectedNode);
            this.meshes = this.meshes.filter((obj) => obj != selectedNode.mesh);
        });
    }
    select(pole) {
        for (let shape of this.OBJECTS) {
            if (pole == null || shape.mesh !== pole)
                shape.setDefaultColor();
            else if (pole != null) {
                if(shape.label == "freePen")
                    shape.setFillColor(0xAAAAAA);
                else
                    shape.setFillColor(0xffffff);
                this.selectedNode = shape;
            }
        }
    }
}

export {
    VitrualTable
}