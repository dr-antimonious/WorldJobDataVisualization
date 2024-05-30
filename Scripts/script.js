"use strict";

const countryCodes = [...new Set(world_data.map(d => d.countrycode))],
    regions = new Set(world.features.map(d => d.properties.continent)),
    continentColor = d3.scaleOrdinal(d3.schemeCategory10).domain(regions.values()),
    continentLegend = d3.legendColor().scale(continentColor);

// Finder function
function findIndex(countryCode, year) {
    return world_data.findIndex(
        e => (
            e.countrycode === countryCode &&
            e.year === year
        )
    );
}

function findCountry(d, year) {
    return world_data.find((e) =>
        e.year === year && e.countrycode === d
    );
}

function getContinent(countryCode) {
    return world.features.find(
        e => e.properties.adm0_a3 === countryCode
    ).properties.continent;
}

function getCountry(countryCode) {
    return world.features.find(
        e => e.properties.adm0_a3 === countryCode
    ).properties.geounit;
}

// Getters

function getPop(arg) {
    if (arg === undefined) return NaN;
    return typeof(arg) === "number"
        ? world_data[arg].pop * 1000000
        : arg.pop * 1000000;
}

function getEmp(arg) {
    if (arg === undefined) return NaN;
    return typeof(arg) === "number"
        ? world_data[arg].emp * 1000000
        : arg.emp * 1000000;
}

function getAvh(arg) {
    if (arg === undefined) return NaN;
    return typeof(arg) === "number"
        ? world_data[arg].avh
        : arg.avh;
}

function getRgdpePerPop(arg) {
    if (arg === undefined) return NaN;
    return typeof(arg) === "number"
        ? world_data[arg].rgdpe / world_data[arg].pop
        : arg.rgdpe / arg.pop;
}

function getRgdpoPerPop(arg) {
    if (arg === undefined) return NaN;
    return typeof(arg) === "number"
        ? world_data[arg].rgdpo / world_data[arg].pop
        : arg.rgdpo / arg.pop;
}

function getEmpPerPop(arg) {
    if (arg === undefined) return NaN;
    return typeof(arg) === "number"
        ? world_data[arg].emp / world_data[arg].pop * 100
        : arg.emp / arg.pop * 100;
}