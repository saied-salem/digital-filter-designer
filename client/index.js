const filterDesignMagnitude = document.querySelector('#filter-mag-response')
const filterDesignPhase = document.querySelector('#filter-phase-response')
const allPassPhase = document.getElementById('all-pass-phase-response');
const checkList = document.getElementById('list1');


document.querySelector('#listOfA').addEventListener('input', updateAllPassCoeff)
document.querySelector('#new-all-pass-coef').addEventListener('click', addNewA)

clearCheckBoxes()
async function postData(url = '', data = {}) {
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
    plotlyMultiLinePlot(filterDesignMagnitude, [
        { x: w, y: magnitude, line: { color: '#febc2c' } },
    ])
    plotlyMultiLinePlot(filterDesignPhase, [
        { x: w, y: angels, line: { color: '#fd413c' } },
    ])
}

checkList.getElementsByClassName('anchor')[0].onclick = function () {
    if (checkList.classList.contains('visible'))
        checkList.classList.remove('visible');
    else
        checkList.classList.add('visible');
}

function addNewA() {
    var newA = document.getElementById('new-value').value
    if(newA > 1 || newA < -1){
        alert(`invalid ${newA} as Filter Coefficient`)
        return
    }
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
    plotlyMultiLinePlot(allPassPhase, [{x, y}])
}

function plotlyMultiLinePlot(container, data){
    Plotly.newPlot(
        container,
        data,
        {
            margin: { l: 20, r: 0, b: 20, t: 0 },
            xaxis: { rangemode:'tozero', autorange:true},
            yaxis: { rangemode:'tozero', autorange:true},
            plot_bgcolor: "#111111",
            paper_bgcolor: "#111111"
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
