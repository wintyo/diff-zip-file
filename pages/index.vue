<template lang="pug">
div
  .zip-upload
    .zip-upload__block
      div BEFORE
      input(
        type="file"
        @change="(event) => { onUpload(event, 'A'); }"
      )
      span progress: {{ $data.progressA }}
      ul.file-list
        template(v-for="fileInfo in $data.zipFileInfoListA")
          li.file-list__item(
            :class="{\
              '-delete': _diffZipFileMap[fileInfo.fileName] === 'delete',\
            }"
          )
            | {{ fileInfo.fileName }}
    .zip-upload__block
      div AFTER
      input(
        type="file"
        @change="(event) => { onUpload(event, 'B'); }"
      )
      span progress: {{ $data.progressB }}
      ul.file-list
        template(v-for="fileInfo in $data.zipFileInfoListB")
          li.file-list__item(
            :class="{\
              '-add': _diffZipFileMap[fileInfo.fileName] === 'add',\
              '-change': _diffZipFileMap[fileInfo.fileName] === 'change',\
            }"
          )
            | {{ fileInfo.fileName }}
  div
    button(@click="onDownloadButtonClick")
      | 差分ダウンロード
</template>

<script lang="ts">
import { TypedVue } from '@wintyo/typed-vue';
const { Unzip } = require('zlibjs/bin/unzip.min').Zlib;
const { Zip } = require('zlibjs/bin/zip.min').Zlib;
import File from '../utils/File';

import UnzipWorker from 'worker-loader!~/worker/unzip.worker.ts';
import ZipWorker from 'worker-loader!~/worker/zip.worker.ts';

/**
 * 配列データが一緒か調べる
 * @param arr1
 * @param arr2
 * @returns {boolean}
 */
function checkSameArray(arr1: Uint8Array, arr2: Uint8Array) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

function strToUtf8Array(str: string): Array<number> {
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

/**
 * 解凍する
 * @param data - workerに渡すデータ
 * @param callbacks - コールバック関数群
 */
function unzip(data: { fileBinary: Uint8Array }, callbacks: any = {}) {
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

/**
 * 圧縮する
 * @param data - workerに送るデータ
 * @param callbacks - コールバック関数群
 */
function zip(
  data: { zipFiles: Array<{ fileName: string, binaryData: Uint8Array | Array<number> }> },
  callbacks: any = {}
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

/** ファイル情報 */
interface IFileInfo {
  /** ファイル名 */
  fileName: string;
  /** バイナリデータ */
  binaryData: Uint8Array;
}

/** 差分情報 */
interface IDiffStatusMap {
  [fileName: string]: 'same' | 'add' | 'change' | 'delete';
}

interface IData {
  /** ZIP展開後のファイル一覧その１ */
  zipFileInfoListA: Array<IFileInfo>;
  /** ZIP展開後のファイル一覧その２ */
  zipFileInfoListB: Array<IFileInfo>;
  /** その１の展開の進捗 */
  progressA: string;
  /** その２の展開の進捗 */
  progressB: string;
}

export default TypedVue.typedExtend({
  data(): IData {
    return {
      zipFileInfoListA: [],
      zipFileInfoListB: [],
      progressA: '',
      progressB: '',
    }
  },
  computed: {
    // 差分情報を返す
    _diffZipFileMap(): IDiffStatusMap {
      const diffZipFileMap: IDiffStatusMap = {};
      this.$data.zipFileInfoListA.forEach((fileInfoA) => {
        const fileInfoB = this.$data.zipFileInfoListB.find((fileInfoB) => fileInfoA.fileName === fileInfoB.fileName);
        if (!fileInfoB) {
          diffZipFileMap[fileInfoA.fileName] = 'delete';
          return;
        }
        if (checkSameArray(fileInfoA.binaryData, fileInfoB.binaryData)) {
          diffZipFileMap[fileInfoA.fileName] = 'same';
          return;
        }
        diffZipFileMap[fileInfoA.fileName] = 'change';
      });

      this.$data.zipFileInfoListB
        .filter((fileInfoB) => !diffZipFileMap[fileInfoB.fileName])
        .forEach((fileInfoB) => {
          diffZipFileMap[fileInfoB.fileName] = 'add';
        });
      return diffZipFileMap;
    },
  },
  methods: {
    /**
     * アップロード時
     * @param event - イベント
     * @param label - ラベル
     */
    onUpload(event: any, label: string) {
      if (!event.currentTarget.files) {
        return;
      }
      const file = event.currentTarget.files[0];

      const reader = new FileReader();
      reader.onloadend = () => {
        if (!reader.result) {
          return;
        }

        unzip({ fileBinary: new Uint8Array(reader.result as ArrayBuffer) }, {
          progress: (data: any) => {
            const progress = `${data.loaded}/${data.total}`;
            if (label === 'A') {
              this.$data.progressA = progress;
            } else {
              this.$data.progressB = progress;
            }
          },
          complete: (data: any) => {
            const { zipFileInfoList } = data;
            if (label === 'A') {
              this.$data.zipFileInfoListA = zipFileInfoList;
            } else {
              this.$data.zipFileInfoListB = zipFileInfoList;
            }
          },
        });
      };

      reader.readAsArrayBuffer(file);
    },
    onDownloadButtonClick() {
      const zipAddFiles = this.$data.zipFileInfoListB
        .filter((fileInfo) => ['add', 'change'].includes(this._diffZipFileMap[fileInfo.fileName]))
        .map((fileInfo) => ({
          ...fileInfo,
          fileName: `changed/${fileInfo.fileName}`,
        }));

      const zipDeleteFileNames = this.$data.zipFileInfoListA
        .filter((fileInfo) => ['delete'].includes(this._diffZipFileMap[fileInfo.fileName]))
        .map((fileInfo) => fileInfo.fileName);

      const data = {
        zipFiles: [
          ...zipAddFiles,
          {
            fileName: 'deleteFileNames.txt',
            binaryData: strToUtf8Array(zipDeleteFileNames.join('\n')),
          },
        ],
      };

      zip(data, {
        complete: (data: any) => {
          const { compressData } = data;
          File.download('diff.zip', compressData, 'application/zip');
        },
      });
    },
  },
});
</script>

<style lang="scss" scoped>
.zip-upload {
  display: flex;
  min-height: 300px;

  &__block {
    padding: 10px;
    width: 50%;

    & + & {
      border-left: solid 2px #ccc;
    }
  }
}

.file-list {
  &__item {
    &.-add {
      color: blue;
    }

    &.-change {
      color: green;
    }

    &.-delete {
      color: red;
    }
  }
}
</style>
