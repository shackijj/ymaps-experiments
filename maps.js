function Interval(e, t, i) {
    this._state = "stopped", this._timers = [], this._name = i, this.interval = t, this.tick = function () {
        e()
    }, this._doTheTick = this._doTheTick.bind(this)
}

function UserActivenessWatcher(e) {
    var t = this;
    e = e || 900, t._checkUserActiveness = t._checkUserActiveness.bind(t), t._onDocumentVisibilityChange = t._onDocumentVisibilityChange.bind(t), t._registerUserActiveness = $.throttle(t._registerUserActiveness.bind(t), e), t._timer = new Interval(t._checkUserActiveness, 1e3), t._enabled = !1, t._callbacks = []
}

function WindVisualizer(e) {
    var t = this;
    this.params = e, this.screenVert = "precision highp float;\nattribute vec2 a_pos;\nuniform float u_flipY;\nvarying vec2 v_frag;\nconst vec2 madd = vec2(0.5,0.5);\nvoid main() {\nv_frag=a_pos*madd+madd;\ngl_Position=vec4(a_pos.x,a_pos.y*u_flipY,0.0,1.0);\n}", this.screenFrag = "precision mediump float;\nuniform sampler2D u_screen;\nvarying vec2 v_frag;\nvoid main() {\ngl_FragColor=texture2D(u_screen,v_frag);\n}", this.screenFragOpaco = "precision mediump float;\nuniform sampler2D u_screen;\nuniform float u_opacity;\nvarying vec2 v_frag;\nvoid main() {\nvec4 color=texture2D(u_screen,v_frag);\ngl_FragColor=vec4(floor(255.0*color*u_opacity)/255.0);            \n}", this.mergeFrag = "precision mediump float;\nuniform sampler2D u_tex1;\nuniform sampler2D u_tex2;\nuniform float u_tex2opacity;\nvarying vec2 v_frag;\nconst vec4 min=vec4(0.0);\nconst vec4 max=vec4(1.0);\nvoid main() {\nvec4 color=texture2D(u_tex1,v_frag)+(texture2D(u_tex2,v_frag)*u_tex2opacity);\ngl_FragColor=vec4(color.rgb*color.a,color.a);\n}", this.particlesDrawVert = "precision highp float;\nattribute float a_index;\nuniform sampler2D u_particles;\nuniform sampler2D u_wind;\nuniform float u_size;\nuniform float u_particleBaseSize;\nuniform float u_particleMinSpeed;\nvoid main() {\nfloat x=fract(a_index/u_size);\nfloat y=floor(a_index/u_size)/u_size;\nvec4 particle=texture2D(u_particles,vec2(x,y));\nvec2 position=particle.rg/255.0+particle.ba;\nvec2 wind=texture2D(u_wind,position).xy;\nif (wind.x==0.0) {\n    return;\n}\nfloat windSpeed=length(wind-0.5);\nif (windSpeed<u_particleMinSpeed) {\n    return;            \n}\ngl_PointSize=u_particleBaseSize*(0.15+windSpeed)*5.0;\ngl_Position=vec4(position.x*2.0-1.0,1.0-position.y*2.0,0.0,1.0);\n}", this.particlesDrawFrag = "precision highp float;\nuniform float u_opacity;\nvoid main() {\nfloat radius=distance(gl_PointCoord,vec2(0.5,0.5));\nif (radius>=0.5) {\n    discard;  \n}\ngl_FragColor=vec4(u_opacity);\n}", this.particlesMoveFrag = "precision highp float;\nuniform sampler2D u_wind;\nuniform sampler2D u_particles;\nuniform float u_rand;\nuniform float u_speed_scale;\nuniform float u_drop_rate;\nuniform float u_drop_rate_bump;\nuniform vec4 u_bounds;\nuniform vec2 u_resolution;\nuniform vec2 u_max_speed;\nuniform vec2 u_seed;\nvarying vec2 v_frag;\nfloat rand(vec2 co) {\nreturn fract(sin(mod(dot(co.xy, vec2(12.9898,78.233)),3.14159))*43758.5453);\n}\nvec2 sample(const vec2 position) {\nvec2 px=1.0/u_resolution;\nreturn (texture2D(u_wind,position).rg+\ntexture2D(u_wind,position+vec2(px.x,0)).rg+\ntexture2D(u_wind,position+vec2(0,px.y)).rg+\ntexture2D(u_wind,position+px).rg)/4.0; \n}\nvoid main() {\nvec4 particle=texture2D(u_particles,v_frag);\nvec2 position=particle.rg/255.0+particle.ba;\nvec2 wind=sample(position);\nwind-=0.5;\nvec2 move=vec2(\n    position.x+clamp(wind.x*u_speed_scale,-u_max_speed.x,u_max_speed.x),\n    position.y-clamp(wind.y*u_speed_scale,-u_max_speed.y,u_max_speed.y)\n);\nvec2 seed=move*u_rand;\nfloat drop_rate=u_drop_rate+u_drop_rate_bump*length(wind);\nfloat drop=step(1.0-drop_rate,rand(seed));\nvec2 random_pos=vec2(rand(seed+u_seed.x),rand(seed+u_seed.y));\nmove=mix(move,random_pos,drop);\nmove=fract(move);\nvec2 hBit=fract(move*255.0);\ngl_FragColor=vec4(hBit,move-hBit/255.0);\n}", this.dpi = window.devicePixelRatio || 1, this.noDpiFix = e.noDpiFix, this.particleOpacity = .6, this.particleFadeSpeed = .95, this.particlesLimit = 16384, this.particleSpeedScale = .018, this.particleBaseSize = 16, this.particleDropRate = .004, this.particleDropRateBump = .01, this.particleMaxSpeed = [6e-4, 6e-4], this.particleMinSpeed = .0078, this.particleSeed = [1.32011, 2.45015], this.TEXTURE_UNITS = {
        windData: 0,
        colors: 1,
        particlesState0: 2,
        particlesState1: 3,
        particles0: 4,
        particles1: 5
    }, this.stages = {};
    var i = this.canvas = e.canvas || document.createElement("canvas"),
        a = (Object.assign || $.extend)({
            alpha: !0,
            antialias: !1,
            depth: !1,
            stencil: !1,
            premultipliedAlpha: !0,
            preserveDrawingBuffer: !1
        }, e.webgl || {});
    if (this.drawContext = i.getContext("webgl", a) || i.getContext("experimental-webgl", a), !this.drawContext) throw new Error("No webgl support");
    this.applyTargetingConfig(), this.width = this.drawContext.drawingBufferWidth, this.height = this.drawContext.drawingBufferHeight, i.addEventListener("webglcontextlost", function (e) {
        console.log("context lost", e), e.preventDefault()
    }, !1), i.addEventListener("webglcontextrestored", function (e) {
        console.log("context restored", e), t.init()
    }, !1), this.init()
}

function PollenVisualizer(e) {
    var t = this;
    this.map = e.map, this.allergens = e.allergens, this.colors = e.colors, this.activeAllergens = [], this._data = null, this._active = !1, this._canvas = null, ymaps.ready({
        require: ["HexagonTileLayer"],
        successCallback: function () {
            t.layer = new ymaps.HexagonTileLayer({
                tileTransparent: !1,
                bounds: e.bounds,
                disableStroke: e.disableStroke,
                strokeColor: e.strokeColor,
                strokeWidth: e.strokeWidth,
                unavailabilityPattern: e.unavailabilityPattern
            }), t.layer.events.add("ready", e.onUpdate), t.render(), e.onReady && e.onReady()
        }
    })
}

function QueueCache(e) {
    this.capacity = e, this.cache = {}, this.cacheKeys = []
}

function MapLayer() {}

function TileMapLayer(e) {
    var t = this;
    t._map = e.map, t._dataSource = e.dataSource, t._opacity = e.opacity || 1, t._smoothByZoom = e.smoothByZoom, t._minZoom = e.mapOptions && e.mapOptions.minZoom || 1, t._maxZoom = e.mapOptions && e.mapOptions.maxZoom || 15, t._lang = e.lang, t._api = e.api;
    var i = t._getTimelineConfig && t._getTimelineConfig();
    t._hasChanges = !1, t._isActive = !1, t._canvasFilterSupport = void 0 !== document.createElement("canvas").getContext("2d").filter, t._hasTimeline = Boolean(i), t._updateInnerCanvas = t._updateInnerCanvas.bind(t), t._coordsToMapPosition = t._coordsToMapPosition.bind(null, t._map, t._map.options.get("projection")), t._setTimeline = t._setTimelineByConfig.bind(t, i), t._getUnavailabilityPattern().then(function (e) {
        t._unavailabilityPattern = e
    })
}

function TileVisualizerMapLayer(e) {
    TileVisualizerMapLayer.__super__.constructor.apply(this, arguments);
    var t = this;
    t._afterInitialize = t._afterInitialize.bind(t, e)
}

function filterHideAllLightnings() {
    return !1
}

function LightningMapLayer(e) {
    var t = this;
    t._map = e.map, t._api = e.api, t._url = e.url, t._lifetime = e.lifetime || 1e4, t._freshTime = e.freshTime || 5e3, t._userAfkInterval = e.userAfkInterval || 4e4, t._globalStorage = e.globalStorage, t._selfDisabled = !1, t._cachedLightnings = {}, t._isLightningInRadar = t._isLightningInRadar.bind(t), t._boundsChange = t._boundsChange.bind(t), t._registerUserActivness = t._registerUserActivness.bind(t), t._checkUserActivness = t._checkUserActivness.bind(t), t._onDocumentVisibilityChange = t._onDocumentVisibilityChange.bind(t), t._lightningsLifeTimerTick = t._lightningsLifeTimerTick.bind(t), t._lightningsLoadTimerTick = t._lightningsLoadTimerTick.bind(t);
    var i = ymaps.templateLayoutFactory.createClass('<div class="lightnings-baloon lightnings-baloon_new"></div>'),
        a = ymaps.templateLayoutFactory.createClass('<div class="lightnings-baloon lightnings-baloon_past"></div>');
    ymaps.option.presetStorage.add("weather#lightnings", {
        iconLayout: i
    }), ymaps.option.presetStorage.add("weather#lightnings-past", {
        iconLayout: a
    }), e.restrictedByRadars ? t._pointsFilterFunction = t._isLightningInRadar : t._pointsFilterFunction = function () {
        return !0
    }, t._newLightnings = new ymaps.ObjectManager({
        clusterize: e.clusterize,
        gridSize: e.clusterRadius,
        clusterIconLayout: i
    }), t._newLightnings.objects.options.set("preset", "weather#lightnings"), t._oldLightnings = new ymaps.ObjectManager({
        clusterize: e.clusterize,
        gridSize: e.clusterRadius,
        clusterIconLayout: a
    }), t._oldLightnings.objects.options.set("preset", "weather#lightnings-past"), t._map.geoObjects.add(t._newLightnings), t._map.geoObjects.add(t._oldLightnings), t._lightningsTimestamp = Math.floor(Date.now() / 1e3), t._lightningsQueue = [], t._lightningsLifeTimer = new Interval(t._lightningsLifeTimerTick, LIGHTINGS_QUEUE_STEP), t._lightningsLoadTimer = new Interval(t._lightningsLoadTimerTick, e.requestInterval), t._userActivnessTimer = new Interval(t._checkUserActivness, 1e3), t._bindToEvents()
}

function TemperatureBalloonsMapLayer(e) {
    var t = this;
    t._api = e.api, t._map = e.map, t._lang = e.lang, t._serviceRoot = e.serviceRoot, t._dataSource = e.dataSource, t._clusterConfig = e.clusterize, t._styleId = "temp-slug-balloon-style", t._cache = {}, t._makePlacemarkLayouts(), t._addPresets(), t._makeClusterer(), t._map.events.add("boundschange", t._show.bind(t))
}

function PrecipitationMapLayer(e) {
    var t = this,
        i = 6e4;
    e = e || {}, t._dataSource = e.dataSource, t._map = e.map, t._api = e.api, t._fact = e.fact, t._lang = e.lang, t._globalStorage = e.globalStorage, t._geoId = e.geoId, t._lazyPreloadEnable = e.lazyPreload, t._loadByOne = e.loadByOne, t._forceLoadByOne = !1, t._framesCount = 1, t._data = {
        prec: {},
        timeline: void 0
    }, t._dataDraw = {
        prec: null,
        radars: [],
        isLocalRadarBroken: !1
    }, t._features = {}, t._framesCache = [], t._radarFrameCache = null, t._initialized = !1, t._currentFrameIndex = 0, t._timestamp = null, t._coords = null, t._error = null, t._dataChanged = !1, t._zoomRange = [e.mapOptions.minZoom || 1, e.mapOptions.maxZoom || 15], t._isDataRelevantByTime = !0, t._userLeave = !1, t._coordsToMapPosition = t._coordsToMapPosition.bind(null, t._map, t._map.options.get("projection")), t._convertPolygonCoords = t._convertPolygonCoords.bind(t), t._setTimeline = t._setTimeline.bind(t), t._onRequestFail = t._onRequestFail.bind(t), t._onUserActivenessChange = t._onUserActivenessChange.bind(t), t._onIrrelevantIntervalTick = t._onIrrelevantIntervalTick.bind(t), t._irrelevantInterval = new Interval(t._onIrrelevantIntervalTick, 10 * i), t._initFeatures(e), t._initService(), $.when(t._getUnavailabilityPattern(), t._createPrecPatterns(e.precImages || __PREC_PATTERNS_ENCODED)).then(function (e, i) {
        t._radarPattern = e, t._unavailabilityPattern = e, t._precPatterns = i, $.each(i, function (e, i) {
            return t._framesCount = i.length, !1
        }), t._initialized = !0
    })
}

function TemperatureMapLayer(e) {
    var t = this,
        i = e.scale;
    TemperatureMapLayer.__super__.constructor.apply(this, arguments), i && (t._scaleTemplateHtml = BH.apply(blocks.exec("color-scale", i.values, i.unit)), t._scale = document.createElement("canvas"), GlUtils.createPalette(e.palette, {
        output: t._scale,
        from: i.from,
        to: i.to
    }))
}

function WindMapLayer(e) {
    var t = this,
        i = e.scale;
    WindMapLayer.__super__.constructor.apply(t, arguments), i && t._initializeScale(i, e.tileVisualizer.args.palette)
}

function WindColoredMapLayer(e) {
    var t = this,
        i = e.scale;
    WindColoredMapLayer.__super__.constructor.apply(this, arguments), t._getBalloonMarkup = t._getBalloonMarkup.bind(t), t._hasWebGl = BEM.blocks["i-utils"].hasWebGl.bind(BEM.blocks["i-utils"]), t._webglPopupBlock = e.webglPopupBlock || "popup", i && t._initializeScale(i, e.palette)
}

function PressureMapLayer(e) {
    var t = this,
        i = e.scale;
    PressureMapLayer.__super__.constructor.apply(this, arguments), i && (t._scaleTemplateHtml = BH.apply(blocks.exec("color-scale", i.values, BEM.I18N("interface-common", "mmHg"))), t._scale = document.createElement("canvas"), GlUtils.createPalette(e.palette, {
        output: t._scale,
        from: i.from,
        to: i.to
    }))
}

function BordersMapLayer(e) {
    BordersMapLayer.__super__.constructor.apply(this, arguments);
    var t = this;
    t._horizon = e.fromRussia === !0 ? 0 : 1, t._maxZoom = e.maxZoom
}

function SimpleMapLayer(e) {
    var t = this;
    t._map = e.map, t._opacity = e.opacity, t._zIndex = e.zIndex, t._tileUrlTemplate = e.tileUrlTemplate, t._layer = new ymaps.Layer(t._tileUrlTemplate, {
        tileTransparent: !0,
        zIndex: t._zIndex,
        notFoundTile: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    })
}

function PollenMapLayer(e) {
    var t = this,
        i = 24;
    e = e || {}, t._dataSource = e.dataSource, t._map = e.map, t._api = e.api, t._lang = e.lang, t._globalStorage = e.globalStorage, t._ALERT_TYPE_HEALTH = "health", t._resolvedDeferred = $.Deferred().resolve(), t._rejectedDeferred = $.Deferred().reject(), t._weatherMaps = $(".weather-maps").bem("weather-maps"), t._$alertsParent = $(BH.apply({
        block: "weather-maps",
        elem: "alerts"
    })), t._geoId = e.geoId, t._healthUrl = e.healthUrl, t._allergens = e.allergens, t._allergensByType = t._indexAllergensByType(), t._tileVisualizerArgs = e.tileVisualizer.args, t._colors = e.colors, t._bounds = e.bounds, t._opacity = e.opacity, t._showAllergenActivity = e.showAllergenActivity !== !1, t._colorsByConcentration = ["none", t._colors.low, t._colors.middle, t._colors.high], t._dayManifestType = e.dayManifestType, t._defaultAlertValue = e.defaultAlertValue || null, t._healthRecommendationNumber = Math.floor(Math.random() * i) + 1, t._popupMaxHeight = e.popupMaxHeight, t._unavailabilityPattern = t._getUnavailabilityPatternSync(), t._timestamp = null, t._dataType = null, t._coords = null, t._firstSetData = !0, t._hasChanges = !1, t._setTimeline = t._setTimeline.bind(t), t._getAlertRank = t._getAlertRank.bind(t), t._onMapClick = t._onMapClick.bind(t), t._onAlertClose = t._onAlertClose.bind(t), BEM.DOM.win.on("resize", $.throttle(t._onResize, 200, t))
}

function ApiDataSource(e) {
    var t = this;
    t._serviceRoot = e.serviceRoot, t._headers = {
        accept: "*/*"
    }
}

function BalloonApiDataSource(e) {
    var t = this;
    t._serviceRoot = e.serviceRoot, t._headers = {
        accept: "*/*"
    }, t._manifestApiDataSource = new window.ManifestApiDataSource({
        serviceRoot: e.serviceRoot,
        type: e.manifestType
    })
}

function ManifestApiDataSource(e) {
    var t = this;
    t._serviceRoot = e.serviceRoot, t._type = e.type
}

function TimelineApiDataSource(e) {
    var t = this;
    t._serviceRoot = e.serviceRoot, t._headers = {
        accept: "*/*"
    }, t._parseTimelineData = t._parseTimelineData.bind(t)
}

function RasterTileDataSource(e) {
    this.TILE_SIZE = 512, this.map = e.map, this._horizon = null, this.type = e.type, this.tilesHost = e.tilesHost, this.MAX_ZOOM = e.maxZoom || 7, this.paneName = e.paneName, this._timelineType = e.timelineType, this._tileTransparent = e.tileTransparent === !0, this._fileExtension = e.fileExtension || "jpeg", this._serviceRoot = e.serviceRoot, this._timelineApiDataSource = new window.TimelineApiDataSource({
        serviceRoot: e.serviceRoot
    }), this._balloonApiDataSource = new window.BalloonApiDataSource({
        serviceRoot: e.serviceRoot,
        manifestType: this.type
    }), this._manifestApiDataSource = new window.ManifestApiDataSource({
        serviceRoot: e.serviceRoot,
        type: this.type
    })
}

