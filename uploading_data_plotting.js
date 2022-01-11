// const myForm = document.getElementById("myForm");
const submit_btn = document.getElementById("csv-submitter");
const csvFile = document.getElementById("csvFile");
const button = document.getElementById("sent_zeros_poles"); 
let x_column 
let y_column
let y_filtterd
let x
let y
let zeros
let poles
let dx
let b = [0.21546504, 0.01546504];
let a = [ 1.        , -0.06906992];
console.log(filter_plane)


function getCol(matrix, col){
    var column = [];
    for(var i=0; i<matrix.length; i++){
       column.push(matrix[i][col]);
    }
    return column; // return column data..
 }

 async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',

      headers: {
          'Content-Type': 'application/json',
          },

      body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

function readData(){
  const input = csvFile.files[0];

  dfd.read_csv(input).then((df) => {
    let tf_tensor = df.tensor
    x_column = getCol(df.values,0)
    dx = x_column[2]-x_column[1];
    y_column = getCol(df.values,1)

    y_filtterd = y_column.slice(0,a.length)
    console.log("printing x_column")
    // console.log(x_column)
    })
}


async function get_differenceEquationCoefficients(){
  
  console.log("b:", b)
  return {a,b};
} 
// button.addEventListener("click",function(e){
//   e.preventDefault();


// })
csvFile.addEventListener("change",function(e){
  console.log(e.target.files)
  readData()
  // console.log(x_column)

})

function filter(a,b,n,y,y_filtterd){
  let filterd_point=0

  if(n>=a.length-1 && n>=b.length-1){

  for (let i = 1; i < a.length; i++) {

    filterd_point += a[i]*y_filtterd[n-i] 
    
  }
  for (let i = 0; i < b.length; i++) {

    filterd_point += b[i]*y[n-i] 
    }
  return filterd_point;
  }
  return y_filtterd[n];
  
}

submit_btn.addEventListener("click",  async function (e) {
  e.preventDefault();
  console.log("submitt botttunnnnn")

    let x=x_column[0]
    let y=y_column[0]
    console.log("y:",y)
    // console.log("y:",y_column)

    zeros_and_poles =  filter_plane.getZerosPoles(radius)
    
    zeros = zeros_and_poles.zeros
    poles = zeros_and_poles.poles


    console.log("zeros:",zeros)
    response = await postData("http://127.0.0.1:8080/differenceEquationCoefficients", {
            zeros: zeros,
            poles: poles
      })
  
    // console.log(response);
    a = response["a"];
    b = response["b"];
  

    if(zeros.length===0 || poles.length===0){
      return ;
    }


    // console.log(x_column)
    // document.write(JSON.stringify(x_column));
    // console.log(x_column)
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    var data = [{
      x: [x], 
      y: [y],
      mode: 'lines',
      line: {color: '#80CAF6'}
    }]
  var layout = {
      // xaxis: {range: [2, 5]},
      yaxis: {range: [-1, 2.5]}
    };
  
  var filtter_data = [{
      x: [x], 
      y: [y_filtterd[0]],
      mode: 'lines',
      line: {color: '#8fce00'}
    }]
  
    
    Plotly.newPlot('original-signal', data,layout);  
    Plotly.newPlot('filtered-signal', filtter_data,layout); 
    
    var cnt = 1;
    
    var interval = setInterval(function() {
      
      var update = {
      x:  [[x_column[cnt]]],
      y: [[y_column[cnt]]]
      }
      
      // y_filtterd[cnt]=a[1]*y_filtterd[cnt-1] + b[0]*cy_olumn[cnt] + b[1]*y_column[cnt-1];
  
      // let yyyyy=a[1]*y_filtterd[cnt-1] + b[0]*y_column[cnt] + b[1]*y_column[cnt-1];

      y_filtterd[cnt] = filter(a,b,cnt,y_column,y_filtterd)
      
  
      // console.log(yyyyy)
  
      var update_filterd = {
        x:  [[x_column[cnt]]],
        y: [[y_filtterd[cnt]]]
        }
  
      // console.log(cnt);
      // var olderTime = time.setMinutes(x_column[cnt]);
      // var futureTime = time.setMinutes(x_column[cnt+10]);
      
      var minuteView = {
            xaxis: {
  
              range: [x_column[cnt]-dx,x_column[cnt]-dx]
            }
          };
      
      Plotly.relayout('original-signal', minuteView);
      Plotly.extendTraces('original-signal', update, [0])
      console.log("not plooooootting")
      Plotly.relayout('filtered-signal', minuteView);
  
      Plotly.extendTraces('filtered-signal', update_filterd, [0])
  
      cnt++;
      if(cnt === 400) clearInterval(interval);
    }, 40);
})



// let x=x_column[0]
// let y=y_column[0]
// console.log(x)


