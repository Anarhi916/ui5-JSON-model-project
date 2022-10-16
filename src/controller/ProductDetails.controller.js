sap.ui.define(
  ["suppliers/products/application/controller/BaseController.controller"],
  function (BaseController) {
    "use strict";

    return BaseController.extend(
      "suppliers.products.application.controller.ProductDetails",
      {
        /**
         * Controller's "init" lifecycle method.
         */
        onInit: function () {
          this.myGetRouter()
            .getRoute("ProductDetailsRoute")
            .attachPatternMatched(this.onPatternMatched, this);
        },

        /**
         * "ProductDetails" route pattern matched event handler. Get binding context of current product and bind data model
         */
        onPatternMatched: function () {
          var oSuppliersModel = this.getView().getModel("suppliers");
          var oAppModel = this.getView().getModel("AppModel");
          var oCtx = oAppModel.getProperty("/oCtxProduct");
          this.getView().setBindingContext(oCtx);
          this.getView().setModel(oSuppliersModel);
        },

        /**
         * Go to "SuppliersOverview" page.
         */
        goToSuppliersOverview: function () {
          this.myGetRouter().navTo("SuppliersOverview");
          var oAppModel = this.getView().getModel("AppModel");
          oAppModel.setProperty("/editMode", false);
        },

        /**
         * Go to "ProductDetails" page.
         */
        goToSuppliersDetails: function () {
          var oAppModel = this.getView().getModel("AppModel");
          var oCtx = oAppModel.getProperty("/oCtx");
          this.myGetRouter().navTo("SupplierDetailsRoute", {
            SupplierID: oCtx.getObject("id"),
          });
        },

        /**
         * "Edit" button event handler.
         * Call function setEditMode() from Base Controller
         */
        onEditPress: function () {
          this.setEditMode();
        },

        /**
         * "Save" button event handler.
         * Call function submitChanges() from Base Controller
         */
        onSubmitChanges: function () {
          this.submitChanges();
        },

        /**
         * "Cancel" button event handler.
         * Call function cancelChanges() from Base Controller
         */
        onCancelChanges: function () {
          this.cancelChanges();
        },

        /**
         * Focus leave from input event handler.
         * Call function validateInputsInEditMode() from Base Controller
         *
         * @param {sap.ui.base.Event} oEvent event object
         */
        onFocusLeaves: function (oEvent) {
          this.validateInputsInEditMode(oEvent);
        },
      }
    );
  }
);
