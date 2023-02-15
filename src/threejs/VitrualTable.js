import '../assets/main.css';
import * as THREE from 'three';
// import $ from 'jquery'
import Global from '../Global';
import {
    Shape
} from "./Shape"
import {
    Ngon
} from './Ngon'
import {
    Text
} from "./Text"
import {
    Polygon
} from "./Polygon"
import {
    FreePen
} from './FreePen'
import {
    cShape,
    cAction
} from '../shapetype';
import Point from './Point';
import TimeLapse from './TimeLapse';
import {
    // getDatabase,
    ref,
    set,
    // get,
    child,
    onValue,
    off,
    // push
} from "firebase/database";

class VitrualTable {
    constructor(THREE, scene, selectMenuCallback) {
        this.type = cShape.NONE;
        this.action = cAction.NONE;
        this.THREE = THREE;
        this.scene = scene;
        this.OBJECTS = [];
        this.scene = scene;
        this.selectedNode = null;
        //obsługa siatki i wyrównywania
        this.gridOn = Global.chkGrid;
        this.gridSnap = Global.chkSnap;
        this.gridRes = 10;
        this.crosshair = null;
        this.grid = null;


        this.selectedCorner = null;
        this.meshes = [];
        this.freePenPoints = []; //tablica na punkty FreePena
        this.prevPoint = null;
        this.tmpNodes = null;
        this.freePenSeparator = false; //klika gdy luzujemy przycisk myszki, ważne 
        this.selectMenu = selectMenuCallback;
        this.histStack = [];
        this.histPointer = -1;
        this.timeLapse = new TimeLapse(); 
        this.init();
    }


    init() {
        Text.loadFontOnce(); //inicjacja fotnów
    }


    //aktywacja i deaktywacja siatki
    setGrid() {

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

    //zapisujemy dane z aktualnej planszy do pliku SVG
    getSVG() {
        const targetPanel = document.getElementById('plansza');
        const wd = targetPanel.offsetWidth ; 
        const hd = 1147;//targetPanel.offsetHeight; 

        let str = `<svg  id="svg5"
        version="1.1"
        xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
        xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:svg="http://www.w3.org/2000/svg">
     
         <defs
             id="defs7" />
             <sodipodi:namedview
             id="namedview5"
             pagecolor="#${Shape.pad(this.scene.background.getHex().toString(16), 6)}"
             bordercolor="#666666"
             borderopacity="1.0"
             inkscape:pageshadow="2"
             inkscape:pageopacity="1.0"
             inkscape:pagecheckerboard="0"
             showgrid="${this.gridOn}"
             inkscape:zoom=".8"
             inkscape:cx="0"
             inkscape:cy="0"
             inkscape:window-width="${wd}"
             inkscape:window-height="${hd}"
             inkscape:window-x="-8"
             inkscape:window-y="-8"
             inkscape:window-maximized="1"
             inkscape:current-layer="svg5" />\n`

        this.OBJECTS.forEach(o => str+=o.toSVG()+"\n");

        str += '</svg>'

        return str;
    }

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

        node.mesh && this.select(node.mesh);
        this.action === cAction.POLYGON && this.select(node.linie);


        Global.selectedShape = this.selectedNode;

        this.action !== cAction.FREEPEN && (this.type !== cShape.FREEPEN && this.type !== cShape.TEXT) && node.setFillColor(0xffffff);
        //this.action === cAction.NONE && this.putData(node);

        (this.type !== cShape.FREEPEN && (this.action !== cAction.POLYGON && this.type !== cShape.POLYGON )) && this.historyAdd();
        // this.type = cShape.SELECT;
    }

    onMouseMove(event, targetPanel, camera, wd, hd) {
        if (this.gridOn && this.gridSnap) {
            this.crosshair.position.set(parseInt((event.clientX - targetPanel.offsetLeft) / this.gridRes) * this.gridRes, parseInt((event.clientY - targetPanel.offsetTop) / this.gridRes) * this.gridRes, 100);
        }
        this.action === cAction.POLYGON && this.onMouseDown(event, targetPanel, camera, wd, hd);
        this.action === cAction.FREEPEN && this.onMouseDown(event, targetPanel, camera, wd, hd);
        this.action === cAction.BEZIER && this.onMouseDown(event, targetPanel, camera, wd, hd);
        this.cShape === cAction.MOVE && this.selectedNode !== null && 
        this.onMouseDown(event, targetPanel, camera, wd, hd);
        this.type !== cShape.FREEPEN && this.tmpNodes && this.cancelFreePenFig(); //usuwa rysunek freePen jeśli nie zatwierdzony a kliknięto na inną opcję
    }

