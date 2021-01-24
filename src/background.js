import axios from 'axios'
const { WebClient } = require('@slack/web-api');
import EmojiConvertor from 'emoji-js'
const browser = require("webextension-polyfill")

window.socketConnected = false;

const emoji = new EmojiConvertor();
emoji.replace_mode = 'unified';
emoji.allow_native = true;

async function notify(message) {
    const notifId = await browser.notifications.create({
        title: 'Slack reaction',
        message: emoji.replace_colons(message),
        type: 'basic',
        iconUrl: chrome.extension.getURL("/icon-16.png")
    })           
    setTimeout(() => {
        browser.notifications.clear(notifId);
    }, 10000)     
}

const initAPI = async function () {
    console.log("Init API")
    const { 'slack-token': token, 'slack-userid': userid } = await browser.storage.local.get(["slack-token", "slack-userid"])
    console.log(token, userid)
    const web = new WebClient(token)
    try {
        const response = await axios.get('https://slack.com/api/rtm.connect?token=' + token, {
        })

        if (response.data.ok) {
            const wssUrl = new URL(response.data.url)
            console.log("wss://" + wssUrl.host, wssUrl.pathname)
            const webSocket = new WebSocket(response.data.url);
            webSocket.onopen = function() {
                window.socketConnected = true
            }
            webSocket.onmessage = async function(data) {
                console.log("event", data);
                const event = JSON.parse(data.data)

                if (event.type === "reaction_added" && event.item.type === "message") {
                    try {
                        const [message, infos, { permalink }] = await Promise.all([web.conversations.history({
                            channel: event.item.channel,
                            latest: event.item.ts,
                            limit: 1,
                            inclusive: true
                        }), web.conversations.info({ channel: event.item.channel }), web.chat.getPermalink({
                            channel: event.item.channel,
                            message_ts: event.item.ts
                        })])
                        console.log(infos)
                        if (message.ok) {
                            if (event.item_user === userid || message.messages[0].text.indexOf(`<@${userid}>`) !== -1) {
                                const user = await web.users.info({ user: event.user })
                                if (user.ok) {
                                    let { reactions, reactionsUnread } = await browser.storage.local.get(["reactions", "reactionsUnread"])
                                    if (!reactions) reactions = []
                                    if (!reactionsUnread) reactionsUnread = 0
                                    reactions.push({
                                        ts: event.event_ts,
                                        username:  user.user.name,
                                        reaction: event.reaction,
                                        message: message.messages[0].text,
                                        permalink,
                                        is_im: infos.channel.is_im,
                                        channel: !infos.channel.is_im ? infos.channel.name : (await web.users.info({ user: infos.channel.user })).user.name
                                    })
                                    browser.storage.local.set({ reactions, 'reactionsUnread': reactionsUnread+1 })
                                    browser.browserAction.setBadgeText({ text: "" + (reactionsUnread+1)})
                                    notify("@" + user.user.name + " :" + event.reaction + ": - " + message.messages[0].text)            
                                }
                            }
                        }
                    } catch (e) {
                        console.error(e)
                    }
                }
            }
            window.onerror = () => {
                console.log("on error")
                window.socketConnected = false
                reconnect()
            }
            webSocket.onclose = () => {
                console.log("on close")
                window.socketConnected = false
                reconnect()
            }
        }
    } catch(err) {
        reconnect()
    }
}

function reconnect() {
    setTimeout(() => {
        if (!window.socketConnected) {
            console.log("Reconnecting")
            initAPI()
        }
    }, 30000)
}

async function auth() {
    try {
        const url = await browser.identity.launchWebAuthFlow({
            interactive: true,
            url: process.env.SLACK_OAUTH_URL + "?callback=" + browser.identity.getRedirectURL()
        })
        console.log(url)

        const location = new URL(url);
        const web = new WebClient(location.searchParams.get("token"))
        await browser.storage.local.set({
            "slack-token": location.searchParams.get("token"),
            "slack-userid": location.searchParams.get("userid"),
            "slack-username": (await web.users.info({ user: location.searchParams.get("userid") })).user.name
        })
        initAPI()
        notify("🥳 Extension is now ready!")
        browser.runtime.sendMessage({ action: "loggedin" })
    } catch(error) {
        console.error(error)
    }
}

(async function(){
    browser.runtime.onMessage.addListener((msg, sender) => {
        if (msg.action === "auth") {
            auth()
        }
    })

    const { 'slack-token': token, 'slack-userid': userid } = await browser.storage.local.get(["slack-token", "slack-userid"])
    if(!token || !userid) {
        browser.tabs.create({
            url: browser.extension.getURL('build/settings.html')
        })
    } else {
        console.log("No need for auth")
        initAPI()
    }
})()
