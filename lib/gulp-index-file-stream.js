var Readable = require('stream').Readable;
var posixPath = require('path-posix');
var util = require('util');
var File = require('vinyl');

// Because the index.html files in our site don't necessarily
// come from individual files, it's easiest for us to just
// create a stream that emits Vinyl File objects rather than
// using gulp.src().
function IndexFileStream(indexStatic) {
  Readable.call(this, {
    objectMode: true
  });
  this._baseDir = __dirname;
  this._indexStatic = indexStatic;
  this._urls = indexStatic.URLS.slice();
}

util.inherits(IndexFileStream, Readable);

IndexFileStream.prototype._read = function() {
  if (this._urls.length == 0)
    return this.push(null);
  var url = this._urls.pop();
  var indexFile = posixPath.join(
    this._baseDir,
    posixPath.join.apply(posixPath, url.split('/').slice(1, -1)),
    'index.html'
  );

  this._indexStatic.generate(url, {
    baseURL: posixPath.relative(url, '/')
  }, function(html) {
    this.push(new File({
      cwd: this._baseDir,
      base: this._baseDir,
      path: indexFile,
      contents: new Buffer(html)
    }));
  }.bind(this));
};

module.exports = IndexFileStream;
