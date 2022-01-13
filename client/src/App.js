import React, { Fragment } from "react";
import "./App.css";
import  Items from "./components/Items";
import Alert from "./components/Alert";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  console.log("what happened")
    return (
        <Provider store={store}>
            <Router>
                <Fragment>
                    <div className="container">
                        <Alert></Alert>
                        <Routes>
                            <Fragment>
                                <Route path="/" element={<Items />}></Route>
                            </Fragment>
                        </Routes>
                    </div>
                </Fragment>
            </Router>
        </Provider>
    );
};

export default App;
