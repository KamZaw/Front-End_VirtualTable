import "../assets/w3.css"
import { Component } from "react";
import {update, ref, } from "firebase/database"
import Global from "../Global"
import { Shape } from "../threejs/Shape";


class Student extends Component {
    constructor(props) {
        super(props);
        
        this.state = {

        }

        
    }
    componentDidMount() {

        // this.handle = setInterval(() => {
        //     Global.user && Global.fb && update(ref(Global.fb, `Students/${Global.user.uid}/`), 
        //     {
        //         refreshed: Shape.dateToTicks(new Date()),
        //     });
        // }, 2000);
    }
    componentWillUnmount() {
        // clearInterval(this.handle);
    }
    
    render() {

        return (
            <>
                <h1  className={"w3-badge student_badge disable_select w3-red" }>{this.props.value}</h1>
            </>
        );
    }
}

export default Student
