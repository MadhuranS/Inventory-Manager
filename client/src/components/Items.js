import React, { useEffect, Fragment } from "react";
import { getItems } from "../actions/items";
import { connect } from "react-redux";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";

const Items = ({ getItems, items: { items } }) => {
    useEffect(() => {
        getItems(); //fetch all items everytime the page reloads
    }, [getItems]);
    return (
        <Fragment>
            {items &&
                items.map((item) => (
                    <Card
                        key={item._id}
                        bg="light"
                        text="dark"
                        style={{ width: "100%" }}
                        className="mb-2 border-2"
                    >
                        <Card.Header>Item Id: {item._id}</Card.Header>
                        <Card.Body>
                            <Card.Title>{item.name}</Card.Title>
                            <Card.Text>{item.description}</Card.Text>
                        </Card.Body>
                        <Card.Footer>
                            <Link className="btn btn-primary my-1" to={`/edit/${item._id}`}> Edit</Link>
                        </Card.Footer>
                    </Card>
                ))}
            <Link
                to={`/create`}
                className="btn btn-primary my-1"
            >
                Create an inventory item
            </Link>
        </Fragment>
    );
};

const mapStateToProps = (state) => ({
    items: state.items,
});

export default connect(mapStateToProps, { getItems })(Items);
