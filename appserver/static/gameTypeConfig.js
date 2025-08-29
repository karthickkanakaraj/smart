//# sourceURL=gameTypeConfig.js

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
  "text!../app/SMART/gameTypeConfig.html",
  "helpers/ajax",
  "helpers/constants",
], function ($, SimpleSMARTView, template, ajax, { PropertyInfo }) {
  const collection = "SMART-GameTypes";

  const dataTables = [
    {
      elementId: "#table",
      options: {
        columns: [
          { title: "Property" },
          { title: "Game Type Code" },
          { title: "Actions", bSortable: false, searchable: false },
        ],
        ajax: {
          url: ajax.makeSMARTCollectionURL(collection),
          dataSrc: (json) =>
            json.map(({ _key, PropertyID, GameTypeCode }) => {
              const PropertyName = PropertyInfo.Names[PropertyID];
              const Actions = `<a class="action_delete" data-key="${_key}">Delete</a>`;
              return [PropertyName, GameTypeCode, Actions];
            }),
        },
      },
    },
  ];

  const modal = {
    // appears as header on modal
    dialogTitle: "Game Type",

    // triggers on modal focus in any mode
    onFocusFn: () => {},

    // triggers on modal focus in Add mode
    onFocus_AddFn: () => $("#GameTypeCode").focus(),

    // triggers on modal focus in Edit mode
    onFocus_EditFn: () => {},

    // triggers on modal focus in Delete mode
    onFocus_DeleteFn: () => {},

    // sets modal for any mode
    prepareModalFn: () => {},

    // sets modal for Add mode
    prepareModal_AddFn: () => {
      $("#GameTypeCode").val("").change();

      $("#PropertyDropdown").prop("disabled", false);
      $("#GameTypeCode").prop("disabled", false);
    },

    // sets modal for Edit mode
    prepareModal_EditFn: (record) => {},

    // sets modal for Delete mode
    prepareModal_DeleteFn: (record) => {
      $("#PropertyDropdown").val(record.PropertyID).change();
      $("#GameTypeCode").val(record.GameTypeCode).change();

      $("#PropertyDropdown").prop("disabled", true);
      $("#GameTypeCode").prop("disabled", true);
    },

    // creates record object from form data
    buildRecordFn: () => ({
      PropertyID: $("#PropertyDropdown").val(),
      GameTypeCode: $("#GameTypeCode").val().trim().toUpperCase(),
    }),

    // argument is result of buildRecordFn()
    formValidationFn: ({ _key, PropertyID, GameTypeCode }) => {
      let isValid = true;

      // Code matches pattern AR,BA,B2 etc.
      const codeFormatRegex = /^[A-Z0-9]{2}$/;
      const isCorrectCodeFormat = codeFormatRegex.test(GameTypeCode);

      // Similiar object doesn't already exist in collection
      const isUnique = ajax.isUniqueSMARTRecord(collection, {
        _key,
        PropertyID,
        GameTypeCode,
      });

      if (!isCorrectCodeFormat || !isUnique) {
        $("#GameTypeCodeError")
          .text("Valid Game Type Code required (format: XX)")
          .css("visibility", "visible");
        $("#GameTypeCode").focus();
        isValid = false;
      }

      // passed all the checks
      return isValid;
    },
  };

  const gameTypeConfigView = new SimpleSMARTView({
    el: $("#GameTypes"),
    template,
    collection,
    dataTables,
    modal,
  });

  gameTypeConfigView.render();
});
