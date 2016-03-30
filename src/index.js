import axios from 'axios';
import { EventEmitter } from 'events';

// Capitalizes the first letter of a string
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function checkEndpoint(url, endpoints) {
	const parser = window.document.createElement('a');
	parser.href = url;
	for (let i = 0; i < endpoints.length; i++) {
		if (parser.host === endpoints[i]) {
			return true;
		}
	}
	return false;
}

class Superlogin extends EventEmitter {
	constructor() {
		super();

		this._oauthComplete = false;
		this._config = {};
		this._refreshCB = this.refresh;
		this.refreshInProgress = false;
		this._http = axios.create();
	}

	configure(config = {}) {
		config.baseUrl = config.baseUrl || '/auth/';
		if (!config.endpoints || !(config.endpoints instanceof Array)) {
			config.endpoints = [];
		}
		if (!config.noDefaultEndpoint) {
			config.endpoints.push(window.location.host);
		}
		config.providers = config.providers || [];

		if (config.storage === 'session') {
			this.storage = window.sessionStorage;
		} else {
			this.storage = window.localStorage;
		}

		this._config = config;

		// Setup the new session
		this._session = JSON.parse(this.storage.getItem('superlogin.session'));
		if (this._session) {
			this._onLogin(this._session);
		}

		this._httpInterceptor();

		// Check expired
		this.checkExpired();
	}

	_httpInterceptor() {
		const request = req => {
			const config = this.getConfig();
			const session = this.getSession();
			if (session && session.token) {
				this.checkRefresh();
			}

			if (checkEndpoint(req.url, config.endpoints)) {
				if (session && session.token) {
					req.headers.Authorization = 'Bearer ' + session.token + ':' + session.password;
				}
			}
			return req;
		};

		const responseError = response => {
			const config = this.getConfig();
			// If there is an unauthorized error from one of our endpoints and we are logged in...
			if (checkEndpoint(response.config.url, config.endpoints) && response.status === 401 && this.authenticated()) {
				this.deleteSession();
				this._onLogout('Session expired');
			}
			return Promise.reject(response);
		};

		this._http.interceptors.request.use(request.bind(this));
		this._http.interceptors.response.use(null, responseError.bind(this));
	}

	onRefresh(cb) {
		this._refreshCB = cb;
	}

	authenticated() {
		return !!(this._session && this._session.user_id);
	}

	getConfig() {
		return this._config;
	}

	getSession() {
		return this._session || JSON.parse(this.storage.getItem('superlogin.session'));
	}

	setSession(session) {
		this._session = session;
		this.storage.setItem('superlogin.session', JSON.stringify(this._session));
	}

	deleteSession() {
		this.storage.removeItem('superlogin.session');
		this._session = null;
	}

	getDbUrl(dbName) {
		if (this._session.userDBs && this._session.userDBs[dbName]) {
			return this._session.userDBs[dbName];
		}
		return null;
	}

	getHttp() {
		return this._http;
	}

	confirmRole(role) {
		if (!this._session || !this._session.roles || !this._session.roles.length) return false;
		return this._session.roles.indexOf(role) !== -1;
	}

	confirmAnyRole(roles) {
		if (!this._session || !this._session.roles || !this._session.roles.length) return false;
		for (let i = 0; i < roles.length; i++) {
			if (this._session.roles.indexOf(roles[i]) !== -1) return true;
		}
	}

	confirmAllRoles(roles) {
		if (!this._session || !this._session.roles || !this._session.roles.length) return false;
		for (let i = 0; i < roles.length; i++) {
			if (this._session.roles.indexOf(roles[i]) === -1) return false;
		}
		return true;
	}

	checkRefresh() {
		// Get out if we are not authenticated or a refresh is already in progress
		if (this._refreshInProgress || (!this._session || !this._session.user_id)) {
			return;
		}
		const issued = this._session.issued;
		const expires = this._session.expires;
		const threshold = this._config.refreshThreshold || 0.5;
		const duration = expires - issued;
		let timeDiff = this._session.serverTimeDiff || 0;
		if (Math.abs(timeDiff) < 5000) {
			timeDiff = 0;
		}
		const estimatedServerTime = Date.now() + timeDiff;
		const elapsed = estimatedServerTime - issued;
		const ratio = elapsed / duration;
		if ((ratio > threshold) && (typeof _refreshCB === 'function')) {
			this._refreshInProgress = true;
			this._refreshCB()
				.then(function () {
					this._refreshInProgress = false;
				}, function () {
					this._refreshInProgress = false;
				});
		}
	}

