// Here is a tour of all the available configuration options:
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
  // Sets when to check if the session is expired. 'stateChange', 'startup' or nothing.
  // 'stateChange' checks every time $stateChangeStart or $routeChangeStart is fired
  // 'startup' checks just on app startup. If this is blank it will never check.
  checkExpired: 'stateChange',
  // A float that determines the percentage of a session duration, after which SuperLogin will automatically refresh the
  // token. For example if a token was issued at 1pm and expires at 2pm, and the threshold is 0.5, the token will
  // automatically refresh after 1:30pm. When authenticated, the token expiration is automatically checked on every
  // request. You can do this manually by calling superlogin.checkRefresh(). Default: 0.5
  refreshThreshold: 0.5
};