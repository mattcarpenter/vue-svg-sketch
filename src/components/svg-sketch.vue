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
                color: this.color,
                size: this.size
            })
        },
        methods: {
            revert () {
                this.sketch.revert()
            },
            clean () {
                this.sketch.clean()
            },
            toJSON () {
                return this.sketch.sketchToJSON()
            }
        },
        watch: {
            disabled (value) {
                this.sketch.disabled = value
            },
            size (value) {
                this.sketch.size = value
            },
            color (value) {
                this.sketch.color = value
            }
        }
    }
</script>

<style scoped>

</style>
