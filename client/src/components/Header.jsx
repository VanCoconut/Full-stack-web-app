import {Col, Container, Row} from "react-bootstrap/";
import {Link} from "react-router-dom";
import PropTypes from "prop-types";

function Header(props) {
    const {loggedIn, logOut} = props
    return <header className="py-1 py-md-3 border-bottom bg-primary">
        <Container fluid className="gap-3 align-items-center">
            <Row>
                <Col className="d-flex align-items-center justify-content-start">
                    {
                        loggedIn &&
                            < Link to='/personal' className="d-block link-light text-decoration-none">
                                <i className="bi bi-person-circle"></i>
                            </Link>
                    }
                </Col>
                <Col xs={4}>
                    <a href="/"
                       className="d-flex align-items-center justify-content-center h-100 link-light text-decoration-none">
                        <i className="bi bi-controller me-2"></i>
                        <span className="h3 mb-0">Meme Game</span>
                    </a>
                </Col>
                <Col className="d-flex align-items-end justify-content-end">
                    {
                        !loggedIn ?
                            <Link to='/login' className='btn btn-outline-light'>Login</Link>
                            :
                            <Link to='/login' className='btn btn-outline-light' onClick={logOut}>Logout</Link>
                    }
                </Col>
            </Row>
        </Container>
    </header>;
}

Header.propTypes = {
    loggedIn: PropTypes.bool.isRequired,
    logOut: PropTypes.func.isRequired,
};

export default Header;
