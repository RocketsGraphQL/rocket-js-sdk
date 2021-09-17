import axios from "axios";
import Cookies from 'js-cookie'

const js = {
    baseURL: "",
    configure: (obj) => {
        if (obj && obj.hasOwnProperty("baseURL")) {
            if (obj["baseURL"].constructor.name === "String") {
                js.baseURL = obj["baseURL"]
            }
        }
    },
    login: ({email, password}) => {
        return axios.post(js.baseURL+"/login", {
            email: email,
            password: password,
        })
    },
    logout: () => {
        Cookies.remove("jwt");
    },
    register: ({email, password}) => {
        return axios.post(js.baseURL+"/signup", {
            email: email,
            password: password,
        })
    },
    getJWTToken: () => {
        return Cookies.get("jwt");
    },
    isAuthenticated: () => {
        if (Cookies.get("jwt")) {
            return true;
        }
        return false;
    },
}

export default js;