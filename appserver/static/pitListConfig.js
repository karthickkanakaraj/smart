//# sourceURL=pitListConfig.js

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
  "text!../app/SMART/pitListConfig.html",
  "helpers/ajax",
  "helpers/constants",
  "cocktail",
  "mixins/PitListSelectMixin",
], function (
  $,
  SimpleSMARTView,
  template,
  ajax,
  { PropertyInfo },
  Cocktail,
  PitListSelectMixin
) {
  const collection = "SMART-PitLists";

  const dataTables = [
    {
      elementId: "#table",
      options: {
        columns: [
          { title: "Property" },
          { title: "Pit List Code" },
          { title: "Pits" },
          { title: "Actions", bSortable: false, searchable: false },
        ],
        ajax: {
          url: ajax.makeSMARTCollectionURL(collection),
          dataSrc: (json) =>
            json.map(({ _key, PropertyID, PitListCode, PitListValue }) => {
              const PropertyName = PropertyInfo.Names[PropertyID];
              const EditAction = `<a class="action_edit" data-key="${_key}">Edit</a>`;
              const DeleteAction = `<a class="action_delete" data-key="${_key}">Delete</a>`;
              const Actions = `${EditAction} | ${DeleteAction}`;
              return [PropertyName, PitListCode, PitListValue, Actions];
            }),
        },
      },
    },
  ];

  const modal = {
    // appears as header on modal
    dialogTitle: "Pit List",

    // triggers on modal focus in any mode
    onFocusFn: () => {},

    // triggers on modal focus in Add mode
    onFocus_AddFn: () => $("#PitListCode").focus(),

    // triggers on modal focus in Edit mode
    onFocus_EditFn: () => {},

    // triggers on modal focus in Delete mode
    onFocus_DeleteFn: () => {},

    // sets modal for any mode
    prepareModalFn: () => {},

    // sets modal for Add mode
    prepareModal_AddFn: () => {
      $("#PitListCode").val("").change();

      $("#PropertyDropdown").prop("disabled", false);
      $("#PitListCode").prop("disabled", false);

      $("#PitListSelect .fromList").prop("disabled", false);
      $("#PitListSelect .toList").prop("disabled", false);
      $("#Pit-AddAllButton").prop("disabled", false);
      $("#Pit-AddSomeButton").prop("disabled", false);
      $("#Pit-DeleteSomeButton").prop("disabled", false);
      $("#Pit-DeleteAllButton").prop("disabled", false);
    },

    // sets modal for Edit mode
    prepareModal_EditFn: (record) => {
      $("#PropertyDropdown").val(record.PropertyID).change();
      $("#PitListCode").val(record.PitListCode).change();

      $("#PropertyDropdown").prop("disabled", true);
      $("#PitListCode").prop("disabled", true);

      $("#PitListSelect .fromList").prop("disabled", false);
      $("#PitListSelect .toList").prop("disabled", false);
      $("#Pit-AddAllButton").prop("disabled", false);
      $("#Pit-AddSomeButton").prop("disabled", false);
      $("#Pit-DeleteSomeButton").prop("disabled", false);
      $("#Pit-DeleteAllButton").prop("disabled", false);
    },

    // sets modal for Delete mode
    prepareModal_DeleteFn: (record) => {
      $("#PropertyDropdown").val(record.PropertyID).change();
      $("#PitListCode").val(record.PitListCode).change();

      $("#PropertyDropdown").prop("disabled", true);
      $("#PitListCode").prop("disabled", true);

      $("#PitListSelect .fromList").prop("disabled", true);
      $("#PitListSelect .toList").prop("disabled", true);
      $("#Pit-AddAllButton").prop("disabled", true);
      $("#Pit-AddSomeButton").prop("disabled", true);
      $("#Pit-DeleteSomeButton").prop("disabled", true);
      $("#Pit-DeleteAllButton").prop("disabled", true);
    },

    // creates record object from form data
    buildRecordFn: () => ({
      PropertyID: $("#PropertyDropdown").val(),
      PitListCode: $("#PitListCode").val().trim().toUpperCase(),
      PitListValue: $("#PitListSelect .toList option")
        .map((index, { value }) => value)
        .toArray()
        .join(","),
    }),

    // argument is result of buildRecordFn()
    formValidationFn: ({ _key, PropertyID, PitListCode }) => {
      let isValid = true;

      // Similiar object doesn't already exist in collection
      const isUnique = ajax.isUniqueSMARTRecord(collection, {
        _key,
        PropertyID,
        PitListCode,
      });

      // field not empty
      if (!PitListCode || !isUnique) {
        $("#PitListCodeError")
          .text("Valid Pit List Code required")
          .css("visibility", "visible");
        $("#PitListCode").focus();
        isValid = false;
      }

      // passed all the checks
      return isValid;
    },
  };

  const pitListSelect = {
    // returns pits to be preselected
    getSelectedPitsFn: () => {
      // returning pits from current PitList record
      const key = $(".modal").data("key");
      const { PitListValue } = ajax.getSMARTCollection(collection, key);
      const selectedPits = PitListValue ? PitListValue.split(",") : [];
      return selectedPits;
    },
  };

  Cocktail.mixin(SimpleSMARTView, PitListSelectMixin);

  const pitListConfigView = new SimpleSMARTView({
    el: $("#PitLists"),
    template,
    collection,
    dataTables,
    modal,
    pitListSelect,
  });

  pitListConfigView.render();
});
