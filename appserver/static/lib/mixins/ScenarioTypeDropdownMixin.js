//# sourceURL=lib/mixins/ScenarioTypeDropdownMixin.js

define(["../app/SMART/lib/helpers/ajax"], function (ajax) {
  return {
    defaults: {
      scenarioTypeDropdown: {
        el: "#ScenarioTypeDropdown",
        collection: "SMART-ScenarioTypes",
      },
    },

    initialize: function () {
      this.scenarioTypeDropdown = {
        ...this.defaults.scenarioTypeDropdown,
        ...this.options.scenarioTypeDropdown,
      };

      if (!this.scenarioTypeDropdown.el)
        throw "[Invalid Option]: 'scenarioTypeDropdown.el' is undefined.";

      this.scenarioTypeDropdown.scenarioTypes = this.getAllScenarioTypes();
    },

    getAllScenarioTypes: function () {
      return ajax.getSMARTCollection(this.scenarioTypeDropdown.collection);
    },

    render: function () {
      const toOptions = ({ ScenarioTypeCode, ScenarioTypeName }) =>
        `<option value="${ScenarioTypeCode}">${ScenarioTypeName}</option>`;

      const options = this.scenarioTypeDropdown.scenarioTypes.map(toOptions);

      $(this.scenarioTypeDropdown.el).append(options);
    },
  };
});
