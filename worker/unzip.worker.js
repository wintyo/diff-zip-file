importScripts('https://cdnjs.cloudflare.com/ajax/libs/encoding-japanese/1.0.30/encoding.min.js');

const { Unzip } = require('zlibjs/bin/unzip.min').Zlib;

// https://tutorialmore.com/questions-1371393.htm
function utf8ArrayToStr(array) {
  var out, i, len, c;
  var char2, char3, char4;
  out = "";
  len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12:
      case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
          ((char2 & 0x3F) << 6) |
          ((char3 & 0x3F) << 0));
        break;
      case 15:
        // 1111 0xxx 10xx xxxx 10xx xxxx 10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        char4 = array[i++];
        out += String.fromCodePoint(((c & 0x07) << 18) | ((char2 & 0x3F) << 12) | ((char3 & 0x3F) << 6) | (char4 & 0x3F));
        break;
    }
  }
  return out;
}

self.addEventListener('message', (event) => {
  const { fileBinary } = event.data;

  const unzip = new Unzip(fileBinary);
  const fileNames = unzip.getFilenames();

  const zipFileInfoList = fileNames.map((fileName, index) => {
    const charCodes = fileName.split('').map((char) => char.charCodeAt(0));
    console.log('文字コード：', Encoding.detect(charCodes));
    self.postMessage({
      status: 'progress',
      loaded: index + 1,
      total: fileNames.length,
    });
    return {
      fileName: utf8ArrayToStr(Encoding.convert(charCodes, 'UTF8')),
      binaryData: unzip.decompress(fileName),
    };
  });

  zipFileInfoList.sort((a, b) => {
    return (a.fileName > b.fileName) ? 1 : -1;
  });

  self.postMessage({
    status: 'complete',
    zipFileInfoList,
  });
});
