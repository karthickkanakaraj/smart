//# sourceURL=lib/mixins/PropertyMixin.js

define([
  "../app/SMART/lib/helpers/ajax"
], function (ajax) {
  return {
    initialize: function () {
      const activeProperties = ajax.getActiveProperties()

      if (activeProperties.length == 0)
        throw `No properties matching user's roles.`;

      this.activeProperties = activeProperties;
      
      this.userFunctions = ajax.getFunctions();
    },
  };
});
