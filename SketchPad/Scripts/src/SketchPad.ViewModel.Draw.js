SketchPad.ViewModel = SketchPad.ViewModel || {};

SketchPad.ViewModel.Levels = {
    background: 0,
    toolbar: 100,
    toolbarIcons: 105,
    toolbarButtons: 110,
    sprite: 200
};

SketchPad.ViewModel.LineTool = function (data) {
    var _layer = null,
        _color = data.color || "black",
        _strokeWidth = data.strokeWidth || 5,
        _attach = function () {
        },
        _detach = function () {
        },
        _drawLine = function (from, to) {
            if (_layer) {
                data.stage.remove(_layer);
            }
            _layer = new Kinetic.Layer();
            var line = new Kinetic.Polygon({
                points: [from, to],
                stroke: _color,
                strokeWidth: _strokeWidth
            });
            var lineEnd = new Kinetic.Circle({
                x: to.x,
                y: to.y,
                radius: _strokeWidth,
                fill: _color
            });
            _layer.add(line);
            _layer.add(lineEnd);
            data.stage.add(_layer);
            _layer.setZIndex(SketchPad.ViewModel.Levels.toolbarIcons);
        },
        _drawIcon = function (data) {
            var mid = data.y + data.height /2;
            _drawLine({ x: data.x, y: mid }, { x: data.width, y: mid });
        };

    return {
        attach: _attach,
        detach: _detach,
        drawIcon: _drawIcon
    };
};

SketchPad.ViewModel.Draw = function (imageSource, stageContainer) {
    var _backgroundImages = ko.observableArray(),
		_isLoadingImages = ko.observable(false),
        _stageContainer = $("#" + stageContainer),
		_stage = new Kinetic.Stage({
		    container: stageContainer,
		    width: _stageContainer.width(),
		    height: _stageContainer.height()
        }),
        _pickerHeight = 100,
        _toolbarWidth = 50,
        _backgroundLayer = null,
        _spritePickerLayer = null,
        _toolbarLayer = null;

    var _isWithin = function (target, shape) {
        var position = shape.getPosition();
        var myPosition = target.getPosition();
        return (position.x > myPosition.x && position.x < myPosition.x + target.width &&
        position.y > myPosition.y && position.y < myPosition.y + target.height)
    };

    var _setAlphaOnHover = function (target, layer, hoverAlpha, nonHoverAlpha) {
        target.on("mouseover.hoverAlpha", function () {
            target.setAlpha(hoverAlpha);
            layer.draw();
        });
        target.on("mouseout.hoverAlpha", function () {
            target.setAlpha(nonHoverAlpha);
            layer.draw();
        });
    };

    var _createSpritePickerLayer = function (spriteImages) {
        if (_spritePickerLayer) {
            _stage.remove(_spritePickerLayer);
        }

        _spritePickerLayer = new Kinetic.Layer();
        var baseYOffset = _stage.height - (_pickerHeight * 0.5);
        var background = new Kinetic.Rect({
            height: _pickerHeight,
            alpha: 0.3,
            width: _stage.width,
            fill: "white",
            y: _stage.height - _pickerHeight
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
        _spritePickerLayer.setZIndex(SketchPad.ViewModel.Levels.toolbar);
        _spritePickerLayer.draw();
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

    var _createToolbarArea = function () {
        if (_toolbarLayer) {
            _stage.remove(_toolbarLayer);
        }

        _toolbarLayer = new Kinetic.Layer();
        var background = new Kinetic.Rect({
            width: _toolbarWidth,
            alpha: 0.3,
            height: _stage.height - _pickerHeight,
            fill: "white"
        });

        var tools = [
            new SketchPad.ViewModel.LineTool({
                stage: _stage,
                color: "red",
                strokeWidth: 5
            }),
            new SketchPad.ViewModel.LineTool({
                stage: _stage,
                color: "green",
                strokeWidth: 5
            }),
            new SketchPad.ViewModel.LineTool({
                stage: _stage,
                color: "orange",
                strokeWidth: 5
            })
        ];

        var yOffset = 10,
            iconHeight = 20,
            iconWidth = 40,
            _toolbarButtons = new Kinetic.Layer();
        $.each(tools, function (i, tool) {
            var background = new Kinetic.Rect({
                x: 5,
                y: yOffset,
                height: iconHeight,
                width: iconWidth,
                stroke: "black",
                strokeThickness: 1
            });

            tool.drawIcon({
                x: 10,
                y: yOffset,
                width: iconWidth -5,
                height: iconHeight
            });
            yOffset += 30;

            _toolbarButtons.add(background);

            background.on("click", function () {
                $.each(tools, function (j, otherTool) {
                    if (otherTool != tool) {
                        otherTool.detach();
                    } else {
                        otherTool.attach();
                    }
                });
            });
        });

        _toolbarLayer.add(background);
        _stage.add(_toolbarButtons);
        _stage.add(_toolbarLayer);
        _toolbarLayer.setZIndex(SketchPad.ViewModel.Levels.toolbar);
        _toolbarButtons.setZIndex(SketchPad.ViewModel.Levels.toolbarButtons);
        _toolbarLayer.draw();
        _toolbarButtons.draw();
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
	        var xRatio = image.width / (_stage.width-_toolbarWidth);
	        var yRatio = image.height / (_stage.height-_pickerHeight);
	        var ratio = xRatio < yRatio ? yRatio : xRatio;

	        var kineticImage = new Kinetic.Image({
	            x: _toolbarWidth,
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
	_createToolbarArea();

	return {
		availableBackgrounds: _backgroundImages,
		isLoadingImages: _isLoadingImages,
		applyBackgroundImage: _applyBackgroundImage
	};
};