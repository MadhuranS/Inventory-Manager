import React, { Fragment, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { createItem } from "../actions/items";
import { connect } from "react-redux";

const CreateItem = ({ createItem}) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = (e) => {
        e.preventDefault();
        createItem(formData)
        setFormData({ name: "", description: "" });
    };

    return (
        <Fragment>
            <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Label>Item name</Form.Label>
                    <Form.Control
                        size="lg"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={(e) => onChange(e)}
                        placeholder="Item name"
                    />
                    <Form.Text className="text-muted">
                        API will send a 400 error if left empty
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        name="description"
                        as="textarea"
                        value={formData.description}
                        rows={3}
                        onChange={(e) => onChange(e)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit form
                </Button>
                <Link to={`/`} className="btn btn-primary my-1">
                    Back to tickets
                </Link>
            </Form>
        </Fragment>
    );
};

export default connect(null, { createItem })(CreateItem);