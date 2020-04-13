import ZipWorker from 'worker-loader!~/worker/zip.worker.ts';
import UnzipWorker from 'worker-loader!~/worker/unzip.worker.ts';

// interfaces
import { IFileInfo } from '~/interfaces/App';

/**
 * 圧縮する
 * @param data - workerに送るデータ
 * @param callbacks - コールバック関数群
 */
export function zip(
  data: { zipFiles: Array<{ fileName: string, binaryData: Uint8Array | Array<number> }> },
  callbacks: {
    progress?: (data: any) => void;
    complete?: (data: { compressData: Uint8Array }) => void;
  } = {}
) {
  const worker = new ZipWorker();
  worker.addEventListener('message', (event: any) => {
    const { status } = event.data;

    if (status === 'progress') {
      callbacks.progress && callbacks.progress(event.data);
    }
    if (status === 'complete') {
      callbacks.complete && callbacks.complete(event.data);
      worker.terminate();
    }
  });
  worker.postMessage(data);
}


/**
 * 解凍する
 * @param data - workerに渡すデータ
 * @param callbacks - コールバック関数群
 */
export function unzip(
  data: { fileBinary: Uint8Array },
  callbacks: {
    progress?: (data: { loaded: number, total: number }) => void;
    complete?: (data: { zipFileInfoList: Array<IFileInfo> }) => void;
  } = {}
) {
  const worker = new UnzipWorker();
  worker.addEventListener('message', (event: any) => {
    const { status } = event.data;

    if (status === 'progress') {
      callbacks.progress && callbacks.progress(event.data);
    }

    if (status === 'complete') {
      callbacks.complete && callbacks.complete(event.data);
      worker.terminate();
    }
  });
  worker.postMessage(data);
}

