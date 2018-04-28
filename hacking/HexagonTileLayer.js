ymaps.modules.define("HexagonTileLayer", ["Layer", "util.PrTree", "util.hd", "util.extend", "util.defineClass"], function (e, t, i, a, r, n) {
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
});
