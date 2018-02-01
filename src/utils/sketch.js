import {assign} from 'es6-object-assign'

const DefaultOptions = {
    width: 300,
    height: 300,
    minDistance: 3,
    strokeWidth: 3,
    stroke: '#ff0028',
    disabled: false
}

export default class Sketch {

    constructor (element, options) {
        this['sketch-version'] = 2

        this.element = element
        this.options = assign({}, DefaultOptions, options)

        this._temp = {}

        this.$parent = document.createElement('div')
        this.$svg = this.createSvg(this.options)
        this.is_touch = 'ontouchstart' in document.documentElement

        this.$parent.appendChild(this.$svg)
        element.appendChild(this.$parent)

        this.$parent.style.display = 'inline-block'

        this.listen()

        return this
    }

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

    set strokeWidth (value) {
        this.options.strokeWidth = value
    }

    set stroke (value) {
        this.options.stroke = value
    }

    set disabled (value) {
        this.options.disabled = value
    }

    get sketchSvg () {
        return this.$svg.outerHTML
    }

    get sketchJson () {
        let res

        if (this.$svg && this.$svg.children && this.$svg.children.length) {
            res = {}
            res.type = 'svg'
            res.version = 1.1
            res.sv = 2
            res.w = this.options.width
            res.h = this.options.height
            res.paths = []

            for (let i = this.$svg.children.length; i--;) {
                res.paths.push({
                    d: this.$svg.children[i].getAttribute('d'),
                    s: this.$svg.children[i].getAttribute('stroke'),
                    sw: this.$svg.children[i].getAttribute('stroke-width')
                })
            }
        }

        return res
    }

    set sketchJson (json) {
        /* eslint-disable eqeqeq */
        if (json.sv == 2) {
            this.sketchJsonV3 = json
        } else {
            this.sketchJsonV1 = json
        }
    }

    set sketchJsonV3 (json) {
        let svg = this.createSvg({width: json.w, height: json.h, version: json.version})
        let paths = json.paths || []
        let pathsHTML = ''

        paths.forEach(path => {
            let pathElement = this.createPath({strokeWidth: path.sw, stroke: path.s, d: path.d})
            pathsHTML += pathElement.outerHTML
        })

        svg.innerHTML = pathsHTML
    }

    set sketchJsonV1 (json) {
        let svg = this.createSvg({width: json.width, height: json.height})
        let paths = json.paths || []
        let pathsHTML = ''

        paths.forEach(d => {
            let pathElement = this.createPath({d, strokeWidth: DefaultOptions.strokeWidth, stroke: DefaultOptions.stroke})
            pathsHTML += pathElement.outerHTML
        })

        svg.innerHTML = pathsHTML
    }

    createSvg ({width, height, version = 1.1}) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

        svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
        svg.setAttribute('version', version)
        svg.setAttribute('width', width)
        svg.setAttribute('height', height)

        return svg
    }

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

    setOffset () {
        this._temp.offsetLeft = this.$parent.offsetLeft || 0
        this._temp.offsetTop = this.$parent.offsetTop || 0
    }

    getCoordsByShiftKey (coords, holdKey) {
        if (holdKey) {
            this._temp.line = true
            this._temp.lineDirection = null

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
    }

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
    }

    back () {
        if (this.$svg.children && this.$svg.children.length) {
            this.$svg.children[this.$svg.children.length - 1].remove()
        }
    }

    clean () {
        if (this.$svg) {
            this.$svg.innerHTML = ''
        }
    }

    getCoords (event) {
        let coords = getCoordsByEvent(event)
        coords.x -= this._temp.offsetLeft
        coords.y -= this._temp.offsetTop

        return coords
    }
}

function getCoordsByEvent (event) {
    let coords = {x: 0, y: 0}

    if (event.changedTouches) {
        coords.x = event.changedTouches[0].pageX
        coords.y = event.changedTouches[0].pageY
    } else {
        coords.x = event.layerX
        coords.y = event.layerY
    }

    return coords
}

function getDistance (coords1, coords2) {
    return Math.sqrt((coords2.x - coords1.x) * (coords2.x - coords1.x) + (coords2.y - coords1.y) * (coords2.y - coords1.y))
}

function getDirectionMove (coords1, coords2) {
    let offsetX = Math.abs(coords1.x - coords2.x)
    let offsetY = Math.abs(coords1.y - coords2.y)

    return (offsetX < offsetY) ? 'y' : 'x'
}
