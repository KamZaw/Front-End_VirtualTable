import "../assets/loginform.css"
import { Component } from "react";
import {createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from "firebase/auth"
import {initializeApp} from "firebase/app"
import {firebaseConfig} from "../firebase-config"
import Global from "../Global";

class MessageBox extends Component {
    constructor(props){
        super(props);
        this.state = {
            title:props.title,
            msg: props.msg,
            isVisible: props.isVisible,
        };
    }
    onYes() {
        this.props.action(true, false);
    }
    onNo() {
        this.props.action(false, false);
    }
    render() {
        if(!this.props.isVisible) {
            return (<></>);
        }
        return (
            <>
            <div className={"container modal"}>
                <div className="login-box animated fadeInUp">
                    <div className="box-header">
                        {/* <span className="close" onClick={this.onNo.bind(this)}>&times;</span> */}
                        <h2>{this.props.title}</h2>
                    </div>
                    <p className="message_text">{this.props.msg}</p>
                    <br/>
                    <button className="dlgbutton" onClick={this.onYes.bind(this)}>Tak</button>
                    <button className="dlgbutton" onClick={this.onNo.bind(this)}>Nie</button>
                    <br/>
                </div>
            </div>

            </>            
        );
    }
}

export default MessageBox;