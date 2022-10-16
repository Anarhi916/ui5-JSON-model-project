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

        var oAppModel = {
          oCtx: "",
          oCtxProduct: "",
          editMode: false,
          copySupplierModel: "",
          tableMode: "SingleSelectMaster",
          createMode: false,
        };
        var oAppModel = new JSONModel(oAppModel);
        this.setModel(oAppModel, "AppModel");
      },
    });
  }
);
