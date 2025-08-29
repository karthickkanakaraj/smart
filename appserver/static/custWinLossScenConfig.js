//# sourceURL=custWinLossScenConfigView.js

require.config({
  paths: { lib: "../app/SMART/lib/", text: "../app/SMART/lib/text" },
});

require([
  "lib/baseScenarioConfigView",
  "text!../app/SMART/custWinLossScenCustomFields.html",
  "jquery",
  "lib/helpers/ajax",
], function (BaseScenarioConfigView, customFieldsView, $, ajax) {
  const dataTables = [
    {
      options: {
        columns: [
          { title: "Customer ID" },
          { title: "Customer Name" },
          { title: "Minimum Bet ($)" },
          { title: "Average Bet ($)" },
          { title: "Win/Loss Amount ($)" },
        ],
        ajax: {
          dataSrc: {
            customMap: function ({CustomerID, 
                                  CustomerName, 
                                  MinBetMin, MinBetMax,
                                  AvgBetMin, AvgBetMax,
                                  WinLossAmtMin, WinLossAmtMax,
                                  }) {
               const formatMinMax = (min, max) => `${min} To ${max}`;

               const MinBet     = formatMinMax(MinBetMin, MinBetMax);
               const AvgBet     = formatMinMax(AvgBetMin, AvgBetMax);
               const WinLossAmt = formatMinMax(WinLossAmtMin, WinLossAmtMax);
               
               return [CustomerID, CustomerName, MinBet, AvgBet, WinLossAmt];                
            },
          },
        },
      },
    },
  ];

  const modal = {
    // appears as header on modal
    dialogTitle: "Customer Win / Loss Scenario",

    customFieldsView,

    // triggers on modal focus in Add mode
    onFocus_AddFn: () => $("#CustomerID").focus(),

    // triggers on modal focus in Add mode
    onFocus_EditFn: () => $("#PitList").focus(),
    
    // sets modal for Add mode
    prepareModal_AddFn: () => {
      const fields = $(
        [
          "#CustomerID",
          "#WinLossAmtMin",
          "#WinLossAmtMax",
          "#MinBetMin",
          "#MinBetMax",
          "#AvgBetMin",
          "#AvgBetMax",
        ].join(",")
      );

      // clear & enable fields
      fields.val("").prop("disabled", false).change();
    },

    // sets modal for Edit mode
    prepareModal_EditFn: (record) => {

      const fieldNames = [
        "CustomerID",
        "WinLossAmtMin",
        "WinLossAmtMax",
        "MinBetMin",
        "MinBetMax",
        "AvgBetMin",
        "AvgBetMax",
      ];

      // populate & enable fields
      fieldNames.forEach((fieldName) =>
        $(`#${fieldName}`)
          .val(record[fieldName])
          .prop("disabled", false)
          .change()
      );
      
      $("#CustomerID").prop("disabled", true);
    },

    // sets modal for Delete mode
    prepareModal_DeleteFn: (record) => {
      const fieldNames = [
        "CustomerID",
        "WinLossAmtMin",
        "WinLossAmtMax",
        "MinBetMin",
        "MinBetMax",
        "AvgBetMin",
        "AvgBetMax",
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
      // Values may be "all", convert to "ALL"  
      CustomerID: $("#CustomerID").val().trim().toUpperCase(),
      CustomerName: $("#CustomerName").val().trim(),
      WinLossAmtMin: $("#WinLossAmtMin").val().trim(),
      WinLossAmtMax: $("#WinLossAmtMax").val().trim(),
      MinBetMin: $("#MinBetMin").val().trim(),
      MinBetMax: $("#MinBetMax").val().trim(),
      AvgBetMin: $("#AvgBetMin").val().trim(),
      AvgBetMax: $("#AvgBetMax").val().trim(),
    }),

    // returns boolean : if form is valid
    // argument is result of buildRecordFn()
    formValidationFn: ({
      PropertyID,
      CustomerID,
      WinLossAmtMin,
      WinLossAmtMax,
      MinBetMin,
      MinBetMax,
      AvgBetMin,
      AvgBetMax,
    }) => {
      let isValid = true;

      const customerIDValidFormat = /^[0-9]+$/.test(CustomerID);
      const customerExists =
        ajax.queryCustomers({ patron: CustomerID }, PropertyID).length != 0;
      if ((!customerIDValidFormat || !customerExists) && CustomerID.toUpperCase() != "ALL") {
        $("#CustomerIDError")
          .text("Valid Customer ID required (or ALL)")
          .css("visibility", "visible");
        $("a[href='#tab1']").click();
        $("#CustomerID").focus();
        isValid = false;
      }

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

      const validFormatAvgBet =
        sigDecPatt.test(AvgBetMin) && sigDecPatt.test(AvgBetMax);
      const validRangeAvgBet =
        Number(AvgBetMin) >= 0 &&
        Number(AvgBetMax) >= 0 &&
        Number(AvgBetMin) <= Number(AvgBetMax);
      if (!validFormatAvgBet || !validRangeAvgBet) {
        $("#AvgBetError")
          .text("Valid Average Bet range required")
          .css("visibility", "visible");
        $("a[href='#tab1']").click();
        isValid = false;
      }

      // passed all the checks
      return isValid;
    },

    getCustomProperties: ({
      CustomerID,
      WinLossAmtMin,
      WinLossAmtMax,
      MinBetMin,
      MinBetMax,
      AvgBetMin,
      AvgBetMax,
    }) => ({
      CustomerID,
      WinLossAmtMin,
      WinLossAmtMax,
      MinBetMin,
      MinBetMax,
      AvgBetMin,
      AvgBetMax,
    }),
  };

  const custWinLossView = BaseScenarioConfigView({
    dataTables,
    modal,
    scenarioTypeCode: "CustomerWinLoss",
    minMaxInputs: [
      ["#WinLossAmtMin", "#WinLossAmtMax"],
      ["#MinBetMin", "#MinBetMax"],
      ["#AvgBetMin", "#AvgBetMax"],
    ],
  });

  custWinLossView.render();
});
