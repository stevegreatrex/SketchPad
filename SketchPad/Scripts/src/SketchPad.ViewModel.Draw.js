SketchPad.ViewModel = SketchPad.ViewModel || {};

SketchPad.ViewModel.Draw = function (imageSource) {
	var _backgroundImage = ko.observable(),
		_backgroundImages = ko.observableArray(),
		_isLoadingImages = ko.observable(false);

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

	_refreshImages();

	return {
		background: _backgroundImage,
		availableBackgrounds: _backgroundImages,
		isLoadingImages: _isLoadingImages
	};
};