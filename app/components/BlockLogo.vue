<template lang='html'>
    <div class='block-logo'>
        <loader-svg :url="logo"/>
    </div>
</template>



<script lang="ts" setup>
const props = defineProps({
    logo: {
        type: String,
        required: true,
    },
})
</script>

<style lang='scss'scoped>
    .block-logo {

        width: 100px;
        height: 100px;
    }
</style>