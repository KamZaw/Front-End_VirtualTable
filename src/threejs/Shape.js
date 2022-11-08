const rozmiarPola = 50;

class Shape {
    constructor(THREE, scene,  y, x, label, ) {
        const dt = new Date();
        this.THREE = THREE;
        this.scene = scene;
        this.siz = rozmiarPola;                             //rozmiar boku kwadratu węzła
        this.label = label?label: this.constructor.name;    //domyślnba etykieta to nazwa klasy, unikalna - sam obiekt Rectangle
        this.x = x;
        this.y = y;
        this.mesh = null;       //rysowane obiekty threejs
        this.linie = null;
        this.iColor = 0xE9E9E9;
        this.date = dt.toISOString();
        this.ticks = `${this.dateToTicks(dt)}`;
    }
    dateToTicks = (date) => date.getTime() * 10000 + 621355968000000000;
    rmShape() {
        this.scene.remove(this.mesh);
        this.scene.remove(this.linie);

        this.mesh = this.linie = null;
    }

    recreateShape(obj) {

        if(obj == null) return;
        this.ticks = obj.ticks;
        this.date = obj.date !== undefined?obj.date:obj.Date;
        this.sDescription = obj.sDescription;
        this.iColor = obj.iColor;
        this.points = obj.points;

        if(this.mesh !== null) {
            if(this.mesh) 
            this.scene.remove(this.scene.getObjectByName(this.mesh.name));
        if(this.linie)
            this.scene.remove(this.scene.getObjectByName(this.linie.name));
            this.scene.remove(this.mesh);
            this.scene.remove(this.linie);
            //return; //już jest dodany
        }

        // this.texture.repeat.set(1, 1);
        const verts = [];
        const normals = [];
        const pkt = [];
    
        //2
        for(let i=0; i < obj.points.length; i++) {
            verts.push(obj.points[i].x, obj.points[i].y,0);
            normals.push(0,0,1);
            
        }
        if(obj.points.length == 7) {
            pkt.push(new this.THREE.Vector3(obj.points[1].x, obj.points[1].y, 0));
            pkt.push(new this.THREE.Vector3(obj.points[0].x, obj.points[0].y, 0));
            pkt.push(new this.THREE.Vector3(obj.points[0].x, obj.points[0].y, 0));
            pkt.push(new this.THREE.Vector3(obj.points[2].x, obj.points[2].y, 0));
            pkt.push(new this.THREE.Vector3(obj.points[2].x, obj.points[2].y, 0));
            pkt.push(new this.THREE.Vector3(obj.points[4].x, obj.points[4].y, 0));
            pkt.push(new this.THREE.Vector3(obj.points[4].x, obj.points[4].y, 0));
            pkt.push(new this.THREE.Vector3(obj.points[1].x, obj.points[1].y, 0));//zamykamy obwód
        }
        else {
            for(let i=0; i < obj.points.length - 1 ; i++) {
                pkt.push(new this.THREE.Vector3(obj.points[i].x, obj.points[i].y, 0));
                
                pkt.push(new this.THREE.Vector3(obj.points[i+1].x, obj.points[i+1].y, 0));
            }
            pkt.push(new this.THREE.Vector3(obj.points[0].x, obj.points[0].y, 0));
        }         
        let geometry = new this.THREE.BufferGeometry();
        geometry.setAttribute('position', new this.THREE.Float32BufferAttribute(verts, 3));
        geometry.setAttribute('normal', new this.THREE.Float32BufferAttribute(normals, 3));
    
    
        const material = new this.THREE.MeshStandardMaterial({
            color: this.iColor,
        });
        material.side = this.THREE.DoubleSide;
    
    
        let box = new this.THREE.Mesh(geometry, material);
        box.name = "name";
        //box.position.set(this.x , this.y );
        this.scene.add(box);
    
        const materialL = new this.THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            linewidth: 1,
            opacity: 0.7,
        });
        const geometryL = new this.THREE.BufferGeometry().setFromPoints(pkt);
        const linie = new this.THREE.LineSegments(geometryL, materialL);
    
        this.scene.add(linie);
       
        //linie.position.set(this.x * a, this.y * a);
        this.mesh = box;
        this.linie = linie;

        this.mesh.name = obj.name;
        this.linie.name = `${obj.name}_linie`;
    }

    drawShape() {

        if(this.mesh !== null)
            return; //już jest dodany

        const a = this.siz;
        const verts = [];
        const normals = [];
    
        //2
        verts.push(0,a,0);
        normals.push(0,0,1);
        //1
        verts.push(0,0,0);
        normals.push(0,0,1);
        //4
        verts.push(a,a,0);
        normals.push(0,0,1);

        //4
        verts.push(a,a,0);
        normals.push(0,0,1);

        verts.push(a,0,0);
        normals.push(0,0,1);
        
        //2
        verts.push(0,0,0);
        normals.push(0,0,1);
        //3
        verts.push(a,0,0);
        normals.push(0,0,1);
            
        let geometry = new this.THREE.BufferGeometry();
        geometry.setAttribute('position', new this.THREE.Float32BufferAttribute(verts, 3));
        geometry.setAttribute('normal', new this.THREE.Float32BufferAttribute(normals, 3));
    
        const material = new this.THREE.MeshStandardMaterial({
            color: this.iColor,
        });
        material.side = this.THREE.DoubleSide;
    
    
        let box = new this.THREE.Mesh(geometry, material);
        box.name = "name";
        box.position.set(this.x * a, this.y * a);
        this.scene.add(box);
        const pkt = [];
        
        
        pkt.push(new this.THREE.Vector3(0, 0, 0));
        pkt.push(new this.THREE.Vector3(0, a, 0));
        pkt.push(new this.THREE.Vector3(a, a, 0));
        pkt.push(new this.THREE.Vector3(a, 0, 0));
        pkt.push(new this.THREE.Vector3(0, 0, 0));
    
    
        const materialL = new this.THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            linewidth: 3,
            opacity: 0.7,
        });
        const geometryL = new this.THREE.BufferGeometry().setFromPoints(pkt);
        const linie = new this.THREE.LineSegments(geometryL, materialL);
    
        this.scene.add(linie);
       
        linie.position.set(this.x * a, this.y * a);
        this.mesh = box;
        this.linie = linie;

        this.mesh.name = `${this.label}_${this.x}x${this.y}_mesh`;
        this.linie.name = `${this.mesh.name}_linie`;
        
    }
    setDefaultColor() {
        //this.mesh.material.color.setHex( this.iColor );
        this.linie.material.color.setHex( 0x000000 );
    }
    setFillColor(fillColor){
        this.linie.material.color.setHex( fillColor );
    }
    getFillColor(){
        return this.linie.material.color;
    }
}
export {Shape}