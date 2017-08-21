## 0.7.2
- Fixed typescript declaration file with the update of eventemitter2 (by @polco)
- Added support of custom field for authentication (by @ThonyFD)

## 0.7.1
- Added removeItem to the memoryStorage

## 0.7.0
- Updated dependencies

## 0.6.1
- Checking refresh using refreshed date (by @peteruithoven)
- Fixed `socialUrl` option being overwritten (by @atoumbre)

## 0.6.0
- Added Session and ConfigurationOptions types (by @polco)

## 0.5.4
- Added a way to specify a different endpoint for social auth/link

## 0.5.3
- Added a custom timeout option to Axios request (by @peteruithoven)

## 0.5.1-0.5.2
- Using url-parse to parse host for better compatibility (by @peteruithoven)
- The username property is also optional in Typescript definition (by @EuAndreh)
- Added a memoryStorage fallback for private browsing

## 0.5.0
- Dispatch better error when authorization popup is blocked (by @casperlamboo)
- Added serverUrl config option - an optional URL to an external API server (by @mnasyrov)
- Fixed an issue with error object and the status property (by @hacorbin)

## 0.4.3
- Skip refresh in register, forgotPassword and resetPassword (by @peteruithoven)
- Delete session on unauthorized refresh (by @peteruithoven)
- Removed es6-promise from Typescript definition to avoid conflict

## 0.4.2
- Handle undefined error response (by @peteruithoven)
- Linter added
- Refresh session with all new data

## 0.4.1
- Updated typescript definition style

## 0.4.0
- Added support for typescript with definition file

## 0.3.1
- Better error catching (by @peteruithoven)

## 0.3.0
- Fixed debug logger
- Prevent double refresh call (by @peteruithoven)

## 0.2.4
- Return the error object in validateEmail and validatePassword (by @juliobetta)


## 0.2.3
- Avoid 401 error on logout

## 0.2.2
- Code refactoring
- Handle network errors properly (by @Mythli)

## 0.2.1
- Readme update
- Fix issue accessing `this` within setInterval (by @staxmanade)

## 0.2.0
- Added `validateSession` to verify session with the server

## 0.1.X
- Fixed window name for social login
- Removed possible typo reference to Angular (by @SukantGujar)
- Returning session on refresh
- No `login` event on configuration by default
- Using Promise to ensure the API call order
- Reject if there is no session
- Promisify checkRefresh
- Transpile on publish
