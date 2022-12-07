import "../assets/loginform.css"
import { Component } from "react";
import Global from "../Global";
import { event } from "jquery";

class LoginForm extends Component {

    constructor() {
        super();
        
        this.state = {
            loginName:"",
            password:"",
        }


    }
    
    onLogin = event => {
        
        if(!this.validateFormFields()) {
            alert("Należy podać login i hasło");
            event.preventDefault();
        }
        
        
    }    
    onPasswordChange(event) {
        this.state.password = event.target.value;
    }   
    onLoginChange(event) {
        this.state.loginName = event.target.value;
    } 
    validateFormFields() {
        console.log("validating....")
        return this.state.loginName.length > 0 && this.state.password.length > 0;
    }
    render() {

        if(!this.props.isVisible) return (<></>);
        return (
            <>
            <div className={"container "}>
            <form onSubmit={this.onLogin}>
                <div className="top">
                    <h1 id="title" className="hidden"><span id="logo">Daily <span>UI</span></span></h1>
                </div>
                <div className="login-box animated fadeInUp">
                    <div className="box-header">
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
                    <button type="submit">Zaloguj się</button>
                    <br/>
                    {/* <a href="#"><p className="small">Forgot your password?</p></a> */}
                </div>
                </form>
            </div>

            </>
        );
    }
}

export default LoginForm;
