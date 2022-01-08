let unit_circle_center, radius
let pickedPoint
let points = []
const CANVAS_SIZE = 500
const s = (p5_inst) => {
    p5_inst.setup = function () {
        p5.disableFriendlyErrors = true;
        p5_inst.createCanvas(CANVAS_SIZE, CANVAS_SIZE)
        radius = CANVAS_SIZE / 2.1
        unit_circle_center = p5_inst.createVector(
            CANVAS_SIZE / 2,
            CANVAS_SIZE / 2
        )
        right = p5_inst.createVector(radius, 0)
        left = p5_inst.createVector(-radius, 0)
        down = p5_inst.createVector(0, radius)
        up = p5_inst.createVector(0, -radius)
        NONE_PICKED = { p: p5_inst.createVector(0, 0) }
        pickedPoint = NONE_PICKED
        p5_inst.noLoop()
    }

    p5_inst.draw = function () {
        console.log('drawn')
        p5_inst.clear()
        drawUnitCricle()
        drawPoints()
    }

    function drawPoints() {
        points.forEach((point) => {
            point == pickedPoint
                ? point.draw(undefined, undefined, (picked = true))
                : point.draw()
        })
    }

    function drawUnitCricle() {
        p5_inst.background('#fff')
        p5_inst.stroke(255)
        p5_inst.fill('#000')
        p5_inst.circle(unit_circle_center.x, unit_circle_center.y, radius * 2)
        drawArrow(unit_circle_center, right, '#fff')
        drawArrow(unit_circle_center, left, '#fff')
        drawArrow(unit_circle_center, up, '#ffee6e')
        drawArrow(unit_circle_center, down, '#ffee6e')
    }

    p5_inst.mouseReleased = function () {
        p5_inst.noLoop()
    }

    p5_inst.mouseClicked = function () {
        console.log('clicked some where')
        let p = p5_inst.createVector(p5_inst.mouseX, p5_inst.mouseY)
        if (isInsideCircle(p)) {
            let foundPoint = therePoint(p)
            if (foundPoint) {
                pickedPoint = foundPoint
                console.log('picked point found')
            } else addPoint(p)
            p5_inst.redraw()
        } else if (pickedPoint != NONE_PICKED) {
            pickedPoint = NONE_PICKED
            p5_inst.redraw()
        }
        return false
    }

    p5_inst.doubleClicked = function () {
        points = []
        p5_inst.redraw()
    }
    p5_inst.mouseDragged = function () {
        let p = p5_inst.createVector(p5_inst.mouseX, p5_inst.mouseY)
        if (pickedPoint != NONE_PICKED && isInsideCircle(p)) {
            pickedPoint.center = p
        }
        p5_inst.redraw()
    }

    function drawArrow(base, vec, myColor) {
        let arrowSize = 7
        p5_inst.push()
        p5_inst.stroke(myColor)
        p5_inst.strokeWeight(2)
        p5_inst.fill(myColor)
        p5_inst.translate(base.x, base.y)
        p5_inst.line(0, 0, vec.x, vec.y)
        p5_inst.rotate(vec.heading())
        p5_inst.translate(vec.mag() - arrowSize, 0)
        p5_inst.triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0)
        p5_inst.pop()
    }

    function therePoint(p, error = 10) {
        for (let point of points) {
            if (p.dist(point.center) < 5 + (5 * error) / 100) {
                return point
            }
        }
        return null
    }

    function isInsideCircle(p) {
        return p.dist(unit_circle_center) < radius
    }

    function addPoint(p) {
        let zero = new Zero(p, unit_circle_center)
        points.push(zero)
        points.push(zero.getConjugate())
        pickedPoint = NONE_PICKED
    }

    function cross( center, size = 10, fill = '#fff', weight = 2, stroke = '#fff') {
        const lines = {
            top_right: p5_inst.createVector(size / 2, -size / 2),
            top_left: p5_inst.createVector(-size / 2, -size / 2),
            down_left: p5_inst.createVector(-size / 2, size / 2),
            down_right: p5_inst.createVector(size / 2, size / 2),
        }
        p5_inst.push()
        p5_inst.stroke(stroke)
        p5_inst.strokeWeight(weight)
        p5_inst.fill(fill)
        p5_inst.translate(center.x, center.y)
        for (const key in lines) {
            p5_inst.line(0, 0, lines[key].x, lines[key].y)
        }
        p5_inst.pop()
    }
    class Point {
        constructor(center, origin) {
            this.center = center
            this.origin = origin
        }

        getRelativeX(x_max) {
            return (this.center.x - this.origin.x) / x_max
        }

        getRelativeY(y_max) {
            return (this.center.y - this.origin.y) / y_max
        }

        getConjugate() {
            let conjugate_center = p5_inst.createVector(
                this.center.x,
                this.origin.y - this.getRelativeY(1)
            )
            return new Point(conjugate_center, this.origin)
        }

        hash(){
            return `${this.center.x}${this.center.y}`
        }
    }

    class Zero extends Point {
        constructor(center, origin) {
            super(center, origin)
        }

        draw(size = 8, fill = '#ffb939', picked = false) {
            console.log(picked)
            p5_inst.push()
            if (picked) fill = '#645ffb'
            p5_inst.fill(fill)
            p5_inst.circle(this.center.x, this.center.y, size)
            p5_inst.pop()
        }

        getConjugate() {
            let p = super.getConjugate()
            return new Zero(p.center, p.origin)
        }
    }

    class Pole extends Point {
        constructor(center, origin) {
            super(center, origin)
        }

        draw(size = 8, fill = '#fff939', picked = false) {
            picked
                ? cross(this.center, size, fill, 2, '#645ffb')
                : cross(this.center, size, fill)
        }

        getConjugate() {
            let p = super.getConjugate()
            return new Pole(p.center, p.origin)
        }
    }
}
let myp5 = new p5(s, 'canvas_component')
