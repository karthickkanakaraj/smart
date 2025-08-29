//# sourceURL=pitConfig.js

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
  "text!../app/SMART/pitConfig.html",
  "helpers/ajax",
], function ($, SimpleSMARTView, template, ajax) {
  const collection = "SMART-Pits";

  const dataTables = [
    {
      elementId: "#table",
      // toggles if records are filtered by property role
      options: {
        filterByRole: false,
        columns: [
          { title: "Pit Code" },
          { title: "Actions", bSortable: false, searchable: false },
        ],
        ajax: {
          url: ajax.makeSMARTCollectionURL(collection),
          dataSrc: (json) =>
            json.map(({ _key, PitCode }) => {
              const Actions = `<a class="action_delete" data-key="${_key}">Delete</a>`;
              return [PitCode, Actions];
            }),
        },
      },
    },
  ];

  const modal = {
    // appears as header on modal
    dialogTitle: "Pit",

    // triggers on modal focus in any mode
    onFocusFn: () => $("#PitCode").focus(),

    // triggers on modal focus in Add mode
    onFocus_AddFn: () => {},

    // triggers on modal focus in Edit mode
    onFocus_EditFn: () => {},

    // triggers on modal focus in Delete mode
    onFocus_DeleteFn: () => {},

    // sets modal for any mode
    prepareModalFn: () => {},

    // sets modal for Add mode
    prepareModal_AddFn: () => {
      $("#PitCode").val("").change();
      $("#PitCode").prop("disabled", false);
    },

    // sets modal for Edit mode
    prepareModal_EditFn: (record) => {},

    // sets modal for Delete mode
    prepareModal_DeleteFn: (record) => {
      $("#PitCode").val(record.PitCode).change();
      $("#PitCode").prop("disabled", true);
    },

    // creates record object from form data
    buildRecordFn: () => ({
      PitCode: $("#PitCode").val().trim(),
    }),

    // argument is result of buildRecordFn()
    formValidationFn: ({ _key, PitCode }) => {
      let isValid = true;

      const codeFormatRegex = /^[0-9]{2}$/;
      const isCorrectCodeFormat = codeFormatRegex.test(PitCode);

      // Similiar object doesn't already exist in collection
      const isUnique = ajax.isUniqueSMARTRecord(collection, {
        _key,
        PitCode,
      });

      if (!isCorrectCodeFormat || !isUnique) {
        $("#PitCodeError")
          .text("Valid Pit Code required (format: XX)")
          .css("visibility", "visible");
        $("#PitCode").focus();
        isValid = false;
      }

      // passed all the checks
      return isValid;
    },
  };

  const pitConfigView = new SimpleSMARTView({
    el: $("#Pits"),
    template,
    collection,
    dataTables,
    modal,
  });

  pitConfigView.render();
});
