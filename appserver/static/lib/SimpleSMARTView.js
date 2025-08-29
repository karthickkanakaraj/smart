//# sourceURL=lib/SimpleSMARTView.js

require.config({
  paths: {
    cocktail: "../app/SMART/lib/Cocktail/Cocktail-0.5.15.min",
    mixins: "../app/SMART/lib/mixins",
  },
});

define([
  "splunkjs/mvc/simplesplunkview",
  "cocktail",
  // mixins are applied in order
  "mixins/TemplateMixin",
  "mixins/SMARTCollectionMixin",
  "mixins/PropertyMixin",
  "mixins/DataTablesMixin",
  "mixins/DataTablesFilterByRoleMixin",
  "mixins/DataTablesSuppressMissingValueAlertMixin",
  "mixins/DataTablesFixWidthMixin",
  "mixins/ModalMixin",
  "mixins/PropertyDropdownMixin",
], function (SimpleSplunkView, Cocktail, ...mixins) {
  return Cocktail.mixin(SimpleSplunkView, ...mixins);
});
