import "../assets/w3.css"
import { Component } from "react";
import Global from "../Global";
import React from 'react';
// import $ from 'jquery'
import { cShape } from "../shapetype";
import LoginForm from "./LoginForm"
import AudioBroadcast from "./AudioBroadcast"
import MessageBox from "./MessageBox"
import SessionDialog from "./SessionDialog"
import undo from '../assets/navbar/undo.png';
import redo from '../assets/navbar/redo.png';
import save from '../assets/navbar/save.png';
import load from '../assets/navbar/load.png';
import zplus from '../assets/navbar/z_plus.png';
import zminus from '../assets/navbar/z_minus.png';
import grid from '../assets/navbar/grid.png';
import snap from '../assets/navbar/snap.png';
import nowy from '../assets/navbar/new.png';
import copy from '../assets/navbar/copy.png';
import freelinefinish from '../assets/navbar/freelinefinish.png';
import freelinecancel from '../assets/navbar/freelinecancel.png';
import newsession from '../assets/navbar/newsession.png';
import newsessionoff from '../assets/navbar/newsessionstop.png';
import mirrorx from '../assets/navbar/mirrorX.png';
import mirrory from '../assets/navbar/mirrorY.png';
import logged from '../assets/navbar/logged.png';
import unlogged from '../assets/navbar/unlogged.png';



class DefaultMenu extends Component {
    constructor(){
        super();
        this.onZChangePlus = this.onZChangePlus.bind(this);
        this.onZChangeMinus = this.onZChangeMinus.bind(this);
        this.onChange = this.onChange.bind(this);
        this.openLogin = this.openLogin.bind(this);
        this.sessionRef = React.createRef();
        this.state = {
            login: false,
            isLoginWindow: false,
            logout: false,
            defaultValue: "#FF0000",
            chkGrid: Global.chkGrid,
            chkSnap: Global.chkSnap,//this.props.status.gridSnap,
            
            isOpenSessionWindow: false,
            isOpenMsgWindow: false,
            isInputField: false,
            title: "",
            msg: "",
        };
    }
 
    onZChangePlus() {
        this.props.action(cShape.ZPLUS);
    }

