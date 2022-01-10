const filterDesignMagnitude = document.querySelector('#filter-mag-response')
const filterDesignPhase = document.querySelector('#filter-phase-response')
const plottingCanvas = document.getElementById('all-pass-phase');
const checkList = document.getElementById('list1');


document.querySelector('#listOfA').addEventListener('input', updateAllPassCoeff)

clearCheckBoxes()

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

async function updateFilterDesign(data) {
    data.gain = 1
    let { w, angels, magnitude } = await postData(`${API}/getFilter`, data)
    console.log("angles", angels)
    console.log("mag", magnitude)
    plotlyLinePlot(filterDesignMagnitude, w, magnitude)
    plotlyLinePlot(filterDesignPhase, w, angels)
}

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
