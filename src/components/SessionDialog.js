import "../assets/loginform.css"
import "../assets/w3.css"
import { Component } from "react";
// import {createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from "firebase/auth"
// import {initializeApp} from "firebase/app"
// import {firebaseConfig} from "../firebase-config"
import Global from "../Global";
import {ref,  child, get, off, onValue} from "firebase/database";
import { cShape } from "../shapetype";
class SessionDialog extends Component {
    constructor(props){
        super(props);
        this.state = {
            title:props.title,
            msg: props.msg,
            isVisible: props.isVisible,
        };
        this.sessionName = Global.currentSession;
        this.getSessions = this.getSessions.bind(this);
        this.sessions = this.sessions.bind(this);
        this.lista = [];
        this.nodeRef = null;

    }
    sessionSelect(e) {
        if(e.target.getAttribute("val") ) {
            //sprawdzamy czy to sesja archiwalna czy aktualna:
            Global.currentSession = e.target.getAttribute("val");
            
            if(Global.listaAktulane.filter( s => s.val === Global.currentSession ).length > 0) {
                this.props.action(cShape.JOIN_ACIVE_SESSION);
                Global.listaAktulane.filter( s => console.log(s.val));
            }
            else                
                this.props.action(e.target.getAttribute("val"));    //otwieraj archiwalną
        }
    }
    onNo() {
        this.props.action(false);
    }

    onInputChange(event) {
        this.sessionName = event.target.value;
    } 

    sessions() {
        return ;
    }
     componentDidMount() {
         this.getSessions();
    }
     componentDidUpdate() {
        // this.getSessions();

    }
    componentWillUnmount() {
        if (this.nodeRef)
             off(this.nodeRef);
    }
    async getSessions() {
        const dbRef = ref(Global.fb);
        //console.log(`Sessions/${Global.currentSession+"/"+Global.user.uid}/`);
        // Global.nodeRef = child(dbRef, `Sessions/`);
        // const snapshot = await get(Global.nodeRef);
        if (this.nodeRef)
             off(this.nodeRef);

        //console.log(`Sessions/${Global.currentSession+"/"+Global.user.uid}/`);
        
        this.nodeRef = child(dbRef, `Sessions/`);
        onValue(this.nodeRef, (snapshot) => { 
            const live = this.props.live;
            if (snapshot.exists()) {
                    const mapa = snapshot.val();
                    this.lista = [];
                    Global.listaArchiwalne = [];
                    Global.listaAktulane = [];
                    for(const i in mapa) {
                        let stop = false;
                        const o = mapa[i][Object.keys(mapa[i])[Object.keys(mapa[i]).length-1]];
                        if(o[o.length-1].type === cShape.STOP_NEW_SESSION)
                            stop = true;
                        // console.log(Object.keys(mapa[i])[0]);console.log(">"+ Object.keys(mapa[i])[Object.keys(mapa[i]).length-1]);
                        if(( !stop ) ) {
                            Global.listaAktulane.push({val:`${i}`, 
                                data: `${new Date(parseInt(Object.keys(mapa[i])[0] - 621355968000000000)/10000).toLocaleDateString('pl-PL')}`,
                                czasStart: `${new Date(parseInt(Object.keys(mapa[i])[0] - 621355968000000000)/10000).toLocaleTimeString('pl-PL')}`,
                                czasStop: `${new Date(parseInt(Object.keys(mapa[i])[Object.keys(mapa[i]).length-1] - 621355968000000000)/10000)
                                .toLocaleTimeString('pl-PL')}`,
                                });
                        }
                        else {
                            Global.listaArchiwalne.push({val:`${i}`, 
                                data: `${new Date(parseInt(Object.keys(mapa[i])[0] - 621355968000000000)/10000).toLocaleDateString('pl-PL')}`,
                                czasStart: `${new Date(parseInt(Object.keys(mapa[i])[0] - 621355968000000000)/10000).toLocaleTimeString('pl-PL')}`,
                                czasStop: `${new Date(parseInt(Object.keys(mapa[i])[Object.keys(mapa[i]).length-1] - 621355968000000000)/10000)
                                .toLocaleTimeString('pl-PL')}`,
                                });
                        }
                    }
                } else {
                    console.log("Brak danych dla sesji");
                }
                if(live)
                    this.lista = Global.listaAktulane;
                else
                    this.lista = Global.listaArchiwalne;
            });
        
        return this.lista;
    } 
    render() {
        if(!this.props.isVisible) {
            return (<></>);
        }
        if(!this.props.live)
            this.lista = Global.listaAktulane;
        else
            this.lista = Global.listaArchiwalne;
        return (
            <>
            <div className={"container modal"}>
                <div className="login-box animated fadeInUp">
                    <div className="box-header">
                        {/* <span className="close" onClick={this.onNo.bind(this)}>&times;</span> */}
                        <span onClick={this.onNo.bind(this)} className="w3-button w3-display-topright">&times;</span>
                        <h2>{this.props.title}</h2>
                    </div>
                    {<p className="message_text"><b>{!this.props.live?"Sesje aktywne:":"Sesje archiwalne:"}</b></p>}
                    <ul className="w3-ul w3-border">
                        {this.lista.map( (s, i) => <li key={i} onClick={this.sessionSelect.bind(this)} val={s.val} ><b>{s.val} {s.data}</b><br/>od: {s.czasStart}<br/>od: {s.czasStop}</li>)}
                    </ul>
                    <br/>

                    <button className="dlgbutton" onClick={this.onNo.bind(this)}>Anuluj</button>
                    <br/>
                </div>
            </div>
            </>            
        );
    }
}

export default SessionDialog;