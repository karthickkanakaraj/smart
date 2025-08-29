//# sourceURL=lib/mixins/DataTablesMultipleCollectionsMixin.js

define(["../app/SMART/lib/helpers/ajax"], function (ajax) {
  return {
    initialize: function () {
      if (!this.options.collections)
        throw "[Invalid Option]: 'collections' is undefined.";
      if (this.options.collections.length == 0)
        throw "[Invalid Option]: 'collections' is empty.";

      this.initMultipleCollectionOptions();
    },

    // toggles to a records collection when clicking an action
    onAction: function (event) {
      const id = $(event.target).data("collectionid");
      if (id) this.toggleCollection(id);
    },

    initMultipleCollectionOptions: function () {
      // default to first collection
      const { name, query } = this.collections[0];
      this.options.dataTables[0].options.ajax.url =
        ajax.makeSMARTQueryCollectionURL(name, query);

      if (this.collections.length < 2) return;

      this.options.dataTables = this.options.dataTables.map(
        ({ elementId, options }) => ({
          elementId,
          options: this.injectOtherCollections(options),
        })
      );
    },

    // adds multiple collections to dataTable & decorate actions w/ collection ids
    injectOtherCollections(options) {
      if (!options.ajax || !options.ajax.dataSrc) return options;

      // replace dataSrc (which transforms the received data)
      const { dataSrc } = options.ajax;
      options.ajax.dataSrc = (data) => {
        const otherCollections = this.collections.slice(1);
        const otherData = otherCollections.map(({ name, query }) =>
          ajax.querySMARTCollection(name, query)
        );

        // data returned from all collections
        const dataArr = [data].concat(otherData); // [[collection 1 data], [collection 2 data],...]

        // process using dataSrc function
        const transformedDataArr = dataArr.map(dataSrc);

        // decorates actions with data-collectionid
        const withDataBinding = (collectionIdx) => (row) => {
          const actionStringIndex = row.findIndex(
            (val) => typeof val == "string" && val.includes("action_")
          );

          const { id } = this.collections[collectionIdx];

          row[actionStringIndex] = row[actionStringIndex].replaceAll(
            "data-key",
            `data-collectionid="${id}" data-key`
          );

          return row;
        };

        // decorate all actions
        const decoratedRowsArr = transformedDataArr.map((rows, collectionIdx) =>
          rows.map(withDataBinding(collectionIdx))
        );

        // flatten data into one array
        const allData = [].concat(...decoratedRowsArr);

        return allData;
      };

      return options;
    },
  };
});
