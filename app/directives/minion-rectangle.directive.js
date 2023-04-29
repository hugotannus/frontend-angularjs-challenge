(function () {
  'use strict';

  angular
    .module('MinIONApp')
    .directive("minionRectangle", minionRectangle);

  function minionRectangle() {
    return {
      restrict: "AE",
      replace: true,
      template: function () {
        return '<div class="paddingHack"><svg class="rect" viewBox = "0 0 100 100" style = "fill:{{sequence.color}}"><rect x = "0" y = "0" width = "200" height = "200" /></svg></div>';
      },
    };
  }
}());