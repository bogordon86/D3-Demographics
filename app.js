//Create a scatterplot in D3 using data from ACS 2014 and BRFSS
var svgWidth = 800;
var svgHeight = 600;

var margin = { top: 20, right: 40, bottom: 80, left: 100 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//Create an SVG wrapper, append an SVG group to hold our chart
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Append an SVG group
var chart = svg.append("g");

d3.select(".chart").append("div").attr("class", "tooltip").style("opacity", 0);

d3.csv("data.csv", function(error, csvData) {
  if (error) throw error;

  csvData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.bad_health = +data.bad_health;
    data.heavy_drinkers = +data.heavy_drinkers;

  });

  var yLinearScale = d3.scaleLinear().range([height, 0]);

  var xLinearScale = d3.scaleLinear().range([0, width]);

  //Create axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

 //These variables store the minimum and maximum values in a column in data.csv
var xMin;
 var xMax;
 var yMax;

 function findMinandMax(dataColumnX) {
   xMin = d3.min(csvData, function(data) {
     return +data[dataColumnX]-2;
   });
   xMax = d3.max(csvData, function(data) {
     return +data[dataColumnX]+1;
   });

   yMax = d3.max(csvData, function(data) {
     return +([data.poverty]*1.1);
   });
 }
   var currentAxisLabelX = "bad_health";

  findMinandMax(currentAxisLabelX);
  xLinearScale.domain([xMin, xMax]);
  yLinearScale.domain([6, yMax]);


  //Initialize toolTip
  var toolTip = d3
    .tip().
    attr("class", "tooltip")
    .offset([80, -80])
    .html(function(data) {
      var stateName = data.state;
      var poverty = +data.poverty;
      var risk_factor = +data[currentAxisLabelX];
      var riskString;
      if (currentAxisLabelX === "bad_health") {
        riskString = "Fair or Poor Health: ";
      }
      else {
        riskString = "Heavy Drinkers";
      }
      return stateName + "<br>" + riskString + risk_factor + "<br> In Poverty: " + poverty;
    });

  //Create tooltip
  chart.call(toolTip);

  chart
    .selectAll("circle").data(csvData).enter().append("circle").attr("cx", function(data, index) {
      return xLinearScale(+data[currentAxisLabelX]);
    })
    .attr("cy", function(data, index) {
      return yLinearScale(data.poverty);
    })
    .attr("r", "12")
    .attr("fill", "skyblue")

    .on("click", function(data) {
      toolTip.show(data);
    })
    .on("mouseover", function(data) {
      d3.select(this)
      .attr("stroke-width", 2)
      .attr("stroke", "black");
    })
  .on("mouseout", function(data, index) {
      toolTip.hide(data);
      d3.select(this)
      .attr("stroke", null);
  });

  chart
    .selectAll("g").data(csvData).enter().append("text").attr("dx", function(data, index) {
      return xLinearScale(data[currentAxisLabelX])-11.5;
    })
    .attr("dy", function(data, index) {
      return yLinearScale(data.poverty)+4;
    })
    .text(function(data, index) {
      return data.abbr;
    })
    .on("click", function(data) {
      toolTip.show(data);
    })
    .on("mouseover", function(data) {
      d3.select(this)
      .attr("stroke-width", 2)
      .attr("stroke", "black");
    })
  .on("mouseout", function(data, index) {
      toolTip.hide(data);
      d3.select(this)
      .attr("stroke", null);
  })
    .attr("fill", "white");

  //Append an SVG group for the x-axis, then display x-axis
  chart
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    // The class name assigned here will be used for transition effects
    .attr("class", "x-axis")
    .call(bottomAxis);

    //Append SVG group for y-axis, then display y-axis
    chart.append("g").call(leftAxis);

    chart
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .attr("class", "axis-text")
      .attr("data-axis-name", "poverty")
      .text("Percent of Population in Poverty");

      // Append x-axis labels
      chart
        .append("text")
        .attr(
          "transform",
          "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")"
        )
        // This axis label is active by default
        .attr("class", "axis-text active")
        .attr("data-axis-name", "bad_health")
        .text("Percent of State Population in Fair or Poor Health");

      chart
        .append("text")
        .attr(
          "transform",
          "translate(" + width / 2 + " ," + (height + margin.top + 45) + ")"
        )
        // This axis label is inactive by default
        .attr("class", "axis-text inactive")
        .attr("data-axis-name", "heavy_drinkers")
        .text("Percent of State Population that are Heavy Drinkers");

      // Change an axis's status from inactive to active when clicked (if it was inactive)
      // Change the status of all active axes to inactive otherwise
      function labelChange(clickedAxis) {
        d3
          .selectAll(".axis-text")
          .filter(".active")
          // An alternative to .attr("class", <className>) method. Used to toggle classes.
          .classed("active", false)
          .classed("inactive", true);

        clickedAxis.classed("inactive", false).classed("active", true);
      }

      d3.selectAll(".axis-text").on("click", function() {
        // Assign a variable to current axis
        var clickedSelection = d3.select(this);
        // "true" or "false" based on whether the axis is currently selected
        var isClickedSelectionInactive = clickedSelection.classed("inactive");
        // console.log("this axis is inactive", isClickedSelectionInactive)
        // Grab the data-attribute of the axis and assign it to a variable
        // e.g. if data-axis-name is "poverty," var clickedAxis = "poverty"
        var clickedAxis = clickedSelection.attr("data-axis-name");
        console.log("current axis: ", clickedAxis);

        // The onclick events below take place only if the x-axis is inactive
        // Clicking on an already active axis will therefore do nothing
        if (isClickedSelectionInactive) {
          // Assign the clicked axis to the variable currentAxisLabelX
          currentAxisLabelX = clickedAxis;
          // Call findMinAndMax() to define the min and max domain values.
          findMinandMax(currentAxisLabelX);
          // Set the domain for the x-axis
          xLinearScale.domain([xMin, xMax]);
          // Create a transition effect for the x-axis
          svg
            .select(".x-axis")
            .transition()
            // .ease(d3.easeElastic)
            .duration(1800)
            .call(bottomAxis);
          // Select all circles to create a transition effect, then relocate its horizontal location
          // based on the new axis that was selected/clicked
          d3.selectAll("circle").each(function() {
            d3
              .select(this)
              .transition()
              // .ease(d3.easeBounce)
              .attr("cx", function(data) {
                return xLinearScale(+data[currentAxisLabelX]);
              })
              .duration(1800);
          })
          d3.selectAll("g").each(function() {
            d3
            .select(this)
            .transition()
            .attr("dx", function(data, index) {
              return xLinearScale(data[currentAxisLabelX]);
            })
            .duration(1800);
          })
          // Change the status of the axes. See above for more info on this function.
          labelChange(clickedSelection);
        }
      });
    });
