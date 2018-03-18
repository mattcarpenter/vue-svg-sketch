<template>
    <div id="app">
        <div class="sketch-panel">
            <label>Disabled<input v-model="disabled" type="checkbox"/></label>
            <input v-model="size" type="number"/>
            <input v-model="color" type="color" placeholder="color"/>
            <button @click="revert">revert</button>
            <button @click="clean">clean</button>
            <button @click="save">save</button>
        </div>

        <svg-sketch ref="sketch"
                    @draw-start="onDrawStart"
                    @draw-stop="onDrawStop"
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
            save () {
                let str = JSON.stringify(this.$refs.sketch.getJSON())
                localStorage.setItem('vue-svg-sketch', str)
            },
            onDrawStart () {
                console.log('onDrawStart')
            },
            onDrawStop () {
                console.log('onDrawStop')
            }
        },
        mounted () {
            let str = localStorage.getItem('vue-svg-sketch')
            if (str) {
                let json = JSON.parse(str)
                this.$refs.sketch.setJSON(json)
            }
        }
    }
</script>


<style>
    body {
        background: #27103e;
    }
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        padding-top: 100px;
    }

    .sketch-panel {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        width: 80%;
        max-width: 700px;
        margin: 0 auto;
        height: 25px;
        display: flex;
        background: #403a46;
        padding: 15px 35px;
        border-radius: 0 0 10px 10px;
        color: #fff;
        justify-content: space-between;
    }
    .svg-sketch {
        max-width: 1000px;
        margin: 0 auto;
        box-shadow: rgba(0, 0, 0, 0.1) 0 0 10px;
        background: #fff;
    }

    .svg-sketch-wrap,
    .svg-sketch svg {
        width: 100%;
    }
</style>
