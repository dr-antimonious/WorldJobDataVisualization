"use strict";

// Y-axis statistic selection dropdown menu
const scatterYAxisSelector = document.getElementById("scatterYAxisData");

// X-axis statistic selection dropdown menu
const scatterXAxisSelector = document.getElementById("scatterXAxisData");

// Scatter year selection slider
const scatterYearSelector = document.getElementById("scatterYear");

// Scatter year selection slider label
const scatterYearLabel = document.getElementById("scatterYearLabel");

// Scatter time animation timer
let scatterTimer = undefined;

/**
 * Start scatter time animation
 *
 * Prema: d3-timer <https://d3js.org/d3-timer#interval>
 */
function startScatterTimer() {
    if (scatterTimer !== undefined) scatterTimer.stop();
    scatterTimer = d3.interval(() => {
        scatterYearSelector.value = `${scatterYear + 1 > 2019 ? minYear : scatterYear + 1}`;
        scatterYearSelector.dispatchEvent(new InputEvent("input"));
    }, 1000);
}

/**
 * Prema: Stack Overflow <https://stackoverflow.com/questions/42859220/min-and-max-values-of-an-array-of-dictionaries-json>
 *
 * Prema: MDN <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min>
 */
function findDomain(year, getter) {
    let values = [];
    world_data.forEach((e, index) => {
        if (e.year === year) values.push(getter(index))
    });
    return [Math.min(...values) * 0.95, Math.max(...values) * 1.05];
}

function scatterGetter(countryCode, getter) {
    const index = findIndex(countryCode, scatterYear);
    return index === -1 ? NaN : getter(index);
}

function scatterSizeFunction(countryCode, XGetter, YGetter, scatterSize) {
    return !isNaN(scatterGetter(countryCode, XGetter))
        && !isNaN(scatterGetter(countryCode, YGetter))
        ? scatterSize(scatterGetter(countryCode, getPop))
        : 0;
}

function scatterTooltipGetter(d, getter) {
    switch (scatterXAxisSelection) {
        case statistics[1]: return `${getter(findCountry(d, scatterYear)).toFixed(0)}%`;
        case statistics[2]: case statistics[3]: return `${getter(findCountry(d, scatterYear)).toFixed(2)} in 2017 USD`;
        default: return `${getter(findCountry(d, scatterYear)).toFixed(0)}`;
    }
}

/**
 * Prema: D3.js Graph Gallery <https://d3-graph-gallery.com/graph/interactivity_tooltip.html>
 */
function scatterPointerOver(event, d, XGetter, YGetter) {
    let XData = scatterTooltipGetter(d, XGetter),
        YData = scatterTooltipGetter(d, YGetter),
        populationData = getPop(findCountry(d, scatterYear));
    d3.select(event.currentTarget)
        .transition().duration(100)
        .attr("stroke-width", "1.5px");
    scatterTooltip.text(`${getCountry(d)} (${scatterYear})
${scatterXAxisSelector.options[scatterXAxisSelector.selectedIndex].text}: ${XData}
${scatterYAxisSelector.options[scatterYAxisSelector.selectedIndex].text}: ${YData}
Population: ${populationData}`);
    return scatterTooltip.style("visibility", "visible");
}

/**
 * Prema: D3.js Graph Gallery <https://d3-graph-gallery.com/graph/interactivity_tooltip.html>
 */
function scatterPointerMove(event, d) {
    const color = continentColor(getContinent(d));
    const textColor = "white";
    return scatterTooltip.style("top", `${event.pageY + 20}px`)
        .style("left", `${event.pageX + 20}px`)
        .style("background", color)
        .style("color", textColor);
}

/**
 * Prema: D3.js Graph Gallery <https://d3-graph-gallery.com/graph/interactivity_tooltip.html>
 */
