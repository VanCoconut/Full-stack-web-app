import {Link, useLocation} from "react-router-dom";
import {Col, Row} from "react-bootstrap/";
import {useEffect} from "react";
import {ListGroup, ListGroupItem} from "react-bootstrap";
import PropTypes from "prop-types";

// pagina che appare alla fine dei 3 round
export function Riepilogo({setMessage}) {

    const location = useLocation();
    // riferimenti presi dalla precedente route
    const data = location.state?.data || [];
    const msg = location.state?.msg || [];

    // somma i punti ottenuti
    let total = data.reduce((total, data) => {
        total += data.points
        return total
    }, 0)

    // setta il messaggio
    useEffect(() => {
        setMessage(msg)
    }, [msg]);

    return (
        <>
            <Row>
                <Col className="text-center m-5 mb-2 btn btn-secondary">
                    <Link className="text-decoration-none text-light" to="/">
                        Torna al menu principale per giocare di nuovo
                    </Link>
                </Col>
            </Row>
            <Row>
                <Col className="text-center m-5 btn btn-success">
                    <h5>Hai totalizzato un totale di {total} punti</h5>
                </Col>
            </Row>
            <ListGroup>
                {
                    data ?
                        data.filter(item => item.points === 5).map(item => <Lista data={item} key={item.id}/>)
                        : null
                }
            </ListGroup>
        </>
    )
}

function Lista({data}) {

    return (
        <ListGroupItem>
            <Row>
                <Col xl={4} className="text-center ">
                    <img src={data.image} alt="meme" width="100%"/>
                </Col>
                <Col xl={4} className="text-center ">
                    <span
                        className={"btn " + (data.points > 0 ? "btn-success" : "btn-danger")}> {data.response ? "Risposta: " + data.response : "Risposta non data"}</span>
                </Col>
                <Col xl={4} className="text-center">
                    <span>Points: {data.points}</span>
                </Col>
            </Row>
        </ListGroupItem>
    )
}


Riepilogo.propTypes = {
    setMessage: PropTypes.func.isRequired
};

Lista.propTypes = {
    data: PropTypes.object.isRequired
};
