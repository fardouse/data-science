var svg = d3.select('svg');

var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 40, r: 50, b: 40, l: 30};

trellisWidth = svgWidth / 2 - padding.l - padding.r;
trellisHeight = svgHeight / 3 - padding.t - padding.b;

var parseDate = d3.timeParse('%Y-%m-%d');
var dateDomain = [new Date(2014, 5, 20), new Date(2015, 6, 30)];
var weatherDomain = [0, 110];

var colorScale = d3.scaleSequential(d3.interpolateViridis).domain(weatherDomain);

var xScale, yScale;

var trellisG;

var cityNames = ['Charlotte, NC', 'Los Angeles, CA', 'Jacksonville, FL', 'Chicago, IL', 'Philadelphia, PA', 'Phoenix, AZ'];

// instantiate brush
var brush = d3.brush()
    .extent([[0, 0], [trellisWidth, trellisHeight]])
    .on("start", brushstart)
    .on("brush", brushmove)
    .on("end", brushend);

var brushCell;

// instantiate tooltip
var weatherTooltip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-12, 0])
    .html(function (d) {
        return "<h5>" + d.city + "</h5><table><thead><tr><td>Date</td><td>Avg Temp</td><td>Min Temp</td><td>Precipitation</td></tr></thead>" +
            "<tbody><tr><td>" + d.date + "</td><td>" + d.avgtemp + "</td><td>" + d.mintemp + "</td><td>" + d.precipitation + "</td></tr></tbody></table>";
    });

svg.call(weatherTooltip);


// load data
Promise.all([
    d3.csv('./Weather Data/CLT.csv'),
    d3.csv('./Weather Data/CQT.csv'),
    d3.csv('./Weather Data/JAX.csv'),
    d3.csv('./Weather Data/MDW.csv'),
    d3.csv('./Weather Data/PHL.csv'),
    d3.csv('./Weather Data/PHX.csv')
  ]).then(function(data) {

    var cities = data.map(function (cityData, index) {
        var cityName = cityNames[index];
        return cityData.map(function (d) {
            return {
                date: parseDate(d.date),
                avgtemp: +d.actual_mean_temp,
                city: cityName,
                mintemp: +d.actual_min_temp,
                precipitation: +d.actual_precipitation
            };
        });
    });

    // create scales & axes
    xScale = d3
        .scaleTime()
        .domain(dateDomain)
        .range([0, trellisWidth]);

    yScale = d3
        .scaleLinear()
        .domain(weatherDomain)
        .range([trellisHeight, 0]);
   
    var xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeMonth.every(1)) 
        .tickFormat(d3.timeFormat('%b'));

    var yAxis = d3.axisLeft(yScale);

    // draw plots
    trellisG = svg
        .selectAll('.trellis')
        .data(cities)
        .enter()
        .append('g')
        .attr('class', 'trellis')
        .attr('transform', function (d, i) {
      var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
      var ty =
        Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
      return 'translate(' + [tx, ty] + ')';
    })
    .call(brush);

    // add x-axis to plot
    trellisG.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + trellisHeight + ')')
        .call(xAxis);

    // add y-axis to plot
    trellisG.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);

    // plot data points
    trellisG.selectAll('circle') 
        .data(function (d) {
        return d;
        })
        .enter()
        .append('circle')
        .attr('cx', function (d) {
            return xScale(d.date);
        })
        .attr('cy', function (d) {
            return yScale(d.avgtemp);
        })
        .attr('r', 5) 
        .attr('fill', function (d) {
            return colorScale(d.avgtemp);
        })
        .on('mouseover', weatherTooltip.show)
        .on('mouseout', weatherTooltip.hide);

    // add city name to plot
    trellisG.append('text')
        .attr('class', 'city-label')
        .attr('x', trellisWidth / 2)
        .attr('y', -padding.t / 2) 
        .attr('text-anchor', 'middle')
        .attr('ftont-family', 'arial')
        .attr('font-weight', '300')
        .attr('fill', 'black') 
        .text(function (d, i) {
            return cityNames[i];
        });


// draw legend
    var legendWidth = 10;
    var legendHeight = 10;

    var legend = d3.select('#legend')
    .append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(' + (svgWidth - legendWidth - padding.r) + ',' + padding.t + ')');

    legend = d3.legendColor()
        .scale(colorScale)
        .orient('vertical')
        .labelFormat(d3.format('.0f'))
        .title('Legend')
        .shapeWidth(7)
        .cells(6);

    legend.labels(function({ i, genLength, generatedLabels, labelDelimiter }) {
        const value = generatedLabels[i];
        return `${value} °F`;
    });
    
    svg.append("g")
        .attr("transform", "translate(" + (svgWidth - legendWidth - padding.r) + "," + (padding.t + 20) + ")") 
        .call(legend);   
});

// event listener functions
function brushstart() {
    if (brushCell !== this) {
        brush.move(d3.select(brushCell), null);
        xScale.domain(dateDomain);
        yScale.domain(weatherDomain);
        brushCell = this;
    }
}

function brushmove() {
    var e = d3.event.selection;
    if (e) {
        trellisG.selectAll('circle')
            .classed('hidden', function (d) {
                return e[0][0] > xScale(d.date) || xScale(d.date) > e[1][0] || e[0][1] > yScale(d.avgtemp) || yScale(d.avgtemp) > e[1][1];
            });
    }
}

function brushend() {
    if (!d3.event.selection) {
        trellisG.selectAll('.hidden').classed('hidden', false);
        brushCell = undefined;
    }
}

