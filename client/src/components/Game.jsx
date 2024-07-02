import {Link} from "react-router-dom";
import {Button, Col, Row} from "react-bootstrap/";
import {useEffect, useRef, useState} from "react";
import API from "../API.mjs";
import {Insight} from "../models/Meme.mjs";
import {Timer} from "./Timer.jsx";
import PropTypes from "prop-types";


export function GameRound(props) {

    const {user, setMessage, setWaiting} = props

    const [meme, setMeme] = useState(null);

    const [descriptions, setDescriptions] = useState([])

    const [selected, setSelected] = useState(null);

    const [round, setRound] = useState(1);

    const [timer, setTimer] = useState(30);

    const [messaggioRiepilogo, setMessaggioRiepilogo] = useState(null);


    const [rightAnswers, setRightAnswers] = useState([]);

    const data = useRef([]);

    //ripristina la cronologia temporanea del singolo utente
    useEffect(() => {
        setWaiting(true)
        if (user) {
            API.deleteSeenMemes(user.id).then().catch(err => setMessage({
                msg: typeof err === 'string' ? err : "errore",
                type: 'danger'
            })).finally(() => setWaiting(false));
        }
    }, [user]);

    //prende i meme
    useEffect(() => {
        setWaiting(true);
        setMessage("")
        const id = user ? user?.id : 0;
        API.getRandomMeme(id)
            .then(e => setMeme(e))
            .catch(err => setMessage({msg: typeof err === 'string' ? err : "errore", type: 'danger'}))
            .finally(() => setWaiting(false));
    }, [round, user]);

    //prende le descr
    useEffect(() => {
        setWaiting(true)
        const id = meme ? meme.id : 0
        API.getDescriptions(id)
            .then(descriptions => {
                setDescriptions(descriptions)
            })
            .catch(err => {
                setMessage({msg: typeof err === 'string' ? err : "errore", type: 'danger'})
            })
            .finally(() => setWaiting(false));
    }, [meme])

//increamenta il round e resetta alcuni stati
    const incrementRound = () => {
        setRound(prevCount => prevCount + 1);
        setSelected(null)
        setMessage(null)
        setTimer(30)
    };

    //getisce la selezione della descrizione o la non selezione
    const handleSelect = async (description) => {
        setWaiting(true)
        try {
            if (description) {
                const getChecked = await API.getCheckedResponse(meme.id, description?.text)
                if (getChecked) {
                    description.right = true
                } else {
                    const trueItems = await API.getRightDescriptions(meme.id, descriptions)
                    setRightAnswers(trueItems)
                }
            } else {
                const trueItems = await API.getRightDescriptions(meme.id, descriptions)
                setRightAnswers(trueItems)
            }
        } catch (err) {
            setMessage({msg: typeof err === 'string' ? err : "errore", type: 'danger'})
        } finally {
            setWaiting(false)
        }
        const message = description?.right ? {msg: "Hai indovinato", type: 'success'}
            : {msg: "Peccato prova di nuovo", type: 'danger'};
        setMessage(message);
        setSelected(description)
        addResponseToData(description)
    }

    const addResponseToData = (description) => {
        // salva le risposte in locale
        if (user) {
            data.current = [
                ...data.current,
                {
                    image: meme.image,
                    ...new Insight(round, user.id, meme.id, description && description.right ? 5 : 0, description ? description.text : "",)
                }
            ];
            const seenMeme = {userId: user.id, memeId: meme.id};

            API.setSeenMemes(seenMeme).then().catch(err => setMessage({
                msg: typeof err === 'string' ? err : "errore",
                type: 'danger'
            })).finally(() => setWaiting(false));

            //verifica che i campi nell'array siano validi
            if (data.current.length === 3) {
                const validation = data.current.every(item => item.userId && item.memeId && item.points >= 0 && item.points <= 5);
                if (!validation) {
                    setMessaggioRiepilogo({
                        msg: "Impossibile salvare la partita a causa di dati corrotti",
                        type: 'danger'
                    })
                    return
                }
                //ripristina la cronologia temporanea del singolo utente
                API.deleteSeenMemes(user.id).then().catch(err => setMessage({
                    msg: typeof err === 'string' ? err : "errore",
                    type: 'danger'
                })).finally(() => setWaiting(false));

                //salva le risposte nel db
                API.addResponses(data.current)
                    .then(() => {
                        setMessaggioRiepilogo({msg: "Partita salvata", type: 'success'})
                    })
                    .catch(err => setMessaggioRiepilogo({
                        msg: typeof err === 'string' ? err : "errore",
                        type: 'danger'
                    }))
                    .finally(() => setWaiting(false));
            }
        }
    }

    return (
        <>
            {/*il timer compare solo se non è in corso e non è stato selezionato niente*/}
            {!selected && meme && descriptions &&
                <Timer timer={timer} setTimer={setTimer} handleSelect={handleSelect} meme={meme}
                       descriptions={descriptions}/>
            }
            {/*viene mostrato solo alla fine del round*/}
            {(selected || timer === 0) &&
                <MemeButton user={user} incrementRound={incrementRound} round={round} data={data}
                            msg={messaggioRiepilogo}/>
            }
            {/*gestione del display di meme e delle descrizioni*/}
            {meme && descriptions &&
                <Row className="mt-4 bg-dark">
                    <Col xs={7}>
                        <MemeImage meme={meme.image}/>
                    </Col>
                    <Col xs={5} className="text-center p-4">
                        <MemeDescriptions rightAnswers={rightAnswers} selected={selected}
                                          descriptions={descriptions}
                                          handleSelect={handleSelect} timer={timer}/>
                    </Col>
                </Row>
            }
        </>
    )
}

