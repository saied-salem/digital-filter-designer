let unit_circle_center, radius
let curr_picked
let filter_plane
let unit_circle_mode
const CANVAS_SIZE = 300
const NONE_PICKED = { item: {point: null, conjugate: null}, index: -1 }
const Mode = { ZERO : 0, POLE : 1, CONJ_ZERO : 2, CONJ_POLE : 3 }
const Conj_Modes = {2: Mode.CONJ_ZERO, 3: Mode.CONJ_POLE}
const API = "http://127.0.0.1:8080"
const modesMap = {
    'real-zero': Mode.ZERO,
    'real-pole': Mode.POLE,
    'conjugate-zeros': Mode.CONJ_ZERO,
    'conjugate-poles': Mode.CONJ_POLE,
}

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
        unit_circle_mode = Mode.ZERO
        filter_plane = new FilterPlane()

        p5_inst.noLoop()
    }

    p5_inst.draw = function () {
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
            if (found.item.point) {
                curr_picked = found
            }
            else filter_plane.addItem(p, mode = unit_circle_mode)
            p5_inst.redraw()
        }
        else if (curr_picked != NONE_PICKED) {
            curr_picked = NONE_PICKED
            p5_inst.redraw()
        }
        console.log(filter_plane.getZerosPoles(radius))
        updateFilterDesign(filter_plane.getZerosPoles(radius))
        return true
    }

    p5_inst.mouseDragged = function () {
        let p = p5_inst.createVector(p5_inst.mouseX, p5_inst.mouseY)
        if (curr_picked != NONE_PICKED && isInsideCircle(p, unit_circle_center, radius, 0)) {
            if(!curr_picked.item.conjugate){
                p.y = unit_circle_center.y
                curr_picked.item.point.center = p
            }
            else{
                curr_picked.item.point.center = p
                curr_picked.item.conjugate.center = curr_picked.item.point.getConjugate().center
            }
        }
        p5_inst.redraw()
    }

    function drawPoints() {
        filter_plane.items.forEach(({ point, conjugate }) => {
            if (point == curr_picked.item.point) {
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
        p5_inst.background('rgba(0,255,0, 0)')
        p5_inst.stroke(255)
        p5_inst.fill('#fff')
        p5_inst.circle(unit_circle_center.x, unit_circle_center.y, radius * 2)
        for(let i = 1; i <= 3; i++){
            p5_inst.stroke("#5b5a5a")
            p5_inst.noFill()
            p5_inst.circle(unit_circle_center.x, unit_circle_center.y, radius * 2*i/3)
        }
        const axes = [
            p5_inst.createVector(radius, 0),
            p5_inst.createVector(-radius, 0),
            p5_inst.createVector(0, radius),
            p5_inst.createVector(0, -radius)
        ]
        axes.forEach((axis) => { arrow(unit_circle_center, axis, '#000') })
    }

    function isInsideCircle(p, center, radius, error) {
        return p.dist(center) < radius + (radius * error) / 100
    }


    function cross(center, size = 8, fill = '#fff', weight = 2, stroke = '#fff') {
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
        p5_inst.strokeWeight(1.5)
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

        getRelativePosition(max){
            return [this.getRelativeX(max), this.getRelativeY(max)]
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

        draw(size = 10, fill = '#d4d4d6', picked = false) {
            p5_inst.push()
            if (picked) fill = '#0000ff'
            p5_inst.stroke("#767575")
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

        draw(size = 10, fill = '#484848', picked = false) {
            picked
                ? cross(this.center, size, fill, 2, '#0000ff')
                : cross(this.center, size, fill, 2, fill)
        }

        getConjugate() {
            let p = super.getConjugate()
            return new Pole(p.center, p.origin)
        }
    }

    class FilterPlane {
        constructor() {
            this.items = []
        }

        //TODO: refactor and fix release bug
        therePoint(p, error = 5) {
            let real_p = p5_inst.createVector(p.x, unit_circle_center.y)
            for (let i = 0; i < this.items.length; i++) {
                let item = this.items[i]
                if (
                    isInsideCircle(p, item.point.center, 8, error) ||
                    (item.conjugate &&
                        isInsideCircle(p, item.conjugate.center, 8, error))
                ) {
                    return { item, index: i }
                }
            }
            for (
                let i = 0;
                i < this.items.length && !(unit_circle_mode in Conj_Modes);
                i++
            ) {
                let item = this.items[i]
                if (isInsideCircle(real_p, item.point.center, 8, error))
                    return { item, index: i }
            }
            return { item: { point: null, conjugate: null }, index: -1 }
        }

        getZerosPoles(max) {
            let zerosPositions = [], polesPositions = []
            this.items.forEach(({ point, conjugate }) => {
                let pointPosition = point.getRelativePosition(max)
                let conjugatePosition = conjugate
                    ? conjugate.getRelativePosition(max)
                    : null
                let positions = point instanceof Zero ? zerosPositions : polesPositions
                positions.push(pointPosition)
                if(conjugatePosition) positions.push(conjugatePosition)
            })
            return { zeros: zerosPositions, poles: polesPositions }
        }

        addItem(p, mode) {
            if (mode == Mode.ZERO) this.#addZero(p)
            else if (mode == Mode.POLE) this.#addPole(p)
            else if (mode == Mode.CONJ_ZERO) this.#addConjugateZero(p)
            else this.#addConjugatePole(p)
            curr_picked = NONE_PICKED
        }

        removeZeros() {
            this.items = this.items.filter((item) => {
                return item.point instanceof Pole
            })
            p5_inst.redraw()
        }

        removePoles() {
            this.items = this.items.filter((item) => {
                return item.point instanceof Zero
            })
            p5_inst.redraw()
        }

        removeAll() {
            this.items = []
            p5_inst.redraw()
        }

        remove(index) {
            if (index < 0) return
            this.items.splice(index, 1)
            p5_inst.redraw()
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

document.querySelectorAll('.mode-control').forEach(item => {
    item.addEventListener('click', changeMode)
})

document
    .querySelector('#remove-all')
    .addEventListener('click', () => filter_plane.removeAll())

document
    .querySelector('#remove-zeros')
    .addEventListener('click', () => filter_plane.removeZeros())

document
    .querySelector('#remove-poles')
    .addEventListener('click', () => filter_plane.removePoles())

document
    .querySelector('#remove')
    .addEventListener('click', () => filter_plane.remove(curr_picked.index))

let filterDesignMagnitude = document.querySelector('#filter-mag-response')
let filterDesignPhase = document.querySelector('#filter-phase-response')


let myp5 = new p5(s, 'circle-canvas')
clearCheckBoxes()

plottingCanvas = document.getElementById('all-pass-phase');


async function postData(url = '', data = {}) {
    console.log(data)
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    return response.json()
}


var checkList = document.getElementById('list1');
checkList.getElementsByClassName('anchor')[0].onclick = function () {
    if (checkList.classList.contains('visible'))
        checkList.classList.remove('visible');
    else
        checkList.classList.add('visible');
}


function addNewA() {
    var newA = document.getElementById('newValue').value
    document.getElementById(
        'listOfA'
    ).innerHTML += `<li><input class = "target1" type="checkbox" data-avalue="${newA}"/>${newA}</li>`
    clearCheckBoxes()
}

function updateFilter(allPassCoeff){
    postData('http://127.0.0.1:8080/getAllPassFilter', {
        a: allPassCoeff,
    }).then((data) => {
        updateFilterPlotting(data.w, data.angles)
    })
}

function updateFilterPlotting(x, y){
    plotlyLinePlot(plottingCanvas, x, y)
}

function plotlyLinePlot(container, x, y){
    console.log(typeof x, typeof y)
    Plotly.newPlot(
        container,
        [{ x: x, y: y }],
        {
            margin: { l: 20, r: 0, b: 20, t: 0 },
            xaxis: { rangemode:'tozero', autorange:true},
            yaxis: { rangemode:'tozero', autorange:true}
        },
        { staticPlot: true }
    )
}

document.querySelector('#listOfA').addEventListener('input', updateAllPassCoeff)

function arrayRemove(arr, value) {
    return arr.filter(function (ele) {
        return ele != value
    })
}

function updateAllPassCoeff(){
    let allPassCoeff = []
    document.querySelectorAll('.target1').forEach(item => {
        let aValue = parseFloat(item.dataset.avalue)
        let checked = item.checked
        if (checked) allPassCoeff.push(aValue)
    })
    updateFilter(allPassCoeff)
}

function clearCheckBoxes(){
    document.querySelectorAll('.target1').forEach(item => {
        item.checked = false;
    })
}


function changeMode(e){
    unit_circle_mode = modesMap[e.target.id]
}

async function updateFilterDesign(data) {
    data.gain = 1
    let { w, angels, magnitude } = await postData(`${API}/getFilter`, data)
    console.log("angles", angels)
    console.log("mag", magnitude)
    plotlyLinePlot(filterDesignMagnitude, w, magnitude)
    plotlyLinePlot(filterDesignPhase, w, angels)
}
