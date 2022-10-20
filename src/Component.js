sap.ui.define(
    ["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel"],
    function (UIComponent, JSONModel) {
        "use strict";

        return UIComponent.extend("suppliers.products.application.Component", {
            metadata: {
                manifest: "json",
            },

            init: function () {
                UIComponent.prototype.init.apply(this, arguments);
                this.getRouter().initialize();
                const oAppModel = new JSONModel({
                    oCtx: "",
                    oCtxProduct: "",
                    editMode: false,
                    copySupplierModel: "",
                    tableMode: "SingleSelectMaster",
                    createMode: false,
                });
                this.setModel(oAppModel, "AppModel");
            },
        });
    }
);
