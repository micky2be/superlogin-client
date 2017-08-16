import {EventEmitter2} from 'eventemitter2';
import {AxiosInstance} from 'axios';

export type Session = {
	expires: number,
	ip: string,
	password: string,
	provider: string,
	roles: string[],
	serverTimeDiff: number,
	token: string,
	userDBs: {[db: string]: string},
	user_id: string
}

export type ConfigurationOptions = {
	serverUrl?: string,
	baseUrl?: string,
	socialUrl?: string,
	endpoints?: string[],
	noDefaultEndpoint?: boolean,
	storage?: string,
	providers?: string[],
	checkExpired?: boolean,
	refreshThreshold?: number,
	timeout?: number,
	local?: {
		usernameField?: string,
		passwordField?: string
	}
}

export interface SuperLoginClient extends EventEmitter2.emitter {
	configure: (options: ConfigurationOptions) => void;
	authenticated: () => boolean;
	authenticate: () => Promise<any>;
	getConfig: () => ConfigurationOptions;
	validateSession: () => void;
	getSession: () => Session;
	setSession: (session: Session) => void;
	deleteSession: () => void;
	getDbUrl: (dbName: string) => string;
	confirmRole: (role: string) => boolean;
	confirmAnyRole: (possibleRoles: string[]) => boolean;
	confirmAllRoles: (requiredRoles: string[]) => boolean;
	refresh: () => void;
	checkRefresh: () => void;
	checkExpired: () => void;
	login: (login: {username: string, password: string}) => Promise<any>;
	register: (register: {username?: string, name?: string, email?: string, password: string, confirmPassword: string, [key: string]: any}) => Promise<any>;
	logout: (message?: string) => Promise<any>;
	logoutAll: (message?: string) => Promise<any>;
	logoutOthers: () => Promise<any>;
	socialAuth: (provider: string) => Promise<any>;
	tokenSocialAuth: (provider: string, accessToken: string) => Promise<any>;
	link: (provider: string) => Promise<any>;
	tokenLink: (provider: string, accessToken: string) => Promise<any>;
	unlink: (provider: string) => Promise<any>;
	verifyEmail: (token: string) => Promise<any>;
	forgotPassword: (email: string) => Promise<any>;
	resetPassword: (reset: {password: string, confirmPassword: string, token: string}) => Promise<any>;
	changePassword: (change: {currentPassword?: string, newPassword: string, confirmPassword: string, token: string}) => Promise<any>;
	changeEmail: (email: string) => Promise<any>;
	validateUsername: (username: string) => Promise<any>;
	validateEmail: (email: string) => Promise<any>;
	getHttp: () => AxiosInstance;
}

export as namespace SuperLogin;
declare const client: SuperLoginClient;
export default client;


