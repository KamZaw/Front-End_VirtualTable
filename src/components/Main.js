import { Component } from 'react';
import React from 'react';
import * as THREE from 'three';
import {VitrualTable} from '../threejs/VitrualTable.js'
import Global from '../Global';
import {Shape} from '../threejs/Shape'
import NavBar from './NavBar';
import {initializeApp} from "firebase/app"
import { getDatabase, ref, update, set, off , child, onValue} from "firebase/database";
import {getAuth, onAuthStateChanged, signOut} from "firebase/auth"
import {firebaseConfig} from "../firebase-config"
import {cShape} from '../shapetype';
import Sessionbar from './SessionBar.js';
import MediaBar from './MediaBar.js';


const targetPanelString = 'main_panel';

class Main extends Component {

    constructor() {
        super();
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.vt = null;
        this.itemPicked = this.itemPicked.bind(this);
        this.onFBUpdate = this.onFBUpdate.bind(this);
        this.selectMenuCallback = this.selectMenuCallback.bind(this);     
        this.navbar = React.createRef();

        this.adminRef = null;
        this.msgMap = new Map();
        this.state = {
            loggedIn: false,
            msgs: [],
            isOKField: false,
            msg: "",
        }
        Global.firebaseApp = initializeApp(firebaseConfig);
        onAuthStateChanged(getAuth(Global.firebaseApp), (currentUser) => {
            //currentUser ? console.log(">>>"+currentUser.email): console.log(">>> logOut"); 
            Global.user = currentUser;
            // Global.user.hasMic = false;
            // if(Global.adminRights.includes(Global.user?.uid))
            //     Global.user.hasMic = true;      //tylko nauczyciel ma mikrofon

            Global.fb = getDatabase(Global.firebaseApp );
              Global.user && Global.fb && update(ref(Global.fb, `Students/${Global.user.uid}/`), 
            {
                refreshed: Shape.dateToTicks(new Date()),
                loggedIn: currentUser!= null
            });
            this.getAdmins();
            this.setState({...this.state, loggedIn: currentUser!= null})
      } ).bind(this);
    }
    async onLogOut() {
        if(!Global.user ) return;
        Global.user && Global.fb && update(ref(Global.fb, `Students/${Global.user.uid}/`), 
        {
            loggedIn: false,
            session: null,
        });

        if(Global.nodeRef)
            off(Global.nodeRef);
        await signOut(getAuth(Global.firebaseApp));
    }
    //dialog zamykania sesji LIVE
    endOfLiveSession(msg) {
        this.setState({...this.state, isOKField:true, msg: msg, title: "Uwaga"});
    }
    async changeName(imie, nazwisko) {
        if(!Global.user ) return;
        Global.user && Global.fb && update(ref(Global.fb, `Students/${Global.user.uid}/`), 
        {
            imie: imie,
            nazwisko: nazwisko,
        });
    }
    getAdmins() {
        const dbRef = ref(Global.fb);
        this.adminRef = child(dbRef, `Admins/`);
        onValue(this.adminRef, (snapshot) => {
            if (snapshot.exists()) {
                const mapa = snapshot.val();
                const admins = [];
                
                for(const i in mapa) {
                    admins.push(i);
                }
                Global.adminRights = admins;
            } 
        }, {
            onlyOnce: false
        });
    }
    componentDidMount() {

        console.log("MAIN* * * ")
        this.initTHREE(targetPanelString, 1);
        //aktualizacja ekranu threejs
        this.animate();

 
    }
    componentWillUnmount() {
        console.log("MAIN* * * OFF")
        signOut(getAuth(Global.firebaseApp));
        if(this.adminRef)
            off(this.adminRef); 
        if(Global.user)
        //on logout
        if(Global.bLive && Global.adminRights.includes(Global.user?.uid))
            this.itemPicked(cShape.STOP_NEW_SESSION);
        if(Global.liveRef)
            off(Global.liveRef)
        Global.liveRef = null;
        if(Global.nodeRef)
            off(Global.nodeRef);
        Global.nodeRef = null;
        this.onLogOut();

    }
    //pobierz obiekty kształtów z backendu
    async getShapesRequest(url) {
        let result = null;
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': `${Global.localURL}`,
        };
    
