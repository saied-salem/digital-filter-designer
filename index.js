let center, radius
let pickedPoint
let points = []
const CANVAS_SIZE = 500
const s = (p5_inst) => {
    p5_inst.setup = function () {
        p5_inst.createCanvas(CANVAS_SIZE, CANVAS_SIZE)
        radius = CANVAS_SIZE / 2.1
        center = p5_inst.createVector(CANVAS_SIZE / 2, CANVAS_SIZE / 2)
        right = p5_inst.createVector(radius, 0)
        left = p5_inst.createVector(-radius, 0)
        down = p5_inst.createVector(0, radius)
        up = p5_inst.createVector(0, -radius)
        NONE_PICKED = { p: p5_inst.createVector(0, 0) }
        pickedPoint = NONE_PICKED
    }

    p5_inst.draw = function () {
        p5_inst.background('#fff')

        p5_inst.stroke(255)
        p5_inst.fill('#000')
        p5_inst.circle(center.x, center.y, radius * 2)
        drawArrow(center, right, '#fff');
        drawArrow(center, left, '#fff');
        drawArrow(center, up, '#ffee6e');
        drawArrow(center, down, '#ffee6e');

        points.forEach((point) => {
            if (pickedPoint.p.equals(point.p)) {
                p5_inst.strokeWeight(2)
                p5_inst.stroke("#645ffb")
            } else p5_inst.noStroke()
            p5_inst.fill('#ffb939')
            p5_inst.circle(point.p.x, point.p.y, 7)
        })
    }

    p5_inst.mouseClicked = function () {
        let p = p5_inst.createVector(p5_inst.mouseX, p5_inst.mouseY)
        if (isInsideCircle(p)) {
            let foundPoint = therePoint(p)
            if (foundPoint) {
                pickedPoint = foundPoint
            } else addPoint(p)
        }
        return false
    }

    p5_inst.mouseDragged = function (event) {
        let p = p5_inst.createVector(p5_inst.mouseX, p5_inst.mouseY)
        if (pickedPoint != NONE_PICKED) {
            pickedPoint.p = p
        }
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
            if (p.dist(point.p) < 5 + (5 * error) / 100) {
                return point
            }
        }
        return null
    }

    function isInsideCircle(p) {
        return p.dist(center) < radius
    }

    function addPoint(p) {
        points.push({ p: p })
        pickedPoint = NONE_PICKED
    }
}
let myp5 = new p5(s, 'canvas_component')
