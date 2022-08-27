// define road user
let roadUser = "driver";

// set pie Chart dimensions
var pieWidth = 500,
pieHeight = 500,
margin = 50;

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(pieWidth, pieHeight) / 2 - margin;

// The pie svg
var pieSVG = d3.select("#pie")
    .append("svg")
        .attr("id", "pie-chart")
        .attr("width", pieWidth)
        .attr("height", pieHeight)
    .append("g")
        .attr("transform", "translate(" + pieWidth / 2 + "," + pieHeight / 2 + ")");

pieSVG.append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("transform", "translate(-220,-220)")
    .attr("stroke", "black")
    .attr("fill", "orange")

pieSVG.append("text")
    .attr("transform", "translate(-180,-206)")
    .text("Female");

pieSVG.append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("transform", "translate(-220,-180)")
    .attr("stroke", "black")
    .attr("fill", "lightblue")

pieSVG.append("text")
    .attr("transform", "translate(-180,-166)")
    .text("Male");

// pie Chart color scale
var color = d3.scaleOrdinal()
                .domain(["male", "female"])
                .range(["lightblue", "orange"]);

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
    let genderData = new Array();
    let stateData = new Array();
    let nationalData = new Array
    let yearData = new Array();
    let caseNumber = new Array();
    let selectData = [0,0,0,0,0,0,0,0];
    let colorScale;
    
    

    // Checkbox
    // On set on change listener
    updateGender();
    d3.select("#male-checkbox").on("change", updateGender);
    d3.select("#female-checkbox").on("change",updateGender);
    
    function updateGender(){
        genderData.length = 0;
        yearData.length = 0;
        getYearData(slider.range());

        if(d3.select("#male-checkbox").property("checked") ||
            d3.select("#female-checkbox").property("checked")){
                
            // male check box check
            if(d3.select("#male-checkbox").property("checked") ){
                for(let i = 0; i < yearData.length; i++){
                    if (yearData[i].gender == "Male")
                        genderData.push(yearData[i]);
                }
            }

            // articulated truck check box check
            if(d3.select("#female-checkbox").property("checked") ){
                for(let i = 0; i < yearData.length; i++){
                    if (yearData[i].gender == "Female")
                        genderData.push(yearData[i]);
                }
            }
        }
        // None restriction as defualt
        else{
            for(let i = 0; i < yearData.length; i++){
                genderData.push(yearData[i]);
            }
        }
        getNumber(slider.range());
    }

    // get current year data function
    function getYearData(newRange){
        yearData.length = 0;
        d3.select("#range-label").text(newRange.begin + " - " + newRange.end);
        
        for (let i =0; i < json.length; i++)
        {
            if(json[i].year >= newRange.begin && json[i].year <= newRange.end)
            {
                yearData.push(json[i]);
            }
        }
    }


    // Year range slider on change listener
    slider.onChange(function(newRange){
        getYearData(newRange);
        getNumber(newRange);
    });

    // Onclick listener
    document.getElementById("driver").onclick = function(){getNumber(slider.range());}
    document.getElementById("motorcycle").onclick = function(){getNumber(slider.range());}
    document.getElementById("passenger").onclick = function(){getNumber(slider.range());}
    document.getElementById("pedestrian").onclick = function(){getNumber(slider.range());}
    document.getElementById("other").onclick = function(){getNumber(slider.range());}

    
    function getNumber(range){                          
        let caseNumberList = new Array();
        for(let i = 0; i < 8; i ++)
        {
            caseNumberList[i] = {};
        }

        for (let year = range.begin; year <= range.end; year++){
            caseNumberList[0][year]= {sum:yearData.filter(yd => yd.state == "NSW" && yd.year == year && yd.roadUser.toLowerCase() == roadUser).length,
                                male:yearData.filter(yd => yd.state == "NSW" && yd.gender == "Male"&& yd.year == year&& yd.roadUser.toLowerCase() == roadUser).length,
                                female:yearData.filter(yd => yd.state == "NSW" && yd.gender == "Female"&& yd.year == year&& yd.roadUser.toLowerCase() == roadUser).length};
    
            caseNumberList[1][year] = {sum:yearData.filter(yd => yd.state == "Vic" && yd.year == year && yd.roadUser.toLowerCase() == roadUser).length,
                                male:yearData.filter(yd => yd.state == "Vic" && yd.gender == "Male"&& yd.year == year&& yd.roadUser.toLowerCase() == roadUser).length,
                                female:yearData.filter(yd => yd.state == "Vic" && yd.gender == "Female"&& yd.year == year&& yd.roadUser.toLowerCase() == roadUser).length};
    
            caseNumberList[2][year] = {sum:yearData.filter(yd => yd.state == "Qld" && yd.year == year && yd.roadUser.toLowerCase() == roadUser).length,
                                male:yearData.filter(yd => yd.state == "Qld" && yd.gender == "Male"&& yd.year == year&& yd.roadUser.toLowerCase() == roadUser).length,
                                female:yearData.filter(yd => yd.state == "Qld" && yd.gender == "Female"&& yd.year == year&& yd.roadUser.toLowerCase() == roadUser).length};
    
            caseNumberList[3][year] = {sum:yearData.filter(yd => yd.state == "SA" && yd.year == year && yd.roadUser.toLowerCase() == roadUser).length,
                                male:yearData.filter(yd => yd.state == "SA" && yd.gender == "Male"&& yd.year == year&& yd.roadUser.toLowerCase() == roadUser).length,
                                female:yearData.filter(yd => yd.state == "SA" && yd.gender == "Female"&& yd.year == year&& yd.roadUser.toLowerCase() == roadUser).length};
    
    
            caseNumberList[4][year] = {sum:yearData.filter(yd => yd.state == "SA" && yd.year == year && yd.roadUser.toLowerCase() == roadUser).length,
                                male:yearData.filter(yd => yd.state == "SA" && yd.gender == "Male"&& yd.year == year&& yd.roadUser.toLowerCase() == roadUser).length,
                                female:yearData.filter(yd => yd.state == "SA" && yd.gender == "Female"&& yd.year == year&& yd.roadUser.toLowerCase() == roadUser).length};
                        
    
            caseNumberList[5][year] = {sum:yearData.filter(yd => yd.state == "Tas" && yd.year == year && yd.roadUser.toLowerCase() == roadUser).length,
                                male:yearData.filter(yd => yd.state == "Tas" && yd.gender == "Male"&& yd.year == year&& yd.roadUser.toLowerCase() == roadUser).length,
                                female:yearData.filter(yd => yd.state == "Tas" && yd.gender == "Female"&& yd.year == year&& yd.roadUser.toLowerCase() == roadUser).length};
    
    
            caseNumberList[6][year] = {sum:yearData.filter(yd => yd.state == "NT" && yd.year == year && yd.roadUser.toLowerCase() == roadUser).length,
                                male:yearData.filter(yd => yd.state == "NT" && yd.gender == "Male"&& yd.year == year&& yd.roadUser.toLowerCase() == roadUser).length,
                                female:yearData.filter(yd => yd.state == "NT" && yd.gender == "Female"&& yd.year == year&& yd.roadUser.toLowerCase() == roadUser).length};
    
            caseNumberList[7][year] = {sum:yearData.filter(yd => yd.state == "ACT" && yd.year == year && yd.roadUser.toLowerCase() == roadUser).length,
                                male:yearData.filter(yd => yd.state == "ACT" && yd.gender == "Male"&& yd.year == year&& yd.roadUser.toLowerCase() == roadUser).length,
                                female:yearData.filter(yd => yd.state == "ACT" && yd.gender == "Female"&& yd.year == year&& yd.roadUser.toLowerCase() == roadUser).length};
            }

            for (let year = range.begin; year <= range.end; year++){ }
                 
            for (let n = 0; n < 8; n++){
                let sum = 0,
                male = 0,
                female = 0;
                stateData[n] ={};
                for (let i = range.begin; i <= range.end; i++){
                    sum += caseNumberList[n][i].sum;
                    male += caseNumberList[n][i].male;
                    female += caseNumberList[n][i].female;
                    caseNumber[n] = {sum: sum, male: male, female: female}
                    stateData[n] = {male: male, female: female}
                }
        
            } 

            nationalData = {}
            let male = 0,
            female = 0;
            for (let n = 0; n < 8; n++){
                male += stateData[n].male;
                female += stateData[n].female; 
            }
            
            nationalData = {male: male, female:female};
        

            getSelectData(stateData);
            updatePie(nationalData); 
        return caseNumberList;
    }




    function getSelectData(caseNumberData){
        selectData = [0,0,0,0,0,0,0,0];
        if(d3.select("#male-checkbox").property("checked") ||
            d3.select("#female-checkbox").property("checked")){
                
            // bus check box check
            if(d3.select("#male-checkbox").property("checked") ){
                for (let i = 0; i < 8; i++)
                    selectData[i] += caseNumberData[i].male;
            }
            
            // articulated truck check box check
            if(d3.select("#female-checkbox").property("checked") ){
                for (let i = 0; i < 8; i++)
                    selectData[i] += caseNumberData[i].female;
            }
        }
        // None restriction as defualt
        else{
            for (let i = 0; i < 8; i++)
                selectData[i] += caseNumberData[i].male+caseNumberData[i].female;
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
                    updatePie(stateData[d.id])
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
                    updatePie(stateData[7])
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
                updatePie(nationalData);
                return colorScale(selectData[d.id])
            });
        d3.selectAll("circle")
            .transition()
            .duration(200)
            .style("opacity", 0.8)
            .style("stroke", "#dedede")
            .attr("fill",function(d){
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

    // A function that create / update the plot for a given variable:
function updatePie(data) {
    var pie = d3.pie()
    .value(function(d) {return d.value});
    
    var data_ready = pie(d3.entries(data));

    var u = pieSVG.selectAll("path")
    .data(data_ready);

    var arcGenerator = d3.arc()
          .innerRadius(0)
          .outerRadius(radius);

    u
        .enter()
        .append('path')
        .merge(u)
        .transition()
        .duration(1000)
        .attr('d', arcGenerator)
        .attr('fill', function(d){ return(color(d.data.key)) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 1)
    
      // remove the group that is not present anymore
      u
        .exit()
        .remove()
    
    }
   
    updatePie(nationalData);
}

    

function handleChange(src) {
    roadUser = src.value;
}
