import "../assets/loginform.css"
import "../assets/w3.css"
import { Component } from "react";
// import {createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from "firebase/auth"
// import {initializeApp} from "firebase/app"
// import {firebaseConfig} from "../firebase-config"
import Global from "../Global";

class MessageBox extends Component {
    constructor(props){
        super(props);
        this.state = {
            title:props.title,
            msg: props.msg,
            isVisible: props.isVisible,
            ok: false,
        };
        this.sessionName = Global.currentSession;
    }
    onYes() {
        if(this.props.ok) {
            this.props.action(false);       //zamyka dialog z poziomu komponentu Main
        }
        else if(this.props.input) {
            this.props.action(this.sessionName);
        }
        else
            this.props.action(true);        //zamyka dialog z poziomu komponentu "Parent" (MediaBar lub DefaultMenu)
    }
    onNo() {
        this.props.action(false);
    }
    onKeyUp = event => {
        //klik na ENTER w okienku edit
        if (event.which === 13) {
            this.onYes();
        }
    }   
    onInputChange(event) {
        this.sessionName = event.target.value;
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
                        <span onClick={this.onNo.bind(this)} className="w3-button w3-display-topright">&times;</span>
                        <h2>{this.props.title}</h2>
                    </div>
                    <p className="message_text">{this.props.msg}</p>
                    <input type="text" className={!this.props.input?'hidden':''} onChange={this.onInputChange.bind(this)} onKeyUp={this.onKeyUp.bind(this)} defaultValue={this.sessionName}/>
                    <br/>

                    <button className="dlgbutton" onClick={this.onYes.bind(this)}>{this.props.input?'Zatwierdź':(this.props.ok?'OK':'Tak')}</button>
                    <button className={(this.props.input || this.props.ok) ?'dlgbutton hidden':'dlgbutton'} onClick={this.onNo.bind(this)} >Nie</button>
                    <p className="error_msg">{this.props.errmsg}</p>
                    <br/>
                </div>
            </div>
            </>            
        );
    }
}

export default MessageBox;