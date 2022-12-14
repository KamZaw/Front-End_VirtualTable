import { event } from "jquery";
import { Component } from "react";
import Global from "../Global";
// import $ from 'jquery'
import { cShape } from "../shapetype";
import LoginForm from "./LoginForm"
import MessageBox from "./MessageBox"




class DefaultMenu extends Component {
    constructor(){
        super();
        this.onZChangePlus = this.onZChangePlus.bind(this);
        this.onZChangeMinus = this.onZChangeMinus.bind(this);
        this.onChange = this.onChange.bind(this);
        this.openLogin = this.openLogin.bind(this);
        this.state = {
            login: false,
            isLoginWindow: false,
            logout: false,
            defaultValue: "FF0000",
            
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
    onSaveSVG() {
        
        this.props.action(cShape.SAVE_SVG);
    }
    onLoadFB () {
        this.setState({...this.state, title:"Wirtualna Tablica", msg: "Podaj nazwę sesji", isOpenMsgWindow: true, isInputField: true});
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
    onChange = event => {
        this.setState({ defaultValue: (event.target.value), isLogin: (Global.user != null) });  
        document.getElementById("colorpicker").style.background = "#"+this.state.defaultValue;
        this.props.action(cShape.COLORCHANGE);
    }
    openLogin() {
        if(Global.user)
            this.setState({ ...this.state, isLoginWindow: false, login: false, logout: true });  
        else
            this.setState({ ...this.state, isLoginWindow: true, login: true, logout: false });  
    }
    componentDidUpdate(){
        
        const el = document.getElementById("colorpicker");
        el && (el.style.background = "#"+this.state.defaultValue);

    }
    componentDidMount() {
        this.componentDidUpdate();

    }
    hideLoginWindow(val) {
        this.setState({...this.state, isLoginWindow: val});
    }
    responseMsgWindow(val) {
        if(typeof val === 'string') {
            // if(val.length < 1) {
            //     this.setState({...this.state, isOpenMsgWindow: true,});
            //     return;
            // }
            Global.currentSession = val;
            this.setState({...this.state, title:"", msg: "", input: false, isOpenMsgWindow: false,});
            this.props.action(cShape.LOAD_FIREBASE);
        }
        else if(val)
            this.props.action(cShape.NEW);
        this.setState({...this.state, title:"", msg: "", input: false, isOpenMsgWindow: false,});
    }

    render() {
        return(
            <>
                <span className="left">
                    <button  id="new" onClick = {this.onNew.bind(this) }>Nowe</button>
                    <button  id="load_firebase" onClick = {this.onLoadFB.bind(this) }>Wczytaj sesję</button>
                    <button  id="save" onClick = {this.onSaveSVG.bind(this) }>Zapisz</button>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <button  id="history_undo" onClick = {this.onUndo.bind(this) }>&lt; Cofnij</button>
                    <button  id="history_redo" onClick = {this.onRedo.bind(this) }>Powrót &gt;</button>
                </span>
                
                <div id="colorpicker" onClick = {this.onChange}>&nbsp;</div>
                <input id="color" className="button_menu" placeholder="kolor..." defaultValue={this.state.defaultValue}  onChange = {this.onChange}/>
                &nbsp;&nbsp;
                <button id="z_plus" onClick = {this.onZChangePlus}>Z+</button>
                <button id="z_minus" onClick = {this.onZChangeMinus}>Z-</button>


                
                {/* <label>rotacja</label>
                <input id="shape_angle" className="button_menu" placeholder="Kąt..." defaultValue="0"/> */}

                <input type="button" className="right" id="open_loginform" onClick = {this.openLogin } defaultValue={!Global.user?"Login":"LogOut"}></input>
                
                <LoginForm isVisible={this.state.isLoginWindow} login={this.state.login} logout={this.state.logout} action={this.hideLoginWindow.bind(this)}/>
                <MessageBox isVisible={this.state.isOpenMsgWindow} title={this.state.title} msg={this.state.msg} input={this.state.isInputField} action={this.responseMsgWindow.bind(this)}/>
            </>
            
            );
    }
}

class EmptyMenu extends DefaultMenu {
    constructor(){
        super();
        this.state = { ...this.state,
            defaultValue: Global.selectedShape?""+Global.selectedShape.iColor.toString(16):"17B854",
        };
        this.copyFig = this.copyFig.bind(this);
        this.cloneFig = this.cloneFig.bind(this);        
        this.onScaleXChange = this.onScaleXChange.bind(this);
        this.onScaleYChange = this.onScaleYChange.bind(this);
    }
    componentDidMount() {
        this.componentDidUpdate();
    }
    copyFig() {
        this.props.action(cShape.COPY);
    }
    cloneFig() {
        this.props.action(cShape.CLONE);
    }
   onScaleXChange() {
        this.props.action(cShape.SCALEX);
    }
    onScaleYChange() {
        this.props.action(cShape.SCALEY);
    }    
    render() {
        return (<>
        <div id="menubar" className = "menubar">
            {super.render()} 
            <button id="clone" onClick = {this.cloneFig}>Klon</button>
            <button id="carbon_copy" onClick = {this.copyFig}>Kopia</button>
            <b>Skaluj:</b>
            <input id="scaleX" className="button_menu" placeholder="x..." defaultValue={1}  onChange = {this.onScaleXChange}/>
            <input id="scaleY" className="button_menu" placeholder="y..." defaultValue={1}  onChange = {this.onScaleYChange}/>

        </div>
        </>
    );
    }
}


class RectangleMenu extends DefaultMenu {
    constructor(){
        super();
        this.state.defaultValue= "17B854";
    }
    render() {
        return(
            <>
            <div id="menubar" className = "menubar">
                <b>Prostokąt </b> 
                szer:
                <input id="rect_width" className="button_menu" placeholder="Szer..." defaultValue="320"/>
                 wys:
                <input id="rect_height" className="button_menu" placeholder="Wys..." defaultValue="150" />
                {super.render()}
            </div>
            </>
            );
    }
}

class NGONMenu extends DefaultMenu {
    constructor(){
        super();
        this.state.defaultValue= "1778F4";
    }
    render() {
        
        return(
            <>
            <div id="menubar" className = "menubar">
                <b>Wielokąt </b>
                n:<input id="ngons" className="button_menu" placeholder="Liczba boków" defaultValue="6"/>
                r:<input id="radius" className="button_menu" placeholder="Promień..." defaultValue="150"/>
                {super.render()}
                
            </div>
            </>
            );
    }
}

class TEXTMenu extends DefaultMenu {
    constructor(){
        super();
        this.state.defaultValue= "e9e9e9";
    }
    onMirrorX() {
        this.props.action(cShape.MIRRORX);
    }
    onMirrorY(){
        this.props.action(cShape.MIRRORY);
    }

    render() {
        return(
            <>
            <div id="menubar" className = "menubar">
                <b>Tekst </b>
                tekst:<input id="txt" className="button_menu" placeholder="tekst..." defaultValue="Wirtualna Tablica"/>
                rozmiar:<input id="txt_size" className="button_menu" placeholder="rozmiar czcionki" defaultValue="50"/>
                {/* wysokość:<input id="txt_height" className="button_menu" placeholder="wysokość czcionki" defaultValue="10"/> */}
                {super.render()}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button id="mirrorX" onClick = {this.onMirrorX.bind(this)}>mirror X</button>
                <button id="mirrorY" onClick = {this.onMirrorY.bind(this)}>mirror Y</button>
            </div>
            </>
            );
    }
}
class FreePenMenu extends DefaultMenu {
    constructor(){
        super();
        this.state.defaultValue= "000000";
        this.onFinalizeFig = this.onFinalizeFig.bind(this);
    }
    onFinalizeFig(event) {
        if(event.target.value == 'true')
            this.props.action(cShape.FREEPEN_CLOSE);
        else
            this.props.action(cShape.FREEPEN_CANCEL);
    }
    render() {
        return(
            <>
            <div id="menubar" className = "menubar">
                <b>Free Pen </b> 
                {/* <b>&nbsp; </b> */}
                r:<input id="radius" className="button_menu" placeholder="Promień..." defaultValue="2"/>px
                {super.render()} 
                <button id="addFig" onClick = {this.onFinalizeFig} value={true}>V</button>
                <button id="rmFig" onClick = {this.onFinalizeFig} value={false}>X</button>
 
            </div>
            </>
            );
    }
}
export {EmptyMenu, RectangleMenu, NGONMenu, FreePenMenu, TEXTMenu}
