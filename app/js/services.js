var dataCollectionService = angular.module("dataCollectionService", [
  "sequenceMatcher",
  "MinIONAppFilters",
  "dataSupplierService",
]);

dataCollectionService.factory("DataCollection", [
  "$interval",
  "transcriberFilter",
  "sequenceMatcherService",
  "DataChunk",
  function ($interval, transcriberFilter, sequenceMatcherService, DataChunk) {
    return {
      interval: "",
      stop: function () {
        $interval.cancel(this.interval);
      },
      start: function (rate, bufferSize, global, buffer, sequences, weights) {
        this.interval = $interval(function () {
          global.counter += bufferSize;
          buffer = DataChunk.getBuffer(bufferSize, weights);
          angular.forEach(
            sequences,
            function (value, key) {
              var d = this[key];
              d.rate += sequenceMatcherService.count(
                transcriberFilter(d.structure),
                buffer
              );
              d.prob = (d.rate * 100) / global.counter;
            },
            sequences
          );
        }, rate);
      },
    };
  },
]);
