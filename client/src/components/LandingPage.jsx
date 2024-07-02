import {Link} from "react-router-dom";
import PropTypes from "prop-types";

export function LandingPage({user}) {
    return (<>
        {!user && <h4 className="mt-3  text-center text-danger">Registrati subito per poter accedere a tutti i servizi che il gioco può offrire</h4>}
        <Link to="/game-round"
              className=" btn btn-secondary mx-5 mt-5 d-flex justify-content-center align-items-center">
            Inizia IL gioco</Link>
    </>
        )
}

LandingPage.propTypes = {
    user: PropTypes.object
};
