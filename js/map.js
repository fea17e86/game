var Fea = Fea || {};

Fea.Map = function (options) {
    this.game = undefined;
    this.height = 0;
    this.width = 0;
    this.tileHeight = 0;
    this.tileWidth = 0;
    this.layers = [];
    this.tilesets = undefined;
    this.initialize(options);
};
Fea.Map.prototype.initialize = function (options) {
    var o = options || {};
    this.game = o.game;
    if (o.json) {
        var j = o.json;
        if (!j.height || !j.width || !j.tileheight || !j.tilewidth || !j.layers || !j.tilesets) {
            throw "Unexpected JSON format for Fea.Map()!";
        } else {
            this.height = j.height;
            this.width = j.width;
            this.tileHeight = j.tileheight;
            this.tileWidth = j.tilewidth;
            this.tilesets = Fea.Map.prototype.createTilesetManager();
            for (var i=0; i<j.tilesets.length; i++) {
                this.tilesets[i] = new Fea.Tileset({ json : j.tilesets[i], game : this.game });
            }
            for (i=0; i<j.layers.length; i++) {
                if (j.layers[i].visible === true) {
                    this.layers.push(new Fea.Map.prototype.Layer({
                        json : j.layers[i], 
                        game : this.game, 
                        tilesets : this.tilesets, 
                        tileWidth : this.tileWidth, 
                        tileHeight : this.tileHeight
                    }));
                }
            }
        }
    }
};
Fea.Map.prototype.absoluteHeight = function () {
    return this.height && this.tileHeight ? this.height * this.tileHeight : 0;
};
Fea.Map.prototype.absolueWidth = function () {
    return this.width && this.tileWidth ? this.width * this.tileWidth : 0;
};
Fea.Map.prototype.draw = function (x, y) {
    if (this.game) {
        var hash = [];
        for (var l=0; l<this.layers.length; l++) {
            hash = this.layers[l].draw(hash, x, y);
        }
    }
};

Fea.Map.prototype.Layer = function (options) {
    this.game = undefined;
    this.tilesets = undefined;
    this.name = '';
    this.type = '';
    this.data = [];
    this.x = 0;
    this.y = 0;
    this.height = 0;
    this.width = 0;
    this.tileHeight = 0;
    this.tileWidth = 0;
    this.initialize(options);
};
Fea.Map.prototype.Layer.prototype.initialize = function (options) {
    var o = options || {};
    this.game = o.game;
    this.tilesets = o.tilesets;
    this.tileWidth = o.tileWidth || 0;
    this.tileHeight = o.tileHeight || 0;
    if (o.json) {
        var j = o.json;
        if (!j.name || !j.type || !(j.data || j.objects)) {
            console.log(j);
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
    if (this.game && this.tilesets && this.type === 'tilelayer') {
        for (var i=0; i<this.data.length; i++) {
            var n = this.data[i];
            if (n > 0) {
                var ts = hash[n] ? hash[n] : (hash[n] = this.tilesets.find(n));
                if (ts) {
                    this.game.add.sprite(p.x, p.y, ts.name, n-1);
                }
            }
            p.x += this.tileWidth;
            if (p.x >= this.width * this.tileWidth) {
                p.x = x || this.x;
                p.y += this.tileHeight;
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