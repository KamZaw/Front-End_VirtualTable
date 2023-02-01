import { Component } from 'react';
import React from 'react';
import * as THREE from 'three';
import {TrackballControls}  from '../threejs/TrackballControls.js';
import {VitrualTable} from '../threejs/VitrualTable.js'
import Global from '../Global';
import {Shape} from '../threejs/Shape'
import NavBar from './NavBar';
import {initializeApp} from "firebase/app"
import { getDatabase, ref, set, update } from "firebase/database";
import {getAuth, onAuthStateChanged, signOut} from "firebase/auth"
import {firebaseConfig} from "../firebase-config"
import {cShape} from '../shapetype';
import Sessionbar from './SessionBar.js';


const targetPanelString = 'main_panel';

class Main extends Component {

    constructor() {
        super();
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.controls = null; 
        this.vt = null;
        this.itemPicked = this.itemPicked.bind(this);
        this.onFBUpdate = this.onFBUpdate.bind(this);
        this.selectMenuCallback = this.selectMenuCallback.bind(this);     
        this.navbar = React.createRef();

        this.state = {
            loggedIn: false,
        }
        Global.firebaseApp = initializeApp(firebaseConfig);
        onAuthStateChanged(getAuth(Global.firebaseApp), (currentUser) => {
            currentUser ? console.log(">>>"+currentUser.email): console.log(">>> logOut"); 
            Global.user = currentUser;
            Global.fb = getDatabase(Global.firebaseApp );
              Global.user && Global.fb && update(ref(Global.fb, `Students/${Global.user.uid}/`), 
            {
                // refreshed: Shape.dateToTicks(new Date()),
                loggedIn: currentUser!= null
            });
            this.setState({...this.state, loggedIn: currentUser!= null})
      } ).bind(this);
    }

