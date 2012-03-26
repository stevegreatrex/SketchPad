SketchPad.ViewModel = SketchPad.ViewModel || {};

SketchPad.ViewModel.Draw = function (imageSource, stageContainer) {
    var _backgroundImages = ko.observableArray(),
		_isLoadingImages = ko.observable(false),
        _stageContainer = $("#" + stageContainer),
		_stage = new Kinetic.Stage({
		    container: stageContainer,
		    width: _stageContainer.width(),
		    height: _stageContainer.height()
        }),
        _backgroundLayer = null,
        _spritePickerLayer = null;

    var _createSpritePickerLayer = function (spriteImages) {
        if (_spritePickerLayer) {
            _stage.remove(_spritePickerLayer);
        }

        _spritePickerLayer = new Kinetic.Layer();
        var pickerHeight = 100;
        var background = new Kinetic.Rect({
            height: pickerHeight,
            alpha: 0.3,
            width: _stage.width,
            fill: "white",
            y: _stage.height - pickerHeight
        });

        var baseYOffset = _stage.height - (pickerHeight * 0.5);
        var xOffset = 10;
        $.each(spriteImages, function (i, spriteImage) {
            var image = new Image();
            image.onload = function () {
                var kineticImage = new Kinetic.Image({
                    image: image,
                    x: xOffset,
                    y: baseYOffset - image.height / 2,
                    alpha: 0.7
                });
                _setAlphaOnHover(kineticImage, _spritePickerLayer, 1, 0.7);
                _spritePickerLayer.add(kineticImage);
                _spritePickerLayer.draw();
            };
            image.src = spriteImage.Data;
        });
        
        _spritePickerLayer.add(background);
        _stage.add(_spritePickerLayer);
        _spritePickerLayer.setZIndex(100);
        _stage.add(_spritePickerLayer);
    };

    var _setAlphaOnHover = function(target, layer, hoverAlpha, nonHoverAlpha) {
        target.on("mouseover", function () {
            target.setAlpha(hoverAlpha);
            layer.draw();
        });
        target.on("mouseout", function () {
            target.setAlpha(nonHoverAlpha);
            layer.draw();
        });
    };

	var _refreshImages = function () {
		_isLoadingImages(true);
		var backgroundImages = imageSource.getBackgroundImages().done(function (data) {
		    _backgroundImages.removeAll();
			for (var i = 0; i < data.length; i++) {
				_backgroundImages.push(ko.mapping.fromJS(data[i]));
			}
        });

		var sprites = imageSource.getSprites().done(function (data) {
		    _createSpritePickerLayer(data);
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
	        _backgroundLayer.setZIndex(0);
	    };

		image.src = this.Data();
	};

	_refreshImages();

	return {
		availableBackgrounds: _backgroundImages,
		isLoadingImages: _isLoadingImages,
		applyBackgroundImage: _applyBackgroundImage
	};
};