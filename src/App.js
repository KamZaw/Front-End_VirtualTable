import './assets/App.css';
import React from 'react';
import Main from './components/Main';
// import LoginForm from './components/LoginForm';
// import Global from './Global';
// import {BrowserRouter as Router, Link, Route, Routes} from 'react-router-dom';


//wiadomość dla urządzeń mobilnych
function NoMobile() {

  return(<div class="info"><div class="info-text">{"Aplikacja nie działa na urządzeniach mobilnych (;"}</div></div>);
}

function App() {


  //   const shapeListener = () => {
  //   fetch(`${Global.baseURL}/stocks`, { method: "GET" })
  //     .then((res) => (res.status === 200 ? res.json() : console.log("rejected")))
  //     .then((result) => console.log(result))
  //     .catch((err) => console.log("...err"));
  // };
  // //shapeListener();

  // let f = ( () => {
  //   let eventSource = new EventSource(`${Global.baseURL}/update_shapes`);
  //   eventSource.onmessage = (e) => console.log("OK" + e.data);
  // });
  // f();
  
  //eventSource.close();
  const regexp = /android|iphone|kindle|ipad/i;
  const isMobileDevice = regexp.test(navigator.userAgent);
      

  
  return (
    <div id="menu" className="App">
      
      {isMobileDevice?<NoMobile/>:<Main/>}
      {/* <Main/> */}
        
        {/* { <Router>
          
          <ul>
            <li><Link to='/home'>Główna</Link></li>
            <li><Link to='/shapes'>Wczytaj Figury</Link></li>
            <li><Link to='/shapes/delete'>Usuń Figury</Link></li>
          </ul>
          
          <Routes>
            <Route path='/home' element={<Home/>}/>
            <Route path='/shapes' element={<Shape/>}/>
            <Route path='/shapes/delete' element={<ShapeDelete/>}/>
          </Routes>
        </Router> } */}
    </div>
  );
}

export default App;
