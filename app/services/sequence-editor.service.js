(function () {
  "use strict";

  angular
    .module("sequenceDialogService", ["colors"])
    .factory("SequenceEditor", sequenceEditor);

  sequenceEditor.$inject = ['colorService']

  function sequenceEditor(colorService) {
    var counter = -1;

    return {
      counter: counter,
      editSequence: editSequence
    }

    ///////////////////////////////////////

    function editSequence(editId, editSeq, sequences) {
      var REGEX = /\S{4,}|[^AGCT\s]|((^|\s)\S{1,2}($|\s))/;

      if (editSeq.structure === "" || editSeq.name === "") return false;

      if (REGEX.test(editSeq.structure)) return false;

      if (editId === -1) {
        if (counter === -1) counter = sequences.length;

        editSeq.color = colorService.get(++counter);

        sequences.push(angular.copy(editSeq));
      } else {
        sequences[editId] = angular.copy(editSeq);
      }

      return true;
    };
  }
}());