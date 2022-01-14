import React, { useEffect, Fragment } from "react";
import { getItems, deleteItem } from "../actions/items";
import { connect } from "react-redux";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

const Items = ({ getItems, deleteItem, items: { items } }) => {
    useEffect(() => {
        getItems(); //fetch all items everytime the page reloads
    }, [getItems]);

    const onClick = (e, id) => {
        deleteItem(id);
    };

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
                        {item.thumbnail && item.thumbnail.url ? (
                            <Card.Img
                                style={{
                                    width: "25vw",
                                    height: "15vh",
                                    marginTop: "10px",
                                    marginLeft: "20px"
                                }}
                                variant="top"
                                src={item.thumbnail.url}
                            />
                        ) : (
                            <Fragment></Fragment>
                        )}
                        <Card.Body>
                            <Card.Title>{item.name}</Card.Title>
                            <Card.Text>{item.description}</Card.Text>
                        </Card.Body>
                        <Card.Footer>
                            <Link
                                className="btn btn-primary my-1"
                                to={`/edit/${item._id}`}
                            >
                                Edit
                            </Link>
                            <Button onClick={(e) => onClick(e, item._id)}>
                                Delete
                            </Button>
                        </Card.Footer>
                    </Card>
                ))}
            <Link to={`/create`} className="btn btn-primary my-1">
                Create an inventory item
            </Link>
        </Fragment>
    );
};

const mapStateToProps = (state) => ({
    items: state.items,
});

export default connect(mapStateToProps, { getItems, deleteItem })(Items);
