from flask import Flask, jsonify, request, json,render_template
import numpy
from numpy.lib.function_base import angle
import scipy
import scipy.signal 

from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)

countFilter = 0
def frequencyResponse(zeros, poles, gain): 
    w, h = scipy.signal.freqz_zpk(zeros, poles, gain)
    magnitude = 20 * numpy.log10(numpy.abs(h))
    angles = numpy.unwrap(numpy.angle(h))
    return w/max(w), angles, magnitude

def increment():
    global countFilter
    countFilter = countFilter+1
def decrement():
    global countFilter
    countFilter = countFilter-1    
angles = numpy.zeros(512)


def phaseResponce(a):
    global angles
    w, h = scipy.signal.freqz([-a, 1.0], [1.0, -a])
    angles1 = numpy.unwrap(numpy.angle(h))
    angles = numpy.add(angles1,angles)
    return w/max(w), angles


def addFilter(a):
    increment()
    w, angles2 = phaseResponce(a)
    return w/max(w), angles2
   


def deleteFilter(a):
    decrement()
    global angles
    w, h = scipy.signal.freqz([-a, 1.0], [1.0, -a])
    angles1 = numpy.unwrap(numpy.angle(h))
    angles = numpy.subtract(angles1,angles)
    return w/max(w), angles

"""
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
                'magnitude': angles.tolist()

            }
    return jsonify(response_data)
"""


@app.route('/getAllPassFilter', methods=['POST', 'GET'])
def getAllPassFilterData():
    global angles
    if request.method == 'POST':

        language = json.loads(request.data)
        a = language['a']
        flag = language['flag']
        if (flag == 'true' and countFilter == 0):
            increment()
            w, angles3 = phaseResponce(a)
            response_data = {
                'w': w.tolist(),
                'angles': angles3.tolist()
            }
            return jsonify(response_data)

        elif (flag == 'true' and countFilter > 0):
            w, angles3 = addFilter(a)
            response_data = {
                'w': w.tolist(),
                'angles': angles3.tolist()
            }
            return jsonify(response_data)
            

        elif (flag == 'false' and countFilter > 0):
            w, angles3 = deleteFilter(a)
            response_data = {
                'w': w.tolist(),
                'angles': angles3.tolist()
            }
            return jsonify(response_data)
        elif(flag == "false" and countFilter == 0):  
            angles = numpy.zeros(512)
            w,_ = phaseResponce(0)

            response_data = {
                'w': w.tolist(),
                'angles': angles.tolist()
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
        print(zeros_and_poles)
        impulse_response = scipy.signal.ZerosPolesGain(z,p,1)
        transfer_function = impulse_response.to_tf()
        num = transfer_function.num
        den = transfer_function.den
        response_data = {
            'b': num.tolist(),
            'a': den.tolist()
        }

        return jsonify(response_data) 


if __name__ == '__main__':
    app.run(debug=True, port=8080)