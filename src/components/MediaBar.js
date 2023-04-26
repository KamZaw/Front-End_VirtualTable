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

// import {BrowserRouter as Router, Link, Route, Routes} from 'react-router-dom';
import { RectangleMenu, NGONMenu,FreePenMenu, EmptyMenu, TEXTMenu, PolygonMenu, CornerMenu, ChartMenu, StarMenu } from "./DefaultMenu";
class MediaBar extends Component {
    constructor(props){
        super(props);
        this.component = null;
        this.sessionRef = React.createRef();
        this.state = {
            isOpenSessionWindow: false,
            isOpenMsgWindow: false,
            title: "",
            msg: "",
            chatWindow: false
        };
        this.menuItemSelectedHandler = this.menuItemSelectedHandler.bind(this);
    }
    onNewSession(state) {
        this.setState({...this.state, title:"Utwórz sesję", msg: "Podaj nazwę nowej sesji", isOpenMsgWindow: state, isInputField: state});
        !state && this.sessionRef.current.onNewSession();       //kończymy nagranie audio i wysyłamy plik na serwer
    }
    onLoadFB () {
        this.setState({...this.state, title:"Wirtualna Tablica", msg: "Podaj nazwę sesji", isOpenSessionWindow: true, isInputField: true});
    }
    onOpenChat () {
        this.setState({...this.state, chatWindow: !this.state.chatWindow});
    }
    loadSession(val) {
        if(typeof val === 'string') {
            Global.currentSession = val;
            this.setState({...this.state, title:"", msg: "", input: false, isOpenSessionWindow: false,});
            this.props.action(cShape.LOAD_FIREBASE);
            this.sessionRef.current.onPlay();
        }
        
        this.setState({...this.state, title:"", msg: "", input: false, isOpenSessionWindow: false,});
    }
    responseMsg(val) {
        if(typeof val === 'string') {
            //TODO: sprawdź czy nie ma juz takiej sesji
            // if(val.length < 1) {
            //     this.setState({...this.state, isOpenMsgWindow: true,});
            //     return;
            // }
            Global.currentSession = val;
            this.setState({...this.state, title:"", msg: "", input: false, isOpenMsgWindow: false,});
            // this.props.action(cShape.LOAD_FIREBASE);
            //            this.props.action(cShape.LOAD_FIREBASE);

            this.sessionRef.current.onNewSession();
            this.props.action(cShape.START_NEW_SESSION);
        }
        else if(val)
            this.props.action(cShape.NEW);
        this.setState({...this.state, title:"", msg: "", input: false, isOpenMsgWindow: false,});
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
                <NewSession action={this.onNewSession.bind(this)} ref={this.sessionRef}/>
                <LoadArchiveSessions action={this.onLoadFB.bind(this)}/>
                <ChatSession action={this.onOpenChat.bind(this)} 
                    actionSnd={this.props.action} 
                    msgs={this.props.msgs}
                    visible={this.state.chatWindow}  />
                <MessageBox isVisible={this.state.isOpenMsgWindow} 
                    title={this.state.title} 
                    msg={this.state.msg} 
                    input={this.state.isInputField} 
                    action={this.responseMsg.bind(this)}/>

                <SessionDialog isVisible={this.state.isOpenSessionWindow} title={this.state.title} action={this.loadSession.bind(this)} />                
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

    onNewSession() {
        Global.sessionOn = !Global.sessionOn;
        this.setState({...this.state, clicked: Global.sessionOn});
        if(Global.sessionOn)
            this.updateAudio.current.run();
        else {
            this.updateAudio.current.stop(Global.currentSession);
            Global.currentSession = null;
        }
    }
    onPlay() {
        this.updateAudio.current.play();
    }
    onNew() {
        this.props.action(!Global.sessionOn);
    }
    render() {
        if(!Global.user || Global.user?.uid !== 'VRGQyqLSB0axkDKbmgye3wyDGJo1'   ) {
            return (<></>);
        }
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
        console.log("ChatSession: "+(this.props.msgs.length));
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