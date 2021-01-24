# Slack Reaction Notification

🥳 Get desktop notifications for Slack emoji reactions

Install the browser extension, you'll be prompted to login with your Slack account.
Everytime someone will react to one of your message, you'll get a short notification.

TODO:
- [ ] Add a mute option
- [ ] Configurable notification time

## Use your own Slack application

If for privacy reason you want to use your own Slack application, you'll need to:
* create a classic app (in order to use the RTM API)
* deployed a small Node.js server to initiate OAuth2 authentication
* build the electron app

### 1. Create your Slack app 

Follow this link to create your app: https://api.slack.com/apps?new_classic_app=1

In the OAuth section, set the Redirect URLs to:
* http://localhost:4242/callback (for development purposes)
* https://YOUR_DOMAIN/callback (your small node production server)

Set the following scopes:
* channels:history
* channels:read
* reactions:read
* users.profile:read

### 2. Deploy the Node.js server

Node.js server code is located in the *node/* folder.
Deploy the app, and create a .env file in the node/ folder with your app credentials:
```
SLACK_CLIENT_ID=***
SLACK_CLIENT_SECRET=***
SLACK_REDIRECT_URI=http://***/callback
```

### 3. Build the web extension

Create a .env file at the root of the project with the Node server URI:
```
SLACK_OAUTH_URL=http://localhost:4242
```

Run `npm run build` to build the extension.
