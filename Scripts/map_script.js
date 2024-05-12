// Statistic selection dropdown menu
const mapSelector = document.getElementById("mapData");

// Map bar chart right axis statistic selection dropdown menu
const mapBarSelector = document.getElementById("mapBarData");

// Map bar chart right axis statistic selection dropdown menu options
const mapBarSelectorOptions = document.getElementsByClassName("mapBarOptions");

// Year selection slider
const mapYearSelector = document.getElementById("mapYear");

// Year selection slider label
const mapYearLabel = document.getElementById("mapYearLabel");

// Necessary global variables
let mapColorScale, mapTooltipColorScale, mapGetter, mapBarGetter,
    mapSelection = mapSelector.value,
    mapYear = parseInt(mapYearSelector.value),
    mapBarSelection = mapBarSelector.value;

const mapWidth = 82.5 * visualViewport.width / 100,
    mapHeight = 85 * visualViewport.height / 100,
    mapBarMargin = {top: 15, right: 100, bottom: 50, left: 100},
    mapBarWidth = 550 - mapBarMargin.left - mapBarMargin.right,
    mapBarHeight = 310 - mapBarMargin.top - mapBarMargin.bottom;

// World map SVG element
const mapSvg = d3.select("#map")
    .attr("width", mapWidth)
    .attr("height", mapHeight);

// Map zoom behaviour
const mapZoom = d3.zoom()
    .extent([[0, 0], [mapWidth, mapHeight]])
    .scaleExtent([1, 10])
    .translateExtent([[-100, -100], [mapWidth + 100, mapHeight + 100]])
    .filter((event) => {
        event.preventDefault();
        return (!event.ctrlKey || event.type === 'wheel') && !event.button;
    });

// Map reset button behaviour
document.getElementById("mapReset")
    .addEventListener("click", () => {
        mapSvg.transition()
            .duration(750)
            .call(mapZoom.transform, d3.zoomIdentity);
    });

// Map pointer behaviour
document.getElementById("mapContainer")
    .addEventListener("pointerdown", () => mapSvg.style("cursor", "move"));
document.getElementById("mapContainer")
    .addEventListener("pointerup", () => mapSvg.style("cursor", "default"));

// Map zoom behaviour
mapSvg.call(mapZoom.on("zoom", (event) => mapSvg.attr("transform", event.transform)));

const mapProjection = d3.geoMercator()
    .scale(180).center([-10,45])
    .translate([mapWidth / 2, mapHeight / 2]);

// Checks whether the selected statistic is `rgdpeperpop`, `rgdpoperpop`, or `empperpop`
function mapCheckMode(selection) { return [statistics[2], statistics[3], statistics[1]].includes(selection); }

function mapFindIndex(countryCode, year) {
    return world_data.findIndex(
        e => (
            e.countrycode === countryCode &&
            e.year === year
        )
    );
}

function hideMapBarRightValues() {
    mapBarRightAxis.style("visibility", "hidden");
    mapBarSecondLine.style("visibility", "hidden");
    mapBarRightAxisLabel.style("visibility", "hidden");
}

// Country pointerOver behaviour
function mapPointerOver(event, d, getter) {
    const index = mapFindIndex(d.properties.adm0_a3, mapYear);
    let data = "No data";
    if (index !== -1) {
        switch (mapSelection) {
            case statistics[1]: data = `${getter(index).toFixed(0)}%`; break;
            case statistics[2]: case statistics[3]: data = `${getter(index).toFixed(2)} in 2017 USD`; break;
            default: data = `${getter(index).toFixed(0)}`; break;
        }
    }
    d3.select(event.currentTarget)
        .transition().duration(100)
        .attr("stroke-width", "1.5px");
    mapTooltip.text(`${d.properties.geounit}: ${data} (${mapYear})`);
    return mapTooltip.style("visibility", "visible");
}

// Country pointerMove behaviour
function mapPointerMove(event, d, getter) {
    const index = mapFindIndex(d.properties.adm0_a3, mapYear);
    const color = index === -1 ? "#D3D3D3" : mapColorScale(getter(index));
    const textColor = index === -1 ? "black" : mapTooltipColorScale(getter(index));
    return mapTooltip.style("top", `${event.pageY + 20}px`)
        .style("left", `${event.pageX + 20}px`)
        .style("background", color)
        .style("color", textColor);
}

// Country pointerOut behaviour
function mapPointerOut(event) {
    d3.select(event.currentTarget)
        .transition().duration(100)
        .attr("stroke-width", () => mapStrokeWidth());
    return mapTooltip.style("visibility", "hidden");
}

