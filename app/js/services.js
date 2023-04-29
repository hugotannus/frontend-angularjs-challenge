var backendService = angular.module("backendService", ["ngResource"]);
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

backendService.factory("BackendConnection", [
  "$resource",
  "$filter",
  "$window",
  "colorService",
  "$http",
  function ($resource, $filter, $window, colorService, $http) {
    return {
      Data: $resource("strands/strands.json"),
      save: function (sequences, counter) {
        var report = sequences.slice(0);

        report.push({
          samples: counter,
          date: $filter("date")(Date.now(), "medium"),
        });
        $http.post("report.txt", report).success(function () {
          $window.location.href = "/report.txt";
        });
      },
      get: function () {
        var data = this.Data.query(function (data) {
          angular.forEach(
            data,
            function (value, key) {
              this[key].color = colorService.get(key);
            },
            data
          );
        });

        return data;
      },
    };
  },
]);
