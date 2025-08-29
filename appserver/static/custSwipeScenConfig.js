//# sourceURL=custSwipeScenConfig.js

require.config({
  paths: { lib: "../app/SMART/lib/", text: "../app/SMART/lib/text" },
});
require([
  "lib/baseScenarioConfigView",
  "text!../app/SMART/custSwipeScenCustomFields.html",
  "jquery",
  "lib/helpers/ajax",
], function (BaseScenarioConfigView, customFieldsView, $, ajax) {

  const dataTables = [
    {
      options: {
        columns: [
          { title: "Customer ID" },
          { title: "Customer Name" },
        ],
        ajax: {
          dataSrc: {
            customMap: function ({CustomerID, CustomerName}) {
               return [CustomerID, CustomerName];
            },
          },
        },
      },
    },
  ];

  const modal = {
    // appears as header on modal
    dialogTitle: "Customer Swipe Scenario",

    customFieldsView,

    // triggers on modal focus in Add mode
    onFocus_AddFn: () => $("#CustomerID").focus(),

    // triggers on modal focus in Add mode
    onFocus_EditFn: () => $("#PitList").focus(),

    // sets modal for Add mode
    prepareModal_AddFn: () => {
      $("#CustomerID").val("").change();
      $("#CustomerID").prop("disabled", false);
    },

    // sets modal for Edit mode
    prepareModal_EditFn: (record) => {
      $("#CustomerID").val(record.CustomerID).change();
      
      $("#CustomerID").prop("disabled", true);
    },

    // sets modal for Delete mode
    prepareModal_DeleteFn: (record) => {
      $("#CustomerID").val(record.CustomerID).change();

      $("#CustomerID").prop("disabled", true);
    },

    // creates record object from form data
    buildRecordFn: () => ({
      CustomerID:   $("#CustomerID").val().trim(),
      CustomerName: $("#CustomerName").val().trim(),
    }),
    
    // returns boolean : if form is valid
    // argument is result of buildRecordFn()
    formValidationFn: ({ CustomerID, PropertyID }) => {
        
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

      // passed all the checks
      return isValid;
    },

    getCustomProperties: ({ CustomerID }) => ({
      CustomerID,
    }),
  };

  const customerSwipeScenarioView = BaseScenarioConfigView({
    dataTables,
    modal,
    scenarioTypeCode: "CustomerCardSwipe",
  });
      
  customerSwipeScenarioView.render();
});
