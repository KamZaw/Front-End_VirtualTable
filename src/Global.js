
class Global {
    
    static get shapeURL() { return  "https://localhost:7026/Shape";};
    static get localURL() { return "http://localhost:3000"; };
    static get baseURL() {   return "https://localhost:7026";};
    static get cornerSize() {return  12;};
    static get halfSize() { return Global.cornerSize/2}; 
    static selectedShape = null;
    static user = null;
    static fb = null;
    static firebaseApp = null;
    static currentSession = "sesja1";          //nazwa sesji pobrana z internetu albo od użytkownika    
    static nodeRef = null;
}

export default Global;