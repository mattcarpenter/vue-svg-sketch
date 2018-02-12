# vue-svg-sketch

> A Vue.js component [Demo](https://serzz1990.github.io/vue-svg-sketch/)
![Demo](https://s5o.ru/storage/dumpster/e/dc/d5994960cad803c41d8cbf95e60db.png)


## Installation

Install through npm:
```
npm install vue-svg-sketch
```

Available props:

- `disabled` - state disabled (Boolean)
- `width` - svg width (Number)
- `height` - svg height (Number)
- `size` - size brash (Number)[default: 3]
- `color` - color brash [default: 'red']

## Usage

``` vue
<template>
    <div id="app">
        <svg-sketch ref="sketch"
                    :disabled="disabled"
                    :width="800"
                    :height="600"
                    :size="size"
                    :color="color"></svg-sketch>
    </div>
</template>

<script>
    import svgSketch from 'vue-svg-sketch'

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
            getJSON () {
                console.log(this.$refs.sketch.getJSON())
                alert('See console')
            }
        }
    }
</script>
```

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
