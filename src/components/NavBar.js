import { Component } from "react";
import {cShape} from '../shapetype';
// import {BrowserRouter as Router, Link, Route, Routes} from 'react-router-dom';
import { RectangleMenu, NGONMenu,FreePenMenu, EmptyMenu, TEXTMenu } from "./DefaultMenu";
class NavBar extends Component {
    constructor(props){
        super(props);
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
        // this.menuItemSelectedHandler(this.props.pickedObject);
        switch(this.state.type) {
            case cShape.RECT:
                this.component = <RectangleMenu action={this.props.action}/>;
                break;
            case cShape.NGON:
                this.component = <NGONMenu action={this.props.action}/>;
                break;
            case cShape.TEXT:
                this.component = <TEXTMenu action={this.props.action}/>;
                break;
            case cShape.FREEPEN:
                this.component = <FreePenMenu action={this.props.action}/>;
                break;
                case cShape.DELETE:     //nie zmieniaj menu
                break;
            case cShape.NONE:
            case cShape.SELECT:
            default:
                this.component = <EmptyMenu action={this.props.action}/>;
                break;
        }
        
        return(
            <>
                
                <div id="toolbar" className = "toolbar">
                    <MenuOption id="sel" type = {cShape.SELECT} action={this.menuItemSelectedHandler}>sel</MenuOption>
                    {/* <MenuOption id="mov" type = {cShape.MOVE} action={this.menuItemSelectedHandler}>mv</MenuOption> */}
                    <br/>
                    <MenuOption id="text" type = {cShape.TEXT} action={this.menuItemSelectedHandler}>txt</MenuOption>
                    <MenuOption id="freepen" type = {cShape.FREEPEN} action={this.menuItemSelectedHandler}>pen</MenuOption>
                    <br/>
                    <MenuOption id="rect" type = {cShape.RECT} action={this.menuItemSelectedHandler}>sq</MenuOption>
                    <MenuOption id="ngon" type = {cShape.NGON} action={this.menuItemSelectedHandler}>ngon</MenuOption>
                    <br/>
                    
                    <MenuOption id="del" type = {cShape.DELETE} action={this.menuItemSelectedHandler}>del</MenuOption>
                </div>{this.component}
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