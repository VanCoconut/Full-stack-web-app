import {Link} from "react-router-dom";
import {Col, Container, Row} from "react-bootstrap/";
import PropTypes from "prop-types";
import {useEffect} from "react";

export function PageNotFound({setMessage}) {
    useEffect(() => {
        setMessage(null)
    });
    return (
        <>
            <Container className="mt-2 text-center">
                <Row className="justify-content-center align-items-center">
                    <Row><Col><h2 className="text-danger">Pagina non trovata</h2></Col></Row>
                    <Row><Col> <img src="/GitHub404.png" alt="page not found" className="my-3"/>
                    </Col></Row>
                    <Row><Col> <Link to="/" className="btn btn-primary mt-2 my-5">Vai alla landing page!</Link> </Col></Row>
                </Row>
            </Container>
        </>
    );
}

PageNotFound.propTypes = {
    setMessage: PropTypes.func.isRequired
};
