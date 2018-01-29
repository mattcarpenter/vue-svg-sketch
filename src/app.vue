<template>
    <div id="app">
        <label>
            Disabled
            <input v-model="disabled" type="checkbox"/>
        </label>
        <input v-model="size" type="number"/>
        <input v-model="color" type="color" placeholder="color"/>
        <button @click="revert">revert</button>
        <button @click="clean">clean</button>
        <button @click="toJSON">get JSON</button>
<br>
        <textarea v-if="json" readonly v-model="json"></textarea>

        <svg-sketch ref="sketch"
                    :disabled="disabled"
                    :width="800"
                    :height="600"
                    :size="size"
                    :color="color"></svg-sketch>
    </div>
</template>

<script>
    import svgSketch from './components/svg-sketch'

    export default {
        name: 'app',
        components: {
            svgSketch
        },
        data () {
            return {
                disabled: false,
                size: 3,
                color: '#000',
                json: ''
            }
        },
        methods: {
            revert () {
                this.$refs.sketch.revert()
            },
            clean () {
                this.$refs.sketch.clean()
            },
            toJSON () {
                this.json = JSON.stringify(this.$refs.sketch.toJSON())
            }
        }
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
