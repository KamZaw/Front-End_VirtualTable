import { Component } from "react";
import $ from 'jquery'



class DefaultMenu extends Component {
    constructor(){
        super();
    }

    render() {
        return(
            <>
            <div id="menubar" className = "menubar">
                Domyślne menu
            </div>
            </>
            );
    }
}

class RectangleMenu extends Component {
    constructor(){
        super();
    }
    onChange() {
        $("#colorpicker").css("background-color", "#"+$("#rect_color").val());
    }

    render() {
        return(
            <>
            <div id="menubar" className = "menubar">
                <b>Prostokąt </b> 
                szer:
                <input id="rect_width" className="button_menu" placeholder="Szer..." defaultValue="120"/>
                 wys:
                <input id="rect_height" className="button_menu" placeholder="Wys..." defaultValue="80" />

                <div id="colorpicker">&nbsp;</div>
                <input id="rect_color" className="button_menu" placeholder="kolor..." defaultValue="17b854"  onChange = {this.onChange}/>
            </div>
            </>
            );
    }
}

class NGONMenu extends Component {
    constructor(){
        super();
    }
    onChange() {
        $("#colorpicker").css("background-color", "#"+$("#ngon_color").val());
    }
    render() {
        return(
            <>
            <div id="menubar" className = "menubar">
                <b>Wielokąt </b>
                n:<input id="ngons" className="button_menu" placeholder="Liczba boków" defaultValue="6"/>
                r:<input id="radius" className="button_menu" placeholder="Promień..." defaultValue="50"/>
                
                <div id="colorpicker">&nbsp;</div>
                <input id="ngon_color" className="button_menu" placeholder="kolor..." defaultValue="17b854" onChange = {this.onChange}/>
            </div>
            </>
            );
    }
}

class FreePenMenu extends Component {
    constructor(){
        super();
    }
    onChange() {
        $("#colorpicker").css("background-color", "#"+$("#freepen_color").val());
    }
    render() {
        return(
            <>
            <div id="menubar" className = "menubar">
                <b>&nbsp; </b>
                r:<input id="radius" className="button_menu" placeholder="Promień..." defaultValue="4"/>px
                
                <div id="colorpicker">&nbsp;</div>
                <input id="freepen_color" className="button_menu" placeholder="kolor..." defaultValue="17b854" onChange = {this.onChange}/>
            </div>
            </>
            );
    }
}
export {DefaultMenu, RectangleMenu, NGONMenu, FreePenMenu}
