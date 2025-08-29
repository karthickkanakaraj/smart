//# sourceURL=tableWinLossScenConfigView.js

require.config({
  paths: { lib: "../app/SMART/lib/", text: "../app/SMART/lib/text" },
});

require([
  "lib/baseScenarioConfigView",
  "text!../app/SMART/tableWinLossScenCustomFields.html",
  "jquery",
], function (BaseScenarioConfigView, customFieldsView, $) {
  const dataTables = [
    {
      options: {
        columns: [
          { title: "Win/Loss Amount ($)" },
          { title: "Minimum Bet ($)" },
        ],
        ajax: {
          dataSrc: {
            customMap: function ({
              WinLossAmtMin,
              WinLossAmtMax,
              MinBetMin,
              MinBetMax,
            }) {
              const formatMinMax = (min, max) => `${min} To ${max}`;

              const WinLossAmt = formatMinMax(WinLossAmtMin, WinLossAmtMax);
              const MinBet = formatMinMax(MinBetMin, MinBetMax);

              return [WinLossAmt, MinBet];
            },
          },
        },
      },
    },
  ];

  const modal = {
    // appears as header on modal
    dialogTitle: "Table Win / Loss Scenario",

    customFieldsView,

    // triggers on modal focus in Add mode
    onFocus_AddFn: () => $("#WinLossAmtMin").focus(),

    // sets modal for Add mode
    prepareModal_AddFn: () => {
      const fields = $(
        ["#WinLossAmtMin", "#WinLossAmtMax", "#MinBetMin", "#MinBetMax"].join(
          ","
        )
      );

      // clear & disable fields
      fields.val("").prop("disabled", false).change();
    },

    // sets modal for Edit mode
    prepareModal_EditFn: (record) => {
      const fieldNames = [
        "WinLossAmtMin",
        "WinLossAmtMax",
        "MinBetMin",
        "MinBetMax",
      ];

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
      const fieldNames = [
        "WinLossAmtMin",
        "WinLossAmtMax",
        "MinBetMin",
        "MinBetMax",
      ];

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
      WinLossAmtMin: $("#WinLossAmtMin").val().trim(),
      WinLossAmtMax: $("#WinLossAmtMax").val().trim(),
      MinBetMin: $("#MinBetMin").val().trim(),
      MinBetMax: $("#MinBetMax").val().trim(),
    }),

    // returns boolean : if form is valid
    // argument is result of buildRecordFn()
    formValidationFn: ({
      WinLossAmtMin,
      WinLossAmtMax,
      MinBetMin,
      MinBetMax,
    }) => {
      let isValid = true;

      // pattern for signed decimal values
      const sigDecPatt = /^-?\d+(\.\d+)?$/;
      const validFormatWinLossAmt =
        sigDecPatt.test(WinLossAmtMin) && sigDecPatt.test(WinLossAmtMax);
      const validRangeWinLossAmt =
        Number(WinLossAmtMin) <= Number(WinLossAmtMax);
      if (!validFormatWinLossAmt || !validRangeWinLossAmt) {
        $("#WinLossAmtError")
          .text("Valid Win/Loss Amount range required")
          .css("visibility", "visible");
        $("a[href='#tab1']").click();
        isValid = false;
      }

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

    getCustomProperties: ({
      WinLossAmtMin,
      WinLossAmtMax,
      MinBetMin,
      MinBetMax,
    }) => ({
      WinLossAmtMin,
      WinLossAmtMax,
      MinBetMin,
      MinBetMax,
    }),
  };

  const tableWinLossView = BaseScenarioConfigView({
    dataTables,
    modal,
    scenarioTypeCode: "TableWinLoss",
    minMaxInputs: [
      ["#WinLossAmtMin", "#WinLossAmtMax"],
      ["#MinBetMin", "#MinBetMax"],
    ],
  });

  tableWinLossView.render();
});
