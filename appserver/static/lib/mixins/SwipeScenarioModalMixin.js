//# sourceURL=lib/mixins/SwipeScenarioModalMixin.js

define(["../app/SMART/lib/helpers/ajax"], function (ajax) {
  return {
    events: {
      "change #PropertyDropdown": "onChangePropertyDropdown",
    },

    initialize: function () {
      if (!this.options.swipeScenarioModal)
        throw "[Invalid Option]: 'swipeScenarioModal' is undefined.";

      if (!this.options.swipeScenarioModal.ScenarioTypeCode)
        throw "[Invalid Option]: 'swipeScenarioModal.ScenarioTypeCode' is undefined.";

      const query = {
        ScenarioTypeCode: this.options.swipeScenarioModal.ScenarioTypeCode,
      };

      this.swipeScenarioModal = {
        ...this.options.swipeScenarioModal,
        allReasons: ajax.querySMARTCollection("SMART-Reasons", query),
        allAreaAuditeds: ajax.querySMARTCollection("SMART-AreaAuditeds", query),
        allPitLists: ajax.getSMARTCollection("SMART-PitLists"),
        allGameTypes: ajax.getSMARTCollection("SMART-GameTypes"),
      };
    },

    onChangePropertyDropdown: function () {
      this.updatePropertyDependants();
      this.setCollectionToDropdown();
    },

    setCollectionToDropdown: function(){
      const propertyID = $("#PropertyDropdown").val();
      this.toggleCollection(propertyID)
    },

    updatePropertyDependants: function () {
      const { allReasons, allAreaAuditeds, allPitLists } =
        this.swipeScenarioModal;

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

      const gameTypes = this.swipeScenarioModal.allGameTypes
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
          values: ["Monitored", "Reviewed", "Investigated", "Logged Only"],
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