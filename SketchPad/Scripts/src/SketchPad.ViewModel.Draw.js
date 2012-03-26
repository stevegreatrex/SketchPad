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

    var _isWithin = function (target, shape) {
        var position = shape.getPosition();
        var myPosition = target.getPosition();
        return (position.x > myPosition.x && position.x < myPosition.x + target.width &&
        position.y > myPosition.y && position.y < myPosition.y + target.height)
    };

    var _createSpritePickerLayer = function (spriteImages) {
        if (_spritePickerLayer) {
            _stage.remove(_spritePickerLayer);
        }

        _spritePickerLayer = new Kinetic.Layer();
        var pickerHeight = 100;
        var baseYOffset = _stage.height - (pickerHeight * 0.5);
        var background = new Kinetic.Rect({
            height: pickerHeight,
            alpha: 0.3,
            width: _stage.width,
            fill: "white",
            y: _stage.height - pickerHeight
        });

        var trash = new Kinetic.Rect({
            height: 80,
            width: 80,
            stroke: "red",
            strokeThickness: 5,
            x: 10,
            y: baseYOffset - 40
        });

        var xOffset = 100;
        $.each(spriteImages, function (i, spriteImage) {
            _createSpriteImage({
                image: spriteImage,
                xOffset: xOffset,
                baseYOffset: baseYOffset,
                layer: _spritePickerLayer,
                trash: trash,
                pickerArea: background,
                onCreated: function (image) {
                    _spritePickerLayer.add(image);
                    _spritePickerLayer.draw();
                }
            });
        });
        
        _spritePickerLayer.add(background);
        _spritePickerLayer.add(trash);
        _stage.add(_spritePickerLayer);
        _spritePickerLayer.setZIndex(100);
        _stage.add(_spritePickerLayer);
    };

    var _createSpriteImage = function (data) {
        var image = new Image();
        image.onload = function () {
            var kineticImage = new Kinetic.Image({
                image: image,
                x: data.xOffset,
                y: data.baseYOffset - image.height / 2,
                alpha: 0.7,
                draggable: true
            });
            _setAlphaOnHover(kineticImage, _spritePickerLayer, 1, 0.7);
            //remove the hover styles once it is dragged
            kineticImage.on("dragend.disableAlpha", function () {
                kineticImage.off("mouseover.hoverAlpha");
                kineticImage.off("mouseout.hoverAlpha");
            });
            //clone the image when it is created so we can drag it again
            kineticImage.on("dragstart.clone", function () {
                data.onCreated(_createSpriteImage(data));
            });
            //remove the item if it is dropped onto the trash or doesn't make it out of the background area
            kineticImage.on("dragend.trash", function (e) {
                if (_isWithin(data.trash, kineticImage) || _isWithin(data.pickerArea, kineticImage)) {
                    data.layer.remove(kineticImage);
                    data.layer.draw();
                }
            });
            data.onCreated(kineticImage);
        };
        image.src = data.image.Data;
    };

    var _setAlphaOnHover = function(target, layer, hoverAlpha, nonHoverAlpha) {
        target.on("mouseover.hoverAlpha", function () {
            target.setAlpha(hoverAlpha);
            layer.draw();
        });
        target.on("mouseout.hoverAlpha", function () {
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