import {useEffect, useState} from 'react';
import {Button, Form} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import {Col, Container, Row} from "react-bootstrap/";
import PropTypes from "prop-types";


const LogInForm = (props) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        // props.setMessage("")
    });

    const validateForm = () => {
        const validationErrors = {};
        // validazione per evitare un campo nullo
        if (email.trim() === '') {
            validationErrors.email = 'il campo email non può essere vuoto';
        }
        // validazione per evitare un campo nullo
        if (password.trim() === '') {
            validationErrors.password = 'il campo password non può essere vuoto';
        }
        return validationErrors;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors([]);
        setEmail(email.trim());
        const username = email.trim()
        const credentials = {username, password};
        props.logIn(credentials);

    }

    return (

        <Container className="mt-2 text-center">
            <Row className="justify-content-center align-items-center">
                <Col>
                    <span className="large-emoji">🤩</span>
                </Col>
            </Row>
            <Form className='block-example border border-primary rounded mt-4 mb-0 px-5 py-4 form-padding'
                  onSubmit={handleSubmit}>
                <Form.Group className='mb-3'>
                    <Form.Label>Email</Form.Label>
                    <Form.Control className={errors.email ? 'wrong-field' : ''} type='email' value={email}
                                  onChange={event => setEmail(event.target.value)}/>
                </Form.Group>
                <Form.Group className='mb-3'>
                    <Form.Label>Title</Form.Label>
                    <Form.Control className={errors.password ? 'wrong-field' : ''} type='password' value={password}
                                  onChange={event => setPassword(event.target.value)}/>
                </Form.Group>
                {Object.keys(errors).length > 0 ?
                    <div id="errors" className='pt-1 pb-2'>
                        {
                            Object.keys(errors).map((err, index) => (
                                <p className='error-message' key={index}>
                                    <b>{"Error " + (index + 1) + ": "}</b>{errors[err]}
                                </p>))
                        }
                    </div>
                    : ""
                }
                <Link className='btn btn-danger mx-2 my-3' to="/">Cancel</Link>
                <Button className='my-3' variant='primary' type='submit'>Save</Button>
            </Form>
        </Container>

    )

}

LogInForm.propTypes = {
    setMessage: PropTypes.func.isRequired,
    logIn: PropTypes.func.isRequired
};

export {LogInForm};
