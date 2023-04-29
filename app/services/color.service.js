(function () {
  'use strict';

  angular
    .module("colors", [])
    .factory('colorService', colorService);

  function colorService() {
    const service = {
      get: getColor()
    }

    return service;

    /////////////////////////////

    function getColor() {
      console.log('getColor');
      return d3.scale.category20();
    }
  }
}());