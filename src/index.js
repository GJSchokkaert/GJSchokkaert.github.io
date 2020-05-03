import * as d3 from "d3";
import vwviz from "@ordvw/vwviz";
import "./style.css";

// get data and render the chart
var urls = [
  "https://api.jsonbin.io/b/5eae7671a47fdd6af15c9f2d",
  "https://api.jsonbin.io/b/5eae7641a47fdd6af15c9f23",
];

Promise.all(
  urls.map((url) =>
    d3.json(url, {
      headers: new Headers({
        "secret-key":
          "$2b$10$PyLg4KMveulacnJ/hnvUheHJgtJ64mIqG5BanqrYvaXnnIxfEarUC",
      }),
    })
  )
).then(function (values) {
  var [users, ranks] = values;
  renderChart(users, ranks);
});

/**
 *Renders the chart
 * @param {*} error
 * @param {*} users
 * @param {*} ranks
 */
function renderChart(users, ranks) {
  var _users = createMap(users, "userId");

  var theChart = vwviz
    .bump()
    .xVar((d) => "Ronde " + d.round)
    .yVar((d) => _users.get(d.userId).nameLong)
    .yVarShort((d) => _users.get(d.userId).nameShort)
    .valueVar("rank")
    .colorVar((d) => d3.schemeSet3[d.userId + 1])
    .showLabelCircles({ start: true, change: true, end: true })
    .data(ranks);

  let parentDiv = d3.select(".chart-container");
  parentDiv.call(theChart);
}

// util functions
function createMap(data, variable, single, rollup) {
  single = single !== undefined ? single : true;

  var nestFunction = d3.nest();
  if (Array.isArray(variable)) {
    _.each(variable, function (v) {
      nestFunction.key(function (d) {
        return d[v] === undefined ? "null" : d[v];
      });
    });
  } else {
    nestFunction.key(function (d, i) {
      return variable === ""
        ? d
        : getAccessor(d, i, variable) === undefined
        ? "null"
        : getAccessor(d, i, variable);
    });
  }

  data = nestFunction
    .rollup(function (d) {
      var result = single ? d[0] : d;
      result = rollup ? rollup(result) : result;
      return result;
    })
    .map(data);
  return data;
}

function getAccessor(d, i, a) {
  if (typeof a === "string") {
    return d[a];
  } else if (typeof a === "function") {
    return a(d, i);
  } else {
    return a;
  }
}
