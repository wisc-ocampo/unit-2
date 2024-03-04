// Ocampo, Leaflet Lab

let map;
let minValue;

// W6.2

function PopupContent(properties, attribute){
    this.properties = properties;
    this.attribute = attribute;
    this.month = attribute.split("_")[1];
    this.rain = this.properties[attribute]
    this.formatted = "<p><b>City:</b> " + this.properties.City + 
        "</p><p><b>Rainfall in month " + this.month + ":</b> " +
        this.rain + " millimeters</p>";
};

// var popupContent = new PopupContent(feature.properties, attribute);
//
// popupContent.formatted = "<h2>" + popupContent.rain + " millimeters</h2>";
//
// layer.bindPopup(popupContent.formatted, {
//     offset: new L.Point(0,-options.radius)
//     });

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
// 6.3.13 EDIT, SET VARIABLE ATTRIBUTE VALUE

function pointToLayer(feature, latlng, attributes){

    var attribute = attributes[0];
    console.log(attribute);

// 6.2.1 EDIT, UPDATE VARIABLE > options
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

    // var popupContent = "<p><b>Location:</b> " + 
    //     feature.properties.City + "</p>";
    //
    // var month = attribute.split("_")[1];
    // popupContent += "<p><b>Rainfall in month " + month + ":</b> " + 
    //     feature.properties[attribute] + " millimeters</p>";
       var popupContent = createPopupContent(feature.properties, attribute);

// 6.2.4 EDIT, OFFSET MARKER

    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius)
    });

    return layer;
};

// 6.3.12 EDIT, ADD PARAMETERS

function createPropSymbols(data, attributes){
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

// 6.3.5 ADD, SLIDER

function createSequenceControls(attributes){
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);

    // 6.3.6 EDIT, SLIDER ATTRIBUTES
// RETURNING NULL, BREAKING EVERYTHING, CONTENTS NOT LOADED?
// All ALLOWS MAP TO LOAD, THOUGH feature STILL UNDEFINED
    document.querySelector(".range-slider").max = 11;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

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
// 6.3.14 ADD, LISTENERS
// 6.3.16 EDIT, FUNCTION
// 6.3.17 ADD, INDEX UPDATE

    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;

            if (step.id == 'forward'){
                index++;
                index = index > 11 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                index = index < 0 ? 11 : index;
            };

            document.querySelector('.range-slider').value = index;
            console.log(index);
            updatePropSymbols(attributes[index]);
        })
    })

    document.querySelector('.range-slider').addEventListener('input', 
        
// 6.3.15 EDIT, FUNCTION
// 6.3.17 ADD, INDEX UPDATE

        function(){
            var index = this.value;
            console.log(index)
            updatePropSymbols(attributes[index]);
    });

};

// 6.3.18 ADD, updatePropSymbols FUNCTION

function updatePropSymbols(attribute){
    map.eachLayer(function(layer){

// 6.3.19 EDIT, if STATEMENT AND POPUP CONTENT, INVALID DUE TO 6.3.6 BELOW

        if (layer.feature && layer.feature.properties[attribute]){
            
            var props = layer.feature.properties;

            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            var popupContent = createPopupContent(props, attribute);

            popup = layer.getPopup();
            popup.setContent(popupContent).update();

            // var popupContent = "<p><b>Location:</b> " + 
            //     layer.feature.properties.City + "</p>";
            //
            // var month = attribute.split("_")[1];
            // popupContent += "<p><b>Rainfall in month " + month + ":</b> " + 
            //     layer.feature.properties[attribute] + " millimeters</p>";

            popup = layer.getPopup();            
            popup.setContent(popupContent).update();
        };
    });
};

// W6.1
function createPopupContent(properties, attribute){
    var popupContent = "<p><b>Location:</b> " + properties.City + "</p>";

    var month = attribute.split("_")[1];
    popupContent += "<p><b>Rainfall in month " + month + ":</b> " + 
        properties[attribute] + " millimeters</p>";

    return popupContent;
};


// 6.3.11 ADD, ATTRIBUTES ARRAY

function processData(data){
    var attributes = [];

    var properties = data.features[0].properties;

    for (var attribute in properties){
        if (attribute.indexOf("Month") > -1){
            attributes.push(attribute);
        };
    };

    console.log(attributes);

    return attributes;
};

// 6.1 EDIT, SET DATA
// 6.3 ADD, FUNCTIONS TO AJAX

function getData(map){
    fetch("data/RainOfAsia.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            var attributes = processData(json);
            minValue = calculateMinValue(json);
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
        })
};

document.addEventListener('DOMContentLoaded',createMap)
