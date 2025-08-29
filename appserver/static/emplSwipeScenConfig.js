//# sourceURL=emplSwipeScenConfig.js

require.config({
  paths: { lib: "../app/SMART/lib/", text: "../app/SMART/lib/text" },
});
require([
  "lib/baseScenarioConfigView",
  "text!../app/SMART/emplSwipeScenCustomFields.html",
  "jquery",
  "lib/helpers/ajax",
], function (BaseScenarioConfigView, customFieldsView, $, ajax) {
  const dataTables = [
    {
      options: {
        columns: [
          { title: "Employee ID" },
          { title: "Employee Name" },
        ],
        ajax: {
          dataSrc: {
            customMap: function ({EmployeeID, EmployeeName}) {
               return [EmployeeID, EmployeeName];
            },
          },
        },
      },
    },
  ];

  const modal = {
    // appears as header on modal
    dialogTitle: "Employee Swipe Scenario",

    customFieldsView,

    // triggers on modal focus in Add mode
    onFocus_AddFn: () => $("#EmployeeID").focus(),
    
    // triggers on modal focus in Add mode
    onFocus_EditFn: () => $("#PitList").focus(),

    // sets modal for Add mode
    prepareModal_AddFn: () => {
      $("#EmployeeID").val("").change();
      $("#EmployeeID").prop("disabled", false);
    },

    // sets modal for Edit mode
    prepareModal_EditFn: (record) => {
      $("#EmployeeID").val(record.EmployeeID).change();
      $("#EmployeeID").prop("disabled", true);
    },

    // sets modal for Delete mode
    prepareModal_DeleteFn: (record) => {
      $("#EmployeeID").val(record.EmployeeID).change();
      $("#EmployeeID").prop("disabled", true);
    },

    // creates record object from form data
    buildRecordFn: () => ({
      EmployeeID: $("#EmployeeID").val().trim(),
      EmployeeName: $("#EmployeeName").val(), 
    }),

    // returns boolean : if form is valid
    // argument is result of buildRecordFn()
    formValidationFn: ({ EmployeeID , PropertyID} ) => {
      let isValid = true;

      const employeeIDValidFormat = /^[0-9]+$/.test(EmployeeID);
      const employeeExists =
        ajax.queryEmployees({ EmployeeID: EmployeeID }, PropertyID).length != 0;
      if (!employeeIDValidFormat || !employeeExists) {
        $("#EmployeeIDError")
          .text("Valid Employee ID required")
          .css("visibility", "visible");
        $("a[href='#tab1']").click();
        $("#EmployeeID").focus();
        isValid = false;
      }

      // passed all the checks
      return isValid;
    },

    getCustomProperties: ({ EmployeeID }) => ({
      EmployeeID,
    }),
  };

  const employeeSwipeScenarioView = BaseScenarioConfigView({
    dataTables,
    modal,
    scenarioTypeCode: "EmployeeCardSwipe",
  });

  employeeSwipeScenarioView.render();
});
