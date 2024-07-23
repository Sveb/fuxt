<template>
    <nuxt-link
        v-if="isRelative || isInternal"
        class="wp-link"
        :to="parsedTo"
    >
        <slot />
    </nuxt-link>

    <a
        v-else-if="to"
        :href="parsedTo"
        :target="parsedTarget"
        class="wp-link"
    >
        <slot />
    </a>

    <component
        :is="element"
        v-else
        class="wp-link"
    >
        <slot />
    </component>
</template>

<script setup>
import { defineProps, computed } from "vue"

const props = defineProps({
    to: {
        type: String,
        default: ""
    },
    target: {
        type: String,
        default: "_self"
    },
    element: {
        type: String,
        default: "span"
    }
})

let isRelative = computed(() => {
    let result = false
    switch (true) {
        case isEmail.value:
            result = false
            break
        case isPhone.value:
            result = false
            break
        case props.target == "_blank":
            // If open in new window, then render an a-tag
            result = false
            break
        case props.to && String(props.to).indexOf(".") === 0:
        case props.to && String(props.to).indexOf("/") === 0:
            // return true if we start with a slash
            result = true
    }
    return result
})

let frontendUrl = computed(() => {
    return $store.state.siteMeta.frontendUrl || false
})

let isInternal = computed(() => {
    // wp-content in url means probably a download link, so open in new window
    if (
        !props.to ||
        props.to?.includes("wp-content") ||
        isEmail.value ||
        isPhone.value
    ) {
        return false
    }
    return props.to.startsWith(frontendUrl.value)
})

let isHashLink = computed(() => {
    return props.to.startsWith("#")
})

let isEmail = computed(() => {
    return props.to.includes("mailto:")
})

let isPhone = computed(() => {
    return props.to.includes("tel:")
})

let parsedTo = computed(() => {
    let url = _unescape(props.to)

    // Replace all these things
    const replaceThese = [
        $store.state.siteMeta?.frontendUrl || "",
        $store.state.siteMeta?.backendUrl || ""
    ]
    replaceThese.forEach((element) => {
        url = url.replace(element, "")
    })

    // Abort for non-local links
    switch (true) {
        case isEmail.value:
        case isPhone.value:
        case url.startsWith("/"):
        case url.startsWith("."):
        case url.startsWith("http"):
            return url
    }

    return `/${url}`
})

let parsedTarget = computed(() => {
    if (!isInternal.value && !isRelative.value && !isHashLink.value) {
        return "_blank"
    } else {
        return props.target
    }
})
</script>
