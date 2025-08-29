//# sourceURL=lib/mixins/MinMaxInputsMixin.js

define([], function () {
  return {
    defaults: { minMaxInputs: [] },

    initialize() {
      this.minMaxInputs =
        this.options.minMaxInputs || this.defaults.minMaxInputs;
    },

    render() {
      this.minMaxInputs.forEach(([min, max]) =>
        // when focus leaves min field
        $(min).on("focusout", () => {
          const minVal = $(min).val();
          const maxVal = $(max).val();

          // check if max field is empty
          const maxIsEmpty = maxVal === "";

          // fill empty max with min value
          if (maxIsEmpty) $(max).val(minVal);
        })
      );
    },
  };
});
