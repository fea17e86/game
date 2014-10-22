var Fea = Fea || {};

Fea.Tileset = function (options) {
    this.game = undefined;
    this.name = '';
    this.height = 0;
    this.width = 0;
    this.tileHeight = 0;
    this.tileWidth = 0;
    this.margin = 0;
    this.spacing = 0;
    this.from = 0;
    this.to = 0;
    this.initialize(options);
};
Fea.Tileset.prototype.initialize = function (options) {
    var o = options || {};
    this.game = o.game;
    if (o.json) {
        var j = o.json;
        if (!j.name || !j.tileheight || !j.tilewidth || !j.imageheight || !j.imagewidth) {
            throw "Unexpected JSON format for Fea.Tileset()!";
        } else {
            this.name = j.name;
            this.height = j.imageheight;
            this.width = j.imagewidth;
            this.tileHeight = j.tileheight;
            this.tileWidth = j.tilewidth;
            this.margin = j.margin || 0;
            this.spacing = j.spacing || 0;
            this.from = o.from || j.firstgid || 1;
            this.to = this.from + this.rows() * this.cols();
        }
    }
};
Fea.Tileset.prototype.cols = function () {
    return Math.floor((this.width - 2*this.margin + this.spacing) / (this.tileWidth + this.spacing));
};
Fea.Tileset.prototype.rows = function () {
    return Math.floor((this.height - 2*this.margin + this.spacing) / (this.tileHeight + this.spacing));
};
Fea.Tileset.prototype.firstGID = function (gid) {
    if (gid && (gid !== this.from)) {
        this.from = Math.max(1, gid);
        this.to = this.from + this.rows() * this.cols();
    } else {
        return this.from;
    }
};
Fea.Tileset.prototype.contains = function (index) {
    return index >= this.from && index < this.to;
}
Fea.Tileset.prototype.tileCoordinates = function (index) {
    if (this.contains(index)) {
        var n = index - this.from;
        var cols = this.cols();
        var y = Math.floor(n / cols);
        if (y < this.rows()) {
            return { x : n % cols, y : y };
        }
    }
};
Fea.Tileset.prototype.tileCoordinatesPixel = function (index) {
    if (index) {
        var coords = index.x && index.y ? index : this.tileCoordinates(index);
        if (coords !== undefined && coords.x !== undefined && coords.y !== undefined)  {
            return {
                x : this.margin + (coords.x) * (this.tileWidth + this.spacing),
                y : this.margin + (coords.y) * (this.tileHeight + this.spacing)
            };
        }
    }
};