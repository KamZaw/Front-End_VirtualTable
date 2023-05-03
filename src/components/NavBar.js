import { Component } from "react";
import {cShape} from '../shapetype';
import select from '../assets/navbar/select.png';
import freepen from '../assets/navbar/freepen.png';
import sq from '../assets/navbar/sq.png';
import ngon from '../assets/navbar/ngon.png';
import polygon from '../assets/navbar/polygon.png';
import text from '../assets/navbar/text.png';
import del from '../assets/navbar/del.png';
import chart from '../assets/navbar/chart.png';
import star from '../assets/navbar/star.png';

// import {BrowserRouter as Router, Link, Route, Routes} from 'react-router-dom';
import { RectangleMenu, NGONMenu,FreePenMenu, EmptyMenu, TEXTMenu, PolygonMenu, ChartMenu, StarMenu } from "./DefaultMenu";
class NavBar extends Component {
    constructor(props){
        super(props);
        this.component = null;
        this.state = {
            type: cShape.SELECT,
        };
        this.menuItemSelectedHandler = this.menuItemSelectedHandler.bind(this);
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
            case cShape.POLYGON:
                this.component = <PolygonMenu action={this.props.action}/>;
                break;
            case cShape.CHART:
                this.component = <ChartMenu action={this.props.action}/>;
                break;
            case cShape.STAR:
                this.component = <StarMenu action={this.props.action}/>;
                break;
            case cShape.DELETE:     //nie zmieniaj menu
                break;
            case cShape.NONE:
                break;
            case cShape.SELECT:
            default:
                this.component = <EmptyMenu action={this.props.action}/>;
                break;
        }
        
        return(
            <>
                {this.component}
                <div id="toolbar" className = "w3-row toolbar">
                    <MenuOption id="sel" type = {cShape.SELECT} select={this.state.type} src={select} action={this.menuItemSelectedHandler}>select</MenuOption>
                    {/* <MenuOption id="mov" type = {cShape.MOVE} action={this.menuItemSelectedHandler}>mv</MenuOption> */}
                    <br/>
                    <br/>
                    <MenuOption id="text" type = {cShape.TEXT} select={this.state.type} src={text} action={this.menuItemSelectedHandler}></MenuOption>
                    <br/>
                    <MenuOption id="freepen" type = {cShape.FREEPEN} select={this.state.type} src={freepen} action={this.menuItemSelectedHandler}>freepen</MenuOption>
                    <br/>
                    <MenuOption id="rect" type = {cShape.RECT} select={this.state.type} src={sq} action={this.menuItemSelectedHandler}>sq</MenuOption>
                    <br/>
                    <MenuOption id="ngon" type = {cShape.NGON} select={this.state.type} src={ngon} action={this.menuItemSelectedHandler}>ngon</MenuOption>
                    <br/>
                    <MenuOption id="star" type = {cShape.STAR} select={this.state.type} src={star} action={this.menuItemSelectedHandler}>star</MenuOption>
                    <br/>
                    <MenuOption id="polygon" type = {cShape.POLYGON} select={this.state.type} src={polygon} action={this.menuItemSelectedHandler}>polygon</MenuOption>
                    <br/>
                    <MenuOption id="chart" type = {cShape.CHART} select={this.state.type} src={chart} action={this.menuItemSelectedHandler}>chart</MenuOption>
                    <br/>
                    <br/>
                    {/* nigdy nie podświetlaj przycisku DELETe - zawsze jednorazowe działanie*/}
                    <MenuOption id="del" type = {cShape.DELETE} select={cShape.NONE} src={del} action={this.menuItemSelectedHandler}>del</MenuOption>   
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
                <button id={this.props.id} onClick={() => this.click(this.props.type)} 
                className={"toolbutton " + (this.props.type === this.props.select ?"checked ":" ")}>
                    <img alt="" className="toolimg" src={this.props.src}/></button> 
            </>
            ) 
        }
}
export default NavBar;