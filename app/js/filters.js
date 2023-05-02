(function () {
  "use strict";

  angular
    .module("MinIONAppFilters", [])
    .filter("bigNumber", bigNumber)
    .filter("transcriber", transcriber);

  function bigNumber() {
    return function (input) {
      var order = "";
      var number = 0;
      var zeros = "";

      if (100 < input && input < 100000) {
        order = "K";
        number = Math.round(input / 10) / 100;
      } else if (100 < input && input < 100000000) {
        order = "M";
        number = Math.round(input / 10000) / 100;
      } else if (100 < input && input < 100000000000) {
        order = "G";
        number = Math.round(input / 100000000) / 100;
      } else return input;

      if (Math.round(number * 100) % 100 === 0) zeros = ".00";
      else if (Math.round(number * 100) % 10 === 0) zeros = "0";

      return number + zeros + " " + order;
    };
  }

  function transcriber() {
    return function (input) {
      var groups = input.split(" ");
      var output = " ";
      var acids = {
        A: 0,
        G: 1,
        T: 2,
        C: 3,
      };

      groups.forEach(function (d) {
        output +=
          acids[d.charAt(0)] * 16 +
          acids[d.charAt(1)] * 4 +
          acids[d.charAt(2)] +
          " ";
      });
      return output;
    };
  }
}());
