import React, { Fragment, useRef } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { createItem } from "../actions/items";
import { connect } from "react-redux";

const CreateItem = ({ createItem }) => {
    const form = useRef(null);

    const onSubmit = (e) => {
        e.preventDefault();
        const data = new FormData(form.current);
        createItem(data);
    };

    return (
        <Fragment>
            <Form ref={form} onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Group
                        id="inpFile"
                        controlId="formFile"
                        className="mb-3"
                    >
                        <Form.Label>Item thumbnail image</Form.Label>
                        <Form.Control name="image" type="file" />
                        <Form.Text className="text-muted">
                            API will send a 400 error if left empty since thumbnail
                            should never be empty
                        </Form.Text>
                    </Form.Group>
                    <Form.Label>Item name</Form.Label>
                    <Form.Control
                        size="lg"
                        type="text"
                        name="name"
                        placeholder="Item name"
                    />
                    <Form.Text className="text-muted">
                        API will send a 400 error if left empty since name
                        should never be empty
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control name="description" as="textarea" rows={3} />
                    <Form.Text className="text-muted">
                        API will send a 400 error if left empty since description
                        should never be empty
                    </Form.Text>
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit form
                </Button>
                <Link to={`/`} className="btn btn-primary my-1">
                    Back to items
                </Link>
            </Form>
        </Fragment>
    );
};

export default connect(null, { createItem })(CreateItem);
