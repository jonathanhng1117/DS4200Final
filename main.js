// Load data
d3.csv("NYC_Airbnb_clean.csv").then(function(data) {
  let width = 1000, height = 650;

  let margin = {
      top:30,
      bottom:30,
      left:60,
      right:30
  };

  const mapBounds = {
      left: -74.3,
      right: -73.5,
      top: 40.95,
      bottom: 40.5
  };
  
  // Define SVG
  let svg = d3.select('body')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
  
  // Define scales
  
  let yScale = d3.scaleLinear()
      .domain([mapBounds.bottom, mapBounds.top])
      .range([height - margin.bottom, margin.top])
  
  let yAxis = svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft().scale(yScale))

  yAxis
      .append('text')
      .attr('y', 20)
      .attr('x', 20)
      .style('stroke', 'black')
      .text('Latitude');
  
  let xScale = d3.scaleLinear()
      .domain([mapBounds.left, mapBounds.right])
      .range([margin.left, width - margin.right])
  
  let xAxis = svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom().scale(xScale))

  xAxis
      .append('text')
      .attr('x', width - margin.left)
      .attr('y', -10)
      .style('stroke', 'black')
      .text('Longitude');

  // Define sequential color scale
  const colorScale = d3.scaleSequential()
      .domain([1, 5]) // Assuming the data range for review scores is from 1 to 5
      .interpolator(d3.interpolateReds); // Using reds interpolator

  let circle = svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.longitude))
      .attr('cy', d => yScale(d.latitude))
      .attr('r', 5)
      .attr('fill', d => colorScale(d.review_scores_rating)) // Using color scale to determine circle fill color
      .on("mouseover", (event, d) => {
          // Show tooltip on hover
          d3.select(".tooltip")
              .style("display", "block")
              .html(`<strong>Name:</strong> ${d.name}<br>
                     <strong>Price:</strong> $${d.price}<br>
                     <strong>Room Type:</strong> ${d.room_type}<br>
                     <strong>Neighborhood:</strong> ${d.neighbourhood_cleansed}<br>
                     <strong>Accommodates:</strong> ${d.accommodates}<br>
                     <strong>Rating:</strong> ${d.review_scores_rating}`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", () => {
          // Hide tooltip on mouseout
          d3.select(".tooltip").style("display", "none");
      });

  // Create dropdown menu
  const ratings = Object.keys(data[0]).slice(17, 24); // Extract column names                
  // Create label for dropdown
  d3.select("body")
      .insert("label", "#column-dropdown")
      .text("Select a score attribute:")
      .style("display", "block")
      .style("margin-bottom", "5px");

  d3.select("#column-dropdown")
      .selectAll("option")
      .data(ratings)
      .enter()
      .append("option")
      .text(d => d);

  // Define initial column for color mapping
  let selectedColumn = ratings[0]; // Default to the first column

  // Add event listener to dropdown menu
  d3.select("#column-dropdown").on("change", function() {
      selectedColumn = this.value;
      updatePlot();
  });

// Define legend
let legendWidth = 500, legendHeight = 50;

let legendSvg = d3.select('body')
    .append('svg')
    .attr('width', legendWidth)
    .attr('height', legendHeight);

// Define gradient
let gradient = legendSvg.append('defs')
    .append('linearGradient')
    .attr('id', 'gradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '100%')
    .attr('y2', '0%')
    .attr('spreadMethod', 'pad');

// Define color stops
for (let i = 0; i <= 1; i += 0.01) {
    gradient.append('stop')
        .attr('offset', i * 100 + '%')
        .attr('stop-color', colorScale(i * 5))
        .attr('stop-opacity', 1);
}

// Add color scale
legendSvg.append('rect')
    .attr('width', legendWidth)
    .attr('height', legendHeight - 20) // Adjusted to accommodate labels
    .style('fill', 'url(#gradient)');

// Define legend scale
let legendScale = d3.scaleLinear()
    .domain([1, 5])
    .range([3, legendWidth-3]);

// Add legend axis
let legendAxis = d3.axisBottom(legendScale)
    .tickValues([1.0, 2.0, 3.0, 4.0, 5.0])
    .tickFormat(d => `${d}`); // Custom label formatting

legendSvg.append('g')
    .attr('transform', `translate(0, ${legendHeight - 20})`) // Adjusted to accommodate labels
    .call(legendAxis);


  // Function to update plot based on selected column
  function updatePlot() {
      // Update scatterplot marks color
      circle.transition()
          .duration(500)
          .attr("fill", d => colorScale(d[selectedColumn]));
  }

  // Initial plot
  updatePlot();

});