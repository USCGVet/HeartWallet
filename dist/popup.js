const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["index.js","rpc.js"])))=>i.map(i=>d[i]);
import { f as formatUnits, p as parseUnits, g as getProvider, C as Contract, i as isAddress, l as load, s as save, m as migrateToMultiWallet, w as walletExists, a as setActiveWallet, b as getActiveWallet, c as importFromMnemonic, d as importFromPrivateKey, u as unlockWallet, e as shortenAddress, h as getAllWallets, j as getBalance, k as formatBalance, n as getTransactionCount, o as parseEther, q as exportMnemonic, r as exportPrivateKey, t as addWallet, v as renameWallet, x as getGasPrice, y as estimateGas, z as formatEther, A as getBytes, B as toUtf8String, D as deleteWallet, E as exportMnemonicForWallet, F as exportPrivateKeyForWallet } from "./rpc.js";
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
        const wallet = await getActiveWallet();
        currentState.address = wallet.address;
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
    const { address, signer, upgraded, iterationsBefore, iterationsAfter } = await unlockWallet(password, {
      onUpgradeStart: (info) => {
        console.log(`🔐 Auto-upgrading wallet encryption: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()} iterations`);
        const statusDiv = document.createElement("div");
        statusDiv.className = "status-message info";
        statusDiv.textContent = `🔐 Upgrading wallet security to ${info.recommendedIterations.toLocaleString()} iterations...`;
        errorDiv.parentElement.insertBefore(statusDiv, errorDiv);
        setTimeout(() => statusDiv.remove(), 3e3);
      }
    });
    if (upgraded) {
      console.log(`✅ Wallet upgraded: ${iterationsBefore.toLocaleString()} → ${iterationsAfter.toLocaleString()} iterations`);
      const statusDiv = document.createElement("div");
      statusDiv.className = "status-message success";
      statusDiv.textContent = `✅ Security upgraded: ${iterationsBefore.toLocaleString()} → ${iterationsAfter.toLocaleString()} iterations`;
      errorDiv.parentElement.insertBefore(statusDiv, errorDiv);
      setTimeout(() => statusDiv.remove(), 5e3);
    }
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
  walletsData.walletList.forEach((wallet) => {
    const option = document.createElement("option");
    option.value = wallet.id;
    option.textContent = wallet.nickname || "Unnamed Wallet";
    if (wallet.id === walletsData.activeWalletId) {
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
  document.getElementById("send-form").classList.remove("hidden");
  document.getElementById("send-status-section").classList.add("hidden");
  showScreen("screen-send");
  const symbol = symbols[currentState.network] || "TOKEN";
  const txRequest = {
    from: currentState.address,
    to: currentState.address,
    // Dummy for estimation
    value: "0x0"
  };
  await populateSendGasPrices(currentState.network, txRequest, symbol);
  try {
    const nonceHex = await getTransactionCount(currentState.network, currentState.address, "pending");
    const nonce = parseInt(nonceHex, 16);
    document.getElementById("send-current-nonce").textContent = nonce;
  } catch (error) {
    console.error("Error fetching nonce:", error);
    document.getElementById("send-current-nonce").textContent = "Error";
  }
  const customNonceCheckbox = document.getElementById("send-custom-nonce-checkbox");
  const customNonceContainer = document.getElementById("send-custom-nonce-input-container");
  customNonceCheckbox.checked = false;
  customNonceContainer.classList.add("hidden");
  const newCheckbox = customNonceCheckbox.cloneNode(true);
  customNonceCheckbox.parentNode.replaceChild(newCheckbox, customNonceCheckbox);
  document.getElementById("send-custom-nonce-checkbox").addEventListener("change", (e) => {
    if (e.target.checked) {
      customNonceContainer.classList.remove("hidden");
      const currentNonce = document.getElementById("send-current-nonce").textContent;
      if (currentNonce !== "--" && currentNonce !== "Error") {
        document.getElementById("send-custom-nonce").value = currentNonce;
      }
    } else {
      customNonceContainer.classList.add("hidden");
    }
  });
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
    const sendBtn = document.getElementById("btn-confirm-send");
    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.5";
    sendBtn.style.cursor = "not-allowed";
    const { signer, upgraded, iterationsBefore, iterationsAfter } = await unlockWallet(password, {
      onUpgradeStart: (info) => {
        console.log(`🔐 Auto-upgrading wallet: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()}`);
        const statusDiv = document.createElement("div");
        statusDiv.className = "status-message info";
        statusDiv.textContent = "🔐 Upgrading wallet security...";
        errorEl.parentElement.insertBefore(statusDiv, errorEl);
        setTimeout(() => statusDiv.remove(), 3e3);
      }
    });
    if (upgraded) {
      console.log(`✅ Wallet upgraded: ${iterationsBefore.toLocaleString()} → ${iterationsAfter.toLocaleString()}`);
    }
    const gasPrice = getSelectedSendGasPrice();
    const customNonceCheckbox = document.getElementById("send-custom-nonce-checkbox");
    const customNonceInput = document.getElementById("send-custom-nonce");
    let customNonce = null;
    if (customNonceCheckbox.checked && customNonceInput.value) {
      customNonce = parseInt(customNonceInput.value);
      if (isNaN(customNonce) || customNonce < 0) {
        throw new Error("Invalid custom nonce");
      }
    }
    const provider = await getProvider(currentState.network);
    const connectedSigner = signer.connect(provider);
    let txResponse, symbol;
    if (selectedAsset === "native") {
      const tx = {
        to: toAddress,
        value: parseEther(amount)
      };
      if (gasPrice) {
        tx.gasPrice = gasPrice;
      }
      if (customNonce !== null) {
        tx.nonce = customNonce;
      }
      txResponse = await connectedSigner.sendTransaction(tx);
      symbol = symbols[currentState.network] || "tokens";
    } else {
      const allTokens = await getAllTokens(currentState.network);
      const token = allTokens.find((t) => t.address === selectedAsset);
      if (!token) {
        throw new Error("Token not found");
      }
      const amountWei = parseTokenAmount(amount, token.decimals);
      const txOptions = {};
      if (gasPrice) {
        txOptions.gasPrice = gasPrice;
      }
      if (customNonce !== null) {
        txOptions.nonce = customNonce;
      }
      const tokenContract = new Contract(
        token.address,
        ["function transfer(address to, uint256 amount) returns (bool)"],
        connectedSigner
      );
      txResponse = await tokenContract.transfer(toAddress, amountWei, txOptions);
      symbol = token.symbol;
    }
    await chrome.runtime.sendMessage({
      type: "SAVE_AND_MONITOR_TX",
      address: currentState.address,
      transaction: {
        hash: txResponse.hash,
        timestamp: Date.now(),
        from: currentState.address,
        to: toAddress,
        value: selectedAsset === "native" ? parseEther(amount).toString() : "0",
        gasPrice: gasPrice || (await txResponse.provider.getFeeData()).gasPrice.toString(),
        nonce: txResponse.nonce,
        network: currentState.network,
        status: "pending",
        blockNumber: null,
        type: selectedAsset === "native" ? "send" : "token"
      }
    });
    if (chrome.notifications) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL("assets/icons/icon-128.png"),
        title: "Transaction Sent",
        message: `Sending ${amount} ${symbol} to ${toAddress.slice(0, 10)}...`,
        priority: 2
      });
    }
    await showSendTransactionStatus(txResponse.hash, currentState.network, amount, symbol);
  } catch (error) {
    console.error("Send transaction error:", error);
    errorEl.textContent = error.message.includes("incorrect password") ? "Incorrect password" : "Transaction failed: " + error.message;
    errorEl.classList.remove("hidden");
    const sendBtn = document.getElementById("btn-confirm-send");
    sendBtn.disabled = false;
    sendBtn.style.opacity = "1";
    sendBtn.style.cursor = "pointer";
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
  document.getElementById("token-send-form").classList.remove("hidden");
  document.getElementById("token-send-status-section").classList.add("hidden");
  showScreen("screen-token-details");
  const networkSymbols = {
    "pulsechainTestnet": "tPLS",
    "pulsechain": "PLS",
    "ethereum": "ETH",
    "sepolia": "SEP"
  };
  const networkSymbol = networkSymbols[network] || "TOKEN";
  const provider = await getProvider(network);
  const tokenContract = new Contract(
    tokenData.address,
    ["function transfer(address to, uint256 amount) returns (bool)"],
    provider
  );
  const dummyAmount = parseUnits("1", tokenData.decimals);
  const txRequest = {
    from: currentState.address,
    to: tokenData.address,
    data: tokenContract.interface.encodeFunctionData("transfer", [currentState.address, dummyAmount])
  };
  await populateTokenGasPrices(network, txRequest, networkSymbol);
  try {
    const nonceHex = await getTransactionCount(network, currentState.address, "pending");
    const nonce = parseInt(nonceHex, 16);
    document.getElementById("token-current-nonce").textContent = nonce;
  } catch (error) {
    console.error("Error fetching nonce:", error);
    document.getElementById("token-current-nonce").textContent = "Error";
  }
  const customNonceCheckbox = document.getElementById("token-custom-nonce-checkbox");
  const customNonceContainer = document.getElementById("token-custom-nonce-input-container");
  customNonceCheckbox.checked = false;
  customNonceContainer.classList.add("hidden");
  const newCheckbox = customNonceCheckbox.cloneNode(true);
  customNonceCheckbox.parentNode.replaceChild(newCheckbox, customNonceCheckbox);
  document.getElementById("token-custom-nonce-checkbox").addEventListener("change", (e) => {
    if (e.target.checked) {
      customNonceContainer.classList.remove("hidden");
      const currentNonce = document.getElementById("token-current-nonce").textContent;
      if (currentNonce !== "--" && currentNonce !== "Error") {
        document.getElementById("token-custom-nonce").value = currentNonce;
      }
    } else {
      customNonceContainer.classList.add("hidden");
    }
  });
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
    const sendBtn = document.getElementById("btn-token-send");
    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.5";
    sendBtn.style.cursor = "not-allowed";
    const amountBN = parseUnits(amount, tokenData.decimals);
    const balanceWei = await getTokenBalance(currentState.network, tokenData.address, currentState.address);
    if (amountBN > balanceWei) {
      errorEl.textContent = "Insufficient balance";
      errorEl.classList.remove("hidden");
      sendBtn.disabled = false;
      sendBtn.style.opacity = "1";
      sendBtn.style.cursor = "pointer";
      return;
    }
    let signer;
    try {
      const unlockResult = await unlockWallet(password, {
        onUpgradeStart: (info) => {
          console.log(`🔐 Auto-upgrading wallet: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()}`);
        }
      });
      signer = unlockResult.signer;
      if (unlockResult.upgraded) {
        console.log(`✅ Wallet upgraded: ${unlockResult.iterationsBefore.toLocaleString()} → ${unlockResult.iterationsAfter.toLocaleString()}`);
      }
    } catch (err) {
      errorEl.textContent = err.message || "Incorrect password";
      errorEl.classList.remove("hidden");
      sendBtn.disabled = false;
      sendBtn.style.opacity = "1";
      sendBtn.style.cursor = "pointer";
      return;
    }
    const gasPrice = getSelectedTokenGasPrice();
    const customNonceCheckbox = document.getElementById("token-custom-nonce-checkbox");
    const customNonceInput = document.getElementById("token-custom-nonce");
    let customNonce = null;
    if (customNonceCheckbox.checked && customNonceInput.value) {
      customNonce = parseInt(customNonceInput.value);
      if (isNaN(customNonce) || customNonce < 0) {
        throw new Error("Invalid custom nonce");
      }
    }
    const provider = await getProvider(currentState.network);
    const connectedSigner = signer.connect(provider);
    const tokenContract = new Contract(
      tokenData.address,
      ["function transfer(address to, uint256 amount) returns (bool)"],
      connectedSigner
    );
    const txOptions = {};
    if (gasPrice) {
      txOptions.gasPrice = gasPrice;
    }
    if (customNonce !== null) {
      txOptions.nonce = customNonce;
    }
    const tx = await tokenContract.transfer(recipient, amountBN, txOptions);
    await chrome.runtime.sendMessage({
      type: "SAVE_AND_MONITOR_TX",
      address: currentState.address,
      transaction: {
        hash: tx.hash,
        timestamp: Date.now(),
        from: currentState.address,
        to: recipient,
        value: "0",
        gasPrice: gasPrice || (await tx.provider.getFeeData()).gasPrice.toString(),
        nonce: tx.nonce,
        network: currentState.network,
        status: "pending",
        blockNumber: null,
        type: "token"
      }
    });
    if (chrome.notifications) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL("assets/icons/icon-128.png"),
        title: "Transaction Sent",
        message: `Sending ${amount} ${tokenData.symbol} to ${recipient.slice(0, 10)}...`,
        priority: 2
      });
    }
    await showTokenSendTransactionStatus(tx.hash, currentState.network, amount, tokenData.symbol);
  } catch (error) {
    console.error("Error sending token:", error);
    errorEl.textContent = error.message || "Transaction failed";
    errorEl.classList.remove("hidden");
    const sendBtn = document.getElementById("btn-token-send");
    sendBtn.disabled = false;
    sendBtn.style.opacity = "1";
    sendBtn.style.cursor = "pointer";
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
  walletsData.walletList.forEach((wallet) => {
    const isActive = wallet.id === walletsData.activeWalletId;
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
            ${isActive ? "✓ " : ""}${escapeHtml(wallet.nickname || "Unnamed Wallet")}
            ${isActive ? '<span class="text-success" style="font-size: 11px; margin-left: 8px;">[ACTIVE]</span>' : ""}
          </div>
          <div class="text-dim" style="font-size: 11px; font-family: var(--font-mono); word-break: break-all;">
            ${escapeHtml(wallet.address || "Address not loaded")}
          </div>
          <div class="text-dim" style="font-size: 10px; margin-top: 4px;">
            ${wallet.importMethod === "create" ? "Created" : "Imported"} • ${new Date(wallet.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div class="button-group" style="gap: 6px;">
        ${!isActive ? `<button class="btn btn-small" data-wallet-id="${wallet.id}" data-action="switch">SWITCH</button>` : ""}
        <button class="btn btn-small" data-wallet-id="${wallet.id}" data-action="rename">RENAME</button>
        <button class="btn btn-small" data-wallet-id="${wallet.id}" data-action="export">EXPORT</button>
        <button class="btn btn-danger btn-small" data-wallet-id="${wallet.id}" data-action="delete">DELETE</button>
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
            handleRenameWalletPrompt(walletId, wallet.nickname);
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
      const wallet = await getActiveWallet();
      currentState.address = wallet.address;
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
  const wallet = await getActiveWallet();
  if (wallet && wallet.address) {
    document.getElementById("connection-wallet-address").textContent = wallet.address;
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
async function populateSendGasPrices(network, txRequest, symbol) {
  try {
    const gasPriceHex = await getGasPrice(network);
    const gasPriceWei = BigInt(gasPriceHex);
    const gasPriceGwei = Number(gasPriceWei) / 1e9;
    const slowGwei = (gasPriceGwei * 0.8).toFixed(2);
    const normalGwei = gasPriceGwei.toFixed(2);
    const fastGwei = (gasPriceGwei * 1.5).toFixed(2);
    document.getElementById("send-gas-slow-price").textContent = `${slowGwei} Gwei`;
    document.getElementById("send-gas-normal-price").textContent = `${normalGwei} Gwei`;
    document.getElementById("send-gas-fast-price").textContent = `${fastGwei} Gwei`;
    try {
      const estimatedGasHex = await estimateGas(network, txRequest);
      const estimatedGas = BigInt(estimatedGasHex);
      document.getElementById("send-estimated-gas").textContent = estimatedGas.toString();
      const maxFeeWei = estimatedGas * gasPriceWei;
      const maxFeeEth = formatEther(maxFeeWei.toString());
      document.getElementById("send-max-fee").textContent = `${parseFloat(maxFeeEth).toFixed(8)} ${symbol}`;
      const updateMaxFee = () => {
        var _a;
        const selectedSpeed = (_a = document.querySelector('input[name="send-gas-speed"]:checked')) == null ? void 0 : _a.value;
        let selectedGwei;
        if (selectedSpeed === "slow") {
          selectedGwei = parseFloat(slowGwei);
        } else if (selectedSpeed === "normal") {
          selectedGwei = parseFloat(normalGwei);
        } else if (selectedSpeed === "fast") {
          selectedGwei = parseFloat(fastGwei);
        } else if (selectedSpeed === "custom") {
          selectedGwei = parseFloat(document.getElementById("send-custom-gas-price").value) || parseFloat(normalGwei);
        } else {
          selectedGwei = parseFloat(normalGwei);
        }
        const selectedGasPriceWei = BigInt(Math.floor(selectedGwei * 1e9));
        const selectedMaxFeeWei = estimatedGas * selectedGasPriceWei;
        const selectedMaxFeeEth = formatEther(selectedMaxFeeWei.toString());
        document.getElementById("send-max-fee").textContent = `${parseFloat(selectedMaxFeeEth).toFixed(8)} ${symbol}`;
      };
      document.querySelectorAll('input[name="send-gas-speed"]').forEach((radio) => {
        radio.addEventListener("change", () => {
          updateMaxFee();
          document.querySelectorAll(".gas-option").forEach((label) => {
            const input = label.querySelector('input[name="send-gas-speed"]');
            if (input && input.checked) {
              label.style.borderColor = "var(--terminal-success)";
              label.style.borderWidth = "2px";
            } else {
              label.style.borderColor = "var(--terminal-border)";
              label.style.borderWidth = "1px";
            }
          });
          const customContainer = document.getElementById("send-custom-gas-input-container");
          if (radio.value === "custom" && radio.checked) {
            customContainer.classList.remove("hidden");
            setTimeout(() => {
              document.getElementById("send-custom-gas-price").focus();
            }, 100);
          } else if (customContainer) {
            customContainer.classList.add("hidden");
          }
        });
      });
      document.querySelectorAll(".gas-option").forEach((label) => {
        const input = label.querySelector('input[name="send-gas-speed"]');
        if (input && input.checked) {
          label.style.borderColor = "var(--terminal-success)";
          label.style.borderWidth = "2px";
        }
      });
      const customGasInput = document.getElementById("send-custom-gas-price");
      customGasInput.addEventListener("input", () => {
        document.getElementById("send-gas-custom-radio").checked = true;
        updateMaxFee();
      });
    } catch (gasEstimateError) {
      console.error("Error estimating gas:", gasEstimateError);
      document.getElementById("send-estimated-gas").textContent = "21000 (default)";
      document.getElementById("send-max-fee").textContent = "Unable to estimate";
    }
  } catch (error) {
    console.error("Error fetching gas price:", error);
    document.getElementById("send-gas-slow-price").textContent = "Error";
    document.getElementById("send-gas-normal-price").textContent = "Error";
    document.getElementById("send-gas-fast-price").textContent = "Error";
  }
}
function getSelectedSendGasPrice() {
  var _a;
  const selectedSpeed = (_a = document.querySelector('input[name="send-gas-speed"]:checked')) == null ? void 0 : _a.value;
  if (selectedSpeed === "custom") {
    const customGwei = parseFloat(document.getElementById("send-custom-gas-price").value);
    if (customGwei && customGwei > 0) {
      return parseUnits(customGwei.toString(), "gwei").toString();
    }
  }
  let gweiText;
  if (selectedSpeed === "slow") {
    gweiText = document.getElementById("send-gas-slow-price").textContent;
  } else if (selectedSpeed === "fast") {
    gweiText = document.getElementById("send-gas-fast-price").textContent;
  } else {
    gweiText = document.getElementById("send-gas-normal-price").textContent;
  }
  const gwei = parseFloat(gweiText);
  if (gwei && gwei > 0) {
    return parseUnits(gwei.toString(), "gwei").toString();
  }
  return null;
}
async function populateTokenGasPrices(network, txRequest, symbol) {
  try {
    const gasPriceHex = await getGasPrice(network);
    const gasPriceWei = BigInt(gasPriceHex);
    const gasPriceGwei = Number(gasPriceWei) / 1e9;
    const slowGwei = (gasPriceGwei * 0.8).toFixed(2);
    const normalGwei = gasPriceGwei.toFixed(2);
    const fastGwei = (gasPriceGwei * 1.5).toFixed(2);
    document.getElementById("token-gas-slow-price").textContent = `${slowGwei} Gwei`;
    document.getElementById("token-gas-normal-price").textContent = `${normalGwei} Gwei`;
    document.getElementById("token-gas-fast-price").textContent = `${fastGwei} Gwei`;
    try {
      const estimatedGasHex = await estimateGas(network, txRequest);
      const estimatedGas = BigInt(estimatedGasHex);
      document.getElementById("token-estimated-gas").textContent = estimatedGas.toString();
      const maxFeeWei = estimatedGas * gasPriceWei;
      const maxFeeEth = formatEther(maxFeeWei.toString());
      document.getElementById("token-max-fee").textContent = `${parseFloat(maxFeeEth).toFixed(8)} ${symbol}`;
      const updateMaxFee = () => {
        var _a;
        const selectedSpeed = (_a = document.querySelector('input[name="token-gas-speed"]:checked')) == null ? void 0 : _a.value;
        let selectedGwei;
        if (selectedSpeed === "slow") {
          selectedGwei = parseFloat(slowGwei);
        } else if (selectedSpeed === "normal") {
          selectedGwei = parseFloat(normalGwei);
        } else if (selectedSpeed === "fast") {
          selectedGwei = parseFloat(fastGwei);
        } else if (selectedSpeed === "custom") {
          selectedGwei = parseFloat(document.getElementById("token-custom-gas-price").value) || parseFloat(normalGwei);
        } else {
          selectedGwei = parseFloat(normalGwei);
        }
        const selectedGasPriceWei = BigInt(Math.floor(selectedGwei * 1e9));
        const selectedMaxFeeWei = estimatedGas * selectedGasPriceWei;
        const selectedMaxFeeEth = formatEther(selectedMaxFeeWei.toString());
        document.getElementById("token-max-fee").textContent = `${parseFloat(selectedMaxFeeEth).toFixed(8)} ${symbol}`;
      };
      document.querySelectorAll('input[name="token-gas-speed"]').forEach((radio) => {
        radio.addEventListener("change", () => {
          updateMaxFee();
          document.querySelectorAll(".gas-option").forEach((label) => {
            const input = label.querySelector('input[name="token-gas-speed"]');
            if (input && input.checked) {
              label.style.borderColor = "var(--terminal-success)";
              label.style.borderWidth = "2px";
            } else {
              label.style.borderColor = "var(--terminal-border)";
              label.style.borderWidth = "1px";
            }
          });
          const customContainer = document.getElementById("token-custom-gas-input-container");
          if (radio.value === "custom" && radio.checked) {
            customContainer.classList.remove("hidden");
            setTimeout(() => {
              document.getElementById("token-custom-gas-price").focus();
            }, 100);
          } else if (customContainer) {
            customContainer.classList.add("hidden");
          }
        });
      });
      document.querySelectorAll(".gas-option").forEach((label) => {
        const input = label.querySelector('input[name="token-gas-speed"]');
        if (input && input.checked) {
          label.style.borderColor = "var(--terminal-success)";
          label.style.borderWidth = "2px";
        }
      });
      const customGasInput = document.getElementById("token-custom-gas-price");
      customGasInput.addEventListener("input", () => {
        document.getElementById("token-gas-custom-radio").checked = true;
        updateMaxFee();
      });
    } catch (gasEstimateError) {
      console.error("Error estimating gas:", gasEstimateError);
      document.getElementById("token-estimated-gas").textContent = "65000 (default)";
      document.getElementById("token-max-fee").textContent = "Unable to estimate";
    }
  } catch (error) {
    console.error("Error fetching gas price:", error);
    document.getElementById("token-gas-slow-price").textContent = "Error";
    document.getElementById("token-gas-normal-price").textContent = "Error";
    document.getElementById("token-gas-fast-price").textContent = "Error";
  }
}
function getSelectedTokenGasPrice() {
  var _a;
  const selectedSpeed = (_a = document.querySelector('input[name="token-gas-speed"]:checked')) == null ? void 0 : _a.value;
  if (selectedSpeed === "custom") {
    const customGwei = parseFloat(document.getElementById("token-custom-gas-price").value);
    if (customGwei && customGwei > 0) {
      return parseUnits(customGwei.toString(), "gwei").toString();
    }
  }
  let gweiText;
  if (selectedSpeed === "slow") {
    gweiText = document.getElementById("token-gas-slow-price").textContent;
  } else if (selectedSpeed === "fast") {
    gweiText = document.getElementById("token-gas-fast-price").textContent;
  } else {
    gweiText = document.getElementById("token-gas-normal-price").textContent;
  }
  const gwei = parseFloat(gweiText);
  if (gwei && gwei > 0) {
    return parseUnits(gwei.toString(), "gwei").toString();
  }
  return null;
}
async function showSendTransactionStatus(txHash, network, amount, symbol) {
  document.getElementById("send-form").classList.add("hidden");
  const statusSection = document.getElementById("send-status-section");
  statusSection.classList.remove("hidden");
  document.getElementById("send-status-hash").textContent = txHash;
  document.getElementById("btn-send-status-explorer").onclick = () => {
    const url = getExplorerUrl(network, "tx", txHash);
    chrome.tabs.create({ url });
  };
  const wallet = await getActiveWallet();
  const address = wallet == null ? void 0 : wallet.address;
  let pollInterval;
  const updateStatus = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "GET_TX_BY_HASH",
        address,
        txHash
      });
      if (response.success && response.transaction) {
        const tx = response.transaction;
        const statusMessage = document.getElementById("send-status-message");
        const statusDetails = document.getElementById("send-status-details");
        const pendingActions = document.getElementById("send-status-pending-actions");
        if (tx.status === "confirmed") {
          statusMessage.textContent = "✅ Transaction Confirmed!";
          statusDetails.textContent = `Block: ${tx.blockNumber}`;
          statusDetails.style.color = "var(--terminal-success)";
          pendingActions.classList.add("hidden");
          if (pollInterval) {
            clearInterval(pollInterval);
          }
          setTimeout(() => {
            showScreen("screen-dashboard");
            updateDashboard();
          }, 2e3);
        } else if (tx.status === "failed") {
          statusMessage.textContent = "❌ Transaction Failed";
          statusDetails.textContent = "The transaction was rejected or replaced";
          statusDetails.style.color = "#ff4444";
          pendingActions.classList.add("hidden");
          if (pollInterval) {
            clearInterval(pollInterval);
          }
        } else {
          statusMessage.textContent = "⏳ Waiting for confirmation...";
          statusDetails.textContent = "This usually takes 10-30 seconds";
          statusDetails.style.color = "var(--terminal-fg-dim)";
          pendingActions.classList.remove("hidden");
        }
      }
    } catch (error) {
      console.error("Error checking transaction status:", error);
    }
  };
  await updateStatus();
  pollInterval = setInterval(updateStatus, 3e3);
  document.getElementById("btn-close-send-status").onclick = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
    showScreen("screen-dashboard");
    updateDashboard();
  };
  document.getElementById("btn-send-status-speed-up").onclick = async () => {
    alert("Speed Up functionality will be implemented in a future update");
  };
  document.getElementById("btn-send-status-cancel").onclick = async () => {
    alert("Cancel functionality will be implemented in a future update");
  };
}
async function showTokenSendTransactionStatus(txHash, network, amount, symbol) {
  document.getElementById("token-send-form").classList.add("hidden");
  const statusSection = document.getElementById("token-send-status-section");
  statusSection.classList.remove("hidden");
  document.getElementById("token-send-status-hash").textContent = txHash;
  document.getElementById("btn-token-send-status-explorer").onclick = () => {
    const url = getExplorerUrl(network, "tx", txHash);
    chrome.tabs.create({ url });
  };
  const wallet = await getActiveWallet();
  const address = wallet == null ? void 0 : wallet.address;
  let pollInterval;
  const updateStatus = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "GET_TX_BY_HASH",
        address,
        txHash
      });
      if (response.success && response.transaction) {
        const tx = response.transaction;
        const statusMessage = document.getElementById("token-send-status-message");
        const statusDetails = document.getElementById("token-send-status-details");
        const pendingActions = document.getElementById("token-send-status-pending-actions");
        if (tx.status === "confirmed") {
          statusMessage.textContent = "✅ Transaction Confirmed!";
          statusDetails.textContent = `Block: ${tx.blockNumber}`;
          statusDetails.style.color = "var(--terminal-success)";
          pendingActions.classList.add("hidden");
          if (pollInterval) {
            clearInterval(pollInterval);
          }
          setTimeout(() => {
            showScreen("screen-tokens");
            loadTokensScreen();
          }, 2e3);
        } else if (tx.status === "failed") {
          statusMessage.textContent = "❌ Transaction Failed";
          statusDetails.textContent = "The transaction was rejected or replaced";
          statusDetails.style.color = "#ff4444";
          pendingActions.classList.add("hidden");
          if (pollInterval) {
            clearInterval(pollInterval);
          }
        } else {
          statusMessage.textContent = "⏳ Waiting for confirmation...";
          statusDetails.textContent = "This usually takes 10-30 seconds";
          statusDetails.style.color = "var(--terminal-fg-dim)";
          pendingActions.classList.remove("hidden");
        }
      }
    } catch (error) {
      console.error("Error checking transaction status:", error);
    }
  };
  await updateStatus();
  pollInterval = setInterval(updateStatus, 3e3);
  document.getElementById("btn-close-token-send-status").onclick = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
    showScreen("screen-tokens");
    loadTokensScreen();
  };
  document.getElementById("btn-token-send-status-speed-up").onclick = async () => {
    alert("Speed Up functionality will be implemented in a future update");
  };
  document.getElementById("btn-token-send-status-cancel").onclick = async () => {
    alert("Cancel functionality will be implemented in a future update");
  };
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
    const wallet = await getActiveWallet();
    const network = await load("currentNetwork") || "pulsechainTestnet";
    document.getElementById("tx-site-origin").textContent = origin;
    document.getElementById("tx-from-address").textContent = (wallet == null ? void 0 : wallet.address) || "0x0000...0000";
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
    await fetchAndDisplayNonce(wallet.address, network);
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


//# sourceMappingURL=data:application/json;base64,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QSxFQUNWO0FBQUEsRUFBRztBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWDtBQUFBLEVBQUc7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1g7QUFBQSxFQUFHO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNYO0FBQUEsRUFBRztBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWDtBQUFBLEVBQUc7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1g7QUFBQSxFQUFHO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNYO0FBQUEsRUFBRztBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWDtBQUFBLEVBQUc7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1g7QUFBQSxFQUFHO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNYO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUNkO0FBRUEsTUFBTSxxQkFBcUI7QUFBQTtBQUFBLEVBRXpCO0FBQUEsRUFBRztBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWDtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFLO0FBQUEsRUFDYjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSztBQUFBLEVBQ2I7QUFBQSxFQUFJO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNkO0FBQUEsRUFBSTtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZDtBQUFBLEVBQUk7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Q7QUFBQSxFQUFJO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNkO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNmO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNmO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNmO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNmO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUNoQjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQ2hCO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFDaEI7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUNoQjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQ2hCO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFDaEI7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUNoQjtBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQ2pCO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFDakI7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUNqQjtBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQ2pCO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFDakI7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUNqQjtBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUNuQjtBQVVBLHFDQUF5QixTQUFT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QUFPO0FBRUwsd0JBQWMsY0FBYztBQUM1Qix3QkFBYyxjQUFjO0FBQzVCLHdCQUFjLE1BQU0sUUFBUTtBQUM1Qix5QkFBZSxVQUFVLE9BQU8sUUFBUTtBQUFBLFFBQzFDO0FBQUEsTUFDRixPQUFPO0FBQ0wsZ0JBQVEsS0FBSyx3Q0FBd0MsTUFBTTtBQUFBLE1BQzdEO0FBQUEsSUFDRixTQUFTLE9BQU87QUFDZCxjQUFRLE1BQU0seUNBQXlDLEtBQUs7QUFBQSxJQUM5RDtBQUFBLEVBQ0Y7QUFHQSxRQUFNLGFBQVk7QUFHbEIseUJBQXVCLFlBQVksY0FBYyxHQUFJO0FBQ3ZEO0FBRUEsU0FBUyxpQkFBaUIsU0FBUztBQUNqQyxRQUFNLFVBQVU7QUFBQSxJQUNkLGNBQWM7QUFBQSxJQUNkLHFCQUFxQjtBQUFBLElBQ3JCLFlBQVk7QUFBQSxJQUNaLFdBQVc7QUFBQSxFQUNmO0FBQ0UsU0FBTyxRQUFRLE9BQU8sS0FBSztBQUM3QjtBQUVBLFNBQVMsZUFBZSxTQUFTO0FBQy9CLFFBQU0sUUFBUTtBQUFBLElBQ1osY0FBYztBQUFBLElBQ2QscUJBQXFCO0FBQUEsSUFDckIsWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLEVBQ2Y7QUFDRSxTQUFPLE1BQU0sT0FBTyxLQUFLO0FBQzNCO0FBR0EsZUFBZSxvQkFBb0I7QUFDakMsTUFBSTtBQUNGLFVBQU0sVUFBVSxVQUFVLFVBQVUsYUFBYSxPQUFPO0FBQ3hELFVBQU0sTUFBTSxTQUFTLGVBQWUsa0JBQWtCO0FBQ3RELFVBQU0sZUFBZSxJQUFJO0FBQ3pCLFFBQUksY0FBYztBQUNsQixlQUFXLE1BQU07QUFDZixVQUFJLGNBQWM7QUFBQSxJQUNwQixHQUFHLEdBQUk7QUFBQSxFQUNULFNBQVMsT0FBTztBQUNkLFVBQU0sd0JBQXdCO0FBQUEsRUFDaEM7QUFDRiIsIm5hbWVzIjpbImNhblByb21pc2UiLCJ1dGlscyIsInZlcnNpb24iLCJrYW5qaSIsImlzVmFsaWQiLCJCaXRCdWZmZXIiLCJCaXRNYXRyaXgiLCJnZXRTeW1ib2xTaXplIiwicmVxdWlyZSQkMCIsImdldFBvc2l0aW9ucyIsIm1hc2tQYXR0ZXJuIiwiRUNMZXZlbCIsImVycm9yQ29ycmVjdGlvbkxldmVsIiwibXVsIiwiUmVlZFNvbG9tb25FbmNvZGVyIiwicmVxdWlyZSQkMSIsIm1vZGUiLCJVdGlscyIsIkVDQ29kZSIsInJlcXVpcmUkJDIiLCJNb2RlIiwicmVxdWlyZSQkMyIsInJlcXVpcmUkJDQiLCJzZWdtZW50cyIsImdldEVuY29kZWRCaXRzIiwiZ2V0Qml0c0xlbmd0aCIsImJpdEJ1ZmZlciIsImdldExlbmd0aCIsIndyaXRlIiwiZGlqa3N0cmEiLCJOdW1lcmljRGF0YSIsIkFscGhhbnVtZXJpY0RhdGEiLCJCeXRlRGF0YSIsIkthbmppRGF0YSIsInJlcXVpcmUkJDUiLCJyZXF1aXJlJCQ2IiwicmVxdWlyZSQkNyIsInJlZ2V4IiwicmVxdWlyZSQkOCIsInJlcXVpcmUkJDkiLCJyZXF1aXJlJCQxMCIsInJlcXVpcmUkJDExIiwicmVxdWlyZSQkMTIiLCJjYW52YXMiLCJyZW5kZXIiLCJzdmdUYWciLCJldGhlcnMuQ29udHJhY3QiLCJldGhlcnMuZm9ybWF0VW5pdHMiLCJldGhlcnMucGFyc2VVbml0cyIsImV0aGVycy5pc0FkZHJlc3MiLCJ0b2tlbnMiLCJwbHNSZXNlcnZlIiwic2NyZWVuIiwiX2EiLCJldGhlcnMiLCJycGMuZ2V0QmFsYW5jZSIsInJwYy5mb3JtYXRCYWxhbmNlIiwiZXRoZXJzLnBhcnNlRXRoZXIiLCJycGMuZ2V0UHJvdmlkZXIiLCJ0b2tlbnMuZ2V0QWxsVG9rZW5zIiwicnBjLmdldFRyYW5zYWN0aW9uQ291bnQiLCJlcmMyMC5nZXRUb2tlbkJhbGFuY2UiLCJlcmMyMC5mb3JtYXRUb2tlbkJhbGFuY2UiLCJlcmMyMC5wYXJzZVRva2VuQW1vdW50IiwiUVJDb2RlIiwidG9rZW5zLkRFRkFVTFRfVE9LRU5TIiwidG9rZW5zLmdldEVuYWJsZWREZWZhdWx0VG9rZW5zIiwidG9rZW5zLmdldEN1c3RvbVRva2VucyIsInRva2Vucy5yZW1vdmVDdXN0b21Ub2tlbiIsInRva2Vucy50b2dnbGVEZWZhdWx0VG9rZW4iLCJlcmMyMC5nZXRUb2tlbk1ldGFkYXRhIiwidG9rZW5zLmFkZEN1c3RvbVRva2VuIiwicnBjLmdldEdhc1ByaWNlIiwicnBjLmVzdGltYXRlR2FzIiwiZXRoZXJzLmZvcm1hdEV0aGVyIiwicmVzcG9uc2UiLCJldGhlcnMuZ2V0Qnl0ZXMiLCJldGhlcnMudG9VdGY4U3RyaW5nIl0sImlnbm9yZUxpc3QiOlswLDEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0LDE1LDE2LDE3LDE4LDE5LDIwLDIxLDIyLDIzLDI0LDI1LDI2LDI3XSwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jYW4tcHJvbWlzZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvdXRpbHMuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2JpdC1idWZmZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2JpdC1tYXRyaXguanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2FsaWdubWVudC1wYXR0ZXJuLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9maW5kZXItcGF0dGVybi5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvbWFzay1wYXR0ZXJuLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9lcnJvci1jb3JyZWN0aW9uLWNvZGUuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2dhbG9pcy1maWVsZC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcG9seW5vbWlhbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcmVlZC1zb2xvbW9uLWVuY29kZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL3ZlcnNpb24tY2hlY2suanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL3JlZ2V4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9tb2RlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS92ZXJzaW9uLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9mb3JtYXQtaW5mby5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvbnVtZXJpYy1kYXRhLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9hbHBoYW51bWVyaWMtZGF0YS5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYnl0ZS1kYXRhLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9rYW5qaS1kYXRhLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2RpamtzdHJhanMvZGlqa3N0cmEuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL3NlZ21lbnRzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9xcmNvZGUuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9yZW5kZXJlci91dGlscy5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL3JlbmRlcmVyL2NhbnZhcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL3JlbmRlcmVyL3N2Zy10YWcuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9icm93c2VyLmpzIiwiLi4vc3JjL2NvcmUvZXJjMjAuanMiLCIuLi9zcmMvY29yZS90b2tlbnMuanMiLCIuLi9zcmMvY29yZS9wcmljZU9yYWNsZS5qcyIsIi4uL3NyYy9wb3B1cC9wb3B1cC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjYW4tcHJvbWlzZSBoYXMgYSBjcmFzaCBpbiBzb21lIHZlcnNpb25zIG9mIHJlYWN0IG5hdGl2ZSB0aGF0IGRvbnQgaGF2ZVxyXG4vLyBzdGFuZGFyZCBnbG9iYWwgb2JqZWN0c1xyXG4vLyBodHRwczovL2dpdGh1Yi5jb20vc29sZGFpci9ub2RlLXFyY29kZS9pc3N1ZXMvMTU3XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcclxuICByZXR1cm4gdHlwZW9mIFByb21pc2UgPT09ICdmdW5jdGlvbicgJiYgUHJvbWlzZS5wcm90b3R5cGUgJiYgUHJvbWlzZS5wcm90b3R5cGUudGhlblxyXG59XHJcbiIsImxldCB0b1NKSVNGdW5jdGlvblxyXG5jb25zdCBDT0RFV09SRFNfQ09VTlQgPSBbXHJcbiAgMCwgLy8gTm90IHVzZWRcclxuICAyNiwgNDQsIDcwLCAxMDAsIDEzNCwgMTcyLCAxOTYsIDI0MiwgMjkyLCAzNDYsXHJcbiAgNDA0LCA0NjYsIDUzMiwgNTgxLCA2NTUsIDczMywgODE1LCA5MDEsIDk5MSwgMTA4NSxcclxuICAxMTU2LCAxMjU4LCAxMzY0LCAxNDc0LCAxNTg4LCAxNzA2LCAxODI4LCAxOTIxLCAyMDUxLCAyMTg1LFxyXG4gIDIzMjMsIDI0NjUsIDI2MTEsIDI3NjEsIDI4NzYsIDMwMzQsIDMxOTYsIDMzNjIsIDM1MzIsIDM3MDZcclxuXVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIFFSIENvZGUgc2l6ZSBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgIHNpemUgb2YgUVIgY29kZVxyXG4gKi9cclxuZXhwb3J0cy5nZXRTeW1ib2xTaXplID0gZnVuY3Rpb24gZ2V0U3ltYm9sU2l6ZSAodmVyc2lvbikge1xyXG4gIGlmICghdmVyc2lvbikgdGhyb3cgbmV3IEVycm9yKCdcInZlcnNpb25cIiBjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnKVxyXG4gIGlmICh2ZXJzaW9uIDwgMSB8fCB2ZXJzaW9uID4gNDApIHRocm93IG5ldyBFcnJvcignXCJ2ZXJzaW9uXCIgc2hvdWxkIGJlIGluIHJhbmdlIGZyb20gMSB0byA0MCcpXHJcbiAgcmV0dXJuIHZlcnNpb24gKiA0ICsgMTdcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIHRvdGFsIG51bWJlciBvZiBjb2Rld29yZHMgdXNlZCB0byBzdG9yZSBkYXRhIGFuZCBFQyBpbmZvcm1hdGlvbi5cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgRGF0YSBsZW5ndGggaW4gYml0c1xyXG4gKi9cclxuZXhwb3J0cy5nZXRTeW1ib2xUb3RhbENvZGV3b3JkcyA9IGZ1bmN0aW9uIGdldFN5bWJvbFRvdGFsQ29kZXdvcmRzICh2ZXJzaW9uKSB7XHJcbiAgcmV0dXJuIENPREVXT1JEU19DT1VOVFt2ZXJzaW9uXVxyXG59XHJcblxyXG4vKipcclxuICogRW5jb2RlIGRhdGEgd2l0aCBCb3NlLUNoYXVkaHVyaS1Ib2NxdWVuZ2hlbVxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGRhdGEgVmFsdWUgdG8gZW5jb2RlXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICBFbmNvZGVkIHZhbHVlXHJcbiAqL1xyXG5leHBvcnRzLmdldEJDSERpZ2l0ID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICBsZXQgZGlnaXQgPSAwXHJcblxyXG4gIHdoaWxlIChkYXRhICE9PSAwKSB7XHJcbiAgICBkaWdpdCsrXHJcbiAgICBkYXRhID4+Pj0gMVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGRpZ2l0XHJcbn1cclxuXHJcbmV4cG9ydHMuc2V0VG9TSklTRnVuY3Rpb24gPSBmdW5jdGlvbiBzZXRUb1NKSVNGdW5jdGlvbiAoZikge1xyXG4gIGlmICh0eXBlb2YgZiAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdcInRvU0pJU0Z1bmNcIiBpcyBub3QgYSB2YWxpZCBmdW5jdGlvbi4nKVxyXG4gIH1cclxuXHJcbiAgdG9TSklTRnVuY3Rpb24gPSBmXHJcbn1cclxuXHJcbmV4cG9ydHMuaXNLYW5qaU1vZGVFbmFibGVkID0gZnVuY3Rpb24gKCkge1xyXG4gIHJldHVybiB0eXBlb2YgdG9TSklTRnVuY3Rpb24gIT09ICd1bmRlZmluZWQnXHJcbn1cclxuXHJcbmV4cG9ydHMudG9TSklTID0gZnVuY3Rpb24gdG9TSklTIChrYW5qaSkge1xyXG4gIHJldHVybiB0b1NKSVNGdW5jdGlvbihrYW5qaSlcclxufVxyXG4iLCJleHBvcnRzLkwgPSB7IGJpdDogMSB9XHJcbmV4cG9ydHMuTSA9IHsgYml0OiAwIH1cclxuZXhwb3J0cy5RID0geyBiaXQ6IDMgfVxyXG5leHBvcnRzLkggPSB7IGJpdDogMiB9XHJcblxyXG5mdW5jdGlvbiBmcm9tU3RyaW5nIChzdHJpbmcpIHtcclxuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignUGFyYW0gaXMgbm90IGEgc3RyaW5nJylcclxuICB9XHJcblxyXG4gIGNvbnN0IGxjU3RyID0gc3RyaW5nLnRvTG93ZXJDYXNlKClcclxuXHJcbiAgc3dpdGNoIChsY1N0cikge1xyXG4gICAgY2FzZSAnbCc6XHJcbiAgICBjYXNlICdsb3cnOlxyXG4gICAgICByZXR1cm4gZXhwb3J0cy5MXHJcblxyXG4gICAgY2FzZSAnbSc6XHJcbiAgICBjYXNlICdtZWRpdW0nOlxyXG4gICAgICByZXR1cm4gZXhwb3J0cy5NXHJcblxyXG4gICAgY2FzZSAncSc6XHJcbiAgICBjYXNlICdxdWFydGlsZSc6XHJcbiAgICAgIHJldHVybiBleHBvcnRzLlFcclxuXHJcbiAgICBjYXNlICdoJzpcclxuICAgIGNhc2UgJ2hpZ2gnOlxyXG4gICAgICByZXR1cm4gZXhwb3J0cy5IXHJcblxyXG4gICAgZGVmYXVsdDpcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIEVDIExldmVsOiAnICsgc3RyaW5nKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0cy5pc1ZhbGlkID0gZnVuY3Rpb24gaXNWYWxpZCAobGV2ZWwpIHtcclxuICByZXR1cm4gbGV2ZWwgJiYgdHlwZW9mIGxldmVsLmJpdCAhPT0gJ3VuZGVmaW5lZCcgJiZcclxuICAgIGxldmVsLmJpdCA+PSAwICYmIGxldmVsLmJpdCA8IDRcclxufVxyXG5cclxuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSAodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xyXG4gIGlmIChleHBvcnRzLmlzVmFsaWQodmFsdWUpKSB7XHJcbiAgICByZXR1cm4gdmFsdWVcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gZnJvbVN0cmluZyh2YWx1ZSlcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlXHJcbiAgfVxyXG59XHJcbiIsImZ1bmN0aW9uIEJpdEJ1ZmZlciAoKSB7XHJcbiAgdGhpcy5idWZmZXIgPSBbXVxyXG4gIHRoaXMubGVuZ3RoID0gMFxyXG59XHJcblxyXG5CaXRCdWZmZXIucHJvdG90eXBlID0ge1xyXG5cclxuICBnZXQ6IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgY29uc3QgYnVmSW5kZXggPSBNYXRoLmZsb29yKGluZGV4IC8gOClcclxuICAgIHJldHVybiAoKHRoaXMuYnVmZmVyW2J1ZkluZGV4XSA+Pj4gKDcgLSBpbmRleCAlIDgpKSAmIDEpID09PSAxXHJcbiAgfSxcclxuXHJcbiAgcHV0OiBmdW5jdGlvbiAobnVtLCBsZW5ndGgpIHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgdGhpcy5wdXRCaXQoKChudW0gPj4+IChsZW5ndGggLSBpIC0gMSkpICYgMSkgPT09IDEpXHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgZ2V0TGVuZ3RoSW5CaXRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5sZW5ndGhcclxuICB9LFxyXG5cclxuICBwdXRCaXQ6IGZ1bmN0aW9uIChiaXQpIHtcclxuICAgIGNvbnN0IGJ1ZkluZGV4ID0gTWF0aC5mbG9vcih0aGlzLmxlbmd0aCAvIDgpXHJcbiAgICBpZiAodGhpcy5idWZmZXIubGVuZ3RoIDw9IGJ1ZkluZGV4KSB7XHJcbiAgICAgIHRoaXMuYnVmZmVyLnB1c2goMClcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYml0KSB7XHJcbiAgICAgIHRoaXMuYnVmZmVyW2J1ZkluZGV4XSB8PSAoMHg4MCA+Pj4gKHRoaXMubGVuZ3RoICUgOCkpXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5sZW5ndGgrK1xyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCaXRCdWZmZXJcclxuIiwiLyoqXHJcbiAqIEhlbHBlciBjbGFzcyB0byBoYW5kbGUgUVIgQ29kZSBzeW1ib2wgbW9kdWxlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0gc2l6ZSBTeW1ib2wgc2l6ZVxyXG4gKi9cclxuZnVuY3Rpb24gQml0TWF0cml4IChzaXplKSB7XHJcbiAgaWYgKCFzaXplIHx8IHNpemUgPCAxKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0JpdE1hdHJpeCBzaXplIG11c3QgYmUgZGVmaW5lZCBhbmQgZ3JlYXRlciB0aGFuIDAnKVxyXG4gIH1cclxuXHJcbiAgdGhpcy5zaXplID0gc2l6ZVxyXG4gIHRoaXMuZGF0YSA9IG5ldyBVaW50OEFycmF5KHNpemUgKiBzaXplKVxyXG4gIHRoaXMucmVzZXJ2ZWRCaXQgPSBuZXcgVWludDhBcnJheShzaXplICogc2l6ZSlcclxufVxyXG5cclxuLyoqXHJcbiAqIFNldCBiaXQgdmFsdWUgYXQgc3BlY2lmaWVkIGxvY2F0aW9uXHJcbiAqIElmIHJlc2VydmVkIGZsYWcgaXMgc2V0LCB0aGlzIGJpdCB3aWxsIGJlIGlnbm9yZWQgZHVyaW5nIG1hc2tpbmcgcHJvY2Vzc1xyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0gIHJvd1xyXG4gKiBAcGFyYW0ge051bWJlcn0gIGNvbFxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHZhbHVlXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVzZXJ2ZWRcclxuICovXHJcbkJpdE1hdHJpeC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHJvdywgY29sLCB2YWx1ZSwgcmVzZXJ2ZWQpIHtcclxuICBjb25zdCBpbmRleCA9IHJvdyAqIHRoaXMuc2l6ZSArIGNvbFxyXG4gIHRoaXMuZGF0YVtpbmRleF0gPSB2YWx1ZVxyXG4gIGlmIChyZXNlcnZlZCkgdGhpcy5yZXNlcnZlZEJpdFtpbmRleF0gPSB0cnVlXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGJpdCB2YWx1ZSBhdCBzcGVjaWZpZWQgbG9jYXRpb25cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSAgcm93XHJcbiAqIEBwYXJhbSAge051bWJlcn0gIGNvbFxyXG4gKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gKi9cclxuQml0TWF0cml4LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcclxuICByZXR1cm4gdGhpcy5kYXRhW3JvdyAqIHRoaXMuc2l6ZSArIGNvbF1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFwcGxpZXMgeG9yIG9wZXJhdG9yIGF0IHNwZWNpZmllZCBsb2NhdGlvblxyXG4gKiAodXNlZCBkdXJpbmcgbWFza2luZyBwcm9jZXNzKVxyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0gIHJvd1xyXG4gKiBAcGFyYW0ge051bWJlcn0gIGNvbFxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHZhbHVlXHJcbiAqL1xyXG5CaXRNYXRyaXgucHJvdG90eXBlLnhvciA9IGZ1bmN0aW9uIChyb3csIGNvbCwgdmFsdWUpIHtcclxuICB0aGlzLmRhdGFbcm93ICogdGhpcy5zaXplICsgY29sXSBePSB2YWx1ZVxyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2sgaWYgYml0IGF0IHNwZWNpZmllZCBsb2NhdGlvbiBpcyByZXNlcnZlZFxyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0gICByb3dcclxuICogQHBhcmFtIHtOdW1iZXJ9ICAgY29sXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAqL1xyXG5CaXRNYXRyaXgucHJvdG90eXBlLmlzUmVzZXJ2ZWQgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcclxuICByZXR1cm4gdGhpcy5yZXNlcnZlZEJpdFtyb3cgKiB0aGlzLnNpemUgKyBjb2xdXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQml0TWF0cml4XHJcbiIsIi8qKlxyXG4gKiBBbGlnbm1lbnQgcGF0dGVybiBhcmUgZml4ZWQgcmVmZXJlbmNlIHBhdHRlcm4gaW4gZGVmaW5lZCBwb3NpdGlvbnNcclxuICogaW4gYSBtYXRyaXggc3ltYm9sb2d5LCB3aGljaCBlbmFibGVzIHRoZSBkZWNvZGUgc29mdHdhcmUgdG8gcmUtc3luY2hyb25pc2VcclxuICogdGhlIGNvb3JkaW5hdGUgbWFwcGluZyBvZiB0aGUgaW1hZ2UgbW9kdWxlcyBpbiB0aGUgZXZlbnQgb2YgbW9kZXJhdGUgYW1vdW50c1xyXG4gKiBvZiBkaXN0b3J0aW9uIG9mIHRoZSBpbWFnZS5cclxuICpcclxuICogQWxpZ25tZW50IHBhdHRlcm5zIGFyZSBwcmVzZW50IG9ubHkgaW4gUVIgQ29kZSBzeW1ib2xzIG9mIHZlcnNpb24gMiBvciBsYXJnZXJcclxuICogYW5kIHRoZWlyIG51bWJlciBkZXBlbmRzIG9uIHRoZSBzeW1ib2wgdmVyc2lvbi5cclxuICovXHJcblxyXG5jb25zdCBnZXRTeW1ib2xTaXplID0gcmVxdWlyZSgnLi91dGlscycpLmdldFN5bWJvbFNpemVcclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGUgdGhlIHJvdy9jb2x1bW4gY29vcmRpbmF0ZXMgb2YgdGhlIGNlbnRlciBtb2R1bGUgb2YgZWFjaCBhbGlnbm1lbnQgcGF0dGVyblxyXG4gKiBmb3IgdGhlIHNwZWNpZmllZCBRUiBDb2RlIHZlcnNpb24uXHJcbiAqXHJcbiAqIFRoZSBhbGlnbm1lbnQgcGF0dGVybnMgYXJlIHBvc2l0aW9uZWQgc3ltbWV0cmljYWxseSBvbiBlaXRoZXIgc2lkZSBvZiB0aGUgZGlhZ29uYWxcclxuICogcnVubmluZyBmcm9tIHRoZSB0b3AgbGVmdCBjb3JuZXIgb2YgdGhlIHN5bWJvbCB0byB0aGUgYm90dG9tIHJpZ2h0IGNvcm5lci5cclxuICpcclxuICogU2luY2UgcG9zaXRpb25zIGFyZSBzaW1tZXRyaWNhbCBvbmx5IGhhbGYgb2YgdGhlIGNvb3JkaW5hdGVzIGFyZSByZXR1cm5lZC5cclxuICogRWFjaCBpdGVtIG9mIHRoZSBhcnJheSB3aWxsIHJlcHJlc2VudCBpbiB0dXJuIHRoZSB4IGFuZCB5IGNvb3JkaW5hdGUuXHJcbiAqIEBzZWUge0BsaW5rIGdldFBvc2l0aW9uc31cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgQXJyYXkgb2YgY29vcmRpbmF0ZVxyXG4gKi9cclxuZXhwb3J0cy5nZXRSb3dDb2xDb29yZHMgPSBmdW5jdGlvbiBnZXRSb3dDb2xDb29yZHMgKHZlcnNpb24pIHtcclxuICBpZiAodmVyc2lvbiA9PT0gMSkgcmV0dXJuIFtdXHJcblxyXG4gIGNvbnN0IHBvc0NvdW50ID0gTWF0aC5mbG9vcih2ZXJzaW9uIC8gNykgKyAyXHJcbiAgY29uc3Qgc2l6ZSA9IGdldFN5bWJvbFNpemUodmVyc2lvbilcclxuICBjb25zdCBpbnRlcnZhbHMgPSBzaXplID09PSAxNDUgPyAyNiA6IE1hdGguY2VpbCgoc2l6ZSAtIDEzKSAvICgyICogcG9zQ291bnQgLSAyKSkgKiAyXHJcbiAgY29uc3QgcG9zaXRpb25zID0gW3NpemUgLSA3XSAvLyBMYXN0IGNvb3JkIGlzIGFsd2F5cyAoc2l6ZSAtIDcpXHJcblxyXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgcG9zQ291bnQgLSAxOyBpKyspIHtcclxuICAgIHBvc2l0aW9uc1tpXSA9IHBvc2l0aW9uc1tpIC0gMV0gLSBpbnRlcnZhbHNcclxuICB9XHJcblxyXG4gIHBvc2l0aW9ucy5wdXNoKDYpIC8vIEZpcnN0IGNvb3JkIGlzIGFsd2F5cyA2XHJcblxyXG4gIHJldHVybiBwb3NpdGlvbnMucmV2ZXJzZSgpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIHBvc2l0aW9ucyBvZiBlYWNoIGFsaWdubWVudCBwYXR0ZXJuLlxyXG4gKiBFYWNoIGFycmF5J3MgZWxlbWVudCByZXByZXNlbnQgdGhlIGNlbnRlciBwb2ludCBvZiB0aGUgcGF0dGVybiBhcyAoeCwgeSkgY29vcmRpbmF0ZXNcclxuICpcclxuICogQ29vcmRpbmF0ZXMgYXJlIGNhbGN1bGF0ZWQgZXhwYW5kaW5nIHRoZSByb3cvY29sdW1uIGNvb3JkaW5hdGVzIHJldHVybmVkIGJ5IHtAbGluayBnZXRSb3dDb2xDb29yZHN9XHJcbiAqIGFuZCBmaWx0ZXJpbmcgb3V0IHRoZSBpdGVtcyB0aGF0IG92ZXJsYXBzIHdpdGggZmluZGVyIHBhdHRlcm5cclxuICpcclxuICogQGV4YW1wbGVcclxuICogRm9yIGEgVmVyc2lvbiA3IHN5bWJvbCB7QGxpbmsgZ2V0Um93Q29sQ29vcmRzfSByZXR1cm5zIHZhbHVlcyA2LCAyMiBhbmQgMzguXHJcbiAqIFRoZSBhbGlnbm1lbnQgcGF0dGVybnMsIHRoZXJlZm9yZSwgYXJlIHRvIGJlIGNlbnRlcmVkIG9uIChyb3csIGNvbHVtbilcclxuICogcG9zaXRpb25zICg2LDIyKSwgKDIyLDYpLCAoMjIsMjIpLCAoMjIsMzgpLCAoMzgsMjIpLCAoMzgsMzgpLlxyXG4gKiBOb3RlIHRoYXQgdGhlIGNvb3JkaW5hdGVzICg2LDYpLCAoNiwzOCksICgzOCw2KSBhcmUgb2NjdXBpZWQgYnkgZmluZGVyIHBhdHRlcm5zXHJcbiAqIGFuZCBhcmUgbm90IHRoZXJlZm9yZSB1c2VkIGZvciBhbGlnbm1lbnQgcGF0dGVybnMuXHJcbiAqXHJcbiAqIGxldCBwb3MgPSBnZXRQb3NpdGlvbnMoNylcclxuICogLy8gW1s2LDIyXSwgWzIyLDZdLCBbMjIsMjJdLCBbMjIsMzhdLCBbMzgsMjJdLCBbMzgsMzhdXVxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICBBcnJheSBvZiBjb29yZGluYXRlc1xyXG4gKi9cclxuZXhwb3J0cy5nZXRQb3NpdGlvbnMgPSBmdW5jdGlvbiBnZXRQb3NpdGlvbnMgKHZlcnNpb24pIHtcclxuICBjb25zdCBjb29yZHMgPSBbXVxyXG4gIGNvbnN0IHBvcyA9IGV4cG9ydHMuZ2V0Um93Q29sQ29vcmRzKHZlcnNpb24pXHJcbiAgY29uc3QgcG9zTGVuZ3RoID0gcG9zLmxlbmd0aFxyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc0xlbmd0aDsgaSsrKSB7XHJcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvc0xlbmd0aDsgaisrKSB7XHJcbiAgICAgIC8vIFNraXAgaWYgcG9zaXRpb24gaXMgb2NjdXBpZWQgYnkgZmluZGVyIHBhdHRlcm5zXHJcbiAgICAgIGlmICgoaSA9PT0gMCAmJiBqID09PSAwKSB8fCAvLyB0b3AtbGVmdFxyXG4gICAgICAgICAgKGkgPT09IDAgJiYgaiA9PT0gcG9zTGVuZ3RoIC0gMSkgfHwgLy8gYm90dG9tLWxlZnRcclxuICAgICAgICAgIChpID09PSBwb3NMZW5ndGggLSAxICYmIGogPT09IDApKSB7IC8vIHRvcC1yaWdodFxyXG4gICAgICAgIGNvbnRpbnVlXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvb3Jkcy5wdXNoKFtwb3NbaV0sIHBvc1tqXV0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gY29vcmRzXHJcbn1cclxuIiwiY29uc3QgZ2V0U3ltYm9sU2l6ZSA9IHJlcXVpcmUoJy4vdXRpbHMnKS5nZXRTeW1ib2xTaXplXHJcbmNvbnN0IEZJTkRFUl9QQVRURVJOX1NJWkUgPSA3XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBwb3NpdGlvbnMgb2YgZWFjaCBmaW5kZXIgcGF0dGVybi5cclxuICogRWFjaCBhcnJheSdzIGVsZW1lbnQgcmVwcmVzZW50IHRoZSB0b3AtbGVmdCBwb2ludCBvZiB0aGUgcGF0dGVybiBhcyAoeCwgeSkgY29vcmRpbmF0ZXNcclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgQXJyYXkgb2YgY29vcmRpbmF0ZXNcclxuICovXHJcbmV4cG9ydHMuZ2V0UG9zaXRpb25zID0gZnVuY3Rpb24gZ2V0UG9zaXRpb25zICh2ZXJzaW9uKSB7XHJcbiAgY29uc3Qgc2l6ZSA9IGdldFN5bWJvbFNpemUodmVyc2lvbilcclxuXHJcbiAgcmV0dXJuIFtcclxuICAgIC8vIHRvcC1sZWZ0XHJcbiAgICBbMCwgMF0sXHJcbiAgICAvLyB0b3AtcmlnaHRcclxuICAgIFtzaXplIC0gRklOREVSX1BBVFRFUk5fU0laRSwgMF0sXHJcbiAgICAvLyBib3R0b20tbGVmdFxyXG4gICAgWzAsIHNpemUgLSBGSU5ERVJfUEFUVEVSTl9TSVpFXVxyXG4gIF1cclxufVxyXG4iLCIvKipcclxuICogRGF0YSBtYXNrIHBhdHRlcm4gcmVmZXJlbmNlXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG5leHBvcnRzLlBhdHRlcm5zID0ge1xyXG4gIFBBVFRFUk4wMDA6IDAsXHJcbiAgUEFUVEVSTjAwMTogMSxcclxuICBQQVRURVJOMDEwOiAyLFxyXG4gIFBBVFRFUk4wMTE6IDMsXHJcbiAgUEFUVEVSTjEwMDogNCxcclxuICBQQVRURVJOMTAxOiA1LFxyXG4gIFBBVFRFUk4xMTA6IDYsXHJcbiAgUEFUVEVSTjExMTogN1xyXG59XHJcblxyXG4vKipcclxuICogV2VpZ2h0ZWQgcGVuYWx0eSBzY29yZXMgZm9yIHRoZSB1bmRlc2lyYWJsZSBmZWF0dXJlc1xyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxuY29uc3QgUGVuYWx0eVNjb3JlcyA9IHtcclxuICBOMTogMyxcclxuICBOMjogMyxcclxuICBOMzogNDAsXHJcbiAgTjQ6IDEwXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVjayBpZiBtYXNrIHBhdHRlcm4gdmFsdWUgaXMgdmFsaWRcclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSAgbWFzayAgICBNYXNrIHBhdHRlcm5cclxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICB0cnVlIGlmIHZhbGlkLCBmYWxzZSBvdGhlcndpc2VcclxuICovXHJcbmV4cG9ydHMuaXNWYWxpZCA9IGZ1bmN0aW9uIGlzVmFsaWQgKG1hc2spIHtcclxuICByZXR1cm4gbWFzayAhPSBudWxsICYmIG1hc2sgIT09ICcnICYmICFpc05hTihtYXNrKSAmJiBtYXNrID49IDAgJiYgbWFzayA8PSA3XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIG1hc2sgcGF0dGVybiBmcm9tIGEgdmFsdWUuXHJcbiAqIElmIHZhbHVlIGlzIG5vdCB2YWxpZCwgcmV0dXJucyB1bmRlZmluZWRcclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfFN0cmluZ30gdmFsdWUgICAgICAgIE1hc2sgcGF0dGVybiB2YWx1ZVxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgVmFsaWQgbWFzayBwYXR0ZXJuIG9yIHVuZGVmaW5lZFxyXG4gKi9cclxuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSAodmFsdWUpIHtcclxuICByZXR1cm4gZXhwb3J0cy5pc1ZhbGlkKHZhbHVlKSA/IHBhcnNlSW50KHZhbHVlLCAxMCkgOiB1bmRlZmluZWRcclxufVxyXG5cclxuLyoqXHJcbiogRmluZCBhZGphY2VudCBtb2R1bGVzIGluIHJvdy9jb2x1bW4gd2l0aCB0aGUgc2FtZSBjb2xvclxyXG4qIGFuZCBhc3NpZ24gYSBwZW5hbHR5IHZhbHVlLlxyXG4qXHJcbiogUG9pbnRzOiBOMSArIGlcclxuKiBpIGlzIHRoZSBhbW91bnQgYnkgd2hpY2ggdGhlIG51bWJlciBvZiBhZGphY2VudCBtb2R1bGVzIG9mIHRoZSBzYW1lIGNvbG9yIGV4Y2VlZHMgNVxyXG4qL1xyXG5leHBvcnRzLmdldFBlbmFsdHlOMSA9IGZ1bmN0aW9uIGdldFBlbmFsdHlOMSAoZGF0YSkge1xyXG4gIGNvbnN0IHNpemUgPSBkYXRhLnNpemVcclxuICBsZXQgcG9pbnRzID0gMFxyXG4gIGxldCBzYW1lQ291bnRDb2wgPSAwXHJcbiAgbGV0IHNhbWVDb3VudFJvdyA9IDBcclxuICBsZXQgbGFzdENvbCA9IG51bGxcclxuICBsZXQgbGFzdFJvdyA9IG51bGxcclxuXHJcbiAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgc2l6ZTsgcm93KyspIHtcclxuICAgIHNhbWVDb3VudENvbCA9IHNhbWVDb3VudFJvdyA9IDBcclxuICAgIGxhc3RDb2wgPSBsYXN0Um93ID0gbnVsbFxyXG5cclxuICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IHNpemU7IGNvbCsrKSB7XHJcbiAgICAgIGxldCBtb2R1bGUgPSBkYXRhLmdldChyb3csIGNvbClcclxuICAgICAgaWYgKG1vZHVsZSA9PT0gbGFzdENvbCkge1xyXG4gICAgICAgIHNhbWVDb3VudENvbCsrXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKHNhbWVDb3VudENvbCA+PSA1KSBwb2ludHMgKz0gUGVuYWx0eVNjb3Jlcy5OMSArIChzYW1lQ291bnRDb2wgLSA1KVxyXG4gICAgICAgIGxhc3RDb2wgPSBtb2R1bGVcclxuICAgICAgICBzYW1lQ291bnRDb2wgPSAxXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG1vZHVsZSA9IGRhdGEuZ2V0KGNvbCwgcm93KVxyXG4gICAgICBpZiAobW9kdWxlID09PSBsYXN0Um93KSB7XHJcbiAgICAgICAgc2FtZUNvdW50Um93KytcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoc2FtZUNvdW50Um93ID49IDUpIHBvaW50cyArPSBQZW5hbHR5U2NvcmVzLk4xICsgKHNhbWVDb3VudFJvdyAtIDUpXHJcbiAgICAgICAgbGFzdFJvdyA9IG1vZHVsZVxyXG4gICAgICAgIHNhbWVDb3VudFJvdyA9IDFcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChzYW1lQ291bnRDb2wgPj0gNSkgcG9pbnRzICs9IFBlbmFsdHlTY29yZXMuTjEgKyAoc2FtZUNvdW50Q29sIC0gNSlcclxuICAgIGlmIChzYW1lQ291bnRSb3cgPj0gNSkgcG9pbnRzICs9IFBlbmFsdHlTY29yZXMuTjEgKyAoc2FtZUNvdW50Um93IC0gNSlcclxuICB9XHJcblxyXG4gIHJldHVybiBwb2ludHNcclxufVxyXG5cclxuLyoqXHJcbiAqIEZpbmQgMngyIGJsb2NrcyB3aXRoIHRoZSBzYW1lIGNvbG9yIGFuZCBhc3NpZ24gYSBwZW5hbHR5IHZhbHVlXHJcbiAqXHJcbiAqIFBvaW50czogTjIgKiAobSAtIDEpICogKG4gLSAxKVxyXG4gKi9cclxuZXhwb3J0cy5nZXRQZW5hbHR5TjIgPSBmdW5jdGlvbiBnZXRQZW5hbHR5TjIgKGRhdGEpIHtcclxuICBjb25zdCBzaXplID0gZGF0YS5zaXplXHJcbiAgbGV0IHBvaW50cyA9IDBcclxuXHJcbiAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgc2l6ZSAtIDE7IHJvdysrKSB7XHJcbiAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBzaXplIC0gMTsgY29sKyspIHtcclxuICAgICAgY29uc3QgbGFzdCA9IGRhdGEuZ2V0KHJvdywgY29sKSArXHJcbiAgICAgICAgZGF0YS5nZXQocm93LCBjb2wgKyAxKSArXHJcbiAgICAgICAgZGF0YS5nZXQocm93ICsgMSwgY29sKSArXHJcbiAgICAgICAgZGF0YS5nZXQocm93ICsgMSwgY29sICsgMSlcclxuXHJcbiAgICAgIGlmIChsYXN0ID09PSA0IHx8IGxhc3QgPT09IDApIHBvaW50cysrXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcG9pbnRzICogUGVuYWx0eVNjb3Jlcy5OMlxyXG59XHJcblxyXG4vKipcclxuICogRmluZCAxOjE6MzoxOjEgcmF0aW8gKGRhcms6bGlnaHQ6ZGFyazpsaWdodDpkYXJrKSBwYXR0ZXJuIGluIHJvdy9jb2x1bW4sXHJcbiAqIHByZWNlZGVkIG9yIGZvbGxvd2VkIGJ5IGxpZ2h0IGFyZWEgNCBtb2R1bGVzIHdpZGVcclxuICpcclxuICogUG9pbnRzOiBOMyAqIG51bWJlciBvZiBwYXR0ZXJuIGZvdW5kXHJcbiAqL1xyXG5leHBvcnRzLmdldFBlbmFsdHlOMyA9IGZ1bmN0aW9uIGdldFBlbmFsdHlOMyAoZGF0YSkge1xyXG4gIGNvbnN0IHNpemUgPSBkYXRhLnNpemVcclxuICBsZXQgcG9pbnRzID0gMFxyXG4gIGxldCBiaXRzQ29sID0gMFxyXG4gIGxldCBiaXRzUm93ID0gMFxyXG5cclxuICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBzaXplOyByb3crKykge1xyXG4gICAgYml0c0NvbCA9IGJpdHNSb3cgPSAwXHJcbiAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBzaXplOyBjb2wrKykge1xyXG4gICAgICBiaXRzQ29sID0gKChiaXRzQ29sIDw8IDEpICYgMHg3RkYpIHwgZGF0YS5nZXQocm93LCBjb2wpXHJcbiAgICAgIGlmIChjb2wgPj0gMTAgJiYgKGJpdHNDb2wgPT09IDB4NUQwIHx8IGJpdHNDb2wgPT09IDB4MDVEKSkgcG9pbnRzKytcclxuXHJcbiAgICAgIGJpdHNSb3cgPSAoKGJpdHNSb3cgPDwgMSkgJiAweDdGRikgfCBkYXRhLmdldChjb2wsIHJvdylcclxuICAgICAgaWYgKGNvbCA+PSAxMCAmJiAoYml0c1JvdyA9PT0gMHg1RDAgfHwgYml0c1JvdyA9PT0gMHgwNUQpKSBwb2ludHMrK1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHBvaW50cyAqIFBlbmFsdHlTY29yZXMuTjNcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZSBwcm9wb3J0aW9uIG9mIGRhcmsgbW9kdWxlcyBpbiBlbnRpcmUgc3ltYm9sXHJcbiAqXHJcbiAqIFBvaW50czogTjQgKiBrXHJcbiAqXHJcbiAqIGsgaXMgdGhlIHJhdGluZyBvZiB0aGUgZGV2aWF0aW9uIG9mIHRoZSBwcm9wb3J0aW9uIG9mIGRhcmsgbW9kdWxlc1xyXG4gKiBpbiB0aGUgc3ltYm9sIGZyb20gNTAlIGluIHN0ZXBzIG9mIDUlXHJcbiAqL1xyXG5leHBvcnRzLmdldFBlbmFsdHlONCA9IGZ1bmN0aW9uIGdldFBlbmFsdHlONCAoZGF0YSkge1xyXG4gIGxldCBkYXJrQ291bnQgPSAwXHJcbiAgY29uc3QgbW9kdWxlc0NvdW50ID0gZGF0YS5kYXRhLmxlbmd0aFxyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IG1vZHVsZXNDb3VudDsgaSsrKSBkYXJrQ291bnQgKz0gZGF0YS5kYXRhW2ldXHJcblxyXG4gIGNvbnN0IGsgPSBNYXRoLmFicyhNYXRoLmNlaWwoKGRhcmtDb3VudCAqIDEwMCAvIG1vZHVsZXNDb3VudCkgLyA1KSAtIDEwKVxyXG5cclxuICByZXR1cm4gayAqIFBlbmFsdHlTY29yZXMuTjRcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybiBtYXNrIHZhbHVlIGF0IGdpdmVuIHBvc2l0aW9uXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gbWFza1BhdHRlcm4gUGF0dGVybiByZWZlcmVuY2UgdmFsdWVcclxuICogQHBhcmFtICB7TnVtYmVyfSBpICAgICAgICAgICBSb3dcclxuICogQHBhcmFtICB7TnVtYmVyfSBqICAgICAgICAgICBDb2x1bW5cclxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICAgICBNYXNrIHZhbHVlXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRNYXNrQXQgKG1hc2tQYXR0ZXJuLCBpLCBqKSB7XHJcbiAgc3dpdGNoIChtYXNrUGF0dGVybikge1xyXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4wMDA6IHJldHVybiAoaSArIGopICUgMiA9PT0gMFxyXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4wMDE6IHJldHVybiBpICUgMiA9PT0gMFxyXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4wMTA6IHJldHVybiBqICUgMyA9PT0gMFxyXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4wMTE6IHJldHVybiAoaSArIGopICUgMyA9PT0gMFxyXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4xMDA6IHJldHVybiAoTWF0aC5mbG9vcihpIC8gMikgKyBNYXRoLmZsb29yKGogLyAzKSkgJSAyID09PSAwXHJcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjEwMTogcmV0dXJuIChpICogaikgJSAyICsgKGkgKiBqKSAlIDMgPT09IDBcclxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMTEwOiByZXR1cm4gKChpICogaikgJSAyICsgKGkgKiBqKSAlIDMpICUgMiA9PT0gMFxyXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4xMTE6IHJldHVybiAoKGkgKiBqKSAlIDMgKyAoaSArIGopICUgMikgJSAyID09PSAwXHJcblxyXG4gICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKCdiYWQgbWFza1BhdHRlcm46JyArIG1hc2tQYXR0ZXJuKVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFwcGx5IGEgbWFzayBwYXR0ZXJuIHRvIGEgQml0TWF0cml4XHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gICAgcGF0dGVybiBQYXR0ZXJuIHJlZmVyZW5jZSBudW1iZXJcclxuICogQHBhcmFtICB7Qml0TWF0cml4fSBkYXRhICAgIEJpdE1hdHJpeCBkYXRhXHJcbiAqL1xyXG5leHBvcnRzLmFwcGx5TWFzayA9IGZ1bmN0aW9uIGFwcGx5TWFzayAocGF0dGVybiwgZGF0YSkge1xyXG4gIGNvbnN0IHNpemUgPSBkYXRhLnNpemVcclxuXHJcbiAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgc2l6ZTsgY29sKyspIHtcclxuICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHNpemU7IHJvdysrKSB7XHJcbiAgICAgIGlmIChkYXRhLmlzUmVzZXJ2ZWQocm93LCBjb2wpKSBjb250aW51ZVxyXG4gICAgICBkYXRhLnhvcihyb3csIGNvbCwgZ2V0TWFza0F0KHBhdHRlcm4sIHJvdywgY29sKSlcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBiZXN0IG1hc2sgcGF0dGVybiBmb3IgZGF0YVxyXG4gKlxyXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IGRhdGFcclxuICogQHJldHVybiB7TnVtYmVyfSBNYXNrIHBhdHRlcm4gcmVmZXJlbmNlIG51bWJlclxyXG4gKi9cclxuZXhwb3J0cy5nZXRCZXN0TWFzayA9IGZ1bmN0aW9uIGdldEJlc3RNYXNrIChkYXRhLCBzZXR1cEZvcm1hdEZ1bmMpIHtcclxuICBjb25zdCBudW1QYXR0ZXJucyA9IE9iamVjdC5rZXlzKGV4cG9ydHMuUGF0dGVybnMpLmxlbmd0aFxyXG4gIGxldCBiZXN0UGF0dGVybiA9IDBcclxuICBsZXQgbG93ZXJQZW5hbHR5ID0gSW5maW5pdHlcclxuXHJcbiAgZm9yIChsZXQgcCA9IDA7IHAgPCBudW1QYXR0ZXJuczsgcCsrKSB7XHJcbiAgICBzZXR1cEZvcm1hdEZ1bmMocClcclxuICAgIGV4cG9ydHMuYXBwbHlNYXNrKHAsIGRhdGEpXHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHBlbmFsdHlcclxuICAgIGNvbnN0IHBlbmFsdHkgPVxyXG4gICAgICBleHBvcnRzLmdldFBlbmFsdHlOMShkYXRhKSArXHJcbiAgICAgIGV4cG9ydHMuZ2V0UGVuYWx0eU4yKGRhdGEpICtcclxuICAgICAgZXhwb3J0cy5nZXRQZW5hbHR5TjMoZGF0YSkgK1xyXG4gICAgICBleHBvcnRzLmdldFBlbmFsdHlONChkYXRhKVxyXG5cclxuICAgIC8vIFVuZG8gcHJldmlvdXNseSBhcHBsaWVkIG1hc2tcclxuICAgIGV4cG9ydHMuYXBwbHlNYXNrKHAsIGRhdGEpXHJcblxyXG4gICAgaWYgKHBlbmFsdHkgPCBsb3dlclBlbmFsdHkpIHtcclxuICAgICAgbG93ZXJQZW5hbHR5ID0gcGVuYWx0eVxyXG4gICAgICBiZXN0UGF0dGVybiA9IHBcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBiZXN0UGF0dGVyblxyXG59XHJcbiIsImNvbnN0IEVDTGV2ZWwgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwnKVxyXG5cclxuY29uc3QgRUNfQkxPQ0tTX1RBQkxFID0gW1xyXG4vLyBMICBNICBRICBIXHJcbiAgMSwgMSwgMSwgMSxcclxuICAxLCAxLCAxLCAxLFxyXG4gIDEsIDEsIDIsIDIsXHJcbiAgMSwgMiwgMiwgNCxcclxuICAxLCAyLCA0LCA0LFxyXG4gIDIsIDQsIDQsIDQsXHJcbiAgMiwgNCwgNiwgNSxcclxuICAyLCA0LCA2LCA2LFxyXG4gIDIsIDUsIDgsIDgsXHJcbiAgNCwgNSwgOCwgOCxcclxuICA0LCA1LCA4LCAxMSxcclxuICA0LCA4LCAxMCwgMTEsXHJcbiAgNCwgOSwgMTIsIDE2LFxyXG4gIDQsIDksIDE2LCAxNixcclxuICA2LCAxMCwgMTIsIDE4LFxyXG4gIDYsIDEwLCAxNywgMTYsXHJcbiAgNiwgMTEsIDE2LCAxOSxcclxuICA2LCAxMywgMTgsIDIxLFxyXG4gIDcsIDE0LCAyMSwgMjUsXHJcbiAgOCwgMTYsIDIwLCAyNSxcclxuICA4LCAxNywgMjMsIDI1LFxyXG4gIDksIDE3LCAyMywgMzQsXHJcbiAgOSwgMTgsIDI1LCAzMCxcclxuICAxMCwgMjAsIDI3LCAzMixcclxuICAxMiwgMjEsIDI5LCAzNSxcclxuICAxMiwgMjMsIDM0LCAzNyxcclxuICAxMiwgMjUsIDM0LCA0MCxcclxuICAxMywgMjYsIDM1LCA0MixcclxuICAxNCwgMjgsIDM4LCA0NSxcclxuICAxNSwgMjksIDQwLCA0OCxcclxuICAxNiwgMzEsIDQzLCA1MSxcclxuICAxNywgMzMsIDQ1LCA1NCxcclxuICAxOCwgMzUsIDQ4LCA1NyxcclxuICAxOSwgMzcsIDUxLCA2MCxcclxuICAxOSwgMzgsIDUzLCA2MyxcclxuICAyMCwgNDAsIDU2LCA2NixcclxuICAyMSwgNDMsIDU5LCA3MCxcclxuICAyMiwgNDUsIDYyLCA3NCxcclxuICAyNCwgNDcsIDY1LCA3NyxcclxuICAyNSwgNDksIDY4LCA4MVxyXG5dXHJcblxyXG5jb25zdCBFQ19DT0RFV09SRFNfVEFCTEUgPSBbXHJcbi8vIEwgIE0gIFEgIEhcclxuICA3LCAxMCwgMTMsIDE3LFxyXG4gIDEwLCAxNiwgMjIsIDI4LFxyXG4gIDE1LCAyNiwgMzYsIDQ0LFxyXG4gIDIwLCAzNiwgNTIsIDY0LFxyXG4gIDI2LCA0OCwgNzIsIDg4LFxyXG4gIDM2LCA2NCwgOTYsIDExMixcclxuICA0MCwgNzIsIDEwOCwgMTMwLFxyXG4gIDQ4LCA4OCwgMTMyLCAxNTYsXHJcbiAgNjAsIDExMCwgMTYwLCAxOTIsXHJcbiAgNzIsIDEzMCwgMTkyLCAyMjQsXHJcbiAgODAsIDE1MCwgMjI0LCAyNjQsXHJcbiAgOTYsIDE3NiwgMjYwLCAzMDgsXHJcbiAgMTA0LCAxOTgsIDI4OCwgMzUyLFxyXG4gIDEyMCwgMjE2LCAzMjAsIDM4NCxcclxuICAxMzIsIDI0MCwgMzYwLCA0MzIsXHJcbiAgMTQ0LCAyODAsIDQwOCwgNDgwLFxyXG4gIDE2OCwgMzA4LCA0NDgsIDUzMixcclxuICAxODAsIDMzOCwgNTA0LCA1ODgsXHJcbiAgMTk2LCAzNjQsIDU0NiwgNjUwLFxyXG4gIDIyNCwgNDE2LCA2MDAsIDcwMCxcclxuICAyMjQsIDQ0MiwgNjQ0LCA3NTAsXHJcbiAgMjUyLCA0NzYsIDY5MCwgODE2LFxyXG4gIDI3MCwgNTA0LCA3NTAsIDkwMCxcclxuICAzMDAsIDU2MCwgODEwLCA5NjAsXHJcbiAgMzEyLCA1ODgsIDg3MCwgMTA1MCxcclxuICAzMzYsIDY0NCwgOTUyLCAxMTEwLFxyXG4gIDM2MCwgNzAwLCAxMDIwLCAxMjAwLFxyXG4gIDM5MCwgNzI4LCAxMDUwLCAxMjYwLFxyXG4gIDQyMCwgNzg0LCAxMTQwLCAxMzUwLFxyXG4gIDQ1MCwgODEyLCAxMjAwLCAxNDQwLFxyXG4gIDQ4MCwgODY4LCAxMjkwLCAxNTMwLFxyXG4gIDUxMCwgOTI0LCAxMzUwLCAxNjIwLFxyXG4gIDU0MCwgOTgwLCAxNDQwLCAxNzEwLFxyXG4gIDU3MCwgMTAzNiwgMTUzMCwgMTgwMCxcclxuICA1NzAsIDEwNjQsIDE1OTAsIDE4OTAsXHJcbiAgNjAwLCAxMTIwLCAxNjgwLCAxOTgwLFxyXG4gIDYzMCwgMTIwNCwgMTc3MCwgMjEwMCxcclxuICA2NjAsIDEyNjAsIDE4NjAsIDIyMjAsXHJcbiAgNzIwLCAxMzE2LCAxOTUwLCAyMzEwLFxyXG4gIDc1MCwgMTM3MiwgMjA0MCwgMjQzMFxyXG5dXHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gYmxvY2sgdGhhdCB0aGUgUVIgQ29kZSBzaG91bGQgY29udGFpblxyXG4gKiBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uIGFuZCBlcnJvciBjb3JyZWN0aW9uIGxldmVsLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgICBOdW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBibG9ja3NcclxuICovXHJcbmV4cG9ydHMuZ2V0QmxvY2tzQ291bnQgPSBmdW5jdGlvbiBnZXRCbG9ja3NDb3VudCAodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcclxuICBzd2l0Y2ggKGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgICBjYXNlIEVDTGV2ZWwuTDpcclxuICAgICAgcmV0dXJuIEVDX0JMT0NLU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDBdXHJcbiAgICBjYXNlIEVDTGV2ZWwuTTpcclxuICAgICAgcmV0dXJuIEVDX0JMT0NLU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDFdXHJcbiAgICBjYXNlIEVDTGV2ZWwuUTpcclxuICAgICAgcmV0dXJuIEVDX0JMT0NLU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDJdXHJcbiAgICBjYXNlIEVDTGV2ZWwuSDpcclxuICAgICAgcmV0dXJuIEVDX0JMT0NLU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDNdXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzIHRvIHVzZSBmb3IgdGhlIHNwZWNpZmllZFxyXG4gKiB2ZXJzaW9uIGFuZCBlcnJvciBjb3JyZWN0aW9uIGxldmVsLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgICBOdW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHNcclxuICovXHJcbmV4cG9ydHMuZ2V0VG90YWxDb2Rld29yZHNDb3VudCA9IGZ1bmN0aW9uIGdldFRvdGFsQ29kZXdvcmRzQ291bnQgKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgc3dpdGNoIChlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gICAgY2FzZSBFQ0xldmVsLkw6XHJcbiAgICAgIHJldHVybiBFQ19DT0RFV09SRFNfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAwXVxyXG4gICAgY2FzZSBFQ0xldmVsLk06XHJcbiAgICAgIHJldHVybiBFQ19DT0RFV09SRFNfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAxXVxyXG4gICAgY2FzZSBFQ0xldmVsLlE6XHJcbiAgICAgIHJldHVybiBFQ19DT0RFV09SRFNfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAyXVxyXG4gICAgY2FzZSBFQ0xldmVsLkg6XHJcbiAgICAgIHJldHVybiBFQ19DT0RFV09SRFNfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAzXVxyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIH1cclxufVxyXG4iLCJjb25zdCBFWFBfVEFCTEUgPSBuZXcgVWludDhBcnJheSg1MTIpXHJcbmNvbnN0IExPR19UQUJMRSA9IG5ldyBVaW50OEFycmF5KDI1NilcclxuLyoqXHJcbiAqIFByZWNvbXB1dGUgdGhlIGxvZyBhbmQgYW50aS1sb2cgdGFibGVzIGZvciBmYXN0ZXIgY29tcHV0YXRpb24gbGF0ZXJcclxuICpcclxuICogRm9yIGVhY2ggcG9zc2libGUgdmFsdWUgaW4gdGhlIGdhbG9pcyBmaWVsZCAyXjgsIHdlIHdpbGwgcHJlLWNvbXB1dGVcclxuICogdGhlIGxvZ2FyaXRobSBhbmQgYW50aS1sb2dhcml0aG0gKGV4cG9uZW50aWFsKSBvZiB0aGlzIHZhbHVlXHJcbiAqXHJcbiAqIHJlZiB7QGxpbmsgaHR0cHM6Ly9lbi53aWtpdmVyc2l0eS5vcmcvd2lraS9SZWVkJUUyJTgwJTkzU29sb21vbl9jb2Rlc19mb3JfY29kZXJzI0ludHJvZHVjdGlvbl90b19tYXRoZW1hdGljYWxfZmllbGRzfVxyXG4gKi9cclxuOyhmdW5jdGlvbiBpbml0VGFibGVzICgpIHtcclxuICBsZXQgeCA9IDFcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IDI1NTsgaSsrKSB7XHJcbiAgICBFWFBfVEFCTEVbaV0gPSB4XHJcbiAgICBMT0dfVEFCTEVbeF0gPSBpXHJcblxyXG4gICAgeCA8PD0gMSAvLyBtdWx0aXBseSBieSAyXHJcblxyXG4gICAgLy8gVGhlIFFSIGNvZGUgc3BlY2lmaWNhdGlvbiBzYXlzIHRvIHVzZSBieXRlLXdpc2UgbW9kdWxvIDEwMDAxMTEwMSBhcml0aG1ldGljLlxyXG4gICAgLy8gVGhpcyBtZWFucyB0aGF0IHdoZW4gYSBudW1iZXIgaXMgMjU2IG9yIGxhcmdlciwgaXQgc2hvdWxkIGJlIFhPUmVkIHdpdGggMHgxMUQuXHJcbiAgICBpZiAoeCAmIDB4MTAwKSB7IC8vIHNpbWlsYXIgdG8geCA+PSAyNTYsIGJ1dCBhIGxvdCBmYXN0ZXIgKGJlY2F1c2UgMHgxMDAgPT0gMjU2KVxyXG4gICAgICB4IF49IDB4MTFEXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBPcHRpbWl6YXRpb246IGRvdWJsZSB0aGUgc2l6ZSBvZiB0aGUgYW50aS1sb2cgdGFibGUgc28gdGhhdCB3ZSBkb24ndCBuZWVkIHRvIG1vZCAyNTUgdG9cclxuICAvLyBzdGF5IGluc2lkZSB0aGUgYm91bmRzIChiZWNhdXNlIHdlIHdpbGwgbWFpbmx5IHVzZSB0aGlzIHRhYmxlIGZvciB0aGUgbXVsdGlwbGljYXRpb24gb2ZcclxuICAvLyB0d28gR0YgbnVtYmVycywgbm8gbW9yZSkuXHJcbiAgLy8gQHNlZSB7QGxpbmsgbXVsfVxyXG4gIGZvciAobGV0IGkgPSAyNTU7IGkgPCA1MTI7IGkrKykge1xyXG4gICAgRVhQX1RBQkxFW2ldID0gRVhQX1RBQkxFW2kgLSAyNTVdXHJcbiAgfVxyXG59KCkpXHJcblxyXG4vKipcclxuICogUmV0dXJucyBsb2cgdmFsdWUgb2YgbiBpbnNpZGUgR2Fsb2lzIEZpZWxkXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gblxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XHJcbiAqL1xyXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uIGxvZyAobikge1xyXG4gIGlmIChuIDwgMSkgdGhyb3cgbmV3IEVycm9yKCdsb2coJyArIG4gKyAnKScpXHJcbiAgcmV0dXJuIExPR19UQUJMRVtuXVxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhbnRpLWxvZyB2YWx1ZSBvZiBuIGluc2lkZSBHYWxvaXMgRmllbGRcclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSBuXHJcbiAqIEByZXR1cm4ge051bWJlcn1cclxuICovXHJcbmV4cG9ydHMuZXhwID0gZnVuY3Rpb24gZXhwIChuKSB7XHJcbiAgcmV0dXJuIEVYUF9UQUJMRVtuXVxyXG59XHJcblxyXG4vKipcclxuICogTXVsdGlwbGllcyB0d28gbnVtYmVyIGluc2lkZSBHYWxvaXMgRmllbGRcclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSB4XHJcbiAqIEBwYXJhbSAge051bWJlcn0geVxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XHJcbiAqL1xyXG5leHBvcnRzLm11bCA9IGZ1bmN0aW9uIG11bCAoeCwgeSkge1xyXG4gIGlmICh4ID09PSAwIHx8IHkgPT09IDApIHJldHVybiAwXHJcblxyXG4gIC8vIHNob3VsZCBiZSBFWFBfVEFCTEVbKExPR19UQUJMRVt4XSArIExPR19UQUJMRVt5XSkgJSAyNTVdIGlmIEVYUF9UQUJMRSB3YXNuJ3Qgb3ZlcnNpemVkXHJcbiAgLy8gQHNlZSB7QGxpbmsgaW5pdFRhYmxlc31cclxuICByZXR1cm4gRVhQX1RBQkxFW0xPR19UQUJMRVt4XSArIExPR19UQUJMRVt5XV1cclxufVxyXG4iLCJjb25zdCBHRiA9IHJlcXVpcmUoJy4vZ2Fsb2lzLWZpZWxkJylcclxuXHJcbi8qKlxyXG4gKiBNdWx0aXBsaWVzIHR3byBwb2x5bm9taWFscyBpbnNpZGUgR2Fsb2lzIEZpZWxkXHJcbiAqXHJcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IHAxIFBvbHlub21pYWxcclxuICogQHBhcmFtICB7VWludDhBcnJheX0gcDIgUG9seW5vbWlhbFxyXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICBQcm9kdWN0IG9mIHAxIGFuZCBwMlxyXG4gKi9cclxuZXhwb3J0cy5tdWwgPSBmdW5jdGlvbiBtdWwgKHAxLCBwMikge1xyXG4gIGNvbnN0IGNvZWZmID0gbmV3IFVpbnQ4QXJyYXkocDEubGVuZ3RoICsgcDIubGVuZ3RoIC0gMSlcclxuXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwMS5sZW5ndGg7IGkrKykge1xyXG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBwMi5sZW5ndGg7IGorKykge1xyXG4gICAgICBjb2VmZltpICsgal0gXj0gR0YubXVsKHAxW2ldLCBwMltqXSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBjb2VmZlxyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlIHRoZSByZW1haW5kZXIgb2YgcG9seW5vbWlhbHMgZGl2aXNpb25cclxuICpcclxuICogQHBhcmFtICB7VWludDhBcnJheX0gZGl2aWRlbnQgUG9seW5vbWlhbFxyXG4gKiBAcGFyYW0gIHtVaW50OEFycmF5fSBkaXZpc29yICBQb2x5bm9taWFsXHJcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9ICAgICAgICAgIFJlbWFpbmRlclxyXG4gKi9cclxuZXhwb3J0cy5tb2QgPSBmdW5jdGlvbiBtb2QgKGRpdmlkZW50LCBkaXZpc29yKSB7XHJcbiAgbGV0IHJlc3VsdCA9IG5ldyBVaW50OEFycmF5KGRpdmlkZW50KVxyXG5cclxuICB3aGlsZSAoKHJlc3VsdC5sZW5ndGggLSBkaXZpc29yLmxlbmd0aCkgPj0gMCkge1xyXG4gICAgY29uc3QgY29lZmYgPSByZXN1bHRbMF1cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpdmlzb3IubGVuZ3RoOyBpKyspIHtcclxuICAgICAgcmVzdWx0W2ldIF49IEdGLm11bChkaXZpc29yW2ldLCBjb2VmZilcclxuICAgIH1cclxuXHJcbiAgICAvLyByZW1vdmUgYWxsIHplcm9zIGZyb20gYnVmZmVyIGhlYWRcclxuICAgIGxldCBvZmZzZXQgPSAwXHJcbiAgICB3aGlsZSAob2Zmc2V0IDwgcmVzdWx0Lmxlbmd0aCAmJiByZXN1bHRbb2Zmc2V0XSA9PT0gMCkgb2Zmc2V0KytcclxuICAgIHJlc3VsdCA9IHJlc3VsdC5zbGljZShvZmZzZXQpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmVzdWx0XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZSBhbiBpcnJlZHVjaWJsZSBnZW5lcmF0b3IgcG9seW5vbWlhbCBvZiBzcGVjaWZpZWQgZGVncmVlXHJcbiAqICh1c2VkIGJ5IFJlZWQtU29sb21vbiBlbmNvZGVyKVxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGRlZ3JlZSBEZWdyZWUgb2YgdGhlIGdlbmVyYXRvciBwb2x5bm9taWFsXHJcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9ICAgIEJ1ZmZlciBjb250YWluaW5nIHBvbHlub21pYWwgY29lZmZpY2llbnRzXHJcbiAqL1xyXG5leHBvcnRzLmdlbmVyYXRlRUNQb2x5bm9taWFsID0gZnVuY3Rpb24gZ2VuZXJhdGVFQ1BvbHlub21pYWwgKGRlZ3JlZSkge1xyXG4gIGxldCBwb2x5ID0gbmV3IFVpbnQ4QXJyYXkoWzFdKVxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGVncmVlOyBpKyspIHtcclxuICAgIHBvbHkgPSBleHBvcnRzLm11bChwb2x5LCBuZXcgVWludDhBcnJheShbMSwgR0YuZXhwKGkpXSkpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gcG9seVxyXG59XHJcbiIsImNvbnN0IFBvbHlub21pYWwgPSByZXF1aXJlKCcuL3BvbHlub21pYWwnKVxyXG5cclxuZnVuY3Rpb24gUmVlZFNvbG9tb25FbmNvZGVyIChkZWdyZWUpIHtcclxuICB0aGlzLmdlblBvbHkgPSB1bmRlZmluZWRcclxuICB0aGlzLmRlZ3JlZSA9IGRlZ3JlZVxyXG5cclxuICBpZiAodGhpcy5kZWdyZWUpIHRoaXMuaW5pdGlhbGl6ZSh0aGlzLmRlZ3JlZSlcclxufVxyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemUgdGhlIGVuY29kZXIuXHJcbiAqIFRoZSBpbnB1dCBwYXJhbSBzaG91bGQgY29ycmVzcG9uZCB0byB0aGUgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGRlZ3JlZVxyXG4gKi9cclxuUmVlZFNvbG9tb25FbmNvZGVyLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24gaW5pdGlhbGl6ZSAoZGVncmVlKSB7XHJcbiAgLy8gY3JlYXRlIGFuIGlycmVkdWNpYmxlIGdlbmVyYXRvciBwb2x5bm9taWFsXHJcbiAgdGhpcy5kZWdyZWUgPSBkZWdyZWVcclxuICB0aGlzLmdlblBvbHkgPSBQb2x5bm9taWFsLmdlbmVyYXRlRUNQb2x5bm9taWFsKHRoaXMuZGVncmVlKVxyXG59XHJcblxyXG4vKipcclxuICogRW5jb2RlcyBhIGNodW5rIG9mIGRhdGFcclxuICpcclxuICogQHBhcmFtICB7VWludDhBcnJheX0gZGF0YSBCdWZmZXIgY29udGFpbmluZyBpbnB1dCBkYXRhXHJcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9ICAgICAgQnVmZmVyIGNvbnRhaW5pbmcgZW5jb2RlZCBkYXRhXHJcbiAqL1xyXG5SZWVkU29sb21vbkVuY29kZXIucHJvdG90eXBlLmVuY29kZSA9IGZ1bmN0aW9uIGVuY29kZSAoZGF0YSkge1xyXG4gIGlmICghdGhpcy5nZW5Qb2x5KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0VuY29kZXIgbm90IGluaXRpYWxpemVkJylcclxuICB9XHJcblxyXG4gIC8vIENhbGN1bGF0ZSBFQyBmb3IgdGhpcyBkYXRhIGJsb2NrXHJcbiAgLy8gZXh0ZW5kcyBkYXRhIHNpemUgdG8gZGF0YStnZW5Qb2x5IHNpemVcclxuICBjb25zdCBwYWRkZWREYXRhID0gbmV3IFVpbnQ4QXJyYXkoZGF0YS5sZW5ndGggKyB0aGlzLmRlZ3JlZSlcclxuICBwYWRkZWREYXRhLnNldChkYXRhKVxyXG5cclxuICAvLyBUaGUgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHMgYXJlIHRoZSByZW1haW5kZXIgYWZ0ZXIgZGl2aWRpbmcgdGhlIGRhdGEgY29kZXdvcmRzXHJcbiAgLy8gYnkgYSBnZW5lcmF0b3IgcG9seW5vbWlhbFxyXG4gIGNvbnN0IHJlbWFpbmRlciA9IFBvbHlub21pYWwubW9kKHBhZGRlZERhdGEsIHRoaXMuZ2VuUG9seSlcclxuXHJcbiAgLy8gcmV0dXJuIEVDIGRhdGEgYmxvY2tzIChsYXN0IG4gYnl0ZSwgd2hlcmUgbiBpcyB0aGUgZGVncmVlIG9mIGdlblBvbHkpXHJcbiAgLy8gSWYgY29lZmZpY2llbnRzIG51bWJlciBpbiByZW1haW5kZXIgYXJlIGxlc3MgdGhhbiBnZW5Qb2x5IGRlZ3JlZSxcclxuICAvLyBwYWQgd2l0aCAwcyB0byB0aGUgbGVmdCB0byByZWFjaCB0aGUgbmVlZGVkIG51bWJlciBvZiBjb2VmZmljaWVudHNcclxuICBjb25zdCBzdGFydCA9IHRoaXMuZGVncmVlIC0gcmVtYWluZGVyLmxlbmd0aFxyXG4gIGlmIChzdGFydCA+IDApIHtcclxuICAgIGNvbnN0IGJ1ZmYgPSBuZXcgVWludDhBcnJheSh0aGlzLmRlZ3JlZSlcclxuICAgIGJ1ZmYuc2V0KHJlbWFpbmRlciwgc3RhcnQpXHJcblxyXG4gICAgcmV0dXJuIGJ1ZmZcclxuICB9XHJcblxyXG4gIHJldHVybiByZW1haW5kZXJcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZWVkU29sb21vbkVuY29kZXJcclxuIiwiLyoqXHJcbiAqIENoZWNrIGlmIFFSIENvZGUgdmVyc2lvbiBpcyB2YWxpZFxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgIHRydWUgaWYgdmFsaWQgdmVyc2lvbiwgZmFsc2Ugb3RoZXJ3aXNlXHJcbiAqL1xyXG5leHBvcnRzLmlzVmFsaWQgPSBmdW5jdGlvbiBpc1ZhbGlkICh2ZXJzaW9uKSB7XHJcbiAgcmV0dXJuICFpc05hTih2ZXJzaW9uKSAmJiB2ZXJzaW9uID49IDEgJiYgdmVyc2lvbiA8PSA0MFxyXG59XHJcbiIsImNvbnN0IG51bWVyaWMgPSAnWzAtOV0rJ1xyXG5jb25zdCBhbHBoYW51bWVyaWMgPSAnW0EtWiAkJSorXFxcXC0uLzpdKydcclxubGV0IGthbmppID0gJyg/Olt1MzAwMC11MzAzRl18W3UzMDQwLXUzMDlGXXxbdTMwQTAtdTMwRkZdfCcgK1xyXG4gICdbdUZGMDAtdUZGRUZdfFt1NEUwMC11OUZBRl18W3UyNjA1LXUyNjA2XXxbdTIxOTAtdTIxOTVdfHUyMDNCfCcgK1xyXG4gICdbdTIwMTB1MjAxNXUyMDE4dTIwMTl1MjAyNXUyMDI2dTIwMUN1MjAxRHUyMjI1dTIyNjBdfCcgK1xyXG4gICdbdTAzOTEtdTA0NTFdfFt1MDBBN3UwMEE4dTAwQjF1MDBCNHUwMEQ3dTAwRjddKSsnXHJcbmthbmppID0ga2FuamkucmVwbGFjZSgvdS9nLCAnXFxcXHUnKVxyXG5cclxuY29uc3QgYnl0ZSA9ICcoPzooPyFbQS1aMC05ICQlKitcXFxcLS4vOl18JyArIGthbmppICsgJykoPzoufFtcXHJcXG5dKSkrJ1xyXG5cclxuZXhwb3J0cy5LQU5KSSA9IG5ldyBSZWdFeHAoa2FuamksICdnJylcclxuZXhwb3J0cy5CWVRFX0tBTkpJID0gbmV3IFJlZ0V4cCgnW15BLVowLTkgJCUqK1xcXFwtLi86XSsnLCAnZycpXHJcbmV4cG9ydHMuQllURSA9IG5ldyBSZWdFeHAoYnl0ZSwgJ2cnKVxyXG5leHBvcnRzLk5VTUVSSUMgPSBuZXcgUmVnRXhwKG51bWVyaWMsICdnJylcclxuZXhwb3J0cy5BTFBIQU5VTUVSSUMgPSBuZXcgUmVnRXhwKGFscGhhbnVtZXJpYywgJ2cnKVxyXG5cclxuY29uc3QgVEVTVF9LQU5KSSA9IG5ldyBSZWdFeHAoJ14nICsga2FuamkgKyAnJCcpXHJcbmNvbnN0IFRFU1RfTlVNRVJJQyA9IG5ldyBSZWdFeHAoJ14nICsgbnVtZXJpYyArICckJylcclxuY29uc3QgVEVTVF9BTFBIQU5VTUVSSUMgPSBuZXcgUmVnRXhwKCdeW0EtWjAtOSAkJSorXFxcXC0uLzpdKyQnKVxyXG5cclxuZXhwb3J0cy50ZXN0S2FuamkgPSBmdW5jdGlvbiB0ZXN0S2FuamkgKHN0cikge1xyXG4gIHJldHVybiBURVNUX0tBTkpJLnRlc3Qoc3RyKVxyXG59XHJcblxyXG5leHBvcnRzLnRlc3ROdW1lcmljID0gZnVuY3Rpb24gdGVzdE51bWVyaWMgKHN0cikge1xyXG4gIHJldHVybiBURVNUX05VTUVSSUMudGVzdChzdHIpXHJcbn1cclxuXHJcbmV4cG9ydHMudGVzdEFscGhhbnVtZXJpYyA9IGZ1bmN0aW9uIHRlc3RBbHBoYW51bWVyaWMgKHN0cikge1xyXG4gIHJldHVybiBURVNUX0FMUEhBTlVNRVJJQy50ZXN0KHN0cilcclxufVxyXG4iLCJjb25zdCBWZXJzaW9uQ2hlY2sgPSByZXF1aXJlKCcuL3ZlcnNpb24tY2hlY2snKVxyXG5jb25zdCBSZWdleCA9IHJlcXVpcmUoJy4vcmVnZXgnKVxyXG5cclxuLyoqXHJcbiAqIE51bWVyaWMgbW9kZSBlbmNvZGVzIGRhdGEgZnJvbSB0aGUgZGVjaW1hbCBkaWdpdCBzZXQgKDAgLSA5KVxyXG4gKiAoYnl0ZSB2YWx1ZXMgMzBIRVggdG8gMzlIRVgpLlxyXG4gKiBOb3JtYWxseSwgMyBkYXRhIGNoYXJhY3RlcnMgYXJlIHJlcHJlc2VudGVkIGJ5IDEwIGJpdHMuXHJcbiAqXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG5leHBvcnRzLk5VTUVSSUMgPSB7XHJcbiAgaWQ6ICdOdW1lcmljJyxcclxuICBiaXQ6IDEgPDwgMCxcclxuICBjY0JpdHM6IFsxMCwgMTIsIDE0XVxyXG59XHJcblxyXG4vKipcclxuICogQWxwaGFudW1lcmljIG1vZGUgZW5jb2RlcyBkYXRhIGZyb20gYSBzZXQgb2YgNDUgY2hhcmFjdGVycyxcclxuICogaS5lLiAxMCBudW1lcmljIGRpZ2l0cyAoMCAtIDkpLFxyXG4gKiAgICAgIDI2IGFscGhhYmV0aWMgY2hhcmFjdGVycyAoQSAtIFopLFxyXG4gKiAgIGFuZCA5IHN5bWJvbHMgKFNQLCAkLCAlLCAqLCArLCAtLCAuLCAvLCA6KS5cclxuICogTm9ybWFsbHksIHR3byBpbnB1dCBjaGFyYWN0ZXJzIGFyZSByZXByZXNlbnRlZCBieSAxMSBiaXRzLlxyXG4gKlxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0cy5BTFBIQU5VTUVSSUMgPSB7XHJcbiAgaWQ6ICdBbHBoYW51bWVyaWMnLFxyXG4gIGJpdDogMSA8PCAxLFxyXG4gIGNjQml0czogWzksIDExLCAxM11cclxufVxyXG5cclxuLyoqXHJcbiAqIEluIGJ5dGUgbW9kZSwgZGF0YSBpcyBlbmNvZGVkIGF0IDggYml0cyBwZXIgY2hhcmFjdGVyLlxyXG4gKlxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0cy5CWVRFID0ge1xyXG4gIGlkOiAnQnl0ZScsXHJcbiAgYml0OiAxIDw8IDIsXHJcbiAgY2NCaXRzOiBbOCwgMTYsIDE2XVxyXG59XHJcblxyXG4vKipcclxuICogVGhlIEthbmppIG1vZGUgZWZmaWNpZW50bHkgZW5jb2RlcyBLYW5qaSBjaGFyYWN0ZXJzIGluIGFjY29yZGFuY2Ugd2l0aFxyXG4gKiB0aGUgU2hpZnQgSklTIHN5c3RlbSBiYXNlZCBvbiBKSVMgWCAwMjA4LlxyXG4gKiBUaGUgU2hpZnQgSklTIHZhbHVlcyBhcmUgc2hpZnRlZCBmcm9tIHRoZSBKSVMgWCAwMjA4IHZhbHVlcy5cclxuICogSklTIFggMDIwOCBnaXZlcyBkZXRhaWxzIG9mIHRoZSBzaGlmdCBjb2RlZCByZXByZXNlbnRhdGlvbi5cclxuICogRWFjaCB0d28tYnl0ZSBjaGFyYWN0ZXIgdmFsdWUgaXMgY29tcGFjdGVkIHRvIGEgMTMtYml0IGJpbmFyeSBjb2Rld29yZC5cclxuICpcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbmV4cG9ydHMuS0FOSkkgPSB7XHJcbiAgaWQ6ICdLYW5qaScsXHJcbiAgYml0OiAxIDw8IDMsXHJcbiAgY2NCaXRzOiBbOCwgMTAsIDEyXVxyXG59XHJcblxyXG4vKipcclxuICogTWl4ZWQgbW9kZSB3aWxsIGNvbnRhaW4gYSBzZXF1ZW5jZXMgb2YgZGF0YSBpbiBhIGNvbWJpbmF0aW9uIG9mIGFueSBvZlxyXG4gKiB0aGUgbW9kZXMgZGVzY3JpYmVkIGFib3ZlXHJcbiAqXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG5leHBvcnRzLk1JWEVEID0ge1xyXG4gIGJpdDogLTFcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiBiaXRzIG5lZWRlZCB0byBzdG9yZSB0aGUgZGF0YSBsZW5ndGhcclxuICogYWNjb3JkaW5nIHRvIFFSIENvZGUgc3BlY2lmaWNhdGlvbnMuXHJcbiAqXHJcbiAqIEBwYXJhbSAge01vZGV9ICAgbW9kZSAgICBEYXRhIG1vZGVcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgTnVtYmVyIG9mIGJpdHNcclxuICovXHJcbmV4cG9ydHMuZ2V0Q2hhckNvdW50SW5kaWNhdG9yID0gZnVuY3Rpb24gZ2V0Q2hhckNvdW50SW5kaWNhdG9yIChtb2RlLCB2ZXJzaW9uKSB7XHJcbiAgaWYgKCFtb2RlLmNjQml0cykgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG1vZGU6ICcgKyBtb2RlKVxyXG5cclxuICBpZiAoIVZlcnNpb25DaGVjay5pc1ZhbGlkKHZlcnNpb24pKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdmVyc2lvbjogJyArIHZlcnNpb24pXHJcbiAgfVxyXG5cclxuICBpZiAodmVyc2lvbiA+PSAxICYmIHZlcnNpb24gPCAxMCkgcmV0dXJuIG1vZGUuY2NCaXRzWzBdXHJcbiAgZWxzZSBpZiAodmVyc2lvbiA8IDI3KSByZXR1cm4gbW9kZS5jY0JpdHNbMV1cclxuICByZXR1cm4gbW9kZS5jY0JpdHNbMl1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1vc3QgZWZmaWNpZW50IG1vZGUgdG8gc3RvcmUgdGhlIHNwZWNpZmllZCBkYXRhXHJcbiAqXHJcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YVN0ciBJbnB1dCBkYXRhIHN0cmluZ1xyXG4gKiBAcmV0dXJuIHtNb2RlfSAgICAgICAgICAgQmVzdCBtb2RlXHJcbiAqL1xyXG5leHBvcnRzLmdldEJlc3RNb2RlRm9yRGF0YSA9IGZ1bmN0aW9uIGdldEJlc3RNb2RlRm9yRGF0YSAoZGF0YVN0cikge1xyXG4gIGlmIChSZWdleC50ZXN0TnVtZXJpYyhkYXRhU3RyKSkgcmV0dXJuIGV4cG9ydHMuTlVNRVJJQ1xyXG4gIGVsc2UgaWYgKFJlZ2V4LnRlc3RBbHBoYW51bWVyaWMoZGF0YVN0cikpIHJldHVybiBleHBvcnRzLkFMUEhBTlVNRVJJQ1xyXG4gIGVsc2UgaWYgKFJlZ2V4LnRlc3RLYW5qaShkYXRhU3RyKSkgcmV0dXJuIGV4cG9ydHMuS0FOSklcclxuICBlbHNlIHJldHVybiBleHBvcnRzLkJZVEVcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybiBtb2RlIG5hbWUgYXMgc3RyaW5nXHJcbiAqXHJcbiAqIEBwYXJhbSB7TW9kZX0gbW9kZSBNb2RlIG9iamVjdFxyXG4gKiBAcmV0dXJucyB7U3RyaW5nfSAgTW9kZSBuYW1lXHJcbiAqL1xyXG5leHBvcnRzLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKG1vZGUpIHtcclxuICBpZiAobW9kZSAmJiBtb2RlLmlkKSByZXR1cm4gbW9kZS5pZFxyXG4gIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBtb2RlJylcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrIGlmIGlucHV0IHBhcmFtIGlzIGEgdmFsaWQgbW9kZSBvYmplY3RcclxuICpcclxuICogQHBhcmFtICAge01vZGV9ICAgIG1vZGUgTW9kZSBvYmplY3RcclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdmFsaWQgbW9kZSwgZmFsc2Ugb3RoZXJ3aXNlXHJcbiAqL1xyXG5leHBvcnRzLmlzVmFsaWQgPSBmdW5jdGlvbiBpc1ZhbGlkIChtb2RlKSB7XHJcbiAgcmV0dXJuIG1vZGUgJiYgbW9kZS5iaXQgJiYgbW9kZS5jY0JpdHNcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCBtb2RlIG9iamVjdCBmcm9tIGl0cyBuYW1lXHJcbiAqXHJcbiAqIEBwYXJhbSAgIHtTdHJpbmd9IHN0cmluZyBNb2RlIG5hbWVcclxuICogQHJldHVybnMge01vZGV9ICAgICAgICAgIE1vZGUgb2JqZWN0XHJcbiAqL1xyXG5mdW5jdGlvbiBmcm9tU3RyaW5nIChzdHJpbmcpIHtcclxuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignUGFyYW0gaXMgbm90IGEgc3RyaW5nJylcclxuICB9XHJcblxyXG4gIGNvbnN0IGxjU3RyID0gc3RyaW5nLnRvTG93ZXJDYXNlKClcclxuXHJcbiAgc3dpdGNoIChsY1N0cikge1xyXG4gICAgY2FzZSAnbnVtZXJpYyc6XHJcbiAgICAgIHJldHVybiBleHBvcnRzLk5VTUVSSUNcclxuICAgIGNhc2UgJ2FscGhhbnVtZXJpYyc6XHJcbiAgICAgIHJldHVybiBleHBvcnRzLkFMUEhBTlVNRVJJQ1xyXG4gICAgY2FzZSAna2FuamknOlxyXG4gICAgICByZXR1cm4gZXhwb3J0cy5LQU5KSVxyXG4gICAgY2FzZSAnYnl0ZSc6XHJcbiAgICAgIHJldHVybiBleHBvcnRzLkJZVEVcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBtb2RlOiAnICsgc3RyaW5nKVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgbW9kZSBmcm9tIGEgdmFsdWUuXHJcbiAqIElmIHZhbHVlIGlzIG5vdCBhIHZhbGlkIG1vZGUsIHJldHVybnMgZGVmYXVsdFZhbHVlXHJcbiAqXHJcbiAqIEBwYXJhbSAge01vZGV8U3RyaW5nfSB2YWx1ZSAgICAgICAgRW5jb2RpbmcgbW9kZVxyXG4gKiBAcGFyYW0gIHtNb2RlfSAgICAgICAgZGVmYXVsdFZhbHVlIEZhbGxiYWNrIHZhbHVlXHJcbiAqIEByZXR1cm4ge01vZGV9ICAgICAgICAgICAgICAgICAgICAgRW5jb2RpbmcgbW9kZVxyXG4gKi9cclxuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSAodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xyXG4gIGlmIChleHBvcnRzLmlzVmFsaWQodmFsdWUpKSB7XHJcbiAgICByZXR1cm4gdmFsdWVcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gZnJvbVN0cmluZyh2YWx1ZSlcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlXHJcbiAgfVxyXG59XHJcbiIsImNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXHJcbmNvbnN0IEVDQ29kZSA9IHJlcXVpcmUoJy4vZXJyb3ItY29ycmVjdGlvbi1jb2RlJylcclxuY29uc3QgRUNMZXZlbCA9IHJlcXVpcmUoJy4vZXJyb3ItY29ycmVjdGlvbi1sZXZlbCcpXHJcbmNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxyXG5jb25zdCBWZXJzaW9uQ2hlY2sgPSByZXF1aXJlKCcuL3ZlcnNpb24tY2hlY2snKVxyXG5cclxuLy8gR2VuZXJhdG9yIHBvbHlub21pYWwgdXNlZCB0byBlbmNvZGUgdmVyc2lvbiBpbmZvcm1hdGlvblxyXG5jb25zdCBHMTggPSAoMSA8PCAxMikgfCAoMSA8PCAxMSkgfCAoMSA8PCAxMCkgfCAoMSA8PCA5KSB8ICgxIDw8IDgpIHwgKDEgPDwgNSkgfCAoMSA8PCAyKSB8ICgxIDw8IDApXHJcbmNvbnN0IEcxOF9CQ0ggPSBVdGlscy5nZXRCQ0hEaWdpdChHMTgpXHJcblxyXG5mdW5jdGlvbiBnZXRCZXN0VmVyc2lvbkZvckRhdGFMZW5ndGggKG1vZGUsIGxlbmd0aCwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcclxuICBmb3IgKGxldCBjdXJyZW50VmVyc2lvbiA9IDE7IGN1cnJlbnRWZXJzaW9uIDw9IDQwOyBjdXJyZW50VmVyc2lvbisrKSB7XHJcbiAgICBpZiAobGVuZ3RoIDw9IGV4cG9ydHMuZ2V0Q2FwYWNpdHkoY3VycmVudFZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtb2RlKSkge1xyXG4gICAgICByZXR1cm4gY3VycmVudFZlcnNpb25cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB1bmRlZmluZWRcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UmVzZXJ2ZWRCaXRzQ291bnQgKG1vZGUsIHZlcnNpb24pIHtcclxuICAvLyBDaGFyYWN0ZXIgY291bnQgaW5kaWNhdG9yICsgbW9kZSBpbmRpY2F0b3IgYml0c1xyXG4gIHJldHVybiBNb2RlLmdldENoYXJDb3VudEluZGljYXRvcihtb2RlLCB2ZXJzaW9uKSArIDRcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0VG90YWxCaXRzRnJvbURhdGFBcnJheSAoc2VnbWVudHMsIHZlcnNpb24pIHtcclxuICBsZXQgdG90YWxCaXRzID0gMFxyXG5cclxuICBzZWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICBjb25zdCByZXNlcnZlZEJpdHMgPSBnZXRSZXNlcnZlZEJpdHNDb3VudChkYXRhLm1vZGUsIHZlcnNpb24pXHJcbiAgICB0b3RhbEJpdHMgKz0gcmVzZXJ2ZWRCaXRzICsgZGF0YS5nZXRCaXRzTGVuZ3RoKClcclxuICB9KVxyXG5cclxuICByZXR1cm4gdG90YWxCaXRzXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEJlc3RWZXJzaW9uRm9yTWl4ZWREYXRhIChzZWdtZW50cywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcclxuICBmb3IgKGxldCBjdXJyZW50VmVyc2lvbiA9IDE7IGN1cnJlbnRWZXJzaW9uIDw9IDQwOyBjdXJyZW50VmVyc2lvbisrKSB7XHJcbiAgICBjb25zdCBsZW5ndGggPSBnZXRUb3RhbEJpdHNGcm9tRGF0YUFycmF5KHNlZ21lbnRzLCBjdXJyZW50VmVyc2lvbilcclxuICAgIGlmIChsZW5ndGggPD0gZXhwb3J0cy5nZXRDYXBhY2l0eShjdXJyZW50VmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIE1vZGUuTUlYRUQpKSB7XHJcbiAgICAgIHJldHVybiBjdXJyZW50VmVyc2lvblxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHVuZGVmaW5lZFxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB2ZXJzaW9uIG51bWJlciBmcm9tIGEgdmFsdWUuXHJcbiAqIElmIHZhbHVlIGlzIG5vdCBhIHZhbGlkIHZlcnNpb24sIHJldHVybnMgZGVmYXVsdFZhbHVlXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcnxTdHJpbmd9IHZhbHVlICAgICAgICBRUiBDb2RlIHZlcnNpb25cclxuICogQHBhcmFtICB7TnVtYmVyfSAgICAgICAgZGVmYXVsdFZhbHVlIEZhbGxiYWNrIHZhbHVlXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb24gbnVtYmVyXHJcbiAqL1xyXG5leHBvcnRzLmZyb20gPSBmdW5jdGlvbiBmcm9tICh2YWx1ZSwgZGVmYXVsdFZhbHVlKSB7XHJcbiAgaWYgKFZlcnNpb25DaGVjay5pc1ZhbGlkKHZhbHVlKSkge1xyXG4gICAgcmV0dXJuIHBhcnNlSW50KHZhbHVlLCAxMClcclxuICB9XHJcblxyXG4gIHJldHVybiBkZWZhdWx0VmFsdWVcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgaG93IG11Y2ggZGF0YSBjYW4gYmUgc3RvcmVkIHdpdGggdGhlIHNwZWNpZmllZCBRUiBjb2RlIHZlcnNpb25cclxuICogYW5kIGVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb24gKDEtNDApXHJcbiAqIEBwYXJhbSAge051bWJlcn0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxyXG4gKiBAcGFyYW0gIHtNb2RlfSAgIG1vZGUgICAgICAgICAgICAgICAgIERhdGEgbW9kZVxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgIFF1YW50aXR5IG9mIHN0b3JhYmxlIGRhdGFcclxuICovXHJcbmV4cG9ydHMuZ2V0Q2FwYWNpdHkgPSBmdW5jdGlvbiBnZXRDYXBhY2l0eSAodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1vZGUpIHtcclxuICBpZiAoIVZlcnNpb25DaGVjay5pc1ZhbGlkKHZlcnNpb24pKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgUVIgQ29kZSB2ZXJzaW9uJylcclxuICB9XHJcblxyXG4gIC8vIFVzZSBCeXRlIG1vZGUgYXMgZGVmYXVsdFxyXG4gIGlmICh0eXBlb2YgbW9kZSA9PT0gJ3VuZGVmaW5lZCcpIG1vZGUgPSBNb2RlLkJZVEVcclxuXHJcbiAgLy8gVG90YWwgY29kZXdvcmRzIGZvciB0aGlzIFFSIGNvZGUgdmVyc2lvbiAoRGF0YSArIEVycm9yIGNvcnJlY3Rpb24pXHJcbiAgY29uc3QgdG90YWxDb2Rld29yZHMgPSBVdGlscy5nZXRTeW1ib2xUb3RhbENvZGV3b3Jkcyh2ZXJzaW9uKVxyXG5cclxuICAvLyBUb3RhbCBudW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHNcclxuICBjb25zdCBlY1RvdGFsQ29kZXdvcmRzID0gRUNDb2RlLmdldFRvdGFsQ29kZXdvcmRzQ291bnQodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXHJcblxyXG4gIC8vIFRvdGFsIG51bWJlciBvZiBkYXRhIGNvZGV3b3Jkc1xyXG4gIGNvbnN0IGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMgPSAodG90YWxDb2Rld29yZHMgLSBlY1RvdGFsQ29kZXdvcmRzKSAqIDhcclxuXHJcbiAgaWYgKG1vZGUgPT09IE1vZGUuTUlYRUQpIHJldHVybiBkYXRhVG90YWxDb2Rld29yZHNCaXRzXHJcblxyXG4gIGNvbnN0IHVzYWJsZUJpdHMgPSBkYXRhVG90YWxDb2Rld29yZHNCaXRzIC0gZ2V0UmVzZXJ2ZWRCaXRzQ291bnQobW9kZSwgdmVyc2lvbilcclxuXHJcbiAgLy8gUmV0dXJuIG1heCBudW1iZXIgb2Ygc3RvcmFibGUgY29kZXdvcmRzXHJcbiAgc3dpdGNoIChtb2RlKSB7XHJcbiAgICBjYXNlIE1vZGUuTlVNRVJJQzpcclxuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKHVzYWJsZUJpdHMgLyAxMCkgKiAzKVxyXG5cclxuICAgIGNhc2UgTW9kZS5BTFBIQU5VTUVSSUM6XHJcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKCh1c2FibGVCaXRzIC8gMTEpICogMilcclxuXHJcbiAgICBjYXNlIE1vZGUuS0FOSkk6XHJcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKHVzYWJsZUJpdHMgLyAxMylcclxuXHJcbiAgICBjYXNlIE1vZGUuQllURTpcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKHVzYWJsZUJpdHMgLyA4KVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gdmVyc2lvbiBuZWVkZWQgdG8gY29udGFpbiB0aGUgYW1vdW50IG9mIGRhdGFcclxuICpcclxuICogQHBhcmFtICB7U2VnbWVudH0gZGF0YSAgICAgICAgICAgICAgICAgICAgU2VnbWVudCBvZiBkYXRhXHJcbiAqIEBwYXJhbSAge051bWJlcn0gW2Vycm9yQ29ycmVjdGlvbkxldmVsPUhdIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcclxuICogQHBhcmFtICB7TW9kZX0gbW9kZSAgICAgICAgICAgICAgICAgICAgICAgRGF0YSBtb2RlXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxyXG4gKi9cclxuZXhwb3J0cy5nZXRCZXN0VmVyc2lvbkZvckRhdGEgPSBmdW5jdGlvbiBnZXRCZXN0VmVyc2lvbkZvckRhdGEgKGRhdGEsIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgbGV0IHNlZ1xyXG5cclxuICBjb25zdCBlY2wgPSBFQ0xldmVsLmZyb20oZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIEVDTGV2ZWwuTSlcclxuXHJcbiAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcclxuICAgIGlmIChkYXRhLmxlbmd0aCA+IDEpIHtcclxuICAgICAgcmV0dXJuIGdldEJlc3RWZXJzaW9uRm9yTWl4ZWREYXRhKGRhdGEsIGVjbClcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZGF0YS5sZW5ndGggPT09IDApIHtcclxuICAgICAgcmV0dXJuIDFcclxuICAgIH1cclxuXHJcbiAgICBzZWcgPSBkYXRhWzBdXHJcbiAgfSBlbHNlIHtcclxuICAgIHNlZyA9IGRhdGFcclxuICB9XHJcblxyXG4gIHJldHVybiBnZXRCZXN0VmVyc2lvbkZvckRhdGFMZW5ndGgoc2VnLm1vZGUsIHNlZy5nZXRMZW5ndGgoKSwgZWNsKVxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB2ZXJzaW9uIGluZm9ybWF0aW9uIHdpdGggcmVsYXRpdmUgZXJyb3IgY29ycmVjdGlvbiBiaXRzXHJcbiAqXHJcbiAqIFRoZSB2ZXJzaW9uIGluZm9ybWF0aW9uIGlzIGluY2x1ZGVkIGluIFFSIENvZGUgc3ltYm9scyBvZiB2ZXJzaW9uIDcgb3IgbGFyZ2VyLlxyXG4gKiBJdCBjb25zaXN0cyBvZiBhbiAxOC1iaXQgc2VxdWVuY2UgY29udGFpbmluZyA2IGRhdGEgYml0cyxcclxuICogd2l0aCAxMiBlcnJvciBjb3JyZWN0aW9uIGJpdHMgY2FsY3VsYXRlZCB1c2luZyB0aGUgKDE4LCA2KSBHb2xheSBjb2RlLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICBFbmNvZGVkIHZlcnNpb24gaW5mbyBiaXRzXHJcbiAqL1xyXG5leHBvcnRzLmdldEVuY29kZWRCaXRzID0gZnVuY3Rpb24gZ2V0RW5jb2RlZEJpdHMgKHZlcnNpb24pIHtcclxuICBpZiAoIVZlcnNpb25DaGVjay5pc1ZhbGlkKHZlcnNpb24pIHx8IHZlcnNpb24gPCA3KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgUVIgQ29kZSB2ZXJzaW9uJylcclxuICB9XHJcblxyXG4gIGxldCBkID0gdmVyc2lvbiA8PCAxMlxyXG5cclxuICB3aGlsZSAoVXRpbHMuZ2V0QkNIRGlnaXQoZCkgLSBHMThfQkNIID49IDApIHtcclxuICAgIGQgXj0gKEcxOCA8PCAoVXRpbHMuZ2V0QkNIRGlnaXQoZCkgLSBHMThfQkNIKSlcclxuICB9XHJcblxyXG4gIHJldHVybiAodmVyc2lvbiA8PCAxMikgfCBkXHJcbn1cclxuIiwiY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcclxuXHJcbmNvbnN0IEcxNSA9ICgxIDw8IDEwKSB8ICgxIDw8IDgpIHwgKDEgPDwgNSkgfCAoMSA8PCA0KSB8ICgxIDw8IDIpIHwgKDEgPDwgMSkgfCAoMSA8PCAwKVxyXG5jb25zdCBHMTVfTUFTSyA9ICgxIDw8IDE0KSB8ICgxIDw8IDEyKSB8ICgxIDw8IDEwKSB8ICgxIDw8IDQpIHwgKDEgPDwgMSlcclxuY29uc3QgRzE1X0JDSCA9IFV0aWxzLmdldEJDSERpZ2l0KEcxNSlcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGZvcm1hdCBpbmZvcm1hdGlvbiB3aXRoIHJlbGF0aXZlIGVycm9yIGNvcnJlY3Rpb24gYml0c1xyXG4gKlxyXG4gKiBUaGUgZm9ybWF0IGluZm9ybWF0aW9uIGlzIGEgMTUtYml0IHNlcXVlbmNlIGNvbnRhaW5pbmcgNSBkYXRhIGJpdHMsXHJcbiAqIHdpdGggMTAgZXJyb3IgY29ycmVjdGlvbiBiaXRzIGNhbGN1bGF0ZWQgdXNpbmcgdGhlICgxNSwgNSkgQkNIIGNvZGUuXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG1hc2sgICAgICAgICAgICAgICAgIE1hc2sgcGF0dGVyblxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgIEVuY29kZWQgZm9ybWF0IGluZm9ybWF0aW9uIGJpdHNcclxuICovXHJcbmV4cG9ydHMuZ2V0RW5jb2RlZEJpdHMgPSBmdW5jdGlvbiBnZXRFbmNvZGVkQml0cyAoZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2spIHtcclxuICBjb25zdCBkYXRhID0gKChlcnJvckNvcnJlY3Rpb25MZXZlbC5iaXQgPDwgMykgfCBtYXNrKVxyXG4gIGxldCBkID0gZGF0YSA8PCAxMFxyXG5cclxuICB3aGlsZSAoVXRpbHMuZ2V0QkNIRGlnaXQoZCkgLSBHMTVfQkNIID49IDApIHtcclxuICAgIGQgXj0gKEcxNSA8PCAoVXRpbHMuZ2V0QkNIRGlnaXQoZCkgLSBHMTVfQkNIKSlcclxuICB9XHJcblxyXG4gIC8vIHhvciBmaW5hbCBkYXRhIHdpdGggbWFzayBwYXR0ZXJuIGluIG9yZGVyIHRvIGVuc3VyZSB0aGF0XHJcbiAgLy8gbm8gY29tYmluYXRpb24gb2YgRXJyb3IgQ29ycmVjdGlvbiBMZXZlbCBhbmQgZGF0YSBtYXNrIHBhdHRlcm5cclxuICAvLyB3aWxsIHJlc3VsdCBpbiBhbiBhbGwtemVybyBkYXRhIHN0cmluZ1xyXG4gIHJldHVybiAoKGRhdGEgPDwgMTApIHwgZCkgXiBHMTVfTUFTS1xyXG59XHJcbiIsImNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxyXG5cclxuZnVuY3Rpb24gTnVtZXJpY0RhdGEgKGRhdGEpIHtcclxuICB0aGlzLm1vZGUgPSBNb2RlLk5VTUVSSUNcclxuICB0aGlzLmRhdGEgPSBkYXRhLnRvU3RyaW5nKClcclxufVxyXG5cclxuTnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKGxlbmd0aCkge1xyXG4gIHJldHVybiAxMCAqIE1hdGguZmxvb3IobGVuZ3RoIC8gMykgKyAoKGxlbmd0aCAlIDMpID8gKChsZW5ndGggJSAzKSAqIDMgKyAxKSA6IDApXHJcbn1cclxuXHJcbk51bWVyaWNEYXRhLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbiBnZXRMZW5ndGggKCkge1xyXG4gIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoXHJcbn1cclxuXHJcbk51bWVyaWNEYXRhLnByb3RvdHlwZS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAoKSB7XHJcbiAgcmV0dXJuIE51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGgodGhpcy5kYXRhLmxlbmd0aClcclxufVxyXG5cclxuTnVtZXJpY0RhdGEucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKGJpdEJ1ZmZlcikge1xyXG4gIGxldCBpLCBncm91cCwgdmFsdWVcclxuXHJcbiAgLy8gVGhlIGlucHV0IGRhdGEgc3RyaW5nIGlzIGRpdmlkZWQgaW50byBncm91cHMgb2YgdGhyZWUgZGlnaXRzLFxyXG4gIC8vIGFuZCBlYWNoIGdyb3VwIGlzIGNvbnZlcnRlZCB0byBpdHMgMTAtYml0IGJpbmFyeSBlcXVpdmFsZW50LlxyXG4gIGZvciAoaSA9IDA7IGkgKyAzIDw9IHRoaXMuZGF0YS5sZW5ndGg7IGkgKz0gMykge1xyXG4gICAgZ3JvdXAgPSB0aGlzLmRhdGEuc3Vic3RyKGksIDMpXHJcbiAgICB2YWx1ZSA9IHBhcnNlSW50KGdyb3VwLCAxMClcclxuXHJcbiAgICBiaXRCdWZmZXIucHV0KHZhbHVlLCAxMClcclxuICB9XHJcblxyXG4gIC8vIElmIHRoZSBudW1iZXIgb2YgaW5wdXQgZGlnaXRzIGlzIG5vdCBhbiBleGFjdCBtdWx0aXBsZSBvZiB0aHJlZSxcclxuICAvLyB0aGUgZmluYWwgb25lIG9yIHR3byBkaWdpdHMgYXJlIGNvbnZlcnRlZCB0byA0IG9yIDcgYml0cyByZXNwZWN0aXZlbHkuXHJcbiAgY29uc3QgcmVtYWluaW5nTnVtID0gdGhpcy5kYXRhLmxlbmd0aCAtIGlcclxuICBpZiAocmVtYWluaW5nTnVtID4gMCkge1xyXG4gICAgZ3JvdXAgPSB0aGlzLmRhdGEuc3Vic3RyKGkpXHJcbiAgICB2YWx1ZSA9IHBhcnNlSW50KGdyb3VwLCAxMClcclxuXHJcbiAgICBiaXRCdWZmZXIucHV0KHZhbHVlLCByZW1haW5pbmdOdW0gKiAzICsgMSlcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTnVtZXJpY0RhdGFcclxuIiwiY29uc3QgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXHJcblxyXG4vKipcclxuICogQXJyYXkgb2YgY2hhcmFjdGVycyBhdmFpbGFibGUgaW4gYWxwaGFudW1lcmljIG1vZGVcclxuICpcclxuICogQXMgcGVyIFFSIENvZGUgc3BlY2lmaWNhdGlvbiwgdG8gZWFjaCBjaGFyYWN0ZXJcclxuICogaXMgYXNzaWduZWQgYSB2YWx1ZSBmcm9tIDAgdG8gNDQgd2hpY2ggaW4gdGhpcyBjYXNlIGNvaW5jaWRlc1xyXG4gKiB3aXRoIHRoZSBhcnJheSBpbmRleFxyXG4gKlxyXG4gKiBAdHlwZSB7QXJyYXl9XHJcbiAqL1xyXG5jb25zdCBBTFBIQV9OVU1fQ0hBUlMgPSBbXHJcbiAgJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLFxyXG4gICdBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJyxcclxuICAnTicsICdPJywgJ1AnLCAnUScsICdSJywgJ1MnLCAnVCcsICdVJywgJ1YnLCAnVycsICdYJywgJ1knLCAnWicsXHJcbiAgJyAnLCAnJCcsICclJywgJyonLCAnKycsICctJywgJy4nLCAnLycsICc6J1xyXG5dXHJcblxyXG5mdW5jdGlvbiBBbHBoYW51bWVyaWNEYXRhIChkYXRhKSB7XHJcbiAgdGhpcy5tb2RlID0gTW9kZS5BTFBIQU5VTUVSSUNcclxuICB0aGlzLmRhdGEgPSBkYXRhXHJcbn1cclxuXHJcbkFscGhhbnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKGxlbmd0aCkge1xyXG4gIHJldHVybiAxMSAqIE1hdGguZmxvb3IobGVuZ3RoIC8gMikgKyA2ICogKGxlbmd0aCAlIDIpXHJcbn1cclxuXHJcbkFscGhhbnVtZXJpY0RhdGEucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uIGdldExlbmd0aCAoKSB7XHJcbiAgcmV0dXJuIHRoaXMuZGF0YS5sZW5ndGhcclxufVxyXG5cclxuQWxwaGFudW1lcmljRGF0YS5wcm90b3R5cGUuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKCkge1xyXG4gIHJldHVybiBBbHBoYW51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGgodGhpcy5kYXRhLmxlbmd0aClcclxufVxyXG5cclxuQWxwaGFudW1lcmljRGF0YS5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiB3cml0ZSAoYml0QnVmZmVyKSB7XHJcbiAgbGV0IGlcclxuXHJcbiAgLy8gSW5wdXQgZGF0YSBjaGFyYWN0ZXJzIGFyZSBkaXZpZGVkIGludG8gZ3JvdXBzIG9mIHR3byBjaGFyYWN0ZXJzXHJcbiAgLy8gYW5kIGVuY29kZWQgYXMgMTEtYml0IGJpbmFyeSBjb2Rlcy5cclxuICBmb3IgKGkgPSAwOyBpICsgMiA8PSB0aGlzLmRhdGEubGVuZ3RoOyBpICs9IDIpIHtcclxuICAgIC8vIFRoZSBjaGFyYWN0ZXIgdmFsdWUgb2YgdGhlIGZpcnN0IGNoYXJhY3RlciBpcyBtdWx0aXBsaWVkIGJ5IDQ1XHJcbiAgICBsZXQgdmFsdWUgPSBBTFBIQV9OVU1fQ0hBUlMuaW5kZXhPZih0aGlzLmRhdGFbaV0pICogNDVcclxuXHJcbiAgICAvLyBUaGUgY2hhcmFjdGVyIHZhbHVlIG9mIHRoZSBzZWNvbmQgZGlnaXQgaXMgYWRkZWQgdG8gdGhlIHByb2R1Y3RcclxuICAgIHZhbHVlICs9IEFMUEhBX05VTV9DSEFSUy5pbmRleE9mKHRoaXMuZGF0YVtpICsgMV0pXHJcblxyXG4gICAgLy8gVGhlIHN1bSBpcyB0aGVuIHN0b3JlZCBhcyAxMS1iaXQgYmluYXJ5IG51bWJlclxyXG4gICAgYml0QnVmZmVyLnB1dCh2YWx1ZSwgMTEpXHJcbiAgfVxyXG5cclxuICAvLyBJZiB0aGUgbnVtYmVyIG9mIGlucHV0IGRhdGEgY2hhcmFjdGVycyBpcyBub3QgYSBtdWx0aXBsZSBvZiB0d28sXHJcbiAgLy8gdGhlIGNoYXJhY3RlciB2YWx1ZSBvZiB0aGUgZmluYWwgY2hhcmFjdGVyIGlzIGVuY29kZWQgYXMgYSA2LWJpdCBiaW5hcnkgbnVtYmVyLlxyXG4gIGlmICh0aGlzLmRhdGEubGVuZ3RoICUgMikge1xyXG4gICAgYml0QnVmZmVyLnB1dChBTFBIQV9OVU1fQ0hBUlMuaW5kZXhPZih0aGlzLmRhdGFbaV0pLCA2KVxyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbHBoYW51bWVyaWNEYXRhXHJcbiIsImNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxyXG5cclxuZnVuY3Rpb24gQnl0ZURhdGEgKGRhdGEpIHtcclxuICB0aGlzLm1vZGUgPSBNb2RlLkJZVEVcclxuICBpZiAodHlwZW9mIChkYXRhKSA9PT0gJ3N0cmluZycpIHtcclxuICAgIHRoaXMuZGF0YSA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShkYXRhKVxyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLmRhdGEgPSBuZXcgVWludDhBcnJheShkYXRhKVxyXG4gIH1cclxufVxyXG5cclxuQnl0ZURhdGEuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKGxlbmd0aCkge1xyXG4gIHJldHVybiBsZW5ndGggKiA4XHJcbn1cclxuXHJcbkJ5dGVEYXRhLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbiBnZXRMZW5ndGggKCkge1xyXG4gIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoXHJcbn1cclxuXHJcbkJ5dGVEYXRhLnByb3RvdHlwZS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAoKSB7XHJcbiAgcmV0dXJuIEJ5dGVEYXRhLmdldEJpdHNMZW5ndGgodGhpcy5kYXRhLmxlbmd0aClcclxufVxyXG5cclxuQnl0ZURhdGEucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKGJpdEJ1ZmZlcikge1xyXG4gIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5kYXRhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgYml0QnVmZmVyLnB1dCh0aGlzLmRhdGFbaV0sIDgpXHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJ5dGVEYXRhXHJcbiIsImNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxyXG5jb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5cclxuZnVuY3Rpb24gS2FuamlEYXRhIChkYXRhKSB7XHJcbiAgdGhpcy5tb2RlID0gTW9kZS5LQU5KSVxyXG4gIHRoaXMuZGF0YSA9IGRhdGFcclxufVxyXG5cclxuS2FuamlEYXRhLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoIChsZW5ndGgpIHtcclxuICByZXR1cm4gbGVuZ3RoICogMTNcclxufVxyXG5cclxuS2FuamlEYXRhLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbiBnZXRMZW5ndGggKCkge1xyXG4gIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoXHJcbn1cclxuXHJcbkthbmppRGF0YS5wcm90b3R5cGUuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKCkge1xyXG4gIHJldHVybiBLYW5qaURhdGEuZ2V0Qml0c0xlbmd0aCh0aGlzLmRhdGEubGVuZ3RoKVxyXG59XHJcblxyXG5LYW5qaURhdGEucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKGJpdEJ1ZmZlcikge1xyXG4gIGxldCBpXHJcblxyXG4gIC8vIEluIHRoZSBTaGlmdCBKSVMgc3lzdGVtLCBLYW5qaSBjaGFyYWN0ZXJzIGFyZSByZXByZXNlbnRlZCBieSBhIHR3byBieXRlIGNvbWJpbmF0aW9uLlxyXG4gIC8vIFRoZXNlIGJ5dGUgdmFsdWVzIGFyZSBzaGlmdGVkIGZyb20gdGhlIEpJUyBYIDAyMDggdmFsdWVzLlxyXG4gIC8vIEpJUyBYIDAyMDggZ2l2ZXMgZGV0YWlscyBvZiB0aGUgc2hpZnQgY29kZWQgcmVwcmVzZW50YXRpb24uXHJcbiAgZm9yIChpID0gMDsgaSA8IHRoaXMuZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgbGV0IHZhbHVlID0gVXRpbHMudG9TSklTKHRoaXMuZGF0YVtpXSlcclxuXHJcbiAgICAvLyBGb3IgY2hhcmFjdGVycyB3aXRoIFNoaWZ0IEpJUyB2YWx1ZXMgZnJvbSAweDgxNDAgdG8gMHg5RkZDOlxyXG4gICAgaWYgKHZhbHVlID49IDB4ODE0MCAmJiB2YWx1ZSA8PSAweDlGRkMpIHtcclxuICAgICAgLy8gU3VidHJhY3QgMHg4MTQwIGZyb20gU2hpZnQgSklTIHZhbHVlXHJcbiAgICAgIHZhbHVlIC09IDB4ODE0MFxyXG5cclxuICAgIC8vIEZvciBjaGFyYWN0ZXJzIHdpdGggU2hpZnQgSklTIHZhbHVlcyBmcm9tIDB4RTA0MCB0byAweEVCQkZcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPj0gMHhFMDQwICYmIHZhbHVlIDw9IDB4RUJCRikge1xyXG4gICAgICAvLyBTdWJ0cmFjdCAweEMxNDAgZnJvbSBTaGlmdCBKSVMgdmFsdWVcclxuICAgICAgdmFsdWUgLT0gMHhDMTQwXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgJ0ludmFsaWQgU0pJUyBjaGFyYWN0ZXI6ICcgKyB0aGlzLmRhdGFbaV0gKyAnXFxuJyArXHJcbiAgICAgICAgJ01ha2Ugc3VyZSB5b3VyIGNoYXJzZXQgaXMgVVRGLTgnKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIE11bHRpcGx5IG1vc3Qgc2lnbmlmaWNhbnQgYnl0ZSBvZiByZXN1bHQgYnkgMHhDMFxyXG4gICAgLy8gYW5kIGFkZCBsZWFzdCBzaWduaWZpY2FudCBieXRlIHRvIHByb2R1Y3RcclxuICAgIHZhbHVlID0gKCgodmFsdWUgPj4+IDgpICYgMHhmZikgKiAweEMwKSArICh2YWx1ZSAmIDB4ZmYpXHJcblxyXG4gICAgLy8gQ29udmVydCByZXN1bHQgdG8gYSAxMy1iaXQgYmluYXJ5IHN0cmluZ1xyXG4gICAgYml0QnVmZmVyLnB1dCh2YWx1ZSwgMTMpXHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEthbmppRGF0YVxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAqIENyZWF0ZWQgMjAwOC0wOC0xOS5cclxuICpcclxuICogRGlqa3N0cmEgcGF0aC1maW5kaW5nIGZ1bmN0aW9ucy4gQWRhcHRlZCBmcm9tIHRoZSBEaWprc3RhciBQeXRob24gcHJvamVjdC5cclxuICpcclxuICogQ29weXJpZ2h0IChDKSAyMDA4XHJcbiAqICAgV3lhdHQgQmFsZHdpbiA8c2VsZkB3eWF0dGJhbGR3aW4uY29tPlxyXG4gKiAgIEFsbCByaWdodHMgcmVzZXJ2ZWRcclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxyXG4gKlxyXG4gKiAgIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cclxuICogVEhFIFNPRlRXQVJFLlxyXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbnZhciBkaWprc3RyYSA9IHtcclxuICBzaW5nbGVfc291cmNlX3Nob3J0ZXN0X3BhdGhzOiBmdW5jdGlvbihncmFwaCwgcywgZCkge1xyXG4gICAgLy8gUHJlZGVjZXNzb3IgbWFwIGZvciBlYWNoIG5vZGUgdGhhdCBoYXMgYmVlbiBlbmNvdW50ZXJlZC5cclxuICAgIC8vIG5vZGUgSUQgPT4gcHJlZGVjZXNzb3Igbm9kZSBJRFxyXG4gICAgdmFyIHByZWRlY2Vzc29ycyA9IHt9O1xyXG5cclxuICAgIC8vIENvc3RzIG9mIHNob3J0ZXN0IHBhdGhzIGZyb20gcyB0byBhbGwgbm9kZXMgZW5jb3VudGVyZWQuXHJcbiAgICAvLyBub2RlIElEID0+IGNvc3RcclxuICAgIHZhciBjb3N0cyA9IHt9O1xyXG4gICAgY29zdHNbc10gPSAwO1xyXG5cclxuICAgIC8vIENvc3RzIG9mIHNob3J0ZXN0IHBhdGhzIGZyb20gcyB0byBhbGwgbm9kZXMgZW5jb3VudGVyZWQ7IGRpZmZlcnMgZnJvbVxyXG4gICAgLy8gYGNvc3RzYCBpbiB0aGF0IGl0IHByb3ZpZGVzIGVhc3kgYWNjZXNzIHRvIHRoZSBub2RlIHRoYXQgY3VycmVudGx5IGhhc1xyXG4gICAgLy8gdGhlIGtub3duIHNob3J0ZXN0IHBhdGggZnJvbSBzLlxyXG4gICAgLy8gWFhYOiBEbyB3ZSBhY3R1YWxseSBuZWVkIGJvdGggYGNvc3RzYCBhbmQgYG9wZW5gP1xyXG4gICAgdmFyIG9wZW4gPSBkaWprc3RyYS5Qcmlvcml0eVF1ZXVlLm1ha2UoKTtcclxuICAgIG9wZW4ucHVzaChzLCAwKTtcclxuXHJcbiAgICB2YXIgY2xvc2VzdCxcclxuICAgICAgICB1LCB2LFxyXG4gICAgICAgIGNvc3Rfb2Zfc190b191LFxyXG4gICAgICAgIGFkamFjZW50X25vZGVzLFxyXG4gICAgICAgIGNvc3Rfb2ZfZSxcclxuICAgICAgICBjb3N0X29mX3NfdG9fdV9wbHVzX2Nvc3Rfb2ZfZSxcclxuICAgICAgICBjb3N0X29mX3NfdG9fdixcclxuICAgICAgICBmaXJzdF92aXNpdDtcclxuICAgIHdoaWxlICghb3Blbi5lbXB0eSgpKSB7XHJcbiAgICAgIC8vIEluIHRoZSBub2RlcyByZW1haW5pbmcgaW4gZ3JhcGggdGhhdCBoYXZlIGEga25vd24gY29zdCBmcm9tIHMsXHJcbiAgICAgIC8vIGZpbmQgdGhlIG5vZGUsIHUsIHRoYXQgY3VycmVudGx5IGhhcyB0aGUgc2hvcnRlc3QgcGF0aCBmcm9tIHMuXHJcbiAgICAgIGNsb3Nlc3QgPSBvcGVuLnBvcCgpO1xyXG4gICAgICB1ID0gY2xvc2VzdC52YWx1ZTtcclxuICAgICAgY29zdF9vZl9zX3RvX3UgPSBjbG9zZXN0LmNvc3Q7XHJcblxyXG4gICAgICAvLyBHZXQgbm9kZXMgYWRqYWNlbnQgdG8gdS4uLlxyXG4gICAgICBhZGphY2VudF9ub2RlcyA9IGdyYXBoW3VdIHx8IHt9O1xyXG5cclxuICAgICAgLy8gLi4uYW5kIGV4cGxvcmUgdGhlIGVkZ2VzIHRoYXQgY29ubmVjdCB1IHRvIHRob3NlIG5vZGVzLCB1cGRhdGluZ1xyXG4gICAgICAvLyB0aGUgY29zdCBvZiB0aGUgc2hvcnRlc3QgcGF0aHMgdG8gYW55IG9yIGFsbCBvZiB0aG9zZSBub2RlcyBhc1xyXG4gICAgICAvLyBuZWNlc3NhcnkuIHYgaXMgdGhlIG5vZGUgYWNyb3NzIHRoZSBjdXJyZW50IGVkZ2UgZnJvbSB1LlxyXG4gICAgICBmb3IgKHYgaW4gYWRqYWNlbnRfbm9kZXMpIHtcclxuICAgICAgICBpZiAoYWRqYWNlbnRfbm9kZXMuaGFzT3duUHJvcGVydHkodikpIHtcclxuICAgICAgICAgIC8vIEdldCB0aGUgY29zdCBvZiB0aGUgZWRnZSBydW5uaW5nIGZyb20gdSB0byB2LlxyXG4gICAgICAgICAgY29zdF9vZl9lID0gYWRqYWNlbnRfbm9kZXNbdl07XHJcblxyXG4gICAgICAgICAgLy8gQ29zdCBvZiBzIHRvIHUgcGx1cyB0aGUgY29zdCBvZiB1IHRvIHYgYWNyb3NzIGUtLXRoaXMgaXMgKmEqXHJcbiAgICAgICAgICAvLyBjb3N0IGZyb20gcyB0byB2IHRoYXQgbWF5IG9yIG1heSBub3QgYmUgbGVzcyB0aGFuIHRoZSBjdXJyZW50XHJcbiAgICAgICAgICAvLyBrbm93biBjb3N0IHRvIHYuXHJcbiAgICAgICAgICBjb3N0X29mX3NfdG9fdV9wbHVzX2Nvc3Rfb2ZfZSA9IGNvc3Rfb2Zfc190b191ICsgY29zdF9vZl9lO1xyXG5cclxuICAgICAgICAgIC8vIElmIHdlIGhhdmVuJ3QgdmlzaXRlZCB2IHlldCBPUiBpZiB0aGUgY3VycmVudCBrbm93biBjb3N0IGZyb20gcyB0b1xyXG4gICAgICAgICAgLy8gdiBpcyBncmVhdGVyIHRoYW4gdGhlIG5ldyBjb3N0IHdlIGp1c3QgZm91bmQgKGNvc3Qgb2YgcyB0byB1IHBsdXNcclxuICAgICAgICAgIC8vIGNvc3Qgb2YgdSB0byB2IGFjcm9zcyBlKSwgdXBkYXRlIHYncyBjb3N0IGluIHRoZSBjb3N0IGxpc3QgYW5kXHJcbiAgICAgICAgICAvLyB1cGRhdGUgdidzIHByZWRlY2Vzc29yIGluIHRoZSBwcmVkZWNlc3NvciBsaXN0IChpdCdzIG5vdyB1KS5cclxuICAgICAgICAgIGNvc3Rfb2Zfc190b192ID0gY29zdHNbdl07XHJcbiAgICAgICAgICBmaXJzdF92aXNpdCA9ICh0eXBlb2YgY29zdHNbdl0gPT09ICd1bmRlZmluZWQnKTtcclxuICAgICAgICAgIGlmIChmaXJzdF92aXNpdCB8fCBjb3N0X29mX3NfdG9fdiA+IGNvc3Rfb2Zfc190b191X3BsdXNfY29zdF9vZl9lKSB7XHJcbiAgICAgICAgICAgIGNvc3RzW3ZdID0gY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2U7XHJcbiAgICAgICAgICAgIG9wZW4ucHVzaCh2LCBjb3N0X29mX3NfdG9fdV9wbHVzX2Nvc3Rfb2ZfZSk7XHJcbiAgICAgICAgICAgIHByZWRlY2Vzc29yc1t2XSA9IHU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBkICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29zdHNbZF0gPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHZhciBtc2cgPSBbJ0NvdWxkIG5vdCBmaW5kIGEgcGF0aCBmcm9tICcsIHMsICcgdG8gJywgZCwgJy4nXS5qb2luKCcnKTtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHByZWRlY2Vzc29ycztcclxuICB9LFxyXG5cclxuICBleHRyYWN0X3Nob3J0ZXN0X3BhdGhfZnJvbV9wcmVkZWNlc3Nvcl9saXN0OiBmdW5jdGlvbihwcmVkZWNlc3NvcnMsIGQpIHtcclxuICAgIHZhciBub2RlcyA9IFtdO1xyXG4gICAgdmFyIHUgPSBkO1xyXG4gICAgdmFyIHByZWRlY2Vzc29yO1xyXG4gICAgd2hpbGUgKHUpIHtcclxuICAgICAgbm9kZXMucHVzaCh1KTtcclxuICAgICAgcHJlZGVjZXNzb3IgPSBwcmVkZWNlc3NvcnNbdV07XHJcbiAgICAgIHUgPSBwcmVkZWNlc3NvcnNbdV07XHJcbiAgICB9XHJcbiAgICBub2Rlcy5yZXZlcnNlKCk7XHJcbiAgICByZXR1cm4gbm9kZXM7XHJcbiAgfSxcclxuXHJcbiAgZmluZF9wYXRoOiBmdW5jdGlvbihncmFwaCwgcywgZCkge1xyXG4gICAgdmFyIHByZWRlY2Vzc29ycyA9IGRpamtzdHJhLnNpbmdsZV9zb3VyY2Vfc2hvcnRlc3RfcGF0aHMoZ3JhcGgsIHMsIGQpO1xyXG4gICAgcmV0dXJuIGRpamtzdHJhLmV4dHJhY3Rfc2hvcnRlc3RfcGF0aF9mcm9tX3ByZWRlY2Vzc29yX2xpc3QoXHJcbiAgICAgIHByZWRlY2Vzc29ycywgZCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQSB2ZXJ5IG5haXZlIHByaW9yaXR5IHF1ZXVlIGltcGxlbWVudGF0aW9uLlxyXG4gICAqL1xyXG4gIFByaW9yaXR5UXVldWU6IHtcclxuICAgIG1ha2U6IGZ1bmN0aW9uIChvcHRzKSB7XHJcbiAgICAgIHZhciBUID0gZGlqa3N0cmEuUHJpb3JpdHlRdWV1ZSxcclxuICAgICAgICAgIHQgPSB7fSxcclxuICAgICAgICAgIGtleTtcclxuICAgICAgb3B0cyA9IG9wdHMgfHwge307XHJcbiAgICAgIGZvciAoa2V5IGluIFQpIHtcclxuICAgICAgICBpZiAoVC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICB0W2tleV0gPSBUW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHQucXVldWUgPSBbXTtcclxuICAgICAgdC5zb3J0ZXIgPSBvcHRzLnNvcnRlciB8fCBULmRlZmF1bHRfc29ydGVyO1xyXG4gICAgICByZXR1cm4gdDtcclxuICAgIH0sXHJcblxyXG4gICAgZGVmYXVsdF9zb3J0ZXI6IGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgIHJldHVybiBhLmNvc3QgLSBiLmNvc3Q7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgbmV3IGl0ZW0gdG8gdGhlIHF1ZXVlIGFuZCBlbnN1cmUgdGhlIGhpZ2hlc3QgcHJpb3JpdHkgZWxlbWVudFxyXG4gICAgICogaXMgYXQgdGhlIGZyb250IG9mIHRoZSBxdWV1ZS5cclxuICAgICAqL1xyXG4gICAgcHVzaDogZnVuY3Rpb24gKHZhbHVlLCBjb3N0KSB7XHJcbiAgICAgIHZhciBpdGVtID0ge3ZhbHVlOiB2YWx1ZSwgY29zdDogY29zdH07XHJcbiAgICAgIHRoaXMucXVldWUucHVzaChpdGVtKTtcclxuICAgICAgdGhpcy5xdWV1ZS5zb3J0KHRoaXMuc29ydGVyKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIGhpZ2hlc3QgcHJpb3JpdHkgZWxlbWVudCBpbiB0aGUgcXVldWUuXHJcbiAgICAgKi9cclxuICAgIHBvcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZS5zaGlmdCgpO1xyXG4gICAgfSxcclxuXHJcbiAgICBlbXB0eTogZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZS5sZW5ndGggPT09IDA7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuXHJcbi8vIG5vZGUuanMgbW9kdWxlIGV4cG9ydHNcclxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBkaWprc3RyYTtcclxufVxyXG4iLCJjb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcclxuY29uc3QgTnVtZXJpY0RhdGEgPSByZXF1aXJlKCcuL251bWVyaWMtZGF0YScpXHJcbmNvbnN0IEFscGhhbnVtZXJpY0RhdGEgPSByZXF1aXJlKCcuL2FscGhhbnVtZXJpYy1kYXRhJylcclxuY29uc3QgQnl0ZURhdGEgPSByZXF1aXJlKCcuL2J5dGUtZGF0YScpXHJcbmNvbnN0IEthbmppRGF0YSA9IHJlcXVpcmUoJy4va2FuamktZGF0YScpXHJcbmNvbnN0IFJlZ2V4ID0gcmVxdWlyZSgnLi9yZWdleCcpXHJcbmNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXHJcbmNvbnN0IGRpamtzdHJhID0gcmVxdWlyZSgnZGlqa3N0cmFqcycpXHJcblxyXG4vKipcclxuICogUmV0dXJucyBVVEY4IGJ5dGUgbGVuZ3RoXHJcbiAqXHJcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIElucHV0IHN0cmluZ1xyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICBOdW1iZXIgb2YgYnl0ZVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0U3RyaW5nQnl0ZUxlbmd0aCAoc3RyKSB7XHJcbiAgcmV0dXJuIHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChzdHIpKS5sZW5ndGhcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCBhIGxpc3Qgb2Ygc2VnbWVudHMgb2YgdGhlIHNwZWNpZmllZCBtb2RlXHJcbiAqIGZyb20gYSBzdHJpbmdcclxuICpcclxuICogQHBhcmFtICB7TW9kZX0gICBtb2RlIFNlZ21lbnQgbW9kZVxyXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciAgU3RyaW5nIHRvIHByb2Nlc3NcclxuICogQHJldHVybiB7QXJyYXl9ICAgICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcclxuICovXHJcbmZ1bmN0aW9uIGdldFNlZ21lbnRzIChyZWdleCwgbW9kZSwgc3RyKSB7XHJcbiAgY29uc3Qgc2VnbWVudHMgPSBbXVxyXG4gIGxldCByZXN1bHRcclxuXHJcbiAgd2hpbGUgKChyZXN1bHQgPSByZWdleC5leGVjKHN0cikpICE9PSBudWxsKSB7XHJcbiAgICBzZWdtZW50cy5wdXNoKHtcclxuICAgICAgZGF0YTogcmVzdWx0WzBdLFxyXG4gICAgICBpbmRleDogcmVzdWx0LmluZGV4LFxyXG4gICAgICBtb2RlOiBtb2RlLFxyXG4gICAgICBsZW5ndGg6IHJlc3VsdFswXS5sZW5ndGhcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICByZXR1cm4gc2VnbWVudHNcclxufVxyXG5cclxuLyoqXHJcbiAqIEV4dHJhY3RzIGEgc2VyaWVzIG9mIHNlZ21lbnRzIHdpdGggdGhlIGFwcHJvcHJpYXRlXHJcbiAqIG1vZGVzIGZyb20gYSBzdHJpbmdcclxuICpcclxuICogQHBhcmFtICB7U3RyaW5nfSBkYXRhU3RyIElucHV0IHN0cmluZ1xyXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0U2VnbWVudHNGcm9tU3RyaW5nIChkYXRhU3RyKSB7XHJcbiAgY29uc3QgbnVtU2VncyA9IGdldFNlZ21lbnRzKFJlZ2V4Lk5VTUVSSUMsIE1vZGUuTlVNRVJJQywgZGF0YVN0cilcclxuICBjb25zdCBhbHBoYU51bVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5BTFBIQU5VTUVSSUMsIE1vZGUuQUxQSEFOVU1FUklDLCBkYXRhU3RyKVxyXG4gIGxldCBieXRlU2Vnc1xyXG4gIGxldCBrYW5qaVNlZ3NcclxuXHJcbiAgaWYgKFV0aWxzLmlzS2FuamlNb2RlRW5hYmxlZCgpKSB7XHJcbiAgICBieXRlU2VncyA9IGdldFNlZ21lbnRzKFJlZ2V4LkJZVEUsIE1vZGUuQllURSwgZGF0YVN0cilcclxuICAgIGthbmppU2VncyA9IGdldFNlZ21lbnRzKFJlZ2V4LktBTkpJLCBNb2RlLktBTkpJLCBkYXRhU3RyKVxyXG4gIH0gZWxzZSB7XHJcbiAgICBieXRlU2VncyA9IGdldFNlZ21lbnRzKFJlZ2V4LkJZVEVfS0FOSkksIE1vZGUuQllURSwgZGF0YVN0cilcclxuICAgIGthbmppU2VncyA9IFtdXHJcbiAgfVxyXG5cclxuICBjb25zdCBzZWdzID0gbnVtU2Vncy5jb25jYXQoYWxwaGFOdW1TZWdzLCBieXRlU2Vncywga2FuamlTZWdzKVxyXG5cclxuICByZXR1cm4gc2Vnc1xyXG4gICAgLnNvcnQoZnVuY3Rpb24gKHMxLCBzMikge1xyXG4gICAgICByZXR1cm4gczEuaW5kZXggLSBzMi5pbmRleFxyXG4gICAgfSlcclxuICAgIC5tYXAoZnVuY3Rpb24gKG9iaikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGRhdGE6IG9iai5kYXRhLFxyXG4gICAgICAgIG1vZGU6IG9iai5tb2RlLFxyXG4gICAgICAgIGxlbmd0aDogb2JqLmxlbmd0aFxyXG4gICAgICB9XHJcbiAgICB9KVxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBob3cgbWFueSBiaXRzIGFyZSBuZWVkZWQgdG8gZW5jb2RlIGEgc3RyaW5nIG9mXHJcbiAqIHNwZWNpZmllZCBsZW5ndGggd2l0aCB0aGUgc3BlY2lmaWVkIG1vZGVcclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSBsZW5ndGggU3RyaW5nIGxlbmd0aFxyXG4gKiBAcGFyYW0gIHtNb2RlfSBtb2RlICAgICBTZWdtZW50IG1vZGVcclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgQml0IGxlbmd0aFxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0U2VnbWVudEJpdHNMZW5ndGggKGxlbmd0aCwgbW9kZSkge1xyXG4gIHN3aXRjaCAobW9kZSkge1xyXG4gICAgY2FzZSBNb2RlLk5VTUVSSUM6XHJcbiAgICAgIHJldHVybiBOdW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcclxuICAgIGNhc2UgTW9kZS5BTFBIQU5VTUVSSUM6XHJcbiAgICAgIHJldHVybiBBbHBoYW51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGgobGVuZ3RoKVxyXG4gICAgY2FzZSBNb2RlLktBTkpJOlxyXG4gICAgICByZXR1cm4gS2FuamlEYXRhLmdldEJpdHNMZW5ndGgobGVuZ3RoKVxyXG4gICAgY2FzZSBNb2RlLkJZVEU6XHJcbiAgICAgIHJldHVybiBCeXRlRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNZXJnZXMgYWRqYWNlbnQgc2VnbWVudHMgd2hpY2ggaGF2ZSB0aGUgc2FtZSBtb2RlXHJcbiAqXHJcbiAqIEBwYXJhbSAge0FycmF5fSBzZWdzIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcclxuICogQHJldHVybiB7QXJyYXl9ICAgICAgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxyXG4gKi9cclxuZnVuY3Rpb24gbWVyZ2VTZWdtZW50cyAoc2Vncykge1xyXG4gIHJldHVybiBzZWdzLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBjdXJyKSB7XHJcbiAgICBjb25zdCBwcmV2U2VnID0gYWNjLmxlbmd0aCAtIDEgPj0gMCA/IGFjY1thY2MubGVuZ3RoIC0gMV0gOiBudWxsXHJcbiAgICBpZiAocHJldlNlZyAmJiBwcmV2U2VnLm1vZGUgPT09IGN1cnIubW9kZSkge1xyXG4gICAgICBhY2NbYWNjLmxlbmd0aCAtIDFdLmRhdGEgKz0gY3Vyci5kYXRhXHJcbiAgICAgIHJldHVybiBhY2NcclxuICAgIH1cclxuXHJcbiAgICBhY2MucHVzaChjdXJyKVxyXG4gICAgcmV0dXJuIGFjY1xyXG4gIH0sIFtdKVxyXG59XHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIGEgbGlzdCBvZiBhbGwgcG9zc2libGUgbm9kZXMgY29tYmluYXRpb24gd2hpY2hcclxuICogd2lsbCBiZSB1c2VkIHRvIGJ1aWxkIGEgc2VnbWVudHMgZ3JhcGguXHJcbiAqXHJcbiAqIE5vZGVzIGFyZSBkaXZpZGVkIGJ5IGdyb3Vwcy4gRWFjaCBncm91cCB3aWxsIGNvbnRhaW4gYSBsaXN0IG9mIGFsbCB0aGUgbW9kZXNcclxuICogaW4gd2hpY2ggaXMgcG9zc2libGUgdG8gZW5jb2RlIHRoZSBnaXZlbiB0ZXh0LlxyXG4gKlxyXG4gKiBGb3IgZXhhbXBsZSB0aGUgdGV4dCAnMTIzNDUnIGNhbiBiZSBlbmNvZGVkIGFzIE51bWVyaWMsIEFscGhhbnVtZXJpYyBvciBCeXRlLlxyXG4gKiBUaGUgZ3JvdXAgZm9yICcxMjM0NScgd2lsbCBjb250YWluIHRoZW4gMyBvYmplY3RzLCBvbmUgZm9yIGVhY2hcclxuICogcG9zc2libGUgZW5jb2RpbmcgbW9kZS5cclxuICpcclxuICogRWFjaCBub2RlIHJlcHJlc2VudHMgYSBwb3NzaWJsZSBzZWdtZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtBcnJheX0gc2VncyBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXHJcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcclxuICovXHJcbmZ1bmN0aW9uIGJ1aWxkTm9kZXMgKHNlZ3MpIHtcclxuICBjb25zdCBub2RlcyA9IFtdXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjb25zdCBzZWcgPSBzZWdzW2ldXHJcblxyXG4gICAgc3dpdGNoIChzZWcubW9kZSkge1xyXG4gICAgICBjYXNlIE1vZGUuTlVNRVJJQzpcclxuICAgICAgICBub2Rlcy5wdXNoKFtzZWcsXHJcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkFMUEhBTlVNRVJJQywgbGVuZ3RoOiBzZWcubGVuZ3RoIH0sXHJcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkJZVEUsIGxlbmd0aDogc2VnLmxlbmd0aCB9XHJcbiAgICAgICAgXSlcclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlIE1vZGUuQUxQSEFOVU1FUklDOlxyXG4gICAgICAgIG5vZGVzLnB1c2goW3NlZyxcclxuICAgICAgICAgIHsgZGF0YTogc2VnLmRhdGEsIG1vZGU6IE1vZGUuQllURSwgbGVuZ3RoOiBzZWcubGVuZ3RoIH1cclxuICAgICAgICBdKVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGNhc2UgTW9kZS5LQU5KSTpcclxuICAgICAgICBub2Rlcy5wdXNoKFtzZWcsXHJcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkJZVEUsIGxlbmd0aDogZ2V0U3RyaW5nQnl0ZUxlbmd0aChzZWcuZGF0YSkgfVxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSBNb2RlLkJZVEU6XHJcbiAgICAgICAgbm9kZXMucHVzaChbXHJcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkJZVEUsIGxlbmd0aDogZ2V0U3RyaW5nQnl0ZUxlbmd0aChzZWcuZGF0YSkgfVxyXG4gICAgICAgIF0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbm9kZXNcclxufVxyXG5cclxuLyoqXHJcbiAqIEJ1aWxkcyBhIGdyYXBoIGZyb20gYSBsaXN0IG9mIG5vZGVzLlxyXG4gKiBBbGwgc2VnbWVudHMgaW4gZWFjaCBub2RlIGdyb3VwIHdpbGwgYmUgY29ubmVjdGVkIHdpdGggYWxsIHRoZSBzZWdtZW50cyBvZlxyXG4gKiB0aGUgbmV4dCBncm91cCBhbmQgc28gb24uXHJcbiAqXHJcbiAqIEF0IGVhY2ggY29ubmVjdGlvbiB3aWxsIGJlIGFzc2lnbmVkIGEgd2VpZ2h0IGRlcGVuZGluZyBvbiB0aGVcclxuICogc2VnbWVudCdzIGJ5dGUgbGVuZ3RoLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtBcnJheX0gbm9kZXMgICAgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICBHcmFwaCBvZiBhbGwgcG9zc2libGUgc2VnbWVudHNcclxuICovXHJcbmZ1bmN0aW9uIGJ1aWxkR3JhcGggKG5vZGVzLCB2ZXJzaW9uKSB7XHJcbiAgY29uc3QgdGFibGUgPSB7fVxyXG4gIGNvbnN0IGdyYXBoID0geyBzdGFydDoge30gfVxyXG4gIGxldCBwcmV2Tm9kZUlkcyA9IFsnc3RhcnQnXVxyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjb25zdCBub2RlR3JvdXAgPSBub2Rlc1tpXVxyXG4gICAgY29uc3QgY3VycmVudE5vZGVJZHMgPSBbXVxyXG5cclxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgbm9kZUdyb3VwLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgIGNvbnN0IG5vZGUgPSBub2RlR3JvdXBbal1cclxuICAgICAgY29uc3Qga2V5ID0gJycgKyBpICsgalxyXG5cclxuICAgICAgY3VycmVudE5vZGVJZHMucHVzaChrZXkpXHJcbiAgICAgIHRhYmxlW2tleV0gPSB7IG5vZGU6IG5vZGUsIGxhc3RDb3VudDogMCB9XHJcbiAgICAgIGdyYXBoW2tleV0gPSB7fVxyXG5cclxuICAgICAgZm9yIChsZXQgbiA9IDA7IG4gPCBwcmV2Tm9kZUlkcy5sZW5ndGg7IG4rKykge1xyXG4gICAgICAgIGNvbnN0IHByZXZOb2RlSWQgPSBwcmV2Tm9kZUlkc1tuXVxyXG5cclxuICAgICAgICBpZiAodGFibGVbcHJldk5vZGVJZF0gJiYgdGFibGVbcHJldk5vZGVJZF0ubm9kZS5tb2RlID09PSBub2RlLm1vZGUpIHtcclxuICAgICAgICAgIGdyYXBoW3ByZXZOb2RlSWRdW2tleV0gPVxyXG4gICAgICAgICAgICBnZXRTZWdtZW50Qml0c0xlbmd0aCh0YWJsZVtwcmV2Tm9kZUlkXS5sYXN0Q291bnQgKyBub2RlLmxlbmd0aCwgbm9kZS5tb2RlKSAtXHJcbiAgICAgICAgICAgIGdldFNlZ21lbnRCaXRzTGVuZ3RoKHRhYmxlW3ByZXZOb2RlSWRdLmxhc3RDb3VudCwgbm9kZS5tb2RlKVxyXG5cclxuICAgICAgICAgIHRhYmxlW3ByZXZOb2RlSWRdLmxhc3RDb3VudCArPSBub2RlLmxlbmd0aFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpZiAodGFibGVbcHJldk5vZGVJZF0pIHRhYmxlW3ByZXZOb2RlSWRdLmxhc3RDb3VudCA9IG5vZGUubGVuZ3RoXHJcblxyXG4gICAgICAgICAgZ3JhcGhbcHJldk5vZGVJZF1ba2V5XSA9IGdldFNlZ21lbnRCaXRzTGVuZ3RoKG5vZGUubGVuZ3RoLCBub2RlLm1vZGUpICtcclxuICAgICAgICAgICAgNCArIE1vZGUuZ2V0Q2hhckNvdW50SW5kaWNhdG9yKG5vZGUubW9kZSwgdmVyc2lvbikgLy8gc3dpdGNoIGNvc3RcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcmV2Tm9kZUlkcyA9IGN1cnJlbnROb2RlSWRzXHJcbiAgfVxyXG5cclxuICBmb3IgKGxldCBuID0gMDsgbiA8IHByZXZOb2RlSWRzLmxlbmd0aDsgbisrKSB7XHJcbiAgICBncmFwaFtwcmV2Tm9kZUlkc1tuXV0uZW5kID0gMFxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgbWFwOiBncmFwaCwgdGFibGU6IHRhYmxlIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEJ1aWxkcyBhIHNlZ21lbnQgZnJvbSBhIHNwZWNpZmllZCBkYXRhIGFuZCBtb2RlLlxyXG4gKiBJZiBhIG1vZGUgaXMgbm90IHNwZWNpZmllZCwgdGhlIG1vcmUgc3VpdGFibGUgd2lsbCBiZSB1c2VkLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGEgICAgICAgICAgICAgSW5wdXQgZGF0YVxyXG4gKiBAcGFyYW0gIHtNb2RlIHwgU3RyaW5nfSBtb2Rlc0hpbnQgRGF0YSBtb2RlXHJcbiAqIEByZXR1cm4ge1NlZ21lbnR9ICAgICAgICAgICAgICAgICBTZWdtZW50XHJcbiAqL1xyXG5mdW5jdGlvbiBidWlsZFNpbmdsZVNlZ21lbnQgKGRhdGEsIG1vZGVzSGludCkge1xyXG4gIGxldCBtb2RlXHJcbiAgY29uc3QgYmVzdE1vZGUgPSBNb2RlLmdldEJlc3RNb2RlRm9yRGF0YShkYXRhKVxyXG5cclxuICBtb2RlID0gTW9kZS5mcm9tKG1vZGVzSGludCwgYmVzdE1vZGUpXHJcblxyXG4gIC8vIE1ha2Ugc3VyZSBkYXRhIGNhbiBiZSBlbmNvZGVkXHJcbiAgaWYgKG1vZGUgIT09IE1vZGUuQllURSAmJiBtb2RlLmJpdCA8IGJlc3RNb2RlLmJpdCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdcIicgKyBkYXRhICsgJ1wiJyArXHJcbiAgICAgICcgY2Fubm90IGJlIGVuY29kZWQgd2l0aCBtb2RlICcgKyBNb2RlLnRvU3RyaW5nKG1vZGUpICtcclxuICAgICAgJy5cXG4gU3VnZ2VzdGVkIG1vZGUgaXM6ICcgKyBNb2RlLnRvU3RyaW5nKGJlc3RNb2RlKSlcclxuICB9XHJcblxyXG4gIC8vIFVzZSBNb2RlLkJZVEUgaWYgS2Fuamkgc3VwcG9ydCBpcyBkaXNhYmxlZFxyXG4gIGlmIChtb2RlID09PSBNb2RlLktBTkpJICYmICFVdGlscy5pc0thbmppTW9kZUVuYWJsZWQoKSkge1xyXG4gICAgbW9kZSA9IE1vZGUuQllURVxyXG4gIH1cclxuXHJcbiAgc3dpdGNoIChtb2RlKSB7XHJcbiAgICBjYXNlIE1vZGUuTlVNRVJJQzpcclxuICAgICAgcmV0dXJuIG5ldyBOdW1lcmljRGF0YShkYXRhKVxyXG5cclxuICAgIGNhc2UgTW9kZS5BTFBIQU5VTUVSSUM6XHJcbiAgICAgIHJldHVybiBuZXcgQWxwaGFudW1lcmljRGF0YShkYXRhKVxyXG5cclxuICAgIGNhc2UgTW9kZS5LQU5KSTpcclxuICAgICAgcmV0dXJuIG5ldyBLYW5qaURhdGEoZGF0YSlcclxuXHJcbiAgICBjYXNlIE1vZGUuQllURTpcclxuICAgICAgcmV0dXJuIG5ldyBCeXRlRGF0YShkYXRhKVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEJ1aWxkcyBhIGxpc3Qgb2Ygc2VnbWVudHMgZnJvbSBhbiBhcnJheS5cclxuICogQXJyYXkgY2FuIGNvbnRhaW4gU3RyaW5ncyBvciBPYmplY3RzIHdpdGggc2VnbWVudCdzIGluZm8uXHJcbiAqXHJcbiAqIEZvciBlYWNoIGl0ZW0gd2hpY2ggaXMgYSBzdHJpbmcsIHdpbGwgYmUgZ2VuZXJhdGVkIGEgc2VnbWVudCB3aXRoIHRoZSBnaXZlblxyXG4gKiBzdHJpbmcgYW5kIHRoZSBtb3JlIGFwcHJvcHJpYXRlIGVuY29kaW5nIG1vZGUuXHJcbiAqXHJcbiAqIEZvciBlYWNoIGl0ZW0gd2hpY2ggaXMgYW4gb2JqZWN0LCB3aWxsIGJlIGdlbmVyYXRlZCBhIHNlZ21lbnQgd2l0aCB0aGUgZ2l2ZW5cclxuICogZGF0YSBhbmQgbW9kZS5cclxuICogT2JqZWN0cyBtdXN0IGNvbnRhaW4gYXQgbGVhc3QgdGhlIHByb3BlcnR5IFwiZGF0YVwiLlxyXG4gKiBJZiBwcm9wZXJ0eSBcIm1vZGVcIiBpcyBub3QgcHJlc2VudCwgdGhlIG1vcmUgc3VpdGFibGUgbW9kZSB3aWxsIGJlIHVzZWQuXHJcbiAqXHJcbiAqIEBwYXJhbSAge0FycmF5fSBhcnJheSBBcnJheSBvZiBvYmplY3RzIHdpdGggc2VnbWVudHMgZGF0YVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgQXJyYXkgb2YgU2VnbWVudHNcclxuICovXHJcbmV4cG9ydHMuZnJvbUFycmF5ID0gZnVuY3Rpb24gZnJvbUFycmF5IChhcnJheSkge1xyXG4gIHJldHVybiBhcnJheS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgc2VnKSB7XHJcbiAgICBpZiAodHlwZW9mIHNlZyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgYWNjLnB1c2goYnVpbGRTaW5nbGVTZWdtZW50KHNlZywgbnVsbCkpXHJcbiAgICB9IGVsc2UgaWYgKHNlZy5kYXRhKSB7XHJcbiAgICAgIGFjYy5wdXNoKGJ1aWxkU2luZ2xlU2VnbWVudChzZWcuZGF0YSwgc2VnLm1vZGUpKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhY2NcclxuICB9LCBbXSlcclxufVxyXG5cclxuLyoqXHJcbiAqIEJ1aWxkcyBhbiBvcHRpbWl6ZWQgc2VxdWVuY2Ugb2Ygc2VnbWVudHMgZnJvbSBhIHN0cmluZyxcclxuICogd2hpY2ggd2lsbCBwcm9kdWNlIHRoZSBzaG9ydGVzdCBwb3NzaWJsZSBiaXRzdHJlYW0uXHJcbiAqXHJcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YSAgICBJbnB1dCBzdHJpbmdcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgQXJyYXkgb2Ygc2VnbWVudHNcclxuICovXHJcbmV4cG9ydHMuZnJvbVN0cmluZyA9IGZ1bmN0aW9uIGZyb21TdHJpbmcgKGRhdGEsIHZlcnNpb24pIHtcclxuICBjb25zdCBzZWdzID0gZ2V0U2VnbWVudHNGcm9tU3RyaW5nKGRhdGEsIFV0aWxzLmlzS2FuamlNb2RlRW5hYmxlZCgpKVxyXG5cclxuICBjb25zdCBub2RlcyA9IGJ1aWxkTm9kZXMoc2VncylcclxuICBjb25zdCBncmFwaCA9IGJ1aWxkR3JhcGgobm9kZXMsIHZlcnNpb24pXHJcbiAgY29uc3QgcGF0aCA9IGRpamtzdHJhLmZpbmRfcGF0aChncmFwaC5tYXAsICdzdGFydCcsICdlbmQnKVxyXG5cclxuICBjb25zdCBvcHRpbWl6ZWRTZWdzID0gW11cclxuICBmb3IgKGxldCBpID0gMTsgaSA8IHBhdGgubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICBvcHRpbWl6ZWRTZWdzLnB1c2goZ3JhcGgudGFibGVbcGF0aFtpXV0ubm9kZSlcclxuICB9XHJcblxyXG4gIHJldHVybiBleHBvcnRzLmZyb21BcnJheShtZXJnZVNlZ21lbnRzKG9wdGltaXplZFNlZ3MpKVxyXG59XHJcblxyXG4vKipcclxuICogU3BsaXRzIGEgc3RyaW5nIGluIHZhcmlvdXMgc2VnbWVudHMgd2l0aCB0aGUgbW9kZXMgd2hpY2hcclxuICogYmVzdCByZXByZXNlbnQgdGhlaXIgY29udGVudC5cclxuICogVGhlIHByb2R1Y2VkIHNlZ21lbnRzIGFyZSBmYXIgZnJvbSBiZWluZyBvcHRpbWl6ZWQuXHJcbiAqIFRoZSBvdXRwdXQgb2YgdGhpcyBmdW5jdGlvbiBpcyBvbmx5IHVzZWQgdG8gZXN0aW1hdGUgYSBRUiBDb2RlIHZlcnNpb25cclxuICogd2hpY2ggbWF5IGNvbnRhaW4gdGhlIGRhdGEuXHJcbiAqXHJcbiAqIEBwYXJhbSAge3N0cmluZ30gZGF0YSBJbnB1dCBzdHJpbmdcclxuICogQHJldHVybiB7QXJyYXl9ICAgICAgIEFycmF5IG9mIHNlZ21lbnRzXHJcbiAqL1xyXG5leHBvcnRzLnJhd1NwbGl0ID0gZnVuY3Rpb24gcmF3U3BsaXQgKGRhdGEpIHtcclxuICByZXR1cm4gZXhwb3J0cy5mcm9tQXJyYXkoXHJcbiAgICBnZXRTZWdtZW50c0Zyb21TdHJpbmcoZGF0YSwgVXRpbHMuaXNLYW5qaU1vZGVFbmFibGVkKCkpXHJcbiAgKVxyXG59XHJcbiIsImNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXHJcbmNvbnN0IEVDTGV2ZWwgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwnKVxyXG5jb25zdCBCaXRCdWZmZXIgPSByZXF1aXJlKCcuL2JpdC1idWZmZXInKVxyXG5jb25zdCBCaXRNYXRyaXggPSByZXF1aXJlKCcuL2JpdC1tYXRyaXgnKVxyXG5jb25zdCBBbGlnbm1lbnRQYXR0ZXJuID0gcmVxdWlyZSgnLi9hbGlnbm1lbnQtcGF0dGVybicpXHJcbmNvbnN0IEZpbmRlclBhdHRlcm4gPSByZXF1aXJlKCcuL2ZpbmRlci1wYXR0ZXJuJylcclxuY29uc3QgTWFza1BhdHRlcm4gPSByZXF1aXJlKCcuL21hc2stcGF0dGVybicpXHJcbmNvbnN0IEVDQ29kZSA9IHJlcXVpcmUoJy4vZXJyb3ItY29ycmVjdGlvbi1jb2RlJylcclxuY29uc3QgUmVlZFNvbG9tb25FbmNvZGVyID0gcmVxdWlyZSgnLi9yZWVkLXNvbG9tb24tZW5jb2RlcicpXHJcbmNvbnN0IFZlcnNpb24gPSByZXF1aXJlKCcuL3ZlcnNpb24nKVxyXG5jb25zdCBGb3JtYXRJbmZvID0gcmVxdWlyZSgnLi9mb3JtYXQtaW5mbycpXHJcbmNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxyXG5jb25zdCBTZWdtZW50cyA9IHJlcXVpcmUoJy4vc2VnbWVudHMnKVxyXG5cclxuLyoqXHJcbiAqIFFSQ29kZSBmb3IgSmF2YVNjcmlwdFxyXG4gKlxyXG4gKiBtb2RpZmllZCBieSBSeWFuIERheSBmb3Igbm9kZWpzIHN1cHBvcnRcclxuICogQ29weXJpZ2h0IChjKSAyMDExIFJ5YW4gRGF5XHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcclxuICogICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxyXG4gKlxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBRUkNvZGUgZm9yIEphdmFTY3JpcHRcclxuLy9cclxuLy8gQ29weXJpZ2h0IChjKSAyMDA5IEthenVoaWtvIEFyYXNlXHJcbi8vXHJcbi8vIFVSTDogaHR0cDovL3d3dy5kLXByb2plY3QuY29tL1xyXG4vL1xyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbi8vICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcclxuLy9cclxuLy8gVGhlIHdvcmQgXCJRUiBDb2RlXCIgaXMgcmVnaXN0ZXJlZCB0cmFkZW1hcmsgb2ZcclxuLy8gREVOU08gV0FWRSBJTkNPUlBPUkFURURcclxuLy8gICBodHRwOi8vd3d3LmRlbnNvLXdhdmUuY29tL3FyY29kZS9mYXFwYXRlbnQtZS5odG1sXHJcbi8vXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiovXHJcblxyXG4vKipcclxuICogQWRkIGZpbmRlciBwYXR0ZXJucyBiaXRzIHRvIG1hdHJpeFxyXG4gKlxyXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCAgTW9kdWxlcyBtYXRyaXhcclxuICogQHBhcmFtICB7TnVtYmVyfSAgICB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxyXG4gKi9cclxuZnVuY3Rpb24gc2V0dXBGaW5kZXJQYXR0ZXJuIChtYXRyaXgsIHZlcnNpb24pIHtcclxuICBjb25zdCBzaXplID0gbWF0cml4LnNpemVcclxuICBjb25zdCBwb3MgPSBGaW5kZXJQYXR0ZXJuLmdldFBvc2l0aW9ucyh2ZXJzaW9uKVxyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBvcy5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3Qgcm93ID0gcG9zW2ldWzBdXHJcbiAgICBjb25zdCBjb2wgPSBwb3NbaV1bMV1cclxuXHJcbiAgICBmb3IgKGxldCByID0gLTE7IHIgPD0gNzsgcisrKSB7XHJcbiAgICAgIGlmIChyb3cgKyByIDw9IC0xIHx8IHNpemUgPD0gcm93ICsgcikgY29udGludWVcclxuXHJcbiAgICAgIGZvciAobGV0IGMgPSAtMTsgYyA8PSA3OyBjKyspIHtcclxuICAgICAgICBpZiAoY29sICsgYyA8PSAtMSB8fCBzaXplIDw9IGNvbCArIGMpIGNvbnRpbnVlXHJcblxyXG4gICAgICAgIGlmICgociA+PSAwICYmIHIgPD0gNiAmJiAoYyA9PT0gMCB8fCBjID09PSA2KSkgfHxcclxuICAgICAgICAgIChjID49IDAgJiYgYyA8PSA2ICYmIChyID09PSAwIHx8IHIgPT09IDYpKSB8fFxyXG4gICAgICAgICAgKHIgPj0gMiAmJiByIDw9IDQgJiYgYyA+PSAyICYmIGMgPD0gNCkpIHtcclxuICAgICAgICAgIG1hdHJpeC5zZXQocm93ICsgciwgY29sICsgYywgdHJ1ZSwgdHJ1ZSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbWF0cml4LnNldChyb3cgKyByLCBjb2wgKyBjLCBmYWxzZSwgdHJ1ZSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGQgdGltaW5nIHBhdHRlcm4gYml0cyB0byBtYXRyaXhcclxuICpcclxuICogTm90ZTogdGhpcyBmdW5jdGlvbiBtdXN0IGJlIGNhbGxlZCBiZWZvcmUge0BsaW5rIHNldHVwQWxpZ25tZW50UGF0dGVybn1cclxuICpcclxuICogQHBhcmFtICB7Qml0TWF0cml4fSBtYXRyaXggTW9kdWxlcyBtYXRyaXhcclxuICovXHJcbmZ1bmN0aW9uIHNldHVwVGltaW5nUGF0dGVybiAobWF0cml4KSB7XHJcbiAgY29uc3Qgc2l6ZSA9IG1hdHJpeC5zaXplXHJcblxyXG4gIGZvciAobGV0IHIgPSA4OyByIDwgc2l6ZSAtIDg7IHIrKykge1xyXG4gICAgY29uc3QgdmFsdWUgPSByICUgMiA9PT0gMFxyXG4gICAgbWF0cml4LnNldChyLCA2LCB2YWx1ZSwgdHJ1ZSlcclxuICAgIG1hdHJpeC5zZXQoNiwgciwgdmFsdWUsIHRydWUpXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWRkIGFsaWdubWVudCBwYXR0ZXJucyBiaXRzIHRvIG1hdHJpeFxyXG4gKlxyXG4gKiBOb3RlOiB0aGlzIGZ1bmN0aW9uIG11c3QgYmUgY2FsbGVkIGFmdGVyIHtAbGluayBzZXR1cFRpbWluZ1BhdHRlcm59XHJcbiAqXHJcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gbWF0cml4ICBNb2R1bGVzIG1hdHJpeFxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgIHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXHJcbiAqL1xyXG5mdW5jdGlvbiBzZXR1cEFsaWdubWVudFBhdHRlcm4gKG1hdHJpeCwgdmVyc2lvbikge1xyXG4gIGNvbnN0IHBvcyA9IEFsaWdubWVudFBhdHRlcm4uZ2V0UG9zaXRpb25zKHZlcnNpb24pXHJcblxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcG9zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjb25zdCByb3cgPSBwb3NbaV1bMF1cclxuICAgIGNvbnN0IGNvbCA9IHBvc1tpXVsxXVxyXG5cclxuICAgIGZvciAobGV0IHIgPSAtMjsgciA8PSAyOyByKyspIHtcclxuICAgICAgZm9yIChsZXQgYyA9IC0yOyBjIDw9IDI7IGMrKykge1xyXG4gICAgICAgIGlmIChyID09PSAtMiB8fCByID09PSAyIHx8IGMgPT09IC0yIHx8IGMgPT09IDIgfHxcclxuICAgICAgICAgIChyID09PSAwICYmIGMgPT09IDApKSB7XHJcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdyArIHIsIGNvbCArIGMsIHRydWUsIHRydWUpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1hdHJpeC5zZXQocm93ICsgciwgY29sICsgYywgZmFsc2UsIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWRkIHZlcnNpb24gaW5mbyBiaXRzIHRvIG1hdHJpeFxyXG4gKlxyXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCAgTW9kdWxlcyBtYXRyaXhcclxuICogQHBhcmFtICB7TnVtYmVyfSAgICB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxyXG4gKi9cclxuZnVuY3Rpb24gc2V0dXBWZXJzaW9uSW5mbyAobWF0cml4LCB2ZXJzaW9uKSB7XHJcbiAgY29uc3Qgc2l6ZSA9IG1hdHJpeC5zaXplXHJcbiAgY29uc3QgYml0cyA9IFZlcnNpb24uZ2V0RW5jb2RlZEJpdHModmVyc2lvbilcclxuICBsZXQgcm93LCBjb2wsIG1vZFxyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IDE4OyBpKyspIHtcclxuICAgIHJvdyA9IE1hdGguZmxvb3IoaSAvIDMpXHJcbiAgICBjb2wgPSBpICUgMyArIHNpemUgLSA4IC0gM1xyXG4gICAgbW9kID0gKChiaXRzID4+IGkpICYgMSkgPT09IDFcclxuXHJcbiAgICBtYXRyaXguc2V0KHJvdywgY29sLCBtb2QsIHRydWUpXHJcbiAgICBtYXRyaXguc2V0KGNvbCwgcm93LCBtb2QsIHRydWUpXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWRkIGZvcm1hdCBpbmZvIGJpdHMgdG8gbWF0cml4XHJcbiAqXHJcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gbWF0cml4ICAgICAgICAgICAgICAgTW9kdWxlcyBtYXRyaXhcclxuICogQHBhcmFtICB7RXJyb3JDb3JyZWN0aW9uTGV2ZWx9ICAgIGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcclxuICogQHBhcmFtICB7TnVtYmVyfSAgICBtYXNrUGF0dGVybiAgICAgICAgICBNYXNrIHBhdHRlcm4gcmVmZXJlbmNlIHZhbHVlXHJcbiAqL1xyXG5mdW5jdGlvbiBzZXR1cEZvcm1hdEluZm8gKG1hdHJpeCwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2tQYXR0ZXJuKSB7XHJcbiAgY29uc3Qgc2l6ZSA9IG1hdHJpeC5zaXplXHJcbiAgY29uc3QgYml0cyA9IEZvcm1hdEluZm8uZ2V0RW5jb2RlZEJpdHMoZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2tQYXR0ZXJuKVxyXG4gIGxldCBpLCBtb2RcclxuXHJcbiAgZm9yIChpID0gMDsgaSA8IDE1OyBpKyspIHtcclxuICAgIG1vZCA9ICgoYml0cyA+PiBpKSAmIDEpID09PSAxXHJcblxyXG4gICAgLy8gdmVydGljYWxcclxuICAgIGlmIChpIDwgNikge1xyXG4gICAgICBtYXRyaXguc2V0KGksIDgsIG1vZCwgdHJ1ZSlcclxuICAgIH0gZWxzZSBpZiAoaSA8IDgpIHtcclxuICAgICAgbWF0cml4LnNldChpICsgMSwgOCwgbW9kLCB0cnVlKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbWF0cml4LnNldChzaXplIC0gMTUgKyBpLCA4LCBtb2QsIHRydWUpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gaG9yaXpvbnRhbFxyXG4gICAgaWYgKGkgPCA4KSB7XHJcbiAgICAgIG1hdHJpeC5zZXQoOCwgc2l6ZSAtIGkgLSAxLCBtb2QsIHRydWUpXHJcbiAgICB9IGVsc2UgaWYgKGkgPCA5KSB7XHJcbiAgICAgIG1hdHJpeC5zZXQoOCwgMTUgLSBpIC0gMSArIDEsIG1vZCwgdHJ1ZSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG1hdHJpeC5zZXQoOCwgMTUgLSBpIC0gMSwgbW9kLCB0cnVlKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gZml4ZWQgbW9kdWxlXHJcbiAgbWF0cml4LnNldChzaXplIC0gOCwgOCwgMSwgdHJ1ZSlcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZCBlbmNvZGVkIGRhdGEgYml0cyB0byBtYXRyaXhcclxuICpcclxuICogQHBhcmFtICB7Qml0TWF0cml4fSAgbWF0cml4IE1vZHVsZXMgbWF0cml4XHJcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IGRhdGEgICBEYXRhIGNvZGV3b3Jkc1xyXG4gKi9cclxuZnVuY3Rpb24gc2V0dXBEYXRhIChtYXRyaXgsIGRhdGEpIHtcclxuICBjb25zdCBzaXplID0gbWF0cml4LnNpemVcclxuICBsZXQgaW5jID0gLTFcclxuICBsZXQgcm93ID0gc2l6ZSAtIDFcclxuICBsZXQgYml0SW5kZXggPSA3XHJcbiAgbGV0IGJ5dGVJbmRleCA9IDBcclxuXHJcbiAgZm9yIChsZXQgY29sID0gc2l6ZSAtIDE7IGNvbCA+IDA7IGNvbCAtPSAyKSB7XHJcbiAgICBpZiAoY29sID09PSA2KSBjb2wtLVxyXG5cclxuICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgMjsgYysrKSB7XHJcbiAgICAgICAgaWYgKCFtYXRyaXguaXNSZXNlcnZlZChyb3csIGNvbCAtIGMpKSB7XHJcbiAgICAgICAgICBsZXQgZGFyayA9IGZhbHNlXHJcblxyXG4gICAgICAgICAgaWYgKGJ5dGVJbmRleCA8IGRhdGEubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGRhcmsgPSAoKChkYXRhW2J5dGVJbmRleF0gPj4+IGJpdEluZGV4KSAmIDEpID09PSAxKVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIG1hdHJpeC5zZXQocm93LCBjb2wgLSBjLCBkYXJrKVxyXG4gICAgICAgICAgYml0SW5kZXgtLVxyXG5cclxuICAgICAgICAgIGlmIChiaXRJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgYnl0ZUluZGV4KytcclxuICAgICAgICAgICAgYml0SW5kZXggPSA3XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByb3cgKz0gaW5jXHJcblxyXG4gICAgICBpZiAocm93IDwgMCB8fCBzaXplIDw9IHJvdykge1xyXG4gICAgICAgIHJvdyAtPSBpbmNcclxuICAgICAgICBpbmMgPSAtaW5jXHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBlbmNvZGVkIGNvZGV3b3JkcyBmcm9tIGRhdGEgaW5wdXRcclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSAgIHZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcGFyYW0gIHtFcnJvckNvcnJlY3Rpb25MZXZlbH0gICBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXHJcbiAqIEBwYXJhbSAge0J5dGVEYXRhfSBkYXRhICAgICAgICAgICAgICAgICBEYXRhIGlucHV0XHJcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9ICAgICAgICAgICAgICAgICAgICBCdWZmZXIgY29udGFpbmluZyBlbmNvZGVkIGNvZGV3b3Jkc1xyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlRGF0YSAodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIHNlZ21lbnRzKSB7XHJcbiAgLy8gUHJlcGFyZSBkYXRhIGJ1ZmZlclxyXG4gIGNvbnN0IGJ1ZmZlciA9IG5ldyBCaXRCdWZmZXIoKVxyXG5cclxuICBzZWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAvLyBwcmVmaXggZGF0YSB3aXRoIG1vZGUgaW5kaWNhdG9yICg0IGJpdHMpXHJcbiAgICBidWZmZXIucHV0KGRhdGEubW9kZS5iaXQsIDQpXHJcblxyXG4gICAgLy8gUHJlZml4IGRhdGEgd2l0aCBjaGFyYWN0ZXIgY291bnQgaW5kaWNhdG9yLlxyXG4gICAgLy8gVGhlIGNoYXJhY3RlciBjb3VudCBpbmRpY2F0b3IgaXMgYSBzdHJpbmcgb2YgYml0cyB0aGF0IHJlcHJlc2VudHMgdGhlXHJcbiAgICAvLyBudW1iZXIgb2YgY2hhcmFjdGVycyB0aGF0IGFyZSBiZWluZyBlbmNvZGVkLlxyXG4gICAgLy8gVGhlIGNoYXJhY3RlciBjb3VudCBpbmRpY2F0b3IgbXVzdCBiZSBwbGFjZWQgYWZ0ZXIgdGhlIG1vZGUgaW5kaWNhdG9yXHJcbiAgICAvLyBhbmQgbXVzdCBiZSBhIGNlcnRhaW4gbnVtYmVyIG9mIGJpdHMgbG9uZywgZGVwZW5kaW5nIG9uIHRoZSBRUiB2ZXJzaW9uXHJcbiAgICAvLyBhbmQgZGF0YSBtb2RlXHJcbiAgICAvLyBAc2VlIHtAbGluayBNb2RlLmdldENoYXJDb3VudEluZGljYXRvcn0uXHJcbiAgICBidWZmZXIucHV0KGRhdGEuZ2V0TGVuZ3RoKCksIE1vZGUuZ2V0Q2hhckNvdW50SW5kaWNhdG9yKGRhdGEubW9kZSwgdmVyc2lvbikpXHJcblxyXG4gICAgLy8gYWRkIGJpbmFyeSBkYXRhIHNlcXVlbmNlIHRvIGJ1ZmZlclxyXG4gICAgZGF0YS53cml0ZShidWZmZXIpXHJcbiAgfSlcclxuXHJcbiAgLy8gQ2FsY3VsYXRlIHJlcXVpcmVkIG51bWJlciBvZiBiaXRzXHJcbiAgY29uc3QgdG90YWxDb2Rld29yZHMgPSBVdGlscy5nZXRTeW1ib2xUb3RhbENvZGV3b3Jkcyh2ZXJzaW9uKVxyXG4gIGNvbnN0IGVjVG90YWxDb2Rld29yZHMgPSBFQ0NvZGUuZ2V0VG90YWxDb2Rld29yZHNDb3VudCh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcclxuICBjb25zdCBkYXRhVG90YWxDb2Rld29yZHNCaXRzID0gKHRvdGFsQ29kZXdvcmRzIC0gZWNUb3RhbENvZGV3b3JkcykgKiA4XHJcblxyXG4gIC8vIEFkZCBhIHRlcm1pbmF0b3IuXHJcbiAgLy8gSWYgdGhlIGJpdCBzdHJpbmcgaXMgc2hvcnRlciB0aGFuIHRoZSB0b3RhbCBudW1iZXIgb2YgcmVxdWlyZWQgYml0cyxcclxuICAvLyBhIHRlcm1pbmF0b3Igb2YgdXAgdG8gZm91ciAwcyBtdXN0IGJlIGFkZGVkIHRvIHRoZSByaWdodCBzaWRlIG9mIHRoZSBzdHJpbmcuXHJcbiAgLy8gSWYgdGhlIGJpdCBzdHJpbmcgaXMgbW9yZSB0aGFuIGZvdXIgYml0cyBzaG9ydGVyIHRoYW4gdGhlIHJlcXVpcmVkIG51bWJlciBvZiBiaXRzLFxyXG4gIC8vIGFkZCBmb3VyIDBzIHRvIHRoZSBlbmQuXHJcbiAgaWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSArIDQgPD0gZGF0YVRvdGFsQ29kZXdvcmRzQml0cykge1xyXG4gICAgYnVmZmVyLnB1dCgwLCA0KVxyXG4gIH1cclxuXHJcbiAgLy8gSWYgdGhlIGJpdCBzdHJpbmcgaXMgZmV3ZXIgdGhhbiBmb3VyIGJpdHMgc2hvcnRlciwgYWRkIG9ubHkgdGhlIG51bWJlciBvZiAwcyB0aGF0XHJcbiAgLy8gYXJlIG5lZWRlZCB0byByZWFjaCB0aGUgcmVxdWlyZWQgbnVtYmVyIG9mIGJpdHMuXHJcblxyXG4gIC8vIEFmdGVyIGFkZGluZyB0aGUgdGVybWluYXRvciwgaWYgdGhlIG51bWJlciBvZiBiaXRzIGluIHRoZSBzdHJpbmcgaXMgbm90IGEgbXVsdGlwbGUgb2YgOCxcclxuICAvLyBwYWQgdGhlIHN0cmluZyBvbiB0aGUgcmlnaHQgd2l0aCAwcyB0byBtYWtlIHRoZSBzdHJpbmcncyBsZW5ndGggYSBtdWx0aXBsZSBvZiA4LlxyXG4gIHdoaWxlIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgJSA4ICE9PSAwKSB7XHJcbiAgICBidWZmZXIucHV0Qml0KDApXHJcbiAgfVxyXG5cclxuICAvLyBBZGQgcGFkIGJ5dGVzIGlmIHRoZSBzdHJpbmcgaXMgc3RpbGwgc2hvcnRlciB0aGFuIHRoZSB0b3RhbCBudW1iZXIgb2YgcmVxdWlyZWQgYml0cy5cclxuICAvLyBFeHRlbmQgdGhlIGJ1ZmZlciB0byBmaWxsIHRoZSBkYXRhIGNhcGFjaXR5IG9mIHRoZSBzeW1ib2wgY29ycmVzcG9uZGluZyB0b1xyXG4gIC8vIHRoZSBWZXJzaW9uIGFuZCBFcnJvciBDb3JyZWN0aW9uIExldmVsIGJ5IGFkZGluZyB0aGUgUGFkIENvZGV3b3JkcyAxMTEwMTEwMCAoMHhFQylcclxuICAvLyBhbmQgMDAwMTAwMDEgKDB4MTEpIGFsdGVybmF0ZWx5LlxyXG4gIGNvbnN0IHJlbWFpbmluZ0J5dGUgPSAoZGF0YVRvdGFsQ29kZXdvcmRzQml0cyAtIGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSkgLyA4XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByZW1haW5pbmdCeXRlOyBpKyspIHtcclxuICAgIGJ1ZmZlci5wdXQoaSAlIDIgPyAweDExIDogMHhFQywgOClcclxuICB9XHJcblxyXG4gIHJldHVybiBjcmVhdGVDb2Rld29yZHMoYnVmZmVyLCB2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcclxufVxyXG5cclxuLyoqXHJcbiAqIEVuY29kZSBpbnB1dCBkYXRhIHdpdGggUmVlZC1Tb2xvbW9uIGFuZCByZXR1cm4gY29kZXdvcmRzIHdpdGhcclxuICogcmVsYXRpdmUgZXJyb3IgY29ycmVjdGlvbiBiaXRzXHJcbiAqXHJcbiAqIEBwYXJhbSAge0JpdEJ1ZmZlcn0gYml0QnVmZmVyICAgICAgICAgICAgRGF0YSB0byBlbmNvZGVcclxuICogQHBhcmFtICB7TnVtYmVyfSAgICB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cclxuICogQHBhcmFtICB7RXJyb3JDb3JyZWN0aW9uTGV2ZWx9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcclxuICogQHJldHVybiB7VWludDhBcnJheX0gICAgICAgICAgICAgICAgICAgICBCdWZmZXIgY29udGFpbmluZyBlbmNvZGVkIGNvZGV3b3Jkc1xyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlQ29kZXdvcmRzIChiaXRCdWZmZXIsIHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgLy8gVG90YWwgY29kZXdvcmRzIGZvciB0aGlzIFFSIGNvZGUgdmVyc2lvbiAoRGF0YSArIEVycm9yIGNvcnJlY3Rpb24pXHJcbiAgY29uc3QgdG90YWxDb2Rld29yZHMgPSBVdGlscy5nZXRTeW1ib2xUb3RhbENvZGV3b3Jkcyh2ZXJzaW9uKVxyXG5cclxuICAvLyBUb3RhbCBudW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHNcclxuICBjb25zdCBlY1RvdGFsQ29kZXdvcmRzID0gRUNDb2RlLmdldFRvdGFsQ29kZXdvcmRzQ291bnQodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXHJcblxyXG4gIC8vIFRvdGFsIG51bWJlciBvZiBkYXRhIGNvZGV3b3Jkc1xyXG4gIGNvbnN0IGRhdGFUb3RhbENvZGV3b3JkcyA9IHRvdGFsQ29kZXdvcmRzIC0gZWNUb3RhbENvZGV3b3Jkc1xyXG5cclxuICAvLyBUb3RhbCBudW1iZXIgb2YgYmxvY2tzXHJcbiAgY29uc3QgZWNUb3RhbEJsb2NrcyA9IEVDQ29kZS5nZXRCbG9ja3NDb3VudCh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcclxuXHJcbiAgLy8gQ2FsY3VsYXRlIGhvdyBtYW55IGJsb2NrcyBlYWNoIGdyb3VwIHNob3VsZCBjb250YWluXHJcbiAgY29uc3QgYmxvY2tzSW5Hcm91cDIgPSB0b3RhbENvZGV3b3JkcyAlIGVjVG90YWxCbG9ja3NcclxuICBjb25zdCBibG9ja3NJbkdyb3VwMSA9IGVjVG90YWxCbG9ja3MgLSBibG9ja3NJbkdyb3VwMlxyXG5cclxuICBjb25zdCB0b3RhbENvZGV3b3Jkc0luR3JvdXAxID0gTWF0aC5mbG9vcih0b3RhbENvZGV3b3JkcyAvIGVjVG90YWxCbG9ja3MpXHJcblxyXG4gIGNvbnN0IGRhdGFDb2Rld29yZHNJbkdyb3VwMSA9IE1hdGguZmxvb3IoZGF0YVRvdGFsQ29kZXdvcmRzIC8gZWNUb3RhbEJsb2NrcylcclxuICBjb25zdCBkYXRhQ29kZXdvcmRzSW5Hcm91cDIgPSBkYXRhQ29kZXdvcmRzSW5Hcm91cDEgKyAxXHJcblxyXG4gIC8vIE51bWJlciBvZiBFQyBjb2Rld29yZHMgaXMgdGhlIHNhbWUgZm9yIGJvdGggZ3JvdXBzXHJcbiAgY29uc3QgZWNDb3VudCA9IHRvdGFsQ29kZXdvcmRzSW5Hcm91cDEgLSBkYXRhQ29kZXdvcmRzSW5Hcm91cDFcclxuXHJcbiAgLy8gSW5pdGlhbGl6ZSBhIFJlZWQtU29sb21vbiBlbmNvZGVyIHdpdGggYSBnZW5lcmF0b3IgcG9seW5vbWlhbCBvZiBkZWdyZWUgZWNDb3VudFxyXG4gIGNvbnN0IHJzID0gbmV3IFJlZWRTb2xvbW9uRW5jb2RlcihlY0NvdW50KVxyXG5cclxuICBsZXQgb2Zmc2V0ID0gMFxyXG4gIGNvbnN0IGRjRGF0YSA9IG5ldyBBcnJheShlY1RvdGFsQmxvY2tzKVxyXG4gIGNvbnN0IGVjRGF0YSA9IG5ldyBBcnJheShlY1RvdGFsQmxvY2tzKVxyXG4gIGxldCBtYXhEYXRhU2l6ZSA9IDBcclxuICBjb25zdCBidWZmZXIgPSBuZXcgVWludDhBcnJheShiaXRCdWZmZXIuYnVmZmVyKVxyXG5cclxuICAvLyBEaXZpZGUgdGhlIGJ1ZmZlciBpbnRvIHRoZSByZXF1aXJlZCBudW1iZXIgb2YgYmxvY2tzXHJcbiAgZm9yIChsZXQgYiA9IDA7IGIgPCBlY1RvdGFsQmxvY2tzOyBiKyspIHtcclxuICAgIGNvbnN0IGRhdGFTaXplID0gYiA8IGJsb2Nrc0luR3JvdXAxID8gZGF0YUNvZGV3b3Jkc0luR3JvdXAxIDogZGF0YUNvZGV3b3Jkc0luR3JvdXAyXHJcblxyXG4gICAgLy8gZXh0cmFjdCBhIGJsb2NrIG9mIGRhdGEgZnJvbSBidWZmZXJcclxuICAgIGRjRGF0YVtiXSA9IGJ1ZmZlci5zbGljZShvZmZzZXQsIG9mZnNldCArIGRhdGFTaXplKVxyXG5cclxuICAgIC8vIENhbGN1bGF0ZSBFQyBjb2Rld29yZHMgZm9yIHRoaXMgZGF0YSBibG9ja1xyXG4gICAgZWNEYXRhW2JdID0gcnMuZW5jb2RlKGRjRGF0YVtiXSlcclxuXHJcbiAgICBvZmZzZXQgKz0gZGF0YVNpemVcclxuICAgIG1heERhdGFTaXplID0gTWF0aC5tYXgobWF4RGF0YVNpemUsIGRhdGFTaXplKVxyXG4gIH1cclxuXHJcbiAgLy8gQ3JlYXRlIGZpbmFsIGRhdGFcclxuICAvLyBJbnRlcmxlYXZlIHRoZSBkYXRhIGFuZCBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3JkcyBmcm9tIGVhY2ggYmxvY2tcclxuICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkodG90YWxDb2Rld29yZHMpXHJcbiAgbGV0IGluZGV4ID0gMFxyXG4gIGxldCBpLCByXHJcblxyXG4gIC8vIEFkZCBkYXRhIGNvZGV3b3Jkc1xyXG4gIGZvciAoaSA9IDA7IGkgPCBtYXhEYXRhU2l6ZTsgaSsrKSB7XHJcbiAgICBmb3IgKHIgPSAwOyByIDwgZWNUb3RhbEJsb2NrczsgcisrKSB7XHJcbiAgICAgIGlmIChpIDwgZGNEYXRhW3JdLmxlbmd0aCkge1xyXG4gICAgICAgIGRhdGFbaW5kZXgrK10gPSBkY0RhdGFbcl1baV1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQXBwZWQgRUMgY29kZXdvcmRzXHJcbiAgZm9yIChpID0gMDsgaSA8IGVjQ291bnQ7IGkrKykge1xyXG4gICAgZm9yIChyID0gMDsgciA8IGVjVG90YWxCbG9ja3M7IHIrKykge1xyXG4gICAgICBkYXRhW2luZGV4KytdID0gZWNEYXRhW3JdW2ldXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZGF0YVxyXG59XHJcblxyXG4vKipcclxuICogQnVpbGQgUVIgQ29kZSBzeW1ib2xcclxuICpcclxuICogQHBhcmFtICB7U3RyaW5nfSBkYXRhICAgICAgICAgICAgICAgICBJbnB1dCBzdHJpbmdcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cclxuICogQHBhcmFtICB7RXJyb3JDb3JyZXRpb25MZXZlbH0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgbGV2ZWxcclxuICogQHBhcmFtICB7TWFza1BhdHRlcm59IG1hc2tQYXR0ZXJuICAgICBNYXNrIHBhdHRlcm5cclxuICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgICAgICAgICAgICBPYmplY3QgY29udGFpbmluZyBzeW1ib2wgZGF0YVxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlU3ltYm9sIChkYXRhLCB2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbWFza1BhdHRlcm4pIHtcclxuICBsZXQgc2VnbWVudHNcclxuXHJcbiAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcclxuICAgIHNlZ21lbnRzID0gU2VnbWVudHMuZnJvbUFycmF5KGRhdGEpXHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcclxuICAgIGxldCBlc3RpbWF0ZWRWZXJzaW9uID0gdmVyc2lvblxyXG5cclxuICAgIGlmICghZXN0aW1hdGVkVmVyc2lvbikge1xyXG4gICAgICBjb25zdCByYXdTZWdtZW50cyA9IFNlZ21lbnRzLnJhd1NwbGl0KGRhdGEpXHJcblxyXG4gICAgICAvLyBFc3RpbWF0ZSBiZXN0IHZlcnNpb24gdGhhdCBjYW4gY29udGFpbiByYXcgc3BsaXR0ZWQgc2VnbWVudHNcclxuICAgICAgZXN0aW1hdGVkVmVyc2lvbiA9IFZlcnNpb24uZ2V0QmVzdFZlcnNpb25Gb3JEYXRhKHJhd1NlZ21lbnRzLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcclxuICAgIH1cclxuXHJcbiAgICAvLyBCdWlsZCBvcHRpbWl6ZWQgc2VnbWVudHNcclxuICAgIC8vIElmIGVzdGltYXRlZCB2ZXJzaW9uIGlzIHVuZGVmaW5lZCwgdHJ5IHdpdGggdGhlIGhpZ2hlc3QgdmVyc2lvblxyXG4gICAgc2VnbWVudHMgPSBTZWdtZW50cy5mcm9tU3RyaW5nKGRhdGEsIGVzdGltYXRlZFZlcnNpb24gfHwgNDApXHJcbiAgfSBlbHNlIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBkYXRhJylcclxuICB9XHJcblxyXG4gIC8vIEdldCB0aGUgbWluIHZlcnNpb24gdGhhdCBjYW4gY29udGFpbiBkYXRhXHJcbiAgY29uc3QgYmVzdFZlcnNpb24gPSBWZXJzaW9uLmdldEJlc3RWZXJzaW9uRm9yRGF0YShzZWdtZW50cywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXHJcblxyXG4gIC8vIElmIG5vIHZlcnNpb24gaXMgZm91bmQsIGRhdGEgY2Fubm90IGJlIHN0b3JlZFxyXG4gIGlmICghYmVzdFZlcnNpb24pIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignVGhlIGFtb3VudCBvZiBkYXRhIGlzIHRvbyBiaWcgdG8gYmUgc3RvcmVkIGluIGEgUVIgQ29kZScpXHJcbiAgfVxyXG5cclxuICAvLyBJZiBub3Qgc3BlY2lmaWVkLCB1c2UgbWluIHZlcnNpb24gYXMgZGVmYXVsdFxyXG4gIGlmICghdmVyc2lvbikge1xyXG4gICAgdmVyc2lvbiA9IGJlc3RWZXJzaW9uXHJcblxyXG4gIC8vIENoZWNrIGlmIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBjYW4gY29udGFpbiB0aGUgZGF0YVxyXG4gIH0gZWxzZSBpZiAodmVyc2lvbiA8IGJlc3RWZXJzaW9uKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1xcbicgK1xyXG4gICAgICAnVGhlIGNob3NlbiBRUiBDb2RlIHZlcnNpb24gY2Fubm90IGNvbnRhaW4gdGhpcyBhbW91bnQgb2YgZGF0YS5cXG4nICtcclxuICAgICAgJ01pbmltdW0gdmVyc2lvbiByZXF1aXJlZCB0byBzdG9yZSBjdXJyZW50IGRhdGEgaXM6ICcgKyBiZXN0VmVyc2lvbiArICcuXFxuJ1xyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgY29uc3QgZGF0YUJpdHMgPSBjcmVhdGVEYXRhKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBzZWdtZW50cylcclxuXHJcbiAgLy8gQWxsb2NhdGUgbWF0cml4IGJ1ZmZlclxyXG4gIGNvbnN0IG1vZHVsZUNvdW50ID0gVXRpbHMuZ2V0U3ltYm9sU2l6ZSh2ZXJzaW9uKVxyXG4gIGNvbnN0IG1vZHVsZXMgPSBuZXcgQml0TWF0cml4KG1vZHVsZUNvdW50KVxyXG5cclxuICAvLyBBZGQgZnVuY3Rpb24gbW9kdWxlc1xyXG4gIHNldHVwRmluZGVyUGF0dGVybihtb2R1bGVzLCB2ZXJzaW9uKVxyXG4gIHNldHVwVGltaW5nUGF0dGVybihtb2R1bGVzKVxyXG4gIHNldHVwQWxpZ25tZW50UGF0dGVybihtb2R1bGVzLCB2ZXJzaW9uKVxyXG5cclxuICAvLyBBZGQgdGVtcG9yYXJ5IGR1bW15IGJpdHMgZm9yIGZvcm1hdCBpbmZvIGp1c3QgdG8gc2V0IHRoZW0gYXMgcmVzZXJ2ZWQuXHJcbiAgLy8gVGhpcyBpcyBuZWVkZWQgdG8gcHJldmVudCB0aGVzZSBiaXRzIGZyb20gYmVpbmcgbWFza2VkIGJ5IHtAbGluayBNYXNrUGF0dGVybi5hcHBseU1hc2t9XHJcbiAgLy8gc2luY2UgdGhlIG1hc2tpbmcgb3BlcmF0aW9uIG11c3QgYmUgcGVyZm9ybWVkIG9ubHkgb24gdGhlIGVuY29kaW5nIHJlZ2lvbi5cclxuICAvLyBUaGVzZSBibG9ja3Mgd2lsbCBiZSByZXBsYWNlZCB3aXRoIGNvcnJlY3QgdmFsdWVzIGxhdGVyIGluIGNvZGUuXHJcbiAgc2V0dXBGb3JtYXRJbmZvKG1vZHVsZXMsIGVycm9yQ29ycmVjdGlvbkxldmVsLCAwKVxyXG5cclxuICBpZiAodmVyc2lvbiA+PSA3KSB7XHJcbiAgICBzZXR1cFZlcnNpb25JbmZvKG1vZHVsZXMsIHZlcnNpb24pXHJcbiAgfVxyXG5cclxuICAvLyBBZGQgZGF0YSBjb2Rld29yZHNcclxuICBzZXR1cERhdGEobW9kdWxlcywgZGF0YUJpdHMpXHJcblxyXG4gIGlmIChpc05hTihtYXNrUGF0dGVybikpIHtcclxuICAgIC8vIEZpbmQgYmVzdCBtYXNrIHBhdHRlcm5cclxuICAgIG1hc2tQYXR0ZXJuID0gTWFza1BhdHRlcm4uZ2V0QmVzdE1hc2sobW9kdWxlcyxcclxuICAgICAgc2V0dXBGb3JtYXRJbmZvLmJpbmQobnVsbCwgbW9kdWxlcywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpKVxyXG4gIH1cclxuXHJcbiAgLy8gQXBwbHkgbWFzayBwYXR0ZXJuXHJcbiAgTWFza1BhdHRlcm4uYXBwbHlNYXNrKG1hc2tQYXR0ZXJuLCBtb2R1bGVzKVxyXG5cclxuICAvLyBSZXBsYWNlIGZvcm1hdCBpbmZvIGJpdHMgd2l0aCBjb3JyZWN0IHZhbHVlc1xyXG4gIHNldHVwRm9ybWF0SW5mbyhtb2R1bGVzLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbWFza1BhdHRlcm4pXHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBtb2R1bGVzOiBtb2R1bGVzLFxyXG4gICAgdmVyc2lvbjogdmVyc2lvbixcclxuICAgIGVycm9yQ29ycmVjdGlvbkxldmVsOiBlcnJvckNvcnJlY3Rpb25MZXZlbCxcclxuICAgIG1hc2tQYXR0ZXJuOiBtYXNrUGF0dGVybixcclxuICAgIHNlZ21lbnRzOiBzZWdtZW50c1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFFSIENvZGVcclxuICpcclxuICogQHBhcmFtIHtTdHJpbmcgfCBBcnJheX0gZGF0YSAgICAgICAgICAgICAgICAgSW5wdXQgZGF0YVxyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAgICAgICAgICAgICAgICAgICAgICBPcHRpb25hbCBjb25maWd1cmF0aW9uc1xyXG4gKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy52ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cclxuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMuZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25zLnRvU0pJU0Z1bmMgICAgICAgICBIZWxwZXIgZnVuYyB0byBjb252ZXJ0IHV0ZjggdG8gc2ppc1xyXG4gKi9cclxuZXhwb3J0cy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUgKGRhdGEsIG9wdGlvbnMpIHtcclxuICBpZiAodHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnIHx8IGRhdGEgPT09ICcnKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGlucHV0IHRleHQnKVxyXG4gIH1cclxuXHJcbiAgbGV0IGVycm9yQ29ycmVjdGlvbkxldmVsID0gRUNMZXZlbC5NXHJcbiAgbGV0IHZlcnNpb25cclxuICBsZXQgbWFza1xyXG5cclxuICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAvLyBVc2UgaGlnaGVyIGVycm9yIGNvcnJlY3Rpb24gbGV2ZWwgYXMgZGVmYXVsdFxyXG4gICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWwgPSBFQ0xldmVsLmZyb20ob3B0aW9ucy5lcnJvckNvcnJlY3Rpb25MZXZlbCwgRUNMZXZlbC5NKVxyXG4gICAgdmVyc2lvbiA9IFZlcnNpb24uZnJvbShvcHRpb25zLnZlcnNpb24pXHJcbiAgICBtYXNrID0gTWFza1BhdHRlcm4uZnJvbShvcHRpb25zLm1hc2tQYXR0ZXJuKVxyXG5cclxuICAgIGlmIChvcHRpb25zLnRvU0pJU0Z1bmMpIHtcclxuICAgICAgVXRpbHMuc2V0VG9TSklTRnVuY3Rpb24ob3B0aW9ucy50b1NKSVNGdW5jKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGNyZWF0ZVN5bWJvbChkYXRhLCB2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbWFzaylcclxufVxyXG4iLCJmdW5jdGlvbiBoZXgycmdiYSAoaGV4KSB7XHJcbiAgaWYgKHR5cGVvZiBoZXggPT09ICdudW1iZXInKSB7XHJcbiAgICBoZXggPSBoZXgudG9TdHJpbmcoKVxyXG4gIH1cclxuXHJcbiAgaWYgKHR5cGVvZiBoZXggIT09ICdzdHJpbmcnKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbG9yIHNob3VsZCBiZSBkZWZpbmVkIGFzIGhleCBzdHJpbmcnKVxyXG4gIH1cclxuXHJcbiAgbGV0IGhleENvZGUgPSBoZXguc2xpY2UoKS5yZXBsYWNlKCcjJywgJycpLnNwbGl0KCcnKVxyXG4gIGlmIChoZXhDb2RlLmxlbmd0aCA8IDMgfHwgaGV4Q29kZS5sZW5ndGggPT09IDUgfHwgaGV4Q29kZS5sZW5ndGggPiA4KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGV4IGNvbG9yOiAnICsgaGV4KVxyXG4gIH1cclxuXHJcbiAgLy8gQ29udmVydCBmcm9tIHNob3J0IHRvIGxvbmcgZm9ybSAoZmZmIC0+IGZmZmZmZilcclxuICBpZiAoaGV4Q29kZS5sZW5ndGggPT09IDMgfHwgaGV4Q29kZS5sZW5ndGggPT09IDQpIHtcclxuICAgIGhleENvZGUgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBoZXhDb2RlLm1hcChmdW5jdGlvbiAoYykge1xyXG4gICAgICByZXR1cm4gW2MsIGNdXHJcbiAgICB9KSlcclxuICB9XHJcblxyXG4gIC8vIEFkZCBkZWZhdWx0IGFscGhhIHZhbHVlXHJcbiAgaWYgKGhleENvZGUubGVuZ3RoID09PSA2KSBoZXhDb2RlLnB1c2goJ0YnLCAnRicpXHJcblxyXG4gIGNvbnN0IGhleFZhbHVlID0gcGFyc2VJbnQoaGV4Q29kZS5qb2luKCcnKSwgMTYpXHJcblxyXG4gIHJldHVybiB7XHJcbiAgICByOiAoaGV4VmFsdWUgPj4gMjQpICYgMjU1LFxyXG4gICAgZzogKGhleFZhbHVlID4+IDE2KSAmIDI1NSxcclxuICAgIGI6IChoZXhWYWx1ZSA+PiA4KSAmIDI1NSxcclxuICAgIGE6IGhleFZhbHVlICYgMjU1LFxyXG4gICAgaGV4OiAnIycgKyBoZXhDb2RlLnNsaWNlKDAsIDYpLmpvaW4oJycpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnRzLmdldE9wdGlvbnMgPSBmdW5jdGlvbiBnZXRPcHRpb25zIChvcHRpb25zKSB7XHJcbiAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge31cclxuICBpZiAoIW9wdGlvbnMuY29sb3IpIG9wdGlvbnMuY29sb3IgPSB7fVxyXG5cclxuICBjb25zdCBtYXJnaW4gPSB0eXBlb2Ygb3B0aW9ucy5tYXJnaW4gPT09ICd1bmRlZmluZWQnIHx8XHJcbiAgICBvcHRpb25zLm1hcmdpbiA9PT0gbnVsbCB8fFxyXG4gICAgb3B0aW9ucy5tYXJnaW4gPCAwXHJcbiAgICA/IDRcclxuICAgIDogb3B0aW9ucy5tYXJnaW5cclxuXHJcbiAgY29uc3Qgd2lkdGggPSBvcHRpb25zLndpZHRoICYmIG9wdGlvbnMud2lkdGggPj0gMjEgPyBvcHRpb25zLndpZHRoIDogdW5kZWZpbmVkXHJcbiAgY29uc3Qgc2NhbGUgPSBvcHRpb25zLnNjYWxlIHx8IDRcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHdpZHRoOiB3aWR0aCxcclxuICAgIHNjYWxlOiB3aWR0aCA/IDQgOiBzY2FsZSxcclxuICAgIG1hcmdpbjogbWFyZ2luLFxyXG4gICAgY29sb3I6IHtcclxuICAgICAgZGFyazogaGV4MnJnYmEob3B0aW9ucy5jb2xvci5kYXJrIHx8ICcjMDAwMDAwZmYnKSxcclxuICAgICAgbGlnaHQ6IGhleDJyZ2JhKG9wdGlvbnMuY29sb3IubGlnaHQgfHwgJyNmZmZmZmZmZicpXHJcbiAgICB9LFxyXG4gICAgdHlwZTogb3B0aW9ucy50eXBlLFxyXG4gICAgcmVuZGVyZXJPcHRzOiBvcHRpb25zLnJlbmRlcmVyT3B0cyB8fCB7fVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0cy5nZXRTY2FsZSA9IGZ1bmN0aW9uIGdldFNjYWxlIChxclNpemUsIG9wdHMpIHtcclxuICByZXR1cm4gb3B0cy53aWR0aCAmJiBvcHRzLndpZHRoID49IHFyU2l6ZSArIG9wdHMubWFyZ2luICogMlxyXG4gICAgPyBvcHRzLndpZHRoIC8gKHFyU2l6ZSArIG9wdHMubWFyZ2luICogMilcclxuICAgIDogb3B0cy5zY2FsZVxyXG59XHJcblxyXG5leHBvcnRzLmdldEltYWdlV2lkdGggPSBmdW5jdGlvbiBnZXRJbWFnZVdpZHRoIChxclNpemUsIG9wdHMpIHtcclxuICBjb25zdCBzY2FsZSA9IGV4cG9ydHMuZ2V0U2NhbGUocXJTaXplLCBvcHRzKVxyXG4gIHJldHVybiBNYXRoLmZsb29yKChxclNpemUgKyBvcHRzLm1hcmdpbiAqIDIpICogc2NhbGUpXHJcbn1cclxuXHJcbmV4cG9ydHMucXJUb0ltYWdlRGF0YSA9IGZ1bmN0aW9uIHFyVG9JbWFnZURhdGEgKGltZ0RhdGEsIHFyLCBvcHRzKSB7XHJcbiAgY29uc3Qgc2l6ZSA9IHFyLm1vZHVsZXMuc2l6ZVxyXG4gIGNvbnN0IGRhdGEgPSBxci5tb2R1bGVzLmRhdGFcclxuICBjb25zdCBzY2FsZSA9IGV4cG9ydHMuZ2V0U2NhbGUoc2l6ZSwgb3B0cylcclxuICBjb25zdCBzeW1ib2xTaXplID0gTWF0aC5mbG9vcigoc2l6ZSArIG9wdHMubWFyZ2luICogMikgKiBzY2FsZSlcclxuICBjb25zdCBzY2FsZWRNYXJnaW4gPSBvcHRzLm1hcmdpbiAqIHNjYWxlXHJcbiAgY29uc3QgcGFsZXR0ZSA9IFtvcHRzLmNvbG9yLmxpZ2h0LCBvcHRzLmNvbG9yLmRhcmtdXHJcblxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3ltYm9sU2l6ZTsgaSsrKSB7XHJcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHN5bWJvbFNpemU7IGorKykge1xyXG4gICAgICBsZXQgcG9zRHN0ID0gKGkgKiBzeW1ib2xTaXplICsgaikgKiA0XHJcbiAgICAgIGxldCBweENvbG9yID0gb3B0cy5jb2xvci5saWdodFxyXG5cclxuICAgICAgaWYgKGkgPj0gc2NhbGVkTWFyZ2luICYmIGogPj0gc2NhbGVkTWFyZ2luICYmXHJcbiAgICAgICAgaSA8IHN5bWJvbFNpemUgLSBzY2FsZWRNYXJnaW4gJiYgaiA8IHN5bWJvbFNpemUgLSBzY2FsZWRNYXJnaW4pIHtcclxuICAgICAgICBjb25zdCBpU3JjID0gTWF0aC5mbG9vcigoaSAtIHNjYWxlZE1hcmdpbikgLyBzY2FsZSlcclxuICAgICAgICBjb25zdCBqU3JjID0gTWF0aC5mbG9vcigoaiAtIHNjYWxlZE1hcmdpbikgLyBzY2FsZSlcclxuICAgICAgICBweENvbG9yID0gcGFsZXR0ZVtkYXRhW2lTcmMgKiBzaXplICsgalNyY10gPyAxIDogMF1cclxuICAgICAgfVxyXG5cclxuICAgICAgaW1nRGF0YVtwb3NEc3QrK10gPSBweENvbG9yLnJcclxuICAgICAgaW1nRGF0YVtwb3NEc3QrK10gPSBweENvbG9yLmdcclxuICAgICAgaW1nRGF0YVtwb3NEc3QrK10gPSBweENvbG9yLmJcclxuICAgICAgaW1nRGF0YVtwb3NEc3RdID0gcHhDb2xvci5hXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsImNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXHJcblxyXG5mdW5jdGlvbiBjbGVhckNhbnZhcyAoY3R4LCBjYW52YXMsIHNpemUpIHtcclxuICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodClcclxuXHJcbiAgaWYgKCFjYW52YXMuc3R5bGUpIGNhbnZhcy5zdHlsZSA9IHt9XHJcbiAgY2FudmFzLmhlaWdodCA9IHNpemVcclxuICBjYW52YXMud2lkdGggPSBzaXplXHJcbiAgY2FudmFzLnN0eWxlLmhlaWdodCA9IHNpemUgKyAncHgnXHJcbiAgY2FudmFzLnN0eWxlLndpZHRoID0gc2l6ZSArICdweCdcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2FudmFzRWxlbWVudCAoKSB7XHJcbiAgdHJ5IHtcclxuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignWW91IG5lZWQgdG8gc3BlY2lmeSBhIGNhbnZhcyBlbGVtZW50JylcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydHMucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyIChxckRhdGEsIGNhbnZhcywgb3B0aW9ucykge1xyXG4gIGxldCBvcHRzID0gb3B0aW9uc1xyXG4gIGxldCBjYW52YXNFbCA9IGNhbnZhc1xyXG5cclxuICBpZiAodHlwZW9mIG9wdHMgPT09ICd1bmRlZmluZWQnICYmICghY2FudmFzIHx8ICFjYW52YXMuZ2V0Q29udGV4dCkpIHtcclxuICAgIG9wdHMgPSBjYW52YXNcclxuICAgIGNhbnZhcyA9IHVuZGVmaW5lZFxyXG4gIH1cclxuXHJcbiAgaWYgKCFjYW52YXMpIHtcclxuICAgIGNhbnZhc0VsID0gZ2V0Q2FudmFzRWxlbWVudCgpXHJcbiAgfVxyXG5cclxuICBvcHRzID0gVXRpbHMuZ2V0T3B0aW9ucyhvcHRzKVxyXG4gIGNvbnN0IHNpemUgPSBVdGlscy5nZXRJbWFnZVdpZHRoKHFyRGF0YS5tb2R1bGVzLnNpemUsIG9wdHMpXHJcblxyXG4gIGNvbnN0IGN0eCA9IGNhbnZhc0VsLmdldENvbnRleHQoJzJkJylcclxuICBjb25zdCBpbWFnZSA9IGN0eC5jcmVhdGVJbWFnZURhdGEoc2l6ZSwgc2l6ZSlcclxuICBVdGlscy5xclRvSW1hZ2VEYXRhKGltYWdlLmRhdGEsIHFyRGF0YSwgb3B0cylcclxuXHJcbiAgY2xlYXJDYW52YXMoY3R4LCBjYW52YXNFbCwgc2l6ZSlcclxuICBjdHgucHV0SW1hZ2VEYXRhKGltYWdlLCAwLCAwKVxyXG5cclxuICByZXR1cm4gY2FudmFzRWxcclxufVxyXG5cclxuZXhwb3J0cy5yZW5kZXJUb0RhdGFVUkwgPSBmdW5jdGlvbiByZW5kZXJUb0RhdGFVUkwgKHFyRGF0YSwgY2FudmFzLCBvcHRpb25zKSB7XHJcbiAgbGV0IG9wdHMgPSBvcHRpb25zXHJcblxyXG4gIGlmICh0eXBlb2Ygb3B0cyA9PT0gJ3VuZGVmaW5lZCcgJiYgKCFjYW52YXMgfHwgIWNhbnZhcy5nZXRDb250ZXh0KSkge1xyXG4gICAgb3B0cyA9IGNhbnZhc1xyXG4gICAgY2FudmFzID0gdW5kZWZpbmVkXHJcbiAgfVxyXG5cclxuICBpZiAoIW9wdHMpIG9wdHMgPSB7fVxyXG5cclxuICBjb25zdCBjYW52YXNFbCA9IGV4cG9ydHMucmVuZGVyKHFyRGF0YSwgY2FudmFzLCBvcHRzKVxyXG5cclxuICBjb25zdCB0eXBlID0gb3B0cy50eXBlIHx8ICdpbWFnZS9wbmcnXHJcbiAgY29uc3QgcmVuZGVyZXJPcHRzID0gb3B0cy5yZW5kZXJlck9wdHMgfHwge31cclxuXHJcbiAgcmV0dXJuIGNhbnZhc0VsLnRvRGF0YVVSTCh0eXBlLCByZW5kZXJlck9wdHMucXVhbGl0eSlcclxufVxyXG4iLCJjb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5cclxuZnVuY3Rpb24gZ2V0Q29sb3JBdHRyaWIgKGNvbG9yLCBhdHRyaWIpIHtcclxuICBjb25zdCBhbHBoYSA9IGNvbG9yLmEgLyAyNTVcclxuICBjb25zdCBzdHIgPSBhdHRyaWIgKyAnPVwiJyArIGNvbG9yLmhleCArICdcIidcclxuXHJcbiAgcmV0dXJuIGFscGhhIDwgMVxyXG4gICAgPyBzdHIgKyAnICcgKyBhdHRyaWIgKyAnLW9wYWNpdHk9XCInICsgYWxwaGEudG9GaXhlZCgyKS5zbGljZSgxKSArICdcIidcclxuICAgIDogc3RyXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN2Z0NtZCAoY21kLCB4LCB5KSB7XHJcbiAgbGV0IHN0ciA9IGNtZCArIHhcclxuICBpZiAodHlwZW9mIHkgIT09ICd1bmRlZmluZWQnKSBzdHIgKz0gJyAnICsgeVxyXG5cclxuICByZXR1cm4gc3RyXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHFyVG9QYXRoIChkYXRhLCBzaXplLCBtYXJnaW4pIHtcclxuICBsZXQgcGF0aCA9ICcnXHJcbiAgbGV0IG1vdmVCeSA9IDBcclxuICBsZXQgbmV3Um93ID0gZmFsc2VcclxuICBsZXQgbGluZUxlbmd0aCA9IDBcclxuXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjb25zdCBjb2wgPSBNYXRoLmZsb29yKGkgJSBzaXplKVxyXG4gICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcihpIC8gc2l6ZSlcclxuXHJcbiAgICBpZiAoIWNvbCAmJiAhbmV3Um93KSBuZXdSb3cgPSB0cnVlXHJcblxyXG4gICAgaWYgKGRhdGFbaV0pIHtcclxuICAgICAgbGluZUxlbmd0aCsrXHJcblxyXG4gICAgICBpZiAoIShpID4gMCAmJiBjb2wgPiAwICYmIGRhdGFbaSAtIDFdKSkge1xyXG4gICAgICAgIHBhdGggKz0gbmV3Um93XHJcbiAgICAgICAgICA/IHN2Z0NtZCgnTScsIGNvbCArIG1hcmdpbiwgMC41ICsgcm93ICsgbWFyZ2luKVxyXG4gICAgICAgICAgOiBzdmdDbWQoJ20nLCBtb3ZlQnksIDApXHJcblxyXG4gICAgICAgIG1vdmVCeSA9IDBcclxuICAgICAgICBuZXdSb3cgPSBmYWxzZVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIShjb2wgKyAxIDwgc2l6ZSAmJiBkYXRhW2kgKyAxXSkpIHtcclxuICAgICAgICBwYXRoICs9IHN2Z0NtZCgnaCcsIGxpbmVMZW5ndGgpXHJcbiAgICAgICAgbGluZUxlbmd0aCA9IDBcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbW92ZUJ5KytcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBwYXRoXHJcbn1cclxuXHJcbmV4cG9ydHMucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyIChxckRhdGEsIG9wdGlvbnMsIGNiKSB7XHJcbiAgY29uc3Qgb3B0cyA9IFV0aWxzLmdldE9wdGlvbnMob3B0aW9ucylcclxuICBjb25zdCBzaXplID0gcXJEYXRhLm1vZHVsZXMuc2l6ZVxyXG4gIGNvbnN0IGRhdGEgPSBxckRhdGEubW9kdWxlcy5kYXRhXHJcbiAgY29uc3QgcXJjb2Rlc2l6ZSA9IHNpemUgKyBvcHRzLm1hcmdpbiAqIDJcclxuXHJcbiAgY29uc3QgYmcgPSAhb3B0cy5jb2xvci5saWdodC5hXHJcbiAgICA/ICcnXHJcbiAgICA6ICc8cGF0aCAnICsgZ2V0Q29sb3JBdHRyaWIob3B0cy5jb2xvci5saWdodCwgJ2ZpbGwnKSArXHJcbiAgICAgICcgZD1cIk0wIDBoJyArIHFyY29kZXNpemUgKyAndicgKyBxcmNvZGVzaXplICsgJ0gwelwiLz4nXHJcblxyXG4gIGNvbnN0IHBhdGggPVxyXG4gICAgJzxwYXRoICcgKyBnZXRDb2xvckF0dHJpYihvcHRzLmNvbG9yLmRhcmssICdzdHJva2UnKSArXHJcbiAgICAnIGQ9XCInICsgcXJUb1BhdGgoZGF0YSwgc2l6ZSwgb3B0cy5tYXJnaW4pICsgJ1wiLz4nXHJcblxyXG4gIGNvbnN0IHZpZXdCb3ggPSAndmlld0JveD1cIicgKyAnMCAwICcgKyBxcmNvZGVzaXplICsgJyAnICsgcXJjb2Rlc2l6ZSArICdcIidcclxuXHJcbiAgY29uc3Qgd2lkdGggPSAhb3B0cy53aWR0aCA/ICcnIDogJ3dpZHRoPVwiJyArIG9wdHMud2lkdGggKyAnXCIgaGVpZ2h0PVwiJyArIG9wdHMud2lkdGggKyAnXCIgJ1xyXG5cclxuICBjb25zdCBzdmdUYWcgPSAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgJyArIHdpZHRoICsgdmlld0JveCArICcgc2hhcGUtcmVuZGVyaW5nPVwiY3Jpc3BFZGdlc1wiPicgKyBiZyArIHBhdGggKyAnPC9zdmc+XFxuJ1xyXG5cclxuICBpZiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICBjYihudWxsLCBzdmdUYWcpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gc3ZnVGFnXHJcbn1cclxuIiwiXHJcbmNvbnN0IGNhblByb21pc2UgPSByZXF1aXJlKCcuL2Nhbi1wcm9taXNlJylcclxuXHJcbmNvbnN0IFFSQ29kZSA9IHJlcXVpcmUoJy4vY29yZS9xcmNvZGUnKVxyXG5jb25zdCBDYW52YXNSZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXIvY2FudmFzJylcclxuY29uc3QgU3ZnUmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcmVyL3N2Zy10YWcuanMnKVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyQ2FudmFzIChyZW5kZXJGdW5jLCBjYW52YXMsIHRleHQsIG9wdHMsIGNiKSB7XHJcbiAgY29uc3QgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxyXG4gIGNvbnN0IGFyZ3NOdW0gPSBhcmdzLmxlbmd0aFxyXG4gIGNvbnN0IGlzTGFzdEFyZ0NiID0gdHlwZW9mIGFyZ3NbYXJnc051bSAtIDFdID09PSAnZnVuY3Rpb24nXHJcblxyXG4gIGlmICghaXNMYXN0QXJnQ2IgJiYgIWNhblByb21pc2UoKSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYWxsYmFjayByZXF1aXJlZCBhcyBsYXN0IGFyZ3VtZW50JylcclxuICB9XHJcblxyXG4gIGlmIChpc0xhc3RBcmdDYikge1xyXG4gICAgaWYgKGFyZ3NOdW0gPCAyKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVG9vIGZldyBhcmd1bWVudHMgcHJvdmlkZWQnKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhcmdzTnVtID09PSAyKSB7XHJcbiAgICAgIGNiID0gdGV4dFxyXG4gICAgICB0ZXh0ID0gY2FudmFzXHJcbiAgICAgIGNhbnZhcyA9IG9wdHMgPSB1bmRlZmluZWRcclxuICAgIH0gZWxzZSBpZiAoYXJnc051bSA9PT0gMykge1xyXG4gICAgICBpZiAoY2FudmFzLmdldENvbnRleHQgJiYgdHlwZW9mIGNiID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIGNiID0gb3B0c1xyXG4gICAgICAgIG9wdHMgPSB1bmRlZmluZWRcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjYiA9IG9wdHNcclxuICAgICAgICBvcHRzID0gdGV4dFxyXG4gICAgICAgIHRleHQgPSBjYW52YXNcclxuICAgICAgICBjYW52YXMgPSB1bmRlZmluZWRcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBpZiAoYXJnc051bSA8IDEpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUb28gZmV3IGFyZ3VtZW50cyBwcm92aWRlZCcpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFyZ3NOdW0gPT09IDEpIHtcclxuICAgICAgdGV4dCA9IGNhbnZhc1xyXG4gICAgICBjYW52YXMgPSBvcHRzID0gdW5kZWZpbmVkXHJcbiAgICB9IGVsc2UgaWYgKGFyZ3NOdW0gPT09IDIgJiYgIWNhbnZhcy5nZXRDb250ZXh0KSB7XHJcbiAgICAgIG9wdHMgPSB0ZXh0XHJcbiAgICAgIHRleHQgPSBjYW52YXNcclxuICAgICAgY2FudmFzID0gdW5kZWZpbmVkXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBkYXRhID0gUVJDb2RlLmNyZWF0ZSh0ZXh0LCBvcHRzKVxyXG4gICAgICAgIHJlc29sdmUocmVuZGVyRnVuYyhkYXRhLCBjYW52YXMsIG9wdHMpKVxyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgcmVqZWN0KGUpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgZGF0YSA9IFFSQ29kZS5jcmVhdGUodGV4dCwgb3B0cylcclxuICAgIGNiKG51bGwsIHJlbmRlckZ1bmMoZGF0YSwgY2FudmFzLCBvcHRzKSlcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjYihlKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0cy5jcmVhdGUgPSBRUkNvZGUuY3JlYXRlXHJcbmV4cG9ydHMudG9DYW52YXMgPSByZW5kZXJDYW52YXMuYmluZChudWxsLCBDYW52YXNSZW5kZXJlci5yZW5kZXIpXHJcbmV4cG9ydHMudG9EYXRhVVJMID0gcmVuZGVyQ2FudmFzLmJpbmQobnVsbCwgQ2FudmFzUmVuZGVyZXIucmVuZGVyVG9EYXRhVVJMKVxyXG5cclxuLy8gb25seSBzdmcgZm9yIG5vdy5cclxuZXhwb3J0cy50b1N0cmluZyA9IHJlbmRlckNhbnZhcy5iaW5kKG51bGwsIGZ1bmN0aW9uIChkYXRhLCBfLCBvcHRzKSB7XHJcbiAgcmV0dXJuIFN2Z1JlbmRlcmVyLnJlbmRlcihkYXRhLCBvcHRzKVxyXG59KVxyXG4iLCIvKipcclxuICogY29yZS9lcmMyMC5qc1xyXG4gKlxyXG4gKiBFUkMtMjAgdG9rZW4gY29udHJhY3QgaW50ZXJmYWNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgZXRoZXJzIH0gZnJvbSAnZXRoZXJzJztcclxuaW1wb3J0IHsgZ2V0UHJvdmlkZXIgfSBmcm9tICcuL3JwYy5qcyc7XHJcblxyXG4vLyBTdGFuZGFyZCBFUkMtMjAgQUJJIChtaW5pbWFsIGludGVyZmFjZSB3ZSBuZWVkKVxyXG5jb25zdCBFUkMyMF9BQkkgPSBbXHJcbiAgLy8gUmVhZCBmdW5jdGlvbnNcclxuICAnZnVuY3Rpb24gbmFtZSgpIHZpZXcgcmV0dXJucyAoc3RyaW5nKScsXHJcbiAgJ2Z1bmN0aW9uIHN5bWJvbCgpIHZpZXcgcmV0dXJucyAoc3RyaW5nKScsXHJcbiAgJ2Z1bmN0aW9uIGRlY2ltYWxzKCkgdmlldyByZXR1cm5zICh1aW50OCknLFxyXG4gICdmdW5jdGlvbiB0b3RhbFN1cHBseSgpIHZpZXcgcmV0dXJucyAodWludDI1NiknLFxyXG4gICdmdW5jdGlvbiBiYWxhbmNlT2YoYWRkcmVzcyBhY2NvdW50KSB2aWV3IHJldHVybnMgKHVpbnQyNTYpJyxcclxuXHJcbiAgLy8gV3JpdGUgZnVuY3Rpb25zXHJcbiAgJ2Z1bmN0aW9uIHRyYW5zZmVyKGFkZHJlc3MgdG8sIHVpbnQyNTYgYW1vdW50KSByZXR1cm5zIChib29sKScsXHJcbiAgJ2Z1bmN0aW9uIGFwcHJvdmUoYWRkcmVzcyBzcGVuZGVyLCB1aW50MjU2IGFtb3VudCkgcmV0dXJucyAoYm9vbCknLFxyXG4gICdmdW5jdGlvbiBhbGxvd2FuY2UoYWRkcmVzcyBvd25lciwgYWRkcmVzcyBzcGVuZGVyKSB2aWV3IHJldHVybnMgKHVpbnQyNTYpJyxcclxuICAnZnVuY3Rpb24gdHJhbnNmZXJGcm9tKGFkZHJlc3MgZnJvbSwgYWRkcmVzcyB0bywgdWludDI1NiBhbW91bnQpIHJldHVybnMgKGJvb2wpJyxcclxuXHJcbiAgLy8gRXZlbnRzXHJcbiAgJ2V2ZW50IFRyYW5zZmVyKGFkZHJlc3MgaW5kZXhlZCBmcm9tLCBhZGRyZXNzIGluZGV4ZWQgdG8sIHVpbnQyNTYgdmFsdWUpJyxcclxuICAnZXZlbnQgQXBwcm92YWwoYWRkcmVzcyBpbmRleGVkIG93bmVyLCBhZGRyZXNzIGluZGV4ZWQgc3BlbmRlciwgdWludDI1NiB2YWx1ZSknXHJcbl07XHJcblxyXG4vKipcclxuICogR2V0cyBhbiBFUkMtMjAgY29udHJhY3QgaW5zdGFuY2VcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5BZGRyZXNzIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzc1xyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxldGhlcnMuQ29udHJhY3Q+fSBDb250cmFjdCBpbnN0YW5jZVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRva2VuQ29udHJhY3QobmV0d29yaywgdG9rZW5BZGRyZXNzKSB7XHJcbiAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBnZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICByZXR1cm4gbmV3IGV0aGVycy5Db250cmFjdCh0b2tlbkFkZHJlc3MsIEVSQzIwX0FCSSwgcHJvdmlkZXIpO1xyXG59XHJcblxyXG4vKipcclxuICogRmV0Y2hlcyB0b2tlbiBtZXRhZGF0YSAobmFtZSwgc3ltYm9sLCBkZWNpbWFscylcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5BZGRyZXNzIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzc1xyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx7bmFtZTogc3RyaW5nLCBzeW1ib2w6IHN0cmluZywgZGVjaW1hbHM6IG51bWJlcn0+fVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRva2VuTWV0YWRhdGEobmV0d29yaywgdG9rZW5BZGRyZXNzKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGNvbnRyYWN0ID0gYXdhaXQgZ2V0VG9rZW5Db250cmFjdChuZXR3b3JrLCB0b2tlbkFkZHJlc3MpO1xyXG5cclxuICAgIGNvbnN0IFtuYW1lLCBzeW1ib2wsIGRlY2ltYWxzXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgY29udHJhY3QubmFtZSgpLFxyXG4gICAgICBjb250cmFjdC5zeW1ib2woKSxcclxuICAgICAgY29udHJhY3QuZGVjaW1hbHMoKVxyXG4gICAgXSk7XHJcblxyXG4gICAgcmV0dXJuIHsgbmFtZSwgc3ltYm9sLCBkZWNpbWFsczogTnVtYmVyKGRlY2ltYWxzKSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBmZXRjaCB0b2tlbiBtZXRhZGF0YTogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgdG9rZW4gYmFsYW5jZSBmb3IgYW4gYWRkcmVzc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlbkFkZHJlc3MgLSBUb2tlbiBjb250cmFjdCBhZGRyZXNzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhY2NvdW50QWRkcmVzcyAtIEFjY291bnQgYWRkcmVzcyB0byBjaGVja1xyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBCYWxhbmNlIGluIHdlaSAoYXMgc3RyaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRva2VuQmFsYW5jZShuZXR3b3JrLCB0b2tlbkFkZHJlc3MsIGFjY291bnRBZGRyZXNzKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGNvbnRyYWN0ID0gYXdhaXQgZ2V0VG9rZW5Db250cmFjdChuZXR3b3JrLCB0b2tlbkFkZHJlc3MpO1xyXG4gICAgY29uc3QgYmFsYW5jZSA9IGF3YWl0IGNvbnRyYWN0LmJhbGFuY2VPZihhY2NvdW50QWRkcmVzcyk7XHJcbiAgICByZXR1cm4gYmFsYW5jZS50b1N0cmluZygpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBnZXQgdG9rZW4gYmFsYW5jZTogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdHMgdG9rZW4gYmFsYW5jZSBmcm9tIHdlaSB0byBodW1hbi1yZWFkYWJsZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFsYW5jZVdlaSAtIEJhbGFuY2UgaW4gd2VpXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWNpbWFscyAtIFRva2VuIGRlY2ltYWxzXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXNwbGF5RGVjaW1hbHMgLSBOdW1iZXIgb2YgZGVjaW1hbHMgdG8gZGlzcGxheSAoZGVmYXVsdCA0KVxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBGb3JtYXR0ZWQgYmFsYW5jZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFRva2VuQmFsYW5jZShiYWxhbmNlV2VpLCBkZWNpbWFscywgZGlzcGxheURlY2ltYWxzID0gNCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBiYWxhbmNlID0gZXRoZXJzLmZvcm1hdFVuaXRzKGJhbGFuY2VXZWksIGRlY2ltYWxzKTtcclxuICAgIGNvbnN0IG51bSA9IHBhcnNlRmxvYXQoYmFsYW5jZSk7XHJcbiAgICByZXR1cm4gbnVtLnRvRml4ZWQoZGlzcGxheURlY2ltYWxzKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmV0dXJuICcwLjAwMDAnO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFBhcnNlcyBodW1hbi1yZWFkYWJsZSBhbW91bnQgdG8gd2VpXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhbW91bnQgLSBIdW1hbi1yZWFkYWJsZSBhbW91bnRcclxuICogQHBhcmFtIHtudW1iZXJ9IGRlY2ltYWxzIC0gVG9rZW4gZGVjaW1hbHNcclxuICogQHJldHVybnMge3N0cmluZ30gQW1vdW50IGluIHdlaVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVG9rZW5BbW91bnQoYW1vdW50LCBkZWNpbWFscykge1xyXG4gIHJldHVybiBldGhlcnMucGFyc2VVbml0cyhhbW91bnQsIGRlY2ltYWxzKS50b1N0cmluZygpO1xyXG59XHJcblxyXG4vKipcclxuICogVHJhbnNmZXJzIHRva2Vuc1xyXG4gKiBAcGFyYW0ge2V0aGVycy5XYWxsZXR9IHNpZ25lciAtIFdhbGxldCBzaWduZXJcclxuICogQHBhcmFtIHtzdHJpbmd9IHRva2VuQWRkcmVzcyAtIFRva2VuIGNvbnRyYWN0IGFkZHJlc3NcclxuICogQHBhcmFtIHtzdHJpbmd9IHRvQWRkcmVzcyAtIFJlY2lwaWVudCBhZGRyZXNzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhbW91bnQgLSBBbW91bnQgaW4gd2VpIChhcyBzdHJpbmcpXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPGV0aGVycy5UcmFuc2FjdGlvblJlc3BvbnNlPn0gVHJhbnNhY3Rpb24gcmVzcG9uc2VcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0cmFuc2ZlclRva2VuKHNpZ25lciwgdG9rZW5BZGRyZXNzLCB0b0FkZHJlc3MsIGFtb3VudCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBjb250cmFjdCA9IG5ldyBldGhlcnMuQ29udHJhY3QodG9rZW5BZGRyZXNzLCBFUkMyMF9BQkksIHNpZ25lcik7XHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IGNvbnRyYWN0LnRyYW5zZmVyKHRvQWRkcmVzcywgYW1vdW50KTtcclxuICAgIHJldHVybiB0eDtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gdHJhbnNmZXIgdG9rZW46ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgaWYgYW4gYWRkcmVzcyBpcyBhIHZhbGlkIEVSQy0yMCB0b2tlbiBjb250cmFjdFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlbkFkZHJlc3MgLSBUb2tlbiBjb250cmFjdCBhZGRyZXNzXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fSBUcnVlIGlmIHZhbGlkIEVSQy0yMCBjb250cmFjdFxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlVG9rZW5Db250cmFjdChuZXR3b3JrLCB0b2tlbkFkZHJlc3MpIHtcclxuICB0cnkge1xyXG4gICAgLy8gQ2hlY2sgaWYgYWRkcmVzcyBpcyB2YWxpZFxyXG4gICAgaWYgKCFldGhlcnMuaXNBZGRyZXNzKHRva2VuQWRkcmVzcykpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRyeSB0byBmZXRjaCBiYXNpYyBtZXRhZGF0YVxyXG4gICAgYXdhaXQgZ2V0VG9rZW5NZXRhZGF0YShuZXR3b3JrLCB0b2tlbkFkZHJlc3MpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqIGNvcmUvdG9rZW5zLmpzXHJcbiAqXHJcbiAqIFRva2VuIG1hbmFnZW1lbnQgYW5kIHN0b3JhZ2VcclxuICovXHJcblxyXG5pbXBvcnQgeyBsb2FkLCBzYXZlIH0gZnJvbSAnLi9zdG9yYWdlLmpzJztcclxuaW1wb3J0IHsgZ2V0VG9rZW5NZXRhZGF0YSwgdmFsaWRhdGVUb2tlbkNvbnRyYWN0IH0gZnJvbSAnLi9lcmMyMC5qcyc7XHJcblxyXG4vLyBNYXhpbXVtIGN1c3RvbSB0b2tlbnMgcGVyIG5ldHdvcmtcclxuY29uc3QgTUFYX1RPS0VOU19QRVJfTkVUV09SSyA9IDIwO1xyXG5cclxuLy8gRGVmYXVsdC9wcmVzZXQgdG9rZW5zIChjYW4gYmUgZWFzaWx5IGFkZGVkL3JlbW92ZWQgYnkgdXNlcilcclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfVE9LRU5TID0ge1xyXG4gIHB1bHNlY2hhaW46IHtcclxuICAgICdIRVgnOiB7XHJcbiAgICAgIG5hbWU6ICdIRVgnLFxyXG4gICAgICBzeW1ib2w6ICdIRVgnLFxyXG4gICAgICBhZGRyZXNzOiAnMHgyYjU5MWU5OWFmZTlmMzJlYWE2MjE0ZjdiNzYyOTc2OGM0MGVlYjM5JyxcclxuICAgICAgZGVjaW1hbHM6IDgsXHJcbiAgICAgIGxvZ286ICdoZXgucG5nJyxcclxuICAgICAgaG9tZVVybDogJ2h0dHBzOi8vaGV4LmNvbScsXHJcbiAgICAgIGRleFNjcmVlbmVyVXJsOiAnaHR0cHM6Ly9kZXhzY3JlZW5lci5jb20vcHVsc2VjaGFpbi8weGYxZjRlZTYxMGIyYmFiYjA1YzYzNWY3MjZlZjhiMGM1NjhjOGRjNjUnXHJcbiAgICB9LFxyXG4gICAgJ1BMU1gnOiB7XHJcbiAgICAgIG5hbWU6ICdQdWxzZVgnLFxyXG4gICAgICBzeW1ib2w6ICdQTFNYJyxcclxuICAgICAgYWRkcmVzczogJzB4OTVCMzAzOTg3QTYwQzcxNTA0RDk5QWExYjEzQjREQTA3YjA3OTBhYicsXHJcbiAgICAgIGRlY2ltYWxzOiAxOCxcclxuICAgICAgbG9nbzogJ3Bsc3gucG5nJyxcclxuICAgICAgaG9tZVVybDogJ2h0dHBzOi8vcHVsc2V4LmNvbScsXHJcbiAgICAgIGRleFNjcmVlbmVyVXJsOiAnaHR0cHM6Ly9kZXhzY3JlZW5lci5jb20vcHVsc2VjaGFpbi8weDFiNDViOTE0ODc5MWQzYTEwNDE4NGNkNWRmZTVjZTU3MTkzYTNlZTknXHJcbiAgICB9LFxyXG4gICAgJ0lOQyc6IHtcclxuICAgICAgbmFtZTogJ0luY2VudGl2ZScsXHJcbiAgICAgIHN5bWJvbDogJ0lOQycsXHJcbiAgICAgIGFkZHJlc3M6ICcweDJmYTg3OEFiM0Y4N0NDMUM5NzM3RmMwNzExMDhGOTA0YzBCMEM5NWQnLFxyXG4gICAgICBkZWNpbWFsczogMTgsXHJcbiAgICAgIGxvZ286ICdpbmMuc3ZnJyxcclxuICAgICAgaG9tZVVybDogJ2h0dHBzOi8vaW5jZW50aXZldG9rZW4uaW8nLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL3B1bHNlY2hhaW4vMHhmODA4YmI2MjY1ZTljYTI3MDAyYzBhMDQ1NjJiZjUwZDRmZTM3ZWFhJ1xyXG4gICAgfSxcclxuICAgICdTYXZhbnQnOiB7XHJcbiAgICAgIG5hbWU6ICdTYXZhbnQnLFxyXG4gICAgICBzeW1ib2w6ICdTYXZhbnQnLFxyXG4gICAgICBhZGRyZXNzOiAnMHhmMTZlMTdlNGEwMWJmOTlCMEEwM0ZkM0FiNjk3YkM4NzkwNmUxODA5JyxcclxuICAgICAgZGVjaW1hbHM6IDE4LFxyXG4gICAgICBsb2dvOiAnc2F2YW50LTE5Mi5wbmcnLFxyXG4gICAgICBob21lVXJsOiAnaHR0cHM6Ly91c2NndmV0LmdpdGh1Yi5pby9TYXZhbnQvdHJhZGUuaHRtbCcsXHJcbiAgICAgIGRleFNjcmVlbmVyVXJsOiAnaHR0cHM6Ly9kZXhzY3JlZW5lci5jb20vcHVsc2VjaGFpbi8weGFhYTg4OTQ1ODRhYWYwMDkyMzcyZjBjNzUzNzY5YTUwZjYwNjA3NDInXHJcbiAgICB9LFxyXG4gICAgJ0hYUic6IHtcclxuICAgICAgbmFtZTogJ0hleFJld2FyZHMnLFxyXG4gICAgICBzeW1ib2w6ICdIWFInLFxyXG4gICAgICBhZGRyZXNzOiAnMHhDZkNiODlmMDA1NzZBNzc1ZDlmODE5NjFBMzdiYTdEQ2YxMkM3ZDlCJyxcclxuICAgICAgZGVjaW1hbHM6IDE4LFxyXG4gICAgICBsb2dvOiAnaGV4cmV3YXJkcy0xMDAwLnBuZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL3VzY2d2ZXQuZ2l0aHViLmlvL0hleFJld2FyZHMvJyxcclxuICAgICAgZGV4U2NyZWVuZXJVcmw6ICdodHRwczovL2RleHNjcmVlbmVyLmNvbS9wdWxzZWNoYWluLzB4ZDVhOGRlMDMzYzg2OTdjZWFhODQ0Y2E1OTZjYzc1ODNjNGY4ZjYxMidcclxuICAgIH0sXHJcbiAgICAnVEtSJzoge1xyXG4gICAgICBuYW1lOiAnVGFrZXInLFxyXG4gICAgICBzeW1ib2w6ICdUS1InLFxyXG4gICAgICBhZGRyZXNzOiAnMHhkOWU1OTAyMDA4OTkxNkE4RWZBN0RkMEI2MDVkNTUyMTlENzJkQjdCJyxcclxuICAgICAgZGVjaW1hbHM6IDE4LFxyXG4gICAgICBsb2dvOiAndGtyLnN2ZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL3VzY2d2ZXQuZ2l0aHViLmlvL2pkYWktZGFwcC8nLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL3B1bHNlY2hhaW4vMHgyMDVjNmQ0NGQ4NGU4MjYwNmU0ZTkyMWY4N2I1MWI3MWJhODVmMGYwJ1xyXG4gICAgfSxcclxuICAgICdKREFJJzoge1xyXG4gICAgICBuYW1lOiAnSkRBSSBVbnN0YWJsZWNvaW4nLFxyXG4gICAgICBzeW1ib2w6ICdKREFJJyxcclxuICAgICAgYWRkcmVzczogJzB4MTYxMEU3NUM5YjQ4QkY1NTAxMzc4MjA0NTJkRTQwNDliQjIyYkI3MicsXHJcbiAgICAgIGRlY2ltYWxzOiAxOCxcclxuICAgICAgbG9nbzogJ2pkYWkuc3ZnJyxcclxuICAgICAgaG9tZVVybDogJ2h0dHBzOi8vdXNjZ3ZldC5naXRodWIuaW8vamRhaS1kYXBwLycsXHJcbiAgICAgIGRleFNjcmVlbmVyVXJsOiAnaHR0cHM6Ly9kZXhzY3JlZW5lci5jb20vcHVsc2VjaGFpbi8weDcwNjU4Q2U2RDZDMDlhY2RFNjQ2RjZlYTlDNTdCYTY0ZjREYzM1MGYnXHJcbiAgICB9LFxyXG4gICAgJ1JpY2t5Jzoge1xyXG4gICAgICBuYW1lOiAnUmlja3knLFxyXG4gICAgICBzeW1ib2w6ICdSaWNreScsXHJcbiAgICAgIGFkZHJlc3M6ICcweDc5RkMwRTFkM0VDMDBkODFFNTQyM0RjQzAxQTYxN2IwZTEyNDVjMkInLFxyXG4gICAgICBkZWNpbWFsczogMTgsXHJcbiAgICAgIGxvZ286ICdyaWNreS5qcGcnLFxyXG4gICAgICBob21lVXJsOiAnaHR0cHM6Ly90cnV0aGJlaGluZHJpY2hhcmRoZWFydC5jb20vJyxcclxuICAgICAgZGV4U2NyZWVuZXJVcmw6ICdodHRwczovL2RleHNjcmVlbmVyLmNvbS9wdWxzZWNoYWluLzB4YmZlNWFlNDBiYmNhNzQ4Nzg0MTlhZDdkN2UxMTVhMzBjY2ZjNjJmMSdcclxuICAgIH1cclxuICB9LFxyXG4gIHB1bHNlY2hhaW5UZXN0bmV0OiB7XHJcbiAgICAnSEVBUlQnOiB7XHJcbiAgICAgIG5hbWU6ICdIZWFydFRva2VuJyxcclxuICAgICAgc3ltYm9sOiAnSEVBUlQnLFxyXG4gICAgICBhZGRyZXNzOiAnMHg3MzU3NDJEOGU1RmEzNWMxNjVkZWVlZDQ1NjBEZDkxQTE1QkExYUIyJyxcclxuICAgICAgZGVjaW1hbHM6IDE4LFxyXG4gICAgICBsb2dvOiAnaGVhcnQucG5nJ1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgZXRoZXJldW06IHtcclxuICAgICdIRVgnOiB7XHJcbiAgICAgIG5hbWU6ICdIRVgnLFxyXG4gICAgICBzeW1ib2w6ICdIRVgnLFxyXG4gICAgICBhZGRyZXNzOiAnMHgyYjU5MWU5OWFmZTlmMzJlYWE2MjE0ZjdiNzYyOTc2OGM0MGVlYjM5JyxcclxuICAgICAgZGVjaW1hbHM6IDgsXHJcbiAgICAgIGxvZ286ICdoZXgucG5nJyxcclxuICAgICAgaG9tZVVybDogJ2h0dHBzOi8vaGV4LmNvbScsXHJcbiAgICAgIGRleFNjcmVlbmVyVXJsOiAnaHR0cHM6Ly9kZXhzY3JlZW5lci5jb20vZXRoZXJldW0vMHg5ZTA5MDUyNDljZWVmZmZiOTYwNWUwMzRiNTM0NTQ0Njg0YTU4YmU2J1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgc2Vwb2xpYToge31cclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXRzIHN0b3JhZ2Uga2V5IGZvciBjdXN0b20gdG9rZW5zXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHJldHVybnMge3N0cmluZ31cclxuICovXHJcbmZ1bmN0aW9uIGdldFN0b3JhZ2VLZXkobmV0d29yaykge1xyXG4gIHJldHVybiBgY3VzdG9tX3Rva2Vuc18ke25ldHdvcmt9YDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgc3RvcmFnZSBrZXkgZm9yIGVuYWJsZWQgZGVmYXVsdCB0b2tlbnNcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0RGVmYXVsdFRva2Vuc0tleShuZXR3b3JrKSB7XHJcbiAgcmV0dXJuIGBlbmFibGVkX2RlZmF1bHRfdG9rZW5zXyR7bmV0d29ya31gO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyBhbGwgY3VzdG9tIHRva2VucyBmb3IgYSBuZXR3b3JrXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHJldHVybnMge1Byb21pc2U8QXJyYXk+fVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEN1c3RvbVRva2VucyhuZXR3b3JrKSB7XHJcbiAgY29uc3Qga2V5ID0gZ2V0U3RvcmFnZUtleShuZXR3b3JrKTtcclxuICBjb25zdCB0b2tlbnMgPSBhd2FpdCBsb2FkKGtleSk7XHJcbiAgcmV0dXJuIHRva2VucyB8fCBbXTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgZW5hYmxlZCBkZWZhdWx0IHRva2VucyBmb3IgYSBuZXR3b3JrXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHJldHVybnMge1Byb21pc2U8QXJyYXk8c3RyaW5nPj59IEFycmF5IG9mIGVuYWJsZWQgZGVmYXVsdCB0b2tlbiBzeW1ib2xzXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RW5hYmxlZERlZmF1bHRUb2tlbnMobmV0d29yaykge1xyXG4gIGNvbnN0IGtleSA9IGdldERlZmF1bHRUb2tlbnNLZXkobmV0d29yayk7XHJcbiAgY29uc3QgZW5hYmxlZCA9IGF3YWl0IGxvYWQoa2V5KTtcclxuICAvLyBJZiBub3RoaW5nIHN0b3JlZCwgYWxsIGRlZmF1bHRzIGFyZSBlbmFibGVkXHJcbiAgaWYgKCFlbmFibGVkKSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoREVGQVVMVF9UT0tFTlNbbmV0d29ya10gfHwge30pO1xyXG4gIH1cclxuICByZXR1cm4gZW5hYmxlZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgYWxsIHRva2VucyAoZGVmYXVsdCArIGN1c3RvbSkgZm9yIGEgbmV0d29ya1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn1cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBbGxUb2tlbnMobmV0d29yaykge1xyXG4gIGNvbnN0IGN1c3RvbVRva2VucyA9IGF3YWl0IGdldEN1c3RvbVRva2VucyhuZXR3b3JrKTtcclxuICBjb25zdCBlbmFibGVkRGVmYXVsdHMgPSBhd2FpdCBnZXRFbmFibGVkRGVmYXVsdFRva2VucyhuZXR3b3JrKTtcclxuXHJcbiAgY29uc3QgZGVmYXVsdFRva2VucyA9IFtdO1xyXG4gIGNvbnN0IG5ldHdvcmtEZWZhdWx0cyA9IERFRkFVTFRfVE9LRU5TW25ldHdvcmtdIHx8IHt9O1xyXG5cclxuICBmb3IgKGNvbnN0IHN5bWJvbCBvZiBlbmFibGVkRGVmYXVsdHMpIHtcclxuICAgIGlmIChuZXR3b3JrRGVmYXVsdHNbc3ltYm9sXSkge1xyXG4gICAgICBkZWZhdWx0VG9rZW5zLnB1c2goe1xyXG4gICAgICAgIC4uLm5ldHdvcmtEZWZhdWx0c1tzeW1ib2xdLFxyXG4gICAgICAgIGlzRGVmYXVsdDogdHJ1ZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBbLi4uZGVmYXVsdFRva2VucywgLi4uY3VzdG9tVG9rZW5zXTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZHMgYSBjdXN0b20gdG9rZW5cclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5BZGRyZXNzIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzc1xyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3Q+fSBBZGRlZCB0b2tlbiBvYmplY3RcclxuICogQHRocm93cyB7RXJyb3J9IElmIHRva2VuIGxpbWl0IHJlYWNoZWQsIGludmFsaWQgYWRkcmVzcywgb3IgYWxyZWFkeSBleGlzdHNcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhZGRDdXN0b21Ub2tlbihuZXR3b3JrLCB0b2tlbkFkZHJlc3MpIHtcclxuICAvLyBWYWxpZGF0ZSBhZGRyZXNzIGZvcm1hdFxyXG4gIHRva2VuQWRkcmVzcyA9IHRva2VuQWRkcmVzcy50cmltKCk7XHJcbiAgaWYgKCF0b2tlbkFkZHJlc3Muc3RhcnRzV2l0aCgnMHgnKSB8fCB0b2tlbkFkZHJlc3MubGVuZ3RoICE9PSA0Mikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHRva2VuIGFkZHJlc3MgZm9ybWF0Jyk7XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiBpdCdzIGEgZGVmYXVsdCB0b2tlblxyXG4gIGNvbnN0IG5ldHdvcmtEZWZhdWx0cyA9IERFRkFVTFRfVE9LRU5TW25ldHdvcmtdIHx8IHt9O1xyXG4gIGZvciAoY29uc3Qgc3ltYm9sIGluIG5ldHdvcmtEZWZhdWx0cykge1xyXG4gICAgaWYgKG5ldHdvcmtEZWZhdWx0c1tzeW1ib2xdLmFkZHJlc3MudG9Mb3dlckNhc2UoKSA9PT0gdG9rZW5BZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGlzIGlzIGEgZGVmYXVsdCB0b2tlbiAoJHtzeW1ib2x9KS4gVXNlIHRoZSBkZWZhdWx0IHRva2VucyBsaXN0IGluc3RlYWQuYCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBHZXQgY3VycmVudCBjdXN0b20gdG9rZW5zXHJcbiAgY29uc3QgY3VzdG9tVG9rZW5zID0gYXdhaXQgZ2V0Q3VzdG9tVG9rZW5zKG5ldHdvcmspO1xyXG5cclxuICAvLyBDaGVjayBsaW1pdFxyXG4gIGlmIChjdXN0b21Ub2tlbnMubGVuZ3RoID49IE1BWF9UT0tFTlNfUEVSX05FVFdPUkspIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgTWF4aW11bSAke01BWF9UT0tFTlNfUEVSX05FVFdPUkt9IGN1c3RvbSB0b2tlbnMgcGVyIG5ldHdvcmtgKTtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIGlmIGFscmVhZHkgZXhpc3RzXHJcbiAgY29uc3QgZXhpc3RzID0gY3VzdG9tVG9rZW5zLmZpbmQoXHJcbiAgICB0ID0+IHQuYWRkcmVzcy50b0xvd2VyQ2FzZSgpID09PSB0b2tlbkFkZHJlc3MudG9Mb3dlckNhc2UoKVxyXG4gICk7XHJcbiAgaWYgKGV4aXN0cykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdUb2tlbiBhbHJlYWR5IGFkZGVkJyk7XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSBjb250cmFjdCBhbmQgZmV0Y2ggbWV0YWRhdGFcclxuICBjb25zdCBpc1ZhbGlkID0gYXdhaXQgdmFsaWRhdGVUb2tlbkNvbnRyYWN0KG5ldHdvcmssIHRva2VuQWRkcmVzcyk7XHJcbiAgaWYgKCFpc1ZhbGlkKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgRVJDLTIwIHRva2VuIGNvbnRyYWN0Jyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBtZXRhZGF0YSA9IGF3YWl0IGdldFRva2VuTWV0YWRhdGEobmV0d29yaywgdG9rZW5BZGRyZXNzKTtcclxuXHJcbiAgLy8gQ3JlYXRlIHRva2VuIGVudHJ5XHJcbiAgY29uc3QgdG9rZW4gPSB7XHJcbiAgICBhZGRyZXNzOiB0b2tlbkFkZHJlc3MsXHJcbiAgICBuYW1lOiBtZXRhZGF0YS5uYW1lLFxyXG4gICAgc3ltYm9sOiBtZXRhZGF0YS5zeW1ib2wsXHJcbiAgICBkZWNpbWFsczogbWV0YWRhdGEuZGVjaW1hbHMsXHJcbiAgICBsb2dvOiBudWxsLFxyXG4gICAgaXNEZWZhdWx0OiBmYWxzZSxcclxuICAgIGFkZGVkQXQ6IERhdGUubm93KClcclxuICB9O1xyXG5cclxuICAvLyBBZGQgdG8gbGlzdFxyXG4gIGN1c3RvbVRva2Vucy5wdXNoKHRva2VuKTtcclxuXHJcbiAgLy8gU2F2ZVxyXG4gIGNvbnN0IGtleSA9IGdldFN0b3JhZ2VLZXkobmV0d29yayk7XHJcbiAgYXdhaXQgc2F2ZShrZXksIGN1c3RvbVRva2Vucyk7XHJcblxyXG4gIHJldHVybiB0b2tlbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlbW92ZXMgYSBjdXN0b20gdG9rZW5cclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5BZGRyZXNzIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzc1xyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW1vdmVDdXN0b21Ub2tlbihuZXR3b3JrLCB0b2tlbkFkZHJlc3MpIHtcclxuICBjb25zdCBjdXN0b21Ub2tlbnMgPSBhd2FpdCBnZXRDdXN0b21Ub2tlbnMobmV0d29yayk7XHJcblxyXG4gIGNvbnN0IGZpbHRlcmVkID0gY3VzdG9tVG9rZW5zLmZpbHRlcihcclxuICAgIHQgPT4gdC5hZGRyZXNzLnRvTG93ZXJDYXNlKCkgIT09IHRva2VuQWRkcmVzcy50b0xvd2VyQ2FzZSgpXHJcbiAgKTtcclxuXHJcbiAgY29uc3Qga2V5ID0gZ2V0U3RvcmFnZUtleShuZXR3b3JrKTtcclxuICBhd2FpdCBzYXZlKGtleSwgZmlsdGVyZWQpO1xyXG59XHJcblxyXG4vKipcclxuICogVG9nZ2xlcyBhIGRlZmF1bHQgdG9rZW4gb24vb2ZmXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHBhcmFtIHtzdHJpbmd9IHN5bWJvbCAtIFRva2VuIHN5bWJvbFxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGVuYWJsZWQgLSBFbmFibGUgb3IgZGlzYWJsZVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0b2dnbGVEZWZhdWx0VG9rZW4obmV0d29yaywgc3ltYm9sLCBlbmFibGVkKSB7XHJcbiAgY29uc3QgZW5hYmxlZFRva2VucyA9IGF3YWl0IGdldEVuYWJsZWREZWZhdWx0VG9rZW5zKG5ldHdvcmspO1xyXG5cclxuICBsZXQgdXBkYXRlZDtcclxuICBpZiAoZW5hYmxlZCkge1xyXG4gICAgLy8gQWRkIGlmIG5vdCBhbHJlYWR5IGluIGxpc3RcclxuICAgIGlmICghZW5hYmxlZFRva2Vucy5pbmNsdWRlcyhzeW1ib2wpKSB7XHJcbiAgICAgIHVwZGF0ZWQgPSBbLi4uZW5hYmxlZFRva2Vucywgc3ltYm9sXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybjsgLy8gQWxyZWFkeSBlbmFibGVkXHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIFJlbW92ZSBmcm9tIGxpc3RcclxuICAgIHVwZGF0ZWQgPSBlbmFibGVkVG9rZW5zLmZpbHRlcihzID0+IHMgIT09IHN5bWJvbCk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBrZXkgPSBnZXREZWZhdWx0VG9rZW5zS2V5KG5ldHdvcmspO1xyXG4gIGF3YWl0IHNhdmUoa2V5LCB1cGRhdGVkKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiBhIGRlZmF1bHQgdG9rZW4gaXMgZW5hYmxlZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzeW1ib2wgLSBUb2tlbiBzeW1ib2xcclxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNEZWZhdWx0VG9rZW5FbmFibGVkKG5ldHdvcmssIHN5bWJvbCkge1xyXG4gIGNvbnN0IGVuYWJsZWQgPSBhd2FpdCBnZXRFbmFibGVkRGVmYXVsdFRva2VucyhuZXR3b3JrKTtcclxuICByZXR1cm4gZW5hYmxlZC5pbmNsdWRlcyhzeW1ib2wpO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBQcmljZSBPcmFjbGUgLSBGZXRjaGVzIHRva2VuIHByaWNlcyBmcm9tIFB1bHNlWCBsaXF1aWRpdHkgcG9vbHNcclxuICogVXNlcyBvbi1jaGFpbiByZXNlcnZlIGRhdGEgdG8gY2FsY3VsYXRlIHJlYWwtdGltZSBERVggcHJpY2VzXHJcbiAqIFByaXZhY3ktcHJlc2VydmluZzogb25seSB1c2VzIFJQQyBjYWxscywgbm8gZXh0ZXJuYWwgQVBJc1xyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vLyBQdWxzZVggVjIgUGFpciBBQkkgKG9ubHkgZ2V0UmVzZXJ2ZXMgZnVuY3Rpb24pXHJcbmNvbnN0IFBBSVJfQUJJID0gW1xyXG4gICdmdW5jdGlvbiBnZXRSZXNlcnZlcygpIGV4dGVybmFsIHZpZXcgcmV0dXJucyAodWludDExMiByZXNlcnZlMCwgdWludDExMiByZXNlcnZlMSwgdWludDMyIGJsb2NrVGltZXN0YW1wTGFzdCknLFxyXG4gICdmdW5jdGlvbiB0b2tlbjAoKSBleHRlcm5hbCB2aWV3IHJldHVybnMgKGFkZHJlc3MpJyxcclxuICAnZnVuY3Rpb24gdG9rZW4xKCkgZXh0ZXJuYWwgdmlldyByZXR1cm5zIChhZGRyZXNzKSdcclxuXTtcclxuXHJcbi8vIEtub3duIFB1bHNlWCBWMiBwYWlyIGFkZHJlc3NlcyBvbiBQdWxzZUNoYWluIG1haW5uZXRcclxuLy8gQWxsIGFkZHJlc3NlcyBhcmUgY2hlY2tzdW1tZWQgZm9yIGV0aGVycy5qcyB2NiBjb21wYXRpYmlsaXR5XHJcbmNvbnN0IFBVTFNFWF9QQUlSUyA9IHtcclxuICBwdWxzZWNoYWluOiB7XHJcbiAgICAvLyBQTFMvREFJIC0gUHJpY2UgYW5jaG9yIGZvciBVU0QgY29udmVyc2lvblxyXG4gICAgJ1BMU19EQUknOiAnMHhFNTYwNDM2NzFkZjU1ZEU1Q0RmODQ1OTcxMDQzM0MxMDMyNERFMGFFJywgLy8gTWF5IG5vdCBleGlzdCwgZmFsbGJhY2sgdG8gVVNEQ1xyXG5cclxuICAgIC8vIE1ham9yIHRva2VuIHBhaXJzIChhbGwgcGFpcmVkIHdpdGggV1BMUylcclxuICAgICdIRVhfUExTJzogJzB4ZjFGNGVlNjEwYjJiQWJCMDVDNjM1RjcyNmVGOEIwQzU2OGM4ZGM2NScsXHJcbiAgICAnUExTWF9QTFMnOiAnMHgxYjQ1YjkxNDg3OTFkM2ExMDQxODRDZDVERkU1Q0U1NzE5M2EzZWU5JyxcclxuICAgICdJTkNfUExTJzogJzB4ZjgwOEJiNjI2NWU5Q2EyNzAwMmMwQTA0NTYyQmY1MGQ0RkUzN0VBQScsIC8vIEZyb20gR2Vja29UZXJtaW5hbCAoY2hlY2tzdW1tZWQpXHJcbiAgICAnU2F2YW50X1BMUyc6ICcweGFBQTg4OTQ1ODRhQUYwMDkyMzcyZjBDNzUzNzY5YTUwZjYwNjA3NDInLFxyXG4gICAgJ0hYUl9QTFMnOiAnMHhENUE4ZGUwMzNjODY5N2NFYWE4NDRDQTU5NmNjNzU4M2M0ZjhGNjEyJyxcclxuICAgICdUS1JfUExTJzogJzB4MjA1QzZkNDRkODRFODI2MDZFNEU5MjFmODdiNTFiNzFiYTg1RjBmMCcsXHJcbiAgICAnSkRBSV9QTFMnOiAnMHg3MDY1OENlNkQ2QzA5YWNkRTY0NkY2ZWE5QzU3QmE2NGY0RGMzNTBmJyxcclxuICAgICdSaWNreV9QTFMnOiAnMHhiZmU1YWU0MGJiY2E3NDg3ODQxOWFkN2Q3ZTExNWEzMGNjZmM2MmYxJ1xyXG4gIH1cclxufTtcclxuXHJcbi8vIFRva2VuIGFkZHJlc3NlcyBhbmQgZGVjaW1hbHMgZm9yIHByaWNlIHJvdXRpbmcgKGFsbCBjaGVja3N1bW1lZClcclxuY29uc3QgVE9LRU5fQUREUkVTU0VTID0ge1xyXG4gIHB1bHNlY2hhaW46IHtcclxuICAgIFdQTFM6IHsgYWRkcmVzczogJzB4QTEwNzdhMjk0ZERFMUIwOWJCMDc4ODQ0ZGY0MDc1OGE1RDBmOWEyNycsIGRlY2ltYWxzOiAxOCB9LFxyXG4gICAgREFJOiB7IGFkZHJlc3M6ICcweGVmRDc2NmNDYjM4RWFGMWRmZDcwMTg1M0JGQ2UzMTM1OTIzOUYzMDUnLCBkZWNpbWFsczogMTggfSxcclxuICAgIEhFWDogeyBhZGRyZXNzOiAnMHgyYjU5MWU5OWFmRTlmMzJlQUE2MjE0ZjdCNzYyOTc2OGM0MEVlYjM5JywgZGVjaW1hbHM6IDggfSxcclxuICAgIFBMU1g6IHsgYWRkcmVzczogJzB4OTVCMzAzOTg3QTYwQzcxNTA0RDk5QWExYjEzQjREQTA3YjA3OTBhYicsIGRlY2ltYWxzOiAxOCB9LFxyXG4gICAgSU5DOiB7IGFkZHJlc3M6ICcweDJGQTg3OEFiM0Y4N0NDMUM5NzM3RmMwNzExMDhGOTA0YzBCMEM5NWQnLCBkZWNpbWFsczogMTggfSxcclxuICAgIFNhdmFudDogeyBhZGRyZXNzOiAnMHhmMTZlMTdlNGEwMWJmOTlCMEEwM0ZkM0FiNjk3YkM4NzkwNmUxODA5JywgZGVjaW1hbHM6IDE4IH0sXHJcbiAgICBIWFI6IHsgYWRkcmVzczogJzB4Q2ZDYjg5ZjAwNTc2QTc3NWQ5ZjgxOTYxQTM3YmE3RENmMTJDN2Q5QicsIGRlY2ltYWxzOiAxOCB9LFxyXG4gICAgVEtSOiB7IGFkZHJlc3M6ICcweGQ5ZTU5MDIwMDg5OTE2QThFZkE3RGQwQjYwNWQ1NTIxOUQ3MmRCN0InLCBkZWNpbWFsczogMTggfSxcclxuICAgIEpEQUk6IHsgYWRkcmVzczogJzB4MTYxMEU3NUM5YjQ4QkY1NTAxMzc4MjA0NTJkRTQwNDliQjIyYkI3MicsIGRlY2ltYWxzOiAxOCB9LFxyXG4gICAgUmlja3k6IHsgYWRkcmVzczogJzB4NzlGQzBFMWQzRUMwMGQ4MUU1NDIzRGNDMDFBNjE3YjBlMTI0NWMyQicsIGRlY2ltYWxzOiAxOCB9XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gUHJpY2UgY2FjaGUgKDUgbWludXRlIGV4cGlyeSlcclxuY29uc3QgcHJpY2VDYWNoZSA9IHtcclxuICBwcmljZXM6IHt9LFxyXG4gIHRpbWVzdGFtcDogMCxcclxuICBDQUNIRV9EVVJBVElPTjogNSAqIDYwICogMTAwMCAvLyA1IG1pbnV0ZXNcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgcmVzZXJ2ZXMgZnJvbSBhIFB1bHNlWCBwYWlyIGNvbnRyYWN0XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRQYWlyUmVzZXJ2ZXMocHJvdmlkZXIsIHBhaXJBZGRyZXNzKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHBhaXJDb250cmFjdCA9IG5ldyBldGhlcnMuQ29udHJhY3QocGFpckFkZHJlc3MsIFBBSVJfQUJJLCBwcm92aWRlcik7XHJcbiAgICBjb25zdCBbcmVzZXJ2ZTAsIHJlc2VydmUxXSA9IGF3YWl0IHBhaXJDb250cmFjdC5nZXRSZXNlcnZlcygpO1xyXG4gICAgY29uc3QgdG9rZW4wID0gYXdhaXQgcGFpckNvbnRyYWN0LnRva2VuMCgpO1xyXG4gICAgY29uc3QgdG9rZW4xID0gYXdhaXQgcGFpckNvbnRyYWN0LnRva2VuMSgpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlc2VydmUwOiByZXNlcnZlMC50b1N0cmluZygpLFxyXG4gICAgICByZXNlcnZlMTogcmVzZXJ2ZTEudG9TdHJpbmcoKSxcclxuICAgICAgdG9rZW4wOiB0b2tlbjAudG9Mb3dlckNhc2UoKSxcclxuICAgICAgdG9rZW4xOiB0b2tlbjEudG9Mb3dlckNhc2UoKVxyXG4gICAgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgcGFpciByZXNlcnZlczonLCBwYWlyQWRkcmVzcywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlIHByaWNlIG9mIHRva2VuMCBpbiB0ZXJtcyBvZiB0b2tlbjEgZnJvbSByZXNlcnZlc1xyXG4gKiBwcmljZSA9IHJlc2VydmUxIC8gcmVzZXJ2ZTBcclxuICovXHJcbmZ1bmN0aW9uIGNhbGN1bGF0ZVByaWNlKHJlc2VydmUwLCByZXNlcnZlMSwgZGVjaW1hbHMwID0gMTgsIGRlY2ltYWxzMSA9IDE4KSB7XHJcbiAgY29uc3QgcjAgPSBwYXJzZUZsb2F0KGV0aGVycy5mb3JtYXRVbml0cyhyZXNlcnZlMCwgZGVjaW1hbHMwKSk7XHJcbiAgY29uc3QgcjEgPSBwYXJzZUZsb2F0KGV0aGVycy5mb3JtYXRVbml0cyhyZXNlcnZlMSwgZGVjaW1hbHMxKSk7XHJcblxyXG4gIGlmIChyMCA9PT0gMCkgcmV0dXJuIDA7XHJcbiAgcmV0dXJuIHIxIC8gcjA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgUExTIHByaWNlIGluIFVTRCB1c2luZyBIRVggYXMgaW50ZXJtZWRpYXJ5XHJcbiAqIDEuIEdldCBIRVgvUExTIHJlc2VydmVzIC0+IEhFWCBwcmljZSBpbiBQTFNcclxuICogMi4gVXNlIGtub3duIEhFWCBVU0QgcHJpY2UgKH4kMC4wMSkgdG8gY2FsY3VsYXRlIFBMUyBVU0QgcHJpY2VcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFBMU1ByaWNlKHByb3ZpZGVyKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIEZpcnN0IHRyeSB0aGUgREFJIHBhaXJcclxuICAgIGNvbnN0IGRhaVBhaXJBZGRyZXNzID0gUFVMU0VYX1BBSVJTLnB1bHNlY2hhaW4uUExTX0RBSTtcclxuICAgIGNvbnN0IGRhaVJlc2VydmVzID0gYXdhaXQgZ2V0UGFpclJlc2VydmVzKHByb3ZpZGVyLCBkYWlQYWlyQWRkcmVzcyk7XHJcblxyXG4gICAgaWYgKGRhaVJlc2VydmVzKSB7XHJcbiAgICAgIGNvbnN0IHRva2VucyA9IFRPS0VOX0FERFJFU1NFUy5wdWxzZWNoYWluO1xyXG4gICAgICBjb25zdCBwbHNBZGRyZXNzID0gdG9rZW5zLldQTFMuYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICBjb25zdCBkYWlBZGRyZXNzID0gdG9rZW5zLkRBSS5hZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICBsZXQgcGxzUmVzZXJ2ZSwgZGFpUmVzZXJ2ZTtcclxuICAgICAgaWYgKGRhaVJlc2VydmVzLnRva2VuMCA9PT0gcGxzQWRkcmVzcykge1xyXG4gICAgICAgIHBsc1Jlc2VydmUgPSBkYWlSZXNlcnZlcy5yZXNlcnZlMDtcclxuICAgICAgICBkYWlSZXNlcnZlID0gZGFpUmVzZXJ2ZXMucmVzZXJ2ZTE7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGxzUmVzZXJ2ZSA9IGRhaVJlc2VydmVzLnJlc2VydmUxO1xyXG4gICAgICAgIGRhaVJlc2VydmUgPSBkYWlSZXNlcnZlcy5yZXNlcnZlMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgcGxzUHJpY2UgPSBjYWxjdWxhdGVQcmljZShwbHNSZXNlcnZlLCBkYWlSZXNlcnZlLCAxOCwgMTgpO1xyXG4gICAgICBjb25zb2xlLmxvZygn4pyTIFBMUyBwcmljZSBmcm9tIERBSSBwYWlyOicsIHBsc1ByaWNlKTtcclxuICAgICAgcmV0dXJuIHBsc1ByaWNlO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ0NvdWxkIG5vdCBmZXRjaCBQTFMvREFJIHByaWNlLCB0cnlpbmcgYWx0ZXJuYXRpdmUuLi4nLCBlcnJvci5tZXNzYWdlKTtcclxuICB9XHJcblxyXG4gIC8vIEZhbGxiYWNrOiBDYWxjdWxhdGUgdGhyb3VnaCBIRVhcclxuICAvLyBVc2UgQ29pbkdlY2tvL0NvaW5NYXJrZXRDYXAga25vd24gSEVYIHByaWNlIGFzIGFuY2hvclxyXG4gIC8vIE9yIHVzZSBhIGhhcmRjb2RlZCByZWFzb25hYmxlIGVzdGltYXRlXHJcbiAgY29uc29sZS5sb2coJ1VzaW5nIEhFWC1iYXNlZCBwcmljZSBlc3RpbWF0aW9uIGFzIGZhbGxiYWNrJyk7XHJcbiAgXHJcbiAgLy8gR2V0IEhFWC9QTFMgcmVzZXJ2ZXNcclxuICBjb25zdCBoZXhQYWlyQWRkcmVzcyA9IFBVTFNFWF9QQUlSUy5wdWxzZWNoYWluLkhFWF9QTFM7XHJcbiAgY29uc3QgaGV4UmVzZXJ2ZXMgPSBhd2FpdCBnZXRQYWlyUmVzZXJ2ZXMocHJvdmlkZXIsIGhleFBhaXJBZGRyZXNzKTtcclxuICBcclxuICBpZiAoIWhleFJlc2VydmVzKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3QgZmV0Y2ggSEVYL1BMUyByZXNlcnZlcyBmb3IgcHJpY2UgY2FsY3VsYXRpb24nKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgdG9rZW5zID0gVE9LRU5fQUREUkVTU0VTLnB1bHNlY2hhaW47XHJcbiAgY29uc3QgcGxzQWRkcmVzcyA9IHRva2Vucy5XUExTLmFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuICBjb25zdCBoZXhBZGRyZXNzID0gdG9rZW5zLkhFWC5hZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIGxldCBwbHNSZXNlcnZlLCBoZXhSZXNlcnZlO1xyXG4gIGlmIChoZXhSZXNlcnZlcy50b2tlbjAgPT09IGhleEFkZHJlc3MpIHtcclxuICAgIGhleFJlc2VydmUgPSBoZXhSZXNlcnZlcy5yZXNlcnZlMDtcclxuICAgIHBsc1Jlc2VydmUgPSBoZXhSZXNlcnZlcy5yZXNlcnZlMTtcclxuICB9IGVsc2Uge1xyXG4gICAgaGV4UmVzZXJ2ZSA9IGhleFJlc2VydmVzLnJlc2VydmUxO1xyXG4gICAgcGxzUmVzZXJ2ZSA9IGhleFJlc2VydmVzLnJlc2VydmUwO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2FsY3VsYXRlIEhFWCBwcmljZSBpbiBQTFNcclxuICBjb25zdCBoZXhSZXNlcnZlRm9ybWF0dGVkID0gcGFyc2VGbG9hdChldGhlcnMuZm9ybWF0VW5pdHMoaGV4UmVzZXJ2ZSwgOCkpOyAvLyBIRVggaGFzIDggZGVjaW1hbHNcclxuICBjb25zdCBwbHNSZXNlcnZlRm9ybWF0dGVkID0gcGFyc2VGbG9hdChldGhlcnMuZm9ybWF0VW5pdHMocGxzUmVzZXJ2ZSwgMTgpKTtcclxuICBjb25zdCBoZXhQcmljZUluUGxzID0gcGxzUmVzZXJ2ZUZvcm1hdHRlZCAvIGhleFJlc2VydmVGb3JtYXR0ZWQ7XHJcblxyXG4gIC8vIFVzZSBhcHByb3hpbWF0ZSBIRVggVVNEIHByaWNlICh1cGRhdGUgdGhpcyBwZXJpb2RpY2FsbHkgb3IgZmV0Y2ggZnJvbSBDb2luR2Vja28gQVBJKVxyXG4gIGNvbnN0IGhleFVzZFByaWNlID0gMC4wMTsgLy8gQXBwcm94aW1hdGUgLSBhZGp1c3QgYmFzZWQgb24gbWFya2V0XHJcbiAgXHJcbiAgLy8gQ2FsY3VsYXRlIFBMUyBVU0QgcHJpY2U6IGlmIDEgSEVYID0gWCBQTFMsIGFuZCAxIEhFWCA9ICQwLjAxLCB0aGVuIDEgUExTID0gJDAuMDEgLyBYXHJcbiAgY29uc3QgcGxzVXNkUHJpY2UgPSBoZXhVc2RQcmljZSAvIGhleFByaWNlSW5QbHM7XHJcbiAgXHJcbiAgLy8gRXN0aW1hdGVkIFBMUyBwcmljZSB2aWEgSEVYXHJcbiAgXHJcbiAgcmV0dXJuIHBsc1VzZFByaWNlO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IHRva2VuIHByaWNlIGluIFBMUyBmcm9tIFB1bHNlWCBwYWlyXHJcbiAqIFJldHVybnM6IEhvdyBtdWNoIFBMUyBkb2VzIDEgdG9rZW4gY29zdFxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZ2V0VG9rZW5QcmljZUluUExTKHByb3ZpZGVyLCBwYWlyQWRkcmVzcywgdG9rZW5BZGRyZXNzLCB0b2tlbkRlY2ltYWxzKSB7XHJcbiAgY29uc3QgcmVzZXJ2ZXMgPSBhd2FpdCBnZXRQYWlyUmVzZXJ2ZXMocHJvdmlkZXIsIHBhaXJBZGRyZXNzKTtcclxuXHJcbiAgaWYgKCFyZXNlcnZlcykgcmV0dXJuIG51bGw7XHJcblxyXG4gIGNvbnN0IHBsc0FkZHJlc3MgPSBUT0tFTl9BRERSRVNTRVMucHVsc2VjaGFpbi5XUExTLmFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuICBjb25zdCB0YXJnZXRUb2tlbiA9IHRva2VuQWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAvLyBEZXRlcm1pbmUgd2hpY2ggcmVzZXJ2ZSBpcyB0aGUgdG9rZW4gYW5kIHdoaWNoIGlzIFBMU1xyXG4gIGxldCB0b2tlblJlc2VydmUsIHBsc1Jlc2VydmU7XHJcbiAgaWYgKHJlc2VydmVzLnRva2VuMCA9PT0gdGFyZ2V0VG9rZW4pIHtcclxuICAgIHRva2VuUmVzZXJ2ZSA9IHJlc2VydmVzLnJlc2VydmUwO1xyXG4gICAgcGxzUmVzZXJ2ZSA9IHJlc2VydmVzLnJlc2VydmUxO1xyXG4gIH0gZWxzZSBpZiAocmVzZXJ2ZXMudG9rZW4xID09PSB0YXJnZXRUb2tlbikge1xyXG4gICAgdG9rZW5SZXNlcnZlID0gcmVzZXJ2ZXMucmVzZXJ2ZTE7XHJcbiAgICBwbHNSZXNlcnZlID0gcmVzZXJ2ZXMucmVzZXJ2ZTA7XHJcbiAgfSBlbHNlIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ1Rva2VuIG5vdCBmb3VuZCBpbiBwYWlyOicsIHRva2VuQWRkcmVzcywgcGFpckFkZHJlc3MpO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICAvLyBDYWxjdWxhdGUgdG9rZW4gcHJpY2UgaW4gUExTXHJcbiAgLy8gUHJpY2Ugb2YgdG9rZW4gaW4gUExTID0gcGxzUmVzZXJ2ZSAvIHRva2VuUmVzZXJ2ZVxyXG4gIC8vIFRoaXMgZ2l2ZXM6IEhvdyBtYW55IFBMUyBwZXIgMSB0b2tlblxyXG4gIGNvbnN0IHRva2VuUmVzZXJ2ZUZvcm1hdHRlZCA9IHBhcnNlRmxvYXQoZXRoZXJzLmZvcm1hdFVuaXRzKHRva2VuUmVzZXJ2ZSwgdG9rZW5EZWNpbWFscykpO1xyXG4gIGNvbnN0IHBsc1Jlc2VydmVGb3JtYXR0ZWQgPSBwYXJzZUZsb2F0KGV0aGVycy5mb3JtYXRVbml0cyhwbHNSZXNlcnZlLCAxOCkpO1xyXG5cclxuICAvLyBUb2tlbiByZXNlcnZlcyBmZXRjaGVkXHJcblxyXG4gIGlmICh0b2tlblJlc2VydmVGb3JtYXR0ZWQgPT09IDApIHJldHVybiAwO1xyXG5cclxuICBjb25zdCB0b2tlblByaWNlSW5QbHMgPSBwbHNSZXNlcnZlRm9ybWF0dGVkIC8gdG9rZW5SZXNlcnZlRm9ybWF0dGVkO1xyXG4gIC8vIFRva2VuIHByaWNlIGNhbGN1bGF0ZWRcclxuICByZXR1cm4gdG9rZW5QcmljZUluUGxzO1xyXG59XHJcblxyXG4vKipcclxuICogRmV0Y2ggYWxsIHRva2VuIHByaWNlcyBpbiBVU0RcclxuICogUmV0dXJuczogeyBQTFM6IHByaWNlLCBIRVg6IHByaWNlLCBQTFNYOiBwcmljZSwgSU5DOiBwcmljZSwgLi4uIH1cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFRva2VuUHJpY2VzKHByb3ZpZGVyLCBuZXR3b3JrID0gJ3B1bHNlY2hhaW4nKSB7XHJcbiAgLy8gQ2hlY2sgY2FjaGUgZmlyc3RcclxuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gIGlmIChwcmljZUNhY2hlLnByaWNlc1tuZXR3b3JrXSAmJiAobm93IC0gcHJpY2VDYWNoZS50aW1lc3RhbXApIDwgcHJpY2VDYWNoZS5DQUNIRV9EVVJBVElPTikge1xyXG4gICAgLy8gVXNpbmcgY2FjaGVkIHByaWNlc1xyXG4gICAgcmV0dXJuIHByaWNlQ2FjaGUucHJpY2VzW25ldHdvcmtdO1xyXG4gIH1cclxuXHJcbiAgLy8gRmV0Y2hpbmcgZnJlc2ggcHJpY2VzXHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwcmljZXMgPSB7fTtcclxuXHJcbiAgICAvLyBTdGVwIDE6IEdldCBQTFMgcHJpY2UgaW4gVVNEXHJcbiAgICBjb25zdCBwbHNVc2RQcmljZSA9IGF3YWl0IGdldFBMU1ByaWNlKHByb3ZpZGVyKTtcclxuICAgIGlmICghcGxzVXNkUHJpY2UpIHtcclxuICAgICAgY29uc29sZS53YXJuKCdDb3VsZCBub3QgZmV0Y2ggUExTIHByaWNlJyk7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaWNlcy5QTFMgPSBwbHNVc2RQcmljZTtcclxuICAgIC8vIFBMUyBwcmljZSBmZXRjaGVkXHJcblxyXG4gICAgLy8gU3RlcCAyOiBHZXQgb3RoZXIgdG9rZW4gcHJpY2VzIGluIFBMUywgdGhlbiBjb252ZXJ0IHRvIFVTRFxyXG4gICAgY29uc3QgcGFpcnMgPSBQVUxTRVhfUEFJUlNbbmV0d29ya107XHJcbiAgICBjb25zdCB0b2tlbnMgPSBUT0tFTl9BRERSRVNTRVNbbmV0d29ya107XHJcblxyXG4gICAgLy8gSEVYIHByaWNlXHJcbiAgICBjb25zdCBoZXhQcmljZUluUGxzID0gYXdhaXQgZ2V0VG9rZW5QcmljZUluUExTKHByb3ZpZGVyLCBwYWlycy5IRVhfUExTLCB0b2tlbnMuSEVYLmFkZHJlc3MsIHRva2Vucy5IRVguZGVjaW1hbHMpO1xyXG4gICAgaWYgKGhleFByaWNlSW5QbHMpIHtcclxuICAgICAgcHJpY2VzLkhFWCA9IGhleFByaWNlSW5QbHMgKiBwbHNVc2RQcmljZTtcclxuICAgICAgLy8gSEVYIHByaWNlIGNhbGN1bGF0ZWRcclxuICAgIH1cclxuXHJcbiAgICAvLyBQTFNYIHByaWNlXHJcbiAgICBjb25zdCBwbHN4UHJpY2VJblBscyA9IGF3YWl0IGdldFRva2VuUHJpY2VJblBMUyhwcm92aWRlciwgcGFpcnMuUExTWF9QTFMsIHRva2Vucy5QTFNYLmFkZHJlc3MsIHRva2Vucy5QTFNYLmRlY2ltYWxzKTtcclxuICAgIGlmIChwbHN4UHJpY2VJblBscykge1xyXG4gICAgICBwcmljZXMuUExTWCA9IHBsc3hQcmljZUluUGxzICogcGxzVXNkUHJpY2U7XHJcbiAgICAgIC8vIFBMU1ggcHJpY2UgY2FsY3VsYXRlZFxyXG4gICAgfVxyXG5cclxuICAgIC8vIElOQyBwcmljZVxyXG4gICAgY29uc3QgaW5jUHJpY2VJblBscyA9IGF3YWl0IGdldFRva2VuUHJpY2VJblBMUyhwcm92aWRlciwgcGFpcnMuSU5DX1BMUywgdG9rZW5zLklOQy5hZGRyZXNzLCB0b2tlbnMuSU5DLmRlY2ltYWxzKTtcclxuICAgIGlmIChpbmNQcmljZUluUGxzKSB7XHJcbiAgICAgIHByaWNlcy5JTkMgPSBpbmNQcmljZUluUGxzICogcGxzVXNkUHJpY2U7XHJcbiAgICAgIC8vIElOQyBwcmljZSBjYWxjdWxhdGVkXHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2F2YW50IHByaWNlXHJcbiAgICBjb25zdCBzYXZhbnRQcmljZUluUGxzID0gYXdhaXQgZ2V0VG9rZW5QcmljZUluUExTKHByb3ZpZGVyLCBwYWlycy5TYXZhbnRfUExTLCB0b2tlbnMuU2F2YW50LmFkZHJlc3MsIHRva2Vucy5TYXZhbnQuZGVjaW1hbHMpO1xyXG4gICAgaWYgKHNhdmFudFByaWNlSW5QbHMpIHtcclxuICAgICAgcHJpY2VzLlNhdmFudCA9IHNhdmFudFByaWNlSW5QbHMgKiBwbHNVc2RQcmljZTtcclxuICAgICAgLy8gU2F2YW50IHByaWNlIGNhbGN1bGF0ZWRcclxuICAgIH1cclxuXHJcbiAgICAvLyBIWFIgcHJpY2VcclxuICAgIGNvbnN0IGh4clByaWNlSW5QbHMgPSBhd2FpdCBnZXRUb2tlblByaWNlSW5QTFMocHJvdmlkZXIsIHBhaXJzLkhYUl9QTFMsIHRva2Vucy5IWFIuYWRkcmVzcywgdG9rZW5zLkhYUi5kZWNpbWFscyk7XHJcbiAgICBpZiAoaHhyUHJpY2VJblBscykge1xyXG4gICAgICBwcmljZXMuSFhSID0gaHhyUHJpY2VJblBscyAqIHBsc1VzZFByaWNlO1xyXG4gICAgICAvLyBIWFIgcHJpY2UgY2FsY3VsYXRlZFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFRLUiBwcmljZVxyXG4gICAgY29uc3QgdGtyUHJpY2VJblBscyA9IGF3YWl0IGdldFRva2VuUHJpY2VJblBMUyhwcm92aWRlciwgcGFpcnMuVEtSX1BMUywgdG9rZW5zLlRLUi5hZGRyZXNzLCB0b2tlbnMuVEtSLmRlY2ltYWxzKTtcclxuICAgIGlmICh0a3JQcmljZUluUGxzKSB7XHJcbiAgICAgIHByaWNlcy5US1IgPSB0a3JQcmljZUluUGxzICogcGxzVXNkUHJpY2U7XHJcbiAgICAgIC8vIFRLUiBwcmljZSBjYWxjdWxhdGVkXHJcbiAgICB9XHJcblxyXG4gICAgLy8gSkRBSSBwcmljZVxyXG4gICAgY29uc3QgamRhaVByaWNlSW5QbHMgPSBhd2FpdCBnZXRUb2tlblByaWNlSW5QTFMocHJvdmlkZXIsIHBhaXJzLkpEQUlfUExTLCB0b2tlbnMuSkRBSS5hZGRyZXNzLCB0b2tlbnMuSkRBSS5kZWNpbWFscyk7XHJcbiAgICBpZiAoamRhaVByaWNlSW5QbHMpIHtcclxuICAgICAgcHJpY2VzLkpEQUkgPSBqZGFpUHJpY2VJblBscyAqIHBsc1VzZFByaWNlO1xyXG4gICAgICAvLyBKREFJIHByaWNlIGNhbGN1bGF0ZWRcclxuICAgIH1cclxuXHJcbiAgICAvLyBSaWNreSBwcmljZVxyXG4gICAgY29uc3Qgcmlja3lQcmljZUluUGxzID0gYXdhaXQgZ2V0VG9rZW5QcmljZUluUExTKHByb3ZpZGVyLCBwYWlycy5SaWNreV9QTFMsIHRva2Vucy5SaWNreS5hZGRyZXNzLCB0b2tlbnMuUmlja3kuZGVjaW1hbHMpO1xyXG4gICAgaWYgKHJpY2t5UHJpY2VJblBscykge1xyXG4gICAgICBwcmljZXMuUmlja3kgPSByaWNreVByaWNlSW5QbHMgKiBwbHNVc2RQcmljZTtcclxuICAgICAgLy8gUmlja3kgcHJpY2UgY2FsY3VsYXRlZFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSBjYWNoZVxyXG4gICAgcHJpY2VDYWNoZS5wcmljZXNbbmV0d29ya10gPSBwcmljZXM7XHJcbiAgICBwcmljZUNhY2hlLnRpbWVzdGFtcCA9IG5vdztcclxuXHJcbiAgICByZXR1cm4gcHJpY2VzO1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdG9rZW4gcHJpY2VzOicsIGVycm9yKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCBVU0QgdmFsdWUgZm9yIGEgdG9rZW4gYW1vdW50XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlblN5bWJvbCAtIFRva2VuIHN5bWJvbCAoUExTLCBIRVgsIFBMU1gsIElOQywgZXRjLilcclxuICogQHBhcmFtIHtzdHJpbmd9IGFtb3VudCAtIFRva2VuIGFtb3VudCBhcyBzdHJpbmcgKGluIGJhc2UgdW5pdHMpXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWNpbWFscyAtIFRva2VuIGRlY2ltYWxzXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBwcmljZXMgLSBQcmljZSBkYXRhIGZyb20gZmV0Y2hUb2tlblByaWNlcygpXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VG9rZW5WYWx1ZVVTRCh0b2tlblN5bWJvbCwgYW1vdW50LCBkZWNpbWFscywgcHJpY2VzKSB7XHJcbiAgaWYgKCFwcmljZXMgfHwgIXByaWNlc1t0b2tlblN5bWJvbF0pIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgdG9rZW5BbW91bnQgPSBwYXJzZUZsb2F0KGV0aGVycy5mb3JtYXRVbml0cyhhbW91bnQsIGRlY2ltYWxzKSk7XHJcbiAgY29uc3QgdG9rZW5QcmljZSA9IHByaWNlc1t0b2tlblN5bWJvbF07XHJcblxyXG4gIHJldHVybiB0b2tlbkFtb3VudCAqIHRva2VuUHJpY2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgVVNEIHZhbHVlIGZvciBkaXNwbGF5XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0VVNEKHZhbHVlKSB7XHJcbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgIHJldHVybiAn4oCUJztcclxuICB9XHJcblxyXG4gIGlmICh2YWx1ZSA8IDAuMDEpIHtcclxuICAgIHJldHVybiBgJCR7dmFsdWUudG9GaXhlZCg2KX1gO1xyXG4gIH0gZWxzZSBpZiAodmFsdWUgPCAxKSB7XHJcbiAgICByZXR1cm4gYCQke3ZhbHVlLnRvRml4ZWQoNCl9YDtcclxuICB9IGVsc2UgaWYgKHZhbHVlIDwgMTAwKSB7XHJcbiAgICByZXR1cm4gYCQke3ZhbHVlLnRvRml4ZWQoMil9YDtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIGAkJHt2YWx1ZS50b0xvY2FsZVN0cmluZygnZW4tVVMnLCB7IG1pbmltdW1GcmFjdGlvbkRpZ2l0czogMiwgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiAyIH0pfWA7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ2xlYXIgcHJpY2UgY2FjaGUgKHVzZWZ1bCBmb3IgdGVzdGluZyBvciBtYW51YWwgcmVmcmVzaClcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjbGVhclByaWNlQ2FjaGUoKSB7XHJcbiAgcHJpY2VDYWNoZS5wcmljZXMgPSB7fTtcclxuICBwcmljZUNhY2hlLnRpbWVzdGFtcCA9IDA7XHJcbiAgLy8gUHJpY2UgY2FjaGUgY2xlYXJlZFxyXG59XHJcbiIsIi8qKlxyXG4gKiBwb3B1cC5qc1xyXG4gKlxyXG4gKiBVSSBjb250cm9sbGVyIGZvciBIZWFydFdhbGxldCBwb3B1cFxyXG4gKi9cclxuXHJcbmltcG9ydCB7XHJcbiAgY3JlYXRlV2FsbGV0LFxyXG4gIGltcG9ydEZyb21NbmVtb25pYyxcclxuICBpbXBvcnRGcm9tUHJpdmF0ZUtleSxcclxuICB1bmxvY2tXYWxsZXQsXHJcbiAgd2FsbGV0RXhpc3RzLFxyXG4gIGV4cG9ydFByaXZhdGVLZXksXHJcbiAgZXhwb3J0TW5lbW9uaWMsXHJcbiAgZGVsZXRlV2FsbGV0LFxyXG4gIG1pZ3JhdGVUb011bHRpV2FsbGV0LFxyXG4gIGdldEFsbFdhbGxldHMsXHJcbiAgZ2V0QWN0aXZlV2FsbGV0LFxyXG4gIHNldEFjdGl2ZVdhbGxldCxcclxuICBhZGRXYWxsZXQsXHJcbiAgcmVuYW1lV2FsbGV0LFxyXG4gIGV4cG9ydFByaXZhdGVLZXlGb3JXYWxsZXQsXHJcbiAgZXhwb3J0TW5lbW9uaWNGb3JXYWxsZXRcclxufSBmcm9tICcuLi9jb3JlL3dhbGxldC5qcyc7XHJcbmltcG9ydCB7IHNhdmUsIGxvYWQgfSBmcm9tICcuLi9jb3JlL3N0b3JhZ2UuanMnO1xyXG5pbXBvcnQgeyBzaG9ydGVuQWRkcmVzcyB9IGZyb20gJy4uL2NvcmUvdmFsaWRhdGlvbi5qcyc7XHJcbmltcG9ydCAqIGFzIHJwYyBmcm9tICcuLi9jb3JlL3JwYy5qcyc7XHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcbmltcG9ydCBRUkNvZGUgZnJvbSAncXJjb2RlJztcclxuaW1wb3J0ICogYXMgdG9rZW5zIGZyb20gJy4uL2NvcmUvdG9rZW5zLmpzJztcclxuaW1wb3J0IHsgZmV0Y2hUb2tlblByaWNlcywgZ2V0VG9rZW5WYWx1ZVVTRCwgZm9ybWF0VVNEIH0gZnJvbSAnLi4vY29yZS9wcmljZU9yYWNsZS5qcyc7XHJcbmltcG9ydCAqIGFzIGVyYzIwIGZyb20gJy4uL2NvcmUvZXJjMjAuanMnO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBTRUNVUklUWSBVVElMSVRJRVNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuLyoqXHJcbiAqIEVzY2FwZXMgSFRNTCBzcGVjaWFsIGNoYXJhY3RlcnMgdG8gcHJldmVudCBYU1MgYXR0YWNrc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFRleHQgdG8gZXNjYXBlXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEhUTUwtc2FmZSB0ZXh0XHJcbiAqL1xyXG5mdW5jdGlvbiBlc2NhcGVIdG1sKHRleHQpIHtcclxuICBpZiAodHlwZW9mIHRleHQgIT09ICdzdHJpbmcnKSByZXR1cm4gJyc7XHJcbiAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgZGl2LnRleHRDb250ZW50ID0gdGV4dDtcclxuICByZXR1cm4gZGl2LmlubmVySFRNTDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhbml0aXplcyBlcnJvciBtZXNzYWdlcyBmb3Igc2FmZSBkaXNwbGF5IGluIGFsZXJ0cyBhbmQgVUlcclxuICogUmVtb3ZlcyBIVE1MIHRhZ3MsIHNjcmlwdHMsIGFuZCBsaW1pdHMgbGVuZ3RoXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gRXJyb3IgbWVzc2FnZSB0byBzYW5pdGl6ZVxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBTYW5pdGl6ZWQgbWVzc2FnZVxyXG4gKi9cclxuZnVuY3Rpb24gc2FuaXRpemVFcnJvcihtZXNzYWdlKSB7XHJcbiAgaWYgKHR5cGVvZiBtZXNzYWdlICE9PSAnc3RyaW5nJykgcmV0dXJuICdVbmtub3duIGVycm9yJztcclxuICBcclxuICAvLyBSZW1vdmUgbnVsbCBieXRlcyBhbmQgY29udHJvbCBjaGFyYWN0ZXJzIChleGNlcHQgbmV3bGluZXMgYW5kIHRhYnMpXHJcbiAgbGV0IHNhbml0aXplZCA9IG1lc3NhZ2UucmVwbGFjZSgvW1xceDAwLVxceDA4XFx4MEJcXHgwQ1xceDBFLVxceDFGXFx4N0ZdL2csICcnKTtcclxuICBcclxuICAvLyBSZW1vdmUgSFRNTCB0YWdzXHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoLzxbXj5dKj4vZywgJycpO1xyXG4gIFxyXG4gIC8vIFJlbW92ZSBzY3JpcHQtbGlrZSBjb250ZW50XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL2phdmFzY3JpcHQ6L2dpLCAnJyk7XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL29uXFx3K1xccyo9L2dpLCAnJyk7XHJcbiAgXHJcbiAgLy8gTGltaXQgbGVuZ3RoIHRvIHByZXZlbnQgRG9TXHJcbiAgaWYgKHNhbml0aXplZC5sZW5ndGggPiAzMDApIHtcclxuICAgIHNhbml0aXplZCA9IHNhbml0aXplZC5zdWJzdHJpbmcoMCwgMjk3KSArICcuLi4nO1xyXG4gIH1cclxuICBcclxuICByZXR1cm4gc2FuaXRpemVkIHx8ICdVbmtub3duIGVycm9yJztcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBTVEFURVxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4vLyA9PT09PSBTVEFURSA9PT09PVxyXG5sZXQgY3VycmVudFN0YXRlID0ge1xyXG4gIGlzVW5sb2NrZWQ6IGZhbHNlLFxyXG4gIGFkZHJlc3M6IG51bGwsXHJcbiAgYmFsYW5jZTogJzAnLFxyXG4gIG5ldHdvcms6ICdwdWxzZWNoYWluJywgLy8gRGVmYXVsdCB0byBQdWxzZUNoYWluIE1haW5uZXRcclxuICBzZXNzaW9uVG9rZW46IG51bGwsIC8vIFNlc3Npb24gdG9rZW4gZm9yIGF1dGhlbnRpY2F0ZWQgb3BlcmF0aW9ucyAoc3RvcmVkIGluIG1lbW9yeSBvbmx5KVxyXG4gIHNldHRpbmdzOiB7XHJcbiAgICBhdXRvTG9ja01pbnV0ZXM6IDE1LFxyXG4gICAgc2hvd1Rlc3ROZXR3b3JrczogdHJ1ZSxcclxuICAgIGRlY2ltYWxQbGFjZXM6IDgsXHJcbiAgICB0aGVtZTogJ2hpZ2gtY29udHJhc3QnLFxyXG4gICAgbWF4R2FzUHJpY2VHd2VpOiAxMDAwIC8vIE1heGltdW0gZ2FzIHByaWNlIGluIEd3ZWkgKGRlZmF1bHQgMTAwMClcclxuICB9LFxyXG4gIG5ldHdvcmtTZXR0aW5nczogbnVsbCwgLy8gV2lsbCBiZSBsb2FkZWQgZnJvbSBzdG9yYWdlIG9yIHVzZSBkZWZhdWx0c1xyXG4gIGxhc3RBY3Rpdml0eVRpbWU6IG51bGwsIC8vIFRyYWNrIGxhc3QgYWN0aXZpdHkgZm9yIGF1dG8tbG9ja1xyXG4gIHRva2VuUHJpY2VzOiBudWxsLCAvLyBUb2tlbiBwcmljZXMgaW4gVVNEIChjYWNoZWQgZnJvbSBQdWxzZVgpXHJcbiAgY3VycmVudFRva2VuRGV0YWlsczogbnVsbCAvLyBDdXJyZW50bHkgdmlld2luZyB0b2tlbiBkZXRhaWxzXHJcbn07XHJcblxyXG4vLyBBdXRvLWxvY2sgdGltZXJcclxubGV0IGF1dG9Mb2NrVGltZXIgPSBudWxsO1xyXG5cclxuLy8gUmF0ZSBsaW1pdGluZyBmb3IgcGFzc3dvcmQgYXR0ZW1wdHNcclxuY29uc3QgUkFURV9MSU1JVF9LRVkgPSAncGFzc3dvcmRfYXR0ZW1wdHMnO1xyXG5jb25zdCBNQVhfQVRURU1QVFMgPSA1O1xyXG5jb25zdCBMT0NLT1VUX0RVUkFUSU9OX01TID0gMzAgKiA2MCAqIDEwMDA7IC8vIDMwIG1pbnV0ZXNcclxuXHJcbi8vIE5ldHdvcmsgbmFtZXMgZm9yIGRpc3BsYXlcclxuY29uc3QgTkVUV09SS19OQU1FUyA9IHtcclxuICAncHVsc2VjaGFpblRlc3RuZXQnOiAnUHVsc2VDaGFpbiBUZXN0bmV0IFY0JyxcclxuICAncHVsc2VjaGFpbic6ICdQdWxzZUNoYWluIE1haW5uZXQnLFxyXG4gICdldGhlcmV1bSc6ICdFdGhlcmV1bSBNYWlubmV0JyxcclxuICAnc2Vwb2xpYSc6ICdTZXBvbGlhIFRlc3RuZXQnXHJcbn07XHJcblxyXG5jb25zdCBCTE9DS19FWFBMT1JFUlMgPSB7XHJcbiAgJ3B1bHNlY2hhaW5UZXN0bmV0Jzoge1xyXG4gICAgYmFzZTogJ2h0dHBzOi8vc2Nhbi52NC50ZXN0bmV0LnB1bHNlY2hhaW4uY29tJyxcclxuICAgIHR4OiAnL3R4L3toYXNofScsXHJcbiAgICBhZGRyZXNzOiAnL2FkZHJlc3Mve2FkZHJlc3N9JyxcclxuICAgIHRva2VuOiAnL3Rva2VuL3thZGRyZXNzfSdcclxuICB9LFxyXG4gICdwdWxzZWNoYWluJzoge1xyXG4gICAgYmFzZTogJ2h0dHBzOi8vc2Nhbi5teXBpbmF0YS5jbG91ZC9pcGZzL2JhZnliZWllbnh5b3lyaG41dHN3Y2x2ZDNnZGp5NW10a2t3bXUzN2FxdG1sNm9uYmY3eG5iM28yMnBlLycsXHJcbiAgICB0eDogJyMvdHgve2hhc2h9JyxcclxuICAgIGFkZHJlc3M6ICcjL2FkZHJlc3Mve2FkZHJlc3N9JyxcclxuICAgIHRva2VuOiAnIy90b2tlbi97YWRkcmVzc30nXHJcbiAgfSxcclxuICAnZXRoZXJldW0nOiB7XHJcbiAgICBiYXNlOiAnaHR0cHM6Ly9ldGhlcnNjYW4uaW8nLFxyXG4gICAgdHg6ICcvdHgve2hhc2h9JyxcclxuICAgIGFkZHJlc3M6ICcvYWRkcmVzcy97YWRkcmVzc30nLFxyXG4gICAgdG9rZW46ICcvdG9rZW4ve2FkZHJlc3N9J1xyXG4gIH0sXHJcbiAgJ3NlcG9saWEnOiB7XHJcbiAgICBiYXNlOiAnaHR0cHM6Ly9zZXBvbGlhLmV0aGVyc2Nhbi5pbycsXHJcbiAgICB0eDogJy90eC97aGFzaH0nLFxyXG4gICAgYWRkcmVzczogJy9hZGRyZXNzL3thZGRyZXNzfScsXHJcbiAgICB0b2tlbjogJy90b2tlbi97YWRkcmVzc30nXHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJ1aWxkIGV4cGxvcmVyIFVSTCBmb3IgYSBzcGVjaWZpYyB0eXBlXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBVUkwgdHlwZSAoJ3R4JywgJ2FkZHJlc3MnLCAndG9rZW4nKVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgLSBUaGUgaGFzaCBvciBhZGRyZXNzIHZhbHVlXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IENvbXBsZXRlIGV4cGxvcmVyIFVSTFxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0RXhwbG9yZXJVcmwobmV0d29yaywgdHlwZSwgdmFsdWUpIHtcclxuICBjb25zdCBleHBsb3JlciA9IEJMT0NLX0VYUExPUkVSU1tuZXR3b3JrXTtcclxuICBpZiAoIWV4cGxvcmVyKSByZXR1cm4gJyc7XHJcblxyXG4gIGNvbnN0IHBhdHRlcm4gPSBleHBsb3Jlclt0eXBlXTtcclxuICBpZiAoIXBhdHRlcm4pIHJldHVybiAnJztcclxuXHJcbiAgcmV0dXJuIGV4cGxvcmVyLmJhc2UgKyBwYXR0ZXJuLnJlcGxhY2UoYHske3R5cGUgPT09ICd0eCcgPyAnaGFzaCcgOiAnYWRkcmVzcyd9fWAsIHZhbHVlKTtcclxufVxyXG5cclxuLy8gPT09PT0gSU5JVElBTElaQVRJT04gPT09PT1cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGFzeW5jICgpID0+IHtcclxuICAvLyBDaGVjayBpZiB0aGlzIGlzIGEgY29ubmVjdGlvbiBhcHByb3ZhbCByZXF1ZXN0XHJcbiAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcclxuICBjb25zdCBhY3Rpb24gPSB1cmxQYXJhbXMuZ2V0KCdhY3Rpb24nKTtcclxuICBjb25zdCBvcmlnaW4gPSB1cmxQYXJhbXMuZ2V0KCdvcmlnaW4nKTtcclxuICBjb25zdCByZXF1ZXN0SWQgPSB1cmxQYXJhbXMuZ2V0KCdyZXF1ZXN0SWQnKTtcclxuXHJcbiAgaWYgKGFjdGlvbiA9PT0gJ2Nvbm5lY3QnICYmIG9yaWdpbiAmJiByZXF1ZXN0SWQpIHtcclxuICAgIC8vIFNob3cgY29ubmVjdGlvbiBhcHByb3ZhbCBzY3JlZW5cclxuICAgIGF3YWl0IGhhbmRsZUNvbm5lY3Rpb25BcHByb3ZhbFNjcmVlbihvcmlnaW4sIHJlcXVlc3RJZCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBpZiAoYWN0aW9uID09PSAndHJhbnNhY3Rpb24nICYmIHJlcXVlc3RJZCkge1xyXG4gICAgLy8gU2hvdyB0cmFuc2FjdGlvbiBhcHByb3ZhbCBzY3JlZW5cclxuICAgIHNldHVwRXZlbnRMaXN0ZW5lcnMoKTsgLy8gU2V0IHVwIGV2ZW50IGxpc3RlbmVycyBmaXJzdFxyXG4gICAgYXdhaXQgaGFuZGxlVHJhbnNhY3Rpb25BcHByb3ZhbFNjcmVlbihyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaWYgKGFjdGlvbiA9PT0gJ2FkZFRva2VuJyAmJiByZXF1ZXN0SWQpIHtcclxuICAgIC8vIFNob3cgdG9rZW4gYWRkIGFwcHJvdmFsIHNjcmVlblxyXG4gICAgYXdhaXQgaGFuZGxlVG9rZW5BZGRBcHByb3ZhbFNjcmVlbihyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaWYgKGFjdGlvbiA9PT0gJ3NpZ24nICYmIHJlcXVlc3RJZCkge1xyXG4gICAgLy8gU2hvdyBtZXNzYWdlIHNpZ25pbmcgYXBwcm92YWwgc2NyZWVuXHJcbiAgICBhd2FpdCBoYW5kbGVNZXNzYWdlU2lnbkFwcHJvdmFsU2NyZWVuKHJlcXVlc3RJZCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBpZiAoYWN0aW9uID09PSAnc2lnblR5cGVkJyAmJiByZXF1ZXN0SWQpIHtcclxuICAgIC8vIFNob3cgdHlwZWQgZGF0YSBzaWduaW5nIGFwcHJvdmFsIHNjcmVlblxyXG4gICAgYXdhaXQgaGFuZGxlVHlwZWREYXRhU2lnbkFwcHJvdmFsU2NyZWVuKHJlcXVlc3RJZCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBOb3JtYWwgcG9wdXAgZmxvd1xyXG4gIC8vIFJ1biBtaWdyYXRpb24gZmlyc3QgKGNvbnZlcnRzIG9sZCBzaW5nbGUtd2FsbGV0IHRvIG11bHRpLXdhbGxldCBmb3JtYXQpXHJcbiAgYXdhaXQgbWlncmF0ZVRvTXVsdGlXYWxsZXQoKTtcclxuXHJcbiAgYXdhaXQgbG9hZFNldHRpbmdzKCk7XHJcbiAgYXdhaXQgbG9hZE5ldHdvcmsoKTtcclxuICBhcHBseVRoZW1lKCk7XHJcbiAgYXdhaXQgY2hlY2tXYWxsZXRTdGF0dXMoKTtcclxuICBzZXR1cEV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgdXBkYXRlTmV0d29ya0Rpc3BsYXlzKCk7XHJcbn0pO1xyXG5cclxuLy8gPT09PT0gU0NSRUVOIE5BVklHQVRJT04gPT09PT1cclxuZnVuY3Rpb24gc2hvd1NjcmVlbihzY3JlZW5JZCkge1xyXG4gIC8vIEhpZGUgYWxsIHNjcmVlbnNcclxuICBjb25zdCBzY3JlZW5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2lkXj1cInNjcmVlbi1cIl0nKTtcclxuICBzY3JlZW5zLmZvckVhY2goc2NyZWVuID0+IHNjcmVlbi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKSk7XHJcblxyXG4gIC8vIFNob3cgcmVxdWVzdGVkIHNjcmVlblxyXG4gIGNvbnN0IHNjcmVlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNjcmVlbklkKTtcclxuICBpZiAoc2NyZWVuKSB7XHJcbiAgICBzY3JlZW4uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAvLyBTY3JvbGwgdG8gdG9wIHdoZW4gc2hvd2luZyBuZXcgc2NyZWVuXHJcbiAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgMCk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBjaGVja1dhbGxldFN0YXR1cygpIHtcclxuICBjb25zdCBleGlzdHMgPSBhd2FpdCB3YWxsZXRFeGlzdHMoKTtcclxuXHJcbiAgaWYgKCFleGlzdHMpIHtcclxuICAgIC8vIE5vIHdhbGxldCAtIHNob3cgc2V0dXAgc2NyZWVuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tc2V0dXAnKTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gV2FsbGV0IGV4aXN0cyAtIHNob3cgdW5sb2NrIHNjcmVlblxyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXVubG9jaycpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gU0VUVElOR1MgPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gbG9hZFNldHRpbmdzKCkge1xyXG4gIGNvbnN0IHNhdmVkID0gYXdhaXQgbG9hZCgnc2V0dGluZ3MnKTtcclxuICBpZiAoc2F2ZWQpIHtcclxuICAgIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncyA9IHsgLi4uY3VycmVudFN0YXRlLnNldHRpbmdzLCAuLi5zYXZlZCB9O1xyXG4gIH1cclxuXHJcbiAgLy8gTG9hZCBuZXR3b3JrIHNldHRpbmdzXHJcbiAgY29uc3QgbmV0d29ya1NldHRpbmdzID0gYXdhaXQgbG9hZCgnbmV0d29ya1NldHRpbmdzJyk7XHJcbiAgaWYgKG5ldHdvcmtTZXR0aW5ncykge1xyXG4gICAgY3VycmVudFN0YXRlLm5ldHdvcmtTZXR0aW5ncyA9IG5ldHdvcmtTZXR0aW5ncztcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVTZXR0aW5ncygpIHtcclxuICBhd2FpdCBzYXZlKCdzZXR0aW5ncycsIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncyk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGxvYWROZXR3b3JrKCkge1xyXG4gIGNvbnN0IHNhdmVkID0gYXdhaXQgbG9hZCgnY3VycmVudE5ldHdvcmsnKTtcclxuICBpZiAoc2F2ZWQpIHtcclxuICAgIGN1cnJlbnRTdGF0ZS5uZXR3b3JrID0gc2F2ZWQ7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzYXZlTmV0d29yaygpIHtcclxuICBhd2FpdCBzYXZlKCdjdXJyZW50TmV0d29yaycsIGN1cnJlbnRTdGF0ZS5uZXR3b3JrKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlUaGVtZSgpIHtcclxuICAvLyBSZW1vdmUgYWxsIHRoZW1lIGNsYXNzZXNcclxuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3RoZW1lLWhpZ2gtY29udHJhc3QnLCAndGhlbWUtcHJvZmVzc2lvbmFsJywgJ3RoZW1lLWFtYmVyJywgJ3RoZW1lLWNnYScsICd0aGVtZS1jbGFzc2ljJywgJ3RoZW1lLWhlYXJ0Jyk7XHJcblxyXG4gIC8vIEFwcGx5IGN1cnJlbnQgdGhlbWVcclxuICBpZiAoY3VycmVudFN0YXRlLnNldHRpbmdzLnRoZW1lICE9PSAnaGlnaC1jb250cmFzdCcpIHtcclxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZChgdGhlbWUtJHtjdXJyZW50U3RhdGUuc2V0dGluZ3MudGhlbWV9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBFVkVOVCBMSVNURU5FUlMgPT09PT1cclxuZnVuY3Rpb24gc2V0dXBFdmVudExpc3RlbmVycygpIHtcclxuICAvLyBTZXR1cCBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNyZWF0ZS13YWxsZXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICBhd2FpdCBnZW5lcmF0ZU5ld01uZW1vbmljKCk7XHJcbiAgICB1cGRhdGVOZXR3b3JrRGlzcGxheXMoKTtcclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1jcmVhdGUnKTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1pbXBvcnQtd2FsbGV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgdXBkYXRlTmV0d29ya0Rpc3BsYXlzKCk7XHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4taW1wb3J0Jyk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIE5ldHdvcmsgc2VsZWN0aW9uIG9uIHNldHVwIHNjcmVlblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrLXNlbGVjdC1zZXR1cCcpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgY3VycmVudFN0YXRlLm5ldHdvcmsgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgIHNhdmVOZXR3b3JrKCk7XHJcbiAgICB1cGRhdGVOZXR3b3JrRGlzcGxheXMoKTtcclxuICB9KTtcclxuXHJcbiAgLy8gQ3JlYXRlIHdhbGxldCBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hrLXNhdmVkLW1uZW1vbmljJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XHJcbiAgICBjb25zdCBwYXNzd29yZENyZWF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1jcmVhdGUnKS52YWx1ZTtcclxuICAgIGNvbnN0IHBhc3N3b3JkQ29uZmlybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1jb25maXJtJykudmFsdWU7XHJcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNyZWF0ZS1zdWJtaXQnKTtcclxuXHJcbiAgICBidG4uZGlzYWJsZWQgPSAhKGUudGFyZ2V0LmNoZWNrZWQgJiYgcGFzc3dvcmRDcmVhdGUgJiYgcGFzc3dvcmRDb25maXJtICYmIHBhc3N3b3JkQ3JlYXRlID09PSBwYXNzd29yZENvbmZpcm0pO1xyXG4gIH0pO1xyXG5cclxuICBbJ3Bhc3N3b3JkLWNyZWF0ZScsICdwYXNzd29yZC1jb25maXJtJ10uZm9yRWFjaChpZCA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBjaGVja2VkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Noay1zYXZlZC1tbmVtb25pYycpLmNoZWNrZWQ7XHJcbiAgICAgIGNvbnN0IHBhc3N3b3JkQ3JlYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLWNyZWF0ZScpLnZhbHVlO1xyXG4gICAgICBjb25zdCBwYXNzd29yZENvbmZpcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtY29uZmlybScpLnZhbHVlO1xyXG4gICAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNyZWF0ZS1zdWJtaXQnKTtcclxuXHJcbiAgICAgIGJ0bi5kaXNhYmxlZCA9ICEoY2hlY2tlZCAmJiBwYXNzd29yZENyZWF0ZSAmJiBwYXNzd29yZENvbmZpcm0gJiYgcGFzc3dvcmRDcmVhdGUgPT09IHBhc3N3b3JkQ29uZmlybSk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jcmVhdGUtc3VibWl0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQ3JlYXRlV2FsbGV0KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1jcmVhdGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzaG93U2NyZWVuKCdzY3JlZW4tc2V0dXAnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20tY3JlYXRlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLXNldHVwJykpO1xyXG5cclxuICAvLyBJbXBvcnQgd2FsbGV0IHNjcmVlblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbXBvcnQtbWV0aG9kJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XHJcbiAgICBjb25zdCBtbmVtb25pY0dyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1tbmVtb25pYy1ncm91cCcpO1xyXG4gICAgY29uc3QgcHJpdmF0ZWtleUdyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1wcml2YXRla2V5LWdyb3VwJyk7XHJcblxyXG4gICAgaWYgKGUudGFyZ2V0LnZhbHVlID09PSAnbW5lbW9uaWMnKSB7XHJcbiAgICAgIG1uZW1vbmljR3JvdXAuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIHByaXZhdGVrZXlHcm91cC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG1uZW1vbmljR3JvdXAuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgIHByaXZhdGVrZXlHcm91cC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1pbXBvcnQtc3VibWl0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlSW1wb3J0V2FsbGV0KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1pbXBvcnQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzaG93U2NyZWVuKCdzY3JlZW4tc2V0dXAnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20taW1wb3J0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLXNldHVwJykpO1xyXG5cclxuICAvLyBVbmxvY2sgc2NyZWVuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi11bmxvY2snKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVVbmxvY2spO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC11bmxvY2snKT8uYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCAoZSkgPT4ge1xyXG4gICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XHJcbiAgICAgIGhhbmRsZVVubG9jaygpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBDdXN0b20gbmV0d29yayBkcm9wZG93blxyXG4gIGNvbnN0IG5ldHdvcmtTZWxlY3RDdXN0b20gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1zZWxlY3QtY3VzdG9tJyk7XHJcbiAgY29uc3QgbmV0d29ya0Ryb3Bkb3duTWVudSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrLWRyb3Bkb3duLW1lbnUnKTtcclxuXHJcbiAgLy8gSW5pdGlhbGl6ZSBkcm9wZG93biBvcHRpb24gbG9nb3NcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubmV0d29yay1vcHRpb24gaW1nJykuZm9yRWFjaChpbWcgPT4ge1xyXG4gICAgY29uc3QgbG9nb0ZpbGUgPSBpbWcuZ2V0QXR0cmlidXRlKCdkYXRhLWxvZ28nKTtcclxuICAgIGlmIChsb2dvRmlsZSkge1xyXG4gICAgICBpbWcuc3JjID0gY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBhc3NldHMvbG9nb3MvJHtsb2dvRmlsZX1gKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gVG9nZ2xlIGRyb3Bkb3duXHJcbiAgbmV0d29ya1NlbGVjdEN1c3RvbT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIG5ldHdvcmtEcm9wZG93bk1lbnUuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEhhbmRsZSBvcHRpb24gc2VsZWN0aW9uXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5ldHdvcmstb3B0aW9uJykuZm9yRWFjaChvcHRpb24gPT4ge1xyXG4gICAgb3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGUpID0+IHtcclxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgY29uc3QgbmV0d29yayA9IG9wdGlvbi5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmV0d29yaycpO1xyXG4gICAgICBjb25zdCBuZXR3b3JrVGV4dCA9IG9wdGlvbi5xdWVyeVNlbGVjdG9yKCdzcGFuJykudGV4dENvbnRlbnQ7XHJcblxyXG4gICAgICBjdXJyZW50U3RhdGUubmV0d29yayA9IG5ldHdvcms7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrLXNlbGVjdGVkLXRleHQnKS50ZXh0Q29udGVudCA9IG5ldHdvcmtUZXh0O1xyXG4gICAgICBuZXR3b3JrRHJvcGRvd25NZW51LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgc2F2ZU5ldHdvcmsoKTtcclxuICAgICAgdXBkYXRlTmV0d29ya0Rpc3BsYXlzKCk7XHJcbiAgICAgIGF3YWl0IGZldGNoQmFsYW5jZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSG92ZXIgZWZmZWN0IC0gYm9sZCB0ZXh0XHJcbiAgICBvcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHtcclxuICAgICAgb3B0aW9uLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKS5zdHlsZS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xyXG4gICAgfSk7XHJcbiAgICBvcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHtcclxuICAgICAgb3B0aW9uLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKS5zdHlsZS5mb250V2VpZ2h0ID0gJ25vcm1hbCc7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQ2xvc2UgZHJvcGRvd24gd2hlbiBjbGlja2luZyBvdXRzaWRlXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBuZXR3b3JrRHJvcGRvd25NZW51Py5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhbGxldC1zZWxlY3QnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgYXN5bmMgKGUpID0+IHtcclxuICAgIGNvbnN0IHNlbGVjdGVkV2FsbGV0SWQgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgIGlmIChzZWxlY3RlZFdhbGxldElkKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgc2V0QWN0aXZlV2FsbGV0KHNlbGVjdGVkV2FsbGV0SWQpO1xyXG4gICAgICAgIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgICAgIGN1cnJlbnRTdGF0ZS5hZGRyZXNzID0gd2FsbGV0LmFkZHJlc3M7XHJcbiAgICAgICAgYXdhaXQgdXBkYXRlRGFzaGJvYXJkKCk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgYWxlcnQoJ0Vycm9yIHN3aXRjaGluZyB3YWxsZXQ6ICcgKyBzYW5pdGl6ZUVycm9yKGVycm9yLm1lc3NhZ2UpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWxvY2snKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVMb2NrKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlZnJlc2gnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICBhd2FpdCB1cGRhdGVEYXNoYm9hcmQoKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXNldHRpbmdzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgbG9hZFNldHRpbmdzVG9VSSgpO1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXNldHRpbmdzJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tbmV0d29yay1zZXR0aW5ncycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGxvYWROZXR3b3JrU2V0dGluZ3NUb1VJKCk7XHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tbmV0d29yay1zZXR0aW5ncycpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS1uZXR3b3JrLXNldHRpbmdzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXNldHRpbmdzJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tc2F2ZS1uZXR3b3JrLXNldHRpbmdzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgYXdhaXQgc2F2ZU5ldHdvcmtTZXR0aW5ncygpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlc2V0LW5ldHdvcmstc2V0dGluZ3MnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBpZiAoY29uZmlybSgnUmVzZXQgYWxsIG5ldHdvcmsgc2V0dGluZ3MgdG8gZGVmYXVsdHM/JykpIHtcclxuICAgICAgcmVzZXROZXR3b3JrU2V0dGluZ3NUb0RlZmF1bHRzKCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LWFkZHJlc3MnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDb3B5QWRkcmVzcyk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1zZW5kJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2hvd1NlbmRTY3JlZW4pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVjZWl2ZScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3dSZWNlaXZlU2NyZWVuKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXRva2VucycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3dUb2tlbnNTY3JlZW4pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdHgtaGlzdG9yeScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3dUcmFuc2FjdGlvbkhpc3RvcnkpO1xyXG5cclxuICAvLyBTZW5kIHNjcmVlblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYmFjay1mcm9tLXNlbmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJyk7XHJcbiAgICB1cGRhdGVEYXNoYm9hcmQoKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvbmZpcm0tc2VuZCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVNlbmRUcmFuc2FjdGlvbik7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtc2VuZCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1zZW5kLW1heCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVNlbmRNYXgpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWFzc2V0LXNlbGVjdCcpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVBc3NldENoYW5nZSk7XHJcblxyXG4gIC8vIFJlY2VpdmUgc2NyZWVuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20tcmVjZWl2ZScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LXJlY2VpdmUtYWRkcmVzcycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNvcHlSZWNlaXZlQWRkcmVzcyk7XHJcblxyXG4gIC8vIFRva2VucyBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS10b2tlbnMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYWRkLWN1c3RvbS10b2tlbicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3dBZGRUb2tlbk1vZGFsKTtcclxuXHJcbiAgLy8gVG9rZW4gRGV0YWlscyBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS10b2tlbi1kZXRhaWxzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXRva2VucycpO1xyXG4gICAgYXdhaXQgcmVuZGVyVG9rZW5zU2NyZWVuKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtY29weS1hZGRyZXNzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQ29weVRva2VuRGV0YWlsc0FkZHJlc3MpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdG9rZW4tc2VuZC1tYXgnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVUb2tlblNlbmRNYXgpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdG9rZW4tc2VuZCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVRva2VuU2VuZCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtZW5hYmxlLXRvZ2dsZScpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVUb2tlbkVuYWJsZVRvZ2dsZSk7XHJcblxyXG4gIC8vIFRyYW5zYWN0aW9uIEhpc3RvcnlcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGVuZGluZy10eC1pbmRpY2F0b3InKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93VHJhbnNhY3Rpb25IaXN0b3J5KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS10eC1oaXN0b3J5Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsdGVyLWFsbC10eHMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiByZW5kZXJUcmFuc2FjdGlvbkhpc3RvcnkoJ2FsbCcpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsdGVyLXBlbmRpbmctdHhzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gcmVuZGVyVHJhbnNhY3Rpb25IaXN0b3J5KCdwZW5kaW5nJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWx0ZXItY29uZmlybWVkLXR4cycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHJlbmRlclRyYW5zYWN0aW9uSGlzdG9yeSgnY29uZmlybWVkJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xlYXItdHgtaGlzdG9yeScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNsZWFyVHJhbnNhY3Rpb25IaXN0b3J5KTtcclxuXHJcbiAgLy8gVHJhbnNhY3Rpb24gRGV0YWlsc1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYmFjay1mcm9tLXR4LWRldGFpbHMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzaG93U2NyZWVuKCdzY3JlZW4tdHgtaGlzdG9yeScpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvcHktdHgtaGFzaCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgIGNvbnN0IGhhc2ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLWhhc2gnKS50ZXh0Q29udGVudDtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGhhc2gpO1xyXG4gICAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvcHktdHgtaGFzaCcpO1xyXG4gICAgICBjb25zdCBvcmlnaW5hbFRleHQgPSBidG4udGV4dENvbnRlbnQ7XHJcbiAgICAgIGJ0bi50ZXh0Q29udGVudCA9ICdDT1BJRUQhJztcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgYnRuLnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0O1xyXG4gICAgICB9LCAyMDAwKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGFsZXJ0KCdGYWlsZWQgdG8gY29weSBoYXNoJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1zcGVlZC11cC10eCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVNwZWVkVXBUcmFuc2FjdGlvbik7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtdHgnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDYW5jZWxUcmFuc2FjdGlvbik7XHJcblxyXG4gIC8vIEFkZCB0b2tlbiBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtYWRkLXRva2VuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWFkZC10b2tlbicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2FuY2VsLWFkZC10b2tlbicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtdG9rZW4nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvbmZpcm0tYWRkLXRva2VuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQWRkQ3VzdG9tVG9rZW4pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC10b2tlbi1hZGRyZXNzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgaGFuZGxlVG9rZW5BZGRyZXNzSW5wdXQpO1xyXG5cclxuICAvLyBTZXR0aW5ncyBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS1zZXR0aW5ncycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctdGhlbWUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy50aGVtZSA9IGUudGFyZ2V0LnZhbHVlO1xyXG4gICAgYXBwbHlUaGVtZSgpO1xyXG4gICAgc2F2ZVNldHRpbmdzKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctZGVjaW1hbHMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5kZWNpbWFsUGxhY2VzID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgc2F2ZVNldHRpbmdzKCk7XHJcbiAgICB1cGRhdGVCYWxhbmNlRGlzcGxheSgpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLWF1dG9sb2NrJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XHJcbiAgICBjdXJyZW50U3RhdGUuc2V0dGluZ3MuYXV0b0xvY2tNaW51dGVzID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgc2F2ZVNldHRpbmdzKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctbWF4LWdhcy1wcmljZScpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgY3VycmVudFN0YXRlLnNldHRpbmdzLm1heEdhc1ByaWNlR3dlaSA9IHBhcnNlSW50KGUudGFyZ2V0LnZhbHVlKTtcclxuICAgIHNhdmVTZXR0aW5ncygpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLXNob3ctdGVzdG5ldHMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5zaG93VGVzdE5ldHdvcmtzID0gZS50YXJnZXQuY2hlY2tlZDtcclxuICAgIHNhdmVTZXR0aW5ncygpO1xyXG4gICAgdXBkYXRlTmV0d29ya1NlbGVjdG9yKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi12aWV3LXNlZWQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVWaWV3U2VlZCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1leHBvcnQta2V5Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlRXhwb3J0S2V5KTtcclxuXHJcbiAgLy8gUGFzc3dvcmQgcHJvbXB0IG1vZGFsXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1wYXNzd29yZC1wcm9tcHQtY29uZmlybScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1pbnB1dCcpLnZhbHVlO1xyXG4gICAgaWYgKHBhc3N3b3JkKSB7XHJcbiAgICAgIGNsb3NlUGFzc3dvcmRQcm9tcHQocGFzc3dvcmQpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXBhc3N3b3JkLXByb21wdC1jYW5jZWwnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBjbG9zZVBhc3N3b3JkUHJvbXB0KG51bGwpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLXBhc3N3b3JkLXByb21wdCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGNsb3NlUGFzc3dvcmRQcm9tcHQobnVsbCk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1wcm9tcHQtaW5wdXQnKT8uYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCAoZSkgPT4ge1xyXG4gICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XHJcbiAgICAgIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1pbnB1dCcpLnZhbHVlO1xyXG4gICAgICBpZiAocGFzc3dvcmQpIHtcclxuICAgICAgICBjbG9zZVBhc3N3b3JkUHJvbXB0KHBhc3N3b3JkKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBEaXNwbGF5IHNlY3JldCBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtZGlzcGxheS1zZWNyZXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZVNlY3JldE1vZGFsKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLWRpc3BsYXktc2VjcmV0LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlU2VjcmV0TW9kYWwpO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvcHktc2VjcmV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgY29uc3Qgc2VjcmV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpc3BsYXktc2VjcmV0LWNvbnRlbnQnKS50ZXh0Q29udGVudDtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHNlY3JldCk7XHJcbiAgICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS1zZWNyZXQnKTtcclxuICAgICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gYnRuLnRleHRDb250ZW50O1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSAnQ09QSUVEISc7XHJcbiAgICAgIGJ0bi5jbGFzc0xpc3QuYWRkKCd0ZXh0LXN1Y2Nlc3MnKTtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgYnRuLnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0O1xyXG4gICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCd0ZXh0LXN1Y2Nlc3MnKTtcclxuICAgICAgfSwgMjAwMCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBhbGVydCgnRmFpbGVkIHRvIGNvcHkgdG8gY2xpcGJvYXJkJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIC8vIE11bHRpLXdhbGxldCBtYW5hZ2VtZW50XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1tYW5hZ2Utd2FsbGV0cycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZU1hbmFnZVdhbGxldHMpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYmFjay1mcm9tLW1hbmFnZS13YWxsZXRzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLXNldHRpbmdzJykpO1xyXG5cclxuICAvLyBBZGQgd2FsbGV0IGJ1dHRvbnNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNyZWF0ZS1uZXctd2FsbGV0LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2hvd0FkZFdhbGxldE1vZGFsKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWltcG9ydC13YWxsZXQtbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93QWRkV2FsbGV0TW9kYWwpO1xyXG5cclxuICAvLyBBZGQgd2FsbGV0IG1vZGFsIC0gb3B0aW9uIHNlbGVjdGlvblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtd2FsbGV0LW9wdGlvbi1jcmVhdGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYWRkLXdhbGxldCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZ2VuZXJhdGVOZXdNbmVtb25pY011bHRpKCk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtY3JlYXRlLXdhbGxldC1tdWx0aScpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkLXdhbGxldC1vcHRpb24tbW5lbW9uaWMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYWRkLXdhbGxldCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1zZWVkLW11bHRpJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtd2FsbGV0LW9wdGlvbi1wcml2YXRla2V5Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWFkZC13YWxsZXQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1pbXBvcnQta2V5LW11bHRpJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtYWRkLXdhbGxldCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtd2FsbGV0JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIENyZWF0ZSB3YWxsZXQgbXVsdGkgbW9kYWxcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvbmZpcm0tY3JlYXRlLXdhbGxldC1tdWx0aScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNyZWF0ZU5ld1dhbGxldE11bHRpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1jcmVhdGUtd2FsbGV0LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWNyZWF0ZS13YWxsZXQtbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1uZXctd2FsbGV0LW5pY2tuYW1lJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0xLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0yLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZmljYXRpb24tZXJyb3ItbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLWNyZWF0ZS13YWxsZXQtbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtY3JlYXRlLXdhbGxldC1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LW5ldy13YWxsZXQtbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTEtbXVsdGknKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTItbXVsdGknKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTMtbXVsdGknKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmaWNhdGlvbi1lcnJvci1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBJbXBvcnQgc2VlZCBtdWx0aSBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29uZmlybS1pbXBvcnQtc2VlZC1tdWx0aScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUltcG9ydFNlZWRNdWx0aSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtaW1wb3J0LXNlZWQtbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LXNlZWQtbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtc2VlZC1uaWNrbmFtZScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXNlZWQtcGhyYXNlJykudmFsdWUgPSAnJztcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLWltcG9ydC1zZWVkLW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1zZWVkLW11bHRpJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXNlZWQtbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1zZWVkLXBocmFzZScpLnZhbHVlID0gJyc7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEltcG9ydCBwcml2YXRlIGtleSBtdWx0aSBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29uZmlybS1pbXBvcnQta2V5LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlSW1wb3J0S2V5TXVsdGkpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2FuY2VsLWltcG9ydC1rZXktbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LWtleS1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1rZXktbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1wcml2YXRlLWtleScpLnZhbHVlID0gJyc7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS1pbXBvcnQta2V5LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1rZXktbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQta2V5LW5pY2tuYW1lJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtcHJpdmF0ZS1rZXknKS52YWx1ZSA9ICcnO1xyXG4gIH0pO1xyXG5cclxuICAvLyBSZW5hbWUgd2FsbGV0IG1vZGFsXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb25maXJtLXJlbmFtZS13YWxsZXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVSZW5hbWVXYWxsZXRDb25maXJtKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1yZW5hbWUtd2FsbGV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXJlbmFtZS13YWxsZXQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGN1cnJlbnRSZW5hbWVXYWxsZXRJZCA9IG51bGw7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS1yZW5hbWUtd2FsbGV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXJlbmFtZS13YWxsZXQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGN1cnJlbnRSZW5hbWVXYWxsZXRJZCA9IG51bGw7XHJcbiAgfSk7XHJcblxyXG4gIC8vIFRyYW5zYWN0aW9uIHN1Y2Nlc3MgbW9kYWxcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLXR4LXN1Y2Nlc3MnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtdHgtc3VjY2VzcycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tb2stdHgtc3VjY2VzcycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC10eC1zdWNjZXNzJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LXR4LWhhc2gnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCB0eEhhc2ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc3VjY2Vzcy1oYXNoJykudGV4dENvbnRlbnQ7XHJcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHR4SGFzaCk7XHJcbiAgICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS10eC1oYXNoJyk7XHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGJ0bi50ZXh0Q29udGVudDtcclxuICAgICAgYnRuLnRleHRDb250ZW50ID0gJ0NvcGllZCEnO1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBidG4udGV4dENvbnRlbnQgPSBvcmlnaW5hbFRleHQ7XHJcbiAgICAgIH0sIDIwMDApO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgYWxlcnQoJ0ZhaWxlZCB0byBjb3B5IHRyYW5zYWN0aW9uIGhhc2gnKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gVHJhbnNhY3Rpb24gU3RhdHVzIEJ1dHRvbnMgKGluIGFwcHJvdmFsIHBvcHVwKVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdHgtc3RhdHVzLWV4cGxvcmVyJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgaWYgKCF0eFN0YXR1c0N1cnJlbnRIYXNoKSByZXR1cm47XHJcbiAgICBjb25zdCB1cmwgPSBnZXRFeHBsb3JlclVybChjdXJyZW50U3RhdGUubmV0d29yaywgJ3R4JywgdHhTdGF0dXNDdXJyZW50SGFzaCk7XHJcbiAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmwgfSk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtdHgtc3RhdHVzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ/Cfq4AgQ2xvc2UgYnV0dG9uIGNsaWNrZWQnKTtcclxuICAgIGlmICh0eFN0YXR1c1BvbGxJbnRlcnZhbCkge1xyXG4gICAgICBjbGVhckludGVydmFsKHR4U3RhdHVzUG9sbEludGVydmFsKTtcclxuICAgICAgdHhTdGF0dXNQb2xsSW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgd2luZG93LmNsb3NlKCk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdHgtc3RhdHVzLXNwZWVkLXVwJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKCF0eFN0YXR1c0N1cnJlbnRIYXNoIHx8ICF0eFN0YXR1c0N1cnJlbnRBZGRyZXNzKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ1NwZWVkIFVwIFRyYW5zYWN0aW9uJywgJ0VudGVyIHlvdXIgcGFzc3dvcmQgdG8gc3BlZWQgdXAgdGhpcyB0cmFuc2FjdGlvbiB3aXRoIGhpZ2hlciBnYXMgcHJpY2UgKDEuMngpJyk7XHJcbiAgICBpZiAoIXBhc3N3b3JkKSByZXR1cm47XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICAgIGNvbnN0IHNlc3Npb25SZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnQ1JFQVRFX1NFU1NJT04nLFxyXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcclxuICAgICAgICB3YWxsZXRJZDogYWN0aXZlV2FsbGV0LmlkLFxyXG4gICAgICAgIGR1cmF0aW9uTXM6IDYwMDAwXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKCFzZXNzaW9uUmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgIGFsZXJ0KCdJbnZhbGlkIHBhc3N3b3JkJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnU1BFRURfVVBfVFgnLFxyXG4gICAgICAgIGFkZHJlc3M6IHR4U3RhdHVzQ3VycmVudEFkZHJlc3MsXHJcbiAgICAgICAgdHhIYXNoOiB0eFN0YXR1c0N1cnJlbnRIYXNoLFxyXG4gICAgICAgIHNlc3Npb25Ub2tlbjogc2Vzc2lvblJlc3BvbnNlLnNlc3Npb25Ub2tlbixcclxuICAgICAgICBnYXNQcmljZU11bHRpcGxpZXI6IDEuMlxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgYWxlcnQoYFRyYW5zYWN0aW9uIHNwZWQgdXAhXFxuTmV3IFRYOiAke3Jlc3BvbnNlLnR4SGFzaC5zbGljZSgwLCAyMCl9Li4uXFxuXFxuVGhlIHdpbmRvdyB3aWxsIG5vdyBjbG9zZS5gKTtcclxuICAgICAgICBpZiAodHhTdGF0dXNQb2xsSW50ZXJ2YWwpIHtcclxuICAgICAgICAgIGNsZWFySW50ZXJ2YWwodHhTdGF0dXNQb2xsSW50ZXJ2YWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBhbGVydCgnRXJyb3Igc3BlZWRpbmcgdXAgdHJhbnNhY3Rpb246ICcgKyBzYW5pdGl6ZUVycm9yKHJlc3BvbnNlLmVycm9yKSk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGFsZXJ0KCdFcnJvcjogJyArIHNhbml0aXplRXJyb3IoZXJyb3IubWVzc2FnZSkpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXR4LXN0YXR1cy1jYW5jZWwnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICBpZiAoIXR4U3RhdHVzQ3VycmVudEhhc2ggfHwgIXR4U3RhdHVzQ3VycmVudEFkZHJlc3MpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBwYXNzd29yZCA9IGF3YWl0IHNob3dQYXNzd29yZFByb21wdCgnQ2FuY2VsIFRyYW5zYWN0aW9uJywgJ0VudGVyIHlvdXIgcGFzc3dvcmQgdG8gY2FuY2VsIHRoaXMgdHJhbnNhY3Rpb24gYnkgc2VuZGluZyBhIDAtdmFsdWUgcmVwbGFjZW1lbnQnKTtcclxuICAgIGlmICghcGFzc3dvcmQpIHJldHVybjtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBhY3RpdmVXYWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgICAgY29uc3Qgc2Vzc2lvblJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgIHR5cGU6ICdDUkVBVEVfU0VTU0lPTicsXHJcbiAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkLFxyXG4gICAgICAgIHdhbGxldElkOiBhY3RpdmVXYWxsZXQuaWQsXHJcbiAgICAgICAgZHVyYXRpb25NczogNjAwMDBcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoIXNlc3Npb25SZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgYWxlcnQoJ0ludmFsaWQgcGFzc3dvcmQnKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgIHR5cGU6ICdDQU5DRUxfVFgnLFxyXG4gICAgICAgIGFkZHJlc3M6IHR4U3RhdHVzQ3VycmVudEFkZHJlc3MsXHJcbiAgICAgICAgdHhIYXNoOiB0eFN0YXR1c0N1cnJlbnRIYXNoLFxyXG4gICAgICAgIHNlc3Npb25Ub2tlbjogc2Vzc2lvblJlc3BvbnNlLnNlc3Npb25Ub2tlblxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgYWxlcnQoYFRyYW5zYWN0aW9uIGNhbmNlbGxlZCFcXG5DYW5jZWxsYXRpb24gVFg6ICR7cmVzcG9uc2UudHhIYXNoLnNsaWNlKDAsIDIwKX0uLi5cXG5cXG5UaGUgd2luZG93IHdpbGwgbm93IGNsb3NlLmApO1xyXG4gICAgICAgIGlmICh0eFN0YXR1c1BvbGxJbnRlcnZhbCkge1xyXG4gICAgICAgICAgY2xlYXJJbnRlcnZhbCh0eFN0YXR1c1BvbGxJbnRlcnZhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGFsZXJ0KCdFcnJvciBjYW5jZWxsaW5nIHRyYW5zYWN0aW9uOiAnICsgc2FuaXRpemVFcnJvcihyZXNwb25zZS5lcnJvcikpO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBhbGVydCgnRXJyb3I6ICcgKyBzYW5pdGl6ZUVycm9yKGVycm9yLm1lc3NhZ2UpKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gR2xvYmFsIGFjdGl2aXR5IHRyYWNraW5nIGZvciBhdXRvLWxvY2tcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlc2V0QWN0aXZpdHlUaW1lcik7XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCByZXNldEFjdGl2aXR5VGltZXIpO1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHJlc2V0QWN0aXZpdHlUaW1lcik7XHJcbn1cclxuXHJcbi8vID09PT09IFdBTExFVCBDUkVBVElPTiA9PT09PVxyXG5sZXQgZ2VuZXJhdGVkTW5lbW9uaWMgPSAnJztcclxubGV0IHZlcmlmaWNhdGlvbldvcmRzID0gW107IC8vIEFycmF5IG9mIHtpbmRleCwgd29yZH0gZm9yIHZlcmlmaWNhdGlvblxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVOZXdNbmVtb25pYygpIHtcclxuICB0cnkge1xyXG4gICAgLy8gSW1wb3J0IGV0aGVycyB0byBnZW5lcmF0ZSBtbmVtb25pY1xyXG4gICAgY29uc3QgeyBldGhlcnMgfSA9IGF3YWl0IGltcG9ydCgnZXRoZXJzJyk7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUgYSByYW5kb20gd2FsbGV0IHRvIGdldCB0aGUgbW5lbW9uaWNcclxuICAgIGNvbnN0IHJhbmRvbVdhbGxldCA9IGV0aGVycy5XYWxsZXQuY3JlYXRlUmFuZG9tKCk7XHJcbiAgICBnZW5lcmF0ZWRNbmVtb25pYyA9IHJhbmRvbVdhbGxldC5tbmVtb25pYy5waHJhc2U7XHJcblxyXG4gICAgLy8gRGlzcGxheSB0aGUgbW5lbW9uaWNcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtbmVtb25pYy1kaXNwbGF5JykudGV4dENvbnRlbnQgPSBnZW5lcmF0ZWRNbmVtb25pYztcclxuXHJcbiAgICAvLyBTZXQgdXAgdmVyaWZpY2F0aW9uIChhc2sgZm9yIDMgcmFuZG9tIHdvcmRzIHVzaW5nIGNyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSByYW5kb20pXHJcbiAgICBjb25zdCB3b3JkcyA9IGdlbmVyYXRlZE1uZW1vbmljLnNwbGl0KCcgJyk7XHJcbiAgICBjb25zdCByYW5kb21CeXRlcyA9IG5ldyBVaW50OEFycmF5KDMpO1xyXG4gICAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhyYW5kb21CeXRlcyk7XHJcbiAgICBjb25zdCBpbmRpY2VzID0gW1xyXG4gICAgICByYW5kb21CeXRlc1swXSAlIDQsIC8vIFdvcmQgMS00XHJcbiAgICAgIDQgKyAocmFuZG9tQnl0ZXNbMV0gJSA0KSwgLy8gV29yZCA1LThcclxuICAgICAgOCArIChyYW5kb21CeXRlc1syXSAlIDQpIC8vIFdvcmQgOS0xMlxyXG4gICAgXTtcclxuXHJcbiAgICB2ZXJpZmljYXRpb25Xb3JkcyA9IGluZGljZXMubWFwKGkgPT4gKHsgaW5kZXg6IGksIHdvcmQ6IHdvcmRzW2ldIH0pKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIFVJIHdpdGggdGhlIHJhbmRvbSBpbmRpY2VzXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMS1udW0nKS50ZXh0Q29udGVudCA9ICh2ZXJpZmljYXRpb25Xb3Jkc1swXS5pbmRleCArIDEpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTItbnVtJykudGV4dENvbnRlbnQgPSAodmVyaWZpY2F0aW9uV29yZHNbMV0uaW5kZXggKyAxKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zLW51bScpLnRleHRDb250ZW50ID0gKHZlcmlmaWNhdGlvbldvcmRzWzJdLmluZGV4ICsgMSk7XHJcblxyXG4gICAgLy8gQ2xlYXIgdGhlIHZlcmlmaWNhdGlvbiBpbnB1dHNcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0xJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0yJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZmljYXRpb24tZXJyb3InKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2VuZXJhdGluZyBtbmVtb25pYzonLCBlcnJvcik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW5lbW9uaWMtZGlzcGxheScpLnRleHRDb250ZW50ID0gJ0Vycm9yIGdlbmVyYXRpbmcgbW5lbW9uaWMuIFBsZWFzZSB0cnkgYWdhaW4uJztcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNyZWF0ZVdhbGxldCgpIHtcclxuICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1jcmVhdGUnKS52YWx1ZTtcclxuICBjb25zdCBwYXNzd29yZENvbmZpcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtY29uZmlybScpLnZhbHVlO1xyXG4gIGNvbnN0IGVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NyZWF0ZS1lcnJvcicpO1xyXG4gIGNvbnN0IHZlcmlmaWNhdGlvbkVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmaWNhdGlvbi1lcnJvcicpO1xyXG5cclxuICAvLyBWYWxpZGF0ZVxyXG4gIGlmIChwYXNzd29yZCAhPT0gcGFzc3dvcmRDb25maXJtKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9ICdQYXNzd29yZHMgZG8gbm90IG1hdGNoJztcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gRW5zdXJlIHdlIGhhdmUgYSBtbmVtb25pY1xyXG4gIGlmICghZ2VuZXJhdGVkTW5lbW9uaWMpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gJ05vIG1uZW1vbmljIGdlbmVyYXRlZC4gUGxlYXNlIGdvIGJhY2sgYW5kIHRyeSBhZ2Fpbi4nO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBWZXJpZnkgc2VlZCBwaHJhc2Ugd29yZHNcclxuICBjb25zdCB3b3JkMSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0xJykudmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3Qgd29yZDIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMicpLnZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IHdvcmQzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTMnKS52YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaWYgKCF3b3JkMSB8fCAhd29yZDIgfHwgIXdvcmQzKSB7XHJcbiAgICB2ZXJpZmljYXRpb25FcnJvckRpdi50ZXh0Q29udGVudCA9ICdQbGVhc2UgZW50ZXIgYWxsIHZlcmlmaWNhdGlvbiB3b3JkcyB0byBjb25maXJtIHlvdSBoYXZlIGJhY2tlZCB1cCB5b3VyIHNlZWQgcGhyYXNlLic7XHJcbiAgICB2ZXJpZmljYXRpb25FcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmICh3b3JkMSAhPT0gdmVyaWZpY2F0aW9uV29yZHNbMF0ud29yZC50b0xvd2VyQ2FzZSgpIHx8XHJcbiAgICAgIHdvcmQyICE9PSB2ZXJpZmljYXRpb25Xb3Jkc1sxXS53b3JkLnRvTG93ZXJDYXNlKCkgfHxcclxuICAgICAgd29yZDMgIT09IHZlcmlmaWNhdGlvbldvcmRzWzJdLndvcmQudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYudGV4dENvbnRlbnQgPSAnVmVyaWZpY2F0aW9uIHdvcmRzIGRvIG5vdCBtYXRjaC4gUGxlYXNlIGRvdWJsZS1jaGVjayB5b3VyIHNlZWQgcGhyYXNlIGJhY2t1cC4nO1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB2ZXJpZmljYXRpb25FcnJvckRpdi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAvLyBJbXBvcnQgd2FsbGV0IGZyb20gdGhlIG1uZW1vbmljIHdlIGFscmVhZHkgZ2VuZXJhdGVkXHJcbiAgICBjb25zdCB7IGFkZHJlc3MgfSA9IGF3YWl0IGltcG9ydEZyb21NbmVtb25pYyhnZW5lcmF0ZWRNbmVtb25pYywgcGFzc3dvcmQpO1xyXG5cclxuICAgIC8vIFN1Y2Nlc3MhIE5hdmlnYXRlIHRvIGRhc2hib2FyZFxyXG4gICAgYWxlcnQoJ1dhbGxldCBjcmVhdGVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuICAgIGN1cnJlbnRTdGF0ZS5hZGRyZXNzID0gYWRkcmVzcztcclxuICAgIGN1cnJlbnRTdGF0ZS5pc1VubG9ja2VkID0gdHJ1ZTtcclxuICAgIGN1cnJlbnRTdGF0ZS5sYXN0QWN0aXZpdHlUaW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAvLyBTdGFydCBhdXRvLWxvY2sgdGltZXJcclxuICAgIHN0YXJ0QXV0b0xvY2tUaW1lcigpO1xyXG5cclxuICAgIC8vIENsZWFyIHRoZSBnZW5lcmF0ZWQgbW5lbW9uaWMgZnJvbSBtZW1vcnkgZm9yIHNlY3VyaXR5XHJcbiAgICBnZW5lcmF0ZWRNbmVtb25pYyA9ICcnO1xyXG4gICAgdmVyaWZpY2F0aW9uV29yZHMgPSBbXTtcclxuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJyk7XHJcbiAgICB1cGRhdGVEYXNoYm9hcmQoKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBXQUxMRVQgSU1QT1JUID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUltcG9ydFdhbGxldCgpIHtcclxuICBjb25zdCBtZXRob2QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1wb3J0LW1ldGhvZCcpLnZhbHVlO1xyXG4gIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLWltcG9ydCcpLnZhbHVlO1xyXG4gIGNvbnN0IHBhc3N3b3JkQ29uZmlybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1pbXBvcnQtY29uZmlybScpLnZhbHVlO1xyXG4gIGNvbnN0IGVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1lcnJvcicpO1xyXG5cclxuICAvLyBWYWxpZGF0ZVxyXG4gIGlmIChwYXNzd29yZCAhPT0gcGFzc3dvcmRDb25maXJtKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9ICdQYXNzd29yZHMgZG8gbm90IG1hdGNoJztcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgIGxldCBhZGRyZXNzO1xyXG4gICAgaWYgKG1ldGhvZCA9PT0gJ21uZW1vbmljJykge1xyXG4gICAgICBjb25zdCBtbmVtb25pYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbXBvcnQtbW5lbW9uaWMnKS52YWx1ZTtcclxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaW1wb3J0RnJvbU1uZW1vbmljKG1uZW1vbmljLCBwYXNzd29yZCk7XHJcbiAgICAgIGFkZHJlc3MgPSByZXN1bHQuYWRkcmVzcztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IHByaXZhdGVLZXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1wb3J0LXByaXZhdGVrZXknKS52YWx1ZTtcclxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaW1wb3J0RnJvbVByaXZhdGVLZXkocHJpdmF0ZUtleSwgcGFzc3dvcmQpO1xyXG4gICAgICBhZGRyZXNzID0gcmVzdWx0LmFkZHJlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3VjY2VzcyFcclxuICAgIGFsZXJ0KCdXYWxsZXQgaW1wb3J0ZWQgc3VjY2Vzc2Z1bGx5IScpO1xyXG4gICAgY3VycmVudFN0YXRlLmFkZHJlc3MgPSBhZGRyZXNzO1xyXG4gICAgY3VycmVudFN0YXRlLmlzVW5sb2NrZWQgPSB0cnVlO1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpO1xyXG4gICAgdXBkYXRlRGFzaGJvYXJkKCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gVU5MT0NLID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVVubG9jaygpIHtcclxuICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC11bmxvY2snKS52YWx1ZTtcclxuICBjb25zdCBlcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1bmxvY2stZXJyb3InKTtcclxuXHJcbiAgLy8gQ2hlY2sgaWYgbG9ja2VkIG91dCBkdWUgdG8gdG9vIG1hbnkgZmFpbGVkIGF0dGVtcHRzXHJcbiAgY29uc3QgbG9ja291dEluZm8gPSBhd2FpdCBjaGVja1JhdGVMaW1pdExvY2tvdXQoKTtcclxuICBpZiAobG9ja291dEluZm8uaXNMb2NrZWRPdXQpIHtcclxuICAgIGNvbnN0IHJlbWFpbmluZ01pbnV0ZXMgPSBNYXRoLmNlaWwobG9ja291dEluZm8ucmVtYWluaW5nTXMgLyAxMDAwIC8gNjApO1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBgVG9vIG1hbnkgZmFpbGVkIGF0dGVtcHRzLiBQbGVhc2Ugd2FpdCAke3JlbWFpbmluZ01pbnV0ZXN9IG1pbnV0ZShzKSBiZWZvcmUgdHJ5aW5nIGFnYWluLmA7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAvLyBVbmxvY2sgd2FsbGV0IHdpdGggYXV0by11cGdyYWRlIG5vdGlmaWNhdGlvblxyXG4gICAgY29uc3QgeyBhZGRyZXNzLCBzaWduZXIsIHVwZ3JhZGVkLCBpdGVyYXRpb25zQmVmb3JlLCBpdGVyYXRpb25zQWZ0ZXIgfSA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICBvblVwZ3JhZGVTdGFydDogKGluZm8pID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhg8J+UkCBBdXRvLXVwZ3JhZGluZyB3YWxsZXQgZW5jcnlwdGlvbjogJHtpbmZvLmN1cnJlbnRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IGl0ZXJhdGlvbnNgKTtcclxuICAgICAgICAvLyBTaG93IHZpc3VhbCBmZWVkYmFjayBpbiBVSVxyXG4gICAgICAgIGNvbnN0IHN0YXR1c0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIHN0YXR1c0Rpdi5jbGFzc05hbWUgPSAnc3RhdHVzLW1lc3NhZ2UgaW5mbyc7XHJcbiAgICAgICAgc3RhdHVzRGl2LnRleHRDb250ZW50ID0gYPCflJAgVXBncmFkaW5nIHdhbGxldCBzZWN1cml0eSB0byAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IGl0ZXJhdGlvbnMuLi5gO1xyXG4gICAgICAgIGVycm9yRGl2LnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHN0YXR1c0RpdiwgZXJyb3JEaXYpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gc3RhdHVzRGl2LnJlbW92ZSgpLCAzMDAwKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2hvdyB1cGdyYWRlIGNvbXBsZXRpb24gbWVzc2FnZSBpZiB3YWxsZXQgd2FzIHVwZ3JhZGVkXHJcbiAgICBpZiAodXBncmFkZWQpIHtcclxuICAgICAgY29uc29sZS5sb2coYOKchSBXYWxsZXQgdXBncmFkZWQ6ICR7aXRlcmF0aW9uc0JlZm9yZS50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpdGVyYXRpb25zQWZ0ZXIudG9Mb2NhbGVTdHJpbmcoKX0gaXRlcmF0aW9uc2ApO1xyXG4gICAgICBjb25zdCBzdGF0dXNEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgc3RhdHVzRGl2LmNsYXNzTmFtZSA9ICdzdGF0dXMtbWVzc2FnZSBzdWNjZXNzJztcclxuICAgICAgc3RhdHVzRGl2LnRleHRDb250ZW50ID0gYOKchSBTZWN1cml0eSB1cGdyYWRlZDogJHtpdGVyYXRpb25zQmVmb3JlLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2l0ZXJhdGlvbnNBZnRlci50b0xvY2FsZVN0cmluZygpfSBpdGVyYXRpb25zYDtcclxuICAgICAgZXJyb3JEaXYucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoc3RhdHVzRGl2LCBlcnJvckRpdik7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gc3RhdHVzRGl2LnJlbW92ZSgpLCA1MDAwKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTdWNjZXNzISBDbGVhciBmYWlsZWQgYXR0ZW1wdHNcclxuICAgIGF3YWl0IGNsZWFyRmFpbGVkQXR0ZW1wdHMoKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgc2Vzc2lvbiB0b2tlbiBpbiBzZXJ2aWNlIHdvcmtlclxyXG4gICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBjb25zdCBkdXJhdGlvbk1zID0gY3VycmVudFN0YXRlLnNldHRpbmdzLmF1dG9Mb2NrTWludXRlcyAqIDYwICogMTAwMDtcclxuICAgIGNvbnN0IHNlc3Npb25SZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0NSRUFURV9TRVNTSU9OJyxcclxuICAgICAgcGFzc3dvcmQsXHJcbiAgICAgIHdhbGxldElkOiBhY3RpdmVXYWxsZXQuaWQsXHJcbiAgICAgIGR1cmF0aW9uTXNcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghc2Vzc2lvblJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIHNlc3Npb24nKTtcclxuICAgIH1cclxuXHJcbiAgICBjdXJyZW50U3RhdGUuaXNVbmxvY2tlZCA9IHRydWU7XHJcbiAgICBjdXJyZW50U3RhdGUuYWRkcmVzcyA9IGFkZHJlc3M7XHJcbiAgICBjdXJyZW50U3RhdGUuc2Vzc2lvblRva2VuID0gc2Vzc2lvblJlc3BvbnNlLnNlc3Npb25Ub2tlbjtcclxuICAgIGN1cnJlbnRTdGF0ZS5sYXN0QWN0aXZpdHlUaW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAvLyBTdGFydCBhdXRvLWxvY2sgdGltZXJcclxuICAgIHN0YXJ0QXV0b0xvY2tUaW1lcigpO1xyXG5cclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKTtcclxuICAgIHVwZGF0ZURhc2hib2FyZCgpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAvLyBSZWNvcmQgZmFpbGVkIGF0dGVtcHRcclxuICAgIGF3YWl0IHJlY29yZEZhaWxlZEF0dGVtcHQoKTtcclxuXHJcbiAgICAvLyBDaGVjayBpZiBub3cgbG9ja2VkIG91dFxyXG4gICAgY29uc3QgbmV3TG9ja291dEluZm8gPSBhd2FpdCBjaGVja1JhdGVMaW1pdExvY2tvdXQoKTtcclxuICAgIGlmIChuZXdMb2Nrb3V0SW5mby5pc0xvY2tlZE91dCkge1xyXG4gICAgICBjb25zdCByZW1haW5pbmdNaW51dGVzID0gTWF0aC5jZWlsKG5ld0xvY2tvdXRJbmZvLnJlbWFpbmluZ01zIC8gMTAwMCAvIDYwKTtcclxuICAgICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBgVG9vIG1hbnkgZmFpbGVkIGF0dGVtcHRzICgke01BWF9BVFRFTVBUU30pLiBXYWxsZXQgbG9ja2VkIGZvciAke3JlbWFpbmluZ01pbnV0ZXN9IG1pbnV0ZXMuYDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGF0dGVtcHRzTGVmdCA9IE1BWF9BVFRFTVBUUyAtIG5ld0xvY2tvdXRJbmZvLmF0dGVtcHRzO1xyXG4gICAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9IGAke2Vycm9yLm1lc3NhZ2V9ICgke2F0dGVtcHRzTGVmdH0gYXR0ZW1wdCR7YXR0ZW1wdHNMZWZ0ICE9PSAxID8gJ3MnIDogJyd9IHJlbWFpbmluZylgO1xyXG4gICAgfVxyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBMT0NLID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUxvY2soKSB7XHJcbiAgLy8gSW52YWxpZGF0ZSBzZXNzaW9uIGluIHNlcnZpY2Ugd29ya2VyXHJcbiAgaWYgKGN1cnJlbnRTdGF0ZS5zZXNzaW9uVG9rZW4pIHtcclxuICAgIGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0lOVkFMSURBVEVfU0VTU0lPTicsXHJcbiAgICAgIHNlc3Npb25Ub2tlbjogY3VycmVudFN0YXRlLnNlc3Npb25Ub2tlblxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBjdXJyZW50U3RhdGUuaXNVbmxvY2tlZCA9IGZhbHNlO1xyXG4gIGN1cnJlbnRTdGF0ZS5hZGRyZXNzID0gbnVsbDtcclxuICBjdXJyZW50U3RhdGUuc2Vzc2lvblRva2VuID0gbnVsbDtcclxuICBjdXJyZW50U3RhdGUubGFzdEFjdGl2aXR5VGltZSA9IG51bGw7XHJcbiAgc3RvcEF1dG9Mb2NrVGltZXIoKTtcclxuICBzaG93U2NyZWVuKCdzY3JlZW4tdW5sb2NrJyk7XHJcbn1cclxuXHJcbi8vID09PT09IEFVVE8tTE9DSyBUSU1FUiA9PT09PVxyXG5mdW5jdGlvbiBzdGFydEF1dG9Mb2NrVGltZXIoKSB7XHJcbiAgc3RvcEF1dG9Mb2NrVGltZXIoKTsgLy8gQ2xlYXIgYW55IGV4aXN0aW5nIHRpbWVyXHJcblxyXG4gIGNvbnN0IGNoZWNrSW50ZXJ2YWwgPSAxMDAwMDsgLy8gQ2hlY2sgZXZlcnkgMTAgc2Vjb25kc1xyXG5cclxuICBhdXRvTG9ja1RpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgaWYgKCFjdXJyZW50U3RhdGUuaXNVbmxvY2tlZCB8fCAhY3VycmVudFN0YXRlLmxhc3RBY3Rpdml0eVRpbWUpIHtcclxuICAgICAgc3RvcEF1dG9Mb2NrVGltZXIoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGlkbGVUaW1lID0gRGF0ZS5ub3coKSAtIGN1cnJlbnRTdGF0ZS5sYXN0QWN0aXZpdHlUaW1lO1xyXG4gICAgY29uc3QgYXV0b0xvY2tNcyA9IGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5hdXRvTG9ja01pbnV0ZXMgKiA2MCAqIDEwMDA7XHJcblxyXG4gICAgaWYgKGlkbGVUaW1lID49IGF1dG9Mb2NrTXMpIHtcclxuICAgICAgLy8gQXV0by1sb2NraW5nIHdhbGxldFxyXG4gICAgICBoYW5kbGVMb2NrKCk7XHJcbiAgICB9XHJcbiAgfSwgY2hlY2tJbnRlcnZhbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0b3BBdXRvTG9ja1RpbWVyKCkge1xyXG4gIGlmIChhdXRvTG9ja1RpbWVyKSB7XHJcbiAgICBjbGVhckludGVydmFsKGF1dG9Mb2NrVGltZXIpO1xyXG4gICAgYXV0b0xvY2tUaW1lciA9IG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZXNldEFjdGl2aXR5VGltZXIoKSB7XHJcbiAgaWYgKGN1cnJlbnRTdGF0ZS5pc1VubG9ja2VkKSB7XHJcbiAgICBjdXJyZW50U3RhdGUubGFzdEFjdGl2aXR5VGltZSA9IERhdGUubm93KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBSQVRFIExJTUlUSU5HID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIHJlY29yZEZhaWxlZEF0dGVtcHQoKSB7XHJcbiAgY29uc3QgZGF0YSA9IGF3YWl0IGxvYWQoUkFURV9MSU1JVF9LRVkpIHx8IHsgYXR0ZW1wdHM6IDAsIGZpcnN0QXR0ZW1wdFRpbWU6IERhdGUubm93KCkgfTtcclxuXHJcbiAgLy8gSWYgZmlyc3QgYXR0ZW1wdCBvciBhdHRlbXB0cyBoYXZlIGV4cGlyZWQsIHJlc2V0XHJcbiAgY29uc3QgdGltZVNpbmNlRmlyc3QgPSBEYXRlLm5vdygpIC0gZGF0YS5maXJzdEF0dGVtcHRUaW1lO1xyXG4gIGlmIChkYXRhLmF0dGVtcHRzID09PSAwIHx8IHRpbWVTaW5jZUZpcnN0ID4gTE9DS09VVF9EVVJBVElPTl9NUykge1xyXG4gICAgZGF0YS5hdHRlbXB0cyA9IDE7XHJcbiAgICBkYXRhLmZpcnN0QXR0ZW1wdFRpbWUgPSBEYXRlLm5vdygpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBkYXRhLmF0dGVtcHRzICs9IDE7XHJcbiAgfVxyXG5cclxuICBhd2FpdCBzYXZlKFJBVEVfTElNSVRfS0VZLCBkYXRhKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY2hlY2tSYXRlTGltaXRMb2Nrb3V0KCkge1xyXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBsb2FkKFJBVEVfTElNSVRfS0VZKTtcclxuXHJcbiAgaWYgKCFkYXRhIHx8IGRhdGEuYXR0ZW1wdHMgPT09IDApIHtcclxuICAgIHJldHVybiB7IGlzTG9ja2VkT3V0OiBmYWxzZSwgYXR0ZW1wdHM6IDAsIHJlbWFpbmluZ01zOiAwIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB0aW1lU2luY2VGaXJzdCA9IERhdGUubm93KCkgLSBkYXRhLmZpcnN0QXR0ZW1wdFRpbWU7XHJcblxyXG4gIC8vIElmIGxvY2tvdXQgcGVyaW9kIGhhcyBleHBpcmVkLCBjbGVhciBhdHRlbXB0c1xyXG4gIGlmICh0aW1lU2luY2VGaXJzdCA+IExPQ0tPVVRfRFVSQVRJT05fTVMpIHtcclxuICAgIGF3YWl0IGNsZWFyRmFpbGVkQXR0ZW1wdHMoKTtcclxuICAgIHJldHVybiB7IGlzTG9ja2VkT3V0OiBmYWxzZSwgYXR0ZW1wdHM6IDAsIHJlbWFpbmluZ01zOiAwIH07XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiBsb2NrZWQgb3V0XHJcbiAgaWYgKGRhdGEuYXR0ZW1wdHMgPj0gTUFYX0FUVEVNUFRTKSB7XHJcbiAgICBjb25zdCByZW1haW5pbmdNcyA9IExPQ0tPVVRfRFVSQVRJT05fTVMgLSB0aW1lU2luY2VGaXJzdDtcclxuICAgIHJldHVybiB7IGlzTG9ja2VkT3V0OiB0cnVlLCBhdHRlbXB0czogZGF0YS5hdHRlbXB0cywgcmVtYWluaW5nTXMgfTtcclxuICB9XHJcblxyXG4gIHJldHVybiB7IGlzTG9ja2VkT3V0OiBmYWxzZSwgYXR0ZW1wdHM6IGRhdGEuYXR0ZW1wdHMsIHJlbWFpbmluZ01zOiAwIH07XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGNsZWFyRmFpbGVkQXR0ZW1wdHMoKSB7XHJcbiAgYXdhaXQgc2F2ZShSQVRFX0xJTUlUX0tFWSwgeyBhdHRlbXB0czogMCwgZmlyc3RBdHRlbXB0VGltZTogMCB9KTtcclxufVxyXG5cclxuLy8gPT09PT0gREFTSEJPQVJEID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZURhc2hib2FyZCgpIHtcclxuICAvLyBVcGRhdGUgYWRkcmVzcyBkaXNwbGF5XHJcbiAgY29uc3QgYWRkcmVzc0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhbGxldC1hZGRyZXNzJyk7XHJcbiAgaWYgKGFkZHJlc3NFbCAmJiBjdXJyZW50U3RhdGUuYWRkcmVzcykge1xyXG4gICAgYWRkcmVzc0VsLnRleHRDb250ZW50ID0gc2hvcnRlbkFkZHJlc3MoY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gIH1cclxuXHJcbiAgLy8gRmV0Y2ggYW5kIHVwZGF0ZSBiYWxhbmNlXHJcbiAgYXdhaXQgZmV0Y2hCYWxhbmNlKCk7XHJcblxyXG4gIC8vIEZldGNoIGFuZCB1cGRhdGUgdG9rZW4gcHJpY2VzIChhc3luYywgZG9uJ3QgYmxvY2sgZGFzaGJvYXJkIGxvYWQpXHJcbiAgZmV0Y2hBbmRVcGRhdGVQcmljZXMoKTtcclxuXHJcbiAgLy8gVXBkYXRlIG5ldHdvcmsgc2VsZWN0b3JcclxuICB1cGRhdGVOZXR3b3JrU2VsZWN0b3IoKTtcclxuICB1cGRhdGVOZXR3b3JrRGlzcGxheXMoKTtcclxuXHJcbiAgLy8gVXBkYXRlIHdhbGxldCBzZWxlY3RvclxyXG4gIGF3YWl0IHVwZGF0ZVdhbGxldFNlbGVjdG9yKCk7XHJcblxyXG4gIC8vIFVwZGF0ZSBwZW5kaW5nIHRyYW5zYWN0aW9uIGluZGljYXRvclxyXG4gIGF3YWl0IHVwZGF0ZVBlbmRpbmdUeEluZGljYXRvcigpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVSZWNlbnRUcmFuc2FjdGlvbnMoKSB7XHJcbiAgY29uc3QgdHhMaXN0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtbGlzdCcpO1xyXG4gIGlmICghdHhMaXN0RWwgfHwgIWN1cnJlbnRTdGF0ZS5hZGRyZXNzKSByZXR1cm47XHJcblxyXG4gIC8vIFNob3cgbG9hZGluZyBzdGF0ZVxyXG4gIHR4TGlzdEVsLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtZGltXCI+TG9hZGluZyB0cmFuc2FjdGlvbnMuLi48L3A+JztcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHRyYW5zYWN0aW9ucyA9IGF3YWl0IHJwYy5nZXRSZWNlbnRUcmFuc2FjdGlvbnMoY3VycmVudFN0YXRlLm5ldHdvcmssIGN1cnJlbnRTdGF0ZS5hZGRyZXNzLCAzLCAxMDAwKTtcclxuXHJcbiAgICBpZiAodHJhbnNhY3Rpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICB0eExpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPk5vIHJlY2VudCB0cmFuc2FjdGlvbnM8L3A+JztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBodG1sID0gJyc7XHJcblxyXG4gICAgZm9yIChjb25zdCB0eCBvZiB0cmFuc2FjdGlvbnMpIHtcclxuICAgICAgY29uc3QgdmFsdWVFdGggPSBldGhlcnMuZm9ybWF0RXRoZXIodHgudmFsdWUpO1xyXG4gICAgICBjb25zdCBmb3JtYXR0ZWQgPSBmb3JtYXRCYWxhbmNlV2l0aENvbW1hcyh2YWx1ZUV0aCwgMTgpO1xyXG4gICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUodHgudGltZXN0YW1wICogMTAwMCkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XHJcbiAgICAgIGNvbnN0IHR5cGUgPSB0eC50eXBlID09PSAnc2VudCcgPyAn4oaSJyA6ICfihpAnO1xyXG4gICAgICBjb25zdCB0eXBlQ29sb3IgPSB0eC50eXBlID09PSAnc2VudCcgPyAnI2ZmNDQ0NCcgOiAnIzQ0ZmY0NCc7XHJcbiAgICAgIGNvbnN0IGV4cGxvcmVyVXJsID0gZ2V0RXhwbG9yZXJVcmwoY3VycmVudFN0YXRlLm5ldHdvcmssICd0eCcsIHR4Lmhhc2gpO1xyXG5cclxuICAgICAgaHRtbCArPSBgXHJcbiAgICAgICAgPGRpdiBzdHlsZT1cInBhZGRpbmc6IDhweDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRlcm1pbmFsLWJvcmRlcik7IGZvbnQtc2l6ZTogMTFweDtcIj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IG1hcmdpbi1ib3R0b206IDRweDtcIj5cclxuICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJjb2xvcjogJHt0eXBlQ29sb3J9O1wiPiR7dHlwZX0gJHt0eC50eXBlID09PSAnc2VudCcgPyAnU2VudCcgOiAnUmVjZWl2ZWQnfTwvc3Bhbj5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LWRpbVwiPiR7ZGF0ZX08L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+XHJcbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC13ZWlnaHQ6IGJvbGQ7XCIgdGl0bGU9XCIke2Zvcm1hdHRlZC50b29sdGlwfVwiPiR7Zm9ybWF0dGVkLmRpc3BsYXl9PC9zcGFuPlxyXG4gICAgICAgICAgICA8YSBocmVmPVwiJHtleHBsb3JlclVybH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiBzdHlsZT1cImNvbG9yOiB2YXIoLS10ZXJtaW5hbC1ncmVlbik7IHRleHQtZGVjb3JhdGlvbjogbm9uZTsgZm9udC1zaXplOiAxMHB4O1wiPlZJRVcg4oaSPC9hPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIGA7XHJcbiAgICB9XHJcblxyXG4gICAgdHhMaXN0RWwuaW5uZXJIVE1MID0gaHRtbDtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdHJhbnNhY3Rpb25zOicsIGVycm9yKTtcclxuICAgIHR4TGlzdEVsLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtZGltXCI+RXJyb3IgbG9hZGluZyB0cmFuc2FjdGlvbnM8L3A+JztcclxuICB9XHJcbn1cclxuXHJcbi8vIFVwZGF0ZSB3YWxsZXQgc2VsZWN0b3IgZHJvcGRvd25cclxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlV2FsbGV0U2VsZWN0b3IoKSB7XHJcbiAgY29uc3Qgd2FsbGV0U2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhbGxldC1zZWxlY3QnKTtcclxuICBpZiAoIXdhbGxldFNlbGVjdCkgcmV0dXJuO1xyXG5cclxuICBjb25zdCB3YWxsZXRzRGF0YSA9IGF3YWl0IGdldEFsbFdhbGxldHMoKTtcclxuXHJcbiAgaWYgKHdhbGxldHNEYXRhLndhbGxldExpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICB3YWxsZXRTZWxlY3QuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJcIj5ObyB3YWxsZXRzPC9vcHRpb24+JztcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHdhbGxldFNlbGVjdC5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgd2FsbGV0c0RhdGEud2FsbGV0TGlzdC5mb3JFYWNoKHdhbGxldCA9PiB7XHJcbiAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuICAgIG9wdGlvbi52YWx1ZSA9IHdhbGxldC5pZDtcclxuICAgIG9wdGlvbi50ZXh0Q29udGVudCA9IHdhbGxldC5uaWNrbmFtZSB8fCAnVW5uYW1lZCBXYWxsZXQnO1xyXG5cclxuICAgIGlmICh3YWxsZXQuaWQgPT09IHdhbGxldHNEYXRhLmFjdGl2ZVdhbGxldElkKSB7XHJcbiAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgd2FsbGV0U2VsZWN0LmFwcGVuZENoaWxkKG9wdGlvbik7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIFVwZGF0ZSBuZXR3b3JrIGRpc3BsYXlzIGFjcm9zcyBhbGwgc2NyZWVuc1xyXG5mdW5jdGlvbiB1cGRhdGVOZXR3b3JrRGlzcGxheXMoKSB7XHJcbiAgY29uc3QgbmV0d29ya05hbWUgPSBORVRXT1JLX05BTUVTW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXSB8fCAnVW5rbm93biBOZXR3b3JrJztcclxuXHJcbiAgLy8gU2V0dXAgc2NyZWVuIHNlbGVjdG9yXHJcbiAgY29uc3Qgc2V0dXBTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1zZWxlY3Qtc2V0dXAnKTtcclxuICBpZiAoc2V0dXBTZWxlY3QpIHtcclxuICAgIHNldHVwU2VsZWN0LnZhbHVlID0gY3VycmVudFN0YXRlLm5ldHdvcms7XHJcbiAgfVxyXG5cclxuICAvLyBDcmVhdGUgc2NyZWVuIGRpc3BsYXlcclxuICBjb25zdCBjcmVhdGVEaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmstZGlzcGxheS1jcmVhdGUnKTtcclxuICBpZiAoY3JlYXRlRGlzcGxheSkge1xyXG4gICAgY3JlYXRlRGlzcGxheS50ZXh0Q29udGVudCA9IG5ldHdvcmtOYW1lO1xyXG4gIH1cclxuXHJcbiAgLy8gSW1wb3J0IHNjcmVlbiBkaXNwbGF5XHJcbiAgY29uc3QgaW1wb3J0RGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrLWRpc3BsYXktaW1wb3J0Jyk7XHJcbiAgaWYgKGltcG9ydERpc3BsYXkpIHtcclxuICAgIGltcG9ydERpc3BsYXkudGV4dENvbnRlbnQgPSBuZXR3b3JrTmFtZTtcclxuICB9XHJcblxyXG4gIC8vIERhc2hib2FyZCBjdXN0b20gZHJvcGRvd25cclxuICBjb25zdCBuZXR3b3JrU2VsZWN0ZWRUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmstc2VsZWN0ZWQtdGV4dCcpO1xyXG4gIGlmIChuZXR3b3JrU2VsZWN0ZWRUZXh0KSB7XHJcbiAgICBuZXR3b3JrU2VsZWN0ZWRUZXh0LnRleHRDb250ZW50ID0gbmV0d29ya05hbWU7XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGUgbmV0d29yayBzZWxlY3RvciBsb2dvXHJcbiAgY29uc3Qgc2VsZWN0b3JMb2dvRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1zZWxlY3Rvci1sb2dvJyk7XHJcbiAgaWYgKHNlbGVjdG9yTG9nb0VsKSB7XHJcbiAgICBjb25zdCBuZXR3b3JrTG9nb3MgPSB7XHJcbiAgICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICdwbHMucG5nJyxcclxuICAgICAgJ3B1bHNlY2hhaW4nOiAncGxzLnBuZycsXHJcbiAgICAgICdldGhlcmV1bSc6ICdldGgucG5nJyxcclxuICAgICAgJ3NlcG9saWEnOiAnZXRoLnBuZydcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgbG9nb0ZpbGUgPSBuZXR3b3JrTG9nb3NbY3VycmVudFN0YXRlLm5ldHdvcmtdO1xyXG4gICAgaWYgKGxvZ29GaWxlKSB7XHJcbiAgICAgIHNlbGVjdG9yTG9nb0VsLnNyYyA9IGNocm9tZS5ydW50aW1lLmdldFVSTChgYXNzZXRzL2xvZ29zLyR7bG9nb0ZpbGV9YCk7XHJcbiAgICAgIHNlbGVjdG9yTG9nb0VsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZWN0b3JMb2dvRWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGZldGNoQmFsYW5jZSgpIHtcclxuICBpZiAoIWN1cnJlbnRTdGF0ZS5hZGRyZXNzKSB7XHJcbiAgICBjdXJyZW50U3RhdGUuYmFsYW5jZSA9ICcwJztcclxuICAgIHVwZGF0ZUJhbGFuY2VEaXNwbGF5KCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgYmFsYW5jZVdlaSA9IGF3YWl0IHJwYy5nZXRCYWxhbmNlKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCBjdXJyZW50U3RhdGUuYWRkcmVzcyk7XHJcbiAgICBjdXJyZW50U3RhdGUuYmFsYW5jZSA9IHJwYy5mb3JtYXRCYWxhbmNlKGJhbGFuY2VXZWksIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5kZWNpbWFsUGxhY2VzKTtcclxuICAgIHVwZGF0ZUJhbGFuY2VEaXNwbGF5KCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGJhbGFuY2U6JywgZXJyb3IpO1xyXG4gICAgLy8gS2VlcCBwcmV2aW91cyBiYWxhbmNlIG9uIGVycm9yXHJcbiAgICB1cGRhdGVCYWxhbmNlRGlzcGxheSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdHMgYSBiYWxhbmNlIHN0cmluZyB3aXRoIGNvbW1hcyBhbmQgcmV0dXJucyBkaXNwbGF5ICsgdG9vbHRpcCB2YWx1ZXNcclxuICogQHBhcmFtIHtzdHJpbmd9IGJhbGFuY2VTdHJpbmcgLSBCYWxhbmNlIGFzIHN0cmluZyAoZS5nLiwgXCIxMjM0LjU2NzhcIilcclxuICogQHBhcmFtIHtudW1iZXJ9IGZ1bGxEZWNpbWFscyAtIEZ1bGwgcHJlY2lzaW9uIGRlY2ltYWxzIChkZWZhdWx0IDE4KVxyXG4gKiBAcmV0dXJucyB7e2Rpc3BsYXk6IHN0cmluZywgdG9vbHRpcDogc3RyaW5nfX1cclxuICovXHJcbmZ1bmN0aW9uIGZvcm1hdEJhbGFuY2VXaXRoQ29tbWFzKGJhbGFuY2VTdHJpbmcsIGZ1bGxEZWNpbWFscyA9IDE4KSB7XHJcbiAgY29uc3QgYmFsYW5jZSA9IHBhcnNlRmxvYXQoYmFsYW5jZVN0cmluZyk7XHJcbiAgaWYgKGlzTmFOKGJhbGFuY2UpKSB7XHJcbiAgICByZXR1cm4geyBkaXNwbGF5OiBiYWxhbmNlU3RyaW5nLCB0b29sdGlwOiBiYWxhbmNlU3RyaW5nIH07XHJcbiAgfVxyXG5cclxuICAvLyBEaXNwbGF5IHZhbHVlIChrZWVwIGN1cnJlbnQgZGVjaW1hbHMsIGFkZCBjb21tYXMpXHJcbiAgY29uc3QgcGFydHMgPSBiYWxhbmNlU3RyaW5nLnNwbGl0KCcuJyk7XHJcbiAgcGFydHNbMF0gPSBwYXJ0c1swXS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCAnLCcpO1xyXG4gIGNvbnN0IGRpc3BsYXlWYWx1ZSA9IHBhcnRzLmpvaW4oJy4nKTtcclxuXHJcbiAgLy8gRnVsbCBwcmVjaXNpb24gdmFsdWUgd2l0aCBjb21tYXNcclxuICBjb25zdCBmdWxsUHJlY2lzaW9uID0gYmFsYW5jZS50b0ZpeGVkKGZ1bGxEZWNpbWFscyk7XHJcbiAgY29uc3QgZnVsbFBhcnRzID0gZnVsbFByZWNpc2lvbi5zcGxpdCgnLicpO1xyXG4gIGZ1bGxQYXJ0c1swXSA9IGZ1bGxQYXJ0c1swXS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCAnLCcpO1xyXG4gIGNvbnN0IGZ1bGxWYWx1ZSA9IGZ1bGxQYXJ0cy5qb2luKCcuJyk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBkaXNwbGF5OiBkaXNwbGF5VmFsdWUsXHJcbiAgICB0b29sdGlwOiBgRnVsbCBwcmVjaXNpb246ICR7ZnVsbFZhbHVlfWBcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVCYWxhbmNlRGlzcGxheSgpIHtcclxuICBjb25zdCBiYWxhbmNlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFsYW5jZS1hbW91bnQnKTtcclxuICBpZiAoYmFsYW5jZUVsKSB7XHJcbiAgICBjb25zdCBkZWNpbWFscyA9IGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5kZWNpbWFsUGxhY2VzO1xyXG4gICAgY29uc3QgYmFsYW5jZSA9IHBhcnNlRmxvYXQoY3VycmVudFN0YXRlLmJhbGFuY2UpO1xyXG5cclxuICAgIC8vIEZvcm1hdCB3aXRoIGNvbW1hcyBmb3IgcmVhZGFiaWxpdHlcclxuICAgIGNvbnN0IGZvcm1hdHRlZCA9IGJhbGFuY2UudG9GaXhlZChkZWNpbWFscyk7XHJcbiAgICBjb25zdCBwYXJ0cyA9IGZvcm1hdHRlZC5zcGxpdCgnLicpO1xyXG4gICAgcGFydHNbMF0gPSBwYXJ0c1swXS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCAnLCcpO1xyXG4gICAgY29uc3QgZGlzcGxheVZhbHVlID0gcGFydHMuam9pbignLicpO1xyXG5cclxuICAgIGJhbGFuY2VFbC50ZXh0Q29udGVudCA9IGRpc3BsYXlWYWx1ZTtcclxuXHJcbiAgICAvLyBTZXQgdG9vbHRpcCB3aXRoIGZ1bGwgcHJlY2lzaW9uICgxOCBkZWNpbWFscykgYW5kIGNvbW1hc1xyXG4gICAgY29uc3QgZnVsbFByZWNpc2lvbiA9IGJhbGFuY2UudG9GaXhlZCgxOCk7XHJcbiAgICBjb25zdCBmdWxsUGFydHMgPSBmdWxsUHJlY2lzaW9uLnNwbGl0KCcuJyk7XHJcbiAgICBmdWxsUGFydHNbMF0gPSBmdWxsUGFydHNbMF0ucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgJywnKTtcclxuICAgIGNvbnN0IGZ1bGxWYWx1ZSA9IGZ1bGxQYXJ0cy5qb2luKCcuJyk7XHJcbiAgICBiYWxhbmNlRWwudGl0bGUgPSBgRnVsbCBwcmVjaXNpb246ICR7ZnVsbFZhbHVlfWA7XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGUgYmFsYW5jZSBzeW1ib2wgYmFzZWQgb24gbmV0d29ya1xyXG4gIGNvbnN0IHN5bWJvbEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhbGFuY2Utc3ltYm9sJyk7XHJcbiAgaWYgKHN5bWJvbEVsKSB7XHJcbiAgICBjb25zdCBzeW1ib2xzID0ge1xyXG4gICAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAndFBMUycsXHJcbiAgICAgICdwdWxzZWNoYWluJzogJ1BMUycsXHJcbiAgICAgICdldGhlcmV1bSc6ICdFVEgnLFxyXG4gICAgICAnc2Vwb2xpYSc6ICdTRVAnXHJcbiAgICB9O1xyXG4gICAgc3ltYm9sRWwudGV4dENvbnRlbnQgPSBzeW1ib2xzW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXSB8fCAnVE9LRU4nO1xyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRlIFVTRCB2YWx1ZSBpZiBwcmljZXMgYXJlIGF2YWlsYWJsZVxyXG4gIGNvbnN0IHVzZEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhbGFuY2UtdXNkJyk7XHJcbiAgaWYgKHVzZEVsICYmIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcykge1xyXG4gICAgY29uc3QgdG9rZW5TeW1ib2wgPSBjdXJyZW50U3RhdGUubmV0d29yayA9PT0gJ3B1bHNlY2hhaW5UZXN0bmV0JyA/ICdQTFMnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUubmV0d29yayA9PT0gJ3B1bHNlY2hhaW4nID8gJ1BMUycgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGF0ZS5uZXR3b3JrID09PSAnZXRoZXJldW0nID8gJ0VUSCcgOiAnUExTJztcclxuXHJcbiAgICAvLyBDb252ZXJ0IGJhbGFuY2UgdG8gd2VpIChzdHJpbmcgd2l0aCAxOCBkZWNpbWFscylcclxuICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBldGhlcnMucGFyc2VFdGhlcihjdXJyZW50U3RhdGUuYmFsYW5jZS50b1N0cmluZygpKS50b1N0cmluZygpO1xyXG4gICAgY29uc3QgdXNkVmFsdWUgPSBnZXRUb2tlblZhbHVlVVNEKHRva2VuU3ltYm9sLCBiYWxhbmNlV2VpLCAxOCwgY3VycmVudFN0YXRlLnRva2VuUHJpY2VzKTtcclxuXHJcbiAgICBpZiAodXNkVmFsdWUgIT09IG51bGwpIHtcclxuICAgICAgdXNkRWwudGV4dENvbnRlbnQgPSBmb3JtYXRVU0QodXNkVmFsdWUpO1xyXG4gICAgICB1c2RFbC5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1mZy1kaW0pJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHVzZEVsLnRleHRDb250ZW50ID0gJ+KAlCc7XHJcbiAgICAgIHVzZEVsLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLWZnLWRpbSknO1xyXG4gICAgfVxyXG4gIH0gZWxzZSBpZiAodXNkRWwpIHtcclxuICAgIHVzZEVsLnRleHRDb250ZW50ID0gJ+KAlCc7XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGUgbmV0d29yayBsb2dvXHJcbiAgY29uc3QgbG9nb0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmstbG9nbycpO1xyXG4gIGlmIChsb2dvRWwpIHtcclxuICAgIGNvbnN0IG5ldHdvcmtMb2dvcyA9IHtcclxuICAgICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3Bscy5wbmcnLFxyXG4gICAgICAncHVsc2VjaGFpbic6ICdwbHMucG5nJyxcclxuICAgICAgJ2V0aGVyZXVtJzogJ2V0aC5wbmcnLFxyXG4gICAgICAnc2Vwb2xpYSc6ICdldGgucG5nJ1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBsb2dvRmlsZSA9IG5ldHdvcmtMb2dvc1tjdXJyZW50U3RhdGUubmV0d29ya107XHJcbiAgICBpZiAobG9nb0ZpbGUpIHtcclxuICAgICAgbG9nb0VsLnNyYyA9IGNocm9tZS5ydW50aW1lLmdldFVSTChgYXNzZXRzL2xvZ29zLyR7bG9nb0ZpbGV9YCk7XHJcbiAgICAgIGxvZ29FbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxvZ29FbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZldGNoIHRva2VuIHByaWNlcyBmcm9tIFB1bHNlWCBhbmQgdXBkYXRlIGRpc3BsYXlcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGZldGNoQW5kVXBkYXRlUHJpY2VzKCkge1xyXG4gIC8vIE9ubHkgZmV0Y2ggcHJpY2VzIGZvciBQdWxzZUNoYWluIG5ldHdvcmtzXHJcbiAgaWYgKGN1cnJlbnRTdGF0ZS5uZXR3b3JrICE9PSAncHVsc2VjaGFpbicgJiYgY3VycmVudFN0YXRlLm5ldHdvcmsgIT09ICdwdWxzZWNoYWluVGVzdG5ldCcpIHtcclxuICAgIGNvbnNvbGUubG9nKCfwn6uAIFByaWNlIGZldGNoaW5nIG5vdCBzdXBwb3J0ZWQgZm9yJywgY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gU2hvdyBsb2FkaW5nIGluZGljYXRvclxyXG4gIGNvbnN0IGxvYWRpbmdFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcmljZS1sb2FkaW5nJyk7XHJcbiAgY29uc3QgdXNkRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFsYW5jZS11c2QnKTtcclxuICBpZiAobG9hZGluZ0VsICYmIHVzZEVsKSB7XHJcbiAgICB1c2RFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGxvYWRpbmdFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihjdXJyZW50U3RhdGUubmV0d29yayk7XHJcbiAgICBjb25zdCBwcmljZXMgPSBhd2FpdCBmZXRjaFRva2VuUHJpY2VzKHByb3ZpZGVyLCBjdXJyZW50U3RhdGUubmV0d29yayA9PT0gJ3B1bHNlY2hhaW5UZXN0bmV0JyA/ICdwdWxzZWNoYWluJyA6IGN1cnJlbnRTdGF0ZS5uZXR3b3JrKTtcclxuXHJcbiAgICBpZiAocHJpY2VzKSB7XHJcbiAgICAgIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcyA9IHByaWNlcztcclxuICAgICAgdXBkYXRlQmFsYW5jZURpc3BsYXkoKTsgLy8gUmVmcmVzaCBkaXNwbGF5IHdpdGggVVNEIHZhbHVlc1xyXG4gICAgICAvLyBQcmljZXMgdXBkYXRlZFxyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB0b2tlbiBwcmljZXM6JywgZXJyb3IpO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICAvLyBIaWRlIGxvYWRpbmcgaW5kaWNhdG9yXHJcbiAgICBpZiAobG9hZGluZ0VsICYmIHVzZEVsKSB7XHJcbiAgICAgIGxvYWRpbmdFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgdXNkRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVOZXR3b3JrU2VsZWN0b3IoKSB7XHJcbiAgLy8gSWYgdGVzdCBuZXR3b3JrcyBhcmUgaGlkZGVuLCBoaWRlIHRlc3RuZXQgb3B0aW9ucyBpbiBjdXN0b20gZHJvcGRvd25cclxuICBjb25zdCBvcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5ldHdvcmstb3B0aW9uJyk7XHJcbiAgb3B0aW9ucy5mb3JFYWNoKG9wdGlvbiA9PiB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gb3B0aW9uLmdldEF0dHJpYnV0ZSgnZGF0YS1uZXR3b3JrJyk7XHJcbiAgICBjb25zdCBpc1Rlc3RuZXQgPSBuZXR3b3JrLmluY2x1ZGVzKCdUZXN0bmV0JykgfHwgbmV0d29yayA9PT0gJ3NlcG9saWEnO1xyXG4gICAgaWYgKGlzVGVzdG5ldCAmJiAhY3VycmVudFN0YXRlLnNldHRpbmdzLnNob3dUZXN0TmV0d29ya3MpIHtcclxuICAgICAgb3B0aW9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBvcHRpb24uc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuLy8gPT09PT0gU0VORCA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBzaG93U2VuZFNjcmVlbigpIHtcclxuICAvLyBQb3B1bGF0ZSBzZW5kIHNjcmVlbiB3aXRoIGN1cnJlbnQgd2FsbGV0IGluZm9cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1mcm9tLWFkZHJlc3MnKS50ZXh0Q29udGVudCA9IGN1cnJlbnRTdGF0ZS5hZGRyZXNzIHx8ICcweDAwMDAuLi4wMDAwJztcclxuXHJcbiAgLy8gUG9wdWxhdGUgYXNzZXQgc2VsZWN0b3Igd2l0aCBuYXRpdmUgKyB0b2tlbnNcclxuICBjb25zdCBhc3NldFNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWFzc2V0LXNlbGVjdCcpO1xyXG4gIGNvbnN0IHN5bWJvbHMgPSB7XHJcbiAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAndFBMUycsXHJcbiAgICAncHVsc2VjaGFpbic6ICdQTFMnLFxyXG4gICAgJ2V0aGVyZXVtJzogJ0VUSCcsXHJcbiAgICAnc2Vwb2xpYSc6ICdTRVAnXHJcbiAgfTtcclxuXHJcbiAgbGV0IG9wdGlvbnMgPSBgPG9wdGlvbiB2YWx1ZT1cIm5hdGl2ZVwiPk5hdGl2ZSAoJHtzeW1ib2xzW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXSB8fCAnVE9LRU4nfSk8L29wdGlvbj5gO1xyXG5cclxuICBjb25zdCBhbGxUb2tlbnMgPSBhd2FpdCB0b2tlbnMuZ2V0QWxsVG9rZW5zKGN1cnJlbnRTdGF0ZS5uZXR3b3JrKTtcclxuICBmb3IgKGNvbnN0IHRva2VuIG9mIGFsbFRva2Vucykge1xyXG4gICAgb3B0aW9ucyArPSBgPG9wdGlvbiB2YWx1ZT1cIiR7ZXNjYXBlSHRtbCh0b2tlbi5hZGRyZXNzKX1cIj4ke2VzY2FwZUh0bWwodG9rZW4uc3ltYm9sKX08L29wdGlvbj5gO1xyXG4gIH1cclxuXHJcbiAgYXNzZXRTZWxlY3QuaW5uZXJIVE1MID0gb3B0aW9ucztcclxuXHJcbiAgLy8gU2V0IGluaXRpYWwgYmFsYW5jZSB3aXRoIGZvcm1hdHRpbmdcclxuICBjb25zdCBiYWxhbmNlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hdmFpbGFibGUtYmFsYW5jZScpO1xyXG4gIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdEJhbGFuY2VXaXRoQ29tbWFzKGN1cnJlbnRTdGF0ZS5iYWxhbmNlLCAxOCk7XHJcbiAgYmFsYW5jZUVsLnRleHRDb250ZW50ID0gZm9ybWF0dGVkLmRpc3BsYXk7XHJcbiAgYmFsYW5jZUVsLnRpdGxlID0gZm9ybWF0dGVkLnRvb2x0aXA7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYmFsYW5jZS1zeW1ib2wnKS50ZXh0Q29udGVudCA9IHN5bWJvbHNbY3VycmVudFN0YXRlLm5ldHdvcmtdIHx8ICdUT0tFTic7XHJcblxyXG4gIC8vIENsZWFyIGZvcm1cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC10by1hZGRyZXNzJykudmFsdWUgPSAnJztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hbW91bnQnKS52YWx1ZSA9ICcnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLXBhc3N3b3JkJykudmFsdWUgPSAnJztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1lcnJvcicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAvLyBTaG93IGZvcm0gYW5kIGhpZGUgc3RhdHVzIHNlY3Rpb24gKHJlc2V0IHN0YXRlKVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWZvcm0nKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1zdGF0dXMtc2VjdGlvbicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICBzaG93U2NyZWVuKCdzY3JlZW4tc2VuZCcpO1xyXG5cclxuICAvLyBQb3B1bGF0ZSBnYXMgcHJpY2VzIGFuZCBub25jZVxyXG4gIGNvbnN0IHN5bWJvbCA9IHN5bWJvbHNbY3VycmVudFN0YXRlLm5ldHdvcmtdIHx8ICdUT0tFTic7XHJcbiAgY29uc3QgdHhSZXF1ZXN0ID0ge1xyXG4gICAgZnJvbTogY3VycmVudFN0YXRlLmFkZHJlc3MsXHJcbiAgICB0bzogY3VycmVudFN0YXRlLmFkZHJlc3MsIC8vIER1bW15IGZvciBlc3RpbWF0aW9uXHJcbiAgICB2YWx1ZTogJzB4MCdcclxuICB9O1xyXG4gIGF3YWl0IHBvcHVsYXRlU2VuZEdhc1ByaWNlcyhjdXJyZW50U3RhdGUubmV0d29yaywgdHhSZXF1ZXN0LCBzeW1ib2wpO1xyXG5cclxuICAvLyBGZXRjaCBhbmQgZGlzcGxheSBub25jZVxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBub25jZUhleCA9IGF3YWl0IHJwYy5nZXRUcmFuc2FjdGlvbkNvdW50KGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCBjdXJyZW50U3RhdGUuYWRkcmVzcywgJ3BlbmRpbmcnKTtcclxuICAgIGNvbnN0IG5vbmNlID0gcGFyc2VJbnQobm9uY2VIZXgsIDE2KTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWN1cnJlbnQtbm9uY2UnKS50ZXh0Q29udGVudCA9IG5vbmNlO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBub25jZTonLCBlcnJvcik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXJyZW50LW5vbmNlJykudGV4dENvbnRlbnQgPSAnRXJyb3InO1xyXG4gIH1cclxuXHJcbiAgLy8gU2V0dXAgY3VzdG9tIG5vbmNlIGNoZWNrYm94XHJcbiAgY29uc3QgY3VzdG9tTm9uY2VDaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWN1c3RvbS1ub25jZS1jaGVja2JveCcpO1xyXG4gIGNvbnN0IGN1c3RvbU5vbmNlQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtY3VzdG9tLW5vbmNlLWlucHV0LWNvbnRhaW5lcicpO1xyXG4gIGN1c3RvbU5vbmNlQ2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xyXG4gIGN1c3RvbU5vbmNlQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAvLyBSZW1vdmUgb2xkIGxpc3RlbmVyIGlmIGV4aXN0cyBhbmQgYWRkIG5ldyBvbmVcclxuICBjb25zdCBuZXdDaGVja2JveCA9IGN1c3RvbU5vbmNlQ2hlY2tib3guY2xvbmVOb2RlKHRydWUpO1xyXG4gIGN1c3RvbU5vbmNlQ2hlY2tib3gucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmV3Q2hlY2tib3gsIGN1c3RvbU5vbmNlQ2hlY2tib3gpO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXN0b20tbm9uY2UtY2hlY2tib3gnKS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgaWYgKGUudGFyZ2V0LmNoZWNrZWQpIHtcclxuICAgICAgY3VzdG9tTm9uY2VDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnROb25jZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWN1cnJlbnQtbm9uY2UnKS50ZXh0Q29udGVudDtcclxuICAgICAgaWYgKGN1cnJlbnROb25jZSAhPT0gJy0tJyAmJiBjdXJyZW50Tm9uY2UgIT09ICdFcnJvcicpIHtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXN0b20tbm9uY2UnKS52YWx1ZSA9IGN1cnJlbnROb25jZTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY3VzdG9tTm9uY2VDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFzc2V0Q2hhbmdlKCkge1xyXG4gIGNvbnN0IGFzc2V0U2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYXNzZXQtc2VsZWN0Jyk7XHJcbiAgY29uc3Qgc2VsZWN0ZWRWYWx1ZSA9IGFzc2V0U2VsZWN0LnZhbHVlO1xyXG5cclxuICBjb25zdCBzeW1ib2xzID0ge1xyXG4gICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3RQTFMnLFxyXG4gICAgJ3B1bHNlY2hhaW4nOiAnUExTJyxcclxuICAgICdldGhlcmV1bSc6ICdFVEgnLFxyXG4gICAgJ3NlcG9saWEnOiAnU0VQJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGJhbGFuY2VFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWF2YWlsYWJsZS1iYWxhbmNlJyk7XHJcblxyXG4gIGlmIChzZWxlY3RlZFZhbHVlID09PSAnbmF0aXZlJykge1xyXG4gICAgY29uc3QgZm9ybWF0dGVkID0gZm9ybWF0QmFsYW5jZVdpdGhDb21tYXMoY3VycmVudFN0YXRlLmJhbGFuY2UsIDE4KTtcclxuICAgIGJhbGFuY2VFbC50ZXh0Q29udGVudCA9IGZvcm1hdHRlZC5kaXNwbGF5O1xyXG4gICAgYmFsYW5jZUVsLnRpdGxlID0gZm9ybWF0dGVkLnRvb2x0aXA7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1iYWxhbmNlLXN5bWJvbCcpLnRleHRDb250ZW50ID0gc3ltYm9sc1tjdXJyZW50U3RhdGUubmV0d29ya10gfHwgJ1RPS0VOJztcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gR2V0IHRva2VuIGJhbGFuY2VcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGFsbFRva2VucyA9IGF3YWl0IHRva2Vucy5nZXRBbGxUb2tlbnMoY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG4gICAgICBjb25zdCB0b2tlbiA9IGFsbFRva2Vucy5maW5kKHQgPT4gdC5hZGRyZXNzID09PSBzZWxlY3RlZFZhbHVlKTtcclxuXHJcbiAgICAgIGlmICh0b2tlbikge1xyXG4gICAgICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBhd2FpdCBlcmMyMC5nZXRUb2tlbkJhbGFuY2UoY3VycmVudFN0YXRlLm5ldHdvcmssIHRva2VuLmFkZHJlc3MsIGN1cnJlbnRTdGF0ZS5hZGRyZXNzKTtcclxuICAgICAgICBjb25zdCByYXdCYWxhbmNlID0gZXJjMjAuZm9ybWF0VG9rZW5CYWxhbmNlKGJhbGFuY2VXZWksIHRva2VuLmRlY2ltYWxzLCA0KTtcclxuICAgICAgICBjb25zdCBmb3JtYXR0ZWQgPSBmb3JtYXRCYWxhbmNlV2l0aENvbW1hcyhyYXdCYWxhbmNlLCB0b2tlbi5kZWNpbWFscyk7XHJcbiAgICAgICAgYmFsYW5jZUVsLnRleHRDb250ZW50ID0gZm9ybWF0dGVkLmRpc3BsYXk7XHJcbiAgICAgICAgYmFsYW5jZUVsLnRpdGxlID0gZm9ybWF0dGVkLnRvb2x0aXA7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYmFsYW5jZS1zeW1ib2wnKS50ZXh0Q29udGVudCA9IHRva2VuLnN5bWJvbDtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdG9rZW4gYmFsYW5jZTonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVTZW5kTWF4KCkge1xyXG4gIC8vIFNldCBhbW91bnQgdG8gYXZhaWxhYmxlIGJhbGFuY2UgKG1pbnVzIGVzdGltYXRlZCBnYXMpXHJcbiAgLy8gRm9yIHNpbXBsaWNpdHksIHdlJ2xsIGp1c3Qgc2V0IHRvIGN1cnJlbnQgYmFsYW5jZVxyXG4gIC8vIFVzZXIgc2hvdWxkIGxlYXZlIHNvbWUgZm9yIGdhc1xyXG4gIGNvbnN0IGJhbGFuY2UgPSBwYXJzZUZsb2F0KGN1cnJlbnRTdGF0ZS5iYWxhbmNlKTtcclxuICBpZiAoYmFsYW5jZSA+IDApIHtcclxuICAgIC8vIExlYXZlIGEgYml0IGZvciBnYXMgKHJvdWdoIGVzdGltYXRlOiAwLjAwMSBmb3Igc2ltcGxlIHRyYW5zZmVyKVxyXG4gICAgY29uc3QgbWF4U2VuZCA9IE1hdGgubWF4KDAsIGJhbGFuY2UgLSAwLjAwMSk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hbW91bnQnKS52YWx1ZSA9IG1heFNlbmQudG9TdHJpbmcoKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNlbmRUcmFuc2FjdGlvbigpIHtcclxuICBjb25zdCB0b0FkZHJlc3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC10by1hZGRyZXNzJykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IGFtb3VudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWFtb3VudCcpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLXBhc3N3b3JkJykudmFsdWU7XHJcbiAgY29uc3QgYXNzZXRTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hc3NldC1zZWxlY3QnKTtcclxuICBjb25zdCBzZWxlY3RlZEFzc2V0ID0gYXNzZXRTZWxlY3QudmFsdWU7XHJcbiAgY29uc3QgZXJyb3JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWVycm9yJyk7XHJcblxyXG4gIGNvbnN0IHN5bWJvbHMgPSB7XHJcbiAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAndFBMUycsXHJcbiAgICAncHVsc2VjaGFpbic6ICdQTFMnLFxyXG4gICAgJ2V0aGVyZXVtJzogJ0VUSCcsXHJcbiAgICAnc2Vwb2xpYSc6ICdTRVAnXHJcbiAgfTtcclxuXHJcbiAgLy8gVmFsaWRhdGUgaW5wdXRzXHJcbiAgaWYgKCF0b0FkZHJlc3MgfHwgIWFtb3VudCB8fCAhcGFzc3dvcmQpIHtcclxuICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSAnUGxlYXNlIGZpbGwgaW4gYWxsIGZpZWxkcyc7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgYWRkcmVzcyBmb3JtYXRcclxuICBpZiAoIXRvQWRkcmVzcy5tYXRjaCgvXjB4W2EtZkEtRjAtOV17NDB9JC8pKSB7XHJcbiAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ0ludmFsaWQgcmVjaXBpZW50IGFkZHJlc3MnO1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIGFtb3VudFxyXG4gIGNvbnN0IGFtb3VudE51bSA9IHBhcnNlRmxvYXQoYW1vdW50KTtcclxuICBpZiAoaXNOYU4oYW1vdW50TnVtKSB8fCBhbW91bnROdW0gPD0gMCkge1xyXG4gICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdJbnZhbGlkIGFtb3VudCc7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgLy8gRGlzYWJsZSBzZW5kIGJ1dHRvbiB0byBwcmV2ZW50IGRvdWJsZS1jbGlja2luZ1xyXG4gICAgY29uc3Qgc2VuZEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29uZmlybS1zZW5kJyk7XHJcbiAgICBzZW5kQnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIHNlbmRCdG4uc3R5bGUub3BhY2l0eSA9ICcwLjUnO1xyXG4gICAgc2VuZEJ0bi5zdHlsZS5jdXJzb3IgPSAnbm90LWFsbG93ZWQnO1xyXG5cclxuICAgIC8vIFVubG9jayB3YWxsZXQgd2l0aCBwYXNzd29yZCBhbmQgYXV0by11cGdyYWRlIGlmIG5lZWRlZFxyXG4gICAgY29uc3QgeyBzaWduZXIsIHVwZ3JhZGVkLCBpdGVyYXRpb25zQmVmb3JlLCBpdGVyYXRpb25zQWZ0ZXIgfSA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICBvblVwZ3JhZGVTdGFydDogKGluZm8pID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhg8J+UkCBBdXRvLXVwZ3JhZGluZyB3YWxsZXQ6ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfWApO1xyXG4gICAgICAgIGNvbnN0IHN0YXR1c0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIHN0YXR1c0Rpdi5jbGFzc05hbWUgPSAnc3RhdHVzLW1lc3NhZ2UgaW5mbyc7XHJcbiAgICAgICAgc3RhdHVzRGl2LnRleHRDb250ZW50ID0gJ/CflJAgVXBncmFkaW5nIHdhbGxldCBzZWN1cml0eS4uLic7XHJcbiAgICAgICAgZXJyb3JFbC5wYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShzdGF0dXNEaXYsIGVycm9yRWwpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gc3RhdHVzRGl2LnJlbW92ZSgpLCAzMDAwKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKHVwZ3JhZGVkKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGDinIUgV2FsbGV0IHVwZ3JhZGVkOiAke2l0ZXJhdGlvbnNCZWZvcmUudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aXRlcmF0aW9uc0FmdGVyLnRvTG9jYWxlU3RyaW5nKCl9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IHNlbGVjdGVkIGdhcyBwcmljZVxyXG4gICAgY29uc3QgZ2FzUHJpY2UgPSBnZXRTZWxlY3RlZFNlbmRHYXNQcmljZSgpO1xyXG5cclxuICAgIC8vIEdldCBjdXN0b20gbm9uY2UgaWYgcHJvdmlkZWRcclxuICAgIGNvbnN0IGN1c3RvbU5vbmNlQ2hlY2tib3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXN0b20tbm9uY2UtY2hlY2tib3gnKTtcclxuICAgIGNvbnN0IGN1c3RvbU5vbmNlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXN0b20tbm9uY2UnKTtcclxuICAgIGxldCBjdXN0b21Ob25jZSA9IG51bGw7XHJcbiAgICBpZiAoY3VzdG9tTm9uY2VDaGVja2JveC5jaGVja2VkICYmIGN1c3RvbU5vbmNlSW5wdXQudmFsdWUpIHtcclxuICAgICAgY3VzdG9tTm9uY2UgPSBwYXJzZUludChjdXN0b21Ob25jZUlucHV0LnZhbHVlKTtcclxuICAgICAgaWYgKGlzTmFOKGN1c3RvbU5vbmNlKSB8fCBjdXN0b21Ob25jZSA8IDApIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY3VzdG9tIG5vbmNlJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgcHJvdmlkZXIgd2l0aCBhdXRvbWF0aWMgZmFpbG92ZXIgYW5kIGNvbm5lY3Qgc2lnbmVyXHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihjdXJyZW50U3RhdGUubmV0d29yayk7XHJcbiAgICBjb25zdCBjb25uZWN0ZWRTaWduZXIgPSBzaWduZXIuY29ubmVjdChwcm92aWRlcik7XHJcblxyXG4gICAgbGV0IHR4UmVzcG9uc2UsIHN5bWJvbDtcclxuXHJcbiAgICBpZiAoc2VsZWN0ZWRBc3NldCA9PT0gJ25hdGl2ZScpIHtcclxuICAgICAgLy8gU2VuZCBuYXRpdmUgY3VycmVuY3lcclxuICAgICAgY29uc3QgdHggPSB7XHJcbiAgICAgICAgdG86IHRvQWRkcmVzcyxcclxuICAgICAgICB2YWx1ZTogZXRoZXJzLnBhcnNlRXRoZXIoYW1vdW50KVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gQWRkIGdhcyBwcmljZSBpZiBzZWxlY3RlZFxyXG4gICAgICBpZiAoZ2FzUHJpY2UpIHtcclxuICAgICAgICB0eC5nYXNQcmljZSA9IGdhc1ByaWNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBZGQgY3VzdG9tIG5vbmNlIGlmIHByb3ZpZGVkXHJcbiAgICAgIGlmIChjdXN0b21Ob25jZSAhPT0gbnVsbCkge1xyXG4gICAgICAgIHR4Lm5vbmNlID0gY3VzdG9tTm9uY2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHR4UmVzcG9uc2UgPSBhd2FpdCBjb25uZWN0ZWRTaWduZXIuc2VuZFRyYW5zYWN0aW9uKHR4KTtcclxuICAgICAgc3ltYm9sID0gc3ltYm9sc1tjdXJyZW50U3RhdGUubmV0d29ya10gfHwgJ3Rva2Vucyc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBTZW5kIHRva2VuXHJcbiAgICAgIGNvbnN0IGFsbFRva2VucyA9IGF3YWl0IHRva2Vucy5nZXRBbGxUb2tlbnMoY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG4gICAgICBjb25zdCB0b2tlbiA9IGFsbFRva2Vucy5maW5kKHQgPT4gdC5hZGRyZXNzID09PSBzZWxlY3RlZEFzc2V0KTtcclxuXHJcbiAgICAgIGlmICghdG9rZW4pIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Rva2VuIG5vdCBmb3VuZCcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBhbW91bnRXZWkgPSBlcmMyMC5wYXJzZVRva2VuQW1vdW50KGFtb3VudCwgdG9rZW4uZGVjaW1hbHMpO1xyXG5cclxuICAgICAgLy8gRm9yIHRva2VuIHRyYW5zZmVycywgd2UgbmVlZCB0byBwYXNzIGdhcyBvcHRpb25zIHRvIHRoZSB0cmFuc2ZlciBmdW5jdGlvblxyXG4gICAgICBjb25zdCB0eE9wdGlvbnMgPSB7fTtcclxuICAgICAgaWYgKGdhc1ByaWNlKSB7XHJcbiAgICAgICAgdHhPcHRpb25zLmdhc1ByaWNlID0gZ2FzUHJpY2U7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGN1c3RvbU5vbmNlICE9PSBudWxsKSB7XHJcbiAgICAgICAgdHhPcHRpb25zLm5vbmNlID0gY3VzdG9tTm9uY2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE5vdGU6IFRoaXMgcmVxdWlyZXMgdXBkYXRpbmcgZXJjMjAudHJhbnNmZXJUb2tlbiB0byBhY2NlcHQgb3B0aW9uc1xyXG4gICAgICAvLyBGb3Igbm93LCB3ZSdsbCBzZW5kIHRoZSB0cmFuc2FjdGlvbiBtYW51YWxseVxyXG4gICAgICBjb25zdCB0b2tlbkNvbnRyYWN0ID0gbmV3IGV0aGVycy5Db250cmFjdChcclxuICAgICAgICB0b2tlbi5hZGRyZXNzLFxyXG4gICAgICAgIFsnZnVuY3Rpb24gdHJhbnNmZXIoYWRkcmVzcyB0bywgdWludDI1NiBhbW91bnQpIHJldHVybnMgKGJvb2wpJ10sXHJcbiAgICAgICAgY29ubmVjdGVkU2lnbmVyXHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0eFJlc3BvbnNlID0gYXdhaXQgdG9rZW5Db250cmFjdC50cmFuc2Zlcih0b0FkZHJlc3MsIGFtb3VudFdlaSwgdHhPcHRpb25zKTtcclxuICAgICAgc3ltYm9sID0gdG9rZW4uc3ltYm9sO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNhdmUgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeSBhbmQgc3RhcnQgbW9uaXRvcmluZ1xyXG4gICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnU0FWRV9BTkRfTU9OSVRPUl9UWCcsXHJcbiAgICAgIGFkZHJlc3M6IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLFxyXG4gICAgICB0cmFuc2FjdGlvbjoge1xyXG4gICAgICAgIGhhc2g6IHR4UmVzcG9uc2UuaGFzaCxcclxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgICAgZnJvbTogY3VycmVudFN0YXRlLmFkZHJlc3MsXHJcbiAgICAgICAgdG86IHRvQWRkcmVzcyxcclxuICAgICAgICB2YWx1ZTogc2VsZWN0ZWRBc3NldCA9PT0gJ25hdGl2ZScgPyBldGhlcnMucGFyc2VFdGhlcihhbW91bnQpLnRvU3RyaW5nKCkgOiAnMCcsXHJcbiAgICAgICAgZ2FzUHJpY2U6IGdhc1ByaWNlIHx8IChhd2FpdCB0eFJlc3BvbnNlLnByb3ZpZGVyLmdldEZlZURhdGEoKSkuZ2FzUHJpY2UudG9TdHJpbmcoKSxcclxuICAgICAgICBub25jZTogdHhSZXNwb25zZS5ub25jZSxcclxuICAgICAgICBuZXR3b3JrOiBjdXJyZW50U3RhdGUubmV0d29yayxcclxuICAgICAgICBzdGF0dXM6ICdwZW5kaW5nJyxcclxuICAgICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgICB0eXBlOiBzZWxlY3RlZEFzc2V0ID09PSAnbmF0aXZlJyA/ICdzZW5kJyA6ICd0b2tlbidcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2VuZCBkZXNrdG9wIG5vdGlmaWNhdGlvblxyXG4gICAgaWYgKGNocm9tZS5ub3RpZmljYXRpb25zKSB7XHJcbiAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIFNlbnQnLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBTZW5kaW5nICR7YW1vdW50fSAke3N5bWJvbH0gdG8gJHt0b0FkZHJlc3Muc2xpY2UoMCwgMTApfS4uLmAsXHJcbiAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2hvdyB0cmFuc2FjdGlvbiBzdGF0dXMgc2NyZWVuXHJcbiAgICBhd2FpdCBzaG93U2VuZFRyYW5zYWN0aW9uU3RhdHVzKHR4UmVzcG9uc2UuaGFzaCwgY3VycmVudFN0YXRlLm5ldHdvcmssIGFtb3VudCwgc3ltYm9sKTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ1NlbmQgdHJhbnNhY3Rpb24gZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ2luY29ycmVjdCBwYXNzd29yZCcpXHJcbiAgICAgID8gJ0luY29ycmVjdCBwYXNzd29yZCdcclxuICAgICAgOiAnVHJhbnNhY3Rpb24gZmFpbGVkOiAnICsgZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcblxyXG4gICAgLy8gUmUtZW5hYmxlIHNlbmQgYnV0dG9uIG9uIGVycm9yXHJcbiAgICBjb25zdCBzZW5kQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb25maXJtLXNlbmQnKTtcclxuICAgIHNlbmRCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIHNlbmRCdG4uc3R5bGUub3BhY2l0eSA9ICcxJztcclxuICAgIHNlbmRCdG4uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2hvd1RyYW5zYWN0aW9uU3VjY2Vzc01vZGFsKHR4SGFzaCkge1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1zdWNjZXNzLWhhc2gnKS50ZXh0Q29udGVudCA9IHR4SGFzaDtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtdHgtc3VjY2VzcycpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiB3YWl0Rm9yVHJhbnNhY3Rpb25Db25maXJtYXRpb24odHhIYXNoLCBhbW91bnQsIHN5bWJvbCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihjdXJyZW50U3RhdGUubmV0d29yayk7XHJcblxyXG4gICAgLy8gV2FpdCBmb3IgdHJhbnNhY3Rpb24gdG8gYmUgbWluZWQgKDEgY29uZmlybWF0aW9uKVxyXG4gICAgY29uc3QgcmVjZWlwdCA9IGF3YWl0IHByb3ZpZGVyLndhaXRGb3JUcmFuc2FjdGlvbih0eEhhc2gsIDEpO1xyXG5cclxuICAgIGlmIChyZWNlaXB0ICYmIHJlY2VpcHQuc3RhdHVzID09PSAxKSB7XHJcbiAgICAgIC8vIFRyYW5zYWN0aW9uIGNvbmZpcm1lZCBzdWNjZXNzZnVsbHlcclxuICAgICAgaWYgKGNocm9tZS5ub3RpZmljYXRpb25zKSB7XHJcbiAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gQ29uZmlybWVkJyxcclxuICAgICAgICAgIG1lc3NhZ2U6IGAke2Ftb3VudH0gJHtzeW1ib2x9IHRyYW5zZmVyIGNvbmZpcm1lZCBvbi1jaGFpbiFgLFxyXG4gICAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQXV0by1yZWZyZXNoIGJhbGFuY2VcclxuICAgICAgYXdhaXQgZmV0Y2hCYWxhbmNlKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBUcmFuc2FjdGlvbiBmYWlsZWRcclxuICAgICAgaWYgKGNocm9tZS5ub3RpZmljYXRpb25zKSB7XHJcbiAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gRmFpbGVkJyxcclxuICAgICAgICAgIG1lc3NhZ2U6ICdUcmFuc2FjdGlvbiB3YXMgcmV2ZXJ0ZWQgb3IgZmFpbGVkIG9uLWNoYWluJyxcclxuICAgICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3Igd2FpdGluZyBmb3IgY29uZmlybWF0aW9uOicsIGVycm9yKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFJFQ0VJVkUgPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gc2hvd1JlY2VpdmVTY3JlZW4oKSB7XHJcbiAgY29uc3QgYWRkcmVzcyA9IGN1cnJlbnRTdGF0ZS5hZGRyZXNzO1xyXG5cclxuICAvLyBVcGRhdGUgYWRkcmVzcyBkaXNwbGF5XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlY2VpdmUtYWRkcmVzcycpLnRleHRDb250ZW50ID0gYWRkcmVzcztcclxuXHJcbiAgLy8gVXBkYXRlIG5ldHdvcmsgaW5mb1xyXG4gIGNvbnN0IG5ldHdvcmtOYW1lcyA9IHtcclxuICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICdQdWxzZUNoYWluIFRlc3RuZXQgVjQnLFxyXG4gICAgJ3B1bHNlY2hhaW4nOiAnUHVsc2VDaGFpbiBNYWlubmV0JyxcclxuICAgICdldGhlcmV1bSc6ICdFdGhlcmV1bSBNYWlubmV0JyxcclxuICAgICdzZXBvbGlhJzogJ1NlcG9saWEgVGVzdG5ldCdcclxuICB9O1xyXG4gIGNvbnN0IHN5bWJvbHMgPSB7XHJcbiAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAndFBMUycsXHJcbiAgICAncHVsc2VjaGFpbic6ICdQTFMnLFxyXG4gICAgJ2V0aGVyZXVtJzogJ0VUSCcsXHJcbiAgICAnc2Vwb2xpYSc6ICdTRVAnXHJcbiAgfTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVjZWl2ZS1uZXR3b3JrLW5hbWUnKS50ZXh0Q29udGVudCA9IG5ldHdvcmtOYW1lc1tjdXJyZW50U3RhdGUubmV0d29ya10gfHwgJ1Vua25vd24gTmV0d29yayc7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlY2VpdmUtbmV0d29yay1zeW1ib2wnKS50ZXh0Q29udGVudCA9IHN5bWJvbHNbY3VycmVudFN0YXRlLm5ldHdvcmtdIHx8ICdUT0tFTic7XHJcblxyXG4gIC8vIEdlbmVyYXRlIFFSIGNvZGVcclxuICB0cnkge1xyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlY2VpdmUtcXItY2FudmFzJyk7XHJcbiAgICBhd2FpdCBRUkNvZGUudG9DYW52YXMoY2FudmFzLCBhZGRyZXNzLCB7XHJcbiAgICAgIHdpZHRoOiAyMDAsXHJcbiAgICAgIG1hcmdpbjogMixcclxuICAgICAgY29sb3I6IHtcclxuICAgICAgICBkYXJrOiBnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmJvZHkpLmdldFByb3BlcnR5VmFsdWUoJy0tdGVybWluYWwtZmcnKS50cmltKCksXHJcbiAgICAgICAgbGlnaHQ6IGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuYm9keSkuZ2V0UHJvcGVydHlWYWx1ZSgnLS10ZXJtaW5hbC1iZycpLnRyaW0oKVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2VuZXJhdGluZyBRUiBjb2RlOicsIGVycm9yKTtcclxuICB9XHJcblxyXG4gIHNob3dTY3JlZW4oJ3NjcmVlbi1yZWNlaXZlJyk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNvcHlSZWNlaXZlQWRkcmVzcygpIHtcclxuICB0cnkge1xyXG4gICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LXJlY2VpdmUtYWRkcmVzcycpO1xyXG4gICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gYnRuLnRleHRDb250ZW50O1xyXG4gICAgYnRuLnRleHRDb250ZW50ID0gJ0NPUElFRCEnO1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGJ0bi50ZXh0Q29udGVudCA9IG9yaWdpbmFsVGV4dDtcclxuICAgIH0sIDIwMDApO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBhbGVydCgnRmFpbGVkIHRvIGNvcHkgYWRkcmVzcycpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gVE9LRU5TID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIHNob3dUb2tlbnNTY3JlZW4oKSB7XHJcbiAgLy8gU3dpdGNoIHRvIHNjcmVlbiBmaXJzdCBzbyB1c2VyIHNlZXMgbG9hZGluZyBpbmRpY2F0b3JcclxuICBzaG93U2NyZWVuKCdzY3JlZW4tdG9rZW5zJyk7XHJcblxyXG4gIC8vIFNtYWxsIGRlbGF5IHRvIGVuc3VyZSBzY3JlZW4gaXMgdmlzaWJsZSBiZWZvcmUgc3RhcnRpbmcgcmVuZGVyXHJcbiAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDEwKSk7XHJcblxyXG4gIC8vIE5vdyByZW5kZXIgdG9rZW5zIChsb2FkaW5nIGluZGljYXRvciB3aWxsIGJlIHZpc2libGUpXHJcbiAgYXdhaXQgcmVuZGVyVG9rZW5zU2NyZWVuKCk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlbmRlclRva2Vuc1NjcmVlbigpIHtcclxuICBjb25zdCBuZXR3b3JrID0gY3VycmVudFN0YXRlLm5ldHdvcms7XHJcblxyXG4gIC8vIFNob3cgbG9hZGluZywgaGlkZSBwYW5lbHNcclxuICBjb25zdCBsb2FkaW5nRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW5zLWxvYWRpbmcnKTtcclxuICBjb25zdCBkZWZhdWx0UGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGVmYXVsdC10b2tlbnMtcGFuZWwnKTtcclxuICBjb25zdCBjdXN0b21QYW5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdXN0b20tdG9rZW5zLXBhbmVsJyk7XHJcblxyXG4gIGlmIChsb2FkaW5nRWwpIGxvYWRpbmdFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICBpZiAoZGVmYXVsdFBhbmVsKSBkZWZhdWx0UGFuZWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgaWYgKGN1c3RvbVBhbmVsKSBjdXN0b21QYW5lbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFJlbmRlciBkZWZhdWx0IHRva2Vuc1xyXG4gICAgYXdhaXQgcmVuZGVyRGVmYXVsdFRva2VucyhuZXR3b3JrKTtcclxuXHJcbiAgICAvLyBSZW5kZXIgY3VzdG9tIHRva2Vuc1xyXG4gICAgYXdhaXQgcmVuZGVyQ3VzdG9tVG9rZW5zKG5ldHdvcmspO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICAvLyBIaWRlIGxvYWRpbmcsIHNob3cgcGFuZWxzXHJcbiAgICBpZiAobG9hZGluZ0VsKSBsb2FkaW5nRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBpZiAoZGVmYXVsdFBhbmVsKSBkZWZhdWx0UGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICBpZiAoY3VzdG9tUGFuZWwpIGN1c3RvbVBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcmVuZGVyRGVmYXVsdFRva2VucyhuZXR3b3JrKSB7XHJcbiAgY29uc3QgZGVmYXVsdFRva2Vuc0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlZmF1bHQtdG9rZW5zLWxpc3QnKTtcclxuICBjb25zdCBuZXR3b3JrRGVmYXVsdHMgPSB0b2tlbnMuREVGQVVMVF9UT0tFTlNbbmV0d29ya10gfHwge307XHJcbiAgY29uc3QgZW5hYmxlZERlZmF1bHRzID0gYXdhaXQgdG9rZW5zLmdldEVuYWJsZWREZWZhdWx0VG9rZW5zKG5ldHdvcmspO1xyXG5cclxuICBpZiAoT2JqZWN0LmtleXMobmV0d29ya0RlZmF1bHRzKS5sZW5ndGggPT09IDApIHtcclxuICAgIGRlZmF1bHRUb2tlbnNFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBwYWRkaW5nOiAxNnB4O1wiPk5vIGRlZmF1bHQgdG9rZW5zIGZvciB0aGlzIG5ldHdvcms8L3A+JztcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGxldCBodG1sID0gJyc7XHJcbiAgZm9yIChjb25zdCBzeW1ib2wgaW4gbmV0d29ya0RlZmF1bHRzKSB7XHJcbiAgICBjb25zdCB0b2tlbiA9IG5ldHdvcmtEZWZhdWx0c1tzeW1ib2xdO1xyXG4gICAgY29uc3QgaXNFbmFibGVkID0gZW5hYmxlZERlZmF1bHRzLmluY2x1ZGVzKHN5bWJvbCk7XHJcblxyXG4gICAgLy8gRmV0Y2ggYmFsYW5jZSBpZiBlbmFibGVkXHJcbiAgICBsZXQgYmFsYW5jZVRleHQgPSAnLSc7XHJcbiAgICBsZXQgYmFsYW5jZVRvb2x0aXAgPSAnJztcclxuICAgIGxldCB1c2RWYWx1ZSA9IG51bGw7XHJcbiAgICBpZiAoaXNFbmFibGVkICYmIGN1cnJlbnRTdGF0ZS5hZGRyZXNzKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgYmFsYW5jZVdlaSA9IGF3YWl0IGVyYzIwLmdldFRva2VuQmFsYW5jZShuZXR3b3JrLCB0b2tlbi5hZGRyZXNzLCBjdXJyZW50U3RhdGUuYWRkcmVzcyk7XHJcbiAgICAgICAgY29uc3QgcmF3QmFsYW5jZSA9IGVyYzIwLmZvcm1hdFRva2VuQmFsYW5jZShiYWxhbmNlV2VpLCB0b2tlbi5kZWNpbWFscywgNCk7XHJcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkID0gZm9ybWF0QmFsYW5jZVdpdGhDb21tYXMocmF3QmFsYW5jZSwgdG9rZW4uZGVjaW1hbHMpO1xyXG4gICAgICAgIGJhbGFuY2VUZXh0ID0gZm9ybWF0dGVkLmRpc3BsYXk7XHJcbiAgICAgICAgYmFsYW5jZVRvb2x0aXAgPSBmb3JtYXR0ZWQudG9vbHRpcDtcclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIFVTRCB2YWx1ZSBpZiBwcmljZXMgYXZhaWxhYmxlXHJcbiAgICAgICAgaWYgKGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcykge1xyXG4gICAgICAgICAgdXNkVmFsdWUgPSBnZXRUb2tlblZhbHVlVVNEKHN5bWJvbCwgYmFsYW5jZVdlaSwgdG9rZW4uZGVjaW1hbHMsIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGJhbGFuY2VUZXh0ID0gJ0Vycm9yJztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxvZ29VcmwgPSB0b2tlbi5sb2dvID8gY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBhc3NldHMvbG9nb3MvJHt0b2tlbi5sb2dvfWApIDogJyc7XHJcblxyXG4gICAgaHRtbCArPSBgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJ0b2tlbi1pdGVtXCIgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IHBhZGRpbmc6IDEycHggOHB4OyBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tdGVybWluYWwtYm9yZGVyKTtcIj5cclxuICAgICAgICAke3Rva2VuLmxvZ28gP1xyXG4gICAgICAgICAgKHRva2VuLmhvbWVVcmwgP1xyXG4gICAgICAgICAgICBgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgYWx0PVwiJHtlc2NhcGVIdG1sKHRva2VuLnN5bWJvbCl9XCIgc3R5bGU9XCJ3aWR0aDogMzJweDsgaGVpZ2h0OiAzMnB4OyBtYXJnaW4tcmlnaHQ6IDEycHg7IGJvcmRlci1yYWRpdXM6IDUwJTsgY3Vyc29yOiBwb2ludGVyO1wiIGNsYXNzPVwidG9rZW4tbG9nby1saW5rXCIgZGF0YS11cmw9XCIke3Rva2VuLmhvbWVVcmx9XCIgdGl0bGU9XCJWaXNpdCAke2VzY2FwZUh0bWwodG9rZW4ubmFtZSl9IGhvbWVwYWdlXCIgLz5gIDpcclxuICAgICAgICAgICAgYDxpbWcgc3JjPVwiJHtsb2dvVXJsfVwiIGFsdD1cIiR7ZXNjYXBlSHRtbCh0b2tlbi5zeW1ib2wpfVwiIHN0eWxlPVwid2lkdGg6IDMycHg7IGhlaWdodDogMzJweDsgbWFyZ2luLXJpZ2h0OiAxMnB4OyBib3JkZXItcmFkaXVzOiA1MCU7XCIgLz5gKSA6XHJcbiAgICAgICAgICAnPGRpdiBzdHlsZT1cIndpZHRoOiAzMnB4OyBoZWlnaHQ6IDMycHg7IG1hcmdpbi1yaWdodDogMTJweDsgYmFja2dyb3VuZDogdmFyKC0tdGVybWluYWwtYm9yZGVyKTsgYm9yZGVyLXJhZGl1czogNTAlO1wiPjwvZGl2Pid9XHJcbiAgICAgICAgPGRpdiBzdHlsZT1cImZsZXg6IDE7XCI+XHJcbiAgICAgICAgICA8cCBzdHlsZT1cImZvbnQtc2l6ZTogMTVweDsgZm9udC13ZWlnaHQ6IGJvbGQ7XCI+JHtlc2NhcGVIdG1sKHRva2VuLnN5bWJvbCl9PC9wPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LWRpbSAke3Rva2VuLmRleFNjcmVlbmVyVXJsID8gJ3Rva2VuLW5hbWUtbGluaycgOiAnJ31cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTNweDsgJHt0b2tlbi5kZXhTY3JlZW5lclVybCA/ICdjdXJzb3I6IHBvaW50ZXI7IHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOycgOiAnJ31cIiAke3Rva2VuLmRleFNjcmVlbmVyVXJsID8gYGRhdGEtdXJsPVwiJHt0b2tlbi5kZXhTY3JlZW5lclVybH1cIiB0aXRsZT1cIlZpZXcgJHtlc2NhcGVIdG1sKHRva2VuLm5hbWUpfSBvbiBEZXhTY3JlZW5lclwiYCA6ICcnfT4ke2VzY2FwZUh0bWwodG9rZW4ubmFtZSl9PC9wPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBmb250LWZhbWlseTogdmFyKC0tZm9udC1tb25vKTsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiA0cHg7XCI+XHJcbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwibWF4LXdpZHRoOiA4MHB4OyBvdmVyZmxvdzogaGlkZGVuOyB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcIj4ke3Rva2VuLmFkZHJlc3N9PC9zcGFuPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiY29weS1hZGRyZXNzLWJ0blwiIGRhdGEtYWRkcmVzcz1cIiR7dG9rZW4uYWRkcmVzc31cIiBzdHlsZT1cImJhY2tncm91bmQ6IG5vbmU7IGJvcmRlcjogbm9uZTsgY29sb3I6IHZhcigtLXRlcm1pbmFsLWFjY2VudCk7IGN1cnNvcjogcG9pbnRlcjsgZm9udC1zaXplOiAxMXB4OyBwYWRkaW5nOiAycHggNHB4O1wiIHRpdGxlPVwiQ29weSBjb250cmFjdCBhZGRyZXNzXCI+8J+TizwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgJHtpc0VuYWJsZWQgPyBgXHJcbiAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTNweDsgY3Vyc29yOiBoZWxwO1wiIHRpdGxlPVwiJHtiYWxhbmNlVG9vbHRpcH1cIj5CYWxhbmNlOiAke2JhbGFuY2VUZXh0fTwvcD5cclxuICAgICAgICAgICAgJHt1c2RWYWx1ZSAhPT0gbnVsbCA/IGA8cCBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDEycHg7IG1hcmdpbi10b3A6IDJweDtcIj4ke2Zvcm1hdFVTRCh1c2RWYWx1ZSl9PC9wPmAgOiAnJ31cclxuICAgICAgICAgIGAgOiAnJ31cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgbWFyZ2luLWxlZnQ6IDhweDtcIj5cclxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJ2aWV3LXRva2VuLWRldGFpbHMtYnRuXCIgZGF0YS10b2tlbi1zeW1ib2w9XCIke3N5bWJvbH1cIiBkYXRhLWlzLWRlZmF1bHQ9XCJ0cnVlXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiB2YXIoLS10ZXJtaW5hbC1hY2NlbnQpOyBib3JkZXI6IG5vbmU7IGNvbG9yOiAjMDAwOyBjdXJzb3I6IHBvaW50ZXI7IGZvbnQtc2l6ZTogMThweDsgcGFkZGluZzogNHB4IDhweDsgYm9yZGVyLXJhZGl1czogNHB4O1wiIHRpdGxlPVwiVmlldyB0b2tlbiBkZXRhaWxzXCI+4oS577iPPC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuICB9XHJcblxyXG4gIGRlZmF1bHRUb2tlbnNFbC5pbm5lckhUTUwgPSBodG1sO1xyXG5cclxuICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciB2aWV3IGRldGFpbHMgYnV0dG9uc1xyXG4gIGRlZmF1bHRUb2tlbnNFbC5xdWVyeVNlbGVjdG9yQWxsKCcudmlldy10b2tlbi1kZXRhaWxzLWJ0bicpLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHN5bWJvbCA9IGUudGFyZ2V0LmRhdGFzZXQudG9rZW5TeW1ib2w7XHJcbiAgICAgIGNvbnN0IGlzRGVmYXVsdCA9IGUudGFyZ2V0LmRhdGFzZXQuaXNEZWZhdWx0ID09PSAndHJ1ZSc7XHJcbiAgICAgIHNob3dUb2tlbkRldGFpbHMoc3ltYm9sLCBpc0RlZmF1bHQpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGNvcHkgYWRkcmVzcyBidXR0b25zXHJcbiAgZGVmYXVsdFRva2Vuc0VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb3B5LWFkZHJlc3MtYnRuJykuZm9yRWFjaChidG4gPT4ge1xyXG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGUpID0+IHtcclxuICAgICAgY29uc3QgYWRkcmVzcyA9IGUudGFyZ2V0LmRhdGFzZXQuYWRkcmVzcztcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChhZGRyZXNzKTtcclxuICAgICAgICBjb25zdCBvcmlnaW5hbFRleHQgPSBlLnRhcmdldC50ZXh0Q29udGVudDtcclxuICAgICAgICBlLnRhcmdldC50ZXh0Q29udGVudCA9ICfinJMnO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgZS50YXJnZXQudGV4dENvbnRlbnQgPSBvcmlnaW5hbFRleHQ7XHJcbiAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNvcHkgYWRkcmVzczonLCBlcnJvcik7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBsb2dvIGNsaWNrcyAob3BlbiBob21lcGFnZSlcclxuICBkZWZhdWx0VG9rZW5zRWwucXVlcnlTZWxlY3RvckFsbCgnLnRva2VuLWxvZ28tbGluaycpLmZvckVhY2goaW1nID0+IHtcclxuICAgIGltZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGUudGFyZ2V0LmRhdGFzZXQudXJsO1xyXG4gICAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmwgfSk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgbmFtZSBjbGlja3MgKG9wZW4gRGV4U2NyZWVuZXIpXHJcbiAgZGVmYXVsdFRva2Vuc0VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2tlbi1uYW1lLWxpbmsnKS5mb3JFYWNoKHAgPT4ge1xyXG4gICAgcC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LnVybDtcclxuICAgICAgaWYgKHVybCkge1xyXG4gICAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybCB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlbmRlckN1c3RvbVRva2VucyhuZXR3b3JrKSB7XHJcbiAgY29uc3QgY3VzdG9tVG9rZW5zRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VzdG9tLXRva2Vucy1saXN0Jyk7XHJcbiAgY29uc3QgY3VzdG9tVG9rZW5zID0gYXdhaXQgdG9rZW5zLmdldEN1c3RvbVRva2VucyhuZXR3b3JrKTtcclxuXHJcbiAgaWYgKGN1c3RvbVRva2Vucy5sZW5ndGggPT09IDApIHtcclxuICAgIGN1c3RvbVRva2Vuc0VsLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDExcHg7IHBhZGRpbmc6IDE2cHg7XCI+Tm8gY3VzdG9tIHRva2VucyBhZGRlZDwvcD4nO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgbGV0IGh0bWwgPSAnJztcclxuICBmb3IgKGNvbnN0IHRva2VuIG9mIGN1c3RvbVRva2Vucykge1xyXG4gICAgLy8gRmV0Y2ggYmFsYW5jZVxyXG4gICAgbGV0IGJhbGFuY2VUZXh0ID0gJy0nO1xyXG4gICAgbGV0IGJhbGFuY2VUb29sdGlwID0gJyc7XHJcbiAgICBsZXQgdXNkVmFsdWUgPSBudWxsO1xyXG4gICAgaWYgKGN1cnJlbnRTdGF0ZS5hZGRyZXNzKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgYmFsYW5jZVdlaSA9IGF3YWl0IGVyYzIwLmdldFRva2VuQmFsYW5jZShuZXR3b3JrLCB0b2tlbi5hZGRyZXNzLCBjdXJyZW50U3RhdGUuYWRkcmVzcyk7XHJcbiAgICAgICAgY29uc3QgcmF3QmFsYW5jZSA9IGVyYzIwLmZvcm1hdFRva2VuQmFsYW5jZShiYWxhbmNlV2VpLCB0b2tlbi5kZWNpbWFscywgNCk7XHJcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkID0gZm9ybWF0QmFsYW5jZVdpdGhDb21tYXMocmF3QmFsYW5jZSwgdG9rZW4uZGVjaW1hbHMpO1xyXG4gICAgICAgIGJhbGFuY2VUZXh0ID0gZm9ybWF0dGVkLmRpc3BsYXk7XHJcbiAgICAgICAgYmFsYW5jZVRvb2x0aXAgPSBmb3JtYXR0ZWQudG9vbHRpcDtcclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIFVTRCB2YWx1ZSBpZiBwcmljZXMgYXZhaWxhYmxlIGFuZCB0b2tlbiBpcyBrbm93blxyXG4gICAgICAgIGlmIChjdXJyZW50U3RhdGUudG9rZW5QcmljZXMpIHtcclxuICAgICAgICAgIHVzZFZhbHVlID0gZ2V0VG9rZW5WYWx1ZVVTRCh0b2tlbi5zeW1ib2wsIGJhbGFuY2VXZWksIHRva2VuLmRlY2ltYWxzLCBjdXJyZW50U3RhdGUudG9rZW5QcmljZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBiYWxhbmNlVGV4dCA9ICdFcnJvcic7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsb2dvVXJsID0gdG9rZW4ubG9nbyA/IGNocm9tZS5ydW50aW1lLmdldFVSTChgYXNzZXRzL2xvZ29zLyR7dG9rZW4ubG9nb31gKSA6ICcnO1xyXG5cclxuICAgIGh0bWwgKz0gYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwidG9rZW4taXRlbVwiIHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBwYWRkaW5nOiAxMnB4IDhweDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRlcm1pbmFsLWJvcmRlcik7XCI+XHJcbiAgICAgICAgJHt0b2tlbi5sb2dvID9cclxuICAgICAgICAgICh0b2tlbi5ob21lVXJsID9cclxuICAgICAgICAgICAgYDxpbWcgc3JjPVwiJHtsb2dvVXJsfVwiIGFsdD1cIiR7ZXNjYXBlSHRtbCh0b2tlbi5zeW1ib2wpfVwiIHN0eWxlPVwid2lkdGg6IDMycHg7IGhlaWdodDogMzJweDsgbWFyZ2luLXJpZ2h0OiAxMnB4OyBib3JkZXItcmFkaXVzOiA1MCU7IGN1cnNvcjogcG9pbnRlcjtcIiBjbGFzcz1cInRva2VuLWxvZ28tbGlua1wiIGRhdGEtdXJsPVwiJHt0b2tlbi5ob21lVXJsfVwiIHRpdGxlPVwiVmlzaXQgJHtlc2NhcGVIdG1sKHRva2VuLm5hbWUpfSBob21lcGFnZVwiIC8+YCA6XHJcbiAgICAgICAgICAgIGA8aW1nIHNyYz1cIiR7bG9nb1VybH1cIiBhbHQ9XCIke2VzY2FwZUh0bWwodG9rZW4uc3ltYm9sKX1cIiBzdHlsZT1cIndpZHRoOiAzMnB4OyBoZWlnaHQ6IDMycHg7IG1hcmdpbi1yaWdodDogMTJweDsgYm9yZGVyLXJhZGl1czogNTAlO1wiIC8+YCkgOlxyXG4gICAgICAgICAgJzxkaXYgc3R5bGU9XCJ3aWR0aDogMzJweDsgaGVpZ2h0OiAzMnB4OyBtYXJnaW4tcmlnaHQ6IDEycHg7IGJhY2tncm91bmQ6IHZhcigtLXRlcm1pbmFsLWJvcmRlcik7IGJvcmRlci1yYWRpdXM6IDUwJTtcIj48L2Rpdj4nfVxyXG4gICAgICAgIDxkaXYgc3R5bGU9XCJmbGV4OiAxO1wiPlxyXG4gICAgICAgICAgPHAgc3R5bGU9XCJmb250LXNpemU6IDE1cHg7IGZvbnQtd2VpZ2h0OiBib2xkO1wiPiR7ZXNjYXBlSHRtbCh0b2tlbi5zeW1ib2wpfTwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW0gJHt0b2tlbi5kZXhTY3JlZW5lclVybCA/ICd0b2tlbi1uYW1lLWxpbmsnIDogJyd9XCIgc3R5bGU9XCJmb250LXNpemU6IDEzcHg7ICR7dG9rZW4uZGV4U2NyZWVuZXJVcmwgPyAnY3Vyc29yOiBwb2ludGVyOyB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsnIDogJyd9XCIgJHt0b2tlbi5kZXhTY3JlZW5lclVybCA/IGBkYXRhLXVybD1cIiR7dG9rZW4uZGV4U2NyZWVuZXJVcmx9XCIgdGl0bGU9XCJWaWV3ICR7ZXNjYXBlSHRtbCh0b2tlbi5uYW1lKX0gb24gRGV4U2NyZWVuZXJcImAgOiAnJ30+JHtlc2NhcGVIdG1sKHRva2VuLm5hbWUpfTwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDsgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtbW9ubyk7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogNHB4O1wiPlxyXG4gICAgICAgICAgICA8c3BhbiBzdHlsZT1cIm1heC13aWR0aDogODBweDsgb3ZlcmZsb3c6IGhpZGRlbjsgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XCI+JHt0b2tlbi5hZGRyZXNzfTwvc3Bhbj5cclxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImNvcHktYWRkcmVzcy1idG5cIiBkYXRhLWFkZHJlc3M9XCIke3Rva2VuLmFkZHJlc3N9XCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiBub25lOyBib3JkZXI6IG5vbmU7IGNvbG9yOiB2YXIoLS10ZXJtaW5hbC1hY2NlbnQpOyBjdXJzb3I6IHBvaW50ZXI7IGZvbnQtc2l6ZTogMTFweDsgcGFkZGluZzogMnB4IDRweDtcIiB0aXRsZT1cIkNvcHkgY29udHJhY3QgYWRkcmVzc1wiPvCfk4s8L2J1dHRvbj5cclxuICAgICAgICAgIDwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTNweDsgY3Vyc29yOiBoZWxwO1wiIHRpdGxlPVwiJHtiYWxhbmNlVG9vbHRpcH1cIj5CYWxhbmNlOiAke2JhbGFuY2VUZXh0fTwvcD5cclxuICAgICAgICAgICR7dXNkVmFsdWUgIT09IG51bGwgPyBgPHAgY2xhc3M9XCJ0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMnB4OyBtYXJnaW4tdG9wOiAycHg7XCI+JHtmb3JtYXRVU0QodXNkVmFsdWUpfTwvcD5gIDogJyd9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IGdhcDogNnB4OyBhbGlnbi1pdGVtczogY2VudGVyOyBtYXJnaW4tbGVmdDogOHB4OyBtaW4td2lkdGg6IDgwcHg7XCI+XHJcbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwidmlldy10b2tlbi1kZXRhaWxzLWJ0blwiIGRhdGEtdG9rZW4tc3ltYm9sPVwiJHt0b2tlbi5zeW1ib2x9XCIgZGF0YS1pcy1kZWZhdWx0PVwiZmFsc2VcIiBkYXRhLXRva2VuLWFkZHJlc3M9XCIke3Rva2VuLmFkZHJlc3N9XCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiB2YXIoLS10ZXJtaW5hbC1hY2NlbnQpOyBib3JkZXI6IG5vbmU7IGNvbG9yOiAjMDAwOyBjdXJzb3I6IHBvaW50ZXI7IGZvbnQtc2l6ZTogMThweDsgcGFkZGluZzogNHB4IDhweDsgYm9yZGVyLXJhZGl1czogNHB4O1wiIHRpdGxlPVwiVmlldyB0b2tlbiBkZXRhaWxzXCI+4oS577iPPC9idXR0b24+XHJcbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuLWRhbmdlciBidG4tc21hbGwgcmVtb3ZlLXRva2VuLWJ0blwiIGRhdGEtdG9rZW4tYWRkcmVzcz1cIiR7dG9rZW4uYWRkcmVzc31cIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBmb250LXNpemU6IDlweDsgcGFkZGluZzogMnB4IDRweDtcIj5SRU1PVkU8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG4gIH1cclxuXHJcbiAgY3VzdG9tVG9rZW5zRWwuaW5uZXJIVE1MID0gaHRtbDtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgdmlldyBkZXRhaWxzIGJ1dHRvbnNcclxuICBjdXN0b21Ub2tlbnNFbC5xdWVyeVNlbGVjdG9yQWxsKCcudmlldy10b2tlbi1kZXRhaWxzLWJ0bicpLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHN5bWJvbCA9IGUudGFyZ2V0LmRhdGFzZXQudG9rZW5TeW1ib2w7XHJcbiAgICAgIGNvbnN0IGlzRGVmYXVsdCA9IGUudGFyZ2V0LmRhdGFzZXQuaXNEZWZhdWx0ID09PSAndHJ1ZSc7XHJcbiAgICAgIGNvbnN0IGFkZHJlc3MgPSBlLnRhcmdldC5kYXRhc2V0LnRva2VuQWRkcmVzcztcclxuICAgICAgc2hvd1Rva2VuRGV0YWlscyhzeW1ib2wsIGlzRGVmYXVsdCwgYWRkcmVzcyk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgcmVtb3ZlIGJ1dHRvbnNcclxuICBjdXN0b21Ub2tlbnNFbC5xdWVyeVNlbGVjdG9yQWxsKCcucmVtb3ZlLXRva2VuLWJ0bicpLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFkZHJlc3MgPSBlLnRhcmdldC5kYXRhc2V0LnRva2VuQWRkcmVzcztcclxuICAgICAgaWYgKGNvbmZpcm0oJ1JlbW92ZSB0aGlzIHRva2VuIGZyb20geW91ciBsaXN0PycpKSB7XHJcbiAgICAgICAgYXdhaXQgdG9rZW5zLnJlbW92ZUN1c3RvbVRva2VuKG5ldHdvcmssIGFkZHJlc3MpO1xyXG4gICAgICAgIGF3YWl0IHJlbmRlclRva2Vuc1NjcmVlbigpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgY29weSBhZGRyZXNzIGJ1dHRvbnNcclxuICBjdXN0b21Ub2tlbnNFbC5xdWVyeVNlbGVjdG9yQWxsKCcuY29weS1hZGRyZXNzLWJ0bicpLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFkZHJlc3MgPSBlLnRhcmdldC5kYXRhc2V0LmFkZHJlc3M7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoYWRkcmVzcyk7XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gZS50YXJnZXQudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgZS50YXJnZXQudGV4dENvbnRlbnQgPSAn4pyTJztcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIGUudGFyZ2V0LnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0O1xyXG4gICAgICAgIH0sIDEwMDApO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjb3B5IGFkZHJlc3M6JywgZXJyb3IpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgbG9nbyBjbGlja3MgKG9wZW4gaG9tZXBhZ2UpXHJcbiAgY3VzdG9tVG9rZW5zRWwucXVlcnlTZWxlY3RvckFsbCgnLnRva2VuLWxvZ28tbGluaycpLmZvckVhY2goaW1nID0+IHtcclxuICAgIGltZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGUudGFyZ2V0LmRhdGFzZXQudXJsO1xyXG4gICAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmwgfSk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgbmFtZSBjbGlja3MgKG9wZW4gRGV4U2NyZWVuZXIpXHJcbiAgY3VzdG9tVG9rZW5zRWwucXVlcnlTZWxlY3RvckFsbCgnLnRva2VuLW5hbWUtbGluaycpLmZvckVhY2gocCA9PiB7XHJcbiAgICBwLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICAgICAgY29uc3QgdXJsID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudXJsO1xyXG4gICAgICBpZiAodXJsKSB7XHJcbiAgICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gPT09PT0gVE9LRU4gREVUQUlMUyBTQ1JFRU4gPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gc2hvd1Rva2VuRGV0YWlscyhzeW1ib2wsIGlzRGVmYXVsdCwgY3VzdG9tQWRkcmVzcyA9IG51bGwpIHtcclxuICBjb25zdCBuZXR3b3JrID0gY3VycmVudFN0YXRlLm5ldHdvcms7XHJcblxyXG4gIC8vIEdldCB0b2tlbiBkYXRhXHJcbiAgbGV0IHRva2VuRGF0YTtcclxuICBpZiAoaXNEZWZhdWx0KSB7XHJcbiAgICB0b2tlbkRhdGEgPSB0b2tlbnMuREVGQVVMVF9UT0tFTlNbbmV0d29ya11bc3ltYm9sXTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gRmluZCBpbiBjdXN0b20gdG9rZW5zXHJcbiAgICBjb25zdCBjdXN0b21Ub2tlbnMgPSBhd2FpdCB0b2tlbnMuZ2V0Q3VzdG9tVG9rZW5zKG5ldHdvcmspO1xyXG4gICAgdG9rZW5EYXRhID0gY3VzdG9tVG9rZW5zLmZpbmQodCA9PiB0LmFkZHJlc3MudG9Mb3dlckNhc2UoKSA9PT0gY3VzdG9tQWRkcmVzcy50b0xvd2VyQ2FzZSgpKTtcclxuICB9XHJcblxyXG4gIGlmICghdG9rZW5EYXRhKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdUb2tlbiBub3QgZm91bmQ6Jywgc3ltYm9sKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIFN0b3JlIGN1cnJlbnQgdG9rZW4gaW4gc3RhdGVcclxuICBjdXJyZW50U3RhdGUuY3VycmVudFRva2VuRGV0YWlscyA9IHtcclxuICAgIC4uLnRva2VuRGF0YSxcclxuICAgIHN5bWJvbCxcclxuICAgIGlzRGVmYXVsdFxyXG4gIH07XHJcblxyXG4gIC8vIFVwZGF0ZSB0aXRsZVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXRpdGxlJykudGV4dENvbnRlbnQgPSBzeW1ib2wudG9VcHBlckNhc2UoKTtcclxuXHJcbiAgLy8gVXBkYXRlIHRva2VuIGluZm9cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1uYW1lJykudGV4dENvbnRlbnQgPSB0b2tlbkRhdGEubmFtZTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1zeW1ib2wnKS50ZXh0Q29udGVudCA9IHN5bWJvbDtcclxuXHJcbiAgLy8gVXBkYXRlIGxvZ29cclxuICBjb25zdCBsb2dvQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtbG9nby1jb250YWluZXInKTtcclxuICBpZiAodG9rZW5EYXRhLmxvZ28pIHtcclxuICAgIGNvbnN0IGxvZ29VcmwgPSBjaHJvbWUucnVudGltZS5nZXRVUkwoYGFzc2V0cy9sb2dvcy8ke3Rva2VuRGF0YS5sb2dvfWApO1xyXG4gICAgbG9nb0NvbnRhaW5lci5pbm5lckhUTUwgPSBgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgYWx0PVwiJHtzeW1ib2x9XCIgc3R5bGU9XCJ3aWR0aDogNDhweDsgaGVpZ2h0OiA0OHB4OyBib3JkZXItcmFkaXVzOiA1MCU7XCIgLz5gO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsb2dvQ29udGFpbmVyLmlubmVySFRNTCA9ICc8ZGl2IHN0eWxlPVwid2lkdGg6IDQ4cHg7IGhlaWdodDogNDhweDsgYmFja2dyb3VuZDogdmFyKC0tdGVybWluYWwtYm9yZGVyKTsgYm9yZGVyLXJhZGl1czogNTAlO1wiPjwvZGl2Pic7XHJcbiAgfVxyXG5cclxuICAvLyBGZXRjaCBhbmQgdXBkYXRlIGJhbGFuY2VcclxuICB0cnkge1xyXG4gICAgY29uc3QgYmFsYW5jZVdlaSA9IGF3YWl0IGVyYzIwLmdldFRva2VuQmFsYW5jZShuZXR3b3JrLCB0b2tlbkRhdGEuYWRkcmVzcywgY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgY29uc3QgYmFsYW5jZUZvcm1hdHRlZCA9IGVyYzIwLmZvcm1hdFRva2VuQmFsYW5jZShiYWxhbmNlV2VpLCB0b2tlbkRhdGEuZGVjaW1hbHMsIDgpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtYmFsYW5jZScpLnRleHRDb250ZW50ID0gYmFsYW5jZUZvcm1hdHRlZDtcclxuXHJcbiAgICAvLyBVcGRhdGUgVVNEIHZhbHVlXHJcbiAgICBpZiAoY3VycmVudFN0YXRlLnRva2VuUHJpY2VzICYmIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlc1tzeW1ib2xdKSB7XHJcbiAgICAgIGNvbnN0IHVzZFZhbHVlID0gZ2V0VG9rZW5WYWx1ZVVTRChzeW1ib2wsIGJhbGFuY2VXZWksIHRva2VuRGF0YS5kZWNpbWFscywgY3VycmVudFN0YXRlLnRva2VuUHJpY2VzKTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtYmFsYW5jZS11c2QnKS50ZXh0Q29udGVudCA9IGZvcm1hdFVTRCh1c2RWYWx1ZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1iYWxhbmNlLXVzZCcpLnRleHRDb250ZW50ID0gJ+KAlCc7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHRva2VuIGJhbGFuY2U6JywgZXJyb3IpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtYmFsYW5jZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWJhbGFuY2UtdXNkJykudGV4dENvbnRlbnQgPSAn4oCUJztcclxuICB9XHJcblxyXG4gIC8vIFVwZGF0ZSBwcmljZVxyXG4gIGlmIChjdXJyZW50U3RhdGUudG9rZW5QcmljZXMgJiYgY3VycmVudFN0YXRlLnRva2VuUHJpY2VzW3N5bWJvbF0pIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXByaWNlJykudGV4dENvbnRlbnQgPSBmb3JtYXRVU0QoY3VycmVudFN0YXRlLnRva2VuUHJpY2VzW3N5bWJvbF0pO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1wcmljZScpLnRleHRDb250ZW50ID0gJ+KAlCc7XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGUgbGlua3NcclxuICBjb25zdCBob21lTGluayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWhvbWUtbGluaycpO1xyXG4gIGlmICh0b2tlbkRhdGEuaG9tZVVybCkge1xyXG4gICAgaG9tZUxpbmsuaHJlZiA9IHRva2VuRGF0YS5ob21lVXJsO1xyXG4gICAgaG9tZUxpbmsuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGhvbWVMaW5rLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZGV4TGluayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWRleC1saW5rJyk7XHJcbiAgaWYgKHRva2VuRGF0YS5kZXhTY3JlZW5lclVybCkge1xyXG4gICAgZGV4TGluay5ocmVmID0gdG9rZW5EYXRhLmRleFNjcmVlbmVyVXJsO1xyXG4gICAgZGV4TGluay5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9IGVsc2Uge1xyXG4gICAgZGV4TGluay5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9XHJcblxyXG4gIC8vIFNvdXJjaWZ5IGxpbmtcclxuICBjb25zdCBjaGFpbklkID0gbmV0d29yayA9PT0gJ3B1bHNlY2hhaW4nID8gMzY5IDogbmV0d29yayA9PT0gJ3B1bHNlY2hhaW5UZXN0bmV0JyA/IDk0MyA6IDE7XHJcbiAgY29uc3Qgc291cmNpZnlMaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtc291cmNpZnktbGluaycpO1xyXG4gIHNvdXJjaWZ5TGluay5ocmVmID0gYGh0dHBzOi8vcmVwby5zb3VyY2lmeS5kZXYvJHtjaGFpbklkfS8ke3Rva2VuRGF0YS5hZGRyZXNzfWA7XHJcblxyXG4gIC8vIENvbnRyYWN0IGFkZHJlc3NcclxuICBjb25zdCBzaG9ydEFkZHJlc3MgPSBgJHt0b2tlbkRhdGEuYWRkcmVzcy5zbGljZSgwLCA2KX0uLi4ke3Rva2VuRGF0YS5hZGRyZXNzLnNsaWNlKC00KX1gO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWFkZHJlc3Mtc2hvcnQnKS50ZXh0Q29udGVudCA9IHNob3J0QWRkcmVzcztcclxuXHJcbiAgLy8gTWFuYWdlbWVudCBwYW5lbCAoc2hvdyBvbmx5IGZvciBkZWZhdWx0IHRva2VucylcclxuICBjb25zdCBtYW5hZ2VtZW50UGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1tYW5hZ2VtZW50LXBhbmVsJyk7XHJcbiAgaWYgKGlzRGVmYXVsdCkge1xyXG4gICAgbWFuYWdlbWVudFBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG5cclxuICAgIC8vIFNldCB0b2dnbGUgc3RhdGVcclxuICAgIGNvbnN0IGVuYWJsZVRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWVuYWJsZS10b2dnbGUnKTtcclxuICAgIGNvbnN0IGVuYWJsZUxhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtZW5hYmxlLWxhYmVsJyk7XHJcbiAgICBjb25zdCBlbmFibGVkVG9rZW5zID0gYXdhaXQgdG9rZW5zLmdldEVuYWJsZWREZWZhdWx0VG9rZW5zKG5ldHdvcmspO1xyXG4gICAgY29uc3QgaXNUb2tlbkVuYWJsZWQgPSBlbmFibGVkVG9rZW5zLmluY2x1ZGVzKHN5bWJvbCk7XHJcblxyXG4gICAgZW5hYmxlVG9nZ2xlLmNoZWNrZWQgPSBpc1Rva2VuRW5hYmxlZDtcclxuICAgIGVuYWJsZUxhYmVsLnRleHRDb250ZW50ID0gaXNUb2tlbkVuYWJsZWQgPyAnRW5hYmxlZCcgOiAnRGlzYWJsZWQnO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBtYW5hZ2VtZW50UGFuZWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfVxyXG5cclxuICAvLyBDbGVhciBzZW5kIGZvcm1cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1yZWNpcGllbnQnKS52YWx1ZSA9ICcnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWFtb3VudCcpLnZhbHVlID0gJyc7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtcGFzc3dvcmQnKS52YWx1ZSA9ICcnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXNlbmQtZXJyb3InKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gU2hvdyBmb3JtIGFuZCBoaWRlIHN0YXR1cyBzZWN0aW9uIChyZXNldCBzdGF0ZSlcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tc2VuZC1mb3JtJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXNlbmQtc3RhdHVzLXNlY3Rpb24nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gU2hvdyBzY3JlZW5cclxuICBzaG93U2NyZWVuKCdzY3JlZW4tdG9rZW4tZGV0YWlscycpO1xyXG5cclxuICAvLyBQb3B1bGF0ZSBnYXMgcHJpY2VzIGFuZCBub25jZVxyXG4gIGNvbnN0IG5ldHdvcmtTeW1ib2xzID0ge1xyXG4gICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3RQTFMnLFxyXG4gICAgJ3B1bHNlY2hhaW4nOiAnUExTJyxcclxuICAgICdldGhlcmV1bSc6ICdFVEgnLFxyXG4gICAgJ3NlcG9saWEnOiAnU0VQJ1xyXG4gIH07XHJcbiAgY29uc3QgbmV0d29ya1N5bWJvbCA9IG5ldHdvcmtTeW1ib2xzW25ldHdvcmtdIHx8ICdUT0tFTic7XHJcblxyXG4gIC8vIENyZWF0ZSBhIHRva2VuIHRyYW5zZmVyIHRyYW5zYWN0aW9uIGZvciBnYXMgZXN0aW1hdGlvblxyXG4gIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gIGNvbnN0IHRva2VuQ29udHJhY3QgPSBuZXcgZXRoZXJzLkNvbnRyYWN0KFxyXG4gICAgdG9rZW5EYXRhLmFkZHJlc3MsXHJcbiAgICBbJ2Z1bmN0aW9uIHRyYW5zZmVyKGFkZHJlc3MgdG8sIHVpbnQyNTYgYW1vdW50KSByZXR1cm5zIChib29sKSddLFxyXG4gICAgcHJvdmlkZXJcclxuICApO1xyXG4gIGNvbnN0IGR1bW15QW1vdW50ID0gZXRoZXJzLnBhcnNlVW5pdHMoJzEnLCB0b2tlbkRhdGEuZGVjaW1hbHMpO1xyXG4gIGNvbnN0IHR4UmVxdWVzdCA9IHtcclxuICAgIGZyb206IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLFxyXG4gICAgdG86IHRva2VuRGF0YS5hZGRyZXNzLFxyXG4gICAgZGF0YTogdG9rZW5Db250cmFjdC5pbnRlcmZhY2UuZW5jb2RlRnVuY3Rpb25EYXRhKCd0cmFuc2ZlcicsIFtjdXJyZW50U3RhdGUuYWRkcmVzcywgZHVtbXlBbW91bnRdKVxyXG4gIH07XHJcblxyXG4gIGF3YWl0IHBvcHVsYXRlVG9rZW5HYXNQcmljZXMobmV0d29yaywgdHhSZXF1ZXN0LCBuZXR3b3JrU3ltYm9sKTtcclxuXHJcbiAgLy8gRmV0Y2ggYW5kIGRpc3BsYXkgbm9uY2VcclxuICB0cnkge1xyXG4gICAgY29uc3Qgbm9uY2VIZXggPSBhd2FpdCBycGMuZ2V0VHJhbnNhY3Rpb25Db3VudChuZXR3b3JrLCBjdXJyZW50U3RhdGUuYWRkcmVzcywgJ3BlbmRpbmcnKTtcclxuICAgIGNvbnN0IG5vbmNlID0gcGFyc2VJbnQobm9uY2VIZXgsIDE2KTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1jdXJyZW50LW5vbmNlJykudGV4dENvbnRlbnQgPSBub25jZTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgbm9uY2U6JywgZXJyb3IpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1cnJlbnQtbm9uY2UnKS50ZXh0Q29udGVudCA9ICdFcnJvcic7XHJcbiAgfVxyXG5cclxuICAvLyBTZXR1cCBjdXN0b20gbm9uY2UgY2hlY2tib3hcclxuICBjb25zdCBjdXN0b21Ob25jZUNoZWNrYm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1c3RvbS1ub25jZS1jaGVja2JveCcpO1xyXG4gIGNvbnN0IGN1c3RvbU5vbmNlQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1c3RvbS1ub25jZS1pbnB1dC1jb250YWluZXInKTtcclxuICBjdXN0b21Ob25jZUNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcclxuICBjdXN0b21Ob25jZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gUmVtb3ZlIG9sZCBsaXN0ZW5lciBpZiBleGlzdHMgYW5kIGFkZCBuZXcgb25lXHJcbiAgY29uc3QgbmV3Q2hlY2tib3ggPSBjdXN0b21Ob25jZUNoZWNrYm94LmNsb25lTm9kZSh0cnVlKTtcclxuICBjdXN0b21Ob25jZUNoZWNrYm94LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld0NoZWNrYm94LCBjdXN0b21Ob25jZUNoZWNrYm94KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1c3RvbS1ub25jZS1jaGVja2JveCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XHJcbiAgICBpZiAoZS50YXJnZXQuY2hlY2tlZCkge1xyXG4gICAgICBjdXN0b21Ob25jZUNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgY29uc3QgY3VycmVudE5vbmNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1cnJlbnQtbm9uY2UnKS50ZXh0Q29udGVudDtcclxuICAgICAgaWYgKGN1cnJlbnROb25jZSAhPT0gJy0tJyAmJiBjdXJyZW50Tm9uY2UgIT09ICdFcnJvcicpIHtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tY3VzdG9tLW5vbmNlJykudmFsdWUgPSBjdXJyZW50Tm9uY2U7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGN1c3RvbU5vbmNlQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb3B5VG9rZW5EZXRhaWxzQWRkcmVzcygpIHtcclxuICBjb25zdCB0b2tlbkRhdGEgPSBjdXJyZW50U3RhdGUuY3VycmVudFRva2VuRGV0YWlscztcclxuICBpZiAoIXRva2VuRGF0YSkgcmV0dXJuO1xyXG5cclxuICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0b2tlbkRhdGEuYWRkcmVzcykudGhlbigoKSA9PiB7XHJcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1jb3B5LWFkZHJlc3MnKTtcclxuICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGJ0bi5pbm5lckhUTUw7XHJcbiAgICBidG4uaW5uZXJIVE1MID0gJzxzcGFuPuKckzwvc3Bhbj48c3Bhbj5Db3BpZWQhPC9zcGFuPic7XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgYnRuLmlubmVySFRNTCA9IG9yaWdpbmFsVGV4dDtcclxuICAgIH0sIDIwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUb2tlblNlbmRNYXgoKSB7XHJcbiAgY29uc3QgdG9rZW5EYXRhID0gY3VycmVudFN0YXRlLmN1cnJlbnRUb2tlbkRldGFpbHM7XHJcbiAgaWYgKCF0b2tlbkRhdGEpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBhd2FpdCBlcmMyMC5nZXRUb2tlbkJhbGFuY2UoY3VycmVudFN0YXRlLm5ldHdvcmssIHRva2VuRGF0YS5hZGRyZXNzLCBjdXJyZW50U3RhdGUuYWRkcmVzcyk7XHJcbiAgICBjb25zdCBiYWxhbmNlRm9ybWF0dGVkID0gZXJjMjAuZm9ybWF0VG9rZW5CYWxhbmNlKGJhbGFuY2VXZWksIHRva2VuRGF0YS5kZWNpbWFscywgMTgpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtYW1vdW50JykudmFsdWUgPSBiYWxhbmNlRm9ybWF0dGVkO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIG1heCBiYWxhbmNlOicsIGVycm9yKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRva2VuU2VuZCgpIHtcclxuICBjb25zdCB0b2tlbkRhdGEgPSBjdXJyZW50U3RhdGUuY3VycmVudFRva2VuRGV0YWlscztcclxuICBpZiAoIXRva2VuRGF0YSkgcmV0dXJuO1xyXG5cclxuICBjb25zdCByZWNpcGllbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1yZWNpcGllbnQnKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgYW1vdW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtYW1vdW50JykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtcGFzc3dvcmQnKS52YWx1ZTtcclxuICBjb25zdCBlcnJvckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtc2VuZC1lcnJvcicpO1xyXG5cclxuICAvLyBDbGVhciBwcmV2aW91cyBlcnJvcnNcclxuICBlcnJvckVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAvLyBWYWxpZGF0ZSBpbnB1dHNcclxuICBpZiAoIXJlY2lwaWVudCB8fCAhYW1vdW50IHx8ICFwYXNzd29yZCkge1xyXG4gICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdQbGVhc2UgZmlsbCBhbGwgZmllbGRzJztcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBpZiAoIXJlY2lwaWVudC5zdGFydHNXaXRoKCcweCcpIHx8IHJlY2lwaWVudC5sZW5ndGggIT09IDQyKSB7XHJcbiAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ0ludmFsaWQgcmVjaXBpZW50IGFkZHJlc3MnO1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBEaXNhYmxlIHNlbmQgYnV0dG9uIHRvIHByZXZlbnQgZG91YmxlLWNsaWNraW5nXHJcbiAgICBjb25zdCBzZW5kQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi10b2tlbi1zZW5kJyk7XHJcbiAgICBzZW5kQnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIHNlbmRCdG4uc3R5bGUub3BhY2l0eSA9ICcwLjUnO1xyXG4gICAgc2VuZEJ0bi5zdHlsZS5jdXJzb3IgPSAnbm90LWFsbG93ZWQnO1xyXG5cclxuICAgIGNvbnN0IGFtb3VudEJOID0gZXRoZXJzLnBhcnNlVW5pdHMoYW1vdW50LCB0b2tlbkRhdGEuZGVjaW1hbHMpO1xyXG5cclxuICAgIC8vIENoZWNrIGJhbGFuY2VcclxuICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBhd2FpdCBlcmMyMC5nZXRUb2tlbkJhbGFuY2UoY3VycmVudFN0YXRlLm5ldHdvcmssIHRva2VuRGF0YS5hZGRyZXNzLCBjdXJyZW50U3RhdGUuYWRkcmVzcyk7XHJcbiAgICBpZiAoYW1vdW50Qk4gPiBiYWxhbmNlV2VpKSB7XHJcbiAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSAnSW5zdWZmaWNpZW50IGJhbGFuY2UnO1xyXG4gICAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIHZhbGlkYXRpb24gZXJyb3JcclxuICAgICAgc2VuZEJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICBzZW5kQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgIHNlbmRCdG4uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVW5sb2NrIHdhbGxldCB3aXRoIHBhc3N3b3JkIGFuZCBhdXRvLXVwZ3JhZGUgaWYgbmVlZGVkXHJcbiAgICBsZXQgc2lnbmVyO1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgdW5sb2NrUmVzdWx0ID0gYXdhaXQgdW5sb2NrV2FsbGV0KHBhc3N3b3JkLCB7XHJcbiAgICAgICAgb25VcGdyYWRlU3RhcnQ6IChpbmZvKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhg8J+UkCBBdXRvLXVwZ3JhZGluZyB3YWxsZXQ6ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHNpZ25lciA9IHVubG9ja1Jlc3VsdC5zaWduZXI7XHJcblxyXG4gICAgICBpZiAodW5sb2NrUmVzdWx0LnVwZ3JhZGVkKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYOKchSBXYWxsZXQgdXBncmFkZWQ6ICR7dW5sb2NrUmVzdWx0Lml0ZXJhdGlvbnNCZWZvcmUudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7dW5sb2NrUmVzdWx0Lml0ZXJhdGlvbnNBZnRlci50b0xvY2FsZVN0cmluZygpfWApO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IGVyci5tZXNzYWdlIHx8ICdJbmNvcnJlY3QgcGFzc3dvcmQnO1xyXG4gICAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIHBhc3N3b3JkIGVycm9yXHJcbiAgICAgIHNlbmRCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgc2VuZEJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICBzZW5kQnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCBzZWxlY3RlZCBnYXMgcHJpY2VcclxuICAgIGNvbnN0IGdhc1ByaWNlID0gZ2V0U2VsZWN0ZWRUb2tlbkdhc1ByaWNlKCk7XHJcblxyXG4gICAgLy8gR2V0IGN1c3RvbSBub25jZSBpZiBwcm92aWRlZFxyXG4gICAgY29uc3QgY3VzdG9tTm9uY2VDaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1jdXN0b20tbm9uY2UtY2hlY2tib3gnKTtcclxuICAgIGNvbnN0IGN1c3RvbU5vbmNlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tY3VzdG9tLW5vbmNlJyk7XHJcbiAgICBsZXQgY3VzdG9tTm9uY2UgPSBudWxsO1xyXG4gICAgaWYgKGN1c3RvbU5vbmNlQ2hlY2tib3guY2hlY2tlZCAmJiBjdXN0b21Ob25jZUlucHV0LnZhbHVlKSB7XHJcbiAgICAgIGN1c3RvbU5vbmNlID0gcGFyc2VJbnQoY3VzdG9tTm9uY2VJbnB1dC52YWx1ZSk7XHJcbiAgICAgIGlmIChpc05hTihjdXN0b21Ob25jZSkgfHwgY3VzdG9tTm9uY2UgPCAwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGN1c3RvbSBub25jZScpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IHByb3ZpZGVyIHdpdGggYXV0b21hdGljIGZhaWxvdmVyIGFuZCBjb25uZWN0IHNpZ25lclxyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIoY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG4gICAgY29uc3QgY29ubmVjdGVkU2lnbmVyID0gc2lnbmVyLmNvbm5lY3QocHJvdmlkZXIpO1xyXG5cclxuICAgIC8vIFNlbmQgdG9rZW4gd2l0aCBnYXMgb3B0aW9uc1xyXG4gICAgY29uc3QgdG9rZW5Db250cmFjdCA9IG5ldyBldGhlcnMuQ29udHJhY3QoXHJcbiAgICAgIHRva2VuRGF0YS5hZGRyZXNzLFxyXG4gICAgICBbJ2Z1bmN0aW9uIHRyYW5zZmVyKGFkZHJlc3MgdG8sIHVpbnQyNTYgYW1vdW50KSByZXR1cm5zIChib29sKSddLFxyXG4gICAgICBjb25uZWN0ZWRTaWduZXJcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgdHhPcHRpb25zID0ge307XHJcbiAgICBpZiAoZ2FzUHJpY2UpIHtcclxuICAgICAgdHhPcHRpb25zLmdhc1ByaWNlID0gZ2FzUHJpY2U7XHJcbiAgICB9XHJcbiAgICBpZiAoY3VzdG9tTm9uY2UgIT09IG51bGwpIHtcclxuICAgICAgdHhPcHRpb25zLm5vbmNlID0gY3VzdG9tTm9uY2U7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdHggPSBhd2FpdCB0b2tlbkNvbnRyYWN0LnRyYW5zZmVyKHJlY2lwaWVudCwgYW1vdW50Qk4sIHR4T3B0aW9ucyk7XHJcblxyXG4gICAgLy8gU2F2ZSB0cmFuc2FjdGlvbiB0byBoaXN0b3J5IGFuZCBzdGFydCBtb25pdG9yaW5nXHJcbiAgICBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdTQVZFX0FORF9NT05JVE9SX1RYJyxcclxuICAgICAgYWRkcmVzczogY3VycmVudFN0YXRlLmFkZHJlc3MsXHJcbiAgICAgIHRyYW5zYWN0aW9uOiB7XHJcbiAgICAgICAgaGFzaDogdHguaGFzaCxcclxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgICAgZnJvbTogY3VycmVudFN0YXRlLmFkZHJlc3MsXHJcbiAgICAgICAgdG86IHJlY2lwaWVudCxcclxuICAgICAgICB2YWx1ZTogJzAnLFxyXG4gICAgICAgIGdhc1ByaWNlOiBnYXNQcmljZSB8fCAoYXdhaXQgdHgucHJvdmlkZXIuZ2V0RmVlRGF0YSgpKS5nYXNQcmljZS50b1N0cmluZygpLFxyXG4gICAgICAgIG5vbmNlOiB0eC5ub25jZSxcclxuICAgICAgICBuZXR3b3JrOiBjdXJyZW50U3RhdGUubmV0d29yayxcclxuICAgICAgICBzdGF0dXM6ICdwZW5kaW5nJyxcclxuICAgICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgICB0eXBlOiAndG9rZW4nXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNlbmQgZGVza3RvcCBub3RpZmljYXRpb25cclxuICAgIGlmIChjaHJvbWUubm90aWZpY2F0aW9ucykge1xyXG4gICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBTZW50JyxcclxuICAgICAgICBtZXNzYWdlOiBgU2VuZGluZyAke2Ftb3VudH0gJHt0b2tlbkRhdGEuc3ltYm9sfSB0byAke3JlY2lwaWVudC5zbGljZSgwLCAxMCl9Li4uYCxcclxuICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTaG93IHRyYW5zYWN0aW9uIHN0YXR1cyBzY3JlZW5cclxuICAgIGF3YWl0IHNob3dUb2tlblNlbmRUcmFuc2FjdGlvblN0YXR1cyh0eC5oYXNoLCBjdXJyZW50U3RhdGUubmV0d29yaywgYW1vdW50LCB0b2tlbkRhdGEuc3ltYm9sKTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHNlbmRpbmcgdG9rZW46JywgZXJyb3IpO1xyXG4gICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2UgfHwgJ1RyYW5zYWN0aW9uIGZhaWxlZCc7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG5cclxuICAgIC8vIFJlLWVuYWJsZSBzZW5kIGJ1dHRvbiBvbiBlcnJvclxyXG4gICAgY29uc3Qgc2VuZEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdG9rZW4tc2VuZCcpO1xyXG4gICAgc2VuZEJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgc2VuZEJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgc2VuZEJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUb2tlbkVuYWJsZVRvZ2dsZShlKSB7XHJcbiAgY29uc3QgdG9rZW5EYXRhID0gY3VycmVudFN0YXRlLmN1cnJlbnRUb2tlbkRldGFpbHM7XHJcbiAgaWYgKCF0b2tlbkRhdGEgfHwgIXRva2VuRGF0YS5pc0RlZmF1bHQpIHJldHVybjtcclxuXHJcbiAgY29uc3QgaXNFbmFibGVkID0gZS50YXJnZXQuY2hlY2tlZDtcclxuICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWVuYWJsZS1sYWJlbCcpO1xyXG5cclxuICAvLyBVcGRhdGUgbGFiZWxcclxuICBsYWJlbC50ZXh0Q29udGVudCA9IGlzRW5hYmxlZCA/ICdFbmFibGVkJyA6ICdEaXNhYmxlZCc7XHJcblxyXG4gIC8vIFNhdmUgdG8gc3RvcmFnZVxyXG4gIGF3YWl0IHRva2Vucy50b2dnbGVEZWZhdWx0VG9rZW4oY3VycmVudFN0YXRlLm5ldHdvcmssIHRva2VuRGF0YS5zeW1ib2wsIGlzRW5hYmxlZCk7XHJcblxyXG4gIC8vIE5vdGU6IFdlIGRvbid0IHJlLXJlbmRlciB0aGUgdG9rZW5zIHNjcmVlbiBoZXJlIHRvIGF2b2lkIGxlYXZpbmcgdGhlIGRldGFpbHMgcGFnZVxyXG4gIC8vIFRoZSBjaGFuZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgd2hlbiB0aGUgdXNlciBnb2VzIGJhY2sgdG8gdGhlIHRva2VucyBzY3JlZW5cclxufVxyXG5cclxuZnVuY3Rpb24gc2hvd0FkZFRva2VuTW9kYWwoKSB7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LXRva2VuLWFkZHJlc3MnKS52YWx1ZSA9ICcnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1wcmV2aWV3JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZC10b2tlbi1lcnJvcicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtdG9rZW4nKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxufVxyXG5cclxubGV0IHRva2VuVmFsaWRhdGlvblRpbWVvdXQ7XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRva2VuQWRkcmVzc0lucHV0KGUpIHtcclxuICBjb25zdCBhZGRyZXNzID0gZS50YXJnZXQudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IHByZXZpZXdFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1wcmV2aWV3Jyk7XHJcbiAgY29uc3QgZXJyb3JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtdG9rZW4tZXJyb3InKTtcclxuXHJcbiAgLy8gQ2xlYXIgcHJldmlvdXMgdGltZW91dFxyXG4gIGlmICh0b2tlblZhbGlkYXRpb25UaW1lb3V0KSB7XHJcbiAgICBjbGVhclRpbWVvdXQodG9rZW5WYWxpZGF0aW9uVGltZW91dCk7XHJcbiAgfVxyXG5cclxuICAvLyBIaWRlIHByZXZpZXcgYW5kIGVycm9yXHJcbiAgcHJldmlld0VsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIGVycm9yRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIC8vIEJhc2ljIHZhbGlkYXRpb25cclxuICBpZiAoIWFkZHJlc3MgfHwgYWRkcmVzcy5sZW5ndGggIT09IDQyIHx8ICFhZGRyZXNzLnN0YXJ0c1dpdGgoJzB4JykpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIERlYm91bmNlIHRoZSB2YWxpZGF0aW9uXHJcbiAgdG9rZW5WYWxpZGF0aW9uVGltZW91dCA9IHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgbmV0d29yayA9IGN1cnJlbnRTdGF0ZS5uZXR3b3JrO1xyXG4gICAgICBjb25zdCBtZXRhZGF0YSA9IGF3YWl0IGVyYzIwLmdldFRva2VuTWV0YWRhdGEobmV0d29yaywgYWRkcmVzcyk7XHJcblxyXG4gICAgICAvLyBTaG93IHByZXZpZXdcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXByZXZpZXctbmFtZScpLnRleHRDb250ZW50ID0gbWV0YWRhdGEubmFtZTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXByZXZpZXctc3ltYm9sJykudGV4dENvbnRlbnQgPSBtZXRhZGF0YS5zeW1ib2w7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1wcmV2aWV3LWRlY2ltYWxzJykudGV4dENvbnRlbnQgPSBtZXRhZGF0YS5kZWNpbWFscztcclxuICAgICAgcHJldmlld0VsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdJbnZhbGlkIHRva2VuIGNvbnRyYWN0JztcclxuICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIH1cclxuICB9LCA1MDApO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVBZGRDdXN0b21Ub2tlbigpIHtcclxuICBjb25zdCBhZGRyZXNzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LXRva2VuLWFkZHJlc3MnKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgZXJyb3JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtdG9rZW4tZXJyb3InKTtcclxuXHJcbiAgaWYgKCFhZGRyZXNzKSB7XHJcbiAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ1BsZWFzZSBlbnRlciBhIHRva2VuIGFkZHJlc3MnO1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgYXdhaXQgdG9rZW5zLmFkZEN1c3RvbVRva2VuKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCBhZGRyZXNzKTtcclxuXHJcbiAgICAvLyBDbG9zZSBtb2RhbCBhbmQgcmVmcmVzaCBzY3JlZW5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtdG9rZW4nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGF3YWl0IHJlbmRlclRva2Vuc1NjcmVlbigpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBlcnJvckVsLnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBTRVRUSU5HUyA9PT09PVxyXG5mdW5jdGlvbiBsb2FkU2V0dGluZ3NUb1VJKCkge1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLWF1dG9sb2NrJykudmFsdWUgPSBjdXJyZW50U3RhdGUuc2V0dGluZ3MuYXV0b0xvY2tNaW51dGVzO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLWRlY2ltYWxzJykudmFsdWUgPSBjdXJyZW50U3RhdGUuc2V0dGluZ3MuZGVjaW1hbFBsYWNlcztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0dGluZy10aGVtZScpLnZhbHVlID0gY3VycmVudFN0YXRlLnNldHRpbmdzLnRoZW1lO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLXNob3ctdGVzdG5ldHMnKS5jaGVja2VkID0gY3VycmVudFN0YXRlLnNldHRpbmdzLnNob3dUZXN0TmV0d29ya3M7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctbWF4LWdhcy1wcmljZScpLnZhbHVlID0gY3VycmVudFN0YXRlLnNldHRpbmdzLm1heEdhc1ByaWNlR3dlaSB8fCAxMDAwO1xyXG59XHJcblxyXG4vLyBOZXR3b3JrIFNldHRpbmdzXHJcbmNvbnN0IE5FVFdPUktfS0VZUyA9IFsncHVsc2VjaGFpblRlc3RuZXQnLCAncHVsc2VjaGFpbicsICdldGhlcmV1bScsICdzZXBvbGlhJ107XHJcblxyXG5mdW5jdGlvbiBsb2FkTmV0d29ya1NldHRpbmdzVG9VSSgpIHtcclxuICBORVRXT1JLX0tFWVMuZm9yRWFjaChuZXR3b3JrID0+IHtcclxuICAgIC8vIExvYWQgUlBDIGVuZHBvaW50XHJcbiAgICBjb25zdCBycGNJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBycGMtJHtuZXR3b3JrfWApO1xyXG4gICAgaWYgKHJwY0lucHV0KSB7XHJcbiAgICAgIHJwY0lucHV0LnZhbHVlID0gY3VycmVudFN0YXRlLm5ldHdvcmtTZXR0aW5ncz8uW25ldHdvcmtdPy5ycGMgfHwgJyc7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTG9hZCBFeHBsb3JlciBzZXR0aW5nc1xyXG4gICAgY29uc3QgZXhwbG9yZXJJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBleHBsb3Jlci0ke25ldHdvcmt9YCk7XHJcbiAgICBpZiAoZXhwbG9yZXJJbnB1dCkge1xyXG4gICAgICBleHBsb3JlcklucHV0LnZhbHVlID0gY3VycmVudFN0YXRlLm5ldHdvcmtTZXR0aW5ncz8uW25ldHdvcmtdPy5leHBsb3JlckJhc2UgfHwgJyc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdHhQYXRoSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgZXhwbG9yZXItdHgtJHtuZXR3b3JrfWApO1xyXG4gICAgaWYgKHR4UGF0aElucHV0KSB7XHJcbiAgICAgIHR4UGF0aElucHV0LnZhbHVlID0gY3VycmVudFN0YXRlLm5ldHdvcmtTZXR0aW5ncz8uW25ldHdvcmtdPy5leHBsb3JlclR4UGF0aCB8fCAnJztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhZGRyUGF0aElucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGV4cGxvcmVyLWFkZHItJHtuZXR3b3JrfWApO1xyXG4gICAgaWYgKGFkZHJQYXRoSW5wdXQpIHtcclxuICAgICAgYWRkclBhdGhJbnB1dC52YWx1ZSA9IGN1cnJlbnRTdGF0ZS5uZXR3b3JrU2V0dGluZ3M/LltuZXR3b3JrXT8uZXhwbG9yZXJBZGRyUGF0aCB8fCAnJztcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2F2ZU5ldHdvcmtTZXR0aW5ncygpIHtcclxuICBjb25zdCBuZXR3b3JrU2V0dGluZ3MgPSB7fTtcclxuXHJcbiAgTkVUV09SS19LRVlTLmZvckVhY2gobmV0d29yayA9PiB7XHJcbiAgICBuZXR3b3JrU2V0dGluZ3NbbmV0d29ya10gPSB7XHJcbiAgICAgIHJwYzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYHJwYy0ke25ldHdvcmt9YCk/LnZhbHVlIHx8ICcnLFxyXG4gICAgICBleHBsb3JlckJhc2U6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBleHBsb3Jlci0ke25ldHdvcmt9YCk/LnZhbHVlIHx8ICcnLFxyXG4gICAgICBleHBsb3JlclR4UGF0aDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGV4cGxvcmVyLXR4LSR7bmV0d29ya31gKT8udmFsdWUgfHwgJycsXHJcbiAgICAgIGV4cGxvcmVyQWRkclBhdGg6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBleHBsb3Jlci1hZGRyLSR7bmV0d29ya31gKT8udmFsdWUgfHwgJydcclxuICAgIH07XHJcbiAgfSk7XHJcblxyXG4gIGF3YWl0IHNhdmUoJ25ldHdvcmtTZXR0aW5ncycsIG5ldHdvcmtTZXR0aW5ncyk7XHJcbiAgY3VycmVudFN0YXRlLm5ldHdvcmtTZXR0aW5ncyA9IG5ldHdvcmtTZXR0aW5ncztcclxuXHJcbiAgLy8gVXBkYXRlIHJ1bnRpbWUgc2V0dGluZ3NcclxuICBhcHBseU5ldHdvcmtTZXR0aW5ncygpO1xyXG5cclxuICBhbGVydCgnTmV0d29yayBzZXR0aW5ncyBzYXZlZCEgQ2hhbmdlcyB3aWxsIHRha2UgZWZmZWN0IG9uIG5leHQgcmVsb2FkLicpO1xyXG4gIHNob3dTY3JlZW4oJ3NjcmVlbi1zZXR0aW5ncycpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZXNldE5ldHdvcmtTZXR0aW5nc1RvRGVmYXVsdHMoKSB7XHJcbiAgTkVUV09SS19LRVlTLmZvckVhY2gobmV0d29yayA9PiB7XHJcbiAgICAvLyBSZXNldCB0byBkZWZhdWx0IFJQQyBlbmRwb2ludHMgZnJvbSBycGMuanNcclxuICAgIGNvbnN0IGRlZmF1bHRSUENzID0ge1xyXG4gICAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAnaHR0cHM6Ly9ycGMudjQudGVzdG5ldC5wdWxzZWNoYWluLmNvbScsXHJcbiAgICAgICdwdWxzZWNoYWluJzogJ2h0dHBzOi8vcnBjLnB1bHNlY2hhaW4uY29tJyxcclxuICAgICAgJ2V0aGVyZXVtJzogJ2h0dHBzOi8vZXRoLmxsYW1hcnBjLmNvbScsXHJcbiAgICAgICdzZXBvbGlhJzogJ2h0dHBzOi8vcnBjLnNlcG9saWEub3JnJ1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBkZWZhdWx0RXhwbG9yZXJzID0ge1xyXG4gICAgICAncHVsc2VjaGFpblRlc3RuZXQnOiB7XHJcbiAgICAgICAgYmFzZTogJ2h0dHBzOi8vc2Nhbi52NC50ZXN0bmV0LnB1bHNlY2hhaW4uY29tJyxcclxuICAgICAgICB0eDogJy90eC97aGFzaH0nLFxyXG4gICAgICAgIGFkZHI6ICcvYWRkcmVzcy97YWRkcmVzc30nXHJcbiAgICAgIH0sXHJcbiAgICAgICdwdWxzZWNoYWluJzoge1xyXG4gICAgICAgIGJhc2U6ICdodHRwczovL3NjYW4ubXlwaW5hdGEuY2xvdWQvaXBmcy9iYWZ5YmVpZW54eW95cmhuNXRzd2NsdmQzZ2RqeTVtdGtrd211MzdhcXRtbDZvbmJmN3huYjNvMjJwZS8nLFxyXG4gICAgICAgIHR4OiAnIy90eC97aGFzaH0nLFxyXG4gICAgICAgIGFkZHI6ICcjL2FkZHJlc3Mve2FkZHJlc3N9J1xyXG4gICAgICB9LFxyXG4gICAgICAnZXRoZXJldW0nOiB7XHJcbiAgICAgICAgYmFzZTogJ2h0dHBzOi8vZXRoZXJzY2FuLmlvJyxcclxuICAgICAgICB0eDogJy90eC97aGFzaH0nLFxyXG4gICAgICAgIGFkZHI6ICcvYWRkcmVzcy97YWRkcmVzc30nXHJcbiAgICAgIH0sXHJcbiAgICAgICdzZXBvbGlhJzoge1xyXG4gICAgICAgIGJhc2U6ICdodHRwczovL3NlcG9saWEuZXRoZXJzY2FuLmlvJyxcclxuICAgICAgICB0eDogJy90eC97aGFzaH0nLFxyXG4gICAgICAgIGFkZHI6ICcvYWRkcmVzcy97YWRkcmVzc30nXHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYHJwYy0ke25ldHdvcmt9YCkudmFsdWUgPSBkZWZhdWx0UlBDc1tuZXR3b3JrXSB8fCAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBleHBsb3Jlci0ke25ldHdvcmt9YCkudmFsdWUgPSBkZWZhdWx0RXhwbG9yZXJzW25ldHdvcmtdPy5iYXNlIHx8ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGV4cGxvcmVyLXR4LSR7bmV0d29ya31gKS52YWx1ZSA9IGRlZmF1bHRFeHBsb3JlcnNbbmV0d29ya10/LnR4IHx8ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGV4cGxvcmVyLWFkZHItJHtuZXR3b3JrfWApLnZhbHVlID0gZGVmYXVsdEV4cGxvcmVyc1tuZXR3b3JrXT8uYWRkciB8fCAnJztcclxuICB9KTtcclxuXHJcbiAgYWxlcnQoJ05ldHdvcmsgc2V0dGluZ3MgcmVzZXQgdG8gZGVmYXVsdHMuIENsaWNrIFNBVkUgdG8gYXBwbHkuJyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5TmV0d29ya1NldHRpbmdzKCkge1xyXG4gIC8vIFRoaXMgd291bGQgdXBkYXRlIHRoZSBydW50aW1lIFJQQyBhbmQgZXhwbG9yZXIgY29uZmlnc1xyXG4gIC8vIEZvciBub3csIHNldHRpbmdzIHRha2UgZWZmZWN0IG9uIHJlbG9hZFxyXG59XHJcblxyXG4vLyA9PT09PSBQQVNTV09SRCBQUk9NUFQgTU9EQUwgPT09PT1cclxubGV0IHBhc3N3b3JkUHJvbXB0UmVzb2x2ZSA9IG51bGw7XHJcblxyXG5mdW5jdGlvbiBzaG93UGFzc3dvcmRQcm9tcHQodGl0bGUsIG1lc3NhZ2UpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgIHBhc3N3b3JkUHJvbXB0UmVzb2x2ZSA9IHJlc29sdmU7XHJcblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC10aXRsZScpLnRleHRDb250ZW50ID0gdGl0bGU7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtcHJvbXB0LW1lc3NhZ2UnKS50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtcHJvbXB0LWlucHV0JykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1wcm9tcHQtZXJyb3InKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1wYXNzd29yZC1wcm9tcHQnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuXHJcbiAgICAvLyBGb2N1cyB0aGUgaW5wdXRcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtcHJvbXB0LWlucHV0Jyk/LmZvY3VzKCk7XHJcbiAgICB9LCAxMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjbG9zZVBhc3N3b3JkUHJvbXB0KHBhc3N3b3JkID0gbnVsbCkge1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1wYXNzd29yZC1wcm9tcHQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICBpZiAocGFzc3dvcmRQcm9tcHRSZXNvbHZlKSB7XHJcbiAgICBwYXNzd29yZFByb21wdFJlc29sdmUocGFzc3dvcmQpO1xyXG4gICAgcGFzc3dvcmRQcm9tcHRSZXNvbHZlID0gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IERJU1BMQVkgU0VDUkVUIE1PREFMID09PT09XHJcbmZ1bmN0aW9uIHNob3dTZWNyZXRNb2RhbCh0aXRsZSwgc2VjcmV0KSB7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpc3BsYXktc2VjcmV0LXRpdGxlJykudGV4dENvbnRlbnQgPSB0aXRsZTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGlzcGxheS1zZWNyZXQtY29udGVudCcpLnRleHRDb250ZW50ID0gc2VjcmV0O1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1kaXNwbGF5LXNlY3JldCcpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjbG9zZVNlY3JldE1vZGFsKCkge1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1kaXNwbGF5LXNlY3JldCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXNwbGF5LXNlY3JldC1jb250ZW50JykudGV4dENvbnRlbnQgPSAnJztcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVmlld1NlZWQoKSB7XHJcbiAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ1ZpZXcgU2VlZCBQaHJhc2UnLCAnRW50ZXIgeW91ciBwYXNzd29yZCB0byB2aWV3IHlvdXIgc2VlZCBwaHJhc2UnKTtcclxuICBpZiAoIXBhc3N3b3JkKSByZXR1cm47XHJcblxyXG4gIGNvbnN0IGVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1lcnJvcicpO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgbW5lbW9uaWMgPSBhd2FpdCBleHBvcnRNbmVtb25pYyhwYXNzd29yZCk7XHJcbiAgICBjbG9zZVBhc3N3b3JkUHJvbXB0KCk7XHJcblxyXG4gICAgaWYgKG1uZW1vbmljKSB7XHJcbiAgICAgIHNob3dTZWNyZXRNb2RhbCgnWW91ciBTZWVkIFBocmFzZScsIG1uZW1vbmljKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFsZXJ0KCdUaGlzIHdhbGxldCB3YXMgaW1wb3J0ZWQgdXNpbmcgYSBwcml2YXRlIGtleSBhbmQgaGFzIG5vIHNlZWQgcGhyYXNlLicpO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUV4cG9ydEtleSgpIHtcclxuICBjb25zdCBwYXNzd29yZCA9IGF3YWl0IHNob3dQYXNzd29yZFByb21wdCgnRXhwb3J0IFByaXZhdGUgS2V5JywgJ0VudGVyIHlvdXIgcGFzc3dvcmQgdG8gZXhwb3J0IHlvdXIgcHJpdmF0ZSBrZXknKTtcclxuICBpZiAoIXBhc3N3b3JkKSByZXR1cm47XHJcblxyXG4gIGNvbnN0IGVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1lcnJvcicpO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcHJpdmF0ZUtleSA9IGF3YWl0IGV4cG9ydFByaXZhdGVLZXkocGFzc3dvcmQpO1xyXG4gICAgY2xvc2VQYXNzd29yZFByb21wdCgpO1xyXG4gICAgc2hvd1NlY3JldE1vZGFsKCdZb3VyIFByaXZhdGUgS2V5JywgcHJpdmF0ZUtleSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbi8vID09PT09IE1VTFRJLVdBTExFVCBNQU5BR0VNRU5UID09PT09XHJcbmxldCBjdXJyZW50UmVuYW1lV2FsbGV0SWQgPSBudWxsO1xyXG5sZXQgZ2VuZXJhdGVkTW5lbW9uaWNNdWx0aSA9IG51bGw7XHJcbmxldCB2ZXJpZmljYXRpb25Xb3Jkc011bHRpID0gW107IC8vIEFycmF5IG9mIHtpbmRleCwgd29yZH0gZm9yIHZlcmlmaWNhdGlvblxyXG5cclxuLy8gUmVuZGVyIHdhbGxldCBsaXN0IGluIG1hbmFnZSB3YWxsZXRzIHNjcmVlblxyXG5hc3luYyBmdW5jdGlvbiByZW5kZXJXYWxsZXRMaXN0KCkge1xyXG4gIGNvbnN0IHdhbGxldHNEYXRhID0gYXdhaXQgZ2V0QWxsV2FsbGV0cygpO1xyXG4gIGNvbnN0IHdhbGxldExpc3REaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2FsbGV0LWxpc3QnKTtcclxuICBjb25zdCB3YWxsZXRDb3VudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3YWxsZXQtY291bnQnKTtcclxuXHJcbiAgd2FsbGV0Q291bnQudGV4dENvbnRlbnQgPSB3YWxsZXRzRGF0YS53YWxsZXRMaXN0Lmxlbmd0aDtcclxuXHJcbiAgaWYgKHdhbGxldHNEYXRhLndhbGxldExpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICB3YWxsZXRMaXN0RGl2LmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtZGltIHRleHQtY2VudGVyXCI+Tm8gd2FsbGV0cyBmb3VuZDwvcD4nO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgd2FsbGV0TGlzdERpdi5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgd2FsbGV0c0RhdGEud2FsbGV0TGlzdC5mb3JFYWNoKHdhbGxldCA9PiB7XHJcbiAgICBjb25zdCBpc0FjdGl2ZSA9IHdhbGxldC5pZCA9PT0gd2FsbGV0c0RhdGEuYWN0aXZlV2FsbGV0SWQ7XHJcbiAgICBjb25zdCB3YWxsZXRDYXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICB3YWxsZXRDYXJkLmNsYXNzTmFtZSA9ICdwYW5lbCBtYi0yJztcclxuICAgIGlmIChpc0FjdGl2ZSkge1xyXG4gICAgICB3YWxsZXRDYXJkLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXN1Y2Nlc3MpJztcclxuICAgICAgd2FsbGV0Q2FyZC5zdHlsZS5ib3JkZXJXaWR0aCA9ICcycHgnO1xyXG4gICAgfVxyXG5cclxuICAgIHdhbGxldENhcmQuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBhbGlnbi1pdGVtczogZmxleC1zdGFydDsgbWFyZ2luLWJvdHRvbTogMTJweDtcIj5cclxuICAgICAgICA8ZGl2IHN0eWxlPVwiZmxleDogMTtcIj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXdlaWdodDogYm9sZDsgZm9udC1zaXplOiAxNHB4OyBtYXJnaW4tYm90dG9tOiA0cHg7XCI+XHJcbiAgICAgICAgICAgICR7aXNBY3RpdmUgPyAn4pyTICcgOiAnJ30ke2VzY2FwZUh0bWwod2FsbGV0Lm5pY2tuYW1lIHx8ICdVbm5hbWVkIFdhbGxldCcpfVxyXG4gICAgICAgICAgICAke2lzQWN0aXZlID8gJzxzcGFuIGNsYXNzPVwidGV4dC1zdWNjZXNzXCIgc3R5bGU9XCJmb250LXNpemU6IDExcHg7IG1hcmdpbi1sZWZ0OiA4cHg7XCI+W0FDVElWRV08L3NwYW4+JyA6ICcnfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDsgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtbW9ubyk7IHdvcmQtYnJlYWs6IGJyZWFrLWFsbDtcIj5cclxuICAgICAgICAgICAgJHtlc2NhcGVIdG1sKHdhbGxldC5hZGRyZXNzIHx8ICdBZGRyZXNzIG5vdCBsb2FkZWQnKX1cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDEwcHg7IG1hcmdpbi10b3A6IDRweDtcIj5cclxuICAgICAgICAgICAgJHt3YWxsZXQuaW1wb3J0TWV0aG9kID09PSAnY3JlYXRlJyA/ICdDcmVhdGVkJyA6ICdJbXBvcnRlZCd9IOKAoiAke25ldyBEYXRlKHdhbGxldC5jcmVhdGVkQXQpLnRvTG9jYWxlRGF0ZVN0cmluZygpfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLWdyb3VwXCIgc3R5bGU9XCJnYXA6IDZweDtcIj5cclxuICAgICAgICAkeyFpc0FjdGl2ZSA/IGA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1zbWFsbFwiIGRhdGEtd2FsbGV0LWlkPVwiJHt3YWxsZXQuaWR9XCIgZGF0YS1hY3Rpb249XCJzd2l0Y2hcIj5TV0lUQ0g8L2J1dHRvbj5gIDogJyd9XHJcbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc21hbGxcIiBkYXRhLXdhbGxldC1pZD1cIiR7d2FsbGV0LmlkfVwiIGRhdGEtYWN0aW9uPVwicmVuYW1lXCI+UkVOQU1FPC9idXR0b24+XHJcbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc21hbGxcIiBkYXRhLXdhbGxldC1pZD1cIiR7d2FsbGV0LmlkfVwiIGRhdGEtYWN0aW9uPVwiZXhwb3J0XCI+RVhQT1JUPC9idXR0b24+XHJcbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tZGFuZ2VyIGJ0bi1zbWFsbFwiIGRhdGEtd2FsbGV0LWlkPVwiJHt3YWxsZXQuaWR9XCIgZGF0YS1hY3Rpb249XCJkZWxldGVcIj5ERUxFVEU8L2J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG5cclxuICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGJ1dHRvbnNcclxuICAgIGNvbnN0IGJ1dHRvbnMgPSB3YWxsZXRDYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpO1xyXG4gICAgYnV0dG9ucy5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgICAgICBjb25zdCB3YWxsZXRJZCA9IGJ0bi5kYXRhc2V0LndhbGxldElkO1xyXG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IGJ0bi5kYXRhc2V0LmFjdGlvbjtcclxuXHJcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcclxuICAgICAgICAgIGNhc2UgJ3N3aXRjaCc6XHJcbiAgICAgICAgICAgIGF3YWl0IGhhbmRsZVN3aXRjaFdhbGxldCh3YWxsZXRJZCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAncmVuYW1lJzpcclxuICAgICAgICAgICAgaGFuZGxlUmVuYW1lV2FsbGV0UHJvbXB0KHdhbGxldElkLCB3YWxsZXQubmlja25hbWUpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ2V4cG9ydCc6XHJcbiAgICAgICAgICAgIGF3YWl0IGhhbmRsZUV4cG9ydEZvcldhbGxldCh3YWxsZXRJZCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnZGVsZXRlJzpcclxuICAgICAgICAgICAgYXdhaXQgaGFuZGxlRGVsZXRlV2FsbGV0TXVsdGkod2FsbGV0SWQpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgd2FsbGV0TGlzdERpdi5hcHBlbmRDaGlsZCh3YWxsZXRDYXJkKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gTmF2aWdhdGUgdG8gbWFuYWdlIHdhbGxldHMgc2NyZWVuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZU1hbmFnZVdhbGxldHMoKSB7XHJcbiAgYXdhaXQgcmVuZGVyV2FsbGV0TGlzdCgpO1xyXG4gIHNob3dTY3JlZW4oJ3NjcmVlbi1tYW5hZ2Utd2FsbGV0cycpO1xyXG59XHJcblxyXG4vLyBTaG93IGFkZCB3YWxsZXQgbW9kYWwgKHdpdGggMyBvcHRpb25zKVxyXG5mdW5jdGlvbiBzaG93QWRkV2FsbGV0TW9kYWwoKSB7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWFkZC13YWxsZXQnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxufVxyXG5cclxuLy8gR2VuZXJhdGUgbW5lbW9uaWMgZm9yIG11bHRpLXdhbGxldCBjcmVhdGlvblxyXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZU5ld01uZW1vbmljTXVsdGkoKSB7XHJcbiAgY29uc3QgeyBldGhlcnMgfSA9IGF3YWl0IGltcG9ydCgnZXRoZXJzJyk7XHJcbiAgY29uc3QgcmFuZG9tV2FsbGV0ID0gZXRoZXJzLldhbGxldC5jcmVhdGVSYW5kb20oKTtcclxuICBnZW5lcmF0ZWRNbmVtb25pY011bHRpID0gcmFuZG9tV2FsbGV0Lm1uZW1vbmljLnBocmFzZTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXVsdGktbW5lbW9uaWMtZGlzcGxheScpLnRleHRDb250ZW50ID0gZ2VuZXJhdGVkTW5lbW9uaWNNdWx0aTtcclxuXHJcbiAgLy8gU2V0IHVwIHZlcmlmaWNhdGlvbiAoYXNrIGZvciAzIHJhbmRvbSB3b3JkcyB1c2luZyBjcnlwdG9ncmFwaGljYWxseSBzZWN1cmUgcmFuZG9tKVxyXG4gIGNvbnN0IHdvcmRzID0gZ2VuZXJhdGVkTW5lbW9uaWNNdWx0aS5zcGxpdCgnICcpO1xyXG4gIGNvbnN0IHJhbmRvbUJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoMyk7XHJcbiAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhyYW5kb21CeXRlcyk7XHJcbiAgY29uc3QgaW5kaWNlcyA9IFtcclxuICAgIHJhbmRvbUJ5dGVzWzBdICUgNCwgLy8gV29yZCAxLTRcclxuICAgIDQgKyAocmFuZG9tQnl0ZXNbMV0gJSA0KSwgLy8gV29yZCA1LThcclxuICAgIDggKyAocmFuZG9tQnl0ZXNbMl0gJSA0KSAvLyBXb3JkIDktMTJcclxuICBdO1xyXG5cclxuICB2ZXJpZmljYXRpb25Xb3Jkc011bHRpID0gaW5kaWNlcy5tYXAoaSA9PiAoeyBpbmRleDogaSwgd29yZDogd29yZHNbaV0gfSkpO1xyXG5cclxuICAvLyBVcGRhdGUgVUkgd2l0aCByYW5kb20gaW5kaWNlc1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0xLW51bS1tdWx0aScpLnRleHRDb250ZW50ID0gKHZlcmlmaWNhdGlvbldvcmRzTXVsdGlbMF0uaW5kZXggKyAxKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMi1udW0tbXVsdGknKS50ZXh0Q29udGVudCA9ICh2ZXJpZmljYXRpb25Xb3Jkc011bHRpWzFdLmluZGV4ICsgMSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTMtbnVtLW11bHRpJykudGV4dENvbnRlbnQgPSAodmVyaWZpY2F0aW9uV29yZHNNdWx0aVsyXS5pbmRleCArIDEpO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgY3JlYXRlIG5ldyB3YWxsZXQgKG11bHRpKVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDcmVhdGVOZXdXYWxsZXRNdWx0aSgpIHtcclxuICBjb25zdCBuaWNrbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1uZXctd2FsbGV0LW5pY2tuYW1lJykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IHZlcmlmaWNhdGlvbkVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmaWNhdGlvbi1lcnJvci1tdWx0aScpO1xyXG5cclxuICAvLyBWZXJpZnkgc2VlZCBwaHJhc2Ugd29yZHNcclxuICBjb25zdCB3b3JkMSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0xLW11bHRpJykudmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3Qgd29yZDIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMi1tdWx0aScpLnZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IHdvcmQzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTMtbXVsdGknKS52YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaWYgKCF3b3JkMSB8fCAhd29yZDIgfHwgIXdvcmQzKSB7XHJcbiAgICB2ZXJpZmljYXRpb25FcnJvckRpdi50ZXh0Q29udGVudCA9ICdQbGVhc2UgZW50ZXIgYWxsIHZlcmlmaWNhdGlvbiB3b3JkcyB0byBjb25maXJtIHlvdSBoYXZlIGJhY2tlZCB1cCB5b3VyIHNlZWQgcGhyYXNlLic7XHJcbiAgICB2ZXJpZmljYXRpb25FcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmICh3b3JkMSAhPT0gdmVyaWZpY2F0aW9uV29yZHNNdWx0aVswXS53b3JkLnRvTG93ZXJDYXNlKCkgfHxcclxuICAgICAgd29yZDIgIT09IHZlcmlmaWNhdGlvbldvcmRzTXVsdGlbMV0ud29yZC50b0xvd2VyQ2FzZSgpIHx8XHJcbiAgICAgIHdvcmQzICE9PSB2ZXJpZmljYXRpb25Xb3Jkc011bHRpWzJdLndvcmQudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYudGV4dENvbnRlbnQgPSAnVmVyaWZpY2F0aW9uIHdvcmRzIGRvIG5vdCBtYXRjaC4gUGxlYXNlIGRvdWJsZS1jaGVjayB5b3VyIHNlZWQgcGhyYXNlIGJhY2t1cC4nO1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBDbGVhciB2ZXJpZmljYXRpb24gZXJyb3JcclxuICB2ZXJpZmljYXRpb25FcnJvckRpdi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gQ2xvc2UgbW9kYWwgQkVGT1JFIHNob3dpbmcgcGFzc3dvcmQgcHJvbXB0XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWNyZWF0ZS13YWxsZXQtbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ0VudGVyIFlvdXIgUGFzc3dvcmQnLCAnRW50ZXIgeW91ciB3YWxsZXQgcGFzc3dvcmQgdG8gZW5jcnlwdCB0aGUgbmV3IHdhbGxldCcpO1xyXG5cclxuICBpZiAoIXBhc3N3b3JkKSB7XHJcbiAgICAvLyBJZiBjYW5jZWxsZWQsIHJlb3BlbiB0aGUgbW9kYWxcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1jcmVhdGUtd2FsbGV0LW11bHRpJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgYXdhaXQgYWRkV2FsbGV0KCdjcmVhdGUnLCB7fSwgcGFzc3dvcmQsIG5pY2tuYW1lIHx8IG51bGwpO1xyXG5cclxuICAgIC8vIENsZWFyIGZvcm1cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1uZXctd2FsbGV0LW5pY2tuYW1lJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0xLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0yLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGdlbmVyYXRlZE1uZW1vbmljTXVsdGkgPSBudWxsO1xyXG4gICAgdmVyaWZpY2F0aW9uV29yZHNNdWx0aSA9IFtdO1xyXG5cclxuICAgIC8vIFJlZnJlc2ggd2FsbGV0IGxpc3RcclxuICAgIGF3YWl0IHJlbmRlcldhbGxldExpc3QoKTtcclxuXHJcbiAgICBhbGVydCgnV2FsbGV0IGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5IScpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBhbGVydCgnRXJyb3IgY3JlYXRpbmcgd2FsbGV0OiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgaW1wb3J0IGZyb20gc2VlZCAobXVsdGkpXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUltcG9ydFNlZWRNdWx0aSgpIHtcclxuICBjb25zdCBuaWNrbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtc2VlZC1uaWNrbmFtZScpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCBtbmVtb25pYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtc2VlZC1waHJhc2UnKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgZXJyb3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1wb3J0LXNlZWQtZXJyb3ItbXVsdGknKTtcclxuXHJcbiAgZXJyb3JEaXYuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIGlmICghbW5lbW9uaWMpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gJ1BsZWFzZSBlbnRlciBhIHNlZWQgcGhyYXNlJztcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2xvc2UgbW9kYWwgQkVGT1JFIHNob3dpbmcgcGFzc3dvcmQgcHJvbXB0XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1zZWVkLW11bHRpJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgc2hvd1Bhc3N3b3JkUHJvbXB0KCdFbnRlciBZb3VyIFBhc3N3b3JkJywgJ0VudGVyIHlvdXIgd2FsbGV0IHBhc3N3b3JkIHRvIGVuY3J5cHQgdGhlIGltcG9ydGVkIHdhbGxldCcpO1xyXG5cclxuICBpZiAoIXBhc3N3b3JkKSB7XHJcbiAgICAvLyBJZiBjYW5jZWxsZWQsIHJlb3BlbiB0aGUgbW9kYWxcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1pbXBvcnQtc2VlZC1tdWx0aScpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IGFkZFdhbGxldCgnbW5lbW9uaWMnLCB7IG1uZW1vbmljIH0sIHBhc3N3b3JkLCBuaWNrbmFtZSB8fCBudWxsKTtcclxuXHJcbiAgICAvLyBDbGVhciBmb3JtXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXNlZWQtbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1zZWVkLXBocmFzZScpLnZhbHVlID0gJyc7XHJcblxyXG4gICAgLy8gUmVmcmVzaCB3YWxsZXQgbGlzdFxyXG4gICAgYXdhaXQgcmVuZGVyV2FsbGV0TGlzdCgpO1xyXG5cclxuICAgIGFsZXJ0KCdXYWxsZXQgaW1wb3J0ZWQgc3VjY2Vzc2Z1bGx5IScpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAvLyBTaG93IGVycm9yIGFuZCByZW9wZW4gbW9kYWxcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1zZWVkLW11bHRpJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgaW1wb3J0IGZyb20gcHJpdmF0ZSBrZXkgKG11bHRpKVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVJbXBvcnRLZXlNdWx0aSgpIHtcclxuICBjb25zdCBuaWNrbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQta2V5LW5pY2tuYW1lJykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IHByaXZhdGVLZXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXByaXZhdGUta2V5JykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IGVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1rZXktZXJyb3ItbXVsdGknKTtcclxuXHJcbiAgZXJyb3JEaXYuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIGlmICghcHJpdmF0ZUtleSkge1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSAnUGxlYXNlIGVudGVyIGEgcHJpdmF0ZSBrZXknO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBDbG9zZSBtb2RhbCBCRUZPUkUgc2hvd2luZyBwYXNzd29yZCBwcm9tcHRcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LWtleS1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICBjb25zdCBwYXNzd29yZCA9IGF3YWl0IHNob3dQYXNzd29yZFByb21wdCgnRW50ZXIgWW91ciBQYXNzd29yZCcsICdFbnRlciB5b3VyIHdhbGxldCBwYXNzd29yZCB0byBlbmNyeXB0IHRoZSBpbXBvcnRlZCB3YWxsZXQnKTtcclxuXHJcbiAgaWYgKCFwYXNzd29yZCkge1xyXG4gICAgLy8gSWYgY2FuY2VsbGVkLCByZW9wZW4gdGhlIG1vZGFsXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LWtleS1tdWx0aScpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IGFkZFdhbGxldCgncHJpdmF0ZWtleScsIHsgcHJpdmF0ZUtleSB9LCBwYXNzd29yZCwgbmlja25hbWUgfHwgbnVsbCk7XHJcblxyXG4gICAgLy8gQ2xlYXIgZm9ybVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1rZXktbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1wcml2YXRlLWtleScpLnZhbHVlID0gJyc7XHJcblxyXG4gICAgLy8gUmVmcmVzaCB3YWxsZXQgbGlzdFxyXG4gICAgYXdhaXQgcmVuZGVyV2FsbGV0TGlzdCgpO1xyXG5cclxuICAgIGFsZXJ0KCdXYWxsZXQgaW1wb3J0ZWQgc3VjY2Vzc2Z1bGx5IScpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAvLyBTaG93IGVycm9yIGFuZCByZW9wZW4gbW9kYWxcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1rZXktbXVsdGknKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFN3aXRjaCB0byBhIGRpZmZlcmVudCB3YWxsZXRcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3dpdGNoV2FsbGV0KHdhbGxldElkKSB7XHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IHNldEFjdGl2ZVdhbGxldCh3YWxsZXRJZCk7XHJcblxyXG4gICAgLy8gUmVmcmVzaCB3YWxsZXQgbGlzdCB0byBzaG93IG5ldyBhY3RpdmUgd2FsbGV0XHJcbiAgICBhd2FpdCByZW5kZXJXYWxsZXRMaXN0KCk7XHJcblxyXG4gICAgLy8gSWYgd2UncmUgdW5sb2NrZWQsIHVwZGF0ZSB0aGUgZGFzaGJvYXJkXHJcbiAgICBpZiAoY3VycmVudFN0YXRlLmlzVW5sb2NrZWQpIHtcclxuICAgICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICAgIGN1cnJlbnRTdGF0ZS5hZGRyZXNzID0gd2FsbGV0LmFkZHJlc3M7XHJcbiAgICAgIHVwZGF0ZURhc2hib2FyZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGFsZXJ0KCdTd2l0Y2hlZCB0byB3YWxsZXQgc3VjY2Vzc2Z1bGx5IScpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBhbGVydCgnRXJyb3Igc3dpdGNoaW5nIHdhbGxldDogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gU2hvdyByZW5hbWUgd2FsbGV0IHByb21wdFxyXG5mdW5jdGlvbiBoYW5kbGVSZW5hbWVXYWxsZXRQcm9tcHQod2FsbGV0SWQsIGN1cnJlbnROaWNrbmFtZSkge1xyXG4gIGN1cnJlbnRSZW5hbWVXYWxsZXRJZCA9IHdhbGxldElkO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1yZW5hbWUtd2FsbGV0LW5pY2tuYW1lJykudmFsdWUgPSBjdXJyZW50Tmlja25hbWUgfHwgJyc7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXJlbmFtZS13YWxsZXQnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxufVxyXG5cclxuLy8gQ29uZmlybSByZW5hbWUgd2FsbGV0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlbmFtZVdhbGxldENvbmZpcm0oKSB7XHJcbiAgY29uc3QgbmV3Tmlja25hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtcmVuYW1lLXdhbGxldC1uaWNrbmFtZScpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCBlcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZW5hbWUtZXJyb3InKTtcclxuXHJcbiAgZXJyb3JEaXYuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIGlmICghbmV3Tmlja25hbWUpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gJ05pY2tuYW1lIGNhbm5vdCBiZSBlbXB0eSc7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCByZW5hbWVXYWxsZXQoY3VycmVudFJlbmFtZVdhbGxldElkLCBuZXdOaWNrbmFtZSk7XHJcblxyXG4gICAgLy8gQ2xvc2UgbW9kYWxcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1yZW5hbWUtd2FsbGV0JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBjdXJyZW50UmVuYW1lV2FsbGV0SWQgPSBudWxsO1xyXG5cclxuICAgIC8vIFJlZnJlc2ggd2FsbGV0IGxpc3RcclxuICAgIGF3YWl0IHJlbmRlcldhbGxldExpc3QoKTtcclxuXHJcbiAgICBhbGVydCgnV2FsbGV0IHJlbmFtZWQgc3VjY2Vzc2Z1bGx5IScpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIERlbGV0ZSBhIHNwZWNpZmljIHdhbGxldFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVEZWxldGVXYWxsZXRNdWx0aSh3YWxsZXRJZCkge1xyXG4gIGNvbnN0IGNvbmZpcm1lZCA9IGNvbmZpcm0oXHJcbiAgICAn4pqg77iPIFdBUk5JTkcg4pqg77iPXFxuXFxuJyArXHJcbiAgICAnWW91IGFyZSBhYm91dCB0byBERUxFVEUgdGhpcyB3YWxsZXQhXFxuXFxuJyArXHJcbiAgICAnVGhpcyBhY3Rpb24gaXMgUEVSTUFORU5UIGFuZCBDQU5OT1QgYmUgdW5kb25lLlxcblxcbicgK1xyXG4gICAgJ01ha2Ugc3VyZSB5b3UgaGF2ZSB3cml0dGVuIGRvd24geW91ciBzZWVkIHBocmFzZSBvciBwcml2YXRlIGtleS5cXG5cXG4nICtcclxuICAgICdEbyB5b3Ugd2FudCB0byBjb250aW51ZT8nXHJcbiAgKTtcclxuXHJcbiAgaWYgKCFjb25maXJtZWQpIHJldHVybjtcclxuXHJcbiAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ0RlbGV0ZSBXYWxsZXQnLCAnRW50ZXIgeW91ciBwYXNzd29yZCB0byBkZWxldGUgdGhpcyB3YWxsZXQnKTtcclxuXHJcbiAgaWYgKCFwYXNzd29yZCkgcmV0dXJuO1xyXG5cclxuICB0cnkge1xyXG4gICAgYXdhaXQgZGVsZXRlV2FsbGV0KHdhbGxldElkLCBwYXNzd29yZCk7XHJcbiAgICBjbG9zZVBhc3N3b3JkUHJvbXB0KCk7XHJcblxyXG4gICAgLy8gUmVmcmVzaCB3YWxsZXQgbGlzdFxyXG4gICAgYXdhaXQgcmVuZGVyV2FsbGV0TGlzdCgpO1xyXG5cclxuICAgIC8vIElmIHdlIGRlbGV0ZWQgYWxsIHdhbGxldHMsIGdvIGJhY2sgdG8gc2V0dXBcclxuICAgIGNvbnN0IHdhbGxldHNEYXRhID0gYXdhaXQgZ2V0QWxsV2FsbGV0cygpO1xyXG4gICAgaWYgKHdhbGxldHNEYXRhLndhbGxldExpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGN1cnJlbnRTdGF0ZS5pc1VubG9ja2VkID0gZmFsc2U7XHJcbiAgICAgIGN1cnJlbnRTdGF0ZS5hZGRyZXNzID0gbnVsbDtcclxuICAgICAgc2hvd1NjcmVlbignc2NyZWVuLXNldHVwJyk7XHJcbiAgICB9XHJcblxyXG4gICAgYWxlcnQoJ1dhbGxldCBkZWxldGVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0Vycm9yIGRlbGV0aW5nIHdhbGxldDogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gRXhwb3J0IHNlZWQva2V5IGZvciBhIHNwZWNpZmljIHdhbGxldFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVFeHBvcnRGb3JXYWxsZXQod2FsbGV0SWQpIHtcclxuICBjb25zdCBwYXNzd29yZCA9IGF3YWl0IHNob3dQYXNzd29yZFByb21wdCgnRXhwb3J0IFdhbGxldCcsICdFbnRlciB5b3VyIHBhc3N3b3JkIHRvIGV4cG9ydCB3YWxsZXQgc2VjcmV0cycpO1xyXG5cclxuICBpZiAoIXBhc3N3b3JkKSByZXR1cm47XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBUcnkgdG8gZ2V0IG1uZW1vbmljIGZpcnN0XHJcbiAgICBjb25zdCBtbmVtb25pYyA9IGF3YWl0IGV4cG9ydE1uZW1vbmljRm9yV2FsbGV0KHdhbGxldElkLCBwYXNzd29yZCk7XHJcblxyXG4gICAgaWYgKG1uZW1vbmljKSB7XHJcbiAgICAgIHNob3dTZWNyZXRNb2RhbCgnU2VlZCBQaHJhc2UnLCBtbmVtb25pYyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBObyBtbmVtb25pYywgc2hvdyBwcml2YXRlIGtleVxyXG4gICAgICBjb25zdCBwcml2YXRlS2V5ID0gYXdhaXQgZXhwb3J0UHJpdmF0ZUtleUZvcldhbGxldCh3YWxsZXRJZCwgcGFzc3dvcmQpO1xyXG4gICAgICBzaG93U2VjcmV0TW9kYWwoJ1ByaXZhdGUgS2V5JywgcHJpdmF0ZUtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2VQYXNzd29yZFByb21wdCgpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBhbGVydCgnRXJyb3IgZXhwb3J0aW5nIHdhbGxldDogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gQ09OTkVDVElPTiBBUFBST1ZBTCA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDb25uZWN0aW9uQXBwcm92YWxTY3JlZW4ob3JpZ2luLCByZXF1ZXN0SWQpIHtcclxuICAvLyBMb2FkIHNldHRpbmdzIGZvciB0aGVtZVxyXG4gIGF3YWl0IGxvYWRTZXR0aW5ncygpO1xyXG4gIGFwcGx5VGhlbWUoKTtcclxuXHJcbiAgLy8gRGlzcGxheSB0aGUgb3JpZ2luXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nvbm5lY3Rpb24tc2l0ZS1vcmlnaW4nKS50ZXh0Q29udGVudCA9IG9yaWdpbjtcclxuXHJcbiAgLy8gR2V0IGFjdGl2ZSB3YWxsZXQgYWRkcmVzc1xyXG4gIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gIGlmICh3YWxsZXQgJiYgd2FsbGV0LmFkZHJlc3MpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb25uZWN0aW9uLXdhbGxldC1hZGRyZXNzJykudGV4dENvbnRlbnQgPSB3YWxsZXQuYWRkcmVzcztcclxuICB9IGVsc2Uge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nvbm5lY3Rpb24td2FsbGV0LWFkZHJlc3MnKS50ZXh0Q29udGVudCA9ICdObyB3YWxsZXQgZm91bmQnO1xyXG4gIH1cclxuXHJcbiAgLy8gU2hvdyB0aGUgY29ubmVjdGlvbiBhcHByb3ZhbCBzY3JlZW5cclxuICBzaG93U2NyZWVuKCdzY3JlZW4tY29ubmVjdGlvbi1hcHByb3ZhbCcpO1xyXG5cclxuICAvLyBTZXR1cCBhcHByb3ZlIGJ1dHRvblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS1jb25uZWN0aW9uJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogJ0NPTk5FQ1RJT05fQVBQUk9WQUwnLFxyXG4gICAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgICBhcHByb3ZlZDogdHJ1ZVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIENsb3NlIHRoZSBwb3B1cCB3aW5kb3dcclxuICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBhbGVydCgnRXJyb3IgYXBwcm92aW5nIGNvbm5lY3Rpb246ICcgKyBzYW5pdGl6ZUVycm9yKGVycm9yLm1lc3NhZ2UpKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gU2V0dXAgcmVqZWN0IGJ1dHRvblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVqZWN0LWNvbm5lY3Rpb24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnQ09OTkVDVElPTl9BUFBST1ZBTCcsXHJcbiAgICAgICAgcmVxdWVzdElkLFxyXG4gICAgICAgIGFwcHJvdmVkOiBmYWxzZVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIENsb3NlIHRoZSBwb3B1cCB3aW5kb3dcclxuICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBhbGVydCgnRXJyb3IgcmVqZWN0aW5nIGNvbm5lY3Rpb246ICcgKyBlcnJvci5tZXNzYWdlKTtcclxuICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vID09PT09IFRSQU5TQUNUSU9OIEFQUFJPVkFMID09PT09XHJcbi8vIFBvcHVsYXRlIGdhcyBwcmljZSBvcHRpb25zXHJcbmFzeW5jIGZ1bmN0aW9uIHBvcHVsYXRlR2FzUHJpY2VzKG5ldHdvcmssIHR4UmVxdWVzdCwgc3ltYm9sKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIEZldGNoIGN1cnJlbnQgZ2FzIHByaWNlIGZyb20gUlBDXHJcbiAgICBjb25zdCBnYXNQcmljZUhleCA9IGF3YWl0IHJwYy5nZXRHYXNQcmljZShuZXR3b3JrKTtcclxuICAgIGNvbnN0IGdhc1ByaWNlV2VpID0gQmlnSW50KGdhc1ByaWNlSGV4KTtcclxuICAgIGNvbnN0IGdhc1ByaWNlR3dlaSA9IE51bWJlcihnYXNQcmljZVdlaSkgLyAxZTk7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHNsb3cgKDgwJSksIG5vcm1hbCAoMTAwJSksIGZhc3QgKDE1MCUpXHJcbiAgICBjb25zdCBzbG93R3dlaSA9IChnYXNQcmljZUd3ZWkgKiAwLjgpLnRvRml4ZWQoMik7XHJcbiAgICBjb25zdCBub3JtYWxHd2VpID0gZ2FzUHJpY2VHd2VpLnRvRml4ZWQoMik7XHJcbiAgICBjb25zdCBmYXN0R3dlaSA9IChnYXNQcmljZUd3ZWkgKiAxLjUpLnRvRml4ZWQoMik7XHJcblxyXG4gICAgLy8gVXBkYXRlIFVJXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FzLXNsb3ctcHJpY2UnKS50ZXh0Q29udGVudCA9IGAke3Nsb3dHd2VpfSBHd2VpYDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtbm9ybWFsLXByaWNlJykudGV4dENvbnRlbnQgPSBgJHtub3JtYWxHd2VpfSBHd2VpYDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtZmFzdC1wcmljZScpLnRleHRDb250ZW50ID0gYCR7ZmFzdEd3ZWl9IEd3ZWlgO1xyXG5cclxuICAgIC8vIEVzdGltYXRlIGdhcyBmb3IgdGhlIHRyYW5zYWN0aW9uXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBlc3RpbWF0ZWRHYXNIZXggPSBhd2FpdCBycGMuZXN0aW1hdGVHYXMobmV0d29yaywgdHhSZXF1ZXN0KTtcclxuICAgICAgY29uc3QgZXN0aW1hdGVkR2FzID0gQmlnSW50KGVzdGltYXRlZEdhc0hleCk7XHJcblxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZXN0aW1hdGVkLWdhcycpLnRleHRDb250ZW50ID0gZXN0aW1hdGVkR2FzLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAvLyBDYWxjdWxhdGUgbWF4IGZlZSBiYXNlZCBvbiBub3JtYWwgZ2FzIHByaWNlXHJcbiAgICAgIGNvbnN0IG1heEZlZVdlaSA9IGVzdGltYXRlZEdhcyAqIGdhc1ByaWNlV2VpO1xyXG4gICAgICBjb25zdCBtYXhGZWVFdGggPSBldGhlcnMuZm9ybWF0RXRoZXIobWF4RmVlV2VpLnRvU3RyaW5nKCkpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtbWF4LWZlZScpLnRleHRDb250ZW50ID0gYCR7cGFyc2VGbG9hdChtYXhGZWVFdGgpLnRvRml4ZWQoOCl9ICR7c3ltYm9sfWA7XHJcblxyXG4gICAgICAvLyBVcGRhdGUgbWF4IGZlZSB3aGVuIGdhcyBwcmljZSBzZWxlY3Rpb24gY2hhbmdlc1xyXG4gICAgICBjb25zdCB1cGRhdGVNYXhGZWUgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRTcGVlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJnYXMtc3BlZWRcIl06Y2hlY2tlZCcpPy52YWx1ZTtcclxuICAgICAgICBsZXQgc2VsZWN0ZWRHd2VpO1xyXG5cclxuICAgICAgICBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ3Nsb3cnKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KHNsb3dHd2VpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdub3JtYWwnKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KG5vcm1hbEd3ZWkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2Zhc3QnKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KGZhc3RHd2VpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdjdXN0b20nKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXN0b20tZ2FzLXByaWNlJykudmFsdWUpIHx8IHBhcnNlRmxvYXQobm9ybWFsR3dlaSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQobm9ybWFsR3dlaSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzZWxlY3RlZEdhc1ByaWNlV2VpID0gQmlnSW50KE1hdGguZmxvb3Ioc2VsZWN0ZWRHd2VpICogMWU5KSk7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRNYXhGZWVXZWkgPSBlc3RpbWF0ZWRHYXMgKiBzZWxlY3RlZEdhc1ByaWNlV2VpO1xyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkTWF4RmVlRXRoID0gZXRoZXJzLmZvcm1hdEV0aGVyKHNlbGVjdGVkTWF4RmVlV2VpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1tYXgtZmVlJykudGV4dENvbnRlbnQgPSBgJHtwYXJzZUZsb2F0KHNlbGVjdGVkTWF4RmVlRXRoKS50b0ZpeGVkKDgpfSAke3N5bWJvbH1gO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgZ2FzIHByaWNlIGNoYW5nZXNcclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbbmFtZT1cImdhcy1zcGVlZFwiXScpLmZvckVhY2gocmFkaW8gPT4ge1xyXG4gICAgICAgIHJhZGlvLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcclxuICAgICAgICAgIHVwZGF0ZU1heEZlZSgpO1xyXG5cclxuICAgICAgICAgIC8vIFVwZGF0ZSB2aXN1YWwgaGlnaGxpZ2h0aW5nIGZvciBhbGwgZ2FzIG9wdGlvbnNcclxuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYXMtb3B0aW9uJykuZm9yRWFjaChsYWJlbCA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gbGFiZWwucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImdhcy1zcGVlZFwiXScpO1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQgJiYgaW5wdXQuY2hlY2tlZCkge1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXN1Y2Nlc3MpJztcclxuICAgICAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJXaWR0aCA9ICcycHgnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLWJvcmRlciknO1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlcldpZHRoID0gJzFweCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIC8vIFNob3cvaGlkZSBjdXN0b20gaW5wdXQgYmFzZWQgb24gc2VsZWN0aW9uXHJcbiAgICAgICAgICBjb25zdCBjdXN0b21Db250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VzdG9tLWdhcy1pbnB1dC1jb250YWluZXInKTtcclxuICAgICAgICAgIGlmIChyYWRpby52YWx1ZSA9PT0gJ2N1c3RvbScgJiYgcmFkaW8uY2hlY2tlZCkge1xyXG4gICAgICAgICAgICBjdXN0b21Db250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIC8vIEZvY3VzIHRoZSBpbnB1dCB3aGVuIGN1c3RvbSBpcyBzZWxlY3RlZFxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VzdG9tLWdhcy1wcmljZScpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGN1c3RvbUNvbnRhaW5lcikge1xyXG4gICAgICAgICAgICBjdXN0b21Db250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgc2VsZWN0ZWQgYm9yZGVyIChOb3JtYWwgaXMgY2hlY2tlZCBieSBkZWZhdWx0KVxyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FzLW9wdGlvbicpLmZvckVhY2gobGFiZWwgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gbGFiZWwucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImdhcy1zcGVlZFwiXScpO1xyXG4gICAgICAgIGlmIChpbnB1dCAmJiBpbnB1dC5jaGVja2VkKSB7XHJcbiAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJDb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1zdWNjZXNzKSc7XHJcbiAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJXaWR0aCA9ICcycHgnO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBBdXRvLXNlbGVjdCBjdXN0b20gcmFkaW8gd2hlbiB0eXBpbmcgaW4gY3VzdG9tIGdhcyBwcmljZVxyXG4gICAgICBjb25zdCBjdXN0b21HYXNJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXN0b20tZ2FzLXByaWNlJyk7XHJcbiAgICAgIGN1c3RvbUdhc0lucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtY3VzdG9tLXJhZGlvJykuY2hlY2tlZCA9IHRydWU7XHJcbiAgICAgICAgdXBkYXRlTWF4RmVlKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIH0gY2F0Y2ggKGdhc0VzdGltYXRlRXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZXN0aW1hdGluZyBnYXM6JywgZ2FzRXN0aW1hdGVFcnJvcik7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1lc3RpbWF0ZWQtZ2FzJykudGV4dENvbnRlbnQgPSAnMjEwMDAgKGRlZmF1bHQpJztcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LW1heC1mZWUnKS50ZXh0Q29udGVudCA9ICdVbmFibGUgdG8gZXN0aW1hdGUnO1xyXG4gICAgfVxyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZ2FzIHByaWNlOicsIGVycm9yKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtc2xvdy1wcmljZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtbm9ybWFsLXByaWNlJykudGV4dENvbnRlbnQgPSAnRXJyb3InO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhcy1mYXN0LXByaWNlJykudGV4dENvbnRlbnQgPSAnRXJyb3InO1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IHNlbGVjdGVkIGdhcyBwcmljZSBpbiB3ZWlcclxuZnVuY3Rpb24gZ2V0U2VsZWN0ZWRHYXNQcmljZSgpIHtcclxuICBjb25zdCBzZWxlY3RlZFNwZWVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImdhcy1zcGVlZFwiXTpjaGVja2VkJyk/LnZhbHVlO1xyXG5cclxuICBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2N1c3RvbScpIHtcclxuICAgIGNvbnN0IGN1c3RvbUd3ZWkgPSBwYXJzZUZsb2F0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXN0b20tZ2FzLXByaWNlJykudmFsdWUpO1xyXG4gICAgaWYgKGN1c3RvbUd3ZWkgJiYgY3VzdG9tR3dlaSA+IDApIHtcclxuICAgICAgLy8gQ29udmVydCBHd2VpIHRvIFdlaSAobXVsdGlwbHkgYnkgMWU5KVxyXG4gICAgICByZXR1cm4gZXRoZXJzLnBhcnNlVW5pdHMoY3VzdG9tR3dlaS50b1N0cmluZygpLCAnZ3dlaScpLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBHZXQgdGhlIGRpc3BsYXllZCBHd2VpIHZhbHVlIGFuZCBjb252ZXJ0IHRvIHdlaVxyXG4gIGxldCBnd2VpVGV4dDtcclxuICBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ3Nsb3cnKSB7XHJcbiAgICBnd2VpVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtc2xvdy1wcmljZScpLnRleHRDb250ZW50O1xyXG4gIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2Zhc3QnKSB7XHJcbiAgICBnd2VpVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtZmFzdC1wcmljZScpLnRleHRDb250ZW50O1xyXG4gIH0gZWxzZSB7XHJcbiAgICBnd2VpVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtbm9ybWFsLXByaWNlJykudGV4dENvbnRlbnQ7XHJcbiAgfVxyXG5cclxuICBjb25zdCBnd2VpID0gcGFyc2VGbG9hdChnd2VpVGV4dCk7XHJcbiAgaWYgKGd3ZWkgJiYgZ3dlaSA+IDApIHtcclxuICAgIHJldHVybiBldGhlcnMucGFyc2VVbml0cyhnd2VpLnRvU3RyaW5nKCksICdnd2VpJykudG9TdHJpbmcoKTtcclxuICB9XHJcblxyXG4gIC8vIElmIGFsbCBlbHNlIGZhaWxzLCByZXR1cm4gbnVsbCB0byB1c2UgZGVmYXVsdFxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcblxyXG4vLyBGZXRjaCBhbmQgZGlzcGxheSBjdXJyZW50IG5vbmNlIGZvciB0cmFuc2FjdGlvblxyXG5hc3luYyBmdW5jdGlvbiBmZXRjaEFuZERpc3BsYXlOb25jZShhZGRyZXNzLCBuZXR3b3JrKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5vbmNlSGV4ID0gYXdhaXQgcnBjLmdldFRyYW5zYWN0aW9uQ291bnQobmV0d29yaywgYWRkcmVzcywgJ3BlbmRpbmcnKTtcclxuICAgIGNvbnN0IG5vbmNlID0gcGFyc2VJbnQobm9uY2VIZXgsIDE2KTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXJyZW50LW5vbmNlJykudGV4dENvbnRlbnQgPSBub25jZTtcclxuICAgIC8vIEN1cnJlbnQgbm9uY2UgZmV0Y2hlZFxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBub25jZTonLCBlcnJvcik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VycmVudC1ub25jZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFNFTkQgU0NSRUVOIEdBUyBQUklDRSBIRUxQRVJTID09PT09XHJcblxyXG4vLyBQb3B1bGF0ZSBnYXMgcHJpY2VzIGZvciBTZW5kIHNjcmVlblxyXG5hc3luYyBmdW5jdGlvbiBwb3B1bGF0ZVNlbmRHYXNQcmljZXMobmV0d29yaywgdHhSZXF1ZXN0LCBzeW1ib2wpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZ2FzUHJpY2VIZXggPSBhd2FpdCBycGMuZ2V0R2FzUHJpY2UobmV0d29yayk7XHJcbiAgICBjb25zdCBnYXNQcmljZVdlaSA9IEJpZ0ludChnYXNQcmljZUhleCk7XHJcbiAgICBjb25zdCBnYXNQcmljZUd3ZWkgPSBOdW1iZXIoZ2FzUHJpY2VXZWkpIC8gMWU5O1xyXG5cclxuICAgIGNvbnN0IHNsb3dHd2VpID0gKGdhc1ByaWNlR3dlaSAqIDAuOCkudG9GaXhlZCgyKTtcclxuICAgIGNvbnN0IG5vcm1hbEd3ZWkgPSBnYXNQcmljZUd3ZWkudG9GaXhlZCgyKTtcclxuICAgIGNvbnN0IGZhc3RHd2VpID0gKGdhc1ByaWNlR3dlaSAqIDEuNSkudG9GaXhlZCgyKTtcclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1nYXMtc2xvdy1wcmljZScpLnRleHRDb250ZW50ID0gYCR7c2xvd0d3ZWl9IEd3ZWlgO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtZ2FzLW5vcm1hbC1wcmljZScpLnRleHRDb250ZW50ID0gYCR7bm9ybWFsR3dlaX0gR3dlaWA7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1nYXMtZmFzdC1wcmljZScpLnRleHRDb250ZW50ID0gYCR7ZmFzdEd3ZWl9IEd3ZWlgO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGVzdGltYXRlZEdhc0hleCA9IGF3YWl0IHJwYy5lc3RpbWF0ZUdhcyhuZXR3b3JrLCB0eFJlcXVlc3QpO1xyXG4gICAgICBjb25zdCBlc3RpbWF0ZWRHYXMgPSBCaWdJbnQoZXN0aW1hdGVkR2FzSGV4KTtcclxuXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWVzdGltYXRlZC1nYXMnKS50ZXh0Q29udGVudCA9IGVzdGltYXRlZEdhcy50b1N0cmluZygpO1xyXG5cclxuICAgICAgY29uc3QgbWF4RmVlV2VpID0gZXN0aW1hdGVkR2FzICogZ2FzUHJpY2VXZWk7XHJcbiAgICAgIGNvbnN0IG1heEZlZUV0aCA9IGV0aGVycy5mb3JtYXRFdGhlcihtYXhGZWVXZWkudG9TdHJpbmcoKSk7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLW1heC1mZWUnKS50ZXh0Q29udGVudCA9IGAke3BhcnNlRmxvYXQobWF4RmVlRXRoKS50b0ZpeGVkKDgpfSAke3N5bWJvbH1gO1xyXG5cclxuICAgICAgY29uc3QgdXBkYXRlTWF4RmVlID0gKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkU3BlZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwic2VuZC1nYXMtc3BlZWRcIl06Y2hlY2tlZCcpPy52YWx1ZTtcclxuICAgICAgICBsZXQgc2VsZWN0ZWRHd2VpO1xyXG5cclxuICAgICAgICBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ3Nsb3cnKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KHNsb3dHd2VpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdub3JtYWwnKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KG5vcm1hbEd3ZWkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2Zhc3QnKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KGZhc3RHd2VpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdjdXN0b20nKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWN1c3RvbS1nYXMtcHJpY2UnKS52YWx1ZSkgfHwgcGFyc2VGbG9hdChub3JtYWxHd2VpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2VsZWN0ZWRHd2VpID0gcGFyc2VGbG9hdChub3JtYWxHd2VpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkR2FzUHJpY2VXZWkgPSBCaWdJbnQoTWF0aC5mbG9vcihzZWxlY3RlZEd3ZWkgKiAxZTkpKTtcclxuICAgICAgICBjb25zdCBzZWxlY3RlZE1heEZlZVdlaSA9IGVzdGltYXRlZEdhcyAqIHNlbGVjdGVkR2FzUHJpY2VXZWk7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRNYXhGZWVFdGggPSBldGhlcnMuZm9ybWF0RXRoZXIoc2VsZWN0ZWRNYXhGZWVXZWkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtbWF4LWZlZScpLnRleHRDb250ZW50ID0gYCR7cGFyc2VGbG9hdChzZWxlY3RlZE1heEZlZUV0aCkudG9GaXhlZCg4KX0gJHtzeW1ib2x9YDtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W25hbWU9XCJzZW5kLWdhcy1zcGVlZFwiXScpLmZvckVhY2gocmFkaW8gPT4ge1xyXG4gICAgICAgIHJhZGlvLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcclxuICAgICAgICAgIHVwZGF0ZU1heEZlZSgpO1xyXG5cclxuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYXMtb3B0aW9uJykuZm9yRWFjaChsYWJlbCA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gbGFiZWwucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInNlbmQtZ2FzLXNwZWVkXCJdJyk7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dCAmJiBpbnB1dC5jaGVja2VkKSB7XHJcbiAgICAgICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyQ29sb3IgPSAndmFyKC0tdGVybWluYWwtc3VjY2VzcyknO1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlcldpZHRoID0gJzJweCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyQ29sb3IgPSAndmFyKC0tdGVybWluYWwtYm9yZGVyKSc7XHJcbiAgICAgICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyV2lkdGggPSAnMXB4JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgY29uc3QgY3VzdG9tQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtY3VzdG9tLWdhcy1pbnB1dC1jb250YWluZXInKTtcclxuICAgICAgICAgIGlmIChyYWRpby52YWx1ZSA9PT0gJ2N1c3RvbScgJiYgcmFkaW8uY2hlY2tlZCkge1xyXG4gICAgICAgICAgICBjdXN0b21Db250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWN1c3RvbS1nYXMtcHJpY2UnKS5mb2N1cygpO1xyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChjdXN0b21Db250YWluZXIpIHtcclxuICAgICAgICAgICAgY3VzdG9tQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYXMtb3B0aW9uJykuZm9yRWFjaChsYWJlbCA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBsYWJlbC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwic2VuZC1nYXMtc3BlZWRcIl0nKTtcclxuICAgICAgICBpZiAoaW5wdXQgJiYgaW5wdXQuY2hlY2tlZCkge1xyXG4gICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyQ29sb3IgPSAndmFyKC0tdGVybWluYWwtc3VjY2VzcyknO1xyXG4gICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyV2lkdGggPSAnMnB4JztcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgY3VzdG9tR2FzSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXN0b20tZ2FzLXByaWNlJyk7XHJcbiAgICAgIGN1c3RvbUdhc0lucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWdhcy1jdXN0b20tcmFkaW8nKS5jaGVja2VkID0gdHJ1ZTtcclxuICAgICAgICB1cGRhdGVNYXhGZWUoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgfSBjYXRjaCAoZ2FzRXN0aW1hdGVFcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBlc3RpbWF0aW5nIGdhczonLCBnYXNFc3RpbWF0ZUVycm9yKTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtZXN0aW1hdGVkLWdhcycpLnRleHRDb250ZW50ID0gJzIxMDAwIChkZWZhdWx0KSc7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLW1heC1mZWUnKS50ZXh0Q29udGVudCA9ICdVbmFibGUgdG8gZXN0aW1hdGUnO1xyXG4gICAgfVxyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZ2FzIHByaWNlOicsIGVycm9yKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWdhcy1zbG93LXByaWNlJykudGV4dENvbnRlbnQgPSAnRXJyb3InO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtZ2FzLW5vcm1hbC1wcmljZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWdhcy1mYXN0LXByaWNlJykudGV4dENvbnRlbnQgPSAnRXJyb3InO1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IHNlbGVjdGVkIGdhcyBwcmljZSBmcm9tIFNlbmQgc2NyZWVuXHJcbmZ1bmN0aW9uIGdldFNlbGVjdGVkU2VuZEdhc1ByaWNlKCkge1xyXG4gIGNvbnN0IHNlbGVjdGVkU3BlZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwic2VuZC1nYXMtc3BlZWRcIl06Y2hlY2tlZCcpPy52YWx1ZTtcclxuXHJcbiAgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdjdXN0b20nKSB7XHJcbiAgICBjb25zdCBjdXN0b21Hd2VpID0gcGFyc2VGbG9hdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXN0b20tZ2FzLXByaWNlJykudmFsdWUpO1xyXG4gICAgaWYgKGN1c3RvbUd3ZWkgJiYgY3VzdG9tR3dlaSA+IDApIHtcclxuICAgICAgcmV0dXJuIGV0aGVycy5wYXJzZVVuaXRzKGN1c3RvbUd3ZWkudG9TdHJpbmcoKSwgJ2d3ZWknKS50b1N0cmluZygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbGV0IGd3ZWlUZXh0O1xyXG4gIGlmIChzZWxlY3RlZFNwZWVkID09PSAnc2xvdycpIHtcclxuICAgIGd3ZWlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtZ2FzLXNsb3ctcHJpY2UnKS50ZXh0Q29udGVudDtcclxuICB9IGVsc2UgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdmYXN0Jykge1xyXG4gICAgZ3dlaVRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1nYXMtZmFzdC1wcmljZScpLnRleHRDb250ZW50O1xyXG4gIH0gZWxzZSB7XHJcbiAgICBnd2VpVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWdhcy1ub3JtYWwtcHJpY2UnKS50ZXh0Q29udGVudDtcclxuICB9XHJcblxyXG4gIGNvbnN0IGd3ZWkgPSBwYXJzZUZsb2F0KGd3ZWlUZXh0KTtcclxuICBpZiAoZ3dlaSAmJiBnd2VpID4gMCkge1xyXG4gICAgcmV0dXJuIGV0aGVycy5wYXJzZVVuaXRzKGd3ZWkudG9TdHJpbmcoKSwgJ2d3ZWknKS50b1N0cmluZygpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbi8vIFBvcHVsYXRlIGdhcyBwcmljZXMgZm9yIFRva2VuIFNlbmRcclxuYXN5bmMgZnVuY3Rpb24gcG9wdWxhdGVUb2tlbkdhc1ByaWNlcyhuZXR3b3JrLCB0eFJlcXVlc3QsIHN5bWJvbCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBnYXNQcmljZUhleCA9IGF3YWl0IHJwYy5nZXRHYXNQcmljZShuZXR3b3JrKTtcclxuICAgIGNvbnN0IGdhc1ByaWNlV2VpID0gQmlnSW50KGdhc1ByaWNlSGV4KTtcclxuICAgIGNvbnN0IGdhc1ByaWNlR3dlaSA9IE51bWJlcihnYXNQcmljZVdlaSkgLyAxZTk7XHJcblxyXG4gICAgY29uc3Qgc2xvd0d3ZWkgPSAoZ2FzUHJpY2VHd2VpICogMC44KS50b0ZpeGVkKDIpO1xyXG4gICAgY29uc3Qgbm9ybWFsR3dlaSA9IGdhc1ByaWNlR3dlaS50b0ZpeGVkKDIpO1xyXG4gICAgY29uc3QgZmFzdEd3ZWkgPSAoZ2FzUHJpY2VHd2VpICogMS41KS50b0ZpeGVkKDIpO1xyXG5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1nYXMtc2xvdy1wcmljZScpLnRleHRDb250ZW50ID0gYCR7c2xvd0d3ZWl9IEd3ZWlgO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWdhcy1ub3JtYWwtcHJpY2UnKS50ZXh0Q29udGVudCA9IGAke25vcm1hbEd3ZWl9IEd3ZWlgO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWdhcy1mYXN0LXByaWNlJykudGV4dENvbnRlbnQgPSBgJHtmYXN0R3dlaX0gR3dlaWA7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZXN0aW1hdGVkR2FzSGV4ID0gYXdhaXQgcnBjLmVzdGltYXRlR2FzKG5ldHdvcmssIHR4UmVxdWVzdCk7XHJcbiAgICAgIGNvbnN0IGVzdGltYXRlZEdhcyA9IEJpZ0ludChlc3RpbWF0ZWRHYXNIZXgpO1xyXG5cclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWVzdGltYXRlZC1nYXMnKS50ZXh0Q29udGVudCA9IGVzdGltYXRlZEdhcy50b1N0cmluZygpO1xyXG5cclxuICAgICAgY29uc3QgbWF4RmVlV2VpID0gZXN0aW1hdGVkR2FzICogZ2FzUHJpY2VXZWk7XHJcbiAgICAgIGNvbnN0IG1heEZlZUV0aCA9IGV0aGVycy5mb3JtYXRFdGhlcihtYXhGZWVXZWkudG9TdHJpbmcoKSk7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1tYXgtZmVlJykudGV4dENvbnRlbnQgPSBgJHtwYXJzZUZsb2F0KG1heEZlZUV0aCkudG9GaXhlZCg4KX0gJHtzeW1ib2x9YDtcclxuXHJcbiAgICAgIGNvbnN0IHVwZGF0ZU1heEZlZSA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCBzZWxlY3RlZFNwZWVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInRva2VuLWdhcy1zcGVlZFwiXTpjaGVja2VkJyk/LnZhbHVlO1xyXG4gICAgICAgIGxldCBzZWxlY3RlZEd3ZWk7XHJcblxyXG4gICAgICAgIGlmIChzZWxlY3RlZFNwZWVkID09PSAnc2xvdycpIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQoc2xvd0d3ZWkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ25vcm1hbCcpIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQobm9ybWFsR3dlaSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RlZFNwZWVkID09PSAnZmFzdCcpIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQoZmFzdEd3ZWkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2N1c3RvbScpIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1c3RvbS1nYXMtcHJpY2UnKS52YWx1ZSkgfHwgcGFyc2VGbG9hdChub3JtYWxHd2VpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2VsZWN0ZWRHd2VpID0gcGFyc2VGbG9hdChub3JtYWxHd2VpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkR2FzUHJpY2VXZWkgPSBCaWdJbnQoTWF0aC5mbG9vcihzZWxlY3RlZEd3ZWkgKiAxZTkpKTtcclxuICAgICAgICBjb25zdCBzZWxlY3RlZE1heEZlZVdlaSA9IGVzdGltYXRlZEdhcyAqIHNlbGVjdGVkR2FzUHJpY2VXZWk7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRNYXhGZWVFdGggPSBldGhlcnMuZm9ybWF0RXRoZXIoc2VsZWN0ZWRNYXhGZWVXZWkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLW1heC1mZWUnKS50ZXh0Q29udGVudCA9IGAke3BhcnNlRmxvYXQoc2VsZWN0ZWRNYXhGZWVFdGgpLnRvRml4ZWQoOCl9ICR7c3ltYm9sfWA7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFtuYW1lPVwidG9rZW4tZ2FzLXNwZWVkXCJdJykuZm9yRWFjaChyYWRpbyA9PiB7XHJcbiAgICAgICAgcmFkaW8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xyXG4gICAgICAgICAgdXBkYXRlTWF4RmVlKCk7XHJcblxyXG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmdhcy1vcHRpb24nKS5mb3JFYWNoKGxhYmVsID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaW5wdXQgPSBsYWJlbC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwidG9rZW4tZ2FzLXNwZWVkXCJdJyk7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dCAmJiBpbnB1dC5jaGVja2VkKSB7XHJcbiAgICAgICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyQ29sb3IgPSAndmFyKC0tdGVybWluYWwtc3VjY2VzcyknO1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlcldpZHRoID0gJzJweCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyQ29sb3IgPSAndmFyKC0tdGVybWluYWwtYm9yZGVyKSc7XHJcbiAgICAgICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyV2lkdGggPSAnMXB4JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgY29uc3QgY3VzdG9tQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1c3RvbS1nYXMtaW5wdXQtY29udGFpbmVyJyk7XHJcbiAgICAgICAgICBpZiAocmFkaW8udmFsdWUgPT09ICdjdXN0b20nICYmIHJhZGlvLmNoZWNrZWQpIHtcclxuICAgICAgICAgICAgY3VzdG9tQ29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tY3VzdG9tLWdhcy1wcmljZScpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGN1c3RvbUNvbnRhaW5lcikge1xyXG4gICAgICAgICAgICBjdXN0b21Db250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmdhcy1vcHRpb24nKS5mb3JFYWNoKGxhYmVsID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IGxhYmVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJ0b2tlbi1nYXMtc3BlZWRcIl0nKTtcclxuICAgICAgICBpZiAoaW5wdXQgJiYgaW5wdXQuY2hlY2tlZCkge1xyXG4gICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyQ29sb3IgPSAndmFyKC0tdGVybWluYWwtc3VjY2VzcyknO1xyXG4gICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyV2lkdGggPSAnMnB4JztcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgY3VzdG9tR2FzSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tY3VzdG9tLWdhcy1wcmljZScpO1xyXG4gICAgICBjdXN0b21HYXNJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZ2FzLWN1c3RvbS1yYWRpbycpLmNoZWNrZWQgPSB0cnVlO1xyXG4gICAgICAgIHVwZGF0ZU1heEZlZSgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICB9IGNhdGNoIChnYXNFc3RpbWF0ZUVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGVzdGltYXRpbmcgZ2FzOicsIGdhc0VzdGltYXRlRXJyb3IpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZXN0aW1hdGVkLWdhcycpLnRleHRDb250ZW50ID0gJzY1MDAwIChkZWZhdWx0KSc7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1tYXgtZmVlJykudGV4dENvbnRlbnQgPSAnVW5hYmxlIHRvIGVzdGltYXRlJztcclxuICAgIH1cclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZ2FzLXNsb3ctcHJpY2UnKS50ZXh0Q29udGVudCA9ICdFcnJvcic7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZ2FzLW5vcm1hbC1wcmljZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1nYXMtZmFzdC1wcmljZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCBzZWxlY3RlZCBnYXMgcHJpY2UgZnJvbSBUb2tlbiBTZW5kXHJcbmZ1bmN0aW9uIGdldFNlbGVjdGVkVG9rZW5HYXNQcmljZSgpIHtcclxuICBjb25zdCBzZWxlY3RlZFNwZWVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInRva2VuLWdhcy1zcGVlZFwiXTpjaGVja2VkJyk/LnZhbHVlO1xyXG5cclxuICBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2N1c3RvbScpIHtcclxuICAgIGNvbnN0IGN1c3RvbUd3ZWkgPSBwYXJzZUZsb2F0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1jdXN0b20tZ2FzLXByaWNlJykudmFsdWUpO1xyXG4gICAgaWYgKGN1c3RvbUd3ZWkgJiYgY3VzdG9tR3dlaSA+IDApIHtcclxuICAgICAgcmV0dXJuIGV0aGVycy5wYXJzZVVuaXRzKGN1c3RvbUd3ZWkudG9TdHJpbmcoKSwgJ2d3ZWknKS50b1N0cmluZygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbGV0IGd3ZWlUZXh0O1xyXG4gIGlmIChzZWxlY3RlZFNwZWVkID09PSAnc2xvdycpIHtcclxuICAgIGd3ZWlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWdhcy1zbG93LXByaWNlJykudGV4dENvbnRlbnQ7XHJcbiAgfSBlbHNlIGlmIChzZWxlY3RlZFNwZWVkID09PSAnZmFzdCcpIHtcclxuICAgIGd3ZWlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWdhcy1mYXN0LXByaWNlJykudGV4dENvbnRlbnQ7XHJcbiAgfSBlbHNlIHtcclxuICAgIGd3ZWlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWdhcy1ub3JtYWwtcHJpY2UnKS50ZXh0Q29udGVudDtcclxuICB9XHJcblxyXG4gIGNvbnN0IGd3ZWkgPSBwYXJzZUZsb2F0KGd3ZWlUZXh0KTtcclxuICBpZiAoZ3dlaSAmJiBnd2VpID4gMCkge1xyXG4gICAgcmV0dXJuIGV0aGVycy5wYXJzZVVuaXRzKGd3ZWkudG9TdHJpbmcoKSwgJ2d3ZWknKS50b1N0cmluZygpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbi8vIFNob3cgdHJhbnNhY3Rpb24gc3RhdHVzIGZvciBTZW5kIHNjcmVlblxyXG5hc3luYyBmdW5jdGlvbiBzaG93U2VuZFRyYW5zYWN0aW9uU3RhdHVzKHR4SGFzaCwgbmV0d29yaywgYW1vdW50LCBzeW1ib2wpIHtcclxuICAvLyBIaWRlIHNlbmQgZm9ybVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWZvcm0nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gU2hvdyBzdGF0dXMgc2VjdGlvblxyXG4gIGNvbnN0IHN0YXR1c1NlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1zdGF0dXMtc2VjdGlvbicpO1xyXG4gIHN0YXR1c1NlY3Rpb24uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcblxyXG4gIC8vIFBvcHVsYXRlIHRyYW5zYWN0aW9uIGhhc2hcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1zdGF0dXMtaGFzaCcpLnRleHRDb250ZW50ID0gdHhIYXNoO1xyXG5cclxuICAvLyBTZXR1cCBWaWV3IG9uIEV4cGxvcmVyIGJ1dHRvblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tc2VuZC1zdGF0dXMtZXhwbG9yZXInKS5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgY29uc3QgdXJsID0gZ2V0RXhwbG9yZXJVcmwobmV0d29yaywgJ3R4JywgdHhIYXNoKTtcclxuICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybCB9KTtcclxuICB9O1xyXG5cclxuICAvLyBHZXQgYWN0aXZlIHdhbGxldCBhZGRyZXNzXHJcbiAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgY29uc3QgYWRkcmVzcyA9IHdhbGxldD8uYWRkcmVzcztcclxuXHJcbiAgLy8gUG9sbCBmb3IgdHJhbnNhY3Rpb24gc3RhdHVzXHJcbiAgbGV0IHBvbGxJbnRlcnZhbDtcclxuICBjb25zdCB1cGRhdGVTdGF0dXMgPSBhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnR0VUX1RYX0JZX0hBU0gnLFxyXG4gICAgICAgIGFkZHJlc3M6IGFkZHJlc3MsXHJcbiAgICAgICAgdHhIYXNoOiB0eEhhc2hcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAocmVzcG9uc2Uuc3VjY2VzcyAmJiByZXNwb25zZS50cmFuc2FjdGlvbikge1xyXG4gICAgICAgIGNvbnN0IHR4ID0gcmVzcG9uc2UudHJhbnNhY3Rpb247XHJcbiAgICAgICAgY29uc3Qgc3RhdHVzTWVzc2FnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLXN0YXR1cy1tZXNzYWdlJyk7XHJcbiAgICAgICAgY29uc3Qgc3RhdHVzRGV0YWlscyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLXN0YXR1cy1kZXRhaWxzJyk7XHJcbiAgICAgICAgY29uc3QgcGVuZGluZ0FjdGlvbnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1zdGF0dXMtcGVuZGluZy1hY3Rpb25zJyk7XHJcblxyXG4gICAgICAgIGlmICh0eC5zdGF0dXMgPT09ICdjb25maXJtZWQnKSB7XHJcbiAgICAgICAgICBzdGF0dXNNZXNzYWdlLnRleHRDb250ZW50ID0gJ+KchSBUcmFuc2FjdGlvbiBDb25maXJtZWQhJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMudGV4dENvbnRlbnQgPSBgQmxvY2s6ICR7dHguYmxvY2tOdW1iZXJ9YDtcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMuc3R5bGUuY29sb3IgPSAndmFyKC0tdGVybWluYWwtc3VjY2VzcyknO1xyXG4gICAgICAgICAgcGVuZGluZ0FjdGlvbnMuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgaWYgKHBvbGxJbnRlcnZhbCkge1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHBvbGxJbnRlcnZhbCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gTm90ZTogRGVza3RvcCBub3RpZmljYXRpb24gaXMgc2VudCBieSBiYWNrZ3JvdW5kIHNlcnZpY2Ugd29ya2VyXHJcbiAgICAgICAgICAvLyBObyBuZWVkIHRvIHNlbmQgYW5vdGhlciBvbmUgaGVyZSB0byBhdm9pZCBkdXBsaWNhdGVzXHJcblxyXG4gICAgICAgICAgLy8gQXV0by1jbG9zZSBhbmQgcmV0dXJuIHRvIGRhc2hib2FyZCBhZnRlciAyIHNlY29uZHNcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJyk7XHJcbiAgICAgICAgICAgIC8vIFJlZnJlc2ggZGFzaGJvYXJkXHJcbiAgICAgICAgICAgIHVwZGF0ZURhc2hib2FyZCgpO1xyXG4gICAgICAgICAgfSwgMjAwMCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eC5zdGF0dXMgPT09ICdmYWlsZWQnKSB7XHJcbiAgICAgICAgICBzdGF0dXNNZXNzYWdlLnRleHRDb250ZW50ID0gJ+KdjCBUcmFuc2FjdGlvbiBGYWlsZWQnO1xyXG4gICAgICAgICAgc3RhdHVzRGV0YWlscy50ZXh0Q29udGVudCA9ICdUaGUgdHJhbnNhY3Rpb24gd2FzIHJlamVjdGVkIG9yIHJlcGxhY2VkJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMuc3R5bGUuY29sb3IgPSAnI2ZmNDQ0NCc7XHJcbiAgICAgICAgICBwZW5kaW5nQWN0aW9ucy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgICBpZiAocG9sbEludGVydmFsKSB7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwocG9sbEludGVydmFsKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3RhdHVzTWVzc2FnZS50ZXh0Q29udGVudCA9ICfij7MgV2FpdGluZyBmb3IgY29uZmlybWF0aW9uLi4uJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMudGV4dENvbnRlbnQgPSAnVGhpcyB1c3VhbGx5IHRha2VzIDEwLTMwIHNlY29uZHMnO1xyXG4gICAgICAgICAgc3RhdHVzRGV0YWlscy5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1mZy1kaW0pJztcclxuICAgICAgICAgIHBlbmRpbmdBY3Rpb25zLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2hlY2tpbmcgdHJhbnNhY3Rpb24gc3RhdHVzOicsIGVycm9yKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBhd2FpdCB1cGRhdGVTdGF0dXMoKTtcclxuICBwb2xsSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCh1cGRhdGVTdGF0dXMsIDMwMDApO1xyXG5cclxuICAvLyBTZXR1cCBjbG9zZSBidXR0b25cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLXNlbmQtc3RhdHVzJykub25jbGljayA9ICgpID0+IHtcclxuICAgIGlmIChwb2xsSW50ZXJ2YWwpIHtcclxuICAgICAgY2xlYXJJbnRlcnZhbChwb2xsSW50ZXJ2YWwpO1xyXG4gICAgfVxyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpO1xyXG4gICAgdXBkYXRlRGFzaGJvYXJkKCk7XHJcbiAgfTtcclxuXHJcbiAgLy8gU2V0dXAgU3BlZWQgVXAgYnV0dG9uXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1zZW5kLXN0YXR1cy1zcGVlZC11cCcpLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAvLyBUT0RPOiBJbXBsZW1lbnQgc3BlZWQgdXAgdHJhbnNhY3Rpb24gZnVuY3Rpb25hbGl0eVxyXG4gICAgYWxlcnQoJ1NwZWVkIFVwIGZ1bmN0aW9uYWxpdHkgd2lsbCBiZSBpbXBsZW1lbnRlZCBpbiBhIGZ1dHVyZSB1cGRhdGUnKTtcclxuICB9O1xyXG5cclxuICAvLyBTZXR1cCBDYW5jZWwgYnV0dG9uXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1zZW5kLXN0YXR1cy1jYW5jZWwnKS5vbmNsaWNrID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgLy8gVE9ETzogSW1wbGVtZW50IGNhbmNlbCB0cmFuc2FjdGlvbiBmdW5jdGlvbmFsaXR5XHJcbiAgICBhbGVydCgnQ2FuY2VsIGZ1bmN0aW9uYWxpdHkgd2lsbCBiZSBpbXBsZW1lbnRlZCBpbiBhIGZ1dHVyZSB1cGRhdGUnKTtcclxuICB9O1xyXG59XHJcblxyXG4vLyBTaG93IHRyYW5zYWN0aW9uIHN0YXR1cyBmb3IgVG9rZW4gU2VuZFxyXG5hc3luYyBmdW5jdGlvbiBzaG93VG9rZW5TZW5kVHJhbnNhY3Rpb25TdGF0dXModHhIYXNoLCBuZXR3b3JrLCBhbW91bnQsIHN5bWJvbCkge1xyXG4gIC8vIEhpZGUgdG9rZW4gc2VuZCBmb3JtXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXNlbmQtZm9ybScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAvLyBTaG93IHN0YXR1cyBzZWN0aW9uXHJcbiAgY29uc3Qgc3RhdHVzU2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1zZW5kLXN0YXR1cy1zZWN0aW9uJyk7XHJcbiAgc3RhdHVzU2VjdGlvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gUG9wdWxhdGUgdHJhbnNhY3Rpb24gaGFzaFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1zZW5kLXN0YXR1cy1oYXNoJykudGV4dENvbnRlbnQgPSB0eEhhc2g7XHJcblxyXG4gIC8vIFNldHVwIFZpZXcgb24gRXhwbG9yZXIgYnV0dG9uXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi10b2tlbi1zZW5kLXN0YXR1cy1leHBsb3JlcicpLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICBjb25zdCB1cmwgPSBnZXRFeHBsb3JlclVybChuZXR3b3JrLCAndHgnLCB0eEhhc2gpO1xyXG4gICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsIH0pO1xyXG4gIH07XHJcblxyXG4gIC8vIEdldCBhY3RpdmUgd2FsbGV0IGFkZHJlc3NcclxuICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICBjb25zdCBhZGRyZXNzID0gd2FsbGV0Py5hZGRyZXNzO1xyXG5cclxuICAvLyBQb2xsIGZvciB0cmFuc2FjdGlvbiBzdGF0dXNcclxuICBsZXQgcG9sbEludGVydmFsO1xyXG4gIGNvbnN0IHVwZGF0ZVN0YXR1cyA9IGFzeW5jICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgIHR5cGU6ICdHRVRfVFhfQllfSEFTSCcsXHJcbiAgICAgICAgYWRkcmVzczogYWRkcmVzcyxcclxuICAgICAgICB0eEhhc2g6IHR4SGFzaFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzICYmIHJlc3BvbnNlLnRyYW5zYWN0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgdHggPSByZXNwb25zZS50cmFuc2FjdGlvbjtcclxuICAgICAgICBjb25zdCBzdGF0dXNNZXNzYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXNlbmQtc3RhdHVzLW1lc3NhZ2UnKTtcclxuICAgICAgICBjb25zdCBzdGF0dXNEZXRhaWxzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXNlbmQtc3RhdHVzLWRldGFpbHMnKTtcclxuICAgICAgICBjb25zdCBwZW5kaW5nQWN0aW9ucyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1zZW5kLXN0YXR1cy1wZW5kaW5nLWFjdGlvbnMnKTtcclxuXHJcbiAgICAgICAgaWYgKHR4LnN0YXR1cyA9PT0gJ2NvbmZpcm1lZCcpIHtcclxuICAgICAgICAgIHN0YXR1c01lc3NhZ2UudGV4dENvbnRlbnQgPSAn4pyFIFRyYW5zYWN0aW9uIENvbmZpcm1lZCEnO1xyXG4gICAgICAgICAgc3RhdHVzRGV0YWlscy50ZXh0Q29udGVudCA9IGBCbG9jazogJHt0eC5ibG9ja051bWJlcn1gO1xyXG4gICAgICAgICAgc3RhdHVzRGV0YWlscy5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1zdWNjZXNzKSc7XHJcbiAgICAgICAgICBwZW5kaW5nQWN0aW9ucy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgICBpZiAocG9sbEludGVydmFsKSB7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwocG9sbEludGVydmFsKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBOb3RlOiBEZXNrdG9wIG5vdGlmaWNhdGlvbiBpcyBzZW50IGJ5IGJhY2tncm91bmQgc2VydmljZSB3b3JrZXJcclxuICAgICAgICAgIC8vIE5vIG5lZWQgdG8gc2VuZCBhbm90aGVyIG9uZSBoZXJlIHRvIGF2b2lkIGR1cGxpY2F0ZXNcclxuXHJcbiAgICAgICAgICAvLyBBdXRvLWNsb3NlIGFuZCByZXR1cm4gdG8gdG9rZW5zIHNjcmVlbiBhZnRlciAyIHNlY29uZHNcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBzaG93U2NyZWVuKCdzY3JlZW4tdG9rZW5zJyk7XHJcbiAgICAgICAgICAgIC8vIFJlZnJlc2ggdG9rZW5zXHJcbiAgICAgICAgICAgIGxvYWRUb2tlbnNTY3JlZW4oKTtcclxuICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHguc3RhdHVzID09PSAnZmFpbGVkJykge1xyXG4gICAgICAgICAgc3RhdHVzTWVzc2FnZS50ZXh0Q29udGVudCA9ICfinYwgVHJhbnNhY3Rpb24gRmFpbGVkJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMudGV4dENvbnRlbnQgPSAnVGhlIHRyYW5zYWN0aW9uIHdhcyByZWplY3RlZCBvciByZXBsYWNlZCc7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnN0eWxlLmNvbG9yID0gJyNmZjQ0NDQnO1xyXG4gICAgICAgICAgcGVuZGluZ0FjdGlvbnMuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgaWYgKHBvbGxJbnRlcnZhbCkge1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHBvbGxJbnRlcnZhbCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHN0YXR1c01lc3NhZ2UudGV4dENvbnRlbnQgPSAn4o+zIFdhaXRpbmcgZm9yIGNvbmZpcm1hdGlvbi4uLic7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnRleHRDb250ZW50ID0gJ1RoaXMgdXN1YWxseSB0YWtlcyAxMC0zMCBzZWNvbmRzJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMuc3R5bGUuY29sb3IgPSAndmFyKC0tdGVybWluYWwtZmctZGltKSc7XHJcbiAgICAgICAgICBwZW5kaW5nQWN0aW9ucy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNoZWNraW5nIHRyYW5zYWN0aW9uIHN0YXR1czonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgYXdhaXQgdXBkYXRlU3RhdHVzKCk7XHJcbiAgcG9sbEludGVydmFsID0gc2V0SW50ZXJ2YWwodXBkYXRlU3RhdHVzLCAzMDAwKTtcclxuXHJcbiAgLy8gU2V0dXAgY2xvc2UgYnV0dG9uXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS10b2tlbi1zZW5kLXN0YXR1cycpLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICBpZiAocG9sbEludGVydmFsKSB7XHJcbiAgICAgIGNsZWFySW50ZXJ2YWwocG9sbEludGVydmFsKTtcclxuICAgIH1cclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi10b2tlbnMnKTtcclxuICAgIGxvYWRUb2tlbnNTY3JlZW4oKTtcclxuICB9O1xyXG5cclxuICAvLyBTZXR1cCBTcGVlZCBVcCBidXR0b25cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXRva2VuLXNlbmQtc3RhdHVzLXNwZWVkLXVwJykub25jbGljayA9IGFzeW5jICgpID0+IHtcclxuICAgIC8vIFRPRE86IEltcGxlbWVudCBzcGVlZCB1cCB0cmFuc2FjdGlvbiBmdW5jdGlvbmFsaXR5XHJcbiAgICBhbGVydCgnU3BlZWQgVXAgZnVuY3Rpb25hbGl0eSB3aWxsIGJlIGltcGxlbWVudGVkIGluIGEgZnV0dXJlIHVwZGF0ZScpO1xyXG4gIH07XHJcblxyXG4gIC8vIFNldHVwIENhbmNlbCBidXR0b25cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXRva2VuLXNlbmQtc3RhdHVzLWNhbmNlbCcpLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAvLyBUT0RPOiBJbXBsZW1lbnQgY2FuY2VsIHRyYW5zYWN0aW9uIGZ1bmN0aW9uYWxpdHlcclxuICAgIGFsZXJ0KCdDYW5jZWwgZnVuY3Rpb25hbGl0eSB3aWxsIGJlIGltcGxlbWVudGVkIGluIGEgZnV0dXJlIHVwZGF0ZScpO1xyXG4gIH07XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRyYW5zYWN0aW9uQXBwcm92YWxTY3JlZW4ocmVxdWVzdElkKSB7XHJcbiAgLy8gTG9hZCBzZXR0aW5ncyBmb3IgdGhlbWVcclxuICBhd2FpdCBsb2FkU2V0dGluZ3MoKTtcclxuICBhcHBseVRoZW1lKCk7XHJcblxyXG4gIC8vIEdldCB0cmFuc2FjdGlvbiByZXF1ZXN0IGRldGFpbHMgZnJvbSBiYWNrZ3JvdW5kXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX1RSQU5TQUNUSU9OX1JFUVVFU1QnLFxyXG4gICAgICByZXF1ZXN0SWRcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghcmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICBhbGVydCgnVHJhbnNhY3Rpb24gcmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcpO1xyXG4gICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgb3JpZ2luLCB0eFJlcXVlc3QgfSA9IHJlc3BvbnNlO1xyXG5cclxuICAgIC8vIEdldCBhY3RpdmUgd2FsbGV0XHJcbiAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBsb2FkKCdjdXJyZW50TmV0d29yaycpIHx8ICdwdWxzZWNoYWluVGVzdG5ldCc7XHJcblxyXG4gICAgLy8gUG9wdWxhdGUgdHJhbnNhY3Rpb24gZGV0YWlsc1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXNpdGUtb3JpZ2luJykudGV4dENvbnRlbnQgPSBvcmlnaW47XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZnJvbS1hZGRyZXNzJykudGV4dENvbnRlbnQgPSB3YWxsZXQ/LmFkZHJlc3MgfHwgJzB4MDAwMC4uLjAwMDAnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXRvLWFkZHJlc3MnKS50ZXh0Q29udGVudCA9IHR4UmVxdWVzdC50byB8fCAnQ29udHJhY3QgQ3JlYXRpb24nO1xyXG5cclxuICAgIC8vIEZvcm1hdCB2YWx1ZVxyXG4gICAgY29uc3Qgc3ltYm9scyA9IHtcclxuICAgICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3RQTFMnLFxyXG4gICAgICAncHVsc2VjaGFpbic6ICdQTFMnLFxyXG4gICAgICAnZXRoZXJldW0nOiAnRVRIJyxcclxuICAgICAgJ3NlcG9saWEnOiAnU0VQJ1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHN5bWJvbCA9IHN5bWJvbHNbbmV0d29ya10gfHwgJ1RPS0VOJztcclxuXHJcbiAgICBpZiAodHhSZXF1ZXN0LnZhbHVlKSB7XHJcbiAgICAgIGNvbnN0IHZhbHVlID0gZXRoZXJzLmZvcm1hdEV0aGVyKHR4UmVxdWVzdC52YWx1ZSk7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC12YWx1ZScpLnRleHRDb250ZW50ID0gYCR7dmFsdWV9ICR7c3ltYm9sfWA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtdmFsdWUnKS50ZXh0Q29udGVudCA9IGAwICR7c3ltYm9sfWA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2hvdyBkYXRhIHNlY3Rpb24gaWYgdGhlcmUncyBjb250cmFjdCBkYXRhXHJcbiAgICBpZiAodHhSZXF1ZXN0LmRhdGEgJiYgdHhSZXF1ZXN0LmRhdGEgIT09ICcweCcpIHtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRhdGEtc2VjdGlvbicpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGF0YScpLnRleHRDb250ZW50ID0gdHhSZXF1ZXN0LmRhdGE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGF0YS1zZWN0aW9uJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2hvdyB0aGUgdHJhbnNhY3Rpb24gYXBwcm92YWwgc2NyZWVuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tdHJhbnNhY3Rpb24tYXBwcm92YWwnKTtcclxuXHJcbiAgICAvLyBGZXRjaCBhbmQgcG9wdWxhdGUgZ2FzIHByaWNlIG9wdGlvbnNcclxuICAgIGF3YWl0IHBvcHVsYXRlR2FzUHJpY2VzKG5ldHdvcmssIHR4UmVxdWVzdCwgc3ltYm9sKTtcclxuXHJcbiAgICAvLyBGZXRjaCBhbmQgZGlzcGxheSBjdXJyZW50IG5vbmNlXHJcbiAgICBhd2FpdCBmZXRjaEFuZERpc3BsYXlOb25jZSh3YWxsZXQuYWRkcmVzcywgbmV0d29yayk7XHJcblxyXG4gICAgLy8gU2V0dXAgY3VzdG9tIG5vbmNlIGNoZWNrYm94XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VzdG9tLW5vbmNlLWNoZWNrYm94JykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N1c3RvbS1ub25jZS1pbnB1dC1jb250YWluZXInKTtcclxuICAgICAgaWYgKGUudGFyZ2V0LmNoZWNrZWQpIHtcclxuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgLy8gUHJlLWZpbGwgd2l0aCBjdXJyZW50IG5vbmNlXHJcbiAgICAgICAgY29uc3QgY3VycmVudE5vbmNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWN1cnJlbnQtbm9uY2UnKS50ZXh0Q29udGVudDtcclxuICAgICAgICBpZiAoY3VycmVudE5vbmNlICE9PSAnLS0nKSB7XHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VzdG9tLW5vbmNlJykudmFsdWUgPSBjdXJyZW50Tm9uY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2V0dXAgYXBwcm92ZSBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS10cmFuc2FjdGlvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBhcHByb3ZlQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1hcHByb3ZlLXRyYW5zYWN0aW9uJyk7XHJcbiAgICAgIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXBhc3N3b3JkJykudmFsdWU7XHJcbiAgICAgIGNvbnN0IGVycm9yRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZXJyb3InKTtcclxuXHJcbiAgICAgIGlmICghcGFzc3dvcmQpIHtcclxuICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ1BsZWFzZSBlbnRlciB5b3VyIHBhc3N3b3JkJztcclxuICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRGlzYWJsZSBidXR0b24gaW1tZWRpYXRlbHkgdG8gcHJldmVudCBkb3VibGUtY2xpY2tpbmdcclxuICAgICAgYXBwcm92ZUJ0bi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgIGFwcHJvdmVCdG4uc3R5bGUub3BhY2l0eSA9ICcwLjUnO1xyXG4gICAgICBhcHByb3ZlQnRuLnN0eWxlLmN1cnNvciA9ICdub3QtYWxsb3dlZCc7XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhIHRlbXBvcmFyeSBzZXNzaW9uIGZvciB0aGlzIHRyYW5zYWN0aW9uIHVzaW5nIHRoZSBlbnRlcmVkIHBhc3N3b3JkXHJcbiAgICAgICAgLy8gVGhpcyB2YWxpZGF0ZXMgdGhlIHBhc3N3b3JkIHdpdGhvdXQgcGFzc2luZyBpdCBmb3IgdGhlIGFjdHVhbCB0cmFuc2FjdGlvblxyXG4gICAgICAgIGNvbnN0IGFjdGl2ZVdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBTZXNzaW9uUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnQ1JFQVRFX1NFU1NJT04nLFxyXG4gICAgICAgICAgcGFzc3dvcmQsXHJcbiAgICAgICAgICB3YWxsZXRJZDogYWN0aXZlV2FsbGV0LmlkLFxyXG4gICAgICAgICAgZHVyYXRpb25NczogNjAwMDAgLy8gMSBtaW51dGUgdGVtcG9yYXJ5IHNlc3Npb25cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKCF0ZW1wU2Vzc2lvblJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwYXNzd29yZCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gR2V0IHNlbGVjdGVkIGdhcyBwcmljZVxyXG4gICAgICAgIGNvbnN0IGdhc1ByaWNlID0gZ2V0U2VsZWN0ZWRHYXNQcmljZSgpO1xyXG5cclxuICAgICAgICAvLyBHZXQgY3VzdG9tIG5vbmNlIGlmIHByb3ZpZGVkXHJcbiAgICAgICAgY29uc3QgY3VzdG9tTm9uY2VDaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXN0b20tbm9uY2UtY2hlY2tib3gnKTtcclxuICAgICAgICBjb25zdCBjdXN0b21Ob25jZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWN1c3RvbS1ub25jZScpO1xyXG4gICAgICAgIGxldCBjdXN0b21Ob25jZSA9IG51bGw7XHJcbiAgICAgICAgaWYgKGN1c3RvbU5vbmNlQ2hlY2tib3guY2hlY2tlZCAmJiBjdXN0b21Ob25jZUlucHV0LnZhbHVlKSB7XHJcbiAgICAgICAgICBjdXN0b21Ob25jZSA9IHBhcnNlSW50KGN1c3RvbU5vbmNlSW5wdXQudmFsdWUpO1xyXG4gICAgICAgICAgaWYgKGlzTmFOKGN1c3RvbU5vbmNlKSB8fCBjdXN0b21Ob25jZSA8IDApIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGN1c3RvbSBub25jZScpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnVFJBTlNBQ1RJT05fQVBQUk9WQUwnLFxyXG4gICAgICAgICAgcmVxdWVzdElkLFxyXG4gICAgICAgICAgYXBwcm92ZWQ6IHRydWUsXHJcbiAgICAgICAgICBzZXNzaW9uVG9rZW46IHRlbXBTZXNzaW9uUmVzcG9uc2Uuc2Vzc2lvblRva2VuLFxyXG4gICAgICAgICAgZ2FzUHJpY2UsXHJcbiAgICAgICAgICBjdXN0b21Ob25jZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgLy8gSGlkZSBhcHByb3ZhbCBmb3JtIGFuZCBzaG93IHN0YXR1cyBzZWN0aW9uXHJcbiAgICAgICAgICBzaG93VHJhbnNhY3Rpb25TdGF0dXMocmVzcG9uc2UudHhIYXNoLCBhY3RpdmVXYWxsZXQuYWRkcmVzcywgcmVxdWVzdElkKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IHJlc3BvbnNlLmVycm9yIHx8ICdUcmFuc2FjdGlvbiBmYWlsZWQnO1xyXG4gICAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAgIC8vIFJlLWVuYWJsZSBidXR0b24gb24gZXJyb3Igc28gdXNlciBjYW4gdHJ5IGFnYWluXHJcbiAgICAgICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIGVycm9yIHNvIHVzZXIgY2FuIHRyeSBhZ2FpblxyXG4gICAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNldHVwIHJlamVjdCBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVqZWN0LXRyYW5zYWN0aW9uJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgdHlwZTogJ1RSQU5TQUNUSU9OX0FQUFJPVkFMJyxcclxuICAgICAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgICAgIGFwcHJvdmVkOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBDbG9zZSB0aGUgcG9wdXAgd2luZG93XHJcbiAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgYWxlcnQoJ0Vycm9yIHJlamVjdGluZyB0cmFuc2FjdGlvbjogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGFsZXJ0KCdFcnJvciBsb2FkaW5nIHRyYW5zYWN0aW9uOiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgICB3aW5kb3cuY2xvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFRPS0VOIEFERCBBUFBST1ZBTCA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUb2tlbkFkZEFwcHJvdmFsU2NyZWVuKHJlcXVlc3RJZCkge1xyXG4gIC8vIExvYWQgc2V0dGluZ3MgZm9yIHRoZW1lXHJcbiAgYXdhaXQgbG9hZFNldHRpbmdzKCk7XHJcbiAgYXBwbHlUaGVtZSgpO1xyXG5cclxuICAvLyBHZXQgdG9rZW4gYWRkIHJlcXVlc3QgZGV0YWlscyBmcm9tIGJhY2tncm91bmRcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdHRVRfVE9LRU5fQUREX1JFUVVFU1QnLFxyXG4gICAgICByZXF1ZXN0SWRcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghcmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICBhbGVydCgnVG9rZW4gYWRkIHJlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnKTtcclxuICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB7IG9yaWdpbiwgdG9rZW5JbmZvIH0gPSByZXNwb25zZTtcclxuXHJcbiAgICAvLyBQb3B1bGF0ZSB0b2tlbiBkZXRhaWxzXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tc2l0ZS1vcmlnaW4nKS50ZXh0Q29udGVudCA9IG9yaWdpbjtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1zeW1ib2wnKS50ZXh0Q29udGVudCA9IHRva2VuSW5mby5zeW1ib2w7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tYWRkcmVzcycpLnRleHRDb250ZW50ID0gdG9rZW5JbmZvLmFkZHJlc3M7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGVjaW1hbHMnKS50ZXh0Q29udGVudCA9IHRva2VuSW5mby5kZWNpbWFscztcclxuXHJcbiAgICAvLyBTaG93IHRva2VuIGltYWdlIGlmIHByb3ZpZGVkXHJcbiAgICBpZiAodG9rZW5JbmZvLmltYWdlKSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1pbWFnZScpLnNyYyA9IHRva2VuSW5mby5pbWFnZTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWltYWdlLXNlY3Rpb24nKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1pbWFnZS1zZWN0aW9uJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2hvdyB0aGUgdG9rZW4gYXBwcm92YWwgc2NyZWVuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tYWRkLXRva2VuJyk7XHJcblxyXG4gICAgLy8gU2V0dXAgYXBwcm92ZSBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS10b2tlbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBhcHByb3ZlQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1hcHByb3ZlLXRva2VuJyk7XHJcbiAgICAgIGNvbnN0IGVycm9yRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZXJyb3InKTtcclxuXHJcbiAgICAgIC8vIERpc2FibGUgYnV0dG9uIGltbWVkaWF0ZWx5IHRvIHByZXZlbnQgZG91YmxlLWNsaWNraW5nXHJcbiAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMC41JztcclxuICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAnbm90LWFsbG93ZWQnO1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBTZW5kIGFwcHJvdmFsIHRvIGJhY2tncm91bmRcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICAgIHR5cGU6ICdUT0tFTl9BRERfQVBQUk9WQUwnLFxyXG4gICAgICAgICAgcmVxdWVzdElkLFxyXG4gICAgICAgICAgYXBwcm92ZWQ6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIC8vIEFkZCB0aGUgdG9rZW4gdG8gc3RvcmFnZSB1c2luZyBleGlzdGluZyB0b2tlbiBtYW5hZ2VtZW50XHJcbiAgICAgICAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgbG9hZCgnY3VycmVudE5ldHdvcmsnKSB8fCAncHVsc2VjaGFpblRlc3RuZXQnO1xyXG4gICAgICAgICAgYXdhaXQgdG9rZW5zLmFkZEN1c3RvbVRva2VuKG5ldHdvcmssIHRva2VuSW5mby5hZGRyZXNzLCB0b2tlbkluZm8uc3ltYm9sLCB0b2tlbkluZm8uZGVjaW1hbHMpO1xyXG5cclxuICAgICAgICAgIC8vIENsb3NlIHRoZSBwb3B1cCB3aW5kb3dcclxuICAgICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gcmVzcG9uc2UuZXJyb3IgfHwgJ0ZhaWxlZCB0byBhZGQgdG9rZW4nO1xyXG4gICAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAgIC8vIFJlLWVuYWJsZSBidXR0b24gb24gZXJyb3Igc28gdXNlciBjYW4gdHJ5IGFnYWluXHJcbiAgICAgICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIGVycm9yIHNvIHVzZXIgY2FuIHRyeSBhZ2FpblxyXG4gICAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNldHVwIHJlamVjdCBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVqZWN0LXRva2VuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgdHlwZTogJ1RPS0VOX0FERF9BUFBST1ZBTCcsXHJcbiAgICAgICAgICByZXF1ZXN0SWQsXHJcbiAgICAgICAgICBhcHByb3ZlZDogZmFsc2VcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQ2xvc2UgdGhlIHBvcHVwIHdpbmRvd1xyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGFsZXJ0KCdFcnJvciByZWplY3RpbmcgdG9rZW46ICcgKyBlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBhbGVydCgnRXJyb3IgbG9hZGluZyB0b2tlbiBhZGQgcmVxdWVzdDogJyArIHNhbml0aXplRXJyb3IoZXJyb3IubWVzc2FnZSkpO1xyXG4gICAgd2luZG93LmNsb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBNRVNTQUdFIFNJR05JTkcgQVBQUk9WQUwgSEFORExFUlMgPT09PT1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2VTaWduQXBwcm92YWxTY3JlZW4ocmVxdWVzdElkKSB7XHJcbiAgLy8gTG9hZCBzZXR0aW5ncyBmb3IgdGhlbWVcclxuICBhd2FpdCBsb2FkU2V0dGluZ3MoKTtcclxuICBhcHBseVRoZW1lKCk7XHJcblxyXG4gIC8vIEdldCBzaWduIHJlcXVlc3QgZGV0YWlscyBmcm9tIGJhY2tncm91bmRcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdHRVRfU0lHTl9SRVFVRVNUJyxcclxuICAgICAgcmVxdWVzdElkXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5vcmlnaW4pIHtcclxuICAgICAgYWxlcnQoJ1NpZ24gcmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcpO1xyXG4gICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgb3JpZ2luLCBtZXRob2QsIHNpZ25SZXF1ZXN0IH0gPSByZXNwb25zZTtcclxuICAgIGNvbnN0IHsgbWVzc2FnZSwgYWRkcmVzcyB9ID0gc2lnblJlcXVlc3Q7XHJcblxyXG4gICAgLy8gUG9wdWxhdGUgc2lnbiBkZXRhaWxzXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi1zaXRlLW9yaWdpbicpLnRleHRDb250ZW50ID0gb3JpZ2luO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tYWRkcmVzcycpLnRleHRDb250ZW50ID0gYWRkcmVzcztcclxuXHJcbiAgICAvLyBGb3JtYXQgbWVzc2FnZSBmb3IgZGlzcGxheVxyXG4gICAgY29uc3QgbWVzc2FnZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tbWVzc2FnZS1jb250ZW50Jyk7XHJcbiAgICBsZXQgZGlzcGxheU1lc3NhZ2UgPSBtZXNzYWdlO1xyXG5cclxuICAgIC8vIENoZWNrIGlmIG1lc3NhZ2UgaXMgaGV4LWVuY29kZWRcclxuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgbWVzc2FnZS5zdGFydHNXaXRoKCcweCcpKSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLW1lc3NhZ2UtaGV4LXdhcm5pbmcnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgLy8gVHJ5IHRvIGRlY29kZSBpZiBpdCdzIHJlYWRhYmxlIHRleHRcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBieXRlcyA9IGV0aGVycy5nZXRCeXRlcyhtZXNzYWdlKTtcclxuICAgICAgICBjb25zdCBkZWNvZGVkID0gZXRoZXJzLnRvVXRmOFN0cmluZyhieXRlcyk7XHJcbiAgICAgICAgaWYgKC9eW1xceDIwLVxceDdFXFxzXSskLy50ZXN0KGRlY29kZWQpKSB7XHJcbiAgICAgICAgICBkaXNwbGF5TWVzc2FnZSA9IGRlY29kZWQgKyAnXFxuXFxuW0hleDogJyArIG1lc3NhZ2UgKyAnXSc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICAvLyBLZWVwIGFzIGhleCBpZiBkZWNvZGluZyBmYWlsc1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi1tZXNzYWdlLWhleC13YXJuaW5nJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgbWVzc2FnZUVsLnRleHRDb250ZW50ID0gZGlzcGxheU1lc3NhZ2U7XHJcblxyXG4gICAgLy8gU2hvdyB0aGUgc2lnbmluZyBhcHByb3ZhbCBzY3JlZW5cclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1zaWduLW1lc3NhZ2UnKTtcclxuXHJcbiAgICAvLyBTZXR1cCBhcHByb3ZlIGJ1dHRvblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1hcHByb3ZlLXNpZ24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgICAgY29uc3QgYXBwcm92ZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS1zaWduJyk7XHJcbiAgICAgIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tcGFzc3dvcmQnKS52YWx1ZTtcclxuICAgICAgY29uc3QgZXJyb3JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLWVycm9yJyk7XHJcblxyXG4gICAgICBpZiAoIXBhc3N3b3JkKSB7XHJcbiAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdQbGVhc2UgZW50ZXIgeW91ciBwYXNzd29yZCc7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIERpc2FibGUgYnV0dG9uIGltbWVkaWF0ZWx5IHRvIHByZXZlbnQgZG91YmxlLWNsaWNraW5nXHJcbiAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMC41JztcclxuICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAnbm90LWFsbG93ZWQnO1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgYSB0ZW1wb3Jhcnkgc2Vzc2lvbiBmb3IgdGhpcyBzaWduaW5nIHVzaW5nIHRoZSBlbnRlcmVkIHBhc3N3b3JkXHJcbiAgICAgICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICAgICAgY29uc3QgdGVtcFNlc3Npb25SZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICAgIHR5cGU6ICdDUkVBVEVfU0VTU0lPTicsXHJcbiAgICAgICAgICBwYXNzd29yZCxcclxuICAgICAgICAgIHdhbGxldElkOiBhY3RpdmVXYWxsZXQuaWQsXHJcbiAgICAgICAgICBkdXJhdGlvbk1zOiA2MDAwMCAvLyAxIG1pbnV0ZSB0ZW1wb3Jhcnkgc2Vzc2lvblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoIXRlbXBTZXNzaW9uUmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHBhc3N3b3JkJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICAgIHR5cGU6ICdTSUdOX0FQUFJPVkFMJyxcclxuICAgICAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgICAgIGFwcHJvdmVkOiB0cnVlLFxyXG4gICAgICAgICAgc2Vzc2lvblRva2VuOiB0ZW1wU2Vzc2lvblJlc3BvbnNlLnNlc3Npb25Ub2tlblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgLy8gQ2xvc2UgdGhlIHBvcHVwIHdpbmRvd1xyXG4gICAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSByZXNwb25zZS5lcnJvciB8fCAnU2lnbmluZyBmYWlsZWQnO1xyXG4gICAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAgIC8vIFJlLWVuYWJsZSBidXR0b24gb24gZXJyb3Igc28gdXNlciBjYW4gdHJ5IGFnYWluXHJcbiAgICAgICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIGVycm9yIHNvIHVzZXIgY2FuIHRyeSBhZ2FpblxyXG4gICAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNldHVwIHJlamVjdCBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVqZWN0LXNpZ24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnU0lHTl9BUFBST1ZBTCcsXHJcbiAgICAgICAgICByZXF1ZXN0SWQsXHJcbiAgICAgICAgICBhcHByb3ZlZDogZmFsc2VcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQ2xvc2UgdGhlIHBvcHVwIHdpbmRvd1xyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGFsZXJ0KCdFcnJvciByZWplY3Rpbmcgc2lnbiByZXF1ZXN0OiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0Vycm9yIGxvYWRpbmcgc2lnbiByZXF1ZXN0OiAnICsgc2FuaXRpemVFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICB3aW5kb3cuY2xvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVR5cGVkRGF0YVNpZ25BcHByb3ZhbFNjcmVlbihyZXF1ZXN0SWQpIHtcclxuICAvLyBMb2FkIHNldHRpbmdzIGZvciB0aGVtZVxyXG4gIGF3YWl0IGxvYWRTZXR0aW5ncygpO1xyXG4gIGFwcGx5VGhlbWUoKTtcclxuXHJcbiAgLy8gR2V0IHNpZ24gcmVxdWVzdCBkZXRhaWxzIGZyb20gYmFja2dyb3VuZFxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0dFVF9TSUdOX1JFUVVFU1QnLFxyXG4gICAgICByZXF1ZXN0SWRcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLm9yaWdpbikge1xyXG4gICAgICBhbGVydCgnU2lnbiByZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyk7XHJcbiAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyBvcmlnaW4sIG1ldGhvZCwgc2lnblJlcXVlc3QgfSA9IHJlc3BvbnNlO1xyXG4gICAgY29uc3QgeyB0eXBlZERhdGEsIGFkZHJlc3MgfSA9IHNpZ25SZXF1ZXN0O1xyXG5cclxuICAgIC8vIFBvcHVsYXRlIHNpZ24gZGV0YWlsc1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tdHlwZWQtc2l0ZS1vcmlnaW4nKS50ZXh0Q29udGVudCA9IG9yaWdpbjtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLXR5cGVkLWFkZHJlc3MnKS50ZXh0Q29udGVudCA9IGFkZHJlc3M7XHJcblxyXG4gICAgLy8gUG9wdWxhdGUgZG9tYWluIGluZm9ybWF0aW9uXHJcbiAgICBpZiAodHlwZWREYXRhLmRvbWFpbikge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi10eXBlZC1kb21haW4tbmFtZScpLnRleHRDb250ZW50ID0gdHlwZWREYXRhLmRvbWFpbi5uYW1lIHx8ICdVbmtub3duJztcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tdHlwZWQtZG9tYWluLWNoYWluJykudGV4dENvbnRlbnQgPSB0eXBlZERhdGEuZG9tYWluLmNoYWluSWQgfHwgJy0tJztcclxuXHJcbiAgICAgIGlmICh0eXBlZERhdGEuZG9tYWluLnZlcmlmeWluZ0NvbnRyYWN0KSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tdHlwZWQtZG9tYWluLWNvbnRyYWN0JykudGV4dENvbnRlbnQgPSB0eXBlZERhdGEuZG9tYWluLnZlcmlmeWluZ0NvbnRyYWN0O1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLXR5cGVkLWRvbWFpbi1jb250cmFjdC1yb3cnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi10eXBlZC1kb21haW4tY29udHJhY3Qtcm93JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBGb3JtYXQgdHlwZWQgZGF0YSBmb3IgZGlzcGxheVxyXG4gICAgY29uc3QgbWVzc2FnZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tdHlwZWQtbWVzc2FnZS1jb250ZW50Jyk7XHJcbiAgICBjb25zdCBkaXNwbGF5RGF0YSA9IHtcclxuICAgICAgcHJpbWFyeVR5cGU6IHR5cGVkRGF0YS5wcmltYXJ5VHlwZSB8fCAnVW5rbm93bicsXHJcbiAgICAgIG1lc3NhZ2U6IHR5cGVkRGF0YS5tZXNzYWdlXHJcbiAgICB9O1xyXG4gICAgbWVzc2FnZUVsLnRleHRDb250ZW50ID0gSlNPTi5zdHJpbmdpZnkoZGlzcGxheURhdGEsIG51bGwsIDIpO1xyXG5cclxuICAgIC8vIFNob3cgdGhlIHNpZ25pbmcgYXBwcm92YWwgc2NyZWVuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tc2lnbi10eXBlZC1kYXRhJyk7XHJcblxyXG4gICAgLy8gU2V0dXAgYXBwcm92ZSBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS1zaWduLXR5cGVkJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFwcHJvdmVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWFwcHJvdmUtc2lnbi10eXBlZCcpO1xyXG4gICAgICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLXR5cGVkLXBhc3N3b3JkJykudmFsdWU7XHJcbiAgICAgIGNvbnN0IGVycm9yRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi10eXBlZC1lcnJvcicpO1xyXG5cclxuICAgICAgaWYgKCFwYXNzd29yZCkge1xyXG4gICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSAnUGxlYXNlIGVudGVyIHlvdXIgcGFzc3dvcmQnO1xyXG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBEaXNhYmxlIGJ1dHRvbiBpbW1lZGlhdGVseSB0byBwcmV2ZW50IGRvdWJsZS1jbGlja2luZ1xyXG4gICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzAuNSc7XHJcbiAgICAgIGFwcHJvdmVCdG4uc3R5bGUuY3Vyc29yID0gJ25vdC1hbGxvd2VkJztcclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IHNlc3Npb24gZm9yIHRoaXMgc2lnbmluZyB1c2luZyB0aGUgZW50ZXJlZCBwYXNzd29yZFxyXG4gICAgICAgIGNvbnN0IGFjdGl2ZVdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBTZXNzaW9uUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnQ1JFQVRFX1NFU1NJT04nLFxyXG4gICAgICAgICAgcGFzc3dvcmQsXHJcbiAgICAgICAgICB3YWxsZXRJZDogYWN0aXZlV2FsbGV0LmlkLFxyXG4gICAgICAgICAgZHVyYXRpb25NczogNjAwMDAgLy8gMSBtaW51dGUgdGVtcG9yYXJ5IHNlc3Npb25cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKCF0ZW1wU2Vzc2lvblJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwYXNzd29yZCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnU0lHTl9BUFBST1ZBTCcsXHJcbiAgICAgICAgICByZXF1ZXN0SWQsXHJcbiAgICAgICAgICBhcHByb3ZlZDogdHJ1ZSxcclxuICAgICAgICAgIHNlc3Npb25Ub2tlbjogdGVtcFNlc3Npb25SZXNwb25zZS5zZXNzaW9uVG9rZW5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIC8vIENsb3NlIHRoZSBwb3B1cCB3aW5kb3dcclxuICAgICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gcmVzcG9uc2UuZXJyb3IgfHwgJ1NpZ25pbmcgZmFpbGVkJztcclxuICAgICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIGVycm9yIHNvIHVzZXIgY2FuIHRyeSBhZ2FpblxyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgLy8gUmUtZW5hYmxlIGJ1dHRvbiBvbiBlcnJvciBzbyB1c2VyIGNhbiB0cnkgYWdhaW5cclxuICAgICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICAgIGFwcHJvdmVCdG4uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTZXR1cCByZWplY3QgYnV0dG9uXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlamVjdC1zaWduLXR5cGVkJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgdHlwZTogJ1NJR05fQVBQUk9WQUwnLFxyXG4gICAgICAgICAgcmVxdWVzdElkLFxyXG4gICAgICAgICAgYXBwcm92ZWQ6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIENsb3NlIHRoZSBwb3B1cCB3aW5kb3dcclxuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBhbGVydCgnRXJyb3IgcmVqZWN0aW5nIHNpZ24gcmVxdWVzdDogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGFsZXJ0KCdFcnJvciBsb2FkaW5nIHR5cGVkIGRhdGEgc2lnbiByZXF1ZXN0OiAnICsgc2FuaXRpemVFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICB3aW5kb3cuY2xvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFRSQU5TQUNUSU9OIEhJU1RPUlkgPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlUGVuZGluZ1R4SW5kaWNhdG9yKCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX1BFTkRJTkdfVFhfQ09VTlQnLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzc1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgaW5kaWNhdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlbmRpbmctdHgtaW5kaWNhdG9yJyk7XHJcbiAgICBjb25zdCB0ZXh0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGVuZGluZy10eC10ZXh0Jyk7XHJcblxyXG4gICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MgJiYgcmVzcG9uc2UuY291bnQgPiAwKSB7XHJcbiAgICAgIHRleHRFbC50ZXh0Q29udGVudCA9IGDimqDvuI8gJHtyZXNwb25zZS5jb3VudH0gUGVuZGluZyBUcmFuc2FjdGlvbiR7cmVzcG9uc2UuY291bnQgPiAxID8gJ3MnIDogJyd9YDtcclxuICAgICAgaW5kaWNhdG9yLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaW5kaWNhdG9yLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjaGVja2luZyBwZW5kaW5nIHRyYW5zYWN0aW9uczonLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzaG93VHJhbnNhY3Rpb25IaXN0b3J5KCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MpIHJldHVybjtcclxuXHJcbiAgc2hvd1NjcmVlbignc2NyZWVuLXR4LWhpc3RvcnknKTtcclxuICBhd2FpdCByZW5kZXJUcmFuc2FjdGlvbkhpc3RvcnkoJ2FsbCcpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZW5kZXJUcmFuc2FjdGlvbkhpc3RvcnkoZmlsdGVyID0gJ2FsbCcpIHtcclxuICBjb25zdCBsaXN0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtaGlzdG9yeS1saXN0Jyk7XHJcbiAgaWYgKCFjdXJyZW50U3RhdGUuYWRkcmVzcykge1xyXG4gICAgbGlzdEVsLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtZGltXCI+Tm8gYWRkcmVzcyBzZWxlY3RlZDwvcD4nO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgbGlzdEVsLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtZGltXCI+TG9hZGluZy4uLjwvcD4nO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdHRVRfVFhfSElTVE9SWScsXHJcbiAgICAgIGFkZHJlc3M6IGN1cnJlbnRTdGF0ZS5hZGRyZXNzXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlLnN1Y2Nlc3MgfHwgIXJlc3BvbnNlLnRyYW5zYWN0aW9ucyB8fCByZXNwb25zZS50cmFuc2FjdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGxpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPk5vIHRyYW5zYWN0aW9uczwvcD4nO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHRyYW5zYWN0aW9ucyA9IHJlc3BvbnNlLnRyYW5zYWN0aW9ucztcclxuXHJcbiAgICAvLyBBcHBseSBmaWx0ZXJcclxuICAgIGlmIChmaWx0ZXIgPT09ICdwZW5kaW5nJykge1xyXG4gICAgICB0cmFuc2FjdGlvbnMgPSB0cmFuc2FjdGlvbnMuZmlsdGVyKHR4ID0+IHR4LnN0YXR1cyA9PT0gJ3BlbmRpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoZmlsdGVyID09PSAnY29uZmlybWVkJykge1xyXG4gICAgICB0cmFuc2FjdGlvbnMgPSB0cmFuc2FjdGlvbnMuZmlsdGVyKHR4ID0+IHR4LnN0YXR1cyA9PT0gJ2NvbmZpcm1lZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0cmFuc2FjdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGxpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPk5vIHRyYW5zYWN0aW9ucyBpbiB0aGlzIGZpbHRlcjwvcD4nO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGh0bWwgPSAnJztcclxuICAgIGZvciAoY29uc3QgdHggb2YgdHJhbnNhY3Rpb25zKSB7XHJcbiAgICAgIGNvbnN0IHN0YXR1c0ljb24gPSB0eC5zdGF0dXMgPT09ICdwZW5kaW5nJyA/ICfij7MnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHguc3RhdHVzID09PSAnY29uZmlybWVkJyA/ICfinIUnIDogJ+KdjCc7XHJcbiAgICAgIGNvbnN0IHN0YXR1c0NvbG9yID0gdHguc3RhdHVzID09PSAncGVuZGluZycgPyAndmFyKC0tdGVybWluYWwtd2FybmluZyknIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHR4LnN0YXR1cyA9PT0gJ2NvbmZpcm1lZCcgPyAnIzQ0ZmY0NCcgOiAnI2ZmNDQ0NCc7XHJcblxyXG4gICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUodHgudGltZXN0YW1wKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICBjb25zdCB2YWx1ZUV0aCA9IGV0aGVycy5mb3JtYXRFdGhlcih0eC52YWx1ZSB8fCAnMCcpO1xyXG4gICAgICBjb25zdCBnYXNHd2VpID0gZXRoZXJzLmZvcm1hdFVuaXRzKHR4Lmdhc1ByaWNlIHx8ICcwJywgJ2d3ZWknKTtcclxuXHJcbiAgICAgIGh0bWwgKz0gYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJwYW5lbCBtYi0yXCIgc3R5bGU9XCJwYWRkaW5nOiAxMnB4OyBjdXJzb3I6IHBvaW50ZXI7IGJvcmRlci1jb2xvcjogJHtzdGF0dXNDb2xvcn07XCIgZGF0YS10eC1oYXNoPVwiJHt0eC5oYXNofVwiPlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgYWxpZ24taXRlbXM6IGNlbnRlcjsgbWFyZ2luLWJvdHRvbTogOHB4O1wiPlxyXG4gICAgICAgICAgICA8c3BhbiBzdHlsZT1cImNvbG9yOiAke3N0YXR1c0NvbG9yfTsgZm9udC1zaXplOiAxNHB4O1wiPiR7c3RhdHVzSWNvbn0gJHt0eC5zdGF0dXMudG9VcHBlckNhc2UoKX08L3NwYW4+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTBweDtcIj4ke2RhdGV9PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDEwcHg7IG1hcmdpbi1ib3R0b206IDRweDtcIj5IYXNoOiAke3R4Lmhhc2guc2xpY2UoMCwgMjApfS4uLjwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTBweDsgbWFyZ2luLWJvdHRvbTogNHB4O1wiPlZhbHVlOiAke3ZhbHVlRXRofSAke2dldE5ldHdvcmtTeW1ib2wodHgubmV0d29yayl9PC9wPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMHB4O1wiPkdhczogJHtnYXNHd2VpfSBHd2VpIOKAoiBOb25jZTogJHt0eC5ub25jZX08L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIGA7XHJcbiAgICB9XHJcblxyXG4gICAgbGlzdEVsLmlubmVySFRNTCA9IGh0bWw7XHJcblxyXG4gICAgLy8gQWRkIGNsaWNrIGhhbmRsZXJzXHJcbiAgICBsaXN0RWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdHgtaGFzaF0nKS5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdHhIYXNoID0gZWwuZGF0YXNldC50eEhhc2g7XHJcbiAgICAgICAgc2hvd1RyYW5zYWN0aW9uRGV0YWlscyh0eEhhc2gpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgbG9hZGluZyB0cmFuc2FjdGlvbiBoaXN0b3J5OicsIGVycm9yKTtcclxuICAgIGxpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPkVycm9yIGxvYWRpbmcgdHJhbnNhY3Rpb25zPC9wPic7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzaG93VHJhbnNhY3Rpb25EZXRhaWxzKHR4SGFzaCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX1RYX0JZX0hBU0gnLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzcyxcclxuICAgICAgdHhIYXNoOiB0eEhhc2hcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghcmVzcG9uc2Uuc3VjY2VzcyB8fCAhcmVzcG9uc2UudHJhbnNhY3Rpb24pIHtcclxuICAgICAgYWxlcnQoJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCcpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdHggPSByZXNwb25zZS50cmFuc2FjdGlvbjtcclxuXHJcbiAgICAvLyBTaG93IHNjcmVlblxyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXR4LWRldGFpbHMnKTtcclxuXHJcbiAgICAvLyBQb3B1bGF0ZSBkZXRhaWxzXHJcbiAgICBjb25zdCBzdGF0dXNCYWRnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1zdGF0dXMtYmFkZ2UnKTtcclxuICAgIGNvbnN0IHN0YXR1c1RleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc3RhdHVzLXRleHQnKTtcclxuXHJcbiAgICBpZiAodHguc3RhdHVzID09PSAncGVuZGluZycpIHtcclxuICAgICAgc3RhdHVzVGV4dC50ZXh0Q29udGVudCA9ICfij7MgUEVORElORyc7XHJcbiAgICAgIHN0YXR1c0JhZGdlLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXdhcm5pbmcpJztcclxuICAgICAgc3RhdHVzVGV4dC5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC13YXJuaW5nKSc7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1wZW5kaW5nLWFjdGlvbnMnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1ibG9jay1zZWN0aW9uJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9IGVsc2UgaWYgKHR4LnN0YXR1cyA9PT0gJ2NvbmZpcm1lZCcpIHtcclxuICAgICAgc3RhdHVzVGV4dC50ZXh0Q29udGVudCA9ICfinIUgQ09ORklSTUVEJztcclxuICAgICAgc3RhdHVzQmFkZ2Uuc3R5bGUuYm9yZGVyQ29sb3IgPSAnIzQ0ZmY0NCc7XHJcbiAgICAgIHN0YXR1c1RleHQuc3R5bGUuY29sb3IgPSAnIzQ0ZmY0NCc7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1wZW5kaW5nLWFjdGlvbnMnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1ibG9jay1zZWN0aW9uJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kZXRhaWwtYmxvY2snKS50ZXh0Q29udGVudCA9IHR4LmJsb2NrTnVtYmVyIHx8ICctLSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdGF0dXNUZXh0LnRleHRDb250ZW50ID0gJ+KdjCBGQUlMRUQnO1xyXG4gICAgICBzdGF0dXNCYWRnZS5zdHlsZS5ib3JkZXJDb2xvciA9ICcjZmY0NDQ0JztcclxuICAgICAgc3RhdHVzVGV4dC5zdHlsZS5jb2xvciA9ICcjZmY0NDQ0JztcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXBlbmRpbmctYWN0aW9ucycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLWJsb2NrLXNlY3Rpb24nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIH1cclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLWhhc2gnKS50ZXh0Q29udGVudCA9IHR4Lmhhc2g7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLWZyb20nKS50ZXh0Q29udGVudCA9IHR4LmZyb207XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLXRvJykudGV4dENvbnRlbnQgPSB0eC50byB8fCAnQ29udHJhY3QgQ3JlYXRpb24nO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC12YWx1ZScpLnRleHRDb250ZW50ID0gZXRoZXJzLmZvcm1hdEV0aGVyKHR4LnZhbHVlIHx8ICcwJykgKyAnICcgKyBnZXROZXR3b3JrU3ltYm9sKHR4Lm5ldHdvcmspO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1ub25jZScpLnRleHRDb250ZW50ID0gdHgubm9uY2U7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLWdhcy1wcmljZScpLnRleHRDb250ZW50ID0gZXRoZXJzLmZvcm1hdFVuaXRzKHR4Lmdhc1ByaWNlIHx8ICcwJywgJ2d3ZWknKSArICcgR3dlaSc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLW5ldHdvcmsnKS50ZXh0Q29udGVudCA9IGdldE5ldHdvcmtOYW1lKHR4Lm5ldHdvcmspO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC10aW1lc3RhbXAnKS50ZXh0Q29udGVudCA9IG5ldyBEYXRlKHR4LnRpbWVzdGFtcCkudG9Mb2NhbGVTdHJpbmcoKTtcclxuXHJcbiAgICAvLyBTdG9yZSBjdXJyZW50IHR4IGhhc2ggZm9yIHNwZWVkIHVwL2NhbmNlbFxyXG4gICAgY3VycmVudFN0YXRlLmN1cnJlbnRUeEhhc2ggPSB0eC5oYXNoO1xyXG5cclxuICAgIC8vIFNldCB1cCBleHBsb3JlciBsaW5rXHJcbiAgICBjb25zdCBleHBsb3JlckJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdmlldy1leHBsb3JlcicpO1xyXG4gICAgZXhwbG9yZXJCdG4ub25jbGljayA9ICgpID0+IHtcclxuICAgICAgY29uc3QgdXJsID0gZ2V0RXhwbG9yZXJVcmwodHgubmV0d29yaywgJ3R4JywgdHguaGFzaCk7XHJcbiAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybCB9KTtcclxuICAgIH07XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBsb2FkaW5nIHRyYW5zYWN0aW9uIGRldGFpbHM6JywgZXJyb3IpO1xyXG4gICAgYWxlcnQoJ0Vycm9yIGxvYWRpbmcgdHJhbnNhY3Rpb24gZGV0YWlscycpO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3BlZWRVcFRyYW5zYWN0aW9uKCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MgfHwgIWN1cnJlbnRTdGF0ZS5jdXJyZW50VHhIYXNoKSByZXR1cm47XHJcblxyXG4gIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgc2hvd1Bhc3N3b3JkUHJvbXB0KCdTcGVlZCBVcCBUcmFuc2FjdGlvbicsICdFbnRlciB5b3VyIHBhc3N3b3JkIHRvIHNwZWVkIHVwIHRoaXMgdHJhbnNhY3Rpb24gd2l0aCBoaWdoZXIgZ2FzIHByaWNlICgxLjJ4KScpO1xyXG4gIGlmICghcGFzc3dvcmQpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIENyZWF0ZSB0ZW1wb3Jhcnkgc2Vzc2lvblxyXG4gICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBjb25zdCBzZXNzaW9uUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdDUkVBVEVfU0VTU0lPTicsXHJcbiAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcclxuICAgICAgd2FsbGV0SWQ6IGFjdGl2ZVdhbGxldC5pZCxcclxuICAgICAgZHVyYXRpb25NczogNjAwMDAgLy8gMSBtaW51dGUgdGVtcCBzZXNzaW9uXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXNlc3Npb25SZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgIGFsZXJ0KCdJbnZhbGlkIHBhc3N3b3JkJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTcGVlZCB1cCB0cmFuc2FjdGlvblxyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdTUEVFRF9VUF9UWCcsXHJcbiAgICAgIGFkZHJlc3M6IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLFxyXG4gICAgICB0eEhhc2g6IGN1cnJlbnRTdGF0ZS5jdXJyZW50VHhIYXNoLFxyXG4gICAgICBzZXNzaW9uVG9rZW46IHNlc3Npb25SZXNwb25zZS5zZXNzaW9uVG9rZW4sXHJcbiAgICAgIGdhc1ByaWNlTXVsdGlwbGllcjogMS4yXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICBhbGVydChgVHJhbnNhY3Rpb24gc3BlZCB1cCFcXG5OZXcgVFg6ICR7cmVzcG9uc2UudHhIYXNoLnNsaWNlKDAsIDIwKX0uLi5gKTtcclxuICAgICAgLy8gUmVmcmVzaCB0aGUgdHJhbnNhY3Rpb24gZGV0YWlsc1xyXG4gICAgICBzaG93VHJhbnNhY3Rpb25EZXRhaWxzKHJlc3BvbnNlLnR4SGFzaCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhbGVydCgnRXJyb3Igc3BlZWRpbmcgdXAgdHJhbnNhY3Rpb246ICcgKyByZXNwb25zZS5lcnJvcik7XHJcbiAgICB9XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzcGVlZGluZyB1cCB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICBhbGVydCgnRXJyb3Igc3BlZWRpbmcgdXAgdHJhbnNhY3Rpb24nKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNhbmNlbFRyYW5zYWN0aW9uKCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MgfHwgIWN1cnJlbnRTdGF0ZS5jdXJyZW50VHhIYXNoKSByZXR1cm47XHJcblxyXG4gIGlmICghY29uZmlybSgnQ2FuY2VsIHRoaXMgdHJhbnNhY3Rpb24/IEEgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIHdpbGwgYmUgc2VudC4nKSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ0NhbmNlbCBUcmFuc2FjdGlvbicsICdFbnRlciB5b3VyIHBhc3N3b3JkIHRvIGNhbmNlbCB0aGlzIHRyYW5zYWN0aW9uIGJ5IHNlbmRpbmcgYSAwLXZhbHVlIHJlcGxhY2VtZW50Jyk7XHJcbiAgaWYgKCFwYXNzd29yZCkgcmV0dXJuO1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gQ3JlYXRlIHRlbXBvcmFyeSBzZXNzaW9uXHJcbiAgICBjb25zdCBhY3RpdmVXYWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgIGNvbnN0IHNlc3Npb25SZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0NSRUFURV9TRVNTSU9OJyxcclxuICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkLFxyXG4gICAgICB3YWxsZXRJZDogYWN0aXZlV2FsbGV0LmlkLFxyXG4gICAgICBkdXJhdGlvbk1zOiA2MDAwMCAvLyAxIG1pbnV0ZSB0ZW1wIHNlc3Npb25cclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghc2Vzc2lvblJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgYWxlcnQoJ0ludmFsaWQgcGFzc3dvcmQnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhbmNlbCB0cmFuc2FjdGlvblxyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdDQU5DRUxfVFgnLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzcyxcclxuICAgICAgdHhIYXNoOiBjdXJyZW50U3RhdGUuY3VycmVudFR4SGFzaCxcclxuICAgICAgc2Vzc2lvblRva2VuOiBzZXNzaW9uUmVzcG9uc2Uuc2Vzc2lvblRva2VuXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICBhbGVydChgVHJhbnNhY3Rpb24gY2FuY2VsbGVkIVxcbkNhbmNlbGxhdGlvbiBUWDogJHtyZXNwb25zZS50eEhhc2guc2xpY2UoMCwgMjApfS4uLmApO1xyXG4gICAgICAvLyBSZWZyZXNoIHRvIHNob3cgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uXHJcbiAgICAgIHNob3dUcmFuc2FjdGlvbkRldGFpbHMocmVzcG9uc2UudHhIYXNoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFsZXJ0KCdFcnJvciBjYW5jZWxsaW5nIHRyYW5zYWN0aW9uOiAnICsgcmVzcG9uc2UuZXJyb3IpO1xyXG4gICAgfVxyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgY2FuY2VsbGluZyB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICBhbGVydCgnRXJyb3IgY2FuY2VsbGluZyB0cmFuc2FjdGlvbicpO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2xlYXJUcmFuc2FjdGlvbkhpc3RvcnkoKSB7XHJcbiAgaWYgKCFjb25maXJtKCdDbGVhciBhbGwgdHJhbnNhY3Rpb24gaGlzdG9yeSBmb3IgdGhpcyBhZGRyZXNzPyBUaGlzIGNhbm5vdCBiZSB1bmRvbmUuJykpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdDTEVBUl9UWF9ISVNUT1JZJyxcclxuICAgICAgYWRkcmVzczogY3VycmVudFN0YXRlLmFkZHJlc3NcclxuICAgIH0pO1xyXG5cclxuICAgIGFsZXJ0KCdUcmFuc2FjdGlvbiBoaXN0b3J5IGNsZWFyZWQnKTtcclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKTtcclxuICAgIGF3YWl0IHVwZGF0ZURhc2hib2FyZCgpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjbGVhcmluZyB0cmFuc2FjdGlvbiBoaXN0b3J5OicsIGVycm9yKTtcclxuICAgIGFsZXJ0KCdFcnJvciBjbGVhcmluZyB0cmFuc2FjdGlvbiBoaXN0b3J5Jyk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogU2hvdyB0cmFuc2FjdGlvbiBzdGF0dXMgYWZ0ZXIgYXBwcm92YWxcclxuICogS2VlcHMgYXBwcm92YWwgd2luZG93IG9wZW4gdG8gc2hvdyB0eCBzdGF0dXNcclxuICovXHJcbmxldCB0eFN0YXR1c1BvbGxJbnRlcnZhbCA9IG51bGw7XHJcbmxldCB0eFN0YXR1c0N1cnJlbnRIYXNoID0gbnVsbDtcclxubGV0IHR4U3RhdHVzQ3VycmVudEFkZHJlc3MgPSBudWxsO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2hvd1RyYW5zYWN0aW9uU3RhdHVzKHR4SGFzaCwgYWRkcmVzcywgcmVxdWVzdElkKSB7XHJcbiAgLy8gU2hvd2luZyB0cmFuc2FjdGlvbiBzdGF0dXNcclxuXHJcbiAgLy8gU3RvcmUgY3VycmVudCB0cmFuc2FjdGlvbiBoYXNoIGFuZCBhZGRyZXNzXHJcbiAgdHhTdGF0dXNDdXJyZW50SGFzaCA9IHR4SGFzaDtcclxuICB0eFN0YXR1c0N1cnJlbnRBZGRyZXNzID0gYWRkcmVzcztcclxuXHJcbiAgLy8gSGlkZSBhcHByb3ZhbCBmb3JtXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWFwcHJvdmFsLWZvcm0nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gU2hvdyBzdGF0dXMgc2VjdGlvblxyXG4gIGNvbnN0IHN0YXR1c1NlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc3RhdHVzLXNlY3Rpb24nKTtcclxuICBzdGF0dXNTZWN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG5cclxuICAvLyBQb3B1bGF0ZSB0cmFuc2FjdGlvbiBoYXNoXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXN0YXR1cy1oYXNoJykudGV4dENvbnRlbnQgPSB0eEhhc2g7XHJcblxyXG4gIC8vIFBvbGwgZm9yIHRyYW5zYWN0aW9uIHN0YXR1cyB1cGRhdGVzXHJcbiAgY29uc3QgdXBkYXRlU3RhdHVzID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gUG9sbGluZyB0cmFuc2FjdGlvbiBzdGF0dXNcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogJ0dFVF9UWF9CWV9IQVNIJyxcclxuICAgICAgICBhZGRyZXNzOiB0eFN0YXR1c0N1cnJlbnRBZGRyZXNzLFxyXG4gICAgICAgIHR4SGFzaDogdHhIYXNoXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gU3RhdHVzIHBvbGwgcmVzcG9uc2VcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzICYmIHJlc3BvbnNlLnRyYW5zYWN0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgdHggPSByZXNwb25zZS50cmFuc2FjdGlvbjtcclxuICAgICAgICAvLyBUcmFuc2FjdGlvbiBzdGF0dXMgdXBkYXRlZFxyXG5cclxuICAgICAgICBjb25zdCBzdGF0dXNNZXNzYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXN0YXR1cy1tZXNzYWdlJyk7XHJcbiAgICAgICAgY29uc3Qgc3RhdHVzRGV0YWlscyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1zdGF0dXMtZGV0YWlscycpO1xyXG4gICAgICAgIGNvbnN0IHBlbmRpbmdBY3Rpb25zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXN0YXR1cy1wZW5kaW5nLWFjdGlvbnMnKTtcclxuXHJcbiAgICAgICAgaWYgKHR4LnN0YXR1cyA9PT0gJ2NvbmZpcm1lZCcpIHtcclxuICAgICAgICAgIC8vIFRyYW5zYWN0aW9uIGNvbmZpcm1lZFxyXG4gICAgICAgICAgc3RhdHVzTWVzc2FnZS50ZXh0Q29udGVudCA9ICfinIUgVHJhbnNhY3Rpb24gQ29uZmlybWVkISc7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnRleHRDb250ZW50ID0gYEJsb2NrOiAke3R4LmJsb2NrTnVtYmVyfWA7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXN1Y2Nlc3MpJztcclxuICAgICAgICAgIHBlbmRpbmdBY3Rpb25zLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAgIC8vIFN0b3AgcG9sbGluZ1xyXG4gICAgICAgICAgaWYgKHR4U3RhdHVzUG9sbEludGVydmFsKSB7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodHhTdGF0dXNQb2xsSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICB0eFN0YXR1c1BvbGxJbnRlcnZhbCA9IG51bGw7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gQXV0by1jbG9zZSBhZnRlciAyIHNlY29uZHNcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHguc3RhdHVzID09PSAnZmFpbGVkJykge1xyXG4gICAgICAgICAgc3RhdHVzTWVzc2FnZS50ZXh0Q29udGVudCA9ICfinYwgVHJhbnNhY3Rpb24gRmFpbGVkJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMudGV4dENvbnRlbnQgPSAnVGhlIHRyYW5zYWN0aW9uIHdhcyByZWplY3RlZCBvciByZXBsYWNlZCc7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnN0eWxlLmNvbG9yID0gJyNmZjQ0NDQnO1xyXG4gICAgICAgICAgcGVuZGluZ0FjdGlvbnMuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgLy8gU3RvcCBwb2xsaW5nXHJcbiAgICAgICAgICBpZiAodHhTdGF0dXNQb2xsSW50ZXJ2YWwpIHtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0eFN0YXR1c1BvbGxJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIHR4U3RhdHVzUG9sbEludGVydmFsID0gbnVsbDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBBdXRvLWNsb3NlIGFmdGVyIDIgc2Vjb25kc1xyXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICAgICAgfSwgMjAwMCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIFN0aWxsIHBlbmRpbmdcclxuICAgICAgICAgIHN0YXR1c01lc3NhZ2UudGV4dENvbnRlbnQgPSAn4o+zIFdhaXRpbmcgZm9yIGNvbmZpcm1hdGlvbi4uLic7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnRleHRDb250ZW50ID0gJ1RoaXMgdXN1YWxseSB0YWtlcyAxMC0zMCBzZWNvbmRzJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMuc3R5bGUuY29sb3IgPSAndmFyKC0tdGVybWluYWwtZmctZGltKSc7XHJcbiAgICAgICAgICBwZW5kaW5nQWN0aW9ucy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCfwn6uAIFRyYW5zYWN0aW9uIG5vdCBmb3VuZCBpbiBzdG9yYWdlOicsIHR4SGFzaCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgY2hlY2tpbmcgdHJhbnNhY3Rpb24gc3RhdHVzOicsIGVycm9yKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBJbml0aWFsIHN0YXR1cyBjaGVja1xyXG4gIGF3YWl0IHVwZGF0ZVN0YXR1cygpO1xyXG5cclxuICAvLyBQb2xsIGV2ZXJ5IDMgc2Vjb25kc1xyXG4gIHR4U3RhdHVzUG9sbEludGVydmFsID0gc2V0SW50ZXJ2YWwodXBkYXRlU3RhdHVzLCAzMDAwKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TmV0d29ya1N5bWJvbChuZXR3b3JrKSB7XHJcbiAgY29uc3Qgc3ltYm9scyA9IHtcclxuICAgICdwdWxzZWNoYWluJzogJ1BMUycsXHJcbiAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAndFBMUycsXHJcbiAgICAnZXRoZXJldW0nOiAnRVRIJyxcclxuICAgICdzZXBvbGlhJzogJ1NlcG9saWFFVEgnXHJcbiAgfTtcclxuICByZXR1cm4gc3ltYm9sc1tuZXR3b3JrXSB8fCAnRVRIJztcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TmV0d29ya05hbWUobmV0d29yaykge1xyXG4gIGNvbnN0IG5hbWVzID0ge1xyXG4gICAgJ3B1bHNlY2hhaW4nOiAnUHVsc2VDaGFpbiBNYWlubmV0JyxcclxuICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICdQdWxzZUNoYWluIFRlc3RuZXQgVjQnLFxyXG4gICAgJ2V0aGVyZXVtJzogJ0V0aGVyZXVtIE1haW5uZXQnLFxyXG4gICAgJ3NlcG9saWEnOiAnU2Vwb2xpYSBUZXN0bmV0J1xyXG4gIH07XHJcbiAgcmV0dXJuIG5hbWVzW25ldHdvcmtdIHx8IG5ldHdvcms7XHJcbn1cclxuXHJcbi8vID09PT09IFVUSUxJVElFUyA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDb3B5QWRkcmVzcygpIHtcclxuICB0cnkge1xyXG4gICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LWFkZHJlc3MnKTtcclxuICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGJ0bi50ZXh0Q29udGVudDtcclxuICAgIGJ0bi50ZXh0Q29udGVudCA9ICdDT1BJRUQhJztcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSBvcmlnaW5hbFRleHQ7XHJcbiAgICB9LCAyMDAwKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0ZhaWxlZCB0byBjb3B5IGFkZHJlc3MnKTtcclxuICB9XHJcbn1cclxuIl0sImZpbGUiOiJwb3B1cC5qcyJ9