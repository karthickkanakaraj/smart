//# sourceURL=lib/mixins/SMARTCollectionMixin.js

define(["../app/SMART/lib/helpers/ajax"], function (ajax) {
  return {
    initialize: function () {
      if (this.options.collection) this.collection = this.options.collection;
    },

    getCollection: function () {
      if (!this.collection) throw "collection is undefined.";

      return ajax.getSMARTCollection(this.collection);
    },

    // w/  key returns record
    // w/o key returns collection
    getRecord: function (key) {
      if (!this.collection) throw "collection is undefined.";

      return ajax.getSMARTCollection(this.collection, key);
    },

    // adds new record to collection
    addRecord: function (record) {
      if (!this.collection) throw "collection is undefined.";
      if (!record) throw "[Invalid argument] 'record' undefined.";

      const { _key } = ajax.postSMARTCollection(this.collection, null, record);
      this.onAddSuccess(_key, record);
      return _key;
    },

    // replaces data in record matching key
    updateRecord: function (key, record) {
      if (!this.collection) throw "collection is undefined.";
      if (!key) throw "[Invalid argument] 'key' undefined.";
      if (!record) throw "[Invalid argument] 'record' undefined.";

      ajax.postSMARTCollection(this.collection, key, record);
      this.onUpdateSuccess(key, record);
      return key;
    },

    // deletes record matching key
    deleteRecord: function (key) {
      if (!this.collection) throw "collection is undefined.";
      if (!key) throw "[Invalid argument] 'key' undefined.";

      ajax.deleteSMARTCollection(this.collection, key);
      this.onDeleteSuccess(key);
      return key;
    },

    onAddSuccess: function (key) {},

    onUpdateSuccess: function (key) {},

    onDeleteSuccess: function (key) {},
  };
});
