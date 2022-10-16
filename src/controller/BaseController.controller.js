sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/base/util/deepExtend",
    "sap/m/MessageBox",
  ],
  function (Controller, deepExtend, MessageBox) {
    "use strict";

    return Controller.extend(
      "suppliers.products.application.controller.BaseController",
      {
        /**
         * Get instance of Router
         *
         * @returns {Object}  Instantiates a SAPUI5 Router
         */
        myGetRouter: function () {
          return this.getOwnerComponent().getRouter();
        },

        /**
         * Set page to edit mode
         */
        setEditMode: function () {
          var oAppModel = this.getView().getModel("AppModel");
          oAppModel.setProperty("/editMode", true);
          var oSuppliersModel = this.getView().getModel("suppliers");
          var aSuppliers = deepExtend(
            [],
            oSuppliersModel.getProperty("/suppliers")
          );
          oAppModel.setProperty("/copySupplierModel", aSuppliers);
          oAppModel.setProperty("/tableMode", "MultiSelect");

          var sPath = oAppModel.getProperty("/oCtx").sPath;
          oSuppliersModel.setProperty(`${sPath}/Status`, "Draft");
        },

        /**
         * Save changes in edit or create mode after confirmation from user
         */
        submitChanges: function () {
          if (!this.isDataValid()) {
            let sMessage = this.getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("MessageValidInfo");
            MessageBox.error(sMessage);
          } else {
            var oSuppliersModel = this.getView().getModel("suppliers");
            var oAppModel = this.getView().getModel("AppModel");
            oAppModel.setProperty("/editMode", false);
            oAppModel.setProperty("/tableMode", "SingleSelectMaster");
            var sPath = oAppModel.getProperty("/oCtx").sPath;
            oSuppliersModel.setProperty(`${sPath}/Status`, "");
            oAppModel.setProperty("/createMode", false);
          }
        },

        /**
         *Сancel changes made in edit or create mode
         */
        cancelChanges: function () {
          var oAppModel = this.getView().getModel("AppModel");
          if (oAppModel.getProperty("/createMode") === true) {
            this.deleteSupplier();
          } else {
            var oSuppliersModel = this.getView().getModel("suppliers");
            var sPath = oAppModel.getProperty("/oCtx").sPath;
            var aSuppliers = oAppModel.getProperty("/copySupplierModel");

            let sMessage = this.getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("MessageCancelChanges");
            MessageBox.confirm(sMessage, {
              initialFocus: sap.m.MessageBox.Action.CANCEL,
              onClose: function (sButton) {
                if (sButton === MessageBox.Action.OK) {
                  sap.ui.getCore().getMessageManager().removeAllMessages();

                  oAppModel.setProperty("/editMode", false);
                  oSuppliersModel.setProperty("/suppliers", aSuppliers);
                  oSuppliersModel.setProperty(`${sPath}/Status`, "");
                  this.clearDataValidation();
                  oAppModel.setProperty("/tableMode", "SingleSelectMaster");
                }
              }.bind(this),
            });
          }
        },

        /**
         * Live check that the input field is not empty in edit or create mode
         * @param {sap.ui.base.Event} oEvent event object
         */
        validateInputsInEditMode: function (oEvent) {
          var oSource = oEvent.getSource();
          var sValue;
          if (oSource.isA("sap.m.Select")) {
            sValue = oSource.getSelectedKey();
          } else {
            sValue = oSource.getValue();
          }
          if (sValue.length < 1) {
            oSource.setValueState("Error");
            let sMessage = this.getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("MessageWhenEmptyValue");
            MessageBox.error(sMessage);
            oSource.setValueStateText(sMessage);
          } else {
            oSource.setValueState();
            oSource.setValueStateText();
          }

          var sPath = oSource.getBindingContext().sPath;
          var oSuppliersModel = this.getView().getModel("suppliers");
          var sPropertyName;
          if (oSource.isA("sap.m.Select")) {
            sPropertyName = oSource
              .getBindingInfo("selectedKey")
              .binding.getPath();
          } else {
            sPropertyName = oSource.getBindingInfo("value").binding.getPath();
          }
          oSuppliersModel.setProperty(`${sPath}/${sPropertyName}`, sValue);
        },

        /**
         * Check that the mandatory input field is not empty in create mode
         *
         * @returns {Boolean}  false if even 1 input is empty
         */
        isDataValid: function () {
          var aDataInputs = this.getView()
            .getControlsByFieldGroupId("inputsEditMode")
            .filter((c) => {
              if (
                c.isA("sap.m.DateTimePicker") ||
                c.isA("sap.m.Input") ||
                c.isA("sap.m.TextArea") ||
                c.isA("sap.m.Select")
              ) {
                return true;
              }
            });
          let oInputSupplierName = this.getView().byId("idInputSupplierName");
          let oSelectCountry = this.getView().byId("idSelectCountry");
          let oInputState = this.getView().byId("idInputState");
          let oInputCity = this.getView().byId("idInputCity");
          for (var i in aDataInputs) {
            let oDataInput = aDataInputs[i];
            if (
              (!oDataInput.isA("sap.m.Select") &&
                oDataInput.getValue().length < 1 &&
                (oDataInput === oInputSupplierName ||
                  oDataInput === oInputState ||
                  oDataInput === oInputCity ||
                  oDataInput.getProperty("placeholder") ===
                    "Enter product name")) ||
              (oDataInput === oSelectCountry &&
                oDataInput.getSelectedKey() === "")
            ) {
              oDataInput.setValueState("Error");
              let sMessage = this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("MessageWhenEmptyValue");
              oDataInput.setValueStateText(sMessage);
            }
          }
          for (var i in aDataInputs) {
            let oDataInput = aDataInputs[i];
            if (oDataInput.getValueState() === "Error") {
              return false;
            }
          }
          return true;
        },

        /**
         * Clear inputs from validation notations after canceling from edit mode
         */
        clearDataValidation: function () {
          var aDataInputs = this.getView()
            .getControlsByFieldGroupId("inputsEditMode")
            .filter((c) => {
              if (
                c.isA("sap.m.DateTimePicker") ||
                c.isA("sap.m.Input") ||
                c.isA("sap.m.TextArea") ||
                c.isA("sap.m.Select")
              ) {
                return true;
              }
            });
          for (var i in aDataInputs) {
            aDataInputs[i].setValueState();
            aDataInputs[i].setValueStateText();
          }
        },

        /**
         * Delete current supplier
         */
        deleteSupplier: function () {
          let sMessage = this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("MessageDeleteSupplier");
          MessageBox.confirm(sMessage, {
            initialFocus: sap.m.MessageBox.Action.CANCEL,
            onClose: function (sButton) {
              if (sButton === MessageBox.Action.OK) {
                var oSuppliersModel = this.getView().getModel("suppliers");
                var oAppModel = this.getView().getModel("AppModel");
                var sPath = oAppModel.getProperty("/oCtx").getPath();
                var aSuppliers = deepExtend(
                  [],
                  oSuppliersModel.getProperty("/suppliers")
                );
                var oDeletingSupplier = oSuppliersModel.getProperty(sPath);
                oSuppliersModel.setProperty(
                  "/suppliers",
                  aSuppliers.filter((item) => item.id !== oDeletingSupplier.id)
                );
                this.goToSuppliersOverview();
              }
            }.bind(this),
          });
        },
      }
    );
  }
);
