import React, { Fragment, useRef } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Link, useParams } from "react-router-dom";
import { editItem } from "../actions/items";
import { connect } from "react-redux";

const EditItem = ({ editItem }) => {
    const { id } = useParams();
    const form = useRef(null);

    const onSubmit = (e) => {
        e.preventDefault();
        const data = new FormData(form.current);
        if (data.get("name").length === 0) {
            data.delete("name");
        }
        if (data.get("description").length === 0) {
            data.delete("description");
        }
        editItem(data, id);
    };

    return (
        <Fragment>
            <Form ref={form} onSubmit={onSubmit}>
                <Form.Text>
                    NOTE: If any of the below fields are left empty, the fields
                    will not be sent to the update endpoint of the api server.
                    If you would like to test how the server responds invalid inputs like
                    empty strings, please send your own request to the server. (For example the server will respond with a 400 error if you try to update name to an empty string)
                </Form.Text>
                <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Group
                        id="inpFile"
                        controlId="formFile"
                        className="mb-3"
                    >
                        <Form.Label>Item thumbnail image</Form.Label>

                        <Form.Control name="image" type="file" />
                    </Form.Group>
                    <Form.Label>Item name</Form.Label>
                    <Form.Control
                        size="lg"
                        type="text"
                        name="name"
                        placeholder="Item name"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control name="description" as="textarea" rows={3} />
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control name="quantity" type="number" />
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

export default connect(null, { editItem })(EditItem);
