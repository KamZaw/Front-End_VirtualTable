import './main.css';
import * as THREE from './three.module.js';

import {Shape} from './Nodes.js'
import {Rectangle} from './Rectangle.js'

const cShape ={
    NONE:   0,
    RECT:   1,
    NGON:   2,
    CIRCLE: 3,
    POLYGON:4,
};

class VitrualTable {
    constructor(THREE, scene) {
        this.type = cShape.NONE;
        this.THREE = THREE;
        this.scene = scene;
        this.OBJECTS = [];
        this.scene = scene;
        this.selectedNode = null;
        this.meshes = [];
        this.init();
    }

    init() {
        $("#del").unbind().click(()=>{
            if(this.selectedNode) {
                this.scene.remove(this.selectedNode.mesh);
                this.OBJECTS = this.OBJECTS.filter((obj) => obj != this.selectedNode );
                this.selectedNode.rmShape();
            }
        });
        const that = this;
        $("#rect").unbind().click(()=>{
            if( that.type == cShape.RECT) {
                $(".menubar").addClass('hidden');
                that.type = cShape.NONE;
            } 
            else {
                $(".menubar").removeClass('hidden');
                that.type = cShape.RECT;
            }
        });
        $('#rect_color').on('input', function() { 
            //$(this).val()
            $("#colorpicker").css("background-color", "#"+$(this).val());
        });
    }
    //wybiera obiekty do przeglądania przy klikaniu
    //obsluga zdarzenia kliku na planszę
    onClick(event, targetPanel, camera, wd, hd) {
        
        let bLeft = true;

        // console.log(bLeft);
        const mouse3D = new THREE.Vector3( ( event.clientX -targetPanel.offsetLeft -21),   
        ( event.clientY - targetPanel.offsetTop -24),  1000); //z == camera.far
        
        //console.log(mouse3D);
        

        switch (event.which) {
            case 1: //left
            switch(this.type) {
                case cShape.RECT: {
                    const node = new Rectangle(THREE, this.scene, ( event.clientX -targetPanel.offsetLeft -21),   
                    -( event.clientY - targetPanel.offsetTop -24), "prostokat", $("#rect_width").val(), $("#rect_height").val(),"0x"+$('#rect_color').val());
                    node.drawShape();
                    this.OBJECTS.push(node);
                    this.meshes.push(node.mesh);
                    this.selectedNode = node;
                    this.select(null);
                    node.setFillColor( 0xffffff );
                    break;
                }
                case cShape.NGON:
                    break;
                case cShape.CIRCLE:
                    break;
                case cShape.POLYGON:
                    break;
                default:
                    break;
                }
                return;
            case 3: //right
                bLeft = false;
              break;
        }        


        const raycaster = new THREE.Raycaster();
        raycaster.set(mouse3D, new THREE.Vector3(0,0,-1) );

        const intersects = raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
            //TODO: dodac sortowanie po buferze Z
            this.select(intersects[ 0 ].object);
        }
        else
            this.select(null);
    }

    select(pole) {
        const g = this.g;
        for(let shape of this.OBJECTS) {
            if(shape.mesh !== pole)
                shape.setDefaultColor();
        }
        
        if(pole) {
            pole.material.color.setHex( 0xffffff );
            const pola = [];
            //zbieramy zaznaczone
            for(let shape of this.OBJECTS) {
                if( shape.mesh.material.color.getHex() ==  0xFFFFFF) {
                    //pola.push(shape);
                    this.selectedNode = shape;
                }
            }
    
            
        } 
    }
}

export {VitrualTable}