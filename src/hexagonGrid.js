function sin(angle) {
    return Math.sin(Math.PI * angle / 180);
}

function cos(angle) {
    return Math.cos(Math.PI * angle / 180);
}

function hexagonGrid(map, zoom, R, offsetLeft, offsetTop, width, height) {
    var COS_OF_SIXTY = cos(60);
    var SIN_OF_SIXTY = sin(60);
    var colWidth = 1.5 * R;
    var rowHeight = 1.5 * R;
    var cols = Math.floor((width + (R / 2)) / colWidth) + 1;
    var rows = Math.floor(height / rowHeight);

    var result = {type: 'FeatureCollection', features: []};

    function sin(angle) {
        return Math.sin(Math.PI * angle / 180);
    }

    function cos(angle) {
        return Math.cos(Math.PI * angle / 180);
    }

    var projection = map.options.get('projection');

    var id = 0;
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

            result.features.push({
                type: 'Feature',
                id: id++,
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        hexagonGlobals
                    ],
                },
                options: {
                    opacity: 0.2,
                    strokeWidth: 2,
                    fillColor: '#00FF00',
                    visible: true,
                }
            });
        }
    }
    return result;
}

module.exports = hexagonGrid;
