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
                    this._myGetRouter()
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
                    this._myGetRouter().navTo("SuppliersOverview");
                    var oAppModel = this.getView().getModel("AppModel");
                    oAppModel.setProperty("/editMode", false);
                },

                /**
                 * Go to "ProductDetails" page.
                 */
                goToSuppliersDetails: function () {
                    var oAppModel = this.getView().getModel("AppModel");
                    var oCtx = oAppModel.getProperty("/oCtx");
                    this._myGetRouter().navTo("SupplierDetailsRoute", {
                        SupplierID: oCtx.getObject("id"),
                    });
                },

                /**
                 * "Edit" button event handler.
                 * Call function _setEditMode() from Base Controller
                 */
                onEditPress: function () {
                    this._setEditMode();
                },

                /**
                 * "Save" button event handler.
                 * Call function _submitChanges() from Base Controller
                 */
                on_submitChanges: function () {
                    this._submitChanges();
                },

                /**
                 * "Cancel" button event handler.
                 * Call function _cancelChanges() from Base Controller
                 */
                on_cancelChanges: function () {
                    this._cancelChanges();
                },

                /**
                 * Focus leave from input event handler.
                 * Call function _validateInputsInEditMode() from Base Controller
                 *
                 * @param {sap.ui.base.Event} oEvent event object
                 */
                onFocusLeaves: function (oEvent) {
                    this._validateInputsInEditMode(oEvent);
                },
            }
        );
    }
);
