//# sourceURL=dacomJackpotScenConfigView.js

require.config({
  paths: { lib: "../app/SMART/lib/", text: "../app/SMART/lib/text" },
});

require([
  "lib/simpleScenarioConfigView",
  "text!../app/SMART/dacomJackpotScenCustomFields.html",
  "jquery",
], function (SimpleScenarioConfigView, customFieldsView, $) {
  const dataTables = [
    {
      options: {
        columns: [
           { title: "Amount ($)" },
           { title: "Section" },
           { title: "Bank" },
           { title: "Machine" },
        ],
        ajax: {
          dataSrc: {
            customMap: function ({ AmountMin, 
                                   AmountMax,
                                   Section,
                                   BankMin,
                                   BankMax,
                                   MachineMin,
                                   MachineMax,
            }) {
              const formatMinMax = (min, max) => `${min} To ${max}`;

              const Amount  = formatMinMax(AmountMin,  AmountMax);
              const Bank    = formatMinMax(BankMin,    BankMax);
              const Machine = formatMinMax(MachineMin, MachineMax);
              return [Amount, Section, Bank, Machine];
            },
          },
        },
      },
    },
  ];

  const modal = {
    // appears as header on modal
    dialogTitle: "DACOM Jackpot Scenario",

    customFieldsView,

    // triggers on modal focus in Add mode
    onFocus_AddFn: () => $("#AmountMin").focus(),

    // sets modal for Add mode
    prepareModal_AddFn: () => {
      const fields = $(["#AmountMin","#AmountMax","#Section","#BankMin","#BankMax","#MachineMin","#MachineMax"].join(","));

      // clear & disable fields
      fields.val("").prop("disabled", false).change();
    },

    // sets modal for Edit mode
    prepareModal_EditFn: (record) => {
      const fieldNames = [
         "AmountMin",  "AmountMax",
         "Section",
         "BankMin",    "BankMax",
         "MachineMin", "MachineMax",
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
         "AmountMin",  "AmountMax",
         "Section",
         "BankMin",    "BankMax",
         "MachineMin", "MachineMax",
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
      AmountMin: $("#AmountMin").val().trim(),
      AmountMax: $("#AmountMax").val().trim(),
      Section: $("#Section").val().trim().toUpperCase(),
      BankMin: $("#BankMin").val().trim(),
      BankMax: $("#BankMax").val().trim(),
      MachineMin: $("#MachineMin").val().trim(),
      MachineMax: $("#MachineMax").val().trim(),
    }),

    // returns boolean : if form is valid
    // argument is result of buildRecordFn()
    formValidationFn: ({
        AmountMin, 
        AmountMax,
        Section,
        BankMin, 
        BankMax,
        MachineMin, 
        MachineMax,
      }) => {
      let isValid = true;

      // pattern for signed decimal values
      const sigDecPatt = /^-?\d+(\.\d+)?$/;      
      const validFormatAmount =
        sigDecPatt.test(AmountMin) && sigDecPatt.test(AmountMax);
      const validRangeAmount =
        Number(AmountMin) >= 0 &&
        Number(AmountMax) >= 0 &&
        Number(AmountMin) <= Number(AmountMax);

      if (!validFormatAmount || !validRangeAmount) {
        $("#AmountError")
          .text("Valid Amount range required")
          .css("visibility", "visible");
        $("a[href='#tab1']").click();
        isValid = false;
      }

      const SectionValidFormat = /^[a-zA-Z]$/.test(Section);
      if (!SectionValidFormat) {
        $("a[href='#tab1']").click();
        $("#Section").focus();
        $("#SectionError")
          .text("Section must be single Alphabetic character")
          .css("visibility", "visible");
        isValid = false;
      }

      // pattern for '99'
      const testPatt = /^[0-9]{2}$/;      
      
      const validFormatBank =
        testPatt.test(BankMin) && testPatt.test(BankMax);
      const validRangeBank =
        Number(BankMin) >= 0 &&
        Number(BankMax) >= 0 &&
        Number(BankMin) <= Number(BankMax);

      if (!validFormatBank || !validRangeBank) {
        $("#BankError")
          .text("Valid Bank range required (format 99)")
          .css("visibility", "visible");
        $("a[href='#tab1']").click();
        isValid = false;
      }

      const validFormatMachine =
        testPatt.test(MachineMin) && testPatt.test(MachineMax);
      const validRangeMachine =
        Number(MachineMin) >= 0 &&
        Number(MachineMax) >= 0 &&
        Number(MachineMin) <= Number(MachineMax);

      if (!validFormatMachine || !validRangeMachine) {
        $("#MachineError")
          .text("Valid Machine range required (format 99)")
          .css("visibility", "visible");
        $("a[href='#tab1']").click();
        isValid = false;
      }

      // passed all the checks
      return isValid;
    },

    getCustomProperties: ({ 
      AmountMin, 
      AmountMax, 
      Section,
      BankMin, 
      BankMax, 
      MachineMin, 
      MachineMax, 
    }) => ({
      AmountMin,
      AmountMax,
      Section,
      BankMin, 
      BankMax,
      MachineMin, 
      MachineMax,      
    }),
  };
  
  const newCardView = SimpleScenarioConfigView({
    dataTables,
    modal,
    scenarioTypeCode: "DACOMJackpot",
    minMaxInputs: [
      ["#AmountMin",  "#AmountMax"],
      ["#BankMin",    "#BankMax"],
      ["#MachineMin", "#MachineMax"],
      ]
  });

  newCardView.render();
});