    //TODO: dorysować raminowa, zamienić punkt na bezier
    toBezier() {
        if (!this.selectedCorner) return;

        const sc = this.selectedCorner;
        this.selectedCorner = this.selectedCorner.parent.toBezier(sc);
        this.selectedCorner.parent.recreateMesh(true);

    }
    
    toCorner() {
        if (!this.selectedCorner) return;

        const sc = this.selectedCorner;
        this.selectedCorner = this.selectedCorner.parent.toCorner(sc);
        this.selectedCorner.parent.recreateMesh(true);
        this.select(this.selectedCorner.mesh);
        this.selectedCorner.mvShape([0,0], [0,0]);

    }
    onMouseDown(event, targetPanel, camera, wd, hd) {

        const p = {
            x: (this.gridOn && this.gridSnap) ? parseInt((event.clientX - targetPanel.offsetLeft) / this.gridRes) * this.gridRes : (event.clientX - targetPanel.offsetLeft),
            y: (this.gridOn && this.gridSnap) ? parseInt((event.clientY - targetPanel.offsetTop) / this.gridRes) * this.gridRes : (event.clientY - targetPanel.offsetTop),
        }
        switch (event.which) {
            case 1: //left
                switch (this.type) {
                    case cShape.RECT: {
                        break;
                    }
                    case cShape.NGON: {
                        break;
                    }
                    case cShape.POLYGON:
                        if (this.selectedNode ) {
                            //console.log(p);
                            if(this.selectedNode.updateLastPos)
                                this.selectedNode.updateLastPos(p);
                        }
                        break;
                    case cShape.FREEPEN: {
                        if (this.prevPoint) {
                            //this.prevPoint = [this.OBJECTS[this.OBJECTS.length-1].y,-this.OBJECTS[this.OBJECTS.length-1].x];
                            if (this.freePenSeparator === true) {
                                this.freePenSeparator = false;
                                this.prevPoint = [p.x, p.y];
                                this.freePenPoints.push([p.x, p.y]);
                            } else
                                this.prevPoint = this.freePenPoints[this.freePenPoints.length - 1];
                        }
                        const node = new FreePen(this.scene, p.x, p.y,
                            [this.prevPoint], "freePen",
                            parseInt(document.getElementById("size").value), "0x" + document.getElementById('color').value.substr(1), true);
                        this.onNewShape(node);

                        if (this.tmpNodes == null) {
                            this.tmpNodes = [];
                        }
                        this.tmpNodes.push(node);

                        this.action = cAction.FREEPEN;
                        this.prevPoint = [p.x, p.y];
                        this.freePenPoints.push([p.x, p.y]);
                        break;
                    }
                    case cShape.SELECT:
                        if (!this.selectedNode)
                            this.onSelection(event, targetPanel);
                    case cShape.CORNER:
                    case cShape.MOVE:

                        if (!this.selectedNode) break;
                        if (this.selectedCorner !== null && this.action !== cAction.BEZIER) {
                            if (Point.distance([this.selectedCorner.x, this.selectedCorner.y], [p.x, p.y]) > Global.cornerSize * 2) {
                                this.selectedNode.node?.forEach(n => n.select(false)); //usuńzaznaczenie wszystkich węzłów figury
                                this.onSelection(event, targetPanel); //sprawdź czy nie klikamy na drugi węzeł
                                this.type = cShape.SELECT;
                                break;
                            }
                        }
                        const selected = this.selectedCorner != null ? this.selectedCorner : this.selectedNode;
                        if (!this.prevPoint) {
                            (this.prevPoint = [p.x, p.y]);
                        } else {
                            selected.mvShape(this.prevPoint, [p.x, p.y]);
                            this.prevPoint = null;
                        }
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
        if (this.histPointer === (this.histStack.length - 1)) return false;
        return true;
    }
    historyRedo() {
        this.histPointer += 2;
        console.log(this.histPointer);
        this.historyPop();
    }
    //zapamiętuje stan tablicy w okreslonym momencie czasu
    //stąd też następuje zapis do bazy danych
    loadDataFromSession(session) {
        if (!Global.user) {
            alert("nie zalogowany");
            return;
        }
        if (Global.nodeRef)
            off(Global.nodeRef);

        const dbRef = ref(Global.fb);
        //console.log(`Sessions/${Global.currentSession+"/"+Global.user.uid}/`);

        Global.nodeRef = child(dbRef, `Sessions/${Global.currentSession}/`);
        onValue(Global.nodeRef, (snapshot) => {
            if (snapshot.exists()) {
                const mapa = snapshot.val();
                this.timeLapse = new TimeLapse();
                this.timeLapse.setMap(JSON.parse(JSON.stringify(mapa)));
                this.timeLapse.start(this.drawScene.bind(this));
        
                // let last = null;
                // for (const i in mapa) {
                //     last = i;
                // }
                // this.drawScene(mapa, last);


            } else {
                console.log("Brak danych dla sesji");
            }
        }, {
            onlyOnce: Global.user.uid == 'VRGQyqLSB0axkDKbmgye3wyDGJo1'
        });

    }
    drawScene(mapa, last) {
        this.clearAll();

        for (const j in mapa[last]) {
            const o = mapa[last][j];
            let shape;
            if (o.type === cShape.NGON) {
                shape = new Ngon(this.scene, o.x, o.y, o.label, o.radius, o.n, "0x" + o.color.toString(16), o.b, o.offsetRot);
                shape.Z = o.Z;
                shape.drawFromPoints(o.points);
                this.addShape(shape);
            } else if (o.type === cShape.POLYGON) {
                shape = new Polygon(this.scene, { x: parseInt(o.x), y: parseInt(o.y) }, "0x" + o.color.toString(16));
                shape.Z = o.Z;
                shape.drawShape();
                const pts = o.points.split(",").map(Number);
                for (let i = 0; i < pts.length; i += 3) {
                    shape.addPoint({ x: parseInt(pts[i]) + shape.x, y: parseInt(pts[i + 1]) + shape.y });
                }
                this.addShape(shape);
            }
            else if (o.type === cShape.FREEPEN) {
                const pts = o.prev.split(",").map(Number);
                const points = [];
                for (let i = 0; i < pts.length - 1; i += 2) {
                    points.push([pts[i], pts[i + 1]]);
                }
                shape = new FreePen(this.scene, points[0],
                    points[1], points, "freePen", o.size, "0x" + o.color.toString(16));
                shape.Z = o.Z;
                shape.mirrorX = o.mirrorX;
                shape.mirrorY = o.mirrorY;
                shape.drawShape();
                this.addShape(shape);
            } else if (o.type === cShape.TEXT) {
                shape = new Text(this.scene, o.x, o.y, o.label, "0x" + o.color.toString(16), o.size, o.height);
                shape.Z = o.Z;
                shape.mirrorX = o.mirrorX;
                shape.mirrorY = o.mirrorY;

                this.onNewShape(shape);
            }
        }
        this.select(null);
        this.type = cShape.SELECT;
    }

    clearAll() {
        this.sceneClear();
        this.historyClear();
        this.OBJECTS = [];
        this.meshes = [];
    }

    historyAdd() {
        //jesli dodajemy nowy obiekt to usuwamy historię (jesli jakakolwiek jest!) wszystkich elementów do przodu
        //czyli wskaźnik zawsze przy dodawaniu musi wskazywać na aktualny element 
        while (this.histStack.length > 0 && this.histPointer < (this.histStack.length - 1)) {
            this.histStack.pop();
        }
        const timStamp = [];
        const firebaseData = [];
        this.OBJECTS.forEach(obj => {
            const o = obj.carbonCopy(false);
            timStamp.push(o);
            firebaseData.push({
                ...o.toJSON(),
                author: Global.user?.uid
            });
        });

        //tylko jeśli nowy ślad różni się od poprzedniego wpisu (ignoruje ruchy typu selekcja == mvShape(0,0))
        if (Global.user && Global.user?.uid == 'VRGQyqLSB0axkDKbmgye3wyDGJo1') {
            if (JSON.stringify(timStamp) != JSON.stringify(this.histStack[this.histPointer])) {
                Global.user && Global.fb && set(ref(Global.fb, `Sessions/${Global.currentSession}/${Shape.dateToTicks(new Date())}`),
                    firebaseData);
                    console.log("DODANO do FB");
                }
            }
        this.histStack.push(timStamp);
        this.histPointer++;
    }

    sceneClear() {
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
        const lightA = new THREE.AmbientLight(0xffffff);
        lightA.position.set(0, 20, 0);
        this.scene.add(lightA);
        
        this.crosshair.visible = this.gridSnap;
        this.grid.visible = this.gridOn;
        this.scene.add(this.crosshair);
        this.scene.add(this.grid);
        
            
    }
    historyClear() {
        this.histStack = [];
    }
    historyPop() {
        if (this.histStack.length <= this.histPointer) {
            this.histPointer = this.histStack.length - 1;
            console.log(this.histPointer);
            //return;
        }
        //this.histStack.pop();
        
        const list = this.histStack[this.histPointer];
        this.histPointer--;
        console.log(this.histPointer);
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

        //nie pozwalaj klikać po zalogowaniu na ekran użytkownikowi, który nie jest nauczycielem
        if(Global.user && (Global.user.uid !== "VRGQyqLSB0axkDKbmgye3wyDGJo1")) return; 

        const p = {
            x: (this.gridOn && this.gridSnap) ? parseInt((event.clientX - targetPanel.offsetLeft) / this.gridRes) * this.gridRes : (event.clientX - targetPanel.offsetLeft),
            y: (this.gridOn && this.gridSnap) ? parseInt((event.clientY - targetPanel.offsetTop) / this.gridRes) * this.gridRes : (event.clientY - targetPanel.offsetTop),
        }
        //this.action = cAction.NONE;
        switch (event.which) {
            case 1: //left
                switch (this.type) {
                    case cShape.RECT: {

                        const node = new Ngon(this.scene, p.x, p.y, "prostokat",
                            document.getElementById("rect_height").value, 4,
                            "0x" + document.getElementById('color').value.substr(1),
                            document.getElementById("rect_width").value, true);

                        this.onNewShape(node);
                        // const o = node.toJSON();
                        // console.log(o);
                        // const node1 = new Ngon(this.scene, o.x+20,o.y+20,o.label,o.radius, o.n, "0x"+o.color.toString(16), o.b,o.offsetRot);
                        // node1.drawFromPoints(o.points);
                        // this.addShape(node1);
                        break;
                    }
                    case cShape.NGON: {
                        const node = new Ngon(this.scene, p.x, p.y, "ngon", document.getElementById("radius").value, document.getElementById("ngons").value, "0x" + document.getElementById('color').value.substr(1));
                        this.onNewShape(node);
                        break;
                    }
                    case cShape.TEXT:
                        const node = new Text(this.scene, p.x, p.y, document.getElementById('txt').value,
                            "0x" + document.getElementById('color').value.substr(1),
                            document.getElementById('txt_size').value,
                            //   document.getElementById('txt_height').value
                            10);
                        this.onNewShape(node);
                        break;
                    case cShape.FREEPEN: {
                        //this.finalizeFreePenFig(targetPanel);
                        this.action = cAction.NONE;
                        this.freePenSeparator = true;

                        break;
                    }
                    case cShape.POLYGON: 
                        if (this.action !== cAction.POLYGON) {
                            const node = new Polygon(this.scene, p, "0x" + document.getElementById('color').value.substr(1));
                            this.onNewShape(node);
                            this.selectedNode = node;
                            this.action = cAction.POLYGON;
                        } else {
                            if (this.selectedNode) {
                                // console.log(`addPoint(${p})`);
                                this.selectedNode?.addPoint(p);
                                if (this.selectedNode.figureIsClosed) {
                                    this.action = cAction.NONE;
                                    // this.selectedNode = null;
                                    this.historyAdd();
                                }
                            }
                        }
                        break;
                    case cShape.SELECT:
                        if (this.prevPoint && Point.distance(this.prevPoint, [p.x, p.y]) < 10) {
                            this.onSelection(event, targetPanel);
                        }
                        case cShape.CORNER:
                        case cShape.MOVE:
                            if (!this.prevPoint) return;

                            const selected = this.selectedCorner !== null ? this.selectedCorner : this.selectedNode;
                            selected && selected.mvShape(this.prevPoint, [p.x, p.y]);
                            this.historyAdd(); 
                            this.prevPoint = null;
                            if(this.selectedCorner && this.action === cAction.BEZIER) 
                                this.select(this.selectedCorner.mesh);
                            this.action = cAction.SELECT;
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
    cancelFreePenFig(targetPanel) {
        this.deleteTempNodes();
        this.tmpNodes = null;
        this.freePenPoints = [];
        this.prevPoint = null;
    }
    finalizeFreePenFig(targetPanel) {
        if (!this.prevPoint) return;
        const node = new FreePen(this.scene, this.prevPoint[0],
            this.prevPoint[1], this.freePenPoints, "freePen", parseInt(document.getElementById("size").value), "0x" + document.getElementById('color').value.substr(1));
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
            const i = intersects.length - 1;
            this.select(intersects[i].object);
            return;
        } else
            this.select(null);
    }
    carbonCopy() {
        if (!this.selectedNode) return;
        const node = this.selectedNode.carbonCopy(true);

        // this.onNewShape(node);
        this.addShape(node);
        this.type = cShape.SELECT;
    }
    Clone() {
        if (!this.selectedNode) return;
        const node = this.selectedNode.clone();

        this.onNewShape(node);
        this.type = cShape.SELECT;
    }
    deleteTempNodes() {
        if (!this.tmpNodes) return;

        this.tmpNodes.forEach((selectedNode) => {
            if (selectedNode === null) return;
            this.scene.remove(selectedNode.mesh);
            selectedNode.linie && this.scene.remove(selectedNode.linie);
            this.OBJECTS = this.OBJECTS.filter((obj) => obj !== selectedNode);
            this.meshes = this.meshes.filter((obj) => obj !== selectedNode.mesh);
        });
    }
    select(pole) {
        //sprawdź czy nie chwytamy za róg
        if (this.selectedNode && pole != null && pole.name.indexOf("corner") === 0) {
            for (let shape of this.selectedNode.node) {
                if (pole === shape.mesh) {
                    shape.select(true);
                    shape.setFillColor(0xffffff);
                    this.selectedCorner = shape;
                    this.selectMenu(cShape.CORNER); //wybierz menu dla modyfikjacji wierzchołka
                    break;
                } else {
                    shape.setFillColor(0x000000);
                    shape === this.selectedCorner && (this.selectedCorner = null);
                }
            }
            return;
        } //sprawdź czy nie chwytamy za róg ramienia beziera
        if (this.selectedNode && pole != null && pole.name.indexOf("bezier") === 0) {
            for (let shapeNode of this.selectedNode.node) {
                if (shapeNode.isBezier) {
                    shapeNode.mesh.visible = shapeNode.linie.visible = true;
                    shapeNode.node.forEach( n => n.mesh.visible = true);
                    shapeNode.arms.forEach( n => n.visible = true);
                    for (let shape of shapeNode.node) {

                        if (pole === shape.mesh) {
                            shape.select(true);
                            this.action = cAction.BEZIER;
                            shape.mesh.visible = true;
                            shape.linie.visible = true;
                            shape.setFillColor(0xffffff);
                            this.selectedCorner = shape;
                            break;
                        }
                    }
                } else {
                    shapeNode.setFillColor(0x000000);
                    shapeNode === this.selectedCorner && (this.selectedCorner = null);
                }
            }
            this.group = null;
            return;
        }



        for (let shape of this.OBJECTS) {
            if (pole === null || (shape.mesh?.id !== pole.id)) {
                shape.select(false);
            }
            else if (pole != null) {
                if (shape.type !== cShape.FREEPEN && shape.type !== cShape.TEXT)
                    shape.setDefaultColor();
                // else
                //     shape.setFillColor(0xFFFFFF);

                this.selectedNode = shape;
                Global.selectedShape = this.selectedNode;
                //this.selectMenu(shape.type);
                //this.type = cShape.SELECT;

                this.selectedCorner = null;
                if (this.selectedNode.node)
                    for (let shape of this.selectedNode.node) {
                        shape.setFillColor(0x000000);
                    }

                shape.select(true);
            }
        }
        if (pole === null) { 
            this.selectedNode = null;
            Global.selectedShape = this.selectedNode;
            this.selectedCorner = null;
        }
    }
}

export {
    VitrualTable
}