import '../assets/main.css';
import $ from 'jquery'
import Global from '../Global';
import {Rectangle} from './Rectangle.js'
import {Ngon} from './Ngon'
import cShape from '../shapetype';



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
        // $('#rect_color').on('input', function() { 
        //     //$(this).val()
        //     $("#colorpicker").css("background-color", "#"+$(this).val());
        // });
    }

    async deleteShape(ticks) {
        try{
            let result = null;
            const headers = {
                'Access-Control-Allow-Origin': `${Global.localURL}`,
            };
        
            result = await fetch(`${Global.baseURL}/Shape/delete/${ticks}`, 
            {
                mode: 'cors',
                headers: headers,
                method: 'DELETE',
            });//.then(responce => {return responce.json()}).then(responceData => {return responceData});

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
            console.log(JSON.stringify(o));
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
              headers: { "Content-Type": res.headers.get("Content-Type") },
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
        this.OBJECTS.push(node);
        this.meshes.push(node.mesh);
        this.selectedNode = node;
        this.select(null);
        node.setFillColor( 0xffffff );
        this.putData(node);
    }
    //wybiera obiekty do przeglądania przy klikaniu
    //obsluga zdarzenia kliku na planszę
    onClick(event, targetPanel, camera, wd, hd) {
        
        let bLeft = true;

        // console.log(bLeft);
        const mouse3D = new this.THREE.Vector3( ( event.clientX -targetPanel.offsetLeft -21),   
        ( event.clientY - targetPanel.offsetTop -24),  1000); //z == camera.far
        
        //console.log(mouse3D);
        

        switch (event.which) {
            case 1: //left
                switch(this.type) {
                    case cShape.RECT: {
                        const node = new Rectangle(this.THREE, this.scene, ( event.clientX -targetPanel.offsetLeft -21),   
                        -( event.clientY - targetPanel.offsetTop -24), "prostokat",  $("#rect_height").val(),$("#rect_width").val(),"0x"+$('#rect_color').val());
                        this.onNewShape(node);
                        break;
                    }
                    case cShape.NGON:
                        const node = new Ngon(this.THREE, this.scene, ( event.clientX -targetPanel.offsetLeft -21),   
                        -( event.clientY - targetPanel.offsetTop -24), "ngon", $("#radius").val(), $("#ngons").val(),"0x"+$('#ngon_color').val());
                        this.onNewShape(node);
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
            default:
                break;
        }        


        const raycaster = new this.THREE.Raycaster();
        raycaster.set(mouse3D, new this.THREE.Vector3(0,0,-1) );

        const intersects = raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
            //TODO: dodac sortowanie po buferze Z
            this.select(intersects[ 0 ].object);
        }
        else
            this.select(null);
    }

    select(pole) {
        for(let shape of this.OBJECTS) {
            if(shape.mesh !== pole)
                shape.setDefaultColor();
            else if( pole != null) {
                 shape.setFillColor( 0xffffff );
                this.selectedNode = shape;
            }
        }
    }
}

export {VitrualTable}