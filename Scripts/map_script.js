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

function pointerOver(event, d, getter) {
    const index = world_data.findIndex(
        e => (
            e.countrycode === d.properties.adm0_a3 &&
            e.year === year
        )
    );
    const data = index === -1 ? "No data" : `${(getter(index)).toFixed(0)}`;
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
        .on("pointerover", (event, d) => pointerOver(event, d, getter))
        .on("pointermove", (event, d) => pointerMove(event, d, getter))
        .on("pointerout", function() {
            return tooltip.style("visibility", "hidden");
        })
        .exit().remove();
}

function getAvh(index) {
    return world_data[index].avh;
}

function getPop(index) {
    return world_data[index].pop * 1000000;
}

const popColorScale = d3.scaleThreshold()
    .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
    .range(d3.schemeBlues[7]);

const avhColorScale = d3.scaleThreshold()
    .domain([1379.3430784, 1561.25978637, 1741.91192933, 1922.56407229, 2103.21621525,
        2283.86835822, 2464.52050118, 2645.17264414])
    .range(d3.schemeGreens[7]);

const popTooltipColorScale = d3.scaleThreshold()
    .domain([30000000])
    .range(["black", "white"]);

function selectionFunction(selection) {
    switch (selection) {
        case "avh":
            colorScale = avhColorScale;
            tooltipColorScale = popTooltipColorScale;
            getter = getAvh;
            break;
        case "pop":
            colorScale = popColorScale;
            tooltipColorScale = popTooltipColorScale;
            getter = getPop;
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