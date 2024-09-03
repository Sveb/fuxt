<script lang="ts" setup>
import _kebabCase from "lodash/kebabCase"
import { compileToFunctions } from "vue-template-compiler"

import { ref, defineProps, computed, h } from "vue"

const props = defineProps({
    url: {
        type: String,
        required: true,
    },
})

const svgData = ref("")
const hasLoaded = ref(false)
const foundStyles =  ref<string[]>([])
const foundScripts =  ref<string[]>([])

const fetchSvg = async () => {
    // Only try to fetch a SVG
    if (props.url.includes(".svg")) {
        const response = await fetch(props.url)
        svgData.value = await response.text()
    }
    hasLoaded.value = true
}

fetchSvg()

const classes = computed(()=>{
    const classes = [
        "loader-svg",
        `is-orientation-${orientation.value}`,
        `name-${_kebabCase(filename.value)}`,
    ]

    !svg.value && classes.push("is-img")
    svg.value && classes.push("svg is-svg")
    hasLoaded.value && classes.push("has-loaded")

    return classes.join(" ")
})

const svg = computed(()=>{
    // This function is a basic attempt to sanitize the SVG to be Vue ready

    let output = svgData.value

    // Find any style and script tags
    foundStyles.value = output.match(/<style>(.|\n)*?<\/style>/g) || []
    foundScripts.value = output.match(/<script>(.|\n)*?<\/script>/g) || []

    // Remove style/script tags from svg
    foundStyles.value.forEach((tag, i) => {
        output = output.replace(tag, "")
    })
    foundScripts.value.forEach((tag, i) => {
        output = output.replace(tag, "")
    })

    // Remove XML opening tags. Replace with comments that Vue will ignore
    output = output.replace("<?xml", "<!-- ").replace("?>", " -->")

    return output
})

const parsedSvg = computed(()=>{
    // This function is used to add extra things to the SVG

    // Add classes to SVG
    let output = svg.value.replace(
        "<svg",
        `<svg class="${classes.value}" `
    )

    // Add viewBox attr if not already
    if (!output.includes("viewBox")) {
        output = output.replace(
            "<svg",
            `<svg viewBox="0 0 ${parsedWidth.value} ${parsedHeight.value}" `
        )
    }

    // If something hasn't worked, fall back to an IMG tag
    if (!output) {
        output = `<img class="${classes.value}" src="${props.url}"/>`
    }

    return output
})

const parsedStyles = computed(()=>{
    // Get the inner contents of the style tag, ready for Vue Meta. Strip XML comments.
    return foundStyles.value.map((str) => {
        return {
            cssText: str
                .replace("<style>", "")
                .replace("</style>", "")
                .replace("<![CDATA[", "")
                .replace("]]>", ""),
        }
    })
})


const viewBoxDimensions = computed(()=>{
    let val = svg.value.match(/viewBox="([^"]+)"/)
    val = val?.[1]?.split(" ") || []
    
    return {
        width: parseInt(val[2] || ""),
        height: parseInt(val[3] || ""),
    }
})

const parsedHeight = computed(()=>{
    // Get the height from SVG attr
    let height = svg.value.match(/height="([^"]+)"/)
    height = Number(_get(height, "[1]", 100))

    if (viewBoxDimensions.value.height) {
        height = viewBoxDimensions.value.height
    }

    return Math.round(height)
})

const parsedWidth = computed(()=>{
    // Get the width from SVG attr
    let width = svg.value.match(/width="([^"]+)"/)
    width = Number(_get(width, "[1]", 100))

    if (viewBoxDimensions.value.width) {
        width = viewBoxDimensions.value.width
    }

    return Math.round(width)
})

const orientation = computed(()=>{
    let output = "landscape"
    switch (true) {
        case parsedHeight.value > parsedWidth.value:
            output = "portrait"
            break
        case parsedHeight.value == parsedWidth.value:
            output = "square"
            break
    }
    return output
})

const filename = computed(()=>{
    const url = props.url || ""
    return url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."))
})

const fetchKey = (getCounter: (url: string) => number) => {
  return `${props.url}-${getCounter(props.url)}`;
};

fetchKey((url: string) => {
  return url.length;
});

const compiledComponent = computed(() => {
  const compiledFuncs = compileToFunctions(parsedSvg.value);
  return h(compiledFuncs);
});

</script>

<style lang="scss" scoped>
.loader-svg {
    &.has-loaded {
    }
}
</style>