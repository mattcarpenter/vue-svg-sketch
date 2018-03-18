import {assign} from 'es6-object-assign'
import {getSketchJson, getCoordsByEvent, getDistance, getDirectionMove} from './utils.js'
import defaultOptions from '../default.js'


/**
 *
 */
export default class Sketch {

    constructor (element, options) {
        this.element = element
        this.options = assign({}, defaultOptions, options)

        this._temp = {}

        this.$parent = document.createElement('div')
        this.$svg = this.createSvg(this.options)
        this.is_touch = 'ontouchstart' in document.documentElement

        this.$parent.appendChild(this.$svg)
        element.appendChild(this.$parent)

        this.$parent.classList.add('svg-sketch-wrap')
        this.$parent.style.display = 'inline-block'

        this.listen()

        return this
    }

    /**
     *
     * @returns {Sketch}
     */
    listen () {
        if (this.is_touch) {
            this.element.addEventListener('touchstart', this.beginDraw.bind(this))
            this.element.addEventListener('touchmove', this.drawMove.bind(this))
            document.addEventListener('touchend', this.endDraw.bind(this))
        } else {
            this.element.addEventListener('mousedown', this.beginDraw.bind(this))
            this.element.addEventListener('mousemove', this.drawMove.bind(this))
            document.addEventListener('mouseup', this.endDraw.bind(this))
        }

        return this
    }

    /**
     *
     * @param value
     */
    set strokeWidth (value) {
        this.options.strokeWidth = value
    }

    /**
     *
     * @param value
     */
    set stroke (value) {
        this.options.stroke = value
    }

    /**
     *
     * @param value
     */
    set disabled (value) {
        this.options.disabled = value
    }

    /**
     *
     * @param json
     */
    set sketchJson (json) {
        /* eslint-disable eqeqeq */
        if (json.sketchVersion == 2) {
            this.sketchJsonV3 = json
        } else {
            this.sketchJsonV1 = json
        }
    }

    /**
     *
     * @param json
     */
    set sketchJsonV3 (json) {
        let paths = json.paths || []
        let pathsHTML = ''

        paths.forEach(path => {
            let pathElement = this.createPath({strokeWidth: path.sw, stroke: path.s, d: path.d})
            pathsHTML += pathElement.outerHTML
        })

        this.$svg.innerHTML = pathsHTML
    }

    /**
     *
     * @param json
     */
    set sketchJsonV1 (json) {
        let paths = json.paths || []
        let pathsHTML = ''

        paths.forEach(d => {
            let pathElement = this.createPath({d, strokeWidth: defaultOptions.strokeWidth, stroke: defaultOptions.stroke})
            pathsHTML += pathElement.outerHTML
        })

        this.$svg.innerHTML = pathsHTML
    }

    /**
     *
     * @returns {string}
     */
    get sketchSvg () {
        return this.$svg.outerHTML
    }

    /**
     *
     */
    get sketchJson () {
        return getSketchJson(this.$svg)
    }

    /**
     *
     * @param width
     * @param height
     * @param version
     * @returns {HTMLElement | SVGAElement | SVGCircleElement | SVGClipPathElement | SVGComponentTransferFunctionElement | SVGDefsElement | *}
     */
    createSvg ({width, height, version = 1.1}) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

        svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
        svg.setAttribute('version', version)
        svg.setAttribute('width', width)
        svg.setAttribute('height', height)

