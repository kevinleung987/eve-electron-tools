const fs = require('fs');
const f_angular = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js';

fs.readFile(f_angular, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  } else if (process.argv.length != 3) {
    return console.error('You must specify web or electron-renderer');
  }
  var target = process.argv[2];
  var result = data.replace(/target: "electron-renderer",/g, '');
  var result = result.replace(/target: "web",/g, '');
  var result = result.replace(/return \{/g, 'return {target: "' + target + '",');

  fs.writeFile(f_angular, result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});