    componentDidMount() {

        //console.log("MAIN* * * ")
        this.initTHREE(targetPanelString, 1);
        //aktualizacja ekranu threejs
        this.animate();

        //listener na zmianach w bazie danych
        //this.FBListener();
        
        //czytaj z BACKENDU dane o obiektach
        //this.getShapes();
        //TODO:analogiczne dla innych obiektów (np getTexts())

    }
    componentWillUnmount() {
        signOut(getAuth(Global.firebaseApp));
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
    itemPicked(type) {
        //alert(type);
        const vt = this.vt;
        switch(type) {
            case cShape.NEW:{
                //może dialog pytający się czy na pewno wyczyścić tablicę bez zapisu
                vt.historyClear();

                this.cleanTHREE();
                vt.OBJECTS = [];
                vt.meshes = [];
                vt.type = cShape.SELECT;
                
            }
            break;
            case cShape.UNDO:
                this.cleanTHREE();
                vt.historyPop();
                break;
            case cShape.REDO:
                if (vt.isRedo()) {
                    this.cleanTHREE();
                    vt.historyRedo();
                }
                break;
            
            case cShape.LOAD_FIREBASE:
                if(!Global.currentSession || Global.currentSession.length < 1) return;
                vt.historyClear();

                this.cleanTHREE();
                vt.OBJECTS = [];
                vt.meshes = [];
                
                vt.loadDataFromSession(Global.currentSession);
                break;
            case cShape.SAVE_SVG:            
                alert("Zapis do SVG jeszcze nie zaimplementowany");
                break;
            case cShape.MIRRORX:
                vt.selectedNode && vt.selectedNode.setMirrorX();
                vt.selectedNode && vt.historyAdd();
                break;
            case cShape.MIRRORY:
                vt.selectedNode && vt.selectedNode.setMirrorY();
                vt.selectedNode && vt.historyAdd();
                break;
            case cShape.ZPLUS:
                vt.selectedNode && vt.selectedNode.ZPlus();
                vt.selectedNode && vt.historyAdd();
                break;
            case cShape.ZMINUS:
                vt.selectedNode && vt.selectedNode.ZMinus();
                vt.selectedNode && vt.historyAdd();
                break;
            case cShape.GRIDON_OFF:
                this.gridSwitch();
                break;
            case cShape.GRID_SNAP_ON_OFF:
                //TODO: tutaj jest błąd - usuń go!
                this.vt.gridSnap = !this.vt.gridSnap;
                this.crosshair.visible = !this.crosshair.visible;
                break;
            case cShape.SCALEX:
                const sX = parseFloat(document.getElementById("scaleX").value);
                if(isNaN(sX)) return;
                vt.selectedNode && vt.selectedNode.setScaleX(sX);
                vt.selectedNode && vt.historyAdd();
                break;
            case cShape.SCALEY:
                const sY = parseFloat(document.getElementById("scaleY").value);
                if(isNaN(sY)) return;

                vt.selectedNode && vt.selectedNode.setScaleY(sY);
                vt.selectedNode && vt.historyAdd();
                break;
    
            case cShape.DELETE:     //usuwaj zaznaczony obiekt
                if (vt.selectedNode) {
                    this.delete(vt.selectedNode);
                    vt.historyAdd();
                }
                break;
            case cShape.COLORCHANGE:     //usuwaj zaznaczony obiekt
                if (vt.selectedNode && document.getElementById("color").value) {
                    vt.selectedNode.iColor = Number("0X"+document.getElementById("color").value,);
                    vt.selectedNode.mesh?.material.color.setHex(vt.selectedNode.iColor);
                    vt.historyAdd();
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

    delete(selectedNode, keepIt) {
        if(selectedNode == null) return;
        const vt = this.vt;
        vt.scene.remove(selectedNode.mesh);
        selectedNode.linie && vt.scene.remove(selectedNode.linie);
        vt.OBJECTS = vt.OBJECTS.filter((obj) => obj != selectedNode);
        vt.meshes = vt.meshes.filter((obj) => obj != selectedNode.mesh);
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
        let shapes = [];
        
            try{
                response.map(sh => {
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
        this.controls.update();
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
        const controls = new TrackballControls(camera, renderer.domElement);
        controls.minDistance = 0;
        controls.maxDistance = 1000;
        
        controls.rotateSpeed = 0;
        controls.zoomSpeed = 0.8;
        controls.panSpeed = 0.3;
        
        controls.noRotate = true;
        controls.noZoom = true;
        controls.noPan = true;
        
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.controls = controls; 

        this.lightOn(this.scene);

        this.vt = new VitrualTable(THREE, this.scene, this.selectMenuCallback);
        const vt = this.vt;
        renderer.domElement.addEventListener('mouseup', function(event) { vt.onClick(event, targetPanel, camera, wd, hd); }, false);
        renderer.domElement.addEventListener('mousedown', function(event) { vt.onMouseDown(event, targetPanel, camera, wd, hd); }, false);
        renderer.domElement.addEventListener('mousemove', function(event) { vt.onMouseMove(event, targetPanel, camera, wd, hd); }, false);
        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
        this.hiGrid = this.drawGrid(0x444444, 10, .7);
        this.lowGrid = this.drawGrid(0x111111, 100, .7);
        
        vt.crosshair = this.crosshair();
        vt.gridRes = 10;
    }

    onKeyDown(event) {
        const keyCode = event.which;
        const vt = this.vt;
        
        if(vt.gridSnap && vt.selectedNode) {
            vt.selectedNode.mesh.position.x = (parseInt(vt.selectedNode.mesh.position.x/vt.gridRes)*vt.gridRes)
            vt.selectedNode.mesh.position.x = (parseInt(vt.selectedNode.mesh.position.y/vt.gridRes)*vt.gridRes)
        }
        const multiply = event.ctrlKey?vt.gridRes:1;
        //przesuwamy
        if( vt.selectedNode) {  //vt.type == cShape.SELECT &&
            if (keyCode == event.DOM_VK_DOWN) {
                vt.selectedNode.mvShape([0,0],[0,1*multiply]);
                // down
            } else if (keyCode == event.DOM_VK_UP) {
                vt.selectedNode.mvShape([0,0],[0,-1*multiply]);
                // left
            } else if (keyCode == event.DOM_VK_RIGHT) {
                vt.selectedNode.mvShape([0,0],[1*multiply,0]);
                // right
            } else if (keyCode == event.DOM_VK_LEFT) {
                vt.selectedNode.mvShape([0,0],[-1*multiply,0]);
            }else if (keyCode == event.DOM_VK_DELETE) {
                this.delete(vt.selectedNode);
            }
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
        crosshair.position.set(400,400, 100);
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

        for(let i = Math.ceil(wd/gridRes) ; i>=0; i--) {
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
        this.scene.add(grid);
        grid.position.z = -1000;
        return grid;
    }

    gridSwitch() {
        this.lowGrid.visible = !this.lowGrid.visible;
        this.hiGrid.visible = !this.hiGrid.visible;
        this.vt.gridSnap = this.hiGrid.visible;
        this.vt.crosshair.visible = this.hiGrid.visible;
    }

    //wybór menu z obiektu vt po selekcji obiektu danego typu
    selectMenuCallback(type) {
        this.navbar.current.menuItemSelectedHandler(type);
    }
    lightOn(scene) {
        //ambientne światło
        const lightA = new THREE.AmbientLight( 0xffffff );
        lightA.position.set( 0, 20, 0);
        scene.add( lightA );
    }

    cleanTHREE(){
        while(this.scene.children.length > 0){ 
            this.scene.remove(this.scene.children[0]); 
        }
        this.lightOn(this.scene);
    }
    render() { 
        return (
           <>
           {/* <FirebaseUpdate action={this.onFBUpdate}/> */}
           <NavBar action={this.itemPicked} ref={this.navbar}/>
           {Global.user &&  <Sessionbar />}
           
           </>
        );
    }
}

export default Main;