//# sourceURL=lib/mixins/PropertyDropdownMixin.js

define([], function () {
  return {
    defaults: {
      propertyDropdown: {
        el: "#PropertyDropdown",
      },
    },

    initialize: function () {
      this.propertyDropdown = {
        ...this.defaults.propertyDropdown,
        ...this.options.propertyDropdown,
      };

      if (!this.propertyDropdown.el)
        throw "[Invalid Option]: 'propertyDropdown.el' is undefined.";
    },

    render: function () {

      var newProps = [];
      for (prop of this.activeProperties) {
          
        // Sydney currently ony uses 3 scenarios. 
        if (this.scenarioTypeCode == undefined ||
           (((this.scenarioTypeCode == "EmployeeCardSwipe" ||
              this.scenarioTypeCode == "CustomerCardSwipe" ||
              this.scenarioTypeCode == "CustomerAndEmployeeCardSwipe") &&
              prop.id == 3) || prop.id == 1)) 
        newProps.push('<option value="' + prop.id + '">' + prop.name + '</option>');
     } 

      $(this.propertyDropdown.el).append(newProps);
    },
  };
});
