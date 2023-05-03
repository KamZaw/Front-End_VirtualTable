import "../assets/sessionbar.css"
import { Component } from "react";
import Student from "./Student"
import {ref, child, onValue, off} from "firebase/database"
import Global from "../Global"

class Sessionbar extends Component {
    constructor(props) {
        super(props);
        const students = [];
        this.state = {
            students: students,
        }
    }

    componentDidMount() {
   
        if(!Global.user) return;
        const colorMap = new Map();
        colorMap.set("w3-teal", "#009688");
        colorMap.set("w3-khaki", "#f0e68c");
        colorMap.set("w3-cyan", "#00bcd4");
        colorMap.set("w3-red", "#f44336");
        colorMap.set("w3-brown", "#795548");
        colorMap.set("w3-amber", "#ffc107");
        colorMap.set("w3-blue", "#2196F3");
        colorMap.set("w3-green", "#4CAF50");
        colorMap.set("w3-deep-orange", "#ff5722");
        colorMap.set("w3-deep-purple", "#673ab7");
        colorMap.set("w3-indigo", "#3f51b5");
        colorMap.set("w3-orange", "#ff9800");
        colorMap.set("w3-yellow", "#ffeb3b");
   
        const dbRef = ref(Global.fb);
        this.nodeRef = child(dbRef, `Students/`);
        onValue(this.nodeRef, (snapshot) => {
            const colors = [ "w3-khaki", "w3-orange","w3-cyan","w3-red", "w3-brown", "w3-amber", "w3-blue", "w3-green", "w3-deep-orange", "w3-deep-purple","w3-teal", "w3-yellow"];
            if (snapshot.exists()) {
                const mapa = snapshot.val();
                const students = [];
                
                // for(let i =0; i < 100; i++)
                //     students.push({imie:"Mirek", loggedIn: true, nazwisko:"Kowalski", color: colors[~~(Math.random()*colors.length-1)], rola: 0});

            
                let cnt = 0;
                for(const i in mapa) {
                    mapa[i].uid = i;
                    mapa[i].color = colors[(cnt++)%colors.length];      //zamiast losowo niech każda instancja programu przycieli takie same kolory
                    mapa[i].font = colorMap.get(mapa[i].color);
                    students.push(mapa[i]);
                    if(i === Global.user?.uid)
                    Global.currentUserColor = mapa[i].font;
                }

                // const nowi = this.state.students.filter(x => students.filter(xs => (xs.imie == x.imie && xs.nazwisko == x.nazwisko).length ) );
                // console.log("Nowi:");
                // students.forEach(n => {
                //     console.log("student: " + n.imie +" "+ n.nazwisko)
                // });
                //this.state.students = students;
                Global.students = mapa;
                setTimeout( () =>this.setState({...this.state, students: students}), 100);
            } 
        }, {
            onlyOnce: false
        });

    }

    componentWillUnmount() {
        if(this.nodeRef)
            off(this.nodeRef);

    }

    render() {

        if(this.state.students.length === 0 || !Global.currentSession)
            return (<></>);

        return(<>
        <div className="sessionbar">
        <p id="session_name">{this.props.name}</p>
            <div>
                {this.state.students.map((s) => {
                    // console.log(s);
                    if(s.loggedIn && s.session === Global.currentSession)
                        return(
                            <Student key={s.imie+' '+s.nazwisko} name={s.imie+' '+s.nazwisko}  color={s.color} value={s.imie.charAt(0)+s.nazwisko.charAt(0)}> </Student>
                        )
                })}
            </div>
        </div>
        </>);
    }
}

export default Sessionbar;
