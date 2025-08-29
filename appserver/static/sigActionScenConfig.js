//# sourceURL=sigActionScenConfigView.js

require.config({
  paths: { lib: "../app/SMART/lib/", text: "../app/SMART/lib/text" },
});

require([
  "lib/baseScenarioConfigView",
  "text!../app/SMART/sigActionScenCustomFields.html",
  "jquery",
], function (BaseScenarioConfigView, customFieldsView, $) {
  const dataTables = [
    {
      options: {
        columns: [{ title: "Minimum Bet ($)" }],
        ajax: {
          dataSrc: {
            customMap: function ({ MinBetMin, MinBetMax }) {
              const formatMinMax = (min, max) => `${min} To ${max}`;

              const MinBet = formatMinMax(MinBetMin, MinBetMax);
              return [MinBet];
            },
          },
        },
      },
    },
  ];

  const modal = {
    // appears as header on modal
    dialogTitle: "Significant Action Scenario",

    customFieldsView,

    // triggers on modal focus in Add mode
    onFocus_AddFn: () => $("#MinBetMin").focus(),

    // sets modal for Add mode
    prepareModal_AddFn: () => {
      const fields = $(["#MinBetMin", "#MinBetMax"].join(","));

      // clear & disable fields
      fields.val("").prop("disabled", false).change();
    },

    // sets modal for Edit mode
    prepareModal_EditFn: (record) => {
      const fieldNames = ["MinBetMin", "MinBetMax"];

      // populate & enable fields
      fieldNames.forEach((fieldName) =>
        $(`#${fieldName}`)
          .val(record[fieldName])
          .prop("disabled", false)
          .change()
      );
    },

    // sets modal for Delete mode
    prepareModal_DeleteFn: (record) => {
      const fieldNames = ["MinBetMin", "MinBetMax"];

      // populate & disable fields
      fieldNames.forEach((fieldName) =>
        $(`#${fieldName}`)
          .val(record[fieldName])
          .prop("disabled", true)
          .change()
      );
    },

    // creates record object from form data
    buildRecordFn: () => ({
      MinBetMin: $("#MinBetMin").val().trim(),
      MinBetMax: $("#MinBetMax").val().trim(),
    }),

    // returns boolean : if form is valid
    // argument is result of buildRecordFn()
    formValidationFn: ({ MinBetMin, MinBetMax }) => {
      let isValid = true;

      const sigIntPatt = /^-?\d+$/;
      const validFormatMinBet =
        sigIntPatt.test(MinBetMin) && sigIntPatt.test(MinBetMax);
      const validRangeMinBet =
        Number(MinBetMin) >= 0 &&
        Number(MinBetMax) >= 0 &&
        Number(MinBetMin) <= Number(MinBetMax);

      if (!validFormatMinBet || !validRangeMinBet) {
        $("#MinBetError")
          .text("Valid Minimum Bet range required")
          .css("visibility", "visible");
        $("a[href='#tab1']").click();
        isValid = false;
      }

      // passed all the checks
      return isValid;
    },

    getCustomProperties: ({ MinBetMin, MinBetMax }) => ({
      MinBetMin,
      MinBetMax,
    }),
  };

  const newCardView = BaseScenarioConfigView({
    dataTables,
    modal,
    scenarioTypeCode: "SignificantAction",
    minMaxInputs: [["#MinBetMin", "#MinBetMax"]],
  });

  newCardView.render();
});
