/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/hexagonGrid.js":
/*!****************************!*\
  !*** ./src/hexagonGrid.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function sin(angle) {\n    return Math.sin(Math.PI * angle / 180);\n}\n\nfunction cos(angle) {\n    return Math.cos(Math.PI * angle / 180);\n}\n\nfunction hexagonGrid(map, zoom, R, offsetLeft, offsetTop, width, height) {\n    var COS_OF_SIXTY = cos(60);\n    var SIN_OF_SIXTY = sin(60);\n    var colWidth = 1.5 * R;\n    var rowHeight = 1.5 * R;\n    var cols = Math.floor((width + (R / 2)) / colWidth) + 1;\n    var rows = Math.floor(height / rowHeight);\n\n    var result = {type: 'FeatureCollection', features: []};\n\n    function sin(angle) {\n        return Math.sin(Math.PI * angle / 180);\n    }\n\n    function cos(angle) {\n        return Math.cos(Math.PI * angle / 180);\n    }\n\n    var projection = map.options.get('projection');\n\n    var id = 0;\n    for (var c = 0; c < cols; c++) {\n        for(var r = 0; r < rows; r++) {\n            var horizontalShift = (c % 2 === 0) ? 0 : -1 * SIN_OF_SIXTY;\n            var x = c * 1.5;\n            var y = r * (2 * SIN_OF_SIXTY) + horizontalShift;\n            var hexagon = [\n                [cos(0) + x, sin(0) + y],\n                [cos(60) + x, sin(60) + y],\n                [cos(120) + x, sin(120) + y],\n                [cos(180) + x, sin(180) + y],\n                [cos(240) + x, sin(240) + y],\n                [cos(300) + x, sin(300) + y],\n            ];\n            var hexagonGlobals = hexagon.map(function(point) {\n                return projection.fromGlobalPixels([offsetLeft + (point[0] * R), offsetTop + (point[1] * R)], zoom);\n            });\n\n            result.features.push({\n                type: 'Feature',\n                id: id++,\n                geometry: {\n                    type: 'Polygon',\n                    coordinates: [\n                        hexagonGlobals\n                    ],\n                },\n                options: {\n                    opacity: 0.2,\n                    strokeWidth: 2,\n                    fillColor: '#00FF00',\n                    visible: true,\n                }\n            });\n        }\n    }\n    return result;\n}\n\nmodule.exports = hexagonGrid;\n\n\n//# sourceURL=webpack:///./src/hexagonGrid.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var hexagonGrid = __webpack_require__(/*! ./hexagonGrid.js */ \"./src/hexagonGrid.js\");\n\nymaps.modules.require(['Map', 'ObjectManager'], function (Map, ObjectManager) {\n    ymaps.Map = Map;\n    ymaps.ObjectManager = ObjectManager;\n\n    drawHexagones();\n\n    function drawSquares() {\n        var SQUARE_WIDTH = 15;\n        \n        var el = document.getElementById('map');\n    \n        var map = new ymaps.Map(el, { \n            center: [55.76, 37.64], \n            zoom: 10\n        });\n    \n        var zoom = map.getZoom();\n        var projection = map.options.get('projection');\n    \n        var rect = el.getBoundingClientRect();\n        var cols = rect.width / SQUARE_WIDTH;\n        var rows = rect.height / SQUARE_WIDTH;\n        var center = map.getGlobalPixelCenter();\n    \n        var offsetLeft = center[0] - (rect.width / 2);\n        var offsetTop = center[1] - (rect.height / 2);\n    \n        for (var r = 0; r < rows; r++) {\n            for(var c = 0; c < cols; c++) {\n                var left = offsetLeft + (c * SQUARE_WIDTH);\n                var top = offsetTop + (r * SQUARE_WIDTH);\n                var right = left + SQUARE_WIDTH;\n                var bottom = top + SQUARE_WIDTH;\n                var squarePixels = [[left, top], [right, top], [right, bottom], [left, bottom]];\n                var squareGlobals = squarePixels.map(function(point) {\n                    var result = projection.fromGlobalPixels(point, zoom);\n                    return result;\n                });\n                var polygon = new ymaps.Polygon([\n                    squareGlobals\n                ], {\n                    hintContent: \"Многоугольник\"\n                }, {\n                    fillColor: '#6699ff',\n                    interactivityModel: 'default#transparent',\n                    strokeWidth: 1 ,\n                    opacity: 0.5\n                });\n                map.geoObjects.add(polygon);\n            }\n        }\n    }\n\n    function drawHexagones() {\n        var R = 100;\n        \n        var el = document.getElementById('map');\n    \n        var map = new ymaps.Map(el, { \n            center: [55.76, 37.64], \n            zoom: 10\n        });\n    \n        var zoom = map.getZoom();\n        var projection = map.options.get('projection');\n    \n        var rect = el.getBoundingClientRect();\n        var center = map.getGlobalPixelCenter();\n    \n        var offsetLeft = center[0] - (rect.width / 2);\n        var offsetTop = center[1] - (rect.height / 2);\n\n        var collection = hexagonGrid(map, zoom, R, offsetLeft, offsetTop, rect.width, rect.height);\n        var manager = new ObjectManager({ clusterize: false });\n        manager.add(collection);\n        map.geoObjects.add(manager);\n    }\n})\n\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ })

/******/ });