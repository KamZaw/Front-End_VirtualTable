import { Component } from 'react';
import * as THREE from './three.module.js';
import {TrackballControls}  from './TrackballControls.js';
import {VitrualTable} from './VitrualTable.js'


class Main extends Component {

    constructor() {
        super();
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.controls = null; 
        this.vt = null;
    }
    componentDidMount() {

        this.initTHREE('main_panel', 1);
        this.animate();
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


        let scene = new THREE.Scene();
        scene.background = new THREE.Color(0x5C7080);   //kolor tła
        let camera = new THREE.OrthographicCamera( 0, wd, 0, hd, -1000, 1000);   //przestrzeń ORTHO - 2D
        //camera = new THREE.PerspectiveCamera( 50, wd/hd, 0.1, 1000 );
        camera.position.set(0, 0, 0);
        camera.lookAt(new THREE.Vector3(0,0,0));
        let controls = new TrackballControls(camera, renderer.domElement);
        controls.minDistance = 0;
        controls.maxDistance = 1000;
        
        controls.rotateSpeed = 0;
        controls.zoomSpeed = 0.8;
        controls.panSpeed = 0.3;
        
        controls.noRotate = true;
        controls.noZoom = true;
        controls.noPan = true;
        
        this.lightOn(scene);
        this.vt = new VitrualTable(THREE, scene);
        const vt = this.vt;
        renderer.domElement.addEventListener('mouseup', function(event) { vt.onClick(event, targetPanel, camera, wd, hd); }, false);
        
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.controls = controls; 
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
            <div>
                
            </div>
        );
    }
}

export default Main;