        return svg
    }

    /**
     *
     * @param strokeWidth
     * @param stroke
     * @param d
     * @returns {HTMLElement | SVGAElement | SVGCircleElement | SVGClipPathElement | SVGComponentTransferFunctionElement | SVGDefsElement | *}
     */
    createPath ({strokeWidth, stroke, d}) {
        let path = document.createElementNS('http://www.w3.org/2000/svg', 'path')

        path.setAttribute('stroke-width', strokeWidth)
        path.setAttribute('stroke-linecap', 'round')
        path.setAttribute('stroke-linejoin', 'round')
        path.setAttribute('stroke', stroke)
        path.setAttribute('fill', 'none')

        if (d) {
            path.setAttribute('d', d)
        }

        return path
    }

    /**
     *
     */
    setOffset () {
        this._temp.offsetLeft = this.$parent.offsetLeft || 0
        this._temp.offsetTop = this.$parent.offsetTop || 0
    }

    /**
     *
     * @param coords
     * @param holdKey
     * @returns {*}
     */
    getCoordsByShiftKey (coords, holdKey) {
        if (holdKey) {
            this._temp.line = true

            // если начальные координаты лини не заданы
            if (!this._temp.lineStartCoords) {
                this._temp.lineStartCoords = coords
            // если направление линии не определено
            } else if (!this._temp.lineDirection) {
                let dist = getDistance(this._temp.lineStartCoords, coords)
                // если дистанция от начальной точки превышает порог,
                // то получаем направление движения
                if (dist > 10) {
                    this._temp.lineDirection = getDirectionMove(this._temp.lineStartCoords, coords)
                }
            }

            if (this._temp.lineDirection === 'x') {
                coords.y = this._temp.prevCoords.y
            } else if (this._temp.lineDirection === 'y') {
                coords.x = this._temp.prevCoords.x
            }
        } else {
            this._temp.line = false
            this._temp.lineDirection = null
            this._temp.lineStartCoords = null
        }

        return coords
    }

    /**
     *
     * @param event
     */
    beginDraw (event) {
        if (this.options.disabled) {
            return
        }

        if (event.targetTouches) {
            if (event.targetTouches.length > 1) return
            // Блокируем скролл на тач устройствах
            event.preventDefault()
        }

        // Обновляем фосет до получение координат
        this.setOffset()

        this._temp.drawing = true

        let coords = this.getCoords(event)
        coords = this.getCoordsByShiftKey(coords, event.shiftKey)

        this.$path = this.createPath(this.options)
        this.$svg.appendChild(this.$path)

        this._temp.path = `M${coords.x},${coords.y}l0,0`
        this.$path.setAttribute('d', this._temp.path)

        // Сохраняем координаты
        this._temp.prevCoords = coords

        if (typeof this.options.onDrawStart === 'function') {
            this.options.onDrawStart()
        }
    }

    /**
     *
     * @param event
     */
    drawMove (event) {
        if (this.options.disabled || !this._temp.drawing) {
            return
        }

        if (event.targetTouches) {
            if (event.targetTouches.length > 1) return
            // Блокируем скролл на тач устройствах
            event.preventDefault()
        }

        let coords = this.getCoords(event)
        let distance = getDistance(this._temp.prevCoords, coords)

        if (distance > this.options.minDistance) {
            coords = this.getCoordsByShiftKey(coords, event.shiftKey)

            this._temp.path += `l${coords.x - this._temp.prevCoords.x},${coords.y - this._temp.prevCoords.y}`
            this._temp.prevCoords = coords
            this.$path.setAttribute('d', this._temp.path)
        }
    }

    /**
     *
     */
    endDraw () {
        if (this.options.disabled) {
            return
        }
        // Обнуляем временные значения
        this._temp.drawing = false
        this._temp.path = ''
        this._temp.offsetLeft = 0
        this._temp.offsetTop = 0
        this._temp.lineDirection = null
        this._temp.line = false
        this._temp.lineStartCoords = null

        if (typeof this.options.onDrawStop === 'function') {
            this.options.onDrawStop()
        }
    }

    /**
     *
     */
    back () {
        if (this.$svg.children && this.$svg.children.length) {
            this.$svg.children[this.$svg.children.length - 1].remove()
        }
    }

    /**
     *
     */
    clean () {
        if (this.$svg) {
            this.$svg.innerHTML = ''
        }
    }

    /**
     *
     * @param event
     */
    getCoords (event) {
        let coords = getCoordsByEvent(event)
        coords.x -= this._temp.offsetLeft
        coords.y -= this._temp.offsetTop

        return coords
    }

    destroy () {

    }
}
