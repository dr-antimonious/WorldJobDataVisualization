"use strict";

// Finder function
function findIndex(countryCode, year) {
    return world_data.findIndex(
        e => (
            e.countrycode === countryCode &&
            e.year === year
        )
    );
}

function getContinent(countryCode) {
    return world.features.find(
        e => e.properties.adm0_a3 === countryCode
    ).properties.continent;
}

// Getters

function getPop(index) { return world_data[index].pop * 1000000; }
function getEmp(index) { return world_data[index].emp * 1000000; }
function getAvh(index) { return world_data[index].avh; }
function getRgdpePerPop(index) { return world_data[index].rgdpe / world_data[index].pop; }
function getRgdpoPerPop(index) { return world_data[index].rgdpo / world_data[index].pop; }
function getEmpPerPop(index) { return world_data[index].emp / world_data[index].pop * 100; }