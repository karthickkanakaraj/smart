//# sourceURL=lib/mixins/ModalMixin.js

require.config({
  paths: {
    text: "../app/SMART/lib/text",
  },
});

const ModalModes = {
  ADD: "ModalModes.ADD",
  EDIT: "ModalModes.EDIT",
  DELETE: "ModalModes.DELETE",
  VIEW: "ModalModes.VIEW",
};

define([
  "css!../app/SMART/lib/DataTables/css/dataTables.bootstrap.css",
], function () {
  return {
    defaults: {
      modal: {
        el: ".modal",
      },
    },

    events: {
      "click #AddButton": "onAddButton",
      "click .action_edit": "onEditAction",
      "click .action_delete": "onDeleteAction",
      "click .action_view": "onViewAction",
      "shown .modal": "onFocusModal",
      "click #ModalSubmitButton": "onSubmitButton",
    },

    initialize: function () {
      if (!this.options.modal.dialogTitle)
        throw "[Invalid Option]: 'modal.dialogTitle' is undefined.";

      if (!this.options.modal.buildRecordFn)
        throw "[Invalid Option]: 'modal.buildRecordFn' is undefined.";

      this.modal = { ...this.defaults.modal, ...this.options.modal };

      this.disableEnterKeyInModal();
    },

    disableEnterKeyInModal: function () {
      $(this.modal.el).ready(() => {
        $(this.modal.el).keydown((event) => {
          if (event.target.nodeName == "TEXTAREA") return true;
          if (event.key == "Enter") {
            event.preventDefault();
            return false;
          }
        });
      });
    },

    onAddButton: function (event) {
      if (typeof event.target.attributes.disabled != 'undefined')
         return true;          

      this.showModal(ModalModes.ADD);
    },

    onAction: function (event) {},

    onEditAction: function (event) {
      this.onAction(event);

      const key = $(event.target).data("key");
      if (!key) throw `'data-key' attribute is undefined for action element.`;

      $(this.modal.el).data("key", key);
      this.showModal(ModalModes.EDIT);
    },

    onDeleteAction: function (event) {
      this.onAction(event);

      const key = $(event.target).data("key");
      if (!key) throw `'data-key' attribute is undefined for action element.`;

      $(this.modal.el).data("key", key);
      this.showModal(ModalModes.DELETE);
    },

    onViewAction: function (event) {
      this.onAction(event);

      const key = $(event.target).data("key");
      if (!key) throw `'data-key' attribute is undefined for action element.`;

      $(this.modal.el).data("key", key);
      this.showModal(ModalModes.VIEW);
    },

    onFocusModal: function () {
      if (this.modal.onFocusFn) this.modal.onFocusFn();

      const modalMode = this.getModalMode();

      switch (modalMode) {
        case ModalModes.ADD:
          if (this.modal.onFocus_AddFn) this.modal.onFocus_AddFn();
          break;

        case ModalModes.EDIT:
          if (this.modal.onFocus_EditFn) this.modal.onFocus_EditFn();
          break;

        case ModalModes.DELETE:
        case ModalModes.VIEW:
          if (this.modal.onFocus_DeleteFn) this.modal.onFocus_DeleteFn();
          break;
      }
    },

    getModalDataAttribute(attribute) {
      const data = $(this.modal.el).data(attribute);
      if (!data) throw `'data-${attribute}' attribute is undefined for modal.`;
      return data;
    },

    // gets mode from modal element
    getModalMode() {
      return this.getModalDataAttribute("mode");
    },

    // gets record key from modal element
    getModalKey() {
      return this.getModalDataAttribute("key");
    },

    prepareModal: function (mode) {
      if (this.modal.prepareModalFn) this.modal.prepareModalFn();

      if (mode == ModalModes.ADD) {
        this.prepareModal_Add();
        return;
      }

      const key = this.getModalKey();
      const record = this.getRecord(key);

      if (mode == ModalModes.EDIT) {
        this.prepareModal_Edit(record);
        return;
      }

      if (mode == ModalModes.DELETE) {
        this.prepareModal_Delete(record);
        return;
      }

      if (mode == ModalModes.VIEW) {
        this.prepareModal_View(record, mode);
        return;
      }
    },

    prepareModal_Add: function () {
      $("#dialog-title").text(`Add ${this.modal.dialogTitle}`);
      $("#ModalSubmitButton").text("Add");
      // run custom function (if exists)
      if (this.modal.prepareModal_AddFn) this.modal.prepareModal_AddFn();
    },

    prepareModal_Edit: function (record) {
      $("#dialog-title").text(`Edit ${this.modal.dialogTitle}`);
      $("#ModalSubmitButton").text("Save");
      // run custom function (if exists)
      if (this.modal.prepareModal_EditFn)
        this.modal.prepareModal_EditFn(record);
    },

    prepareModal_Delete: function (record) {
      $("#dialog-title").text(`Delete ${this.modal.dialogTitle}`);
      $("#ModalSubmitButton").text("Delete");
      // run custom function (if exists)
      if (this.modal.prepareModal_DeleteFn)
        this.modal.prepareModal_DeleteFn(record);
    },

    prepareModal_View: function (record) {
      $("#dialog-title").text(`View ${this.modal.dialogTitle}`);
      $("#ModalSubmitButton").text("OK");
      $("#ModalCancelButton").hide();
    },
    
    showModal: function (mode) {
      // set modal mode on element
      $(this.modal.el).data("mode", mode);

      // set the modal depending on modes
      this.prepareModal(mode);

      // hide all error messages
      $(".modal-error").text("").css("visibility", "hidden");

      $(this.modal.el).modal();
    },

    validateForm: function (record) {
      // run custom validation (if exists)
      if (this.modal.formValidationFn)
        return this.modal.formValidationFn(record);
      // pass (no validation)
      else return true;
    },

    // triggered by modal form save/delete button
    onSubmitButton: function () {
      // hide modal error messages
      $(".modal-error").text("").css("visibility", "hidden");

      const modalMode = this.getModalMode();
      // create record object from form data
      const record = this.modal.buildRecordFn();

      // send request via AJAX REST
      switch (modalMode) {
        case ModalModes.ADD:
          // validation
          if (!this.validateForm(record)) return false;
          record._key = this.addRecord(record)._key;
          $(this.modal.el).data("key", record._key);
          break;
        case ModalModes.EDIT:
          // validation
          record._key = this.getModalKey();
          if (!this.validateForm(record)) return false;
          this.updateRecord(record._key, record);
          break;
        case ModalModes.DELETE:
          this.deleteRecord(this.getModalKey());
          break;
        case ModalModes.VIEW:
          $("#ModalCancelButton").show();
          break;
        default:
          throw `Modal mode is invalid.`;
      }

      this.reloadDataTables();

      $(this.modal.el).modal("hide");
    },

    render: function () {
      $("#AddButton").text(`Add ${this.modal.dialogTitle}`);

      const editScenarioRoles = this.userFunctions.filter((role) => (role.match('scenario_edit')));
      
      if (editScenarioRoles.length == 0) {
         $("#AddButton").attr("disabled","disabled");
         $("#AddButton").off("click");          
      }      
    },
  };
});
