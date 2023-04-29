var sequenceMatcherService = angular.module("sequenceMatcherService", []);
var sequenceDialogService = angular.module("sequenceDialogService", [
  "colors",
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

sequenceDialogService.factory("SequenceEditor", [
  "colorService",
  function (colorService) {
    return {
      counter: -1,

      // Argumentos esperados para editar uma sequência
      editSequence: function (editId, editSeq, sequences) {
        var REGEX = /\S{4,}|[^AGCT\s]|((^|\s)\S{1,2}($|\s))/;

        if (editSeq.structure === "" || editSeq.name === "") return false;

        if (REGEX.test(editSeq.structure)) return false;

        if (editId === -1) {
          if (this.counter === -1) this.counter = sequences.length;

          editSeq.color = colorService.get(++this.counter);

          sequences.push(angular.copy(editSeq));
        } else {
          sequences[editId] = angular.copy(editSeq);
        }

        return true;
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

dialogService.factory("Dialog", [
  "ngDialog",
  function (ngDialog) {
    return {
      openedDialog: "",
      open: function (seqId, global, sequences, scope) {
        global.seqError = false;
        global.dialogOpen = true;

        if (typeof (seqId) === 'number') {
          global.id = seqId;
          global.editSeq = angular.copy(sequences[seqId]);
          global.deleteDisable = false;
        } else {
          global.id = -1;
          global.deleteDisable = true;
          global.editSeq = {
            name: "",
            structure: "",
            rate: 0,
            prob: 0
          }
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