function scatterPointerOut() {
    return scatterTooltip.style("visibility", "hidden");
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

const scatterTooltip = d3.select("div#scatterTooltip"),
    scatterSize = d3.scaleLog().domain(scatterSizeDomain).range([5, 20]).unknown(0);

const scatterMargin = {top: 10, right: 30, bottom: 30, left: 200},
    scatterWidth = 82.5 * visualViewport.width / 100 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 85 * visualViewport.height / 100 - scatterMargin.top - scatterMargin.bottom;

const scatterPlot = d3.select("#scatter")
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

d3.select("#scatterLegend")
    .call(continentLegend);

const scatterPlotYAxis = scatterPlot.append("g")
        .call(d3.axisLeft(scatterYAxis)),
    scatterPlotXAxis = scatterPlot.append("g")
        .attr("transform", "translate(0," + scatterHeight + ")")
        .call(d3.axisBottom(scatterXAxis)),
    scatterPlotDots = scatterPlot.append("g");

/**
 * Prema: D3.js Graph Gallery <https://d3-graph-gallery.com/graph/scatter_grouped_highlight.html>
 */
scatterPlotDots.selectAll("dot")
    .data(countryCodes)
    .enter()
    .append("circle")
    .attr("class", (d) => `dot ${getContinent(d)}`)
    .attr("cx", (d) => scatterXAxis(scatterGetter(d, scatterXAxisGetter)))
    .attr("cy", (d) => scatterYAxis(scatterGetter(d, scatterYAxisGetter)))
    .attr("r", (d) => scatterSizeFunction(d, scatterXAxisGetter, scatterYAxisGetter, scatterSize))
    .style("fill", (d) => continentColor(getContinent(d)))
    .on("pointerover", (event, d) => scatterPointerOver(event, d, scatterXAxisGetter, scatterYAxisGetter))
    .on("pointermove", (event, d) => scatterPointerMove(event, d))
    .on("pointerout", () => scatterPointerOut());

/**
 * Prema: D3.js Graph Gallery <https://d3-graph-gallery.com/graph/scatter_grouped_highlight.html>
 */
scatterXAxisSelector.addEventListener("change", (event) => {
    scatterXAxisSelection = event.target.value;
    scatterXAxisGetter = scatterSelectionFunction(scatterXAxisSelection);
    scatterXAxis.domain(findDomain(scatterYear, scatterXAxisGetter));
    scatterPlotXAxis.transition().call(d3.axisBottom(scatterXAxis));
    scatterPlotDots.selectAll("circle")
        .data(countryCodes)
        .enter()
        .join("circle")
        .merge(scatterPlot.selectAll("circle").data(countryCodes))
        .transition()
        .attr("cx", (d) => scatterXAxis(scatterGetter(d, scatterXAxisGetter)));
});

/**
 * Prema: D3.js Graph Gallery <https://d3-graph-gallery.com/graph/scatter_grouped_highlight.html>
 */
scatterYAxisSelector.addEventListener("change", (event) => {
    scatterYAxisSelection = event.target.value;
    scatterYAxisGetter = scatterSelectionFunction(scatterYAxisSelection);
    scatterYAxis.domain(findDomain(scatterYear, scatterYAxisGetter));
    scatterPlotYAxis.transition().call(d3.axisLeft(scatterYAxis));
    scatterPlotDots.selectAll("circle")
        .data(countryCodes)
        .enter()
        .join("circle")
        .merge(scatterPlot.selectAll("circle").data(countryCodes))
        .transition()
        .attr("cy", (d) => scatterYAxis(scatterGetter(d, scatterYAxisGetter)));
});

/**
 * Prema: D3.js Graph Gallery <https://d3-graph-gallery.com/graph/scatter_grouped_highlight.html>
 */
scatterYearSelector.addEventListener("input", (event) => {
    scatterYear = parseInt(event.target.value);
    scatterYearLabel.innerHTML = event.target.value;
    scatterXAxis.domain(findDomain(scatterYear, scatterXAxisGetter));
    scatterPlotXAxis.transition().call(d3.axisBottom(scatterXAxis));
    scatterYAxis.domain(findDomain(scatterYear, scatterYAxisGetter));
    scatterPlotYAxis.transition().call(d3.axisLeft(scatterYAxis));
    scatterSizeDomain = findDomain(scatterYear, getPop);
    scatterSize.domain(scatterSizeDomain);
    scatterPlotDots.selectAll("circle")
        .data(countryCodes)
        .enter()
        .join("circle")
        .merge(scatterPlot.selectAll("circle").data(countryCodes))
        .transition()
        .attr("cy", (d) => scatterYAxis(scatterGetter(d, scatterYAxisGetter)))
        .attr("cx", (d) => scatterXAxis(scatterGetter(d, scatterXAxisGetter)))
        .attr("r", (d) => scatterSizeFunction(d, scatterXAxisGetter, scatterYAxisGetter, scatterSize));
});