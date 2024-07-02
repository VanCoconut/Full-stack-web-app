import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import {useEffect, useState} from 'react';
import {Container, Row} from 'react-bootstrap/';
import {Route, Routes, useNavigate} from 'react-router-dom';

import Header from "./components/Header.jsx";
import {Alert} from "react-bootstrap";
import API from "./API.mjs";
import {LogInForm} from "./components/LogInForm.jsx";
import {GameRound} from "./components/Game.jsx";
import {UserPage} from "./components/UserPage.jsx";
import {Riepilogo} from "./components/Riepilogo.jsx";
import {LandingPage} from "./components/LandingPage.jsx";
import {PageNotFound} from "./components/PageNotFound.jsx";

function App() {

    const navigate = useNavigate();

    const [waiting, setWaiting] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [message, setMessage] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            setWaiting(true);
            const user = await API.getUserInfo();
            setLoggedIn(true);
            setUser(user);
        };
        checkAuth()
            .then()
            .catch(() =>
                setMessage({msg: "Attenzione, non sei loggato", type: 'danger'})
            )
            .finally(() => setWaiting(false))
    }, []);


    const handleLogin = async (credentials) => {
        setWaiting(true)
        try {
            const user = await API.logIn(credentials);
            navigate('/');
            setLoggedIn(true);
            setUser(user);
            setMessage({msg: `Benvenuto, ${user.name}!`, type: 'primary'});
        } catch (err) {
            setMessage({msg: err, type: 'danger'})
        } finally {
            setWaiting(false)
        }
    };
    const handleLogOut = async () => {
        try {
            setWaiting(true)
            await API.logOut();
            setLoggedIn(false);
            setUser(null)
            setMessage(null);
        } catch (err) {
            setMessage({msg: err, type: 'danger'})
        } finally {
            setWaiting(false)
        }
    };
    return (
        <div className={`min-vh-100 d-flex flex-column parent-component ${waiting ? 'blur' : ''}`}>
            {waiting && <div className="overlay">Loading...</div>}
            <Header loggedIn={loggedIn} logOut={handleLogOut}/>
            <Container fluid className="flex-grow-1 d-flex flex-column">
                {message &&
                    <Row className="justify-content-center align-items-center">
                        <Alert variant={message.type} onClose={() => setMessage('')}
                               dismissible>{message.msg}</Alert>
                    </Row>}
                <Routes>
                    <Route index element={<LandingPage user={user}/>}/>
                    <Route path="/game-round" element={<GameRound setWaiting={setWaiting} user={user} message={message}
                                                                  setMessage={setMessage}/>}/>
                    <Route path="/login" element={<LogInForm logIn={handleLogin} setMessage={setMessage}/>}/>
                    <Route path="/personal"
                           element={<UserPage user={user} setMessage={setMessage} setWaiting={setWaiting}/>}/>
                    <Route path="/riepilogo" element={<Riepilogo setMessage={setMessage} setWaiting={setWaiting}/>}/>
                    <Route path="*" element={<PageNotFound setMessage={setMessage}/>}/>
                </Routes>
            </Container>
        </div>
    );
}

export default App;
