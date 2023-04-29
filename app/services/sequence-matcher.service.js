(function () {
  "use strict";

  angular
    .module("sequenceMatcher", [])
    .factory("sequenceMatcherService", sequenceMatcherService)

  function sequenceMatcherService() {
    return {
      count: count
    };

    ///////////////////////////////////

    function count(needle, haystack) {
      var count = 0;
      var pos = haystack.indexOf(needle);

      while (pos !== -1) {
        count++;
        pos = haystack.indexOf(needle, pos + 1);
      }

      return count;
    }
  }
}());