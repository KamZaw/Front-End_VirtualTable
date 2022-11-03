import { Component } from "react";
import Global from "./Global";
//komponent statyczny dla strony głownej w aplikacji
class Home extends Component {
    constructor()
    { 
        super();
        
        this.eventSource = null;
    } 
     
    componentDidMount() {
 
          this.eventSource = new EventSource(`${Global.baseURL}/update_shapes`, {withCredentials: !true});
          this.eventSource.onmessage = (e) => {
            const shape = JSON.parse(e.data); 
            console.log(shape.sDescription+" " + shape.Date);
          }
     } 
     componentWillUnmount() {
        if(this.eventSource != null)
            this.eventSource.close();
     } 
    render() { {
        
    }
        return (
            <div>
                <p>Główna zakładka</p>
            </div>
        );
    }
}

export default Home;