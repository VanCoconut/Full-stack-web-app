import {Row} from "react-bootstrap/";
import {useEffect, useRef} from "react";
import PropTypes from "prop-types";


export function Timer({timer, setTimer,handleSelect,meme,descriptions}) {
    const timerRef = useRef(timer);

    //esegue il timer
    useEffect(() => {
        timerRef.current =timer
        const interval = setInterval(() => {
            if (timerRef.current > 1) {
                timerRef.current -= 1;
                setTimer(timerRef.current);
            } else {
                timerRef.current -= 1;
                setTimer(timerRef.current);
                handleSelect(null).then().catch();
                clearInterval(interval);
            }
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, [meme,descriptions]);

    // colora il timer
    const getTimerColor = () => {
        if (timer > 20) return "text-success"; // Green
        if (timer > 10) return "text-warning"; // Orange
        return "text-danger"; // Red
    };

    return (
        <Row className="text-center bg-dark my-3 justify-content-center align-content-center">
            <h4 className={getTimerColor()}>
                <i className="bi bi-stopwatch-fill mx-3 "></i>
                {timer > 0 ? "TEMPO RIMASTO " + timer + "S" : "TEMPO SCADUTO"}
            </h4>
        </Row>
    );
}
Timer.propTypes = {
    timer: PropTypes.number.isRequired,
    setTimer: PropTypes.func.isRequired,
    handleSelect: PropTypes.func.isRequired,
    meme: PropTypes.object.isRequired,
    descriptions: PropTypes.array.isRequired
};

