/**
 *
 * @param svgElement
 * @returns {{type: string, version: number, sketchVersion: number, width: *|string, height: *|string, paths: Array}}
 */
export function getSketchJson (svgElement) {
    let res = {
        type: 'svg',
        version: 1.1,
        sketchVersion: 2,
        width: svgElement.getAttribute('width'),
        height: svgElement.getAttribute('height'),
        paths: []
    }
    if (!svgElement || svgElement.toString() !== '[object SVGSVGElement]') {
        return res
    }

    let length = svgElement.children.length

    if (length) {
        for (let i = 0; length > i; i++) {
            let path = svgElement.children[i]
            res.paths.push({
                d: path.getAttribute('d'),
                s: path.getAttribute('stroke'),
                sw: path.getAttribute('stroke-width')
            })
        }
    }

    return res
}

/**
 *
 * @param event
 * @returns {{x: number, y: number}}
 */
export function getCoordsByEvent (event) {
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

/**
 *
 * @param coords1
 * @param coords2
 * @returns {number}
 */
export function getDistance (coords1, coords2) {
    return Math.sqrt((coords2.x - coords1.x) * (coords2.x - coords1.x) + (coords2.y - coords1.y) * (coords2.y - coords1.y))
}

/**
 *
 * @param coords1
 * @param coords2
 * @returns {string}
 */
export function getDirectionMove (coords1, coords2) {
    let offsetX = Math.abs(coords1.x - coords2.x)
    let offsetY = Math.abs(coords1.y - coords2.y)

    return (offsetX < offsetY) ? 'y' : 'x'
}
