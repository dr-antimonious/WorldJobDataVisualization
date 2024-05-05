const selector = document.getElementById("mapData");
const yearSelector = document.getElementById("mapYear");
let colorScale, tooltipColorScale, getter,
    selection = selector.value,
    year = parseInt(yearSelector.value);

const map_svg = d3.select("#map"),
    map_width = +map_svg.attr("width"),
    map_height = +map_svg.attr("height");

const path = d3.geoPath();
const projection = d3.geoMercator()
    .scale(180)
    .center([-10,45])
    .translate([map_width / 2, map_height / 2]);

function checkMode(selection) {
    return ["rgdpeperpop", "rgdpoperpop", "empperpop"].includes(selection);
}

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
                data = `${getter(index).toFixed(2)} in 2019 USD`;
                break;
            default:
                data = `${getter(index).toFixed(0)}`;
                break;
        }
    }
    tooltip.text(`${d.properties.geounit}: ${data} (${year})`);
    return tooltip.style("visibility", "visible");
}

function pointerMove(event, d, getter) {
    const mouse = d3.pointer(event);
    const index = world_data.findIndex(
        e => (
            e.countrycode === d.properties.adm0_a3 &&
            e.year === year
        )
    );
    const color = index === -1 ? "#D3D3D3" : colorScale(getter(index));
    const textColor = index === -1 ? "#000000" : tooltipColorScale(getter(index));
    return tooltip.style("top", `${mouse[1] - 10}px`)
        .style("left", `${mouse[0] + 20}px`)
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

function eventFunction(getter) {
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
        .on("pointerout", function() {
            return tooltip.style("visibility", "hidden");
        })
        .exit().remove();
}

function getPop(index) {
    return world_data[index].pop * 1000000;
}

function getEmp(index) {
    return world_data[index].emp * 1000000;
}

function getAvh(index) {
    return world_data[index].avh;
}

function getRgdpePerPop(index) {
    return world_data[index].rgdpe / world_data[index].pop;
}

function getRgdpoPerPop(index) {
    return world_data[index].rgdpo / world_data[index].pop;
}

function getEmpPerPop(index) {
    return world_data[index].emp / world_data[index].pop * 100;
}

const popDomain = [3.54965129e+06, 6.29684286e+06, 1.05705051e+07,
    2.29512369e+07, 5.03403393e+07, 1.07878131e+08];

const empDomain = [1.52150049e+06, 2.98894119e+06, 4.80059576e+06,
    1.01309953e+07, 2.06214649e+07, 4.31851316e+07];

const avhDomain = [1561.25978637, 1741.91192933, 1922.56407229,
    2103.21621525, 2283.86835822, 2464.52050118];

const rgdpePerPopDomain = [16921.78323231, 32925.06158398, 48928.33993564,
    64931.61828731, 80934.89663897, 96938.17499063];

const rgdpoPerPopDomain = [15551.01191964, 30062.91808672, 44574.8242538,
    59086.73042088, 73598.63658796, 88110.54275504];

const empPerPopDomain = [31.33061327, 38.57815155, 45.82568984,
    53.07322812, 60.32076641, 67.56830469];

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
    .style("cursor", "help")
    .on("pointerover", (event, d) => pointerOver(event, d, getter))
    .on("pointermove", (event, d) => pointerMove(event, d, getter))
    .on("pointerout", function() {
        return tooltip.style("visibility", "hidden");
    })

selector.addEventListener("change", (event) => {
    selection = event.target.value;
    selectionFunction(selection);
    eventFunction(getter);
});

yearSelector.addEventListener("change", (event) => {
    year = parseInt(event.target.value);
    eventFunction(getter);
})