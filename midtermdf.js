"use strict";
(function(){
  const generations = ["(all)",1,2,3,4,5,6];

  const legendary = ['True', 'False', 'all'];
  const colors = {

      "Bug": "#4E79A7",

      "Dark": "#A0CBE8",

      "Dragon": "#B1C008",

      "Electric": "#F28E2B",

      "Fairy": "#FFBE7D",

      "Fighting": "#59A14F",

      "Fire": "#8CD17D",

      "Flying": "A05B88",

      "Ghost": "#B6992D",

      "Grass": "#499894",

      "Ground": "#86BCB6",

      "Ice": "#FABFD2",

      "Normal": "#E15759",

      "Poison": "#FF9D9A",

      "Psychic": "#79706E",

      "Rock": "#A01458",

      "Steel": "#BAB0AC",

      "Water": "#D37295"

}
    let data = ""
    let svgContainer = ""
    // dimensions for svg
    const measurements = {
        width: 500,
        height: 500,
        marginAll: 50
    }

    // load data and append svg to body
    svgContainer = d3.select('body').append("svg")
        .attr('width', measurements.width + 100)
        .attr('height', measurements.height + 50);
    d3.csv("pokemon.csv")
        .then((csvData) => data = csvData)
        .then(() => makeScatterPlot())




    function makeScatterPlot() {
        // get arrays of GRE Score and Chance of Admit
        let sp = data.map((row) => parseInt(row["Sp. Def"]))
        let total = data.map((row) =>  parseFloat(row["Total"]))
        // find range of data
        const limits = findMinMax(sp, total)
        // create a function to scale x coordinates
        let scaleX = d3.scaleLinear()
            .domain([limits.greMin - 5, limits.greMax])
            .range([0 + measurements.marginAll, measurements.width - measurements.marginAll])
        // create a function to scale y coordinates
        let scaleY = d3.scaleLinear()
            .domain([limits.admitMax, limits.admitMin - 0.05])
            .range([0 + measurements.marginAll, measurements.height - measurements.marginAll])

        drawAxes(scaleX, scaleY)

        plotData(scaleX, scaleY)

        svgContainer.append('text')
          .attr('x', 200)
          .attr('y', 490)
          //.attr('transform', 'rotate(-90,0)')
          .attr('fill', 'black')
          .text("Sp. Def")

          svgContainer.append('text')
          .attr('x', -200)
          .attr('y', 15)
          .attr('transform', 'rotate(-90)')
          .attr('fill', 'black')
          .text("Total")



    }

    function findMinMax(sp, total) {
        return {
            greMin: d3.min(sp),
            greMax: d3.max(sp),
            admitMin: d3.min(total),
            admitMax: d3.max(total)
        }
    }

    function drawAxes(scaleX, scaleY) {
        // these are not HTML elements. They're functions!
        let xAxis = d3.axisBottom()
            .scale(scaleX)

        let yAxis = d3.axisLeft()
            .scale(scaleY)

        // append x and y axes to svg
        svgContainer.append('g')
            .attr('transform', 'translate(0,450)')
            .call(xAxis)

        svgContainer.append('g')
            .attr('transform', 'translate(50, 0)')
            .call(yAxis)
    }

    function plotData(scaleX, scaleY) {
        const xMap = function(d) { return scaleX(+d["Sp. Def"]) }
        const yMap = function(d) { return scaleY(+d["Total"]) }

        // Define the div for the tooltip
        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 1)
            .style("border", "grey 1px solid")
            .style("background-color", "white")
            .style("padding", "2pt");

        const circles = svgContainer.selectAll(".circle")
            .data(data)
            .enter()
            .append('circle')
                .attr('cx', xMap)
                .attr('cy', yMap)
                .attr("class", "point")
                .attr('r', 4)
                .attr('fill', function(d) {
                  return colors[d["Type 1"]];
                })
                .on("mouseover", function(d) {
                  let type2 = "";
                  if (d["Type 2"] != "") {
                    type2 = "<br>" + d["Type 2"];
                  }
                  let hoverText = "<strong>" + d["Name"] + "</strong>" + "<br>" + d["Type 1"] + type2;
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div .html(hoverText)
                        .style("left", (d3.event.pageX + 10) + "px")
                        .style("top", (d3.event.pageY) + "px");
                    })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0)
                });

                filter();

                colorLegend();

    }

    function colorLegend() {
      let colorArray = [];
      for (let color in colors) {
        colorArray.push(JSON.parse('{"' + color + '":"' + colors[color] + '"}'));
      }
      // let legend =svgContainer.selectAll(".rect")
			// .data(colors)
  		// .enter()
      // .append("rect")
  		// // .attr("x", function(d, i) {
      // //   console.log(d);
      // //   return (40 + i*80); })
      // .attr("x", 50)
      // .attr("y", 50)
      // .attr("width",25)
      // .attr("height", 12)
  		// .attr("fill", function(d) {
      //   console.log(colors[d]);
      //   return colors[d];
      // });

      svgContainer.selectAll('.rect')
          .data(colorArray) // use the bins data
          .enter()
          .append('rect')
              // x and y determine the upper left corner of our rectangle

              // d.x0 is the lower bound of one bin
              .attr('x', 470)
              // d.length is the count of values in the bin
              .attr('y', function(d,i) {
                return 10 + i * 30;
              })
              .attr('width', 20)
              .attr('height', 20)
              .attr('fill', function(d) {
                for (let type in d) {
                  return colors[type];
                }
              })
  	// legend labels
    svgContainer.selectAll('.rect')
  			.data(colorArray)
  		.enter().append("text")
      .attr("x", 500)
      .attr('y', function(d,i) {
        return 25 + i * 30;
      })
  		.text(function(d) {     for (let type in d) {
            return type;
          } });
    }

    function filter() {

      document.getElementById("filterleg").addEventListener("change", filterForBoth);
      let filter1 = d3.select('#filterleg')
          .append('select')
          .selectAll('option')
          .data(legendary)
          .enter()
          .append('option')
          .attr('value', function(d) {
               return d
          })
          .html(function(d) {
              return d
          })

      document.getElementById("filtergen").addEventListener("change", filterForBoth);

      let filter2 = d3.select('#filtergen')
          .append('select')
          .selectAll('option')
          .data(generations)
          .enter()
          .append('option')
          .html(function(d) { return d })
          .attr('value', function(d) { return d })

    }

    function filterForBoth() {
      let fil = document.getElementById('filterleg').querySelector("select");
      let selected = fil.value;
      let fil2 = document.getElementById('filtergen').querySelector("select");
      let selected2 = fil2.value;

      svgContainer.selectAll(".point")
          .attr("display", "none");

      svgContainer.selectAll(".point")
          .filter(function(d) {

            return (selected == d["Legendary"] || selected == "all") && (selected2 == d["Generation"] || selected2 == "(all)");
          })
          .attr("display", "");
    }





})()
