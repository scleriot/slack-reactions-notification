<template>
<!-- View from https://tailwindcomponents.com/component/account-setting-2 -->
<div class="bg-gray-200 min-h-screen pt-2 font-sans">
    <div class="container mx-auto">
        <div class="inputs w-full max-w-2xl p-6 mx-auto">
            <h2 class="text-2xl text-gray-900">Slack Reactions notification</h2>
            <form class="mt-6 border-t border-gray-400 pt-4">
                <div class='flex flex-wrap -mx-3 mb-6'>
                    <p v-if="!userid">
                        Click here to authenticate with Slack:<br />
                        <button @click="authSlack" class="bg-blue-500 rounded-lg font-bold text-white text-center px-4 py-3 transition duration-300 ease-in-out hover:bg-blue-600">Connect with Slack</button><br />
                        <b>Your access token is only stored locally in your browser.</b>
                    </p>
                    <p v-else>
                        Slack user details:
                        <ul class="list-disc pl-8">
                            <li><b>ID:</b> {{ userid }}</li>
                            <li><b>Username:</b> {{ username }}</li>
                        </ul>
                        <button @click="signout" class="bg-blue-500 rounded-lg font-bold text-white text-center px-4 py-3 transition duration-300 ease-in-out hover:bg-blue-600">Sign out</button>
                        <br /><br />
                        If you encounter an issue, click here to re-authenticate with Slack:<br />
                        <button @click="authSlack" class="bg-blue-500 rounded-lg font-bold text-white text-center px-4 py-3 transition duration-300 ease-in-out hover:bg-blue-600">Connect with Slack</button>
                    </p>
                </div>
            </form>
        </div>
    </div>
</div>
</template>

<script>
import browser from "webextension-polyfill"

export default {
    data() {
        return {
            userid: null,
            username: ''
        }
    },
    async mounted() {
        const { 'slack-username': username, 'slack-userid': userid } = await browser.storage.local.get(["slack-token", "slack-userid", "slack-username"])
        this.userid = userid
        this.username = username
        browser.runtime.onMessage.addListener((msg, sender) => {
            if(msg.action === "loggedin") {
                browser.storage.local.get(["slack-username", "slack-userid"]).then(({ 'slack-username': username, 'slack-userid': userid }) => {
                    this.userid = userid
                    this.username = username
                })
            }
        })
    },
    methods: {
        authSlack() {
            browser.runtime.sendMessage({ action: "auth" })
        },
        signout() {
            browser.storage.local.set({
                "slack-token": null,
                "slack-userid": null,
                reactions: [],
                reactionsUnread: 0
            })
            browser.browserAction.setBadgeText({ text: "" })
            this.userid = null
        }
    }
}
</script>