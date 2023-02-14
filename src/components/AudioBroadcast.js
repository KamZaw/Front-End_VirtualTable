import { Component } from "react";
import mic_on from '../assets/navbar/micon.png';
import mic_off from '../assets/navbar/micoff.png';
import "../assets/w3.css"
import Global from "../Global";
import Broadcast from "./Broadcast";


class AudioBroadcast extends Component {

    constructor() {
        super();
        Global.broadcast = Global.broadcast?Global.broadcast: new Broadcast()
        this.state = {
            chkMic: Global.sessionOn,
            broadcast: Global.broadcast,
        }
        
 
    }
    componentDidUpdate

    run() {
        this.state.broadcast.broadcast();
    }
    stop(fileName) {
        this.state.broadcast.onStop(fileName);
    }

    play() {
        this.state.broadcast.onPlay(Global.currentSession);
    }
    onCheckedMic(e) {
        if(this.state.chkMic)
            this.state.broadcast.onPlay(Global.currentSession);
        
        this.setState({...this.state, chkMic: !this.state.chkMic});
        if(!this.state.chkMic) 
        this.state.broadcast.broadcast();
    }
    render() {
        if(!Global.user ) {
            return (<>&nbsp;&nbsp;&nbsp;&nbsp;</>);
        }
        return (
            <>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button className={"toolbutton "+(this.state.chkMic ?"checked ":" ") } 
                    type="" id="mic" name="mic"  onClick = {this.onCheckedMic.bind(this)}>
                    <img className="toolimg" src={this.state.chkMic?mic_on:mic_off}/>
                    <span className="tooltiptext">{(this.state.chkMic ?"Wyłącz mikrofon ":"Włącz mikrofon")}</span>
                </button>
                &nbsp;&nbsp;&nbsp;&nbsp;
            </>
        );
    }
}

export default AudioBroadcast;