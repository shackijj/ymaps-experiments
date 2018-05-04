require('mapsapi-polygonmap');

var hexagonGrid = require('./hexagonGrid.js');
var points = require('../data/points-geojson');

ymaps.modules.require(['Map', 'Polygonmap', 'Polygon'], function (Map, Polygonmap, Polygon) {
    ymaps.Map = Map;
    ymaps.Polygonmap = Polygonmap;

    var R = 25;
    
    var el = document.getElementById('map');

    var map = new ymaps.Map(el, { 
        center: [55.76, 37.64], 
        zoom: 10
    });

    var zoom = map.getZoom();

    var rect = el.getBoundingClientRect();
    var center = map.getGlobalPixelCenter();

    var offsetLeft = center[0] - (rect.width / 2);
    var offsetTop = center[1] - (rect.height / 2);

    var data = {
        polygons: hexagonGrid(map, zoom, R, offsetLeft, offsetTop, rect.width, rect.height),
        points: points,
    };

    var polygonmap = new Polygonmap(data);
    
    polygonmap.setMap(map);
});
