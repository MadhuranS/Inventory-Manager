import { GET_ITEMS, ITEMS_ERROR } from "../actions/types";

const initialState = {
    items: []
};

export default function itemsReducer(state = initialState, action) {
    const { type, payload } = action;

    switch (type) {
        case GET_ITEMS:
            return {...state, items: payload};
        case ITEMS_ERROR:
            return {...state, items: []}
        default:
            return state;
    }
}
