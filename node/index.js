require('dotenv').config()
const express = require('express')
const app = express()

const credentials = {
    client: {
        id: process.env.SLACK_CLIENT_ID,
        secret: process.env.SLACK_CLIENT_SECRET
    },
    auth: {
        authorizeHost: 'https://slack.com',
        authorizePath: '/oauth/authorize',
        tokenHost: 'https://slack.com',
        tokenPath: '/api/oauth.access'
    }
};

const oauth2 = require('simple-oauth2').create(credentials);

app.get('/', function (req, res) {
    const authorizationUri = oauth2.authorizationCode.authorizeURL({
        redirect_uri: process.env.SLACK_REDIRECT_URI,
        scope: 'client',
        state: req.query.callback
    });

    res.redirect(authorizationUri);
})

app.get('/callback', async function (req, res) {
    const code = req.query.code
    console.log("callback", req.query.state)
    if (code) {
        const tokenConfig = {
            code,
            redirect_uri: process.env.SLACK_REDIRECT_URI,
            scope: 'client',
        };

        try {
            const result = await oauth2.authorizationCode.getToken(tokenConfig);
            const accessToken = oauth2.accessToken.create(result);
            res.redirect(`${req.query.state}?token=${accessToken.token.access_token}&userid=${accessToken.token.user_id}&team=${accessToken.token.team_name}`)
        } catch (error) {
            console.log('Access Token Error', error.message);
            res.sendStatus(500)
        }
    } else {
        res.sendStatus(500)
    }
})

app.listen(4242, function () {
    console.log('App listening on port 4242!')
})