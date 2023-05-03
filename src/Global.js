
class Global {
    
    static get shapeURL() { return  "https://localhost:7026/Shape";};
    static get localURL() { return "http://localhost:3000"; };
    static get baseURL() {   return "https://localhost:7026";};
    static get cornerSize() {return  8;};
    static get halfSize() { return Global.cornerSize/2}; 
    static selectedShape = null;
    static user = null;
    static currentUserColor = "#4444AA";
    static fb = null;
    static firebaseApp = null;
    static currentSession = null;          //nazwa sesji pobrana z internetu albo od użytkownika    
    static bLive = false;               //jeśli currentSession && bLive tzn. aktualizuj w FB
    static nodeRef = null;
    static liveRef = null;                  //referencja do sesji LIVE
    static broadcast = null;
    static chkGrid = true;
    static chkSnap = !true;
    static sessionOn = false;
    static students = new Map();
    static separator = "!@!";
    static adminRights = ['VRGQyqLSB0axkDKbmgye3wyDGJo1'];
    static listaAktulane = [];
    static listaArchiwalne = [];
}

export default Global;