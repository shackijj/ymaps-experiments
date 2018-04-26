(function (global) {
    function setupAsync(e) {
        ym.env = e;
        for (var t = 0, n = ym.envCallbacks.length; t < n; t++) ym.envCallbacks[t](e);
        ym.modules.define("util.extend", ["util.objectKeys"], function (e, t) {
                function n(e) {
                    if (ym.env.debug && !e) throw new Error("util.extend: не передан параметр target");
                    for (var t = 1, n = arguments.length; t < n; t++) {
                        var r = arguments[t];
                        if (r)
                            for (var o in r) r.hasOwnProperty(o) && (e[o] = r[o])
                    }
                    return e
                }

                function r(e) {
                    if (ym.env.debug && !e) throw new Error("util.extend: не передан параметр target");
                    for (var n = 1, r = arguments.length; n < r; n++) {
                        var o = arguments[n];
                        if (o)
                            for (var i = t(o), s = 0, a = i.length; s < a; s++) e[i[s]] = o[i[s]]
                    }
                    return e
                }
                e("function" == typeof Object.keys ? r : n)
            }), ym.modules.define("util.objectKeys", [], function (e) {
                var t = "function" == typeof Object.keys ? Object.keys : function (e) {
                    var t = [];
                    for (var n in e) e.hasOwnProperty(n) && t.push(n);
                    return t
                };
                e(function (e) {
                    var n, r = typeof e;
                    if ("object" != r && "function" != r) throw new TypeError("Object.keys called on non-object");
                    return n = t(e)
                })
            }), ym.modules.define("system.nextTick", [], function (e) {
                var t = function () {
                    var e = [],
                        t = function (t) {
                            return 1 === e.push(t)
                        },
                        n = function () {
                            var t = e,
                                n = 0,
                                r = e.length;
                            for (e = []; n < r;) t[n++]()
                        };
                    if ("object" == typeof process && process.nextTick) return function (e) {
                        t(e) && process.nextTick(n)
                    };
                    if (global.setImmediate) return function (e) {
                        t(e) && global.setImmediate(n)
                    };
                    if (global.postMessage && !global.opera) {
                        var r = !0;
                        if (global.attachEvent) {
                            var o = function () {
                                r = !1
                            };
                            global.attachEvent("onmessage", o), global.postMessage("__checkAsync", "*"), global.detachEvent("onmessage", o)
                        }
                        if (r) {
                            var i = "__ym" + +new Date,
                                s = function (e) {
                                    e.data === i && (e.stopPropagation && e.stopPropagation(), n())
                                };
                            return global.addEventListener ? global.addEventListener("message", s, !0) : global.attachEvent("onmessage", s),
                                function (e) {
                                    t(e) && global.postMessage(i, "*")
                                }
                        }
                    }
                    var a = global.document;
                    if ("onreadystatechange" in a.createElement("script")) {
                        var u = a.getElementsByTagName("head")[0],
                            c = function () {
                                var e = a.createElement("script");
                                e.onreadystatechange = function () {
                                    e.parentNode.removeChild(e), e = e.onreadystatechange = null, n()
                                }, u.appendChild(e)
                            };
                        return function (e) {
                            t(e) && c()
                        }
                    }
                    return function (e) {
                        t(e) && setTimeout(n, 0)
                    }
                }();
                e(t)
            }), ym.modules.define("system.mergeImports", [], function (e) {
                function t(e, t, n) {
                    if (t) {
                        var r = e;
                        t = t.split(".");
                        for (var o, i = 0, s = t.length - 1; i < s; i++) t[i] && (r = r[o = t[i]] || (r[o] = {}));
                        return r[t[s]] = n, r[t[s]]
                    }
                    return n
                }

                function n(e, t) {
                    return e[2] - t[2]
                }

                function r(e) {
                    return 0 === e.indexOf("package.")
                }

                function o(e, n, r) {
                    for (var o = [], i = {}, s = 0, a = n.length; s < a; ++s) {
                        var u = r[s].__package;
                        if (u)
                            for (var c = 0; c < u.length; ++c) i[u[c][0]] || (t(e, u[c][0], u[c][1]), o.push([u[c][0], u[c][1]]), i[u[c][0]] = 1);
                        else t(e, n[s], r[s]), i[n[s]] || (o.push([n[s], r[s]]), i[n[s]] = 1)
                    }
                    return e.__package = o, e
                }

                function i(e, i, s, a) {
                    var u = [],
                        c = r(e);
                    if (c) return o(i, s, a);
                    for (var l = 0, f = s.length; l < f; ++l) u.push([s[l], l, s[l].length]);
                    u.sort(n);
                    for (var l = 0, f = u.length; l < f; ++l) {
                        var d = u[l][1],
                            p = s[d];
                        if (r(p))
                            for (var m = a[d].__package, h = 0; h < m.length; ++h) t(i, m[h][0], m[h][1]);
                        else t(i, p, a[d])
                    }
                    return i
                }
                e({
                    isPackage: r,
                    joinImports: i,
                    createNS: t
                })
            }), ym.modules.require(["system.ModuleLoader"], function (e) {
                new e(ym.project.initialMap, ym.env.server).defineAll()
            }),
            function (e) {
                function t() {
                    var e = {};
                    arguments.length && (1 != arguments.length || "object" != typeof arguments[0] || arguments[0].length ? "function" != typeof arguments[0] ? (e.require = "string" == typeof arguments[0] ? [arguments[0]] : arguments[0], e.successCallback = arguments[1], e.errorCallback = arguments[2] && "function" == typeof arguments[2] ? arguments[2] : null, e.context = arguments[2] && "object" == typeof arguments[2] ? arguments[2] : arguments[3]) : (e.successCallback = arguments[0], e.errorCallback = arguments[1] && "function" == typeof arguments[1] ? arguments[1] : null, e.context = arguments[1] && "object" == typeof arguments[1] ? arguments[1] : arguments[2]) : e = arguments[0]);
                    var t = e.require ? ym.modules.require(e.require) : u.resolve();
                    return u.all([n(), t, l, c, p]).spread(function (t, n) {
                        return a(n) && t.joinImports("package.ymaps", ym.ns, e.require, n), e.successCallback && ym.modules.nextTick(function () {
                            e.successCallback.call(e.context, ym.ns)
                        }), ym.ns
                    }).fail(function (t) {
                        return e.errorCallback && ym.modules.nextTick(function () {
                            e.errorCallback.call(e.context, t)
                        }), u.reject(t)
                    })
                }

                function n() {
                    return m || (m = ym.modules.require(["system.mergeImports"]).spread(function (e) {
                        return e
                    })), m
                }

                function r() {
                    var e = ym.project.preload;
                    if (!a(e)) return u.resolve();
                    var t = ym.modules.require(e);
                    return u.all([n(), t]).spread(function (t, n) {
                        a(n) && t.joinImports("package.ymaps", ym.ns, e, n)
                    })
                }

                function o() {
                    var e = ym.env.preload,
                        t = e.load && e.load.length > 0 && e.load.split(","),
                        r = t ? ym.modules.require(t) : u.resolve();
                    return e.onError && r.fail(function (t) {
                        ym.modules.nextTick(function () {
                            i(0, e.onError, t)
                        })
                    }), u.all([n(), r, c]).spread(function (n, r) {
                        a(r) && n.joinImports("package.ymaps", ym.ns, t, r), e.onLoad && ym.modules.nextTick(function () {
                            i(0, e.onLoad, ym.ns)
                        })
                    })
                }

                function i(t, n, r) {
                    var o = s(e, n);
                    o ? o.method.call(o.context, r) : window.setTimeout(function () {
                        i(++t, n, r)
                    }, Math.pow(2, t))
                }

                function s(e, t) {
                    var n = e;
                    t = t.split(".");
                    for (var r = 0, o = t.length - 1; r < o; r++)
                        if (n = n[t[r]], !n) return;
                    return {
                        method: n[t[o]],
                        context: n
                    }
                }

                function a(e) {
                    return e && e.length
                }
                var u = ym.vow,
                    c = r(),
                    l = o(),
                    f = "complete" == document.readyState,
                    d = u.defer(),
                    p = f ? u.resolve() : d.promise(),
                    m = null,
                    h = function () {
                        f || (f = !0, d.resolve())
                    };
                f || (document.addEventListener ? (document.addEventListener("DOMContentLoaded", h, !1), window.addEventListener("load", h, !1)) : document.attachEvent && window.attachEvent("onload", h)), ym.ns.ready = t
            }(this), ym.modules.define("system.ModuleLoader", ["system.moduleLoader.createLoadFunction", "system.moduleLoader.executeInSandbox", "system.nextTick"], function (e, t, n, r) {
                function o(e, n) {
                    this._map = e, this._modulesInfo = this._parseMap(e), this._waitForNextTick = !1, this._load = t(n, this._modulesInfo.byName)
                }
                var i = {
                    NOT_RESOLVED: "NOT_RESOLVED",
                    IN_RESOLVING: "IN_RESOLVING",
                    RESOLVED: "RESOLVED"
                };
                o.prototype.defineAll = function () {
                    for (var e = 0, t = this._map.length; e < t; e++) {
                        var n = this._map[e][0];
                        ym.modules.isDefined(n) || ym.modules.define(this.buildDefinition(n))
                    }
                }, o.prototype.buildDefinition = function (e) {
                    var t = this,
                        n = this._modulesInfo.byName[e],
                        r = this._fetchDeps(n.name, n.deps),
                        o = function (e) {
                            t._queueLoad(this.name, {
                                context: this,
                                arguments: Array.prototype.slice.call(arguments, 0),
                                declaration: o
                            })
                        },
                        i = {
                            name: n.name,
                            depends: r,
                            declaration: o
                        };
                    return n.key && (i.key = n.key.split(","), i.storage = n.storage), n.dynamicDepends && (i.dynamicDepends = n.dynamicDepends), i
                }, o.prototype._parseMap = function (e) {
                    for (var t = {
                            byName: {},
                            byAlias: {}
                        }, n = 0, r = e.length; n < r; n++) {
                        var o = e[n],
                            s = {
                                name: o[0],
                                alias: o[1],
                                deps: o[2],
                                key: o[3],
                                storage: o[4],
                                dynamicDepends: o[5],
                                state: i.NOT_RESOLVED
                            };
                        t.byName[s.name] = s, t.byAlias[s.alias] = s
                    }
                    return t
                }, o.prototype._fetchDeps = function (e, t) {
                    if ("function" == typeof t) return t.call({
                        name: e
                    }, ym);
                    for (var n = []; t.length;) {
                        var r = "";
                        "=" == t.charAt(0) ? (r = t.match(/=(.+?)=/)[1], n.push(r), t = t.substring(r.length + 2)) : (r = t.substring(0, 2), n.push(this._modulesInfo.byAlias[r].name), t = t.substring(2))
                    }
                    return n
                }, o.prototype._splitAliases = function (e) {
                    for (var t = [], n = 0, r = e.length; n < r; n += 2) t.push(e.substr(n, 2));
                    return t
                }, o.prototype._queueLoad = function (e, t) {
                    var o = this;
                    this._waitForNextTick || (this._waitForNextTick = !0, r(function () {
                        o._loadAll()
                    })), this._load(e, function (r) {
                        n(e, r, t)
                    })
                }, o.prototype._loadAll = function () {
                    for (var e = 0, t = this._map.length; e < t; ++e) {
                        var n = this._map[e][0],
                            r = this._modulesInfo.byName[n];
                        r.state == i.NOT_RESOLVED && ym.modules.getState(n) == i.IN_RESOLVING && (r.state = i.IN_RESOLVING, this._load(n))
                    }
                    this._waitForNextTick = !1
                }, e(o)
            }), ym.modules.define("system.moduleLoader.executeInSandbox", ["system.mergeImports", "util.extend"], function (e, t, n) {
                function r(e, t, r) {
                    var i = new o(e, r.context, r.arguments, r.declaration),
                        s = n({}, ym, {
                            modules: i
                        });
                    t.call(r.context, s, s), i.execute()
                }

                function o(e, t, n, r) {
                    this._name = e, this._context = t, this._arguments = n, this._provides = [], this._declaration = r
                }
                o.prototype.requireSync = function (e) {
                    return ym.modules.requireSync(e)
                }, o.prototype.defineSync = function (e, t) {
                    return ym.modules.defineSync(e, t)
                }, o.prototype.define = function (e, t, n) {
                    this._executed ? ym.modules.define.apply(ym.modules, arguments) : "object" == typeof e ? this._holdingFn = e.declaration : "function" != typeof n && "function" == typeof t ? this._holdingFn = t : this._holdingFn = n
                }, o.prototype.getDefinition = function (e) {
                    return ym.modules.getDefinition(e)
                }, o.prototype.isDefined = function (e) {
                    return ym.modules.isDefined(e)
                }, o.prototype.require = function (e, t, n, r) {
                    return 3 == arguments.length && "function" != typeof n ? ym.modules.require(e, t, n) : ym.modules.require(e, t, n, r)
                }, o.prototype.importImages = function (e) {
                    var t = [ym.env.server.url, ym.env.server.path.replace(/\/$/, ""), "images", this._name.replace(/\./g, "_") + "_"].join("/");
                    return {
                        get: function (n) {
                            return /\.\w+$/.test(n) || (n += e[n].src.match(/\.\w+$/)[0]), t + n
                        }
                    }
                }, o.prototype.execute = function () {
                    this._executed = !0, this._holdingFn && (this._declaration[ym.modules.IS_SYNC_STAGE] = !0, this._holdingFn.apply(this._context, this._arguments), this._declaration[ym.modules.IS_SYNC_STAGE] = !1)
                }, o.prototype.providePackage = ym.modules.providePackage, e(r)
            }), ym.modules.define("system.moduleLoader.createLoadFunction", ["system.nextTick"], function (e, t) {
                function n(e, n) {
                    function o(e, n, r) {
                        if (m[e]) return void n.call(r, m[e], e);
                        l || (l = !0, t(c));
                        var o = d[e];
                        o ? o.callback.push([n, r]) : (d[e] = o = {
                            moduleName: e,
                            callback: [
                                [n, r]
                            ]
                        }, f.push(o))
                    }

                    function i(e, t) {
                        window[t] = void 0;
                        try {
                            window[t] = null, delete window[t]
                        } catch (n) {}
                        window.setTimeout(function () {
                            try {
                                e && e.parentNode && e.parentNode.removeChild(e)
                            } catch (t) {}
                        }, 0)
                    }

                    function s(t, n, o, s) {
                        function a() {
                            setTimeout(function () {
                                if (!c) {
                                    window.console && console.error("ymaps: script not loaded");
                                    for (var e = 0, t = f.length; e < t; ++e) f[e][1] && f[e][1]()
                                }
                            }, 60)
                        }
                        var u = 0,
                            c = !1,
                            l = window[n] = function (e) {
                                for (var t = 0, n = f.length; t < n; ++t) f[t][0](e);
                                f = null
                            },
                            f = l.listeners = [
                                [function () {
                                    c = !0, clearTimeout(u), i(d, n)
                                }], s
                            ],
                            d = document.createElement("script"),
                            p = e.url + "/combine.js?load=" + t + "&callback_prefix=" + o,
                            m = e.params;
                        m && (m.mode && (p += "&mode=" + encodeURIComponent(m.mode)), m.namespace && (p += "&namespace=" + encodeURIComponent(m.namespace))), d.charset = "utf-8", d.async = !0, d.src = p, d.onreadystatechange = function () {
                            "complete" != this.readyState && "loaded" != this.readyState || a()
                        }, d.onload = d.onerror = a, document.getElementsByTagName("head")[0].appendChild(d), u = setTimeout(s[1], r)
                    }

                    function a(e, t, n, r) {
                        var o = t + "_" + e;
                        window[o] ? window[o].listeners.push([n, r]) : s(e, o, t, [n, r])
                    }

                    function u(e) {
                        function t(e) {
                            p--;
                            for (var t = [], n = 0, r = e.length; n < r; ++n) {
                                var o = h[e[n][0]],
                                    i = e[n][1];
                                if (o) {
                                    for (var s = 0, a = o.callback.length; s < a; ++s) o.callback[s][0] && o.callback[s][0].call(o.callback[s][1], i, o.moduleName);
                                    m[o.moduleName] = i, t.push(o.moduleName), delete d[o.moduleName], delete h[e[n][0]]
                                }
                            }
                        }

                        function n(e) {
                            try {
                                t(e)
                            } catch (n) {
                                r(), setTimeout(function () {
                                    throw n
                                }, 1)
                            }
                        }

                        function r() {
                            p--;
                            for (var t = 0, n = e.length; t < n; ++t) {
                                var r = h[e[t]];
                                r && delete d[r.moduleName], delete h[o[t]]
                            }
                        }
                        var o = e.join("");
                        p++;
                        var i = ym.project.namespace + ym.project.jsonpPrefix + "_loader";
                        1 == e.length && (i += h[e[0]].moduleName), a(o, i, ym.env.debug ? t : n, r)
                    }

                    function c() {
                        var e = ym.project.loadLimit,
                            r = Math.min(e, f.length),
                            o = 0,
                            i = [];
                        if (r) {
                            for (f = f.sort(function (e, t) {
                                    return e.moduleName.localeCompare(t.moduleName)
                                }), o = 0; o < r; o++) {
                                var s = n[f[o].moduleName].alias;
                                h[s] = f[o], i.push(s)
                            }
                            u(i)
                        }
                        f.length && r < f.length ? (f = f.slice(r), t(c)) : (f = [], l = !1)
                    }
                    var l = !1,
                        f = [],
                        d = {},
                        p = 0,
                        m = {},
                        h = {};
                    return o
                }
                var r = 3e4;
                e(n)
            })
    }
    var ym = {
        project: {
            preload: ["package.system"],
            namespace: "ymaps",
            jsonpPrefix: "",
            loadLimit: 500
        },
        ns: {},
        env: {},
        envCallbacks: []
    };
    ! function () {
        var e = {
                exports: {}
            },
            t = e.exports;
        ! function (n) {
            var r, o = {
                    NOT_RESOLVED: "NOT_RESOLVED",
                    IN_RESOLVING: "IN_RESOLVING",
                    RESOLVED: "RESOLVED"
                },
                i = function () {
                    var e = {
                            trackCircularDependencies: !0,
                            allowMultipleDeclarations: !0
                        },
                        t = {},
                        p = !1,
                        m = [],
                        h = function (e, n, i) {
                            i || (i = n, n = []);
                            var s = t[e];
                            s || (s = t[e] = {
                                name: e,
                                decl: r
                            }), s.decl = {
                                name: e,
                                prev: s.decl,
                                fn: i,
                                state: o.NOT_RESOLVED,
                                deps: n,
                                dependents: [],
                                exports: r
                            }
                        },
                        v = function (e, t, r) {
                            "string" == typeof e && (e = [e]), p || (p = !0, d(w)), m.push({
                                deps: e,
                                cb: function (e, o) {
                                    o ? (r || s)(o) : t.apply(n, e)
                                }
                            })
                        },
                        y = function (e) {
                            var n = t[e];
                            return n ? o[n.decl.state] : "NOT_DEFINED"
                        },
                        g = function (e) {
                            var n = t[e];
                            return n ? n.decl.deps : null
                        },
                        _ = function (e) {
                            return !!t[e]
                        },
                        b = function (t) {
                            for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                        },
                        w = function () {
                            p = !1, E()
                        },
                        E = function () {
                            var e, t = m,
                                n = 0;
                            for (m = []; e = t[n++];) k(null, e.deps, [], e.cb)
                        },
                        k = function (e, n, r, o) {
                            var i = n.length;
                            i || o([]);
                            for (var s, u, c = [], l = function (e, t) {
                                    if (t) return void o(null, t);
                                    if (!--i) {
                                        for (var n, r = [], s = 0; n = c[s++];) r.push(n.exports);
                                        o(r)
                                    }
                                }, f = 0, d = i; f < d;) {
                                if (s = n[f++], "string" == typeof s) {
                                    if (!t[s]) return void o(null, a(s, e));
                                    u = t[s].decl
                                } else u = s;
                                c.push(u), j(u, r, l)
                            }
                        },
                        j = function (t, r, i) {
                            if (t.state === o.RESOLVED) return void i(t.exports);
                            if (t.state === o.IN_RESOLVING) return void(e.trackCircularDependencies && f(t, r) ? i(null, u(t, r)) : t.dependents.push(i));
                            if (t.dependents.push(i), t.prev && !e.allowMultipleDeclarations) return void D(t, l(t));
                            e.trackCircularDependencies && (r = r.slice()).push(t);
                            var s = !1,
                                a = t.prev ? t.deps.concat([t.prev]) : t.deps;
                            t.state = o.IN_RESOLVING, k(t, a, r, function (e, r) {
                                return r ? void D(t, r) : (e.unshift(function (e, n) {
                                    return s ? void i(null, c(t)) : (s = !0, void(n ? D(t, n) : x(t, e)))
                                }), void t.fn.apply({
                                    name: t.name,
                                    deps: t.deps,
                                    global: n
                                }, e))
                            })
                        },
                        x = function (e, t) {
                            e.exports = t, e.state = o.RESOLVED;
                            for (var n, i = 0; n = e.dependents[i++];) n(t);
                            e.dependents = r
                        },
                        D = function (e, t) {
                            e.state = o.NOT_RESOLVED;
                            for (var n, r = 0; n = e.dependents[r++];) n(null, t);
                            e.dependents = []
                        };
                    return {
                        create: i,
                        define: h,
                        require: v,
                        getState: y,
                        getDependencies: g,
                        isDefined: _,
                        setOptions: b,
                        flush: w,
                        nextTick: d
                    }
                },
                s = function (e) {
                    d(function () {
                        throw e
                    })
                },
                a = function (e, t) {
                    return Error(t ? 'Module "' + t.name + '": can\'t resolve dependence "' + e + '"' : 'Required module "' + e + "\" can't be resolved")
                },
                u = function (e, t) {
                    for (var n, r = [], o = 0; n = t[o++];) r.push(n.name);
                    return r.push(e.name), Error('Circular dependence has been detected: "' + r.join(" -> ") + '"')
                },
                c = function (e) {
                    return Error('Declaration of module "' + e.name + '" has already been provided')
                },
                l = function (e) {
                    return Error('Multiple declarations of module "' + e.name + '" have been detected')
                },
                f = function (e, t) {
                    for (var n, r = 0; n = t[r++];)
                        if (e === n) return !0;
                    return !1
                },
                d = function () {
                    var e = [],
                        t = function (t) {
                            return 1 === e.push(t)
                        },
                        r = function () {
                            var t = e,
                                n = 0,
                                r = e.length;
                            for (e = []; n < r;) t[n++]()
                        };
                    if ("object" == typeof process && process.nextTick) return function (e) {
                        t(e) && process.nextTick(r)
                    };
                    if (n.setImmediate) return function (e) {
                        t(e) && n.setImmediate(r)
                    };
                    if (n.postMessage && !n.opera) {
                        var o = !0;
                        if (n.attachEvent) {
                            var i = function () {
                                o = !1
                            };
                            n.attachEvent("onmessage", i), n.postMessage("__checkAsync", "*"), n.detachEvent("onmessage", i)
                        }
                        if (o) {
                            var s = "__modules" + +new Date,
                                a = function (e) {
                                    e.data === s && (e.stopPropagation && e.stopPropagation(), r())
                                };
                            return n.addEventListener ? n.addEventListener("message", a, !0) : n.attachEvent("onmessage", a),
                                function (e) {
                                    t(e) && n.postMessage(s, "*")
                                }
                        }
                    }
                    var u = n.document;
                    if ("onreadystatechange" in u.createElement("script")) {
                        var c = u.getElementsByTagName("head")[0],
                            l = function () {
                                var e = u.createElement("script");
                                e.onreadystatechange = function () {
                                    e.parentNode.removeChild(e), e = e.onreadystatechange = null, r()
                                }, c.appendChild(e)
                            };
                        return function (e) {
                            t(e) && l()
                        }
                    }
                    return function (e) {
                        t(e) && setTimeout(r, 0)
                    }
                }();
            "object" == typeof t ? e.exports = i() : n.modules = i()
        }(this), ym.modules = e.exports
    }(), ym.modules.setOptions({
            trackCircularDependencies: !0,
            allowMultipleDeclarations: !1
        }), ym.ns.modules = ym.modules,
        function () {
            var e, t, n = {
                exports: {}
            };
            n.exports;
            ! function (r) {
                var o, i = function () {
                        var e = [],
                            t = function (t) {
                                return e.push(t), 1 === e.length
                            },
                            n = function () {
                                var t = e,
                                    n = 0,
                                    r = e.length;
                                for (e = []; n < r;) t[n++]()
                            };
                        if ("function" == typeof setImmediate) return function (e) {
                            t(e) && setImmediate(n)
                        };
                        if ("object" == typeof process && process.nextTick) return function (e) {
                            t(e) && process.nextTick(n)
                        };
                        var o = r.MutationObserver || r.WebKitMutationObserver;
                        if (o) {
                            var i = 1,
                                s = document.createTextNode("");
                            return new o(n).observe(s, {
                                    characterData: !0
                                }),
                                function (e) {
                                    t(e) && (s.data = i *= -1)
                                }
                        }
                        if (r.postMessage) {
                            var a = !0;
                            if (r.attachEvent) {
                                var u = function () {
                                    a = !1
                                };
                                r.attachEvent("onmessage", u), r.postMessage("__checkAsync", "*"), r.detachEvent("onmessage", u)
                            }
                            if (a) {
                                var c = "__promise" + Math.random() + "_" + new Date,
                                    l = function (e) {
                                        e.data === c && (e.stopPropagation && e.stopPropagation(), n())
                                    };
                                return r.addEventListener ? r.addEventListener("message", l, !0) : r.attachEvent("onmessage", l),
                                    function (e) {
                                        t(e) && r.postMessage(c, "*")
                                    }
                            }
                        }
                        var f = r.document;
                        if ("onreadystatechange" in f.createElement("script")) {
                            var d = function () {
                                var e = f.createElement("script");
                                e.onreadystatechange = function () {
                                    e.parentNode.removeChild(e), e = e.onreadystatechange = null, n()
                                }, (f.documentElement || f.body).appendChild(e)
                            };
                            return function (e) {
                                t(e) && d()
                            }
                        }
                        return function (e) {
                            t(e) && setTimeout(n, 0)
                        }
                    }(),
                    s = function (e) {
                        i(function () {
                            throw e
                        })
                    },
                    a = function (e) {
                        return "function" == typeof e
                    },
                    u = function (e) {
                        return null !== e && "object" == typeof e
                    },
                    c = Object.prototype.toString,
                    l = Array.isArray || function (e) {
                        return "[object Array]" === c.call(e)
                    },
                    f = function (e) {
                        for (var t = [], n = 0, r = e.length; n < r;) t.push(n++);
                        return t
                    },
                    d = Object.keys || function (e) {
                        var t = [];
                        for (var n in e) e.hasOwnProperty(n) && t.push(n);
                        return t
                    },
                    p = function (e) {
                        var t = function (t) {
                            this.name = e, this.message = t
                        };
                        return t.prototype = new Error, t
                    },
                    m = function (e, t) {
                        return function (n) {
                            e.call(this, n, t)
                        }
                    },
                    h = function () {
                        this._promise = new y
                    };
                h.prototype = {
                    promise: function () {
                        return this._promise
                    },
                    resolve: function (e) {
                        this._promise.isResolved() || this._promise._resolve(e)
                    },
                    reject: function (e) {
                        this._promise.isResolved() || (b.isPromise(e) ? (e = e.then(function (e) {
                            var t = b.defer();
                            return t.reject(e), t.promise()
                        }), this._promise._resolve(e)) : this._promise._reject(e))
                    },
                    notify: function (e) {
                        this._promise.isResolved() || this._promise._notify(e)
                    }
                };
                var v = {
                        PENDING: 0,
                        RESOLVED: 1,
                        FULFILLED: 2,
                        REJECTED: 3
                    },
                    y = function (e) {
                        if (this._value = o, this._status = v.PENDING, this._fulfilledCallbacks = [], this._rejectedCallbacks = [], this._progressCallbacks = [], e) {
                            var t = this,
                                n = e.length;
                            e(function (e) {
                                t.isResolved() || t._resolve(e)
                            }, n > 1 ? function (e) {
                                t.isResolved() || t._reject(e)
                            } : o, n > 2 ? function (e) {
                                t.isResolved() || t._notify(e)
                            } : o)
                        }
                    };
                y.prototype = {
                    valueOf: function () {
                        return this._value
                    },
                    isResolved: function () {
                        return this._status !== v.PENDING
                    },
                    isFulfilled: function () {
                        return this._status === v.FULFILLED
                    },
                    isRejected: function () {
                        return this._status === v.REJECTED
                    },
                    then: function (e, t, n, r) {
                        var o = new h;
                        return this._addCallbacks(o, e, t, n, r), o.promise()
                    },
                    "catch": function (e, t) {
                        return this.then(o, e, t)
                    },
                    fail: function (e, t) {
                        return this.then(o, e, t)
                    },
                    always: function (e, t) {
                        var n = this,
                            r = function () {
                                return e.call(this, n)
                            };
                        return this.then(r, r, t)
                    },
                    progress: function (e, t) {
                        return this.then(o, o, e, t)
                    },
                    spread: function (e, t, n) {
                        return this.then(function (t) {
                            return e.apply(this, t)
                        }, t, n)
                    },
                    done: function (e, t, n, r) {
                        this.then(e, t, n, r).fail(s)
                    },
                    delay: function (e) {
                        var t, n = this.then(function (n) {
                            var r = new h;
                            return t = setTimeout(function () {
                                r.resolve(n)
                            }, e), r.promise()
                        });
                        return n.always(function () {
                            clearTimeout(t)
                        }), n
                    },
                    timeout: function (e) {
                        var t = new h,
                            n = setTimeout(function () {
                                t.reject(new b.TimedOutError("timed out"))
                            }, e);
                        return this.then(function (e) {
                            t.resolve(e)
                        }, function (e) {
                            t.reject(e)
                        }), t.promise().always(function () {
                            clearTimeout(n)
                        }), t.promise()
                    },
                    _vow: !0,
                    _resolve: function (e) {
                        if (!(this._status > v.RESOLVED)) {
                            if (e === this) return void this._reject(TypeError("Can't resolve promise with itself"));
                            if (this._status = v.RESOLVED, e && e._vow) return void(e.isFulfilled() ? this._fulfill(e.valueOf()) : e.isRejected() ? this._reject(e.valueOf()) : e.then(this._fulfill, this._reject, this._notify, this));
                            if (u(e) || a(e)) {
                                var t;
                                try {
                                    t = e.then
                                } catch (n) {
                                    return void this._reject(n)
                                }
                                if (a(t)) {
                                    var r = this,
                                        o = !1;
                                    try {
                                        t.call(e, function (e) {
                                            o || (o = !0, r._resolve(e))
                                        }, function (e) {
                                            o || (o = !0, r._reject(e))
                                        }, function (e) {
                                            r._notify(e)
                                        })
                                    } catch (n) {
                                        o || this._reject(n)
                                    }
                                    return
                                }
                            }
                            this._fulfill(e)
                        }
                    },
                    _fulfill: function (e) {
                        this._status > v.RESOLVED || (this._status = v.FULFILLED, this._value = e, this._callCallbacks(this._fulfilledCallbacks, e), this._fulfilledCallbacks = this._rejectedCallbacks = this._progressCallbacks = o)
                    },
                    _reject: function (e) {
                        this._status > v.RESOLVED || (this._status = v.REJECTED, this._value = e, this._callCallbacks(this._rejectedCallbacks, e), this._fulfilledCallbacks = this._rejectedCallbacks = this._progressCallbacks = o)
                    },
                    _notify: function (e) {
                        this._callCallbacks(this._progressCallbacks, e)
                    },
                    _addCallbacks: function (e, t, n, r, i) {
                        n && !a(n) ? (i = n, n = o) : r && !a(r) && (i = r, r = o);
                        var s;
                        this.isRejected() || (s = {
                            defer: e,
                            fn: a(t) ? t : o,
                            ctx: i
                        }, this.isFulfilled() ? this._callCallbacks([s], this._value) : this._fulfilledCallbacks.push(s)), this.isFulfilled() || (s = {
                            defer: e,
                            fn: n,
                            ctx: i
                        }, this.isRejected() ? this._callCallbacks([s], this._value) : this._rejectedCallbacks.push(s)), this._status <= v.RESOLVED && this._progressCallbacks.push({
                            defer: e,
                            fn: r,
                            ctx: i
                        })
                    },
                    _callCallbacks: function (e, t) {
                        var n = e.length;
                        if (n) {
                            var r = this.isResolved(),
                                o = this.isFulfilled(),
                                s = this.isRejected();
                            i(function () {
                                for (var i, a, u, c = 0; c < n;)
                                    if (i = e[c++], a = i.defer, u = i.fn) {
                                        var l, f = i.ctx;
                                        try {
                                            l = f ? u.call(f, t) : u(t)
                                        } catch (d) {
                                            a.reject(d);
                                            continue
                                        }
                                        r ? a.resolve(l) : a.notify(l)
                                    } else o ? a.resolve(t) : s ? a.reject(t) : a.notify(t)
                            })
                        }
                    }
                };
                var g = {
                    cast: function (e) {
                        return b.cast(e)
                    },
                    all: function (e) {
                        return b.all(e)
                    },
                    race: function (e) {
                        return b.anyResolved(e)
                    },
                    resolve: function (e) {
                        return b.resolve(e)
                    },
                    reject: function (e) {
                        return b.reject(e)
                    }
                };
                for (var _ in g) g.hasOwnProperty(_) && (y[_] = g[_]);
                var b = {
                        Deferred: h,
                        Promise: y,
                        defer: function () {
                            return new h
                        },
                        when: function (e, t, n, r, o) {
                            return b.cast(e).then(t, n, r, o)
                        },
                        fail: function (e, t, n) {
                            return b.when(e, o, t, n)
                        },
                        always: function (e, t, n) {
                            return b.when(e).always(t, n)
                        },
                        progress: function (e, t, n) {
                            return b.when(e).progress(t, n)
                        },
                        spread: function (e, t, n, r) {
                            return b.when(e).spread(t, n, r)
                        },
                        done: function (e, t, n, r, o) {
                            b.when(e).done(t, n, r, o)
                        },
                        isPromise: function (e) {
                            return u(e) && a(e.then)
                        },
                        cast: function (e) {
                            return e && e._vow ? e : b.resolve(e)
                        },
                        valueOf: function (e) {
                            return e && a(e.valueOf) ? e.valueOf() : e
                        },
                        isFulfilled: function (e) {
                            return !e || !a(e.isFulfilled) || e.isFulfilled()
                        },
                        isRejected: function (e) {
                            return !(!e || !a(e.isRejected)) && e.isRejected()
                        },
                        isResolved: function (e) {
                            return !e || !a(e.isResolved) || e.isResolved()
                        },
                        resolve: function (e) {
                            var t = b.defer();
                            return t.resolve(e), t.promise()
                        },
                        fulfill: function (e) {
                            var t = b.defer(),
                                n = t.promise();
                            return t.resolve(e), n.isFulfilled() ? n : n.then(null, function (e) {
                                return e
                            })
                        },
                        reject: function (e) {
                            var t = b.defer();
                            return t.reject(e), t.promise()
                        },
                        invoke: function (e, t) {
                            var n, o = Math.max(arguments.length - 1, 0);
                            if (o) {
                                n = Array(o);
                                for (var i = 0; i < o;) n[i++] = arguments[i]
                            }
                            try {
                                return b.resolve(n ? e.apply(r, n) : e.call(r))
                            } catch (s) {
                                return b.reject(s)
                            }
                        },
                        all: function (e) {
                            var t = new h,
                                n = l(e),
                                r = n ? f(e) : d(e),
                                o = r.length,
                                i = n ? [] : {};
                            if (!o) return t.resolve(i), t.promise();
                            var s = o;
                            return b._forEach(e, function (e, n) {
                                i[r[n]] = e, --s || t.resolve(i)
                            }, t.reject, t.notify, t, r), t.promise()
                        },
                        allResolved: function (e) {
                            var t = new h,
                                n = l(e),
                                r = n ? f(e) : d(e),
                                o = r.length,
                                i = n ? [] : {};
                            if (!o) return t.resolve(i), t.promise();
                            var s = function () {
                                --o || t.resolve(e)
                            };
                            return b._forEach(e, s, s, t.notify, t, r), t.promise()
                        },
                        allPatiently: function (e) {
                            return b.allResolved(e).then(function () {
                                var t, n, r, o, i = l(e),
                                    s = i ? f(e) : d(e),
                                    a = s.length,
                                    u = 0;
                                if (!a) return i ? [] : {};
                                for (; u < a;) r = s[u++], o = e[r], b.isRejected(o) ? (t || (t = i ? [] : {}), i ? t.push(o.valueOf()) : t[r] = o.valueOf()) : t || ((n || (n = i ? [] : {}))[r] = b.valueOf(o));
                                if (t) throw t;
                                return n
                            })
                        },
                        any: function (e) {
                            var t = new h,
                                n = e.length;
                            if (!n) return t.reject(Error()), t.promise();
                            var r, o = 0;
                            return b._forEach(e, t.resolve, function (e) {
                                o || (r = e), ++o === n && t.reject(r)
                            }, t.notify, t), t.promise()
                        },
                        anyResolved: function (e) {
                            var t = new h,
                                n = e.length;
                            return n ? (b._forEach(e, t.resolve, t.reject, t.notify, t), t.promise()) : (t.reject(Error()), t.promise())
                        },
                        delay: function (e, t) {
                            return b.resolve(e).delay(t)
                        },
                        timeout: function (e, t) {
                            return b.resolve(e).timeout(t)
                        },
                        _forEach: function (e, t, n, r, o, i) {
                            for (var s = i ? i.length : e.length, a = 0; a < s;) b.when(e[i ? i[a] : a], m(t, a), n, r, o), ++a
                        },
                        TimedOutError: p("TimedOut")
                    },
                    w = !0;
                "object" == typeof n && "object" == typeof n.exports && (n.exports = b, w = !1), "object" == typeof t && a(t.define) && (t.define("vow", function (e) {
                    e(b)
                }), w = !1), "function" == typeof e && (e(function (e, t, n) {
                    n.exports = b
                }), w = !1), w && (r.vow = b)
            }("undefined" != typeof window ? window : global), ym.vow = n.exports
        }(), ym.modules.define("vow", [], function (e) {
            e(ym.vow)
        }), ym.ns.vow = ym.vow;
    var _backup_modules = this.modules;
    ! function (e, t, n) {
        function r(e) {
            this.entry = e
        }

        function o() {
            this._fallbacks = [], this._retrieversData = {}
        }
        var i, s = 10,
            a = "__ym-modules-plus__is-sync-provide-stage__" + +new Date + "__" + Math.random(),
            u = ym.vow,
            c = Array.prototype.slice,
            l = {},
            f = {},
            d = function (e, t) {
                return new Error('The key "' + t + '" isn\'t declared in "' + e + '" storage.')
            },
            p = function (e) {
                return new Error('The dynamic depend "' + e + '" not found.')
            },
            m = function (e) {
                return new Error("Undefined module `" + e + "` with no matching fallback.")
            };
        i = {
            entries: f,
            IS_SYNC_STAGE: a,
            fallbacks: new o,
            define: function (e, n, r, o, s) {
                var a, u, c, l = this;
                if ("function" == typeof n && "function" != typeof r) r = n, o = r, n = [];
                else if ("object" == typeof e) {
                    var d = e;
                    e = d.name, n = d.depends, r = d.declaration, o = d.context, c = d.dynamicDepends, s = d.onModuleProvideCallback, a = d.storage, u = d.key
                }
                if (f.hasOwnProperty(e) || (f[e] = {
                        name: e
                    }), "function" == typeof n && (n = n.call({
                        name: e
                    }, ym)), f[e].onModuleProvideCallback = s, f[e].callback = r, f[e].context = o, a && u) {
                    if ("string" != typeof u)
                        for (var p = 0, m = u.length; p < m; p++) this._createKeyStorageRef(e, u[p], a);
                    else this._createKeyStorageRef(e, u, a);
                    f[e].key = u, f[e].storage = a
                }
                c && (f[e].dynamicDepends = c);
                var h = i._createPatchedCallback(e);
                if (null != n) {
                    for (var v = [], p = 0, m = n.length; p < m; p++) v[p] = this._processModuleName(n[p]);
                    v = this.fallbacks.addRetrievers(v), this.nextTick(function () {
                        l.fallbacks.removeRetrievers(t.getDependencies(e))
                    }), t.define(e, v, h)
                } else t.define(e, h);
                return this
            },
            require: function (r, o, s, a, l) {
                var f = u.defer(),
                    d = f.promise(),
                    p = n;
                if (3 == arguments.length && "function" != typeof s) a = s, s = null;
                else if (!r.hasOwnProperty("length") && "object" == typeof r) {
                    var m = r;
                    r = m.modules, o = m.successCallback, s = m.errorCallback, a = m.context, m.hasOwnProperty("data") && (p = m.data)
                }
                r = "string" != typeof r && r.hasOwnProperty("length") ? r : [r];
                var h = r.length,
                    v = this._processModuleList(r, p);
                return r = v.list, ym.env.debug && !l && this.watchResolving(r), v.error ? f.reject(v.error) : t.require(r, function () {
                    var t = c.call(arguments, arguments.length - h);
                    f.resolve(t), o && o.apply(a || e, t)
                }, function (e) {
                    l ? f.reject(e) : i.fallbacks.retrieve(r).then(function () {
                        f.resolve(i.require(r, o, s, a, !0))
                    }).fail(function (e) {
                        f.reject(e)
                    })
                }), s && !l && d.fail(function (t) {
                    s.call(a || e, t)
                }), d
            },
            defineSync: function (e, t) {
                var n, r;
                if ("object" == typeof e) {
                    var o = e;
                    t = o.module, n = o.storage, r = o.key, e = o.name
                }
                if (i.isDefined(e)) {
                    var s = f[e];
                    s.name = e, s.module = t, s.callback = function (e) {
                        e(t)
                    }, s.context = null
                } else f[e] = {
                    name: e,
                    module: t
                }, i.define(e, function (e) {
                    e(t)
                });
                r && n && (f[e].key = r, f[e].storage = n, this._createKeyStorageRef(e, r, n))
            },
            requireSync: function (e, t) {
                var n = this.getDefinition(e),
                    r = null;
                return n && (r = n.getModuleSync.apply(n, c.call(arguments, 1))), r
            },
            providePackage: function (e) {
                var t = this,
                    n = Array.prototype.slice.call(arguments, 1);
                i.require(["system.mergeImports"]).spread(function (r) {
                    e(r.joinImports(t.name, {}, t.deps, n))
                })
            },
            getDefinition: function (e) {
                var t = null;
                return e = this._processModuleName(e), f.hasOwnProperty(e) && (t = new r(f[e])), t
            },
            getState: function (e) {
                return t.getState(this._processModuleName(e))
            },
            isDefined: function (e) {
                return t.isDefined(this._processModuleName(e))
            },
            setOptions: function (e) {
                return t.setOptions(e)
            },
            flush: function () {
                return t.flush()
            },
            nextTick: function (e) {
                return t.nextTick(e)
            },
            watchResolving: function (e) {
                if ("object" == typeof console && "function" == typeof console.warn) {
                    var t = this;
                    "undefined" == typeof this._failCounter && (this._failCounter = 0), setTimeout(function () {
                        0 == t._failCounter && setTimeout(function () {
                            t._failCounter = 0
                        }, 150);
                        for (var n = 0, r = e.length; n < r; n++)
                            if ("RESOLVED" != t.getState(e[n])) {
                                if (t._failCounter++, 5 == t._failCounter) setTimeout(function () {
                                    console.warn("Timeout: Totally " + t._failCounter + " modules were required but not resolved within " + s + " sec.")
                                }, 100);
                                else if (t._failCounter > 5) continue;
                                console.warn("Timeout: Module `" + e[n] + "` was required but is still " + t.getState(e[n]) + " within " + s + " sec.")
                            }
                    }, 1e3 * s)
                }
            },
            _createPatchedCallback: function (e) {
                var t = this;
                return function () {
                    var n = f[e],
                        r = c.call(arguments, 0),
                        o = n.callback,
                        s = n.context;
                    ym.env.debug && t.watchResolving([e]), r[0] = i._patchProvideFunction(r[0], e), o[ym.modules.IS_SYNC_STAGE] = !0, o && o.apply(s || this, r), o[ym.modules.IS_SYNC_STAGE] = !1
                }
            },
            _processModuleList: function (e, n, r) {
                for (var o = {
                        list: []
                    }, i = 0, s = e.length; i < s; i++) {
                    var a = this._processModuleName(e[i]);
                    if (!a) {
                        o.error = d(e[i].storage, e[i].key);
                        break
                    }
                    if ("undefined" != typeof n) {
                        var u = t.getDependencies(a),
                            c = f[a];
                        if (u) {
                            var l = this._processModuleList(u, n, !0);
                            if (l.error) {
                                o.error = l.error;
                                break
                            }
                            o.list = o.list.concat(l.list)
                        }
                        if (c && c.dynamicDepends) {
                            var p = [];
                            for (var m in c.dynamicDepends) {
                                var h = c.dynamicDepends[m](n);
                                this._isDepend(h) && p.push(h)
                            }
                            var l = this._processModuleList(p, n);
                            if (l.error) {
                                o.error = l.error;
                                break
                            }
                            o.list = o.list.concat(l.list)
                        }
                        this.fallbacks.isRetriever(a) && this.fallbacks.addRetrieverData(a, n)
                    }
                    r || o.list.push(a)
                }
                return o
            },
            _createKeyStorageRef: function (e, t, n) {
                l.hasOwnProperty(n) || (l[n] = {}), l[n][t] = e
            },
            _processModuleName: function (e) {
                if ("string" != typeof e) {
                    var t = e.storage;
                    e = l.hasOwnProperty(t) ? l[t][e.key] || null : null
                }
                return e
            },
            _patchProvideFunction: function (e, t, r) {
                var o = function (n, r) {
                    var o = f[t];
                    o.module = n;
                    var i = f[t].callback[ym.modules.IS_SYNC_STAGE];
                    f[t].sync = i, f[t].onModuleProvideCallback && f[t].onModuleProvideCallback(i), e(n, r), r || (delete o.callback, delete o.context)
                };
                return o.provide = o, o.dynamicDepends = {
                    getValue: function (e, n) {
                        var r = u.defer(),
                            o = f[t];
                        if (o.dynamicDepends && o.dynamicDepends.hasOwnProperty(e)) {
                            var s = o.dynamicDepends[e](n);
                            r.resolve(i._isDepend(s) ? i.getDefinition(s).getModule(n) : [s])
                        } else r.reject(p(e));
                        return r.promise()
                    },
                    getValueSync: function (e, r) {
                        var o = n,
                            s = f[t];
                        if (s.dynamicDepends && s.dynamicDepends.hasOwnProperty(e)) {
                            var a = s.dynamicDepends[e](r);
                            o = i._isDepend(a) ? i.getDefinition(a).getModuleSync(r) : a
                        }
                        return o
                    }
                }, o
            },
            _isDepend: function (e) {
                return "string" == typeof e || e && e.key && e.storage
            }
        }, r.prototype.getModuleKey = function () {
            return this.entry.key
        }, r.prototype.getModuleStorage = function () {
            return this.entry.storage
        }, r.prototype.getModuleName = function () {
            return this.entry.name
        }, r.prototype.getModuleSync = function (e) {
            if (arguments.length > 0) {
                var t = this.entry.dynamicDepends;
                for (var r in t) {
                    var o = t[r](e);
                    if (i._isDepend(o) && !i.getDefinition(o).getModuleSync(e)) return n
                }
            }
            return this.entry.module
        }, r.prototype.getModule = function (e) {
            var t = {
                modules: [this.entry.name]
            };
            return e && (t.data = e), i.require(t)
        };
        var h = "_retriever@";
        o.prototype.register = function (e, t) {
            e && "*" != e ? this._fallbacks.unshift({
                filter: e,
                func: t
            }) : this._fallbacks.push({
                filter: e || "*",
                func: t
            })
        }, o.prototype.retrieve = function (e) {
            "string" == typeof e && (e = [e]);
            for (var t = [], n = 0, r = e.length; n < r; n++) {
                var o = u.defer(),
                    s = e[n];
                if (t[n] = o.promise(), i.isDefined(s)) o.resolve(!0);
                else {
                    var a = this.find(s);
                    if (!a) {
                        o.reject(m(s));
                        break
                    }
                    o.resolve(a.func(s, a.filter))
                }
            }
            return u.all(t)
        }, o.prototype.find = function (e) {
            for (var t = 0, n = this._fallbacks.length; t < n; t++) {
                var r = this._fallbacks[t].filter;
                if ("*" === r) return this._fallbacks[t];
                if ("function" == typeof r && r(e)) return this._fallbacks[t];
                if (e.match(r)) return this._fallbacks[t]
            }
            return null
        }, o.prototype.addRetrievers = function (e) {
            for (var t, n, r = [], o = 0, s = e.length; o < s; o++) t = e[o], i.isDefined(t) ? r.push(t) : (n = h + t, r.push(n), i.isDefined(n) || this._defineRetriever(n));
            return r
        }, o.prototype.removeRetrievers = function (e) {
            for (var t, n = 0, r = e.length; n < r; n++) this.isRetriever(e[n]) && !this._retrieversData[e[n]] && (t = e[n].replace(h, ""), i.isDefined(t) && (e[n] = t))
        }, o.prototype.isRetriever = function (e) {
            return 0 === e.indexOf(h)
        }, o.prototype.addRetrieverData = function (e, t) {
            this._retrieversData[e] || (this._retrieversData[e] = []), this._retrieversData[e].push(t)
        }, o.prototype._defineRetriever = function (e) {
            var t = this;
            i.define(e, [], function (e) {
                var n = this.name.replace(h, "");
                t.retrieve(n).then(function () {
                    return t._requireAfterRetrieve(n)
                }).spread(e).fail(e)
            })
        }, o.prototype._requireAfterRetrieve = function (e) {
            var t = this._retrieversData[h + e];
            if (!t) return i.require(e);
            for (var n = [], r = 0, o = t.length; r < o; r++) n.push(i.require({
                modules: [e],
                data: t[r]
            }));
            return u.all(n).then(function (e) {
                return e[0]
            })
        }, e.modules = i
    }(this, ym.modules), ym.modules = this.modules, this.modules = _backup_modules, _backup_modules = void 0,
        function () {
            function e(e) {
                return function () {
                    console.warn("{NS}.modules.{FN} is not a public API and will be removed from {NS}.modules.".replace(/\{NS\}/g, ym.project.namespace).replace(/\{FN\}/g, e));
                    var t = ym.modules[e].apply(ym.modules, arguments);
                    return t === ym.modules ? ym.ns.modules : t
                }
            }
            ym.ns.modules = {
                require: function () {
                    return ym.modules.require.apply(ym.modules, arguments)
                },
                isDefined: function () {
                    return ym.modules.isDefined.apply(ym.modules, arguments);
                },
                requireSync: function () {
                    return ym.modules.requireSync.apply(ym.modules, arguments)
                },
                define: function (e, t, n, r) {
                    return ym.modules.define(e, t, n, r, function (t) {
                        ym.count("modulesUsage", {
                            useCustomPrefix: !0,
                            path: ["ym.modules.define", t ? "sync" : "async", e].join("."),
                            share: 1
                        })
                    }), ym.ns.modules
                },
                defineSync: e("defineSync"),
                providePackage: e("providePackage"),
                getDefinition: e("getDefinition"),
                getState: e("getState"),
                setOptions: e("setOptions"),
                flush: e("flush"),
                nextTick: e("nextTick"),
                watchResolving: e("watchResolving"),
                __modules: ym.modules
            }
        }(), ym.count = function () {
            function e() {
                t.push(arguments)
            }
            var t = [],
                n = null,
                r = function () {
                    (n || e).apply(null, arguments)
                };
            return r.provideImplementation = function (e) {
                if (n) throw new Error("ym.count: implementation was already provided.");
                n = e(t)
            }, r
        }(), ym.project.initialMap = [],
        function (e) {
            function t(e, t) {
                return r || (r = n(t))
            }

            function n(e) {
                return e = encodeURIComponent(e), ym.modules.require(["util.jsonp", "util.querystring", "util.extend", "system.ModuleLoader"]).spread(function (t, n, r, o) {
                    var i = ym.env.server,
                        s = i.url + "/map.js",
                        a = {
                            filter: e,
                            mode: i.params.mode,
                            version: i.version
                        },
                        u = "ym_map_fallback";
                    if (!i.params.short_jsonp_padding) {
                        var c = r({
                                url: s
                            }, a),
                            l = n.stringify(c, "_", "=", {
                                encodeURIComponent: function (e) {
                                    return e
                                }
                            });
                        u += "_" + l.replace(/[:\/\.\?\&\\]/g, "_")
                    }
                    return t({
                        url: s,
                        requestParams: a,
                        paddingKey: u
                    }).then(function (e) {
                        new o(e, i).defineAll()
                    })
                })
            }
            ym.modules.define("util.id", [], function (e) {
                var t = new function () {
                    function e() {
                        return (++n).toString()
                    }
                    var t = ("id_" + +new Date + Math.round(1e4 * Math.random())).toString(),
                        n = Math.round(1e4 * Math.random());
                    this.prefix = function () {
                        return t
                    }, this.gen = e, this.get = function (n) {
                        return n === window ? t : n[t] || (n[t] = e())
                    }
                };
                e(t)
            }), ym.modules.define("util.querystring", [], function (e) {
                function t(e) {
                    return "[object Array]" === Object.prototype.toString.call(e)
                }
                e({
                    parse: function (e, n, r, o) {
                        n = n || "&", r = r || "=", o = o || {};
                        for (var i, s, a, u = o.decodeURIComponent || decodeURIComponent, c = {}, l = e.split(n), f = 0; f < l.length; ++f) i = l[f].split(r), s = u(i[0]), a = u(i.slice(1).join(r)), t(c[s]) ? c[s].push(a) : c.hasOwnProperty(s) ? c[s] = [c[s], a] : c[s] = a;
                        return c
                    },
                    stringify: function (e, n, r, o) {
                        n = n || "&", r = r || "=", o = o || {};
                        var i, s, a = o.encodeURIComponent || encodeURIComponent,
                            u = [];
                        for (i in e)
                            if (e.hasOwnProperty(i))
                                if (s = e[i], t(s))
                                    if (o.joinArrays) u.push(a(i) + r + a(s.join(",")));
                                    else
                                        for (var c = 0; c < s.length; ++c) "undefined" != typeof s[c] && u.push(a(i) + r + a(s[c]));
                        else "undefined" != typeof s && u.push(a(i) + r + a(s));
                        return u.join(n)
                    }
                })
            }), ym.modules.define("util.script", [], function (e) {
                var t = document.getElementsByTagName("head")[0];
                e({
                    create: function (e, n) {
                        var r = document.createElement("script");
                        return r.charset = n || "utf-8", r.src = e, setTimeout(function () {
                            t.insertBefore(r, t.firstChild)
                        }, 0), r
                    }
                })
            }), ym.modules.define("util.jsonp", ["util.id", "util.querystring", "util.script"], function (e, t, n, r) {
                function o(e) {
                    return o.handler ? o.handler(e, i) : i(e)
                }

                function i(e) {
                    var o, i, a = "undefined" == typeof e.checkResponse || e.checkResponse,
                        f = e.responseFieldName || "response",
                        d = e.requestParams ? "&" + n.stringify(e.requestParams, null, null, {
                            joinArrays: !0
                        }) : "",
                        p = ym.vow.defer(),
                        m = p.promise(),
                        h = e.timeout || 3e4,
                        v = setTimeout(function () {
                            p.reject(c)
                        }, h),
                        y = function () {
                            s(i, o), clearTimeout(v), v = null
                        };
                    if (!e.padding) {
                        if (o = e.paddingKey || t.prefix() + t.gen(), "function" == typeof window[o] && window[o].promise) return window[o].promise;
                        u(o), window[o] = function (e) {
                            if (a) {
                                var t = !e || e.error || e[f] && e[f].error;
                                t ? p.reject(t) : p.resolve(e && e[f] || e)
                            } else p.resolve(e)
                        }, window[o].promise = m
                    }
                    var g = e.url + (/\?/.test(e.url) ? "&" : "?") + (e.paramName || "callback") + "=" + (e.padding || o) + (e.noCache ? "&_=" + Math.floor(1e7 * Math.random()) : "") + d;
                    if (e.postprocessUrl)
                        if ("function" == typeof e.postprocessUrl) g = e.postprocessUrl(g);
                        else
                            for (; e.postprocessUrl.length;) g = e.postprocessUrl.shift()(g);
                    return i = r.create(g), i.onerror = function () {
                        p.reject(l)
                    }, m.always(y), m
                }

                function s(e, t) {
                    t && a(t), setTimeout(function () {
                        e && e.parentNode && e.parentNode.removeChild(e)
                    }, 0)
                }

                function a(e) {
                    window[e] = f, d[e] = setTimeout(function () {
                        window[e] = void 0;
                        try {
                            delete window[e]
                        } catch (t) {}
                    }, 500)
                }

                function u(e) {
                    d[e] && (clearTimeout(d[e]), d[e] = null)
                }
                var c = {
                        message: "timeoutExceeded"
                    },
                    l = {
                        message: "scriptError"
                    },
                    f = function () {},
                    d = {};
                e(o)
            });
            var r = null;
            ym.modules.fallbacks.register("*", t)
        }(this),
        function (e) {
            function t(e, t, n) {
                if (t) {
                    var r = e;
                    t = t.split(".");
                    for (var o, i = 0, s = t.length - 1; i < s; i++) t[i] && (r = r[o = t[i]] || (r[o] = {}));
                    return r[t[s]] = n, r[t[s]]
                }
                return n
            }
            ym.project.namespace && ("function" == typeof setupAsync ? ym.envCallbacks.push(function (n) {
                n.namespace !== !1 && t(e, n.namespace || ym.project.namespace, ym.ns)
            }) : t(e, ym.project.namespace, ym.ns))
        }(this),
        function () {
            function e(t) {
                for (var n in t) t.hasOwnProperty(n) && ("string" == typeof t[n] ? "/" == t[n].charAt(0) && (t[n] = "https:" + t[n]) : e(t[n]))
            }
            ym.envCallbacks.push(function (t) {
                "/" == t.server.url.charAt(0) && (t.server.url = "https:" + t.server.url), e(t.hosts)
            })
        }(), ym.ns.load = function (e, t, n, r) {
            var o = ym.ns.ready;
            return "function" == typeof e ? t ? o(["package.full"], e, t) : o(["package.full"], e) : ("string" == typeof e && (e = [e]), o.apply(this, arguments))
        }, ym.modules.define("system.browser", ["system.supports.graphics"], function (e, t) {
            var n = ym.env.browser;
            n.documentMode = document.documentMode, n.isIE = "MSIE" == n.name || "IEMobile" == n.name, n.oldIE = "MSIE" == n.name && n.documentMode < 9, n.isEdge = "Edge" == n.engine, n.isChromium = n.base && "chromium" == n.base.toLocaleLowerCase(), n.isSafari = "Safari" == n.name;
            var r = "Edge" == n.engine || "MSIE" == n.name && n.documentMode >= 10 && n.osVersion > 6.1 || "IEMobile" == n.name && n.engineVersion >= 6;
            r ? n.eventMapper = "pointer" : n.oldIE ? n.eventMapper = "oldIE" : n.eventMapper = "touchMouse", n.androidBrokenBuild = "AndroidBrowser" == n.name && "534.30" == n.engineVersion;
            var o = window.devicePixelRatio || screen.deviceXDPI && screen.deviceXDPI / 96 || 1;
            n.oldIE ? n.graphicsRenderEngine = "vml" : !t.hasCanvas() || "MSIE" == n.name || "IEMobile" == n.name || "Android" == n.osFamily && n.engine && "gecko" == n.engine.toLocaleLowerCase() || o > 1 && o < 2 ? n.graphicsRenderEngine = "svg" : n.graphicsRenderEngine = "canvas", n.transformTransition = "Android" == n.osFamily || "iOS" == n.osFamily || "MSIE" == n.name && n.documentMode >= 10 || n.base && "chromium" == n.base.toLocaleLowerCase(), n.css3DTransform = "WebKit" == n.engine && !("Android" == n.osFamily && parseFloat(n.osVersion) < 3) || "Gecko" == n.engine && parseInt(n.engineVersion.split(".")[0]) >= 10, n.unsupported = "OperaMini" == n.name, n.platform = n.isMobile ? n.osFamily : "Desktop", e(n)
        }), ym.modules.require(["system.browser"]), ym.modules.require(["system.logger"], function (e) {
            ym.logger = e
        }), ym.modules.define("system.logger", [], function (e, t) {
            function n(e, t) {
                var n = "";
                return ym.env.debug && (n += "(" + e + "): "), n += t
            }
            var r = "Yandex Maps JS API";
            e({
                assert: function (e, t) {
                    e || ym.env.debug && window.console && console.log(n(r, t))
                },
                log: function (e) {
                    ym.env.debug && window.console && console.log(n(r, e))
                },
                notice: function (e) {
                    ym.env.debug && window.console && console.info(n(r, e))
                },
                warning: function (e) {
                    ym.env.debug && window.console && console.warn(n(r, e))
                },
                error: function (e) {
                    window.console && console.error(n(r, e))
                },
                exception: function (e, t) {
                    throw new Error(n(e, t))
                }
            })
        }),
        function (e) {
            ym.modules.define("system.supports.csp", [], function (e) {
                var t = ym.env ? ym.env.browser : null;
                e({
                    isSupported: "undefined" != typeof Blob && "undefined" != typeof URL,
                    isNonceSupported: t && t.name && t.version ? !(t.name.search("Safari") != -1 && parseInt(t.version) < 10) : null
                })
            }), ym.modules.define("system.supports.css", [], function (e) {
                function t(e) {
                    return "undefined" == typeof f[e] ? f[e] = n(e) : f[e]
                }

                function n(e) {
                    return r(e) || r(p + i(e)) || r(d.cssPrefix + i(e))
                }

                function r(e) {
                    return "undefined" != typeof o().style[e] ? e : null
                }

                function o() {
                    return u || (u = document.createElement("div"))
                }

                function i(e) {
                    return e ? e.substr(0, 1).toUpperCase() + e.substr(1) : e
                }

                function s(e) {
                    var n = t(e);
                    return n && n != e && (n = "-" + p + "-" + e), n
                }

                function a(e) {
                    return c[e] && t("transitionProperty") ? s(c[e]) : null
                }
                var u, c = {
                        transform: "transform",
                        opacity: "opacity",
                        transitionTimingFunction: "transition-timing-function",
                        userSelect: "user-select",
                        height: "height"
                    },
                    l = {},
                    f = {},
                    d = ym.env.browser,
                    p = d.cssPrefix.toLowerCase();
                e({
                    checkProperty: t,
                    checkTransitionProperty: function (e) {
                        return "undefined" == typeof l[e] ? l[e] = a(e) : l[e]
                    },
                    checkTransitionAvailability: a
                })
            }), ym.modules.define("system.supports.graphics", [], function (e) {
                function t() {
                    if (!window.WebGLRenderingContext) return !1;
                    var e = ym.env.browser,
                        t = {
                            "Samsung Internet": !0,
                            AndroidBrowser: !0
                        },
                        n = "Webkit" == e.engine && +e.engineVersion < 537;
                    return !n && !t[e.name]
                }

                function n() {
                    if (!t()) return null;
                    var e;
                    try {
                        var n = document.createElement("canvas"),
                            r = n.getContext(e = "webgl", o);
                        r || (r = n.getContext(e = "experimental-webgl", o), r || (e = null))
                    } catch (i) {
                        e = null
                    }
                    return e ? {
                        contextName: e
                    } : null
                }

                function r(e, t) {
                    e.width = 226, e.height = 256, t.fillStyle = "#fff", t.fillRect(0, 0, 150, 150), t.globalCompositeOperation = "xor", t.fillStyle = "#f00", t.fillRect(10, 10, 100, 100), t.fillStyle = "#0f0", t.fillRect(50, 50, 100, 100);
                    for (var n = t.getImageData(49, 49, 2, 2), r = [], o = 0; o < 16; o++) r.push(n.data[o]);
                    return "0x0x0x0x0x0x0x0x0x0x0x0x0x255x0x255" == r.join("x")
                }
                var o = {
                        failIfMajorPerformanceCaveat: !0,
                        antialias: !1
                    },
                    i = {};
                e({
                    hasSvg: function () {
                        return "svg" in i || (i.svg = document.implementation && document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")), i.svg
                    },
                    hasCanvas: function () {
                        if (!("canvas" in i)) {
                            var e = document.createElement("canvas"),
                                t = "getContext" in e ? e.getContext("2d") : null;
                            i.canvas = !!t && r(e, t)
                        }
                        return i.canvas
                    },
                    hasWebGl: function () {
                        return "webgl" in i || (i.webgl = n()), i.webgl
                    },
                    hasVml: function () {
                        if (!("vml" in i)) {
                            var e, t = !1,
                                n = document.createElement("div");
                            n.innerHTML = '<v:shape id="yamaps_testVML"  adj="1" />', e = n.firstChild, e && e.style && (e.style.behavior = "url(#default#VML)", t = !e || "object" == typeof e.adj, n.removeChild(e)), i.vml = t
                        }
                        return i.vml
                    },
                    redetect: function () {
                        i = {}
                    },
                    getWebGlContextName: function () {
                        return i.webgl && i.webgl.contextName
                    }
                })
            }), ym.modules.require(["system.supports.css", "system.supports.graphics", "system.supports.csp"], function (e, t, n) {
                ym.env.server.params.csp && !n.isSupported && console && console.warn("CSP is not suported in this browser"), ym.supports = {
                    css: e,
                    graphics: t,
                    printPatchNeeded: !e.checkProperty("printColorAdjust"),
                    csp: n
                }
            })
        }(this);
    setupAsync({
        "server": {
            "url": "//api-maps.yandex.ru/2.1.61",
            "path": "build/release",
            "params": {
                "coordorder": "longlat",
                "csp": {
                    "data_style": "true"
                }
            }
        },
        "preload": {
            "load": "control.ZoomControl,control.GeolocationControl,geometry.Circle,coordSystem.geo,Map,Placemark,templateLayoutFactory,util.defineClass,ObjectManager,GeoObjectCollection,option.presetStorage,Layer,layer.tileContainer.CanvasContainer,Clusterer,util.bounds,util.imageLoader,util.imageLoader.proxy"
        },
        "enterprise": false,
        "key": undefined,
        "apikey": undefined,
        "browser": {
            "name": "Chrome",
            "version": "65.0.3325.181",
            "base": "Chromium",
            "engine": "WebKit",
            "engineVersion": "537.36",
            "osName": "Mac OS X High Sierra",
            "osFamily": "MacOS",
            "osVersion": "10.13.4",
            "isMobile": false,
            "isTablet": false,
            "multiTouch": false,
            "cssPrefix": "Webkit"
        },
        "lang": "ru_RU",
        "languageCode": "ru",
        "countryCode": "RU",
        "hosts": {
            "api": {
                "main": "https://api-maps.yandex.ru/",
                "ua": "https://yandex.ru/legal/maps_termsofuse/?lang={{lang}}",
                "maps": "https://yandex.ru/maps/",
                "statCounter": "https://yandex.ru/clck/",
                "services": {
                    "coverage": "https://api-maps.yandex.ru/services/coverage/",
                    "geocode": "https://geocode-maps.yandex.ru/",
                    "geoxml": "https://api-maps.yandex.ru/services/geoxml/",
                    "inception": "https://api-maps.yandex.ru/services/inception/",
                    "panoramaLocate": "https://api-maps.yandex.ru/services/panoramas/",
                    "search": "https://api-maps.yandex.ru/services/search/",
                    "suggest": "https://suggest-maps.yandex.ru/",
                    "regions": "https://api-maps.yandex.ru/services/regions/",
                    "route": "https://api-maps.yandex.ru/services/route/"
                }
            },
            "layers": {
                "map": "https://vec0%d.maps.yandex.net/tiles?l=map&%c&%l",
                "sat": "https://sat0%d.maps.yandex.net/tiles?l=sat&%c&%l",
                "skl": "https://vec0%d.maps.yandex.net/tiles?l=skl&%c&%l",
                "stv": "https://0%d.srdr.maps.yandex.net/?l=stv&%c&v=%v&%l&action=render",
                "sta": "https://lrs.maps.yandex.net/tiles?l=sta&%c&tm=%v&%l",
                "staHotspot": "https://lrs.maps.yandex.net/tiles?l=stj&%c&tm=%v&%l",
                "staHotspotKey": "%c&l=stj&tm=%v"
            },
            "metro_RU": "https://metro.yandex.ru/",
            "metro_UA": "https://metro.yandex.ua/",
            "metro_BY": "https://metro.yandex.by/",
            "metro_US": "https://metro.yandex.com/",
            "traffic": "https://jgo.maps.yandex.net/",
            "trafficArchive": "https://jft.maps.yandex.net/"
        },
        "layers": {
            "map": {
                "version": "18.04.22-2",
                "scaled": true,
                "hotspotZoomRange": [13, 23]
            },
            "sat": {
                "version": "3.383.0"
            },
            "skl": {
                "version": "18.04.22-2",
                "scaled": true,
                "hotspotZoomRange": [13, 23]
            },
            "trf": {
                "version": "1524722669",
                "scaled": true
            },
            "sta": {
                "version": "0.28.1-0.1.3.2-0.2018.04.23.11.00.2.29.21-0.stable"
            },
            "stv": {
                "version": "4.07.0"
            }
        },
        "geolocation": {
            "longitude": 37.620393,
            "latitude": 55.75396,
            "isHighAccuracy": false,
            "span": {
                "longitude": 0.641442,
                "latitude": 0.466439
            }
        },
        "token": "cd7bde9ee905a363a2b6d095f5a4aa10",
        "sign": (function (r) {
            function t(e) {
                if (n[e]) return n[e].exports;
                var o = n[e] = {
                    exports: {},
                    id: e,
                    loaded: !1
                };
                return r[e].call(o.exports, o, o.exports, t), o.loaded = !0, o.exports
            }
            var n = {};
            return t.m = r, t.c = n, t.p = "", t(0)
        })([function (r, t, n) {
            "use strict";

            function e() {
                for (var r = ["2", "c", "a", "b", "0", "2", "0", "5", "a", "c", "6", "7", "c", "4", "6", "1", "a", "2", "f", "0", "6", "2", "b", "3", "7", "f", "f", "0", "f", "6", "b", "1", "7", "a", "6", "e", "3", "9", "4", "d"], t = [
                        [SVGUnitTypes.SVG_UNIT_TYPE_USERSPACEONUSE + 11, (function () {
                            try {
                                document.createTextNode("").appendChild(document.createElement("a"))
                            } catch (e) {
                                return e.code
                            }
                        })() + 16],
                        [SVGLength.SVG_LENGTHTYPE_PERCENTAGE - 1, SVGLength.SVG_LENGTHTYPE_IN + 8],
                        [CSSRule.MEDIA_RULE + 16, document.createAttribute("fp").nodeName.length + 5]
                    ], n = 0; n < t.length; n++) {
                    var e = t[n][0],
                        o = t[n][1],
                        i = r[e];
                    r[e] = r[o], r[o] = i
                }
                return r.join("")
            }
            var o, i = n(1),
                u = n(2);
            r.exports = function (r) {
                return o || (o = i(e())), i(u(r), o)
            }
        }, function (r, t) {
            "use strict";
            r.exports = function (r, t) {
                t = t || 0;
                for (var n = 0; n < r.length; n++) t += (t << 1) + (t << 4) + (t << 7) + (t << 8) + (t << 24), t ^= r.charCodeAt(n);
                return t >>> 0
            }
        }, function (r, t) {
            "use strict";
            r.exports = function (r) {
                r = r.replace(/^.*\/\//, "");
                var t = r.indexOf("?");
                if (-1 === t) return r;
                var n = t + 1,
                    e = r.indexOf("#", n); - 1 === e && (e = r.length);
                var o = r.substring(n, e).split("&", 1e3);
                return r.substring(0, n) + o.sort().join("&") + r.substring(e)
            }
        }]),
        "distribution": {},
        "version": "2.1.61",
        "majorVersion": "2.1",
        "cssPrefix": "ymaps-2-1-61-",
        "coordinatesOrder": "longlat"
    })
})(this);