        result = await fetch(url
            , {
            mode: 'cors',
            headers: headers,
            method: 'GET',
        });//.then(responce => {return responce.json()}).then(responceData => {return responceData});
        return await result.json();
    }

    //aktualizacje tablicy z komponentu FBUpdate
    onFBUpdate(shape) {
        //alert("FG Update" + shape);
        if(shape.constructor == String)
            shape = JSON.parse(shape);

        const node = this.vt.OBJECTS.filter(o => o.ticks == shape.ticks);
        this.delete(node[0], true);
        const shp = new Shape(THREE, this.scene,  0, 0, "");

        if(node != null && node[0] != null) {
            shp.recreateShape(shape);
            this.vt.addShape(shp);
        }
        // if(node.constructor == Array)
        //     shp.recreateShape(node[0]);
        // else
        //     shp.recreateShape(node);
        //console.log(shp);

    }
    //metoda przekazywana do NavBar, wyboru opcji z menu bocznego
    itemPicked(type, param) {
        //alert(type);
        const vt = this.vt;
        switch(type) {
            case cShape.NEW:
                vt.clearAll();
                if(vt.timeLapse) {
                    vt.timeLapse.stop();
                    vt.timeLapse = null;
                }
                if(Global.liveRef)
                    off(Global.liveRef)
                Global.liveRef = null;
                if(Global.nodeRef)
                    off(Global.nodeRef);
                Global.nodeRef = null;
                
                vt.type = cShape.SELECT;
                this.setState({...this.state, sessionName: ""});
                break;
            case cShape.START_NEW_SESSION:
                vt.clearAll();
                if(vt.timeLapse) {
                    vt.timeLapse.stop();
                    vt.timeLapse = null;
                }
                if(Global.liveRef)
                    off(Global.liveRef)
                Global.liveRef = null;
                if(Global.nodeRef)
                    off(Global.nodeRef);
                Global.nodeRef = null;
                vt.openLiveSession();
                // console.log(Global.user.uid);
                // console.log(Global.currentSession);
                if(Global.user && Global.currentSession) {
                    Global.bLive = true;
                    //dodaj obiekt pusty oznaczający rozpoczęsie liczenia czasu
                    vt.onNewShape(new Shape(cShape.START_NEW_SESSION, this.scene,  0, 0, "czas start", 0x000000 ));
                    //vt.loadDataFromSession(Global.currentSession);
                    this.setState({...this.state, sessionName: Global.currentSession});
                }
                break;
            case cShape.JOIN_ACIVE_SESSION:
                vt.clearAll();
                if(vt.timeLapse) {
                    vt.timeLapse.stop();
                    vt.timeLapse = null;
                }
                if(Global.liveRef)
                    off(Global.liveRef)
                Global.liveRef = null;
                if(Global.nodeRef)
                    off(Global.nodeRef);
                Global.nodeRef = null;
                if(Global.user && Global.currentSession) {
                    Global.bLive = true;
                    vt.openLiveSession();
                    // console.log("Opening Live ...");
                    this.setState({...this.state, sessionName: Global.currentSession});
                }
                break;
                case cShape.STOP_NEW_SESSION:
                    if(Global.user && Global.currentSession) {
                        if(Global.liveRef)
                            off(Global.liveRef)
                        Global.liveRef = null;
                        if(Global.nodeRef)
                            off(Global.nodeRef);
                        Global.nodeRef = null;
    
                        //dodaj obiekt pusty oznaczający rozpoczęsie liczenia czasu
                        vt.onNewShape(new Shape(cShape.STOP_NEW_SESSION, this.scene,  0, 0, "czas stop", 0x000000 ));
                        Global.currentSession = null;
                        vt.clearAll();
                        this.setState({...this.state, sessionName: ""});
                    }
                    break;
                    case cShape.CLOSE_DLG:
                        this.setState({...this.state, isOKField:false, msg: "", title: ""});
                        break;
                    case cShape.UNDO:
                        vt.sceneClear();
                        vt.historyPop();
                    break;
                    case cShape.REDO:
                        if (vt.isRedo()) {
                            vt.sceneClear();
                            vt.historyRedo();
                        }
                break;
                
            case cShape.LOAD_FIREBASE:
                if(!Global.currentSession || Global.currentSession.length < 1) return;
                vt.historyClear();
                vt.sceneClear();
                vt.OBJECTS = [];
                vt.meshes = [];
                vt.loadDataFromSession(Global.currentSession);
                this.setState({...this.state, sessionName: "Archiv: "+Global.currentSession});
                break;
            case cShape.SAVE_SVG:            
                this.saveToSVG(vt);
                break;
            case cShape.MIRRORX:
                vt.selectedNode && vt.selectedNode.setMirrorX();
                vt.selectedNode && vt.historyAddShape(vt.selectedNode);
                break;
            case cShape.MIRRORY:
                vt.selectedNode && vt.selectedNode.setMirrorY();
                vt.selectedNode && vt.historyAddShape(vt.selectedNode);
                break;
            case cShape.ZPLUS:
                vt.selectedNode && vt.selectedNode.ZPlus();
                vt.selectedNode && vt.historyAddShape(vt.selectedNode);
                break;
            case cShape.ZMINUS:
                vt.selectedNode && vt.selectedNode.ZMinus();
                vt.selectedNode && vt.historyAddShape(vt.selectedNode);
                break;
            case cShape.CHATMSG:
                vt.addChatMsg(param);
                break;
            case cShape.GRIDON_OFF:
                this.gridSwitch();
                break;
            case cShape.GRID_SNAP_ON_OFF:
                //TODO: tutaj jest błąd - usuń go!
                this.vt.gridSnap = !vt.gridSnap;
                Global.chkSnap = vt.gridSnap;
                vt.crosshair.visible = vt.gridSnap;
                break;
            case cShape.SCALEX:
                const sX = parseFloat(document.getElementById("scaleX").value);
                if(isNaN(sX)) {
                    vt.type = cShape.SELECT;
                    break;
                };
                vt.selectedNode && vt.selectedNode.setScaleX(sX);
                vt.selectedNode && vt.historyAddShape(vt.selectedNode);
                break;
            case cShape.SCALEY:
                const sY = parseFloat(document.getElementById("scaleY").value);
                if(isNaN(sY)) {
                    vt.type = cShape.SELECT;
                    break;
                };
                vt.selectedNode && vt.selectedNode.setScaleY(sY);
                vt.selectedNode && vt.historyAddShape(vt.selectedNode);
                break;
            case cShape.ROTATEZ:
                const rot = parseFloat(document.getElementById("rotateZ").value);
                if(isNaN(rot)) {
                    vt.type = cShape.SELECT;
                    break;
                };

                vt.selectedNode && vt.selectedNode.setRotate(rot);
                vt.selectedNode && vt.historyAddShape(vt.selectedNode);
                break;
    
            case cShape.DELETE:     //usuwaj zaznaczony obiekt
                if (vt.selectedNode) {
                    set(ref(Global.fb, `Sessions/${Global.currentSession}/${Shape.dateToTicks(new Date())}`),[{ 
                        type: cShape.DELETE,
                        id: vt.selectedNode.id,
                    }]
                    );
                    this.delete(vt.selectedNode);
                    console.log("DODANO do FB");
                    vt.historyAdd(true);
                }
                break;
            case cShape.COLORCHANGE:     //usuwaj zaznaczony obiekt
                if (vt.selectedNode && document.getElementById("color").value) {
                    vt.selectedNode.iColor = Number("0X"+document.getElementById("color").value.substr(1),);
                    vt.selectedNode.mesh?.material.color.setHex(vt.selectedNode.iColor);
                    vt.historyAddShape(vt.selectedNode);
                }
                break;

            case cShape.FREEPEN_CLOSE:
                const target = document.getElementById(targetPanelString);
                vt.finalizeFreePenFig(target);
                vt.historyAdd();
                break;
            case cShape.FREEPEN_CANCEL: 
            {
                const target = document.getElementById(targetPanelString);
                vt.cancelFreePenFig(target);
            }
            break;
            case cShape.COPY:      //kopiuje i powiela zaznaczoną figurę
            {
                vt.carbonCopy();
                vt.historyAdd();
                break;
            }
            case cShape.CLONE:      //kopiuje i powiela zaznaczoną figurę
            {
                vt.Clone();
                vt.historyAdd();
                break;
            }

            // case cShape.RECT:
            // case cShape.NGON:
            // case cShape.FREEPEN:
            // case cShape.NONE:
            default:
                vt.type = type;
                break;
        }    
    }

    saveToSVG(vt) {
        const blob = new Blob([vt.getSVG()], { type: 'text/xml' });
        const a = document.createElement('a');
        a.download = Global.currentSession?`${Global.currentSession}.svg`: 'demo.svg';
        a.href = URL.createObjectURL(blob);
        a.addEventListener('click', (e) => {
            setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
        });
        a.click();
    }

    delete(selectedNode, keepIt) {
        if(selectedNode == null) return;
        const vt = this.vt;
        if(vt.selectedNode.type == cShape.POLYGON && !vt.selectedNode.figureIsClosed) {
            vt.selectedNode.delPoint();
            return;
        }
        vt.scene.remove(selectedNode.mesh);
        selectedNode.linie && vt.scene.remove(selectedNode.linie);
        vt.OBJECTS = vt.OBJECTS.filter((obj) => obj !== selectedNode);
        vt.meshes = vt.meshes.filter((obj) => obj !== selectedNode.mesh);
        selectedNode.rmShape();

        if(!keepIt)
            // vt.deleteShape(selectedNode.ticks);
            selectedNode = null;
            Global.selectedShape = selectedNode;
    }

    async getShapes() {
        const url =  `${Global.baseURL}/Shape/GetShapes`;
        //console.log(url);
        let response = await this.getShapesRequest(url);
        //response = JSON.parse(response);
        try{
            response.forEach(sh => {
                const shape = new Shape(THREE, this.scene,  0, 0, "");
            this.vt.addShape(shape);
                shape.recreateShape(sh);
            });
        }catch(err) {
            console.log(err.message);
        }
        //this.setState({shapes: shapes});
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render( this.scene, this.camera );
    } 

    initTHREE(target, szer) {
        let renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        const targetPanel = document.getElementById(target);
        const wd = targetPanel.offsetWidth ; // parseInt(dh.offsetWidth);
        const hd = window.innerHeight; //parseInt(window.innerHeight * .6);
        renderer.setSize(wd, hd, true);
        renderer.domElement.id = "plansza";

        document.getElementById('main_panel').appendChild(renderer.domElement);


        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x5C7080);   //kolor tła
        const camera = new THREE.OrthographicCamera( 0, wd, 0, hd, -1000, 1000);   //przestrzeń ORTHO - 2D
        camera.position.set(0, 0, 0);
        camera.lookAt(new THREE.Vector3(0,0,0));

        
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;

        this.lightOn(this.scene);

        this.vt = new VitrualTable(THREE, this.scene, this.selectMenuCallback, this.updateChat.bind(this), this.endOfLiveSession.bind(this));
        const vt = this.vt;
        renderer.domElement.addEventListener('mouseup', function(event) { vt.onClick(event, targetPanel, camera, wd, hd); }, false);
        renderer.domElement.addEventListener('mousedown', function(event) { vt.onMouseDown(event, targetPanel, camera, wd, hd); }, false);
        renderer.domElement.addEventListener('mousemove', function(event) { vt.onMouseMove(event, targetPanel, camera, wd, hd); }, false);
        
        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
        // renderer.domElement.addEventListener('resize', this.addGrid(vt, scene));
        this.addGrid(vt, scene);
    }
    addGrid(vt, scene) {
        if(vt.grid) {
            scene.remove(vt.grid);    
        }
        vt.grid = new THREE.Group();
        const hiGrid = this.drawGrid(0x444444, 10, .7);
        const lowGrid = this.drawGrid(0x111111, 100, .7);
        vt.grid.add(hiGrid);
        vt.grid.add(lowGrid);
        scene.add(vt.grid);


        vt.crosshair = this.crosshair();
        vt.crosshair.visible = vt.gridSnap;
        vt.gridRes = 10;
    }
    componentDidUpdate() {
        this.addGrid(this.vt, this.scene);
    }

    onKeyDown(event) {
        const keyCode = event.which;
        const vt = this.vt;
        
        //if(event.shiftKey) vt.group = [];
        //przesuwamy
        if( vt.selectedNode) {  //vt.type == cShape.SELECT &&
            const multiply = event.ctrlKey?vt.gridRes:1;
            if (keyCode === event.DOM_VK_DOWN) {
                this.snapToGrid(vt);
                vt.selectedNode.mvShape([0,0],[0,1*multiply]);
                // down
            } else if (keyCode === event.DOM_VK_UP) {
                this.snapToGrid(vt);
                vt.selectedNode.mvShape([0,0],[0,-1*multiply]);
                // left
            } else if (keyCode === event.DOM_VK_RIGHT) {
                this.snapToGrid(vt);
                vt.selectedNode.mvShape([0,0],[1*multiply,0]);
                // right
            } else if (keyCode === event.DOM_VK_LEFT) {
                this.snapToGrid(vt);
                vt.selectedNode.mvShape([0,0],[-1*multiply,0]);
            }else if (keyCode === event.DOM_VK_DELETE) {
                this.itemPicked(cShape.DELETE, null);
            }
        }
    }

    snapToGrid(vt) {
        if (vt.gridSnap && vt.selectedNode) {
            vt.selectedNode.mesh.position.x = (parseInt(vt.selectedNode.mesh.position.x / vt.gridRes) * vt.gridRes);
            vt.selectedNode.mesh.position.x = (parseInt(vt.selectedNode.mesh.position.y / vt.gridRes) * vt.gridRes);
        }
    }

    crosshair() {
        const path = new THREE.Path();
        path.moveTo(0, -5);
        path.lineTo(0, 5);
        path.moveTo(0, 0);
        path.lineTo(5, 0);
        path.moveTo(0, 0);
        path.lineTo(-5, 0);

        const points = path.getPoints();
        const geometryL = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
            color: 0xDDDD22,
            linewidth: 1,
        });

        const crosshair = new THREE.Line(geometryL, mat);
        this.scene.add(crosshair);
        crosshair.visible = true;
        crosshair.position.set(400,400, 1000);
        return crosshair;

    }
    //jednorazowe rysowanie siatki
    drawGrid(color, res, opacity) {
        const targetPanel = document.getElementById('plansza');
        const wd = targetPanel.offsetWidth ; // parseInt(dh.offsetWidth);
        const hd = targetPanel.offsetHeight; //parseInt(window.innerHeight * .6);
        const gridRes = res;
        
        const path = new THREE.Path();
        path.moveTo(0, 0);
        for(let i = 0 ; i*gridRes < hd; i++) 
        {
            path.lineTo(i%2 == 0?wd:0, i * gridRes);
            path.moveTo(i%2 == 0?wd:0, (i+1) * gridRes);
        }

        path.moveTo(wd, hd);
        for(let i = 0 ; i <= Math.ceil(wd/gridRes); i++) {
            path.lineTo(i * gridRes, i%2 == 0?hd:0);
            path.moveTo(i * gridRes, (i+1)%2 == 0?hd:0);
        }
        

        const points = path.getPoints();
        const geometryL = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
            color: color,
            linewidth: 1,
            transparent: true,
            opacity: opacity,
        });
        
        const grid = new THREE.Line(geometryL, mat);
        grid.visible = !false;
        //this.scene.add(grid);
        grid.position.z = -1000;
        return grid;
    }

    //tweet = [author,label]
    updateChat(tweet, datetick) {
        if(tweet === null) {
            this.state.msgs = [];
            this.msgMap.clear();
        }
        else {
            //if(!this.msgMap.has(datetick)) 
            {
                this.msgMap.set(datetick, tweet);
                this.state.msgs.push(tweet);
            }
        }
        
        this.setState({...this.state, msgs:  this.state.msgs});  


    }
    //siatka ON/OFF
    gridSwitch() {
        this.vt.grid.visible = !this.vt.grid.visible;
        Global.chkGrid = this.vt.grid.visible;
        this.vt.crosshair.visible = this.vt.grid.visible && this.vt.gridSnap;
    }

    //wybór menu z obiektu vt po selekcji obiektu danego typu
    selectMenuCallback(type) {
        this.navbar.current?.menuItemSelectedHandler(type);
    }
    lightOn(scene) {
        //ambientne światło
        const lightA = new THREE.AmbientLight( 0xffffff );
        lightA.position.set( 0, 20, 0);
        scene.add( lightA );
    }

    render() { 
        return (
           <>
           {/* <FirebaseUpdate action={this.onFBUpdate}/> */}
           <NavBar action={this.itemPicked} ref={this.navbar} status={this.vt}/>
           {Global.user &&  <Sessionbar name={this.state.sessionName}/>}
           {Global.user &&  <MediaBar action={this.itemPicked} status={this.vt} msgs={this.state.msgs} ok={this.state.isOKField} msg={this.state.msg} title={this.state.title?this.state.title:null}/>}
           
           </>
        );
    }
}

export default Main;