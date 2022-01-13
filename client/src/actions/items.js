import { GET_ITEMS, ITEMS_ERROR } from "./types";
import { setAlert } from "./alert";
import axios from "axios"

export const getItems = () => async (dispatch) => {
    try {
        const res = await axios.get("/api/items")
        dispatch({type: GET_ITEMS, payload: res.data})
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
                "Content-Type": "application/json",
            },
        };
        console.log("hi i was here", formData)
        await axios.post("/api/items", formData, config);
        dispatch(
            setAlert(
                "Item Created",
                "success"
            )
        );
    } catch (err) {
        dispatch(
            setAlert(
                `Could not create item, error text: ${err.response.statusText}, error code: ${err.response.status}`,
                "danger"
            )
        );
    }
}