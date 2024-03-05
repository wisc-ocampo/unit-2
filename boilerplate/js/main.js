// Ocampo, Leaflet Lab

// basic functions
let map;
let minValue;
const corner1 = L.latLng(40, 50),
    corner2 = L.latLng(0, 130),
    bounds = L.latLngBounds(corner1, corner2);

function PopupContent(properties, attribute){
    this.properties = properties;
    this.attribute = attribute;
    this.month = attribute.split("_")[1];
    this.rain = this.properties[attribute]
    this.formatted = "<p><b>City:</b> " + this.properties.City + 
        "</p><p><b>Rainfall in month " + this.month + ":</b> " +
        this.rain + " millimeters</p>";
};

// map properties
function createMap(){
    map = L.map('map', {
        center: [20, 90],
        zoom: 4,
        maxBounds: bounds,
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
	maxZoom: 8
}).addTo(map);

    getData(map);
};

// flannery's
function calcstats(data){
    let allValues = [];
    for(let city of data.features){
        for(let month = 1; month <= 12; month+=1){
              let value = city.properties["Month_"+ String(month)];
              allValues.push(value);
        }
    }
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    let sum = allValues.reduce(function(a, b){return a+b;});
    dataStats.mean = sum/ allValues.length;
}

function calcPropRadius(attValue) {
    let minRadius = 5;
    let radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius
    return radius;
};

// spawn leaflet layer (marker)
function pointToLayer(feature, latlng, attributes){
    let attribute = attributes[0];

    let options = {
        fillColor: '#ff7800',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
    };

    let attValue = Number(feature.properties[attribute]);
    options.radius = calcPropRadius(attValue);
    let layer = L.circleMarker(latlng, options);

    let popupContent = new PopupContent(feature.properties, attribute);

    layer.bindPopup(popupContent.formatted, {
        offset: new L.Point(0,-options.radius)
    });

    return layer;
};

// create proportional markers
function createPropSymbols(data, attributes){
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature,latlng, attributes);
        }
    }).addTo(map);
};

// SEQUENCE CONTROLS
    // slider
function createSequenceControls(attributes){
    let SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
    // adding slider
            let container = L.DomUtil.create(
                'div', 'sequence-control-container');
            container.insertAdjacentHTML(
                'beforeend', '<input class="range-slider" type="range">')
            container.insertAdjacentHTML('beforeend',
                '<button class="step" id="reverse" title="Reverse"><img src="img/UmbrellaLeft.png"></button>'); 
            container.insertAdjacentHTML('beforeend',
                '<button class="step" id="forward" title="Forward"><img src="img/UmbrellaRight.png"></button>');
    // disabling secondary response
            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    // slider controls and functionality
    map.addControl(new SequenceControl());
    document.querySelector(".range-slider").max = 11;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;
    // identify step button pushed, change index value
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            let index = document.querySelector('.range-slider').value;

            if (step.id == 'forward'){
                index++;
                index = index > 11 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                index = index < 0 ? 11 : index;
            };
    
            document.querySelector('.range-slider').value = index;
            updatePropSymbols(attributes[index]);
        })
    })

    document.querySelector('.range-slider').addEventListener('input', 
    function(){
        let index = this.value;
        updatePropSymbols(attributes[index]);
    });
};

// LEGEND
function createLegend(attributes){
    let LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            let container = L.DomUtil.create('div', 'legend-control-container');
            container.innerHTML = '<p class="temporalLegend">Rainfall in <span class="month">1</span></p>';
            // svg
            let svg = '<svg id="attribute-legend" width="160px" height="60px">';
            let circles = ['max', 'mean', 'min'];

            for (let i=0; i<circles.length; i++){  

                let radius = calcPropRadius(dataStats[circles[i]]);  
                let cy = 59 - radius;  

                svg += '<circle class="legend-circle" id="' + circles[i] +
                    '" r="' + radius + '"cy="' + cy +
                    '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="30"/>';  

                let textY = i * 20 + 20;
                svg += '<text id="' + circles[i] + '-text" x="65" y="' +
                    textY + '">' + Math.round(dataStats[circles[i]]*100)/100 +
                    " millimeters" + '</text>';
            };  

            svg += "</svg>";

            container.insertAdjacentHTML('beforeend',svg);
            // disable secondary response
            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    map.addControl(new LegendControl());
};

// update index markers
function updatePropSymbols(attribute){
    let month = attribute.split('_')[1];
    document.querySelector('span.year').innerHTML = year;
    map.eachLayer(function(layer){

        if (layer.feature && layer.feature.properties[attribute]){
            
            let props = layer.feature.properties;

            let radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            let popupContent = new PopupContent(props, attribute);

            popup = layer.getPopup();            
            popup.setContent(popupContent.formatted).update();
        };
    });
};



// create data attributes array
function processData(data){
    let attributes = [];
    let properties = data.features[0].properties;

    for (let attribute in properties){
        if (attribute.indexOf('Month') > -1){
            attributes.push(attribute);
        };
    };
return attributes;
};

// get data
function getData(map){
    fetch('data/RainOfAsia.geojson')
    .then(function(response){
        return response.json();
    })
    .then(function(json){
        calcStats(json);
        let attributes = processData(json);
        createPropSymbols(json, attributes);
        createSequenceControls(attributes);
        createLegend(attributes);
    })
};

// load data
document.addEventListener('DOMContentLoaded', createMap)
