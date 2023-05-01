import "../assets/chat.css"
import {Component } from "react"
import send from '../assets/navbar/sendmsg.png';
import Global from "../Global.js";
import { cShape } from "../shapetype";

class ChatWindow extends Component {

    constructor(props) {
        super(props);
        this.state = {
            // msgs: [["student01", "Wiadomość pierwsza."],["student02", "Wiadomość pierwsza. Nieco dłuższa wiadomość, która nie mieści się w linijce."],["student01", "Wiadomość druga."]],
            // msgs: this.props.msgs,
            tweet:""
        };
    }
    
    onKeyUp = event => {
        //klik na ENTER w okienku tweetów
        if (event.which === 13) {
            this.send();
        }
    }    

    onChange = event => {
        this.setState({...this.state, tweet: (event.target.value) });  
    }
    send() {
        const  tweet = [`${Global.students[Global.user.uid].imie} ${Global.students[Global.user.uid].nazwisko}`, this.state.tweet];
        
        // this.state.msgs.push(tweet);
        // this.setState({...this.state, msgs:  this.state.msgs});  
        console.log("dodało " + Global.user.uid);
        document.getElementById("message_input").value="";
        this.props.action(cShape.CHATMSG, `${tweet[0]}${Global.separator}${tweet[1]}${Global.separator}${Global.user.uid}`);
    }
    render() {
        return (
            <>
            <div className={"chatwindow " + (!this.props.visible?"showchat":"hidechat")}>
            <div className="chatarea">
                {/* <div className="tweet">start </div> */}
                {this.props.msgs.map( (msg, i) => <div key={i}> <div  className={`tweet ${msg[3]}`} ><span> <font color={msg[3]}>{msg[0]}</font></span> </div> <div className="tweet">{msg[1]}</div></div>).reverse()}
                {/* <div className="tweet">dno </div> */}
            </div>
            <input id="message_input" className="button_menu" type="text" placeholder="Wpisz wiadomość..."  onChange = {this.onChange} onKeyUp={this.onKeyUp.bind(this)}></input>
            <button className="toolbutton" id="send_tweet" onClick={this.send.bind(this)} ><img className="toolimg" src={send}/><span className="tooltiptext">Wyślij</span></button>
            </div>
            </>
        );
    }
}

export default ChatWindow;