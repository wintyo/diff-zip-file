const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);  // UTF-8のBOM

class File {
  /**
   * ファイルにダウンロードする
   * @param {string} fileName - ファイル名
   * @param {string|Uint8Array} contentStr - コンテンツの中身
   * @param {string} contentType - コンテンツのタイプ
   */
  static download(fileName: string, contentStr: string | Uint8Array, contentType = 'text/plain') {
    const data = (() => {
      if (contentType === 'text/plain' || contentType === 'text/csv') {
        return [BOM, contentStr];
      }
      return [contentStr];
    })();
    const blob = new Blob(data, { type: contentType });

    // IE11, 10対応
    if (window.navigator.msSaveOrOpenBlob) {
      // msSaveOrOpenBlobの場合はファイルを保存せずに開ける
      window.navigator.msSaveOrOpenBlob(blob, fileName);
      return;
    }

    const element = document.createElement('a');
    element.href = window.URL.createObjectURL(blob);
    element.setAttribute('download', fileName);
    element.click();
    window.URL.revokeObjectURL(element.href);
  }
}

export default File;
