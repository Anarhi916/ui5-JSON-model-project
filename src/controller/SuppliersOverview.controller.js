sap.ui.define(
    [
        "suppliers/products/application/controller/BaseController.controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/Fragment",
        "sap/ui/model/Filter",
        "sap/base/util/deepExtend",
        "sap/m/MessageBox",
    ],
    function (
        BaseController,
        JSONModel,
        Fragment,
        Filter,
        deepExtend,
        MessageBox
    ) {
        "use strict";

        return BaseController.extend(
            "suppliers.products.application.controller.SuppliersOverview",
            {
                /**
                 * Controller's "init" lifecycle method.
                 */
                onInit: function () {
                    this.myGetRouter()
                        .getRoute("SuppliersOverview")
                        .attachPatternMatched(this.onPatternMatched, this);
                    this._oMultiInput = this.getView().byId("multiInput");
                    var oSuppliersOverviewModel = new JSONModel({
                        isDeleteButtonEnabled: false,
                        countTableRows: null,
                    });
                    this._oSuppliersOverviewModel = oSuppliersOverviewModel;
                    this.getView().setModel(
                        oSuppliersOverviewModel,
                        "SuppliersOverview"
                    );
                },

                /**
                 * Call function to set table counter after page rendered
                 */
                onPatternMatched: function () {
                    this.setTableCounter();
                },

                /**
                 * Count items in the table
                 */
                setTableCounter: function () {
                    var oTable = this.getView().byId("idTableSuppliers");
                    var count = oTable.getAggregation("items").length;
                    this._oSuppliersOverviewModel.setProperty(
                        "/countTableRows",
                        count
                    );
                },

                /**
                 * Open dialog with list of Cities after press icon ValueHelp in input "enter city"
                 */
                onValueHelpRequested: function () {
                    var oFilterModel = this.getView().getModel("filterData");
                    Fragment.load({
                        name: "suppliers.products.application.view.fragments.ValueHelpDialog",
                        controller: this,
                    }).then(
                        function () {
                            this._oValueHelpDialog = sap.ui.xmlfragment(
                                "suppliers.products.application.view.fragments.ValueHelpDialog",
                                this
                            );
                            this.getView().addDependent(this._oValueHelpDialog);

                            this._oValueHelpDialog.getTableAsync().then(
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
                                    this._oValueHelpDialog.update();
                                }.bind(this)
                            );

                            this._oValueHelpDialog.setTokens(
                                this._oMultiInput.getTokens()
                            );
                            this._oValueHelpDialog.open();
                        }.bind(this)
                    );
                },

                /**
                 *"OK" button press event handler (in the dialog adding city).
                 *
                 * @param {sap.ui.base.Event} oEvent event object
                 */
                onValueHelpOkPress: function (oEvent) {
                    var aTokens = oEvent.getParameter("tokens");
                    this._oMultiInput.setTokens(aTokens);
                    this._oValueHelpDialog.close();
                },

                /**
                 * "Cancel" button press event handler (in the dialog adding city).
                 */
                onValueHelpCancelPress: function () {
                    this._oValueHelpDialog.close();
                },

                /**
                 * After close event handler (in the dialog adding city).
                 */
                onValueHelpAfterClose: function () {
                    this._oValueHelpDialog.destroy();
                },

                /**
                 * Searching among suppliers list event handler.
                 */
                onSearch: function () {
                    var oTable = this.getView().byId("idTableSuppliers");
                    var oBinding = oTable.getBinding("items");
                    oBinding.filter(this.getFilters());
                    this.setTableCounter();
                },

                /**
                 * Get and specify filters for searching function
                 * @returns {Array} Array of filters
                 */
                getFilters: function () {
                    var aFilters = [];
                    var oSearchName = this.getView().byId("idSearch");
                    var oSelectCountry = this.getView().byId("idSelectCountry");
                    var sQuerySearch = oSearchName.getValue();
                    var sQuerySelectCountry = oSelectCountry.getSelectedKeys();
                    var sQuerySelectCity = [];
                    this._oMultiInput.getTokens().forEach(function (oToken) {
                        sQuerySelectCity.push(oToken.getText());
                    });
                    let filterName = new Filter(
                        "Name",
                        sap.ui.model.FilterOperator.Contains,
                        sQuerySearch
                    );
                    aFilters.push(filterName);
                    sQuerySelectCountry.forEach((query) => {
                        let filter = new Filter(
                            "Address/Country",
                            sap.ui.model.FilterOperator.Contains,
                            query
                        );
                        aFilters.push(filter);
                    });

                    sQuerySelectCity.forEach((query) => {
                        let filter = new Filter(
                            "Address/City",
                            sap.ui.model.FilterOperator.Contains,
                            query
                        );
                        aFilters.push(filter);
                    });

                    return aFilters;
                },

                /**
                 * Clear input fields in the filter bar, "Clear" button press event handler
                 */
                onClear: function () {
                    var oSearchName = this.getView().byId("idSearch");
                    var oSelectCountry = this.getView().byId("idSelectCountry");
                    oSearchName.setValue("");
                    oSelectCountry.removeAllSelectedItems();
                    this._oMultiInput.destroyTokens();
                },

                /**
                 * Table item selection event handler
                 *
                 * @param {sap.ui.base.Event} oEvent event object
                 */
                onTableItemChecked: function (oEvent) {
                    var oTable = this.getView().byId("idTableSuppliers");

                    if (oTable.getSelectedItems().length) {
                        this._oSuppliersOverviewModel.setProperty(
                            "/isDeleteButtonEnabled",
                            true
                        );
                    } else {
                        this._oSuppliersOverviewModel.setProperty(
                            "/isDeleteButtonEnabled",
                            false
                        );
                    }
                },

                /**
                 * Table item press event handler
                 *
                 * {sap.ui.base.Event} oEvent event object
                 */
                onTableItemPressed: function (oEvent) {
                    var oTable = this.getView().byId("idTableSuppliers");
                    var oSelectedListItem = oEvent.getParameter("listItem");
                    var oCtx = oSelectedListItem.getBindingContext("suppliers");
                    var oAppModel = this.getView().getModel("AppModel");
                    oAppModel.setProperty("/oCtx", oCtx);
                    oTable.removeSelections();
                    this._oSuppliersOverviewModel.setProperty(
                        "/isDeleteButtonEnabled",
                        false
                    );
                    this.myGetRouter().navTo("SupplierDetailsRoute", {
                        SupplierID: oCtx.getObject("id"),
                    });
                },

                /**
                 * Delete selected suppliers, "delete" button press event handler
                 */
                onDeleteSuppliersPress: function () {
                    let sMessage = this.getView()
                        .getModel("i18n")
                        .getResourceBundle()
                        .getText("MessageDeleteSuppliers");
                    MessageBox.confirm(sMessage, {
                        initialFocus: sap.m.MessageBox.Action.CANCEL,
                        onClose: function (sButton) {
                            if (sButton === MessageBox.Action.OK) {
                                var oTable =
                                    this.getView().byId("idTableSuppliers");
                                var oSuppliersModel =
                                    this.getView().getModel("suppliers");
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
                                var aSuppliers = deepExtend(
                                    [],
                                    oSuppliersModel.getProperty("/suppliers")
                                );
                                var oDeletingSuppliers = [];
                                for (
                                    let i = 0;
                                    i < aPathsToDelete.length;
                                    i++
                                ) {
                                    oDeletingSuppliers.push(
                                        oSuppliersModel.getProperty(
                                            aPathsToDelete[i]
                                        )
                                    );
                                }
                                oSuppliersModel.setProperty(
                                    "/suppliers",
                                    aSuppliers.filter((item) => {
                                        let bResult = true;
                                        for (
                                            let i = 0;
                                            i < oDeletingSuppliers.length;
                                            i++
                                        ) {
                                            if (
                                                item.Name ===
                                                oDeletingSuppliers[i].Name
                                            ) {
                                                bResult = false;
                                            }
                                        }
                                        return bResult;
                                    })
                                );
                                oTable.removeSelections();
                                this._oSuppliersOverviewModel.setProperty(
                                    "/isDeleteButtonEnabled",
                                    false
                                );
                                this.setTableCounter();
                            }
                        }.bind(this),
                    });
                },

                /**
                 * Create new supplier, "create" button press event handler
                 */
                onCreateSupplierPress: function () {
                    var oTable = this.getView().byId("idTableSuppliers");
                    var oAppModel = this.getView().getModel("AppModel");
                    var oSuppliersModel = this.getView().getModel("suppliers");
                    var aSuppliers = deepExtend(
                        [],
                        oSuppliersModel.getProperty("/suppliers")
                    );
                    var sDate = new Date().toISOString();
                    let oNewSupplier = {
                        Name: "",
                        Status: "Unsaved draft",
                        Address: {
                            Street: "",
                            City: "",
                            State: "",
                            ZipCode: "",
                            Country: "",
                        },
                        Established: sDate,
                        id: `${aSuppliers.length + 1}`,
                        Products: [],
                    };
                    aSuppliers.push(oNewSupplier);
                    oSuppliersModel.setProperty("/suppliers", aSuppliers);
                    var sPath = `/suppliers/${aSuppliers.length - 1}`;
                    let oCtx = new sap.ui.model.Context(oSuppliersModel, sPath);
                    oAppModel.setProperty("/oCtx", oCtx);
                    oTable.removeSelections();
                    this._oSuppliersOverviewModel.setProperty(
                        "/isDeleteButtonEnabled",
                        false
                    );
                    oAppModel.setProperty("/tableMode", "MultiSelect");
                    this.myGetRouter().navTo("SupplierDetailsRoute", {
                        SupplierID: oCtx.getObject("id"),
                    });
                },
            }
        );
    }
);
