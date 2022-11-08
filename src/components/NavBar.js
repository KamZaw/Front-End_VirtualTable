import { Component } from "react";
import cShape from '../shapetype';
// import {BrowserRouter as Router, Link, Route, Routes} from 'react-router-dom';
import { RectangleMenu, NGONMenu, DefaultMenu } from "./DefaultMenu";
class NavBar extends Component {
    constructor(){
        super();
        this.component = null;
        this.state = {
            type: cShape.NONE,
        };
        this.menuItemSelectedHandler = this.menuItemSelectedHandler.bind(this);
    }

    menuItemSelectedHandler(type) {
        this.setState({
            type: type,
            // hidden: hidden
        });
        this.props.action(type);        //callback do komponentu Main
        //this.setState(type);
    }
    render() {
        
        switch(this.state.type) {
            case cShape.RECT:
                this.component = <RectangleMenu />;
                break;
            case cShape.NGON:
                this.component = <NGONMenu />;
                break;
            case cShape.DELETE:     //nie zmieniaj menu
                break;
            case cShape.NONE:
            default:
                this.component = <DefaultMenu/>;
                break;
        }
        
        return(
            <>
                {this.component}
                <div id="toolbar" className = "toolbar">
                    <MenuOption id="rect" type = {cShape.RECT} action={this.menuItemSelectedHandler}>sq</MenuOption>
                    <MenuOption id="ngon" type = {cShape.NGON} action={this.menuItemSelectedHandler}>ngon</MenuOption>
                    <br/>
                    <MenuOption id="del" type = {cShape.DELETE} action={this.menuItemSelectedHandler}>del</MenuOption>
                </div>
            </>
            );
    }
}

class MenuOption extends Component {
    // constructor() {
    //     super();
    // }
    click = (type) => {
        //alert(type);
        //this.state.type = !this.state.type;
        this.props.action(type);
    }
    render () {
        return (
            <>
                <button id={this.props.id} onClick={() => this.click(this.props.type)} className="toolbutton">{this.props.children}</button> 
            </>
            ) 
        }
}
export default NavBar;