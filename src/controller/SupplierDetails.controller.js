sap.ui.define(
    [
        "suppliers/products/application/controller/BaseController.controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/MessageBox",
        "sap/ui/core/Fragment",
        "sap/base/util/deepExtend",
    ],
    function (
        BaseController,
        JSONModel,
        Filter,
        FilterOperator,
        MessageBox,
        Fragment,
        deepExtend
    ) {
        "use strict";

        return BaseController.extend(
            "suppliers.products.application.controller.SupplierDetails",
            {
                /**
                 * Controller's "init" lifecycle method.
                 */
                onInit: function () {
                    this.myGetRouter()
                        .getRoute("SupplierDetailsRoute")
                        .attachPatternMatched(this.onPatternMatched, this);
                    var oSuppliersDetailsModel = new JSONModel({
                        countTableRows: null,
                        supplierID: null,
                        isDeleteButtonEnabled: false,
                    });
                    this._oSuppliersDetailsModel = oSuppliersDetailsModel;

                    this.getView().setModel(
                        oSuppliersDetailsModel,
                        "SuppliersDetails"
                    );
                },

                /**
                 * "SuppliersDetails" route pattern matched event handler. Get id and binding context of current supplier and bind data model
                 *
                 * @param {sap.ui.base.Event} oEvent event object.
                 */
                onPatternMatched: function (oEvent) {
                    var mRouteArguments = oEvent.getParameter("arguments");
                    var sSupplierID = mRouteArguments.SupplierID;
                    this._oSuppliersDetailsModel.setProperty(
                        "/supplierID",
                        sSupplierID
                    );
                    var oSuppliersModel = this.getView().getModel("suppliers");
                    var oAppModel = this.getView().getModel("AppModel");
                    var oCtx = oAppModel.getProperty("/oCtx");
                    this.getView().setBindingContext(oCtx);
                    this.getView().setModel(oSuppliersModel);
                    this.setCounter();
                    this.SetMode();
                },

                /**
                 * Set certain mode(read, edit or create) depending from supplier status
                 */
                SetMode: function () {
                    var oAppModel = this.getView().getModel("AppModel");
                    var oSuppliersModel = this.getView().getModel("suppliers");
                    var sPath = oAppModel.getProperty("/oCtx").sPath;
                    var sStatus = oSuppliersModel.getProperty(
                        `${sPath}/Status`
                    );
                    if (sStatus === "Draft") {
                        oAppModel.setProperty("/editMode", true);
                    } else if (sStatus === "Unsaved draft") {
                        oAppModel.setProperty("/editMode", true);
                        oAppModel.setProperty("/createMode", true);
                        oAppModel.setProperty("/tableMode", "MultiSelect");
                    }
                },

                /**
                 * Count items in the table
                 */
                setCounter: function () {
                    var table = this.getView().byId("idTableProducts");
                    var count = table.getAggregation("items").length;
                    this._oSuppliersDetailsModel.setProperty(
                        "/countTableRows",
                        count
                    );
                },

                /**
                 * Go to "SuppliersOverview" page.
                 */
                goToSuppliersOverview: function () {
                    var oTable = this.getView().byId("idTableProducts");
                    var oAppModel = this.getView().getModel("AppModel");
                    oAppModel.setProperty("/editMode", false);
                    oAppModel.setProperty("/createMode", false);
                    oAppModel.setProperty("/tableMode", "SingleSelectMaster");
                    this._oSuppliersDetailsModel.setProperty(
                        "/isDeleteButtonEnabled",
                        false
                    );
                    oTable.removeSelections();
                    this.clearDataValidation();
                    this.myGetRouter().navTo("SuppliersOverview");
                },

                /**
                 * Go to "ProductDetails" page.
                 */
                goToProductDetails: function (oEvent) {
                    var oTable = this.getView().byId("idTableProducts");
                    var oSelectedListItem = oEvent.getParameter("listItem");
                    var oCtx = oSelectedListItem.getBindingContext();
                    var oAppModel = this.getView().getModel("AppModel");
                    oAppModel.setProperty("/oCtxProduct", oCtx);
                    var sSupplierId =
                        this._oSuppliersDetailsModel.getProperty("/supplierID");
                    oTable.removeSelections();
                    this._oSuppliersDetailsModel.setProperty(
                        "/isDeleteButtonEnabled",
                        false
                    );

                    this.myGetRouter().navTo("ProductDetailsRoute", {
                        ProductID: oCtx.getObject("id"),
                        SupplierID: sSupplierId,
                    });
                },

                /**
                 * Table item selection event handler
                 *
                 * @param {sap.ui.base.Event} oEvent event object
                 */
                onTableItemChecked: function (oEvent) {
                    var oTable = this.getView().byId("idTableProducts");
                    if (oTable.getSelectedItems().length) {
                        this._oSuppliersDetailsModel.setProperty(
                            "/isDeleteButtonEnabled",
                            true
                        );
                    } else {
                        this._oSuppliersDetailsModel.setProperty(
                            "/isDeleteButtonEnabled",
                            false
                        );
                    }
                },

                /**
                 * Searching among product list event handler
                 *
                 * @param {sap.ui.base.Event} oEvent event object
                 */
                onProductsSearch: function (oEvent) {
                    var oTable = this.getView().byId("idTableProducts");
                    var oItemsBinding = oTable.getBinding("items");

                    var sQuery = oEvent.getParameter("query");

                    var oFilter = new Filter({
                        filters: [
                            new Filter({
                                path: "Name",
                                operator: FilterOperator.Contains,
                                value1: sQuery,
                            }),
                            new Filter({
                                path: "Price",
                                operator: FilterOperator.Contains,
                                value1: sQuery,
                            }),
                            new Filter({
                                path: "Description",
                                operator: FilterOperator.Contains,
                                value1: sQuery,
                            }),
                            new Filter({
                                path: "ReleaseDate",
                                operator: FilterOperator.Contains,
                                value1: sQuery,
                            }),
                            new Filter({
                                path: "DiscontinueDate",
                                operator: FilterOperator.Contains,
                                value1: sQuery,
                            }),
                        ],
                        and: false,
                    });
                    oItemsBinding.filter(oFilter);
                    this.setCounter();
                },

                /**
                 * Validate Date Picker inputs
                 *
                 * @param {sap.ui.base.Event} oEvent event object
                 */
                onDateChanged: function (oEvent) {
                    var oSource = oEvent.getSource();
                    var sValue = oSource.getValue();
                    if (Date.parse(sValue)) {
                        var sPropertyName = oSource
                            .getBindingInfo("value")
                            .binding.getPath();
                        var sPath = oSource.getBindingContext().sPath;
                        var oSuppliersModel =
                            this.getView().getModel("suppliers");
                        if (sPropertyName === "DiscontinueDate") {
                            var sReleaseDate = oSuppliersModel.getProperty(
                                `${sPath}/ReleaseDate`
                            );
                            if (new Date(sReleaseDate) >= new Date(sValue)) {
                                oSource.setValueState("Error");
                                let sMessage = this.getView()
                                    .getModel("i18n")
                                    .getResourceBundle()
                                    .getText("MessageWrongDiscontinuedDate");
                                oSource.setValueStateText(sMessage);
                                MessageBox.error(sMessage);
                            } else {
                                oSource.setValueState();
                                oSource.setValueStateText("");
                            }
                        } else {
                            var sDiscountingDate = oSuppliersModel.getProperty(
                                `${sPath}/DiscontinueDate`
                            );
                            if (
                                new Date(sDiscountingDate) <= new Date(sValue)
                            ) {
                                oSource.setValueState("Error");
                                let sMessage = this.getView()
                                    .getModel("i18n")
                                    .getResourceBundle()
                                    .getText("MessageWrongReleaseDate");
                                oSource.setValueStateText(sMessage);
                                MessageBox.error(sMessage);
                            } else {
                                oSource.setValueState();
                                oSource.setValueStateText("");
                            }
                        }
                    } else {
                        oSource.setValueState("Error");
                        let sMessage = this.getView()
                            .getModel("i18n")
                            .getResourceBundle()
                            .getText("MessageWrongDate");
                        oSource.setValueStateText(sMessage);
                    }
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

                /**
                 * Open dialog with list of States after press icon ValueHelp in input "enter state"
                 */
                onStateValueHelpRequested: function () {
                    var oFilterModel = this.getView().getModel("filterData");
                    Fragment.load({
                        name: "suppliers.products.application.view.fragments.StateValueHelpDialog",
                        controller: this,
                    }).then(
                        function () {
                            this._oStateValueHelpDialog = sap.ui.xmlfragment(
                                "suppliers.products.application.view.fragments.StateValueHelpDialog",
                                this
                            );
                            this.getView().addDependent(
                                this._oStateValueHelpDialog
                            );

                            this._oStateValueHelpDialog.getTableAsync().then(
                                function (oTable) {
                                    oTable.setModel(oFilterModel);
                                    var oColumn = new sap.ui.table.Column({
                                        label: new sap.m.Label({
                                            text: "State",
                                        }),
                                        template: new sap.m.Text({
                                            text: "{State}",
                                        }),
                                    });

                                    if (oTable.bindRows) {
                                        oTable.addColumn(oColumn);
                                        oTable.bindAggregation(
                                            "rows",
                                            "/States"
                                        );
                                    }
                                    this._oStateValueHelpDialog.update();
                                }.bind(this)
                            );
                            this._oStateValueHelpDialog.open();
                        }.bind(this)
                    );
                },

                /**
                 * Open dialog with list of Cities after press icon ValueHelp in input "enter city"
                 */
                onCityValueHelpRequested: function () {
                    var oFilterModel = this.getView().getModel("filterData");
                    Fragment.load({
                        name: "suppliers.products.application.view.fragments.CityValueHelpDialog",
                        controller: this,
                    }).then(
                        function () {
                            this._oCityValueHelpDialog = sap.ui.xmlfragment(
                                "suppliers.products.application.view.fragments.CityValueHelpDialog",
                                this
                            );
                            this.getView().addDependent(
                                this._oCityValueHelpDialog
                            );

                            this._oCityValueHelpDialog.getTableAsync().then(
                                function (oTable) {
                                    oTable.setModel(oFilterModel);
                                    var oColumn = new sap.ui.table.Column({
                                        label: new sap.m.Label({
                                            text: "City",
                                        }),
                                        template: new sap.m.Text({
                                            text: "{City}",
                                        }),
                                    });

                                    if (oTable.bindRows) {
                                        oTable.addColumn(oColumn);
                                        oTable.bindAggregation(
                                            "rows",
                                            "/Сities"
                                        );
                                    }
                                    this._oCityValueHelpDialog.update();
                                }.bind(this)
                            );
                            this._oCityValueHelpDialog.open();
                        }.bind(this)
                    );
                },

                /**
                 *Select certain state event handler (in the dialog select state).
                 *
                 * @param {sap.ui.base.Event} oEvent event object
                 */
                onStateValueHelpOkPress: function (oEvent) {
                    var sQuery = [];
                    var oInput = this.getView().byId("idInputState");
                    var aTokens = oEvent.getParameter("tokens");
                    aTokens.forEach(function (oToken) {
                        sQuery.push(oToken.getText());
                    });
                    oInput.setValue(sQuery[0]);
                    oInput.fireLiveChange();
                    this._oStateValueHelpDialog.close();
                },

                /**
                 *Select certain city event handler (in the dialog select city).
                 *
                 * @param {sap.ui.base.Event} oEvent event object
                 */
                onCityValueHelpOkPress: function (oEvent) {
                    var sQuery = [];
                    var oInput = this.getView().byId("idInputCity");
                    var aTokens = oEvent.getParameter("tokens");
                    aTokens.forEach(function (oToken) {
                        sQuery.push(oToken.getText());
                    });
                    oInput.setValue(sQuery[0]);
                    oInput.fireLiveChange();
                    this._oCityValueHelpDialog.close();
                },

                /**
                 * "Cancel" button press event handler (in the dialog select state).
                 */
                onStateValueHelpCancelPress: function () {
                    this._oStateValueHelpDialog.close();
                },

                /**
                 * "Cancel" button press event handler (in the dialog select city).
                 */
                onCityValueHelpCancelPress: function () {
                    this._oCityValueHelpDialog.close();
                },

                /**
                 * After close event handler (in the dialog select state).
                 */
                onStateValueHelpAfterClose: function () {
                    this._oStateValueHelpDialog.destroy();
                },

                /**
                 * After close event handler (in the dialog select city).
                 */
                onCityValueHelpAfterClose: function () {
                    this._oCityValueHelpDialog.destroy();
                },

                /**
                 * "Delete" current supplier button press event handler.
                 * Call function deleteSupplier() from Base Controller
                 */
                onDeleteSupplierPress: function () {
                    this.deleteSupplier();
                },

                /**
                 * Delete selected products
                 */
                onDeleteProductsPress: function () {
                    let sMessage = this.getView()
                        .getModel("i18n")
                        .getResourceBundle()
                        .getText("MessageDeleteProducts");
                    MessageBox.confirm(sMessage, {
                        initialFocus: sap.m.MessageBox.Action.CANCEL,
                        onClose: function (sButton) {
                            if (sButton === MessageBox.Action.OK) {
                                var oTable =
                                    this.getView().byId("idTableProducts");
                                var oAppModel =
                                    this.getView().getModel("AppModel");
                                var oSuppliersModel =
                                    this.getView().getModel("suppliers");
                                var sPath = oAppModel
                                    .getProperty("/oCtx")
                                    .getPath();
                                var oSelectedContext =
                                    oTable.getSelectedContexts();
                                var aPathsToDelete = [];
                                for (
                                    let i = 0;
                                    i < oSelectedContext.length;
                                    i++
                                ) {
                                    aPathsToDelete.push(
                                        oSelectedContext[i].getPath()
                                    );
                                }
                                var aProducts = deepExtend(
                                    [],
                                    oSuppliersModel.getProperty(
                                        `${sPath}/Products`
                                    )
                                );
                                var oDeletingProducts = [];
                                for (
                                    let i = 0;
                                    i < aPathsToDelete.length;
                                    i++
                                ) {
                                    oDeletingProducts.push(
                                        oSuppliersModel.getProperty(
                                            aPathsToDelete[i]
                                        )
                                    );
                                }
                                oSuppliersModel.setProperty(
                                    `${sPath}/Products`,
                                    aProducts.filter((item) => {
                                        let bResult = true;
                                        for (
                                            let i = 0;
                                            i < oDeletingProducts.length;
                                            i++
                                        ) {
                                            if (
                                                item.id ===
                                                oDeletingProducts[i].id
                                            ) {
                                                bResult = false;
                                            }
                                        }
                                        return bResult;
                                    })
                                );
                                this._oSuppliersDetailsModel.setProperty(
                                    "/isDeleteButtonEnabled",
                                    false
                                );
                                oTable.removeSelections();
                                this.setCounter();
                            }
                        }.bind(this),
                    });
                },

                /**
                 * "Create" button event handler. Create new product
                 */
                onCreateProductPress: function () {
                    var oTable = this.getView().byId("idTableProducts");
                    var oAppModel = this.getView().getModel("AppModel");
                    var oSuppliersModel = this.getView().getModel("suppliers");
                    var sPath = oAppModel.getProperty("/oCtx").getPath();

                    var aProducts = deepExtend(
                        [],
                        oSuppliersModel.getProperty(`${sPath}/Products`)
                    );
                    let sId;
                    if (aProducts.length) {
                        sId = aProducts.length + 1;
                    } else {
                        sId = 1;
                    }
                    let oNewProduct = {
                        Name: "",
                        Price: "",
                        Description: "",
                        Rating: "",
                        ReleaseDate: "",
                        DiscontinueDate: "",
                        id: sId,
                    };
                    aProducts.push(oNewProduct);
                    oSuppliersModel.setProperty(`${sPath}/Products`, aProducts);
                    oTable.removeSelections();
                    this._oSuppliersDetailsModel.setProperty(
                        "/isDeleteButtonEnabled",
                        false
                    );
                    this.setCounter();
                },
            }
        );
    }
);