    onNew() {
        this.setState({...this.state, title:"Uwaga!", msg: "Czy usunąć wszystkie narysowane obiekty?", isOpenMsgWindow: true, isInputField: false});
    }
    onNewSession(state) {
        this.setState({...this.state, title:"Utwórz sesję", msg: "Podaj nazwę nowej sesji", isOpenMsgWindow: state, isInputField: state});
        !state && this.sessionRef.current.onNewSession();       //kończymy nagranie audio i wysyłamy plik na serwer
    }
    onSaveSVG() {
        
        this.props.action(cShape.SAVE_SVG);
    }
    onLoadFB () {
        this.setState({...this.state, title:"Wirtualna Tablica", msg: "Podaj nazwę sesji", isOpenSessionWindow: true, isInputField: true});
    }
    onRedo(){
        this.props.action(cShape.REDO);
    }
    onUndo() {
        this.props.action(cShape.UNDO);
    }
    onZChangeMinus() {
        this.props.action(cShape.ZMINUS);
    }
    //włącza/wyłącza siatkę
    onCheckedGrid() {
        
        this.setState({ ...this.state,
            chkGrid: !this.state.chkGrid,
        });
        this.props.action(cShape.GRIDON_OFF);
    }
    //włącza/wyłącza gridSnap
    onCheckedGridSnap() {
        if(!this.state.chkGrid) return;
        this.setState({ ...this.state,
            chkSnap: !this.state.chkSnap
        });

        this.props.action(cShape.GRID_SNAP_ON_OFF);
    }
    onChange = event => {
        this.setState({...this.state, defaultValue: (event.target.value), isLogin: (Global.user != null) });  
        this.props.action(cShape.COLORCHANGE);
    }
    openLogin() {
        if(Global.user)
            this.setState({ ...this.state, isLoginWindow: false, login: false, logout: true });  
        else
            this.setState({ ...this.state, isLoginWindow: true, login: true, logout: false });  
    }
    componentDidUpdate(){
        
        const el = document.getElementById("color");
        el && (el.value = this.state.defaultValue);

    }
    componentDidMount() {
        this.componentDidUpdate();

    }
    hideLoginWindow(val, val2) {
        this.setState({...this.state, isLoginWindow: val});
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

    render() {
        return(
            <>
            <div className="w3-container w3-quarter">
                <button className="toolbutton "  id="new" onClick = {this.onNew.bind(this) }>
                    <img className="toolimg" src={nowy}/>
                    <span className="tooltiptext">Utwórz nowy dokument</span>
                </button>
                <button className="toolbutton "  id="save" onClick = {this.onSaveSVG.bind(this) }>
                    <img className="toolimg" src={save}/>
                    <span className="tooltiptext">Zapisz widok tablicy do pliku w formacie SVG</span>
                </button>
                
                <NewSession action={this.onNewSession.bind(this)} ref={this.sessionRef}/>
                <LoadArchiveSessions action={this.onLoadFB.bind(this)}/>
                
                
                <button className="toolbutton "  id="history_undo" onClick = {this.onUndo.bind(this) }>
                    <img className="toolimg" src={undo}/>
                    <span className="tooltiptext">Cofnij operację</span>
                </button>
                <button className="toolbutton "  id="history_redo" onClick = {this.onRedo.bind(this) }>
                    <img className="toolimg" src={redo}/>
                    <span className="tooltiptext">Przywróć operację</span>
                </button>
                <button className={"toolbutton "+(this.state.chkGrid ?"checked ":" ") } 
                    type="" id="grid" name="grid"  onClick = {this.onCheckedGrid.bind(this)}>
                    <img className="toolimg" src={grid}/>
                    <span className="tooltiptext">Rysuj siatkę</span>
                </button>
                <button className={"toolbutton "+(this.state.chkSnap && this.state.chkGrid ?"checked ":" ")} 
                    type="" id="gridsnap" name="gridsnap" onClick = {this.onCheckedGridSnap.bind(this)}>
                    <img className="toolimg" src={snap}/>
                    <span className="tooltiptext">Narzędzie "snap"</span>
                </button>
            </div>
            <div className="w3-container w3-quarter">
                <span id="color1" className="">
                    <input id="color" className="" type="color"
                        defaultValue={this.state.defaultValue} 
                        onChange = {this.onChange} />
                </span>  
                <button className="toolbutton" id="z_plus" onClick={this.onZChangePlus}>
                    <img className="toolimg" src={zplus}/>
                    <span className="tooltiptext">Zwiększ wartość indeksu Z dla zaznaczonego obiektu</span>
                </button>
                <button className="toolbutton" id="z_minus" onClick={this.onZChangeMinus}>
                    <img className="toolimg" src={zminus}/>
                    <span className="tooltiptext">Zmniejsz wartość indeksu Z dla zaznaczonego obiektu</span>
                </button>
                {/* <label>rotacja</label>
                <input id="shape_angle" className="button_menu" placeholder="Kąt..." defaultValue="0"/> */}
            </div>
            <div className="" >
                <button type="button" className="right" id="open_loginform" onClick = {this.openLogin } defaultValue={Global.user?"LogOut":"Login"}>
                    {Global.user?"Wyloguj się ":"Zaloguj się "}
                    <img className="toolimg" src={Global.user?logged:unlogged}/>
                </button>
                
                <LoginForm isVisible={this.state.isLoginWindow} login={this.state.login} logout={this.state.logout} action={this.hideLoginWindow.bind(this)}/>
                <MessageBox isVisible={this.state.isOpenMsgWindow} title={this.state.title} msg={this.state.msg} input={this.state.isInputField} action={this.responseMsg.bind(this)}/>
                <SessionDialog isVisible={this.state.isOpenSessionWindow} title={this.state.title} action={this.loadSession.bind(this)} />
            </div>
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
        if(!Global.user ) {
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

class EmptyMenu extends DefaultMenu {
    constructor(){
        super();
        this.state = { ...this.state,
            defaultValue: Global.selectedShape?"#"+Global.selectedShape.iColor.toString(16):"#17B854",
        };
        this.copyFig = this.copyFig.bind(this);
        this.onScaleXChange = this.onScaleXChange.bind(this);
        this.onScaleYChange = this.onScaleYChange.bind(this);
        this.onRotateZChange = this.onRotateZChange.bind(this);
    }
    componentDidMount() {
        this.componentDidUpdate();
    }
    copyFig() {
        this.props.action(cShape.COPY);
    }

   onScaleXChange() {
        this.props.action(cShape.SCALEX);
    }
    onRotateZChange() {
        this.props.action(cShape.ROTATEZ);
    }
    onScaleYChange() {
        this.props.action(cShape.SCALEY);
    }    
    render() {
        return (
            <div className="w3-row">
            {super.render()} 
        <div className="w3-container w3-quarter">
            <div id="menubar" >
                <button className="toolbutton" id="carbon_copy" onClick = {this.copyFig}>
                    <img className="toolimg" src={copy}/>
                    <span className="tooltiptext">Kopiuj obiekt</span>
                </button>
                <b>Obróć:</b>
                <input id="rotateZ" className="button_menu" placeholder="x..." defaultValue={1}  onChange = {this.onRotateZChange}/>

                <b>Skaluj:</b>
                <input id="scaleX" className="button_menu" placeholder="x..." defaultValue={1}  onChange = {this.onScaleXChange}/>
                <input id="scaleY" className="button_menu" placeholder="y..." defaultValue={1}  onChange = {this.onScaleYChange}/>
            </div>
        </div>
        </div>
    );
    }
}


class RectangleMenu extends DefaultMenu {
    constructor(){
        super();
        this.state.defaultValue = "#17B854";
    }
    render() {
        return(
            <div className="w3-row">
            {super.render()}
            <div className="w3-container w3-quarter">
            <div id="menubar" className = "">
                <b>Prostokąt </b> 
                szer:
                <input id="rect_width" className="button_menu" placeholder="Szer..." defaultValue="320"/>
                 wys:
                <input id="rect_height" className="button_menu" placeholder="Wys..." defaultValue="150" />
            </div>
            </div>
            </div>
            );
    }
}

class ChartMenu extends DefaultMenu {
    constructor(){
        super();
        this.state.defaultValue = "#17B854";
    }
    render() {
        return(
            <div className="w3-row">
            {super.render()}
            <div className="w3-container w3-quarter">
            <div id="menubar" className = "">
                <b>Dane wykresu </b> 
                json:
                <input id="json_chart" className="button_menu" placeholder="dane JSON..." defaultValue='{
                    "title": "PLN/EUR",
                    "data": [{
                        "value": 4.8132,
                        "label": "2023.02.16_12:30:00",
                        "color": "0xAA0000"
                        },
                        {
                        "value": 4.8000,
                        "label": "2023.02.16_12:35:00",
                        "color": "0x000A22"
                        },
                        {
                        "value": 4.8050,
                        "label": "2023.02.16_12:35:00",
                        "color": "0x557A22"
                        },
                        {
                            "value": 4.8247,
                            "label": "2023.02.16_12:35:00",
                            "color": "0x0000AA"
                        },
                        {
                            "value": 4.8207,
                            "label": "2023.02.16_12:35:00",
                            "color": "0xAA00AA"
                        }
                    ]
                    }'/>
            </div>
            </div>
            </div>
            );
    }
}

class NGONMenu extends DefaultMenu {
    constructor(){
        super();
        this.state.defaultValue= "#1778F4";
    }
    render() {
        
        return(
            <div className="w3-row">
                {super.render()}
                <div className="w3-container w3-quarter">
                    <div id="menubar" className = "">
                        <b>Wielokąt </b>
                        n:<input id="ngons" className="button_menu" placeholder="Liczba boków" defaultValue="6"/>
                        r:<input id="radius" className="button_menu" placeholder="Promień..." defaultValue="150"/>
                        
                    </div>
                </div>
            </div>
            );
    }
}

class TEXTMenu extends DefaultMenu {
    constructor(){
        super();
        this.state.defaultValue= "#e9e9e9";
    }
    onMirrorX() {
        this.props.action(cShape.MIRRORX);
    }
    onMirrorY(){
        this.props.action(cShape.MIRRORY);
    }

    render() {
        return(
            <div className="w3-row">
                {super.render()}
                <div className="w3-container w3-third">
                    <div id="menubar" className = "">
                        <b>Tekst </b>
                        tekst:<input id="txt" className="button_menu" placeholder="tekst..." defaultValue="Wirtualna Tablica"/>
                        rozmiar:<input id="txt_size" className="button_menu" placeholder="rozmiar czcionki" defaultValue="50"/>
                        {/* wysokość:<input id="txt_height" className="button_menu" placeholder="wysokość czcionki" defaultValue="10"/> */}
                        <button className="toolbutton" id="mirrorX" onClick = {this.onMirrorX.bind(this)}>
                            <img className="toolimg" src={mirrorx}/>
                            <span className="tooltiptext">Odbicie wertykalne</span>
                        </button>
                        <button className="toolbutton" id="mirrorY" onClick = {this.onMirrorY.bind(this)}>
                            <img className="toolimg" src={mirrory}/>
                            <span className="tooltiptext">Odbicie horyzontalne</span>
                        </button>
                    </div>
                </div>

            </div>
            );
    }
}

class PolygonMenu extends DefaultMenu {
    constructor(){
        super();
        this.state.defaultValue= "#F7B854";
        this.onFinalizeFig = this.onFinalizeFig.bind(this);
    }
    onFinalizeFig(event) {
        this.props.action(cShape.POLY_CLOSE);
    }
    render() {
        return(
            <div className="w3-row">
                {super.render()} 
                <div className="w3-container w3-quarter">
                    <div id="menubar" className = "">
                        <b>Polygon </b> 
                        {/* <b>&nbsp; </b> */}
                        Szerokość lini:<input id="size" className="button_menu" placeholder="szer..." defaultValue="2"/>px
                        {/* <button className="toolbutton" id="polyClose" onClick = {this.onFinalizeFig} value={true}>V</button> */}
                    </div>
                </div>
            </div>
            );
    }
}

class CornerMenu extends DefaultMenu {
    constructor(){
        super();
        this.state.defaultValue= "#F7B854";
    }
    onBezier(event) {
        this.props.action(cShape.BEZIER);
    }
    onCorner(event) {
        this.props.action(cShape.TO_CORNER);
    }
    render() {
        return(
            <div className="w3-row">
                {super.render()} 
                <div className="w3-container w3-quarter">
                    <div id="menubar" className = "">
                        <b>Wierzchołek: </b> 
                        {/* <b>&nbsp; </b> */}
                        <button className="toolbutton" id="bezier" onClick = {this.onBezier.bind(this)} value={true}>Bezier</button>
                        <button className="toolbutton" id="corner" onClick = {this.onCorner.bind(this)} value={true}>Corner</button>
                    </div>
                </div>
            </div>                
            );
    }
}

class FreePenMenu extends DefaultMenu {
    constructor(){
        super();
        this.state.defaultValue= "#000000";
        this.onFinalizeFig = this.onFinalizeFig.bind(this);
    }
    onFinalizeFig() {
        this.props.action(cShape.FREEPEN_CLOSE);
    }
    onCancelFig() {
            this.props.action(cShape.FREEPEN_CANCEL);
    }
    render() {
        return(
            <div className="w3-row">
                {super.render()} 
                <div className="w3-container w3-quarter">
                    <div id="menubar" className = "">
                        <b>Free Pen </b> 
                        {/* <b>&nbsp; </b> */}
                        Szerokość:<input id="size" className="button_menu" placeholder="szer..." defaultValue="2"/>px
                        <button className="toolbutton" id="addFig" onClick = {this.onFinalizeFig}>
                            <img className="toolimg" src={freelinefinish}/>
                            <span className="tooltiptext">Zakończ rysować figurę</span>    
                        </button>
                        <button className="toolbutton" id="rmFig" onClick = {this.onCancelFig.bind(this)}>
                            <img className="toolimg" src={freelinecancel}/>
                            <span className="tooltiptext">Anuluj rysowanie figury"</span>    
                        </button>

                    </div>
                </div>
            </div>
            );
    }
}
export {EmptyMenu, RectangleMenu, NGONMenu, FreePenMenu, TEXTMenu, PolygonMenu, CornerMenu, ChartMenu}
