const data = require('../data/points-geojson');

if (!ymaps.Map) {
    ymaps.modules.require(['Map', 'ObjectManager', 'Layer', 'projection.sphericalMercator'], function (Map, ObjectManager, Layer, sphericalMercator) {
        // Добавляем в глобальную область видимости класс вручную, так как при использовании метода require модульной системы этого не происходит.
        ymaps.Map = Map;
        ymaps.ObjectManager = ObjectManager;
        ymaps.Layer = Layer;
        ymaps.projection = {sphericalMercator: sphericalMercator};
        
        var map = new ymaps.Map('map', { 
            center: [55.76, 37.64], 
            zoom: 10    
            });

        var manager = new ymaps.ObjectManager({clusterize: true});
        var layer = new ymaps.Layer('http://tile.openstreetmap.org/%z/%x/%y.png', {
            projection: ymaps.projection.sphericalMercator
        })
        manager.add(data);
        map.geoObjects.add(manager);
        map.layers.add(layer);
    })
}