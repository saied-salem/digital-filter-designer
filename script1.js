function getData() {
    return Math.random();
}  
Plotly.newPlot('graph',[{
    y:[getData()],
    type:'line'
}]);

var cnt = 0;
setInterval(function(){
    Plotly.extendTraces('graph',{ y:[[getData()]]}, [0]);
    cnt++;
    if(cnt > 500) {
        Plotly.relayout('graph',{
            xaxis: {
                range: [cnt-500,cnt]
            }
        });
    }
},2000);
