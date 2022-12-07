import { Component } from "react";
import Global from "../Global";
// import $ from 'jquery'
import { cShape } from "../shapetype";
import LoginForm from "./LoginForm"




class DefaultMenu extends Component {
    constructor(){
        super();
        this.onZChangePlus = this.onZChangePlus.bind(this);
        this.onZChangeMinus = this.onZChangeMinus.bind(this);
        this.onChange = this.onChange.bind(this);
        this.openLogin = this.openLogin.bind(this);

        this.state = {
            isLoginVisible: false,
            defaultValue: "FF0000",
        };
    }
 
    onZChangePlus() {
        this.props.action(cShape.ZPLUS);
    }
    onNew() {
        this.props.action(cShape.NEW);
    }
    onSaveSVG() {
        this.props.action(cShape.SAVE_SVG);
    }
    onZChangeMinus() {
        this.props.action(cShape.ZMINUS);
    }
    onChange = event => {
        this.setState({ defaultValue: (event.target.value), isLoginVisible: false });  
        document.getElementById("colorpicker").style.background = "#"+this.state.defaultValue;
        this.props.action(cShape.COLORCHANGE);
    }
    openLogin() {
        this.setState({ defaultValue: this.state.defaultValue, isLoginVisible: true });  
    }
    componentDidUpdate(){
        
        const el = document.getElementById("colorpicker");
        el && (el.style.background = "#"+this.state.defaultValue);

    }
    componentDidMount() {
        this.componentDidUpdate();
    }
    render() {
        return(
            <>
                <span className="left">
                    <button  id="new" onClick = {this.onNew.bind(this) }>Nowe</button>
                    <button  id="save" onClick = {this.onSaveSVG.bind(this) }>Zapisz</button>
                </span>
                
                <div id="colorpicker" onClick = {this.onChange}>&nbsp;</div>
                <input id="color" className="button_menu" placeholder="kolor..." defaultValue={this.state.defaultValue}  onChange = {this.onChange}/>
                <button id="z_plus" onClick = {this.onZChangePlus}>Z+</button>
                <button id="z_minus" onClick = {this.onZChangeMinus}>Z-</button>
                
                {/* <label>rotacja</label>
                <input id="shape_angle" className="button_menu" placeholder="Kąt..." defaultValue="0"/> */}

                <button className="right" id="open_loginform" onClick = {this.openLogin }>Login</button>
                
                <LoginForm isVisible={this.state.isLoginVisible}/>
            </>
            
            );
    }
}

class EmptyMenu extends DefaultMenu {
    constructor(){
        super();
        this.state = {
            defaultValue: Global.selectedShape?""+Global.selectedShape.toString(16):"17B854",
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
        this.state = {
            defaultValue: "17B854",
        };
    }
    render() {
        return(
            <>
            <div id="menubar" className = "menubar">
                <b>Prostokąt </b> 
                szer:
                <input id="rect_width" className="button_menu" placeholder="Szer..." defaultValue="320"/>
                 wys:
                <input id="rect_height" className="button_menu" placeholder="Wys..." defaultValue="180" />
                {super.render()}
            </div>
            </>
            );
    }
}

class NGONMenu extends DefaultMenu {
    constructor(){
        super();
        this.state = {
            defaultValue: "1778F4",
        };
        
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

class FreePenMenu extends DefaultMenu {
    constructor(){
        super();
        this.state = {
            defaultValue: "000000",
        };
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
export {EmptyMenu, RectangleMenu, NGONMenu, FreePenMenu}
