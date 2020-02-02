<template lang="pug">
div
  .zip-upload
    .zip-upload__block
      input(
        type="file"
        @change="(event) => { onUpload(event, 'A'); }"
      )
      ul.file-list
        template(v-for="fileInfo in $data.zipFileInfoListA")
          li.file-list__item(
            :class="{\
              '-delete': _diffZipFileMap[fileInfo.fileName] === 'delete',\
            }"
          )
            | {{ fileInfo.fileName }}
    .zip-upload__block
      input(
        type="file"
        @change="(event) => { onUpload(event, 'B'); }"
      )
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

<script>
import Vue from 'vue';
const { Unzip } = require('zlibjs/bin/unzip.min').Zlib;
const { Zip } = require('zlibjs/bin/zip.min').Zlib;
import File from '../utils/File';

/**
 * 配列データが一緒か調べる
 * @param arr1
 * @param arr2
 * @returns {boolean}
 */
function checkSameArray(arr1, arr2) {
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

function strToUtf8Array(str) {
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

export default Vue.extend({
  data() {
    return {
      zipFileInfoListA: [],
      zipFileInfoListB: [],
    }
  },
  computed: {
    // 差分情報を返す
    _diffZipFileMap() {
      const diffZipFileMap = {};
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
    onUpload(event, label) {
      if (!event.currentTarget.files) {
        return;
      }
      const file = event.currentTarget.files[0];

      const reader = new FileReader();
      reader.onloadend = () => {
        if (!reader.result) {
          return;
        }
        const unzip = new Unzip(new Uint8Array(reader.result));
        const fileNames = unzip.getFilenames();

        const zipFileInfoList = fileNames.map((fileName) => {
          const charCodes = fileName.split('').map((char) => char.charCodeAt(0));
          console.log('文字コード：', Encoding.detect(charCodes));
          return {
            fileName: utf8ArrayToStr(Encoding.convert(charCodes, 'UTF8')),
            binaryData: unzip.decompress(fileName),
          };
        });

        if (label === 'A') {
          this.$data.zipFileInfoListA = zipFileInfoList;
        } else {
          this.$data.zipFileInfoListB = zipFileInfoList;
        }
      };

      reader.readAsArrayBuffer(file);
    },
    onDownloadButtonClick() {
      const zip = new Zip();

      this.$data.zipFileInfoListB
        .filter((fileInfo) => ['add', 'change'].includes(this._diffZipFileMap[fileInfo.fileName]))
        .forEach((fileInfo) => {
          zip.addFile(fileInfo.binaryData, {
            filename: strToUtf8Array(fileInfo.fileName),
          });
        });
      const compressData = zip.compress();

      File.download('sample.zip', compressData, 'application/zip');
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
