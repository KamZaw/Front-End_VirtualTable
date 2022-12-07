
class Global {
    
    static get shapeURL() { return  "https://localhost:7026/Shape";};
    static get localURL() { return "http://localhost:3000"; };
    static get baseURL() {   return "https://localhost:7026";};
    static get cornerSize() {return  18;};
    static get halfSize() { return Global.cornerSize/2}; 
    static selectedShape = null;
}

export default Global;