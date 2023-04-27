var dataSupplierService = angular.module("dataSupplierService", []);
var sequenceMatcherService = angular.module("sequenceMatcherService", []);
var colorService = angular.module("colorService", []);
var sequenceDialogService = angular.module("sequenceDialogService", [
  "colorService",
]);
var backendService = angular.module("backendService", ["ngResource"]);
var dataCollectionService = angular.module("dataCollectionService", [
  "sequenceMatcherService",
  "MinIONAppFilters",
  "dataSupplierService",
]);
var dialogService = angular.module("dialogService", ["ngDialog"]);

dataCollectionService.factory("DataCollection", [
  "$interval",
  "transcriberFilter",
  "SequenceMatcher",
  "DataChunk",
  function ($interval, transcriberFilter, SequenceMatcher, DataChunk) {
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
              d.rate += SequenceMatcher.count(
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

dataSupplierService.factory("DataChunk", [
  function ($interval) {
    return {
      weights: [],
      getBuffer: function (bufferSize, weights) {
        this.weights = weights;
        var i;
        var buffer = " ";
        for (i = 0; i < bufferSize; i++) buffer += this.getChunk();
        return buffer;
      },
      getChunk: function () {
        return this.getBit() * 16 + this.getBit() * 4 + this.getBit() * 1 + " ";
      },
      getBit: function () {
        return this.weight(Math.random());
      },
      weight: function (randomNumber) {
        var range = this.weights[0];
        var i = 1;

        do {
          if (randomNumber < range) return i - 1;

          range += this.weights[i];
          i++;
        } while (i <= this.weights.length);

        return i - 1;
      },
    };
  },
]);

sequenceMatcherService.factory("SequenceMatcher", [
  function () {
    return {
      count: function (needle, haystack) {
        var count = 0;
        var pos = haystack.indexOf(needle);

        while (pos !== -1) {
          count++;
          pos = haystack.indexOf(needle, pos + 1);
        }

        return count;
      },
    };
  },
]);

colorService.factory("Color", [
  function () {
    return {
      get: d3.scale.category20(),
    };
  },
]);

sequenceDialogService.factory("SequenceEditor", [
  "Color",
  function (Color) {
    return {
      counter: -1,

      editSequence: function (editId, editSeq, sequences) {
        var REGEX = /\S{4,}|[^AGCT\s]|((^|\s)\S{1,2}($|\s))/;

        if (editSeq.structure === "" || editSeq.name === "") return false;

        if (REGEX.test(editSeq.structure)) return false;

        if (editId === -1) {
          if (this.counter === -1) this.counter = sequences.length;

          editSeq.color = Color.get(++this.counter);
        } else sequences[editId] = angular.copy(editSeq);

        return true;
      },
    };
  },
]);

backendService.factory("BackendConnection", [
  "$resource",
  "$filter",
  "$window",
  "Color",
  "$http",
  function ($resource, $filter, $window, Color, $http) {
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
              this[key].color = Color.get(key);
            },
            data
          );
        });

        return data;
      },
    };
  },
]);

dialogService.factory("Dialog", [
  "ngDialog",
  function (ngDialog) {
    return {
      openedDialog: "",
      open: function (seqId, global, sequences, scope) {
        global.seqError = false;
        global.dialogOpen = true;

        if (typeof(seqId) === 'number') {
          global.id = seqId;
          global.editSeq = angular.copy(sequences[seqId]);
          global.deleteDisable = false;
        } else {
          return alert("Implementar Adição");
        }

        this.openedDialog = ngDialog.open({
          template: "popup.html",
          className: "ngdialog-theme-default",
          scope: scope,
        });
      },
      close: function (global) {
        this.openedDialog.close();
        global.dialogOpen = false;

        return true;
      },
    };
  },
]);
