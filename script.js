let year = 2019
const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

const path = d3.geoPath();
const projection = d3.geoMercator()
    .scale(180)
    .center([-10,45])
    .translate([width / 2, height / 2]);

const colorScale = d3.scaleThreshold()
    .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
    .range(d3.schemeBlues[7]);

svg.append("g")
    .selectAll("path")
    .data(world.features)
    .join("path")
    .attr("d", d3.geoPath()
        .projection(projection)
    )
    .attr("fill", function(d){
        const index = world_data.findIndex(
            e => (
                e.countrycode === d.properties.adm0_a3 &&
                e.year === year
            )
        );
        if (index === -1) return 0;
        return colorScale(world_data[index].pop * 1000000);
    })