	checkExpired() {
		// This is not necessary if we are not authenticated
		if (!this._session || !this._session.user_id) {
			return;
		}
		const expires = this._session.expires;
		let timeDiff = this._session.serverTimeDiff || 0;
		// Only compensate for time difference if it is greater than 5 seconds
		if (Math.abs(timeDiff) < 5000) {
			timeDiff = 0;
		}
		const estimatedServerTime = Date.now() + timeDiff;
		if (estimatedServerTime > expires) {
			this.deleteSession();
			this._onLogout('Session expired');
		}
	}

	refresh() {
		const session = this.getSession();
		return this._http.post(this._config.baseUrl + 'refresh', {})
			.then(res => {
				if (res.data.token && res.data.expires) {
					session.expires = res.data.expires;
					session.token = res.data.token;
					this.setSession(session);
					this._onRefresh(session);
					return session;
				}
			})
			.catch(err => {
				throw err.data;
			});
	}

	authenticate() {
		return new Promise(resolve => {
			const session = this.getSession();
			if (session) {
				resolve(session);
			} else {
				this.on('sl:login', function (newSession) {
					resolve(newSession);
				});
			}
		});
	}

	login(credentials) {
		if (!credentials.username || !credentials.password) {
			return Promise.reject({ error: 'Username or Password missing...' });
		}
		return this._http.post(this._config.baseUrl + 'login', credentials)
			.then(res => {
				res.data.serverTimeDiff = res.data.issued - Date.now();
				this.setSession(res.data);
				this._onLogin(res.data);
				return res.data;
			})
			.catch(err => {
				this.deleteSession();
				throw err.data;
			});
	}

	register(registration) {
		return this._http.post(this._config.baseUrl + 'register', registration)
			.then(res => {
				if (res.data.user_id && res.data.token) {
					res.data.serverTimeDiff = res.data.issued - Date.now();
					this.setSession(res.data);
					this._onLogin(res.data);
				}
				return res.data;
			})
			.catch(err => {
				throw err.data;
			});
	}

	logout(msg) {
		return this._http.post(this._config.baseUrl + 'logout', {})
			.then(res => {
				this.deleteSession();
				this._onLogout(msg || 'Logged out');
				return res.data;
			})
			.catch(err => {
				this.deleteSession();
				this._onLogout(msg || 'Logged out');
				throw err.data;
			});
	}

	logoutAll(msg) {
		return this._http.post(this._config.baseUrl + 'logout-all', {})
			.then(res => {
				this.deleteSession();
				this._onLogout(msg || 'Logged out');
				return res.data;
			})
			.catch(err => {
				this.deleteSession();
				this._onLogout(msg || 'Logged out');
				return err.data;
			});
	}

	logoutOthers() {
		return this._http.post(this._config.baseUrl + 'logout-others', {})
			.then(res => res.data)
			.catch(err => {
				throw err.data;
			});
	}

	socialAuth(provider) {
		const providers = this._config.providers;
		if (providers.indexOf(provider) === -1) {
			return Promise.reject({ error: `Provider ${provider} not supported.` });
		}
		const url = this._config.baseUrl + provider;
		return this._oAuthPopup(url, { windowTitle: 'Login with ' + capitalizeFirstLetter(provider) });
	}

	tokenSocialAuth(provider, accessToken) {
		const providers = this._config.providers;
		if (providers.indexOf(provider) === -1) {
			return Promise.reject({ error: `Provider ${provider} not supported.` });
		}
		return this._http.post(this._config.baseUrl + provider + '/token', { access_token: accessToken })
			.then(function (res) {
				if (res.data.user_id && res.data.token) {
					res.data.serverTimeDiff = res.data.issued - Date.now();
					this.setSession(res.data);
					this._onLogin(res.data);
				}
				return res.data;
			})
			.catch(err => {
				throw err.data;
			});
	}

	tokenLink(provider, accessToken) {
		const providers = this._config.providers;
		if (providers.indexOf(provider) === -1) {
			return Promise.reject({ error: `Provider ${provider} not supported.` });
		}
		const linkURL = `${this._config.baseUrl}link/${provider}/token`;
		return this._http.post(linkURL, { access_token: accessToken })
			.then(res => res.data)
			.catch(err => {
				throw err.data;
			});
	}

