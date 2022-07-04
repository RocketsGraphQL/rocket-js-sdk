
import axios from "axios";
import Cookies from 'js-cookie';

axios.defaults.withCredentials = false;

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

let params = new URLSearchParams(document.location.search);
if (params.get('rgraphRefreshToken')) {
    const refreshToken = params.get('rgraphRefreshToken')
    console.log("url.searchParams.get('rgraphRefreshToken')", refreshToken);
    setCookie("refresh", refreshToken, 365);
}
if (params.get('rgraphAccessToken')) {
    const accessToken = params.get('rgraphAccessToken')
    console.log("url.searchParams.get('rgraphAccessToken')", accessToken);
    setCookie("jwt", accessToken, 7);
}

(async () => {

})().catch(err => {
    console.error(err);
});


export default class Auth {
    constructor(config) {
        const { baseURL } = config;
        this.baseURL = baseURL;
    }
    async login ({email, password, provider} = {}) {
        if (provider == "local") {
            const login = await axios.post(this.baseURL+"/signin", {
                email: email,
                password: password,
            })
            const {jwt, refresh} = login.data;
            Cookies.set("jwt", jwt, { expires: 7 });
            Cookies.set("refresh", refresh, { expires: 7 });
            return true;
        }
    }
    async signIn ({email, password, provider} = {}) {
        switch (provider) {
            case "github":
                // first get the redirect URL
                // and provider URL
                console.log("getting github client test", this.baseURL);
                const client = await axios.get(this.baseURL+"/github/client")
                console.log("client: ", client)
                const {ProviderUrl, RedirectUrl} = client.data;
                // create a listener to update
                // cookies when redirectURL is reached
                Cookies.set("githubRedirectUrl", RedirectUrl);
                Cookies.set("api_url", this.baseURL);
                return {success: true, redirectUrl: RedirectUrl, providerUrl: ProviderUrl}
            default:
                const login = await axios.post(this.baseURL+"/signin", {
                    email: email,
                    password: password,
                })
                const {jwt, refresh} = login.data;
                Cookies.set("jwt", jwt, { expires: 7 });
                Cookies.set("refresh", refresh, { expires: 7 });
                return {success: true};
        }
    }
    logout () {
        Cookies.remove("jwt");
        Cookies.remove("refresh");
    }
    async register ({email, password}) {
        const signup = await axios.post(this.baseURL+"/signup", {
            email: email,
            password: password,
        })
        const {jwt, refresh} = signup.data;
        Cookies.set("jwt", jwt, { expires: 7 });
        Cookies.set("refresh", refresh, { expires: 7 });
        return true;
    }
    async refresh() {
        const refreshResp = await axios.post(this.baseURL+"/refresh-token", {
            access: Cookies.get("jwt"),
            refresh: Cookies.get("refresh"),
        })
        const {access, refresh} = refreshResp.data;
        console.log("access refresh", access, refresh);
        Cookies.set("jwt", access, { expires: 7 });
        Cookies.set("refresh", refresh, { expires: 7 });
        return true;
    }
    async setUser() {
        const cookies = await axios.get(this.baseURL + "/tokens");
        const { jwt, refreshToken } = cookies.data;
        Cookies.set("jwt", jwt, { expires: 7 });
        Cookies.set("refresh", refreshToken, { expires: 7 });
    }
    getJWTToken () {
        return Cookies.get("jwt");
    }
    getUserId () {
        return Cookies.get("user_id");
    }
    isAuthenticated () {
        if (Cookies.get("jwt")) {
            return true;
        }
        return false;
    }
}