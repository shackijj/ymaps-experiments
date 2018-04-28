var data = require('../data/points-geojson.json');

ymaps.ready({
    require: ['ShapeLayer'],

    successCallback: () => {
        buildGrid(data);
        // buildFixedGrid(data);
        // buildFlexGrid(data);
        
        /*        
        function buildFixedGrid (data) {
            var map = new ymaps.Map('map', {
                    center: [37.6, 55.75],
                    zoom: 8
                }, {
                    avoidFractionalZoom: false
                }),
                heatmap = new ymaps.ShapeLayer(
                    data,
                    {
                        shapeForm: 'circles',
                            clusterize: true,
                            centroidMode: 'float',
                            gridSize: Math.pow(2, -4),
                            fillColor: function (cluster, zoom) {
                            return 'rgba(40, 80 ,40, 0.4)';
                        },
                        size: function (cluster, zoom) {
                            var weight = cluster.objects.reduce((counter, object) => {
                                    return counter + object.properties.weight;
                        }, 0);
                            return weight / (300 * Math.pow(2, 13 - zoom));
                        }
                    });

                    map.layers.add(heatmap);

                    map.events.add('click', (e) => {
                            var objects = heatmap.getObjectsInPosition(e.get('coords'));
                        if (objects.length) {
                            map.balloon.open(
                                objects[0].geometry.coordinates,
                                '<pre>' + JSON.stringify(objects, null, 4) + '</pre>'
                            );
                        }
                    });
        } 
        */
        /* 
        function buildFlexGrid (data) {
            var map = new ymaps.Map('map_flex_grid', {
                    center: [37.6, 55.75],
                    zoom: 8
                }, {
                    avoidFractionalZoom: false
                }),
                heatmap = new ymaps.ShapeLayer(
                    data, 
                    {
                        shapeForm: 'circles',
                            clusterize: true,
                            gridMode: 'flexible',
                            gridSize: function (zoom) {
                            return Math.pow(1.5, zoom - 2);
                        },
                        fillColor: function (cluster) {
                            var weight = cluster.objects.reduce((counter, object) => {
                                    return counter + object.properties.weight;
                        }, 0);
                            return 'rgba(40,' +
                                Math.min(Math.round(weight / 50), 255) +
                                ',40,0.3)';
                        }
                    });

                    map.layers.add(heatmap);

                    map.events.add('click', (e) => {
                        var objects = heatmap.getObjectsInPosition(e.get('coords'));
                    if (objects.length) {
                        map.balloon.open(
                            objects[0].geometry.coordinates,
                            '<pre>' + JSON.stringify(objects, null, 4) + '</pre>'
                        );
                    }
                });
            } */
            
            function buildGrid (data) {
                var map = new ymaps.Map('map', {
                        center: [55.76, 37.64], 
                        zoom: 10
                    }, {
                        avoidFractionalZoom: false
                    }),
                    shapeLayer = new ymaps.ShapeLayer(
                        data, 
                        {
                            shapeForm: 'squares',
                            clusterize: true,
                            gridSize: 27 * Math.pow(2, -11),
                            fillColor: function (cluster) {
                                var weight = cluster.objects.reduce((counter, object) => {
                                    return counter + object.properties.weight;
                                }, 0);
                                return 'rgba(0,' + Math.min(Math.round(weight / 15), 255) + ',0,0.3)';
                            }
                    });

                    map.layers.add(shapeLayer);

                    map.events.add('click', (e) => {
                        var objects = shapeLayer.getObjectsInPosition(e.get('coords'));
                        if (objects.length) {
                            map.balloon.open(
                                objects[0].geometry.coordinates,
                                '<pre>' + JSON.stringify(objects, null, 4) + '</pre>'
                            );
                        }
                    });
            }
            /* 
            function buildCircles (data) {
                    var map = new ymaps.Map('map_circles', {
                            center: [37.6, 55.75],
                            zoom: 10
                        }, {
                            avoidFractionalZoom: false
                        }),
                        heatmap = new ymaps.ShapeLayer(data.features.map((feature) => {
                                return {
                                    type: 'Feature',
                                    geometry: feature.geometry,
                                    properties: Object.assign({}, feature.properties, {
                                        weight: Number(feature.properties.stat[0][9])
                                    })
                                };
                        }), {
                            shapeForm: 'circles',
                                fillColor: 'rgba(50, 150, 50, 0.6)',
                                size: function (feature, zoom) {
                                return feature.properties.weight * Math.pow(1.4, zoom - 12);
                            }
                        });

                        map.layers.add(heatmap);

                        map.events.add('click', (e) => {
                            var objects = heatmap.getObjectsInPosition(e.get('coords'));
                        if (objects.length) {
                            map.balloon.open(
                                objects[0].geometry.coordinates,
                                '<pre>' + JSON.stringify(objects, null, 4) + '</pre>'
                            );
                        }
                });
            } */
    }
});
