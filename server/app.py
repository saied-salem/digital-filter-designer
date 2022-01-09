from flask import Flask, jsonify, request, json,render_template
import numpy as np
from numpy.lib.function_base import angle
import scipy
import scipy.signal

from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)

def frequencyResponse(zeros, poles, gain):
    w, h = scipy.signal.freqz_zpk(zeros, poles, gain)
    magnitude = 20 * np.log10(np.abs(h))
    angles = np.unwrap(np.angle(h))
    return w/max(w), angles, magnitude

def phaseResponse(a):
    w, h = scipy.signal.freqz([-a, 1.0], [1.0, -a])
    angles = np.unwrap(np.angle(h))
    return w/max(w), angles

def parseToComplex(pairs):
    complexNumbers = [0]*len(pairs)
    for i in range(len(pairs)):
        x = round(pairs[i][0], 2)
        y = round(pairs[i][1], 2)
        complexNumbers[i] = x+ y*1j
    return complexNumbers

@app.route('/getFinalFilter', methods=['POST', 'GET'])
@cross_origin()
def getFinalFilter():
    if request.method == 'POST':
        zerosAndPoles = json.loads(request.data)
        zeros = parseToComplex(zerosAndPoles['zeros'])
        poles = parseToComplex(zerosAndPoles['poles'])

        gain = zerosAndPoles['gain']
        a = zerosAndPoles['a']

        w, allPassAngles = getAllPassFilter(a)
        w, filterAngles, filterMagnitude = frequencyResponse(zeros, poles, gain)

        finalAngles = np.add(allPassAngles, filterAngles)
        finalMagnitude = filterMagnitude*1

        response_data = {
                'w': w.tolist(),
                'angles': finalAngles.tolist(),
                'magnitude': finalMagnitude.tolist()
            }
    return jsonify(response_data)

@app.route('/getFilter', methods=['POST', 'GET'])
@cross_origin()
def getFrequencyResponce():
    if request.method == 'POST':
        zerosAndPoles = json.loads(request.data)
        zeros = zerosAndPoles['zeros']
        poles = zerosAndPoles['pole']
        gain = zerosAndPoles['gain']

        w, angles, magnitude = frequencyResponse(zeros, poles, gain)
        response_data = {
                'w': w.tolist(),
                'angles': angles.tolist(),
                'magnitude': magnitude.tolist()
            }
    return jsonify(response_data)

def getAllPassFilter(filterCoeffients):
        filter_angles = np.zeros(512)
        w = np.zeros(512)
        for coeffient in filterCoeffients:
            w, angles = phaseResponse(coeffient)
            filter_angles = np.add(filter_angles, angles)
        return w, filter_angles

@app.route('/getAllPassFilter', methods=['POST', 'GET'])
def getAllPassFilterData():
    if request.method == 'POST':
        data = json.loads(request.data)
        filterCoeffients = data['a']
        w, filter_angles = getAllPassFilter(filterCoeffients)
        response_data = {
            'w': w.tolist(),
            'angles': filter_angles.tolist(),
        }
        return jsonify(response_data)
    else:
        return 'There is no Post request'


@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/differenceEquationCoefficients' , methods=['GET','POST'])
def differenceEquationCoefficients():
    if request.method == 'POST':

        zeros_and_poles = json.loads(request.data)
        z = zeros_and_poles['zeros']
        p = zeros_and_poles['poles']

        frequency_response = scipy.signal.ZerosPolesGain(z,p,1)
        transfer_function = frequency_response.to_tf()

        num = transfer_function.num
        den = transfer_function.den
        response_data = {
            'b': num.tolist(),
            'a': den.tolist()
        }

        return jsonify(response_data)


if __name__ == '__main__':
    app.run(debug=True, port=8080)
