//# sourceURL=lib/mixins/DataTablesFixWidthMixin.js

define([], function () {
  return {
    initOptions: function () {
      const initOptionsFn = ({ elementId, options }) => {
        // apply defaults
        if (options.fixWidth == undefined) options.fixWidth = true;

        // ensure width isn't over >100% (allows scrollbar to hide)
        if (!options.fixWidth) return { elementId, options };

        const fixWidth = () => $(elementId).css("width", "100%");

        const { fnInitComplete } = options;

        const injectedFn = function () {
          const result = fnInitComplete(...arguments);
          fixWidth();
          return result;
        };

        options.fnInitComplete = fnInitComplete ? injectedFn : fixWidth;

        return { elementId, options };
      };

      this.options.dataTables = this.options.dataTables.map(initOptionsFn);
    },
  };
});
