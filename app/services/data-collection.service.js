(function () {
  "use strict";

  angular
    .module("dataCollectionService", ["sequenceMatcher", "MinIONAppFilters", "dataSupplierService"])
    .factory("DataCollection", DataCollection);

  DataCollection.$inject = [
    "$interval", "transcriberFilter", "sequenceMatcherService", "DataChunk"
  ];

  function DataCollection($interval, transcriberFilter, sequenceMatcherService, DataChunk) {
    const self = this;

    self.interval = "";

    return {
      stop: stop,
      start: start
    }

    function start(rate, bufferSize, global, buffer, sequences, weights) {
      self.interval = $interval(countingTask, rate);

      function countingTask() {
        global.counter += bufferSize;
        buffer = DataChunk.getBuffer(bufferSize, weights);

        angular.forEach(sequences, countSequence, sequences);

        function countSequence(_value, key) {
          var sequence = this[key];
          var transcribed = transcriberFilter(sequence.structure);

          sequence.rate += sequenceMatcherService.count(transcribed, buffer);
          sequence.prob = (sequence.rate * 100) / global.counter;
        }
      }
    }

    function stop() {
      $interval.cancel(self.interval);
    };
  }
}());
