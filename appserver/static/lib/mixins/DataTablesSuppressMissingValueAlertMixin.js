//# sourceURL=lib/mixins/DataTablesSuppressMissingValueAlertMixin.js

define([], function () {
  return {
    initOptions: function () {
      const initOptionsFn = ({ elementId, options }) => {
        // apply defaults
        if (options.suppressMissingValueAlerts == undefined)
          options.suppressMissingValueAlerts = true;

        // suppress alert for missing values ~ undefined -> null
        if (
          options.ajax &&
          options.ajax.dataSrc &&
          options.suppressMissingValueAlerts
        ) {
          const emptyToNull = (value) => (value != undefined ? value : null);
          const emptyRowValsToNull = (row) => row.map(emptyToNull);
          const { dataSrc } = options.ajax;
          options.ajax.dataSrc = (data) =>
            dataSrc(data).map(emptyRowValsToNull);
        }

        return { elementId, options };
      };

      this.options.dataTables = this.options.dataTables.map(initOptionsFn);
    },
  };
});
