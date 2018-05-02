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

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("ymaps.modules.require(['Map', 'Polygon'], function (Map, Polygon) {\n    ymaps.Map = Map;\n    ymaps.Polygon = Polygon;\n\n    drawHexagones();\n\n    function drawSquares() {\n        var SQUARE_WIDTH = 15;\n        \n        var el = document.getElementById('map');\n    \n        var map = new ymaps.Map(el, { \n            center: [55.76, 37.64], \n            zoom: 10\n        });\n    \n        var zoom = map.getZoom();\n        var projection = map.options.get('projection');\n    \n        var rect = el.getBoundingClientRect();\n        var cols = rect.width / SQUARE_WIDTH;\n        var rows = rect.height / SQUARE_WIDTH;\n        var center = map.getGlobalPixelCenter();\n    \n        var offsetLeft = center[0] - (rect.width / 2);\n        var offsetTop = center[1] - (rect.height / 2);\n    \n        for (var r = 0; r < rows; r++) {\n            for(var c = 0; c < cols; c++) {\n                var left = offsetLeft + (c * SQUARE_WIDTH);\n                var top = offsetTop + (r * SQUARE_WIDTH);\n                var right = left + SQUARE_WIDTH;\n                var bottom = top + SQUARE_WIDTH;\n                var squarePixels = [[left, top], [right, top], [right, bottom], [left, bottom]];\n                var squareGlobals = squarePixels.map(function(point) {\n                    var result = projection.fromGlobalPixels(point, zoom);\n                    return result;\n                });\n                var polygon = new ymaps.Polygon([\n                    squareGlobals\n                ], {\n                    hintContent: \"Многоугольник\"\n                }, {\n                    fillColor: '#6699ff',\n                    interactivityModel: 'default#transparent',\n                    strokeWidth: 1 ,\n                    opacity: 0.5\n                });\n                map.geoObjects.add(polygon);\n            }\n        }\n    }\n\n    function drawHexagones() {\n        var R = 20;\n        \n        var el = document.getElementById('map');\n    \n        var map = new ymaps.Map(el, { \n            center: [55.76, 37.64], \n            zoom: 10\n        });\n    \n        var zoom = map.getZoom();\n        var projection = map.options.get('projection');\n    \n        var rect = el.getBoundingClientRect();\n        var center = map.getGlobalPixelCenter();\n    \n        var offsetLeft = center[0] - (rect.width / 2);\n        var offsetTop = center[1] - (rect.height / 2);\n\n        var SIXTY_DEG_IN_RADS = Math.PI * 60 / 180;\n        var COS_OF_SIXTY = Math.cos(SIXTY_DEG_IN_RADS);\n        var SIN_OF_SIXTY = Math.sin(SIXTY_DEG_IN_RADS);\n\n        var colWidth = 1.5 * R;\n        var rowHeight = 1.5 * R;\n        var cols = Math.floor(rect.width / colWidth) + 1;\n        var rows = Math.floor(rect.height / rowHeight);\n\n        function sin(angle) {\n            return Math.sin(Math.PI * angle / 180);\n        }\n\n        function cos(angle) {\n            return Math.cos(Math.PI * angle / 180);\n        }\n\n        for (var c = 0; c < cols; c++) {\n            for(var r = 0; r < rows; r++) {\n                var horizontalShift = (c % 2 === 0) ? 0 : -1 * SIN_OF_SIXTY;\n                var x = c * 1.5;\n                var y = r * (2 * SIN_OF_SIXTY) + horizontalShift;\n                var hexagon = [\n                    [cos(0) + x, sin(0) + y],\n                    [cos(60) + x, sin(60) + y],\n                    [cos(120) + x, sin(120) + y],\n                    [cos(180) + x, sin(180) + y],\n                    [cos(240) + x, sin(240) + y],\n                    [cos(300) + x, sin(300) + y],\n                ];\n                console.log(hexagon);\n                var hexagonGlobals = hexagon.map(function(point) {\n                    return projection.fromGlobalPixels([offsetLeft + (point[0] * R), offsetTop + (point[1] * R)], zoom);\n                });\n                var hexagonObj = new ymaps.Polygon([\n                    [],\n                    hexagonGlobals\n                ], {\n                    hintContent: \"Многоугольник\"\n                }, {\n                    fillColor: '#6699ff',\n                    interactivityModel: 'default#transparent',\n                    strokeWidth: 1 ,\n                    opacity: 0.5\n                });\n                map.geoObjects.add(hexagonObj);\n            }\n        }\n    }\n})\n\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ })

/******/ });