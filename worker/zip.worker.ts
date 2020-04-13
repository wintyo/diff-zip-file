const { Zip } = require('zlibjs/bin/zip.min').Zlib;

import { strToUtf8ByteArray } from '~/utils/converts';

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
      filename: strToUtf8ByteArray(zipFile.fileName),
    });
  });

  ctx.postMessage({
    status: 'complete',
    compressData: zip.compress(),
  });
});

export default ctx;
