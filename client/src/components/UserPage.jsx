import {Col, Row} from "react-bootstrap/";
import {useEffect, useState} from "react";
import API from "../API.mjs";
import {ListGroup, ListGroupItem} from "react-bootstrap";
import PropTypes from "prop-types";

export function UserPage(props) {

    const [dataU, setDataU] = useState([]);

    const {user, setMessage, setWaiting} = props;

    // richeide tutte le partite dell'utente
    useEffect(() => {
        setWaiting(true);
        setMessage(null)
        API.getInsights(user?.id)
            .then(data => {
                setDataU(data);
            })
            .catch(err => setMessage({msg: typeof err === 'string' ? err : "errore", type: 'danger'}))
            .finally(() => setWaiting(false));
    }, [user]);

    // spezzetta i dati ricevuti per essere mostrat a schermo
    const chunkArray = (arr, size) => {
        const result = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    };

    // Dividiamo i dati in chunk di 3 elementi
    const dataChunks = chunkArray(dataU, 3);

    return (
        <>
            <Row className="my-4 text-center bg-dark text-light">
                <h4>{`Ciao, ${user?.name}. Ecco le statistiche delle tue partite precedenti `}</h4>
            </Row>
            {dataChunks.length > 0 ? (
                <ListGroup>
                    {dataChunks.map((chunk, chunkIndex) => {
                        // Calculate the total points for each group
                        const totalPoints = chunk.reduce((sum, item) => sum + item.points, 0);
                        return (
                            <div key={chunkIndex}>
                                <Row className="mb-3">
                                    <Col xl={6} className="text-left">
                                        <h3>Game {chunkIndex + 1}</h3>
                                    </Col>
                                    <Col xl={6} className="text-right">
                                        <h3>Totale Punteggio: {totalPoints}</h3>
                                    </Col>
                                </Row>
                                {chunk.map((item, itemIndex) => (
                                    <Lista data={item} key={item.id} index={itemIndex + 1}/>
                                ))}
                            </div>
                        );
                    })}
                </ListGroup>
            ) : (
                <Row className="text-center my-5">
                    <h4 className="text-bg-dark text-danger">No game found</h4>
                </Row>
            )}
        </>
    );
}


function Lista({data, index}) {
    return (
        <ListGroupItem>
            <Row className="bg-dark">
                <Col xl={12} className="text-center">
                    <h5>Round: {index}</h5>
                </Col>
            </Row>
            <Row className="bg-dark">
                <Col xl={4}>
                    <img src={data.memeId} alt="meme" width="100%"/>
                </Col>
                <Col xl={4}>
                    <h4 className={"text-light " + (data.points > 0 ? "bg-success" : "bg-danger")}> {data.response ? "Risposta: " + data.response : "Risposta non data"}</h4>
                </Col>
                <Col xl={4}>
                    <h4 className={"text-light " + (data.points > 0 ? "bg-success" : "bg-danger")}>Points: {data.points}</h4>
                </Col>
            </Row>
        </ListGroupItem>
    );
}

UserPage.propTypes = {
    user: PropTypes.object,
    setWaiting: PropTypes.func.isRequired,
    setMessage: PropTypes.func.isRequired
};
Lista.propTypes = {
    data: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired
};

