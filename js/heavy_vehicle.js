// linechart Graph dimensions and margins
var lineChartMargin = {top: 10, right: 30, bottom: 30, left: 60}
lineChartWidth = 600 - lineChartMargin.left - lineChartMargin.right,
lineChartHeight = 500 - lineChartMargin.top - lineChartMargin.bottom;

// append the svg object to the body of the page
var lineChart = d3.select("#line-chart")
                .append("svg")
                    .attr("width", 600)
                    .attr("height", 500)
                .append("g")
                    .attr("transform",
                        "translate(" + lineChartMargin.left + "," + lineChartMargin.top + ")");

// Initialise X axis
var xScale = d3.scaleLinear().range([0, lineChartWidth]);
var xAxis = d3.axisBottom().scale(xScale);
lineChart.append("g")
    .attr("transform", "translate(0," + lineChartHeight + ")")
    .attr("class", "lineChartXAxis");

// Initialise Y axis
var yScale = d3.scaleLinear().range([lineChartHeight, 0]);
var yAxis = d3.axisLeft().scale(yScale);
lineChart.append("g")
    .attr("class", "lineChartYAxis");


// Create year selector
var slider = createD3RangeSlider(1989, 2021, "#slider-container");

slider.range(1989,2021);

// The map svg
var map = d3.select("#map"),
mapWidth = +map.attr("width"),
mapHeight = +map.attr("height");

// Map and projection
var projection = d3.geoMercator()
    .center([ 132, -28 ])
    .translate([mapWidth / 2, mapHeight / 2])
    .scale(780);

// Data
var data = new Map();


// Define path generator
var path = d3.geoPath()
    .projection(projection);


d3.queue()
    // geojson file from: https://github.com/tonywr71/GeoJson-Data
    .defer(d3.json,"https://raw.githubusercontent.com/tonywr71/GeoJson-Data/master/australian-states.min.geojson")
    .defer(d3.json, "../data/fatal_report.json")
    .await(ready);

