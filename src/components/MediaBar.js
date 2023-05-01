import "../assets/w3.css"
import { Component } from "react";
import React from 'react';
import ChatWindow from "./ChatWindow";
import SessionDialog from "./SessionDialog"
import {cShape} from '../shapetype';
import newsession from '../assets/navbar/newsession.png';
import newsessionoff from '../assets/navbar/newsessionstop.png';
import Global from "../Global"
import AudioBroadcast from "./AudioBroadcast"
import load from '../assets/navbar/load.png';
import chat from '../assets/navbar/chat.png';
import MessageBox from "./MessageBox"

/*
    Pasek do komunikacji i interakcji, rozpoczynania sesji, przekazywania praw rysowania itp
*/

class MediaBar extends Component {
    constructor(props){
        super(props);
        this.component = null;
        this.sessionRef = React.createRef();
        this.state = {
            isOpenSessionWindow: false,
            isOpenMsgWindow: false,
            isOKField: false,
            loadLive: false,
            title: "",
            msg: "",
            errmsg: "",
            chatWindow: false
        };
        this.menuItemSelectedHandler = this.menuItemSelectedHandler.bind(this);
    }
    onNewSession(state) {
        if(state) {
            this.setState({...this.state, title:"Utwórz sesję", msg: "Podaj nazwę nowej sesji", isOpenMsgWindow: state, isInputField: state});
        }
        this.sessionRef.current.onNewSession(state);       //kończymy nagranie audio i wysyłamy plik na serwer
    }
    onLoadFB () {
        this.setState({...this.state, title:"Wirtualna Tablica", msg: "Podaj nazwę sesji", isOpenSessionWindow: true, isInputField: true, loadLive: !false});
    }
    onLoadFBLive () {
        this.setState({...this.state, title:"Wirtualna Tablica", msg: "Podaj nazwę sesji", isOpenSessionWindow: true, isInputField: true, loadLive: !true});
    }
    onOpenChat () {
        this.setState({...this.state, chatWindow: !this.state.chatWindow});
    }
    loadSession(val) {
        if(typeof val === 'string') {
            Global.currentSession = val;
            Global.bLive = false;
            this.setState({...this.state, title:"", msg: "", input: false, isOpenSessionWindow: false,});
            this.props.action(cShape.LOAD_FIREBASE);
            this.sessionRef.current.onPlay();
        }
        else if (val === cShape.JOIN_ACIVE_SESSION) {
            this.setState({...this.state, title:"", msg: "", input: false, isOpenSessionWindow: false,});
            this.props.action(cShape.JOIN_ACIVE_SESSION);

        }
        
        this.setState({...this.state, title:"", msg: "", input: false, isOpenSessionWindow: false,});
    }
    hideAudioBar() {
        document.getElementById('audio1').setAttribute("hidden",true);      //usuwaj pasek jeśli jest
    }


    //powrót dialogu z podawaną nazwą sesji
    responseMsg(val) {
        if(typeof val === 'string') {
            //TODO: sprawdź czy nie ma juz takiej sesji
            // if(val.length < 1) {
            //     this.setState({...this.state, isOpenMsgWindow: true,});
            //     return;
            // }
            const lista = [...Global.listaAktulane, ...Global.listaArchiwalne];
            lista.map( l => console.log(l.val));
            if(lista.filter(s => s.val == val).length > 0) {
                //alert("zgłoś błąd");
                this.setState({...this.state, errmsg: `Sesja <<${val}>>jest już w systemie.`});
                return;
            }
            Global.currentSession = val;
            this.setState({...this.state, title:"", msg: "", input: false, isOpenMsgWindow: false, errmsg:"", });
            // this.props.action(cShape.LOAD_FIREBASE);
            //            this.props.action(cShape.LOAD_FIREBASE);
            this.hideAudioBar();
            this.sessionRef.current.onNewSession(true);
            this.props.action(cShape.START_NEW_SESSION);
            console.log("Session LIVE start");
        }
        else if(val)
            this.props.action(cShape.NEW);
        else {
            Global.sessionOn = false;
            this.props.action(cShape.CLOSE_DLG);
        }
        this.setState({...this.state, title:"", msg: "", input: false, isOpenMsgWindow: false, errmsg:"", });
    }

