const rozmiarPola = 50;

class Shape {
    constructor(THREE, scene,  y, x, label, ) {
        this.THREE = THREE;
        this.scene = scene;
        this.siz = rozmiarPola;                             //rozmiar boku kwadratu węzła
        this.label = label?label: this.constructor.name;    //domyślnba etykieta to nazwa klasy, unikalna - sam obiekt Rectangle
        this.x = x;
        this.y = y;
        this.mesh = null;       //rysowane obiekty threejs
        this.linie = null;
        this.defaultFillColor = 0xE9E9E9;
    }
    rmShape() {
        if(this.mesh) 
            this.scene.remove(this.scene.getObjectByName(this.mesh.name));
        if(this.linie)
            this.scene.remove(this.scene.getObjectByName(this.linie.name));
        this.mesh = this.linie = null;
    }
    drawShape() {

        let i = 0;
        let iMax = 1;
        if(this.mesh !== null)
            return; //już jest dodany

        const a = this.siz;

        // this.texture.repeat.set(1, 1);
        const uvs = [];
        const verts = [];
        const normals = [];
    
        //2
        verts.push(0,a,0);
        normals.push(0,0,1);
        uvs.push(i * 1/iMax,0);
        //1
        verts.push(0,0,0);
        normals.push(0,0,1);
        uvs.push((i+1) * 1/iMax,0);
        //4
        verts.push(a,a,0);
        normals.push(0,0,1);
        uvs.push((i+0)*1/iMax,1);           

        //4
        verts.push(a,a,0);
        normals.push(0,0,1);
        uvs.push((i+0)*1/iMax,1);           
        verts.push(a,0,0);
        normals.push(0,0,1);
        uvs.push((i + 1) * 1/iMax,1);
        
        //2
        verts.push(0,0,0);
        normals.push(0,0,1);
        uvs.push((i+1) * 1/iMax,0);
        //3
        verts.push(a,0,0);
        normals.push(0,0,1);
        uvs.push((i + 1)*1/iMax,1);
            
         
        let geometry = new this.THREE.BufferGeometry();
        geometry.setAttribute('position', new this.THREE.Float32BufferAttribute(verts, 3));
        geometry.setAttribute('normal', new this.THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new this.THREE.Float32BufferAttribute(uvs, 2));
    
    
        const material = new this.THREE.MeshStandardMaterial({
            color: 0xE9E9E9,
        });
        material.side = this.THREE.DoubleSide;
    
    
        let box = new this.THREE.Mesh(geometry, material);
        box.name = "name";
        box.position.set(this.x * a, this.y * a);
        this.scene.add(box);
        const pkt = [];
        
        
        pkt.push(new this.THREE.Vector3(0, 0, 0));
        pkt.push(new this.THREE.Vector3(0, a, 0));
        
        pkt.push(new this.THREE.Vector3(0, a, 0));
        pkt.push(new this.THREE.Vector3(a, a, 0));
        
        pkt.push(new this.THREE.Vector3(a, a, 0));
        pkt.push(new this.THREE.Vector3(a, 0, 0));
        
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
        this.linie.name = `${this.label}_${this.x}x${this.y}_linie`;
        
    }
    setDefaultColor() {
        this.mesh.material.color.setHex( this.defaultFillColor );
    }
    setFillColor(fillColor){
        this.mesh.material.color.setHex( fillColor );
    }
}

class GroundNode extends Node {
    constructor(THREE, scene, texture, y, x, label) {
        super(THREE, scene, texture, y, x, label);
    }
}
export {Shape}