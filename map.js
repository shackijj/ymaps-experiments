if (!ymaps.Map) {
    ymaps.modules.require(['Map', 'GeoObject', 'Placemark', 'GeoObjectCollection'], function (Map, GeoObject, Placemark, GeoObjectCollection) {
        // Добавляем в глобальную область видимости класс вручную, так как при использовании метода require модульной системы этого не происходит.
        ymaps.Map = Map;
        ymaps.GeoObject = GeoObject;
        ymaps.Placemark = Placemark;
        ymaps.GeoObjectCollection = GeoObjectCollection;

        var myMap = new ymaps.Map('map', { 
            center: [55.76, 37.64], 
            zoom: 10    
            });

        
        var myGeoObject = new ymaps.GeoObject({
            // Тип геометрии - точка.
            type: 'Point',
            // Координаты точки.
            coordinates: [55.76, 37.64]
        });

        var myPlacemark = new ymaps.Placemark([55.8, 37.6]);

        var myCollection = new ymaps.GeoObjectCollection({});


        myCollection.add(myGeoObject);
        myCollection.add(myPlacemark);
        myMap.geoObjects.add(myCollection);
    })
}