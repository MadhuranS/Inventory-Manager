import React, {Fragment} from 'react'
import './App.css';

const App = () => {
  return (
    <Router>
    <Fragment>
        <div className="container">
            <Alert></Alert>
            <Routes>
                <Fragment>
                    <Route path="/" element={<TicketsView/>}></Route>
                    <Route path="/ticket/:id" element={<Ticket/>}></Route>
                </Fragment>
            </Routes>
        </div>
    </Fragment>
</Router>
  );
}

export default App;
