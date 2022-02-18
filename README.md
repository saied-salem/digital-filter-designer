# Filter-Design

- [Filter-Design](#filter-design)
  - [Features](#features)
  - [Filter Design Demo](#filter-design-demo)
  - [Run-App](#run-app)
  

## Features  
- Implementation a website to design a custom digital filter via zeros-poles placement on the z-plane.
- Modify the placed zeros/poles by dragging them.
- Clicking on a zero or pole and delete it.
- Clearing all zeros or clear all poles or clear all.
- Has the option to add conjugates automatic.
- A plot that shows the corresponding frequency response for the placed elements: One graph for the magnitude
response and another graph for the phase response.
- Apply the filter on a  signal  as if it is a real-time filtering process.
-  A graph shows the time progress of the signal.
-  Another graph to show the time progress of the filtered signal .
-  Control the speed of the filtering process (i.e the filter can process 1 point per second or 100 points per second or any number in between via a slider.
-  Correct for the phase by adding some All-Pass filters.
-  Picking the suitable all-pass through a library
available in website to add to original filter



## Filter Design Demo
![volume](./doc/Design-Filter.gif)

## Run-App
1. **_install project  dependencies_**
```sh
pip install -r requirements.txt
```
2. **_Run the application_**
```sh
python app.py