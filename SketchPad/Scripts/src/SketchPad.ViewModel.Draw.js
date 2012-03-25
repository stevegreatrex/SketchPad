SketchPad.ViewModel = SketchPad.ViewModel || {};

SketchPad.ViewModel.Draw = function (imageSource, canvas) {
	var _backgroundImage = ko.observable(),
		_backgroundImages = ko.observableArray(),
		_isLoadingImages = ko.observable(false),
		_canvas = $("#" + canvas),
		_drawingContext = document.getElementById(canvas).getContext("2d");

	var _initCanvas = function () {
		_canvas.attr("width",_canvas.width());
		_canvas.attr("height", _canvas.height());
	};

	var _refreshImages = function () {
		_isLoadingImages(true);
		imageSource.getBackgroundImages().done(function (data) {
			_backgroundImages.removeAll();
			for (var i = 0; i < data.length; i++) {
				_backgroundImages.push(ko.mapping.fromJS(data[i]));
			}
			_isLoadingImages(false);
		});
	};

	var _applyBackgroundImage = function () {
		var image = new Image();
		image.src = this.Data();
		var imageWidth = image.width;
		var imageHeight = image.height;
		var xRatio = imageWidth / _canvas.width();
		var yRatio = imageHeight / _canvas.height();
		var ratio = xRatio < yRatio ? yRatio : xRatio;
		
		_drawingContext.drawImage(image, 0, 0, imageWidth / ratio, imageHeight / ratio);
	};

	_initCanvas();
	_refreshImages();

	return {
		background: _backgroundImage,
		availableBackgrounds: _backgroundImages,
		isLoadingImages: _isLoadingImages,
		applyBackgroundImage: _applyBackgroundImage
	};
};