//# sourceURL=lib/mixins/DataTablesMixin.js

require.config({
  paths: {
    datatables: "../app/SMART/lib/DataTables/js/jquery.dataTables",
    bootstrapDataTables: "../app/SMART/lib/DataTables/js/dataTables.bootstrap",
    text: "../app/SMART/lib/text",
  },
  shim: { bootstrapDataTables: { deps: ["datatables"] } },
});

define([
  "underscore",
  "jquery",
  "bootstrapDataTables",
  "css!../app/SMART/lib/SplunkDataTables.css",
  "css!../app/SMART/lib/DataTables/css/jquery.dataTables.css",
], function (_, $) {
  return {
    defaults: {
      dataTable: {
        // see https://datatables.net/reference/option/
        options: {
          iDisplayLength: 10,
          bLengthChange: false,
          bStateSave: true,
          aaSorting: [[0, "asc"]],
          scrollX: true,
        },
      },
    },

    initialize: function () {
      if (!this.options.dataTables)
        throw `[Invalid Option] 'dataTables' is undefined.`;

      this.initOptions();

      this.dataTables = this.options.dataTables;
    },

    initOptions: function () {
      const initOptionsFn = ({ elementId, options }, index) => {
        if (!elementId)
          throw `[Invalid Option] 'dataTables[${index}].elementId' is undefined.`;

        // apply defaults
        options = _.extend({}, this.defaults.dataTable.options, options);

        return { elementId, options };
      };

      this.options.dataTables = this.options.dataTables.map(initOptionsFn);
    },

    render: function () {
      const init = ({ elementId, options }) => $(elementId).dataTable(options);
      this.dataTables.forEach(init);
      this.onRenderDataTables();
    },

    onRenderDataTables: function () {},

    reloadDataTables: function (url) {
      const reload =
        url == undefined
          ? ({ elementId }) => $(elementId).DataTable().ajax.reload()
          : ({ elementId }) =>
              $(elementId).DataTable().ajax.url(url).ajax.reload();

      this.dataTables.forEach(reload);
    },
  };
});
