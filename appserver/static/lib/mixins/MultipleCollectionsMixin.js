//# sourceURL=lib/mixins/MutipleCollectionsMixin.js

define([], function () {
  return {
    initialize: function () {
      if (!this.options.collections)
        throw "[Invalid Option]: 'collections' is undefined.";
      if (this.options.collections.length == 0)
        throw "[Invalid Option]: 'collections' is empty.";

      this.collections = this.options.collections;

      // default to first collection
      this.collection = this.collections[0].name;
      this.collectionID = this.collections[0].id;
    },

    toggleCollection: function (id) {
      const collection = this.collections.find(({ id: _id }) => _id == id);

      if (!collection) throw `No collection with 'id' of '${id}'.`;

      this.collectionID = collection.id;
      this.collection = collection.name;
    },
  };
});
