// Ocampo, Week 5
//declare map variable globally so all functions have access
var map;
var minValue;

//step 1 create map
function createMap(){

    //create the map
    map = L.map('map', {
        center: [0, 0],
        zoom: 2
    });

// 6.1 CHANGE BASE TILELAYER - ESRI WORLD GRAY

    //add OSM base tilelayer
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
}).addTo(map);

    //call getData function
    getData(map);
};

// 6.1 CHANGE VARIABLE LOOP - year > month

function calculateMinValue(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var city of data.features){
        //loop through each month
        for(var month = 1; month <= 12; month+=1){
              //get population for current year
              var value = city.properties["Month_"+ String(month)];
              //add value to array
              allValues.push(value);
        }
    }
    //get minimum value of our array
    var minValue = Math.min(...allValues)

    return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

    return radius;
};

// 6.1 SET ATTRIBUTE VARIABLE TO MONTHS ( 1 - 12 )
// 6.2.1 CHANGE FUNCTION

//Step 3: Add circle markers for point features to the map
function pointToLayer(feature, latlng){

    //Step 4: Determine which attribute to visualize with proportional symbols
    var attribute = "Month_1";

// 6.2.1 geojsonMarkerOptions > options
    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 1,
    };

// 6.2.1 IMPLEMENT POPUPS

//For each feature, determine its value for the selected attribute

    var attValue = Number(feature.properties[attribute]);

    console.log(feature.properties, attValue);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

// 6.2.1 CHANGE POPUP CONTENTS

    //build popup content string starting with city...Example 2.1 line 24
    var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p>";

    //add formatted attribute to popup content string
    var month = attribute.split("_")[1];
    popupContent += "<p><b>Rainfall in month " + month + ":</b> " + feature.properties[attribute] + " millimeters</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius)
    });
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
};


// 6.1 SET DATA TO INDIVIDUAL PROJECT

//Step 2: Import GeoJSON data
function getData(){
    //load the data
    fetch("data/RainOfAsia.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //calculate minimum data value
            minValue = calculateMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json);
        })
};

document.addEventListener('DOMContentLoaded',createMap)// greates geoJSON layer
