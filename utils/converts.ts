
/**
 * UTF8文字列からbyte arrayに変換する
 * @param str - 文字列
 * @returns - Unicode配列
 */
export function strToUtf8ByteArray(str: string): Array<number> {
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
 * UTF8文字列のbyte配列から文字列に変換する
 * @param array - UTF8文字列のbyte配列
 */
// https://tutorialmore.com/questions-1371393.htm
export function utf8ByteArrayToStr(array: Array<number>): string {
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
