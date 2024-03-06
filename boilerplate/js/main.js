// wisc-ocampo, leaflet lab

// SECTION
    // sub section

// BASIC FUNCTIONS
    // data declaration
let map;
let dataStats = {};
const corner1 = L.latLng(40, 60),
    corner2 = L.latLng(-5, 120),
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

// MAP
    // map properties
function createMap(){
    map = L.map('map', {
        center: [15, 90],
        zoom: 4.25,
        maxBounds: bounds,
        zoomSnap: .25,
        minZoom: 4,
        maxZoom: 6,
    });

    // map layers
    let Esri_WorldPhysical = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
	maxZoom: 8
}).addTo(map);

    let Esri_WorldImagery = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
})

    let Stadia_StamenTerrainLabels = L.tileLayer(
        'https://tiles.stadiamaps.com/tiles/stamen_terrain_labels/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});

    let Stadia_StamenTerrainLines = L.tileLayer(
        'https://tiles.stadiamaps.com/tiles/stamen_terrain_lines/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});
    // map layer controls
    let baseMaps = {
        "Physical World": Esri_WorldPhysical,
        "World Imagery": Esri_WorldImagery
    };

    let overlayMaps = {
        "Terrain Labels": Stadia_StamenTerrainLabels,
        "Terrain Lines": Stadia_StamenTerrainLines
    };

    let layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

    getData(map);
};

// LEAFLET MARKERS
    // spawn markers
function pointToLayer(feature, latlng, attributes){
    let attribute = attributes[0];
    let options = {
        fillColor: '#aa5a82',
        color: '#FFF',
        weight: 1,
        opacity: .8,
        fillOpacity: 0.4,
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

    // make proportional markers
function createPropSymbols(data, attributes){
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature,latlng, attributes);
        }
    }).addTo(map);
};

// TITLE
function createTitle(attributes){
    let TitleControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            let titleContainer = L.DomUtil.create('div', 'title-container');
            titleContainer.innerHTML = 
                '<p style="font-size: 16pt; height: 0px" class="titleContainer"><b>Monthly Rainfall Across<br>South and Southeast Asia</b></p>';
            L.DomEvent.disableClickPropagation(titleContainer);
            return titleContainer;
        }
    });
    map.addControl(new TitleControl());
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
        });

    });

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
            position: 'topright'
        },

        onAdd: function () {
            let container = L.DomUtil.create('div', 'legend-control-container');
            container.innerHTML = '<p style="font-size: 12pt; height: 0px" class="temporalLegend"><b>Rainfall in Month <span class="month">1</span></b></p>';
            // svg
            let svg = '<svg id="attribute-legend" width="190px" height="180px">';
            let circles = ['max', 'mean', 'min'];

            for (let i=0; i<circles.length; i++){  
                let radius = calcPropRadius(dataStats[circles[i]]);  
                let cy = 180 - radius;  
                svg += '<circle class="legend-circle" id="' + circles[i] +
                    '" r="' + radius + '"cy="' + cy +
                    '" fill="#aa5a82" fill-opacity="0.4" stroke="#FFF" cx="45"/>';  
                let textY = i * 22 + 130;
                svg += '<text id="' + circles[i] + '-text" x="90" y="' +
                    textY + '">' + Math.round(dataStats[circles[i]]) +
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

// GLOBAL FUNCTIONS
    // flannery's perceptual scaling
function calcStats(data){
    let allValues = [];
    
    for (let city of data.features) {
        
        for (let month = 1; month <= 12; month+=1) {
              let value = city.properties["Month_"+ String(month)];
              allValues.push(value);
        }
    }
    // data calculation
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    let sum = allValues.reduce(function(a, b){return a+b;});
    dataStats.mean = sum / allValues.length;
}
    // radius calculation
function calcPropRadius(attValue) {
    let minRadius = 5;
    let trueradius = 1.0083 * Math.pow ( attValue / dataStats.min, 0.5715 ) * minRadius
    let radius = trueradius * .275
    return radius;
};

    // update index markers
function updatePropSymbols(attribute){
    let month = attribute.split('_')[1];
    document.querySelector('span.month').innerHTML = month;
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
    updateLegend(attribute);
};

function updateLegend(attribute) {
    let month = attribute.split('_')[1];
    document.querySelector('span.month').innerHTML = month;
    
    let allValues = [];
	map.eachLayer(function (layer) {
		if (layer.feature) {
			allValues.push(layer.feature.properties[attribute]);
		}
	});

	let circleValues = {
		min: Math.min(...allValues),
		max: Math.max(...allValues),
		mean: allValues.reduce(function (a, b) { return a + b; }) / allValues.length
	}

	for (let key in circleValues) {
        let radius = calcPropRadius(circleValues[key]);
	    document.querySelector("#" + key).setAttribute("cy", 180 - radius);
	    document.querySelector("#" + key).setAttribute("r", radius)
	    document.querySelector("#" + key + "-text").textContent = Math.round(circleValues[key]) + " millimeters";
    }
}
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
        createTitle(attributes);
    })
};

     // load data
document.addEventListener('DOMContentLoaded', createMap)