// Country click behaviour
function mapClick(event, d, getter) {
    let data = [];

    if (d.properties.adm0_a3 !== mapBarPlot.attr("id"))
    {
        mapBarPlot.attr("id", d.properties.adm0_a3);
        hideMapBarRightValues();
        mapBarSelector.value = "";
    }

    const countryCode = mapBarPlot.attr("id");
    yearArray.forEach((year, i) => {
        const index = mapFindIndex(countryCode, parseInt(year));
        if (index !== -1) { data.push({year: d3YearArray[i], value: getter(index)}) }
    });

    if (data.length === 0) {
        return mapBarPlotContainer.style("visibility", "hidden");
    }

    mapBarPlotTitle.text(d.properties.geounit);
    mapBarLeftAxisLabel.text(mapSelector.options[mapSelector.selectedIndex].innerHTML);

    const mapBarLeftAxisValues = d3.scaleLinear()
        .domain([d3.min(data, (d) => d.value) * 0.95,
            d3.max(data, (d) => d.value) * 1.05])
        .range([mapBarHeight, 0]);
    mapBarLeftAxis.call(d3.axisLeft(mapBarLeftAxisValues));

    mapBarLine.datum(data)
        .transition().duration(250)
        .attr("fill", "none")
        .attr("stroke", "#050A30")
        .attr("stroke-width", "1.5px")
        .attr("d", d3.line()
            .x(d => mapBarTimeAxis(d.year))
            .y(d => mapBarLeftAxisValues(d.value)));

    mapBarPlotContainer
        .style("top", (event.pageY - 20) + mapBarPlotContainer.node().getBoundingClientRect().height > mapHeight
            ? `${event.pageY - mapBarPlotContainer.node().getBoundingClientRect().height}px`
            : `${event.pageY - 20}px`)
        .style("left", (event.pageX + 20) + mapBarPlotContainer.node().getBoundingClientRect().width > mapWidth
            ? `${event.pageX - 20 - mapBarPlotContainer.node().getBoundingClientRect().width}px`
            : `${event.pageX + 20}px`)
        .style("visibility", "visible");
}

// Country fill function
function mapFillFunction(countryCode, getter) {
    const index = mapFindIndex(countryCode, mapYear);
    if (index === -1) return "#D3D3D3";
    return mapColorScale(getter(index));
}

// Getters

function getPop(index) { return world_data[index].pop * 1000000; }
function getEmp(index) { return world_data[index].emp * 1000000; }
function getAvh(index) { return world_data[index].avh; }
function getRgdpePerPop(index) { return world_data[index].rgdpe / world_data[index].pop; }
function getRgdpoPerPop(index) { return world_data[index].rgdpo / world_data[index].pop; }
function getEmpPerPop(index) { return world_data[index].emp / world_data[index].pop * 100; }

const popDomain = [3550000, 6300000, 10000000, 23000000, 50000000, 110000000],
    empDomain = [1500000, 3000000, 4800000, 10100000, 20600000, 43200000],
    avhDomain = [1560, 1740, 1920, 2100, 2285, 2465],
    rgdpePerPopDomain = [17000, 33000, 49000, 65000, 81000, 97000],
    rgdpoPerPopDomain = [16000, 30000, 45000, 60000, 74000, 88000],
    empPerPopDomain = [30, 40, 45, 55, 60, 65];

const popColorScale = d3.scaleThreshold()
    .domain(popDomain)
    .range(d3.schemeBlues[7]),
    empColorScale = d3.scaleThreshold()
    .domain(empDomain)
    .range(d3.schemeGreens[7]),
    avhColorScale = d3.scaleThreshold()
    .domain(avhDomain)
    .range(d3.schemeReds[7]),
    rgdpePerPopColorScale = d3.scaleThreshold()
    .domain(rgdpePerPopDomain)
    .range(d3.schemeYlGn[7]),
    rgdpoPerPopColorScale = d3.scaleThreshold()
    .domain(rgdpoPerPopDomain)
    .range(d3.schemeYlGn[7]),
    empPerPopColorScale = d3.scaleThreshold()
    .domain(empPerPopDomain)
    .range(d3.schemeYlGn[7]);

