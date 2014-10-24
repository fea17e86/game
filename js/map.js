var Fea = Fea || {};

Fea.Map = function (options) {
    this.phaser = undefined;
    this.canvas = undefined;
    this.sprites = undefined;
    this.height = 0;
    this.width = 0;
    this.tileheight = 0;
    this.tilewidth = 0;
    this.layers = [];
    this.tilesets = undefined;
    this.initialize(options);
};
Fea.Map.prototype.initialize = function (options) {
    var o = options || {};
    this.phaser = o.phaser;
    this.canvas = o.canvas;
    this.sprites = o.sprites;
    if (o.json) {
        var j = o.json;
        if (!j.height || !j.width || !j.tileheight || !j.tilewidth || !j.layers || !j.tilesets) {
            throw "Unexpected JSON format for Fea.Map()!";
        } else {
            this.height = j.height;
            this.width = j.width;
            this.tileheight = j.tileheight;
            this.tilewidth = j.tilewidth;
            this.tilesets = Fea.Map.prototype.createTilesetManager();
            for (var i=0; i<j.tilesets.length; i++) {
                this.tilesets[i] = new Fea.Tileset({
                    json : j.tilesets[i], 
                    sprite : this.sprites ? this.sprites[j.tilesets[i].name] : undefined
                    
                });
            }
            for (i=0; i<j.layers.length; i++) {
                if (j.layers[i].visible === true) {
                    this.layers.push(new Fea.Map.prototype.Layer({
                        json : j.layers[i], 
                        phaser : this.phaser,
                        canvas : this.canvas,
                        tilesets : this.tilesets, 
                        tilewidth : this.tilewidth, 
                        tileheight : this.tileheight
                    }));
                }
            }
        }
    }
};
Fea.Map.prototype.absoluteHeight = function () {
    return this.height && this.tileheight ? this.height * this.tileheight : 0;
};
Fea.Map.prototype.absoluteWidth = function () {
    return this.width && this.tilewidth ? this.width * this.tilewidth : 0;
};
Fea.Map.prototype.draw = function (x, y) {
    var hash = [];
    for (var l=0; l<this.layers.length; l++) {
        hash = this.layers[l].draw(hash, x, y);
    }
};

Fea.Map.prototype.Layer = function (options) {
    this.phaser = undefined;
    this.canvas = undefined;
    this.tilesets = undefined;
    this.name = '';
    this.type = '';
    this.data = [];
    this.x = 0;
    this.y = 0;
    this.height = 0;
    this.width = 0;
    this.tileheight = 0;
    this.tilewidth = 0;
    this.initialize(options);
};
Fea.Map.prototype.Layer.prototype.initialize = function (options) {
    var o = options || {};
    this.phaser = o.phaser;
    this.canvas = o.canvas;
    this.tilesets = o.tilesets;
    this.tilewidth = o.tilewidth || 0;
    this.tileheight = o.tileheight || 0;
    if (o.json) {
        var j = o.json;
        if (!j.name || !j.type || !(j.data || j.objects)) {
            throw "Unexpected JSON format for Fea.Map.Layer()!";
        } else {
            this.name = j.name;
            this.type = j.type;
            this.data = j.data || j.objects;
            this.x = j.x;
            this.y = j.y;
            this.height = j.height;
            this.width = j.width;
        }
    }
};
Fea.Map.prototype.Layer.prototype.draw = function (hash, x, y) {
    hash = hash || [];
    var p = { x : x || this.x, y : y || this.y };
    var context = this.canvas ? this.canvas.getContext("2d") : undefined;
    if (this.tilesets && this.type === 'tilelayer' && (this.phaser || context)) {
        for (var i=0; i<this.data.length; i++) {
            var n = this.data[i];
            if (n > 0) {
                var ts = hash[n] ? hash[n] : (hash[n] = this.tilesets.find(n));
                if (ts) {
                    if (this.phaser) {
                        this.phaser.add.sprite(p.x, p.y, ts.name, n-1);
                    } else if (context) {
                        var coords = ts.tileCoordinatesPixel(n);
                        if (coords) {
                            context.drawImage(ts.sprite, coords.x, coords.y, ts.tilewidth, ts.tileheight, 
                                        p.x, p.y, ts.tilewidth, ts.tileheight);
                        }
                    }
                    
                }
            }
            p.x += this.tilewidth;
            if (p.x >= this.width * this.tilewidth) {
                p.x = x || this.x;
                p.y += this.tileheight;
            }
        }
    }
    return hash;
};

Fea.Map.prototype.createTilesetManager = function (tilesets) {
    tilesets = tilesets || [];
    var manager = new Array(tilesets.length);
    for (var i=0; i<tilesets.length; i++) {
        manager[i] = tilesets[i];
    }
    manager.find = function (index) {
        for (var i=0; i<this.length; i++) {
            if (this[i].contains(index)) {
                return this[i];
            }
        }
    };
    return manager;
};

Fea.createMap = function (options) {
    options = options || {};
    if (options.json) {
        return new Fea.Map(options);
    } else if (options.url) {
        if ($ || jQuery) {
            var $ = $ || jQuery;
            
            var counter = { value : 0 };

            var blankFunction = function () {
                console.log("This is a blank function! It has no functionality. arguments=", arguments);
                counter.value--;
                if (counter.value <= 0) {
                    spriteLoadingDone(true);
                }
            };
            
            var spriteLoadingDone = function (failed) {
                if (true !== failed && options.done) {
                    var map = new Fea.Map(options);
                    options.done(map);
                }
            };

            var createSpriteLoaded = function (url, name) {
                if (url && name) {
                    return function (event) {
                        if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
                            console.log("Couldn't load image " + name + ":'" + url + "'!");
                            options.sprites[name] = undefined;
                        } else {
                            options.sprites[name] = this;
                        }
                        counter.value--;
                        if (counter.value <= 0) {
                            spriteLoadingDone();
                        }
                    };
                }
                return blankFunction;
            };
            
            var createCanvas = function (width, height) {
                return $('<canvas width="'+ width +'" height="'+ height +'"></canvas>')[0];
            };
            
            $.getJSON(options.url).done(function (json) {
                options.json = json;
                options.sprites = options.sprites || {};
                
                if (!options.phaser && !options.canvas) {
                    var width = options.width || json.width * json.tilewidth;
                    var height = options.height || json.height * json.tileheight;
                    var canvas = createCanvas(width, height);
                    if (canvas) {
                        options.canvas = canvas;
                        var added = false;
                        if (options.parent) {
                            $(options.parent).append(canvas);
                            added = true;
                        }
                        if (!added) {
                            $("body").append(canvas);
                        }
                    }
                }
                
                var name, url, loadSprite;
                for (var i = 0; i < json.tilesets.length; i++) {
                    name = json.tilesets[i].name;
                    url = options.sprites[name] || json.tilesets[i].image;
                    options.sprites[name] = url;
                    counter.value++;
                    loadSprite = createSpriteLoaded(url, name);
                    $("<img />").attr("src", url).load(loadSprite);
                }
                name = url = loadSprite = undefined;
            }).fail(function() {
                console.log("Couldn't load json file '" + options.url + "'!");
            });
        }
    }
};

Fea.renderMap = function (options) {
    options = options || {};
    if (options.map) {
        options.map.draw();
    } else {
        var superCallback = options.done;
        options.done = function (map) {
            if (map) {
                map.draw();
            }
            if (superCallback) {
                superCallback(map);
            }
        };
        Fea.createMap(options);
    }
};