const notyf = new Notyf()

const submit_btn = document.getElementById('csv-submitter')
const stop_btn = document.getElementById('stop-filtering')
const csvFile = document.getElementById('csvFile')
const button = document.getElementById('sent_zeros_poles')
let slider = document.getElementById("myRange");
let output = document.getElementById("slider-value");
let signal_x, signal_y
let plotting_interval

output.innerHTML = slider.value;
let speed = Math.floor(1000/slider.value);

slider.oninput = function() {
    output.innerHTML = this.value;
    speed = Math.floor(1000/slider.value);
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

stop_btn.addEventListener('click', () => {
    clearInterval(plotting_interval)
    updateBtnsState((plotting = false))
})

function equateLength(a, b){
    max_length = Math.max(a.length, b.length)
    for(let i = 0; i < max_length; i++){
        a[i] = i < a.length ? a[i] : 0
        b[i] = i < b.length ? b[i] : 0
    }
    return [a, b]
}

/**
 * IIR filter implementation of the transfer function H[Z] using the difference equation.
 *
 * @param {Array}   a           List of denominator coefficients.
 * @param {Array}   b           List of numerator coefficients.
 * @param {Number}  n           Index of sample point to filter.
 * @param {Array}   x           List of input samples.
 * @param {Array}   y           List of previous filterd samples.
 *
 * @return {Number}             The filterd sample value.
 *
 * -------------------------------------------------------------------------------------
 *                                𝗧𝗿𝗮𝗻𝘀𝗳𝗲𝗿 𝗙𝘂𝗻𝗰𝘁𝗶𝗼𝗻
 *
 *             Y[z]       Σ b[n].z^-n       b0 + b1.z^-1 + .... + bM.z^-M
 *    H[z] = -------- = --------------- = ---------------------------------, a0 = 1
 *             X[z]       Σ a[n].z^-n       1 + a1.z^-1 + .... + aN.z^-N
 *
 *                                𝗗𝗶𝗳𝗳𝗲𝗿𝗲𝗻𝗰𝗲 𝗘𝗾𝘂𝗮𝘁𝗶𝗼𝗻
 *
 *                        Y[n] = Σ b[m].X[n-m] - Σ a[m].Y[n-m]
 * -------------------------------------------------------------------------------------
 */
function filter(a, b, n, x, y) {
    let filter_order = Math.max(a.length, b.length)
    if(a.length != b.length) equateLength(a, b)
    if (n < filter_order) return y[n]

    let y_n = b[0]*x[n]
    for (let m = 1; m < filter_order; m++) {
        y_n += b[m]*x[n-m] - a[m]*y[n-m]
    }

    return y_n
}

submit_btn.addEventListener('click', async function (e) {
    e.preventDefault()

    const {zeros, poles} = filter_plane.getZerosPoles(radius)
    if (zeros.length === 0 && poles.length === 0) {
        notyf.error('No filter designed');
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

    updateBtnsState((plotting = true))
    Plotly.newPlot('original-signal', data, layout)
    Plotly.newPlot('filtered-signal', filtter_data, layout)
    realTimePlotting(y_filtterd, dx, a, b)
})

function realTimePlotting(y_filtterd, dx, a, b) {
    let cnt = 1
    plotting_interval = setInterval(function () {
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
        if (cnt === Math.min(signal_x.length, 2000)){
            clearInterval(plotting_interval)
            updateBtnsState((plotting = false))
        }
    }, speed)
}

setTimeout(() => {
    updateAllPassCoeff()
}, 100)

function sine_wave(freq = 1, amplitude = 1, phase = 0, length = 1, resolution = 10000) {
    const sin = Math.sin
    const TWO_PI = 2*Math.PI
    let generated_sine = {time:[], wave:[]}
    for(let second of range(0, length-1))
        for(let i = 0; i < resolution; i++){
            let t = (i/(resolution-1)) + second
            generated_sine.time[i+resolution*second] = t
            generated_sine.wave[i+resolution*second] = sin(amplitude*TWO_PI*freq*t+phase)
        }
    return generated_sine
}

function* range(start, end) {
    for (let i = start; i <= end; i++) {
        yield i;
    }
}

function updateBtnsState(plotting){
    let btns = [stop_btn, submit_btn], disabled_state = [!plotting, plotting]
    btns.forEach((btn, idx) => btn.disabled = disabled_state[idx])
    btns.forEach(btn => btn.className = (btn.disabled)? 'disabled': 'btn')
}

updateBtnsState((plotting = false))
