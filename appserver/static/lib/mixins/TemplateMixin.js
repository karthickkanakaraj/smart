//# sourceURL=lib/mixins/TemplateMixin.js

define([], function () {
  return {
    initialize: function () {
      if (!this.options.template)
        throw "[Invalid Option]: 'template' is undefined.";
    },

    render: function () {
      this.$el.html(this.options.template);
    },
  };
});
