var svgWidth = 900;
var svgHeight = 600;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// append an svg group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// initial params 
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function to update x-scale when clicked
function xScale(chartData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(chartData, d => d[chosenXAxis]) * 0.8,
        d3.max(chartData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;
};

// function to update x axis when clicked 
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
};

// Y scale 
// function to update y-scale when clicked
function yScale(chartData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([2, d3.max(chartData, d => d[chosenYAxis])])
        .range([height, 0]);

    return yLinearScale;
};

// Y axis 
// function to update y axis when clicked 
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
};

// function to update circles group with transition to new positions 
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
};

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
};

function renderAbbr(chosenXAxis,chosenYAxis, chartData, xLinearScale, yLinearScale, textGroup){
    textGroup.transition()
        .duration(1000)
        .attr("dx", d => xLinearScale(d[chosenXAxis] - .15))
        .attr("dy", d => yLinearScale(d[chosenYAxis] - .25))
   
    // var textGroup = chartGroup.append('g').selectAll('text')
    // .data(chartData)
    // .enter()
    // .append("text")
    // .text(function (d) { return d.abbr; })
    // .attr("dx", d => xLinearScale(d[chosenXAxis] - .15))
    // .attr("dy", d => yLinearScale(d[chosenYAxis] - .25))
    // .attr("font-size", '9px')
}

function updateToolTip(chosenXAxis, circlesGroup) {

    var label;

    if (chosenXAxis === "poverty") {
        label = "Poverty(%):";
    }
    else if (chosenXAxis === 'age') {
        label = "Age(median):";
    }
    else if (chosenXAxis === 'income') {
        label = 'Income:'
    }

    if (chosenYAxis === "income") {
        label = "income:";
    }
    else if (chosenYAxis === 'smokes') {
        label = "smokes(%):";
    }
    else if (chosenYAxis === 'obesity') {
        label = 'obesity:'
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function (d) {
            return (`Obesity: ${d.obesity}<br>${label} ${d[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data) {
            toolTip.hide(data);
        });

    return circlesGroup;

};

d3.csv("./assets/data/data.csv").then(function (chartData) {
    console.log(chartData);

    // parser data and cast as numbers
    chartData.forEach(function (x) {
        x.poverty = +x.poverty;
        x.healthcare = +x.healthcare;
        x.age = +x.age;
        x.smokes = +x.smokes;
        x.income = +x.income;
        x.obesity = +x.obesity;
    })

    // xLinearScale function above csv import
    var xLinearScale = xScale(chartData, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(chartData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x_axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append('g')
        .classed("y_axis", true)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(chartData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "lightblue")
        .attr("opacity", ".9")
        .attr("stroke", "black");

        
    var textGroup = chartGroup.append('g').selectAll('text')
        .data(chartData)
        .enter()
        .append("text")
        .text(function (d) { return d.abbr; })
        .attr("dx", d => xLinearScale(d[chosenXAxis] - .15))
        .attr("dy", d => yLinearScale(d[chosenYAxis] - .25))
        .attr("font-size", '9px')


    // Create group for two x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income");

    // create y labels group 
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    var healthcareLabel = ylabelsGroup.append("text")
        .attr("x", -(height / 2))
        .attr("y", -40)
        .attr("value", "healthcare") // value to grab for event listener
        .text("Lacks Healthcare (%)")
        .classed("active", true);

    var smokesLabel = ylabelsGroup.append("text")
        .attr("y", 20 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "smokes") // value to grab for event listener
        .attr("dy", "1em")
        .classed("inactive", true)
        .text("Smokes");

    var obeseLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "obesity") // value to grab for event listener
        .attr("dy", "1em")
        .classed("inactive", true)
        .text("obesity");

    // update tooltip
    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;
                console.log(value);
                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(chartData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxis(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
               
                renderAbbr(chosenXAxis,chosenYAxis,chartData, xLinearScale, yLinearScale,textGroup);

                // changes classes to change bold text
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "income") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === 'poverty') {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });

    // x axis labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = value;
                console.log(value);

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates y scale for new data
                yLinearScale = yScale(chartData, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxis(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

                renderAbbr(chosenXAxis,chosenYAxis,chartData, xLinearScale, yLinearScale,textGroup);

                // changes classes to change bold text
                if (chosenYAxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "obesity") {
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });


}).catch(function (error) {
    console.log(error)
});