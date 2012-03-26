SketchPad.ViewModel = SketchPad.ViewModel || {};

SketchPad.ViewModel.Draw = function (imageSource, stageContainer) {
    var _backgroundImages = ko.observableArray(),
        _sprites = ko.observableArray(),
		_isLoadingImages = ko.observable(false),
        _stageContainer = $("#" + stageContainer),
		_stage = new Kinetic.Stage({
		    container: stageContainer,
		    width: _stageContainer.width(),
		    height: _stageContainer.height()
        }),
        _backgroundLayer = null;

	var _refreshImages = function () {
		_isLoadingImages(true);
		var backgroundImages = imageSource.getBackgroundImages().done(function (data) {
		    _backgroundImages.removeAll();
			for (var i = 0; i < data.length; i++) {
				_backgroundImages.push(ko.mapping.fromJS(data[i]));
			}
        });

		var sprites = imageSource.getSprites().done(function (data) {
		    _sprites.removeAll();
		    for (var i = 0; i < data.length; i++) {
		        _sprites.push(ko.mapping.fromJS(data[i]));
		    }
        });

		$.when(sprites, backgroundImages)
        .then(function () {
            _isLoadingImages(false);
        });
	};

	var _applyBackgroundImage = function () {
	    if (_backgroundLayer) {
	        _stage.remove(_backgroundLayer);
        }

	    _backgroundLayer = new Kinetic.Layer();
	    var image = new Image();
	    image.onload = function () {
	        var xRatio = image.width / _stage.width;
	        var yRatio = image.height / _stage.height;
	        var ratio = xRatio < yRatio ? yRatio : xRatio;

	        var kineticImage = new Kinetic.Image({
	            x: 0,
	            y: 0,
	            image: image,
	            width: image.width / ratio,
                height: image.height / ratio
            });
	        _backgroundLayer.add(kineticImage);
	        _stage.add(_backgroundLayer);
	    };

		image.src = this.Data();
	};

	_refreshImages();

	return {
		availableBackgrounds: _backgroundImages,
        availableSprites: _sprites,
		isLoadingImages: _isLoadingImages,
		applyBackgroundImage: _applyBackgroundImage
	};
};