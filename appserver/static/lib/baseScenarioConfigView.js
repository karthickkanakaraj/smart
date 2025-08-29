//# sourceURL=lib/baseScenarioConfigView.js

require.config({
  paths: {
    text: "../app/SMART/lib/text",
    SimpleSMARTView: "../app/SMART/lib/SimpleSMARTView",
    helpers: "../app/SMART/lib/helpers/",
    cocktail: "../app/SMART/lib/Cocktail/Cocktail-0.5.15.min",
    mixins: "../app/SMART/lib/mixins",
  },
});

define([
  "jquery",
  "SimpleSMARTView",
  "text!../app/SMART/lib/baseScenarioConfig.html",
  "helpers/ajax",
  "helpers/constants",
  "cocktail",
  "mixins/MultipleCollectionsMixin",
  "mixins/DataTablesMultipleCollectionsMixin",
  "mixins/ScenarioMixin",
  "mixins/AuditScenarioMixin",
  "mixins/MinMaxInputsMixin",
], function (
  $,
  SimpleSMARTView,
  template,
  ajax,
  { PropertyInfo },
  Cocktail,
  ...Mixins
) {
  return function ({
    dataTables: _dataTables,
    modal: _modal,
    scenarioTypeCode,
    minMaxInputs,
  }) {
    const activeProperties = ajax.getActiveProperties();
    if (activeProperties.length == 0)
       alert("You do not have access to SMART data.\nPlease contact the Surveillance Team if you require access.");

    const collections = activeProperties.map(({ id, code }) => ({
      id,
      name: `SMART-${code}-ScenarioInstances`,
      audit: `SMART-${code}-ScenarioInstanceAudits`,
      query: { ScenarioTypeCode: scenarioTypeCode },
    }));

    const userFunctions = ajax.getFunctions();

    const dataTables = [
      {
        elementId: "#table",
        options: {
          columns: [
            { title: "Property" },
            { title: "Reason" },
            { title: "iTrak 'Area Audited'" },
            ..._dataTables[0].options.columns,
            { title: "Pit List" },
            { title: "Game Types" },
            { title: "Comments" },
            { title: "Priority" },
            { title: "Expiry Date" },
            { title: "Active" },
            { title: "Monitoring Type" },
            { title: "Actions", bSortable: false, searchable: false },
            { title: "Last Updated" },
            { title: "Last UpdatedBy" },
          ],
          ajax: {
            url: undefined, // this is set by DataTablesMultipleCollectionsMixin
            dataSrc: (json) => 
              json.map((record) => {
                const {
                  _key,
                  PropertyID,
                  Reason,
		          AreaAuditedCode,
                
                  PitListCode,
                  GameTypeList,
                  Comments,
                  Priority,
                  ExpiryDate,
                  Active,
                  MonitoringType,
                  LastUpdated,
                  LastUpdatedBy,
                } = record;

                const customMap =
                  _dataTables[0].options.ajax.dataSrc.customMap(record);
                  
                const PropertyName = PropertyInfo.Names[PropertyID];
                
                const allowEdit = PropertyID + "_scenario_edit"
                
                const EditAction   = `<a class="action_edit"   data-key="${_key}">Edit</a>`;
                const DeleteAction = `<a class="action_delete" data-key="${_key}">Delete</a>`;
                const ViewAction   = `<a class="action_view"   data-key="${_key}">View</a>`

                var Actions = (userFunctions.includes(allowEdit) ? EditAction + ` | ` + DeleteAction : ViewAction);

                const year = LastUpdated.substr(6, 4);
                const month = LastUpdated.substr(3, 2);
                const day = LastUpdated.substr(0, 2);
                const time = LastUpdated.substr(11, 8);
                const UpdateTime = `${year}-${month}-${day} ${time} AEST`;
            
                return [
                  PropertyName,
                  Reason,
                  AreaAuditedCode,
                  ...customMap,
                  PitListCode,
                  GameTypeList,
                  Comments,
                  Priority,
                  ExpiryDate,
                  Active,
                  MonitoringType,
                  Actions,
                  UpdateTime,
                  LastUpdatedBy,
                ];
              }),
          }, 
        },
      },
    ];

    const modal = {
      // populate properties from specific scenario
      ..._modal,

      // sets modal for Add mode
      prepareModal_AddFn: () => {

        // clear fields
        $(["#GameTypes", "#Comments", "#ExpiryDate"].join(",")).val("");

        // set fields
        $(
          [
            "#Reason",
            "#AreaAudited",
            "#PitList",
            "#Priority",
            "#Active",
            "#MonitoringType",
          ].join(",")
        ).prop("selectedIndex", 0);

        // enable fields
        $(
          [
            "#PropertyDropdown",
            "#Reason",
            "#AreaAudited",
            "#PitList",
            "#GameTypes",

            "#Comments",
            "#Priority",
            "#ExpiryDate",
            "#Active",
            "#MonitoringType",
          ].join(",")
        ).prop("disabled", false);

      $("a[href='#tab1']").click();
      
      if (_modal.prepareModal_AddFn) _modal.prepareModal_AddFn();
      },

      // sets modal for Edit mode
      prepareModal_EditFn: (record) => {
        // populate fields
        $("#PropertyDropdown").val(record.PropertyID).change();
        $("#Reason").val(record.Reason).change();
        $("#AreaAudited").val(record.AreaAuditedCode).change();
        $("#PitList").val(record.PitListCode).change();
        $("#GameTypes").val(record.GameTypeList).change();
        $("#Comments").val(record.Comments).change();
        $("#Priority").val(record.Priority).change();
        $("#ExpiryDate").val(record.ExpiryDate).change();
        $("#MonitoringType").val(record.MonitoringType).change();

        // disable fields
        $("#PropertyDropdown").prop("disabled", true);

        // enable fields
        $(
          [
            "#Reason",
            "#AreaAudited",
            "#PitList",
            "#GameTypes",
            "#Comments",
            "#Priority",
            "#ExpiryDate",
            "#Active",
            "#MonitoringType",
          ].join(",")
        ).prop("disabled", false);

        $("a[href='#tab1']").click();

        if (_modal.prepareModal_EditFn) _modal.prepareModal_EditFn(record);
      },

      // sets modal for Delete mode
      prepareModal_DeleteFn: (record) => {
        $("#PropertyDropdown").val(record.PropertyID).change();
        $("#Reason").val(record.Reason);
        $("#AreaAudited").val(record.AreaAuditedCode);
        $("#PitList").val(record.PitListCode);
        $("#GameTypes").val(record.GameTypeList);
        $("#Comments").val(record.Comments);
        $("#Priority").val(record.Priority);
        $("#ExpiryDate").val(record.ExpiryDate);
        $("#MonitoringType").val(record.MonitoringType);

        // disable fields
        $(
          [
            "#PropertyDropdown",
            "#Reason",
            "#AreaAudited",
            "#PitList",
            "#GameTypes",

            "#Comments",
            "#Priority",
            "#ExpiryDate",
            "#Active",
            "#MonitoringType",
          ].join(",")
        ).prop("disabled", true);

        $("a[href='#tab1']").click();

        if (_modal.prepareModal_DeleteFn) _modal.prepareModal_DeleteFn(record);
      },

      // creates record object from form data
      buildRecordFn: () => ({
        PropertyID: $("#PropertyDropdown").val(),
        ScenarioTypeCode: scenarioTypeCode,
        Reason: $("#Reason").val(),
        AreaAuditedCode: $("#AreaAudited").val(),

        ...(_modal.buildRecordFn ? _modal.buildRecordFn() : {}),

        PitListCode: $("#PitList").val(),
        // remove any whitespace and extra commas
        GameTypeList:
          ((str = $("#GameTypes").val()),
          (trimmed = str
            .split(",")
            .map((code) => code.trim().toUpperCase())
            .filter((code) => code != "")),
          (unique = Array.from(new Set(trimmed))),
          unique.join(",")),
        Comments: $("#Comments").val(),
        Priority: $("#Priority").val(),
        ExpiryDate: $("#ExpiryDate").val(),
        Active: $("#Active").val(),
        MonitoringType: $("#MonitoringType").val(),
        // timestamp
        LastUpdated:
          ((date = new Date().toLocaleString("en-GB")),
          (day = date.substr(0, 2)),
          (month = date.substr(3, 2)),
          (year = date.substr(6, 4)),
          (time = date.substr(12, 8)),
          `${day}/${month}/${year} ${time}`),
        // active splunk user
        LastUpdatedBy: Splunk.util.getConfigValue("USERNAME"),
      }),

      // returns boolean : if form is valid
      // argument is result of buildRecordFn()
      formValidationFn: function (record) {
        const {
          _key,
          PropertyID,
          Reason,
          AreaAuditedCode,
          PitListCode,
          GameTypeList,
          ExpiryDate,
        } = record;

        let isValid = true;

        if (!Reason) {
          $("a[href='#tab1']").click();
          $("#Reason").focus();
          $("#ReasonError")
            .text("Valid Reason required")
            .css("visibility", "visible");
          isValid = false;
        }

        if (!AreaAuditedCode) {
          $("a[href='#tab1']").click();
          $("#AreaAudited").focus();
          $("#AreaAuditedError")
            .text("Valid Area Audited required")
            .css("visibility", "visible");
          isValid = false;
        }

        // this functiopn will either return false or a CustomerName
        const customerName = _modal.formValidationFn(record);
        
        $("#CustomerName").text("Valid Expiry Date required (DD/MM/YYYY)");
        
        if (_modal.formValidationFn && customerName == false)
          isValid = false;
        
        if (!PitListCode) {
          $("a[href='#tab1']").click();
          $("#PitList").focus();
          $("#PitListError")
            .text("Valid Pit List required")
            .css("visibility", "visible");
          isValid = false;
        }

        const gameTypesRegex = /^([a-zA-Z0-9]{2},+)*([a-zA-Z0-9]{2})+$/;
        const gameTypesValidFormat = gameTypesRegex.test(GameTypeList);
        if (!gameTypesValidFormat) {
          $("a[href='#tab1']").click();
          $("#GameTypes").focus();
          $("#GameTypeError")
            .text("Valid Game Types required (comma separated)")
            .css("visibility", "visible");
          isValid = false;
        }

        const validGameTypes = ajax
          .getSMARTCollection("SMART-GameTypes")
          .filter((gameType) => gameType.PropertyID == PropertyID)
          .map(({ GameTypeCode }) => GameTypeCode);

        const invalidGameType = GameTypeList.split(`,`).find(
          (gameType) => !validGameTypes.includes(gameType)
        );
        if (invalidGameType) {
          $("a[href='#tab1']").click();
          $("#GameTypes").focus();
          $("#GameTypeError")
            .text(`'${invalidGameType}' isn't a valid Game Type`)
            .css("visibility", "visible");
          isValid = false;
        }

        const collection = collections.find(({ id }) => id == PropertyID).name;

        const isUnique = ajax.isUniqueSMARTRecord(collection, {
          _key,
          PropertyID,
          Reason,
          AreaAuditedCode,
          ...(_modal.getCustomProperties
            ? _modal.getCustomProperties(record)
            : {}),
          PitListCode,
          GameTypeList,
          ScenarioTypeCode: scenarioTypeCode,
        });
        if (!isUnique) {
          $("a[href='#tab1']").click();
          $("#DuplicateError")
            .text("Unique Scenario required")
            .css("visibility", "visible");
          isValid = false;
        }

        const isValidDate = (s) => {
          if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) return false;
          const [day, month, year] = s.split("/").map((p) => parseInt(p, 10));
          const d = new Date(year, month - 1, day);
          return (
            d.getMonth() === month - 1 &&
            d.getDate() === day &&
            d.getFullYear() === year
          );
        };

        // accepting undefined or date-like values
        if (ExpiryDate.length > 0 && !isValidDate(ExpiryDate)) {
          $("a[href='#tab2']").click();
          $("#ExpiryDate").focus();
          $("#ExpiryDateError")
            .text("Valid Expiry Date required (DD/MM/YYYY)")
            .css("visibility", "visible");
          isValid = false;
        }

        // passed all the checks
        return isValid;
      },
    };

    const CustomFieldsMixin = {
      render: () =>
        $("#ModalCustomFields").replaceWith(_modal.customFieldsView || ""),
    };

    Cocktail.mixin(SimpleSMARTView, CustomFieldsMixin, ...Mixins);

    const scenarioView = new SimpleSMARTView({
      el: $("#Scenarios"),
      template,
      collections,
      dataTables,
      modal,
      scenarioTypeCode,
      minMaxInputs,
    });

    return scenarioView;
  };
});