function ready(error, geojson, json){    
    // Define Variables
    let classedData = new Array();
    let yearData = new Array();
    let caseNumber = new Array();
    let selectData = [0,0,0,0,0,0,0,0];
    let colorScale;

    
    // Checkbox
    // On set on change listener
    update();
    d3.select("#bus-checkbox").on("change", update);
    d3.select("#heavy-rigid-checkbox").on("change",update);
    d3.select("#articulated-checkbox").on("change",update);
    
    function update(){
        classedData.length = 0;
        yearData.length = 0;

        if(d3.select("#bus-checkbox").property("checked") ||
            d3.select("#heavy-rigid-checkbox").property("checked") ||
            d3.select("#articulated-checkbox").property("checked")){
                
            // bus check box check
            if(d3.select("#bus-checkbox").property("checked") ){
                for(let i = 0; i < json.length; i++){
                    if (json[i].bus == "Yes")
                        classedData.push(json[i]);
                        getYearData(slider.range());
                }
            }
    
            // heavy rigid truck check box check
            if(d3.select("#heavy-rigid-checkbox").property("checked") ){
                for(let i = 0; i < json.length; i++){
                    if (json[i].heavyRigid == "Yes")
                        classedData.push(json[i]);
                        getYearData(slider.range());
                }
            }
            
            // articulated truck check box check
            if(d3.select("#articulated-checkbox").property("checked") ){
                for(let i = 0; i < json.length; i++){
                    if (json[i].articulated == "Yes")
                        classedData.push(json[i]);
                        getYearData(slider.range());
                }
            }
        }
        // None restriction as defualt
        else{
            for(let i = 0; i < json.length; i++){
                classedData.push(json[i]);
                yearData.push(json[i]);
            }
        }
        getNumber(slider.range());
    }

    // get current year data function
    function getYearData(newRange){
        yearData.length = 0;
        d3.select("#range-label").text(newRange.begin + " - " + newRange.end);
        
        for (let i =0; i < classedData.length; i++)
        {
            if(classedData[i].year >= newRange.begin && classedData[i].year <= newRange.end)
            {
                yearData.push(classedData[i]);
            }
        }
    }


    // Year range slider on change listener
    slider.onChange(function(newRange){
        getYearData(newRange);
        getNumber(newRange);
    });

    function getNumber(range){                          
            let caseNumberList = new Array();
            for(let i = 0; i < 8; i ++)
            {
                caseNumberList[i] = {};
            }
            
            for (let year = range.begin; year <= range.end; year++){
                caseNumberList[0][year]= {sum:yearData.filter(yd => yd.state == "NSW" && yd.year == year).length,
                                    bus:yearData.filter(yd => yd.state == "NSW" && yd.bus == "Yes"&& yd.year == year).length,
                                    heavyRigid:yearData.filter(yd => yd.state == "NSW" && yd.heavyRigid == "Yes"&& yd.year == year).length,
                                    articulated:yearData.filter(yd => yd.state == "NSW" && yd.articulated == "Yes"&& yd.year == year).length};
        
                caseNumberList[1][year] = {sum:yearData.filter(yd => yd.state == "Vic"&& yd.year == year).length,
                                    bus:yearData.filter(yd => yd.state == "Vic" && yd.bus == "Yes"&& yd.year == year).length,
                                    heavyRigid:yearData.filter(yd => yd.state == "Vic" && yd.heavyRigid == "Yes"&& yd.year == year).length,
                                    articulated:yearData.filter(yd => yd.state == "Vic" && yd.articulated == "Yes"&& yd.year == year).length};
        
                caseNumberList[2][year] = {sum:yearData.filter(yd => yd.state == "Qld"&& yd.year == year).length,
                                    bus:yearData.filter(yd => yd.state == "Qld" && yd.bus == "Yes"&& yd.year == year).length,
                                    heavyRigid:yearData.filter(yd => yd.state == "Qld" && yd.heavyRigid == "Yes"&& yd.year == year).length,
                                    articulated:yearData.filter(yd => yd.state == "Qld" && yd.articulated == "Yes"&& yd.year == year).length};
        
                caseNumberList[3][year] = {sum:yearData.filter(yd => yd.state == "SA"&& yd.year == year).length,
                                    bus:yearData.filter(yd => yd.state == "SA" && yd.bus == "Yes"&& yd.year == year).length,
                                    heavyRigid:yearData.filter(yd => yd.state == "SA" && yd.heavyRigid == "Yes"&& yd.year == year).length,
                                    articulated:yearData.filter(yd => yd.state == "SA" && yd.articulated == "Yes"&& yd.year == year).length};
        
        
                caseNumberList[4][year] = {sum:yearData.filter(yd => yd.state == "WA"&& yd.year == year).length,
                                    bus:yearData.filter(yd => yd.state == "WA" && yd.bus == "Yes"&& yd.year == year).length,
                                    heavyRigid:yearData.filter(yd => yd.state == "WA" && yd.heavyRigid == "Yes"&& yd.year == year).length,
                                    articulated:yearData.filter(yd => yd.state == "WA" && yd.articulated == "Yes"&& yd.year == year).length};
        
        
                caseNumberList[5][year] = {sum:yearData.filter(yd => yd.state == "Tas"&& yd.year == year).length,
                                    bus:yearData.filter(yd => yd.state == "Tas" && yd.bus == "Yes"&& yd.year == year).length,
                                    heavyRigid:yearData.filter(yd => yd.state == "Tas" && yd.heavyRigid == "Yes"&& yd.year == year).length,
                                    articulated:yearData.filter(yd => yd.state == "Tas" && yd.articulated == "Yes"&& yd.year == year).length};
        
        
                caseNumberList[6][year] = {sum:yearData.filter(yd => yd.state == "NT"&& yd.year == year).length,
                                    bus:yearData.filter(yd => yd.state == "NT" && yd.bus == "Yes"&& yd.year == year).length,
                                    heavyRigid:yearData.filter(yd => yd.state == "NT" && yd.heavyRigid == "Yes"&& yd.year == year).length,
                                    articulated:yearData.filter(yd => yd.state == "NT" && yd.articulated == "Yes"&& yd.year == year).length};
        
        
                caseNumberList[7][year] = {sum:yearData.filter(yd => yd.state == "ACT"&& yd.year == year).length,
                                    bus:yearData.filter(yd => yd.state == "ACT" && yd.bus == "Yes"&& yd.year == year).length,
                                    heavyRigid:yearData.filter(yd => yd.state == "ACT" && yd.heavyRigid == "Yes"&& yd.year == year).length,
                                    articulated:yearData.filter(yd => yd.state == "ACT" && yd.articulated == "Yes"&& yd.year == year).length};
                }
                
            
        nationalList = [];
        for (let i = range.begin; i <= range.end; i++){
            let sum = 0;
            for (let n = 0; n < 8; n++){
            sum += caseNumberList[n][i].sum;
            }
            nationalList.push({year: i, sum: sum})
        }

        statesList = [];       
        for (let n = 0; n < 8; n++){
            let sum = 0,
            bus = 0,
            heavyRigid = 0,
            articulated = 0;
            statesList[n] = [];
            for (let i = range.begin; i <= range.end; i++){
                sum += caseNumberList[n][i].sum;
                bus += caseNumberList[n][i].bus;
                heavyRigid += caseNumberList[n][i].heavyRigid;
                articulated += caseNumberList[n][i].articulated;
                caseNumber[n] = {sum: sum, bus: bus, heavyRigid: heavyRigid, articulated: articulated}
                statesList[n].push({year: i, sum: caseNumberList[n][i].sum})
            }
        }   
        getSelectData(caseNumber);
        createLineChart(nationalList)        
        return caseNumberList;
    }

    function getSelectData(caseNumberData){
        selectData = [0,0,0,0,0,0,0,0];
        if(d3.select("#bus-checkbox").property("checked") ||
            d3.select("#heavy-rigid-checkbox").property("checked") ||
            d3.select("#articulated-checkbox").property("checked")){
                
            // bus check box check
            if(d3.select("#bus-checkbox").property("checked") ){
                for (let i = 0; i < 8; i++)
                    selectData[i] += caseNumberData[i].bus;
            }
    
            // heavy rigid truck check box check
            if(d3.select("#heavy-rigid-checkbox").property("checked") ){
                for (let i = 0; i < 8; i++)
                    selectData[i] += caseNumberData[i].heavyRigid;
            }
            
            // articulated truck check box check
            if(d3.select("#articulated-checkbox").property("checked") ){
                for (let i = 0; i < 8; i++)
                    selectData[i] += caseNumberData[i].articulated;
            }
        }
        // None restriction as defualt
        else{
            for (let i = 0; i < 8; i++)
            selectData[i] += caseNumberData[i].sum;
        }

        // dynamic color scale
        colorScale = d3.scaleLinear()
                            .domain([Math.min.apply(Math,selectData), 
                                (Math.min.apply(Math,selectData)+Math.max.apply(Math,selectData))/2,
                                Math.max.apply(Math,selectData)])
                            .range(["green","yellow","red"]);

        var mapLegend = d3.legendColor()
                        .shapeHeight(30)
                        .shapeWidth(10)
                        .shapePadding(0)
                        .labelOffset(5)
                        .labelFormat(d3.format(".0f"))
                        .orient("vertical")
                        .labelAlign("start")
                        .scale(colorScale);

        d3.select(".legend").call(mapLegend);
                           
        // Change map color
        d3.select("#map")
        .selectAll("path")
            .attr("fill", function(d){
                return colorScale(selectData[d.id]);
            });
        }

    // Mouse over function
    let mouseOver = function(d){
        d3.select("#map")
            .selectAll("path")
            .transition()
            .duration(200)
            .style("opacity", 0.3)
            .attr("fill",function(d){
                return colorScale(selectData[d.id])
            })
            .style("stroke", "transparent");
        d3.selectAll("circle")
            .transition()
            .duration(200)
            .style("opacity", 0.3)
            .style("stroke", "transparent")
            .attr("fill",function(){
                return colorScale(selectData[7])
            });
        if (this.id != "state-7" && this.id != "ACT"){
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "black")
                .attr("fill", function(d){
                    var element = document.getElementById("line-chart-title");
                    element.innerHTML = d.properties.STATE_NAME + " Insidents Number Chart";
                    createLineChart(statesList[d.id]);
                    return "orange";
                });
        }
        else{
            d3.select("#ACT")
                .transition()
                .duration(500)
                .style("opacity", 1)
                .style("stroke", "black")
                .attr("fill", function(d){
                    var element = document.getElementById("line-chart-title");
                    element.innerHTML = "Australia Capital Territory Insidents Number Chart";
                    createLineChart(statesList[7]);
                    return "orange"
                });

            d3.select("#state-7")
                .transition()
                .duration(500)
                .style("opacity", 1)
                .style("stroke", "black")
                .attr("fill", "orange");
        }

        tooltip.style("visibility","visible");

        }
    
    let mouseMove = function(d){
         // Tooltip container
        if(d == null)
            tooltip.html("Total Number: " + selectData[7])
                .style("margin-top",(d3.event.pageY - 300 )+"px")
                .style("margin-left",(d3.event.pageX + 10)+"px");
        else
            tooltip.html("Total Number: " + selectData[d.id])
                .style("margin-top",(d3.event.pageY - 300 )+"px")
                .style("margin-left",(d3.event.pageX + 10)+"px");
    }

    // Mouse Leave function
    let mouseLeave = function(d){
        d3.select("#map")
            .selectAll("path")
            .transition()
            .duration(200)
            .style("opacity", 0.8)
            .style("stroke", "#dedede")
            .attr("fill",function(d){
                var element = document.getElementById("line-chart-title");
                element.innerHTML = "National Insident Number Chart";
                createLineChart(nationalList);
                return colorScale(selectData[d.id])
            });
        d3.selectAll("circle")
            .transition()
            .duration(200)
            .style("opacity", 0.8)
            .style("stroke", "#dedede")
            .attr("fill",function(d){
                createLineChart(nationalList);
                return colorScale(selectData[7])
            });

        tooltip.style("visibility","hidden")
    }

    // Draw the map
    map.append("g")  
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")

        // Add id for each state
        .attr("id", function(d){
            return "state-" + d.id;
        })

        // Draw each state
        .attr("d", path)

        // Set color
        .attr("fill", function(d){
            return colorScale(selectData[d.id])
        })
        
        // Set border
        .style("stroke", function(d){
            return "#dedede"
        })
        
        // mouseOver and mouseLeave
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)
        .on("mousemove", mouseMove)
    
    
    // States Name
    map.selectAll("text")
        .data(geojson.features)
        .enter()
        .append("text")
        .attr("color", "black")
        .attr("fill", "darkslategray")
        .attr("x", function(d) { 
            return path.centroid(d)[0]})
        .attr("y", function(d){
            return path.centroid(d)[1]}
        )
        .attr("text-anchor", "middle")
        .text(function(d) {
            if (d.id != 7)
                return d.properties.STATE_NAME;
            else return "ACT";
        });
    // Zoom in circle text for ACT
    map.append("text")
        .attr("color", "black")
        .attr("fill", "darkslategray")
        .attr("x",100)
        .attr("y", 430)
        .attr("text-anchor", "middle")
        .text("ACT");
        

    // Zoom in circle for ACT    
    map.append('circle')
        .attr('id', "ACT")
        .attr('cx', 100)
        .attr('cy', 470)
        .attr('r', 25)
        .attr('stroke', '#dedede')
        .attr('fill', function(d){
            return colorScale(selectData[7])
        })
        // hover
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)
        .on("mousemove", mouseMove);
    // Decomstration line 
    map.append('line')
        .attr('x1', 120)
        .attr('y1', 465)
        .attr('x2', 530)
        .attr('y2', 395)
        .attr('stroke', 'black')
        .attr("stroke-width", "2px");

    //  Tool tip
        var tooltip = d3.select("header")
        .append("div")
        .attr("class", "tooltip")
        .attr("id","tooltip-container");
    
    // Legend
    d3.select("header")
        .append("svg")
        .attr("class","legend")
        .attr("id","legend");
    
    var mapLegend = d3.legendColor()
                    .shapeHeight(30)
                    .shapeWidth(10)
                    .shapePadding(0)
                    .labelOffset(5)
                    .labelFormat(".0f")
                    .orient("vertical")
                    .labelAlign("start")
                    .scale(colorScale);

    d3.select(".legend").call(mapLegend); 


    // Create a function that takes a dataset as input and update the plot:
    function createLineChart(data){


        // create X
        let minX = slider.range().begin;
        let maxX = slider.range().end;

        xScale.domain([minX,maxX]);
        lineChart.selectAll(".lineChartXAxis").transition()
        .duration(100)
        .call(xAxis);

       


        // create Y
        let minY = getMin(data, "sum");
        let maxY = getMax(data, "sum");
        yScale.domain([minY, maxY]);
        lineChart.selectAll(".lineChartYAxis")
        .transition()
        .duration(100)
        .call(yAxis);

        // Create update section: bind to new data
        var u = lineChart.selectAll(".lineTest")
            .data([data], function(d){ return d.year });

        //  Update the line
        u.enter()
        .append("path")
        .attr("class", "lineTest")
        .merge(u)
        .transition()
        .duration(100)
        .attr("d", d3.line()
            .x(function(d) { return xScale(d.year); })
            .y(function(d) { return yScale(d.sum); }))
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2.5)

    }

    function getMax(array, propName) {
        var max = 0;
        for(var i=0; i<array.length; i++) {
            var item = array[i];
            if(item[propName] > max) {
                max = item[propName];
            }
        }
    
        return max;
    }
    function getMin(array, propName) {
        var min = 0;
        for(var i=0; i<array.length; i++) {
            var item = array[i];
            if(item[propName] < min) {
                min = item[propName];
            }
        }
        return min;
    }

    // console.log(nationalList)
    createLineChart(nationalList);
        
}
