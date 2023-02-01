import { Component } from "react";
import { randInt } from "three/src/math/MathUtils";
import Student from "./Student"
import {ref, child, onValue, off} from "firebase/database"
import Global from "../Global"

class Sessionbar extends Component {
    constructor(props) {
        super(props);
        const colors = ["w3-teal", "w3-khaki","w3-cyan","w3-red", "w3-brown"];
        const students = [];//[{firstName:"Mirek", lastName:"Kowalski", color: colors[~~(Math.random()*colors.length-1)]}, {firstName:"Bartosz", lastName:"Głowacki",color: colors[~~(Math.random()*colors.length-1)]}];
        this.state = {
            students: students,
        }
    }

    componentDidMount() {
   
        if(!Global.user) return;
        const dbRef = ref(Global.fb);
   
        this.nodeRef = child(dbRef, `Students/`);
        onValue(this.nodeRef, (snapshot) => {
            if (snapshot.exists()) {
                const mapa = snapshot.val();
                const students = [];
                
                for(const i in mapa) {
                    students.push(mapa[i]);
                }
                this.setState({...this.state, students: students});

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
        if(this.state.students.length == 0)
            return (<></>);
        
        return(<>
        <div className="sessionbar">
            {this.state.students.map((s) => {
                //console.log(s);                
                if(s.loggedIn)
                    return(
                        <Student key={s.imie+s.nazwisko} color={s.color} value={s.imie.charAt(0)+s.nazwisko.charAt(0)}> </Student>
                    )
            })}
            
        </div>
        </>);
    }
}

export default Sessionbar;
