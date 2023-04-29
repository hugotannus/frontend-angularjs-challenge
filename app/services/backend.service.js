(function () {
  "use strict"

  angular
    .module("backendService", ["ngResource"])
    .factory("BackendConnection", BackendConnection);

  BackendConnection.$inject = [
    "$resource", "$filter", "$window", "colorService", "$http"
  ]

  function BackendConnection($resource, $filter, $window, colorService, $http) {
    const StrandsData = $resource("strands/strands.json");
    const FileName = 'report.txt';
    const LocationPath = '';

    return {
      get: get,
      save: save
    };

    ///////////////////////////////////////////

    function get() {
      return StrandsData.query(extractDataFromJson);
    };

    function save(sequences, counter) {
      var report = sequences.slice(0);

      report.push({
        samples: counter,
        date: getCurrentTime(),
      });

      $http.post(FileName, report).success(function () {
        $window.location.href = [LocationPath, FileName].join('/');
      });
    };

    // #region Private Functions

    function extractDataFromJson(data) {
      angular.forEach(data, getColorFromPalette, data);

      function getColorFromPalette(_value, key) {
        this[key].color = colorService.get(key);
      }
    }

    function getCurrentTime() {
      return $filter("date")(Date.now(), "medium")
    }

    // #endregion
  }
}());