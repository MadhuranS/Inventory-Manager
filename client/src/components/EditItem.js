import React, { Fragment, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Link, useParams } from "react-router-dom";
import { editItem } from "../actions/items";
import { connect } from "react-redux";

const EditItem = ({ editItem }) => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const [sendData, setSendData] = useState({
        sendName: true,
        sendDescription: false,
    });

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const finalData = {};
        if (sendData.sendName) finalData["name"] = formData.name;
        if (sendData.sendDescription)
            finalData["description"] = formData.description;
        editItem(finalData, id);
        setFormData({ name: "", description: "" });
    };

    const onCheck = (e) => {
        setSendData({ ...sendData, [e.target.name]: e.currentTarget.checked });
    };

    return (
        <Fragment>
            <Form onSubmit={onSubmit}>
                <Form.Text>
                    Editing instructions: Use the checkboxes to determine what
                    fields need to be choose what fields can stay the same as
                    before. This way you can test the edit patch request with
                    inputs that dont include certain fields
                </Form.Text>
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
                        If left empty and Update box is checked, you will
                        receive a 400 error since name can't be empty
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
                    <Form.Text className="text-muted">
                        If left empty and Update box is checked, you will
                        receive a 400 error since description can't be empty
                    </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                    <Form.Check
                        name="sendName"
                        type="checkbox"
                        label="Update name?"
                        onChange={(e) => onCheck(e)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                    <Form.Check
                        name="sendDescription"
                        type="checkbox"
                        label="Update description?"
                        onChange={(e) => onCheck(e)}
                    />
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
