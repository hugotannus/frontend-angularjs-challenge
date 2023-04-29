(function () {
  'use strict';

  angular
    .module("colors", [])
    .factory('colorService', colorService);

  function colorService() {
    return {
      get: getColor()
    }

    /////////////////////////////

    function getColor() {
      return d3.scale.category20();
    }
  }
}());