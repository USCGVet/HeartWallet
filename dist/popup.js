const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["index.js","rpc.js"])))=>i.map(i=>d[i]);
import { f as formatUnits, p as parseUnits, C as Contract, g as getProvider, i as isAddress, l as load, s as save, m as migrateToMultiWallet, w as walletExists, a as setActiveWallet, b as getActiveWallet, c as importFromMnemonic, d as importFromPrivateKey, u as unlockWallet, e as shortenAddress, h as getAllWallets, j as getBalance, k as formatBalance, n as parseEther, W as Wallet, o as exportMnemonic, q as exportPrivateKey, r as addWallet, t as renameWallet, v as formatEther, x as getGasPrice, y as estimateGas, z as getTransactionCount, A as deleteWallet, B as exportMnemonicForWallet, D as exportPrivateKeyForWallet } from "./rpc.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = Promise.allSettled(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
var browser = {};
var canPromise$1 = function() {
  return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
};
var qrcode = {};
var utils$1 = {};
let toSJISFunction;
const CODEWORDS_COUNT = [
  0,
  // Not used
  26,
  44,
  70,
  100,
  134,
  172,
  196,
  242,
  292,
  346,
  404,
  466,
  532,
  581,
  655,
  733,
  815,
  901,
  991,
  1085,
  1156,
  1258,
  1364,
  1474,
  1588,
  1706,
  1828,
  1921,
  2051,
  2185,
  2323,
  2465,
  2611,
  2761,
  2876,
  3034,
  3196,
  3362,
  3532,
  3706
];
utils$1.getSymbolSize = function getSymbolSize(version2) {
  if (!version2) throw new Error('"version" cannot be null or undefined');
  if (version2 < 1 || version2 > 40) throw new Error('"version" should be in range from 1 to 40');
  return version2 * 4 + 17;
};
utils$1.getSymbolTotalCodewords = function getSymbolTotalCodewords(version2) {
  return CODEWORDS_COUNT[version2];
};
utils$1.getBCHDigit = function(data) {
  let digit = 0;
  while (data !== 0) {
    digit++;
    data >>>= 1;
  }
  return digit;
};
utils$1.setToSJISFunction = function setToSJISFunction(f) {
  if (typeof f !== "function") {
    throw new Error('"toSJISFunc" is not a valid function.');
  }
  toSJISFunction = f;
};
utils$1.isKanjiModeEnabled = function() {
  return typeof toSJISFunction !== "undefined";
};
utils$1.toSJIS = function toSJIS(kanji2) {
  return toSJISFunction(kanji2);
};
var errorCorrectionLevel = {};
(function(exports) {
  exports.L = { bit: 1 };
  exports.M = { bit: 0 };
  exports.Q = { bit: 3 };
  exports.H = { bit: 2 };
  function fromString(string) {
    if (typeof string !== "string") {
      throw new Error("Param is not a string");
    }
    const lcStr = string.toLowerCase();
    switch (lcStr) {
      case "l":
      case "low":
        return exports.L;
      case "m":
      case "medium":
        return exports.M;
      case "q":
      case "quartile":
        return exports.Q;
      case "h":
      case "high":
        return exports.H;
      default:
        throw new Error("Unknown EC Level: " + string);
    }
  }
  exports.isValid = function isValid2(level) {
    return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
  };
  exports.from = function from(value, defaultValue) {
    if (exports.isValid(value)) {
      return value;
    }
    try {
      return fromString(value);
    } catch (e) {
      return defaultValue;
    }
  };
})(errorCorrectionLevel);
function BitBuffer$1() {
  this.buffer = [];
  this.length = 0;
}
BitBuffer$1.prototype = {
  get: function(index) {
    const bufIndex = Math.floor(index / 8);
    return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) === 1;
  },
  put: function(num, length) {
    for (let i = 0; i < length; i++) {
      this.putBit((num >>> length - i - 1 & 1) === 1);
    }
  },
  getLengthInBits: function() {
    return this.length;
  },
  putBit: function(bit) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 128 >>> this.length % 8;
    }
    this.length++;
  }
};
var bitBuffer = BitBuffer$1;
function BitMatrix$1(size) {
  if (!size || size < 1) {
    throw new Error("BitMatrix size must be defined and greater than 0");
  }
  this.size = size;
  this.data = new Uint8Array(size * size);
  this.reservedBit = new Uint8Array(size * size);
}
BitMatrix$1.prototype.set = function(row, col, value, reserved) {
  const index = row * this.size + col;
  this.data[index] = value;
  if (reserved) this.reservedBit[index] = true;
};
BitMatrix$1.prototype.get = function(row, col) {
  return this.data[row * this.size + col];
};
BitMatrix$1.prototype.xor = function(row, col, value) {
  this.data[row * this.size + col] ^= value;
};
BitMatrix$1.prototype.isReserved = function(row, col) {
  return this.reservedBit[row * this.size + col];
};
var bitMatrix = BitMatrix$1;
var alignmentPattern = {};
(function(exports) {
  const getSymbolSize3 = utils$1.getSymbolSize;
  exports.getRowColCoords = function getRowColCoords(version2) {
    if (version2 === 1) return [];
    const posCount = Math.floor(version2 / 7) + 2;
    const size = getSymbolSize3(version2);
    const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
    const positions = [size - 7];
    for (let i = 1; i < posCount - 1; i++) {
      positions[i] = positions[i - 1] - intervals;
    }
    positions.push(6);
    return positions.reverse();
  };
  exports.getPositions = function getPositions2(version2) {
    const coords = [];
    const pos = exports.getRowColCoords(version2);
    const posLength = pos.length;
    for (let i = 0; i < posLength; i++) {
      for (let j = 0; j < posLength; j++) {
        if (i === 0 && j === 0 || // top-left
        i === 0 && j === posLength - 1 || // bottom-left
        i === posLength - 1 && j === 0) {
          continue;
        }
        coords.push([pos[i], pos[j]]);
      }
    }
    return coords;
  };
})(alignmentPattern);
var finderPattern = {};
const getSymbolSize2 = utils$1.getSymbolSize;
const FINDER_PATTERN_SIZE = 7;
finderPattern.getPositions = function getPositions(version2) {
  const size = getSymbolSize2(version2);
  return [
    // top-left
    [0, 0],
    // top-right
    [size - FINDER_PATTERN_SIZE, 0],
    // bottom-left
    [0, size - FINDER_PATTERN_SIZE]
  ];
};
var maskPattern = {};
(function(exports) {
  exports.Patterns = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7
  };
  const PenaltyScores = {
    N1: 3,
    N2: 3,
    N3: 40,
    N4: 10
  };
  exports.isValid = function isValid2(mask) {
    return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
  };
  exports.from = function from(value) {
    return exports.isValid(value) ? parseInt(value, 10) : void 0;
  };
  exports.getPenaltyN1 = function getPenaltyN1(data) {
    const size = data.size;
    let points = 0;
    let sameCountCol = 0;
    let sameCountRow = 0;
    let lastCol = null;
    let lastRow = null;
    for (let row = 0; row < size; row++) {
      sameCountCol = sameCountRow = 0;
      lastCol = lastRow = null;
      for (let col = 0; col < size; col++) {
        let module = data.get(row, col);
        if (module === lastCol) {
          sameCountCol++;
        } else {
          if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
          lastCol = module;
          sameCountCol = 1;
        }
        module = data.get(col, row);
        if (module === lastRow) {
          sameCountRow++;
        } else {
          if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
          lastRow = module;
          sameCountRow = 1;
        }
      }
      if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
      if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
    }
    return points;
  };
  exports.getPenaltyN2 = function getPenaltyN2(data) {
    const size = data.size;
    let points = 0;
    for (let row = 0; row < size - 1; row++) {
      for (let col = 0; col < size - 1; col++) {
        const last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
        if (last === 4 || last === 0) points++;
      }
    }
    return points * PenaltyScores.N2;
  };
  exports.getPenaltyN3 = function getPenaltyN3(data) {
    const size = data.size;
    let points = 0;
    let bitsCol = 0;
    let bitsRow = 0;
    for (let row = 0; row < size; row++) {
      bitsCol = bitsRow = 0;
      for (let col = 0; col < size; col++) {
        bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
        if (col >= 10 && (bitsCol === 1488 || bitsCol === 93)) points++;
        bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
        if (col >= 10 && (bitsRow === 1488 || bitsRow === 93)) points++;
      }
    }
    return points * PenaltyScores.N3;
  };
  exports.getPenaltyN4 = function getPenaltyN4(data) {
    let darkCount = 0;
    const modulesCount = data.data.length;
    for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];
    const k = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
    return k * PenaltyScores.N4;
  };
  function getMaskAt(maskPattern2, i, j) {
    switch (maskPattern2) {
      case exports.Patterns.PATTERN000:
        return (i + j) % 2 === 0;
      case exports.Patterns.PATTERN001:
        return i % 2 === 0;
      case exports.Patterns.PATTERN010:
        return j % 3 === 0;
      case exports.Patterns.PATTERN011:
        return (i + j) % 3 === 0;
      case exports.Patterns.PATTERN100:
        return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
      case exports.Patterns.PATTERN101:
        return i * j % 2 + i * j % 3 === 0;
      case exports.Patterns.PATTERN110:
        return (i * j % 2 + i * j % 3) % 2 === 0;
      case exports.Patterns.PATTERN111:
        return (i * j % 3 + (i + j) % 2) % 2 === 0;
      default:
        throw new Error("bad maskPattern:" + maskPattern2);
    }
  }
  exports.applyMask = function applyMask(pattern, data) {
    const size = data.size;
    for (let col = 0; col < size; col++) {
      for (let row = 0; row < size; row++) {
        if (data.isReserved(row, col)) continue;
        data.xor(row, col, getMaskAt(pattern, row, col));
      }
    }
  };
  exports.getBestMask = function getBestMask(data, setupFormatFunc) {
    const numPatterns = Object.keys(exports.Patterns).length;
    let bestPattern = 0;
    let lowerPenalty = Infinity;
    for (let p = 0; p < numPatterns; p++) {
      setupFormatFunc(p);
      exports.applyMask(p, data);
      const penalty = exports.getPenaltyN1(data) + exports.getPenaltyN2(data) + exports.getPenaltyN3(data) + exports.getPenaltyN4(data);
      exports.applyMask(p, data);
      if (penalty < lowerPenalty) {
        lowerPenalty = penalty;
        bestPattern = p;
      }
    }
    return bestPattern;
  };
})(maskPattern);
var errorCorrectionCode = {};
const ECLevel$1 = errorCorrectionLevel;
const EC_BLOCKS_TABLE = [
  // L  M  Q  H
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  2,
  1,
  2,
  2,
  4,
  1,
  2,
  4,
  4,
  2,
  4,
  4,
  4,
  2,
  4,
  6,
  5,
  2,
  4,
  6,
  6,
  2,
  5,
  8,
  8,
  4,
  5,
  8,
  8,
  4,
  5,
  8,
  11,
  4,
  8,
  10,
  11,
  4,
  9,
  12,
  16,
  4,
  9,
  16,
  16,
  6,
  10,
  12,
  18,
  6,
  10,
  17,
  16,
  6,
  11,
  16,
  19,
  6,
  13,
  18,
  21,
  7,
  14,
  21,
  25,
  8,
  16,
  20,
  25,
  8,
  17,
  23,
  25,
  9,
  17,
  23,
  34,
  9,
  18,
  25,
  30,
  10,
  20,
  27,
  32,
  12,
  21,
  29,
  35,
  12,
  23,
  34,
  37,
  12,
  25,
  34,
  40,
  13,
  26,
  35,
  42,
  14,
  28,
  38,
  45,
  15,
  29,
  40,
  48,
  16,
  31,
  43,
  51,
  17,
  33,
  45,
  54,
  18,
  35,
  48,
  57,
  19,
  37,
  51,
  60,
  19,
  38,
  53,
  63,
  20,
  40,
  56,
  66,
  21,
  43,
  59,
  70,
  22,
  45,
  62,
  74,
  24,
  47,
  65,
  77,
  25,
  49,
  68,
  81
];
const EC_CODEWORDS_TABLE = [
  // L  M  Q  H
  7,
  10,
  13,
  17,
  10,
  16,
  22,
  28,
  15,
  26,
  36,
  44,
  20,
  36,
  52,
  64,
  26,
  48,
  72,
  88,
  36,
  64,
  96,
  112,
  40,
  72,
  108,
  130,
  48,
  88,
  132,
  156,
  60,
  110,
  160,
  192,
  72,
  130,
  192,
  224,
  80,
  150,
  224,
  264,
  96,
  176,
  260,
  308,
  104,
  198,
  288,
  352,
  120,
  216,
  320,
  384,
  132,
  240,
  360,
  432,
  144,
  280,
  408,
  480,
  168,
  308,
  448,
  532,
  180,
  338,
  504,
  588,
  196,
  364,
  546,
  650,
  224,
  416,
  600,
  700,
  224,
  442,
  644,
  750,
  252,
  476,
  690,
  816,
  270,
  504,
  750,
  900,
  300,
  560,
  810,
  960,
  312,
  588,
  870,
  1050,
  336,
  644,
  952,
  1110,
  360,
  700,
  1020,
  1200,
  390,
  728,
  1050,
  1260,
  420,
  784,
  1140,
  1350,
  450,
  812,
  1200,
  1440,
  480,
  868,
  1290,
  1530,
  510,
  924,
  1350,
  1620,
  540,
  980,
  1440,
  1710,
  570,
  1036,
  1530,
  1800,
  570,
  1064,
  1590,
  1890,
  600,
  1120,
  1680,
  1980,
  630,
  1204,
  1770,
  2100,
  660,
  1260,
  1860,
  2220,
  720,
  1316,
  1950,
  2310,
  750,
  1372,
  2040,
  2430
];
errorCorrectionCode.getBlocksCount = function getBlocksCount(version2, errorCorrectionLevel2) {
  switch (errorCorrectionLevel2) {
    case ECLevel$1.L:
      return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 0];
    case ECLevel$1.M:
      return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 1];
    case ECLevel$1.Q:
      return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 2];
    case ECLevel$1.H:
      return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 3];
    default:
      return void 0;
  }
};
errorCorrectionCode.getTotalCodewordsCount = function getTotalCodewordsCount(version2, errorCorrectionLevel2) {
  switch (errorCorrectionLevel2) {
    case ECLevel$1.L:
      return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 0];
    case ECLevel$1.M:
      return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 1];
    case ECLevel$1.Q:
      return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 2];
    case ECLevel$1.H:
      return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 3];
    default:
      return void 0;
  }
};
var polynomial = {};
var galoisField = {};
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);
(function initTables() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 256) {
      x ^= 285;
    }
  }
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
})();
galoisField.log = function log(n) {
  if (n < 1) throw new Error("log(" + n + ")");
  return LOG_TABLE[n];
};
galoisField.exp = function exp(n) {
  return EXP_TABLE[n];
};
galoisField.mul = function mul(x, y) {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
};
(function(exports) {
  const GF = galoisField;
  exports.mul = function mul2(p1, p2) {
    const coeff = new Uint8Array(p1.length + p2.length - 1);
    for (let i = 0; i < p1.length; i++) {
      for (let j = 0; j < p2.length; j++) {
        coeff[i + j] ^= GF.mul(p1[i], p2[j]);
      }
    }
    return coeff;
  };
  exports.mod = function mod(divident, divisor) {
    let result = new Uint8Array(divident);
    while (result.length - divisor.length >= 0) {
      const coeff = result[0];
      for (let i = 0; i < divisor.length; i++) {
        result[i] ^= GF.mul(divisor[i], coeff);
      }
      let offset = 0;
      while (offset < result.length && result[offset] === 0) offset++;
      result = result.slice(offset);
    }
    return result;
  };
  exports.generateECPolynomial = function generateECPolynomial(degree) {
    let poly = new Uint8Array([1]);
    for (let i = 0; i < degree; i++) {
      poly = exports.mul(poly, new Uint8Array([1, GF.exp(i)]));
    }
    return poly;
  };
})(polynomial);
const Polynomial = polynomial;
function ReedSolomonEncoder$1(degree) {
  this.genPoly = void 0;
  this.degree = degree;
  if (this.degree) this.initialize(this.degree);
}
ReedSolomonEncoder$1.prototype.initialize = function initialize(degree) {
  this.degree = degree;
  this.genPoly = Polynomial.generateECPolynomial(this.degree);
};
ReedSolomonEncoder$1.prototype.encode = function encode(data) {
  if (!this.genPoly) {
    throw new Error("Encoder not initialized");
  }
  const paddedData = new Uint8Array(data.length + this.degree);
  paddedData.set(data);
  const remainder = Polynomial.mod(paddedData, this.genPoly);
  const start = this.degree - remainder.length;
  if (start > 0) {
    const buff = new Uint8Array(this.degree);
    buff.set(remainder, start);
    return buff;
  }
  return remainder;
};
var reedSolomonEncoder = ReedSolomonEncoder$1;
var version = {};
var mode = {};
var versionCheck = {};
versionCheck.isValid = function isValid(version2) {
  return !isNaN(version2) && version2 >= 1 && version2 <= 40;
};
var regex = {};
const numeric = "[0-9]+";
const alphanumeric = "[A-Z $%*+\\-./:]+";
let kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
kanji = kanji.replace(/u/g, "\\u");
const byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + ")(?:.|[\r\n]))+";
regex.KANJI = new RegExp(kanji, "g");
regex.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
regex.BYTE = new RegExp(byte, "g");
regex.NUMERIC = new RegExp(numeric, "g");
regex.ALPHANUMERIC = new RegExp(alphanumeric, "g");
const TEST_KANJI = new RegExp("^" + kanji + "$");
const TEST_NUMERIC = new RegExp("^" + numeric + "$");
const TEST_ALPHANUMERIC = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
regex.testKanji = function testKanji(str) {
  return TEST_KANJI.test(str);
};
regex.testNumeric = function testNumeric(str) {
  return TEST_NUMERIC.test(str);
};
regex.testAlphanumeric = function testAlphanumeric(str) {
  return TEST_ALPHANUMERIC.test(str);
};
(function(exports) {
  const VersionCheck = versionCheck;
  const Regex = regex;
  exports.NUMERIC = {
    id: "Numeric",
    bit: 1 << 0,
    ccBits: [10, 12, 14]
  };
  exports.ALPHANUMERIC = {
    id: "Alphanumeric",
    bit: 1 << 1,
    ccBits: [9, 11, 13]
  };
  exports.BYTE = {
    id: "Byte",
    bit: 1 << 2,
    ccBits: [8, 16, 16]
  };
  exports.KANJI = {
    id: "Kanji",
    bit: 1 << 3,
    ccBits: [8, 10, 12]
  };
  exports.MIXED = {
    bit: -1
  };
  exports.getCharCountIndicator = function getCharCountIndicator(mode2, version2) {
    if (!mode2.ccBits) throw new Error("Invalid mode: " + mode2);
    if (!VersionCheck.isValid(version2)) {
      throw new Error("Invalid version: " + version2);
    }
    if (version2 >= 1 && version2 < 10) return mode2.ccBits[0];
    else if (version2 < 27) return mode2.ccBits[1];
    return mode2.ccBits[2];
  };
  exports.getBestModeForData = function getBestModeForData(dataStr) {
    if (Regex.testNumeric(dataStr)) return exports.NUMERIC;
    else if (Regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC;
    else if (Regex.testKanji(dataStr)) return exports.KANJI;
    else return exports.BYTE;
  };
  exports.toString = function toString(mode2) {
    if (mode2 && mode2.id) return mode2.id;
    throw new Error("Invalid mode");
  };
  exports.isValid = function isValid2(mode2) {
    return mode2 && mode2.bit && mode2.ccBits;
  };
  function fromString(string) {
    if (typeof string !== "string") {
      throw new Error("Param is not a string");
    }
    const lcStr = string.toLowerCase();
    switch (lcStr) {
      case "numeric":
        return exports.NUMERIC;
      case "alphanumeric":
        return exports.ALPHANUMERIC;
      case "kanji":
        return exports.KANJI;
      case "byte":
        return exports.BYTE;
      default:
        throw new Error("Unknown mode: " + string);
    }
  }
  exports.from = function from(value, defaultValue) {
    if (exports.isValid(value)) {
      return value;
    }
    try {
      return fromString(value);
    } catch (e) {
      return defaultValue;
    }
  };
})(mode);
(function(exports) {
  const Utils2 = utils$1;
  const ECCode2 = errorCorrectionCode;
  const ECLevel2 = errorCorrectionLevel;
  const Mode2 = mode;
  const VersionCheck = versionCheck;
  const G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
  const G18_BCH = Utils2.getBCHDigit(G18);
  function getBestVersionForDataLength(mode2, length, errorCorrectionLevel2) {
    for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
      if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel2, mode2)) {
        return currentVersion;
      }
    }
    return void 0;
  }
  function getReservedBitsCount(mode2, version2) {
    return Mode2.getCharCountIndicator(mode2, version2) + 4;
  }
  function getTotalBitsFromDataArray(segments2, version2) {
    let totalBits = 0;
    segments2.forEach(function(data) {
      const reservedBits = getReservedBitsCount(data.mode, version2);
      totalBits += reservedBits + data.getBitsLength();
    });
    return totalBits;
  }
  function getBestVersionForMixedData(segments2, errorCorrectionLevel2) {
    for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
      const length = getTotalBitsFromDataArray(segments2, currentVersion);
      if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel2, Mode2.MIXED)) {
        return currentVersion;
      }
    }
    return void 0;
  }
  exports.from = function from(value, defaultValue) {
    if (VersionCheck.isValid(value)) {
      return parseInt(value, 10);
    }
    return defaultValue;
  };
  exports.getCapacity = function getCapacity(version2, errorCorrectionLevel2, mode2) {
    if (!VersionCheck.isValid(version2)) {
      throw new Error("Invalid QR Code version");
    }
    if (typeof mode2 === "undefined") mode2 = Mode2.BYTE;
    const totalCodewords = Utils2.getSymbolTotalCodewords(version2);
    const ecTotalCodewords = ECCode2.getTotalCodewordsCount(version2, errorCorrectionLevel2);
    const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
    if (mode2 === Mode2.MIXED) return dataTotalCodewordsBits;
    const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode2, version2);
    switch (mode2) {
      case Mode2.NUMERIC:
        return Math.floor(usableBits / 10 * 3);
      case Mode2.ALPHANUMERIC:
        return Math.floor(usableBits / 11 * 2);
      case Mode2.KANJI:
        return Math.floor(usableBits / 13);
      case Mode2.BYTE:
      default:
        return Math.floor(usableBits / 8);
    }
  };
  exports.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel2) {
    let seg;
    const ecl = ECLevel2.from(errorCorrectionLevel2, ECLevel2.M);
    if (Array.isArray(data)) {
      if (data.length > 1) {
        return getBestVersionForMixedData(data, ecl);
      }
      if (data.length === 0) {
        return 1;
      }
      seg = data[0];
    } else {
      seg = data;
    }
    return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
  };
  exports.getEncodedBits = function getEncodedBits2(version2) {
    if (!VersionCheck.isValid(version2) || version2 < 7) {
      throw new Error("Invalid QR Code version");
    }
    let d = version2 << 12;
    while (Utils2.getBCHDigit(d) - G18_BCH >= 0) {
      d ^= G18 << Utils2.getBCHDigit(d) - G18_BCH;
    }
    return version2 << 12 | d;
  };
})(version);
var formatInfo = {};
const Utils$3 = utils$1;
const G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
const G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
const G15_BCH = Utils$3.getBCHDigit(G15);
formatInfo.getEncodedBits = function getEncodedBits(errorCorrectionLevel2, mask) {
  const data = errorCorrectionLevel2.bit << 3 | mask;
  let d = data << 10;
  while (Utils$3.getBCHDigit(d) - G15_BCH >= 0) {
    d ^= G15 << Utils$3.getBCHDigit(d) - G15_BCH;
  }
  return (data << 10 | d) ^ G15_MASK;
};
var segments = {};
const Mode$4 = mode;
function NumericData(data) {
  this.mode = Mode$4.NUMERIC;
  this.data = data.toString();
}
NumericData.getBitsLength = function getBitsLength(length) {
  return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
};
NumericData.prototype.getLength = function getLength() {
  return this.data.length;
};
NumericData.prototype.getBitsLength = function getBitsLength2() {
  return NumericData.getBitsLength(this.data.length);
};
NumericData.prototype.write = function write(bitBuffer2) {
  let i, group, value;
  for (i = 0; i + 3 <= this.data.length; i += 3) {
    group = this.data.substr(i, 3);
    value = parseInt(group, 10);
    bitBuffer2.put(value, 10);
  }
  const remainingNum = this.data.length - i;
  if (remainingNum > 0) {
    group = this.data.substr(i);
    value = parseInt(group, 10);
    bitBuffer2.put(value, remainingNum * 3 + 1);
  }
};
var numericData = NumericData;
const Mode$3 = mode;
const ALPHA_NUM_CHARS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  " ",
  "$",
  "%",
  "*",
  "+",
  "-",
  ".",
  "/",
  ":"
];
function AlphanumericData(data) {
  this.mode = Mode$3.ALPHANUMERIC;
  this.data = data;
}
AlphanumericData.getBitsLength = function getBitsLength3(length) {
  return 11 * Math.floor(length / 2) + 6 * (length % 2);
};
AlphanumericData.prototype.getLength = function getLength2() {
  return this.data.length;
};
AlphanumericData.prototype.getBitsLength = function getBitsLength4() {
  return AlphanumericData.getBitsLength(this.data.length);
};
AlphanumericData.prototype.write = function write2(bitBuffer2) {
  let i;
  for (i = 0; i + 2 <= this.data.length; i += 2) {
    let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;
    value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);
    bitBuffer2.put(value, 11);
  }
  if (this.data.length % 2) {
    bitBuffer2.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
  }
};
var alphanumericData = AlphanumericData;
const Mode$2 = mode;
function ByteData(data) {
  this.mode = Mode$2.BYTE;
  if (typeof data === "string") {
    this.data = new TextEncoder().encode(data);
  } else {
    this.data = new Uint8Array(data);
  }
}
ByteData.getBitsLength = function getBitsLength5(length) {
  return length * 8;
};
ByteData.prototype.getLength = function getLength3() {
  return this.data.length;
};
ByteData.prototype.getBitsLength = function getBitsLength6() {
  return ByteData.getBitsLength(this.data.length);
};
ByteData.prototype.write = function(bitBuffer2) {
  for (let i = 0, l = this.data.length; i < l; i++) {
    bitBuffer2.put(this.data[i], 8);
  }
};
var byteData = ByteData;
const Mode$1 = mode;
const Utils$2 = utils$1;
function KanjiData(data) {
  this.mode = Mode$1.KANJI;
  this.data = data;
}
KanjiData.getBitsLength = function getBitsLength7(length) {
  return length * 13;
};
KanjiData.prototype.getLength = function getLength4() {
  return this.data.length;
};
KanjiData.prototype.getBitsLength = function getBitsLength8() {
  return KanjiData.getBitsLength(this.data.length);
};
KanjiData.prototype.write = function(bitBuffer2) {
  let i;
  for (i = 0; i < this.data.length; i++) {
    let value = Utils$2.toSJIS(this.data[i]);
    if (value >= 33088 && value <= 40956) {
      value -= 33088;
    } else if (value >= 57408 && value <= 60351) {
      value -= 49472;
    } else {
      throw new Error(
        "Invalid SJIS character: " + this.data[i] + "\nMake sure your charset is UTF-8"
      );
    }
    value = (value >>> 8 & 255) * 192 + (value & 255);
    bitBuffer2.put(value, 13);
  }
};
var kanjiData = KanjiData;
var dijkstra = { exports: {} };
(function(module) {
  var dijkstra2 = {
    single_source_shortest_paths: function(graph, s, d) {
      var predecessors = {};
      var costs = {};
      costs[s] = 0;
      var open = dijkstra2.PriorityQueue.make();
      open.push(s, 0);
      var closest, u, v, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
      while (!open.empty()) {
        closest = open.pop();
        u = closest.value;
        cost_of_s_to_u = closest.cost;
        adjacent_nodes = graph[u] || {};
        for (v in adjacent_nodes) {
          if (adjacent_nodes.hasOwnProperty(v)) {
            cost_of_e = adjacent_nodes[v];
            cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
            cost_of_s_to_v = costs[v];
            first_visit = typeof costs[v] === "undefined";
            if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
              costs[v] = cost_of_s_to_u_plus_cost_of_e;
              open.push(v, cost_of_s_to_u_plus_cost_of_e);
              predecessors[v] = u;
            }
          }
        }
      }
      if (typeof d !== "undefined" && typeof costs[d] === "undefined") {
        var msg = ["Could not find a path from ", s, " to ", d, "."].join("");
        throw new Error(msg);
      }
      return predecessors;
    },
    extract_shortest_path_from_predecessor_list: function(predecessors, d) {
      var nodes = [];
      var u = d;
      while (u) {
        nodes.push(u);
        predecessors[u];
        u = predecessors[u];
      }
      nodes.reverse();
      return nodes;
    },
    find_path: function(graph, s, d) {
      var predecessors = dijkstra2.single_source_shortest_paths(graph, s, d);
      return dijkstra2.extract_shortest_path_from_predecessor_list(
        predecessors,
        d
      );
    },
    /**
     * A very naive priority queue implementation.
     */
    PriorityQueue: {
      make: function(opts) {
        var T = dijkstra2.PriorityQueue, t = {}, key;
        opts = opts || {};
        for (key in T) {
          if (T.hasOwnProperty(key)) {
            t[key] = T[key];
          }
        }
        t.queue = [];
        t.sorter = opts.sorter || T.default_sorter;
        return t;
      },
      default_sorter: function(a, b) {
        return a.cost - b.cost;
      },
      /**
       * Add a new item to the queue and ensure the highest priority element
       * is at the front of the queue.
       */
      push: function(value, cost) {
        var item = { value, cost };
        this.queue.push(item);
        this.queue.sort(this.sorter);
      },
      /**
       * Return the highest priority element in the queue.
       */
      pop: function() {
        return this.queue.shift();
      },
      empty: function() {
        return this.queue.length === 0;
      }
    }
  };
  {
    module.exports = dijkstra2;
  }
})(dijkstra);
var dijkstraExports = dijkstra.exports;
(function(exports) {
  const Mode2 = mode;
  const NumericData2 = numericData;
  const AlphanumericData2 = alphanumericData;
  const ByteData2 = byteData;
  const KanjiData2 = kanjiData;
  const Regex = regex;
  const Utils2 = utils$1;
  const dijkstra2 = dijkstraExports;
  function getStringByteLength(str) {
    return unescape(encodeURIComponent(str)).length;
  }
  function getSegments(regex2, mode2, str) {
    const segments2 = [];
    let result;
    while ((result = regex2.exec(str)) !== null) {
      segments2.push({
        data: result[0],
        index: result.index,
        mode: mode2,
        length: result[0].length
      });
    }
    return segments2;
  }
  function getSegmentsFromString(dataStr) {
    const numSegs = getSegments(Regex.NUMERIC, Mode2.NUMERIC, dataStr);
    const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode2.ALPHANUMERIC, dataStr);
    let byteSegs;
    let kanjiSegs;
    if (Utils2.isKanjiModeEnabled()) {
      byteSegs = getSegments(Regex.BYTE, Mode2.BYTE, dataStr);
      kanjiSegs = getSegments(Regex.KANJI, Mode2.KANJI, dataStr);
    } else {
      byteSegs = getSegments(Regex.BYTE_KANJI, Mode2.BYTE, dataStr);
      kanjiSegs = [];
    }
    const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
    return segs.sort(function(s1, s2) {
      return s1.index - s2.index;
    }).map(function(obj) {
      return {
        data: obj.data,
        mode: obj.mode,
        length: obj.length
      };
    });
  }
  function getSegmentBitsLength(length, mode2) {
    switch (mode2) {
      case Mode2.NUMERIC:
        return NumericData2.getBitsLength(length);
      case Mode2.ALPHANUMERIC:
        return AlphanumericData2.getBitsLength(length);
      case Mode2.KANJI:
        return KanjiData2.getBitsLength(length);
      case Mode2.BYTE:
        return ByteData2.getBitsLength(length);
    }
  }
  function mergeSegments(segs) {
    return segs.reduce(function(acc, curr) {
      const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
      if (prevSeg && prevSeg.mode === curr.mode) {
        acc[acc.length - 1].data += curr.data;
        return acc;
      }
      acc.push(curr);
      return acc;
    }, []);
  }
  function buildNodes(segs) {
    const nodes = [];
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      switch (seg.mode) {
        case Mode2.NUMERIC:
          nodes.push([
            seg,
            { data: seg.data, mode: Mode2.ALPHANUMERIC, length: seg.length },
            { data: seg.data, mode: Mode2.BYTE, length: seg.length }
          ]);
          break;
        case Mode2.ALPHANUMERIC:
          nodes.push([
            seg,
            { data: seg.data, mode: Mode2.BYTE, length: seg.length }
          ]);
          break;
        case Mode2.KANJI:
          nodes.push([
            seg,
            { data: seg.data, mode: Mode2.BYTE, length: getStringByteLength(seg.data) }
          ]);
          break;
        case Mode2.BYTE:
          nodes.push([
            { data: seg.data, mode: Mode2.BYTE, length: getStringByteLength(seg.data) }
          ]);
      }
    }
    return nodes;
  }
  function buildGraph(nodes, version2) {
    const table = {};
    const graph = { start: {} };
    let prevNodeIds = ["start"];
    for (let i = 0; i < nodes.length; i++) {
      const nodeGroup = nodes[i];
      const currentNodeIds = [];
      for (let j = 0; j < nodeGroup.length; j++) {
        const node = nodeGroup[j];
        const key = "" + i + j;
        currentNodeIds.push(key);
        table[key] = { node, lastCount: 0 };
        graph[key] = {};
        for (let n = 0; n < prevNodeIds.length; n++) {
          const prevNodeId = prevNodeIds[n];
          if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
            graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
            table[prevNodeId].lastCount += node.length;
          } else {
            if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;
            graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode2.getCharCountIndicator(node.mode, version2);
          }
        }
      }
      prevNodeIds = currentNodeIds;
    }
    for (let n = 0; n < prevNodeIds.length; n++) {
      graph[prevNodeIds[n]].end = 0;
    }
    return { map: graph, table };
  }
  function buildSingleSegment(data, modesHint) {
    let mode2;
    const bestMode = Mode2.getBestModeForData(data);
    mode2 = Mode2.from(modesHint, bestMode);
    if (mode2 !== Mode2.BYTE && mode2.bit < bestMode.bit) {
      throw new Error('"' + data + '" cannot be encoded with mode ' + Mode2.toString(mode2) + ".\n Suggested mode is: " + Mode2.toString(bestMode));
    }
    if (mode2 === Mode2.KANJI && !Utils2.isKanjiModeEnabled()) {
      mode2 = Mode2.BYTE;
    }
    switch (mode2) {
      case Mode2.NUMERIC:
        return new NumericData2(data);
      case Mode2.ALPHANUMERIC:
        return new AlphanumericData2(data);
      case Mode2.KANJI:
        return new KanjiData2(data);
      case Mode2.BYTE:
        return new ByteData2(data);
    }
  }
  exports.fromArray = function fromArray(array) {
    return array.reduce(function(acc, seg) {
      if (typeof seg === "string") {
        acc.push(buildSingleSegment(seg, null));
      } else if (seg.data) {
        acc.push(buildSingleSegment(seg.data, seg.mode));
      }
      return acc;
    }, []);
  };
  exports.fromString = function fromString(data, version2) {
    const segs = getSegmentsFromString(data, Utils2.isKanjiModeEnabled());
    const nodes = buildNodes(segs);
    const graph = buildGraph(nodes, version2);
    const path = dijkstra2.find_path(graph.map, "start", "end");
    const optimizedSegs = [];
    for (let i = 1; i < path.length - 1; i++) {
      optimizedSegs.push(graph.table[path[i]].node);
    }
    return exports.fromArray(mergeSegments(optimizedSegs));
  };
  exports.rawSplit = function rawSplit(data) {
    return exports.fromArray(
      getSegmentsFromString(data, Utils2.isKanjiModeEnabled())
    );
  };
})(segments);
const Utils$1 = utils$1;
const ECLevel = errorCorrectionLevel;
const BitBuffer = bitBuffer;
const BitMatrix = bitMatrix;
const AlignmentPattern = alignmentPattern;
const FinderPattern = finderPattern;
const MaskPattern = maskPattern;
const ECCode = errorCorrectionCode;
const ReedSolomonEncoder = reedSolomonEncoder;
const Version = version;
const FormatInfo = formatInfo;
const Mode = mode;
const Segments = segments;
function setupFinderPattern(matrix, version2) {
  const size = matrix.size;
  const pos = FinderPattern.getPositions(version2);
  for (let i = 0; i < pos.length; i++) {
    const row = pos[i][0];
    const col = pos[i][1];
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || size <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || size <= col + c) continue;
        if (r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4) {
          matrix.set(row + r, col + c, true, true);
        } else {
          matrix.set(row + r, col + c, false, true);
        }
      }
    }
  }
}
function setupTimingPattern(matrix) {
  const size = matrix.size;
  for (let r = 8; r < size - 8; r++) {
    const value = r % 2 === 0;
    matrix.set(r, 6, value, true);
    matrix.set(6, r, value, true);
  }
}
function setupAlignmentPattern(matrix, version2) {
  const pos = AlignmentPattern.getPositions(version2);
  for (let i = 0; i < pos.length; i++) {
    const row = pos[i][0];
    const col = pos[i][1];
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c === 0) {
          matrix.set(row + r, col + c, true, true);
        } else {
          matrix.set(row + r, col + c, false, true);
        }
      }
    }
  }
}
function setupVersionInfo(matrix, version2) {
  const size = matrix.size;
  const bits = Version.getEncodedBits(version2);
  let row, col, mod;
  for (let i = 0; i < 18; i++) {
    row = Math.floor(i / 3);
    col = i % 3 + size - 8 - 3;
    mod = (bits >> i & 1) === 1;
    matrix.set(row, col, mod, true);
    matrix.set(col, row, mod, true);
  }
}
function setupFormatInfo(matrix, errorCorrectionLevel2, maskPattern2) {
  const size = matrix.size;
  const bits = FormatInfo.getEncodedBits(errorCorrectionLevel2, maskPattern2);
  let i, mod;
  for (i = 0; i < 15; i++) {
    mod = (bits >> i & 1) === 1;
    if (i < 6) {
      matrix.set(i, 8, mod, true);
    } else if (i < 8) {
      matrix.set(i + 1, 8, mod, true);
    } else {
      matrix.set(size - 15 + i, 8, mod, true);
    }
    if (i < 8) {
      matrix.set(8, size - i - 1, mod, true);
    } else if (i < 9) {
      matrix.set(8, 15 - i - 1 + 1, mod, true);
    } else {
      matrix.set(8, 15 - i - 1, mod, true);
    }
  }
  matrix.set(size - 8, 8, 1, true);
}
function setupData(matrix, data) {
  const size = matrix.size;
  let inc = -1;
  let row = size - 1;
  let bitIndex = 7;
  let byteIndex = 0;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    while (true) {
      for (let c = 0; c < 2; c++) {
        if (!matrix.isReserved(row, col - c)) {
          let dark = false;
          if (byteIndex < data.length) {
            dark = (data[byteIndex] >>> bitIndex & 1) === 1;
          }
          matrix.set(row, col - c, dark);
          bitIndex--;
          if (bitIndex === -1) {
            byteIndex++;
            bitIndex = 7;
          }
        }
      }
      row += inc;
      if (row < 0 || size <= row) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
  }
}
function createData(version2, errorCorrectionLevel2, segments2) {
  const buffer = new BitBuffer();
  segments2.forEach(function(data) {
    buffer.put(data.mode.bit, 4);
    buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version2));
    data.write(buffer);
  });
  const totalCodewords = Utils$1.getSymbolTotalCodewords(version2);
  const ecTotalCodewords = ECCode.getTotalCodewordsCount(version2, errorCorrectionLevel2);
  const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
  if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
    buffer.put(0, 4);
  }
  while (buffer.getLengthInBits() % 8 !== 0) {
    buffer.putBit(0);
  }
  const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
  for (let i = 0; i < remainingByte; i++) {
    buffer.put(i % 2 ? 17 : 236, 8);
  }
  return createCodewords(buffer, version2, errorCorrectionLevel2);
}
function createCodewords(bitBuffer2, version2, errorCorrectionLevel2) {
  const totalCodewords = Utils$1.getSymbolTotalCodewords(version2);
  const ecTotalCodewords = ECCode.getTotalCodewordsCount(version2, errorCorrectionLevel2);
  const dataTotalCodewords = totalCodewords - ecTotalCodewords;
  const ecTotalBlocks = ECCode.getBlocksCount(version2, errorCorrectionLevel2);
  const blocksInGroup2 = totalCodewords % ecTotalBlocks;
  const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
  const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
  const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
  const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
  const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
  const rs = new ReedSolomonEncoder(ecCount);
  let offset = 0;
  const dcData = new Array(ecTotalBlocks);
  const ecData = new Array(ecTotalBlocks);
  let maxDataSize = 0;
  const buffer = new Uint8Array(bitBuffer2.buffer);
  for (let b = 0; b < ecTotalBlocks; b++) {
    const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
    dcData[b] = buffer.slice(offset, offset + dataSize);
    ecData[b] = rs.encode(dcData[b]);
    offset += dataSize;
    maxDataSize = Math.max(maxDataSize, dataSize);
  }
  const data = new Uint8Array(totalCodewords);
  let index = 0;
  let i, r;
  for (i = 0; i < maxDataSize; i++) {
    for (r = 0; r < ecTotalBlocks; r++) {
      if (i < dcData[r].length) {
        data[index++] = dcData[r][i];
      }
    }
  }
  for (i = 0; i < ecCount; i++) {
    for (r = 0; r < ecTotalBlocks; r++) {
      data[index++] = ecData[r][i];
    }
  }
  return data;
}
function createSymbol(data, version2, errorCorrectionLevel2, maskPattern2) {
  let segments2;
  if (Array.isArray(data)) {
    segments2 = Segments.fromArray(data);
  } else if (typeof data === "string") {
    let estimatedVersion = version2;
    if (!estimatedVersion) {
      const rawSegments = Segments.rawSplit(data);
      estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel2);
    }
    segments2 = Segments.fromString(data, estimatedVersion || 40);
  } else {
    throw new Error("Invalid data");
  }
  const bestVersion = Version.getBestVersionForData(segments2, errorCorrectionLevel2);
  if (!bestVersion) {
    throw new Error("The amount of data is too big to be stored in a QR Code");
  }
  if (!version2) {
    version2 = bestVersion;
  } else if (version2 < bestVersion) {
    throw new Error(
      "\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " + bestVersion + ".\n"
    );
  }
  const dataBits = createData(version2, errorCorrectionLevel2, segments2);
  const moduleCount = Utils$1.getSymbolSize(version2);
  const modules = new BitMatrix(moduleCount);
  setupFinderPattern(modules, version2);
  setupTimingPattern(modules);
  setupAlignmentPattern(modules, version2);
  setupFormatInfo(modules, errorCorrectionLevel2, 0);
  if (version2 >= 7) {
    setupVersionInfo(modules, version2);
  }
  setupData(modules, dataBits);
  if (isNaN(maskPattern2)) {
    maskPattern2 = MaskPattern.getBestMask(
      modules,
      setupFormatInfo.bind(null, modules, errorCorrectionLevel2)
    );
  }
  MaskPattern.applyMask(maskPattern2, modules);
  setupFormatInfo(modules, errorCorrectionLevel2, maskPattern2);
  return {
    modules,
    version: version2,
    errorCorrectionLevel: errorCorrectionLevel2,
    maskPattern: maskPattern2,
    segments: segments2
  };
}
qrcode.create = function create(data, options) {
  if (typeof data === "undefined" || data === "") {
    throw new Error("No input text");
  }
  let errorCorrectionLevel2 = ECLevel.M;
  let version2;
  let mask;
  if (typeof options !== "undefined") {
    errorCorrectionLevel2 = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
    version2 = Version.from(options.version);
    mask = MaskPattern.from(options.maskPattern);
    if (options.toSJISFunc) {
      Utils$1.setToSJISFunction(options.toSJISFunc);
    }
  }
  return createSymbol(data, version2, errorCorrectionLevel2, mask);
};
var canvas = {};
var utils = {};
(function(exports) {
  function hex2rgba(hex) {
    if (typeof hex === "number") {
      hex = hex.toString();
    }
    if (typeof hex !== "string") {
      throw new Error("Color should be defined as hex string");
    }
    let hexCode = hex.slice().replace("#", "").split("");
    if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
      throw new Error("Invalid hex color: " + hex);
    }
    if (hexCode.length === 3 || hexCode.length === 4) {
      hexCode = Array.prototype.concat.apply([], hexCode.map(function(c) {
        return [c, c];
      }));
    }
    if (hexCode.length === 6) hexCode.push("F", "F");
    const hexValue = parseInt(hexCode.join(""), 16);
    return {
      r: hexValue >> 24 & 255,
      g: hexValue >> 16 & 255,
      b: hexValue >> 8 & 255,
      a: hexValue & 255,
      hex: "#" + hexCode.slice(0, 6).join("")
    };
  }
  exports.getOptions = function getOptions(options) {
    if (!options) options = {};
    if (!options.color) options.color = {};
    const margin = typeof options.margin === "undefined" || options.margin === null || options.margin < 0 ? 4 : options.margin;
    const width = options.width && options.width >= 21 ? options.width : void 0;
    const scale = options.scale || 4;
    return {
      width,
      scale: width ? 4 : scale,
      margin,
      color: {
        dark: hex2rgba(options.color.dark || "#000000ff"),
        light: hex2rgba(options.color.light || "#ffffffff")
      },
      type: options.type,
      rendererOpts: options.rendererOpts || {}
    };
  };
  exports.getScale = function getScale(qrSize, opts) {
    return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
  };
  exports.getImageWidth = function getImageWidth(qrSize, opts) {
    const scale = exports.getScale(qrSize, opts);
    return Math.floor((qrSize + opts.margin * 2) * scale);
  };
  exports.qrToImageData = function qrToImageData(imgData, qr, opts) {
    const size = qr.modules.size;
    const data = qr.modules.data;
    const scale = exports.getScale(size, opts);
    const symbolSize = Math.floor((size + opts.margin * 2) * scale);
    const scaledMargin = opts.margin * scale;
    const palette = [opts.color.light, opts.color.dark];
    for (let i = 0; i < symbolSize; i++) {
      for (let j = 0; j < symbolSize; j++) {
        let posDst = (i * symbolSize + j) * 4;
        let pxColor = opts.color.light;
        if (i >= scaledMargin && j >= scaledMargin && i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
          const iSrc = Math.floor((i - scaledMargin) / scale);
          const jSrc = Math.floor((j - scaledMargin) / scale);
          pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
        }
        imgData[posDst++] = pxColor.r;
        imgData[posDst++] = pxColor.g;
        imgData[posDst++] = pxColor.b;
        imgData[posDst] = pxColor.a;
      }
    }
  };
})(utils);
(function(exports) {
  const Utils2 = utils;
  function clearCanvas(ctx, canvas2, size) {
    ctx.clearRect(0, 0, canvas2.width, canvas2.height);
    if (!canvas2.style) canvas2.style = {};
    canvas2.height = size;
    canvas2.width = size;
    canvas2.style.height = size + "px";
    canvas2.style.width = size + "px";
  }
  function getCanvasElement() {
    try {
      return document.createElement("canvas");
    } catch (e) {
      throw new Error("You need to specify a canvas element");
    }
  }
  exports.render = function render2(qrData, canvas2, options) {
    let opts = options;
    let canvasEl = canvas2;
    if (typeof opts === "undefined" && (!canvas2 || !canvas2.getContext)) {
      opts = canvas2;
      canvas2 = void 0;
    }
    if (!canvas2) {
      canvasEl = getCanvasElement();
    }
    opts = Utils2.getOptions(opts);
    const size = Utils2.getImageWidth(qrData.modules.size, opts);
    const ctx = canvasEl.getContext("2d");
    const image = ctx.createImageData(size, size);
    Utils2.qrToImageData(image.data, qrData, opts);
    clearCanvas(ctx, canvasEl, size);
    ctx.putImageData(image, 0, 0);
    return canvasEl;
  };
  exports.renderToDataURL = function renderToDataURL(qrData, canvas2, options) {
    let opts = options;
    if (typeof opts === "undefined" && (!canvas2 || !canvas2.getContext)) {
      opts = canvas2;
      canvas2 = void 0;
    }
    if (!opts) opts = {};
    const canvasEl = exports.render(qrData, canvas2, opts);
    const type = opts.type || "image/png";
    const rendererOpts = opts.rendererOpts || {};
    return canvasEl.toDataURL(type, rendererOpts.quality);
  };
})(canvas);
var svgTag = {};
const Utils = utils;
function getColorAttrib(color, attrib) {
  const alpha = color.a / 255;
  const str = attrib + '="' + color.hex + '"';
  return alpha < 1 ? str + " " + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"' : str;
}
function svgCmd(cmd, x, y) {
  let str = cmd + x;
  if (typeof y !== "undefined") str += " " + y;
  return str;
}
function qrToPath(data, size, margin) {
  let path = "";
  let moveBy = 0;
  let newRow = false;
  let lineLength = 0;
  for (let i = 0; i < data.length; i++) {
    const col = Math.floor(i % size);
    const row = Math.floor(i / size);
    if (!col && !newRow) newRow = true;
    if (data[i]) {
      lineLength++;
      if (!(i > 0 && col > 0 && data[i - 1])) {
        path += newRow ? svgCmd("M", col + margin, 0.5 + row + margin) : svgCmd("m", moveBy, 0);
        moveBy = 0;
        newRow = false;
      }
      if (!(col + 1 < size && data[i + 1])) {
        path += svgCmd("h", lineLength);
        lineLength = 0;
      }
    } else {
      moveBy++;
    }
  }
  return path;
}
svgTag.render = function render(qrData, options, cb) {
  const opts = Utils.getOptions(options);
  const size = qrData.modules.size;
  const data = qrData.modules.data;
  const qrcodesize = size + opts.margin * 2;
  const bg = !opts.color.light.a ? "" : "<path " + getColorAttrib(opts.color.light, "fill") + ' d="M0 0h' + qrcodesize + "v" + qrcodesize + 'H0z"/>';
  const path = "<path " + getColorAttrib(opts.color.dark, "stroke") + ' d="' + qrToPath(data, size, opts.margin) + '"/>';
  const viewBox = 'viewBox="0 0 ' + qrcodesize + " " + qrcodesize + '"';
  const width = !opts.width ? "" : 'width="' + opts.width + '" height="' + opts.width + '" ';
  const svgTag2 = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + "</svg>\n";
  if (typeof cb === "function") {
    cb(null, svgTag2);
  }
  return svgTag2;
};
const canPromise = canPromise$1;
const QRCode = qrcode;
const CanvasRenderer = canvas;
const SvgRenderer = svgTag;
function renderCanvas(renderFunc, canvas2, text, opts, cb) {
  const args = [].slice.call(arguments, 1);
  const argsNum = args.length;
  const isLastArgCb = typeof args[argsNum - 1] === "function";
  if (!isLastArgCb && !canPromise()) {
    throw new Error("Callback required as last argument");
  }
  if (isLastArgCb) {
    if (argsNum < 2) {
      throw new Error("Too few arguments provided");
    }
    if (argsNum === 2) {
      cb = text;
      text = canvas2;
      canvas2 = opts = void 0;
    } else if (argsNum === 3) {
      if (canvas2.getContext && typeof cb === "undefined") {
        cb = opts;
        opts = void 0;
      } else {
        cb = opts;
        opts = text;
        text = canvas2;
        canvas2 = void 0;
      }
    }
  } else {
    if (argsNum < 1) {
      throw new Error("Too few arguments provided");
    }
    if (argsNum === 1) {
      text = canvas2;
      canvas2 = opts = void 0;
    } else if (argsNum === 2 && !canvas2.getContext) {
      opts = text;
      text = canvas2;
      canvas2 = void 0;
    }
    return new Promise(function(resolve, reject) {
      try {
        const data = QRCode.create(text, opts);
        resolve(renderFunc(data, canvas2, opts));
      } catch (e) {
        reject(e);
      }
    });
  }
  try {
    const data = QRCode.create(text, opts);
    cb(null, renderFunc(data, canvas2, opts));
  } catch (e) {
    cb(e);
  }
}
browser.create = QRCode.create;
browser.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
browser.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);
browser.toString = renderCanvas.bind(null, function(data, _, opts) {
  return SvgRenderer.render(data, opts);
});
const ERC20_ABI = [
  // Read functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  // Write functions
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];
async function getTokenContract(network, tokenAddress) {
  const provider = await getProvider(network);
  return new Contract(tokenAddress, ERC20_ABI, provider);
}
async function getTokenMetadata(network, tokenAddress) {
  try {
    const contract = await getTokenContract(network, tokenAddress);
    const [name, symbol, decimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals()
    ]);
    return { name, symbol, decimals: Number(decimals) };
  } catch (error) {
    throw new Error(`Failed to fetch token metadata: ${error.message}`);
  }
}
async function getTokenBalance(network, tokenAddress, accountAddress) {
  try {
    const contract = await getTokenContract(network, tokenAddress);
    const balance = await contract.balanceOf(accountAddress);
    return balance.toString();
  } catch (error) {
    throw new Error(`Failed to get token balance: ${error.message}`);
  }
}
function formatTokenBalance(balanceWei, decimals, displayDecimals = 4) {
  try {
    const balance = formatUnits(balanceWei, decimals);
    const num = parseFloat(balance);
    return num.toFixed(displayDecimals);
  } catch (error) {
    return "0.0000";
  }
}
function parseTokenAmount(amount, decimals) {
  return parseUnits(amount, decimals).toString();
}
async function transferToken(signer, tokenAddress, toAddress, amount) {
  try {
    const contract = new Contract(tokenAddress, ERC20_ABI, signer);
    const tx = await contract.transfer(toAddress, amount);
    return tx;
  } catch (error) {
    throw new Error(`Failed to transfer token: ${error.message}`);
  }
}
async function validateTokenContract(network, tokenAddress) {
  try {
    if (!isAddress(tokenAddress)) {
      return false;
    }
    await getTokenMetadata(network, tokenAddress);
    return true;
  } catch (error) {
    return false;
  }
}
const MAX_TOKENS_PER_NETWORK = 20;
const DEFAULT_TOKENS = {
  pulsechain: {
    "HEX": {
      name: "HEX",
      symbol: "HEX",
      address: "0x2b591e99afe9f32eaa6214f7b7629768c40eeb39",
      decimals: 8,
      logo: "hex.png",
      homeUrl: "https://hex.com",
      dexScreenerUrl: "https://dexscreener.com/pulsechain/0xf1f4ee610b2babb05c635f726ef8b0c568c8dc65"
    },
    "PLSX": {
      name: "PulseX",
      symbol: "PLSX",
      address: "0x95B303987A60C71504D99Aa1b13B4DA07b0790ab",
      decimals: 18,
      logo: "plsx.png",
      homeUrl: "https://pulsex.com",
      dexScreenerUrl: "https://dexscreener.com/pulsechain/0x1b45b9148791d3a104184cd5dfe5ce57193a3ee9"
    },
    "INC": {
      name: "Incentive",
      symbol: "INC",
      address: "0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d",
      decimals: 18,
      logo: "inc.svg",
      homeUrl: "https://incentivetoken.io",
      dexScreenerUrl: "https://dexscreener.com/pulsechain/0xf808bb6265e9ca27002c0a04562bf50d4fe37eaa"
    },
    "Savant": {
      name: "Savant",
      symbol: "Savant",
      address: "0xf16e17e4a01bf99B0A03Fd3Ab697bC87906e1809",
      decimals: 18,
      logo: "savant-192.png",
      homeUrl: "https://uscgvet.github.io/Savant/trade.html",
      dexScreenerUrl: "https://dexscreener.com/pulsechain/0xaaa8894584aaf0092372f0c753769a50f6060742"
    },
    "HXR": {
      name: "HexRewards",
      symbol: "HXR",
      address: "0xCfCb89f00576A775d9f81961A37ba7DCf12C7d9B",
      decimals: 18,
      logo: "hexrewards-1000.png",
      homeUrl: "https://uscgvet.github.io/HexRewards/",
      dexScreenerUrl: "https://dexscreener.com/pulsechain/0xd5a8de033c8697ceaa844ca596cc7583c4f8f612"
    },
    "TKR": {
      name: "Taker",
      symbol: "TKR",
      address: "0xd9e59020089916A8EfA7Dd0B605d55219D72dB7B",
      decimals: 18,
      logo: "tkr.svg",
      homeUrl: "https://uscgvet.github.io/jdai-dapp/",
      dexScreenerUrl: "https://dexscreener.com/pulsechain/0x205c6d44d84e82606e4e921f87b51b71ba85f0f0"
    },
    "JDAI": {
      name: "JDAI Unstablecoin",
      symbol: "JDAI",
      address: "0x1610E75C9b48BF550137820452dE4049bB22bB72",
      decimals: 18,
      logo: "jdai.svg",
      homeUrl: "https://uscgvet.github.io/jdai-dapp/",
      dexScreenerUrl: "https://dexscreener.com/pulsechain/0x70658Ce6D6C09acdE646F6ea9C57Ba64f4Dc350f"
    },
    "Ricky": {
      name: "Ricky",
      symbol: "Ricky",
      address: "0x79FC0E1d3EC00d81E5423DcC01A617b0e1245c2B",
      decimals: 18,
      logo: "ricky.jpg",
      homeUrl: "https://truthbehindrichardheart.com/",
      dexScreenerUrl: "https://dexscreener.com/pulsechain/0xbfe5ae40bbca74878419ad7d7e115a30ccfc62f1"
    }
  },
  pulsechainTestnet: {
    "HEART": {
      name: "HeartToken",
      symbol: "HEART",
      address: "0x735742D8e5Fa35c165deeed4560Dd91A15BA1aB2",
      decimals: 18,
      logo: "heart.png"
    }
  },
  ethereum: {},
  sepolia: {}
};
function getStorageKey(network) {
  return `custom_tokens_${network}`;
}
function getDefaultTokensKey(network) {
  return `enabled_default_tokens_${network}`;
}
async function getCustomTokens(network) {
  const key = getStorageKey(network);
  const tokens = await load(key);
  return tokens || [];
}
async function getEnabledDefaultTokens(network) {
  const key = getDefaultTokensKey(network);
  const enabled = await load(key);
  if (!enabled) {
    return Object.keys(DEFAULT_TOKENS[network] || {});
  }
  return enabled;
}
async function getAllTokens(network) {
  const customTokens = await getCustomTokens(network);
  const enabledDefaults = await getEnabledDefaultTokens(network);
  const defaultTokens = [];
  const networkDefaults = DEFAULT_TOKENS[network] || {};
  for (const symbol of enabledDefaults) {
    if (networkDefaults[symbol]) {
      defaultTokens.push({
        ...networkDefaults[symbol],
        isDefault: true
      });
    }
  }
  return [...defaultTokens, ...customTokens];
}
async function addCustomToken(network, tokenAddress) {
  tokenAddress = tokenAddress.trim();
  if (!tokenAddress.startsWith("0x") || tokenAddress.length !== 42) {
    throw new Error("Invalid token address format");
  }
  const networkDefaults = DEFAULT_TOKENS[network] || {};
  for (const symbol in networkDefaults) {
    if (networkDefaults[symbol].address.toLowerCase() === tokenAddress.toLowerCase()) {
      throw new Error(`This is a default token (${symbol}). Use the default tokens list instead.`);
    }
  }
  const customTokens = await getCustomTokens(network);
  if (customTokens.length >= MAX_TOKENS_PER_NETWORK) {
    throw new Error(`Maximum ${MAX_TOKENS_PER_NETWORK} custom tokens per network`);
  }
  const exists = customTokens.find(
    (t) => t.address.toLowerCase() === tokenAddress.toLowerCase()
  );
  if (exists) {
    throw new Error("Token already added");
  }
  const isValid2 = await validateTokenContract(network, tokenAddress);
  if (!isValid2) {
    throw new Error("Invalid ERC-20 token contract");
  }
  const metadata = await getTokenMetadata(network, tokenAddress);
  const token = {
    address: tokenAddress,
    name: metadata.name,
    symbol: metadata.symbol,
    decimals: metadata.decimals,
    logo: null,
    isDefault: false,
    addedAt: Date.now()
  };
  customTokens.push(token);
  const key = getStorageKey(network);
  await save(key, customTokens);
  return token;
}
async function removeCustomToken(network, tokenAddress) {
  const customTokens = await getCustomTokens(network);
  const filtered = customTokens.filter(
    (t) => t.address.toLowerCase() !== tokenAddress.toLowerCase()
  );
  const key = getStorageKey(network);
  await save(key, filtered);
}
async function toggleDefaultToken(network, symbol, enabled) {
  const enabledTokens = await getEnabledDefaultTokens(network);
  let updated;
  if (enabled) {
    if (!enabledTokens.includes(symbol)) {
      updated = [...enabledTokens, symbol];
    } else {
      return;
    }
  } else {
    updated = enabledTokens.filter((s) => s !== symbol);
  }
  const key = getDefaultTokensKey(network);
  await save(key, updated);
}
const PAIR_ABI = [
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)"
];
const PULSEX_PAIRS = {
  pulsechain: {
    // PLS/DAI - Price anchor for USD conversion
    "PLS_DAI": "0xE56043671df55dE5CDf8459710433C10324DE0aE",
    // May not exist, fallback to USDC
    // Major token pairs (all paired with WPLS)
    "HEX_PLS": "0xf1F4ee610b2bAbB05C635F726eF8B0C568c8dc65",
    "PLSX_PLS": "0x1b45b9148791d3a104184Cd5DFE5CE57193a3ee9",
    "INC_PLS": "0xf808Bb6265e9Ca27002c0A04562Bf50d4FE37EAA",
    // From GeckoTerminal (checksummed)
    "Savant_PLS": "0xaAA8894584aAF0092372f0C753769a50f6060742",
    "HXR_PLS": "0xD5A8de033c8697cEaa844CA596cc7583c4f8F612",
    "TKR_PLS": "0x205C6d44d84E82606E4E921f87b51b71ba85F0f0",
    "JDAI_PLS": "0x70658Ce6D6C09acdE646F6ea9C57Ba64f4Dc350f",
    "Ricky_PLS": "0xbfe5ae40bbca74878419ad7d7e115a30ccfc62f1"
  }
};
const TOKEN_ADDRESSES = {
  pulsechain: {
    WPLS: { address: "0xA1077a294dDE1B09bB078844df40758a5D0f9a27", decimals: 18 },
    DAI: { address: "0xefD766cCb38EaF1dfd701853BFCe31359239F305", decimals: 18 },
    HEX: { address: "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39", decimals: 8 },
    PLSX: { address: "0x95B303987A60C71504D99Aa1b13B4DA07b0790ab", decimals: 18 },
    INC: { address: "0x2FA878Ab3F87CC1C9737Fc071108F904c0B0C95d", decimals: 18 },
    Savant: { address: "0xf16e17e4a01bf99B0A03Fd3Ab697bC87906e1809", decimals: 18 },
    HXR: { address: "0xCfCb89f00576A775d9f81961A37ba7DCf12C7d9B", decimals: 18 },
    TKR: { address: "0xd9e59020089916A8EfA7Dd0B605d55219D72dB7B", decimals: 18 },
    JDAI: { address: "0x1610E75C9b48BF550137820452dE4049bB22bB72", decimals: 18 },
    Ricky: { address: "0x79FC0E1d3EC00d81E5423DcC01A617b0e1245c2B", decimals: 18 }
  }
};
const priceCache = {
  prices: {},
  timestamp: 0,
  CACHE_DURATION: 5 * 60 * 1e3
  // 5 minutes
};
async function getPairReserves(provider, pairAddress) {
  try {
    const pairContract = new Contract(pairAddress, PAIR_ABI, provider);
    const [reserve0, reserve1] = await pairContract.getReserves();
    const token0 = await pairContract.token0();
    const token1 = await pairContract.token1();
    return {
      reserve0: reserve0.toString(),
      reserve1: reserve1.toString(),
      token0: token0.toLowerCase(),
      token1: token1.toLowerCase()
    };
  } catch (error) {
    console.error("Error fetching pair reserves:", pairAddress, error);
    return null;
  }
}
function calculatePrice(reserve0, reserve1, decimals0 = 18, decimals1 = 18) {
  const r0 = parseFloat(formatUnits(reserve0, decimals0));
  const r1 = parseFloat(formatUnits(reserve1, decimals1));
  if (r0 === 0) return 0;
  return r1 / r0;
}
async function getPLSPrice(provider) {
  try {
    const daiPairAddress = PULSEX_PAIRS.pulsechain.PLS_DAI;
    const daiReserves = await getPairReserves(provider, daiPairAddress);
    if (daiReserves) {
      const tokens2 = TOKEN_ADDRESSES.pulsechain;
      const plsAddress = tokens2.WPLS.address.toLowerCase();
      const daiAddress = tokens2.DAI.address.toLowerCase();
      let plsReserve2, daiReserve;
      if (daiReserves.token0 === plsAddress) {
        plsReserve2 = daiReserves.reserve0;
        daiReserve = daiReserves.reserve1;
      } else {
        plsReserve2 = daiReserves.reserve1;
        daiReserve = daiReserves.reserve0;
      }
      const plsPrice = calculatePrice(plsReserve2, daiReserve, 18, 18);
      console.log("✓ PLS price from DAI pair:", plsPrice);
      return plsPrice;
    }
  } catch (error) {
    console.warn("Could not fetch PLS/DAI price, trying alternative...", error.message);
  }
  console.log("Using HEX-based price estimation as fallback");
  const hexPairAddress = PULSEX_PAIRS.pulsechain.HEX_PLS;
  const hexReserves = await getPairReserves(provider, hexPairAddress);
  if (!hexReserves) {
    console.error("Could not fetch HEX/PLS reserves for price calculation");
    return null;
  }
  const tokens = TOKEN_ADDRESSES.pulsechain;
  const hexAddress = tokens.HEX.address.toLowerCase();
  let plsReserve, hexReserve;
  if (hexReserves.token0 === hexAddress) {
    hexReserve = hexReserves.reserve0;
    plsReserve = hexReserves.reserve1;
  } else {
    hexReserve = hexReserves.reserve1;
    plsReserve = hexReserves.reserve0;
  }
  const hexReserveFormatted = parseFloat(formatUnits(hexReserve, 8));
  const plsReserveFormatted = parseFloat(formatUnits(plsReserve, 18));
  const hexPriceInPls = plsReserveFormatted / hexReserveFormatted;
  const hexUsdPrice = 0.01;
  const plsUsdPrice = hexUsdPrice / hexPriceInPls;
  return plsUsdPrice;
}
async function getTokenPriceInPLS(provider, pairAddress, tokenAddress, tokenDecimals) {
  const reserves = await getPairReserves(provider, pairAddress);
  if (!reserves) return null;
  const targetToken = tokenAddress.toLowerCase();
  let tokenReserve, plsReserve;
  if (reserves.token0 === targetToken) {
    tokenReserve = reserves.reserve0;
    plsReserve = reserves.reserve1;
  } else if (reserves.token1 === targetToken) {
    tokenReserve = reserves.reserve1;
    plsReserve = reserves.reserve0;
  } else {
    console.error("Token not found in pair:", tokenAddress, pairAddress);
    return null;
  }
  const tokenReserveFormatted = parseFloat(formatUnits(tokenReserve, tokenDecimals));
  const plsReserveFormatted = parseFloat(formatUnits(plsReserve, 18));
  if (tokenReserveFormatted === 0) return 0;
  const tokenPriceInPls = plsReserveFormatted / tokenReserveFormatted;
  return tokenPriceInPls;
}
async function fetchTokenPrices(provider, network = "pulsechain") {
  const now = Date.now();
  if (priceCache.prices[network] && now - priceCache.timestamp < priceCache.CACHE_DURATION) {
    return priceCache.prices[network];
  }
  try {
    const prices = {};
    const plsUsdPrice = await getPLSPrice(provider);
    if (!plsUsdPrice) {
      console.warn("Could not fetch PLS price");
      return null;
    }
    prices.PLS = plsUsdPrice;
    const pairs = PULSEX_PAIRS[network];
    const tokens = TOKEN_ADDRESSES[network];
    const hexPriceInPls = await getTokenPriceInPLS(provider, pairs.HEX_PLS, tokens.HEX.address, tokens.HEX.decimals);
    if (hexPriceInPls) {
      prices.HEX = hexPriceInPls * plsUsdPrice;
    }
    const plsxPriceInPls = await getTokenPriceInPLS(provider, pairs.PLSX_PLS, tokens.PLSX.address, tokens.PLSX.decimals);
    if (plsxPriceInPls) {
      prices.PLSX = plsxPriceInPls * plsUsdPrice;
    }
    const incPriceInPls = await getTokenPriceInPLS(provider, pairs.INC_PLS, tokens.INC.address, tokens.INC.decimals);
    if (incPriceInPls) {
      prices.INC = incPriceInPls * plsUsdPrice;
    }
    const savantPriceInPls = await getTokenPriceInPLS(provider, pairs.Savant_PLS, tokens.Savant.address, tokens.Savant.decimals);
    if (savantPriceInPls) {
      prices.Savant = savantPriceInPls * plsUsdPrice;
    }
    const hxrPriceInPls = await getTokenPriceInPLS(provider, pairs.HXR_PLS, tokens.HXR.address, tokens.HXR.decimals);
    if (hxrPriceInPls) {
      prices.HXR = hxrPriceInPls * plsUsdPrice;
    }
    const tkrPriceInPls = await getTokenPriceInPLS(provider, pairs.TKR_PLS, tokens.TKR.address, tokens.TKR.decimals);
    if (tkrPriceInPls) {
      prices.TKR = tkrPriceInPls * plsUsdPrice;
    }
    const jdaiPriceInPls = await getTokenPriceInPLS(provider, pairs.JDAI_PLS, tokens.JDAI.address, tokens.JDAI.decimals);
    if (jdaiPriceInPls) {
      prices.JDAI = jdaiPriceInPls * plsUsdPrice;
    }
    const rickyPriceInPls = await getTokenPriceInPLS(provider, pairs.Ricky_PLS, tokens.Ricky.address, tokens.Ricky.decimals);
    if (rickyPriceInPls) {
      prices.Ricky = rickyPriceInPls * plsUsdPrice;
    }
    priceCache.prices[network] = prices;
    priceCache.timestamp = now;
    return prices;
  } catch (error) {
    console.error("Error fetching token prices:", error);
    return null;
  }
}
function getTokenValueUSD(tokenSymbol, amount, decimals, prices) {
  if (!prices || !prices[tokenSymbol]) {
    return null;
  }
  const tokenAmount = parseFloat(formatUnits(amount, decimals));
  const tokenPrice = prices[tokenSymbol];
  return tokenAmount * tokenPrice;
}
function formatUSD(value) {
  if (value === null || value === void 0) {
    return "—";
  }
  if (value < 0.01) {
    return `$${value.toFixed(6)}`;
  } else if (value < 1) {
    return `$${value.toFixed(4)}`;
  } else if (value < 100) {
    return `$${value.toFixed(2)}`;
  } else {
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
function escapeHtml(text) {
  if (typeof text !== "string") return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
function sanitizeError(message) {
  if (typeof message !== "string") return "Unknown error";
  let sanitized = message.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  sanitized = sanitized.replace(/<[^>]*>/g, "");
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=/gi, "");
  if (sanitized.length > 300) {
    sanitized = sanitized.substring(0, 297) + "...";
  }
  return sanitized || "Unknown error";
}
let currentState = {
  isUnlocked: false,
  address: null,
  balance: "0",
  network: "pulsechain",
  // Default to PulseChain Mainnet
  sessionToken: null,
  // Session token for authenticated operations (stored in memory only)
  settings: {
    autoLockMinutes: 15,
    showTestNetworks: true,
    decimalPlaces: 8,
    theme: "high-contrast",
    maxGasPriceGwei: 1e3
    // Maximum gas price in Gwei (default 1000)
  },
  networkSettings: null,
  // Will be loaded from storage or use defaults
  lastActivityTime: null,
  // Track last activity for auto-lock
  tokenPrices: null,
  // Token prices in USD (cached from PulseX)
  currentTokenDetails: null
  // Currently viewing token details
};
let autoLockTimer = null;
const RATE_LIMIT_KEY = "password_attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1e3;
const NETWORK_NAMES = {
  "pulsechainTestnet": "PulseChain Testnet V4",
  "pulsechain": "PulseChain Mainnet",
  "ethereum": "Ethereum Mainnet",
  "sepolia": "Sepolia Testnet"
};
const BLOCK_EXPLORERS = {
  "pulsechainTestnet": {
    base: "https://scan.v4.testnet.pulsechain.com",
    tx: "/tx/{hash}",
    address: "/address/{address}",
    token: "/token/{address}"
  },
  "pulsechain": {
    base: "https://scan.mypinata.cloud/ipfs/bafybeienxyoyrhn5tswclvd3gdjy5mtkkwmu37aqtml6onbf7xnb3o22pe/",
    tx: "#/tx/{hash}",
    address: "#/address/{address}",
    token: "#/token/{address}"
  },
  "ethereum": {
    base: "https://etherscan.io",
    tx: "/tx/{hash}",
    address: "/address/{address}",
    token: "/token/{address}"
  },
  "sepolia": {
    base: "https://sepolia.etherscan.io",
    tx: "/tx/{hash}",
    address: "/address/{address}",
    token: "/token/{address}"
  }
};
function getExplorerUrl(network, type, value) {
  const explorer = BLOCK_EXPLORERS[network];
  if (!explorer) return "";
  const pattern = explorer[type];
  if (!pattern) return "";
  return explorer.base + pattern.replace(`{${"hash"}}`, value);
}
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get("action");
  const origin = urlParams.get("origin");
  const requestId = urlParams.get("requestId");
  if (action === "connect" && origin && requestId) {
    await handleConnectionApprovalScreen(origin, requestId);
    return;
  }
  if (action === "transaction" && requestId) {
    setupEventListeners();
    await handleTransactionApprovalScreen(requestId);
    return;
  }
  if (action === "addToken" && requestId) {
    await handleTokenAddApprovalScreen(requestId);
    return;
  }
  await migrateToMultiWallet();
  await loadSettings();
  await loadNetwork();
  applyTheme();
  await checkWalletStatus();
  setupEventListeners();
  updateNetworkDisplays();
});
function showScreen(screenId) {
  const screens = document.querySelectorAll('[id^="screen-"]');
  screens.forEach((screen2) => screen2.classList.add("hidden"));
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.remove("hidden");
    window.scrollTo(0, 0);
  }
}
async function checkWalletStatus() {
  const exists = await walletExists();
  if (!exists) {
    showScreen("screen-setup");
  } else {
    showScreen("screen-unlock");
  }
}
async function loadSettings() {
  const saved = await load("settings");
  if (saved) {
    currentState.settings = { ...currentState.settings, ...saved };
  }
  const networkSettings = await load("networkSettings");
  if (networkSettings) {
    currentState.networkSettings = networkSettings;
  }
}
async function saveSettings() {
  await save("settings", currentState.settings);
}
async function loadNetwork() {
  const saved = await load("currentNetwork");
  if (saved) {
    currentState.network = saved;
  }
}
async function saveNetwork() {
  await save("currentNetwork", currentState.network);
}
function applyTheme() {
  document.body.classList.remove("theme-high-contrast", "theme-professional", "theme-amber", "theme-cga", "theme-classic");
  if (currentState.settings.theme !== "high-contrast") {
    document.body.classList.add(`theme-${currentState.settings.theme}`);
  }
}
function setupEventListeners() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S, _T, _U, _V, _W, _X, _Y, _Z, __, _$, _aa, _ba, _ca, _da, _ea, _fa, _ga, _ha, _ia, _ja, _ka, _la, _ma, _na, _oa, _pa, _qa, _ra, _sa, _ta, _ua, _va, _wa, _xa, _ya, _za, _Aa, _Ba, _Ca, _Da, _Ea, _Fa, _Ga, _Ha, _Ia, _Ja, _Ka, _La, _Ma, _Na, _Oa, _Pa;
  (_a = document.getElementById("btn-create-wallet")) == null ? void 0 : _a.addEventListener("click", async () => {
    await generateNewMnemonic();
    updateNetworkDisplays();
    showScreen("screen-create");
  });
  (_b = document.getElementById("btn-import-wallet")) == null ? void 0 : _b.addEventListener("click", () => {
    updateNetworkDisplays();
    showScreen("screen-import");
  });
  (_c = document.getElementById("network-select-setup")) == null ? void 0 : _c.addEventListener("change", (e) => {
    currentState.network = e.target.value;
    saveNetwork();
    updateNetworkDisplays();
  });
  (_d = document.getElementById("chk-saved-mnemonic")) == null ? void 0 : _d.addEventListener("change", (e) => {
    const passwordCreate = document.getElementById("password-create").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    const btn = document.getElementById("btn-create-submit");
    btn.disabled = !(e.target.checked && passwordCreate && passwordConfirm && passwordCreate === passwordConfirm);
  });
  ["password-create", "password-confirm"].forEach((id) => {
    var _a2;
    (_a2 = document.getElementById(id)) == null ? void 0 : _a2.addEventListener("input", () => {
      const checked = document.getElementById("chk-saved-mnemonic").checked;
      const passwordCreate = document.getElementById("password-create").value;
      const passwordConfirm = document.getElementById("password-confirm").value;
      const btn = document.getElementById("btn-create-submit");
      btn.disabled = !(checked && passwordCreate && passwordConfirm && passwordCreate === passwordConfirm);
    });
  });
  (_e = document.getElementById("btn-create-submit")) == null ? void 0 : _e.addEventListener("click", handleCreateWallet);
  (_f = document.getElementById("btn-cancel-create")) == null ? void 0 : _f.addEventListener("click", () => showScreen("screen-setup"));
  (_g = document.getElementById("btn-back-from-create")) == null ? void 0 : _g.addEventListener("click", () => showScreen("screen-setup"));
  (_h = document.getElementById("import-method")) == null ? void 0 : _h.addEventListener("change", (e) => {
    const mnemonicGroup = document.getElementById("import-mnemonic-group");
    const privatekeyGroup = document.getElementById("import-privatekey-group");
    if (e.target.value === "mnemonic") {
      mnemonicGroup.classList.remove("hidden");
      privatekeyGroup.classList.add("hidden");
    } else {
      mnemonicGroup.classList.add("hidden");
      privatekeyGroup.classList.remove("hidden");
    }
  });
  (_i = document.getElementById("btn-import-submit")) == null ? void 0 : _i.addEventListener("click", handleImportWallet);
  (_j = document.getElementById("btn-cancel-import")) == null ? void 0 : _j.addEventListener("click", () => showScreen("screen-setup"));
  (_k = document.getElementById("btn-back-from-import")) == null ? void 0 : _k.addEventListener("click", () => showScreen("screen-setup"));
  (_l = document.getElementById("btn-unlock")) == null ? void 0 : _l.addEventListener("click", handleUnlock);
  (_m = document.getElementById("password-unlock")) == null ? void 0 : _m.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleUnlock();
    }
  });
  const networkSelectCustom = document.getElementById("network-select-custom");
  const networkDropdownMenu = document.getElementById("network-dropdown-menu");
  document.querySelectorAll(".network-option img").forEach((img) => {
    const logoFile = img.getAttribute("data-logo");
    if (logoFile) {
      img.src = chrome.runtime.getURL(`assets/logos/${logoFile}`);
    }
  });
  networkSelectCustom == null ? void 0 : networkSelectCustom.addEventListener("click", (e) => {
    e.stopPropagation();
    networkDropdownMenu.classList.toggle("hidden");
  });
  document.querySelectorAll(".network-option").forEach((option) => {
    option.addEventListener("click", async (e) => {
      e.stopPropagation();
      const network = option.getAttribute("data-network");
      const networkText = option.querySelector("span").textContent;
      currentState.network = network;
      document.getElementById("network-selected-text").textContent = networkText;
      networkDropdownMenu.classList.add("hidden");
      saveNetwork();
      updateNetworkDisplays();
      await fetchBalance();
    });
    option.addEventListener("mouseenter", () => {
      option.querySelector("span").style.fontWeight = "bold";
    });
    option.addEventListener("mouseleave", () => {
      option.querySelector("span").style.fontWeight = "normal";
    });
  });
  document.addEventListener("click", () => {
    networkDropdownMenu == null ? void 0 : networkDropdownMenu.classList.add("hidden");
  });
  (_n = document.getElementById("wallet-select")) == null ? void 0 : _n.addEventListener("change", async (e) => {
    const selectedWalletId = e.target.value;
    if (selectedWalletId) {
      try {
        await setActiveWallet(selectedWalletId);
        const wallet2 = await getActiveWallet();
        currentState.address = wallet2.address;
        await updateDashboard();
      } catch (error) {
        alert("Error switching wallet: " + sanitizeError(error.message));
      }
    }
  });
  (_o = document.getElementById("btn-lock")) == null ? void 0 : _o.addEventListener("click", handleLock);
  (_p = document.getElementById("btn-refresh")) == null ? void 0 : _p.addEventListener("click", async () => {
    await updateDashboard();
  });
  (_q = document.getElementById("btn-settings")) == null ? void 0 : _q.addEventListener("click", () => {
    loadSettingsToUI();
    showScreen("screen-settings");
  });
  (_r = document.getElementById("btn-network-settings")) == null ? void 0 : _r.addEventListener("click", () => {
    loadNetworkSettingsToUI();
    showScreen("screen-network-settings");
  });
  (_s = document.getElementById("btn-back-from-network-settings")) == null ? void 0 : _s.addEventListener("click", () => {
    showScreen("screen-settings");
  });
  (_t = document.getElementById("btn-save-network-settings")) == null ? void 0 : _t.addEventListener("click", async () => {
    await saveNetworkSettings();
  });
  (_u = document.getElementById("btn-reset-network-settings")) == null ? void 0 : _u.addEventListener("click", () => {
    if (confirm("Reset all network settings to defaults?")) {
      resetNetworkSettingsToDefaults();
    }
  });
  (_v = document.getElementById("btn-copy-address")) == null ? void 0 : _v.addEventListener("click", handleCopyAddress);
  (_w = document.getElementById("btn-send")) == null ? void 0 : _w.addEventListener("click", showSendScreen);
  (_x = document.getElementById("btn-receive")) == null ? void 0 : _x.addEventListener("click", showReceiveScreen);
  (_y = document.getElementById("btn-tokens")) == null ? void 0 : _y.addEventListener("click", showTokensScreen);
  (_z = document.getElementById("btn-tx-history")) == null ? void 0 : _z.addEventListener("click", showTransactionHistory);
  (_A = document.getElementById("btn-back-from-send")) == null ? void 0 : _A.addEventListener("click", () => {
    showScreen("screen-dashboard");
    updateDashboard();
  });
  (_B = document.getElementById("btn-confirm-send")) == null ? void 0 : _B.addEventListener("click", handleSendTransaction);
  (_C = document.getElementById("btn-cancel-send")) == null ? void 0 : _C.addEventListener("click", () => showScreen("screen-dashboard"));
  (_D = document.getElementById("btn-send-max")) == null ? void 0 : _D.addEventListener("click", handleSendMax);
  (_E = document.getElementById("send-asset-select")) == null ? void 0 : _E.addEventListener("change", handleAssetChange);
  (_F = document.getElementById("btn-back-from-receive")) == null ? void 0 : _F.addEventListener("click", () => showScreen("screen-dashboard"));
  (_G = document.getElementById("btn-copy-receive-address")) == null ? void 0 : _G.addEventListener("click", handleCopyReceiveAddress);
  (_H = document.getElementById("btn-back-from-tokens")) == null ? void 0 : _H.addEventListener("click", () => showScreen("screen-dashboard"));
  (_I = document.getElementById("btn-add-custom-token")) == null ? void 0 : _I.addEventListener("click", showAddTokenModal);
  (_J = document.getElementById("btn-back-from-token-details")) == null ? void 0 : _J.addEventListener("click", async () => {
    showScreen("screen-tokens");
    await renderTokensScreen();
  });
  (_K = document.getElementById("token-details-copy-address")) == null ? void 0 : _K.addEventListener("click", handleCopyTokenDetailsAddress);
  (_L = document.getElementById("btn-token-send-max")) == null ? void 0 : _L.addEventListener("click", handleTokenSendMax);
  (_M = document.getElementById("btn-token-send")) == null ? void 0 : _M.addEventListener("click", handleTokenSend);
  (_N = document.getElementById("token-details-enable-toggle")) == null ? void 0 : _N.addEventListener("change", handleTokenEnableToggle);
  (_O = document.getElementById("pending-tx-indicator")) == null ? void 0 : _O.addEventListener("click", showTransactionHistory);
  (_P = document.getElementById("btn-back-from-tx-history")) == null ? void 0 : _P.addEventListener("click", () => showScreen("screen-dashboard"));
  (_Q = document.getElementById("filter-all-txs")) == null ? void 0 : _Q.addEventListener("click", () => renderTransactionHistory("all"));
  (_R = document.getElementById("filter-pending-txs")) == null ? void 0 : _R.addEventListener("click", () => renderTransactionHistory("pending"));
  (_S = document.getElementById("filter-confirmed-txs")) == null ? void 0 : _S.addEventListener("click", () => renderTransactionHistory("confirmed"));
  (_T = document.getElementById("btn-clear-tx-history")) == null ? void 0 : _T.addEventListener("click", handleClearTransactionHistory);
  (_U = document.getElementById("btn-back-from-tx-details")) == null ? void 0 : _U.addEventListener("click", () => showScreen("screen-tx-history"));
  (_V = document.getElementById("btn-copy-tx-hash")) == null ? void 0 : _V.addEventListener("click", async () => {
    const hash = document.getElementById("tx-detail-hash").textContent;
    try {
      await navigator.clipboard.writeText(hash);
      const btn = document.getElementById("btn-copy-tx-hash");
      const originalText = btn.textContent;
      btn.textContent = "COPIED!";
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2e3);
    } catch (error) {
      alert("Failed to copy hash");
    }
  });
  (_W = document.getElementById("btn-speed-up-tx")) == null ? void 0 : _W.addEventListener("click", handleSpeedUpTransaction);
  (_X = document.getElementById("btn-cancel-tx")) == null ? void 0 : _X.addEventListener("click", handleCancelTransaction);
  (_Y = document.getElementById("btn-close-add-token")) == null ? void 0 : _Y.addEventListener("click", () => {
    document.getElementById("modal-add-token").classList.add("hidden");
  });
  (_Z = document.getElementById("btn-cancel-add-token")) == null ? void 0 : _Z.addEventListener("click", () => {
    document.getElementById("modal-add-token").classList.add("hidden");
  });
  (__ = document.getElementById("btn-confirm-add-token")) == null ? void 0 : __.addEventListener("click", handleAddCustomToken);
  (_$ = document.getElementById("input-token-address")) == null ? void 0 : _$.addEventListener("input", handleTokenAddressInput);
  (_aa = document.getElementById("btn-back-from-settings")) == null ? void 0 : _aa.addEventListener("click", () => showScreen("screen-dashboard"));
  (_ba = document.getElementById("setting-theme")) == null ? void 0 : _ba.addEventListener("change", (e) => {
    currentState.settings.theme = e.target.value;
    applyTheme();
    saveSettings();
  });
  (_ca = document.getElementById("setting-decimals")) == null ? void 0 : _ca.addEventListener("change", (e) => {
    currentState.settings.decimalPlaces = parseInt(e.target.value);
    saveSettings();
    updateBalanceDisplay();
  });
  (_da = document.getElementById("setting-autolock")) == null ? void 0 : _da.addEventListener("change", (e) => {
    currentState.settings.autoLockMinutes = parseInt(e.target.value);
    saveSettings();
  });
  (_ea = document.getElementById("setting-max-gas-price")) == null ? void 0 : _ea.addEventListener("change", (e) => {
    currentState.settings.maxGasPriceGwei = parseInt(e.target.value);
    saveSettings();
  });
  (_fa = document.getElementById("setting-show-testnets")) == null ? void 0 : _fa.addEventListener("change", (e) => {
    currentState.settings.showTestNetworks = e.target.checked;
    saveSettings();
    updateNetworkSelector();
  });
  (_ga = document.getElementById("btn-view-seed")) == null ? void 0 : _ga.addEventListener("click", handleViewSeed);
  (_ha = document.getElementById("btn-export-key")) == null ? void 0 : _ha.addEventListener("click", handleExportKey);
  (_ia = document.getElementById("btn-password-prompt-confirm")) == null ? void 0 : _ia.addEventListener("click", () => {
    const password = document.getElementById("password-prompt-input").value;
    if (password) {
      closePasswordPrompt(password);
    }
  });
  (_ja = document.getElementById("btn-password-prompt-cancel")) == null ? void 0 : _ja.addEventListener("click", () => {
    closePasswordPrompt(null);
  });
  (_ka = document.getElementById("btn-close-password-prompt")) == null ? void 0 : _ka.addEventListener("click", () => {
    closePasswordPrompt(null);
  });
  (_la = document.getElementById("password-prompt-input")) == null ? void 0 : _la.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const password = document.getElementById("password-prompt-input").value;
      if (password) {
        closePasswordPrompt(password);
      }
    }
  });
  (_ma = document.getElementById("btn-close-display-secret")) == null ? void 0 : _ma.addEventListener("click", closeSecretModal);
  (_na = document.getElementById("btn-close-display-secret-btn")) == null ? void 0 : _na.addEventListener("click", closeSecretModal);
  (_oa = document.getElementById("btn-copy-secret")) == null ? void 0 : _oa.addEventListener("click", async () => {
    const secret = document.getElementById("display-secret-content").textContent;
    try {
      await navigator.clipboard.writeText(secret);
      const btn = document.getElementById("btn-copy-secret");
      const originalText = btn.textContent;
      btn.textContent = "COPIED!";
      btn.classList.add("text-success");
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove("text-success");
      }, 2e3);
    } catch (error) {
      alert("Failed to copy to clipboard");
    }
  });
  (_pa = document.getElementById("btn-manage-wallets")) == null ? void 0 : _pa.addEventListener("click", handleManageWallets);
  (_qa = document.getElementById("btn-back-from-manage-wallets")) == null ? void 0 : _qa.addEventListener("click", () => showScreen("screen-settings"));
  (_ra = document.getElementById("btn-create-new-wallet-multi")) == null ? void 0 : _ra.addEventListener("click", showAddWalletModal);
  (_sa = document.getElementById("btn-import-wallet-multi")) == null ? void 0 : _sa.addEventListener("click", showAddWalletModal);
  (_ta = document.getElementById("add-wallet-option-create")) == null ? void 0 : _ta.addEventListener("click", () => {
    document.getElementById("modal-add-wallet").classList.add("hidden");
    generateNewMnemonicMulti();
    document.getElementById("modal-create-wallet-multi").classList.remove("hidden");
  });
  (_ua = document.getElementById("add-wallet-option-mnemonic")) == null ? void 0 : _ua.addEventListener("click", () => {
    document.getElementById("modal-add-wallet").classList.add("hidden");
    document.getElementById("modal-import-seed-multi").classList.remove("hidden");
  });
  (_va = document.getElementById("add-wallet-option-privatekey")) == null ? void 0 : _va.addEventListener("click", () => {
    document.getElementById("modal-add-wallet").classList.add("hidden");
    document.getElementById("modal-import-key-multi").classList.remove("hidden");
  });
  (_wa = document.getElementById("btn-close-add-wallet")) == null ? void 0 : _wa.addEventListener("click", () => {
    document.getElementById("modal-add-wallet").classList.add("hidden");
  });
  (_xa = document.getElementById("btn-confirm-create-wallet-multi")) == null ? void 0 : _xa.addEventListener("click", handleCreateNewWalletMulti);
  (_ya = document.getElementById("btn-cancel-create-wallet-multi")) == null ? void 0 : _ya.addEventListener("click", () => {
    document.getElementById("modal-create-wallet-multi").classList.add("hidden");
    document.getElementById("input-new-wallet-nickname").value = "";
    document.getElementById("verify-word-1-multi").value = "";
    document.getElementById("verify-word-2-multi").value = "";
    document.getElementById("verify-word-3-multi").value = "";
    document.getElementById("verification-error-multi").classList.add("hidden");
  });
  (_za = document.getElementById("btn-close-create-wallet-multi")) == null ? void 0 : _za.addEventListener("click", () => {
    document.getElementById("modal-create-wallet-multi").classList.add("hidden");
    document.getElementById("input-new-wallet-nickname").value = "";
    document.getElementById("verify-word-1-multi").value = "";
    document.getElementById("verify-word-2-multi").value = "";
    document.getElementById("verify-word-3-multi").value = "";
    document.getElementById("verification-error-multi").classList.add("hidden");
  });
  (_Aa = document.getElementById("btn-confirm-import-seed-multi")) == null ? void 0 : _Aa.addEventListener("click", handleImportSeedMulti);
  (_Ba = document.getElementById("btn-cancel-import-seed-multi")) == null ? void 0 : _Ba.addEventListener("click", () => {
    document.getElementById("modal-import-seed-multi").classList.add("hidden");
    document.getElementById("input-import-seed-nickname").value = "";
    document.getElementById("input-import-seed-phrase").value = "";
  });
  (_Ca = document.getElementById("btn-close-import-seed-multi")) == null ? void 0 : _Ca.addEventListener("click", () => {
    document.getElementById("modal-import-seed-multi").classList.add("hidden");
    document.getElementById("input-import-seed-nickname").value = "";
    document.getElementById("input-import-seed-phrase").value = "";
  });
  (_Da = document.getElementById("btn-confirm-import-key-multi")) == null ? void 0 : _Da.addEventListener("click", handleImportKeyMulti);
  (_Ea = document.getElementById("btn-cancel-import-key-multi")) == null ? void 0 : _Ea.addEventListener("click", () => {
    document.getElementById("modal-import-key-multi").classList.add("hidden");
    document.getElementById("input-import-key-nickname").value = "";
    document.getElementById("input-import-private-key").value = "";
  });
  (_Fa = document.getElementById("btn-close-import-key-multi")) == null ? void 0 : _Fa.addEventListener("click", () => {
    document.getElementById("modal-import-key-multi").classList.add("hidden");
    document.getElementById("input-import-key-nickname").value = "";
    document.getElementById("input-import-private-key").value = "";
  });
  (_Ga = document.getElementById("btn-confirm-rename-wallet")) == null ? void 0 : _Ga.addEventListener("click", handleRenameWalletConfirm);
  (_Ha = document.getElementById("btn-cancel-rename-wallet")) == null ? void 0 : _Ha.addEventListener("click", () => {
    document.getElementById("modal-rename-wallet").classList.add("hidden");
    currentRenameWalletId = null;
  });
  (_Ia = document.getElementById("btn-close-rename-wallet")) == null ? void 0 : _Ia.addEventListener("click", () => {
    document.getElementById("modal-rename-wallet").classList.add("hidden");
    currentRenameWalletId = null;
  });
  (_Ja = document.getElementById("btn-close-tx-success")) == null ? void 0 : _Ja.addEventListener("click", () => {
    document.getElementById("modal-tx-success").classList.add("hidden");
  });
  (_Ka = document.getElementById("btn-ok-tx-success")) == null ? void 0 : _Ka.addEventListener("click", () => {
    document.getElementById("modal-tx-success").classList.add("hidden");
  });
  (_La = document.getElementById("btn-copy-tx-hash")) == null ? void 0 : _La.addEventListener("click", async () => {
    try {
      const txHash = document.getElementById("tx-success-hash").textContent;
      await navigator.clipboard.writeText(txHash);
      const btn = document.getElementById("btn-copy-tx-hash");
      const originalText = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2e3);
    } catch (error) {
      alert("Failed to copy transaction hash");
    }
  });
  (_Ma = document.getElementById("btn-tx-status-explorer")) == null ? void 0 : _Ma.addEventListener("click", () => {
    if (!txStatusCurrentHash) return;
    const url = getExplorerUrl(currentState.network, "tx", txStatusCurrentHash);
    chrome.tabs.create({ url });
  });
  (_Na = document.getElementById("btn-close-tx-status")) == null ? void 0 : _Na.addEventListener("click", () => {
    console.log("🫀 Close button clicked");
    if (txStatusPollInterval) {
      clearInterval(txStatusPollInterval);
      txStatusPollInterval = null;
    }
    window.close();
  });
  (_Oa = document.getElementById("btn-tx-status-speed-up")) == null ? void 0 : _Oa.addEventListener("click", async () => {
    if (!txStatusCurrentHash || !txStatusCurrentAddress) return;
    const password = await showPasswordPrompt("Speed Up Transaction", "Enter your password to speed up this transaction with higher gas price (1.2x)");
    if (!password) return;
    try {
      const activeWallet = await getActiveWallet();
      const sessionResponse = await chrome.runtime.sendMessage({
        type: "CREATE_SESSION",
        password,
        walletId: activeWallet.id,
        durationMs: 6e4
      });
      if (!sessionResponse.success) {
        alert("Invalid password");
        return;
      }
      const response = await chrome.runtime.sendMessage({
        type: "SPEED_UP_TX",
        address: txStatusCurrentAddress,
        txHash: txStatusCurrentHash,
        sessionToken: sessionResponse.sessionToken,
        gasPriceMultiplier: 1.2
      });
      if (response.success) {
        alert(`Transaction sped up!
New TX: ${response.txHash.slice(0, 20)}...

The window will now close.`);
        if (txStatusPollInterval) {
          clearInterval(txStatusPollInterval);
        }
        window.close();
      } else {
        alert("Error speeding up transaction: " + sanitizeError(response.error));
      }
    } catch (error) {
      alert("Error: " + sanitizeError(error.message));
    }
  });
  (_Pa = document.getElementById("btn-tx-status-cancel")) == null ? void 0 : _Pa.addEventListener("click", async () => {
    if (!txStatusCurrentHash || !txStatusCurrentAddress) return;
    const password = await showPasswordPrompt("Cancel Transaction", "Enter your password to cancel this transaction by sending a 0-value replacement");
    if (!password) return;
    try {
      const activeWallet = await getActiveWallet();
      const sessionResponse = await chrome.runtime.sendMessage({
        type: "CREATE_SESSION",
        password,
        walletId: activeWallet.id,
        durationMs: 6e4
      });
      if (!sessionResponse.success) {
        alert("Invalid password");
        return;
      }
      const response = await chrome.runtime.sendMessage({
        type: "CANCEL_TX",
        address: txStatusCurrentAddress,
        txHash: txStatusCurrentHash,
        sessionToken: sessionResponse.sessionToken
      });
      if (response.success) {
        alert(`Transaction cancelled!
Cancellation TX: ${response.txHash.slice(0, 20)}...

The window will now close.`);
        if (txStatusPollInterval) {
          clearInterval(txStatusPollInterval);
        }
        window.close();
      } else {
        alert("Error cancelling transaction: " + sanitizeError(response.error));
      }
    } catch (error) {
      alert("Error: " + sanitizeError(error.message));
    }
  });
  document.addEventListener("click", resetActivityTimer);
  document.addEventListener("keypress", resetActivityTimer);
  document.addEventListener("scroll", resetActivityTimer);
}
let generatedMnemonic = "";
let verificationWords = [];
async function generateNewMnemonic() {
  try {
    const { ethers } = await __vitePreload(async () => {
      const { ethers: ethers2 } = await import("./index.js");
      return { ethers: ethers2 };
    }, true ? __vite__mapDeps([0,1]) : void 0);
    const randomWallet = ethers.Wallet.createRandom();
    generatedMnemonic = randomWallet.mnemonic.phrase;
    document.getElementById("mnemonic-display").textContent = generatedMnemonic;
    const words = generatedMnemonic.split(" ");
    const randomBytes = new Uint8Array(3);
    crypto.getRandomValues(randomBytes);
    const indices = [
      randomBytes[0] % 4,
      // Word 1-4
      4 + randomBytes[1] % 4,
      // Word 5-8
      8 + randomBytes[2] % 4
      // Word 9-12
    ];
    verificationWords = indices.map((i) => ({ index: i, word: words[i] }));
    document.getElementById("verify-word-1-num").textContent = verificationWords[0].index + 1;
    document.getElementById("verify-word-2-num").textContent = verificationWords[1].index + 1;
    document.getElementById("verify-word-3-num").textContent = verificationWords[2].index + 1;
    document.getElementById("verify-word-1").value = "";
    document.getElementById("verify-word-2").value = "";
    document.getElementById("verify-word-3").value = "";
    document.getElementById("verification-error").classList.add("hidden");
  } catch (error) {
    console.error("Error generating mnemonic:", error);
    document.getElementById("mnemonic-display").textContent = "Error generating mnemonic. Please try again.";
  }
}
async function handleCreateWallet() {
  const password = document.getElementById("password-create").value;
  const passwordConfirm = document.getElementById("password-confirm").value;
  const errorDiv = document.getElementById("create-error");
  const verificationErrorDiv = document.getElementById("verification-error");
  if (password !== passwordConfirm) {
    errorDiv.textContent = "Passwords do not match";
    errorDiv.classList.remove("hidden");
    return;
  }
  if (!generatedMnemonic) {
    errorDiv.textContent = "No mnemonic generated. Please go back and try again.";
    errorDiv.classList.remove("hidden");
    return;
  }
  const word1 = document.getElementById("verify-word-1").value.trim().toLowerCase();
  const word2 = document.getElementById("verify-word-2").value.trim().toLowerCase();
  const word3 = document.getElementById("verify-word-3").value.trim().toLowerCase();
  if (!word1 || !word2 || !word3) {
    verificationErrorDiv.textContent = "Please enter all verification words to confirm you have backed up your seed phrase.";
    verificationErrorDiv.classList.remove("hidden");
    return;
  }
  if (word1 !== verificationWords[0].word.toLowerCase() || word2 !== verificationWords[1].word.toLowerCase() || word3 !== verificationWords[2].word.toLowerCase()) {
    verificationErrorDiv.textContent = "Verification words do not match. Please double-check your seed phrase backup.";
    verificationErrorDiv.classList.remove("hidden");
    return;
  }
  try {
    errorDiv.classList.add("hidden");
    verificationErrorDiv.classList.add("hidden");
    const { address } = await importFromMnemonic(generatedMnemonic, password);
    alert("Wallet created successfully!");
    currentState.address = address;
    currentState.isUnlocked = true;
    currentState.lastActivityTime = Date.now();
    startAutoLockTimer();
    generatedMnemonic = "";
    verificationWords = [];
    showScreen("screen-dashboard");
    updateDashboard();
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.remove("hidden");
  }
}
async function handleImportWallet() {
  const method = document.getElementById("import-method").value;
  const password = document.getElementById("password-import").value;
  const passwordConfirm = document.getElementById("password-import-confirm").value;
  const errorDiv = document.getElementById("import-error");
  if (password !== passwordConfirm) {
    errorDiv.textContent = "Passwords do not match";
    errorDiv.classList.remove("hidden");
    return;
  }
  try {
    errorDiv.classList.add("hidden");
    let address;
    if (method === "mnemonic") {
      const mnemonic = document.getElementById("import-mnemonic").value;
      const result = await importFromMnemonic(mnemonic, password);
      address = result.address;
    } else {
      const privateKey = document.getElementById("import-privatekey").value;
      const result = await importFromPrivateKey(privateKey, password);
      address = result.address;
    }
    alert("Wallet imported successfully!");
    currentState.address = address;
    currentState.isUnlocked = true;
    showScreen("screen-dashboard");
    updateDashboard();
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.remove("hidden");
  }
}
async function handleUnlock() {
  const password = document.getElementById("password-unlock").value;
  const errorDiv = document.getElementById("unlock-error");
  const lockoutInfo = await checkRateLimitLockout();
  if (lockoutInfo.isLockedOut) {
    const remainingMinutes = Math.ceil(lockoutInfo.remainingMs / 1e3 / 60);
    errorDiv.textContent = `Too many failed attempts. Please wait ${remainingMinutes} minute(s) before trying again.`;
    errorDiv.classList.remove("hidden");
    return;
  }
  try {
    errorDiv.classList.add("hidden");
    const { address, signer } = await unlockWallet(password);
    await clearFailedAttempts();
    const activeWallet = await getActiveWallet();
    const durationMs = currentState.settings.autoLockMinutes * 60 * 1e3;
    const sessionResponse = await chrome.runtime.sendMessage({
      type: "CREATE_SESSION",
      password,
      walletId: activeWallet.id,
      durationMs
    });
    if (!sessionResponse.success) {
      throw new Error("Failed to create session");
    }
    currentState.isUnlocked = true;
    currentState.address = address;
    currentState.sessionToken = sessionResponse.sessionToken;
    currentState.lastActivityTime = Date.now();
    startAutoLockTimer();
    showScreen("screen-dashboard");
    updateDashboard();
  } catch (error) {
    await recordFailedAttempt();
    const newLockoutInfo = await checkRateLimitLockout();
    if (newLockoutInfo.isLockedOut) {
      const remainingMinutes = Math.ceil(newLockoutInfo.remainingMs / 1e3 / 60);
      errorDiv.textContent = `Too many failed attempts (${MAX_ATTEMPTS}). Wallet locked for ${remainingMinutes} minutes.`;
    } else {
      const attemptsLeft = MAX_ATTEMPTS - newLockoutInfo.attempts;
      errorDiv.textContent = `${error.message} (${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining)`;
    }
    errorDiv.classList.remove("hidden");
  }
}
async function handleLock() {
  if (currentState.sessionToken) {
    await chrome.runtime.sendMessage({
      type: "INVALIDATE_SESSION",
      sessionToken: currentState.sessionToken
    });
  }
  currentState.isUnlocked = false;
  currentState.address = null;
  currentState.sessionToken = null;
  currentState.lastActivityTime = null;
  stopAutoLockTimer();
  showScreen("screen-unlock");
}
function startAutoLockTimer() {
  stopAutoLockTimer();
  const checkInterval = 1e4;
  autoLockTimer = setInterval(() => {
    if (!currentState.isUnlocked || !currentState.lastActivityTime) {
      stopAutoLockTimer();
      return;
    }
    const idleTime = Date.now() - currentState.lastActivityTime;
    const autoLockMs = currentState.settings.autoLockMinutes * 60 * 1e3;
    if (idleTime >= autoLockMs) {
      handleLock();
    }
  }, checkInterval);
}
function stopAutoLockTimer() {
  if (autoLockTimer) {
    clearInterval(autoLockTimer);
    autoLockTimer = null;
  }
}
function resetActivityTimer() {
  if (currentState.isUnlocked) {
    currentState.lastActivityTime = Date.now();
  }
}
async function recordFailedAttempt() {
  const data = await load(RATE_LIMIT_KEY) || { attempts: 0, firstAttemptTime: Date.now() };
  const timeSinceFirst = Date.now() - data.firstAttemptTime;
  if (data.attempts === 0 || timeSinceFirst > LOCKOUT_DURATION_MS) {
    data.attempts = 1;
    data.firstAttemptTime = Date.now();
  } else {
    data.attempts += 1;
  }
  await save(RATE_LIMIT_KEY, data);
}
async function checkRateLimitLockout() {
  const data = await load(RATE_LIMIT_KEY);
  if (!data || data.attempts === 0) {
    return { isLockedOut: false, attempts: 0, remainingMs: 0 };
  }
  const timeSinceFirst = Date.now() - data.firstAttemptTime;
  if (timeSinceFirst > LOCKOUT_DURATION_MS) {
    await clearFailedAttempts();
    return { isLockedOut: false, attempts: 0, remainingMs: 0 };
  }
  if (data.attempts >= MAX_ATTEMPTS) {
    const remainingMs = LOCKOUT_DURATION_MS - timeSinceFirst;
    return { isLockedOut: true, attempts: data.attempts, remainingMs };
  }
  return { isLockedOut: false, attempts: data.attempts, remainingMs: 0 };
}
async function clearFailedAttempts() {
  await save(RATE_LIMIT_KEY, { attempts: 0, firstAttemptTime: 0 });
}
async function updateDashboard() {
  const addressEl = document.getElementById("wallet-address");
  if (addressEl && currentState.address) {
    addressEl.textContent = shortenAddress(currentState.address);
  }
  await fetchBalance();
  fetchAndUpdatePrices();
  updateNetworkSelector();
  updateNetworkDisplays();
  await updateWalletSelector();
  await updatePendingTxIndicator();
}
async function updateWalletSelector() {
  const walletSelect = document.getElementById("wallet-select");
  if (!walletSelect) return;
  const walletsData = await getAllWallets();
  if (walletsData.walletList.length === 0) {
    walletSelect.innerHTML = '<option value="">No wallets</option>';
    return;
  }
  walletSelect.innerHTML = "";
  walletsData.walletList.forEach((wallet2) => {
    const option = document.createElement("option");
    option.value = wallet2.id;
    option.textContent = wallet2.nickname || "Unnamed Wallet";
    if (wallet2.id === walletsData.activeWalletId) {
      option.selected = true;
    }
    walletSelect.appendChild(option);
  });
}
function updateNetworkDisplays() {
  const networkName = NETWORK_NAMES[currentState.network] || "Unknown Network";
  const setupSelect = document.getElementById("network-select-setup");
  if (setupSelect) {
    setupSelect.value = currentState.network;
  }
  const createDisplay = document.getElementById("network-display-create");
  if (createDisplay) {
    createDisplay.textContent = networkName;
  }
  const importDisplay = document.getElementById("network-display-import");
  if (importDisplay) {
    importDisplay.textContent = networkName;
  }
  const networkSelectedText = document.getElementById("network-selected-text");
  if (networkSelectedText) {
    networkSelectedText.textContent = networkName;
  }
  const selectorLogoEl = document.getElementById("network-selector-logo");
  if (selectorLogoEl) {
    const networkLogos = {
      "pulsechainTestnet": "pls.png",
      "pulsechain": "pls.png",
      "ethereum": "eth.png",
      "sepolia": "eth.png"
    };
    const logoFile = networkLogos[currentState.network];
    if (logoFile) {
      selectorLogoEl.src = chrome.runtime.getURL(`assets/logos/${logoFile}`);
      selectorLogoEl.style.display = "block";
    } else {
      selectorLogoEl.style.display = "none";
    }
  }
}
async function fetchBalance() {
  if (!currentState.address) {
    currentState.balance = "0";
    updateBalanceDisplay();
    return;
  }
  try {
    const balanceWei = await getBalance(currentState.network, currentState.address);
    currentState.balance = formatBalance(balanceWei, currentState.settings.decimalPlaces);
    updateBalanceDisplay();
  } catch (error) {
    console.error("Error fetching balance:", error);
    updateBalanceDisplay();
  }
}
function formatBalanceWithCommas(balanceString, fullDecimals = 18) {
  const balance = parseFloat(balanceString);
  if (isNaN(balance)) {
    return { display: balanceString, tooltip: balanceString };
  }
  const parts = balanceString.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const displayValue = parts.join(".");
  const fullPrecision = balance.toFixed(fullDecimals);
  const fullParts = fullPrecision.split(".");
  fullParts[0] = fullParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fullValue = fullParts.join(".");
  return {
    display: displayValue,
    tooltip: `Full precision: ${fullValue}`
  };
}
function updateBalanceDisplay() {
  const balanceEl = document.getElementById("balance-amount");
  if (balanceEl) {
    const decimals = currentState.settings.decimalPlaces;
    const balance = parseFloat(currentState.balance);
    const formatted = balance.toFixed(decimals);
    const parts = formatted.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const displayValue = parts.join(".");
    balanceEl.textContent = displayValue;
    const fullPrecision = balance.toFixed(18);
    const fullParts = fullPrecision.split(".");
    fullParts[0] = fullParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const fullValue = fullParts.join(".");
    balanceEl.title = `Full precision: ${fullValue}`;
  }
  const symbolEl = document.getElementById("balance-symbol");
  if (symbolEl) {
    const symbols = {
      "pulsechainTestnet": "tPLS",
      "pulsechain": "PLS",
      "ethereum": "ETH",
      "sepolia": "SEP"
    };
    symbolEl.textContent = symbols[currentState.network] || "TOKEN";
  }
  const usdEl = document.getElementById("balance-usd");
  if (usdEl && currentState.tokenPrices) {
    const tokenSymbol = currentState.network === "pulsechainTestnet" ? "PLS" : currentState.network === "pulsechain" ? "PLS" : currentState.network === "ethereum" ? "ETH" : "PLS";
    const balanceWei = parseEther(currentState.balance.toString()).toString();
    const usdValue = getTokenValueUSD(tokenSymbol, balanceWei, 18, currentState.tokenPrices);
    if (usdValue !== null) {
      usdEl.textContent = formatUSD(usdValue);
      usdEl.style.color = "var(--terminal-fg-dim)";
    } else {
      usdEl.textContent = "—";
      usdEl.style.color = "var(--terminal-fg-dim)";
    }
  } else if (usdEl) {
    usdEl.textContent = "—";
  }
  const logoEl = document.getElementById("network-logo");
  if (logoEl) {
    const networkLogos = {
      "pulsechainTestnet": "pls.png",
      "pulsechain": "pls.png",
      "ethereum": "eth.png",
      "sepolia": "eth.png"
    };
    const logoFile = networkLogos[currentState.network];
    if (logoFile) {
      logoEl.src = chrome.runtime.getURL(`assets/logos/${logoFile}`);
      logoEl.style.display = "block";
    } else {
      logoEl.style.display = "none";
    }
  }
}
async function fetchAndUpdatePrices() {
  if (currentState.network !== "pulsechain" && currentState.network !== "pulsechainTestnet") {
    console.log("🫀 Price fetching not supported for", currentState.network);
    return;
  }
  const loadingEl = document.getElementById("price-loading");
  const usdEl = document.getElementById("balance-usd");
  if (loadingEl && usdEl) {
    usdEl.classList.add("hidden");
    loadingEl.classList.remove("hidden");
  }
  try {
    const provider = await getProvider(currentState.network);
    const prices = await fetchTokenPrices(provider, currentState.network === "pulsechainTestnet" ? "pulsechain" : currentState.network);
    if (prices) {
      currentState.tokenPrices = prices;
      updateBalanceDisplay();
    }
  } catch (error) {
    console.error("Error fetching token prices:", error);
  } finally {
    if (loadingEl && usdEl) {
      loadingEl.classList.add("hidden");
      usdEl.classList.remove("hidden");
    }
  }
}
function updateNetworkSelector() {
  const options = document.querySelectorAll(".network-option");
  options.forEach((option) => {
    const network = option.getAttribute("data-network");
    const isTestnet = network.includes("Testnet") || network === "sepolia";
    if (isTestnet && !currentState.settings.showTestNetworks) {
      option.style.display = "none";
    } else {
      option.style.display = "flex";
    }
  });
}
async function showSendScreen() {
  document.getElementById("send-from-address").textContent = currentState.address || "0x0000...0000";
  const assetSelect = document.getElementById("send-asset-select");
  const symbols = {
    "pulsechainTestnet": "tPLS",
    "pulsechain": "PLS",
    "ethereum": "ETH",
    "sepolia": "SEP"
  };
  let options = `<option value="native">Native (${symbols[currentState.network] || "TOKEN"})</option>`;
  const allTokens = await getAllTokens(currentState.network);
  for (const token of allTokens) {
    options += `<option value="${escapeHtml(token.address)}">${escapeHtml(token.symbol)}</option>`;
  }
  assetSelect.innerHTML = options;
  const balanceEl = document.getElementById("send-available-balance");
  const formatted = formatBalanceWithCommas(currentState.balance, 18);
  balanceEl.textContent = formatted.display;
  balanceEl.title = formatted.tooltip;
  document.getElementById("send-balance-symbol").textContent = symbols[currentState.network] || "TOKEN";
  document.getElementById("send-to-address").value = "";
  document.getElementById("send-amount").value = "";
  document.getElementById("send-password").value = "";
  document.getElementById("send-error").classList.add("hidden");
  showScreen("screen-send");
}
async function handleAssetChange() {
  const assetSelect = document.getElementById("send-asset-select");
  const selectedValue = assetSelect.value;
  const symbols = {
    "pulsechainTestnet": "tPLS",
    "pulsechain": "PLS",
    "ethereum": "ETH",
    "sepolia": "SEP"
  };
  const balanceEl = document.getElementById("send-available-balance");
  if (selectedValue === "native") {
    const formatted = formatBalanceWithCommas(currentState.balance, 18);
    balanceEl.textContent = formatted.display;
    balanceEl.title = formatted.tooltip;
    document.getElementById("send-balance-symbol").textContent = symbols[currentState.network] || "TOKEN";
  } else {
    try {
      const allTokens = await getAllTokens(currentState.network);
      const token = allTokens.find((t) => t.address === selectedValue);
      if (token) {
        const balanceWei = await getTokenBalance(currentState.network, token.address, currentState.address);
        const rawBalance = formatTokenBalance(balanceWei, token.decimals, 4);
        const formatted = formatBalanceWithCommas(rawBalance, token.decimals);
        balanceEl.textContent = formatted.display;
        balanceEl.title = formatted.tooltip;
        document.getElementById("send-balance-symbol").textContent = token.symbol;
      }
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  }
}
function handleSendMax() {
  const balance = parseFloat(currentState.balance);
  if (balance > 0) {
    const maxSend = Math.max(0, balance - 1e-3);
    document.getElementById("send-amount").value = maxSend.toString();
  }
}
async function handleSendTransaction() {
  const toAddress = document.getElementById("send-to-address").value.trim();
  const amount = document.getElementById("send-amount").value.trim();
  const password = document.getElementById("send-password").value;
  const assetSelect = document.getElementById("send-asset-select");
  const selectedAsset = assetSelect.value;
  const errorEl = document.getElementById("send-error");
  const symbols = {
    "pulsechainTestnet": "tPLS",
    "pulsechain": "PLS",
    "ethereum": "ETH",
    "sepolia": "SEP"
  };
  if (!toAddress || !amount || !password) {
    errorEl.textContent = "Please fill in all fields";
    errorEl.classList.remove("hidden");
    return;
  }
  if (!toAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    errorEl.textContent = "Invalid recipient address";
    errorEl.classList.remove("hidden");
    return;
  }
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    errorEl.textContent = "Invalid amount";
    errorEl.classList.remove("hidden");
    return;
  }
  try {
    errorEl.classList.add("hidden");
    const { signer } = await unlockWallet(password);
    const provider = await getProvider(currentState.network);
    const connectedSigner = signer.connect(provider);
    let txResponse, symbol;
    if (selectedAsset === "native") {
      const tx = {
        to: toAddress,
        value: parseEther(amount)
      };
      txResponse = await connectedSigner.sendTransaction(tx);
      symbol = symbols[currentState.network] || "tokens";
    } else {
      const allTokens = await getAllTokens(currentState.network);
      const token = allTokens.find((t) => t.address === selectedAsset);
      if (!token) {
        throw new Error("Token not found");
      }
      const amountWei = parseTokenAmount(amount, token.decimals);
      txResponse = await transferToken(connectedSigner, token.address, toAddress, amountWei);
      symbol = token.symbol;
    }
    showTransactionSuccessModal(txResponse.hash);
    if (chrome.notifications) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL("assets/icons/icon-128.png"),
        title: "Transaction Sent",
        message: `Sent ${amount} ${symbol} to ${toAddress.slice(0, 10)}...`,
        priority: 2
      });
    }
    showScreen("screen-dashboard");
    waitForTransactionConfirmation(txResponse.hash, amount, symbol);
  } catch (error) {
    console.error("Send transaction error:", error);
    errorEl.textContent = error.message.includes("incorrect password") ? "Incorrect password" : "Transaction failed: " + error.message;
    errorEl.classList.remove("hidden");
  }
}
function showTransactionSuccessModal(txHash) {
  document.getElementById("tx-success-hash").textContent = txHash;
  document.getElementById("modal-tx-success").classList.remove("hidden");
}
async function waitForTransactionConfirmation(txHash, amount, symbol) {
  try {
    const provider = await getProvider(currentState.network);
    const receipt = await provider.waitForTransaction(txHash, 1);
    if (receipt && receipt.status === 1) {
      if (chrome.notifications) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: chrome.runtime.getURL("assets/icons/icon-128.png"),
          title: "Transaction Confirmed",
          message: `${amount} ${symbol} transfer confirmed on-chain!`,
          priority: 2
        });
      }
      await fetchBalance();
    } else {
      if (chrome.notifications) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: chrome.runtime.getURL("assets/icons/icon-128.png"),
          title: "Transaction Failed",
          message: "Transaction was reverted or failed on-chain",
          priority: 2
        });
      }
    }
  } catch (error) {
    console.error("Error waiting for confirmation:", error);
  }
}
async function showReceiveScreen() {
  const address = currentState.address;
  document.getElementById("receive-address").textContent = address;
  const networkNames = {
    "pulsechainTestnet": "PulseChain Testnet V4",
    "pulsechain": "PulseChain Mainnet",
    "ethereum": "Ethereum Mainnet",
    "sepolia": "Sepolia Testnet"
  };
  const symbols = {
    "pulsechainTestnet": "tPLS",
    "pulsechain": "PLS",
    "ethereum": "ETH",
    "sepolia": "SEP"
  };
  document.getElementById("receive-network-name").textContent = networkNames[currentState.network] || "Unknown Network";
  document.getElementById("receive-network-symbol").textContent = symbols[currentState.network] || "TOKEN";
  try {
    const canvas2 = document.getElementById("receive-qr-canvas");
    await browser.toCanvas(canvas2, address, {
      width: 200,
      margin: 2,
      color: {
        dark: getComputedStyle(document.body).getPropertyValue("--terminal-fg").trim(),
        light: getComputedStyle(document.body).getPropertyValue("--terminal-bg").trim()
      }
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
  }
  showScreen("screen-receive");
}
async function handleCopyReceiveAddress() {
  try {
    await navigator.clipboard.writeText(currentState.address);
    const btn = document.getElementById("btn-copy-receive-address");
    const originalText = btn.textContent;
    btn.textContent = "COPIED!";
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2e3);
  } catch (error) {
    alert("Failed to copy address");
  }
}
async function showTokensScreen() {
  showScreen("screen-tokens");
  await new Promise((resolve) => setTimeout(resolve, 10));
  await renderTokensScreen();
}
async function renderTokensScreen() {
  const network = currentState.network;
  const loadingEl = document.getElementById("tokens-loading");
  const defaultPanel = document.getElementById("default-tokens-panel");
  const customPanel = document.getElementById("custom-tokens-panel");
  if (loadingEl) loadingEl.classList.remove("hidden");
  if (defaultPanel) defaultPanel.classList.add("hidden");
  if (customPanel) customPanel.classList.add("hidden");
  try {
    await renderDefaultTokens(network);
    await renderCustomTokens(network);
  } finally {
    if (loadingEl) loadingEl.classList.add("hidden");
    if (defaultPanel) defaultPanel.classList.remove("hidden");
    if (customPanel) customPanel.classList.remove("hidden");
  }
}
async function renderDefaultTokens(network) {
  const defaultTokensEl = document.getElementById("default-tokens-list");
  const networkDefaults = DEFAULT_TOKENS[network] || {};
  const enabledDefaults = await getEnabledDefaultTokens(network);
  if (Object.keys(networkDefaults).length === 0) {
    defaultTokensEl.innerHTML = '<p class="text-center text-dim" style="font-size: 11px; padding: 16px;">No default tokens for this network</p>';
    return;
  }
  let html = "";
  for (const symbol in networkDefaults) {
    const token = networkDefaults[symbol];
    const isEnabled = enabledDefaults.includes(symbol);
    let balanceText = "-";
    let balanceTooltip = "";
    let usdValue = null;
    if (isEnabled && currentState.address) {
      try {
        const balanceWei = await getTokenBalance(network, token.address, currentState.address);
        const rawBalance = formatTokenBalance(balanceWei, token.decimals, 4);
        const formatted = formatBalanceWithCommas(rawBalance, token.decimals);
        balanceText = formatted.display;
        balanceTooltip = formatted.tooltip;
        if (currentState.tokenPrices) {
          usdValue = getTokenValueUSD(symbol, balanceWei, token.decimals, currentState.tokenPrices);
        }
      } catch (error) {
        balanceText = "Error";
      }
    }
    const logoUrl = token.logo ? chrome.runtime.getURL(`assets/logos/${token.logo}`) : "";
    html += `
      <div class="token-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 8px; border-bottom: 1px solid var(--terminal-border);">
        ${token.logo ? token.homeUrl ? `<img src="${logoUrl}" alt="${escapeHtml(token.symbol)}" style="width: 32px; height: 32px; margin-right: 12px; border-radius: 50%; cursor: pointer;" class="token-logo-link" data-url="${token.homeUrl}" title="Visit ${escapeHtml(token.name)} homepage" />` : `<img src="${logoUrl}" alt="${escapeHtml(token.symbol)}" style="width: 32px; height: 32px; margin-right: 12px; border-radius: 50%;" />` : '<div style="width: 32px; height: 32px; margin-right: 12px; background: var(--terminal-border); border-radius: 50%;"></div>'}
        <div style="flex: 1;">
          <p style="font-size: 15px; font-weight: bold;">${escapeHtml(token.symbol)}</p>
          <p class="text-dim ${token.dexScreenerUrl ? "token-name-link" : ""}" style="font-size: 13px; ${token.dexScreenerUrl ? "cursor: pointer; text-decoration: underline;" : ""}" ${token.dexScreenerUrl ? `data-url="${token.dexScreenerUrl}" title="View ${escapeHtml(token.name)} on DexScreener"` : ""}>${escapeHtml(token.name)}</p>
          <p class="text-dim" style="font-size: 11px; font-family: var(--font-mono); display: flex; align-items: center; gap: 4px;">
            <span style="max-width: 80px; overflow: hidden; text-overflow: ellipsis;">${token.address}</span>
            <button class="copy-address-btn" data-address="${token.address}" style="background: none; border: none; color: var(--terminal-accent); cursor: pointer; font-size: 11px; padding: 2px 4px;" title="Copy contract address">📋</button>
          </p>
          ${isEnabled ? `
            <p class="text-dim" style="font-size: 13px; cursor: help;" title="${balanceTooltip}">Balance: ${balanceText}</p>
            ${usdValue !== null ? `<p class="text-dim" style="font-size: 12px; margin-top: 2px;">${formatUSD(usdValue)}</p>` : ""}
          ` : ""}
        </div>
        <div style="display: flex; align-items: center; margin-left: 8px;">
          <button class="view-token-details-btn" data-token-symbol="${symbol}" data-is-default="true" style="background: var(--terminal-accent); border: none; color: #000; cursor: pointer; font-size: 18px; padding: 4px 8px; border-radius: 4px;" title="View token details">ℹ️</button>
        </div>
      </div>
    `;
  }
  defaultTokensEl.innerHTML = html;
  defaultTokensEl.querySelectorAll(".view-token-details-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const symbol = e.target.dataset.tokenSymbol;
      const isDefault = e.target.dataset.isDefault === "true";
      showTokenDetails(symbol, isDefault);
    });
  });
  defaultTokensEl.querySelectorAll(".copy-address-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const address = e.target.dataset.address;
      try {
        await navigator.clipboard.writeText(address);
        const originalText = e.target.textContent;
        e.target.textContent = "✓";
        setTimeout(() => {
          e.target.textContent = originalText;
        }, 1e3);
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    });
  });
  defaultTokensEl.querySelectorAll(".token-logo-link").forEach((img) => {
    img.addEventListener("click", (e) => {
      const url = e.target.dataset.url;
      chrome.tabs.create({ url });
    });
  });
  defaultTokensEl.querySelectorAll(".token-name-link").forEach((p) => {
    p.addEventListener("click", (e) => {
      const url = e.currentTarget.dataset.url;
      if (url) {
        chrome.tabs.create({ url });
      }
    });
  });
}
async function renderCustomTokens(network) {
  const customTokensEl = document.getElementById("custom-tokens-list");
  const customTokens = await getCustomTokens(network);
  if (customTokens.length === 0) {
    customTokensEl.innerHTML = '<p class="text-center text-dim" style="font-size: 11px; padding: 16px;">No custom tokens added</p>';
    return;
  }
  let html = "";
  for (const token of customTokens) {
    let balanceText = "-";
    let balanceTooltip = "";
    let usdValue = null;
    if (currentState.address) {
      try {
        const balanceWei = await getTokenBalance(network, token.address, currentState.address);
        const rawBalance = formatTokenBalance(balanceWei, token.decimals, 4);
        const formatted = formatBalanceWithCommas(rawBalance, token.decimals);
        balanceText = formatted.display;
        balanceTooltip = formatted.tooltip;
        if (currentState.tokenPrices) {
          usdValue = getTokenValueUSD(token.symbol, balanceWei, token.decimals, currentState.tokenPrices);
        }
      } catch (error) {
        balanceText = "Error";
      }
    }
    const logoUrl = token.logo ? chrome.runtime.getURL(`assets/logos/${token.logo}`) : "";
    html += `
      <div class="token-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 8px; border-bottom: 1px solid var(--terminal-border);">
        ${token.logo ? token.homeUrl ? `<img src="${logoUrl}" alt="${escapeHtml(token.symbol)}" style="width: 32px; height: 32px; margin-right: 12px; border-radius: 50%; cursor: pointer;" class="token-logo-link" data-url="${token.homeUrl}" title="Visit ${escapeHtml(token.name)} homepage" />` : `<img src="${logoUrl}" alt="${escapeHtml(token.symbol)}" style="width: 32px; height: 32px; margin-right: 12px; border-radius: 50%;" />` : '<div style="width: 32px; height: 32px; margin-right: 12px; background: var(--terminal-border); border-radius: 50%;"></div>'}
        <div style="flex: 1;">
          <p style="font-size: 15px; font-weight: bold;">${escapeHtml(token.symbol)}</p>
          <p class="text-dim ${token.dexScreenerUrl ? "token-name-link" : ""}" style="font-size: 13px; ${token.dexScreenerUrl ? "cursor: pointer; text-decoration: underline;" : ""}" ${token.dexScreenerUrl ? `data-url="${token.dexScreenerUrl}" title="View ${escapeHtml(token.name)} on DexScreener"` : ""}>${escapeHtml(token.name)}</p>
          <p class="text-dim" style="font-size: 11px; font-family: var(--font-mono); display: flex; align-items: center; gap: 4px;">
            <span style="max-width: 80px; overflow: hidden; text-overflow: ellipsis;">${token.address}</span>
            <button class="copy-address-btn" data-address="${token.address}" style="background: none; border: none; color: var(--terminal-accent); cursor: pointer; font-size: 11px; padding: 2px 4px;" title="Copy contract address">📋</button>
          </p>
          <p class="text-dim" style="font-size: 13px; cursor: help;" title="${balanceTooltip}">Balance: ${balanceText}</p>
          ${usdValue !== null ? `<p class="text-dim" style="font-size: 12px; margin-top: 2px;">${formatUSD(usdValue)}</p>` : ""}
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; align-items: center; margin-left: 8px; min-width: 80px;">
          <button class="view-token-details-btn" data-token-symbol="${token.symbol}" data-is-default="false" data-token-address="${token.address}" style="background: var(--terminal-accent); border: none; color: #000; cursor: pointer; font-size: 18px; padding: 4px 8px; border-radius: 4px;" title="View token details">ℹ️</button>
          <button class="btn-danger btn-small remove-token-btn" data-token-address="${token.address}" style="width: 100%; font-size: 9px; padding: 2px 4px;">REMOVE</button>
        </div>
      </div>
    `;
  }
  customTokensEl.innerHTML = html;
  customTokensEl.querySelectorAll(".view-token-details-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const symbol = e.target.dataset.tokenSymbol;
      const isDefault = e.target.dataset.isDefault === "true";
      const address = e.target.dataset.tokenAddress;
      showTokenDetails(symbol, isDefault, address);
    });
  });
  customTokensEl.querySelectorAll(".remove-token-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const address = e.target.dataset.tokenAddress;
      if (confirm("Remove this token from your list?")) {
        await removeCustomToken(network, address);
        await renderTokensScreen();
      }
    });
  });
  customTokensEl.querySelectorAll(".copy-address-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const address = e.target.dataset.address;
      try {
        await navigator.clipboard.writeText(address);
        const originalText = e.target.textContent;
        e.target.textContent = "✓";
        setTimeout(() => {
          e.target.textContent = originalText;
        }, 1e3);
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    });
  });
  customTokensEl.querySelectorAll(".token-logo-link").forEach((img) => {
    img.addEventListener("click", (e) => {
      const url = e.target.dataset.url;
      chrome.tabs.create({ url });
    });
  });
  customTokensEl.querySelectorAll(".token-name-link").forEach((p) => {
    p.addEventListener("click", (e) => {
      const url = e.currentTarget.dataset.url;
      if (url) {
        chrome.tabs.create({ url });
      }
    });
  });
}
async function showTokenDetails(symbol, isDefault, customAddress = null) {
  const network = currentState.network;
  let tokenData;
  if (isDefault) {
    tokenData = DEFAULT_TOKENS[network][symbol];
  } else {
    const customTokens = await getCustomTokens(network);
    tokenData = customTokens.find((t) => t.address.toLowerCase() === customAddress.toLowerCase());
  }
  if (!tokenData) {
    console.error("Token not found:", symbol);
    return;
  }
  currentState.currentTokenDetails = {
    ...tokenData,
    symbol,
    isDefault
  };
  document.getElementById("token-details-title").textContent = symbol.toUpperCase();
  document.getElementById("token-details-name").textContent = tokenData.name;
  document.getElementById("token-details-symbol").textContent = symbol;
  const logoContainer = document.getElementById("token-details-logo-container");
  if (tokenData.logo) {
    const logoUrl = chrome.runtime.getURL(`assets/logos/${tokenData.logo}`);
    logoContainer.innerHTML = `<img src="${logoUrl}" alt="${symbol}" style="width: 48px; height: 48px; border-radius: 50%;" />`;
  } else {
    logoContainer.innerHTML = '<div style="width: 48px; height: 48px; background: var(--terminal-border); border-radius: 50%;"></div>';
  }
  try {
    const balanceWei = await getTokenBalance(network, tokenData.address, currentState.address);
    const balanceFormatted = formatTokenBalance(balanceWei, tokenData.decimals, 8);
    document.getElementById("token-details-balance").textContent = balanceFormatted;
    if (currentState.tokenPrices && currentState.tokenPrices[symbol]) {
      const usdValue = getTokenValueUSD(symbol, balanceWei, tokenData.decimals, currentState.tokenPrices);
      document.getElementById("token-details-balance-usd").textContent = formatUSD(usdValue);
    } else {
      document.getElementById("token-details-balance-usd").textContent = "—";
    }
  } catch (error) {
    console.error("Error fetching token balance:", error);
    document.getElementById("token-details-balance").textContent = "Error";
    document.getElementById("token-details-balance-usd").textContent = "—";
  }
  if (currentState.tokenPrices && currentState.tokenPrices[symbol]) {
    document.getElementById("token-details-price").textContent = formatUSD(currentState.tokenPrices[symbol]);
  } else {
    document.getElementById("token-details-price").textContent = "—";
  }
  const homeLink = document.getElementById("token-details-home-link");
  if (tokenData.homeUrl) {
    homeLink.href = tokenData.homeUrl;
    homeLink.classList.remove("hidden");
  } else {
    homeLink.classList.add("hidden");
  }
  const dexLink = document.getElementById("token-details-dex-link");
  if (tokenData.dexScreenerUrl) {
    dexLink.href = tokenData.dexScreenerUrl;
    dexLink.classList.remove("hidden");
  } else {
    dexLink.classList.add("hidden");
  }
  const chainId = network === "pulsechain" ? 369 : network === "pulsechainTestnet" ? 943 : 1;
  const sourcifyLink = document.getElementById("token-details-sourcify-link");
  sourcifyLink.href = `https://repo.sourcify.dev/${chainId}/${tokenData.address}`;
  const shortAddress = `${tokenData.address.slice(0, 6)}...${tokenData.address.slice(-4)}`;
  document.getElementById("token-details-address-short").textContent = shortAddress;
  const managementPanel = document.getElementById("token-details-management-panel");
  if (isDefault) {
    managementPanel.classList.remove("hidden");
    const enableToggle = document.getElementById("token-details-enable-toggle");
    const enableLabel = document.getElementById("token-details-enable-label");
    const enabledTokens = await getEnabledDefaultTokens(network);
    const isTokenEnabled = enabledTokens.includes(symbol);
    enableToggle.checked = isTokenEnabled;
    enableLabel.textContent = isTokenEnabled ? "Enabled" : "Disabled";
  } else {
    managementPanel.classList.add("hidden");
  }
  document.getElementById("token-details-recipient").value = "";
  document.getElementById("token-details-amount").value = "";
  document.getElementById("token-details-password").value = "";
  document.getElementById("token-details-send-error").classList.add("hidden");
  showScreen("screen-token-details");
}
function handleCopyTokenDetailsAddress() {
  const tokenData = currentState.currentTokenDetails;
  if (!tokenData) return;
  navigator.clipboard.writeText(tokenData.address).then(() => {
    const btn = document.getElementById("token-details-copy-address");
    const originalText = btn.innerHTML;
    btn.innerHTML = "<span>✓</span><span>Copied!</span>";
    setTimeout(() => {
      btn.innerHTML = originalText;
    }, 2e3);
  });
}
async function handleTokenSendMax() {
  const tokenData = currentState.currentTokenDetails;
  if (!tokenData) return;
  try {
    const balanceWei = await getTokenBalance(currentState.network, tokenData.address, currentState.address);
    const balanceFormatted = formatTokenBalance(balanceWei, tokenData.decimals, 18);
    document.getElementById("token-details-amount").value = balanceFormatted;
  } catch (error) {
    console.error("Error getting max balance:", error);
  }
}
async function handleTokenSend() {
  const tokenData = currentState.currentTokenDetails;
  if (!tokenData) return;
  const recipient = document.getElementById("token-details-recipient").value.trim();
  const amount = document.getElementById("token-details-amount").value.trim();
  const password = document.getElementById("token-details-password").value;
  const errorEl = document.getElementById("token-details-send-error");
  errorEl.classList.add("hidden");
  if (!recipient || !amount || !password) {
    errorEl.textContent = "Please fill all fields";
    errorEl.classList.remove("hidden");
    return;
  }
  if (!recipient.startsWith("0x") || recipient.length !== 42) {
    errorEl.textContent = "Invalid recipient address";
    errorEl.classList.remove("hidden");
    return;
  }
  try {
    const amountBN = parseUnits(amount, tokenData.decimals);
    const balanceWei = await getTokenBalance(currentState.network, tokenData.address, currentState.address);
    if (amountBN > balanceWei) {
      errorEl.textContent = "Insufficient balance";
      errorEl.classList.remove("hidden");
      return;
    }
    const encryptedWallet = await load("encrypted_wallet");
    if (!encryptedWallet) {
      errorEl.textContent = "Wallet not found";
      errorEl.classList.remove("hidden");
      return;
    }
    let decryptedWallet;
    try {
      decryptedWallet = await wallet.decryptWallet(encryptedWallet, password);
    } catch (err) {
      errorEl.textContent = "Incorrect password";
      errorEl.classList.remove("hidden");
      return;
    }
    const walletIndex = currentState.walletIndex || 0;
    const walletInstance = decryptedWallet.wallets[walletIndex];
    const provider = await getProvider(currentState.network);
    const signer = new Wallet(walletInstance.privateKey, provider);
    const tx = await transferToken(
      signer,
      tokenData.address,
      recipient,
      amountBN.toString()
    );
    const receipt = await tx.wait();
    document.getElementById("token-details-recipient").value = "";
    document.getElementById("token-details-amount").value = "";
    document.getElementById("token-details-password").value = "";
    alert(`Transaction sent!

Tx Hash: ${tx.hash}`);
    showScreen("screen-tokens");
  } catch (error) {
    console.error("Error sending token:", error);
    errorEl.textContent = error.message || "Transaction failed";
    errorEl.classList.remove("hidden");
  }
}
async function handleTokenEnableToggle(e) {
  const tokenData = currentState.currentTokenDetails;
  if (!tokenData || !tokenData.isDefault) return;
  const isEnabled = e.target.checked;
  const label = document.getElementById("token-details-enable-label");
  label.textContent = isEnabled ? "Enabled" : "Disabled";
  await toggleDefaultToken(currentState.network, tokenData.symbol, isEnabled);
}
function showAddTokenModal() {
  document.getElementById("input-token-address").value = "";
  document.getElementById("token-preview").classList.add("hidden");
  document.getElementById("add-token-error").classList.add("hidden");
  document.getElementById("modal-add-token").classList.remove("hidden");
}
let tokenValidationTimeout;
async function handleTokenAddressInput(e) {
  const address = e.target.value.trim();
  const previewEl = document.getElementById("token-preview");
  const errorEl = document.getElementById("add-token-error");
  if (tokenValidationTimeout) {
    clearTimeout(tokenValidationTimeout);
  }
  previewEl.classList.add("hidden");
  errorEl.classList.add("hidden");
  if (!address || address.length !== 42 || !address.startsWith("0x")) {
    return;
  }
  tokenValidationTimeout = setTimeout(async () => {
    try {
      const network = currentState.network;
      const metadata = await getTokenMetadata(network, address);
      document.getElementById("token-preview-name").textContent = metadata.name;
      document.getElementById("token-preview-symbol").textContent = metadata.symbol;
      document.getElementById("token-preview-decimals").textContent = metadata.decimals;
      previewEl.classList.remove("hidden");
    } catch (error) {
      errorEl.textContent = "Invalid token contract";
      errorEl.classList.remove("hidden");
    }
  }, 500);
}
async function handleAddCustomToken() {
  const address = document.getElementById("input-token-address").value.trim();
  const errorEl = document.getElementById("add-token-error");
  if (!address) {
    errorEl.textContent = "Please enter a token address";
    errorEl.classList.remove("hidden");
    return;
  }
  try {
    errorEl.classList.add("hidden");
    await addCustomToken(currentState.network, address);
    document.getElementById("modal-add-token").classList.add("hidden");
    await renderTokensScreen();
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.classList.remove("hidden");
  }
}
function loadSettingsToUI() {
  document.getElementById("setting-autolock").value = currentState.settings.autoLockMinutes;
  document.getElementById("setting-decimals").value = currentState.settings.decimalPlaces;
  document.getElementById("setting-theme").value = currentState.settings.theme;
  document.getElementById("setting-show-testnets").checked = currentState.settings.showTestNetworks;
  document.getElementById("setting-max-gas-price").value = currentState.settings.maxGasPriceGwei || 1e3;
}
const NETWORK_KEYS = ["pulsechainTestnet", "pulsechain", "ethereum", "sepolia"];
function loadNetworkSettingsToUI() {
  NETWORK_KEYS.forEach((network) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const rpcInput = document.getElementById(`rpc-${network}`);
    if (rpcInput) {
      rpcInput.value = ((_b = (_a = currentState.networkSettings) == null ? void 0 : _a[network]) == null ? void 0 : _b.rpc) || "";
    }
    const explorerInput = document.getElementById(`explorer-${network}`);
    if (explorerInput) {
      explorerInput.value = ((_d = (_c = currentState.networkSettings) == null ? void 0 : _c[network]) == null ? void 0 : _d.explorerBase) || "";
    }
    const txPathInput = document.getElementById(`explorer-tx-${network}`);
    if (txPathInput) {
      txPathInput.value = ((_f = (_e = currentState.networkSettings) == null ? void 0 : _e[network]) == null ? void 0 : _f.explorerTxPath) || "";
    }
    const addrPathInput = document.getElementById(`explorer-addr-${network}`);
    if (addrPathInput) {
      addrPathInput.value = ((_h = (_g = currentState.networkSettings) == null ? void 0 : _g[network]) == null ? void 0 : _h.explorerAddrPath) || "";
    }
  });
}
async function saveNetworkSettings() {
  const networkSettings = {};
  NETWORK_KEYS.forEach((network) => {
    var _a, _b, _c, _d;
    networkSettings[network] = {
      rpc: ((_a = document.getElementById(`rpc-${network}`)) == null ? void 0 : _a.value) || "",
      explorerBase: ((_b = document.getElementById(`explorer-${network}`)) == null ? void 0 : _b.value) || "",
      explorerTxPath: ((_c = document.getElementById(`explorer-tx-${network}`)) == null ? void 0 : _c.value) || "",
      explorerAddrPath: ((_d = document.getElementById(`explorer-addr-${network}`)) == null ? void 0 : _d.value) || ""
    };
  });
  await save("networkSettings", networkSettings);
  currentState.networkSettings = networkSettings;
  alert("Network settings saved! Changes will take effect on next reload.");
  showScreen("screen-settings");
}
function resetNetworkSettingsToDefaults() {
  NETWORK_KEYS.forEach((network) => {
    var _a, _b, _c;
    const defaultRPCs = {
      "pulsechainTestnet": "https://rpc.v4.testnet.pulsechain.com",
      "pulsechain": "https://rpc.pulsechain.com",
      "ethereum": "https://eth.llamarpc.com",
      "sepolia": "https://rpc.sepolia.org"
    };
    const defaultExplorers = {
      "pulsechainTestnet": {
        base: "https://scan.v4.testnet.pulsechain.com",
        tx: "/tx/{hash}",
        addr: "/address/{address}"
      },
      "pulsechain": {
        base: "https://scan.mypinata.cloud/ipfs/bafybeienxyoyrhn5tswclvd3gdjy5mtkkwmu37aqtml6onbf7xnb3o22pe/",
        tx: "#/tx/{hash}",
        addr: "#/address/{address}"
      },
      "ethereum": {
        base: "https://etherscan.io",
        tx: "/tx/{hash}",
        addr: "/address/{address}"
      },
      "sepolia": {
        base: "https://sepolia.etherscan.io",
        tx: "/tx/{hash}",
        addr: "/address/{address}"
      }
    };
    document.getElementById(`rpc-${network}`).value = defaultRPCs[network] || "";
    document.getElementById(`explorer-${network}`).value = ((_a = defaultExplorers[network]) == null ? void 0 : _a.base) || "";
    document.getElementById(`explorer-tx-${network}`).value = ((_b = defaultExplorers[network]) == null ? void 0 : _b.tx) || "";
    document.getElementById(`explorer-addr-${network}`).value = ((_c = defaultExplorers[network]) == null ? void 0 : _c.addr) || "";
  });
  alert("Network settings reset to defaults. Click SAVE to apply.");
}
let passwordPromptResolve = null;
function showPasswordPrompt(title, message) {
  return new Promise((resolve) => {
    passwordPromptResolve = resolve;
    document.getElementById("password-prompt-title").textContent = title;
    document.getElementById("password-prompt-message").textContent = message;
    document.getElementById("password-prompt-input").value = "";
    document.getElementById("password-prompt-error").classList.add("hidden");
    document.getElementById("modal-password-prompt").classList.remove("hidden");
    setTimeout(() => {
      var _a;
      (_a = document.getElementById("password-prompt-input")) == null ? void 0 : _a.focus();
    }, 100);
  });
}
function closePasswordPrompt(password = null) {
  document.getElementById("modal-password-prompt").classList.add("hidden");
  if (passwordPromptResolve) {
    passwordPromptResolve(password);
    passwordPromptResolve = null;
  }
}
function showSecretModal(title, secret) {
  document.getElementById("display-secret-title").textContent = title;
  document.getElementById("display-secret-content").textContent = secret;
  document.getElementById("modal-display-secret").classList.remove("hidden");
}
function closeSecretModal() {
  document.getElementById("modal-display-secret").classList.add("hidden");
  document.getElementById("display-secret-content").textContent = "";
}
async function handleViewSeed() {
  const password = await showPasswordPrompt("View Seed Phrase", "Enter your password to view your seed phrase");
  if (!password) return;
  const errorDiv = document.getElementById("password-prompt-error");
  try {
    const mnemonic = await exportMnemonic(password);
    closePasswordPrompt();
    if (mnemonic) {
      showSecretModal("Your Seed Phrase", mnemonic);
    } else {
      alert("This wallet was imported using a private key and has no seed phrase.");
    }
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.remove("hidden");
  }
}
async function handleExportKey() {
  const password = await showPasswordPrompt("Export Private Key", "Enter your password to export your private key");
  if (!password) return;
  const errorDiv = document.getElementById("password-prompt-error");
  try {
    const privateKey = await exportPrivateKey(password);
    closePasswordPrompt();
    showSecretModal("Your Private Key", privateKey);
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.remove("hidden");
  }
}
let currentRenameWalletId = null;
let generatedMnemonicMulti = null;
let verificationWordsMulti = [];
async function renderWalletList() {
  const walletsData = await getAllWallets();
  const walletListDiv = document.getElementById("wallet-list");
  const walletCount = document.getElementById("wallet-count");
  walletCount.textContent = walletsData.walletList.length;
  if (walletsData.walletList.length === 0) {
    walletListDiv.innerHTML = '<p class="text-dim text-center">No wallets found</p>';
    return;
  }
  walletListDiv.innerHTML = "";
  walletsData.walletList.forEach((wallet2) => {
    const isActive = wallet2.id === walletsData.activeWalletId;
    const walletCard = document.createElement("div");
    walletCard.className = "panel mb-2";
    if (isActive) {
      walletCard.style.borderColor = "var(--terminal-success)";
      walletCard.style.borderWidth = "2px";
    }
    walletCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <div style="flex: 1;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
            ${isActive ? "✓ " : ""}${escapeHtml(wallet2.nickname || "Unnamed Wallet")}
            ${isActive ? '<span class="text-success" style="font-size: 11px; margin-left: 8px;">[ACTIVE]</span>' : ""}
          </div>
          <div class="text-dim" style="font-size: 11px; font-family: var(--font-mono); word-break: break-all;">
            ${escapeHtml(wallet2.address || "Address not loaded")}
          </div>
          <div class="text-dim" style="font-size: 10px; margin-top: 4px;">
            ${wallet2.importMethod === "create" ? "Created" : "Imported"} • ${new Date(wallet2.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div class="button-group" style="gap: 6px;">
        ${!isActive ? `<button class="btn btn-small" data-wallet-id="${wallet2.id}" data-action="switch">SWITCH</button>` : ""}
        <button class="btn btn-small" data-wallet-id="${wallet2.id}" data-action="rename">RENAME</button>
        <button class="btn btn-small" data-wallet-id="${wallet2.id}" data-action="export">EXPORT</button>
        <button class="btn btn-danger btn-small" data-wallet-id="${wallet2.id}" data-action="delete">DELETE</button>
      </div>
    `;
    const buttons = walletCard.querySelectorAll("button");
    buttons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const walletId = btn.dataset.walletId;
        const action = btn.dataset.action;
        switch (action) {
          case "switch":
            await handleSwitchWallet(walletId);
            break;
          case "rename":
            handleRenameWalletPrompt(walletId, wallet2.nickname);
            break;
          case "export":
            await handleExportForWallet(walletId);
            break;
          case "delete":
            await handleDeleteWalletMulti(walletId);
            break;
        }
      });
    });
    walletListDiv.appendChild(walletCard);
  });
}
async function handleManageWallets() {
  await renderWalletList();
  showScreen("screen-manage-wallets");
}
function showAddWalletModal() {
  document.getElementById("modal-add-wallet").classList.remove("hidden");
}
async function generateNewMnemonicMulti() {
  const { ethers } = await __vitePreload(async () => {
    const { ethers: ethers2 } = await import("./index.js");
    return { ethers: ethers2 };
  }, true ? __vite__mapDeps([0,1]) : void 0);
  const randomWallet = ethers.Wallet.createRandom();
  generatedMnemonicMulti = randomWallet.mnemonic.phrase;
  document.getElementById("multi-mnemonic-display").textContent = generatedMnemonicMulti;
  const words = generatedMnemonicMulti.split(" ");
  const randomBytes = new Uint8Array(3);
  crypto.getRandomValues(randomBytes);
  const indices = [
    randomBytes[0] % 4,
    // Word 1-4
    4 + randomBytes[1] % 4,
    // Word 5-8
    8 + randomBytes[2] % 4
    // Word 9-12
  ];
  verificationWordsMulti = indices.map((i) => ({ index: i, word: words[i] }));
  document.getElementById("verify-word-1-num-multi").textContent = verificationWordsMulti[0].index + 1;
  document.getElementById("verify-word-2-num-multi").textContent = verificationWordsMulti[1].index + 1;
  document.getElementById("verify-word-3-num-multi").textContent = verificationWordsMulti[2].index + 1;
}
async function handleCreateNewWalletMulti() {
  const nickname = document.getElementById("input-new-wallet-nickname").value.trim();
  const verificationErrorDiv = document.getElementById("verification-error-multi");
  const word1 = document.getElementById("verify-word-1-multi").value.trim().toLowerCase();
  const word2 = document.getElementById("verify-word-2-multi").value.trim().toLowerCase();
  const word3 = document.getElementById("verify-word-3-multi").value.trim().toLowerCase();
  if (!word1 || !word2 || !word3) {
    verificationErrorDiv.textContent = "Please enter all verification words to confirm you have backed up your seed phrase.";
    verificationErrorDiv.classList.remove("hidden");
    return;
  }
  if (word1 !== verificationWordsMulti[0].word.toLowerCase() || word2 !== verificationWordsMulti[1].word.toLowerCase() || word3 !== verificationWordsMulti[2].word.toLowerCase()) {
    verificationErrorDiv.textContent = "Verification words do not match. Please double-check your seed phrase backup.";
    verificationErrorDiv.classList.remove("hidden");
    return;
  }
  verificationErrorDiv.classList.add("hidden");
  document.getElementById("modal-create-wallet-multi").classList.add("hidden");
  const password = await showPasswordPrompt("Enter Your Password", "Enter your wallet password to encrypt the new wallet");
  if (!password) {
    document.getElementById("modal-create-wallet-multi").classList.remove("hidden");
    return;
  }
  try {
    await addWallet("create", {}, password, nickname || null);
    document.getElementById("input-new-wallet-nickname").value = "";
    document.getElementById("verify-word-1-multi").value = "";
    document.getElementById("verify-word-2-multi").value = "";
    document.getElementById("verify-word-3-multi").value = "";
    generatedMnemonicMulti = null;
    verificationWordsMulti = [];
    await renderWalletList();
    alert("Wallet created successfully!");
  } catch (error) {
    alert("Error creating wallet: " + error.message);
  }
}
async function handleImportSeedMulti() {
  const nickname = document.getElementById("input-import-seed-nickname").value.trim();
  const mnemonic = document.getElementById("input-import-seed-phrase").value.trim();
  const errorDiv = document.getElementById("import-seed-error-multi");
  errorDiv.classList.add("hidden");
  if (!mnemonic) {
    errorDiv.textContent = "Please enter a seed phrase";
    errorDiv.classList.remove("hidden");
    return;
  }
  document.getElementById("modal-import-seed-multi").classList.add("hidden");
  const password = await showPasswordPrompt("Enter Your Password", "Enter your wallet password to encrypt the imported wallet");
  if (!password) {
    document.getElementById("modal-import-seed-multi").classList.remove("hidden");
    return;
  }
  try {
    await addWallet("mnemonic", { mnemonic }, password, nickname || null);
    document.getElementById("input-import-seed-nickname").value = "";
    document.getElementById("input-import-seed-phrase").value = "";
    await renderWalletList();
    alert("Wallet imported successfully!");
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.remove("hidden");
    document.getElementById("modal-import-seed-multi").classList.remove("hidden");
  }
}
async function handleImportKeyMulti() {
  const nickname = document.getElementById("input-import-key-nickname").value.trim();
  const privateKey = document.getElementById("input-import-private-key").value.trim();
  const errorDiv = document.getElementById("import-key-error-multi");
  errorDiv.classList.add("hidden");
  if (!privateKey) {
    errorDiv.textContent = "Please enter a private key";
    errorDiv.classList.remove("hidden");
    return;
  }
  document.getElementById("modal-import-key-multi").classList.add("hidden");
  const password = await showPasswordPrompt("Enter Your Password", "Enter your wallet password to encrypt the imported wallet");
  if (!password) {
    document.getElementById("modal-import-key-multi").classList.remove("hidden");
    return;
  }
  try {
    await addWallet("privatekey", { privateKey }, password, nickname || null);
    document.getElementById("input-import-key-nickname").value = "";
    document.getElementById("input-import-private-key").value = "";
    await renderWalletList();
    alert("Wallet imported successfully!");
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.remove("hidden");
    document.getElementById("modal-import-key-multi").classList.remove("hidden");
  }
}
async function handleSwitchWallet(walletId) {
  try {
    await setActiveWallet(walletId);
    await renderWalletList();
    if (currentState.isUnlocked) {
      const wallet2 = await getActiveWallet();
      currentState.address = wallet2.address;
      updateDashboard();
    }
    alert("Switched to wallet successfully!");
  } catch (error) {
    alert("Error switching wallet: " + error.message);
  }
}
function handleRenameWalletPrompt(walletId, currentNickname) {
  currentRenameWalletId = walletId;
  document.getElementById("input-rename-wallet-nickname").value = currentNickname || "";
  document.getElementById("modal-rename-wallet").classList.remove("hidden");
}
async function handleRenameWalletConfirm() {
  const newNickname = document.getElementById("input-rename-wallet-nickname").value.trim();
  const errorDiv = document.getElementById("rename-error");
  errorDiv.classList.add("hidden");
  if (!newNickname) {
    errorDiv.textContent = "Nickname cannot be empty";
    errorDiv.classList.remove("hidden");
    return;
  }
  try {
    await renameWallet(currentRenameWalletId, newNickname);
    document.getElementById("modal-rename-wallet").classList.add("hidden");
    currentRenameWalletId = null;
    await renderWalletList();
    alert("Wallet renamed successfully!");
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.remove("hidden");
  }
}
async function handleDeleteWalletMulti(walletId) {
  const confirmed = confirm(
    "⚠️ WARNING ⚠️\n\nYou are about to DELETE this wallet!\n\nThis action is PERMANENT and CANNOT be undone.\n\nMake sure you have written down your seed phrase or private key.\n\nDo you want to continue?"
  );
  if (!confirmed) return;
  const password = await showPasswordPrompt("Delete Wallet", "Enter your password to delete this wallet");
  if (!password) return;
  try {
    await deleteWallet(walletId, password);
    closePasswordPrompt();
    await renderWalletList();
    const walletsData = await getAllWallets();
    if (walletsData.walletList.length === 0) {
      currentState.isUnlocked = false;
      currentState.address = null;
      showScreen("screen-setup");
    }
    alert("Wallet deleted successfully!");
  } catch (error) {
    alert("Error deleting wallet: " + error.message);
  }
}
async function handleExportForWallet(walletId) {
  const password = await showPasswordPrompt("Export Wallet", "Enter your password to export wallet secrets");
  if (!password) return;
  try {
    const mnemonic = await exportMnemonicForWallet(walletId, password);
    if (mnemonic) {
      showSecretModal("Seed Phrase", mnemonic);
    } else {
      const privateKey = await exportPrivateKeyForWallet(walletId, password);
      showSecretModal("Private Key", privateKey);
    }
    closePasswordPrompt();
  } catch (error) {
    alert("Error exporting wallet: " + error.message);
  }
}
async function handleConnectionApprovalScreen(origin, requestId) {
  await loadSettings();
  applyTheme();
  document.getElementById("connection-site-origin").textContent = origin;
  const wallet2 = await getActiveWallet();
  if (wallet2 && wallet2.address) {
    document.getElementById("connection-wallet-address").textContent = wallet2.address;
  } else {
    document.getElementById("connection-wallet-address").textContent = "No wallet found";
  }
  showScreen("screen-connection-approval");
  document.getElementById("btn-approve-connection").addEventListener("click", async () => {
    try {
      await chrome.runtime.sendMessage({
        type: "CONNECTION_APPROVAL",
        requestId,
        approved: true
      });
      window.close();
    } catch (error) {
      alert("Error approving connection: " + sanitizeError(error.message));
    }
  });
  document.getElementById("btn-reject-connection").addEventListener("click", async () => {
    try {
      await chrome.runtime.sendMessage({
        type: "CONNECTION_APPROVAL",
        requestId,
        approved: false
      });
      window.close();
    } catch (error) {
      alert("Error rejecting connection: " + error.message);
      window.close();
    }
  });
}
async function populateGasPrices(network, txRequest, symbol) {
  try {
    const gasPriceHex = await getGasPrice(network);
    const gasPriceWei = BigInt(gasPriceHex);
    const gasPriceGwei = Number(gasPriceWei) / 1e9;
    const slowGwei = (gasPriceGwei * 0.8).toFixed(2);
    const normalGwei = gasPriceGwei.toFixed(2);
    const fastGwei = (gasPriceGwei * 1.5).toFixed(2);
    document.getElementById("gas-slow-price").textContent = `${slowGwei} Gwei`;
    document.getElementById("gas-normal-price").textContent = `${normalGwei} Gwei`;
    document.getElementById("gas-fast-price").textContent = `${fastGwei} Gwei`;
    try {
      const estimatedGasHex = await estimateGas(network, txRequest);
      const estimatedGas = BigInt(estimatedGasHex);
      document.getElementById("tx-estimated-gas").textContent = estimatedGas.toString();
      const maxFeeWei = estimatedGas * gasPriceWei;
      const maxFeeEth = formatEther(maxFeeWei.toString());
      document.getElementById("tx-max-fee").textContent = `${parseFloat(maxFeeEth).toFixed(8)} ${symbol}`;
      const updateMaxFee = () => {
        var _a;
        const selectedSpeed = (_a = document.querySelector('input[name="gas-speed"]:checked')) == null ? void 0 : _a.value;
        let selectedGwei;
        if (selectedSpeed === "slow") {
          selectedGwei = parseFloat(slowGwei);
        } else if (selectedSpeed === "normal") {
          selectedGwei = parseFloat(normalGwei);
        } else if (selectedSpeed === "fast") {
          selectedGwei = parseFloat(fastGwei);
        } else if (selectedSpeed === "custom") {
          selectedGwei = parseFloat(document.getElementById("tx-custom-gas-price").value) || parseFloat(normalGwei);
        } else {
          selectedGwei = parseFloat(normalGwei);
        }
        const selectedGasPriceWei = BigInt(Math.floor(selectedGwei * 1e9));
        const selectedMaxFeeWei = estimatedGas * selectedGasPriceWei;
        const selectedMaxFeeEth = formatEther(selectedMaxFeeWei.toString());
        document.getElementById("tx-max-fee").textContent = `${parseFloat(selectedMaxFeeEth).toFixed(8)} ${symbol}`;
      };
      document.querySelectorAll('input[name="gas-speed"]').forEach((radio) => {
        radio.addEventListener("change", () => {
          updateMaxFee();
          document.querySelectorAll(".gas-option").forEach((label) => {
            const input = label.querySelector('input[name="gas-speed"]');
            if (input && input.checked) {
              label.style.borderColor = "var(--terminal-success)";
              label.style.borderWidth = "2px";
            } else {
              label.style.borderColor = "var(--terminal-border)";
              label.style.borderWidth = "1px";
            }
          });
          const customContainer = document.getElementById("custom-gas-input-container");
          if (radio.value === "custom" && radio.checked) {
            customContainer.classList.remove("hidden");
            setTimeout(() => {
              document.getElementById("tx-custom-gas-price").focus();
            }, 100);
          } else if (customContainer) {
            customContainer.classList.add("hidden");
          }
        });
      });
      document.querySelectorAll(".gas-option").forEach((label) => {
        const input = label.querySelector('input[name="gas-speed"]');
        if (input && input.checked) {
          label.style.borderColor = "var(--terminal-success)";
          label.style.borderWidth = "2px";
        }
      });
      const customGasInput = document.getElementById("tx-custom-gas-price");
      customGasInput.addEventListener("input", () => {
        document.getElementById("gas-custom-radio").checked = true;
        updateMaxFee();
      });
    } catch (gasEstimateError) {
      console.error("Error estimating gas:", gasEstimateError);
      document.getElementById("tx-estimated-gas").textContent = "21000 (default)";
      document.getElementById("tx-max-fee").textContent = "Unable to estimate";
    }
  } catch (error) {
    console.error("Error fetching gas price:", error);
    document.getElementById("gas-slow-price").textContent = "Error";
    document.getElementById("gas-normal-price").textContent = "Error";
    document.getElementById("gas-fast-price").textContent = "Error";
  }
}
function getSelectedGasPrice() {
  var _a;
  const selectedSpeed = (_a = document.querySelector('input[name="gas-speed"]:checked')) == null ? void 0 : _a.value;
  if (selectedSpeed === "custom") {
    const customGwei = parseFloat(document.getElementById("tx-custom-gas-price").value);
    if (customGwei && customGwei > 0) {
      return parseUnits(customGwei.toString(), "gwei").toString();
    }
  }
  let gweiText;
  if (selectedSpeed === "slow") {
    gweiText = document.getElementById("gas-slow-price").textContent;
  } else if (selectedSpeed === "fast") {
    gweiText = document.getElementById("gas-fast-price").textContent;
  } else {
    gweiText = document.getElementById("gas-normal-price").textContent;
  }
  const gwei = parseFloat(gweiText);
  if (gwei && gwei > 0) {
    return parseUnits(gwei.toString(), "gwei").toString();
  }
  return null;
}
async function fetchAndDisplayNonce(address, network) {
  try {
    const nonceHex = await getTransactionCount(network, address, "pending");
    const nonce = parseInt(nonceHex, 16);
    document.getElementById("tx-current-nonce").textContent = nonce;
  } catch (error) {
    console.error("Error fetching nonce:", error);
    document.getElementById("tx-current-nonce").textContent = "Error";
  }
}
async function handleTransactionApprovalScreen(requestId) {
  await loadSettings();
  applyTheme();
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_TRANSACTION_REQUEST",
      requestId
    });
    if (!response.success) {
      alert("Transaction request not found or expired");
      window.close();
      return;
    }
    const { origin, txRequest } = response;
    const wallet2 = await getActiveWallet();
    const network = await load("currentNetwork") || "pulsechainTestnet";
    document.getElementById("tx-site-origin").textContent = origin;
    document.getElementById("tx-from-address").textContent = (wallet2 == null ? void 0 : wallet2.address) || "0x0000...0000";
    document.getElementById("tx-to-address").textContent = txRequest.to || "Contract Creation";
    const symbols = {
      "pulsechainTestnet": "tPLS",
      "pulsechain": "PLS",
      "ethereum": "ETH",
      "sepolia": "SEP"
    };
    const symbol = symbols[network] || "TOKEN";
    if (txRequest.value) {
      const value = formatEther(txRequest.value);
      document.getElementById("tx-value").textContent = `${value} ${symbol}`;
    } else {
      document.getElementById("tx-value").textContent = `0 ${symbol}`;
    }
    if (txRequest.data && txRequest.data !== "0x") {
      document.getElementById("tx-data-section").classList.remove("hidden");
      document.getElementById("tx-data").textContent = txRequest.data;
    } else {
      document.getElementById("tx-data-section").classList.add("hidden");
    }
    showScreen("screen-transaction-approval");
    await populateGasPrices(network, txRequest, symbol);
    await fetchAndDisplayNonce(wallet2.address, network);
    document.getElementById("tx-custom-nonce-checkbox").addEventListener("change", (e) => {
      const container = document.getElementById("custom-nonce-input-container");
      if (e.target.checked) {
        container.classList.remove("hidden");
        const currentNonce = document.getElementById("tx-current-nonce").textContent;
        if (currentNonce !== "--") {
          document.getElementById("tx-custom-nonce").value = currentNonce;
        }
      } else {
        container.classList.add("hidden");
      }
    });
    document.getElementById("btn-approve-transaction").addEventListener("click", async () => {
      const approveBtn = document.getElementById("btn-approve-transaction");
      const password = document.getElementById("tx-password").value;
      const errorEl = document.getElementById("tx-error");
      if (!password) {
        errorEl.textContent = "Please enter your password";
        errorEl.classList.remove("hidden");
        return;
      }
      approveBtn.disabled = true;
      approveBtn.style.opacity = "0.5";
      approveBtn.style.cursor = "not-allowed";
      try {
        errorEl.classList.add("hidden");
        const activeWallet = await getActiveWallet();
        const tempSessionResponse = await chrome.runtime.sendMessage({
          type: "CREATE_SESSION",
          password,
          walletId: activeWallet.id,
          durationMs: 6e4
          // 1 minute temporary session
        });
        if (!tempSessionResponse.success) {
          throw new Error("Invalid password");
        }
        const gasPrice = getSelectedGasPrice();
        const customNonceCheckbox = document.getElementById("tx-custom-nonce-checkbox");
        const customNonceInput = document.getElementById("tx-custom-nonce");
        let customNonce = null;
        if (customNonceCheckbox.checked && customNonceInput.value) {
          customNonce = parseInt(customNonceInput.value);
          if (isNaN(customNonce) || customNonce < 0) {
            throw new Error("Invalid custom nonce");
          }
        }
        const response2 = await chrome.runtime.sendMessage({
          type: "TRANSACTION_APPROVAL",
          requestId,
          approved: true,
          sessionToken: tempSessionResponse.sessionToken,
          gasPrice,
          customNonce
        });
        if (response2.success) {
          showTransactionStatus(response2.txHash, activeWallet.address, requestId);
        } else {
          errorEl.textContent = response2.error || "Transaction failed";
          errorEl.classList.remove("hidden");
          approveBtn.disabled = false;
          approveBtn.style.opacity = "1";
          approveBtn.style.cursor = "pointer";
        }
      } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove("hidden");
        approveBtn.disabled = false;
        approveBtn.style.opacity = "1";
        approveBtn.style.cursor = "pointer";
      }
    });
    document.getElementById("btn-reject-transaction").addEventListener("click", async () => {
      try {
        await chrome.runtime.sendMessage({
          type: "TRANSACTION_APPROVAL",
          requestId,
          approved: false
        });
        window.close();
      } catch (error) {
        alert("Error rejecting transaction: " + error.message);
        window.close();
      }
    });
  } catch (error) {
    alert("Error loading transaction: " + error.message);
    window.close();
  }
}
async function handleTokenAddApprovalScreen(requestId) {
  await loadSettings();
  applyTheme();
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_TOKEN_ADD_REQUEST",
      requestId
    });
    if (!response.success) {
      alert("Token add request not found or expired");
      window.close();
      return;
    }
    const { origin, tokenInfo } = response;
    document.getElementById("token-site-origin").textContent = origin;
    document.getElementById("token-symbol").textContent = tokenInfo.symbol;
    document.getElementById("token-address").textContent = tokenInfo.address;
    document.getElementById("token-decimals").textContent = tokenInfo.decimals;
    if (tokenInfo.image) {
      document.getElementById("token-image").src = tokenInfo.image;
      document.getElementById("token-image-section").classList.remove("hidden");
    } else {
      document.getElementById("token-image-section").classList.add("hidden");
    }
    showScreen("screen-add-token");
    document.getElementById("btn-approve-token").addEventListener("click", async () => {
      const approveBtn = document.getElementById("btn-approve-token");
      const errorEl = document.getElementById("token-error");
      approveBtn.disabled = true;
      approveBtn.style.opacity = "0.5";
      approveBtn.style.cursor = "not-allowed";
      try {
        errorEl.classList.add("hidden");
        const response2 = await chrome.runtime.sendMessage({
          type: "TOKEN_ADD_APPROVAL",
          requestId,
          approved: true
        });
        if (response2.success) {
          const network = await load("currentNetwork") || "pulsechainTestnet";
          await addCustomToken(network, tokenInfo.address, tokenInfo.symbol, tokenInfo.decimals);
          window.close();
        } else {
          errorEl.textContent = response2.error || "Failed to add token";
          errorEl.classList.remove("hidden");
          approveBtn.disabled = false;
          approveBtn.style.opacity = "1";
          approveBtn.style.cursor = "pointer";
        }
      } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove("hidden");
        approveBtn.disabled = false;
        approveBtn.style.opacity = "1";
        approveBtn.style.cursor = "pointer";
      }
    });
    document.getElementById("btn-reject-token").addEventListener("click", async () => {
      try {
        await chrome.runtime.sendMessage({
          type: "TOKEN_ADD_APPROVAL",
          requestId,
          approved: false
        });
        window.close();
      } catch (error) {
        alert("Error rejecting token: " + error.message);
        window.close();
      }
    });
  } catch (error) {
    alert("Error loading token add request: " + sanitizeError(error.message));
    window.close();
  }
}
async function updatePendingTxIndicator() {
  if (!currentState.address) return;
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_PENDING_TX_COUNT",
      address: currentState.address
    });
    const indicator = document.getElementById("pending-tx-indicator");
    const textEl = document.getElementById("pending-tx-text");
    if (response.success && response.count > 0) {
      textEl.textContent = `⚠️ ${response.count} Pending Transaction${response.count > 1 ? "s" : ""}`;
      indicator.classList.remove("hidden");
    } else {
      indicator.classList.add("hidden");
    }
  } catch (error) {
    console.error("Error checking pending transactions:", error);
  }
}
async function showTransactionHistory() {
  if (!currentState.address) return;
  showScreen("screen-tx-history");
  await renderTransactionHistory("all");
}
async function renderTransactionHistory(filter = "all") {
  const listEl = document.getElementById("tx-history-list");
  if (!currentState.address) {
    listEl.innerHTML = '<p class="text-center text-dim">No address selected</p>';
    return;
  }
  listEl.innerHTML = '<p class="text-center text-dim">Loading...</p>';
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_TX_HISTORY",
      address: currentState.address
    });
    if (!response.success || !response.transactions || response.transactions.length === 0) {
      listEl.innerHTML = '<p class="text-center text-dim">No transactions</p>';
      return;
    }
    let transactions = response.transactions;
    if (filter === "pending") {
      transactions = transactions.filter((tx) => tx.status === "pending");
    } else if (filter === "confirmed") {
      transactions = transactions.filter((tx) => tx.status === "confirmed");
    }
    if (transactions.length === 0) {
      listEl.innerHTML = '<p class="text-center text-dim">No transactions in this filter</p>';
      return;
    }
    let html = "";
    for (const tx of transactions) {
      const statusIcon = tx.status === "pending" ? "⏳" : tx.status === "confirmed" ? "✅" : "❌";
      const statusColor = tx.status === "pending" ? "var(--terminal-warning)" : tx.status === "confirmed" ? "#44ff44" : "#ff4444";
      const date = new Date(tx.timestamp).toLocaleString();
      const valueEth = formatEther(tx.value || "0");
      const gasGwei = formatUnits(tx.gasPrice || "0", "gwei");
      html += `
        <div class="panel mb-2" style="padding: 12px; cursor: pointer; border-color: ${statusColor};" data-tx-hash="${tx.hash}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="color: ${statusColor}; font-size: 14px;">${statusIcon} ${tx.status.toUpperCase()}</span>
            <span class="text-dim" style="font-size: 10px;">${date}</span>
          </div>
          <p class="text-dim" style="font-size: 10px; margin-bottom: 4px;">Hash: ${tx.hash.slice(0, 20)}...</p>
          <p class="text-dim" style="font-size: 10px; margin-bottom: 4px;">Value: ${valueEth} ${getNetworkSymbol(tx.network)}</p>
          <p class="text-dim" style="font-size: 10px;">Gas: ${gasGwei} Gwei • Nonce: ${tx.nonce}</p>
        </div>
      `;
    }
    listEl.innerHTML = html;
    listEl.querySelectorAll("[data-tx-hash]").forEach((el) => {
      el.addEventListener("click", () => {
        const txHash = el.dataset.txHash;
        showTransactionDetails(txHash);
      });
    });
  } catch (error) {
    console.error("Error loading transaction history:", error);
    listEl.innerHTML = '<p class="text-center text-dim">Error loading transactions</p>';
  }
}
async function showTransactionDetails(txHash) {
  if (!currentState.address) return;
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_TX_BY_HASH",
      address: currentState.address,
      txHash
    });
    if (!response.success || !response.transaction) {
      alert("Transaction not found");
      return;
    }
    const tx = response.transaction;
    showScreen("screen-tx-details");
    const statusBadge = document.getElementById("tx-status-badge");
    const statusText = document.getElementById("tx-status-text");
    if (tx.status === "pending") {
      statusText.textContent = "⏳ PENDING";
      statusBadge.style.borderColor = "var(--terminal-warning)";
      statusText.style.color = "var(--terminal-warning)";
      document.getElementById("tx-pending-actions").classList.remove("hidden");
      document.getElementById("tx-detail-block-section").classList.add("hidden");
    } else if (tx.status === "confirmed") {
      statusText.textContent = "✅ CONFIRMED";
      statusBadge.style.borderColor = "#44ff44";
      statusText.style.color = "#44ff44";
      document.getElementById("tx-pending-actions").classList.add("hidden");
      document.getElementById("tx-detail-block-section").classList.remove("hidden");
      document.getElementById("tx-detail-block").textContent = tx.blockNumber || "--";
    } else {
      statusText.textContent = "❌ FAILED";
      statusBadge.style.borderColor = "#ff4444";
      statusText.style.color = "#ff4444";
      document.getElementById("tx-pending-actions").classList.add("hidden");
      document.getElementById("tx-detail-block-section").classList.add("hidden");
    }
    document.getElementById("tx-detail-hash").textContent = tx.hash;
    document.getElementById("tx-detail-from").textContent = tx.from;
    document.getElementById("tx-detail-to").textContent = tx.to || "Contract Creation";
    document.getElementById("tx-detail-value").textContent = formatEther(tx.value || "0") + " " + getNetworkSymbol(tx.network);
    document.getElementById("tx-detail-nonce").textContent = tx.nonce;
    document.getElementById("tx-detail-gas-price").textContent = formatUnits(tx.gasPrice || "0", "gwei") + " Gwei";
    document.getElementById("tx-detail-network").textContent = getNetworkName(tx.network);
    document.getElementById("tx-detail-timestamp").textContent = new Date(tx.timestamp).toLocaleString();
    currentState.currentTxHash = tx.hash;
    const explorerBtn = document.getElementById("btn-view-explorer");
    explorerBtn.onclick = () => {
      const url = getExplorerUrl(tx.network, "tx", tx.hash);
      chrome.tabs.create({ url });
    };
  } catch (error) {
    console.error("Error loading transaction details:", error);
    alert("Error loading transaction details");
  }
}
async function handleSpeedUpTransaction() {
  if (!currentState.address || !currentState.currentTxHash) return;
  const password = await showPasswordPrompt("Speed Up Transaction", "Enter your password to speed up this transaction with higher gas price (1.2x)");
  if (!password) return;
  try {
    const activeWallet = await getActiveWallet();
    const sessionResponse = await chrome.runtime.sendMessage({
      type: "CREATE_SESSION",
      password,
      walletId: activeWallet.id,
      durationMs: 6e4
      // 1 minute temp session
    });
    if (!sessionResponse.success) {
      alert("Invalid password");
      return;
    }
    const response = await chrome.runtime.sendMessage({
      type: "SPEED_UP_TX",
      address: currentState.address,
      txHash: currentState.currentTxHash,
      sessionToken: sessionResponse.sessionToken,
      gasPriceMultiplier: 1.2
    });
    if (response.success) {
      alert(`Transaction sped up!
New TX: ${response.txHash.slice(0, 20)}...`);
      showTransactionDetails(response.txHash);
    } else {
      alert("Error speeding up transaction: " + response.error);
    }
  } catch (error) {
    console.error("Error speeding up transaction:", error);
    alert("Error speeding up transaction");
  }
}
async function handleCancelTransaction() {
  if (!currentState.address || !currentState.currentTxHash) return;
  if (!confirm("Cancel this transaction? A cancellation transaction will be sent.")) {
    return;
  }
  const password = await showPasswordPrompt("Cancel Transaction", "Enter your password to cancel this transaction by sending a 0-value replacement");
  if (!password) return;
  try {
    const activeWallet = await getActiveWallet();
    const sessionResponse = await chrome.runtime.sendMessage({
      type: "CREATE_SESSION",
      password,
      walletId: activeWallet.id,
      durationMs: 6e4
      // 1 minute temp session
    });
    if (!sessionResponse.success) {
      alert("Invalid password");
      return;
    }
    const response = await chrome.runtime.sendMessage({
      type: "CANCEL_TX",
      address: currentState.address,
      txHash: currentState.currentTxHash,
      sessionToken: sessionResponse.sessionToken
    });
    if (response.success) {
      alert(`Transaction cancelled!
Cancellation TX: ${response.txHash.slice(0, 20)}...`);
      showTransactionDetails(response.txHash);
    } else {
      alert("Error cancelling transaction: " + response.error);
    }
  } catch (error) {
    console.error("Error cancelling transaction:", error);
    alert("Error cancelling transaction");
  }
}
async function handleClearTransactionHistory() {
  if (!confirm("Clear all transaction history for this address? This cannot be undone.")) {
    return;
  }
  try {
    await chrome.runtime.sendMessage({
      type: "CLEAR_TX_HISTORY",
      address: currentState.address
    });
    alert("Transaction history cleared");
    showScreen("screen-dashboard");
    await updateDashboard();
  } catch (error) {
    console.error("Error clearing transaction history:", error);
    alert("Error clearing transaction history");
  }
}
let txStatusPollInterval = null;
let txStatusCurrentHash = null;
let txStatusCurrentAddress = null;
async function showTransactionStatus(txHash, address, requestId) {
  txStatusCurrentHash = txHash;
  txStatusCurrentAddress = address;
  document.getElementById("tx-approval-form").classList.add("hidden");
  const statusSection = document.getElementById("tx-status-section");
  statusSection.classList.remove("hidden");
  document.getElementById("tx-status-hash").textContent = txHash;
  const updateStatus = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "GET_TX_BY_HASH",
        address: txStatusCurrentAddress,
        txHash
      });
      if (response.success && response.transaction) {
        const tx = response.transaction;
        const statusMessage = document.getElementById("tx-status-message");
        const statusDetails = document.getElementById("tx-status-details");
        const pendingActions = document.getElementById("tx-status-pending-actions");
        if (tx.status === "confirmed") {
          statusMessage.textContent = "✅ Transaction Confirmed!";
          statusDetails.textContent = `Block: ${tx.blockNumber}`;
          statusDetails.style.color = "var(--terminal-success)";
          pendingActions.classList.add("hidden");
          if (txStatusPollInterval) {
            clearInterval(txStatusPollInterval);
            txStatusPollInterval = null;
          }
          setTimeout(() => {
            window.close();
          }, 2e3);
        } else if (tx.status === "failed") {
          statusMessage.textContent = "❌ Transaction Failed";
          statusDetails.textContent = "The transaction was rejected or replaced";
          statusDetails.style.color = "#ff4444";
          pendingActions.classList.add("hidden");
          if (txStatusPollInterval) {
            clearInterval(txStatusPollInterval);
            txStatusPollInterval = null;
          }
          setTimeout(() => {
            window.close();
          }, 2e3);
        } else {
          statusMessage.textContent = "⏳ Waiting for confirmation...";
          statusDetails.textContent = "This usually takes 10-30 seconds";
          statusDetails.style.color = "var(--terminal-fg-dim)";
          pendingActions.classList.remove("hidden");
        }
      } else {
        console.warn("🫀 Transaction not found in storage:", txHash);
      }
    } catch (error) {
      console.error("🫀 Error checking transaction status:", error);
    }
  };
  await updateStatus();
  txStatusPollInterval = setInterval(updateStatus, 3e3);
}
function getNetworkSymbol(network) {
  const symbols = {
    "pulsechain": "PLS",
    "pulsechainTestnet": "tPLS",
    "ethereum": "ETH",
    "sepolia": "SepoliaETH"
  };
  return symbols[network] || "ETH";
}
function getNetworkName(network) {
  const names = {
    "pulsechain": "PulseChain Mainnet",
    "pulsechainTestnet": "PulseChain Testnet V4",
    "ethereum": "Ethereum Mainnet",
    "sepolia": "Sepolia Testnet"
  };
  return names[network] || network;
}
async function handleCopyAddress() {
  try {
    await navigator.clipboard.writeText(currentState.address);
    const btn = document.getElementById("btn-copy-address");
    const originalText = btn.textContent;
    btn.textContent = "COPIED!";
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2e3);
  } catch (error) {
    alert("Failed to copy address");
  }
}


//# sourceMappingURL=data:application/json;base64,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QSxFQUNWO0FBQUEsRUFBRztBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWDtBQUFBLEVBQUc7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1g7QUFBQSxFQUFHO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNYO0FBQUEsRUFBRztBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWDtBQUFBLEVBQUc7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1g7QUFBQSxFQUFHO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNYO0FBQUEsRUFBRztBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWDtBQUFBLEVBQUc7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1g7QUFBQSxFQUFHO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNYO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUNkO0FBRUEsTUFBTSxxQkFBcUI7QUFBQTtBQUFBLEVBRXpCO0FBQUEsRUFBRztBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWDtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFLO0FBQUEsRUFDYjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSztBQUFBLEVBQ2I7QUFBQSxFQUFJO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNkO0FBQUEsRUFBSTtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZDtBQUFBLEVBQUk7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Q7QUFBQSxFQUFJO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNkO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNmO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNmO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNmO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNmO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUNoQjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQ2hCO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFDaEI7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUNoQjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQ2hCO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFDaEI7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUNoQjtBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQ2pCO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFDakI7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUNqQjtBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQ2pCO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFDakI7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUNqQjtBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUNuQjtBQVVBLHFDQUF5QixTQUFT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ZCxxQkFBcUI7QUFBQSxJQUNyQixZQUFZO0FBQUEsSUFDWixXQUFXO0FBQUEsRUFDZjtBQUNFLFNBQU8sUUFBUSxPQUFPLEtBQUs7QUFDN0I7QUFFQSxTQUFTLGVBQWUsU0FBUztBQUMvQixRQUFNLFFBQVE7QUFBQSxJQUNaLGNBQWM7QUFBQSxJQUNkLHFCQUFxQjtBQUFBLElBQ3JCLFlBQVk7QUFBQSxJQUNaLFdBQVc7QUFBQSxFQUNmO0FBQ0UsU0FBTyxNQUFNLE9BQU8sS0FBSztBQUMzQjtBQUdBLGVBQWUsb0JBQW9CO0FBQ2pDLE1BQUk7QUFDRixVQUFNLFVBQVUsVUFBVSxVQUFVLGFBQWEsT0FBTztBQUN4RCxVQUFNLE1BQU0sU0FBUyxlQUFlLGtCQUFrQjtBQUN0RCxVQUFNLGVBQWUsSUFBSTtBQUN6QixRQUFJLGNBQWM7QUFDbEIsZUFBVyxNQUFNO0FBQ2YsVUFBSSxjQUFjO0FBQUEsSUFDcEIsR0FBRyxHQUFJO0FBQUEsRUFDVCxTQUFTLE9BQU87QUFDZCxVQUFNLHdCQUF3QjtBQUFBLEVBQ2hDO0FBQ0YiLCJuYW1lcyI6WyJjYW5Qcm9taXNlIiwidXRpbHMiLCJ2ZXJzaW9uIiwia2FuamkiLCJpc1ZhbGlkIiwiQml0QnVmZmVyIiwiQml0TWF0cml4IiwiZ2V0U3ltYm9sU2l6ZSIsInJlcXVpcmUkJDAiLCJnZXRQb3NpdGlvbnMiLCJtYXNrUGF0dGVybiIsIkVDTGV2ZWwiLCJlcnJvckNvcnJlY3Rpb25MZXZlbCIsIm11bCIsIlJlZWRTb2xvbW9uRW5jb2RlciIsInJlcXVpcmUkJDEiLCJtb2RlIiwiVXRpbHMiLCJFQ0NvZGUiLCJyZXF1aXJlJCQyIiwiTW9kZSIsInJlcXVpcmUkJDMiLCJyZXF1aXJlJCQ0Iiwic2VnbWVudHMiLCJnZXRFbmNvZGVkQml0cyIsImdldEJpdHNMZW5ndGgiLCJiaXRCdWZmZXIiLCJnZXRMZW5ndGgiLCJ3cml0ZSIsImRpamtzdHJhIiwiTnVtZXJpY0RhdGEiLCJBbHBoYW51bWVyaWNEYXRhIiwiQnl0ZURhdGEiLCJLYW5qaURhdGEiLCJyZXF1aXJlJCQ1IiwicmVxdWlyZSQkNiIsInJlcXVpcmUkJDciLCJyZWdleCIsInJlcXVpcmUkJDgiLCJyZXF1aXJlJCQ5IiwicmVxdWlyZSQkMTAiLCJyZXF1aXJlJCQxMSIsInJlcXVpcmUkJDEyIiwiY2FudmFzIiwicmVuZGVyIiwic3ZnVGFnIiwiZXRoZXJzLkNvbnRyYWN0IiwiZXRoZXJzLmZvcm1hdFVuaXRzIiwiZXRoZXJzLnBhcnNlVW5pdHMiLCJldGhlcnMuaXNBZGRyZXNzIiwidG9rZW5zIiwicGxzUmVzZXJ2ZSIsInNjcmVlbiIsIl9hIiwid2FsbGV0IiwiZXRoZXJzIiwicnBjLmdldEJhbGFuY2UiLCJycGMuZm9ybWF0QmFsYW5jZSIsImV0aGVycy5wYXJzZUV0aGVyIiwicnBjLmdldFByb3ZpZGVyIiwidG9rZW5zLmdldEFsbFRva2VucyIsImVyYzIwLmdldFRva2VuQmFsYW5jZSIsImVyYzIwLmZvcm1hdFRva2VuQmFsYW5jZSIsImVyYzIwLnBhcnNlVG9rZW5BbW91bnQiLCJlcmMyMC50cmFuc2ZlclRva2VuIiwiUVJDb2RlIiwidG9rZW5zLkRFRkFVTFRfVE9LRU5TIiwidG9rZW5zLmdldEVuYWJsZWREZWZhdWx0VG9rZW5zIiwidG9rZW5zLmdldEN1c3RvbVRva2VucyIsInRva2Vucy5yZW1vdmVDdXN0b21Ub2tlbiIsImV0aGVycy5XYWxsZXQiLCJ0b2tlbnMudG9nZ2xlRGVmYXVsdFRva2VuIiwiZXJjMjAuZ2V0VG9rZW5NZXRhZGF0YSIsInRva2Vucy5hZGRDdXN0b21Ub2tlbiIsInJwYy5nZXRHYXNQcmljZSIsInJwYy5lc3RpbWF0ZUdhcyIsImV0aGVycy5mb3JtYXRFdGhlciIsInJwYy5nZXRUcmFuc2FjdGlvbkNvdW50IiwicmVzcG9uc2UiXSwiaWdub3JlTGlzdCI6WzAsMSwyLDMsNCw1LDYsNyw4LDksMTAsMTEsMTIsMTMsMTQsMTUsMTYsMTcsMTgsMTksMjAsMjEsMjIsMjMsMjQsMjUsMjYsMjddLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2Nhbi1wcm9taXNlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS91dGlscy5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvZXJyb3ItY29ycmVjdGlvbi1sZXZlbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYml0LWJ1ZmZlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYml0LW1hdHJpeC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYWxpZ25tZW50LXBhdHRlcm4uanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2ZpbmRlci1wYXR0ZXJuLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9tYXNrLXBhdHRlcm4uanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2Vycm9yLWNvcnJlY3Rpb24tY29kZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvZ2Fsb2lzLWZpZWxkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9wb2x5bm9taWFsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9yZWVkLXNvbG9tb24tZW5jb2Rlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvdmVyc2lvbi1jaGVjay5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcmVnZXguanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL21vZGUuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL3ZlcnNpb24uanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2Zvcm1hdC1pbmZvLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9udW1lcmljLWRhdGEuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2FscGhhbnVtZXJpYy1kYXRhLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9ieXRlLWRhdGEuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2thbmppLWRhdGEuanMiLCIuLi9ub2RlX21vZHVsZXMvZGlqa3N0cmFqcy9kaWprc3RyYS5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvc2VnbWVudHMuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL3FyY29kZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL3JlbmRlcmVyL3V0aWxzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvcmVuZGVyZXIvY2FudmFzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvcmVuZGVyZXIvc3ZnLXRhZy5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2Jyb3dzZXIuanMiLCIuLi9zcmMvY29yZS9lcmMyMC5qcyIsIi4uL3NyYy9jb3JlL3Rva2Vucy5qcyIsIi4uL3NyYy9jb3JlL3ByaWNlT3JhY2xlLmpzIiwiLi4vc3JjL3BvcHVwL3BvcHVwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGNhbi1wcm9taXNlIGhhcyBhIGNyYXNoIGluIHNvbWUgdmVyc2lvbnMgb2YgcmVhY3QgbmF0aXZlIHRoYXQgZG9udCBoYXZlXG4vLyBzdGFuZGFyZCBnbG9iYWwgb2JqZWN0c1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL3NvbGRhaXIvbm9kZS1xcmNvZGUvaXNzdWVzLzE1N1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHR5cGVvZiBQcm9taXNlID09PSAnZnVuY3Rpb24nICYmIFByb21pc2UucHJvdG90eXBlICYmIFByb21pc2UucHJvdG90eXBlLnRoZW5cbn1cbiIsImxldCB0b1NKSVNGdW5jdGlvblxuY29uc3QgQ09ERVdPUkRTX0NPVU5UID0gW1xuICAwLCAvLyBOb3QgdXNlZFxuICAyNiwgNDQsIDcwLCAxMDAsIDEzNCwgMTcyLCAxOTYsIDI0MiwgMjkyLCAzNDYsXG4gIDQwNCwgNDY2LCA1MzIsIDU4MSwgNjU1LCA3MzMsIDgxNSwgOTAxLCA5OTEsIDEwODUsXG4gIDExNTYsIDEyNTgsIDEzNjQsIDE0NzQsIDE1ODgsIDE3MDYsIDE4MjgsIDE5MjEsIDIwNTEsIDIxODUsXG4gIDIzMjMsIDI0NjUsIDI2MTEsIDI3NjEsIDI4NzYsIDMwMzQsIDMxOTYsIDMzNjIsIDM1MzIsIDM3MDZcbl1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBRUiBDb2RlIHNpemUgZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvblxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICBzaXplIG9mIFFSIGNvZGVcbiAqL1xuZXhwb3J0cy5nZXRTeW1ib2xTaXplID0gZnVuY3Rpb24gZ2V0U3ltYm9sU2l6ZSAodmVyc2lvbikge1xuICBpZiAoIXZlcnNpb24pIHRocm93IG5ldyBFcnJvcignXCJ2ZXJzaW9uXCIgY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJylcbiAgaWYgKHZlcnNpb24gPCAxIHx8IHZlcnNpb24gPiA0MCkgdGhyb3cgbmV3IEVycm9yKCdcInZlcnNpb25cIiBzaG91bGQgYmUgaW4gcmFuZ2UgZnJvbSAxIHRvIDQwJylcbiAgcmV0dXJuIHZlcnNpb24gKiA0ICsgMTdcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB0b3RhbCBudW1iZXIgb2YgY29kZXdvcmRzIHVzZWQgdG8gc3RvcmUgZGF0YSBhbmQgRUMgaW5mb3JtYXRpb24uXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgIERhdGEgbGVuZ3RoIGluIGJpdHNcbiAqL1xuZXhwb3J0cy5nZXRTeW1ib2xUb3RhbENvZGV3b3JkcyA9IGZ1bmN0aW9uIGdldFN5bWJvbFRvdGFsQ29kZXdvcmRzICh2ZXJzaW9uKSB7XG4gIHJldHVybiBDT0RFV09SRFNfQ09VTlRbdmVyc2lvbl1cbn1cblxuLyoqXG4gKiBFbmNvZGUgZGF0YSB3aXRoIEJvc2UtQ2hhdWRodXJpLUhvY3F1ZW5naGVtXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBkYXRhIFZhbHVlIHRvIGVuY29kZVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgIEVuY29kZWQgdmFsdWVcbiAqL1xuZXhwb3J0cy5nZXRCQ0hEaWdpdCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gIGxldCBkaWdpdCA9IDBcblxuICB3aGlsZSAoZGF0YSAhPT0gMCkge1xuICAgIGRpZ2l0KytcbiAgICBkYXRhID4+Pj0gMVxuICB9XG5cbiAgcmV0dXJuIGRpZ2l0XG59XG5cbmV4cG9ydHMuc2V0VG9TSklTRnVuY3Rpb24gPSBmdW5jdGlvbiBzZXRUb1NKSVNGdW5jdGlvbiAoZikge1xuICBpZiAodHlwZW9mIGYgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1widG9TSklTRnVuY1wiIGlzIG5vdCBhIHZhbGlkIGZ1bmN0aW9uLicpXG4gIH1cblxuICB0b1NKSVNGdW5jdGlvbiA9IGZcbn1cblxuZXhwb3J0cy5pc0thbmppTW9kZUVuYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0eXBlb2YgdG9TSklTRnVuY3Rpb24gIT09ICd1bmRlZmluZWQnXG59XG5cbmV4cG9ydHMudG9TSklTID0gZnVuY3Rpb24gdG9TSklTIChrYW5qaSkge1xuICByZXR1cm4gdG9TSklTRnVuY3Rpb24oa2FuamkpXG59XG4iLCJleHBvcnRzLkwgPSB7IGJpdDogMSB9XG5leHBvcnRzLk0gPSB7IGJpdDogMCB9XG5leHBvcnRzLlEgPSB7IGJpdDogMyB9XG5leHBvcnRzLkggPSB7IGJpdDogMiB9XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHN0cmluZykge1xuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcmFtIGlzIG5vdCBhIHN0cmluZycpXG4gIH1cblxuICBjb25zdCBsY1N0ciA9IHN0cmluZy50b0xvd2VyQ2FzZSgpXG5cbiAgc3dpdGNoIChsY1N0cikge1xuICAgIGNhc2UgJ2wnOlxuICAgIGNhc2UgJ2xvdyc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5MXG5cbiAgICBjYXNlICdtJzpcbiAgICBjYXNlICdtZWRpdW0nOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuTVxuXG4gICAgY2FzZSAncSc6XG4gICAgY2FzZSAncXVhcnRpbGUnOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuUVxuXG4gICAgY2FzZSAnaCc6XG4gICAgY2FzZSAnaGlnaCc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5IXG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIEVDIExldmVsOiAnICsgc3RyaW5nKVxuICB9XG59XG5cbmV4cG9ydHMuaXNWYWxpZCA9IGZ1bmN0aW9uIGlzVmFsaWQgKGxldmVsKSB7XG4gIHJldHVybiBsZXZlbCAmJiB0eXBlb2YgbGV2ZWwuYml0ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIGxldmVsLmJpdCA+PSAwICYmIGxldmVsLmJpdCA8IDRcbn1cblxuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSAodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAoZXhwb3J0cy5pc1ZhbGlkKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh2YWx1ZSlcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgfVxufVxuIiwiZnVuY3Rpb24gQml0QnVmZmVyICgpIHtcbiAgdGhpcy5idWZmZXIgPSBbXVxuICB0aGlzLmxlbmd0aCA9IDBcbn1cblxuQml0QnVmZmVyLnByb3RvdHlwZSA9IHtcblxuICBnZXQ6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgIGNvbnN0IGJ1ZkluZGV4ID0gTWF0aC5mbG9vcihpbmRleCAvIDgpXG4gICAgcmV0dXJuICgodGhpcy5idWZmZXJbYnVmSW5kZXhdID4+PiAoNyAtIGluZGV4ICUgOCkpICYgMSkgPT09IDFcbiAgfSxcblxuICBwdXQ6IGZ1bmN0aW9uIChudW0sIGxlbmd0aCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMucHV0Qml0KCgobnVtID4+PiAobGVuZ3RoIC0gaSAtIDEpKSAmIDEpID09PSAxKVxuICAgIH1cbiAgfSxcblxuICBnZXRMZW5ndGhJbkJpdHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5sZW5ndGhcbiAgfSxcblxuICBwdXRCaXQ6IGZ1bmN0aW9uIChiaXQpIHtcbiAgICBjb25zdCBidWZJbmRleCA9IE1hdGguZmxvb3IodGhpcy5sZW5ndGggLyA4KVxuICAgIGlmICh0aGlzLmJ1ZmZlci5sZW5ndGggPD0gYnVmSW5kZXgpIHtcbiAgICAgIHRoaXMuYnVmZmVyLnB1c2goMClcbiAgICB9XG5cbiAgICBpZiAoYml0KSB7XG4gICAgICB0aGlzLmJ1ZmZlcltidWZJbmRleF0gfD0gKDB4ODAgPj4+ICh0aGlzLmxlbmd0aCAlIDgpKVxuICAgIH1cblxuICAgIHRoaXMubGVuZ3RoKytcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJpdEJ1ZmZlclxuIiwiLyoqXG4gKiBIZWxwZXIgY2xhc3MgdG8gaGFuZGxlIFFSIENvZGUgc3ltYm9sIG1vZHVsZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc2l6ZSBTeW1ib2wgc2l6ZVxuICovXG5mdW5jdGlvbiBCaXRNYXRyaXggKHNpemUpIHtcbiAgaWYgKCFzaXplIHx8IHNpemUgPCAxKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCaXRNYXRyaXggc2l6ZSBtdXN0IGJlIGRlZmluZWQgYW5kIGdyZWF0ZXIgdGhhbiAwJylcbiAgfVxuXG4gIHRoaXMuc2l6ZSA9IHNpemVcbiAgdGhpcy5kYXRhID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZSAqIHNpemUpXG4gIHRoaXMucmVzZXJ2ZWRCaXQgPSBuZXcgVWludDhBcnJheShzaXplICogc2l6ZSlcbn1cblxuLyoqXG4gKiBTZXQgYml0IHZhbHVlIGF0IHNwZWNpZmllZCBsb2NhdGlvblxuICogSWYgcmVzZXJ2ZWQgZmxhZyBpcyBzZXQsIHRoaXMgYml0IHdpbGwgYmUgaWdub3JlZCBkdXJpbmcgbWFza2luZyBwcm9jZXNzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9ICByb3dcbiAqIEBwYXJhbSB7TnVtYmVyfSAgY29sXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHZhbHVlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHJlc2VydmVkXG4gKi9cbkJpdE1hdHJpeC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHJvdywgY29sLCB2YWx1ZSwgcmVzZXJ2ZWQpIHtcbiAgY29uc3QgaW5kZXggPSByb3cgKiB0aGlzLnNpemUgKyBjb2xcbiAgdGhpcy5kYXRhW2luZGV4XSA9IHZhbHVlXG4gIGlmIChyZXNlcnZlZCkgdGhpcy5yZXNlcnZlZEJpdFtpbmRleF0gPSB0cnVlXG59XG5cbi8qKlxuICogUmV0dXJucyBiaXQgdmFsdWUgYXQgc3BlY2lmaWVkIGxvY2F0aW9uXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSAgcm93XG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICBjb2xcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbkJpdE1hdHJpeC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIHJldHVybiB0aGlzLmRhdGFbcm93ICogdGhpcy5zaXplICsgY29sXVxufVxuXG4vKipcbiAqIEFwcGxpZXMgeG9yIG9wZXJhdG9yIGF0IHNwZWNpZmllZCBsb2NhdGlvblxuICogKHVzZWQgZHVyaW5nIG1hc2tpbmcgcHJvY2VzcylcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gIHJvd1xuICogQHBhcmFtIHtOdW1iZXJ9ICBjb2xcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdmFsdWVcbiAqL1xuQml0TWF0cml4LnByb3RvdHlwZS54b3IgPSBmdW5jdGlvbiAocm93LCBjb2wsIHZhbHVlKSB7XG4gIHRoaXMuZGF0YVtyb3cgKiB0aGlzLnNpemUgKyBjb2xdIF49IHZhbHVlXG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYml0IGF0IHNwZWNpZmllZCBsb2NhdGlvbiBpcyByZXNlcnZlZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSAgIHJvd1xuICogQHBhcmFtIHtOdW1iZXJ9ICAgY29sXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5CaXRNYXRyaXgucHJvdG90eXBlLmlzUmVzZXJ2ZWQgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgcmV0dXJuIHRoaXMucmVzZXJ2ZWRCaXRbcm93ICogdGhpcy5zaXplICsgY29sXVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJpdE1hdHJpeFxuIiwiLyoqXG4gKiBBbGlnbm1lbnQgcGF0dGVybiBhcmUgZml4ZWQgcmVmZXJlbmNlIHBhdHRlcm4gaW4gZGVmaW5lZCBwb3NpdGlvbnNcbiAqIGluIGEgbWF0cml4IHN5bWJvbG9neSwgd2hpY2ggZW5hYmxlcyB0aGUgZGVjb2RlIHNvZnR3YXJlIHRvIHJlLXN5bmNocm9uaXNlXG4gKiB0aGUgY29vcmRpbmF0ZSBtYXBwaW5nIG9mIHRoZSBpbWFnZSBtb2R1bGVzIGluIHRoZSBldmVudCBvZiBtb2RlcmF0ZSBhbW91bnRzXG4gKiBvZiBkaXN0b3J0aW9uIG9mIHRoZSBpbWFnZS5cbiAqXG4gKiBBbGlnbm1lbnQgcGF0dGVybnMgYXJlIHByZXNlbnQgb25seSBpbiBRUiBDb2RlIHN5bWJvbHMgb2YgdmVyc2lvbiAyIG9yIGxhcmdlclxuICogYW5kIHRoZWlyIG51bWJlciBkZXBlbmRzIG9uIHRoZSBzeW1ib2wgdmVyc2lvbi5cbiAqL1xuXG5jb25zdCBnZXRTeW1ib2xTaXplID0gcmVxdWlyZSgnLi91dGlscycpLmdldFN5bWJvbFNpemVcblxuLyoqXG4gKiBDYWxjdWxhdGUgdGhlIHJvdy9jb2x1bW4gY29vcmRpbmF0ZXMgb2YgdGhlIGNlbnRlciBtb2R1bGUgb2YgZWFjaCBhbGlnbm1lbnQgcGF0dGVyblxuICogZm9yIHRoZSBzcGVjaWZpZWQgUVIgQ29kZSB2ZXJzaW9uLlxuICpcbiAqIFRoZSBhbGlnbm1lbnQgcGF0dGVybnMgYXJlIHBvc2l0aW9uZWQgc3ltbWV0cmljYWxseSBvbiBlaXRoZXIgc2lkZSBvZiB0aGUgZGlhZ29uYWxcbiAqIHJ1bm5pbmcgZnJvbSB0aGUgdG9wIGxlZnQgY29ybmVyIG9mIHRoZSBzeW1ib2wgdG8gdGhlIGJvdHRvbSByaWdodCBjb3JuZXIuXG4gKlxuICogU2luY2UgcG9zaXRpb25zIGFyZSBzaW1tZXRyaWNhbCBvbmx5IGhhbGYgb2YgdGhlIGNvb3JkaW5hdGVzIGFyZSByZXR1cm5lZC5cbiAqIEVhY2ggaXRlbSBvZiB0aGUgYXJyYXkgd2lsbCByZXByZXNlbnQgaW4gdHVybiB0aGUgeCBhbmQgeSBjb29yZGluYXRlLlxuICogQHNlZSB7QGxpbmsgZ2V0UG9zaXRpb25zfVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICBBcnJheSBvZiBjb29yZGluYXRlXG4gKi9cbmV4cG9ydHMuZ2V0Um93Q29sQ29vcmRzID0gZnVuY3Rpb24gZ2V0Um93Q29sQ29vcmRzICh2ZXJzaW9uKSB7XG4gIGlmICh2ZXJzaW9uID09PSAxKSByZXR1cm4gW11cblxuICBjb25zdCBwb3NDb3VudCA9IE1hdGguZmxvb3IodmVyc2lvbiAvIDcpICsgMlxuICBjb25zdCBzaXplID0gZ2V0U3ltYm9sU2l6ZSh2ZXJzaW9uKVxuICBjb25zdCBpbnRlcnZhbHMgPSBzaXplID09PSAxNDUgPyAyNiA6IE1hdGguY2VpbCgoc2l6ZSAtIDEzKSAvICgyICogcG9zQ291bnQgLSAyKSkgKiAyXG4gIGNvbnN0IHBvc2l0aW9ucyA9IFtzaXplIC0gN10gLy8gTGFzdCBjb29yZCBpcyBhbHdheXMgKHNpemUgLSA3KVxuXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgcG9zQ291bnQgLSAxOyBpKyspIHtcbiAgICBwb3NpdGlvbnNbaV0gPSBwb3NpdGlvbnNbaSAtIDFdIC0gaW50ZXJ2YWxzXG4gIH1cblxuICBwb3NpdGlvbnMucHVzaCg2KSAvLyBGaXJzdCBjb29yZCBpcyBhbHdheXMgNlxuXG4gIHJldHVybiBwb3NpdGlvbnMucmV2ZXJzZSgpXG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBwb3NpdGlvbnMgb2YgZWFjaCBhbGlnbm1lbnQgcGF0dGVybi5cbiAqIEVhY2ggYXJyYXkncyBlbGVtZW50IHJlcHJlc2VudCB0aGUgY2VudGVyIHBvaW50IG9mIHRoZSBwYXR0ZXJuIGFzICh4LCB5KSBjb29yZGluYXRlc1xuICpcbiAqIENvb3JkaW5hdGVzIGFyZSBjYWxjdWxhdGVkIGV4cGFuZGluZyB0aGUgcm93L2NvbHVtbiBjb29yZGluYXRlcyByZXR1cm5lZCBieSB7QGxpbmsgZ2V0Um93Q29sQ29vcmRzfVxuICogYW5kIGZpbHRlcmluZyBvdXQgdGhlIGl0ZW1zIHRoYXQgb3ZlcmxhcHMgd2l0aCBmaW5kZXIgcGF0dGVyblxuICpcbiAqIEBleGFtcGxlXG4gKiBGb3IgYSBWZXJzaW9uIDcgc3ltYm9sIHtAbGluayBnZXRSb3dDb2xDb29yZHN9IHJldHVybnMgdmFsdWVzIDYsIDIyIGFuZCAzOC5cbiAqIFRoZSBhbGlnbm1lbnQgcGF0dGVybnMsIHRoZXJlZm9yZSwgYXJlIHRvIGJlIGNlbnRlcmVkIG9uIChyb3csIGNvbHVtbilcbiAqIHBvc2l0aW9ucyAoNiwyMiksICgyMiw2KSwgKDIyLDIyKSwgKDIyLDM4KSwgKDM4LDIyKSwgKDM4LDM4KS5cbiAqIE5vdGUgdGhhdCB0aGUgY29vcmRpbmF0ZXMgKDYsNiksICg2LDM4KSwgKDM4LDYpIGFyZSBvY2N1cGllZCBieSBmaW5kZXIgcGF0dGVybnNcbiAqIGFuZCBhcmUgbm90IHRoZXJlZm9yZSB1c2VkIGZvciBhbGlnbm1lbnQgcGF0dGVybnMuXG4gKlxuICogbGV0IHBvcyA9IGdldFBvc2l0aW9ucyg3KVxuICogLy8gW1s2LDIyXSwgWzIyLDZdLCBbMjIsMjJdLCBbMjIsMzhdLCBbMzgsMjJdLCBbMzgsMzhdXVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICBBcnJheSBvZiBjb29yZGluYXRlc1xuICovXG5leHBvcnRzLmdldFBvc2l0aW9ucyA9IGZ1bmN0aW9uIGdldFBvc2l0aW9ucyAodmVyc2lvbikge1xuICBjb25zdCBjb29yZHMgPSBbXVxuICBjb25zdCBwb3MgPSBleHBvcnRzLmdldFJvd0NvbENvb3Jkcyh2ZXJzaW9uKVxuICBjb25zdCBwb3NMZW5ndGggPSBwb3MubGVuZ3RoXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3NMZW5ndGg7IGkrKykge1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zTGVuZ3RoOyBqKyspIHtcbiAgICAgIC8vIFNraXAgaWYgcG9zaXRpb24gaXMgb2NjdXBpZWQgYnkgZmluZGVyIHBhdHRlcm5zXG4gICAgICBpZiAoKGkgPT09IDAgJiYgaiA9PT0gMCkgfHwgLy8gdG9wLWxlZnRcbiAgICAgICAgICAoaSA9PT0gMCAmJiBqID09PSBwb3NMZW5ndGggLSAxKSB8fCAvLyBib3R0b20tbGVmdFxuICAgICAgICAgIChpID09PSBwb3NMZW5ndGggLSAxICYmIGogPT09IDApKSB7IC8vIHRvcC1yaWdodFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjb29yZHMucHVzaChbcG9zW2ldLCBwb3Nbal1dKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb29yZHNcbn1cbiIsImNvbnN0IGdldFN5bWJvbFNpemUgPSByZXF1aXJlKCcuL3V0aWxzJykuZ2V0U3ltYm9sU2l6ZVxuY29uc3QgRklOREVSX1BBVFRFUk5fU0laRSA9IDdcblxuLyoqXG4gKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIHBvc2l0aW9ucyBvZiBlYWNoIGZpbmRlciBwYXR0ZXJuLlxuICogRWFjaCBhcnJheSdzIGVsZW1lbnQgcmVwcmVzZW50IHRoZSB0b3AtbGVmdCBwb2ludCBvZiB0aGUgcGF0dGVybiBhcyAoeCwgeSkgY29vcmRpbmF0ZXNcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgQXJyYXkgb2YgY29vcmRpbmF0ZXNcbiAqL1xuZXhwb3J0cy5nZXRQb3NpdGlvbnMgPSBmdW5jdGlvbiBnZXRQb3NpdGlvbnMgKHZlcnNpb24pIHtcbiAgY29uc3Qgc2l6ZSA9IGdldFN5bWJvbFNpemUodmVyc2lvbilcblxuICByZXR1cm4gW1xuICAgIC8vIHRvcC1sZWZ0XG4gICAgWzAsIDBdLFxuICAgIC8vIHRvcC1yaWdodFxuICAgIFtzaXplIC0gRklOREVSX1BBVFRFUk5fU0laRSwgMF0sXG4gICAgLy8gYm90dG9tLWxlZnRcbiAgICBbMCwgc2l6ZSAtIEZJTkRFUl9QQVRURVJOX1NJWkVdXG4gIF1cbn1cbiIsIi8qKlxuICogRGF0YSBtYXNrIHBhdHRlcm4gcmVmZXJlbmNlXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnRzLlBhdHRlcm5zID0ge1xuICBQQVRURVJOMDAwOiAwLFxuICBQQVRURVJOMDAxOiAxLFxuICBQQVRURVJOMDEwOiAyLFxuICBQQVRURVJOMDExOiAzLFxuICBQQVRURVJOMTAwOiA0LFxuICBQQVRURVJOMTAxOiA1LFxuICBQQVRURVJOMTEwOiA2LFxuICBQQVRURVJOMTExOiA3XG59XG5cbi8qKlxuICogV2VpZ2h0ZWQgcGVuYWx0eSBzY29yZXMgZm9yIHRoZSB1bmRlc2lyYWJsZSBmZWF0dXJlc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xuY29uc3QgUGVuYWx0eVNjb3JlcyA9IHtcbiAgTjE6IDMsXG4gIE4yOiAzLFxuICBOMzogNDAsXG4gIE40OiAxMFxufVxuXG4vKipcbiAqIENoZWNrIGlmIG1hc2sgcGF0dGVybiB2YWx1ZSBpcyB2YWxpZFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gIG1hc2sgICAgTWFzayBwYXR0ZXJuXG4gKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgIHRydWUgaWYgdmFsaWQsIGZhbHNlIG90aGVyd2lzZVxuICovXG5leHBvcnRzLmlzVmFsaWQgPSBmdW5jdGlvbiBpc1ZhbGlkIChtYXNrKSB7XG4gIHJldHVybiBtYXNrICE9IG51bGwgJiYgbWFzayAhPT0gJycgJiYgIWlzTmFOKG1hc2spICYmIG1hc2sgPj0gMCAmJiBtYXNrIDw9IDdcbn1cblxuLyoqXG4gKiBSZXR1cm5zIG1hc2sgcGF0dGVybiBmcm9tIGEgdmFsdWUuXG4gKiBJZiB2YWx1ZSBpcyBub3QgdmFsaWQsIHJldHVybnMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfFN0cmluZ30gdmFsdWUgICAgICAgIE1hc2sgcGF0dGVybiB2YWx1ZVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgIFZhbGlkIG1hc2sgcGF0dGVybiBvciB1bmRlZmluZWRcbiAqL1xuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSAodmFsdWUpIHtcbiAgcmV0dXJuIGV4cG9ydHMuaXNWYWxpZCh2YWx1ZSkgPyBwYXJzZUludCh2YWx1ZSwgMTApIDogdW5kZWZpbmVkXG59XG5cbi8qKlxuKiBGaW5kIGFkamFjZW50IG1vZHVsZXMgaW4gcm93L2NvbHVtbiB3aXRoIHRoZSBzYW1lIGNvbG9yXG4qIGFuZCBhc3NpZ24gYSBwZW5hbHR5IHZhbHVlLlxuKlxuKiBQb2ludHM6IE4xICsgaVxuKiBpIGlzIHRoZSBhbW91bnQgYnkgd2hpY2ggdGhlIG51bWJlciBvZiBhZGphY2VudCBtb2R1bGVzIG9mIHRoZSBzYW1lIGNvbG9yIGV4Y2VlZHMgNVxuKi9cbmV4cG9ydHMuZ2V0UGVuYWx0eU4xID0gZnVuY3Rpb24gZ2V0UGVuYWx0eU4xIChkYXRhKSB7XG4gIGNvbnN0IHNpemUgPSBkYXRhLnNpemVcbiAgbGV0IHBvaW50cyA9IDBcbiAgbGV0IHNhbWVDb3VudENvbCA9IDBcbiAgbGV0IHNhbWVDb3VudFJvdyA9IDBcbiAgbGV0IGxhc3RDb2wgPSBudWxsXG4gIGxldCBsYXN0Um93ID0gbnVsbFxuXG4gIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHNpemU7IHJvdysrKSB7XG4gICAgc2FtZUNvdW50Q29sID0gc2FtZUNvdW50Um93ID0gMFxuICAgIGxhc3RDb2wgPSBsYXN0Um93ID0gbnVsbFxuXG4gICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgc2l6ZTsgY29sKyspIHtcbiAgICAgIGxldCBtb2R1bGUgPSBkYXRhLmdldChyb3csIGNvbClcbiAgICAgIGlmIChtb2R1bGUgPT09IGxhc3RDb2wpIHtcbiAgICAgICAgc2FtZUNvdW50Q29sKytcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzYW1lQ291bnRDb2wgPj0gNSkgcG9pbnRzICs9IFBlbmFsdHlTY29yZXMuTjEgKyAoc2FtZUNvdW50Q29sIC0gNSlcbiAgICAgICAgbGFzdENvbCA9IG1vZHVsZVxuICAgICAgICBzYW1lQ291bnRDb2wgPSAxXG4gICAgICB9XG5cbiAgICAgIG1vZHVsZSA9IGRhdGEuZ2V0KGNvbCwgcm93KVxuICAgICAgaWYgKG1vZHVsZSA9PT0gbGFzdFJvdykge1xuICAgICAgICBzYW1lQ291bnRSb3crK1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNhbWVDb3VudFJvdyA+PSA1KSBwb2ludHMgKz0gUGVuYWx0eVNjb3Jlcy5OMSArIChzYW1lQ291bnRSb3cgLSA1KVxuICAgICAgICBsYXN0Um93ID0gbW9kdWxlXG4gICAgICAgIHNhbWVDb3VudFJvdyA9IDFcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2FtZUNvdW50Q29sID49IDUpIHBvaW50cyArPSBQZW5hbHR5U2NvcmVzLk4xICsgKHNhbWVDb3VudENvbCAtIDUpXG4gICAgaWYgKHNhbWVDb3VudFJvdyA+PSA1KSBwb2ludHMgKz0gUGVuYWx0eVNjb3Jlcy5OMSArIChzYW1lQ291bnRSb3cgLSA1KVxuICB9XG5cbiAgcmV0dXJuIHBvaW50c1xufVxuXG4vKipcbiAqIEZpbmQgMngyIGJsb2NrcyB3aXRoIHRoZSBzYW1lIGNvbG9yIGFuZCBhc3NpZ24gYSBwZW5hbHR5IHZhbHVlXG4gKlxuICogUG9pbnRzOiBOMiAqIChtIC0gMSkgKiAobiAtIDEpXG4gKi9cbmV4cG9ydHMuZ2V0UGVuYWx0eU4yID0gZnVuY3Rpb24gZ2V0UGVuYWx0eU4yIChkYXRhKSB7XG4gIGNvbnN0IHNpemUgPSBkYXRhLnNpemVcbiAgbGV0IHBvaW50cyA9IDBcblxuICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBzaXplIC0gMTsgcm93KyspIHtcbiAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBzaXplIC0gMTsgY29sKyspIHtcbiAgICAgIGNvbnN0IGxhc3QgPSBkYXRhLmdldChyb3csIGNvbCkgK1xuICAgICAgICBkYXRhLmdldChyb3csIGNvbCArIDEpICtcbiAgICAgICAgZGF0YS5nZXQocm93ICsgMSwgY29sKSArXG4gICAgICAgIGRhdGEuZ2V0KHJvdyArIDEsIGNvbCArIDEpXG5cbiAgICAgIGlmIChsYXN0ID09PSA0IHx8IGxhc3QgPT09IDApIHBvaW50cysrXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBvaW50cyAqIFBlbmFsdHlTY29yZXMuTjJcbn1cblxuLyoqXG4gKiBGaW5kIDE6MTozOjE6MSByYXRpbyAoZGFyazpsaWdodDpkYXJrOmxpZ2h0OmRhcmspIHBhdHRlcm4gaW4gcm93L2NvbHVtbixcbiAqIHByZWNlZGVkIG9yIGZvbGxvd2VkIGJ5IGxpZ2h0IGFyZWEgNCBtb2R1bGVzIHdpZGVcbiAqXG4gKiBQb2ludHM6IE4zICogbnVtYmVyIG9mIHBhdHRlcm4gZm91bmRcbiAqL1xuZXhwb3J0cy5nZXRQZW5hbHR5TjMgPSBmdW5jdGlvbiBnZXRQZW5hbHR5TjMgKGRhdGEpIHtcbiAgY29uc3Qgc2l6ZSA9IGRhdGEuc2l6ZVxuICBsZXQgcG9pbnRzID0gMFxuICBsZXQgYml0c0NvbCA9IDBcbiAgbGV0IGJpdHNSb3cgPSAwXG5cbiAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgc2l6ZTsgcm93KyspIHtcbiAgICBiaXRzQ29sID0gYml0c1JvdyA9IDBcbiAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBzaXplOyBjb2wrKykge1xuICAgICAgYml0c0NvbCA9ICgoYml0c0NvbCA8PCAxKSAmIDB4N0ZGKSB8IGRhdGEuZ2V0KHJvdywgY29sKVxuICAgICAgaWYgKGNvbCA+PSAxMCAmJiAoYml0c0NvbCA9PT0gMHg1RDAgfHwgYml0c0NvbCA9PT0gMHgwNUQpKSBwb2ludHMrK1xuXG4gICAgICBiaXRzUm93ID0gKChiaXRzUm93IDw8IDEpICYgMHg3RkYpIHwgZGF0YS5nZXQoY29sLCByb3cpXG4gICAgICBpZiAoY29sID49IDEwICYmIChiaXRzUm93ID09PSAweDVEMCB8fCBiaXRzUm93ID09PSAweDA1RCkpIHBvaW50cysrXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBvaW50cyAqIFBlbmFsdHlTY29yZXMuTjNcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgcHJvcG9ydGlvbiBvZiBkYXJrIG1vZHVsZXMgaW4gZW50aXJlIHN5bWJvbFxuICpcbiAqIFBvaW50czogTjQgKiBrXG4gKlxuICogayBpcyB0aGUgcmF0aW5nIG9mIHRoZSBkZXZpYXRpb24gb2YgdGhlIHByb3BvcnRpb24gb2YgZGFyayBtb2R1bGVzXG4gKiBpbiB0aGUgc3ltYm9sIGZyb20gNTAlIGluIHN0ZXBzIG9mIDUlXG4gKi9cbmV4cG9ydHMuZ2V0UGVuYWx0eU40ID0gZnVuY3Rpb24gZ2V0UGVuYWx0eU40IChkYXRhKSB7XG4gIGxldCBkYXJrQ291bnQgPSAwXG4gIGNvbnN0IG1vZHVsZXNDb3VudCA9IGRhdGEuZGF0YS5sZW5ndGhcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IG1vZHVsZXNDb3VudDsgaSsrKSBkYXJrQ291bnQgKz0gZGF0YS5kYXRhW2ldXG5cbiAgY29uc3QgayA9IE1hdGguYWJzKE1hdGguY2VpbCgoZGFya0NvdW50ICogMTAwIC8gbW9kdWxlc0NvdW50KSAvIDUpIC0gMTApXG5cbiAgcmV0dXJuIGsgKiBQZW5hbHR5U2NvcmVzLk40XG59XG5cbi8qKlxuICogUmV0dXJuIG1hc2sgdmFsdWUgYXQgZ2l2ZW4gcG9zaXRpb25cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG1hc2tQYXR0ZXJuIFBhdHRlcm4gcmVmZXJlbmNlIHZhbHVlXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGkgICAgICAgICAgIFJvd1xuICogQHBhcmFtICB7TnVtYmVyfSBqICAgICAgICAgICBDb2x1bW5cbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgICAgTWFzayB2YWx1ZVxuICovXG5mdW5jdGlvbiBnZXRNYXNrQXQgKG1hc2tQYXR0ZXJuLCBpLCBqKSB7XG4gIHN3aXRjaCAobWFza1BhdHRlcm4pIHtcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjAwMDogcmV0dXJuIChpICsgaikgJSAyID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4wMDE6IHJldHVybiBpICUgMiA9PT0gMFxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDEwOiByZXR1cm4gaiAlIDMgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjAxMTogcmV0dXJuIChpICsgaikgJSAzID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4xMDA6IHJldHVybiAoTWF0aC5mbG9vcihpIC8gMikgKyBNYXRoLmZsb29yKGogLyAzKSkgJSAyID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4xMDE6IHJldHVybiAoaSAqIGopICUgMiArIChpICogaikgJSAzID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4xMTA6IHJldHVybiAoKGkgKiBqKSAlIDIgKyAoaSAqIGopICUgMykgJSAyID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4xMTE6IHJldHVybiAoKGkgKiBqKSAlIDMgKyAoaSArIGopICUgMikgJSAyID09PSAwXG5cbiAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBtYXNrUGF0dGVybjonICsgbWFza1BhdHRlcm4pXG4gIH1cbn1cblxuLyoqXG4gKiBBcHBseSBhIG1hc2sgcGF0dGVybiB0byBhIEJpdE1hdHJpeFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gICAgcGF0dGVybiBQYXR0ZXJuIHJlZmVyZW5jZSBudW1iZXJcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gZGF0YSAgICBCaXRNYXRyaXggZGF0YVxuICovXG5leHBvcnRzLmFwcGx5TWFzayA9IGZ1bmN0aW9uIGFwcGx5TWFzayAocGF0dGVybiwgZGF0YSkge1xuICBjb25zdCBzaXplID0gZGF0YS5zaXplXG5cbiAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgc2l6ZTsgY29sKyspIHtcbiAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBzaXplOyByb3crKykge1xuICAgICAgaWYgKGRhdGEuaXNSZXNlcnZlZChyb3csIGNvbCkpIGNvbnRpbnVlXG4gICAgICBkYXRhLnhvcihyb3csIGNvbCwgZ2V0TWFza0F0KHBhdHRlcm4sIHJvdywgY29sKSlcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBiZXN0IG1hc2sgcGF0dGVybiBmb3IgZGF0YVxuICpcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gZGF0YVxuICogQHJldHVybiB7TnVtYmVyfSBNYXNrIHBhdHRlcm4gcmVmZXJlbmNlIG51bWJlclxuICovXG5leHBvcnRzLmdldEJlc3RNYXNrID0gZnVuY3Rpb24gZ2V0QmVzdE1hc2sgKGRhdGEsIHNldHVwRm9ybWF0RnVuYykge1xuICBjb25zdCBudW1QYXR0ZXJucyA9IE9iamVjdC5rZXlzKGV4cG9ydHMuUGF0dGVybnMpLmxlbmd0aFxuICBsZXQgYmVzdFBhdHRlcm4gPSAwXG4gIGxldCBsb3dlclBlbmFsdHkgPSBJbmZpbml0eVxuXG4gIGZvciAobGV0IHAgPSAwOyBwIDwgbnVtUGF0dGVybnM7IHArKykge1xuICAgIHNldHVwRm9ybWF0RnVuYyhwKVxuICAgIGV4cG9ydHMuYXBwbHlNYXNrKHAsIGRhdGEpXG5cbiAgICAvLyBDYWxjdWxhdGUgcGVuYWx0eVxuICAgIGNvbnN0IHBlbmFsdHkgPVxuICAgICAgZXhwb3J0cy5nZXRQZW5hbHR5TjEoZGF0YSkgK1xuICAgICAgZXhwb3J0cy5nZXRQZW5hbHR5TjIoZGF0YSkgK1xuICAgICAgZXhwb3J0cy5nZXRQZW5hbHR5TjMoZGF0YSkgK1xuICAgICAgZXhwb3J0cy5nZXRQZW5hbHR5TjQoZGF0YSlcblxuICAgIC8vIFVuZG8gcHJldmlvdXNseSBhcHBsaWVkIG1hc2tcbiAgICBleHBvcnRzLmFwcGx5TWFzayhwLCBkYXRhKVxuXG4gICAgaWYgKHBlbmFsdHkgPCBsb3dlclBlbmFsdHkpIHtcbiAgICAgIGxvd2VyUGVuYWx0eSA9IHBlbmFsdHlcbiAgICAgIGJlc3RQYXR0ZXJuID0gcFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBiZXN0UGF0dGVyblxufVxuIiwiY29uc3QgRUNMZXZlbCA9IHJlcXVpcmUoJy4vZXJyb3ItY29ycmVjdGlvbi1sZXZlbCcpXHJcblxyXG5jb25zdCBFQ19CTE9DS1NfVEFCTEUgPSBbXHJcbi8vIEwgIE0gIFEgIEhcclxuICAxLCAxLCAxLCAxLFxyXG4gIDEsIDEsIDEsIDEsXHJcbiAgMSwgMSwgMiwgMixcclxuICAxLCAyLCAyLCA0LFxyXG4gIDEsIDIsIDQsIDQsXHJcbiAgMiwgNCwgNCwgNCxcclxuICAyLCA0LCA2LCA1LFxyXG4gIDIsIDQsIDYsIDYsXHJcbiAgMiwgNSwgOCwgOCxcclxuICA0LCA1LCA4LCA4LFxyXG4gIDQsIDUsIDgsIDExLFxyXG4gIDQsIDgsIDEwLCAxMSxcclxuICA0LCA5LCAxMiwgMTYsXHJcbiAgNCwgOSwgMTYsIDE2LFxyXG4gIDYsIDEwLCAxMiwgMTgsXHJcbiAgNiwgMTAsIDE3LCAxNixcclxuICA2LCAxMSwgMTYsIDE5LFxyXG4gIDYsIDEzLCAxOCwgMjEsXHJcbiAgNywgMTQsIDIxLCAyNSxcclxuICA4LCAxNiwgMjAsIDI1LFxyXG4gIDgsIDE3LCAyMywgMjUsXHJcbiAgOSwgMTcsIDIzLCAzNCxcclxuICA5LCAxOCwgMjUsIDMwLFxyXG4gIDEwLCAyMCwgMjcsIDMyLFxyXG4gIDEyLCAyMSwgMjksIDM1LFxyXG4gIDEyLCAyMywgMzQsIDM3LFxyXG4gIDEyLCAyNSwgMzQsIDQwLFxyXG4gIDEzLCAyNiwgMzUsIDQyLFxyXG4gIDE0LCAyOCwgMzgsIDQ1LFxyXG4gIDE1LCAyOSwgNDAsIDQ4LFxyXG4gIDE2LCAzMSwgNDMsIDUxLFxyXG4gIDE3LCAzMywgNDUsIDU0LFxyXG4gIDE4LCAzNSwgNDgsIDU3LFxyXG4gIDE5LCAzNywgNTEsIDYwLFxyXG4gIDE5LCAzOCwgNTMsIDYzLFxyXG4gIDIwLCA0MCwgNTYsIDY2LFxyXG4gIDIxLCA0MywgNTksIDcwLFxyXG4gIDIyLCA0NSwgNjIsIDc0LFxyXG4gIDI0LCA0NywgNjUsIDc3LFxyXG4gIDI1LCA0OSwgNjgsIDgxXHJcbl1cclxuXHJcbmNvbnN0IEVDX0NPREVXT1JEU19UQUJMRSA9IFtcclxuLy8gTCAgTSAgUSAgSFxyXG4gIDcsIDEwLCAxMywgMTcsXHJcbiAgMTAsIDE2LCAyMiwgMjgsXHJcbiAgMTUsIDI2LCAzNiwgNDQsXHJcbiAgMjAsIDM2LCA1MiwgNjQsXHJcbiAgMjYsIDQ4LCA3MiwgODgsXHJcbiAgMzYsIDY0LCA5NiwgMTEyLFxyXG4gIDQwLCA3MiwgMTA4LCAxMzAsXHJcbiAgNDgsIDg4LCAxMzIsIDE1NixcclxuICA2MCwgMTEwLCAxNjAsIDE5MixcclxuICA3MiwgMTMwLCAxOTIsIDIyNCxcclxuICA4MCwgMTUwLCAyMjQsIDI2NCxcclxuICA5NiwgMTc2LCAyNjAsIDMwOCxcclxuICAxMDQsIDE5OCwgMjg4LCAzNTIsXHJcbiAgMTIwLCAyMTYsIDMyMCwgMzg0LFxyXG4gIDEzMiwgMjQwLCAzNjAsIDQzMixcclxuICAxNDQsIDI4MCwgNDA4LCA0ODAsXHJcbiAgMTY4LCAzMDgsIDQ0OCwgNTMyLFxyXG4gIDE4MCwgMzM4LCA1MDQsIDU4OCxcclxuICAxOTYsIDM2NCwgNTQ2LCA2NTAsXHJcbiAgMjI0LCA0MTYsIDYwMCwgNzAwLFxyXG4gIDIyNCwgNDQyLCA2NDQsIDc1MCxcclxuICAyNTIsIDQ3NiwgNjkwLCA4MTYsXHJcbiAgMjcwLCA1MDQsIDc1MCwgOTAwLFxyXG4gIDMwMCwgNTYwLCA4MTAsIDk2MCxcclxuICAzMTIsIDU4OCwgODcwLCAxMDUwLFxyXG4gIDMzNiwgNjQ0LCA5NTIsIDExMTAsXHJcbiAgMzYwLCA3MDAsIDEwMjAsIDEyMDAsXHJcbiAgMzkwLCA3MjgsIDEwNTAsIDEyNjAsXHJcbiAgNDIwLCA3ODQsIDExNDAsIDEzNTAsXHJcbiAgNDUwLCA4MTIsIDEyMDAsIDE0NDAsXHJcbiAgNDgwLCA4NjgsIDEyOTAsIDE1MzAsXHJcbiAgNTEwLCA5MjQsIDEzNTAsIDE2MjAsXHJcbiAgNTQwLCA5ODAsIDE0NDAsIDE3MTAsXHJcbiAgNTcwLCAxMDM2LCAxNTMwLCAxODAwLFxyXG4gIDU3MCwgMTA2NCwgMTU5MCwgMTg5MCxcclxuICA2MDAsIDExMjAsIDE2ODAsIDE5ODAsXHJcbiAgNjMwLCAxMjA0LCAxNzcwLCAyMTAwLFxyXG4gIDY2MCwgMTI2MCwgMTg2MCwgMjIyMCxcclxuICA3MjAsIDEzMTYsIDE5NTAsIDIzMTAsXHJcbiAgNzUwLCAxMzcyLCAyMDQwLCAyNDMwXHJcbl1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBibG9jayB0aGF0IHRoZSBRUiBDb2RlIHNob3VsZCBjb250YWluXHJcbiAqIGZvciB0aGUgc3BlY2lmaWVkIHZlcnNpb24gYW5kIGVycm9yIGNvcnJlY3Rpb24gbGV2ZWwuXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEBwYXJhbSAge051bWJlcn0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgIE51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGJsb2Nrc1xyXG4gKi9cclxuZXhwb3J0cy5nZXRCbG9ja3NDb3VudCA9IGZ1bmN0aW9uIGdldEJsb2Nrc0NvdW50ICh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gIHN3aXRjaCAoZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcclxuICAgIGNhc2UgRUNMZXZlbC5MOlxyXG4gICAgICByZXR1cm4gRUNfQkxPQ0tTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMF1cclxuICAgIGNhc2UgRUNMZXZlbC5NOlxyXG4gICAgICByZXR1cm4gRUNfQkxPQ0tTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMV1cclxuICAgIGNhc2UgRUNMZXZlbC5ROlxyXG4gICAgICByZXR1cm4gRUNfQkxPQ0tTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMl1cclxuICAgIGNhc2UgRUNMZXZlbC5IOlxyXG4gICAgICByZXR1cm4gRUNfQkxPQ0tTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgM11cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHMgdG8gdXNlIGZvciB0aGUgc3BlY2lmaWVkXHJcbiAqIHZlcnNpb24gYW5kIGVycm9yIGNvcnJlY3Rpb24gbGV2ZWwuXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEBwYXJhbSAge051bWJlcn0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgIE51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3Jkc1xyXG4gKi9cclxuZXhwb3J0cy5nZXRUb3RhbENvZGV3b3Jkc0NvdW50ID0gZnVuY3Rpb24gZ2V0VG90YWxDb2Rld29yZHNDb3VudCAodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcclxuICBzd2l0Y2ggKGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgICBjYXNlIEVDTGV2ZWwuTDpcclxuICAgICAgcmV0dXJuIEVDX0NPREVXT1JEU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDBdXHJcbiAgICBjYXNlIEVDTGV2ZWwuTTpcclxuICAgICAgcmV0dXJuIEVDX0NPREVXT1JEU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDFdXHJcbiAgICBjYXNlIEVDTGV2ZWwuUTpcclxuICAgICAgcmV0dXJuIEVDX0NPREVXT1JEU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDJdXHJcbiAgICBjYXNlIEVDTGV2ZWwuSDpcclxuICAgICAgcmV0dXJuIEVDX0NPREVXT1JEU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDNdXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgfVxyXG59XHJcbiIsImNvbnN0IEVYUF9UQUJMRSA9IG5ldyBVaW50OEFycmF5KDUxMilcbmNvbnN0IExPR19UQUJMRSA9IG5ldyBVaW50OEFycmF5KDI1Nilcbi8qKlxuICogUHJlY29tcHV0ZSB0aGUgbG9nIGFuZCBhbnRpLWxvZyB0YWJsZXMgZm9yIGZhc3RlciBjb21wdXRhdGlvbiBsYXRlclxuICpcbiAqIEZvciBlYWNoIHBvc3NpYmxlIHZhbHVlIGluIHRoZSBnYWxvaXMgZmllbGQgMl44LCB3ZSB3aWxsIHByZS1jb21wdXRlXG4gKiB0aGUgbG9nYXJpdGhtIGFuZCBhbnRpLWxvZ2FyaXRobSAoZXhwb25lbnRpYWwpIG9mIHRoaXMgdmFsdWVcbiAqXG4gKiByZWYge0BsaW5rIGh0dHBzOi8vZW4ud2lraXZlcnNpdHkub3JnL3dpa2kvUmVlZCVFMiU4MCU5M1NvbG9tb25fY29kZXNfZm9yX2NvZGVycyNJbnRyb2R1Y3Rpb25fdG9fbWF0aGVtYXRpY2FsX2ZpZWxkc31cbiAqL1xuOyhmdW5jdGlvbiBpbml0VGFibGVzICgpIHtcbiAgbGV0IHggPSAxXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMjU1OyBpKyspIHtcbiAgICBFWFBfVEFCTEVbaV0gPSB4XG4gICAgTE9HX1RBQkxFW3hdID0gaVxuXG4gICAgeCA8PD0gMSAvLyBtdWx0aXBseSBieSAyXG5cbiAgICAvLyBUaGUgUVIgY29kZSBzcGVjaWZpY2F0aW9uIHNheXMgdG8gdXNlIGJ5dGUtd2lzZSBtb2R1bG8gMTAwMDExMTAxIGFyaXRobWV0aWMuXG4gICAgLy8gVGhpcyBtZWFucyB0aGF0IHdoZW4gYSBudW1iZXIgaXMgMjU2IG9yIGxhcmdlciwgaXQgc2hvdWxkIGJlIFhPUmVkIHdpdGggMHgxMUQuXG4gICAgaWYgKHggJiAweDEwMCkgeyAvLyBzaW1pbGFyIHRvIHggPj0gMjU2LCBidXQgYSBsb3QgZmFzdGVyIChiZWNhdXNlIDB4MTAwID09IDI1NilcbiAgICAgIHggXj0gMHgxMURcbiAgICB9XG4gIH1cblxuICAvLyBPcHRpbWl6YXRpb246IGRvdWJsZSB0aGUgc2l6ZSBvZiB0aGUgYW50aS1sb2cgdGFibGUgc28gdGhhdCB3ZSBkb24ndCBuZWVkIHRvIG1vZCAyNTUgdG9cbiAgLy8gc3RheSBpbnNpZGUgdGhlIGJvdW5kcyAoYmVjYXVzZSB3ZSB3aWxsIG1haW5seSB1c2UgdGhpcyB0YWJsZSBmb3IgdGhlIG11bHRpcGxpY2F0aW9uIG9mXG4gIC8vIHR3byBHRiBudW1iZXJzLCBubyBtb3JlKS5cbiAgLy8gQHNlZSB7QGxpbmsgbXVsfVxuICBmb3IgKGxldCBpID0gMjU1OyBpIDwgNTEyOyBpKyspIHtcbiAgICBFWFBfVEFCTEVbaV0gPSBFWFBfVEFCTEVbaSAtIDI1NV1cbiAgfVxufSgpKVxuXG4vKipcbiAqIFJldHVybnMgbG9nIHZhbHVlIG9mIG4gaW5zaWRlIEdhbG9pcyBGaWVsZFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gblxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uIGxvZyAobikge1xuICBpZiAobiA8IDEpIHRocm93IG5ldyBFcnJvcignbG9nKCcgKyBuICsgJyknKVxuICByZXR1cm4gTE9HX1RBQkxFW25dXG59XG5cbi8qKlxuICogUmV0dXJucyBhbnRpLWxvZyB2YWx1ZSBvZiBuIGluc2lkZSBHYWxvaXMgRmllbGRcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZXhwb3J0cy5leHAgPSBmdW5jdGlvbiBleHAgKG4pIHtcbiAgcmV0dXJuIEVYUF9UQUJMRVtuXVxufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG51bWJlciBpbnNpZGUgR2Fsb2lzIEZpZWxkXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB4XG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHlcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZXhwb3J0cy5tdWwgPSBmdW5jdGlvbiBtdWwgKHgsIHkpIHtcbiAgaWYgKHggPT09IDAgfHwgeSA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBzaG91bGQgYmUgRVhQX1RBQkxFWyhMT0dfVEFCTEVbeF0gKyBMT0dfVEFCTEVbeV0pICUgMjU1XSBpZiBFWFBfVEFCTEUgd2Fzbid0IG92ZXJzaXplZFxuICAvLyBAc2VlIHtAbGluayBpbml0VGFibGVzfVxuICByZXR1cm4gRVhQX1RBQkxFW0xPR19UQUJMRVt4XSArIExPR19UQUJMRVt5XV1cbn1cbiIsImNvbnN0IEdGID0gcmVxdWlyZSgnLi9nYWxvaXMtZmllbGQnKVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHBvbHlub21pYWxzIGluc2lkZSBHYWxvaXMgRmllbGRcbiAqXG4gKiBAcGFyYW0gIHtVaW50OEFycmF5fSBwMSBQb2x5bm9taWFsXG4gKiBAcGFyYW0gIHtVaW50OEFycmF5fSBwMiBQb2x5bm9taWFsXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICBQcm9kdWN0IG9mIHAxIGFuZCBwMlxuICovXG5leHBvcnRzLm11bCA9IGZ1bmN0aW9uIG11bCAocDEsIHAyKSB7XG4gIGNvbnN0IGNvZWZmID0gbmV3IFVpbnQ4QXJyYXkocDEubGVuZ3RoICsgcDIubGVuZ3RoIC0gMSlcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHAxLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBwMi5sZW5ndGg7IGorKykge1xuICAgICAgY29lZmZbaSArIGpdIF49IEdGLm11bChwMVtpXSwgcDJbal0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvZWZmXG59XG5cbi8qKlxuICogQ2FsY3VsYXRlIHRoZSByZW1haW5kZXIgb2YgcG9seW5vbWlhbHMgZGl2aXNpb25cbiAqXG4gKiBAcGFyYW0gIHtVaW50OEFycmF5fSBkaXZpZGVudCBQb2x5bm9taWFsXG4gKiBAcGFyYW0gIHtVaW50OEFycmF5fSBkaXZpc29yICBQb2x5bm9taWFsXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICAgICAgICBSZW1haW5kZXJcbiAqL1xuZXhwb3J0cy5tb2QgPSBmdW5jdGlvbiBtb2QgKGRpdmlkZW50LCBkaXZpc29yKSB7XG4gIGxldCByZXN1bHQgPSBuZXcgVWludDhBcnJheShkaXZpZGVudClcblxuICB3aGlsZSAoKHJlc3VsdC5sZW5ndGggLSBkaXZpc29yLmxlbmd0aCkgPj0gMCkge1xuICAgIGNvbnN0IGNvZWZmID0gcmVzdWx0WzBdXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpdmlzb3IubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFtpXSBePSBHRi5tdWwoZGl2aXNvcltpXSwgY29lZmYpXG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGFsbCB6ZXJvcyBmcm9tIGJ1ZmZlciBoZWFkXG4gICAgbGV0IG9mZnNldCA9IDBcbiAgICB3aGlsZSAob2Zmc2V0IDwgcmVzdWx0Lmxlbmd0aCAmJiByZXN1bHRbb2Zmc2V0XSA9PT0gMCkgb2Zmc2V0KytcbiAgICByZXN1bHQgPSByZXN1bHQuc2xpY2Uob2Zmc2V0KVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG4vKipcbiAqIEdlbmVyYXRlIGFuIGlycmVkdWNpYmxlIGdlbmVyYXRvciBwb2x5bm9taWFsIG9mIHNwZWNpZmllZCBkZWdyZWVcbiAqICh1c2VkIGJ5IFJlZWQtU29sb21vbiBlbmNvZGVyKVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gZGVncmVlIERlZ3JlZSBvZiB0aGUgZ2VuZXJhdG9yIHBvbHlub21pYWxcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9ICAgIEJ1ZmZlciBjb250YWluaW5nIHBvbHlub21pYWwgY29lZmZpY2llbnRzXG4gKi9cbmV4cG9ydHMuZ2VuZXJhdGVFQ1BvbHlub21pYWwgPSBmdW5jdGlvbiBnZW5lcmF0ZUVDUG9seW5vbWlhbCAoZGVncmVlKSB7XG4gIGxldCBwb2x5ID0gbmV3IFVpbnQ4QXJyYXkoWzFdKVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZ3JlZTsgaSsrKSB7XG4gICAgcG9seSA9IGV4cG9ydHMubXVsKHBvbHksIG5ldyBVaW50OEFycmF5KFsxLCBHRi5leHAoaSldKSlcbiAgfVxuXG4gIHJldHVybiBwb2x5XG59XG4iLCJjb25zdCBQb2x5bm9taWFsID0gcmVxdWlyZSgnLi9wb2x5bm9taWFsJylcblxuZnVuY3Rpb24gUmVlZFNvbG9tb25FbmNvZGVyIChkZWdyZWUpIHtcbiAgdGhpcy5nZW5Qb2x5ID0gdW5kZWZpbmVkXG4gIHRoaXMuZGVncmVlID0gZGVncmVlXG5cbiAgaWYgKHRoaXMuZGVncmVlKSB0aGlzLmluaXRpYWxpemUodGhpcy5kZWdyZWUpXG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgZW5jb2Rlci5cbiAqIFRoZSBpbnB1dCBwYXJhbSBzaG91bGQgY29ycmVzcG9uZCB0byB0aGUgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzLlxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gZGVncmVlXG4gKi9cblJlZWRTb2xvbW9uRW5jb2Rlci5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIGluaXRpYWxpemUgKGRlZ3JlZSkge1xuICAvLyBjcmVhdGUgYW4gaXJyZWR1Y2libGUgZ2VuZXJhdG9yIHBvbHlub21pYWxcbiAgdGhpcy5kZWdyZWUgPSBkZWdyZWVcbiAgdGhpcy5nZW5Qb2x5ID0gUG9seW5vbWlhbC5nZW5lcmF0ZUVDUG9seW5vbWlhbCh0aGlzLmRlZ3JlZSlcbn1cblxuLyoqXG4gKiBFbmNvZGVzIGEgY2h1bmsgb2YgZGF0YVxuICpcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IGRhdGEgQnVmZmVyIGNvbnRhaW5pbmcgaW5wdXQgZGF0YVxuICogQHJldHVybiB7VWludDhBcnJheX0gICAgICBCdWZmZXIgY29udGFpbmluZyBlbmNvZGVkIGRhdGFcbiAqL1xuUmVlZFNvbG9tb25FbmNvZGVyLnByb3RvdHlwZS5lbmNvZGUgPSBmdW5jdGlvbiBlbmNvZGUgKGRhdGEpIHtcbiAgaWYgKCF0aGlzLmdlblBvbHkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0VuY29kZXIgbm90IGluaXRpYWxpemVkJylcbiAgfVxuXG4gIC8vIENhbGN1bGF0ZSBFQyBmb3IgdGhpcyBkYXRhIGJsb2NrXG4gIC8vIGV4dGVuZHMgZGF0YSBzaXplIHRvIGRhdGErZ2VuUG9seSBzaXplXG4gIGNvbnN0IHBhZGRlZERhdGEgPSBuZXcgVWludDhBcnJheShkYXRhLmxlbmd0aCArIHRoaXMuZGVncmVlKVxuICBwYWRkZWREYXRhLnNldChkYXRhKVxuXG4gIC8vIFRoZSBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3JkcyBhcmUgdGhlIHJlbWFpbmRlciBhZnRlciBkaXZpZGluZyB0aGUgZGF0YSBjb2Rld29yZHNcbiAgLy8gYnkgYSBnZW5lcmF0b3IgcG9seW5vbWlhbFxuICBjb25zdCByZW1haW5kZXIgPSBQb2x5bm9taWFsLm1vZChwYWRkZWREYXRhLCB0aGlzLmdlblBvbHkpXG5cbiAgLy8gcmV0dXJuIEVDIGRhdGEgYmxvY2tzIChsYXN0IG4gYnl0ZSwgd2hlcmUgbiBpcyB0aGUgZGVncmVlIG9mIGdlblBvbHkpXG4gIC8vIElmIGNvZWZmaWNpZW50cyBudW1iZXIgaW4gcmVtYWluZGVyIGFyZSBsZXNzIHRoYW4gZ2VuUG9seSBkZWdyZWUsXG4gIC8vIHBhZCB3aXRoIDBzIHRvIHRoZSBsZWZ0IHRvIHJlYWNoIHRoZSBuZWVkZWQgbnVtYmVyIG9mIGNvZWZmaWNpZW50c1xuICBjb25zdCBzdGFydCA9IHRoaXMuZGVncmVlIC0gcmVtYWluZGVyLmxlbmd0aFxuICBpZiAoc3RhcnQgPiAwKSB7XG4gICAgY29uc3QgYnVmZiA9IG5ldyBVaW50OEFycmF5KHRoaXMuZGVncmVlKVxuICAgIGJ1ZmYuc2V0KHJlbWFpbmRlciwgc3RhcnQpXG5cbiAgICByZXR1cm4gYnVmZlxuICB9XG5cbiAgcmV0dXJuIHJlbWFpbmRlclxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlZWRTb2xvbW9uRW5jb2RlclxuIiwiLyoqXG4gKiBDaGVjayBpZiBRUiBDb2RlIHZlcnNpb24gaXMgdmFsaWRcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICB0cnVlIGlmIHZhbGlkIHZlcnNpb24sIGZhbHNlIG90aGVyd2lzZVxuICovXG5leHBvcnRzLmlzVmFsaWQgPSBmdW5jdGlvbiBpc1ZhbGlkICh2ZXJzaW9uKSB7XG4gIHJldHVybiAhaXNOYU4odmVyc2lvbikgJiYgdmVyc2lvbiA+PSAxICYmIHZlcnNpb24gPD0gNDBcbn1cbiIsImNvbnN0IG51bWVyaWMgPSAnWzAtOV0rJ1xuY29uc3QgYWxwaGFudW1lcmljID0gJ1tBLVogJCUqK1xcXFwtLi86XSsnXG5sZXQga2FuamkgPSAnKD86W3UzMDAwLXUzMDNGXXxbdTMwNDAtdTMwOUZdfFt1MzBBMC11MzBGRl18JyArXG4gICdbdUZGMDAtdUZGRUZdfFt1NEUwMC11OUZBRl18W3UyNjA1LXUyNjA2XXxbdTIxOTAtdTIxOTVdfHUyMDNCfCcgK1xuICAnW3UyMDEwdTIwMTV1MjAxOHUyMDE5dTIwMjV1MjAyNnUyMDFDdTIwMUR1MjIyNXUyMjYwXXwnICtcbiAgJ1t1MDM5MS11MDQ1MV18W3UwMEE3dTAwQTh1MDBCMXUwMEI0dTAwRDd1MDBGN10pKydcbmthbmppID0ga2FuamkucmVwbGFjZSgvdS9nLCAnXFxcXHUnKVxuXG5jb25zdCBieXRlID0gJyg/Oig/IVtBLVowLTkgJCUqK1xcXFwtLi86XXwnICsga2FuamkgKyAnKSg/Oi58W1xcclxcbl0pKSsnXG5cbmV4cG9ydHMuS0FOSkkgPSBuZXcgUmVnRXhwKGthbmppLCAnZycpXG5leHBvcnRzLkJZVEVfS0FOSkkgPSBuZXcgUmVnRXhwKCdbXkEtWjAtOSAkJSorXFxcXC0uLzpdKycsICdnJylcbmV4cG9ydHMuQllURSA9IG5ldyBSZWdFeHAoYnl0ZSwgJ2cnKVxuZXhwb3J0cy5OVU1FUklDID0gbmV3IFJlZ0V4cChudW1lcmljLCAnZycpXG5leHBvcnRzLkFMUEhBTlVNRVJJQyA9IG5ldyBSZWdFeHAoYWxwaGFudW1lcmljLCAnZycpXG5cbmNvbnN0IFRFU1RfS0FOSkkgPSBuZXcgUmVnRXhwKCdeJyArIGthbmppICsgJyQnKVxuY29uc3QgVEVTVF9OVU1FUklDID0gbmV3IFJlZ0V4cCgnXicgKyBudW1lcmljICsgJyQnKVxuY29uc3QgVEVTVF9BTFBIQU5VTUVSSUMgPSBuZXcgUmVnRXhwKCdeW0EtWjAtOSAkJSorXFxcXC0uLzpdKyQnKVxuXG5leHBvcnRzLnRlc3RLYW5qaSA9IGZ1bmN0aW9uIHRlc3RLYW5qaSAoc3RyKSB7XG4gIHJldHVybiBURVNUX0tBTkpJLnRlc3Qoc3RyKVxufVxuXG5leHBvcnRzLnRlc3ROdW1lcmljID0gZnVuY3Rpb24gdGVzdE51bWVyaWMgKHN0cikge1xuICByZXR1cm4gVEVTVF9OVU1FUklDLnRlc3Qoc3RyKVxufVxuXG5leHBvcnRzLnRlc3RBbHBoYW51bWVyaWMgPSBmdW5jdGlvbiB0ZXN0QWxwaGFudW1lcmljIChzdHIpIHtcbiAgcmV0dXJuIFRFU1RfQUxQSEFOVU1FUklDLnRlc3Qoc3RyKVxufVxuIiwiY29uc3QgVmVyc2lvbkNoZWNrID0gcmVxdWlyZSgnLi92ZXJzaW9uLWNoZWNrJylcbmNvbnN0IFJlZ2V4ID0gcmVxdWlyZSgnLi9yZWdleCcpXG5cbi8qKlxuICogTnVtZXJpYyBtb2RlIGVuY29kZXMgZGF0YSBmcm9tIHRoZSBkZWNpbWFsIGRpZ2l0IHNldCAoMCAtIDkpXG4gKiAoYnl0ZSB2YWx1ZXMgMzBIRVggdG8gMzlIRVgpLlxuICogTm9ybWFsbHksIDMgZGF0YSBjaGFyYWN0ZXJzIGFyZSByZXByZXNlbnRlZCBieSAxMCBiaXRzLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydHMuTlVNRVJJQyA9IHtcbiAgaWQ6ICdOdW1lcmljJyxcbiAgYml0OiAxIDw8IDAsXG4gIGNjQml0czogWzEwLCAxMiwgMTRdXG59XG5cbi8qKlxuICogQWxwaGFudW1lcmljIG1vZGUgZW5jb2RlcyBkYXRhIGZyb20gYSBzZXQgb2YgNDUgY2hhcmFjdGVycyxcbiAqIGkuZS4gMTAgbnVtZXJpYyBkaWdpdHMgKDAgLSA5KSxcbiAqICAgICAgMjYgYWxwaGFiZXRpYyBjaGFyYWN0ZXJzIChBIC0gWiksXG4gKiAgIGFuZCA5IHN5bWJvbHMgKFNQLCAkLCAlLCAqLCArLCAtLCAuLCAvLCA6KS5cbiAqIE5vcm1hbGx5LCB0d28gaW5wdXQgY2hhcmFjdGVycyBhcmUgcmVwcmVzZW50ZWQgYnkgMTEgYml0cy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnRzLkFMUEhBTlVNRVJJQyA9IHtcbiAgaWQ6ICdBbHBoYW51bWVyaWMnLFxuICBiaXQ6IDEgPDwgMSxcbiAgY2NCaXRzOiBbOSwgMTEsIDEzXVxufVxuXG4vKipcbiAqIEluIGJ5dGUgbW9kZSwgZGF0YSBpcyBlbmNvZGVkIGF0IDggYml0cyBwZXIgY2hhcmFjdGVyLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydHMuQllURSA9IHtcbiAgaWQ6ICdCeXRlJyxcbiAgYml0OiAxIDw8IDIsXG4gIGNjQml0czogWzgsIDE2LCAxNl1cbn1cblxuLyoqXG4gKiBUaGUgS2FuamkgbW9kZSBlZmZpY2llbnRseSBlbmNvZGVzIEthbmppIGNoYXJhY3RlcnMgaW4gYWNjb3JkYW5jZSB3aXRoXG4gKiB0aGUgU2hpZnQgSklTIHN5c3RlbSBiYXNlZCBvbiBKSVMgWCAwMjA4LlxuICogVGhlIFNoaWZ0IEpJUyB2YWx1ZXMgYXJlIHNoaWZ0ZWQgZnJvbSB0aGUgSklTIFggMDIwOCB2YWx1ZXMuXG4gKiBKSVMgWCAwMjA4IGdpdmVzIGRldGFpbHMgb2YgdGhlIHNoaWZ0IGNvZGVkIHJlcHJlc2VudGF0aW9uLlxuICogRWFjaCB0d28tYnl0ZSBjaGFyYWN0ZXIgdmFsdWUgaXMgY29tcGFjdGVkIHRvIGEgMTMtYml0IGJpbmFyeSBjb2Rld29yZC5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnRzLktBTkpJID0ge1xuICBpZDogJ0thbmppJyxcbiAgYml0OiAxIDw8IDMsXG4gIGNjQml0czogWzgsIDEwLCAxMl1cbn1cblxuLyoqXG4gKiBNaXhlZCBtb2RlIHdpbGwgY29udGFpbiBhIHNlcXVlbmNlcyBvZiBkYXRhIGluIGEgY29tYmluYXRpb24gb2YgYW55IG9mXG4gKiB0aGUgbW9kZXMgZGVzY3JpYmVkIGFib3ZlXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuZXhwb3J0cy5NSVhFRCA9IHtcbiAgYml0OiAtMVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiBiaXRzIG5lZWRlZCB0byBzdG9yZSB0aGUgZGF0YSBsZW5ndGhcbiAqIGFjY29yZGluZyB0byBRUiBDb2RlIHNwZWNpZmljYXRpb25zLlxuICpcbiAqIEBwYXJhbSAge01vZGV9ICAgbW9kZSAgICBEYXRhIG1vZGVcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICBOdW1iZXIgb2YgYml0c1xuICovXG5leHBvcnRzLmdldENoYXJDb3VudEluZGljYXRvciA9IGZ1bmN0aW9uIGdldENoYXJDb3VudEluZGljYXRvciAobW9kZSwgdmVyc2lvbikge1xuICBpZiAoIW1vZGUuY2NCaXRzKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbW9kZTogJyArIG1vZGUpXG5cbiAgaWYgKCFWZXJzaW9uQ2hlY2suaXNWYWxpZCh2ZXJzaW9uKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB2ZXJzaW9uOiAnICsgdmVyc2lvbilcbiAgfVxuXG4gIGlmICh2ZXJzaW9uID49IDEgJiYgdmVyc2lvbiA8IDEwKSByZXR1cm4gbW9kZS5jY0JpdHNbMF1cbiAgZWxzZSBpZiAodmVyc2lvbiA8IDI3KSByZXR1cm4gbW9kZS5jY0JpdHNbMV1cbiAgcmV0dXJuIG1vZGUuY2NCaXRzWzJdXG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbW9zdCBlZmZpY2llbnQgbW9kZSB0byBzdG9yZSB0aGUgc3BlY2lmaWVkIGRhdGFcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGFTdHIgSW5wdXQgZGF0YSBzdHJpbmdcbiAqIEByZXR1cm4ge01vZGV9ICAgICAgICAgICBCZXN0IG1vZGVcbiAqL1xuZXhwb3J0cy5nZXRCZXN0TW9kZUZvckRhdGEgPSBmdW5jdGlvbiBnZXRCZXN0TW9kZUZvckRhdGEgKGRhdGFTdHIpIHtcbiAgaWYgKFJlZ2V4LnRlc3ROdW1lcmljKGRhdGFTdHIpKSByZXR1cm4gZXhwb3J0cy5OVU1FUklDXG4gIGVsc2UgaWYgKFJlZ2V4LnRlc3RBbHBoYW51bWVyaWMoZGF0YVN0cikpIHJldHVybiBleHBvcnRzLkFMUEhBTlVNRVJJQ1xuICBlbHNlIGlmIChSZWdleC50ZXN0S2FuamkoZGF0YVN0cikpIHJldHVybiBleHBvcnRzLktBTkpJXG4gIGVsc2UgcmV0dXJuIGV4cG9ydHMuQllURVxufVxuXG4vKipcbiAqIFJldHVybiBtb2RlIG5hbWUgYXMgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtNb2RlfSBtb2RlIE1vZGUgb2JqZWN0XG4gKiBAcmV0dXJucyB7U3RyaW5nfSAgTW9kZSBuYW1lXG4gKi9cbmV4cG9ydHMudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAobW9kZSkge1xuICBpZiAobW9kZSAmJiBtb2RlLmlkKSByZXR1cm4gbW9kZS5pZFxuICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbW9kZScpXG59XG5cbi8qKlxuICogQ2hlY2sgaWYgaW5wdXQgcGFyYW0gaXMgYSB2YWxpZCBtb2RlIG9iamVjdFxuICpcbiAqIEBwYXJhbSAgIHtNb2RlfSAgICBtb2RlIE1vZGUgb2JqZWN0XG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB2YWxpZCBtb2RlLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0cy5pc1ZhbGlkID0gZnVuY3Rpb24gaXNWYWxpZCAobW9kZSkge1xuICByZXR1cm4gbW9kZSAmJiBtb2RlLmJpdCAmJiBtb2RlLmNjQml0c1xufVxuXG4vKipcbiAqIEdldCBtb2RlIG9iamVjdCBmcm9tIGl0cyBuYW1lXG4gKlxuICogQHBhcmFtICAge1N0cmluZ30gc3RyaW5nIE1vZGUgbmFtZVxuICogQHJldHVybnMge01vZGV9ICAgICAgICAgIE1vZGUgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHN0cmluZykge1xuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcmFtIGlzIG5vdCBhIHN0cmluZycpXG4gIH1cblxuICBjb25zdCBsY1N0ciA9IHN0cmluZy50b0xvd2VyQ2FzZSgpXG5cbiAgc3dpdGNoIChsY1N0cikge1xuICAgIGNhc2UgJ251bWVyaWMnOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuTlVNRVJJQ1xuICAgIGNhc2UgJ2FscGhhbnVtZXJpYyc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5BTFBIQU5VTUVSSUNcbiAgICBjYXNlICdrYW5qaSc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5LQU5KSVxuICAgIGNhc2UgJ2J5dGUnOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuQllURVxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gbW9kZTogJyArIHN0cmluZylcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgbW9kZSBmcm9tIGEgdmFsdWUuXG4gKiBJZiB2YWx1ZSBpcyBub3QgYSB2YWxpZCBtb2RlLCByZXR1cm5zIGRlZmF1bHRWYWx1ZVxuICpcbiAqIEBwYXJhbSAge01vZGV8U3RyaW5nfSB2YWx1ZSAgICAgICAgRW5jb2RpbmcgbW9kZVxuICogQHBhcmFtICB7TW9kZX0gICAgICAgIGRlZmF1bHRWYWx1ZSBGYWxsYmFjayB2YWx1ZVxuICogQHJldHVybiB7TW9kZX0gICAgICAgICAgICAgICAgICAgICBFbmNvZGluZyBtb2RlXG4gKi9cbmV4cG9ydHMuZnJvbSA9IGZ1bmN0aW9uIGZyb20gKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKGV4cG9ydHMuaXNWYWxpZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGZyb21TdHJpbmcodmFsdWUpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIH1cbn1cbiIsImNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5jb25zdCBFQ0NvZGUgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tY29kZScpXG5jb25zdCBFQ0xldmVsID0gcmVxdWlyZSgnLi9lcnJvci1jb3JyZWN0aW9uLWxldmVsJylcbmNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxuY29uc3QgVmVyc2lvbkNoZWNrID0gcmVxdWlyZSgnLi92ZXJzaW9uLWNoZWNrJylcblxuLy8gR2VuZXJhdG9yIHBvbHlub21pYWwgdXNlZCB0byBlbmNvZGUgdmVyc2lvbiBpbmZvcm1hdGlvblxuY29uc3QgRzE4ID0gKDEgPDwgMTIpIHwgKDEgPDwgMTEpIHwgKDEgPDwgMTApIHwgKDEgPDwgOSkgfCAoMSA8PCA4KSB8ICgxIDw8IDUpIHwgKDEgPDwgMikgfCAoMSA8PCAwKVxuY29uc3QgRzE4X0JDSCA9IFV0aWxzLmdldEJDSERpZ2l0KEcxOClcblxuZnVuY3Rpb24gZ2V0QmVzdFZlcnNpb25Gb3JEYXRhTGVuZ3RoIChtb2RlLCBsZW5ndGgsIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XG4gIGZvciAobGV0IGN1cnJlbnRWZXJzaW9uID0gMTsgY3VycmVudFZlcnNpb24gPD0gNDA7IGN1cnJlbnRWZXJzaW9uKyspIHtcbiAgICBpZiAobGVuZ3RoIDw9IGV4cG9ydHMuZ2V0Q2FwYWNpdHkoY3VycmVudFZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtb2RlKSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRWZXJzaW9uXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZFxufVxuXG5mdW5jdGlvbiBnZXRSZXNlcnZlZEJpdHNDb3VudCAobW9kZSwgdmVyc2lvbikge1xuICAvLyBDaGFyYWN0ZXIgY291bnQgaW5kaWNhdG9yICsgbW9kZSBpbmRpY2F0b3IgYml0c1xuICByZXR1cm4gTW9kZS5nZXRDaGFyQ291bnRJbmRpY2F0b3IobW9kZSwgdmVyc2lvbikgKyA0XG59XG5cbmZ1bmN0aW9uIGdldFRvdGFsQml0c0Zyb21EYXRhQXJyYXkgKHNlZ21lbnRzLCB2ZXJzaW9uKSB7XG4gIGxldCB0b3RhbEJpdHMgPSAwXG5cbiAgc2VnbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgIGNvbnN0IHJlc2VydmVkQml0cyA9IGdldFJlc2VydmVkQml0c0NvdW50KGRhdGEubW9kZSwgdmVyc2lvbilcbiAgICB0b3RhbEJpdHMgKz0gcmVzZXJ2ZWRCaXRzICsgZGF0YS5nZXRCaXRzTGVuZ3RoKClcbiAgfSlcblxuICByZXR1cm4gdG90YWxCaXRzXG59XG5cbmZ1bmN0aW9uIGdldEJlc3RWZXJzaW9uRm9yTWl4ZWREYXRhIChzZWdtZW50cywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcbiAgZm9yIChsZXQgY3VycmVudFZlcnNpb24gPSAxOyBjdXJyZW50VmVyc2lvbiA8PSA0MDsgY3VycmVudFZlcnNpb24rKykge1xuICAgIGNvbnN0IGxlbmd0aCA9IGdldFRvdGFsQml0c0Zyb21EYXRhQXJyYXkoc2VnbWVudHMsIGN1cnJlbnRWZXJzaW9uKVxuICAgIGlmIChsZW5ndGggPD0gZXhwb3J0cy5nZXRDYXBhY2l0eShjdXJyZW50VmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIE1vZGUuTUlYRUQpKSB7XG4gICAgICByZXR1cm4gY3VycmVudFZlcnNpb25cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkXG59XG5cbi8qKlxuICogUmV0dXJucyB2ZXJzaW9uIG51bWJlciBmcm9tIGEgdmFsdWUuXG4gKiBJZiB2YWx1ZSBpcyBub3QgYSB2YWxpZCB2ZXJzaW9uLCByZXR1cm5zIGRlZmF1bHRWYWx1ZVxuICpcbiAqIEBwYXJhbSAge051bWJlcnxTdHJpbmd9IHZhbHVlICAgICAgICBRUiBDb2RlIHZlcnNpb25cbiAqIEBwYXJhbSAge051bWJlcn0gICAgICAgIGRlZmF1bHRWYWx1ZSBGYWxsYmFjayB2YWx1ZVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvbiBudW1iZXJcbiAqL1xuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSAodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAoVmVyc2lvbkNoZWNrLmlzVmFsaWQodmFsdWUpKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KHZhbHVlLCAxMClcbiAgfVxuXG4gIHJldHVybiBkZWZhdWx0VmFsdWVcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGhvdyBtdWNoIGRhdGEgY2FuIGJlIHN0b3JlZCB3aXRoIHRoZSBzcGVjaWZpZWQgUVIgY29kZSB2ZXJzaW9uXG4gKiBhbmQgZXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uICgxLTQwKVxuICogQHBhcmFtICB7TnVtYmVyfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKiBAcGFyYW0gIHtNb2RlfSAgIG1vZGUgICAgICAgICAgICAgICAgIERhdGEgbW9kZVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgICBRdWFudGl0eSBvZiBzdG9yYWJsZSBkYXRhXG4gKi9cbmV4cG9ydHMuZ2V0Q2FwYWNpdHkgPSBmdW5jdGlvbiBnZXRDYXBhY2l0eSAodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1vZGUpIHtcbiAgaWYgKCFWZXJzaW9uQ2hlY2suaXNWYWxpZCh2ZXJzaW9uKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBRUiBDb2RlIHZlcnNpb24nKVxuICB9XG5cbiAgLy8gVXNlIEJ5dGUgbW9kZSBhcyBkZWZhdWx0XG4gIGlmICh0eXBlb2YgbW9kZSA9PT0gJ3VuZGVmaW5lZCcpIG1vZGUgPSBNb2RlLkJZVEVcblxuICAvLyBUb3RhbCBjb2Rld29yZHMgZm9yIHRoaXMgUVIgY29kZSB2ZXJzaW9uIChEYXRhICsgRXJyb3IgY29ycmVjdGlvbilcbiAgY29uc3QgdG90YWxDb2Rld29yZHMgPSBVdGlscy5nZXRTeW1ib2xUb3RhbENvZGV3b3Jkcyh2ZXJzaW9uKVxuXG4gIC8vIFRvdGFsIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3Jkc1xuICBjb25zdCBlY1RvdGFsQ29kZXdvcmRzID0gRUNDb2RlLmdldFRvdGFsQ29kZXdvcmRzQ291bnQodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXG5cbiAgLy8gVG90YWwgbnVtYmVyIG9mIGRhdGEgY29kZXdvcmRzXG4gIGNvbnN0IGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMgPSAodG90YWxDb2Rld29yZHMgLSBlY1RvdGFsQ29kZXdvcmRzKSAqIDhcblxuICBpZiAobW9kZSA9PT0gTW9kZS5NSVhFRCkgcmV0dXJuIGRhdGFUb3RhbENvZGV3b3Jkc0JpdHNcblxuICBjb25zdCB1c2FibGVCaXRzID0gZGF0YVRvdGFsQ29kZXdvcmRzQml0cyAtIGdldFJlc2VydmVkQml0c0NvdW50KG1vZGUsIHZlcnNpb24pXG5cbiAgLy8gUmV0dXJuIG1heCBudW1iZXIgb2Ygc3RvcmFibGUgY29kZXdvcmRzXG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgTW9kZS5OVU1FUklDOlxuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKHVzYWJsZUJpdHMgLyAxMCkgKiAzKVxuXG4gICAgY2FzZSBNb2RlLkFMUEhBTlVNRVJJQzpcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKCh1c2FibGVCaXRzIC8gMTEpICogMilcblxuICAgIGNhc2UgTW9kZS5LQU5KSTpcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKHVzYWJsZUJpdHMgLyAxMylcblxuICAgIGNhc2UgTW9kZS5CWVRFOlxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcih1c2FibGVCaXRzIC8gOClcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gdmVyc2lvbiBuZWVkZWQgdG8gY29udGFpbiB0aGUgYW1vdW50IG9mIGRhdGFcbiAqXG4gKiBAcGFyYW0gIHtTZWdtZW50fSBkYXRhICAgICAgICAgICAgICAgICAgICBTZWdtZW50IG9mIGRhdGFcbiAqIEBwYXJhbSAge051bWJlcn0gW2Vycm9yQ29ycmVjdGlvbkxldmVsPUhdIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEBwYXJhbSAge01vZGV9IG1vZGUgICAgICAgICAgICAgICAgICAgICAgIERhdGEgbW9kZVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXG4gKi9cbmV4cG9ydHMuZ2V0QmVzdFZlcnNpb25Gb3JEYXRhID0gZnVuY3Rpb24gZ2V0QmVzdFZlcnNpb25Gb3JEYXRhIChkYXRhLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xuICBsZXQgc2VnXG5cbiAgY29uc3QgZWNsID0gRUNMZXZlbC5mcm9tKGVycm9yQ29ycmVjdGlvbkxldmVsLCBFQ0xldmVsLk0pXG5cbiAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICBpZiAoZGF0YS5sZW5ndGggPiAxKSB7XG4gICAgICByZXR1cm4gZ2V0QmVzdFZlcnNpb25Gb3JNaXhlZERhdGEoZGF0YSwgZWNsKVxuICAgIH1cblxuICAgIGlmIChkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBzZWcgPSBkYXRhWzBdXG4gIH0gZWxzZSB7XG4gICAgc2VnID0gZGF0YVxuICB9XG5cbiAgcmV0dXJuIGdldEJlc3RWZXJzaW9uRm9yRGF0YUxlbmd0aChzZWcubW9kZSwgc2VnLmdldExlbmd0aCgpLCBlY2wpXG59XG5cbi8qKlxuICogUmV0dXJucyB2ZXJzaW9uIGluZm9ybWF0aW9uIHdpdGggcmVsYXRpdmUgZXJyb3IgY29ycmVjdGlvbiBiaXRzXG4gKlxuICogVGhlIHZlcnNpb24gaW5mb3JtYXRpb24gaXMgaW5jbHVkZWQgaW4gUVIgQ29kZSBzeW1ib2xzIG9mIHZlcnNpb24gNyBvciBsYXJnZXIuXG4gKiBJdCBjb25zaXN0cyBvZiBhbiAxOC1iaXQgc2VxdWVuY2UgY29udGFpbmluZyA2IGRhdGEgYml0cyxcbiAqIHdpdGggMTIgZXJyb3IgY29ycmVjdGlvbiBiaXRzIGNhbGN1bGF0ZWQgdXNpbmcgdGhlICgxOCwgNikgR29sYXkgY29kZS5cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgRW5jb2RlZCB2ZXJzaW9uIGluZm8gYml0c1xuICovXG5leHBvcnRzLmdldEVuY29kZWRCaXRzID0gZnVuY3Rpb24gZ2V0RW5jb2RlZEJpdHMgKHZlcnNpb24pIHtcbiAgaWYgKCFWZXJzaW9uQ2hlY2suaXNWYWxpZCh2ZXJzaW9uKSB8fCB2ZXJzaW9uIDwgNykge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBRUiBDb2RlIHZlcnNpb24nKVxuICB9XG5cbiAgbGV0IGQgPSB2ZXJzaW9uIDw8IDEyXG5cbiAgd2hpbGUgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE4X0JDSCA+PSAwKSB7XG4gICAgZCBePSAoRzE4IDw8IChVdGlscy5nZXRCQ0hEaWdpdChkKSAtIEcxOF9CQ0gpKVxuICB9XG5cbiAgcmV0dXJuICh2ZXJzaW9uIDw8IDEyKSB8IGRcbn1cbiIsImNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5cbmNvbnN0IEcxNSA9ICgxIDw8IDEwKSB8ICgxIDw8IDgpIHwgKDEgPDwgNSkgfCAoMSA8PCA0KSB8ICgxIDw8IDIpIHwgKDEgPDwgMSkgfCAoMSA8PCAwKVxuY29uc3QgRzE1X01BU0sgPSAoMSA8PCAxNCkgfCAoMSA8PCAxMikgfCAoMSA8PCAxMCkgfCAoMSA8PCA0KSB8ICgxIDw8IDEpXG5jb25zdCBHMTVfQkNIID0gVXRpbHMuZ2V0QkNIRGlnaXQoRzE1KVxuXG4vKipcbiAqIFJldHVybnMgZm9ybWF0IGluZm9ybWF0aW9uIHdpdGggcmVsYXRpdmUgZXJyb3IgY29ycmVjdGlvbiBiaXRzXG4gKlxuICogVGhlIGZvcm1hdCBpbmZvcm1hdGlvbiBpcyBhIDE1LWJpdCBzZXF1ZW5jZSBjb250YWluaW5nIDUgZGF0YSBiaXRzLFxuICogd2l0aCAxMCBlcnJvciBjb3JyZWN0aW9uIGJpdHMgY2FsY3VsYXRlZCB1c2luZyB0aGUgKDE1LCA1KSBCQ0ggY29kZS5cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEBwYXJhbSAge051bWJlcn0gbWFzayAgICAgICAgICAgICAgICAgTWFzayBwYXR0ZXJuXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgIEVuY29kZWQgZm9ybWF0IGluZm9ybWF0aW9uIGJpdHNcbiAqL1xuZXhwb3J0cy5nZXRFbmNvZGVkQml0cyA9IGZ1bmN0aW9uIGdldEVuY29kZWRCaXRzIChlcnJvckNvcnJlY3Rpb25MZXZlbCwgbWFzaykge1xuICBjb25zdCBkYXRhID0gKChlcnJvckNvcnJlY3Rpb25MZXZlbC5iaXQgPDwgMykgfCBtYXNrKVxuICBsZXQgZCA9IGRhdGEgPDwgMTBcblxuICB3aGlsZSAoVXRpbHMuZ2V0QkNIRGlnaXQoZCkgLSBHMTVfQkNIID49IDApIHtcbiAgICBkIF49IChHMTUgPDwgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE1X0JDSCkpXG4gIH1cblxuICAvLyB4b3IgZmluYWwgZGF0YSB3aXRoIG1hc2sgcGF0dGVybiBpbiBvcmRlciB0byBlbnN1cmUgdGhhdFxuICAvLyBubyBjb21iaW5hdGlvbiBvZiBFcnJvciBDb3JyZWN0aW9uIExldmVsIGFuZCBkYXRhIG1hc2sgcGF0dGVyblxuICAvLyB3aWxsIHJlc3VsdCBpbiBhbiBhbGwtemVybyBkYXRhIHN0cmluZ1xuICByZXR1cm4gKChkYXRhIDw8IDEwKSB8IGQpIF4gRzE1X01BU0tcbn1cbiIsImNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxuXG5mdW5jdGlvbiBOdW1lcmljRGF0YSAoZGF0YSkge1xuICB0aGlzLm1vZGUgPSBNb2RlLk5VTUVSSUNcbiAgdGhpcy5kYXRhID0gZGF0YS50b1N0cmluZygpXG59XG5cbk51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoIChsZW5ndGgpIHtcbiAgcmV0dXJuIDEwICogTWF0aC5mbG9vcihsZW5ndGggLyAzKSArICgobGVuZ3RoICUgMykgPyAoKGxlbmd0aCAlIDMpICogMyArIDEpIDogMClcbn1cblxuTnVtZXJpY0RhdGEucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uIGdldExlbmd0aCAoKSB7XG4gIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoXG59XG5cbk51bWVyaWNEYXRhLnByb3RvdHlwZS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAoKSB7XG4gIHJldHVybiBOdW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoKHRoaXMuZGF0YS5sZW5ndGgpXG59XG5cbk51bWVyaWNEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChiaXRCdWZmZXIpIHtcbiAgbGV0IGksIGdyb3VwLCB2YWx1ZVxuXG4gIC8vIFRoZSBpbnB1dCBkYXRhIHN0cmluZyBpcyBkaXZpZGVkIGludG8gZ3JvdXBzIG9mIHRocmVlIGRpZ2l0cyxcbiAgLy8gYW5kIGVhY2ggZ3JvdXAgaXMgY29udmVydGVkIHRvIGl0cyAxMC1iaXQgYmluYXJ5IGVxdWl2YWxlbnQuXG4gIGZvciAoaSA9IDA7IGkgKyAzIDw9IHRoaXMuZGF0YS5sZW5ndGg7IGkgKz0gMykge1xuICAgIGdyb3VwID0gdGhpcy5kYXRhLnN1YnN0cihpLCAzKVxuICAgIHZhbHVlID0gcGFyc2VJbnQoZ3JvdXAsIDEwKVxuXG4gICAgYml0QnVmZmVyLnB1dCh2YWx1ZSwgMTApXG4gIH1cblxuICAvLyBJZiB0aGUgbnVtYmVyIG9mIGlucHV0IGRpZ2l0cyBpcyBub3QgYW4gZXhhY3QgbXVsdGlwbGUgb2YgdGhyZWUsXG4gIC8vIHRoZSBmaW5hbCBvbmUgb3IgdHdvIGRpZ2l0cyBhcmUgY29udmVydGVkIHRvIDQgb3IgNyBiaXRzIHJlc3BlY3RpdmVseS5cbiAgY29uc3QgcmVtYWluaW5nTnVtID0gdGhpcy5kYXRhLmxlbmd0aCAtIGlcbiAgaWYgKHJlbWFpbmluZ051bSA+IDApIHtcbiAgICBncm91cCA9IHRoaXMuZGF0YS5zdWJzdHIoaSlcbiAgICB2YWx1ZSA9IHBhcnNlSW50KGdyb3VwLCAxMClcblxuICAgIGJpdEJ1ZmZlci5wdXQodmFsdWUsIHJlbWFpbmluZ051bSAqIDMgKyAxKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTnVtZXJpY0RhdGFcbiIsImNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxuXG4vKipcbiAqIEFycmF5IG9mIGNoYXJhY3RlcnMgYXZhaWxhYmxlIGluIGFscGhhbnVtZXJpYyBtb2RlXG4gKlxuICogQXMgcGVyIFFSIENvZGUgc3BlY2lmaWNhdGlvbiwgdG8gZWFjaCBjaGFyYWN0ZXJcbiAqIGlzIGFzc2lnbmVkIGEgdmFsdWUgZnJvbSAwIHRvIDQ0IHdoaWNoIGluIHRoaXMgY2FzZSBjb2luY2lkZXNcbiAqIHdpdGggdGhlIGFycmF5IGluZGV4XG4gKlxuICogQHR5cGUge0FycmF5fVxuICovXG5jb25zdCBBTFBIQV9OVU1fQ0hBUlMgPSBbXG4gICcwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JyxcbiAgJ0EnLCAnQicsICdDJywgJ0QnLCAnRScsICdGJywgJ0cnLCAnSCcsICdJJywgJ0onLCAnSycsICdMJywgJ00nLFxuICAnTicsICdPJywgJ1AnLCAnUScsICdSJywgJ1MnLCAnVCcsICdVJywgJ1YnLCAnVycsICdYJywgJ1knLCAnWicsXG4gICcgJywgJyQnLCAnJScsICcqJywgJysnLCAnLScsICcuJywgJy8nLCAnOidcbl1cblxuZnVuY3Rpb24gQWxwaGFudW1lcmljRGF0YSAoZGF0YSkge1xuICB0aGlzLm1vZGUgPSBNb2RlLkFMUEhBTlVNRVJJQ1xuICB0aGlzLmRhdGEgPSBkYXRhXG59XG5cbkFscGhhbnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKGxlbmd0aCkge1xuICByZXR1cm4gMTEgKiBNYXRoLmZsb29yKGxlbmd0aCAvIDIpICsgNiAqIChsZW5ndGggJSAyKVxufVxuXG5BbHBoYW51bWVyaWNEYXRhLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbiBnZXRMZW5ndGggKCkge1xuICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aFxufVxuXG5BbHBoYW51bWVyaWNEYXRhLnByb3RvdHlwZS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAoKSB7XG4gIHJldHVybiBBbHBoYW51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGgodGhpcy5kYXRhLmxlbmd0aClcbn1cblxuQWxwaGFudW1lcmljRGF0YS5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiB3cml0ZSAoYml0QnVmZmVyKSB7XG4gIGxldCBpXG5cbiAgLy8gSW5wdXQgZGF0YSBjaGFyYWN0ZXJzIGFyZSBkaXZpZGVkIGludG8gZ3JvdXBzIG9mIHR3byBjaGFyYWN0ZXJzXG4gIC8vIGFuZCBlbmNvZGVkIGFzIDExLWJpdCBiaW5hcnkgY29kZXMuXG4gIGZvciAoaSA9IDA7IGkgKyAyIDw9IHRoaXMuZGF0YS5sZW5ndGg7IGkgKz0gMikge1xuICAgIC8vIFRoZSBjaGFyYWN0ZXIgdmFsdWUgb2YgdGhlIGZpcnN0IGNoYXJhY3RlciBpcyBtdWx0aXBsaWVkIGJ5IDQ1XG4gICAgbGV0IHZhbHVlID0gQUxQSEFfTlVNX0NIQVJTLmluZGV4T2YodGhpcy5kYXRhW2ldKSAqIDQ1XG5cbiAgICAvLyBUaGUgY2hhcmFjdGVyIHZhbHVlIG9mIHRoZSBzZWNvbmQgZGlnaXQgaXMgYWRkZWQgdG8gdGhlIHByb2R1Y3RcbiAgICB2YWx1ZSArPSBBTFBIQV9OVU1fQ0hBUlMuaW5kZXhPZih0aGlzLmRhdGFbaSArIDFdKVxuXG4gICAgLy8gVGhlIHN1bSBpcyB0aGVuIHN0b3JlZCBhcyAxMS1iaXQgYmluYXJ5IG51bWJlclxuICAgIGJpdEJ1ZmZlci5wdXQodmFsdWUsIDExKVxuICB9XG5cbiAgLy8gSWYgdGhlIG51bWJlciBvZiBpbnB1dCBkYXRhIGNoYXJhY3RlcnMgaXMgbm90IGEgbXVsdGlwbGUgb2YgdHdvLFxuICAvLyB0aGUgY2hhcmFjdGVyIHZhbHVlIG9mIHRoZSBmaW5hbCBjaGFyYWN0ZXIgaXMgZW5jb2RlZCBhcyBhIDYtYml0IGJpbmFyeSBudW1iZXIuXG4gIGlmICh0aGlzLmRhdGEubGVuZ3RoICUgMikge1xuICAgIGJpdEJ1ZmZlci5wdXQoQUxQSEFfTlVNX0NIQVJTLmluZGV4T2YodGhpcy5kYXRhW2ldKSwgNilcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFscGhhbnVtZXJpY0RhdGFcbiIsImNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxuXG5mdW5jdGlvbiBCeXRlRGF0YSAoZGF0YSkge1xuICB0aGlzLm1vZGUgPSBNb2RlLkJZVEVcbiAgaWYgKHR5cGVvZiAoZGF0YSkgPT09ICdzdHJpbmcnKSB7XG4gICAgdGhpcy5kYXRhID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKGRhdGEpXG4gIH0gZWxzZSB7XG4gICAgdGhpcy5kYXRhID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSlcbiAgfVxufVxuXG5CeXRlRGF0YS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAobGVuZ3RoKSB7XG4gIHJldHVybiBsZW5ndGggKiA4XG59XG5cbkJ5dGVEYXRhLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbiBnZXRMZW5ndGggKCkge1xuICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aFxufVxuXG5CeXRlRGF0YS5wcm90b3R5cGUuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKCkge1xuICByZXR1cm4gQnl0ZURhdGEuZ2V0Qml0c0xlbmd0aCh0aGlzLmRhdGEubGVuZ3RoKVxufVxuXG5CeXRlRGF0YS5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoYml0QnVmZmVyKSB7XG4gIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5kYXRhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGJpdEJ1ZmZlci5wdXQodGhpcy5kYXRhW2ldLCA4KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnl0ZURhdGFcbiIsImNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxuY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcblxuZnVuY3Rpb24gS2FuamlEYXRhIChkYXRhKSB7XG4gIHRoaXMubW9kZSA9IE1vZGUuS0FOSklcbiAgdGhpcy5kYXRhID0gZGF0YVxufVxuXG5LYW5qaURhdGEuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKGxlbmd0aCkge1xuICByZXR1cm4gbGVuZ3RoICogMTNcbn1cblxuS2FuamlEYXRhLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbiBnZXRMZW5ndGggKCkge1xuICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aFxufVxuXG5LYW5qaURhdGEucHJvdG90eXBlLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoICgpIHtcbiAgcmV0dXJuIEthbmppRGF0YS5nZXRCaXRzTGVuZ3RoKHRoaXMuZGF0YS5sZW5ndGgpXG59XG5cbkthbmppRGF0YS5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoYml0QnVmZmVyKSB7XG4gIGxldCBpXG5cbiAgLy8gSW4gdGhlIFNoaWZ0IEpJUyBzeXN0ZW0sIEthbmppIGNoYXJhY3RlcnMgYXJlIHJlcHJlc2VudGVkIGJ5IGEgdHdvIGJ5dGUgY29tYmluYXRpb24uXG4gIC8vIFRoZXNlIGJ5dGUgdmFsdWVzIGFyZSBzaGlmdGVkIGZyb20gdGhlIEpJUyBYIDAyMDggdmFsdWVzLlxuICAvLyBKSVMgWCAwMjA4IGdpdmVzIGRldGFpbHMgb2YgdGhlIHNoaWZ0IGNvZGVkIHJlcHJlc2VudGF0aW9uLlxuICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHZhbHVlID0gVXRpbHMudG9TSklTKHRoaXMuZGF0YVtpXSlcblxuICAgIC8vIEZvciBjaGFyYWN0ZXJzIHdpdGggU2hpZnQgSklTIHZhbHVlcyBmcm9tIDB4ODE0MCB0byAweDlGRkM6XG4gICAgaWYgKHZhbHVlID49IDB4ODE0MCAmJiB2YWx1ZSA8PSAweDlGRkMpIHtcbiAgICAgIC8vIFN1YnRyYWN0IDB4ODE0MCBmcm9tIFNoaWZ0IEpJUyB2YWx1ZVxuICAgICAgdmFsdWUgLT0gMHg4MTQwXG5cbiAgICAvLyBGb3IgY2hhcmFjdGVycyB3aXRoIFNoaWZ0IEpJUyB2YWx1ZXMgZnJvbSAweEUwNDAgdG8gMHhFQkJGXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA+PSAweEUwNDAgJiYgdmFsdWUgPD0gMHhFQkJGKSB7XG4gICAgICAvLyBTdWJ0cmFjdCAweEMxNDAgZnJvbSBTaGlmdCBKSVMgdmFsdWVcbiAgICAgIHZhbHVlIC09IDB4QzE0MFxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdJbnZhbGlkIFNKSVMgY2hhcmFjdGVyOiAnICsgdGhpcy5kYXRhW2ldICsgJ1xcbicgK1xuICAgICAgICAnTWFrZSBzdXJlIHlvdXIgY2hhcnNldCBpcyBVVEYtOCcpXG4gICAgfVxuXG4gICAgLy8gTXVsdGlwbHkgbW9zdCBzaWduaWZpY2FudCBieXRlIG9mIHJlc3VsdCBieSAweEMwXG4gICAgLy8gYW5kIGFkZCBsZWFzdCBzaWduaWZpY2FudCBieXRlIHRvIHByb2R1Y3RcbiAgICB2YWx1ZSA9ICgoKHZhbHVlID4+PiA4KSAmIDB4ZmYpICogMHhDMCkgKyAodmFsdWUgJiAweGZmKVxuXG4gICAgLy8gQ29udmVydCByZXN1bHQgdG8gYSAxMy1iaXQgYmluYXJ5IHN0cmluZ1xuICAgIGJpdEJ1ZmZlci5wdXQodmFsdWUsIDEzKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gS2FuamlEYXRhXG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIENyZWF0ZWQgMjAwOC0wOC0xOS5cbiAqXG4gKiBEaWprc3RyYSBwYXRoLWZpbmRpbmcgZnVuY3Rpb25zLiBBZGFwdGVkIGZyb20gdGhlIERpamtzdGFyIFB5dGhvbiBwcm9qZWN0LlxuICpcbiAqIENvcHlyaWdodCAoQykgMjAwOFxuICogICBXeWF0dCBCYWxkd2luIDxzZWxmQHd5YXR0YmFsZHdpbi5jb20+XG4gKiAgIEFsbCByaWdodHMgcmVzZXJ2ZWRcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKlxuICogICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuICogVEhFIFNPRlRXQVJFLlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xudmFyIGRpamtzdHJhID0ge1xuICBzaW5nbGVfc291cmNlX3Nob3J0ZXN0X3BhdGhzOiBmdW5jdGlvbihncmFwaCwgcywgZCkge1xuICAgIC8vIFByZWRlY2Vzc29yIG1hcCBmb3IgZWFjaCBub2RlIHRoYXQgaGFzIGJlZW4gZW5jb3VudGVyZWQuXG4gICAgLy8gbm9kZSBJRCA9PiBwcmVkZWNlc3NvciBub2RlIElEXG4gICAgdmFyIHByZWRlY2Vzc29ycyA9IHt9O1xuXG4gICAgLy8gQ29zdHMgb2Ygc2hvcnRlc3QgcGF0aHMgZnJvbSBzIHRvIGFsbCBub2RlcyBlbmNvdW50ZXJlZC5cbiAgICAvLyBub2RlIElEID0+IGNvc3RcbiAgICB2YXIgY29zdHMgPSB7fTtcbiAgICBjb3N0c1tzXSA9IDA7XG5cbiAgICAvLyBDb3N0cyBvZiBzaG9ydGVzdCBwYXRocyBmcm9tIHMgdG8gYWxsIG5vZGVzIGVuY291bnRlcmVkOyBkaWZmZXJzIGZyb21cbiAgICAvLyBgY29zdHNgIGluIHRoYXQgaXQgcHJvdmlkZXMgZWFzeSBhY2Nlc3MgdG8gdGhlIG5vZGUgdGhhdCBjdXJyZW50bHkgaGFzXG4gICAgLy8gdGhlIGtub3duIHNob3J0ZXN0IHBhdGggZnJvbSBzLlxuICAgIC8vIFhYWDogRG8gd2UgYWN0dWFsbHkgbmVlZCBib3RoIGBjb3N0c2AgYW5kIGBvcGVuYD9cbiAgICB2YXIgb3BlbiA9IGRpamtzdHJhLlByaW9yaXR5UXVldWUubWFrZSgpO1xuICAgIG9wZW4ucHVzaChzLCAwKTtcblxuICAgIHZhciBjbG9zZXN0LFxuICAgICAgICB1LCB2LFxuICAgICAgICBjb3N0X29mX3NfdG9fdSxcbiAgICAgICAgYWRqYWNlbnRfbm9kZXMsXG4gICAgICAgIGNvc3Rfb2ZfZSxcbiAgICAgICAgY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2UsXG4gICAgICAgIGNvc3Rfb2Zfc190b192LFxuICAgICAgICBmaXJzdF92aXNpdDtcbiAgICB3aGlsZSAoIW9wZW4uZW1wdHkoKSkge1xuICAgICAgLy8gSW4gdGhlIG5vZGVzIHJlbWFpbmluZyBpbiBncmFwaCB0aGF0IGhhdmUgYSBrbm93biBjb3N0IGZyb20gcyxcbiAgICAgIC8vIGZpbmQgdGhlIG5vZGUsIHUsIHRoYXQgY3VycmVudGx5IGhhcyB0aGUgc2hvcnRlc3QgcGF0aCBmcm9tIHMuXG4gICAgICBjbG9zZXN0ID0gb3Blbi5wb3AoKTtcbiAgICAgIHUgPSBjbG9zZXN0LnZhbHVlO1xuICAgICAgY29zdF9vZl9zX3RvX3UgPSBjbG9zZXN0LmNvc3Q7XG5cbiAgICAgIC8vIEdldCBub2RlcyBhZGphY2VudCB0byB1Li4uXG4gICAgICBhZGphY2VudF9ub2RlcyA9IGdyYXBoW3VdIHx8IHt9O1xuXG4gICAgICAvLyAuLi5hbmQgZXhwbG9yZSB0aGUgZWRnZXMgdGhhdCBjb25uZWN0IHUgdG8gdGhvc2Ugbm9kZXMsIHVwZGF0aW5nXG4gICAgICAvLyB0aGUgY29zdCBvZiB0aGUgc2hvcnRlc3QgcGF0aHMgdG8gYW55IG9yIGFsbCBvZiB0aG9zZSBub2RlcyBhc1xuICAgICAgLy8gbmVjZXNzYXJ5LiB2IGlzIHRoZSBub2RlIGFjcm9zcyB0aGUgY3VycmVudCBlZGdlIGZyb20gdS5cbiAgICAgIGZvciAodiBpbiBhZGphY2VudF9ub2Rlcykge1xuICAgICAgICBpZiAoYWRqYWNlbnRfbm9kZXMuaGFzT3duUHJvcGVydHkodikpIHtcbiAgICAgICAgICAvLyBHZXQgdGhlIGNvc3Qgb2YgdGhlIGVkZ2UgcnVubmluZyBmcm9tIHUgdG8gdi5cbiAgICAgICAgICBjb3N0X29mX2UgPSBhZGphY2VudF9ub2Rlc1t2XTtcblxuICAgICAgICAgIC8vIENvc3Qgb2YgcyB0byB1IHBsdXMgdGhlIGNvc3Qgb2YgdSB0byB2IGFjcm9zcyBlLS10aGlzIGlzICphKlxuICAgICAgICAgIC8vIGNvc3QgZnJvbSBzIHRvIHYgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBsZXNzIHRoYW4gdGhlIGN1cnJlbnRcbiAgICAgICAgICAvLyBrbm93biBjb3N0IHRvIHYuXG4gICAgICAgICAgY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2UgPSBjb3N0X29mX3NfdG9fdSArIGNvc3Rfb2ZfZTtcblxuICAgICAgICAgIC8vIElmIHdlIGhhdmVuJ3QgdmlzaXRlZCB2IHlldCBPUiBpZiB0aGUgY3VycmVudCBrbm93biBjb3N0IGZyb20gcyB0b1xuICAgICAgICAgIC8vIHYgaXMgZ3JlYXRlciB0aGFuIHRoZSBuZXcgY29zdCB3ZSBqdXN0IGZvdW5kIChjb3N0IG9mIHMgdG8gdSBwbHVzXG4gICAgICAgICAgLy8gY29zdCBvZiB1IHRvIHYgYWNyb3NzIGUpLCB1cGRhdGUgdidzIGNvc3QgaW4gdGhlIGNvc3QgbGlzdCBhbmRcbiAgICAgICAgICAvLyB1cGRhdGUgdidzIHByZWRlY2Vzc29yIGluIHRoZSBwcmVkZWNlc3NvciBsaXN0IChpdCdzIG5vdyB1KS5cbiAgICAgICAgICBjb3N0X29mX3NfdG9fdiA9IGNvc3RzW3ZdO1xuICAgICAgICAgIGZpcnN0X3Zpc2l0ID0gKHR5cGVvZiBjb3N0c1t2XSA9PT0gJ3VuZGVmaW5lZCcpO1xuICAgICAgICAgIGlmIChmaXJzdF92aXNpdCB8fCBjb3N0X29mX3NfdG9fdiA+IGNvc3Rfb2Zfc190b191X3BsdXNfY29zdF9vZl9lKSB7XG4gICAgICAgICAgICBjb3N0c1t2XSA9IGNvc3Rfb2Zfc190b191X3BsdXNfY29zdF9vZl9lO1xuICAgICAgICAgICAgb3Blbi5wdXNoKHYsIGNvc3Rfb2Zfc190b191X3BsdXNfY29zdF9vZl9lKTtcbiAgICAgICAgICAgIHByZWRlY2Vzc29yc1t2XSA9IHU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBkICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29zdHNbZF0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2YXIgbXNnID0gWydDb3VsZCBub3QgZmluZCBhIHBhdGggZnJvbSAnLCBzLCAnIHRvICcsIGQsICcuJ10uam9pbignJyk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJlZGVjZXNzb3JzO1xuICB9LFxuXG4gIGV4dHJhY3Rfc2hvcnRlc3RfcGF0aF9mcm9tX3ByZWRlY2Vzc29yX2xpc3Q6IGZ1bmN0aW9uKHByZWRlY2Vzc29ycywgZCkge1xuICAgIHZhciBub2RlcyA9IFtdO1xuICAgIHZhciB1ID0gZDtcbiAgICB2YXIgcHJlZGVjZXNzb3I7XG4gICAgd2hpbGUgKHUpIHtcbiAgICAgIG5vZGVzLnB1c2godSk7XG4gICAgICBwcmVkZWNlc3NvciA9IHByZWRlY2Vzc29yc1t1XTtcbiAgICAgIHUgPSBwcmVkZWNlc3NvcnNbdV07XG4gICAgfVxuICAgIG5vZGVzLnJldmVyc2UoKTtcbiAgICByZXR1cm4gbm9kZXM7XG4gIH0sXG5cbiAgZmluZF9wYXRoOiBmdW5jdGlvbihncmFwaCwgcywgZCkge1xuICAgIHZhciBwcmVkZWNlc3NvcnMgPSBkaWprc3RyYS5zaW5nbGVfc291cmNlX3Nob3J0ZXN0X3BhdGhzKGdyYXBoLCBzLCBkKTtcbiAgICByZXR1cm4gZGlqa3N0cmEuZXh0cmFjdF9zaG9ydGVzdF9wYXRoX2Zyb21fcHJlZGVjZXNzb3JfbGlzdChcbiAgICAgIHByZWRlY2Vzc29ycywgZCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEEgdmVyeSBuYWl2ZSBwcmlvcml0eSBxdWV1ZSBpbXBsZW1lbnRhdGlvbi5cbiAgICovXG4gIFByaW9yaXR5UXVldWU6IHtcbiAgICBtYWtlOiBmdW5jdGlvbiAob3B0cykge1xuICAgICAgdmFyIFQgPSBkaWprc3RyYS5Qcmlvcml0eVF1ZXVlLFxuICAgICAgICAgIHQgPSB7fSxcbiAgICAgICAgICBrZXk7XG4gICAgICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgICAgIGZvciAoa2V5IGluIFQpIHtcbiAgICAgICAgaWYgKFQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIHRba2V5XSA9IFRba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdC5xdWV1ZSA9IFtdO1xuICAgICAgdC5zb3J0ZXIgPSBvcHRzLnNvcnRlciB8fCBULmRlZmF1bHRfc29ydGVyO1xuICAgICAgcmV0dXJuIHQ7XG4gICAgfSxcblxuICAgIGRlZmF1bHRfc29ydGVyOiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGEuY29zdCAtIGIuY29zdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgbmV3IGl0ZW0gdG8gdGhlIHF1ZXVlIGFuZCBlbnN1cmUgdGhlIGhpZ2hlc3QgcHJpb3JpdHkgZWxlbWVudFxuICAgICAqIGlzIGF0IHRoZSBmcm9udCBvZiB0aGUgcXVldWUuXG4gICAgICovXG4gICAgcHVzaDogZnVuY3Rpb24gKHZhbHVlLCBjb3N0KSB7XG4gICAgICB2YXIgaXRlbSA9IHt2YWx1ZTogdmFsdWUsIGNvc3Q6IGNvc3R9O1xuICAgICAgdGhpcy5xdWV1ZS5wdXNoKGl0ZW0pO1xuICAgICAgdGhpcy5xdWV1ZS5zb3J0KHRoaXMuc29ydGVyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBoaWdoZXN0IHByaW9yaXR5IGVsZW1lbnQgaW4gdGhlIHF1ZXVlLlxuICAgICAqL1xuICAgIHBvcDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWUuc2hpZnQoKTtcbiAgICB9LFxuXG4gICAgZW1wdHk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnF1ZXVlLmxlbmd0aCA9PT0gMDtcbiAgICB9XG4gIH1cbn07XG5cblxuLy8gbm9kZS5qcyBtb2R1bGUgZXhwb3J0c1xuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZGlqa3N0cmE7XG59XG4iLCJjb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcbmNvbnN0IE51bWVyaWNEYXRhID0gcmVxdWlyZSgnLi9udW1lcmljLWRhdGEnKVxuY29uc3QgQWxwaGFudW1lcmljRGF0YSA9IHJlcXVpcmUoJy4vYWxwaGFudW1lcmljLWRhdGEnKVxuY29uc3QgQnl0ZURhdGEgPSByZXF1aXJlKCcuL2J5dGUtZGF0YScpXG5jb25zdCBLYW5qaURhdGEgPSByZXF1aXJlKCcuL2thbmppLWRhdGEnKVxuY29uc3QgUmVnZXggPSByZXF1aXJlKCcuL3JlZ2V4JylcbmNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5jb25zdCBkaWprc3RyYSA9IHJlcXVpcmUoJ2RpamtzdHJhanMnKVxuXG4vKipcbiAqIFJldHVybnMgVVRGOCBieXRlIGxlbmd0aFxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIElucHV0IHN0cmluZ1xuICogQHJldHVybiB7TnVtYmVyfSAgICAgTnVtYmVyIG9mIGJ5dGVcbiAqL1xuZnVuY3Rpb24gZ2V0U3RyaW5nQnl0ZUxlbmd0aCAoc3RyKSB7XG4gIHJldHVybiB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoc3RyKSkubGVuZ3RoXG59XG5cbi8qKlxuICogR2V0IGEgbGlzdCBvZiBzZWdtZW50cyBvZiB0aGUgc3BlY2lmaWVkIG1vZGVcbiAqIGZyb20gYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0gIHtNb2RlfSAgIG1vZGUgU2VnbWVudCBtb2RlXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciAgU3RyaW5nIHRvIHByb2Nlc3NcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKi9cbmZ1bmN0aW9uIGdldFNlZ21lbnRzIChyZWdleCwgbW9kZSwgc3RyKSB7XG4gIGNvbnN0IHNlZ21lbnRzID0gW11cbiAgbGV0IHJlc3VsdFxuXG4gIHdoaWxlICgocmVzdWx0ID0gcmVnZXguZXhlYyhzdHIpKSAhPT0gbnVsbCkge1xuICAgIHNlZ21lbnRzLnB1c2goe1xuICAgICAgZGF0YTogcmVzdWx0WzBdLFxuICAgICAgaW5kZXg6IHJlc3VsdC5pbmRleCxcbiAgICAgIG1vZGU6IG1vZGUsXG4gICAgICBsZW5ndGg6IHJlc3VsdFswXS5sZW5ndGhcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIHNlZ21lbnRzXG59XG5cbi8qKlxuICogRXh0cmFjdHMgYSBzZXJpZXMgb2Ygc2VnbWVudHMgd2l0aCB0aGUgYXBwcm9wcmlhdGVcbiAqIG1vZGVzIGZyb20gYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGFTdHIgSW5wdXQgc3RyaW5nXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxuICovXG5mdW5jdGlvbiBnZXRTZWdtZW50c0Zyb21TdHJpbmcgKGRhdGFTdHIpIHtcbiAgY29uc3QgbnVtU2VncyA9IGdldFNlZ21lbnRzKFJlZ2V4Lk5VTUVSSUMsIE1vZGUuTlVNRVJJQywgZGF0YVN0cilcbiAgY29uc3QgYWxwaGFOdW1TZWdzID0gZ2V0U2VnbWVudHMoUmVnZXguQUxQSEFOVU1FUklDLCBNb2RlLkFMUEhBTlVNRVJJQywgZGF0YVN0cilcbiAgbGV0IGJ5dGVTZWdzXG4gIGxldCBrYW5qaVNlZ3NcblxuICBpZiAoVXRpbHMuaXNLYW5qaU1vZGVFbmFibGVkKCkpIHtcbiAgICBieXRlU2VncyA9IGdldFNlZ21lbnRzKFJlZ2V4LkJZVEUsIE1vZGUuQllURSwgZGF0YVN0cilcbiAgICBrYW5qaVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5LQU5KSSwgTW9kZS5LQU5KSSwgZGF0YVN0cilcbiAgfSBlbHNlIHtcbiAgICBieXRlU2VncyA9IGdldFNlZ21lbnRzKFJlZ2V4LkJZVEVfS0FOSkksIE1vZGUuQllURSwgZGF0YVN0cilcbiAgICBrYW5qaVNlZ3MgPSBbXVxuICB9XG5cbiAgY29uc3Qgc2VncyA9IG51bVNlZ3MuY29uY2F0KGFscGhhTnVtU2VncywgYnl0ZVNlZ3MsIGthbmppU2VncylcblxuICByZXR1cm4gc2Vnc1xuICAgIC5zb3J0KGZ1bmN0aW9uIChzMSwgczIpIHtcbiAgICAgIHJldHVybiBzMS5pbmRleCAtIHMyLmluZGV4XG4gICAgfSlcbiAgICAubWFwKGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRhdGE6IG9iai5kYXRhLFxuICAgICAgICBtb2RlOiBvYmoubW9kZSxcbiAgICAgICAgbGVuZ3RoOiBvYmoubGVuZ3RoXG4gICAgICB9XG4gICAgfSlcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGhvdyBtYW55IGJpdHMgYXJlIG5lZWRlZCB0byBlbmNvZGUgYSBzdHJpbmcgb2ZcbiAqIHNwZWNpZmllZCBsZW5ndGggd2l0aCB0aGUgc3BlY2lmaWVkIG1vZGVcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGxlbmd0aCBTdHJpbmcgbGVuZ3RoXG4gKiBAcGFyYW0gIHtNb2RlfSBtb2RlICAgICBTZWdtZW50IG1vZGVcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgIEJpdCBsZW5ndGhcbiAqL1xuZnVuY3Rpb24gZ2V0U2VnbWVudEJpdHNMZW5ndGggKGxlbmd0aCwgbW9kZSkge1xuICBzd2l0Y2ggKG1vZGUpIHtcbiAgICBjYXNlIE1vZGUuTlVNRVJJQzpcbiAgICAgIHJldHVybiBOdW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcbiAgICBjYXNlIE1vZGUuQUxQSEFOVU1FUklDOlxuICAgICAgcmV0dXJuIEFscGhhbnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aChsZW5ndGgpXG4gICAgY2FzZSBNb2RlLktBTkpJOlxuICAgICAgcmV0dXJuIEthbmppRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcbiAgICBjYXNlIE1vZGUuQllURTpcbiAgICAgIHJldHVybiBCeXRlRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcbiAgfVxufVxuXG4vKipcbiAqIE1lcmdlcyBhZGphY2VudCBzZWdtZW50cyB3aGljaCBoYXZlIHRoZSBzYW1lIG1vZGVcbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gc2VncyBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKi9cbmZ1bmN0aW9uIG1lcmdlU2VnbWVudHMgKHNlZ3MpIHtcbiAgcmV0dXJuIHNlZ3MucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGN1cnIpIHtcbiAgICBjb25zdCBwcmV2U2VnID0gYWNjLmxlbmd0aCAtIDEgPj0gMCA/IGFjY1thY2MubGVuZ3RoIC0gMV0gOiBudWxsXG4gICAgaWYgKHByZXZTZWcgJiYgcHJldlNlZy5tb2RlID09PSBjdXJyLm1vZGUpIHtcbiAgICAgIGFjY1thY2MubGVuZ3RoIC0gMV0uZGF0YSArPSBjdXJyLmRhdGFcbiAgICAgIHJldHVybiBhY2NcbiAgICB9XG5cbiAgICBhY2MucHVzaChjdXJyKVxuICAgIHJldHVybiBhY2NcbiAgfSwgW10pXG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgbGlzdCBvZiBhbGwgcG9zc2libGUgbm9kZXMgY29tYmluYXRpb24gd2hpY2hcbiAqIHdpbGwgYmUgdXNlZCB0byBidWlsZCBhIHNlZ21lbnRzIGdyYXBoLlxuICpcbiAqIE5vZGVzIGFyZSBkaXZpZGVkIGJ5IGdyb3Vwcy4gRWFjaCBncm91cCB3aWxsIGNvbnRhaW4gYSBsaXN0IG9mIGFsbCB0aGUgbW9kZXNcbiAqIGluIHdoaWNoIGlzIHBvc3NpYmxlIHRvIGVuY29kZSB0aGUgZ2l2ZW4gdGV4dC5cbiAqXG4gKiBGb3IgZXhhbXBsZSB0aGUgdGV4dCAnMTIzNDUnIGNhbiBiZSBlbmNvZGVkIGFzIE51bWVyaWMsIEFscGhhbnVtZXJpYyBvciBCeXRlLlxuICogVGhlIGdyb3VwIGZvciAnMTIzNDUnIHdpbGwgY29udGFpbiB0aGVuIDMgb2JqZWN0cywgb25lIGZvciBlYWNoXG4gKiBwb3NzaWJsZSBlbmNvZGluZyBtb2RlLlxuICpcbiAqIEVhY2ggbm9kZSByZXByZXNlbnRzIGEgcG9zc2libGUgc2VnbWVudC5cbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gc2VncyBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkTm9kZXMgKHNlZ3MpIHtcbiAgY29uc3Qgbm9kZXMgPSBbXVxuICBmb3IgKGxldCBpID0gMDsgaSA8IHNlZ3MubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzZWcgPSBzZWdzW2ldXG5cbiAgICBzd2l0Y2ggKHNlZy5tb2RlKSB7XG4gICAgICBjYXNlIE1vZGUuTlVNRVJJQzpcbiAgICAgICAgbm9kZXMucHVzaChbc2VnLFxuICAgICAgICAgIHsgZGF0YTogc2VnLmRhdGEsIG1vZGU6IE1vZGUuQUxQSEFOVU1FUklDLCBsZW5ndGg6IHNlZy5sZW5ndGggfSxcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkJZVEUsIGxlbmd0aDogc2VnLmxlbmd0aCB9XG4gICAgICAgIF0pXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIE1vZGUuQUxQSEFOVU1FUklDOlxuICAgICAgICBub2Rlcy5wdXNoKFtzZWcsXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5CWVRFLCBsZW5ndGg6IHNlZy5sZW5ndGggfVxuICAgICAgICBdKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBNb2RlLktBTkpJOlxuICAgICAgICBub2Rlcy5wdXNoKFtzZWcsXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5CWVRFLCBsZW5ndGg6IGdldFN0cmluZ0J5dGVMZW5ndGgoc2VnLmRhdGEpIH1cbiAgICAgICAgXSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgTW9kZS5CWVRFOlxuICAgICAgICBub2Rlcy5wdXNoKFtcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkJZVEUsIGxlbmd0aDogZ2V0U3RyaW5nQnl0ZUxlbmd0aChzZWcuZGF0YSkgfVxuICAgICAgICBdKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBub2Rlc1xufVxuXG4vKipcbiAqIEJ1aWxkcyBhIGdyYXBoIGZyb20gYSBsaXN0IG9mIG5vZGVzLlxuICogQWxsIHNlZ21lbnRzIGluIGVhY2ggbm9kZSBncm91cCB3aWxsIGJlIGNvbm5lY3RlZCB3aXRoIGFsbCB0aGUgc2VnbWVudHMgb2ZcbiAqIHRoZSBuZXh0IGdyb3VwIGFuZCBzbyBvbi5cbiAqXG4gKiBBdCBlYWNoIGNvbm5lY3Rpb24gd2lsbCBiZSBhc3NpZ25lZCBhIHdlaWdodCBkZXBlbmRpbmcgb24gdGhlXG4gKiBzZWdtZW50J3MgYnl0ZSBsZW5ndGguXG4gKlxuICogQHBhcmFtICB7QXJyYXl9IG5vZGVzICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICBHcmFwaCBvZiBhbGwgcG9zc2libGUgc2VnbWVudHNcbiAqL1xuZnVuY3Rpb24gYnVpbGRHcmFwaCAobm9kZXMsIHZlcnNpb24pIHtcbiAgY29uc3QgdGFibGUgPSB7fVxuICBjb25zdCBncmFwaCA9IHsgc3RhcnQ6IHt9IH1cbiAgbGV0IHByZXZOb2RlSWRzID0gWydzdGFydCddXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IG5vZGVHcm91cCA9IG5vZGVzW2ldXG4gICAgY29uc3QgY3VycmVudE5vZGVJZHMgPSBbXVxuXG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBub2RlR3JvdXAubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnN0IG5vZGUgPSBub2RlR3JvdXBbal1cbiAgICAgIGNvbnN0IGtleSA9ICcnICsgaSArIGpcblxuICAgICAgY3VycmVudE5vZGVJZHMucHVzaChrZXkpXG4gICAgICB0YWJsZVtrZXldID0geyBub2RlOiBub2RlLCBsYXN0Q291bnQ6IDAgfVxuICAgICAgZ3JhcGhba2V5XSA9IHt9XG5cbiAgICAgIGZvciAobGV0IG4gPSAwOyBuIDwgcHJldk5vZGVJZHMubGVuZ3RoOyBuKyspIHtcbiAgICAgICAgY29uc3QgcHJldk5vZGVJZCA9IHByZXZOb2RlSWRzW25dXG5cbiAgICAgICAgaWYgKHRhYmxlW3ByZXZOb2RlSWRdICYmIHRhYmxlW3ByZXZOb2RlSWRdLm5vZGUubW9kZSA9PT0gbm9kZS5tb2RlKSB7XG4gICAgICAgICAgZ3JhcGhbcHJldk5vZGVJZF1ba2V5XSA9XG4gICAgICAgICAgICBnZXRTZWdtZW50Qml0c0xlbmd0aCh0YWJsZVtwcmV2Tm9kZUlkXS5sYXN0Q291bnQgKyBub2RlLmxlbmd0aCwgbm9kZS5tb2RlKSAtXG4gICAgICAgICAgICBnZXRTZWdtZW50Qml0c0xlbmd0aCh0YWJsZVtwcmV2Tm9kZUlkXS5sYXN0Q291bnQsIG5vZGUubW9kZSlcblxuICAgICAgICAgIHRhYmxlW3ByZXZOb2RlSWRdLmxhc3RDb3VudCArPSBub2RlLmxlbmd0aFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh0YWJsZVtwcmV2Tm9kZUlkXSkgdGFibGVbcHJldk5vZGVJZF0ubGFzdENvdW50ID0gbm9kZS5sZW5ndGhcblxuICAgICAgICAgIGdyYXBoW3ByZXZOb2RlSWRdW2tleV0gPSBnZXRTZWdtZW50Qml0c0xlbmd0aChub2RlLmxlbmd0aCwgbm9kZS5tb2RlKSArXG4gICAgICAgICAgICA0ICsgTW9kZS5nZXRDaGFyQ291bnRJbmRpY2F0b3Iobm9kZS5tb2RlLCB2ZXJzaW9uKSAvLyBzd2l0Y2ggY29zdFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcHJldk5vZGVJZHMgPSBjdXJyZW50Tm9kZUlkc1xuICB9XG5cbiAgZm9yIChsZXQgbiA9IDA7IG4gPCBwcmV2Tm9kZUlkcy5sZW5ndGg7IG4rKykge1xuICAgIGdyYXBoW3ByZXZOb2RlSWRzW25dXS5lbmQgPSAwXG4gIH1cblxuICByZXR1cm4geyBtYXA6IGdyYXBoLCB0YWJsZTogdGFibGUgfVxufVxuXG4vKipcbiAqIEJ1aWxkcyBhIHNlZ21lbnQgZnJvbSBhIHNwZWNpZmllZCBkYXRhIGFuZCBtb2RlLlxuICogSWYgYSBtb2RlIGlzIG5vdCBzcGVjaWZpZWQsIHRoZSBtb3JlIHN1aXRhYmxlIHdpbGwgYmUgdXNlZC5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGEgICAgICAgICAgICAgSW5wdXQgZGF0YVxuICogQHBhcmFtICB7TW9kZSB8IFN0cmluZ30gbW9kZXNIaW50IERhdGEgbW9kZVxuICogQHJldHVybiB7U2VnbWVudH0gICAgICAgICAgICAgICAgIFNlZ21lbnRcbiAqL1xuZnVuY3Rpb24gYnVpbGRTaW5nbGVTZWdtZW50IChkYXRhLCBtb2Rlc0hpbnQpIHtcbiAgbGV0IG1vZGVcbiAgY29uc3QgYmVzdE1vZGUgPSBNb2RlLmdldEJlc3RNb2RlRm9yRGF0YShkYXRhKVxuXG4gIG1vZGUgPSBNb2RlLmZyb20obW9kZXNIaW50LCBiZXN0TW9kZSlcblxuICAvLyBNYWtlIHN1cmUgZGF0YSBjYW4gYmUgZW5jb2RlZFxuICBpZiAobW9kZSAhPT0gTW9kZS5CWVRFICYmIG1vZGUuYml0IDwgYmVzdE1vZGUuYml0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcIicgKyBkYXRhICsgJ1wiJyArXG4gICAgICAnIGNhbm5vdCBiZSBlbmNvZGVkIHdpdGggbW9kZSAnICsgTW9kZS50b1N0cmluZyhtb2RlKSArXG4gICAgICAnLlxcbiBTdWdnZXN0ZWQgbW9kZSBpczogJyArIE1vZGUudG9TdHJpbmcoYmVzdE1vZGUpKVxuICB9XG5cbiAgLy8gVXNlIE1vZGUuQllURSBpZiBLYW5qaSBzdXBwb3J0IGlzIGRpc2FibGVkXG4gIGlmIChtb2RlID09PSBNb2RlLktBTkpJICYmICFVdGlscy5pc0thbmppTW9kZUVuYWJsZWQoKSkge1xuICAgIG1vZGUgPSBNb2RlLkJZVEVcbiAgfVxuXG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgTW9kZS5OVU1FUklDOlxuICAgICAgcmV0dXJuIG5ldyBOdW1lcmljRGF0YShkYXRhKVxuXG4gICAgY2FzZSBNb2RlLkFMUEhBTlVNRVJJQzpcbiAgICAgIHJldHVybiBuZXcgQWxwaGFudW1lcmljRGF0YShkYXRhKVxuXG4gICAgY2FzZSBNb2RlLktBTkpJOlxuICAgICAgcmV0dXJuIG5ldyBLYW5qaURhdGEoZGF0YSlcblxuICAgIGNhc2UgTW9kZS5CWVRFOlxuICAgICAgcmV0dXJuIG5ldyBCeXRlRGF0YShkYXRhKVxuICB9XG59XG5cbi8qKlxuICogQnVpbGRzIGEgbGlzdCBvZiBzZWdtZW50cyBmcm9tIGFuIGFycmF5LlxuICogQXJyYXkgY2FuIGNvbnRhaW4gU3RyaW5ncyBvciBPYmplY3RzIHdpdGggc2VnbWVudCdzIGluZm8uXG4gKlxuICogRm9yIGVhY2ggaXRlbSB3aGljaCBpcyBhIHN0cmluZywgd2lsbCBiZSBnZW5lcmF0ZWQgYSBzZWdtZW50IHdpdGggdGhlIGdpdmVuXG4gKiBzdHJpbmcgYW5kIHRoZSBtb3JlIGFwcHJvcHJpYXRlIGVuY29kaW5nIG1vZGUuXG4gKlxuICogRm9yIGVhY2ggaXRlbSB3aGljaCBpcyBhbiBvYmplY3QsIHdpbGwgYmUgZ2VuZXJhdGVkIGEgc2VnbWVudCB3aXRoIHRoZSBnaXZlblxuICogZGF0YSBhbmQgbW9kZS5cbiAqIE9iamVjdHMgbXVzdCBjb250YWluIGF0IGxlYXN0IHRoZSBwcm9wZXJ0eSBcImRhdGFcIi5cbiAqIElmIHByb3BlcnR5IFwibW9kZVwiIGlzIG5vdCBwcmVzZW50LCB0aGUgbW9yZSBzdWl0YWJsZSBtb2RlIHdpbGwgYmUgdXNlZC5cbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gYXJyYXkgQXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICBBcnJheSBvZiBTZWdtZW50c1xuICovXG5leHBvcnRzLmZyb21BcnJheSA9IGZ1bmN0aW9uIGZyb21BcnJheSAoYXJyYXkpIHtcbiAgcmV0dXJuIGFycmF5LnJlZHVjZShmdW5jdGlvbiAoYWNjLCBzZWcpIHtcbiAgICBpZiAodHlwZW9mIHNlZyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGFjYy5wdXNoKGJ1aWxkU2luZ2xlU2VnbWVudChzZWcsIG51bGwpKVxuICAgIH0gZWxzZSBpZiAoc2VnLmRhdGEpIHtcbiAgICAgIGFjYy5wdXNoKGJ1aWxkU2luZ2xlU2VnbWVudChzZWcuZGF0YSwgc2VnLm1vZGUpKVxuICAgIH1cblxuICAgIHJldHVybiBhY2NcbiAgfSwgW10pXG59XG5cbi8qKlxuICogQnVpbGRzIGFuIG9wdGltaXplZCBzZXF1ZW5jZSBvZiBzZWdtZW50cyBmcm9tIGEgc3RyaW5nLFxuICogd2hpY2ggd2lsbCBwcm9kdWNlIHRoZSBzaG9ydGVzdCBwb3NzaWJsZSBiaXRzdHJlYW0uXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBkYXRhICAgIElucHV0IHN0cmluZ1xuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIHNlZ21lbnRzXG4gKi9cbmV4cG9ydHMuZnJvbVN0cmluZyA9IGZ1bmN0aW9uIGZyb21TdHJpbmcgKGRhdGEsIHZlcnNpb24pIHtcbiAgY29uc3Qgc2VncyA9IGdldFNlZ21lbnRzRnJvbVN0cmluZyhkYXRhLCBVdGlscy5pc0thbmppTW9kZUVuYWJsZWQoKSlcblxuICBjb25zdCBub2RlcyA9IGJ1aWxkTm9kZXMoc2VncylcbiAgY29uc3QgZ3JhcGggPSBidWlsZEdyYXBoKG5vZGVzLCB2ZXJzaW9uKVxuICBjb25zdCBwYXRoID0gZGlqa3N0cmEuZmluZF9wYXRoKGdyYXBoLm1hcCwgJ3N0YXJ0JywgJ2VuZCcpXG5cbiAgY29uc3Qgb3B0aW1pemVkU2VncyA9IFtdXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgcGF0aC5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBvcHRpbWl6ZWRTZWdzLnB1c2goZ3JhcGgudGFibGVbcGF0aFtpXV0ubm9kZSlcbiAgfVxuXG4gIHJldHVybiBleHBvcnRzLmZyb21BcnJheShtZXJnZVNlZ21lbnRzKG9wdGltaXplZFNlZ3MpKVxufVxuXG4vKipcbiAqIFNwbGl0cyBhIHN0cmluZyBpbiB2YXJpb3VzIHNlZ21lbnRzIHdpdGggdGhlIG1vZGVzIHdoaWNoXG4gKiBiZXN0IHJlcHJlc2VudCB0aGVpciBjb250ZW50LlxuICogVGhlIHByb2R1Y2VkIHNlZ21lbnRzIGFyZSBmYXIgZnJvbSBiZWluZyBvcHRpbWl6ZWQuXG4gKiBUaGUgb3V0cHV0IG9mIHRoaXMgZnVuY3Rpb24gaXMgb25seSB1c2VkIHRvIGVzdGltYXRlIGEgUVIgQ29kZSB2ZXJzaW9uXG4gKiB3aGljaCBtYXkgY29udGFpbiB0aGUgZGF0YS5cbiAqXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGRhdGEgSW5wdXQgc3RyaW5nXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgQXJyYXkgb2Ygc2VnbWVudHNcbiAqL1xuZXhwb3J0cy5yYXdTcGxpdCA9IGZ1bmN0aW9uIHJhd1NwbGl0IChkYXRhKSB7XG4gIHJldHVybiBleHBvcnRzLmZyb21BcnJheShcbiAgICBnZXRTZWdtZW50c0Zyb21TdHJpbmcoZGF0YSwgVXRpbHMuaXNLYW5qaU1vZGVFbmFibGVkKCkpXG4gIClcbn1cbiIsImNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5jb25zdCBFQ0xldmVsID0gcmVxdWlyZSgnLi9lcnJvci1jb3JyZWN0aW9uLWxldmVsJylcbmNvbnN0IEJpdEJ1ZmZlciA9IHJlcXVpcmUoJy4vYml0LWJ1ZmZlcicpXG5jb25zdCBCaXRNYXRyaXggPSByZXF1aXJlKCcuL2JpdC1tYXRyaXgnKVxuY29uc3QgQWxpZ25tZW50UGF0dGVybiA9IHJlcXVpcmUoJy4vYWxpZ25tZW50LXBhdHRlcm4nKVxuY29uc3QgRmluZGVyUGF0dGVybiA9IHJlcXVpcmUoJy4vZmluZGVyLXBhdHRlcm4nKVxuY29uc3QgTWFza1BhdHRlcm4gPSByZXF1aXJlKCcuL21hc2stcGF0dGVybicpXG5jb25zdCBFQ0NvZGUgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tY29kZScpXG5jb25zdCBSZWVkU29sb21vbkVuY29kZXIgPSByZXF1aXJlKCcuL3JlZWQtc29sb21vbi1lbmNvZGVyJylcbmNvbnN0IFZlcnNpb24gPSByZXF1aXJlKCcuL3ZlcnNpb24nKVxuY29uc3QgRm9ybWF0SW5mbyA9IHJlcXVpcmUoJy4vZm9ybWF0LWluZm8nKVxuY29uc3QgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG5jb25zdCBTZWdtZW50cyA9IHJlcXVpcmUoJy4vc2VnbWVudHMnKVxuXG4vKipcbiAqIFFSQ29kZSBmb3IgSmF2YVNjcmlwdFxuICpcbiAqIG1vZGlmaWVkIGJ5IFJ5YW4gRGF5IGZvciBub2RlanMgc3VwcG9ydFxuICogQ29weXJpZ2h0IChjKSAyMDExIFJ5YW4gRGF5XG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuICogICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBRUkNvZGUgZm9yIEphdmFTY3JpcHRcbi8vXG4vLyBDb3B5cmlnaHQgKGMpIDIwMDkgS2F6dWhpa28gQXJhc2Vcbi8vXG4vLyBVUkw6IGh0dHA6Ly93d3cuZC1wcm9qZWN0LmNvbS9cbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4vLyAgIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4vL1xuLy8gVGhlIHdvcmQgXCJRUiBDb2RlXCIgaXMgcmVnaXN0ZXJlZCB0cmFkZW1hcmsgb2Zcbi8vIERFTlNPIFdBVkUgSU5DT1JQT1JBVEVEXG4vLyAgIGh0dHA6Ly93d3cuZGVuc28td2F2ZS5jb20vcXJjb2RlL2ZhcXBhdGVudC1lLmh0bWxcbi8vXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuKi9cblxuLyoqXG4gKiBBZGQgZmluZGVyIHBhdHRlcm5zIGJpdHMgdG8gbWF0cml4XG4gKlxuICogQHBhcmFtICB7Qml0TWF0cml4fSBtYXRyaXggIE1vZHVsZXMgbWF0cml4XG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgIHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKi9cbmZ1bmN0aW9uIHNldHVwRmluZGVyUGF0dGVybiAobWF0cml4LCB2ZXJzaW9uKSB7XG4gIGNvbnN0IHNpemUgPSBtYXRyaXguc2l6ZVxuICBjb25zdCBwb3MgPSBGaW5kZXJQYXR0ZXJuLmdldFBvc2l0aW9ucyh2ZXJzaW9uKVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgcm93ID0gcG9zW2ldWzBdXG4gICAgY29uc3QgY29sID0gcG9zW2ldWzFdXG5cbiAgICBmb3IgKGxldCByID0gLTE7IHIgPD0gNzsgcisrKSB7XG4gICAgICBpZiAocm93ICsgciA8PSAtMSB8fCBzaXplIDw9IHJvdyArIHIpIGNvbnRpbnVlXG5cbiAgICAgIGZvciAobGV0IGMgPSAtMTsgYyA8PSA3OyBjKyspIHtcbiAgICAgICAgaWYgKGNvbCArIGMgPD0gLTEgfHwgc2l6ZSA8PSBjb2wgKyBjKSBjb250aW51ZVxuXG4gICAgICAgIGlmICgociA+PSAwICYmIHIgPD0gNiAmJiAoYyA9PT0gMCB8fCBjID09PSA2KSkgfHxcbiAgICAgICAgICAoYyA+PSAwICYmIGMgPD0gNiAmJiAociA9PT0gMCB8fCByID09PSA2KSkgfHxcbiAgICAgICAgICAociA+PSAyICYmIHIgPD0gNCAmJiBjID49IDIgJiYgYyA8PSA0KSkge1xuICAgICAgICAgIG1hdHJpeC5zZXQocm93ICsgciwgY29sICsgYywgdHJ1ZSwgdHJ1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdyArIHIsIGNvbCArIGMsIGZhbHNlLCB0cnVlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWRkIHRpbWluZyBwYXR0ZXJuIGJpdHMgdG8gbWF0cml4XG4gKlxuICogTm90ZTogdGhpcyBmdW5jdGlvbiBtdXN0IGJlIGNhbGxlZCBiZWZvcmUge0BsaW5rIHNldHVwQWxpZ25tZW50UGF0dGVybn1cbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCBNb2R1bGVzIG1hdHJpeFxuICovXG5mdW5jdGlvbiBzZXR1cFRpbWluZ1BhdHRlcm4gKG1hdHJpeCkge1xuICBjb25zdCBzaXplID0gbWF0cml4LnNpemVcblxuICBmb3IgKGxldCByID0gODsgciA8IHNpemUgLSA4OyByKyspIHtcbiAgICBjb25zdCB2YWx1ZSA9IHIgJSAyID09PSAwXG4gICAgbWF0cml4LnNldChyLCA2LCB2YWx1ZSwgdHJ1ZSlcbiAgICBtYXRyaXguc2V0KDYsIHIsIHZhbHVlLCB0cnVlKVxuICB9XG59XG5cbi8qKlxuICogQWRkIGFsaWdubWVudCBwYXR0ZXJucyBiaXRzIHRvIG1hdHJpeFxuICpcbiAqIE5vdGU6IHRoaXMgZnVuY3Rpb24gbXVzdCBiZSBjYWxsZWQgYWZ0ZXIge0BsaW5rIHNldHVwVGltaW5nUGF0dGVybn1cbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCAgTW9kdWxlcyBtYXRyaXhcbiAqIEBwYXJhbSAge051bWJlcn0gICAgdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqL1xuZnVuY3Rpb24gc2V0dXBBbGlnbm1lbnRQYXR0ZXJuIChtYXRyaXgsIHZlcnNpb24pIHtcbiAgY29uc3QgcG9zID0gQWxpZ25tZW50UGF0dGVybi5nZXRQb3NpdGlvbnModmVyc2lvbilcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBvcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHJvdyA9IHBvc1tpXVswXVxuICAgIGNvbnN0IGNvbCA9IHBvc1tpXVsxXVxuXG4gICAgZm9yIChsZXQgciA9IC0yOyByIDw9IDI7IHIrKykge1xuICAgICAgZm9yIChsZXQgYyA9IC0yOyBjIDw9IDI7IGMrKykge1xuICAgICAgICBpZiAociA9PT0gLTIgfHwgciA9PT0gMiB8fCBjID09PSAtMiB8fCBjID09PSAyIHx8XG4gICAgICAgICAgKHIgPT09IDAgJiYgYyA9PT0gMCkpIHtcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdyArIHIsIGNvbCArIGMsIHRydWUsIHRydWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF0cml4LnNldChyb3cgKyByLCBjb2wgKyBjLCBmYWxzZSwgdHJ1ZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFkZCB2ZXJzaW9uIGluZm8gYml0cyB0byBtYXRyaXhcbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCAgTW9kdWxlcyBtYXRyaXhcbiAqIEBwYXJhbSAge051bWJlcn0gICAgdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqL1xuZnVuY3Rpb24gc2V0dXBWZXJzaW9uSW5mbyAobWF0cml4LCB2ZXJzaW9uKSB7XG4gIGNvbnN0IHNpemUgPSBtYXRyaXguc2l6ZVxuICBjb25zdCBiaXRzID0gVmVyc2lvbi5nZXRFbmNvZGVkQml0cyh2ZXJzaW9uKVxuICBsZXQgcm93LCBjb2wsIG1vZFxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTg7IGkrKykge1xuICAgIHJvdyA9IE1hdGguZmxvb3IoaSAvIDMpXG4gICAgY29sID0gaSAlIDMgKyBzaXplIC0gOCAtIDNcbiAgICBtb2QgPSAoKGJpdHMgPj4gaSkgJiAxKSA9PT0gMVxuXG4gICAgbWF0cml4LnNldChyb3csIGNvbCwgbW9kLCB0cnVlKVxuICAgIG1hdHJpeC5zZXQoY29sLCByb3csIG1vZCwgdHJ1ZSlcbiAgfVxufVxuXG4vKipcbiAqIEFkZCBmb3JtYXQgaW5mbyBiaXRzIHRvIG1hdHJpeFxuICpcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gbWF0cml4ICAgICAgICAgICAgICAgTW9kdWxlcyBtYXRyaXhcbiAqIEBwYXJhbSAge0Vycm9yQ29ycmVjdGlvbkxldmVsfSAgICBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgIG1hc2tQYXR0ZXJuICAgICAgICAgIE1hc2sgcGF0dGVybiByZWZlcmVuY2UgdmFsdWVcbiAqL1xuZnVuY3Rpb24gc2V0dXBGb3JtYXRJbmZvIChtYXRyaXgsIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrUGF0dGVybikge1xuICBjb25zdCBzaXplID0gbWF0cml4LnNpemVcbiAgY29uc3QgYml0cyA9IEZvcm1hdEluZm8uZ2V0RW5jb2RlZEJpdHMoZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2tQYXR0ZXJuKVxuICBsZXQgaSwgbW9kXG5cbiAgZm9yIChpID0gMDsgaSA8IDE1OyBpKyspIHtcbiAgICBtb2QgPSAoKGJpdHMgPj4gaSkgJiAxKSA9PT0gMVxuXG4gICAgLy8gdmVydGljYWxcbiAgICBpZiAoaSA8IDYpIHtcbiAgICAgIG1hdHJpeC5zZXQoaSwgOCwgbW9kLCB0cnVlKVxuICAgIH0gZWxzZSBpZiAoaSA8IDgpIHtcbiAgICAgIG1hdHJpeC5zZXQoaSArIDEsIDgsIG1vZCwgdHJ1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgbWF0cml4LnNldChzaXplIC0gMTUgKyBpLCA4LCBtb2QsIHRydWUpXG4gICAgfVxuXG4gICAgLy8gaG9yaXpvbnRhbFxuICAgIGlmIChpIDwgOCkge1xuICAgICAgbWF0cml4LnNldCg4LCBzaXplIC0gaSAtIDEsIG1vZCwgdHJ1ZSlcbiAgICB9IGVsc2UgaWYgKGkgPCA5KSB7XG4gICAgICBtYXRyaXguc2V0KDgsIDE1IC0gaSAtIDEgKyAxLCBtb2QsIHRydWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIG1hdHJpeC5zZXQoOCwgMTUgLSBpIC0gMSwgbW9kLCB0cnVlKVxuICAgIH1cbiAgfVxuXG4gIC8vIGZpeGVkIG1vZHVsZVxuICBtYXRyaXguc2V0KHNpemUgLSA4LCA4LCAxLCB0cnVlKVxufVxuXG4vKipcbiAqIEFkZCBlbmNvZGVkIGRhdGEgYml0cyB0byBtYXRyaXhcbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9ICBtYXRyaXggTW9kdWxlcyBtYXRyaXhcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IGRhdGEgICBEYXRhIGNvZGV3b3Jkc1xuICovXG5mdW5jdGlvbiBzZXR1cERhdGEgKG1hdHJpeCwgZGF0YSkge1xuICBjb25zdCBzaXplID0gbWF0cml4LnNpemVcbiAgbGV0IGluYyA9IC0xXG4gIGxldCByb3cgPSBzaXplIC0gMVxuICBsZXQgYml0SW5kZXggPSA3XG4gIGxldCBieXRlSW5kZXggPSAwXG5cbiAgZm9yIChsZXQgY29sID0gc2l6ZSAtIDE7IGNvbCA+IDA7IGNvbCAtPSAyKSB7XG4gICAgaWYgKGNvbCA9PT0gNikgY29sLS1cblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBmb3IgKGxldCBjID0gMDsgYyA8IDI7IGMrKykge1xuICAgICAgICBpZiAoIW1hdHJpeC5pc1Jlc2VydmVkKHJvdywgY29sIC0gYykpIHtcbiAgICAgICAgICBsZXQgZGFyayA9IGZhbHNlXG5cbiAgICAgICAgICBpZiAoYnl0ZUluZGV4IDwgZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRhcmsgPSAoKChkYXRhW2J5dGVJbmRleF0gPj4+IGJpdEluZGV4KSAmIDEpID09PSAxKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG1hdHJpeC5zZXQocm93LCBjb2wgLSBjLCBkYXJrKVxuICAgICAgICAgIGJpdEluZGV4LS1cblxuICAgICAgICAgIGlmIChiaXRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIGJ5dGVJbmRleCsrXG4gICAgICAgICAgICBiaXRJbmRleCA9IDdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcm93ICs9IGluY1xuXG4gICAgICBpZiAocm93IDwgMCB8fCBzaXplIDw9IHJvdykge1xuICAgICAgICByb3cgLT0gaW5jXG4gICAgICAgIGluYyA9IC1pbmNcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGUgZW5jb2RlZCBjb2Rld29yZHMgZnJvbSBkYXRhIGlucHV0XG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSAgIHZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxuICogQHBhcmFtICB7RXJyb3JDb3JyZWN0aW9uTGV2ZWx9ICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuICogQHBhcmFtICB7Qnl0ZURhdGF9IGRhdGEgICAgICAgICAgICAgICAgIERhdGEgaW5wdXRcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9ICAgICAgICAgICAgICAgICAgICBCdWZmZXIgY29udGFpbmluZyBlbmNvZGVkIGNvZGV3b3Jkc1xuICovXG5mdW5jdGlvbiBjcmVhdGVEYXRhICh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgc2VnbWVudHMpIHtcbiAgLy8gUHJlcGFyZSBkYXRhIGJ1ZmZlclxuICBjb25zdCBidWZmZXIgPSBuZXcgQml0QnVmZmVyKClcblxuICBzZWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgLy8gcHJlZml4IGRhdGEgd2l0aCBtb2RlIGluZGljYXRvciAoNCBiaXRzKVxuICAgIGJ1ZmZlci5wdXQoZGF0YS5tb2RlLmJpdCwgNClcblxuICAgIC8vIFByZWZpeCBkYXRhIHdpdGggY2hhcmFjdGVyIGNvdW50IGluZGljYXRvci5cbiAgICAvLyBUaGUgY2hhcmFjdGVyIGNvdW50IGluZGljYXRvciBpcyBhIHN0cmluZyBvZiBiaXRzIHRoYXQgcmVwcmVzZW50cyB0aGVcbiAgICAvLyBudW1iZXIgb2YgY2hhcmFjdGVycyB0aGF0IGFyZSBiZWluZyBlbmNvZGVkLlxuICAgIC8vIFRoZSBjaGFyYWN0ZXIgY291bnQgaW5kaWNhdG9yIG11c3QgYmUgcGxhY2VkIGFmdGVyIHRoZSBtb2RlIGluZGljYXRvclxuICAgIC8vIGFuZCBtdXN0IGJlIGEgY2VydGFpbiBudW1iZXIgb2YgYml0cyBsb25nLCBkZXBlbmRpbmcgb24gdGhlIFFSIHZlcnNpb25cbiAgICAvLyBhbmQgZGF0YSBtb2RlXG4gICAgLy8gQHNlZSB7QGxpbmsgTW9kZS5nZXRDaGFyQ291bnRJbmRpY2F0b3J9LlxuICAgIGJ1ZmZlci5wdXQoZGF0YS5nZXRMZW5ndGgoKSwgTW9kZS5nZXRDaGFyQ291bnRJbmRpY2F0b3IoZGF0YS5tb2RlLCB2ZXJzaW9uKSlcblxuICAgIC8vIGFkZCBiaW5hcnkgZGF0YSBzZXF1ZW5jZSB0byBidWZmZXJcbiAgICBkYXRhLndyaXRlKGJ1ZmZlcilcbiAgfSlcblxuICAvLyBDYWxjdWxhdGUgcmVxdWlyZWQgbnVtYmVyIG9mIGJpdHNcbiAgY29uc3QgdG90YWxDb2Rld29yZHMgPSBVdGlscy5nZXRTeW1ib2xUb3RhbENvZGV3b3Jkcyh2ZXJzaW9uKVxuICBjb25zdCBlY1RvdGFsQ29kZXdvcmRzID0gRUNDb2RlLmdldFRvdGFsQ29kZXdvcmRzQ291bnQodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXG4gIGNvbnN0IGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMgPSAodG90YWxDb2Rld29yZHMgLSBlY1RvdGFsQ29kZXdvcmRzKSAqIDhcblxuICAvLyBBZGQgYSB0ZXJtaW5hdG9yLlxuICAvLyBJZiB0aGUgYml0IHN0cmluZyBpcyBzaG9ydGVyIHRoYW4gdGhlIHRvdGFsIG51bWJlciBvZiByZXF1aXJlZCBiaXRzLFxuICAvLyBhIHRlcm1pbmF0b3Igb2YgdXAgdG8gZm91ciAwcyBtdXN0IGJlIGFkZGVkIHRvIHRoZSByaWdodCBzaWRlIG9mIHRoZSBzdHJpbmcuXG4gIC8vIElmIHRoZSBiaXQgc3RyaW5nIGlzIG1vcmUgdGhhbiBmb3VyIGJpdHMgc2hvcnRlciB0aGFuIHRoZSByZXF1aXJlZCBudW1iZXIgb2YgYml0cyxcbiAgLy8gYWRkIGZvdXIgMHMgdG8gdGhlIGVuZC5cbiAgaWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSArIDQgPD0gZGF0YVRvdGFsQ29kZXdvcmRzQml0cykge1xuICAgIGJ1ZmZlci5wdXQoMCwgNClcbiAgfVxuXG4gIC8vIElmIHRoZSBiaXQgc3RyaW5nIGlzIGZld2VyIHRoYW4gZm91ciBiaXRzIHNob3J0ZXIsIGFkZCBvbmx5IHRoZSBudW1iZXIgb2YgMHMgdGhhdFxuICAvLyBhcmUgbmVlZGVkIHRvIHJlYWNoIHRoZSByZXF1aXJlZCBudW1iZXIgb2YgYml0cy5cblxuICAvLyBBZnRlciBhZGRpbmcgdGhlIHRlcm1pbmF0b3IsIGlmIHRoZSBudW1iZXIgb2YgYml0cyBpbiB0aGUgc3RyaW5nIGlzIG5vdCBhIG11bHRpcGxlIG9mIDgsXG4gIC8vIHBhZCB0aGUgc3RyaW5nIG9uIHRoZSByaWdodCB3aXRoIDBzIHRvIG1ha2UgdGhlIHN0cmluZydzIGxlbmd0aCBhIG11bHRpcGxlIG9mIDguXG4gIHdoaWxlIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgJSA4ICE9PSAwKSB7XG4gICAgYnVmZmVyLnB1dEJpdCgwKVxuICB9XG5cbiAgLy8gQWRkIHBhZCBieXRlcyBpZiB0aGUgc3RyaW5nIGlzIHN0aWxsIHNob3J0ZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIHJlcXVpcmVkIGJpdHMuXG4gIC8vIEV4dGVuZCB0aGUgYnVmZmVyIHRvIGZpbGwgdGhlIGRhdGEgY2FwYWNpdHkgb2YgdGhlIHN5bWJvbCBjb3JyZXNwb25kaW5nIHRvXG4gIC8vIHRoZSBWZXJzaW9uIGFuZCBFcnJvciBDb3JyZWN0aW9uIExldmVsIGJ5IGFkZGluZyB0aGUgUGFkIENvZGV3b3JkcyAxMTEwMTEwMCAoMHhFQylcbiAgLy8gYW5kIDAwMDEwMDAxICgweDExKSBhbHRlcm5hdGVseS5cbiAgY29uc3QgcmVtYWluaW5nQnl0ZSA9IChkYXRhVG90YWxDb2Rld29yZHNCaXRzIC0gYnVmZmVyLmdldExlbmd0aEluQml0cygpKSAvIDhcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByZW1haW5pbmdCeXRlOyBpKyspIHtcbiAgICBidWZmZXIucHV0KGkgJSAyID8gMHgxMSA6IDB4RUMsIDgpXG4gIH1cblxuICByZXR1cm4gY3JlYXRlQ29kZXdvcmRzKGJ1ZmZlciwgdmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXG59XG5cbi8qKlxuICogRW5jb2RlIGlucHV0IGRhdGEgd2l0aCBSZWVkLVNvbG9tb24gYW5kIHJldHVybiBjb2Rld29yZHMgd2l0aFxuICogcmVsYXRpdmUgZXJyb3IgY29ycmVjdGlvbiBiaXRzXG4gKlxuICogQHBhcmFtICB7Qml0QnVmZmVyfSBiaXRCdWZmZXIgICAgICAgICAgICBEYXRhIHRvIGVuY29kZVxuICogQHBhcmFtICB7TnVtYmVyfSAgICB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cbiAqIEBwYXJhbSAge0Vycm9yQ29ycmVjdGlvbkxldmVsfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICAgICAgICAgICAgICAgICAgIEJ1ZmZlciBjb250YWluaW5nIGVuY29kZWQgY29kZXdvcmRzXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUNvZGV3b3JkcyAoYml0QnVmZmVyLCB2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xuICAvLyBUb3RhbCBjb2Rld29yZHMgZm9yIHRoaXMgUVIgY29kZSB2ZXJzaW9uIChEYXRhICsgRXJyb3IgY29ycmVjdGlvbilcbiAgY29uc3QgdG90YWxDb2Rld29yZHMgPSBVdGlscy5nZXRTeW1ib2xUb3RhbENvZGV3b3Jkcyh2ZXJzaW9uKVxuXG4gIC8vIFRvdGFsIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3Jkc1xuICBjb25zdCBlY1RvdGFsQ29kZXdvcmRzID0gRUNDb2RlLmdldFRvdGFsQ29kZXdvcmRzQ291bnQodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXG5cbiAgLy8gVG90YWwgbnVtYmVyIG9mIGRhdGEgY29kZXdvcmRzXG4gIGNvbnN0IGRhdGFUb3RhbENvZGV3b3JkcyA9IHRvdGFsQ29kZXdvcmRzIC0gZWNUb3RhbENvZGV3b3Jkc1xuXG4gIC8vIFRvdGFsIG51bWJlciBvZiBibG9ja3NcbiAgY29uc3QgZWNUb3RhbEJsb2NrcyA9IEVDQ29kZS5nZXRCbG9ja3NDb3VudCh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcblxuICAvLyBDYWxjdWxhdGUgaG93IG1hbnkgYmxvY2tzIGVhY2ggZ3JvdXAgc2hvdWxkIGNvbnRhaW5cbiAgY29uc3QgYmxvY2tzSW5Hcm91cDIgPSB0b3RhbENvZGV3b3JkcyAlIGVjVG90YWxCbG9ja3NcbiAgY29uc3QgYmxvY2tzSW5Hcm91cDEgPSBlY1RvdGFsQmxvY2tzIC0gYmxvY2tzSW5Hcm91cDJcblxuICBjb25zdCB0b3RhbENvZGV3b3Jkc0luR3JvdXAxID0gTWF0aC5mbG9vcih0b3RhbENvZGV3b3JkcyAvIGVjVG90YWxCbG9ja3MpXG5cbiAgY29uc3QgZGF0YUNvZGV3b3Jkc0luR3JvdXAxID0gTWF0aC5mbG9vcihkYXRhVG90YWxDb2Rld29yZHMgLyBlY1RvdGFsQmxvY2tzKVxuICBjb25zdCBkYXRhQ29kZXdvcmRzSW5Hcm91cDIgPSBkYXRhQ29kZXdvcmRzSW5Hcm91cDEgKyAxXG5cbiAgLy8gTnVtYmVyIG9mIEVDIGNvZGV3b3JkcyBpcyB0aGUgc2FtZSBmb3IgYm90aCBncm91cHNcbiAgY29uc3QgZWNDb3VudCA9IHRvdGFsQ29kZXdvcmRzSW5Hcm91cDEgLSBkYXRhQ29kZXdvcmRzSW5Hcm91cDFcblxuICAvLyBJbml0aWFsaXplIGEgUmVlZC1Tb2xvbW9uIGVuY29kZXIgd2l0aCBhIGdlbmVyYXRvciBwb2x5bm9taWFsIG9mIGRlZ3JlZSBlY0NvdW50XG4gIGNvbnN0IHJzID0gbmV3IFJlZWRTb2xvbW9uRW5jb2RlcihlY0NvdW50KVxuXG4gIGxldCBvZmZzZXQgPSAwXG4gIGNvbnN0IGRjRGF0YSA9IG5ldyBBcnJheShlY1RvdGFsQmxvY2tzKVxuICBjb25zdCBlY0RhdGEgPSBuZXcgQXJyYXkoZWNUb3RhbEJsb2NrcylcbiAgbGV0IG1heERhdGFTaXplID0gMFxuICBjb25zdCBidWZmZXIgPSBuZXcgVWludDhBcnJheShiaXRCdWZmZXIuYnVmZmVyKVxuXG4gIC8vIERpdmlkZSB0aGUgYnVmZmVyIGludG8gdGhlIHJlcXVpcmVkIG51bWJlciBvZiBibG9ja3NcbiAgZm9yIChsZXQgYiA9IDA7IGIgPCBlY1RvdGFsQmxvY2tzOyBiKyspIHtcbiAgICBjb25zdCBkYXRhU2l6ZSA9IGIgPCBibG9ja3NJbkdyb3VwMSA/IGRhdGFDb2Rld29yZHNJbkdyb3VwMSA6IGRhdGFDb2Rld29yZHNJbkdyb3VwMlxuXG4gICAgLy8gZXh0cmFjdCBhIGJsb2NrIG9mIGRhdGEgZnJvbSBidWZmZXJcbiAgICBkY0RhdGFbYl0gPSBidWZmZXIuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyBkYXRhU2l6ZSlcblxuICAgIC8vIENhbGN1bGF0ZSBFQyBjb2Rld29yZHMgZm9yIHRoaXMgZGF0YSBibG9ja1xuICAgIGVjRGF0YVtiXSA9IHJzLmVuY29kZShkY0RhdGFbYl0pXG5cbiAgICBvZmZzZXQgKz0gZGF0YVNpemVcbiAgICBtYXhEYXRhU2l6ZSA9IE1hdGgubWF4KG1heERhdGFTaXplLCBkYXRhU2l6ZSlcbiAgfVxuXG4gIC8vIENyZWF0ZSBmaW5hbCBkYXRhXG4gIC8vIEludGVybGVhdmUgdGhlIGRhdGEgYW5kIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzIGZyb20gZWFjaCBibG9ja1xuICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkodG90YWxDb2Rld29yZHMpXG4gIGxldCBpbmRleCA9IDBcbiAgbGV0IGksIHJcblxuICAvLyBBZGQgZGF0YSBjb2Rld29yZHNcbiAgZm9yIChpID0gMDsgaSA8IG1heERhdGFTaXplOyBpKyspIHtcbiAgICBmb3IgKHIgPSAwOyByIDwgZWNUb3RhbEJsb2NrczsgcisrKSB7XG4gICAgICBpZiAoaSA8IGRjRGF0YVtyXS5sZW5ndGgpIHtcbiAgICAgICAgZGF0YVtpbmRleCsrXSA9IGRjRGF0YVtyXVtpXVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEFwcGVkIEVDIGNvZGV3b3Jkc1xuICBmb3IgKGkgPSAwOyBpIDwgZWNDb3VudDsgaSsrKSB7XG4gICAgZm9yIChyID0gMDsgciA8IGVjVG90YWxCbG9ja3M7IHIrKykge1xuICAgICAgZGF0YVtpbmRleCsrXSA9IGVjRGF0YVtyXVtpXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkYXRhXG59XG5cbi8qKlxuICogQnVpbGQgUVIgQ29kZSBzeW1ib2xcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGEgICAgICAgICAgICAgICAgIElucHV0IHN0cmluZ1xuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cbiAqIEBwYXJhbSAge0Vycm9yQ29ycmV0aW9uTGV2ZWx9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGxldmVsXG4gKiBAcGFyYW0gIHtNYXNrUGF0dGVybn0gbWFza1BhdHRlcm4gICAgIE1hc2sgcGF0dGVyblxuICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgICAgICAgICAgICBPYmplY3QgY29udGFpbmluZyBzeW1ib2wgZGF0YVxuICovXG5mdW5jdGlvbiBjcmVhdGVTeW1ib2wgKGRhdGEsIHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrUGF0dGVybikge1xuICBsZXQgc2VnbWVudHNcblxuICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgIHNlZ21lbnRzID0gU2VnbWVudHMuZnJvbUFycmF5KGRhdGEpXG4gIH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgbGV0IGVzdGltYXRlZFZlcnNpb24gPSB2ZXJzaW9uXG5cbiAgICBpZiAoIWVzdGltYXRlZFZlcnNpb24pIHtcbiAgICAgIGNvbnN0IHJhd1NlZ21lbnRzID0gU2VnbWVudHMucmF3U3BsaXQoZGF0YSlcblxuICAgICAgLy8gRXN0aW1hdGUgYmVzdCB2ZXJzaW9uIHRoYXQgY2FuIGNvbnRhaW4gcmF3IHNwbGl0dGVkIHNlZ21lbnRzXG4gICAgICBlc3RpbWF0ZWRWZXJzaW9uID0gVmVyc2lvbi5nZXRCZXN0VmVyc2lvbkZvckRhdGEocmF3U2VnbWVudHMsIGVycm9yQ29ycmVjdGlvbkxldmVsKVxuICAgIH1cblxuICAgIC8vIEJ1aWxkIG9wdGltaXplZCBzZWdtZW50c1xuICAgIC8vIElmIGVzdGltYXRlZCB2ZXJzaW9uIGlzIHVuZGVmaW5lZCwgdHJ5IHdpdGggdGhlIGhpZ2hlc3QgdmVyc2lvblxuICAgIHNlZ21lbnRzID0gU2VnbWVudHMuZnJvbVN0cmluZyhkYXRhLCBlc3RpbWF0ZWRWZXJzaW9uIHx8IDQwKVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBkYXRhJylcbiAgfVxuXG4gIC8vIEdldCB0aGUgbWluIHZlcnNpb24gdGhhdCBjYW4gY29udGFpbiBkYXRhXG4gIGNvbnN0IGJlc3RWZXJzaW9uID0gVmVyc2lvbi5nZXRCZXN0VmVyc2lvbkZvckRhdGEoc2VnbWVudHMsIGVycm9yQ29ycmVjdGlvbkxldmVsKVxuXG4gIC8vIElmIG5vIHZlcnNpb24gaXMgZm91bmQsIGRhdGEgY2Fubm90IGJlIHN0b3JlZFxuICBpZiAoIWJlc3RWZXJzaW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgYW1vdW50IG9mIGRhdGEgaXMgdG9vIGJpZyB0byBiZSBzdG9yZWQgaW4gYSBRUiBDb2RlJylcbiAgfVxuXG4gIC8vIElmIG5vdCBzcGVjaWZpZWQsIHVzZSBtaW4gdmVyc2lvbiBhcyBkZWZhdWx0XG4gIGlmICghdmVyc2lvbikge1xuICAgIHZlcnNpb24gPSBiZXN0VmVyc2lvblxuXG4gIC8vIENoZWNrIGlmIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBjYW4gY29udGFpbiB0aGUgZGF0YVxuICB9IGVsc2UgaWYgKHZlcnNpb24gPCBiZXN0VmVyc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignXFxuJyArXG4gICAgICAnVGhlIGNob3NlbiBRUiBDb2RlIHZlcnNpb24gY2Fubm90IGNvbnRhaW4gdGhpcyBhbW91bnQgb2YgZGF0YS5cXG4nICtcbiAgICAgICdNaW5pbXVtIHZlcnNpb24gcmVxdWlyZWQgdG8gc3RvcmUgY3VycmVudCBkYXRhIGlzOiAnICsgYmVzdFZlcnNpb24gKyAnLlxcbidcbiAgICApXG4gIH1cblxuICBjb25zdCBkYXRhQml0cyA9IGNyZWF0ZURhdGEodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIHNlZ21lbnRzKVxuXG4gIC8vIEFsbG9jYXRlIG1hdHJpeCBidWZmZXJcbiAgY29uc3QgbW9kdWxlQ291bnQgPSBVdGlscy5nZXRTeW1ib2xTaXplKHZlcnNpb24pXG4gIGNvbnN0IG1vZHVsZXMgPSBuZXcgQml0TWF0cml4KG1vZHVsZUNvdW50KVxuXG4gIC8vIEFkZCBmdW5jdGlvbiBtb2R1bGVzXG4gIHNldHVwRmluZGVyUGF0dGVybihtb2R1bGVzLCB2ZXJzaW9uKVxuICBzZXR1cFRpbWluZ1BhdHRlcm4obW9kdWxlcylcbiAgc2V0dXBBbGlnbm1lbnRQYXR0ZXJuKG1vZHVsZXMsIHZlcnNpb24pXG5cbiAgLy8gQWRkIHRlbXBvcmFyeSBkdW1teSBiaXRzIGZvciBmb3JtYXQgaW5mbyBqdXN0IHRvIHNldCB0aGVtIGFzIHJlc2VydmVkLlxuICAvLyBUaGlzIGlzIG5lZWRlZCB0byBwcmV2ZW50IHRoZXNlIGJpdHMgZnJvbSBiZWluZyBtYXNrZWQgYnkge0BsaW5rIE1hc2tQYXR0ZXJuLmFwcGx5TWFza31cbiAgLy8gc2luY2UgdGhlIG1hc2tpbmcgb3BlcmF0aW9uIG11c3QgYmUgcGVyZm9ybWVkIG9ubHkgb24gdGhlIGVuY29kaW5nIHJlZ2lvbi5cbiAgLy8gVGhlc2UgYmxvY2tzIHdpbGwgYmUgcmVwbGFjZWQgd2l0aCBjb3JyZWN0IHZhbHVlcyBsYXRlciBpbiBjb2RlLlxuICBzZXR1cEZvcm1hdEluZm8obW9kdWxlcywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIDApXG5cbiAgaWYgKHZlcnNpb24gPj0gNykge1xuICAgIHNldHVwVmVyc2lvbkluZm8obW9kdWxlcywgdmVyc2lvbilcbiAgfVxuXG4gIC8vIEFkZCBkYXRhIGNvZGV3b3Jkc1xuICBzZXR1cERhdGEobW9kdWxlcywgZGF0YUJpdHMpXG5cbiAgaWYgKGlzTmFOKG1hc2tQYXR0ZXJuKSkge1xuICAgIC8vIEZpbmQgYmVzdCBtYXNrIHBhdHRlcm5cbiAgICBtYXNrUGF0dGVybiA9IE1hc2tQYXR0ZXJuLmdldEJlc3RNYXNrKG1vZHVsZXMsXG4gICAgICBzZXR1cEZvcm1hdEluZm8uYmluZChudWxsLCBtb2R1bGVzLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkpXG4gIH1cblxuICAvLyBBcHBseSBtYXNrIHBhdHRlcm5cbiAgTWFza1BhdHRlcm4uYXBwbHlNYXNrKG1hc2tQYXR0ZXJuLCBtb2R1bGVzKVxuXG4gIC8vIFJlcGxhY2UgZm9ybWF0IGluZm8gYml0cyB3aXRoIGNvcnJlY3QgdmFsdWVzXG4gIHNldHVwRm9ybWF0SW5mbyhtb2R1bGVzLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbWFza1BhdHRlcm4pXG5cbiAgcmV0dXJuIHtcbiAgICBtb2R1bGVzOiBtb2R1bGVzLFxuICAgIHZlcnNpb246IHZlcnNpb24sXG4gICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWw6IGVycm9yQ29ycmVjdGlvbkxldmVsLFxuICAgIG1hc2tQYXR0ZXJuOiBtYXNrUGF0dGVybixcbiAgICBzZWdtZW50czogc2VnbWVudHNcbiAgfVxufVxuXG4vKipcbiAqIFFSIENvZGVcbiAqXG4gKiBAcGFyYW0ge1N0cmluZyB8IEFycmF5fSBkYXRhICAgICAgICAgICAgICAgICBJbnB1dCBkYXRhXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAgICAgICAgICAgICAgICAgICAgICBPcHRpb25hbCBjb25maWd1cmF0aW9uc1xuICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMudmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5lcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25zLnRvU0pJU0Z1bmMgICAgICAgICBIZWxwZXIgZnVuYyB0byBjb252ZXJ0IHV0ZjggdG8gc2ppc1xuICovXG5leHBvcnRzLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZSAoZGF0YSwgb3B0aW9ucykge1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnIHx8IGRhdGEgPT09ICcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBpbnB1dCB0ZXh0JylcbiAgfVxuXG4gIGxldCBlcnJvckNvcnJlY3Rpb25MZXZlbCA9IEVDTGV2ZWwuTVxuICBsZXQgdmVyc2lvblxuICBsZXQgbWFza1xuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBVc2UgaGlnaGVyIGVycm9yIGNvcnJlY3Rpb24gbGV2ZWwgYXMgZGVmYXVsdFxuICAgIGVycm9yQ29ycmVjdGlvbkxldmVsID0gRUNMZXZlbC5mcm9tKG9wdGlvbnMuZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIEVDTGV2ZWwuTSlcbiAgICB2ZXJzaW9uID0gVmVyc2lvbi5mcm9tKG9wdGlvbnMudmVyc2lvbilcbiAgICBtYXNrID0gTWFza1BhdHRlcm4uZnJvbShvcHRpb25zLm1hc2tQYXR0ZXJuKVxuXG4gICAgaWYgKG9wdGlvbnMudG9TSklTRnVuYykge1xuICAgICAgVXRpbHMuc2V0VG9TSklTRnVuY3Rpb24ob3B0aW9ucy50b1NKSVNGdW5jKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjcmVhdGVTeW1ib2woZGF0YSwgdmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2spXG59XG4iLCJmdW5jdGlvbiBoZXgycmdiYSAoaGV4KSB7XG4gIGlmICh0eXBlb2YgaGV4ID09PSAnbnVtYmVyJykge1xuICAgIGhleCA9IGhleC50b1N0cmluZygpXG4gIH1cblxuICBpZiAodHlwZW9mIGhleCAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbG9yIHNob3VsZCBiZSBkZWZpbmVkIGFzIGhleCBzdHJpbmcnKVxuICB9XG5cbiAgbGV0IGhleENvZGUgPSBoZXguc2xpY2UoKS5yZXBsYWNlKCcjJywgJycpLnNwbGl0KCcnKVxuICBpZiAoaGV4Q29kZS5sZW5ndGggPCAzIHx8IGhleENvZGUubGVuZ3RoID09PSA1IHx8IGhleENvZGUubGVuZ3RoID4gOCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBoZXggY29sb3I6ICcgKyBoZXgpXG4gIH1cblxuICAvLyBDb252ZXJ0IGZyb20gc2hvcnQgdG8gbG9uZyBmb3JtIChmZmYgLT4gZmZmZmZmKVxuICBpZiAoaGV4Q29kZS5sZW5ndGggPT09IDMgfHwgaGV4Q29kZS5sZW5ndGggPT09IDQpIHtcbiAgICBoZXhDb2RlID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgaGV4Q29kZS5tYXAoZnVuY3Rpb24gKGMpIHtcbiAgICAgIHJldHVybiBbYywgY11cbiAgICB9KSlcbiAgfVxuXG4gIC8vIEFkZCBkZWZhdWx0IGFscGhhIHZhbHVlXG4gIGlmIChoZXhDb2RlLmxlbmd0aCA9PT0gNikgaGV4Q29kZS5wdXNoKCdGJywgJ0YnKVxuXG4gIGNvbnN0IGhleFZhbHVlID0gcGFyc2VJbnQoaGV4Q29kZS5qb2luKCcnKSwgMTYpXG5cbiAgcmV0dXJuIHtcbiAgICByOiAoaGV4VmFsdWUgPj4gMjQpICYgMjU1LFxuICAgIGc6IChoZXhWYWx1ZSA+PiAxNikgJiAyNTUsXG4gICAgYjogKGhleFZhbHVlID4+IDgpICYgMjU1LFxuICAgIGE6IGhleFZhbHVlICYgMjU1LFxuICAgIGhleDogJyMnICsgaGV4Q29kZS5zbGljZSgwLCA2KS5qb2luKCcnKVxuICB9XG59XG5cbmV4cG9ydHMuZ2V0T3B0aW9ucyA9IGZ1bmN0aW9uIGdldE9wdGlvbnMgKG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge31cbiAgaWYgKCFvcHRpb25zLmNvbG9yKSBvcHRpb25zLmNvbG9yID0ge31cblxuICBjb25zdCBtYXJnaW4gPSB0eXBlb2Ygb3B0aW9ucy5tYXJnaW4gPT09ICd1bmRlZmluZWQnIHx8XG4gICAgb3B0aW9ucy5tYXJnaW4gPT09IG51bGwgfHxcbiAgICBvcHRpb25zLm1hcmdpbiA8IDBcbiAgICA/IDRcbiAgICA6IG9wdGlvbnMubWFyZ2luXG5cbiAgY29uc3Qgd2lkdGggPSBvcHRpb25zLndpZHRoICYmIG9wdGlvbnMud2lkdGggPj0gMjEgPyBvcHRpb25zLndpZHRoIDogdW5kZWZpbmVkXG4gIGNvbnN0IHNjYWxlID0gb3B0aW9ucy5zY2FsZSB8fCA0XG5cbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgc2NhbGU6IHdpZHRoID8gNCA6IHNjYWxlLFxuICAgIG1hcmdpbjogbWFyZ2luLFxuICAgIGNvbG9yOiB7XG4gICAgICBkYXJrOiBoZXgycmdiYShvcHRpb25zLmNvbG9yLmRhcmsgfHwgJyMwMDAwMDBmZicpLFxuICAgICAgbGlnaHQ6IGhleDJyZ2JhKG9wdGlvbnMuY29sb3IubGlnaHQgfHwgJyNmZmZmZmZmZicpXG4gICAgfSxcbiAgICB0eXBlOiBvcHRpb25zLnR5cGUsXG4gICAgcmVuZGVyZXJPcHRzOiBvcHRpb25zLnJlbmRlcmVyT3B0cyB8fCB7fVxuICB9XG59XG5cbmV4cG9ydHMuZ2V0U2NhbGUgPSBmdW5jdGlvbiBnZXRTY2FsZSAocXJTaXplLCBvcHRzKSB7XG4gIHJldHVybiBvcHRzLndpZHRoICYmIG9wdHMud2lkdGggPj0gcXJTaXplICsgb3B0cy5tYXJnaW4gKiAyXG4gICAgPyBvcHRzLndpZHRoIC8gKHFyU2l6ZSArIG9wdHMubWFyZ2luICogMilcbiAgICA6IG9wdHMuc2NhbGVcbn1cblxuZXhwb3J0cy5nZXRJbWFnZVdpZHRoID0gZnVuY3Rpb24gZ2V0SW1hZ2VXaWR0aCAocXJTaXplLCBvcHRzKSB7XG4gIGNvbnN0IHNjYWxlID0gZXhwb3J0cy5nZXRTY2FsZShxclNpemUsIG9wdHMpXG4gIHJldHVybiBNYXRoLmZsb29yKChxclNpemUgKyBvcHRzLm1hcmdpbiAqIDIpICogc2NhbGUpXG59XG5cbmV4cG9ydHMucXJUb0ltYWdlRGF0YSA9IGZ1bmN0aW9uIHFyVG9JbWFnZURhdGEgKGltZ0RhdGEsIHFyLCBvcHRzKSB7XG4gIGNvbnN0IHNpemUgPSBxci5tb2R1bGVzLnNpemVcbiAgY29uc3QgZGF0YSA9IHFyLm1vZHVsZXMuZGF0YVxuICBjb25zdCBzY2FsZSA9IGV4cG9ydHMuZ2V0U2NhbGUoc2l6ZSwgb3B0cylcbiAgY29uc3Qgc3ltYm9sU2l6ZSA9IE1hdGguZmxvb3IoKHNpemUgKyBvcHRzLm1hcmdpbiAqIDIpICogc2NhbGUpXG4gIGNvbnN0IHNjYWxlZE1hcmdpbiA9IG9wdHMubWFyZ2luICogc2NhbGVcbiAgY29uc3QgcGFsZXR0ZSA9IFtvcHRzLmNvbG9yLmxpZ2h0LCBvcHRzLmNvbG9yLmRhcmtdXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzeW1ib2xTaXplOyBpKyspIHtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHN5bWJvbFNpemU7IGorKykge1xuICAgICAgbGV0IHBvc0RzdCA9IChpICogc3ltYm9sU2l6ZSArIGopICogNFxuICAgICAgbGV0IHB4Q29sb3IgPSBvcHRzLmNvbG9yLmxpZ2h0XG5cbiAgICAgIGlmIChpID49IHNjYWxlZE1hcmdpbiAmJiBqID49IHNjYWxlZE1hcmdpbiAmJlxuICAgICAgICBpIDwgc3ltYm9sU2l6ZSAtIHNjYWxlZE1hcmdpbiAmJiBqIDwgc3ltYm9sU2l6ZSAtIHNjYWxlZE1hcmdpbikge1xuICAgICAgICBjb25zdCBpU3JjID0gTWF0aC5mbG9vcigoaSAtIHNjYWxlZE1hcmdpbikgLyBzY2FsZSlcbiAgICAgICAgY29uc3QgalNyYyA9IE1hdGguZmxvb3IoKGogLSBzY2FsZWRNYXJnaW4pIC8gc2NhbGUpXG4gICAgICAgIHB4Q29sb3IgPSBwYWxldHRlW2RhdGFbaVNyYyAqIHNpemUgKyBqU3JjXSA/IDEgOiAwXVxuICAgICAgfVxuXG4gICAgICBpbWdEYXRhW3Bvc0RzdCsrXSA9IHB4Q29sb3IuclxuICAgICAgaW1nRGF0YVtwb3NEc3QrK10gPSBweENvbG9yLmdcbiAgICAgIGltZ0RhdGFbcG9zRHN0KytdID0gcHhDb2xvci5iXG4gICAgICBpbWdEYXRhW3Bvc0RzdF0gPSBweENvbG9yLmFcbiAgICB9XG4gIH1cbn1cbiIsImNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5cbmZ1bmN0aW9uIGNsZWFyQ2FudmFzIChjdHgsIGNhbnZhcywgc2l6ZSkge1xuICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodClcblxuICBpZiAoIWNhbnZhcy5zdHlsZSkgY2FudmFzLnN0eWxlID0ge31cbiAgY2FudmFzLmhlaWdodCA9IHNpemVcbiAgY2FudmFzLndpZHRoID0gc2l6ZVxuICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gc2l6ZSArICdweCdcbiAgY2FudmFzLnN0eWxlLndpZHRoID0gc2l6ZSArICdweCdcbn1cblxuZnVuY3Rpb24gZ2V0Q2FudmFzRWxlbWVudCAoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBuZWVkIHRvIHNwZWNpZnkgYSBjYW52YXMgZWxlbWVudCcpXG4gIH1cbn1cblxuZXhwb3J0cy5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIgKHFyRGF0YSwgY2FudmFzLCBvcHRpb25zKSB7XG4gIGxldCBvcHRzID0gb3B0aW9uc1xuICBsZXQgY2FudmFzRWwgPSBjYW52YXNcblxuICBpZiAodHlwZW9mIG9wdHMgPT09ICd1bmRlZmluZWQnICYmICghY2FudmFzIHx8ICFjYW52YXMuZ2V0Q29udGV4dCkpIHtcbiAgICBvcHRzID0gY2FudmFzXG4gICAgY2FudmFzID0gdW5kZWZpbmVkXG4gIH1cblxuICBpZiAoIWNhbnZhcykge1xuICAgIGNhbnZhc0VsID0gZ2V0Q2FudmFzRWxlbWVudCgpXG4gIH1cblxuICBvcHRzID0gVXRpbHMuZ2V0T3B0aW9ucyhvcHRzKVxuICBjb25zdCBzaXplID0gVXRpbHMuZ2V0SW1hZ2VXaWR0aChxckRhdGEubW9kdWxlcy5zaXplLCBvcHRzKVxuXG4gIGNvbnN0IGN0eCA9IGNhbnZhc0VsLmdldENvbnRleHQoJzJkJylcbiAgY29uc3QgaW1hZ2UgPSBjdHguY3JlYXRlSW1hZ2VEYXRhKHNpemUsIHNpemUpXG4gIFV0aWxzLnFyVG9JbWFnZURhdGEoaW1hZ2UuZGF0YSwgcXJEYXRhLCBvcHRzKVxuXG4gIGNsZWFyQ2FudmFzKGN0eCwgY2FudmFzRWwsIHNpemUpXG4gIGN0eC5wdXRJbWFnZURhdGEoaW1hZ2UsIDAsIDApXG5cbiAgcmV0dXJuIGNhbnZhc0VsXG59XG5cbmV4cG9ydHMucmVuZGVyVG9EYXRhVVJMID0gZnVuY3Rpb24gcmVuZGVyVG9EYXRhVVJMIChxckRhdGEsIGNhbnZhcywgb3B0aW9ucykge1xuICBsZXQgb3B0cyA9IG9wdGlvbnNcblxuICBpZiAodHlwZW9mIG9wdHMgPT09ICd1bmRlZmluZWQnICYmICghY2FudmFzIHx8ICFjYW52YXMuZ2V0Q29udGV4dCkpIHtcbiAgICBvcHRzID0gY2FudmFzXG4gICAgY2FudmFzID0gdW5kZWZpbmVkXG4gIH1cblxuICBpZiAoIW9wdHMpIG9wdHMgPSB7fVxuXG4gIGNvbnN0IGNhbnZhc0VsID0gZXhwb3J0cy5yZW5kZXIocXJEYXRhLCBjYW52YXMsIG9wdHMpXG5cbiAgY29uc3QgdHlwZSA9IG9wdHMudHlwZSB8fCAnaW1hZ2UvcG5nJ1xuICBjb25zdCByZW5kZXJlck9wdHMgPSBvcHRzLnJlbmRlcmVyT3B0cyB8fCB7fVxuXG4gIHJldHVybiBjYW52YXNFbC50b0RhdGFVUkwodHlwZSwgcmVuZGVyZXJPcHRzLnF1YWxpdHkpXG59XG4iLCJjb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuXG5mdW5jdGlvbiBnZXRDb2xvckF0dHJpYiAoY29sb3IsIGF0dHJpYikge1xuICBjb25zdCBhbHBoYSA9IGNvbG9yLmEgLyAyNTVcbiAgY29uc3Qgc3RyID0gYXR0cmliICsgJz1cIicgKyBjb2xvci5oZXggKyAnXCInXG5cbiAgcmV0dXJuIGFscGhhIDwgMVxuICAgID8gc3RyICsgJyAnICsgYXR0cmliICsgJy1vcGFjaXR5PVwiJyArIGFscGhhLnRvRml4ZWQoMikuc2xpY2UoMSkgKyAnXCInXG4gICAgOiBzdHJcbn1cblxuZnVuY3Rpb24gc3ZnQ21kIChjbWQsIHgsIHkpIHtcbiAgbGV0IHN0ciA9IGNtZCArIHhcbiAgaWYgKHR5cGVvZiB5ICE9PSAndW5kZWZpbmVkJykgc3RyICs9ICcgJyArIHlcblxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHFyVG9QYXRoIChkYXRhLCBzaXplLCBtYXJnaW4pIHtcbiAgbGV0IHBhdGggPSAnJ1xuICBsZXQgbW92ZUJ5ID0gMFxuICBsZXQgbmV3Um93ID0gZmFsc2VcbiAgbGV0IGxpbmVMZW5ndGggPSAwXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgY29sID0gTWF0aC5mbG9vcihpICUgc2l6ZSlcbiAgICBjb25zdCByb3cgPSBNYXRoLmZsb29yKGkgLyBzaXplKVxuXG4gICAgaWYgKCFjb2wgJiYgIW5ld1JvdykgbmV3Um93ID0gdHJ1ZVxuXG4gICAgaWYgKGRhdGFbaV0pIHtcbiAgICAgIGxpbmVMZW5ndGgrK1xuXG4gICAgICBpZiAoIShpID4gMCAmJiBjb2wgPiAwICYmIGRhdGFbaSAtIDFdKSkge1xuICAgICAgICBwYXRoICs9IG5ld1Jvd1xuICAgICAgICAgID8gc3ZnQ21kKCdNJywgY29sICsgbWFyZ2luLCAwLjUgKyByb3cgKyBtYXJnaW4pXG4gICAgICAgICAgOiBzdmdDbWQoJ20nLCBtb3ZlQnksIDApXG5cbiAgICAgICAgbW92ZUJ5ID0gMFxuICAgICAgICBuZXdSb3cgPSBmYWxzZVxuICAgICAgfVxuXG4gICAgICBpZiAoIShjb2wgKyAxIDwgc2l6ZSAmJiBkYXRhW2kgKyAxXSkpIHtcbiAgICAgICAgcGF0aCArPSBzdmdDbWQoJ2gnLCBsaW5lTGVuZ3RoKVxuICAgICAgICBsaW5lTGVuZ3RoID0gMFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtb3ZlQnkrK1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXRoXG59XG5cbmV4cG9ydHMucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyIChxckRhdGEsIG9wdGlvbnMsIGNiKSB7XG4gIGNvbnN0IG9wdHMgPSBVdGlscy5nZXRPcHRpb25zKG9wdGlvbnMpXG4gIGNvbnN0IHNpemUgPSBxckRhdGEubW9kdWxlcy5zaXplXG4gIGNvbnN0IGRhdGEgPSBxckRhdGEubW9kdWxlcy5kYXRhXG4gIGNvbnN0IHFyY29kZXNpemUgPSBzaXplICsgb3B0cy5tYXJnaW4gKiAyXG5cbiAgY29uc3QgYmcgPSAhb3B0cy5jb2xvci5saWdodC5hXG4gICAgPyAnJ1xuICAgIDogJzxwYXRoICcgKyBnZXRDb2xvckF0dHJpYihvcHRzLmNvbG9yLmxpZ2h0LCAnZmlsbCcpICtcbiAgICAgICcgZD1cIk0wIDBoJyArIHFyY29kZXNpemUgKyAndicgKyBxcmNvZGVzaXplICsgJ0gwelwiLz4nXG5cbiAgY29uc3QgcGF0aCA9XG4gICAgJzxwYXRoICcgKyBnZXRDb2xvckF0dHJpYihvcHRzLmNvbG9yLmRhcmssICdzdHJva2UnKSArXG4gICAgJyBkPVwiJyArIHFyVG9QYXRoKGRhdGEsIHNpemUsIG9wdHMubWFyZ2luKSArICdcIi8+J1xuXG4gIGNvbnN0IHZpZXdCb3ggPSAndmlld0JveD1cIicgKyAnMCAwICcgKyBxcmNvZGVzaXplICsgJyAnICsgcXJjb2Rlc2l6ZSArICdcIidcblxuICBjb25zdCB3aWR0aCA9ICFvcHRzLndpZHRoID8gJycgOiAnd2lkdGg9XCInICsgb3B0cy53aWR0aCArICdcIiBoZWlnaHQ9XCInICsgb3B0cy53aWR0aCArICdcIiAnXG5cbiAgY29uc3Qgc3ZnVGFnID0gJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiICcgKyB3aWR0aCArIHZpZXdCb3ggKyAnIHNoYXBlLXJlbmRlcmluZz1cImNyaXNwRWRnZXNcIj4nICsgYmcgKyBwYXRoICsgJzwvc3ZnPlxcbidcblxuICBpZiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IobnVsbCwgc3ZnVGFnKVxuICB9XG5cbiAgcmV0dXJuIHN2Z1RhZ1xufVxuIiwiXG5jb25zdCBjYW5Qcm9taXNlID0gcmVxdWlyZSgnLi9jYW4tcHJvbWlzZScpXG5cbmNvbnN0IFFSQ29kZSA9IHJlcXVpcmUoJy4vY29yZS9xcmNvZGUnKVxuY29uc3QgQ2FudmFzUmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcmVyL2NhbnZhcycpXG5jb25zdCBTdmdSZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXIvc3ZnLXRhZy5qcycpXG5cbmZ1bmN0aW9uIHJlbmRlckNhbnZhcyAocmVuZGVyRnVuYywgY2FudmFzLCB0ZXh0LCBvcHRzLCBjYikge1xuICBjb25zdCBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gIGNvbnN0IGFyZ3NOdW0gPSBhcmdzLmxlbmd0aFxuICBjb25zdCBpc0xhc3RBcmdDYiA9IHR5cGVvZiBhcmdzW2FyZ3NOdW0gLSAxXSA9PT0gJ2Z1bmN0aW9uJ1xuXG4gIGlmICghaXNMYXN0QXJnQ2IgJiYgIWNhblByb21pc2UoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2FsbGJhY2sgcmVxdWlyZWQgYXMgbGFzdCBhcmd1bWVudCcpXG4gIH1cblxuICBpZiAoaXNMYXN0QXJnQ2IpIHtcbiAgICBpZiAoYXJnc051bSA8IDIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVG9vIGZldyBhcmd1bWVudHMgcHJvdmlkZWQnKVxuICAgIH1cblxuICAgIGlmIChhcmdzTnVtID09PSAyKSB7XG4gICAgICBjYiA9IHRleHRcbiAgICAgIHRleHQgPSBjYW52YXNcbiAgICAgIGNhbnZhcyA9IG9wdHMgPSB1bmRlZmluZWRcbiAgICB9IGVsc2UgaWYgKGFyZ3NOdW0gPT09IDMpIHtcbiAgICAgIGlmIChjYW52YXMuZ2V0Q29udGV4dCAmJiB0eXBlb2YgY2IgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNiID0gb3B0c1xuICAgICAgICBvcHRzID0gdW5kZWZpbmVkXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYiA9IG9wdHNcbiAgICAgICAgb3B0cyA9IHRleHRcbiAgICAgICAgdGV4dCA9IGNhbnZhc1xuICAgICAgICBjYW52YXMgPSB1bmRlZmluZWRcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGFyZ3NOdW0gPCAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RvbyBmZXcgYXJndW1lbnRzIHByb3ZpZGVkJylcbiAgICB9XG5cbiAgICBpZiAoYXJnc051bSA9PT0gMSkge1xuICAgICAgdGV4dCA9IGNhbnZhc1xuICAgICAgY2FudmFzID0gb3B0cyA9IHVuZGVmaW5lZFxuICAgIH0gZWxzZSBpZiAoYXJnc051bSA9PT0gMiAmJiAhY2FudmFzLmdldENvbnRleHQpIHtcbiAgICAgIG9wdHMgPSB0ZXh0XG4gICAgICB0ZXh0ID0gY2FudmFzXG4gICAgICBjYW52YXMgPSB1bmRlZmluZWRcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IFFSQ29kZS5jcmVhdGUodGV4dCwgb3B0cylcbiAgICAgICAgcmVzb2x2ZShyZW5kZXJGdW5jKGRhdGEsIGNhbnZhcywgb3B0cykpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJlamVjdChlKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IGRhdGEgPSBRUkNvZGUuY3JlYXRlKHRleHQsIG9wdHMpXG4gICAgY2IobnVsbCwgcmVuZGVyRnVuYyhkYXRhLCBjYW52YXMsIG9wdHMpKVxuICB9IGNhdGNoIChlKSB7XG4gICAgY2IoZSlcbiAgfVxufVxuXG5leHBvcnRzLmNyZWF0ZSA9IFFSQ29kZS5jcmVhdGVcbmV4cG9ydHMudG9DYW52YXMgPSByZW5kZXJDYW52YXMuYmluZChudWxsLCBDYW52YXNSZW5kZXJlci5yZW5kZXIpXG5leHBvcnRzLnRvRGF0YVVSTCA9IHJlbmRlckNhbnZhcy5iaW5kKG51bGwsIENhbnZhc1JlbmRlcmVyLnJlbmRlclRvRGF0YVVSTClcblxuLy8gb25seSBzdmcgZm9yIG5vdy5cbmV4cG9ydHMudG9TdHJpbmcgPSByZW5kZXJDYW52YXMuYmluZChudWxsLCBmdW5jdGlvbiAoZGF0YSwgXywgb3B0cykge1xuICByZXR1cm4gU3ZnUmVuZGVyZXIucmVuZGVyKGRhdGEsIG9wdHMpXG59KVxuIiwiLyoqXHJcbiAqIGNvcmUvZXJjMjAuanNcclxuICpcclxuICogRVJDLTIwIHRva2VuIGNvbnRyYWN0IGludGVyZmFjZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcbmltcG9ydCB7IGdldFByb3ZpZGVyIH0gZnJvbSAnLi9ycGMuanMnO1xyXG5cclxuLy8gU3RhbmRhcmQgRVJDLTIwIEFCSSAobWluaW1hbCBpbnRlcmZhY2Ugd2UgbmVlZClcclxuY29uc3QgRVJDMjBfQUJJID0gW1xyXG4gIC8vIFJlYWQgZnVuY3Rpb25zXHJcbiAgJ2Z1bmN0aW9uIG5hbWUoKSB2aWV3IHJldHVybnMgKHN0cmluZyknLFxyXG4gICdmdW5jdGlvbiBzeW1ib2woKSB2aWV3IHJldHVybnMgKHN0cmluZyknLFxyXG4gICdmdW5jdGlvbiBkZWNpbWFscygpIHZpZXcgcmV0dXJucyAodWludDgpJyxcclxuICAnZnVuY3Rpb24gdG90YWxTdXBwbHkoKSB2aWV3IHJldHVybnMgKHVpbnQyNTYpJyxcclxuICAnZnVuY3Rpb24gYmFsYW5jZU9mKGFkZHJlc3MgYWNjb3VudCkgdmlldyByZXR1cm5zICh1aW50MjU2KScsXHJcblxyXG4gIC8vIFdyaXRlIGZ1bmN0aW9uc1xyXG4gICdmdW5jdGlvbiB0cmFuc2ZlcihhZGRyZXNzIHRvLCB1aW50MjU2IGFtb3VudCkgcmV0dXJucyAoYm9vbCknLFxyXG4gICdmdW5jdGlvbiBhcHByb3ZlKGFkZHJlc3Mgc3BlbmRlciwgdWludDI1NiBhbW91bnQpIHJldHVybnMgKGJvb2wpJyxcclxuICAnZnVuY3Rpb24gYWxsb3dhbmNlKGFkZHJlc3Mgb3duZXIsIGFkZHJlc3Mgc3BlbmRlcikgdmlldyByZXR1cm5zICh1aW50MjU2KScsXHJcbiAgJ2Z1bmN0aW9uIHRyYW5zZmVyRnJvbShhZGRyZXNzIGZyb20sIGFkZHJlc3MgdG8sIHVpbnQyNTYgYW1vdW50KSByZXR1cm5zIChib29sKScsXHJcblxyXG4gIC8vIEV2ZW50c1xyXG4gICdldmVudCBUcmFuc2ZlcihhZGRyZXNzIGluZGV4ZWQgZnJvbSwgYWRkcmVzcyBpbmRleGVkIHRvLCB1aW50MjU2IHZhbHVlKScsXHJcbiAgJ2V2ZW50IEFwcHJvdmFsKGFkZHJlc3MgaW5kZXhlZCBvd25lciwgYWRkcmVzcyBpbmRleGVkIHNwZW5kZXIsIHVpbnQyNTYgdmFsdWUpJ1xyXG5dO1xyXG5cclxuLyoqXHJcbiAqIEdldHMgYW4gRVJDLTIwIGNvbnRyYWN0IGluc3RhbmNlXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHBhcmFtIHtzdHJpbmd9IHRva2VuQWRkcmVzcyAtIFRva2VuIGNvbnRyYWN0IGFkZHJlc3NcclxuICogQHJldHVybnMge1Byb21pc2U8ZXRoZXJzLkNvbnRyYWN0Pn0gQ29udHJhY3QgaW5zdGFuY2VcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUb2tlbkNvbnRyYWN0KG5ldHdvcmssIHRva2VuQWRkcmVzcykge1xyXG4gIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgcmV0dXJuIG5ldyBldGhlcnMuQ29udHJhY3QodG9rZW5BZGRyZXNzLCBFUkMyMF9BQkksIHByb3ZpZGVyKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZldGNoZXMgdG9rZW4gbWV0YWRhdGEgKG5hbWUsIHN5bWJvbCwgZGVjaW1hbHMpXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHBhcmFtIHtzdHJpbmd9IHRva2VuQWRkcmVzcyAtIFRva2VuIGNvbnRyYWN0IGFkZHJlc3NcclxuICogQHJldHVybnMge1Byb21pc2U8e25hbWU6IHN0cmluZywgc3ltYm9sOiBzdHJpbmcsIGRlY2ltYWxzOiBudW1iZXJ9Pn1cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUb2tlbk1ldGFkYXRhKG5ldHdvcmssIHRva2VuQWRkcmVzcykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBjb250cmFjdCA9IGF3YWl0IGdldFRva2VuQ29udHJhY3QobmV0d29yaywgdG9rZW5BZGRyZXNzKTtcclxuXHJcbiAgICBjb25zdCBbbmFtZSwgc3ltYm9sLCBkZWNpbWFsc10gPSBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgIGNvbnRyYWN0Lm5hbWUoKSxcclxuICAgICAgY29udHJhY3Quc3ltYm9sKCksXHJcbiAgICAgIGNvbnRyYWN0LmRlY2ltYWxzKClcclxuICAgIF0pO1xyXG5cclxuICAgIHJldHVybiB7IG5hbWUsIHN5bWJvbCwgZGVjaW1hbHM6IE51bWJlcihkZWNpbWFscykgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gZmV0Y2ggdG9rZW4gbWV0YWRhdGE6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIHRva2VuIGJhbGFuY2UgZm9yIGFuIGFkZHJlc3NcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5BZGRyZXNzIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gYWNjb3VudEFkZHJlc3MgLSBBY2NvdW50IGFkZHJlc3MgdG8gY2hlY2tcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gQmFsYW5jZSBpbiB3ZWkgKGFzIHN0cmluZylcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUb2tlbkJhbGFuY2UobmV0d29yaywgdG9rZW5BZGRyZXNzLCBhY2NvdW50QWRkcmVzcykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBjb250cmFjdCA9IGF3YWl0IGdldFRva2VuQ29udHJhY3QobmV0d29yaywgdG9rZW5BZGRyZXNzKTtcclxuICAgIGNvbnN0IGJhbGFuY2UgPSBhd2FpdCBjb250cmFjdC5iYWxhbmNlT2YoYWNjb3VudEFkZHJlc3MpO1xyXG4gICAgcmV0dXJuIGJhbGFuY2UudG9TdHJpbmcoKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gZ2V0IHRva2VuIGJhbGFuY2U6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXRzIHRva2VuIGJhbGFuY2UgZnJvbSB3ZWkgdG8gaHVtYW4tcmVhZGFibGVcclxuICogQHBhcmFtIHtzdHJpbmd9IGJhbGFuY2VXZWkgLSBCYWxhbmNlIGluIHdlaVxyXG4gKiBAcGFyYW0ge251bWJlcn0gZGVjaW1hbHMgLSBUb2tlbiBkZWNpbWFsc1xyXG4gKiBAcGFyYW0ge251bWJlcn0gZGlzcGxheURlY2ltYWxzIC0gTnVtYmVyIG9mIGRlY2ltYWxzIHRvIGRpc3BsYXkgKGRlZmF1bHQgNClcclxuICogQHJldHVybnMge3N0cmluZ30gRm9ybWF0dGVkIGJhbGFuY2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRUb2tlbkJhbGFuY2UoYmFsYW5jZVdlaSwgZGVjaW1hbHMsIGRpc3BsYXlEZWNpbWFscyA9IDQpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgYmFsYW5jZSA9IGV0aGVycy5mb3JtYXRVbml0cyhiYWxhbmNlV2VpLCBkZWNpbWFscyk7XHJcbiAgICBjb25zdCBudW0gPSBwYXJzZUZsb2F0KGJhbGFuY2UpO1xyXG4gICAgcmV0dXJuIG51bS50b0ZpeGVkKGRpc3BsYXlEZWNpbWFscyk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybiAnMC4wMDAwJztcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQYXJzZXMgaHVtYW4tcmVhZGFibGUgYW1vdW50IHRvIHdlaVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYW1vdW50IC0gSHVtYW4tcmVhZGFibGUgYW1vdW50XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWNpbWFscyAtIFRva2VuIGRlY2ltYWxzXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEFtb3VudCBpbiB3ZWlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRva2VuQW1vdW50KGFtb3VudCwgZGVjaW1hbHMpIHtcclxuICByZXR1cm4gZXRoZXJzLnBhcnNlVW5pdHMoYW1vdW50LCBkZWNpbWFscykudG9TdHJpbmcoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zZmVycyB0b2tlbnNcclxuICogQHBhcmFtIHtldGhlcnMuV2FsbGV0fSBzaWduZXIgLSBXYWxsZXQgc2lnbmVyXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlbkFkZHJlc3MgLSBUb2tlbiBjb250cmFjdCBhZGRyZXNzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0b0FkZHJlc3MgLSBSZWNpcGllbnQgYWRkcmVzc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gYW1vdW50IC0gQW1vdW50IGluIHdlaSAoYXMgc3RyaW5nKVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxldGhlcnMuVHJhbnNhY3Rpb25SZXNwb25zZT59IFRyYW5zYWN0aW9uIHJlc3BvbnNlXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdHJhbnNmZXJUb2tlbihzaWduZXIsIHRva2VuQWRkcmVzcywgdG9BZGRyZXNzLCBhbW91bnQpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgY29udHJhY3QgPSBuZXcgZXRoZXJzLkNvbnRyYWN0KHRva2VuQWRkcmVzcywgRVJDMjBfQUJJLCBzaWduZXIpO1xyXG4gICAgY29uc3QgdHggPSBhd2FpdCBjb250cmFjdC50cmFuc2Zlcih0b0FkZHJlc3MsIGFtb3VudCk7XHJcbiAgICByZXR1cm4gdHg7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHRyYW5zZmVyIHRva2VuOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGlmIGFuIGFkZHJlc3MgaXMgYSB2YWxpZCBFUkMtMjAgdG9rZW4gY29udHJhY3RcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5BZGRyZXNzIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzc1xyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gVHJ1ZSBpZiB2YWxpZCBFUkMtMjAgY29udHJhY3RcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2YWxpZGF0ZVRva2VuQ29udHJhY3QobmV0d29yaywgdG9rZW5BZGRyZXNzKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIENoZWNrIGlmIGFkZHJlc3MgaXMgdmFsaWRcclxuICAgIGlmICghZXRoZXJzLmlzQWRkcmVzcyh0b2tlbkFkZHJlc3MpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUcnkgdG8gZmV0Y2ggYmFzaWMgbWV0YWRhdGFcclxuICAgIGF3YWl0IGdldFRva2VuTWV0YWRhdGEobmV0d29yaywgdG9rZW5BZGRyZXNzKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBjb3JlL3Rva2Vucy5qc1xyXG4gKlxyXG4gKiBUb2tlbiBtYW5hZ2VtZW50IGFuZCBzdG9yYWdlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgbG9hZCwgc2F2ZSB9IGZyb20gJy4vc3RvcmFnZS5qcyc7XHJcbmltcG9ydCB7IGdldFRva2VuTWV0YWRhdGEsIHZhbGlkYXRlVG9rZW5Db250cmFjdCB9IGZyb20gJy4vZXJjMjAuanMnO1xyXG5cclxuLy8gTWF4aW11bSBjdXN0b20gdG9rZW5zIHBlciBuZXR3b3JrXHJcbmNvbnN0IE1BWF9UT0tFTlNfUEVSX05FVFdPUksgPSAyMDtcclxuXHJcbi8vIERlZmF1bHQvcHJlc2V0IHRva2VucyAoY2FuIGJlIGVhc2lseSBhZGRlZC9yZW1vdmVkIGJ5IHVzZXIpXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1RPS0VOUyA9IHtcclxuICBwdWxzZWNoYWluOiB7XHJcbiAgICAnSEVYJzoge1xyXG4gICAgICBuYW1lOiAnSEVYJyxcclxuICAgICAgc3ltYm9sOiAnSEVYJyxcclxuICAgICAgYWRkcmVzczogJzB4MmI1OTFlOTlhZmU5ZjMyZWFhNjIxNGY3Yjc2Mjk3NjhjNDBlZWIzOScsXHJcbiAgICAgIGRlY2ltYWxzOiA4LFxyXG4gICAgICBsb2dvOiAnaGV4LnBuZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL2hleC5jb20nLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL3B1bHNlY2hhaW4vMHhmMWY0ZWU2MTBiMmJhYmIwNWM2MzVmNzI2ZWY4YjBjNTY4YzhkYzY1J1xyXG4gICAgfSxcclxuICAgICdQTFNYJzoge1xyXG4gICAgICBuYW1lOiAnUHVsc2VYJyxcclxuICAgICAgc3ltYm9sOiAnUExTWCcsXHJcbiAgICAgIGFkZHJlc3M6ICcweDk1QjMwMzk4N0E2MEM3MTUwNEQ5OUFhMWIxM0I0REEwN2IwNzkwYWInLFxyXG4gICAgICBkZWNpbWFsczogMTgsXHJcbiAgICAgIGxvZ286ICdwbHN4LnBuZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL3B1bHNleC5jb20nLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL3B1bHNlY2hhaW4vMHgxYjQ1YjkxNDg3OTFkM2ExMDQxODRjZDVkZmU1Y2U1NzE5M2EzZWU5J1xyXG4gICAgfSxcclxuICAgICdJTkMnOiB7XHJcbiAgICAgIG5hbWU6ICdJbmNlbnRpdmUnLFxyXG4gICAgICBzeW1ib2w6ICdJTkMnLFxyXG4gICAgICBhZGRyZXNzOiAnMHgyZmE4NzhBYjNGODdDQzFDOTczN0ZjMDcxMTA4RjkwNGMwQjBDOTVkJyxcclxuICAgICAgZGVjaW1hbHM6IDE4LFxyXG4gICAgICBsb2dvOiAnaW5jLnN2ZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL2luY2VudGl2ZXRva2VuLmlvJyxcclxuICAgICAgZGV4U2NyZWVuZXJVcmw6ICdodHRwczovL2RleHNjcmVlbmVyLmNvbS9wdWxzZWNoYWluLzB4ZjgwOGJiNjI2NWU5Y2EyNzAwMmMwYTA0NTYyYmY1MGQ0ZmUzN2VhYSdcclxuICAgIH0sXHJcbiAgICAnU2F2YW50Jzoge1xyXG4gICAgICBuYW1lOiAnU2F2YW50JyxcclxuICAgICAgc3ltYm9sOiAnU2F2YW50JyxcclxuICAgICAgYWRkcmVzczogJzB4ZjE2ZTE3ZTRhMDFiZjk5QjBBMDNGZDNBYjY5N2JDODc5MDZlMTgwOScsXHJcbiAgICAgIGRlY2ltYWxzOiAxOCxcclxuICAgICAgbG9nbzogJ3NhdmFudC0xOTIucG5nJyxcclxuICAgICAgaG9tZVVybDogJ2h0dHBzOi8vdXNjZ3ZldC5naXRodWIuaW8vU2F2YW50L3RyYWRlLmh0bWwnLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL3B1bHNlY2hhaW4vMHhhYWE4ODk0NTg0YWFmMDA5MjM3MmYwYzc1Mzc2OWE1MGY2MDYwNzQyJ1xyXG4gICAgfSxcclxuICAgICdIWFInOiB7XHJcbiAgICAgIG5hbWU6ICdIZXhSZXdhcmRzJyxcclxuICAgICAgc3ltYm9sOiAnSFhSJyxcclxuICAgICAgYWRkcmVzczogJzB4Q2ZDYjg5ZjAwNTc2QTc3NWQ5ZjgxOTYxQTM3YmE3RENmMTJDN2Q5QicsXHJcbiAgICAgIGRlY2ltYWxzOiAxOCxcclxuICAgICAgbG9nbzogJ2hleHJld2FyZHMtMTAwMC5wbmcnLFxyXG4gICAgICBob21lVXJsOiAnaHR0cHM6Ly91c2NndmV0LmdpdGh1Yi5pby9IZXhSZXdhcmRzLycsXHJcbiAgICAgIGRleFNjcmVlbmVyVXJsOiAnaHR0cHM6Ly9kZXhzY3JlZW5lci5jb20vcHVsc2VjaGFpbi8weGQ1YThkZTAzM2M4Njk3Y2VhYTg0NGNhNTk2Y2M3NTgzYzRmOGY2MTInXHJcbiAgICB9LFxyXG4gICAgJ1RLUic6IHtcclxuICAgICAgbmFtZTogJ1Rha2VyJyxcclxuICAgICAgc3ltYm9sOiAnVEtSJyxcclxuICAgICAgYWRkcmVzczogJzB4ZDllNTkwMjAwODk5MTZBOEVmQTdEZDBCNjA1ZDU1MjE5RDcyZEI3QicsXHJcbiAgICAgIGRlY2ltYWxzOiAxOCxcclxuICAgICAgbG9nbzogJ3Rrci5zdmcnLFxyXG4gICAgICBob21lVXJsOiAnaHR0cHM6Ly91c2NndmV0LmdpdGh1Yi5pby9qZGFpLWRhcHAvJyxcclxuICAgICAgZGV4U2NyZWVuZXJVcmw6ICdodHRwczovL2RleHNjcmVlbmVyLmNvbS9wdWxzZWNoYWluLzB4MjA1YzZkNDRkODRlODI2MDZlNGU5MjFmODdiNTFiNzFiYTg1ZjBmMCdcclxuICAgIH0sXHJcbiAgICAnSkRBSSc6IHtcclxuICAgICAgbmFtZTogJ0pEQUkgVW5zdGFibGVjb2luJyxcclxuICAgICAgc3ltYm9sOiAnSkRBSScsXHJcbiAgICAgIGFkZHJlc3M6ICcweDE2MTBFNzVDOWI0OEJGNTUwMTM3ODIwNDUyZEU0MDQ5YkIyMmJCNzInLFxyXG4gICAgICBkZWNpbWFsczogMTgsXHJcbiAgICAgIGxvZ286ICdqZGFpLnN2ZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL3VzY2d2ZXQuZ2l0aHViLmlvL2pkYWktZGFwcC8nLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL3B1bHNlY2hhaW4vMHg3MDY1OENlNkQ2QzA5YWNkRTY0NkY2ZWE5QzU3QmE2NGY0RGMzNTBmJ1xyXG4gICAgfSxcclxuICAgICdSaWNreSc6IHtcclxuICAgICAgbmFtZTogJ1JpY2t5JyxcclxuICAgICAgc3ltYm9sOiAnUmlja3knLFxyXG4gICAgICBhZGRyZXNzOiAnMHg3OUZDMEUxZDNFQzAwZDgxRTU0MjNEY0MwMUE2MTdiMGUxMjQ1YzJCJyxcclxuICAgICAgZGVjaW1hbHM6IDE4LFxyXG4gICAgICBsb2dvOiAncmlja3kuanBnJyxcclxuICAgICAgaG9tZVVybDogJ2h0dHBzOi8vdHJ1dGhiZWhpbmRyaWNoYXJkaGVhcnQuY29tLycsXHJcbiAgICAgIGRleFNjcmVlbmVyVXJsOiAnaHR0cHM6Ly9kZXhzY3JlZW5lci5jb20vcHVsc2VjaGFpbi8weGJmZTVhZTQwYmJjYTc0ODc4NDE5YWQ3ZDdlMTE1YTMwY2NmYzYyZjEnXHJcbiAgICB9XHJcbiAgfSxcclxuICBwdWxzZWNoYWluVGVzdG5ldDoge1xyXG4gICAgJ0hFQVJUJzoge1xyXG4gICAgICBuYW1lOiAnSGVhcnRUb2tlbicsXHJcbiAgICAgIHN5bWJvbDogJ0hFQVJUJyxcclxuICAgICAgYWRkcmVzczogJzB4NzM1NzQyRDhlNUZhMzVjMTY1ZGVlZWQ0NTYwRGQ5MUExNUJBMWFCMicsXHJcbiAgICAgIGRlY2ltYWxzOiAxOCxcclxuICAgICAgbG9nbzogJ2hlYXJ0LnBuZydcclxuICAgIH1cclxuICB9LFxyXG4gIGV0aGVyZXVtOiB7fSxcclxuICBzZXBvbGlhOiB7fVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldHMgc3RvcmFnZSBrZXkgZm9yIGN1c3RvbSB0b2tlbnNcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0U3RvcmFnZUtleShuZXR3b3JrKSB7XHJcbiAgcmV0dXJuIGBjdXN0b21fdG9rZW5zXyR7bmV0d29ya31gO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyBzdG9yYWdlIGtleSBmb3IgZW5hYmxlZCBkZWZhdWx0IHRva2Vuc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXREZWZhdWx0VG9rZW5zS2V5KG5ldHdvcmspIHtcclxuICByZXR1cm4gYGVuYWJsZWRfZGVmYXVsdF90b2tlbnNfJHtuZXR3b3JrfWA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIGFsbCBjdXN0b20gdG9rZW5zIGZvciBhIG5ldHdvcmtcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxBcnJheT59XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q3VzdG9tVG9rZW5zKG5ldHdvcmspIHtcclxuICBjb25zdCBrZXkgPSBnZXRTdG9yYWdlS2V5KG5ldHdvcmspO1xyXG4gIGNvbnN0IHRva2VucyA9IGF3YWl0IGxvYWQoa2V5KTtcclxuICByZXR1cm4gdG9rZW5zIHx8IFtdO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyBlbmFibGVkIGRlZmF1bHQgdG9rZW5zIGZvciBhIG5ldHdvcmtcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxBcnJheTxzdHJpbmc+Pn0gQXJyYXkgb2YgZW5hYmxlZCBkZWZhdWx0IHRva2VuIHN5bWJvbHNcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRFbmFibGVkRGVmYXVsdFRva2VucyhuZXR3b3JrKSB7XHJcbiAgY29uc3Qga2V5ID0gZ2V0RGVmYXVsdFRva2Vuc0tleShuZXR3b3JrKTtcclxuICBjb25zdCBlbmFibGVkID0gYXdhaXQgbG9hZChrZXkpO1xyXG4gIC8vIElmIG5vdGhpbmcgc3RvcmVkLCBhbGwgZGVmYXVsdHMgYXJlIGVuYWJsZWRcclxuICBpZiAoIWVuYWJsZWQpIHtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyhERUZBVUxUX1RPS0VOU1tuZXR3b3JrXSB8fCB7fSk7XHJcbiAgfVxyXG4gIHJldHVybiBlbmFibGVkO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyBhbGwgdG9rZW5zIChkZWZhdWx0ICsgY3VzdG9tKSBmb3IgYSBuZXR3b3JrXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHJldHVybnMge1Byb21pc2U8QXJyYXk+fVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFsbFRva2VucyhuZXR3b3JrKSB7XHJcbiAgY29uc3QgY3VzdG9tVG9rZW5zID0gYXdhaXQgZ2V0Q3VzdG9tVG9rZW5zKG5ldHdvcmspO1xyXG4gIGNvbnN0IGVuYWJsZWREZWZhdWx0cyA9IGF3YWl0IGdldEVuYWJsZWREZWZhdWx0VG9rZW5zKG5ldHdvcmspO1xyXG5cclxuICBjb25zdCBkZWZhdWx0VG9rZW5zID0gW107XHJcbiAgY29uc3QgbmV0d29ya0RlZmF1bHRzID0gREVGQVVMVF9UT0tFTlNbbmV0d29ya10gfHwge307XHJcblxyXG4gIGZvciAoY29uc3Qgc3ltYm9sIG9mIGVuYWJsZWREZWZhdWx0cykge1xyXG4gICAgaWYgKG5ldHdvcmtEZWZhdWx0c1tzeW1ib2xdKSB7XHJcbiAgICAgIGRlZmF1bHRUb2tlbnMucHVzaCh7XHJcbiAgICAgICAgLi4ubmV0d29ya0RlZmF1bHRzW3N5bWJvbF0sXHJcbiAgICAgICAgaXNEZWZhdWx0OiB0cnVlXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIFsuLi5kZWZhdWx0VG9rZW5zLCAuLi5jdXN0b21Ub2tlbnNdO1xyXG59XHJcblxyXG4vKipcclxuICogQWRkcyBhIGN1c3RvbSB0b2tlblxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlbkFkZHJlc3MgLSBUb2tlbiBjb250cmFjdCBhZGRyZXNzXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdD59IEFkZGVkIHRva2VuIG9iamVjdFxyXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgdG9rZW4gbGltaXQgcmVhY2hlZCwgaW52YWxpZCBhZGRyZXNzLCBvciBhbHJlYWR5IGV4aXN0c1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZEN1c3RvbVRva2VuKG5ldHdvcmssIHRva2VuQWRkcmVzcykge1xyXG4gIC8vIFZhbGlkYXRlIGFkZHJlc3MgZm9ybWF0XHJcbiAgdG9rZW5BZGRyZXNzID0gdG9rZW5BZGRyZXNzLnRyaW0oKTtcclxuICBpZiAoIXRva2VuQWRkcmVzcy5zdGFydHNXaXRoKCcweCcpIHx8IHRva2VuQWRkcmVzcy5sZW5ndGggIT09IDQyKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdG9rZW4gYWRkcmVzcyBmb3JtYXQnKTtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIGlmIGl0J3MgYSBkZWZhdWx0IHRva2VuXHJcbiAgY29uc3QgbmV0d29ya0RlZmF1bHRzID0gREVGQVVMVF9UT0tFTlNbbmV0d29ya10gfHwge307XHJcbiAgZm9yIChjb25zdCBzeW1ib2wgaW4gbmV0d29ya0RlZmF1bHRzKSB7XHJcbiAgICBpZiAobmV0d29ya0RlZmF1bHRzW3N5bWJvbF0uYWRkcmVzcy50b0xvd2VyQ2FzZSgpID09PSB0b2tlbkFkZHJlc3MudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoaXMgaXMgYSBkZWZhdWx0IHRva2VuICgke3N5bWJvbH0pLiBVc2UgdGhlIGRlZmF1bHQgdG9rZW5zIGxpc3QgaW5zdGVhZC5gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEdldCBjdXJyZW50IGN1c3RvbSB0b2tlbnNcclxuICBjb25zdCBjdXN0b21Ub2tlbnMgPSBhd2FpdCBnZXRDdXN0b21Ub2tlbnMobmV0d29yayk7XHJcblxyXG4gIC8vIENoZWNrIGxpbWl0XHJcbiAgaWYgKGN1c3RvbVRva2Vucy5sZW5ndGggPj0gTUFYX1RPS0VOU19QRVJfTkVUV09SSykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBNYXhpbXVtICR7TUFYX1RPS0VOU19QRVJfTkVUV09SS30gY3VzdG9tIHRva2VucyBwZXIgbmV0d29ya2ApO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgaWYgYWxyZWFkeSBleGlzdHNcclxuICBjb25zdCBleGlzdHMgPSBjdXN0b21Ub2tlbnMuZmluZChcclxuICAgIHQgPT4gdC5hZGRyZXNzLnRvTG93ZXJDYXNlKCkgPT09IHRva2VuQWRkcmVzcy50b0xvd2VyQ2FzZSgpXHJcbiAgKTtcclxuICBpZiAoZXhpc3RzKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Rva2VuIGFscmVhZHkgYWRkZWQnKTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIGNvbnRyYWN0IGFuZCBmZXRjaCBtZXRhZGF0YVxyXG4gIGNvbnN0IGlzVmFsaWQgPSBhd2FpdCB2YWxpZGF0ZVRva2VuQ29udHJhY3QobmV0d29yaywgdG9rZW5BZGRyZXNzKTtcclxuICBpZiAoIWlzVmFsaWQpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBFUkMtMjAgdG9rZW4gY29udHJhY3QnKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IG1ldGFkYXRhID0gYXdhaXQgZ2V0VG9rZW5NZXRhZGF0YShuZXR3b3JrLCB0b2tlbkFkZHJlc3MpO1xyXG5cclxuICAvLyBDcmVhdGUgdG9rZW4gZW50cnlcclxuICBjb25zdCB0b2tlbiA9IHtcclxuICAgIGFkZHJlc3M6IHRva2VuQWRkcmVzcyxcclxuICAgIG5hbWU6IG1ldGFkYXRhLm5hbWUsXHJcbiAgICBzeW1ib2w6IG1ldGFkYXRhLnN5bWJvbCxcclxuICAgIGRlY2ltYWxzOiBtZXRhZGF0YS5kZWNpbWFscyxcclxuICAgIGxvZ286IG51bGwsXHJcbiAgICBpc0RlZmF1bHQ6IGZhbHNlLFxyXG4gICAgYWRkZWRBdDogRGF0ZS5ub3coKVxyXG4gIH07XHJcblxyXG4gIC8vIEFkZCB0byBsaXN0XHJcbiAgY3VzdG9tVG9rZW5zLnB1c2godG9rZW4pO1xyXG5cclxuICAvLyBTYXZlXHJcbiAgY29uc3Qga2V5ID0gZ2V0U3RvcmFnZUtleShuZXR3b3JrKTtcclxuICBhd2FpdCBzYXZlKGtleSwgY3VzdG9tVG9rZW5zKTtcclxuXHJcbiAgcmV0dXJuIHRva2VuO1xyXG59XHJcblxyXG4vKipcclxuICogUmVtb3ZlcyBhIGN1c3RvbSB0b2tlblxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlbkFkZHJlc3MgLSBUb2tlbiBjb250cmFjdCBhZGRyZXNzXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZUN1c3RvbVRva2VuKG5ldHdvcmssIHRva2VuQWRkcmVzcykge1xyXG4gIGNvbnN0IGN1c3RvbVRva2VucyA9IGF3YWl0IGdldEN1c3RvbVRva2VucyhuZXR3b3JrKTtcclxuXHJcbiAgY29uc3QgZmlsdGVyZWQgPSBjdXN0b21Ub2tlbnMuZmlsdGVyKFxyXG4gICAgdCA9PiB0LmFkZHJlc3MudG9Mb3dlckNhc2UoKSAhPT0gdG9rZW5BZGRyZXNzLnRvTG93ZXJDYXNlKClcclxuICApO1xyXG5cclxuICBjb25zdCBrZXkgPSBnZXRTdG9yYWdlS2V5KG5ldHdvcmspO1xyXG4gIGF3YWl0IHNhdmUoa2V5LCBmaWx0ZXJlZCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUb2dnbGVzIGEgZGVmYXVsdCB0b2tlbiBvbi9vZmZcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3ltYm9sIC0gVG9rZW4gc3ltYm9sXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZW5hYmxlZCAtIEVuYWJsZSBvciBkaXNhYmxlXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRvZ2dsZURlZmF1bHRUb2tlbihuZXR3b3JrLCBzeW1ib2wsIGVuYWJsZWQpIHtcclxuICBjb25zdCBlbmFibGVkVG9rZW5zID0gYXdhaXQgZ2V0RW5hYmxlZERlZmF1bHRUb2tlbnMobmV0d29yayk7XHJcblxyXG4gIGxldCB1cGRhdGVkO1xyXG4gIGlmIChlbmFibGVkKSB7XHJcbiAgICAvLyBBZGQgaWYgbm90IGFscmVhZHkgaW4gbGlzdFxyXG4gICAgaWYgKCFlbmFibGVkVG9rZW5zLmluY2x1ZGVzKHN5bWJvbCkpIHtcclxuICAgICAgdXBkYXRlZCA9IFsuLi5lbmFibGVkVG9rZW5zLCBzeW1ib2xdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuOyAvLyBBbHJlYWR5IGVuYWJsZWRcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgLy8gUmVtb3ZlIGZyb20gbGlzdFxyXG4gICAgdXBkYXRlZCA9IGVuYWJsZWRUb2tlbnMuZmlsdGVyKHMgPT4gcyAhPT0gc3ltYm9sKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGtleSA9IGdldERlZmF1bHRUb2tlbnNLZXkobmV0d29yayk7XHJcbiAgYXdhaXQgc2F2ZShrZXksIHVwZGF0ZWQpO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2tzIGlmIGEgZGVmYXVsdCB0b2tlbiBpcyBlbmFibGVkXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHBhcmFtIHtzdHJpbmd9IHN5bWJvbCAtIFRva2VuIHN5bWJvbFxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn1cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpc0RlZmF1bHRUb2tlbkVuYWJsZWQobmV0d29yaywgc3ltYm9sKSB7XHJcbiAgY29uc3QgZW5hYmxlZCA9IGF3YWl0IGdldEVuYWJsZWREZWZhdWx0VG9rZW5zKG5ldHdvcmspO1xyXG4gIHJldHVybiBlbmFibGVkLmluY2x1ZGVzKHN5bWJvbCk7XHJcbn1cclxuIiwiLyoqXHJcbiAqIFByaWNlIE9yYWNsZSAtIEZldGNoZXMgdG9rZW4gcHJpY2VzIGZyb20gUHVsc2VYIGxpcXVpZGl0eSBwb29sc1xyXG4gKiBVc2VzIG9uLWNoYWluIHJlc2VydmUgZGF0YSB0byBjYWxjdWxhdGUgcmVhbC10aW1lIERFWCBwcmljZXNcclxuICogUHJpdmFjeS1wcmVzZXJ2aW5nOiBvbmx5IHVzZXMgUlBDIGNhbGxzLCBubyBleHRlcm5hbCBBUElzXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgZXRoZXJzIH0gZnJvbSAnZXRoZXJzJztcclxuXHJcbi8vIFB1bHNlWCBWMiBQYWlyIEFCSSAob25seSBnZXRSZXNlcnZlcyBmdW5jdGlvbilcclxuY29uc3QgUEFJUl9BQkkgPSBbXHJcbiAgJ2Z1bmN0aW9uIGdldFJlc2VydmVzKCkgZXh0ZXJuYWwgdmlldyByZXR1cm5zICh1aW50MTEyIHJlc2VydmUwLCB1aW50MTEyIHJlc2VydmUxLCB1aW50MzIgYmxvY2tUaW1lc3RhbXBMYXN0KScsXHJcbiAgJ2Z1bmN0aW9uIHRva2VuMCgpIGV4dGVybmFsIHZpZXcgcmV0dXJucyAoYWRkcmVzcyknLFxyXG4gICdmdW5jdGlvbiB0b2tlbjEoKSBleHRlcm5hbCB2aWV3IHJldHVybnMgKGFkZHJlc3MpJ1xyXG5dO1xyXG5cclxuLy8gS25vd24gUHVsc2VYIFYyIHBhaXIgYWRkcmVzc2VzIG9uIFB1bHNlQ2hhaW4gbWFpbm5ldFxyXG4vLyBBbGwgYWRkcmVzc2VzIGFyZSBjaGVja3N1bW1lZCBmb3IgZXRoZXJzLmpzIHY2IGNvbXBhdGliaWxpdHlcclxuY29uc3QgUFVMU0VYX1BBSVJTID0ge1xyXG4gIHB1bHNlY2hhaW46IHtcclxuICAgIC8vIFBMUy9EQUkgLSBQcmljZSBhbmNob3IgZm9yIFVTRCBjb252ZXJzaW9uXHJcbiAgICAnUExTX0RBSSc6ICcweEU1NjA0MzY3MWRmNTVkRTVDRGY4NDU5NzEwNDMzQzEwMzI0REUwYUUnLCAvLyBNYXkgbm90IGV4aXN0LCBmYWxsYmFjayB0byBVU0RDXHJcblxyXG4gICAgLy8gTWFqb3IgdG9rZW4gcGFpcnMgKGFsbCBwYWlyZWQgd2l0aCBXUExTKVxyXG4gICAgJ0hFWF9QTFMnOiAnMHhmMUY0ZWU2MTBiMmJBYkIwNUM2MzVGNzI2ZUY4QjBDNTY4YzhkYzY1JyxcclxuICAgICdQTFNYX1BMUyc6ICcweDFiNDViOTE0ODc5MWQzYTEwNDE4NENkNURGRTVDRTU3MTkzYTNlZTknLFxyXG4gICAgJ0lOQ19QTFMnOiAnMHhmODA4QmI2MjY1ZTlDYTI3MDAyYzBBMDQ1NjJCZjUwZDRGRTM3RUFBJywgLy8gRnJvbSBHZWNrb1Rlcm1pbmFsIChjaGVja3N1bW1lZClcclxuICAgICdTYXZhbnRfUExTJzogJzB4YUFBODg5NDU4NGFBRjAwOTIzNzJmMEM3NTM3NjlhNTBmNjA2MDc0MicsXHJcbiAgICAnSFhSX1BMUyc6ICcweEQ1QThkZTAzM2M4Njk3Y0VhYTg0NENBNTk2Y2M3NTgzYzRmOEY2MTInLFxyXG4gICAgJ1RLUl9QTFMnOiAnMHgyMDVDNmQ0NGQ4NEU4MjYwNkU0RTkyMWY4N2I1MWI3MWJhODVGMGYwJyxcclxuICAgICdKREFJX1BMUyc6ICcweDcwNjU4Q2U2RDZDMDlhY2RFNjQ2RjZlYTlDNTdCYTY0ZjREYzM1MGYnLFxyXG4gICAgJ1JpY2t5X1BMUyc6ICcweGJmZTVhZTQwYmJjYTc0ODc4NDE5YWQ3ZDdlMTE1YTMwY2NmYzYyZjEnXHJcbiAgfVxyXG59O1xyXG5cclxuLy8gVG9rZW4gYWRkcmVzc2VzIGFuZCBkZWNpbWFscyBmb3IgcHJpY2Ugcm91dGluZyAoYWxsIGNoZWNrc3VtbWVkKVxyXG5jb25zdCBUT0tFTl9BRERSRVNTRVMgPSB7XHJcbiAgcHVsc2VjaGFpbjoge1xyXG4gICAgV1BMUzogeyBhZGRyZXNzOiAnMHhBMTA3N2EyOTRkREUxQjA5YkIwNzg4NDRkZjQwNzU4YTVEMGY5YTI3JywgZGVjaW1hbHM6IDE4IH0sXHJcbiAgICBEQUk6IHsgYWRkcmVzczogJzB4ZWZENzY2Y0NiMzhFYUYxZGZkNzAxODUzQkZDZTMxMzU5MjM5RjMwNScsIGRlY2ltYWxzOiAxOCB9LFxyXG4gICAgSEVYOiB7IGFkZHJlc3M6ICcweDJiNTkxZTk5YWZFOWYzMmVBQTYyMTRmN0I3NjI5NzY4YzQwRWViMzknLCBkZWNpbWFsczogOCB9LFxyXG4gICAgUExTWDogeyBhZGRyZXNzOiAnMHg5NUIzMDM5ODdBNjBDNzE1MDREOTlBYTFiMTNCNERBMDdiMDc5MGFiJywgZGVjaW1hbHM6IDE4IH0sXHJcbiAgICBJTkM6IHsgYWRkcmVzczogJzB4MkZBODc4QWIzRjg3Q0MxQzk3MzdGYzA3MTEwOEY5MDRjMEIwQzk1ZCcsIGRlY2ltYWxzOiAxOCB9LFxyXG4gICAgU2F2YW50OiB7IGFkZHJlc3M6ICcweGYxNmUxN2U0YTAxYmY5OUIwQTAzRmQzQWI2OTdiQzg3OTA2ZTE4MDknLCBkZWNpbWFsczogMTggfSxcclxuICAgIEhYUjogeyBhZGRyZXNzOiAnMHhDZkNiODlmMDA1NzZBNzc1ZDlmODE5NjFBMzdiYTdEQ2YxMkM3ZDlCJywgZGVjaW1hbHM6IDE4IH0sXHJcbiAgICBUS1I6IHsgYWRkcmVzczogJzB4ZDllNTkwMjAwODk5MTZBOEVmQTdEZDBCNjA1ZDU1MjE5RDcyZEI3QicsIGRlY2ltYWxzOiAxOCB9LFxyXG4gICAgSkRBSTogeyBhZGRyZXNzOiAnMHgxNjEwRTc1QzliNDhCRjU1MDEzNzgyMDQ1MmRFNDA0OWJCMjJiQjcyJywgZGVjaW1hbHM6IDE4IH0sXHJcbiAgICBSaWNreTogeyBhZGRyZXNzOiAnMHg3OUZDMEUxZDNFQzAwZDgxRTU0MjNEY0MwMUE2MTdiMGUxMjQ1YzJCJywgZGVjaW1hbHM6IDE4IH1cclxuICB9XHJcbn07XHJcblxyXG4vLyBQcmljZSBjYWNoZSAoNSBtaW51dGUgZXhwaXJ5KVxyXG5jb25zdCBwcmljZUNhY2hlID0ge1xyXG4gIHByaWNlczoge30sXHJcbiAgdGltZXN0YW1wOiAwLFxyXG4gIENBQ0hFX0RVUkFUSU9OOiA1ICogNjAgKiAxMDAwIC8vIDUgbWludXRlc1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCByZXNlcnZlcyBmcm9tIGEgUHVsc2VYIHBhaXIgY29udHJhY3RcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFBhaXJSZXNlcnZlcyhwcm92aWRlciwgcGFpckFkZHJlc3MpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcGFpckNvbnRyYWN0ID0gbmV3IGV0aGVycy5Db250cmFjdChwYWlyQWRkcmVzcywgUEFJUl9BQkksIHByb3ZpZGVyKTtcclxuICAgIGNvbnN0IFtyZXNlcnZlMCwgcmVzZXJ2ZTFdID0gYXdhaXQgcGFpckNvbnRyYWN0LmdldFJlc2VydmVzKCk7XHJcbiAgICBjb25zdCB0b2tlbjAgPSBhd2FpdCBwYWlyQ29udHJhY3QudG9rZW4wKCk7XHJcbiAgICBjb25zdCB0b2tlbjEgPSBhd2FpdCBwYWlyQ29udHJhY3QudG9rZW4xKCk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmVzZXJ2ZTA6IHJlc2VydmUwLnRvU3RyaW5nKCksXHJcbiAgICAgIHJlc2VydmUxOiByZXNlcnZlMS50b1N0cmluZygpLFxyXG4gICAgICB0b2tlbjA6IHRva2VuMC50b0xvd2VyQ2FzZSgpLFxyXG4gICAgICB0b2tlbjE6IHRva2VuMS50b0xvd2VyQ2FzZSgpXHJcbiAgICB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBwYWlyIHJlc2VydmVzOicsIHBhaXJBZGRyZXNzLCBlcnJvcik7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGUgcHJpY2Ugb2YgdG9rZW4wIGluIHRlcm1zIG9mIHRva2VuMSBmcm9tIHJlc2VydmVzXHJcbiAqIHByaWNlID0gcmVzZXJ2ZTEgLyByZXNlcnZlMFxyXG4gKi9cclxuZnVuY3Rpb24gY2FsY3VsYXRlUHJpY2UocmVzZXJ2ZTAsIHJlc2VydmUxLCBkZWNpbWFsczAgPSAxOCwgZGVjaW1hbHMxID0gMTgpIHtcclxuICBjb25zdCByMCA9IHBhcnNlRmxvYXQoZXRoZXJzLmZvcm1hdFVuaXRzKHJlc2VydmUwLCBkZWNpbWFsczApKTtcclxuICBjb25zdCByMSA9IHBhcnNlRmxvYXQoZXRoZXJzLmZvcm1hdFVuaXRzKHJlc2VydmUxLCBkZWNpbWFsczEpKTtcclxuXHJcbiAgaWYgKHIwID09PSAwKSByZXR1cm4gMDtcclxuICByZXR1cm4gcjEgLyByMDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCBQTFMgcHJpY2UgaW4gVVNEIHVzaW5nIEhFWCBhcyBpbnRlcm1lZGlhcnlcclxuICogMS4gR2V0IEhFWC9QTFMgcmVzZXJ2ZXMgLT4gSEVYIHByaWNlIGluIFBMU1xyXG4gKiAyLiBVc2Uga25vd24gSEVYIFVTRCBwcmljZSAofiQwLjAxKSB0byBjYWxjdWxhdGUgUExTIFVTRCBwcmljZVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZ2V0UExTUHJpY2UocHJvdmlkZXIpIHtcclxuICB0cnkge1xyXG4gICAgLy8gRmlyc3QgdHJ5IHRoZSBEQUkgcGFpclxyXG4gICAgY29uc3QgZGFpUGFpckFkZHJlc3MgPSBQVUxTRVhfUEFJUlMucHVsc2VjaGFpbi5QTFNfREFJO1xyXG4gICAgY29uc3QgZGFpUmVzZXJ2ZXMgPSBhd2FpdCBnZXRQYWlyUmVzZXJ2ZXMocHJvdmlkZXIsIGRhaVBhaXJBZGRyZXNzKTtcclxuXHJcbiAgICBpZiAoZGFpUmVzZXJ2ZXMpIHtcclxuICAgICAgY29uc3QgdG9rZW5zID0gVE9LRU5fQUREUkVTU0VTLnB1bHNlY2hhaW47XHJcbiAgICAgIGNvbnN0IHBsc0FkZHJlc3MgPSB0b2tlbnMuV1BMUy5hZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgIGNvbnN0IGRhaUFkZHJlc3MgPSB0b2tlbnMuREFJLmFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgIGxldCBwbHNSZXNlcnZlLCBkYWlSZXNlcnZlO1xyXG4gICAgICBpZiAoZGFpUmVzZXJ2ZXMudG9rZW4wID09PSBwbHNBZGRyZXNzKSB7XHJcbiAgICAgICAgcGxzUmVzZXJ2ZSA9IGRhaVJlc2VydmVzLnJlc2VydmUwO1xyXG4gICAgICAgIGRhaVJlc2VydmUgPSBkYWlSZXNlcnZlcy5yZXNlcnZlMTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwbHNSZXNlcnZlID0gZGFpUmVzZXJ2ZXMucmVzZXJ2ZTE7XHJcbiAgICAgICAgZGFpUmVzZXJ2ZSA9IGRhaVJlc2VydmVzLnJlc2VydmUwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBwbHNQcmljZSA9IGNhbGN1bGF0ZVByaWNlKHBsc1Jlc2VydmUsIGRhaVJlc2VydmUsIDE4LCAxOCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfinJMgUExTIHByaWNlIGZyb20gREFJIHBhaXI6JywgcGxzUHJpY2UpO1xyXG4gICAgICByZXR1cm4gcGxzUHJpY2U7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUud2FybignQ291bGQgbm90IGZldGNoIFBMUy9EQUkgcHJpY2UsIHRyeWluZyBhbHRlcm5hdGl2ZS4uLicsIGVycm9yLm1lc3NhZ2UpO1xyXG4gIH1cclxuXHJcbiAgLy8gRmFsbGJhY2s6IENhbGN1bGF0ZSB0aHJvdWdoIEhFWFxyXG4gIC8vIFVzZSBDb2luR2Vja28vQ29pbk1hcmtldENhcCBrbm93biBIRVggcHJpY2UgYXMgYW5jaG9yXHJcbiAgLy8gT3IgdXNlIGEgaGFyZGNvZGVkIHJlYXNvbmFibGUgZXN0aW1hdGVcclxuICBjb25zb2xlLmxvZygnVXNpbmcgSEVYLWJhc2VkIHByaWNlIGVzdGltYXRpb24gYXMgZmFsbGJhY2snKTtcclxuICBcclxuICAvLyBHZXQgSEVYL1BMUyByZXNlcnZlc1xyXG4gIGNvbnN0IGhleFBhaXJBZGRyZXNzID0gUFVMU0VYX1BBSVJTLnB1bHNlY2hhaW4uSEVYX1BMUztcclxuICBjb25zdCBoZXhSZXNlcnZlcyA9IGF3YWl0IGdldFBhaXJSZXNlcnZlcyhwcm92aWRlciwgaGV4UGFpckFkZHJlc3MpO1xyXG4gIFxyXG4gIGlmICghaGV4UmVzZXJ2ZXMpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBmZXRjaCBIRVgvUExTIHJlc2VydmVzIGZvciBwcmljZSBjYWxjdWxhdGlvbicpO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICBjb25zdCB0b2tlbnMgPSBUT0tFTl9BRERSRVNTRVMucHVsc2VjaGFpbjtcclxuICBjb25zdCBwbHNBZGRyZXNzID0gdG9rZW5zLldQTFMuYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IGhleEFkZHJlc3MgPSB0b2tlbnMuSEVYLmFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgbGV0IHBsc1Jlc2VydmUsIGhleFJlc2VydmU7XHJcbiAgaWYgKGhleFJlc2VydmVzLnRva2VuMCA9PT0gaGV4QWRkcmVzcykge1xyXG4gICAgaGV4UmVzZXJ2ZSA9IGhleFJlc2VydmVzLnJlc2VydmUwO1xyXG4gICAgcGxzUmVzZXJ2ZSA9IGhleFJlc2VydmVzLnJlc2VydmUxO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBoZXhSZXNlcnZlID0gaGV4UmVzZXJ2ZXMucmVzZXJ2ZTE7XHJcbiAgICBwbHNSZXNlcnZlID0gaGV4UmVzZXJ2ZXMucmVzZXJ2ZTA7XHJcbiAgfVxyXG5cclxuICAvLyBDYWxjdWxhdGUgSEVYIHByaWNlIGluIFBMU1xyXG4gIGNvbnN0IGhleFJlc2VydmVGb3JtYXR0ZWQgPSBwYXJzZUZsb2F0KGV0aGVycy5mb3JtYXRVbml0cyhoZXhSZXNlcnZlLCA4KSk7IC8vIEhFWCBoYXMgOCBkZWNpbWFsc1xyXG4gIGNvbnN0IHBsc1Jlc2VydmVGb3JtYXR0ZWQgPSBwYXJzZUZsb2F0KGV0aGVycy5mb3JtYXRVbml0cyhwbHNSZXNlcnZlLCAxOCkpO1xyXG4gIGNvbnN0IGhleFByaWNlSW5QbHMgPSBwbHNSZXNlcnZlRm9ybWF0dGVkIC8gaGV4UmVzZXJ2ZUZvcm1hdHRlZDtcclxuXHJcbiAgLy8gVXNlIGFwcHJveGltYXRlIEhFWCBVU0QgcHJpY2UgKHVwZGF0ZSB0aGlzIHBlcmlvZGljYWxseSBvciBmZXRjaCBmcm9tIENvaW5HZWNrbyBBUEkpXHJcbiAgY29uc3QgaGV4VXNkUHJpY2UgPSAwLjAxOyAvLyBBcHByb3hpbWF0ZSAtIGFkanVzdCBiYXNlZCBvbiBtYXJrZXRcclxuICBcclxuICAvLyBDYWxjdWxhdGUgUExTIFVTRCBwcmljZTogaWYgMSBIRVggPSBYIFBMUywgYW5kIDEgSEVYID0gJDAuMDEsIHRoZW4gMSBQTFMgPSAkMC4wMSAvIFhcclxuICBjb25zdCBwbHNVc2RQcmljZSA9IGhleFVzZFByaWNlIC8gaGV4UHJpY2VJblBscztcclxuICBcclxuICAvLyBFc3RpbWF0ZWQgUExTIHByaWNlIHZpYSBIRVhcclxuICBcclxuICByZXR1cm4gcGxzVXNkUHJpY2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdG9rZW4gcHJpY2UgaW4gUExTIGZyb20gUHVsc2VYIHBhaXJcclxuICogUmV0dXJuczogSG93IG11Y2ggUExTIGRvZXMgMSB0b2tlbiBjb3N0XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRUb2tlblByaWNlSW5QTFMocHJvdmlkZXIsIHBhaXJBZGRyZXNzLCB0b2tlbkFkZHJlc3MsIHRva2VuRGVjaW1hbHMpIHtcclxuICBjb25zdCByZXNlcnZlcyA9IGF3YWl0IGdldFBhaXJSZXNlcnZlcyhwcm92aWRlciwgcGFpckFkZHJlc3MpO1xyXG5cclxuICBpZiAoIXJlc2VydmVzKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgY29uc3QgcGxzQWRkcmVzcyA9IFRPS0VOX0FERFJFU1NFUy5wdWxzZWNoYWluLldQTFMuYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IHRhcmdldFRva2VuID0gdG9rZW5BZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIC8vIERldGVybWluZSB3aGljaCByZXNlcnZlIGlzIHRoZSB0b2tlbiBhbmQgd2hpY2ggaXMgUExTXHJcbiAgbGV0IHRva2VuUmVzZXJ2ZSwgcGxzUmVzZXJ2ZTtcclxuICBpZiAocmVzZXJ2ZXMudG9rZW4wID09PSB0YXJnZXRUb2tlbikge1xyXG4gICAgdG9rZW5SZXNlcnZlID0gcmVzZXJ2ZXMucmVzZXJ2ZTA7XHJcbiAgICBwbHNSZXNlcnZlID0gcmVzZXJ2ZXMucmVzZXJ2ZTE7XHJcbiAgfSBlbHNlIGlmIChyZXNlcnZlcy50b2tlbjEgPT09IHRhcmdldFRva2VuKSB7XHJcbiAgICB0b2tlblJlc2VydmUgPSByZXNlcnZlcy5yZXNlcnZlMTtcclxuICAgIHBsc1Jlc2VydmUgPSByZXNlcnZlcy5yZXNlcnZlMDtcclxuICB9IGVsc2Uge1xyXG4gICAgY29uc29sZS5lcnJvcignVG9rZW4gbm90IGZvdW5kIGluIHBhaXI6JywgdG9rZW5BZGRyZXNzLCBwYWlyQWRkcmVzcyk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIC8vIENhbGN1bGF0ZSB0b2tlbiBwcmljZSBpbiBQTFNcclxuICAvLyBQcmljZSBvZiB0b2tlbiBpbiBQTFMgPSBwbHNSZXNlcnZlIC8gdG9rZW5SZXNlcnZlXHJcbiAgLy8gVGhpcyBnaXZlczogSG93IG1hbnkgUExTIHBlciAxIHRva2VuXHJcbiAgY29uc3QgdG9rZW5SZXNlcnZlRm9ybWF0dGVkID0gcGFyc2VGbG9hdChldGhlcnMuZm9ybWF0VW5pdHModG9rZW5SZXNlcnZlLCB0b2tlbkRlY2ltYWxzKSk7XHJcbiAgY29uc3QgcGxzUmVzZXJ2ZUZvcm1hdHRlZCA9IHBhcnNlRmxvYXQoZXRoZXJzLmZvcm1hdFVuaXRzKHBsc1Jlc2VydmUsIDE4KSk7XHJcblxyXG4gIC8vIFRva2VuIHJlc2VydmVzIGZldGNoZWRcclxuXHJcbiAgaWYgKHRva2VuUmVzZXJ2ZUZvcm1hdHRlZCA9PT0gMCkgcmV0dXJuIDA7XHJcblxyXG4gIGNvbnN0IHRva2VuUHJpY2VJblBscyA9IHBsc1Jlc2VydmVGb3JtYXR0ZWQgLyB0b2tlblJlc2VydmVGb3JtYXR0ZWQ7XHJcbiAgLy8gVG9rZW4gcHJpY2UgY2FsY3VsYXRlZFxyXG4gIHJldHVybiB0b2tlblByaWNlSW5QbHM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGZXRjaCBhbGwgdG9rZW4gcHJpY2VzIGluIFVTRFxyXG4gKiBSZXR1cm5zOiB7IFBMUzogcHJpY2UsIEhFWDogcHJpY2UsIFBMU1g6IHByaWNlLCBJTkM6IHByaWNlLCAuLi4gfVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoVG9rZW5QcmljZXMocHJvdmlkZXIsIG5ldHdvcmsgPSAncHVsc2VjaGFpbicpIHtcclxuICAvLyBDaGVjayBjYWNoZSBmaXJzdFxyXG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgaWYgKHByaWNlQ2FjaGUucHJpY2VzW25ldHdvcmtdICYmIChub3cgLSBwcmljZUNhY2hlLnRpbWVzdGFtcCkgPCBwcmljZUNhY2hlLkNBQ0hFX0RVUkFUSU9OKSB7XHJcbiAgICAvLyBVc2luZyBjYWNoZWQgcHJpY2VzXHJcbiAgICByZXR1cm4gcHJpY2VDYWNoZS5wcmljZXNbbmV0d29ya107XHJcbiAgfVxyXG5cclxuICAvLyBGZXRjaGluZyBmcmVzaCBwcmljZXNcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHByaWNlcyA9IHt9O1xyXG5cclxuICAgIC8vIFN0ZXAgMTogR2V0IFBMUyBwcmljZSBpbiBVU0RcclxuICAgIGNvbnN0IHBsc1VzZFByaWNlID0gYXdhaXQgZ2V0UExTUHJpY2UocHJvdmlkZXIpO1xyXG4gICAgaWYgKCFwbHNVc2RQcmljZSkge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ0NvdWxkIG5vdCBmZXRjaCBQTFMgcHJpY2UnKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpY2VzLlBMUyA9IHBsc1VzZFByaWNlO1xyXG4gICAgLy8gUExTIHByaWNlIGZldGNoZWRcclxuXHJcbiAgICAvLyBTdGVwIDI6IEdldCBvdGhlciB0b2tlbiBwcmljZXMgaW4gUExTLCB0aGVuIGNvbnZlcnQgdG8gVVNEXHJcbiAgICBjb25zdCBwYWlycyA9IFBVTFNFWF9QQUlSU1tuZXR3b3JrXTtcclxuICAgIGNvbnN0IHRva2VucyA9IFRPS0VOX0FERFJFU1NFU1tuZXR3b3JrXTtcclxuXHJcbiAgICAvLyBIRVggcHJpY2VcclxuICAgIGNvbnN0IGhleFByaWNlSW5QbHMgPSBhd2FpdCBnZXRUb2tlblByaWNlSW5QTFMocHJvdmlkZXIsIHBhaXJzLkhFWF9QTFMsIHRva2Vucy5IRVguYWRkcmVzcywgdG9rZW5zLkhFWC5kZWNpbWFscyk7XHJcbiAgICBpZiAoaGV4UHJpY2VJblBscykge1xyXG4gICAgICBwcmljZXMuSEVYID0gaGV4UHJpY2VJblBscyAqIHBsc1VzZFByaWNlO1xyXG4gICAgICAvLyBIRVggcHJpY2UgY2FsY3VsYXRlZFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFBMU1ggcHJpY2VcclxuICAgIGNvbnN0IHBsc3hQcmljZUluUGxzID0gYXdhaXQgZ2V0VG9rZW5QcmljZUluUExTKHByb3ZpZGVyLCBwYWlycy5QTFNYX1BMUywgdG9rZW5zLlBMU1guYWRkcmVzcywgdG9rZW5zLlBMU1guZGVjaW1hbHMpO1xyXG4gICAgaWYgKHBsc3hQcmljZUluUGxzKSB7XHJcbiAgICAgIHByaWNlcy5QTFNYID0gcGxzeFByaWNlSW5QbHMgKiBwbHNVc2RQcmljZTtcclxuICAgICAgLy8gUExTWCBwcmljZSBjYWxjdWxhdGVkXHJcbiAgICB9XHJcblxyXG4gICAgLy8gSU5DIHByaWNlXHJcbiAgICBjb25zdCBpbmNQcmljZUluUGxzID0gYXdhaXQgZ2V0VG9rZW5QcmljZUluUExTKHByb3ZpZGVyLCBwYWlycy5JTkNfUExTLCB0b2tlbnMuSU5DLmFkZHJlc3MsIHRva2Vucy5JTkMuZGVjaW1hbHMpO1xyXG4gICAgaWYgKGluY1ByaWNlSW5QbHMpIHtcclxuICAgICAgcHJpY2VzLklOQyA9IGluY1ByaWNlSW5QbHMgKiBwbHNVc2RQcmljZTtcclxuICAgICAgLy8gSU5DIHByaWNlIGNhbGN1bGF0ZWRcclxuICAgIH1cclxuXHJcbiAgICAvLyBTYXZhbnQgcHJpY2VcclxuICAgIGNvbnN0IHNhdmFudFByaWNlSW5QbHMgPSBhd2FpdCBnZXRUb2tlblByaWNlSW5QTFMocHJvdmlkZXIsIHBhaXJzLlNhdmFudF9QTFMsIHRva2Vucy5TYXZhbnQuYWRkcmVzcywgdG9rZW5zLlNhdmFudC5kZWNpbWFscyk7XHJcbiAgICBpZiAoc2F2YW50UHJpY2VJblBscykge1xyXG4gICAgICBwcmljZXMuU2F2YW50ID0gc2F2YW50UHJpY2VJblBscyAqIHBsc1VzZFByaWNlO1xyXG4gICAgICAvLyBTYXZhbnQgcHJpY2UgY2FsY3VsYXRlZFxyXG4gICAgfVxyXG5cclxuICAgIC8vIEhYUiBwcmljZVxyXG4gICAgY29uc3QgaHhyUHJpY2VJblBscyA9IGF3YWl0IGdldFRva2VuUHJpY2VJblBMUyhwcm92aWRlciwgcGFpcnMuSFhSX1BMUywgdG9rZW5zLkhYUi5hZGRyZXNzLCB0b2tlbnMuSFhSLmRlY2ltYWxzKTtcclxuICAgIGlmIChoeHJQcmljZUluUGxzKSB7XHJcbiAgICAgIHByaWNlcy5IWFIgPSBoeHJQcmljZUluUGxzICogcGxzVXNkUHJpY2U7XHJcbiAgICAgIC8vIEhYUiBwcmljZSBjYWxjdWxhdGVkXHJcbiAgICB9XHJcblxyXG4gICAgLy8gVEtSIHByaWNlXHJcbiAgICBjb25zdCB0a3JQcmljZUluUGxzID0gYXdhaXQgZ2V0VG9rZW5QcmljZUluUExTKHByb3ZpZGVyLCBwYWlycy5US1JfUExTLCB0b2tlbnMuVEtSLmFkZHJlc3MsIHRva2Vucy5US1IuZGVjaW1hbHMpO1xyXG4gICAgaWYgKHRrclByaWNlSW5QbHMpIHtcclxuICAgICAgcHJpY2VzLlRLUiA9IHRrclByaWNlSW5QbHMgKiBwbHNVc2RQcmljZTtcclxuICAgICAgLy8gVEtSIHByaWNlIGNhbGN1bGF0ZWRcclxuICAgIH1cclxuXHJcbiAgICAvLyBKREFJIHByaWNlXHJcbiAgICBjb25zdCBqZGFpUHJpY2VJblBscyA9IGF3YWl0IGdldFRva2VuUHJpY2VJblBMUyhwcm92aWRlciwgcGFpcnMuSkRBSV9QTFMsIHRva2Vucy5KREFJLmFkZHJlc3MsIHRva2Vucy5KREFJLmRlY2ltYWxzKTtcclxuICAgIGlmIChqZGFpUHJpY2VJblBscykge1xyXG4gICAgICBwcmljZXMuSkRBSSA9IGpkYWlQcmljZUluUGxzICogcGxzVXNkUHJpY2U7XHJcbiAgICAgIC8vIEpEQUkgcHJpY2UgY2FsY3VsYXRlZFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJpY2t5IHByaWNlXHJcbiAgICBjb25zdCByaWNreVByaWNlSW5QbHMgPSBhd2FpdCBnZXRUb2tlblByaWNlSW5QTFMocHJvdmlkZXIsIHBhaXJzLlJpY2t5X1BMUywgdG9rZW5zLlJpY2t5LmFkZHJlc3MsIHRva2Vucy5SaWNreS5kZWNpbWFscyk7XHJcbiAgICBpZiAocmlja3lQcmljZUluUGxzKSB7XHJcbiAgICAgIHByaWNlcy5SaWNreSA9IHJpY2t5UHJpY2VJblBscyAqIHBsc1VzZFByaWNlO1xyXG4gICAgICAvLyBSaWNreSBwcmljZSBjYWxjdWxhdGVkXHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIGNhY2hlXHJcbiAgICBwcmljZUNhY2hlLnByaWNlc1tuZXR3b3JrXSA9IHByaWNlcztcclxuICAgIHByaWNlQ2FjaGUudGltZXN0YW1wID0gbm93O1xyXG5cclxuICAgIHJldHVybiBwcmljZXM7XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB0b2tlbiBwcmljZXM6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogR2V0IFVTRCB2YWx1ZSBmb3IgYSB0b2tlbiBhbW91bnRcclxuICogQHBhcmFtIHtzdHJpbmd9IHRva2VuU3ltYm9sIC0gVG9rZW4gc3ltYm9sIChQTFMsIEhFWCwgUExTWCwgSU5DLCBldGMuKVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYW1vdW50IC0gVG9rZW4gYW1vdW50IGFzIHN0cmluZyAoaW4gYmFzZSB1bml0cylcclxuICogQHBhcmFtIHtudW1iZXJ9IGRlY2ltYWxzIC0gVG9rZW4gZGVjaW1hbHNcclxuICogQHBhcmFtIHtvYmplY3R9IHByaWNlcyAtIFByaWNlIGRhdGEgZnJvbSBmZXRjaFRva2VuUHJpY2VzKClcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUb2tlblZhbHVlVVNEKHRva2VuU3ltYm9sLCBhbW91bnQsIGRlY2ltYWxzLCBwcmljZXMpIHtcclxuICBpZiAoIXByaWNlcyB8fCAhcHJpY2VzW3Rva2VuU3ltYm9sXSkge1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICBjb25zdCB0b2tlbkFtb3VudCA9IHBhcnNlRmxvYXQoZXRoZXJzLmZvcm1hdFVuaXRzKGFtb3VudCwgZGVjaW1hbHMpKTtcclxuICBjb25zdCB0b2tlblByaWNlID0gcHJpY2VzW3Rva2VuU3ltYm9sXTtcclxuXHJcbiAgcmV0dXJuIHRva2VuQW1vdW50ICogdG9rZW5QcmljZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCBVU0QgdmFsdWUgZm9yIGRpc3BsYXlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRVU0QodmFsdWUpIHtcclxuICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgcmV0dXJuICfigJQnO1xyXG4gIH1cclxuXHJcbiAgaWYgKHZhbHVlIDwgMC4wMSkge1xyXG4gICAgcmV0dXJuIGAkJHt2YWx1ZS50b0ZpeGVkKDYpfWA7XHJcbiAgfSBlbHNlIGlmICh2YWx1ZSA8IDEpIHtcclxuICAgIHJldHVybiBgJCR7dmFsdWUudG9GaXhlZCg0KX1gO1xyXG4gIH0gZWxzZSBpZiAodmFsdWUgPCAxMDApIHtcclxuICAgIHJldHVybiBgJCR7dmFsdWUudG9GaXhlZCgyKX1gO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gYCQke3ZhbHVlLnRvTG9jYWxlU3RyaW5nKCdlbi1VUycsIHsgbWluaW11bUZyYWN0aW9uRGlnaXRzOiAyLCBtYXhpbXVtRnJhY3Rpb25EaWdpdHM6IDIgfSl9YDtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDbGVhciBwcmljZSBjYWNoZSAodXNlZnVsIGZvciB0ZXN0aW5nIG9yIG1hbnVhbCByZWZyZXNoKVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyUHJpY2VDYWNoZSgpIHtcclxuICBwcmljZUNhY2hlLnByaWNlcyA9IHt9O1xyXG4gIHByaWNlQ2FjaGUudGltZXN0YW1wID0gMDtcclxuICAvLyBQcmljZSBjYWNoZSBjbGVhcmVkXHJcbn1cclxuIiwiLyoqXHJcbiAqIHBvcHVwLmpzXHJcbiAqXHJcbiAqIFVJIGNvbnRyb2xsZXIgZm9yIEhlYXJ0V2FsbGV0IHBvcHVwXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtcclxuICBjcmVhdGVXYWxsZXQsXHJcbiAgaW1wb3J0RnJvbU1uZW1vbmljLFxyXG4gIGltcG9ydEZyb21Qcml2YXRlS2V5LFxyXG4gIHVubG9ja1dhbGxldCxcclxuICB3YWxsZXRFeGlzdHMsXHJcbiAgZXhwb3J0UHJpdmF0ZUtleSxcclxuICBleHBvcnRNbmVtb25pYyxcclxuICBkZWxldGVXYWxsZXQsXHJcbiAgbWlncmF0ZVRvTXVsdGlXYWxsZXQsXHJcbiAgZ2V0QWxsV2FsbGV0cyxcclxuICBnZXRBY3RpdmVXYWxsZXQsXHJcbiAgc2V0QWN0aXZlV2FsbGV0LFxyXG4gIGFkZFdhbGxldCxcclxuICByZW5hbWVXYWxsZXQsXHJcbiAgZXhwb3J0UHJpdmF0ZUtleUZvcldhbGxldCxcclxuICBleHBvcnRNbmVtb25pY0ZvcldhbGxldFxyXG59IGZyb20gJy4uL2NvcmUvd2FsbGV0LmpzJztcclxuaW1wb3J0IHsgc2F2ZSwgbG9hZCB9IGZyb20gJy4uL2NvcmUvc3RvcmFnZS5qcyc7XHJcbmltcG9ydCB7IHNob3J0ZW5BZGRyZXNzIH0gZnJvbSAnLi4vY29yZS92YWxpZGF0aW9uLmpzJztcclxuaW1wb3J0ICogYXMgcnBjIGZyb20gJy4uL2NvcmUvcnBjLmpzJztcclxuaW1wb3J0IHsgZXRoZXJzIH0gZnJvbSAnZXRoZXJzJztcclxuaW1wb3J0IFFSQ29kZSBmcm9tICdxcmNvZGUnO1xyXG5pbXBvcnQgKiBhcyB0b2tlbnMgZnJvbSAnLi4vY29yZS90b2tlbnMuanMnO1xyXG5pbXBvcnQgeyBmZXRjaFRva2VuUHJpY2VzLCBnZXRUb2tlblZhbHVlVVNELCBmb3JtYXRVU0QgfSBmcm9tICcuLi9jb3JlL3ByaWNlT3JhY2xlLmpzJztcclxuaW1wb3J0ICogYXMgZXJjMjAgZnJvbSAnLi4vY29yZS9lcmMyMC5qcyc7XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFNFQ1VSSVRZIFVUSUxJVElFU1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4vKipcclxuICogRXNjYXBlcyBIVE1MIHNwZWNpYWwgY2hhcmFjdGVycyB0byBwcmV2ZW50IFhTUyBhdHRhY2tzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGV4dCB0byBlc2NhcGVcclxuICogQHJldHVybnMge3N0cmluZ30gSFRNTC1zYWZlIHRleHRcclxuICovXHJcbmZ1bmN0aW9uIGVzY2FwZUh0bWwodGV4dCkge1xyXG4gIGlmICh0eXBlb2YgdGV4dCAhPT0gJ3N0cmluZycpIHJldHVybiAnJztcclxuICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICBkaXYudGV4dENvbnRlbnQgPSB0ZXh0O1xyXG4gIHJldHVybiBkaXYuaW5uZXJIVE1MO1xyXG59XHJcblxyXG4vKipcclxuICogU2FuaXRpemVzIGVycm9yIG1lc3NhZ2VzIGZvciBzYWZlIGRpc3BsYXkgaW4gYWxlcnRzIGFuZCBVSVxyXG4gKiBSZW1vdmVzIEhUTUwgdGFncywgc2NyaXB0cywgYW5kIGxpbWl0cyBsZW5ndGhcclxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBFcnJvciBtZXNzYWdlIHRvIHNhbml0aXplXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFNhbml0aXplZCBtZXNzYWdlXHJcbiAqL1xyXG5mdW5jdGlvbiBzYW5pdGl6ZUVycm9yKG1lc3NhZ2UpIHtcclxuICBpZiAodHlwZW9mIG1lc3NhZ2UgIT09ICdzdHJpbmcnKSByZXR1cm4gJ1Vua25vd24gZXJyb3InO1xyXG4gIFxyXG4gIC8vIFJlbW92ZSBudWxsIGJ5dGVzIGFuZCBjb250cm9sIGNoYXJhY3RlcnMgKGV4Y2VwdCBuZXdsaW5lcyBhbmQgdGFicylcclxuICBsZXQgc2FuaXRpemVkID0gbWVzc2FnZS5yZXBsYWNlKC9bXFx4MDAtXFx4MDhcXHgwQlxceDBDXFx4MEUtXFx4MUZcXHg3Rl0vZywgJycpO1xyXG4gIFxyXG4gIC8vIFJlbW92ZSBIVE1MIHRhZ3NcclxuICBzYW5pdGl6ZWQgPSBzYW5pdGl6ZWQucmVwbGFjZSgvPFtePl0qPi9nLCAnJyk7XHJcbiAgXHJcbiAgLy8gUmVtb3ZlIHNjcmlwdC1saWtlIGNvbnRlbnRcclxuICBzYW5pdGl6ZWQgPSBzYW5pdGl6ZWQucmVwbGFjZSgvamF2YXNjcmlwdDovZ2ksICcnKTtcclxuICBzYW5pdGl6ZWQgPSBzYW5pdGl6ZWQucmVwbGFjZSgvb25cXHcrXFxzKj0vZ2ksICcnKTtcclxuICBcclxuICAvLyBMaW1pdCBsZW5ndGggdG8gcHJldmVudCBEb1NcclxuICBpZiAoc2FuaXRpemVkLmxlbmd0aCA+IDMwMCkge1xyXG4gICAgc2FuaXRpemVkID0gc2FuaXRpemVkLnN1YnN0cmluZygwLCAyOTcpICsgJy4uLic7XHJcbiAgfVxyXG4gIFxyXG4gIHJldHVybiBzYW5pdGl6ZWQgfHwgJ1Vua25vd24gZXJyb3InO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFNUQVRFXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbi8vID09PT09IFNUQVRFID09PT09XHJcbmxldCBjdXJyZW50U3RhdGUgPSB7XHJcbiAgaXNVbmxvY2tlZDogZmFsc2UsXHJcbiAgYWRkcmVzczogbnVsbCxcclxuICBiYWxhbmNlOiAnMCcsXHJcbiAgbmV0d29yazogJ3B1bHNlY2hhaW4nLCAvLyBEZWZhdWx0IHRvIFB1bHNlQ2hhaW4gTWFpbm5ldFxyXG4gIHNlc3Npb25Ub2tlbjogbnVsbCwgLy8gU2Vzc2lvbiB0b2tlbiBmb3IgYXV0aGVudGljYXRlZCBvcGVyYXRpb25zIChzdG9yZWQgaW4gbWVtb3J5IG9ubHkpXHJcbiAgc2V0dGluZ3M6IHtcclxuICAgIGF1dG9Mb2NrTWludXRlczogMTUsXHJcbiAgICBzaG93VGVzdE5ldHdvcmtzOiB0cnVlLFxyXG4gICAgZGVjaW1hbFBsYWNlczogOCxcclxuICAgIHRoZW1lOiAnaGlnaC1jb250cmFzdCcsXHJcbiAgICBtYXhHYXNQcmljZUd3ZWk6IDEwMDAgLy8gTWF4aW11bSBnYXMgcHJpY2UgaW4gR3dlaSAoZGVmYXVsdCAxMDAwKVxyXG4gIH0sXHJcbiAgbmV0d29ya1NldHRpbmdzOiBudWxsLCAvLyBXaWxsIGJlIGxvYWRlZCBmcm9tIHN0b3JhZ2Ugb3IgdXNlIGRlZmF1bHRzXHJcbiAgbGFzdEFjdGl2aXR5VGltZTogbnVsbCwgLy8gVHJhY2sgbGFzdCBhY3Rpdml0eSBmb3IgYXV0by1sb2NrXHJcbiAgdG9rZW5QcmljZXM6IG51bGwsIC8vIFRva2VuIHByaWNlcyBpbiBVU0QgKGNhY2hlZCBmcm9tIFB1bHNlWClcclxuICBjdXJyZW50VG9rZW5EZXRhaWxzOiBudWxsIC8vIEN1cnJlbnRseSB2aWV3aW5nIHRva2VuIGRldGFpbHNcclxufTtcclxuXHJcbi8vIEF1dG8tbG9jayB0aW1lclxyXG5sZXQgYXV0b0xvY2tUaW1lciA9IG51bGw7XHJcblxyXG4vLyBSYXRlIGxpbWl0aW5nIGZvciBwYXNzd29yZCBhdHRlbXB0c1xyXG5jb25zdCBSQVRFX0xJTUlUX0tFWSA9ICdwYXNzd29yZF9hdHRlbXB0cyc7XHJcbmNvbnN0IE1BWF9BVFRFTVBUUyA9IDU7XHJcbmNvbnN0IExPQ0tPVVRfRFVSQVRJT05fTVMgPSAzMCAqIDYwICogMTAwMDsgLy8gMzAgbWludXRlc1xyXG5cclxuLy8gTmV0d29yayBuYW1lcyBmb3IgZGlzcGxheVxyXG5jb25zdCBORVRXT1JLX05BTUVTID0ge1xyXG4gICdwdWxzZWNoYWluVGVzdG5ldCc6ICdQdWxzZUNoYWluIFRlc3RuZXQgVjQnLFxyXG4gICdwdWxzZWNoYWluJzogJ1B1bHNlQ2hhaW4gTWFpbm5ldCcsXHJcbiAgJ2V0aGVyZXVtJzogJ0V0aGVyZXVtIE1haW5uZXQnLFxyXG4gICdzZXBvbGlhJzogJ1NlcG9saWEgVGVzdG5ldCdcclxufTtcclxuXHJcbmNvbnN0IEJMT0NLX0VYUExPUkVSUyA9IHtcclxuICAncHVsc2VjaGFpblRlc3RuZXQnOiB7XHJcbiAgICBiYXNlOiAnaHR0cHM6Ly9zY2FuLnY0LnRlc3RuZXQucHVsc2VjaGFpbi5jb20nLFxyXG4gICAgdHg6ICcvdHgve2hhc2h9JyxcclxuICAgIGFkZHJlc3M6ICcvYWRkcmVzcy97YWRkcmVzc30nLFxyXG4gICAgdG9rZW46ICcvdG9rZW4ve2FkZHJlc3N9J1xyXG4gIH0sXHJcbiAgJ3B1bHNlY2hhaW4nOiB7XHJcbiAgICBiYXNlOiAnaHR0cHM6Ly9zY2FuLm15cGluYXRhLmNsb3VkL2lwZnMvYmFmeWJlaWVueHlveXJobjV0c3djbHZkM2dkank1bXRra3dtdTM3YXF0bWw2b25iZjd4bmIzbzIycGUvJyxcclxuICAgIHR4OiAnIy90eC97aGFzaH0nLFxyXG4gICAgYWRkcmVzczogJyMvYWRkcmVzcy97YWRkcmVzc30nLFxyXG4gICAgdG9rZW46ICcjL3Rva2VuL3thZGRyZXNzfSdcclxuICB9LFxyXG4gICdldGhlcmV1bSc6IHtcclxuICAgIGJhc2U6ICdodHRwczovL2V0aGVyc2Nhbi5pbycsXHJcbiAgICB0eDogJy90eC97aGFzaH0nLFxyXG4gICAgYWRkcmVzczogJy9hZGRyZXNzL3thZGRyZXNzfScsXHJcbiAgICB0b2tlbjogJy90b2tlbi97YWRkcmVzc30nXHJcbiAgfSxcclxuICAnc2Vwb2xpYSc6IHtcclxuICAgIGJhc2U6ICdodHRwczovL3NlcG9saWEuZXRoZXJzY2FuLmlvJyxcclxuICAgIHR4OiAnL3R4L3toYXNofScsXHJcbiAgICBhZGRyZXNzOiAnL2FkZHJlc3Mve2FkZHJlc3N9JyxcclxuICAgIHRva2VuOiAnL3Rva2VuL3thZGRyZXNzfSdcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogQnVpbGQgZXhwbG9yZXIgVVJMIGZvciBhIHNwZWNpZmljIHR5cGVcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIFVSTCB0eXBlICgndHgnLCAnYWRkcmVzcycsICd0b2tlbicpXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIFRoZSBoYXNoIG9yIGFkZHJlc3MgdmFsdWVcclxuICogQHJldHVybnMge3N0cmluZ30gQ29tcGxldGUgZXhwbG9yZXIgVVJMXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRFeHBsb3JlclVybChuZXR3b3JrLCB0eXBlLCB2YWx1ZSkge1xyXG4gIGNvbnN0IGV4cGxvcmVyID0gQkxPQ0tfRVhQTE9SRVJTW25ldHdvcmtdO1xyXG4gIGlmICghZXhwbG9yZXIpIHJldHVybiAnJztcclxuXHJcbiAgY29uc3QgcGF0dGVybiA9IGV4cGxvcmVyW3R5cGVdO1xyXG4gIGlmICghcGF0dGVybikgcmV0dXJuICcnO1xyXG5cclxuICByZXR1cm4gZXhwbG9yZXIuYmFzZSArIHBhdHRlcm4ucmVwbGFjZShgeyR7dHlwZSA9PT0gJ3R4JyA/ICdoYXNoJyA6ICdhZGRyZXNzJ319YCwgdmFsdWUpO1xyXG59XHJcblxyXG4vLyA9PT09PSBJTklUSUFMSVpBVElPTiA9PT09PVxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgYXN5bmMgKCkgPT4ge1xyXG4gIC8vIENoZWNrIGlmIHRoaXMgaXMgYSBjb25uZWN0aW9uIGFwcHJvdmFsIHJlcXVlc3RcclxuICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xyXG4gIGNvbnN0IGFjdGlvbiA9IHVybFBhcmFtcy5nZXQoJ2FjdGlvbicpO1xyXG4gIGNvbnN0IG9yaWdpbiA9IHVybFBhcmFtcy5nZXQoJ29yaWdpbicpO1xyXG4gIGNvbnN0IHJlcXVlc3RJZCA9IHVybFBhcmFtcy5nZXQoJ3JlcXVlc3RJZCcpO1xyXG5cclxuICBpZiAoYWN0aW9uID09PSAnY29ubmVjdCcgJiYgb3JpZ2luICYmIHJlcXVlc3RJZCkge1xyXG4gICAgLy8gU2hvdyBjb25uZWN0aW9uIGFwcHJvdmFsIHNjcmVlblxyXG4gICAgYXdhaXQgaGFuZGxlQ29ubmVjdGlvbkFwcHJvdmFsU2NyZWVuKG9yaWdpbiwgcmVxdWVzdElkKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmIChhY3Rpb24gPT09ICd0cmFuc2FjdGlvbicgJiYgcmVxdWVzdElkKSB7XHJcbiAgICAvLyBTaG93IHRyYW5zYWN0aW9uIGFwcHJvdmFsIHNjcmVlblxyXG4gICAgc2V0dXBFdmVudExpc3RlbmVycygpOyAvLyBTZXQgdXAgZXZlbnQgbGlzdGVuZXJzIGZpcnN0XHJcbiAgICBhd2FpdCBoYW5kbGVUcmFuc2FjdGlvbkFwcHJvdmFsU2NyZWVuKHJlcXVlc3RJZCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBpZiAoYWN0aW9uID09PSAnYWRkVG9rZW4nICYmIHJlcXVlc3RJZCkge1xyXG4gICAgLy8gU2hvdyB0b2tlbiBhZGQgYXBwcm92YWwgc2NyZWVuXHJcbiAgICBhd2FpdCBoYW5kbGVUb2tlbkFkZEFwcHJvdmFsU2NyZWVuKHJlcXVlc3RJZCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBOb3JtYWwgcG9wdXAgZmxvd1xyXG4gIC8vIFJ1biBtaWdyYXRpb24gZmlyc3QgKGNvbnZlcnRzIG9sZCBzaW5nbGUtd2FsbGV0IHRvIG11bHRpLXdhbGxldCBmb3JtYXQpXHJcbiAgYXdhaXQgbWlncmF0ZVRvTXVsdGlXYWxsZXQoKTtcclxuXHJcbiAgYXdhaXQgbG9hZFNldHRpbmdzKCk7XHJcbiAgYXdhaXQgbG9hZE5ldHdvcmsoKTtcclxuICBhcHBseVRoZW1lKCk7XHJcbiAgYXdhaXQgY2hlY2tXYWxsZXRTdGF0dXMoKTtcclxuICBzZXR1cEV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgdXBkYXRlTmV0d29ya0Rpc3BsYXlzKCk7XHJcbn0pO1xyXG5cclxuLy8gPT09PT0gU0NSRUVOIE5BVklHQVRJT04gPT09PT1cclxuZnVuY3Rpb24gc2hvd1NjcmVlbihzY3JlZW5JZCkge1xyXG4gIC8vIEhpZGUgYWxsIHNjcmVlbnNcclxuICBjb25zdCBzY3JlZW5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2lkXj1cInNjcmVlbi1cIl0nKTtcclxuICBzY3JlZW5zLmZvckVhY2goc2NyZWVuID0+IHNjcmVlbi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKSk7XHJcblxyXG4gIC8vIFNob3cgcmVxdWVzdGVkIHNjcmVlblxyXG4gIGNvbnN0IHNjcmVlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNjcmVlbklkKTtcclxuICBpZiAoc2NyZWVuKSB7XHJcbiAgICBzY3JlZW4uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAvLyBTY3JvbGwgdG8gdG9wIHdoZW4gc2hvd2luZyBuZXcgc2NyZWVuXHJcbiAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgMCk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBjaGVja1dhbGxldFN0YXR1cygpIHtcclxuICBjb25zdCBleGlzdHMgPSBhd2FpdCB3YWxsZXRFeGlzdHMoKTtcclxuXHJcbiAgaWYgKCFleGlzdHMpIHtcclxuICAgIC8vIE5vIHdhbGxldCAtIHNob3cgc2V0dXAgc2NyZWVuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tc2V0dXAnKTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gV2FsbGV0IGV4aXN0cyAtIHNob3cgdW5sb2NrIHNjcmVlblxyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXVubG9jaycpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gU0VUVElOR1MgPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gbG9hZFNldHRpbmdzKCkge1xyXG4gIGNvbnN0IHNhdmVkID0gYXdhaXQgbG9hZCgnc2V0dGluZ3MnKTtcclxuICBpZiAoc2F2ZWQpIHtcclxuICAgIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncyA9IHsgLi4uY3VycmVudFN0YXRlLnNldHRpbmdzLCAuLi5zYXZlZCB9O1xyXG4gIH1cclxuXHJcbiAgLy8gTG9hZCBuZXR3b3JrIHNldHRpbmdzXHJcbiAgY29uc3QgbmV0d29ya1NldHRpbmdzID0gYXdhaXQgbG9hZCgnbmV0d29ya1NldHRpbmdzJyk7XHJcbiAgaWYgKG5ldHdvcmtTZXR0aW5ncykge1xyXG4gICAgY3VycmVudFN0YXRlLm5ldHdvcmtTZXR0aW5ncyA9IG5ldHdvcmtTZXR0aW5ncztcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVTZXR0aW5ncygpIHtcclxuICBhd2FpdCBzYXZlKCdzZXR0aW5ncycsIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncyk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGxvYWROZXR3b3JrKCkge1xyXG4gIGNvbnN0IHNhdmVkID0gYXdhaXQgbG9hZCgnY3VycmVudE5ldHdvcmsnKTtcclxuICBpZiAoc2F2ZWQpIHtcclxuICAgIGN1cnJlbnRTdGF0ZS5uZXR3b3JrID0gc2F2ZWQ7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzYXZlTmV0d29yaygpIHtcclxuICBhd2FpdCBzYXZlKCdjdXJyZW50TmV0d29yaycsIGN1cnJlbnRTdGF0ZS5uZXR3b3JrKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlUaGVtZSgpIHtcclxuICAvLyBSZW1vdmUgYWxsIHRoZW1lIGNsYXNzZXNcclxuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3RoZW1lLWhpZ2gtY29udHJhc3QnLCAndGhlbWUtcHJvZmVzc2lvbmFsJywgJ3RoZW1lLWFtYmVyJywgJ3RoZW1lLWNnYScsICd0aGVtZS1jbGFzc2ljJyk7XHJcblxyXG4gIC8vIEFwcGx5IGN1cnJlbnQgdGhlbWVcclxuICBpZiAoY3VycmVudFN0YXRlLnNldHRpbmdzLnRoZW1lICE9PSAnaGlnaC1jb250cmFzdCcpIHtcclxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZChgdGhlbWUtJHtjdXJyZW50U3RhdGUuc2V0dGluZ3MudGhlbWV9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBFVkVOVCBMSVNURU5FUlMgPT09PT1cclxuZnVuY3Rpb24gc2V0dXBFdmVudExpc3RlbmVycygpIHtcclxuICAvLyBTZXR1cCBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNyZWF0ZS13YWxsZXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICBhd2FpdCBnZW5lcmF0ZU5ld01uZW1vbmljKCk7XHJcbiAgICB1cGRhdGVOZXR3b3JrRGlzcGxheXMoKTtcclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1jcmVhdGUnKTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1pbXBvcnQtd2FsbGV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgdXBkYXRlTmV0d29ya0Rpc3BsYXlzKCk7XHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4taW1wb3J0Jyk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIE5ldHdvcmsgc2VsZWN0aW9uIG9uIHNldHVwIHNjcmVlblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrLXNlbGVjdC1zZXR1cCcpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgY3VycmVudFN0YXRlLm5ldHdvcmsgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgIHNhdmVOZXR3b3JrKCk7XHJcbiAgICB1cGRhdGVOZXR3b3JrRGlzcGxheXMoKTtcclxuICB9KTtcclxuXHJcbiAgLy8gQ3JlYXRlIHdhbGxldCBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hrLXNhdmVkLW1uZW1vbmljJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XHJcbiAgICBjb25zdCBwYXNzd29yZENyZWF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1jcmVhdGUnKS52YWx1ZTtcclxuICAgIGNvbnN0IHBhc3N3b3JkQ29uZmlybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1jb25maXJtJykudmFsdWU7XHJcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNyZWF0ZS1zdWJtaXQnKTtcclxuXHJcbiAgICBidG4uZGlzYWJsZWQgPSAhKGUudGFyZ2V0LmNoZWNrZWQgJiYgcGFzc3dvcmRDcmVhdGUgJiYgcGFzc3dvcmRDb25maXJtICYmIHBhc3N3b3JkQ3JlYXRlID09PSBwYXNzd29yZENvbmZpcm0pO1xyXG4gIH0pO1xyXG5cclxuICBbJ3Bhc3N3b3JkLWNyZWF0ZScsICdwYXNzd29yZC1jb25maXJtJ10uZm9yRWFjaChpZCA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBjaGVja2VkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Noay1zYXZlZC1tbmVtb25pYycpLmNoZWNrZWQ7XHJcbiAgICAgIGNvbnN0IHBhc3N3b3JkQ3JlYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLWNyZWF0ZScpLnZhbHVlO1xyXG4gICAgICBjb25zdCBwYXNzd29yZENvbmZpcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtY29uZmlybScpLnZhbHVlO1xyXG4gICAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNyZWF0ZS1zdWJtaXQnKTtcclxuXHJcbiAgICAgIGJ0bi5kaXNhYmxlZCA9ICEoY2hlY2tlZCAmJiBwYXNzd29yZENyZWF0ZSAmJiBwYXNzd29yZENvbmZpcm0gJiYgcGFzc3dvcmRDcmVhdGUgPT09IHBhc3N3b3JkQ29uZmlybSk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jcmVhdGUtc3VibWl0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQ3JlYXRlV2FsbGV0KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1jcmVhdGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzaG93U2NyZWVuKCdzY3JlZW4tc2V0dXAnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20tY3JlYXRlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLXNldHVwJykpO1xyXG5cclxuICAvLyBJbXBvcnQgd2FsbGV0IHNjcmVlblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbXBvcnQtbWV0aG9kJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XHJcbiAgICBjb25zdCBtbmVtb25pY0dyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1tbmVtb25pYy1ncm91cCcpO1xyXG4gICAgY29uc3QgcHJpdmF0ZWtleUdyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1wcml2YXRla2V5LWdyb3VwJyk7XHJcblxyXG4gICAgaWYgKGUudGFyZ2V0LnZhbHVlID09PSAnbW5lbW9uaWMnKSB7XHJcbiAgICAgIG1uZW1vbmljR3JvdXAuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIHByaXZhdGVrZXlHcm91cC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG1uZW1vbmljR3JvdXAuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgIHByaXZhdGVrZXlHcm91cC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1pbXBvcnQtc3VibWl0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlSW1wb3J0V2FsbGV0KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1pbXBvcnQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzaG93U2NyZWVuKCdzY3JlZW4tc2V0dXAnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20taW1wb3J0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLXNldHVwJykpO1xyXG5cclxuICAvLyBVbmxvY2sgc2NyZWVuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi11bmxvY2snKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVVbmxvY2spO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC11bmxvY2snKT8uYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCAoZSkgPT4ge1xyXG4gICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XHJcbiAgICAgIGhhbmRsZVVubG9jaygpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBDdXN0b20gbmV0d29yayBkcm9wZG93blxyXG4gIGNvbnN0IG5ldHdvcmtTZWxlY3RDdXN0b20gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1zZWxlY3QtY3VzdG9tJyk7XHJcbiAgY29uc3QgbmV0d29ya0Ryb3Bkb3duTWVudSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrLWRyb3Bkb3duLW1lbnUnKTtcclxuXHJcbiAgLy8gSW5pdGlhbGl6ZSBkcm9wZG93biBvcHRpb24gbG9nb3NcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubmV0d29yay1vcHRpb24gaW1nJykuZm9yRWFjaChpbWcgPT4ge1xyXG4gICAgY29uc3QgbG9nb0ZpbGUgPSBpbWcuZ2V0QXR0cmlidXRlKCdkYXRhLWxvZ28nKTtcclxuICAgIGlmIChsb2dvRmlsZSkge1xyXG4gICAgICBpbWcuc3JjID0gY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBhc3NldHMvbG9nb3MvJHtsb2dvRmlsZX1gKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gVG9nZ2xlIGRyb3Bkb3duXHJcbiAgbmV0d29ya1NlbGVjdEN1c3RvbT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIG5ldHdvcmtEcm9wZG93bk1lbnUuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEhhbmRsZSBvcHRpb24gc2VsZWN0aW9uXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5ldHdvcmstb3B0aW9uJykuZm9yRWFjaChvcHRpb24gPT4ge1xyXG4gICAgb3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGUpID0+IHtcclxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgY29uc3QgbmV0d29yayA9IG9wdGlvbi5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmV0d29yaycpO1xyXG4gICAgICBjb25zdCBuZXR3b3JrVGV4dCA9IG9wdGlvbi5xdWVyeVNlbGVjdG9yKCdzcGFuJykudGV4dENvbnRlbnQ7XHJcblxyXG4gICAgICBjdXJyZW50U3RhdGUubmV0d29yayA9IG5ldHdvcms7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrLXNlbGVjdGVkLXRleHQnKS50ZXh0Q29udGVudCA9IG5ldHdvcmtUZXh0O1xyXG4gICAgICBuZXR3b3JrRHJvcGRvd25NZW51LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgc2F2ZU5ldHdvcmsoKTtcclxuICAgICAgdXBkYXRlTmV0d29ya0Rpc3BsYXlzKCk7XHJcbiAgICAgIGF3YWl0IGZldGNoQmFsYW5jZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSG92ZXIgZWZmZWN0IC0gYm9sZCB0ZXh0XHJcbiAgICBvcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHtcclxuICAgICAgb3B0aW9uLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKS5zdHlsZS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xyXG4gICAgfSk7XHJcbiAgICBvcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHtcclxuICAgICAgb3B0aW9uLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKS5zdHlsZS5mb250V2VpZ2h0ID0gJ25vcm1hbCc7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQ2xvc2UgZHJvcGRvd24gd2hlbiBjbGlja2luZyBvdXRzaWRlXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBuZXR3b3JrRHJvcGRvd25NZW51Py5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhbGxldC1zZWxlY3QnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgYXN5bmMgKGUpID0+IHtcclxuICAgIGNvbnN0IHNlbGVjdGVkV2FsbGV0SWQgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgIGlmIChzZWxlY3RlZFdhbGxldElkKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgc2V0QWN0aXZlV2FsbGV0KHNlbGVjdGVkV2FsbGV0SWQpO1xyXG4gICAgICAgIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgICAgIGN1cnJlbnRTdGF0ZS5hZGRyZXNzID0gd2FsbGV0LmFkZHJlc3M7XHJcbiAgICAgICAgYXdhaXQgdXBkYXRlRGFzaGJvYXJkKCk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgYWxlcnQoJ0Vycm9yIHN3aXRjaGluZyB3YWxsZXQ6ICcgKyBzYW5pdGl6ZUVycm9yKGVycm9yLm1lc3NhZ2UpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWxvY2snKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVMb2NrKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlZnJlc2gnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICBhd2FpdCB1cGRhdGVEYXNoYm9hcmQoKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXNldHRpbmdzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgbG9hZFNldHRpbmdzVG9VSSgpO1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXNldHRpbmdzJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tbmV0d29yay1zZXR0aW5ncycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGxvYWROZXR3b3JrU2V0dGluZ3NUb1VJKCk7XHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tbmV0d29yay1zZXR0aW5ncycpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS1uZXR3b3JrLXNldHRpbmdzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXNldHRpbmdzJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tc2F2ZS1uZXR3b3JrLXNldHRpbmdzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgYXdhaXQgc2F2ZU5ldHdvcmtTZXR0aW5ncygpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlc2V0LW5ldHdvcmstc2V0dGluZ3MnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBpZiAoY29uZmlybSgnUmVzZXQgYWxsIG5ldHdvcmsgc2V0dGluZ3MgdG8gZGVmYXVsdHM/JykpIHtcclxuICAgICAgcmVzZXROZXR3b3JrU2V0dGluZ3NUb0RlZmF1bHRzKCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LWFkZHJlc3MnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDb3B5QWRkcmVzcyk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1zZW5kJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2hvd1NlbmRTY3JlZW4pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVjZWl2ZScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3dSZWNlaXZlU2NyZWVuKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXRva2VucycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3dUb2tlbnNTY3JlZW4pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdHgtaGlzdG9yeScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3dUcmFuc2FjdGlvbkhpc3RvcnkpO1xyXG5cclxuICAvLyBTZW5kIHNjcmVlblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYmFjay1mcm9tLXNlbmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJyk7XHJcbiAgICB1cGRhdGVEYXNoYm9hcmQoKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvbmZpcm0tc2VuZCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVNlbmRUcmFuc2FjdGlvbik7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtc2VuZCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1zZW5kLW1heCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVNlbmRNYXgpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWFzc2V0LXNlbGVjdCcpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVBc3NldENoYW5nZSk7XHJcblxyXG4gIC8vIFJlY2VpdmUgc2NyZWVuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20tcmVjZWl2ZScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LXJlY2VpdmUtYWRkcmVzcycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNvcHlSZWNlaXZlQWRkcmVzcyk7XHJcblxyXG4gIC8vIFRva2VucyBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS10b2tlbnMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYWRkLWN1c3RvbS10b2tlbicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3dBZGRUb2tlbk1vZGFsKTtcclxuXHJcbiAgLy8gVG9rZW4gRGV0YWlscyBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS10b2tlbi1kZXRhaWxzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXRva2VucycpO1xyXG4gICAgYXdhaXQgcmVuZGVyVG9rZW5zU2NyZWVuKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtY29weS1hZGRyZXNzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQ29weVRva2VuRGV0YWlsc0FkZHJlc3MpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdG9rZW4tc2VuZC1tYXgnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVUb2tlblNlbmRNYXgpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdG9rZW4tc2VuZCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVRva2VuU2VuZCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtZW5hYmxlLXRvZ2dsZScpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVUb2tlbkVuYWJsZVRvZ2dsZSk7XHJcblxyXG4gIC8vIFRyYW5zYWN0aW9uIEhpc3RvcnlcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGVuZGluZy10eC1pbmRpY2F0b3InKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93VHJhbnNhY3Rpb25IaXN0b3J5KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS10eC1oaXN0b3J5Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsdGVyLWFsbC10eHMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiByZW5kZXJUcmFuc2FjdGlvbkhpc3RvcnkoJ2FsbCcpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsdGVyLXBlbmRpbmctdHhzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gcmVuZGVyVHJhbnNhY3Rpb25IaXN0b3J5KCdwZW5kaW5nJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWx0ZXItY29uZmlybWVkLXR4cycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHJlbmRlclRyYW5zYWN0aW9uSGlzdG9yeSgnY29uZmlybWVkJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xlYXItdHgtaGlzdG9yeScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNsZWFyVHJhbnNhY3Rpb25IaXN0b3J5KTtcclxuXHJcbiAgLy8gVHJhbnNhY3Rpb24gRGV0YWlsc1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYmFjay1mcm9tLXR4LWRldGFpbHMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzaG93U2NyZWVuKCdzY3JlZW4tdHgtaGlzdG9yeScpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvcHktdHgtaGFzaCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgIGNvbnN0IGhhc2ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLWhhc2gnKS50ZXh0Q29udGVudDtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGhhc2gpO1xyXG4gICAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvcHktdHgtaGFzaCcpO1xyXG4gICAgICBjb25zdCBvcmlnaW5hbFRleHQgPSBidG4udGV4dENvbnRlbnQ7XHJcbiAgICAgIGJ0bi50ZXh0Q29udGVudCA9ICdDT1BJRUQhJztcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgYnRuLnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0O1xyXG4gICAgICB9LCAyMDAwKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGFsZXJ0KCdGYWlsZWQgdG8gY29weSBoYXNoJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1zcGVlZC11cC10eCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVNwZWVkVXBUcmFuc2FjdGlvbik7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtdHgnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDYW5jZWxUcmFuc2FjdGlvbik7XHJcblxyXG4gIC8vIEFkZCB0b2tlbiBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtYWRkLXRva2VuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWFkZC10b2tlbicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2FuY2VsLWFkZC10b2tlbicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtdG9rZW4nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvbmZpcm0tYWRkLXRva2VuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQWRkQ3VzdG9tVG9rZW4pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC10b2tlbi1hZGRyZXNzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgaGFuZGxlVG9rZW5BZGRyZXNzSW5wdXQpO1xyXG5cclxuICAvLyBTZXR0aW5ncyBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS1zZXR0aW5ncycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctdGhlbWUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy50aGVtZSA9IGUudGFyZ2V0LnZhbHVlO1xyXG4gICAgYXBwbHlUaGVtZSgpO1xyXG4gICAgc2F2ZVNldHRpbmdzKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctZGVjaW1hbHMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5kZWNpbWFsUGxhY2VzID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgc2F2ZVNldHRpbmdzKCk7XHJcbiAgICB1cGRhdGVCYWxhbmNlRGlzcGxheSgpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLWF1dG9sb2NrJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XHJcbiAgICBjdXJyZW50U3RhdGUuc2V0dGluZ3MuYXV0b0xvY2tNaW51dGVzID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgc2F2ZVNldHRpbmdzKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctbWF4LWdhcy1wcmljZScpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgY3VycmVudFN0YXRlLnNldHRpbmdzLm1heEdhc1ByaWNlR3dlaSA9IHBhcnNlSW50KGUudGFyZ2V0LnZhbHVlKTtcclxuICAgIHNhdmVTZXR0aW5ncygpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLXNob3ctdGVzdG5ldHMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5zaG93VGVzdE5ldHdvcmtzID0gZS50YXJnZXQuY2hlY2tlZDtcclxuICAgIHNhdmVTZXR0aW5ncygpO1xyXG4gICAgdXBkYXRlTmV0d29ya1NlbGVjdG9yKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi12aWV3LXNlZWQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVWaWV3U2VlZCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1leHBvcnQta2V5Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlRXhwb3J0S2V5KTtcclxuXHJcbiAgLy8gUGFzc3dvcmQgcHJvbXB0IG1vZGFsXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1wYXNzd29yZC1wcm9tcHQtY29uZmlybScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1pbnB1dCcpLnZhbHVlO1xyXG4gICAgaWYgKHBhc3N3b3JkKSB7XHJcbiAgICAgIGNsb3NlUGFzc3dvcmRQcm9tcHQocGFzc3dvcmQpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXBhc3N3b3JkLXByb21wdC1jYW5jZWwnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBjbG9zZVBhc3N3b3JkUHJvbXB0KG51bGwpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLXBhc3N3b3JkLXByb21wdCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGNsb3NlUGFzc3dvcmRQcm9tcHQobnVsbCk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1wcm9tcHQtaW5wdXQnKT8uYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCAoZSkgPT4ge1xyXG4gICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XHJcbiAgICAgIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1pbnB1dCcpLnZhbHVlO1xyXG4gICAgICBpZiAocGFzc3dvcmQpIHtcclxuICAgICAgICBjbG9zZVBhc3N3b3JkUHJvbXB0KHBhc3N3b3JkKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBEaXNwbGF5IHNlY3JldCBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtZGlzcGxheS1zZWNyZXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZVNlY3JldE1vZGFsKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLWRpc3BsYXktc2VjcmV0LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlU2VjcmV0TW9kYWwpO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvcHktc2VjcmV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgY29uc3Qgc2VjcmV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpc3BsYXktc2VjcmV0LWNvbnRlbnQnKS50ZXh0Q29udGVudDtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHNlY3JldCk7XHJcbiAgICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS1zZWNyZXQnKTtcclxuICAgICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gYnRuLnRleHRDb250ZW50O1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSAnQ09QSUVEISc7XHJcbiAgICAgIGJ0bi5jbGFzc0xpc3QuYWRkKCd0ZXh0LXN1Y2Nlc3MnKTtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgYnRuLnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0O1xyXG4gICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCd0ZXh0LXN1Y2Nlc3MnKTtcclxuICAgICAgfSwgMjAwMCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBhbGVydCgnRmFpbGVkIHRvIGNvcHkgdG8gY2xpcGJvYXJkJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIC8vIE11bHRpLXdhbGxldCBtYW5hZ2VtZW50XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1tYW5hZ2Utd2FsbGV0cycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZU1hbmFnZVdhbGxldHMpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYmFjay1mcm9tLW1hbmFnZS13YWxsZXRzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLXNldHRpbmdzJykpO1xyXG5cclxuICAvLyBBZGQgd2FsbGV0IGJ1dHRvbnNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNyZWF0ZS1uZXctd2FsbGV0LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2hvd0FkZFdhbGxldE1vZGFsKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWltcG9ydC13YWxsZXQtbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93QWRkV2FsbGV0TW9kYWwpO1xyXG5cclxuICAvLyBBZGQgd2FsbGV0IG1vZGFsIC0gb3B0aW9uIHNlbGVjdGlvblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtd2FsbGV0LW9wdGlvbi1jcmVhdGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYWRkLXdhbGxldCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZ2VuZXJhdGVOZXdNbmVtb25pY011bHRpKCk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtY3JlYXRlLXdhbGxldC1tdWx0aScpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkLXdhbGxldC1vcHRpb24tbW5lbW9uaWMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYWRkLXdhbGxldCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1zZWVkLW11bHRpJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtd2FsbGV0LW9wdGlvbi1wcml2YXRla2V5Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWFkZC13YWxsZXQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1pbXBvcnQta2V5LW11bHRpJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtYWRkLXdhbGxldCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtd2FsbGV0JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIENyZWF0ZSB3YWxsZXQgbXVsdGkgbW9kYWxcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvbmZpcm0tY3JlYXRlLXdhbGxldC1tdWx0aScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNyZWF0ZU5ld1dhbGxldE11bHRpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1jcmVhdGUtd2FsbGV0LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWNyZWF0ZS13YWxsZXQtbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1uZXctd2FsbGV0LW5pY2tuYW1lJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0xLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0yLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZmljYXRpb24tZXJyb3ItbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLWNyZWF0ZS13YWxsZXQtbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtY3JlYXRlLXdhbGxldC1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LW5ldy13YWxsZXQtbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTEtbXVsdGknKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTItbXVsdGknKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTMtbXVsdGknKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmaWNhdGlvbi1lcnJvci1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBJbXBvcnQgc2VlZCBtdWx0aSBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29uZmlybS1pbXBvcnQtc2VlZC1tdWx0aScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUltcG9ydFNlZWRNdWx0aSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtaW1wb3J0LXNlZWQtbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LXNlZWQtbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtc2VlZC1uaWNrbmFtZScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXNlZWQtcGhyYXNlJykudmFsdWUgPSAnJztcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLWltcG9ydC1zZWVkLW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1zZWVkLW11bHRpJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXNlZWQtbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1zZWVkLXBocmFzZScpLnZhbHVlID0gJyc7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEltcG9ydCBwcml2YXRlIGtleSBtdWx0aSBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29uZmlybS1pbXBvcnQta2V5LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlSW1wb3J0S2V5TXVsdGkpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2FuY2VsLWltcG9ydC1rZXktbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LWtleS1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1rZXktbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1wcml2YXRlLWtleScpLnZhbHVlID0gJyc7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS1pbXBvcnQta2V5LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1rZXktbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQta2V5LW5pY2tuYW1lJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtcHJpdmF0ZS1rZXknKS52YWx1ZSA9ICcnO1xyXG4gIH0pO1xyXG5cclxuICAvLyBSZW5hbWUgd2FsbGV0IG1vZGFsXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb25maXJtLXJlbmFtZS13YWxsZXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVSZW5hbWVXYWxsZXRDb25maXJtKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1yZW5hbWUtd2FsbGV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXJlbmFtZS13YWxsZXQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGN1cnJlbnRSZW5hbWVXYWxsZXRJZCA9IG51bGw7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS1yZW5hbWUtd2FsbGV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXJlbmFtZS13YWxsZXQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGN1cnJlbnRSZW5hbWVXYWxsZXRJZCA9IG51bGw7XHJcbiAgfSk7XHJcblxyXG4gIC8vIFRyYW5zYWN0aW9uIHN1Y2Nlc3MgbW9kYWxcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLXR4LXN1Y2Nlc3MnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtdHgtc3VjY2VzcycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tb2stdHgtc3VjY2VzcycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC10eC1zdWNjZXNzJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LXR4LWhhc2gnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCB0eEhhc2ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc3VjY2Vzcy1oYXNoJykudGV4dENvbnRlbnQ7XHJcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHR4SGFzaCk7XHJcbiAgICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS10eC1oYXNoJyk7XHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGJ0bi50ZXh0Q29udGVudDtcclxuICAgICAgYnRuLnRleHRDb250ZW50ID0gJ0NvcGllZCEnO1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBidG4udGV4dENvbnRlbnQgPSBvcmlnaW5hbFRleHQ7XHJcbiAgICAgIH0sIDIwMDApO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgYWxlcnQoJ0ZhaWxlZCB0byBjb3B5IHRyYW5zYWN0aW9uIGhhc2gnKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gVHJhbnNhY3Rpb24gU3RhdHVzIEJ1dHRvbnMgKGluIGFwcHJvdmFsIHBvcHVwKVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdHgtc3RhdHVzLWV4cGxvcmVyJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgaWYgKCF0eFN0YXR1c0N1cnJlbnRIYXNoKSByZXR1cm47XHJcbiAgICBjb25zdCB1cmwgPSBnZXRFeHBsb3JlclVybChjdXJyZW50U3RhdGUubmV0d29yaywgJ3R4JywgdHhTdGF0dXNDdXJyZW50SGFzaCk7XHJcbiAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmwgfSk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtdHgtc3RhdHVzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ/Cfq4AgQ2xvc2UgYnV0dG9uIGNsaWNrZWQnKTtcclxuICAgIGlmICh0eFN0YXR1c1BvbGxJbnRlcnZhbCkge1xyXG4gICAgICBjbGVhckludGVydmFsKHR4U3RhdHVzUG9sbEludGVydmFsKTtcclxuICAgICAgdHhTdGF0dXNQb2xsSW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgd2luZG93LmNsb3NlKCk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdHgtc3RhdHVzLXNwZWVkLXVwJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKCF0eFN0YXR1c0N1cnJlbnRIYXNoIHx8ICF0eFN0YXR1c0N1cnJlbnRBZGRyZXNzKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ1NwZWVkIFVwIFRyYW5zYWN0aW9uJywgJ0VudGVyIHlvdXIgcGFzc3dvcmQgdG8gc3BlZWQgdXAgdGhpcyB0cmFuc2FjdGlvbiB3aXRoIGhpZ2hlciBnYXMgcHJpY2UgKDEuMngpJyk7XHJcbiAgICBpZiAoIXBhc3N3b3JkKSByZXR1cm47XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICAgIGNvbnN0IHNlc3Npb25SZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnQ1JFQVRFX1NFU1NJT04nLFxyXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcclxuICAgICAgICB3YWxsZXRJZDogYWN0aXZlV2FsbGV0LmlkLFxyXG4gICAgICAgIGR1cmF0aW9uTXM6IDYwMDAwXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKCFzZXNzaW9uUmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgIGFsZXJ0KCdJbnZhbGlkIHBhc3N3b3JkJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnU1BFRURfVVBfVFgnLFxyXG4gICAgICAgIGFkZHJlc3M6IHR4U3RhdHVzQ3VycmVudEFkZHJlc3MsXHJcbiAgICAgICAgdHhIYXNoOiB0eFN0YXR1c0N1cnJlbnRIYXNoLFxyXG4gICAgICAgIHNlc3Npb25Ub2tlbjogc2Vzc2lvblJlc3BvbnNlLnNlc3Npb25Ub2tlbixcclxuICAgICAgICBnYXNQcmljZU11bHRpcGxpZXI6IDEuMlxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgYWxlcnQoYFRyYW5zYWN0aW9uIHNwZWQgdXAhXFxuTmV3IFRYOiAke3Jlc3BvbnNlLnR4SGFzaC5zbGljZSgwLCAyMCl9Li4uXFxuXFxuVGhlIHdpbmRvdyB3aWxsIG5vdyBjbG9zZS5gKTtcclxuICAgICAgICBpZiAodHhTdGF0dXNQb2xsSW50ZXJ2YWwpIHtcclxuICAgICAgICAgIGNsZWFySW50ZXJ2YWwodHhTdGF0dXNQb2xsSW50ZXJ2YWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBhbGVydCgnRXJyb3Igc3BlZWRpbmcgdXAgdHJhbnNhY3Rpb246ICcgKyBzYW5pdGl6ZUVycm9yKHJlc3BvbnNlLmVycm9yKSk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGFsZXJ0KCdFcnJvcjogJyArIHNhbml0aXplRXJyb3IoZXJyb3IubWVzc2FnZSkpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXR4LXN0YXR1cy1jYW5jZWwnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICBpZiAoIXR4U3RhdHVzQ3VycmVudEhhc2ggfHwgIXR4U3RhdHVzQ3VycmVudEFkZHJlc3MpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBwYXNzd29yZCA9IGF3YWl0IHNob3dQYXNzd29yZFByb21wdCgnQ2FuY2VsIFRyYW5zYWN0aW9uJywgJ0VudGVyIHlvdXIgcGFzc3dvcmQgdG8gY2FuY2VsIHRoaXMgdHJhbnNhY3Rpb24gYnkgc2VuZGluZyBhIDAtdmFsdWUgcmVwbGFjZW1lbnQnKTtcclxuICAgIGlmICghcGFzc3dvcmQpIHJldHVybjtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBhY3RpdmVXYWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgICAgY29uc3Qgc2Vzc2lvblJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgIHR5cGU6ICdDUkVBVEVfU0VTU0lPTicsXHJcbiAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkLFxyXG4gICAgICAgIHdhbGxldElkOiBhY3RpdmVXYWxsZXQuaWQsXHJcbiAgICAgICAgZHVyYXRpb25NczogNjAwMDBcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoIXNlc3Npb25SZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgYWxlcnQoJ0ludmFsaWQgcGFzc3dvcmQnKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgIHR5cGU6ICdDQU5DRUxfVFgnLFxyXG4gICAgICAgIGFkZHJlc3M6IHR4U3RhdHVzQ3VycmVudEFkZHJlc3MsXHJcbiAgICAgICAgdHhIYXNoOiB0eFN0YXR1c0N1cnJlbnRIYXNoLFxyXG4gICAgICAgIHNlc3Npb25Ub2tlbjogc2Vzc2lvblJlc3BvbnNlLnNlc3Npb25Ub2tlblxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgYWxlcnQoYFRyYW5zYWN0aW9uIGNhbmNlbGxlZCFcXG5DYW5jZWxsYXRpb24gVFg6ICR7cmVzcG9uc2UudHhIYXNoLnNsaWNlKDAsIDIwKX0uLi5cXG5cXG5UaGUgd2luZG93IHdpbGwgbm93IGNsb3NlLmApO1xyXG4gICAgICAgIGlmICh0eFN0YXR1c1BvbGxJbnRlcnZhbCkge1xyXG4gICAgICAgICAgY2xlYXJJbnRlcnZhbCh0eFN0YXR1c1BvbGxJbnRlcnZhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGFsZXJ0KCdFcnJvciBjYW5jZWxsaW5nIHRyYW5zYWN0aW9uOiAnICsgc2FuaXRpemVFcnJvcihyZXNwb25zZS5lcnJvcikpO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBhbGVydCgnRXJyb3I6ICcgKyBzYW5pdGl6ZUVycm9yKGVycm9yLm1lc3NhZ2UpKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gR2xvYmFsIGFjdGl2aXR5IHRyYWNraW5nIGZvciBhdXRvLWxvY2tcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlc2V0QWN0aXZpdHlUaW1lcik7XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCByZXNldEFjdGl2aXR5VGltZXIpO1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHJlc2V0QWN0aXZpdHlUaW1lcik7XHJcbn1cclxuXHJcbi8vID09PT09IFdBTExFVCBDUkVBVElPTiA9PT09PVxyXG5sZXQgZ2VuZXJhdGVkTW5lbW9uaWMgPSAnJztcclxubGV0IHZlcmlmaWNhdGlvbldvcmRzID0gW107IC8vIEFycmF5IG9mIHtpbmRleCwgd29yZH0gZm9yIHZlcmlmaWNhdGlvblxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVOZXdNbmVtb25pYygpIHtcclxuICB0cnkge1xyXG4gICAgLy8gSW1wb3J0IGV0aGVycyB0byBnZW5lcmF0ZSBtbmVtb25pY1xyXG4gICAgY29uc3QgeyBldGhlcnMgfSA9IGF3YWl0IGltcG9ydCgnZXRoZXJzJyk7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUgYSByYW5kb20gd2FsbGV0IHRvIGdldCB0aGUgbW5lbW9uaWNcclxuICAgIGNvbnN0IHJhbmRvbVdhbGxldCA9IGV0aGVycy5XYWxsZXQuY3JlYXRlUmFuZG9tKCk7XHJcbiAgICBnZW5lcmF0ZWRNbmVtb25pYyA9IHJhbmRvbVdhbGxldC5tbmVtb25pYy5waHJhc2U7XHJcblxyXG4gICAgLy8gRGlzcGxheSB0aGUgbW5lbW9uaWNcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtbmVtb25pYy1kaXNwbGF5JykudGV4dENvbnRlbnQgPSBnZW5lcmF0ZWRNbmVtb25pYztcclxuXHJcbiAgICAvLyBTZXQgdXAgdmVyaWZpY2F0aW9uIChhc2sgZm9yIDMgcmFuZG9tIHdvcmRzIHVzaW5nIGNyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSByYW5kb20pXHJcbiAgICBjb25zdCB3b3JkcyA9IGdlbmVyYXRlZE1uZW1vbmljLnNwbGl0KCcgJyk7XHJcbiAgICBjb25zdCByYW5kb21CeXRlcyA9IG5ldyBVaW50OEFycmF5KDMpO1xyXG4gICAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhyYW5kb21CeXRlcyk7XHJcbiAgICBjb25zdCBpbmRpY2VzID0gW1xyXG4gICAgICByYW5kb21CeXRlc1swXSAlIDQsIC8vIFdvcmQgMS00XHJcbiAgICAgIDQgKyAocmFuZG9tQnl0ZXNbMV0gJSA0KSwgLy8gV29yZCA1LThcclxuICAgICAgOCArIChyYW5kb21CeXRlc1syXSAlIDQpIC8vIFdvcmQgOS0xMlxyXG4gICAgXTtcclxuXHJcbiAgICB2ZXJpZmljYXRpb25Xb3JkcyA9IGluZGljZXMubWFwKGkgPT4gKHsgaW5kZXg6IGksIHdvcmQ6IHdvcmRzW2ldIH0pKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIFVJIHdpdGggdGhlIHJhbmRvbSBpbmRpY2VzXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMS1udW0nKS50ZXh0Q29udGVudCA9ICh2ZXJpZmljYXRpb25Xb3Jkc1swXS5pbmRleCArIDEpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTItbnVtJykudGV4dENvbnRlbnQgPSAodmVyaWZpY2F0aW9uV29yZHNbMV0uaW5kZXggKyAxKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zLW51bScpLnRleHRDb250ZW50ID0gKHZlcmlmaWNhdGlvbldvcmRzWzJdLmluZGV4ICsgMSk7XHJcblxyXG4gICAgLy8gQ2xlYXIgdGhlIHZlcmlmaWNhdGlvbiBpbnB1dHNcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0xJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0yJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZmljYXRpb24tZXJyb3InKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2VuZXJhdGluZyBtbmVtb25pYzonLCBlcnJvcik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW5lbW9uaWMtZGlzcGxheScpLnRleHRDb250ZW50ID0gJ0Vycm9yIGdlbmVyYXRpbmcgbW5lbW9uaWMuIFBsZWFzZSB0cnkgYWdhaW4uJztcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNyZWF0ZVdhbGxldCgpIHtcclxuICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1jcmVhdGUnKS52YWx1ZTtcclxuICBjb25zdCBwYXNzd29yZENvbmZpcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtY29uZmlybScpLnZhbHVlO1xyXG4gIGNvbnN0IGVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NyZWF0ZS1lcnJvcicpO1xyXG4gIGNvbnN0IHZlcmlmaWNhdGlvbkVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmaWNhdGlvbi1lcnJvcicpO1xyXG5cclxuICAvLyBWYWxpZGF0ZVxyXG4gIGlmIChwYXNzd29yZCAhPT0gcGFzc3dvcmRDb25maXJtKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9ICdQYXNzd29yZHMgZG8gbm90IG1hdGNoJztcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gRW5zdXJlIHdlIGhhdmUgYSBtbmVtb25pY1xyXG4gIGlmICghZ2VuZXJhdGVkTW5lbW9uaWMpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gJ05vIG1uZW1vbmljIGdlbmVyYXRlZC4gUGxlYXNlIGdvIGJhY2sgYW5kIHRyeSBhZ2Fpbi4nO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBWZXJpZnkgc2VlZCBwaHJhc2Ugd29yZHNcclxuICBjb25zdCB3b3JkMSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0xJykudmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3Qgd29yZDIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMicpLnZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IHdvcmQzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTMnKS52YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaWYgKCF3b3JkMSB8fCAhd29yZDIgfHwgIXdvcmQzKSB7XHJcbiAgICB2ZXJpZmljYXRpb25FcnJvckRpdi50ZXh0Q29udGVudCA9ICdQbGVhc2UgZW50ZXIgYWxsIHZlcmlmaWNhdGlvbiB3b3JkcyB0byBjb25maXJtIHlvdSBoYXZlIGJhY2tlZCB1cCB5b3VyIHNlZWQgcGhyYXNlLic7XHJcbiAgICB2ZXJpZmljYXRpb25FcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmICh3b3JkMSAhPT0gdmVyaWZpY2F0aW9uV29yZHNbMF0ud29yZC50b0xvd2VyQ2FzZSgpIHx8XHJcbiAgICAgIHdvcmQyICE9PSB2ZXJpZmljYXRpb25Xb3Jkc1sxXS53b3JkLnRvTG93ZXJDYXNlKCkgfHxcclxuICAgICAgd29yZDMgIT09IHZlcmlmaWNhdGlvbldvcmRzWzJdLndvcmQudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYudGV4dENvbnRlbnQgPSAnVmVyaWZpY2F0aW9uIHdvcmRzIGRvIG5vdCBtYXRjaC4gUGxlYXNlIGRvdWJsZS1jaGVjayB5b3VyIHNlZWQgcGhyYXNlIGJhY2t1cC4nO1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB2ZXJpZmljYXRpb25FcnJvckRpdi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAvLyBJbXBvcnQgd2FsbGV0IGZyb20gdGhlIG1uZW1vbmljIHdlIGFscmVhZHkgZ2VuZXJhdGVkXHJcbiAgICBjb25zdCB7IGFkZHJlc3MgfSA9IGF3YWl0IGltcG9ydEZyb21NbmVtb25pYyhnZW5lcmF0ZWRNbmVtb25pYywgcGFzc3dvcmQpO1xyXG5cclxuICAgIC8vIFN1Y2Nlc3MhIE5hdmlnYXRlIHRvIGRhc2hib2FyZFxyXG4gICAgYWxlcnQoJ1dhbGxldCBjcmVhdGVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuICAgIGN1cnJlbnRTdGF0ZS5hZGRyZXNzID0gYWRkcmVzcztcclxuICAgIGN1cnJlbnRTdGF0ZS5pc1VubG9ja2VkID0gdHJ1ZTtcclxuICAgIGN1cnJlbnRTdGF0ZS5sYXN0QWN0aXZpdHlUaW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAvLyBTdGFydCBhdXRvLWxvY2sgdGltZXJcclxuICAgIHN0YXJ0QXV0b0xvY2tUaW1lcigpO1xyXG5cclxuICAgIC8vIENsZWFyIHRoZSBnZW5lcmF0ZWQgbW5lbW9uaWMgZnJvbSBtZW1vcnkgZm9yIHNlY3VyaXR5XHJcbiAgICBnZW5lcmF0ZWRNbmVtb25pYyA9ICcnO1xyXG4gICAgdmVyaWZpY2F0aW9uV29yZHMgPSBbXTtcclxuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJyk7XHJcbiAgICB1cGRhdGVEYXNoYm9hcmQoKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBXQUxMRVQgSU1QT1JUID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUltcG9ydFdhbGxldCgpIHtcclxuICBjb25zdCBtZXRob2QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1wb3J0LW1ldGhvZCcpLnZhbHVlO1xyXG4gIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLWltcG9ydCcpLnZhbHVlO1xyXG4gIGNvbnN0IHBhc3N3b3JkQ29uZmlybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1pbXBvcnQtY29uZmlybScpLnZhbHVlO1xyXG4gIGNvbnN0IGVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1lcnJvcicpO1xyXG5cclxuICAvLyBWYWxpZGF0ZVxyXG4gIGlmIChwYXNzd29yZCAhPT0gcGFzc3dvcmRDb25maXJtKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9ICdQYXNzd29yZHMgZG8gbm90IG1hdGNoJztcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgIGxldCBhZGRyZXNzO1xyXG4gICAgaWYgKG1ldGhvZCA9PT0gJ21uZW1vbmljJykge1xyXG4gICAgICBjb25zdCBtbmVtb25pYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbXBvcnQtbW5lbW9uaWMnKS52YWx1ZTtcclxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaW1wb3J0RnJvbU1uZW1vbmljKG1uZW1vbmljLCBwYXNzd29yZCk7XHJcbiAgICAgIGFkZHJlc3MgPSByZXN1bHQuYWRkcmVzcztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IHByaXZhdGVLZXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1wb3J0LXByaXZhdGVrZXknKS52YWx1ZTtcclxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaW1wb3J0RnJvbVByaXZhdGVLZXkocHJpdmF0ZUtleSwgcGFzc3dvcmQpO1xyXG4gICAgICBhZGRyZXNzID0gcmVzdWx0LmFkZHJlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3VjY2VzcyFcclxuICAgIGFsZXJ0KCdXYWxsZXQgaW1wb3J0ZWQgc3VjY2Vzc2Z1bGx5IScpO1xyXG4gICAgY3VycmVudFN0YXRlLmFkZHJlc3MgPSBhZGRyZXNzO1xyXG4gICAgY3VycmVudFN0YXRlLmlzVW5sb2NrZWQgPSB0cnVlO1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpO1xyXG4gICAgdXBkYXRlRGFzaGJvYXJkKCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gVU5MT0NLID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVVubG9jaygpIHtcclxuICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC11bmxvY2snKS52YWx1ZTtcclxuICBjb25zdCBlcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1bmxvY2stZXJyb3InKTtcclxuXHJcbiAgLy8gQ2hlY2sgaWYgbG9ja2VkIG91dCBkdWUgdG8gdG9vIG1hbnkgZmFpbGVkIGF0dGVtcHRzXHJcbiAgY29uc3QgbG9ja291dEluZm8gPSBhd2FpdCBjaGVja1JhdGVMaW1pdExvY2tvdXQoKTtcclxuICBpZiAobG9ja291dEluZm8uaXNMb2NrZWRPdXQpIHtcclxuICAgIGNvbnN0IHJlbWFpbmluZ01pbnV0ZXMgPSBNYXRoLmNlaWwobG9ja291dEluZm8ucmVtYWluaW5nTXMgLyAxMDAwIC8gNjApO1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBgVG9vIG1hbnkgZmFpbGVkIGF0dGVtcHRzLiBQbGVhc2Ugd2FpdCAke3JlbWFpbmluZ01pbnV0ZXN9IG1pbnV0ZShzKSBiZWZvcmUgdHJ5aW5nIGFnYWluLmA7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICBjb25zdCB7IGFkZHJlc3MsIHNpZ25lciB9ID0gYXdhaXQgdW5sb2NrV2FsbGV0KHBhc3N3b3JkKTtcclxuXHJcbiAgICAvLyBTdWNjZXNzISBDbGVhciBmYWlsZWQgYXR0ZW1wdHNcclxuICAgIGF3YWl0IGNsZWFyRmFpbGVkQXR0ZW1wdHMoKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgc2Vzc2lvbiB0b2tlbiBpbiBzZXJ2aWNlIHdvcmtlclxyXG4gICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBjb25zdCBkdXJhdGlvbk1zID0gY3VycmVudFN0YXRlLnNldHRpbmdzLmF1dG9Mb2NrTWludXRlcyAqIDYwICogMTAwMDtcclxuICAgIGNvbnN0IHNlc3Npb25SZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0NSRUFURV9TRVNTSU9OJyxcclxuICAgICAgcGFzc3dvcmQsXHJcbiAgICAgIHdhbGxldElkOiBhY3RpdmVXYWxsZXQuaWQsXHJcbiAgICAgIGR1cmF0aW9uTXNcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghc2Vzc2lvblJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIHNlc3Npb24nKTtcclxuICAgIH1cclxuXHJcbiAgICBjdXJyZW50U3RhdGUuaXNVbmxvY2tlZCA9IHRydWU7XHJcbiAgICBjdXJyZW50U3RhdGUuYWRkcmVzcyA9IGFkZHJlc3M7XHJcbiAgICBjdXJyZW50U3RhdGUuc2Vzc2lvblRva2VuID0gc2Vzc2lvblJlc3BvbnNlLnNlc3Npb25Ub2tlbjtcclxuICAgIGN1cnJlbnRTdGF0ZS5sYXN0QWN0aXZpdHlUaW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAvLyBTdGFydCBhdXRvLWxvY2sgdGltZXJcclxuICAgIHN0YXJ0QXV0b0xvY2tUaW1lcigpO1xyXG5cclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKTtcclxuICAgIHVwZGF0ZURhc2hib2FyZCgpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAvLyBSZWNvcmQgZmFpbGVkIGF0dGVtcHRcclxuICAgIGF3YWl0IHJlY29yZEZhaWxlZEF0dGVtcHQoKTtcclxuXHJcbiAgICAvLyBDaGVjayBpZiBub3cgbG9ja2VkIG91dFxyXG4gICAgY29uc3QgbmV3TG9ja291dEluZm8gPSBhd2FpdCBjaGVja1JhdGVMaW1pdExvY2tvdXQoKTtcclxuICAgIGlmIChuZXdMb2Nrb3V0SW5mby5pc0xvY2tlZE91dCkge1xyXG4gICAgICBjb25zdCByZW1haW5pbmdNaW51dGVzID0gTWF0aC5jZWlsKG5ld0xvY2tvdXRJbmZvLnJlbWFpbmluZ01zIC8gMTAwMCAvIDYwKTtcclxuICAgICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBgVG9vIG1hbnkgZmFpbGVkIGF0dGVtcHRzICgke01BWF9BVFRFTVBUU30pLiBXYWxsZXQgbG9ja2VkIGZvciAke3JlbWFpbmluZ01pbnV0ZXN9IG1pbnV0ZXMuYDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGF0dGVtcHRzTGVmdCA9IE1BWF9BVFRFTVBUUyAtIG5ld0xvY2tvdXRJbmZvLmF0dGVtcHRzO1xyXG4gICAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9IGAke2Vycm9yLm1lc3NhZ2V9ICgke2F0dGVtcHRzTGVmdH0gYXR0ZW1wdCR7YXR0ZW1wdHNMZWZ0ICE9PSAxID8gJ3MnIDogJyd9IHJlbWFpbmluZylgO1xyXG4gICAgfVxyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBMT0NLID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUxvY2soKSB7XHJcbiAgLy8gSW52YWxpZGF0ZSBzZXNzaW9uIGluIHNlcnZpY2Ugd29ya2VyXHJcbiAgaWYgKGN1cnJlbnRTdGF0ZS5zZXNzaW9uVG9rZW4pIHtcclxuICAgIGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0lOVkFMSURBVEVfU0VTU0lPTicsXHJcbiAgICAgIHNlc3Npb25Ub2tlbjogY3VycmVudFN0YXRlLnNlc3Npb25Ub2tlblxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBjdXJyZW50U3RhdGUuaXNVbmxvY2tlZCA9IGZhbHNlO1xyXG4gIGN1cnJlbnRTdGF0ZS5hZGRyZXNzID0gbnVsbDtcclxuICBjdXJyZW50U3RhdGUuc2Vzc2lvblRva2VuID0gbnVsbDtcclxuICBjdXJyZW50U3RhdGUubGFzdEFjdGl2aXR5VGltZSA9IG51bGw7XHJcbiAgc3RvcEF1dG9Mb2NrVGltZXIoKTtcclxuICBzaG93U2NyZWVuKCdzY3JlZW4tdW5sb2NrJyk7XHJcbn1cclxuXHJcbi8vID09PT09IEFVVE8tTE9DSyBUSU1FUiA9PT09PVxyXG5mdW5jdGlvbiBzdGFydEF1dG9Mb2NrVGltZXIoKSB7XHJcbiAgc3RvcEF1dG9Mb2NrVGltZXIoKTsgLy8gQ2xlYXIgYW55IGV4aXN0aW5nIHRpbWVyXHJcblxyXG4gIGNvbnN0IGNoZWNrSW50ZXJ2YWwgPSAxMDAwMDsgLy8gQ2hlY2sgZXZlcnkgMTAgc2Vjb25kc1xyXG5cclxuICBhdXRvTG9ja1RpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgaWYgKCFjdXJyZW50U3RhdGUuaXNVbmxvY2tlZCB8fCAhY3VycmVudFN0YXRlLmxhc3RBY3Rpdml0eVRpbWUpIHtcclxuICAgICAgc3RvcEF1dG9Mb2NrVGltZXIoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGlkbGVUaW1lID0gRGF0ZS5ub3coKSAtIGN1cnJlbnRTdGF0ZS5sYXN0QWN0aXZpdHlUaW1lO1xyXG4gICAgY29uc3QgYXV0b0xvY2tNcyA9IGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5hdXRvTG9ja01pbnV0ZXMgKiA2MCAqIDEwMDA7XHJcblxyXG4gICAgaWYgKGlkbGVUaW1lID49IGF1dG9Mb2NrTXMpIHtcclxuICAgICAgLy8gQXV0by1sb2NraW5nIHdhbGxldFxyXG4gICAgICBoYW5kbGVMb2NrKCk7XHJcbiAgICB9XHJcbiAgfSwgY2hlY2tJbnRlcnZhbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0b3BBdXRvTG9ja1RpbWVyKCkge1xyXG4gIGlmIChhdXRvTG9ja1RpbWVyKSB7XHJcbiAgICBjbGVhckludGVydmFsKGF1dG9Mb2NrVGltZXIpO1xyXG4gICAgYXV0b0xvY2tUaW1lciA9IG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZXNldEFjdGl2aXR5VGltZXIoKSB7XHJcbiAgaWYgKGN1cnJlbnRTdGF0ZS5pc1VubG9ja2VkKSB7XHJcbiAgICBjdXJyZW50U3RhdGUubGFzdEFjdGl2aXR5VGltZSA9IERhdGUubm93KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBSQVRFIExJTUlUSU5HID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIHJlY29yZEZhaWxlZEF0dGVtcHQoKSB7XHJcbiAgY29uc3QgZGF0YSA9IGF3YWl0IGxvYWQoUkFURV9MSU1JVF9LRVkpIHx8IHsgYXR0ZW1wdHM6IDAsIGZpcnN0QXR0ZW1wdFRpbWU6IERhdGUubm93KCkgfTtcclxuXHJcbiAgLy8gSWYgZmlyc3QgYXR0ZW1wdCBvciBhdHRlbXB0cyBoYXZlIGV4cGlyZWQsIHJlc2V0XHJcbiAgY29uc3QgdGltZVNpbmNlRmlyc3QgPSBEYXRlLm5vdygpIC0gZGF0YS5maXJzdEF0dGVtcHRUaW1lO1xyXG4gIGlmIChkYXRhLmF0dGVtcHRzID09PSAwIHx8IHRpbWVTaW5jZUZpcnN0ID4gTE9DS09VVF9EVVJBVElPTl9NUykge1xyXG4gICAgZGF0YS5hdHRlbXB0cyA9IDE7XHJcbiAgICBkYXRhLmZpcnN0QXR0ZW1wdFRpbWUgPSBEYXRlLm5vdygpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBkYXRhLmF0dGVtcHRzICs9IDE7XHJcbiAgfVxyXG5cclxuICBhd2FpdCBzYXZlKFJBVEVfTElNSVRfS0VZLCBkYXRhKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY2hlY2tSYXRlTGltaXRMb2Nrb3V0KCkge1xyXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBsb2FkKFJBVEVfTElNSVRfS0VZKTtcclxuXHJcbiAgaWYgKCFkYXRhIHx8IGRhdGEuYXR0ZW1wdHMgPT09IDApIHtcclxuICAgIHJldHVybiB7IGlzTG9ja2VkT3V0OiBmYWxzZSwgYXR0ZW1wdHM6IDAsIHJlbWFpbmluZ01zOiAwIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB0aW1lU2luY2VGaXJzdCA9IERhdGUubm93KCkgLSBkYXRhLmZpcnN0QXR0ZW1wdFRpbWU7XHJcblxyXG4gIC8vIElmIGxvY2tvdXQgcGVyaW9kIGhhcyBleHBpcmVkLCBjbGVhciBhdHRlbXB0c1xyXG4gIGlmICh0aW1lU2luY2VGaXJzdCA+IExPQ0tPVVRfRFVSQVRJT05fTVMpIHtcclxuICAgIGF3YWl0IGNsZWFyRmFpbGVkQXR0ZW1wdHMoKTtcclxuICAgIHJldHVybiB7IGlzTG9ja2VkT3V0OiBmYWxzZSwgYXR0ZW1wdHM6IDAsIHJlbWFpbmluZ01zOiAwIH07XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiBsb2NrZWQgb3V0XHJcbiAgaWYgKGRhdGEuYXR0ZW1wdHMgPj0gTUFYX0FUVEVNUFRTKSB7XHJcbiAgICBjb25zdCByZW1haW5pbmdNcyA9IExPQ0tPVVRfRFVSQVRJT05fTVMgLSB0aW1lU2luY2VGaXJzdDtcclxuICAgIHJldHVybiB7IGlzTG9ja2VkT3V0OiB0cnVlLCBhdHRlbXB0czogZGF0YS5hdHRlbXB0cywgcmVtYWluaW5nTXMgfTtcclxuICB9XHJcblxyXG4gIHJldHVybiB7IGlzTG9ja2VkT3V0OiBmYWxzZSwgYXR0ZW1wdHM6IGRhdGEuYXR0ZW1wdHMsIHJlbWFpbmluZ01zOiAwIH07XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGNsZWFyRmFpbGVkQXR0ZW1wdHMoKSB7XHJcbiAgYXdhaXQgc2F2ZShSQVRFX0xJTUlUX0tFWSwgeyBhdHRlbXB0czogMCwgZmlyc3RBdHRlbXB0VGltZTogMCB9KTtcclxufVxyXG5cclxuLy8gPT09PT0gREFTSEJPQVJEID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZURhc2hib2FyZCgpIHtcclxuICAvLyBVcGRhdGUgYWRkcmVzcyBkaXNwbGF5XHJcbiAgY29uc3QgYWRkcmVzc0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhbGxldC1hZGRyZXNzJyk7XHJcbiAgaWYgKGFkZHJlc3NFbCAmJiBjdXJyZW50U3RhdGUuYWRkcmVzcykge1xyXG4gICAgYWRkcmVzc0VsLnRleHRDb250ZW50ID0gc2hvcnRlbkFkZHJlc3MoY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gIH1cclxuXHJcbiAgLy8gRmV0Y2ggYW5kIHVwZGF0ZSBiYWxhbmNlXHJcbiAgYXdhaXQgZmV0Y2hCYWxhbmNlKCk7XHJcblxyXG4gIC8vIEZldGNoIGFuZCB1cGRhdGUgdG9rZW4gcHJpY2VzIChhc3luYywgZG9uJ3QgYmxvY2sgZGFzaGJvYXJkIGxvYWQpXHJcbiAgZmV0Y2hBbmRVcGRhdGVQcmljZXMoKTtcclxuXHJcbiAgLy8gVXBkYXRlIG5ldHdvcmsgc2VsZWN0b3JcclxuICB1cGRhdGVOZXR3b3JrU2VsZWN0b3IoKTtcclxuICB1cGRhdGVOZXR3b3JrRGlzcGxheXMoKTtcclxuXHJcbiAgLy8gVXBkYXRlIHdhbGxldCBzZWxlY3RvclxyXG4gIGF3YWl0IHVwZGF0ZVdhbGxldFNlbGVjdG9yKCk7XHJcblxyXG4gIC8vIFVwZGF0ZSBwZW5kaW5nIHRyYW5zYWN0aW9uIGluZGljYXRvclxyXG4gIGF3YWl0IHVwZGF0ZVBlbmRpbmdUeEluZGljYXRvcigpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVSZWNlbnRUcmFuc2FjdGlvbnMoKSB7XHJcbiAgY29uc3QgdHhMaXN0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtbGlzdCcpO1xyXG4gIGlmICghdHhMaXN0RWwgfHwgIWN1cnJlbnRTdGF0ZS5hZGRyZXNzKSByZXR1cm47XHJcblxyXG4gIC8vIFNob3cgbG9hZGluZyBzdGF0ZVxyXG4gIHR4TGlzdEVsLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtZGltXCI+TG9hZGluZyB0cmFuc2FjdGlvbnMuLi48L3A+JztcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHRyYW5zYWN0aW9ucyA9IGF3YWl0IHJwYy5nZXRSZWNlbnRUcmFuc2FjdGlvbnMoY3VycmVudFN0YXRlLm5ldHdvcmssIGN1cnJlbnRTdGF0ZS5hZGRyZXNzLCAzLCAxMDAwKTtcclxuXHJcbiAgICBpZiAodHJhbnNhY3Rpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICB0eExpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPk5vIHJlY2VudCB0cmFuc2FjdGlvbnM8L3A+JztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBodG1sID0gJyc7XHJcblxyXG4gICAgZm9yIChjb25zdCB0eCBvZiB0cmFuc2FjdGlvbnMpIHtcclxuICAgICAgY29uc3QgdmFsdWVFdGggPSBldGhlcnMuZm9ybWF0RXRoZXIodHgudmFsdWUpO1xyXG4gICAgICBjb25zdCBmb3JtYXR0ZWQgPSBmb3JtYXRCYWxhbmNlV2l0aENvbW1hcyh2YWx1ZUV0aCwgMTgpO1xyXG4gICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUodHgudGltZXN0YW1wICogMTAwMCkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XHJcbiAgICAgIGNvbnN0IHR5cGUgPSB0eC50eXBlID09PSAnc2VudCcgPyAn4oaSJyA6ICfihpAnO1xyXG4gICAgICBjb25zdCB0eXBlQ29sb3IgPSB0eC50eXBlID09PSAnc2VudCcgPyAnI2ZmNDQ0NCcgOiAnIzQ0ZmY0NCc7XHJcbiAgICAgIGNvbnN0IGV4cGxvcmVyVXJsID0gZ2V0RXhwbG9yZXJVcmwoY3VycmVudFN0YXRlLm5ldHdvcmssICd0eCcsIHR4Lmhhc2gpO1xyXG5cclxuICAgICAgaHRtbCArPSBgXHJcbiAgICAgICAgPGRpdiBzdHlsZT1cInBhZGRpbmc6IDhweDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRlcm1pbmFsLWJvcmRlcik7IGZvbnQtc2l6ZTogMTFweDtcIj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IG1hcmdpbi1ib3R0b206IDRweDtcIj5cclxuICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJjb2xvcjogJHt0eXBlQ29sb3J9O1wiPiR7dHlwZX0gJHt0eC50eXBlID09PSAnc2VudCcgPyAnU2VudCcgOiAnUmVjZWl2ZWQnfTwvc3Bhbj5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LWRpbVwiPiR7ZGF0ZX08L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+XHJcbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC13ZWlnaHQ6IGJvbGQ7XCIgdGl0bGU9XCIke2Zvcm1hdHRlZC50b29sdGlwfVwiPiR7Zm9ybWF0dGVkLmRpc3BsYXl9PC9zcGFuPlxyXG4gICAgICAgICAgICA8YSBocmVmPVwiJHtleHBsb3JlclVybH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiBzdHlsZT1cImNvbG9yOiB2YXIoLS10ZXJtaW5hbC1ncmVlbik7IHRleHQtZGVjb3JhdGlvbjogbm9uZTsgZm9udC1zaXplOiAxMHB4O1wiPlZJRVcg4oaSPC9hPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIGA7XHJcbiAgICB9XHJcblxyXG4gICAgdHhMaXN0RWwuaW5uZXJIVE1MID0gaHRtbDtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdHJhbnNhY3Rpb25zOicsIGVycm9yKTtcclxuICAgIHR4TGlzdEVsLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtZGltXCI+RXJyb3IgbG9hZGluZyB0cmFuc2FjdGlvbnM8L3A+JztcclxuICB9XHJcbn1cclxuXHJcbi8vIFVwZGF0ZSB3YWxsZXQgc2VsZWN0b3IgZHJvcGRvd25cclxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlV2FsbGV0U2VsZWN0b3IoKSB7XHJcbiAgY29uc3Qgd2FsbGV0U2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhbGxldC1zZWxlY3QnKTtcclxuICBpZiAoIXdhbGxldFNlbGVjdCkgcmV0dXJuO1xyXG5cclxuICBjb25zdCB3YWxsZXRzRGF0YSA9IGF3YWl0IGdldEFsbFdhbGxldHMoKTtcclxuXHJcbiAgaWYgKHdhbGxldHNEYXRhLndhbGxldExpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICB3YWxsZXRTZWxlY3QuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJcIj5ObyB3YWxsZXRzPC9vcHRpb24+JztcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHdhbGxldFNlbGVjdC5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgd2FsbGV0c0RhdGEud2FsbGV0TGlzdC5mb3JFYWNoKHdhbGxldCA9PiB7XHJcbiAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuICAgIG9wdGlvbi52YWx1ZSA9IHdhbGxldC5pZDtcclxuICAgIG9wdGlvbi50ZXh0Q29udGVudCA9IHdhbGxldC5uaWNrbmFtZSB8fCAnVW5uYW1lZCBXYWxsZXQnO1xyXG5cclxuICAgIGlmICh3YWxsZXQuaWQgPT09IHdhbGxldHNEYXRhLmFjdGl2ZVdhbGxldElkKSB7XHJcbiAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgd2FsbGV0U2VsZWN0LmFwcGVuZENoaWxkKG9wdGlvbik7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIFVwZGF0ZSBuZXR3b3JrIGRpc3BsYXlzIGFjcm9zcyBhbGwgc2NyZWVuc1xyXG5mdW5jdGlvbiB1cGRhdGVOZXR3b3JrRGlzcGxheXMoKSB7XHJcbiAgY29uc3QgbmV0d29ya05hbWUgPSBORVRXT1JLX05BTUVTW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXSB8fCAnVW5rbm93biBOZXR3b3JrJztcclxuXHJcbiAgLy8gU2V0dXAgc2NyZWVuIHNlbGVjdG9yXHJcbiAgY29uc3Qgc2V0dXBTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1zZWxlY3Qtc2V0dXAnKTtcclxuICBpZiAoc2V0dXBTZWxlY3QpIHtcclxuICAgIHNldHVwU2VsZWN0LnZhbHVlID0gY3VycmVudFN0YXRlLm5ldHdvcms7XHJcbiAgfVxyXG5cclxuICAvLyBDcmVhdGUgc2NyZWVuIGRpc3BsYXlcclxuICBjb25zdCBjcmVhdGVEaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmstZGlzcGxheS1jcmVhdGUnKTtcclxuICBpZiAoY3JlYXRlRGlzcGxheSkge1xyXG4gICAgY3JlYXRlRGlzcGxheS50ZXh0Q29udGVudCA9IG5ldHdvcmtOYW1lO1xyXG4gIH1cclxuXHJcbiAgLy8gSW1wb3J0IHNjcmVlbiBkaXNwbGF5XHJcbiAgY29uc3QgaW1wb3J0RGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrLWRpc3BsYXktaW1wb3J0Jyk7XHJcbiAgaWYgKGltcG9ydERpc3BsYXkpIHtcclxuICAgIGltcG9ydERpc3BsYXkudGV4dENvbnRlbnQgPSBuZXR3b3JrTmFtZTtcclxuICB9XHJcblxyXG4gIC8vIERhc2hib2FyZCBjdXN0b20gZHJvcGRvd25cclxuICBjb25zdCBuZXR3b3JrU2VsZWN0ZWRUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmstc2VsZWN0ZWQtdGV4dCcpO1xyXG4gIGlmIChuZXR3b3JrU2VsZWN0ZWRUZXh0KSB7XHJcbiAgICBuZXR3b3JrU2VsZWN0ZWRUZXh0LnRleHRDb250ZW50ID0gbmV0d29ya05hbWU7XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGUgbmV0d29yayBzZWxlY3RvciBsb2dvXHJcbiAgY29uc3Qgc2VsZWN0b3JMb2dvRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1zZWxlY3Rvci1sb2dvJyk7XHJcbiAgaWYgKHNlbGVjdG9yTG9nb0VsKSB7XHJcbiAgICBjb25zdCBuZXR3b3JrTG9nb3MgPSB7XHJcbiAgICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICdwbHMucG5nJyxcclxuICAgICAgJ3B1bHNlY2hhaW4nOiAncGxzLnBuZycsXHJcbiAgICAgICdldGhlcmV1bSc6ICdldGgucG5nJyxcclxuICAgICAgJ3NlcG9saWEnOiAnZXRoLnBuZydcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgbG9nb0ZpbGUgPSBuZXR3b3JrTG9nb3NbY3VycmVudFN0YXRlLm5ldHdvcmtdO1xyXG4gICAgaWYgKGxvZ29GaWxlKSB7XHJcbiAgICAgIHNlbGVjdG9yTG9nb0VsLnNyYyA9IGNocm9tZS5ydW50aW1lLmdldFVSTChgYXNzZXRzL2xvZ29zLyR7bG9nb0ZpbGV9YCk7XHJcbiAgICAgIHNlbGVjdG9yTG9nb0VsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZWN0b3JMb2dvRWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGZldGNoQmFsYW5jZSgpIHtcclxuICBpZiAoIWN1cnJlbnRTdGF0ZS5hZGRyZXNzKSB7XHJcbiAgICBjdXJyZW50U3RhdGUuYmFsYW5jZSA9ICcwJztcclxuICAgIHVwZGF0ZUJhbGFuY2VEaXNwbGF5KCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgYmFsYW5jZVdlaSA9IGF3YWl0IHJwYy5nZXRCYWxhbmNlKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCBjdXJyZW50U3RhdGUuYWRkcmVzcyk7XHJcbiAgICBjdXJyZW50U3RhdGUuYmFsYW5jZSA9IHJwYy5mb3JtYXRCYWxhbmNlKGJhbGFuY2VXZWksIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5kZWNpbWFsUGxhY2VzKTtcclxuICAgIHVwZGF0ZUJhbGFuY2VEaXNwbGF5KCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGJhbGFuY2U6JywgZXJyb3IpO1xyXG4gICAgLy8gS2VlcCBwcmV2aW91cyBiYWxhbmNlIG9uIGVycm9yXHJcbiAgICB1cGRhdGVCYWxhbmNlRGlzcGxheSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdHMgYSBiYWxhbmNlIHN0cmluZyB3aXRoIGNvbW1hcyBhbmQgcmV0dXJucyBkaXNwbGF5ICsgdG9vbHRpcCB2YWx1ZXNcclxuICogQHBhcmFtIHtzdHJpbmd9IGJhbGFuY2VTdHJpbmcgLSBCYWxhbmNlIGFzIHN0cmluZyAoZS5nLiwgXCIxMjM0LjU2NzhcIilcclxuICogQHBhcmFtIHtudW1iZXJ9IGZ1bGxEZWNpbWFscyAtIEZ1bGwgcHJlY2lzaW9uIGRlY2ltYWxzIChkZWZhdWx0IDE4KVxyXG4gKiBAcmV0dXJucyB7e2Rpc3BsYXk6IHN0cmluZywgdG9vbHRpcDogc3RyaW5nfX1cclxuICovXHJcbmZ1bmN0aW9uIGZvcm1hdEJhbGFuY2VXaXRoQ29tbWFzKGJhbGFuY2VTdHJpbmcsIGZ1bGxEZWNpbWFscyA9IDE4KSB7XHJcbiAgY29uc3QgYmFsYW5jZSA9IHBhcnNlRmxvYXQoYmFsYW5jZVN0cmluZyk7XHJcbiAgaWYgKGlzTmFOKGJhbGFuY2UpKSB7XHJcbiAgICByZXR1cm4geyBkaXNwbGF5OiBiYWxhbmNlU3RyaW5nLCB0b29sdGlwOiBiYWxhbmNlU3RyaW5nIH07XHJcbiAgfVxyXG5cclxuICAvLyBEaXNwbGF5IHZhbHVlIChrZWVwIGN1cnJlbnQgZGVjaW1hbHMsIGFkZCBjb21tYXMpXHJcbiAgY29uc3QgcGFydHMgPSBiYWxhbmNlU3RyaW5nLnNwbGl0KCcuJyk7XHJcbiAgcGFydHNbMF0gPSBwYXJ0c1swXS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCAnLCcpO1xyXG4gIGNvbnN0IGRpc3BsYXlWYWx1ZSA9IHBhcnRzLmpvaW4oJy4nKTtcclxuXHJcbiAgLy8gRnVsbCBwcmVjaXNpb24gdmFsdWUgd2l0aCBjb21tYXNcclxuICBjb25zdCBmdWxsUHJlY2lzaW9uID0gYmFsYW5jZS50b0ZpeGVkKGZ1bGxEZWNpbWFscyk7XHJcbiAgY29uc3QgZnVsbFBhcnRzID0gZnVsbFByZWNpc2lvbi5zcGxpdCgnLicpO1xyXG4gIGZ1bGxQYXJ0c1swXSA9IGZ1bGxQYXJ0c1swXS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCAnLCcpO1xyXG4gIGNvbnN0IGZ1bGxWYWx1ZSA9IGZ1bGxQYXJ0cy5qb2luKCcuJyk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBkaXNwbGF5OiBkaXNwbGF5VmFsdWUsXHJcbiAgICB0b29sdGlwOiBgRnVsbCBwcmVjaXNpb246ICR7ZnVsbFZhbHVlfWBcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVCYWxhbmNlRGlzcGxheSgpIHtcclxuICBjb25zdCBiYWxhbmNlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFsYW5jZS1hbW91bnQnKTtcclxuICBpZiAoYmFsYW5jZUVsKSB7XHJcbiAgICBjb25zdCBkZWNpbWFscyA9IGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5kZWNpbWFsUGxhY2VzO1xyXG4gICAgY29uc3QgYmFsYW5jZSA9IHBhcnNlRmxvYXQoY3VycmVudFN0YXRlLmJhbGFuY2UpO1xyXG5cclxuICAgIC8vIEZvcm1hdCB3aXRoIGNvbW1hcyBmb3IgcmVhZGFiaWxpdHlcclxuICAgIGNvbnN0IGZvcm1hdHRlZCA9IGJhbGFuY2UudG9GaXhlZChkZWNpbWFscyk7XHJcbiAgICBjb25zdCBwYXJ0cyA9IGZvcm1hdHRlZC5zcGxpdCgnLicpO1xyXG4gICAgcGFydHNbMF0gPSBwYXJ0c1swXS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCAnLCcpO1xyXG4gICAgY29uc3QgZGlzcGxheVZhbHVlID0gcGFydHMuam9pbignLicpO1xyXG5cclxuICAgIGJhbGFuY2VFbC50ZXh0Q29udGVudCA9IGRpc3BsYXlWYWx1ZTtcclxuXHJcbiAgICAvLyBTZXQgdG9vbHRpcCB3aXRoIGZ1bGwgcHJlY2lzaW9uICgxOCBkZWNpbWFscykgYW5kIGNvbW1hc1xyXG4gICAgY29uc3QgZnVsbFByZWNpc2lvbiA9IGJhbGFuY2UudG9GaXhlZCgxOCk7XHJcbiAgICBjb25zdCBmdWxsUGFydHMgPSBmdWxsUHJlY2lzaW9uLnNwbGl0KCcuJyk7XHJcbiAgICBmdWxsUGFydHNbMF0gPSBmdWxsUGFydHNbMF0ucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgJywnKTtcclxuICAgIGNvbnN0IGZ1bGxWYWx1ZSA9IGZ1bGxQYXJ0cy5qb2luKCcuJyk7XHJcbiAgICBiYWxhbmNlRWwudGl0bGUgPSBgRnVsbCBwcmVjaXNpb246ICR7ZnVsbFZhbHVlfWA7XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGUgYmFsYW5jZSBzeW1ib2wgYmFzZWQgb24gbmV0d29ya1xyXG4gIGNvbnN0IHN5bWJvbEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhbGFuY2Utc3ltYm9sJyk7XHJcbiAgaWYgKHN5bWJvbEVsKSB7XHJcbiAgICBjb25zdCBzeW1ib2xzID0ge1xyXG4gICAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAndFBMUycsXHJcbiAgICAgICdwdWxzZWNoYWluJzogJ1BMUycsXHJcbiAgICAgICdldGhlcmV1bSc6ICdFVEgnLFxyXG4gICAgICAnc2Vwb2xpYSc6ICdTRVAnXHJcbiAgICB9O1xyXG4gICAgc3ltYm9sRWwudGV4dENvbnRlbnQgPSBzeW1ib2xzW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXSB8fCAnVE9LRU4nO1xyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRlIFVTRCB2YWx1ZSBpZiBwcmljZXMgYXJlIGF2YWlsYWJsZVxyXG4gIGNvbnN0IHVzZEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhbGFuY2UtdXNkJyk7XHJcbiAgaWYgKHVzZEVsICYmIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcykge1xyXG4gICAgY29uc3QgdG9rZW5TeW1ib2wgPSBjdXJyZW50U3RhdGUubmV0d29yayA9PT0gJ3B1bHNlY2hhaW5UZXN0bmV0JyA/ICdQTFMnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUubmV0d29yayA9PT0gJ3B1bHNlY2hhaW4nID8gJ1BMUycgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGF0ZS5uZXR3b3JrID09PSAnZXRoZXJldW0nID8gJ0VUSCcgOiAnUExTJztcclxuXHJcbiAgICAvLyBDb252ZXJ0IGJhbGFuY2UgdG8gd2VpIChzdHJpbmcgd2l0aCAxOCBkZWNpbWFscylcclxuICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBldGhlcnMucGFyc2VFdGhlcihjdXJyZW50U3RhdGUuYmFsYW5jZS50b1N0cmluZygpKS50b1N0cmluZygpO1xyXG4gICAgY29uc3QgdXNkVmFsdWUgPSBnZXRUb2tlblZhbHVlVVNEKHRva2VuU3ltYm9sLCBiYWxhbmNlV2VpLCAxOCwgY3VycmVudFN0YXRlLnRva2VuUHJpY2VzKTtcclxuXHJcbiAgICBpZiAodXNkVmFsdWUgIT09IG51bGwpIHtcclxuICAgICAgdXNkRWwudGV4dENvbnRlbnQgPSBmb3JtYXRVU0QodXNkVmFsdWUpO1xyXG4gICAgICB1c2RFbC5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1mZy1kaW0pJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHVzZEVsLnRleHRDb250ZW50ID0gJ+KAlCc7XHJcbiAgICAgIHVzZEVsLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLWZnLWRpbSknO1xyXG4gICAgfVxyXG4gIH0gZWxzZSBpZiAodXNkRWwpIHtcclxuICAgIHVzZEVsLnRleHRDb250ZW50ID0gJ+KAlCc7XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGUgbmV0d29yayBsb2dvXHJcbiAgY29uc3QgbG9nb0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmstbG9nbycpO1xyXG4gIGlmIChsb2dvRWwpIHtcclxuICAgIGNvbnN0IG5ldHdvcmtMb2dvcyA9IHtcclxuICAgICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3Bscy5wbmcnLFxyXG4gICAgICAncHVsc2VjaGFpbic6ICdwbHMucG5nJyxcclxuICAgICAgJ2V0aGVyZXVtJzogJ2V0aC5wbmcnLFxyXG4gICAgICAnc2Vwb2xpYSc6ICdldGgucG5nJ1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBsb2dvRmlsZSA9IG5ldHdvcmtMb2dvc1tjdXJyZW50U3RhdGUubmV0d29ya107XHJcbiAgICBpZiAobG9nb0ZpbGUpIHtcclxuICAgICAgbG9nb0VsLnNyYyA9IGNocm9tZS5ydW50aW1lLmdldFVSTChgYXNzZXRzL2xvZ29zLyR7bG9nb0ZpbGV9YCk7XHJcbiAgICAgIGxvZ29FbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxvZ29FbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZldGNoIHRva2VuIHByaWNlcyBmcm9tIFB1bHNlWCBhbmQgdXBkYXRlIGRpc3BsYXlcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGZldGNoQW5kVXBkYXRlUHJpY2VzKCkge1xyXG4gIC8vIE9ubHkgZmV0Y2ggcHJpY2VzIGZvciBQdWxzZUNoYWluIG5ldHdvcmtzXHJcbiAgaWYgKGN1cnJlbnRTdGF0ZS5uZXR3b3JrICE9PSAncHVsc2VjaGFpbicgJiYgY3VycmVudFN0YXRlLm5ldHdvcmsgIT09ICdwdWxzZWNoYWluVGVzdG5ldCcpIHtcclxuICAgIGNvbnNvbGUubG9nKCfwn6uAIFByaWNlIGZldGNoaW5nIG5vdCBzdXBwb3J0ZWQgZm9yJywgY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gU2hvdyBsb2FkaW5nIGluZGljYXRvclxyXG4gIGNvbnN0IGxvYWRpbmdFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcmljZS1sb2FkaW5nJyk7XHJcbiAgY29uc3QgdXNkRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFsYW5jZS11c2QnKTtcclxuICBpZiAobG9hZGluZ0VsICYmIHVzZEVsKSB7XHJcbiAgICB1c2RFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGxvYWRpbmdFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihjdXJyZW50U3RhdGUubmV0d29yayk7XHJcbiAgICBjb25zdCBwcmljZXMgPSBhd2FpdCBmZXRjaFRva2VuUHJpY2VzKHByb3ZpZGVyLCBjdXJyZW50U3RhdGUubmV0d29yayA9PT0gJ3B1bHNlY2hhaW5UZXN0bmV0JyA/ICdwdWxzZWNoYWluJyA6IGN1cnJlbnRTdGF0ZS5uZXR3b3JrKTtcclxuXHJcbiAgICBpZiAocHJpY2VzKSB7XHJcbiAgICAgIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcyA9IHByaWNlcztcclxuICAgICAgdXBkYXRlQmFsYW5jZURpc3BsYXkoKTsgLy8gUmVmcmVzaCBkaXNwbGF5IHdpdGggVVNEIHZhbHVlc1xyXG4gICAgICAvLyBQcmljZXMgdXBkYXRlZFxyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB0b2tlbiBwcmljZXM6JywgZXJyb3IpO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICAvLyBIaWRlIGxvYWRpbmcgaW5kaWNhdG9yXHJcbiAgICBpZiAobG9hZGluZ0VsICYmIHVzZEVsKSB7XHJcbiAgICAgIGxvYWRpbmdFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgdXNkRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVOZXR3b3JrU2VsZWN0b3IoKSB7XHJcbiAgLy8gSWYgdGVzdCBuZXR3b3JrcyBhcmUgaGlkZGVuLCBoaWRlIHRlc3RuZXQgb3B0aW9ucyBpbiBjdXN0b20gZHJvcGRvd25cclxuICBjb25zdCBvcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5ldHdvcmstb3B0aW9uJyk7XHJcbiAgb3B0aW9ucy5mb3JFYWNoKG9wdGlvbiA9PiB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gb3B0aW9uLmdldEF0dHJpYnV0ZSgnZGF0YS1uZXR3b3JrJyk7XHJcbiAgICBjb25zdCBpc1Rlc3RuZXQgPSBuZXR3b3JrLmluY2x1ZGVzKCdUZXN0bmV0JykgfHwgbmV0d29yayA9PT0gJ3NlcG9saWEnO1xyXG4gICAgaWYgKGlzVGVzdG5ldCAmJiAhY3VycmVudFN0YXRlLnNldHRpbmdzLnNob3dUZXN0TmV0d29ya3MpIHtcclxuICAgICAgb3B0aW9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBvcHRpb24uc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuLy8gPT09PT0gU0VORCA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBzaG93U2VuZFNjcmVlbigpIHtcclxuICAvLyBQb3B1bGF0ZSBzZW5kIHNjcmVlbiB3aXRoIGN1cnJlbnQgd2FsbGV0IGluZm9cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1mcm9tLWFkZHJlc3MnKS50ZXh0Q29udGVudCA9IGN1cnJlbnRTdGF0ZS5hZGRyZXNzIHx8ICcweDAwMDAuLi4wMDAwJztcclxuXHJcbiAgLy8gUG9wdWxhdGUgYXNzZXQgc2VsZWN0b3Igd2l0aCBuYXRpdmUgKyB0b2tlbnNcclxuICBjb25zdCBhc3NldFNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWFzc2V0LXNlbGVjdCcpO1xyXG4gIGNvbnN0IHN5bWJvbHMgPSB7XHJcbiAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAndFBMUycsXHJcbiAgICAncHVsc2VjaGFpbic6ICdQTFMnLFxyXG4gICAgJ2V0aGVyZXVtJzogJ0VUSCcsXHJcbiAgICAnc2Vwb2xpYSc6ICdTRVAnXHJcbiAgfTtcclxuXHJcbiAgbGV0IG9wdGlvbnMgPSBgPG9wdGlvbiB2YWx1ZT1cIm5hdGl2ZVwiPk5hdGl2ZSAoJHtzeW1ib2xzW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXSB8fCAnVE9LRU4nfSk8L29wdGlvbj5gO1xyXG5cclxuICBjb25zdCBhbGxUb2tlbnMgPSBhd2FpdCB0b2tlbnMuZ2V0QWxsVG9rZW5zKGN1cnJlbnRTdGF0ZS5uZXR3b3JrKTtcclxuICBmb3IgKGNvbnN0IHRva2VuIG9mIGFsbFRva2Vucykge1xyXG4gICAgb3B0aW9ucyArPSBgPG9wdGlvbiB2YWx1ZT1cIiR7ZXNjYXBlSHRtbCh0b2tlbi5hZGRyZXNzKX1cIj4ke2VzY2FwZUh0bWwodG9rZW4uc3ltYm9sKX08L29wdGlvbj5gO1xyXG4gIH1cclxuXHJcbiAgYXNzZXRTZWxlY3QuaW5uZXJIVE1MID0gb3B0aW9ucztcclxuXHJcbiAgLy8gU2V0IGluaXRpYWwgYmFsYW5jZSB3aXRoIGZvcm1hdHRpbmdcclxuICBjb25zdCBiYWxhbmNlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hdmFpbGFibGUtYmFsYW5jZScpO1xyXG4gIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdEJhbGFuY2VXaXRoQ29tbWFzKGN1cnJlbnRTdGF0ZS5iYWxhbmNlLCAxOCk7XHJcbiAgYmFsYW5jZUVsLnRleHRDb250ZW50ID0gZm9ybWF0dGVkLmRpc3BsYXk7XHJcbiAgYmFsYW5jZUVsLnRpdGxlID0gZm9ybWF0dGVkLnRvb2x0aXA7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYmFsYW5jZS1zeW1ib2wnKS50ZXh0Q29udGVudCA9IHN5bWJvbHNbY3VycmVudFN0YXRlLm5ldHdvcmtdIHx8ICdUT0tFTic7XHJcblxyXG4gIC8vIENsZWFyIGZvcm1cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC10by1hZGRyZXNzJykudmFsdWUgPSAnJztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hbW91bnQnKS52YWx1ZSA9ICcnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLXBhc3N3b3JkJykudmFsdWUgPSAnJztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1lcnJvcicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICBzaG93U2NyZWVuKCdzY3JlZW4tc2VuZCcpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVBc3NldENoYW5nZSgpIHtcclxuICBjb25zdCBhc3NldFNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWFzc2V0LXNlbGVjdCcpO1xyXG4gIGNvbnN0IHNlbGVjdGVkVmFsdWUgPSBhc3NldFNlbGVjdC52YWx1ZTtcclxuXHJcbiAgY29uc3Qgc3ltYm9scyA9IHtcclxuICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICd0UExTJyxcclxuICAgICdwdWxzZWNoYWluJzogJ1BMUycsXHJcbiAgICAnZXRoZXJldW0nOiAnRVRIJyxcclxuICAgICdzZXBvbGlhJzogJ1NFUCdcclxuICB9O1xyXG5cclxuICBjb25zdCBiYWxhbmNlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hdmFpbGFibGUtYmFsYW5jZScpO1xyXG5cclxuICBpZiAoc2VsZWN0ZWRWYWx1ZSA9PT0gJ25hdGl2ZScpIHtcclxuICAgIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdEJhbGFuY2VXaXRoQ29tbWFzKGN1cnJlbnRTdGF0ZS5iYWxhbmNlLCAxOCk7XHJcbiAgICBiYWxhbmNlRWwudGV4dENvbnRlbnQgPSBmb3JtYXR0ZWQuZGlzcGxheTtcclxuICAgIGJhbGFuY2VFbC50aXRsZSA9IGZvcm1hdHRlZC50b29sdGlwO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYmFsYW5jZS1zeW1ib2wnKS50ZXh0Q29udGVudCA9IHN5bWJvbHNbY3VycmVudFN0YXRlLm5ldHdvcmtdIHx8ICdUT0tFTic7XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIEdldCB0b2tlbiBiYWxhbmNlXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBhbGxUb2tlbnMgPSBhd2FpdCB0b2tlbnMuZ2V0QWxsVG9rZW5zKGN1cnJlbnRTdGF0ZS5uZXR3b3JrKTtcclxuICAgICAgY29uc3QgdG9rZW4gPSBhbGxUb2tlbnMuZmluZCh0ID0+IHQuYWRkcmVzcyA9PT0gc2VsZWN0ZWRWYWx1ZSk7XHJcblxyXG4gICAgICBpZiAodG9rZW4pIHtcclxuICAgICAgICBjb25zdCBiYWxhbmNlV2VpID0gYXdhaXQgZXJjMjAuZ2V0VG9rZW5CYWxhbmNlKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCB0b2tlbi5hZGRyZXNzLCBjdXJyZW50U3RhdGUuYWRkcmVzcyk7XHJcbiAgICAgICAgY29uc3QgcmF3QmFsYW5jZSA9IGVyYzIwLmZvcm1hdFRva2VuQmFsYW5jZShiYWxhbmNlV2VpLCB0b2tlbi5kZWNpbWFscywgNCk7XHJcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkID0gZm9ybWF0QmFsYW5jZVdpdGhDb21tYXMocmF3QmFsYW5jZSwgdG9rZW4uZGVjaW1hbHMpO1xyXG4gICAgICAgIGJhbGFuY2VFbC50ZXh0Q29udGVudCA9IGZvcm1hdHRlZC5kaXNwbGF5O1xyXG4gICAgICAgIGJhbGFuY2VFbC50aXRsZSA9IGZvcm1hdHRlZC50b29sdGlwO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWJhbGFuY2Utc3ltYm9sJykudGV4dENvbnRlbnQgPSB0b2tlbi5zeW1ib2w7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHRva2VuIGJhbGFuY2U6JywgZXJyb3IpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlU2VuZE1heCgpIHtcclxuICAvLyBTZXQgYW1vdW50IHRvIGF2YWlsYWJsZSBiYWxhbmNlIChtaW51cyBlc3RpbWF0ZWQgZ2FzKVxyXG4gIC8vIEZvciBzaW1wbGljaXR5LCB3ZSdsbCBqdXN0IHNldCB0byBjdXJyZW50IGJhbGFuY2VcclxuICAvLyBVc2VyIHNob3VsZCBsZWF2ZSBzb21lIGZvciBnYXNcclxuICBjb25zdCBiYWxhbmNlID0gcGFyc2VGbG9hdChjdXJyZW50U3RhdGUuYmFsYW5jZSk7XHJcbiAgaWYgKGJhbGFuY2UgPiAwKSB7XHJcbiAgICAvLyBMZWF2ZSBhIGJpdCBmb3IgZ2FzIChyb3VnaCBlc3RpbWF0ZTogMC4wMDEgZm9yIHNpbXBsZSB0cmFuc2ZlcilcclxuICAgIGNvbnN0IG1heFNlbmQgPSBNYXRoLm1heCgwLCBiYWxhbmNlIC0gMC4wMDEpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYW1vdW50JykudmFsdWUgPSBtYXhTZW5kLnRvU3RyaW5nKCk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZW5kVHJhbnNhY3Rpb24oKSB7XHJcbiAgY29uc3QgdG9BZGRyZXNzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtdG8tYWRkcmVzcycpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCBhbW91bnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hbW91bnQnKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgcGFzc3dvcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1wYXNzd29yZCcpLnZhbHVlO1xyXG4gIGNvbnN0IGFzc2V0U2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYXNzZXQtc2VsZWN0Jyk7XHJcbiAgY29uc3Qgc2VsZWN0ZWRBc3NldCA9IGFzc2V0U2VsZWN0LnZhbHVlO1xyXG4gIGNvbnN0IGVycm9yRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1lcnJvcicpO1xyXG5cclxuICBjb25zdCBzeW1ib2xzID0ge1xyXG4gICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3RQTFMnLFxyXG4gICAgJ3B1bHNlY2hhaW4nOiAnUExTJyxcclxuICAgICdldGhlcmV1bSc6ICdFVEgnLFxyXG4gICAgJ3NlcG9saWEnOiAnU0VQJ1xyXG4gIH07XHJcblxyXG4gIC8vIFZhbGlkYXRlIGlucHV0c1xyXG4gIGlmICghdG9BZGRyZXNzIHx8ICFhbW91bnQgfHwgIXBhc3N3b3JkKSB7XHJcbiAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ1BsZWFzZSBmaWxsIGluIGFsbCBmaWVsZHMnO1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIGFkZHJlc3MgZm9ybWF0XHJcbiAgaWYgKCF0b0FkZHJlc3MubWF0Y2goL14weFthLWZBLUYwLTldezQwfSQvKSkge1xyXG4gICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdJbnZhbGlkIHJlY2lwaWVudCBhZGRyZXNzJztcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSBhbW91bnRcclxuICBjb25zdCBhbW91bnROdW0gPSBwYXJzZUZsb2F0KGFtb3VudCk7XHJcbiAgaWYgKGlzTmFOKGFtb3VudE51bSkgfHwgYW1vdW50TnVtIDw9IDApIHtcclxuICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSAnSW52YWxpZCBhbW91bnQnO1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgIC8vIFVubG9jayB3YWxsZXQgd2l0aCBwYXNzd29yZFxyXG4gICAgY29uc3QgeyBzaWduZXIgfSA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCk7XHJcblxyXG4gICAgLy8gR2V0IHByb3ZpZGVyIHdpdGggYXV0b21hdGljIGZhaWxvdmVyIGFuZCBjb25uZWN0IHNpZ25lclxyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIoY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG4gICAgY29uc3QgY29ubmVjdGVkU2lnbmVyID0gc2lnbmVyLmNvbm5lY3QocHJvdmlkZXIpO1xyXG5cclxuICAgIGxldCB0eFJlc3BvbnNlLCBzeW1ib2w7XHJcblxyXG4gICAgaWYgKHNlbGVjdGVkQXNzZXQgPT09ICduYXRpdmUnKSB7XHJcbiAgICAgIC8vIFNlbmQgbmF0aXZlIGN1cnJlbmN5XHJcbiAgICAgIGNvbnN0IHR4ID0ge1xyXG4gICAgICAgIHRvOiB0b0FkZHJlc3MsXHJcbiAgICAgICAgdmFsdWU6IGV0aGVycy5wYXJzZUV0aGVyKGFtb3VudClcclxuICAgICAgfTtcclxuICAgICAgdHhSZXNwb25zZSA9IGF3YWl0IGNvbm5lY3RlZFNpZ25lci5zZW5kVHJhbnNhY3Rpb24odHgpO1xyXG4gICAgICBzeW1ib2wgPSBzeW1ib2xzW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXSB8fCAndG9rZW5zJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFNlbmQgdG9rZW5cclxuICAgICAgY29uc3QgYWxsVG9rZW5zID0gYXdhaXQgdG9rZW5zLmdldEFsbFRva2VucyhjdXJyZW50U3RhdGUubmV0d29yayk7XHJcbiAgICAgIGNvbnN0IHRva2VuID0gYWxsVG9rZW5zLmZpbmQodCA9PiB0LmFkZHJlc3MgPT09IHNlbGVjdGVkQXNzZXQpO1xyXG5cclxuICAgICAgaWYgKCF0b2tlbikge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVG9rZW4gbm90IGZvdW5kJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGFtb3VudFdlaSA9IGVyYzIwLnBhcnNlVG9rZW5BbW91bnQoYW1vdW50LCB0b2tlbi5kZWNpbWFscyk7XHJcbiAgICAgIHR4UmVzcG9uc2UgPSBhd2FpdCBlcmMyMC50cmFuc2ZlclRva2VuKGNvbm5lY3RlZFNpZ25lciwgdG9rZW4uYWRkcmVzcywgdG9BZGRyZXNzLCBhbW91bnRXZWkpO1xyXG4gICAgICBzeW1ib2wgPSB0b2tlbi5zeW1ib2w7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2hvdyBzdWNjZXNzIG1vZGFsIHdpdGggdHggaGFzaFxyXG4gICAgc2hvd1RyYW5zYWN0aW9uU3VjY2Vzc01vZGFsKHR4UmVzcG9uc2UuaGFzaCk7XHJcblxyXG4gICAgLy8gU2VuZCBkZXNrdG9wIG5vdGlmaWNhdGlvblxyXG4gICAgaWYgKGNocm9tZS5ub3RpZmljYXRpb25zKSB7XHJcbiAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIFNlbnQnLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBTZW50ICR7YW1vdW50fSAke3N5bWJvbH0gdG8gJHt0b0FkZHJlc3Muc2xpY2UoMCwgMTApfS4uLmAsXHJcbiAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmV0dXJuIHRvIGRhc2hib2FyZFxyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpO1xyXG5cclxuICAgIC8vIFdhaXQgZm9yIHRyYW5zYWN0aW9uIGNvbmZpcm1hdGlvbiBpbiBiYWNrZ3JvdW5kXHJcbiAgICB3YWl0Rm9yVHJhbnNhY3Rpb25Db25maXJtYXRpb24odHhSZXNwb25zZS5oYXNoLCBhbW91bnQsIHN5bWJvbCk7XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdTZW5kIHRyYW5zYWN0aW9uIGVycm9yOicsIGVycm9yKTtcclxuICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdpbmNvcnJlY3QgcGFzc3dvcmQnKVxyXG4gICAgICA/ICdJbmNvcnJlY3QgcGFzc3dvcmQnXHJcbiAgICAgIDogJ1RyYW5zYWN0aW9uIGZhaWxlZDogJyArIGVycm9yLm1lc3NhZ2U7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2hvd1RyYW5zYWN0aW9uU3VjY2Vzc01vZGFsKHR4SGFzaCkge1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1zdWNjZXNzLWhhc2gnKS50ZXh0Q29udGVudCA9IHR4SGFzaDtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtdHgtc3VjY2VzcycpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiB3YWl0Rm9yVHJhbnNhY3Rpb25Db25maXJtYXRpb24odHhIYXNoLCBhbW91bnQsIHN5bWJvbCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihjdXJyZW50U3RhdGUubmV0d29yayk7XHJcblxyXG4gICAgLy8gV2FpdCBmb3IgdHJhbnNhY3Rpb24gdG8gYmUgbWluZWQgKDEgY29uZmlybWF0aW9uKVxyXG4gICAgY29uc3QgcmVjZWlwdCA9IGF3YWl0IHByb3ZpZGVyLndhaXRGb3JUcmFuc2FjdGlvbih0eEhhc2gsIDEpO1xyXG5cclxuICAgIGlmIChyZWNlaXB0ICYmIHJlY2VpcHQuc3RhdHVzID09PSAxKSB7XHJcbiAgICAgIC8vIFRyYW5zYWN0aW9uIGNvbmZpcm1lZCBzdWNjZXNzZnVsbHlcclxuICAgICAgaWYgKGNocm9tZS5ub3RpZmljYXRpb25zKSB7XHJcbiAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gQ29uZmlybWVkJyxcclxuICAgICAgICAgIG1lc3NhZ2U6IGAke2Ftb3VudH0gJHtzeW1ib2x9IHRyYW5zZmVyIGNvbmZpcm1lZCBvbi1jaGFpbiFgLFxyXG4gICAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQXV0by1yZWZyZXNoIGJhbGFuY2VcclxuICAgICAgYXdhaXQgZmV0Y2hCYWxhbmNlKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBUcmFuc2FjdGlvbiBmYWlsZWRcclxuICAgICAgaWYgKGNocm9tZS5ub3RpZmljYXRpb25zKSB7XHJcbiAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gRmFpbGVkJyxcclxuICAgICAgICAgIG1lc3NhZ2U6ICdUcmFuc2FjdGlvbiB3YXMgcmV2ZXJ0ZWQgb3IgZmFpbGVkIG9uLWNoYWluJyxcclxuICAgICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3Igd2FpdGluZyBmb3IgY29uZmlybWF0aW9uOicsIGVycm9yKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFJFQ0VJVkUgPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gc2hvd1JlY2VpdmVTY3JlZW4oKSB7XHJcbiAgY29uc3QgYWRkcmVzcyA9IGN1cnJlbnRTdGF0ZS5hZGRyZXNzO1xyXG5cclxuICAvLyBVcGRhdGUgYWRkcmVzcyBkaXNwbGF5XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlY2VpdmUtYWRkcmVzcycpLnRleHRDb250ZW50ID0gYWRkcmVzcztcclxuXHJcbiAgLy8gVXBkYXRlIG5ldHdvcmsgaW5mb1xyXG4gIGNvbnN0IG5ldHdvcmtOYW1lcyA9IHtcclxuICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICdQdWxzZUNoYWluIFRlc3RuZXQgVjQnLFxyXG4gICAgJ3B1bHNlY2hhaW4nOiAnUHVsc2VDaGFpbiBNYWlubmV0JyxcclxuICAgICdldGhlcmV1bSc6ICdFdGhlcmV1bSBNYWlubmV0JyxcclxuICAgICdzZXBvbGlhJzogJ1NlcG9saWEgVGVzdG5ldCdcclxuICB9O1xyXG4gIGNvbnN0IHN5bWJvbHMgPSB7XHJcbiAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAndFBMUycsXHJcbiAgICAncHVsc2VjaGFpbic6ICdQTFMnLFxyXG4gICAgJ2V0aGVyZXVtJzogJ0VUSCcsXHJcbiAgICAnc2Vwb2xpYSc6ICdTRVAnXHJcbiAgfTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVjZWl2ZS1uZXR3b3JrLW5hbWUnKS50ZXh0Q29udGVudCA9IG5ldHdvcmtOYW1lc1tjdXJyZW50U3RhdGUubmV0d29ya10gfHwgJ1Vua25vd24gTmV0d29yayc7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlY2VpdmUtbmV0d29yay1zeW1ib2wnKS50ZXh0Q29udGVudCA9IHN5bWJvbHNbY3VycmVudFN0YXRlLm5ldHdvcmtdIHx8ICdUT0tFTic7XHJcblxyXG4gIC8vIEdlbmVyYXRlIFFSIGNvZGVcclxuICB0cnkge1xyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlY2VpdmUtcXItY2FudmFzJyk7XHJcbiAgICBhd2FpdCBRUkNvZGUudG9DYW52YXMoY2FudmFzLCBhZGRyZXNzLCB7XHJcbiAgICAgIHdpZHRoOiAyMDAsXHJcbiAgICAgIG1hcmdpbjogMixcclxuICAgICAgY29sb3I6IHtcclxuICAgICAgICBkYXJrOiBnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmJvZHkpLmdldFByb3BlcnR5VmFsdWUoJy0tdGVybWluYWwtZmcnKS50cmltKCksXHJcbiAgICAgICAgbGlnaHQ6IGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuYm9keSkuZ2V0UHJvcGVydHlWYWx1ZSgnLS10ZXJtaW5hbC1iZycpLnRyaW0oKVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2VuZXJhdGluZyBRUiBjb2RlOicsIGVycm9yKTtcclxuICB9XHJcblxyXG4gIHNob3dTY3JlZW4oJ3NjcmVlbi1yZWNlaXZlJyk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNvcHlSZWNlaXZlQWRkcmVzcygpIHtcclxuICB0cnkge1xyXG4gICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LXJlY2VpdmUtYWRkcmVzcycpO1xyXG4gICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gYnRuLnRleHRDb250ZW50O1xyXG4gICAgYnRuLnRleHRDb250ZW50ID0gJ0NPUElFRCEnO1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGJ0bi50ZXh0Q29udGVudCA9IG9yaWdpbmFsVGV4dDtcclxuICAgIH0sIDIwMDApO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBhbGVydCgnRmFpbGVkIHRvIGNvcHkgYWRkcmVzcycpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gVE9LRU5TID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIHNob3dUb2tlbnNTY3JlZW4oKSB7XHJcbiAgLy8gU3dpdGNoIHRvIHNjcmVlbiBmaXJzdCBzbyB1c2VyIHNlZXMgbG9hZGluZyBpbmRpY2F0b3JcclxuICBzaG93U2NyZWVuKCdzY3JlZW4tdG9rZW5zJyk7XHJcblxyXG4gIC8vIFNtYWxsIGRlbGF5IHRvIGVuc3VyZSBzY3JlZW4gaXMgdmlzaWJsZSBiZWZvcmUgc3RhcnRpbmcgcmVuZGVyXHJcbiAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDEwKSk7XHJcblxyXG4gIC8vIE5vdyByZW5kZXIgdG9rZW5zIChsb2FkaW5nIGluZGljYXRvciB3aWxsIGJlIHZpc2libGUpXHJcbiAgYXdhaXQgcmVuZGVyVG9rZW5zU2NyZWVuKCk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlbmRlclRva2Vuc1NjcmVlbigpIHtcclxuICBjb25zdCBuZXR3b3JrID0gY3VycmVudFN0YXRlLm5ldHdvcms7XHJcblxyXG4gIC8vIFNob3cgbG9hZGluZywgaGlkZSBwYW5lbHNcclxuICBjb25zdCBsb2FkaW5nRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW5zLWxvYWRpbmcnKTtcclxuICBjb25zdCBkZWZhdWx0UGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGVmYXVsdC10b2tlbnMtcGFuZWwnKTtcclxuICBjb25zdCBjdXN0b21QYW5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdXN0b20tdG9rZW5zLXBhbmVsJyk7XHJcblxyXG4gIGlmIChsb2FkaW5nRWwpIGxvYWRpbmdFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICBpZiAoZGVmYXVsdFBhbmVsKSBkZWZhdWx0UGFuZWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgaWYgKGN1c3RvbVBhbmVsKSBjdXN0b21QYW5lbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFJlbmRlciBkZWZhdWx0IHRva2Vuc1xyXG4gICAgYXdhaXQgcmVuZGVyRGVmYXVsdFRva2VucyhuZXR3b3JrKTtcclxuXHJcbiAgICAvLyBSZW5kZXIgY3VzdG9tIHRva2Vuc1xyXG4gICAgYXdhaXQgcmVuZGVyQ3VzdG9tVG9rZW5zKG5ldHdvcmspO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICAvLyBIaWRlIGxvYWRpbmcsIHNob3cgcGFuZWxzXHJcbiAgICBpZiAobG9hZGluZ0VsKSBsb2FkaW5nRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBpZiAoZGVmYXVsdFBhbmVsKSBkZWZhdWx0UGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICBpZiAoY3VzdG9tUGFuZWwpIGN1c3RvbVBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcmVuZGVyRGVmYXVsdFRva2VucyhuZXR3b3JrKSB7XHJcbiAgY29uc3QgZGVmYXVsdFRva2Vuc0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlZmF1bHQtdG9rZW5zLWxpc3QnKTtcclxuICBjb25zdCBuZXR3b3JrRGVmYXVsdHMgPSB0b2tlbnMuREVGQVVMVF9UT0tFTlNbbmV0d29ya10gfHwge307XHJcbiAgY29uc3QgZW5hYmxlZERlZmF1bHRzID0gYXdhaXQgdG9rZW5zLmdldEVuYWJsZWREZWZhdWx0VG9rZW5zKG5ldHdvcmspO1xyXG5cclxuICBpZiAoT2JqZWN0LmtleXMobmV0d29ya0RlZmF1bHRzKS5sZW5ndGggPT09IDApIHtcclxuICAgIGRlZmF1bHRUb2tlbnNFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBwYWRkaW5nOiAxNnB4O1wiPk5vIGRlZmF1bHQgdG9rZW5zIGZvciB0aGlzIG5ldHdvcms8L3A+JztcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGxldCBodG1sID0gJyc7XHJcbiAgZm9yIChjb25zdCBzeW1ib2wgaW4gbmV0d29ya0RlZmF1bHRzKSB7XHJcbiAgICBjb25zdCB0b2tlbiA9IG5ldHdvcmtEZWZhdWx0c1tzeW1ib2xdO1xyXG4gICAgY29uc3QgaXNFbmFibGVkID0gZW5hYmxlZERlZmF1bHRzLmluY2x1ZGVzKHN5bWJvbCk7XHJcblxyXG4gICAgLy8gRmV0Y2ggYmFsYW5jZSBpZiBlbmFibGVkXHJcbiAgICBsZXQgYmFsYW5jZVRleHQgPSAnLSc7XHJcbiAgICBsZXQgYmFsYW5jZVRvb2x0aXAgPSAnJztcclxuICAgIGxldCB1c2RWYWx1ZSA9IG51bGw7XHJcbiAgICBpZiAoaXNFbmFibGVkICYmIGN1cnJlbnRTdGF0ZS5hZGRyZXNzKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgYmFsYW5jZVdlaSA9IGF3YWl0IGVyYzIwLmdldFRva2VuQmFsYW5jZShuZXR3b3JrLCB0b2tlbi5hZGRyZXNzLCBjdXJyZW50U3RhdGUuYWRkcmVzcyk7XHJcbiAgICAgICAgY29uc3QgcmF3QmFsYW5jZSA9IGVyYzIwLmZvcm1hdFRva2VuQmFsYW5jZShiYWxhbmNlV2VpLCB0b2tlbi5kZWNpbWFscywgNCk7XHJcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkID0gZm9ybWF0QmFsYW5jZVdpdGhDb21tYXMocmF3QmFsYW5jZSwgdG9rZW4uZGVjaW1hbHMpO1xyXG4gICAgICAgIGJhbGFuY2VUZXh0ID0gZm9ybWF0dGVkLmRpc3BsYXk7XHJcbiAgICAgICAgYmFsYW5jZVRvb2x0aXAgPSBmb3JtYXR0ZWQudG9vbHRpcDtcclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIFVTRCB2YWx1ZSBpZiBwcmljZXMgYXZhaWxhYmxlXHJcbiAgICAgICAgaWYgKGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcykge1xyXG4gICAgICAgICAgdXNkVmFsdWUgPSBnZXRUb2tlblZhbHVlVVNEKHN5bWJvbCwgYmFsYW5jZVdlaSwgdG9rZW4uZGVjaW1hbHMsIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGJhbGFuY2VUZXh0ID0gJ0Vycm9yJztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxvZ29VcmwgPSB0b2tlbi5sb2dvID8gY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBhc3NldHMvbG9nb3MvJHt0b2tlbi5sb2dvfWApIDogJyc7XHJcblxyXG4gICAgaHRtbCArPSBgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJ0b2tlbi1pdGVtXCIgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IHBhZGRpbmc6IDEycHggOHB4OyBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tdGVybWluYWwtYm9yZGVyKTtcIj5cclxuICAgICAgICAke3Rva2VuLmxvZ28gP1xyXG4gICAgICAgICAgKHRva2VuLmhvbWVVcmwgP1xyXG4gICAgICAgICAgICBgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgYWx0PVwiJHtlc2NhcGVIdG1sKHRva2VuLnN5bWJvbCl9XCIgc3R5bGU9XCJ3aWR0aDogMzJweDsgaGVpZ2h0OiAzMnB4OyBtYXJnaW4tcmlnaHQ6IDEycHg7IGJvcmRlci1yYWRpdXM6IDUwJTsgY3Vyc29yOiBwb2ludGVyO1wiIGNsYXNzPVwidG9rZW4tbG9nby1saW5rXCIgZGF0YS11cmw9XCIke3Rva2VuLmhvbWVVcmx9XCIgdGl0bGU9XCJWaXNpdCAke2VzY2FwZUh0bWwodG9rZW4ubmFtZSl9IGhvbWVwYWdlXCIgLz5gIDpcclxuICAgICAgICAgICAgYDxpbWcgc3JjPVwiJHtsb2dvVXJsfVwiIGFsdD1cIiR7ZXNjYXBlSHRtbCh0b2tlbi5zeW1ib2wpfVwiIHN0eWxlPVwid2lkdGg6IDMycHg7IGhlaWdodDogMzJweDsgbWFyZ2luLXJpZ2h0OiAxMnB4OyBib3JkZXItcmFkaXVzOiA1MCU7XCIgLz5gKSA6XHJcbiAgICAgICAgICAnPGRpdiBzdHlsZT1cIndpZHRoOiAzMnB4OyBoZWlnaHQ6IDMycHg7IG1hcmdpbi1yaWdodDogMTJweDsgYmFja2dyb3VuZDogdmFyKC0tdGVybWluYWwtYm9yZGVyKTsgYm9yZGVyLXJhZGl1czogNTAlO1wiPjwvZGl2Pid9XHJcbiAgICAgICAgPGRpdiBzdHlsZT1cImZsZXg6IDE7XCI+XHJcbiAgICAgICAgICA8cCBzdHlsZT1cImZvbnQtc2l6ZTogMTVweDsgZm9udC13ZWlnaHQ6IGJvbGQ7XCI+JHtlc2NhcGVIdG1sKHRva2VuLnN5bWJvbCl9PC9wPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LWRpbSAke3Rva2VuLmRleFNjcmVlbmVyVXJsID8gJ3Rva2VuLW5hbWUtbGluaycgOiAnJ31cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTNweDsgJHt0b2tlbi5kZXhTY3JlZW5lclVybCA/ICdjdXJzb3I6IHBvaW50ZXI7IHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOycgOiAnJ31cIiAke3Rva2VuLmRleFNjcmVlbmVyVXJsID8gYGRhdGEtdXJsPVwiJHt0b2tlbi5kZXhTY3JlZW5lclVybH1cIiB0aXRsZT1cIlZpZXcgJHtlc2NhcGVIdG1sKHRva2VuLm5hbWUpfSBvbiBEZXhTY3JlZW5lclwiYCA6ICcnfT4ke2VzY2FwZUh0bWwodG9rZW4ubmFtZSl9PC9wPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBmb250LWZhbWlseTogdmFyKC0tZm9udC1tb25vKTsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiA0cHg7XCI+XHJcbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwibWF4LXdpZHRoOiA4MHB4OyBvdmVyZmxvdzogaGlkZGVuOyB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcIj4ke3Rva2VuLmFkZHJlc3N9PC9zcGFuPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiY29weS1hZGRyZXNzLWJ0blwiIGRhdGEtYWRkcmVzcz1cIiR7dG9rZW4uYWRkcmVzc31cIiBzdHlsZT1cImJhY2tncm91bmQ6IG5vbmU7IGJvcmRlcjogbm9uZTsgY29sb3I6IHZhcigtLXRlcm1pbmFsLWFjY2VudCk7IGN1cnNvcjogcG9pbnRlcjsgZm9udC1zaXplOiAxMXB4OyBwYWRkaW5nOiAycHggNHB4O1wiIHRpdGxlPVwiQ29weSBjb250cmFjdCBhZGRyZXNzXCI+8J+TizwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgJHtpc0VuYWJsZWQgPyBgXHJcbiAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTNweDsgY3Vyc29yOiBoZWxwO1wiIHRpdGxlPVwiJHtiYWxhbmNlVG9vbHRpcH1cIj5CYWxhbmNlOiAke2JhbGFuY2VUZXh0fTwvcD5cclxuICAgICAgICAgICAgJHt1c2RWYWx1ZSAhPT0gbnVsbCA/IGA8cCBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDEycHg7IG1hcmdpbi10b3A6IDJweDtcIj4ke2Zvcm1hdFVTRCh1c2RWYWx1ZSl9PC9wPmAgOiAnJ31cclxuICAgICAgICAgIGAgOiAnJ31cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgbWFyZ2luLWxlZnQ6IDhweDtcIj5cclxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJ2aWV3LXRva2VuLWRldGFpbHMtYnRuXCIgZGF0YS10b2tlbi1zeW1ib2w9XCIke3N5bWJvbH1cIiBkYXRhLWlzLWRlZmF1bHQ9XCJ0cnVlXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiB2YXIoLS10ZXJtaW5hbC1hY2NlbnQpOyBib3JkZXI6IG5vbmU7IGNvbG9yOiAjMDAwOyBjdXJzb3I6IHBvaW50ZXI7IGZvbnQtc2l6ZTogMThweDsgcGFkZGluZzogNHB4IDhweDsgYm9yZGVyLXJhZGl1czogNHB4O1wiIHRpdGxlPVwiVmlldyB0b2tlbiBkZXRhaWxzXCI+4oS577iPPC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuICB9XHJcblxyXG4gIGRlZmF1bHRUb2tlbnNFbC5pbm5lckhUTUwgPSBodG1sO1xyXG5cclxuICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciB2aWV3IGRldGFpbHMgYnV0dG9uc1xyXG4gIGRlZmF1bHRUb2tlbnNFbC5xdWVyeVNlbGVjdG9yQWxsKCcudmlldy10b2tlbi1kZXRhaWxzLWJ0bicpLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHN5bWJvbCA9IGUudGFyZ2V0LmRhdGFzZXQudG9rZW5TeW1ib2w7XHJcbiAgICAgIGNvbnN0IGlzRGVmYXVsdCA9IGUudGFyZ2V0LmRhdGFzZXQuaXNEZWZhdWx0ID09PSAndHJ1ZSc7XHJcbiAgICAgIHNob3dUb2tlbkRldGFpbHMoc3ltYm9sLCBpc0RlZmF1bHQpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGNvcHkgYWRkcmVzcyBidXR0b25zXHJcbiAgZGVmYXVsdFRva2Vuc0VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb3B5LWFkZHJlc3MtYnRuJykuZm9yRWFjaChidG4gPT4ge1xyXG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGUpID0+IHtcclxuICAgICAgY29uc3QgYWRkcmVzcyA9IGUudGFyZ2V0LmRhdGFzZXQuYWRkcmVzcztcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChhZGRyZXNzKTtcclxuICAgICAgICBjb25zdCBvcmlnaW5hbFRleHQgPSBlLnRhcmdldC50ZXh0Q29udGVudDtcclxuICAgICAgICBlLnRhcmdldC50ZXh0Q29udGVudCA9ICfinJMnO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgZS50YXJnZXQudGV4dENvbnRlbnQgPSBvcmlnaW5hbFRleHQ7XHJcbiAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNvcHkgYWRkcmVzczonLCBlcnJvcik7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBsb2dvIGNsaWNrcyAob3BlbiBob21lcGFnZSlcclxuICBkZWZhdWx0VG9rZW5zRWwucXVlcnlTZWxlY3RvckFsbCgnLnRva2VuLWxvZ28tbGluaycpLmZvckVhY2goaW1nID0+IHtcclxuICAgIGltZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGUudGFyZ2V0LmRhdGFzZXQudXJsO1xyXG4gICAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmwgfSk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgbmFtZSBjbGlja3MgKG9wZW4gRGV4U2NyZWVuZXIpXHJcbiAgZGVmYXVsdFRva2Vuc0VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2tlbi1uYW1lLWxpbmsnKS5mb3JFYWNoKHAgPT4ge1xyXG4gICAgcC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LnVybDtcclxuICAgICAgaWYgKHVybCkge1xyXG4gICAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybCB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlbmRlckN1c3RvbVRva2VucyhuZXR3b3JrKSB7XHJcbiAgY29uc3QgY3VzdG9tVG9rZW5zRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VzdG9tLXRva2Vucy1saXN0Jyk7XHJcbiAgY29uc3QgY3VzdG9tVG9rZW5zID0gYXdhaXQgdG9rZW5zLmdldEN1c3RvbVRva2VucyhuZXR3b3JrKTtcclxuXHJcbiAgaWYgKGN1c3RvbVRva2Vucy5sZW5ndGggPT09IDApIHtcclxuICAgIGN1c3RvbVRva2Vuc0VsLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDExcHg7IHBhZGRpbmc6IDE2cHg7XCI+Tm8gY3VzdG9tIHRva2VucyBhZGRlZDwvcD4nO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgbGV0IGh0bWwgPSAnJztcclxuICBmb3IgKGNvbnN0IHRva2VuIG9mIGN1c3RvbVRva2Vucykge1xyXG4gICAgLy8gRmV0Y2ggYmFsYW5jZVxyXG4gICAgbGV0IGJhbGFuY2VUZXh0ID0gJy0nO1xyXG4gICAgbGV0IGJhbGFuY2VUb29sdGlwID0gJyc7XHJcbiAgICBsZXQgdXNkVmFsdWUgPSBudWxsO1xyXG4gICAgaWYgKGN1cnJlbnRTdGF0ZS5hZGRyZXNzKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgYmFsYW5jZVdlaSA9IGF3YWl0IGVyYzIwLmdldFRva2VuQmFsYW5jZShuZXR3b3JrLCB0b2tlbi5hZGRyZXNzLCBjdXJyZW50U3RhdGUuYWRkcmVzcyk7XHJcbiAgICAgICAgY29uc3QgcmF3QmFsYW5jZSA9IGVyYzIwLmZvcm1hdFRva2VuQmFsYW5jZShiYWxhbmNlV2VpLCB0b2tlbi5kZWNpbWFscywgNCk7XHJcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkID0gZm9ybWF0QmFsYW5jZVdpdGhDb21tYXMocmF3QmFsYW5jZSwgdG9rZW4uZGVjaW1hbHMpO1xyXG4gICAgICAgIGJhbGFuY2VUZXh0ID0gZm9ybWF0dGVkLmRpc3BsYXk7XHJcbiAgICAgICAgYmFsYW5jZVRvb2x0aXAgPSBmb3JtYXR0ZWQudG9vbHRpcDtcclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIFVTRCB2YWx1ZSBpZiBwcmljZXMgYXZhaWxhYmxlIGFuZCB0b2tlbiBpcyBrbm93blxyXG4gICAgICAgIGlmIChjdXJyZW50U3RhdGUudG9rZW5QcmljZXMpIHtcclxuICAgICAgICAgIHVzZFZhbHVlID0gZ2V0VG9rZW5WYWx1ZVVTRCh0b2tlbi5zeW1ib2wsIGJhbGFuY2VXZWksIHRva2VuLmRlY2ltYWxzLCBjdXJyZW50U3RhdGUudG9rZW5QcmljZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBiYWxhbmNlVGV4dCA9ICdFcnJvcic7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsb2dvVXJsID0gdG9rZW4ubG9nbyA/IGNocm9tZS5ydW50aW1lLmdldFVSTChgYXNzZXRzL2xvZ29zLyR7dG9rZW4ubG9nb31gKSA6ICcnO1xyXG5cclxuICAgIGh0bWwgKz0gYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwidG9rZW4taXRlbVwiIHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBwYWRkaW5nOiAxMnB4IDhweDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRlcm1pbmFsLWJvcmRlcik7XCI+XHJcbiAgICAgICAgJHt0b2tlbi5sb2dvID9cclxuICAgICAgICAgICh0b2tlbi5ob21lVXJsID9cclxuICAgICAgICAgICAgYDxpbWcgc3JjPVwiJHtsb2dvVXJsfVwiIGFsdD1cIiR7ZXNjYXBlSHRtbCh0b2tlbi5zeW1ib2wpfVwiIHN0eWxlPVwid2lkdGg6IDMycHg7IGhlaWdodDogMzJweDsgbWFyZ2luLXJpZ2h0OiAxMnB4OyBib3JkZXItcmFkaXVzOiA1MCU7IGN1cnNvcjogcG9pbnRlcjtcIiBjbGFzcz1cInRva2VuLWxvZ28tbGlua1wiIGRhdGEtdXJsPVwiJHt0b2tlbi5ob21lVXJsfVwiIHRpdGxlPVwiVmlzaXQgJHtlc2NhcGVIdG1sKHRva2VuLm5hbWUpfSBob21lcGFnZVwiIC8+YCA6XHJcbiAgICAgICAgICAgIGA8aW1nIHNyYz1cIiR7bG9nb1VybH1cIiBhbHQ9XCIke2VzY2FwZUh0bWwodG9rZW4uc3ltYm9sKX1cIiBzdHlsZT1cIndpZHRoOiAzMnB4OyBoZWlnaHQ6IDMycHg7IG1hcmdpbi1yaWdodDogMTJweDsgYm9yZGVyLXJhZGl1czogNTAlO1wiIC8+YCkgOlxyXG4gICAgICAgICAgJzxkaXYgc3R5bGU9XCJ3aWR0aDogMzJweDsgaGVpZ2h0OiAzMnB4OyBtYXJnaW4tcmlnaHQ6IDEycHg7IGJhY2tncm91bmQ6IHZhcigtLXRlcm1pbmFsLWJvcmRlcik7IGJvcmRlci1yYWRpdXM6IDUwJTtcIj48L2Rpdj4nfVxyXG4gICAgICAgIDxkaXYgc3R5bGU9XCJmbGV4OiAxO1wiPlxyXG4gICAgICAgICAgPHAgc3R5bGU9XCJmb250LXNpemU6IDE1cHg7IGZvbnQtd2VpZ2h0OiBib2xkO1wiPiR7ZXNjYXBlSHRtbCh0b2tlbi5zeW1ib2wpfTwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW0gJHt0b2tlbi5kZXhTY3JlZW5lclVybCA/ICd0b2tlbi1uYW1lLWxpbmsnIDogJyd9XCIgc3R5bGU9XCJmb250LXNpemU6IDEzcHg7ICR7dG9rZW4uZGV4U2NyZWVuZXJVcmwgPyAnY3Vyc29yOiBwb2ludGVyOyB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsnIDogJyd9XCIgJHt0b2tlbi5kZXhTY3JlZW5lclVybCA/IGBkYXRhLXVybD1cIiR7dG9rZW4uZGV4U2NyZWVuZXJVcmx9XCIgdGl0bGU9XCJWaWV3ICR7ZXNjYXBlSHRtbCh0b2tlbi5uYW1lKX0gb24gRGV4U2NyZWVuZXJcImAgOiAnJ30+JHtlc2NhcGVIdG1sKHRva2VuLm5hbWUpfTwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDsgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtbW9ubyk7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogNHB4O1wiPlxyXG4gICAgICAgICAgICA8c3BhbiBzdHlsZT1cIm1heC13aWR0aDogODBweDsgb3ZlcmZsb3c6IGhpZGRlbjsgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XCI+JHt0b2tlbi5hZGRyZXNzfTwvc3Bhbj5cclxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImNvcHktYWRkcmVzcy1idG5cIiBkYXRhLWFkZHJlc3M9XCIke3Rva2VuLmFkZHJlc3N9XCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiBub25lOyBib3JkZXI6IG5vbmU7IGNvbG9yOiB2YXIoLS10ZXJtaW5hbC1hY2NlbnQpOyBjdXJzb3I6IHBvaW50ZXI7IGZvbnQtc2l6ZTogMTFweDsgcGFkZGluZzogMnB4IDRweDtcIiB0aXRsZT1cIkNvcHkgY29udHJhY3QgYWRkcmVzc1wiPvCfk4s8L2J1dHRvbj5cclxuICAgICAgICAgIDwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTNweDsgY3Vyc29yOiBoZWxwO1wiIHRpdGxlPVwiJHtiYWxhbmNlVG9vbHRpcH1cIj5CYWxhbmNlOiAke2JhbGFuY2VUZXh0fTwvcD5cclxuICAgICAgICAgICR7dXNkVmFsdWUgIT09IG51bGwgPyBgPHAgY2xhc3M9XCJ0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMnB4OyBtYXJnaW4tdG9wOiAycHg7XCI+JHtmb3JtYXRVU0QodXNkVmFsdWUpfTwvcD5gIDogJyd9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IGdhcDogNnB4OyBhbGlnbi1pdGVtczogY2VudGVyOyBtYXJnaW4tbGVmdDogOHB4OyBtaW4td2lkdGg6IDgwcHg7XCI+XHJcbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwidmlldy10b2tlbi1kZXRhaWxzLWJ0blwiIGRhdGEtdG9rZW4tc3ltYm9sPVwiJHt0b2tlbi5zeW1ib2x9XCIgZGF0YS1pcy1kZWZhdWx0PVwiZmFsc2VcIiBkYXRhLXRva2VuLWFkZHJlc3M9XCIke3Rva2VuLmFkZHJlc3N9XCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiB2YXIoLS10ZXJtaW5hbC1hY2NlbnQpOyBib3JkZXI6IG5vbmU7IGNvbG9yOiAjMDAwOyBjdXJzb3I6IHBvaW50ZXI7IGZvbnQtc2l6ZTogMThweDsgcGFkZGluZzogNHB4IDhweDsgYm9yZGVyLXJhZGl1czogNHB4O1wiIHRpdGxlPVwiVmlldyB0b2tlbiBkZXRhaWxzXCI+4oS577iPPC9idXR0b24+XHJcbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuLWRhbmdlciBidG4tc21hbGwgcmVtb3ZlLXRva2VuLWJ0blwiIGRhdGEtdG9rZW4tYWRkcmVzcz1cIiR7dG9rZW4uYWRkcmVzc31cIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBmb250LXNpemU6IDlweDsgcGFkZGluZzogMnB4IDRweDtcIj5SRU1PVkU8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG4gIH1cclxuXHJcbiAgY3VzdG9tVG9rZW5zRWwuaW5uZXJIVE1MID0gaHRtbDtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgdmlldyBkZXRhaWxzIGJ1dHRvbnNcclxuICBjdXN0b21Ub2tlbnNFbC5xdWVyeVNlbGVjdG9yQWxsKCcudmlldy10b2tlbi1kZXRhaWxzLWJ0bicpLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHN5bWJvbCA9IGUudGFyZ2V0LmRhdGFzZXQudG9rZW5TeW1ib2w7XHJcbiAgICAgIGNvbnN0IGlzRGVmYXVsdCA9IGUudGFyZ2V0LmRhdGFzZXQuaXNEZWZhdWx0ID09PSAndHJ1ZSc7XHJcbiAgICAgIGNvbnN0IGFkZHJlc3MgPSBlLnRhcmdldC5kYXRhc2V0LnRva2VuQWRkcmVzcztcclxuICAgICAgc2hvd1Rva2VuRGV0YWlscyhzeW1ib2wsIGlzRGVmYXVsdCwgYWRkcmVzcyk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgcmVtb3ZlIGJ1dHRvbnNcclxuICBjdXN0b21Ub2tlbnNFbC5xdWVyeVNlbGVjdG9yQWxsKCcucmVtb3ZlLXRva2VuLWJ0bicpLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFkZHJlc3MgPSBlLnRhcmdldC5kYXRhc2V0LnRva2VuQWRkcmVzcztcclxuICAgICAgaWYgKGNvbmZpcm0oJ1JlbW92ZSB0aGlzIHRva2VuIGZyb20geW91ciBsaXN0PycpKSB7XHJcbiAgICAgICAgYXdhaXQgdG9rZW5zLnJlbW92ZUN1c3RvbVRva2VuKG5ldHdvcmssIGFkZHJlc3MpO1xyXG4gICAgICAgIGF3YWl0IHJlbmRlclRva2Vuc1NjcmVlbigpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgY29weSBhZGRyZXNzIGJ1dHRvbnNcclxuICBjdXN0b21Ub2tlbnNFbC5xdWVyeVNlbGVjdG9yQWxsKCcuY29weS1hZGRyZXNzLWJ0bicpLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFkZHJlc3MgPSBlLnRhcmdldC5kYXRhc2V0LmFkZHJlc3M7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoYWRkcmVzcyk7XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gZS50YXJnZXQudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgZS50YXJnZXQudGV4dENvbnRlbnQgPSAn4pyTJztcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIGUudGFyZ2V0LnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0O1xyXG4gICAgICAgIH0sIDEwMDApO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjb3B5IGFkZHJlc3M6JywgZXJyb3IpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgbG9nbyBjbGlja3MgKG9wZW4gaG9tZXBhZ2UpXHJcbiAgY3VzdG9tVG9rZW5zRWwucXVlcnlTZWxlY3RvckFsbCgnLnRva2VuLWxvZ28tbGluaycpLmZvckVhY2goaW1nID0+IHtcclxuICAgIGltZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGUudGFyZ2V0LmRhdGFzZXQudXJsO1xyXG4gICAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmwgfSk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgbmFtZSBjbGlja3MgKG9wZW4gRGV4U2NyZWVuZXIpXHJcbiAgY3VzdG9tVG9rZW5zRWwucXVlcnlTZWxlY3RvckFsbCgnLnRva2VuLW5hbWUtbGluaycpLmZvckVhY2gocCA9PiB7XHJcbiAgICBwLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICAgICAgY29uc3QgdXJsID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudXJsO1xyXG4gICAgICBpZiAodXJsKSB7XHJcbiAgICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gPT09PT0gVE9LRU4gREVUQUlMUyBTQ1JFRU4gPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gc2hvd1Rva2VuRGV0YWlscyhzeW1ib2wsIGlzRGVmYXVsdCwgY3VzdG9tQWRkcmVzcyA9IG51bGwpIHtcclxuICBjb25zdCBuZXR3b3JrID0gY3VycmVudFN0YXRlLm5ldHdvcms7XHJcblxyXG4gIC8vIEdldCB0b2tlbiBkYXRhXHJcbiAgbGV0IHRva2VuRGF0YTtcclxuICBpZiAoaXNEZWZhdWx0KSB7XHJcbiAgICB0b2tlbkRhdGEgPSB0b2tlbnMuREVGQVVMVF9UT0tFTlNbbmV0d29ya11bc3ltYm9sXTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gRmluZCBpbiBjdXN0b20gdG9rZW5zXHJcbiAgICBjb25zdCBjdXN0b21Ub2tlbnMgPSBhd2FpdCB0b2tlbnMuZ2V0Q3VzdG9tVG9rZW5zKG5ldHdvcmspO1xyXG4gICAgdG9rZW5EYXRhID0gY3VzdG9tVG9rZW5zLmZpbmQodCA9PiB0LmFkZHJlc3MudG9Mb3dlckNhc2UoKSA9PT0gY3VzdG9tQWRkcmVzcy50b0xvd2VyQ2FzZSgpKTtcclxuICB9XHJcblxyXG4gIGlmICghdG9rZW5EYXRhKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdUb2tlbiBub3QgZm91bmQ6Jywgc3ltYm9sKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIFN0b3JlIGN1cnJlbnQgdG9rZW4gaW4gc3RhdGVcclxuICBjdXJyZW50U3RhdGUuY3VycmVudFRva2VuRGV0YWlscyA9IHtcclxuICAgIC4uLnRva2VuRGF0YSxcclxuICAgIHN5bWJvbCxcclxuICAgIGlzRGVmYXVsdFxyXG4gIH07XHJcblxyXG4gIC8vIFVwZGF0ZSB0aXRsZVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXRpdGxlJykudGV4dENvbnRlbnQgPSBzeW1ib2wudG9VcHBlckNhc2UoKTtcclxuXHJcbiAgLy8gVXBkYXRlIHRva2VuIGluZm9cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1uYW1lJykudGV4dENvbnRlbnQgPSB0b2tlbkRhdGEubmFtZTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1zeW1ib2wnKS50ZXh0Q29udGVudCA9IHN5bWJvbDtcclxuXHJcbiAgLy8gVXBkYXRlIGxvZ29cclxuICBjb25zdCBsb2dvQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtbG9nby1jb250YWluZXInKTtcclxuICBpZiAodG9rZW5EYXRhLmxvZ28pIHtcclxuICAgIGNvbnN0IGxvZ29VcmwgPSBjaHJvbWUucnVudGltZS5nZXRVUkwoYGFzc2V0cy9sb2dvcy8ke3Rva2VuRGF0YS5sb2dvfWApO1xyXG4gICAgbG9nb0NvbnRhaW5lci5pbm5lckhUTUwgPSBgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgYWx0PVwiJHtzeW1ib2x9XCIgc3R5bGU9XCJ3aWR0aDogNDhweDsgaGVpZ2h0OiA0OHB4OyBib3JkZXItcmFkaXVzOiA1MCU7XCIgLz5gO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsb2dvQ29udGFpbmVyLmlubmVySFRNTCA9ICc8ZGl2IHN0eWxlPVwid2lkdGg6IDQ4cHg7IGhlaWdodDogNDhweDsgYmFja2dyb3VuZDogdmFyKC0tdGVybWluYWwtYm9yZGVyKTsgYm9yZGVyLXJhZGl1czogNTAlO1wiPjwvZGl2Pic7XHJcbiAgfVxyXG5cclxuICAvLyBGZXRjaCBhbmQgdXBkYXRlIGJhbGFuY2VcclxuICB0cnkge1xyXG4gICAgY29uc3QgYmFsYW5jZVdlaSA9IGF3YWl0IGVyYzIwLmdldFRva2VuQmFsYW5jZShuZXR3b3JrLCB0b2tlbkRhdGEuYWRkcmVzcywgY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgY29uc3QgYmFsYW5jZUZvcm1hdHRlZCA9IGVyYzIwLmZvcm1hdFRva2VuQmFsYW5jZShiYWxhbmNlV2VpLCB0b2tlbkRhdGEuZGVjaW1hbHMsIDgpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtYmFsYW5jZScpLnRleHRDb250ZW50ID0gYmFsYW5jZUZvcm1hdHRlZDtcclxuXHJcbiAgICAvLyBVcGRhdGUgVVNEIHZhbHVlXHJcbiAgICBpZiAoY3VycmVudFN0YXRlLnRva2VuUHJpY2VzICYmIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlc1tzeW1ib2xdKSB7XHJcbiAgICAgIGNvbnN0IHVzZFZhbHVlID0gZ2V0VG9rZW5WYWx1ZVVTRChzeW1ib2wsIGJhbGFuY2VXZWksIHRva2VuRGF0YS5kZWNpbWFscywgY3VycmVudFN0YXRlLnRva2VuUHJpY2VzKTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtYmFsYW5jZS11c2QnKS50ZXh0Q29udGVudCA9IGZvcm1hdFVTRCh1c2RWYWx1ZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1iYWxhbmNlLXVzZCcpLnRleHRDb250ZW50ID0gJ+KAlCc7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHRva2VuIGJhbGFuY2U6JywgZXJyb3IpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtYmFsYW5jZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWJhbGFuY2UtdXNkJykudGV4dENvbnRlbnQgPSAn4oCUJztcclxuICB9XHJcblxyXG4gIC8vIFVwZGF0ZSBwcmljZVxyXG4gIGlmIChjdXJyZW50U3RhdGUudG9rZW5QcmljZXMgJiYgY3VycmVudFN0YXRlLnRva2VuUHJpY2VzW3N5bWJvbF0pIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXByaWNlJykudGV4dENvbnRlbnQgPSBmb3JtYXRVU0QoY3VycmVudFN0YXRlLnRva2VuUHJpY2VzW3N5bWJvbF0pO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1wcmljZScpLnRleHRDb250ZW50ID0gJ+KAlCc7XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGUgbGlua3NcclxuICBjb25zdCBob21lTGluayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWhvbWUtbGluaycpO1xyXG4gIGlmICh0b2tlbkRhdGEuaG9tZVVybCkge1xyXG4gICAgaG9tZUxpbmsuaHJlZiA9IHRva2VuRGF0YS5ob21lVXJsO1xyXG4gICAgaG9tZUxpbmsuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGhvbWVMaW5rLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZGV4TGluayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWRleC1saW5rJyk7XHJcbiAgaWYgKHRva2VuRGF0YS5kZXhTY3JlZW5lclVybCkge1xyXG4gICAgZGV4TGluay5ocmVmID0gdG9rZW5EYXRhLmRleFNjcmVlbmVyVXJsO1xyXG4gICAgZGV4TGluay5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9IGVsc2Uge1xyXG4gICAgZGV4TGluay5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9XHJcblxyXG4gIC8vIFNvdXJjaWZ5IGxpbmtcclxuICBjb25zdCBjaGFpbklkID0gbmV0d29yayA9PT0gJ3B1bHNlY2hhaW4nID8gMzY5IDogbmV0d29yayA9PT0gJ3B1bHNlY2hhaW5UZXN0bmV0JyA/IDk0MyA6IDE7XHJcbiAgY29uc3Qgc291cmNpZnlMaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtc291cmNpZnktbGluaycpO1xyXG4gIHNvdXJjaWZ5TGluay5ocmVmID0gYGh0dHBzOi8vcmVwby5zb3VyY2lmeS5kZXYvJHtjaGFpbklkfS8ke3Rva2VuRGF0YS5hZGRyZXNzfWA7XHJcblxyXG4gIC8vIENvbnRyYWN0IGFkZHJlc3NcclxuICBjb25zdCBzaG9ydEFkZHJlc3MgPSBgJHt0b2tlbkRhdGEuYWRkcmVzcy5zbGljZSgwLCA2KX0uLi4ke3Rva2VuRGF0YS5hZGRyZXNzLnNsaWNlKC00KX1gO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWFkZHJlc3Mtc2hvcnQnKS50ZXh0Q29udGVudCA9IHNob3J0QWRkcmVzcztcclxuXHJcbiAgLy8gTWFuYWdlbWVudCBwYW5lbCAoc2hvdyBvbmx5IGZvciBkZWZhdWx0IHRva2VucylcclxuICBjb25zdCBtYW5hZ2VtZW50UGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1tYW5hZ2VtZW50LXBhbmVsJyk7XHJcbiAgaWYgKGlzRGVmYXVsdCkge1xyXG4gICAgbWFuYWdlbWVudFBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG5cclxuICAgIC8vIFNldCB0b2dnbGUgc3RhdGVcclxuICAgIGNvbnN0IGVuYWJsZVRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWVuYWJsZS10b2dnbGUnKTtcclxuICAgIGNvbnN0IGVuYWJsZUxhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtZW5hYmxlLWxhYmVsJyk7XHJcbiAgICBjb25zdCBlbmFibGVkVG9rZW5zID0gYXdhaXQgdG9rZW5zLmdldEVuYWJsZWREZWZhdWx0VG9rZW5zKG5ldHdvcmspO1xyXG4gICAgY29uc3QgaXNUb2tlbkVuYWJsZWQgPSBlbmFibGVkVG9rZW5zLmluY2x1ZGVzKHN5bWJvbCk7XHJcblxyXG4gICAgZW5hYmxlVG9nZ2xlLmNoZWNrZWQgPSBpc1Rva2VuRW5hYmxlZDtcclxuICAgIGVuYWJsZUxhYmVsLnRleHRDb250ZW50ID0gaXNUb2tlbkVuYWJsZWQgPyAnRW5hYmxlZCcgOiAnRGlzYWJsZWQnO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBtYW5hZ2VtZW50UGFuZWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfVxyXG5cclxuICAvLyBDbGVhciBzZW5kIGZvcm1cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1yZWNpcGllbnQnKS52YWx1ZSA9ICcnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWFtb3VudCcpLnZhbHVlID0gJyc7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtcGFzc3dvcmQnKS52YWx1ZSA9ICcnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXNlbmQtZXJyb3InKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gU2hvdyBzY3JlZW5cclxuICBzaG93U2NyZWVuKCdzY3JlZW4tdG9rZW4tZGV0YWlscycpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb3B5VG9rZW5EZXRhaWxzQWRkcmVzcygpIHtcclxuICBjb25zdCB0b2tlbkRhdGEgPSBjdXJyZW50U3RhdGUuY3VycmVudFRva2VuRGV0YWlscztcclxuICBpZiAoIXRva2VuRGF0YSkgcmV0dXJuO1xyXG5cclxuICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0b2tlbkRhdGEuYWRkcmVzcykudGhlbigoKSA9PiB7XHJcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1jb3B5LWFkZHJlc3MnKTtcclxuICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGJ0bi5pbm5lckhUTUw7XHJcbiAgICBidG4uaW5uZXJIVE1MID0gJzxzcGFuPuKckzwvc3Bhbj48c3Bhbj5Db3BpZWQhPC9zcGFuPic7XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgYnRuLmlubmVySFRNTCA9IG9yaWdpbmFsVGV4dDtcclxuICAgIH0sIDIwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUb2tlblNlbmRNYXgoKSB7XHJcbiAgY29uc3QgdG9rZW5EYXRhID0gY3VycmVudFN0YXRlLmN1cnJlbnRUb2tlbkRldGFpbHM7XHJcbiAgaWYgKCF0b2tlbkRhdGEpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBhd2FpdCBlcmMyMC5nZXRUb2tlbkJhbGFuY2UoY3VycmVudFN0YXRlLm5ldHdvcmssIHRva2VuRGF0YS5hZGRyZXNzLCBjdXJyZW50U3RhdGUuYWRkcmVzcyk7XHJcbiAgICBjb25zdCBiYWxhbmNlRm9ybWF0dGVkID0gZXJjMjAuZm9ybWF0VG9rZW5CYWxhbmNlKGJhbGFuY2VXZWksIHRva2VuRGF0YS5kZWNpbWFscywgMTgpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtYW1vdW50JykudmFsdWUgPSBiYWxhbmNlRm9ybWF0dGVkO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIG1heCBiYWxhbmNlOicsIGVycm9yKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRva2VuU2VuZCgpIHtcclxuICBjb25zdCB0b2tlbkRhdGEgPSBjdXJyZW50U3RhdGUuY3VycmVudFRva2VuRGV0YWlscztcclxuICBpZiAoIXRva2VuRGF0YSkgcmV0dXJuO1xyXG5cclxuICBjb25zdCByZWNpcGllbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1yZWNpcGllbnQnKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgYW1vdW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtYW1vdW50JykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtcGFzc3dvcmQnKS52YWx1ZTtcclxuICBjb25zdCBlcnJvckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtc2VuZC1lcnJvcicpO1xyXG5cclxuICAvLyBDbGVhciBwcmV2aW91cyBlcnJvcnNcclxuICBlcnJvckVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAvLyBWYWxpZGF0ZSBpbnB1dHNcclxuICBpZiAoIXJlY2lwaWVudCB8fCAhYW1vdW50IHx8ICFwYXNzd29yZCkge1xyXG4gICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdQbGVhc2UgZmlsbCBhbGwgZmllbGRzJztcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBpZiAoIXJlY2lwaWVudC5zdGFydHNXaXRoKCcweCcpIHx8IHJlY2lwaWVudC5sZW5ndGggIT09IDQyKSB7XHJcbiAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ0ludmFsaWQgcmVjaXBpZW50IGFkZHJlc3MnO1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhbW91bnRCTiA9IGV0aGVycy5wYXJzZVVuaXRzKGFtb3VudCwgdG9rZW5EYXRhLmRlY2ltYWxzKTtcclxuXHJcbiAgICAvLyBDaGVjayBiYWxhbmNlXHJcbiAgICBjb25zdCBiYWxhbmNlV2VpID0gYXdhaXQgZXJjMjAuZ2V0VG9rZW5CYWxhbmNlKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCB0b2tlbkRhdGEuYWRkcmVzcywgY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgaWYgKGFtb3VudEJOID4gYmFsYW5jZVdlaSkge1xyXG4gICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ0luc3VmZmljaWVudCBiYWxhbmNlJztcclxuICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIERlY3J5cHQgd2FsbGV0XHJcbiAgICBjb25zdCBlbmNyeXB0ZWRXYWxsZXQgPSBhd2FpdCBsb2FkKCdlbmNyeXB0ZWRfd2FsbGV0Jyk7XHJcbiAgICBpZiAoIWVuY3J5cHRlZFdhbGxldCkge1xyXG4gICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ1dhbGxldCBub3QgZm91bmQnO1xyXG4gICAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRlY3J5cHRlZFdhbGxldDtcclxuICAgIHRyeSB7XHJcbiAgICAgIGRlY3J5cHRlZFdhbGxldCA9IGF3YWl0IHdhbGxldC5kZWNyeXB0V2FsbGV0KGVuY3J5cHRlZFdhbGxldCwgcGFzc3dvcmQpO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSAnSW5jb3JyZWN0IHBhc3N3b3JkJztcclxuICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCB0aGUgY3VycmVudCB3YWxsZXQgaW5kZXhcclxuICAgIGNvbnN0IHdhbGxldEluZGV4ID0gY3VycmVudFN0YXRlLndhbGxldEluZGV4IHx8IDA7XHJcbiAgICBjb25zdCB3YWxsZXRJbnN0YW5jZSA9IGRlY3J5cHRlZFdhbGxldC53YWxsZXRzW3dhbGxldEluZGV4XTtcclxuXHJcbiAgICAvLyBDcmVhdGUgc2lnbmVyIHdpdGggYXV0b21hdGljIFJQQyBmYWlsb3ZlclxyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIoY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG4gICAgY29uc3Qgc2lnbmVyID0gbmV3IGV0aGVycy5XYWxsZXQod2FsbGV0SW5zdGFuY2UucHJpdmF0ZUtleSwgcHJvdmlkZXIpO1xyXG5cclxuICAgIC8vIFNlbmQgdG9rZW5cclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgZXJjMjAudHJhbnNmZXJUb2tlbihcclxuICAgICAgc2lnbmVyLFxyXG4gICAgICB0b2tlbkRhdGEuYWRkcmVzcyxcclxuICAgICAgcmVjaXBpZW50LFxyXG4gICAgICBhbW91bnRCTi50b1N0cmluZygpXHJcbiAgICApO1xyXG5cclxuICAgIC8vIFdhaXQgZm9yIHRyYW5zYWN0aW9uIHRvIGJlIHNlbnRcclxuICAgIGNvbnN0IHJlY2VpcHQgPSBhd2FpdCB0eC53YWl0KCk7XHJcblxyXG4gICAgLy8gQ2xlYXIgZm9ybVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtcmVjaXBpZW50JykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWFtb3VudCcpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1wYXNzd29yZCcpLnZhbHVlID0gJyc7XHJcblxyXG4gICAgLy8gU2hvdyBzdWNjZXNzIGFuZCBnbyBiYWNrXHJcbiAgICBhbGVydChgVHJhbnNhY3Rpb24gc2VudCFcXG5cXG5UeCBIYXNoOiAke3R4Lmhhc2h9YCk7XHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tdG9rZW5zJyk7XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzZW5kaW5nIHRva2VuOicsIGVycm9yKTtcclxuICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlIHx8ICdUcmFuc2FjdGlvbiBmYWlsZWQnO1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRva2VuRW5hYmxlVG9nZ2xlKGUpIHtcclxuICBjb25zdCB0b2tlbkRhdGEgPSBjdXJyZW50U3RhdGUuY3VycmVudFRva2VuRGV0YWlscztcclxuICBpZiAoIXRva2VuRGF0YSB8fCAhdG9rZW5EYXRhLmlzRGVmYXVsdCkgcmV0dXJuO1xyXG5cclxuICBjb25zdCBpc0VuYWJsZWQgPSBlLnRhcmdldC5jaGVja2VkO1xyXG4gIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtZW5hYmxlLWxhYmVsJyk7XHJcblxyXG4gIC8vIFVwZGF0ZSBsYWJlbFxyXG4gIGxhYmVsLnRleHRDb250ZW50ID0gaXNFbmFibGVkID8gJ0VuYWJsZWQnIDogJ0Rpc2FibGVkJztcclxuXHJcbiAgLy8gU2F2ZSB0byBzdG9yYWdlXHJcbiAgYXdhaXQgdG9rZW5zLnRvZ2dsZURlZmF1bHRUb2tlbihjdXJyZW50U3RhdGUubmV0d29yaywgdG9rZW5EYXRhLnN5bWJvbCwgaXNFbmFibGVkKTtcclxuXHJcbiAgLy8gTm90ZTogV2UgZG9uJ3QgcmUtcmVuZGVyIHRoZSB0b2tlbnMgc2NyZWVuIGhlcmUgdG8gYXZvaWQgbGVhdmluZyB0aGUgZGV0YWlscyBwYWdlXHJcbiAgLy8gVGhlIGNoYW5nZSB3aWxsIGJlIHJlZmxlY3RlZCB3aGVuIHRoZSB1c2VyIGdvZXMgYmFjayB0byB0aGUgdG9rZW5zIHNjcmVlblxyXG59XHJcblxyXG5mdW5jdGlvbiBzaG93QWRkVG9rZW5Nb2RhbCgpIHtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtdG9rZW4tYWRkcmVzcycpLnZhbHVlID0gJyc7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXByZXZpZXcnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkLXRva2VuLWVycm9yJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWFkZC10b2tlbicpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG59XHJcblxyXG5sZXQgdG9rZW5WYWxpZGF0aW9uVGltZW91dDtcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVG9rZW5BZGRyZXNzSW5wdXQoZSkge1xyXG4gIGNvbnN0IGFkZHJlc3MgPSBlLnRhcmdldC52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgcHJldmlld0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXByZXZpZXcnKTtcclxuICBjb25zdCBlcnJvckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZC10b2tlbi1lcnJvcicpO1xyXG5cclxuICAvLyBDbGVhciBwcmV2aW91cyB0aW1lb3V0XHJcbiAgaWYgKHRva2VuVmFsaWRhdGlvblRpbWVvdXQpIHtcclxuICAgIGNsZWFyVGltZW91dCh0b2tlblZhbGlkYXRpb25UaW1lb3V0KTtcclxuICB9XHJcblxyXG4gIC8vIEhpZGUgcHJldmlldyBhbmQgZXJyb3JcclxuICBwcmV2aWV3RWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgZXJyb3JFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gQmFzaWMgdmFsaWRhdGlvblxyXG4gIGlmICghYWRkcmVzcyB8fCBhZGRyZXNzLmxlbmd0aCAhPT0gNDIgfHwgIWFkZHJlc3Muc3RhcnRzV2l0aCgnMHgnKSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gRGVib3VuY2UgdGhlIHZhbGlkYXRpb25cclxuICB0b2tlblZhbGlkYXRpb25UaW1lb3V0ID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBuZXR3b3JrID0gY3VycmVudFN0YXRlLm5ldHdvcms7XHJcbiAgICAgIGNvbnN0IG1ldGFkYXRhID0gYXdhaXQgZXJjMjAuZ2V0VG9rZW5NZXRhZGF0YShuZXR3b3JrLCBhZGRyZXNzKTtcclxuXHJcbiAgICAgIC8vIFNob3cgcHJldmlld1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tcHJldmlldy1uYW1lJykudGV4dENvbnRlbnQgPSBtZXRhZGF0YS5uYW1lO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tcHJldmlldy1zeW1ib2wnKS50ZXh0Q29udGVudCA9IG1ldGFkYXRhLnN5bWJvbDtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXByZXZpZXctZGVjaW1hbHMnKS50ZXh0Q29udGVudCA9IG1ldGFkYXRhLmRlY2ltYWxzO1xyXG4gICAgICBwcmV2aWV3RWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ0ludmFsaWQgdG9rZW4gY29udHJhY3QnO1xyXG4gICAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgfVxyXG4gIH0sIDUwMCk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFkZEN1c3RvbVRva2VuKCkge1xyXG4gIGNvbnN0IGFkZHJlc3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtdG9rZW4tYWRkcmVzcycpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCBlcnJvckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZC10b2tlbi1lcnJvcicpO1xyXG5cclxuICBpZiAoIWFkZHJlc3MpIHtcclxuICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSAnUGxlYXNlIGVudGVyIGEgdG9rZW4gYWRkcmVzcyc7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBhd2FpdCB0b2tlbnMuYWRkQ3VzdG9tVG9rZW4oY3VycmVudFN0YXRlLm5ldHdvcmssIGFkZHJlc3MpO1xyXG5cclxuICAgIC8vIENsb3NlIG1vZGFsIGFuZCByZWZyZXNoIHNjcmVlblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWFkZC10b2tlbicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgYXdhaXQgcmVuZGVyVG9rZW5zU2NyZWVuKCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFNFVFRJTkdTID09PT09XHJcbmZ1bmN0aW9uIGxvYWRTZXR0aW5nc1RvVUkoKSB7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctYXV0b2xvY2snKS52YWx1ZSA9IGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5hdXRvTG9ja01pbnV0ZXM7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctZGVjaW1hbHMnKS52YWx1ZSA9IGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5kZWNpbWFsUGxhY2VzO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLXRoZW1lJykudmFsdWUgPSBjdXJyZW50U3RhdGUuc2V0dGluZ3MudGhlbWU7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctc2hvdy10ZXN0bmV0cycpLmNoZWNrZWQgPSBjdXJyZW50U3RhdGUuc2V0dGluZ3Muc2hvd1Rlc3ROZXR3b3JrcztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0dGluZy1tYXgtZ2FzLXByaWNlJykudmFsdWUgPSBjdXJyZW50U3RhdGUuc2V0dGluZ3MubWF4R2FzUHJpY2VHd2VpIHx8IDEwMDA7XHJcbn1cclxuXHJcbi8vIE5ldHdvcmsgU2V0dGluZ3NcclxuY29uc3QgTkVUV09SS19LRVlTID0gWydwdWxzZWNoYWluVGVzdG5ldCcsICdwdWxzZWNoYWluJywgJ2V0aGVyZXVtJywgJ3NlcG9saWEnXTtcclxuXHJcbmZ1bmN0aW9uIGxvYWROZXR3b3JrU2V0dGluZ3NUb1VJKCkge1xyXG4gIE5FVFdPUktfS0VZUy5mb3JFYWNoKG5ldHdvcmsgPT4ge1xyXG4gICAgLy8gTG9hZCBSUEMgZW5kcG9pbnRcclxuICAgIGNvbnN0IHJwY0lucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYHJwYy0ke25ldHdvcmt9YCk7XHJcbiAgICBpZiAocnBjSW5wdXQpIHtcclxuICAgICAgcnBjSW5wdXQudmFsdWUgPSBjdXJyZW50U3RhdGUubmV0d29ya1NldHRpbmdzPy5bbmV0d29ya10/LnJwYyB8fCAnJztcclxuICAgIH1cclxuXHJcbiAgICAvLyBMb2FkIEV4cGxvcmVyIHNldHRpbmdzXHJcbiAgICBjb25zdCBleHBsb3JlcklucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGV4cGxvcmVyLSR7bmV0d29ya31gKTtcclxuICAgIGlmIChleHBsb3JlcklucHV0KSB7XHJcbiAgICAgIGV4cGxvcmVySW5wdXQudmFsdWUgPSBjdXJyZW50U3RhdGUubmV0d29ya1NldHRpbmdzPy5bbmV0d29ya10/LmV4cGxvcmVyQmFzZSB8fCAnJztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0eFBhdGhJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBleHBsb3Jlci10eC0ke25ldHdvcmt9YCk7XHJcbiAgICBpZiAodHhQYXRoSW5wdXQpIHtcclxuICAgICAgdHhQYXRoSW5wdXQudmFsdWUgPSBjdXJyZW50U3RhdGUubmV0d29ya1NldHRpbmdzPy5bbmV0d29ya10/LmV4cGxvcmVyVHhQYXRoIHx8ICcnO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGFkZHJQYXRoSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgZXhwbG9yZXItYWRkci0ke25ldHdvcmt9YCk7XHJcbiAgICBpZiAoYWRkclBhdGhJbnB1dCkge1xyXG4gICAgICBhZGRyUGF0aElucHV0LnZhbHVlID0gY3VycmVudFN0YXRlLm5ldHdvcmtTZXR0aW5ncz8uW25ldHdvcmtdPy5leHBsb3JlckFkZHJQYXRoIHx8ICcnO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzYXZlTmV0d29ya1NldHRpbmdzKCkge1xyXG4gIGNvbnN0IG5ldHdvcmtTZXR0aW5ncyA9IHt9O1xyXG5cclxuICBORVRXT1JLX0tFWVMuZm9yRWFjaChuZXR3b3JrID0+IHtcclxuICAgIG5ldHdvcmtTZXR0aW5nc1tuZXR3b3JrXSA9IHtcclxuICAgICAgcnBjOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgcnBjLSR7bmV0d29ya31gKT8udmFsdWUgfHwgJycsXHJcbiAgICAgIGV4cGxvcmVyQmFzZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGV4cGxvcmVyLSR7bmV0d29ya31gKT8udmFsdWUgfHwgJycsXHJcbiAgICAgIGV4cGxvcmVyVHhQYXRoOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgZXhwbG9yZXItdHgtJHtuZXR3b3JrfWApPy52YWx1ZSB8fCAnJyxcclxuICAgICAgZXhwbG9yZXJBZGRyUGF0aDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGV4cGxvcmVyLWFkZHItJHtuZXR3b3JrfWApPy52YWx1ZSB8fCAnJ1xyXG4gICAgfTtcclxuICB9KTtcclxuXHJcbiAgYXdhaXQgc2F2ZSgnbmV0d29ya1NldHRpbmdzJywgbmV0d29ya1NldHRpbmdzKTtcclxuICBjdXJyZW50U3RhdGUubmV0d29ya1NldHRpbmdzID0gbmV0d29ya1NldHRpbmdzO1xyXG5cclxuICAvLyBVcGRhdGUgcnVudGltZSBzZXR0aW5nc1xyXG4gIGFwcGx5TmV0d29ya1NldHRpbmdzKCk7XHJcblxyXG4gIGFsZXJ0KCdOZXR3b3JrIHNldHRpbmdzIHNhdmVkISBDaGFuZ2VzIHdpbGwgdGFrZSBlZmZlY3Qgb24gbmV4dCByZWxvYWQuJyk7XHJcbiAgc2hvd1NjcmVlbignc2NyZWVuLXNldHRpbmdzJyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc2V0TmV0d29ya1NldHRpbmdzVG9EZWZhdWx0cygpIHtcclxuICBORVRXT1JLX0tFWVMuZm9yRWFjaChuZXR3b3JrID0+IHtcclxuICAgIC8vIFJlc2V0IHRvIGRlZmF1bHQgUlBDIGVuZHBvaW50cyBmcm9tIHJwYy5qc1xyXG4gICAgY29uc3QgZGVmYXVsdFJQQ3MgPSB7XHJcbiAgICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICdodHRwczovL3JwYy52NC50ZXN0bmV0LnB1bHNlY2hhaW4uY29tJyxcclxuICAgICAgJ3B1bHNlY2hhaW4nOiAnaHR0cHM6Ly9ycGMucHVsc2VjaGFpbi5jb20nLFxyXG4gICAgICAnZXRoZXJldW0nOiAnaHR0cHM6Ly9ldGgubGxhbWFycGMuY29tJyxcclxuICAgICAgJ3NlcG9saWEnOiAnaHR0cHM6Ly9ycGMuc2Vwb2xpYS5vcmcnXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGRlZmF1bHRFeHBsb3JlcnMgPSB7XHJcbiAgICAgICdwdWxzZWNoYWluVGVzdG5ldCc6IHtcclxuICAgICAgICBiYXNlOiAnaHR0cHM6Ly9zY2FuLnY0LnRlc3RuZXQucHVsc2VjaGFpbi5jb20nLFxyXG4gICAgICAgIHR4OiAnL3R4L3toYXNofScsXHJcbiAgICAgICAgYWRkcjogJy9hZGRyZXNzL3thZGRyZXNzfSdcclxuICAgICAgfSxcclxuICAgICAgJ3B1bHNlY2hhaW4nOiB7XHJcbiAgICAgICAgYmFzZTogJ2h0dHBzOi8vc2Nhbi5teXBpbmF0YS5jbG91ZC9pcGZzL2JhZnliZWllbnh5b3lyaG41dHN3Y2x2ZDNnZGp5NW10a2t3bXUzN2FxdG1sNm9uYmY3eG5iM28yMnBlLycsXHJcbiAgICAgICAgdHg6ICcjL3R4L3toYXNofScsXHJcbiAgICAgICAgYWRkcjogJyMvYWRkcmVzcy97YWRkcmVzc30nXHJcbiAgICAgIH0sXHJcbiAgICAgICdldGhlcmV1bSc6IHtcclxuICAgICAgICBiYXNlOiAnaHR0cHM6Ly9ldGhlcnNjYW4uaW8nLFxyXG4gICAgICAgIHR4OiAnL3R4L3toYXNofScsXHJcbiAgICAgICAgYWRkcjogJy9hZGRyZXNzL3thZGRyZXNzfSdcclxuICAgICAgfSxcclxuICAgICAgJ3NlcG9saWEnOiB7XHJcbiAgICAgICAgYmFzZTogJ2h0dHBzOi8vc2Vwb2xpYS5ldGhlcnNjYW4uaW8nLFxyXG4gICAgICAgIHR4OiAnL3R4L3toYXNofScsXHJcbiAgICAgICAgYWRkcjogJy9hZGRyZXNzL3thZGRyZXNzfSdcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgcnBjLSR7bmV0d29ya31gKS52YWx1ZSA9IGRlZmF1bHRSUENzW25ldHdvcmtdIHx8ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGV4cGxvcmVyLSR7bmV0d29ya31gKS52YWx1ZSA9IGRlZmF1bHRFeHBsb3JlcnNbbmV0d29ya10/LmJhc2UgfHwgJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgZXhwbG9yZXItdHgtJHtuZXR3b3JrfWApLnZhbHVlID0gZGVmYXVsdEV4cGxvcmVyc1tuZXR3b3JrXT8udHggfHwgJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgZXhwbG9yZXItYWRkci0ke25ldHdvcmt9YCkudmFsdWUgPSBkZWZhdWx0RXhwbG9yZXJzW25ldHdvcmtdPy5hZGRyIHx8ICcnO1xyXG4gIH0pO1xyXG5cclxuICBhbGVydCgnTmV0d29yayBzZXR0aW5ncyByZXNldCB0byBkZWZhdWx0cy4gQ2xpY2sgU0FWRSB0byBhcHBseS4nKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlOZXR3b3JrU2V0dGluZ3MoKSB7XHJcbiAgLy8gVGhpcyB3b3VsZCB1cGRhdGUgdGhlIHJ1bnRpbWUgUlBDIGFuZCBleHBsb3JlciBjb25maWdzXHJcbiAgLy8gRm9yIG5vdywgc2V0dGluZ3MgdGFrZSBlZmZlY3Qgb24gcmVsb2FkXHJcbn1cclxuXHJcbi8vID09PT09IFBBU1NXT1JEIFBST01QVCBNT0RBTCA9PT09PVxyXG5sZXQgcGFzc3dvcmRQcm9tcHRSZXNvbHZlID0gbnVsbDtcclxuXHJcbmZ1bmN0aW9uIHNob3dQYXNzd29yZFByb21wdCh0aXRsZSwgbWVzc2FnZSkge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgcGFzc3dvcmRQcm9tcHRSZXNvbHZlID0gcmVzb2x2ZTtcclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtcHJvbXB0LXRpdGxlJykudGV4dENvbnRlbnQgPSB0aXRsZTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1wcm9tcHQtbWVzc2FnZScpLnRleHRDb250ZW50ID0gbWVzc2FnZTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1wcm9tcHQtaW5wdXQnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1lcnJvcicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXBhc3N3b3JkLXByb21wdCcpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG5cclxuICAgIC8vIEZvY3VzIHRoZSBpbnB1dFxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1wcm9tcHQtaW5wdXQnKT8uZm9jdXMoKTtcclxuICAgIH0sIDEwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsb3NlUGFzc3dvcmRQcm9tcHQocGFzc3dvcmQgPSBudWxsKSB7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXBhc3N3b3JkLXByb21wdCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIGlmIChwYXNzd29yZFByb21wdFJlc29sdmUpIHtcclxuICAgIHBhc3N3b3JkUHJvbXB0UmVzb2x2ZShwYXNzd29yZCk7XHJcbiAgICBwYXNzd29yZFByb21wdFJlc29sdmUgPSBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gRElTUExBWSBTRUNSRVQgTU9EQUwgPT09PT1cclxuZnVuY3Rpb24gc2hvd1NlY3JldE1vZGFsKHRpdGxlLCBzZWNyZXQpIHtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGlzcGxheS1zZWNyZXQtdGl0bGUnKS50ZXh0Q29udGVudCA9IHRpdGxlO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXNwbGF5LXNlY3JldC1jb250ZW50JykudGV4dENvbnRlbnQgPSBzZWNyZXQ7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWRpc3BsYXktc2VjcmV0JykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsb3NlU2VjcmV0TW9kYWwoKSB7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWRpc3BsYXktc2VjcmV0JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpc3BsYXktc2VjcmV0LWNvbnRlbnQnKS50ZXh0Q29udGVudCA9ICcnO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVWaWV3U2VlZCgpIHtcclxuICBjb25zdCBwYXNzd29yZCA9IGF3YWl0IHNob3dQYXNzd29yZFByb21wdCgnVmlldyBTZWVkIFBocmFzZScsICdFbnRlciB5b3VyIHBhc3N3b3JkIHRvIHZpZXcgeW91ciBzZWVkIHBocmFzZScpO1xyXG4gIGlmICghcGFzc3dvcmQpIHJldHVybjtcclxuXHJcbiAgY29uc3QgZXJyb3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtcHJvbXB0LWVycm9yJyk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBtbmVtb25pYyA9IGF3YWl0IGV4cG9ydE1uZW1vbmljKHBhc3N3b3JkKTtcclxuICAgIGNsb3NlUGFzc3dvcmRQcm9tcHQoKTtcclxuXHJcbiAgICBpZiAobW5lbW9uaWMpIHtcclxuICAgICAgc2hvd1NlY3JldE1vZGFsKCdZb3VyIFNlZWQgUGhyYXNlJywgbW5lbW9uaWMpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWxlcnQoJ1RoaXMgd2FsbGV0IHdhcyBpbXBvcnRlZCB1c2luZyBhIHByaXZhdGUga2V5IGFuZCBoYXMgbm8gc2VlZCBwaHJhc2UuJyk7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlRXhwb3J0S2V5KCkge1xyXG4gIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgc2hvd1Bhc3N3b3JkUHJvbXB0KCdFeHBvcnQgUHJpdmF0ZSBLZXknLCAnRW50ZXIgeW91ciBwYXNzd29yZCB0byBleHBvcnQgeW91ciBwcml2YXRlIGtleScpO1xyXG4gIGlmICghcGFzc3dvcmQpIHJldHVybjtcclxuXHJcbiAgY29uc3QgZXJyb3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtcHJvbXB0LWVycm9yJyk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwcml2YXRlS2V5ID0gYXdhaXQgZXhwb3J0UHJpdmF0ZUtleShwYXNzd29yZCk7XHJcbiAgICBjbG9zZVBhc3N3b3JkUHJvbXB0KCk7XHJcbiAgICBzaG93U2VjcmV0TW9kYWwoJ1lvdXIgUHJpdmF0ZSBLZXknLCBwcml2YXRlS2V5KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuLy8gPT09PT0gTVVMVEktV0FMTEVUIE1BTkFHRU1FTlQgPT09PT1cclxubGV0IGN1cnJlbnRSZW5hbWVXYWxsZXRJZCA9IG51bGw7XHJcbmxldCBnZW5lcmF0ZWRNbmVtb25pY011bHRpID0gbnVsbDtcclxubGV0IHZlcmlmaWNhdGlvbldvcmRzTXVsdGkgPSBbXTsgLy8gQXJyYXkgb2Yge2luZGV4LCB3b3JkfSBmb3IgdmVyaWZpY2F0aW9uXHJcblxyXG4vLyBSZW5kZXIgd2FsbGV0IGxpc3QgaW4gbWFuYWdlIHdhbGxldHMgc2NyZWVuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlbmRlcldhbGxldExpc3QoKSB7XHJcbiAgY29uc3Qgd2FsbGV0c0RhdGEgPSBhd2FpdCBnZXRBbGxXYWxsZXRzKCk7XHJcbiAgY29uc3Qgd2FsbGV0TGlzdERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3YWxsZXQtbGlzdCcpO1xyXG4gIGNvbnN0IHdhbGxldENvdW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhbGxldC1jb3VudCcpO1xyXG5cclxuICB3YWxsZXRDb3VudC50ZXh0Q29udGVudCA9IHdhbGxldHNEYXRhLndhbGxldExpc3QubGVuZ3RoO1xyXG5cclxuICBpZiAod2FsbGV0c0RhdGEud2FsbGV0TGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgIHdhbGxldExpc3REaXYuaW5uZXJIVE1MID0gJzxwIGNsYXNzPVwidGV4dC1kaW0gdGV4dC1jZW50ZXJcIj5ObyB3YWxsZXRzIGZvdW5kPC9wPic7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB3YWxsZXRMaXN0RGl2LmlubmVySFRNTCA9ICcnO1xyXG5cclxuICB3YWxsZXRzRGF0YS53YWxsZXRMaXN0LmZvckVhY2god2FsbGV0ID0+IHtcclxuICAgIGNvbnN0IGlzQWN0aXZlID0gd2FsbGV0LmlkID09PSB3YWxsZXRzRGF0YS5hY3RpdmVXYWxsZXRJZDtcclxuICAgIGNvbnN0IHdhbGxldENhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIHdhbGxldENhcmQuY2xhc3NOYW1lID0gJ3BhbmVsIG1iLTInO1xyXG4gICAgaWYgKGlzQWN0aXZlKSB7XHJcbiAgICAgIHdhbGxldENhcmQuc3R5bGUuYm9yZGVyQ29sb3IgPSAndmFyKC0tdGVybWluYWwtc3VjY2VzcyknO1xyXG4gICAgICB3YWxsZXRDYXJkLnN0eWxlLmJvcmRlcldpZHRoID0gJzJweCc7XHJcbiAgICB9XHJcblxyXG4gICAgd2FsbGV0Q2FyZC5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0OyBtYXJnaW4tYm90dG9tOiAxMnB4O1wiPlxyXG4gICAgICAgIDxkaXYgc3R5bGU9XCJmbGV4OiAxO1wiPlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtd2VpZ2h0OiBib2xkOyBmb250LXNpemU6IDE0cHg7IG1hcmdpbi1ib3R0b206IDRweDtcIj5cclxuICAgICAgICAgICAgJHtpc0FjdGl2ZSA/ICfinJMgJyA6ICcnfSR7ZXNjYXBlSHRtbCh3YWxsZXQubmlja25hbWUgfHwgJ1VubmFtZWQgV2FsbGV0Jyl9XHJcbiAgICAgICAgICAgICR7aXNBY3RpdmUgPyAnPHNwYW4gY2xhc3M9XCJ0ZXh0LXN1Y2Nlc3NcIiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDsgbWFyZ2luLWxlZnQ6IDhweDtcIj5bQUNUSVZFXTwvc3Bhbj4nIDogJyd9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBmb250LWZhbWlseTogdmFyKC0tZm9udC1tb25vKTsgd29yZC1icmVhazogYnJlYWstYWxsO1wiPlxyXG4gICAgICAgICAgICAke2VzY2FwZUh0bWwod2FsbGV0LmFkZHJlc3MgfHwgJ0FkZHJlc3Mgbm90IGxvYWRlZCcpfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTBweDsgbWFyZ2luLXRvcDogNHB4O1wiPlxyXG4gICAgICAgICAgICAke3dhbGxldC5pbXBvcnRNZXRob2QgPT09ICdjcmVhdGUnID8gJ0NyZWF0ZWQnIDogJ0ltcG9ydGVkJ30g4oCiICR7bmV3IERhdGUod2FsbGV0LmNyZWF0ZWRBdCkudG9Mb2NhbGVEYXRlU3RyaW5nKCl9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJidXR0b24tZ3JvdXBcIiBzdHlsZT1cImdhcDogNnB4O1wiPlxyXG4gICAgICAgICR7IWlzQWN0aXZlID8gYDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXNtYWxsXCIgZGF0YS13YWxsZXQtaWQ9XCIke3dhbGxldC5pZH1cIiBkYXRhLWFjdGlvbj1cInN3aXRjaFwiPlNXSVRDSDwvYnV0dG9uPmAgOiAnJ31cclxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1zbWFsbFwiIGRhdGEtd2FsbGV0LWlkPVwiJHt3YWxsZXQuaWR9XCIgZGF0YS1hY3Rpb249XCJyZW5hbWVcIj5SRU5BTUU8L2J1dHRvbj5cclxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1zbWFsbFwiIGRhdGEtd2FsbGV0LWlkPVwiJHt3YWxsZXQuaWR9XCIgZGF0YS1hY3Rpb249XCJleHBvcnRcIj5FWFBPUlQ8L2J1dHRvbj5cclxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgYnRuLXNtYWxsXCIgZGF0YS13YWxsZXQtaWQ9XCIke3dhbGxldC5pZH1cIiBkYXRhLWFjdGlvbj1cImRlbGV0ZVwiPkRFTEVURTwvYnV0dG9uPlxyXG4gICAgICA8L2Rpdj5cclxuICAgIGA7XHJcblxyXG4gICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgYnV0dG9uc1xyXG4gICAgY29uc3QgYnV0dG9ucyA9IHdhbGxldENhcmQucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJyk7XHJcbiAgICBidXR0b25zLmZvckVhY2goYnRuID0+IHtcclxuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHdhbGxldElkID0gYnRuLmRhdGFzZXQud2FsbGV0SWQ7XHJcbiAgICAgICAgY29uc3QgYWN0aW9uID0gYnRuLmRhdGFzZXQuYWN0aW9uO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xyXG4gICAgICAgICAgY2FzZSAnc3dpdGNoJzpcclxuICAgICAgICAgICAgYXdhaXQgaGFuZGxlU3dpdGNoV2FsbGV0KHdhbGxldElkKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdyZW5hbWUnOlxyXG4gICAgICAgICAgICBoYW5kbGVSZW5hbWVXYWxsZXRQcm9tcHQod2FsbGV0SWQsIHdhbGxldC5uaWNrbmFtZSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnZXhwb3J0JzpcclxuICAgICAgICAgICAgYXdhaXQgaGFuZGxlRXhwb3J0Rm9yV2FsbGV0KHdhbGxldElkKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdkZWxldGUnOlxyXG4gICAgICAgICAgICBhd2FpdCBoYW5kbGVEZWxldGVXYWxsZXRNdWx0aSh3YWxsZXRJZCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB3YWxsZXRMaXN0RGl2LmFwcGVuZENoaWxkKHdhbGxldENhcmQpO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBOYXZpZ2F0ZSB0byBtYW5hZ2Ugd2FsbGV0cyBzY3JlZW5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWFuYWdlV2FsbGV0cygpIHtcclxuICBhd2FpdCByZW5kZXJXYWxsZXRMaXN0KCk7XHJcbiAgc2hvd1NjcmVlbignc2NyZWVuLW1hbmFnZS13YWxsZXRzJyk7XHJcbn1cclxuXHJcbi8vIFNob3cgYWRkIHdhbGxldCBtb2RhbCAod2l0aCAzIG9wdGlvbnMpXHJcbmZ1bmN0aW9uIHNob3dBZGRXYWxsZXRNb2RhbCgpIHtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYWRkLXdhbGxldCcpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG59XHJcblxyXG4vLyBHZW5lcmF0ZSBtbmVtb25pYyBmb3IgbXVsdGktd2FsbGV0IGNyZWF0aW9uXHJcbmFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlTmV3TW5lbW9uaWNNdWx0aSgpIHtcclxuICBjb25zdCB7IGV0aGVycyB9ID0gYXdhaXQgaW1wb3J0KCdldGhlcnMnKTtcclxuICBjb25zdCByYW5kb21XYWxsZXQgPSBldGhlcnMuV2FsbGV0LmNyZWF0ZVJhbmRvbSgpO1xyXG4gIGdlbmVyYXRlZE1uZW1vbmljTXVsdGkgPSByYW5kb21XYWxsZXQubW5lbW9uaWMucGhyYXNlO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtdWx0aS1tbmVtb25pYy1kaXNwbGF5JykudGV4dENvbnRlbnQgPSBnZW5lcmF0ZWRNbmVtb25pY011bHRpO1xyXG5cclxuICAvLyBTZXQgdXAgdmVyaWZpY2F0aW9uIChhc2sgZm9yIDMgcmFuZG9tIHdvcmRzIHVzaW5nIGNyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSByYW5kb20pXHJcbiAgY29uc3Qgd29yZHMgPSBnZW5lcmF0ZWRNbmVtb25pY011bHRpLnNwbGl0KCcgJyk7XHJcbiAgY29uc3QgcmFuZG9tQnl0ZXMgPSBuZXcgVWludDhBcnJheSgzKTtcclxuICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKHJhbmRvbUJ5dGVzKTtcclxuICBjb25zdCBpbmRpY2VzID0gW1xyXG4gICAgcmFuZG9tQnl0ZXNbMF0gJSA0LCAvLyBXb3JkIDEtNFxyXG4gICAgNCArIChyYW5kb21CeXRlc1sxXSAlIDQpLCAvLyBXb3JkIDUtOFxyXG4gICAgOCArIChyYW5kb21CeXRlc1syXSAlIDQpIC8vIFdvcmQgOS0xMlxyXG4gIF07XHJcblxyXG4gIHZlcmlmaWNhdGlvbldvcmRzTXVsdGkgPSBpbmRpY2VzLm1hcChpID0+ICh7IGluZGV4OiBpLCB3b3JkOiB3b3Jkc1tpXSB9KSk7XHJcblxyXG4gIC8vIFVwZGF0ZSBVSSB3aXRoIHJhbmRvbSBpbmRpY2VzXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTEtbnVtLW11bHRpJykudGV4dENvbnRlbnQgPSAodmVyaWZpY2F0aW9uV29yZHNNdWx0aVswXS5pbmRleCArIDEpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0yLW51bS1tdWx0aScpLnRleHRDb250ZW50ID0gKHZlcmlmaWNhdGlvbldvcmRzTXVsdGlbMV0uaW5kZXggKyAxKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMy1udW0tbXVsdGknKS50ZXh0Q29udGVudCA9ICh2ZXJpZmljYXRpb25Xb3Jkc011bHRpWzJdLmluZGV4ICsgMSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBjcmVhdGUgbmV3IHdhbGxldCAobXVsdGkpXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNyZWF0ZU5ld1dhbGxldE11bHRpKCkge1xyXG4gIGNvbnN0IG5pY2tuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LW5ldy13YWxsZXQtbmlja25hbWUnKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgdmVyaWZpY2F0aW9uRXJyb3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZpY2F0aW9uLWVycm9yLW11bHRpJyk7XHJcblxyXG4gIC8vIFZlcmlmeSBzZWVkIHBocmFzZSB3b3Jkc1xyXG4gIGNvbnN0IHdvcmQxID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTEtbXVsdGknKS52YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICBjb25zdCB3b3JkMiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0yLW11bHRpJykudmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3Qgd29yZDMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMy1tdWx0aScpLnZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICBpZiAoIXdvcmQxIHx8ICF3b3JkMiB8fCAhd29yZDMpIHtcclxuICAgIHZlcmlmaWNhdGlvbkVycm9yRGl2LnRleHRDb250ZW50ID0gJ1BsZWFzZSBlbnRlciBhbGwgdmVyaWZpY2F0aW9uIHdvcmRzIHRvIGNvbmZpcm0geW91IGhhdmUgYmFja2VkIHVwIHlvdXIgc2VlZCBwaHJhc2UuJztcclxuICAgIHZlcmlmaWNhdGlvbkVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaWYgKHdvcmQxICE9PSB2ZXJpZmljYXRpb25Xb3Jkc011bHRpWzBdLndvcmQudG9Mb3dlckNhc2UoKSB8fFxyXG4gICAgICB3b3JkMiAhPT0gdmVyaWZpY2F0aW9uV29yZHNNdWx0aVsxXS53b3JkLnRvTG93ZXJDYXNlKCkgfHxcclxuICAgICAgd29yZDMgIT09IHZlcmlmaWNhdGlvbldvcmRzTXVsdGlbMl0ud29yZC50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICB2ZXJpZmljYXRpb25FcnJvckRpdi50ZXh0Q29udGVudCA9ICdWZXJpZmljYXRpb24gd29yZHMgZG8gbm90IG1hdGNoLiBQbGVhc2UgZG91YmxlLWNoZWNrIHlvdXIgc2VlZCBwaHJhc2UgYmFja3VwLic7XHJcbiAgICB2ZXJpZmljYXRpb25FcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIENsZWFyIHZlcmlmaWNhdGlvbiBlcnJvclxyXG4gIHZlcmlmaWNhdGlvbkVycm9yRGl2LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAvLyBDbG9zZSBtb2RhbCBCRUZPUkUgc2hvd2luZyBwYXNzd29yZCBwcm9tcHRcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtY3JlYXRlLXdhbGxldC1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICBjb25zdCBwYXNzd29yZCA9IGF3YWl0IHNob3dQYXNzd29yZFByb21wdCgnRW50ZXIgWW91ciBQYXNzd29yZCcsICdFbnRlciB5b3VyIHdhbGxldCBwYXNzd29yZCB0byBlbmNyeXB0IHRoZSBuZXcgd2FsbGV0Jyk7XHJcblxyXG4gIGlmICghcGFzc3dvcmQpIHtcclxuICAgIC8vIElmIGNhbmNlbGxlZCwgcmVvcGVuIHRoZSBtb2RhbFxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWNyZWF0ZS13YWxsZXQtbXVsdGknKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBhZGRXYWxsZXQoJ2NyZWF0ZScsIHt9LCBwYXNzd29yZCwgbmlja25hbWUgfHwgbnVsbCk7XHJcblxyXG4gICAgLy8gQ2xlYXIgZm9ybVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LW5ldy13YWxsZXQtbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTEtbXVsdGknKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTItbXVsdGknKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTMtbXVsdGknKS52YWx1ZSA9ICcnO1xyXG4gICAgZ2VuZXJhdGVkTW5lbW9uaWNNdWx0aSA9IG51bGw7XHJcbiAgICB2ZXJpZmljYXRpb25Xb3Jkc011bHRpID0gW107XHJcblxyXG4gICAgLy8gUmVmcmVzaCB3YWxsZXQgbGlzdFxyXG4gICAgYXdhaXQgcmVuZGVyV2FsbGV0TGlzdCgpO1xyXG5cclxuICAgIGFsZXJ0KCdXYWxsZXQgY3JlYXRlZCBzdWNjZXNzZnVsbHkhJyk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGFsZXJ0KCdFcnJvciBjcmVhdGluZyB3YWxsZXQ6ICcgKyBlcnJvci5tZXNzYWdlKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBpbXBvcnQgZnJvbSBzZWVkIChtdWx0aSlcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlSW1wb3J0U2VlZE11bHRpKCkge1xyXG4gIGNvbnN0IG5pY2tuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1zZWVkLW5pY2tuYW1lJykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IG1uZW1vbmljID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1zZWVkLXBocmFzZScpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCBlcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbXBvcnQtc2VlZC1lcnJvci1tdWx0aScpO1xyXG5cclxuICBlcnJvckRpdi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgaWYgKCFtbmVtb25pYykge1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSAnUGxlYXNlIGVudGVyIGEgc2VlZCBwaHJhc2UnO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBDbG9zZSBtb2RhbCBCRUZPUkUgc2hvd2luZyBwYXNzd29yZCBwcm9tcHRcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LXNlZWQtbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ0VudGVyIFlvdXIgUGFzc3dvcmQnLCAnRW50ZXIgeW91ciB3YWxsZXQgcGFzc3dvcmQgdG8gZW5jcnlwdCB0aGUgaW1wb3J0ZWQgd2FsbGV0Jyk7XHJcblxyXG4gIGlmICghcGFzc3dvcmQpIHtcclxuICAgIC8vIElmIGNhbmNlbGxlZCwgcmVvcGVuIHRoZSBtb2RhbFxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1zZWVkLW11bHRpJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgYXdhaXQgYWRkV2FsbGV0KCdtbmVtb25pYycsIHsgbW5lbW9uaWMgfSwgcGFzc3dvcmQsIG5pY2tuYW1lIHx8IG51bGwpO1xyXG5cclxuICAgIC8vIENsZWFyIGZvcm1cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtc2VlZC1uaWNrbmFtZScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXNlZWQtcGhyYXNlJykudmFsdWUgPSAnJztcclxuXHJcbiAgICAvLyBSZWZyZXNoIHdhbGxldCBsaXN0XHJcbiAgICBhd2FpdCByZW5kZXJXYWxsZXRMaXN0KCk7XHJcblxyXG4gICAgYWxlcnQoJ1dhbGxldCBpbXBvcnRlZCBzdWNjZXNzZnVsbHkhJyk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIC8vIFNob3cgZXJyb3IgYW5kIHJlb3BlbiBtb2RhbFxyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LXNlZWQtbXVsdGknKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBpbXBvcnQgZnJvbSBwcml2YXRlIGtleSAobXVsdGkpXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUltcG9ydEtleU11bHRpKCkge1xyXG4gIGNvbnN0IG5pY2tuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1rZXktbmlja25hbWUnKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgcHJpdmF0ZUtleSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtcHJpdmF0ZS1rZXknKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgZXJyb3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1wb3J0LWtleS1lcnJvci1tdWx0aScpO1xyXG5cclxuICBlcnJvckRpdi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgaWYgKCFwcml2YXRlS2V5KSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9ICdQbGVhc2UgZW50ZXIgYSBwcml2YXRlIGtleSc7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIENsb3NlIG1vZGFsIEJFRk9SRSBzaG93aW5nIHBhc3N3b3JkIHByb21wdFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1pbXBvcnQta2V5LW11bHRpJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgc2hvd1Bhc3N3b3JkUHJvbXB0KCdFbnRlciBZb3VyIFBhc3N3b3JkJywgJ0VudGVyIHlvdXIgd2FsbGV0IHBhc3N3b3JkIHRvIGVuY3J5cHQgdGhlIGltcG9ydGVkIHdhbGxldCcpO1xyXG5cclxuICBpZiAoIXBhc3N3b3JkKSB7XHJcbiAgICAvLyBJZiBjYW5jZWxsZWQsIHJlb3BlbiB0aGUgbW9kYWxcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1pbXBvcnQta2V5LW11bHRpJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgYXdhaXQgYWRkV2FsbGV0KCdwcml2YXRla2V5JywgeyBwcml2YXRlS2V5IH0sIHBhc3N3b3JkLCBuaWNrbmFtZSB8fCBudWxsKTtcclxuXHJcbiAgICAvLyBDbGVhciBmb3JtXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LWtleS1uaWNrbmFtZScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXByaXZhdGUta2V5JykudmFsdWUgPSAnJztcclxuXHJcbiAgICAvLyBSZWZyZXNoIHdhbGxldCBsaXN0XHJcbiAgICBhd2FpdCByZW5kZXJXYWxsZXRMaXN0KCk7XHJcblxyXG4gICAgYWxlcnQoJ1dhbGxldCBpbXBvcnRlZCBzdWNjZXNzZnVsbHkhJyk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIC8vIFNob3cgZXJyb3IgYW5kIHJlb3BlbiBtb2RhbFxyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LWtleS1tdWx0aScpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gU3dpdGNoIHRvIGEgZGlmZmVyZW50IHdhbGxldFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTd2l0Y2hXYWxsZXQod2FsbGV0SWQpIHtcclxuICB0cnkge1xyXG4gICAgYXdhaXQgc2V0QWN0aXZlV2FsbGV0KHdhbGxldElkKTtcclxuXHJcbiAgICAvLyBSZWZyZXNoIHdhbGxldCBsaXN0IHRvIHNob3cgbmV3IGFjdGl2ZSB3YWxsZXRcclxuICAgIGF3YWl0IHJlbmRlcldhbGxldExpc3QoKTtcclxuXHJcbiAgICAvLyBJZiB3ZSdyZSB1bmxvY2tlZCwgdXBkYXRlIHRoZSBkYXNoYm9hcmRcclxuICAgIGlmIChjdXJyZW50U3RhdGUuaXNVbmxvY2tlZCkge1xyXG4gICAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgICAgY3VycmVudFN0YXRlLmFkZHJlc3MgPSB3YWxsZXQuYWRkcmVzcztcclxuICAgICAgdXBkYXRlRGFzaGJvYXJkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYWxlcnQoJ1N3aXRjaGVkIHRvIHdhbGxldCBzdWNjZXNzZnVsbHkhJyk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGFsZXJ0KCdFcnJvciBzd2l0Y2hpbmcgd2FsbGV0OiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBTaG93IHJlbmFtZSB3YWxsZXQgcHJvbXB0XHJcbmZ1bmN0aW9uIGhhbmRsZVJlbmFtZVdhbGxldFByb21wdCh3YWxsZXRJZCwgY3VycmVudE5pY2tuYW1lKSB7XHJcbiAgY3VycmVudFJlbmFtZVdhbGxldElkID0gd2FsbGV0SWQ7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LXJlbmFtZS13YWxsZXQtbmlja25hbWUnKS52YWx1ZSA9IGN1cnJlbnROaWNrbmFtZSB8fCAnJztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtcmVuYW1lLXdhbGxldCcpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG59XHJcblxyXG4vLyBDb25maXJtIHJlbmFtZSB3YWxsZXRcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmVuYW1lV2FsbGV0Q29uZmlybSgpIHtcclxuICBjb25zdCBuZXdOaWNrbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1yZW5hbWUtd2FsbGV0LW5pY2tuYW1lJykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IGVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlbmFtZS1lcnJvcicpO1xyXG5cclxuICBlcnJvckRpdi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgaWYgKCFuZXdOaWNrbmFtZSkge1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSAnTmlja25hbWUgY2Fubm90IGJlIGVtcHR5JztcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IHJlbmFtZVdhbGxldChjdXJyZW50UmVuYW1lV2FsbGV0SWQsIG5ld05pY2tuYW1lKTtcclxuXHJcbiAgICAvLyBDbG9zZSBtb2RhbFxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXJlbmFtZS13YWxsZXQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGN1cnJlbnRSZW5hbWVXYWxsZXRJZCA9IG51bGw7XHJcblxyXG4gICAgLy8gUmVmcmVzaCB3YWxsZXQgbGlzdFxyXG4gICAgYXdhaXQgcmVuZGVyV2FsbGV0TGlzdCgpO1xyXG5cclxuICAgIGFsZXJ0KCdXYWxsZXQgcmVuYW1lZCBzdWNjZXNzZnVsbHkhJyk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gRGVsZXRlIGEgc3BlY2lmaWMgd2FsbGV0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZURlbGV0ZVdhbGxldE11bHRpKHdhbGxldElkKSB7XHJcbiAgY29uc3QgY29uZmlybWVkID0gY29uZmlybShcclxuICAgICfimqDvuI8gV0FSTklORyDimqDvuI9cXG5cXG4nICtcclxuICAgICdZb3UgYXJlIGFib3V0IHRvIERFTEVURSB0aGlzIHdhbGxldCFcXG5cXG4nICtcclxuICAgICdUaGlzIGFjdGlvbiBpcyBQRVJNQU5FTlQgYW5kIENBTk5PVCBiZSB1bmRvbmUuXFxuXFxuJyArXHJcbiAgICAnTWFrZSBzdXJlIHlvdSBoYXZlIHdyaXR0ZW4gZG93biB5b3VyIHNlZWQgcGhyYXNlIG9yIHByaXZhdGUga2V5LlxcblxcbicgK1xyXG4gICAgJ0RvIHlvdSB3YW50IHRvIGNvbnRpbnVlPydcclxuICApO1xyXG5cclxuICBpZiAoIWNvbmZpcm1lZCkgcmV0dXJuO1xyXG5cclxuICBjb25zdCBwYXNzd29yZCA9IGF3YWl0IHNob3dQYXNzd29yZFByb21wdCgnRGVsZXRlIFdhbGxldCcsICdFbnRlciB5b3VyIHBhc3N3b3JkIHRvIGRlbGV0ZSB0aGlzIHdhbGxldCcpO1xyXG5cclxuICBpZiAoIXBhc3N3b3JkKSByZXR1cm47XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBkZWxldGVXYWxsZXQod2FsbGV0SWQsIHBhc3N3b3JkKTtcclxuICAgIGNsb3NlUGFzc3dvcmRQcm9tcHQoKTtcclxuXHJcbiAgICAvLyBSZWZyZXNoIHdhbGxldCBsaXN0XHJcbiAgICBhd2FpdCByZW5kZXJXYWxsZXRMaXN0KCk7XHJcblxyXG4gICAgLy8gSWYgd2UgZGVsZXRlZCBhbGwgd2FsbGV0cywgZ28gYmFjayB0byBzZXR1cFxyXG4gICAgY29uc3Qgd2FsbGV0c0RhdGEgPSBhd2FpdCBnZXRBbGxXYWxsZXRzKCk7XHJcbiAgICBpZiAod2FsbGV0c0RhdGEud2FsbGV0TGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgY3VycmVudFN0YXRlLmlzVW5sb2NrZWQgPSBmYWxzZTtcclxuICAgICAgY3VycmVudFN0YXRlLmFkZHJlc3MgPSBudWxsO1xyXG4gICAgICBzaG93U2NyZWVuKCdzY3JlZW4tc2V0dXAnKTtcclxuICAgIH1cclxuXHJcbiAgICBhbGVydCgnV2FsbGV0IGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5IScpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBhbGVydCgnRXJyb3IgZGVsZXRpbmcgd2FsbGV0OiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBFeHBvcnQgc2VlZC9rZXkgZm9yIGEgc3BlY2lmaWMgd2FsbGV0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUV4cG9ydEZvcldhbGxldCh3YWxsZXRJZCkge1xyXG4gIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgc2hvd1Bhc3N3b3JkUHJvbXB0KCdFeHBvcnQgV2FsbGV0JywgJ0VudGVyIHlvdXIgcGFzc3dvcmQgdG8gZXhwb3J0IHdhbGxldCBzZWNyZXRzJyk7XHJcblxyXG4gIGlmICghcGFzc3dvcmQpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFRyeSB0byBnZXQgbW5lbW9uaWMgZmlyc3RcclxuICAgIGNvbnN0IG1uZW1vbmljID0gYXdhaXQgZXhwb3J0TW5lbW9uaWNGb3JXYWxsZXQod2FsbGV0SWQsIHBhc3N3b3JkKTtcclxuXHJcbiAgICBpZiAobW5lbW9uaWMpIHtcclxuICAgICAgc2hvd1NlY3JldE1vZGFsKCdTZWVkIFBocmFzZScsIG1uZW1vbmljKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIE5vIG1uZW1vbmljLCBzaG93IHByaXZhdGUga2V5XHJcbiAgICAgIGNvbnN0IHByaXZhdGVLZXkgPSBhd2FpdCBleHBvcnRQcml2YXRlS2V5Rm9yV2FsbGV0KHdhbGxldElkLCBwYXNzd29yZCk7XHJcbiAgICAgIHNob3dTZWNyZXRNb2RhbCgnUHJpdmF0ZSBLZXknLCBwcml2YXRlS2V5KTtcclxuICAgIH1cclxuXHJcbiAgICBjbG9zZVBhc3N3b3JkUHJvbXB0KCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGFsZXJ0KCdFcnJvciBleHBvcnRpbmcgd2FsbGV0OiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBDT05ORUNUSU9OIEFQUFJPVkFMID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNvbm5lY3Rpb25BcHByb3ZhbFNjcmVlbihvcmlnaW4sIHJlcXVlc3RJZCkge1xyXG4gIC8vIExvYWQgc2V0dGluZ3MgZm9yIHRoZW1lXHJcbiAgYXdhaXQgbG9hZFNldHRpbmdzKCk7XHJcbiAgYXBwbHlUaGVtZSgpO1xyXG5cclxuICAvLyBEaXNwbGF5IHRoZSBvcmlnaW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29ubmVjdGlvbi1zaXRlLW9yaWdpbicpLnRleHRDb250ZW50ID0gb3JpZ2luO1xyXG5cclxuICAvLyBHZXQgYWN0aXZlIHdhbGxldCBhZGRyZXNzXHJcbiAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgaWYgKHdhbGxldCAmJiB3YWxsZXQuYWRkcmVzcykge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nvbm5lY3Rpb24td2FsbGV0LWFkZHJlc3MnKS50ZXh0Q29udGVudCA9IHdhbGxldC5hZGRyZXNzO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29ubmVjdGlvbi13YWxsZXQtYWRkcmVzcycpLnRleHRDb250ZW50ID0gJ05vIHdhbGxldCBmb3VuZCc7XHJcbiAgfVxyXG5cclxuICAvLyBTaG93IHRoZSBjb25uZWN0aW9uIGFwcHJvdmFsIHNjcmVlblxyXG4gIHNob3dTY3JlZW4oJ3NjcmVlbi1jb25uZWN0aW9uLWFwcHJvdmFsJyk7XHJcblxyXG4gIC8vIFNldHVwIGFwcHJvdmUgYnV0dG9uXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1hcHByb3ZlLWNvbm5lY3Rpb24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnQ09OTkVDVElPTl9BUFBST1ZBTCcsXHJcbiAgICAgICAgcmVxdWVzdElkLFxyXG4gICAgICAgIGFwcHJvdmVkOiB0cnVlXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQ2xvc2UgdGhlIHBvcHVwIHdpbmRvd1xyXG4gICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGFsZXJ0KCdFcnJvciBhcHByb3ZpbmcgY29ubmVjdGlvbjogJyArIHNhbml0aXplRXJyb3IoZXJyb3IubWVzc2FnZSkpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBTZXR1cCByZWplY3QgYnV0dG9uXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1yZWplY3QtY29ubmVjdGlvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgIHR5cGU6ICdDT05ORUNUSU9OX0FQUFJPVkFMJyxcclxuICAgICAgICByZXF1ZXN0SWQsXHJcbiAgICAgICAgYXBwcm92ZWQ6IGZhbHNlXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQ2xvc2UgdGhlIHBvcHVwIHdpbmRvd1xyXG4gICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGFsZXJ0KCdFcnJvciByZWplY3RpbmcgY29ubmVjdGlvbjogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuLy8gPT09PT0gVFJBTlNBQ1RJT04gQVBQUk9WQUwgPT09PT1cclxuLy8gUG9wdWxhdGUgZ2FzIHByaWNlIG9wdGlvbnNcclxuYXN5bmMgZnVuY3Rpb24gcG9wdWxhdGVHYXNQcmljZXMobmV0d29yaywgdHhSZXF1ZXN0LCBzeW1ib2wpIHtcclxuICB0cnkge1xyXG4gICAgLy8gRmV0Y2ggY3VycmVudCBnYXMgcHJpY2UgZnJvbSBSUENcclxuICAgIGNvbnN0IGdhc1ByaWNlSGV4ID0gYXdhaXQgcnBjLmdldEdhc1ByaWNlKG5ldHdvcmspO1xyXG4gICAgY29uc3QgZ2FzUHJpY2VXZWkgPSBCaWdJbnQoZ2FzUHJpY2VIZXgpO1xyXG4gICAgY29uc3QgZ2FzUHJpY2VHd2VpID0gTnVtYmVyKGdhc1ByaWNlV2VpKSAvIDFlOTtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgc2xvdyAoODAlKSwgbm9ybWFsICgxMDAlKSwgZmFzdCAoMTUwJSlcclxuICAgIGNvbnN0IHNsb3dHd2VpID0gKGdhc1ByaWNlR3dlaSAqIDAuOCkudG9GaXhlZCgyKTtcclxuICAgIGNvbnN0IG5vcm1hbEd3ZWkgPSBnYXNQcmljZUd3ZWkudG9GaXhlZCgyKTtcclxuICAgIGNvbnN0IGZhc3RHd2VpID0gKGdhc1ByaWNlR3dlaSAqIDEuNSkudG9GaXhlZCgyKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgVUlcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtc2xvdy1wcmljZScpLnRleHRDb250ZW50ID0gYCR7c2xvd0d3ZWl9IEd3ZWlgO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhcy1ub3JtYWwtcHJpY2UnKS50ZXh0Q29udGVudCA9IGAke25vcm1hbEd3ZWl9IEd3ZWlgO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhcy1mYXN0LXByaWNlJykudGV4dENvbnRlbnQgPSBgJHtmYXN0R3dlaX0gR3dlaWA7XHJcblxyXG4gICAgLy8gRXN0aW1hdGUgZ2FzIGZvciB0aGUgdHJhbnNhY3Rpb25cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGVzdGltYXRlZEdhc0hleCA9IGF3YWl0IHJwYy5lc3RpbWF0ZUdhcyhuZXR3b3JrLCB0eFJlcXVlc3QpO1xyXG4gICAgICBjb25zdCBlc3RpbWF0ZWRHYXMgPSBCaWdJbnQoZXN0aW1hdGVkR2FzSGV4KTtcclxuXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1lc3RpbWF0ZWQtZ2FzJykudGV4dENvbnRlbnQgPSBlc3RpbWF0ZWRHYXMudG9TdHJpbmcoKTtcclxuXHJcbiAgICAgIC8vIENhbGN1bGF0ZSBtYXggZmVlIGJhc2VkIG9uIG5vcm1hbCBnYXMgcHJpY2VcclxuICAgICAgY29uc3QgbWF4RmVlV2VpID0gZXN0aW1hdGVkR2FzICogZ2FzUHJpY2VXZWk7XHJcbiAgICAgIGNvbnN0IG1heEZlZUV0aCA9IGV0aGVycy5mb3JtYXRFdGhlcihtYXhGZWVXZWkudG9TdHJpbmcoKSk7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1tYXgtZmVlJykudGV4dENvbnRlbnQgPSBgJHtwYXJzZUZsb2F0KG1heEZlZUV0aCkudG9GaXhlZCg4KX0gJHtzeW1ib2x9YDtcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSBtYXggZmVlIHdoZW4gZ2FzIHByaWNlIHNlbGVjdGlvbiBjaGFuZ2VzXHJcbiAgICAgIGNvbnN0IHVwZGF0ZU1heEZlZSA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCBzZWxlY3RlZFNwZWVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImdhcy1zcGVlZFwiXTpjaGVja2VkJyk/LnZhbHVlO1xyXG4gICAgICAgIGxldCBzZWxlY3RlZEd3ZWk7XHJcblxyXG4gICAgICAgIGlmIChzZWxlY3RlZFNwZWVkID09PSAnc2xvdycpIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQoc2xvd0d3ZWkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ25vcm1hbCcpIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQobm9ybWFsR3dlaSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RlZFNwZWVkID09PSAnZmFzdCcpIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQoZmFzdEd3ZWkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2N1c3RvbScpIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWN1c3RvbS1nYXMtcHJpY2UnKS52YWx1ZSkgfHwgcGFyc2VGbG9hdChub3JtYWxHd2VpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2VsZWN0ZWRHd2VpID0gcGFyc2VGbG9hdChub3JtYWxHd2VpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkR2FzUHJpY2VXZWkgPSBCaWdJbnQoTWF0aC5mbG9vcihzZWxlY3RlZEd3ZWkgKiAxZTkpKTtcclxuICAgICAgICBjb25zdCBzZWxlY3RlZE1heEZlZVdlaSA9IGVzdGltYXRlZEdhcyAqIHNlbGVjdGVkR2FzUHJpY2VXZWk7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRNYXhGZWVFdGggPSBldGhlcnMuZm9ybWF0RXRoZXIoc2VsZWN0ZWRNYXhGZWVXZWkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LW1heC1mZWUnKS50ZXh0Q29udGVudCA9IGAke3BhcnNlRmxvYXQoc2VsZWN0ZWRNYXhGZWVFdGgpLnRvRml4ZWQoOCl9ICR7c3ltYm9sfWA7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBnYXMgcHJpY2UgY2hhbmdlc1xyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFtuYW1lPVwiZ2FzLXNwZWVkXCJdJykuZm9yRWFjaChyYWRpbyA9PiB7XHJcbiAgICAgICAgcmFkaW8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xyXG4gICAgICAgICAgdXBkYXRlTWF4RmVlKCk7XHJcblxyXG4gICAgICAgICAgLy8gVXBkYXRlIHZpc3VhbCBoaWdobGlnaHRpbmcgZm9yIGFsbCBnYXMgb3B0aW9uc1xyXG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmdhcy1vcHRpb24nKS5mb3JFYWNoKGxhYmVsID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaW5wdXQgPSBsYWJlbC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiZ2FzLXNwZWVkXCJdJyk7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dCAmJiBpbnB1dC5jaGVja2VkKSB7XHJcbiAgICAgICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyQ29sb3IgPSAndmFyKC0tdGVybWluYWwtc3VjY2VzcyknO1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlcldpZHRoID0gJzJweCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyQ29sb3IgPSAndmFyKC0tdGVybWluYWwtYm9yZGVyKSc7XHJcbiAgICAgICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyV2lkdGggPSAnMXB4JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgLy8gU2hvdy9oaWRlIGN1c3RvbSBpbnB1dCBiYXNlZCBvbiBzZWxlY3Rpb25cclxuICAgICAgICAgIGNvbnN0IGN1c3RvbUNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdXN0b20tZ2FzLWlucHV0LWNvbnRhaW5lcicpO1xyXG4gICAgICAgICAgaWYgKHJhZGlvLnZhbHVlID09PSAnY3VzdG9tJyAmJiByYWRpby5jaGVja2VkKSB7XHJcbiAgICAgICAgICAgIGN1c3RvbUNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgLy8gRm9jdXMgdGhlIGlucHV0IHdoZW4gY3VzdG9tIGlzIHNlbGVjdGVkXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXN0b20tZ2FzLXByaWNlJykuZm9jdXMoKTtcclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoY3VzdG9tQ29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgIGN1c3RvbUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBJbml0aWFsaXplIHRoZSBzZWxlY3RlZCBib3JkZXIgKE5vcm1hbCBpcyBjaGVja2VkIGJ5IGRlZmF1bHQpXHJcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYXMtb3B0aW9uJykuZm9yRWFjaChsYWJlbCA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBsYWJlbC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiZ2FzLXNwZWVkXCJdJyk7XHJcbiAgICAgICAgaWYgKGlucHV0ICYmIGlucHV0LmNoZWNrZWQpIHtcclxuICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXN1Y2Nlc3MpJztcclxuICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlcldpZHRoID0gJzJweCc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIEF1dG8tc2VsZWN0IGN1c3RvbSByYWRpbyB3aGVuIHR5cGluZyBpbiBjdXN0b20gZ2FzIHByaWNlXHJcbiAgICAgIGNvbnN0IGN1c3RvbUdhc0lucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWN1c3RvbS1nYXMtcHJpY2UnKTtcclxuICAgICAgY3VzdG9tR2FzSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhcy1jdXN0b20tcmFkaW8nKS5jaGVja2VkID0gdHJ1ZTtcclxuICAgICAgICB1cGRhdGVNYXhGZWUoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgfSBjYXRjaCAoZ2FzRXN0aW1hdGVFcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBlc3RpbWF0aW5nIGdhczonLCBnYXNFc3RpbWF0ZUVycm9yKTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWVzdGltYXRlZC1nYXMnKS50ZXh0Q29udGVudCA9ICcyMTAwMCAoZGVmYXVsdCknO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtbWF4LWZlZScpLnRleHRDb250ZW50ID0gJ1VuYWJsZSB0byBlc3RpbWF0ZSc7XHJcbiAgICB9XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBnYXMgcHJpY2U6JywgZXJyb3IpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhcy1zbG93LXByaWNlJykudGV4dENvbnRlbnQgPSAnRXJyb3InO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhcy1ub3JtYWwtcHJpY2UnKS50ZXh0Q29udGVudCA9ICdFcnJvcic7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FzLWZhc3QtcHJpY2UnKS50ZXh0Q29udGVudCA9ICdFcnJvcic7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgc2VsZWN0ZWQgZ2FzIHByaWNlIGluIHdlaVxyXG5mdW5jdGlvbiBnZXRTZWxlY3RlZEdhc1ByaWNlKCkge1xyXG4gIGNvbnN0IHNlbGVjdGVkU3BlZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiZ2FzLXNwZWVkXCJdOmNoZWNrZWQnKT8udmFsdWU7XHJcblxyXG4gIGlmIChzZWxlY3RlZFNwZWVkID09PSAnY3VzdG9tJykge1xyXG4gICAgY29uc3QgY3VzdG9tR3dlaSA9IHBhcnNlRmxvYXQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWN1c3RvbS1nYXMtcHJpY2UnKS52YWx1ZSk7XHJcbiAgICBpZiAoY3VzdG9tR3dlaSAmJiBjdXN0b21Hd2VpID4gMCkge1xyXG4gICAgICAvLyBDb252ZXJ0IEd3ZWkgdG8gV2VpIChtdWx0aXBseSBieSAxZTkpXHJcbiAgICAgIHJldHVybiBldGhlcnMucGFyc2VVbml0cyhjdXN0b21Hd2VpLnRvU3RyaW5nKCksICdnd2VpJykudG9TdHJpbmcoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEdldCB0aGUgZGlzcGxheWVkIEd3ZWkgdmFsdWUgYW5kIGNvbnZlcnQgdG8gd2VpXHJcbiAgbGV0IGd3ZWlUZXh0O1xyXG4gIGlmIChzZWxlY3RlZFNwZWVkID09PSAnc2xvdycpIHtcclxuICAgIGd3ZWlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhcy1zbG93LXByaWNlJykudGV4dENvbnRlbnQ7XHJcbiAgfSBlbHNlIGlmIChzZWxlY3RlZFNwZWVkID09PSAnZmFzdCcpIHtcclxuICAgIGd3ZWlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhcy1mYXN0LXByaWNlJykudGV4dENvbnRlbnQ7XHJcbiAgfSBlbHNlIHtcclxuICAgIGd3ZWlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhcy1ub3JtYWwtcHJpY2UnKS50ZXh0Q29udGVudDtcclxuICB9XHJcblxyXG4gIGNvbnN0IGd3ZWkgPSBwYXJzZUZsb2F0KGd3ZWlUZXh0KTtcclxuICBpZiAoZ3dlaSAmJiBnd2VpID4gMCkge1xyXG4gICAgcmV0dXJuIGV0aGVycy5wYXJzZVVuaXRzKGd3ZWkudG9TdHJpbmcoKSwgJ2d3ZWknKS50b1N0cmluZygpO1xyXG4gIH1cclxuXHJcbiAgLy8gSWYgYWxsIGVsc2UgZmFpbHMsIHJldHVybiBudWxsIHRvIHVzZSBkZWZhdWx0XHJcbiAgcmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbi8vIEZldGNoIGFuZCBkaXNwbGF5IGN1cnJlbnQgbm9uY2UgZm9yIHRyYW5zYWN0aW9uXHJcbmFzeW5jIGZ1bmN0aW9uIGZldGNoQW5kRGlzcGxheU5vbmNlKGFkZHJlc3MsIG5ldHdvcmspIHtcclxuICB0cnkge1xyXG4gICAgY29uc3Qgbm9uY2VIZXggPSBhd2FpdCBycGMuZ2V0VHJhbnNhY3Rpb25Db3VudChuZXR3b3JrLCBhZGRyZXNzLCAncGVuZGluZycpO1xyXG4gICAgY29uc3Qgbm9uY2UgPSBwYXJzZUludChub25jZUhleCwgMTYpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWN1cnJlbnQtbm9uY2UnKS50ZXh0Q29udGVudCA9IG5vbmNlO1xyXG4gICAgLy8gQ3VycmVudCBub25jZSBmZXRjaGVkXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIG5vbmNlOicsIGVycm9yKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXJyZW50LW5vbmNlJykudGV4dENvbnRlbnQgPSAnRXJyb3InO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVHJhbnNhY3Rpb25BcHByb3ZhbFNjcmVlbihyZXF1ZXN0SWQpIHtcclxuICAvLyBMb2FkIHNldHRpbmdzIGZvciB0aGVtZVxyXG4gIGF3YWl0IGxvYWRTZXR0aW5ncygpO1xyXG4gIGFwcGx5VGhlbWUoKTtcclxuXHJcbiAgLy8gR2V0IHRyYW5zYWN0aW9uIHJlcXVlc3QgZGV0YWlscyBmcm9tIGJhY2tncm91bmRcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdHRVRfVFJBTlNBQ1RJT05fUkVRVUVTVCcsXHJcbiAgICAgIHJlcXVlc3RJZFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgIGFsZXJ0KCdUcmFuc2FjdGlvbiByZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyk7XHJcbiAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyBvcmlnaW4sIHR4UmVxdWVzdCB9ID0gcmVzcG9uc2U7XHJcblxyXG4gICAgLy8gR2V0IGFjdGl2ZSB3YWxsZXRcclxuICAgIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJykgfHwgJ3B1bHNlY2hhaW5UZXN0bmV0JztcclxuXHJcbiAgICAvLyBQb3B1bGF0ZSB0cmFuc2FjdGlvbiBkZXRhaWxzXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc2l0ZS1vcmlnaW4nKS50ZXh0Q29udGVudCA9IG9yaWdpbjtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1mcm9tLWFkZHJlc3MnKS50ZXh0Q29udGVudCA9IHdhbGxldD8uYWRkcmVzcyB8fCAnMHgwMDAwLi4uMDAwMCc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtdG8tYWRkcmVzcycpLnRleHRDb250ZW50ID0gdHhSZXF1ZXN0LnRvIHx8ICdDb250cmFjdCBDcmVhdGlvbic7XHJcblxyXG4gICAgLy8gRm9ybWF0IHZhbHVlXHJcbiAgICBjb25zdCBzeW1ib2xzID0ge1xyXG4gICAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAndFBMUycsXHJcbiAgICAgICdwdWxzZWNoYWluJzogJ1BMUycsXHJcbiAgICAgICdldGhlcmV1bSc6ICdFVEgnLFxyXG4gICAgICAnc2Vwb2xpYSc6ICdTRVAnXHJcbiAgICB9O1xyXG4gICAgY29uc3Qgc3ltYm9sID0gc3ltYm9sc1tuZXR3b3JrXSB8fCAnVE9LRU4nO1xyXG5cclxuICAgIGlmICh0eFJlcXVlc3QudmFsdWUpIHtcclxuICAgICAgY29uc3QgdmFsdWUgPSBldGhlcnMuZm9ybWF0RXRoZXIodHhSZXF1ZXN0LnZhbHVlKTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXZhbHVlJykudGV4dENvbnRlbnQgPSBgJHt2YWx1ZX0gJHtzeW1ib2x9YDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC12YWx1ZScpLnRleHRDb250ZW50ID0gYDAgJHtzeW1ib2x9YDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTaG93IGRhdGEgc2VjdGlvbiBpZiB0aGVyZSdzIGNvbnRyYWN0IGRhdGFcclxuICAgIGlmICh0eFJlcXVlc3QuZGF0YSAmJiB0eFJlcXVlc3QuZGF0YSAhPT0gJzB4Jykge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGF0YS1zZWN0aW9uJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kYXRhJykudGV4dENvbnRlbnQgPSB0eFJlcXVlc3QuZGF0YTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kYXRhLXNlY3Rpb24nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTaG93IHRoZSB0cmFuc2FjdGlvbiBhcHByb3ZhbCBzY3JlZW5cclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi10cmFuc2FjdGlvbi1hcHByb3ZhbCcpO1xyXG5cclxuICAgIC8vIEZldGNoIGFuZCBwb3B1bGF0ZSBnYXMgcHJpY2Ugb3B0aW9uc1xyXG4gICAgYXdhaXQgcG9wdWxhdGVHYXNQcmljZXMobmV0d29yaywgdHhSZXF1ZXN0LCBzeW1ib2wpO1xyXG5cclxuICAgIC8vIEZldGNoIGFuZCBkaXNwbGF5IGN1cnJlbnQgbm9uY2VcclxuICAgIGF3YWl0IGZldGNoQW5kRGlzcGxheU5vbmNlKHdhbGxldC5hZGRyZXNzLCBuZXR3b3JrKTtcclxuXHJcbiAgICAvLyBTZXR1cCBjdXN0b20gbm9uY2UgY2hlY2tib3hcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXN0b20tbm9uY2UtY2hlY2tib3gnKS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VzdG9tLW5vbmNlLWlucHV0LWNvbnRhaW5lcicpO1xyXG4gICAgICBpZiAoZS50YXJnZXQuY2hlY2tlZCkge1xyXG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAvLyBQcmUtZmlsbCB3aXRoIGN1cnJlbnQgbm9uY2VcclxuICAgICAgICBjb25zdCBjdXJyZW50Tm9uY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VycmVudC1ub25jZScpLnRleHRDb250ZW50O1xyXG4gICAgICAgIGlmIChjdXJyZW50Tm9uY2UgIT09ICctLScpIHtcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXN0b20tbm9uY2UnKS52YWx1ZSA9IGN1cnJlbnROb25jZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTZXR1cCBhcHByb3ZlIGJ1dHRvblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1hcHByb3ZlLXRyYW5zYWN0aW9uJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFwcHJvdmVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWFwcHJvdmUtdHJhbnNhY3Rpb24nKTtcclxuICAgICAgY29uc3QgcGFzc3dvcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtcGFzc3dvcmQnKS52YWx1ZTtcclxuICAgICAgY29uc3QgZXJyb3JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1lcnJvcicpO1xyXG5cclxuICAgICAgaWYgKCFwYXNzd29yZCkge1xyXG4gICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSAnUGxlYXNlIGVudGVyIHlvdXIgcGFzc3dvcmQnO1xyXG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBEaXNhYmxlIGJ1dHRvbiBpbW1lZGlhdGVseSB0byBwcmV2ZW50IGRvdWJsZS1jbGlja2luZ1xyXG4gICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzAuNSc7XHJcbiAgICAgIGFwcHJvdmVCdG4uc3R5bGUuY3Vyc29yID0gJ25vdC1hbGxvd2VkJztcclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IHNlc3Npb24gZm9yIHRoaXMgdHJhbnNhY3Rpb24gdXNpbmcgdGhlIGVudGVyZWQgcGFzc3dvcmRcclxuICAgICAgICAvLyBUaGlzIHZhbGlkYXRlcyB0aGUgcGFzc3dvcmQgd2l0aG91dCBwYXNzaW5nIGl0IGZvciB0aGUgYWN0dWFsIHRyYW5zYWN0aW9uXHJcbiAgICAgICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICAgICAgY29uc3QgdGVtcFNlc3Npb25SZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICAgIHR5cGU6ICdDUkVBVEVfU0VTU0lPTicsXHJcbiAgICAgICAgICBwYXNzd29yZCxcclxuICAgICAgICAgIHdhbGxldElkOiBhY3RpdmVXYWxsZXQuaWQsXHJcbiAgICAgICAgICBkdXJhdGlvbk1zOiA2MDAwMCAvLyAxIG1pbnV0ZSB0ZW1wb3Jhcnkgc2Vzc2lvblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoIXRlbXBTZXNzaW9uUmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHBhc3N3b3JkJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBHZXQgc2VsZWN0ZWQgZ2FzIHByaWNlXHJcbiAgICAgICAgY29uc3QgZ2FzUHJpY2UgPSBnZXRTZWxlY3RlZEdhc1ByaWNlKCk7XHJcblxyXG4gICAgICAgIC8vIEdldCBjdXN0b20gbm9uY2UgaWYgcHJvdmlkZWRcclxuICAgICAgICBjb25zdCBjdXN0b21Ob25jZUNoZWNrYm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWN1c3RvbS1ub25jZS1jaGVja2JveCcpO1xyXG4gICAgICAgIGNvbnN0IGN1c3RvbU5vbmNlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VzdG9tLW5vbmNlJyk7XHJcbiAgICAgICAgbGV0IGN1c3RvbU5vbmNlID0gbnVsbDtcclxuICAgICAgICBpZiAoY3VzdG9tTm9uY2VDaGVja2JveC5jaGVja2VkICYmIGN1c3RvbU5vbmNlSW5wdXQudmFsdWUpIHtcclxuICAgICAgICAgIGN1c3RvbU5vbmNlID0gcGFyc2VJbnQoY3VzdG9tTm9uY2VJbnB1dC52YWx1ZSk7XHJcbiAgICAgICAgICBpZiAoaXNOYU4oY3VzdG9tTm9uY2UpIHx8IGN1c3RvbU5vbmNlIDwgMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY3VzdG9tIG5vbmNlJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICAgIHR5cGU6ICdUUkFOU0FDVElPTl9BUFBST1ZBTCcsXHJcbiAgICAgICAgICByZXF1ZXN0SWQsXHJcbiAgICAgICAgICBhcHByb3ZlZDogdHJ1ZSxcclxuICAgICAgICAgIHNlc3Npb25Ub2tlbjogdGVtcFNlc3Npb25SZXNwb25zZS5zZXNzaW9uVG9rZW4sXHJcbiAgICAgICAgICBnYXNQcmljZSxcclxuICAgICAgICAgIGN1c3RvbU5vbmNlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAvLyBIaWRlIGFwcHJvdmFsIGZvcm0gYW5kIHNob3cgc3RhdHVzIHNlY3Rpb25cclxuICAgICAgICAgIHNob3dUcmFuc2FjdGlvblN0YXR1cyhyZXNwb25zZS50eEhhc2gsIGFjdGl2ZVdhbGxldC5hZGRyZXNzLCByZXF1ZXN0SWQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gcmVzcG9uc2UuZXJyb3IgfHwgJ1RyYW5zYWN0aW9uIGZhaWxlZCc7XHJcbiAgICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgLy8gUmUtZW5hYmxlIGJ1dHRvbiBvbiBlcnJvciBzbyB1c2VyIGNhbiB0cnkgYWdhaW5cclxuICAgICAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgIGFwcHJvdmVCdG4uc3R5bGUub3BhY2l0eSA9ICcxJztcclxuICAgICAgICAgIGFwcHJvdmVCdG4uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIC8vIFJlLWVuYWJsZSBidXR0b24gb24gZXJyb3Igc28gdXNlciBjYW4gdHJ5IGFnYWluXHJcbiAgICAgICAgYXBwcm92ZUJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGFwcHJvdmVCdG4uc3R5bGUub3BhY2l0eSA9ICcxJztcclxuICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2V0dXAgcmVqZWN0IGJ1dHRvblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1yZWplY3QtdHJhbnNhY3Rpb24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnVFJBTlNBQ1RJT05fQVBQUk9WQUwnLFxyXG4gICAgICAgICAgcmVxdWVzdElkLFxyXG4gICAgICAgICAgYXBwcm92ZWQ6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIENsb3NlIHRoZSBwb3B1cCB3aW5kb3dcclxuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBhbGVydCgnRXJyb3IgcmVqZWN0aW5nIHRyYW5zYWN0aW9uOiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0Vycm9yIGxvYWRpbmcgdHJhbnNhY3Rpb246ICcgKyBlcnJvci5tZXNzYWdlKTtcclxuICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gVE9LRU4gQUREIEFQUFJPVkFMID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRva2VuQWRkQXBwcm92YWxTY3JlZW4ocmVxdWVzdElkKSB7XHJcbiAgLy8gTG9hZCBzZXR0aW5ncyBmb3IgdGhlbWVcclxuICBhd2FpdCBsb2FkU2V0dGluZ3MoKTtcclxuICBhcHBseVRoZW1lKCk7XHJcblxyXG4gIC8vIEdldCB0b2tlbiBhZGQgcmVxdWVzdCBkZXRhaWxzIGZyb20gYmFja2dyb3VuZFxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0dFVF9UT0tFTl9BRERfUkVRVUVTVCcsXHJcbiAgICAgIHJlcXVlc3RJZFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgIGFsZXJ0KCdUb2tlbiBhZGQgcmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcpO1xyXG4gICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgb3JpZ2luLCB0b2tlbkluZm8gfSA9IHJlc3BvbnNlO1xyXG5cclxuICAgIC8vIFBvcHVsYXRlIHRva2VuIGRldGFpbHNcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1zaXRlLW9yaWdpbicpLnRleHRDb250ZW50ID0gb3JpZ2luO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXN5bWJvbCcpLnRleHRDb250ZW50ID0gdG9rZW5JbmZvLnN5bWJvbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1hZGRyZXNzJykudGV4dENvbnRlbnQgPSB0b2tlbkluZm8uYWRkcmVzcztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZWNpbWFscycpLnRleHRDb250ZW50ID0gdG9rZW5JbmZvLmRlY2ltYWxzO1xyXG5cclxuICAgIC8vIFNob3cgdG9rZW4gaW1hZ2UgaWYgcHJvdmlkZWRcclxuICAgIGlmICh0b2tlbkluZm8uaW1hZ2UpIHtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWltYWdlJykuc3JjID0gdG9rZW5JbmZvLmltYWdlO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4taW1hZ2Utc2VjdGlvbicpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWltYWdlLXNlY3Rpb24nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTaG93IHRoZSB0b2tlbiBhcHByb3ZhbCBzY3JlZW5cclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1hZGQtdG9rZW4nKTtcclxuXHJcbiAgICAvLyBTZXR1cCBhcHByb3ZlIGJ1dHRvblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1hcHByb3ZlLXRva2VuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFwcHJvdmVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWFwcHJvdmUtdG9rZW4nKTtcclxuICAgICAgY29uc3QgZXJyb3JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1lcnJvcicpO1xyXG5cclxuICAgICAgLy8gRGlzYWJsZSBidXR0b24gaW1tZWRpYXRlbHkgdG8gcHJldmVudCBkb3VibGUtY2xpY2tpbmdcclxuICAgICAgYXBwcm92ZUJ0bi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgIGFwcHJvdmVCdG4uc3R5bGUub3BhY2l0eSA9ICcwLjUnO1xyXG4gICAgICBhcHByb3ZlQnRuLnN0eWxlLmN1cnNvciA9ICdub3QtYWxsb3dlZCc7XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgIC8vIFNlbmQgYXBwcm92YWwgdG8gYmFja2dyb3VuZFxyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgdHlwZTogJ1RPS0VOX0FERF9BUFBST1ZBTCcsXHJcbiAgICAgICAgICByZXF1ZXN0SWQsXHJcbiAgICAgICAgICBhcHByb3ZlZDogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgLy8gQWRkIHRoZSB0b2tlbiB0byBzdG9yYWdlIHVzaW5nIGV4aXN0aW5nIHRva2VuIG1hbmFnZW1lbnRcclxuICAgICAgICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBsb2FkKCdjdXJyZW50TmV0d29yaycpIHx8ICdwdWxzZWNoYWluVGVzdG5ldCc7XHJcbiAgICAgICAgICBhd2FpdCB0b2tlbnMuYWRkQ3VzdG9tVG9rZW4obmV0d29yaywgdG9rZW5JbmZvLmFkZHJlc3MsIHRva2VuSW5mby5zeW1ib2wsIHRva2VuSW5mby5kZWNpbWFscyk7XHJcblxyXG4gICAgICAgICAgLy8gQ2xvc2UgdGhlIHBvcHVwIHdpbmRvd1xyXG4gICAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSByZXNwb25zZS5lcnJvciB8fCAnRmFpbGVkIHRvIGFkZCB0b2tlbic7XHJcbiAgICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgLy8gUmUtZW5hYmxlIGJ1dHRvbiBvbiBlcnJvciBzbyB1c2VyIGNhbiB0cnkgYWdhaW5cclxuICAgICAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgIGFwcHJvdmVCdG4uc3R5bGUub3BhY2l0eSA9ICcxJztcclxuICAgICAgICAgIGFwcHJvdmVCdG4uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIC8vIFJlLWVuYWJsZSBidXR0b24gb24gZXJyb3Igc28gdXNlciBjYW4gdHJ5IGFnYWluXHJcbiAgICAgICAgYXBwcm92ZUJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGFwcHJvdmVCdG4uc3R5bGUub3BhY2l0eSA9ICcxJztcclxuICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2V0dXAgcmVqZWN0IGJ1dHRvblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1yZWplY3QtdG9rZW4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnVE9LRU5fQUREX0FQUFJPVkFMJyxcclxuICAgICAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgICAgIGFwcHJvdmVkOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBDbG9zZSB0aGUgcG9wdXAgd2luZG93XHJcbiAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgYWxlcnQoJ0Vycm9yIHJlamVjdGluZyB0b2tlbjogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGFsZXJ0KCdFcnJvciBsb2FkaW5nIHRva2VuIGFkZCByZXF1ZXN0OiAnICsgc2FuaXRpemVFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICB3aW5kb3cuY2xvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFRSQU5TQUNUSU9OIEhJU1RPUlkgPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlUGVuZGluZ1R4SW5kaWNhdG9yKCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX1BFTkRJTkdfVFhfQ09VTlQnLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzc1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgaW5kaWNhdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlbmRpbmctdHgtaW5kaWNhdG9yJyk7XHJcbiAgICBjb25zdCB0ZXh0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGVuZGluZy10eC10ZXh0Jyk7XHJcblxyXG4gICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MgJiYgcmVzcG9uc2UuY291bnQgPiAwKSB7XHJcbiAgICAgIHRleHRFbC50ZXh0Q29udGVudCA9IGDimqDvuI8gJHtyZXNwb25zZS5jb3VudH0gUGVuZGluZyBUcmFuc2FjdGlvbiR7cmVzcG9uc2UuY291bnQgPiAxID8gJ3MnIDogJyd9YDtcclxuICAgICAgaW5kaWNhdG9yLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaW5kaWNhdG9yLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjaGVja2luZyBwZW5kaW5nIHRyYW5zYWN0aW9uczonLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzaG93VHJhbnNhY3Rpb25IaXN0b3J5KCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MpIHJldHVybjtcclxuXHJcbiAgc2hvd1NjcmVlbignc2NyZWVuLXR4LWhpc3RvcnknKTtcclxuICBhd2FpdCByZW5kZXJUcmFuc2FjdGlvbkhpc3RvcnkoJ2FsbCcpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZW5kZXJUcmFuc2FjdGlvbkhpc3RvcnkoZmlsdGVyID0gJ2FsbCcpIHtcclxuICBjb25zdCBsaXN0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtaGlzdG9yeS1saXN0Jyk7XHJcbiAgaWYgKCFjdXJyZW50U3RhdGUuYWRkcmVzcykge1xyXG4gICAgbGlzdEVsLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtZGltXCI+Tm8gYWRkcmVzcyBzZWxlY3RlZDwvcD4nO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgbGlzdEVsLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtZGltXCI+TG9hZGluZy4uLjwvcD4nO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdHRVRfVFhfSElTVE9SWScsXHJcbiAgICAgIGFkZHJlc3M6IGN1cnJlbnRTdGF0ZS5hZGRyZXNzXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlLnN1Y2Nlc3MgfHwgIXJlc3BvbnNlLnRyYW5zYWN0aW9ucyB8fCByZXNwb25zZS50cmFuc2FjdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGxpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPk5vIHRyYW5zYWN0aW9uczwvcD4nO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHRyYW5zYWN0aW9ucyA9IHJlc3BvbnNlLnRyYW5zYWN0aW9ucztcclxuXHJcbiAgICAvLyBBcHBseSBmaWx0ZXJcclxuICAgIGlmIChmaWx0ZXIgPT09ICdwZW5kaW5nJykge1xyXG4gICAgICB0cmFuc2FjdGlvbnMgPSB0cmFuc2FjdGlvbnMuZmlsdGVyKHR4ID0+IHR4LnN0YXR1cyA9PT0gJ3BlbmRpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoZmlsdGVyID09PSAnY29uZmlybWVkJykge1xyXG4gICAgICB0cmFuc2FjdGlvbnMgPSB0cmFuc2FjdGlvbnMuZmlsdGVyKHR4ID0+IHR4LnN0YXR1cyA9PT0gJ2NvbmZpcm1lZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0cmFuc2FjdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGxpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPk5vIHRyYW5zYWN0aW9ucyBpbiB0aGlzIGZpbHRlcjwvcD4nO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGh0bWwgPSAnJztcclxuICAgIGZvciAoY29uc3QgdHggb2YgdHJhbnNhY3Rpb25zKSB7XHJcbiAgICAgIGNvbnN0IHN0YXR1c0ljb24gPSB0eC5zdGF0dXMgPT09ICdwZW5kaW5nJyA/ICfij7MnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHguc3RhdHVzID09PSAnY29uZmlybWVkJyA/ICfinIUnIDogJ+KdjCc7XHJcbiAgICAgIGNvbnN0IHN0YXR1c0NvbG9yID0gdHguc3RhdHVzID09PSAncGVuZGluZycgPyAndmFyKC0tdGVybWluYWwtd2FybmluZyknIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHR4LnN0YXR1cyA9PT0gJ2NvbmZpcm1lZCcgPyAnIzQ0ZmY0NCcgOiAnI2ZmNDQ0NCc7XHJcblxyXG4gICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUodHgudGltZXN0YW1wKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICBjb25zdCB2YWx1ZUV0aCA9IGV0aGVycy5mb3JtYXRFdGhlcih0eC52YWx1ZSB8fCAnMCcpO1xyXG4gICAgICBjb25zdCBnYXNHd2VpID0gZXRoZXJzLmZvcm1hdFVuaXRzKHR4Lmdhc1ByaWNlIHx8ICcwJywgJ2d3ZWknKTtcclxuXHJcbiAgICAgIGh0bWwgKz0gYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJwYW5lbCBtYi0yXCIgc3R5bGU9XCJwYWRkaW5nOiAxMnB4OyBjdXJzb3I6IHBvaW50ZXI7IGJvcmRlci1jb2xvcjogJHtzdGF0dXNDb2xvcn07XCIgZGF0YS10eC1oYXNoPVwiJHt0eC5oYXNofVwiPlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgYWxpZ24taXRlbXM6IGNlbnRlcjsgbWFyZ2luLWJvdHRvbTogOHB4O1wiPlxyXG4gICAgICAgICAgICA8c3BhbiBzdHlsZT1cImNvbG9yOiAke3N0YXR1c0NvbG9yfTsgZm9udC1zaXplOiAxNHB4O1wiPiR7c3RhdHVzSWNvbn0gJHt0eC5zdGF0dXMudG9VcHBlckNhc2UoKX08L3NwYW4+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTBweDtcIj4ke2RhdGV9PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDEwcHg7IG1hcmdpbi1ib3R0b206IDRweDtcIj5IYXNoOiAke3R4Lmhhc2guc2xpY2UoMCwgMjApfS4uLjwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTBweDsgbWFyZ2luLWJvdHRvbTogNHB4O1wiPlZhbHVlOiAke3ZhbHVlRXRofSAke2dldE5ldHdvcmtTeW1ib2wodHgubmV0d29yayl9PC9wPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMHB4O1wiPkdhczogJHtnYXNHd2VpfSBHd2VpIOKAoiBOb25jZTogJHt0eC5ub25jZX08L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIGA7XHJcbiAgICB9XHJcblxyXG4gICAgbGlzdEVsLmlubmVySFRNTCA9IGh0bWw7XHJcblxyXG4gICAgLy8gQWRkIGNsaWNrIGhhbmRsZXJzXHJcbiAgICBsaXN0RWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdHgtaGFzaF0nKS5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdHhIYXNoID0gZWwuZGF0YXNldC50eEhhc2g7XHJcbiAgICAgICAgc2hvd1RyYW5zYWN0aW9uRGV0YWlscyh0eEhhc2gpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgbG9hZGluZyB0cmFuc2FjdGlvbiBoaXN0b3J5OicsIGVycm9yKTtcclxuICAgIGxpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPkVycm9yIGxvYWRpbmcgdHJhbnNhY3Rpb25zPC9wPic7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzaG93VHJhbnNhY3Rpb25EZXRhaWxzKHR4SGFzaCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX1RYX0JZX0hBU0gnLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzcyxcclxuICAgICAgdHhIYXNoOiB0eEhhc2hcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghcmVzcG9uc2Uuc3VjY2VzcyB8fCAhcmVzcG9uc2UudHJhbnNhY3Rpb24pIHtcclxuICAgICAgYWxlcnQoJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCcpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdHggPSByZXNwb25zZS50cmFuc2FjdGlvbjtcclxuXHJcbiAgICAvLyBTaG93IHNjcmVlblxyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXR4LWRldGFpbHMnKTtcclxuXHJcbiAgICAvLyBQb3B1bGF0ZSBkZXRhaWxzXHJcbiAgICBjb25zdCBzdGF0dXNCYWRnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1zdGF0dXMtYmFkZ2UnKTtcclxuICAgIGNvbnN0IHN0YXR1c1RleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc3RhdHVzLXRleHQnKTtcclxuXHJcbiAgICBpZiAodHguc3RhdHVzID09PSAncGVuZGluZycpIHtcclxuICAgICAgc3RhdHVzVGV4dC50ZXh0Q29udGVudCA9ICfij7MgUEVORElORyc7XHJcbiAgICAgIHN0YXR1c0JhZGdlLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXdhcm5pbmcpJztcclxuICAgICAgc3RhdHVzVGV4dC5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC13YXJuaW5nKSc7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1wZW5kaW5nLWFjdGlvbnMnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1ibG9jay1zZWN0aW9uJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9IGVsc2UgaWYgKHR4LnN0YXR1cyA9PT0gJ2NvbmZpcm1lZCcpIHtcclxuICAgICAgc3RhdHVzVGV4dC50ZXh0Q29udGVudCA9ICfinIUgQ09ORklSTUVEJztcclxuICAgICAgc3RhdHVzQmFkZ2Uuc3R5bGUuYm9yZGVyQ29sb3IgPSAnIzQ0ZmY0NCc7XHJcbiAgICAgIHN0YXR1c1RleHQuc3R5bGUuY29sb3IgPSAnIzQ0ZmY0NCc7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1wZW5kaW5nLWFjdGlvbnMnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1ibG9jay1zZWN0aW9uJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kZXRhaWwtYmxvY2snKS50ZXh0Q29udGVudCA9IHR4LmJsb2NrTnVtYmVyIHx8ICctLSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdGF0dXNUZXh0LnRleHRDb250ZW50ID0gJ+KdjCBGQUlMRUQnO1xyXG4gICAgICBzdGF0dXNCYWRnZS5zdHlsZS5ib3JkZXJDb2xvciA9ICcjZmY0NDQ0JztcclxuICAgICAgc3RhdHVzVGV4dC5zdHlsZS5jb2xvciA9ICcjZmY0NDQ0JztcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXBlbmRpbmctYWN0aW9ucycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLWJsb2NrLXNlY3Rpb24nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIH1cclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLWhhc2gnKS50ZXh0Q29udGVudCA9IHR4Lmhhc2g7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLWZyb20nKS50ZXh0Q29udGVudCA9IHR4LmZyb207XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLXRvJykudGV4dENvbnRlbnQgPSB0eC50byB8fCAnQ29udHJhY3QgQ3JlYXRpb24nO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC12YWx1ZScpLnRleHRDb250ZW50ID0gZXRoZXJzLmZvcm1hdEV0aGVyKHR4LnZhbHVlIHx8ICcwJykgKyAnICcgKyBnZXROZXR3b3JrU3ltYm9sKHR4Lm5ldHdvcmspO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1ub25jZScpLnRleHRDb250ZW50ID0gdHgubm9uY2U7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLWdhcy1wcmljZScpLnRleHRDb250ZW50ID0gZXRoZXJzLmZvcm1hdFVuaXRzKHR4Lmdhc1ByaWNlIHx8ICcwJywgJ2d3ZWknKSArICcgR3dlaSc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLW5ldHdvcmsnKS50ZXh0Q29udGVudCA9IGdldE5ldHdvcmtOYW1lKHR4Lm5ldHdvcmspO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC10aW1lc3RhbXAnKS50ZXh0Q29udGVudCA9IG5ldyBEYXRlKHR4LnRpbWVzdGFtcCkudG9Mb2NhbGVTdHJpbmcoKTtcclxuXHJcbiAgICAvLyBTdG9yZSBjdXJyZW50IHR4IGhhc2ggZm9yIHNwZWVkIHVwL2NhbmNlbFxyXG4gICAgY3VycmVudFN0YXRlLmN1cnJlbnRUeEhhc2ggPSB0eC5oYXNoO1xyXG5cclxuICAgIC8vIFNldCB1cCBleHBsb3JlciBsaW5rXHJcbiAgICBjb25zdCBleHBsb3JlckJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdmlldy1leHBsb3JlcicpO1xyXG4gICAgZXhwbG9yZXJCdG4ub25jbGljayA9ICgpID0+IHtcclxuICAgICAgY29uc3QgdXJsID0gZ2V0RXhwbG9yZXJVcmwodHgubmV0d29yaywgJ3R4JywgdHguaGFzaCk7XHJcbiAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybCB9KTtcclxuICAgIH07XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBsb2FkaW5nIHRyYW5zYWN0aW9uIGRldGFpbHM6JywgZXJyb3IpO1xyXG4gICAgYWxlcnQoJ0Vycm9yIGxvYWRpbmcgdHJhbnNhY3Rpb24gZGV0YWlscycpO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3BlZWRVcFRyYW5zYWN0aW9uKCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MgfHwgIWN1cnJlbnRTdGF0ZS5jdXJyZW50VHhIYXNoKSByZXR1cm47XHJcblxyXG4gIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgc2hvd1Bhc3N3b3JkUHJvbXB0KCdTcGVlZCBVcCBUcmFuc2FjdGlvbicsICdFbnRlciB5b3VyIHBhc3N3b3JkIHRvIHNwZWVkIHVwIHRoaXMgdHJhbnNhY3Rpb24gd2l0aCBoaWdoZXIgZ2FzIHByaWNlICgxLjJ4KScpO1xyXG4gIGlmICghcGFzc3dvcmQpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIENyZWF0ZSB0ZW1wb3Jhcnkgc2Vzc2lvblxyXG4gICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBjb25zdCBzZXNzaW9uUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdDUkVBVEVfU0VTU0lPTicsXHJcbiAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcclxuICAgICAgd2FsbGV0SWQ6IGFjdGl2ZVdhbGxldC5pZCxcclxuICAgICAgZHVyYXRpb25NczogNjAwMDAgLy8gMSBtaW51dGUgdGVtcCBzZXNzaW9uXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXNlc3Npb25SZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgIGFsZXJ0KCdJbnZhbGlkIHBhc3N3b3JkJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTcGVlZCB1cCB0cmFuc2FjdGlvblxyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdTUEVFRF9VUF9UWCcsXHJcbiAgICAgIGFkZHJlc3M6IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLFxyXG4gICAgICB0eEhhc2g6IGN1cnJlbnRTdGF0ZS5jdXJyZW50VHhIYXNoLFxyXG4gICAgICBzZXNzaW9uVG9rZW46IHNlc3Npb25SZXNwb25zZS5zZXNzaW9uVG9rZW4sXHJcbiAgICAgIGdhc1ByaWNlTXVsdGlwbGllcjogMS4yXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICBhbGVydChgVHJhbnNhY3Rpb24gc3BlZCB1cCFcXG5OZXcgVFg6ICR7cmVzcG9uc2UudHhIYXNoLnNsaWNlKDAsIDIwKX0uLi5gKTtcclxuICAgICAgLy8gUmVmcmVzaCB0aGUgdHJhbnNhY3Rpb24gZGV0YWlsc1xyXG4gICAgICBzaG93VHJhbnNhY3Rpb25EZXRhaWxzKHJlc3BvbnNlLnR4SGFzaCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhbGVydCgnRXJyb3Igc3BlZWRpbmcgdXAgdHJhbnNhY3Rpb246ICcgKyByZXNwb25zZS5lcnJvcik7XHJcbiAgICB9XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzcGVlZGluZyB1cCB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICBhbGVydCgnRXJyb3Igc3BlZWRpbmcgdXAgdHJhbnNhY3Rpb24nKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNhbmNlbFRyYW5zYWN0aW9uKCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MgfHwgIWN1cnJlbnRTdGF0ZS5jdXJyZW50VHhIYXNoKSByZXR1cm47XHJcblxyXG4gIGlmICghY29uZmlybSgnQ2FuY2VsIHRoaXMgdHJhbnNhY3Rpb24/IEEgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIHdpbGwgYmUgc2VudC4nKSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ0NhbmNlbCBUcmFuc2FjdGlvbicsICdFbnRlciB5b3VyIHBhc3N3b3JkIHRvIGNhbmNlbCB0aGlzIHRyYW5zYWN0aW9uIGJ5IHNlbmRpbmcgYSAwLXZhbHVlIHJlcGxhY2VtZW50Jyk7XHJcbiAgaWYgKCFwYXNzd29yZCkgcmV0dXJuO1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gQ3JlYXRlIHRlbXBvcmFyeSBzZXNzaW9uXHJcbiAgICBjb25zdCBhY3RpdmVXYWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgIGNvbnN0IHNlc3Npb25SZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0NSRUFURV9TRVNTSU9OJyxcclxuICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkLFxyXG4gICAgICB3YWxsZXRJZDogYWN0aXZlV2FsbGV0LmlkLFxyXG4gICAgICBkdXJhdGlvbk1zOiA2MDAwMCAvLyAxIG1pbnV0ZSB0ZW1wIHNlc3Npb25cclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghc2Vzc2lvblJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgYWxlcnQoJ0ludmFsaWQgcGFzc3dvcmQnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhbmNlbCB0cmFuc2FjdGlvblxyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdDQU5DRUxfVFgnLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzcyxcclxuICAgICAgdHhIYXNoOiBjdXJyZW50U3RhdGUuY3VycmVudFR4SGFzaCxcclxuICAgICAgc2Vzc2lvblRva2VuOiBzZXNzaW9uUmVzcG9uc2Uuc2Vzc2lvblRva2VuXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICBhbGVydChgVHJhbnNhY3Rpb24gY2FuY2VsbGVkIVxcbkNhbmNlbGxhdGlvbiBUWDogJHtyZXNwb25zZS50eEhhc2guc2xpY2UoMCwgMjApfS4uLmApO1xyXG4gICAgICAvLyBSZWZyZXNoIHRvIHNob3cgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uXHJcbiAgICAgIHNob3dUcmFuc2FjdGlvbkRldGFpbHMocmVzcG9uc2UudHhIYXNoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFsZXJ0KCdFcnJvciBjYW5jZWxsaW5nIHRyYW5zYWN0aW9uOiAnICsgcmVzcG9uc2UuZXJyb3IpO1xyXG4gICAgfVxyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgY2FuY2VsbGluZyB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICBhbGVydCgnRXJyb3IgY2FuY2VsbGluZyB0cmFuc2FjdGlvbicpO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2xlYXJUcmFuc2FjdGlvbkhpc3RvcnkoKSB7XHJcbiAgaWYgKCFjb25maXJtKCdDbGVhciBhbGwgdHJhbnNhY3Rpb24gaGlzdG9yeSBmb3IgdGhpcyBhZGRyZXNzPyBUaGlzIGNhbm5vdCBiZSB1bmRvbmUuJykpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdDTEVBUl9UWF9ISVNUT1JZJyxcclxuICAgICAgYWRkcmVzczogY3VycmVudFN0YXRlLmFkZHJlc3NcclxuICAgIH0pO1xyXG5cclxuICAgIGFsZXJ0KCdUcmFuc2FjdGlvbiBoaXN0b3J5IGNsZWFyZWQnKTtcclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKTtcclxuICAgIGF3YWl0IHVwZGF0ZURhc2hib2FyZCgpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjbGVhcmluZyB0cmFuc2FjdGlvbiBoaXN0b3J5OicsIGVycm9yKTtcclxuICAgIGFsZXJ0KCdFcnJvciBjbGVhcmluZyB0cmFuc2FjdGlvbiBoaXN0b3J5Jyk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogU2hvdyB0cmFuc2FjdGlvbiBzdGF0dXMgYWZ0ZXIgYXBwcm92YWxcclxuICogS2VlcHMgYXBwcm92YWwgd2luZG93IG9wZW4gdG8gc2hvdyB0eCBzdGF0dXNcclxuICovXHJcbmxldCB0eFN0YXR1c1BvbGxJbnRlcnZhbCA9IG51bGw7XHJcbmxldCB0eFN0YXR1c0N1cnJlbnRIYXNoID0gbnVsbDtcclxubGV0IHR4U3RhdHVzQ3VycmVudEFkZHJlc3MgPSBudWxsO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2hvd1RyYW5zYWN0aW9uU3RhdHVzKHR4SGFzaCwgYWRkcmVzcywgcmVxdWVzdElkKSB7XHJcbiAgLy8gU2hvd2luZyB0cmFuc2FjdGlvbiBzdGF0dXNcclxuXHJcbiAgLy8gU3RvcmUgY3VycmVudCB0cmFuc2FjdGlvbiBoYXNoIGFuZCBhZGRyZXNzXHJcbiAgdHhTdGF0dXNDdXJyZW50SGFzaCA9IHR4SGFzaDtcclxuICB0eFN0YXR1c0N1cnJlbnRBZGRyZXNzID0gYWRkcmVzcztcclxuXHJcbiAgLy8gSGlkZSBhcHByb3ZhbCBmb3JtXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWFwcHJvdmFsLWZvcm0nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gU2hvdyBzdGF0dXMgc2VjdGlvblxyXG4gIGNvbnN0IHN0YXR1c1NlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc3RhdHVzLXNlY3Rpb24nKTtcclxuICBzdGF0dXNTZWN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG5cclxuICAvLyBQb3B1bGF0ZSB0cmFuc2FjdGlvbiBoYXNoXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXN0YXR1cy1oYXNoJykudGV4dENvbnRlbnQgPSB0eEhhc2g7XHJcblxyXG4gIC8vIFBvbGwgZm9yIHRyYW5zYWN0aW9uIHN0YXR1cyB1cGRhdGVzXHJcbiAgY29uc3QgdXBkYXRlU3RhdHVzID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gUG9sbGluZyB0cmFuc2FjdGlvbiBzdGF0dXNcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogJ0dFVF9UWF9CWV9IQVNIJyxcclxuICAgICAgICBhZGRyZXNzOiB0eFN0YXR1c0N1cnJlbnRBZGRyZXNzLFxyXG4gICAgICAgIHR4SGFzaDogdHhIYXNoXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gU3RhdHVzIHBvbGwgcmVzcG9uc2VcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzICYmIHJlc3BvbnNlLnRyYW5zYWN0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgdHggPSByZXNwb25zZS50cmFuc2FjdGlvbjtcclxuICAgICAgICAvLyBUcmFuc2FjdGlvbiBzdGF0dXMgdXBkYXRlZFxyXG5cclxuICAgICAgICBjb25zdCBzdGF0dXNNZXNzYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXN0YXR1cy1tZXNzYWdlJyk7XHJcbiAgICAgICAgY29uc3Qgc3RhdHVzRGV0YWlscyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1zdGF0dXMtZGV0YWlscycpO1xyXG4gICAgICAgIGNvbnN0IHBlbmRpbmdBY3Rpb25zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXN0YXR1cy1wZW5kaW5nLWFjdGlvbnMnKTtcclxuXHJcbiAgICAgICAgaWYgKHR4LnN0YXR1cyA9PT0gJ2NvbmZpcm1lZCcpIHtcclxuICAgICAgICAgIC8vIFRyYW5zYWN0aW9uIGNvbmZpcm1lZFxyXG4gICAgICAgICAgc3RhdHVzTWVzc2FnZS50ZXh0Q29udGVudCA9ICfinIUgVHJhbnNhY3Rpb24gQ29uZmlybWVkISc7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnRleHRDb250ZW50ID0gYEJsb2NrOiAke3R4LmJsb2NrTnVtYmVyfWA7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXN1Y2Nlc3MpJztcclxuICAgICAgICAgIHBlbmRpbmdBY3Rpb25zLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAgIC8vIFN0b3AgcG9sbGluZ1xyXG4gICAgICAgICAgaWYgKHR4U3RhdHVzUG9sbEludGVydmFsKSB7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodHhTdGF0dXNQb2xsSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICB0eFN0YXR1c1BvbGxJbnRlcnZhbCA9IG51bGw7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gQXV0by1jbG9zZSBhZnRlciAyIHNlY29uZHNcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHguc3RhdHVzID09PSAnZmFpbGVkJykge1xyXG4gICAgICAgICAgc3RhdHVzTWVzc2FnZS50ZXh0Q29udGVudCA9ICfinYwgVHJhbnNhY3Rpb24gRmFpbGVkJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMudGV4dENvbnRlbnQgPSAnVGhlIHRyYW5zYWN0aW9uIHdhcyByZWplY3RlZCBvciByZXBsYWNlZCc7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnN0eWxlLmNvbG9yID0gJyNmZjQ0NDQnO1xyXG4gICAgICAgICAgcGVuZGluZ0FjdGlvbnMuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgLy8gU3RvcCBwb2xsaW5nXHJcbiAgICAgICAgICBpZiAodHhTdGF0dXNQb2xsSW50ZXJ2YWwpIHtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0eFN0YXR1c1BvbGxJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIHR4U3RhdHVzUG9sbEludGVydmFsID0gbnVsbDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBBdXRvLWNsb3NlIGFmdGVyIDIgc2Vjb25kc1xyXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICAgICAgfSwgMjAwMCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIFN0aWxsIHBlbmRpbmdcclxuICAgICAgICAgIHN0YXR1c01lc3NhZ2UudGV4dENvbnRlbnQgPSAn4o+zIFdhaXRpbmcgZm9yIGNvbmZpcm1hdGlvbi4uLic7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnRleHRDb250ZW50ID0gJ1RoaXMgdXN1YWxseSB0YWtlcyAxMC0zMCBzZWNvbmRzJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMuc3R5bGUuY29sb3IgPSAndmFyKC0tdGVybWluYWwtZmctZGltKSc7XHJcbiAgICAgICAgICBwZW5kaW5nQWN0aW9ucy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCfwn6uAIFRyYW5zYWN0aW9uIG5vdCBmb3VuZCBpbiBzdG9yYWdlOicsIHR4SGFzaCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgY2hlY2tpbmcgdHJhbnNhY3Rpb24gc3RhdHVzOicsIGVycm9yKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBJbml0aWFsIHN0YXR1cyBjaGVja1xyXG4gIGF3YWl0IHVwZGF0ZVN0YXR1cygpO1xyXG5cclxuICAvLyBQb2xsIGV2ZXJ5IDMgc2Vjb25kc1xyXG4gIHR4U3RhdHVzUG9sbEludGVydmFsID0gc2V0SW50ZXJ2YWwodXBkYXRlU3RhdHVzLCAzMDAwKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TmV0d29ya1N5bWJvbChuZXR3b3JrKSB7XHJcbiAgY29uc3Qgc3ltYm9scyA9IHtcclxuICAgICdwdWxzZWNoYWluJzogJ1BMUycsXHJcbiAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAndFBMUycsXHJcbiAgICAnZXRoZXJldW0nOiAnRVRIJyxcclxuICAgICdzZXBvbGlhJzogJ1NlcG9saWFFVEgnXHJcbiAgfTtcclxuICByZXR1cm4gc3ltYm9sc1tuZXR3b3JrXSB8fCAnRVRIJztcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TmV0d29ya05hbWUobmV0d29yaykge1xyXG4gIGNvbnN0IG5hbWVzID0ge1xyXG4gICAgJ3B1bHNlY2hhaW4nOiAnUHVsc2VDaGFpbiBNYWlubmV0JyxcclxuICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICdQdWxzZUNoYWluIFRlc3RuZXQgVjQnLFxyXG4gICAgJ2V0aGVyZXVtJzogJ0V0aGVyZXVtIE1haW5uZXQnLFxyXG4gICAgJ3NlcG9saWEnOiAnU2Vwb2xpYSBUZXN0bmV0J1xyXG4gIH07XHJcbiAgcmV0dXJuIG5hbWVzW25ldHdvcmtdIHx8IG5ldHdvcms7XHJcbn1cclxuXHJcbi8vID09PT09IFVUSUxJVElFUyA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDb3B5QWRkcmVzcygpIHtcclxuICB0cnkge1xyXG4gICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LWFkZHJlc3MnKTtcclxuICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGJ0bi50ZXh0Q29udGVudDtcclxuICAgIGJ0bi50ZXh0Q29udGVudCA9ICdDT1BJRUQhJztcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSBvcmlnaW5hbFRleHQ7XHJcbiAgICB9LCAyMDAwKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0ZhaWxlZCB0byBjb3B5IGFkZHJlc3MnKTtcclxuICB9XHJcbn1cclxuIl0sImZpbGUiOiJwb3B1cC5qcyJ9