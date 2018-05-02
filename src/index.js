ymaps.modules.require(['Map', 'Polygon'], function (Map, Polygon) {
    ymaps.Map = Map;
    ymaps.Polygon = Polygon;

    drawHexagones();

    function drawSquares() {
        var SQUARE_WIDTH = 15;
        
        var el = document.getElementById('map');
    
        var map = new ymaps.Map(el, { 
            center: [55.76, 37.64], 
            zoom: 10
        });
    
        var zoom = map.getZoom();
        var projection = map.options.get('projection');
    
        var rect = el.getBoundingClientRect();
        var cols = rect.width / SQUARE_WIDTH;
        var rows = rect.height / SQUARE_WIDTH;
        var center = map.getGlobalPixelCenter();
    
        var offsetLeft = center[0] - (rect.width / 2);
        var offsetTop = center[1] - (rect.height / 2);
    
        for (var r = 0; r < rows; r++) {
            for(var c = 0; c < cols; c++) {
                var left = offsetLeft + (c * SQUARE_WIDTH);
                var top = offsetTop + (r * SQUARE_WIDTH);
                var right = left + SQUARE_WIDTH;
                var bottom = top + SQUARE_WIDTH;
                var squarePixels = [[left, top], [right, top], [right, bottom], [left, bottom]];
                var squareGlobals = squarePixels.map(function(point) {
                    var result = projection.fromGlobalPixels(point, zoom);
                    return result;
                });
                var polygon = new ymaps.Polygon([
                    squareGlobals
                ], {
                    hintContent: "Многоугольник"
                }, {
                    fillColor: '#6699ff',
                    interactivityModel: 'default#transparent',
                    strokeWidth: 1 ,
                    opacity: 0.5
                });
                map.geoObjects.add(polygon);
            }
        }
    }

    function drawHexagones() {
        var R = 20;
        
        var el = document.getElementById('map');
    
        var map = new ymaps.Map(el, { 
            center: [55.76, 37.64], 
            zoom: 10
        });
    
        var zoom = map.getZoom();
        var projection = map.options.get('projection');
    
        var rect = el.getBoundingClientRect();
        var center = map.getGlobalPixelCenter();
    
        var offsetLeft = center[0] - (rect.width / 2);
        var offsetTop = center[1] - (rect.height / 2);

        const SIXTY_DEG_IN_RADS = Math.PI * 60 / 180;
        const COS_OF_SIXTY = Math.cos(SIXTY_DEG_IN_RADS);
        const SIN_OF_SIXTY = Math.sin(SIXTY_DEG_IN_RADS);
        var hexagon = [
            [R, 0],
            [R * COS_OF_SIXTY, R * SIN_OF_SIXTY],
            [0 - R * COS_OF_SIXTY, R * SIN_OF_SIXTY],
            [0 - R, 0],
            [0 - R * COS_OF_SIXTY, 0 - R * SIN_OF_SIXTY],
            [R * COS_OF_SIXTY, 0 - R * SIN_OF_SIXTY],
        ];

        var hexagonGlobals = hexagon.map(function(point) {
            var result = projection.fromGlobalPixels([offsetLeft + point[0], offsetTop + point[1]], zoom);
            return result;
        });

        var polygon = new ymaps.Polygon([
            [],
            hexagonGlobals
        ], {
            hintContent: "Многоугольник"
        }, {
            fillColor: '#6699ff',
            interactivityModel: 'default#transparent',
            strokeWidth: 1 ,
            opacity: 0.5
        });
        map.geoObjects.add(polygon);
    }
})
