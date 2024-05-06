const selector = document.getElementById("mapData");
const yearSelector = document.getElementById("mapYear");
let colorScale, tooltipColorScale, getter, domain,
    selection = selector.value,
    year = parseInt(yearSelector.value);

const map_svg = d3.select("#map"),
    map_width = +map_svg.attr("width"),
    map_height = +map_svg.attr("height");

const mapZoom = d3.zoom()
    .extent([[0, 0], [map_width, map_height]])
    .scaleExtent([1, 8])
    .translateExtent([[-100, -100], [map_width + 100, map_height + 100]])
    .filter((event) => {
        event.preventDefault();
        return (!event.ctrlKey || event.type === 'wheel') && !event.button;
    });

document.getElementById("mapReset")
    .addEventListener("click", () => {
        map_svg.transition()
            .duration(750)
            .call(mapZoom.transform, d3.zoomIdentity);
    })

map_svg.call(mapZoom.on("zoom", (event) => { map_svg.attr("transform", event.transform); }));

const path = d3.geoPath();
const projection = d3.geoMercator()
    .scale(180).center([-10,45])
    .translate([map_width / 2, map_height / 2]);

function checkMode(selection) { return ["rgdpeperpop", "rgdpoperpop", "empperpop"].includes(selection); }

function pointerOver(event, d, getter) {
    const index = world_data.findIndex(
        e => (
            e.countrycode === d.properties.adm0_a3 &&
            e.year === year
        )
    );
    let data = "No data";
    if (index !== -1) {
        switch (selection) {
            case "empperpop":
                data = `${getter(index).toFixed(0)}%`;
                break;
            case "rgdpeperpop":
            case "rgdpoperpop":
                data = `${getter(index).toFixed(2)} in 2017 USD`;
                break;
            default:
                data = `${getter(index).toFixed(0)}`;
                break;
        }
    }
    d3.select(event.currentTarget)
        .transition()
        .delay(50)
        .attr("stroke-width", "1.5px");
    tooltip.text(`${d.properties.geounit}: ${data} (${year})`);
    return tooltip.style("visibility", "visible");
}

function pointerMove(event, d, getter) {
    const index = world_data.findIndex(
        e => (
            e.countrycode === d.properties.adm0_a3 &&
            e.year === year
        )
    );
    const color = index === -1 ? "#D3D3D3" : colorScale(getter(index));
    const textColor = index === -1 ? "#000000" : tooltipColorScale(getter(index));
    return tooltip.style("top", `${event.clientY + 20}px`)
        .style("left", `${event.clientX + 20}px`)
        .style("background", color)
        .style("color", textColor);
}

function fillFunction(d, getter) {
    const index = world_data.findIndex(
        e => (
            e.countrycode === d.properties.adm0_a3 &&
            e.year === year
        )
    );
    if (index === -1) return "#D3D3D3";
    return colorScale(getter(index));
}

function getPop(index) { return world_data[index].pop * 1000000; }
function getEmp(index) { return world_data[index].emp * 1000000; }
function getAvh(index) { return world_data[index].avh; }
function getRgdpePerPop(index) { return world_data[index].rgdpe / world_data[index].pop; }
function getRgdpoPerPop(index) { return world_data[index].rgdpo / world_data[index].pop; }
function getEmpPerPop(index) { return world_data[index].emp / world_data[index].pop * 100; }

const popDomain = [3550000, 6300000, 10000000, 23000000, 50000000, 110000000];
const empDomain = [1500000, 3000000, 4800000, 10100000, 20600000, 43200000];
const avhDomain = [1560, 1740, 1920, 2100, 2285, 2465];
const rgdpePerPopDomain = [17000, 33000, 49000, 65000, 81000, 97000];
const rgdpoPerPopDomain = [16000, 30000, 45000, 60000, 74000, 88000];
const empPerPopDomain = [30, 40, 45, 55, 60, 65];

const popColorScale = d3.scaleThreshold()
    .domain(popDomain)
    .range(d3.schemeBlues[7]);

const empColorScale = d3.scaleThreshold()
    .domain(empDomain)
    .range(d3.schemeGreens[7]);

const avhColorScale = d3.scaleThreshold()
    .domain(avhDomain)
    .range(d3.schemeReds[7]);

const rgdpePerPopColorScale = d3.scaleThreshold()
    .domain(rgdpePerPopDomain)
    .range(d3.schemeYlGn[7]);

const rgdpoPerPopColorScale = d3.scaleThreshold()
    .domain(rgdpoPerPopDomain)
    .range(d3.schemeYlGn[7]);

const empPerPopColorScale = d3.scaleThreshold()
    .domain(empPerPopDomain)
    .range(d3.schemeYlGn[7]);