const popTooltipColorScale = d3.scaleThreshold()
    .domain([popDomain[3]])
    .range(["black", "white"]),
    empTooltipColorScale = d3.scaleThreshold()
    .domain([empDomain[3]])
    .range(["black", "white"]),
    avhTooltipColorScale = d3.scaleThreshold()
    .domain([avhDomain[1]])
    .range(["black", "white"]),
    rgdpePerPopTooltipColorScale = d3.scaleThreshold()
    .domain([rgdpePerPopDomain[3]])
    .range(["black", "white"]),
    rgdpoPerPopTooltipColorScale = d3.scaleThreshold()
    .domain([rgdpoPerPopDomain[3]])
    .range(["black", "white"]),
    empPerPopTooltipColorScale = d3.scaleThreshold()
    .domain([empPerPopDomain[3]])
    .range(["black", "white"]);

function resetMapBarOptions() {
    for (let mapBarSelectorOption of mapBarSelectorOptions) {
        mapBarSelectorOption.disabled = false;
}}

// Sets global variables according to the selected statistic
function mapSelectionFunction(selection) {
    resetMapBarOptions();
    mapBarSelectorOptions[selection].disabled = true;

    switch (selection) {
        case statistics[0]:
            mapColorScale = avhColorScale;
            mapTooltipColorScale = avhTooltipColorScale;
            mapGetter = getAvh;
            break;
        case statistics[1]:
            mapColorScale = empPerPopColorScale;
            mapTooltipColorScale = empPerPopTooltipColorScale;
            mapGetter = getEmpPerPop;
            break;
        case statistics[2]:
            mapColorScale = rgdpePerPopColorScale;
            mapTooltipColorScale = rgdpePerPopTooltipColorScale;
            mapGetter = getRgdpePerPop;
            break;
        case statistics[3]:
            mapColorScale = rgdpoPerPopColorScale;
            mapTooltipColorScale = rgdpoPerPopTooltipColorScale;
            mapGetter = getRgdpoPerPop;
            break;
        case statistics[4]:
            mapColorScale = popColorScale;
            mapTooltipColorScale = popTooltipColorScale;
            mapGetter = getPop;
            break;
        case statistics[5]:
            mapColorScale = empColorScale;
            mapTooltipColorScale = empTooltipColorScale;
            mapGetter = getEmp;
            break;
    }
}
mapSelectionFunction(mapSelection);

function mapBarSelectionFunction(selection) {
    switch (selection) {
        case statistics[0]:
            mapBarGetter = getAvh;
            break;
        case statistics[1]:
            mapBarGetter = getEmpPerPop;
            break;
        case statistics[2]:
            mapBarGetter = getRgdpePerPop;
            break;
        case statistics[3]:
            mapBarGetter = getRgdpoPerPop;
            break;
        case statistics[4]:
            mapBarGetter = getPop;
            break;
        case statistics[5]:
            mapBarGetter = getEmp;
            break;
        default:
            hideMapBarRightValues();
            return false;
    }
    return true;
}

const mapTooltip = d3.select("div#mapTooltip"),
    mapBarPlotContainer = d3.select("div#mapBarPlotContainer"),
    mapBarPlot = mapBarPlotContainer.append("svg")
        .attr("width", mapBarWidth + mapBarMargin.left + mapBarMargin.right)
        .attr("height", mapBarHeight + mapBarMargin.top + mapBarMargin.bottom),
    mapBarPlotTitle = mapBarPlot.append("text")
        .attr("class", "montserrat-bold")
        .attr("text-anchor", "middle")
        .attr("x", (mapBarWidth + mapBarMargin.left + mapBarMargin.right) / 2)
        .attr("y", 15),
    mapBarLeftAxisLabel = mapBarPlot.append("text")
        .attr("class", "montserrat-bold")
        .attr("text-anchor", "middle")
        .attr("fill", "#050A30")
        .attr("y", 15)
        .attr("x", -mapBarHeight + 100)
        .attr("transform", "rotate(-90)"),
    mapBarRightAxisLabel = mapBarPlot.append("text")
        .attr("class", "montserrat-bold")
        .attr("text-anchor", "middle")
        .attr("fill", "#0000FF")
        .attr("y", -(mapBarWidth + mapBarMargin.left + mapBarMargin.right) + 15)
        .attr("x", mapBarHeight - 100)
        .attr("transform", "rotate(90)"),
    mapBarPlotSpace = mapBarPlot.append("g")
        .attr("transform", "translate(" + mapBarMargin.left + "," + mapBarMargin.top + ")"),
    mapLegendElement = d3.select("svg#mapLegend"),
    mapLegend = d3.legendColor()
        .labelFormat(d3.format(".0f"))
        .labels(d3.legendHelpers.thresholdLabels)
        .scale(mapColorScale);

