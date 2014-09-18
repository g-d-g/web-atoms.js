﻿/// <reference path="AtomControl.js" />

(function (base) {
    return classCreatorEx(
    {
        name: "WebAtoms.AtomButton",
        base: base,
        start: function (e) {
            this._sendData = false;
            $(e).addClass("atom-button");
        },
        properties: {
            sendData: false
        },
        methods: {
            onClickHandler: function (e) {

                AtomUI.cancelEvent(e);

                if (this._next) {
                    if (this._sendData && this._next) {
                        AtomBinder.setValue(this._next, "data", this.get_data());
                    }
                    this.invokeAction(this._next);
                }
                return false;
            },

            init: function () {

                var element = this._element;
                this.bindEvent(element, "click", "onClickHandler");
                base.init.apply(this);
            }
        }

    });
})(WebAtoms.AtomControl.prototype);