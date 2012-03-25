ko.bindingHandlers.imageData = {
	init: function () { },
	update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
		element.src = ko.utils.unwrapObservable(valueAccessor());
	}
};