(function () {
  "use strict";

  angular
    .module("dataSupplierService", [])
    .factory("DataChunk", DataChunk);

  function DataChunk() {
    var weightsData = [];

    return {
      getBit: getBit,
      getBuffer: getBuffer,
      getChunk: getChunk,
      weight: weight,
      weights: weightsData,
    }

    /////////////

    function getBit() {
      return weight(Math.random());
    };

    function getBuffer(bufferSize, weights) {
      weightsData = weights;
      var i;
      var buffer = " ";
      for (i = 0; i < bufferSize; i++) buffer += getChunk();

      return buffer;
    };

    function getChunk() {
      return getBit() * 16 + getBit() * 4 + getBit() * 1 + " ";
    };

    function weight(randomNumber) {
      var range = weightsData[0];
      var i = 1;

      do {
        if (randomNumber < range) return i - 1;

        range += weightsData[i];
        i++;
      } while (i <= weightsData.length);

      return i - 1;
    };
  }
}());