mapBarPlot.append("text")
    .attr("class", "montserrat-bold")
    .attr("text-anchor", "middle")
    .attr("x", (mapBarWidth + mapBarMargin.left + mapBarMargin.right) / 2)
    .attr("y", mapBarHeight + mapBarMargin.top + mapBarMargin.bottom - 10)
    .text("Year");

const mapBarTimeAxis = d3.scaleTime()
    .domain(d3.extent(d3YearArray, (d) => d))
    .range([0, mapBarWidth]),
    mapBarLeftAxis = mapBarPlotSpace.append("g")
        .attr("id", "mapBarLeftAxis"),
    mapBarRightAxis = mapBarPlotSpace.append("g")
        .attr("id", "mapBarRightAxis")
        .attr("transform", `translate(${mapBarWidth},0)`),
    mapBarLine = mapBarPlotSpace.append("path")
        .attr("id", "mapBarLine"),
    mapBarSecondLine = mapBarPlotSpace.append("path")
        .attr("id", "mapBarSecondLine");

mapBarPlotSpace.append("g")
    .attr("transform", "translate(0," + mapBarHeight + ")")
    .call(d3.axisBottom(mapBarTimeAxis));

function mapStrokeColor() { return mapCheckMode(mapSelection) ? "black" : "white"; }
function mapStrokeWidth() { return mapCheckMode(mapSelection) ? "0.1px" : "0.25px"; }

mapSvg.selectAll("path.country")
    .data(world.features)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("id", (d) => d.properties.adm0_a3)
    .attr("d", d3.geoPath().projection(mapProjection))
    .attr("fill", (d) => mapFillFunction(d.properties.adm0_a3, mapGetter))
    .attr("stroke", () => mapStrokeColor())
    .attr("stroke-width", () => mapStrokeWidth())
    .on("pointerover", (event, d) => mapPointerOver(event, d, mapGetter))
    .on("pointermove", (event, d) => mapPointerMove(event, d, mapGetter))
    .on("pointerout", (event) => mapPointerOut(event))
    .on("click", (event, d) => mapClick(event, d, mapGetter));

mapLegendElement.call(mapLegend);

function mapEventFunction(getter) {
    mapSvg.selectAll("path.country")
        .data(world.features)
        .enter()
        .join("path")
        .attr("class", "country")
        .merge(mapSvg.selectAll("path.country").data(world.features))
        .transition()
        .duration(500)
        .attr("fill", (d) => mapFillFunction(d.properties.adm0_a3, getter))
        .attr("stroke", () => mapStrokeColor())
        .attr("stroke-width", () => mapStrokeWidth());
}

function hideMapBarPlot() {
    mapBarSelector.value = "";
    mapBarPlotContainer.style("visibility", "hidden");
    hideMapBarRightValues();
}

mapSelector.addEventListener("change", (event) => {
    mapSelection = event.target.value;
    mapSelectionFunction(mapSelection);
    mapEventFunction(mapGetter);
    mapLegend.scale(mapColorScale);
    mapLegendElement.call(mapLegend);
    hideMapBarPlot();
});

mapYearSelector.addEventListener("input", (event) => {
    mapYear = parseInt(event.target.value);
    mapYearLabel.innerHTML = event.target.value;
    mapEventFunction(mapGetter);
    hideMapBarPlot();
});

mapBarSelector.addEventListener("change", (event) => {
    mapBarSelection = event.target.value;
    if (mapBarSelectionFunction(mapBarSelection)) {
        let data = [];
        const countryCode = mapBarPlot.attr("id");
        yearArray.forEach((year, i) => {
            const index = mapFindIndex(countryCode, parseInt(year));
            if (index !== -1) {
                data.push({year: d3YearArray[i], value: mapBarGetter(index)})
            }
        });

        const mapBarRightAxisValues = d3.scaleLinear()
            .domain([d3.min(data, (d) => d.value) * 0.95,
                d3.max(data, (d) => d.value) * 1.05])
            .range([mapBarHeight, 0]);
        mapBarRightAxis.call(d3.axisRight(mapBarRightAxisValues))
            .style("visibility", "visible");

        mapBarSecondLine.datum(data)
            .transition().duration(250)
            .attr("fill", "none")
            .attr("stroke", "#0000FF")
            .attr("stroke-width", "1.5px")
            .attr("d", d3.line()
                .x(d => mapBarTimeAxis(d.year))
                .y(d => mapBarRightAxisValues(d.value)))
            .style("visibility", "visible");

        mapBarRightAxisLabel.text(mapBarSelector.options[mapBarSelector.selectedIndex].innerHTML)
            .style("visibility", "visible");
    }
});