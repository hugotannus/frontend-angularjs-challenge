(function () {
  "use strict";

  angular
    .module("sequenceDialogService", ["colors"])
    .factory("sequenceEditor", sequenceEditor);

  sequenceEditor.$inject = ['colorService']

  function sequenceEditor(colorService) {
    const self = this;

    self.counter = -1;

    const service = {
      counter: self.counter,
      getCounter: getCounter,
      editSequence: editSequence
    }

    return service;

    ///////////////////////////////////////

    function editSequence(editId, editSeq, sequences) {
      var REGEX = /\S{4,}|[^AGCT\s]|((^|\s)\S{1,2}($|\s))/;

      if (editSeq.structure === "" || editSeq.name === "") return false;

      if (REGEX.test(editSeq.structure)) return false;

      if (editId === -1) {
        if (self.counter === -1) self.counter = sequences.length;

        editSeq.color = colorService.get(++self.counter);

        sequences.push(angular.copy(editSeq));
      } else {
        sequences[editId] = angular.copy(editSeq);
      }

      return true;
    };

    function getCounter() {
      return self.counter;
    }
  }
}());