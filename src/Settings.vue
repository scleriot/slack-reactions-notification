<template>
<!-- View from https://tailwindcomponents.com/component/account-setting-2 -->
<div class="bg-gray-100 min-h-screen pt-2 font-sans">
    <div class="container mx-auto">
        <div class="inputs w-full max-w-2xl p-6 mx-auto">
            <h2 class="text-2xl text-gray-900">Slack Reactions notification</h2>
            <form class="mt-6 border-t border-gray-400 pt-4 text-base">
                <div class='flex flex-wrap -mx-3 mb-6 divide-y divide-black'>
                    <p class="mb-6">This extension will show notifications when someone reacts with an emoji to your messages on Slack 🥳.</p>
                    <p v-if="!userid">
                        You need to authenticate with Slack, in order for this extension to monitor reactions.<br />Click here to authenticate with Slack:<br />
                        <button @click="authSlack" class="bg-blue-500 rounded-lg font-bold text-white text-center px-4 py-3 transition duration-300 ease-in-out hover:bg-blue-600">Connect with Slack</button><br />
                        <b>Your access token is only stored locally in your browser.</b>
                    </p>
                    <p v-else class="pt-4">
                        Slack user details:
                        <ul class="list-disc pl-8">
                            <li><b>ID:</b> {{ userid }}</li>
                            <li><b>Username:</b> {{ username }}</li>
                        </ul>
                        <button @click="signout" class="bg-blue-500 rounded-lg text-white text-center px-4 py-2 transition duration-300 ease-in-out hover:bg-blue-600">Sign out</button>
                        <br /><br />
                        If you encounter an issue, click here to re-authenticate with Slack:<br />
                        <button @click="authSlack" class="bg-gray-500 rounded-lg text-white text-center px-4 py-2 transition duration-300 ease-in-out hover:bg-gray-600">Re-connect with Slack</button>
                    </p>

                    <p class="mt-12 pt-4">
                        If you like my work, you can buy me a ☕ or 🍺 through <a href="https://lydia-app.com/collect/95344-slack-reaction-notifications/" class="underline" target="_blank">Lydia</a> or rate the extension on the <a href="https://chrome.google.com/webstore/detail/slack-reaction-notificati/fckdljeklojijnbbggpacnphkgflhpda" class="underline" target="_blank">Chrome Web Store</a> ⭐⭐⭐⭐⭐.
                    </p>

                    <p class="mt-20 pt-4">
                        Don't forget that you can pin this extension to your toolbar, in order to see reactions history:
                        <img src="../image-1.png" />
                        <img src="../image-2.png" />
                    </p>
                </div>
            </form>
        </div>
    </div>
</div>
</template>

<script>
import browser from "webextension-polyfill";

export default {
  data() {
    return {
      userid: null,
      username: "",
    };
  },
  async mounted() {
    const {
      "slack-username": username,
      "slack-userid": userid,
    } = await browser.storage.local.get([
      "slack-token",
      "slack-userid",
      "slack-username",
    ]);
    this.userid = userid;
    this.username = username;
    browser.runtime.onMessage.addListener((msg, sender) => {
      if (msg.action === "loggedin") {
        browser.storage.local
          .get(["slack-username", "slack-userid"])
          .then(({ "slack-username": username, "slack-userid": userid }) => {
            this.userid = userid;
            this.username = username;
          });
      }
    });
  },
  methods: {
    authSlack() {
      browser.runtime.sendMessage({ action: "auth" });
    },
    signout() {
      browser.storage.local.set({
        "slack-token": null,
        "slack-userid": null,
        reactions: [],
        reactionsUnread: 0,
      });
      browser.browserAction.setBadgeText({ text: "" });
      this.userid = null;
    },
  },
};
</script>