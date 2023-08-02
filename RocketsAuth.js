
import axios from "axios";
import Cookies from 'js-cookie';

axios.defaults.withCredentials = false;

if (typeof window !== "undefined" && window && window.location.search) {
    let params = new URLSearchParams(window.location.search);
    if (params.get('rgraphRefreshToken')) {
        const refreshToken = params.get('rgraphRefreshToken')
        console.log("url.searchParams.get('rgraphRefreshToken')", refreshToken);
        Cookies.set(("refresh", refreshToken, { expires: 365 }));
    }
    if (params.get('rgraphAccessToken')) {
        const accessToken = params.get('rgraphAccessToken')
        console.log("url.searchParams.get('rgraphAccessToken')", accessToken);
        Cookies.set(("jwt", accessToken, { expires: 7 }));
    }
}

export default class Auth {
    constructor(config) {
        const { baseURL } = config;
        this.baseURL = baseURL;
    }
    async login ({email, password, provider} = {}) {
        if (provider == "local") {
            const login = await axios.post(this.baseURL+"/login", {
                email: email,
                password: password,
            })
            const {access, refresh} = login.data;
            Cookies.set("jwt", access, { expires: 7 });
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
                const login = await axios.post(this.baseURL+"/login", {
                    email: email,
                    password: password,
                })
                const {access, refresh} = login.data;
                Cookies.set("jwt", access, { expires: 7 });
                Cookies.set("refresh", refresh, { expires: 7 });
                return {success: true};
        }
    }
    async sendOTP({ phone }) {
        const otp = await axios.post(this.baseURL + "/sendotp", {
            Phone: phone,
        })
    }
    async signInWithOTP({ phone, otp }) {
        const login = await axios.post(this.baseURL + "/signin-with-otp", {
            Phone: phone,
            Otp: otp,
        });
        const { access, refresh } = login.data;
        Cookies.set("jwt", access, { expires: 7 });
        Cookies.set("refresh", refresh, { expires: 7 });
        return {success: true};
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
        const {access, refresh} = signup.data;
        Cookies.set("jwt", access, { expires: 7 });
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
        const { access, refresh } = cookies.data;
        Cookies.set("jwt", access, { expires: 7 });
        Cookies.set("refresh", refresh, { expires: 7 });
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