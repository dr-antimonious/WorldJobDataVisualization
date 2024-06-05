"use strict";

// Top 10/Bottom 10 selection dropdown menu
const rankTopBottomSelector = document.getElementById("rankTopBottomData");

// X-axis statistic selection dropdown menu
const rankXAxisSelector = document.getElementById("rankXAxisData");

// Rank year selection slider
const rankYearSelector = document.getElementById("rankYear");

// Rank year selection slider label
const rankYearLabel = document.getElementById("rankYearLabel");

// Map time animation timer
let rankTimer = undefined;

/**
 * Start rank time animation
 *
 * Prema: d3-timer <https://d3js.org/d3-timer#interval>
 */
function startRankTimer() {
    if (rankTimer !== undefined) rankTimer.stop();
    rankTimer = d3.interval(() => {
        rankYearSelector.value = `${rankYear + 1 > 2019 ? minYear : rankYear + 1}`;
        rankYearSelector.dispatchEvent(new InputEvent("input"));
    }, 2000);
}

function descSort(a, b) { return a < b ? 1 : a > b ? -1 : 0; }
function ascSort(a, b) { return a > b ? 1 : a < b ? -1 : 0; }

/**
 * Prema: MDN <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort>
 */
function getCountries() {
    oldRankCountries = rankCountries;
    rankCountries = world_data.filter((d) => d.year === rankYear)
        .sort((a, b) => rankGetterMode
            ? descSort(rankXAxisGetter(a), rankXAxisGetter(b))
            : ascSort(rankXAxisGetter(a), rankXAxisGetter(b)))
        .splice(0, 20)
        .sort((a, b) => descSort(rankXAxisGetter(a), rankXAxisGetter(b)));
}

/**
 * Prema: Stack Overflow <https://stackoverflow.com/questions/42859220/min-and-max-values-of-an-array-of-dictionaries-json>
 *
 * Prema: MDN <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max>
 */
function findMax(){
    let values = [];
    rankCountries.forEach((e) => {
        if (e.year === rankYear) values.push(rankXAxisGetter(e));
    });
    return Math.max(...values);
}

function rankTooltipGetter(d, getter) {
    switch (rankXAxisSelection) {
        case statistics[1]: return `${getter(findCountry(d, rankYear)).toFixed(0)}%`;
        case statistics[2]: case statistics[3]: return `${getter(findCountry(d, rankYear)).toFixed(2)} in 2017 USD`;
        default: return `${getter(findCountry(d, rankYear)).toFixed(0)}`;
    }
}

/**
 * Prema: D3.js Graph Gallery <https://d3-graph-gallery.com/graph/interactivity_tooltip.html>
 */
function rankPointerOver(event, d, getter) {
    let data = rankTooltipGetter(d, getter);
    d3.select(event.currentTarget)
        .transition().duration(100)
        .attr("stroke-width", "1.5px");
    rankTooltip.text(`Value: ${data}`);
    return rankTooltip.style("visibility", "visible");
}

/**
 * Prema: D3.js Graph Gallery <https://d3-graph-gallery.com/graph/interactivity_tooltip.html>
 */
function rankPointerMove(event, d) {
    const color = continentColor(getContinent(d));
    const textColor = "white";
    return rankTooltip.style("top", `${event.pageY + 20}px`)
        .style("left", `${event.pageX + 20}px`)
        .style("background", color)
        .style("color", textColor);
}

/**
 * Prema: D3.js Graph Gallery <https://d3-graph-gallery.com/graph/interactivity_tooltip.html>
 */
function rankPointerOut() {
    return rankTooltip.style("visibility", "hidden");
}

// Necessary global variables
let rankXAxisGetter, rankGetterMode,
    oldRankCountries, rankCountries,
    rankXAxisSelection = rankXAxisSelector.value,
    rankTopBottomSelection = rankTopBottomSelector.value,
    rankYear = parseInt(rankYearSelector.value);

function rankSelectionFunction(selection) {
    switch (selection) {
        case statistics[0]: return getAvh;
        case statistics[1]: return getEmpPerPop;
        case statistics[2]: return getRgdpePerPop;
        case statistics[3]: return getRgdpoPerPop;
        case statistics[4]: return getPop;
        case statistics[5]: return getEmp;
    }
}
rankXAxisGetter = rankSelectionFunction(rankXAxisSelection);
rankGetterMode = rankTopBottomSelection === 'top';
getCountries();

const rankTooltip = d3.select("div#rankTooltip"),
    rankMargin = {top: 30, right: 50, bottom: 10, left: 150},
    rankWidth = 82.5 * visualViewport.width / 100 - rankMargin.left - rankMargin.right,
    rankHeight = 85 * visualViewport.height / 100 - rankMargin.top - rankMargin.bottom;

const rankPlot = d3.select("#rank")
        .attr("width", rankWidth + rankMargin.left + rankMargin.right)
        .attr("height", rankHeight + rankMargin.top + rankMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + rankMargin.left + "," + rankMargin.top + ")"),
    rankXAxis = d3.scaleLinear()
        .domain([0, findMax()])
        .range([0, rankWidth])
        .unknown(0),
    rankYAxis = d3.scaleBand()
        .domain(rankCountries.map((d) => getCountry(d.countrycode)))
        .range([0, rankHeight])
        .padding(.1);

