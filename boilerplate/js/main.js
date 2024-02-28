// Ocampo, ACTIVITY 6

var map;
var minValue;

function createMap(){

    map = L.map('map', {
        center: [0, 0],
        zoom: 2
    });

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
}).addTo(map);

    getData(map);
};

// 6.1 EDIT, UPDATE year > month

function calculateMinValue(data){
    var allValues = [];
    for(var city of data.features){
        for(var month = 1; month <= 12; month+=1){
              var value = city.properties["Month_"+ String(month)];
              allValues.push(value);
        }
    }
    var minValue = Math.min(...allValues)
    return minValue;
}

function calcPropRadius(attValue) {
    var minRadius = 5;
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius
    return radius;
};

// 6.1 EDIT, SET ATTRIBUTE TO MONTHS [ 1 - 12 ]
// 6.2 EDIT, CHANGE FUNCTION

function pointToLayer(feature, latlng){

    var attribute = "Month_1";

// 6.2.1 EDIT, UPDATE VARIABLE > options
    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 1,
    };

// 6.2.1 ADD, POPUP
    var attValue = Number(feature.properties[attribute]);
    console.log(feature.properties, attValue);

    options.radius = calcPropRadius(attValue);

    var layer = L.circleMarker(latlng, options);

// 6.2.2 EDIT, POPUP CONTENTS

    var popupContent = "<p><b>Location:</b> " + 
        feature.properties.City + "</p>";

    var month = attribute.split("_")[1];
    popupContent += "<p><b>Rainfall in month " + month + ":</b> " + 
        feature.properties[attribute] + " millimeters</p>";

// 6.2.4 EDIT, OFFSET MARKER

    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius)
    });

    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
};

// 6.3.5 ADD, SLIDER

function createSequenceControls(){
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);
};

// 6.3.6 EDIT, SLIDER ATTRIBUTES - RETURNING NULL
    // document.querySelector(".range-slider").max = 11;
    // document.querySelector(".range-slider").min = 0;
    // document.querySelector(".range-slider").value = 0;
    // document.querySelector(".range-slider").step = 1;

// 6.3.7 ADD, STEP BUTTONS

    document.querySelector('#panel').
        insertAdjacentHTML(
        'beforeend','<button class="step" id="reverse"></button>');
    document.querySelector('#panel').
        insertAdjacentHTML(
        'beforeend','<button class="step" id="forward"></button>');

    document.querySelector('#reverse').
        insertAdjacentHTML('beforeend',"<img src='img/UmbrellaLeft.png'>")
    document.querySelector('#forward').
        insertAdjacentHTML('beforeend',"<img src='img/UmbrellaRight.png'>")

// 6.1 EDIT, SET DATA

function getData(map){
    fetch("data/RainOfAsia.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            minValue = calculateMinValue(json);
            createPropSymbols(json);
            createSequenceControls();
        })
};

document.addEventListener('DOMContentLoaded',createMap)
