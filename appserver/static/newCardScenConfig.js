//# sourceURL=newCardScenConfigView.js

require.config({
  paths: { lib: "../app/SMART/lib/", text: "../app/SMART/lib/text" },
});

require([
  "lib/baseScenarioConfigView",
  "text!../app/SMART/newCardScenCustomFields.html",
  "jquery",
  "lib/helpers/ajax",
], function (BaseScenarioConfigView, customFieldsView, $, ajax) {
  const dataTables = [
    {
      options: {
        columns: [
          { title: "Employee ID" },
          { title: "Employee Name" },
          { title: "Minimum Bet ($)" },
        ],
        ajax: {
          dataSrc: {
            customMap: function ({ EmployeeID, MinBetMin, MinBetMax, PropertyID }) {
              const record =
                EmployeeID && ajax.queryEmployees({ EmployeeID }, PropertyID)[0];
                  
              const EmployeeName = !record ? null : (({ PreferredName } = record), [PreferredName]);

              var PreferredName = !PreferredName ? null : PreferredName.split(" ");
                  PreferredName = !PreferredName ? null : PreferredName[1] + " " + PreferredName[0];              

              const formatMinMax = (min, max) => `${min} To ${max}`;

              const MinBet = formatMinMax(MinBetMin, MinBetMax);

              return [EmployeeID, PreferredName, MinBet];
            },
          },
        },
      },
    },
  ];

  const modal = {
    // appears as header on modal
    dialogTitle: "New Cards Scenario",

    customFieldsView,

    // triggers on modal focus in Add mode
    onFocus_AddFn: () => $("#MinBetMin").focus(),

    // sets modal for Add mode
    prepareModal_AddFn: () => {
      const fields = $(["#EmployeeID", "#MinBetMin", "#MinBetMax"].join(","));

      // clear & disable fields
      fields.val("").prop("disabled", false).change();
    },

    // sets modal for Edit mode
    prepareModal_EditFn: (record) => {
      const fieldNames = ["EmployeeID", "MinBetMin", "MinBetMax"];

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
      const fieldNames = ["EmployeeID", "MinBetMin", "MinBetMax"];

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
      // Value may be "all", convert to "ALL"  
      EmployeeID: $("#EmployeeID").val().trim().toUpperCase(),

      MinBetMin: $("#MinBetMin").val().trim(),
      MinBetMax: $("#MinBetMax").val().trim(),
    }),

    // returns boolean : if form is valid
    // argument is result of buildRecordFn()
    formValidationFn: ({ EmployeeID, MinBetMin, MinBetMax, PropertyID }) => {
      let isValid = true;

      const employeeIDValidFormat = /^[0-9]+$/.test(EmployeeID);
      const employeeExists =
        ajax.queryEmployees({ EmployeeID: EmployeeID }, PropertyID).length != 0;
      if ((!employeeIDValidFormat || !employeeExists) && EmployeeID.toUpperCase() != "ALL") {
        $("#EmployeeIDError")
          .text("Valid Employee ID required (or ALL)")
          .css("visibility", "visible");
        $("a[href='#tab1']").click();
        $("#EmployeeID").focus();
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

    getCustomProperties: ({ EmployeeID, MinBetMin, MinBetMax }) => ({
      EmployeeID,
      MinBetMin,
      MinBetMax,
    }),
  };

  const newCardView = BaseScenarioConfigView({
    dataTables,
    modal,
    scenarioTypeCode: "NewCard",
    minMaxInputs: [["#MinBetMin", "#MinBetMax"]],
  });

  newCardView.render();
});
