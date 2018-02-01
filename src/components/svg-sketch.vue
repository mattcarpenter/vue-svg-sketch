<template>
    <div class="svg-sketch"></div>
</template>

<script>
    import Sketch from '@/utils/sketch.js'

    export default {
        name: 'svg-sketch',
        props: {
            disabled: Boolean,
            size: {
                type: [String, Number],
                default: 3
            },
            color: {
                type: String,
                default: 'red'
            },
            width: {
                type: [String, Number],
                default: 300
            },
            height: {
                type: [String, Number],
                default: 300
            }
        },
        data () {
            return {
                sketch: null
            }
        },
        mounted () {
            this.sketch = new Sketch(this.$el, {
                width: this.width,
                height: this.height,
                stroke: this.color,
                strokeWidth: this.size
            })
        },
        methods: {
            revert () {
                this.sketch.back()
            },
            clean () {
                this.sketch.clean()
            },
            toJSON () {
                return this.sketch.sketchJson
            }
        },
        watch: {
            disabled (value) {
                this.sketch.disabled = value
            },
            size (value) {
                this.sketch.strokeWidth = value
            },
            color (value) {
                this.sketch.stroke = value
            }
        }
    }
</script>

<style scoped>

</style>