export function MemeImage(props) {
    return (
        <img src={props.meme} alt="meme" height="500"/>
    )
}

function MemeButton({user, incrementRound, round, data, msg}) {

    return (
        <Row>
            {/*compare solo se non sei autenticato hai finito il round*/}
            {!user &&
                <>
                    <Button active={false} variant="secondary" className="my-4" onClick={() => incrementRound()}>
                        Gioca di nuovo
                    </Button>
                    <Link className='btn btn-primary my-2' to="/login">
                        <h5>Oppure scopri quali funzioni aggiuntive esistono per gli utenti loggati</h5>
                    </Link>
                </>
            }
            {/*compare solo se sei autenticato hai finito il round*/}
            {user && (
                round < 3 ?
                    <Button active={false} variant="secondary" className="m-2" onClick={() => incrementRound()}>
                        <h5>Concludi il {round} Round</h5>
                    </Button>
                    :
                    <Link className='btn btn-primary m-2' to="/riepilogo"
                          state={{data: data.current, msg: msg}}>
                        <h5>Hai completato tutti i round.</h5>
                        <h5>Vai alla schermata riepilogativa</h5>
                    </Link>
            )}

        </Row>
    )
}

export function MemeDescriptions({selected, descriptions, handleSelect, rightAnswers, timer}) {
    return (
        <>
            {/*le descrizioni appaiono solo se il timer non è scaduto e non si è selezionato niente, altrimenti compare la fine del round*/}
            {(timer === 0 || selected) ?
                <MostraRiposte selected={selected} rightAnswers={rightAnswers}/>
                :
                <>
                    <Row className="text-light text-center"><h4>Clicca sulla descrizione che si addice meglio</h4>
                        <h5 className="text-center text-danger">Ma atteznione solo 2 sono giuste</h5></Row>
                    {descriptions.length > 0 &&
                        descriptions.map(description => (
                            <Button
                                key={description.id}
                                className='m-3 d-block'
                                variant="warning"
                                type="button"
                                onClick={() => handleSelect(description)}
                            >
                                {description && description.text}
                            </Button>
                        ))}
                </>
            }
        </>
    );
}

// stabilisce cosa mostrare alla fine del round in base al risultato
export function MostraRiposte({selected, rightAnswers}) {

    const puntiColore = selected?.right ? 'text-success' : 'text-danger';

    const mostraRisposteCorrette = !selected?.right;

    return (
        <>
            {/*stampa i punti guadagnati*/}
            <h4 className={puntiColore}>
                {"Hai guadagnato " + (selected?.right ? 5 : 0) + " punti"}
            </h4>

            {/*stampa la tua risposta se è corretta o le risposte corrette se hai sbagliato*/}
            {selected?.right ? (
                <Button active="false" variant="success">{selected.text}</Button>
            ) : (
                selected && (
                    <Row className="mb-4">
                        <h5 className="m-3 text-light">Risposta data errata:</h5>
                        <Button active="false" variant="danger">{selected.text}</Button>
                    </Row>
                )
            )}
            {mostraRisposteCorrette && (
                <>
                    <h5 className="m-3 text-light">Risposte corrette:</h5>
                    {rightAnswers.map(answer => (
                        <Row className="m-3" key={answer.id}>
                            <Button active="false" variant="success">{answer.text}</Button>
                        </Row>
                    ))}
                </>
            )}
        </>
    );
}

GameRound.propTypes = {
    user: PropTypes.object,
    setMessage: PropTypes.func.isRequired,
    setWaiting: PropTypes.func.isRequired,
};
MemeImage.propTypes = {
    meme: PropTypes.string.isRequired,
};
MemeButton.propTypes = {
    user: PropTypes.object,
    incrementRound: PropTypes.func.isRequired,
    round: PropTypes.number.isRequired,
    data: PropTypes.object.isRequired,
    msg: PropTypes.object,
};
MemeDescriptions.propTypes = {
    selected: PropTypes.object,
    descriptions: PropTypes.array.isRequired,
    handleSelect: PropTypes.func.isRequired,
    rightAnswers: PropTypes.array,
    timer: PropTypes.number.isRequired,
};
MostraRiposte.propTypes = {
    selected: PropTypes.object,
    rightAnswers: PropTypes.array.isRequired
}