    //zamykamy aktualną sesję klikiem na czerwony kwadrat
    stopLiveSession() {
        this.props.action(cShape.STOP_NEW_SESSION);
    }
    menuItemSelectedHandler(type) {

        //aktualizuj tylkog gdy nie DELETE aby nie zmieniać typu zaznaczenia (delete nie wpływa na menu)
        if(type !== cShape.DELETE)
            this.setState({
                type: type,
                // hidden: hidden
            });
        
        this.props.action(type);        //callback do komponentu Main
        
        //this.setState(type);
    }
    render() {
        // this.menuItemSelectedHandler(this.props.pickedObject);
        switch(this.state.type) {

        }
        
        return(
            <>
                {this.component}
                <div id="mediabar" className = "w3-row mediabar">
                <NewSession action={Global.adminRights.includes(Global.user.uid)?this.onNewSession.bind(this):this.onLoadFBLive.bind(this)} stop={this.stopLiveSession.bind(this)} ref={this.sessionRef} live={this.state.loadLive}/>
                <LoadArchiveSessions action={this.onLoadFB.bind(this)}/>
                <ChatSession action={this.onOpenChat.bind(this)} 
                    actionSnd={this.props.action} 
                    msgs={this.props.msgs}
                    visible={this.state.chatWindow}  />
                <MessageBox 
                    isVisible={this.state.isOpenMsgWindow || this.props.ok} 
                    title={this.props.title || this.state.title } 
                    msg={this.props.msg?this.props.msg: this.state.msg} 
                    input={!this.props.ok && this.state.isInputField} 
                    ok={this.props.ok?this.props.ok:false}
                    errmsg={this.state.errmsg}
                    action={this.responseMsg.bind(this)}/>

                <SessionDialog isVisible={this.state.isOpenSessionWindow} title={this.state.title} action={this.loadSession.bind(this)} live={this.state.loadLive} />
                </div>
            </>
            );
    }
}

class NewSession extends Component {

    constructor(props) {
        super();
        this.state = {
            clicked: Global.sessionOn,
        }
        this.updateAudio = React.createRef();
    }

    onNewSession(sessinoState) {
        //TODO: gdy klikamy na anuluj sesję to nadal pojawia się czerwony kwadrat - tutaj tkwi problem
        Global.sessionOn = sessinoState;//!Global.sessionOn;
        this.setState({...this.state, clicked: Global.sessionOn});
        if(Global.sessionOn)
            this.updateAudio.current.run();
        else {
            this.updateAudio.current.stop(Global.currentSession);
            this.props.stop();     //kończymy sesję
            console.log("Session LIVE stop");
        }
    }
    onPlay() {
        this.updateAudio.current.play();
    }
    hideAudioBar() {
        document.getElementById('audio1').setAttribute("hidden",true);      //usuwaj pasek jeśli jest
    }

    onNew() {
        this.props.action(!Global.sessionOn);
        
    }
    render() {
        // if(!Global.user || Global.user?.uid !== 'VRGQyqLSB0axkDKbmgye3wyDGJo1'   ) {
        //     return (<></>);
        // }
        return (
            <>
                <button className="toolbutton "  id="new" onClick = {this.onNew.bind(this) }>
                    <img className="toolimg" src={Global.sessionOn?newsessionoff:newsession}/>
                    <span className="tooltiptext">Nowa sesja</span>
                </button>
                <AudioBroadcast value={Global.sessionOn} ref={this.updateAudio}/>
            </>
        );
    }
}
class ChatSession extends Component {
    constructor(props) {
        super(props);
    }

    onOpenChat() {
        this.props.action();
    }
    render() {
        // console.log("ChatSession: "+(this.props.msgs.length));
        return (

            <>
            {!this.props.visible === true?<ChatWindow action={this.props.actionSnd}  msgs={this.props.msgs} />:""}
            <button className="toolbutton "  id="chatwnd" onClick = {this.onOpenChat.bind(this) }>
                    <img className="toolimg" src={chat}/>
                    <span className="tooltiptext">Otwórz komunikator</span>
                </button>
            </>
        );
    }
}
class LoadArchiveSessions extends Component {

    constructor(props) {
        super();
    }
    onLoadFB() {
        this.props.action();
    }
    render() {
        if(!Global.user ) {
            return (<></>);
        }
        return (
            <>
                <button className="toolbutton "  id="load_firebase" onClick = {this.onLoadFB.bind(this) }>
                    <img className="toolimg" src={load}/>
                    <span className="tooltiptext">Wczytaj sesje z chmury</span>
                </button>
            </>
        );
    }
}

export default MediaBar;