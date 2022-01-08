let unit_circle_center, radius
let curr_picked
let filter_plane
const CANVAS_SIZE = 500
const NONE_PICKED = { point: null, conjugate: null }
const Mode = { ZERO : 0, POLE : 1, CONJ_ZERO : 2, CONJ_POLE : 3 }

const s = (p5_inst) => {
    p5_inst.setup = function () {
        p5.disableFriendlyErrors = true;

        p5_inst.createCanvas(CANVAS_SIZE, CANVAS_SIZE)
        radius = CANVAS_SIZE / 2.1
        unit_circle_center = p5_inst.createVector(
            CANVAS_SIZE / 2,
            CANVAS_SIZE / 2
        )
        curr_picked = NONE_PICKED
        filter_plane = new FilterPlane()

        p5_inst.noLoop()
    }

    p5_inst.draw = function () {
        console.log('drawn')
        p5_inst.clear()
        drawUnitCricle()
        drawPoints()
    }
    p5_inst.mouseReleased = function () {
        p5_inst.noLoop()
    }

    p5_inst.mouseClicked = function () {
        let p = p5_inst.createVector(p5_inst.mouseX, p5_inst.mouseY)
        if (isInsideCircle(p, unit_circle_center, radius, 0)) {
            let found = filter_plane.therePoint(p)
            if (found.point) {
                console.log("found")
                curr_picked = found
            }
            else filter_plane.addItem(p, mode = Mode.ZERO)
            p5_inst.redraw()
        }
        else if (curr_picked != NONE_PICKED) {
            curr_picked = NONE_PICKED
            p5_inst.redraw()
        }
        return false
    }

    p5_inst.doubleClicked = function () {
        filter_plane.removeAll()
        p5_inst.redraw()
    }

    p5_inst.mouseDragged = function () {
        let p = p5_inst.createVector(p5_inst.mouseX, p5_inst.mouseY)
        if (curr_picked != NONE_PICKED && isInsideCircle(p, unit_circle_center, radius, 0)) {
            if(!curr_picked.conjugate){
                p.y = unit_circle_center.y
                curr_picked.point.center = p
            }
            else{
                curr_picked.point.center = p
                curr_picked.conjugate.center = curr_picked.point.getConjugate().center
            }
        }
        p5_inst.redraw()
    }

    function drawPoints() {
        filter_plane.items.forEach(({ point, conjugate }) => {
            if (point == curr_picked.point) {
                point.draw(undefined, undefined, (picked = true))
                if(conjugate) conjugate.draw(undefined, undefined, (picked = true))
            }
            else {
                point.draw()
                if(conjugate) conjugate.draw()
            }

        })
    }

    function drawUnitCricle() {
        p5_inst.background('#fff')
        p5_inst.stroke(255)
        p5_inst.fill('#000')
        p5_inst.circle(unit_circle_center.x, unit_circle_center.y, radius * 2)
        const axes = [
            p5_inst.createVector(radius, 0),
            p5_inst.createVector(-radius, 0),
            p5_inst.createVector(0, radius),
            p5_inst.createVector(0, -radius)
        ]
        axes.forEach((axis) => { arrow(unit_circle_center, axis, '#fff') })
    }

    function isInsideCircle(p, center, radius, error) {
        return p.dist(center) < radius + (radius * error) / 100
    }


    function cross(center, size = 10, fill = '#fff', weight = 2, stroke = '#fff') {
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

    function arrow(base, vec, myColor) {
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

        hash() {
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
                : cross(this.center, size, fill, 2, fill)
        }

        getConjugate() {
            let p = super.getConjugate()
            return new Pole(p.center, p.origin)
        }
    }

    class Conjugate {
        constructor(point, conjugate) {
            this.point = point
            this.conjugate = conjugate
        }

        draw(size = 8, fill = '#ffb939', picked = false) {
            this.point.draw(size, fill, picked)
            this.conjugate.draw(size, fill, picked)
        }
    }

    class FilterPlane {
        constructor() {
            this.items = []
        }

        therePoint(p, error = 10) {
            let real_p = p5_inst.createVector(p.x, unit_circle_center.y)
            for (let item of this.items) {
                if (
                    isInsideCircle(p, item.point.center, 8, error) ||
                    item.conjugate && isInsideCircle(p, item.conjugate.center, 8, error)
                ) {
                    return item
                }
            }
            for (let item of this.items) {
                if (isInsideCircle(real_p, item.point.center, 8, error)) return item
            }
            return { point: null, conjugate: null }
        }

        addItem(p, mode) {
            if (mode == Mode.ZERO) this.#addZero(p)
            else if (mode == Mode.POLE) this.#addPole(p)
            else if (mode == Mode.CONJ_ZERO) this.#addConjugateZero(p)
            else this.#addConjugatePole(p)
            curr_picked = NONE_PICKED
        }

        removeZeros() {
            this.items = this.items.filter(item => { item.point instanceof Pole })
        }

        removePoles() {
            this.items = this.items.filter(item => { item.point instanceof Zero })
        }

        removeAll() {
            this.items = []
        }

        #addZero(p) {
            let center = p5_inst.createVector(p.x, unit_circle_center.y)
            let zero = new Zero(center, unit_circle_center)
            this.items.push({ point: zero, conjugate: null })
        }

        #addPole(p) {
            let center = p5_inst.createVector(p.x, unit_circle_center.y)
            let pole = new Pole(center, unit_circle_center)
            this.items.push({ point: pole, conjugate: null })
        }

        #addConjugatePole(p) {
            let center = p5_inst.createVector(p.x, p.y)
            let pole = new Pole(center, unit_circle_center)
            let conjugate_pole = pole.getConjugate()
            this.items.push({ point: pole, conjugate: conjugate_pole })
        }

        #addConjugateZero(p) {
            let center = p5_inst.createVector(p.x, p.y)
            let zero = new Zero(center, unit_circle_center)
            let conjugate_zero = zero.getConjugate()
            this.items.push({ point: zero, conjugate: conjugate_zero })
        }
    }

}

let myp5 = new p5(s, 'canvas_component')
