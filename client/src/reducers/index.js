import { combineReducers } from "redux";
import alert from "./alert";
import items from "./items"

//Combine all reducers into
export default combineReducers({
    alert,
    items,
});
