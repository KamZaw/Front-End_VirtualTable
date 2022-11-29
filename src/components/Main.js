import { Component } from 'react';
import * as THREE from '../threejs/three.module.js';
import {TrackballControls}  from '../threejs/TrackballControls.js';
import {VitrualTable} from '../threejs/VitrualTable.js'
import Global from '../Global';
import {Shape} from '../threejs/Shape'
import NavBar from './NavBar';
import FirebaseUpdate from './FirebaseUpdate';
import {cShape} from '../shapetype';


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
    }
    componentDidMount() {

        //console.log("MAIN* * * ")
        this.initTHREE('main_panel', 1);
        //aktualizacja ekranu threejs
        this.animate();

        //listener na zmianach w bazie danych
        //this.FBListener();
        
        this.getShapes();
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
            case cShape.RECT:
                vt.type = type;
                break;
            case cShape.NGON:
                vt.type = type;
                break;
            case cShape.FREEPEN:
                vt.type = type;
                break;
            case cShape.DELETE:     //usówaj zaznaczony obiekt
                if (vt.selectedNode) {
                    this.delete(vt.selectedNode);
                }
                break;
            case cShape.NONE:
                this.vt.type = type;
            default:
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
        if(!keepIt)
            vt.deleteShape(selectedNode.ticks);
    }

    async getShapes() {
        const url =  `${Global.baseURL}/Shape/GetShapes`;
        console.log(url);
        let response = await this.getShapesRequest(url);
        //response = JSON.parse(response);
        let shapes = [];
        
        response.map(sh => {
            const shape = new Shape(THREE, this.scene,  0, 0, "");
            this.vt.addShape(shape);
            shape.recreateShape(sh);

        });
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

        this.vt = new VitrualTable(THREE, this.scene);
        const vt = this.vt;
        renderer.domElement.addEventListener('mouseup', function(event) { vt.onClick(event, targetPanel, camera, wd, hd); }, false);
        renderer.domElement.addEventListener('mousedown', function(event) { vt.onMouseDown(event, targetPanel, camera, wd, hd); }, false);
        renderer.domElement.addEventListener('mousemove', function(event) { vt.onMouseMove(event, targetPanel, camera, wd, hd); }, false);
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
           <FirebaseUpdate action={this.onFBUpdate}/>
           <NavBar action={this.itemPicked}/>
           </>
        );
    }
}

export default Main;