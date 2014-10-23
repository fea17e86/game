var Fea = Fea || {};

Fea.Tileset = function (options) {
    this.sprite = undefined;
    this.name = '';
    this.height = 0;
    this.width = 0;
    this.tileheight = 0;
    this.tilewidth = 0;
    this.margin = 0;
    this.spacing = 0;
    this.firstgid = 0;
    this.lastgid = 0;
    this.initialize(options);
};
Fea.Tileset.prototype.initialize = function (options) {
    var o = options || {};
    this.sprite = o.sprite;
    if (o.json) {
        var j = o.json;
        if (!j.name || !j.tileheight || !j.tilewidth || !j.imageheight || !j.imagewidth) {
            throw "Unexpected JSON format for Fea.Tileset()!";
        } else {
            this.name = j.name;
            this.height = j.imageheight;
            this.width = j.imagewidth;
            this.tileheight = j.tileheight;
            this.tilewidth = j.tilewidth;
            this.margin = j.margin || 0;
            this.spacing = j.spacing || 0;
            this.firstgid = o.firstgid || j.firstgid || 1;
            this.lastgid = this.firstgid + this.rows() * this.cols() - 1;
        }
    }
};
Fea.Tileset.prototype.cols = function () {
    return Math.floor((this.width - 2*this.margin + this.spacing) / (this.tilewidth + this.spacing));
};
Fea.Tileset.prototype.rows = function () {
    return Math.floor((this.height - 2*this.margin + this.spacing) / (this.tileheight + this.spacing));
};
Fea.Tileset.prototype.firstGID = function (gid) {
    if (gid && (gid !== this.firstgid)) {
        this.firstgid = Math.max(1, gid);
        this.lastgid = this.firstgid + this.rows() * this.cols() - 1;
    } else {
        return this.firstgid;
    }
};
Fea.Tileset.prototype.contains = function (index) {
    return index >= this.firstgid && index <= this.lastgid;
};
Fea.Tileset.prototype.tileCoordinates = function (index) {
    if (this.contains(index)) {
        var n = index - this.firstgid;
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
                x : this.margin + (coords.x) * (this.tilewidth + this.spacing),
                y : this.margin + (coords.y) * (this.tileheight + this.spacing)
            };
        }
    }
};