import { GET_ITEMS, ITEMS_ERROR } from "./types";
import { setAlert } from "./alert";
import axios from "axios";

export const getItems = () => async (dispatch) => {
    try {
        const res = await axios.get("/api/items");
        dispatch({ type: GET_ITEMS, payload: res.data });
        dispatch(setAlert("Successfully fetched items!", "success"));
    } catch (err) {
        dispatch({
            type: ITEMS_ERROR,
        });
        dispatch(
            setAlert(
                `Could not fetch items, error text: ${err.response.statusText}, error code: ${err.response.status}`,
                "danger"
            )
        );
    }
};

export const createItem = (formData) => async (dispatch) => {
    try {
        const config = {
            headers: {
                "Content-Type":
                    "multipart/form-data; boundary=----FormBoundary-7de21530-68fd-11e3-a14f-37e8c06fffa5",
            },
        };

        await axios.post("/api/items", formData, config);
        dispatch(setAlert("Item Created", "success"));
    } catch (err) {
        dispatch(
            setAlert(
                `Could not create item, error data: ${JSON.stringify(
                    err.response.data
                )}, error code: ${err.response.status}`,
                "danger"
            )
        );
    }
};

export const editItem = (formData, id) => async (dispatch) => {
    try {
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        await axios.patch(`/api/items/${id}`, formData, config);
        dispatch(setAlert("Item Edited", "success"));
    } catch (err) {
        dispatch(
            setAlert(
                `Could not edit item, error data: ${JSON.stringify(
                    err.response.data
                )}, error code: ${err.response.status}`,
                "danger"
            )
        );
    }
};

export const deleteItem = (id) => async (dispatch) => {
    try {
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        await axios.delete(`/api/items/${id}`, null, config);
        dispatch(setAlert("Item deleted", "success"));
        window.location.reload(false);
    } catch (err) {
        dispatch(
            setAlert(
                `Could not delete item, error data: ${JSON.stringify(
                    err.response.data
                )}, error code: ${err.response.status}`,
                "danger"
            )
        );
    }
};
