import { Component } from "react";
import Global from "../Global";
//komponent statyczny dla strony głownej w aplikacji
class FirebaseUpdate extends Component {
    constructor()
    { 
        super();
        
        this.eventSource = null;
    } 
     
    componentDidMount() {
 
          this.eventSource = new EventSource(`${Global.baseURL}/update_shapes`, {withCredentials: !true});
          this.eventSource.onmessage = (e) => {
            const shape = JSON.parse(e.data); 
            if(shape == null) return;
            console.log(shape.ticks+" color: " + shape.iColor);
            this.props.action(shape);   //powiadom rodzica (<Main) o aktualizacji obiektu (onFBUpdate)
          }
     } 
     componentWillUnmount() {
        if(this.eventSource != null)
            this.eventSource.close();
     } 
    render() { 
        return (
            <></>
        );
    }
}

export default FirebaseUpdate;