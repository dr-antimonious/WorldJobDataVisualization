"use strict";

// Y-axis statistic selection dropdown menu
const scatterYAxisSelector = document.getElementById("scatterYAxisData");

// X-axis statistic selection dropdown menu
const scatterXAxisSelector = document.getElementById("scatterXAxisData");

// Scatter year selection slider
const scatterYearSelector = document.getElementById("scatterYear");

// Scatter year selection slider label
const scatterYearLabel = document.getElementById("scatterYearLabel");

function findDomain(year, getter) {
    let values = [];
    world_data.forEach((e, index) => {
        if (e.year === year) values.push(getter(index))
    });
    return [Math.min.apply(null, values) * 0.95, Math.max.apply(null, values) * 1.05];
}

function scatterGetter(countryCode, getter) {
    const index = findIndex(countryCode, scatterYear);
    if (index === -1) return NaN;
    return getter(index);
}

function scatterSizeFunction(countryCode, XGetter, YGetter, scatterSize, year) {
    return !isNaN(scatterGetter(countryCode, XGetter, year))
        && !isNaN(scatterGetter(countryCode, YGetter, year))
        ? scatterSize(scatterGetter(countryCode, getPop, year))
        : 0;
}

// Necessary global variables
let scatterXAxisGetter, scatterYAxisGetter,
    scatterXAxisSelection = scatterXAxisSelector.value,
    scatterYAxisSelection = scatterYAxisSelector.value,
    scatterYear = parseInt(scatterYearSelector.value),
    scatterSizeDomain = findDomain(scatterYear, getPop);

function scatterSelectionFunction(selection) {
    switch (selection) {
        case statistics[0]: return getAvh;
        case statistics[1]: return getEmpPerPop;
        case statistics[2]: return getRgdpePerPop;
        case statistics[3]: return getRgdpoPerPop;
        case statistics[5]: return getEmp;
    }
}
scatterXAxisGetter = scatterSelectionFunction(scatterXAxisSelection);
scatterYAxisGetter = scatterSelectionFunction(scatterYAxisSelection);

const regions = new Set(world.features.map(d => d.properties.continent)),
    scatterColor = d3.scaleOrdinal(d3.schemeCategory10).domain(regions.values()),
    scatterLegend = d3.legendColor().scale(scatterColor),
    scatterSize = d3.scaleLog().domain(scatterSizeDomain).range([5, 20]).unknown(0);

const scatterMargin = {top: 10, right: 30, bottom: 30, left: 60},
    scatterWidth = 82.5 * visualViewport.width / 100 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 85 * visualViewport.height / 100 - scatterMargin.top - scatterMargin.bottom;

const scatterPlot = d3.select("#scatterContainer")
        .append("svg")
        .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
        .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + scatterMargin.left + "," + scatterMargin.top + ")"),
    scatterXAxis = d3.scaleLog()
        .domain(findDomain(scatterYear, scatterXAxisGetter))
        .range([0, scatterWidth])
        .unknown(-100),
    scatterYAxis = d3.scaleLog()
        .domain(findDomain(scatterYear, scatterYAxisGetter))
        .range([scatterHeight, 0])
        .unknown(-100);

const scatterPlotYAxis = scatterPlot.append("g")
        .call(d3.axisLeft(scatterYAxis)),
    scatterPlotXAxis = scatterPlot.append("g")
        .attr("transform", "translate(0," + scatterHeight + ")")
        .call(d3.axisBottom(scatterXAxis)),
    scatterPlotDots = scatterPlot.append("g");

scatterPlotDots.selectAll("dot")
    .data(world_data.filter((d) => d.year === scatterYear))
    .enter()
    .append("circle")
    .attr("class", (d) => `dot ${getContinent(d.countrycode)}`)
    .attr("cx", (d) => scatterXAxis(scatterGetter(d.countrycode, scatterXAxisGetter)))
    .attr("cy", (d) => scatterYAxis(scatterGetter(d.countrycode, scatterYAxisGetter)))
    .attr("r", (d) => scatterSizeFunction(d.countrycode, scatterXAxisGetter, scatterYAxisGetter, scatterSize))
    .style("fill", (d) => scatterColor(getContinent(d.countrycode)));

scatterXAxisSelector.addEventListener("change", (event) => {
    scatterXAxisSelection = event.target.value;
    scatterXAxisGetter = scatterSelectionFunction(scatterXAxisSelection);
    scatterXAxis.domain(findDomain(scatterYear, scatterXAxisGetter));
    scatterPlotXAxis.transition().call(d3.axisBottom(scatterXAxis));
    scatterPlotDots.selectAll("circle")
        .data(world_data.filter((d) => d.year === scatterYear))
        .enter()
        .join("circle")
        .merge(scatterPlot.selectAll("circle").data(world_data.filter((d) => d.year === scatterYear)))
        .transition()
        .attr("cx", (d) => scatterXAxis(scatterGetter(d.countrycode, scatterXAxisGetter)));
});

scatterYAxisSelector.addEventListener("change", (event) => {
    scatterYAxisSelection = event.target.value;
    scatterYAxisGetter = scatterSelectionFunction(scatterYAxisSelection);
    scatterYAxis.domain(findDomain(scatterYear, scatterYAxisGetter));
    scatterPlotYAxis.transition().call(d3.axisLeft(scatterYAxis));
    scatterPlotDots.selectAll("circle")
        .data(world_data.filter((d) => d.year === scatterYear))
        .enter()
        .join("circle")
        .merge(scatterPlot.selectAll("circle").data(world_data.filter((d) => d.year === scatterYear)))
        .transition()
        .attr("cy", (d) => scatterYAxis(scatterGetter(d.countrycode, scatterYAxisGetter)));
});