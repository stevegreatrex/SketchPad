SketchPad.Data = SketchPad.Data || {};

SketchPad.Data.ImageSource = function () {
	var _getBackgroundImages = function () {
		var token = $.Deferred();
		$.getJSON("/api/backgroundimage", null, function (data) {
			token.resolve(data);
		});

		return token;
	};

	var _getSprites = function () {
	    var token = $.Deferred();
	    $.getJSON("/api/sprite", null, function (data) {
	        token.resolve(data);
	    });

	    return token;
	};
	return {
	    getBackgroundImages: _getBackgroundImages,
        getSprites: _getSprites
	};
};