import { Component } from "react";
import  Global from "../Global";


//komponent pobierający kształty z backendu
class ShapeDelete extends Component {
    constructor() {
        super();
        this.state = {
            shapes: [],
        };
    }
    //pobierz obiekty kształtów z backendu
    async getShapesRequest(url) {
        let result = null;
        const headers = {
            'Access-Control-Allow-Origin': `${Global.localURL}`,
        };
    
        result = await fetch(url
            , {
            mode: 'cors',
            headers: headers,
            method: 'DELETE',
        });//.then(responce => {return responce.json()}).then(responceData => {return responceData});
        return await result.text();

    }

    async delShape(id) {
        id = 638026404272933140;
        let response = await this.getShapesRequest(`${Global.baseURL}/Shape/${id}`);
        console.log("Usunuięty "+ response);
    }
    
    //funkcja przywoływanana gdy komponent jest mocowany (dzieje się to w pliku App.js)
    componentDidMount() {
        this.delShape();
    }

    render() {
        return (
            <div>
                <ul>
                {this.state.shapes.map((shape, index) => {
                return (
                    <div key={index}>
                        <li>{shape.date + " " + shape.color}  </li>
                    </div>
                    )
                })}
                </ul>
            </div>
        );
    }
}

export default ShapeDelete;