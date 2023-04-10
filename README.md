# rocket-js-sdk

This is a wrapper to API calls to your backend auth URL. This also takes care of periodically refreshing your auth tokens using an access token. To use it with Rocketgraph:

To Install:

```
npm i --save @rocketgraphql/rocketgraph-js-sdk
```

Usage:

```
import { createClient } from "@rocketgraphql/rocketgraph-js-sdk";
import Cookies from 'js-cookie';

const config = {
  baseURL: "https://backend-1CBIJOG.rocketgraph.app/api",
};

const { auth } = createClient(config);
export { auth };
```

Now you have access to several functions like:

```
auth.getJWTToken()
```
