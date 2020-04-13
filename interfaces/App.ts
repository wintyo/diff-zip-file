/** ファイル情報 */
export interface IFileInfo {
  /** ファイル名 */
  fileName: string;
  /** バイナリデータ */
  binaryData: Uint8Array;
}

/** 差分情報 */
export interface IDiffStatusMap {
  [fileName: string]: 'same' | 'add' | 'change' | 'delete';
}
