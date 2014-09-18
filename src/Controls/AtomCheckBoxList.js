﻿/// <reference path="AtomItemsControl.js" />

(function (base) {
    return classCreatorEx(
    {
        name: "WebAtoms.AtomCheckBoxList",
        base: base,
        start: function () {
            this._allowMultipleSelection = true;
            this._valueSeparator = ", ";
            this._dataElements = [];
        },
        methods: {
            init: function () {
                base.init.call(this);
                $(this._element).addClass("atom-check-box-list");
            }
        }
    });
})(WebAtoms.AtomItemsControl.prototype);

