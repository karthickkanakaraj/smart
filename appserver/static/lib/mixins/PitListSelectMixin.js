//# sourceURL=lib/mixins/PitListSelectMixin.js

require.config({
  paths: {
    text: "../app/SMART/lib/text",
    mixins: "../app/SMART/lib/mixins",
  },
});

define([
  "text!mixins/PitListSelectMixin.html",
  "../app/SMART/lib/helpers/ajax",
], function (template, ajax) {
  const moveOptionToFn = function (destinationList) {
    return (index, option) => $(option).detach().appendTo(destinationList);
  };

  return {
    defaults: {
      pitListSelect: {
        collection: "SMART-Pits",
        el: "#PitListSelect",
      },
    },

    events: {
      "click .addSome": "onClick_AddSome",
      "click .addAll": "onClick_AddAll",
      "click .removeSome": "onClick_RemoveSome",
      "click .removeAll": "onClick_RemoveAll",
    },

    initialize: function () {
      this.pitListSelect = {
        ...this.defaults.pitListSelect,
        ...this.options.pitListSelect,
      };
    },

    getAllPits: function () {
      const pits = ajax.getSMARTCollection(this.pitListSelect.collection);
      const allPits = pits.map(({ PitCode }) => PitCode);
      return allPits;
    },

    getSelectedPits: function () {
      return this.pitListSelect.getSelectedPitsFn
        ? this.pitListSelect.getSelectedPitsFn()
        : [];
    },

    prepareModal_Add: function () {
      this.preparePitListSelect();
    },

    prepareModal_Edit: function () {
      const toPits = this.getSelectedPits();
      this.preparePitListSelect(toPits);
    },

    prepareModal_Delete: function () {
      const toPits = this.getSelectedPits();
      this.preparePitListSelect(toPits);
    },

    // argument 'toPits': array of pits to populate #pitLiftTo
    preparePitListSelect: function (toPits = []) {
      // clear all options from both lists
      $(".fromList option, .toList option", this.pitListSelect.el).each(
        (index, option) => $(option).remove()
      );

      const allPits = this.getAllPits();
      const fromPits = allPits.filter((pit) => !toPits.includes(pit));

      const pitToOptionFn = (pit) =>
        `<option value="${pit}">Pit - ${pit}</option>`;

      // populate each list
      $(".fromList", this.pitListSelect.el).append(fromPits.map(pitToOptionFn));
      $(".toList", this.pitListSelect.el).append(toPits.map(pitToOptionFn));

      this.sortPitLists();
    },

    onClick_AddSome: function () {
      $(".fromList :selected", this.pitListSelect.el).each(
        moveOptionToFn(".toList")
      );
      this.sortPitLists();
    },

    onClick_AddAll: function () {
      $(`.fromList option`, this.pitListSelect.el).each(
        moveOptionToFn(".toList")
      );
      this.sortPitLists();
    },

    onClick_RemoveSome: function () {
      $(".toList :selected", this.pitListSelect.el).each(
        moveOptionToFn(".fromList")
      );
      this.sortPitLists();
    },

    onClick_RemoveAll: function () {
      $(`.toList option`, this.pitListSelect.el).each(
        moveOptionToFn(".fromList")
      );
      this.sortPitLists();
    },

    sortPitLists: function () {
      const lists = [".fromList", ".toList"];

      const sortListFn = (a, b) => a.value - b.value;

      lists.forEach((list) =>
        $(`${list} option`, this.pitListSelect.el)
          .detach()
          .sort(sortListFn)
          .appendTo(list)
      );
    },

    render: function () {
      $(this.pitListSelect.el).html(template);
    },
  };
});
