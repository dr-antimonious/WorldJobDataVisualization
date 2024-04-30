let plotData = world_data.filter(
    e => e.year === year
);

const regions = new Set(world.features.map(d => d.properties.continent));
const color = d3.scaleOrdinal(d3.schemeCategory10).domain(regions.values());

const legend = d3.legendColor().scale(color);

const size = d3.scaleLinear()
    .range([50, 5000])
    .domain(fc.extentLinear().accessors([d => d.emp])(plotData));

const pointSeries = fc.seriesSvgPoint()
    .crossValue(d => d.avh * d.emp)
    .mainValue(d => d.rgdpe / d.emp)
    .size(d => size(d.emp))
    .decorate(sel => {
        sel.enter().attr('fill', d => color(world.features.find(
            e => e.properties.adm0_a3 === d.countrycode
        ).properties.continent)).attr('stroke', 'transparent');
    });

const chart = fc.chartCartesian(d3.scaleLog(), d3.scaleLog())
    .xDomain([Math.min.apply(null,
        plotData.map(
            function (d){
                return d.avh * d.emp;
            }
        )
    ) * 0.95, Math.max.apply(null,
        plotData.map(
            function (d){
                return d.avh * d.emp;
            }
        )
    ) * 1.05])
    .yDomain([Math.min.apply(null,
        plotData.map(
            function (d){
                return d.rgdpe / d.emp;
            }
        )
    ) * 0.95, Math.max.apply(null,
        plotData.map(
            function (d){
                return d.rgdpe / d.emp;
            }
        )
    ) * 1.05])
    .chartLabel('Blah blah blah')
    .xLabel('Average work hours')
    .yLabel('RGDPE')
    .yOrient('left')
    .svgPlotArea(pointSeries)
    .decorate(selection => {
        // append an svg for the d3-legend
        selection
            .enter()
            .append('d3fc-svg')
            .attr('class', 'legend');

        // render the legend
        selection
            .select('.legend')
            .select('svg')
            .call(legend);
    });

d3.select('#scatter')
    .datum(plotData)
    .call(chart);