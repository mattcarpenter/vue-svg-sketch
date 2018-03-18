<template>
    <div class="svg-sketch" :class="{'is-disabled': disabled}"></div>
</template>

<script>
    import Sketch from '@/utils/sketch.js'

    export default {
        name: 'svg-sketch',
        props: {
            /**
             *
             */
            disabled: Boolean,
            /**
             *
             */

            size: {
                type: [String, Number],
                default: 3
            },

            /**
             *
             */
            color: {
                type: String,
                default: 'red'
            },

            /**
             *
             */
            width: {
                type: [String, Number],
                default: 300
            },

            /**
             *
             */
            height: {
                type: [String, Number],
                default: 300
            }
        },
        data () {
            return {
                /**
                 *
                 */
                sketch: null
            }
        },
        mounted () {
            this.sketch = new Sketch(this.$el, {
                width: this.width,
                height: this.height,
                stroke: this.color,
                strokeWidth: this.size,
                onDrawStart: () => {
                    this.$emit('draw-start')
                },
                onDrawStop: () => {
                    this.$emit('draw-stop')
                }
            })
        },
        methods: {
            /**
             *
             */
            revert () {
                this.sketch.back()
            },

            /**
             *
             */
            clean () {
                this.sketch.clean()
            },

            /**
             *
             * @returns {*}
             */
            getJSON () {
                return this.sketch.sketchJson
            },

            /**
             *
             * @returns {*}
             */
            setJSON (json) {
                this.sketch.sketchJson = json
            }
        },
        watch: {
            /**
             *
             * @param value
             */
            disabled (value) {
                this.sketch.disabled = value
            },

            /**
             *
             * @param value
             */
            size (value) {
                this.sketch.strokeWidth = value
            },

            /**
             *
             * @param value
             */
            color (value) {
                this.sketch.stroke = value
            }
        },
        beforeDestroy () {
            this.sketch.destroy()
        }
    }
</script>
