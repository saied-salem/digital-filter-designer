const submit_btn = document.getElementById('csv-submitter')
const csvFile = document.getElementById('csvFile')
const button = document.getElementById('sent_zeros_poles')
let signal_x, signal_y
let slider = document.getElementById("myRange");
let output = document.getElementById("demo");
output.innerHTML = slider.value;
let speed = slider.value;

slider.oninput = function() {
    output.innerHTML = this.value;
    speed = slider.value;
    console.log(speed)
  }

updateFilterDesign({zeros: [], poles: []})

function getCol(matrix, col) {
    var column = []
    for (var i = 0; i < matrix.length; i++) {
        column.push(matrix[i][col])
    }
    return column
}

async function readData() {
    const input = csvFile.files[0]
    const df = await dfd.read_csv(input)
    signal_x = getCol(df.values, 0)
    signal_y = getCol(df.values, 1)
    return [signal_x, signal_y]
}

async function get_differenceEquationCoefficients(zeros, poles) {
    const {a, b} = await postData(`${API}/differenceEquationCoefficients`, {
        zeros: zeros,
        poles: poles,
    });
    equateLength(a, b);
    return [a, b]
}

csvFile.addEventListener('change', () => {
    readData()
}) 

function equateLength(a, b){
    max_length = Math.max(a.length, b.length)
    for(let i = 0; i < max_length; i++){
        a[i] = i < a.length ? a[i] : 0
        b[i] = i < b.length ? b[i] : 0
    }
    return [a, b]
}

function filter(a, b, n, x, y_filtterd) {
    let filterd_point = 0
    if(a.length != b.length) equateLength(a, b)
    if (n < a.length) return y_filtterd[n]

    filterd_point += b[0] * x[n]
    for (let i = 1; i < a.length; i++) {
        filterd_point += a[i] * y_filtterd[n - i] + b[i] * x[n - i]
    }
    return filterd_point
}

submit_btn.addEventListener('click', async function (e) {
    e.preventDefault()

    const {zeros, poles} = filter_plane.getZerosPoles(radius)
    if (zeros.length === 0 && poles.length === 0) {
        console.log("NO Zeros and Poles")
        return
    }
    const [a, b] = await get_differenceEquationCoefficients(zeros, poles) 

    let x = signal_x[0], y = signal_y[0]
    let dx = signal_x[2] - signal_x[1]
    let y_filtterd = signal_y.slice(0, a.length)
    console.log(y_filtterd)

    var data = [
        {
            x: [x],
            y: [y],
            mode: 'lines',
            line: { color: '#febc2c' },
        },
    ]
    var layout = {
        yaxis: { range: [-1, 2.5] },
        plot_bgcolor: "#111111",
        paper_bgcolor: "#111111"
    }

    var filtter_data = [
        {
            x: [x],
            y: [y_filtterd[0]],
            mode: 'lines',
            line: { color: '#fd413c' },
        },
    ]

    Plotly.newPlot('original-signal', data, layout)
    Plotly.newPlot('filtered-signal', filtter_data, layout)
    realTimePlotting(y_filtterd, dx, a, b)
})

function realTimePlotting(y_filtterd, dx, a, b) {
    let cnt = 1
    let interval = setInterval(function () {
        y_filtterd[cnt] = filter(a, b, cnt, signal_y, y_filtterd)

        let update = {
            x: [[signal_x[cnt]]],
            y: [[signal_y[cnt]]],
        }
        let update_filterd = {
            x: [[signal_x[cnt]]],
            y: [[y_filtterd[cnt]]],
        }

        let minuteView = {
            xaxis: {
                range: [signal_x[cnt] - dx, signal_x[cnt] - dx],
            },
            yaxis: { rangemode:'tozero', autorange:true}
        }

        Plotly.relayout('filtered-signal', minuteView)
        Plotly.extendTraces('filtered-signal', update_filterd, [0])

        Plotly.relayout('original-signal', minuteView)
        Plotly.extendTraces('original-signal', update, [0])


        cnt++
        speed = slider.value;
        if (cnt === 400) clearInterval(interval)
    }, speed)
}
setTimeout(() => {
    updateAllPassCoeff()
}, 100)

