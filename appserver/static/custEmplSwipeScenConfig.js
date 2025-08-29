//# sourceURL=custEmplSwipeScenConfig.js

require.config({
  paths: { lib: "../app/SMART/lib/", text: "../app/SMART/lib/text" },
});
require([
  "lib/baseScenarioConfigView",
  "text!../app/SMART/custEmplSwipeScenCustomFields.html",
  "jquery",
  "lib/helpers/ajax",
], function (BaseScenarioConfigView, customFieldsView, $, ajax) {
  const dataTables = [
    {
      options: {
        columns: [
          { title: "Customer ID" },
          { title: "Customer Name" },
          { title: "Employee ID" },
          { title: "Employee Name" },
        ],
        ajax: {
          dataSrc: {
            customMap: function ({CustomerID, CustomerName, EmployeeID, EmployeeName}) {
               return [CustomerID, CustomerName, EmployeeID, EmployeeName];
            },
          },
        },
      },
    },
  ];

  const modal = {
    // appears as header on modal
    dialogTitle: "Customer And Employee Swipe Scenario",

    customFieldsView,

    // triggers on modal focus in Add mode
    onFocus_AddFn: () => $("#CustomerID").focus(),

    // triggers on modal focus in Add mode
    onFocus_EditFn: () => $("#PitList").focus(),

    // sets modal for Add mode
    prepareModal_AddFn: () => {
      $("#CustomerID, #EmployeeID").val("").change();
      $("#CustomerID, #EmployeeID").prop("disabled", false);
    },

    // sets modal for Edit mode
    prepareModal_EditFn: (record) => {
      $("#EmployeeID").val(record.EmployeeID).change();
      $("#CustomerID").val(record.CustomerID).change();

      $("#EmployeeID, #CustomerID").prop("disabled", true);
    },

    // sets modal for Delete mode
    prepareModal_DeleteFn: (record) => {
      $("#EmployeeID").val(record.EmployeeID).change();
      $("#CustomerID").val(record.CustomerID).change();

      $("#EmployeeID, #CustomerID").prop("disabled", true);
    },

    // creates record object from form data
    buildRecordFn: () => ({
      CustomerID: $("#CustomerID").val().trim(),
      CustomerName: $("#CustomerName").val(),
      EmployeeID: $("#EmployeeID").val().trim(),
      EmployeeName: $("#EmployeeName").val(),
    }),

    // returns boolean : if form is valid
    // argument is result of buildRecordFn()
    formValidationFn: ({ CustomerID, EmployeeID, PropertyID}) => {
      let isValid = true;

      const customerIDValidFormat = /^[0-9]+$/.test(CustomerID);

      const customerExists =
        ajax.queryCustomers({ patron: CustomerID }, PropertyID).length != 0;

      if (!customerIDValidFormat || !customerExists) {
        $("#CustomerIDError")
          .text("Valid Customer ID required")
          .css("visibility", "visible");
        $("a[href='#tab1']").click();
        $("#CustomerID").focus();
        isValid = false;
      }

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

    getCustomProperties: ({ CustomerID, EmployeeID }) => ({
      CustomerID,
      EmployeeID,
    }),
  };

  const custEmplSwipeScenarioView = BaseScenarioConfigView({
    dataTables,
    modal,
    scenarioTypeCode: "CustomerAndEmployeeCardSwipe",
  });

  custEmplSwipeScenarioView.render();
});
