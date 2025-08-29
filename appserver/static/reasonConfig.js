//# sourceURL=reasonConfig.js

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
  "text!../app/SMART/reasonConfig.html",
  "helpers/ajax",
  "helpers/constants",
  "cocktail",
  "mixins/ScenarioTypeDropdownMixin",
], function (
  $,
  SimpleSMARTView,
  template,
  ajax,
  { PropertyInfo },
  Cocktail,
  ScenarioTypeDropdownMixin
) {
  const collection = "SMART-Reasons";

  const scenarioTypes = ajax.getSMARTCollection("SMART-ScenarioTypes");
  const getScenario = (code) =>
    scenarioTypes.find(({ ScenarioTypeCode }) => ScenarioTypeCode == code);

  const dataTables = [
    {
      elementId: "#table",
      options: {
        columns: [
          { title: "Property" },
          { title: "Scenario Type" },
          { title: "Reason" },
          { title: "Actions", bSortable: false, searchable: false },
        ],
        ajax: {
          url: ajax.makeSMARTCollectionURL(collection),
          dataSrc: (json) =>
            json.map(({ _key, PropertyID, ScenarioTypeCode, ReasonCode }) => {
              const PropertyName = PropertyInfo.Names[PropertyID];
              const { ScenarioTypeName } = getScenario(ScenarioTypeCode);
              const EditAction = `<a class="action_edit" data-key="${_key}">Edit</a>`;
              const DeleteAction = `<a class="action_delete" data-key="${_key}">Delete</a>`;
              const Actions = `${EditAction} | ${DeleteAction}`;
              return [PropertyName, ScenarioTypeName, ReasonCode, Actions];
            }),
        },
      },
    },
  ];

  const modal = {
    // appears as header on modal
    dialogTitle: "Reason",

    // triggers on modal focus in any mode
    onFocusFn: () => {},

    // triggers on modal focus in Add mode
    onFocus_AddFn: () => $("#ReasonCode").focus(),

    // triggers on modal focus in Edit mode
    onFocus_EditFn: () => $("#ReasonCode").focus(),

    // triggers on modal focus in Delete mode
    onFocus_DeleteFn: () => {},

    // sets modal for any mode
    prepareModalFn: () => {},

    // sets modal for Add mode
    prepareModal_AddFn: () => {
      $("#ReasonCode").val("").change();

      $("#PropertyDropdown").prop("disabled", false);
      $("#ScenarioTypeDropdown").prop("disabled", false);
      $("#ReasonCode").prop("disabled", false);
    },

    // sets modal for Edit mode
    prepareModal_EditFn: (record) => {
      $("#PropertyDropdown").val(record.PropertyID).change();
      $("#ScenarioTypeDropdown").val(record.ScenarioTypeCode).change();
      $("#ReasonCode").val(record.ReasonCode).change();

      $("#PropertyDropdown").prop("disabled", true);
      $("#ScenarioTypeDropdown").prop("disabled", true);
      $("#ReasonCode").prop("disabled", false);
    },

    // sets modal for Delete mode
    prepareModal_DeleteFn: (record) => {
      $("#PropertyDropdown").val(record.PropertyID).change();
      $("#ScenarioTypeDropdown").val(record.ScenarioTypeCode).change();
      $("#ReasonCode").val(record.ReasonCode).change();

      $("#PropertyDropdown").prop("disabled", true);
      $("#ScenarioTypeDropdown").prop("disabled", true);
      $("#ReasonCode").prop("disabled", true);
    },

    // creates record object from form data
    buildRecordFn: () => ({
      PropertyID: $("#PropertyDropdown").val(),
      ScenarioTypeCode: $("#ScenarioTypeDropdown").val().trim(),
      ReasonCode: $("#ReasonCode").val().trim(),
    }),

    // returns boolean : if form is valid
    // argument is result of buildRecordFn()
    formValidationFn: ({ _key, PropertyID, ScenarioTypeCode, ReasonCode }) => {
      let isValid = true;

      // field is not empty
      if (!ScenarioTypeCode) {
        $("#ScenarioTypeError")
          .text("Valid Scenario Type required")
          .css("visibility", "visible");
        $("#ScenarioTypeDropdown").focus();
        isValid = false;
      }

      // Similiar object doesn't already exist in collection
      const isUnique = ajax.isUniqueSMARTRecord(collection, {
        _key,
        PropertyID,
        ScenarioTypeCode,
        ReasonCode,
      });

      // field is not empty
      if (!ReasonCode || !isUnique) {
        $("#ReasonCodeError")
          .text("Valid Reason required")
          .css("visibility", "visible");
        $("#ReasonCode").focus();
        isValid = false;
      }

      // passed all the checks
      return isValid;
    },
  };

  Cocktail.mixin(SimpleSMARTView, ScenarioTypeDropdownMixin);

  const reasonConfigView = new SimpleSMARTView({
    el: $("#Reasons"),
    template,
    collection,
    dataTables,
    modal,
  });

  reasonConfigView.render();
});
