import { Component } from 'react';
import React from 'react';
import * as THREE from '../threejs/three.module.js';
import {TrackballControls}  from '../threejs/TrackballControls.js';
import {VitrualTable} from '../threejs/VitrualTable.js'
import Global from '../Global';
import {Shape} from '../threejs/Shape'
import NavBar from './NavBar';
import FirebaseUpdate from './FirebaseUpdate';
import {cShape} from '../shapetype';
import {onAuthStateChanged} from "firebase/auth"

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
                this.cleanTHREE();
                this.OBJECTS = [];
                this.meshes = [];
                this.type = cShape.SELECT;
                
            }
            break;
            case cShape.UNDO:
                break;
            case cShape.REDO:
                break;
            case cShape.SAVE_SVG:            
                alert("Zapis do SVG jeszcze nie zaimplementowany");
                break;
            case cShape.ZPLUS:
                vt.selectedNode && vt.selectedNode.ZPlus();
                break;
            case cShape.ZMINUS:
                vt.selectedNode && vt.selectedNode.ZMinus();
                break;
            case cShape.SCALEX:
                vt.selectedNode && vt.selectedNode.setScaleX(.7);
                break;
            case cShape.SCALEY:
                vt.selectedNode && vt.selectedNode.setScaleY(.7);
                break;
    
                    case cShape.DELETE:     //usuwaj zaznaczony obiekt
                if (vt.selectedNode) {
                    this.delete(vt.selectedNode);
                }
                break;
            case cShape.COLORCHANGE:     //usuwaj zaznaczony obiekt
                if (vt.selectedNode && document.getElementById("color").value) {
                    vt.selectedNode.iColor = Number("0X"+document.getElementById("color").value,);
                    vt.selectedNode.mesh.material.color.setHex(vt.selectedNode.iColor);
                }
                break;

            case cShape.FREEPEN_CLOSE:
                const target = document.getElementById(targetPanelString);
                vt.finalizeFreePenFig(target);
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
                break;
            }
            case cShape.CLONE:      //kopiuje i powiela zaznaczoną figurę
            {
                vt.Clone();
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
            vt.deleteShape(selectedNode.ticks);
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
    }

    onKeyDown(event) {
        const keyCode = event.which;
        const vt = this.vt;
        
        const multiply = event.ctrlKey?10:1;
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

           
           </>
        );
    }
}

export default Main;