	link(provider) {
		const providers = this._config.providers;
		if (providers.indexOf(provider) === -1) {
			return Promise.reject({ error: `Provider ${provider} not supported.` });
		}
		if (this.authenticated()) {
			const session = this.getSession();
			const baseUrl = this._config.baseUrl;
			const linkURL = `${baseUrl}link/${provider}?bearer_token=${session.token}:${session.password}`;
			return this._oAuthPopup(linkURL, { windowTitle: 'Link your account to ' + capitalizeFirstLetter(provider) });
		}
		return Promise.reject({ error: 'Authentication required' });
	}

	unlink(provider) {
		const providers = this._config.providers;
		if (providers.indexOf(provider) === -1) {
			return Promise.reject({ error: `Provider ${provider} not supported.` });
		}
		if (this.authenticated()) {
			return this._http.post(this._config.baseUrl + 'unlink/' + provider)
				.then(res => res.data)
				.catch(err => {
					throw err.data;
				});
		}
		return Promise.reject({ error: 'Authentication required' });
	}

	verifyEmail(token) {
		if (!token || typeof token !== 'string') {
			return Promise.reject({ error: 'Invalid token' });
		}
		return this._http.get(this._config.baseUrl + 'verify-email/' + token)
			.then(res => res.data)
			.catch(err => {
				throw err.data;
			});
	}

	forgotPassword(email) {
		return this._http.post(this._config.baseUrl + 'forgot-password', { email: email })
			.then(res => res.data)
			.catch(err => {
				throw err.data;
			});
	}

	resetPassword(form) {
		return this._http.post(this._config.baseUrl + 'password-reset', form)
			.then(res => {
				if (res.data.user_id && res.data.token) {
					this.setSession(res.data);
					this._onLogin(res.data);
				}
				return res.data;
			})
			.catch(err => {
				throw err.data;
			});
	}

	changePassword(form) {
		if (this.authenticated()) {
			return this._http.post(this._config.baseUrl + 'password-change', form)
				.then(res => res.data)
				.catch(err => {
					throw err.data;
				});
		}
		return Promise.reject({ error: 'Authentication required' });
	}

	changeEmail(newEmail) {
		if (this.authenticated()) {
			return this._http.post(this._config.baseUrl + 'change-email', { newEmail: newEmail })
				.then(res => res.data)
				.catch(err => {
					throw err.data;
				});
		}
		return Promise.reject({ error: 'Authentication required' });
	}

	validateUsername(username) {
		return this._http.get(this._config.baseUrl + 'validate-username/' + encodeURIComponent(username))
			.then(() => true)
			.catch(function (err) {
				if (err.status === 409) {
					return Promise.reject(false);
				}
				throw err.data;
			});
	}

	validateEmail(email) {
		return this._http.get(this._config.baseUrl + 'validate-email/' + encodeURIComponent(email))
			.then(() => true)
			.catch(err => {
				if (err.status === 409) {
					return Promise.reject(false);
				}
				throw err.data;
			});
	}

	_oAuthPopup(url, options) {
		return new Promise((resolve, reject) => {
			this._oauthComplete = false;
			options.windowName = options.windowName ||	'Social Login';
			options.windowOptions = options.windowOptions || 'location=0,status=0,width=800,height=600';
			const _oauthWindow = window.open(url, options.windowName, options.windowOptions);
			const _oauthInterval = setInterval(function () {
				if (_oauthWindow.closed) {
					clearInterval(_oauthInterval);
					if (!this._oauthComplete) {
						this.authComplete = true;
						return reject({ error: 'Authorization cancelled' });
					}
				}
			}, 500);

			window.superlogin = {};
			window.superlogin.oauthSession = (error, session, link) => {
				if (!error && session) {
					session.serverTimeDiff = session.issued - Date.now();
					this.setSession(session);
					this._onLogin(session);
					return resolve(session);
				} else if (!error && link) {
					this._onLink(link);
					return resolve(capitalizeFirstLetter(link) + ' successfully linked.');
				}
				this._oauthComplete = true;
				return reject(error);
			};
		});
	}

	_onLogin(msg) {
		this.emit('login', msg);
	}

	_onLogout(msg) {
		this.emit('logout', msg);
	}

	_onLink(msg) {
		this.emit('link', msg);
	}

	_onRefresh(msg) {
		this.emit('refresh', msg);
	}
}


export default new Superlogin();
