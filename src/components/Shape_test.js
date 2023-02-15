import  { Component } from "react";
import  Global from "../Global";



//komponent pobierający kształty z backendu
class Shape_test extends Component {
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
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': `${Global.localURL}`,
        };
    
        result = await fetch(url
            , {
            mode: 'cors',
            headers: headers,
            method: 'GET',
        });//.then(responce => {return responce.json()}).then(responceData => {return responceData});
        return await result.json();
     
    }

    async getShapes() {
        const url =  `${Global.baseURL}/Shape/GetShapes`;
        console.log(url);
        let response = await this.getShapesRequest(url);
        //response = JSON.parse(response);
        let shapes = [];
        
        response.forEach(sh => {
            let shape = {
                date: sh.date,
                points: sh.points,
                color: sh.iColor,
                sDescription: sh.sDescription,
            }
            shapes.push(shape);
        });
        this.setState({shapes: shapes});
    }
    
    //funkcja przywoływanana gdy komponent jest mocowany (dzieje się to w pliku App.js)
    componentDidMount() {
        this.getShapes();
        
        //eventSource.close();
          
    }

    render() {
        return (
            <div>
                <h3>Lista:</h3>
                <ul>
                {this.state.shapes.forEach((shape, index) => (
                    <div key={index}>
                        <li>{shape.date + " " + shape.sDescription}  </li>
                    </div>
                ))}
                </ul>
            </div>
        );
    }
}

export default Shape_test;