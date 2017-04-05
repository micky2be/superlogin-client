# SuperLogin-client

Javascript bindings to help you build a front-end for SuperLogin applications.
Completely based on its counter part for [AngularJS](https://github.com/colinskow/ng-superlogin) of Colin Skow.

For issues and feature requests visit the [issue tracker](https://github.com/micky2be/superlogin-client/issues).

## Features

- Javascript bindings for all core SuperLogin functionality
- Cookie-less authentication protects your users from CSRF attacks
- Store your authentication token in localStorage or sessionStorage
- HTTP interceptor automatically sends an authentication token to every request to your configured endpoints
- Automatically refreshes the token after a pre-configured portion of its duration has passed
- Emits events to advise your application of any changes to authentication status

## Installation

`npm install superlogin-client --save`

## Configuration

Here is a tour of all the available configuration options:

```js
var config = {
  // An optional URL to API server, by default a current window location is used.
  serverUrl: 'http://localhost:3000',
  // The base URL for the SuperLogin routes with leading and trailing slashes (defaults to '/auth/')
  baseUrl: '/auth/',
  // A list of API endpoints to automatically add the Authorization header to
  // By default the host the browser is pointed to will be added automatically
  endpoints: ['api.example.com'],
  // Set this to true if you do not want the URL bar host automatically added to the list
  noDefaultEndpoint: false,
  // Where to save your session token: localStorage ('local') or sessionStorage ('session'), default: 'local'
  storage: 'local',
  // The authentication providers that are supported by your SuperLogin host
  providers: ['facebook', 'twitter'],
  // Sets when to check if the session is expired during the setup.
  // false by default.
  checkExpired: false,
  // A float that determines the percentage of a session duration, after which SuperLogin will automatically refresh the
  // token. For example if a token was issued at 1pm and expires at 2pm, and the threshold is 0.5, the token will
  // automatically refresh after 1:30pm. When authenticated, the token expiration is automatically checked on every
  // request. You can do this manually by calling superlogin.checkRefresh(). Default: 0.5
  refreshThreshold: 0.5
};
```
Now let's import SuperLogin and configure it...

```js
import superlogin from 'superlogin-client';
superlogin.configure(config);
```

## Events

##### `login`
```js
superlogin.on('login', function(session) { ... });
```
Session is an object that contains all the session information returned by SuperLogin, along with `serverTimeDiff`, the difference between the server clock and the local clock.

##### `logout`
```js
superlogin.on('logout', function(message) { ... });
```
Message is a message that explains why the user was logged out: 'Logged out' or 'Session expired'.

##### `refresh`
```js
superlogin.on('refresh', function(newSession) { ... });
```
Broadcast when the token is refreshed.

##### `link`
```js
superlogin.on('link', function(provider) { ... });
```
Broadcast when a provider has been linked to the account.

## API

##### `superlogin.authenticated()`
Returns true if the user is currently authenticated; otherwise false. (synchronous)

##### `superlogin.authenticate()`
Returns a promise that is resolved as soon as the user has authenticated. If the user never authenticates, this promise will stay waiting forever.

##### `superlogin.getConfig()`
Returns the config object. (synchronous)

##### `superlogin.validateSession()`
Makes an HTTP call to verify if the current session is valid

##### `superlogin.getSession()`
Returns the current session if the user is authenticated. (synchronous)

##### `superlogin.deleteSession()`
Deletes the current session, but does not invalidate the token on the server or broadcast a logout event. (synchronous)

##### `superlogin.getDbUrl(dbName)`
Returns the access url for the specified user database, or null if it is not found. (synchronous)

##### `superlogin.confirmRole(role)`
Returns true if the authenticated user possesses the specified `role` (string). (synchronous)

##### `superlogin.confirmAnyRole(possibleRoles)`
Returns true if the user possesses at least one of the specified `possibleRoles` (array). (synchronous)

##### `superlogin.confirmAllRoles(requiredRoles)`
Returns true if the user possesses ALL of the specified `requiredRoles` (array). (synchronous)

##### `superlogin.refresh()`
Makes an HTTP call to refresh the access token.

##### `superlogin.checkRefresh()`
Checks if the session has exceeded the refresh threshold, and calls refresh if necessary

##### `superlogin.checkExpired()`
Checks if the session has expired and logs out if the access token is no longer valid. Accounts for server time difference.

##### `superlogin.login(credentials)`
Passes credentials to the server to log the user in. Returns a promise that resolves with session information upon successful login, or rejects with an error message if login fails. The credentials object must contain `username` and `password`.

##### `superlogin.register(registration)`
Passes the registration form to SuperLogin to create a new user. Returns a promise. If the sever returns session information the user is automatically logged in.

##### `superlogin.logout(message)`
Logs out the current session and returns a promise. Deletes the session and resolves the promise no matter what. The optional `message` will be broadcast with the 'sl:logout' event.

##### `superlogin.logoutAll(message)`
Logs out ALL the user's open sessions and returns a promise. Deletes the session and resolves the promise no matter what. The optional `message` will be broadcast with the 'sl:logout' event.

##### `superlogin.logoutOthers()`
Logs out all the user's open sessions EXCEPT the current one. Returns a promise.

##### `superlogin.socialAuth(provider)`
Opens a popup window to authenticate the specified provider. Returns a promise that is rejected if authentication fails, or the popup is closed prematurely. Also rejects if the provider is not present in the `providers` list in the config.

##### `superlogin.tokenSocialAuth(provider, accessToken)`
Login using an access_token obtained by the client for the specified provider. This is useful for PhoneGap and native plugins. Rejects if the provider is not present in the `providers` list in the config.

##### `superlogin.link(provider)`
Opens a popup window to link provider to the already authenticated user. Returns a promise that will reject if the user is not authenticated, the popup is closed prematurely, or the link fails.

##### `superlogin.tokenLink(provider, accessToken)`
Link a provider using an access_token obtained by the client. Returns a promise.

##### `superlogin.unlink(provider)`
Unlinks the specified provider from the user's account. Returns a promise.

##### `superlogin.verifyEmail(token)`
Verifies the user's email with the SuperLogin server, using the specified token. Returns a promise. Authentication is not required. The token will be a URL parameter passed in when the user clicks on the confirmation link in the email sent by the system. Your app needs to manually extract the token from the URL and pass it in here.

##### `superlogin.forgotPassword(email)`
Makes an HTTP request to SuperLogin to send a forgot password email to the user. Authentication is not required.

##### `superlogin.resetPassword(form)`
Forwards the supplied reset password form to SuperLogin. Must include `token`, `password`, and `confirmPassword`. The token needs to beis extracted from the URL when the user clicks on the link in the password reset email.

##### `superlogin.changePassword(form)`
Changes the authenticated user's password, or creates one if it has not been set. If a password already exists, then `currentPassword` is required. If no password is set, then only `newPassword` and `confirmPassword` are required.

##### `superlogin.changeEmail(newEmail)`
Changes the authenticated user's email. If email confirmation is enabled, a new confirm email will go out, and the email will not be changed until the new address is confirmed.

##### `superlogin.logoutAll(message)`
Logs out ALL the user's open sessions and returns a promise. Deletes the session and resolves the promise no matter what. The optional `message` will be broadcast with the 'sl:logout' event.

##### `superlogin.validateUsername(username)`
Returns a promise that will resolve if the username is valid and not currently in use, or reject otherwise.

##### `superlogin.validateEmail(email)`
Returns a promise that will resolve if the email is valid and not currently in use, or reject otherwise.

##### `superlogin.getHttp()`
Returns the http (Axios) client with the Authorization preset for you.  
