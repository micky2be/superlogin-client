## Next
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
