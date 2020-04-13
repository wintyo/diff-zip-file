// @ts-ignore
importScripts('https://cdnjs.cloudflare.com/ajax/libs/encoding-japanese/1.0.30/encoding.min.js');

declare var Encoding: {
  detect: (charCodes: Array<number>) => string;
  convert: (charCodes: Array<number>, charCode: string) => Array<number>;
};

const { Unzip } = require('zlibjs/bin/unzip.min').Zlib;

import { utf8ByteArrayToStr } from '~/utils/converts';

const ctx: Worker = self as any;

ctx.addEventListener('message', (event) => {
  const { fileBinary } = event.data;

  const unzip = new Unzip(fileBinary);
  const fileNames: Array<string> = unzip.getFilenames();

  const zipFileInfoList = fileNames.map((fileName, index) => {
    const charCodes = fileName.split('').map((char) => char.charCodeAt(0));
    console.log('文字コード：', Encoding.detect(charCodes));
    ctx.postMessage({
      status: 'progress',
      loaded: index + 1,
      total: fileNames.length,
    });
    return {
      fileName: utf8ByteArrayToStr(Encoding.convert(charCodes, 'UTF8')),
      binaryData: unzip.decompress(fileName),
    };
  });

  zipFileInfoList.sort((a, b) => {
    return (a.fileName > b.fileName) ? 1 : -1;
  });

  ctx.postMessage({
    status: 'complete',
    zipFileInfoList,
  });
});

export default ctx;