function PrecipitationApiDataSource(e) {
    var t = this,
        i = new window.TimelineApiDataSource({
            serviceRoot: e.serviceRoot
        });
    t._serviceRoot = e.serviceRoot, t._rootUrl = e.serviceRoot + "/front/nowcast-", t._headers = {
        accept: "*/*"
    }, t.getTimeline = i.getTimeline.bind(i, "nowcast"), t._parsePrecData = t._parsePrecData.bind(t)
}

function PollenApiDataSource(e) {
    var t = this;
    PollenApiDataSource.__super__.constructor.apply(t, arguments), t._cache = new QueueCache(40), t._tileErrorsThreshold = 2, t._dataGridSize = 20, t._loading = {}, t._map = e.map, t._tilesHost = e.tilesHost, t._types = e.types, t._timelineDataSource = new window.TimelineApiDataSource({
        serviceRoot: e.serviceRoot
    })
}

function MapLayersDrawer(e, t) {
    var i = this;
    t = t || {}, i._map = e, i._mapContext = null, i._virtualContext = i._initContext(document.createElement("canvas")), i._degradationRafTimeout = t.degradationRafTimeout || 0, i._fps = 25, i._queue = [], i._rafId = null, i._rafInterval = 1e3 / i._fps, i._rafNextTs = 0, i._requestAnimationFrameStep = i._requestAnimationFrameStep.bind(i), i._animationStep = i._animationStep.bind(i), i._fitCanvasToMap = i._fitCanvasToMap.bind(i), i.stop = i.stop.bind(i), i._insertCanvasToMap(), i._fitCanvasToMap(), i._bindToMapEvents()
}
var GlUtils = function () {
    function e() {}
    return e.resize = function (e, t) {
        t = t || {};
        var i = t.width || e.canvas.clientWidth,
            a = t.height || e.canvas.clientHeight,
            r = t.useDeviceDPI ? window.devicePixelRatio : 1,
            n = Math.floor(i * r),
            o = Math.floor(a * r);
        return e.canvas.width === n && e.canvas.height === o || (e.canvas.width = n, e.canvas.height = o, e.viewport(0, 0, e.canvas.width, e.canvas.height)), {
            width: e.drawingBufferWidth,
            height: e.drawingBufferHeight
        }
    }, e.createShader = function (e, t, i) {
        var a = e.createShader(t);
        if (e.shaderSource(a, i), e.compileShader(a), !e.getShaderParameter(a, e.COMPILE_STATUS) && !e.isContextLost()) throw new Error(e.getShaderInfoLog(a));
        return a
    }, e.provideLinks = function (e, t) {
        for (var i = {}, a = e.getProgramParameter(t, e.ACTIVE_ATTRIBUTES), r = 0, n = void 0; r < a; r++) n = e.getActiveAttrib(t, r), i[n.name] = e.getAttribLocation(t, n.name);
        for (var o = e.getProgramParameter(t, e.ACTIVE_UNIFORMS), r = 0, s = void 0; r < o; r++) s = e.getActiveUniform(t, r), i[s.name] = e.getUniformLocation(t, s.name);
        return i
    }, e.createProgram = function (e, t, i) {
        var a = e.createProgram();
        if (e.attachShader(a, this.createShader(e, e.VERTEX_SHADER, t)), e.attachShader(a, this.createShader(e, e.FRAGMENT_SHADER, i)), e.linkProgram(a), !e.getProgramParameter(a, e.LINK_STATUS) && !e.isContextLost()) throw new Error(e.getProgramInfoLog(a));
        var r = this.provideLinks(e, a);
        return r.program = a, r
    }, e.setRectangle = function (e, t, i, a, r) {
        var n = t + a,
            o = i + r;
        e.bufferData(e.ARRAY_BUFFER, new Float32Array([t, i, n, i, t, o, t, o, n, i, n, o]), e.STATIC_DRAW)
    }, e.makeRectangleStrip = function (e, t, i, a) {
        var r = e + i,
            n = t + a;
        return new Float32Array([e, t, r, t, e, n, r, n])
    }, e.makeRectangleFan = function (e, t, i, a) {
        var r = e + i,
            n = t + a;
        return new Float32Array([e, t, r, t, r, n, e, n])
    }, e.bindTexture = function (e, t, i) {
        e.activeTexture(e.TEXTURE0 + i), e.bindTexture(e.TEXTURE_2D, t)
    }, e.unbindTexture = function (e) {
        e.bindTexture(e.TEXTURE_2D, null)
    }, e.setTextureData = function (e, t, i, a, r) {
        e.bindTexture(e.TEXTURE_2D, t), i instanceof Uint8Array ? e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, a, r, 0, e.RGBA, e.UNSIGNED_BYTE, i) : e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, i), this.unbindTexture(e)
    }, e.createTexture = function (e, t) {
        void 0 === t && (t = {});
        var i = t.filter,
            a = void 0 === i ? e.NEAREST : i,
            r = t.data,
            n = t.width,
            o = t.height,
            s = e.createTexture();
        return e.bindTexture(e.TEXTURE_2D, s), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, a), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, a), r ? this.setTextureData(e, s, r, n, o) : this.unbindTexture(e), s
    }, e.createPalette = function (e, t) {
        var i = document.createElement("canvas"),
            a = i.getContext("2d");
        i.width = 256, i.height = 1;
        var r = a.createLinearGradient(0, 0, 256, 1);
        for (var n in e) r.addColorStop(+n, e[n]);
        a.fillStyle = r, a.fillRect(0, 0, 256, 1);
        var o = new Uint8Array(a.getImageData(0, 0, 256, 1).data);
        if (t && t.output) {
            var s = t.output.getContext("2d"),
                l = t.from || 0,
                c = t.to || 1,
                p = t.height || 4;
            i.height = p, a.fillStyle = r, a.fillRect(0, 0, 256, p);
            var h = Math.round(256 * l),
                u = Math.round(256 * (c - l));
            t.output.width = u, t.output.height = p, s.drawImage(a.canvas, -h, 0)
        }
        return o
    }, e.createBuffer = function (e, t) {
        var i = e.createBuffer();
        return e.bindBuffer(e.ARRAY_BUFFER, i), t && e.bufferData(e.ARRAY_BUFFER, t, e.STATIC_DRAW), i
    }, e.bindAttribute = function (e, t, i, a) {
        e.bindBuffer(e.ARRAY_BUFFER, t), e.enableVertexAttribArray(i), e.vertexAttribPointer(i, a, e.FLOAT, !1, 0, 0)
    }, e.bindFramebuffer = function (e, t, i, a, r) {
        e.bindFramebuffer(e.FRAMEBUFFER, t), a && r && e.viewport(0, 0, a, r), i && e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, i, 0)
    }, e.exitFrameBuffer = function (e) {
        this.bindFramebuffer(e, null)
    }, e.frameBufferStatus = function (e, t) {
        switch (t) {
            case e.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                return "FRAMEBUFFER_INCOMPLETE_ATTACHMENT";
            case e.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                return "FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT";
            case e.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                return "FRAMEBUFFER_INCOMPLETE_DIMENSIONS";
            case e.FRAMEBUFFER_UNSUPPORTED:
                return "FRAMEBUFFER_UNSUPPORTED"
        }
    }, e
}();
Interval.prototype._setTimer = function () {
    this._timers.push(setTimeout(this._doTheTick, this.interval))
}, Interval.prototype._doTheTick = function () {
    this._timers.shift(), "running" === this._state && 0 === this._timers.length && (this._setTimer(), this.tick())
}, Interval.prototype.stop = function () {
    this._state = "stopped", this._timers.forEach(function (e) {
        clearTimeout(e)
    }), this._timers = []
}, Interval.prototype.start = function () {
    this.stop(), this._state = "running", this._setTimer()
}, UserActivenessWatcher.prototype._USER_ACTIVENESS_EVENTS = ["mousemove", "mousedown", "mouseup", "keyup", "keydown", "touchstart"], UserActivenessWatcher.prototype.start = function () {
    var e = this;
    e._enabled || (e._enabled = !0, e._lastUserActivness = Date.now(), e._timer.start(), document.addEventListener("visibilitychange", e._onDocumentVisibilityChange), e._USER_ACTIVENESS_EVENTS.forEach(function (t) {
        document.addEventListener(t, e._registerUserActiveness)
    }))
}, UserActivenessWatcher.prototype.stop = function () {
    var e = this;
    e._enabled && (e._enabled = !1, e._lastUserActivness = Date.now(), e._timer.stop(), document.removeEventListener("visibilitychange", e._onDocumentVisibilityChange), e._USER_ACTIVENESS_EVENTS.forEach(function (t) {
        document.removeEventListener(t, e._registerUserActiveness)
    }))
}, UserActivenessWatcher.prototype.onChange = function (e, t) {
    var i = this;
    "number" == typeof e ? i._callbacks.push({
        callback: t,
        reason: "afk",
        timeout: e,
        done: !1
    }) : i._callbacks.push({
        callback: t,
        reason: e,
        done: !1
    })
}, UserActivenessWatcher.prototype.offChange = function (e, t) {
    var i, a = this,
        r = null,
        n = e;
    "number" == typeof e && (n = "afk", i = e);
    for (var o = 0; o < a._callbacks.length; o++) {
        var s = a._callbacks[o];
        if (s.callback === t && s.reason === n && ("afk" !== n || s.timeout === i)) {
            r = o;
            break
        }
    }
    r && a._callbacks.splice(r, 1)
}, UserActivenessWatcher.prototype._checkUserActiveness = function () {
    var e = this,
        t = Date.now() - e._lastUserActivness;
    e._callCallbacks(function (e) {
        return "afk" === e.reason && t > e.timeout
    })
}, UserActivenessWatcher.prototype._callCallbacks = function (e) {
    for (var t = this, i = 0; i < t._callbacks.length; i++) {
        var a = t._callbacks[i];
        e(a) && !a.done && (a.done = !0, a.callback("leave"))
    }
}, UserActivenessWatcher.prototype._onDocumentVisibilityChange = function () {
    var e = this;
    "hidden" === document.visibilityState ? e._callCallbacks(function (e) {
        return "tab-change" === e.reason
    }) : "visible" === document.visibilityState && e._registerUserActiveness()
}, UserActivenessWatcher.prototype._registerUserActiveness = function () {
    for (var e = this, t = 0; t < e._callbacks.length; t++) {
        var i = e._callbacks[t];
        i.done && (i.done = !1, i.callback("come-back"))
    }
    e._lastUserActivness = Date.now()
}, WindVisualizer.prototype.applyConfig = function (e) {
    this.particleOpacity = e.particleOpacity || this.particleOpacity, this.particleFadeSpeed = e.particleFadeSpeed || this.particleFadeSpeed, this.particlesLimit = e.particlesLimit || this.particlesLimit, this.particleSpeedScale = e.particleSpeedScale || this.particleSpeedScale, this.particleBaseSize = (e.particleBaseSize || this.particleBaseSize) * this.dpi, this.particleDropRate = e.particleDropRate || this.particleDropRate, this.particleDropRateBump = e.particleDropRateBump || this.particleDropRateBump, this.particleMaxSpeed = e.particleMaxSpeed || this.particleMaxSpeed, this.particleMinSpeed = e.particleMinSpeed || this.particleMinSpeed, this.particleSeed = e.particleSeed || this.particleSeed
}, WindVisualizer.prototype.applyTargetingConfig = function () {
    var e = this.params,
        t = e.platform,
        i = "touch" === t,
        a = this.drawContext,
        r = i ? "limited" : "default";
    this.applyConfig(e);
    var n;
    try {
        n = a.getExtension("WEBGL_debug_renderer_info")
    } catch (e) {}
    if (n) {
        var o = a.getParameter(n.UNMASKED_VENDOR_WEBGL),
            s = a.getParameter(n.UNMASKED_RENDERER_WEBGL);
        i && ("Qualcomm" === o || s.match(/^Adreno/)) && (r = "default")
    }
    var l = e[r];
    l && (l.particleBaseSize = l.particleBaseSize || Math.round(this.particleBaseSize / this.dpi), this.applyConfig(l))
}, WindVisualizer.prototype.init = function () {
    var e = this.drawContext;
    e.disable(e.DEPTH_TEST), e.disable(e.STENCIL_TEST), this.screenBuffer = GlUtils.createBuffer(e, GlUtils.makeRectangleFan(-1, -1, 2, 2)), this.windDataTexture = e.createTexture(), e.activeTexture(e.TEXTURE0 + this.TEXTURE_UNITS.windData), e.bindTexture(e.TEXTURE_2D, this.windDataTexture), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), this.initPalette(), this.initMergeTexture(), this.initDrawTexture(), this.initParticles(), this.initMoveParticles(), this.initDrawParticles(), this.resize(null, null, !0)
}, WindVisualizer.prototype.updatePalette = function (e) {
    var t = this.drawContext;
    this.params.palette = e || this.params.palette;
    var i = this.colorsTexture,
        a = GlUtils.createPalette(this.params.palette, {
            output: this.params.paletteOutput
        });
    t.activeTexture(t.TEXTURE0 + this.TEXTURE_UNITS.colors), t.bindTexture(t.TEXTURE_2D, i), t.texImage2D(t.TEXTURE_2D, 0, t.RGBA, 256, 1, 0, t.RGBA, t.UNSIGNED_BYTE, a)
}, WindVisualizer.prototype.initPalette = function () {
    var e = this.drawContext;
    this.colorsTexture = e.createTexture(), e.activeTexture(e.TEXTURE0 + this.TEXTURE_UNITS.colors), e.bindTexture(e.TEXTURE_2D, this.colorsTexture), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR), this.updatePalette()
}, WindVisualizer.prototype.setData = function (e, t) {
    var i = this.drawContext;
    this.data = e, this.bounds = t, i.activeTexture(i.TEXTURE0 + this.TEXTURE_UNITS.windData), i.bindTexture(i.TEXTURE_2D, this.windDataTexture), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, i.RGBA, i.UNSIGNED_BYTE, this.data)
}, WindVisualizer.prototype.clearTextures = function () {
    var e = this.drawContext,
        t = this,
        i = t.width,
        a = t.height,
        r = new Uint8Array(i * a * 4);
    this.stages.particles.screens.forEach(function (t) {
        e.activeTexture(e.TEXTURE0 + t.unit), e.bindTexture(e.TEXTURE_2D, t.texture), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, i, a, 0, e.RGBA, e.UNSIGNED_BYTE, r), e.bindFramebuffer(e.FRAMEBUFFER, t.framebuffer), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, t.texture, 0)
    }), e.bindFramebuffer(e.FRAMEBUFFER, null)
}, WindVisualizer.prototype.initDrawTexture = function () {
    var e = this.drawContext,
        t = this.stages.drawTexture = {};
    t.computer = GlUtils.createProgram(e, this.screenVert, this.screenFrag), t.computerOpaco = GlUtils.createProgram(e, this.screenVert, this.screenFragOpaco)
}, WindVisualizer.prototype.drawTexture = function (e) {
    var t = this.drawContext,
        i = this.stages.drawTexture,
        a = void 0 === e.opacity ? 1 : e.opacity,
        r = 1 === a ? i.computer : i.computerOpaco;
    t.useProgram(r.program), GlUtils.bindAttribute(t, this.screenBuffer, r.a_pos, 2), t.uniform1i(r.u_screen, e.unit), 1 !== a && t.uniform1f(r.u_opacity, a), t.uniform1f(r.u_flipY, e.flipY || 1), t.drawArrays(t.TRIANGLE_FAN, 0, 4)
}, WindVisualizer.prototype.initMergeTexture = function () {
    var e = this.drawContext,
        t = this.stages.mergeTextures = {};
    t.computer = GlUtils.createProgram(e, this.screenVert, this.mergeFrag)
}, WindVisualizer.prototype.mergeTextures = function (e, t) {
    var i = this.drawContext,
        a = this.stages.mergeTextures,
        r = a.computer;
    i.useProgram(r.program), GlUtils.bindAttribute(i, this.screenBuffer, r.a_pos, 2), i.uniform1i(r.u_tex1, e), i.uniform1i(r.u_tex2, t), i.uniform1f(r.u_tex2opacity, this.particleFadeSpeed), i.uniform1f(r.u_flipY, 1), i.drawArrays(i.TRIANGLE_FAN, 0, 4)
}, WindVisualizer.prototype.clear = function () {
    var e = this.drawContext;
    e.clearColor(0, 0, 0, 0), e.clear(e.COLOR_BUFFER_BIT), this.clearTextures()
}, WindVisualizer.prototype.resize = function (e, t, i) {
    var a = GlUtils.resize(this.drawContext, {
        width: e,
        height: t,
        useDeviceDPI: this.dpi > 1 && this.noDpiFix
    });
    if (this.width !== a.width || this.height !== a.height || i) {
        var r = [1.32, 2.45];
        this.width = a.width, this.height = a.height, this.height > this.width ? (this.particleSeed[0] = r[1], this.particleSeed[1] = r[0]) : (this.particleSeed[0] = r[0], this.particleSeed[1] = r[1]), this.particlesDimensionComputed = null, this.clearTextures()
    }
}, WindVisualizer.prototype.particlesDimension = function () {
    if (this.particlesDimensionComputed) return this.particlesDimensionComputed;
    var e = Math.min(this.particlesLimit || 1 / 0, 65536);
    e = Math.ceil(Math.sqrt(e));
    var t = e * e;
    return this.particlesDimensionComputed = {
        size: e,
        count: t
    }
}, WindVisualizer.prototype.resetParticles = function () {
    this.particlesDimensionComputed = null;
    for (var e = this.drawContext, t = this.particlesDimension(), i = this.stages.particles, a = 4, r = 256, n = t.count * a, o = i.particlesData = new Uint8Array(n), s = 0; s < n; s++) o[s] = Math.floor(Math.random() * r);
    var l = t.size;
    i.states.forEach(function (t) {
        e.bindTexture(e.TEXTURE_2D, t.texture), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, l, l, 0, e.RGBA, e.UNSIGNED_BYTE, o), e.bindFramebuffer(e.FRAMEBUFFER, t.framebuffer), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, t.texture, 0)
    }), e.bindFramebuffer(e.FRAMEBUFFER, null);
    for (var c = new Float32Array(t.count), s = 0; s < t.count; s++) c[s] = s;
    var p = i.particleIndexesBuffer = e.createBuffer();
    e.bindBuffer(e.ARRAY_BUFFER, p), e.bufferData(e.ARRAY_BUFFER, c, e.STATIC_DRAW)
}, WindVisualizer.prototype.initParticles = function () {
    for (var e = this.drawContext, t = this.TEXTURE_UNITS, i = [], a = [], r = this.stages.particles = {
            resize: !0
        }, n = 0; n < 2; n++) {
        var o = e.createTexture(),
            s = t["particlesState" + n],
            l = e.createFramebuffer();
        i[n] = {
            texture: o,
            unit: s,
            framebuffer: l
        }, e.activeTexture(e.TEXTURE0 + s), e.bindTexture(e.TEXTURE_2D, o), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), e.bindFramebuffer(e.FRAMEBUFFER, l), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, o, 0)
    }
    for (var n = 0; n < 2; n++) {
        var o = e.createTexture(),
            s = t["particles" + n],
            l = e.createFramebuffer();
        a[n] = {
            texture: o,
            unit: s,
            framebuffer: l
        }, e.activeTexture(e.TEXTURE0 + s), e.bindTexture(e.TEXTURE_2D, o), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR), e.bindFramebuffer(e.FRAMEBUFFER, l), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, o, 0)
    }
    e.bindFramebuffer(e.FRAMEBUFFER, null), r.states = i, r.screens = a, r.particlesPointer = 0, this.resetParticles()
}, WindVisualizer.prototype.initMoveParticles = function () {
    var e = this.drawContext,
        t = this.stages.particles;
    t.move = GlUtils.createProgram(e, this.screenVert, this.particlesMoveFrag)
}, WindVisualizer.prototype.moveParticles = function () {
    var e = this.drawContext,
        t = this.stages.particles,
        i = t.move,
        a = this.particlesDimension(),
        r = a.size,
        n = t.particlesPointer;
    a.count && a.size && this.data && (e.bindFramebuffer(e.FRAMEBUFFER, t.states[n].framebuffer), e.useProgram(i.program), e.viewport(0, 0, r, r), t.particlesPointer = n ? 0 : 1, GlUtils.bindAttribute(e, this.screenBuffer, i.a_pos, 2), e.uniform4f(i.u_bounds, this.bounds[0][0], this.bounds[0][1], this.bounds[1][0], this.bounds[1][1]), e.uniform2f(i.u_resolution, this.width, this.height), e.uniform1i(i.u_wind, this.TEXTURE_UNITS.windData), e.uniform1f(i.u_flipY, 1), e.uniform1i(i.u_particles, t.states[t.particlesPointer].unit), e.uniform1f(i.u_rand, Math.random()), e.uniform1f(i.u_speed_scale, this.particleSpeedScale), e.uniform1f(i.u_drop_rate, this.particleDropRate), e.uniform1f(i.u_drop_rate_bump, this.particleDropRateBump), e.uniform2f(i.u_max_speed, this.particleMaxSpeed[0], this.particleMaxSpeed[1]), e.uniform2f(i.u_seed, this.particleSeed[0], this.particleSeed[1]), e.drawArrays(e.TRIANGLE_FAN, 0, 4), e.bindFramebuffer(e.FRAMEBUFFER, null))
}, WindVisualizer.prototype.initDrawParticles = function () {
    var e = this.drawContext,
        t = this.stages.particles;
    t.draw = GlUtils.createProgram(e, this.particlesDrawVert, this.particlesDrawFrag)
}, WindVisualizer.prototype.drawParticles = function () {
    var e = this.drawContext,
        t = this.stages.particles,
        i = t.draw,
        a = this.particlesDimension(),
        r = t.particlesPointer;
    a.count && a.size && this.data && (e.bindFramebuffer(e.FRAMEBUFFER, t.screens[r].framebuffer), this.drawTexture({
        unit: t.screens[r ? 0 : 1].unit,
        opacity: this.particleFadeSpeed
    }), e.useProgram(i.program), GlUtils.bindAttribute(e, t.particleIndexesBuffer, i.a_index, 1), e.uniform1i(i.u_wind, this.TEXTURE_UNITS.windData), e.uniform1i(i.u_particles, t.states[r].unit), e.uniform1f(i.u_size, a.size), e.uniform1f(i.u_particleBaseSize, this.particleBaseSize), e.uniform1f(i.u_particleMinSpeed, this.particleMinSpeed), e.uniform1f(i.u_opacity, this.particleOpacity), e.enable(e.BLEND), e.blendFunc(e.SRC_COLOR, e.ONE_MINUS_SRC_COLOR), e.drawArrays(e.POINTS, 0, a.count), e.disable(e.BLEND))
}, WindVisualizer.prototype.render = function () {
    if (this.data) {
        var e = this.drawContext,
            t = this.stages.particles;
        e.viewport(0, 0, this.width, this.height), this.drawTexture({
            unit: t.screens[t.particlesPointer].unit
        }), this.drawParticles(), this.moveParticles()
    }
}, __PREC_PATTERNS_ENCODED = {
    "snow-avg": {
        src: "data:image/png;base64,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",
        frameWidth: 200,
        frameHeight: 200
    },
    "snow-low": {
        src: "data:image/png;base64,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",
        frameWidth: 200,
        frameHeight: 200
    },
    "snow-hvy": {
        src: "data:image/png;base64,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",
        frameWidth: 200,
        frameHeight: 200
    },
    "rain-avg": {
        src: "data:image/png;base64,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",
        frameWidth: 200,
        frameHeight: 200
    },
    "rain-low": {
        src: "data:image/png;base64,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",
        frameWidth: 200,
        frameHeight: 200
    },
    "rain-hvy": {
        src: "data:image/png;base64,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",
        frameWidth: 200,
        frameHeight: 200
    },
    "sleet-low": {
        src: "data:image/png;base64,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",
        frameWidth: 200,
        frameHeight: 200
    },
    "sleet-avg": {
        src: "data:image/png;base64,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",
        frameWidth: 200,
        frameHeight: 200
    },
    "sleet-hvy": {
        src: "data:image/png;base64,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",
        frameWidth: 200,
        frameHeight: 200
    }
}, ymaps.modules.define("HexagonTileLayer", ["Layer", "util.PrTree", "util.hd", "util.extend", "util.defineClass"], function (e, t, i, a, r, n) {
    var o, s = a.getPixelRatio(),
        l = function () {
            function e(e) {
                n !== e && (o = Math.pow(2, e + 8) * a, n = e)
            }
            var t = 6378137,
                i = 2 * Math.PI * t,
                a = 1 / i,
                r = i / 2,
                n = -1;
            return {
                toGlobal: function (t, i) {
                    if (void 0 === i) throw new Error("zoom expected");
                    return e(i), [(r + t[0]) * o, (r - t[1]) * o]
                },
                fromGlobal: function (t, i) {
                    if (void 0 === i) throw new Error("zoom expected");
                    return e(i), [t[0] / o - r, r - t[1] / o]
                }
            }
        }(),
        c = function (e) {
            c.superclass.constructor.call(this, "", r({
                tileTransparent: !0
            }, e)), this.__bounds = this.options.get("bounds"), this.__dataParts = [], this.__canvasStorage = {}, this.__zoom = null, this.__projection = null, this.__tree = null, this.__disableStroke = this.options.get("disableStroke"), this.__strokeColor = this.options.get("strokeColor"), this.__strokeWidth = this.options.get("strokeWidth"), this.__rebuildOnZoomChange = !0;
            var t = this;
            ymaps.util.imageLoader.proxy.add({
                matchUrl: function (e) {
                    return 0 === e.indexOf("pollen-tile:")
                },
                load: function (e) {
                    var i = e.split(":")[1],
                        a = ymaps.vow.defer();
                    return a.resolve(t.__canvasStorage[i]), a.promise()
                }
            })
        };
    n(c, t, {
        insertData: function (e) {
            this.__dataParts = this.__dataParts.concat(e), this.__tree && this.__tree.insert(this._dataToShapes(e))
        },
        clearData: function () {
            this.__tree && (this.__tree.removeAll(), this.__tree = null), this.__dataParts = []
        },
        _dataToShapes: function (e) {
            for (var t = [], i = e.hexagons, a = e.radius, r = e.height, n = 0; n < i.length; ++n) {
                var o = i[n],
                    s = this.__getShapeBbox(o.center, a, r, 10);
                null !== s && t.push({
                    object: o,
                    bbox: s,
                    radius: a,
                    height: r
                })
            }
            return t
        },
        getTileUrl: function (e, t) {
            if (null !== this.__zoom && this.__zoom === t || (this.__zoom = t), !this.__tree && (this.__canvasStorage = {}, this.__buildPrTree(this.__rebuildOnZoomChange ? this.__zoom : 0), this.__projection = this.getMap().options.get("projection"), !this.__projection._mercator)) throw new Error("mercator only");
            this.__treeZoom = t, this.__buildBoundsPrTree(this.__rebuildOnZoomChange ? this.__zoom : 0);
            var i = e.join("-") + "_" + t;
            return this.__canvasStorage[i] = this.__renderTile(e, t), "pollen-tile:" + i
        },
        __buildBoundsPrTree: function (e) {
            var t = this.__bounds,
                a = this.__projection;
            if (t && t.length) {
                this.__boundsTree ? this.__boundsTree.removeAll() : this.__boundsTree = new i;
                var r = t.map(function (t) {
                    var i = a.toGlobalPixels([t.lb.lon, t.lb.lat], e),
                        r = a.toGlobalPixels([t.rt.lon, t.rt.lat], e);
                    return {
                        bbox: [
                            [i[0], r[1]],
                            [r[0], i[1]]
                        ]
                    }
                }, this);
                this.__boundsTree.insert(r)
            }
        },
        __buildPrTree: function (e) {
            this.__tree = new i, this.__treeZoom = e;
            for (var t = [], a = 0; a < this.__dataParts.length; ++a) t = t.concat(this._dataToShapes(this.__dataParts[a]));
            this.__tree.insert(t)
        },
        getObjectsInGlobalPixels: function (e) {
            if (!this.__tree) return [];
            var t = this.getMap().getZoom(),
                i = 1,
                a = l.toGlobal(l.fromGlobal(e, t), 10);
            return this.__tree.search([a, [a[0] + i, a[1] + i]]).map(function (e) {
                return $.extend({
                    globalPixels: l.toGlobal(e.object.center, t)
                }, e.object)
            })
        },
        search: function (e) {
            if (!this.__tree) return [];
            var t = [l.toGlobal(l.fromGlobal([e[0][0], e[0][1]], this.__zoom), 10), l.toGlobal(l.fromGlobal([e[1][0], e[1][1]], this.__zoom), 10)];
            return this.__tree.search(t)
        },
        __getShapeBbox: function (e, t, i, a) {
            return [l.toGlobal([e[0] - t, e[1] + i + i], a), l.toGlobal([e[0] + t, e[1] - i - i], a)]
        },
        __renderTile: function (e, t) {
            var i = e[0],
                a = e[1],
                r = this.options.get("tileSize", 256),
                n = [i * r, a * r],
                o = document.createElement("canvas"),
                l = Math.pow(2, this.__treeZoom - t),
                c = [
                    [n[0] * l, n[1] * l],
                    [(n[0] + r) * l, (n[1] + r) * l]
                ],
                p = this.search(c),
                h = this.__boundsTree && this.__boundsTree.search(c),
                u = r * s;
            o.height = u, o.width = u;
            var g = o.getContext("2d");
            this._drawBoundsInTile(h, n, g);
            var A = this.__disableStroke || t < 8 ? 0 : this.__strokeWidth;
            g.lineWidth = A, g.strokeStyle = this.__strokeColor;
            for (var d = 0, I = p.length; d < I; d++) {
                var E = p[d],
                    f = this.__getShapeVertices(E, t, A ? 0 : 1),
                    m = E.object.color;
                g.beginPath();
                for (var y = 0; y < f.length; ++y) {
                    var C = f[y];
                    g[y ? "lineTo" : "moveTo"]((C[0] - n[0]) * s, (C[1] - n[1]) * s)
                }
                g.fillStyle = m, g.fill(), A && g.stroke()
            }
            return o
        },
        _drawBoundsInTile: function (e, t, i) {
            var a = i.canvas;
            i.fillStyle = this.options.get("unavailabilityPattern"), i.fillRect(0, 0, a.width, a.height);
            for (var r = 0; r < e.length; ++r) {
                var n = e[r].bbox,
                    o = (n[0][0] - t[0]) * s,
                    l = (n[0][1] - t[1]) * s,
                    c = (n[1][0] - t[0]) * s,
                    p = (n[1][1] - t[1]) * s,
                    h = c - o,
                    u = p - l;
                i.clearRect(o, l, h, u)
            }
        },
        __getShapeVertices: function (e, t, i) {
            var a = e.object,
                r = l.toGlobal(a.center, t),
                n = r[0],
                s = r[1],
                c = e.radius * o,
                p = e.height * o,
                h = n - c,
                u = n,
                g = n + c + i,
                A = s - p,
                d = A - p,
                I = s + p + i,
                E = I + p;
            return [
                [u, d],
                [g, A],
                [g, I],
                [u, E],
                [h, I],
                [h, A]
            ]
        }
    }), e(c)
}), PollenVisualizer.prototype.setData = function (e) {
    this.data !== e && (this._assigned = !1, this.data = e), this.render()
}, PollenVisualizer.prototype.setFilters = function (e) {
    var t = Object.keys(e),
        i = !1;
    this.activeAllergens = t.filter(function (t) {
        return !!e[t].enabled && (i = !0, !0)
    }), t.length && !i && (this.activeAllergens = t), this._assigned = !1, this.render()
}, PollenVisualizer.prototype.activate = function () {
    this._active = !0, this.render()
}, PollenVisualizer.prototype.deactivate = function () {
    this._active = !1, this.layer && (this.map.layers.remove(this.layer), this._rendered = !1, this._canvas = null)
}, PollenVisualizer.prototype._calcAllergensMax = function (e, t) {
    for (var i = 3, a = 0, r = 0; r < e.length; ++r) {
        var n = e[r],
            o = t[n];
        if (o && o > a) {
            if (o === i) return o;
            a = o
        }
    }
    return a
}, PollenVisualizer.prototype._assignData = function (e, t) {
    if (!this._assigned) {
        var i = this.colors,
            a = this.activeAllergens,
            r = t.type + "_" + t.timestamp + "_" + a.join("-"),
            n = !1;
        this._dataKey !== r && (this._dataKey = r, this._assignedDataParts = {}, n = !0, e.clearData());
        for (var o = 0; o < t.parts.length; ++o) {
            var s = t.parts[o],
                l = s.tile.join("_");
            if (this._assignedDataParts[l] !== !0) {
                this._assignedDataParts[l] = !0;
                for (var c = s.data.polygons, p = s.data.r, h = [], u = 0; u < c.length; ++u) {
                    var g = c[u],
                        A = g.allergens;
                    if (A) {
                        var d = this._calcAllergensMax(a, A);
                        d && (g.color = i[d - 1], h.push(g))
                    }
                }
                e.insertData({
                    radius: p,
                    height: p / Math.sqrt(3),
                    hexagons: h
                }), n = !0
            }
        }
        n && e.update()
    }
}, PollenVisualizer.prototype.render = function () {
    var e = this.data,
        t = this.layer;
    this._active && t && (e && this._assignData(t, e), this._rendered || (this._rendered = !0, this.map.layers.add(t), this._canvas = t.getElement().children[0], $(this._canvas).detach()))
}, PollenVisualizer.prototype.getImage = function () {
    return this._canvas
}, PollenVisualizer.prototype.hasObjectsInGlobalPixelBounds = function (e) {
    return 0 !== this.layer.search(e).length
}, QueueCache.prototype.put = function (e, t) {
    var i = this.cache,
        a = this.cacheKeys;
    a.push(e), a.length > this.capacity && delete i[a.shift()], i[e] = t
}, QueueCache.prototype.get = function (e) {
    return this.cache[e]
}, QueueCache.prototype.update = function (e, t) {
    return void 0 === this.cache[e] ? this.put(e, t) : void(this.cache[e] = t)
}, QueueCache.prototype.remove = function (e) {
    var t = this.cache,
        i = this.cacheKeys;
    void 0 !== t[e] && (delete t[e], i.splice(i.indexOf(e), 1))
}, $.retryableAjax = function (e) {
    return $.ajax(e).then(function (e) {
        return e
    }, function (t, i, a) {
        return e.retryCount > 0 && e.retryOnCodes.indexOf(t.status) !== -1 ? $.retryableAjax($.extend(e, {
            retryCount: e.retryCount - 1
        })) : (new $.Deferred).rejectWith(this, [t, i, a])
    })
}, window.__extend = function (e, t) {
    function i() {
        this.constructor = e
    }
    for (var a in t)({}).hasOwnProperty.call(t, a) && (e[a] = t[a]);
    return i.prototype = t.prototype, e.prototype = new i, e.__super__ = t.prototype, e
}, MapLayer.prototype._requireActive = function (e) {
    var t = this;
    return function () {
        if (t._isActive) return e.apply(this, arguments)
    }
}, MapLayer.prototype._coordsToMapPosition = function (e, t, i) {
    t = t || e.options.get("projection");
    var a = t.toGlobalPixels(i, e.getZoom()),
        r = e.getGlobalPixelBounds()[0];
    return [a[0] - r[0], a[1] - r[1]]
}, MapLayer.prototype._getUnavailabilityPattern = function () {
    var e = this;
    if (!e.__unavailabilityPatternDeferred) {
        var t = $.Deferred(),
            i = new Image;
        i.onload = function () {
            var a = document.createElement("canvas").getContext("2d"),
                r = e._getDeviceScale();
            a.imageSmoothingEnabled = !1, 1 !== r && a.scale(r, r), t.resolve(a.createPattern(i, "repeat"))
        }, i.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAQAAAAziH6sAAAADklEQVQI12O43cHwohUACMIC0T8MlCEAAAAASUVORK5CYII=", e.__unavailabilityPatternDeferred = t
    }
    return e.__unavailabilityPatternDeferred
}, MapLayer.prototype._getUnavailabilityPatternSync = function () {
    if (!MapLayer.__unavailabilityPattern) {
        var e = $(".weather-maps__unavailability-pattern")[0] || new Image,
            t = document.createElement("canvas").getContext("2d");
        t.imageSmoothingEnabled = !1, MapLayer.__unavailabilityPattern = t.createPattern(e, "repeat")
    }
    return MapLayer.__unavailabilityPattern
}, MapLayer.prototype._getDeviceScale = function () {
    var e = window.devicePixelRatio || 1;
    return 1 / e
}, __extend(TileMapLayer, MapLayer), TileMapLayer.prototype.getBalloonContent = function (e) {
    var t = this;
    if (t._getBalloonMarkup && t._isBalloonActive()) return t._dataSource.getBalloonValue(e, t._horizon, {
        timeout: 2e3,
        retries: 1
    }).then(t._getBalloonMarkup.bind(t))
}, TileMapLayer.prototype._isBalloonActive = function () {
    var e = this;
    return e._isActive
}, TileMapLayer.prototype.hasChanges = function () {
    var e = this;
    return e._hasChanges
}, TileMapLayer.prototype.renderFrameToContext = function (e) {
    var t = this;
    if (t._isInitialized()) {
        var i = t._getCanvas();
        if (!t._isCanvasReady(i) || !t._isCanvasReady(e.canvas)) return;
        t._hasChanges = !1;
        var a = t._smoothByZoom && t._smoothByZoom[t._map.getZoom()],
            r = e.globalAlpha,
            n = e.filter;
        e.globalAlpha !== t._opacity && (e.globalAlpha = t._opacity), t._canvasFilterSupport ? a && (e.filter = "blur(" + a + "px)") : a ? t.__lastSmoothElement.style.filter = "blur(" + a + "px)" : t.__lastSmoothElement.style.filter = "none", e.drawImage(i, 0, 0, Math.round(i.width), Math.round(i.height), 0, 0, Math.round(e.canvas.width), Math.round(e.canvas.height)), e.globalAlpha !== r && (e.globalAlpha = r), e.filter !== n && (e.filter = n)
    } else if (t._unavailabilityPattern) {
        var o = e.fillStyle;
        e.fillStyle = t._unavailabilityPattern, e.fillRect(0, 0, e.canvas.width, e.canvas.height), e.fillStyle = o
    }
}, TileMapLayer.prototype.afterAdd = function () {
    var e = this;
    return e._isActive = !0, e._nowTimestamp = e._buildNowTimestamp(), e._setTimeline({
        loading: !0
    }), e._initialize().then(function () {
        if (e._isActive) return e._setControls && e._setControls(), e.__lastSmoothElement = $(".weather-maps").bem("weather-maps")._drawer._mapContext.canvas.parentElement, e._reloadData()
    })
}, TileMapLayer.prototype.beforeRemove = function () {
    var e = this;
    e._isActive = !1, e._timelineDeferred = null, e._clearControls && e._clearControls(), e._dataSource.detach(), !e._canvasFilterSupport && e.__lastSmoothElement && (e.__lastSmoothElement.style.filter = "none")
}, TileMapLayer.prototype.reloadData = function () {
    var e = this;
    if (e._isActive) return e._setTimeline({
        loading: !0
    }), e._isInitialized() ? e._reloadData() : e._initialize().then(function () {
        e._reloadData()
    })
}, TileMapLayer.prototype.setBounds = function (e, t, i) {
    var a = this,
        r = Boolean(a._dataSource._canvas);
    a._isActive && r && a._canvas && (i ? (a._dataSource.layer._onViewportChange(), a._updateInnerCanvas()) : (a._updateInnerCanvas(), a._reloadData()))
}, TileMapLayer.prototype.setLocation = function (e) {
    var t = this;
    t._coords = e, t._isActive && (t._setTimeline({
        loading: !0
    }), t._timelineDeferred = null, t._reloadData())
}, TileMapLayer.prototype.setTimestamp = function (e) {
    var t = this,
        i = e / 1e3;
    t._horizon !== i && (t._horizon = i, t._isActive && !t._setTimestampDeferred && t._reloadData()), t._setTimestampDeferred && (t._setTimestampDeferred.resolve(), t._setTimestampDeferred = null)
}, TileMapLayer.prototype.getOnPointPopupDataSource = function () {
    var e = this;
    if (e._isActive && e._dataSource.getBalloonApiDataSource) return e._dataSource.getBalloonApiDataSource()
}, TileMapLayer.prototype._isCanvasReady = function (e) {
    return e && e.width && e.height
}, TileMapLayer.prototype._buildNowTimestamp = function () {
    return Date.now()
}, TileMapLayer.prototype._reloadData = function () {
    var e = this;
    return e._timelineDeferred && "rejected" !== e._timelineDeferred.state() || (e._timelineDeferred = e._reloadTimelineData()), e._timelineDeferred.then(function () {
        return e._dataSource.getTiles(e._horizon)
    }).then(function (t) {
        e._isActive && (e._canvas = t, e._updateInnerCanvas())
    }, function (t) {
        return e._isActive && t && e._setTimeline({
            error: 404 === t.status ? "noData" : "loadingError"
        }), $.Deferred().reject()
    })
}, TileMapLayer.prototype._reloadTimelineData = function () {
    var e = this;
    return e._hasTimeline ? e._dataSource.getTimeline(e._coords, e._geoId).then(function (t) {
        var i = t.filter(function (t) {
            return e._dataSource.hasHorizon(t.ts / 1e3)
        });
        return e._setTimestampDeferred = $.Deferred(), e._setTimeline(i, e._nowTimestamp), e._setTimestampDeferred
    }) : e._dataSource.hasHorizon(e._horizon) ? $.Deferred().resolve() : $.Deferred().reject()
}, TileMapLayer.prototype._setTimelineByConfig = function (e, t, i) {
    var a = this;
    if (e) {
        if (t && t.length) {
            var r = null;
            t = t.map(function (e) {
                var t = e.date.split("-")[2],
                    i = t !== r;
                return r = t, $.extend({
                    isDayStart: i
                }, e)
            })
        }
        var n = a._getCurrentAndNearestTimelineItem(t, i),
            o = n[0],
            s = n[1];
        a._api.setTimeline(t, e.itemBlockName, {
            initialTimestamp: s && s.ts,
            nowTimestamp: o && o.ts || i,
            theme: e.theme
        })
    }
}, TileMapLayer.prototype._getCurrentAndNearestTimelineItem = function (e, t) {
    if (!e || !e.length) return [null, null];
    var i, a = 1 / 0,
        r = 36e5,
        n = e.length;
    if (1 === n) a = 3 * r;
    else
        for (i = 1; i < n; i++) a = Math.min(a, e[i].ts - e[i - 1].ts);
    var o = a / 2,
        s = e[0],
        l = e[n - 1];
    if (t < s.ts - o) return [null, s];
    if (l.ts + o <= t) return [null, l];
    for (i = 0; i < n; i++) {
        var c = e[i],
            p = c.ts - o,
            h = c.ts + o;
        if (h <= c.ts) {
            var u = e[i - 1];
            return [null, Math.abs(c.ts - t) > Math.abs(u.ts - t) ? u : c]
        }
        if (p <= t && t < h) return [c, c]
    }
    return console.error("Unexpectable behaviour"), [null, null]
}, TileMapLayer.prototype._getCanvas = function () {
    var e = this;
    return e._canvas
}, TileMapLayer.prototype._initialize = function () {
    var e = this,
        t = void 0 !== e._readyDeferred && !e._isInitializationFailed();
    return t ? e._readyDeferred : (e._readyDeferred = e._dataSource.loadManifest().then(e._afterInitialize.bind(e), e._onInitializeError.bind(e)), e._readyDeferred)
}, TileMapLayer.prototype._afterInitialize = function () {}, TileMapLayer.prototype._onInitializeError = function (e) {
    var t = this,
        i = e && 404 === e.status;
    return t._setTimeline({
        error: i ? "noData" : "loadingError"
    }), e
}, TileMapLayer.prototype._isInitialized = function () {
    var e = this;
    return e._readyDeferred && "resolved" === e._readyDeferred.state()
}, TileMapLayer.prototype._isInitializationFailed = function () {
    var e = this;
    return e._readyDeferred && "rejected" === e._readyDeferred.state()
}, TileMapLayer.prototype._setControls = void 0, TileMapLayer.prototype._clearControls = void 0, TileMapLayer.prototype._outOfZoomRange = function () {
    this._hasChanges = !0
}, TileMapLayer.prototype._updateInnerCanvas = function () {
    var e = this,
        t = e._map.getZoom();
    return e._minZoom > t || e._maxZoom < t ? e._outOfZoomRange() : void(e._hasChanges = !0)
}, __extend(TileVisualizerMapLayer, TileMapLayer), TileVisualizerMapLayer.prototype.setBounds = function () {
    var e = this;
    e._tileVisualizer && TileVisualizerMapLayer.__super__.setBounds.apply(this, arguments)
}, TileVisualizerMapLayer.prototype._afterInitialize = function (e) {
    var t = this;
    TileVisualizerMapLayer.__super__._afterInitialize.apply(this, arguments), t._tileVisualizer = new window[e.tileVisualizer.class](t._getVisualizerArguments(e))
}, TileVisualizerMapLayer.prototype._getCanvas = function () {
    var e = this;
    return e._tileVisualizer.canvas
}, TileVisualizerMapLayer.prototype._getVisualizerArguments = function (e) {
    var t = e.tileVisualizer.args || {};
    return t.noDpiFix = e.noDpiFix, t
}, TileVisualizerMapLayer.prototype._outOfZoomRange = function () {
    this._tileVisualizer.clear(), this._hasChanges = !0
}, TileVisualizerMapLayer.prototype._updateData = function () {
    this._tileVisualizer.setData(this._canvas)
}, TileVisualizerMapLayer.prototype._updateInnerCanvas = function () {
    var e = this;
    if (e._canvas && e._tileVisualizer) {
        var t = e._map.getZoom();
        if (e._minZoom > t || e._maxZoom < t) return e._outOfZoomRange();
        e._tileVisualizer.canvas.width === e._canvas.width && e._tileVisualizer.canvas.height === e._canvas.height || e._tileVisualizer.resize(e._canvas.width, e._canvas.height), e._updateData(), e._hasChanges = !0
    }
};
var LIGHTINGS_QUEUE_STEP = 1e3;
__extend(LightningMapLayer, MapLayer), LightningMapLayer.prototype._USER_ACTIVENESS_EVENTS = ["mousemove", "mousedown", "mouseup", "keyup", "keydown", "touchstart"], LightningMapLayer.prototype.hasChanges = function () {
    return !1
}, LightningMapLayer.prototype.renderFrameToContext = function () {}, LightningMapLayer.prototype.afterAdd = function () {
    var e = this;
    e._isActive = !0, e._selfDisabled = !1, e._show(), e._api.setTimestamp(e._getNearestNowTimestamp())
}, LightningMapLayer.prototype.beforeRemove = function () {
    var e = this;
    e._isActive = !1, e._hide()
}, LightningMapLayer.prototype.setTimestamp = function (e) {
    var t = this,
        i = t._getNearestNowTimestamp();
    return i !== e && t._isActive ? (t._selfDisabled = !0, {
        enable: !1
    }) : i === e && t._selfDisabled ? {
        enable: !0
    } : void 0
}, LightningMapLayer.prototype._getNearestNowTimestamp = function () {
    var e = new Date;
    return e.setMinutes(10 * Math.round(e.getMinutes() / 10), 0, 0)
}, LightningMapLayer.prototype._boundsChange = function () {
    var e = this;
    e._watchLightningsEnabled && (e._lightningsLoadTimer.stop(), e._updateLightningsBound(function () {
        e._lightningsLoadTimer.start()
    }))
}, LightningMapLayer.prototype._bindToEvents = function () {
    var e = this;
    e._map.events.add("boundschange", e._boundsChange), BEM.channel("user").on("afk", function () {
        e._watchLightningsEnabled = !1, e._lightningsLoadTimer && e._lightningsLoadTimer.stop()
    }), BEM.channel("user").on("come-back", function () {
        e._lightningsVisible && e._loadInitialLightnings(function (t) {
            e._applyLightnings(t), e._watchLightningsEnabled = !0, e._lightningsLoadTimer.start()
        })
    })
}, LightningMapLayer.prototype._show = function () {
    var e = this;
    e._lightningsVisible || (e._watchLightningsEnabled = !0, e._lightningsLoadTimer.start(), e._lightningsLifeTimer.start(), e._loadInitialLightnings(e._requireActive(function (t) {
        e._applyLightnings(t), e._watchLightningsEnabled = !0, e._lightningsLoadTimer.start()
    })), e._startTrackUserActiveness(), e._showLightnings())
}, LightningMapLayer.prototype._hide = function () {
    var e = this;
    e._lightningsVisible && (e._watchLightningsEnabled = !1, e._lightningsLoadTimer.stop(), e._lightningsLifeTimer.stop(), e._resetLightnings(), e._hideLightnings(), e._stopTrackUserActiveness())
}, LightningMapLayer.prototype._hideLightnings = function () {
    var e = this;
    e._oldLightnings && e._oldLightnings.setFilter(filterHideAllLightnings), e._newLightnings && e._newLightnings.setFilter(filterHideAllLightnings), e._lightningsVisible = !1
}, LightningMapLayer.prototype._showLightnings = function () {
    var e = this;
    e._oldLightnings && e._newLightnings.setFilter(e._pointsFilterFunction), e._newLightnings && e._oldLightnings.setFilter(e._pointsFilterFunction), e._lightningsVisible = !0
}, LightningMapLayer.prototype._resetLightnings = function () {
    var e = this;
    e._newLightnings.removeAll(), e._oldLightnings.removeAll(), e._previousLightnings = null, e._lightningsQueue = [], e._cachedLightnings = {}
}, LightningMapLayer.prototype._applyLightnings = function (e) {
    var t = this;
    e = t._filterLightnings(e);
    var i = t._lightningsToPoints(e);
    t._addLightnings(i), t._sheduleLightnings(i, i)
}, LightningMapLayer.prototype._lightningsLifeTimerTick = function () {
    var e = this;
    e._reduceLightningsQueue()
}, LightningMapLayer.prototype._lightningsLoadTimerTick = function () {
    var e = this;
    e._loadLightnings(function (t) {
        t = e._filterLightnings(t);
        var i = e._lightningsToPoints(t);
        e._addLightnings(i), e._sheduleLightnings(i, i)
    })
}, LightningMapLayer.prototype._isLightningInRadar = function (e) {
    var t = this,
        i = t._globalStorage.radars,
        a = e.geometry.coordinates[0],
        r = e.geometry.coordinates[1];
    if (i)
        for (var n = i.length, o = 0; o < n; o++) {
            var s = i[o],
                l = ymaps.coordSystem.geo.getDistance([a, r], [s[0], s[1]]);
            if (l <= s[2]) return !0
        }
    return !1
}, LightningMapLayer.prototype._loadInitialLightnings = function (e) {
    var t = this,
        i = t._map.getBounds();
    if (!t._checkBound(i)) return e && e();
    var a = {
        min_lon: i[0][0],
        min_lat: i[0][1],
        max_lon: i[1][0],
        max_lat: i[1][1],
        last_seconds: Math.floor(t._lifetime / 1e3)
    };
    $.ajax({
        cache: !1,
        url: t._url + "bound",
        data: a,
        dataType: "json",
        headers: {
            accept: "*/*"
        },
        success: function (i) {
            e && e(i), t._updateLightningsTimestamp(i), t._updatePreviousLightnings(i)
        }
    })
}, LightningMapLayer.prototype._loadLightnings = function (e) {
    var t = this,
        i = t._map.getBounds();
    if (!t._checkBound(i)) return e();
    if (t._lightningsLoading) return e();
    t._lightningsLoading = !0;
    var a = {
        min_lon: i[0][0],
        min_lat: i[0][1],
        max_lon: i[1][0],
        max_lat: i[1][1],
        from_ts: t._lightningsTimestamp
    };
    $.ajax({
        cache: !1,
        url: t._url + "bound",
        data: a,
        dataType: "json",
        headers: {
            accept: "*/*"
        },
        success: function (i) {
            e && e(i), t._updateLightningsTimestamp(i), t._updatePreviousLightnings(i)
        },
        complete: function () {
            t._lightningsLoading = !1
        }
    })
}, LightningMapLayer.prototype._updatePreviousLightnings = function (e) {
    var t = this;
    e && e.length > 0 && (t._previousLightnings = e)
}, LightningMapLayer.prototype._addLightnings = function (e) {
    var t = this;
    e && (t._newLightnings.add(e), t._cacheLightnings(e))
}, LightningMapLayer.prototype._cacheLightnings = function (e) {
    var t = this;
    e && e.forEach(function (e) {
        t._cachedLightnings[e.id] = "new"
    })
}, LightningMapLayer.prototype._sheduleLightnings = function (e, t) {
    var i = this,
        a = Math.floor(i._freshTime / LIGHTINGS_QUEUE_STEP),
        r = Math.floor(i._lifetime / LIGHTINGS_QUEUE_STEP);
    void 0 === i._lightningsQueue[a] && (i._lightningsQueue[a] = {}), void 0 === i._lightningsQueue[r] && (i._lightningsQueue[r] = {}), e && (Array.isArray(i._lightningsQueue[a].moveToOld) ? i._lightningsQueue[a].moveToOld = i._lightningsQueue[a].moveToOld.concat(e) : i._lightningsQueue[a].moveToOld = e), t && (Array.isArray(i._lightningsQueue[r].remove) ? i._lightningsQueue[r].remove = i._lightningsQueue[r].remove.concat(t) : i._lightningsQueue[r].remove = t)
}, LightningMapLayer.prototype._reduceLightningsQueue = function () {
    var e = this,
        t = e._lightningsQueue.shift();
    t && (e._moveNewLightningsToOld(t.moveToOld), e._removeOldLightnings(t.remove))
}, LightningMapLayer.prototype._moveNewLightningsToOld = function (e) {
    var t = this;
    e && (t._newLightnings.remove(e), t._oldLightnings.add(e))
}, LightningMapLayer.prototype._removeOldLightnings = function (e) {
    var t = this;
    e && (t._oldLightnings.remove(e), e.forEach(function (e) {
        delete t._cachedLightnings[e.id]
    }))
}, LightningMapLayer.prototype._filterLightnings = function (e) {
    var t = this,
        i = {};
    if (e) return e.filter(function (e) {
        var a = t._getLightningId(e),
            r = i[a],
            n = t._cachedLightnings[a];
        return i[a] = !0, !n && !r && !t._inPreviousLightnings(e)
    }, [])
}, LightningMapLayer.prototype._inPreviousLightnings = function (e) {
    var t = this;
    if (t._previousLightnings) {
        var i, a = t._previousLightnings.length;
        for (i = 0; i < a; i++) {
            var r = t._getLightningId(t._previousLightnings[i]),
                n = t._getLightningId(e);
            if (r === n) return !0
        }
    }
    return !1
}, LightningMapLayer.prototype._getLightningId = function (e) {
    return e && e.lon + ":" + e.lat + ":" + e.time
}, LightningMapLayer.prototype._updateLightningsBound = function (e) {
    var t = this;
    t._loadInitialLightnings(function (i) {
        t._applyLightnings(i), e && e()
    })
}, LightningMapLayer.prototype._updateLightningsTimestamp = function (e) {
    var t = this;
    if (e && e.length) {
        var i = e.sort(function (e, t) {
            return e.time < t.time ? 1 : -1
        });
        t._lightningsTimestamp = Number(i[0].time)
    }
}, LightningMapLayer.prototype._lightningsToPoints = function (e) {
    var t = this;
    if (e) return e.map(function (e) {
        return {
            id: t._getLightningId(e),
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [e.lon, e.lat]
            }
        }
    })
}, LightningMapLayer.prototype._startTrackUserActiveness = function () {
    var e = this;
    e._userTrackingEnabled || (e._userTrackingEnabled = !0, e._isUserActive = !0, e._lastUserActivness = Date.now(), e._userActivnessStartTime = e._lastUserActivness, e._userActivnessTimer.start(), document.addEventListener("visibilitychange", e._onDocumentVisibilityChange), e._USER_ACTIVENESS_EVENTS.forEach(function (t) {
        document.addEventListener(t, e._registerUserActivness)
    }))
}, LightningMapLayer.prototype._stopTrackUserActiveness = function () {
    var e = this;
    e._userTrackingEnabled && (e._userTrackingEnabled = !1, e._userActivnessTimer.stop(), document.removeEventListener("visibilitychange", e._onDocumentVisibilityChange), e._USER_ACTIVENESS_EVENTS.forEach(function (t) {
        document.removeEventListener(t, e._registerUserActivness)
    }))
}, LightningMapLayer.prototype._onDocumentVisibilityChange = function () {
    var e = this;
    "hidden" === document.visibilityState ? e._registerUserAfk() : "visible" === document.visibilityState && e._registerUserActivness()
}, LightningMapLayer.prototype._registerUserActivness = function () {
    var e = this;
    e._isUserActive || (e._isUserActive = !0, BEM.channel("user").trigger("come-back")), e._lastUserActivness = Date.now()
}, LightningMapLayer.prototype._registerUserAfk = function () {
    var e = this;
    e._isUserActive = !1, BEM.channel("user").trigger("afk")
}, LightningMapLayer.prototype._checkUserActivness = function () {
    var e = this;
    e._isUserActive && Date.now() - e._lastUserActivness > e._userAfkInterval && e._registerUserAfk()
}, LightningMapLayer.prototype._checkBound = function (e) {
    return !(isNaN(e[0][0]) || isNaN(e[0][1]) || isNaN(e[1][0]) || isNaN(e[1][1]))
}, TemperatureBalloonsMapLayer.prototype.setLocation = function (e, t, i) {
    var a = this;
    i || $("#" + a._styleId).remove(), a._slug = i
}, TemperatureBalloonsMapLayer.prototype.setTimestamp = function (e) {
    var t = this;
    t._timestamp = e, t._isActive && t._timestamp && t._show()
}, TemperatureBalloonsMapLayer.prototype._makePlacemarkLayouts = function () {
    var e = this,
        t = $.queryParam("lang");
    e._iconLayout = ymaps.templateLayoutFactory.createClass(BH.apply({
        block: "balloon",
        cls: "ymaps-placemark ymaps-placemark_slug_{{properties.slug}}",
        content: {
            block: "link",
            url: e._serviceRoot + "/{{properties.slug}}/" + (t ? "?lang=" + t : ""),
            content: e._getContentPlacemark(!0)
        }
    })), e._clusterIconLayout = ymaps.templateLayoutFactory.createClass(BH.apply({
        block: "balloon",
        cls: "ymaps-placemark",
        content: e._getContentPlacemark()
    }))
}, TemperatureBalloonsMapLayer.prototype._addPresets = function () {
    var e = this;
    ymaps.option.presetStorage.add("weather#onMap", {
        iconLayout: e._iconLayout,
        iconOffset: [-26, -46],
        pane: "overlaps",
        interactivityModel: "default#opaque"
    }), ymaps.option.presetStorage.add("weather#onMapCluster", {
        iconLayout: e._clusterIconLayout,
        iconOffset: [-26, -46],
        interactivity: !1
    })
}, TemperatureBalloonsMapLayer.prototype._makeClusterer = function () {
    var e = this;
    e._cluster = new ymaps.Clusterer($.extend({
        groupByCoordinates: !1,
        clusterDisableClickZoom: !1,
        clusterOpenBalloonOnClick: !1,
        clusterPane: "overlaps",
        clusterIconLayout: e._clusterIconLayout
    }, e._clusterConfig)), e._cluster.origCreateCluster = e._cluster.createCluster, e._cluster.createCluster = function (t, i) {
        var a = e._cluster.origCreateCluster(t, i),
            r = a.getGeoObjects()[0].properties.getAll();
        return a.properties.set({
            icon: r.icon,
            temp: r.temp
        }), a
    }, e._map.geoObjects.add(e._cluster)
}, TemperatureBalloonsMapLayer.prototype.renderFrameToContext = function () {}, TemperatureBalloonsMapLayer.prototype.hasChanges = function () {
    return !1
}, TemperatureBalloonsMapLayer.prototype.beforeRemove = function () {
    var e = this;
    e._isActive = !1, e._cluster.removeAll()
}, TemperatureBalloonsMapLayer.prototype.afterAdd = function () {
    var e = this;
    if (e._isActive = !0, e._slug) {
        var t = ".ymaps-placemark_slug_" + e._slug + "{margin-top:50px}";
        e._api.setControls("bottom", '<style id="' + e._styleId + '">' + t + "</style>")
    }
    e._show()
}, TemperatureBalloonsMapLayer.prototype._show = function () {
    var e = this;
    if (e._isActive) {
        var t = e._getBounds();
        if (t) {
            var i = e._map.getZoom(),
                a = t.lt + ":" + t.rb + ":" + i + ":" + e._timestamp;
            return e._cache[a] ? void e._addNewPlacemarks(e._cache[a]) : void e._dataSource.getByBounds(t, i, e._timestamp / 1e3).then(function (t) {
                e._processData(a, t)
            }, function () {
                delete e._cache[a]
            })
        }
    }
}, TemperatureBalloonsMapLayer.prototype._processData = function (e, t) {
    var i = this;
    t && t.length ? (i._addNewPlacemarks(t), i._cache[e] = t) : delete i._cache[e]
}, TemperatureBalloonsMapLayer.prototype._getBounds = function () {
    var e = this,
        t = e._map.getZoom();
    if (t <= 3) return {
        lt: "-90,-180",
        rb: "90,180"
    };
    var i = e._map.getBounds();
    return e._checkBounds(i) ? {
        lt: i[0][1] + "," + i[0][0],
        rb: i[1][1] + "," + i[1][0]
    } : void 0
}, TemperatureBalloonsMapLayer.prototype._checkBounds = function (e) {
    return !(isNaN(e[0][0]) || isNaN(e[0][1]) || isNaN(e[1][0]) || isNaN(e[1][1]))
}, TemperatureBalloonsMapLayer.prototype._addNewPlacemarks = function (e) {
    var t = this;
    t._cluster.removeAll();
    for (var i = 0; i < e.length; i++) t._cluster.add(t._createPlacemark(e[i]))
}, TemperatureBalloonsMapLayer.prototype._createPlacemark = function (e) {
    var t = this,
        i = e.info,
        a = e.forecasts[Object.keys(e.forecasts)[0]],
        r = i.slug,
        n = {
            lat: i.lat,
            lon: i.lon
        },
        o = blocks.get("i-format-utils").buildGeoObjectNames(e.geo_object, n)[0].name,
        s = {
            slug: r,
            name: t._getName(o),
            icon: blocks.get("i-helper").iconName(a.icon),
            temp: blocks.get("i-helper").formatTemp(a.temp, t._lang, "°")
        };
    return new ymaps.Placemark([n.lon, n.lat], s, {
        preset: "weather#onMap",
        interactivityModel: "default#silent"
    })
}, TemperatureBalloonsMapLayer.prototype._getName = function (e) {
    return e && e.split(", ")[0] || e
}, TemperatureBalloonsMapLayer.prototype._getContentPlacemark = function (e) {
    return [{
        block: "icon",
        mix: {
            block: "balloon",
            elem: "icon"
        },
        mods: {
            thumb: "{{properties.icon}}",
            size: 20,
            color: "dark"
        }
    }, {
        block: "balloon",
        elem: "temp",
        content: "{{properties.temp}}"
    }, e && {
        block: "balloon",
        elem: "name",
        content: "{{properties.name}}"
    }]
}, __extend(PrecipitationMapLayer, MapLayer), PrecipitationMapLayer.prototype.hasChanges = function () {
    var e = this;
    return null !== e._dataDraw.prec || e._dataChanged
}, PrecipitationMapLayer.prototype.renderFrameToContext = function (e) {
    var t = this;
    if (t._initialized) {
        var i = t._framesCache[t._currentFrameIndex];
        i || (i = document.createElement("canvas"), i.width = e.canvas.width, i.height = e.canvas.height, t._drawFrame(i.getContext("2d")), t._framesCache[t._currentFrameIndex] = i), e.drawImage(i, 0, 0), t._dataChanged = !1, t._currentFrameIndex += 1, t._currentFrameIndex >= t._framesCount && (t._currentFrameIndex = 0)
    }
}, PrecipitationMapLayer.prototype.setTimestamp = function (e) {
    var t = this;
    if (t._timestamp !== e && t._isActive) {
        t._timestamp = e;
        var i = Boolean(t._getSelectedRawPrecData());
        i && t._updateDrawPrecData(), t._reloadData({
            lazyInfoUpdate: !0
        })
    }
}, PrecipitationMapLayer.prototype.setLocation = function (e) {
    var t = this;
    t._timestamp = t._getNowRoundedTimestamp(), t._coords && (t._geoId = null), t._coords = e, t._isActive && (t._setTimeline({
        loading: !0
    }), t._reloadData())
}, PrecipitationMapLayer.prototype.setBounds = function (e, t, i) {
    var a = this;
    if (a._dataChanged = !0, a._bounds = t, a._isActive) return i ? (a._updateDrawPrecData(), void a._clearCache()) : void(a._error && "loadingError" !== a._error || (a._updateDrawPrecData(), a._clearCache(), a._reloadData(a._isTimelineLoading ? {} : {
        lazyInfoUpdate: !0,
        skipPrecInfo: a._permanentNoData
    })))
}, PrecipitationMapLayer.prototype.afterAdd = function () {
    var e = this,
        t = 6e4;
    return e._isActive = !0, e._timestamp = e._getNowRoundedTimestamp(), e._api.userActivenessWatcher.onChange(10 * t, e._onUserActivenessChange), e._irrelevantInterval.start(), e.reloadData({
        precLazyPreload: !0
    })
}, PrecipitationMapLayer.prototype.beforeRemove = function () {
    var e = this;
    e._isActive = !1, e._api.setControls("top", null), e._api.hideBalloon(), e._api.userActivenessWatcher.offChange(e._onUserActivenessChange), e._irrelevantInterval.stop()
}, PrecipitationMapLayer.prototype.reloadData = function (e) {
    var t = this;
    if (t._isActive) return t._setTimeline({
        loading: !0
    }), t._reloadData(e)
}, PrecipitationMapLayer.prototype.onSizeChange = function () {
    var e = this;
    e._clearCache()
}, PrecipitationMapLayer.prototype._onUserActivenessChange = function (e) {
    var t = this;
    t._userLeave = "leave" === e, t._userLeave && t._tryActualizeData()
}, PrecipitationMapLayer.prototype._onIrrelevantIntervalTick = function () {
    var e = this;
    e._isDataRelevantByTime = !1, e._tryActualizeData()
}, PrecipitationMapLayer.prototype._tryActualizeData = function () {
    var e = this;
    e._userLeave && !e._isDataRelevantByTime && e._reloadData()
}, PrecipitationMapLayer.prototype._reloadData = function (e) {
    var t = this;
    if (t._coords) {
        t._error && (t._timestamp = t._getNowRoundedTimestamp()), t.__radarsDeferred && "rejected" !== t.__radarsDeferred.state() || (t.__radarsDeferred = t._dataSource.getRadars().then(function (e) {
            t._dataDraw.radars = e, t._globalStorage.radars = e
        })), e = e || {};
        var i = Math.random(),
            a = e.precLazyPreload,
            r = e.lazyInfoUpdate,
            n = e.skipPrecInfo;
        return t.__lastReloadId = i, t.__radarsDeferred.then(function () {
            if (i === t.__lastReloadId) {
                var e = t._map.getZoom(),
                    o = n || r ? $.Deferred().resolve() : t._dataSource.getAlert(t._coords, t._geoId, t._lang),
                    s = n ? $.Deferred().resolve() : t._dataSource.getTimeline(t._coords, t._geoId),
                    l = t._zoomRange[0] <= e && e <= t._zoomRange[1] ? t._getPrecData({
                        lazyPreload: a,
                        lazyPreloadDeps: s
                    }) : $.Deferred().resolve([{}]);
                return $.when(o, s, l)
            }
        }).then(function (e, a, o) {
            if (i === t.__lastReloadId) {
                var s = !t._isSameTimelines(t._data.timeline, a);
                return r && !n && s ? t._dataSource.getAlert(t._coords, t._geoId, t._lang).then(function (e) {
                    return [e, a, o]
                }) : [e, a, o]
            }
        }).then(function (e) {
            if (i === t.__lastReloadId) {
                var a = e[0],
                    o = e[1],
                    s = e[2],
                    l = s[0],
                    c = s[1],
                    p = !r || Boolean(a);
                return t._error = null, t._isDataRelevantByTime = !0, t._setPrecData(l), !n && p && t._setInfo(a, o), c
            }
        }).then(function (e) {
            e && i === t.__lastReloadId && t._setPrecData(e, !1)
        }).fail(function (e) {
            i === t.__lastReloadId && (t._data.timeline = null, t._onRequestFail(e))
        })
    }
}, PrecipitationMapLayer.prototype._isSameTimelines = function (e, t) {
    return e === t || e && t && e.length === t.length && e[0].ts === t[0].ts
}, PrecipitationMapLayer.prototype._setInfo = function (e, t) {
    var i = this;
    if (i._data.timeline = t, null === e) i._forceLoadByOne = !0,
        i._permanentNoData = !0, i._isActive && i._setTimeline({
            error: "noData"
        });
    else {
        e = e && $.extend({
            fact: e.fact
        }, e.alert);
        var a = !t;
        i._clearCache(), i._dataDraw.isLocalRadarBroken = a, i._forceLoadByOne = a, i._permanentNoData = !1, i._isActive && (a ? (i._setTimeline({
            error: "noData"
        }), e && e.isNoData && i._setAlert(e)) : (i._setTimeline(t), e && i._setAlert(e)))
    }
}, PrecipitationMapLayer.prototype._setPrecData = function (e, t) {
    var i = this;
    t = t !== !1, i._data.prec = e || {}, t && i._updateDrawPrecData()
}, PrecipitationMapLayer.prototype._getSelectedRawPrecData = function () {
    var e = this;
    return e._data.prec[e._timestamp / 1e3]
}, PrecipitationMapLayer.prototype._clearCache = function () {
    var e = this;
    e._framesCache = [], e._radarFrameCache = null
}, PrecipitationMapLayer.prototype._updateDrawPrecData = function () {
    var e = this,
        t = e._getSelectedRawPrecData();
    e._dataDraw.prec = null, t && (e._dataDraw.prec = e._preparePrecData(t)), e._dataChanged = !0, e._clearCache()
}, PrecipitationMapLayer.prototype._getNowRoundedTimestamp = function () {
    var e = new Date;
    return e.setMinutes(10 * Math.round(e.getMinutes() / 10), 0, 0)
}, PrecipitationMapLayer.prototype._drawFrame = function (e) {
    var t = this;
    t._error ? t._drawUnavailabilityPattern(e) : (t._drawRadars(e), t._drawPrec(e))
}, PrecipitationMapLayer.prototype._initFeatures = function (e) {
    var t = this,
        i = void 0 !== window.requestAnimationFrame,
        a = Boolean(e.degrade);
    t._features.cachePathSuport = void 0 !== window.Path2D, t._features.isOldDevice = a || !t._features.cachePathSuport || !i || /android 4|iPhone OS (5|6|7)/i.test(navigator.userAgent)
}, PrecipitationMapLayer.prototype._initService = function () {
    var e = this;
    e._service = {}, e._service.figure = new ymaps.geometry.Circle([50, 50], 1, {
        projection: e._map.options.get("projection")
    }), e._service.figure.setMap(e._map)
}, PrecipitationMapLayer.prototype._getPrecData = function (e) {
    var t = this,
        i = t._bounds,
        a = t._map.getZoom();
    e = e || {};
    var r = t._loadByOne || t._forceLoadByOne || t._map.getZoom() < 8,
        n = t._lazyPreloadEnable && e.lazyPreload,
        o = r || n ? {
            timestamp: t._timestamp
        } : void 0,
        s = t._dataSource.getPrecData(i, a, o);
    if (!r && n) {
        var l = e.lazyPreloadDeps,
            c = l ? $.when(s, l) : s;
        return c.then(function (e) {
            return [e, t._dataSource.getPrecData(i, a)]
        })
    }
    return s.then(function (e) {
        return [e]
    })
}, PrecipitationMapLayer.prototype._setTimeline = function (e) {
    var t = this;
    t._isTimelineLoading = Boolean(e.loading), t._api.setTimeline(e, "timeline-item_type_precipitation", {
        initialTimestamp: t._timestamp,
        nowTimestamp: Date.now()
    })
}, PrecipitationMapLayer.prototype._setAlert = function (e) {
    var t = this;
    if (t._api.setControls("top", null), null !== e && "norule" !== e.state && blocks._methods["weather-maps-alert_preset_nowcast"]) {
        var i = BH.apply(blocks.exec("weather-maps-alert_preset_nowcast", e));
        t._api.setControls("top", i)
    }
}, PrecipitationMapLayer.prototype._preparePrecData = function (e) {
    var t = this,
        i = [];
    if (e && e.length) {
        var a = t._bounds;
        e.forEach(function (e) {
            e.coord && e.coord.length && !t._notInBounds(a, e.props.bbox) && i.push({
                coord: e.coord.map(t._convertPolygonCoords),
                type: t._getPrecipitationType(e.props)
            })
        })
    }
    return i
}, PrecipitationMapLayer.prototype._notInBounds = function (e, t) {
    return t[0] > e[1][0] || t[1] < e[0][0] || t[2] > e[1][1] || t[3] < e[0][1]
}, PrecipitationMapLayer.prototype._convertPolygonCoords = function (e) {
    var t = this,
        i = t._map.getZoom();
    return e.map(function (e) {
        return t._api.coordsToCanvasPosition(e, i)
    })
}, PrecipitationMapLayer.prototype._getMiddlePoint = function (e, t) {
    return [(e[0] + t[0]) / 2, (e[1] + t[1]) / 2]
}, PrecipitationMapLayer.prototype._getPrecipitationType = function (e) {
    if (e.prec_type) {
        var t = {
                0: "clear",
                1: "rain",
                2: "sleet",
                3: "snow"
            }[e.prec_type],
            i = e.prec_strength;
        if (!i || ["clear"].indexOf(t) > -1) return t;
        var a = "-low",
            r = "-avg",
            n = "-hvy";
        switch (t) {
            case "sleet":
            case "rain":
            case "snow":
                switch (i) {
                    case .25:
                        t += a;
                        break;
                    case .5:
                        t += r;
                        break;
                    case .75:
                        t += n
                }
        }
        return t
    }
}, PrecipitationMapLayer.prototype._drawRadars = function (e) {
    var t = this;
    if (!t._radarFrameCache) {
        var i = t._makeCanvas(e.canvas.width, e.canvas.height),
            a = i.getContext("2d"),
            r = t._dataDraw.radars;
        if (t._radarFrameCache = i, !r) return;
        var n = t._map.getZoom(),
            o = t._service.figure,
            s = t._dataDraw.isLocalRadarBroken,
            l = t._coords && [t._coords.lon, t._coords.lat];
        a.fillStyle = t._radarPattern, a.globalCompositeOperation = "source-over", a.fillRect(0, 0, i.width, i.height), a.globalCompositeOperation = "destination-out", a.fillStyle = "rgba(0, 0, 0, 1)";
        for (var c, p, h, u, g = 0, A = r.length; g < A; g++) {
            p = r[g];
            var d = p.slice(0, 2);
            o.setCoordinates(p.slice(0, 2)), o.setRadius(p[2]), s && l && o.contains(l) || (h = o.getPixelGeometry(), c = t._api.coordsToCanvasPosition(d, n), u = h.getRadius(), a.beginPath(), a.arc(c[0], c[1], u, 0, 2 * Math.PI), a.closePath(), a.fill())
        }
    }
    e.drawImage(t._radarFrameCache, 0, 0)
}, PrecipitationMapLayer.prototype._drawPrec = function (e) {
    var t = this,
        i = t._dataDraw.prec;
    i && i.forEach(function (i) {
        i.coord.forEach(t._drawPolygon.bind(t, e, i.type))
    })
}, PrecipitationMapLayer.prototype._drawUnavailabilityPattern = function (e) {
    var t = this,
        i = e.fillStyle;
    e.fillStyle = t._unavailabilityPattern, e.fillRect(0, 0, e.canvas.width, e.canvas.height), e.fillStyle = i
}, PrecipitationMapLayer.prototype._drawPolygon = function (e, t, i, a) {
    var r, n = i,
        o = this.cachePathSuport;
    o ? n.path ? r = n.path : (r = this._makePrecPath(new Path2D, n), n.path = r) : this._makePrecPath(e, n);
    var s = "rgba(0, 0, 0, 1)",
        l = "destination-out",
        c = "source-over";
    e.fillStyle = s, e.globalCompositeOperation = l, e.lineJoin = "round", r ? e.fill(r) : e.fill(), 0 === a && t && (e.fillStyle = this._getPattern(t), e.globalCompositeOperation = c, r ? e.fill(r) : e.fill())
}, PrecipitationMapLayer.prototype._getPattern = function (e) {
    var t = this,
        i = t._precPatterns[e];
    if (!i || !i.length) return "rgba(0, 0, 0, 0)";
    var a = i.length,
        r = t._currentFrameIndex;
    return r >= a && (r -= Math.floor(r / a) * a), i[r]
}, PrecipitationMapLayer.prototype._makePrecPath = function (e, t) {
    e.beginPath && e.beginPath();
    var i, a = this;
    if (t.computed) i = function (e) {
        return t.computed[e]
    };
    else {
        t.computed = [], t.push(t[1]);
        var r, n, o;
        i = function (e) {
            return r = a._getMiddlePoint(t[e], t[e + 1]), n = r[0], o = r[1], t.computed[e] = e ? [t[e][0], t[e][1], n, o] : [n, o], t.computed[e]
        }
    }
    for (var s = "moveTo", l = "quadraticCurveTo", c = 0; c < t.length - 1; c++) e[c ? l : s].apply(e, i(c));
    return e
}, PrecipitationMapLayer.prototype._createPrecPatterns = function (e) {
    function t(e, t) {
        n[e] = t, o += 1, o === r.length && i.resolve(n)
    }
    var i = $.Deferred();
    if (e) {
        var a = this,
            r = Object.keys(e),
            n = {},
            o = 0;
        r.forEach(function (i) {
            var r = e[i];
            return r ? void a._createPrecPattern(i, r, t) : (console.warn("unknown sprite", i), t(i, null))
        })
    } else i.resolve(null);
    return i
}, PrecipitationMapLayer.prototype._createPrecPattern = function (e, t, i) {
    var a = this,
        r = document.createElement("canvas"),
        n = r.getContext("2d");
    n.imageSmoothingEnabled = !1;
    var o = t.frameWidth,
        s = t.frameHeight,
        l = this._getDeviceScale(),
        c = new Image;
    c.onload = function () {
        var t = c.width,
            r = c.height,
            p = Math.max(2, o * l),
            h = Math.max(2, s * l),
            u = t / o,
            g = r / s,
            A = [],
            d = a._makeCanvas(p, h),
            I = d.getContext("2d");
        1 !== l && I.scale(l, l);
        for (var E = 0, f = 0, m = -1, y = u * g; E < y; E++) ++m >= g && (m = 0, f++), I.clearRect(0, 0, o, s), I.drawImage(c, f * o, m * s, o, s, 0, 0, o, s), A.push(n.createPattern(d, "repeat"));
        i(e, A)
    }, c.onerror = function (t) {
        i(e, null, t)
    }, c.src = t.src
}, PrecipitationMapLayer.prototype._makeCanvas = function (e, t) {
    var i = document.createElement("canvas");
    return i.width = e, i.height = t, i
}, PrecipitationMapLayer.prototype._getDeviceScale = function () {
    var e = this;
    return e.isOldDevice ? 1 : PrecipitationMapLayer.__super__._getDeviceScale.apply(this)
}, PrecipitationMapLayer.prototype._onRequestFail = function (e) {
    var t = this;
    404 === e.status ? t._setNoDataError() : t._setLoadingError(), t._clearCache()
}, PrecipitationMapLayer.prototype._setNoDataError = function () {
    var e = this;
    e._setError("noData")
}, PrecipitationMapLayer.prototype._setLoadingError = function () {
    var e = this;
    e._setError("loadingError")
}, PrecipitationMapLayer.prototype._setError = function (e) {
    var t = this;
    t._error = e, t._dataChanged = !0, t._api.setTimeline({
        error: e
    }), t._api.setControls("top", null)
}, __extend(TemperatureMapLayer, TileMapLayer), TemperatureMapLayer.prototype.afterAdd = function () {
    var e = TemperatureMapLayer.__super__.afterAdd.apply(this, arguments),
        t = this;
    return t._api.showBalloon(), e
}, TemperatureMapLayer.prototype.beforeRemove = function () {
    TemperatureMapLayer.__super__.beforeRemove.apply(this, arguments);
    var e = this;
    e._api.hideBalloon()
}, TemperatureMapLayer.prototype._getTimelineConfig = function () {
    return {
        itemBlockName: "timeline-item_type_temperature",
        theme: "mini"
    }
}, TemperatureMapLayer.prototype._setControls = function () {
    var e = this;
    e._scaleTemplateHtml && (e._api.setControls("bottom", e._scaleTemplateHtml), $(".color-scale__line").append(e._scale)), e._$balloon = $(".balloon_pointer")
}, TemperatureMapLayer.prototype._clearControls = function () {
    var e = this;
    e._api.setControls("bottom", null)
}, TemperatureMapLayer.prototype._getBalloonMarkup = function (e) {
    var t = this;
    return BH.apply([{
        block: "icon",
        mods: {
            thumb: blocks.get("i-helper").iconName(e.icon),
            size: 24,
            color: "dark"
        }
    }, {
        block: "balloon",
        elem: "temp",
        content: blocks.get("i-helper").formatTemp(e.temp, t._lang, "°")
    }])
}, __extend(WindMapLayer, TileVisualizerMapLayer), WindMapLayer.prototype._initializeScale = function (e, t) {
    var i = this;
    i._scaleTemplateHtml = BH.apply(blocks.exec("color-scale", e.values, BEM.I18N("interface-common", "mps"))), i._scale = document.createElement("canvas"), GlUtils.createPalette(t, {
        output: i._scale,
        from: e.from,
        to: e.to
    })
}, WindMapLayer.prototype.beforeRemove = function () {
    WindMapLayer.__super__.beforeRemove.apply(this, arguments), this._visualizerCanvasAttached && $(this._tileVisualizer.canvas).detach(), this._visualizerCanvasAttached = !1
}, WindMapLayer.prototype.hasChanges = function () {
    return {
        external: !0
    }
}, WindMapLayer.prototype.renderFrameToContext = function () {
    this._tileVisualizer && this._tileVisualizer.render()
}, WindMapLayer.prototype._updateInnerCanvas = function () {
    var e = this,
        t = e._tileVisualizer.canvas,
        i = e._canvas;
    if (!e._visualizerCanvasAttached) {
        e._visualizerCanvasAttached = !0;
        var a = this._dataSource.layer.getElement();
        a.style.visibility = "visible", t.style.position = "absolute", a.appendChild(t)
    }
    var r = e._map.getZoom();
    return e._minZoom > r || e._maxZoom < r ? e._outOfZoomRange() : (t.width === i.width && t.height === i.height || (e._tileVisualizer.resize(i.width, i.height), t.style.width = i.style.width, t.style.height = i.style.height), t.style.left = i.style.left, t.style.top = i.style.top, void e._updateData())
}, WindMapLayer.prototype._updateData = function () {
    this._tileVisualizer.setData(this._canvas, this._map.getBounds())
}, __extend(WindColoredMapLayer, TileMapLayer), WindColoredMapLayer.prototype.afterAdd = function () {
    var e = this,
        t = WindColoredMapLayer.__super__.afterAdd.apply(this, arguments);
    return e._api.showBalloon(), e._hasWebGl() || e._showUnsupportedWebGlPopup(), t
}, WindColoredMapLayer.prototype.beforeRemove = function () {
    WindColoredMapLayer.__super__.beforeRemove.apply(this, arguments);
    var e = this;
    e._api.hideBalloon()
}, WindColoredMapLayer.prototype._setControls = function () {
    var e = this;
    e._scaleTemplateHtml && (e._api.setControls("bottom", e._scaleTemplateHtml), $(".color-scale__line").append(e._scale))
}, WindColoredMapLayer.prototype._clearControls = function () {
    var e = this;
    e._api.setControls("bottom", null)
}, WindColoredMapLayer.prototype._showUnsupportedWebGlPopup = function () {
    var e = this,
        t = "yw_maps_wps",
        i = sessionStorage.getItem(t) || localStorage.getItem(t);
    if (!i) {
        try {
            sessionStorage.setItem(t, !0)
        } catch (e) {
            console.error(e)
        }
        e._insertUnsupportedWebGlPopupBlock(function () {
            try {
                localStorage.setItem(t, !0)
            } catch (e) {
                console.error(e)
            }
        })
    }
}, WindColoredMapLayer.prototype._insertUnsupportedWebGlPopupBlock = function (e) {
    var t = this;
    "dialog" === t._webglPopupBlock ? t._insertUnsupportedWebGlPopupBlockDialog(e) : t._insertUnsupportedWebGlPopupBlockPopup(e)
}, WindColoredMapLayer.prototype._insertUnsupportedWebGlPopupBlockPopup = function (e) {
    var t = this,
        i = Math.min(400, t._map.container.getSize()[0] - 32),
        a = $(BH.apply({
            block: "popup",
            mix: {
                block: "weather-maps",
                elem: "popup-webgl"
            },
            mods: {
                type: "modal",
                position: "fixed",
                "has-close": "yes"
            },
            attrs: {
                style: "width:" + i + "px"
            },
            underMods: {
                type: "paranja"
            },
            content: {
                elem: "content",
                content: t._getUnsupportedWebGlPopupContent()
            }
        }));
    t._api.setControls("top", a), BEM.DOM.init(a, function (t) {
        var i = t.bem("popup");
        $(".weather-maps__webgl-popup-button-ok").on("click", function () {
            i.hide()
        }), $(".weather-maps__webgl-popup-button-hide").on("click", function () {
            e(), i.hide()
        }), i.show()
    })
}, WindColoredMapLayer.prototype._insertUnsupportedWebGlPopupBlockDialog = function (e) {
    var t = this,
        i = Math.min(400, t._map.container.getSize()[0] - 32),
        a = $(BH.apply({
            block: "dialog",
            mix: {
                block: "weather-maps",
                elem: "dialog-webgl"
            },
            content: {
                elem: "inner",
                attrs: {
                    style: "max-width:" + i + "px"
                },
                content: t._getUnsupportedWebGlPopupContent()
            }
        })).bem("dialog");
    a.domElem.appendTo(document.body), $(".weather-maps__webgl-popup-button-ok").on("click", function () {
        a.hide()
    }), $(".weather-maps__webgl-popup-button-hide").on("click", function () {
        e(), a.hide()
    }), a.show()
}, WindColoredMapLayer.prototype._getUnsupportedWebGlPopupContent = function () {
    return [{
        elem: "message",
        content: BEM.I18N("interface-common", "webgl.error.disable")
    }, {
        block: "button2",
        mix: {
            block: "weather-maps",
            elem: "webgl-popup-button-ok"
        },
        mods: {
            theme: "danger",
            size: "xm",
            pin: "circle-circle"
        },
        content: {
            elem: "text",
            content: BEM.I18N("interface-common", "webgl.error.button.ok")
        }
    }, {
        block: "button2",
        mix: {
            block: "weather-maps",
            elem: "webgl-popup-button-hide"
        },
        mods: {
            theme: "normal",
            size: "xm"
        },
        content: {
            elem: "text",
            content: BEM.I18N("interface-common", "webgl.error.button.hide")
        }
    }]
}, WindColoredMapLayer.prototype._getBalloonMarkup = function (e) {
    return BH.apply([blocks.exec("wind-arrow", e.wind_speed, e.wind_dir), {
        block: "balloon",
        elem: "wind",
        content: e.wind_speed < .5 ? BEM.I18N("interface-common", "wind-calm") : [BEM.I18N("interface-common", "wind-" + e.wind_dir + "-short") + ", ", Math.round(e.wind_speed), " ", BEM.I18N("interface-common", "mps")]
    }])
}, WindColoredMapLayer.prototype._getTimelineConfig = function () {
    return {
        itemBlockName: "timeline-item_type_wind",
        theme: "mini"
    }
}, WindColoredMapLayer.prototype._initializeScale = WindMapLayer.prototype._initializeScale, __extend(PressureMapLayer, TileMapLayer), PressureMapLayer.prototype.afterAdd = function () {
    var e = this,
        t = PressureMapLayer.__super__.afterAdd.apply(e, arguments);
    return e._api.showBalloon(), t
}, PressureMapLayer.prototype.beforeRemove = function () {
    var e = this;
    PressureMapLayer.__super__.beforeRemove.apply(e, arguments), e._api.hideBalloon()
}, PressureMapLayer.prototype._getTimelineConfig = function () {
    return {
        itemBlockName: "timeline-item_type_pressure",
        theme: "mini"
    }
}, PressureMapLayer.prototype._setControls = function () {
    var e = this;
    e._scaleTemplateHtml && (e._api.setControls("bottom", e._scaleTemplateHtml), $(".color-scale__line").append(e._scale)), e._$balloon = $(".balloon_pointer")
}, PressureMapLayer.prototype._clearControls = function () {
    var e = this;
    e._api.setControls("bottom", null)
}, PressureMapLayer.prototype._getBalloonMarkup = function (e) {
    return e.pressure_mm
}, window.__extend(BordersMapLayer, window.TileMapLayer), BordersMapLayer.prototype.renderFrameToContext = function () {
    var e = this;
    e._map.getZoom() <= e._maxZoom ? BordersMapLayer.__super__.renderFrameToContext.apply(this, arguments) : e._hasChanges = !1
}, BordersMapLayer.prototype.setTimestamp = function () {}, window.__extend(SimpleMapLayer, window.MapLayer), SimpleMapLayer.prototype.renderFrameToContext = function () {}, SimpleMapLayer.prototype.setTimestamp = function () {}, SimpleMapLayer.prototype.setCoords = function () {}, SimpleMapLayer.prototype.setBounds = function () {}, SimpleMapLayer.prototype.hasChanges = function () {
    return !1
}, SimpleMapLayer.prototype.afterAdd = function () {
    var e = this,
        t = e._layer;
    e._map.layers.add(t), t.getElement().style.opacity = e._opacity
}, SimpleMapLayer.prototype.beforeRemove = function () {
    var e = this;
    e._map.layers.remove(e._layer)
}, window.__extend(PollenMapLayer, window.MapLayer), PollenMapLayer.prototype.hasChanges = function () {
    var e = this;
    return e._hasChanges
}, PollenMapLayer.prototype.renderFrameToContext = function (e) {
    var t = this,
        i = t._tileVisualizer.getImage();
    if (t._hasChanges = !1, i) {
        var a = e.globalAlpha;
        e.globalAlpha = t._opacity, e.drawImage(i, 0, 0, Math.round(i.width), Math.round(i.height), 0, 0, Math.round(e.canvas.width), Math.round(e.canvas.height)), e.globalAlpha = a
    } else {
        var r = e.fillStyle;
        e.fillStyle = t._unavailabilityPattern, e.fillRect(0, 0, e.canvas.width, e.canvas.height), e.fillStyle = r
    }
}, PollenMapLayer.prototype.afterAdd = function () {
    var e = this;
    e._isActive = !0, e._timestamp = null;
    var t = e._initVisualizer().then(function () {
        return e._initializeFilter(), e._map.events.add("click", e._onMapClick), e._tileVisualizer.activate(), e.reloadData()
    });
    return e._initLegend(), e._api.setControls("top", e._$alertsParent), e._api.setControls("bottom", e._legend), t
}, PollenMapLayer.prototype._initVisualizer = function () {
    var e = this;
    return e._initVisualizerDeferred || (e._initVisualizerDeferred = $.Deferred(), e._tileVisualizer = new PollenVisualizer($.extend({
        map: e._map,
        allergens: e._allergens,
        colors: [e._colors.low, e._colors.middle, e._colors.high],
        bounds: e._bounds,
        unavailabilityPattern: e._unavailabilityPattern,
        onUpdate: function () {
            e._hasChanges = !0
        },
        onReady: function () {
            e._initVisualizerDeferred.resolve()
        }
    }, e._tileVisualizerArgs))), e._initVisualizerDeferred
}, PollenMapLayer.prototype._initLegend = function () {
    var e = this;
    e._legend || (e._legend = $(BH.apply(blocks.exec("pollen-legend", {
        colors: e._colors,
        allergens: e._allergens
    }))))
}, PollenMapLayer.prototype.beforeRemove = function () {
    var e = this;
    e._isActive = !1, e.filterControls.destruct(), e._api.setControls("top", null), e._api.setControls("bottom", null), e.filter.un("change", e._onFilterChange, e), e._map.events.remove("click", e._onMapClick), e._tileVisualizer.deactivate()
}, PollenMapLayer.prototype.reloadData = function () {
    var e = this;
    if (e._isActive) return e._setTimeline({
        loading: !0
    }), e._reloadData()
}, PollenMapLayer.prototype._updateAlertsPositionIfNeeded = function () {
    var e = this;
    e._isActive && e._updateAlertsPosition(e._$alertsParent)
}, PollenMapLayer.prototype.onAdUpdate = PollenMapLayer.prototype._updateAlertsPositionIfNeeded, PollenMapLayer.prototype._onResize = PollenMapLayer.prototype._updateAlertsPositionIfNeeded, PollenMapLayer.prototype._reloadData = function (e) {
    e = {
        timeline: !e || e.timeline === !0,
        groupedAlerts: !e || e.groupedAlerts === !0,
        calendar: !e || e.calendar === !0
    };
    var t = this,
        i = (new Date).getTime().toString() + Math.random().toString(),
        a = e.timeline,
        r = a ? t._dataSource.getTimeline(t._coords, t._geoId, t._getAllergenTypesByKeys(Object.keys(t._filter.selectedAllergens))) : t._resolvedDeferred;
    return t._lastReloadId = i, r.then(function (r) {
        if (i !== t._lastReloadId) return t._rejectedDeferred;
        var n = a && !r,
            o = e.groupedAlerts && !n && t._isGroupedAlertRequired() ? t._makeRejectFree(t._dataSource.getGroupedAlerts(t._coords, t._geoId, t._lang), null) : t._resolvedDeferred,
            s = e.calendar && t._isCalendarRequestRequired() && !n ? t._makeRejectFree(t._dataSource.getCalendar(t._coords, t._geoId), null) : t._resolvedDeferred;
        return $.when(o, s).then(function (e, a) {
            if (i !== t._lastReloadId) return t._rejectedDeferred;
            if (!n && t._isAlertRequired()) {
                var o = e ? e[0] : null;
                t._setAlert(o || t._defaultAlertValue)
            }
            a && t._setCalendarData(a), r ? t._setTimeline(r) : n && t._setTimeline({
                error: "noData"
            })
        })
    }, function () {
        t._setTimeline({
            error: "loadingError"
        })
    })
}, PollenMapLayer.prototype._makeRejectFree = function (e, t) {
    return e.then(void 0, function () {
        return $.Deferred().resolve(t)
    })
}, PollenMapLayer.prototype._getAllergenTypesByKeys = function (e) {
    for (var t = this, i = [], a = 0; a < e.length; ++a) {
        var r = t._allergens[e[a]];
        r && i.push(r.type)
    }
    return i
}, PollenMapLayer.prototype.setTimestamp = function (e, t) {
    var i = this;
    if (i._isActive) {
        var a = t.type;
        i._legend.bem("pollen-legend").toggleMod("hint", "yes", "", "climate" === a), !a || i._timestamp === e && i._dataType === a || (i._timestamp = e, i._dataType = a, i._reloadPollenData(i._dataType, i._timestamp), i._checkActiveTimelinePosition())
    }
}, PollenMapLayer.prototype._checkActiveTimelinePosition = function () {
    var e = this;
    if (e._timeline) {
        var t = e._timeline.domElem.find(".swiper-slide-active");
        t.hasClass("timeline-item_future-climate") ? e._timeline.setMod("position", "climate") : e._timeline.delMod("position")
    }
}, PollenMapLayer.prototype.setBounds = function (e, t, i) {
    var a = this;
    a._isActive && (a._hasChanges = !0, i ? a._tileVisualizer.layer._onViewportChange() : a._timestamp && a._dataType && a._reloadPollenData(a._dataType, a._timestamp))
}, PollenMapLayer.prototype.setLocation = function (e, t) {
    var i = this;
    i._coords = e, i._timeZoneOffset = t, i._timestamp = null, i._isActive && (i._setTimeline({
        loading: !0
    }), i._timelineDeferred = null, i._reloadData())
}, PollenMapLayer.prototype.onTutorialShown = function () {
    var e = this;
    e._tutorialShown = !0, e._isActive && e._showPredictionModalTried && e._showPredictionModalIfNoHexagons()
}, PollenMapLayer.prototype._isCalendarRequestRequired = function () {
    var e = this;
    return e._showAllergenActivity
}, PollenMapLayer.prototype._isAlertRequired = function () {
    return !safeSessionStorage.getItem("yw_maps_ac_pollen")
}, PollenMapLayer.prototype._isGroupedAlertRequired = function () {
    var e = this;
    return e._isAlertRequired() && e._isLocationInBounds()
}, PollenMapLayer.prototype._isLocationInBounds = function () {
    var e = this,
        t = [e._coords.lon, e._coords.lat];
    return ymaps.util.bounds.containsPoint(e._map.getBounds(), t)
}, PollenMapLayer.prototype._setCalendarData = function (e) {
    var t = this,
        i = t.filter;
    i && i.setCalendar(e)
}, PollenMapLayer.prototype._setTimeline = function (e) {
    var t = this;
    if (!e || !e.length) return e.error && (t._timestamp = null), t._api.setTimeline(e, "", {
        theme: "mini"
    });
    var i = 864e5,
        a = null,
        r = !0,
        n = Date.now() + t._timeZoneOffset,
        o = null,
        s = null,
        l = !1,
        c = BEM.I18N("interface-common", "stat"),
        p = e.map(function (e, c) {
            var p = "day" === a && "day" !== e.type || "day" !== a && "day" === e.type,
                h = !1;
            return a = e.type, e.type === t._dayManifestType && (r = !1, e.ts <= n && n < e.ts + i && (o = e.ts, s = c)), "climate" !== e.type || r || l || (l = !0, h = !0), $.extend({
                separated: p,
                color: t._colorsByConcentration[e.level],
                isPast: r
            }, h && {
                firstFutureClimateDay: !0
            }, e)
        });
    t.filter && t.filter.setTimestamp(o), t._getNearestFutureTimelineItemWithLevel = t._getNearestFutureTimelineItemWithLevelByNowIndexInData.bind(t, e, s), t._getTimelineItemNeighbourhood = t._getTimelineItemNeighbourhoodInData.bind(t, e), t._timeline = t._api.setTimeline(p, "timeline-item_type_pollen", {
        initialTimestamp: null === t._timestamp ? o : t._timestamp,
        nowTimestamp: o,
        theme: "mini",
        metadataFields: ["type"],
        customCurrentElement: {
            block: "timeline",
            elem: "current-comment",
            content: c
        }
    })
}, PollenMapLayer.prototype._getNearestFutureTimelineItemWithLevelByNowIndexInData = function (e, t) {
    if (null === t) return null;
    for (var i = t; i < e.length; ++i)
        if (e[i].level > 0) return e[i];
    return null
}, PollenMapLayer.prototype._getTimelineItemNeighbourhoodInData = function (e, t, i, a, r) {
    var n = this,
        o = n._indexOfTimelineItemInData(e, t, i);
    return o === -1 ? null : {
        left: e.slice(Math.max(0, o - a), o),
        right: e.slice(o + 1, o + 1 + r)
    }
}, PollenMapLayer.prototype._indexOfTimelineItemInData = function (e, t, i) {
    for (var a = 0; a < e.length; ++a) {
        var r = e[a];
        if (r.type === t && r.ts === i) return a
    }
    return -1
}, PollenMapLayer.prototype._filterAlerts = function (e, t) {
    return t.anyEnabledAllergens ? e.filter(function (e) {
        return t.selectedAllergens[e.allergen.key]
    }) : e
}, PollenMapLayer.prototype._getAlertRank = function (e) {
    var t = this,
        i = t._allergens[e.type];
    return i ? i.alertRank : 1 / 0
}, PollenMapLayer.prototype._setAlert = function (e) {
    var t = this,
        i = t._$alertsParent;
    if (i.empty(), e) {
        t._api.setControls("top", i), t._updateAlertsPosition(i);
        var a, r;
        e === t._ALERT_TYPE_HEALTH ? (r = BEM.I18N("recommendations-for-allergic", "recommendation_" + t._healthRecommendationNumber), a = {
            elem: "icon",
            mods: {
                type: "health"
            }
        }) : (r = e.text_short, a = e.image_url ? {
            block: "weather-maps-alert",
            elem: "icon",
            mods: {
                type: "allergens"
            },
            attrs: {
                style: 'background-image:url("' + e.image_url + '")'
            }
        } : null);
        var n = $(BH.apply({
            block: "weather-maps-alert",
            mods: {
                theme: "default",
                closable: "yes",
                "with-icon": Boolean(a)
            },
            content: [a, {
                elem: "text",
                content: r
            }, t._healthUrl && [{
                block: "button2",
                url: t._healthUrl,
                target: "_blank",
                mods: {
                    theme: "danger",
                    size: "m",
                    pin: "circle-circle",
                    type: "link"
                },
                text: BEM.I18N("interface-common", "maps.pollen.health-alert.button")
            }, {
                elem: "contraindications",
                content: BEM.I18N("interface-common", "maps.pollen.health-alert.contraindications")
            }]]
        })).appendTo(i).bem("weather-maps-alert");
        n.on("close", t._onAlertClose)
    }
}, PollenMapLayer.prototype._onAlertClose = function () {
    var e = this;
    e._api.metrika.reachGoal("ClosedHealthAlert"), safeSessionStorage.setItem("yw_maps_ac_pollen", 1)
}, PollenMapLayer.prototype._updateAlertsPosition = function (e) {
    var t = this,
        i = 16,
        a = 328,
        r = t._weatherMaps.elem("ad"),
        n = i + t._weatherMaps.elem("layers").width() + i,
        o = r.is(":visible"),
        s = i + (o ? r.width() + i : 0),
        l = window.innerWidth - n - s,
        c = l < a ? "left" : "right";
    t._weatherMaps.setMod(e, "pos", c), "right" === c && e.css("right", s)
}, PollenMapLayer.prototype._onFilterChange = function () {
    var e = this;
    e._setFilters(e.filter.getState()), e._setTimeline({
        loading: !0
    }), e._reloadData({
        timeline: !0
    })
}, PollenMapLayer.prototype._initializeFilter = function () {
    var e = this,
        t = $(BH.apply(blocks.exec("pollen-controls", {
            dialogMix: [{
                block: "weather-maps",
                elem: "dialog"
            }],
            allergens: e._allergens,
            colors: e._colors
        })));
    e._api.setControls("bottom", t), e.filterControls = t.bem("pollen-controls"), e.filter = e.filterControls.filter, e.filter.on("change", e._onFilterChange, e), e._setFilters(e.filter.getState())
}, PollenMapLayer.prototype._setFilters = function (e) {
    var t = this;
    t._filter = t._parseFilters(t._allergens, e), t._tileVisualizer.setFilters(e), t._isActive && t._setAllergensToMetrikaParams()
}, PollenMapLayer.prototype._setAllergensToMetrikaParams = function () {
    var e = this,
        t = {};
    if (e._filter.anyEnabledAllergens)
        for (var i = Object.keys(e._filter.selectedAllergens), a = 0; a < i.length; ++a) {
            var r = e._allergens[i[a]].type;
            t["selected_" + r] = 1
        } else t.selected_None = 1;
    e._api.metrika.params(t)
}, PollenMapLayer.prototype._parseFilters = function (e, t) {
    var i = {},
        a = {},
        r = !1;
    return Object.keys(e).forEach(function (e) {
        a[e] = !0, t[e] && t[e].enabled && (r = !0, i[e] = !0)
    }), {
        anyEnabledAllergens: r,
        selectedAllergens: r ? i : a
    }
}, PollenMapLayer.prototype._reloadPollenData = function (e, t) {
    var i = this,
        a = i._map.getBounds();
    i._dataSource.getData({
        type: e,
        timestamp: t,
        bounds: a
    }).then(function (e) {
        i._isActive && (i._tileVisualizer.setData(e), i._api.setPopup(null), i._showPredictionModalIfNoHexagons())
    }, function () {
        i._setTimeline({
            error: "loadingError"
        })
    })
}, PollenMapLayer.prototype._showPredictionModalIfNoHexagons = function () {
    var e = this;
    if (e._showPredictionModalTried = !0, e._tutorialShown && !e._predictionModalShown) {
        var t = e._map.getGlobalPixelBounds(),
            i = e._tileVisualizer.hasObjectsInGlobalPixelBounds(t);
        i || e._dataSource.getAlerts(e._coords, e._geoId, e._lang).then(function (t) {
            e._showPredictionModal(t)
        }), e._predictionModalShown = !0
    }
}, PollenMapLayer.prototype._showPredictionModal = function (e) {
    var t = this,
        i = t._filterAlerts(e, t._filter);
    if (i.length) {
        for (var a = {
                will_begin_within_one_week: [],
                will_begin_within_two_week: [],
                will_begin_within_one_month: []
            }, r = {}, n = !1, o = t._allergensByType, s = 0; s < i.length; ++s) {
            var l = i[s],
                c = l.code.indexOf("_"),
                p = l.code.substr(0, c),
                h = o[p];
            if (h && !r[p]) {
                var u = l.code.substr(c + 1);
                a[u] && (a[u].push(h), n = !0, r[p] = !0)
            }
        }
        if (n) {
            var g = t._map.container.getSize(),
                A = Math.min(400, g[0] - 32),
                d = g[1] - 32,
                I = $(BH.apply(blocks.exec("pollen-prediction-modal", a)));
            I.width(A), t._api.setControls("top", I), I.height() > d && I.height(d);
            var E = I.bem("pollen-prediction-modal");
            E.on("close-by-cross", function () {
                t._api.metrika.reachGoal("PollenWillBeLaterClosed")
            }), E.on("close-by-button", function () {
                t._api.metrika.reachGoal("PollenWillBeLaterAgreed");
                var e = t._getNearestFutureTimelineItemWithLevel();
                e && t._api.setTimestamp(e.ts)
            }), E.show()
        }
    }
}, PollenMapLayer.prototype._indexAllergensByType = function () {
    for (var e = this, t = e._allergens, i = Object.keys(t), a = {}, r = 0; r < i.length; ++r) {
        var n = i[r],
            o = t[n];
        a[o.type] = o
    }
    return a
}, PollenMapLayer.prototype._onMapClick = function (e) {
    function t(e, t) {
        var i = e[0] - t[0],
            a = e[1] - t[1];
        return Math.sqrt(i * i + a * a)
    }
    var i = this,
        a = e.get("globalPixels"),
        r = this._tileVisualizer.layer.getObjectsInGlobalPixels(a);
    if (!r.length) return void i._api.setPopup(null);
    var n = e.get("clientPixels"),
        o = {
            none: [],
            low: [],
            middle: [],
            high: []
        },
        s = ["none", "low", "middle", "high"],
        l = r.sort(function (e, i) {
            return e.d = t(e.globalPixels, a), i.d = t(i.globalPixels, a), t(e.globalPixels, a) - t(i.globalPixels, a)
        })[0];
    Object.keys(l.allergens).forEach(function (e) {
        if (i._filter.selectedAllergens[e]) {
            var t = l.allergens[e],
                a = i._allergens[e],
                r = s[t];
            o[r].push(a)
        }
    });
    var c = blocks.exec("pollen-popup-content", {
        allergenGroups: o,
        colors: i._colors
    });
    i._popupMaxHeight && (c = {
        block: "scrollable",
        content: c
    });
    var p = $(BH.apply(c));
    if (i._popupMaxHeight) {
        var h = p.bem("scrollable");
        h.elem("container").css("max-height", i._popupMaxHeight), h.setMaxHeight(i._popupMaxHeight)
    }
    i._api.setPopup(n, p)
}, ApiDataSource.prototype._buildParams = function (e, t) {
    return t ? {
        geoId: t
    } : {
        lat: e.lat,
        lon: e.lon
    }
}, ApiDataSource.prototype._makeRequest = function (e, t, i) {
    var a = this,
        r = {
            cache: !1,
            url: a._serviceRoot + e,
            data: t,
            dataType: "json",
            headers: a._headers
        };
    return i && (r = $.extend(r, i)), $.ajax(r)
}, BalloonApiDataSource.prototype._validateTimestamp = function (e) {
    var t = this;
    return t._manifestApiDataSource.load().then(function (t) {
        if (!t[e]) return (new $.Deferred).reject({
            status: 404
        })
    })
}, BalloonApiDataSource.prototype.getByCoords = function (e, t, i) {
    var a = this;
    return i = i || {}, a._validateTimestamp(t).then(function () {
        return $.ajax({
            cache: !1,
            url: a._serviceRoot + "/front/maps/balloon",
            data: {
                lat: e.lat,
                lon: e.lon,
                ts: t,
                onlyForecast: i.onlyForecast
            },
            timeout: i.timeout,
            dataType: "json",
            headers: a._headers,
            tryCount: 0,
            retries: i.retries
        }).then(function (e) {
            return e
        }, function (e, t, i) {
            return this.retries && this.tryCount < this.retries ? (this.tryCount += 1, $.ajax(this)) : i
        })
    })
}, BalloonApiDataSource.prototype.getByBounds = function (e, t, i) {
    var a = this;
    return a._validateTimestamp(i).then(function () {
        return $.ajax({
            cache: !1,
            url: a._serviceRoot + "/front/maps/balloons",
            data: {
                lt: e.lt,
                rb: e.rb,
                zoom: t,
                ts: i
            },
            dataType: "json",
            headers: a._headers
        })
    })
}, ManifestApiDataSource.prototype._cache = {}, ManifestApiDataSource.prototype.load = function () {
    var e = this;
    return "pollen-past" === e._type ? $.Deferred().resolve([]) : (e._cache[e._type] || (e._cache[e._type] = $.ajax({
        url: e._serviceRoot + "/front/maps/manifest",
        dataType: "json",
        cache: !1,
        data: {
            type: e._type
        }
    }).then(function (e) {
        return !e || $.isEmptyObject(e) ? (new $.Deferred).reject({
            status: 404
        }) : e
    })), e._cache[e._type])
}, TimelineApiDataSource.prototype.getTimeline = function (e, t, i, a) {
    var r = this;
    return $.ajax({
        cache: !1,
        url: r._serviceRoot + "/front/maps/timeline",
        data: $.extend({
            lat: t.lat,
            lon: t.lon,
            geoId: i,
            type: e
        }, a),
        dataType: "json",
        headers: r._headers
    }).then(r._parseTimelineData)
};
TimelineApiDataSource.prototype._parseTimelineData = function (e) {
    if (e)
        for (var t = 0; t < e.length; ++t) {
            var i = e[t];
            i.ts = 1e3 * i.ts
        }
    return e
};
RasterTileDataSource.prototype._createLayer = function () {
    var e = this,
        t = this.map,
        i = this.layer = new window.ymaps.Layer("", {
            tileTransparent: e._tileTransparent,
            projection: t.options.get("projection"),
            notFoundTile: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        });
    i.getTileUrl = function (t, i) {
        if (!e.tilesManifest) return void console.warn("exec loadManifest first");
        i = Math.min(i, e.MAX_ZOOM);
        var a = t[0],
            r = t[1],
            n = e.getWorldSize(i) / this.getTileSize(i)[0];
        return r < 0 || r >= n ? void 0 : (a < 0 && (a = n + a % n), a >= n && (a %= n), e.tilesHost + "/" + e.type + "/" + e._horizon + "/" + e.tilesManifest[e._horizon] + "/" + i + "/" + a + "_" + r + "." + e._fileExtension + "#crossOrigin")
    }, i.getTileSize = function (t) {
        var i = e.TILE_SIZE;
        return t > e.MAX_ZOOM && (i *= Math.pow(2, t - e.MAX_ZOOM)), [i, i]
    }, i.events.add("ready", function () {
        e._readyListener && e._isTilesWithHorizon(i, e._horizon) && e._readyListener()
    })
}, RasterTileDataSource.prototype._isTilesWithHorizon = function (e, t) {
    var i = e._tileContainer.tiles,
        a = e.getPane()._mapSizeHalf;
    if (i) {
        var r = e.clientPixelsToNumber(a, i._tileZoom),
            n = i.get(r);
        return n && n._url && n._url.indexOf("/" + t + "/") > -1
    }
}, RasterTileDataSource.prototype._attach = function () {
    var e = this,
        t = e.layer,
        i = e.map;
    i.layers.add(t);
    var a = t.getElement(),
        r = a.children[0];
    a.className = this.type + "-loader", a.style.visibility = "hidden", this._canvas = r, $(r).detach()
}, RasterTileDataSource.prototype.detach = function () {
    var e = this,
        t = e.layer,
        i = e.map;
    t && i.layers.remove(t), this._canvas = null
}, RasterTileDataSource.prototype.loadManifest = function () {
    var e = this;
    return e._manifestApiDataSource.load().then(function (t) {
        e.tilesManifest = t, e.horizons = e._buildHorizons(t, Date.now()), e._createLayer()
    })
}, RasterTileDataSource.prototype.getTiles = function (e) {
    var t = this,
        i = $.Deferred();
    return t.layer ? t.hasHorizon(e) ? t._canvas && e === t._horizon && 0 === t.layer._tileContainer.tiles.getPendingCount() ? i.resolve(t._canvas) : (t._readyListener = function () {
        t._readyListener = null, i.resolve(t._canvas)
    }, t._setHorizon(e), t._canvas || t._attach(), i) : (Raven.captureMessage("[Unexpected] Trying getTiles for horizon which not available", {
        level: "warning",
        extra: {
            type: t.type,
            horizon: e,
            manifest: t.tilesManifest
        }
    }), i.reject()) : (Raven.captureMessage("[Unexpected] Trying getTiles before layer created.", {
        level: "warning"
    }), i.reject())
}, RasterTileDataSource.prototype.hasHorizon = function (e) {
    var t = this;
    return t.horizons && t.horizons.indexOf(e) > -1
}, RasterTileDataSource.prototype.getBalloonApiDataSource = function () {
    var e = this;
    return e._balloonApiDataSource
}, RasterTileDataSource.prototype.getBalloonValue = function (e, t, i) {
    var a = this,
        r = $.extend({}, {
            onlyForecast: !0
        }, i);
    return a._balloonApiDataSource.getByCoords(e, t, r).then(function (e) {
        return e ? e : $.Deferred().reject({
            status: 404
        })
    })
}, RasterTileDataSource.prototype._buildHorizons = function (e, t) {
    var i = this,
        a = 12,
        r = Object.keys(e);
    if (0 === r.length) return [];
    r = r.map(Number).filter(function (e) {
        return !isNaN(e)
    }).sort(function (e, t) {
        return e - t
    });
    var n = i._getCurrentHorizonIndex(r, t),
        o = n[1],
        s = Math.max(o - a, 0),
        l = Math.min(o + a, r.length - 1);
    return r.slice(s, l + 1)
}, RasterTileDataSource.prototype._getCurrentHorizonIndex = function (e, t) {
    if (!e.length) return [null, null];
    t /= 1e3;
    var i = 1 / 0,
        a = 3600,
        r = e.length;
    if (1 === r) i = 3 * a;
    else
        for (n = 1; n < r; n++) i = Math.min(i, e[n] - e[n - 1]);
    if (t < e[0]) return [null, 0];
    if (e[r - 1] < t) return t - e[r - 1] > i ? [null, r - 1] : [r - 1, r - 1];
    for (var n = 0; n < r && !(t < e[n]); n++)
        if (t - e[n] < i) return [n, n];
    return [null, n]
}, RasterTileDataSource.prototype.getHorizons = function () {
    return this.horizons
}, RasterTileDataSource.prototype.getWorldSize = function (e) {
    return 256 * Math.pow(2, e)
}, RasterTileDataSource.prototype._setHorizon = function (e) {
    e !== this._horizon && (this._horizon = e, this.layer && this.layer.update())
}, RasterTileDataSource.prototype.getTimeline = function (e, t) {
    var i = this,
        a = i._timelineType || i.type;
    return i._timelineApiDataSource.getTimeline(a, e, t).then(function (e) {
        return e && e.length ? e : $.Deferred().reject({
            status: 404
        })
    })
}, PrecipitationApiDataSource.prototype.getRadars = function () {
    var e = this;
    return $.ajax({
        cache: !1,
        url: e._rootUrl + "radars",
        dataType: "json",
        headers: e._headers
    }).then(function (e) {
        if (e && e.length) return e.map(function (e) {
            return [e.lon, e.lat, e.radius]
        })
    })
}, PrecipitationApiDataSource.prototype.getPrecData = function (e, t, i) {
    var a = this;
    i = i || {};
    var r = i.isOldDevice === !0,
        n = i.simplify === !0,
        o = i.timestamp;
    if (!a._isBoundsValid(e)) return (new $.Deferred).resolve();
    var s = {
        lon_min: e[0][0],
        lat_min: e[0][1],
        lon_max: e[1][0],
        lat_max: e[1][1],
        is_old: r,
        zoom: t
    };
    return n && (s.simplify = !0), o && (s.ts = o / 1e3), $.ajax({
        cache: !1,
        url: a._rootUrl + "prec",
        data: s,
        dataType: "json",
        headers: a._headers
    }).then(a._parsePrecData)
}, PrecipitationApiDataSource.prototype.getAlert = function (e, t, i) {
    var a = this;
    return $.ajax({
        cache: !1,
        url: a._serviceRoot + "/front/maps/prec-alert",
        data: {
            lat: e.lat,
            lon: e.lon,
            geoId: t,
            lang: i
        },
        dataType: "json",
        headers: a._headers
    }).then(function (e) {
        return e
    })
}, PrecipitationApiDataSource.prototype._isBoundsValid = function (e) {
    return !(isNaN(e[0][0]) || isNaN(e[0][1]) || isNaN(e[1][0]) || isNaN(e[1][1]))
}, PrecipitationApiDataSource.prototype._parsePrecData = function (e) {
    var t = this,
        i = {};
    return Object.keys(e).forEach(t._extractFeatures.bind(t, i, e)), i
}, PrecipitationApiDataSource.prototype._extractFeatures = function (e, t, i) {
    var a = this,
        r = [],
        n = t[i].features;
    return e[i] = r, n.forEach(a._extractFeature.bind(a, r)), r
}, PrecipitationApiDataSource.prototype._extractFeature = function (e, t) {
    return 1 !== t.properties.prec_strength && e.push({
        props: t.properties,
        coord: t.geometry.coordinates
    }), e
}, window.__extend(PollenApiDataSource, window.ApiDataSource), PollenApiDataSource.prototype.getAlerts = function (e, t, i) {
    var a = this;
    return a._getAlerts(e, t, i, "pollen")
}, PollenApiDataSource.prototype.getGroupedAlerts = function (e, t, i) {
    var a = this;
    return a._getAlerts(e, t, i, "pollen_grouped")
}, PollenApiDataSource.prototype._getAlerts = function (e, t, i, a) {
    var r = this,
        n = r._buildParams(e, t);
    return n.lang = i, n.type = a, r._makeRequest("/front/maps/alert", n).then(function (e) {
        return e
    })
}, PollenApiDataSource.prototype.getCalendar = function (e, t) {
    var i = this,
        a = i._buildParams(e, t);
    return a.type = "pollen", i._makeRequest("/front/maps/calendar", a).then(function (e) {
        return e.calendar
    })
}, PollenApiDataSource.prototype.getTimeline = function (e, t, i) {
    var a = this,
        r = {
            maxonly: 1
        };
    return i && i.length && (r.pollens = i.join(",")), a._timelineDataSource.getTimeline("pollen", e, t, r)
}, PollenApiDataSource.prototype.getData = function (e) {
    var t = this,
        i = e.timestamp;
    if (null !== i && void 0 !== i) {
        var a = Math.floor(i / 1e3),
            r = e.type;
        return t._getMergedManifest().then(function (i) {
            var n = t._dataGridSize,
                o = i[r],
                s = o[a];
            if (s) {
                var l = e.bounds,
                    c = {
                        ts: a,
                        hash: s,
                        gridSize: n,
                        url: t._tilesHost + "/" + t._types[r]
                    },
                    p = t._findVisibleTiles(l).map(function (e) {
                        return t._loadHexagons(c, e)
                    });
                return $.when.apply(null, p)
            }
        }).then(function () {
            for (var e = [], t = 0; t < arguments.length; ++t) {
                var a = arguments[t];
                a && a.data.polygons && e.push(a)
            }
            return {
                type: r,
                timestamp: i,
                parts: e
            }
        })
    }
}, PollenApiDataSource.prototype._roundedValue = function (e, t) {
    return Math.floor(e / t) * t
}, PollenApiDataSource.prototype._findVisibleTilesRange = function (e, t) {
    var i = this,
        a = i._dataGridSize,
        r = [i._roundedValue(e[0][t], a), i._roundedValue(e[1][t], a)];
    if (r[0] === r[1]) r.pop();
    else {
        r[0] > r[1] && r.reverse();
        for (var n = [], o = r[0]; o <= r[1]; o += a) n.push(o);
        r = n
    }
    return r
}, PollenApiDataSource.prototype._findVisibleTiles = function (e) {
    for (var t, i = this, a = [], r = i._findVisibleTilesRange(e, 0), n = i._findVisibleTilesRange(e, 1), o = 0, s = r.length; o < s; o++) {
        t = r[o];
        for (var l = 0, c = n.length; l < c; l++) a.push([n[l], t])
    }
    return a
}, PollenApiDataSource.prototype._loadHexagons = function (e, t) {
    var i = this,
        a = e.url + "/" + e.ts + "/" + e.hash + "/" + t[0] + "_" + t[1] + "_" + e.gridSize + ".json";
    if (i._loading[a]) return i._loading[a];
    var r = i._cache.get(a);
    if (r) return r;
    var n = $.Deferred();
    return $.retryableAjax({
        cache: !1,
        url: a,
        headers: i._headers,
        retryCount: i._tileErrorsThreshold,
        retryOnCodes: [404]
    }).then(function (e) {
        delete i._loading[a], n.resolve({
            tile: t,
            data: e
        })
    }, function (e, r, o) {
        delete i._loading[a], 404 === e.status ? n.resolve({
            tile: t,
            data: {}
        }) : (i._cache.remove(a), n.reject(o))
    }), i._loading[a] = n, i._cache.put(a, n), n
}, PollenApiDataSource.prototype._getMergedManifest = function () {
    var e = this;
    if (!e._manifestsDeferred || "reject" === e._manifestsDeferred.state()) {
        var t = Object.keys(e._types),
            i = {},
            a = t.map(function (t) {
                return new window.ManifestApiDataSource({
                    serviceRoot: e._serviceRoot,
                    type: e._types[t]
                }).load().then(function (e) {
                    i[t] = e
                })
            });
        e._manifestsDeferred = $.when.apply(null, a).then(function () {
            return i
        })
    }
    return e._manifestsDeferred
}, MapLayersDrawer.prototype._initContext = function (e) {
    var t = e.getContext("2d", {
        alpha: !0,
        willReadFrequently: !0,
        imageSmoothingEnabled: !1
    });
    return t.mozImageSmoothingEnabled = !1, t.webkitImageSmoothingEnabled = !1, t.msImageSmoothingEnabled = !1, t.imageSmoothingEnabled = !1, t
}, MapLayersDrawer.prototype.addLayer = function (e) {
    var t = this;
    t.hasLayer(e) || (t._queue.push(e), t._forceChange = !0)
}, MapLayersDrawer.prototype.hasLayer = function (e) {
    var t = this;
    return t._queue.indexOf(e) > -1
}, MapLayersDrawer.prototype.removeLayer = function (e) {
    var t = this,
        i = t._queue.indexOf(e);
    i > -1 && (t._queue.splice(i, 1), t._forceChange = !0)
}, MapLayersDrawer.prototype.start = function () {
    var e = this;
    e._rafId || (e._rafNextTs = Date.now(), e._rafId = e._requestAnimationFrame())
}, MapLayersDrawer.prototype.stop = function () {
    var e = this;
    null !== e._rafId && (e._degradationRafTimeout ? clearTimeout(e._rafId) : cancelAnimationFrame(e._rafId), e._rafId = null)
}, MapLayersDrawer.prototype._bindToMapEvents = function () {
    var e = this,
        t = e._map.events;
    t.add("sizechange", $.throttle(e._fitCanvasToMap, 300)), t.add("actionbegin", e.stop), t.add("actionend", function () {
        e._animationStep(), e.start()
    })
}, MapLayersDrawer.prototype._insertCanvasToMap = function () {
    var e = this,
        t = e._map.options.get("projection"),
        i = new ymaps.Layer("", {
            projection: t,
            tileTransparent: !0
        });
    e._map.layers.add(i);
    var a = i.getPane(),
        r = a.getViewport()[0];
    i._tileContainer._clearCanvas = function () {}, i._tileContainer._renderTiles = function () {
        var t = !e.isCanvasHaveDefaultOffset();
        if (t) {
            for (var i = e._map.getBounds(), a = e.getCanvasBounds(), r = 0; r < e._queue.length; r++) {
                var n = e._queue[r];
                n.setBounds && n.setBounds(i, a, t)
            }
            e._animationStep()
        }
    }, e._mapContext = e._initContext(i.getElement().children[0]), e.getCanvasBounds = e._getCanvasBounds.bind(e, e._map, t, a), e.coordsToCanvasPosition = e._coordsToCanvasPosition.bind(e, e._map, a), e.isCanvasHaveDefaultOffset = e._isCanvasHaveDefaultOffset.bind(e, a, r)
}, MapLayersDrawer.prototype._getCanvasBounds = function (e, t, i) {
    var a = e.getGlobalPixelBounds()[0],
        r = i.getViewport(),
        n = e.getZoom();
    return [t.fromGlobalPixels([a[0] + r[0][0], a[1] + r[1][1]], n), t.fromGlobalPixels([a[0] + r[1][0], a[1] + r[0][1]], n)]
}, MapLayersDrawer.prototype._coordsToCanvasPosition = function (e, t, i, a) {
    var r = e.options.get("projection"),
        n = r.toGlobalPixels(i, a),
        o = e.getGlobalPixelBounds()[0],
        s = t.getViewport()[0];
    return [n[0] - o[0] - s[0], n[1] - o[1] - s[1]]
}, MapLayersDrawer.prototype._isCanvasHaveDefaultOffset = function (e, t) {
    var i = e.getViewport()[0];
    return i[0] === t[0] && i[1] === t[1]
}, MapLayersDrawer.prototype._fitCanvasToMap = function () {
    var e = this,
        t = e._mapContext.canvas,
        i = e._virtualContext.canvas;
    i.width = t.clientWidth, i.height = t.clientHeight, e._forceChange = !0;
    for (var a = 0; a < e._queue.length; a++) {
        var r = e._queue[a];
        r.onSizeChange && r.onSizeChange()
    }
}, MapLayersDrawer.prototype._requestAnimationFrameStep = function () {
    var e = this,
        t = Date.now(),
        i = t - e._rafNextTs;
    i > 0 && (e._rafNextTs = t - i % e._rafInterval + e._rafInterval, e._animationStep()), null !== e._rafId && (e._rafId = e._requestAnimationFrame())
}, MapLayersDrawer.prototype._requestAnimationFrame = function () {
    var e = this;
    return e._degradationRafTimeout ? setTimeout(function () {
        requestAnimationFrame(e._requestAnimationFrameStep)
    }, e._degradationRafTimeout) : requestAnimationFrame(e._requestAnimationFrameStep)
}, MapLayersDrawer.prototype._hasChanges = function () {
    for (var e, t = this, i = t._forceChange, a = !1, r = !1, n = [], o = 0; o < t._queue.length; o++) e = t._queue[o].hasChanges(), i || e === !0 ? (r = !0, a = !0) : e.external && (n.push(o), a = !0);
    return !!a && {
        shared: r,
        external: n
    }
}, MapLayersDrawer.prototype._animationStep = function () {
    var e = this,
        t = e._virtualContext.canvas,
        i = e._mapContext.canvas,
        a = e._hasChanges();
    if (a) {
        var r, n;
        if (a.shared) {
            for (r = 0; r < e._queue.length; r++) n = e._queue[r], n.renderFrameToContext(e._virtualContext);
            e._forceChange = !1, e._mapContext.clearRect(0, 0, i.width, i.height), e._mapContext.drawImage(e._virtualContext.canvas, 0, 0), e._virtualContext.clearRect(0, 0, t.width, t.height)
        }
        if (a.external.length)
            for (r = 0; r < a.external.length; r++) n = e._queue[a.external[r]], n.renderFrameToContext()
    }
};