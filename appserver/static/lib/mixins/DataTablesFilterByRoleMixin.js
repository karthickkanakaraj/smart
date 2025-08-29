//# sourceURL=lib/mixins/DataTablesFilterByRoleMixin.js

define([], function () {
  return {
    initOptions: function () {
      const initOptionsFn = ({ elementId, options }) => {
        // apply defaults
        if (options.filterByRole == undefined) options.filterByRole = true;

        // filter results for active property roles
        if (options.ajax && options.ajax.dataSrc && options.filterByRole) {
          const activePropertyIDs = this.activeProperties.map(({ id }) =>
            String(id)
          );
          const isActiveProperty = ({ PropertyID }) =>
            activePropertyIDs.includes(PropertyID);
          const { dataSrc } = options.ajax;
          options.ajax.dataSrc = (data) =>
            dataSrc(data.filter(isActiveProperty));
        }

        return { elementId, options };
      };

      this.options.dataTables = this.options.dataTables.map(initOptionsFn);
    },
  };
});
