const { Zip } = require('zlibjs/bin/zip.min').Zlib;

function strToUtf8Array(str: string) {
  var n = str.length,
    idx = -1,
    bytes = [],
    i, j, c;

  for (i = 0; i < n; ++i) {
    c = str.charCodeAt(i);
    if (c <= 0x7F) {
      bytes[++idx] = c;
    } else if (c <= 0x7FF) {
      bytes[++idx] = 0xC0 | (c >>> 6);
      bytes[++idx] = 0x80 | (c & 0x3F);
    } else if (c <= 0xFFFF) {
      bytes[++idx] = 0xE0 | (c >>> 12);
      bytes[++idx] = 0x80 | ((c >>> 6) & 0x3F);
      bytes[++idx] = 0x80 | (c & 0x3F);
    } else {
      bytes[++idx] = 0xF0 | (c >>> 18);
      bytes[++idx] = 0x80 | ((c >>> 12) & 0x3F);
      bytes[++idx] = 0x80 | ((c >>> 6) & 0x3F);
      bytes[++idx] = 0x80 | (c & 0x3F);
    }
  }
  return bytes;
}

interface IMessageEvent extends MessageEvent {
  data: {
    zipFiles: Array<{
      fileName: string;
      binaryData: Uint8Array;
    }>;
  }
}

const ctx: Worker = self as any;

ctx.addEventListener('message', (event: IMessageEvent) => {
  const { zipFiles } = event.data;

  const zip = new Zip();

  zipFiles.forEach((zipFile) => {
    zip.addFile(zipFile.binaryData, {
      filename: strToUtf8Array(zipFile.fileName),
    });
  });

  ctx.postMessage({
    status: 'complete',
    compressData: zip.compress(),
  });
});

export default ctx;
