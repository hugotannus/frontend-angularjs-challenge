MinIONApp.directive("barsChart", function ($parse) {
  var directiveDefinitionObject = {
    restrict: "E",
    replace: false,
    scope: { data: "=chartData" },
    link: function (scope, element, attrs) {
      var chart = d3
        .select(element[0])
        .append("svg")
        .attr("class", "chart")
        .attr("viewBox", "0 0 400 400");
      var width = 400;
      var height = 400;
      var gap = 10;
      var margin = { left: 40 };

      var y = d3.scale.linear().domain([0, 0.25]).range([height, 0]);

      var redrawChart = function () {
        chart
          .select("g.grid")
          .call(
            make_y_axis()
              .tickSize(-width, 20, 0)
              .tickPadding(-25)
              .tickFormat(d3.format(".2%"))
          )
          .selectAll("text")
          .attr("style", "text-anchor:middle")
          .attr("dy", -2)
          .attr("dx", 2);
      };

      function make_y_axis() {
        return d3.svg.axis().scale(y).orient("left").ticks(5);
      }

      chart
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 500)
        .attr("height", 500)
        .attr("style", "fill:white");

      chart.append("g").attr("class", "grid");

      redrawChart();
      chart.append("g").attr("class", "barContainer");

      scope.$watch(
        "data",
        function () {
          if (angular.isUndefined(scope.data)) return;
          var data = scope.data;
          var newDomain;
          var a, b;

          var max = d3.max(data, function (d) {
            return d.prob / 100;
          });
          var currentDomain = y.domain()[1];

          if ((a = currentDomain < max) || currentDomain > max * 2.1) {
            if (a) y.domain([0, currentDomain * 2]);
            else y.domain([0, currentDomain / 2]);

            chart.select("g.grid").selectAll("*").remove();
            redrawChart();
          }

          var barWidth = (width - gap - margin.left) / data.length;

          var bar = chart
            .select("g.barContainer")
            .selectAll("g.bars")
            .data(data);

          bar
            .transition()
            .duration(100)
            .attr("transform", function (d, i) {
              return "translate(" + (gap + i * barWidth + margin.left) + ",0)";
            });

          bar
            .select("rect")
            .attr("style", function (d) {
              return "fill:" + d.color;
            })
            .attr("width", barWidth - gap)
            .transition()
            .ease("linear")
            .attr("y", function (d) {
              return y(d.prob / 100);
            });

          bar
            .enter()
            .append("g")
            .attr("class", "bars")
            .attr("transform", function (d, i) {
              return "translate(" + (gap + i * barWidth + margin.left) + ",0)";
            })
            .append("rect")
            .attr("y", function (d) {
              return y(d.prob / 100);
            })
            .attr("height", 1000)
            .attr("width", barWidth - gap)
            .attr("style", function (d) {
              return "fill:" + d.color;
            });

          bar.exit().remove();
        },
        true
      );
    },
  };
  return directiveDefinitionObject;
});
