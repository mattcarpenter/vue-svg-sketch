import {assign} from 'es6-object-assign'

const DefaultOptions = {
    width: 300,
    height: 300,
    minDistance: 3,
    size: 3,
    color: '#ff0028',
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

    set size (value) {
        this.options.size = value
    }

    set color (value) {
        this.options.color = value
    }

    set disabled (value) {
        this.options.disabled = value
    }

    createSvg (options = {}) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

        svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
        svg.setAttribute('version', '1.1')
        svg.setAttribute('width', options.width)
        svg.setAttribute('height', options.height)

        return svg
    }

    createPath (options) {
        let path = document.createElementNS('http://www.w3.org/2000/svg', 'path')

        path.setAttribute('stroke-width', options.size)
        path.setAttribute('stroke-linecap', 'round')
        path.setAttribute('stroke-linejoin', 'round')
        path.setAttribute('stroke', options.color)
        path.setAttribute('fill', 'none')

        if (options.d) {
            path.setAttribute('d', options.d)
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

    revert () {
        if (this.$svg.children && this.$svg.children.length) {
            this.$svg.children[this.$svg.children.length - 1].remove()
        }
    }

    sketchToJSON () {
        let res

        if (this.$svg && this.$svg.children && this.$svg.children.length) {
            res = {}
            res.type = 'svg'
            res.version = '3.0'
            res['sketch-version'] = this['sketch-version']
            res.width = this.options.width
            res.height = this.options.height
            res.paths = []

            for (let i = this.$svg.children.length; i--;) {
                res.paths.push(this.$svg.children[i].getAttribute('d'))
            }
        }

        return res
    }

    getSketchSVG (string) {
        try {
            let data = JSON.parse(string)
            let options = assign({}, DefaultOptions, {
                width: data.width,
                height: data.height
            })

            let svg = this.createSvg(options)
            let paths = data.paths || []

            paths.forEach(d => {
                options.d = d
                svg.appendChild(this.createPath(options))
            })
            return svg
        } catch (e) {
            return this.createSvg()
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
