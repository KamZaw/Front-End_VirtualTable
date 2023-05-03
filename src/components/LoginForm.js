import "../assets/w3.css"
import "../assets/loginform.css"
import { Component } from "react";
import {createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut} from "firebase/auth"
import Global from "../Global";
import {getDatabase, off, set, ref, update} from "firebase/database"
import {Shape} from "../threejs/Shape"
import {cRole} from "../shapetype"

class LoginForm extends Component {

    constructor(props) {
        super(props);
        this.registrationComplete = false;
        this.state = {
            lastName:"",
            firstName:"",
            loginName: "kamila.zawadzka31@gmail.com", //"student01@gmail.com",
            password: "", //"student01!",
            user: "",
            isVisible: props.isVisible,
            // isRegister: props.isRegister,
            errorMessage: "",
        }
    }
    onRegister = async (event) => {
        try {
            if(!this.validateFormFields()) {
                this.setState({...this.state, errorMessage: "Należy podać login i hasło"})
                event.preventDefault();
                return;
            }
            if(!this.validateRegisterFields()) {
                this.setState({...this.state, errorMessage: "Należy podać imię i nazwisko"})
                event.preventDefault();
                return;
            }
            const user = await createUserWithEmailAndPassword(getAuth(Global.firebaseApp),this.state.loginName, this.state.password);//"guest@email.com", "guest01!"
            this.registrationComplete = true;
            const fb = getDatabase(Global.firebaseApp);
            user && fb && set(ref(fb, `Students/${user.user.uid}/`), 
            {
                refreshed: Shape.dateToTicks(new Date()),
                imie: this.state.firstName,
                nazwisko: this.state.lastName,
                loggedIn: true,
                rola: cRole.READONLY,
                session: null,

            });

            // console.log(user);
            this.props.action(false);       //chowaj okno
        }catch(err) {
            console.log(err.message);
        }
    }
    async onLogOut() {
        if(!Global.user ) return;
        Global.user && Global.fb && update(ref(Global.fb, `Students/${Global.user.uid}/`), 
        {
            loggedIn: false,
        });

        //console.log("!!!!!!!!!!!");
        if(Global.nodeRef)
            off(Global.nodeRef);
        await signOut(getAuth(Global.firebaseApp));
        this.props.action(false);       //potrzeba aby zmienić status przycisku z LogIN na LogOUT        
    }
    // Program wypchałem już do Githuba (front end, na razie backend jest odłączony, front komunikuje się bezpośrednio z bazą firebase aby opóźnienie było minimalne, backend będzie miał ograniczoną rolę do synchronizacji czasu oraz przesyłania historycznych sesji)
    onLogin = async (event) => {

        // if(this.state.user) {
        //     await signOut(getAuth(Global.firebaseApp));
        // }
        if(!this.validateFormFields()) {
            this.setState({...this.state, errorMessage: "Należy podać login i hasło"})
            event.preventDefault();
            return;
        }

        //const app = initializeApp(firebaseConfig);
        signInWithEmailAndPassword(getAuth(), this.state.loginName, this.state.password)
        .then((userCredential) => {
            this.setState({...this.state, user: userCredential.user});
            this.props.action(false);
            // console.log(userCredential.user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            this.props.action(true);
            console.log(errorMessage);
            this.setState({...this.state, errorMessage: errorCode});
        });
    }    
    onPasswordChange(event) {
        this.setState({...this.state, password: event.target.value, errorMessage: ""})
    }   
    onLoginChange(event) {
        this.setState({...this.state,loginName: event.target.value, errorMessage: ""})
    } 
    onLastNameChange(event) {
        this.setState({...this.state,lastName: event.target.value, errorMessage: ""})
    } 
    onFirstNameChange(event) {
        this.setState({...this.state, firstName: event.target.value, errorMessage: ""})
    } 

    validateFormFields() {
        return this.state.loginName.length > 0 && this.state.password.length > 0;
    }
    validateRegisterFields() {
        return this.state.firstName.length > 0 && this.state.lastName.length > 0;
    }
    componentWillUnmount() {
        //this.onLogOut();
    }
    onClosing() {
        this.props.action(this.props.isLogin, false);
    }
    render() {

        if(!this.props.isVisible) {
            if(this.props.logout)
                this.onLogOut();
            return (<></>);
        }
        return (
            <>
            <div className={"container modal"}>
            <div onSubmit={this.onLogin} className={""}>
                <div className="login-box animated fadeInUp ">
                    <div className="box-header">
                        {/* <span className="close" onClick={this.onClosing.bind(this)}>&times;</span> */}
                        <span onClick={this.onClosing.bind(this)} className="w3-button w3-display-topright">&times;</span>
                        <h2>Logowanie</h2>
                    </div>
                    <div className="login-body">
                        <label htmlFor="login">Imię</label>
                        <br/>
                        <input autoFocus type="text" id="firstname" placeholder="imię studenta..."  defaultValue={this.state.firstName} onChange={this.onFirstNameChange.bind(this)}/>
                        <br/>
                        <label htmlFor="login">Nazwisko</label>
                        <br/>
                        <input autoFocus type="text" id="lastname" placeholder="nazwisko studenta..."  defaultValue={this.state.lastName} onChange={this.onLastNameChange.bind(this)}/>
                        <br/>

                        <label htmlFor="login">Login</label>
                        <br/>
                        <input autoFocus type="text" id="login" placeholder="login..." defaultValue={this.state.loginName} onChange={this.onLoginChange.bind(this)}/>
                        <br/>
                        <label htmlFor="password">Hasło</label>
                        <br/>
                        <input type="password" id="password" placeholder="hasło..." defaultValue={this.state.password} onChange={this.onPasswordChange.bind(this)}/>
                    </div>
                    <div className="login-footer">
                        <button onClick={this.onLogin}>Zaloguj się</button>
                        <hr/>
                        <button id="btnreg" onClick={this.onRegister}>Rejestracja</button>
                        {/* <button onClick={this.onLogOut.bind(this)}>Wyloguj się</button> */}
                        <br/>
                        {/* <a href="#"><p className="small">Forgot your password?</p></a> */}
                        <p className="error_msg">{this.state.errorMessage}</p>
                    </div>
                </div>
                </div>
            </div>

            </>
        );
    }
}

export default LoginForm;
