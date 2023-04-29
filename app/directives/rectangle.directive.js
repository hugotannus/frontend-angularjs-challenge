
MinIONApp.directive("minionRectangle", [
  "colorService",
  function (colorService) {
    return {
      restrict: "AE",
      replace: true,
      template: function (elem, attrs) {
        return '<div class="paddingHack"><svg class="rect" viewBox="0 0 100 100" style="fill:{{sequence.color}}"><rect x="0" y="0" width="200" height="200" /></svg></div>';
      },
    };
  },
]);