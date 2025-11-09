const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["index.js","rpc.js"])))=>i.map(i=>d[i]);
import { f as formatUnits, p as parseUnits, C as Contract, g as getProvider, i as isAddress, l as load, s as save, m as migrateToMultiWallet, w as walletExists, a as setActiveWallet, b as getActiveWallet, c as importFromMnemonic, d as importFromPrivateKey, u as unlockWallet, e as shortenAddress, h as getAllWallets, j as getBalance, k as formatBalance, n as parseEther, W as Wallet, o as exportMnemonic, q as exportPrivateKey, r as addWallet, t as renameWallet, v as formatEther, x as getBytes, y as toUtf8String, z as getGasPrice, A as estimateGas, B as getTransactionCount, D as deleteWallet, E as exportMnemonicForWallet, F as exportPrivateKeyForWallet } from "./rpc.js";
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
  ethereum: {
    "HEX": {
      name: "HEX",
      symbol: "HEX",
      address: "0x2b591e99afe9f32eaa6214f7b7629768c40eeb39",
      decimals: 8,
      logo: "hex.png",
      homeUrl: "https://hex.com",
      dexScreenerUrl: "https://dexscreener.com/ethereum/0x9e0905249ceefffb9605e034b534544684a58be6"
    }
  },
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
  if (action === "sign" && requestId) {
    await handleMessageSignApprovalScreen(requestId);
    return;
  }
  if (action === "signTyped" && requestId) {
    await handleTypedDataSignApprovalScreen(requestId);
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
  document.body.classList.remove("theme-high-contrast", "theme-professional", "theme-amber", "theme-cga", "theme-classic", "theme-heart");
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
async function handleMessageSignApprovalScreen(requestId) {
  await loadSettings();
  applyTheme();
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_SIGN_REQUEST",
      requestId
    });
    if (!response || !response.origin) {
      alert("Sign request not found or expired");
      window.close();
      return;
    }
    const { origin, method, signRequest } = response;
    const { message, address } = signRequest;
    document.getElementById("sign-site-origin").textContent = origin;
    document.getElementById("sign-address").textContent = address;
    const messageEl = document.getElementById("sign-message-content");
    let displayMessage = message;
    if (typeof message === "string" && message.startsWith("0x")) {
      document.getElementById("sign-message-hex-warning").classList.remove("hidden");
      try {
        const bytes = getBytes(message);
        const decoded = toUtf8String(bytes);
        if (/^[\x20-\x7E\s]+$/.test(decoded)) {
          displayMessage = decoded + "\n\n[Hex: " + message + "]";
        }
      } catch {
      }
    } else {
      document.getElementById("sign-message-hex-warning").classList.add("hidden");
    }
    messageEl.textContent = displayMessage;
    showScreen("screen-sign-message");
    document.getElementById("btn-approve-sign").addEventListener("click", async () => {
      const approveBtn = document.getElementById("btn-approve-sign");
      const password = document.getElementById("sign-password").value;
      const errorEl = document.getElementById("sign-error");
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
        const response2 = await chrome.runtime.sendMessage({
          type: "SIGN_APPROVAL",
          requestId,
          approved: true,
          sessionToken: tempSessionResponse.sessionToken
        });
        if (response2.success) {
          window.close();
        } else {
          errorEl.textContent = response2.error || "Signing failed";
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
    document.getElementById("btn-reject-sign").addEventListener("click", async () => {
      try {
        await chrome.runtime.sendMessage({
          type: "SIGN_APPROVAL",
          requestId,
          approved: false
        });
        window.close();
      } catch (error) {
        alert("Error rejecting sign request: " + error.message);
        window.close();
      }
    });
  } catch (error) {
    alert("Error loading sign request: " + sanitizeError(error.message));
    window.close();
  }
}
async function handleTypedDataSignApprovalScreen(requestId) {
  await loadSettings();
  applyTheme();
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_SIGN_REQUEST",
      requestId
    });
    if (!response || !response.origin) {
      alert("Sign request not found or expired");
      window.close();
      return;
    }
    const { origin, method, signRequest } = response;
    const { typedData, address } = signRequest;
    document.getElementById("sign-typed-site-origin").textContent = origin;
    document.getElementById("sign-typed-address").textContent = address;
    if (typedData.domain) {
      document.getElementById("sign-typed-domain-name").textContent = typedData.domain.name || "Unknown";
      document.getElementById("sign-typed-domain-chain").textContent = typedData.domain.chainId || "--";
      if (typedData.domain.verifyingContract) {
        document.getElementById("sign-typed-domain-contract").textContent = typedData.domain.verifyingContract;
        document.getElementById("sign-typed-domain-contract-row").classList.remove("hidden");
      } else {
        document.getElementById("sign-typed-domain-contract-row").classList.add("hidden");
      }
    }
    const messageEl = document.getElementById("sign-typed-message-content");
    const displayData = {
      primaryType: typedData.primaryType || "Unknown",
      message: typedData.message
    };
    messageEl.textContent = JSON.stringify(displayData, null, 2);
    showScreen("screen-sign-typed-data");
    document.getElementById("btn-approve-sign-typed").addEventListener("click", async () => {
      const approveBtn = document.getElementById("btn-approve-sign-typed");
      const password = document.getElementById("sign-typed-password").value;
      const errorEl = document.getElementById("sign-typed-error");
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
        const response2 = await chrome.runtime.sendMessage({
          type: "SIGN_APPROVAL",
          requestId,
          approved: true,
          sessionToken: tempSessionResponse.sessionToken
        });
        if (response2.success) {
          window.close();
        } else {
          errorEl.textContent = response2.error || "Signing failed";
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
    document.getElementById("btn-reject-sign-typed").addEventListener("click", async () => {
      try {
        await chrome.runtime.sendMessage({
          type: "SIGN_APPROVAL",
          requestId,
          approved: false
        });
        window.close();
      } catch (error) {
        alert("Error rejecting sign request: " + error.message);
        window.close();
      }
    });
  } catch (error) {
    alert("Error loading typed data sign request: " + sanitizeError(error.message));
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


//# sourceMappingURL=data:application/json;base64,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QSxFQUNWO0FBQUEsRUFBRztBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWDtBQUFBLEVBQUc7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1g7QUFBQSxFQUFHO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNYO0FBQUEsRUFBRztBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWDtBQUFBLEVBQUc7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1g7QUFBQSxFQUFHO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNYO0FBQUEsRUFBRztBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWDtBQUFBLEVBQUc7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1g7QUFBQSxFQUFHO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNYO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUNkO0FBRUEsTUFBTSxxQkFBcUI7QUFBQTtBQUFBLEVBRXpCO0FBQUEsRUFBRztBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWDtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFLO0FBQUEsRUFDYjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSztBQUFBLEVBQ2I7QUFBQSxFQUFJO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNkO0FBQUEsRUFBSTtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZDtBQUFBLEVBQUk7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Q7QUFBQSxFQUFJO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNkO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNmO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNmO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNmO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNmO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUNoQjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQ2hCO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFDaEI7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUNoQjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQ2hCO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFDaEI7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUNoQjtBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQ2pCO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFDakI7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUNqQjtBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQ2pCO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFDakI7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUNqQjtBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUNuQjtBQVVBLHFDQUF5QixTQUFT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QVEsT0FBTyxLQUFLO0FBQzdCO0FBRUEsU0FBUyxlQUFlLFNBQVM7QUFDL0IsUUFBTSxRQUFRO0FBQUEsSUFDWixjQUFjO0FBQUEsSUFDZCxxQkFBcUI7QUFBQSxJQUNyQixZQUFZO0FBQUEsSUFDWixXQUFXO0FBQUEsRUFDZjtBQUNFLFNBQU8sTUFBTSxPQUFPLEtBQUs7QUFDM0I7QUFHQSxlQUFlLG9CQUFvQjtBQUNqQyxNQUFJO0FBQ0YsVUFBTSxVQUFVLFVBQVUsVUFBVSxhQUFhLE9BQU87QUFDeEQsVUFBTSxNQUFNLFNBQVMsZUFBZSxrQkFBa0I7QUFDdEQsVUFBTSxlQUFlLElBQUk7QUFDekIsUUFBSSxjQUFjO0FBQ2xCLGVBQVcsTUFBTTtBQUNmLFVBQUksY0FBYztBQUFBLElBQ3BCLEdBQUcsR0FBSTtBQUFBLEVBQ1QsU0FBUyxPQUFPO0FBQ2QsVUFBTSx3QkFBd0I7QUFBQSxFQUNoQztBQUNGIiwibmFtZXMiOlsiY2FuUHJvbWlzZSIsInV0aWxzIiwidmVyc2lvbiIsImthbmppIiwiaXNWYWxpZCIsIkJpdEJ1ZmZlciIsIkJpdE1hdHJpeCIsImdldFN5bWJvbFNpemUiLCJyZXF1aXJlJCQwIiwiZ2V0UG9zaXRpb25zIiwibWFza1BhdHRlcm4iLCJFQ0xldmVsIiwiZXJyb3JDb3JyZWN0aW9uTGV2ZWwiLCJtdWwiLCJSZWVkU29sb21vbkVuY29kZXIiLCJyZXF1aXJlJCQxIiwibW9kZSIsIlV0aWxzIiwiRUNDb2RlIiwicmVxdWlyZSQkMiIsIk1vZGUiLCJyZXF1aXJlJCQzIiwicmVxdWlyZSQkNCIsInNlZ21lbnRzIiwiZ2V0RW5jb2RlZEJpdHMiLCJnZXRCaXRzTGVuZ3RoIiwiYml0QnVmZmVyIiwiZ2V0TGVuZ3RoIiwid3JpdGUiLCJkaWprc3RyYSIsIk51bWVyaWNEYXRhIiwiQWxwaGFudW1lcmljRGF0YSIsIkJ5dGVEYXRhIiwiS2FuamlEYXRhIiwicmVxdWlyZSQkNSIsInJlcXVpcmUkJDYiLCJyZXF1aXJlJCQ3IiwicmVnZXgiLCJyZXF1aXJlJCQ4IiwicmVxdWlyZSQkOSIsInJlcXVpcmUkJDEwIiwicmVxdWlyZSQkMTEiLCJyZXF1aXJlJCQxMiIsImNhbnZhcyIsInJlbmRlciIsInN2Z1RhZyIsImV0aGVycy5Db250cmFjdCIsImV0aGVycy5mb3JtYXRVbml0cyIsImV0aGVycy5wYXJzZVVuaXRzIiwiZXRoZXJzLmlzQWRkcmVzcyIsInRva2VucyIsInBsc1Jlc2VydmUiLCJzY3JlZW4iLCJfYSIsIndhbGxldCIsImV0aGVycyIsInJwYy5nZXRCYWxhbmNlIiwicnBjLmZvcm1hdEJhbGFuY2UiLCJldGhlcnMucGFyc2VFdGhlciIsInJwYy5nZXRQcm92aWRlciIsInRva2Vucy5nZXRBbGxUb2tlbnMiLCJlcmMyMC5nZXRUb2tlbkJhbGFuY2UiLCJlcmMyMC5mb3JtYXRUb2tlbkJhbGFuY2UiLCJlcmMyMC5wYXJzZVRva2VuQW1vdW50IiwiZXJjMjAudHJhbnNmZXJUb2tlbiIsIlFSQ29kZSIsInRva2Vucy5ERUZBVUxUX1RPS0VOUyIsInRva2Vucy5nZXRFbmFibGVkRGVmYXVsdFRva2VucyIsInRva2Vucy5nZXRDdXN0b21Ub2tlbnMiLCJ0b2tlbnMucmVtb3ZlQ3VzdG9tVG9rZW4iLCJldGhlcnMuV2FsbGV0IiwidG9rZW5zLnRvZ2dsZURlZmF1bHRUb2tlbiIsImVyYzIwLmdldFRva2VuTWV0YWRhdGEiLCJ0b2tlbnMuYWRkQ3VzdG9tVG9rZW4iLCJycGMuZ2V0R2FzUHJpY2UiLCJycGMuZXN0aW1hdGVHYXMiLCJldGhlcnMuZm9ybWF0RXRoZXIiLCJycGMuZ2V0VHJhbnNhY3Rpb25Db3VudCIsInJlc3BvbnNlIiwiZXRoZXJzLmdldEJ5dGVzIiwiZXRoZXJzLnRvVXRmOFN0cmluZyJdLCJpZ25vcmVMaXN0IjpbMCwxLDIsMyw0LDUsNiw3LDgsOSwxMCwxMSwxMiwxMywxNCwxNSwxNiwxNywxOCwxOSwyMCwyMSwyMiwyMywyNCwyNSwyNiwyN10sInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY2FuLXByb21pc2UuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL3V0aWxzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9lcnJvci1jb3JyZWN0aW9uLWxldmVsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9iaXQtYnVmZmVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9iaXQtbWF0cml4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9hbGlnbm1lbnQtcGF0dGVybi5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvZmluZGVyLXBhdHRlcm4uanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL21hc2stcGF0dGVybi5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvZXJyb3ItY29ycmVjdGlvbi1jb2RlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9nYWxvaXMtZmllbGQuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL3BvbHlub21pYWwuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL3JlZWQtc29sb21vbi1lbmNvZGVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS92ZXJzaW9uLWNoZWNrLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9yZWdleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvbW9kZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvdmVyc2lvbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvZm9ybWF0LWluZm8uanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL251bWVyaWMtZGF0YS5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYWxwaGFudW1lcmljLWRhdGEuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2J5dGUtZGF0YS5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUva2FuamktZGF0YS5qcyIsIi4uL25vZGVfbW9kdWxlcy9kaWprc3RyYWpzL2RpamtzdHJhLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9zZWdtZW50cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcXJjb2RlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvcmVuZGVyZXIvdXRpbHMuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9yZW5kZXJlci9jYW52YXMuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9yZW5kZXJlci9zdmctdGFnLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvYnJvd3Nlci5qcyIsIi4uL3NyYy9jb3JlL2VyYzIwLmpzIiwiLi4vc3JjL2NvcmUvdG9rZW5zLmpzIiwiLi4vc3JjL2NvcmUvcHJpY2VPcmFjbGUuanMiLCIuLi9zcmMvcG9wdXAvcG9wdXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gY2FuLXByb21pc2UgaGFzIGEgY3Jhc2ggaW4gc29tZSB2ZXJzaW9ucyBvZiByZWFjdCBuYXRpdmUgdGhhdCBkb250IGhhdmVcclxuLy8gc3RhbmRhcmQgZ2xvYmFsIG9iamVjdHNcclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3NvbGRhaXIvbm9kZS1xcmNvZGUvaXNzdWVzLzE1N1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgcmV0dXJuIHR5cGVvZiBQcm9taXNlID09PSAnZnVuY3Rpb24nICYmIFByb21pc2UucHJvdG90eXBlICYmIFByb21pc2UucHJvdG90eXBlLnRoZW5cclxufVxyXG4iLCJsZXQgdG9TSklTRnVuY3Rpb25cclxuY29uc3QgQ09ERVdPUkRTX0NPVU5UID0gW1xyXG4gIDAsIC8vIE5vdCB1c2VkXHJcbiAgMjYsIDQ0LCA3MCwgMTAwLCAxMzQsIDE3MiwgMTk2LCAyNDIsIDI5MiwgMzQ2LFxyXG4gIDQwNCwgNDY2LCA1MzIsIDU4MSwgNjU1LCA3MzMsIDgxNSwgOTAxLCA5OTEsIDEwODUsXHJcbiAgMTE1NiwgMTI1OCwgMTM2NCwgMTQ3NCwgMTU4OCwgMTcwNiwgMTgyOCwgMTkyMSwgMjA1MSwgMjE4NSxcclxuICAyMzIzLCAyNDY1LCAyNjExLCAyNzYxLCAyODc2LCAzMDM0LCAzMTk2LCAzMzYyLCAzNTMyLCAzNzA2XHJcbl1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBRUiBDb2RlIHNpemUgZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvblxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICBzaXplIG9mIFFSIGNvZGVcclxuICovXHJcbmV4cG9ydHMuZ2V0U3ltYm9sU2l6ZSA9IGZ1bmN0aW9uIGdldFN5bWJvbFNpemUgKHZlcnNpb24pIHtcclxuICBpZiAoIXZlcnNpb24pIHRocm93IG5ldyBFcnJvcignXCJ2ZXJzaW9uXCIgY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJylcclxuICBpZiAodmVyc2lvbiA8IDEgfHwgdmVyc2lvbiA+IDQwKSB0aHJvdyBuZXcgRXJyb3IoJ1widmVyc2lvblwiIHNob3VsZCBiZSBpbiByYW5nZSBmcm9tIDEgdG8gNDAnKVxyXG4gIHJldHVybiB2ZXJzaW9uICogNCArIDE3XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSB0b3RhbCBudW1iZXIgb2YgY29kZXdvcmRzIHVzZWQgdG8gc3RvcmUgZGF0YSBhbmQgRUMgaW5mb3JtYXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgIERhdGEgbGVuZ3RoIGluIGJpdHNcclxuICovXHJcbmV4cG9ydHMuZ2V0U3ltYm9sVG90YWxDb2Rld29yZHMgPSBmdW5jdGlvbiBnZXRTeW1ib2xUb3RhbENvZGV3b3JkcyAodmVyc2lvbikge1xyXG4gIHJldHVybiBDT0RFV09SRFNfQ09VTlRbdmVyc2lvbl1cclxufVxyXG5cclxuLyoqXHJcbiAqIEVuY29kZSBkYXRhIHdpdGggQm9zZS1DaGF1ZGh1cmktSG9jcXVlbmdoZW1cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSBkYXRhIFZhbHVlIHRvIGVuY29kZVxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgRW5jb2RlZCB2YWx1ZVxyXG4gKi9cclxuZXhwb3J0cy5nZXRCQ0hEaWdpdCA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgbGV0IGRpZ2l0ID0gMFxyXG5cclxuICB3aGlsZSAoZGF0YSAhPT0gMCkge1xyXG4gICAgZGlnaXQrK1xyXG4gICAgZGF0YSA+Pj49IDFcclxuICB9XHJcblxyXG4gIHJldHVybiBkaWdpdFxyXG59XHJcblxyXG5leHBvcnRzLnNldFRvU0pJU0Z1bmN0aW9uID0gZnVuY3Rpb24gc2V0VG9TSklTRnVuY3Rpb24gKGYpIHtcclxuICBpZiAodHlwZW9mIGYgIT09ICdmdW5jdGlvbicpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignXCJ0b1NKSVNGdW5jXCIgaXMgbm90IGEgdmFsaWQgZnVuY3Rpb24uJylcclxuICB9XHJcblxyXG4gIHRvU0pJU0Z1bmN0aW9uID0gZlxyXG59XHJcblxyXG5leHBvcnRzLmlzS2FuamlNb2RlRW5hYmxlZCA9IGZ1bmN0aW9uICgpIHtcclxuICByZXR1cm4gdHlwZW9mIHRvU0pJU0Z1bmN0aW9uICE9PSAndW5kZWZpbmVkJ1xyXG59XHJcblxyXG5leHBvcnRzLnRvU0pJUyA9IGZ1bmN0aW9uIHRvU0pJUyAoa2FuamkpIHtcclxuICByZXR1cm4gdG9TSklTRnVuY3Rpb24oa2FuamkpXHJcbn1cclxuIiwiZXhwb3J0cy5MID0geyBiaXQ6IDEgfVxyXG5leHBvcnRzLk0gPSB7IGJpdDogMCB9XHJcbmV4cG9ydHMuUSA9IHsgYml0OiAzIH1cclxuZXhwb3J0cy5IID0geyBiaXQ6IDIgfVxyXG5cclxuZnVuY3Rpb24gZnJvbVN0cmluZyAoc3RyaW5nKSB7XHJcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcmFtIGlzIG5vdCBhIHN0cmluZycpXHJcbiAgfVxyXG5cclxuICBjb25zdCBsY1N0ciA9IHN0cmluZy50b0xvd2VyQ2FzZSgpXHJcblxyXG4gIHN3aXRjaCAobGNTdHIpIHtcclxuICAgIGNhc2UgJ2wnOlxyXG4gICAgY2FzZSAnbG93JzpcclxuICAgICAgcmV0dXJuIGV4cG9ydHMuTFxyXG5cclxuICAgIGNhc2UgJ20nOlxyXG4gICAgY2FzZSAnbWVkaXVtJzpcclxuICAgICAgcmV0dXJuIGV4cG9ydHMuTVxyXG5cclxuICAgIGNhc2UgJ3EnOlxyXG4gICAgY2FzZSAncXVhcnRpbGUnOlxyXG4gICAgICByZXR1cm4gZXhwb3J0cy5RXHJcblxyXG4gICAgY2FzZSAnaCc6XHJcbiAgICBjYXNlICdoaWdoJzpcclxuICAgICAgcmV0dXJuIGV4cG9ydHMuSFxyXG5cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBFQyBMZXZlbDogJyArIHN0cmluZylcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydHMuaXNWYWxpZCA9IGZ1bmN0aW9uIGlzVmFsaWQgKGxldmVsKSB7XHJcbiAgcmV0dXJuIGxldmVsICYmIHR5cGVvZiBsZXZlbC5iaXQgIT09ICd1bmRlZmluZWQnICYmXHJcbiAgICBsZXZlbC5iaXQgPj0gMCAmJiBsZXZlbC5iaXQgPCA0XHJcbn1cclxuXHJcbmV4cG9ydHMuZnJvbSA9IGZ1bmN0aW9uIGZyb20gKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHtcclxuICBpZiAoZXhwb3J0cy5pc1ZhbGlkKHZhbHVlKSkge1xyXG4gICAgcmV0dXJuIHZhbHVlXHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgcmV0dXJuIGZyb21TdHJpbmcodmFsdWUpXHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZVxyXG4gIH1cclxufVxyXG4iLCJmdW5jdGlvbiBCaXRCdWZmZXIgKCkge1xyXG4gIHRoaXMuYnVmZmVyID0gW11cclxuICB0aGlzLmxlbmd0aCA9IDBcclxufVxyXG5cclxuQml0QnVmZmVyLnByb3RvdHlwZSA9IHtcclxuXHJcbiAgZ2V0OiBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgIGNvbnN0IGJ1ZkluZGV4ID0gTWF0aC5mbG9vcihpbmRleCAvIDgpXHJcbiAgICByZXR1cm4gKCh0aGlzLmJ1ZmZlcltidWZJbmRleF0gPj4+ICg3IC0gaW5kZXggJSA4KSkgJiAxKSA9PT0gMVxyXG4gIH0sXHJcblxyXG4gIHB1dDogZnVuY3Rpb24gKG51bSwgbGVuZ3RoKSB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHRoaXMucHV0Qml0KCgobnVtID4+PiAobGVuZ3RoIC0gaSAtIDEpKSAmIDEpID09PSAxKVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGdldExlbmd0aEluQml0czogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubGVuZ3RoXHJcbiAgfSxcclxuXHJcbiAgcHV0Qml0OiBmdW5jdGlvbiAoYml0KSB7XHJcbiAgICBjb25zdCBidWZJbmRleCA9IE1hdGguZmxvb3IodGhpcy5sZW5ndGggLyA4KVxyXG4gICAgaWYgKHRoaXMuYnVmZmVyLmxlbmd0aCA8PSBidWZJbmRleCkge1xyXG4gICAgICB0aGlzLmJ1ZmZlci5wdXNoKDApXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJpdCkge1xyXG4gICAgICB0aGlzLmJ1ZmZlcltidWZJbmRleF0gfD0gKDB4ODAgPj4+ICh0aGlzLmxlbmd0aCAlIDgpKVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubGVuZ3RoKytcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQml0QnVmZmVyXHJcbiIsIi8qKlxyXG4gKiBIZWxwZXIgY2xhc3MgdG8gaGFuZGxlIFFSIENvZGUgc3ltYm9sIG1vZHVsZXNcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9IHNpemUgU3ltYm9sIHNpemVcclxuICovXHJcbmZ1bmN0aW9uIEJpdE1hdHJpeCAoc2l6ZSkge1xyXG4gIGlmICghc2l6ZSB8fCBzaXplIDwgMSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdCaXRNYXRyaXggc2l6ZSBtdXN0IGJlIGRlZmluZWQgYW5kIGdyZWF0ZXIgdGhhbiAwJylcclxuICB9XHJcblxyXG4gIHRoaXMuc2l6ZSA9IHNpemVcclxuICB0aGlzLmRhdGEgPSBuZXcgVWludDhBcnJheShzaXplICogc2l6ZSlcclxuICB0aGlzLnJlc2VydmVkQml0ID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZSAqIHNpemUpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXQgYml0IHZhbHVlIGF0IHNwZWNpZmllZCBsb2NhdGlvblxyXG4gKiBJZiByZXNlcnZlZCBmbGFnIGlzIHNldCwgdGhpcyBiaXQgd2lsbCBiZSBpZ25vcmVkIGR1cmluZyBtYXNraW5nIHByb2Nlc3NcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9ICByb3dcclxuICogQHBhcmFtIHtOdW1iZXJ9ICBjb2xcclxuICogQHBhcmFtIHtCb29sZWFufSB2YWx1ZVxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHJlc2VydmVkXHJcbiAqL1xyXG5CaXRNYXRyaXgucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChyb3csIGNvbCwgdmFsdWUsIHJlc2VydmVkKSB7XHJcbiAgY29uc3QgaW5kZXggPSByb3cgKiB0aGlzLnNpemUgKyBjb2xcclxuICB0aGlzLmRhdGFbaW5kZXhdID0gdmFsdWVcclxuICBpZiAocmVzZXJ2ZWQpIHRoaXMucmVzZXJ2ZWRCaXRbaW5kZXhdID0gdHJ1ZVxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBiaXQgdmFsdWUgYXQgc3BlY2lmaWVkIGxvY2F0aW9uXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gIHJvd1xyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICBjb2xcclxuICogQHJldHVybiB7Qm9vbGVhbn1cclxuICovXHJcbkJpdE1hdHJpeC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XHJcbiAgcmV0dXJuIHRoaXMuZGF0YVtyb3cgKiB0aGlzLnNpemUgKyBjb2xdXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBcHBsaWVzIHhvciBvcGVyYXRvciBhdCBzcGVjaWZpZWQgbG9jYXRpb25cclxuICogKHVzZWQgZHVyaW5nIG1hc2tpbmcgcHJvY2VzcylcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9ICByb3dcclxuICogQHBhcmFtIHtOdW1iZXJ9ICBjb2xcclxuICogQHBhcmFtIHtCb29sZWFufSB2YWx1ZVxyXG4gKi9cclxuQml0TWF0cml4LnByb3RvdHlwZS54b3IgPSBmdW5jdGlvbiAocm93LCBjb2wsIHZhbHVlKSB7XHJcbiAgdGhpcy5kYXRhW3JvdyAqIHRoaXMuc2l6ZSArIGNvbF0gXj0gdmFsdWVcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrIGlmIGJpdCBhdCBzcGVjaWZpZWQgbG9jYXRpb24gaXMgcmVzZXJ2ZWRcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9ICAgcm93XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSAgIGNvbFxyXG4gKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gKi9cclxuQml0TWF0cml4LnByb3RvdHlwZS5pc1Jlc2VydmVkID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XHJcbiAgcmV0dXJuIHRoaXMucmVzZXJ2ZWRCaXRbcm93ICogdGhpcy5zaXplICsgY29sXVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJpdE1hdHJpeFxyXG4iLCIvKipcclxuICogQWxpZ25tZW50IHBhdHRlcm4gYXJlIGZpeGVkIHJlZmVyZW5jZSBwYXR0ZXJuIGluIGRlZmluZWQgcG9zaXRpb25zXHJcbiAqIGluIGEgbWF0cml4IHN5bWJvbG9neSwgd2hpY2ggZW5hYmxlcyB0aGUgZGVjb2RlIHNvZnR3YXJlIHRvIHJlLXN5bmNocm9uaXNlXHJcbiAqIHRoZSBjb29yZGluYXRlIG1hcHBpbmcgb2YgdGhlIGltYWdlIG1vZHVsZXMgaW4gdGhlIGV2ZW50IG9mIG1vZGVyYXRlIGFtb3VudHNcclxuICogb2YgZGlzdG9ydGlvbiBvZiB0aGUgaW1hZ2UuXHJcbiAqXHJcbiAqIEFsaWdubWVudCBwYXR0ZXJucyBhcmUgcHJlc2VudCBvbmx5IGluIFFSIENvZGUgc3ltYm9scyBvZiB2ZXJzaW9uIDIgb3IgbGFyZ2VyXHJcbiAqIGFuZCB0aGVpciBudW1iZXIgZGVwZW5kcyBvbiB0aGUgc3ltYm9sIHZlcnNpb24uXHJcbiAqL1xyXG5cclxuY29uc3QgZ2V0U3ltYm9sU2l6ZSA9IHJlcXVpcmUoJy4vdXRpbHMnKS5nZXRTeW1ib2xTaXplXHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlIHRoZSByb3cvY29sdW1uIGNvb3JkaW5hdGVzIG9mIHRoZSBjZW50ZXIgbW9kdWxlIG9mIGVhY2ggYWxpZ25tZW50IHBhdHRlcm5cclxuICogZm9yIHRoZSBzcGVjaWZpZWQgUVIgQ29kZSB2ZXJzaW9uLlxyXG4gKlxyXG4gKiBUaGUgYWxpZ25tZW50IHBhdHRlcm5zIGFyZSBwb3NpdGlvbmVkIHN5bW1ldHJpY2FsbHkgb24gZWl0aGVyIHNpZGUgb2YgdGhlIGRpYWdvbmFsXHJcbiAqIHJ1bm5pbmcgZnJvbSB0aGUgdG9wIGxlZnQgY29ybmVyIG9mIHRoZSBzeW1ib2wgdG8gdGhlIGJvdHRvbSByaWdodCBjb3JuZXIuXHJcbiAqXHJcbiAqIFNpbmNlIHBvc2l0aW9ucyBhcmUgc2ltbWV0cmljYWwgb25seSBoYWxmIG9mIHRoZSBjb29yZGluYXRlcyBhcmUgcmV0dXJuZWQuXHJcbiAqIEVhY2ggaXRlbSBvZiB0aGUgYXJyYXkgd2lsbCByZXByZXNlbnQgaW4gdHVybiB0aGUgeCBhbmQgeSBjb29yZGluYXRlLlxyXG4gKiBAc2VlIHtAbGluayBnZXRQb3NpdGlvbnN9XHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cclxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIGNvb3JkaW5hdGVcclxuICovXHJcbmV4cG9ydHMuZ2V0Um93Q29sQ29vcmRzID0gZnVuY3Rpb24gZ2V0Um93Q29sQ29vcmRzICh2ZXJzaW9uKSB7XHJcbiAgaWYgKHZlcnNpb24gPT09IDEpIHJldHVybiBbXVxyXG5cclxuICBjb25zdCBwb3NDb3VudCA9IE1hdGguZmxvb3IodmVyc2lvbiAvIDcpICsgMlxyXG4gIGNvbnN0IHNpemUgPSBnZXRTeW1ib2xTaXplKHZlcnNpb24pXHJcbiAgY29uc3QgaW50ZXJ2YWxzID0gc2l6ZSA9PT0gMTQ1ID8gMjYgOiBNYXRoLmNlaWwoKHNpemUgLSAxMykgLyAoMiAqIHBvc0NvdW50IC0gMikpICogMlxyXG4gIGNvbnN0IHBvc2l0aW9ucyA9IFtzaXplIC0gN10gLy8gTGFzdCBjb29yZCBpcyBhbHdheXMgKHNpemUgLSA3KVxyXG5cclxuICBmb3IgKGxldCBpID0gMTsgaSA8IHBvc0NvdW50IC0gMTsgaSsrKSB7XHJcbiAgICBwb3NpdGlvbnNbaV0gPSBwb3NpdGlvbnNbaSAtIDFdIC0gaW50ZXJ2YWxzXHJcbiAgfVxyXG5cclxuICBwb3NpdGlvbnMucHVzaCg2KSAvLyBGaXJzdCBjb29yZCBpcyBhbHdheXMgNlxyXG5cclxuICByZXR1cm4gcG9zaXRpb25zLnJldmVyc2UoKVxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBwb3NpdGlvbnMgb2YgZWFjaCBhbGlnbm1lbnQgcGF0dGVybi5cclxuICogRWFjaCBhcnJheSdzIGVsZW1lbnQgcmVwcmVzZW50IHRoZSBjZW50ZXIgcG9pbnQgb2YgdGhlIHBhdHRlcm4gYXMgKHgsIHkpIGNvb3JkaW5hdGVzXHJcbiAqXHJcbiAqIENvb3JkaW5hdGVzIGFyZSBjYWxjdWxhdGVkIGV4cGFuZGluZyB0aGUgcm93L2NvbHVtbiBjb29yZGluYXRlcyByZXR1cm5lZCBieSB7QGxpbmsgZ2V0Um93Q29sQ29vcmRzfVxyXG4gKiBhbmQgZmlsdGVyaW5nIG91dCB0aGUgaXRlbXMgdGhhdCBvdmVybGFwcyB3aXRoIGZpbmRlciBwYXR0ZXJuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIEZvciBhIFZlcnNpb24gNyBzeW1ib2wge0BsaW5rIGdldFJvd0NvbENvb3Jkc30gcmV0dXJucyB2YWx1ZXMgNiwgMjIgYW5kIDM4LlxyXG4gKiBUaGUgYWxpZ25tZW50IHBhdHRlcm5zLCB0aGVyZWZvcmUsIGFyZSB0byBiZSBjZW50ZXJlZCBvbiAocm93LCBjb2x1bW4pXHJcbiAqIHBvc2l0aW9ucyAoNiwyMiksICgyMiw2KSwgKDIyLDIyKSwgKDIyLDM4KSwgKDM4LDIyKSwgKDM4LDM4KS5cclxuICogTm90ZSB0aGF0IHRoZSBjb29yZGluYXRlcyAoNiw2KSwgKDYsMzgpLCAoMzgsNikgYXJlIG9jY3VwaWVkIGJ5IGZpbmRlciBwYXR0ZXJuc1xyXG4gKiBhbmQgYXJlIG5vdCB0aGVyZWZvcmUgdXNlZCBmb3IgYWxpZ25tZW50IHBhdHRlcm5zLlxyXG4gKlxyXG4gKiBsZXQgcG9zID0gZ2V0UG9zaXRpb25zKDcpXHJcbiAqIC8vIFtbNiwyMl0sIFsyMiw2XSwgWzIyLDIyXSwgWzIyLDM4XSwgWzM4LDIyXSwgWzM4LDM4XV1cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgQXJyYXkgb2YgY29vcmRpbmF0ZXNcclxuICovXHJcbmV4cG9ydHMuZ2V0UG9zaXRpb25zID0gZnVuY3Rpb24gZ2V0UG9zaXRpb25zICh2ZXJzaW9uKSB7XHJcbiAgY29uc3QgY29vcmRzID0gW11cclxuICBjb25zdCBwb3MgPSBleHBvcnRzLmdldFJvd0NvbENvb3Jkcyh2ZXJzaW9uKVxyXG4gIGNvbnN0IHBvc0xlbmd0aCA9IHBvcy5sZW5ndGhcclxuXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3NMZW5ndGg7IGkrKykge1xyXG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NMZW5ndGg7IGorKykge1xyXG4gICAgICAvLyBTa2lwIGlmIHBvc2l0aW9uIGlzIG9jY3VwaWVkIGJ5IGZpbmRlciBwYXR0ZXJuc1xyXG4gICAgICBpZiAoKGkgPT09IDAgJiYgaiA9PT0gMCkgfHwgLy8gdG9wLWxlZnRcclxuICAgICAgICAgIChpID09PSAwICYmIGogPT09IHBvc0xlbmd0aCAtIDEpIHx8IC8vIGJvdHRvbS1sZWZ0XHJcbiAgICAgICAgICAoaSA9PT0gcG9zTGVuZ3RoIC0gMSAmJiBqID09PSAwKSkgeyAvLyB0b3AtcmlnaHRcclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb29yZHMucHVzaChbcG9zW2ldLCBwb3Nbal1dKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGNvb3Jkc1xyXG59XHJcbiIsImNvbnN0IGdldFN5bWJvbFNpemUgPSByZXF1aXJlKCcuL3V0aWxzJykuZ2V0U3ltYm9sU2l6ZVxyXG5jb25zdCBGSU5ERVJfUEFUVEVSTl9TSVpFID0gN1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgcG9zaXRpb25zIG9mIGVhY2ggZmluZGVyIHBhdHRlcm4uXHJcbiAqIEVhY2ggYXJyYXkncyBlbGVtZW50IHJlcHJlc2VudCB0aGUgdG9wLWxlZnQgcG9pbnQgb2YgdGhlIHBhdHRlcm4gYXMgKHgsIHkpIGNvb3JkaW5hdGVzXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cclxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIGNvb3JkaW5hdGVzXHJcbiAqL1xyXG5leHBvcnRzLmdldFBvc2l0aW9ucyA9IGZ1bmN0aW9uIGdldFBvc2l0aW9ucyAodmVyc2lvbikge1xyXG4gIGNvbnN0IHNpemUgPSBnZXRTeW1ib2xTaXplKHZlcnNpb24pXHJcblxyXG4gIHJldHVybiBbXHJcbiAgICAvLyB0b3AtbGVmdFxyXG4gICAgWzAsIDBdLFxyXG4gICAgLy8gdG9wLXJpZ2h0XHJcbiAgICBbc2l6ZSAtIEZJTkRFUl9QQVRURVJOX1NJWkUsIDBdLFxyXG4gICAgLy8gYm90dG9tLWxlZnRcclxuICAgIFswLCBzaXplIC0gRklOREVSX1BBVFRFUk5fU0laRV1cclxuICBdXHJcbn1cclxuIiwiLyoqXHJcbiAqIERhdGEgbWFzayBwYXR0ZXJuIHJlZmVyZW5jZVxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0cy5QYXR0ZXJucyA9IHtcclxuICBQQVRURVJOMDAwOiAwLFxyXG4gIFBBVFRFUk4wMDE6IDEsXHJcbiAgUEFUVEVSTjAxMDogMixcclxuICBQQVRURVJOMDExOiAzLFxyXG4gIFBBVFRFUk4xMDA6IDQsXHJcbiAgUEFUVEVSTjEwMTogNSxcclxuICBQQVRURVJOMTEwOiA2LFxyXG4gIFBBVFRFUk4xMTE6IDdcclxufVxyXG5cclxuLyoqXHJcbiAqIFdlaWdodGVkIHBlbmFsdHkgc2NvcmVzIGZvciB0aGUgdW5kZXNpcmFibGUgZmVhdHVyZXNcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbmNvbnN0IFBlbmFsdHlTY29yZXMgPSB7XHJcbiAgTjE6IDMsXHJcbiAgTjI6IDMsXHJcbiAgTjM6IDQwLFxyXG4gIE40OiAxMFxyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2sgaWYgbWFzayBwYXR0ZXJuIHZhbHVlIGlzIHZhbGlkXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gIG1hc2sgICAgTWFzayBwYXR0ZXJuXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgdHJ1ZSBpZiB2YWxpZCwgZmFsc2Ugb3RoZXJ3aXNlXHJcbiAqL1xyXG5leHBvcnRzLmlzVmFsaWQgPSBmdW5jdGlvbiBpc1ZhbGlkIChtYXNrKSB7XHJcbiAgcmV0dXJuIG1hc2sgIT0gbnVsbCAmJiBtYXNrICE9PSAnJyAmJiAhaXNOYU4obWFzaykgJiYgbWFzayA+PSAwICYmIG1hc2sgPD0gN1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBtYXNrIHBhdHRlcm4gZnJvbSBhIHZhbHVlLlxyXG4gKiBJZiB2YWx1ZSBpcyBub3QgdmFsaWQsIHJldHVybnMgdW5kZWZpbmVkXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcnxTdHJpbmd9IHZhbHVlICAgICAgICBNYXNrIHBhdHRlcm4gdmFsdWVcclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgIFZhbGlkIG1hc2sgcGF0dGVybiBvciB1bmRlZmluZWRcclxuICovXHJcbmV4cG9ydHMuZnJvbSA9IGZ1bmN0aW9uIGZyb20gKHZhbHVlKSB7XHJcbiAgcmV0dXJuIGV4cG9ydHMuaXNWYWxpZCh2YWx1ZSkgPyBwYXJzZUludCh2YWx1ZSwgMTApIDogdW5kZWZpbmVkXHJcbn1cclxuXHJcbi8qKlxyXG4qIEZpbmQgYWRqYWNlbnQgbW9kdWxlcyBpbiByb3cvY29sdW1uIHdpdGggdGhlIHNhbWUgY29sb3JcclxuKiBhbmQgYXNzaWduIGEgcGVuYWx0eSB2YWx1ZS5cclxuKlxyXG4qIFBvaW50czogTjEgKyBpXHJcbiogaSBpcyB0aGUgYW1vdW50IGJ5IHdoaWNoIHRoZSBudW1iZXIgb2YgYWRqYWNlbnQgbW9kdWxlcyBvZiB0aGUgc2FtZSBjb2xvciBleGNlZWRzIDVcclxuKi9cclxuZXhwb3J0cy5nZXRQZW5hbHR5TjEgPSBmdW5jdGlvbiBnZXRQZW5hbHR5TjEgKGRhdGEpIHtcclxuICBjb25zdCBzaXplID0gZGF0YS5zaXplXHJcbiAgbGV0IHBvaW50cyA9IDBcclxuICBsZXQgc2FtZUNvdW50Q29sID0gMFxyXG4gIGxldCBzYW1lQ291bnRSb3cgPSAwXHJcbiAgbGV0IGxhc3RDb2wgPSBudWxsXHJcbiAgbGV0IGxhc3RSb3cgPSBudWxsXHJcblxyXG4gIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHNpemU7IHJvdysrKSB7XHJcbiAgICBzYW1lQ291bnRDb2wgPSBzYW1lQ291bnRSb3cgPSAwXHJcbiAgICBsYXN0Q29sID0gbGFzdFJvdyA9IG51bGxcclxuXHJcbiAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBzaXplOyBjb2wrKykge1xyXG4gICAgICBsZXQgbW9kdWxlID0gZGF0YS5nZXQocm93LCBjb2wpXHJcbiAgICAgIGlmIChtb2R1bGUgPT09IGxhc3RDb2wpIHtcclxuICAgICAgICBzYW1lQ291bnRDb2wrK1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChzYW1lQ291bnRDb2wgPj0gNSkgcG9pbnRzICs9IFBlbmFsdHlTY29yZXMuTjEgKyAoc2FtZUNvdW50Q29sIC0gNSlcclxuICAgICAgICBsYXN0Q29sID0gbW9kdWxlXHJcbiAgICAgICAgc2FtZUNvdW50Q29sID0gMVxyXG4gICAgICB9XHJcblxyXG4gICAgICBtb2R1bGUgPSBkYXRhLmdldChjb2wsIHJvdylcclxuICAgICAgaWYgKG1vZHVsZSA9PT0gbGFzdFJvdykge1xyXG4gICAgICAgIHNhbWVDb3VudFJvdysrXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKHNhbWVDb3VudFJvdyA+PSA1KSBwb2ludHMgKz0gUGVuYWx0eVNjb3Jlcy5OMSArIChzYW1lQ291bnRSb3cgLSA1KVxyXG4gICAgICAgIGxhc3RSb3cgPSBtb2R1bGVcclxuICAgICAgICBzYW1lQ291bnRSb3cgPSAxXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2FtZUNvdW50Q29sID49IDUpIHBvaW50cyArPSBQZW5hbHR5U2NvcmVzLk4xICsgKHNhbWVDb3VudENvbCAtIDUpXHJcbiAgICBpZiAoc2FtZUNvdW50Um93ID49IDUpIHBvaW50cyArPSBQZW5hbHR5U2NvcmVzLk4xICsgKHNhbWVDb3VudFJvdyAtIDUpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gcG9pbnRzXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGaW5kIDJ4MiBibG9ja3Mgd2l0aCB0aGUgc2FtZSBjb2xvciBhbmQgYXNzaWduIGEgcGVuYWx0eSB2YWx1ZVxyXG4gKlxyXG4gKiBQb2ludHM6IE4yICogKG0gLSAxKSAqIChuIC0gMSlcclxuICovXHJcbmV4cG9ydHMuZ2V0UGVuYWx0eU4yID0gZnVuY3Rpb24gZ2V0UGVuYWx0eU4yIChkYXRhKSB7XHJcbiAgY29uc3Qgc2l6ZSA9IGRhdGEuc2l6ZVxyXG4gIGxldCBwb2ludHMgPSAwXHJcblxyXG4gIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHNpemUgLSAxOyByb3crKykge1xyXG4gICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgc2l6ZSAtIDE7IGNvbCsrKSB7XHJcbiAgICAgIGNvbnN0IGxhc3QgPSBkYXRhLmdldChyb3csIGNvbCkgK1xyXG4gICAgICAgIGRhdGEuZ2V0KHJvdywgY29sICsgMSkgK1xyXG4gICAgICAgIGRhdGEuZ2V0KHJvdyArIDEsIGNvbCkgK1xyXG4gICAgICAgIGRhdGEuZ2V0KHJvdyArIDEsIGNvbCArIDEpXHJcblxyXG4gICAgICBpZiAobGFzdCA9PT0gNCB8fCBsYXN0ID09PSAwKSBwb2ludHMrK1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHBvaW50cyAqIFBlbmFsdHlTY29yZXMuTjJcclxufVxyXG5cclxuLyoqXHJcbiAqIEZpbmQgMToxOjM6MToxIHJhdGlvIChkYXJrOmxpZ2h0OmRhcms6bGlnaHQ6ZGFyaykgcGF0dGVybiBpbiByb3cvY29sdW1uLFxyXG4gKiBwcmVjZWRlZCBvciBmb2xsb3dlZCBieSBsaWdodCBhcmVhIDQgbW9kdWxlcyB3aWRlXHJcbiAqXHJcbiAqIFBvaW50czogTjMgKiBudW1iZXIgb2YgcGF0dGVybiBmb3VuZFxyXG4gKi9cclxuZXhwb3J0cy5nZXRQZW5hbHR5TjMgPSBmdW5jdGlvbiBnZXRQZW5hbHR5TjMgKGRhdGEpIHtcclxuICBjb25zdCBzaXplID0gZGF0YS5zaXplXHJcbiAgbGV0IHBvaW50cyA9IDBcclxuICBsZXQgYml0c0NvbCA9IDBcclxuICBsZXQgYml0c1JvdyA9IDBcclxuXHJcbiAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgc2l6ZTsgcm93KyspIHtcclxuICAgIGJpdHNDb2wgPSBiaXRzUm93ID0gMFxyXG4gICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgc2l6ZTsgY29sKyspIHtcclxuICAgICAgYml0c0NvbCA9ICgoYml0c0NvbCA8PCAxKSAmIDB4N0ZGKSB8IGRhdGEuZ2V0KHJvdywgY29sKVxyXG4gICAgICBpZiAoY29sID49IDEwICYmIChiaXRzQ29sID09PSAweDVEMCB8fCBiaXRzQ29sID09PSAweDA1RCkpIHBvaW50cysrXHJcblxyXG4gICAgICBiaXRzUm93ID0gKChiaXRzUm93IDw8IDEpICYgMHg3RkYpIHwgZGF0YS5nZXQoY29sLCByb3cpXHJcbiAgICAgIGlmIChjb2wgPj0gMTAgJiYgKGJpdHNSb3cgPT09IDB4NUQwIHx8IGJpdHNSb3cgPT09IDB4MDVEKSkgcG9pbnRzKytcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBwb2ludHMgKiBQZW5hbHR5U2NvcmVzLk4zXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGUgcHJvcG9ydGlvbiBvZiBkYXJrIG1vZHVsZXMgaW4gZW50aXJlIHN5bWJvbFxyXG4gKlxyXG4gKiBQb2ludHM6IE40ICoga1xyXG4gKlxyXG4gKiBrIGlzIHRoZSByYXRpbmcgb2YgdGhlIGRldmlhdGlvbiBvZiB0aGUgcHJvcG9ydGlvbiBvZiBkYXJrIG1vZHVsZXNcclxuICogaW4gdGhlIHN5bWJvbCBmcm9tIDUwJSBpbiBzdGVwcyBvZiA1JVxyXG4gKi9cclxuZXhwb3J0cy5nZXRQZW5hbHR5TjQgPSBmdW5jdGlvbiBnZXRQZW5hbHR5TjQgKGRhdGEpIHtcclxuICBsZXQgZGFya0NvdW50ID0gMFxyXG4gIGNvbnN0IG1vZHVsZXNDb3VudCA9IGRhdGEuZGF0YS5sZW5ndGhcclxuXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBtb2R1bGVzQ291bnQ7IGkrKykgZGFya0NvdW50ICs9IGRhdGEuZGF0YVtpXVxyXG5cclxuICBjb25zdCBrID0gTWF0aC5hYnMoTWF0aC5jZWlsKChkYXJrQ291bnQgKiAxMDAgLyBtb2R1bGVzQ291bnQpIC8gNSkgLSAxMClcclxuXHJcbiAgcmV0dXJuIGsgKiBQZW5hbHR5U2NvcmVzLk40XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm4gbWFzayB2YWx1ZSBhdCBnaXZlbiBwb3NpdGlvblxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG1hc2tQYXR0ZXJuIFBhdHRlcm4gcmVmZXJlbmNlIHZhbHVlXHJcbiAqIEBwYXJhbSAge051bWJlcn0gaSAgICAgICAgICAgUm93XHJcbiAqIEBwYXJhbSAge051bWJlcn0gaiAgICAgICAgICAgQ29sdW1uXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgICAgTWFzayB2YWx1ZVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0TWFza0F0IChtYXNrUGF0dGVybiwgaSwgaikge1xyXG4gIHN3aXRjaCAobWFza1BhdHRlcm4pIHtcclxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDAwOiByZXR1cm4gKGkgKyBqKSAlIDIgPT09IDBcclxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDAxOiByZXR1cm4gaSAlIDIgPT09IDBcclxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDEwOiByZXR1cm4gaiAlIDMgPT09IDBcclxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDExOiByZXR1cm4gKGkgKyBqKSAlIDMgPT09IDBcclxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMTAwOiByZXR1cm4gKE1hdGguZmxvb3IoaSAvIDIpICsgTWF0aC5mbG9vcihqIC8gMykpICUgMiA9PT0gMFxyXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4xMDE6IHJldHVybiAoaSAqIGopICUgMiArIChpICogaikgJSAzID09PSAwXHJcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjExMDogcmV0dXJuICgoaSAqIGopICUgMiArIChpICogaikgJSAzKSAlIDIgPT09IDBcclxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMTExOiByZXR1cm4gKChpICogaikgJSAzICsgKGkgKyBqKSAlIDIpICUgMiA9PT0gMFxyXG5cclxuICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcignYmFkIG1hc2tQYXR0ZXJuOicgKyBtYXNrUGF0dGVybilcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBcHBseSBhIG1hc2sgcGF0dGVybiB0byBhIEJpdE1hdHJpeFxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgIHBhdHRlcm4gUGF0dGVybiByZWZlcmVuY2UgbnVtYmVyXHJcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gZGF0YSAgICBCaXRNYXRyaXggZGF0YVxyXG4gKi9cclxuZXhwb3J0cy5hcHBseU1hc2sgPSBmdW5jdGlvbiBhcHBseU1hc2sgKHBhdHRlcm4sIGRhdGEpIHtcclxuICBjb25zdCBzaXplID0gZGF0YS5zaXplXHJcblxyXG4gIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IHNpemU7IGNvbCsrKSB7XHJcbiAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBzaXplOyByb3crKykge1xyXG4gICAgICBpZiAoZGF0YS5pc1Jlc2VydmVkKHJvdywgY29sKSkgY29udGludWVcclxuICAgICAgZGF0YS54b3Iocm93LCBjb2wsIGdldE1hc2tBdChwYXR0ZXJuLCByb3csIGNvbCkpXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgYmVzdCBtYXNrIHBhdHRlcm4gZm9yIGRhdGFcclxuICpcclxuICogQHBhcmFtICB7Qml0TWF0cml4fSBkYXRhXHJcbiAqIEByZXR1cm4ge051bWJlcn0gTWFzayBwYXR0ZXJuIHJlZmVyZW5jZSBudW1iZXJcclxuICovXHJcbmV4cG9ydHMuZ2V0QmVzdE1hc2sgPSBmdW5jdGlvbiBnZXRCZXN0TWFzayAoZGF0YSwgc2V0dXBGb3JtYXRGdW5jKSB7XHJcbiAgY29uc3QgbnVtUGF0dGVybnMgPSBPYmplY3Qua2V5cyhleHBvcnRzLlBhdHRlcm5zKS5sZW5ndGhcclxuICBsZXQgYmVzdFBhdHRlcm4gPSAwXHJcbiAgbGV0IGxvd2VyUGVuYWx0eSA9IEluZmluaXR5XHJcblxyXG4gIGZvciAobGV0IHAgPSAwOyBwIDwgbnVtUGF0dGVybnM7IHArKykge1xyXG4gICAgc2V0dXBGb3JtYXRGdW5jKHApXHJcbiAgICBleHBvcnRzLmFwcGx5TWFzayhwLCBkYXRhKVxyXG5cclxuICAgIC8vIENhbGN1bGF0ZSBwZW5hbHR5XHJcbiAgICBjb25zdCBwZW5hbHR5ID1cclxuICAgICAgZXhwb3J0cy5nZXRQZW5hbHR5TjEoZGF0YSkgK1xyXG4gICAgICBleHBvcnRzLmdldFBlbmFsdHlOMihkYXRhKSArXHJcbiAgICAgIGV4cG9ydHMuZ2V0UGVuYWx0eU4zKGRhdGEpICtcclxuICAgICAgZXhwb3J0cy5nZXRQZW5hbHR5TjQoZGF0YSlcclxuXHJcbiAgICAvLyBVbmRvIHByZXZpb3VzbHkgYXBwbGllZCBtYXNrXHJcbiAgICBleHBvcnRzLmFwcGx5TWFzayhwLCBkYXRhKVxyXG5cclxuICAgIGlmIChwZW5hbHR5IDwgbG93ZXJQZW5hbHR5KSB7XHJcbiAgICAgIGxvd2VyUGVuYWx0eSA9IHBlbmFsdHlcclxuICAgICAgYmVzdFBhdHRlcm4gPSBwXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYmVzdFBhdHRlcm5cclxufVxyXG4iLCJjb25zdCBFQ0xldmVsID0gcmVxdWlyZSgnLi9lcnJvci1jb3JyZWN0aW9uLWxldmVsJylcclxuXHJcbmNvbnN0IEVDX0JMT0NLU19UQUJMRSA9IFtcclxuLy8gTCAgTSAgUSAgSFxyXG4gIDEsIDEsIDEsIDEsXHJcbiAgMSwgMSwgMSwgMSxcclxuICAxLCAxLCAyLCAyLFxyXG4gIDEsIDIsIDIsIDQsXHJcbiAgMSwgMiwgNCwgNCxcclxuICAyLCA0LCA0LCA0LFxyXG4gIDIsIDQsIDYsIDUsXHJcbiAgMiwgNCwgNiwgNixcclxuICAyLCA1LCA4LCA4LFxyXG4gIDQsIDUsIDgsIDgsXHJcbiAgNCwgNSwgOCwgMTEsXHJcbiAgNCwgOCwgMTAsIDExLFxyXG4gIDQsIDksIDEyLCAxNixcclxuICA0LCA5LCAxNiwgMTYsXHJcbiAgNiwgMTAsIDEyLCAxOCxcclxuICA2LCAxMCwgMTcsIDE2LFxyXG4gIDYsIDExLCAxNiwgMTksXHJcbiAgNiwgMTMsIDE4LCAyMSxcclxuICA3LCAxNCwgMjEsIDI1LFxyXG4gIDgsIDE2LCAyMCwgMjUsXHJcbiAgOCwgMTcsIDIzLCAyNSxcclxuICA5LCAxNywgMjMsIDM0LFxyXG4gIDksIDE4LCAyNSwgMzAsXHJcbiAgMTAsIDIwLCAyNywgMzIsXHJcbiAgMTIsIDIxLCAyOSwgMzUsXHJcbiAgMTIsIDIzLCAzNCwgMzcsXHJcbiAgMTIsIDI1LCAzNCwgNDAsXHJcbiAgMTMsIDI2LCAzNSwgNDIsXHJcbiAgMTQsIDI4LCAzOCwgNDUsXHJcbiAgMTUsIDI5LCA0MCwgNDgsXHJcbiAgMTYsIDMxLCA0MywgNTEsXHJcbiAgMTcsIDMzLCA0NSwgNTQsXHJcbiAgMTgsIDM1LCA0OCwgNTcsXHJcbiAgMTksIDM3LCA1MSwgNjAsXHJcbiAgMTksIDM4LCA1MywgNjMsXHJcbiAgMjAsIDQwLCA1NiwgNjYsXHJcbiAgMjEsIDQzLCA1OSwgNzAsXHJcbiAgMjIsIDQ1LCA2MiwgNzQsXHJcbiAgMjQsIDQ3LCA2NSwgNzcsXHJcbiAgMjUsIDQ5LCA2OCwgODFcclxuXVxyXG5cclxuY29uc3QgRUNfQ09ERVdPUkRTX1RBQkxFID0gW1xyXG4vLyBMICBNICBRICBIXHJcbiAgNywgMTAsIDEzLCAxNyxcclxuICAxMCwgMTYsIDIyLCAyOCxcclxuICAxNSwgMjYsIDM2LCA0NCxcclxuICAyMCwgMzYsIDUyLCA2NCxcclxuICAyNiwgNDgsIDcyLCA4OCxcclxuICAzNiwgNjQsIDk2LCAxMTIsXHJcbiAgNDAsIDcyLCAxMDgsIDEzMCxcclxuICA0OCwgODgsIDEzMiwgMTU2LFxyXG4gIDYwLCAxMTAsIDE2MCwgMTkyLFxyXG4gIDcyLCAxMzAsIDE5MiwgMjI0LFxyXG4gIDgwLCAxNTAsIDIyNCwgMjY0LFxyXG4gIDk2LCAxNzYsIDI2MCwgMzA4LFxyXG4gIDEwNCwgMTk4LCAyODgsIDM1MixcclxuICAxMjAsIDIxNiwgMzIwLCAzODQsXHJcbiAgMTMyLCAyNDAsIDM2MCwgNDMyLFxyXG4gIDE0NCwgMjgwLCA0MDgsIDQ4MCxcclxuICAxNjgsIDMwOCwgNDQ4LCA1MzIsXHJcbiAgMTgwLCAzMzgsIDUwNCwgNTg4LFxyXG4gIDE5NiwgMzY0LCA1NDYsIDY1MCxcclxuICAyMjQsIDQxNiwgNjAwLCA3MDAsXHJcbiAgMjI0LCA0NDIsIDY0NCwgNzUwLFxyXG4gIDI1MiwgNDc2LCA2OTAsIDgxNixcclxuICAyNzAsIDUwNCwgNzUwLCA5MDAsXHJcbiAgMzAwLCA1NjAsIDgxMCwgOTYwLFxyXG4gIDMxMiwgNTg4LCA4NzAsIDEwNTAsXHJcbiAgMzM2LCA2NDQsIDk1MiwgMTExMCxcclxuICAzNjAsIDcwMCwgMTAyMCwgMTIwMCxcclxuICAzOTAsIDcyOCwgMTA1MCwgMTI2MCxcclxuICA0MjAsIDc4NCwgMTE0MCwgMTM1MCxcclxuICA0NTAsIDgxMiwgMTIwMCwgMTQ0MCxcclxuICA0ODAsIDg2OCwgMTI5MCwgMTUzMCxcclxuICA1MTAsIDkyNCwgMTM1MCwgMTYyMCxcclxuICA1NDAsIDk4MCwgMTQ0MCwgMTcxMCxcclxuICA1NzAsIDEwMzYsIDE1MzAsIDE4MDAsXHJcbiAgNTcwLCAxMDY0LCAxNTkwLCAxODkwLFxyXG4gIDYwMCwgMTEyMCwgMTY4MCwgMTk4MCxcclxuICA2MzAsIDEyMDQsIDE3NzAsIDIxMDAsXHJcbiAgNjYwLCAxMjYwLCAxODYwLCAyMjIwLFxyXG4gIDcyMCwgMTMxNiwgMTk1MCwgMjMxMCxcclxuICA3NTAsIDEzNzIsIDIwNDAsIDI0MzBcclxuXVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGJsb2NrIHRoYXQgdGhlIFFSIENvZGUgc2hvdWxkIGNvbnRhaW5cclxuICogZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBhbmQgZXJyb3IgY29ycmVjdGlvbiBsZXZlbC5cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cclxuICogQHBhcmFtICB7TnVtYmVyfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICAgTnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gYmxvY2tzXHJcbiAqL1xyXG5leHBvcnRzLmdldEJsb2Nrc0NvdW50ID0gZnVuY3Rpb24gZ2V0QmxvY2tzQ291bnQgKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgc3dpdGNoIChlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gICAgY2FzZSBFQ0xldmVsLkw6XHJcbiAgICAgIHJldHVybiBFQ19CTE9DS1NfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAwXVxyXG4gICAgY2FzZSBFQ0xldmVsLk06XHJcbiAgICAgIHJldHVybiBFQ19CTE9DS1NfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAxXVxyXG4gICAgY2FzZSBFQ0xldmVsLlE6XHJcbiAgICAgIHJldHVybiBFQ19CTE9DS1NfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAyXVxyXG4gICAgY2FzZSBFQ0xldmVsLkg6XHJcbiAgICAgIHJldHVybiBFQ19CTE9DS1NfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAzXVxyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3JkcyB0byB1c2UgZm9yIHRoZSBzcGVjaWZpZWRcclxuICogdmVyc2lvbiBhbmQgZXJyb3IgY29ycmVjdGlvbiBsZXZlbC5cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cclxuICogQHBhcmFtICB7TnVtYmVyfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICAgTnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzXHJcbiAqL1xyXG5leHBvcnRzLmdldFRvdGFsQ29kZXdvcmRzQ291bnQgPSBmdW5jdGlvbiBnZXRUb3RhbENvZGV3b3Jkc0NvdW50ICh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gIHN3aXRjaCAoZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcclxuICAgIGNhc2UgRUNMZXZlbC5MOlxyXG4gICAgICByZXR1cm4gRUNfQ09ERVdPUkRTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMF1cclxuICAgIGNhc2UgRUNMZXZlbC5NOlxyXG4gICAgICByZXR1cm4gRUNfQ09ERVdPUkRTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMV1cclxuICAgIGNhc2UgRUNMZXZlbC5ROlxyXG4gICAgICByZXR1cm4gRUNfQ09ERVdPUkRTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMl1cclxuICAgIGNhc2UgRUNMZXZlbC5IOlxyXG4gICAgICByZXR1cm4gRUNfQ09ERVdPUkRTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgM11cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuICB9XHJcbn1cclxuIiwiY29uc3QgRVhQX1RBQkxFID0gbmV3IFVpbnQ4QXJyYXkoNTEyKVxyXG5jb25zdCBMT0dfVEFCTEUgPSBuZXcgVWludDhBcnJheSgyNTYpXHJcbi8qKlxyXG4gKiBQcmVjb21wdXRlIHRoZSBsb2cgYW5kIGFudGktbG9nIHRhYmxlcyBmb3IgZmFzdGVyIGNvbXB1dGF0aW9uIGxhdGVyXHJcbiAqXHJcbiAqIEZvciBlYWNoIHBvc3NpYmxlIHZhbHVlIGluIHRoZSBnYWxvaXMgZmllbGQgMl44LCB3ZSB3aWxsIHByZS1jb21wdXRlXHJcbiAqIHRoZSBsb2dhcml0aG0gYW5kIGFudGktbG9nYXJpdGhtIChleHBvbmVudGlhbCkgb2YgdGhpcyB2YWx1ZVxyXG4gKlxyXG4gKiByZWYge0BsaW5rIGh0dHBzOi8vZW4ud2lraXZlcnNpdHkub3JnL3dpa2kvUmVlZCVFMiU4MCU5M1NvbG9tb25fY29kZXNfZm9yX2NvZGVycyNJbnRyb2R1Y3Rpb25fdG9fbWF0aGVtYXRpY2FsX2ZpZWxkc31cclxuICovXHJcbjsoZnVuY3Rpb24gaW5pdFRhYmxlcyAoKSB7XHJcbiAgbGV0IHggPSAxXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAyNTU7IGkrKykge1xyXG4gICAgRVhQX1RBQkxFW2ldID0geFxyXG4gICAgTE9HX1RBQkxFW3hdID0gaVxyXG5cclxuICAgIHggPDw9IDEgLy8gbXVsdGlwbHkgYnkgMlxyXG5cclxuICAgIC8vIFRoZSBRUiBjb2RlIHNwZWNpZmljYXRpb24gc2F5cyB0byB1c2UgYnl0ZS13aXNlIG1vZHVsbyAxMDAwMTExMDEgYXJpdGhtZXRpYy5cclxuICAgIC8vIFRoaXMgbWVhbnMgdGhhdCB3aGVuIGEgbnVtYmVyIGlzIDI1NiBvciBsYXJnZXIsIGl0IHNob3VsZCBiZSBYT1JlZCB3aXRoIDB4MTFELlxyXG4gICAgaWYgKHggJiAweDEwMCkgeyAvLyBzaW1pbGFyIHRvIHggPj0gMjU2LCBidXQgYSBsb3QgZmFzdGVyIChiZWNhdXNlIDB4MTAwID09IDI1NilcclxuICAgICAgeCBePSAweDExRFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gT3B0aW1pemF0aW9uOiBkb3VibGUgdGhlIHNpemUgb2YgdGhlIGFudGktbG9nIHRhYmxlIHNvIHRoYXQgd2UgZG9uJ3QgbmVlZCB0byBtb2QgMjU1IHRvXHJcbiAgLy8gc3RheSBpbnNpZGUgdGhlIGJvdW5kcyAoYmVjYXVzZSB3ZSB3aWxsIG1haW5seSB1c2UgdGhpcyB0YWJsZSBmb3IgdGhlIG11bHRpcGxpY2F0aW9uIG9mXHJcbiAgLy8gdHdvIEdGIG51bWJlcnMsIG5vIG1vcmUpLlxyXG4gIC8vIEBzZWUge0BsaW5rIG11bH1cclxuICBmb3IgKGxldCBpID0gMjU1OyBpIDwgNTEyOyBpKyspIHtcclxuICAgIEVYUF9UQUJMRVtpXSA9IEVYUF9UQUJMRVtpIC0gMjU1XVxyXG4gIH1cclxufSgpKVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgbG9nIHZhbHVlIG9mIG4gaW5zaWRlIEdhbG9pcyBGaWVsZFxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG5cclxuICogQHJldHVybiB7TnVtYmVyfVxyXG4gKi9cclxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbiBsb2cgKG4pIHtcclxuICBpZiAobiA8IDEpIHRocm93IG5ldyBFcnJvcignbG9nKCcgKyBuICsgJyknKVxyXG4gIHJldHVybiBMT0dfVEFCTEVbbl1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYW50aS1sb2cgdmFsdWUgb2YgbiBpbnNpZGUgR2Fsb2lzIEZpZWxkXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gblxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XHJcbiAqL1xyXG5leHBvcnRzLmV4cCA9IGZ1bmN0aW9uIGV4cCAobikge1xyXG4gIHJldHVybiBFWFBfVEFCTEVbbl1cclxufVxyXG5cclxuLyoqXHJcbiAqIE11bHRpcGxpZXMgdHdvIG51bWJlciBpbnNpZGUgR2Fsb2lzIEZpZWxkXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0geFxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHlcclxuICogQHJldHVybiB7TnVtYmVyfVxyXG4gKi9cclxuZXhwb3J0cy5tdWwgPSBmdW5jdGlvbiBtdWwgKHgsIHkpIHtcclxuICBpZiAoeCA9PT0gMCB8fCB5ID09PSAwKSByZXR1cm4gMFxyXG5cclxuICAvLyBzaG91bGQgYmUgRVhQX1RBQkxFWyhMT0dfVEFCTEVbeF0gKyBMT0dfVEFCTEVbeV0pICUgMjU1XSBpZiBFWFBfVEFCTEUgd2Fzbid0IG92ZXJzaXplZFxyXG4gIC8vIEBzZWUge0BsaW5rIGluaXRUYWJsZXN9XHJcbiAgcmV0dXJuIEVYUF9UQUJMRVtMT0dfVEFCTEVbeF0gKyBMT0dfVEFCTEVbeV1dXHJcbn1cclxuIiwiY29uc3QgR0YgPSByZXF1aXJlKCcuL2dhbG9pcy1maWVsZCcpXHJcblxyXG4vKipcclxuICogTXVsdGlwbGllcyB0d28gcG9seW5vbWlhbHMgaW5zaWRlIEdhbG9pcyBGaWVsZFxyXG4gKlxyXG4gKiBAcGFyYW0gIHtVaW50OEFycmF5fSBwMSBQb2x5bm9taWFsXHJcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IHAyIFBvbHlub21pYWxcclxuICogQHJldHVybiB7VWludDhBcnJheX0gICAgUHJvZHVjdCBvZiBwMSBhbmQgcDJcclxuICovXHJcbmV4cG9ydHMubXVsID0gZnVuY3Rpb24gbXVsIChwMSwgcDIpIHtcclxuICBjb25zdCBjb2VmZiA9IG5ldyBVaW50OEFycmF5KHAxLmxlbmd0aCArIHAyLmxlbmd0aCAtIDEpXHJcblxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcDEubGVuZ3RoOyBpKyspIHtcclxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgcDIubGVuZ3RoOyBqKyspIHtcclxuICAgICAgY29lZmZbaSArIGpdIF49IEdGLm11bChwMVtpXSwgcDJbal0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gY29lZmZcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZSB0aGUgcmVtYWluZGVyIG9mIHBvbHlub21pYWxzIGRpdmlzaW9uXHJcbiAqXHJcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IGRpdmlkZW50IFBvbHlub21pYWxcclxuICogQHBhcmFtICB7VWludDhBcnJheX0gZGl2aXNvciAgUG9seW5vbWlhbFxyXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICAgICAgICBSZW1haW5kZXJcclxuICovXHJcbmV4cG9ydHMubW9kID0gZnVuY3Rpb24gbW9kIChkaXZpZGVudCwgZGl2aXNvcikge1xyXG4gIGxldCByZXN1bHQgPSBuZXcgVWludDhBcnJheShkaXZpZGVudClcclxuXHJcbiAgd2hpbGUgKChyZXN1bHQubGVuZ3RoIC0gZGl2aXNvci5sZW5ndGgpID49IDApIHtcclxuICAgIGNvbnN0IGNvZWZmID0gcmVzdWx0WzBdXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaXZpc29yLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHJlc3VsdFtpXSBePSBHRi5tdWwoZGl2aXNvcltpXSwgY29lZmYpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVtb3ZlIGFsbCB6ZXJvcyBmcm9tIGJ1ZmZlciBoZWFkXHJcbiAgICBsZXQgb2Zmc2V0ID0gMFxyXG4gICAgd2hpbGUgKG9mZnNldCA8IHJlc3VsdC5sZW5ndGggJiYgcmVzdWx0W29mZnNldF0gPT09IDApIG9mZnNldCsrXHJcbiAgICByZXN1bHQgPSByZXN1bHQuc2xpY2Uob2Zmc2V0KVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG4vKipcclxuICogR2VuZXJhdGUgYW4gaXJyZWR1Y2libGUgZ2VuZXJhdG9yIHBvbHlub21pYWwgb2Ygc3BlY2lmaWVkIGRlZ3JlZVxyXG4gKiAodXNlZCBieSBSZWVkLVNvbG9tb24gZW5jb2RlcilcclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSBkZWdyZWUgRGVncmVlIG9mIHRoZSBnZW5lcmF0b3IgcG9seW5vbWlhbFxyXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICBCdWZmZXIgY29udGFpbmluZyBwb2x5bm9taWFsIGNvZWZmaWNpZW50c1xyXG4gKi9cclxuZXhwb3J0cy5nZW5lcmF0ZUVDUG9seW5vbWlhbCA9IGZ1bmN0aW9uIGdlbmVyYXRlRUNQb2x5bm9taWFsIChkZWdyZWUpIHtcclxuICBsZXQgcG9seSA9IG5ldyBVaW50OEFycmF5KFsxXSlcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZ3JlZTsgaSsrKSB7XHJcbiAgICBwb2x5ID0gZXhwb3J0cy5tdWwocG9seSwgbmV3IFVpbnQ4QXJyYXkoWzEsIEdGLmV4cChpKV0pKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHBvbHlcclxufVxyXG4iLCJjb25zdCBQb2x5bm9taWFsID0gcmVxdWlyZSgnLi9wb2x5bm9taWFsJylcclxuXHJcbmZ1bmN0aW9uIFJlZWRTb2xvbW9uRW5jb2RlciAoZGVncmVlKSB7XHJcbiAgdGhpcy5nZW5Qb2x5ID0gdW5kZWZpbmVkXHJcbiAgdGhpcy5kZWdyZWUgPSBkZWdyZWVcclxuXHJcbiAgaWYgKHRoaXMuZGVncmVlKSB0aGlzLmluaXRpYWxpemUodGhpcy5kZWdyZWUpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIHRoZSBlbmNvZGVyLlxyXG4gKiBUaGUgaW5wdXQgcGFyYW0gc2hvdWxkIGNvcnJlc3BvbmQgdG8gdGhlIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3Jkcy5cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSBkZWdyZWVcclxuICovXHJcblJlZWRTb2xvbW9uRW5jb2Rlci5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIGluaXRpYWxpemUgKGRlZ3JlZSkge1xyXG4gIC8vIGNyZWF0ZSBhbiBpcnJlZHVjaWJsZSBnZW5lcmF0b3IgcG9seW5vbWlhbFxyXG4gIHRoaXMuZGVncmVlID0gZGVncmVlXHJcbiAgdGhpcy5nZW5Qb2x5ID0gUG9seW5vbWlhbC5nZW5lcmF0ZUVDUG9seW5vbWlhbCh0aGlzLmRlZ3JlZSlcclxufVxyXG5cclxuLyoqXHJcbiAqIEVuY29kZXMgYSBjaHVuayBvZiBkYXRhXHJcbiAqXHJcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IGRhdGEgQnVmZmVyIGNvbnRhaW5pbmcgaW5wdXQgZGF0YVxyXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICAgIEJ1ZmZlciBjb250YWluaW5nIGVuY29kZWQgZGF0YVxyXG4gKi9cclxuUmVlZFNvbG9tb25FbmNvZGVyLnByb3RvdHlwZS5lbmNvZGUgPSBmdW5jdGlvbiBlbmNvZGUgKGRhdGEpIHtcclxuICBpZiAoIXRoaXMuZ2VuUG9seSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdFbmNvZGVyIG5vdCBpbml0aWFsaXplZCcpXHJcbiAgfVxyXG5cclxuICAvLyBDYWxjdWxhdGUgRUMgZm9yIHRoaXMgZGF0YSBibG9ja1xyXG4gIC8vIGV4dGVuZHMgZGF0YSBzaXplIHRvIGRhdGErZ2VuUG9seSBzaXplXHJcbiAgY29uc3QgcGFkZGVkRGF0YSA9IG5ldyBVaW50OEFycmF5KGRhdGEubGVuZ3RoICsgdGhpcy5kZWdyZWUpXHJcbiAgcGFkZGVkRGF0YS5zZXQoZGF0YSlcclxuXHJcbiAgLy8gVGhlIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzIGFyZSB0aGUgcmVtYWluZGVyIGFmdGVyIGRpdmlkaW5nIHRoZSBkYXRhIGNvZGV3b3Jkc1xyXG4gIC8vIGJ5IGEgZ2VuZXJhdG9yIHBvbHlub21pYWxcclxuICBjb25zdCByZW1haW5kZXIgPSBQb2x5bm9taWFsLm1vZChwYWRkZWREYXRhLCB0aGlzLmdlblBvbHkpXHJcblxyXG4gIC8vIHJldHVybiBFQyBkYXRhIGJsb2NrcyAobGFzdCBuIGJ5dGUsIHdoZXJlIG4gaXMgdGhlIGRlZ3JlZSBvZiBnZW5Qb2x5KVxyXG4gIC8vIElmIGNvZWZmaWNpZW50cyBudW1iZXIgaW4gcmVtYWluZGVyIGFyZSBsZXNzIHRoYW4gZ2VuUG9seSBkZWdyZWUsXHJcbiAgLy8gcGFkIHdpdGggMHMgdG8gdGhlIGxlZnQgdG8gcmVhY2ggdGhlIG5lZWRlZCBudW1iZXIgb2YgY29lZmZpY2llbnRzXHJcbiAgY29uc3Qgc3RhcnQgPSB0aGlzLmRlZ3JlZSAtIHJlbWFpbmRlci5sZW5ndGhcclxuICBpZiAoc3RhcnQgPiAwKSB7XHJcbiAgICBjb25zdCBidWZmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5kZWdyZWUpXHJcbiAgICBidWZmLnNldChyZW1haW5kZXIsIHN0YXJ0KVxyXG5cclxuICAgIHJldHVybiBidWZmXHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmVtYWluZGVyXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVlZFNvbG9tb25FbmNvZGVyXHJcbiIsIi8qKlxyXG4gKiBDaGVjayBpZiBRUiBDb2RlIHZlcnNpb24gaXMgdmFsaWRcclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSAgdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cclxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICB0cnVlIGlmIHZhbGlkIHZlcnNpb24sIGZhbHNlIG90aGVyd2lzZVxyXG4gKi9cclxuZXhwb3J0cy5pc1ZhbGlkID0gZnVuY3Rpb24gaXNWYWxpZCAodmVyc2lvbikge1xyXG4gIHJldHVybiAhaXNOYU4odmVyc2lvbikgJiYgdmVyc2lvbiA+PSAxICYmIHZlcnNpb24gPD0gNDBcclxufVxyXG4iLCJjb25zdCBudW1lcmljID0gJ1swLTldKydcclxuY29uc3QgYWxwaGFudW1lcmljID0gJ1tBLVogJCUqK1xcXFwtLi86XSsnXHJcbmxldCBrYW5qaSA9ICcoPzpbdTMwMDAtdTMwM0ZdfFt1MzA0MC11MzA5Rl18W3UzMEEwLXUzMEZGXXwnICtcclxuICAnW3VGRjAwLXVGRkVGXXxbdTRFMDAtdTlGQUZdfFt1MjYwNS11MjYwNl18W3UyMTkwLXUyMTk1XXx1MjAzQnwnICtcclxuICAnW3UyMDEwdTIwMTV1MjAxOHUyMDE5dTIwMjV1MjAyNnUyMDFDdTIwMUR1MjIyNXUyMjYwXXwnICtcclxuICAnW3UwMzkxLXUwNDUxXXxbdTAwQTd1MDBBOHUwMEIxdTAwQjR1MDBEN3UwMEY3XSkrJ1xyXG5rYW5qaSA9IGthbmppLnJlcGxhY2UoL3UvZywgJ1xcXFx1JylcclxuXHJcbmNvbnN0IGJ5dGUgPSAnKD86KD8hW0EtWjAtOSAkJSorXFxcXC0uLzpdfCcgKyBrYW5qaSArICcpKD86LnxbXFxyXFxuXSkpKydcclxuXHJcbmV4cG9ydHMuS0FOSkkgPSBuZXcgUmVnRXhwKGthbmppLCAnZycpXHJcbmV4cG9ydHMuQllURV9LQU5KSSA9IG5ldyBSZWdFeHAoJ1teQS1aMC05ICQlKitcXFxcLS4vOl0rJywgJ2cnKVxyXG5leHBvcnRzLkJZVEUgPSBuZXcgUmVnRXhwKGJ5dGUsICdnJylcclxuZXhwb3J0cy5OVU1FUklDID0gbmV3IFJlZ0V4cChudW1lcmljLCAnZycpXHJcbmV4cG9ydHMuQUxQSEFOVU1FUklDID0gbmV3IFJlZ0V4cChhbHBoYW51bWVyaWMsICdnJylcclxuXHJcbmNvbnN0IFRFU1RfS0FOSkkgPSBuZXcgUmVnRXhwKCdeJyArIGthbmppICsgJyQnKVxyXG5jb25zdCBURVNUX05VTUVSSUMgPSBuZXcgUmVnRXhwKCdeJyArIG51bWVyaWMgKyAnJCcpXHJcbmNvbnN0IFRFU1RfQUxQSEFOVU1FUklDID0gbmV3IFJlZ0V4cCgnXltBLVowLTkgJCUqK1xcXFwtLi86XSskJylcclxuXHJcbmV4cG9ydHMudGVzdEthbmppID0gZnVuY3Rpb24gdGVzdEthbmppIChzdHIpIHtcclxuICByZXR1cm4gVEVTVF9LQU5KSS50ZXN0KHN0cilcclxufVxyXG5cclxuZXhwb3J0cy50ZXN0TnVtZXJpYyA9IGZ1bmN0aW9uIHRlc3ROdW1lcmljIChzdHIpIHtcclxuICByZXR1cm4gVEVTVF9OVU1FUklDLnRlc3Qoc3RyKVxyXG59XHJcblxyXG5leHBvcnRzLnRlc3RBbHBoYW51bWVyaWMgPSBmdW5jdGlvbiB0ZXN0QWxwaGFudW1lcmljIChzdHIpIHtcclxuICByZXR1cm4gVEVTVF9BTFBIQU5VTUVSSUMudGVzdChzdHIpXHJcbn1cclxuIiwiY29uc3QgVmVyc2lvbkNoZWNrID0gcmVxdWlyZSgnLi92ZXJzaW9uLWNoZWNrJylcclxuY29uc3QgUmVnZXggPSByZXF1aXJlKCcuL3JlZ2V4JylcclxuXHJcbi8qKlxyXG4gKiBOdW1lcmljIG1vZGUgZW5jb2RlcyBkYXRhIGZyb20gdGhlIGRlY2ltYWwgZGlnaXQgc2V0ICgwIC0gOSlcclxuICogKGJ5dGUgdmFsdWVzIDMwSEVYIHRvIDM5SEVYKS5cclxuICogTm9ybWFsbHksIDMgZGF0YSBjaGFyYWN0ZXJzIGFyZSByZXByZXNlbnRlZCBieSAxMCBiaXRzLlxyXG4gKlxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0cy5OVU1FUklDID0ge1xyXG4gIGlkOiAnTnVtZXJpYycsXHJcbiAgYml0OiAxIDw8IDAsXHJcbiAgY2NCaXRzOiBbMTAsIDEyLCAxNF1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFscGhhbnVtZXJpYyBtb2RlIGVuY29kZXMgZGF0YSBmcm9tIGEgc2V0IG9mIDQ1IGNoYXJhY3RlcnMsXHJcbiAqIGkuZS4gMTAgbnVtZXJpYyBkaWdpdHMgKDAgLSA5KSxcclxuICogICAgICAyNiBhbHBoYWJldGljIGNoYXJhY3RlcnMgKEEgLSBaKSxcclxuICogICBhbmQgOSBzeW1ib2xzIChTUCwgJCwgJSwgKiwgKywgLSwgLiwgLywgOikuXHJcbiAqIE5vcm1hbGx5LCB0d28gaW5wdXQgY2hhcmFjdGVycyBhcmUgcmVwcmVzZW50ZWQgYnkgMTEgYml0cy5cclxuICpcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbmV4cG9ydHMuQUxQSEFOVU1FUklDID0ge1xyXG4gIGlkOiAnQWxwaGFudW1lcmljJyxcclxuICBiaXQ6IDEgPDwgMSxcclxuICBjY0JpdHM6IFs5LCAxMSwgMTNdXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbiBieXRlIG1vZGUsIGRhdGEgaXMgZW5jb2RlZCBhdCA4IGJpdHMgcGVyIGNoYXJhY3Rlci5cclxuICpcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbmV4cG9ydHMuQllURSA9IHtcclxuICBpZDogJ0J5dGUnLFxyXG4gIGJpdDogMSA8PCAyLFxyXG4gIGNjQml0czogWzgsIDE2LCAxNl1cclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBLYW5qaSBtb2RlIGVmZmljaWVudGx5IGVuY29kZXMgS2FuamkgY2hhcmFjdGVycyBpbiBhY2NvcmRhbmNlIHdpdGhcclxuICogdGhlIFNoaWZ0IEpJUyBzeXN0ZW0gYmFzZWQgb24gSklTIFggMDIwOC5cclxuICogVGhlIFNoaWZ0IEpJUyB2YWx1ZXMgYXJlIHNoaWZ0ZWQgZnJvbSB0aGUgSklTIFggMDIwOCB2YWx1ZXMuXHJcbiAqIEpJUyBYIDAyMDggZ2l2ZXMgZGV0YWlscyBvZiB0aGUgc2hpZnQgY29kZWQgcmVwcmVzZW50YXRpb24uXHJcbiAqIEVhY2ggdHdvLWJ5dGUgY2hhcmFjdGVyIHZhbHVlIGlzIGNvbXBhY3RlZCB0byBhIDEzLWJpdCBiaW5hcnkgY29kZXdvcmQuXHJcbiAqXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG5leHBvcnRzLktBTkpJID0ge1xyXG4gIGlkOiAnS2FuamknLFxyXG4gIGJpdDogMSA8PCAzLFxyXG4gIGNjQml0czogWzgsIDEwLCAxMl1cclxufVxyXG5cclxuLyoqXHJcbiAqIE1peGVkIG1vZGUgd2lsbCBjb250YWluIGEgc2VxdWVuY2VzIG9mIGRhdGEgaW4gYSBjb21iaW5hdGlvbiBvZiBhbnkgb2ZcclxuICogdGhlIG1vZGVzIGRlc2NyaWJlZCBhYm92ZVxyXG4gKlxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0cy5NSVhFRCA9IHtcclxuICBiaXQ6IC0xXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgYml0cyBuZWVkZWQgdG8gc3RvcmUgdGhlIGRhdGEgbGVuZ3RoXHJcbiAqIGFjY29yZGluZyB0byBRUiBDb2RlIHNwZWNpZmljYXRpb25zLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtNb2RlfSAgIG1vZGUgICAgRGF0YSBtb2RlXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgIE51bWJlciBvZiBiaXRzXHJcbiAqL1xyXG5leHBvcnRzLmdldENoYXJDb3VudEluZGljYXRvciA9IGZ1bmN0aW9uIGdldENoYXJDb3VudEluZGljYXRvciAobW9kZSwgdmVyc2lvbikge1xyXG4gIGlmICghbW9kZS5jY0JpdHMpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBtb2RlOiAnICsgbW9kZSlcclxuXHJcbiAgaWYgKCFWZXJzaW9uQ2hlY2suaXNWYWxpZCh2ZXJzaW9uKSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHZlcnNpb246ICcgKyB2ZXJzaW9uKVxyXG4gIH1cclxuXHJcbiAgaWYgKHZlcnNpb24gPj0gMSAmJiB2ZXJzaW9uIDwgMTApIHJldHVybiBtb2RlLmNjQml0c1swXVxyXG4gIGVsc2UgaWYgKHZlcnNpb24gPCAyNykgcmV0dXJuIG1vZGUuY2NCaXRzWzFdXHJcbiAgcmV0dXJuIG1vZGUuY2NCaXRzWzJdXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtb3N0IGVmZmljaWVudCBtb2RlIHRvIHN0b3JlIHRoZSBzcGVjaWZpZWQgZGF0YVxyXG4gKlxyXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGFTdHIgSW5wdXQgZGF0YSBzdHJpbmdcclxuICogQHJldHVybiB7TW9kZX0gICAgICAgICAgIEJlc3QgbW9kZVxyXG4gKi9cclxuZXhwb3J0cy5nZXRCZXN0TW9kZUZvckRhdGEgPSBmdW5jdGlvbiBnZXRCZXN0TW9kZUZvckRhdGEgKGRhdGFTdHIpIHtcclxuICBpZiAoUmVnZXgudGVzdE51bWVyaWMoZGF0YVN0cikpIHJldHVybiBleHBvcnRzLk5VTUVSSUNcclxuICBlbHNlIGlmIChSZWdleC50ZXN0QWxwaGFudW1lcmljKGRhdGFTdHIpKSByZXR1cm4gZXhwb3J0cy5BTFBIQU5VTUVSSUNcclxuICBlbHNlIGlmIChSZWdleC50ZXN0S2FuamkoZGF0YVN0cikpIHJldHVybiBleHBvcnRzLktBTkpJXHJcbiAgZWxzZSByZXR1cm4gZXhwb3J0cy5CWVRFXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm4gbW9kZSBuYW1lIGFzIHN0cmluZ1xyXG4gKlxyXG4gKiBAcGFyYW0ge01vZGV9IG1vZGUgTW9kZSBvYmplY3RcclxuICogQHJldHVybnMge1N0cmluZ30gIE1vZGUgbmFtZVxyXG4gKi9cclxuZXhwb3J0cy50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nIChtb2RlKSB7XHJcbiAgaWYgKG1vZGUgJiYgbW9kZS5pZCkgcmV0dXJuIG1vZGUuaWRcclxuICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbW9kZScpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVjayBpZiBpbnB1dCBwYXJhbSBpcyBhIHZhbGlkIG1vZGUgb2JqZWN0XHJcbiAqXHJcbiAqIEBwYXJhbSAgIHtNb2RlfSAgICBtb2RlIE1vZGUgb2JqZWN0XHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHZhbGlkIG1vZGUsIGZhbHNlIG90aGVyd2lzZVxyXG4gKi9cclxuZXhwb3J0cy5pc1ZhbGlkID0gZnVuY3Rpb24gaXNWYWxpZCAobW9kZSkge1xyXG4gIHJldHVybiBtb2RlICYmIG1vZGUuYml0ICYmIG1vZGUuY2NCaXRzXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgbW9kZSBvYmplY3QgZnJvbSBpdHMgbmFtZVxyXG4gKlxyXG4gKiBAcGFyYW0gICB7U3RyaW5nfSBzdHJpbmcgTW9kZSBuYW1lXHJcbiAqIEByZXR1cm5zIHtNb2RlfSAgICAgICAgICBNb2RlIG9iamVjdFxyXG4gKi9cclxuZnVuY3Rpb24gZnJvbVN0cmluZyAoc3RyaW5nKSB7XHJcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcmFtIGlzIG5vdCBhIHN0cmluZycpXHJcbiAgfVxyXG5cclxuICBjb25zdCBsY1N0ciA9IHN0cmluZy50b0xvd2VyQ2FzZSgpXHJcblxyXG4gIHN3aXRjaCAobGNTdHIpIHtcclxuICAgIGNhc2UgJ251bWVyaWMnOlxyXG4gICAgICByZXR1cm4gZXhwb3J0cy5OVU1FUklDXHJcbiAgICBjYXNlICdhbHBoYW51bWVyaWMnOlxyXG4gICAgICByZXR1cm4gZXhwb3J0cy5BTFBIQU5VTUVSSUNcclxuICAgIGNhc2UgJ2thbmppJzpcclxuICAgICAgcmV0dXJuIGV4cG9ydHMuS0FOSklcclxuICAgIGNhc2UgJ2J5dGUnOlxyXG4gICAgICByZXR1cm4gZXhwb3J0cy5CWVRFXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gbW9kZTogJyArIHN0cmluZylcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIG1vZGUgZnJvbSBhIHZhbHVlLlxyXG4gKiBJZiB2YWx1ZSBpcyBub3QgYSB2YWxpZCBtb2RlLCByZXR1cm5zIGRlZmF1bHRWYWx1ZVxyXG4gKlxyXG4gKiBAcGFyYW0gIHtNb2RlfFN0cmluZ30gdmFsdWUgICAgICAgIEVuY29kaW5nIG1vZGVcclxuICogQHBhcmFtICB7TW9kZX0gICAgICAgIGRlZmF1bHRWYWx1ZSBGYWxsYmFjayB2YWx1ZVxyXG4gKiBAcmV0dXJuIHtNb2RlfSAgICAgICAgICAgICAgICAgICAgIEVuY29kaW5nIG1vZGVcclxuICovXHJcbmV4cG9ydHMuZnJvbSA9IGZ1bmN0aW9uIGZyb20gKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHtcclxuICBpZiAoZXhwb3J0cy5pc1ZhbGlkKHZhbHVlKSkge1xyXG4gICAgcmV0dXJuIHZhbHVlXHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgcmV0dXJuIGZyb21TdHJpbmcodmFsdWUpXHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZVxyXG4gIH1cclxufVxyXG4iLCJjb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5jb25zdCBFQ0NvZGUgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tY29kZScpXHJcbmNvbnN0IEVDTGV2ZWwgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwnKVxyXG5jb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcclxuY29uc3QgVmVyc2lvbkNoZWNrID0gcmVxdWlyZSgnLi92ZXJzaW9uLWNoZWNrJylcclxuXHJcbi8vIEdlbmVyYXRvciBwb2x5bm9taWFsIHVzZWQgdG8gZW5jb2RlIHZlcnNpb24gaW5mb3JtYXRpb25cclxuY29uc3QgRzE4ID0gKDEgPDwgMTIpIHwgKDEgPDwgMTEpIHwgKDEgPDwgMTApIHwgKDEgPDwgOSkgfCAoMSA8PCA4KSB8ICgxIDw8IDUpIHwgKDEgPDwgMikgfCAoMSA8PCAwKVxyXG5jb25zdCBHMThfQkNIID0gVXRpbHMuZ2V0QkNIRGlnaXQoRzE4KVxyXG5cclxuZnVuY3Rpb24gZ2V0QmVzdFZlcnNpb25Gb3JEYXRhTGVuZ3RoIChtb2RlLCBsZW5ndGgsIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgZm9yIChsZXQgY3VycmVudFZlcnNpb24gPSAxOyBjdXJyZW50VmVyc2lvbiA8PSA0MDsgY3VycmVudFZlcnNpb24rKykge1xyXG4gICAgaWYgKGxlbmd0aCA8PSBleHBvcnRzLmdldENhcGFjaXR5KGN1cnJlbnRWZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbW9kZSkpIHtcclxuICAgICAgcmV0dXJuIGN1cnJlbnRWZXJzaW9uXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdW5kZWZpbmVkXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFJlc2VydmVkQml0c0NvdW50IChtb2RlLCB2ZXJzaW9uKSB7XHJcbiAgLy8gQ2hhcmFjdGVyIGNvdW50IGluZGljYXRvciArIG1vZGUgaW5kaWNhdG9yIGJpdHNcclxuICByZXR1cm4gTW9kZS5nZXRDaGFyQ291bnRJbmRpY2F0b3IobW9kZSwgdmVyc2lvbikgKyA0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFRvdGFsQml0c0Zyb21EYXRhQXJyYXkgKHNlZ21lbnRzLCB2ZXJzaW9uKSB7XHJcbiAgbGV0IHRvdGFsQml0cyA9IDBcclxuXHJcbiAgc2VnbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgY29uc3QgcmVzZXJ2ZWRCaXRzID0gZ2V0UmVzZXJ2ZWRCaXRzQ291bnQoZGF0YS5tb2RlLCB2ZXJzaW9uKVxyXG4gICAgdG90YWxCaXRzICs9IHJlc2VydmVkQml0cyArIGRhdGEuZ2V0Qml0c0xlbmd0aCgpXHJcbiAgfSlcclxuXHJcbiAgcmV0dXJuIHRvdGFsQml0c1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRCZXN0VmVyc2lvbkZvck1peGVkRGF0YSAoc2VnbWVudHMsIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgZm9yIChsZXQgY3VycmVudFZlcnNpb24gPSAxOyBjdXJyZW50VmVyc2lvbiA8PSA0MDsgY3VycmVudFZlcnNpb24rKykge1xyXG4gICAgY29uc3QgbGVuZ3RoID0gZ2V0VG90YWxCaXRzRnJvbURhdGFBcnJheShzZWdtZW50cywgY3VycmVudFZlcnNpb24pXHJcbiAgICBpZiAobGVuZ3RoIDw9IGV4cG9ydHMuZ2V0Q2FwYWNpdHkoY3VycmVudFZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBNb2RlLk1JWEVEKSkge1xyXG4gICAgICByZXR1cm4gY3VycmVudFZlcnNpb25cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB1bmRlZmluZWRcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdmVyc2lvbiBudW1iZXIgZnJvbSBhIHZhbHVlLlxyXG4gKiBJZiB2YWx1ZSBpcyBub3QgYSB2YWxpZCB2ZXJzaW9uLCByZXR1cm5zIGRlZmF1bHRWYWx1ZVxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ8U3RyaW5nfSB2YWx1ZSAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEBwYXJhbSAge051bWJlcn0gICAgICAgIGRlZmF1bHRWYWx1ZSBGYWxsYmFjayB2YWx1ZVxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uIG51bWJlclxyXG4gKi9cclxuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSAodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xyXG4gIGlmIChWZXJzaW9uQ2hlY2suaXNWYWxpZCh2YWx1ZSkpIHtcclxuICAgIHJldHVybiBwYXJzZUludCh2YWx1ZSwgMTApXHJcbiAgfVxyXG5cclxuICByZXR1cm4gZGVmYXVsdFZhbHVlXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGhvdyBtdWNoIGRhdGEgY2FuIGJlIHN0b3JlZCB3aXRoIHRoZSBzcGVjaWZpZWQgUVIgY29kZSB2ZXJzaW9uXHJcbiAqIGFuZCBlcnJvciBjb3JyZWN0aW9uIGxldmVsXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uICgxLTQwKVxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcclxuICogQHBhcmFtICB7TW9kZX0gICBtb2RlICAgICAgICAgICAgICAgICBEYXRhIG1vZGVcclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgICBRdWFudGl0eSBvZiBzdG9yYWJsZSBkYXRhXHJcbiAqL1xyXG5leHBvcnRzLmdldENhcGFjaXR5ID0gZnVuY3Rpb24gZ2V0Q2FwYWNpdHkgKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtb2RlKSB7XHJcbiAgaWYgKCFWZXJzaW9uQ2hlY2suaXNWYWxpZCh2ZXJzaW9uKSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFFSIENvZGUgdmVyc2lvbicpXHJcbiAgfVxyXG5cclxuICAvLyBVc2UgQnl0ZSBtb2RlIGFzIGRlZmF1bHRcclxuICBpZiAodHlwZW9mIG1vZGUgPT09ICd1bmRlZmluZWQnKSBtb2RlID0gTW9kZS5CWVRFXHJcblxyXG4gIC8vIFRvdGFsIGNvZGV3b3JkcyBmb3IgdGhpcyBRUiBjb2RlIHZlcnNpb24gKERhdGEgKyBFcnJvciBjb3JyZWN0aW9uKVxyXG4gIGNvbnN0IHRvdGFsQ29kZXdvcmRzID0gVXRpbHMuZ2V0U3ltYm9sVG90YWxDb2Rld29yZHModmVyc2lvbilcclxuXHJcbiAgLy8gVG90YWwgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzXHJcbiAgY29uc3QgZWNUb3RhbENvZGV3b3JkcyA9IEVDQ29kZS5nZXRUb3RhbENvZGV3b3Jkc0NvdW50KHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKVxyXG5cclxuICAvLyBUb3RhbCBudW1iZXIgb2YgZGF0YSBjb2Rld29yZHNcclxuICBjb25zdCBkYXRhVG90YWxDb2Rld29yZHNCaXRzID0gKHRvdGFsQ29kZXdvcmRzIC0gZWNUb3RhbENvZGV3b3JkcykgKiA4XHJcblxyXG4gIGlmIChtb2RlID09PSBNb2RlLk1JWEVEKSByZXR1cm4gZGF0YVRvdGFsQ29kZXdvcmRzQml0c1xyXG5cclxuICBjb25zdCB1c2FibGVCaXRzID0gZGF0YVRvdGFsQ29kZXdvcmRzQml0cyAtIGdldFJlc2VydmVkQml0c0NvdW50KG1vZGUsIHZlcnNpb24pXHJcblxyXG4gIC8vIFJldHVybiBtYXggbnVtYmVyIG9mIHN0b3JhYmxlIGNvZGV3b3Jkc1xyXG4gIHN3aXRjaCAobW9kZSkge1xyXG4gICAgY2FzZSBNb2RlLk5VTUVSSUM6XHJcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKCh1c2FibGVCaXRzIC8gMTApICogMylcclxuXHJcbiAgICBjYXNlIE1vZGUuQUxQSEFOVU1FUklDOlxyXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcigodXNhYmxlQml0cyAvIDExKSAqIDIpXHJcblxyXG4gICAgY2FzZSBNb2RlLktBTkpJOlxyXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcih1c2FibGVCaXRzIC8gMTMpXHJcblxyXG4gICAgY2FzZSBNb2RlLkJZVEU6XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcih1c2FibGVCaXRzIC8gOClcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIHZlcnNpb24gbmVlZGVkIHRvIGNvbnRhaW4gdGhlIGFtb3VudCBvZiBkYXRhXHJcbiAqXHJcbiAqIEBwYXJhbSAge1NlZ21lbnR9IGRhdGEgICAgICAgICAgICAgICAgICAgIFNlZ21lbnQgb2YgZGF0YVxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IFtlcnJvckNvcnJlY3Rpb25MZXZlbD1IXSBFcnJvciBjb3JyZWN0aW9uIGxldmVsXHJcbiAqIEBwYXJhbSAge01vZGV9IG1vZGUgICAgICAgICAgICAgICAgICAgICAgIERhdGEgbW9kZVxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cclxuICovXHJcbmV4cG9ydHMuZ2V0QmVzdFZlcnNpb25Gb3JEYXRhID0gZnVuY3Rpb24gZ2V0QmVzdFZlcnNpb25Gb3JEYXRhIChkYXRhLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gIGxldCBzZWdcclxuXHJcbiAgY29uc3QgZWNsID0gRUNMZXZlbC5mcm9tKGVycm9yQ29ycmVjdGlvbkxldmVsLCBFQ0xldmVsLk0pXHJcblxyXG4gIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XHJcbiAgICBpZiAoZGF0YS5sZW5ndGggPiAxKSB7XHJcbiAgICAgIHJldHVybiBnZXRCZXN0VmVyc2lvbkZvck1peGVkRGF0YShkYXRhLCBlY2wpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRhdGEubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHJldHVybiAxXHJcbiAgICB9XHJcblxyXG4gICAgc2VnID0gZGF0YVswXVxyXG4gIH0gZWxzZSB7XHJcbiAgICBzZWcgPSBkYXRhXHJcbiAgfVxyXG5cclxuICByZXR1cm4gZ2V0QmVzdFZlcnNpb25Gb3JEYXRhTGVuZ3RoKHNlZy5tb2RlLCBzZWcuZ2V0TGVuZ3RoKCksIGVjbClcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdmVyc2lvbiBpbmZvcm1hdGlvbiB3aXRoIHJlbGF0aXZlIGVycm9yIGNvcnJlY3Rpb24gYml0c1xyXG4gKlxyXG4gKiBUaGUgdmVyc2lvbiBpbmZvcm1hdGlvbiBpcyBpbmNsdWRlZCBpbiBRUiBDb2RlIHN5bWJvbHMgb2YgdmVyc2lvbiA3IG9yIGxhcmdlci5cclxuICogSXQgY29uc2lzdHMgb2YgYW4gMTgtYml0IHNlcXVlbmNlIGNvbnRhaW5pbmcgNiBkYXRhIGJpdHMsXHJcbiAqIHdpdGggMTIgZXJyb3IgY29ycmVjdGlvbiBiaXRzIGNhbGN1bGF0ZWQgdXNpbmcgdGhlICgxOCwgNikgR29sYXkgY29kZS5cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgRW5jb2RlZCB2ZXJzaW9uIGluZm8gYml0c1xyXG4gKi9cclxuZXhwb3J0cy5nZXRFbmNvZGVkQml0cyA9IGZ1bmN0aW9uIGdldEVuY29kZWRCaXRzICh2ZXJzaW9uKSB7XHJcbiAgaWYgKCFWZXJzaW9uQ2hlY2suaXNWYWxpZCh2ZXJzaW9uKSB8fCB2ZXJzaW9uIDwgNykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFFSIENvZGUgdmVyc2lvbicpXHJcbiAgfVxyXG5cclxuICBsZXQgZCA9IHZlcnNpb24gPDwgMTJcclxuXHJcbiAgd2hpbGUgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE4X0JDSCA+PSAwKSB7XHJcbiAgICBkIF49IChHMTggPDwgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE4X0JDSCkpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gKHZlcnNpb24gPDwgMTIpIHwgZFxyXG59XHJcbiIsImNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXHJcblxyXG5jb25zdCBHMTUgPSAoMSA8PCAxMCkgfCAoMSA8PCA4KSB8ICgxIDw8IDUpIHwgKDEgPDwgNCkgfCAoMSA8PCAyKSB8ICgxIDw8IDEpIHwgKDEgPDwgMClcclxuY29uc3QgRzE1X01BU0sgPSAoMSA8PCAxNCkgfCAoMSA8PCAxMikgfCAoMSA8PCAxMCkgfCAoMSA8PCA0KSB8ICgxIDw8IDEpXHJcbmNvbnN0IEcxNV9CQ0ggPSBVdGlscy5nZXRCQ0hEaWdpdChHMTUpXHJcblxyXG4vKipcclxuICogUmV0dXJucyBmb3JtYXQgaW5mb3JtYXRpb24gd2l0aCByZWxhdGl2ZSBlcnJvciBjb3JyZWN0aW9uIGJpdHNcclxuICpcclxuICogVGhlIGZvcm1hdCBpbmZvcm1hdGlvbiBpcyBhIDE1LWJpdCBzZXF1ZW5jZSBjb250YWluaW5nIDUgZGF0YSBiaXRzLFxyXG4gKiB3aXRoIDEwIGVycm9yIGNvcnJlY3Rpb24gYml0cyBjYWxjdWxhdGVkIHVzaW5nIHRoZSAoMTUsIDUpIEJDSCBjb2RlLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcclxuICogQHBhcmFtICB7TnVtYmVyfSBtYXNrICAgICAgICAgICAgICAgICBNYXNrIHBhdHRlcm5cclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgICBFbmNvZGVkIGZvcm1hdCBpbmZvcm1hdGlvbiBiaXRzXHJcbiAqL1xyXG5leHBvcnRzLmdldEVuY29kZWRCaXRzID0gZnVuY3Rpb24gZ2V0RW5jb2RlZEJpdHMgKGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrKSB7XHJcbiAgY29uc3QgZGF0YSA9ICgoZXJyb3JDb3JyZWN0aW9uTGV2ZWwuYml0IDw8IDMpIHwgbWFzaylcclxuICBsZXQgZCA9IGRhdGEgPDwgMTBcclxuXHJcbiAgd2hpbGUgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE1X0JDSCA+PSAwKSB7XHJcbiAgICBkIF49IChHMTUgPDwgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE1X0JDSCkpXHJcbiAgfVxyXG5cclxuICAvLyB4b3IgZmluYWwgZGF0YSB3aXRoIG1hc2sgcGF0dGVybiBpbiBvcmRlciB0byBlbnN1cmUgdGhhdFxyXG4gIC8vIG5vIGNvbWJpbmF0aW9uIG9mIEVycm9yIENvcnJlY3Rpb24gTGV2ZWwgYW5kIGRhdGEgbWFzayBwYXR0ZXJuXHJcbiAgLy8gd2lsbCByZXN1bHQgaW4gYW4gYWxsLXplcm8gZGF0YSBzdHJpbmdcclxuICByZXR1cm4gKChkYXRhIDw8IDEwKSB8IGQpIF4gRzE1X01BU0tcclxufVxyXG4iLCJjb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcclxuXHJcbmZ1bmN0aW9uIE51bWVyaWNEYXRhIChkYXRhKSB7XHJcbiAgdGhpcy5tb2RlID0gTW9kZS5OVU1FUklDXHJcbiAgdGhpcy5kYXRhID0gZGF0YS50b1N0cmluZygpXHJcbn1cclxuXHJcbk51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoIChsZW5ndGgpIHtcclxuICByZXR1cm4gMTAgKiBNYXRoLmZsb29yKGxlbmd0aCAvIDMpICsgKChsZW5ndGggJSAzKSA/ICgobGVuZ3RoICUgMykgKiAzICsgMSkgOiAwKVxyXG59XHJcblxyXG5OdW1lcmljRGF0YS5wcm90b3R5cGUuZ2V0TGVuZ3RoID0gZnVuY3Rpb24gZ2V0TGVuZ3RoICgpIHtcclxuICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aFxyXG59XHJcblxyXG5OdW1lcmljRGF0YS5wcm90b3R5cGUuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKCkge1xyXG4gIHJldHVybiBOdW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoKHRoaXMuZGF0YS5sZW5ndGgpXHJcbn1cclxuXHJcbk51bWVyaWNEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChiaXRCdWZmZXIpIHtcclxuICBsZXQgaSwgZ3JvdXAsIHZhbHVlXHJcblxyXG4gIC8vIFRoZSBpbnB1dCBkYXRhIHN0cmluZyBpcyBkaXZpZGVkIGludG8gZ3JvdXBzIG9mIHRocmVlIGRpZ2l0cyxcclxuICAvLyBhbmQgZWFjaCBncm91cCBpcyBjb252ZXJ0ZWQgdG8gaXRzIDEwLWJpdCBiaW5hcnkgZXF1aXZhbGVudC5cclxuICBmb3IgKGkgPSAwOyBpICsgMyA8PSB0aGlzLmRhdGEubGVuZ3RoOyBpICs9IDMpIHtcclxuICAgIGdyb3VwID0gdGhpcy5kYXRhLnN1YnN0cihpLCAzKVxyXG4gICAgdmFsdWUgPSBwYXJzZUludChncm91cCwgMTApXHJcblxyXG4gICAgYml0QnVmZmVyLnB1dCh2YWx1ZSwgMTApXHJcbiAgfVxyXG5cclxuICAvLyBJZiB0aGUgbnVtYmVyIG9mIGlucHV0IGRpZ2l0cyBpcyBub3QgYW4gZXhhY3QgbXVsdGlwbGUgb2YgdGhyZWUsXHJcbiAgLy8gdGhlIGZpbmFsIG9uZSBvciB0d28gZGlnaXRzIGFyZSBjb252ZXJ0ZWQgdG8gNCBvciA3IGJpdHMgcmVzcGVjdGl2ZWx5LlxyXG4gIGNvbnN0IHJlbWFpbmluZ051bSA9IHRoaXMuZGF0YS5sZW5ndGggLSBpXHJcbiAgaWYgKHJlbWFpbmluZ051bSA+IDApIHtcclxuICAgIGdyb3VwID0gdGhpcy5kYXRhLnN1YnN0cihpKVxyXG4gICAgdmFsdWUgPSBwYXJzZUludChncm91cCwgMTApXHJcblxyXG4gICAgYml0QnVmZmVyLnB1dCh2YWx1ZSwgcmVtYWluaW5nTnVtICogMyArIDEpXHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE51bWVyaWNEYXRhXHJcbiIsImNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxyXG5cclxuLyoqXHJcbiAqIEFycmF5IG9mIGNoYXJhY3RlcnMgYXZhaWxhYmxlIGluIGFscGhhbnVtZXJpYyBtb2RlXHJcbiAqXHJcbiAqIEFzIHBlciBRUiBDb2RlIHNwZWNpZmljYXRpb24sIHRvIGVhY2ggY2hhcmFjdGVyXHJcbiAqIGlzIGFzc2lnbmVkIGEgdmFsdWUgZnJvbSAwIHRvIDQ0IHdoaWNoIGluIHRoaXMgY2FzZSBjb2luY2lkZXNcclxuICogd2l0aCB0aGUgYXJyYXkgaW5kZXhcclxuICpcclxuICogQHR5cGUge0FycmF5fVxyXG4gKi9cclxuY29uc3QgQUxQSEFfTlVNX0NIQVJTID0gW1xyXG4gICcwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JyxcclxuICAnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLCAnSicsICdLJywgJ0wnLCAnTScsXHJcbiAgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onLFxyXG4gICcgJywgJyQnLCAnJScsICcqJywgJysnLCAnLScsICcuJywgJy8nLCAnOidcclxuXVxyXG5cclxuZnVuY3Rpb24gQWxwaGFudW1lcmljRGF0YSAoZGF0YSkge1xyXG4gIHRoaXMubW9kZSA9IE1vZGUuQUxQSEFOVU1FUklDXHJcbiAgdGhpcy5kYXRhID0gZGF0YVxyXG59XHJcblxyXG5BbHBoYW51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoIChsZW5ndGgpIHtcclxuICByZXR1cm4gMTEgKiBNYXRoLmZsb29yKGxlbmd0aCAvIDIpICsgNiAqIChsZW5ndGggJSAyKVxyXG59XHJcblxyXG5BbHBoYW51bWVyaWNEYXRhLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbiBnZXRMZW5ndGggKCkge1xyXG4gIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoXHJcbn1cclxuXHJcbkFscGhhbnVtZXJpY0RhdGEucHJvdG90eXBlLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoICgpIHtcclxuICByZXR1cm4gQWxwaGFudW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoKHRoaXMuZGF0YS5sZW5ndGgpXHJcbn1cclxuXHJcbkFscGhhbnVtZXJpY0RhdGEucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKGJpdEJ1ZmZlcikge1xyXG4gIGxldCBpXHJcblxyXG4gIC8vIElucHV0IGRhdGEgY2hhcmFjdGVycyBhcmUgZGl2aWRlZCBpbnRvIGdyb3VwcyBvZiB0d28gY2hhcmFjdGVyc1xyXG4gIC8vIGFuZCBlbmNvZGVkIGFzIDExLWJpdCBiaW5hcnkgY29kZXMuXHJcbiAgZm9yIChpID0gMDsgaSArIDIgPD0gdGhpcy5kYXRhLmxlbmd0aDsgaSArPSAyKSB7XHJcbiAgICAvLyBUaGUgY2hhcmFjdGVyIHZhbHVlIG9mIHRoZSBmaXJzdCBjaGFyYWN0ZXIgaXMgbXVsdGlwbGllZCBieSA0NVxyXG4gICAgbGV0IHZhbHVlID0gQUxQSEFfTlVNX0NIQVJTLmluZGV4T2YodGhpcy5kYXRhW2ldKSAqIDQ1XHJcblxyXG4gICAgLy8gVGhlIGNoYXJhY3RlciB2YWx1ZSBvZiB0aGUgc2Vjb25kIGRpZ2l0IGlzIGFkZGVkIHRvIHRoZSBwcm9kdWN0XHJcbiAgICB2YWx1ZSArPSBBTFBIQV9OVU1fQ0hBUlMuaW5kZXhPZih0aGlzLmRhdGFbaSArIDFdKVxyXG5cclxuICAgIC8vIFRoZSBzdW0gaXMgdGhlbiBzdG9yZWQgYXMgMTEtYml0IGJpbmFyeSBudW1iZXJcclxuICAgIGJpdEJ1ZmZlci5wdXQodmFsdWUsIDExKVxyXG4gIH1cclxuXHJcbiAgLy8gSWYgdGhlIG51bWJlciBvZiBpbnB1dCBkYXRhIGNoYXJhY3RlcnMgaXMgbm90IGEgbXVsdGlwbGUgb2YgdHdvLFxyXG4gIC8vIHRoZSBjaGFyYWN0ZXIgdmFsdWUgb2YgdGhlIGZpbmFsIGNoYXJhY3RlciBpcyBlbmNvZGVkIGFzIGEgNi1iaXQgYmluYXJ5IG51bWJlci5cclxuICBpZiAodGhpcy5kYXRhLmxlbmd0aCAlIDIpIHtcclxuICAgIGJpdEJ1ZmZlci5wdXQoQUxQSEFfTlVNX0NIQVJTLmluZGV4T2YodGhpcy5kYXRhW2ldKSwgNilcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWxwaGFudW1lcmljRGF0YVxyXG4iLCJjb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcclxuXHJcbmZ1bmN0aW9uIEJ5dGVEYXRhIChkYXRhKSB7XHJcbiAgdGhpcy5tb2RlID0gTW9kZS5CWVRFXHJcbiAgaWYgKHR5cGVvZiAoZGF0YSkgPT09ICdzdHJpbmcnKSB7XHJcbiAgICB0aGlzLmRhdGEgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoZGF0YSlcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5kYXRhID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSlcclxuICB9XHJcbn1cclxuXHJcbkJ5dGVEYXRhLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoIChsZW5ndGgpIHtcclxuICByZXR1cm4gbGVuZ3RoICogOFxyXG59XHJcblxyXG5CeXRlRGF0YS5wcm90b3R5cGUuZ2V0TGVuZ3RoID0gZnVuY3Rpb24gZ2V0TGVuZ3RoICgpIHtcclxuICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aFxyXG59XHJcblxyXG5CeXRlRGF0YS5wcm90b3R5cGUuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKCkge1xyXG4gIHJldHVybiBCeXRlRGF0YS5nZXRCaXRzTGVuZ3RoKHRoaXMuZGF0YS5sZW5ndGgpXHJcbn1cclxuXHJcbkJ5dGVEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChiaXRCdWZmZXIpIHtcclxuICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMuZGF0YS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgIGJpdEJ1ZmZlci5wdXQodGhpcy5kYXRhW2ldLCA4KVxyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCeXRlRGF0YVxyXG4iLCJjb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcclxuY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcclxuXHJcbmZ1bmN0aW9uIEthbmppRGF0YSAoZGF0YSkge1xyXG4gIHRoaXMubW9kZSA9IE1vZGUuS0FOSklcclxuICB0aGlzLmRhdGEgPSBkYXRhXHJcbn1cclxuXHJcbkthbmppRGF0YS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAobGVuZ3RoKSB7XHJcbiAgcmV0dXJuIGxlbmd0aCAqIDEzXHJcbn1cclxuXHJcbkthbmppRGF0YS5wcm90b3R5cGUuZ2V0TGVuZ3RoID0gZnVuY3Rpb24gZ2V0TGVuZ3RoICgpIHtcclxuICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aFxyXG59XHJcblxyXG5LYW5qaURhdGEucHJvdG90eXBlLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoICgpIHtcclxuICByZXR1cm4gS2FuamlEYXRhLmdldEJpdHNMZW5ndGgodGhpcy5kYXRhLmxlbmd0aClcclxufVxyXG5cclxuS2FuamlEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChiaXRCdWZmZXIpIHtcclxuICBsZXQgaVxyXG5cclxuICAvLyBJbiB0aGUgU2hpZnQgSklTIHN5c3RlbSwgS2FuamkgY2hhcmFjdGVycyBhcmUgcmVwcmVzZW50ZWQgYnkgYSB0d28gYnl0ZSBjb21iaW5hdGlvbi5cclxuICAvLyBUaGVzZSBieXRlIHZhbHVlcyBhcmUgc2hpZnRlZCBmcm9tIHRoZSBKSVMgWCAwMjA4IHZhbHVlcy5cclxuICAvLyBKSVMgWCAwMjA4IGdpdmVzIGRldGFpbHMgb2YgdGhlIHNoaWZ0IGNvZGVkIHJlcHJlc2VudGF0aW9uLlxyXG4gIGZvciAoaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgIGxldCB2YWx1ZSA9IFV0aWxzLnRvU0pJUyh0aGlzLmRhdGFbaV0pXHJcblxyXG4gICAgLy8gRm9yIGNoYXJhY3RlcnMgd2l0aCBTaGlmdCBKSVMgdmFsdWVzIGZyb20gMHg4MTQwIHRvIDB4OUZGQzpcclxuICAgIGlmICh2YWx1ZSA+PSAweDgxNDAgJiYgdmFsdWUgPD0gMHg5RkZDKSB7XHJcbiAgICAgIC8vIFN1YnRyYWN0IDB4ODE0MCBmcm9tIFNoaWZ0IEpJUyB2YWx1ZVxyXG4gICAgICB2YWx1ZSAtPSAweDgxNDBcclxuXHJcbiAgICAvLyBGb3IgY2hhcmFjdGVycyB3aXRoIFNoaWZ0IEpJUyB2YWx1ZXMgZnJvbSAweEUwNDAgdG8gMHhFQkJGXHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID49IDB4RTA0MCAmJiB2YWx1ZSA8PSAweEVCQkYpIHtcclxuICAgICAgLy8gU3VidHJhY3QgMHhDMTQwIGZyb20gU2hpZnQgSklTIHZhbHVlXHJcbiAgICAgIHZhbHVlIC09IDB4QzE0MFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICdJbnZhbGlkIFNKSVMgY2hhcmFjdGVyOiAnICsgdGhpcy5kYXRhW2ldICsgJ1xcbicgK1xyXG4gICAgICAgICdNYWtlIHN1cmUgeW91ciBjaGFyc2V0IGlzIFVURi04JylcclxuICAgIH1cclxuXHJcbiAgICAvLyBNdWx0aXBseSBtb3N0IHNpZ25pZmljYW50IGJ5dGUgb2YgcmVzdWx0IGJ5IDB4QzBcclxuICAgIC8vIGFuZCBhZGQgbGVhc3Qgc2lnbmlmaWNhbnQgYnl0ZSB0byBwcm9kdWN0XHJcbiAgICB2YWx1ZSA9ICgoKHZhbHVlID4+PiA4KSAmIDB4ZmYpICogMHhDMCkgKyAodmFsdWUgJiAweGZmKVxyXG5cclxuICAgIC8vIENvbnZlcnQgcmVzdWx0IHRvIGEgMTMtYml0IGJpbmFyeSBzdHJpbmdcclxuICAgIGJpdEJ1ZmZlci5wdXQodmFsdWUsIDEzKVxyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBLYW5qaURhdGFcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gKiBDcmVhdGVkIDIwMDgtMDgtMTkuXHJcbiAqXHJcbiAqIERpamtzdHJhIHBhdGgtZmluZGluZyBmdW5jdGlvbnMuIEFkYXB0ZWQgZnJvbSB0aGUgRGlqa3N0YXIgUHl0aG9uIHByb2plY3QuXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoQykgMjAwOFxyXG4gKiAgIFd5YXR0IEJhbGR3aW4gPHNlbGZAd3lhdHRiYWxkd2luLmNvbT5cclxuICogICBBbGwgcmlnaHRzIHJlc2VydmVkXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cclxuICpcclxuICogICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXHJcbiAqIFRIRSBTT0ZUV0FSRS5cclxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG52YXIgZGlqa3N0cmEgPSB7XHJcbiAgc2luZ2xlX3NvdXJjZV9zaG9ydGVzdF9wYXRoczogZnVuY3Rpb24oZ3JhcGgsIHMsIGQpIHtcclxuICAgIC8vIFByZWRlY2Vzc29yIG1hcCBmb3IgZWFjaCBub2RlIHRoYXQgaGFzIGJlZW4gZW5jb3VudGVyZWQuXHJcbiAgICAvLyBub2RlIElEID0+IHByZWRlY2Vzc29yIG5vZGUgSURcclxuICAgIHZhciBwcmVkZWNlc3NvcnMgPSB7fTtcclxuXHJcbiAgICAvLyBDb3N0cyBvZiBzaG9ydGVzdCBwYXRocyBmcm9tIHMgdG8gYWxsIG5vZGVzIGVuY291bnRlcmVkLlxyXG4gICAgLy8gbm9kZSBJRCA9PiBjb3N0XHJcbiAgICB2YXIgY29zdHMgPSB7fTtcclxuICAgIGNvc3RzW3NdID0gMDtcclxuXHJcbiAgICAvLyBDb3N0cyBvZiBzaG9ydGVzdCBwYXRocyBmcm9tIHMgdG8gYWxsIG5vZGVzIGVuY291bnRlcmVkOyBkaWZmZXJzIGZyb21cclxuICAgIC8vIGBjb3N0c2AgaW4gdGhhdCBpdCBwcm92aWRlcyBlYXN5IGFjY2VzcyB0byB0aGUgbm9kZSB0aGF0IGN1cnJlbnRseSBoYXNcclxuICAgIC8vIHRoZSBrbm93biBzaG9ydGVzdCBwYXRoIGZyb20gcy5cclxuICAgIC8vIFhYWDogRG8gd2UgYWN0dWFsbHkgbmVlZCBib3RoIGBjb3N0c2AgYW5kIGBvcGVuYD9cclxuICAgIHZhciBvcGVuID0gZGlqa3N0cmEuUHJpb3JpdHlRdWV1ZS5tYWtlKCk7XHJcbiAgICBvcGVuLnB1c2gocywgMCk7XHJcblxyXG4gICAgdmFyIGNsb3Nlc3QsXHJcbiAgICAgICAgdSwgdixcclxuICAgICAgICBjb3N0X29mX3NfdG9fdSxcclxuICAgICAgICBhZGphY2VudF9ub2RlcyxcclxuICAgICAgICBjb3N0X29mX2UsXHJcbiAgICAgICAgY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2UsXHJcbiAgICAgICAgY29zdF9vZl9zX3RvX3YsXHJcbiAgICAgICAgZmlyc3RfdmlzaXQ7XHJcbiAgICB3aGlsZSAoIW9wZW4uZW1wdHkoKSkge1xyXG4gICAgICAvLyBJbiB0aGUgbm9kZXMgcmVtYWluaW5nIGluIGdyYXBoIHRoYXQgaGF2ZSBhIGtub3duIGNvc3QgZnJvbSBzLFxyXG4gICAgICAvLyBmaW5kIHRoZSBub2RlLCB1LCB0aGF0IGN1cnJlbnRseSBoYXMgdGhlIHNob3J0ZXN0IHBhdGggZnJvbSBzLlxyXG4gICAgICBjbG9zZXN0ID0gb3Blbi5wb3AoKTtcclxuICAgICAgdSA9IGNsb3Nlc3QudmFsdWU7XHJcbiAgICAgIGNvc3Rfb2Zfc190b191ID0gY2xvc2VzdC5jb3N0O1xyXG5cclxuICAgICAgLy8gR2V0IG5vZGVzIGFkamFjZW50IHRvIHUuLi5cclxuICAgICAgYWRqYWNlbnRfbm9kZXMgPSBncmFwaFt1XSB8fCB7fTtcclxuXHJcbiAgICAgIC8vIC4uLmFuZCBleHBsb3JlIHRoZSBlZGdlcyB0aGF0IGNvbm5lY3QgdSB0byB0aG9zZSBub2RlcywgdXBkYXRpbmdcclxuICAgICAgLy8gdGhlIGNvc3Qgb2YgdGhlIHNob3J0ZXN0IHBhdGhzIHRvIGFueSBvciBhbGwgb2YgdGhvc2Ugbm9kZXMgYXNcclxuICAgICAgLy8gbmVjZXNzYXJ5LiB2IGlzIHRoZSBub2RlIGFjcm9zcyB0aGUgY3VycmVudCBlZGdlIGZyb20gdS5cclxuICAgICAgZm9yICh2IGluIGFkamFjZW50X25vZGVzKSB7XHJcbiAgICAgICAgaWYgKGFkamFjZW50X25vZGVzLmhhc093blByb3BlcnR5KHYpKSB7XHJcbiAgICAgICAgICAvLyBHZXQgdGhlIGNvc3Qgb2YgdGhlIGVkZ2UgcnVubmluZyBmcm9tIHUgdG8gdi5cclxuICAgICAgICAgIGNvc3Rfb2ZfZSA9IGFkamFjZW50X25vZGVzW3ZdO1xyXG5cclxuICAgICAgICAgIC8vIENvc3Qgb2YgcyB0byB1IHBsdXMgdGhlIGNvc3Qgb2YgdSB0byB2IGFjcm9zcyBlLS10aGlzIGlzICphKlxyXG4gICAgICAgICAgLy8gY29zdCBmcm9tIHMgdG8gdiB0aGF0IG1heSBvciBtYXkgbm90IGJlIGxlc3MgdGhhbiB0aGUgY3VycmVudFxyXG4gICAgICAgICAgLy8ga25vd24gY29zdCB0byB2LlxyXG4gICAgICAgICAgY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2UgPSBjb3N0X29mX3NfdG9fdSArIGNvc3Rfb2ZfZTtcclxuXHJcbiAgICAgICAgICAvLyBJZiB3ZSBoYXZlbid0IHZpc2l0ZWQgdiB5ZXQgT1IgaWYgdGhlIGN1cnJlbnQga25vd24gY29zdCBmcm9tIHMgdG9cclxuICAgICAgICAgIC8vIHYgaXMgZ3JlYXRlciB0aGFuIHRoZSBuZXcgY29zdCB3ZSBqdXN0IGZvdW5kIChjb3N0IG9mIHMgdG8gdSBwbHVzXHJcbiAgICAgICAgICAvLyBjb3N0IG9mIHUgdG8gdiBhY3Jvc3MgZSksIHVwZGF0ZSB2J3MgY29zdCBpbiB0aGUgY29zdCBsaXN0IGFuZFxyXG4gICAgICAgICAgLy8gdXBkYXRlIHYncyBwcmVkZWNlc3NvciBpbiB0aGUgcHJlZGVjZXNzb3IgbGlzdCAoaXQncyBub3cgdSkuXHJcbiAgICAgICAgICBjb3N0X29mX3NfdG9fdiA9IGNvc3RzW3ZdO1xyXG4gICAgICAgICAgZmlyc3RfdmlzaXQgPSAodHlwZW9mIGNvc3RzW3ZdID09PSAndW5kZWZpbmVkJyk7XHJcbiAgICAgICAgICBpZiAoZmlyc3RfdmlzaXQgfHwgY29zdF9vZl9zX3RvX3YgPiBjb3N0X29mX3NfdG9fdV9wbHVzX2Nvc3Rfb2ZfZSkge1xyXG4gICAgICAgICAgICBjb3N0c1t2XSA9IGNvc3Rfb2Zfc190b191X3BsdXNfY29zdF9vZl9lO1xyXG4gICAgICAgICAgICBvcGVuLnB1c2godiwgY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2UpO1xyXG4gICAgICAgICAgICBwcmVkZWNlc3NvcnNbdl0gPSB1O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgZCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNvc3RzW2RdID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB2YXIgbXNnID0gWydDb3VsZCBub3QgZmluZCBhIHBhdGggZnJvbSAnLCBzLCAnIHRvICcsIGQsICcuJ10uam9pbignJyk7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwcmVkZWNlc3NvcnM7XHJcbiAgfSxcclxuXHJcbiAgZXh0cmFjdF9zaG9ydGVzdF9wYXRoX2Zyb21fcHJlZGVjZXNzb3JfbGlzdDogZnVuY3Rpb24ocHJlZGVjZXNzb3JzLCBkKSB7XHJcbiAgICB2YXIgbm9kZXMgPSBbXTtcclxuICAgIHZhciB1ID0gZDtcclxuICAgIHZhciBwcmVkZWNlc3NvcjtcclxuICAgIHdoaWxlICh1KSB7XHJcbiAgICAgIG5vZGVzLnB1c2godSk7XHJcbiAgICAgIHByZWRlY2Vzc29yID0gcHJlZGVjZXNzb3JzW3VdO1xyXG4gICAgICB1ID0gcHJlZGVjZXNzb3JzW3VdO1xyXG4gICAgfVxyXG4gICAgbm9kZXMucmV2ZXJzZSgpO1xyXG4gICAgcmV0dXJuIG5vZGVzO1xyXG4gIH0sXHJcblxyXG4gIGZpbmRfcGF0aDogZnVuY3Rpb24oZ3JhcGgsIHMsIGQpIHtcclxuICAgIHZhciBwcmVkZWNlc3NvcnMgPSBkaWprc3RyYS5zaW5nbGVfc291cmNlX3Nob3J0ZXN0X3BhdGhzKGdyYXBoLCBzLCBkKTtcclxuICAgIHJldHVybiBkaWprc3RyYS5leHRyYWN0X3Nob3J0ZXN0X3BhdGhfZnJvbV9wcmVkZWNlc3Nvcl9saXN0KFxyXG4gICAgICBwcmVkZWNlc3NvcnMsIGQpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEEgdmVyeSBuYWl2ZSBwcmlvcml0eSBxdWV1ZSBpbXBsZW1lbnRhdGlvbi5cclxuICAgKi9cclxuICBQcmlvcml0eVF1ZXVlOiB7XHJcbiAgICBtYWtlOiBmdW5jdGlvbiAob3B0cykge1xyXG4gICAgICB2YXIgVCA9IGRpamtzdHJhLlByaW9yaXR5UXVldWUsXHJcbiAgICAgICAgICB0ID0ge30sXHJcbiAgICAgICAgICBrZXk7XHJcbiAgICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xyXG4gICAgICBmb3IgKGtleSBpbiBUKSB7XHJcbiAgICAgICAgaWYgKFQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgdFtrZXldID0gVFtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICB0LnF1ZXVlID0gW107XHJcbiAgICAgIHQuc29ydGVyID0gb3B0cy5zb3J0ZXIgfHwgVC5kZWZhdWx0X3NvcnRlcjtcclxuICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGRlZmF1bHRfc29ydGVyOiBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICByZXR1cm4gYS5jb3N0IC0gYi5jb3N0O1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIG5ldyBpdGVtIHRvIHRoZSBxdWV1ZSBhbmQgZW5zdXJlIHRoZSBoaWdoZXN0IHByaW9yaXR5IGVsZW1lbnRcclxuICAgICAqIGlzIGF0IHRoZSBmcm9udCBvZiB0aGUgcXVldWUuXHJcbiAgICAgKi9cclxuICAgIHB1c2g6IGZ1bmN0aW9uICh2YWx1ZSwgY29zdCkge1xyXG4gICAgICB2YXIgaXRlbSA9IHt2YWx1ZTogdmFsdWUsIGNvc3Q6IGNvc3R9O1xyXG4gICAgICB0aGlzLnF1ZXVlLnB1c2goaXRlbSk7XHJcbiAgICAgIHRoaXMucXVldWUuc29ydCh0aGlzLnNvcnRlcik7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRoZSBoaWdoZXN0IHByaW9yaXR5IGVsZW1lbnQgaW4gdGhlIHF1ZXVlLlxyXG4gICAgICovXHJcbiAgICBwb3A6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMucXVldWUuc2hpZnQoKTtcclxuICAgIH0sXHJcblxyXG4gICAgZW1wdHk6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMucXVldWUubGVuZ3RoID09PSAwO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcblxyXG4vLyBub2RlLmpzIG1vZHVsZSBleHBvcnRzXHJcbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xyXG4gIG1vZHVsZS5leHBvcnRzID0gZGlqa3N0cmE7XHJcbn1cclxuIiwiY29uc3QgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXHJcbmNvbnN0IE51bWVyaWNEYXRhID0gcmVxdWlyZSgnLi9udW1lcmljLWRhdGEnKVxyXG5jb25zdCBBbHBoYW51bWVyaWNEYXRhID0gcmVxdWlyZSgnLi9hbHBoYW51bWVyaWMtZGF0YScpXHJcbmNvbnN0IEJ5dGVEYXRhID0gcmVxdWlyZSgnLi9ieXRlLWRhdGEnKVxyXG5jb25zdCBLYW5qaURhdGEgPSByZXF1aXJlKCcuL2thbmppLWRhdGEnKVxyXG5jb25zdCBSZWdleCA9IHJlcXVpcmUoJy4vcmVnZXgnKVxyXG5jb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5jb25zdCBkaWprc3RyYSA9IHJlcXVpcmUoJ2RpamtzdHJhanMnKVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgVVRGOCBieXRlIGxlbmd0aFxyXG4gKlxyXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciBJbnB1dCBzdHJpbmdcclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgTnVtYmVyIG9mIGJ5dGVcclxuICovXHJcbmZ1bmN0aW9uIGdldFN0cmluZ0J5dGVMZW5ndGggKHN0cikge1xyXG4gIHJldHVybiB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoc3RyKSkubGVuZ3RoXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgYSBsaXN0IG9mIHNlZ21lbnRzIG9mIHRoZSBzcGVjaWZpZWQgbW9kZVxyXG4gKiBmcm9tIGEgc3RyaW5nXHJcbiAqXHJcbiAqIEBwYXJhbSAge01vZGV9ICAgbW9kZSBTZWdtZW50IG1vZGVcclxuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgIFN0cmluZyB0byBwcm9jZXNzXHJcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRTZWdtZW50cyAocmVnZXgsIG1vZGUsIHN0cikge1xyXG4gIGNvbnN0IHNlZ21lbnRzID0gW11cclxuICBsZXQgcmVzdWx0XHJcblxyXG4gIHdoaWxlICgocmVzdWx0ID0gcmVnZXguZXhlYyhzdHIpKSAhPT0gbnVsbCkge1xyXG4gICAgc2VnbWVudHMucHVzaCh7XHJcbiAgICAgIGRhdGE6IHJlc3VsdFswXSxcclxuICAgICAgaW5kZXg6IHJlc3VsdC5pbmRleCxcclxuICAgICAgbW9kZTogbW9kZSxcclxuICAgICAgbGVuZ3RoOiByZXN1bHRbMF0ubGVuZ3RoXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHNlZ21lbnRzXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFeHRyYWN0cyBhIHNlcmllcyBvZiBzZWdtZW50cyB3aXRoIHRoZSBhcHByb3ByaWF0ZVxyXG4gKiBtb2RlcyBmcm9tIGEgc3RyaW5nXHJcbiAqXHJcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YVN0ciBJbnB1dCBzdHJpbmdcclxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcclxuICovXHJcbmZ1bmN0aW9uIGdldFNlZ21lbnRzRnJvbVN0cmluZyAoZGF0YVN0cikge1xyXG4gIGNvbnN0IG51bVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5OVU1FUklDLCBNb2RlLk5VTUVSSUMsIGRhdGFTdHIpXHJcbiAgY29uc3QgYWxwaGFOdW1TZWdzID0gZ2V0U2VnbWVudHMoUmVnZXguQUxQSEFOVU1FUklDLCBNb2RlLkFMUEhBTlVNRVJJQywgZGF0YVN0cilcclxuICBsZXQgYnl0ZVNlZ3NcclxuICBsZXQga2FuamlTZWdzXHJcblxyXG4gIGlmIChVdGlscy5pc0thbmppTW9kZUVuYWJsZWQoKSkge1xyXG4gICAgYnl0ZVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5CWVRFLCBNb2RlLkJZVEUsIGRhdGFTdHIpXHJcbiAgICBrYW5qaVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5LQU5KSSwgTW9kZS5LQU5KSSwgZGF0YVN0cilcclxuICB9IGVsc2Uge1xyXG4gICAgYnl0ZVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5CWVRFX0tBTkpJLCBNb2RlLkJZVEUsIGRhdGFTdHIpXHJcbiAgICBrYW5qaVNlZ3MgPSBbXVxyXG4gIH1cclxuXHJcbiAgY29uc3Qgc2VncyA9IG51bVNlZ3MuY29uY2F0KGFscGhhTnVtU2VncywgYnl0ZVNlZ3MsIGthbmppU2VncylcclxuXHJcbiAgcmV0dXJuIHNlZ3NcclxuICAgIC5zb3J0KGZ1bmN0aW9uIChzMSwgczIpIHtcclxuICAgICAgcmV0dXJuIHMxLmluZGV4IC0gczIuaW5kZXhcclxuICAgIH0pXHJcbiAgICAubWFwKGZ1bmN0aW9uIChvYmopIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBkYXRhOiBvYmouZGF0YSxcclxuICAgICAgICBtb2RlOiBvYmoubW9kZSxcclxuICAgICAgICBsZW5ndGg6IG9iai5sZW5ndGhcclxuICAgICAgfVxyXG4gICAgfSlcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgaG93IG1hbnkgYml0cyBhcmUgbmVlZGVkIHRvIGVuY29kZSBhIHN0cmluZyBvZlxyXG4gKiBzcGVjaWZpZWQgbGVuZ3RoIHdpdGggdGhlIHNwZWNpZmllZCBtb2RlXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gbGVuZ3RoIFN0cmluZyBsZW5ndGhcclxuICogQHBhcmFtICB7TW9kZX0gbW9kZSAgICAgU2VnbWVudCBtb2RlXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgIEJpdCBsZW5ndGhcclxuICovXHJcbmZ1bmN0aW9uIGdldFNlZ21lbnRCaXRzTGVuZ3RoIChsZW5ndGgsIG1vZGUpIHtcclxuICBzd2l0Y2ggKG1vZGUpIHtcclxuICAgIGNhc2UgTW9kZS5OVU1FUklDOlxyXG4gICAgICByZXR1cm4gTnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aChsZW5ndGgpXHJcbiAgICBjYXNlIE1vZGUuQUxQSEFOVU1FUklDOlxyXG4gICAgICByZXR1cm4gQWxwaGFudW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcclxuICAgIGNhc2UgTW9kZS5LQU5KSTpcclxuICAgICAgcmV0dXJuIEthbmppRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcclxuICAgIGNhc2UgTW9kZS5CWVRFOlxyXG4gICAgICByZXR1cm4gQnl0ZURhdGEuZ2V0Qml0c0xlbmd0aChsZW5ndGgpXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogTWVyZ2VzIGFkamFjZW50IHNlZ21lbnRzIHdoaWNoIGhhdmUgdGhlIHNhbWUgbW9kZVxyXG4gKlxyXG4gKiBAcGFyYW0gIHtBcnJheX0gc2VncyBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXHJcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcclxuICovXHJcbmZ1bmN0aW9uIG1lcmdlU2VnbWVudHMgKHNlZ3MpIHtcclxuICByZXR1cm4gc2Vncy5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgY3Vycikge1xyXG4gICAgY29uc3QgcHJldlNlZyA9IGFjYy5sZW5ndGggLSAxID49IDAgPyBhY2NbYWNjLmxlbmd0aCAtIDFdIDogbnVsbFxyXG4gICAgaWYgKHByZXZTZWcgJiYgcHJldlNlZy5tb2RlID09PSBjdXJyLm1vZGUpIHtcclxuICAgICAgYWNjW2FjYy5sZW5ndGggLSAxXS5kYXRhICs9IGN1cnIuZGF0YVxyXG4gICAgICByZXR1cm4gYWNjXHJcbiAgICB9XHJcblxyXG4gICAgYWNjLnB1c2goY3VycilcclxuICAgIHJldHVybiBhY2NcclxuICB9LCBbXSlcclxufVxyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIGxpc3Qgb2YgYWxsIHBvc3NpYmxlIG5vZGVzIGNvbWJpbmF0aW9uIHdoaWNoXHJcbiAqIHdpbGwgYmUgdXNlZCB0byBidWlsZCBhIHNlZ21lbnRzIGdyYXBoLlxyXG4gKlxyXG4gKiBOb2RlcyBhcmUgZGl2aWRlZCBieSBncm91cHMuIEVhY2ggZ3JvdXAgd2lsbCBjb250YWluIGEgbGlzdCBvZiBhbGwgdGhlIG1vZGVzXHJcbiAqIGluIHdoaWNoIGlzIHBvc3NpYmxlIHRvIGVuY29kZSB0aGUgZ2l2ZW4gdGV4dC5cclxuICpcclxuICogRm9yIGV4YW1wbGUgdGhlIHRleHQgJzEyMzQ1JyBjYW4gYmUgZW5jb2RlZCBhcyBOdW1lcmljLCBBbHBoYW51bWVyaWMgb3IgQnl0ZS5cclxuICogVGhlIGdyb3VwIGZvciAnMTIzNDUnIHdpbGwgY29udGFpbiB0aGVuIDMgb2JqZWN0cywgb25lIGZvciBlYWNoXHJcbiAqIHBvc3NpYmxlIGVuY29kaW5nIG1vZGUuXHJcbiAqXHJcbiAqIEVhY2ggbm9kZSByZXByZXNlbnRzIGEgcG9zc2libGUgc2VnbWVudC5cclxuICpcclxuICogQHBhcmFtICB7QXJyYXl9IHNlZ3MgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXHJcbiAqL1xyXG5mdW5jdGlvbiBidWlsZE5vZGVzIChzZWdzKSB7XHJcbiAgY29uc3Qgbm9kZXMgPSBbXVxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2Vncy5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3Qgc2VnID0gc2Vnc1tpXVxyXG5cclxuICAgIHN3aXRjaCAoc2VnLm1vZGUpIHtcclxuICAgICAgY2FzZSBNb2RlLk5VTUVSSUM6XHJcbiAgICAgICAgbm9kZXMucHVzaChbc2VnLFxyXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5BTFBIQU5VTUVSSUMsIGxlbmd0aDogc2VnLmxlbmd0aCB9LFxyXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5CWVRFLCBsZW5ndGg6IHNlZy5sZW5ndGggfVxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSBNb2RlLkFMUEhBTlVNRVJJQzpcclxuICAgICAgICBub2Rlcy5wdXNoKFtzZWcsXHJcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkJZVEUsIGxlbmd0aDogc2VnLmxlbmd0aCB9XHJcbiAgICAgICAgXSlcclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlIE1vZGUuS0FOSkk6XHJcbiAgICAgICAgbm9kZXMucHVzaChbc2VnLFxyXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5CWVRFLCBsZW5ndGg6IGdldFN0cmluZ0J5dGVMZW5ndGgoc2VnLmRhdGEpIH1cclxuICAgICAgICBdKVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGNhc2UgTW9kZS5CWVRFOlxyXG4gICAgICAgIG5vZGVzLnB1c2goW1xyXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5CWVRFLCBsZW5ndGg6IGdldFN0cmluZ0J5dGVMZW5ndGgoc2VnLmRhdGEpIH1cclxuICAgICAgICBdKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG5vZGVzXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgYSBncmFwaCBmcm9tIGEgbGlzdCBvZiBub2Rlcy5cclxuICogQWxsIHNlZ21lbnRzIGluIGVhY2ggbm9kZSBncm91cCB3aWxsIGJlIGNvbm5lY3RlZCB3aXRoIGFsbCB0aGUgc2VnbWVudHMgb2ZcclxuICogdGhlIG5leHQgZ3JvdXAgYW5kIHNvIG9uLlxyXG4gKlxyXG4gKiBBdCBlYWNoIGNvbm5lY3Rpb24gd2lsbCBiZSBhc3NpZ25lZCBhIHdlaWdodCBkZXBlbmRpbmcgb24gdGhlXHJcbiAqIHNlZ21lbnQncyBieXRlIGxlbmd0aC5cclxuICpcclxuICogQHBhcmFtICB7QXJyYXl9IG5vZGVzICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAgR3JhcGggb2YgYWxsIHBvc3NpYmxlIHNlZ21lbnRzXHJcbiAqL1xyXG5mdW5jdGlvbiBidWlsZEdyYXBoIChub2RlcywgdmVyc2lvbikge1xyXG4gIGNvbnN0IHRhYmxlID0ge31cclxuICBjb25zdCBncmFwaCA9IHsgc3RhcnQ6IHt9IH1cclxuICBsZXQgcHJldk5vZGVJZHMgPSBbJ3N0YXJ0J11cclxuXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3Qgbm9kZUdyb3VwID0gbm9kZXNbaV1cclxuICAgIGNvbnN0IGN1cnJlbnROb2RlSWRzID0gW11cclxuXHJcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVHcm91cC5sZW5ndGg7IGorKykge1xyXG4gICAgICBjb25zdCBub2RlID0gbm9kZUdyb3VwW2pdXHJcbiAgICAgIGNvbnN0IGtleSA9ICcnICsgaSArIGpcclxuXHJcbiAgICAgIGN1cnJlbnROb2RlSWRzLnB1c2goa2V5KVxyXG4gICAgICB0YWJsZVtrZXldID0geyBub2RlOiBub2RlLCBsYXN0Q291bnQ6IDAgfVxyXG4gICAgICBncmFwaFtrZXldID0ge31cclxuXHJcbiAgICAgIGZvciAobGV0IG4gPSAwOyBuIDwgcHJldk5vZGVJZHMubGVuZ3RoOyBuKyspIHtcclxuICAgICAgICBjb25zdCBwcmV2Tm9kZUlkID0gcHJldk5vZGVJZHNbbl1cclxuXHJcbiAgICAgICAgaWYgKHRhYmxlW3ByZXZOb2RlSWRdICYmIHRhYmxlW3ByZXZOb2RlSWRdLm5vZGUubW9kZSA9PT0gbm9kZS5tb2RlKSB7XHJcbiAgICAgICAgICBncmFwaFtwcmV2Tm9kZUlkXVtrZXldID1cclxuICAgICAgICAgICAgZ2V0U2VnbWVudEJpdHNMZW5ndGgodGFibGVbcHJldk5vZGVJZF0ubGFzdENvdW50ICsgbm9kZS5sZW5ndGgsIG5vZGUubW9kZSkgLVxyXG4gICAgICAgICAgICBnZXRTZWdtZW50Qml0c0xlbmd0aCh0YWJsZVtwcmV2Tm9kZUlkXS5sYXN0Q291bnQsIG5vZGUubW9kZSlcclxuXHJcbiAgICAgICAgICB0YWJsZVtwcmV2Tm9kZUlkXS5sYXN0Q291bnQgKz0gbm9kZS5sZW5ndGhcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHRhYmxlW3ByZXZOb2RlSWRdKSB0YWJsZVtwcmV2Tm9kZUlkXS5sYXN0Q291bnQgPSBub2RlLmxlbmd0aFxyXG5cclxuICAgICAgICAgIGdyYXBoW3ByZXZOb2RlSWRdW2tleV0gPSBnZXRTZWdtZW50Qml0c0xlbmd0aChub2RlLmxlbmd0aCwgbm9kZS5tb2RlKSArXHJcbiAgICAgICAgICAgIDQgKyBNb2RlLmdldENoYXJDb3VudEluZGljYXRvcihub2RlLm1vZGUsIHZlcnNpb24pIC8vIHN3aXRjaCBjb3N0XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJldk5vZGVJZHMgPSBjdXJyZW50Tm9kZUlkc1xyXG4gIH1cclxuXHJcbiAgZm9yIChsZXQgbiA9IDA7IG4gPCBwcmV2Tm9kZUlkcy5sZW5ndGg7IG4rKykge1xyXG4gICAgZ3JhcGhbcHJldk5vZGVJZHNbbl1dLmVuZCA9IDBcclxuICB9XHJcblxyXG4gIHJldHVybiB7IG1hcDogZ3JhcGgsIHRhYmxlOiB0YWJsZSB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgYSBzZWdtZW50IGZyb20gYSBzcGVjaWZpZWQgZGF0YSBhbmQgbW9kZS5cclxuICogSWYgYSBtb2RlIGlzIG5vdCBzcGVjaWZpZWQsIHRoZSBtb3JlIHN1aXRhYmxlIHdpbGwgYmUgdXNlZC5cclxuICpcclxuICogQHBhcmFtICB7U3RyaW5nfSBkYXRhICAgICAgICAgICAgIElucHV0IGRhdGFcclxuICogQHBhcmFtICB7TW9kZSB8IFN0cmluZ30gbW9kZXNIaW50IERhdGEgbW9kZVxyXG4gKiBAcmV0dXJuIHtTZWdtZW50fSAgICAgICAgICAgICAgICAgU2VnbWVudFxyXG4gKi9cclxuZnVuY3Rpb24gYnVpbGRTaW5nbGVTZWdtZW50IChkYXRhLCBtb2Rlc0hpbnQpIHtcclxuICBsZXQgbW9kZVxyXG4gIGNvbnN0IGJlc3RNb2RlID0gTW9kZS5nZXRCZXN0TW9kZUZvckRhdGEoZGF0YSlcclxuXHJcbiAgbW9kZSA9IE1vZGUuZnJvbShtb2Rlc0hpbnQsIGJlc3RNb2RlKVxyXG5cclxuICAvLyBNYWtlIHN1cmUgZGF0YSBjYW4gYmUgZW5jb2RlZFxyXG4gIGlmIChtb2RlICE9PSBNb2RlLkJZVEUgJiYgbW9kZS5iaXQgPCBiZXN0TW9kZS5iaXQpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignXCInICsgZGF0YSArICdcIicgK1xyXG4gICAgICAnIGNhbm5vdCBiZSBlbmNvZGVkIHdpdGggbW9kZSAnICsgTW9kZS50b1N0cmluZyhtb2RlKSArXHJcbiAgICAgICcuXFxuIFN1Z2dlc3RlZCBtb2RlIGlzOiAnICsgTW9kZS50b1N0cmluZyhiZXN0TW9kZSkpXHJcbiAgfVxyXG5cclxuICAvLyBVc2UgTW9kZS5CWVRFIGlmIEthbmppIHN1cHBvcnQgaXMgZGlzYWJsZWRcclxuICBpZiAobW9kZSA9PT0gTW9kZS5LQU5KSSAmJiAhVXRpbHMuaXNLYW5qaU1vZGVFbmFibGVkKCkpIHtcclxuICAgIG1vZGUgPSBNb2RlLkJZVEVcclxuICB9XHJcblxyXG4gIHN3aXRjaCAobW9kZSkge1xyXG4gICAgY2FzZSBNb2RlLk5VTUVSSUM6XHJcbiAgICAgIHJldHVybiBuZXcgTnVtZXJpY0RhdGEoZGF0YSlcclxuXHJcbiAgICBjYXNlIE1vZGUuQUxQSEFOVU1FUklDOlxyXG4gICAgICByZXR1cm4gbmV3IEFscGhhbnVtZXJpY0RhdGEoZGF0YSlcclxuXHJcbiAgICBjYXNlIE1vZGUuS0FOSkk6XHJcbiAgICAgIHJldHVybiBuZXcgS2FuamlEYXRhKGRhdGEpXHJcblxyXG4gICAgY2FzZSBNb2RlLkJZVEU6XHJcbiAgICAgIHJldHVybiBuZXcgQnl0ZURhdGEoZGF0YSlcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgYSBsaXN0IG9mIHNlZ21lbnRzIGZyb20gYW4gYXJyYXkuXHJcbiAqIEFycmF5IGNhbiBjb250YWluIFN0cmluZ3Mgb3IgT2JqZWN0cyB3aXRoIHNlZ21lbnQncyBpbmZvLlxyXG4gKlxyXG4gKiBGb3IgZWFjaCBpdGVtIHdoaWNoIGlzIGEgc3RyaW5nLCB3aWxsIGJlIGdlbmVyYXRlZCBhIHNlZ21lbnQgd2l0aCB0aGUgZ2l2ZW5cclxuICogc3RyaW5nIGFuZCB0aGUgbW9yZSBhcHByb3ByaWF0ZSBlbmNvZGluZyBtb2RlLlxyXG4gKlxyXG4gKiBGb3IgZWFjaCBpdGVtIHdoaWNoIGlzIGFuIG9iamVjdCwgd2lsbCBiZSBnZW5lcmF0ZWQgYSBzZWdtZW50IHdpdGggdGhlIGdpdmVuXHJcbiAqIGRhdGEgYW5kIG1vZGUuXHJcbiAqIE9iamVjdHMgbXVzdCBjb250YWluIGF0IGxlYXN0IHRoZSBwcm9wZXJ0eSBcImRhdGFcIi5cclxuICogSWYgcHJvcGVydHkgXCJtb2RlXCIgaXMgbm90IHByZXNlbnQsIHRoZSBtb3JlIHN1aXRhYmxlIG1vZGUgd2lsbCBiZSB1c2VkLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtBcnJheX0gYXJyYXkgQXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHNlZ21lbnRzIGRhdGFcclxuICogQHJldHVybiB7QXJyYXl9ICAgICAgIEFycmF5IG9mIFNlZ21lbnRzXHJcbiAqL1xyXG5leHBvcnRzLmZyb21BcnJheSA9IGZ1bmN0aW9uIGZyb21BcnJheSAoYXJyYXkpIHtcclxuICByZXR1cm4gYXJyYXkucmVkdWNlKGZ1bmN0aW9uIChhY2MsIHNlZykge1xyXG4gICAgaWYgKHR5cGVvZiBzZWcgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIGFjYy5wdXNoKGJ1aWxkU2luZ2xlU2VnbWVudChzZWcsIG51bGwpKVxyXG4gICAgfSBlbHNlIGlmIChzZWcuZGF0YSkge1xyXG4gICAgICBhY2MucHVzaChidWlsZFNpbmdsZVNlZ21lbnQoc2VnLmRhdGEsIHNlZy5tb2RlKSlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYWNjXHJcbiAgfSwgW10pXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgYW4gb3B0aW1pemVkIHNlcXVlbmNlIG9mIHNlZ21lbnRzIGZyb20gYSBzdHJpbmcsXHJcbiAqIHdoaWNoIHdpbGwgcHJvZHVjZSB0aGUgc2hvcnRlc3QgcG9zc2libGUgYml0c3RyZWFtLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGEgICAgSW5wdXQgc3RyaW5nXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cclxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIHNlZ21lbnRzXHJcbiAqL1xyXG5leHBvcnRzLmZyb21TdHJpbmcgPSBmdW5jdGlvbiBmcm9tU3RyaW5nIChkYXRhLCB2ZXJzaW9uKSB7XHJcbiAgY29uc3Qgc2VncyA9IGdldFNlZ21lbnRzRnJvbVN0cmluZyhkYXRhLCBVdGlscy5pc0thbmppTW9kZUVuYWJsZWQoKSlcclxuXHJcbiAgY29uc3Qgbm9kZXMgPSBidWlsZE5vZGVzKHNlZ3MpXHJcbiAgY29uc3QgZ3JhcGggPSBidWlsZEdyYXBoKG5vZGVzLCB2ZXJzaW9uKVxyXG4gIGNvbnN0IHBhdGggPSBkaWprc3RyYS5maW5kX3BhdGgoZ3JhcGgubWFwLCAnc3RhcnQnLCAnZW5kJylcclxuXHJcbiAgY29uc3Qgb3B0aW1pemVkU2VncyA9IFtdXHJcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBwYXRoLmxlbmd0aCAtIDE7IGkrKykge1xyXG4gICAgb3B0aW1pemVkU2Vncy5wdXNoKGdyYXBoLnRhYmxlW3BhdGhbaV1dLm5vZGUpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gZXhwb3J0cy5mcm9tQXJyYXkobWVyZ2VTZWdtZW50cyhvcHRpbWl6ZWRTZWdzKSlcclxufVxyXG5cclxuLyoqXHJcbiAqIFNwbGl0cyBhIHN0cmluZyBpbiB2YXJpb3VzIHNlZ21lbnRzIHdpdGggdGhlIG1vZGVzIHdoaWNoXHJcbiAqIGJlc3QgcmVwcmVzZW50IHRoZWlyIGNvbnRlbnQuXHJcbiAqIFRoZSBwcm9kdWNlZCBzZWdtZW50cyBhcmUgZmFyIGZyb20gYmVpbmcgb3B0aW1pemVkLlxyXG4gKiBUaGUgb3V0cHV0IG9mIHRoaXMgZnVuY3Rpb24gaXMgb25seSB1c2VkIHRvIGVzdGltYXRlIGEgUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIHdoaWNoIG1heSBjb250YWluIHRoZSBkYXRhLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGRhdGEgSW5wdXQgc3RyaW5nXHJcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICBBcnJheSBvZiBzZWdtZW50c1xyXG4gKi9cclxuZXhwb3J0cy5yYXdTcGxpdCA9IGZ1bmN0aW9uIHJhd1NwbGl0IChkYXRhKSB7XHJcbiAgcmV0dXJuIGV4cG9ydHMuZnJvbUFycmF5KFxyXG4gICAgZ2V0U2VnbWVudHNGcm9tU3RyaW5nKGRhdGEsIFV0aWxzLmlzS2FuamlNb2RlRW5hYmxlZCgpKVxyXG4gIClcclxufVxyXG4iLCJjb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5jb25zdCBFQ0xldmVsID0gcmVxdWlyZSgnLi9lcnJvci1jb3JyZWN0aW9uLWxldmVsJylcclxuY29uc3QgQml0QnVmZmVyID0gcmVxdWlyZSgnLi9iaXQtYnVmZmVyJylcclxuY29uc3QgQml0TWF0cml4ID0gcmVxdWlyZSgnLi9iaXQtbWF0cml4JylcclxuY29uc3QgQWxpZ25tZW50UGF0dGVybiA9IHJlcXVpcmUoJy4vYWxpZ25tZW50LXBhdHRlcm4nKVxyXG5jb25zdCBGaW5kZXJQYXR0ZXJuID0gcmVxdWlyZSgnLi9maW5kZXItcGF0dGVybicpXHJcbmNvbnN0IE1hc2tQYXR0ZXJuID0gcmVxdWlyZSgnLi9tYXNrLXBhdHRlcm4nKVxyXG5jb25zdCBFQ0NvZGUgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tY29kZScpXHJcbmNvbnN0IFJlZWRTb2xvbW9uRW5jb2RlciA9IHJlcXVpcmUoJy4vcmVlZC1zb2xvbW9uLWVuY29kZXInKVxyXG5jb25zdCBWZXJzaW9uID0gcmVxdWlyZSgnLi92ZXJzaW9uJylcclxuY29uc3QgRm9ybWF0SW5mbyA9IHJlcXVpcmUoJy4vZm9ybWF0LWluZm8nKVxyXG5jb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcclxuY29uc3QgU2VnbWVudHMgPSByZXF1aXJlKCcuL3NlZ21lbnRzJylcclxuXHJcbi8qKlxyXG4gKiBRUkNvZGUgZm9yIEphdmFTY3JpcHRcclxuICpcclxuICogbW9kaWZpZWQgYnkgUnlhbiBEYXkgZm9yIG5vZGVqcyBzdXBwb3J0XHJcbiAqIENvcHlyaWdodCAoYykgMjAxMSBSeWFuIERheVxyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbiAqICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcclxuICpcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gUVJDb2RlIGZvciBKYXZhU2NyaXB0XHJcbi8vXHJcbi8vIENvcHlyaWdodCAoYykgMjAwOSBLYXp1aGlrbyBBcmFzZVxyXG4vL1xyXG4vLyBVUkw6IGh0dHA6Ly93d3cuZC1wcm9qZWN0LmNvbS9cclxuLy9cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxyXG4vLyAgIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXHJcbi8vXHJcbi8vIFRoZSB3b3JkIFwiUVIgQ29kZVwiIGlzIHJlZ2lzdGVyZWQgdHJhZGVtYXJrIG9mXHJcbi8vIERFTlNPIFdBVkUgSU5DT1JQT1JBVEVEXHJcbi8vICAgaHR0cDovL3d3dy5kZW5zby13YXZlLmNvbS9xcmNvZGUvZmFxcGF0ZW50LWUuaHRtbFxyXG4vL1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4qL1xyXG5cclxuLyoqXHJcbiAqIEFkZCBmaW5kZXIgcGF0dGVybnMgYml0cyB0byBtYXRyaXhcclxuICpcclxuICogQHBhcmFtICB7Qml0TWF0cml4fSBtYXRyaXggIE1vZHVsZXMgbWF0cml4XHJcbiAqIEBwYXJhbSAge051bWJlcn0gICAgdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cclxuICovXHJcbmZ1bmN0aW9uIHNldHVwRmluZGVyUGF0dGVybiAobWF0cml4LCB2ZXJzaW9uKSB7XHJcbiAgY29uc3Qgc2l6ZSA9IG1hdHJpeC5zaXplXHJcbiAgY29uc3QgcG9zID0gRmluZGVyUGF0dGVybi5nZXRQb3NpdGlvbnModmVyc2lvbilcclxuXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3MubGVuZ3RoOyBpKyspIHtcclxuICAgIGNvbnN0IHJvdyA9IHBvc1tpXVswXVxyXG4gICAgY29uc3QgY29sID0gcG9zW2ldWzFdXHJcblxyXG4gICAgZm9yIChsZXQgciA9IC0xOyByIDw9IDc7IHIrKykge1xyXG4gICAgICBpZiAocm93ICsgciA8PSAtMSB8fCBzaXplIDw9IHJvdyArIHIpIGNvbnRpbnVlXHJcblxyXG4gICAgICBmb3IgKGxldCBjID0gLTE7IGMgPD0gNzsgYysrKSB7XHJcbiAgICAgICAgaWYgKGNvbCArIGMgPD0gLTEgfHwgc2l6ZSA8PSBjb2wgKyBjKSBjb250aW51ZVxyXG5cclxuICAgICAgICBpZiAoKHIgPj0gMCAmJiByIDw9IDYgJiYgKGMgPT09IDAgfHwgYyA9PT0gNikpIHx8XHJcbiAgICAgICAgICAoYyA+PSAwICYmIGMgPD0gNiAmJiAociA9PT0gMCB8fCByID09PSA2KSkgfHxcclxuICAgICAgICAgIChyID49IDIgJiYgciA8PSA0ICYmIGMgPj0gMiAmJiBjIDw9IDQpKSB7XHJcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdyArIHIsIGNvbCArIGMsIHRydWUsIHRydWUpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1hdHJpeC5zZXQocm93ICsgciwgY29sICsgYywgZmFsc2UsIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWRkIHRpbWluZyBwYXR0ZXJuIGJpdHMgdG8gbWF0cml4XHJcbiAqXHJcbiAqIE5vdGU6IHRoaXMgZnVuY3Rpb24gbXVzdCBiZSBjYWxsZWQgYmVmb3JlIHtAbGluayBzZXR1cEFsaWdubWVudFBhdHRlcm59XHJcbiAqXHJcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gbWF0cml4IE1vZHVsZXMgbWF0cml4XHJcbiAqL1xyXG5mdW5jdGlvbiBzZXR1cFRpbWluZ1BhdHRlcm4gKG1hdHJpeCkge1xyXG4gIGNvbnN0IHNpemUgPSBtYXRyaXguc2l6ZVxyXG5cclxuICBmb3IgKGxldCByID0gODsgciA8IHNpemUgLSA4OyByKyspIHtcclxuICAgIGNvbnN0IHZhbHVlID0gciAlIDIgPT09IDBcclxuICAgIG1hdHJpeC5zZXQociwgNiwgdmFsdWUsIHRydWUpXHJcbiAgICBtYXRyaXguc2V0KDYsIHIsIHZhbHVlLCB0cnVlKVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZCBhbGlnbm1lbnQgcGF0dGVybnMgYml0cyB0byBtYXRyaXhcclxuICpcclxuICogTm90ZTogdGhpcyBmdW5jdGlvbiBtdXN0IGJlIGNhbGxlZCBhZnRlciB7QGxpbmsgc2V0dXBUaW1pbmdQYXR0ZXJufVxyXG4gKlxyXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCAgTW9kdWxlcyBtYXRyaXhcclxuICogQHBhcmFtICB7TnVtYmVyfSAgICB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxyXG4gKi9cclxuZnVuY3Rpb24gc2V0dXBBbGlnbm1lbnRQYXR0ZXJuIChtYXRyaXgsIHZlcnNpb24pIHtcclxuICBjb25zdCBwb3MgPSBBbGlnbm1lbnRQYXR0ZXJuLmdldFBvc2l0aW9ucyh2ZXJzaW9uKVxyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBvcy5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3Qgcm93ID0gcG9zW2ldWzBdXHJcbiAgICBjb25zdCBjb2wgPSBwb3NbaV1bMV1cclxuXHJcbiAgICBmb3IgKGxldCByID0gLTI7IHIgPD0gMjsgcisrKSB7XHJcbiAgICAgIGZvciAobGV0IGMgPSAtMjsgYyA8PSAyOyBjKyspIHtcclxuICAgICAgICBpZiAociA9PT0gLTIgfHwgciA9PT0gMiB8fCBjID09PSAtMiB8fCBjID09PSAyIHx8XHJcbiAgICAgICAgICAociA9PT0gMCAmJiBjID09PSAwKSkge1xyXG4gICAgICAgICAgbWF0cml4LnNldChyb3cgKyByLCBjb2wgKyBjLCB0cnVlLCB0cnVlKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdyArIHIsIGNvbCArIGMsIGZhbHNlLCB0cnVlKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZCB2ZXJzaW9uIGluZm8gYml0cyB0byBtYXRyaXhcclxuICpcclxuICogQHBhcmFtICB7Qml0TWF0cml4fSBtYXRyaXggIE1vZHVsZXMgbWF0cml4XHJcbiAqIEBwYXJhbSAge051bWJlcn0gICAgdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cclxuICovXHJcbmZ1bmN0aW9uIHNldHVwVmVyc2lvbkluZm8gKG1hdHJpeCwgdmVyc2lvbikge1xyXG4gIGNvbnN0IHNpemUgPSBtYXRyaXguc2l6ZVxyXG4gIGNvbnN0IGJpdHMgPSBWZXJzaW9uLmdldEVuY29kZWRCaXRzKHZlcnNpb24pXHJcbiAgbGV0IHJvdywgY29sLCBtb2RcclxuXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxODsgaSsrKSB7XHJcbiAgICByb3cgPSBNYXRoLmZsb29yKGkgLyAzKVxyXG4gICAgY29sID0gaSAlIDMgKyBzaXplIC0gOCAtIDNcclxuICAgIG1vZCA9ICgoYml0cyA+PiBpKSAmIDEpID09PSAxXHJcblxyXG4gICAgbWF0cml4LnNldChyb3csIGNvbCwgbW9kLCB0cnVlKVxyXG4gICAgbWF0cml4LnNldChjb2wsIHJvdywgbW9kLCB0cnVlKVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZCBmb3JtYXQgaW5mbyBiaXRzIHRvIG1hdHJpeFxyXG4gKlxyXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCAgICAgICAgICAgICAgIE1vZHVsZXMgbWF0cml4XHJcbiAqIEBwYXJhbSAge0Vycm9yQ29ycmVjdGlvbkxldmVsfSAgICBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXHJcbiAqIEBwYXJhbSAge051bWJlcn0gICAgbWFza1BhdHRlcm4gICAgICAgICAgTWFzayBwYXR0ZXJuIHJlZmVyZW5jZSB2YWx1ZVxyXG4gKi9cclxuZnVuY3Rpb24gc2V0dXBGb3JtYXRJbmZvIChtYXRyaXgsIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrUGF0dGVybikge1xyXG4gIGNvbnN0IHNpemUgPSBtYXRyaXguc2l6ZVxyXG4gIGNvbnN0IGJpdHMgPSBGb3JtYXRJbmZvLmdldEVuY29kZWRCaXRzKGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrUGF0dGVybilcclxuICBsZXQgaSwgbW9kXHJcblxyXG4gIGZvciAoaSA9IDA7IGkgPCAxNTsgaSsrKSB7XHJcbiAgICBtb2QgPSAoKGJpdHMgPj4gaSkgJiAxKSA9PT0gMVxyXG5cclxuICAgIC8vIHZlcnRpY2FsXHJcbiAgICBpZiAoaSA8IDYpIHtcclxuICAgICAgbWF0cml4LnNldChpLCA4LCBtb2QsIHRydWUpXHJcbiAgICB9IGVsc2UgaWYgKGkgPCA4KSB7XHJcbiAgICAgIG1hdHJpeC5zZXQoaSArIDEsIDgsIG1vZCwgdHJ1ZSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG1hdHJpeC5zZXQoc2l6ZSAtIDE1ICsgaSwgOCwgbW9kLCB0cnVlKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGhvcml6b250YWxcclxuICAgIGlmIChpIDwgOCkge1xyXG4gICAgICBtYXRyaXguc2V0KDgsIHNpemUgLSBpIC0gMSwgbW9kLCB0cnVlKVxyXG4gICAgfSBlbHNlIGlmIChpIDwgOSkge1xyXG4gICAgICBtYXRyaXguc2V0KDgsIDE1IC0gaSAtIDEgKyAxLCBtb2QsIHRydWUpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtYXRyaXguc2V0KDgsIDE1IC0gaSAtIDEsIG1vZCwgdHJ1ZSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIGZpeGVkIG1vZHVsZVxyXG4gIG1hdHJpeC5zZXQoc2l6ZSAtIDgsIDgsIDEsIHRydWUpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGQgZW5jb2RlZCBkYXRhIGJpdHMgdG8gbWF0cml4XHJcbiAqXHJcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gIG1hdHJpeCBNb2R1bGVzIG1hdHJpeFxyXG4gKiBAcGFyYW0gIHtVaW50OEFycmF5fSBkYXRhICAgRGF0YSBjb2Rld29yZHNcclxuICovXHJcbmZ1bmN0aW9uIHNldHVwRGF0YSAobWF0cml4LCBkYXRhKSB7XHJcbiAgY29uc3Qgc2l6ZSA9IG1hdHJpeC5zaXplXHJcbiAgbGV0IGluYyA9IC0xXHJcbiAgbGV0IHJvdyA9IHNpemUgLSAxXHJcbiAgbGV0IGJpdEluZGV4ID0gN1xyXG4gIGxldCBieXRlSW5kZXggPSAwXHJcblxyXG4gIGZvciAobGV0IGNvbCA9IHNpemUgLSAxOyBjb2wgPiAwOyBjb2wgLT0gMikge1xyXG4gICAgaWYgKGNvbCA9PT0gNikgY29sLS1cclxuXHJcbiAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICBmb3IgKGxldCBjID0gMDsgYyA8IDI7IGMrKykge1xyXG4gICAgICAgIGlmICghbWF0cml4LmlzUmVzZXJ2ZWQocm93LCBjb2wgLSBjKSkge1xyXG4gICAgICAgICAgbGV0IGRhcmsgPSBmYWxzZVxyXG5cclxuICAgICAgICAgIGlmIChieXRlSW5kZXggPCBkYXRhLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBkYXJrID0gKCgoZGF0YVtieXRlSW5kZXhdID4+PiBiaXRJbmRleCkgJiAxKSA9PT0gMSlcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdywgY29sIC0gYywgZGFyaylcclxuICAgICAgICAgIGJpdEluZGV4LS1cclxuXHJcbiAgICAgICAgICBpZiAoYml0SW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgIGJ5dGVJbmRleCsrXHJcbiAgICAgICAgICAgIGJpdEluZGV4ID0gN1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcm93ICs9IGluY1xyXG5cclxuICAgICAgaWYgKHJvdyA8IDAgfHwgc2l6ZSA8PSByb3cpIHtcclxuICAgICAgICByb3cgLT0gaW5jXHJcbiAgICAgICAgaW5jID0gLWluY1xyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgZW5jb2RlZCBjb2Rld29yZHMgZnJvbSBkYXRhIGlucHV0XHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gICB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cclxuICogQHBhcmFtICB7RXJyb3JDb3JyZWN0aW9uTGV2ZWx9ICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxyXG4gKiBAcGFyYW0gIHtCeXRlRGF0YX0gZGF0YSAgICAgICAgICAgICAgICAgRGF0YSBpbnB1dFxyXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICAgICAgICAgICAgICAgICAgQnVmZmVyIGNvbnRhaW5pbmcgZW5jb2RlZCBjb2Rld29yZHNcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZURhdGEgKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBzZWdtZW50cykge1xyXG4gIC8vIFByZXBhcmUgZGF0YSBidWZmZXJcclxuICBjb25zdCBidWZmZXIgPSBuZXcgQml0QnVmZmVyKClcclxuXHJcbiAgc2VnbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgLy8gcHJlZml4IGRhdGEgd2l0aCBtb2RlIGluZGljYXRvciAoNCBiaXRzKVxyXG4gICAgYnVmZmVyLnB1dChkYXRhLm1vZGUuYml0LCA0KVxyXG5cclxuICAgIC8vIFByZWZpeCBkYXRhIHdpdGggY2hhcmFjdGVyIGNvdW50IGluZGljYXRvci5cclxuICAgIC8vIFRoZSBjaGFyYWN0ZXIgY291bnQgaW5kaWNhdG9yIGlzIGEgc3RyaW5nIG9mIGJpdHMgdGhhdCByZXByZXNlbnRzIHRoZVxyXG4gICAgLy8gbnVtYmVyIG9mIGNoYXJhY3RlcnMgdGhhdCBhcmUgYmVpbmcgZW5jb2RlZC5cclxuICAgIC8vIFRoZSBjaGFyYWN0ZXIgY291bnQgaW5kaWNhdG9yIG11c3QgYmUgcGxhY2VkIGFmdGVyIHRoZSBtb2RlIGluZGljYXRvclxyXG4gICAgLy8gYW5kIG11c3QgYmUgYSBjZXJ0YWluIG51bWJlciBvZiBiaXRzIGxvbmcsIGRlcGVuZGluZyBvbiB0aGUgUVIgdmVyc2lvblxyXG4gICAgLy8gYW5kIGRhdGEgbW9kZVxyXG4gICAgLy8gQHNlZSB7QGxpbmsgTW9kZS5nZXRDaGFyQ291bnRJbmRpY2F0b3J9LlxyXG4gICAgYnVmZmVyLnB1dChkYXRhLmdldExlbmd0aCgpLCBNb2RlLmdldENoYXJDb3VudEluZGljYXRvcihkYXRhLm1vZGUsIHZlcnNpb24pKVxyXG5cclxuICAgIC8vIGFkZCBiaW5hcnkgZGF0YSBzZXF1ZW5jZSB0byBidWZmZXJcclxuICAgIGRhdGEud3JpdGUoYnVmZmVyKVxyXG4gIH0pXHJcblxyXG4gIC8vIENhbGN1bGF0ZSByZXF1aXJlZCBudW1iZXIgb2YgYml0c1xyXG4gIGNvbnN0IHRvdGFsQ29kZXdvcmRzID0gVXRpbHMuZ2V0U3ltYm9sVG90YWxDb2Rld29yZHModmVyc2lvbilcclxuICBjb25zdCBlY1RvdGFsQ29kZXdvcmRzID0gRUNDb2RlLmdldFRvdGFsQ29kZXdvcmRzQ291bnQodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXHJcbiAgY29uc3QgZGF0YVRvdGFsQ29kZXdvcmRzQml0cyA9ICh0b3RhbENvZGV3b3JkcyAtIGVjVG90YWxDb2Rld29yZHMpICogOFxyXG5cclxuICAvLyBBZGQgYSB0ZXJtaW5hdG9yLlxyXG4gIC8vIElmIHRoZSBiaXQgc3RyaW5nIGlzIHNob3J0ZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIHJlcXVpcmVkIGJpdHMsXHJcbiAgLy8gYSB0ZXJtaW5hdG9yIG9mIHVwIHRvIGZvdXIgMHMgbXVzdCBiZSBhZGRlZCB0byB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgc3RyaW5nLlxyXG4gIC8vIElmIHRoZSBiaXQgc3RyaW5nIGlzIG1vcmUgdGhhbiBmb3VyIGJpdHMgc2hvcnRlciB0aGFuIHRoZSByZXF1aXJlZCBudW1iZXIgb2YgYml0cyxcclxuICAvLyBhZGQgZm91ciAwcyB0byB0aGUgZW5kLlxyXG4gIGlmIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgKyA0IDw9IGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMpIHtcclxuICAgIGJ1ZmZlci5wdXQoMCwgNClcclxuICB9XHJcblxyXG4gIC8vIElmIHRoZSBiaXQgc3RyaW5nIGlzIGZld2VyIHRoYW4gZm91ciBiaXRzIHNob3J0ZXIsIGFkZCBvbmx5IHRoZSBudW1iZXIgb2YgMHMgdGhhdFxyXG4gIC8vIGFyZSBuZWVkZWQgdG8gcmVhY2ggdGhlIHJlcXVpcmVkIG51bWJlciBvZiBiaXRzLlxyXG5cclxuICAvLyBBZnRlciBhZGRpbmcgdGhlIHRlcm1pbmF0b3IsIGlmIHRoZSBudW1iZXIgb2YgYml0cyBpbiB0aGUgc3RyaW5nIGlzIG5vdCBhIG11bHRpcGxlIG9mIDgsXHJcbiAgLy8gcGFkIHRoZSBzdHJpbmcgb24gdGhlIHJpZ2h0IHdpdGggMHMgdG8gbWFrZSB0aGUgc3RyaW5nJ3MgbGVuZ3RoIGEgbXVsdGlwbGUgb2YgOC5cclxuICB3aGlsZSAoYnVmZmVyLmdldExlbmd0aEluQml0cygpICUgOCAhPT0gMCkge1xyXG4gICAgYnVmZmVyLnB1dEJpdCgwKVxyXG4gIH1cclxuXHJcbiAgLy8gQWRkIHBhZCBieXRlcyBpZiB0aGUgc3RyaW5nIGlzIHN0aWxsIHNob3J0ZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIHJlcXVpcmVkIGJpdHMuXHJcbiAgLy8gRXh0ZW5kIHRoZSBidWZmZXIgdG8gZmlsbCB0aGUgZGF0YSBjYXBhY2l0eSBvZiB0aGUgc3ltYm9sIGNvcnJlc3BvbmRpbmcgdG9cclxuICAvLyB0aGUgVmVyc2lvbiBhbmQgRXJyb3IgQ29ycmVjdGlvbiBMZXZlbCBieSBhZGRpbmcgdGhlIFBhZCBDb2Rld29yZHMgMTExMDExMDAgKDB4RUMpXHJcbiAgLy8gYW5kIDAwMDEwMDAxICgweDExKSBhbHRlcm5hdGVseS5cclxuICBjb25zdCByZW1haW5pbmdCeXRlID0gKGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMgLSBidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkpIC8gOFxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmVtYWluaW5nQnl0ZTsgaSsrKSB7XHJcbiAgICBidWZmZXIucHV0KGkgJSAyID8gMHgxMSA6IDB4RUMsIDgpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gY3JlYXRlQ29kZXdvcmRzKGJ1ZmZlciwgdmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFbmNvZGUgaW5wdXQgZGF0YSB3aXRoIFJlZWQtU29sb21vbiBhbmQgcmV0dXJuIGNvZGV3b3JkcyB3aXRoXHJcbiAqIHJlbGF0aXZlIGVycm9yIGNvcnJlY3Rpb24gYml0c1xyXG4gKlxyXG4gKiBAcGFyYW0gIHtCaXRCdWZmZXJ9IGJpdEJ1ZmZlciAgICAgICAgICAgIERhdGEgdG8gZW5jb2RlXHJcbiAqIEBwYXJhbSAge051bWJlcn0gICAgdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEBwYXJhbSAge0Vycm9yQ29ycmVjdGlvbkxldmVsfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXHJcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9ICAgICAgICAgICAgICAgICAgICAgQnVmZmVyIGNvbnRhaW5pbmcgZW5jb2RlZCBjb2Rld29yZHNcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZUNvZGV3b3JkcyAoYml0QnVmZmVyLCB2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gIC8vIFRvdGFsIGNvZGV3b3JkcyBmb3IgdGhpcyBRUiBjb2RlIHZlcnNpb24gKERhdGEgKyBFcnJvciBjb3JyZWN0aW9uKVxyXG4gIGNvbnN0IHRvdGFsQ29kZXdvcmRzID0gVXRpbHMuZ2V0U3ltYm9sVG90YWxDb2Rld29yZHModmVyc2lvbilcclxuXHJcbiAgLy8gVG90YWwgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzXHJcbiAgY29uc3QgZWNUb3RhbENvZGV3b3JkcyA9IEVDQ29kZS5nZXRUb3RhbENvZGV3b3Jkc0NvdW50KHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKVxyXG5cclxuICAvLyBUb3RhbCBudW1iZXIgb2YgZGF0YSBjb2Rld29yZHNcclxuICBjb25zdCBkYXRhVG90YWxDb2Rld29yZHMgPSB0b3RhbENvZGV3b3JkcyAtIGVjVG90YWxDb2Rld29yZHNcclxuXHJcbiAgLy8gVG90YWwgbnVtYmVyIG9mIGJsb2Nrc1xyXG4gIGNvbnN0IGVjVG90YWxCbG9ja3MgPSBFQ0NvZGUuZ2V0QmxvY2tzQ291bnQodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXHJcblxyXG4gIC8vIENhbGN1bGF0ZSBob3cgbWFueSBibG9ja3MgZWFjaCBncm91cCBzaG91bGQgY29udGFpblxyXG4gIGNvbnN0IGJsb2Nrc0luR3JvdXAyID0gdG90YWxDb2Rld29yZHMgJSBlY1RvdGFsQmxvY2tzXHJcbiAgY29uc3QgYmxvY2tzSW5Hcm91cDEgPSBlY1RvdGFsQmxvY2tzIC0gYmxvY2tzSW5Hcm91cDJcclxuXHJcbiAgY29uc3QgdG90YWxDb2Rld29yZHNJbkdyb3VwMSA9IE1hdGguZmxvb3IodG90YWxDb2Rld29yZHMgLyBlY1RvdGFsQmxvY2tzKVxyXG5cclxuICBjb25zdCBkYXRhQ29kZXdvcmRzSW5Hcm91cDEgPSBNYXRoLmZsb29yKGRhdGFUb3RhbENvZGV3b3JkcyAvIGVjVG90YWxCbG9ja3MpXHJcbiAgY29uc3QgZGF0YUNvZGV3b3Jkc0luR3JvdXAyID0gZGF0YUNvZGV3b3Jkc0luR3JvdXAxICsgMVxyXG5cclxuICAvLyBOdW1iZXIgb2YgRUMgY29kZXdvcmRzIGlzIHRoZSBzYW1lIGZvciBib3RoIGdyb3Vwc1xyXG4gIGNvbnN0IGVjQ291bnQgPSB0b3RhbENvZGV3b3Jkc0luR3JvdXAxIC0gZGF0YUNvZGV3b3Jkc0luR3JvdXAxXHJcblxyXG4gIC8vIEluaXRpYWxpemUgYSBSZWVkLVNvbG9tb24gZW5jb2RlciB3aXRoIGEgZ2VuZXJhdG9yIHBvbHlub21pYWwgb2YgZGVncmVlIGVjQ291bnRcclxuICBjb25zdCBycyA9IG5ldyBSZWVkU29sb21vbkVuY29kZXIoZWNDb3VudClcclxuXHJcbiAgbGV0IG9mZnNldCA9IDBcclxuICBjb25zdCBkY0RhdGEgPSBuZXcgQXJyYXkoZWNUb3RhbEJsb2NrcylcclxuICBjb25zdCBlY0RhdGEgPSBuZXcgQXJyYXkoZWNUb3RhbEJsb2NrcylcclxuICBsZXQgbWF4RGF0YVNpemUgPSAwXHJcbiAgY29uc3QgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYml0QnVmZmVyLmJ1ZmZlcilcclxuXHJcbiAgLy8gRGl2aWRlIHRoZSBidWZmZXIgaW50byB0aGUgcmVxdWlyZWQgbnVtYmVyIG9mIGJsb2Nrc1xyXG4gIGZvciAobGV0IGIgPSAwOyBiIDwgZWNUb3RhbEJsb2NrczsgYisrKSB7XHJcbiAgICBjb25zdCBkYXRhU2l6ZSA9IGIgPCBibG9ja3NJbkdyb3VwMSA/IGRhdGFDb2Rld29yZHNJbkdyb3VwMSA6IGRhdGFDb2Rld29yZHNJbkdyb3VwMlxyXG5cclxuICAgIC8vIGV4dHJhY3QgYSBibG9jayBvZiBkYXRhIGZyb20gYnVmZmVyXHJcbiAgICBkY0RhdGFbYl0gPSBidWZmZXIuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyBkYXRhU2l6ZSlcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgRUMgY29kZXdvcmRzIGZvciB0aGlzIGRhdGEgYmxvY2tcclxuICAgIGVjRGF0YVtiXSA9IHJzLmVuY29kZShkY0RhdGFbYl0pXHJcblxyXG4gICAgb2Zmc2V0ICs9IGRhdGFTaXplXHJcbiAgICBtYXhEYXRhU2l6ZSA9IE1hdGgubWF4KG1heERhdGFTaXplLCBkYXRhU2l6ZSlcclxuICB9XHJcblxyXG4gIC8vIENyZWF0ZSBmaW5hbCBkYXRhXHJcbiAgLy8gSW50ZXJsZWF2ZSB0aGUgZGF0YSBhbmQgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHMgZnJvbSBlYWNoIGJsb2NrXHJcbiAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KHRvdGFsQ29kZXdvcmRzKVxyXG4gIGxldCBpbmRleCA9IDBcclxuICBsZXQgaSwgclxyXG5cclxuICAvLyBBZGQgZGF0YSBjb2Rld29yZHNcclxuICBmb3IgKGkgPSAwOyBpIDwgbWF4RGF0YVNpemU7IGkrKykge1xyXG4gICAgZm9yIChyID0gMDsgciA8IGVjVG90YWxCbG9ja3M7IHIrKykge1xyXG4gICAgICBpZiAoaSA8IGRjRGF0YVtyXS5sZW5ndGgpIHtcclxuICAgICAgICBkYXRhW2luZGV4KytdID0gZGNEYXRhW3JdW2ldXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEFwcGVkIEVDIGNvZGV3b3Jkc1xyXG4gIGZvciAoaSA9IDA7IGkgPCBlY0NvdW50OyBpKyspIHtcclxuICAgIGZvciAociA9IDA7IHIgPCBlY1RvdGFsQmxvY2tzOyByKyspIHtcclxuICAgICAgZGF0YVtpbmRleCsrXSA9IGVjRGF0YVtyXVtpXVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGRhdGFcclxufVxyXG5cclxuLyoqXHJcbiAqIEJ1aWxkIFFSIENvZGUgc3ltYm9sXHJcbiAqXHJcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YSAgICAgICAgICAgICAgICAgSW5wdXQgc3RyaW5nXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEBwYXJhbSAge0Vycm9yQ29ycmV0aW9uTGV2ZWx9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGxldmVsXHJcbiAqIEBwYXJhbSAge01hc2tQYXR0ZXJufSBtYXNrUGF0dGVybiAgICAgTWFzayBwYXR0ZXJuXHJcbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgICAgICAgICAgICAgT2JqZWN0IGNvbnRhaW5pbmcgc3ltYm9sIGRhdGFcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZVN5bWJvbCAoZGF0YSwgdmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2tQYXR0ZXJuKSB7XHJcbiAgbGV0IHNlZ21lbnRzXHJcblxyXG4gIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XHJcbiAgICBzZWdtZW50cyA9IFNlZ21lbnRzLmZyb21BcnJheShkYXRhKVxyXG4gIH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XHJcbiAgICBsZXQgZXN0aW1hdGVkVmVyc2lvbiA9IHZlcnNpb25cclxuXHJcbiAgICBpZiAoIWVzdGltYXRlZFZlcnNpb24pIHtcclxuICAgICAgY29uc3QgcmF3U2VnbWVudHMgPSBTZWdtZW50cy5yYXdTcGxpdChkYXRhKVxyXG5cclxuICAgICAgLy8gRXN0aW1hdGUgYmVzdCB2ZXJzaW9uIHRoYXQgY2FuIGNvbnRhaW4gcmF3IHNwbGl0dGVkIHNlZ21lbnRzXHJcbiAgICAgIGVzdGltYXRlZFZlcnNpb24gPSBWZXJzaW9uLmdldEJlc3RWZXJzaW9uRm9yRGF0YShyYXdTZWdtZW50cywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gQnVpbGQgb3B0aW1pemVkIHNlZ21lbnRzXHJcbiAgICAvLyBJZiBlc3RpbWF0ZWQgdmVyc2lvbiBpcyB1bmRlZmluZWQsIHRyeSB3aXRoIHRoZSBoaWdoZXN0IHZlcnNpb25cclxuICAgIHNlZ21lbnRzID0gU2VnbWVudHMuZnJvbVN0cmluZyhkYXRhLCBlc3RpbWF0ZWRWZXJzaW9uIHx8IDQwKVxyXG4gIH0gZWxzZSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZGF0YScpXHJcbiAgfVxyXG5cclxuICAvLyBHZXQgdGhlIG1pbiB2ZXJzaW9uIHRoYXQgY2FuIGNvbnRhaW4gZGF0YVxyXG4gIGNvbnN0IGJlc3RWZXJzaW9uID0gVmVyc2lvbi5nZXRCZXN0VmVyc2lvbkZvckRhdGEoc2VnbWVudHMsIGVycm9yQ29ycmVjdGlvbkxldmVsKVxyXG5cclxuICAvLyBJZiBubyB2ZXJzaW9uIGlzIGZvdW5kLCBkYXRhIGNhbm5vdCBiZSBzdG9yZWRcclxuICBpZiAoIWJlc3RWZXJzaW9uKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBhbW91bnQgb2YgZGF0YSBpcyB0b28gYmlnIHRvIGJlIHN0b3JlZCBpbiBhIFFSIENvZGUnKVxyXG4gIH1cclxuXHJcbiAgLy8gSWYgbm90IHNwZWNpZmllZCwgdXNlIG1pbiB2ZXJzaW9uIGFzIGRlZmF1bHRcclxuICBpZiAoIXZlcnNpb24pIHtcclxuICAgIHZlcnNpb24gPSBiZXN0VmVyc2lvblxyXG5cclxuICAvLyBDaGVjayBpZiB0aGUgc3BlY2lmaWVkIHZlcnNpb24gY2FuIGNvbnRhaW4gdGhlIGRhdGFcclxuICB9IGVsc2UgaWYgKHZlcnNpb24gPCBiZXN0VmVyc2lvbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdcXG4nICtcclxuICAgICAgJ1RoZSBjaG9zZW4gUVIgQ29kZSB2ZXJzaW9uIGNhbm5vdCBjb250YWluIHRoaXMgYW1vdW50IG9mIGRhdGEuXFxuJyArXHJcbiAgICAgICdNaW5pbXVtIHZlcnNpb24gcmVxdWlyZWQgdG8gc3RvcmUgY3VycmVudCBkYXRhIGlzOiAnICsgYmVzdFZlcnNpb24gKyAnLlxcbidcclxuICAgIClcclxuICB9XHJcblxyXG4gIGNvbnN0IGRhdGFCaXRzID0gY3JlYXRlRGF0YSh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgc2VnbWVudHMpXHJcblxyXG4gIC8vIEFsbG9jYXRlIG1hdHJpeCBidWZmZXJcclxuICBjb25zdCBtb2R1bGVDb3VudCA9IFV0aWxzLmdldFN5bWJvbFNpemUodmVyc2lvbilcclxuICBjb25zdCBtb2R1bGVzID0gbmV3IEJpdE1hdHJpeChtb2R1bGVDb3VudClcclxuXHJcbiAgLy8gQWRkIGZ1bmN0aW9uIG1vZHVsZXNcclxuICBzZXR1cEZpbmRlclBhdHRlcm4obW9kdWxlcywgdmVyc2lvbilcclxuICBzZXR1cFRpbWluZ1BhdHRlcm4obW9kdWxlcylcclxuICBzZXR1cEFsaWdubWVudFBhdHRlcm4obW9kdWxlcywgdmVyc2lvbilcclxuXHJcbiAgLy8gQWRkIHRlbXBvcmFyeSBkdW1teSBiaXRzIGZvciBmb3JtYXQgaW5mbyBqdXN0IHRvIHNldCB0aGVtIGFzIHJlc2VydmVkLlxyXG4gIC8vIFRoaXMgaXMgbmVlZGVkIHRvIHByZXZlbnQgdGhlc2UgYml0cyBmcm9tIGJlaW5nIG1hc2tlZCBieSB7QGxpbmsgTWFza1BhdHRlcm4uYXBwbHlNYXNrfVxyXG4gIC8vIHNpbmNlIHRoZSBtYXNraW5nIG9wZXJhdGlvbiBtdXN0IGJlIHBlcmZvcm1lZCBvbmx5IG9uIHRoZSBlbmNvZGluZyByZWdpb24uXHJcbiAgLy8gVGhlc2UgYmxvY2tzIHdpbGwgYmUgcmVwbGFjZWQgd2l0aCBjb3JyZWN0IHZhbHVlcyBsYXRlciBpbiBjb2RlLlxyXG4gIHNldHVwRm9ybWF0SW5mbyhtb2R1bGVzLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgMClcclxuXHJcbiAgaWYgKHZlcnNpb24gPj0gNykge1xyXG4gICAgc2V0dXBWZXJzaW9uSW5mbyhtb2R1bGVzLCB2ZXJzaW9uKVxyXG4gIH1cclxuXHJcbiAgLy8gQWRkIGRhdGEgY29kZXdvcmRzXHJcbiAgc2V0dXBEYXRhKG1vZHVsZXMsIGRhdGFCaXRzKVxyXG5cclxuICBpZiAoaXNOYU4obWFza1BhdHRlcm4pKSB7XHJcbiAgICAvLyBGaW5kIGJlc3QgbWFzayBwYXR0ZXJuXHJcbiAgICBtYXNrUGF0dGVybiA9IE1hc2tQYXR0ZXJuLmdldEJlc3RNYXNrKG1vZHVsZXMsXHJcbiAgICAgIHNldHVwRm9ybWF0SW5mby5iaW5kKG51bGwsIG1vZHVsZXMsIGVycm9yQ29ycmVjdGlvbkxldmVsKSlcclxuICB9XHJcblxyXG4gIC8vIEFwcGx5IG1hc2sgcGF0dGVyblxyXG4gIE1hc2tQYXR0ZXJuLmFwcGx5TWFzayhtYXNrUGF0dGVybiwgbW9kdWxlcylcclxuXHJcbiAgLy8gUmVwbGFjZSBmb3JtYXQgaW5mbyBiaXRzIHdpdGggY29ycmVjdCB2YWx1ZXNcclxuICBzZXR1cEZvcm1hdEluZm8obW9kdWxlcywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2tQYXR0ZXJuKVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgbW9kdWxlczogbW9kdWxlcyxcclxuICAgIHZlcnNpb246IHZlcnNpb24sXHJcbiAgICBlcnJvckNvcnJlY3Rpb25MZXZlbDogZXJyb3JDb3JyZWN0aW9uTGV2ZWwsXHJcbiAgICBtYXNrUGF0dGVybjogbWFza1BhdHRlcm4sXHJcbiAgICBzZWdtZW50czogc2VnbWVudHNcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBRUiBDb2RlXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nIHwgQXJyYXl9IGRhdGEgICAgICAgICAgICAgICAgIElucHV0IGRhdGFcclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgICAgICAgICAgICAgICAgICAgICAgT3B0aW9uYWwgY29uZmlndXJhdGlvbnNcclxuICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMudmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLmVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gb3B0aW9ucy50b1NKSVNGdW5jICAgICAgICAgSGVscGVyIGZ1bmMgdG8gY29udmVydCB1dGY4IHRvIHNqaXNcclxuICovXHJcbmV4cG9ydHMuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlIChkYXRhLCBvcHRpb25zKSB7XHJcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyB8fCBkYXRhID09PSAnJykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBpbnB1dCB0ZXh0JylcclxuICB9XHJcblxyXG4gIGxldCBlcnJvckNvcnJlY3Rpb25MZXZlbCA9IEVDTGV2ZWwuTVxyXG4gIGxldCB2ZXJzaW9uXHJcbiAgbGV0IG1hc2tcclxuXHJcbiAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgLy8gVXNlIGhpZ2hlciBlcnJvciBjb3JyZWN0aW9uIGxldmVsIGFzIGRlZmF1bHRcclxuICAgIGVycm9yQ29ycmVjdGlvbkxldmVsID0gRUNMZXZlbC5mcm9tKG9wdGlvbnMuZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIEVDTGV2ZWwuTSlcclxuICAgIHZlcnNpb24gPSBWZXJzaW9uLmZyb20ob3B0aW9ucy52ZXJzaW9uKVxyXG4gICAgbWFzayA9IE1hc2tQYXR0ZXJuLmZyb20ob3B0aW9ucy5tYXNrUGF0dGVybilcclxuXHJcbiAgICBpZiAob3B0aW9ucy50b1NKSVNGdW5jKSB7XHJcbiAgICAgIFV0aWxzLnNldFRvU0pJU0Z1bmN0aW9uKG9wdGlvbnMudG9TSklTRnVuYylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBjcmVhdGVTeW1ib2woZGF0YSwgdmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2spXHJcbn1cclxuIiwiZnVuY3Rpb24gaGV4MnJnYmEgKGhleCkge1xyXG4gIGlmICh0eXBlb2YgaGV4ID09PSAnbnVtYmVyJykge1xyXG4gICAgaGV4ID0gaGV4LnRvU3RyaW5nKClcclxuICB9XHJcblxyXG4gIGlmICh0eXBlb2YgaGV4ICE9PSAnc3RyaW5nJykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb2xvciBzaG91bGQgYmUgZGVmaW5lZCBhcyBoZXggc3RyaW5nJylcclxuICB9XHJcblxyXG4gIGxldCBoZXhDb2RlID0gaGV4LnNsaWNlKCkucmVwbGFjZSgnIycsICcnKS5zcGxpdCgnJylcclxuICBpZiAoaGV4Q29kZS5sZW5ndGggPCAzIHx8IGhleENvZGUubGVuZ3RoID09PSA1IHx8IGhleENvZGUubGVuZ3RoID4gOCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBjb2xvcjogJyArIGhleClcclxuICB9XHJcblxyXG4gIC8vIENvbnZlcnQgZnJvbSBzaG9ydCB0byBsb25nIGZvcm0gKGZmZiAtPiBmZmZmZmYpXHJcbiAgaWYgKGhleENvZGUubGVuZ3RoID09PSAzIHx8IGhleENvZGUubGVuZ3RoID09PSA0KSB7XHJcbiAgICBoZXhDb2RlID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgaGV4Q29kZS5tYXAoZnVuY3Rpb24gKGMpIHtcclxuICAgICAgcmV0dXJuIFtjLCBjXVxyXG4gICAgfSkpXHJcbiAgfVxyXG5cclxuICAvLyBBZGQgZGVmYXVsdCBhbHBoYSB2YWx1ZVxyXG4gIGlmIChoZXhDb2RlLmxlbmd0aCA9PT0gNikgaGV4Q29kZS5wdXNoKCdGJywgJ0YnKVxyXG5cclxuICBjb25zdCBoZXhWYWx1ZSA9IHBhcnNlSW50KGhleENvZGUuam9pbignJyksIDE2KVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcjogKGhleFZhbHVlID4+IDI0KSAmIDI1NSxcclxuICAgIGc6IChoZXhWYWx1ZSA+PiAxNikgJiAyNTUsXHJcbiAgICBiOiAoaGV4VmFsdWUgPj4gOCkgJiAyNTUsXHJcbiAgICBhOiBoZXhWYWx1ZSAmIDI1NSxcclxuICAgIGhleDogJyMnICsgaGV4Q29kZS5zbGljZSgwLCA2KS5qb2luKCcnKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0cy5nZXRPcHRpb25zID0gZnVuY3Rpb24gZ2V0T3B0aW9ucyAob3B0aW9ucykge1xyXG4gIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9XHJcbiAgaWYgKCFvcHRpb25zLmNvbG9yKSBvcHRpb25zLmNvbG9yID0ge31cclxuXHJcbiAgY29uc3QgbWFyZ2luID0gdHlwZW9mIG9wdGlvbnMubWFyZ2luID09PSAndW5kZWZpbmVkJyB8fFxyXG4gICAgb3B0aW9ucy5tYXJnaW4gPT09IG51bGwgfHxcclxuICAgIG9wdGlvbnMubWFyZ2luIDwgMFxyXG4gICAgPyA0XHJcbiAgICA6IG9wdGlvbnMubWFyZ2luXHJcblxyXG4gIGNvbnN0IHdpZHRoID0gb3B0aW9ucy53aWR0aCAmJiBvcHRpb25zLndpZHRoID49IDIxID8gb3B0aW9ucy53aWR0aCA6IHVuZGVmaW5lZFxyXG4gIGNvbnN0IHNjYWxlID0gb3B0aW9ucy5zY2FsZSB8fCA0XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICB3aWR0aDogd2lkdGgsXHJcbiAgICBzY2FsZTogd2lkdGggPyA0IDogc2NhbGUsXHJcbiAgICBtYXJnaW46IG1hcmdpbixcclxuICAgIGNvbG9yOiB7XHJcbiAgICAgIGRhcms6IGhleDJyZ2JhKG9wdGlvbnMuY29sb3IuZGFyayB8fCAnIzAwMDAwMGZmJyksXHJcbiAgICAgIGxpZ2h0OiBoZXgycmdiYShvcHRpb25zLmNvbG9yLmxpZ2h0IHx8ICcjZmZmZmZmZmYnKVxyXG4gICAgfSxcclxuICAgIHR5cGU6IG9wdGlvbnMudHlwZSxcclxuICAgIHJlbmRlcmVyT3B0czogb3B0aW9ucy5yZW5kZXJlck9wdHMgfHwge31cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydHMuZ2V0U2NhbGUgPSBmdW5jdGlvbiBnZXRTY2FsZSAocXJTaXplLCBvcHRzKSB7XHJcbiAgcmV0dXJuIG9wdHMud2lkdGggJiYgb3B0cy53aWR0aCA+PSBxclNpemUgKyBvcHRzLm1hcmdpbiAqIDJcclxuICAgID8gb3B0cy53aWR0aCAvIChxclNpemUgKyBvcHRzLm1hcmdpbiAqIDIpXHJcbiAgICA6IG9wdHMuc2NhbGVcclxufVxyXG5cclxuZXhwb3J0cy5nZXRJbWFnZVdpZHRoID0gZnVuY3Rpb24gZ2V0SW1hZ2VXaWR0aCAocXJTaXplLCBvcHRzKSB7XHJcbiAgY29uc3Qgc2NhbGUgPSBleHBvcnRzLmdldFNjYWxlKHFyU2l6ZSwgb3B0cylcclxuICByZXR1cm4gTWF0aC5mbG9vcigocXJTaXplICsgb3B0cy5tYXJnaW4gKiAyKSAqIHNjYWxlKVxyXG59XHJcblxyXG5leHBvcnRzLnFyVG9JbWFnZURhdGEgPSBmdW5jdGlvbiBxclRvSW1hZ2VEYXRhIChpbWdEYXRhLCBxciwgb3B0cykge1xyXG4gIGNvbnN0IHNpemUgPSBxci5tb2R1bGVzLnNpemVcclxuICBjb25zdCBkYXRhID0gcXIubW9kdWxlcy5kYXRhXHJcbiAgY29uc3Qgc2NhbGUgPSBleHBvcnRzLmdldFNjYWxlKHNpemUsIG9wdHMpXHJcbiAgY29uc3Qgc3ltYm9sU2l6ZSA9IE1hdGguZmxvb3IoKHNpemUgKyBvcHRzLm1hcmdpbiAqIDIpICogc2NhbGUpXHJcbiAgY29uc3Qgc2NhbGVkTWFyZ2luID0gb3B0cy5tYXJnaW4gKiBzY2FsZVxyXG4gIGNvbnN0IHBhbGV0dGUgPSBbb3B0cy5jb2xvci5saWdodCwgb3B0cy5jb2xvci5kYXJrXVxyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IHN5bWJvbFNpemU7IGkrKykge1xyXG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBzeW1ib2xTaXplOyBqKyspIHtcclxuICAgICAgbGV0IHBvc0RzdCA9IChpICogc3ltYm9sU2l6ZSArIGopICogNFxyXG4gICAgICBsZXQgcHhDb2xvciA9IG9wdHMuY29sb3IubGlnaHRcclxuXHJcbiAgICAgIGlmIChpID49IHNjYWxlZE1hcmdpbiAmJiBqID49IHNjYWxlZE1hcmdpbiAmJlxyXG4gICAgICAgIGkgPCBzeW1ib2xTaXplIC0gc2NhbGVkTWFyZ2luICYmIGogPCBzeW1ib2xTaXplIC0gc2NhbGVkTWFyZ2luKSB7XHJcbiAgICAgICAgY29uc3QgaVNyYyA9IE1hdGguZmxvb3IoKGkgLSBzY2FsZWRNYXJnaW4pIC8gc2NhbGUpXHJcbiAgICAgICAgY29uc3QgalNyYyA9IE1hdGguZmxvb3IoKGogLSBzY2FsZWRNYXJnaW4pIC8gc2NhbGUpXHJcbiAgICAgICAgcHhDb2xvciA9IHBhbGV0dGVbZGF0YVtpU3JjICogc2l6ZSArIGpTcmNdID8gMSA6IDBdXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGltZ0RhdGFbcG9zRHN0KytdID0gcHhDb2xvci5yXHJcbiAgICAgIGltZ0RhdGFbcG9zRHN0KytdID0gcHhDb2xvci5nXHJcbiAgICAgIGltZ0RhdGFbcG9zRHN0KytdID0gcHhDb2xvci5iXHJcbiAgICAgIGltZ0RhdGFbcG9zRHN0XSA9IHB4Q29sb3IuYVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJjb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5cclxuZnVuY3Rpb24gY2xlYXJDYW52YXMgKGN0eCwgY2FudmFzLCBzaXplKSB7XHJcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpXHJcblxyXG4gIGlmICghY2FudmFzLnN0eWxlKSBjYW52YXMuc3R5bGUgPSB7fVxyXG4gIGNhbnZhcy5oZWlnaHQgPSBzaXplXHJcbiAgY2FudmFzLndpZHRoID0gc2l6ZVxyXG4gIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBzaXplICsgJ3B4J1xyXG4gIGNhbnZhcy5zdHlsZS53aWR0aCA9IHNpemUgKyAncHgnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENhbnZhc0VsZW1lbnQgKCkge1xyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBuZWVkIHRvIHNwZWNpZnkgYSBjYW52YXMgZWxlbWVudCcpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnRzLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlciAocXJEYXRhLCBjYW52YXMsIG9wdGlvbnMpIHtcclxuICBsZXQgb3B0cyA9IG9wdGlvbnNcclxuICBsZXQgY2FudmFzRWwgPSBjYW52YXNcclxuXHJcbiAgaWYgKHR5cGVvZiBvcHRzID09PSAndW5kZWZpbmVkJyAmJiAoIWNhbnZhcyB8fCAhY2FudmFzLmdldENvbnRleHQpKSB7XHJcbiAgICBvcHRzID0gY2FudmFzXHJcbiAgICBjYW52YXMgPSB1bmRlZmluZWRcclxuICB9XHJcblxyXG4gIGlmICghY2FudmFzKSB7XHJcbiAgICBjYW52YXNFbCA9IGdldENhbnZhc0VsZW1lbnQoKVxyXG4gIH1cclxuXHJcbiAgb3B0cyA9IFV0aWxzLmdldE9wdGlvbnMob3B0cylcclxuICBjb25zdCBzaXplID0gVXRpbHMuZ2V0SW1hZ2VXaWR0aChxckRhdGEubW9kdWxlcy5zaXplLCBvcHRzKVxyXG5cclxuICBjb25zdCBjdHggPSBjYW52YXNFbC5nZXRDb250ZXh0KCcyZCcpXHJcbiAgY29uc3QgaW1hZ2UgPSBjdHguY3JlYXRlSW1hZ2VEYXRhKHNpemUsIHNpemUpXHJcbiAgVXRpbHMucXJUb0ltYWdlRGF0YShpbWFnZS5kYXRhLCBxckRhdGEsIG9wdHMpXHJcblxyXG4gIGNsZWFyQ2FudmFzKGN0eCwgY2FudmFzRWwsIHNpemUpXHJcbiAgY3R4LnB1dEltYWdlRGF0YShpbWFnZSwgMCwgMClcclxuXHJcbiAgcmV0dXJuIGNhbnZhc0VsXHJcbn1cclxuXHJcbmV4cG9ydHMucmVuZGVyVG9EYXRhVVJMID0gZnVuY3Rpb24gcmVuZGVyVG9EYXRhVVJMIChxckRhdGEsIGNhbnZhcywgb3B0aW9ucykge1xyXG4gIGxldCBvcHRzID0gb3B0aW9uc1xyXG5cclxuICBpZiAodHlwZW9mIG9wdHMgPT09ICd1bmRlZmluZWQnICYmICghY2FudmFzIHx8ICFjYW52YXMuZ2V0Q29udGV4dCkpIHtcclxuICAgIG9wdHMgPSBjYW52YXNcclxuICAgIGNhbnZhcyA9IHVuZGVmaW5lZFxyXG4gIH1cclxuXHJcbiAgaWYgKCFvcHRzKSBvcHRzID0ge31cclxuXHJcbiAgY29uc3QgY2FudmFzRWwgPSBleHBvcnRzLnJlbmRlcihxckRhdGEsIGNhbnZhcywgb3B0cylcclxuXHJcbiAgY29uc3QgdHlwZSA9IG9wdHMudHlwZSB8fCAnaW1hZ2UvcG5nJ1xyXG4gIGNvbnN0IHJlbmRlcmVyT3B0cyA9IG9wdHMucmVuZGVyZXJPcHRzIHx8IHt9XHJcblxyXG4gIHJldHVybiBjYW52YXNFbC50b0RhdGFVUkwodHlwZSwgcmVuZGVyZXJPcHRzLnF1YWxpdHkpXHJcbn1cclxuIiwiY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcclxuXHJcbmZ1bmN0aW9uIGdldENvbG9yQXR0cmliIChjb2xvciwgYXR0cmliKSB7XHJcbiAgY29uc3QgYWxwaGEgPSBjb2xvci5hIC8gMjU1XHJcbiAgY29uc3Qgc3RyID0gYXR0cmliICsgJz1cIicgKyBjb2xvci5oZXggKyAnXCInXHJcblxyXG4gIHJldHVybiBhbHBoYSA8IDFcclxuICAgID8gc3RyICsgJyAnICsgYXR0cmliICsgJy1vcGFjaXR5PVwiJyArIGFscGhhLnRvRml4ZWQoMikuc2xpY2UoMSkgKyAnXCInXHJcbiAgICA6IHN0clxyXG59XHJcblxyXG5mdW5jdGlvbiBzdmdDbWQgKGNtZCwgeCwgeSkge1xyXG4gIGxldCBzdHIgPSBjbWQgKyB4XHJcbiAgaWYgKHR5cGVvZiB5ICE9PSAndW5kZWZpbmVkJykgc3RyICs9ICcgJyArIHlcclxuXHJcbiAgcmV0dXJuIHN0clxyXG59XHJcblxyXG5mdW5jdGlvbiBxclRvUGF0aCAoZGF0YSwgc2l6ZSwgbWFyZ2luKSB7XHJcbiAgbGV0IHBhdGggPSAnJ1xyXG4gIGxldCBtb3ZlQnkgPSAwXHJcbiAgbGV0IG5ld1JvdyA9IGZhbHNlXHJcbiAgbGV0IGxpbmVMZW5ndGggPSAwXHJcblxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgY29sID0gTWF0aC5mbG9vcihpICUgc2l6ZSlcclxuICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoaSAvIHNpemUpXHJcblxyXG4gICAgaWYgKCFjb2wgJiYgIW5ld1JvdykgbmV3Um93ID0gdHJ1ZVxyXG5cclxuICAgIGlmIChkYXRhW2ldKSB7XHJcbiAgICAgIGxpbmVMZW5ndGgrK1xyXG5cclxuICAgICAgaWYgKCEoaSA+IDAgJiYgY29sID4gMCAmJiBkYXRhW2kgLSAxXSkpIHtcclxuICAgICAgICBwYXRoICs9IG5ld1Jvd1xyXG4gICAgICAgICAgPyBzdmdDbWQoJ00nLCBjb2wgKyBtYXJnaW4sIDAuNSArIHJvdyArIG1hcmdpbilcclxuICAgICAgICAgIDogc3ZnQ21kKCdtJywgbW92ZUJ5LCAwKVxyXG5cclxuICAgICAgICBtb3ZlQnkgPSAwXHJcbiAgICAgICAgbmV3Um93ID0gZmFsc2VcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCEoY29sICsgMSA8IHNpemUgJiYgZGF0YVtpICsgMV0pKSB7XHJcbiAgICAgICAgcGF0aCArPSBzdmdDbWQoJ2gnLCBsaW5lTGVuZ3RoKVxyXG4gICAgICAgIGxpbmVMZW5ndGggPSAwXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG1vdmVCeSsrXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcGF0aFxyXG59XHJcblxyXG5leHBvcnRzLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlciAocXJEYXRhLCBvcHRpb25zLCBjYikge1xyXG4gIGNvbnN0IG9wdHMgPSBVdGlscy5nZXRPcHRpb25zKG9wdGlvbnMpXHJcbiAgY29uc3Qgc2l6ZSA9IHFyRGF0YS5tb2R1bGVzLnNpemVcclxuICBjb25zdCBkYXRhID0gcXJEYXRhLm1vZHVsZXMuZGF0YVxyXG4gIGNvbnN0IHFyY29kZXNpemUgPSBzaXplICsgb3B0cy5tYXJnaW4gKiAyXHJcblxyXG4gIGNvbnN0IGJnID0gIW9wdHMuY29sb3IubGlnaHQuYVxyXG4gICAgPyAnJ1xyXG4gICAgOiAnPHBhdGggJyArIGdldENvbG9yQXR0cmliKG9wdHMuY29sb3IubGlnaHQsICdmaWxsJykgK1xyXG4gICAgICAnIGQ9XCJNMCAwaCcgKyBxcmNvZGVzaXplICsgJ3YnICsgcXJjb2Rlc2l6ZSArICdIMHpcIi8+J1xyXG5cclxuICBjb25zdCBwYXRoID1cclxuICAgICc8cGF0aCAnICsgZ2V0Q29sb3JBdHRyaWIob3B0cy5jb2xvci5kYXJrLCAnc3Ryb2tlJykgK1xyXG4gICAgJyBkPVwiJyArIHFyVG9QYXRoKGRhdGEsIHNpemUsIG9wdHMubWFyZ2luKSArICdcIi8+J1xyXG5cclxuICBjb25zdCB2aWV3Qm94ID0gJ3ZpZXdCb3g9XCInICsgJzAgMCAnICsgcXJjb2Rlc2l6ZSArICcgJyArIHFyY29kZXNpemUgKyAnXCInXHJcblxyXG4gIGNvbnN0IHdpZHRoID0gIW9wdHMud2lkdGggPyAnJyA6ICd3aWR0aD1cIicgKyBvcHRzLndpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBvcHRzLndpZHRoICsgJ1wiICdcclxuXHJcbiAgY29uc3Qgc3ZnVGFnID0gJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiICcgKyB3aWR0aCArIHZpZXdCb3ggKyAnIHNoYXBlLXJlbmRlcmluZz1cImNyaXNwRWRnZXNcIj4nICsgYmcgKyBwYXRoICsgJzwvc3ZnPlxcbidcclxuXHJcbiAgaWYgKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgY2IobnVsbCwgc3ZnVGFnKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHN2Z1RhZ1xyXG59XHJcbiIsIlxyXG5jb25zdCBjYW5Qcm9taXNlID0gcmVxdWlyZSgnLi9jYW4tcHJvbWlzZScpXHJcblxyXG5jb25zdCBRUkNvZGUgPSByZXF1aXJlKCcuL2NvcmUvcXJjb2RlJylcclxuY29uc3QgQ2FudmFzUmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcmVyL2NhbnZhcycpXHJcbmNvbnN0IFN2Z1JlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlci9zdmctdGFnLmpzJylcclxuXHJcbmZ1bmN0aW9uIHJlbmRlckNhbnZhcyAocmVuZGVyRnVuYywgY2FudmFzLCB0ZXh0LCBvcHRzLCBjYikge1xyXG4gIGNvbnN0IGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcclxuICBjb25zdCBhcmdzTnVtID0gYXJncy5sZW5ndGhcclxuICBjb25zdCBpc0xhc3RBcmdDYiA9IHR5cGVvZiBhcmdzW2FyZ3NOdW0gLSAxXSA9PT0gJ2Z1bmN0aW9uJ1xyXG5cclxuICBpZiAoIWlzTGFzdEFyZ0NiICYmICFjYW5Qcm9taXNlKCkpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignQ2FsbGJhY2sgcmVxdWlyZWQgYXMgbGFzdCBhcmd1bWVudCcpXHJcbiAgfVxyXG5cclxuICBpZiAoaXNMYXN0QXJnQ2IpIHtcclxuICAgIGlmIChhcmdzTnVtIDwgMikge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RvbyBmZXcgYXJndW1lbnRzIHByb3ZpZGVkJylcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYXJnc051bSA9PT0gMikge1xyXG4gICAgICBjYiA9IHRleHRcclxuICAgICAgdGV4dCA9IGNhbnZhc1xyXG4gICAgICBjYW52YXMgPSBvcHRzID0gdW5kZWZpbmVkXHJcbiAgICB9IGVsc2UgaWYgKGFyZ3NOdW0gPT09IDMpIHtcclxuICAgICAgaWYgKGNhbnZhcy5nZXRDb250ZXh0ICYmIHR5cGVvZiBjYiA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICBjYiA9IG9wdHNcclxuICAgICAgICBvcHRzID0gdW5kZWZpbmVkXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2IgPSBvcHRzXHJcbiAgICAgICAgb3B0cyA9IHRleHRcclxuICAgICAgICB0ZXh0ID0gY2FudmFzXHJcbiAgICAgICAgY2FudmFzID0gdW5kZWZpbmVkXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgaWYgKGFyZ3NOdW0gPCAxKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVG9vIGZldyBhcmd1bWVudHMgcHJvdmlkZWQnKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhcmdzTnVtID09PSAxKSB7XHJcbiAgICAgIHRleHQgPSBjYW52YXNcclxuICAgICAgY2FudmFzID0gb3B0cyA9IHVuZGVmaW5lZFxyXG4gICAgfSBlbHNlIGlmIChhcmdzTnVtID09PSAyICYmICFjYW52YXMuZ2V0Q29udGV4dCkge1xyXG4gICAgICBvcHRzID0gdGV4dFxyXG4gICAgICB0ZXh0ID0gY2FudmFzXHJcbiAgICAgIGNhbnZhcyA9IHVuZGVmaW5lZFxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IFFSQ29kZS5jcmVhdGUodGV4dCwgb3B0cylcclxuICAgICAgICByZXNvbHZlKHJlbmRlckZ1bmMoZGF0YSwgY2FudmFzLCBvcHRzKSlcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJlamVjdChlKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGRhdGEgPSBRUkNvZGUuY3JlYXRlKHRleHQsIG9wdHMpXHJcbiAgICBjYihudWxsLCByZW5kZXJGdW5jKGRhdGEsIGNhbnZhcywgb3B0cykpXHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY2IoZSlcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydHMuY3JlYXRlID0gUVJDb2RlLmNyZWF0ZVxyXG5leHBvcnRzLnRvQ2FudmFzID0gcmVuZGVyQ2FudmFzLmJpbmQobnVsbCwgQ2FudmFzUmVuZGVyZXIucmVuZGVyKVxyXG5leHBvcnRzLnRvRGF0YVVSTCA9IHJlbmRlckNhbnZhcy5iaW5kKG51bGwsIENhbnZhc1JlbmRlcmVyLnJlbmRlclRvRGF0YVVSTClcclxuXHJcbi8vIG9ubHkgc3ZnIGZvciBub3cuXHJcbmV4cG9ydHMudG9TdHJpbmcgPSByZW5kZXJDYW52YXMuYmluZChudWxsLCBmdW5jdGlvbiAoZGF0YSwgXywgb3B0cykge1xyXG4gIHJldHVybiBTdmdSZW5kZXJlci5yZW5kZXIoZGF0YSwgb3B0cylcclxufSlcclxuIiwiLyoqXHJcbiAqIGNvcmUvZXJjMjAuanNcclxuICpcclxuICogRVJDLTIwIHRva2VuIGNvbnRyYWN0IGludGVyZmFjZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcbmltcG9ydCB7IGdldFByb3ZpZGVyIH0gZnJvbSAnLi9ycGMuanMnO1xyXG5cclxuLy8gU3RhbmRhcmQgRVJDLTIwIEFCSSAobWluaW1hbCBpbnRlcmZhY2Ugd2UgbmVlZClcclxuY29uc3QgRVJDMjBfQUJJID0gW1xyXG4gIC8vIFJlYWQgZnVuY3Rpb25zXHJcbiAgJ2Z1bmN0aW9uIG5hbWUoKSB2aWV3IHJldHVybnMgKHN0cmluZyknLFxyXG4gICdmdW5jdGlvbiBzeW1ib2woKSB2aWV3IHJldHVybnMgKHN0cmluZyknLFxyXG4gICdmdW5jdGlvbiBkZWNpbWFscygpIHZpZXcgcmV0dXJucyAodWludDgpJyxcclxuICAnZnVuY3Rpb24gdG90YWxTdXBwbHkoKSB2aWV3IHJldHVybnMgKHVpbnQyNTYpJyxcclxuICAnZnVuY3Rpb24gYmFsYW5jZU9mKGFkZHJlc3MgYWNjb3VudCkgdmlldyByZXR1cm5zICh1aW50MjU2KScsXHJcblxyXG4gIC8vIFdyaXRlIGZ1bmN0aW9uc1xyXG4gICdmdW5jdGlvbiB0cmFuc2ZlcihhZGRyZXNzIHRvLCB1aW50MjU2IGFtb3VudCkgcmV0dXJucyAoYm9vbCknLFxyXG4gICdmdW5jdGlvbiBhcHByb3ZlKGFkZHJlc3Mgc3BlbmRlciwgdWludDI1NiBhbW91bnQpIHJldHVybnMgKGJvb2wpJyxcclxuICAnZnVuY3Rpb24gYWxsb3dhbmNlKGFkZHJlc3Mgb3duZXIsIGFkZHJlc3Mgc3BlbmRlcikgdmlldyByZXR1cm5zICh1aW50MjU2KScsXHJcbiAgJ2Z1bmN0aW9uIHRyYW5zZmVyRnJvbShhZGRyZXNzIGZyb20sIGFkZHJlc3MgdG8sIHVpbnQyNTYgYW1vdW50KSByZXR1cm5zIChib29sKScsXHJcblxyXG4gIC8vIEV2ZW50c1xyXG4gICdldmVudCBUcmFuc2ZlcihhZGRyZXNzIGluZGV4ZWQgZnJvbSwgYWRkcmVzcyBpbmRleGVkIHRvLCB1aW50MjU2IHZhbHVlKScsXHJcbiAgJ2V2ZW50IEFwcHJvdmFsKGFkZHJlc3MgaW5kZXhlZCBvd25lciwgYWRkcmVzcyBpbmRleGVkIHNwZW5kZXIsIHVpbnQyNTYgdmFsdWUpJ1xyXG5dO1xyXG5cclxuLyoqXHJcbiAqIEdldHMgYW4gRVJDLTIwIGNvbnRyYWN0IGluc3RhbmNlXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHBhcmFtIHtzdHJpbmd9IHRva2VuQWRkcmVzcyAtIFRva2VuIGNvbnRyYWN0IGFkZHJlc3NcclxuICogQHJldHVybnMge1Byb21pc2U8ZXRoZXJzLkNvbnRyYWN0Pn0gQ29udHJhY3QgaW5zdGFuY2VcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUb2tlbkNvbnRyYWN0KG5ldHdvcmssIHRva2VuQWRkcmVzcykge1xyXG4gIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgcmV0dXJuIG5ldyBldGhlcnMuQ29udHJhY3QodG9rZW5BZGRyZXNzLCBFUkMyMF9BQkksIHByb3ZpZGVyKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZldGNoZXMgdG9rZW4gbWV0YWRhdGEgKG5hbWUsIHN5bWJvbCwgZGVjaW1hbHMpXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHBhcmFtIHtzdHJpbmd9IHRva2VuQWRkcmVzcyAtIFRva2VuIGNvbnRyYWN0IGFkZHJlc3NcclxuICogQHJldHVybnMge1Byb21pc2U8e25hbWU6IHN0cmluZywgc3ltYm9sOiBzdHJpbmcsIGRlY2ltYWxzOiBudW1iZXJ9Pn1cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUb2tlbk1ldGFkYXRhKG5ldHdvcmssIHRva2VuQWRkcmVzcykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBjb250cmFjdCA9IGF3YWl0IGdldFRva2VuQ29udHJhY3QobmV0d29yaywgdG9rZW5BZGRyZXNzKTtcclxuXHJcbiAgICBjb25zdCBbbmFtZSwgc3ltYm9sLCBkZWNpbWFsc10gPSBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgIGNvbnRyYWN0Lm5hbWUoKSxcclxuICAgICAgY29udHJhY3Quc3ltYm9sKCksXHJcbiAgICAgIGNvbnRyYWN0LmRlY2ltYWxzKClcclxuICAgIF0pO1xyXG5cclxuICAgIHJldHVybiB7IG5hbWUsIHN5bWJvbCwgZGVjaW1hbHM6IE51bWJlcihkZWNpbWFscykgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gZmV0Y2ggdG9rZW4gbWV0YWRhdGE6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIHRva2VuIGJhbGFuY2UgZm9yIGFuIGFkZHJlc3NcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5BZGRyZXNzIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gYWNjb3VudEFkZHJlc3MgLSBBY2NvdW50IGFkZHJlc3MgdG8gY2hlY2tcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gQmFsYW5jZSBpbiB3ZWkgKGFzIHN0cmluZylcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUb2tlbkJhbGFuY2UobmV0d29yaywgdG9rZW5BZGRyZXNzLCBhY2NvdW50QWRkcmVzcykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBjb250cmFjdCA9IGF3YWl0IGdldFRva2VuQ29udHJhY3QobmV0d29yaywgdG9rZW5BZGRyZXNzKTtcclxuICAgIGNvbnN0IGJhbGFuY2UgPSBhd2FpdCBjb250cmFjdC5iYWxhbmNlT2YoYWNjb3VudEFkZHJlc3MpO1xyXG4gICAgcmV0dXJuIGJhbGFuY2UudG9TdHJpbmcoKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gZ2V0IHRva2VuIGJhbGFuY2U6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXRzIHRva2VuIGJhbGFuY2UgZnJvbSB3ZWkgdG8gaHVtYW4tcmVhZGFibGVcclxuICogQHBhcmFtIHtzdHJpbmd9IGJhbGFuY2VXZWkgLSBCYWxhbmNlIGluIHdlaVxyXG4gKiBAcGFyYW0ge251bWJlcn0gZGVjaW1hbHMgLSBUb2tlbiBkZWNpbWFsc1xyXG4gKiBAcGFyYW0ge251bWJlcn0gZGlzcGxheURlY2ltYWxzIC0gTnVtYmVyIG9mIGRlY2ltYWxzIHRvIGRpc3BsYXkgKGRlZmF1bHQgNClcclxuICogQHJldHVybnMge3N0cmluZ30gRm9ybWF0dGVkIGJhbGFuY2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRUb2tlbkJhbGFuY2UoYmFsYW5jZVdlaSwgZGVjaW1hbHMsIGRpc3BsYXlEZWNpbWFscyA9IDQpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgYmFsYW5jZSA9IGV0aGVycy5mb3JtYXRVbml0cyhiYWxhbmNlV2VpLCBkZWNpbWFscyk7XHJcbiAgICBjb25zdCBudW0gPSBwYXJzZUZsb2F0KGJhbGFuY2UpO1xyXG4gICAgcmV0dXJuIG51bS50b0ZpeGVkKGRpc3BsYXlEZWNpbWFscyk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybiAnMC4wMDAwJztcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQYXJzZXMgaHVtYW4tcmVhZGFibGUgYW1vdW50IHRvIHdlaVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYW1vdW50IC0gSHVtYW4tcmVhZGFibGUgYW1vdW50XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWNpbWFscyAtIFRva2VuIGRlY2ltYWxzXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEFtb3VudCBpbiB3ZWlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRva2VuQW1vdW50KGFtb3VudCwgZGVjaW1hbHMpIHtcclxuICByZXR1cm4gZXRoZXJzLnBhcnNlVW5pdHMoYW1vdW50LCBkZWNpbWFscykudG9TdHJpbmcoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zZmVycyB0b2tlbnNcclxuICogQHBhcmFtIHtldGhlcnMuV2FsbGV0fSBzaWduZXIgLSBXYWxsZXQgc2lnbmVyXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlbkFkZHJlc3MgLSBUb2tlbiBjb250cmFjdCBhZGRyZXNzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0b0FkZHJlc3MgLSBSZWNpcGllbnQgYWRkcmVzc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gYW1vdW50IC0gQW1vdW50IGluIHdlaSAoYXMgc3RyaW5nKVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxldGhlcnMuVHJhbnNhY3Rpb25SZXNwb25zZT59IFRyYW5zYWN0aW9uIHJlc3BvbnNlXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdHJhbnNmZXJUb2tlbihzaWduZXIsIHRva2VuQWRkcmVzcywgdG9BZGRyZXNzLCBhbW91bnQpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgY29udHJhY3QgPSBuZXcgZXRoZXJzLkNvbnRyYWN0KHRva2VuQWRkcmVzcywgRVJDMjBfQUJJLCBzaWduZXIpO1xyXG4gICAgY29uc3QgdHggPSBhd2FpdCBjb250cmFjdC50cmFuc2Zlcih0b0FkZHJlc3MsIGFtb3VudCk7XHJcbiAgICByZXR1cm4gdHg7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHRyYW5zZmVyIHRva2VuOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGlmIGFuIGFkZHJlc3MgaXMgYSB2YWxpZCBFUkMtMjAgdG9rZW4gY29udHJhY3RcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5BZGRyZXNzIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzc1xyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gVHJ1ZSBpZiB2YWxpZCBFUkMtMjAgY29udHJhY3RcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2YWxpZGF0ZVRva2VuQ29udHJhY3QobmV0d29yaywgdG9rZW5BZGRyZXNzKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIENoZWNrIGlmIGFkZHJlc3MgaXMgdmFsaWRcclxuICAgIGlmICghZXRoZXJzLmlzQWRkcmVzcyh0b2tlbkFkZHJlc3MpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUcnkgdG8gZmV0Y2ggYmFzaWMgbWV0YWRhdGFcclxuICAgIGF3YWl0IGdldFRva2VuTWV0YWRhdGEobmV0d29yaywgdG9rZW5BZGRyZXNzKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBjb3JlL3Rva2Vucy5qc1xyXG4gKlxyXG4gKiBUb2tlbiBtYW5hZ2VtZW50IGFuZCBzdG9yYWdlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgbG9hZCwgc2F2ZSB9IGZyb20gJy4vc3RvcmFnZS5qcyc7XHJcbmltcG9ydCB7IGdldFRva2VuTWV0YWRhdGEsIHZhbGlkYXRlVG9rZW5Db250cmFjdCB9IGZyb20gJy4vZXJjMjAuanMnO1xyXG5cclxuLy8gTWF4aW11bSBjdXN0b20gdG9rZW5zIHBlciBuZXR3b3JrXHJcbmNvbnN0IE1BWF9UT0tFTlNfUEVSX05FVFdPUksgPSAyMDtcclxuXHJcbi8vIERlZmF1bHQvcHJlc2V0IHRva2VucyAoY2FuIGJlIGVhc2lseSBhZGRlZC9yZW1vdmVkIGJ5IHVzZXIpXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1RPS0VOUyA9IHtcclxuICBwdWxzZWNoYWluOiB7XHJcbiAgICAnSEVYJzoge1xyXG4gICAgICBuYW1lOiAnSEVYJyxcclxuICAgICAgc3ltYm9sOiAnSEVYJyxcclxuICAgICAgYWRkcmVzczogJzB4MmI1OTFlOTlhZmU5ZjMyZWFhNjIxNGY3Yjc2Mjk3NjhjNDBlZWIzOScsXHJcbiAgICAgIGRlY2ltYWxzOiA4LFxyXG4gICAgICBsb2dvOiAnaGV4LnBuZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL2hleC5jb20nLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL3B1bHNlY2hhaW4vMHhmMWY0ZWU2MTBiMmJhYmIwNWM2MzVmNzI2ZWY4YjBjNTY4YzhkYzY1J1xyXG4gICAgfSxcclxuICAgICdQTFNYJzoge1xyXG4gICAgICBuYW1lOiAnUHVsc2VYJyxcclxuICAgICAgc3ltYm9sOiAnUExTWCcsXHJcbiAgICAgIGFkZHJlc3M6ICcweDk1QjMwMzk4N0E2MEM3MTUwNEQ5OUFhMWIxM0I0REEwN2IwNzkwYWInLFxyXG4gICAgICBkZWNpbWFsczogMTgsXHJcbiAgICAgIGxvZ286ICdwbHN4LnBuZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL3B1bHNleC5jb20nLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL3B1bHNlY2hhaW4vMHgxYjQ1YjkxNDg3OTFkM2ExMDQxODRjZDVkZmU1Y2U1NzE5M2EzZWU5J1xyXG4gICAgfSxcclxuICAgICdJTkMnOiB7XHJcbiAgICAgIG5hbWU6ICdJbmNlbnRpdmUnLFxyXG4gICAgICBzeW1ib2w6ICdJTkMnLFxyXG4gICAgICBhZGRyZXNzOiAnMHgyZmE4NzhBYjNGODdDQzFDOTczN0ZjMDcxMTA4RjkwNGMwQjBDOTVkJyxcclxuICAgICAgZGVjaW1hbHM6IDE4LFxyXG4gICAgICBsb2dvOiAnaW5jLnN2ZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL2luY2VudGl2ZXRva2VuLmlvJyxcclxuICAgICAgZGV4U2NyZWVuZXJVcmw6ICdodHRwczovL2RleHNjcmVlbmVyLmNvbS9wdWxzZWNoYWluLzB4ZjgwOGJiNjI2NWU5Y2EyNzAwMmMwYTA0NTYyYmY1MGQ0ZmUzN2VhYSdcclxuICAgIH0sXHJcbiAgICAnU2F2YW50Jzoge1xyXG4gICAgICBuYW1lOiAnU2F2YW50JyxcclxuICAgICAgc3ltYm9sOiAnU2F2YW50JyxcclxuICAgICAgYWRkcmVzczogJzB4ZjE2ZTE3ZTRhMDFiZjk5QjBBMDNGZDNBYjY5N2JDODc5MDZlMTgwOScsXHJcbiAgICAgIGRlY2ltYWxzOiAxOCxcclxuICAgICAgbG9nbzogJ3NhdmFudC0xOTIucG5nJyxcclxuICAgICAgaG9tZVVybDogJ2h0dHBzOi8vdXNjZ3ZldC5naXRodWIuaW8vU2F2YW50L3RyYWRlLmh0bWwnLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL3B1bHNlY2hhaW4vMHhhYWE4ODk0NTg0YWFmMDA5MjM3MmYwYzc1Mzc2OWE1MGY2MDYwNzQyJ1xyXG4gICAgfSxcclxuICAgICdIWFInOiB7XHJcbiAgICAgIG5hbWU6ICdIZXhSZXdhcmRzJyxcclxuICAgICAgc3ltYm9sOiAnSFhSJyxcclxuICAgICAgYWRkcmVzczogJzB4Q2ZDYjg5ZjAwNTc2QTc3NWQ5ZjgxOTYxQTM3YmE3RENmMTJDN2Q5QicsXHJcbiAgICAgIGRlY2ltYWxzOiAxOCxcclxuICAgICAgbG9nbzogJ2hleHJld2FyZHMtMTAwMC5wbmcnLFxyXG4gICAgICBob21lVXJsOiAnaHR0cHM6Ly91c2NndmV0LmdpdGh1Yi5pby9IZXhSZXdhcmRzLycsXHJcbiAgICAgIGRleFNjcmVlbmVyVXJsOiAnaHR0cHM6Ly9kZXhzY3JlZW5lci5jb20vcHVsc2VjaGFpbi8weGQ1YThkZTAzM2M4Njk3Y2VhYTg0NGNhNTk2Y2M3NTgzYzRmOGY2MTInXHJcbiAgICB9LFxyXG4gICAgJ1RLUic6IHtcclxuICAgICAgbmFtZTogJ1Rha2VyJyxcclxuICAgICAgc3ltYm9sOiAnVEtSJyxcclxuICAgICAgYWRkcmVzczogJzB4ZDllNTkwMjAwODk5MTZBOEVmQTdEZDBCNjA1ZDU1MjE5RDcyZEI3QicsXHJcbiAgICAgIGRlY2ltYWxzOiAxOCxcclxuICAgICAgbG9nbzogJ3Rrci5zdmcnLFxyXG4gICAgICBob21lVXJsOiAnaHR0cHM6Ly91c2NndmV0LmdpdGh1Yi5pby9qZGFpLWRhcHAvJyxcclxuICAgICAgZGV4U2NyZWVuZXJVcmw6ICdodHRwczovL2RleHNjcmVlbmVyLmNvbS9wdWxzZWNoYWluLzB4MjA1YzZkNDRkODRlODI2MDZlNGU5MjFmODdiNTFiNzFiYTg1ZjBmMCdcclxuICAgIH0sXHJcbiAgICAnSkRBSSc6IHtcclxuICAgICAgbmFtZTogJ0pEQUkgVW5zdGFibGVjb2luJyxcclxuICAgICAgc3ltYm9sOiAnSkRBSScsXHJcbiAgICAgIGFkZHJlc3M6ICcweDE2MTBFNzVDOWI0OEJGNTUwMTM3ODIwNDUyZEU0MDQ5YkIyMmJCNzInLFxyXG4gICAgICBkZWNpbWFsczogMTgsXHJcbiAgICAgIGxvZ286ICdqZGFpLnN2ZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL3VzY2d2ZXQuZ2l0aHViLmlvL2pkYWktZGFwcC8nLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL3B1bHNlY2hhaW4vMHg3MDY1OENlNkQ2QzA5YWNkRTY0NkY2ZWE5QzU3QmE2NGY0RGMzNTBmJ1xyXG4gICAgfSxcclxuICAgICdSaWNreSc6IHtcclxuICAgICAgbmFtZTogJ1JpY2t5JyxcclxuICAgICAgc3ltYm9sOiAnUmlja3knLFxyXG4gICAgICBhZGRyZXNzOiAnMHg3OUZDMEUxZDNFQzAwZDgxRTU0MjNEY0MwMUE2MTdiMGUxMjQ1YzJCJyxcclxuICAgICAgZGVjaW1hbHM6IDE4LFxyXG4gICAgICBsb2dvOiAncmlja3kuanBnJyxcclxuICAgICAgaG9tZVVybDogJ2h0dHBzOi8vdHJ1dGhiZWhpbmRyaWNoYXJkaGVhcnQuY29tLycsXHJcbiAgICAgIGRleFNjcmVlbmVyVXJsOiAnaHR0cHM6Ly9kZXhzY3JlZW5lci5jb20vcHVsc2VjaGFpbi8weGJmZTVhZTQwYmJjYTc0ODc4NDE5YWQ3ZDdlMTE1YTMwY2NmYzYyZjEnXHJcbiAgICB9XHJcbiAgfSxcclxuICBwdWxzZWNoYWluVGVzdG5ldDoge1xyXG4gICAgJ0hFQVJUJzoge1xyXG4gICAgICBuYW1lOiAnSGVhcnRUb2tlbicsXHJcbiAgICAgIHN5bWJvbDogJ0hFQVJUJyxcclxuICAgICAgYWRkcmVzczogJzB4NzM1NzQyRDhlNUZhMzVjMTY1ZGVlZWQ0NTYwRGQ5MUExNUJBMWFCMicsXHJcbiAgICAgIGRlY2ltYWxzOiAxOCxcclxuICAgICAgbG9nbzogJ2hlYXJ0LnBuZydcclxuICAgIH1cclxuICB9LFxyXG4gIGV0aGVyZXVtOiB7XHJcbiAgICAnSEVYJzoge1xyXG4gICAgICBuYW1lOiAnSEVYJyxcclxuICAgICAgc3ltYm9sOiAnSEVYJyxcclxuICAgICAgYWRkcmVzczogJzB4MmI1OTFlOTlhZmU5ZjMyZWFhNjIxNGY3Yjc2Mjk3NjhjNDBlZWIzOScsXHJcbiAgICAgIGRlY2ltYWxzOiA4LFxyXG4gICAgICBsb2dvOiAnaGV4LnBuZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL2hleC5jb20nLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL2V0aGVyZXVtLzB4OWUwOTA1MjQ5Y2VlZmZmYjk2MDVlMDM0YjUzNDU0NDY4NGE1OGJlNidcclxuICAgIH1cclxuICB9LFxyXG4gIHNlcG9saWE6IHt9XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0cyBzdG9yYWdlIGtleSBmb3IgY3VzdG9tIHRva2Vuc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRTdG9yYWdlS2V5KG5ldHdvcmspIHtcclxuICByZXR1cm4gYGN1c3RvbV90b2tlbnNfJHtuZXR3b3JrfWA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIHN0b3JhZ2Uga2V5IGZvciBlbmFibGVkIGRlZmF1bHQgdG9rZW5zXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHJldHVybnMge3N0cmluZ31cclxuICovXHJcbmZ1bmN0aW9uIGdldERlZmF1bHRUb2tlbnNLZXkobmV0d29yaykge1xyXG4gIHJldHVybiBgZW5hYmxlZF9kZWZhdWx0X3Rva2Vuc18ke25ldHdvcmt9YDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgYWxsIGN1c3RvbSB0b2tlbnMgZm9yIGEgbmV0d29ya1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn1cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDdXN0b21Ub2tlbnMobmV0d29yaykge1xyXG4gIGNvbnN0IGtleSA9IGdldFN0b3JhZ2VLZXkobmV0d29yayk7XHJcbiAgY29uc3QgdG9rZW5zID0gYXdhaXQgbG9hZChrZXkpO1xyXG4gIHJldHVybiB0b2tlbnMgfHwgW107XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIGVuYWJsZWQgZGVmYXVsdCB0b2tlbnMgZm9yIGEgbmV0d29ya1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5PHN0cmluZz4+fSBBcnJheSBvZiBlbmFibGVkIGRlZmF1bHQgdG9rZW4gc3ltYm9sc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEVuYWJsZWREZWZhdWx0VG9rZW5zKG5ldHdvcmspIHtcclxuICBjb25zdCBrZXkgPSBnZXREZWZhdWx0VG9rZW5zS2V5KG5ldHdvcmspO1xyXG4gIGNvbnN0IGVuYWJsZWQgPSBhd2FpdCBsb2FkKGtleSk7XHJcbiAgLy8gSWYgbm90aGluZyBzdG9yZWQsIGFsbCBkZWZhdWx0cyBhcmUgZW5hYmxlZFxyXG4gIGlmICghZW5hYmxlZCkge1xyXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKERFRkFVTFRfVE9LRU5TW25ldHdvcmtdIHx8IHt9KTtcclxuICB9XHJcbiAgcmV0dXJuIGVuYWJsZWQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIGFsbCB0b2tlbnMgKGRlZmF1bHQgKyBjdXN0b20pIGZvciBhIG5ldHdvcmtcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxBcnJheT59XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QWxsVG9rZW5zKG5ldHdvcmspIHtcclxuICBjb25zdCBjdXN0b21Ub2tlbnMgPSBhd2FpdCBnZXRDdXN0b21Ub2tlbnMobmV0d29yayk7XHJcbiAgY29uc3QgZW5hYmxlZERlZmF1bHRzID0gYXdhaXQgZ2V0RW5hYmxlZERlZmF1bHRUb2tlbnMobmV0d29yayk7XHJcblxyXG4gIGNvbnN0IGRlZmF1bHRUb2tlbnMgPSBbXTtcclxuICBjb25zdCBuZXR3b3JrRGVmYXVsdHMgPSBERUZBVUxUX1RPS0VOU1tuZXR3b3JrXSB8fCB7fTtcclxuXHJcbiAgZm9yIChjb25zdCBzeW1ib2wgb2YgZW5hYmxlZERlZmF1bHRzKSB7XHJcbiAgICBpZiAobmV0d29ya0RlZmF1bHRzW3N5bWJvbF0pIHtcclxuICAgICAgZGVmYXVsdFRva2Vucy5wdXNoKHtcclxuICAgICAgICAuLi5uZXR3b3JrRGVmYXVsdHNbc3ltYm9sXSxcclxuICAgICAgICBpc0RlZmF1bHQ6IHRydWVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gWy4uLmRlZmF1bHRUb2tlbnMsIC4uLmN1c3RvbVRva2Vuc107XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGRzIGEgY3VzdG9tIHRva2VuXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHBhcmFtIHtzdHJpbmd9IHRva2VuQWRkcmVzcyAtIFRva2VuIGNvbnRyYWN0IGFkZHJlc3NcclxuICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0Pn0gQWRkZWQgdG9rZW4gb2JqZWN0XHJcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0b2tlbiBsaW1pdCByZWFjaGVkLCBpbnZhbGlkIGFkZHJlc3MsIG9yIGFscmVhZHkgZXhpc3RzXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkQ3VzdG9tVG9rZW4obmV0d29yaywgdG9rZW5BZGRyZXNzKSB7XHJcbiAgLy8gVmFsaWRhdGUgYWRkcmVzcyBmb3JtYXRcclxuICB0b2tlbkFkZHJlc3MgPSB0b2tlbkFkZHJlc3MudHJpbSgpO1xyXG4gIGlmICghdG9rZW5BZGRyZXNzLnN0YXJ0c1dpdGgoJzB4JykgfHwgdG9rZW5BZGRyZXNzLmxlbmd0aCAhPT0gNDIpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB0b2tlbiBhZGRyZXNzIGZvcm1hdCcpO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgaWYgaXQncyBhIGRlZmF1bHQgdG9rZW5cclxuICBjb25zdCBuZXR3b3JrRGVmYXVsdHMgPSBERUZBVUxUX1RPS0VOU1tuZXR3b3JrXSB8fCB7fTtcclxuICBmb3IgKGNvbnN0IHN5bWJvbCBpbiBuZXR3b3JrRGVmYXVsdHMpIHtcclxuICAgIGlmIChuZXR3b3JrRGVmYXVsdHNbc3ltYm9sXS5hZGRyZXNzLnRvTG93ZXJDYXNlKCkgPT09IHRva2VuQWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhpcyBpcyBhIGRlZmF1bHQgdG9rZW4gKCR7c3ltYm9sfSkuIFVzZSB0aGUgZGVmYXVsdCB0b2tlbnMgbGlzdCBpbnN0ZWFkLmApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gR2V0IGN1cnJlbnQgY3VzdG9tIHRva2Vuc1xyXG4gIGNvbnN0IGN1c3RvbVRva2VucyA9IGF3YWl0IGdldEN1c3RvbVRva2VucyhuZXR3b3JrKTtcclxuXHJcbiAgLy8gQ2hlY2sgbGltaXRcclxuICBpZiAoY3VzdG9tVG9rZW5zLmxlbmd0aCA+PSBNQVhfVE9LRU5TX1BFUl9ORVRXT1JLKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE1heGltdW0gJHtNQVhfVE9LRU5TX1BFUl9ORVRXT1JLfSBjdXN0b20gdG9rZW5zIHBlciBuZXR3b3JrYCk7XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiBhbHJlYWR5IGV4aXN0c1xyXG4gIGNvbnN0IGV4aXN0cyA9IGN1c3RvbVRva2Vucy5maW5kKFxyXG4gICAgdCA9PiB0LmFkZHJlc3MudG9Mb3dlckNhc2UoKSA9PT0gdG9rZW5BZGRyZXNzLnRvTG93ZXJDYXNlKClcclxuICApO1xyXG4gIGlmIChleGlzdHMpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignVG9rZW4gYWxyZWFkeSBhZGRlZCcpO1xyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgY29udHJhY3QgYW5kIGZldGNoIG1ldGFkYXRhXHJcbiAgY29uc3QgaXNWYWxpZCA9IGF3YWl0IHZhbGlkYXRlVG9rZW5Db250cmFjdChuZXR3b3JrLCB0b2tlbkFkZHJlc3MpO1xyXG4gIGlmICghaXNWYWxpZCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEVSQy0yMCB0b2tlbiBjb250cmFjdCcpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgbWV0YWRhdGEgPSBhd2FpdCBnZXRUb2tlbk1ldGFkYXRhKG5ldHdvcmssIHRva2VuQWRkcmVzcyk7XHJcblxyXG4gIC8vIENyZWF0ZSB0b2tlbiBlbnRyeVxyXG4gIGNvbnN0IHRva2VuID0ge1xyXG4gICAgYWRkcmVzczogdG9rZW5BZGRyZXNzLFxyXG4gICAgbmFtZTogbWV0YWRhdGEubmFtZSxcclxuICAgIHN5bWJvbDogbWV0YWRhdGEuc3ltYm9sLFxyXG4gICAgZGVjaW1hbHM6IG1ldGFkYXRhLmRlY2ltYWxzLFxyXG4gICAgbG9nbzogbnVsbCxcclxuICAgIGlzRGVmYXVsdDogZmFsc2UsXHJcbiAgICBhZGRlZEF0OiBEYXRlLm5vdygpXHJcbiAgfTtcclxuXHJcbiAgLy8gQWRkIHRvIGxpc3RcclxuICBjdXN0b21Ub2tlbnMucHVzaCh0b2tlbik7XHJcblxyXG4gIC8vIFNhdmVcclxuICBjb25zdCBrZXkgPSBnZXRTdG9yYWdlS2V5KG5ldHdvcmspO1xyXG4gIGF3YWl0IHNhdmUoa2V5LCBjdXN0b21Ub2tlbnMpO1xyXG5cclxuICByZXR1cm4gdG9rZW47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZW1vdmVzIGEgY3VzdG9tIHRva2VuXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHBhcmFtIHtzdHJpbmd9IHRva2VuQWRkcmVzcyAtIFRva2VuIGNvbnRyYWN0IGFkZHJlc3NcclxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlQ3VzdG9tVG9rZW4obmV0d29yaywgdG9rZW5BZGRyZXNzKSB7XHJcbiAgY29uc3QgY3VzdG9tVG9rZW5zID0gYXdhaXQgZ2V0Q3VzdG9tVG9rZW5zKG5ldHdvcmspO1xyXG5cclxuICBjb25zdCBmaWx0ZXJlZCA9IGN1c3RvbVRva2Vucy5maWx0ZXIoXHJcbiAgICB0ID0+IHQuYWRkcmVzcy50b0xvd2VyQ2FzZSgpICE9PSB0b2tlbkFkZHJlc3MudG9Mb3dlckNhc2UoKVxyXG4gICk7XHJcblxyXG4gIGNvbnN0IGtleSA9IGdldFN0b3JhZ2VLZXkobmV0d29yayk7XHJcbiAgYXdhaXQgc2F2ZShrZXksIGZpbHRlcmVkKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRvZ2dsZXMgYSBkZWZhdWx0IHRva2VuIG9uL29mZlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzeW1ib2wgLSBUb2tlbiBzeW1ib2xcclxuICogQHBhcmFtIHtib29sZWFufSBlbmFibGVkIC0gRW5hYmxlIG9yIGRpc2FibGVcclxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdG9nZ2xlRGVmYXVsdFRva2VuKG5ldHdvcmssIHN5bWJvbCwgZW5hYmxlZCkge1xyXG4gIGNvbnN0IGVuYWJsZWRUb2tlbnMgPSBhd2FpdCBnZXRFbmFibGVkRGVmYXVsdFRva2VucyhuZXR3b3JrKTtcclxuXHJcbiAgbGV0IHVwZGF0ZWQ7XHJcbiAgaWYgKGVuYWJsZWQpIHtcclxuICAgIC8vIEFkZCBpZiBub3QgYWxyZWFkeSBpbiBsaXN0XHJcbiAgICBpZiAoIWVuYWJsZWRUb2tlbnMuaW5jbHVkZXMoc3ltYm9sKSkge1xyXG4gICAgICB1cGRhdGVkID0gWy4uLmVuYWJsZWRUb2tlbnMsIHN5bWJvbF07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm47IC8vIEFscmVhZHkgZW5hYmxlZFxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBSZW1vdmUgZnJvbSBsaXN0XHJcbiAgICB1cGRhdGVkID0gZW5hYmxlZFRva2Vucy5maWx0ZXIocyA9PiBzICE9PSBzeW1ib2wpO1xyXG4gIH1cclxuXHJcbiAgY29uc3Qga2V5ID0gZ2V0RGVmYXVsdFRva2Vuc0tleShuZXR3b3JrKTtcclxuICBhd2FpdCBzYXZlKGtleSwgdXBkYXRlZCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgYSBkZWZhdWx0IHRva2VuIGlzIGVuYWJsZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3ltYm9sIC0gVG9rZW4gc3ltYm9sXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzRGVmYXVsdFRva2VuRW5hYmxlZChuZXR3b3JrLCBzeW1ib2wpIHtcclxuICBjb25zdCBlbmFibGVkID0gYXdhaXQgZ2V0RW5hYmxlZERlZmF1bHRUb2tlbnMobmV0d29yayk7XHJcbiAgcmV0dXJuIGVuYWJsZWQuaW5jbHVkZXMoc3ltYm9sKTtcclxufVxyXG4iLCIvKipcclxuICogUHJpY2UgT3JhY2xlIC0gRmV0Y2hlcyB0b2tlbiBwcmljZXMgZnJvbSBQdWxzZVggbGlxdWlkaXR5IHBvb2xzXHJcbiAqIFVzZXMgb24tY2hhaW4gcmVzZXJ2ZSBkYXRhIHRvIGNhbGN1bGF0ZSByZWFsLXRpbWUgREVYIHByaWNlc1xyXG4gKiBQcml2YWN5LXByZXNlcnZpbmc6IG9ubHkgdXNlcyBSUEMgY2FsbHMsIG5vIGV4dGVybmFsIEFQSXNcclxuICovXHJcblxyXG5pbXBvcnQgeyBldGhlcnMgfSBmcm9tICdldGhlcnMnO1xyXG5cclxuLy8gUHVsc2VYIFYyIFBhaXIgQUJJIChvbmx5IGdldFJlc2VydmVzIGZ1bmN0aW9uKVxyXG5jb25zdCBQQUlSX0FCSSA9IFtcclxuICAnZnVuY3Rpb24gZ2V0UmVzZXJ2ZXMoKSBleHRlcm5hbCB2aWV3IHJldHVybnMgKHVpbnQxMTIgcmVzZXJ2ZTAsIHVpbnQxMTIgcmVzZXJ2ZTEsIHVpbnQzMiBibG9ja1RpbWVzdGFtcExhc3QpJyxcclxuICAnZnVuY3Rpb24gdG9rZW4wKCkgZXh0ZXJuYWwgdmlldyByZXR1cm5zIChhZGRyZXNzKScsXHJcbiAgJ2Z1bmN0aW9uIHRva2VuMSgpIGV4dGVybmFsIHZpZXcgcmV0dXJucyAoYWRkcmVzcyknXHJcbl07XHJcblxyXG4vLyBLbm93biBQdWxzZVggVjIgcGFpciBhZGRyZXNzZXMgb24gUHVsc2VDaGFpbiBtYWlubmV0XHJcbi8vIEFsbCBhZGRyZXNzZXMgYXJlIGNoZWNrc3VtbWVkIGZvciBldGhlcnMuanMgdjYgY29tcGF0aWJpbGl0eVxyXG5jb25zdCBQVUxTRVhfUEFJUlMgPSB7XHJcbiAgcHVsc2VjaGFpbjoge1xyXG4gICAgLy8gUExTL0RBSSAtIFByaWNlIGFuY2hvciBmb3IgVVNEIGNvbnZlcnNpb25cclxuICAgICdQTFNfREFJJzogJzB4RTU2MDQzNjcxZGY1NWRFNUNEZjg0NTk3MTA0MzNDMTAzMjRERTBhRScsIC8vIE1heSBub3QgZXhpc3QsIGZhbGxiYWNrIHRvIFVTRENcclxuXHJcbiAgICAvLyBNYWpvciB0b2tlbiBwYWlycyAoYWxsIHBhaXJlZCB3aXRoIFdQTFMpXHJcbiAgICAnSEVYX1BMUyc6ICcweGYxRjRlZTYxMGIyYkFiQjA1QzYzNUY3MjZlRjhCMEM1NjhjOGRjNjUnLFxyXG4gICAgJ1BMU1hfUExTJzogJzB4MWI0NWI5MTQ4NzkxZDNhMTA0MTg0Q2Q1REZFNUNFNTcxOTNhM2VlOScsXHJcbiAgICAnSU5DX1BMUyc6ICcweGY4MDhCYjYyNjVlOUNhMjcwMDJjMEEwNDU2MkJmNTBkNEZFMzdFQUEnLCAvLyBGcm9tIEdlY2tvVGVybWluYWwgKGNoZWNrc3VtbWVkKVxyXG4gICAgJ1NhdmFudF9QTFMnOiAnMHhhQUE4ODk0NTg0YUFGMDA5MjM3MmYwQzc1Mzc2OWE1MGY2MDYwNzQyJyxcclxuICAgICdIWFJfUExTJzogJzB4RDVBOGRlMDMzYzg2OTdjRWFhODQ0Q0E1OTZjYzc1ODNjNGY4RjYxMicsXHJcbiAgICAnVEtSX1BMUyc6ICcweDIwNUM2ZDQ0ZDg0RTgyNjA2RTRFOTIxZjg3YjUxYjcxYmE4NUYwZjAnLFxyXG4gICAgJ0pEQUlfUExTJzogJzB4NzA2NThDZTZENkMwOWFjZEU2NDZGNmVhOUM1N0JhNjRmNERjMzUwZicsXHJcbiAgICAnUmlja3lfUExTJzogJzB4YmZlNWFlNDBiYmNhNzQ4Nzg0MTlhZDdkN2UxMTVhMzBjY2ZjNjJmMSdcclxuICB9XHJcbn07XHJcblxyXG4vLyBUb2tlbiBhZGRyZXNzZXMgYW5kIGRlY2ltYWxzIGZvciBwcmljZSByb3V0aW5nIChhbGwgY2hlY2tzdW1tZWQpXHJcbmNvbnN0IFRPS0VOX0FERFJFU1NFUyA9IHtcclxuICBwdWxzZWNoYWluOiB7XHJcbiAgICBXUExTOiB7IGFkZHJlc3M6ICcweEExMDc3YTI5NGRERTFCMDliQjA3ODg0NGRmNDA3NThhNUQwZjlhMjcnLCBkZWNpbWFsczogMTggfSxcclxuICAgIERBSTogeyBhZGRyZXNzOiAnMHhlZkQ3NjZjQ2IzOEVhRjFkZmQ3MDE4NTNCRkNlMzEzNTkyMzlGMzA1JywgZGVjaW1hbHM6IDE4IH0sXHJcbiAgICBIRVg6IHsgYWRkcmVzczogJzB4MmI1OTFlOTlhZkU5ZjMyZUFBNjIxNGY3Qjc2Mjk3NjhjNDBFZWIzOScsIGRlY2ltYWxzOiA4IH0sXHJcbiAgICBQTFNYOiB7IGFkZHJlc3M6ICcweDk1QjMwMzk4N0E2MEM3MTUwNEQ5OUFhMWIxM0I0REEwN2IwNzkwYWInLCBkZWNpbWFsczogMTggfSxcclxuICAgIElOQzogeyBhZGRyZXNzOiAnMHgyRkE4NzhBYjNGODdDQzFDOTczN0ZjMDcxMTA4RjkwNGMwQjBDOTVkJywgZGVjaW1hbHM6IDE4IH0sXHJcbiAgICBTYXZhbnQ6IHsgYWRkcmVzczogJzB4ZjE2ZTE3ZTRhMDFiZjk5QjBBMDNGZDNBYjY5N2JDODc5MDZlMTgwOScsIGRlY2ltYWxzOiAxOCB9LFxyXG4gICAgSFhSOiB7IGFkZHJlc3M6ICcweENmQ2I4OWYwMDU3NkE3NzVkOWY4MTk2MUEzN2JhN0RDZjEyQzdkOUInLCBkZWNpbWFsczogMTggfSxcclxuICAgIFRLUjogeyBhZGRyZXNzOiAnMHhkOWU1OTAyMDA4OTkxNkE4RWZBN0RkMEI2MDVkNTUyMTlENzJkQjdCJywgZGVjaW1hbHM6IDE4IH0sXHJcbiAgICBKREFJOiB7IGFkZHJlc3M6ICcweDE2MTBFNzVDOWI0OEJGNTUwMTM3ODIwNDUyZEU0MDQ5YkIyMmJCNzInLCBkZWNpbWFsczogMTggfSxcclxuICAgIFJpY2t5OiB7IGFkZHJlc3M6ICcweDc5RkMwRTFkM0VDMDBkODFFNTQyM0RjQzAxQTYxN2IwZTEyNDVjMkInLCBkZWNpbWFsczogMTggfVxyXG4gIH1cclxufTtcclxuXHJcbi8vIFByaWNlIGNhY2hlICg1IG1pbnV0ZSBleHBpcnkpXHJcbmNvbnN0IHByaWNlQ2FjaGUgPSB7XHJcbiAgcHJpY2VzOiB7fSxcclxuICB0aW1lc3RhbXA6IDAsXHJcbiAgQ0FDSEVfRFVSQVRJT046IDUgKiA2MCAqIDEwMDAgLy8gNSBtaW51dGVzXHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHJlc2VydmVzIGZyb20gYSBQdWxzZVggcGFpciBjb250cmFjdFxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZ2V0UGFpclJlc2VydmVzKHByb3ZpZGVyLCBwYWlyQWRkcmVzcykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwYWlyQ29udHJhY3QgPSBuZXcgZXRoZXJzLkNvbnRyYWN0KHBhaXJBZGRyZXNzLCBQQUlSX0FCSSwgcHJvdmlkZXIpO1xyXG4gICAgY29uc3QgW3Jlc2VydmUwLCByZXNlcnZlMV0gPSBhd2FpdCBwYWlyQ29udHJhY3QuZ2V0UmVzZXJ2ZXMoKTtcclxuICAgIGNvbnN0IHRva2VuMCA9IGF3YWl0IHBhaXJDb250cmFjdC50b2tlbjAoKTtcclxuICAgIGNvbnN0IHRva2VuMSA9IGF3YWl0IHBhaXJDb250cmFjdC50b2tlbjEoKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXNlcnZlMDogcmVzZXJ2ZTAudG9TdHJpbmcoKSxcclxuICAgICAgcmVzZXJ2ZTE6IHJlc2VydmUxLnRvU3RyaW5nKCksXHJcbiAgICAgIHRva2VuMDogdG9rZW4wLnRvTG93ZXJDYXNlKCksXHJcbiAgICAgIHRva2VuMTogdG9rZW4xLnRvTG93ZXJDYXNlKClcclxuICAgIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHBhaXIgcmVzZXJ2ZXM6JywgcGFpckFkZHJlc3MsIGVycm9yKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZSBwcmljZSBvZiB0b2tlbjAgaW4gdGVybXMgb2YgdG9rZW4xIGZyb20gcmVzZXJ2ZXNcclxuICogcHJpY2UgPSByZXNlcnZlMSAvIHJlc2VydmUwXHJcbiAqL1xyXG5mdW5jdGlvbiBjYWxjdWxhdGVQcmljZShyZXNlcnZlMCwgcmVzZXJ2ZTEsIGRlY2ltYWxzMCA9IDE4LCBkZWNpbWFsczEgPSAxOCkge1xyXG4gIGNvbnN0IHIwID0gcGFyc2VGbG9hdChldGhlcnMuZm9ybWF0VW5pdHMocmVzZXJ2ZTAsIGRlY2ltYWxzMCkpO1xyXG4gIGNvbnN0IHIxID0gcGFyc2VGbG9hdChldGhlcnMuZm9ybWF0VW5pdHMocmVzZXJ2ZTEsIGRlY2ltYWxzMSkpO1xyXG5cclxuICBpZiAocjAgPT09IDApIHJldHVybiAwO1xyXG4gIHJldHVybiByMSAvIHIwO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IFBMUyBwcmljZSBpbiBVU0QgdXNpbmcgSEVYIGFzIGludGVybWVkaWFyeVxyXG4gKiAxLiBHZXQgSEVYL1BMUyByZXNlcnZlcyAtPiBIRVggcHJpY2UgaW4gUExTXHJcbiAqIDIuIFVzZSBrbm93biBIRVggVVNEIHByaWNlICh+JDAuMDEpIHRvIGNhbGN1bGF0ZSBQTFMgVVNEIHByaWNlXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRQTFNQcmljZShwcm92aWRlcikge1xyXG4gIHRyeSB7XHJcbiAgICAvLyBGaXJzdCB0cnkgdGhlIERBSSBwYWlyXHJcbiAgICBjb25zdCBkYWlQYWlyQWRkcmVzcyA9IFBVTFNFWF9QQUlSUy5wdWxzZWNoYWluLlBMU19EQUk7XHJcbiAgICBjb25zdCBkYWlSZXNlcnZlcyA9IGF3YWl0IGdldFBhaXJSZXNlcnZlcyhwcm92aWRlciwgZGFpUGFpckFkZHJlc3MpO1xyXG5cclxuICAgIGlmIChkYWlSZXNlcnZlcykge1xyXG4gICAgICBjb25zdCB0b2tlbnMgPSBUT0tFTl9BRERSRVNTRVMucHVsc2VjaGFpbjtcclxuICAgICAgY29uc3QgcGxzQWRkcmVzcyA9IHRva2Vucy5XUExTLmFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuICAgICAgY29uc3QgZGFpQWRkcmVzcyA9IHRva2Vucy5EQUkuYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgbGV0IHBsc1Jlc2VydmUsIGRhaVJlc2VydmU7XHJcbiAgICAgIGlmIChkYWlSZXNlcnZlcy50b2tlbjAgPT09IHBsc0FkZHJlc3MpIHtcclxuICAgICAgICBwbHNSZXNlcnZlID0gZGFpUmVzZXJ2ZXMucmVzZXJ2ZTA7XHJcbiAgICAgICAgZGFpUmVzZXJ2ZSA9IGRhaVJlc2VydmVzLnJlc2VydmUxO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsc1Jlc2VydmUgPSBkYWlSZXNlcnZlcy5yZXNlcnZlMTtcclxuICAgICAgICBkYWlSZXNlcnZlID0gZGFpUmVzZXJ2ZXMucmVzZXJ2ZTA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHBsc1ByaWNlID0gY2FsY3VsYXRlUHJpY2UocGxzUmVzZXJ2ZSwgZGFpUmVzZXJ2ZSwgMTgsIDE4KTtcclxuICAgICAgY29uc29sZS5sb2coJ+KckyBQTFMgcHJpY2UgZnJvbSBEQUkgcGFpcjonLCBwbHNQcmljZSk7XHJcbiAgICAgIHJldHVybiBwbHNQcmljZTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS53YXJuKCdDb3VsZCBub3QgZmV0Y2ggUExTL0RBSSBwcmljZSwgdHJ5aW5nIGFsdGVybmF0aXZlLi4uJywgZXJyb3IubWVzc2FnZSk7XHJcbiAgfVxyXG5cclxuICAvLyBGYWxsYmFjazogQ2FsY3VsYXRlIHRocm91Z2ggSEVYXHJcbiAgLy8gVXNlIENvaW5HZWNrby9Db2luTWFya2V0Q2FwIGtub3duIEhFWCBwcmljZSBhcyBhbmNob3JcclxuICAvLyBPciB1c2UgYSBoYXJkY29kZWQgcmVhc29uYWJsZSBlc3RpbWF0ZVxyXG4gIGNvbnNvbGUubG9nKCdVc2luZyBIRVgtYmFzZWQgcHJpY2UgZXN0aW1hdGlvbiBhcyBmYWxsYmFjaycpO1xyXG4gIFxyXG4gIC8vIEdldCBIRVgvUExTIHJlc2VydmVzXHJcbiAgY29uc3QgaGV4UGFpckFkZHJlc3MgPSBQVUxTRVhfUEFJUlMucHVsc2VjaGFpbi5IRVhfUExTO1xyXG4gIGNvbnN0IGhleFJlc2VydmVzID0gYXdhaXQgZ2V0UGFpclJlc2VydmVzKHByb3ZpZGVyLCBoZXhQYWlyQWRkcmVzcyk7XHJcbiAgXHJcbiAgaWYgKCFoZXhSZXNlcnZlcykge1xyXG4gICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGZldGNoIEhFWC9QTFMgcmVzZXJ2ZXMgZm9yIHByaWNlIGNhbGN1bGF0aW9uJyk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIGNvbnN0IHRva2VucyA9IFRPS0VOX0FERFJFU1NFUy5wdWxzZWNoYWluO1xyXG4gIGNvbnN0IHBsc0FkZHJlc3MgPSB0b2tlbnMuV1BMUy5hZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3QgaGV4QWRkcmVzcyA9IHRva2Vucy5IRVguYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICBsZXQgcGxzUmVzZXJ2ZSwgaGV4UmVzZXJ2ZTtcclxuICBpZiAoaGV4UmVzZXJ2ZXMudG9rZW4wID09PSBoZXhBZGRyZXNzKSB7XHJcbiAgICBoZXhSZXNlcnZlID0gaGV4UmVzZXJ2ZXMucmVzZXJ2ZTA7XHJcbiAgICBwbHNSZXNlcnZlID0gaGV4UmVzZXJ2ZXMucmVzZXJ2ZTE7XHJcbiAgfSBlbHNlIHtcclxuICAgIGhleFJlc2VydmUgPSBoZXhSZXNlcnZlcy5yZXNlcnZlMTtcclxuICAgIHBsc1Jlc2VydmUgPSBoZXhSZXNlcnZlcy5yZXNlcnZlMDtcclxuICB9XHJcblxyXG4gIC8vIENhbGN1bGF0ZSBIRVggcHJpY2UgaW4gUExTXHJcbiAgY29uc3QgaGV4UmVzZXJ2ZUZvcm1hdHRlZCA9IHBhcnNlRmxvYXQoZXRoZXJzLmZvcm1hdFVuaXRzKGhleFJlc2VydmUsIDgpKTsgLy8gSEVYIGhhcyA4IGRlY2ltYWxzXHJcbiAgY29uc3QgcGxzUmVzZXJ2ZUZvcm1hdHRlZCA9IHBhcnNlRmxvYXQoZXRoZXJzLmZvcm1hdFVuaXRzKHBsc1Jlc2VydmUsIDE4KSk7XHJcbiAgY29uc3QgaGV4UHJpY2VJblBscyA9IHBsc1Jlc2VydmVGb3JtYXR0ZWQgLyBoZXhSZXNlcnZlRm9ybWF0dGVkO1xyXG5cclxuICAvLyBVc2UgYXBwcm94aW1hdGUgSEVYIFVTRCBwcmljZSAodXBkYXRlIHRoaXMgcGVyaW9kaWNhbGx5IG9yIGZldGNoIGZyb20gQ29pbkdlY2tvIEFQSSlcclxuICBjb25zdCBoZXhVc2RQcmljZSA9IDAuMDE7IC8vIEFwcHJveGltYXRlIC0gYWRqdXN0IGJhc2VkIG9uIG1hcmtldFxyXG4gIFxyXG4gIC8vIENhbGN1bGF0ZSBQTFMgVVNEIHByaWNlOiBpZiAxIEhFWCA9IFggUExTLCBhbmQgMSBIRVggPSAkMC4wMSwgdGhlbiAxIFBMUyA9ICQwLjAxIC8gWFxyXG4gIGNvbnN0IHBsc1VzZFByaWNlID0gaGV4VXNkUHJpY2UgLyBoZXhQcmljZUluUGxzO1xyXG4gIFxyXG4gIC8vIEVzdGltYXRlZCBQTFMgcHJpY2UgdmlhIEhFWFxyXG4gIFxyXG4gIHJldHVybiBwbHNVc2RQcmljZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB0b2tlbiBwcmljZSBpbiBQTFMgZnJvbSBQdWxzZVggcGFpclxyXG4gKiBSZXR1cm5zOiBIb3cgbXVjaCBQTFMgZG9lcyAxIHRva2VuIGNvc3RcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFRva2VuUHJpY2VJblBMUyhwcm92aWRlciwgcGFpckFkZHJlc3MsIHRva2VuQWRkcmVzcywgdG9rZW5EZWNpbWFscykge1xyXG4gIGNvbnN0IHJlc2VydmVzID0gYXdhaXQgZ2V0UGFpclJlc2VydmVzKHByb3ZpZGVyLCBwYWlyQWRkcmVzcyk7XHJcblxyXG4gIGlmICghcmVzZXJ2ZXMpIHJldHVybiBudWxsO1xyXG5cclxuICBjb25zdCBwbHNBZGRyZXNzID0gVE9LRU5fQUREUkVTU0VTLnB1bHNlY2hhaW4uV1BMUy5hZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3QgdGFyZ2V0VG9rZW4gPSB0b2tlbkFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgLy8gRGV0ZXJtaW5lIHdoaWNoIHJlc2VydmUgaXMgdGhlIHRva2VuIGFuZCB3aGljaCBpcyBQTFNcclxuICBsZXQgdG9rZW5SZXNlcnZlLCBwbHNSZXNlcnZlO1xyXG4gIGlmIChyZXNlcnZlcy50b2tlbjAgPT09IHRhcmdldFRva2VuKSB7XHJcbiAgICB0b2tlblJlc2VydmUgPSByZXNlcnZlcy5yZXNlcnZlMDtcclxuICAgIHBsc1Jlc2VydmUgPSByZXNlcnZlcy5yZXNlcnZlMTtcclxuICB9IGVsc2UgaWYgKHJlc2VydmVzLnRva2VuMSA9PT0gdGFyZ2V0VG9rZW4pIHtcclxuICAgIHRva2VuUmVzZXJ2ZSA9IHJlc2VydmVzLnJlc2VydmUxO1xyXG4gICAgcGxzUmVzZXJ2ZSA9IHJlc2VydmVzLnJlc2VydmUwO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdUb2tlbiBub3QgZm91bmQgaW4gcGFpcjonLCB0b2tlbkFkZHJlc3MsIHBhaXJBZGRyZXNzKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2FsY3VsYXRlIHRva2VuIHByaWNlIGluIFBMU1xyXG4gIC8vIFByaWNlIG9mIHRva2VuIGluIFBMUyA9IHBsc1Jlc2VydmUgLyB0b2tlblJlc2VydmVcclxuICAvLyBUaGlzIGdpdmVzOiBIb3cgbWFueSBQTFMgcGVyIDEgdG9rZW5cclxuICBjb25zdCB0b2tlblJlc2VydmVGb3JtYXR0ZWQgPSBwYXJzZUZsb2F0KGV0aGVycy5mb3JtYXRVbml0cyh0b2tlblJlc2VydmUsIHRva2VuRGVjaW1hbHMpKTtcclxuICBjb25zdCBwbHNSZXNlcnZlRm9ybWF0dGVkID0gcGFyc2VGbG9hdChldGhlcnMuZm9ybWF0VW5pdHMocGxzUmVzZXJ2ZSwgMTgpKTtcclxuXHJcbiAgLy8gVG9rZW4gcmVzZXJ2ZXMgZmV0Y2hlZFxyXG5cclxuICBpZiAodG9rZW5SZXNlcnZlRm9ybWF0dGVkID09PSAwKSByZXR1cm4gMDtcclxuXHJcbiAgY29uc3QgdG9rZW5QcmljZUluUGxzID0gcGxzUmVzZXJ2ZUZvcm1hdHRlZCAvIHRva2VuUmVzZXJ2ZUZvcm1hdHRlZDtcclxuICAvLyBUb2tlbiBwcmljZSBjYWxjdWxhdGVkXHJcbiAgcmV0dXJuIHRva2VuUHJpY2VJblBscztcclxufVxyXG5cclxuLyoqXHJcbiAqIEZldGNoIGFsbCB0b2tlbiBwcmljZXMgaW4gVVNEXHJcbiAqIFJldHVybnM6IHsgUExTOiBwcmljZSwgSEVYOiBwcmljZSwgUExTWDogcHJpY2UsIElOQzogcHJpY2UsIC4uLiB9XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hUb2tlblByaWNlcyhwcm92aWRlciwgbmV0d29yayA9ICdwdWxzZWNoYWluJykge1xyXG4gIC8vIENoZWNrIGNhY2hlIGZpcnN0XHJcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICBpZiAocHJpY2VDYWNoZS5wcmljZXNbbmV0d29ya10gJiYgKG5vdyAtIHByaWNlQ2FjaGUudGltZXN0YW1wKSA8IHByaWNlQ2FjaGUuQ0FDSEVfRFVSQVRJT04pIHtcclxuICAgIC8vIFVzaW5nIGNhY2hlZCBwcmljZXNcclxuICAgIHJldHVybiBwcmljZUNhY2hlLnByaWNlc1tuZXR3b3JrXTtcclxuICB9XHJcblxyXG4gIC8vIEZldGNoaW5nIGZyZXNoIHByaWNlc1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcHJpY2VzID0ge307XHJcblxyXG4gICAgLy8gU3RlcCAxOiBHZXQgUExTIHByaWNlIGluIFVTRFxyXG4gICAgY29uc3QgcGxzVXNkUHJpY2UgPSBhd2FpdCBnZXRQTFNQcmljZShwcm92aWRlcik7XHJcbiAgICBpZiAoIXBsc1VzZFByaWNlKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybignQ291bGQgbm90IGZldGNoIFBMUyBwcmljZScpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcmljZXMuUExTID0gcGxzVXNkUHJpY2U7XHJcbiAgICAvLyBQTFMgcHJpY2UgZmV0Y2hlZFxyXG5cclxuICAgIC8vIFN0ZXAgMjogR2V0IG90aGVyIHRva2VuIHByaWNlcyBpbiBQTFMsIHRoZW4gY29udmVydCB0byBVU0RcclxuICAgIGNvbnN0IHBhaXJzID0gUFVMU0VYX1BBSVJTW25ldHdvcmtdO1xyXG4gICAgY29uc3QgdG9rZW5zID0gVE9LRU5fQUREUkVTU0VTW25ldHdvcmtdO1xyXG5cclxuICAgIC8vIEhFWCBwcmljZVxyXG4gICAgY29uc3QgaGV4UHJpY2VJblBscyA9IGF3YWl0IGdldFRva2VuUHJpY2VJblBMUyhwcm92aWRlciwgcGFpcnMuSEVYX1BMUywgdG9rZW5zLkhFWC5hZGRyZXNzLCB0b2tlbnMuSEVYLmRlY2ltYWxzKTtcclxuICAgIGlmIChoZXhQcmljZUluUGxzKSB7XHJcbiAgICAgIHByaWNlcy5IRVggPSBoZXhQcmljZUluUGxzICogcGxzVXNkUHJpY2U7XHJcbiAgICAgIC8vIEhFWCBwcmljZSBjYWxjdWxhdGVkXHJcbiAgICB9XHJcblxyXG4gICAgLy8gUExTWCBwcmljZVxyXG4gICAgY29uc3QgcGxzeFByaWNlSW5QbHMgPSBhd2FpdCBnZXRUb2tlblByaWNlSW5QTFMocHJvdmlkZXIsIHBhaXJzLlBMU1hfUExTLCB0b2tlbnMuUExTWC5hZGRyZXNzLCB0b2tlbnMuUExTWC5kZWNpbWFscyk7XHJcbiAgICBpZiAocGxzeFByaWNlSW5QbHMpIHtcclxuICAgICAgcHJpY2VzLlBMU1ggPSBwbHN4UHJpY2VJblBscyAqIHBsc1VzZFByaWNlO1xyXG4gICAgICAvLyBQTFNYIHByaWNlIGNhbGN1bGF0ZWRcclxuICAgIH1cclxuXHJcbiAgICAvLyBJTkMgcHJpY2VcclxuICAgIGNvbnN0IGluY1ByaWNlSW5QbHMgPSBhd2FpdCBnZXRUb2tlblByaWNlSW5QTFMocHJvdmlkZXIsIHBhaXJzLklOQ19QTFMsIHRva2Vucy5JTkMuYWRkcmVzcywgdG9rZW5zLklOQy5kZWNpbWFscyk7XHJcbiAgICBpZiAoaW5jUHJpY2VJblBscykge1xyXG4gICAgICBwcmljZXMuSU5DID0gaW5jUHJpY2VJblBscyAqIHBsc1VzZFByaWNlO1xyXG4gICAgICAvLyBJTkMgcHJpY2UgY2FsY3VsYXRlZFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNhdmFudCBwcmljZVxyXG4gICAgY29uc3Qgc2F2YW50UHJpY2VJblBscyA9IGF3YWl0IGdldFRva2VuUHJpY2VJblBMUyhwcm92aWRlciwgcGFpcnMuU2F2YW50X1BMUywgdG9rZW5zLlNhdmFudC5hZGRyZXNzLCB0b2tlbnMuU2F2YW50LmRlY2ltYWxzKTtcclxuICAgIGlmIChzYXZhbnRQcmljZUluUGxzKSB7XHJcbiAgICAgIHByaWNlcy5TYXZhbnQgPSBzYXZhbnRQcmljZUluUGxzICogcGxzVXNkUHJpY2U7XHJcbiAgICAgIC8vIFNhdmFudCBwcmljZSBjYWxjdWxhdGVkXHJcbiAgICB9XHJcblxyXG4gICAgLy8gSFhSIHByaWNlXHJcbiAgICBjb25zdCBoeHJQcmljZUluUGxzID0gYXdhaXQgZ2V0VG9rZW5QcmljZUluUExTKHByb3ZpZGVyLCBwYWlycy5IWFJfUExTLCB0b2tlbnMuSFhSLmFkZHJlc3MsIHRva2Vucy5IWFIuZGVjaW1hbHMpO1xyXG4gICAgaWYgKGh4clByaWNlSW5QbHMpIHtcclxuICAgICAgcHJpY2VzLkhYUiA9IGh4clByaWNlSW5QbHMgKiBwbHNVc2RQcmljZTtcclxuICAgICAgLy8gSFhSIHByaWNlIGNhbGN1bGF0ZWRcclxuICAgIH1cclxuXHJcbiAgICAvLyBUS1IgcHJpY2VcclxuICAgIGNvbnN0IHRrclByaWNlSW5QbHMgPSBhd2FpdCBnZXRUb2tlblByaWNlSW5QTFMocHJvdmlkZXIsIHBhaXJzLlRLUl9QTFMsIHRva2Vucy5US1IuYWRkcmVzcywgdG9rZW5zLlRLUi5kZWNpbWFscyk7XHJcbiAgICBpZiAodGtyUHJpY2VJblBscykge1xyXG4gICAgICBwcmljZXMuVEtSID0gdGtyUHJpY2VJblBscyAqIHBsc1VzZFByaWNlO1xyXG4gICAgICAvLyBUS1IgcHJpY2UgY2FsY3VsYXRlZFxyXG4gICAgfVxyXG5cclxuICAgIC8vIEpEQUkgcHJpY2VcclxuICAgIGNvbnN0IGpkYWlQcmljZUluUGxzID0gYXdhaXQgZ2V0VG9rZW5QcmljZUluUExTKHByb3ZpZGVyLCBwYWlycy5KREFJX1BMUywgdG9rZW5zLkpEQUkuYWRkcmVzcywgdG9rZW5zLkpEQUkuZGVjaW1hbHMpO1xyXG4gICAgaWYgKGpkYWlQcmljZUluUGxzKSB7XHJcbiAgICAgIHByaWNlcy5KREFJID0gamRhaVByaWNlSW5QbHMgKiBwbHNVc2RQcmljZTtcclxuICAgICAgLy8gSkRBSSBwcmljZSBjYWxjdWxhdGVkXHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmlja3kgcHJpY2VcclxuICAgIGNvbnN0IHJpY2t5UHJpY2VJblBscyA9IGF3YWl0IGdldFRva2VuUHJpY2VJblBMUyhwcm92aWRlciwgcGFpcnMuUmlja3lfUExTLCB0b2tlbnMuUmlja3kuYWRkcmVzcywgdG9rZW5zLlJpY2t5LmRlY2ltYWxzKTtcclxuICAgIGlmIChyaWNreVByaWNlSW5QbHMpIHtcclxuICAgICAgcHJpY2VzLlJpY2t5ID0gcmlja3lQcmljZUluUGxzICogcGxzVXNkUHJpY2U7XHJcbiAgICAgIC8vIFJpY2t5IHByaWNlIGNhbGN1bGF0ZWRcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgY2FjaGVcclxuICAgIHByaWNlQ2FjaGUucHJpY2VzW25ldHdvcmtdID0gcHJpY2VzO1xyXG4gICAgcHJpY2VDYWNoZS50aW1lc3RhbXAgPSBub3c7XHJcblxyXG4gICAgcmV0dXJuIHByaWNlcztcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHRva2VuIHByaWNlczonLCBlcnJvcik7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgVVNEIHZhbHVlIGZvciBhIHRva2VuIGFtb3VudFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5TeW1ib2wgLSBUb2tlbiBzeW1ib2wgKFBMUywgSEVYLCBQTFNYLCBJTkMsIGV0Yy4pXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhbW91bnQgLSBUb2tlbiBhbW91bnQgYXMgc3RyaW5nIChpbiBiYXNlIHVuaXRzKVxyXG4gKiBAcGFyYW0ge251bWJlcn0gZGVjaW1hbHMgLSBUb2tlbiBkZWNpbWFsc1xyXG4gKiBAcGFyYW0ge29iamVjdH0gcHJpY2VzIC0gUHJpY2UgZGF0YSBmcm9tIGZldGNoVG9rZW5QcmljZXMoKVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRva2VuVmFsdWVVU0QodG9rZW5TeW1ib2wsIGFtb3VudCwgZGVjaW1hbHMsIHByaWNlcykge1xyXG4gIGlmICghcHJpY2VzIHx8ICFwcmljZXNbdG9rZW5TeW1ib2xdKSB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIGNvbnN0IHRva2VuQW1vdW50ID0gcGFyc2VGbG9hdChldGhlcnMuZm9ybWF0VW5pdHMoYW1vdW50LCBkZWNpbWFscykpO1xyXG4gIGNvbnN0IHRva2VuUHJpY2UgPSBwcmljZXNbdG9rZW5TeW1ib2xdO1xyXG5cclxuICByZXR1cm4gdG9rZW5BbW91bnQgKiB0b2tlblByaWNlO1xyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IFVTRCB2YWx1ZSBmb3IgZGlzcGxheVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFVTRCh2YWx1ZSkge1xyXG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICByZXR1cm4gJ+KAlCc7XHJcbiAgfVxyXG5cclxuICBpZiAodmFsdWUgPCAwLjAxKSB7XHJcbiAgICByZXR1cm4gYCQke3ZhbHVlLnRvRml4ZWQoNil9YDtcclxuICB9IGVsc2UgaWYgKHZhbHVlIDwgMSkge1xyXG4gICAgcmV0dXJuIGAkJHt2YWx1ZS50b0ZpeGVkKDQpfWA7XHJcbiAgfSBlbHNlIGlmICh2YWx1ZSA8IDEwMCkge1xyXG4gICAgcmV0dXJuIGAkJHt2YWx1ZS50b0ZpeGVkKDIpfWA7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiBgJCR7dmFsdWUudG9Mb2NhbGVTdHJpbmcoJ2VuLVVTJywgeyBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IDIsIG1heGltdW1GcmFjdGlvbkRpZ2l0czogMiB9KX1gO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENsZWFyIHByaWNlIGNhY2hlICh1c2VmdWwgZm9yIHRlc3Rpbmcgb3IgbWFudWFsIHJlZnJlc2gpXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJQcmljZUNhY2hlKCkge1xyXG4gIHByaWNlQ2FjaGUucHJpY2VzID0ge307XHJcbiAgcHJpY2VDYWNoZS50aW1lc3RhbXAgPSAwO1xyXG4gIC8vIFByaWNlIGNhY2hlIGNsZWFyZWRcclxufVxyXG4iLCIvKipcclxuICogcG9wdXAuanNcclxuICpcclxuICogVUkgY29udHJvbGxlciBmb3IgSGVhcnRXYWxsZXQgcG9wdXBcclxuICovXHJcblxyXG5pbXBvcnQge1xyXG4gIGNyZWF0ZVdhbGxldCxcclxuICBpbXBvcnRGcm9tTW5lbW9uaWMsXHJcbiAgaW1wb3J0RnJvbVByaXZhdGVLZXksXHJcbiAgdW5sb2NrV2FsbGV0LFxyXG4gIHdhbGxldEV4aXN0cyxcclxuICBleHBvcnRQcml2YXRlS2V5LFxyXG4gIGV4cG9ydE1uZW1vbmljLFxyXG4gIGRlbGV0ZVdhbGxldCxcclxuICBtaWdyYXRlVG9NdWx0aVdhbGxldCxcclxuICBnZXRBbGxXYWxsZXRzLFxyXG4gIGdldEFjdGl2ZVdhbGxldCxcclxuICBzZXRBY3RpdmVXYWxsZXQsXHJcbiAgYWRkV2FsbGV0LFxyXG4gIHJlbmFtZVdhbGxldCxcclxuICBleHBvcnRQcml2YXRlS2V5Rm9yV2FsbGV0LFxyXG4gIGV4cG9ydE1uZW1vbmljRm9yV2FsbGV0XHJcbn0gZnJvbSAnLi4vY29yZS93YWxsZXQuanMnO1xyXG5pbXBvcnQgeyBzYXZlLCBsb2FkIH0gZnJvbSAnLi4vY29yZS9zdG9yYWdlLmpzJztcclxuaW1wb3J0IHsgc2hvcnRlbkFkZHJlc3MgfSBmcm9tICcuLi9jb3JlL3ZhbGlkYXRpb24uanMnO1xyXG5pbXBvcnQgKiBhcyBycGMgZnJvbSAnLi4vY29yZS9ycGMuanMnO1xyXG5pbXBvcnQgeyBldGhlcnMgfSBmcm9tICdldGhlcnMnO1xyXG5pbXBvcnQgUVJDb2RlIGZyb20gJ3FyY29kZSc7XHJcbmltcG9ydCAqIGFzIHRva2VucyBmcm9tICcuLi9jb3JlL3Rva2Vucy5qcyc7XHJcbmltcG9ydCB7IGZldGNoVG9rZW5QcmljZXMsIGdldFRva2VuVmFsdWVVU0QsIGZvcm1hdFVTRCB9IGZyb20gJy4uL2NvcmUvcHJpY2VPcmFjbGUuanMnO1xyXG5pbXBvcnQgKiBhcyBlcmMyMCBmcm9tICcuLi9jb3JlL2VyYzIwLmpzJztcclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gU0VDVVJJVFkgVVRJTElUSUVTXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbi8qKlxyXG4gKiBFc2NhcGVzIEhUTUwgc3BlY2lhbCBjaGFyYWN0ZXJzIHRvIHByZXZlbnQgWFNTIGF0dGFja3NcclxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUZXh0IHRvIGVzY2FwZVxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBIVE1MLXNhZmUgdGV4dFxyXG4gKi9cclxuZnVuY3Rpb24gZXNjYXBlSHRtbCh0ZXh0KSB7XHJcbiAgaWYgKHR5cGVvZiB0ZXh0ICE9PSAnc3RyaW5nJykgcmV0dXJuICcnO1xyXG4gIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIGRpdi50ZXh0Q29udGVudCA9IHRleHQ7XHJcbiAgcmV0dXJuIGRpdi5pbm5lckhUTUw7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYW5pdGl6ZXMgZXJyb3IgbWVzc2FnZXMgZm9yIHNhZmUgZGlzcGxheSBpbiBhbGVydHMgYW5kIFVJXHJcbiAqIFJlbW92ZXMgSFRNTCB0YWdzLCBzY3JpcHRzLCBhbmQgbGltaXRzIGxlbmd0aFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIEVycm9yIG1lc3NhZ2UgdG8gc2FuaXRpemVcclxuICogQHJldHVybnMge3N0cmluZ30gU2FuaXRpemVkIG1lc3NhZ2VcclxuICovXHJcbmZ1bmN0aW9uIHNhbml0aXplRXJyb3IobWVzc2FnZSkge1xyXG4gIGlmICh0eXBlb2YgbWVzc2FnZSAhPT0gJ3N0cmluZycpIHJldHVybiAnVW5rbm93biBlcnJvcic7XHJcbiAgXHJcbiAgLy8gUmVtb3ZlIG51bGwgYnl0ZXMgYW5kIGNvbnRyb2wgY2hhcmFjdGVycyAoZXhjZXB0IG5ld2xpbmVzIGFuZCB0YWJzKVxyXG4gIGxldCBzYW5pdGl6ZWQgPSBtZXNzYWdlLnJlcGxhY2UoL1tcXHgwMC1cXHgwOFxceDBCXFx4MENcXHgwRS1cXHgxRlxceDdGXS9nLCAnJyk7XHJcbiAgXHJcbiAgLy8gUmVtb3ZlIEhUTUwgdGFnc1xyXG4gIHNhbml0aXplZCA9IHNhbml0aXplZC5yZXBsYWNlKC88W14+XSo+L2csICcnKTtcclxuICBcclxuICAvLyBSZW1vdmUgc2NyaXB0LWxpa2UgY29udGVudFxyXG4gIHNhbml0aXplZCA9IHNhbml0aXplZC5yZXBsYWNlKC9qYXZhc2NyaXB0Oi9naSwgJycpO1xyXG4gIHNhbml0aXplZCA9IHNhbml0aXplZC5yZXBsYWNlKC9vblxcdytcXHMqPS9naSwgJycpO1xyXG4gIFxyXG4gIC8vIExpbWl0IGxlbmd0aCB0byBwcmV2ZW50IERvU1xyXG4gIGlmIChzYW5pdGl6ZWQubGVuZ3RoID4gMzAwKSB7XHJcbiAgICBzYW5pdGl6ZWQgPSBzYW5pdGl6ZWQuc3Vic3RyaW5nKDAsIDI5NykgKyAnLi4uJztcclxuICB9XHJcbiAgXHJcbiAgcmV0dXJuIHNhbml0aXplZCB8fCAnVW5rbm93biBlcnJvcic7XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gU1RBVEVcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuLy8gPT09PT0gU1RBVEUgPT09PT1cclxubGV0IGN1cnJlbnRTdGF0ZSA9IHtcclxuICBpc1VubG9ja2VkOiBmYWxzZSxcclxuICBhZGRyZXNzOiBudWxsLFxyXG4gIGJhbGFuY2U6ICcwJyxcclxuICBuZXR3b3JrOiAncHVsc2VjaGFpbicsIC8vIERlZmF1bHQgdG8gUHVsc2VDaGFpbiBNYWlubmV0XHJcbiAgc2Vzc2lvblRva2VuOiBudWxsLCAvLyBTZXNzaW9uIHRva2VuIGZvciBhdXRoZW50aWNhdGVkIG9wZXJhdGlvbnMgKHN0b3JlZCBpbiBtZW1vcnkgb25seSlcclxuICBzZXR0aW5nczoge1xyXG4gICAgYXV0b0xvY2tNaW51dGVzOiAxNSxcclxuICAgIHNob3dUZXN0TmV0d29ya3M6IHRydWUsXHJcbiAgICBkZWNpbWFsUGxhY2VzOiA4LFxyXG4gICAgdGhlbWU6ICdoaWdoLWNvbnRyYXN0JyxcclxuICAgIG1heEdhc1ByaWNlR3dlaTogMTAwMCAvLyBNYXhpbXVtIGdhcyBwcmljZSBpbiBHd2VpIChkZWZhdWx0IDEwMDApXHJcbiAgfSxcclxuICBuZXR3b3JrU2V0dGluZ3M6IG51bGwsIC8vIFdpbGwgYmUgbG9hZGVkIGZyb20gc3RvcmFnZSBvciB1c2UgZGVmYXVsdHNcclxuICBsYXN0QWN0aXZpdHlUaW1lOiBudWxsLCAvLyBUcmFjayBsYXN0IGFjdGl2aXR5IGZvciBhdXRvLWxvY2tcclxuICB0b2tlblByaWNlczogbnVsbCwgLy8gVG9rZW4gcHJpY2VzIGluIFVTRCAoY2FjaGVkIGZyb20gUHVsc2VYKVxyXG4gIGN1cnJlbnRUb2tlbkRldGFpbHM6IG51bGwgLy8gQ3VycmVudGx5IHZpZXdpbmcgdG9rZW4gZGV0YWlsc1xyXG59O1xyXG5cclxuLy8gQXV0by1sb2NrIHRpbWVyXHJcbmxldCBhdXRvTG9ja1RpbWVyID0gbnVsbDtcclxuXHJcbi8vIFJhdGUgbGltaXRpbmcgZm9yIHBhc3N3b3JkIGF0dGVtcHRzXHJcbmNvbnN0IFJBVEVfTElNSVRfS0VZID0gJ3Bhc3N3b3JkX2F0dGVtcHRzJztcclxuY29uc3QgTUFYX0FUVEVNUFRTID0gNTtcclxuY29uc3QgTE9DS09VVF9EVVJBVElPTl9NUyA9IDMwICogNjAgKiAxMDAwOyAvLyAzMCBtaW51dGVzXHJcblxyXG4vLyBOZXR3b3JrIG5hbWVzIGZvciBkaXNwbGF5XHJcbmNvbnN0IE5FVFdPUktfTkFNRVMgPSB7XHJcbiAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ1B1bHNlQ2hhaW4gVGVzdG5ldCBWNCcsXHJcbiAgJ3B1bHNlY2hhaW4nOiAnUHVsc2VDaGFpbiBNYWlubmV0JyxcclxuICAnZXRoZXJldW0nOiAnRXRoZXJldW0gTWFpbm5ldCcsXHJcbiAgJ3NlcG9saWEnOiAnU2Vwb2xpYSBUZXN0bmV0J1xyXG59O1xyXG5cclxuY29uc3QgQkxPQ0tfRVhQTE9SRVJTID0ge1xyXG4gICdwdWxzZWNoYWluVGVzdG5ldCc6IHtcclxuICAgIGJhc2U6ICdodHRwczovL3NjYW4udjQudGVzdG5ldC5wdWxzZWNoYWluLmNvbScsXHJcbiAgICB0eDogJy90eC97aGFzaH0nLFxyXG4gICAgYWRkcmVzczogJy9hZGRyZXNzL3thZGRyZXNzfScsXHJcbiAgICB0b2tlbjogJy90b2tlbi97YWRkcmVzc30nXHJcbiAgfSxcclxuICAncHVsc2VjaGFpbic6IHtcclxuICAgIGJhc2U6ICdodHRwczovL3NjYW4ubXlwaW5hdGEuY2xvdWQvaXBmcy9iYWZ5YmVpZW54eW95cmhuNXRzd2NsdmQzZ2RqeTVtdGtrd211MzdhcXRtbDZvbmJmN3huYjNvMjJwZS8nLFxyXG4gICAgdHg6ICcjL3R4L3toYXNofScsXHJcbiAgICBhZGRyZXNzOiAnIy9hZGRyZXNzL3thZGRyZXNzfScsXHJcbiAgICB0b2tlbjogJyMvdG9rZW4ve2FkZHJlc3N9J1xyXG4gIH0sXHJcbiAgJ2V0aGVyZXVtJzoge1xyXG4gICAgYmFzZTogJ2h0dHBzOi8vZXRoZXJzY2FuLmlvJyxcclxuICAgIHR4OiAnL3R4L3toYXNofScsXHJcbiAgICBhZGRyZXNzOiAnL2FkZHJlc3Mve2FkZHJlc3N9JyxcclxuICAgIHRva2VuOiAnL3Rva2VuL3thZGRyZXNzfSdcclxuICB9LFxyXG4gICdzZXBvbGlhJzoge1xyXG4gICAgYmFzZTogJ2h0dHBzOi8vc2Vwb2xpYS5ldGhlcnNjYW4uaW8nLFxyXG4gICAgdHg6ICcvdHgve2hhc2h9JyxcclxuICAgIGFkZHJlc3M6ICcvYWRkcmVzcy97YWRkcmVzc30nLFxyXG4gICAgdG9rZW46ICcvdG9rZW4ve2FkZHJlc3N9J1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBCdWlsZCBleHBsb3JlciBVUkwgZm9yIGEgc3BlY2lmaWMgdHlwZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVVJMIHR5cGUgKCd0eCcsICdhZGRyZXNzJywgJ3Rva2VuJylcclxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gVGhlIGhhc2ggb3IgYWRkcmVzcyB2YWx1ZVxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBDb21wbGV0ZSBleHBsb3JlciBVUkxcclxuICovXHJcbmZ1bmN0aW9uIGdldEV4cGxvcmVyVXJsKG5ldHdvcmssIHR5cGUsIHZhbHVlKSB7XHJcbiAgY29uc3QgZXhwbG9yZXIgPSBCTE9DS19FWFBMT1JFUlNbbmV0d29ya107XHJcbiAgaWYgKCFleHBsb3JlcikgcmV0dXJuICcnO1xyXG5cclxuICBjb25zdCBwYXR0ZXJuID0gZXhwbG9yZXJbdHlwZV07XHJcbiAgaWYgKCFwYXR0ZXJuKSByZXR1cm4gJyc7XHJcblxyXG4gIHJldHVybiBleHBsb3Jlci5iYXNlICsgcGF0dGVybi5yZXBsYWNlKGB7JHt0eXBlID09PSAndHgnID8gJ2hhc2gnIDogJ2FkZHJlc3MnfX1gLCB2YWx1ZSk7XHJcbn1cclxuXHJcbi8vID09PT09IElOSVRJQUxJWkFUSU9OID09PT09XHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBhc3luYyAoKSA9PiB7XHJcbiAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIGNvbm5lY3Rpb24gYXBwcm92YWwgcmVxdWVzdFxyXG4gIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XHJcbiAgY29uc3QgYWN0aW9uID0gdXJsUGFyYW1zLmdldCgnYWN0aW9uJyk7XHJcbiAgY29uc3Qgb3JpZ2luID0gdXJsUGFyYW1zLmdldCgnb3JpZ2luJyk7XHJcbiAgY29uc3QgcmVxdWVzdElkID0gdXJsUGFyYW1zLmdldCgncmVxdWVzdElkJyk7XHJcblxyXG4gIGlmIChhY3Rpb24gPT09ICdjb25uZWN0JyAmJiBvcmlnaW4gJiYgcmVxdWVzdElkKSB7XHJcbiAgICAvLyBTaG93IGNvbm5lY3Rpb24gYXBwcm92YWwgc2NyZWVuXHJcbiAgICBhd2FpdCBoYW5kbGVDb25uZWN0aW9uQXBwcm92YWxTY3JlZW4ob3JpZ2luLCByZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaWYgKGFjdGlvbiA9PT0gJ3RyYW5zYWN0aW9uJyAmJiByZXF1ZXN0SWQpIHtcclxuICAgIC8vIFNob3cgdHJhbnNhY3Rpb24gYXBwcm92YWwgc2NyZWVuXHJcbiAgICBzZXR1cEV2ZW50TGlzdGVuZXJzKCk7IC8vIFNldCB1cCBldmVudCBsaXN0ZW5lcnMgZmlyc3RcclxuICAgIGF3YWl0IGhhbmRsZVRyYW5zYWN0aW9uQXBwcm92YWxTY3JlZW4ocmVxdWVzdElkKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmIChhY3Rpb24gPT09ICdhZGRUb2tlbicgJiYgcmVxdWVzdElkKSB7XHJcbiAgICAvLyBTaG93IHRva2VuIGFkZCBhcHByb3ZhbCBzY3JlZW5cclxuICAgIGF3YWl0IGhhbmRsZVRva2VuQWRkQXBwcm92YWxTY3JlZW4ocmVxdWVzdElkKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmIChhY3Rpb24gPT09ICdzaWduJyAmJiByZXF1ZXN0SWQpIHtcclxuICAgIC8vIFNob3cgbWVzc2FnZSBzaWduaW5nIGFwcHJvdmFsIHNjcmVlblxyXG4gICAgYXdhaXQgaGFuZGxlTWVzc2FnZVNpZ25BcHByb3ZhbFNjcmVlbihyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaWYgKGFjdGlvbiA9PT0gJ3NpZ25UeXBlZCcgJiYgcmVxdWVzdElkKSB7XHJcbiAgICAvLyBTaG93IHR5cGVkIGRhdGEgc2lnbmluZyBhcHByb3ZhbCBzY3JlZW5cclxuICAgIGF3YWl0IGhhbmRsZVR5cGVkRGF0YVNpZ25BcHByb3ZhbFNjcmVlbihyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gTm9ybWFsIHBvcHVwIGZsb3dcclxuICAvLyBSdW4gbWlncmF0aW9uIGZpcnN0IChjb252ZXJ0cyBvbGQgc2luZ2xlLXdhbGxldCB0byBtdWx0aS13YWxsZXQgZm9ybWF0KVxyXG4gIGF3YWl0IG1pZ3JhdGVUb011bHRpV2FsbGV0KCk7XHJcblxyXG4gIGF3YWl0IGxvYWRTZXR0aW5ncygpO1xyXG4gIGF3YWl0IGxvYWROZXR3b3JrKCk7XHJcbiAgYXBwbHlUaGVtZSgpO1xyXG4gIGF3YWl0IGNoZWNrV2FsbGV0U3RhdHVzKCk7XHJcbiAgc2V0dXBFdmVudExpc3RlbmVycygpO1xyXG4gIHVwZGF0ZU5ldHdvcmtEaXNwbGF5cygpO1xyXG59KTtcclxuXHJcbi8vID09PT09IFNDUkVFTiBOQVZJR0FUSU9OID09PT09XHJcbmZ1bmN0aW9uIHNob3dTY3JlZW4oc2NyZWVuSWQpIHtcclxuICAvLyBIaWRlIGFsbCBzY3JlZW5zXHJcbiAgY29uc3Qgc2NyZWVucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tpZF49XCJzY3JlZW4tXCJdJyk7XHJcbiAgc2NyZWVucy5mb3JFYWNoKHNjcmVlbiA9PiBzY3JlZW4uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJykpO1xyXG5cclxuICAvLyBTaG93IHJlcXVlc3RlZCBzY3JlZW5cclxuICBjb25zdCBzY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzY3JlZW5JZCk7XHJcbiAgaWYgKHNjcmVlbikge1xyXG4gICAgc2NyZWVuLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgLy8gU2Nyb2xsIHRvIHRvcCB3aGVuIHNob3dpbmcgbmV3IHNjcmVlblxyXG4gICAgd2luZG93LnNjcm9sbFRvKDAsIDApO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY2hlY2tXYWxsZXRTdGF0dXMoKSB7XHJcbiAgY29uc3QgZXhpc3RzID0gYXdhaXQgd2FsbGV0RXhpc3RzKCk7XHJcblxyXG4gIGlmICghZXhpc3RzKSB7XHJcbiAgICAvLyBObyB3YWxsZXQgLSBzaG93IHNldHVwIHNjcmVlblxyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXNldHVwJyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIFdhbGxldCBleGlzdHMgLSBzaG93IHVubG9jayBzY3JlZW5cclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi11bmxvY2snKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFNFVFRJTkdTID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIGxvYWRTZXR0aW5ncygpIHtcclxuICBjb25zdCBzYXZlZCA9IGF3YWl0IGxvYWQoJ3NldHRpbmdzJyk7XHJcbiAgaWYgKHNhdmVkKSB7XHJcbiAgICBjdXJyZW50U3RhdGUuc2V0dGluZ3MgPSB7IC4uLmN1cnJlbnRTdGF0ZS5zZXR0aW5ncywgLi4uc2F2ZWQgfTtcclxuICB9XHJcblxyXG4gIC8vIExvYWQgbmV0d29yayBzZXR0aW5nc1xyXG4gIGNvbnN0IG5ldHdvcmtTZXR0aW5ncyA9IGF3YWl0IGxvYWQoJ25ldHdvcmtTZXR0aW5ncycpO1xyXG4gIGlmIChuZXR3b3JrU2V0dGluZ3MpIHtcclxuICAgIGN1cnJlbnRTdGF0ZS5uZXR3b3JrU2V0dGluZ3MgPSBuZXR3b3JrU2V0dGluZ3M7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzYXZlU2V0dGluZ3MoKSB7XHJcbiAgYXdhaXQgc2F2ZSgnc2V0dGluZ3MnLCBjdXJyZW50U3RhdGUuc2V0dGluZ3MpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBsb2FkTmV0d29yaygpIHtcclxuICBjb25zdCBzYXZlZCA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJyk7XHJcbiAgaWYgKHNhdmVkKSB7XHJcbiAgICBjdXJyZW50U3RhdGUubmV0d29yayA9IHNhdmVkO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2F2ZU5ldHdvcmsoKSB7XHJcbiAgYXdhaXQgc2F2ZSgnY3VycmVudE5ldHdvcmsnLCBjdXJyZW50U3RhdGUubmV0d29yayk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5VGhlbWUoKSB7XHJcbiAgLy8gUmVtb3ZlIGFsbCB0aGVtZSBjbGFzc2VzXHJcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCd0aGVtZS1oaWdoLWNvbnRyYXN0JywgJ3RoZW1lLXByb2Zlc3Npb25hbCcsICd0aGVtZS1hbWJlcicsICd0aGVtZS1jZ2EnLCAndGhlbWUtY2xhc3NpYycsICd0aGVtZS1oZWFydCcpO1xyXG5cclxuICAvLyBBcHBseSBjdXJyZW50IHRoZW1lXHJcbiAgaWYgKGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy50aGVtZSAhPT0gJ2hpZ2gtY29udHJhc3QnKSB7XHJcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoYHRoZW1lLSR7Y3VycmVudFN0YXRlLnNldHRpbmdzLnRoZW1lfWApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gRVZFTlQgTElTVEVORVJTID09PT09XHJcbmZ1bmN0aW9uIHNldHVwRXZlbnRMaXN0ZW5lcnMoKSB7XHJcbiAgLy8gU2V0dXAgc2NyZWVuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jcmVhdGUtd2FsbGV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgYXdhaXQgZ2VuZXJhdGVOZXdNbmVtb25pYygpO1xyXG4gICAgdXBkYXRlTmV0d29ya0Rpc3BsYXlzKCk7XHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tY3JlYXRlJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4taW1wb3J0LXdhbGxldCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIHVwZGF0ZU5ldHdvcmtEaXNwbGF5cygpO1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLWltcG9ydCcpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBOZXR3b3JrIHNlbGVjdGlvbiBvbiBzZXR1cCBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1zZWxlY3Qtc2V0dXAnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgIGN1cnJlbnRTdGF0ZS5uZXR3b3JrID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICBzYXZlTmV0d29yaygpO1xyXG4gICAgdXBkYXRlTmV0d29ya0Rpc3BsYXlzKCk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIENyZWF0ZSB3YWxsZXQgc2NyZWVuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Noay1zYXZlZC1tbmVtb25pYycpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgY29uc3QgcGFzc3dvcmRDcmVhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtY3JlYXRlJykudmFsdWU7XHJcbiAgICBjb25zdCBwYXNzd29yZENvbmZpcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtY29uZmlybScpLnZhbHVlO1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jcmVhdGUtc3VibWl0Jyk7XHJcblxyXG4gICAgYnRuLmRpc2FibGVkID0gIShlLnRhcmdldC5jaGVja2VkICYmIHBhc3N3b3JkQ3JlYXRlICYmIHBhc3N3b3JkQ29uZmlybSAmJiBwYXNzd29yZENyZWF0ZSA9PT0gcGFzc3dvcmRDb25maXJtKTtcclxuICB9KTtcclxuXHJcbiAgWydwYXNzd29yZC1jcmVhdGUnLCAncGFzc3dvcmQtY29uZmlybSddLmZvckVhY2goaWQgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcclxuICAgICAgY29uc3QgY2hlY2tlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGstc2F2ZWQtbW5lbW9uaWMnKS5jaGVja2VkO1xyXG4gICAgICBjb25zdCBwYXNzd29yZENyZWF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1jcmVhdGUnKS52YWx1ZTtcclxuICAgICAgY29uc3QgcGFzc3dvcmRDb25maXJtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLWNvbmZpcm0nKS52YWx1ZTtcclxuICAgICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jcmVhdGUtc3VibWl0Jyk7XHJcblxyXG4gICAgICBidG4uZGlzYWJsZWQgPSAhKGNoZWNrZWQgJiYgcGFzc3dvcmRDcmVhdGUgJiYgcGFzc3dvcmRDb25maXJtICYmIHBhc3N3b3JkQ3JlYXRlID09PSBwYXNzd29yZENvbmZpcm0pO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY3JlYXRlLXN1Ym1pdCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNyZWF0ZVdhbGxldCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtY3JlYXRlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLXNldHVwJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYmFjay1mcm9tLWNyZWF0ZScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1zZXR1cCcpKTtcclxuXHJcbiAgLy8gSW1wb3J0IHdhbGxldCBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1wb3J0LW1ldGhvZCcpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgY29uc3QgbW5lbW9uaWNHcm91cCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbXBvcnQtbW5lbW9uaWMtZ3JvdXAnKTtcclxuICAgIGNvbnN0IHByaXZhdGVrZXlHcm91cCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbXBvcnQtcHJpdmF0ZWtleS1ncm91cCcpO1xyXG5cclxuICAgIGlmIChlLnRhcmdldC52YWx1ZSA9PT0gJ21uZW1vbmljJykge1xyXG4gICAgICBtbmVtb25pY0dyb3VwLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICBwcml2YXRla2V5R3JvdXAuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtbmVtb25pY0dyb3VwLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICBwcml2YXRla2V5R3JvdXAuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4taW1wb3J0LXN1Ym1pdCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUltcG9ydFdhbGxldCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtaW1wb3J0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLXNldHVwJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYmFjay1mcm9tLWltcG9ydCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1zZXR1cCcpKTtcclxuXHJcbiAgLy8gVW5sb2NrIHNjcmVlblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdW5sb2NrJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlVW5sb2NrKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtdW5sb2NrJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgKGUpID0+IHtcclxuICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykge1xyXG4gICAgICBoYW5kbGVVbmxvY2soKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gQ3VzdG9tIG5ldHdvcmsgZHJvcGRvd25cclxuICBjb25zdCBuZXR3b3JrU2VsZWN0Q3VzdG9tID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmstc2VsZWN0LWN1c3RvbScpO1xyXG4gIGNvbnN0IG5ldHdvcmtEcm9wZG93bk1lbnUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1kcm9wZG93bi1tZW51Jyk7XHJcblxyXG4gIC8vIEluaXRpYWxpemUgZHJvcGRvd24gb3B0aW9uIGxvZ29zXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5ldHdvcmstb3B0aW9uIGltZycpLmZvckVhY2goaW1nID0+IHtcclxuICAgIGNvbnN0IGxvZ29GaWxlID0gaW1nLmdldEF0dHJpYnV0ZSgnZGF0YS1sb2dvJyk7XHJcbiAgICBpZiAobG9nb0ZpbGUpIHtcclxuICAgICAgaW1nLnNyYyA9IGNocm9tZS5ydW50aW1lLmdldFVSTChgYXNzZXRzL2xvZ29zLyR7bG9nb0ZpbGV9YCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIC8vIFRvZ2dsZSBkcm9wZG93blxyXG4gIG5ldHdvcmtTZWxlY3RDdXN0b20/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICBuZXR3b3JrRHJvcGRvd25NZW51LmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBIYW5kbGUgb3B0aW9uIHNlbGVjdGlvblxyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5uZXR3b3JrLW9wdGlvbicpLmZvckVhY2gob3B0aW9uID0+IHtcclxuICAgIG9wdGlvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIGNvbnN0IG5ldHdvcmsgPSBvcHRpb24uZ2V0QXR0cmlidXRlKCdkYXRhLW5ldHdvcmsnKTtcclxuICAgICAgY29uc3QgbmV0d29ya1RleHQgPSBvcHRpb24ucXVlcnlTZWxlY3Rvcignc3BhbicpLnRleHRDb250ZW50O1xyXG5cclxuICAgICAgY3VycmVudFN0YXRlLm5ldHdvcmsgPSBuZXR3b3JrO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1zZWxlY3RlZC10ZXh0JykudGV4dENvbnRlbnQgPSBuZXR3b3JrVGV4dDtcclxuICAgICAgbmV0d29ya0Ryb3Bkb3duTWVudS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgIHNhdmVOZXR3b3JrKCk7XHJcbiAgICAgIHVwZGF0ZU5ldHdvcmtEaXNwbGF5cygpO1xyXG4gICAgICBhd2FpdCBmZXRjaEJhbGFuY2UoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhvdmVyIGVmZmVjdCAtIGJvbGQgdGV4dFxyXG4gICAgb3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7XHJcbiAgICAgIG9wdGlvbi5xdWVyeVNlbGVjdG9yKCdzcGFuJykuc3R5bGUuZm9udFdlaWdodCA9ICdib2xkJztcclxuICAgIH0pO1xyXG4gICAgb3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XHJcbiAgICAgIG9wdGlvbi5xdWVyeVNlbGVjdG9yKCdzcGFuJykuc3R5bGUuZm9udFdlaWdodCA9ICdub3JtYWwnO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIENsb3NlIGRyb3Bkb3duIHdoZW4gY2xpY2tpbmcgb3V0c2lkZVxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgbmV0d29ya0Ryb3Bkb3duTWVudT8uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3YWxsZXQtc2VsZWN0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGFzeW5jIChlKSA9PiB7XHJcbiAgICBjb25zdCBzZWxlY3RlZFdhbGxldElkID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICBpZiAoc2VsZWN0ZWRXYWxsZXRJZCkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IHNldEFjdGl2ZVdhbGxldChzZWxlY3RlZFdhbGxldElkKTtcclxuICAgICAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgICAgICBjdXJyZW50U3RhdGUuYWRkcmVzcyA9IHdhbGxldC5hZGRyZXNzO1xyXG4gICAgICAgIGF3YWl0IHVwZGF0ZURhc2hib2FyZCgpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGFsZXJ0KCdFcnJvciBzd2l0Y2hpbmcgd2FsbGV0OiAnICsgc2FuaXRpemVFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1sb2NrJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlTG9jayk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1yZWZyZXNoJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgYXdhaXQgdXBkYXRlRGFzaGJvYXJkKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1zZXR0aW5ncycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGxvYWRTZXR0aW5nc1RvVUkoKTtcclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1zZXR0aW5ncycpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLW5ldHdvcmstc2V0dGluZ3MnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBsb2FkTmV0d29ya1NldHRpbmdzVG9VSSgpO1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLW5ldHdvcmstc2V0dGluZ3MnKTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20tbmV0d29yay1zZXR0aW5ncycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1zZXR0aW5ncycpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXNhdmUtbmV0d29yay1zZXR0aW5ncycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgIGF3YWl0IHNhdmVOZXR3b3JrU2V0dGluZ3MoKTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1yZXNldC1uZXR3b3JrLXNldHRpbmdzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgaWYgKGNvbmZpcm0oJ1Jlc2V0IGFsbCBuZXR3b3JrIHNldHRpbmdzIHRvIGRlZmF1bHRzPycpKSB7XHJcbiAgICAgIHJlc2V0TmV0d29ya1NldHRpbmdzVG9EZWZhdWx0cygpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS1hZGRyZXNzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQ29weUFkZHJlc3MpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tc2VuZCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3dTZW5kU2NyZWVuKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlY2VpdmUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93UmVjZWl2ZVNjcmVlbik7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi10b2tlbnMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93VG9rZW5zU2NyZWVuKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXR4LWhpc3RvcnknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93VHJhbnNhY3Rpb25IaXN0b3J5KTtcclxuXHJcbiAgLy8gU2VuZCBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS1zZW5kJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpO1xyXG4gICAgdXBkYXRlRGFzaGJvYXJkKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb25maXJtLXNlbmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTZW5kVHJhbnNhY3Rpb24pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2FuY2VsLXNlbmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tc2VuZC1tYXgnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTZW5kTWF4KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hc3NldC1zZWxlY3QnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlQXNzZXRDaGFuZ2UpO1xyXG5cclxuICAvLyBSZWNlaXZlIHNjcmVlblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYmFjay1mcm9tLXJlY2VpdmUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS1yZWNlaXZlLWFkZHJlc3MnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDb3B5UmVjZWl2ZUFkZHJlc3MpO1xyXG5cclxuICAvLyBUb2tlbnMgc2NyZWVuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20tdG9rZW5zJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWFkZC1jdXN0b20tdG9rZW4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93QWRkVG9rZW5Nb2RhbCk7XHJcblxyXG4gIC8vIFRva2VuIERldGFpbHMgc2NyZWVuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20tdG9rZW4tZGV0YWlscycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi10b2tlbnMnKTtcclxuICAgIGF3YWl0IHJlbmRlclRva2Vuc1NjcmVlbigpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWNvcHktYWRkcmVzcycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNvcHlUb2tlbkRldGFpbHNBZGRyZXNzKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXRva2VuLXNlbmQtbWF4Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlVG9rZW5TZW5kTWF4KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXRva2VuLXNlbmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVUb2tlblNlbmQpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWVuYWJsZS10b2dnbGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlVG9rZW5FbmFibGVUb2dnbGUpO1xyXG5cclxuICAvLyBUcmFuc2FjdGlvbiBIaXN0b3J5XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlbmRpbmctdHgtaW5kaWNhdG9yJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2hvd1RyYW5zYWN0aW9uSGlzdG9yeSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20tdHgtaGlzdG9yeScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlci1hbGwtdHhzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gcmVuZGVyVHJhbnNhY3Rpb25IaXN0b3J5KCdhbGwnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlci1wZW5kaW5nLXR4cycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHJlbmRlclRyYW5zYWN0aW9uSGlzdG9yeSgncGVuZGluZycpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsdGVyLWNvbmZpcm1lZC10eHMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiByZW5kZXJUcmFuc2FjdGlvbkhpc3RvcnkoJ2NvbmZpcm1lZCcpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsZWFyLXR4LWhpc3RvcnknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDbGVhclRyYW5zYWN0aW9uSGlzdG9yeSk7XHJcblxyXG4gIC8vIFRyYW5zYWN0aW9uIERldGFpbHNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS10eC1kZXRhaWxzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLXR4LWhpc3RvcnknKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LXR4LWhhc2gnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICBjb25zdCBoYXNoID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1oYXNoJykudGV4dENvbnRlbnQ7XHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChoYXNoKTtcclxuICAgICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LXR4LWhhc2gnKTtcclxuICAgICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gYnRuLnRleHRDb250ZW50O1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSAnQ09QSUVEISc7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGJ0bi50ZXh0Q29udGVudCA9IG9yaWdpbmFsVGV4dDtcclxuICAgICAgfSwgMjAwMCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBhbGVydCgnRmFpbGVkIHRvIGNvcHkgaGFzaCcpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tc3BlZWQtdXAtdHgnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTcGVlZFVwVHJhbnNhY3Rpb24pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2FuY2VsLXR4Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQ2FuY2VsVHJhbnNhY3Rpb24pO1xyXG5cclxuICAvLyBBZGQgdG9rZW4gbW9kYWxcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLWFkZC10b2tlbicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtdG9rZW4nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1hZGQtdG9rZW4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYWRkLXRva2VuJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb25maXJtLWFkZC10b2tlbicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUFkZEN1c3RvbVRva2VuKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtdG9rZW4tYWRkcmVzcycpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGhhbmRsZVRva2VuQWRkcmVzc0lucHV0KTtcclxuXHJcbiAgLy8gU2V0dGluZ3Mgc2NyZWVuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20tc2V0dGluZ3MnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLXRoZW1lJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XHJcbiAgICBjdXJyZW50U3RhdGUuc2V0dGluZ3MudGhlbWUgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgIGFwcGx5VGhlbWUoKTtcclxuICAgIHNhdmVTZXR0aW5ncygpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLWRlY2ltYWxzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XHJcbiAgICBjdXJyZW50U3RhdGUuc2V0dGluZ3MuZGVjaW1hbFBsYWNlcyA9IHBhcnNlSW50KGUudGFyZ2V0LnZhbHVlKTtcclxuICAgIHNhdmVTZXR0aW5ncygpO1xyXG4gICAgdXBkYXRlQmFsYW5jZURpc3BsYXkoKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0dGluZy1hdXRvbG9jaycpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgY3VycmVudFN0YXRlLnNldHRpbmdzLmF1dG9Mb2NrTWludXRlcyA9IHBhcnNlSW50KGUudGFyZ2V0LnZhbHVlKTtcclxuICAgIHNhdmVTZXR0aW5ncygpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLW1heC1nYXMtcHJpY2UnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5tYXhHYXNQcmljZUd3ZWkgPSBwYXJzZUludChlLnRhcmdldC52YWx1ZSk7XHJcbiAgICBzYXZlU2V0dGluZ3MoKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0dGluZy1zaG93LXRlc3RuZXRzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XHJcbiAgICBjdXJyZW50U3RhdGUuc2V0dGluZ3Muc2hvd1Rlc3ROZXR3b3JrcyA9IGUudGFyZ2V0LmNoZWNrZWQ7XHJcbiAgICBzYXZlU2V0dGluZ3MoKTtcclxuICAgIHVwZGF0ZU5ldHdvcmtTZWxlY3RvcigpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdmlldy1zZWVkJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlVmlld1NlZWQpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tZXhwb3J0LWtleScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUV4cG9ydEtleSk7XHJcblxyXG4gIC8vIFBhc3N3b3JkIHByb21wdCBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcGFzc3dvcmQtcHJvbXB0LWNvbmZpcm0nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1wcm9tcHQtaW5wdXQnKS52YWx1ZTtcclxuICAgIGlmIChwYXNzd29yZCkge1xyXG4gICAgICBjbG9zZVBhc3N3b3JkUHJvbXB0KHBhc3N3b3JkKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1wYXNzd29yZC1wcm9tcHQtY2FuY2VsJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgY2xvc2VQYXNzd29yZFByb21wdChudWxsKTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS1wYXNzd29yZC1wcm9tcHQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBjbG9zZVBhc3N3b3JkUHJvbXB0KG51bGwpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtcHJvbXB0LWlucHV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgKGUpID0+IHtcclxuICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykge1xyXG4gICAgICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1wcm9tcHQtaW5wdXQnKS52YWx1ZTtcclxuICAgICAgaWYgKHBhc3N3b3JkKSB7XHJcbiAgICAgICAgY2xvc2VQYXNzd29yZFByb21wdChwYXNzd29yZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gRGlzcGxheSBzZWNyZXQgbW9kYWxcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLWRpc3BsYXktc2VjcmV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VTZWNyZXRNb2RhbCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS1kaXNwbGF5LXNlY3JldC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZVNlY3JldE1vZGFsKTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LXNlY3JldCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgIGNvbnN0IHNlY3JldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXNwbGF5LXNlY3JldC1jb250ZW50JykudGV4dENvbnRlbnQ7XHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChzZWNyZXQpO1xyXG4gICAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvcHktc2VjcmV0Jyk7XHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGJ0bi50ZXh0Q29udGVudDtcclxuICAgICAgYnRuLnRleHRDb250ZW50ID0gJ0NPUElFRCEnO1xyXG4gICAgICBidG4uY2xhc3NMaXN0LmFkZCgndGV4dC1zdWNjZXNzJyk7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGJ0bi50ZXh0Q29udGVudCA9IG9yaWdpbmFsVGV4dDtcclxuICAgICAgICBidG4uY2xhc3NMaXN0LnJlbW92ZSgndGV4dC1zdWNjZXNzJyk7XHJcbiAgICAgIH0sIDIwMDApO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgYWxlcnQoJ0ZhaWxlZCB0byBjb3B5IHRvIGNsaXBib2FyZCcpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBNdWx0aS13YWxsZXQgbWFuYWdlbWVudFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tbWFuYWdlLXdhbGxldHMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVNYW5hZ2VXYWxsZXRzKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS1tYW5hZ2Utd2FsbGV0cycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1zZXR0aW5ncycpKTtcclxuXHJcbiAgLy8gQWRkIHdhbGxldCBidXR0b25zXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jcmVhdGUtbmV3LXdhbGxldC1tdWx0aScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3dBZGRXYWxsZXRNb2RhbCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1pbXBvcnQtd2FsbGV0LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2hvd0FkZFdhbGxldE1vZGFsKTtcclxuXHJcbiAgLy8gQWRkIHdhbGxldCBtb2RhbCAtIG9wdGlvbiBzZWxlY3Rpb25cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkLXdhbGxldC1vcHRpb24tY3JlYXRlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWFkZC13YWxsZXQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGdlbmVyYXRlTmV3TW5lbW9uaWNNdWx0aSgpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWNyZWF0ZS13YWxsZXQtbXVsdGknKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZC13YWxsZXQtb3B0aW9uLW1uZW1vbmljJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWFkZC13YWxsZXQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1pbXBvcnQtc2VlZC1tdWx0aScpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkLXdhbGxldC1vcHRpb24tcHJpdmF0ZWtleScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtd2FsbGV0JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LWtleS1tdWx0aScpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLWFkZC13YWxsZXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYWRkLXdhbGxldCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBDcmVhdGUgd2FsbGV0IG11bHRpIG1vZGFsXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb25maXJtLWNyZWF0ZS13YWxsZXQtbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDcmVhdGVOZXdXYWxsZXRNdWx0aSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtY3JlYXRlLXdhbGxldC1tdWx0aScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1jcmVhdGUtd2FsbGV0LW11bHRpJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtbmV3LXdhbGxldC1uaWNrbmFtZScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMS1tdWx0aScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMi1tdWx0aScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMy1tdWx0aScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZpY2F0aW9uLWVycm9yLW11bHRpJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS1jcmVhdGUtd2FsbGV0LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWNyZWF0ZS13YWxsZXQtbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1uZXctd2FsbGV0LW5pY2tuYW1lJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0xLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0yLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZmljYXRpb24tZXJyb3ItbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9KTtcclxuXHJcbiAgLy8gSW1wb3J0IHNlZWQgbXVsdGkgbW9kYWxcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvbmZpcm0taW1wb3J0LXNlZWQtbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVJbXBvcnRTZWVkTXVsdGkpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2FuY2VsLWltcG9ydC1zZWVkLW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1zZWVkLW11bHRpJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXNlZWQtbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1zZWVkLXBocmFzZScpLnZhbHVlID0gJyc7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS1pbXBvcnQtc2VlZC1tdWx0aScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1pbXBvcnQtc2VlZC1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1zZWVkLW5pY2tuYW1lJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtc2VlZC1waHJhc2UnKS52YWx1ZSA9ICcnO1xyXG4gIH0pO1xyXG5cclxuICAvLyBJbXBvcnQgcHJpdmF0ZSBrZXkgbXVsdGkgbW9kYWxcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvbmZpcm0taW1wb3J0LWtleS1tdWx0aScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUltcG9ydEtleU11bHRpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1pbXBvcnQta2V5LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1rZXktbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQta2V5LW5pY2tuYW1lJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtcHJpdmF0ZS1rZXknKS52YWx1ZSA9ICcnO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtaW1wb3J0LWtleS1tdWx0aScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1pbXBvcnQta2V5LW11bHRpJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LWtleS1uaWNrbmFtZScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXByaXZhdGUta2V5JykudmFsdWUgPSAnJztcclxuICB9KTtcclxuXHJcbiAgLy8gUmVuYW1lIHdhbGxldCBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29uZmlybS1yZW5hbWUtd2FsbGV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlUmVuYW1lV2FsbGV0Q29uZmlybSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtcmVuYW1lLXdhbGxldCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1yZW5hbWUtd2FsbGV0JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBjdXJyZW50UmVuYW1lV2FsbGV0SWQgPSBudWxsO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtcmVuYW1lLXdhbGxldCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1yZW5hbWUtd2FsbGV0JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBjdXJyZW50UmVuYW1lV2FsbGV0SWQgPSBudWxsO1xyXG4gIH0pO1xyXG5cclxuICAvLyBUcmFuc2FjdGlvbiBzdWNjZXNzIG1vZGFsXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS10eC1zdWNjZXNzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXR4LXN1Y2Nlc3MnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLW9rLXR4LXN1Y2Nlc3MnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtdHgtc3VjY2VzcycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS10eC1oYXNoJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgdHhIYXNoID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXN1Y2Nlc3MtaGFzaCcpLnRleHRDb250ZW50O1xyXG4gICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0eEhhc2gpO1xyXG4gICAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvcHktdHgtaGFzaCcpO1xyXG4gICAgICBjb25zdCBvcmlnaW5hbFRleHQgPSBidG4udGV4dENvbnRlbnQ7XHJcbiAgICAgIGJ0bi50ZXh0Q29udGVudCA9ICdDb3BpZWQhJztcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgYnRuLnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0O1xyXG4gICAgICB9LCAyMDAwKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGFsZXJ0KCdGYWlsZWQgdG8gY29weSB0cmFuc2FjdGlvbiBoYXNoJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIC8vIFRyYW5zYWN0aW9uIFN0YXR1cyBCdXR0b25zIChpbiBhcHByb3ZhbCBwb3B1cClcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXR4LXN0YXR1cy1leHBsb3JlcicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGlmICghdHhTdGF0dXNDdXJyZW50SGFzaCkgcmV0dXJuO1xyXG4gICAgY29uc3QgdXJsID0gZ2V0RXhwbG9yZXJVcmwoY3VycmVudFN0YXRlLm5ldHdvcmssICd0eCcsIHR4U3RhdHVzQ3VycmVudEhhc2gpO1xyXG4gICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsIH0pO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLXR4LXN0YXR1cycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCfwn6uAIENsb3NlIGJ1dHRvbiBjbGlja2VkJyk7XHJcbiAgICBpZiAodHhTdGF0dXNQb2xsSW50ZXJ2YWwpIHtcclxuICAgICAgY2xlYXJJbnRlcnZhbCh0eFN0YXR1c1BvbGxJbnRlcnZhbCk7XHJcbiAgICAgIHR4U3RhdHVzUG9sbEludGVydmFsID0gbnVsbDtcclxuICAgIH1cclxuICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXR4LXN0YXR1cy1zcGVlZC11cCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgIGlmICghdHhTdGF0dXNDdXJyZW50SGFzaCB8fCAhdHhTdGF0dXNDdXJyZW50QWRkcmVzcykgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgc2hvd1Bhc3N3b3JkUHJvbXB0KCdTcGVlZCBVcCBUcmFuc2FjdGlvbicsICdFbnRlciB5b3VyIHBhc3N3b3JkIHRvIHNwZWVkIHVwIHRoaXMgdHJhbnNhY3Rpb24gd2l0aCBoaWdoZXIgZ2FzIHByaWNlICgxLjJ4KScpO1xyXG4gICAgaWYgKCFwYXNzd29yZCkgcmV0dXJuO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGFjdGl2ZVdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgICBjb25zdCBzZXNzaW9uUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogJ0NSRUFURV9TRVNTSU9OJyxcclxuICAgICAgICBwYXNzd29yZDogcGFzc3dvcmQsXHJcbiAgICAgICAgd2FsbGV0SWQ6IGFjdGl2ZVdhbGxldC5pZCxcclxuICAgICAgICBkdXJhdGlvbk1zOiA2MDAwMFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmICghc2Vzc2lvblJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICBhbGVydCgnSW52YWxpZCBwYXNzd29yZCcpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogJ1NQRUVEX1VQX1RYJyxcclxuICAgICAgICBhZGRyZXNzOiB0eFN0YXR1c0N1cnJlbnRBZGRyZXNzLFxyXG4gICAgICAgIHR4SGFzaDogdHhTdGF0dXNDdXJyZW50SGFzaCxcclxuICAgICAgICBzZXNzaW9uVG9rZW46IHNlc3Npb25SZXNwb25zZS5zZXNzaW9uVG9rZW4sXHJcbiAgICAgICAgZ2FzUHJpY2VNdWx0aXBsaWVyOiAxLjJcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgIGFsZXJ0KGBUcmFuc2FjdGlvbiBzcGVkIHVwIVxcbk5ldyBUWDogJHtyZXNwb25zZS50eEhhc2guc2xpY2UoMCwgMjApfS4uLlxcblxcblRoZSB3aW5kb3cgd2lsbCBub3cgY2xvc2UuYCk7XHJcbiAgICAgICAgaWYgKHR4U3RhdHVzUG9sbEludGVydmFsKSB7XHJcbiAgICAgICAgICBjbGVhckludGVydmFsKHR4U3RhdHVzUG9sbEludGVydmFsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYWxlcnQoJ0Vycm9yIHNwZWVkaW5nIHVwIHRyYW5zYWN0aW9uOiAnICsgc2FuaXRpemVFcnJvcihyZXNwb25zZS5lcnJvcikpO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBhbGVydCgnRXJyb3I6ICcgKyBzYW5pdGl6ZUVycm9yKGVycm9yLm1lc3NhZ2UpKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi10eC1zdGF0dXMtY2FuY2VsJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKCF0eFN0YXR1c0N1cnJlbnRIYXNoIHx8ICF0eFN0YXR1c0N1cnJlbnRBZGRyZXNzKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ0NhbmNlbCBUcmFuc2FjdGlvbicsICdFbnRlciB5b3VyIHBhc3N3b3JkIHRvIGNhbmNlbCB0aGlzIHRyYW5zYWN0aW9uIGJ5IHNlbmRpbmcgYSAwLXZhbHVlIHJlcGxhY2VtZW50Jyk7XHJcbiAgICBpZiAoIXBhc3N3b3JkKSByZXR1cm47XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICAgIGNvbnN0IHNlc3Npb25SZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnQ1JFQVRFX1NFU1NJT04nLFxyXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcclxuICAgICAgICB3YWxsZXRJZDogYWN0aXZlV2FsbGV0LmlkLFxyXG4gICAgICAgIGR1cmF0aW9uTXM6IDYwMDAwXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKCFzZXNzaW9uUmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgIGFsZXJ0KCdJbnZhbGlkIHBhc3N3b3JkJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnQ0FOQ0VMX1RYJyxcclxuICAgICAgICBhZGRyZXNzOiB0eFN0YXR1c0N1cnJlbnRBZGRyZXNzLFxyXG4gICAgICAgIHR4SGFzaDogdHhTdGF0dXNDdXJyZW50SGFzaCxcclxuICAgICAgICBzZXNzaW9uVG9rZW46IHNlc3Npb25SZXNwb25zZS5zZXNzaW9uVG9rZW5cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgIGFsZXJ0KGBUcmFuc2FjdGlvbiBjYW5jZWxsZWQhXFxuQ2FuY2VsbGF0aW9uIFRYOiAke3Jlc3BvbnNlLnR4SGFzaC5zbGljZSgwLCAyMCl9Li4uXFxuXFxuVGhlIHdpbmRvdyB3aWxsIG5vdyBjbG9zZS5gKTtcclxuICAgICAgICBpZiAodHhTdGF0dXNQb2xsSW50ZXJ2YWwpIHtcclxuICAgICAgICAgIGNsZWFySW50ZXJ2YWwodHhTdGF0dXNQb2xsSW50ZXJ2YWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBhbGVydCgnRXJyb3IgY2FuY2VsbGluZyB0cmFuc2FjdGlvbjogJyArIHNhbml0aXplRXJyb3IocmVzcG9uc2UuZXJyb3IpKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgYWxlcnQoJ0Vycm9yOiAnICsgc2FuaXRpemVFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIC8vIEdsb2JhbCBhY3Rpdml0eSB0cmFja2luZyBmb3IgYXV0by1sb2NrXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZXNldEFjdGl2aXR5VGltZXIpO1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgcmVzZXRBY3Rpdml0eVRpbWVyKTtcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCByZXNldEFjdGl2aXR5VGltZXIpO1xyXG59XHJcblxyXG4vLyA9PT09PSBXQUxMRVQgQ1JFQVRJT04gPT09PT1cclxubGV0IGdlbmVyYXRlZE1uZW1vbmljID0gJyc7XHJcbmxldCB2ZXJpZmljYXRpb25Xb3JkcyA9IFtdOyAvLyBBcnJheSBvZiB7aW5kZXgsIHdvcmR9IGZvciB2ZXJpZmljYXRpb25cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlTmV3TW5lbW9uaWMoKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIEltcG9ydCBldGhlcnMgdG8gZ2VuZXJhdGUgbW5lbW9uaWNcclxuICAgIGNvbnN0IHsgZXRoZXJzIH0gPSBhd2FpdCBpbXBvcnQoJ2V0aGVycycpO1xyXG5cclxuICAgIC8vIEdlbmVyYXRlIGEgcmFuZG9tIHdhbGxldCB0byBnZXQgdGhlIG1uZW1vbmljXHJcbiAgICBjb25zdCByYW5kb21XYWxsZXQgPSBldGhlcnMuV2FsbGV0LmNyZWF0ZVJhbmRvbSgpO1xyXG4gICAgZ2VuZXJhdGVkTW5lbW9uaWMgPSByYW5kb21XYWxsZXQubW5lbW9uaWMucGhyYXNlO1xyXG5cclxuICAgIC8vIERpc3BsYXkgdGhlIG1uZW1vbmljXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW5lbW9uaWMtZGlzcGxheScpLnRleHRDb250ZW50ID0gZ2VuZXJhdGVkTW5lbW9uaWM7XHJcblxyXG4gICAgLy8gU2V0IHVwIHZlcmlmaWNhdGlvbiAoYXNrIGZvciAzIHJhbmRvbSB3b3JkcyB1c2luZyBjcnlwdG9ncmFwaGljYWxseSBzZWN1cmUgcmFuZG9tKVxyXG4gICAgY29uc3Qgd29yZHMgPSBnZW5lcmF0ZWRNbmVtb25pYy5zcGxpdCgnICcpO1xyXG4gICAgY29uc3QgcmFuZG9tQnl0ZXMgPSBuZXcgVWludDhBcnJheSgzKTtcclxuICAgIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMocmFuZG9tQnl0ZXMpO1xyXG4gICAgY29uc3QgaW5kaWNlcyA9IFtcclxuICAgICAgcmFuZG9tQnl0ZXNbMF0gJSA0LCAvLyBXb3JkIDEtNFxyXG4gICAgICA0ICsgKHJhbmRvbUJ5dGVzWzFdICUgNCksIC8vIFdvcmQgNS04XHJcbiAgICAgIDggKyAocmFuZG9tQnl0ZXNbMl0gJSA0KSAvLyBXb3JkIDktMTJcclxuICAgIF07XHJcblxyXG4gICAgdmVyaWZpY2F0aW9uV29yZHMgPSBpbmRpY2VzLm1hcChpID0+ICh7IGluZGV4OiBpLCB3b3JkOiB3b3Jkc1tpXSB9KSk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBVSSB3aXRoIHRoZSByYW5kb20gaW5kaWNlc1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTEtbnVtJykudGV4dENvbnRlbnQgPSAodmVyaWZpY2F0aW9uV29yZHNbMF0uaW5kZXggKyAxKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0yLW51bScpLnRleHRDb250ZW50ID0gKHZlcmlmaWNhdGlvbldvcmRzWzFdLmluZGV4ICsgMSk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMy1udW0nKS50ZXh0Q29udGVudCA9ICh2ZXJpZmljYXRpb25Xb3Jkc1syXS5pbmRleCArIDEpO1xyXG5cclxuICAgIC8vIENsZWFyIHRoZSB2ZXJpZmljYXRpb24gaW5wdXRzXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMicpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMycpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZpY2F0aW9uLWVycm9yJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdlbmVyYXRpbmcgbW5lbW9uaWM6JywgZXJyb3IpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21uZW1vbmljLWRpc3BsYXknKS50ZXh0Q29udGVudCA9ICdFcnJvciBnZW5lcmF0aW5nIG1uZW1vbmljLiBQbGVhc2UgdHJ5IGFnYWluLic7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDcmVhdGVXYWxsZXQoKSB7XHJcbiAgY29uc3QgcGFzc3dvcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtY3JlYXRlJykudmFsdWU7XHJcbiAgY29uc3QgcGFzc3dvcmRDb25maXJtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLWNvbmZpcm0nKS52YWx1ZTtcclxuICBjb25zdCBlcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjcmVhdGUtZXJyb3InKTtcclxuICBjb25zdCB2ZXJpZmljYXRpb25FcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZmljYXRpb24tZXJyb3InKTtcclxuXHJcbiAgLy8gVmFsaWRhdGVcclxuICBpZiAocGFzc3dvcmQgIT09IHBhc3N3b3JkQ29uZmlybSkge1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSAnUGFzc3dvcmRzIGRvIG5vdCBtYXRjaCc7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIEVuc3VyZSB3ZSBoYXZlIGEgbW5lbW9uaWNcclxuICBpZiAoIWdlbmVyYXRlZE1uZW1vbmljKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9ICdObyBtbmVtb25pYyBnZW5lcmF0ZWQuIFBsZWFzZSBnbyBiYWNrIGFuZCB0cnkgYWdhaW4uJztcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gVmVyaWZ5IHNlZWQgcGhyYXNlIHdvcmRzXHJcbiAgY29uc3Qgd29yZDEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMScpLnZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IHdvcmQyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTInKS52YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICBjb25zdCB3b3JkMyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zJykudmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIGlmICghd29yZDEgfHwgIXdvcmQyIHx8ICF3b3JkMykge1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYudGV4dENvbnRlbnQgPSAnUGxlYXNlIGVudGVyIGFsbCB2ZXJpZmljYXRpb24gd29yZHMgdG8gY29uZmlybSB5b3UgaGF2ZSBiYWNrZWQgdXAgeW91ciBzZWVkIHBocmFzZS4nO1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBpZiAod29yZDEgIT09IHZlcmlmaWNhdGlvbldvcmRzWzBdLndvcmQudG9Mb3dlckNhc2UoKSB8fFxyXG4gICAgICB3b3JkMiAhPT0gdmVyaWZpY2F0aW9uV29yZHNbMV0ud29yZC50b0xvd2VyQ2FzZSgpIHx8XHJcbiAgICAgIHdvcmQzICE9PSB2ZXJpZmljYXRpb25Xb3Jkc1syXS53b3JkLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgIHZlcmlmaWNhdGlvbkVycm9yRGl2LnRleHRDb250ZW50ID0gJ1ZlcmlmaWNhdGlvbiB3b3JkcyBkbyBub3QgbWF0Y2guIFBsZWFzZSBkb3VibGUtY2hlY2sgeW91ciBzZWVkIHBocmFzZSBiYWNrdXAuJztcclxuICAgIHZlcmlmaWNhdGlvbkVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgLy8gSW1wb3J0IHdhbGxldCBmcm9tIHRoZSBtbmVtb25pYyB3ZSBhbHJlYWR5IGdlbmVyYXRlZFxyXG4gICAgY29uc3QgeyBhZGRyZXNzIH0gPSBhd2FpdCBpbXBvcnRGcm9tTW5lbW9uaWMoZ2VuZXJhdGVkTW5lbW9uaWMsIHBhc3N3b3JkKTtcclxuXHJcbiAgICAvLyBTdWNjZXNzISBOYXZpZ2F0ZSB0byBkYXNoYm9hcmRcclxuICAgIGFsZXJ0KCdXYWxsZXQgY3JlYXRlZCBzdWNjZXNzZnVsbHkhJyk7XHJcbiAgICBjdXJyZW50U3RhdGUuYWRkcmVzcyA9IGFkZHJlc3M7XHJcbiAgICBjdXJyZW50U3RhdGUuaXNVbmxvY2tlZCA9IHRydWU7XHJcbiAgICBjdXJyZW50U3RhdGUubGFzdEFjdGl2aXR5VGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgLy8gU3RhcnQgYXV0by1sb2NrIHRpbWVyXHJcbiAgICBzdGFydEF1dG9Mb2NrVGltZXIoKTtcclxuXHJcbiAgICAvLyBDbGVhciB0aGUgZ2VuZXJhdGVkIG1uZW1vbmljIGZyb20gbWVtb3J5IGZvciBzZWN1cml0eVxyXG4gICAgZ2VuZXJhdGVkTW5lbW9uaWMgPSAnJztcclxuICAgIHZlcmlmaWNhdGlvbldvcmRzID0gW107XHJcblxyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpO1xyXG4gICAgdXBkYXRlRGFzaGJvYXJkKCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gV0FMTEVUIElNUE9SVCA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVJbXBvcnRXYWxsZXQoKSB7XHJcbiAgY29uc3QgbWV0aG9kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1tZXRob2QnKS52YWx1ZTtcclxuICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1pbXBvcnQnKS52YWx1ZTtcclxuICBjb25zdCBwYXNzd29yZENvbmZpcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtaW1wb3J0LWNvbmZpcm0nKS52YWx1ZTtcclxuICBjb25zdCBlcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbXBvcnQtZXJyb3InKTtcclxuXHJcbiAgLy8gVmFsaWRhdGVcclxuICBpZiAocGFzc3dvcmQgIT09IHBhc3N3b3JkQ29uZmlybSkge1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSAnUGFzc3dvcmRzIGRvIG5vdCBtYXRjaCc7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICBsZXQgYWRkcmVzcztcclxuICAgIGlmIChtZXRob2QgPT09ICdtbmVtb25pYycpIHtcclxuICAgICAgY29uc3QgbW5lbW9uaWMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1wb3J0LW1uZW1vbmljJykudmFsdWU7XHJcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGltcG9ydEZyb21NbmVtb25pYyhtbmVtb25pYywgcGFzc3dvcmQpO1xyXG4gICAgICBhZGRyZXNzID0gcmVzdWx0LmFkZHJlc3M7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBwcml2YXRlS2V5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1wcml2YXRla2V5JykudmFsdWU7XHJcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGltcG9ydEZyb21Qcml2YXRlS2V5KHByaXZhdGVLZXksIHBhc3N3b3JkKTtcclxuICAgICAgYWRkcmVzcyA9IHJlc3VsdC5hZGRyZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFN1Y2Nlc3MhXHJcbiAgICBhbGVydCgnV2FsbGV0IGltcG9ydGVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuICAgIGN1cnJlbnRTdGF0ZS5hZGRyZXNzID0gYWRkcmVzcztcclxuICAgIGN1cnJlbnRTdGF0ZS5pc1VubG9ja2VkID0gdHJ1ZTtcclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKTtcclxuICAgIHVwZGF0ZURhc2hib2FyZCgpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFVOTE9DSyA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVVbmxvY2soKSB7XHJcbiAgY29uc3QgcGFzc3dvcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtdW5sb2NrJykudmFsdWU7XHJcbiAgY29uc3QgZXJyb3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndW5sb2NrLWVycm9yJyk7XHJcblxyXG4gIC8vIENoZWNrIGlmIGxvY2tlZCBvdXQgZHVlIHRvIHRvbyBtYW55IGZhaWxlZCBhdHRlbXB0c1xyXG4gIGNvbnN0IGxvY2tvdXRJbmZvID0gYXdhaXQgY2hlY2tSYXRlTGltaXRMb2Nrb3V0KCk7XHJcbiAgaWYgKGxvY2tvdXRJbmZvLmlzTG9ja2VkT3V0KSB7XHJcbiAgICBjb25zdCByZW1haW5pbmdNaW51dGVzID0gTWF0aC5jZWlsKGxvY2tvdXRJbmZvLnJlbWFpbmluZ01zIC8gMTAwMCAvIDYwKTtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gYFRvbyBtYW55IGZhaWxlZCBhdHRlbXB0cy4gUGxlYXNlIHdhaXQgJHtyZW1haW5pbmdNaW51dGVzfSBtaW51dGUocykgYmVmb3JlIHRyeWluZyBhZ2Fpbi5gO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgY29uc3QgeyBhZGRyZXNzLCBzaWduZXIgfSA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCk7XHJcblxyXG4gICAgLy8gU3VjY2VzcyEgQ2xlYXIgZmFpbGVkIGF0dGVtcHRzXHJcbiAgICBhd2FpdCBjbGVhckZhaWxlZEF0dGVtcHRzKCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHNlc3Npb24gdG9rZW4gaW4gc2VydmljZSB3b3JrZXJcclxuICAgIGNvbnN0IGFjdGl2ZVdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgY29uc3QgZHVyYXRpb25NcyA9IGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5hdXRvTG9ja01pbnV0ZXMgKiA2MCAqIDEwMDA7XHJcbiAgICBjb25zdCBzZXNzaW9uUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdDUkVBVEVfU0VTU0lPTicsXHJcbiAgICAgIHBhc3N3b3JkLFxyXG4gICAgICB3YWxsZXRJZDogYWN0aXZlV2FsbGV0LmlkLFxyXG4gICAgICBkdXJhdGlvbk1zXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXNlc3Npb25SZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGNyZWF0ZSBzZXNzaW9uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY3VycmVudFN0YXRlLmlzVW5sb2NrZWQgPSB0cnVlO1xyXG4gICAgY3VycmVudFN0YXRlLmFkZHJlc3MgPSBhZGRyZXNzO1xyXG4gICAgY3VycmVudFN0YXRlLnNlc3Npb25Ub2tlbiA9IHNlc3Npb25SZXNwb25zZS5zZXNzaW9uVG9rZW47XHJcbiAgICBjdXJyZW50U3RhdGUubGFzdEFjdGl2aXR5VGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgLy8gU3RhcnQgYXV0by1sb2NrIHRpbWVyXHJcbiAgICBzdGFydEF1dG9Mb2NrVGltZXIoKTtcclxuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJyk7XHJcbiAgICB1cGRhdGVEYXNoYm9hcmQoKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgLy8gUmVjb3JkIGZhaWxlZCBhdHRlbXB0XHJcbiAgICBhd2FpdCByZWNvcmRGYWlsZWRBdHRlbXB0KCk7XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgbm93IGxvY2tlZCBvdXRcclxuICAgIGNvbnN0IG5ld0xvY2tvdXRJbmZvID0gYXdhaXQgY2hlY2tSYXRlTGltaXRMb2Nrb3V0KCk7XHJcbiAgICBpZiAobmV3TG9ja291dEluZm8uaXNMb2NrZWRPdXQpIHtcclxuICAgICAgY29uc3QgcmVtYWluaW5nTWludXRlcyA9IE1hdGguY2VpbChuZXdMb2Nrb3V0SW5mby5yZW1haW5pbmdNcyAvIDEwMDAgLyA2MCk7XHJcbiAgICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gYFRvbyBtYW55IGZhaWxlZCBhdHRlbXB0cyAoJHtNQVhfQVRURU1QVFN9KS4gV2FsbGV0IGxvY2tlZCBmb3IgJHtyZW1haW5pbmdNaW51dGVzfSBtaW51dGVzLmA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBhdHRlbXB0c0xlZnQgPSBNQVhfQVRURU1QVFMgLSBuZXdMb2Nrb3V0SW5mby5hdHRlbXB0cztcclxuICAgICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBgJHtlcnJvci5tZXNzYWdlfSAoJHthdHRlbXB0c0xlZnR9IGF0dGVtcHQke2F0dGVtcHRzTGVmdCAhPT0gMSA/ICdzJyA6ICcnfSByZW1haW5pbmcpYDtcclxuICAgIH1cclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gTE9DSyA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVMb2NrKCkge1xyXG4gIC8vIEludmFsaWRhdGUgc2Vzc2lvbiBpbiBzZXJ2aWNlIHdvcmtlclxyXG4gIGlmIChjdXJyZW50U3RhdGUuc2Vzc2lvblRva2VuKSB7XHJcbiAgICBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdJTlZBTElEQVRFX1NFU1NJT04nLFxyXG4gICAgICBzZXNzaW9uVG9rZW46IGN1cnJlbnRTdGF0ZS5zZXNzaW9uVG9rZW5cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgY3VycmVudFN0YXRlLmlzVW5sb2NrZWQgPSBmYWxzZTtcclxuICBjdXJyZW50U3RhdGUuYWRkcmVzcyA9IG51bGw7XHJcbiAgY3VycmVudFN0YXRlLnNlc3Npb25Ub2tlbiA9IG51bGw7XHJcbiAgY3VycmVudFN0YXRlLmxhc3RBY3Rpdml0eVRpbWUgPSBudWxsO1xyXG4gIHN0b3BBdXRvTG9ja1RpbWVyKCk7XHJcbiAgc2hvd1NjcmVlbignc2NyZWVuLXVubG9jaycpO1xyXG59XHJcblxyXG4vLyA9PT09PSBBVVRPLUxPQ0sgVElNRVIgPT09PT1cclxuZnVuY3Rpb24gc3RhcnRBdXRvTG9ja1RpbWVyKCkge1xyXG4gIHN0b3BBdXRvTG9ja1RpbWVyKCk7IC8vIENsZWFyIGFueSBleGlzdGluZyB0aW1lclxyXG5cclxuICBjb25zdCBjaGVja0ludGVydmFsID0gMTAwMDA7IC8vIENoZWNrIGV2ZXJ5IDEwIHNlY29uZHNcclxuXHJcbiAgYXV0b0xvY2tUaW1lciA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgIGlmICghY3VycmVudFN0YXRlLmlzVW5sb2NrZWQgfHwgIWN1cnJlbnRTdGF0ZS5sYXN0QWN0aXZpdHlUaW1lKSB7XHJcbiAgICAgIHN0b3BBdXRvTG9ja1RpbWVyKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpZGxlVGltZSA9IERhdGUubm93KCkgLSBjdXJyZW50U3RhdGUubGFzdEFjdGl2aXR5VGltZTtcclxuICAgIGNvbnN0IGF1dG9Mb2NrTXMgPSBjdXJyZW50U3RhdGUuc2V0dGluZ3MuYXV0b0xvY2tNaW51dGVzICogNjAgKiAxMDAwO1xyXG5cclxuICAgIGlmIChpZGxlVGltZSA+PSBhdXRvTG9ja01zKSB7XHJcbiAgICAgIC8vIEF1dG8tbG9ja2luZyB3YWxsZXRcclxuICAgICAgaGFuZGxlTG9jaygpO1xyXG4gICAgfVxyXG4gIH0sIGNoZWNrSW50ZXJ2YWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdG9wQXV0b0xvY2tUaW1lcigpIHtcclxuICBpZiAoYXV0b0xvY2tUaW1lcikge1xyXG4gICAgY2xlYXJJbnRlcnZhbChhdXRvTG9ja1RpbWVyKTtcclxuICAgIGF1dG9Mb2NrVGltZXIgPSBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcmVzZXRBY3Rpdml0eVRpbWVyKCkge1xyXG4gIGlmIChjdXJyZW50U3RhdGUuaXNVbmxvY2tlZCkge1xyXG4gICAgY3VycmVudFN0YXRlLmxhc3RBY3Rpdml0eVRpbWUgPSBEYXRlLm5vdygpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gUkFURSBMSU1JVElORyA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiByZWNvcmRGYWlsZWRBdHRlbXB0KCkge1xyXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBsb2FkKFJBVEVfTElNSVRfS0VZKSB8fCB7IGF0dGVtcHRzOiAwLCBmaXJzdEF0dGVtcHRUaW1lOiBEYXRlLm5vdygpIH07XHJcblxyXG4gIC8vIElmIGZpcnN0IGF0dGVtcHQgb3IgYXR0ZW1wdHMgaGF2ZSBleHBpcmVkLCByZXNldFxyXG4gIGNvbnN0IHRpbWVTaW5jZUZpcnN0ID0gRGF0ZS5ub3coKSAtIGRhdGEuZmlyc3RBdHRlbXB0VGltZTtcclxuICBpZiAoZGF0YS5hdHRlbXB0cyA9PT0gMCB8fCB0aW1lU2luY2VGaXJzdCA+IExPQ0tPVVRfRFVSQVRJT05fTVMpIHtcclxuICAgIGRhdGEuYXR0ZW1wdHMgPSAxO1xyXG4gICAgZGF0YS5maXJzdEF0dGVtcHRUaW1lID0gRGF0ZS5ub3coKTtcclxuICB9IGVsc2Uge1xyXG4gICAgZGF0YS5hdHRlbXB0cyArPSAxO1xyXG4gIH1cclxuXHJcbiAgYXdhaXQgc2F2ZShSQVRFX0xJTUlUX0tFWSwgZGF0YSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGNoZWNrUmF0ZUxpbWl0TG9ja291dCgpIHtcclxuICBjb25zdCBkYXRhID0gYXdhaXQgbG9hZChSQVRFX0xJTUlUX0tFWSk7XHJcblxyXG4gIGlmICghZGF0YSB8fCBkYXRhLmF0dGVtcHRzID09PSAwKSB7XHJcbiAgICByZXR1cm4geyBpc0xvY2tlZE91dDogZmFsc2UsIGF0dGVtcHRzOiAwLCByZW1haW5pbmdNczogMCB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgdGltZVNpbmNlRmlyc3QgPSBEYXRlLm5vdygpIC0gZGF0YS5maXJzdEF0dGVtcHRUaW1lO1xyXG5cclxuICAvLyBJZiBsb2Nrb3V0IHBlcmlvZCBoYXMgZXhwaXJlZCwgY2xlYXIgYXR0ZW1wdHNcclxuICBpZiAodGltZVNpbmNlRmlyc3QgPiBMT0NLT1VUX0RVUkFUSU9OX01TKSB7XHJcbiAgICBhd2FpdCBjbGVhckZhaWxlZEF0dGVtcHRzKCk7XHJcbiAgICByZXR1cm4geyBpc0xvY2tlZE91dDogZmFsc2UsIGF0dGVtcHRzOiAwLCByZW1haW5pbmdNczogMCB9O1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgaWYgbG9ja2VkIG91dFxyXG4gIGlmIChkYXRhLmF0dGVtcHRzID49IE1BWF9BVFRFTVBUUykge1xyXG4gICAgY29uc3QgcmVtYWluaW5nTXMgPSBMT0NLT1VUX0RVUkFUSU9OX01TIC0gdGltZVNpbmNlRmlyc3Q7XHJcbiAgICByZXR1cm4geyBpc0xvY2tlZE91dDogdHJ1ZSwgYXR0ZW1wdHM6IGRhdGEuYXR0ZW1wdHMsIHJlbWFpbmluZ01zIH07XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyBpc0xvY2tlZE91dDogZmFsc2UsIGF0dGVtcHRzOiBkYXRhLmF0dGVtcHRzLCByZW1haW5pbmdNczogMCB9O1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBjbGVhckZhaWxlZEF0dGVtcHRzKCkge1xyXG4gIGF3YWl0IHNhdmUoUkFURV9MSU1JVF9LRVksIHsgYXR0ZW1wdHM6IDAsIGZpcnN0QXR0ZW1wdFRpbWU6IDAgfSk7XHJcbn1cclxuXHJcbi8vID09PT09IERBU0hCT0FSRCA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVEYXNoYm9hcmQoKSB7XHJcbiAgLy8gVXBkYXRlIGFkZHJlc3MgZGlzcGxheVxyXG4gIGNvbnN0IGFkZHJlc3NFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3YWxsZXQtYWRkcmVzcycpO1xyXG4gIGlmIChhZGRyZXNzRWwgJiYgY3VycmVudFN0YXRlLmFkZHJlc3MpIHtcclxuICAgIGFkZHJlc3NFbC50ZXh0Q29udGVudCA9IHNob3J0ZW5BZGRyZXNzKGN1cnJlbnRTdGF0ZS5hZGRyZXNzKTtcclxuICB9XHJcblxyXG4gIC8vIEZldGNoIGFuZCB1cGRhdGUgYmFsYW5jZVxyXG4gIGF3YWl0IGZldGNoQmFsYW5jZSgpO1xyXG5cclxuICAvLyBGZXRjaCBhbmQgdXBkYXRlIHRva2VuIHByaWNlcyAoYXN5bmMsIGRvbid0IGJsb2NrIGRhc2hib2FyZCBsb2FkKVxyXG4gIGZldGNoQW5kVXBkYXRlUHJpY2VzKCk7XHJcblxyXG4gIC8vIFVwZGF0ZSBuZXR3b3JrIHNlbGVjdG9yXHJcbiAgdXBkYXRlTmV0d29ya1NlbGVjdG9yKCk7XHJcbiAgdXBkYXRlTmV0d29ya0Rpc3BsYXlzKCk7XHJcblxyXG4gIC8vIFVwZGF0ZSB3YWxsZXQgc2VsZWN0b3JcclxuICBhd2FpdCB1cGRhdGVXYWxsZXRTZWxlY3RvcigpO1xyXG5cclxuICAvLyBVcGRhdGUgcGVuZGluZyB0cmFuc2FjdGlvbiBpbmRpY2F0b3JcclxuICBhd2FpdCB1cGRhdGVQZW5kaW5nVHhJbmRpY2F0b3IoKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlUmVjZW50VHJhbnNhY3Rpb25zKCkge1xyXG4gIGNvbnN0IHR4TGlzdEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWxpc3QnKTtcclxuICBpZiAoIXR4TGlzdEVsIHx8ICFjdXJyZW50U3RhdGUuYWRkcmVzcykgcmV0dXJuO1xyXG5cclxuICAvLyBTaG93IGxvYWRpbmcgc3RhdGVcclxuICB0eExpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPkxvYWRpbmcgdHJhbnNhY3Rpb25zLi4uPC9wPic7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB0cmFuc2FjdGlvbnMgPSBhd2FpdCBycGMuZ2V0UmVjZW50VHJhbnNhY3Rpb25zKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCBjdXJyZW50U3RhdGUuYWRkcmVzcywgMywgMTAwMCk7XHJcblxyXG4gICAgaWYgKHRyYW5zYWN0aW9ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgdHhMaXN0RWwuaW5uZXJIVE1MID0gJzxwIGNsYXNzPVwidGV4dC1jZW50ZXIgdGV4dC1kaW1cIj5ObyByZWNlbnQgdHJhbnNhY3Rpb25zPC9wPic7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgaHRtbCA9ICcnO1xyXG5cclxuICAgIGZvciAoY29uc3QgdHggb2YgdHJhbnNhY3Rpb25zKSB7XHJcbiAgICAgIGNvbnN0IHZhbHVlRXRoID0gZXRoZXJzLmZvcm1hdEV0aGVyKHR4LnZhbHVlKTtcclxuICAgICAgY29uc3QgZm9ybWF0dGVkID0gZm9ybWF0QmFsYW5jZVdpdGhDb21tYXModmFsdWVFdGgsIDE4KTtcclxuICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHR4LnRpbWVzdGFtcCAqIDEwMDApLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG4gICAgICBjb25zdCB0eXBlID0gdHgudHlwZSA9PT0gJ3NlbnQnID8gJ+KGkicgOiAn4oaQJztcclxuICAgICAgY29uc3QgdHlwZUNvbG9yID0gdHgudHlwZSA9PT0gJ3NlbnQnID8gJyNmZjQ0NDQnIDogJyM0NGZmNDQnO1xyXG4gICAgICBjb25zdCBleHBsb3JlclVybCA9IGdldEV4cGxvcmVyVXJsKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCAndHgnLCB0eC5oYXNoKTtcclxuXHJcbiAgICAgIGh0bWwgKz0gYFxyXG4gICAgICAgIDxkaXYgc3R5bGU9XCJwYWRkaW5nOiA4cHg7IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS10ZXJtaW5hbC1ib3JkZXIpOyBmb250LXNpemU6IDExcHg7XCI+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBtYXJnaW4tYm90dG9tOiA0cHg7XCI+XHJcbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiY29sb3I6ICR7dHlwZUNvbG9yfTtcIj4ke3R5cGV9ICR7dHgudHlwZSA9PT0gJ3NlbnQnID8gJ1NlbnQnIDogJ1JlY2VpdmVkJ308L3NwYW4+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC1kaW1cIj4ke2RhdGV9PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBhbGlnbi1pdGVtczogY2VudGVyO1wiPlxyXG4gICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtd2VpZ2h0OiBib2xkO1wiIHRpdGxlPVwiJHtmb3JtYXR0ZWQudG9vbHRpcH1cIj4ke2Zvcm1hdHRlZC5kaXNwbGF5fTwvc3Bhbj5cclxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7ZXhwbG9yZXJVcmx9XCIgdGFyZ2V0PVwiX2JsYW5rXCIgc3R5bGU9XCJjb2xvcjogdmFyKC0tdGVybWluYWwtZ3JlZW4pOyB0ZXh0LWRlY29yYXRpb246IG5vbmU7IGZvbnQtc2l6ZTogMTBweDtcIj5WSUVXIOKGkjwvYT5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICBgO1xyXG4gICAgfVxyXG5cclxuICAgIHR4TGlzdEVsLmlubmVySFRNTCA9IGh0bWw7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHRyYW5zYWN0aW9uczonLCBlcnJvcik7XHJcbiAgICB0eExpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPkVycm9yIGxvYWRpbmcgdHJhbnNhY3Rpb25zPC9wPic7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBVcGRhdGUgd2FsbGV0IHNlbGVjdG9yIGRyb3Bkb3duXHJcbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVdhbGxldFNlbGVjdG9yKCkge1xyXG4gIGNvbnN0IHdhbGxldFNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3YWxsZXQtc2VsZWN0Jyk7XHJcbiAgaWYgKCF3YWxsZXRTZWxlY3QpIHJldHVybjtcclxuXHJcbiAgY29uc3Qgd2FsbGV0c0RhdGEgPSBhd2FpdCBnZXRBbGxXYWxsZXRzKCk7XHJcblxyXG4gIGlmICh3YWxsZXRzRGF0YS53YWxsZXRMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgd2FsbGV0U2VsZWN0LmlubmVySFRNTCA9ICc8b3B0aW9uIHZhbHVlPVwiXCI+Tm8gd2FsbGV0czwvb3B0aW9uPic7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB3YWxsZXRTZWxlY3QuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gIHdhbGxldHNEYXRhLndhbGxldExpc3QuZm9yRWFjaCh3YWxsZXQgPT4ge1xyXG4gICAgY29uc3Qgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XHJcbiAgICBvcHRpb24udmFsdWUgPSB3YWxsZXQuaWQ7XHJcbiAgICBvcHRpb24udGV4dENvbnRlbnQgPSB3YWxsZXQubmlja25hbWUgfHwgJ1VubmFtZWQgV2FsbGV0JztcclxuXHJcbiAgICBpZiAod2FsbGV0LmlkID09PSB3YWxsZXRzRGF0YS5hY3RpdmVXYWxsZXRJZCkge1xyXG4gICAgICBvcHRpb24uc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHdhbGxldFNlbGVjdC5hcHBlbmRDaGlsZChvcHRpb24pO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBVcGRhdGUgbmV0d29yayBkaXNwbGF5cyBhY3Jvc3MgYWxsIHNjcmVlbnNcclxuZnVuY3Rpb24gdXBkYXRlTmV0d29ya0Rpc3BsYXlzKCkge1xyXG4gIGNvbnN0IG5ldHdvcmtOYW1lID0gTkVUV09SS19OQU1FU1tjdXJyZW50U3RhdGUubmV0d29ya10gfHwgJ1Vua25vd24gTmV0d29yayc7XHJcblxyXG4gIC8vIFNldHVwIHNjcmVlbiBzZWxlY3RvclxyXG4gIGNvbnN0IHNldHVwU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmstc2VsZWN0LXNldHVwJyk7XHJcbiAgaWYgKHNldHVwU2VsZWN0KSB7XHJcbiAgICBzZXR1cFNlbGVjdC52YWx1ZSA9IGN1cnJlbnRTdGF0ZS5uZXR3b3JrO1xyXG4gIH1cclxuXHJcbiAgLy8gQ3JlYXRlIHNjcmVlbiBkaXNwbGF5XHJcbiAgY29uc3QgY3JlYXRlRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrLWRpc3BsYXktY3JlYXRlJyk7XHJcbiAgaWYgKGNyZWF0ZURpc3BsYXkpIHtcclxuICAgIGNyZWF0ZURpc3BsYXkudGV4dENvbnRlbnQgPSBuZXR3b3JrTmFtZTtcclxuICB9XHJcblxyXG4gIC8vIEltcG9ydCBzY3JlZW4gZGlzcGxheVxyXG4gIGNvbnN0IGltcG9ydERpc3BsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1kaXNwbGF5LWltcG9ydCcpO1xyXG4gIGlmIChpbXBvcnREaXNwbGF5KSB7XHJcbiAgICBpbXBvcnREaXNwbGF5LnRleHRDb250ZW50ID0gbmV0d29ya05hbWU7XHJcbiAgfVxyXG5cclxuICAvLyBEYXNoYm9hcmQgY3VzdG9tIGRyb3Bkb3duXHJcbiAgY29uc3QgbmV0d29ya1NlbGVjdGVkVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrLXNlbGVjdGVkLXRleHQnKTtcclxuICBpZiAobmV0d29ya1NlbGVjdGVkVGV4dCkge1xyXG4gICAgbmV0d29ya1NlbGVjdGVkVGV4dC50ZXh0Q29udGVudCA9IG5ldHdvcmtOYW1lO1xyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRlIG5ldHdvcmsgc2VsZWN0b3IgbG9nb1xyXG4gIGNvbnN0IHNlbGVjdG9yTG9nb0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmstc2VsZWN0b3ItbG9nbycpO1xyXG4gIGlmIChzZWxlY3RvckxvZ29FbCkge1xyXG4gICAgY29uc3QgbmV0d29ya0xvZ29zID0ge1xyXG4gICAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAncGxzLnBuZycsXHJcbiAgICAgICdwdWxzZWNoYWluJzogJ3Bscy5wbmcnLFxyXG4gICAgICAnZXRoZXJldW0nOiAnZXRoLnBuZycsXHJcbiAgICAgICdzZXBvbGlhJzogJ2V0aC5wbmcnXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGxvZ29GaWxlID0gbmV0d29ya0xvZ29zW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXTtcclxuICAgIGlmIChsb2dvRmlsZSkge1xyXG4gICAgICBzZWxlY3RvckxvZ29FbC5zcmMgPSBjaHJvbWUucnVudGltZS5nZXRVUkwoYGFzc2V0cy9sb2dvcy8ke2xvZ29GaWxlfWApO1xyXG4gICAgICBzZWxlY3RvckxvZ29FbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNlbGVjdG9yTG9nb0VsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBmZXRjaEJhbGFuY2UoKSB7XHJcbiAgaWYgKCFjdXJyZW50U3RhdGUuYWRkcmVzcykge1xyXG4gICAgY3VycmVudFN0YXRlLmJhbGFuY2UgPSAnMCc7XHJcbiAgICB1cGRhdGVCYWxhbmNlRGlzcGxheSgpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBhd2FpdCBycGMuZ2V0QmFsYW5jZShjdXJyZW50U3RhdGUubmV0d29yaywgY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgY3VycmVudFN0YXRlLmJhbGFuY2UgPSBycGMuZm9ybWF0QmFsYW5jZShiYWxhbmNlV2VpLCBjdXJyZW50U3RhdGUuc2V0dGluZ3MuZGVjaW1hbFBsYWNlcyk7XHJcbiAgICB1cGRhdGVCYWxhbmNlRGlzcGxheSgpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBiYWxhbmNlOicsIGVycm9yKTtcclxuICAgIC8vIEtlZXAgcHJldmlvdXMgYmFsYW5jZSBvbiBlcnJvclxyXG4gICAgdXBkYXRlQmFsYW5jZURpc3BsYXkoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXRzIGEgYmFsYW5jZSBzdHJpbmcgd2l0aCBjb21tYXMgYW5kIHJldHVybnMgZGlzcGxheSArIHRvb2x0aXAgdmFsdWVzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYWxhbmNlU3RyaW5nIC0gQmFsYW5jZSBhcyBzdHJpbmcgKGUuZy4sIFwiMTIzNC41Njc4XCIpXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBmdWxsRGVjaW1hbHMgLSBGdWxsIHByZWNpc2lvbiBkZWNpbWFscyAoZGVmYXVsdCAxOClcclxuICogQHJldHVybnMge3tkaXNwbGF5OiBzdHJpbmcsIHRvb2x0aXA6IHN0cmluZ319XHJcbiAqL1xyXG5mdW5jdGlvbiBmb3JtYXRCYWxhbmNlV2l0aENvbW1hcyhiYWxhbmNlU3RyaW5nLCBmdWxsRGVjaW1hbHMgPSAxOCkge1xyXG4gIGNvbnN0IGJhbGFuY2UgPSBwYXJzZUZsb2F0KGJhbGFuY2VTdHJpbmcpO1xyXG4gIGlmIChpc05hTihiYWxhbmNlKSkge1xyXG4gICAgcmV0dXJuIHsgZGlzcGxheTogYmFsYW5jZVN0cmluZywgdG9vbHRpcDogYmFsYW5jZVN0cmluZyB9O1xyXG4gIH1cclxuXHJcbiAgLy8gRGlzcGxheSB2YWx1ZSAoa2VlcCBjdXJyZW50IGRlY2ltYWxzLCBhZGQgY29tbWFzKVxyXG4gIGNvbnN0IHBhcnRzID0gYmFsYW5jZVN0cmluZy5zcGxpdCgnLicpO1xyXG4gIHBhcnRzWzBdID0gcGFydHNbMF0ucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgJywnKTtcclxuICBjb25zdCBkaXNwbGF5VmFsdWUgPSBwYXJ0cy5qb2luKCcuJyk7XHJcblxyXG4gIC8vIEZ1bGwgcHJlY2lzaW9uIHZhbHVlIHdpdGggY29tbWFzXHJcbiAgY29uc3QgZnVsbFByZWNpc2lvbiA9IGJhbGFuY2UudG9GaXhlZChmdWxsRGVjaW1hbHMpO1xyXG4gIGNvbnN0IGZ1bGxQYXJ0cyA9IGZ1bGxQcmVjaXNpb24uc3BsaXQoJy4nKTtcclxuICBmdWxsUGFydHNbMF0gPSBmdWxsUGFydHNbMF0ucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgJywnKTtcclxuICBjb25zdCBmdWxsVmFsdWUgPSBmdWxsUGFydHMuam9pbignLicpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgZGlzcGxheTogZGlzcGxheVZhbHVlLFxyXG4gICAgdG9vbHRpcDogYEZ1bGwgcHJlY2lzaW9uOiAke2Z1bGxWYWx1ZX1gXHJcbiAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlQmFsYW5jZURpc3BsYXkoKSB7XHJcbiAgY29uc3QgYmFsYW5jZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhbGFuY2UtYW1vdW50Jyk7XHJcbiAgaWYgKGJhbGFuY2VFbCkge1xyXG4gICAgY29uc3QgZGVjaW1hbHMgPSBjdXJyZW50U3RhdGUuc2V0dGluZ3MuZGVjaW1hbFBsYWNlcztcclxuICAgIGNvbnN0IGJhbGFuY2UgPSBwYXJzZUZsb2F0KGN1cnJlbnRTdGF0ZS5iYWxhbmNlKTtcclxuXHJcbiAgICAvLyBGb3JtYXQgd2l0aCBjb21tYXMgZm9yIHJlYWRhYmlsaXR5XHJcbiAgICBjb25zdCBmb3JtYXR0ZWQgPSBiYWxhbmNlLnRvRml4ZWQoZGVjaW1hbHMpO1xyXG4gICAgY29uc3QgcGFydHMgPSBmb3JtYXR0ZWQuc3BsaXQoJy4nKTtcclxuICAgIHBhcnRzWzBdID0gcGFydHNbMF0ucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgJywnKTtcclxuICAgIGNvbnN0IGRpc3BsYXlWYWx1ZSA9IHBhcnRzLmpvaW4oJy4nKTtcclxuXHJcbiAgICBiYWxhbmNlRWwudGV4dENvbnRlbnQgPSBkaXNwbGF5VmFsdWU7XHJcblxyXG4gICAgLy8gU2V0IHRvb2x0aXAgd2l0aCBmdWxsIHByZWNpc2lvbiAoMTggZGVjaW1hbHMpIGFuZCBjb21tYXNcclxuICAgIGNvbnN0IGZ1bGxQcmVjaXNpb24gPSBiYWxhbmNlLnRvRml4ZWQoMTgpO1xyXG4gICAgY29uc3QgZnVsbFBhcnRzID0gZnVsbFByZWNpc2lvbi5zcGxpdCgnLicpO1xyXG4gICAgZnVsbFBhcnRzWzBdID0gZnVsbFBhcnRzWzBdLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csICcsJyk7XHJcbiAgICBjb25zdCBmdWxsVmFsdWUgPSBmdWxsUGFydHMuam9pbignLicpO1xyXG4gICAgYmFsYW5jZUVsLnRpdGxlID0gYEZ1bGwgcHJlY2lzaW9uOiAke2Z1bGxWYWx1ZX1gO1xyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRlIGJhbGFuY2Ugc3ltYm9sIGJhc2VkIG9uIG5ldHdvcmtcclxuICBjb25zdCBzeW1ib2xFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWxhbmNlLXN5bWJvbCcpO1xyXG4gIGlmIChzeW1ib2xFbCkge1xyXG4gICAgY29uc3Qgc3ltYm9scyA9IHtcclxuICAgICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3RQTFMnLFxyXG4gICAgICAncHVsc2VjaGFpbic6ICdQTFMnLFxyXG4gICAgICAnZXRoZXJldW0nOiAnRVRIJyxcclxuICAgICAgJ3NlcG9saWEnOiAnU0VQJ1xyXG4gICAgfTtcclxuICAgIHN5bWJvbEVsLnRleHRDb250ZW50ID0gc3ltYm9sc1tjdXJyZW50U3RhdGUubmV0d29ya10gfHwgJ1RPS0VOJztcclxuICB9XHJcblxyXG4gIC8vIFVwZGF0ZSBVU0QgdmFsdWUgaWYgcHJpY2VzIGFyZSBhdmFpbGFibGVcclxuICBjb25zdCB1c2RFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWxhbmNlLXVzZCcpO1xyXG4gIGlmICh1c2RFbCAmJiBjdXJyZW50U3RhdGUudG9rZW5QcmljZXMpIHtcclxuICAgIGNvbnN0IHRva2VuU3ltYm9sID0gY3VycmVudFN0YXRlLm5ldHdvcmsgPT09ICdwdWxzZWNoYWluVGVzdG5ldCcgPyAnUExTJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0YXRlLm5ldHdvcmsgPT09ICdwdWxzZWNoYWluJyA/ICdQTFMnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUubmV0d29yayA9PT0gJ2V0aGVyZXVtJyA/ICdFVEgnIDogJ1BMUyc7XHJcblxyXG4gICAgLy8gQ29udmVydCBiYWxhbmNlIHRvIHdlaSAoc3RyaW5nIHdpdGggMTggZGVjaW1hbHMpXHJcbiAgICBjb25zdCBiYWxhbmNlV2VpID0gZXRoZXJzLnBhcnNlRXRoZXIoY3VycmVudFN0YXRlLmJhbGFuY2UudG9TdHJpbmcoKSkudG9TdHJpbmcoKTtcclxuICAgIGNvbnN0IHVzZFZhbHVlID0gZ2V0VG9rZW5WYWx1ZVVTRCh0b2tlblN5bWJvbCwgYmFsYW5jZVdlaSwgMTgsIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcyk7XHJcblxyXG4gICAgaWYgKHVzZFZhbHVlICE9PSBudWxsKSB7XHJcbiAgICAgIHVzZEVsLnRleHRDb250ZW50ID0gZm9ybWF0VVNEKHVzZFZhbHVlKTtcclxuICAgICAgdXNkRWwuc3R5bGUuY29sb3IgPSAndmFyKC0tdGVybWluYWwtZmctZGltKSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB1c2RFbC50ZXh0Q29udGVudCA9ICfigJQnO1xyXG4gICAgICB1c2RFbC5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1mZy1kaW0pJztcclxuICAgIH1cclxuICB9IGVsc2UgaWYgKHVzZEVsKSB7XHJcbiAgICB1c2RFbC50ZXh0Q29udGVudCA9ICfigJQnO1xyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRlIG5ldHdvcmsgbG9nb1xyXG4gIGNvbnN0IGxvZ29FbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrLWxvZ28nKTtcclxuICBpZiAobG9nb0VsKSB7XHJcbiAgICBjb25zdCBuZXR3b3JrTG9nb3MgPSB7XHJcbiAgICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICdwbHMucG5nJyxcclxuICAgICAgJ3B1bHNlY2hhaW4nOiAncGxzLnBuZycsXHJcbiAgICAgICdldGhlcmV1bSc6ICdldGgucG5nJyxcclxuICAgICAgJ3NlcG9saWEnOiAnZXRoLnBuZydcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgbG9nb0ZpbGUgPSBuZXR3b3JrTG9nb3NbY3VycmVudFN0YXRlLm5ldHdvcmtdO1xyXG4gICAgaWYgKGxvZ29GaWxlKSB7XHJcbiAgICAgIGxvZ29FbC5zcmMgPSBjaHJvbWUucnVudGltZS5nZXRVUkwoYGFzc2V0cy9sb2dvcy8ke2xvZ29GaWxlfWApO1xyXG4gICAgICBsb2dvRWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsb2dvRWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGZXRjaCB0b2tlbiBwcmljZXMgZnJvbSBQdWxzZVggYW5kIHVwZGF0ZSBkaXNwbGF5XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBmZXRjaEFuZFVwZGF0ZVByaWNlcygpIHtcclxuICAvLyBPbmx5IGZldGNoIHByaWNlcyBmb3IgUHVsc2VDaGFpbiBuZXR3b3Jrc1xyXG4gIGlmIChjdXJyZW50U3RhdGUubmV0d29yayAhPT0gJ3B1bHNlY2hhaW4nICYmIGN1cnJlbnRTdGF0ZS5uZXR3b3JrICE9PSAncHVsc2VjaGFpblRlc3RuZXQnKSB7XHJcbiAgICBjb25zb2xlLmxvZygn8J+rgCBQcmljZSBmZXRjaGluZyBub3Qgc3VwcG9ydGVkIGZvcicsIGN1cnJlbnRTdGF0ZS5uZXR3b3JrKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIFNob3cgbG9hZGluZyBpbmRpY2F0b3JcclxuICBjb25zdCBsb2FkaW5nRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJpY2UtbG9hZGluZycpO1xyXG4gIGNvbnN0IHVzZEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhbGFuY2UtdXNkJyk7XHJcbiAgaWYgKGxvYWRpbmdFbCAmJiB1c2RFbCkge1xyXG4gICAgdXNkRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBsb2FkaW5nRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIoY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG4gICAgY29uc3QgcHJpY2VzID0gYXdhaXQgZmV0Y2hUb2tlblByaWNlcyhwcm92aWRlciwgY3VycmVudFN0YXRlLm5ldHdvcmsgPT09ICdwdWxzZWNoYWluVGVzdG5ldCcgPyAncHVsc2VjaGFpbicgOiBjdXJyZW50U3RhdGUubmV0d29yayk7XHJcblxyXG4gICAgaWYgKHByaWNlcykge1xyXG4gICAgICBjdXJyZW50U3RhdGUudG9rZW5QcmljZXMgPSBwcmljZXM7XHJcbiAgICAgIHVwZGF0ZUJhbGFuY2VEaXNwbGF5KCk7IC8vIFJlZnJlc2ggZGlzcGxheSB3aXRoIFVTRCB2YWx1ZXNcclxuICAgICAgLy8gUHJpY2VzIHVwZGF0ZWRcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdG9rZW4gcHJpY2VzOicsIGVycm9yKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgLy8gSGlkZSBsb2FkaW5nIGluZGljYXRvclxyXG4gICAgaWYgKGxvYWRpbmdFbCAmJiB1c2RFbCkge1xyXG4gICAgICBsb2FkaW5nRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgIHVzZEVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlTmV0d29ya1NlbGVjdG9yKCkge1xyXG4gIC8vIElmIHRlc3QgbmV0d29ya3MgYXJlIGhpZGRlbiwgaGlkZSB0ZXN0bmV0IG9wdGlvbnMgaW4gY3VzdG9tIGRyb3Bkb3duXHJcbiAgY29uc3Qgb3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5uZXR3b3JrLW9wdGlvbicpO1xyXG4gIG9wdGlvbnMuZm9yRWFjaChvcHRpb24gPT4ge1xyXG4gICAgY29uc3QgbmV0d29yayA9IG9wdGlvbi5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmV0d29yaycpO1xyXG4gICAgY29uc3QgaXNUZXN0bmV0ID0gbmV0d29yay5pbmNsdWRlcygnVGVzdG5ldCcpIHx8IG5ldHdvcmsgPT09ICdzZXBvbGlhJztcclxuICAgIGlmIChpc1Rlc3RuZXQgJiYgIWN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5zaG93VGVzdE5ldHdvcmtzKSB7XHJcbiAgICAgIG9wdGlvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb3B0aW9uLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vID09PT09IFNFTkQgPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gc2hvd1NlbmRTY3JlZW4oKSB7XHJcbiAgLy8gUG9wdWxhdGUgc2VuZCBzY3JlZW4gd2l0aCBjdXJyZW50IHdhbGxldCBpbmZvXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtZnJvbS1hZGRyZXNzJykudGV4dENvbnRlbnQgPSBjdXJyZW50U3RhdGUuYWRkcmVzcyB8fCAnMHgwMDAwLi4uMDAwMCc7XHJcblxyXG4gIC8vIFBvcHVsYXRlIGFzc2V0IHNlbGVjdG9yIHdpdGggbmF0aXZlICsgdG9rZW5zXHJcbiAgY29uc3QgYXNzZXRTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hc3NldC1zZWxlY3QnKTtcclxuICBjb25zdCBzeW1ib2xzID0ge1xyXG4gICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3RQTFMnLFxyXG4gICAgJ3B1bHNlY2hhaW4nOiAnUExTJyxcclxuICAgICdldGhlcmV1bSc6ICdFVEgnLFxyXG4gICAgJ3NlcG9saWEnOiAnU0VQJ1xyXG4gIH07XHJcblxyXG4gIGxldCBvcHRpb25zID0gYDxvcHRpb24gdmFsdWU9XCJuYXRpdmVcIj5OYXRpdmUgKCR7c3ltYm9sc1tjdXJyZW50U3RhdGUubmV0d29ya10gfHwgJ1RPS0VOJ30pPC9vcHRpb24+YDtcclxuXHJcbiAgY29uc3QgYWxsVG9rZW5zID0gYXdhaXQgdG9rZW5zLmdldEFsbFRva2VucyhjdXJyZW50U3RhdGUubmV0d29yayk7XHJcbiAgZm9yIChjb25zdCB0b2tlbiBvZiBhbGxUb2tlbnMpIHtcclxuICAgIG9wdGlvbnMgKz0gYDxvcHRpb24gdmFsdWU9XCIke2VzY2FwZUh0bWwodG9rZW4uYWRkcmVzcyl9XCI+JHtlc2NhcGVIdG1sKHRva2VuLnN5bWJvbCl9PC9vcHRpb24+YDtcclxuICB9XHJcblxyXG4gIGFzc2V0U2VsZWN0LmlubmVySFRNTCA9IG9wdGlvbnM7XHJcblxyXG4gIC8vIFNldCBpbml0aWFsIGJhbGFuY2Ugd2l0aCBmb3JtYXR0aW5nXHJcbiAgY29uc3QgYmFsYW5jZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYXZhaWxhYmxlLWJhbGFuY2UnKTtcclxuICBjb25zdCBmb3JtYXR0ZWQgPSBmb3JtYXRCYWxhbmNlV2l0aENvbW1hcyhjdXJyZW50U3RhdGUuYmFsYW5jZSwgMTgpO1xyXG4gIGJhbGFuY2VFbC50ZXh0Q29udGVudCA9IGZvcm1hdHRlZC5kaXNwbGF5O1xyXG4gIGJhbGFuY2VFbC50aXRsZSA9IGZvcm1hdHRlZC50b29sdGlwO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWJhbGFuY2Utc3ltYm9sJykudGV4dENvbnRlbnQgPSBzeW1ib2xzW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXSB8fCAnVE9LRU4nO1xyXG5cclxuICAvLyBDbGVhciBmb3JtXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtdG8tYWRkcmVzcycpLnZhbHVlID0gJyc7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYW1vdW50JykudmFsdWUgPSAnJztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1wYXNzd29yZCcpLnZhbHVlID0gJyc7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtZXJyb3InKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgc2hvd1NjcmVlbignc2NyZWVuLXNlbmQnKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQXNzZXRDaGFuZ2UoKSB7XHJcbiAgY29uc3QgYXNzZXRTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hc3NldC1zZWxlY3QnKTtcclxuICBjb25zdCBzZWxlY3RlZFZhbHVlID0gYXNzZXRTZWxlY3QudmFsdWU7XHJcblxyXG4gIGNvbnN0IHN5bWJvbHMgPSB7XHJcbiAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAndFBMUycsXHJcbiAgICAncHVsc2VjaGFpbic6ICdQTFMnLFxyXG4gICAgJ2V0aGVyZXVtJzogJ0VUSCcsXHJcbiAgICAnc2Vwb2xpYSc6ICdTRVAnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgYmFsYW5jZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYXZhaWxhYmxlLWJhbGFuY2UnKTtcclxuXHJcbiAgaWYgKHNlbGVjdGVkVmFsdWUgPT09ICduYXRpdmUnKSB7XHJcbiAgICBjb25zdCBmb3JtYXR0ZWQgPSBmb3JtYXRCYWxhbmNlV2l0aENvbW1hcyhjdXJyZW50U3RhdGUuYmFsYW5jZSwgMTgpO1xyXG4gICAgYmFsYW5jZUVsLnRleHRDb250ZW50ID0gZm9ybWF0dGVkLmRpc3BsYXk7XHJcbiAgICBiYWxhbmNlRWwudGl0bGUgPSBmb3JtYXR0ZWQudG9vbHRpcDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWJhbGFuY2Utc3ltYm9sJykudGV4dENvbnRlbnQgPSBzeW1ib2xzW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXSB8fCAnVE9LRU4nO1xyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBHZXQgdG9rZW4gYmFsYW5jZVxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgYWxsVG9rZW5zID0gYXdhaXQgdG9rZW5zLmdldEFsbFRva2VucyhjdXJyZW50U3RhdGUubmV0d29yayk7XHJcbiAgICAgIGNvbnN0IHRva2VuID0gYWxsVG9rZW5zLmZpbmQodCA9PiB0LmFkZHJlc3MgPT09IHNlbGVjdGVkVmFsdWUpO1xyXG5cclxuICAgICAgaWYgKHRva2VuKSB7XHJcbiAgICAgICAgY29uc3QgYmFsYW5jZVdlaSA9IGF3YWl0IGVyYzIwLmdldFRva2VuQmFsYW5jZShjdXJyZW50U3RhdGUubmV0d29yaywgdG9rZW4uYWRkcmVzcywgY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgICAgIGNvbnN0IHJhd0JhbGFuY2UgPSBlcmMyMC5mb3JtYXRUb2tlbkJhbGFuY2UoYmFsYW5jZVdlaSwgdG9rZW4uZGVjaW1hbHMsIDQpO1xyXG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdEJhbGFuY2VXaXRoQ29tbWFzKHJhd0JhbGFuY2UsIHRva2VuLmRlY2ltYWxzKTtcclxuICAgICAgICBiYWxhbmNlRWwudGV4dENvbnRlbnQgPSBmb3JtYXR0ZWQuZGlzcGxheTtcclxuICAgICAgICBiYWxhbmNlRWwudGl0bGUgPSBmb3JtYXR0ZWQudG9vbHRpcDtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1iYWxhbmNlLXN5bWJvbCcpLnRleHRDb250ZW50ID0gdG9rZW4uc3ltYm9sO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB0b2tlbiBiYWxhbmNlOicsIGVycm9yKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZVNlbmRNYXgoKSB7XHJcbiAgLy8gU2V0IGFtb3VudCB0byBhdmFpbGFibGUgYmFsYW5jZSAobWludXMgZXN0aW1hdGVkIGdhcylcclxuICAvLyBGb3Igc2ltcGxpY2l0eSwgd2UnbGwganVzdCBzZXQgdG8gY3VycmVudCBiYWxhbmNlXHJcbiAgLy8gVXNlciBzaG91bGQgbGVhdmUgc29tZSBmb3IgZ2FzXHJcbiAgY29uc3QgYmFsYW5jZSA9IHBhcnNlRmxvYXQoY3VycmVudFN0YXRlLmJhbGFuY2UpO1xyXG4gIGlmIChiYWxhbmNlID4gMCkge1xyXG4gICAgLy8gTGVhdmUgYSBiaXQgZm9yIGdhcyAocm91Z2ggZXN0aW1hdGU6IDAuMDAxIGZvciBzaW1wbGUgdHJhbnNmZXIpXHJcbiAgICBjb25zdCBtYXhTZW5kID0gTWF0aC5tYXgoMCwgYmFsYW5jZSAtIDAuMDAxKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWFtb3VudCcpLnZhbHVlID0gbWF4U2VuZC50b1N0cmluZygpO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2VuZFRyYW5zYWN0aW9uKCkge1xyXG4gIGNvbnN0IHRvQWRkcmVzcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLXRvLWFkZHJlc3MnKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgYW1vdW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYW1vdW50JykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtcGFzc3dvcmQnKS52YWx1ZTtcclxuICBjb25zdCBhc3NldFNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWFzc2V0LXNlbGVjdCcpO1xyXG4gIGNvbnN0IHNlbGVjdGVkQXNzZXQgPSBhc3NldFNlbGVjdC52YWx1ZTtcclxuICBjb25zdCBlcnJvckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtZXJyb3InKTtcclxuXHJcbiAgY29uc3Qgc3ltYm9scyA9IHtcclxuICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICd0UExTJyxcclxuICAgICdwdWxzZWNoYWluJzogJ1BMUycsXHJcbiAgICAnZXRoZXJldW0nOiAnRVRIJyxcclxuICAgICdzZXBvbGlhJzogJ1NFUCdcclxuICB9O1xyXG5cclxuICAvLyBWYWxpZGF0ZSBpbnB1dHNcclxuICBpZiAoIXRvQWRkcmVzcyB8fCAhYW1vdW50IHx8ICFwYXNzd29yZCkge1xyXG4gICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdQbGVhc2UgZmlsbCBpbiBhbGwgZmllbGRzJztcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSBhZGRyZXNzIGZvcm1hdFxyXG4gIGlmICghdG9BZGRyZXNzLm1hdGNoKC9eMHhbYS1mQS1GMC05XXs0MH0kLykpIHtcclxuICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSAnSW52YWxpZCByZWNpcGllbnQgYWRkcmVzcyc7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgYW1vdW50XHJcbiAgY29uc3QgYW1vdW50TnVtID0gcGFyc2VGbG9hdChhbW91bnQpO1xyXG4gIGlmIChpc05hTihhbW91bnROdW0pIHx8IGFtb3VudE51bSA8PSAwKSB7XHJcbiAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ0ludmFsaWQgYW1vdW50JztcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAvLyBVbmxvY2sgd2FsbGV0IHdpdGggcGFzc3dvcmRcclxuICAgIGNvbnN0IHsgc2lnbmVyIH0gPSBhd2FpdCB1bmxvY2tXYWxsZXQocGFzc3dvcmQpO1xyXG5cclxuICAgIC8vIEdldCBwcm92aWRlciB3aXRoIGF1dG9tYXRpYyBmYWlsb3ZlciBhbmQgY29ubmVjdCBzaWduZXJcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKGN1cnJlbnRTdGF0ZS5uZXR3b3JrKTtcclxuICAgIGNvbnN0IGNvbm5lY3RlZFNpZ25lciA9IHNpZ25lci5jb25uZWN0KHByb3ZpZGVyKTtcclxuXHJcbiAgICBsZXQgdHhSZXNwb25zZSwgc3ltYm9sO1xyXG5cclxuICAgIGlmIChzZWxlY3RlZEFzc2V0ID09PSAnbmF0aXZlJykge1xyXG4gICAgICAvLyBTZW5kIG5hdGl2ZSBjdXJyZW5jeVxyXG4gICAgICBjb25zdCB0eCA9IHtcclxuICAgICAgICB0bzogdG9BZGRyZXNzLFxyXG4gICAgICAgIHZhbHVlOiBldGhlcnMucGFyc2VFdGhlcihhbW91bnQpXHJcbiAgICAgIH07XHJcbiAgICAgIHR4UmVzcG9uc2UgPSBhd2FpdCBjb25uZWN0ZWRTaWduZXIuc2VuZFRyYW5zYWN0aW9uKHR4KTtcclxuICAgICAgc3ltYm9sID0gc3ltYm9sc1tjdXJyZW50U3RhdGUubmV0d29ya10gfHwgJ3Rva2Vucyc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBTZW5kIHRva2VuXHJcbiAgICAgIGNvbnN0IGFsbFRva2VucyA9IGF3YWl0IHRva2Vucy5nZXRBbGxUb2tlbnMoY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG4gICAgICBjb25zdCB0b2tlbiA9IGFsbFRva2Vucy5maW5kKHQgPT4gdC5hZGRyZXNzID09PSBzZWxlY3RlZEFzc2V0KTtcclxuXHJcbiAgICAgIGlmICghdG9rZW4pIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Rva2VuIG5vdCBmb3VuZCcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBhbW91bnRXZWkgPSBlcmMyMC5wYXJzZVRva2VuQW1vdW50KGFtb3VudCwgdG9rZW4uZGVjaW1hbHMpO1xyXG4gICAgICB0eFJlc3BvbnNlID0gYXdhaXQgZXJjMjAudHJhbnNmZXJUb2tlbihjb25uZWN0ZWRTaWduZXIsIHRva2VuLmFkZHJlc3MsIHRvQWRkcmVzcywgYW1vdW50V2VpKTtcclxuICAgICAgc3ltYm9sID0gdG9rZW4uc3ltYm9sO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNob3cgc3VjY2VzcyBtb2RhbCB3aXRoIHR4IGhhc2hcclxuICAgIHNob3dUcmFuc2FjdGlvblN1Y2Nlc3NNb2RhbCh0eFJlc3BvbnNlLmhhc2gpO1xyXG5cclxuICAgIC8vIFNlbmQgZGVza3RvcCBub3RpZmljYXRpb25cclxuICAgIGlmIChjaHJvbWUubm90aWZpY2F0aW9ucykge1xyXG4gICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBTZW50JyxcclxuICAgICAgICBtZXNzYWdlOiBgU2VudCAke2Ftb3VudH0gJHtzeW1ib2x9IHRvICR7dG9BZGRyZXNzLnNsaWNlKDAsIDEwKX0uLi5gLFxyXG4gICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJldHVybiB0byBkYXNoYm9hcmRcclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKTtcclxuXHJcbiAgICAvLyBXYWl0IGZvciB0cmFuc2FjdGlvbiBjb25maXJtYXRpb24gaW4gYmFja2dyb3VuZFxyXG4gICAgd2FpdEZvclRyYW5zYWN0aW9uQ29uZmlybWF0aW9uKHR4UmVzcG9uc2UuaGFzaCwgYW1vdW50LCBzeW1ib2wpO1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignU2VuZCB0cmFuc2FjdGlvbiBlcnJvcjonLCBlcnJvcik7XHJcbiAgICBlcnJvckVsLnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZS5pbmNsdWRlcygnaW5jb3JyZWN0IHBhc3N3b3JkJylcclxuICAgICAgPyAnSW5jb3JyZWN0IHBhc3N3b3JkJ1xyXG4gICAgICA6ICdUcmFuc2FjdGlvbiBmYWlsZWQ6ICcgKyBlcnJvci5tZXNzYWdlO1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNob3dUcmFuc2FjdGlvblN1Y2Nlc3NNb2RhbCh0eEhhc2gpIHtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc3VjY2Vzcy1oYXNoJykudGV4dENvbnRlbnQgPSB0eEhhc2g7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXR4LXN1Y2Nlc3MnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gd2FpdEZvclRyYW5zYWN0aW9uQ29uZmlybWF0aW9uKHR4SGFzaCwgYW1vdW50LCBzeW1ib2wpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIoY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG5cclxuICAgIC8vIFdhaXQgZm9yIHRyYW5zYWN0aW9uIHRvIGJlIG1pbmVkICgxIGNvbmZpcm1hdGlvbilcclxuICAgIGNvbnN0IHJlY2VpcHQgPSBhd2FpdCBwcm92aWRlci53YWl0Rm9yVHJhbnNhY3Rpb24odHhIYXNoLCAxKTtcclxuXHJcbiAgICBpZiAocmVjZWlwdCAmJiByZWNlaXB0LnN0YXR1cyA9PT0gMSkge1xyXG4gICAgICAvLyBUcmFuc2FjdGlvbiBjb25maXJtZWQgc3VjY2Vzc2Z1bGx5XHJcbiAgICAgIGlmIChjaHJvbWUubm90aWZpY2F0aW9ucykge1xyXG4gICAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIENvbmZpcm1lZCcsXHJcbiAgICAgICAgICBtZXNzYWdlOiBgJHthbW91bnR9ICR7c3ltYm9sfSB0cmFuc2ZlciBjb25maXJtZWQgb24tY2hhaW4hYCxcclxuICAgICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEF1dG8tcmVmcmVzaCBiYWxhbmNlXHJcbiAgICAgIGF3YWl0IGZldGNoQmFsYW5jZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gVHJhbnNhY3Rpb24gZmFpbGVkXHJcbiAgICAgIGlmIChjaHJvbWUubm90aWZpY2F0aW9ucykge1xyXG4gICAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIEZhaWxlZCcsXHJcbiAgICAgICAgICBtZXNzYWdlOiAnVHJhbnNhY3Rpb24gd2FzIHJldmVydGVkIG9yIGZhaWxlZCBvbi1jaGFpbicsXHJcbiAgICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHdhaXRpbmcgZm9yIGNvbmZpcm1hdGlvbjonLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBSRUNFSVZFID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIHNob3dSZWNlaXZlU2NyZWVuKCkge1xyXG4gIGNvbnN0IGFkZHJlc3MgPSBjdXJyZW50U3RhdGUuYWRkcmVzcztcclxuXHJcbiAgLy8gVXBkYXRlIGFkZHJlc3MgZGlzcGxheVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWNlaXZlLWFkZHJlc3MnKS50ZXh0Q29udGVudCA9IGFkZHJlc3M7XHJcblxyXG4gIC8vIFVwZGF0ZSBuZXR3b3JrIGluZm9cclxuICBjb25zdCBuZXR3b3JrTmFtZXMgPSB7XHJcbiAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAnUHVsc2VDaGFpbiBUZXN0bmV0IFY0JyxcclxuICAgICdwdWxzZWNoYWluJzogJ1B1bHNlQ2hhaW4gTWFpbm5ldCcsXHJcbiAgICAnZXRoZXJldW0nOiAnRXRoZXJldW0gTWFpbm5ldCcsXHJcbiAgICAnc2Vwb2xpYSc6ICdTZXBvbGlhIFRlc3RuZXQnXHJcbiAgfTtcclxuICBjb25zdCBzeW1ib2xzID0ge1xyXG4gICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3RQTFMnLFxyXG4gICAgJ3B1bHNlY2hhaW4nOiAnUExTJyxcclxuICAgICdldGhlcmV1bSc6ICdFVEgnLFxyXG4gICAgJ3NlcG9saWEnOiAnU0VQJ1xyXG4gIH07XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlY2VpdmUtbmV0d29yay1uYW1lJykudGV4dENvbnRlbnQgPSBuZXR3b3JrTmFtZXNbY3VycmVudFN0YXRlLm5ldHdvcmtdIHx8ICdVbmtub3duIE5ldHdvcmsnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWNlaXZlLW5ldHdvcmstc3ltYm9sJykudGV4dENvbnRlbnQgPSBzeW1ib2xzW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXSB8fCAnVE9LRU4nO1xyXG5cclxuICAvLyBHZW5lcmF0ZSBRUiBjb2RlXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWNlaXZlLXFyLWNhbnZhcycpO1xyXG4gICAgYXdhaXQgUVJDb2RlLnRvQ2FudmFzKGNhbnZhcywgYWRkcmVzcywge1xyXG4gICAgICB3aWR0aDogMjAwLFxyXG4gICAgICBtYXJnaW46IDIsXHJcbiAgICAgIGNvbG9yOiB7XHJcbiAgICAgICAgZGFyazogZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5KS5nZXRQcm9wZXJ0eVZhbHVlKCctLXRlcm1pbmFsLWZnJykudHJpbSgpLFxyXG4gICAgICAgIGxpZ2h0OiBnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmJvZHkpLmdldFByb3BlcnR5VmFsdWUoJy0tdGVybWluYWwtYmcnKS50cmltKClcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdlbmVyYXRpbmcgUVIgY29kZTonLCBlcnJvcik7XHJcbiAgfVxyXG5cclxuICBzaG93U2NyZWVuKCdzY3JlZW4tcmVjZWl2ZScpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDb3B5UmVjZWl2ZUFkZHJlc3MoKSB7XHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGN1cnJlbnRTdGF0ZS5hZGRyZXNzKTtcclxuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS1yZWNlaXZlLWFkZHJlc3MnKTtcclxuICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGJ0bi50ZXh0Q29udGVudDtcclxuICAgIGJ0bi50ZXh0Q29udGVudCA9ICdDT1BJRUQhJztcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSBvcmlnaW5hbFRleHQ7XHJcbiAgICB9LCAyMDAwKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0ZhaWxlZCB0byBjb3B5IGFkZHJlc3MnKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFRPS0VOUyA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBzaG93VG9rZW5zU2NyZWVuKCkge1xyXG4gIC8vIFN3aXRjaCB0byBzY3JlZW4gZmlyc3Qgc28gdXNlciBzZWVzIGxvYWRpbmcgaW5kaWNhdG9yXHJcbiAgc2hvd1NjcmVlbignc2NyZWVuLXRva2VucycpO1xyXG5cclxuICAvLyBTbWFsbCBkZWxheSB0byBlbnN1cmUgc2NyZWVuIGlzIHZpc2libGUgYmVmb3JlIHN0YXJ0aW5nIHJlbmRlclxyXG4gIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCAxMCkpO1xyXG5cclxuICAvLyBOb3cgcmVuZGVyIHRva2VucyAobG9hZGluZyBpbmRpY2F0b3Igd2lsbCBiZSB2aXNpYmxlKVxyXG4gIGF3YWl0IHJlbmRlclRva2Vuc1NjcmVlbigpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZW5kZXJUb2tlbnNTY3JlZW4oKSB7XHJcbiAgY29uc3QgbmV0d29yayA9IGN1cnJlbnRTdGF0ZS5uZXR3b3JrO1xyXG5cclxuICAvLyBTaG93IGxvYWRpbmcsIGhpZGUgcGFuZWxzXHJcbiAgY29uc3QgbG9hZGluZ0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2Vucy1sb2FkaW5nJyk7XHJcbiAgY29uc3QgZGVmYXVsdFBhbmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlZmF1bHQtdG9rZW5zLXBhbmVsJyk7XHJcbiAgY29uc3QgY3VzdG9tUGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VzdG9tLXRva2Vucy1wYW5lbCcpO1xyXG5cclxuICBpZiAobG9hZGluZ0VsKSBsb2FkaW5nRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgaWYgKGRlZmF1bHRQYW5lbCkgZGVmYXVsdFBhbmVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIGlmIChjdXN0b21QYW5lbCkgY3VzdG9tUGFuZWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBSZW5kZXIgZGVmYXVsdCB0b2tlbnNcclxuICAgIGF3YWl0IHJlbmRlckRlZmF1bHRUb2tlbnMobmV0d29yayk7XHJcblxyXG4gICAgLy8gUmVuZGVyIGN1c3RvbSB0b2tlbnNcclxuICAgIGF3YWl0IHJlbmRlckN1c3RvbVRva2VucyhuZXR3b3JrKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgLy8gSGlkZSBsb2FkaW5nLCBzaG93IHBhbmVsc1xyXG4gICAgaWYgKGxvYWRpbmdFbCkgbG9hZGluZ0VsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgaWYgKGRlZmF1bHRQYW5lbCkgZGVmYXVsdFBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgaWYgKGN1c3RvbVBhbmVsKSBjdXN0b21QYW5lbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlbmRlckRlZmF1bHRUb2tlbnMobmV0d29yaykge1xyXG4gIGNvbnN0IGRlZmF1bHRUb2tlbnNFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWZhdWx0LXRva2Vucy1saXN0Jyk7XHJcbiAgY29uc3QgbmV0d29ya0RlZmF1bHRzID0gdG9rZW5zLkRFRkFVTFRfVE9LRU5TW25ldHdvcmtdIHx8IHt9O1xyXG4gIGNvbnN0IGVuYWJsZWREZWZhdWx0cyA9IGF3YWl0IHRva2Vucy5nZXRFbmFibGVkRGVmYXVsdFRva2VucyhuZXR3b3JrKTtcclxuXHJcbiAgaWYgKE9iamVjdC5rZXlzKG5ldHdvcmtEZWZhdWx0cykubGVuZ3RoID09PSAwKSB7XHJcbiAgICBkZWZhdWx0VG9rZW5zRWwuaW5uZXJIVE1MID0gJzxwIGNsYXNzPVwidGV4dC1jZW50ZXIgdGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDsgcGFkZGluZzogMTZweDtcIj5ObyBkZWZhdWx0IHRva2VucyBmb3IgdGhpcyBuZXR3b3JrPC9wPic7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBsZXQgaHRtbCA9ICcnO1xyXG4gIGZvciAoY29uc3Qgc3ltYm9sIGluIG5ldHdvcmtEZWZhdWx0cykge1xyXG4gICAgY29uc3QgdG9rZW4gPSBuZXR3b3JrRGVmYXVsdHNbc3ltYm9sXTtcclxuICAgIGNvbnN0IGlzRW5hYmxlZCA9IGVuYWJsZWREZWZhdWx0cy5pbmNsdWRlcyhzeW1ib2wpO1xyXG5cclxuICAgIC8vIEZldGNoIGJhbGFuY2UgaWYgZW5hYmxlZFxyXG4gICAgbGV0IGJhbGFuY2VUZXh0ID0gJy0nO1xyXG4gICAgbGV0IGJhbGFuY2VUb29sdGlwID0gJyc7XHJcbiAgICBsZXQgdXNkVmFsdWUgPSBudWxsO1xyXG4gICAgaWYgKGlzRW5hYmxlZCAmJiBjdXJyZW50U3RhdGUuYWRkcmVzcykge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBhd2FpdCBlcmMyMC5nZXRUb2tlbkJhbGFuY2UobmV0d29yaywgdG9rZW4uYWRkcmVzcywgY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgICAgIGNvbnN0IHJhd0JhbGFuY2UgPSBlcmMyMC5mb3JtYXRUb2tlbkJhbGFuY2UoYmFsYW5jZVdlaSwgdG9rZW4uZGVjaW1hbHMsIDQpO1xyXG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdEJhbGFuY2VXaXRoQ29tbWFzKHJhd0JhbGFuY2UsIHRva2VuLmRlY2ltYWxzKTtcclxuICAgICAgICBiYWxhbmNlVGV4dCA9IGZvcm1hdHRlZC5kaXNwbGF5O1xyXG4gICAgICAgIGJhbGFuY2VUb29sdGlwID0gZm9ybWF0dGVkLnRvb2x0aXA7XHJcblxyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBVU0QgdmFsdWUgaWYgcHJpY2VzIGF2YWlsYWJsZVxyXG4gICAgICAgIGlmIChjdXJyZW50U3RhdGUudG9rZW5QcmljZXMpIHtcclxuICAgICAgICAgIHVzZFZhbHVlID0gZ2V0VG9rZW5WYWx1ZVVTRChzeW1ib2wsIGJhbGFuY2VXZWksIHRva2VuLmRlY2ltYWxzLCBjdXJyZW50U3RhdGUudG9rZW5QcmljZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBiYWxhbmNlVGV4dCA9ICdFcnJvcic7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsb2dvVXJsID0gdG9rZW4ubG9nbyA/IGNocm9tZS5ydW50aW1lLmdldFVSTChgYXNzZXRzL2xvZ29zLyR7dG9rZW4ubG9nb31gKSA6ICcnO1xyXG5cclxuICAgIGh0bWwgKz0gYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwidG9rZW4taXRlbVwiIHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBwYWRkaW5nOiAxMnB4IDhweDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRlcm1pbmFsLWJvcmRlcik7XCI+XHJcbiAgICAgICAgJHt0b2tlbi5sb2dvID9cclxuICAgICAgICAgICh0b2tlbi5ob21lVXJsID9cclxuICAgICAgICAgICAgYDxpbWcgc3JjPVwiJHtsb2dvVXJsfVwiIGFsdD1cIiR7ZXNjYXBlSHRtbCh0b2tlbi5zeW1ib2wpfVwiIHN0eWxlPVwid2lkdGg6IDMycHg7IGhlaWdodDogMzJweDsgbWFyZ2luLXJpZ2h0OiAxMnB4OyBib3JkZXItcmFkaXVzOiA1MCU7IGN1cnNvcjogcG9pbnRlcjtcIiBjbGFzcz1cInRva2VuLWxvZ28tbGlua1wiIGRhdGEtdXJsPVwiJHt0b2tlbi5ob21lVXJsfVwiIHRpdGxlPVwiVmlzaXQgJHtlc2NhcGVIdG1sKHRva2VuLm5hbWUpfSBob21lcGFnZVwiIC8+YCA6XHJcbiAgICAgICAgICAgIGA8aW1nIHNyYz1cIiR7bG9nb1VybH1cIiBhbHQ9XCIke2VzY2FwZUh0bWwodG9rZW4uc3ltYm9sKX1cIiBzdHlsZT1cIndpZHRoOiAzMnB4OyBoZWlnaHQ6IDMycHg7IG1hcmdpbi1yaWdodDogMTJweDsgYm9yZGVyLXJhZGl1czogNTAlO1wiIC8+YCkgOlxyXG4gICAgICAgICAgJzxkaXYgc3R5bGU9XCJ3aWR0aDogMzJweDsgaGVpZ2h0OiAzMnB4OyBtYXJnaW4tcmlnaHQ6IDEycHg7IGJhY2tncm91bmQ6IHZhcigtLXRlcm1pbmFsLWJvcmRlcik7IGJvcmRlci1yYWRpdXM6IDUwJTtcIj48L2Rpdj4nfVxyXG4gICAgICAgIDxkaXYgc3R5bGU9XCJmbGV4OiAxO1wiPlxyXG4gICAgICAgICAgPHAgc3R5bGU9XCJmb250LXNpemU6IDE1cHg7IGZvbnQtd2VpZ2h0OiBib2xkO1wiPiR7ZXNjYXBlSHRtbCh0b2tlbi5zeW1ib2wpfTwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW0gJHt0b2tlbi5kZXhTY3JlZW5lclVybCA/ICd0b2tlbi1uYW1lLWxpbmsnIDogJyd9XCIgc3R5bGU9XCJmb250LXNpemU6IDEzcHg7ICR7dG9rZW4uZGV4U2NyZWVuZXJVcmwgPyAnY3Vyc29yOiBwb2ludGVyOyB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsnIDogJyd9XCIgJHt0b2tlbi5kZXhTY3JlZW5lclVybCA/IGBkYXRhLXVybD1cIiR7dG9rZW4uZGV4U2NyZWVuZXJVcmx9XCIgdGl0bGU9XCJWaWV3ICR7ZXNjYXBlSHRtbCh0b2tlbi5uYW1lKX0gb24gRGV4U2NyZWVuZXJcImAgOiAnJ30+JHtlc2NhcGVIdG1sKHRva2VuLm5hbWUpfTwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDsgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtbW9ubyk7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogNHB4O1wiPlxyXG4gICAgICAgICAgICA8c3BhbiBzdHlsZT1cIm1heC13aWR0aDogODBweDsgb3ZlcmZsb3c6IGhpZGRlbjsgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XCI+JHt0b2tlbi5hZGRyZXNzfTwvc3Bhbj5cclxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImNvcHktYWRkcmVzcy1idG5cIiBkYXRhLWFkZHJlc3M9XCIke3Rva2VuLmFkZHJlc3N9XCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiBub25lOyBib3JkZXI6IG5vbmU7IGNvbG9yOiB2YXIoLS10ZXJtaW5hbC1hY2NlbnQpOyBjdXJzb3I6IHBvaW50ZXI7IGZvbnQtc2l6ZTogMTFweDsgcGFkZGluZzogMnB4IDRweDtcIiB0aXRsZT1cIkNvcHkgY29udHJhY3QgYWRkcmVzc1wiPvCfk4s8L2J1dHRvbj5cclxuICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICR7aXNFbmFibGVkID8gYFxyXG4gICAgICAgICAgICA8cCBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDEzcHg7IGN1cnNvcjogaGVscDtcIiB0aXRsZT1cIiR7YmFsYW5jZVRvb2x0aXB9XCI+QmFsYW5jZTogJHtiYWxhbmNlVGV4dH08L3A+XHJcbiAgICAgICAgICAgICR7dXNkVmFsdWUgIT09IG51bGwgPyBgPHAgY2xhc3M9XCJ0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMnB4OyBtYXJnaW4tdG9wOiAycHg7XCI+JHtmb3JtYXRVU0QodXNkVmFsdWUpfTwvcD5gIDogJyd9XHJcbiAgICAgICAgICBgIDogJyd9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IG1hcmdpbi1sZWZ0OiA4cHg7XCI+XHJcbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwidmlldy10b2tlbi1kZXRhaWxzLWJ0blwiIGRhdGEtdG9rZW4tc3ltYm9sPVwiJHtzeW1ib2x9XCIgZGF0YS1pcy1kZWZhdWx0PVwidHJ1ZVwiIHN0eWxlPVwiYmFja2dyb3VuZDogdmFyKC0tdGVybWluYWwtYWNjZW50KTsgYm9yZGVyOiBub25lOyBjb2xvcjogIzAwMDsgY3Vyc29yOiBwb2ludGVyOyBmb250LXNpemU6IDE4cHg7IHBhZGRpbmc6IDRweCA4cHg7IGJvcmRlci1yYWRpdXM6IDRweDtcIiB0aXRsZT1cIlZpZXcgdG9rZW4gZGV0YWlsc1wiPuKEue+4jzwvYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIGA7XHJcbiAgfVxyXG5cclxuICBkZWZhdWx0VG9rZW5zRWwuaW5uZXJIVE1MID0gaHRtbDtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgdmlldyBkZXRhaWxzIGJ1dHRvbnNcclxuICBkZWZhdWx0VG9rZW5zRWwucXVlcnlTZWxlY3RvckFsbCgnLnZpZXctdG9rZW4tZGV0YWlscy1idG4nKS5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICBjb25zdCBzeW1ib2wgPSBlLnRhcmdldC5kYXRhc2V0LnRva2VuU3ltYm9sO1xyXG4gICAgICBjb25zdCBpc0RlZmF1bHQgPSBlLnRhcmdldC5kYXRhc2V0LmlzRGVmYXVsdCA9PT0gJ3RydWUnO1xyXG4gICAgICBzaG93VG9rZW5EZXRhaWxzKHN5bWJvbCwgaXNEZWZhdWx0KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBjb3B5IGFkZHJlc3MgYnV0dG9uc1xyXG4gIGRlZmF1bHRUb2tlbnNFbC5xdWVyeVNlbGVjdG9yQWxsKCcuY29weS1hZGRyZXNzLWJ0bicpLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFkZHJlc3MgPSBlLnRhcmdldC5kYXRhc2V0LmFkZHJlc3M7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoYWRkcmVzcyk7XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gZS50YXJnZXQudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgZS50YXJnZXQudGV4dENvbnRlbnQgPSAn4pyTJztcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIGUudGFyZ2V0LnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0O1xyXG4gICAgICAgIH0sIDEwMDApO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjb3B5IGFkZHJlc3M6JywgZXJyb3IpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgbG9nbyBjbGlja3MgKG9wZW4gaG9tZXBhZ2UpXHJcbiAgZGVmYXVsdFRva2Vuc0VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2tlbi1sb2dvLWxpbmsnKS5mb3JFYWNoKGltZyA9PiB7XHJcbiAgICBpbWcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICBjb25zdCB1cmwgPSBlLnRhcmdldC5kYXRhc2V0LnVybDtcclxuICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsIH0pO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIG5hbWUgY2xpY2tzIChvcGVuIERleFNjcmVlbmVyKVxyXG4gIGRlZmF1bHRUb2tlbnNFbC5xdWVyeVNlbGVjdG9yQWxsKCcudG9rZW4tbmFtZS1saW5rJykuZm9yRWFjaChwID0+IHtcclxuICAgIHAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICBjb25zdCB1cmwgPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC51cmw7XHJcbiAgICAgIGlmICh1cmwpIHtcclxuICAgICAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmwgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZW5kZXJDdXN0b21Ub2tlbnMobmV0d29yaykge1xyXG4gIGNvbnN0IGN1c3RvbVRva2Vuc0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N1c3RvbS10b2tlbnMtbGlzdCcpO1xyXG4gIGNvbnN0IGN1c3RvbVRva2VucyA9IGF3YWl0IHRva2Vucy5nZXRDdXN0b21Ub2tlbnMobmV0d29yayk7XHJcblxyXG4gIGlmIChjdXN0b21Ub2tlbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICBjdXN0b21Ub2tlbnNFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBwYWRkaW5nOiAxNnB4O1wiPk5vIGN1c3RvbSB0b2tlbnMgYWRkZWQ8L3A+JztcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGxldCBodG1sID0gJyc7XHJcbiAgZm9yIChjb25zdCB0b2tlbiBvZiBjdXN0b21Ub2tlbnMpIHtcclxuICAgIC8vIEZldGNoIGJhbGFuY2VcclxuICAgIGxldCBiYWxhbmNlVGV4dCA9ICctJztcclxuICAgIGxldCBiYWxhbmNlVG9vbHRpcCA9ICcnO1xyXG4gICAgbGV0IHVzZFZhbHVlID0gbnVsbDtcclxuICAgIGlmIChjdXJyZW50U3RhdGUuYWRkcmVzcykge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBhd2FpdCBlcmMyMC5nZXRUb2tlbkJhbGFuY2UobmV0d29yaywgdG9rZW4uYWRkcmVzcywgY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgICAgIGNvbnN0IHJhd0JhbGFuY2UgPSBlcmMyMC5mb3JtYXRUb2tlbkJhbGFuY2UoYmFsYW5jZVdlaSwgdG9rZW4uZGVjaW1hbHMsIDQpO1xyXG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdEJhbGFuY2VXaXRoQ29tbWFzKHJhd0JhbGFuY2UsIHRva2VuLmRlY2ltYWxzKTtcclxuICAgICAgICBiYWxhbmNlVGV4dCA9IGZvcm1hdHRlZC5kaXNwbGF5O1xyXG4gICAgICAgIGJhbGFuY2VUb29sdGlwID0gZm9ybWF0dGVkLnRvb2x0aXA7XHJcblxyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBVU0QgdmFsdWUgaWYgcHJpY2VzIGF2YWlsYWJsZSBhbmQgdG9rZW4gaXMga25vd25cclxuICAgICAgICBpZiAoY3VycmVudFN0YXRlLnRva2VuUHJpY2VzKSB7XHJcbiAgICAgICAgICB1c2RWYWx1ZSA9IGdldFRva2VuVmFsdWVVU0QodG9rZW4uc3ltYm9sLCBiYWxhbmNlV2VpLCB0b2tlbi5kZWNpbWFscywgY3VycmVudFN0YXRlLnRva2VuUHJpY2VzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgYmFsYW5jZVRleHQgPSAnRXJyb3InO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbG9nb1VybCA9IHRva2VuLmxvZ28gPyBjaHJvbWUucnVudGltZS5nZXRVUkwoYGFzc2V0cy9sb2dvcy8ke3Rva2VuLmxvZ299YCkgOiAnJztcclxuXHJcbiAgICBodG1sICs9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cInRva2VuLWl0ZW1cIiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgcGFkZGluZzogMTJweCA4cHg7IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS10ZXJtaW5hbC1ib3JkZXIpO1wiPlxyXG4gICAgICAgICR7dG9rZW4ubG9nbyA/XHJcbiAgICAgICAgICAodG9rZW4uaG9tZVVybCA/XHJcbiAgICAgICAgICAgIGA8aW1nIHNyYz1cIiR7bG9nb1VybH1cIiBhbHQ9XCIke2VzY2FwZUh0bWwodG9rZW4uc3ltYm9sKX1cIiBzdHlsZT1cIndpZHRoOiAzMnB4OyBoZWlnaHQ6IDMycHg7IG1hcmdpbi1yaWdodDogMTJweDsgYm9yZGVyLXJhZGl1czogNTAlOyBjdXJzb3I6IHBvaW50ZXI7XCIgY2xhc3M9XCJ0b2tlbi1sb2dvLWxpbmtcIiBkYXRhLXVybD1cIiR7dG9rZW4uaG9tZVVybH1cIiB0aXRsZT1cIlZpc2l0ICR7ZXNjYXBlSHRtbCh0b2tlbi5uYW1lKX0gaG9tZXBhZ2VcIiAvPmAgOlxyXG4gICAgICAgICAgICBgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgYWx0PVwiJHtlc2NhcGVIdG1sKHRva2VuLnN5bWJvbCl9XCIgc3R5bGU9XCJ3aWR0aDogMzJweDsgaGVpZ2h0OiAzMnB4OyBtYXJnaW4tcmlnaHQ6IDEycHg7IGJvcmRlci1yYWRpdXM6IDUwJTtcIiAvPmApIDpcclxuICAgICAgICAgICc8ZGl2IHN0eWxlPVwid2lkdGg6IDMycHg7IGhlaWdodDogMzJweDsgbWFyZ2luLXJpZ2h0OiAxMnB4OyBiYWNrZ3JvdW5kOiB2YXIoLS10ZXJtaW5hbC1ib3JkZXIpOyBib3JkZXItcmFkaXVzOiA1MCU7XCI+PC9kaXY+J31cclxuICAgICAgICA8ZGl2IHN0eWxlPVwiZmxleDogMTtcIj5cclxuICAgICAgICAgIDxwIHN0eWxlPVwiZm9udC1zaXplOiAxNXB4OyBmb250LXdlaWdodDogYm9sZDtcIj4ke2VzY2FwZUh0bWwodG9rZW4uc3ltYm9sKX08L3A+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cInRleHQtZGltICR7dG9rZW4uZGV4U2NyZWVuZXJVcmwgPyAndG9rZW4tbmFtZS1saW5rJyA6ICcnfVwiIHN0eWxlPVwiZm9udC1zaXplOiAxM3B4OyAke3Rva2VuLmRleFNjcmVlbmVyVXJsID8gJ2N1cnNvcjogcG9pbnRlcjsgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7JyA6ICcnfVwiICR7dG9rZW4uZGV4U2NyZWVuZXJVcmwgPyBgZGF0YS11cmw9XCIke3Rva2VuLmRleFNjcmVlbmVyVXJsfVwiIHRpdGxlPVwiVmlldyAke2VzY2FwZUh0bWwodG9rZW4ubmFtZSl9IG9uIERleFNjcmVlbmVyXCJgIDogJyd9PiR7ZXNjYXBlSHRtbCh0b2tlbi5uYW1lKX08L3A+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDExcHg7IGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LW1vbm8pOyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDRweDtcIj5cclxuICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJtYXgtd2lkdGg6IDgwcHg7IG92ZXJmbG93OiBoaWRkZW47IHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1wiPiR7dG9rZW4uYWRkcmVzc308L3NwYW4+XHJcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJjb3B5LWFkZHJlc3MtYnRuXCIgZGF0YS1hZGRyZXNzPVwiJHt0b2tlbi5hZGRyZXNzfVwiIHN0eWxlPVwiYmFja2dyb3VuZDogbm9uZTsgYm9yZGVyOiBub25lOyBjb2xvcjogdmFyKC0tdGVybWluYWwtYWNjZW50KTsgY3Vyc29yOiBwb2ludGVyOyBmb250LXNpemU6IDExcHg7IHBhZGRpbmc6IDJweCA0cHg7XCIgdGl0bGU9XCJDb3B5IGNvbnRyYWN0IGFkZHJlc3NcIj7wn5OLPC9idXR0b24+XHJcbiAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDEzcHg7IGN1cnNvcjogaGVscDtcIiB0aXRsZT1cIiR7YmFsYW5jZVRvb2x0aXB9XCI+QmFsYW5jZTogJHtiYWxhbmNlVGV4dH08L3A+XHJcbiAgICAgICAgICAke3VzZFZhbHVlICE9PSBudWxsID8gYDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTJweDsgbWFyZ2luLXRvcDogMnB4O1wiPiR7Zm9ybWF0VVNEKHVzZFZhbHVlKX08L3A+YCA6ICcnfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyBnYXA6IDZweDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgbWFyZ2luLWxlZnQ6IDhweDsgbWluLXdpZHRoOiA4MHB4O1wiPlxyXG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInZpZXctdG9rZW4tZGV0YWlscy1idG5cIiBkYXRhLXRva2VuLXN5bWJvbD1cIiR7dG9rZW4uc3ltYm9sfVwiIGRhdGEtaXMtZGVmYXVsdD1cImZhbHNlXCIgZGF0YS10b2tlbi1hZGRyZXNzPVwiJHt0b2tlbi5hZGRyZXNzfVwiIHN0eWxlPVwiYmFja2dyb3VuZDogdmFyKC0tdGVybWluYWwtYWNjZW50KTsgYm9yZGVyOiBub25lOyBjb2xvcjogIzAwMDsgY3Vyc29yOiBwb2ludGVyOyBmb250LXNpemU6IDE4cHg7IHBhZGRpbmc6IDRweCA4cHg7IGJvcmRlci1yYWRpdXM6IDRweDtcIiB0aXRsZT1cIlZpZXcgdG9rZW4gZGV0YWlsc1wiPuKEue+4jzwvYnV0dG9uPlxyXG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0bi1kYW5nZXIgYnRuLXNtYWxsIHJlbW92ZS10b2tlbi1idG5cIiBkYXRhLXRva2VuLWFkZHJlc3M9XCIke3Rva2VuLmFkZHJlc3N9XCIgc3R5bGU9XCJ3aWR0aDogMTAwJTsgZm9udC1zaXplOiA5cHg7IHBhZGRpbmc6IDJweCA0cHg7XCI+UkVNT1ZFPC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuICB9XHJcblxyXG4gIGN1c3RvbVRva2Vuc0VsLmlubmVySFRNTCA9IGh0bWw7XHJcblxyXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIHZpZXcgZGV0YWlscyBidXR0b25zXHJcbiAgY3VzdG9tVG9rZW5zRWwucXVlcnlTZWxlY3RvckFsbCgnLnZpZXctdG9rZW4tZGV0YWlscy1idG4nKS5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICBjb25zdCBzeW1ib2wgPSBlLnRhcmdldC5kYXRhc2V0LnRva2VuU3ltYm9sO1xyXG4gICAgICBjb25zdCBpc0RlZmF1bHQgPSBlLnRhcmdldC5kYXRhc2V0LmlzRGVmYXVsdCA9PT0gJ3RydWUnO1xyXG4gICAgICBjb25zdCBhZGRyZXNzID0gZS50YXJnZXQuZGF0YXNldC50b2tlbkFkZHJlc3M7XHJcbiAgICAgIHNob3dUb2tlbkRldGFpbHMoc3ltYm9sLCBpc0RlZmF1bHQsIGFkZHJlc3MpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIHJlbW92ZSBidXR0b25zXHJcbiAgY3VzdG9tVG9rZW5zRWwucXVlcnlTZWxlY3RvckFsbCgnLnJlbW92ZS10b2tlbi1idG4nKS5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZSkgPT4ge1xyXG4gICAgICBjb25zdCBhZGRyZXNzID0gZS50YXJnZXQuZGF0YXNldC50b2tlbkFkZHJlc3M7XHJcbiAgICAgIGlmIChjb25maXJtKCdSZW1vdmUgdGhpcyB0b2tlbiBmcm9tIHlvdXIgbGlzdD8nKSkge1xyXG4gICAgICAgIGF3YWl0IHRva2Vucy5yZW1vdmVDdXN0b21Ub2tlbihuZXR3b3JrLCBhZGRyZXNzKTtcclxuICAgICAgICBhd2FpdCByZW5kZXJUb2tlbnNTY3JlZW4oKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGNvcHkgYWRkcmVzcyBidXR0b25zXHJcbiAgY3VzdG9tVG9rZW5zRWwucXVlcnlTZWxlY3RvckFsbCgnLmNvcHktYWRkcmVzcy1idG4nKS5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZSkgPT4ge1xyXG4gICAgICBjb25zdCBhZGRyZXNzID0gZS50YXJnZXQuZGF0YXNldC5hZGRyZXNzO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGFkZHJlc3MpO1xyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGUudGFyZ2V0LnRleHRDb250ZW50O1xyXG4gICAgICAgIGUudGFyZ2V0LnRleHRDb250ZW50ID0gJ+Kckyc7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBlLnRhcmdldC50ZXh0Q29udGVudCA9IG9yaWdpbmFsVGV4dDtcclxuICAgICAgICB9LCAxMDAwKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY29weSBhZGRyZXNzOicsIGVycm9yKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGxvZ28gY2xpY2tzIChvcGVuIGhvbWVwYWdlKVxyXG4gIGN1c3RvbVRva2Vuc0VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2tlbi1sb2dvLWxpbmsnKS5mb3JFYWNoKGltZyA9PiB7XHJcbiAgICBpbWcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICBjb25zdCB1cmwgPSBlLnRhcmdldC5kYXRhc2V0LnVybDtcclxuICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsIH0pO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIG5hbWUgY2xpY2tzIChvcGVuIERleFNjcmVlbmVyKVxyXG4gIGN1c3RvbVRva2Vuc0VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2tlbi1uYW1lLWxpbmsnKS5mb3JFYWNoKHAgPT4ge1xyXG4gICAgcC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LnVybDtcclxuICAgICAgaWYgKHVybCkge1xyXG4gICAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybCB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vID09PT09IFRPS0VOIERFVEFJTFMgU0NSRUVOID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIHNob3dUb2tlbkRldGFpbHMoc3ltYm9sLCBpc0RlZmF1bHQsIGN1c3RvbUFkZHJlc3MgPSBudWxsKSB7XHJcbiAgY29uc3QgbmV0d29yayA9IGN1cnJlbnRTdGF0ZS5uZXR3b3JrO1xyXG5cclxuICAvLyBHZXQgdG9rZW4gZGF0YVxyXG4gIGxldCB0b2tlbkRhdGE7XHJcbiAgaWYgKGlzRGVmYXVsdCkge1xyXG4gICAgdG9rZW5EYXRhID0gdG9rZW5zLkRFRkFVTFRfVE9LRU5TW25ldHdvcmtdW3N5bWJvbF07XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIEZpbmQgaW4gY3VzdG9tIHRva2Vuc1xyXG4gICAgY29uc3QgY3VzdG9tVG9rZW5zID0gYXdhaXQgdG9rZW5zLmdldEN1c3RvbVRva2VucyhuZXR3b3JrKTtcclxuICAgIHRva2VuRGF0YSA9IGN1c3RvbVRva2Vucy5maW5kKHQgPT4gdC5hZGRyZXNzLnRvTG93ZXJDYXNlKCkgPT09IGN1c3RvbUFkZHJlc3MudG9Mb3dlckNhc2UoKSk7XHJcbiAgfVxyXG5cclxuICBpZiAoIXRva2VuRGF0YSkge1xyXG4gICAgY29uc29sZS5lcnJvcignVG9rZW4gbm90IGZvdW5kOicsIHN5bWJvbCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBTdG9yZSBjdXJyZW50IHRva2VuIGluIHN0YXRlXHJcbiAgY3VycmVudFN0YXRlLmN1cnJlbnRUb2tlbkRldGFpbHMgPSB7XHJcbiAgICAuLi50b2tlbkRhdGEsXHJcbiAgICBzeW1ib2wsXHJcbiAgICBpc0RlZmF1bHRcclxuICB9O1xyXG5cclxuICAvLyBVcGRhdGUgdGl0bGVcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy10aXRsZScpLnRleHRDb250ZW50ID0gc3ltYm9sLnRvVXBwZXJDYXNlKCk7XHJcblxyXG4gIC8vIFVwZGF0ZSB0b2tlbiBpbmZvXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtbmFtZScpLnRleHRDb250ZW50ID0gdG9rZW5EYXRhLm5hbWU7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtc3ltYm9sJykudGV4dENvbnRlbnQgPSBzeW1ib2w7XHJcblxyXG4gIC8vIFVwZGF0ZSBsb2dvXHJcbiAgY29uc3QgbG9nb0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWxvZ28tY29udGFpbmVyJyk7XHJcbiAgaWYgKHRva2VuRGF0YS5sb2dvKSB7XHJcbiAgICBjb25zdCBsb2dvVXJsID0gY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBhc3NldHMvbG9nb3MvJHt0b2tlbkRhdGEubG9nb31gKTtcclxuICAgIGxvZ29Db250YWluZXIuaW5uZXJIVE1MID0gYDxpbWcgc3JjPVwiJHtsb2dvVXJsfVwiIGFsdD1cIiR7c3ltYm9sfVwiIHN0eWxlPVwid2lkdGg6IDQ4cHg7IGhlaWdodDogNDhweDsgYm9yZGVyLXJhZGl1czogNTAlO1wiIC8+YDtcclxuICB9IGVsc2Uge1xyXG4gICAgbG9nb0NvbnRhaW5lci5pbm5lckhUTUwgPSAnPGRpdiBzdHlsZT1cIndpZHRoOiA0OHB4OyBoZWlnaHQ6IDQ4cHg7IGJhY2tncm91bmQ6IHZhcigtLXRlcm1pbmFsLWJvcmRlcik7IGJvcmRlci1yYWRpdXM6IDUwJTtcIj48L2Rpdj4nO1xyXG4gIH1cclxuXHJcbiAgLy8gRmV0Y2ggYW5kIHVwZGF0ZSBiYWxhbmNlXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBhd2FpdCBlcmMyMC5nZXRUb2tlbkJhbGFuY2UobmV0d29yaywgdG9rZW5EYXRhLmFkZHJlc3MsIGN1cnJlbnRTdGF0ZS5hZGRyZXNzKTtcclxuICAgIGNvbnN0IGJhbGFuY2VGb3JtYXR0ZWQgPSBlcmMyMC5mb3JtYXRUb2tlbkJhbGFuY2UoYmFsYW5jZVdlaSwgdG9rZW5EYXRhLmRlY2ltYWxzLCA4KTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWJhbGFuY2UnKS50ZXh0Q29udGVudCA9IGJhbGFuY2VGb3JtYXR0ZWQ7XHJcblxyXG4gICAgLy8gVXBkYXRlIFVTRCB2YWx1ZVxyXG4gICAgaWYgKGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcyAmJiBjdXJyZW50U3RhdGUudG9rZW5QcmljZXNbc3ltYm9sXSkge1xyXG4gICAgICBjb25zdCB1c2RWYWx1ZSA9IGdldFRva2VuVmFsdWVVU0Qoc3ltYm9sLCBiYWxhbmNlV2VpLCB0b2tlbkRhdGEuZGVjaW1hbHMsIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcyk7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWJhbGFuY2UtdXNkJykudGV4dENvbnRlbnQgPSBmb3JtYXRVU0QodXNkVmFsdWUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtYmFsYW5jZS11c2QnKS50ZXh0Q29udGVudCA9ICfigJQnO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB0b2tlbiBiYWxhbmNlOicsIGVycm9yKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWJhbGFuY2UnKS50ZXh0Q29udGVudCA9ICdFcnJvcic7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1iYWxhbmNlLXVzZCcpLnRleHRDb250ZW50ID0gJ+KAlCc7XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGUgcHJpY2VcclxuICBpZiAoY3VycmVudFN0YXRlLnRva2VuUHJpY2VzICYmIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlc1tzeW1ib2xdKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1wcmljZScpLnRleHRDb250ZW50ID0gZm9ybWF0VVNEKGN1cnJlbnRTdGF0ZS50b2tlblByaWNlc1tzeW1ib2xdKTtcclxuICB9IGVsc2Uge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtcHJpY2UnKS50ZXh0Q29udGVudCA9ICfigJQnO1xyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRlIGxpbmtzXHJcbiAgY29uc3QgaG9tZUxpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1ob21lLWxpbmsnKTtcclxuICBpZiAodG9rZW5EYXRhLmhvbWVVcmwpIHtcclxuICAgIGhvbWVMaW5rLmhyZWYgPSB0b2tlbkRhdGEuaG9tZVVybDtcclxuICAgIGhvbWVMaW5rLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBob21lTGluay5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGRleExpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1kZXgtbGluaycpO1xyXG4gIGlmICh0b2tlbkRhdGEuZGV4U2NyZWVuZXJVcmwpIHtcclxuICAgIGRleExpbmsuaHJlZiA9IHRva2VuRGF0YS5kZXhTY3JlZW5lclVybDtcclxuICAgIGRleExpbmsuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGRleExpbmsuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfVxyXG5cclxuICAvLyBTb3VyY2lmeSBsaW5rXHJcbiAgY29uc3QgY2hhaW5JZCA9IG5ldHdvcmsgPT09ICdwdWxzZWNoYWluJyA/IDM2OSA6IG5ldHdvcmsgPT09ICdwdWxzZWNoYWluVGVzdG5ldCcgPyA5NDMgOiAxO1xyXG4gIGNvbnN0IHNvdXJjaWZ5TGluayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXNvdXJjaWZ5LWxpbmsnKTtcclxuICBzb3VyY2lmeUxpbmsuaHJlZiA9IGBodHRwczovL3JlcG8uc291cmNpZnkuZGV2LyR7Y2hhaW5JZH0vJHt0b2tlbkRhdGEuYWRkcmVzc31gO1xyXG5cclxuICAvLyBDb250cmFjdCBhZGRyZXNzXHJcbiAgY29uc3Qgc2hvcnRBZGRyZXNzID0gYCR7dG9rZW5EYXRhLmFkZHJlc3Muc2xpY2UoMCwgNil9Li4uJHt0b2tlbkRhdGEuYWRkcmVzcy5zbGljZSgtNCl9YDtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1hZGRyZXNzLXNob3J0JykudGV4dENvbnRlbnQgPSBzaG9ydEFkZHJlc3M7XHJcblxyXG4gIC8vIE1hbmFnZW1lbnQgcGFuZWwgKHNob3cgb25seSBmb3IgZGVmYXVsdCB0b2tlbnMpXHJcbiAgY29uc3QgbWFuYWdlbWVudFBhbmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtbWFuYWdlbWVudC1wYW5lbCcpO1xyXG4gIGlmIChpc0RlZmF1bHQpIHtcclxuICAgIG1hbmFnZW1lbnRQYW5lbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuXHJcbiAgICAvLyBTZXQgdG9nZ2xlIHN0YXRlXHJcbiAgICBjb25zdCBlbmFibGVUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1lbmFibGUtdG9nZ2xlJyk7XHJcbiAgICBjb25zdCBlbmFibGVMYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWVuYWJsZS1sYWJlbCcpO1xyXG4gICAgY29uc3QgZW5hYmxlZFRva2VucyA9IGF3YWl0IHRva2Vucy5nZXRFbmFibGVkRGVmYXVsdFRva2VucyhuZXR3b3JrKTtcclxuICAgIGNvbnN0IGlzVG9rZW5FbmFibGVkID0gZW5hYmxlZFRva2Vucy5pbmNsdWRlcyhzeW1ib2wpO1xyXG5cclxuICAgIGVuYWJsZVRvZ2dsZS5jaGVja2VkID0gaXNUb2tlbkVuYWJsZWQ7XHJcbiAgICBlbmFibGVMYWJlbC50ZXh0Q29udGVudCA9IGlzVG9rZW5FbmFibGVkID8gJ0VuYWJsZWQnIDogJ0Rpc2FibGVkJztcclxuICB9IGVsc2Uge1xyXG4gICAgbWFuYWdlbWVudFBhbmVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2xlYXIgc2VuZCBmb3JtXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtcmVjaXBpZW50JykudmFsdWUgPSAnJztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1hbW91bnQnKS52YWx1ZSA9ICcnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXBhc3N3b3JkJykudmFsdWUgPSAnJztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1zZW5kLWVycm9yJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIC8vIFNob3cgc2NyZWVuXHJcbiAgc2hvd1NjcmVlbignc2NyZWVuLXRva2VuLWRldGFpbHMnKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQ29weVRva2VuRGV0YWlsc0FkZHJlc3MoKSB7XHJcbiAgY29uc3QgdG9rZW5EYXRhID0gY3VycmVudFN0YXRlLmN1cnJlbnRUb2tlbkRldGFpbHM7XHJcbiAgaWYgKCF0b2tlbkRhdGEpIHJldHVybjtcclxuXHJcbiAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodG9rZW5EYXRhLmFkZHJlc3MpLnRoZW4oKCkgPT4ge1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtY29weS1hZGRyZXNzJyk7XHJcbiAgICBjb25zdCBvcmlnaW5hbFRleHQgPSBidG4uaW5uZXJIVE1MO1xyXG4gICAgYnRuLmlubmVySFRNTCA9ICc8c3Bhbj7inJM8L3NwYW4+PHNwYW4+Q29waWVkITwvc3Bhbj4nO1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGJ0bi5pbm5lckhUTUwgPSBvcmlnaW5hbFRleHQ7XHJcbiAgICB9LCAyMDAwKTtcclxuICB9KTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVG9rZW5TZW5kTWF4KCkge1xyXG4gIGNvbnN0IHRva2VuRGF0YSA9IGN1cnJlbnRTdGF0ZS5jdXJyZW50VG9rZW5EZXRhaWxzO1xyXG4gIGlmICghdG9rZW5EYXRhKSByZXR1cm47XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBiYWxhbmNlV2VpID0gYXdhaXQgZXJjMjAuZ2V0VG9rZW5CYWxhbmNlKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCB0b2tlbkRhdGEuYWRkcmVzcywgY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgY29uc3QgYmFsYW5jZUZvcm1hdHRlZCA9IGVyYzIwLmZvcm1hdFRva2VuQmFsYW5jZShiYWxhbmNlV2VpLCB0b2tlbkRhdGEuZGVjaW1hbHMsIDE4KTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWFtb3VudCcpLnZhbHVlID0gYmFsYW5jZUZvcm1hdHRlZDtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBtYXggYmFsYW5jZTonLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUb2tlblNlbmQoKSB7XHJcbiAgY29uc3QgdG9rZW5EYXRhID0gY3VycmVudFN0YXRlLmN1cnJlbnRUb2tlbkRldGFpbHM7XHJcbiAgaWYgKCF0b2tlbkRhdGEpIHJldHVybjtcclxuXHJcbiAgY29uc3QgcmVjaXBpZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtcmVjaXBpZW50JykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IGFtb3VudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWFtb3VudCcpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXBhc3N3b3JkJykudmFsdWU7XHJcbiAgY29uc3QgZXJyb3JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXNlbmQtZXJyb3InKTtcclxuXHJcbiAgLy8gQ2xlYXIgcHJldmlvdXMgZXJyb3JzXHJcbiAgZXJyb3JFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gVmFsaWRhdGUgaW5wdXRzXHJcbiAgaWYgKCFyZWNpcGllbnQgfHwgIWFtb3VudCB8fCAhcGFzc3dvcmQpIHtcclxuICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSAnUGxlYXNlIGZpbGwgYWxsIGZpZWxkcyc7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaWYgKCFyZWNpcGllbnQuc3RhcnRzV2l0aCgnMHgnKSB8fCByZWNpcGllbnQubGVuZ3RoICE9PSA0Mikge1xyXG4gICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdJbnZhbGlkIHJlY2lwaWVudCBhZGRyZXNzJztcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgYW1vdW50Qk4gPSBldGhlcnMucGFyc2VVbml0cyhhbW91bnQsIHRva2VuRGF0YS5kZWNpbWFscyk7XHJcblxyXG4gICAgLy8gQ2hlY2sgYmFsYW5jZVxyXG4gICAgY29uc3QgYmFsYW5jZVdlaSA9IGF3YWl0IGVyYzIwLmdldFRva2VuQmFsYW5jZShjdXJyZW50U3RhdGUubmV0d29yaywgdG9rZW5EYXRhLmFkZHJlc3MsIGN1cnJlbnRTdGF0ZS5hZGRyZXNzKTtcclxuICAgIGlmIChhbW91bnRCTiA+IGJhbGFuY2VXZWkpIHtcclxuICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdJbnN1ZmZpY2llbnQgYmFsYW5jZSc7XHJcbiAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBEZWNyeXB0IHdhbGxldFxyXG4gICAgY29uc3QgZW5jcnlwdGVkV2FsbGV0ID0gYXdhaXQgbG9hZCgnZW5jcnlwdGVkX3dhbGxldCcpO1xyXG4gICAgaWYgKCFlbmNyeXB0ZWRXYWxsZXQpIHtcclxuICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdXYWxsZXQgbm90IGZvdW5kJztcclxuICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBkZWNyeXB0ZWRXYWxsZXQ7XHJcbiAgICB0cnkge1xyXG4gICAgICBkZWNyeXB0ZWRXYWxsZXQgPSBhd2FpdCB3YWxsZXQuZGVjcnlwdFdhbGxldChlbmNyeXB0ZWRXYWxsZXQsIHBhc3N3b3JkKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ0luY29ycmVjdCBwYXNzd29yZCc7XHJcbiAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgdGhlIGN1cnJlbnQgd2FsbGV0IGluZGV4XHJcbiAgICBjb25zdCB3YWxsZXRJbmRleCA9IGN1cnJlbnRTdGF0ZS53YWxsZXRJbmRleCB8fCAwO1xyXG4gICAgY29uc3Qgd2FsbGV0SW5zdGFuY2UgPSBkZWNyeXB0ZWRXYWxsZXQud2FsbGV0c1t3YWxsZXRJbmRleF07XHJcblxyXG4gICAgLy8gQ3JlYXRlIHNpZ25lciB3aXRoIGF1dG9tYXRpYyBSUEMgZmFpbG92ZXJcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKGN1cnJlbnRTdGF0ZS5uZXR3b3JrKTtcclxuICAgIGNvbnN0IHNpZ25lciA9IG5ldyBldGhlcnMuV2FsbGV0KHdhbGxldEluc3RhbmNlLnByaXZhdGVLZXksIHByb3ZpZGVyKTtcclxuXHJcbiAgICAvLyBTZW5kIHRva2VuXHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IGVyYzIwLnRyYW5zZmVyVG9rZW4oXHJcbiAgICAgIHNpZ25lcixcclxuICAgICAgdG9rZW5EYXRhLmFkZHJlc3MsXHJcbiAgICAgIHJlY2lwaWVudCxcclxuICAgICAgYW1vdW50Qk4udG9TdHJpbmcoKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBXYWl0IGZvciB0cmFuc2FjdGlvbiB0byBiZSBzZW50XHJcbiAgICBjb25zdCByZWNlaXB0ID0gYXdhaXQgdHgud2FpdCgpO1xyXG5cclxuICAgIC8vIENsZWFyIGZvcm1cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXJlY2lwaWVudCcpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1hbW91bnQnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtcGFzc3dvcmQnKS52YWx1ZSA9ICcnO1xyXG5cclxuICAgIC8vIFNob3cgc3VjY2VzcyBhbmQgZ28gYmFja1xyXG4gICAgYWxlcnQoYFRyYW5zYWN0aW9uIHNlbnQhXFxuXFxuVHggSGFzaDogJHt0eC5oYXNofWApO1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXRva2VucycpO1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3Igc2VuZGluZyB0b2tlbjonLCBlcnJvcik7XHJcbiAgICBlcnJvckVsLnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZSB8fCAnVHJhbnNhY3Rpb24gZmFpbGVkJztcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUb2tlbkVuYWJsZVRvZ2dsZShlKSB7XHJcbiAgY29uc3QgdG9rZW5EYXRhID0gY3VycmVudFN0YXRlLmN1cnJlbnRUb2tlbkRldGFpbHM7XHJcbiAgaWYgKCF0b2tlbkRhdGEgfHwgIXRva2VuRGF0YS5pc0RlZmF1bHQpIHJldHVybjtcclxuXHJcbiAgY29uc3QgaXNFbmFibGVkID0gZS50YXJnZXQuY2hlY2tlZDtcclxuICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWVuYWJsZS1sYWJlbCcpO1xyXG5cclxuICAvLyBVcGRhdGUgbGFiZWxcclxuICBsYWJlbC50ZXh0Q29udGVudCA9IGlzRW5hYmxlZCA/ICdFbmFibGVkJyA6ICdEaXNhYmxlZCc7XHJcblxyXG4gIC8vIFNhdmUgdG8gc3RvcmFnZVxyXG4gIGF3YWl0IHRva2Vucy50b2dnbGVEZWZhdWx0VG9rZW4oY3VycmVudFN0YXRlLm5ldHdvcmssIHRva2VuRGF0YS5zeW1ib2wsIGlzRW5hYmxlZCk7XHJcblxyXG4gIC8vIE5vdGU6IFdlIGRvbid0IHJlLXJlbmRlciB0aGUgdG9rZW5zIHNjcmVlbiBoZXJlIHRvIGF2b2lkIGxlYXZpbmcgdGhlIGRldGFpbHMgcGFnZVxyXG4gIC8vIFRoZSBjaGFuZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgd2hlbiB0aGUgdXNlciBnb2VzIGJhY2sgdG8gdGhlIHRva2VucyBzY3JlZW5cclxufVxyXG5cclxuZnVuY3Rpb24gc2hvd0FkZFRva2VuTW9kYWwoKSB7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LXRva2VuLWFkZHJlc3MnKS52YWx1ZSA9ICcnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1wcmV2aWV3JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZC10b2tlbi1lcnJvcicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtdG9rZW4nKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxufVxyXG5cclxubGV0IHRva2VuVmFsaWRhdGlvblRpbWVvdXQ7XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRva2VuQWRkcmVzc0lucHV0KGUpIHtcclxuICBjb25zdCBhZGRyZXNzID0gZS50YXJnZXQudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IHByZXZpZXdFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1wcmV2aWV3Jyk7XHJcbiAgY29uc3QgZXJyb3JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtdG9rZW4tZXJyb3InKTtcclxuXHJcbiAgLy8gQ2xlYXIgcHJldmlvdXMgdGltZW91dFxyXG4gIGlmICh0b2tlblZhbGlkYXRpb25UaW1lb3V0KSB7XHJcbiAgICBjbGVhclRpbWVvdXQodG9rZW5WYWxpZGF0aW9uVGltZW91dCk7XHJcbiAgfVxyXG5cclxuICAvLyBIaWRlIHByZXZpZXcgYW5kIGVycm9yXHJcbiAgcHJldmlld0VsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIGVycm9yRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIC8vIEJhc2ljIHZhbGlkYXRpb25cclxuICBpZiAoIWFkZHJlc3MgfHwgYWRkcmVzcy5sZW5ndGggIT09IDQyIHx8ICFhZGRyZXNzLnN0YXJ0c1dpdGgoJzB4JykpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIERlYm91bmNlIHRoZSB2YWxpZGF0aW9uXHJcbiAgdG9rZW5WYWxpZGF0aW9uVGltZW91dCA9IHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgbmV0d29yayA9IGN1cnJlbnRTdGF0ZS5uZXR3b3JrO1xyXG4gICAgICBjb25zdCBtZXRhZGF0YSA9IGF3YWl0IGVyYzIwLmdldFRva2VuTWV0YWRhdGEobmV0d29yaywgYWRkcmVzcyk7XHJcblxyXG4gICAgICAvLyBTaG93IHByZXZpZXdcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXByZXZpZXctbmFtZScpLnRleHRDb250ZW50ID0gbWV0YWRhdGEubmFtZTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXByZXZpZXctc3ltYm9sJykudGV4dENvbnRlbnQgPSBtZXRhZGF0YS5zeW1ib2w7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1wcmV2aWV3LWRlY2ltYWxzJykudGV4dENvbnRlbnQgPSBtZXRhZGF0YS5kZWNpbWFscztcclxuICAgICAgcHJldmlld0VsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdJbnZhbGlkIHRva2VuIGNvbnRyYWN0JztcclxuICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIH1cclxuICB9LCA1MDApO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVBZGRDdXN0b21Ub2tlbigpIHtcclxuICBjb25zdCBhZGRyZXNzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LXRva2VuLWFkZHJlc3MnKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgZXJyb3JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtdG9rZW4tZXJyb3InKTtcclxuXHJcbiAgaWYgKCFhZGRyZXNzKSB7XHJcbiAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ1BsZWFzZSBlbnRlciBhIHRva2VuIGFkZHJlc3MnO1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgYXdhaXQgdG9rZW5zLmFkZEN1c3RvbVRva2VuKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCBhZGRyZXNzKTtcclxuXHJcbiAgICAvLyBDbG9zZSBtb2RhbCBhbmQgcmVmcmVzaCBzY3JlZW5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtdG9rZW4nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGF3YWl0IHJlbmRlclRva2Vuc1NjcmVlbigpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBlcnJvckVsLnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBTRVRUSU5HUyA9PT09PVxyXG5mdW5jdGlvbiBsb2FkU2V0dGluZ3NUb1VJKCkge1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLWF1dG9sb2NrJykudmFsdWUgPSBjdXJyZW50U3RhdGUuc2V0dGluZ3MuYXV0b0xvY2tNaW51dGVzO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLWRlY2ltYWxzJykudmFsdWUgPSBjdXJyZW50U3RhdGUuc2V0dGluZ3MuZGVjaW1hbFBsYWNlcztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0dGluZy10aGVtZScpLnZhbHVlID0gY3VycmVudFN0YXRlLnNldHRpbmdzLnRoZW1lO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLXNob3ctdGVzdG5ldHMnKS5jaGVja2VkID0gY3VycmVudFN0YXRlLnNldHRpbmdzLnNob3dUZXN0TmV0d29ya3M7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctbWF4LWdhcy1wcmljZScpLnZhbHVlID0gY3VycmVudFN0YXRlLnNldHRpbmdzLm1heEdhc1ByaWNlR3dlaSB8fCAxMDAwO1xyXG59XHJcblxyXG4vLyBOZXR3b3JrIFNldHRpbmdzXHJcbmNvbnN0IE5FVFdPUktfS0VZUyA9IFsncHVsc2VjaGFpblRlc3RuZXQnLCAncHVsc2VjaGFpbicsICdldGhlcmV1bScsICdzZXBvbGlhJ107XHJcblxyXG5mdW5jdGlvbiBsb2FkTmV0d29ya1NldHRpbmdzVG9VSSgpIHtcclxuICBORVRXT1JLX0tFWVMuZm9yRWFjaChuZXR3b3JrID0+IHtcclxuICAgIC8vIExvYWQgUlBDIGVuZHBvaW50XHJcbiAgICBjb25zdCBycGNJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBycGMtJHtuZXR3b3JrfWApO1xyXG4gICAgaWYgKHJwY0lucHV0KSB7XHJcbiAgICAgIHJwY0lucHV0LnZhbHVlID0gY3VycmVudFN0YXRlLm5ldHdvcmtTZXR0aW5ncz8uW25ldHdvcmtdPy5ycGMgfHwgJyc7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTG9hZCBFeHBsb3JlciBzZXR0aW5nc1xyXG4gICAgY29uc3QgZXhwbG9yZXJJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBleHBsb3Jlci0ke25ldHdvcmt9YCk7XHJcbiAgICBpZiAoZXhwbG9yZXJJbnB1dCkge1xyXG4gICAgICBleHBsb3JlcklucHV0LnZhbHVlID0gY3VycmVudFN0YXRlLm5ldHdvcmtTZXR0aW5ncz8uW25ldHdvcmtdPy5leHBsb3JlckJhc2UgfHwgJyc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdHhQYXRoSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgZXhwbG9yZXItdHgtJHtuZXR3b3JrfWApO1xyXG4gICAgaWYgKHR4UGF0aElucHV0KSB7XHJcbiAgICAgIHR4UGF0aElucHV0LnZhbHVlID0gY3VycmVudFN0YXRlLm5ldHdvcmtTZXR0aW5ncz8uW25ldHdvcmtdPy5leHBsb3JlclR4UGF0aCB8fCAnJztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhZGRyUGF0aElucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGV4cGxvcmVyLWFkZHItJHtuZXR3b3JrfWApO1xyXG4gICAgaWYgKGFkZHJQYXRoSW5wdXQpIHtcclxuICAgICAgYWRkclBhdGhJbnB1dC52YWx1ZSA9IGN1cnJlbnRTdGF0ZS5uZXR3b3JrU2V0dGluZ3M/LltuZXR3b3JrXT8uZXhwbG9yZXJBZGRyUGF0aCB8fCAnJztcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2F2ZU5ldHdvcmtTZXR0aW5ncygpIHtcclxuICBjb25zdCBuZXR3b3JrU2V0dGluZ3MgPSB7fTtcclxuXHJcbiAgTkVUV09SS19LRVlTLmZvckVhY2gobmV0d29yayA9PiB7XHJcbiAgICBuZXR3b3JrU2V0dGluZ3NbbmV0d29ya10gPSB7XHJcbiAgICAgIHJwYzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYHJwYy0ke25ldHdvcmt9YCk/LnZhbHVlIHx8ICcnLFxyXG4gICAgICBleHBsb3JlckJhc2U6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBleHBsb3Jlci0ke25ldHdvcmt9YCk/LnZhbHVlIHx8ICcnLFxyXG4gICAgICBleHBsb3JlclR4UGF0aDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGV4cGxvcmVyLXR4LSR7bmV0d29ya31gKT8udmFsdWUgfHwgJycsXHJcbiAgICAgIGV4cGxvcmVyQWRkclBhdGg6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBleHBsb3Jlci1hZGRyLSR7bmV0d29ya31gKT8udmFsdWUgfHwgJydcclxuICAgIH07XHJcbiAgfSk7XHJcblxyXG4gIGF3YWl0IHNhdmUoJ25ldHdvcmtTZXR0aW5ncycsIG5ldHdvcmtTZXR0aW5ncyk7XHJcbiAgY3VycmVudFN0YXRlLm5ldHdvcmtTZXR0aW5ncyA9IG5ldHdvcmtTZXR0aW5ncztcclxuXHJcbiAgLy8gVXBkYXRlIHJ1bnRpbWUgc2V0dGluZ3NcclxuICBhcHBseU5ldHdvcmtTZXR0aW5ncygpO1xyXG5cclxuICBhbGVydCgnTmV0d29yayBzZXR0aW5ncyBzYXZlZCEgQ2hhbmdlcyB3aWxsIHRha2UgZWZmZWN0IG9uIG5leHQgcmVsb2FkLicpO1xyXG4gIHNob3dTY3JlZW4oJ3NjcmVlbi1zZXR0aW5ncycpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZXNldE5ldHdvcmtTZXR0aW5nc1RvRGVmYXVsdHMoKSB7XHJcbiAgTkVUV09SS19LRVlTLmZvckVhY2gobmV0d29yayA9PiB7XHJcbiAgICAvLyBSZXNldCB0byBkZWZhdWx0IFJQQyBlbmRwb2ludHMgZnJvbSBycGMuanNcclxuICAgIGNvbnN0IGRlZmF1bHRSUENzID0ge1xyXG4gICAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAnaHR0cHM6Ly9ycGMudjQudGVzdG5ldC5wdWxzZWNoYWluLmNvbScsXHJcbiAgICAgICdwdWxzZWNoYWluJzogJ2h0dHBzOi8vcnBjLnB1bHNlY2hhaW4uY29tJyxcclxuICAgICAgJ2V0aGVyZXVtJzogJ2h0dHBzOi8vZXRoLmxsYW1hcnBjLmNvbScsXHJcbiAgICAgICdzZXBvbGlhJzogJ2h0dHBzOi8vcnBjLnNlcG9saWEub3JnJ1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBkZWZhdWx0RXhwbG9yZXJzID0ge1xyXG4gICAgICAncHVsc2VjaGFpblRlc3RuZXQnOiB7XHJcbiAgICAgICAgYmFzZTogJ2h0dHBzOi8vc2Nhbi52NC50ZXN0bmV0LnB1bHNlY2hhaW4uY29tJyxcclxuICAgICAgICB0eDogJy90eC97aGFzaH0nLFxyXG4gICAgICAgIGFkZHI6ICcvYWRkcmVzcy97YWRkcmVzc30nXHJcbiAgICAgIH0sXHJcbiAgICAgICdwdWxzZWNoYWluJzoge1xyXG4gICAgICAgIGJhc2U6ICdodHRwczovL3NjYW4ubXlwaW5hdGEuY2xvdWQvaXBmcy9iYWZ5YmVpZW54eW95cmhuNXRzd2NsdmQzZ2RqeTVtdGtrd211MzdhcXRtbDZvbmJmN3huYjNvMjJwZS8nLFxyXG4gICAgICAgIHR4OiAnIy90eC97aGFzaH0nLFxyXG4gICAgICAgIGFkZHI6ICcjL2FkZHJlc3Mve2FkZHJlc3N9J1xyXG4gICAgICB9LFxyXG4gICAgICAnZXRoZXJldW0nOiB7XHJcbiAgICAgICAgYmFzZTogJ2h0dHBzOi8vZXRoZXJzY2FuLmlvJyxcclxuICAgICAgICB0eDogJy90eC97aGFzaH0nLFxyXG4gICAgICAgIGFkZHI6ICcvYWRkcmVzcy97YWRkcmVzc30nXHJcbiAgICAgIH0sXHJcbiAgICAgICdzZXBvbGlhJzoge1xyXG4gICAgICAgIGJhc2U6ICdodHRwczovL3NlcG9saWEuZXRoZXJzY2FuLmlvJyxcclxuICAgICAgICB0eDogJy90eC97aGFzaH0nLFxyXG4gICAgICAgIGFkZHI6ICcvYWRkcmVzcy97YWRkcmVzc30nXHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYHJwYy0ke25ldHdvcmt9YCkudmFsdWUgPSBkZWZhdWx0UlBDc1tuZXR3b3JrXSB8fCAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBleHBsb3Jlci0ke25ldHdvcmt9YCkudmFsdWUgPSBkZWZhdWx0RXhwbG9yZXJzW25ldHdvcmtdPy5iYXNlIHx8ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGV4cGxvcmVyLXR4LSR7bmV0d29ya31gKS52YWx1ZSA9IGRlZmF1bHRFeHBsb3JlcnNbbmV0d29ya10/LnR4IHx8ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGV4cGxvcmVyLWFkZHItJHtuZXR3b3JrfWApLnZhbHVlID0gZGVmYXVsdEV4cGxvcmVyc1tuZXR3b3JrXT8uYWRkciB8fCAnJztcclxuICB9KTtcclxuXHJcbiAgYWxlcnQoJ05ldHdvcmsgc2V0dGluZ3MgcmVzZXQgdG8gZGVmYXVsdHMuIENsaWNrIFNBVkUgdG8gYXBwbHkuJyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5TmV0d29ya1NldHRpbmdzKCkge1xyXG4gIC8vIFRoaXMgd291bGQgdXBkYXRlIHRoZSBydW50aW1lIFJQQyBhbmQgZXhwbG9yZXIgY29uZmlnc1xyXG4gIC8vIEZvciBub3csIHNldHRpbmdzIHRha2UgZWZmZWN0IG9uIHJlbG9hZFxyXG59XHJcblxyXG4vLyA9PT09PSBQQVNTV09SRCBQUk9NUFQgTU9EQUwgPT09PT1cclxubGV0IHBhc3N3b3JkUHJvbXB0UmVzb2x2ZSA9IG51bGw7XHJcblxyXG5mdW5jdGlvbiBzaG93UGFzc3dvcmRQcm9tcHQodGl0bGUsIG1lc3NhZ2UpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgIHBhc3N3b3JkUHJvbXB0UmVzb2x2ZSA9IHJlc29sdmU7XHJcblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC10aXRsZScpLnRleHRDb250ZW50ID0gdGl0bGU7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtcHJvbXB0LW1lc3NhZ2UnKS50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtcHJvbXB0LWlucHV0JykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1wcm9tcHQtZXJyb3InKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1wYXNzd29yZC1wcm9tcHQnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuXHJcbiAgICAvLyBGb2N1cyB0aGUgaW5wdXRcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtcHJvbXB0LWlucHV0Jyk/LmZvY3VzKCk7XHJcbiAgICB9LCAxMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjbG9zZVBhc3N3b3JkUHJvbXB0KHBhc3N3b3JkID0gbnVsbCkge1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1wYXNzd29yZC1wcm9tcHQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICBpZiAocGFzc3dvcmRQcm9tcHRSZXNvbHZlKSB7XHJcbiAgICBwYXNzd29yZFByb21wdFJlc29sdmUocGFzc3dvcmQpO1xyXG4gICAgcGFzc3dvcmRQcm9tcHRSZXNvbHZlID0gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IERJU1BMQVkgU0VDUkVUIE1PREFMID09PT09XHJcbmZ1bmN0aW9uIHNob3dTZWNyZXRNb2RhbCh0aXRsZSwgc2VjcmV0KSB7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpc3BsYXktc2VjcmV0LXRpdGxlJykudGV4dENvbnRlbnQgPSB0aXRsZTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGlzcGxheS1zZWNyZXQtY29udGVudCcpLnRleHRDb250ZW50ID0gc2VjcmV0O1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1kaXNwbGF5LXNlY3JldCcpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjbG9zZVNlY3JldE1vZGFsKCkge1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1kaXNwbGF5LXNlY3JldCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXNwbGF5LXNlY3JldC1jb250ZW50JykudGV4dENvbnRlbnQgPSAnJztcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVmlld1NlZWQoKSB7XHJcbiAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ1ZpZXcgU2VlZCBQaHJhc2UnLCAnRW50ZXIgeW91ciBwYXNzd29yZCB0byB2aWV3IHlvdXIgc2VlZCBwaHJhc2UnKTtcclxuICBpZiAoIXBhc3N3b3JkKSByZXR1cm47XHJcblxyXG4gIGNvbnN0IGVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1lcnJvcicpO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgbW5lbW9uaWMgPSBhd2FpdCBleHBvcnRNbmVtb25pYyhwYXNzd29yZCk7XHJcbiAgICBjbG9zZVBhc3N3b3JkUHJvbXB0KCk7XHJcblxyXG4gICAgaWYgKG1uZW1vbmljKSB7XHJcbiAgICAgIHNob3dTZWNyZXRNb2RhbCgnWW91ciBTZWVkIFBocmFzZScsIG1uZW1vbmljKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFsZXJ0KCdUaGlzIHdhbGxldCB3YXMgaW1wb3J0ZWQgdXNpbmcgYSBwcml2YXRlIGtleSBhbmQgaGFzIG5vIHNlZWQgcGhyYXNlLicpO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUV4cG9ydEtleSgpIHtcclxuICBjb25zdCBwYXNzd29yZCA9IGF3YWl0IHNob3dQYXNzd29yZFByb21wdCgnRXhwb3J0IFByaXZhdGUgS2V5JywgJ0VudGVyIHlvdXIgcGFzc3dvcmQgdG8gZXhwb3J0IHlvdXIgcHJpdmF0ZSBrZXknKTtcclxuICBpZiAoIXBhc3N3b3JkKSByZXR1cm47XHJcblxyXG4gIGNvbnN0IGVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1lcnJvcicpO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcHJpdmF0ZUtleSA9IGF3YWl0IGV4cG9ydFByaXZhdGVLZXkocGFzc3dvcmQpO1xyXG4gICAgY2xvc2VQYXNzd29yZFByb21wdCgpO1xyXG4gICAgc2hvd1NlY3JldE1vZGFsKCdZb3VyIFByaXZhdGUgS2V5JywgcHJpdmF0ZUtleSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbi8vID09PT09IE1VTFRJLVdBTExFVCBNQU5BR0VNRU5UID09PT09XHJcbmxldCBjdXJyZW50UmVuYW1lV2FsbGV0SWQgPSBudWxsO1xyXG5sZXQgZ2VuZXJhdGVkTW5lbW9uaWNNdWx0aSA9IG51bGw7XHJcbmxldCB2ZXJpZmljYXRpb25Xb3Jkc011bHRpID0gW107IC8vIEFycmF5IG9mIHtpbmRleCwgd29yZH0gZm9yIHZlcmlmaWNhdGlvblxyXG5cclxuLy8gUmVuZGVyIHdhbGxldCBsaXN0IGluIG1hbmFnZSB3YWxsZXRzIHNjcmVlblxyXG5hc3luYyBmdW5jdGlvbiByZW5kZXJXYWxsZXRMaXN0KCkge1xyXG4gIGNvbnN0IHdhbGxldHNEYXRhID0gYXdhaXQgZ2V0QWxsV2FsbGV0cygpO1xyXG4gIGNvbnN0IHdhbGxldExpc3REaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2FsbGV0LWxpc3QnKTtcclxuICBjb25zdCB3YWxsZXRDb3VudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3YWxsZXQtY291bnQnKTtcclxuXHJcbiAgd2FsbGV0Q291bnQudGV4dENvbnRlbnQgPSB3YWxsZXRzRGF0YS53YWxsZXRMaXN0Lmxlbmd0aDtcclxuXHJcbiAgaWYgKHdhbGxldHNEYXRhLndhbGxldExpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICB3YWxsZXRMaXN0RGl2LmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtZGltIHRleHQtY2VudGVyXCI+Tm8gd2FsbGV0cyBmb3VuZDwvcD4nO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgd2FsbGV0TGlzdERpdi5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgd2FsbGV0c0RhdGEud2FsbGV0TGlzdC5mb3JFYWNoKHdhbGxldCA9PiB7XHJcbiAgICBjb25zdCBpc0FjdGl2ZSA9IHdhbGxldC5pZCA9PT0gd2FsbGV0c0RhdGEuYWN0aXZlV2FsbGV0SWQ7XHJcbiAgICBjb25zdCB3YWxsZXRDYXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICB3YWxsZXRDYXJkLmNsYXNzTmFtZSA9ICdwYW5lbCBtYi0yJztcclxuICAgIGlmIChpc0FjdGl2ZSkge1xyXG4gICAgICB3YWxsZXRDYXJkLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXN1Y2Nlc3MpJztcclxuICAgICAgd2FsbGV0Q2FyZC5zdHlsZS5ib3JkZXJXaWR0aCA9ICcycHgnO1xyXG4gICAgfVxyXG5cclxuICAgIHdhbGxldENhcmQuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBhbGlnbi1pdGVtczogZmxleC1zdGFydDsgbWFyZ2luLWJvdHRvbTogMTJweDtcIj5cclxuICAgICAgICA8ZGl2IHN0eWxlPVwiZmxleDogMTtcIj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXdlaWdodDogYm9sZDsgZm9udC1zaXplOiAxNHB4OyBtYXJnaW4tYm90dG9tOiA0cHg7XCI+XHJcbiAgICAgICAgICAgICR7aXNBY3RpdmUgPyAn4pyTICcgOiAnJ30ke2VzY2FwZUh0bWwod2FsbGV0Lm5pY2tuYW1lIHx8ICdVbm5hbWVkIFdhbGxldCcpfVxyXG4gICAgICAgICAgICAke2lzQWN0aXZlID8gJzxzcGFuIGNsYXNzPVwidGV4dC1zdWNjZXNzXCIgc3R5bGU9XCJmb250LXNpemU6IDExcHg7IG1hcmdpbi1sZWZ0OiA4cHg7XCI+W0FDVElWRV08L3NwYW4+JyA6ICcnfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDsgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtbW9ubyk7IHdvcmQtYnJlYWs6IGJyZWFrLWFsbDtcIj5cclxuICAgICAgICAgICAgJHtlc2NhcGVIdG1sKHdhbGxldC5hZGRyZXNzIHx8ICdBZGRyZXNzIG5vdCBsb2FkZWQnKX1cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDEwcHg7IG1hcmdpbi10b3A6IDRweDtcIj5cclxuICAgICAgICAgICAgJHt3YWxsZXQuaW1wb3J0TWV0aG9kID09PSAnY3JlYXRlJyA/ICdDcmVhdGVkJyA6ICdJbXBvcnRlZCd9IOKAoiAke25ldyBEYXRlKHdhbGxldC5jcmVhdGVkQXQpLnRvTG9jYWxlRGF0ZVN0cmluZygpfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLWdyb3VwXCIgc3R5bGU9XCJnYXA6IDZweDtcIj5cclxuICAgICAgICAkeyFpc0FjdGl2ZSA/IGA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1zbWFsbFwiIGRhdGEtd2FsbGV0LWlkPVwiJHt3YWxsZXQuaWR9XCIgZGF0YS1hY3Rpb249XCJzd2l0Y2hcIj5TV0lUQ0g8L2J1dHRvbj5gIDogJyd9XHJcbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc21hbGxcIiBkYXRhLXdhbGxldC1pZD1cIiR7d2FsbGV0LmlkfVwiIGRhdGEtYWN0aW9uPVwicmVuYW1lXCI+UkVOQU1FPC9idXR0b24+XHJcbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc21hbGxcIiBkYXRhLXdhbGxldC1pZD1cIiR7d2FsbGV0LmlkfVwiIGRhdGEtYWN0aW9uPVwiZXhwb3J0XCI+RVhQT1JUPC9idXR0b24+XHJcbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tZGFuZ2VyIGJ0bi1zbWFsbFwiIGRhdGEtd2FsbGV0LWlkPVwiJHt3YWxsZXQuaWR9XCIgZGF0YS1hY3Rpb249XCJkZWxldGVcIj5ERUxFVEU8L2J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG5cclxuICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGJ1dHRvbnNcclxuICAgIGNvbnN0IGJ1dHRvbnMgPSB3YWxsZXRDYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpO1xyXG4gICAgYnV0dG9ucy5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgICAgICBjb25zdCB3YWxsZXRJZCA9IGJ0bi5kYXRhc2V0LndhbGxldElkO1xyXG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IGJ0bi5kYXRhc2V0LmFjdGlvbjtcclxuXHJcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcclxuICAgICAgICAgIGNhc2UgJ3N3aXRjaCc6XHJcbiAgICAgICAgICAgIGF3YWl0IGhhbmRsZVN3aXRjaFdhbGxldCh3YWxsZXRJZCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAncmVuYW1lJzpcclxuICAgICAgICAgICAgaGFuZGxlUmVuYW1lV2FsbGV0UHJvbXB0KHdhbGxldElkLCB3YWxsZXQubmlja25hbWUpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ2V4cG9ydCc6XHJcbiAgICAgICAgICAgIGF3YWl0IGhhbmRsZUV4cG9ydEZvcldhbGxldCh3YWxsZXRJZCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnZGVsZXRlJzpcclxuICAgICAgICAgICAgYXdhaXQgaGFuZGxlRGVsZXRlV2FsbGV0TXVsdGkod2FsbGV0SWQpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgd2FsbGV0TGlzdERpdi5hcHBlbmRDaGlsZCh3YWxsZXRDYXJkKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gTmF2aWdhdGUgdG8gbWFuYWdlIHdhbGxldHMgc2NyZWVuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZU1hbmFnZVdhbGxldHMoKSB7XHJcbiAgYXdhaXQgcmVuZGVyV2FsbGV0TGlzdCgpO1xyXG4gIHNob3dTY3JlZW4oJ3NjcmVlbi1tYW5hZ2Utd2FsbGV0cycpO1xyXG59XHJcblxyXG4vLyBTaG93IGFkZCB3YWxsZXQgbW9kYWwgKHdpdGggMyBvcHRpb25zKVxyXG5mdW5jdGlvbiBzaG93QWRkV2FsbGV0TW9kYWwoKSB7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWFkZC13YWxsZXQnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxufVxyXG5cclxuLy8gR2VuZXJhdGUgbW5lbW9uaWMgZm9yIG11bHRpLXdhbGxldCBjcmVhdGlvblxyXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZU5ld01uZW1vbmljTXVsdGkoKSB7XHJcbiAgY29uc3QgeyBldGhlcnMgfSA9IGF3YWl0IGltcG9ydCgnZXRoZXJzJyk7XHJcbiAgY29uc3QgcmFuZG9tV2FsbGV0ID0gZXRoZXJzLldhbGxldC5jcmVhdGVSYW5kb20oKTtcclxuICBnZW5lcmF0ZWRNbmVtb25pY011bHRpID0gcmFuZG9tV2FsbGV0Lm1uZW1vbmljLnBocmFzZTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXVsdGktbW5lbW9uaWMtZGlzcGxheScpLnRleHRDb250ZW50ID0gZ2VuZXJhdGVkTW5lbW9uaWNNdWx0aTtcclxuXHJcbiAgLy8gU2V0IHVwIHZlcmlmaWNhdGlvbiAoYXNrIGZvciAzIHJhbmRvbSB3b3JkcyB1c2luZyBjcnlwdG9ncmFwaGljYWxseSBzZWN1cmUgcmFuZG9tKVxyXG4gIGNvbnN0IHdvcmRzID0gZ2VuZXJhdGVkTW5lbW9uaWNNdWx0aS5zcGxpdCgnICcpO1xyXG4gIGNvbnN0IHJhbmRvbUJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoMyk7XHJcbiAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhyYW5kb21CeXRlcyk7XHJcbiAgY29uc3QgaW5kaWNlcyA9IFtcclxuICAgIHJhbmRvbUJ5dGVzWzBdICUgNCwgLy8gV29yZCAxLTRcclxuICAgIDQgKyAocmFuZG9tQnl0ZXNbMV0gJSA0KSwgLy8gV29yZCA1LThcclxuICAgIDggKyAocmFuZG9tQnl0ZXNbMl0gJSA0KSAvLyBXb3JkIDktMTJcclxuICBdO1xyXG5cclxuICB2ZXJpZmljYXRpb25Xb3Jkc011bHRpID0gaW5kaWNlcy5tYXAoaSA9PiAoeyBpbmRleDogaSwgd29yZDogd29yZHNbaV0gfSkpO1xyXG5cclxuICAvLyBVcGRhdGUgVUkgd2l0aCByYW5kb20gaW5kaWNlc1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0xLW51bS1tdWx0aScpLnRleHRDb250ZW50ID0gKHZlcmlmaWNhdGlvbldvcmRzTXVsdGlbMF0uaW5kZXggKyAxKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMi1udW0tbXVsdGknKS50ZXh0Q29udGVudCA9ICh2ZXJpZmljYXRpb25Xb3Jkc011bHRpWzFdLmluZGV4ICsgMSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTMtbnVtLW11bHRpJykudGV4dENvbnRlbnQgPSAodmVyaWZpY2F0aW9uV29yZHNNdWx0aVsyXS5pbmRleCArIDEpO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgY3JlYXRlIG5ldyB3YWxsZXQgKG11bHRpKVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDcmVhdGVOZXdXYWxsZXRNdWx0aSgpIHtcclxuICBjb25zdCBuaWNrbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1uZXctd2FsbGV0LW5pY2tuYW1lJykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IHZlcmlmaWNhdGlvbkVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmaWNhdGlvbi1lcnJvci1tdWx0aScpO1xyXG5cclxuICAvLyBWZXJpZnkgc2VlZCBwaHJhc2Ugd29yZHNcclxuICBjb25zdCB3b3JkMSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0xLW11bHRpJykudmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3Qgd29yZDIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMi1tdWx0aScpLnZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IHdvcmQzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTMtbXVsdGknKS52YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaWYgKCF3b3JkMSB8fCAhd29yZDIgfHwgIXdvcmQzKSB7XHJcbiAgICB2ZXJpZmljYXRpb25FcnJvckRpdi50ZXh0Q29udGVudCA9ICdQbGVhc2UgZW50ZXIgYWxsIHZlcmlmaWNhdGlvbiB3b3JkcyB0byBjb25maXJtIHlvdSBoYXZlIGJhY2tlZCB1cCB5b3VyIHNlZWQgcGhyYXNlLic7XHJcbiAgICB2ZXJpZmljYXRpb25FcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmICh3b3JkMSAhPT0gdmVyaWZpY2F0aW9uV29yZHNNdWx0aVswXS53b3JkLnRvTG93ZXJDYXNlKCkgfHxcclxuICAgICAgd29yZDIgIT09IHZlcmlmaWNhdGlvbldvcmRzTXVsdGlbMV0ud29yZC50b0xvd2VyQ2FzZSgpIHx8XHJcbiAgICAgIHdvcmQzICE9PSB2ZXJpZmljYXRpb25Xb3Jkc011bHRpWzJdLndvcmQudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYudGV4dENvbnRlbnQgPSAnVmVyaWZpY2F0aW9uIHdvcmRzIGRvIG5vdCBtYXRjaC4gUGxlYXNlIGRvdWJsZS1jaGVjayB5b3VyIHNlZWQgcGhyYXNlIGJhY2t1cC4nO1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBDbGVhciB2ZXJpZmljYXRpb24gZXJyb3JcclxuICB2ZXJpZmljYXRpb25FcnJvckRpdi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gQ2xvc2UgbW9kYWwgQkVGT1JFIHNob3dpbmcgcGFzc3dvcmQgcHJvbXB0XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWNyZWF0ZS13YWxsZXQtbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ0VudGVyIFlvdXIgUGFzc3dvcmQnLCAnRW50ZXIgeW91ciB3YWxsZXQgcGFzc3dvcmQgdG8gZW5jcnlwdCB0aGUgbmV3IHdhbGxldCcpO1xyXG5cclxuICBpZiAoIXBhc3N3b3JkKSB7XHJcbiAgICAvLyBJZiBjYW5jZWxsZWQsIHJlb3BlbiB0aGUgbW9kYWxcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1jcmVhdGUtd2FsbGV0LW11bHRpJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgYXdhaXQgYWRkV2FsbGV0KCdjcmVhdGUnLCB7fSwgcGFzc3dvcmQsIG5pY2tuYW1lIHx8IG51bGwpO1xyXG5cclxuICAgIC8vIENsZWFyIGZvcm1cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1uZXctd2FsbGV0LW5pY2tuYW1lJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0xLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0yLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGdlbmVyYXRlZE1uZW1vbmljTXVsdGkgPSBudWxsO1xyXG4gICAgdmVyaWZpY2F0aW9uV29yZHNNdWx0aSA9IFtdO1xyXG5cclxuICAgIC8vIFJlZnJlc2ggd2FsbGV0IGxpc3RcclxuICAgIGF3YWl0IHJlbmRlcldhbGxldExpc3QoKTtcclxuXHJcbiAgICBhbGVydCgnV2FsbGV0IGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5IScpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBhbGVydCgnRXJyb3IgY3JlYXRpbmcgd2FsbGV0OiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgaW1wb3J0IGZyb20gc2VlZCAobXVsdGkpXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUltcG9ydFNlZWRNdWx0aSgpIHtcclxuICBjb25zdCBuaWNrbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtc2VlZC1uaWNrbmFtZScpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCBtbmVtb25pYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtc2VlZC1waHJhc2UnKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgZXJyb3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1wb3J0LXNlZWQtZXJyb3ItbXVsdGknKTtcclxuXHJcbiAgZXJyb3JEaXYuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIGlmICghbW5lbW9uaWMpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gJ1BsZWFzZSBlbnRlciBhIHNlZWQgcGhyYXNlJztcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2xvc2UgbW9kYWwgQkVGT1JFIHNob3dpbmcgcGFzc3dvcmQgcHJvbXB0XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1zZWVkLW11bHRpJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgc2hvd1Bhc3N3b3JkUHJvbXB0KCdFbnRlciBZb3VyIFBhc3N3b3JkJywgJ0VudGVyIHlvdXIgd2FsbGV0IHBhc3N3b3JkIHRvIGVuY3J5cHQgdGhlIGltcG9ydGVkIHdhbGxldCcpO1xyXG5cclxuICBpZiAoIXBhc3N3b3JkKSB7XHJcbiAgICAvLyBJZiBjYW5jZWxsZWQsIHJlb3BlbiB0aGUgbW9kYWxcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1pbXBvcnQtc2VlZC1tdWx0aScpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IGFkZFdhbGxldCgnbW5lbW9uaWMnLCB7IG1uZW1vbmljIH0sIHBhc3N3b3JkLCBuaWNrbmFtZSB8fCBudWxsKTtcclxuXHJcbiAgICAvLyBDbGVhciBmb3JtXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXNlZWQtbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1zZWVkLXBocmFzZScpLnZhbHVlID0gJyc7XHJcblxyXG4gICAgLy8gUmVmcmVzaCB3YWxsZXQgbGlzdFxyXG4gICAgYXdhaXQgcmVuZGVyV2FsbGV0TGlzdCgpO1xyXG5cclxuICAgIGFsZXJ0KCdXYWxsZXQgaW1wb3J0ZWQgc3VjY2Vzc2Z1bGx5IScpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAvLyBTaG93IGVycm9yIGFuZCByZW9wZW4gbW9kYWxcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1zZWVkLW11bHRpJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgaW1wb3J0IGZyb20gcHJpdmF0ZSBrZXkgKG11bHRpKVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVJbXBvcnRLZXlNdWx0aSgpIHtcclxuICBjb25zdCBuaWNrbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQta2V5LW5pY2tuYW1lJykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IHByaXZhdGVLZXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXByaXZhdGUta2V5JykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IGVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1rZXktZXJyb3ItbXVsdGknKTtcclxuXHJcbiAgZXJyb3JEaXYuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIGlmICghcHJpdmF0ZUtleSkge1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSAnUGxlYXNlIGVudGVyIGEgcHJpdmF0ZSBrZXknO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBDbG9zZSBtb2RhbCBCRUZPUkUgc2hvd2luZyBwYXNzd29yZCBwcm9tcHRcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LWtleS1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICBjb25zdCBwYXNzd29yZCA9IGF3YWl0IHNob3dQYXNzd29yZFByb21wdCgnRW50ZXIgWW91ciBQYXNzd29yZCcsICdFbnRlciB5b3VyIHdhbGxldCBwYXNzd29yZCB0byBlbmNyeXB0IHRoZSBpbXBvcnRlZCB3YWxsZXQnKTtcclxuXHJcbiAgaWYgKCFwYXNzd29yZCkge1xyXG4gICAgLy8gSWYgY2FuY2VsbGVkLCByZW9wZW4gdGhlIG1vZGFsXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LWtleS1tdWx0aScpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IGFkZFdhbGxldCgncHJpdmF0ZWtleScsIHsgcHJpdmF0ZUtleSB9LCBwYXNzd29yZCwgbmlja25hbWUgfHwgbnVsbCk7XHJcblxyXG4gICAgLy8gQ2xlYXIgZm9ybVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1rZXktbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1wcml2YXRlLWtleScpLnZhbHVlID0gJyc7XHJcblxyXG4gICAgLy8gUmVmcmVzaCB3YWxsZXQgbGlzdFxyXG4gICAgYXdhaXQgcmVuZGVyV2FsbGV0TGlzdCgpO1xyXG5cclxuICAgIGFsZXJ0KCdXYWxsZXQgaW1wb3J0ZWQgc3VjY2Vzc2Z1bGx5IScpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAvLyBTaG93IGVycm9yIGFuZCByZW9wZW4gbW9kYWxcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1rZXktbXVsdGknKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFN3aXRjaCB0byBhIGRpZmZlcmVudCB3YWxsZXRcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3dpdGNoV2FsbGV0KHdhbGxldElkKSB7XHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IHNldEFjdGl2ZVdhbGxldCh3YWxsZXRJZCk7XHJcblxyXG4gICAgLy8gUmVmcmVzaCB3YWxsZXQgbGlzdCB0byBzaG93IG5ldyBhY3RpdmUgd2FsbGV0XHJcbiAgICBhd2FpdCByZW5kZXJXYWxsZXRMaXN0KCk7XHJcblxyXG4gICAgLy8gSWYgd2UncmUgdW5sb2NrZWQsIHVwZGF0ZSB0aGUgZGFzaGJvYXJkXHJcbiAgICBpZiAoY3VycmVudFN0YXRlLmlzVW5sb2NrZWQpIHtcclxuICAgICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICAgIGN1cnJlbnRTdGF0ZS5hZGRyZXNzID0gd2FsbGV0LmFkZHJlc3M7XHJcbiAgICAgIHVwZGF0ZURhc2hib2FyZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGFsZXJ0KCdTd2l0Y2hlZCB0byB3YWxsZXQgc3VjY2Vzc2Z1bGx5IScpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBhbGVydCgnRXJyb3Igc3dpdGNoaW5nIHdhbGxldDogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gU2hvdyByZW5hbWUgd2FsbGV0IHByb21wdFxyXG5mdW5jdGlvbiBoYW5kbGVSZW5hbWVXYWxsZXRQcm9tcHQod2FsbGV0SWQsIGN1cnJlbnROaWNrbmFtZSkge1xyXG4gIGN1cnJlbnRSZW5hbWVXYWxsZXRJZCA9IHdhbGxldElkO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1yZW5hbWUtd2FsbGV0LW5pY2tuYW1lJykudmFsdWUgPSBjdXJyZW50Tmlja25hbWUgfHwgJyc7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXJlbmFtZS13YWxsZXQnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxufVxyXG5cclxuLy8gQ29uZmlybSByZW5hbWUgd2FsbGV0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlbmFtZVdhbGxldENvbmZpcm0oKSB7XHJcbiAgY29uc3QgbmV3Tmlja25hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtcmVuYW1lLXdhbGxldC1uaWNrbmFtZScpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCBlcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZW5hbWUtZXJyb3InKTtcclxuXHJcbiAgZXJyb3JEaXYuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIGlmICghbmV3Tmlja25hbWUpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gJ05pY2tuYW1lIGNhbm5vdCBiZSBlbXB0eSc7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCByZW5hbWVXYWxsZXQoY3VycmVudFJlbmFtZVdhbGxldElkLCBuZXdOaWNrbmFtZSk7XHJcblxyXG4gICAgLy8gQ2xvc2UgbW9kYWxcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1yZW5hbWUtd2FsbGV0JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBjdXJyZW50UmVuYW1lV2FsbGV0SWQgPSBudWxsO1xyXG5cclxuICAgIC8vIFJlZnJlc2ggd2FsbGV0IGxpc3RcclxuICAgIGF3YWl0IHJlbmRlcldhbGxldExpc3QoKTtcclxuXHJcbiAgICBhbGVydCgnV2FsbGV0IHJlbmFtZWQgc3VjY2Vzc2Z1bGx5IScpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIERlbGV0ZSBhIHNwZWNpZmljIHdhbGxldFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVEZWxldGVXYWxsZXRNdWx0aSh3YWxsZXRJZCkge1xyXG4gIGNvbnN0IGNvbmZpcm1lZCA9IGNvbmZpcm0oXHJcbiAgICAn4pqg77iPIFdBUk5JTkcg4pqg77iPXFxuXFxuJyArXHJcbiAgICAnWW91IGFyZSBhYm91dCB0byBERUxFVEUgdGhpcyB3YWxsZXQhXFxuXFxuJyArXHJcbiAgICAnVGhpcyBhY3Rpb24gaXMgUEVSTUFORU5UIGFuZCBDQU5OT1QgYmUgdW5kb25lLlxcblxcbicgK1xyXG4gICAgJ01ha2Ugc3VyZSB5b3UgaGF2ZSB3cml0dGVuIGRvd24geW91ciBzZWVkIHBocmFzZSBvciBwcml2YXRlIGtleS5cXG5cXG4nICtcclxuICAgICdEbyB5b3Ugd2FudCB0byBjb250aW51ZT8nXHJcbiAgKTtcclxuXHJcbiAgaWYgKCFjb25maXJtZWQpIHJldHVybjtcclxuXHJcbiAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ0RlbGV0ZSBXYWxsZXQnLCAnRW50ZXIgeW91ciBwYXNzd29yZCB0byBkZWxldGUgdGhpcyB3YWxsZXQnKTtcclxuXHJcbiAgaWYgKCFwYXNzd29yZCkgcmV0dXJuO1xyXG5cclxuICB0cnkge1xyXG4gICAgYXdhaXQgZGVsZXRlV2FsbGV0KHdhbGxldElkLCBwYXNzd29yZCk7XHJcbiAgICBjbG9zZVBhc3N3b3JkUHJvbXB0KCk7XHJcblxyXG4gICAgLy8gUmVmcmVzaCB3YWxsZXQgbGlzdFxyXG4gICAgYXdhaXQgcmVuZGVyV2FsbGV0TGlzdCgpO1xyXG5cclxuICAgIC8vIElmIHdlIGRlbGV0ZWQgYWxsIHdhbGxldHMsIGdvIGJhY2sgdG8gc2V0dXBcclxuICAgIGNvbnN0IHdhbGxldHNEYXRhID0gYXdhaXQgZ2V0QWxsV2FsbGV0cygpO1xyXG4gICAgaWYgKHdhbGxldHNEYXRhLndhbGxldExpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGN1cnJlbnRTdGF0ZS5pc1VubG9ja2VkID0gZmFsc2U7XHJcbiAgICAgIGN1cnJlbnRTdGF0ZS5hZGRyZXNzID0gbnVsbDtcclxuICAgICAgc2hvd1NjcmVlbignc2NyZWVuLXNldHVwJyk7XHJcbiAgICB9XHJcblxyXG4gICAgYWxlcnQoJ1dhbGxldCBkZWxldGVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0Vycm9yIGRlbGV0aW5nIHdhbGxldDogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gRXhwb3J0IHNlZWQva2V5IGZvciBhIHNwZWNpZmljIHdhbGxldFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVFeHBvcnRGb3JXYWxsZXQod2FsbGV0SWQpIHtcclxuICBjb25zdCBwYXNzd29yZCA9IGF3YWl0IHNob3dQYXNzd29yZFByb21wdCgnRXhwb3J0IFdhbGxldCcsICdFbnRlciB5b3VyIHBhc3N3b3JkIHRvIGV4cG9ydCB3YWxsZXQgc2VjcmV0cycpO1xyXG5cclxuICBpZiAoIXBhc3N3b3JkKSByZXR1cm47XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBUcnkgdG8gZ2V0IG1uZW1vbmljIGZpcnN0XHJcbiAgICBjb25zdCBtbmVtb25pYyA9IGF3YWl0IGV4cG9ydE1uZW1vbmljRm9yV2FsbGV0KHdhbGxldElkLCBwYXNzd29yZCk7XHJcblxyXG4gICAgaWYgKG1uZW1vbmljKSB7XHJcbiAgICAgIHNob3dTZWNyZXRNb2RhbCgnU2VlZCBQaHJhc2UnLCBtbmVtb25pYyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBObyBtbmVtb25pYywgc2hvdyBwcml2YXRlIGtleVxyXG4gICAgICBjb25zdCBwcml2YXRlS2V5ID0gYXdhaXQgZXhwb3J0UHJpdmF0ZUtleUZvcldhbGxldCh3YWxsZXRJZCwgcGFzc3dvcmQpO1xyXG4gICAgICBzaG93U2VjcmV0TW9kYWwoJ1ByaXZhdGUgS2V5JywgcHJpdmF0ZUtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2VQYXNzd29yZFByb21wdCgpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBhbGVydCgnRXJyb3IgZXhwb3J0aW5nIHdhbGxldDogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gQ09OTkVDVElPTiBBUFBST1ZBTCA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDb25uZWN0aW9uQXBwcm92YWxTY3JlZW4ob3JpZ2luLCByZXF1ZXN0SWQpIHtcclxuICAvLyBMb2FkIHNldHRpbmdzIGZvciB0aGVtZVxyXG4gIGF3YWl0IGxvYWRTZXR0aW5ncygpO1xyXG4gIGFwcGx5VGhlbWUoKTtcclxuXHJcbiAgLy8gRGlzcGxheSB0aGUgb3JpZ2luXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nvbm5lY3Rpb24tc2l0ZS1vcmlnaW4nKS50ZXh0Q29udGVudCA9IG9yaWdpbjtcclxuXHJcbiAgLy8gR2V0IGFjdGl2ZSB3YWxsZXQgYWRkcmVzc1xyXG4gIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gIGlmICh3YWxsZXQgJiYgd2FsbGV0LmFkZHJlc3MpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb25uZWN0aW9uLXdhbGxldC1hZGRyZXNzJykudGV4dENvbnRlbnQgPSB3YWxsZXQuYWRkcmVzcztcclxuICB9IGVsc2Uge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nvbm5lY3Rpb24td2FsbGV0LWFkZHJlc3MnKS50ZXh0Q29udGVudCA9ICdObyB3YWxsZXQgZm91bmQnO1xyXG4gIH1cclxuXHJcbiAgLy8gU2hvdyB0aGUgY29ubmVjdGlvbiBhcHByb3ZhbCBzY3JlZW5cclxuICBzaG93U2NyZWVuKCdzY3JlZW4tY29ubmVjdGlvbi1hcHByb3ZhbCcpO1xyXG5cclxuICAvLyBTZXR1cCBhcHByb3ZlIGJ1dHRvblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS1jb25uZWN0aW9uJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogJ0NPTk5FQ1RJT05fQVBQUk9WQUwnLFxyXG4gICAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgICBhcHByb3ZlZDogdHJ1ZVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIENsb3NlIHRoZSBwb3B1cCB3aW5kb3dcclxuICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBhbGVydCgnRXJyb3IgYXBwcm92aW5nIGNvbm5lY3Rpb246ICcgKyBzYW5pdGl6ZUVycm9yKGVycm9yLm1lc3NhZ2UpKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gU2V0dXAgcmVqZWN0IGJ1dHRvblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVqZWN0LWNvbm5lY3Rpb24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnQ09OTkVDVElPTl9BUFBST1ZBTCcsXHJcbiAgICAgICAgcmVxdWVzdElkLFxyXG4gICAgICAgIGFwcHJvdmVkOiBmYWxzZVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIENsb3NlIHRoZSBwb3B1cCB3aW5kb3dcclxuICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBhbGVydCgnRXJyb3IgcmVqZWN0aW5nIGNvbm5lY3Rpb246ICcgKyBlcnJvci5tZXNzYWdlKTtcclxuICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vID09PT09IFRSQU5TQUNUSU9OIEFQUFJPVkFMID09PT09XHJcbi8vIFBvcHVsYXRlIGdhcyBwcmljZSBvcHRpb25zXHJcbmFzeW5jIGZ1bmN0aW9uIHBvcHVsYXRlR2FzUHJpY2VzKG5ldHdvcmssIHR4UmVxdWVzdCwgc3ltYm9sKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIEZldGNoIGN1cnJlbnQgZ2FzIHByaWNlIGZyb20gUlBDXHJcbiAgICBjb25zdCBnYXNQcmljZUhleCA9IGF3YWl0IHJwYy5nZXRHYXNQcmljZShuZXR3b3JrKTtcclxuICAgIGNvbnN0IGdhc1ByaWNlV2VpID0gQmlnSW50KGdhc1ByaWNlSGV4KTtcclxuICAgIGNvbnN0IGdhc1ByaWNlR3dlaSA9IE51bWJlcihnYXNQcmljZVdlaSkgLyAxZTk7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHNsb3cgKDgwJSksIG5vcm1hbCAoMTAwJSksIGZhc3QgKDE1MCUpXHJcbiAgICBjb25zdCBzbG93R3dlaSA9IChnYXNQcmljZUd3ZWkgKiAwLjgpLnRvRml4ZWQoMik7XHJcbiAgICBjb25zdCBub3JtYWxHd2VpID0gZ2FzUHJpY2VHd2VpLnRvRml4ZWQoMik7XHJcbiAgICBjb25zdCBmYXN0R3dlaSA9IChnYXNQcmljZUd3ZWkgKiAxLjUpLnRvRml4ZWQoMik7XHJcblxyXG4gICAgLy8gVXBkYXRlIFVJXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FzLXNsb3ctcHJpY2UnKS50ZXh0Q29udGVudCA9IGAke3Nsb3dHd2VpfSBHd2VpYDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtbm9ybWFsLXByaWNlJykudGV4dENvbnRlbnQgPSBgJHtub3JtYWxHd2VpfSBHd2VpYDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtZmFzdC1wcmljZScpLnRleHRDb250ZW50ID0gYCR7ZmFzdEd3ZWl9IEd3ZWlgO1xyXG5cclxuICAgIC8vIEVzdGltYXRlIGdhcyBmb3IgdGhlIHRyYW5zYWN0aW9uXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBlc3RpbWF0ZWRHYXNIZXggPSBhd2FpdCBycGMuZXN0aW1hdGVHYXMobmV0d29yaywgdHhSZXF1ZXN0KTtcclxuICAgICAgY29uc3QgZXN0aW1hdGVkR2FzID0gQmlnSW50KGVzdGltYXRlZEdhc0hleCk7XHJcblxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZXN0aW1hdGVkLWdhcycpLnRleHRDb250ZW50ID0gZXN0aW1hdGVkR2FzLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAvLyBDYWxjdWxhdGUgbWF4IGZlZSBiYXNlZCBvbiBub3JtYWwgZ2FzIHByaWNlXHJcbiAgICAgIGNvbnN0IG1heEZlZVdlaSA9IGVzdGltYXRlZEdhcyAqIGdhc1ByaWNlV2VpO1xyXG4gICAgICBjb25zdCBtYXhGZWVFdGggPSBldGhlcnMuZm9ybWF0RXRoZXIobWF4RmVlV2VpLnRvU3RyaW5nKCkpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtbWF4LWZlZScpLnRleHRDb250ZW50ID0gYCR7cGFyc2VGbG9hdChtYXhGZWVFdGgpLnRvRml4ZWQoOCl9ICR7c3ltYm9sfWA7XHJcblxyXG4gICAgICAvLyBVcGRhdGUgbWF4IGZlZSB3aGVuIGdhcyBwcmljZSBzZWxlY3Rpb24gY2hhbmdlc1xyXG4gICAgICBjb25zdCB1cGRhdGVNYXhGZWUgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRTcGVlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJnYXMtc3BlZWRcIl06Y2hlY2tlZCcpPy52YWx1ZTtcclxuICAgICAgICBsZXQgc2VsZWN0ZWRHd2VpO1xyXG5cclxuICAgICAgICBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ3Nsb3cnKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KHNsb3dHd2VpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdub3JtYWwnKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KG5vcm1hbEd3ZWkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2Zhc3QnKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KGZhc3RHd2VpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdjdXN0b20nKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXN0b20tZ2FzLXByaWNlJykudmFsdWUpIHx8IHBhcnNlRmxvYXQobm9ybWFsR3dlaSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQobm9ybWFsR3dlaSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzZWxlY3RlZEdhc1ByaWNlV2VpID0gQmlnSW50KE1hdGguZmxvb3Ioc2VsZWN0ZWRHd2VpICogMWU5KSk7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRNYXhGZWVXZWkgPSBlc3RpbWF0ZWRHYXMgKiBzZWxlY3RlZEdhc1ByaWNlV2VpO1xyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkTWF4RmVlRXRoID0gZXRoZXJzLmZvcm1hdEV0aGVyKHNlbGVjdGVkTWF4RmVlV2VpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1tYXgtZmVlJykudGV4dENvbnRlbnQgPSBgJHtwYXJzZUZsb2F0KHNlbGVjdGVkTWF4RmVlRXRoKS50b0ZpeGVkKDgpfSAke3N5bWJvbH1gO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgZ2FzIHByaWNlIGNoYW5nZXNcclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbbmFtZT1cImdhcy1zcGVlZFwiXScpLmZvckVhY2gocmFkaW8gPT4ge1xyXG4gICAgICAgIHJhZGlvLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcclxuICAgICAgICAgIHVwZGF0ZU1heEZlZSgpO1xyXG5cclxuICAgICAgICAgIC8vIFVwZGF0ZSB2aXN1YWwgaGlnaGxpZ2h0aW5nIGZvciBhbGwgZ2FzIG9wdGlvbnNcclxuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYXMtb3B0aW9uJykuZm9yRWFjaChsYWJlbCA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gbGFiZWwucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImdhcy1zcGVlZFwiXScpO1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQgJiYgaW5wdXQuY2hlY2tlZCkge1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXN1Y2Nlc3MpJztcclxuICAgICAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJXaWR0aCA9ICcycHgnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLWJvcmRlciknO1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlcldpZHRoID0gJzFweCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIC8vIFNob3cvaGlkZSBjdXN0b20gaW5wdXQgYmFzZWQgb24gc2VsZWN0aW9uXHJcbiAgICAgICAgICBjb25zdCBjdXN0b21Db250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VzdG9tLWdhcy1pbnB1dC1jb250YWluZXInKTtcclxuICAgICAgICAgIGlmIChyYWRpby52YWx1ZSA9PT0gJ2N1c3RvbScgJiYgcmFkaW8uY2hlY2tlZCkge1xyXG4gICAgICAgICAgICBjdXN0b21Db250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIC8vIEZvY3VzIHRoZSBpbnB1dCB3aGVuIGN1c3RvbSBpcyBzZWxlY3RlZFxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VzdG9tLWdhcy1wcmljZScpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGN1c3RvbUNvbnRhaW5lcikge1xyXG4gICAgICAgICAgICBjdXN0b21Db250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgc2VsZWN0ZWQgYm9yZGVyIChOb3JtYWwgaXMgY2hlY2tlZCBieSBkZWZhdWx0KVxyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FzLW9wdGlvbicpLmZvckVhY2gobGFiZWwgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gbGFiZWwucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImdhcy1zcGVlZFwiXScpO1xyXG4gICAgICAgIGlmIChpbnB1dCAmJiBpbnB1dC5jaGVja2VkKSB7XHJcbiAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJDb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1zdWNjZXNzKSc7XHJcbiAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJXaWR0aCA9ICcycHgnO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBBdXRvLXNlbGVjdCBjdXN0b20gcmFkaW8gd2hlbiB0eXBpbmcgaW4gY3VzdG9tIGdhcyBwcmljZVxyXG4gICAgICBjb25zdCBjdXN0b21HYXNJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXN0b20tZ2FzLXByaWNlJyk7XHJcbiAgICAgIGN1c3RvbUdhc0lucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtY3VzdG9tLXJhZGlvJykuY2hlY2tlZCA9IHRydWU7XHJcbiAgICAgICAgdXBkYXRlTWF4RmVlKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIH0gY2F0Y2ggKGdhc0VzdGltYXRlRXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZXN0aW1hdGluZyBnYXM6JywgZ2FzRXN0aW1hdGVFcnJvcik7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1lc3RpbWF0ZWQtZ2FzJykudGV4dENvbnRlbnQgPSAnMjEwMDAgKGRlZmF1bHQpJztcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LW1heC1mZWUnKS50ZXh0Q29udGVudCA9ICdVbmFibGUgdG8gZXN0aW1hdGUnO1xyXG4gICAgfVxyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZ2FzIHByaWNlOicsIGVycm9yKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtc2xvdy1wcmljZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtbm9ybWFsLXByaWNlJykudGV4dENvbnRlbnQgPSAnRXJyb3InO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhcy1mYXN0LXByaWNlJykudGV4dENvbnRlbnQgPSAnRXJyb3InO1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IHNlbGVjdGVkIGdhcyBwcmljZSBpbiB3ZWlcclxuZnVuY3Rpb24gZ2V0U2VsZWN0ZWRHYXNQcmljZSgpIHtcclxuICBjb25zdCBzZWxlY3RlZFNwZWVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImdhcy1zcGVlZFwiXTpjaGVja2VkJyk/LnZhbHVlO1xyXG5cclxuICBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2N1c3RvbScpIHtcclxuICAgIGNvbnN0IGN1c3RvbUd3ZWkgPSBwYXJzZUZsb2F0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXN0b20tZ2FzLXByaWNlJykudmFsdWUpO1xyXG4gICAgaWYgKGN1c3RvbUd3ZWkgJiYgY3VzdG9tR3dlaSA+IDApIHtcclxuICAgICAgLy8gQ29udmVydCBHd2VpIHRvIFdlaSAobXVsdGlwbHkgYnkgMWU5KVxyXG4gICAgICByZXR1cm4gZXRoZXJzLnBhcnNlVW5pdHMoY3VzdG9tR3dlaS50b1N0cmluZygpLCAnZ3dlaScpLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBHZXQgdGhlIGRpc3BsYXllZCBHd2VpIHZhbHVlIGFuZCBjb252ZXJ0IHRvIHdlaVxyXG4gIGxldCBnd2VpVGV4dDtcclxuICBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ3Nsb3cnKSB7XHJcbiAgICBnd2VpVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtc2xvdy1wcmljZScpLnRleHRDb250ZW50O1xyXG4gIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2Zhc3QnKSB7XHJcbiAgICBnd2VpVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtZmFzdC1wcmljZScpLnRleHRDb250ZW50O1xyXG4gIH0gZWxzZSB7XHJcbiAgICBnd2VpVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtbm9ybWFsLXByaWNlJykudGV4dENvbnRlbnQ7XHJcbiAgfVxyXG5cclxuICBjb25zdCBnd2VpID0gcGFyc2VGbG9hdChnd2VpVGV4dCk7XHJcbiAgaWYgKGd3ZWkgJiYgZ3dlaSA+IDApIHtcclxuICAgIHJldHVybiBldGhlcnMucGFyc2VVbml0cyhnd2VpLnRvU3RyaW5nKCksICdnd2VpJykudG9TdHJpbmcoKTtcclxuICB9XHJcblxyXG4gIC8vIElmIGFsbCBlbHNlIGZhaWxzLCByZXR1cm4gbnVsbCB0byB1c2UgZGVmYXVsdFxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcblxyXG4vLyBGZXRjaCBhbmQgZGlzcGxheSBjdXJyZW50IG5vbmNlIGZvciB0cmFuc2FjdGlvblxyXG5hc3luYyBmdW5jdGlvbiBmZXRjaEFuZERpc3BsYXlOb25jZShhZGRyZXNzLCBuZXR3b3JrKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5vbmNlSGV4ID0gYXdhaXQgcnBjLmdldFRyYW5zYWN0aW9uQ291bnQobmV0d29yaywgYWRkcmVzcywgJ3BlbmRpbmcnKTtcclxuICAgIGNvbnN0IG5vbmNlID0gcGFyc2VJbnQobm9uY2VIZXgsIDE2KTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXJyZW50LW5vbmNlJykudGV4dENvbnRlbnQgPSBub25jZTtcclxuICAgIC8vIEN1cnJlbnQgbm9uY2UgZmV0Y2hlZFxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBub25jZTonLCBlcnJvcik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VycmVudC1ub25jZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRyYW5zYWN0aW9uQXBwcm92YWxTY3JlZW4ocmVxdWVzdElkKSB7XHJcbiAgLy8gTG9hZCBzZXR0aW5ncyBmb3IgdGhlbWVcclxuICBhd2FpdCBsb2FkU2V0dGluZ3MoKTtcclxuICBhcHBseVRoZW1lKCk7XHJcblxyXG4gIC8vIEdldCB0cmFuc2FjdGlvbiByZXF1ZXN0IGRldGFpbHMgZnJvbSBiYWNrZ3JvdW5kXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX1RSQU5TQUNUSU9OX1JFUVVFU1QnLFxyXG4gICAgICByZXF1ZXN0SWRcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghcmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICBhbGVydCgnVHJhbnNhY3Rpb24gcmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcpO1xyXG4gICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgb3JpZ2luLCB0eFJlcXVlc3QgfSA9IHJlc3BvbnNlO1xyXG5cclxuICAgIC8vIEdldCBhY3RpdmUgd2FsbGV0XHJcbiAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBsb2FkKCdjdXJyZW50TmV0d29yaycpIHx8ICdwdWxzZWNoYWluVGVzdG5ldCc7XHJcblxyXG4gICAgLy8gUG9wdWxhdGUgdHJhbnNhY3Rpb24gZGV0YWlsc1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXNpdGUtb3JpZ2luJykudGV4dENvbnRlbnQgPSBvcmlnaW47XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZnJvbS1hZGRyZXNzJykudGV4dENvbnRlbnQgPSB3YWxsZXQ/LmFkZHJlc3MgfHwgJzB4MDAwMC4uLjAwMDAnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXRvLWFkZHJlc3MnKS50ZXh0Q29udGVudCA9IHR4UmVxdWVzdC50byB8fCAnQ29udHJhY3QgQ3JlYXRpb24nO1xyXG5cclxuICAgIC8vIEZvcm1hdCB2YWx1ZVxyXG4gICAgY29uc3Qgc3ltYm9scyA9IHtcclxuICAgICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3RQTFMnLFxyXG4gICAgICAncHVsc2VjaGFpbic6ICdQTFMnLFxyXG4gICAgICAnZXRoZXJldW0nOiAnRVRIJyxcclxuICAgICAgJ3NlcG9saWEnOiAnU0VQJ1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHN5bWJvbCA9IHN5bWJvbHNbbmV0d29ya10gfHwgJ1RPS0VOJztcclxuXHJcbiAgICBpZiAodHhSZXF1ZXN0LnZhbHVlKSB7XHJcbiAgICAgIGNvbnN0IHZhbHVlID0gZXRoZXJzLmZvcm1hdEV0aGVyKHR4UmVxdWVzdC52YWx1ZSk7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC12YWx1ZScpLnRleHRDb250ZW50ID0gYCR7dmFsdWV9ICR7c3ltYm9sfWA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtdmFsdWUnKS50ZXh0Q29udGVudCA9IGAwICR7c3ltYm9sfWA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2hvdyBkYXRhIHNlY3Rpb24gaWYgdGhlcmUncyBjb250cmFjdCBkYXRhXHJcbiAgICBpZiAodHhSZXF1ZXN0LmRhdGEgJiYgdHhSZXF1ZXN0LmRhdGEgIT09ICcweCcpIHtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRhdGEtc2VjdGlvbicpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGF0YScpLnRleHRDb250ZW50ID0gdHhSZXF1ZXN0LmRhdGE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGF0YS1zZWN0aW9uJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2hvdyB0aGUgdHJhbnNhY3Rpb24gYXBwcm92YWwgc2NyZWVuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tdHJhbnNhY3Rpb24tYXBwcm92YWwnKTtcclxuXHJcbiAgICAvLyBGZXRjaCBhbmQgcG9wdWxhdGUgZ2FzIHByaWNlIG9wdGlvbnNcclxuICAgIGF3YWl0IHBvcHVsYXRlR2FzUHJpY2VzKG5ldHdvcmssIHR4UmVxdWVzdCwgc3ltYm9sKTtcclxuXHJcbiAgICAvLyBGZXRjaCBhbmQgZGlzcGxheSBjdXJyZW50IG5vbmNlXHJcbiAgICBhd2FpdCBmZXRjaEFuZERpc3BsYXlOb25jZSh3YWxsZXQuYWRkcmVzcywgbmV0d29yayk7XHJcblxyXG4gICAgLy8gU2V0dXAgY3VzdG9tIG5vbmNlIGNoZWNrYm94XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VzdG9tLW5vbmNlLWNoZWNrYm94JykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N1c3RvbS1ub25jZS1pbnB1dC1jb250YWluZXInKTtcclxuICAgICAgaWYgKGUudGFyZ2V0LmNoZWNrZWQpIHtcclxuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgLy8gUHJlLWZpbGwgd2l0aCBjdXJyZW50IG5vbmNlXHJcbiAgICAgICAgY29uc3QgY3VycmVudE5vbmNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWN1cnJlbnQtbm9uY2UnKS50ZXh0Q29udGVudDtcclxuICAgICAgICBpZiAoY3VycmVudE5vbmNlICE9PSAnLS0nKSB7XHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VzdG9tLW5vbmNlJykudmFsdWUgPSBjdXJyZW50Tm9uY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2V0dXAgYXBwcm92ZSBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS10cmFuc2FjdGlvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBhcHByb3ZlQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1hcHByb3ZlLXRyYW5zYWN0aW9uJyk7XHJcbiAgICAgIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXBhc3N3b3JkJykudmFsdWU7XHJcbiAgICAgIGNvbnN0IGVycm9yRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZXJyb3InKTtcclxuXHJcbiAgICAgIGlmICghcGFzc3dvcmQpIHtcclxuICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ1BsZWFzZSBlbnRlciB5b3VyIHBhc3N3b3JkJztcclxuICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRGlzYWJsZSBidXR0b24gaW1tZWRpYXRlbHkgdG8gcHJldmVudCBkb3VibGUtY2xpY2tpbmdcclxuICAgICAgYXBwcm92ZUJ0bi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgIGFwcHJvdmVCdG4uc3R5bGUub3BhY2l0eSA9ICcwLjUnO1xyXG4gICAgICBhcHByb3ZlQnRuLnN0eWxlLmN1cnNvciA9ICdub3QtYWxsb3dlZCc7XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhIHRlbXBvcmFyeSBzZXNzaW9uIGZvciB0aGlzIHRyYW5zYWN0aW9uIHVzaW5nIHRoZSBlbnRlcmVkIHBhc3N3b3JkXHJcbiAgICAgICAgLy8gVGhpcyB2YWxpZGF0ZXMgdGhlIHBhc3N3b3JkIHdpdGhvdXQgcGFzc2luZyBpdCBmb3IgdGhlIGFjdHVhbCB0cmFuc2FjdGlvblxyXG4gICAgICAgIGNvbnN0IGFjdGl2ZVdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBTZXNzaW9uUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnQ1JFQVRFX1NFU1NJT04nLFxyXG4gICAgICAgICAgcGFzc3dvcmQsXHJcbiAgICAgICAgICB3YWxsZXRJZDogYWN0aXZlV2FsbGV0LmlkLFxyXG4gICAgICAgICAgZHVyYXRpb25NczogNjAwMDAgLy8gMSBtaW51dGUgdGVtcG9yYXJ5IHNlc3Npb25cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKCF0ZW1wU2Vzc2lvblJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwYXNzd29yZCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gR2V0IHNlbGVjdGVkIGdhcyBwcmljZVxyXG4gICAgICAgIGNvbnN0IGdhc1ByaWNlID0gZ2V0U2VsZWN0ZWRHYXNQcmljZSgpO1xyXG5cclxuICAgICAgICAvLyBHZXQgY3VzdG9tIG5vbmNlIGlmIHByb3ZpZGVkXHJcbiAgICAgICAgY29uc3QgY3VzdG9tTm9uY2VDaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXN0b20tbm9uY2UtY2hlY2tib3gnKTtcclxuICAgICAgICBjb25zdCBjdXN0b21Ob25jZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWN1c3RvbS1ub25jZScpO1xyXG4gICAgICAgIGxldCBjdXN0b21Ob25jZSA9IG51bGw7XHJcbiAgICAgICAgaWYgKGN1c3RvbU5vbmNlQ2hlY2tib3guY2hlY2tlZCAmJiBjdXN0b21Ob25jZUlucHV0LnZhbHVlKSB7XHJcbiAgICAgICAgICBjdXN0b21Ob25jZSA9IHBhcnNlSW50KGN1c3RvbU5vbmNlSW5wdXQudmFsdWUpO1xyXG4gICAgICAgICAgaWYgKGlzTmFOKGN1c3RvbU5vbmNlKSB8fCBjdXN0b21Ob25jZSA8IDApIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGN1c3RvbSBub25jZScpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnVFJBTlNBQ1RJT05fQVBQUk9WQUwnLFxyXG4gICAgICAgICAgcmVxdWVzdElkLFxyXG4gICAgICAgICAgYXBwcm92ZWQ6IHRydWUsXHJcbiAgICAgICAgICBzZXNzaW9uVG9rZW46IHRlbXBTZXNzaW9uUmVzcG9uc2Uuc2Vzc2lvblRva2VuLFxyXG4gICAgICAgICAgZ2FzUHJpY2UsXHJcbiAgICAgICAgICBjdXN0b21Ob25jZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgLy8gSGlkZSBhcHByb3ZhbCBmb3JtIGFuZCBzaG93IHN0YXR1cyBzZWN0aW9uXHJcbiAgICAgICAgICBzaG93VHJhbnNhY3Rpb25TdGF0dXMocmVzcG9uc2UudHhIYXNoLCBhY3RpdmVXYWxsZXQuYWRkcmVzcywgcmVxdWVzdElkKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IHJlc3BvbnNlLmVycm9yIHx8ICdUcmFuc2FjdGlvbiBmYWlsZWQnO1xyXG4gICAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAgIC8vIFJlLWVuYWJsZSBidXR0b24gb24gZXJyb3Igc28gdXNlciBjYW4gdHJ5IGFnYWluXHJcbiAgICAgICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIGVycm9yIHNvIHVzZXIgY2FuIHRyeSBhZ2FpblxyXG4gICAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNldHVwIHJlamVjdCBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVqZWN0LXRyYW5zYWN0aW9uJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgdHlwZTogJ1RSQU5TQUNUSU9OX0FQUFJPVkFMJyxcclxuICAgICAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgICAgIGFwcHJvdmVkOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBDbG9zZSB0aGUgcG9wdXAgd2luZG93XHJcbiAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgYWxlcnQoJ0Vycm9yIHJlamVjdGluZyB0cmFuc2FjdGlvbjogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGFsZXJ0KCdFcnJvciBsb2FkaW5nIHRyYW5zYWN0aW9uOiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgICB3aW5kb3cuY2xvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFRPS0VOIEFERCBBUFBST1ZBTCA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUb2tlbkFkZEFwcHJvdmFsU2NyZWVuKHJlcXVlc3RJZCkge1xyXG4gIC8vIExvYWQgc2V0dGluZ3MgZm9yIHRoZW1lXHJcbiAgYXdhaXQgbG9hZFNldHRpbmdzKCk7XHJcbiAgYXBwbHlUaGVtZSgpO1xyXG5cclxuICAvLyBHZXQgdG9rZW4gYWRkIHJlcXVlc3QgZGV0YWlscyBmcm9tIGJhY2tncm91bmRcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdHRVRfVE9LRU5fQUREX1JFUVVFU1QnLFxyXG4gICAgICByZXF1ZXN0SWRcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghcmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICBhbGVydCgnVG9rZW4gYWRkIHJlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnKTtcclxuICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB7IG9yaWdpbiwgdG9rZW5JbmZvIH0gPSByZXNwb25zZTtcclxuXHJcbiAgICAvLyBQb3B1bGF0ZSB0b2tlbiBkZXRhaWxzXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tc2l0ZS1vcmlnaW4nKS50ZXh0Q29udGVudCA9IG9yaWdpbjtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1zeW1ib2wnKS50ZXh0Q29udGVudCA9IHRva2VuSW5mby5zeW1ib2w7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tYWRkcmVzcycpLnRleHRDb250ZW50ID0gdG9rZW5JbmZvLmFkZHJlc3M7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGVjaW1hbHMnKS50ZXh0Q29udGVudCA9IHRva2VuSW5mby5kZWNpbWFscztcclxuXHJcbiAgICAvLyBTaG93IHRva2VuIGltYWdlIGlmIHByb3ZpZGVkXHJcbiAgICBpZiAodG9rZW5JbmZvLmltYWdlKSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1pbWFnZScpLnNyYyA9IHRva2VuSW5mby5pbWFnZTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWltYWdlLXNlY3Rpb24nKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1pbWFnZS1zZWN0aW9uJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2hvdyB0aGUgdG9rZW4gYXBwcm92YWwgc2NyZWVuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tYWRkLXRva2VuJyk7XHJcblxyXG4gICAgLy8gU2V0dXAgYXBwcm92ZSBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS10b2tlbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBhcHByb3ZlQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1hcHByb3ZlLXRva2VuJyk7XHJcbiAgICAgIGNvbnN0IGVycm9yRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZXJyb3InKTtcclxuXHJcbiAgICAgIC8vIERpc2FibGUgYnV0dG9uIGltbWVkaWF0ZWx5IHRvIHByZXZlbnQgZG91YmxlLWNsaWNraW5nXHJcbiAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMC41JztcclxuICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAnbm90LWFsbG93ZWQnO1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBTZW5kIGFwcHJvdmFsIHRvIGJhY2tncm91bmRcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICAgIHR5cGU6ICdUT0tFTl9BRERfQVBQUk9WQUwnLFxyXG4gICAgICAgICAgcmVxdWVzdElkLFxyXG4gICAgICAgICAgYXBwcm92ZWQ6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIC8vIEFkZCB0aGUgdG9rZW4gdG8gc3RvcmFnZSB1c2luZyBleGlzdGluZyB0b2tlbiBtYW5hZ2VtZW50XHJcbiAgICAgICAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgbG9hZCgnY3VycmVudE5ldHdvcmsnKSB8fCAncHVsc2VjaGFpblRlc3RuZXQnO1xyXG4gICAgICAgICAgYXdhaXQgdG9rZW5zLmFkZEN1c3RvbVRva2VuKG5ldHdvcmssIHRva2VuSW5mby5hZGRyZXNzLCB0b2tlbkluZm8uc3ltYm9sLCB0b2tlbkluZm8uZGVjaW1hbHMpO1xyXG5cclxuICAgICAgICAgIC8vIENsb3NlIHRoZSBwb3B1cCB3aW5kb3dcclxuICAgICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gcmVzcG9uc2UuZXJyb3IgfHwgJ0ZhaWxlZCB0byBhZGQgdG9rZW4nO1xyXG4gICAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAgIC8vIFJlLWVuYWJsZSBidXR0b24gb24gZXJyb3Igc28gdXNlciBjYW4gdHJ5IGFnYWluXHJcbiAgICAgICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIGVycm9yIHNvIHVzZXIgY2FuIHRyeSBhZ2FpblxyXG4gICAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNldHVwIHJlamVjdCBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVqZWN0LXRva2VuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgdHlwZTogJ1RPS0VOX0FERF9BUFBST1ZBTCcsXHJcbiAgICAgICAgICByZXF1ZXN0SWQsXHJcbiAgICAgICAgICBhcHByb3ZlZDogZmFsc2VcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQ2xvc2UgdGhlIHBvcHVwIHdpbmRvd1xyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGFsZXJ0KCdFcnJvciByZWplY3RpbmcgdG9rZW46ICcgKyBlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBhbGVydCgnRXJyb3IgbG9hZGluZyB0b2tlbiBhZGQgcmVxdWVzdDogJyArIHNhbml0aXplRXJyb3IoZXJyb3IubWVzc2FnZSkpO1xyXG4gICAgd2luZG93LmNsb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBNRVNTQUdFIFNJR05JTkcgQVBQUk9WQUwgSEFORExFUlMgPT09PT1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2VTaWduQXBwcm92YWxTY3JlZW4ocmVxdWVzdElkKSB7XHJcbiAgLy8gTG9hZCBzZXR0aW5ncyBmb3IgdGhlbWVcclxuICBhd2FpdCBsb2FkU2V0dGluZ3MoKTtcclxuICBhcHBseVRoZW1lKCk7XHJcblxyXG4gIC8vIEdldCBzaWduIHJlcXVlc3QgZGV0YWlscyBmcm9tIGJhY2tncm91bmRcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdHRVRfU0lHTl9SRVFVRVNUJyxcclxuICAgICAgcmVxdWVzdElkXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5vcmlnaW4pIHtcclxuICAgICAgYWxlcnQoJ1NpZ24gcmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcpO1xyXG4gICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgb3JpZ2luLCBtZXRob2QsIHNpZ25SZXF1ZXN0IH0gPSByZXNwb25zZTtcclxuICAgIGNvbnN0IHsgbWVzc2FnZSwgYWRkcmVzcyB9ID0gc2lnblJlcXVlc3Q7XHJcblxyXG4gICAgLy8gUG9wdWxhdGUgc2lnbiBkZXRhaWxzXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi1zaXRlLW9yaWdpbicpLnRleHRDb250ZW50ID0gb3JpZ2luO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tYWRkcmVzcycpLnRleHRDb250ZW50ID0gYWRkcmVzcztcclxuXHJcbiAgICAvLyBGb3JtYXQgbWVzc2FnZSBmb3IgZGlzcGxheVxyXG4gICAgY29uc3QgbWVzc2FnZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tbWVzc2FnZS1jb250ZW50Jyk7XHJcbiAgICBsZXQgZGlzcGxheU1lc3NhZ2UgPSBtZXNzYWdlO1xyXG5cclxuICAgIC8vIENoZWNrIGlmIG1lc3NhZ2UgaXMgaGV4LWVuY29kZWRcclxuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgbWVzc2FnZS5zdGFydHNXaXRoKCcweCcpKSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLW1lc3NhZ2UtaGV4LXdhcm5pbmcnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgLy8gVHJ5IHRvIGRlY29kZSBpZiBpdCdzIHJlYWRhYmxlIHRleHRcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBieXRlcyA9IGV0aGVycy5nZXRCeXRlcyhtZXNzYWdlKTtcclxuICAgICAgICBjb25zdCBkZWNvZGVkID0gZXRoZXJzLnRvVXRmOFN0cmluZyhieXRlcyk7XHJcbiAgICAgICAgaWYgKC9eW1xceDIwLVxceDdFXFxzXSskLy50ZXN0KGRlY29kZWQpKSB7XHJcbiAgICAgICAgICBkaXNwbGF5TWVzc2FnZSA9IGRlY29kZWQgKyAnXFxuXFxuW0hleDogJyArIG1lc3NhZ2UgKyAnXSc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICAvLyBLZWVwIGFzIGhleCBpZiBkZWNvZGluZyBmYWlsc1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi1tZXNzYWdlLWhleC13YXJuaW5nJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgbWVzc2FnZUVsLnRleHRDb250ZW50ID0gZGlzcGxheU1lc3NhZ2U7XHJcblxyXG4gICAgLy8gU2hvdyB0aGUgc2lnbmluZyBhcHByb3ZhbCBzY3JlZW5cclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1zaWduLW1lc3NhZ2UnKTtcclxuXHJcbiAgICAvLyBTZXR1cCBhcHByb3ZlIGJ1dHRvblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1hcHByb3ZlLXNpZ24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgICAgY29uc3QgYXBwcm92ZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS1zaWduJyk7XHJcbiAgICAgIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tcGFzc3dvcmQnKS52YWx1ZTtcclxuICAgICAgY29uc3QgZXJyb3JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLWVycm9yJyk7XHJcblxyXG4gICAgICBpZiAoIXBhc3N3b3JkKSB7XHJcbiAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdQbGVhc2UgZW50ZXIgeW91ciBwYXNzd29yZCc7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIERpc2FibGUgYnV0dG9uIGltbWVkaWF0ZWx5IHRvIHByZXZlbnQgZG91YmxlLWNsaWNraW5nXHJcbiAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMC41JztcclxuICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAnbm90LWFsbG93ZWQnO1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgYSB0ZW1wb3Jhcnkgc2Vzc2lvbiBmb3IgdGhpcyBzaWduaW5nIHVzaW5nIHRoZSBlbnRlcmVkIHBhc3N3b3JkXHJcbiAgICAgICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICAgICAgY29uc3QgdGVtcFNlc3Npb25SZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICAgIHR5cGU6ICdDUkVBVEVfU0VTU0lPTicsXHJcbiAgICAgICAgICBwYXNzd29yZCxcclxuICAgICAgICAgIHdhbGxldElkOiBhY3RpdmVXYWxsZXQuaWQsXHJcbiAgICAgICAgICBkdXJhdGlvbk1zOiA2MDAwMCAvLyAxIG1pbnV0ZSB0ZW1wb3Jhcnkgc2Vzc2lvblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoIXRlbXBTZXNzaW9uUmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHBhc3N3b3JkJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICAgIHR5cGU6ICdTSUdOX0FQUFJPVkFMJyxcclxuICAgICAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgICAgIGFwcHJvdmVkOiB0cnVlLFxyXG4gICAgICAgICAgc2Vzc2lvblRva2VuOiB0ZW1wU2Vzc2lvblJlc3BvbnNlLnNlc3Npb25Ub2tlblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgLy8gQ2xvc2UgdGhlIHBvcHVwIHdpbmRvd1xyXG4gICAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSByZXNwb25zZS5lcnJvciB8fCAnU2lnbmluZyBmYWlsZWQnO1xyXG4gICAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAgIC8vIFJlLWVuYWJsZSBidXR0b24gb24gZXJyb3Igc28gdXNlciBjYW4gdHJ5IGFnYWluXHJcbiAgICAgICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIGVycm9yIHNvIHVzZXIgY2FuIHRyeSBhZ2FpblxyXG4gICAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNldHVwIHJlamVjdCBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVqZWN0LXNpZ24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnU0lHTl9BUFBST1ZBTCcsXHJcbiAgICAgICAgICByZXF1ZXN0SWQsXHJcbiAgICAgICAgICBhcHByb3ZlZDogZmFsc2VcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQ2xvc2UgdGhlIHBvcHVwIHdpbmRvd1xyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGFsZXJ0KCdFcnJvciByZWplY3Rpbmcgc2lnbiByZXF1ZXN0OiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0Vycm9yIGxvYWRpbmcgc2lnbiByZXF1ZXN0OiAnICsgc2FuaXRpemVFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICB3aW5kb3cuY2xvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVR5cGVkRGF0YVNpZ25BcHByb3ZhbFNjcmVlbihyZXF1ZXN0SWQpIHtcclxuICAvLyBMb2FkIHNldHRpbmdzIGZvciB0aGVtZVxyXG4gIGF3YWl0IGxvYWRTZXR0aW5ncygpO1xyXG4gIGFwcGx5VGhlbWUoKTtcclxuXHJcbiAgLy8gR2V0IHNpZ24gcmVxdWVzdCBkZXRhaWxzIGZyb20gYmFja2dyb3VuZFxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0dFVF9TSUdOX1JFUVVFU1QnLFxyXG4gICAgICByZXF1ZXN0SWRcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLm9yaWdpbikge1xyXG4gICAgICBhbGVydCgnU2lnbiByZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyk7XHJcbiAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyBvcmlnaW4sIG1ldGhvZCwgc2lnblJlcXVlc3QgfSA9IHJlc3BvbnNlO1xyXG4gICAgY29uc3QgeyB0eXBlZERhdGEsIGFkZHJlc3MgfSA9IHNpZ25SZXF1ZXN0O1xyXG5cclxuICAgIC8vIFBvcHVsYXRlIHNpZ24gZGV0YWlsc1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tdHlwZWQtc2l0ZS1vcmlnaW4nKS50ZXh0Q29udGVudCA9IG9yaWdpbjtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLXR5cGVkLWFkZHJlc3MnKS50ZXh0Q29udGVudCA9IGFkZHJlc3M7XHJcblxyXG4gICAgLy8gUG9wdWxhdGUgZG9tYWluIGluZm9ybWF0aW9uXHJcbiAgICBpZiAodHlwZWREYXRhLmRvbWFpbikge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi10eXBlZC1kb21haW4tbmFtZScpLnRleHRDb250ZW50ID0gdHlwZWREYXRhLmRvbWFpbi5uYW1lIHx8ICdVbmtub3duJztcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tdHlwZWQtZG9tYWluLWNoYWluJykudGV4dENvbnRlbnQgPSB0eXBlZERhdGEuZG9tYWluLmNoYWluSWQgfHwgJy0tJztcclxuXHJcbiAgICAgIGlmICh0eXBlZERhdGEuZG9tYWluLnZlcmlmeWluZ0NvbnRyYWN0KSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tdHlwZWQtZG9tYWluLWNvbnRyYWN0JykudGV4dENvbnRlbnQgPSB0eXBlZERhdGEuZG9tYWluLnZlcmlmeWluZ0NvbnRyYWN0O1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLXR5cGVkLWRvbWFpbi1jb250cmFjdC1yb3cnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi10eXBlZC1kb21haW4tY29udHJhY3Qtcm93JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBGb3JtYXQgdHlwZWQgZGF0YSBmb3IgZGlzcGxheVxyXG4gICAgY29uc3QgbWVzc2FnZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tdHlwZWQtbWVzc2FnZS1jb250ZW50Jyk7XHJcbiAgICBjb25zdCBkaXNwbGF5RGF0YSA9IHtcclxuICAgICAgcHJpbWFyeVR5cGU6IHR5cGVkRGF0YS5wcmltYXJ5VHlwZSB8fCAnVW5rbm93bicsXHJcbiAgICAgIG1lc3NhZ2U6IHR5cGVkRGF0YS5tZXNzYWdlXHJcbiAgICB9O1xyXG4gICAgbWVzc2FnZUVsLnRleHRDb250ZW50ID0gSlNPTi5zdHJpbmdpZnkoZGlzcGxheURhdGEsIG51bGwsIDIpO1xyXG5cclxuICAgIC8vIFNob3cgdGhlIHNpZ25pbmcgYXBwcm92YWwgc2NyZWVuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tc2lnbi10eXBlZC1kYXRhJyk7XHJcblxyXG4gICAgLy8gU2V0dXAgYXBwcm92ZSBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS1zaWduLXR5cGVkJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFwcHJvdmVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWFwcHJvdmUtc2lnbi10eXBlZCcpO1xyXG4gICAgICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLXR5cGVkLXBhc3N3b3JkJykudmFsdWU7XHJcbiAgICAgIGNvbnN0IGVycm9yRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi10eXBlZC1lcnJvcicpO1xyXG5cclxuICAgICAgaWYgKCFwYXNzd29yZCkge1xyXG4gICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSAnUGxlYXNlIGVudGVyIHlvdXIgcGFzc3dvcmQnO1xyXG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBEaXNhYmxlIGJ1dHRvbiBpbW1lZGlhdGVseSB0byBwcmV2ZW50IGRvdWJsZS1jbGlja2luZ1xyXG4gICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzAuNSc7XHJcbiAgICAgIGFwcHJvdmVCdG4uc3R5bGUuY3Vyc29yID0gJ25vdC1hbGxvd2VkJztcclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IHNlc3Npb24gZm9yIHRoaXMgc2lnbmluZyB1c2luZyB0aGUgZW50ZXJlZCBwYXNzd29yZFxyXG4gICAgICAgIGNvbnN0IGFjdGl2ZVdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBTZXNzaW9uUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnQ1JFQVRFX1NFU1NJT04nLFxyXG4gICAgICAgICAgcGFzc3dvcmQsXHJcbiAgICAgICAgICB3YWxsZXRJZDogYWN0aXZlV2FsbGV0LmlkLFxyXG4gICAgICAgICAgZHVyYXRpb25NczogNjAwMDAgLy8gMSBtaW51dGUgdGVtcG9yYXJ5IHNlc3Npb25cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKCF0ZW1wU2Vzc2lvblJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwYXNzd29yZCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnU0lHTl9BUFBST1ZBTCcsXHJcbiAgICAgICAgICByZXF1ZXN0SWQsXHJcbiAgICAgICAgICBhcHByb3ZlZDogdHJ1ZSxcclxuICAgICAgICAgIHNlc3Npb25Ub2tlbjogdGVtcFNlc3Npb25SZXNwb25zZS5zZXNzaW9uVG9rZW5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIC8vIENsb3NlIHRoZSBwb3B1cCB3aW5kb3dcclxuICAgICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gcmVzcG9uc2UuZXJyb3IgfHwgJ1NpZ25pbmcgZmFpbGVkJztcclxuICAgICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIGVycm9yIHNvIHVzZXIgY2FuIHRyeSBhZ2FpblxyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgLy8gUmUtZW5hYmxlIGJ1dHRvbiBvbiBlcnJvciBzbyB1c2VyIGNhbiB0cnkgYWdhaW5cclxuICAgICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICAgIGFwcHJvdmVCdG4uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTZXR1cCByZWplY3QgYnV0dG9uXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlamVjdC1zaWduLXR5cGVkJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgdHlwZTogJ1NJR05fQVBQUk9WQUwnLFxyXG4gICAgICAgICAgcmVxdWVzdElkLFxyXG4gICAgICAgICAgYXBwcm92ZWQ6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIENsb3NlIHRoZSBwb3B1cCB3aW5kb3dcclxuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBhbGVydCgnRXJyb3IgcmVqZWN0aW5nIHNpZ24gcmVxdWVzdDogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGFsZXJ0KCdFcnJvciBsb2FkaW5nIHR5cGVkIGRhdGEgc2lnbiByZXF1ZXN0OiAnICsgc2FuaXRpemVFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICB3aW5kb3cuY2xvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFRSQU5TQUNUSU9OIEhJU1RPUlkgPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlUGVuZGluZ1R4SW5kaWNhdG9yKCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX1BFTkRJTkdfVFhfQ09VTlQnLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzc1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgaW5kaWNhdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlbmRpbmctdHgtaW5kaWNhdG9yJyk7XHJcbiAgICBjb25zdCB0ZXh0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGVuZGluZy10eC10ZXh0Jyk7XHJcblxyXG4gICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MgJiYgcmVzcG9uc2UuY291bnQgPiAwKSB7XHJcbiAgICAgIHRleHRFbC50ZXh0Q29udGVudCA9IGDimqDvuI8gJHtyZXNwb25zZS5jb3VudH0gUGVuZGluZyBUcmFuc2FjdGlvbiR7cmVzcG9uc2UuY291bnQgPiAxID8gJ3MnIDogJyd9YDtcclxuICAgICAgaW5kaWNhdG9yLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaW5kaWNhdG9yLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjaGVja2luZyBwZW5kaW5nIHRyYW5zYWN0aW9uczonLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzaG93VHJhbnNhY3Rpb25IaXN0b3J5KCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MpIHJldHVybjtcclxuXHJcbiAgc2hvd1NjcmVlbignc2NyZWVuLXR4LWhpc3RvcnknKTtcclxuICBhd2FpdCByZW5kZXJUcmFuc2FjdGlvbkhpc3RvcnkoJ2FsbCcpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZW5kZXJUcmFuc2FjdGlvbkhpc3RvcnkoZmlsdGVyID0gJ2FsbCcpIHtcclxuICBjb25zdCBsaXN0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtaGlzdG9yeS1saXN0Jyk7XHJcbiAgaWYgKCFjdXJyZW50U3RhdGUuYWRkcmVzcykge1xyXG4gICAgbGlzdEVsLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtZGltXCI+Tm8gYWRkcmVzcyBzZWxlY3RlZDwvcD4nO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgbGlzdEVsLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtZGltXCI+TG9hZGluZy4uLjwvcD4nO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdHRVRfVFhfSElTVE9SWScsXHJcbiAgICAgIGFkZHJlc3M6IGN1cnJlbnRTdGF0ZS5hZGRyZXNzXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlLnN1Y2Nlc3MgfHwgIXJlc3BvbnNlLnRyYW5zYWN0aW9ucyB8fCByZXNwb25zZS50cmFuc2FjdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGxpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPk5vIHRyYW5zYWN0aW9uczwvcD4nO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHRyYW5zYWN0aW9ucyA9IHJlc3BvbnNlLnRyYW5zYWN0aW9ucztcclxuXHJcbiAgICAvLyBBcHBseSBmaWx0ZXJcclxuICAgIGlmIChmaWx0ZXIgPT09ICdwZW5kaW5nJykge1xyXG4gICAgICB0cmFuc2FjdGlvbnMgPSB0cmFuc2FjdGlvbnMuZmlsdGVyKHR4ID0+IHR4LnN0YXR1cyA9PT0gJ3BlbmRpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoZmlsdGVyID09PSAnY29uZmlybWVkJykge1xyXG4gICAgICB0cmFuc2FjdGlvbnMgPSB0cmFuc2FjdGlvbnMuZmlsdGVyKHR4ID0+IHR4LnN0YXR1cyA9PT0gJ2NvbmZpcm1lZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0cmFuc2FjdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGxpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPk5vIHRyYW5zYWN0aW9ucyBpbiB0aGlzIGZpbHRlcjwvcD4nO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGh0bWwgPSAnJztcclxuICAgIGZvciAoY29uc3QgdHggb2YgdHJhbnNhY3Rpb25zKSB7XHJcbiAgICAgIGNvbnN0IHN0YXR1c0ljb24gPSB0eC5zdGF0dXMgPT09ICdwZW5kaW5nJyA/ICfij7MnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHguc3RhdHVzID09PSAnY29uZmlybWVkJyA/ICfinIUnIDogJ+KdjCc7XHJcbiAgICAgIGNvbnN0IHN0YXR1c0NvbG9yID0gdHguc3RhdHVzID09PSAncGVuZGluZycgPyAndmFyKC0tdGVybWluYWwtd2FybmluZyknIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHR4LnN0YXR1cyA9PT0gJ2NvbmZpcm1lZCcgPyAnIzQ0ZmY0NCcgOiAnI2ZmNDQ0NCc7XHJcblxyXG4gICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUodHgudGltZXN0YW1wKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICBjb25zdCB2YWx1ZUV0aCA9IGV0aGVycy5mb3JtYXRFdGhlcih0eC52YWx1ZSB8fCAnMCcpO1xyXG4gICAgICBjb25zdCBnYXNHd2VpID0gZXRoZXJzLmZvcm1hdFVuaXRzKHR4Lmdhc1ByaWNlIHx8ICcwJywgJ2d3ZWknKTtcclxuXHJcbiAgICAgIGh0bWwgKz0gYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJwYW5lbCBtYi0yXCIgc3R5bGU9XCJwYWRkaW5nOiAxMnB4OyBjdXJzb3I6IHBvaW50ZXI7IGJvcmRlci1jb2xvcjogJHtzdGF0dXNDb2xvcn07XCIgZGF0YS10eC1oYXNoPVwiJHt0eC5oYXNofVwiPlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgYWxpZ24taXRlbXM6IGNlbnRlcjsgbWFyZ2luLWJvdHRvbTogOHB4O1wiPlxyXG4gICAgICAgICAgICA8c3BhbiBzdHlsZT1cImNvbG9yOiAke3N0YXR1c0NvbG9yfTsgZm9udC1zaXplOiAxNHB4O1wiPiR7c3RhdHVzSWNvbn0gJHt0eC5zdGF0dXMudG9VcHBlckNhc2UoKX08L3NwYW4+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTBweDtcIj4ke2RhdGV9PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDEwcHg7IG1hcmdpbi1ib3R0b206IDRweDtcIj5IYXNoOiAke3R4Lmhhc2guc2xpY2UoMCwgMjApfS4uLjwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTBweDsgbWFyZ2luLWJvdHRvbTogNHB4O1wiPlZhbHVlOiAke3ZhbHVlRXRofSAke2dldE5ldHdvcmtTeW1ib2wodHgubmV0d29yayl9PC9wPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMHB4O1wiPkdhczogJHtnYXNHd2VpfSBHd2VpIOKAoiBOb25jZTogJHt0eC5ub25jZX08L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIGA7XHJcbiAgICB9XHJcblxyXG4gICAgbGlzdEVsLmlubmVySFRNTCA9IGh0bWw7XHJcblxyXG4gICAgLy8gQWRkIGNsaWNrIGhhbmRsZXJzXHJcbiAgICBsaXN0RWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdHgtaGFzaF0nKS5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdHhIYXNoID0gZWwuZGF0YXNldC50eEhhc2g7XHJcbiAgICAgICAgc2hvd1RyYW5zYWN0aW9uRGV0YWlscyh0eEhhc2gpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgbG9hZGluZyB0cmFuc2FjdGlvbiBoaXN0b3J5OicsIGVycm9yKTtcclxuICAgIGxpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPkVycm9yIGxvYWRpbmcgdHJhbnNhY3Rpb25zPC9wPic7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzaG93VHJhbnNhY3Rpb25EZXRhaWxzKHR4SGFzaCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX1RYX0JZX0hBU0gnLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzcyxcclxuICAgICAgdHhIYXNoOiB0eEhhc2hcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghcmVzcG9uc2Uuc3VjY2VzcyB8fCAhcmVzcG9uc2UudHJhbnNhY3Rpb24pIHtcclxuICAgICAgYWxlcnQoJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCcpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdHggPSByZXNwb25zZS50cmFuc2FjdGlvbjtcclxuXHJcbiAgICAvLyBTaG93IHNjcmVlblxyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXR4LWRldGFpbHMnKTtcclxuXHJcbiAgICAvLyBQb3B1bGF0ZSBkZXRhaWxzXHJcbiAgICBjb25zdCBzdGF0dXNCYWRnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1zdGF0dXMtYmFkZ2UnKTtcclxuICAgIGNvbnN0IHN0YXR1c1RleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc3RhdHVzLXRleHQnKTtcclxuXHJcbiAgICBpZiAodHguc3RhdHVzID09PSAncGVuZGluZycpIHtcclxuICAgICAgc3RhdHVzVGV4dC50ZXh0Q29udGVudCA9ICfij7MgUEVORElORyc7XHJcbiAgICAgIHN0YXR1c0JhZGdlLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXdhcm5pbmcpJztcclxuICAgICAgc3RhdHVzVGV4dC5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC13YXJuaW5nKSc7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1wZW5kaW5nLWFjdGlvbnMnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1ibG9jay1zZWN0aW9uJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9IGVsc2UgaWYgKHR4LnN0YXR1cyA9PT0gJ2NvbmZpcm1lZCcpIHtcclxuICAgICAgc3RhdHVzVGV4dC50ZXh0Q29udGVudCA9ICfinIUgQ09ORklSTUVEJztcclxuICAgICAgc3RhdHVzQmFkZ2Uuc3R5bGUuYm9yZGVyQ29sb3IgPSAnIzQ0ZmY0NCc7XHJcbiAgICAgIHN0YXR1c1RleHQuc3R5bGUuY29sb3IgPSAnIzQ0ZmY0NCc7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1wZW5kaW5nLWFjdGlvbnMnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1ibG9jay1zZWN0aW9uJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kZXRhaWwtYmxvY2snKS50ZXh0Q29udGVudCA9IHR4LmJsb2NrTnVtYmVyIHx8ICctLSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdGF0dXNUZXh0LnRleHRDb250ZW50ID0gJ+KdjCBGQUlMRUQnO1xyXG4gICAgICBzdGF0dXNCYWRnZS5zdHlsZS5ib3JkZXJDb2xvciA9ICcjZmY0NDQ0JztcclxuICAgICAgc3RhdHVzVGV4dC5zdHlsZS5jb2xvciA9ICcjZmY0NDQ0JztcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXBlbmRpbmctYWN0aW9ucycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLWJsb2NrLXNlY3Rpb24nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIH1cclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLWhhc2gnKS50ZXh0Q29udGVudCA9IHR4Lmhhc2g7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLWZyb20nKS50ZXh0Q29udGVudCA9IHR4LmZyb207XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLXRvJykudGV4dENvbnRlbnQgPSB0eC50byB8fCAnQ29udHJhY3QgQ3JlYXRpb24nO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC12YWx1ZScpLnRleHRDb250ZW50ID0gZXRoZXJzLmZvcm1hdEV0aGVyKHR4LnZhbHVlIHx8ICcwJykgKyAnICcgKyBnZXROZXR3b3JrU3ltYm9sKHR4Lm5ldHdvcmspO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1ub25jZScpLnRleHRDb250ZW50ID0gdHgubm9uY2U7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLWdhcy1wcmljZScpLnRleHRDb250ZW50ID0gZXRoZXJzLmZvcm1hdFVuaXRzKHR4Lmdhc1ByaWNlIHx8ICcwJywgJ2d3ZWknKSArICcgR3dlaSc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLW5ldHdvcmsnKS50ZXh0Q29udGVudCA9IGdldE5ldHdvcmtOYW1lKHR4Lm5ldHdvcmspO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC10aW1lc3RhbXAnKS50ZXh0Q29udGVudCA9IG5ldyBEYXRlKHR4LnRpbWVzdGFtcCkudG9Mb2NhbGVTdHJpbmcoKTtcclxuXHJcbiAgICAvLyBTdG9yZSBjdXJyZW50IHR4IGhhc2ggZm9yIHNwZWVkIHVwL2NhbmNlbFxyXG4gICAgY3VycmVudFN0YXRlLmN1cnJlbnRUeEhhc2ggPSB0eC5oYXNoO1xyXG5cclxuICAgIC8vIFNldCB1cCBleHBsb3JlciBsaW5rXHJcbiAgICBjb25zdCBleHBsb3JlckJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdmlldy1leHBsb3JlcicpO1xyXG4gICAgZXhwbG9yZXJCdG4ub25jbGljayA9ICgpID0+IHtcclxuICAgICAgY29uc3QgdXJsID0gZ2V0RXhwbG9yZXJVcmwodHgubmV0d29yaywgJ3R4JywgdHguaGFzaCk7XHJcbiAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybCB9KTtcclxuICAgIH07XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBsb2FkaW5nIHRyYW5zYWN0aW9uIGRldGFpbHM6JywgZXJyb3IpO1xyXG4gICAgYWxlcnQoJ0Vycm9yIGxvYWRpbmcgdHJhbnNhY3Rpb24gZGV0YWlscycpO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3BlZWRVcFRyYW5zYWN0aW9uKCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MgfHwgIWN1cnJlbnRTdGF0ZS5jdXJyZW50VHhIYXNoKSByZXR1cm47XHJcblxyXG4gIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgc2hvd1Bhc3N3b3JkUHJvbXB0KCdTcGVlZCBVcCBUcmFuc2FjdGlvbicsICdFbnRlciB5b3VyIHBhc3N3b3JkIHRvIHNwZWVkIHVwIHRoaXMgdHJhbnNhY3Rpb24gd2l0aCBoaWdoZXIgZ2FzIHByaWNlICgxLjJ4KScpO1xyXG4gIGlmICghcGFzc3dvcmQpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIENyZWF0ZSB0ZW1wb3Jhcnkgc2Vzc2lvblxyXG4gICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBjb25zdCBzZXNzaW9uUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdDUkVBVEVfU0VTU0lPTicsXHJcbiAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcclxuICAgICAgd2FsbGV0SWQ6IGFjdGl2ZVdhbGxldC5pZCxcclxuICAgICAgZHVyYXRpb25NczogNjAwMDAgLy8gMSBtaW51dGUgdGVtcCBzZXNzaW9uXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXNlc3Npb25SZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgIGFsZXJ0KCdJbnZhbGlkIHBhc3N3b3JkJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTcGVlZCB1cCB0cmFuc2FjdGlvblxyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdTUEVFRF9VUF9UWCcsXHJcbiAgICAgIGFkZHJlc3M6IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLFxyXG4gICAgICB0eEhhc2g6IGN1cnJlbnRTdGF0ZS5jdXJyZW50VHhIYXNoLFxyXG4gICAgICBzZXNzaW9uVG9rZW46IHNlc3Npb25SZXNwb25zZS5zZXNzaW9uVG9rZW4sXHJcbiAgICAgIGdhc1ByaWNlTXVsdGlwbGllcjogMS4yXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICBhbGVydChgVHJhbnNhY3Rpb24gc3BlZCB1cCFcXG5OZXcgVFg6ICR7cmVzcG9uc2UudHhIYXNoLnNsaWNlKDAsIDIwKX0uLi5gKTtcclxuICAgICAgLy8gUmVmcmVzaCB0aGUgdHJhbnNhY3Rpb24gZGV0YWlsc1xyXG4gICAgICBzaG93VHJhbnNhY3Rpb25EZXRhaWxzKHJlc3BvbnNlLnR4SGFzaCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhbGVydCgnRXJyb3Igc3BlZWRpbmcgdXAgdHJhbnNhY3Rpb246ICcgKyByZXNwb25zZS5lcnJvcik7XHJcbiAgICB9XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzcGVlZGluZyB1cCB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICBhbGVydCgnRXJyb3Igc3BlZWRpbmcgdXAgdHJhbnNhY3Rpb24nKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNhbmNlbFRyYW5zYWN0aW9uKCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MgfHwgIWN1cnJlbnRTdGF0ZS5jdXJyZW50VHhIYXNoKSByZXR1cm47XHJcblxyXG4gIGlmICghY29uZmlybSgnQ2FuY2VsIHRoaXMgdHJhbnNhY3Rpb24/IEEgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIHdpbGwgYmUgc2VudC4nKSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ0NhbmNlbCBUcmFuc2FjdGlvbicsICdFbnRlciB5b3VyIHBhc3N3b3JkIHRvIGNhbmNlbCB0aGlzIHRyYW5zYWN0aW9uIGJ5IHNlbmRpbmcgYSAwLXZhbHVlIHJlcGxhY2VtZW50Jyk7XHJcbiAgaWYgKCFwYXNzd29yZCkgcmV0dXJuO1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gQ3JlYXRlIHRlbXBvcmFyeSBzZXNzaW9uXHJcbiAgICBjb25zdCBhY3RpdmVXYWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgIGNvbnN0IHNlc3Npb25SZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0NSRUFURV9TRVNTSU9OJyxcclxuICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkLFxyXG4gICAgICB3YWxsZXRJZDogYWN0aXZlV2FsbGV0LmlkLFxyXG4gICAgICBkdXJhdGlvbk1zOiA2MDAwMCAvLyAxIG1pbnV0ZSB0ZW1wIHNlc3Npb25cclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghc2Vzc2lvblJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgYWxlcnQoJ0ludmFsaWQgcGFzc3dvcmQnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhbmNlbCB0cmFuc2FjdGlvblxyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdDQU5DRUxfVFgnLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzcyxcclxuICAgICAgdHhIYXNoOiBjdXJyZW50U3RhdGUuY3VycmVudFR4SGFzaCxcclxuICAgICAgc2Vzc2lvblRva2VuOiBzZXNzaW9uUmVzcG9uc2Uuc2Vzc2lvblRva2VuXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICBhbGVydChgVHJhbnNhY3Rpb24gY2FuY2VsbGVkIVxcbkNhbmNlbGxhdGlvbiBUWDogJHtyZXNwb25zZS50eEhhc2guc2xpY2UoMCwgMjApfS4uLmApO1xyXG4gICAgICAvLyBSZWZyZXNoIHRvIHNob3cgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uXHJcbiAgICAgIHNob3dUcmFuc2FjdGlvbkRldGFpbHMocmVzcG9uc2UudHhIYXNoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFsZXJ0KCdFcnJvciBjYW5jZWxsaW5nIHRyYW5zYWN0aW9uOiAnICsgcmVzcG9uc2UuZXJyb3IpO1xyXG4gICAgfVxyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgY2FuY2VsbGluZyB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICBhbGVydCgnRXJyb3IgY2FuY2VsbGluZyB0cmFuc2FjdGlvbicpO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2xlYXJUcmFuc2FjdGlvbkhpc3RvcnkoKSB7XHJcbiAgaWYgKCFjb25maXJtKCdDbGVhciBhbGwgdHJhbnNhY3Rpb24gaGlzdG9yeSBmb3IgdGhpcyBhZGRyZXNzPyBUaGlzIGNhbm5vdCBiZSB1bmRvbmUuJykpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdDTEVBUl9UWF9ISVNUT1JZJyxcclxuICAgICAgYWRkcmVzczogY3VycmVudFN0YXRlLmFkZHJlc3NcclxuICAgIH0pO1xyXG5cclxuICAgIGFsZXJ0KCdUcmFuc2FjdGlvbiBoaXN0b3J5IGNsZWFyZWQnKTtcclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKTtcclxuICAgIGF3YWl0IHVwZGF0ZURhc2hib2FyZCgpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjbGVhcmluZyB0cmFuc2FjdGlvbiBoaXN0b3J5OicsIGVycm9yKTtcclxuICAgIGFsZXJ0KCdFcnJvciBjbGVhcmluZyB0cmFuc2FjdGlvbiBoaXN0b3J5Jyk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogU2hvdyB0cmFuc2FjdGlvbiBzdGF0dXMgYWZ0ZXIgYXBwcm92YWxcclxuICogS2VlcHMgYXBwcm92YWwgd2luZG93IG9wZW4gdG8gc2hvdyB0eCBzdGF0dXNcclxuICovXHJcbmxldCB0eFN0YXR1c1BvbGxJbnRlcnZhbCA9IG51bGw7XHJcbmxldCB0eFN0YXR1c0N1cnJlbnRIYXNoID0gbnVsbDtcclxubGV0IHR4U3RhdHVzQ3VycmVudEFkZHJlc3MgPSBudWxsO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2hvd1RyYW5zYWN0aW9uU3RhdHVzKHR4SGFzaCwgYWRkcmVzcywgcmVxdWVzdElkKSB7XHJcbiAgLy8gU2hvd2luZyB0cmFuc2FjdGlvbiBzdGF0dXNcclxuXHJcbiAgLy8gU3RvcmUgY3VycmVudCB0cmFuc2FjdGlvbiBoYXNoIGFuZCBhZGRyZXNzXHJcbiAgdHhTdGF0dXNDdXJyZW50SGFzaCA9IHR4SGFzaDtcclxuICB0eFN0YXR1c0N1cnJlbnRBZGRyZXNzID0gYWRkcmVzcztcclxuXHJcbiAgLy8gSGlkZSBhcHByb3ZhbCBmb3JtXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWFwcHJvdmFsLWZvcm0nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gU2hvdyBzdGF0dXMgc2VjdGlvblxyXG4gIGNvbnN0IHN0YXR1c1NlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc3RhdHVzLXNlY3Rpb24nKTtcclxuICBzdGF0dXNTZWN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG5cclxuICAvLyBQb3B1bGF0ZSB0cmFuc2FjdGlvbiBoYXNoXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXN0YXR1cy1oYXNoJykudGV4dENvbnRlbnQgPSB0eEhhc2g7XHJcblxyXG4gIC8vIFBvbGwgZm9yIHRyYW5zYWN0aW9uIHN0YXR1cyB1cGRhdGVzXHJcbiAgY29uc3QgdXBkYXRlU3RhdHVzID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gUG9sbGluZyB0cmFuc2FjdGlvbiBzdGF0dXNcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogJ0dFVF9UWF9CWV9IQVNIJyxcclxuICAgICAgICBhZGRyZXNzOiB0eFN0YXR1c0N1cnJlbnRBZGRyZXNzLFxyXG4gICAgICAgIHR4SGFzaDogdHhIYXNoXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gU3RhdHVzIHBvbGwgcmVzcG9uc2VcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzICYmIHJlc3BvbnNlLnRyYW5zYWN0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgdHggPSByZXNwb25zZS50cmFuc2FjdGlvbjtcclxuICAgICAgICAvLyBUcmFuc2FjdGlvbiBzdGF0dXMgdXBkYXRlZFxyXG5cclxuICAgICAgICBjb25zdCBzdGF0dXNNZXNzYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXN0YXR1cy1tZXNzYWdlJyk7XHJcbiAgICAgICAgY29uc3Qgc3RhdHVzRGV0YWlscyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1zdGF0dXMtZGV0YWlscycpO1xyXG4gICAgICAgIGNvbnN0IHBlbmRpbmdBY3Rpb25zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXN0YXR1cy1wZW5kaW5nLWFjdGlvbnMnKTtcclxuXHJcbiAgICAgICAgaWYgKHR4LnN0YXR1cyA9PT0gJ2NvbmZpcm1lZCcpIHtcclxuICAgICAgICAgIC8vIFRyYW5zYWN0aW9uIGNvbmZpcm1lZFxyXG4gICAgICAgICAgc3RhdHVzTWVzc2FnZS50ZXh0Q29udGVudCA9ICfinIUgVHJhbnNhY3Rpb24gQ29uZmlybWVkISc7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnRleHRDb250ZW50ID0gYEJsb2NrOiAke3R4LmJsb2NrTnVtYmVyfWA7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXN1Y2Nlc3MpJztcclxuICAgICAgICAgIHBlbmRpbmdBY3Rpb25zLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAgIC8vIFN0b3AgcG9sbGluZ1xyXG4gICAgICAgICAgaWYgKHR4U3RhdHVzUG9sbEludGVydmFsKSB7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodHhTdGF0dXNQb2xsSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICB0eFN0YXR1c1BvbGxJbnRlcnZhbCA9IG51bGw7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gQXV0by1jbG9zZSBhZnRlciAyIHNlY29uZHNcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHguc3RhdHVzID09PSAnZmFpbGVkJykge1xyXG4gICAgICAgICAgc3RhdHVzTWVzc2FnZS50ZXh0Q29udGVudCA9ICfinYwgVHJhbnNhY3Rpb24gRmFpbGVkJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMudGV4dENvbnRlbnQgPSAnVGhlIHRyYW5zYWN0aW9uIHdhcyByZWplY3RlZCBvciByZXBsYWNlZCc7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnN0eWxlLmNvbG9yID0gJyNmZjQ0NDQnO1xyXG4gICAgICAgICAgcGVuZGluZ0FjdGlvbnMuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgLy8gU3RvcCBwb2xsaW5nXHJcbiAgICAgICAgICBpZiAodHhTdGF0dXNQb2xsSW50ZXJ2YWwpIHtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0eFN0YXR1c1BvbGxJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIHR4U3RhdHVzUG9sbEludGVydmFsID0gbnVsbDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBBdXRvLWNsb3NlIGFmdGVyIDIgc2Vjb25kc1xyXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICAgICAgfSwgMjAwMCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIFN0aWxsIHBlbmRpbmdcclxuICAgICAgICAgIHN0YXR1c01lc3NhZ2UudGV4dENvbnRlbnQgPSAn4o+zIFdhaXRpbmcgZm9yIGNvbmZpcm1hdGlvbi4uLic7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnRleHRDb250ZW50ID0gJ1RoaXMgdXN1YWxseSB0YWtlcyAxMC0zMCBzZWNvbmRzJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMuc3R5bGUuY29sb3IgPSAndmFyKC0tdGVybWluYWwtZmctZGltKSc7XHJcbiAgICAgICAgICBwZW5kaW5nQWN0aW9ucy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCfwn6uAIFRyYW5zYWN0aW9uIG5vdCBmb3VuZCBpbiBzdG9yYWdlOicsIHR4SGFzaCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgY2hlY2tpbmcgdHJhbnNhY3Rpb24gc3RhdHVzOicsIGVycm9yKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBJbml0aWFsIHN0YXR1cyBjaGVja1xyXG4gIGF3YWl0IHVwZGF0ZVN0YXR1cygpO1xyXG5cclxuICAvLyBQb2xsIGV2ZXJ5IDMgc2Vjb25kc1xyXG4gIHR4U3RhdHVzUG9sbEludGVydmFsID0gc2V0SW50ZXJ2YWwodXBkYXRlU3RhdHVzLCAzMDAwKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TmV0d29ya1N5bWJvbChuZXR3b3JrKSB7XHJcbiAgY29uc3Qgc3ltYm9scyA9IHtcclxuICAgICdwdWxzZWNoYWluJzogJ1BMUycsXHJcbiAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAndFBMUycsXHJcbiAgICAnZXRoZXJldW0nOiAnRVRIJyxcclxuICAgICdzZXBvbGlhJzogJ1NlcG9saWFFVEgnXHJcbiAgfTtcclxuICByZXR1cm4gc3ltYm9sc1tuZXR3b3JrXSB8fCAnRVRIJztcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TmV0d29ya05hbWUobmV0d29yaykge1xyXG4gIGNvbnN0IG5hbWVzID0ge1xyXG4gICAgJ3B1bHNlY2hhaW4nOiAnUHVsc2VDaGFpbiBNYWlubmV0JyxcclxuICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICdQdWxzZUNoYWluIFRlc3RuZXQgVjQnLFxyXG4gICAgJ2V0aGVyZXVtJzogJ0V0aGVyZXVtIE1haW5uZXQnLFxyXG4gICAgJ3NlcG9saWEnOiAnU2Vwb2xpYSBUZXN0bmV0J1xyXG4gIH07XHJcbiAgcmV0dXJuIG5hbWVzW25ldHdvcmtdIHx8IG5ldHdvcms7XHJcbn1cclxuXHJcbi8vID09PT09IFVUSUxJVElFUyA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDb3B5QWRkcmVzcygpIHtcclxuICB0cnkge1xyXG4gICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LWFkZHJlc3MnKTtcclxuICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGJ0bi50ZXh0Q29udGVudDtcclxuICAgIGJ0bi50ZXh0Q29udGVudCA9ICdDT1BJRUQhJztcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSBvcmlnaW5hbFRleHQ7XHJcbiAgICB9LCAyMDAwKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0ZhaWxlZCB0byBjb3B5IGFkZHJlc3MnKTtcclxuICB9XHJcbn1cclxuIl0sImZpbGUiOiJwb3B1cC5qcyJ9