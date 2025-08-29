//# sourceURL=lib/mixins/ScenarioMixin.js

define(["../app/SMART/lib/helpers/ajax"], function (ajax) {
  return {
    events: {
      "change #PropertyDropdown": "onChangePropertyDropdown",
      "change #CustomerID":       "onChangeLookupIDFields",
      "change #EmployeeID":       "onChangeLookupIDFields",
    },

    initialize: function () {
      if (!this.options.scenarioTypeCode)
        throw "[Invalid Option]: 'scenarioTypeCode' is undefined.";

      this.scenarioTypeCode = this.options.scenarioTypeCode;

      const query = { ScenarioTypeCode: this.scenarioTypeCode };

      this.scenarioModal = {
        ...this.options.scenarioModal,
        allReasons: ajax.querySMARTCollection("SMART-Reasons", query),
        allAreaAuditeds: ajax.querySMARTCollection("SMART-AreaAuditeds", query),
        allPitLists: ajax.getSMARTCollection("SMART-PitLists"),
        allGameTypes: ajax.getSMARTCollection("SMART-GameTypes"),
      };
    },
 
    onChangeLookupIDFields: function () {
      const PropertyID = $("#PropertyDropdown").val();
     
      const CustomerID = $("#CustomerID").val();
      const EmployeeID = $("#EmployeeID").val();
     
      if (CustomerID != null) {
        const customerCollection = ajax.queryCustomers({ patron: CustomerID }, PropertyID)
        const customerName = (customerCollection.length != 0) ? customerCollection[0].PatronNameShort : null;
        $("#CustomerName").val(customerName);
      }
     
      if (EmployeeID != null) {
        const employeeCollection = ajax.queryEmployees({ EmployeeID }, PropertyID)
        const employeeName = (employeeCollection.length != 0) ? employeeCollection[0].PreferredName : null;
        $("#EmployeeName").val(employeeName);
      }
    },
    
    onChangePropertyDropdown: function () {
      this.updatePropertyDependants();
      this.setCollectionToDropdown();
    },

    setCollectionToDropdown: function () {
      const propertyID = $("#PropertyDropdown").val();
      this.toggleCollection(propertyID);
    },

    updatePropertyDependants: function () {
      const { allReasons, allAreaAuditeds, allPitLists } = this.scenarioModal;

      const dropdownInfo = [
        { el: "#Reason", list: allReasons, prop: "ReasonCode" },
        { el: "#AreaAudited", list: allAreaAuditeds, prop: "AreaAuditedCode" },
        { el: "#PitList", list: allPitLists, prop: "PitListCode" },
      ];

      const propertyID = $("#PropertyDropdown").val();
      const isSameProperty = ({ PropertyID }) => PropertyID == propertyID;

      dropdownInfo.forEach(({ el, list, prop }) => {
        const options = list
          .filter(isSameProperty)
          .sort((a, b) => a[prop].localeCompare(b[prop]))
          .map(
            (record) =>
              `<option value="${record[prop]}"">${record[prop]}</option>`
          );

        // replace dropdown options
        $(el).find("option").remove().end().append(options);
      });

      const gameTypes = this.scenarioModal.allGameTypes
        .filter(isSameProperty)
        .map(({ GameTypeCode }) => GameTypeCode);

      // update game type prompt
      $("#GameTypePrompt").text(`Game Types: ${gameTypes.join(`, `)}`);
    },

    populateParameterDropdowns: function () {
      const dropdownInfo = [
        { el: "#Priority", values: [1, 2, 3] },
        { el: "#Active", values: ["True", "False"] },
        {
          el: "#MonitoringType",
          values: ["SMART Alert - Investigated Only",
                   "SMART Alert - Monitored",
                   "SMART Alert - Logged Only",
                   "SMART Alert - Reviewed"],          
        },
      ];

      const valueToOption = (val) => `<option value="${val}">${val}</option>`;

      dropdownInfo.forEach(({ el, values }) =>
        $(el).append(values.map(valueToOption))
      );
    },

    render: function () {
      this.setCollectionToDropdown();
      this.updatePropertyDependants();
      this.populateParameterDropdowns();
    },
  };
});
