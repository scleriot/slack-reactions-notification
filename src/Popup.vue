<template>
<div class="p-4">
    <div class="flex flex-row-reverse">
        <button @click="clear" v-if="reactions.length > 0" class="bg-blue-500 rounded-lg font-bold text-sm text-white text-center px-4 py-2 transition duration-300 ease-in-out hover:bg-blue-600 ml-3">Clear</button>
        <button @click="settings" class="bg-blue-500 rounded-lg font-bold text-sm text-white text-center px-4 py-2 transition duration-300 ease-in-out hover:bg-blue-600">Settings</button>
    </div>
    <div class="w-full overflow-hidden">
        <transition-group name="list" tag="div" v-if="reactions.length > 0">
            <div
                class="flex flex-row w-full bg-white shadow hover:shadow-md rounded-lg mb-3 list-item cursor-pointer"
                v-for="(r) in reactions"
                :key="r.ts"
                @click="openLink(r.permalink)"
            >
                <div class="flex items-center px-2 py-3">
                    <p
                        class="w-8 h-12 object-cover rounded-full text-2xl"
                    >
                        {{ r.reaction | parseEmoji }}
                    </p>
                    <div class="mx-3">
                        <h2 class="text-sm font-semibold text-gray-800">
                            {{ r.username }} in <template v-if="r.is_im">@{{ r.channel }}</template><template v-else>#{{ r.channel }}</template>
                        </h2>
                        <p class="text-sm text-gray-600 truncate">
                            {{ r.message }}
                        </p>
                    </div>
                </div>
            </div>
        </transition-group>
        <div
                class="flex flex-row w-full bg-white shadow hover:shadow-md rounded-lg mb-3 list-item"
                v-else
            >
                <div class="flex items-center px-2 py-3">
                    <p
                        class="w-8 h-12 object-cover rounded-full text-2xl"
                    >
                        {{ 'shrug' | parseEmoji }}
                    </p>
                    <div class="mx-3">
                        <h2 class="text-sm font-semibold text-gray-800">
                            @Marty in #backtothefuture
                        </h2>
                        <p class="text-sm text-gray-600 truncate">
                            Reactions will show up here
                        </p>
                    </div>
                </div>
            </div>
    </div>
</div>
</template>

<script>
import browser from "webextension-polyfill"
import EmojiConvertor from 'emoji-js'

const emoji = new EmojiConvertor();
emoji.replace_mode = 'unified';
emoji.allow_native = true;

export default {
    data() {
        return {
            reactions: []
        }
    },
    async mounted() {
        const result = await browser.storage.local.get("reactions")
        console.log("results", result)
        if (result.reactions.length === 0) {
            this.settings()
        }
        this.reactions = result.reactions.sort((a,b) => {
            if (a.ts > b.ts) return -1
            if (a.ts < b.ts) return 1
            return 0
        })
        browser.storage.local.set({ 'reactionsUnread': 0 })
        browser.browserAction.setBadgeText({ text: "" })
    },
    methods: {
        clear() {
            browser.storage.local.set({ reactions: [] })
            this.reactions = []
        },
        openLink(link) {
            window.open(link)
        },
        settings() {
            this.openLink(browser.extension.getURL('build/settings.html'))
        }
    },
    filters: {
        parseEmoji(em) {
            if(!em) return ''
            return emoji.replace_colons(':' + em + ':')
        }
    }
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
    transition: all 0.4s;
}
.list-enter, .list-leave-to {
    opacity: 0;
    transform: translateX(20px);
}
.list-move {
  transition: transform 0.4s;
}
</style>
