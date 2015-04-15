﻿/// <reference path="../Controls/AtomControl.js" />

(function (baseType) {
    return classCreatorEx({
        name: "WebAtoms.AtomWindow",
        base: baseType,
        start: function () {
            this._presenters = ["windowDiv", "windowTitleDiv", "windowCloseButton", "iframe", "windowPlaceholder"];
        },
        properties: {
            opener: null,
            openerData: null,
            windowTemplate: null,
            isOpen: false,
            windowHeight: 300,
            windowWidth: 500,
            url: undefined,
            title: undefined,
            windowUrl: undefined
        },
        methods: {


            get_openerData: function () {
                var v = this.get_opener();
                if (!v)
                    return;
                return v.get_data();
            },

            onCloseCommand: function (scope, sender) {
                AtomBinder.setValue(this, "isOpen", false);
                var val = this._value;
                var caller = this;
                this._value = null;

                WebAtoms.dispatcher.callLater(function () {
                    AtomBinder.setValue(caller, "value", val);
                    caller.invokeAction(caller._next);
                    caller.disposeChildren(caller._element);
                });
            },

            refresh: function (scope, sender) {
                this.openWindow(scope, sender);
            },

            openWindow: function (scope, sender) {

                var tt = this.getTemplate("frameTemplate");

                tt = AtomUI.cloneNode(tt);

                var tt$ = $(tt);

                var wdiv = tt$.find("[data-atom-presenter=windowDiv],[atom-presenter=windowDiv]").get(0);
                var wtitle = tt$.find("[data-atom-presenter=windowTitleDiv],[atom-presenter=windowTitleDiv]").get(0);

                var wt = this.getTemplate("windowTemplate");

                $(wt).addClass("atom-window-template");

                if (!(AtomUI.attr(wt, "atom-dock"))) {
                    AtomUI.attr(wt, "atom-dock", "Fill");
                }

                if (wt.length) {
                    for (var i = 0; i < wt.length; i++) {
                        wdiv.appendChild(wt[i]);
                    }
                } else {
                    wdiv.appendChild(wt);
                }

                var wct = this.getTemplate("commandTemplate");
                if (wct) {
                    AtomUI.attr(wct, "atom-dock", "Bottom");
                    wct.setAttribute("class", "atom-wizard-command-bar");
                    wdiv.appendChild(wct);
                }

                this.set_innerTemplate(tt);

                if (this._iframe) {
                    this._iframe.atomWindow = this;
                }

                if (sender) {
                    this._opener = sender;
                    AtomBinder.refreshValue(this, "opener");
                    AtomBinder.refreshValue(this, "openerData");
                }

                var _this = this;
                WebAtoms.dispatcher.callLater(function () {
                    AtomBinder.setValue(_this, "isOpen", true);
                    if (!_this._url) {
                        var children = $(_this._windowPlaceholder).find("input");
                        if (children.length > 0) {
                            var item = children.get(0);
                            try {
                                item.focus();
                            } catch (er) {
                            }
                        }
                    }
                });
            },

            init: function () {



                $(this._element).addClass("atom-window-placeholder");
                baseType.init.call(this);

                var _this = this;
                this.closeCommand = function () {
                    _this.onCloseCommand.apply(_this, arguments);
                };

                this.openCommand = function () {
                    _this.openWindow.apply(_this, arguments);
                };

                WebAtoms.dispatcher.callLater(function () {
                    var e = _this._element;
                    if (!e._logicalParent) {
                        e._logicalParent = e.parentNode;
                        $(e).remove();
                        document.body.appendChild(e);
                    }
                });
            }
        }
    });
})(WebAtoms.AtomControl.prototype);


WebAtoms.AtomWindow.openNewWindow = function (c) {
    var e1 = document.createElement("DIV");
    var id = AtomUI.assignID(e1);
    if (c.localScope) {
        e1.setAttribute("data-atom-local-scope", "true");
    }
    e1._logicalParent = c.opener;
    document.body.appendChild(e1);

    var w = AtomUI.createControl(e1, WebAtoms.AtomWindow);

    w._next = [c.next || {}, function () {
        WebAtoms.dispatcher.callLater(function () {
            w.dispose();
            $(e1).remove();
        });
    }];

    var url = new AtomUri(c.url);

    var wt = Atom.get(c.scope, url.path);

    var $wt = $( AtomUI.cloneNode(wt));
    var ct = $wt.children("[atom-template=commandTemplate],[data-atom-template=commandTemplate]").get(0);
    if (ct) {
        AtomUI.removeAttr(ct, "atom-template");
        w._commandTemplate = ct;
        $(ct).remove();
    }

    ct = $wt.children("[atom-template=windowTemplate],[data-atom-template=windowTemplate]").get(0);
    if (ct) {
        AtomUI.removeAttr(ct, "atom-template");
        w._windowTemplate = ct;
    } else {
        AtomUI.removeAttr(wt, "atom-template");
        w._windowTemplate = wt;
    }


    w.init();

    WebAtoms.dispatcher.callLater(function () { 
        var scope = w.get_scope();

        var hash = url.hash;
        for (var i in hash) {
            if (hash.hasOwnProperty(i))
                Atom.set(scope, i, hash[i]);
        }

        var query = url.query;
        for (var i in query) {
            if (query.hasOwnProperty(i))
                Atom.set(w, i, query[i]);
        }

        w.openWindow(c.scope, c.opener);
    });
};