d3.select("#rankLegend")
    .call(continentLegend);

const rankPlotYAxis = rankPlot.append("g")
        .call(d3.axisLeft(rankYAxis)),
    rankPlotXAxis = rankPlot.append("g")
        .attr("transform", "translate(0,0)")
        .call(d3.axisTop(rankXAxis));

/**
 * Prema: D3.js Graph Gallery <https://d3-graph-gallery.com/graph/barplot_horizontal.html>
 */
rankPlot.selectAll("rect")
    .data(countryCodes)
    .enter()
    .append("rect")
    .attr("x", rankXAxis(0))
    .attr("y", (d) =>
        rankCountries.find((e) => e.countrycode === d) === undefined
            ? rankGetterMode
                ? rankHeight + rankMargin.top + rankMargin.bottom
                : 0
            : rankYAxis(getCountry(d)))
    .attr("width", (d) => rankXAxis(rankXAxisGetter(rankCountries.find((e) => e.countrycode === d))))
    .attr("height", rankYAxis.bandwidth())
    .attr("fill", (d) => continentColor(getContinent(d)))
    .on("pointerover", (event, d) => rankPointerOver(event, d, rankXAxisGetter))
    .on("pointermove", (event, d) => rankPointerMove(event, d))
    .on("pointerout", () => rankPointerOut());

/**
 * Prema: D3.js Graph Gallery <https://d3-graph-gallery.com/graph/barplot_horizontal.html>
 */
function rankEvent(duration) {
    setTimeout(() => {
        rankPlot.selectAll("rect")
            .on("pointerover", (event, d) => rankPointerOver(event, d, rankXAxisGetter))
            .on("pointermove", (event, d) => rankPointerMove(event, d))
            .on("pointerout", () => rankPointerOut());
    }, duration);
    rankPlot.selectAll("rect")
        .data(countryCodes)
        .enter()
        .join("rect")
        .merge(rankPlot.selectAll("rect").data(countryCodes))
        .transition()
        .duration(duration)
        .attr("x", rankXAxis(0))
        .attr("y", (d) =>
            rankCountries.find((e) => e.countrycode === d) === undefined
                ? rankGetterMode
                    ? rankHeight + rankMargin.top + rankMargin.bottom
                    : 0
                : rankYAxis(getCountry(d)))
        .attr("width", (d) => rankXAxis(rankXAxisGetter(rankCountries.find((e) => e.countrycode === d))))
        .attr("height", rankYAxis.bandwidth())
        .attr("fill", (d) => continentColor(getContinent(d)));
}

function disableTooltip() {
    rankPlot.selectAll("rect")
        .on("pointerover", null)
        .on("pointermove", null)
        .on("pointerout", null);
}

/**
 * Prema: D3.js Graph Gallery <https://d3-graph-gallery.com/graph/barplot_horizontal.html>
 */
rankTopBottomSelector.addEventListener("change", (event) => {
    disableTooltip();
    rankTopBottomSelection = event.target.value;
    rankGetterMode = rankTopBottomSelection === 'top';
    getCountries();
    rankXAxis.domain([0, findMax()]);
    rankPlotXAxis.transition().call(d3.axisTop(rankXAxis));
    rankYAxis.domain(rankCountries.map((d) => getCountry(d.countrycode)));
    rankPlotYAxis.transition().call(d3.axisLeft(rankYAxis));
    rankEvent(500);
});

/**
 * Prema: D3.js Graph Gallery <https://d3-graph-gallery.com/graph/barplot_horizontal.html>
 */
rankXAxisSelector.addEventListener("change", (event) => {
    disableTooltip();
    rankXAxisSelection = event.target.value;
    rankXAxisGetter = rankSelectionFunction(rankXAxisSelection);
    getCountries();
    rankXAxis.domain([0, findMax()]);
    rankPlotXAxis.transition().call(d3.axisTop(rankXAxis));
    rankYAxis.domain(rankCountries.map((d) => getCountry(d.countrycode)));
    rankPlotYAxis.transition().call(d3.axisLeft(rankYAxis));
    rankEvent(500);
});

/**
 * Prema: D3.js Graph Gallery <https://d3-graph-gallery.com/graph/barplot_horizontal.html>
 */
rankYearSelector.addEventListener("input", (event) => {
    disableTooltip();
    rankYear = parseInt(event.target.value);
    rankYearLabel.innerHTML = event.target.value;
    getCountries();
    rankXAxis.domain([0, findMax()]);
    rankPlotXAxis.transition().duration(1000).call(d3.axisTop(rankXAxis));
    rankYAxis.domain(rankCountries.map((d) => getCountry(d.countrycode)));
    rankPlotYAxis.transition().duration(1000).call(d3.axisLeft(rankYAxis));
    rankEvent(1000);
});