const popTooltipColorScale = d3.scaleThreshold()
    .domain([popDomain[3]])
    .range(["black", "white"]);

const empTooltipColorScale = d3.scaleThreshold()
    .domain([empDomain[3]])
    .range(["black", "white"]);

const avhTooltipColorScale = d3.scaleThreshold()
    .domain([avhDomain[1]])
    .range(["black", "white"]);

const rgdpePerPopTooltipColorScale = d3.scaleThreshold()
    .domain([rgdpePerPopDomain[3]])
    .range(["black", "white"]);

const rgdpoPerPopTooltipColorScale = d3.scaleThreshold()
    .domain([rgdpoPerPopDomain[3]])
    .range(["black", "white"]);

const empPerPopTooltipColorScale = d3.scaleThreshold()
    .domain([empPerPopDomain[3]])
    .range(["black", "white"]);

function selectionFunction(selection) {
    switch (selection) {
        case "pop":
            colorScale = popColorScale;
            tooltipColorScale = popTooltipColorScale;
            getter = getPop;
            break;
        case "emp":
            colorScale = empColorScale;
            tooltipColorScale = empTooltipColorScale;
            getter = getEmp;
            break;
        case "avh":
            colorScale = avhColorScale;
            tooltipColorScale = avhTooltipColorScale;
            getter = getAvh;
            break;
        case "rgdpeperpop":
            colorScale = rgdpePerPopColorScale;
            tooltipColorScale = rgdpePerPopTooltipColorScale;
            getter = getRgdpePerPop;
            break;
        case "rgdpoperpop":
            colorScale = rgdpoPerPopColorScale;
            tooltipColorScale = rgdpoPerPopTooltipColorScale;
            getter = getRgdpoPerPop;
            break;
        case "empperpop":
            colorScale = empPerPopColorScale;
            tooltipColorScale = empPerPopTooltipColorScale;
            getter = getEmpPerPop;
            break;
    }
}
selectionFunction(selection);

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "montserrat-regular")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background", "#D3D3D3");

const mapLegendElement = d3.select("body")
    .append("svg")
    .attr("class", "montserrat-regular mapLegend")
    .style("position", "absolute")
    .style("top", "600px")
    .style("left", "225px")
    .style("z-index", "5")
    .style("width", "250px")
    .style("background", "transparent");

const mapLegend = d3.legendColor()
    .labelFormat(d3.format(".0f"))
    .labels(d3.legendHelpers.thresholdLabels)
    .scale(colorScale);

map_svg.selectAll("path.country")
    .data(world.features)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("id", (d) => {
        return d.properties.adm0_a3;
    })
    .attr("d", d3.geoPath().projection(projection))
    .attr("fill", (d) => fillFunction(d, getter))
    .attr("stroke", () => {
        return checkMode(selection) ? "black" : "white";
    })
    .attr("stroke-width", () => {
        return checkMode(selection) ? "0.1px" : "0.25px";
    })
    .style("pointer-events", "all")
    .style("cursor", "pointer")
    .on("pointerover", (event, d) => pointerOver(event, d, getter))
    .on("pointermove", (event, d) => pointerMove(event, d, getter))
    .on("pointerout", (event) => {
        d3.select(event.currentTarget)
            .transition()
            .delay(50)
            .attr("stroke-width", () => {
            return checkMode(selection) ? "0.1px" : "0.25px";
        });
        return tooltip.style("visibility", "hidden");
    });

mapLegendElement.call(mapLegend);

function eventFunction(getter) {
    mapLegend.scale(colorScale);
    mapLegendElement.call(mapLegend);
    map_svg.selectAll("path.country")
        .data(world.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .merge(map_svg.selectAll("path.country").data(world.features))
        .transition()
        .duration(500)
        .attr("fill", (d) => fillFunction(d, getter))
        .attr("stroke", () => {
            return checkMode(selection) ? "black" : "white";
        })
        .attr("stroke-width", () => {
            return checkMode(selection) ? "0.1px" : "0.25px";
        })
        .on("pointerover", (event, d) => pointerOver(event, d, getter))
        .on("pointermove", (event, d) => pointerMove(event, d, getter))
        .on("pointerout", (event) => {
            d3.select(event.currentTarget)
                .transition()
                .delay(50)
                .attr("stroke-width", () => {
                return checkMode(selection) ? "0.1px" : "0.25px";
            });
            return tooltip.style("visibility", "hidden");
        })
        .exit().remove();
}

selector.addEventListener("change", (event) => {
    selection = event.target.value;
    selectionFunction(selection);
    eventFunction(getter);
});

yearSelector.addEventListener("change", (event) => {
    year = parseInt(event.target.value);
    eventFunction(getter);
});