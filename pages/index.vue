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
</template>

<script>
import Vue from 'vue';
const { Unzip } = require('zlibjs/bin/unzip.min').Zlib;

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

        const zipFileInfoList = fileNames.map((fileName) => ({
          fileName,
          binaryData: unzip.decompress(fileName),
        }));

        if (label === 'A') {
          this.$data.zipFileInfoListA = zipFileInfoList;
        } else {
          this.$data.zipFileInfoListB = zipFileInfoList;
        }
      };

      reader.readAsArrayBuffer(file);
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
