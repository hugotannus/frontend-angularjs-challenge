var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
var filename;

app = express();

app.use(express.static(__dirname + "/build"));
app.use(bodyParser.json());

app.listen(8080);

console.log("Listening on port 8080");

app.post("/report.txt", function (req, res) {
  var output = "Analysis report:\n\n";
  var length;
  var i;
  var data;
  var total;
  var wstream;

  filename = Date.now().toString();
  wstream = fs.createWriteStream(filename);

  res.sendStatus(200);
  length = req.body.length - 1;
  output += req.body[length].date + "\n\n";
  total = req.body[length].samples;
  output += "Samples analysed: " + total + "\n\n";
  for (i = 0; i < length; i++) {
    data = req.body[i];
    output +=
      data.name +
      "\n\tStructure:\t" +
      data.structure +
      "\n" +
      "\tSamples found:\t" +
      data.rate +
      "\n" +
      "\t\t\t" +
      Math.round(data.prob * 100000) / 100000 +
      " %\n\n";
  }

  wstream.write(output);
  wstream.end();
});

app.get("/report.txt", function (_req, res) {
  res.type("text");

  var filepath = [__dirname, filename].join('/');
  res.download(filepath, "report.txt", function (err) {
    if (!err) console.error("Download report");
    fs.unlink(filepath, err => err && console.err(err));
  });
});
