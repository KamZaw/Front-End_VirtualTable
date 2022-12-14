import "../assets/loginform.css"
import { Component } from "react";
import {createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut} from "firebase/auth"
import Global from "../Global";
import {off} from "firebase/database"


class LoginForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loginName:"kamila.zawadzka31@gmail.com",
            password:"",
            user: "",
            isVisible: props.isVisible,
            errorMessage: "",
        }
    }
    onRegister = async (event) => {
        try {
            const user = await createUserWithEmailAndPassword(getAuth(Global.firebaseApp),"guest@email.com", "guest01!");
            console.log(user);
        }catch(err) {
            console.log(err.message);
        }
    }
    async onLogOut() {
        console.log("!!!!!!!!!!!");
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
            alert("Należy podać login i hasło");
            event.preventDefault();
        }
        //const app = initializeApp(firebaseConfig);
        signInWithEmailAndPassword(getAuth(), this.state.loginName, this.state.password)
        .then((userCredential) => {
            this.setState({...this.state, user: userCredential.user});
            this.props.action(false);
            console.log(userCredential.user);
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
        this.state.password = event.target.value;
        this.setState({...this.state, errorMessage: ""})
    }   
    onLoginChange(event) {
        this.state.loginName = event.target.value;
        this.setState({...this.state, errorMessage: ""})
    } 
    validateFormFields() {
        return this.state.loginName.length > 0 && this.state.password.length > 0;
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
            <div onSubmit={this.onLogin}>
                <div className="login-box animated fadeInUp">
                    <div className="box-header">
                        <span className="close" onClick={this.onClosing.bind(this)}>&times;</span>
                        <h2>Logowanie</h2>
                    </div>
                    <label htmlFor="login">Login</label>
                    <br/>
                    <input autoFocus type="text" id="login" placeholder="login..." defaultValue={this.state.loginName} onChange={this.onLoginChange.bind(this)}/>
                    <br/>
                    <label htmlFor="password">Hasło</label>
                    <br/>
                    <input type="password" id="password" placeholder="hasło..." defaultValue={this.state.password} onChange={this.onPasswordChange.bind(this)}/>
                    <br/>
                    <button onClick={this.onLogin}>Zaloguj się</button>
                    {/* <button onClick={this.onLogOut.bind(this)}>Wyloguj się</button> */}
                    <br/>
                    {/* <a href="#"><p className="small">Forgot your password?</p></a> */}
                    <p className="error_msg">{this.state.errorMessage}</p>
                </div>
                </div>
            </div>

            </>
        );
    }
}

export default LoginForm;
