function resetUrlState($button) {
    if ($button && !$button.hasClass("btn-default")) {
        $button.removeClass("btn-danger btn-success");
        $button.addClass("btn-default");
        $button.attr("title", "URL &uuml;berpr&uuml;fe");
        var $glyph = $button.children(".glyphicon");
        $glyph.removeClass("glyphicon-exclamation-sign glyphicon-ok-sign");
        $glyph.addClass("glyphicon-question-sign");
    }
}

function urlSuccess($button) {
    if ($button && !$button.hasClass("btn-success")) {
        $button.removeClass("btn-default btn-danger");
        $button.addClass("btn-success");
        $button.attr("title", "URL ist korrekt.");
        var $glyph = $button.children(".glyphicon");
        $glyph.removeClass("glyphicon-question-sign glyphicon-exclamation-sign");
        $glyph.addClass("glyphicon-ok-sign");
    }
}

function urlFail($button, message) {
    if ($button && !$button.hasClass("btn-danger")) {
        $button.removeClass("btn-default btn-success");
        $button.addClass("btn-danger");
        $button.attr("title", message);
        var $glyph = $button.children(".glyphicon");
        $glyph.removeClass("glyphicon-question-sign glyphicon-ok-sign");
        $glyph.addClass("glyphicon-exclamation-sign");
    }
}

function checkMapUrl($input, $button) {
    if ($input && $button) {
        var url = $input.val();
        if (url) {
            $.get(url).done(function(data, status, xhr) {
                var success = false;
                var ct;
                if ((ct = xhr.getResponseHeader("content-type"))) {
                    if (ct.indexOf("json") > -1) {
                        urlSuccess($button);
                        success = true;
                        if (!dialog._jsonCache[url]) {
                            dialog._jsonCache[url] = data;
                        }
                    }
                }
                if (success !== true) {
                    urlFail($button, "Die URL muss auf eine JSON-Datei verweisen.");
                }
            }).fail(function() {
                urlFail($button, "Die URL ist nicht erreichbar.");
            });
        }
    }
}

function addMapUrl() {
    $("#mapurls").append($(
        '<div class="form-group">' + '<div class="input-group">' + '<input type="url" class="form-control map-url" placeholder="URL zur Karte" onkeyup="resetUrlState($(this).next().children(\'.btn\'));">' + '<span class="input-group-btn">' + '<button class="btn btn-default" type="button" onclick="checkMapUrl($(this).parent().prev(), $(this));" title="URL &uuml;berpr&uuml;fen"><span class="glyphicon glyphicon-question-sign"></span></button>' + '</span>' + '</div>' + '</div>'
    ));
}

function checkTilesetUrl($input, $button) {
    if ($input && $button) {
        var url = $input.val();
        if (url) {
            $.get(url).done(function(data, status, xhr) {
                var success = false;
                var ct;
                if ((ct = xhr.getResponseHeader("content-type"))) {
                    if (ct.indexOf("image") > -1) {
                        urlSuccess($button);
                        success = true;
                    }
                }
                if (success !== true) {
                    urlFail($button, "Die URL muss auf eine Bild-Datei verweisen.");
                }
            }).fail(function() {
                urlFail($button, "Die URL ist nicht erreichbar.");
            });
        }
    }
}

function addTilesetUrl() {
    $("#tileseturls").append($(
        '<div class="form-group">' + '<div class="input-group">' + '<input type="url" class="form-control tileset-url" placeholder="URL zur Grafik" onkeyup="resetUrlState($(this).next().children(\'.btn\'));">' + '<span class="input-group-btn">' + '<button class="btn btn-default" type="button" onclick="checkTilesetUrl($(this).parent().prev(), $(this));" title="URL &uuml;berpr&uuml;fen"><span class="glyphicon glyphicon-question-sign"></span></button>' + '</span>' + '</div>' + '</div>'
    ));
}

var dialog = {
    _attributes: [
        [{
            name: "height",
            selector: "#height"
        }, {
            name: "tileheight",
            selector: "#tileheight"
        }, {
            name: "tilewidth",
            selector: "#tilewidth"
        }, {
            name: "width",
            selector: "#width"
        }],
        [{
            name: "mapurls",
            selector: ".map-url"
        }],
        [{
            name: "tileseturls",
            selector: ".tileset-url"
        }]
    ],
    _clearAttribute: function(selector) {
        var $element = $(selector);
        for (var i = 0; i < $element.size(); i++) {
            $($element[i]).val('');
            if (i > 0) {
                $($element[i]).remove();
            }
        }
    },
    _current: -1,
    _getAttributeValue: function(selector) {
        var value;
        var $element = $(selector);
        if ($element.size() > 1) {
            value = [];
            $element.each(function() {
                value.push($(this).val());
            });
        }
        else {
            value = $element.val();
        }
        return value;
    },
    _hideCurrent: function() {
        if (this._current >= 0 && this._current < this._states.length) {
            $(this._states[this._current]).modal("hide");
        }
    },
    _jsonCache: {},
    _onCancel: function() {},
    _showCurrent: function() {
        if (this._current >= 0 && this._current < this._states.length) {
            $(this._states[this._current]).modal("show");
        }
    },
    _states: ["#map_size", "#map_parts", "#map_tilesets"],
    cancel: function() {
        for (var s = 0; s < this._states.length; s++) {
            for (var a = 0; a < this._attributes[s].length; a++) {
                this._clearAttribute(this._attributes[s][a].selector);
            }
        }
        this._hideCurrent();
        this._current = -1;
        this._onCancel();
    },
    finish: function() {
        var data = {};
        data.json = this._jsonCache;
        for (var s = 0; s < this._states.length; s++) {
            for (var a = 0; a < this._attributes[s].length; a++) {
                data[this._attributes[s][a].name] = this._getAttributeValue(this._attributes[s][a].selector);
            }
        }
        this.onFinish(data);
        this.cancel();
    },
    next: function() {
        if (this._current < this._states.length - 1) {
            this._hideCurrent();
            this._current++;
            this._showCurrent();
        }
    },
    onFinish: function(data) {
        console.log(data);
    },
    previous: function() {
        if (this._current > 0) {
            this._hideCurrent();
            this._current--;
            this._showCurrent();
        }
    },
    start: function() {
        this.cancel();
        this.next();
    }
};