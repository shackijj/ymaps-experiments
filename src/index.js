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
        var R = 15;
        
        var el = document.getElementById('map');
    
        var map = new ymaps.Map(el, { 
            center: [55.76, 37.64], 
            zoom: 5
        });
    
        var zoom = map.getZoom();
        var projection = map.options.get('projection');
    
        var rect = el.getBoundingClientRect();
        var center = map.getGlobalPixelCenter();
    
        var offsetLeft = center[0] - (rect.width / 2);
        var offsetTop = center[1] - (rect.height / 2);

        var SIXTY_DEG_IN_RADS = Math.PI * 60 / 180;
        var COS_OF_SIXTY = Math.cos(SIXTY_DEG_IN_RADS);
        var SIN_OF_SIXTY = Math.sin(SIXTY_DEG_IN_RADS);

        var colWidth = 1.5 * R;
        var rowHeight = 1.5 * R;
        var cols = Math.floor((rect.width + (R / 2)) / colWidth) + 1;
        var rows = Math.floor(rect.height / rowHeight);

        function sin(angle) {
            return Math.sin(Math.PI * angle / 180);
        }

        function cos(angle) {
            return Math.cos(Math.PI * angle / 180);
        }

        for (var c = 0; c < cols; c++) {
            for(var r = 0; r < rows; r++) {
                var horizontalShift = (c % 2 === 0) ? 0 : -1 * SIN_OF_SIXTY;
                var x = c * 1.5;
                var y = r * (2 * SIN_OF_SIXTY) + horizontalShift;
                var hexagon = [
                    [cos(0) + x, sin(0) + y],
                    [cos(60) + x, sin(60) + y],
                    [cos(120) + x, sin(120) + y],
                    [cos(180) + x, sin(180) + y],
                    [cos(240) + x, sin(240) + y],
                    [cos(300) + x, sin(300) + y],
                ];
                var hexagonGlobals = hexagon.map(function(point) {
                    return projection.fromGlobalPixels([offsetLeft + (point[0] * R), offsetTop + (point[1] * R)], zoom);
                });
                var hexagonObj = new ymaps.Polygon([
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
                map.geoObjects.add(hexagonObj);
            }
        }
    }
})
