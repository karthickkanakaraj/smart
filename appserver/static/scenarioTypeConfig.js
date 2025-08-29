//# sourceURL=scenarioTypeConfig.js

require.config({
  paths: {
    text: "../app/SMART/lib/text",
    SimpleSMARTView: "../app/SMART/lib/SimpleSMARTView",
    helpers: "../app/SMART/lib/helpers/",
    cocktail: "../app/SMART/lib/Cocktail/Cocktail-0.5.15.min",
    mixins: "../app/SMART/lib/mixins",
  },
});

require([
  "jquery",
  "SimpleSMARTView",
  "text!../app/SMART/scenarioTypeConfig.html",
  "helpers/ajax",
], function ($, SimpleSMARTView, template, ajax) {
  const collection = "SMART-ScenarioTypes";

  const dataTables = [
    {
      elementId: "#table",
      options: {
        filterByRole: false,
        columns: [
          { title: "Scenario Type Code" },
          { title: "Scenario Type Name" },
          { title: "Actions", bSortable: false, searchable: false },
        ],
        ajax: {
          url: ajax.makeSMARTCollectionURL(collection),
          dataSrc: (json) =>
            json.map(
              ({ _key, ScenarioTypeCode, ScenarioTypeName }) => {
                const EditAction = `<a class="action_edit" data-key="${_key}">Edit</a>`;
                const DeleteAction = `<a class="action_delete" data-key="${_key}">Delete</a>`;
                const Actions = `${EditAction} | ${DeleteAction}`;
                return [ScenarioTypeCode, ScenarioTypeName, Actions];
              }
            ),
        },
      },
    },
  ];

  const modal = {
    // appears as header on modal
    dialogTitle: "Scenario Type",

    // triggers on modal focus in any mode
    onFocusFn: () => {},

    // triggers on modal focus in Add mode
    onFocus_AddFn: () => $("#ScenarioTypeCode").focus(),

    // triggers on modal focus in Edit mode
    onFocus_EditFn: () => $("#ScenarioTypeName").focus(),

    // triggers on modal focus in Delete mode
    onFocus_DeleteFn: () => {},

    // sets modal for any mode
    prepareModalFn: () => {},

    // sets modal for Add mode
    prepareModal_AddFn: () => {
      $("#ScenarioTypeCode").val("").change();
      $("#ScenarioTypeName").val("").change();

      $("#ScenarioTypeCode").prop("disabled", false);
      $("#ScenarioTypeName").prop("disabled", false);
    },

    // sets modal for Edit mode
    prepareModal_EditFn: (record) => {
      $("#ScenarioTypeCode").val(record.ScenarioTypeCode).change();
      $("#ScenarioTypeName").val(record.ScenarioTypeName).change();

      $("#ScenarioTypeCode").prop("disabled", true);
      $("#ScenarioTypeName").prop("disabled", false);
    },

    // sets modal for Delete mode
    prepareModal_DeleteFn: (record) => {
      $("#ScenarioTypeCode").val(record.ScenarioTypeCode).change();
      $("#ScenarioTypeName").val(record.ScenarioTypeName).change();

      $("#ScenarioTypeCode").prop("disabled", true);
      $("#ScenarioTypeName").prop("disabled", true);
    },

    // creates record object from form data
    buildRecordFn: () => ({
      ScenarioTypeCode: $("#ScenarioTypeCode").val().trim(),
      ScenarioTypeName: $("#ScenarioTypeName").val().trim(),
    }),

    // argument is result of buildRecordFn()
    formValidationFn: ({ _key, ScenarioTypeCode, ScenarioTypeName }) => {
      let isValid = true;

      // Similiar object doesn't already exist in collection
      const isUniqueCode = ajax.isUniqueSMARTRecord(collection, {
        _key,
        ScenarioTypeCode,
      });

      if (!ScenarioTypeCode || !isUniqueCode) {
        $("#ScenarioTypeCodeError")
          .text("Valid Scenario Type Code required")
          .css("visibility", "visible");
        $("#ScenarioTypeCode").focus();
        isValid = false;
      }

      // Similiar object doesn't already exist in collection
      const isUniqueName = ajax.isUniqueSMARTRecord(collection, {
        _key,
        ScenarioTypeName,
      });

      // field is not empty
      if (!ScenarioTypeName || !isUniqueName) {
        $("#ScenarioTypeNameError")
          .text("Valid Scenario Type Name required")
          .css("visibility", "visible");
        $("#ScenarioTypeName").focus();
        isValid = false;
      }

      // passed all the checks
      return isValid;
    },
  };

  const scenarioTypeConfigView = new SimpleSMARTView({
    el: $("#ScenarioTypes"),
    template,
    collection,
    dataTables,
    modal,
  });

  scenarioTypeConfigView.render();
});
