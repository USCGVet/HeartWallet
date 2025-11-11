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
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S, _T, _U, _V, _W, _X, _Y, _Z, __, _$, _aa, _ba, _ca, _da, _ea, _fa, _ga, _ha, _ia, _ja, _ka, _la, _ma, _na, _oa, _pa, _qa, _ra, _sa, _ta, _ua, _va, _wa, _xa, _ya, _za, _Aa, _Ba, _Ca, _Da, _Ea, _Fa, _Ga, _Ha, _Ia, _Ja, _Ka, _La, _Ma, _Na, _Oa, _Pa, _Qa, _Ra, _Sa, _Ta, _Ua, _Va, _Wa, _Xa;
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
  (_Y = document.getElementById("btn-refresh-tx-status")) == null ? void 0 : _Y.addEventListener("click", refreshTransactionStatus);
  (_Z = document.getElementById("btn-close-speed-up-modal")) == null ? void 0 : _Z.addEventListener("click", () => {
    document.getElementById("modal-speed-up-tx").classList.add("hidden");
  });
  (__ = document.getElementById("btn-cancel-speed-up")) == null ? void 0 : __.addEventListener("click", () => {
    document.getElementById("modal-speed-up-tx").classList.add("hidden");
  });
  (_$ = document.getElementById("btn-confirm-speed-up")) == null ? void 0 : _$.addEventListener("click", confirmSpeedUp);
  (_aa = document.getElementById("btn-refresh-gas-price")) == null ? void 0 : _aa.addEventListener("click", refreshGasPrices);
  (_ba = document.getElementById("btn-refresh-approval-gas")) == null ? void 0 : _ba.addEventListener("click", refreshApprovalGasPrice);
  (_ca = document.getElementById("btn-refresh-send-gas")) == null ? void 0 : _ca.addEventListener("click", refreshSendGasPrice);
  (_da = document.getElementById("btn-refresh-token-gas")) == null ? void 0 : _da.addEventListener("click", refreshTokenGasPrice);
  (_ea = document.getElementById("btn-close-add-token")) == null ? void 0 : _ea.addEventListener("click", () => {
    document.getElementById("modal-add-token").classList.add("hidden");
  });
  (_fa = document.getElementById("btn-cancel-add-token")) == null ? void 0 : _fa.addEventListener("click", () => {
    document.getElementById("modal-add-token").classList.add("hidden");
  });
  (_ga = document.getElementById("btn-confirm-add-token")) == null ? void 0 : _ga.addEventListener("click", handleAddCustomToken);
  (_ha = document.getElementById("input-token-address")) == null ? void 0 : _ha.addEventListener("input", handleTokenAddressInput);
  (_ia = document.getElementById("btn-back-from-settings")) == null ? void 0 : _ia.addEventListener("click", () => showScreen("screen-dashboard"));
  (_ja = document.getElementById("setting-theme")) == null ? void 0 : _ja.addEventListener("change", (e) => {
    currentState.settings.theme = e.target.value;
    applyTheme();
    saveSettings();
  });
  (_ka = document.getElementById("setting-decimals")) == null ? void 0 : _ka.addEventListener("change", (e) => {
    currentState.settings.decimalPlaces = parseInt(e.target.value);
    saveSettings();
    updateBalanceDisplay();
  });
  (_la = document.getElementById("setting-autolock")) == null ? void 0 : _la.addEventListener("change", (e) => {
    currentState.settings.autoLockMinutes = parseInt(e.target.value);
    saveSettings();
  });
  (_ma = document.getElementById("setting-max-gas-price")) == null ? void 0 : _ma.addEventListener("change", (e) => {
    currentState.settings.maxGasPriceGwei = parseInt(e.target.value);
    saveSettings();
  });
  (_na = document.getElementById("setting-show-testnets")) == null ? void 0 : _na.addEventListener("change", (e) => {
    currentState.settings.showTestNetworks = e.target.checked;
    saveSettings();
    updateNetworkSelector();
  });
  (_oa = document.getElementById("btn-view-seed")) == null ? void 0 : _oa.addEventListener("click", handleViewSeed);
  (_pa = document.getElementById("btn-export-key")) == null ? void 0 : _pa.addEventListener("click", handleExportKey);
  (_qa = document.getElementById("btn-password-prompt-confirm")) == null ? void 0 : _qa.addEventListener("click", () => {
    const password = document.getElementById("password-prompt-input").value;
    if (password) {
      closePasswordPrompt(password);
    }
  });
  (_ra = document.getElementById("btn-password-prompt-cancel")) == null ? void 0 : _ra.addEventListener("click", () => {
    closePasswordPrompt(null);
  });
  (_sa = document.getElementById("btn-close-password-prompt")) == null ? void 0 : _sa.addEventListener("click", () => {
    closePasswordPrompt(null);
  });
  (_ta = document.getElementById("password-prompt-input")) == null ? void 0 : _ta.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const password = document.getElementById("password-prompt-input").value;
      if (password) {
        closePasswordPrompt(password);
      }
    }
  });
  (_ua = document.getElementById("btn-close-display-secret")) == null ? void 0 : _ua.addEventListener("click", closeSecretModal);
  (_va = document.getElementById("btn-close-display-secret-btn")) == null ? void 0 : _va.addEventListener("click", closeSecretModal);
  (_wa = document.getElementById("btn-copy-secret")) == null ? void 0 : _wa.addEventListener("click", async () => {
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
  (_xa = document.getElementById("btn-manage-wallets")) == null ? void 0 : _xa.addEventListener("click", handleManageWallets);
  (_ya = document.getElementById("btn-back-from-manage-wallets")) == null ? void 0 : _ya.addEventListener("click", () => showScreen("screen-settings"));
  (_za = document.getElementById("btn-create-new-wallet-multi")) == null ? void 0 : _za.addEventListener("click", showAddWalletModal);
  (_Aa = document.getElementById("btn-import-wallet-multi")) == null ? void 0 : _Aa.addEventListener("click", showAddWalletModal);
  (_Ba = document.getElementById("add-wallet-option-create")) == null ? void 0 : _Ba.addEventListener("click", () => {
    document.getElementById("modal-add-wallet").classList.add("hidden");
    generateNewMnemonicMulti();
    document.getElementById("modal-create-wallet-multi").classList.remove("hidden");
  });
  (_Ca = document.getElementById("add-wallet-option-mnemonic")) == null ? void 0 : _Ca.addEventListener("click", () => {
    document.getElementById("modal-add-wallet").classList.add("hidden");
    document.getElementById("modal-import-seed-multi").classList.remove("hidden");
  });
  (_Da = document.getElementById("add-wallet-option-privatekey")) == null ? void 0 : _Da.addEventListener("click", () => {
    document.getElementById("modal-add-wallet").classList.add("hidden");
    document.getElementById("modal-import-key-multi").classList.remove("hidden");
  });
  (_Ea = document.getElementById("btn-close-add-wallet")) == null ? void 0 : _Ea.addEventListener("click", () => {
    document.getElementById("modal-add-wallet").classList.add("hidden");
  });
  (_Fa = document.getElementById("btn-confirm-create-wallet-multi")) == null ? void 0 : _Fa.addEventListener("click", handleCreateNewWalletMulti);
  (_Ga = document.getElementById("btn-cancel-create-wallet-multi")) == null ? void 0 : _Ga.addEventListener("click", () => {
    document.getElementById("modal-create-wallet-multi").classList.add("hidden");
    document.getElementById("input-new-wallet-nickname").value = "";
    document.getElementById("verify-word-1-multi").value = "";
    document.getElementById("verify-word-2-multi").value = "";
    document.getElementById("verify-word-3-multi").value = "";
    document.getElementById("verification-error-multi").classList.add("hidden");
  });
  (_Ha = document.getElementById("btn-close-create-wallet-multi")) == null ? void 0 : _Ha.addEventListener("click", () => {
    document.getElementById("modal-create-wallet-multi").classList.add("hidden");
    document.getElementById("input-new-wallet-nickname").value = "";
    document.getElementById("verify-word-1-multi").value = "";
    document.getElementById("verify-word-2-multi").value = "";
    document.getElementById("verify-word-3-multi").value = "";
    document.getElementById("verification-error-multi").classList.add("hidden");
  });
  (_Ia = document.getElementById("btn-confirm-import-seed-multi")) == null ? void 0 : _Ia.addEventListener("click", handleImportSeedMulti);
  (_Ja = document.getElementById("btn-cancel-import-seed-multi")) == null ? void 0 : _Ja.addEventListener("click", () => {
    document.getElementById("modal-import-seed-multi").classList.add("hidden");
    document.getElementById("input-import-seed-nickname").value = "";
    document.getElementById("input-import-seed-phrase").value = "";
  });
  (_Ka = document.getElementById("btn-close-import-seed-multi")) == null ? void 0 : _Ka.addEventListener("click", () => {
    document.getElementById("modal-import-seed-multi").classList.add("hidden");
    document.getElementById("input-import-seed-nickname").value = "";
    document.getElementById("input-import-seed-phrase").value = "";
  });
  (_La = document.getElementById("btn-confirm-import-key-multi")) == null ? void 0 : _La.addEventListener("click", handleImportKeyMulti);
  (_Ma = document.getElementById("btn-cancel-import-key-multi")) == null ? void 0 : _Ma.addEventListener("click", () => {
    document.getElementById("modal-import-key-multi").classList.add("hidden");
    document.getElementById("input-import-key-nickname").value = "";
    document.getElementById("input-import-private-key").value = "";
  });
  (_Na = document.getElementById("btn-close-import-key-multi")) == null ? void 0 : _Na.addEventListener("click", () => {
    document.getElementById("modal-import-key-multi").classList.add("hidden");
    document.getElementById("input-import-key-nickname").value = "";
    document.getElementById("input-import-private-key").value = "";
  });
  (_Oa = document.getElementById("btn-confirm-rename-wallet")) == null ? void 0 : _Oa.addEventListener("click", handleRenameWalletConfirm);
  (_Pa = document.getElementById("btn-cancel-rename-wallet")) == null ? void 0 : _Pa.addEventListener("click", () => {
    document.getElementById("modal-rename-wallet").classList.add("hidden");
    currentRenameWalletId = null;
  });
  (_Qa = document.getElementById("btn-close-rename-wallet")) == null ? void 0 : _Qa.addEventListener("click", () => {
    document.getElementById("modal-rename-wallet").classList.add("hidden");
    currentRenameWalletId = null;
  });
  (_Ra = document.getElementById("btn-close-tx-success")) == null ? void 0 : _Ra.addEventListener("click", () => {
    document.getElementById("modal-tx-success").classList.add("hidden");
  });
  (_Sa = document.getElementById("btn-ok-tx-success")) == null ? void 0 : _Sa.addEventListener("click", () => {
    document.getElementById("modal-tx-success").classList.add("hidden");
  });
  (_Ta = document.getElementById("btn-copy-tx-hash")) == null ? void 0 : _Ta.addEventListener("click", async () => {
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
  (_Ua = document.getElementById("btn-tx-status-explorer")) == null ? void 0 : _Ua.addEventListener("click", () => {
    if (!txStatusCurrentHash) return;
    const url = getExplorerUrl(currentState.network, "tx", txStatusCurrentHash);
    chrome.tabs.create({ url });
  });
  (_Va = document.getElementById("btn-close-tx-status")) == null ? void 0 : _Va.addEventListener("click", () => {
    console.log("🫀 Close button clicked");
    if (txStatusPollInterval) {
      clearInterval(txStatusPollInterval);
      txStatusPollInterval = null;
    }
    window.close();
  });
  (_Wa = document.getElementById("btn-tx-status-speed-up")) == null ? void 0 : _Wa.addEventListener("click", async () => {
    if (!txStatusCurrentHash || !txStatusCurrentAddress) return;
    try {
      const txResponse = await chrome.runtime.sendMessage({
        type: "GET_TX_BY_HASH",
        address: txStatusCurrentAddress,
        txHash: txStatusCurrentHash
      });
      if (!txResponse.success || !txResponse.transaction) {
        alert("Could not load transaction details");
        return;
      }
      const tx = txResponse.transaction;
      speedUpModalState.txHash = txStatusCurrentHash;
      speedUpModalState.address = txStatusCurrentAddress;
      speedUpModalState.network = tx.network;
      speedUpModalState.originalGasPrice = tx.gasPrice;
      document.getElementById("modal-speed-up-tx").classList.remove("hidden");
      await refreshGasPrices();
    } catch (error) {
      console.error("Error opening speed-up modal:", error);
      alert("Error loading gas prices");
    }
  });
  (_Xa = document.getElementById("btn-tx-status-cancel")) == null ? void 0 : _Xa.addEventListener("click", async () => {
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
  gasPriceRefreshState.approval = { network, txRequest, symbol };
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
  gasPriceRefreshState.send = { network, txRequest, symbol };
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
  gasPriceRefreshState.token = { network, txRequest, symbol };
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
async function refreshTransactionFromList(txHash) {
  var _a;
  if (!currentState.address) return;
  try {
    const txResponse = await chrome.runtime.sendMessage({
      type: "GET_TX_BY_HASH",
      address: currentState.address,
      txHash
    });
    if (!txResponse.success || !txResponse.transaction) {
      alert("Transaction not found");
      return;
    }
    const network = txResponse.transaction.network;
    const refreshResponse = await chrome.runtime.sendMessage({
      type: "REFRESH_TX_STATUS",
      address: currentState.address,
      txHash,
      network
    });
    if (!refreshResponse.success) {
      alert("Error: " + refreshResponse.error);
      return;
    }
    if (refreshResponse.status === "confirmed") {
      alert(`✅ Transaction confirmed on block ${refreshResponse.blockNumber}!`);
    } else if (refreshResponse.status === "failed") {
      alert("❌ Transaction failed on blockchain");
    } else {
      alert("⏳ Still pending on blockchain");
    }
    await renderTransactionHistory(((_a = document.querySelector('[id^="filter-"][class*="active"]')) == null ? void 0 : _a.id.replace("filter-", "").replace("-txs", "")) || "all");
  } catch (error) {
    console.error("Error refreshing transaction:", error);
    alert("Error refreshing status");
  }
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
      const refreshButton = tx.status === "pending" ? `<button class="btn-small" style="font-size: 9px; padding: 4px 8px; margin-left: 8px;" data-refresh-tx="${tx.hash}">🔄 Refresh</button>` : "";
      html += `
        <div class="panel mb-2" style="padding: 12px; cursor: pointer; border-color: ${statusColor};" data-tx-hash="${tx.hash}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="display: flex; align-items: center;">
              <span style="color: ${statusColor}; font-size: 14px;">${statusIcon} ${tx.status.toUpperCase()}</span>
              ${refreshButton}
            </div>
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
    listEl.querySelectorAll("[data-refresh-tx]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const txHash = btn.dataset.refreshTx;
        await refreshTransactionFromList(txHash);
      });
    });
  } catch (error) {
    console.error("Error loading transaction history:", error);
    listEl.innerHTML = '<p class="text-center text-dim">Error loading transactions</p>';
  }
}
async function refreshTransactionStatus() {
  if (!currentState.address || !currentState.currentTxHash) return;
  const btn = document.getElementById("btn-refresh-tx-status");
  if (!btn) return;
  try {
    btn.disabled = true;
    btn.textContent = "⏳ Checking blockchain...";
    const txResponse = await chrome.runtime.sendMessage({
      type: "GET_TX_BY_HASH",
      address: currentState.address,
      txHash: currentState.currentTxHash
    });
    if (!txResponse.success || !txResponse.transaction) {
      throw new Error("Transaction not found");
    }
    const network = txResponse.transaction.network;
    const refreshResponse = await chrome.runtime.sendMessage({
      type: "REFRESH_TX_STATUS",
      address: currentState.address,
      txHash: currentState.currentTxHash,
      network
    });
    if (!refreshResponse.success) {
      throw new Error(refreshResponse.error || "Failed to refresh status");
    }
    if (refreshResponse.status === "pending") {
      alert("✋ Transaction is still pending on the blockchain.\n\nIt has not been mined yet.");
    } else if (refreshResponse.status === "confirmed") {
      alert(`✅ Status updated!

Transaction is CONFIRMED on block ${refreshResponse.blockNumber}`);
    } else {
      alert("❌ Status updated!\n\nTransaction FAILED on the blockchain.");
    }
    await showTransactionDetails(currentState.currentTxHash);
  } catch (error) {
    console.error("Error refreshing transaction status:", error);
    alert("Error refreshing status: " + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "🔄 REFRESH STATUS FROM BLOCKCHAIN";
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
let gasPriceRefreshState = {
  approval: { network: null, txRequest: null, symbol: null },
  send: { network: null, txRequest: null, symbol: null },
  token: { network: null, txRequest: null, symbol: null }
};
let speedUpModalState = {
  txHash: null,
  address: null,
  network: null,
  originalGasPrice: null,
  currentGasPrice: null,
  recommendedGasPrice: null
};
async function handleSpeedUpTransaction() {
  if (!currentState.address || !currentState.currentTxHash) return;
  try {
    const txResponse = await chrome.runtime.sendMessage({
      type: "GET_TX_BY_HASH",
      address: currentState.address,
      txHash: currentState.currentTxHash
    });
    if (!txResponse.success || !txResponse.transaction) {
      alert("Could not load transaction details");
      return;
    }
    const tx = txResponse.transaction;
    speedUpModalState.txHash = currentState.currentTxHash;
    speedUpModalState.address = currentState.address;
    speedUpModalState.network = tx.network;
    speedUpModalState.originalGasPrice = tx.gasPrice;
    document.getElementById("modal-speed-up-tx").classList.remove("hidden");
    await refreshGasPrices();
  } catch (error) {
    console.error("Error opening speed-up modal:", error);
    alert("Error loading gas prices");
  }
}
async function refreshGasPrices() {
  const loadingEl = document.getElementById("speed-up-loading");
  const refreshBtn = document.getElementById("btn-refresh-gas-price");
  try {
    loadingEl.classList.remove("hidden");
    refreshBtn.disabled = true;
    refreshBtn.textContent = "⏳ Loading...";
    const gasResponse = await chrome.runtime.sendMessage({
      type: "GET_CURRENT_GAS_PRICE",
      network: speedUpModalState.network
    });
    if (!gasResponse.success) {
      throw new Error(gasResponse.error || "Failed to fetch gas price");
    }
    speedUpModalState.currentGasPrice = gasResponse.gasPrice;
    const currentGwei = parseFloat(gasResponse.gasPriceGwei);
    const recommendedGwei = (currentGwei * 1.1).toFixed(2);
    speedUpModalState.recommendedGasPrice = (BigInt(gasResponse.gasPrice) * BigInt(110) / BigInt(100)).toString();
    const originalGwei = (Number(speedUpModalState.originalGasPrice) / 1e9).toFixed(2);
    document.getElementById("speed-up-original-gas").textContent = `${originalGwei} Gwei`;
    document.getElementById("speed-up-current-gas").textContent = `${currentGwei} Gwei`;
    document.getElementById("speed-up-recommended-gas").textContent = `${recommendedGwei} Gwei`;
    const comparison = currentGwei / parseFloat(originalGwei);
    const messageEl = document.getElementById("speed-up-comparison-message");
    if (comparison > 2) {
      messageEl.textContent = `⚠️ Network gas is ${comparison.toFixed(0)}x higher than your transaction!`;
      messageEl.style.color = "var(--terminal-danger)";
    } else if (comparison > 1.2) {
      messageEl.textContent = `Network gas is ${comparison.toFixed(1)}x higher than your transaction`;
      messageEl.style.color = "var(--terminal-warning)";
    } else {
      messageEl.textContent = "Network gas is close to your transaction price";
      messageEl.style.color = "var(--terminal-success)";
    }
  } catch (error) {
    console.error("Error refreshing gas prices:", error);
    document.getElementById("speed-up-comparison-message").textContent = `Error: ${error.message}`;
    document.getElementById("speed-up-comparison-message").style.color = "var(--terminal-danger)";
  } finally {
    loadingEl.classList.add("hidden");
    refreshBtn.disabled = false;
    refreshBtn.textContent = "🔄 REFRESH GAS PRICE";
  }
}
async function confirmSpeedUp() {
  try {
    const customGasInput = document.getElementById("speed-up-custom-gas").value;
    let gasPriceToUse = speedUpModalState.recommendedGasPrice;
    if (customGasInput && customGasInput.trim() !== "") {
      const customGwei = parseFloat(customGasInput);
      if (isNaN(customGwei) || customGwei <= 0) {
        alert("Invalid gas price. Please enter a positive number.");
        return;
      }
      gasPriceToUse = BigInt(Math.floor(customGwei * 1e9)).toString();
    }
    document.getElementById("modal-speed-up-tx").classList.add("hidden");
    const password = await showPasswordPrompt("Speed Up Transaction", "Enter your password to confirm speed-up");
    if (!password) return;
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
      address: speedUpModalState.address,
      txHash: speedUpModalState.txHash,
      sessionToken: sessionResponse.sessionToken,
      customGasPrice: gasPriceToUse
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
async function refreshApprovalGasPrice() {
  const btn = document.getElementById("btn-refresh-approval-gas");
  if (!btn || !gasPriceRefreshState.approval.network) return;
  try {
    btn.disabled = true;
    btn.textContent = "⏳ Loading...";
    const { network, txRequest, symbol } = gasPriceRefreshState.approval;
    await populateGasPrices(network, txRequest, symbol);
  } catch (error) {
    console.error("Error refreshing gas price:", error);
    alert("Error refreshing gas price");
  } finally {
    btn.disabled = false;
    btn.textContent = "🔄 REFRESH GAS PRICE";
  }
}
async function refreshSendGasPrice() {
  const btn = document.getElementById("btn-refresh-send-gas");
  if (!btn || !gasPriceRefreshState.send.network) return;
  try {
    btn.disabled = true;
    btn.textContent = "⏳ Loading...";
    const { network, txRequest, symbol } = gasPriceRefreshState.send;
    await populateSendGasPrices(network, txRequest, symbol);
  } catch (error) {
    console.error("Error refreshing gas price:", error);
    alert("Error refreshing gas price");
  } finally {
    btn.disabled = false;
    btn.textContent = "🔄 REFRESH GAS PRICE";
  }
}
async function refreshTokenGasPrice() {
  const btn = document.getElementById("btn-refresh-token-gas");
  if (!btn || !gasPriceRefreshState.token.network) return;
  try {
    btn.disabled = true;
    btn.textContent = "⏳ Loading...";
    const { network, txRequest, symbol } = gasPriceRefreshState.token;
    await populateTokenGasPrices(network, txRequest, symbol);
  } catch (error) {
    console.error("Error refreshing gas price:", error);
    alert("Error refreshing gas price");
  } finally {
    btn.disabled = false;
    btn.textContent = "🔄 REFRESH GAS PRICE";
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


//# sourceMappingURL=data:application/json;base64,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QSxFQUNWO0FBQUEsRUFBRztBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWDtBQUFBLEVBQUc7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1g7QUFBQSxFQUFHO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNYO0FBQUEsRUFBRztBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWDtBQUFBLEVBQUc7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1g7QUFBQSxFQUFHO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNYO0FBQUEsRUFBRztBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWDtBQUFBLEVBQUc7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1g7QUFBQSxFQUFHO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNYO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUNkO0FBRUEsTUFBTSxxQkFBcUI7QUFBQTtBQUFBLEVBRXpCO0FBQUEsRUFBRztBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWDtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFDWjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUNaO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFLO0FBQUEsRUFDYjtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSztBQUFBLEVBQ2I7QUFBQSxFQUFJO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNkO0FBQUEsRUFBSTtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZDtBQUFBLEVBQUk7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Q7QUFBQSxFQUFJO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNkO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNmO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNmO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNmO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUNmO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDZjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQ2Y7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUNoQjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQ2hCO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFDaEI7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUNoQjtBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQ2hCO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFDaEI7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUNoQjtBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQ2pCO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFDakI7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUNqQjtBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQ2pCO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFDakI7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUNqQjtBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUNuQjtBQVVBLHFDQUF5QixTQUFT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VCxTQUFTLE9BQU87QUFDZCxVQUFNLHdCQUF3QjtBQUFBLEVBQ2hDO0FBQ0YiLCJuYW1lcyI6WyJjYW5Qcm9taXNlIiwidXRpbHMiLCJ2ZXJzaW9uIiwia2FuamkiLCJpc1ZhbGlkIiwiQml0QnVmZmVyIiwiQml0TWF0cml4IiwiZ2V0U3ltYm9sU2l6ZSIsInJlcXVpcmUkJDAiLCJnZXRQb3NpdGlvbnMiLCJtYXNrUGF0dGVybiIsIkVDTGV2ZWwiLCJlcnJvckNvcnJlY3Rpb25MZXZlbCIsIm11bCIsIlJlZWRTb2xvbW9uRW5jb2RlciIsInJlcXVpcmUkJDEiLCJtb2RlIiwiVXRpbHMiLCJFQ0NvZGUiLCJyZXF1aXJlJCQyIiwiTW9kZSIsInJlcXVpcmUkJDMiLCJyZXF1aXJlJCQ0Iiwic2VnbWVudHMiLCJnZXRFbmNvZGVkQml0cyIsImdldEJpdHNMZW5ndGgiLCJiaXRCdWZmZXIiLCJnZXRMZW5ndGgiLCJ3cml0ZSIsImRpamtzdHJhIiwiTnVtZXJpY0RhdGEiLCJBbHBoYW51bWVyaWNEYXRhIiwiQnl0ZURhdGEiLCJLYW5qaURhdGEiLCJyZXF1aXJlJCQ1IiwicmVxdWlyZSQkNiIsInJlcXVpcmUkJDciLCJyZWdleCIsInJlcXVpcmUkJDgiLCJyZXF1aXJlJCQ5IiwicmVxdWlyZSQkMTAiLCJyZXF1aXJlJCQxMSIsInJlcXVpcmUkJDEyIiwiY2FudmFzIiwicmVuZGVyIiwic3ZnVGFnIiwiZXRoZXJzLkNvbnRyYWN0IiwiZXRoZXJzLmZvcm1hdFVuaXRzIiwiZXRoZXJzLnBhcnNlVW5pdHMiLCJldGhlcnMuaXNBZGRyZXNzIiwidG9rZW5zIiwicGxzUmVzZXJ2ZSIsInNjcmVlbiIsIl9hIiwiZXRoZXJzIiwicnBjLmdldEJhbGFuY2UiLCJycGMuZm9ybWF0QmFsYW5jZSIsImV0aGVycy5wYXJzZUV0aGVyIiwicnBjLmdldFByb3ZpZGVyIiwidG9rZW5zLmdldEFsbFRva2VucyIsInJwYy5nZXRUcmFuc2FjdGlvbkNvdW50IiwiZXJjMjAuZ2V0VG9rZW5CYWxhbmNlIiwiZXJjMjAuZm9ybWF0VG9rZW5CYWxhbmNlIiwiZXJjMjAucGFyc2VUb2tlbkFtb3VudCIsIlFSQ29kZSIsInRva2Vucy5ERUZBVUxUX1RPS0VOUyIsInRva2Vucy5nZXRFbmFibGVkRGVmYXVsdFRva2VucyIsInRva2Vucy5nZXRDdXN0b21Ub2tlbnMiLCJ0b2tlbnMucmVtb3ZlQ3VzdG9tVG9rZW4iLCJ0b2tlbnMudG9nZ2xlRGVmYXVsdFRva2VuIiwiZXJjMjAuZ2V0VG9rZW5NZXRhZGF0YSIsInRva2Vucy5hZGRDdXN0b21Ub2tlbiIsInJwYy5nZXRHYXNQcmljZSIsInJwYy5lc3RpbWF0ZUdhcyIsImV0aGVycy5mb3JtYXRFdGhlciIsInJlc3BvbnNlIiwiZXRoZXJzLmdldEJ5dGVzIiwiZXRoZXJzLnRvVXRmOFN0cmluZyJdLCJpZ25vcmVMaXN0IjpbMCwxLDIsMyw0LDUsNiw3LDgsOSwxMCwxMSwxMiwxMywxNCwxNSwxNiwxNywxOCwxOSwyMCwyMSwyMiwyMywyNCwyNSwyNiwyN10sInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY2FuLXByb21pc2UuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL3V0aWxzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9lcnJvci1jb3JyZWN0aW9uLWxldmVsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9iaXQtYnVmZmVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9iaXQtbWF0cml4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9hbGlnbm1lbnQtcGF0dGVybi5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvZmluZGVyLXBhdHRlcm4uanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL21hc2stcGF0dGVybi5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvZXJyb3ItY29ycmVjdGlvbi1jb2RlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9nYWxvaXMtZmllbGQuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL3BvbHlub21pYWwuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL3JlZWQtc29sb21vbi1lbmNvZGVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS92ZXJzaW9uLWNoZWNrLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9yZWdleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvbW9kZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvdmVyc2lvbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvZm9ybWF0LWluZm8uanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL251bWVyaWMtZGF0YS5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYWxwaGFudW1lcmljLWRhdGEuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2J5dGUtZGF0YS5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUva2FuamktZGF0YS5qcyIsIi4uL25vZGVfbW9kdWxlcy9kaWprc3RyYWpzL2RpamtzdHJhLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9zZWdtZW50cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcXJjb2RlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvcmVuZGVyZXIvdXRpbHMuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9yZW5kZXJlci9jYW52YXMuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9yZW5kZXJlci9zdmctdGFnLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvYnJvd3Nlci5qcyIsIi4uL3NyYy9jb3JlL2VyYzIwLmpzIiwiLi4vc3JjL2NvcmUvdG9rZW5zLmpzIiwiLi4vc3JjL2NvcmUvcHJpY2VPcmFjbGUuanMiLCIuLi9zcmMvcG9wdXAvcG9wdXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gY2FuLXByb21pc2UgaGFzIGEgY3Jhc2ggaW4gc29tZSB2ZXJzaW9ucyBvZiByZWFjdCBuYXRpdmUgdGhhdCBkb250IGhhdmVcclxuLy8gc3RhbmRhcmQgZ2xvYmFsIG9iamVjdHNcclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3NvbGRhaXIvbm9kZS1xcmNvZGUvaXNzdWVzLzE1N1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgcmV0dXJuIHR5cGVvZiBQcm9taXNlID09PSAnZnVuY3Rpb24nICYmIFByb21pc2UucHJvdG90eXBlICYmIFByb21pc2UucHJvdG90eXBlLnRoZW5cclxufVxyXG4iLCJsZXQgdG9TSklTRnVuY3Rpb25cclxuY29uc3QgQ09ERVdPUkRTX0NPVU5UID0gW1xyXG4gIDAsIC8vIE5vdCB1c2VkXHJcbiAgMjYsIDQ0LCA3MCwgMTAwLCAxMzQsIDE3MiwgMTk2LCAyNDIsIDI5MiwgMzQ2LFxyXG4gIDQwNCwgNDY2LCA1MzIsIDU4MSwgNjU1LCA3MzMsIDgxNSwgOTAxLCA5OTEsIDEwODUsXHJcbiAgMTE1NiwgMTI1OCwgMTM2NCwgMTQ3NCwgMTU4OCwgMTcwNiwgMTgyOCwgMTkyMSwgMjA1MSwgMjE4NSxcclxuICAyMzIzLCAyNDY1LCAyNjExLCAyNzYxLCAyODc2LCAzMDM0LCAzMTk2LCAzMzYyLCAzNTMyLCAzNzA2XHJcbl1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBRUiBDb2RlIHNpemUgZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvblxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICBzaXplIG9mIFFSIGNvZGVcclxuICovXHJcbmV4cG9ydHMuZ2V0U3ltYm9sU2l6ZSA9IGZ1bmN0aW9uIGdldFN5bWJvbFNpemUgKHZlcnNpb24pIHtcclxuICBpZiAoIXZlcnNpb24pIHRocm93IG5ldyBFcnJvcignXCJ2ZXJzaW9uXCIgY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJylcclxuICBpZiAodmVyc2lvbiA8IDEgfHwgdmVyc2lvbiA+IDQwKSB0aHJvdyBuZXcgRXJyb3IoJ1widmVyc2lvblwiIHNob3VsZCBiZSBpbiByYW5nZSBmcm9tIDEgdG8gNDAnKVxyXG4gIHJldHVybiB2ZXJzaW9uICogNCArIDE3XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSB0b3RhbCBudW1iZXIgb2YgY29kZXdvcmRzIHVzZWQgdG8gc3RvcmUgZGF0YSBhbmQgRUMgaW5mb3JtYXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgIERhdGEgbGVuZ3RoIGluIGJpdHNcclxuICovXHJcbmV4cG9ydHMuZ2V0U3ltYm9sVG90YWxDb2Rld29yZHMgPSBmdW5jdGlvbiBnZXRTeW1ib2xUb3RhbENvZGV3b3JkcyAodmVyc2lvbikge1xyXG4gIHJldHVybiBDT0RFV09SRFNfQ09VTlRbdmVyc2lvbl1cclxufVxyXG5cclxuLyoqXHJcbiAqIEVuY29kZSBkYXRhIHdpdGggQm9zZS1DaGF1ZGh1cmktSG9jcXVlbmdoZW1cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSBkYXRhIFZhbHVlIHRvIGVuY29kZVxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgRW5jb2RlZCB2YWx1ZVxyXG4gKi9cclxuZXhwb3J0cy5nZXRCQ0hEaWdpdCA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgbGV0IGRpZ2l0ID0gMFxyXG5cclxuICB3aGlsZSAoZGF0YSAhPT0gMCkge1xyXG4gICAgZGlnaXQrK1xyXG4gICAgZGF0YSA+Pj49IDFcclxuICB9XHJcblxyXG4gIHJldHVybiBkaWdpdFxyXG59XHJcblxyXG5leHBvcnRzLnNldFRvU0pJU0Z1bmN0aW9uID0gZnVuY3Rpb24gc2V0VG9TSklTRnVuY3Rpb24gKGYpIHtcclxuICBpZiAodHlwZW9mIGYgIT09ICdmdW5jdGlvbicpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignXCJ0b1NKSVNGdW5jXCIgaXMgbm90IGEgdmFsaWQgZnVuY3Rpb24uJylcclxuICB9XHJcblxyXG4gIHRvU0pJU0Z1bmN0aW9uID0gZlxyXG59XHJcblxyXG5leHBvcnRzLmlzS2FuamlNb2RlRW5hYmxlZCA9IGZ1bmN0aW9uICgpIHtcclxuICByZXR1cm4gdHlwZW9mIHRvU0pJU0Z1bmN0aW9uICE9PSAndW5kZWZpbmVkJ1xyXG59XHJcblxyXG5leHBvcnRzLnRvU0pJUyA9IGZ1bmN0aW9uIHRvU0pJUyAoa2FuamkpIHtcclxuICByZXR1cm4gdG9TSklTRnVuY3Rpb24oa2FuamkpXHJcbn1cclxuIiwiZXhwb3J0cy5MID0geyBiaXQ6IDEgfVxyXG5leHBvcnRzLk0gPSB7IGJpdDogMCB9XHJcbmV4cG9ydHMuUSA9IHsgYml0OiAzIH1cclxuZXhwb3J0cy5IID0geyBiaXQ6IDIgfVxyXG5cclxuZnVuY3Rpb24gZnJvbVN0cmluZyAoc3RyaW5nKSB7XHJcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcmFtIGlzIG5vdCBhIHN0cmluZycpXHJcbiAgfVxyXG5cclxuICBjb25zdCBsY1N0ciA9IHN0cmluZy50b0xvd2VyQ2FzZSgpXHJcblxyXG4gIHN3aXRjaCAobGNTdHIpIHtcclxuICAgIGNhc2UgJ2wnOlxyXG4gICAgY2FzZSAnbG93JzpcclxuICAgICAgcmV0dXJuIGV4cG9ydHMuTFxyXG5cclxuICAgIGNhc2UgJ20nOlxyXG4gICAgY2FzZSAnbWVkaXVtJzpcclxuICAgICAgcmV0dXJuIGV4cG9ydHMuTVxyXG5cclxuICAgIGNhc2UgJ3EnOlxyXG4gICAgY2FzZSAncXVhcnRpbGUnOlxyXG4gICAgICByZXR1cm4gZXhwb3J0cy5RXHJcblxyXG4gICAgY2FzZSAnaCc6XHJcbiAgICBjYXNlICdoaWdoJzpcclxuICAgICAgcmV0dXJuIGV4cG9ydHMuSFxyXG5cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBFQyBMZXZlbDogJyArIHN0cmluZylcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydHMuaXNWYWxpZCA9IGZ1bmN0aW9uIGlzVmFsaWQgKGxldmVsKSB7XHJcbiAgcmV0dXJuIGxldmVsICYmIHR5cGVvZiBsZXZlbC5iaXQgIT09ICd1bmRlZmluZWQnICYmXHJcbiAgICBsZXZlbC5iaXQgPj0gMCAmJiBsZXZlbC5iaXQgPCA0XHJcbn1cclxuXHJcbmV4cG9ydHMuZnJvbSA9IGZ1bmN0aW9uIGZyb20gKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHtcclxuICBpZiAoZXhwb3J0cy5pc1ZhbGlkKHZhbHVlKSkge1xyXG4gICAgcmV0dXJuIHZhbHVlXHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgcmV0dXJuIGZyb21TdHJpbmcodmFsdWUpXHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZVxyXG4gIH1cclxufVxyXG4iLCJmdW5jdGlvbiBCaXRCdWZmZXIgKCkge1xyXG4gIHRoaXMuYnVmZmVyID0gW11cclxuICB0aGlzLmxlbmd0aCA9IDBcclxufVxyXG5cclxuQml0QnVmZmVyLnByb3RvdHlwZSA9IHtcclxuXHJcbiAgZ2V0OiBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgIGNvbnN0IGJ1ZkluZGV4ID0gTWF0aC5mbG9vcihpbmRleCAvIDgpXHJcbiAgICByZXR1cm4gKCh0aGlzLmJ1ZmZlcltidWZJbmRleF0gPj4+ICg3IC0gaW5kZXggJSA4KSkgJiAxKSA9PT0gMVxyXG4gIH0sXHJcblxyXG4gIHB1dDogZnVuY3Rpb24gKG51bSwgbGVuZ3RoKSB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHRoaXMucHV0Qml0KCgobnVtID4+PiAobGVuZ3RoIC0gaSAtIDEpKSAmIDEpID09PSAxKVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGdldExlbmd0aEluQml0czogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubGVuZ3RoXHJcbiAgfSxcclxuXHJcbiAgcHV0Qml0OiBmdW5jdGlvbiAoYml0KSB7XHJcbiAgICBjb25zdCBidWZJbmRleCA9IE1hdGguZmxvb3IodGhpcy5sZW5ndGggLyA4KVxyXG4gICAgaWYgKHRoaXMuYnVmZmVyLmxlbmd0aCA8PSBidWZJbmRleCkge1xyXG4gICAgICB0aGlzLmJ1ZmZlci5wdXNoKDApXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJpdCkge1xyXG4gICAgICB0aGlzLmJ1ZmZlcltidWZJbmRleF0gfD0gKDB4ODAgPj4+ICh0aGlzLmxlbmd0aCAlIDgpKVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubGVuZ3RoKytcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQml0QnVmZmVyXHJcbiIsIi8qKlxyXG4gKiBIZWxwZXIgY2xhc3MgdG8gaGFuZGxlIFFSIENvZGUgc3ltYm9sIG1vZHVsZXNcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9IHNpemUgU3ltYm9sIHNpemVcclxuICovXHJcbmZ1bmN0aW9uIEJpdE1hdHJpeCAoc2l6ZSkge1xyXG4gIGlmICghc2l6ZSB8fCBzaXplIDwgMSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdCaXRNYXRyaXggc2l6ZSBtdXN0IGJlIGRlZmluZWQgYW5kIGdyZWF0ZXIgdGhhbiAwJylcclxuICB9XHJcblxyXG4gIHRoaXMuc2l6ZSA9IHNpemVcclxuICB0aGlzLmRhdGEgPSBuZXcgVWludDhBcnJheShzaXplICogc2l6ZSlcclxuICB0aGlzLnJlc2VydmVkQml0ID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZSAqIHNpemUpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXQgYml0IHZhbHVlIGF0IHNwZWNpZmllZCBsb2NhdGlvblxyXG4gKiBJZiByZXNlcnZlZCBmbGFnIGlzIHNldCwgdGhpcyBiaXQgd2lsbCBiZSBpZ25vcmVkIGR1cmluZyBtYXNraW5nIHByb2Nlc3NcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9ICByb3dcclxuICogQHBhcmFtIHtOdW1iZXJ9ICBjb2xcclxuICogQHBhcmFtIHtCb29sZWFufSB2YWx1ZVxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHJlc2VydmVkXHJcbiAqL1xyXG5CaXRNYXRyaXgucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChyb3csIGNvbCwgdmFsdWUsIHJlc2VydmVkKSB7XHJcbiAgY29uc3QgaW5kZXggPSByb3cgKiB0aGlzLnNpemUgKyBjb2xcclxuICB0aGlzLmRhdGFbaW5kZXhdID0gdmFsdWVcclxuICBpZiAocmVzZXJ2ZWQpIHRoaXMucmVzZXJ2ZWRCaXRbaW5kZXhdID0gdHJ1ZVxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBiaXQgdmFsdWUgYXQgc3BlY2lmaWVkIGxvY2F0aW9uXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gIHJvd1xyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICBjb2xcclxuICogQHJldHVybiB7Qm9vbGVhbn1cclxuICovXHJcbkJpdE1hdHJpeC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XHJcbiAgcmV0dXJuIHRoaXMuZGF0YVtyb3cgKiB0aGlzLnNpemUgKyBjb2xdXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBcHBsaWVzIHhvciBvcGVyYXRvciBhdCBzcGVjaWZpZWQgbG9jYXRpb25cclxuICogKHVzZWQgZHVyaW5nIG1hc2tpbmcgcHJvY2VzcylcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9ICByb3dcclxuICogQHBhcmFtIHtOdW1iZXJ9ICBjb2xcclxuICogQHBhcmFtIHtCb29sZWFufSB2YWx1ZVxyXG4gKi9cclxuQml0TWF0cml4LnByb3RvdHlwZS54b3IgPSBmdW5jdGlvbiAocm93LCBjb2wsIHZhbHVlKSB7XHJcbiAgdGhpcy5kYXRhW3JvdyAqIHRoaXMuc2l6ZSArIGNvbF0gXj0gdmFsdWVcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrIGlmIGJpdCBhdCBzcGVjaWZpZWQgbG9jYXRpb24gaXMgcmVzZXJ2ZWRcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9ICAgcm93XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSAgIGNvbFxyXG4gKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gKi9cclxuQml0TWF0cml4LnByb3RvdHlwZS5pc1Jlc2VydmVkID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XHJcbiAgcmV0dXJuIHRoaXMucmVzZXJ2ZWRCaXRbcm93ICogdGhpcy5zaXplICsgY29sXVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJpdE1hdHJpeFxyXG4iLCIvKipcclxuICogQWxpZ25tZW50IHBhdHRlcm4gYXJlIGZpeGVkIHJlZmVyZW5jZSBwYXR0ZXJuIGluIGRlZmluZWQgcG9zaXRpb25zXHJcbiAqIGluIGEgbWF0cml4IHN5bWJvbG9neSwgd2hpY2ggZW5hYmxlcyB0aGUgZGVjb2RlIHNvZnR3YXJlIHRvIHJlLXN5bmNocm9uaXNlXHJcbiAqIHRoZSBjb29yZGluYXRlIG1hcHBpbmcgb2YgdGhlIGltYWdlIG1vZHVsZXMgaW4gdGhlIGV2ZW50IG9mIG1vZGVyYXRlIGFtb3VudHNcclxuICogb2YgZGlzdG9ydGlvbiBvZiB0aGUgaW1hZ2UuXHJcbiAqXHJcbiAqIEFsaWdubWVudCBwYXR0ZXJucyBhcmUgcHJlc2VudCBvbmx5IGluIFFSIENvZGUgc3ltYm9scyBvZiB2ZXJzaW9uIDIgb3IgbGFyZ2VyXHJcbiAqIGFuZCB0aGVpciBudW1iZXIgZGVwZW5kcyBvbiB0aGUgc3ltYm9sIHZlcnNpb24uXHJcbiAqL1xyXG5cclxuY29uc3QgZ2V0U3ltYm9sU2l6ZSA9IHJlcXVpcmUoJy4vdXRpbHMnKS5nZXRTeW1ib2xTaXplXHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlIHRoZSByb3cvY29sdW1uIGNvb3JkaW5hdGVzIG9mIHRoZSBjZW50ZXIgbW9kdWxlIG9mIGVhY2ggYWxpZ25tZW50IHBhdHRlcm5cclxuICogZm9yIHRoZSBzcGVjaWZpZWQgUVIgQ29kZSB2ZXJzaW9uLlxyXG4gKlxyXG4gKiBUaGUgYWxpZ25tZW50IHBhdHRlcm5zIGFyZSBwb3NpdGlvbmVkIHN5bW1ldHJpY2FsbHkgb24gZWl0aGVyIHNpZGUgb2YgdGhlIGRpYWdvbmFsXHJcbiAqIHJ1bm5pbmcgZnJvbSB0aGUgdG9wIGxlZnQgY29ybmVyIG9mIHRoZSBzeW1ib2wgdG8gdGhlIGJvdHRvbSByaWdodCBjb3JuZXIuXHJcbiAqXHJcbiAqIFNpbmNlIHBvc2l0aW9ucyBhcmUgc2ltbWV0cmljYWwgb25seSBoYWxmIG9mIHRoZSBjb29yZGluYXRlcyBhcmUgcmV0dXJuZWQuXHJcbiAqIEVhY2ggaXRlbSBvZiB0aGUgYXJyYXkgd2lsbCByZXByZXNlbnQgaW4gdHVybiB0aGUgeCBhbmQgeSBjb29yZGluYXRlLlxyXG4gKiBAc2VlIHtAbGluayBnZXRQb3NpdGlvbnN9XHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cclxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIGNvb3JkaW5hdGVcclxuICovXHJcbmV4cG9ydHMuZ2V0Um93Q29sQ29vcmRzID0gZnVuY3Rpb24gZ2V0Um93Q29sQ29vcmRzICh2ZXJzaW9uKSB7XHJcbiAgaWYgKHZlcnNpb24gPT09IDEpIHJldHVybiBbXVxyXG5cclxuICBjb25zdCBwb3NDb3VudCA9IE1hdGguZmxvb3IodmVyc2lvbiAvIDcpICsgMlxyXG4gIGNvbnN0IHNpemUgPSBnZXRTeW1ib2xTaXplKHZlcnNpb24pXHJcbiAgY29uc3QgaW50ZXJ2YWxzID0gc2l6ZSA9PT0gMTQ1ID8gMjYgOiBNYXRoLmNlaWwoKHNpemUgLSAxMykgLyAoMiAqIHBvc0NvdW50IC0gMikpICogMlxyXG4gIGNvbnN0IHBvc2l0aW9ucyA9IFtzaXplIC0gN10gLy8gTGFzdCBjb29yZCBpcyBhbHdheXMgKHNpemUgLSA3KVxyXG5cclxuICBmb3IgKGxldCBpID0gMTsgaSA8IHBvc0NvdW50IC0gMTsgaSsrKSB7XHJcbiAgICBwb3NpdGlvbnNbaV0gPSBwb3NpdGlvbnNbaSAtIDFdIC0gaW50ZXJ2YWxzXHJcbiAgfVxyXG5cclxuICBwb3NpdGlvbnMucHVzaCg2KSAvLyBGaXJzdCBjb29yZCBpcyBhbHdheXMgNlxyXG5cclxuICByZXR1cm4gcG9zaXRpb25zLnJldmVyc2UoKVxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBwb3NpdGlvbnMgb2YgZWFjaCBhbGlnbm1lbnQgcGF0dGVybi5cclxuICogRWFjaCBhcnJheSdzIGVsZW1lbnQgcmVwcmVzZW50IHRoZSBjZW50ZXIgcG9pbnQgb2YgdGhlIHBhdHRlcm4gYXMgKHgsIHkpIGNvb3JkaW5hdGVzXHJcbiAqXHJcbiAqIENvb3JkaW5hdGVzIGFyZSBjYWxjdWxhdGVkIGV4cGFuZGluZyB0aGUgcm93L2NvbHVtbiBjb29yZGluYXRlcyByZXR1cm5lZCBieSB7QGxpbmsgZ2V0Um93Q29sQ29vcmRzfVxyXG4gKiBhbmQgZmlsdGVyaW5nIG91dCB0aGUgaXRlbXMgdGhhdCBvdmVybGFwcyB3aXRoIGZpbmRlciBwYXR0ZXJuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIEZvciBhIFZlcnNpb24gNyBzeW1ib2wge0BsaW5rIGdldFJvd0NvbENvb3Jkc30gcmV0dXJucyB2YWx1ZXMgNiwgMjIgYW5kIDM4LlxyXG4gKiBUaGUgYWxpZ25tZW50IHBhdHRlcm5zLCB0aGVyZWZvcmUsIGFyZSB0byBiZSBjZW50ZXJlZCBvbiAocm93LCBjb2x1bW4pXHJcbiAqIHBvc2l0aW9ucyAoNiwyMiksICgyMiw2KSwgKDIyLDIyKSwgKDIyLDM4KSwgKDM4LDIyKSwgKDM4LDM4KS5cclxuICogTm90ZSB0aGF0IHRoZSBjb29yZGluYXRlcyAoNiw2KSwgKDYsMzgpLCAoMzgsNikgYXJlIG9jY3VwaWVkIGJ5IGZpbmRlciBwYXR0ZXJuc1xyXG4gKiBhbmQgYXJlIG5vdCB0aGVyZWZvcmUgdXNlZCBmb3IgYWxpZ25tZW50IHBhdHRlcm5zLlxyXG4gKlxyXG4gKiBsZXQgcG9zID0gZ2V0UG9zaXRpb25zKDcpXHJcbiAqIC8vIFtbNiwyMl0sIFsyMiw2XSwgWzIyLDIyXSwgWzIyLDM4XSwgWzM4LDIyXSwgWzM4LDM4XV1cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgQXJyYXkgb2YgY29vcmRpbmF0ZXNcclxuICovXHJcbmV4cG9ydHMuZ2V0UG9zaXRpb25zID0gZnVuY3Rpb24gZ2V0UG9zaXRpb25zICh2ZXJzaW9uKSB7XHJcbiAgY29uc3QgY29vcmRzID0gW11cclxuICBjb25zdCBwb3MgPSBleHBvcnRzLmdldFJvd0NvbENvb3Jkcyh2ZXJzaW9uKVxyXG4gIGNvbnN0IHBvc0xlbmd0aCA9IHBvcy5sZW5ndGhcclxuXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3NMZW5ndGg7IGkrKykge1xyXG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NMZW5ndGg7IGorKykge1xyXG4gICAgICAvLyBTa2lwIGlmIHBvc2l0aW9uIGlzIG9jY3VwaWVkIGJ5IGZpbmRlciBwYXR0ZXJuc1xyXG4gICAgICBpZiAoKGkgPT09IDAgJiYgaiA9PT0gMCkgfHwgLy8gdG9wLWxlZnRcclxuICAgICAgICAgIChpID09PSAwICYmIGogPT09IHBvc0xlbmd0aCAtIDEpIHx8IC8vIGJvdHRvbS1sZWZ0XHJcbiAgICAgICAgICAoaSA9PT0gcG9zTGVuZ3RoIC0gMSAmJiBqID09PSAwKSkgeyAvLyB0b3AtcmlnaHRcclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb29yZHMucHVzaChbcG9zW2ldLCBwb3Nbal1dKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGNvb3Jkc1xyXG59XHJcbiIsImNvbnN0IGdldFN5bWJvbFNpemUgPSByZXF1aXJlKCcuL3V0aWxzJykuZ2V0U3ltYm9sU2l6ZVxyXG5jb25zdCBGSU5ERVJfUEFUVEVSTl9TSVpFID0gN1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgcG9zaXRpb25zIG9mIGVhY2ggZmluZGVyIHBhdHRlcm4uXHJcbiAqIEVhY2ggYXJyYXkncyBlbGVtZW50IHJlcHJlc2VudCB0aGUgdG9wLWxlZnQgcG9pbnQgb2YgdGhlIHBhdHRlcm4gYXMgKHgsIHkpIGNvb3JkaW5hdGVzXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cclxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIGNvb3JkaW5hdGVzXHJcbiAqL1xyXG5leHBvcnRzLmdldFBvc2l0aW9ucyA9IGZ1bmN0aW9uIGdldFBvc2l0aW9ucyAodmVyc2lvbikge1xyXG4gIGNvbnN0IHNpemUgPSBnZXRTeW1ib2xTaXplKHZlcnNpb24pXHJcblxyXG4gIHJldHVybiBbXHJcbiAgICAvLyB0b3AtbGVmdFxyXG4gICAgWzAsIDBdLFxyXG4gICAgLy8gdG9wLXJpZ2h0XHJcbiAgICBbc2l6ZSAtIEZJTkRFUl9QQVRURVJOX1NJWkUsIDBdLFxyXG4gICAgLy8gYm90dG9tLWxlZnRcclxuICAgIFswLCBzaXplIC0gRklOREVSX1BBVFRFUk5fU0laRV1cclxuICBdXHJcbn1cclxuIiwiLyoqXHJcbiAqIERhdGEgbWFzayBwYXR0ZXJuIHJlZmVyZW5jZVxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0cy5QYXR0ZXJucyA9IHtcclxuICBQQVRURVJOMDAwOiAwLFxyXG4gIFBBVFRFUk4wMDE6IDEsXHJcbiAgUEFUVEVSTjAxMDogMixcclxuICBQQVRURVJOMDExOiAzLFxyXG4gIFBBVFRFUk4xMDA6IDQsXHJcbiAgUEFUVEVSTjEwMTogNSxcclxuICBQQVRURVJOMTEwOiA2LFxyXG4gIFBBVFRFUk4xMTE6IDdcclxufVxyXG5cclxuLyoqXHJcbiAqIFdlaWdodGVkIHBlbmFsdHkgc2NvcmVzIGZvciB0aGUgdW5kZXNpcmFibGUgZmVhdHVyZXNcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbmNvbnN0IFBlbmFsdHlTY29yZXMgPSB7XHJcbiAgTjE6IDMsXHJcbiAgTjI6IDMsXHJcbiAgTjM6IDQwLFxyXG4gIE40OiAxMFxyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2sgaWYgbWFzayBwYXR0ZXJuIHZhbHVlIGlzIHZhbGlkXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gIG1hc2sgICAgTWFzayBwYXR0ZXJuXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgdHJ1ZSBpZiB2YWxpZCwgZmFsc2Ugb3RoZXJ3aXNlXHJcbiAqL1xyXG5leHBvcnRzLmlzVmFsaWQgPSBmdW5jdGlvbiBpc1ZhbGlkIChtYXNrKSB7XHJcbiAgcmV0dXJuIG1hc2sgIT0gbnVsbCAmJiBtYXNrICE9PSAnJyAmJiAhaXNOYU4obWFzaykgJiYgbWFzayA+PSAwICYmIG1hc2sgPD0gN1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBtYXNrIHBhdHRlcm4gZnJvbSBhIHZhbHVlLlxyXG4gKiBJZiB2YWx1ZSBpcyBub3QgdmFsaWQsIHJldHVybnMgdW5kZWZpbmVkXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcnxTdHJpbmd9IHZhbHVlICAgICAgICBNYXNrIHBhdHRlcm4gdmFsdWVcclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgIFZhbGlkIG1hc2sgcGF0dGVybiBvciB1bmRlZmluZWRcclxuICovXHJcbmV4cG9ydHMuZnJvbSA9IGZ1bmN0aW9uIGZyb20gKHZhbHVlKSB7XHJcbiAgcmV0dXJuIGV4cG9ydHMuaXNWYWxpZCh2YWx1ZSkgPyBwYXJzZUludCh2YWx1ZSwgMTApIDogdW5kZWZpbmVkXHJcbn1cclxuXHJcbi8qKlxyXG4qIEZpbmQgYWRqYWNlbnQgbW9kdWxlcyBpbiByb3cvY29sdW1uIHdpdGggdGhlIHNhbWUgY29sb3JcclxuKiBhbmQgYXNzaWduIGEgcGVuYWx0eSB2YWx1ZS5cclxuKlxyXG4qIFBvaW50czogTjEgKyBpXHJcbiogaSBpcyB0aGUgYW1vdW50IGJ5IHdoaWNoIHRoZSBudW1iZXIgb2YgYWRqYWNlbnQgbW9kdWxlcyBvZiB0aGUgc2FtZSBjb2xvciBleGNlZWRzIDVcclxuKi9cclxuZXhwb3J0cy5nZXRQZW5hbHR5TjEgPSBmdW5jdGlvbiBnZXRQZW5hbHR5TjEgKGRhdGEpIHtcclxuICBjb25zdCBzaXplID0gZGF0YS5zaXplXHJcbiAgbGV0IHBvaW50cyA9IDBcclxuICBsZXQgc2FtZUNvdW50Q29sID0gMFxyXG4gIGxldCBzYW1lQ291bnRSb3cgPSAwXHJcbiAgbGV0IGxhc3RDb2wgPSBudWxsXHJcbiAgbGV0IGxhc3RSb3cgPSBudWxsXHJcblxyXG4gIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHNpemU7IHJvdysrKSB7XHJcbiAgICBzYW1lQ291bnRDb2wgPSBzYW1lQ291bnRSb3cgPSAwXHJcbiAgICBsYXN0Q29sID0gbGFzdFJvdyA9IG51bGxcclxuXHJcbiAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBzaXplOyBjb2wrKykge1xyXG4gICAgICBsZXQgbW9kdWxlID0gZGF0YS5nZXQocm93LCBjb2wpXHJcbiAgICAgIGlmIChtb2R1bGUgPT09IGxhc3RDb2wpIHtcclxuICAgICAgICBzYW1lQ291bnRDb2wrK1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChzYW1lQ291bnRDb2wgPj0gNSkgcG9pbnRzICs9IFBlbmFsdHlTY29yZXMuTjEgKyAoc2FtZUNvdW50Q29sIC0gNSlcclxuICAgICAgICBsYXN0Q29sID0gbW9kdWxlXHJcbiAgICAgICAgc2FtZUNvdW50Q29sID0gMVxyXG4gICAgICB9XHJcblxyXG4gICAgICBtb2R1bGUgPSBkYXRhLmdldChjb2wsIHJvdylcclxuICAgICAgaWYgKG1vZHVsZSA9PT0gbGFzdFJvdykge1xyXG4gICAgICAgIHNhbWVDb3VudFJvdysrXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKHNhbWVDb3VudFJvdyA+PSA1KSBwb2ludHMgKz0gUGVuYWx0eVNjb3Jlcy5OMSArIChzYW1lQ291bnRSb3cgLSA1KVxyXG4gICAgICAgIGxhc3RSb3cgPSBtb2R1bGVcclxuICAgICAgICBzYW1lQ291bnRSb3cgPSAxXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2FtZUNvdW50Q29sID49IDUpIHBvaW50cyArPSBQZW5hbHR5U2NvcmVzLk4xICsgKHNhbWVDb3VudENvbCAtIDUpXHJcbiAgICBpZiAoc2FtZUNvdW50Um93ID49IDUpIHBvaW50cyArPSBQZW5hbHR5U2NvcmVzLk4xICsgKHNhbWVDb3VudFJvdyAtIDUpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gcG9pbnRzXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGaW5kIDJ4MiBibG9ja3Mgd2l0aCB0aGUgc2FtZSBjb2xvciBhbmQgYXNzaWduIGEgcGVuYWx0eSB2YWx1ZVxyXG4gKlxyXG4gKiBQb2ludHM6IE4yICogKG0gLSAxKSAqIChuIC0gMSlcclxuICovXHJcbmV4cG9ydHMuZ2V0UGVuYWx0eU4yID0gZnVuY3Rpb24gZ2V0UGVuYWx0eU4yIChkYXRhKSB7XHJcbiAgY29uc3Qgc2l6ZSA9IGRhdGEuc2l6ZVxyXG4gIGxldCBwb2ludHMgPSAwXHJcblxyXG4gIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHNpemUgLSAxOyByb3crKykge1xyXG4gICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgc2l6ZSAtIDE7IGNvbCsrKSB7XHJcbiAgICAgIGNvbnN0IGxhc3QgPSBkYXRhLmdldChyb3csIGNvbCkgK1xyXG4gICAgICAgIGRhdGEuZ2V0KHJvdywgY29sICsgMSkgK1xyXG4gICAgICAgIGRhdGEuZ2V0KHJvdyArIDEsIGNvbCkgK1xyXG4gICAgICAgIGRhdGEuZ2V0KHJvdyArIDEsIGNvbCArIDEpXHJcblxyXG4gICAgICBpZiAobGFzdCA9PT0gNCB8fCBsYXN0ID09PSAwKSBwb2ludHMrK1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHBvaW50cyAqIFBlbmFsdHlTY29yZXMuTjJcclxufVxyXG5cclxuLyoqXHJcbiAqIEZpbmQgMToxOjM6MToxIHJhdGlvIChkYXJrOmxpZ2h0OmRhcms6bGlnaHQ6ZGFyaykgcGF0dGVybiBpbiByb3cvY29sdW1uLFxyXG4gKiBwcmVjZWRlZCBvciBmb2xsb3dlZCBieSBsaWdodCBhcmVhIDQgbW9kdWxlcyB3aWRlXHJcbiAqXHJcbiAqIFBvaW50czogTjMgKiBudW1iZXIgb2YgcGF0dGVybiBmb3VuZFxyXG4gKi9cclxuZXhwb3J0cy5nZXRQZW5hbHR5TjMgPSBmdW5jdGlvbiBnZXRQZW5hbHR5TjMgKGRhdGEpIHtcclxuICBjb25zdCBzaXplID0gZGF0YS5zaXplXHJcbiAgbGV0IHBvaW50cyA9IDBcclxuICBsZXQgYml0c0NvbCA9IDBcclxuICBsZXQgYml0c1JvdyA9IDBcclxuXHJcbiAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgc2l6ZTsgcm93KyspIHtcclxuICAgIGJpdHNDb2wgPSBiaXRzUm93ID0gMFxyXG4gICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgc2l6ZTsgY29sKyspIHtcclxuICAgICAgYml0c0NvbCA9ICgoYml0c0NvbCA8PCAxKSAmIDB4N0ZGKSB8IGRhdGEuZ2V0KHJvdywgY29sKVxyXG4gICAgICBpZiAoY29sID49IDEwICYmIChiaXRzQ29sID09PSAweDVEMCB8fCBiaXRzQ29sID09PSAweDA1RCkpIHBvaW50cysrXHJcblxyXG4gICAgICBiaXRzUm93ID0gKChiaXRzUm93IDw8IDEpICYgMHg3RkYpIHwgZGF0YS5nZXQoY29sLCByb3cpXHJcbiAgICAgIGlmIChjb2wgPj0gMTAgJiYgKGJpdHNSb3cgPT09IDB4NUQwIHx8IGJpdHNSb3cgPT09IDB4MDVEKSkgcG9pbnRzKytcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBwb2ludHMgKiBQZW5hbHR5U2NvcmVzLk4zXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGUgcHJvcG9ydGlvbiBvZiBkYXJrIG1vZHVsZXMgaW4gZW50aXJlIHN5bWJvbFxyXG4gKlxyXG4gKiBQb2ludHM6IE40ICoga1xyXG4gKlxyXG4gKiBrIGlzIHRoZSByYXRpbmcgb2YgdGhlIGRldmlhdGlvbiBvZiB0aGUgcHJvcG9ydGlvbiBvZiBkYXJrIG1vZHVsZXNcclxuICogaW4gdGhlIHN5bWJvbCBmcm9tIDUwJSBpbiBzdGVwcyBvZiA1JVxyXG4gKi9cclxuZXhwb3J0cy5nZXRQZW5hbHR5TjQgPSBmdW5jdGlvbiBnZXRQZW5hbHR5TjQgKGRhdGEpIHtcclxuICBsZXQgZGFya0NvdW50ID0gMFxyXG4gIGNvbnN0IG1vZHVsZXNDb3VudCA9IGRhdGEuZGF0YS5sZW5ndGhcclxuXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBtb2R1bGVzQ291bnQ7IGkrKykgZGFya0NvdW50ICs9IGRhdGEuZGF0YVtpXVxyXG5cclxuICBjb25zdCBrID0gTWF0aC5hYnMoTWF0aC5jZWlsKChkYXJrQ291bnQgKiAxMDAgLyBtb2R1bGVzQ291bnQpIC8gNSkgLSAxMClcclxuXHJcbiAgcmV0dXJuIGsgKiBQZW5hbHR5U2NvcmVzLk40XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm4gbWFzayB2YWx1ZSBhdCBnaXZlbiBwb3NpdGlvblxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG1hc2tQYXR0ZXJuIFBhdHRlcm4gcmVmZXJlbmNlIHZhbHVlXHJcbiAqIEBwYXJhbSAge051bWJlcn0gaSAgICAgICAgICAgUm93XHJcbiAqIEBwYXJhbSAge051bWJlcn0gaiAgICAgICAgICAgQ29sdW1uXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgICAgTWFzayB2YWx1ZVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0TWFza0F0IChtYXNrUGF0dGVybiwgaSwgaikge1xyXG4gIHN3aXRjaCAobWFza1BhdHRlcm4pIHtcclxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDAwOiByZXR1cm4gKGkgKyBqKSAlIDIgPT09IDBcclxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDAxOiByZXR1cm4gaSAlIDIgPT09IDBcclxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDEwOiByZXR1cm4gaiAlIDMgPT09IDBcclxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDExOiByZXR1cm4gKGkgKyBqKSAlIDMgPT09IDBcclxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMTAwOiByZXR1cm4gKE1hdGguZmxvb3IoaSAvIDIpICsgTWF0aC5mbG9vcihqIC8gMykpICUgMiA9PT0gMFxyXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4xMDE6IHJldHVybiAoaSAqIGopICUgMiArIChpICogaikgJSAzID09PSAwXHJcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjExMDogcmV0dXJuICgoaSAqIGopICUgMiArIChpICogaikgJSAzKSAlIDIgPT09IDBcclxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMTExOiByZXR1cm4gKChpICogaikgJSAzICsgKGkgKyBqKSAlIDIpICUgMiA9PT0gMFxyXG5cclxuICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcignYmFkIG1hc2tQYXR0ZXJuOicgKyBtYXNrUGF0dGVybilcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBcHBseSBhIG1hc2sgcGF0dGVybiB0byBhIEJpdE1hdHJpeFxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgIHBhdHRlcm4gUGF0dGVybiByZWZlcmVuY2UgbnVtYmVyXHJcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gZGF0YSAgICBCaXRNYXRyaXggZGF0YVxyXG4gKi9cclxuZXhwb3J0cy5hcHBseU1hc2sgPSBmdW5jdGlvbiBhcHBseU1hc2sgKHBhdHRlcm4sIGRhdGEpIHtcclxuICBjb25zdCBzaXplID0gZGF0YS5zaXplXHJcblxyXG4gIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IHNpemU7IGNvbCsrKSB7XHJcbiAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBzaXplOyByb3crKykge1xyXG4gICAgICBpZiAoZGF0YS5pc1Jlc2VydmVkKHJvdywgY29sKSkgY29udGludWVcclxuICAgICAgZGF0YS54b3Iocm93LCBjb2wsIGdldE1hc2tBdChwYXR0ZXJuLCByb3csIGNvbCkpXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgYmVzdCBtYXNrIHBhdHRlcm4gZm9yIGRhdGFcclxuICpcclxuICogQHBhcmFtICB7Qml0TWF0cml4fSBkYXRhXHJcbiAqIEByZXR1cm4ge051bWJlcn0gTWFzayBwYXR0ZXJuIHJlZmVyZW5jZSBudW1iZXJcclxuICovXHJcbmV4cG9ydHMuZ2V0QmVzdE1hc2sgPSBmdW5jdGlvbiBnZXRCZXN0TWFzayAoZGF0YSwgc2V0dXBGb3JtYXRGdW5jKSB7XHJcbiAgY29uc3QgbnVtUGF0dGVybnMgPSBPYmplY3Qua2V5cyhleHBvcnRzLlBhdHRlcm5zKS5sZW5ndGhcclxuICBsZXQgYmVzdFBhdHRlcm4gPSAwXHJcbiAgbGV0IGxvd2VyUGVuYWx0eSA9IEluZmluaXR5XHJcblxyXG4gIGZvciAobGV0IHAgPSAwOyBwIDwgbnVtUGF0dGVybnM7IHArKykge1xyXG4gICAgc2V0dXBGb3JtYXRGdW5jKHApXHJcbiAgICBleHBvcnRzLmFwcGx5TWFzayhwLCBkYXRhKVxyXG5cclxuICAgIC8vIENhbGN1bGF0ZSBwZW5hbHR5XHJcbiAgICBjb25zdCBwZW5hbHR5ID1cclxuICAgICAgZXhwb3J0cy5nZXRQZW5hbHR5TjEoZGF0YSkgK1xyXG4gICAgICBleHBvcnRzLmdldFBlbmFsdHlOMihkYXRhKSArXHJcbiAgICAgIGV4cG9ydHMuZ2V0UGVuYWx0eU4zKGRhdGEpICtcclxuICAgICAgZXhwb3J0cy5nZXRQZW5hbHR5TjQoZGF0YSlcclxuXHJcbiAgICAvLyBVbmRvIHByZXZpb3VzbHkgYXBwbGllZCBtYXNrXHJcbiAgICBleHBvcnRzLmFwcGx5TWFzayhwLCBkYXRhKVxyXG5cclxuICAgIGlmIChwZW5hbHR5IDwgbG93ZXJQZW5hbHR5KSB7XHJcbiAgICAgIGxvd2VyUGVuYWx0eSA9IHBlbmFsdHlcclxuICAgICAgYmVzdFBhdHRlcm4gPSBwXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYmVzdFBhdHRlcm5cclxufVxyXG4iLCJjb25zdCBFQ0xldmVsID0gcmVxdWlyZSgnLi9lcnJvci1jb3JyZWN0aW9uLWxldmVsJylcclxuXHJcbmNvbnN0IEVDX0JMT0NLU19UQUJMRSA9IFtcclxuLy8gTCAgTSAgUSAgSFxyXG4gIDEsIDEsIDEsIDEsXHJcbiAgMSwgMSwgMSwgMSxcclxuICAxLCAxLCAyLCAyLFxyXG4gIDEsIDIsIDIsIDQsXHJcbiAgMSwgMiwgNCwgNCxcclxuICAyLCA0LCA0LCA0LFxyXG4gIDIsIDQsIDYsIDUsXHJcbiAgMiwgNCwgNiwgNixcclxuICAyLCA1LCA4LCA4LFxyXG4gIDQsIDUsIDgsIDgsXHJcbiAgNCwgNSwgOCwgMTEsXHJcbiAgNCwgOCwgMTAsIDExLFxyXG4gIDQsIDksIDEyLCAxNixcclxuICA0LCA5LCAxNiwgMTYsXHJcbiAgNiwgMTAsIDEyLCAxOCxcclxuICA2LCAxMCwgMTcsIDE2LFxyXG4gIDYsIDExLCAxNiwgMTksXHJcbiAgNiwgMTMsIDE4LCAyMSxcclxuICA3LCAxNCwgMjEsIDI1LFxyXG4gIDgsIDE2LCAyMCwgMjUsXHJcbiAgOCwgMTcsIDIzLCAyNSxcclxuICA5LCAxNywgMjMsIDM0LFxyXG4gIDksIDE4LCAyNSwgMzAsXHJcbiAgMTAsIDIwLCAyNywgMzIsXHJcbiAgMTIsIDIxLCAyOSwgMzUsXHJcbiAgMTIsIDIzLCAzNCwgMzcsXHJcbiAgMTIsIDI1LCAzNCwgNDAsXHJcbiAgMTMsIDI2LCAzNSwgNDIsXHJcbiAgMTQsIDI4LCAzOCwgNDUsXHJcbiAgMTUsIDI5LCA0MCwgNDgsXHJcbiAgMTYsIDMxLCA0MywgNTEsXHJcbiAgMTcsIDMzLCA0NSwgNTQsXHJcbiAgMTgsIDM1LCA0OCwgNTcsXHJcbiAgMTksIDM3LCA1MSwgNjAsXHJcbiAgMTksIDM4LCA1MywgNjMsXHJcbiAgMjAsIDQwLCA1NiwgNjYsXHJcbiAgMjEsIDQzLCA1OSwgNzAsXHJcbiAgMjIsIDQ1LCA2MiwgNzQsXHJcbiAgMjQsIDQ3LCA2NSwgNzcsXHJcbiAgMjUsIDQ5LCA2OCwgODFcclxuXVxyXG5cclxuY29uc3QgRUNfQ09ERVdPUkRTX1RBQkxFID0gW1xyXG4vLyBMICBNICBRICBIXHJcbiAgNywgMTAsIDEzLCAxNyxcclxuICAxMCwgMTYsIDIyLCAyOCxcclxuICAxNSwgMjYsIDM2LCA0NCxcclxuICAyMCwgMzYsIDUyLCA2NCxcclxuICAyNiwgNDgsIDcyLCA4OCxcclxuICAzNiwgNjQsIDk2LCAxMTIsXHJcbiAgNDAsIDcyLCAxMDgsIDEzMCxcclxuICA0OCwgODgsIDEzMiwgMTU2LFxyXG4gIDYwLCAxMTAsIDE2MCwgMTkyLFxyXG4gIDcyLCAxMzAsIDE5MiwgMjI0LFxyXG4gIDgwLCAxNTAsIDIyNCwgMjY0LFxyXG4gIDk2LCAxNzYsIDI2MCwgMzA4LFxyXG4gIDEwNCwgMTk4LCAyODgsIDM1MixcclxuICAxMjAsIDIxNiwgMzIwLCAzODQsXHJcbiAgMTMyLCAyNDAsIDM2MCwgNDMyLFxyXG4gIDE0NCwgMjgwLCA0MDgsIDQ4MCxcclxuICAxNjgsIDMwOCwgNDQ4LCA1MzIsXHJcbiAgMTgwLCAzMzgsIDUwNCwgNTg4LFxyXG4gIDE5NiwgMzY0LCA1NDYsIDY1MCxcclxuICAyMjQsIDQxNiwgNjAwLCA3MDAsXHJcbiAgMjI0LCA0NDIsIDY0NCwgNzUwLFxyXG4gIDI1MiwgNDc2LCA2OTAsIDgxNixcclxuICAyNzAsIDUwNCwgNzUwLCA5MDAsXHJcbiAgMzAwLCA1NjAsIDgxMCwgOTYwLFxyXG4gIDMxMiwgNTg4LCA4NzAsIDEwNTAsXHJcbiAgMzM2LCA2NDQsIDk1MiwgMTExMCxcclxuICAzNjAsIDcwMCwgMTAyMCwgMTIwMCxcclxuICAzOTAsIDcyOCwgMTA1MCwgMTI2MCxcclxuICA0MjAsIDc4NCwgMTE0MCwgMTM1MCxcclxuICA0NTAsIDgxMiwgMTIwMCwgMTQ0MCxcclxuICA0ODAsIDg2OCwgMTI5MCwgMTUzMCxcclxuICA1MTAsIDkyNCwgMTM1MCwgMTYyMCxcclxuICA1NDAsIDk4MCwgMTQ0MCwgMTcxMCxcclxuICA1NzAsIDEwMzYsIDE1MzAsIDE4MDAsXHJcbiAgNTcwLCAxMDY0LCAxNTkwLCAxODkwLFxyXG4gIDYwMCwgMTEyMCwgMTY4MCwgMTk4MCxcclxuICA2MzAsIDEyMDQsIDE3NzAsIDIxMDAsXHJcbiAgNjYwLCAxMjYwLCAxODYwLCAyMjIwLFxyXG4gIDcyMCwgMTMxNiwgMTk1MCwgMjMxMCxcclxuICA3NTAsIDEzNzIsIDIwNDAsIDI0MzBcclxuXVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGJsb2NrIHRoYXQgdGhlIFFSIENvZGUgc2hvdWxkIGNvbnRhaW5cclxuICogZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBhbmQgZXJyb3IgY29ycmVjdGlvbiBsZXZlbC5cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cclxuICogQHBhcmFtICB7TnVtYmVyfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICAgTnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gYmxvY2tzXHJcbiAqL1xyXG5leHBvcnRzLmdldEJsb2Nrc0NvdW50ID0gZnVuY3Rpb24gZ2V0QmxvY2tzQ291bnQgKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgc3dpdGNoIChlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gICAgY2FzZSBFQ0xldmVsLkw6XHJcbiAgICAgIHJldHVybiBFQ19CTE9DS1NfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAwXVxyXG4gICAgY2FzZSBFQ0xldmVsLk06XHJcbiAgICAgIHJldHVybiBFQ19CTE9DS1NfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAxXVxyXG4gICAgY2FzZSBFQ0xldmVsLlE6XHJcbiAgICAgIHJldHVybiBFQ19CTE9DS1NfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAyXVxyXG4gICAgY2FzZSBFQ0xldmVsLkg6XHJcbiAgICAgIHJldHVybiBFQ19CTE9DS1NfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAzXVxyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3JkcyB0byB1c2UgZm9yIHRoZSBzcGVjaWZpZWRcclxuICogdmVyc2lvbiBhbmQgZXJyb3IgY29ycmVjdGlvbiBsZXZlbC5cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cclxuICogQHBhcmFtICB7TnVtYmVyfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICAgTnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzXHJcbiAqL1xyXG5leHBvcnRzLmdldFRvdGFsQ29kZXdvcmRzQ291bnQgPSBmdW5jdGlvbiBnZXRUb3RhbENvZGV3b3Jkc0NvdW50ICh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gIHN3aXRjaCAoZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcclxuICAgIGNhc2UgRUNMZXZlbC5MOlxyXG4gICAgICByZXR1cm4gRUNfQ09ERVdPUkRTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMF1cclxuICAgIGNhc2UgRUNMZXZlbC5NOlxyXG4gICAgICByZXR1cm4gRUNfQ09ERVdPUkRTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMV1cclxuICAgIGNhc2UgRUNMZXZlbC5ROlxyXG4gICAgICByZXR1cm4gRUNfQ09ERVdPUkRTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMl1cclxuICAgIGNhc2UgRUNMZXZlbC5IOlxyXG4gICAgICByZXR1cm4gRUNfQ09ERVdPUkRTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgM11cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuICB9XHJcbn1cclxuIiwiY29uc3QgRVhQX1RBQkxFID0gbmV3IFVpbnQ4QXJyYXkoNTEyKVxyXG5jb25zdCBMT0dfVEFCTEUgPSBuZXcgVWludDhBcnJheSgyNTYpXHJcbi8qKlxyXG4gKiBQcmVjb21wdXRlIHRoZSBsb2cgYW5kIGFudGktbG9nIHRhYmxlcyBmb3IgZmFzdGVyIGNvbXB1dGF0aW9uIGxhdGVyXHJcbiAqXHJcbiAqIEZvciBlYWNoIHBvc3NpYmxlIHZhbHVlIGluIHRoZSBnYWxvaXMgZmllbGQgMl44LCB3ZSB3aWxsIHByZS1jb21wdXRlXHJcbiAqIHRoZSBsb2dhcml0aG0gYW5kIGFudGktbG9nYXJpdGhtIChleHBvbmVudGlhbCkgb2YgdGhpcyB2YWx1ZVxyXG4gKlxyXG4gKiByZWYge0BsaW5rIGh0dHBzOi8vZW4ud2lraXZlcnNpdHkub3JnL3dpa2kvUmVlZCVFMiU4MCU5M1NvbG9tb25fY29kZXNfZm9yX2NvZGVycyNJbnRyb2R1Y3Rpb25fdG9fbWF0aGVtYXRpY2FsX2ZpZWxkc31cclxuICovXHJcbjsoZnVuY3Rpb24gaW5pdFRhYmxlcyAoKSB7XHJcbiAgbGV0IHggPSAxXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAyNTU7IGkrKykge1xyXG4gICAgRVhQX1RBQkxFW2ldID0geFxyXG4gICAgTE9HX1RBQkxFW3hdID0gaVxyXG5cclxuICAgIHggPDw9IDEgLy8gbXVsdGlwbHkgYnkgMlxyXG5cclxuICAgIC8vIFRoZSBRUiBjb2RlIHNwZWNpZmljYXRpb24gc2F5cyB0byB1c2UgYnl0ZS13aXNlIG1vZHVsbyAxMDAwMTExMDEgYXJpdGhtZXRpYy5cclxuICAgIC8vIFRoaXMgbWVhbnMgdGhhdCB3aGVuIGEgbnVtYmVyIGlzIDI1NiBvciBsYXJnZXIsIGl0IHNob3VsZCBiZSBYT1JlZCB3aXRoIDB4MTFELlxyXG4gICAgaWYgKHggJiAweDEwMCkgeyAvLyBzaW1pbGFyIHRvIHggPj0gMjU2LCBidXQgYSBsb3QgZmFzdGVyIChiZWNhdXNlIDB4MTAwID09IDI1NilcclxuICAgICAgeCBePSAweDExRFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gT3B0aW1pemF0aW9uOiBkb3VibGUgdGhlIHNpemUgb2YgdGhlIGFudGktbG9nIHRhYmxlIHNvIHRoYXQgd2UgZG9uJ3QgbmVlZCB0byBtb2QgMjU1IHRvXHJcbiAgLy8gc3RheSBpbnNpZGUgdGhlIGJvdW5kcyAoYmVjYXVzZSB3ZSB3aWxsIG1haW5seSB1c2UgdGhpcyB0YWJsZSBmb3IgdGhlIG11bHRpcGxpY2F0aW9uIG9mXHJcbiAgLy8gdHdvIEdGIG51bWJlcnMsIG5vIG1vcmUpLlxyXG4gIC8vIEBzZWUge0BsaW5rIG11bH1cclxuICBmb3IgKGxldCBpID0gMjU1OyBpIDwgNTEyOyBpKyspIHtcclxuICAgIEVYUF9UQUJMRVtpXSA9IEVYUF9UQUJMRVtpIC0gMjU1XVxyXG4gIH1cclxufSgpKVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgbG9nIHZhbHVlIG9mIG4gaW5zaWRlIEdhbG9pcyBGaWVsZFxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG5cclxuICogQHJldHVybiB7TnVtYmVyfVxyXG4gKi9cclxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbiBsb2cgKG4pIHtcclxuICBpZiAobiA8IDEpIHRocm93IG5ldyBFcnJvcignbG9nKCcgKyBuICsgJyknKVxyXG4gIHJldHVybiBMT0dfVEFCTEVbbl1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYW50aS1sb2cgdmFsdWUgb2YgbiBpbnNpZGUgR2Fsb2lzIEZpZWxkXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gblxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XHJcbiAqL1xyXG5leHBvcnRzLmV4cCA9IGZ1bmN0aW9uIGV4cCAobikge1xyXG4gIHJldHVybiBFWFBfVEFCTEVbbl1cclxufVxyXG5cclxuLyoqXHJcbiAqIE11bHRpcGxpZXMgdHdvIG51bWJlciBpbnNpZGUgR2Fsb2lzIEZpZWxkXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0geFxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHlcclxuICogQHJldHVybiB7TnVtYmVyfVxyXG4gKi9cclxuZXhwb3J0cy5tdWwgPSBmdW5jdGlvbiBtdWwgKHgsIHkpIHtcclxuICBpZiAoeCA9PT0gMCB8fCB5ID09PSAwKSByZXR1cm4gMFxyXG5cclxuICAvLyBzaG91bGQgYmUgRVhQX1RBQkxFWyhMT0dfVEFCTEVbeF0gKyBMT0dfVEFCTEVbeV0pICUgMjU1XSBpZiBFWFBfVEFCTEUgd2Fzbid0IG92ZXJzaXplZFxyXG4gIC8vIEBzZWUge0BsaW5rIGluaXRUYWJsZXN9XHJcbiAgcmV0dXJuIEVYUF9UQUJMRVtMT0dfVEFCTEVbeF0gKyBMT0dfVEFCTEVbeV1dXHJcbn1cclxuIiwiY29uc3QgR0YgPSByZXF1aXJlKCcuL2dhbG9pcy1maWVsZCcpXHJcblxyXG4vKipcclxuICogTXVsdGlwbGllcyB0d28gcG9seW5vbWlhbHMgaW5zaWRlIEdhbG9pcyBGaWVsZFxyXG4gKlxyXG4gKiBAcGFyYW0gIHtVaW50OEFycmF5fSBwMSBQb2x5bm9taWFsXHJcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IHAyIFBvbHlub21pYWxcclxuICogQHJldHVybiB7VWludDhBcnJheX0gICAgUHJvZHVjdCBvZiBwMSBhbmQgcDJcclxuICovXHJcbmV4cG9ydHMubXVsID0gZnVuY3Rpb24gbXVsIChwMSwgcDIpIHtcclxuICBjb25zdCBjb2VmZiA9IG5ldyBVaW50OEFycmF5KHAxLmxlbmd0aCArIHAyLmxlbmd0aCAtIDEpXHJcblxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcDEubGVuZ3RoOyBpKyspIHtcclxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgcDIubGVuZ3RoOyBqKyspIHtcclxuICAgICAgY29lZmZbaSArIGpdIF49IEdGLm11bChwMVtpXSwgcDJbal0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gY29lZmZcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZSB0aGUgcmVtYWluZGVyIG9mIHBvbHlub21pYWxzIGRpdmlzaW9uXHJcbiAqXHJcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IGRpdmlkZW50IFBvbHlub21pYWxcclxuICogQHBhcmFtICB7VWludDhBcnJheX0gZGl2aXNvciAgUG9seW5vbWlhbFxyXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICAgICAgICBSZW1haW5kZXJcclxuICovXHJcbmV4cG9ydHMubW9kID0gZnVuY3Rpb24gbW9kIChkaXZpZGVudCwgZGl2aXNvcikge1xyXG4gIGxldCByZXN1bHQgPSBuZXcgVWludDhBcnJheShkaXZpZGVudClcclxuXHJcbiAgd2hpbGUgKChyZXN1bHQubGVuZ3RoIC0gZGl2aXNvci5sZW5ndGgpID49IDApIHtcclxuICAgIGNvbnN0IGNvZWZmID0gcmVzdWx0WzBdXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaXZpc29yLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHJlc3VsdFtpXSBePSBHRi5tdWwoZGl2aXNvcltpXSwgY29lZmYpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVtb3ZlIGFsbCB6ZXJvcyBmcm9tIGJ1ZmZlciBoZWFkXHJcbiAgICBsZXQgb2Zmc2V0ID0gMFxyXG4gICAgd2hpbGUgKG9mZnNldCA8IHJlc3VsdC5sZW5ndGggJiYgcmVzdWx0W29mZnNldF0gPT09IDApIG9mZnNldCsrXHJcbiAgICByZXN1bHQgPSByZXN1bHQuc2xpY2Uob2Zmc2V0KVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG4vKipcclxuICogR2VuZXJhdGUgYW4gaXJyZWR1Y2libGUgZ2VuZXJhdG9yIHBvbHlub21pYWwgb2Ygc3BlY2lmaWVkIGRlZ3JlZVxyXG4gKiAodXNlZCBieSBSZWVkLVNvbG9tb24gZW5jb2RlcilcclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSBkZWdyZWUgRGVncmVlIG9mIHRoZSBnZW5lcmF0b3IgcG9seW5vbWlhbFxyXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICBCdWZmZXIgY29udGFpbmluZyBwb2x5bm9taWFsIGNvZWZmaWNpZW50c1xyXG4gKi9cclxuZXhwb3J0cy5nZW5lcmF0ZUVDUG9seW5vbWlhbCA9IGZ1bmN0aW9uIGdlbmVyYXRlRUNQb2x5bm9taWFsIChkZWdyZWUpIHtcclxuICBsZXQgcG9seSA9IG5ldyBVaW50OEFycmF5KFsxXSlcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZ3JlZTsgaSsrKSB7XHJcbiAgICBwb2x5ID0gZXhwb3J0cy5tdWwocG9seSwgbmV3IFVpbnQ4QXJyYXkoWzEsIEdGLmV4cChpKV0pKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHBvbHlcclxufVxyXG4iLCJjb25zdCBQb2x5bm9taWFsID0gcmVxdWlyZSgnLi9wb2x5bm9taWFsJylcclxuXHJcbmZ1bmN0aW9uIFJlZWRTb2xvbW9uRW5jb2RlciAoZGVncmVlKSB7XHJcbiAgdGhpcy5nZW5Qb2x5ID0gdW5kZWZpbmVkXHJcbiAgdGhpcy5kZWdyZWUgPSBkZWdyZWVcclxuXHJcbiAgaWYgKHRoaXMuZGVncmVlKSB0aGlzLmluaXRpYWxpemUodGhpcy5kZWdyZWUpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIHRoZSBlbmNvZGVyLlxyXG4gKiBUaGUgaW5wdXQgcGFyYW0gc2hvdWxkIGNvcnJlc3BvbmQgdG8gdGhlIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3Jkcy5cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSBkZWdyZWVcclxuICovXHJcblJlZWRTb2xvbW9uRW5jb2Rlci5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIGluaXRpYWxpemUgKGRlZ3JlZSkge1xyXG4gIC8vIGNyZWF0ZSBhbiBpcnJlZHVjaWJsZSBnZW5lcmF0b3IgcG9seW5vbWlhbFxyXG4gIHRoaXMuZGVncmVlID0gZGVncmVlXHJcbiAgdGhpcy5nZW5Qb2x5ID0gUG9seW5vbWlhbC5nZW5lcmF0ZUVDUG9seW5vbWlhbCh0aGlzLmRlZ3JlZSlcclxufVxyXG5cclxuLyoqXHJcbiAqIEVuY29kZXMgYSBjaHVuayBvZiBkYXRhXHJcbiAqXHJcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IGRhdGEgQnVmZmVyIGNvbnRhaW5pbmcgaW5wdXQgZGF0YVxyXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICAgIEJ1ZmZlciBjb250YWluaW5nIGVuY29kZWQgZGF0YVxyXG4gKi9cclxuUmVlZFNvbG9tb25FbmNvZGVyLnByb3RvdHlwZS5lbmNvZGUgPSBmdW5jdGlvbiBlbmNvZGUgKGRhdGEpIHtcclxuICBpZiAoIXRoaXMuZ2VuUG9seSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdFbmNvZGVyIG5vdCBpbml0aWFsaXplZCcpXHJcbiAgfVxyXG5cclxuICAvLyBDYWxjdWxhdGUgRUMgZm9yIHRoaXMgZGF0YSBibG9ja1xyXG4gIC8vIGV4dGVuZHMgZGF0YSBzaXplIHRvIGRhdGErZ2VuUG9seSBzaXplXHJcbiAgY29uc3QgcGFkZGVkRGF0YSA9IG5ldyBVaW50OEFycmF5KGRhdGEubGVuZ3RoICsgdGhpcy5kZWdyZWUpXHJcbiAgcGFkZGVkRGF0YS5zZXQoZGF0YSlcclxuXHJcbiAgLy8gVGhlIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzIGFyZSB0aGUgcmVtYWluZGVyIGFmdGVyIGRpdmlkaW5nIHRoZSBkYXRhIGNvZGV3b3Jkc1xyXG4gIC8vIGJ5IGEgZ2VuZXJhdG9yIHBvbHlub21pYWxcclxuICBjb25zdCByZW1haW5kZXIgPSBQb2x5bm9taWFsLm1vZChwYWRkZWREYXRhLCB0aGlzLmdlblBvbHkpXHJcblxyXG4gIC8vIHJldHVybiBFQyBkYXRhIGJsb2NrcyAobGFzdCBuIGJ5dGUsIHdoZXJlIG4gaXMgdGhlIGRlZ3JlZSBvZiBnZW5Qb2x5KVxyXG4gIC8vIElmIGNvZWZmaWNpZW50cyBudW1iZXIgaW4gcmVtYWluZGVyIGFyZSBsZXNzIHRoYW4gZ2VuUG9seSBkZWdyZWUsXHJcbiAgLy8gcGFkIHdpdGggMHMgdG8gdGhlIGxlZnQgdG8gcmVhY2ggdGhlIG5lZWRlZCBudW1iZXIgb2YgY29lZmZpY2llbnRzXHJcbiAgY29uc3Qgc3RhcnQgPSB0aGlzLmRlZ3JlZSAtIHJlbWFpbmRlci5sZW5ndGhcclxuICBpZiAoc3RhcnQgPiAwKSB7XHJcbiAgICBjb25zdCBidWZmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5kZWdyZWUpXHJcbiAgICBidWZmLnNldChyZW1haW5kZXIsIHN0YXJ0KVxyXG5cclxuICAgIHJldHVybiBidWZmXHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmVtYWluZGVyXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVlZFNvbG9tb25FbmNvZGVyXHJcbiIsIi8qKlxyXG4gKiBDaGVjayBpZiBRUiBDb2RlIHZlcnNpb24gaXMgdmFsaWRcclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSAgdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cclxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICB0cnVlIGlmIHZhbGlkIHZlcnNpb24sIGZhbHNlIG90aGVyd2lzZVxyXG4gKi9cclxuZXhwb3J0cy5pc1ZhbGlkID0gZnVuY3Rpb24gaXNWYWxpZCAodmVyc2lvbikge1xyXG4gIHJldHVybiAhaXNOYU4odmVyc2lvbikgJiYgdmVyc2lvbiA+PSAxICYmIHZlcnNpb24gPD0gNDBcclxufVxyXG4iLCJjb25zdCBudW1lcmljID0gJ1swLTldKydcclxuY29uc3QgYWxwaGFudW1lcmljID0gJ1tBLVogJCUqK1xcXFwtLi86XSsnXHJcbmxldCBrYW5qaSA9ICcoPzpbdTMwMDAtdTMwM0ZdfFt1MzA0MC11MzA5Rl18W3UzMEEwLXUzMEZGXXwnICtcclxuICAnW3VGRjAwLXVGRkVGXXxbdTRFMDAtdTlGQUZdfFt1MjYwNS11MjYwNl18W3UyMTkwLXUyMTk1XXx1MjAzQnwnICtcclxuICAnW3UyMDEwdTIwMTV1MjAxOHUyMDE5dTIwMjV1MjAyNnUyMDFDdTIwMUR1MjIyNXUyMjYwXXwnICtcclxuICAnW3UwMzkxLXUwNDUxXXxbdTAwQTd1MDBBOHUwMEIxdTAwQjR1MDBEN3UwMEY3XSkrJ1xyXG5rYW5qaSA9IGthbmppLnJlcGxhY2UoL3UvZywgJ1xcXFx1JylcclxuXHJcbmNvbnN0IGJ5dGUgPSAnKD86KD8hW0EtWjAtOSAkJSorXFxcXC0uLzpdfCcgKyBrYW5qaSArICcpKD86LnxbXFxyXFxuXSkpKydcclxuXHJcbmV4cG9ydHMuS0FOSkkgPSBuZXcgUmVnRXhwKGthbmppLCAnZycpXHJcbmV4cG9ydHMuQllURV9LQU5KSSA9IG5ldyBSZWdFeHAoJ1teQS1aMC05ICQlKitcXFxcLS4vOl0rJywgJ2cnKVxyXG5leHBvcnRzLkJZVEUgPSBuZXcgUmVnRXhwKGJ5dGUsICdnJylcclxuZXhwb3J0cy5OVU1FUklDID0gbmV3IFJlZ0V4cChudW1lcmljLCAnZycpXHJcbmV4cG9ydHMuQUxQSEFOVU1FUklDID0gbmV3IFJlZ0V4cChhbHBoYW51bWVyaWMsICdnJylcclxuXHJcbmNvbnN0IFRFU1RfS0FOSkkgPSBuZXcgUmVnRXhwKCdeJyArIGthbmppICsgJyQnKVxyXG5jb25zdCBURVNUX05VTUVSSUMgPSBuZXcgUmVnRXhwKCdeJyArIG51bWVyaWMgKyAnJCcpXHJcbmNvbnN0IFRFU1RfQUxQSEFOVU1FUklDID0gbmV3IFJlZ0V4cCgnXltBLVowLTkgJCUqK1xcXFwtLi86XSskJylcclxuXHJcbmV4cG9ydHMudGVzdEthbmppID0gZnVuY3Rpb24gdGVzdEthbmppIChzdHIpIHtcclxuICByZXR1cm4gVEVTVF9LQU5KSS50ZXN0KHN0cilcclxufVxyXG5cclxuZXhwb3J0cy50ZXN0TnVtZXJpYyA9IGZ1bmN0aW9uIHRlc3ROdW1lcmljIChzdHIpIHtcclxuICByZXR1cm4gVEVTVF9OVU1FUklDLnRlc3Qoc3RyKVxyXG59XHJcblxyXG5leHBvcnRzLnRlc3RBbHBoYW51bWVyaWMgPSBmdW5jdGlvbiB0ZXN0QWxwaGFudW1lcmljIChzdHIpIHtcclxuICByZXR1cm4gVEVTVF9BTFBIQU5VTUVSSUMudGVzdChzdHIpXHJcbn1cclxuIiwiY29uc3QgVmVyc2lvbkNoZWNrID0gcmVxdWlyZSgnLi92ZXJzaW9uLWNoZWNrJylcclxuY29uc3QgUmVnZXggPSByZXF1aXJlKCcuL3JlZ2V4JylcclxuXHJcbi8qKlxyXG4gKiBOdW1lcmljIG1vZGUgZW5jb2RlcyBkYXRhIGZyb20gdGhlIGRlY2ltYWwgZGlnaXQgc2V0ICgwIC0gOSlcclxuICogKGJ5dGUgdmFsdWVzIDMwSEVYIHRvIDM5SEVYKS5cclxuICogTm9ybWFsbHksIDMgZGF0YSBjaGFyYWN0ZXJzIGFyZSByZXByZXNlbnRlZCBieSAxMCBiaXRzLlxyXG4gKlxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0cy5OVU1FUklDID0ge1xyXG4gIGlkOiAnTnVtZXJpYycsXHJcbiAgYml0OiAxIDw8IDAsXHJcbiAgY2NCaXRzOiBbMTAsIDEyLCAxNF1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFscGhhbnVtZXJpYyBtb2RlIGVuY29kZXMgZGF0YSBmcm9tIGEgc2V0IG9mIDQ1IGNoYXJhY3RlcnMsXHJcbiAqIGkuZS4gMTAgbnVtZXJpYyBkaWdpdHMgKDAgLSA5KSxcclxuICogICAgICAyNiBhbHBoYWJldGljIGNoYXJhY3RlcnMgKEEgLSBaKSxcclxuICogICBhbmQgOSBzeW1ib2xzIChTUCwgJCwgJSwgKiwgKywgLSwgLiwgLywgOikuXHJcbiAqIE5vcm1hbGx5LCB0d28gaW5wdXQgY2hhcmFjdGVycyBhcmUgcmVwcmVzZW50ZWQgYnkgMTEgYml0cy5cclxuICpcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbmV4cG9ydHMuQUxQSEFOVU1FUklDID0ge1xyXG4gIGlkOiAnQWxwaGFudW1lcmljJyxcclxuICBiaXQ6IDEgPDwgMSxcclxuICBjY0JpdHM6IFs5LCAxMSwgMTNdXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbiBieXRlIG1vZGUsIGRhdGEgaXMgZW5jb2RlZCBhdCA4IGJpdHMgcGVyIGNoYXJhY3Rlci5cclxuICpcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbmV4cG9ydHMuQllURSA9IHtcclxuICBpZDogJ0J5dGUnLFxyXG4gIGJpdDogMSA8PCAyLFxyXG4gIGNjQml0czogWzgsIDE2LCAxNl1cclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBLYW5qaSBtb2RlIGVmZmljaWVudGx5IGVuY29kZXMgS2FuamkgY2hhcmFjdGVycyBpbiBhY2NvcmRhbmNlIHdpdGhcclxuICogdGhlIFNoaWZ0IEpJUyBzeXN0ZW0gYmFzZWQgb24gSklTIFggMDIwOC5cclxuICogVGhlIFNoaWZ0IEpJUyB2YWx1ZXMgYXJlIHNoaWZ0ZWQgZnJvbSB0aGUgSklTIFggMDIwOCB2YWx1ZXMuXHJcbiAqIEpJUyBYIDAyMDggZ2l2ZXMgZGV0YWlscyBvZiB0aGUgc2hpZnQgY29kZWQgcmVwcmVzZW50YXRpb24uXHJcbiAqIEVhY2ggdHdvLWJ5dGUgY2hhcmFjdGVyIHZhbHVlIGlzIGNvbXBhY3RlZCB0byBhIDEzLWJpdCBiaW5hcnkgY29kZXdvcmQuXHJcbiAqXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG5leHBvcnRzLktBTkpJID0ge1xyXG4gIGlkOiAnS2FuamknLFxyXG4gIGJpdDogMSA8PCAzLFxyXG4gIGNjQml0czogWzgsIDEwLCAxMl1cclxufVxyXG5cclxuLyoqXHJcbiAqIE1peGVkIG1vZGUgd2lsbCBjb250YWluIGEgc2VxdWVuY2VzIG9mIGRhdGEgaW4gYSBjb21iaW5hdGlvbiBvZiBhbnkgb2ZcclxuICogdGhlIG1vZGVzIGRlc2NyaWJlZCBhYm92ZVxyXG4gKlxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0cy5NSVhFRCA9IHtcclxuICBiaXQ6IC0xXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgYml0cyBuZWVkZWQgdG8gc3RvcmUgdGhlIGRhdGEgbGVuZ3RoXHJcbiAqIGFjY29yZGluZyB0byBRUiBDb2RlIHNwZWNpZmljYXRpb25zLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtNb2RlfSAgIG1vZGUgICAgRGF0YSBtb2RlXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgIE51bWJlciBvZiBiaXRzXHJcbiAqL1xyXG5leHBvcnRzLmdldENoYXJDb3VudEluZGljYXRvciA9IGZ1bmN0aW9uIGdldENoYXJDb3VudEluZGljYXRvciAobW9kZSwgdmVyc2lvbikge1xyXG4gIGlmICghbW9kZS5jY0JpdHMpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBtb2RlOiAnICsgbW9kZSlcclxuXHJcbiAgaWYgKCFWZXJzaW9uQ2hlY2suaXNWYWxpZCh2ZXJzaW9uKSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHZlcnNpb246ICcgKyB2ZXJzaW9uKVxyXG4gIH1cclxuXHJcbiAgaWYgKHZlcnNpb24gPj0gMSAmJiB2ZXJzaW9uIDwgMTApIHJldHVybiBtb2RlLmNjQml0c1swXVxyXG4gIGVsc2UgaWYgKHZlcnNpb24gPCAyNykgcmV0dXJuIG1vZGUuY2NCaXRzWzFdXHJcbiAgcmV0dXJuIG1vZGUuY2NCaXRzWzJdXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtb3N0IGVmZmljaWVudCBtb2RlIHRvIHN0b3JlIHRoZSBzcGVjaWZpZWQgZGF0YVxyXG4gKlxyXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGFTdHIgSW5wdXQgZGF0YSBzdHJpbmdcclxuICogQHJldHVybiB7TW9kZX0gICAgICAgICAgIEJlc3QgbW9kZVxyXG4gKi9cclxuZXhwb3J0cy5nZXRCZXN0TW9kZUZvckRhdGEgPSBmdW5jdGlvbiBnZXRCZXN0TW9kZUZvckRhdGEgKGRhdGFTdHIpIHtcclxuICBpZiAoUmVnZXgudGVzdE51bWVyaWMoZGF0YVN0cikpIHJldHVybiBleHBvcnRzLk5VTUVSSUNcclxuICBlbHNlIGlmIChSZWdleC50ZXN0QWxwaGFudW1lcmljKGRhdGFTdHIpKSByZXR1cm4gZXhwb3J0cy5BTFBIQU5VTUVSSUNcclxuICBlbHNlIGlmIChSZWdleC50ZXN0S2FuamkoZGF0YVN0cikpIHJldHVybiBleHBvcnRzLktBTkpJXHJcbiAgZWxzZSByZXR1cm4gZXhwb3J0cy5CWVRFXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm4gbW9kZSBuYW1lIGFzIHN0cmluZ1xyXG4gKlxyXG4gKiBAcGFyYW0ge01vZGV9IG1vZGUgTW9kZSBvYmplY3RcclxuICogQHJldHVybnMge1N0cmluZ30gIE1vZGUgbmFtZVxyXG4gKi9cclxuZXhwb3J0cy50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nIChtb2RlKSB7XHJcbiAgaWYgKG1vZGUgJiYgbW9kZS5pZCkgcmV0dXJuIG1vZGUuaWRcclxuICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbW9kZScpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVjayBpZiBpbnB1dCBwYXJhbSBpcyBhIHZhbGlkIG1vZGUgb2JqZWN0XHJcbiAqXHJcbiAqIEBwYXJhbSAgIHtNb2RlfSAgICBtb2RlIE1vZGUgb2JqZWN0XHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHZhbGlkIG1vZGUsIGZhbHNlIG90aGVyd2lzZVxyXG4gKi9cclxuZXhwb3J0cy5pc1ZhbGlkID0gZnVuY3Rpb24gaXNWYWxpZCAobW9kZSkge1xyXG4gIHJldHVybiBtb2RlICYmIG1vZGUuYml0ICYmIG1vZGUuY2NCaXRzXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgbW9kZSBvYmplY3QgZnJvbSBpdHMgbmFtZVxyXG4gKlxyXG4gKiBAcGFyYW0gICB7U3RyaW5nfSBzdHJpbmcgTW9kZSBuYW1lXHJcbiAqIEByZXR1cm5zIHtNb2RlfSAgICAgICAgICBNb2RlIG9iamVjdFxyXG4gKi9cclxuZnVuY3Rpb24gZnJvbVN0cmluZyAoc3RyaW5nKSB7XHJcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcmFtIGlzIG5vdCBhIHN0cmluZycpXHJcbiAgfVxyXG5cclxuICBjb25zdCBsY1N0ciA9IHN0cmluZy50b0xvd2VyQ2FzZSgpXHJcblxyXG4gIHN3aXRjaCAobGNTdHIpIHtcclxuICAgIGNhc2UgJ251bWVyaWMnOlxyXG4gICAgICByZXR1cm4gZXhwb3J0cy5OVU1FUklDXHJcbiAgICBjYXNlICdhbHBoYW51bWVyaWMnOlxyXG4gICAgICByZXR1cm4gZXhwb3J0cy5BTFBIQU5VTUVSSUNcclxuICAgIGNhc2UgJ2thbmppJzpcclxuICAgICAgcmV0dXJuIGV4cG9ydHMuS0FOSklcclxuICAgIGNhc2UgJ2J5dGUnOlxyXG4gICAgICByZXR1cm4gZXhwb3J0cy5CWVRFXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gbW9kZTogJyArIHN0cmluZylcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIG1vZGUgZnJvbSBhIHZhbHVlLlxyXG4gKiBJZiB2YWx1ZSBpcyBub3QgYSB2YWxpZCBtb2RlLCByZXR1cm5zIGRlZmF1bHRWYWx1ZVxyXG4gKlxyXG4gKiBAcGFyYW0gIHtNb2RlfFN0cmluZ30gdmFsdWUgICAgICAgIEVuY29kaW5nIG1vZGVcclxuICogQHBhcmFtICB7TW9kZX0gICAgICAgIGRlZmF1bHRWYWx1ZSBGYWxsYmFjayB2YWx1ZVxyXG4gKiBAcmV0dXJuIHtNb2RlfSAgICAgICAgICAgICAgICAgICAgIEVuY29kaW5nIG1vZGVcclxuICovXHJcbmV4cG9ydHMuZnJvbSA9IGZ1bmN0aW9uIGZyb20gKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHtcclxuICBpZiAoZXhwb3J0cy5pc1ZhbGlkKHZhbHVlKSkge1xyXG4gICAgcmV0dXJuIHZhbHVlXHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgcmV0dXJuIGZyb21TdHJpbmcodmFsdWUpXHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZVxyXG4gIH1cclxufVxyXG4iLCJjb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5jb25zdCBFQ0NvZGUgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tY29kZScpXHJcbmNvbnN0IEVDTGV2ZWwgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwnKVxyXG5jb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcclxuY29uc3QgVmVyc2lvbkNoZWNrID0gcmVxdWlyZSgnLi92ZXJzaW9uLWNoZWNrJylcclxuXHJcbi8vIEdlbmVyYXRvciBwb2x5bm9taWFsIHVzZWQgdG8gZW5jb2RlIHZlcnNpb24gaW5mb3JtYXRpb25cclxuY29uc3QgRzE4ID0gKDEgPDwgMTIpIHwgKDEgPDwgMTEpIHwgKDEgPDwgMTApIHwgKDEgPDwgOSkgfCAoMSA8PCA4KSB8ICgxIDw8IDUpIHwgKDEgPDwgMikgfCAoMSA8PCAwKVxyXG5jb25zdCBHMThfQkNIID0gVXRpbHMuZ2V0QkNIRGlnaXQoRzE4KVxyXG5cclxuZnVuY3Rpb24gZ2V0QmVzdFZlcnNpb25Gb3JEYXRhTGVuZ3RoIChtb2RlLCBsZW5ndGgsIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgZm9yIChsZXQgY3VycmVudFZlcnNpb24gPSAxOyBjdXJyZW50VmVyc2lvbiA8PSA0MDsgY3VycmVudFZlcnNpb24rKykge1xyXG4gICAgaWYgKGxlbmd0aCA8PSBleHBvcnRzLmdldENhcGFjaXR5KGN1cnJlbnRWZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbW9kZSkpIHtcclxuICAgICAgcmV0dXJuIGN1cnJlbnRWZXJzaW9uXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdW5kZWZpbmVkXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFJlc2VydmVkQml0c0NvdW50IChtb2RlLCB2ZXJzaW9uKSB7XHJcbiAgLy8gQ2hhcmFjdGVyIGNvdW50IGluZGljYXRvciArIG1vZGUgaW5kaWNhdG9yIGJpdHNcclxuICByZXR1cm4gTW9kZS5nZXRDaGFyQ291bnRJbmRpY2F0b3IobW9kZSwgdmVyc2lvbikgKyA0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFRvdGFsQml0c0Zyb21EYXRhQXJyYXkgKHNlZ21lbnRzLCB2ZXJzaW9uKSB7XHJcbiAgbGV0IHRvdGFsQml0cyA9IDBcclxuXHJcbiAgc2VnbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgY29uc3QgcmVzZXJ2ZWRCaXRzID0gZ2V0UmVzZXJ2ZWRCaXRzQ291bnQoZGF0YS5tb2RlLCB2ZXJzaW9uKVxyXG4gICAgdG90YWxCaXRzICs9IHJlc2VydmVkQml0cyArIGRhdGEuZ2V0Qml0c0xlbmd0aCgpXHJcbiAgfSlcclxuXHJcbiAgcmV0dXJuIHRvdGFsQml0c1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRCZXN0VmVyc2lvbkZvck1peGVkRGF0YSAoc2VnbWVudHMsIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgZm9yIChsZXQgY3VycmVudFZlcnNpb24gPSAxOyBjdXJyZW50VmVyc2lvbiA8PSA0MDsgY3VycmVudFZlcnNpb24rKykge1xyXG4gICAgY29uc3QgbGVuZ3RoID0gZ2V0VG90YWxCaXRzRnJvbURhdGFBcnJheShzZWdtZW50cywgY3VycmVudFZlcnNpb24pXHJcbiAgICBpZiAobGVuZ3RoIDw9IGV4cG9ydHMuZ2V0Q2FwYWNpdHkoY3VycmVudFZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBNb2RlLk1JWEVEKSkge1xyXG4gICAgICByZXR1cm4gY3VycmVudFZlcnNpb25cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB1bmRlZmluZWRcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdmVyc2lvbiBudW1iZXIgZnJvbSBhIHZhbHVlLlxyXG4gKiBJZiB2YWx1ZSBpcyBub3QgYSB2YWxpZCB2ZXJzaW9uLCByZXR1cm5zIGRlZmF1bHRWYWx1ZVxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ8U3RyaW5nfSB2YWx1ZSAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEBwYXJhbSAge051bWJlcn0gICAgICAgIGRlZmF1bHRWYWx1ZSBGYWxsYmFjayB2YWx1ZVxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uIG51bWJlclxyXG4gKi9cclxuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSAodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xyXG4gIGlmIChWZXJzaW9uQ2hlY2suaXNWYWxpZCh2YWx1ZSkpIHtcclxuICAgIHJldHVybiBwYXJzZUludCh2YWx1ZSwgMTApXHJcbiAgfVxyXG5cclxuICByZXR1cm4gZGVmYXVsdFZhbHVlXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGhvdyBtdWNoIGRhdGEgY2FuIGJlIHN0b3JlZCB3aXRoIHRoZSBzcGVjaWZpZWQgUVIgY29kZSB2ZXJzaW9uXHJcbiAqIGFuZCBlcnJvciBjb3JyZWN0aW9uIGxldmVsXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uICgxLTQwKVxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcclxuICogQHBhcmFtICB7TW9kZX0gICBtb2RlICAgICAgICAgICAgICAgICBEYXRhIG1vZGVcclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgICBRdWFudGl0eSBvZiBzdG9yYWJsZSBkYXRhXHJcbiAqL1xyXG5leHBvcnRzLmdldENhcGFjaXR5ID0gZnVuY3Rpb24gZ2V0Q2FwYWNpdHkgKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtb2RlKSB7XHJcbiAgaWYgKCFWZXJzaW9uQ2hlY2suaXNWYWxpZCh2ZXJzaW9uKSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFFSIENvZGUgdmVyc2lvbicpXHJcbiAgfVxyXG5cclxuICAvLyBVc2UgQnl0ZSBtb2RlIGFzIGRlZmF1bHRcclxuICBpZiAodHlwZW9mIG1vZGUgPT09ICd1bmRlZmluZWQnKSBtb2RlID0gTW9kZS5CWVRFXHJcblxyXG4gIC8vIFRvdGFsIGNvZGV3b3JkcyBmb3IgdGhpcyBRUiBjb2RlIHZlcnNpb24gKERhdGEgKyBFcnJvciBjb3JyZWN0aW9uKVxyXG4gIGNvbnN0IHRvdGFsQ29kZXdvcmRzID0gVXRpbHMuZ2V0U3ltYm9sVG90YWxDb2Rld29yZHModmVyc2lvbilcclxuXHJcbiAgLy8gVG90YWwgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzXHJcbiAgY29uc3QgZWNUb3RhbENvZGV3b3JkcyA9IEVDQ29kZS5nZXRUb3RhbENvZGV3b3Jkc0NvdW50KHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKVxyXG5cclxuICAvLyBUb3RhbCBudW1iZXIgb2YgZGF0YSBjb2Rld29yZHNcclxuICBjb25zdCBkYXRhVG90YWxDb2Rld29yZHNCaXRzID0gKHRvdGFsQ29kZXdvcmRzIC0gZWNUb3RhbENvZGV3b3JkcykgKiA4XHJcblxyXG4gIGlmIChtb2RlID09PSBNb2RlLk1JWEVEKSByZXR1cm4gZGF0YVRvdGFsQ29kZXdvcmRzQml0c1xyXG5cclxuICBjb25zdCB1c2FibGVCaXRzID0gZGF0YVRvdGFsQ29kZXdvcmRzQml0cyAtIGdldFJlc2VydmVkQml0c0NvdW50KG1vZGUsIHZlcnNpb24pXHJcblxyXG4gIC8vIFJldHVybiBtYXggbnVtYmVyIG9mIHN0b3JhYmxlIGNvZGV3b3Jkc1xyXG4gIHN3aXRjaCAobW9kZSkge1xyXG4gICAgY2FzZSBNb2RlLk5VTUVSSUM6XHJcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKCh1c2FibGVCaXRzIC8gMTApICogMylcclxuXHJcbiAgICBjYXNlIE1vZGUuQUxQSEFOVU1FUklDOlxyXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcigodXNhYmxlQml0cyAvIDExKSAqIDIpXHJcblxyXG4gICAgY2FzZSBNb2RlLktBTkpJOlxyXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcih1c2FibGVCaXRzIC8gMTMpXHJcblxyXG4gICAgY2FzZSBNb2RlLkJZVEU6XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcih1c2FibGVCaXRzIC8gOClcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIHZlcnNpb24gbmVlZGVkIHRvIGNvbnRhaW4gdGhlIGFtb3VudCBvZiBkYXRhXHJcbiAqXHJcbiAqIEBwYXJhbSAge1NlZ21lbnR9IGRhdGEgICAgICAgICAgICAgICAgICAgIFNlZ21lbnQgb2YgZGF0YVxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IFtlcnJvckNvcnJlY3Rpb25MZXZlbD1IXSBFcnJvciBjb3JyZWN0aW9uIGxldmVsXHJcbiAqIEBwYXJhbSAge01vZGV9IG1vZGUgICAgICAgICAgICAgICAgICAgICAgIERhdGEgbW9kZVxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cclxuICovXHJcbmV4cG9ydHMuZ2V0QmVzdFZlcnNpb25Gb3JEYXRhID0gZnVuY3Rpb24gZ2V0QmVzdFZlcnNpb25Gb3JEYXRhIChkYXRhLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gIGxldCBzZWdcclxuXHJcbiAgY29uc3QgZWNsID0gRUNMZXZlbC5mcm9tKGVycm9yQ29ycmVjdGlvbkxldmVsLCBFQ0xldmVsLk0pXHJcblxyXG4gIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XHJcbiAgICBpZiAoZGF0YS5sZW5ndGggPiAxKSB7XHJcbiAgICAgIHJldHVybiBnZXRCZXN0VmVyc2lvbkZvck1peGVkRGF0YShkYXRhLCBlY2wpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRhdGEubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHJldHVybiAxXHJcbiAgICB9XHJcblxyXG4gICAgc2VnID0gZGF0YVswXVxyXG4gIH0gZWxzZSB7XHJcbiAgICBzZWcgPSBkYXRhXHJcbiAgfVxyXG5cclxuICByZXR1cm4gZ2V0QmVzdFZlcnNpb25Gb3JEYXRhTGVuZ3RoKHNlZy5tb2RlLCBzZWcuZ2V0TGVuZ3RoKCksIGVjbClcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdmVyc2lvbiBpbmZvcm1hdGlvbiB3aXRoIHJlbGF0aXZlIGVycm9yIGNvcnJlY3Rpb24gYml0c1xyXG4gKlxyXG4gKiBUaGUgdmVyc2lvbiBpbmZvcm1hdGlvbiBpcyBpbmNsdWRlZCBpbiBRUiBDb2RlIHN5bWJvbHMgb2YgdmVyc2lvbiA3IG9yIGxhcmdlci5cclxuICogSXQgY29uc2lzdHMgb2YgYW4gMTgtYml0IHNlcXVlbmNlIGNvbnRhaW5pbmcgNiBkYXRhIGJpdHMsXHJcbiAqIHdpdGggMTIgZXJyb3IgY29ycmVjdGlvbiBiaXRzIGNhbGN1bGF0ZWQgdXNpbmcgdGhlICgxOCwgNikgR29sYXkgY29kZS5cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgRW5jb2RlZCB2ZXJzaW9uIGluZm8gYml0c1xyXG4gKi9cclxuZXhwb3J0cy5nZXRFbmNvZGVkQml0cyA9IGZ1bmN0aW9uIGdldEVuY29kZWRCaXRzICh2ZXJzaW9uKSB7XHJcbiAgaWYgKCFWZXJzaW9uQ2hlY2suaXNWYWxpZCh2ZXJzaW9uKSB8fCB2ZXJzaW9uIDwgNykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFFSIENvZGUgdmVyc2lvbicpXHJcbiAgfVxyXG5cclxuICBsZXQgZCA9IHZlcnNpb24gPDwgMTJcclxuXHJcbiAgd2hpbGUgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE4X0JDSCA+PSAwKSB7XHJcbiAgICBkIF49IChHMTggPDwgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE4X0JDSCkpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gKHZlcnNpb24gPDwgMTIpIHwgZFxyXG59XHJcbiIsImNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXHJcblxyXG5jb25zdCBHMTUgPSAoMSA8PCAxMCkgfCAoMSA8PCA4KSB8ICgxIDw8IDUpIHwgKDEgPDwgNCkgfCAoMSA8PCAyKSB8ICgxIDw8IDEpIHwgKDEgPDwgMClcclxuY29uc3QgRzE1X01BU0sgPSAoMSA8PCAxNCkgfCAoMSA8PCAxMikgfCAoMSA8PCAxMCkgfCAoMSA8PCA0KSB8ICgxIDw8IDEpXHJcbmNvbnN0IEcxNV9CQ0ggPSBVdGlscy5nZXRCQ0hEaWdpdChHMTUpXHJcblxyXG4vKipcclxuICogUmV0dXJucyBmb3JtYXQgaW5mb3JtYXRpb24gd2l0aCByZWxhdGl2ZSBlcnJvciBjb3JyZWN0aW9uIGJpdHNcclxuICpcclxuICogVGhlIGZvcm1hdCBpbmZvcm1hdGlvbiBpcyBhIDE1LWJpdCBzZXF1ZW5jZSBjb250YWluaW5nIDUgZGF0YSBiaXRzLFxyXG4gKiB3aXRoIDEwIGVycm9yIGNvcnJlY3Rpb24gYml0cyBjYWxjdWxhdGVkIHVzaW5nIHRoZSAoMTUsIDUpIEJDSCBjb2RlLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcclxuICogQHBhcmFtICB7TnVtYmVyfSBtYXNrICAgICAgICAgICAgICAgICBNYXNrIHBhdHRlcm5cclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgICBFbmNvZGVkIGZvcm1hdCBpbmZvcm1hdGlvbiBiaXRzXHJcbiAqL1xyXG5leHBvcnRzLmdldEVuY29kZWRCaXRzID0gZnVuY3Rpb24gZ2V0RW5jb2RlZEJpdHMgKGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrKSB7XHJcbiAgY29uc3QgZGF0YSA9ICgoZXJyb3JDb3JyZWN0aW9uTGV2ZWwuYml0IDw8IDMpIHwgbWFzaylcclxuICBsZXQgZCA9IGRhdGEgPDwgMTBcclxuXHJcbiAgd2hpbGUgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE1X0JDSCA+PSAwKSB7XHJcbiAgICBkIF49IChHMTUgPDwgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE1X0JDSCkpXHJcbiAgfVxyXG5cclxuICAvLyB4b3IgZmluYWwgZGF0YSB3aXRoIG1hc2sgcGF0dGVybiBpbiBvcmRlciB0byBlbnN1cmUgdGhhdFxyXG4gIC8vIG5vIGNvbWJpbmF0aW9uIG9mIEVycm9yIENvcnJlY3Rpb24gTGV2ZWwgYW5kIGRhdGEgbWFzayBwYXR0ZXJuXHJcbiAgLy8gd2lsbCByZXN1bHQgaW4gYW4gYWxsLXplcm8gZGF0YSBzdHJpbmdcclxuICByZXR1cm4gKChkYXRhIDw8IDEwKSB8IGQpIF4gRzE1X01BU0tcclxufVxyXG4iLCJjb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcclxuXHJcbmZ1bmN0aW9uIE51bWVyaWNEYXRhIChkYXRhKSB7XHJcbiAgdGhpcy5tb2RlID0gTW9kZS5OVU1FUklDXHJcbiAgdGhpcy5kYXRhID0gZGF0YS50b1N0cmluZygpXHJcbn1cclxuXHJcbk51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoIChsZW5ndGgpIHtcclxuICByZXR1cm4gMTAgKiBNYXRoLmZsb29yKGxlbmd0aCAvIDMpICsgKChsZW5ndGggJSAzKSA/ICgobGVuZ3RoICUgMykgKiAzICsgMSkgOiAwKVxyXG59XHJcblxyXG5OdW1lcmljRGF0YS5wcm90b3R5cGUuZ2V0TGVuZ3RoID0gZnVuY3Rpb24gZ2V0TGVuZ3RoICgpIHtcclxuICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aFxyXG59XHJcblxyXG5OdW1lcmljRGF0YS5wcm90b3R5cGUuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKCkge1xyXG4gIHJldHVybiBOdW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoKHRoaXMuZGF0YS5sZW5ndGgpXHJcbn1cclxuXHJcbk51bWVyaWNEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChiaXRCdWZmZXIpIHtcclxuICBsZXQgaSwgZ3JvdXAsIHZhbHVlXHJcblxyXG4gIC8vIFRoZSBpbnB1dCBkYXRhIHN0cmluZyBpcyBkaXZpZGVkIGludG8gZ3JvdXBzIG9mIHRocmVlIGRpZ2l0cyxcclxuICAvLyBhbmQgZWFjaCBncm91cCBpcyBjb252ZXJ0ZWQgdG8gaXRzIDEwLWJpdCBiaW5hcnkgZXF1aXZhbGVudC5cclxuICBmb3IgKGkgPSAwOyBpICsgMyA8PSB0aGlzLmRhdGEubGVuZ3RoOyBpICs9IDMpIHtcclxuICAgIGdyb3VwID0gdGhpcy5kYXRhLnN1YnN0cihpLCAzKVxyXG4gICAgdmFsdWUgPSBwYXJzZUludChncm91cCwgMTApXHJcblxyXG4gICAgYml0QnVmZmVyLnB1dCh2YWx1ZSwgMTApXHJcbiAgfVxyXG5cclxuICAvLyBJZiB0aGUgbnVtYmVyIG9mIGlucHV0IGRpZ2l0cyBpcyBub3QgYW4gZXhhY3QgbXVsdGlwbGUgb2YgdGhyZWUsXHJcbiAgLy8gdGhlIGZpbmFsIG9uZSBvciB0d28gZGlnaXRzIGFyZSBjb252ZXJ0ZWQgdG8gNCBvciA3IGJpdHMgcmVzcGVjdGl2ZWx5LlxyXG4gIGNvbnN0IHJlbWFpbmluZ051bSA9IHRoaXMuZGF0YS5sZW5ndGggLSBpXHJcbiAgaWYgKHJlbWFpbmluZ051bSA+IDApIHtcclxuICAgIGdyb3VwID0gdGhpcy5kYXRhLnN1YnN0cihpKVxyXG4gICAgdmFsdWUgPSBwYXJzZUludChncm91cCwgMTApXHJcblxyXG4gICAgYml0QnVmZmVyLnB1dCh2YWx1ZSwgcmVtYWluaW5nTnVtICogMyArIDEpXHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE51bWVyaWNEYXRhXHJcbiIsImNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxyXG5cclxuLyoqXHJcbiAqIEFycmF5IG9mIGNoYXJhY3RlcnMgYXZhaWxhYmxlIGluIGFscGhhbnVtZXJpYyBtb2RlXHJcbiAqXHJcbiAqIEFzIHBlciBRUiBDb2RlIHNwZWNpZmljYXRpb24sIHRvIGVhY2ggY2hhcmFjdGVyXHJcbiAqIGlzIGFzc2lnbmVkIGEgdmFsdWUgZnJvbSAwIHRvIDQ0IHdoaWNoIGluIHRoaXMgY2FzZSBjb2luY2lkZXNcclxuICogd2l0aCB0aGUgYXJyYXkgaW5kZXhcclxuICpcclxuICogQHR5cGUge0FycmF5fVxyXG4gKi9cclxuY29uc3QgQUxQSEFfTlVNX0NIQVJTID0gW1xyXG4gICcwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JyxcclxuICAnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLCAnSicsICdLJywgJ0wnLCAnTScsXHJcbiAgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onLFxyXG4gICcgJywgJyQnLCAnJScsICcqJywgJysnLCAnLScsICcuJywgJy8nLCAnOidcclxuXVxyXG5cclxuZnVuY3Rpb24gQWxwaGFudW1lcmljRGF0YSAoZGF0YSkge1xyXG4gIHRoaXMubW9kZSA9IE1vZGUuQUxQSEFOVU1FUklDXHJcbiAgdGhpcy5kYXRhID0gZGF0YVxyXG59XHJcblxyXG5BbHBoYW51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoIChsZW5ndGgpIHtcclxuICByZXR1cm4gMTEgKiBNYXRoLmZsb29yKGxlbmd0aCAvIDIpICsgNiAqIChsZW5ndGggJSAyKVxyXG59XHJcblxyXG5BbHBoYW51bWVyaWNEYXRhLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbiBnZXRMZW5ndGggKCkge1xyXG4gIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoXHJcbn1cclxuXHJcbkFscGhhbnVtZXJpY0RhdGEucHJvdG90eXBlLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoICgpIHtcclxuICByZXR1cm4gQWxwaGFudW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoKHRoaXMuZGF0YS5sZW5ndGgpXHJcbn1cclxuXHJcbkFscGhhbnVtZXJpY0RhdGEucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKGJpdEJ1ZmZlcikge1xyXG4gIGxldCBpXHJcblxyXG4gIC8vIElucHV0IGRhdGEgY2hhcmFjdGVycyBhcmUgZGl2aWRlZCBpbnRvIGdyb3VwcyBvZiB0d28gY2hhcmFjdGVyc1xyXG4gIC8vIGFuZCBlbmNvZGVkIGFzIDExLWJpdCBiaW5hcnkgY29kZXMuXHJcbiAgZm9yIChpID0gMDsgaSArIDIgPD0gdGhpcy5kYXRhLmxlbmd0aDsgaSArPSAyKSB7XHJcbiAgICAvLyBUaGUgY2hhcmFjdGVyIHZhbHVlIG9mIHRoZSBmaXJzdCBjaGFyYWN0ZXIgaXMgbXVsdGlwbGllZCBieSA0NVxyXG4gICAgbGV0IHZhbHVlID0gQUxQSEFfTlVNX0NIQVJTLmluZGV4T2YodGhpcy5kYXRhW2ldKSAqIDQ1XHJcblxyXG4gICAgLy8gVGhlIGNoYXJhY3RlciB2YWx1ZSBvZiB0aGUgc2Vjb25kIGRpZ2l0IGlzIGFkZGVkIHRvIHRoZSBwcm9kdWN0XHJcbiAgICB2YWx1ZSArPSBBTFBIQV9OVU1fQ0hBUlMuaW5kZXhPZih0aGlzLmRhdGFbaSArIDFdKVxyXG5cclxuICAgIC8vIFRoZSBzdW0gaXMgdGhlbiBzdG9yZWQgYXMgMTEtYml0IGJpbmFyeSBudW1iZXJcclxuICAgIGJpdEJ1ZmZlci5wdXQodmFsdWUsIDExKVxyXG4gIH1cclxuXHJcbiAgLy8gSWYgdGhlIG51bWJlciBvZiBpbnB1dCBkYXRhIGNoYXJhY3RlcnMgaXMgbm90IGEgbXVsdGlwbGUgb2YgdHdvLFxyXG4gIC8vIHRoZSBjaGFyYWN0ZXIgdmFsdWUgb2YgdGhlIGZpbmFsIGNoYXJhY3RlciBpcyBlbmNvZGVkIGFzIGEgNi1iaXQgYmluYXJ5IG51bWJlci5cclxuICBpZiAodGhpcy5kYXRhLmxlbmd0aCAlIDIpIHtcclxuICAgIGJpdEJ1ZmZlci5wdXQoQUxQSEFfTlVNX0NIQVJTLmluZGV4T2YodGhpcy5kYXRhW2ldKSwgNilcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWxwaGFudW1lcmljRGF0YVxyXG4iLCJjb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcclxuXHJcbmZ1bmN0aW9uIEJ5dGVEYXRhIChkYXRhKSB7XHJcbiAgdGhpcy5tb2RlID0gTW9kZS5CWVRFXHJcbiAgaWYgKHR5cGVvZiAoZGF0YSkgPT09ICdzdHJpbmcnKSB7XHJcbiAgICB0aGlzLmRhdGEgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoZGF0YSlcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5kYXRhID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSlcclxuICB9XHJcbn1cclxuXHJcbkJ5dGVEYXRhLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoIChsZW5ndGgpIHtcclxuICByZXR1cm4gbGVuZ3RoICogOFxyXG59XHJcblxyXG5CeXRlRGF0YS5wcm90b3R5cGUuZ2V0TGVuZ3RoID0gZnVuY3Rpb24gZ2V0TGVuZ3RoICgpIHtcclxuICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aFxyXG59XHJcblxyXG5CeXRlRGF0YS5wcm90b3R5cGUuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKCkge1xyXG4gIHJldHVybiBCeXRlRGF0YS5nZXRCaXRzTGVuZ3RoKHRoaXMuZGF0YS5sZW5ndGgpXHJcbn1cclxuXHJcbkJ5dGVEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChiaXRCdWZmZXIpIHtcclxuICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMuZGF0YS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgIGJpdEJ1ZmZlci5wdXQodGhpcy5kYXRhW2ldLCA4KVxyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCeXRlRGF0YVxyXG4iLCJjb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcclxuY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcclxuXHJcbmZ1bmN0aW9uIEthbmppRGF0YSAoZGF0YSkge1xyXG4gIHRoaXMubW9kZSA9IE1vZGUuS0FOSklcclxuICB0aGlzLmRhdGEgPSBkYXRhXHJcbn1cclxuXHJcbkthbmppRGF0YS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAobGVuZ3RoKSB7XHJcbiAgcmV0dXJuIGxlbmd0aCAqIDEzXHJcbn1cclxuXHJcbkthbmppRGF0YS5wcm90b3R5cGUuZ2V0TGVuZ3RoID0gZnVuY3Rpb24gZ2V0TGVuZ3RoICgpIHtcclxuICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aFxyXG59XHJcblxyXG5LYW5qaURhdGEucHJvdG90eXBlLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoICgpIHtcclxuICByZXR1cm4gS2FuamlEYXRhLmdldEJpdHNMZW5ndGgodGhpcy5kYXRhLmxlbmd0aClcclxufVxyXG5cclxuS2FuamlEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChiaXRCdWZmZXIpIHtcclxuICBsZXQgaVxyXG5cclxuICAvLyBJbiB0aGUgU2hpZnQgSklTIHN5c3RlbSwgS2FuamkgY2hhcmFjdGVycyBhcmUgcmVwcmVzZW50ZWQgYnkgYSB0d28gYnl0ZSBjb21iaW5hdGlvbi5cclxuICAvLyBUaGVzZSBieXRlIHZhbHVlcyBhcmUgc2hpZnRlZCBmcm9tIHRoZSBKSVMgWCAwMjA4IHZhbHVlcy5cclxuICAvLyBKSVMgWCAwMjA4IGdpdmVzIGRldGFpbHMgb2YgdGhlIHNoaWZ0IGNvZGVkIHJlcHJlc2VudGF0aW9uLlxyXG4gIGZvciAoaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgIGxldCB2YWx1ZSA9IFV0aWxzLnRvU0pJUyh0aGlzLmRhdGFbaV0pXHJcblxyXG4gICAgLy8gRm9yIGNoYXJhY3RlcnMgd2l0aCBTaGlmdCBKSVMgdmFsdWVzIGZyb20gMHg4MTQwIHRvIDB4OUZGQzpcclxuICAgIGlmICh2YWx1ZSA+PSAweDgxNDAgJiYgdmFsdWUgPD0gMHg5RkZDKSB7XHJcbiAgICAgIC8vIFN1YnRyYWN0IDB4ODE0MCBmcm9tIFNoaWZ0IEpJUyB2YWx1ZVxyXG4gICAgICB2YWx1ZSAtPSAweDgxNDBcclxuXHJcbiAgICAvLyBGb3IgY2hhcmFjdGVycyB3aXRoIFNoaWZ0IEpJUyB2YWx1ZXMgZnJvbSAweEUwNDAgdG8gMHhFQkJGXHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID49IDB4RTA0MCAmJiB2YWx1ZSA8PSAweEVCQkYpIHtcclxuICAgICAgLy8gU3VidHJhY3QgMHhDMTQwIGZyb20gU2hpZnQgSklTIHZhbHVlXHJcbiAgICAgIHZhbHVlIC09IDB4QzE0MFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICdJbnZhbGlkIFNKSVMgY2hhcmFjdGVyOiAnICsgdGhpcy5kYXRhW2ldICsgJ1xcbicgK1xyXG4gICAgICAgICdNYWtlIHN1cmUgeW91ciBjaGFyc2V0IGlzIFVURi04JylcclxuICAgIH1cclxuXHJcbiAgICAvLyBNdWx0aXBseSBtb3N0IHNpZ25pZmljYW50IGJ5dGUgb2YgcmVzdWx0IGJ5IDB4QzBcclxuICAgIC8vIGFuZCBhZGQgbGVhc3Qgc2lnbmlmaWNhbnQgYnl0ZSB0byBwcm9kdWN0XHJcbiAgICB2YWx1ZSA9ICgoKHZhbHVlID4+PiA4KSAmIDB4ZmYpICogMHhDMCkgKyAodmFsdWUgJiAweGZmKVxyXG5cclxuICAgIC8vIENvbnZlcnQgcmVzdWx0IHRvIGEgMTMtYml0IGJpbmFyeSBzdHJpbmdcclxuICAgIGJpdEJ1ZmZlci5wdXQodmFsdWUsIDEzKVxyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBLYW5qaURhdGFcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gKiBDcmVhdGVkIDIwMDgtMDgtMTkuXHJcbiAqXHJcbiAqIERpamtzdHJhIHBhdGgtZmluZGluZyBmdW5jdGlvbnMuIEFkYXB0ZWQgZnJvbSB0aGUgRGlqa3N0YXIgUHl0aG9uIHByb2plY3QuXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoQykgMjAwOFxyXG4gKiAgIFd5YXR0IEJhbGR3aW4gPHNlbGZAd3lhdHRiYWxkd2luLmNvbT5cclxuICogICBBbGwgcmlnaHRzIHJlc2VydmVkXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cclxuICpcclxuICogICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXHJcbiAqIFRIRSBTT0ZUV0FSRS5cclxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG52YXIgZGlqa3N0cmEgPSB7XHJcbiAgc2luZ2xlX3NvdXJjZV9zaG9ydGVzdF9wYXRoczogZnVuY3Rpb24oZ3JhcGgsIHMsIGQpIHtcclxuICAgIC8vIFByZWRlY2Vzc29yIG1hcCBmb3IgZWFjaCBub2RlIHRoYXQgaGFzIGJlZW4gZW5jb3VudGVyZWQuXHJcbiAgICAvLyBub2RlIElEID0+IHByZWRlY2Vzc29yIG5vZGUgSURcclxuICAgIHZhciBwcmVkZWNlc3NvcnMgPSB7fTtcclxuXHJcbiAgICAvLyBDb3N0cyBvZiBzaG9ydGVzdCBwYXRocyBmcm9tIHMgdG8gYWxsIG5vZGVzIGVuY291bnRlcmVkLlxyXG4gICAgLy8gbm9kZSBJRCA9PiBjb3N0XHJcbiAgICB2YXIgY29zdHMgPSB7fTtcclxuICAgIGNvc3RzW3NdID0gMDtcclxuXHJcbiAgICAvLyBDb3N0cyBvZiBzaG9ydGVzdCBwYXRocyBmcm9tIHMgdG8gYWxsIG5vZGVzIGVuY291bnRlcmVkOyBkaWZmZXJzIGZyb21cclxuICAgIC8vIGBjb3N0c2AgaW4gdGhhdCBpdCBwcm92aWRlcyBlYXN5IGFjY2VzcyB0byB0aGUgbm9kZSB0aGF0IGN1cnJlbnRseSBoYXNcclxuICAgIC8vIHRoZSBrbm93biBzaG9ydGVzdCBwYXRoIGZyb20gcy5cclxuICAgIC8vIFhYWDogRG8gd2UgYWN0dWFsbHkgbmVlZCBib3RoIGBjb3N0c2AgYW5kIGBvcGVuYD9cclxuICAgIHZhciBvcGVuID0gZGlqa3N0cmEuUHJpb3JpdHlRdWV1ZS5tYWtlKCk7XHJcbiAgICBvcGVuLnB1c2gocywgMCk7XHJcblxyXG4gICAgdmFyIGNsb3Nlc3QsXHJcbiAgICAgICAgdSwgdixcclxuICAgICAgICBjb3N0X29mX3NfdG9fdSxcclxuICAgICAgICBhZGphY2VudF9ub2RlcyxcclxuICAgICAgICBjb3N0X29mX2UsXHJcbiAgICAgICAgY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2UsXHJcbiAgICAgICAgY29zdF9vZl9zX3RvX3YsXHJcbiAgICAgICAgZmlyc3RfdmlzaXQ7XHJcbiAgICB3aGlsZSAoIW9wZW4uZW1wdHkoKSkge1xyXG4gICAgICAvLyBJbiB0aGUgbm9kZXMgcmVtYWluaW5nIGluIGdyYXBoIHRoYXQgaGF2ZSBhIGtub3duIGNvc3QgZnJvbSBzLFxyXG4gICAgICAvLyBmaW5kIHRoZSBub2RlLCB1LCB0aGF0IGN1cnJlbnRseSBoYXMgdGhlIHNob3J0ZXN0IHBhdGggZnJvbSBzLlxyXG4gICAgICBjbG9zZXN0ID0gb3Blbi5wb3AoKTtcclxuICAgICAgdSA9IGNsb3Nlc3QudmFsdWU7XHJcbiAgICAgIGNvc3Rfb2Zfc190b191ID0gY2xvc2VzdC5jb3N0O1xyXG5cclxuICAgICAgLy8gR2V0IG5vZGVzIGFkamFjZW50IHRvIHUuLi5cclxuICAgICAgYWRqYWNlbnRfbm9kZXMgPSBncmFwaFt1XSB8fCB7fTtcclxuXHJcbiAgICAgIC8vIC4uLmFuZCBleHBsb3JlIHRoZSBlZGdlcyB0aGF0IGNvbm5lY3QgdSB0byB0aG9zZSBub2RlcywgdXBkYXRpbmdcclxuICAgICAgLy8gdGhlIGNvc3Qgb2YgdGhlIHNob3J0ZXN0IHBhdGhzIHRvIGFueSBvciBhbGwgb2YgdGhvc2Ugbm9kZXMgYXNcclxuICAgICAgLy8gbmVjZXNzYXJ5LiB2IGlzIHRoZSBub2RlIGFjcm9zcyB0aGUgY3VycmVudCBlZGdlIGZyb20gdS5cclxuICAgICAgZm9yICh2IGluIGFkamFjZW50X25vZGVzKSB7XHJcbiAgICAgICAgaWYgKGFkamFjZW50X25vZGVzLmhhc093blByb3BlcnR5KHYpKSB7XHJcbiAgICAgICAgICAvLyBHZXQgdGhlIGNvc3Qgb2YgdGhlIGVkZ2UgcnVubmluZyBmcm9tIHUgdG8gdi5cclxuICAgICAgICAgIGNvc3Rfb2ZfZSA9IGFkamFjZW50X25vZGVzW3ZdO1xyXG5cclxuICAgICAgICAgIC8vIENvc3Qgb2YgcyB0byB1IHBsdXMgdGhlIGNvc3Qgb2YgdSB0byB2IGFjcm9zcyBlLS10aGlzIGlzICphKlxyXG4gICAgICAgICAgLy8gY29zdCBmcm9tIHMgdG8gdiB0aGF0IG1heSBvciBtYXkgbm90IGJlIGxlc3MgdGhhbiB0aGUgY3VycmVudFxyXG4gICAgICAgICAgLy8ga25vd24gY29zdCB0byB2LlxyXG4gICAgICAgICAgY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2UgPSBjb3N0X29mX3NfdG9fdSArIGNvc3Rfb2ZfZTtcclxuXHJcbiAgICAgICAgICAvLyBJZiB3ZSBoYXZlbid0IHZpc2l0ZWQgdiB5ZXQgT1IgaWYgdGhlIGN1cnJlbnQga25vd24gY29zdCBmcm9tIHMgdG9cclxuICAgICAgICAgIC8vIHYgaXMgZ3JlYXRlciB0aGFuIHRoZSBuZXcgY29zdCB3ZSBqdXN0IGZvdW5kIChjb3N0IG9mIHMgdG8gdSBwbHVzXHJcbiAgICAgICAgICAvLyBjb3N0IG9mIHUgdG8gdiBhY3Jvc3MgZSksIHVwZGF0ZSB2J3MgY29zdCBpbiB0aGUgY29zdCBsaXN0IGFuZFxyXG4gICAgICAgICAgLy8gdXBkYXRlIHYncyBwcmVkZWNlc3NvciBpbiB0aGUgcHJlZGVjZXNzb3IgbGlzdCAoaXQncyBub3cgdSkuXHJcbiAgICAgICAgICBjb3N0X29mX3NfdG9fdiA9IGNvc3RzW3ZdO1xyXG4gICAgICAgICAgZmlyc3RfdmlzaXQgPSAodHlwZW9mIGNvc3RzW3ZdID09PSAndW5kZWZpbmVkJyk7XHJcbiAgICAgICAgICBpZiAoZmlyc3RfdmlzaXQgfHwgY29zdF9vZl9zX3RvX3YgPiBjb3N0X29mX3NfdG9fdV9wbHVzX2Nvc3Rfb2ZfZSkge1xyXG4gICAgICAgICAgICBjb3N0c1t2XSA9IGNvc3Rfb2Zfc190b191X3BsdXNfY29zdF9vZl9lO1xyXG4gICAgICAgICAgICBvcGVuLnB1c2godiwgY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2UpO1xyXG4gICAgICAgICAgICBwcmVkZWNlc3NvcnNbdl0gPSB1O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgZCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNvc3RzW2RdID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB2YXIgbXNnID0gWydDb3VsZCBub3QgZmluZCBhIHBhdGggZnJvbSAnLCBzLCAnIHRvICcsIGQsICcuJ10uam9pbignJyk7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwcmVkZWNlc3NvcnM7XHJcbiAgfSxcclxuXHJcbiAgZXh0cmFjdF9zaG9ydGVzdF9wYXRoX2Zyb21fcHJlZGVjZXNzb3JfbGlzdDogZnVuY3Rpb24ocHJlZGVjZXNzb3JzLCBkKSB7XHJcbiAgICB2YXIgbm9kZXMgPSBbXTtcclxuICAgIHZhciB1ID0gZDtcclxuICAgIHZhciBwcmVkZWNlc3NvcjtcclxuICAgIHdoaWxlICh1KSB7XHJcbiAgICAgIG5vZGVzLnB1c2godSk7XHJcbiAgICAgIHByZWRlY2Vzc29yID0gcHJlZGVjZXNzb3JzW3VdO1xyXG4gICAgICB1ID0gcHJlZGVjZXNzb3JzW3VdO1xyXG4gICAgfVxyXG4gICAgbm9kZXMucmV2ZXJzZSgpO1xyXG4gICAgcmV0dXJuIG5vZGVzO1xyXG4gIH0sXHJcblxyXG4gIGZpbmRfcGF0aDogZnVuY3Rpb24oZ3JhcGgsIHMsIGQpIHtcclxuICAgIHZhciBwcmVkZWNlc3NvcnMgPSBkaWprc3RyYS5zaW5nbGVfc291cmNlX3Nob3J0ZXN0X3BhdGhzKGdyYXBoLCBzLCBkKTtcclxuICAgIHJldHVybiBkaWprc3RyYS5leHRyYWN0X3Nob3J0ZXN0X3BhdGhfZnJvbV9wcmVkZWNlc3Nvcl9saXN0KFxyXG4gICAgICBwcmVkZWNlc3NvcnMsIGQpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEEgdmVyeSBuYWl2ZSBwcmlvcml0eSBxdWV1ZSBpbXBsZW1lbnRhdGlvbi5cclxuICAgKi9cclxuICBQcmlvcml0eVF1ZXVlOiB7XHJcbiAgICBtYWtlOiBmdW5jdGlvbiAob3B0cykge1xyXG4gICAgICB2YXIgVCA9IGRpamtzdHJhLlByaW9yaXR5UXVldWUsXHJcbiAgICAgICAgICB0ID0ge30sXHJcbiAgICAgICAgICBrZXk7XHJcbiAgICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xyXG4gICAgICBmb3IgKGtleSBpbiBUKSB7XHJcbiAgICAgICAgaWYgKFQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgdFtrZXldID0gVFtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICB0LnF1ZXVlID0gW107XHJcbiAgICAgIHQuc29ydGVyID0gb3B0cy5zb3J0ZXIgfHwgVC5kZWZhdWx0X3NvcnRlcjtcclxuICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGRlZmF1bHRfc29ydGVyOiBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICByZXR1cm4gYS5jb3N0IC0gYi5jb3N0O1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIG5ldyBpdGVtIHRvIHRoZSBxdWV1ZSBhbmQgZW5zdXJlIHRoZSBoaWdoZXN0IHByaW9yaXR5IGVsZW1lbnRcclxuICAgICAqIGlzIGF0IHRoZSBmcm9udCBvZiB0aGUgcXVldWUuXHJcbiAgICAgKi9cclxuICAgIHB1c2g6IGZ1bmN0aW9uICh2YWx1ZSwgY29zdCkge1xyXG4gICAgICB2YXIgaXRlbSA9IHt2YWx1ZTogdmFsdWUsIGNvc3Q6IGNvc3R9O1xyXG4gICAgICB0aGlzLnF1ZXVlLnB1c2goaXRlbSk7XHJcbiAgICAgIHRoaXMucXVldWUuc29ydCh0aGlzLnNvcnRlcik7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRoZSBoaWdoZXN0IHByaW9yaXR5IGVsZW1lbnQgaW4gdGhlIHF1ZXVlLlxyXG4gICAgICovXHJcbiAgICBwb3A6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMucXVldWUuc2hpZnQoKTtcclxuICAgIH0sXHJcblxyXG4gICAgZW1wdHk6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMucXVldWUubGVuZ3RoID09PSAwO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcblxyXG4vLyBub2RlLmpzIG1vZHVsZSBleHBvcnRzXHJcbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xyXG4gIG1vZHVsZS5leHBvcnRzID0gZGlqa3N0cmE7XHJcbn1cclxuIiwiY29uc3QgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXHJcbmNvbnN0IE51bWVyaWNEYXRhID0gcmVxdWlyZSgnLi9udW1lcmljLWRhdGEnKVxyXG5jb25zdCBBbHBoYW51bWVyaWNEYXRhID0gcmVxdWlyZSgnLi9hbHBoYW51bWVyaWMtZGF0YScpXHJcbmNvbnN0IEJ5dGVEYXRhID0gcmVxdWlyZSgnLi9ieXRlLWRhdGEnKVxyXG5jb25zdCBLYW5qaURhdGEgPSByZXF1aXJlKCcuL2thbmppLWRhdGEnKVxyXG5jb25zdCBSZWdleCA9IHJlcXVpcmUoJy4vcmVnZXgnKVxyXG5jb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5jb25zdCBkaWprc3RyYSA9IHJlcXVpcmUoJ2RpamtzdHJhanMnKVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgVVRGOCBieXRlIGxlbmd0aFxyXG4gKlxyXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciBJbnB1dCBzdHJpbmdcclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgTnVtYmVyIG9mIGJ5dGVcclxuICovXHJcbmZ1bmN0aW9uIGdldFN0cmluZ0J5dGVMZW5ndGggKHN0cikge1xyXG4gIHJldHVybiB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoc3RyKSkubGVuZ3RoXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgYSBsaXN0IG9mIHNlZ21lbnRzIG9mIHRoZSBzcGVjaWZpZWQgbW9kZVxyXG4gKiBmcm9tIGEgc3RyaW5nXHJcbiAqXHJcbiAqIEBwYXJhbSAge01vZGV9ICAgbW9kZSBTZWdtZW50IG1vZGVcclxuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgIFN0cmluZyB0byBwcm9jZXNzXHJcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRTZWdtZW50cyAocmVnZXgsIG1vZGUsIHN0cikge1xyXG4gIGNvbnN0IHNlZ21lbnRzID0gW11cclxuICBsZXQgcmVzdWx0XHJcblxyXG4gIHdoaWxlICgocmVzdWx0ID0gcmVnZXguZXhlYyhzdHIpKSAhPT0gbnVsbCkge1xyXG4gICAgc2VnbWVudHMucHVzaCh7XHJcbiAgICAgIGRhdGE6IHJlc3VsdFswXSxcclxuICAgICAgaW5kZXg6IHJlc3VsdC5pbmRleCxcclxuICAgICAgbW9kZTogbW9kZSxcclxuICAgICAgbGVuZ3RoOiByZXN1bHRbMF0ubGVuZ3RoXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHNlZ21lbnRzXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFeHRyYWN0cyBhIHNlcmllcyBvZiBzZWdtZW50cyB3aXRoIHRoZSBhcHByb3ByaWF0ZVxyXG4gKiBtb2RlcyBmcm9tIGEgc3RyaW5nXHJcbiAqXHJcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YVN0ciBJbnB1dCBzdHJpbmdcclxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcclxuICovXHJcbmZ1bmN0aW9uIGdldFNlZ21lbnRzRnJvbVN0cmluZyAoZGF0YVN0cikge1xyXG4gIGNvbnN0IG51bVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5OVU1FUklDLCBNb2RlLk5VTUVSSUMsIGRhdGFTdHIpXHJcbiAgY29uc3QgYWxwaGFOdW1TZWdzID0gZ2V0U2VnbWVudHMoUmVnZXguQUxQSEFOVU1FUklDLCBNb2RlLkFMUEhBTlVNRVJJQywgZGF0YVN0cilcclxuICBsZXQgYnl0ZVNlZ3NcclxuICBsZXQga2FuamlTZWdzXHJcblxyXG4gIGlmIChVdGlscy5pc0thbmppTW9kZUVuYWJsZWQoKSkge1xyXG4gICAgYnl0ZVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5CWVRFLCBNb2RlLkJZVEUsIGRhdGFTdHIpXHJcbiAgICBrYW5qaVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5LQU5KSSwgTW9kZS5LQU5KSSwgZGF0YVN0cilcclxuICB9IGVsc2Uge1xyXG4gICAgYnl0ZVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5CWVRFX0tBTkpJLCBNb2RlLkJZVEUsIGRhdGFTdHIpXHJcbiAgICBrYW5qaVNlZ3MgPSBbXVxyXG4gIH1cclxuXHJcbiAgY29uc3Qgc2VncyA9IG51bVNlZ3MuY29uY2F0KGFscGhhTnVtU2VncywgYnl0ZVNlZ3MsIGthbmppU2VncylcclxuXHJcbiAgcmV0dXJuIHNlZ3NcclxuICAgIC5zb3J0KGZ1bmN0aW9uIChzMSwgczIpIHtcclxuICAgICAgcmV0dXJuIHMxLmluZGV4IC0gczIuaW5kZXhcclxuICAgIH0pXHJcbiAgICAubWFwKGZ1bmN0aW9uIChvYmopIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBkYXRhOiBvYmouZGF0YSxcclxuICAgICAgICBtb2RlOiBvYmoubW9kZSxcclxuICAgICAgICBsZW5ndGg6IG9iai5sZW5ndGhcclxuICAgICAgfVxyXG4gICAgfSlcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgaG93IG1hbnkgYml0cyBhcmUgbmVlZGVkIHRvIGVuY29kZSBhIHN0cmluZyBvZlxyXG4gKiBzcGVjaWZpZWQgbGVuZ3RoIHdpdGggdGhlIHNwZWNpZmllZCBtb2RlXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gbGVuZ3RoIFN0cmluZyBsZW5ndGhcclxuICogQHBhcmFtICB7TW9kZX0gbW9kZSAgICAgU2VnbWVudCBtb2RlXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgIEJpdCBsZW5ndGhcclxuICovXHJcbmZ1bmN0aW9uIGdldFNlZ21lbnRCaXRzTGVuZ3RoIChsZW5ndGgsIG1vZGUpIHtcclxuICBzd2l0Y2ggKG1vZGUpIHtcclxuICAgIGNhc2UgTW9kZS5OVU1FUklDOlxyXG4gICAgICByZXR1cm4gTnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aChsZW5ndGgpXHJcbiAgICBjYXNlIE1vZGUuQUxQSEFOVU1FUklDOlxyXG4gICAgICByZXR1cm4gQWxwaGFudW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcclxuICAgIGNhc2UgTW9kZS5LQU5KSTpcclxuICAgICAgcmV0dXJuIEthbmppRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcclxuICAgIGNhc2UgTW9kZS5CWVRFOlxyXG4gICAgICByZXR1cm4gQnl0ZURhdGEuZ2V0Qml0c0xlbmd0aChsZW5ndGgpXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogTWVyZ2VzIGFkamFjZW50IHNlZ21lbnRzIHdoaWNoIGhhdmUgdGhlIHNhbWUgbW9kZVxyXG4gKlxyXG4gKiBAcGFyYW0gIHtBcnJheX0gc2VncyBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXHJcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcclxuICovXHJcbmZ1bmN0aW9uIG1lcmdlU2VnbWVudHMgKHNlZ3MpIHtcclxuICByZXR1cm4gc2Vncy5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgY3Vycikge1xyXG4gICAgY29uc3QgcHJldlNlZyA9IGFjYy5sZW5ndGggLSAxID49IDAgPyBhY2NbYWNjLmxlbmd0aCAtIDFdIDogbnVsbFxyXG4gICAgaWYgKHByZXZTZWcgJiYgcHJldlNlZy5tb2RlID09PSBjdXJyLm1vZGUpIHtcclxuICAgICAgYWNjW2FjYy5sZW5ndGggLSAxXS5kYXRhICs9IGN1cnIuZGF0YVxyXG4gICAgICByZXR1cm4gYWNjXHJcbiAgICB9XHJcblxyXG4gICAgYWNjLnB1c2goY3VycilcclxuICAgIHJldHVybiBhY2NcclxuICB9LCBbXSlcclxufVxyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIGxpc3Qgb2YgYWxsIHBvc3NpYmxlIG5vZGVzIGNvbWJpbmF0aW9uIHdoaWNoXHJcbiAqIHdpbGwgYmUgdXNlZCB0byBidWlsZCBhIHNlZ21lbnRzIGdyYXBoLlxyXG4gKlxyXG4gKiBOb2RlcyBhcmUgZGl2aWRlZCBieSBncm91cHMuIEVhY2ggZ3JvdXAgd2lsbCBjb250YWluIGEgbGlzdCBvZiBhbGwgdGhlIG1vZGVzXHJcbiAqIGluIHdoaWNoIGlzIHBvc3NpYmxlIHRvIGVuY29kZSB0aGUgZ2l2ZW4gdGV4dC5cclxuICpcclxuICogRm9yIGV4YW1wbGUgdGhlIHRleHQgJzEyMzQ1JyBjYW4gYmUgZW5jb2RlZCBhcyBOdW1lcmljLCBBbHBoYW51bWVyaWMgb3IgQnl0ZS5cclxuICogVGhlIGdyb3VwIGZvciAnMTIzNDUnIHdpbGwgY29udGFpbiB0aGVuIDMgb2JqZWN0cywgb25lIGZvciBlYWNoXHJcbiAqIHBvc3NpYmxlIGVuY29kaW5nIG1vZGUuXHJcbiAqXHJcbiAqIEVhY2ggbm9kZSByZXByZXNlbnRzIGEgcG9zc2libGUgc2VnbWVudC5cclxuICpcclxuICogQHBhcmFtICB7QXJyYXl9IHNlZ3MgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXHJcbiAqL1xyXG5mdW5jdGlvbiBidWlsZE5vZGVzIChzZWdzKSB7XHJcbiAgY29uc3Qgbm9kZXMgPSBbXVxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2Vncy5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3Qgc2VnID0gc2Vnc1tpXVxyXG5cclxuICAgIHN3aXRjaCAoc2VnLm1vZGUpIHtcclxuICAgICAgY2FzZSBNb2RlLk5VTUVSSUM6XHJcbiAgICAgICAgbm9kZXMucHVzaChbc2VnLFxyXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5BTFBIQU5VTUVSSUMsIGxlbmd0aDogc2VnLmxlbmd0aCB9LFxyXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5CWVRFLCBsZW5ndGg6IHNlZy5sZW5ndGggfVxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSBNb2RlLkFMUEhBTlVNRVJJQzpcclxuICAgICAgICBub2Rlcy5wdXNoKFtzZWcsXHJcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkJZVEUsIGxlbmd0aDogc2VnLmxlbmd0aCB9XHJcbiAgICAgICAgXSlcclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlIE1vZGUuS0FOSkk6XHJcbiAgICAgICAgbm9kZXMucHVzaChbc2VnLFxyXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5CWVRFLCBsZW5ndGg6IGdldFN0cmluZ0J5dGVMZW5ndGgoc2VnLmRhdGEpIH1cclxuICAgICAgICBdKVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGNhc2UgTW9kZS5CWVRFOlxyXG4gICAgICAgIG5vZGVzLnB1c2goW1xyXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5CWVRFLCBsZW5ndGg6IGdldFN0cmluZ0J5dGVMZW5ndGgoc2VnLmRhdGEpIH1cclxuICAgICAgICBdKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG5vZGVzXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgYSBncmFwaCBmcm9tIGEgbGlzdCBvZiBub2Rlcy5cclxuICogQWxsIHNlZ21lbnRzIGluIGVhY2ggbm9kZSBncm91cCB3aWxsIGJlIGNvbm5lY3RlZCB3aXRoIGFsbCB0aGUgc2VnbWVudHMgb2ZcclxuICogdGhlIG5leHQgZ3JvdXAgYW5kIHNvIG9uLlxyXG4gKlxyXG4gKiBBdCBlYWNoIGNvbm5lY3Rpb24gd2lsbCBiZSBhc3NpZ25lZCBhIHdlaWdodCBkZXBlbmRpbmcgb24gdGhlXHJcbiAqIHNlZ21lbnQncyBieXRlIGxlbmd0aC5cclxuICpcclxuICogQHBhcmFtICB7QXJyYXl9IG5vZGVzICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAgR3JhcGggb2YgYWxsIHBvc3NpYmxlIHNlZ21lbnRzXHJcbiAqL1xyXG5mdW5jdGlvbiBidWlsZEdyYXBoIChub2RlcywgdmVyc2lvbikge1xyXG4gIGNvbnN0IHRhYmxlID0ge31cclxuICBjb25zdCBncmFwaCA9IHsgc3RhcnQ6IHt9IH1cclxuICBsZXQgcHJldk5vZGVJZHMgPSBbJ3N0YXJ0J11cclxuXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3Qgbm9kZUdyb3VwID0gbm9kZXNbaV1cclxuICAgIGNvbnN0IGN1cnJlbnROb2RlSWRzID0gW11cclxuXHJcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVHcm91cC5sZW5ndGg7IGorKykge1xyXG4gICAgICBjb25zdCBub2RlID0gbm9kZUdyb3VwW2pdXHJcbiAgICAgIGNvbnN0IGtleSA9ICcnICsgaSArIGpcclxuXHJcbiAgICAgIGN1cnJlbnROb2RlSWRzLnB1c2goa2V5KVxyXG4gICAgICB0YWJsZVtrZXldID0geyBub2RlOiBub2RlLCBsYXN0Q291bnQ6IDAgfVxyXG4gICAgICBncmFwaFtrZXldID0ge31cclxuXHJcbiAgICAgIGZvciAobGV0IG4gPSAwOyBuIDwgcHJldk5vZGVJZHMubGVuZ3RoOyBuKyspIHtcclxuICAgICAgICBjb25zdCBwcmV2Tm9kZUlkID0gcHJldk5vZGVJZHNbbl1cclxuXHJcbiAgICAgICAgaWYgKHRhYmxlW3ByZXZOb2RlSWRdICYmIHRhYmxlW3ByZXZOb2RlSWRdLm5vZGUubW9kZSA9PT0gbm9kZS5tb2RlKSB7XHJcbiAgICAgICAgICBncmFwaFtwcmV2Tm9kZUlkXVtrZXldID1cclxuICAgICAgICAgICAgZ2V0U2VnbWVudEJpdHNMZW5ndGgodGFibGVbcHJldk5vZGVJZF0ubGFzdENvdW50ICsgbm9kZS5sZW5ndGgsIG5vZGUubW9kZSkgLVxyXG4gICAgICAgICAgICBnZXRTZWdtZW50Qml0c0xlbmd0aCh0YWJsZVtwcmV2Tm9kZUlkXS5sYXN0Q291bnQsIG5vZGUubW9kZSlcclxuXHJcbiAgICAgICAgICB0YWJsZVtwcmV2Tm9kZUlkXS5sYXN0Q291bnQgKz0gbm9kZS5sZW5ndGhcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHRhYmxlW3ByZXZOb2RlSWRdKSB0YWJsZVtwcmV2Tm9kZUlkXS5sYXN0Q291bnQgPSBub2RlLmxlbmd0aFxyXG5cclxuICAgICAgICAgIGdyYXBoW3ByZXZOb2RlSWRdW2tleV0gPSBnZXRTZWdtZW50Qml0c0xlbmd0aChub2RlLmxlbmd0aCwgbm9kZS5tb2RlKSArXHJcbiAgICAgICAgICAgIDQgKyBNb2RlLmdldENoYXJDb3VudEluZGljYXRvcihub2RlLm1vZGUsIHZlcnNpb24pIC8vIHN3aXRjaCBjb3N0XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJldk5vZGVJZHMgPSBjdXJyZW50Tm9kZUlkc1xyXG4gIH1cclxuXHJcbiAgZm9yIChsZXQgbiA9IDA7IG4gPCBwcmV2Tm9kZUlkcy5sZW5ndGg7IG4rKykge1xyXG4gICAgZ3JhcGhbcHJldk5vZGVJZHNbbl1dLmVuZCA9IDBcclxuICB9XHJcblxyXG4gIHJldHVybiB7IG1hcDogZ3JhcGgsIHRhYmxlOiB0YWJsZSB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgYSBzZWdtZW50IGZyb20gYSBzcGVjaWZpZWQgZGF0YSBhbmQgbW9kZS5cclxuICogSWYgYSBtb2RlIGlzIG5vdCBzcGVjaWZpZWQsIHRoZSBtb3JlIHN1aXRhYmxlIHdpbGwgYmUgdXNlZC5cclxuICpcclxuICogQHBhcmFtICB7U3RyaW5nfSBkYXRhICAgICAgICAgICAgIElucHV0IGRhdGFcclxuICogQHBhcmFtICB7TW9kZSB8IFN0cmluZ30gbW9kZXNIaW50IERhdGEgbW9kZVxyXG4gKiBAcmV0dXJuIHtTZWdtZW50fSAgICAgICAgICAgICAgICAgU2VnbWVudFxyXG4gKi9cclxuZnVuY3Rpb24gYnVpbGRTaW5nbGVTZWdtZW50IChkYXRhLCBtb2Rlc0hpbnQpIHtcclxuICBsZXQgbW9kZVxyXG4gIGNvbnN0IGJlc3RNb2RlID0gTW9kZS5nZXRCZXN0TW9kZUZvckRhdGEoZGF0YSlcclxuXHJcbiAgbW9kZSA9IE1vZGUuZnJvbShtb2Rlc0hpbnQsIGJlc3RNb2RlKVxyXG5cclxuICAvLyBNYWtlIHN1cmUgZGF0YSBjYW4gYmUgZW5jb2RlZFxyXG4gIGlmIChtb2RlICE9PSBNb2RlLkJZVEUgJiYgbW9kZS5iaXQgPCBiZXN0TW9kZS5iaXQpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignXCInICsgZGF0YSArICdcIicgK1xyXG4gICAgICAnIGNhbm5vdCBiZSBlbmNvZGVkIHdpdGggbW9kZSAnICsgTW9kZS50b1N0cmluZyhtb2RlKSArXHJcbiAgICAgICcuXFxuIFN1Z2dlc3RlZCBtb2RlIGlzOiAnICsgTW9kZS50b1N0cmluZyhiZXN0TW9kZSkpXHJcbiAgfVxyXG5cclxuICAvLyBVc2UgTW9kZS5CWVRFIGlmIEthbmppIHN1cHBvcnQgaXMgZGlzYWJsZWRcclxuICBpZiAobW9kZSA9PT0gTW9kZS5LQU5KSSAmJiAhVXRpbHMuaXNLYW5qaU1vZGVFbmFibGVkKCkpIHtcclxuICAgIG1vZGUgPSBNb2RlLkJZVEVcclxuICB9XHJcblxyXG4gIHN3aXRjaCAobW9kZSkge1xyXG4gICAgY2FzZSBNb2RlLk5VTUVSSUM6XHJcbiAgICAgIHJldHVybiBuZXcgTnVtZXJpY0RhdGEoZGF0YSlcclxuXHJcbiAgICBjYXNlIE1vZGUuQUxQSEFOVU1FUklDOlxyXG4gICAgICByZXR1cm4gbmV3IEFscGhhbnVtZXJpY0RhdGEoZGF0YSlcclxuXHJcbiAgICBjYXNlIE1vZGUuS0FOSkk6XHJcbiAgICAgIHJldHVybiBuZXcgS2FuamlEYXRhKGRhdGEpXHJcblxyXG4gICAgY2FzZSBNb2RlLkJZVEU6XHJcbiAgICAgIHJldHVybiBuZXcgQnl0ZURhdGEoZGF0YSlcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgYSBsaXN0IG9mIHNlZ21lbnRzIGZyb20gYW4gYXJyYXkuXHJcbiAqIEFycmF5IGNhbiBjb250YWluIFN0cmluZ3Mgb3IgT2JqZWN0cyB3aXRoIHNlZ21lbnQncyBpbmZvLlxyXG4gKlxyXG4gKiBGb3IgZWFjaCBpdGVtIHdoaWNoIGlzIGEgc3RyaW5nLCB3aWxsIGJlIGdlbmVyYXRlZCBhIHNlZ21lbnQgd2l0aCB0aGUgZ2l2ZW5cclxuICogc3RyaW5nIGFuZCB0aGUgbW9yZSBhcHByb3ByaWF0ZSBlbmNvZGluZyBtb2RlLlxyXG4gKlxyXG4gKiBGb3IgZWFjaCBpdGVtIHdoaWNoIGlzIGFuIG9iamVjdCwgd2lsbCBiZSBnZW5lcmF0ZWQgYSBzZWdtZW50IHdpdGggdGhlIGdpdmVuXHJcbiAqIGRhdGEgYW5kIG1vZGUuXHJcbiAqIE9iamVjdHMgbXVzdCBjb250YWluIGF0IGxlYXN0IHRoZSBwcm9wZXJ0eSBcImRhdGFcIi5cclxuICogSWYgcHJvcGVydHkgXCJtb2RlXCIgaXMgbm90IHByZXNlbnQsIHRoZSBtb3JlIHN1aXRhYmxlIG1vZGUgd2lsbCBiZSB1c2VkLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtBcnJheX0gYXJyYXkgQXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHNlZ21lbnRzIGRhdGFcclxuICogQHJldHVybiB7QXJyYXl9ICAgICAgIEFycmF5IG9mIFNlZ21lbnRzXHJcbiAqL1xyXG5leHBvcnRzLmZyb21BcnJheSA9IGZ1bmN0aW9uIGZyb21BcnJheSAoYXJyYXkpIHtcclxuICByZXR1cm4gYXJyYXkucmVkdWNlKGZ1bmN0aW9uIChhY2MsIHNlZykge1xyXG4gICAgaWYgKHR5cGVvZiBzZWcgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIGFjYy5wdXNoKGJ1aWxkU2luZ2xlU2VnbWVudChzZWcsIG51bGwpKVxyXG4gICAgfSBlbHNlIGlmIChzZWcuZGF0YSkge1xyXG4gICAgICBhY2MucHVzaChidWlsZFNpbmdsZVNlZ21lbnQoc2VnLmRhdGEsIHNlZy5tb2RlKSlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYWNjXHJcbiAgfSwgW10pXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgYW4gb3B0aW1pemVkIHNlcXVlbmNlIG9mIHNlZ21lbnRzIGZyb20gYSBzdHJpbmcsXHJcbiAqIHdoaWNoIHdpbGwgcHJvZHVjZSB0aGUgc2hvcnRlc3QgcG9zc2libGUgYml0c3RyZWFtLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGEgICAgSW5wdXQgc3RyaW5nXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cclxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIHNlZ21lbnRzXHJcbiAqL1xyXG5leHBvcnRzLmZyb21TdHJpbmcgPSBmdW5jdGlvbiBmcm9tU3RyaW5nIChkYXRhLCB2ZXJzaW9uKSB7XHJcbiAgY29uc3Qgc2VncyA9IGdldFNlZ21lbnRzRnJvbVN0cmluZyhkYXRhLCBVdGlscy5pc0thbmppTW9kZUVuYWJsZWQoKSlcclxuXHJcbiAgY29uc3Qgbm9kZXMgPSBidWlsZE5vZGVzKHNlZ3MpXHJcbiAgY29uc3QgZ3JhcGggPSBidWlsZEdyYXBoKG5vZGVzLCB2ZXJzaW9uKVxyXG4gIGNvbnN0IHBhdGggPSBkaWprc3RyYS5maW5kX3BhdGgoZ3JhcGgubWFwLCAnc3RhcnQnLCAnZW5kJylcclxuXHJcbiAgY29uc3Qgb3B0aW1pemVkU2VncyA9IFtdXHJcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBwYXRoLmxlbmd0aCAtIDE7IGkrKykge1xyXG4gICAgb3B0aW1pemVkU2Vncy5wdXNoKGdyYXBoLnRhYmxlW3BhdGhbaV1dLm5vZGUpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gZXhwb3J0cy5mcm9tQXJyYXkobWVyZ2VTZWdtZW50cyhvcHRpbWl6ZWRTZWdzKSlcclxufVxyXG5cclxuLyoqXHJcbiAqIFNwbGl0cyBhIHN0cmluZyBpbiB2YXJpb3VzIHNlZ21lbnRzIHdpdGggdGhlIG1vZGVzIHdoaWNoXHJcbiAqIGJlc3QgcmVwcmVzZW50IHRoZWlyIGNvbnRlbnQuXHJcbiAqIFRoZSBwcm9kdWNlZCBzZWdtZW50cyBhcmUgZmFyIGZyb20gYmVpbmcgb3B0aW1pemVkLlxyXG4gKiBUaGUgb3V0cHV0IG9mIHRoaXMgZnVuY3Rpb24gaXMgb25seSB1c2VkIHRvIGVzdGltYXRlIGEgUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIHdoaWNoIG1heSBjb250YWluIHRoZSBkYXRhLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGRhdGEgSW5wdXQgc3RyaW5nXHJcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICBBcnJheSBvZiBzZWdtZW50c1xyXG4gKi9cclxuZXhwb3J0cy5yYXdTcGxpdCA9IGZ1bmN0aW9uIHJhd1NwbGl0IChkYXRhKSB7XHJcbiAgcmV0dXJuIGV4cG9ydHMuZnJvbUFycmF5KFxyXG4gICAgZ2V0U2VnbWVudHNGcm9tU3RyaW5nKGRhdGEsIFV0aWxzLmlzS2FuamlNb2RlRW5hYmxlZCgpKVxyXG4gIClcclxufVxyXG4iLCJjb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5jb25zdCBFQ0xldmVsID0gcmVxdWlyZSgnLi9lcnJvci1jb3JyZWN0aW9uLWxldmVsJylcclxuY29uc3QgQml0QnVmZmVyID0gcmVxdWlyZSgnLi9iaXQtYnVmZmVyJylcclxuY29uc3QgQml0TWF0cml4ID0gcmVxdWlyZSgnLi9iaXQtbWF0cml4JylcclxuY29uc3QgQWxpZ25tZW50UGF0dGVybiA9IHJlcXVpcmUoJy4vYWxpZ25tZW50LXBhdHRlcm4nKVxyXG5jb25zdCBGaW5kZXJQYXR0ZXJuID0gcmVxdWlyZSgnLi9maW5kZXItcGF0dGVybicpXHJcbmNvbnN0IE1hc2tQYXR0ZXJuID0gcmVxdWlyZSgnLi9tYXNrLXBhdHRlcm4nKVxyXG5jb25zdCBFQ0NvZGUgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tY29kZScpXHJcbmNvbnN0IFJlZWRTb2xvbW9uRW5jb2RlciA9IHJlcXVpcmUoJy4vcmVlZC1zb2xvbW9uLWVuY29kZXInKVxyXG5jb25zdCBWZXJzaW9uID0gcmVxdWlyZSgnLi92ZXJzaW9uJylcclxuY29uc3QgRm9ybWF0SW5mbyA9IHJlcXVpcmUoJy4vZm9ybWF0LWluZm8nKVxyXG5jb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcclxuY29uc3QgU2VnbWVudHMgPSByZXF1aXJlKCcuL3NlZ21lbnRzJylcclxuXHJcbi8qKlxyXG4gKiBRUkNvZGUgZm9yIEphdmFTY3JpcHRcclxuICpcclxuICogbW9kaWZpZWQgYnkgUnlhbiBEYXkgZm9yIG5vZGVqcyBzdXBwb3J0XHJcbiAqIENvcHlyaWdodCAoYykgMjAxMSBSeWFuIERheVxyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbiAqICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcclxuICpcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gUVJDb2RlIGZvciBKYXZhU2NyaXB0XHJcbi8vXHJcbi8vIENvcHlyaWdodCAoYykgMjAwOSBLYXp1aGlrbyBBcmFzZVxyXG4vL1xyXG4vLyBVUkw6IGh0dHA6Ly93d3cuZC1wcm9qZWN0LmNvbS9cclxuLy9cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxyXG4vLyAgIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXHJcbi8vXHJcbi8vIFRoZSB3b3JkIFwiUVIgQ29kZVwiIGlzIHJlZ2lzdGVyZWQgdHJhZGVtYXJrIG9mXHJcbi8vIERFTlNPIFdBVkUgSU5DT1JQT1JBVEVEXHJcbi8vICAgaHR0cDovL3d3dy5kZW5zby13YXZlLmNvbS9xcmNvZGUvZmFxcGF0ZW50LWUuaHRtbFxyXG4vL1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4qL1xyXG5cclxuLyoqXHJcbiAqIEFkZCBmaW5kZXIgcGF0dGVybnMgYml0cyB0byBtYXRyaXhcclxuICpcclxuICogQHBhcmFtICB7Qml0TWF0cml4fSBtYXRyaXggIE1vZHVsZXMgbWF0cml4XHJcbiAqIEBwYXJhbSAge051bWJlcn0gICAgdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cclxuICovXHJcbmZ1bmN0aW9uIHNldHVwRmluZGVyUGF0dGVybiAobWF0cml4LCB2ZXJzaW9uKSB7XHJcbiAgY29uc3Qgc2l6ZSA9IG1hdHJpeC5zaXplXHJcbiAgY29uc3QgcG9zID0gRmluZGVyUGF0dGVybi5nZXRQb3NpdGlvbnModmVyc2lvbilcclxuXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3MubGVuZ3RoOyBpKyspIHtcclxuICAgIGNvbnN0IHJvdyA9IHBvc1tpXVswXVxyXG4gICAgY29uc3QgY29sID0gcG9zW2ldWzFdXHJcblxyXG4gICAgZm9yIChsZXQgciA9IC0xOyByIDw9IDc7IHIrKykge1xyXG4gICAgICBpZiAocm93ICsgciA8PSAtMSB8fCBzaXplIDw9IHJvdyArIHIpIGNvbnRpbnVlXHJcblxyXG4gICAgICBmb3IgKGxldCBjID0gLTE7IGMgPD0gNzsgYysrKSB7XHJcbiAgICAgICAgaWYgKGNvbCArIGMgPD0gLTEgfHwgc2l6ZSA8PSBjb2wgKyBjKSBjb250aW51ZVxyXG5cclxuICAgICAgICBpZiAoKHIgPj0gMCAmJiByIDw9IDYgJiYgKGMgPT09IDAgfHwgYyA9PT0gNikpIHx8XHJcbiAgICAgICAgICAoYyA+PSAwICYmIGMgPD0gNiAmJiAociA9PT0gMCB8fCByID09PSA2KSkgfHxcclxuICAgICAgICAgIChyID49IDIgJiYgciA8PSA0ICYmIGMgPj0gMiAmJiBjIDw9IDQpKSB7XHJcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdyArIHIsIGNvbCArIGMsIHRydWUsIHRydWUpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1hdHJpeC5zZXQocm93ICsgciwgY29sICsgYywgZmFsc2UsIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWRkIHRpbWluZyBwYXR0ZXJuIGJpdHMgdG8gbWF0cml4XHJcbiAqXHJcbiAqIE5vdGU6IHRoaXMgZnVuY3Rpb24gbXVzdCBiZSBjYWxsZWQgYmVmb3JlIHtAbGluayBzZXR1cEFsaWdubWVudFBhdHRlcm59XHJcbiAqXHJcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gbWF0cml4IE1vZHVsZXMgbWF0cml4XHJcbiAqL1xyXG5mdW5jdGlvbiBzZXR1cFRpbWluZ1BhdHRlcm4gKG1hdHJpeCkge1xyXG4gIGNvbnN0IHNpemUgPSBtYXRyaXguc2l6ZVxyXG5cclxuICBmb3IgKGxldCByID0gODsgciA8IHNpemUgLSA4OyByKyspIHtcclxuICAgIGNvbnN0IHZhbHVlID0gciAlIDIgPT09IDBcclxuICAgIG1hdHJpeC5zZXQociwgNiwgdmFsdWUsIHRydWUpXHJcbiAgICBtYXRyaXguc2V0KDYsIHIsIHZhbHVlLCB0cnVlKVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZCBhbGlnbm1lbnQgcGF0dGVybnMgYml0cyB0byBtYXRyaXhcclxuICpcclxuICogTm90ZTogdGhpcyBmdW5jdGlvbiBtdXN0IGJlIGNhbGxlZCBhZnRlciB7QGxpbmsgc2V0dXBUaW1pbmdQYXR0ZXJufVxyXG4gKlxyXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCAgTW9kdWxlcyBtYXRyaXhcclxuICogQHBhcmFtICB7TnVtYmVyfSAgICB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxyXG4gKi9cclxuZnVuY3Rpb24gc2V0dXBBbGlnbm1lbnRQYXR0ZXJuIChtYXRyaXgsIHZlcnNpb24pIHtcclxuICBjb25zdCBwb3MgPSBBbGlnbm1lbnRQYXR0ZXJuLmdldFBvc2l0aW9ucyh2ZXJzaW9uKVxyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBvcy5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3Qgcm93ID0gcG9zW2ldWzBdXHJcbiAgICBjb25zdCBjb2wgPSBwb3NbaV1bMV1cclxuXHJcbiAgICBmb3IgKGxldCByID0gLTI7IHIgPD0gMjsgcisrKSB7XHJcbiAgICAgIGZvciAobGV0IGMgPSAtMjsgYyA8PSAyOyBjKyspIHtcclxuICAgICAgICBpZiAociA9PT0gLTIgfHwgciA9PT0gMiB8fCBjID09PSAtMiB8fCBjID09PSAyIHx8XHJcbiAgICAgICAgICAociA9PT0gMCAmJiBjID09PSAwKSkge1xyXG4gICAgICAgICAgbWF0cml4LnNldChyb3cgKyByLCBjb2wgKyBjLCB0cnVlLCB0cnVlKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdyArIHIsIGNvbCArIGMsIGZhbHNlLCB0cnVlKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZCB2ZXJzaW9uIGluZm8gYml0cyB0byBtYXRyaXhcclxuICpcclxuICogQHBhcmFtICB7Qml0TWF0cml4fSBtYXRyaXggIE1vZHVsZXMgbWF0cml4XHJcbiAqIEBwYXJhbSAge051bWJlcn0gICAgdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cclxuICovXHJcbmZ1bmN0aW9uIHNldHVwVmVyc2lvbkluZm8gKG1hdHJpeCwgdmVyc2lvbikge1xyXG4gIGNvbnN0IHNpemUgPSBtYXRyaXguc2l6ZVxyXG4gIGNvbnN0IGJpdHMgPSBWZXJzaW9uLmdldEVuY29kZWRCaXRzKHZlcnNpb24pXHJcbiAgbGV0IHJvdywgY29sLCBtb2RcclxuXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxODsgaSsrKSB7XHJcbiAgICByb3cgPSBNYXRoLmZsb29yKGkgLyAzKVxyXG4gICAgY29sID0gaSAlIDMgKyBzaXplIC0gOCAtIDNcclxuICAgIG1vZCA9ICgoYml0cyA+PiBpKSAmIDEpID09PSAxXHJcblxyXG4gICAgbWF0cml4LnNldChyb3csIGNvbCwgbW9kLCB0cnVlKVxyXG4gICAgbWF0cml4LnNldChjb2wsIHJvdywgbW9kLCB0cnVlKVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZCBmb3JtYXQgaW5mbyBiaXRzIHRvIG1hdHJpeFxyXG4gKlxyXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCAgICAgICAgICAgICAgIE1vZHVsZXMgbWF0cml4XHJcbiAqIEBwYXJhbSAge0Vycm9yQ29ycmVjdGlvbkxldmVsfSAgICBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXHJcbiAqIEBwYXJhbSAge051bWJlcn0gICAgbWFza1BhdHRlcm4gICAgICAgICAgTWFzayBwYXR0ZXJuIHJlZmVyZW5jZSB2YWx1ZVxyXG4gKi9cclxuZnVuY3Rpb24gc2V0dXBGb3JtYXRJbmZvIChtYXRyaXgsIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrUGF0dGVybikge1xyXG4gIGNvbnN0IHNpemUgPSBtYXRyaXguc2l6ZVxyXG4gIGNvbnN0IGJpdHMgPSBGb3JtYXRJbmZvLmdldEVuY29kZWRCaXRzKGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrUGF0dGVybilcclxuICBsZXQgaSwgbW9kXHJcblxyXG4gIGZvciAoaSA9IDA7IGkgPCAxNTsgaSsrKSB7XHJcbiAgICBtb2QgPSAoKGJpdHMgPj4gaSkgJiAxKSA9PT0gMVxyXG5cclxuICAgIC8vIHZlcnRpY2FsXHJcbiAgICBpZiAoaSA8IDYpIHtcclxuICAgICAgbWF0cml4LnNldChpLCA4LCBtb2QsIHRydWUpXHJcbiAgICB9IGVsc2UgaWYgKGkgPCA4KSB7XHJcbiAgICAgIG1hdHJpeC5zZXQoaSArIDEsIDgsIG1vZCwgdHJ1ZSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG1hdHJpeC5zZXQoc2l6ZSAtIDE1ICsgaSwgOCwgbW9kLCB0cnVlKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGhvcml6b250YWxcclxuICAgIGlmIChpIDwgOCkge1xyXG4gICAgICBtYXRyaXguc2V0KDgsIHNpemUgLSBpIC0gMSwgbW9kLCB0cnVlKVxyXG4gICAgfSBlbHNlIGlmIChpIDwgOSkge1xyXG4gICAgICBtYXRyaXguc2V0KDgsIDE1IC0gaSAtIDEgKyAxLCBtb2QsIHRydWUpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtYXRyaXguc2V0KDgsIDE1IC0gaSAtIDEsIG1vZCwgdHJ1ZSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIGZpeGVkIG1vZHVsZVxyXG4gIG1hdHJpeC5zZXQoc2l6ZSAtIDgsIDgsIDEsIHRydWUpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGQgZW5jb2RlZCBkYXRhIGJpdHMgdG8gbWF0cml4XHJcbiAqXHJcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gIG1hdHJpeCBNb2R1bGVzIG1hdHJpeFxyXG4gKiBAcGFyYW0gIHtVaW50OEFycmF5fSBkYXRhICAgRGF0YSBjb2Rld29yZHNcclxuICovXHJcbmZ1bmN0aW9uIHNldHVwRGF0YSAobWF0cml4LCBkYXRhKSB7XHJcbiAgY29uc3Qgc2l6ZSA9IG1hdHJpeC5zaXplXHJcbiAgbGV0IGluYyA9IC0xXHJcbiAgbGV0IHJvdyA9IHNpemUgLSAxXHJcbiAgbGV0IGJpdEluZGV4ID0gN1xyXG4gIGxldCBieXRlSW5kZXggPSAwXHJcblxyXG4gIGZvciAobGV0IGNvbCA9IHNpemUgLSAxOyBjb2wgPiAwOyBjb2wgLT0gMikge1xyXG4gICAgaWYgKGNvbCA9PT0gNikgY29sLS1cclxuXHJcbiAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICBmb3IgKGxldCBjID0gMDsgYyA8IDI7IGMrKykge1xyXG4gICAgICAgIGlmICghbWF0cml4LmlzUmVzZXJ2ZWQocm93LCBjb2wgLSBjKSkge1xyXG4gICAgICAgICAgbGV0IGRhcmsgPSBmYWxzZVxyXG5cclxuICAgICAgICAgIGlmIChieXRlSW5kZXggPCBkYXRhLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBkYXJrID0gKCgoZGF0YVtieXRlSW5kZXhdID4+PiBiaXRJbmRleCkgJiAxKSA9PT0gMSlcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdywgY29sIC0gYywgZGFyaylcclxuICAgICAgICAgIGJpdEluZGV4LS1cclxuXHJcbiAgICAgICAgICBpZiAoYml0SW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgIGJ5dGVJbmRleCsrXHJcbiAgICAgICAgICAgIGJpdEluZGV4ID0gN1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcm93ICs9IGluY1xyXG5cclxuICAgICAgaWYgKHJvdyA8IDAgfHwgc2l6ZSA8PSByb3cpIHtcclxuICAgICAgICByb3cgLT0gaW5jXHJcbiAgICAgICAgaW5jID0gLWluY1xyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgZW5jb2RlZCBjb2Rld29yZHMgZnJvbSBkYXRhIGlucHV0XHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gICB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cclxuICogQHBhcmFtICB7RXJyb3JDb3JyZWN0aW9uTGV2ZWx9ICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxyXG4gKiBAcGFyYW0gIHtCeXRlRGF0YX0gZGF0YSAgICAgICAgICAgICAgICAgRGF0YSBpbnB1dFxyXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICAgICAgICAgICAgICAgICAgQnVmZmVyIGNvbnRhaW5pbmcgZW5jb2RlZCBjb2Rld29yZHNcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZURhdGEgKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBzZWdtZW50cykge1xyXG4gIC8vIFByZXBhcmUgZGF0YSBidWZmZXJcclxuICBjb25zdCBidWZmZXIgPSBuZXcgQml0QnVmZmVyKClcclxuXHJcbiAgc2VnbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgLy8gcHJlZml4IGRhdGEgd2l0aCBtb2RlIGluZGljYXRvciAoNCBiaXRzKVxyXG4gICAgYnVmZmVyLnB1dChkYXRhLm1vZGUuYml0LCA0KVxyXG5cclxuICAgIC8vIFByZWZpeCBkYXRhIHdpdGggY2hhcmFjdGVyIGNvdW50IGluZGljYXRvci5cclxuICAgIC8vIFRoZSBjaGFyYWN0ZXIgY291bnQgaW5kaWNhdG9yIGlzIGEgc3RyaW5nIG9mIGJpdHMgdGhhdCByZXByZXNlbnRzIHRoZVxyXG4gICAgLy8gbnVtYmVyIG9mIGNoYXJhY3RlcnMgdGhhdCBhcmUgYmVpbmcgZW5jb2RlZC5cclxuICAgIC8vIFRoZSBjaGFyYWN0ZXIgY291bnQgaW5kaWNhdG9yIG11c3QgYmUgcGxhY2VkIGFmdGVyIHRoZSBtb2RlIGluZGljYXRvclxyXG4gICAgLy8gYW5kIG11c3QgYmUgYSBjZXJ0YWluIG51bWJlciBvZiBiaXRzIGxvbmcsIGRlcGVuZGluZyBvbiB0aGUgUVIgdmVyc2lvblxyXG4gICAgLy8gYW5kIGRhdGEgbW9kZVxyXG4gICAgLy8gQHNlZSB7QGxpbmsgTW9kZS5nZXRDaGFyQ291bnRJbmRpY2F0b3J9LlxyXG4gICAgYnVmZmVyLnB1dChkYXRhLmdldExlbmd0aCgpLCBNb2RlLmdldENoYXJDb3VudEluZGljYXRvcihkYXRhLm1vZGUsIHZlcnNpb24pKVxyXG5cclxuICAgIC8vIGFkZCBiaW5hcnkgZGF0YSBzZXF1ZW5jZSB0byBidWZmZXJcclxuICAgIGRhdGEud3JpdGUoYnVmZmVyKVxyXG4gIH0pXHJcblxyXG4gIC8vIENhbGN1bGF0ZSByZXF1aXJlZCBudW1iZXIgb2YgYml0c1xyXG4gIGNvbnN0IHRvdGFsQ29kZXdvcmRzID0gVXRpbHMuZ2V0U3ltYm9sVG90YWxDb2Rld29yZHModmVyc2lvbilcclxuICBjb25zdCBlY1RvdGFsQ29kZXdvcmRzID0gRUNDb2RlLmdldFRvdGFsQ29kZXdvcmRzQ291bnQodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXHJcbiAgY29uc3QgZGF0YVRvdGFsQ29kZXdvcmRzQml0cyA9ICh0b3RhbENvZGV3b3JkcyAtIGVjVG90YWxDb2Rld29yZHMpICogOFxyXG5cclxuICAvLyBBZGQgYSB0ZXJtaW5hdG9yLlxyXG4gIC8vIElmIHRoZSBiaXQgc3RyaW5nIGlzIHNob3J0ZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIHJlcXVpcmVkIGJpdHMsXHJcbiAgLy8gYSB0ZXJtaW5hdG9yIG9mIHVwIHRvIGZvdXIgMHMgbXVzdCBiZSBhZGRlZCB0byB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgc3RyaW5nLlxyXG4gIC8vIElmIHRoZSBiaXQgc3RyaW5nIGlzIG1vcmUgdGhhbiBmb3VyIGJpdHMgc2hvcnRlciB0aGFuIHRoZSByZXF1aXJlZCBudW1iZXIgb2YgYml0cyxcclxuICAvLyBhZGQgZm91ciAwcyB0byB0aGUgZW5kLlxyXG4gIGlmIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgKyA0IDw9IGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMpIHtcclxuICAgIGJ1ZmZlci5wdXQoMCwgNClcclxuICB9XHJcblxyXG4gIC8vIElmIHRoZSBiaXQgc3RyaW5nIGlzIGZld2VyIHRoYW4gZm91ciBiaXRzIHNob3J0ZXIsIGFkZCBvbmx5IHRoZSBudW1iZXIgb2YgMHMgdGhhdFxyXG4gIC8vIGFyZSBuZWVkZWQgdG8gcmVhY2ggdGhlIHJlcXVpcmVkIG51bWJlciBvZiBiaXRzLlxyXG5cclxuICAvLyBBZnRlciBhZGRpbmcgdGhlIHRlcm1pbmF0b3IsIGlmIHRoZSBudW1iZXIgb2YgYml0cyBpbiB0aGUgc3RyaW5nIGlzIG5vdCBhIG11bHRpcGxlIG9mIDgsXHJcbiAgLy8gcGFkIHRoZSBzdHJpbmcgb24gdGhlIHJpZ2h0IHdpdGggMHMgdG8gbWFrZSB0aGUgc3RyaW5nJ3MgbGVuZ3RoIGEgbXVsdGlwbGUgb2YgOC5cclxuICB3aGlsZSAoYnVmZmVyLmdldExlbmd0aEluQml0cygpICUgOCAhPT0gMCkge1xyXG4gICAgYnVmZmVyLnB1dEJpdCgwKVxyXG4gIH1cclxuXHJcbiAgLy8gQWRkIHBhZCBieXRlcyBpZiB0aGUgc3RyaW5nIGlzIHN0aWxsIHNob3J0ZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIHJlcXVpcmVkIGJpdHMuXHJcbiAgLy8gRXh0ZW5kIHRoZSBidWZmZXIgdG8gZmlsbCB0aGUgZGF0YSBjYXBhY2l0eSBvZiB0aGUgc3ltYm9sIGNvcnJlc3BvbmRpbmcgdG9cclxuICAvLyB0aGUgVmVyc2lvbiBhbmQgRXJyb3IgQ29ycmVjdGlvbiBMZXZlbCBieSBhZGRpbmcgdGhlIFBhZCBDb2Rld29yZHMgMTExMDExMDAgKDB4RUMpXHJcbiAgLy8gYW5kIDAwMDEwMDAxICgweDExKSBhbHRlcm5hdGVseS5cclxuICBjb25zdCByZW1haW5pbmdCeXRlID0gKGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMgLSBidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkpIC8gOFxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmVtYWluaW5nQnl0ZTsgaSsrKSB7XHJcbiAgICBidWZmZXIucHV0KGkgJSAyID8gMHgxMSA6IDB4RUMsIDgpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gY3JlYXRlQ29kZXdvcmRzKGJ1ZmZlciwgdmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFbmNvZGUgaW5wdXQgZGF0YSB3aXRoIFJlZWQtU29sb21vbiBhbmQgcmV0dXJuIGNvZGV3b3JkcyB3aXRoXHJcbiAqIHJlbGF0aXZlIGVycm9yIGNvcnJlY3Rpb24gYml0c1xyXG4gKlxyXG4gKiBAcGFyYW0gIHtCaXRCdWZmZXJ9IGJpdEJ1ZmZlciAgICAgICAgICAgIERhdGEgdG8gZW5jb2RlXHJcbiAqIEBwYXJhbSAge051bWJlcn0gICAgdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEBwYXJhbSAge0Vycm9yQ29ycmVjdGlvbkxldmVsfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXHJcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9ICAgICAgICAgICAgICAgICAgICAgQnVmZmVyIGNvbnRhaW5pbmcgZW5jb2RlZCBjb2Rld29yZHNcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZUNvZGV3b3JkcyAoYml0QnVmZmVyLCB2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gIC8vIFRvdGFsIGNvZGV3b3JkcyBmb3IgdGhpcyBRUiBjb2RlIHZlcnNpb24gKERhdGEgKyBFcnJvciBjb3JyZWN0aW9uKVxyXG4gIGNvbnN0IHRvdGFsQ29kZXdvcmRzID0gVXRpbHMuZ2V0U3ltYm9sVG90YWxDb2Rld29yZHModmVyc2lvbilcclxuXHJcbiAgLy8gVG90YWwgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzXHJcbiAgY29uc3QgZWNUb3RhbENvZGV3b3JkcyA9IEVDQ29kZS5nZXRUb3RhbENvZGV3b3Jkc0NvdW50KHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKVxyXG5cclxuICAvLyBUb3RhbCBudW1iZXIgb2YgZGF0YSBjb2Rld29yZHNcclxuICBjb25zdCBkYXRhVG90YWxDb2Rld29yZHMgPSB0b3RhbENvZGV3b3JkcyAtIGVjVG90YWxDb2Rld29yZHNcclxuXHJcbiAgLy8gVG90YWwgbnVtYmVyIG9mIGJsb2Nrc1xyXG4gIGNvbnN0IGVjVG90YWxCbG9ja3MgPSBFQ0NvZGUuZ2V0QmxvY2tzQ291bnQodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXHJcblxyXG4gIC8vIENhbGN1bGF0ZSBob3cgbWFueSBibG9ja3MgZWFjaCBncm91cCBzaG91bGQgY29udGFpblxyXG4gIGNvbnN0IGJsb2Nrc0luR3JvdXAyID0gdG90YWxDb2Rld29yZHMgJSBlY1RvdGFsQmxvY2tzXHJcbiAgY29uc3QgYmxvY2tzSW5Hcm91cDEgPSBlY1RvdGFsQmxvY2tzIC0gYmxvY2tzSW5Hcm91cDJcclxuXHJcbiAgY29uc3QgdG90YWxDb2Rld29yZHNJbkdyb3VwMSA9IE1hdGguZmxvb3IodG90YWxDb2Rld29yZHMgLyBlY1RvdGFsQmxvY2tzKVxyXG5cclxuICBjb25zdCBkYXRhQ29kZXdvcmRzSW5Hcm91cDEgPSBNYXRoLmZsb29yKGRhdGFUb3RhbENvZGV3b3JkcyAvIGVjVG90YWxCbG9ja3MpXHJcbiAgY29uc3QgZGF0YUNvZGV3b3Jkc0luR3JvdXAyID0gZGF0YUNvZGV3b3Jkc0luR3JvdXAxICsgMVxyXG5cclxuICAvLyBOdW1iZXIgb2YgRUMgY29kZXdvcmRzIGlzIHRoZSBzYW1lIGZvciBib3RoIGdyb3Vwc1xyXG4gIGNvbnN0IGVjQ291bnQgPSB0b3RhbENvZGV3b3Jkc0luR3JvdXAxIC0gZGF0YUNvZGV3b3Jkc0luR3JvdXAxXHJcblxyXG4gIC8vIEluaXRpYWxpemUgYSBSZWVkLVNvbG9tb24gZW5jb2RlciB3aXRoIGEgZ2VuZXJhdG9yIHBvbHlub21pYWwgb2YgZGVncmVlIGVjQ291bnRcclxuICBjb25zdCBycyA9IG5ldyBSZWVkU29sb21vbkVuY29kZXIoZWNDb3VudClcclxuXHJcbiAgbGV0IG9mZnNldCA9IDBcclxuICBjb25zdCBkY0RhdGEgPSBuZXcgQXJyYXkoZWNUb3RhbEJsb2NrcylcclxuICBjb25zdCBlY0RhdGEgPSBuZXcgQXJyYXkoZWNUb3RhbEJsb2NrcylcclxuICBsZXQgbWF4RGF0YVNpemUgPSAwXHJcbiAgY29uc3QgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYml0QnVmZmVyLmJ1ZmZlcilcclxuXHJcbiAgLy8gRGl2aWRlIHRoZSBidWZmZXIgaW50byB0aGUgcmVxdWlyZWQgbnVtYmVyIG9mIGJsb2Nrc1xyXG4gIGZvciAobGV0IGIgPSAwOyBiIDwgZWNUb3RhbEJsb2NrczsgYisrKSB7XHJcbiAgICBjb25zdCBkYXRhU2l6ZSA9IGIgPCBibG9ja3NJbkdyb3VwMSA/IGRhdGFDb2Rld29yZHNJbkdyb3VwMSA6IGRhdGFDb2Rld29yZHNJbkdyb3VwMlxyXG5cclxuICAgIC8vIGV4dHJhY3QgYSBibG9jayBvZiBkYXRhIGZyb20gYnVmZmVyXHJcbiAgICBkY0RhdGFbYl0gPSBidWZmZXIuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyBkYXRhU2l6ZSlcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgRUMgY29kZXdvcmRzIGZvciB0aGlzIGRhdGEgYmxvY2tcclxuICAgIGVjRGF0YVtiXSA9IHJzLmVuY29kZShkY0RhdGFbYl0pXHJcblxyXG4gICAgb2Zmc2V0ICs9IGRhdGFTaXplXHJcbiAgICBtYXhEYXRhU2l6ZSA9IE1hdGgubWF4KG1heERhdGFTaXplLCBkYXRhU2l6ZSlcclxuICB9XHJcblxyXG4gIC8vIENyZWF0ZSBmaW5hbCBkYXRhXHJcbiAgLy8gSW50ZXJsZWF2ZSB0aGUgZGF0YSBhbmQgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHMgZnJvbSBlYWNoIGJsb2NrXHJcbiAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KHRvdGFsQ29kZXdvcmRzKVxyXG4gIGxldCBpbmRleCA9IDBcclxuICBsZXQgaSwgclxyXG5cclxuICAvLyBBZGQgZGF0YSBjb2Rld29yZHNcclxuICBmb3IgKGkgPSAwOyBpIDwgbWF4RGF0YVNpemU7IGkrKykge1xyXG4gICAgZm9yIChyID0gMDsgciA8IGVjVG90YWxCbG9ja3M7IHIrKykge1xyXG4gICAgICBpZiAoaSA8IGRjRGF0YVtyXS5sZW5ndGgpIHtcclxuICAgICAgICBkYXRhW2luZGV4KytdID0gZGNEYXRhW3JdW2ldXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEFwcGVkIEVDIGNvZGV3b3Jkc1xyXG4gIGZvciAoaSA9IDA7IGkgPCBlY0NvdW50OyBpKyspIHtcclxuICAgIGZvciAociA9IDA7IHIgPCBlY1RvdGFsQmxvY2tzOyByKyspIHtcclxuICAgICAgZGF0YVtpbmRleCsrXSA9IGVjRGF0YVtyXVtpXVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGRhdGFcclxufVxyXG5cclxuLyoqXHJcbiAqIEJ1aWxkIFFSIENvZGUgc3ltYm9sXHJcbiAqXHJcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YSAgICAgICAgICAgICAgICAgSW5wdXQgc3RyaW5nXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEBwYXJhbSAge0Vycm9yQ29ycmV0aW9uTGV2ZWx9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGxldmVsXHJcbiAqIEBwYXJhbSAge01hc2tQYXR0ZXJufSBtYXNrUGF0dGVybiAgICAgTWFzayBwYXR0ZXJuXHJcbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgICAgICAgICAgICAgT2JqZWN0IGNvbnRhaW5pbmcgc3ltYm9sIGRhdGFcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZVN5bWJvbCAoZGF0YSwgdmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2tQYXR0ZXJuKSB7XHJcbiAgbGV0IHNlZ21lbnRzXHJcblxyXG4gIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XHJcbiAgICBzZWdtZW50cyA9IFNlZ21lbnRzLmZyb21BcnJheShkYXRhKVxyXG4gIH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XHJcbiAgICBsZXQgZXN0aW1hdGVkVmVyc2lvbiA9IHZlcnNpb25cclxuXHJcbiAgICBpZiAoIWVzdGltYXRlZFZlcnNpb24pIHtcclxuICAgICAgY29uc3QgcmF3U2VnbWVudHMgPSBTZWdtZW50cy5yYXdTcGxpdChkYXRhKVxyXG5cclxuICAgICAgLy8gRXN0aW1hdGUgYmVzdCB2ZXJzaW9uIHRoYXQgY2FuIGNvbnRhaW4gcmF3IHNwbGl0dGVkIHNlZ21lbnRzXHJcbiAgICAgIGVzdGltYXRlZFZlcnNpb24gPSBWZXJzaW9uLmdldEJlc3RWZXJzaW9uRm9yRGF0YShyYXdTZWdtZW50cywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gQnVpbGQgb3B0aW1pemVkIHNlZ21lbnRzXHJcbiAgICAvLyBJZiBlc3RpbWF0ZWQgdmVyc2lvbiBpcyB1bmRlZmluZWQsIHRyeSB3aXRoIHRoZSBoaWdoZXN0IHZlcnNpb25cclxuICAgIHNlZ21lbnRzID0gU2VnbWVudHMuZnJvbVN0cmluZyhkYXRhLCBlc3RpbWF0ZWRWZXJzaW9uIHx8IDQwKVxyXG4gIH0gZWxzZSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZGF0YScpXHJcbiAgfVxyXG5cclxuICAvLyBHZXQgdGhlIG1pbiB2ZXJzaW9uIHRoYXQgY2FuIGNvbnRhaW4gZGF0YVxyXG4gIGNvbnN0IGJlc3RWZXJzaW9uID0gVmVyc2lvbi5nZXRCZXN0VmVyc2lvbkZvckRhdGEoc2VnbWVudHMsIGVycm9yQ29ycmVjdGlvbkxldmVsKVxyXG5cclxuICAvLyBJZiBubyB2ZXJzaW9uIGlzIGZvdW5kLCBkYXRhIGNhbm5vdCBiZSBzdG9yZWRcclxuICBpZiAoIWJlc3RWZXJzaW9uKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBhbW91bnQgb2YgZGF0YSBpcyB0b28gYmlnIHRvIGJlIHN0b3JlZCBpbiBhIFFSIENvZGUnKVxyXG4gIH1cclxuXHJcbiAgLy8gSWYgbm90IHNwZWNpZmllZCwgdXNlIG1pbiB2ZXJzaW9uIGFzIGRlZmF1bHRcclxuICBpZiAoIXZlcnNpb24pIHtcclxuICAgIHZlcnNpb24gPSBiZXN0VmVyc2lvblxyXG5cclxuICAvLyBDaGVjayBpZiB0aGUgc3BlY2lmaWVkIHZlcnNpb24gY2FuIGNvbnRhaW4gdGhlIGRhdGFcclxuICB9IGVsc2UgaWYgKHZlcnNpb24gPCBiZXN0VmVyc2lvbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdcXG4nICtcclxuICAgICAgJ1RoZSBjaG9zZW4gUVIgQ29kZSB2ZXJzaW9uIGNhbm5vdCBjb250YWluIHRoaXMgYW1vdW50IG9mIGRhdGEuXFxuJyArXHJcbiAgICAgICdNaW5pbXVtIHZlcnNpb24gcmVxdWlyZWQgdG8gc3RvcmUgY3VycmVudCBkYXRhIGlzOiAnICsgYmVzdFZlcnNpb24gKyAnLlxcbidcclxuICAgIClcclxuICB9XHJcblxyXG4gIGNvbnN0IGRhdGFCaXRzID0gY3JlYXRlRGF0YSh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgc2VnbWVudHMpXHJcblxyXG4gIC8vIEFsbG9jYXRlIG1hdHJpeCBidWZmZXJcclxuICBjb25zdCBtb2R1bGVDb3VudCA9IFV0aWxzLmdldFN5bWJvbFNpemUodmVyc2lvbilcclxuICBjb25zdCBtb2R1bGVzID0gbmV3IEJpdE1hdHJpeChtb2R1bGVDb3VudClcclxuXHJcbiAgLy8gQWRkIGZ1bmN0aW9uIG1vZHVsZXNcclxuICBzZXR1cEZpbmRlclBhdHRlcm4obW9kdWxlcywgdmVyc2lvbilcclxuICBzZXR1cFRpbWluZ1BhdHRlcm4obW9kdWxlcylcclxuICBzZXR1cEFsaWdubWVudFBhdHRlcm4obW9kdWxlcywgdmVyc2lvbilcclxuXHJcbiAgLy8gQWRkIHRlbXBvcmFyeSBkdW1teSBiaXRzIGZvciBmb3JtYXQgaW5mbyBqdXN0IHRvIHNldCB0aGVtIGFzIHJlc2VydmVkLlxyXG4gIC8vIFRoaXMgaXMgbmVlZGVkIHRvIHByZXZlbnQgdGhlc2UgYml0cyBmcm9tIGJlaW5nIG1hc2tlZCBieSB7QGxpbmsgTWFza1BhdHRlcm4uYXBwbHlNYXNrfVxyXG4gIC8vIHNpbmNlIHRoZSBtYXNraW5nIG9wZXJhdGlvbiBtdXN0IGJlIHBlcmZvcm1lZCBvbmx5IG9uIHRoZSBlbmNvZGluZyByZWdpb24uXHJcbiAgLy8gVGhlc2UgYmxvY2tzIHdpbGwgYmUgcmVwbGFjZWQgd2l0aCBjb3JyZWN0IHZhbHVlcyBsYXRlciBpbiBjb2RlLlxyXG4gIHNldHVwRm9ybWF0SW5mbyhtb2R1bGVzLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgMClcclxuXHJcbiAgaWYgKHZlcnNpb24gPj0gNykge1xyXG4gICAgc2V0dXBWZXJzaW9uSW5mbyhtb2R1bGVzLCB2ZXJzaW9uKVxyXG4gIH1cclxuXHJcbiAgLy8gQWRkIGRhdGEgY29kZXdvcmRzXHJcbiAgc2V0dXBEYXRhKG1vZHVsZXMsIGRhdGFCaXRzKVxyXG5cclxuICBpZiAoaXNOYU4obWFza1BhdHRlcm4pKSB7XHJcbiAgICAvLyBGaW5kIGJlc3QgbWFzayBwYXR0ZXJuXHJcbiAgICBtYXNrUGF0dGVybiA9IE1hc2tQYXR0ZXJuLmdldEJlc3RNYXNrKG1vZHVsZXMsXHJcbiAgICAgIHNldHVwRm9ybWF0SW5mby5iaW5kKG51bGwsIG1vZHVsZXMsIGVycm9yQ29ycmVjdGlvbkxldmVsKSlcclxuICB9XHJcblxyXG4gIC8vIEFwcGx5IG1hc2sgcGF0dGVyblxyXG4gIE1hc2tQYXR0ZXJuLmFwcGx5TWFzayhtYXNrUGF0dGVybiwgbW9kdWxlcylcclxuXHJcbiAgLy8gUmVwbGFjZSBmb3JtYXQgaW5mbyBiaXRzIHdpdGggY29ycmVjdCB2YWx1ZXNcclxuICBzZXR1cEZvcm1hdEluZm8obW9kdWxlcywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2tQYXR0ZXJuKVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgbW9kdWxlczogbW9kdWxlcyxcclxuICAgIHZlcnNpb246IHZlcnNpb24sXHJcbiAgICBlcnJvckNvcnJlY3Rpb25MZXZlbDogZXJyb3JDb3JyZWN0aW9uTGV2ZWwsXHJcbiAgICBtYXNrUGF0dGVybjogbWFza1BhdHRlcm4sXHJcbiAgICBzZWdtZW50czogc2VnbWVudHNcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBRUiBDb2RlXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nIHwgQXJyYXl9IGRhdGEgICAgICAgICAgICAgICAgIElucHV0IGRhdGFcclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgICAgICAgICAgICAgICAgICAgICAgT3B0aW9uYWwgY29uZmlndXJhdGlvbnNcclxuICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMudmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLmVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gb3B0aW9ucy50b1NKSVNGdW5jICAgICAgICAgSGVscGVyIGZ1bmMgdG8gY29udmVydCB1dGY4IHRvIHNqaXNcclxuICovXHJcbmV4cG9ydHMuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlIChkYXRhLCBvcHRpb25zKSB7XHJcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyB8fCBkYXRhID09PSAnJykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBpbnB1dCB0ZXh0JylcclxuICB9XHJcblxyXG4gIGxldCBlcnJvckNvcnJlY3Rpb25MZXZlbCA9IEVDTGV2ZWwuTVxyXG4gIGxldCB2ZXJzaW9uXHJcbiAgbGV0IG1hc2tcclxuXHJcbiAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgLy8gVXNlIGhpZ2hlciBlcnJvciBjb3JyZWN0aW9uIGxldmVsIGFzIGRlZmF1bHRcclxuICAgIGVycm9yQ29ycmVjdGlvbkxldmVsID0gRUNMZXZlbC5mcm9tKG9wdGlvbnMuZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIEVDTGV2ZWwuTSlcclxuICAgIHZlcnNpb24gPSBWZXJzaW9uLmZyb20ob3B0aW9ucy52ZXJzaW9uKVxyXG4gICAgbWFzayA9IE1hc2tQYXR0ZXJuLmZyb20ob3B0aW9ucy5tYXNrUGF0dGVybilcclxuXHJcbiAgICBpZiAob3B0aW9ucy50b1NKSVNGdW5jKSB7XHJcbiAgICAgIFV0aWxzLnNldFRvU0pJU0Z1bmN0aW9uKG9wdGlvbnMudG9TSklTRnVuYylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBjcmVhdGVTeW1ib2woZGF0YSwgdmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2spXHJcbn1cclxuIiwiZnVuY3Rpb24gaGV4MnJnYmEgKGhleCkge1xyXG4gIGlmICh0eXBlb2YgaGV4ID09PSAnbnVtYmVyJykge1xyXG4gICAgaGV4ID0gaGV4LnRvU3RyaW5nKClcclxuICB9XHJcblxyXG4gIGlmICh0eXBlb2YgaGV4ICE9PSAnc3RyaW5nJykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb2xvciBzaG91bGQgYmUgZGVmaW5lZCBhcyBoZXggc3RyaW5nJylcclxuICB9XHJcblxyXG4gIGxldCBoZXhDb2RlID0gaGV4LnNsaWNlKCkucmVwbGFjZSgnIycsICcnKS5zcGxpdCgnJylcclxuICBpZiAoaGV4Q29kZS5sZW5ndGggPCAzIHx8IGhleENvZGUubGVuZ3RoID09PSA1IHx8IGhleENvZGUubGVuZ3RoID4gOCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBjb2xvcjogJyArIGhleClcclxuICB9XHJcblxyXG4gIC8vIENvbnZlcnQgZnJvbSBzaG9ydCB0byBsb25nIGZvcm0gKGZmZiAtPiBmZmZmZmYpXHJcbiAgaWYgKGhleENvZGUubGVuZ3RoID09PSAzIHx8IGhleENvZGUubGVuZ3RoID09PSA0KSB7XHJcbiAgICBoZXhDb2RlID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgaGV4Q29kZS5tYXAoZnVuY3Rpb24gKGMpIHtcclxuICAgICAgcmV0dXJuIFtjLCBjXVxyXG4gICAgfSkpXHJcbiAgfVxyXG5cclxuICAvLyBBZGQgZGVmYXVsdCBhbHBoYSB2YWx1ZVxyXG4gIGlmIChoZXhDb2RlLmxlbmd0aCA9PT0gNikgaGV4Q29kZS5wdXNoKCdGJywgJ0YnKVxyXG5cclxuICBjb25zdCBoZXhWYWx1ZSA9IHBhcnNlSW50KGhleENvZGUuam9pbignJyksIDE2KVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcjogKGhleFZhbHVlID4+IDI0KSAmIDI1NSxcclxuICAgIGc6IChoZXhWYWx1ZSA+PiAxNikgJiAyNTUsXHJcbiAgICBiOiAoaGV4VmFsdWUgPj4gOCkgJiAyNTUsXHJcbiAgICBhOiBoZXhWYWx1ZSAmIDI1NSxcclxuICAgIGhleDogJyMnICsgaGV4Q29kZS5zbGljZSgwLCA2KS5qb2luKCcnKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0cy5nZXRPcHRpb25zID0gZnVuY3Rpb24gZ2V0T3B0aW9ucyAob3B0aW9ucykge1xyXG4gIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9XHJcbiAgaWYgKCFvcHRpb25zLmNvbG9yKSBvcHRpb25zLmNvbG9yID0ge31cclxuXHJcbiAgY29uc3QgbWFyZ2luID0gdHlwZW9mIG9wdGlvbnMubWFyZ2luID09PSAndW5kZWZpbmVkJyB8fFxyXG4gICAgb3B0aW9ucy5tYXJnaW4gPT09IG51bGwgfHxcclxuICAgIG9wdGlvbnMubWFyZ2luIDwgMFxyXG4gICAgPyA0XHJcbiAgICA6IG9wdGlvbnMubWFyZ2luXHJcblxyXG4gIGNvbnN0IHdpZHRoID0gb3B0aW9ucy53aWR0aCAmJiBvcHRpb25zLndpZHRoID49IDIxID8gb3B0aW9ucy53aWR0aCA6IHVuZGVmaW5lZFxyXG4gIGNvbnN0IHNjYWxlID0gb3B0aW9ucy5zY2FsZSB8fCA0XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICB3aWR0aDogd2lkdGgsXHJcbiAgICBzY2FsZTogd2lkdGggPyA0IDogc2NhbGUsXHJcbiAgICBtYXJnaW46IG1hcmdpbixcclxuICAgIGNvbG9yOiB7XHJcbiAgICAgIGRhcms6IGhleDJyZ2JhKG9wdGlvbnMuY29sb3IuZGFyayB8fCAnIzAwMDAwMGZmJyksXHJcbiAgICAgIGxpZ2h0OiBoZXgycmdiYShvcHRpb25zLmNvbG9yLmxpZ2h0IHx8ICcjZmZmZmZmZmYnKVxyXG4gICAgfSxcclxuICAgIHR5cGU6IG9wdGlvbnMudHlwZSxcclxuICAgIHJlbmRlcmVyT3B0czogb3B0aW9ucy5yZW5kZXJlck9wdHMgfHwge31cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydHMuZ2V0U2NhbGUgPSBmdW5jdGlvbiBnZXRTY2FsZSAocXJTaXplLCBvcHRzKSB7XHJcbiAgcmV0dXJuIG9wdHMud2lkdGggJiYgb3B0cy53aWR0aCA+PSBxclNpemUgKyBvcHRzLm1hcmdpbiAqIDJcclxuICAgID8gb3B0cy53aWR0aCAvIChxclNpemUgKyBvcHRzLm1hcmdpbiAqIDIpXHJcbiAgICA6IG9wdHMuc2NhbGVcclxufVxyXG5cclxuZXhwb3J0cy5nZXRJbWFnZVdpZHRoID0gZnVuY3Rpb24gZ2V0SW1hZ2VXaWR0aCAocXJTaXplLCBvcHRzKSB7XHJcbiAgY29uc3Qgc2NhbGUgPSBleHBvcnRzLmdldFNjYWxlKHFyU2l6ZSwgb3B0cylcclxuICByZXR1cm4gTWF0aC5mbG9vcigocXJTaXplICsgb3B0cy5tYXJnaW4gKiAyKSAqIHNjYWxlKVxyXG59XHJcblxyXG5leHBvcnRzLnFyVG9JbWFnZURhdGEgPSBmdW5jdGlvbiBxclRvSW1hZ2VEYXRhIChpbWdEYXRhLCBxciwgb3B0cykge1xyXG4gIGNvbnN0IHNpemUgPSBxci5tb2R1bGVzLnNpemVcclxuICBjb25zdCBkYXRhID0gcXIubW9kdWxlcy5kYXRhXHJcbiAgY29uc3Qgc2NhbGUgPSBleHBvcnRzLmdldFNjYWxlKHNpemUsIG9wdHMpXHJcbiAgY29uc3Qgc3ltYm9sU2l6ZSA9IE1hdGguZmxvb3IoKHNpemUgKyBvcHRzLm1hcmdpbiAqIDIpICogc2NhbGUpXHJcbiAgY29uc3Qgc2NhbGVkTWFyZ2luID0gb3B0cy5tYXJnaW4gKiBzY2FsZVxyXG4gIGNvbnN0IHBhbGV0dGUgPSBbb3B0cy5jb2xvci5saWdodCwgb3B0cy5jb2xvci5kYXJrXVxyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IHN5bWJvbFNpemU7IGkrKykge1xyXG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBzeW1ib2xTaXplOyBqKyspIHtcclxuICAgICAgbGV0IHBvc0RzdCA9IChpICogc3ltYm9sU2l6ZSArIGopICogNFxyXG4gICAgICBsZXQgcHhDb2xvciA9IG9wdHMuY29sb3IubGlnaHRcclxuXHJcbiAgICAgIGlmIChpID49IHNjYWxlZE1hcmdpbiAmJiBqID49IHNjYWxlZE1hcmdpbiAmJlxyXG4gICAgICAgIGkgPCBzeW1ib2xTaXplIC0gc2NhbGVkTWFyZ2luICYmIGogPCBzeW1ib2xTaXplIC0gc2NhbGVkTWFyZ2luKSB7XHJcbiAgICAgICAgY29uc3QgaVNyYyA9IE1hdGguZmxvb3IoKGkgLSBzY2FsZWRNYXJnaW4pIC8gc2NhbGUpXHJcbiAgICAgICAgY29uc3QgalNyYyA9IE1hdGguZmxvb3IoKGogLSBzY2FsZWRNYXJnaW4pIC8gc2NhbGUpXHJcbiAgICAgICAgcHhDb2xvciA9IHBhbGV0dGVbZGF0YVtpU3JjICogc2l6ZSArIGpTcmNdID8gMSA6IDBdXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGltZ0RhdGFbcG9zRHN0KytdID0gcHhDb2xvci5yXHJcbiAgICAgIGltZ0RhdGFbcG9zRHN0KytdID0gcHhDb2xvci5nXHJcbiAgICAgIGltZ0RhdGFbcG9zRHN0KytdID0gcHhDb2xvci5iXHJcbiAgICAgIGltZ0RhdGFbcG9zRHN0XSA9IHB4Q29sb3IuYVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJjb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5cclxuZnVuY3Rpb24gY2xlYXJDYW52YXMgKGN0eCwgY2FudmFzLCBzaXplKSB7XHJcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpXHJcblxyXG4gIGlmICghY2FudmFzLnN0eWxlKSBjYW52YXMuc3R5bGUgPSB7fVxyXG4gIGNhbnZhcy5oZWlnaHQgPSBzaXplXHJcbiAgY2FudmFzLndpZHRoID0gc2l6ZVxyXG4gIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBzaXplICsgJ3B4J1xyXG4gIGNhbnZhcy5zdHlsZS53aWR0aCA9IHNpemUgKyAncHgnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENhbnZhc0VsZW1lbnQgKCkge1xyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBuZWVkIHRvIHNwZWNpZnkgYSBjYW52YXMgZWxlbWVudCcpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnRzLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlciAocXJEYXRhLCBjYW52YXMsIG9wdGlvbnMpIHtcclxuICBsZXQgb3B0cyA9IG9wdGlvbnNcclxuICBsZXQgY2FudmFzRWwgPSBjYW52YXNcclxuXHJcbiAgaWYgKHR5cGVvZiBvcHRzID09PSAndW5kZWZpbmVkJyAmJiAoIWNhbnZhcyB8fCAhY2FudmFzLmdldENvbnRleHQpKSB7XHJcbiAgICBvcHRzID0gY2FudmFzXHJcbiAgICBjYW52YXMgPSB1bmRlZmluZWRcclxuICB9XHJcblxyXG4gIGlmICghY2FudmFzKSB7XHJcbiAgICBjYW52YXNFbCA9IGdldENhbnZhc0VsZW1lbnQoKVxyXG4gIH1cclxuXHJcbiAgb3B0cyA9IFV0aWxzLmdldE9wdGlvbnMob3B0cylcclxuICBjb25zdCBzaXplID0gVXRpbHMuZ2V0SW1hZ2VXaWR0aChxckRhdGEubW9kdWxlcy5zaXplLCBvcHRzKVxyXG5cclxuICBjb25zdCBjdHggPSBjYW52YXNFbC5nZXRDb250ZXh0KCcyZCcpXHJcbiAgY29uc3QgaW1hZ2UgPSBjdHguY3JlYXRlSW1hZ2VEYXRhKHNpemUsIHNpemUpXHJcbiAgVXRpbHMucXJUb0ltYWdlRGF0YShpbWFnZS5kYXRhLCBxckRhdGEsIG9wdHMpXHJcblxyXG4gIGNsZWFyQ2FudmFzKGN0eCwgY2FudmFzRWwsIHNpemUpXHJcbiAgY3R4LnB1dEltYWdlRGF0YShpbWFnZSwgMCwgMClcclxuXHJcbiAgcmV0dXJuIGNhbnZhc0VsXHJcbn1cclxuXHJcbmV4cG9ydHMucmVuZGVyVG9EYXRhVVJMID0gZnVuY3Rpb24gcmVuZGVyVG9EYXRhVVJMIChxckRhdGEsIGNhbnZhcywgb3B0aW9ucykge1xyXG4gIGxldCBvcHRzID0gb3B0aW9uc1xyXG5cclxuICBpZiAodHlwZW9mIG9wdHMgPT09ICd1bmRlZmluZWQnICYmICghY2FudmFzIHx8ICFjYW52YXMuZ2V0Q29udGV4dCkpIHtcclxuICAgIG9wdHMgPSBjYW52YXNcclxuICAgIGNhbnZhcyA9IHVuZGVmaW5lZFxyXG4gIH1cclxuXHJcbiAgaWYgKCFvcHRzKSBvcHRzID0ge31cclxuXHJcbiAgY29uc3QgY2FudmFzRWwgPSBleHBvcnRzLnJlbmRlcihxckRhdGEsIGNhbnZhcywgb3B0cylcclxuXHJcbiAgY29uc3QgdHlwZSA9IG9wdHMudHlwZSB8fCAnaW1hZ2UvcG5nJ1xyXG4gIGNvbnN0IHJlbmRlcmVyT3B0cyA9IG9wdHMucmVuZGVyZXJPcHRzIHx8IHt9XHJcblxyXG4gIHJldHVybiBjYW52YXNFbC50b0RhdGFVUkwodHlwZSwgcmVuZGVyZXJPcHRzLnF1YWxpdHkpXHJcbn1cclxuIiwiY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcclxuXHJcbmZ1bmN0aW9uIGdldENvbG9yQXR0cmliIChjb2xvciwgYXR0cmliKSB7XHJcbiAgY29uc3QgYWxwaGEgPSBjb2xvci5hIC8gMjU1XHJcbiAgY29uc3Qgc3RyID0gYXR0cmliICsgJz1cIicgKyBjb2xvci5oZXggKyAnXCInXHJcblxyXG4gIHJldHVybiBhbHBoYSA8IDFcclxuICAgID8gc3RyICsgJyAnICsgYXR0cmliICsgJy1vcGFjaXR5PVwiJyArIGFscGhhLnRvRml4ZWQoMikuc2xpY2UoMSkgKyAnXCInXHJcbiAgICA6IHN0clxyXG59XHJcblxyXG5mdW5jdGlvbiBzdmdDbWQgKGNtZCwgeCwgeSkge1xyXG4gIGxldCBzdHIgPSBjbWQgKyB4XHJcbiAgaWYgKHR5cGVvZiB5ICE9PSAndW5kZWZpbmVkJykgc3RyICs9ICcgJyArIHlcclxuXHJcbiAgcmV0dXJuIHN0clxyXG59XHJcblxyXG5mdW5jdGlvbiBxclRvUGF0aCAoZGF0YSwgc2l6ZSwgbWFyZ2luKSB7XHJcbiAgbGV0IHBhdGggPSAnJ1xyXG4gIGxldCBtb3ZlQnkgPSAwXHJcbiAgbGV0IG5ld1JvdyA9IGZhbHNlXHJcbiAgbGV0IGxpbmVMZW5ndGggPSAwXHJcblxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgY29sID0gTWF0aC5mbG9vcihpICUgc2l6ZSlcclxuICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoaSAvIHNpemUpXHJcblxyXG4gICAgaWYgKCFjb2wgJiYgIW5ld1JvdykgbmV3Um93ID0gdHJ1ZVxyXG5cclxuICAgIGlmIChkYXRhW2ldKSB7XHJcbiAgICAgIGxpbmVMZW5ndGgrK1xyXG5cclxuICAgICAgaWYgKCEoaSA+IDAgJiYgY29sID4gMCAmJiBkYXRhW2kgLSAxXSkpIHtcclxuICAgICAgICBwYXRoICs9IG5ld1Jvd1xyXG4gICAgICAgICAgPyBzdmdDbWQoJ00nLCBjb2wgKyBtYXJnaW4sIDAuNSArIHJvdyArIG1hcmdpbilcclxuICAgICAgICAgIDogc3ZnQ21kKCdtJywgbW92ZUJ5LCAwKVxyXG5cclxuICAgICAgICBtb3ZlQnkgPSAwXHJcbiAgICAgICAgbmV3Um93ID0gZmFsc2VcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCEoY29sICsgMSA8IHNpemUgJiYgZGF0YVtpICsgMV0pKSB7XHJcbiAgICAgICAgcGF0aCArPSBzdmdDbWQoJ2gnLCBsaW5lTGVuZ3RoKVxyXG4gICAgICAgIGxpbmVMZW5ndGggPSAwXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG1vdmVCeSsrXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcGF0aFxyXG59XHJcblxyXG5leHBvcnRzLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlciAocXJEYXRhLCBvcHRpb25zLCBjYikge1xyXG4gIGNvbnN0IG9wdHMgPSBVdGlscy5nZXRPcHRpb25zKG9wdGlvbnMpXHJcbiAgY29uc3Qgc2l6ZSA9IHFyRGF0YS5tb2R1bGVzLnNpemVcclxuICBjb25zdCBkYXRhID0gcXJEYXRhLm1vZHVsZXMuZGF0YVxyXG4gIGNvbnN0IHFyY29kZXNpemUgPSBzaXplICsgb3B0cy5tYXJnaW4gKiAyXHJcblxyXG4gIGNvbnN0IGJnID0gIW9wdHMuY29sb3IubGlnaHQuYVxyXG4gICAgPyAnJ1xyXG4gICAgOiAnPHBhdGggJyArIGdldENvbG9yQXR0cmliKG9wdHMuY29sb3IubGlnaHQsICdmaWxsJykgK1xyXG4gICAgICAnIGQ9XCJNMCAwaCcgKyBxcmNvZGVzaXplICsgJ3YnICsgcXJjb2Rlc2l6ZSArICdIMHpcIi8+J1xyXG5cclxuICBjb25zdCBwYXRoID1cclxuICAgICc8cGF0aCAnICsgZ2V0Q29sb3JBdHRyaWIob3B0cy5jb2xvci5kYXJrLCAnc3Ryb2tlJykgK1xyXG4gICAgJyBkPVwiJyArIHFyVG9QYXRoKGRhdGEsIHNpemUsIG9wdHMubWFyZ2luKSArICdcIi8+J1xyXG5cclxuICBjb25zdCB2aWV3Qm94ID0gJ3ZpZXdCb3g9XCInICsgJzAgMCAnICsgcXJjb2Rlc2l6ZSArICcgJyArIHFyY29kZXNpemUgKyAnXCInXHJcblxyXG4gIGNvbnN0IHdpZHRoID0gIW9wdHMud2lkdGggPyAnJyA6ICd3aWR0aD1cIicgKyBvcHRzLndpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBvcHRzLndpZHRoICsgJ1wiICdcclxuXHJcbiAgY29uc3Qgc3ZnVGFnID0gJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiICcgKyB3aWR0aCArIHZpZXdCb3ggKyAnIHNoYXBlLXJlbmRlcmluZz1cImNyaXNwRWRnZXNcIj4nICsgYmcgKyBwYXRoICsgJzwvc3ZnPlxcbidcclxuXHJcbiAgaWYgKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgY2IobnVsbCwgc3ZnVGFnKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHN2Z1RhZ1xyXG59XHJcbiIsIlxyXG5jb25zdCBjYW5Qcm9taXNlID0gcmVxdWlyZSgnLi9jYW4tcHJvbWlzZScpXHJcblxyXG5jb25zdCBRUkNvZGUgPSByZXF1aXJlKCcuL2NvcmUvcXJjb2RlJylcclxuY29uc3QgQ2FudmFzUmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcmVyL2NhbnZhcycpXHJcbmNvbnN0IFN2Z1JlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlci9zdmctdGFnLmpzJylcclxuXHJcbmZ1bmN0aW9uIHJlbmRlckNhbnZhcyAocmVuZGVyRnVuYywgY2FudmFzLCB0ZXh0LCBvcHRzLCBjYikge1xyXG4gIGNvbnN0IGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcclxuICBjb25zdCBhcmdzTnVtID0gYXJncy5sZW5ndGhcclxuICBjb25zdCBpc0xhc3RBcmdDYiA9IHR5cGVvZiBhcmdzW2FyZ3NOdW0gLSAxXSA9PT0gJ2Z1bmN0aW9uJ1xyXG5cclxuICBpZiAoIWlzTGFzdEFyZ0NiICYmICFjYW5Qcm9taXNlKCkpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignQ2FsbGJhY2sgcmVxdWlyZWQgYXMgbGFzdCBhcmd1bWVudCcpXHJcbiAgfVxyXG5cclxuICBpZiAoaXNMYXN0QXJnQ2IpIHtcclxuICAgIGlmIChhcmdzTnVtIDwgMikge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RvbyBmZXcgYXJndW1lbnRzIHByb3ZpZGVkJylcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYXJnc051bSA9PT0gMikge1xyXG4gICAgICBjYiA9IHRleHRcclxuICAgICAgdGV4dCA9IGNhbnZhc1xyXG4gICAgICBjYW52YXMgPSBvcHRzID0gdW5kZWZpbmVkXHJcbiAgICB9IGVsc2UgaWYgKGFyZ3NOdW0gPT09IDMpIHtcclxuICAgICAgaWYgKGNhbnZhcy5nZXRDb250ZXh0ICYmIHR5cGVvZiBjYiA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICBjYiA9IG9wdHNcclxuICAgICAgICBvcHRzID0gdW5kZWZpbmVkXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2IgPSBvcHRzXHJcbiAgICAgICAgb3B0cyA9IHRleHRcclxuICAgICAgICB0ZXh0ID0gY2FudmFzXHJcbiAgICAgICAgY2FudmFzID0gdW5kZWZpbmVkXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgaWYgKGFyZ3NOdW0gPCAxKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVG9vIGZldyBhcmd1bWVudHMgcHJvdmlkZWQnKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhcmdzTnVtID09PSAxKSB7XHJcbiAgICAgIHRleHQgPSBjYW52YXNcclxuICAgICAgY2FudmFzID0gb3B0cyA9IHVuZGVmaW5lZFxyXG4gICAgfSBlbHNlIGlmIChhcmdzTnVtID09PSAyICYmICFjYW52YXMuZ2V0Q29udGV4dCkge1xyXG4gICAgICBvcHRzID0gdGV4dFxyXG4gICAgICB0ZXh0ID0gY2FudmFzXHJcbiAgICAgIGNhbnZhcyA9IHVuZGVmaW5lZFxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IFFSQ29kZS5jcmVhdGUodGV4dCwgb3B0cylcclxuICAgICAgICByZXNvbHZlKHJlbmRlckZ1bmMoZGF0YSwgY2FudmFzLCBvcHRzKSlcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJlamVjdChlKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGRhdGEgPSBRUkNvZGUuY3JlYXRlKHRleHQsIG9wdHMpXHJcbiAgICBjYihudWxsLCByZW5kZXJGdW5jKGRhdGEsIGNhbnZhcywgb3B0cykpXHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY2IoZSlcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydHMuY3JlYXRlID0gUVJDb2RlLmNyZWF0ZVxyXG5leHBvcnRzLnRvQ2FudmFzID0gcmVuZGVyQ2FudmFzLmJpbmQobnVsbCwgQ2FudmFzUmVuZGVyZXIucmVuZGVyKVxyXG5leHBvcnRzLnRvRGF0YVVSTCA9IHJlbmRlckNhbnZhcy5iaW5kKG51bGwsIENhbnZhc1JlbmRlcmVyLnJlbmRlclRvRGF0YVVSTClcclxuXHJcbi8vIG9ubHkgc3ZnIGZvciBub3cuXHJcbmV4cG9ydHMudG9TdHJpbmcgPSByZW5kZXJDYW52YXMuYmluZChudWxsLCBmdW5jdGlvbiAoZGF0YSwgXywgb3B0cykge1xyXG4gIHJldHVybiBTdmdSZW5kZXJlci5yZW5kZXIoZGF0YSwgb3B0cylcclxufSlcclxuIiwiLyoqXHJcbiAqIGNvcmUvZXJjMjAuanNcclxuICpcclxuICogRVJDLTIwIHRva2VuIGNvbnRyYWN0IGludGVyZmFjZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcbmltcG9ydCB7IGdldFByb3ZpZGVyIH0gZnJvbSAnLi9ycGMuanMnO1xyXG5cclxuLy8gU3RhbmRhcmQgRVJDLTIwIEFCSSAobWluaW1hbCBpbnRlcmZhY2Ugd2UgbmVlZClcclxuY29uc3QgRVJDMjBfQUJJID0gW1xyXG4gIC8vIFJlYWQgZnVuY3Rpb25zXHJcbiAgJ2Z1bmN0aW9uIG5hbWUoKSB2aWV3IHJldHVybnMgKHN0cmluZyknLFxyXG4gICdmdW5jdGlvbiBzeW1ib2woKSB2aWV3IHJldHVybnMgKHN0cmluZyknLFxyXG4gICdmdW5jdGlvbiBkZWNpbWFscygpIHZpZXcgcmV0dXJucyAodWludDgpJyxcclxuICAnZnVuY3Rpb24gdG90YWxTdXBwbHkoKSB2aWV3IHJldHVybnMgKHVpbnQyNTYpJyxcclxuICAnZnVuY3Rpb24gYmFsYW5jZU9mKGFkZHJlc3MgYWNjb3VudCkgdmlldyByZXR1cm5zICh1aW50MjU2KScsXHJcblxyXG4gIC8vIFdyaXRlIGZ1bmN0aW9uc1xyXG4gICdmdW5jdGlvbiB0cmFuc2ZlcihhZGRyZXNzIHRvLCB1aW50MjU2IGFtb3VudCkgcmV0dXJucyAoYm9vbCknLFxyXG4gICdmdW5jdGlvbiBhcHByb3ZlKGFkZHJlc3Mgc3BlbmRlciwgdWludDI1NiBhbW91bnQpIHJldHVybnMgKGJvb2wpJyxcclxuICAnZnVuY3Rpb24gYWxsb3dhbmNlKGFkZHJlc3Mgb3duZXIsIGFkZHJlc3Mgc3BlbmRlcikgdmlldyByZXR1cm5zICh1aW50MjU2KScsXHJcbiAgJ2Z1bmN0aW9uIHRyYW5zZmVyRnJvbShhZGRyZXNzIGZyb20sIGFkZHJlc3MgdG8sIHVpbnQyNTYgYW1vdW50KSByZXR1cm5zIChib29sKScsXHJcblxyXG4gIC8vIEV2ZW50c1xyXG4gICdldmVudCBUcmFuc2ZlcihhZGRyZXNzIGluZGV4ZWQgZnJvbSwgYWRkcmVzcyBpbmRleGVkIHRvLCB1aW50MjU2IHZhbHVlKScsXHJcbiAgJ2V2ZW50IEFwcHJvdmFsKGFkZHJlc3MgaW5kZXhlZCBvd25lciwgYWRkcmVzcyBpbmRleGVkIHNwZW5kZXIsIHVpbnQyNTYgdmFsdWUpJ1xyXG5dO1xyXG5cclxuLyoqXHJcbiAqIEdldHMgYW4gRVJDLTIwIGNvbnRyYWN0IGluc3RhbmNlXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHBhcmFtIHtzdHJpbmd9IHRva2VuQWRkcmVzcyAtIFRva2VuIGNvbnRyYWN0IGFkZHJlc3NcclxuICogQHJldHVybnMge1Byb21pc2U8ZXRoZXJzLkNvbnRyYWN0Pn0gQ29udHJhY3QgaW5zdGFuY2VcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUb2tlbkNvbnRyYWN0KG5ldHdvcmssIHRva2VuQWRkcmVzcykge1xyXG4gIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgcmV0dXJuIG5ldyBldGhlcnMuQ29udHJhY3QodG9rZW5BZGRyZXNzLCBFUkMyMF9BQkksIHByb3ZpZGVyKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZldGNoZXMgdG9rZW4gbWV0YWRhdGEgKG5hbWUsIHN5bWJvbCwgZGVjaW1hbHMpXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHBhcmFtIHtzdHJpbmd9IHRva2VuQWRkcmVzcyAtIFRva2VuIGNvbnRyYWN0IGFkZHJlc3NcclxuICogQHJldHVybnMge1Byb21pc2U8e25hbWU6IHN0cmluZywgc3ltYm9sOiBzdHJpbmcsIGRlY2ltYWxzOiBudW1iZXJ9Pn1cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUb2tlbk1ldGFkYXRhKG5ldHdvcmssIHRva2VuQWRkcmVzcykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBjb250cmFjdCA9IGF3YWl0IGdldFRva2VuQ29udHJhY3QobmV0d29yaywgdG9rZW5BZGRyZXNzKTtcclxuXHJcbiAgICBjb25zdCBbbmFtZSwgc3ltYm9sLCBkZWNpbWFsc10gPSBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgIGNvbnRyYWN0Lm5hbWUoKSxcclxuICAgICAgY29udHJhY3Quc3ltYm9sKCksXHJcbiAgICAgIGNvbnRyYWN0LmRlY2ltYWxzKClcclxuICAgIF0pO1xyXG5cclxuICAgIHJldHVybiB7IG5hbWUsIHN5bWJvbCwgZGVjaW1hbHM6IE51bWJlcihkZWNpbWFscykgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gZmV0Y2ggdG9rZW4gbWV0YWRhdGE6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIHRva2VuIGJhbGFuY2UgZm9yIGFuIGFkZHJlc3NcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5BZGRyZXNzIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gYWNjb3VudEFkZHJlc3MgLSBBY2NvdW50IGFkZHJlc3MgdG8gY2hlY2tcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gQmFsYW5jZSBpbiB3ZWkgKGFzIHN0cmluZylcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUb2tlbkJhbGFuY2UobmV0d29yaywgdG9rZW5BZGRyZXNzLCBhY2NvdW50QWRkcmVzcykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBjb250cmFjdCA9IGF3YWl0IGdldFRva2VuQ29udHJhY3QobmV0d29yaywgdG9rZW5BZGRyZXNzKTtcclxuICAgIGNvbnN0IGJhbGFuY2UgPSBhd2FpdCBjb250cmFjdC5iYWxhbmNlT2YoYWNjb3VudEFkZHJlc3MpO1xyXG4gICAgcmV0dXJuIGJhbGFuY2UudG9TdHJpbmcoKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gZ2V0IHRva2VuIGJhbGFuY2U6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXRzIHRva2VuIGJhbGFuY2UgZnJvbSB3ZWkgdG8gaHVtYW4tcmVhZGFibGVcclxuICogQHBhcmFtIHtzdHJpbmd9IGJhbGFuY2VXZWkgLSBCYWxhbmNlIGluIHdlaVxyXG4gKiBAcGFyYW0ge251bWJlcn0gZGVjaW1hbHMgLSBUb2tlbiBkZWNpbWFsc1xyXG4gKiBAcGFyYW0ge251bWJlcn0gZGlzcGxheURlY2ltYWxzIC0gTnVtYmVyIG9mIGRlY2ltYWxzIHRvIGRpc3BsYXkgKGRlZmF1bHQgNClcclxuICogQHJldHVybnMge3N0cmluZ30gRm9ybWF0dGVkIGJhbGFuY2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRUb2tlbkJhbGFuY2UoYmFsYW5jZVdlaSwgZGVjaW1hbHMsIGRpc3BsYXlEZWNpbWFscyA9IDQpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgYmFsYW5jZSA9IGV0aGVycy5mb3JtYXRVbml0cyhiYWxhbmNlV2VpLCBkZWNpbWFscyk7XHJcbiAgICBjb25zdCBudW0gPSBwYXJzZUZsb2F0KGJhbGFuY2UpO1xyXG4gICAgcmV0dXJuIG51bS50b0ZpeGVkKGRpc3BsYXlEZWNpbWFscyk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybiAnMC4wMDAwJztcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQYXJzZXMgaHVtYW4tcmVhZGFibGUgYW1vdW50IHRvIHdlaVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYW1vdW50IC0gSHVtYW4tcmVhZGFibGUgYW1vdW50XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWNpbWFscyAtIFRva2VuIGRlY2ltYWxzXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEFtb3VudCBpbiB3ZWlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRva2VuQW1vdW50KGFtb3VudCwgZGVjaW1hbHMpIHtcclxuICByZXR1cm4gZXRoZXJzLnBhcnNlVW5pdHMoYW1vdW50LCBkZWNpbWFscykudG9TdHJpbmcoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zZmVycyB0b2tlbnNcclxuICogQHBhcmFtIHtldGhlcnMuV2FsbGV0fSBzaWduZXIgLSBXYWxsZXQgc2lnbmVyXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlbkFkZHJlc3MgLSBUb2tlbiBjb250cmFjdCBhZGRyZXNzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0b0FkZHJlc3MgLSBSZWNpcGllbnQgYWRkcmVzc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gYW1vdW50IC0gQW1vdW50IGluIHdlaSAoYXMgc3RyaW5nKVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxldGhlcnMuVHJhbnNhY3Rpb25SZXNwb25zZT59IFRyYW5zYWN0aW9uIHJlc3BvbnNlXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdHJhbnNmZXJUb2tlbihzaWduZXIsIHRva2VuQWRkcmVzcywgdG9BZGRyZXNzLCBhbW91bnQpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgY29udHJhY3QgPSBuZXcgZXRoZXJzLkNvbnRyYWN0KHRva2VuQWRkcmVzcywgRVJDMjBfQUJJLCBzaWduZXIpO1xyXG4gICAgY29uc3QgdHggPSBhd2FpdCBjb250cmFjdC50cmFuc2Zlcih0b0FkZHJlc3MsIGFtb3VudCk7XHJcbiAgICByZXR1cm4gdHg7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHRyYW5zZmVyIHRva2VuOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGlmIGFuIGFkZHJlc3MgaXMgYSB2YWxpZCBFUkMtMjAgdG9rZW4gY29udHJhY3RcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5BZGRyZXNzIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzc1xyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gVHJ1ZSBpZiB2YWxpZCBFUkMtMjAgY29udHJhY3RcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2YWxpZGF0ZVRva2VuQ29udHJhY3QobmV0d29yaywgdG9rZW5BZGRyZXNzKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIENoZWNrIGlmIGFkZHJlc3MgaXMgdmFsaWRcclxuICAgIGlmICghZXRoZXJzLmlzQWRkcmVzcyh0b2tlbkFkZHJlc3MpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUcnkgdG8gZmV0Y2ggYmFzaWMgbWV0YWRhdGFcclxuICAgIGF3YWl0IGdldFRva2VuTWV0YWRhdGEobmV0d29yaywgdG9rZW5BZGRyZXNzKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBjb3JlL3Rva2Vucy5qc1xyXG4gKlxyXG4gKiBUb2tlbiBtYW5hZ2VtZW50IGFuZCBzdG9yYWdlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgbG9hZCwgc2F2ZSB9IGZyb20gJy4vc3RvcmFnZS5qcyc7XHJcbmltcG9ydCB7IGdldFRva2VuTWV0YWRhdGEsIHZhbGlkYXRlVG9rZW5Db250cmFjdCB9IGZyb20gJy4vZXJjMjAuanMnO1xyXG5cclxuLy8gTWF4aW11bSBjdXN0b20gdG9rZW5zIHBlciBuZXR3b3JrXHJcbmNvbnN0IE1BWF9UT0tFTlNfUEVSX05FVFdPUksgPSAyMDtcclxuXHJcbi8vIERlZmF1bHQvcHJlc2V0IHRva2VucyAoY2FuIGJlIGVhc2lseSBhZGRlZC9yZW1vdmVkIGJ5IHVzZXIpXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1RPS0VOUyA9IHtcclxuICBwdWxzZWNoYWluOiB7XHJcbiAgICAnSEVYJzoge1xyXG4gICAgICBuYW1lOiAnSEVYJyxcclxuICAgICAgc3ltYm9sOiAnSEVYJyxcclxuICAgICAgYWRkcmVzczogJzB4MmI1OTFlOTlhZmU5ZjMyZWFhNjIxNGY3Yjc2Mjk3NjhjNDBlZWIzOScsXHJcbiAgICAgIGRlY2ltYWxzOiA4LFxyXG4gICAgICBsb2dvOiAnaGV4LnBuZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL2hleC5jb20nLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL3B1bHNlY2hhaW4vMHhmMWY0ZWU2MTBiMmJhYmIwNWM2MzVmNzI2ZWY4YjBjNTY4YzhkYzY1J1xyXG4gICAgfSxcclxuICAgICdQTFNYJzoge1xyXG4gICAgICBuYW1lOiAnUHVsc2VYJyxcclxuICAgICAgc3ltYm9sOiAnUExTWCcsXHJcbiAgICAgIGFkZHJlc3M6ICcweDk1QjMwMzk4N0E2MEM3MTUwNEQ5OUFhMWIxM0I0REEwN2IwNzkwYWInLFxyXG4gICAgICBkZWNpbWFsczogMTgsXHJcbiAgICAgIGxvZ286ICdwbHN4LnBuZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL3B1bHNleC5jb20nLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL3B1bHNlY2hhaW4vMHgxYjQ1YjkxNDg3OTFkM2ExMDQxODRjZDVkZmU1Y2U1NzE5M2EzZWU5J1xyXG4gICAgfSxcclxuICAgICdJTkMnOiB7XHJcbiAgICAgIG5hbWU6ICdJbmNlbnRpdmUnLFxyXG4gICAgICBzeW1ib2w6ICdJTkMnLFxyXG4gICAgICBhZGRyZXNzOiAnMHgyZmE4NzhBYjNGODdDQzFDOTczN0ZjMDcxMTA4RjkwNGMwQjBDOTVkJyxcclxuICAgICAgZGVjaW1hbHM6IDE4LFxyXG4gICAgICBsb2dvOiAnaW5jLnN2ZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL2luY2VudGl2ZXRva2VuLmlvJyxcclxuICAgICAgZGV4U2NyZWVuZXJVcmw6ICdodHRwczovL2RleHNjcmVlbmVyLmNvbS9wdWxzZWNoYWluLzB4ZjgwOGJiNjI2NWU5Y2EyNzAwMmMwYTA0NTYyYmY1MGQ0ZmUzN2VhYSdcclxuICAgIH0sXHJcbiAgICAnU2F2YW50Jzoge1xyXG4gICAgICBuYW1lOiAnU2F2YW50JyxcclxuICAgICAgc3ltYm9sOiAnU2F2YW50JyxcclxuICAgICAgYWRkcmVzczogJzB4ZjE2ZTE3ZTRhMDFiZjk5QjBBMDNGZDNBYjY5N2JDODc5MDZlMTgwOScsXHJcbiAgICAgIGRlY2ltYWxzOiAxOCxcclxuICAgICAgbG9nbzogJ3NhdmFudC0xOTIucG5nJyxcclxuICAgICAgaG9tZVVybDogJ2h0dHBzOi8vdXNjZ3ZldC5naXRodWIuaW8vU2F2YW50L3RyYWRlLmh0bWwnLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL3B1bHNlY2hhaW4vMHhhYWE4ODk0NTg0YWFmMDA5MjM3MmYwYzc1Mzc2OWE1MGY2MDYwNzQyJ1xyXG4gICAgfSxcclxuICAgICdIWFInOiB7XHJcbiAgICAgIG5hbWU6ICdIZXhSZXdhcmRzJyxcclxuICAgICAgc3ltYm9sOiAnSFhSJyxcclxuICAgICAgYWRkcmVzczogJzB4Q2ZDYjg5ZjAwNTc2QTc3NWQ5ZjgxOTYxQTM3YmE3RENmMTJDN2Q5QicsXHJcbiAgICAgIGRlY2ltYWxzOiAxOCxcclxuICAgICAgbG9nbzogJ2hleHJld2FyZHMtMTAwMC5wbmcnLFxyXG4gICAgICBob21lVXJsOiAnaHR0cHM6Ly91c2NndmV0LmdpdGh1Yi5pby9IZXhSZXdhcmRzLycsXHJcbiAgICAgIGRleFNjcmVlbmVyVXJsOiAnaHR0cHM6Ly9kZXhzY3JlZW5lci5jb20vcHVsc2VjaGFpbi8weGQ1YThkZTAzM2M4Njk3Y2VhYTg0NGNhNTk2Y2M3NTgzYzRmOGY2MTInXHJcbiAgICB9LFxyXG4gICAgJ1RLUic6IHtcclxuICAgICAgbmFtZTogJ1Rha2VyJyxcclxuICAgICAgc3ltYm9sOiAnVEtSJyxcclxuICAgICAgYWRkcmVzczogJzB4ZDllNTkwMjAwODk5MTZBOEVmQTdEZDBCNjA1ZDU1MjE5RDcyZEI3QicsXHJcbiAgICAgIGRlY2ltYWxzOiAxOCxcclxuICAgICAgbG9nbzogJ3Rrci5zdmcnLFxyXG4gICAgICBob21lVXJsOiAnaHR0cHM6Ly91c2NndmV0LmdpdGh1Yi5pby9qZGFpLWRhcHAvJyxcclxuICAgICAgZGV4U2NyZWVuZXJVcmw6ICdodHRwczovL2RleHNjcmVlbmVyLmNvbS9wdWxzZWNoYWluLzB4MjA1YzZkNDRkODRlODI2MDZlNGU5MjFmODdiNTFiNzFiYTg1ZjBmMCdcclxuICAgIH0sXHJcbiAgICAnSkRBSSc6IHtcclxuICAgICAgbmFtZTogJ0pEQUkgVW5zdGFibGVjb2luJyxcclxuICAgICAgc3ltYm9sOiAnSkRBSScsXHJcbiAgICAgIGFkZHJlc3M6ICcweDE2MTBFNzVDOWI0OEJGNTUwMTM3ODIwNDUyZEU0MDQ5YkIyMmJCNzInLFxyXG4gICAgICBkZWNpbWFsczogMTgsXHJcbiAgICAgIGxvZ286ICdqZGFpLnN2ZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL3VzY2d2ZXQuZ2l0aHViLmlvL2pkYWktZGFwcC8nLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL3B1bHNlY2hhaW4vMHg3MDY1OENlNkQ2QzA5YWNkRTY0NkY2ZWE5QzU3QmE2NGY0RGMzNTBmJ1xyXG4gICAgfSxcclxuICAgICdSaWNreSc6IHtcclxuICAgICAgbmFtZTogJ1JpY2t5JyxcclxuICAgICAgc3ltYm9sOiAnUmlja3knLFxyXG4gICAgICBhZGRyZXNzOiAnMHg3OUZDMEUxZDNFQzAwZDgxRTU0MjNEY0MwMUE2MTdiMGUxMjQ1YzJCJyxcclxuICAgICAgZGVjaW1hbHM6IDE4LFxyXG4gICAgICBsb2dvOiAncmlja3kuanBnJyxcclxuICAgICAgaG9tZVVybDogJ2h0dHBzOi8vdHJ1dGhiZWhpbmRyaWNoYXJkaGVhcnQuY29tLycsXHJcbiAgICAgIGRleFNjcmVlbmVyVXJsOiAnaHR0cHM6Ly9kZXhzY3JlZW5lci5jb20vcHVsc2VjaGFpbi8weGJmZTVhZTQwYmJjYTc0ODc4NDE5YWQ3ZDdlMTE1YTMwY2NmYzYyZjEnXHJcbiAgICB9XHJcbiAgfSxcclxuICBwdWxzZWNoYWluVGVzdG5ldDoge1xyXG4gICAgJ0hFQVJUJzoge1xyXG4gICAgICBuYW1lOiAnSGVhcnRUb2tlbicsXHJcbiAgICAgIHN5bWJvbDogJ0hFQVJUJyxcclxuICAgICAgYWRkcmVzczogJzB4NzM1NzQyRDhlNUZhMzVjMTY1ZGVlZWQ0NTYwRGQ5MUExNUJBMWFCMicsXHJcbiAgICAgIGRlY2ltYWxzOiAxOCxcclxuICAgICAgbG9nbzogJ2hlYXJ0LnBuZydcclxuICAgIH1cclxuICB9LFxyXG4gIGV0aGVyZXVtOiB7XHJcbiAgICAnSEVYJzoge1xyXG4gICAgICBuYW1lOiAnSEVYJyxcclxuICAgICAgc3ltYm9sOiAnSEVYJyxcclxuICAgICAgYWRkcmVzczogJzB4MmI1OTFlOTlhZmU5ZjMyZWFhNjIxNGY3Yjc2Mjk3NjhjNDBlZWIzOScsXHJcbiAgICAgIGRlY2ltYWxzOiA4LFxyXG4gICAgICBsb2dvOiAnaGV4LnBuZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL2hleC5jb20nLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL2V0aGVyZXVtLzB4OWUwOTA1MjQ5Y2VlZmZmYjk2MDVlMDM0YjUzNDU0NDY4NGE1OGJlNidcclxuICAgIH1cclxuICB9LFxyXG4gIHNlcG9saWE6IHt9XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0cyBzdG9yYWdlIGtleSBmb3IgY3VzdG9tIHRva2Vuc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRTdG9yYWdlS2V5KG5ldHdvcmspIHtcclxuICByZXR1cm4gYGN1c3RvbV90b2tlbnNfJHtuZXR3b3JrfWA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIHN0b3JhZ2Uga2V5IGZvciBlbmFibGVkIGRlZmF1bHQgdG9rZW5zXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHJldHVybnMge3N0cmluZ31cclxuICovXHJcbmZ1bmN0aW9uIGdldERlZmF1bHRUb2tlbnNLZXkobmV0d29yaykge1xyXG4gIHJldHVybiBgZW5hYmxlZF9kZWZhdWx0X3Rva2Vuc18ke25ldHdvcmt9YDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgYWxsIGN1c3RvbSB0b2tlbnMgZm9yIGEgbmV0d29ya1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn1cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDdXN0b21Ub2tlbnMobmV0d29yaykge1xyXG4gIGNvbnN0IGtleSA9IGdldFN0b3JhZ2VLZXkobmV0d29yayk7XHJcbiAgY29uc3QgdG9rZW5zID0gYXdhaXQgbG9hZChrZXkpO1xyXG4gIHJldHVybiB0b2tlbnMgfHwgW107XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIGVuYWJsZWQgZGVmYXVsdCB0b2tlbnMgZm9yIGEgbmV0d29ya1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5PHN0cmluZz4+fSBBcnJheSBvZiBlbmFibGVkIGRlZmF1bHQgdG9rZW4gc3ltYm9sc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEVuYWJsZWREZWZhdWx0VG9rZW5zKG5ldHdvcmspIHtcclxuICBjb25zdCBrZXkgPSBnZXREZWZhdWx0VG9rZW5zS2V5KG5ldHdvcmspO1xyXG4gIGNvbnN0IGVuYWJsZWQgPSBhd2FpdCBsb2FkKGtleSk7XHJcbiAgLy8gSWYgbm90aGluZyBzdG9yZWQsIGFsbCBkZWZhdWx0cyBhcmUgZW5hYmxlZFxyXG4gIGlmICghZW5hYmxlZCkge1xyXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKERFRkFVTFRfVE9LRU5TW25ldHdvcmtdIHx8IHt9KTtcclxuICB9XHJcbiAgcmV0dXJuIGVuYWJsZWQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIGFsbCB0b2tlbnMgKGRlZmF1bHQgKyBjdXN0b20pIGZvciBhIG5ldHdvcmtcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxBcnJheT59XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QWxsVG9rZW5zKG5ldHdvcmspIHtcclxuICBjb25zdCBjdXN0b21Ub2tlbnMgPSBhd2FpdCBnZXRDdXN0b21Ub2tlbnMobmV0d29yayk7XHJcbiAgY29uc3QgZW5hYmxlZERlZmF1bHRzID0gYXdhaXQgZ2V0RW5hYmxlZERlZmF1bHRUb2tlbnMobmV0d29yayk7XHJcblxyXG4gIGNvbnN0IGRlZmF1bHRUb2tlbnMgPSBbXTtcclxuICBjb25zdCBuZXR3b3JrRGVmYXVsdHMgPSBERUZBVUxUX1RPS0VOU1tuZXR3b3JrXSB8fCB7fTtcclxuXHJcbiAgZm9yIChjb25zdCBzeW1ib2wgb2YgZW5hYmxlZERlZmF1bHRzKSB7XHJcbiAgICBpZiAobmV0d29ya0RlZmF1bHRzW3N5bWJvbF0pIHtcclxuICAgICAgZGVmYXVsdFRva2Vucy5wdXNoKHtcclxuICAgICAgICAuLi5uZXR3b3JrRGVmYXVsdHNbc3ltYm9sXSxcclxuICAgICAgICBpc0RlZmF1bHQ6IHRydWVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gWy4uLmRlZmF1bHRUb2tlbnMsIC4uLmN1c3RvbVRva2Vuc107XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGRzIGEgY3VzdG9tIHRva2VuXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHBhcmFtIHtzdHJpbmd9IHRva2VuQWRkcmVzcyAtIFRva2VuIGNvbnRyYWN0IGFkZHJlc3NcclxuICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0Pn0gQWRkZWQgdG9rZW4gb2JqZWN0XHJcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0b2tlbiBsaW1pdCByZWFjaGVkLCBpbnZhbGlkIGFkZHJlc3MsIG9yIGFscmVhZHkgZXhpc3RzXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkQ3VzdG9tVG9rZW4obmV0d29yaywgdG9rZW5BZGRyZXNzKSB7XHJcbiAgLy8gVmFsaWRhdGUgYWRkcmVzcyBmb3JtYXRcclxuICB0b2tlbkFkZHJlc3MgPSB0b2tlbkFkZHJlc3MudHJpbSgpO1xyXG4gIGlmICghdG9rZW5BZGRyZXNzLnN0YXJ0c1dpdGgoJzB4JykgfHwgdG9rZW5BZGRyZXNzLmxlbmd0aCAhPT0gNDIpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB0b2tlbiBhZGRyZXNzIGZvcm1hdCcpO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgaWYgaXQncyBhIGRlZmF1bHQgdG9rZW5cclxuICBjb25zdCBuZXR3b3JrRGVmYXVsdHMgPSBERUZBVUxUX1RPS0VOU1tuZXR3b3JrXSB8fCB7fTtcclxuICBmb3IgKGNvbnN0IHN5bWJvbCBpbiBuZXR3b3JrRGVmYXVsdHMpIHtcclxuICAgIGlmIChuZXR3b3JrRGVmYXVsdHNbc3ltYm9sXS5hZGRyZXNzLnRvTG93ZXJDYXNlKCkgPT09IHRva2VuQWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhpcyBpcyBhIGRlZmF1bHQgdG9rZW4gKCR7c3ltYm9sfSkuIFVzZSB0aGUgZGVmYXVsdCB0b2tlbnMgbGlzdCBpbnN0ZWFkLmApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gR2V0IGN1cnJlbnQgY3VzdG9tIHRva2Vuc1xyXG4gIGNvbnN0IGN1c3RvbVRva2VucyA9IGF3YWl0IGdldEN1c3RvbVRva2VucyhuZXR3b3JrKTtcclxuXHJcbiAgLy8gQ2hlY2sgbGltaXRcclxuICBpZiAoY3VzdG9tVG9rZW5zLmxlbmd0aCA+PSBNQVhfVE9LRU5TX1BFUl9ORVRXT1JLKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE1heGltdW0gJHtNQVhfVE9LRU5TX1BFUl9ORVRXT1JLfSBjdXN0b20gdG9rZW5zIHBlciBuZXR3b3JrYCk7XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiBhbHJlYWR5IGV4aXN0c1xyXG4gIGNvbnN0IGV4aXN0cyA9IGN1c3RvbVRva2Vucy5maW5kKFxyXG4gICAgdCA9PiB0LmFkZHJlc3MudG9Mb3dlckNhc2UoKSA9PT0gdG9rZW5BZGRyZXNzLnRvTG93ZXJDYXNlKClcclxuICApO1xyXG4gIGlmIChleGlzdHMpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignVG9rZW4gYWxyZWFkeSBhZGRlZCcpO1xyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgY29udHJhY3QgYW5kIGZldGNoIG1ldGFkYXRhXHJcbiAgY29uc3QgaXNWYWxpZCA9IGF3YWl0IHZhbGlkYXRlVG9rZW5Db250cmFjdChuZXR3b3JrLCB0b2tlbkFkZHJlc3MpO1xyXG4gIGlmICghaXNWYWxpZCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEVSQy0yMCB0b2tlbiBjb250cmFjdCcpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgbWV0YWRhdGEgPSBhd2FpdCBnZXRUb2tlbk1ldGFkYXRhKG5ldHdvcmssIHRva2VuQWRkcmVzcyk7XHJcblxyXG4gIC8vIENyZWF0ZSB0b2tlbiBlbnRyeVxyXG4gIGNvbnN0IHRva2VuID0ge1xyXG4gICAgYWRkcmVzczogdG9rZW5BZGRyZXNzLFxyXG4gICAgbmFtZTogbWV0YWRhdGEubmFtZSxcclxuICAgIHN5bWJvbDogbWV0YWRhdGEuc3ltYm9sLFxyXG4gICAgZGVjaW1hbHM6IG1ldGFkYXRhLmRlY2ltYWxzLFxyXG4gICAgbG9nbzogbnVsbCxcclxuICAgIGlzRGVmYXVsdDogZmFsc2UsXHJcbiAgICBhZGRlZEF0OiBEYXRlLm5vdygpXHJcbiAgfTtcclxuXHJcbiAgLy8gQWRkIHRvIGxpc3RcclxuICBjdXN0b21Ub2tlbnMucHVzaCh0b2tlbik7XHJcblxyXG4gIC8vIFNhdmVcclxuICBjb25zdCBrZXkgPSBnZXRTdG9yYWdlS2V5KG5ldHdvcmspO1xyXG4gIGF3YWl0IHNhdmUoa2V5LCBjdXN0b21Ub2tlbnMpO1xyXG5cclxuICByZXR1cm4gdG9rZW47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZW1vdmVzIGEgY3VzdG9tIHRva2VuXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHBhcmFtIHtzdHJpbmd9IHRva2VuQWRkcmVzcyAtIFRva2VuIGNvbnRyYWN0IGFkZHJlc3NcclxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlQ3VzdG9tVG9rZW4obmV0d29yaywgdG9rZW5BZGRyZXNzKSB7XHJcbiAgY29uc3QgY3VzdG9tVG9rZW5zID0gYXdhaXQgZ2V0Q3VzdG9tVG9rZW5zKG5ldHdvcmspO1xyXG5cclxuICBjb25zdCBmaWx0ZXJlZCA9IGN1c3RvbVRva2Vucy5maWx0ZXIoXHJcbiAgICB0ID0+IHQuYWRkcmVzcy50b0xvd2VyQ2FzZSgpICE9PSB0b2tlbkFkZHJlc3MudG9Mb3dlckNhc2UoKVxyXG4gICk7XHJcblxyXG4gIGNvbnN0IGtleSA9IGdldFN0b3JhZ2VLZXkobmV0d29yayk7XHJcbiAgYXdhaXQgc2F2ZShrZXksIGZpbHRlcmVkKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRvZ2dsZXMgYSBkZWZhdWx0IHRva2VuIG9uL29mZlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzeW1ib2wgLSBUb2tlbiBzeW1ib2xcclxuICogQHBhcmFtIHtib29sZWFufSBlbmFibGVkIC0gRW5hYmxlIG9yIGRpc2FibGVcclxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdG9nZ2xlRGVmYXVsdFRva2VuKG5ldHdvcmssIHN5bWJvbCwgZW5hYmxlZCkge1xyXG4gIGNvbnN0IGVuYWJsZWRUb2tlbnMgPSBhd2FpdCBnZXRFbmFibGVkRGVmYXVsdFRva2VucyhuZXR3b3JrKTtcclxuXHJcbiAgbGV0IHVwZGF0ZWQ7XHJcbiAgaWYgKGVuYWJsZWQpIHtcclxuICAgIC8vIEFkZCBpZiBub3QgYWxyZWFkeSBpbiBsaXN0XHJcbiAgICBpZiAoIWVuYWJsZWRUb2tlbnMuaW5jbHVkZXMoc3ltYm9sKSkge1xyXG4gICAgICB1cGRhdGVkID0gWy4uLmVuYWJsZWRUb2tlbnMsIHN5bWJvbF07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm47IC8vIEFscmVhZHkgZW5hYmxlZFxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBSZW1vdmUgZnJvbSBsaXN0XHJcbiAgICB1cGRhdGVkID0gZW5hYmxlZFRva2Vucy5maWx0ZXIocyA9PiBzICE9PSBzeW1ib2wpO1xyXG4gIH1cclxuXHJcbiAgY29uc3Qga2V5ID0gZ2V0RGVmYXVsdFRva2Vuc0tleShuZXR3b3JrKTtcclxuICBhd2FpdCBzYXZlKGtleSwgdXBkYXRlZCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgYSBkZWZhdWx0IHRva2VuIGlzIGVuYWJsZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3ltYm9sIC0gVG9rZW4gc3ltYm9sXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzRGVmYXVsdFRva2VuRW5hYmxlZChuZXR3b3JrLCBzeW1ib2wpIHtcclxuICBjb25zdCBlbmFibGVkID0gYXdhaXQgZ2V0RW5hYmxlZERlZmF1bHRUb2tlbnMobmV0d29yayk7XHJcbiAgcmV0dXJuIGVuYWJsZWQuaW5jbHVkZXMoc3ltYm9sKTtcclxufVxyXG4iLCIvKipcclxuICogUHJpY2UgT3JhY2xlIC0gRmV0Y2hlcyB0b2tlbiBwcmljZXMgZnJvbSBQdWxzZVggbGlxdWlkaXR5IHBvb2xzXHJcbiAqIFVzZXMgb24tY2hhaW4gcmVzZXJ2ZSBkYXRhIHRvIGNhbGN1bGF0ZSByZWFsLXRpbWUgREVYIHByaWNlc1xyXG4gKiBQcml2YWN5LXByZXNlcnZpbmc6IG9ubHkgdXNlcyBSUEMgY2FsbHMsIG5vIGV4dGVybmFsIEFQSXNcclxuICovXHJcblxyXG5pbXBvcnQgeyBldGhlcnMgfSBmcm9tICdldGhlcnMnO1xyXG5cclxuLy8gUHVsc2VYIFYyIFBhaXIgQUJJIChvbmx5IGdldFJlc2VydmVzIGZ1bmN0aW9uKVxyXG5jb25zdCBQQUlSX0FCSSA9IFtcclxuICAnZnVuY3Rpb24gZ2V0UmVzZXJ2ZXMoKSBleHRlcm5hbCB2aWV3IHJldHVybnMgKHVpbnQxMTIgcmVzZXJ2ZTAsIHVpbnQxMTIgcmVzZXJ2ZTEsIHVpbnQzMiBibG9ja1RpbWVzdGFtcExhc3QpJyxcclxuICAnZnVuY3Rpb24gdG9rZW4wKCkgZXh0ZXJuYWwgdmlldyByZXR1cm5zIChhZGRyZXNzKScsXHJcbiAgJ2Z1bmN0aW9uIHRva2VuMSgpIGV4dGVybmFsIHZpZXcgcmV0dXJucyAoYWRkcmVzcyknXHJcbl07XHJcblxyXG4vLyBLbm93biBQdWxzZVggVjIgcGFpciBhZGRyZXNzZXMgb24gUHVsc2VDaGFpbiBtYWlubmV0XHJcbi8vIEFsbCBhZGRyZXNzZXMgYXJlIGNoZWNrc3VtbWVkIGZvciBldGhlcnMuanMgdjYgY29tcGF0aWJpbGl0eVxyXG5jb25zdCBQVUxTRVhfUEFJUlMgPSB7XHJcbiAgcHVsc2VjaGFpbjoge1xyXG4gICAgLy8gUExTL0RBSSAtIFByaWNlIGFuY2hvciBmb3IgVVNEIGNvbnZlcnNpb25cclxuICAgICdQTFNfREFJJzogJzB4RTU2MDQzNjcxZGY1NWRFNUNEZjg0NTk3MTA0MzNDMTAzMjRERTBhRScsIC8vIE1heSBub3QgZXhpc3QsIGZhbGxiYWNrIHRvIFVTRENcclxuXHJcbiAgICAvLyBNYWpvciB0b2tlbiBwYWlycyAoYWxsIHBhaXJlZCB3aXRoIFdQTFMpXHJcbiAgICAnSEVYX1BMUyc6ICcweGYxRjRlZTYxMGIyYkFiQjA1QzYzNUY3MjZlRjhCMEM1NjhjOGRjNjUnLFxyXG4gICAgJ1BMU1hfUExTJzogJzB4MWI0NWI5MTQ4NzkxZDNhMTA0MTg0Q2Q1REZFNUNFNTcxOTNhM2VlOScsXHJcbiAgICAnSU5DX1BMUyc6ICcweGY4MDhCYjYyNjVlOUNhMjcwMDJjMEEwNDU2MkJmNTBkNEZFMzdFQUEnLCAvLyBGcm9tIEdlY2tvVGVybWluYWwgKGNoZWNrc3VtbWVkKVxyXG4gICAgJ1NhdmFudF9QTFMnOiAnMHhhQUE4ODk0NTg0YUFGMDA5MjM3MmYwQzc1Mzc2OWE1MGY2MDYwNzQyJyxcclxuICAgICdIWFJfUExTJzogJzB4RDVBOGRlMDMzYzg2OTdjRWFhODQ0Q0E1OTZjYzc1ODNjNGY4RjYxMicsXHJcbiAgICAnVEtSX1BMUyc6ICcweDIwNUM2ZDQ0ZDg0RTgyNjA2RTRFOTIxZjg3YjUxYjcxYmE4NUYwZjAnLFxyXG4gICAgJ0pEQUlfUExTJzogJzB4NzA2NThDZTZENkMwOWFjZEU2NDZGNmVhOUM1N0JhNjRmNERjMzUwZicsXHJcbiAgICAnUmlja3lfUExTJzogJzB4YmZlNWFlNDBiYmNhNzQ4Nzg0MTlhZDdkN2UxMTVhMzBjY2ZjNjJmMSdcclxuICB9XHJcbn07XHJcblxyXG4vLyBUb2tlbiBhZGRyZXNzZXMgYW5kIGRlY2ltYWxzIGZvciBwcmljZSByb3V0aW5nIChhbGwgY2hlY2tzdW1tZWQpXHJcbmNvbnN0IFRPS0VOX0FERFJFU1NFUyA9IHtcclxuICBwdWxzZWNoYWluOiB7XHJcbiAgICBXUExTOiB7IGFkZHJlc3M6ICcweEExMDc3YTI5NGRERTFCMDliQjA3ODg0NGRmNDA3NThhNUQwZjlhMjcnLCBkZWNpbWFsczogMTggfSxcclxuICAgIERBSTogeyBhZGRyZXNzOiAnMHhlZkQ3NjZjQ2IzOEVhRjFkZmQ3MDE4NTNCRkNlMzEzNTkyMzlGMzA1JywgZGVjaW1hbHM6IDE4IH0sXHJcbiAgICBIRVg6IHsgYWRkcmVzczogJzB4MmI1OTFlOTlhZkU5ZjMyZUFBNjIxNGY3Qjc2Mjk3NjhjNDBFZWIzOScsIGRlY2ltYWxzOiA4IH0sXHJcbiAgICBQTFNYOiB7IGFkZHJlc3M6ICcweDk1QjMwMzk4N0E2MEM3MTUwNEQ5OUFhMWIxM0I0REEwN2IwNzkwYWInLCBkZWNpbWFsczogMTggfSxcclxuICAgIElOQzogeyBhZGRyZXNzOiAnMHgyRkE4NzhBYjNGODdDQzFDOTczN0ZjMDcxMTA4RjkwNGMwQjBDOTVkJywgZGVjaW1hbHM6IDE4IH0sXHJcbiAgICBTYXZhbnQ6IHsgYWRkcmVzczogJzB4ZjE2ZTE3ZTRhMDFiZjk5QjBBMDNGZDNBYjY5N2JDODc5MDZlMTgwOScsIGRlY2ltYWxzOiAxOCB9LFxyXG4gICAgSFhSOiB7IGFkZHJlc3M6ICcweENmQ2I4OWYwMDU3NkE3NzVkOWY4MTk2MUEzN2JhN0RDZjEyQzdkOUInLCBkZWNpbWFsczogMTggfSxcclxuICAgIFRLUjogeyBhZGRyZXNzOiAnMHhkOWU1OTAyMDA4OTkxNkE4RWZBN0RkMEI2MDVkNTUyMTlENzJkQjdCJywgZGVjaW1hbHM6IDE4IH0sXHJcbiAgICBKREFJOiB7IGFkZHJlc3M6ICcweDE2MTBFNzVDOWI0OEJGNTUwMTM3ODIwNDUyZEU0MDQ5YkIyMmJCNzInLCBkZWNpbWFsczogMTggfSxcclxuICAgIFJpY2t5OiB7IGFkZHJlc3M6ICcweDc5RkMwRTFkM0VDMDBkODFFNTQyM0RjQzAxQTYxN2IwZTEyNDVjMkInLCBkZWNpbWFsczogMTggfVxyXG4gIH1cclxufTtcclxuXHJcbi8vIFByaWNlIGNhY2hlICg1IG1pbnV0ZSBleHBpcnkpXHJcbmNvbnN0IHByaWNlQ2FjaGUgPSB7XHJcbiAgcHJpY2VzOiB7fSxcclxuICB0aW1lc3RhbXA6IDAsXHJcbiAgQ0FDSEVfRFVSQVRJT046IDUgKiA2MCAqIDEwMDAgLy8gNSBtaW51dGVzXHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHJlc2VydmVzIGZyb20gYSBQdWxzZVggcGFpciBjb250cmFjdFxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZ2V0UGFpclJlc2VydmVzKHByb3ZpZGVyLCBwYWlyQWRkcmVzcykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwYWlyQ29udHJhY3QgPSBuZXcgZXRoZXJzLkNvbnRyYWN0KHBhaXJBZGRyZXNzLCBQQUlSX0FCSSwgcHJvdmlkZXIpO1xyXG4gICAgY29uc3QgW3Jlc2VydmUwLCByZXNlcnZlMV0gPSBhd2FpdCBwYWlyQ29udHJhY3QuZ2V0UmVzZXJ2ZXMoKTtcclxuICAgIGNvbnN0IHRva2VuMCA9IGF3YWl0IHBhaXJDb250cmFjdC50b2tlbjAoKTtcclxuICAgIGNvbnN0IHRva2VuMSA9IGF3YWl0IHBhaXJDb250cmFjdC50b2tlbjEoKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXNlcnZlMDogcmVzZXJ2ZTAudG9TdHJpbmcoKSxcclxuICAgICAgcmVzZXJ2ZTE6IHJlc2VydmUxLnRvU3RyaW5nKCksXHJcbiAgICAgIHRva2VuMDogdG9rZW4wLnRvTG93ZXJDYXNlKCksXHJcbiAgICAgIHRva2VuMTogdG9rZW4xLnRvTG93ZXJDYXNlKClcclxuICAgIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHBhaXIgcmVzZXJ2ZXM6JywgcGFpckFkZHJlc3MsIGVycm9yKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZSBwcmljZSBvZiB0b2tlbjAgaW4gdGVybXMgb2YgdG9rZW4xIGZyb20gcmVzZXJ2ZXNcclxuICogcHJpY2UgPSByZXNlcnZlMSAvIHJlc2VydmUwXHJcbiAqL1xyXG5mdW5jdGlvbiBjYWxjdWxhdGVQcmljZShyZXNlcnZlMCwgcmVzZXJ2ZTEsIGRlY2ltYWxzMCA9IDE4LCBkZWNpbWFsczEgPSAxOCkge1xyXG4gIGNvbnN0IHIwID0gcGFyc2VGbG9hdChldGhlcnMuZm9ybWF0VW5pdHMocmVzZXJ2ZTAsIGRlY2ltYWxzMCkpO1xyXG4gIGNvbnN0IHIxID0gcGFyc2VGbG9hdChldGhlcnMuZm9ybWF0VW5pdHMocmVzZXJ2ZTEsIGRlY2ltYWxzMSkpO1xyXG5cclxuICBpZiAocjAgPT09IDApIHJldHVybiAwO1xyXG4gIHJldHVybiByMSAvIHIwO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IFBMUyBwcmljZSBpbiBVU0QgdXNpbmcgSEVYIGFzIGludGVybWVkaWFyeVxyXG4gKiAxLiBHZXQgSEVYL1BMUyByZXNlcnZlcyAtPiBIRVggcHJpY2UgaW4gUExTXHJcbiAqIDIuIFVzZSBrbm93biBIRVggVVNEIHByaWNlICh+JDAuMDEpIHRvIGNhbGN1bGF0ZSBQTFMgVVNEIHByaWNlXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRQTFNQcmljZShwcm92aWRlcikge1xyXG4gIHRyeSB7XHJcbiAgICAvLyBGaXJzdCB0cnkgdGhlIERBSSBwYWlyXHJcbiAgICBjb25zdCBkYWlQYWlyQWRkcmVzcyA9IFBVTFNFWF9QQUlSUy5wdWxzZWNoYWluLlBMU19EQUk7XHJcbiAgICBjb25zdCBkYWlSZXNlcnZlcyA9IGF3YWl0IGdldFBhaXJSZXNlcnZlcyhwcm92aWRlciwgZGFpUGFpckFkZHJlc3MpO1xyXG5cclxuICAgIGlmIChkYWlSZXNlcnZlcykge1xyXG4gICAgICBjb25zdCB0b2tlbnMgPSBUT0tFTl9BRERSRVNTRVMucHVsc2VjaGFpbjtcclxuICAgICAgY29uc3QgcGxzQWRkcmVzcyA9IHRva2Vucy5XUExTLmFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuICAgICAgY29uc3QgZGFpQWRkcmVzcyA9IHRva2Vucy5EQUkuYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgbGV0IHBsc1Jlc2VydmUsIGRhaVJlc2VydmU7XHJcbiAgICAgIGlmIChkYWlSZXNlcnZlcy50b2tlbjAgPT09IHBsc0FkZHJlc3MpIHtcclxuICAgICAgICBwbHNSZXNlcnZlID0gZGFpUmVzZXJ2ZXMucmVzZXJ2ZTA7XHJcbiAgICAgICAgZGFpUmVzZXJ2ZSA9IGRhaVJlc2VydmVzLnJlc2VydmUxO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsc1Jlc2VydmUgPSBkYWlSZXNlcnZlcy5yZXNlcnZlMTtcclxuICAgICAgICBkYWlSZXNlcnZlID0gZGFpUmVzZXJ2ZXMucmVzZXJ2ZTA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHBsc1ByaWNlID0gY2FsY3VsYXRlUHJpY2UocGxzUmVzZXJ2ZSwgZGFpUmVzZXJ2ZSwgMTgsIDE4KTtcclxuICAgICAgY29uc29sZS5sb2coJ+KckyBQTFMgcHJpY2UgZnJvbSBEQUkgcGFpcjonLCBwbHNQcmljZSk7XHJcbiAgICAgIHJldHVybiBwbHNQcmljZTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS53YXJuKCdDb3VsZCBub3QgZmV0Y2ggUExTL0RBSSBwcmljZSwgdHJ5aW5nIGFsdGVybmF0aXZlLi4uJywgZXJyb3IubWVzc2FnZSk7XHJcbiAgfVxyXG5cclxuICAvLyBGYWxsYmFjazogQ2FsY3VsYXRlIHRocm91Z2ggSEVYXHJcbiAgLy8gVXNlIENvaW5HZWNrby9Db2luTWFya2V0Q2FwIGtub3duIEhFWCBwcmljZSBhcyBhbmNob3JcclxuICAvLyBPciB1c2UgYSBoYXJkY29kZWQgcmVhc29uYWJsZSBlc3RpbWF0ZVxyXG4gIGNvbnNvbGUubG9nKCdVc2luZyBIRVgtYmFzZWQgcHJpY2UgZXN0aW1hdGlvbiBhcyBmYWxsYmFjaycpO1xyXG4gIFxyXG4gIC8vIEdldCBIRVgvUExTIHJlc2VydmVzXHJcbiAgY29uc3QgaGV4UGFpckFkZHJlc3MgPSBQVUxTRVhfUEFJUlMucHVsc2VjaGFpbi5IRVhfUExTO1xyXG4gIGNvbnN0IGhleFJlc2VydmVzID0gYXdhaXQgZ2V0UGFpclJlc2VydmVzKHByb3ZpZGVyLCBoZXhQYWlyQWRkcmVzcyk7XHJcbiAgXHJcbiAgaWYgKCFoZXhSZXNlcnZlcykge1xyXG4gICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGZldGNoIEhFWC9QTFMgcmVzZXJ2ZXMgZm9yIHByaWNlIGNhbGN1bGF0aW9uJyk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIGNvbnN0IHRva2VucyA9IFRPS0VOX0FERFJFU1NFUy5wdWxzZWNoYWluO1xyXG4gIGNvbnN0IHBsc0FkZHJlc3MgPSB0b2tlbnMuV1BMUy5hZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3QgaGV4QWRkcmVzcyA9IHRva2Vucy5IRVguYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICBsZXQgcGxzUmVzZXJ2ZSwgaGV4UmVzZXJ2ZTtcclxuICBpZiAoaGV4UmVzZXJ2ZXMudG9rZW4wID09PSBoZXhBZGRyZXNzKSB7XHJcbiAgICBoZXhSZXNlcnZlID0gaGV4UmVzZXJ2ZXMucmVzZXJ2ZTA7XHJcbiAgICBwbHNSZXNlcnZlID0gaGV4UmVzZXJ2ZXMucmVzZXJ2ZTE7XHJcbiAgfSBlbHNlIHtcclxuICAgIGhleFJlc2VydmUgPSBoZXhSZXNlcnZlcy5yZXNlcnZlMTtcclxuICAgIHBsc1Jlc2VydmUgPSBoZXhSZXNlcnZlcy5yZXNlcnZlMDtcclxuICB9XHJcblxyXG4gIC8vIENhbGN1bGF0ZSBIRVggcHJpY2UgaW4gUExTXHJcbiAgY29uc3QgaGV4UmVzZXJ2ZUZvcm1hdHRlZCA9IHBhcnNlRmxvYXQoZXRoZXJzLmZvcm1hdFVuaXRzKGhleFJlc2VydmUsIDgpKTsgLy8gSEVYIGhhcyA4IGRlY2ltYWxzXHJcbiAgY29uc3QgcGxzUmVzZXJ2ZUZvcm1hdHRlZCA9IHBhcnNlRmxvYXQoZXRoZXJzLmZvcm1hdFVuaXRzKHBsc1Jlc2VydmUsIDE4KSk7XHJcbiAgY29uc3QgaGV4UHJpY2VJblBscyA9IHBsc1Jlc2VydmVGb3JtYXR0ZWQgLyBoZXhSZXNlcnZlRm9ybWF0dGVkO1xyXG5cclxuICAvLyBVc2UgYXBwcm94aW1hdGUgSEVYIFVTRCBwcmljZSAodXBkYXRlIHRoaXMgcGVyaW9kaWNhbGx5IG9yIGZldGNoIGZyb20gQ29pbkdlY2tvIEFQSSlcclxuICBjb25zdCBoZXhVc2RQcmljZSA9IDAuMDE7IC8vIEFwcHJveGltYXRlIC0gYWRqdXN0IGJhc2VkIG9uIG1hcmtldFxyXG4gIFxyXG4gIC8vIENhbGN1bGF0ZSBQTFMgVVNEIHByaWNlOiBpZiAxIEhFWCA9IFggUExTLCBhbmQgMSBIRVggPSAkMC4wMSwgdGhlbiAxIFBMUyA9ICQwLjAxIC8gWFxyXG4gIGNvbnN0IHBsc1VzZFByaWNlID0gaGV4VXNkUHJpY2UgLyBoZXhQcmljZUluUGxzO1xyXG4gIFxyXG4gIC8vIEVzdGltYXRlZCBQTFMgcHJpY2UgdmlhIEhFWFxyXG4gIFxyXG4gIHJldHVybiBwbHNVc2RQcmljZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB0b2tlbiBwcmljZSBpbiBQTFMgZnJvbSBQdWxzZVggcGFpclxyXG4gKiBSZXR1cm5zOiBIb3cgbXVjaCBQTFMgZG9lcyAxIHRva2VuIGNvc3RcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFRva2VuUHJpY2VJblBMUyhwcm92aWRlciwgcGFpckFkZHJlc3MsIHRva2VuQWRkcmVzcywgdG9rZW5EZWNpbWFscykge1xyXG4gIGNvbnN0IHJlc2VydmVzID0gYXdhaXQgZ2V0UGFpclJlc2VydmVzKHByb3ZpZGVyLCBwYWlyQWRkcmVzcyk7XHJcblxyXG4gIGlmICghcmVzZXJ2ZXMpIHJldHVybiBudWxsO1xyXG5cclxuICBjb25zdCBwbHNBZGRyZXNzID0gVE9LRU5fQUREUkVTU0VTLnB1bHNlY2hhaW4uV1BMUy5hZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3QgdGFyZ2V0VG9rZW4gPSB0b2tlbkFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgLy8gRGV0ZXJtaW5lIHdoaWNoIHJlc2VydmUgaXMgdGhlIHRva2VuIGFuZCB3aGljaCBpcyBQTFNcclxuICBsZXQgdG9rZW5SZXNlcnZlLCBwbHNSZXNlcnZlO1xyXG4gIGlmIChyZXNlcnZlcy50b2tlbjAgPT09IHRhcmdldFRva2VuKSB7XHJcbiAgICB0b2tlblJlc2VydmUgPSByZXNlcnZlcy5yZXNlcnZlMDtcclxuICAgIHBsc1Jlc2VydmUgPSByZXNlcnZlcy5yZXNlcnZlMTtcclxuICB9IGVsc2UgaWYgKHJlc2VydmVzLnRva2VuMSA9PT0gdGFyZ2V0VG9rZW4pIHtcclxuICAgIHRva2VuUmVzZXJ2ZSA9IHJlc2VydmVzLnJlc2VydmUxO1xyXG4gICAgcGxzUmVzZXJ2ZSA9IHJlc2VydmVzLnJlc2VydmUwO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdUb2tlbiBub3QgZm91bmQgaW4gcGFpcjonLCB0b2tlbkFkZHJlc3MsIHBhaXJBZGRyZXNzKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2FsY3VsYXRlIHRva2VuIHByaWNlIGluIFBMU1xyXG4gIC8vIFByaWNlIG9mIHRva2VuIGluIFBMUyA9IHBsc1Jlc2VydmUgLyB0b2tlblJlc2VydmVcclxuICAvLyBUaGlzIGdpdmVzOiBIb3cgbWFueSBQTFMgcGVyIDEgdG9rZW5cclxuICBjb25zdCB0b2tlblJlc2VydmVGb3JtYXR0ZWQgPSBwYXJzZUZsb2F0KGV0aGVycy5mb3JtYXRVbml0cyh0b2tlblJlc2VydmUsIHRva2VuRGVjaW1hbHMpKTtcclxuICBjb25zdCBwbHNSZXNlcnZlRm9ybWF0dGVkID0gcGFyc2VGbG9hdChldGhlcnMuZm9ybWF0VW5pdHMocGxzUmVzZXJ2ZSwgMTgpKTtcclxuXHJcbiAgLy8gVG9rZW4gcmVzZXJ2ZXMgZmV0Y2hlZFxyXG5cclxuICBpZiAodG9rZW5SZXNlcnZlRm9ybWF0dGVkID09PSAwKSByZXR1cm4gMDtcclxuXHJcbiAgY29uc3QgdG9rZW5QcmljZUluUGxzID0gcGxzUmVzZXJ2ZUZvcm1hdHRlZCAvIHRva2VuUmVzZXJ2ZUZvcm1hdHRlZDtcclxuICAvLyBUb2tlbiBwcmljZSBjYWxjdWxhdGVkXHJcbiAgcmV0dXJuIHRva2VuUHJpY2VJblBscztcclxufVxyXG5cclxuLyoqXHJcbiAqIEZldGNoIGFsbCB0b2tlbiBwcmljZXMgaW4gVVNEXHJcbiAqIFJldHVybnM6IHsgUExTOiBwcmljZSwgSEVYOiBwcmljZSwgUExTWDogcHJpY2UsIElOQzogcHJpY2UsIC4uLiB9XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hUb2tlblByaWNlcyhwcm92aWRlciwgbmV0d29yayA9ICdwdWxzZWNoYWluJykge1xyXG4gIC8vIENoZWNrIGNhY2hlIGZpcnN0XHJcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICBpZiAocHJpY2VDYWNoZS5wcmljZXNbbmV0d29ya10gJiYgKG5vdyAtIHByaWNlQ2FjaGUudGltZXN0YW1wKSA8IHByaWNlQ2FjaGUuQ0FDSEVfRFVSQVRJT04pIHtcclxuICAgIC8vIFVzaW5nIGNhY2hlZCBwcmljZXNcclxuICAgIHJldHVybiBwcmljZUNhY2hlLnByaWNlc1tuZXR3b3JrXTtcclxuICB9XHJcblxyXG4gIC8vIEZldGNoaW5nIGZyZXNoIHByaWNlc1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcHJpY2VzID0ge307XHJcblxyXG4gICAgLy8gU3RlcCAxOiBHZXQgUExTIHByaWNlIGluIFVTRFxyXG4gICAgY29uc3QgcGxzVXNkUHJpY2UgPSBhd2FpdCBnZXRQTFNQcmljZShwcm92aWRlcik7XHJcbiAgICBpZiAoIXBsc1VzZFByaWNlKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybignQ291bGQgbm90IGZldGNoIFBMUyBwcmljZScpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcmljZXMuUExTID0gcGxzVXNkUHJpY2U7XHJcbiAgICAvLyBQTFMgcHJpY2UgZmV0Y2hlZFxyXG5cclxuICAgIC8vIFN0ZXAgMjogR2V0IG90aGVyIHRva2VuIHByaWNlcyBpbiBQTFMsIHRoZW4gY29udmVydCB0byBVU0RcclxuICAgIGNvbnN0IHBhaXJzID0gUFVMU0VYX1BBSVJTW25ldHdvcmtdO1xyXG4gICAgY29uc3QgdG9rZW5zID0gVE9LRU5fQUREUkVTU0VTW25ldHdvcmtdO1xyXG5cclxuICAgIC8vIEhFWCBwcmljZVxyXG4gICAgY29uc3QgaGV4UHJpY2VJblBscyA9IGF3YWl0IGdldFRva2VuUHJpY2VJblBMUyhwcm92aWRlciwgcGFpcnMuSEVYX1BMUywgdG9rZW5zLkhFWC5hZGRyZXNzLCB0b2tlbnMuSEVYLmRlY2ltYWxzKTtcclxuICAgIGlmIChoZXhQcmljZUluUGxzKSB7XHJcbiAgICAgIHByaWNlcy5IRVggPSBoZXhQcmljZUluUGxzICogcGxzVXNkUHJpY2U7XHJcbiAgICAgIC8vIEhFWCBwcmljZSBjYWxjdWxhdGVkXHJcbiAgICB9XHJcblxyXG4gICAgLy8gUExTWCBwcmljZVxyXG4gICAgY29uc3QgcGxzeFByaWNlSW5QbHMgPSBhd2FpdCBnZXRUb2tlblByaWNlSW5QTFMocHJvdmlkZXIsIHBhaXJzLlBMU1hfUExTLCB0b2tlbnMuUExTWC5hZGRyZXNzLCB0b2tlbnMuUExTWC5kZWNpbWFscyk7XHJcbiAgICBpZiAocGxzeFByaWNlSW5QbHMpIHtcclxuICAgICAgcHJpY2VzLlBMU1ggPSBwbHN4UHJpY2VJblBscyAqIHBsc1VzZFByaWNlO1xyXG4gICAgICAvLyBQTFNYIHByaWNlIGNhbGN1bGF0ZWRcclxuICAgIH1cclxuXHJcbiAgICAvLyBJTkMgcHJpY2VcclxuICAgIGNvbnN0IGluY1ByaWNlSW5QbHMgPSBhd2FpdCBnZXRUb2tlblByaWNlSW5QTFMocHJvdmlkZXIsIHBhaXJzLklOQ19QTFMsIHRva2Vucy5JTkMuYWRkcmVzcywgdG9rZW5zLklOQy5kZWNpbWFscyk7XHJcbiAgICBpZiAoaW5jUHJpY2VJblBscykge1xyXG4gICAgICBwcmljZXMuSU5DID0gaW5jUHJpY2VJblBscyAqIHBsc1VzZFByaWNlO1xyXG4gICAgICAvLyBJTkMgcHJpY2UgY2FsY3VsYXRlZFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNhdmFudCBwcmljZVxyXG4gICAgY29uc3Qgc2F2YW50UHJpY2VJblBscyA9IGF3YWl0IGdldFRva2VuUHJpY2VJblBMUyhwcm92aWRlciwgcGFpcnMuU2F2YW50X1BMUywgdG9rZW5zLlNhdmFudC5hZGRyZXNzLCB0b2tlbnMuU2F2YW50LmRlY2ltYWxzKTtcclxuICAgIGlmIChzYXZhbnRQcmljZUluUGxzKSB7XHJcbiAgICAgIHByaWNlcy5TYXZhbnQgPSBzYXZhbnRQcmljZUluUGxzICogcGxzVXNkUHJpY2U7XHJcbiAgICAgIC8vIFNhdmFudCBwcmljZSBjYWxjdWxhdGVkXHJcbiAgICB9XHJcblxyXG4gICAgLy8gSFhSIHByaWNlXHJcbiAgICBjb25zdCBoeHJQcmljZUluUGxzID0gYXdhaXQgZ2V0VG9rZW5QcmljZUluUExTKHByb3ZpZGVyLCBwYWlycy5IWFJfUExTLCB0b2tlbnMuSFhSLmFkZHJlc3MsIHRva2Vucy5IWFIuZGVjaW1hbHMpO1xyXG4gICAgaWYgKGh4clByaWNlSW5QbHMpIHtcclxuICAgICAgcHJpY2VzLkhYUiA9IGh4clByaWNlSW5QbHMgKiBwbHNVc2RQcmljZTtcclxuICAgICAgLy8gSFhSIHByaWNlIGNhbGN1bGF0ZWRcclxuICAgIH1cclxuXHJcbiAgICAvLyBUS1IgcHJpY2VcclxuICAgIGNvbnN0IHRrclByaWNlSW5QbHMgPSBhd2FpdCBnZXRUb2tlblByaWNlSW5QTFMocHJvdmlkZXIsIHBhaXJzLlRLUl9QTFMsIHRva2Vucy5US1IuYWRkcmVzcywgdG9rZW5zLlRLUi5kZWNpbWFscyk7XHJcbiAgICBpZiAodGtyUHJpY2VJblBscykge1xyXG4gICAgICBwcmljZXMuVEtSID0gdGtyUHJpY2VJblBscyAqIHBsc1VzZFByaWNlO1xyXG4gICAgICAvLyBUS1IgcHJpY2UgY2FsY3VsYXRlZFxyXG4gICAgfVxyXG5cclxuICAgIC8vIEpEQUkgcHJpY2VcclxuICAgIGNvbnN0IGpkYWlQcmljZUluUGxzID0gYXdhaXQgZ2V0VG9rZW5QcmljZUluUExTKHByb3ZpZGVyLCBwYWlycy5KREFJX1BMUywgdG9rZW5zLkpEQUkuYWRkcmVzcywgdG9rZW5zLkpEQUkuZGVjaW1hbHMpO1xyXG4gICAgaWYgKGpkYWlQcmljZUluUGxzKSB7XHJcbiAgICAgIHByaWNlcy5KREFJID0gamRhaVByaWNlSW5QbHMgKiBwbHNVc2RQcmljZTtcclxuICAgICAgLy8gSkRBSSBwcmljZSBjYWxjdWxhdGVkXHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmlja3kgcHJpY2VcclxuICAgIGNvbnN0IHJpY2t5UHJpY2VJblBscyA9IGF3YWl0IGdldFRva2VuUHJpY2VJblBMUyhwcm92aWRlciwgcGFpcnMuUmlja3lfUExTLCB0b2tlbnMuUmlja3kuYWRkcmVzcywgdG9rZW5zLlJpY2t5LmRlY2ltYWxzKTtcclxuICAgIGlmIChyaWNreVByaWNlSW5QbHMpIHtcclxuICAgICAgcHJpY2VzLlJpY2t5ID0gcmlja3lQcmljZUluUGxzICogcGxzVXNkUHJpY2U7XHJcbiAgICAgIC8vIFJpY2t5IHByaWNlIGNhbGN1bGF0ZWRcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgY2FjaGVcclxuICAgIHByaWNlQ2FjaGUucHJpY2VzW25ldHdvcmtdID0gcHJpY2VzO1xyXG4gICAgcHJpY2VDYWNoZS50aW1lc3RhbXAgPSBub3c7XHJcblxyXG4gICAgcmV0dXJuIHByaWNlcztcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHRva2VuIHByaWNlczonLCBlcnJvcik7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgVVNEIHZhbHVlIGZvciBhIHRva2VuIGFtb3VudFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5TeW1ib2wgLSBUb2tlbiBzeW1ib2wgKFBMUywgSEVYLCBQTFNYLCBJTkMsIGV0Yy4pXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhbW91bnQgLSBUb2tlbiBhbW91bnQgYXMgc3RyaW5nIChpbiBiYXNlIHVuaXRzKVxyXG4gKiBAcGFyYW0ge251bWJlcn0gZGVjaW1hbHMgLSBUb2tlbiBkZWNpbWFsc1xyXG4gKiBAcGFyYW0ge29iamVjdH0gcHJpY2VzIC0gUHJpY2UgZGF0YSBmcm9tIGZldGNoVG9rZW5QcmljZXMoKVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRva2VuVmFsdWVVU0QodG9rZW5TeW1ib2wsIGFtb3VudCwgZGVjaW1hbHMsIHByaWNlcykge1xyXG4gIGlmICghcHJpY2VzIHx8ICFwcmljZXNbdG9rZW5TeW1ib2xdKSB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIGNvbnN0IHRva2VuQW1vdW50ID0gcGFyc2VGbG9hdChldGhlcnMuZm9ybWF0VW5pdHMoYW1vdW50LCBkZWNpbWFscykpO1xyXG4gIGNvbnN0IHRva2VuUHJpY2UgPSBwcmljZXNbdG9rZW5TeW1ib2xdO1xyXG5cclxuICByZXR1cm4gdG9rZW5BbW91bnQgKiB0b2tlblByaWNlO1xyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IFVTRCB2YWx1ZSBmb3IgZGlzcGxheVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFVTRCh2YWx1ZSkge1xyXG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICByZXR1cm4gJ+KAlCc7XHJcbiAgfVxyXG5cclxuICBpZiAodmFsdWUgPCAwLjAxKSB7XHJcbiAgICByZXR1cm4gYCQke3ZhbHVlLnRvRml4ZWQoNil9YDtcclxuICB9IGVsc2UgaWYgKHZhbHVlIDwgMSkge1xyXG4gICAgcmV0dXJuIGAkJHt2YWx1ZS50b0ZpeGVkKDQpfWA7XHJcbiAgfSBlbHNlIGlmICh2YWx1ZSA8IDEwMCkge1xyXG4gICAgcmV0dXJuIGAkJHt2YWx1ZS50b0ZpeGVkKDIpfWA7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiBgJCR7dmFsdWUudG9Mb2NhbGVTdHJpbmcoJ2VuLVVTJywgeyBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IDIsIG1heGltdW1GcmFjdGlvbkRpZ2l0czogMiB9KX1gO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENsZWFyIHByaWNlIGNhY2hlICh1c2VmdWwgZm9yIHRlc3Rpbmcgb3IgbWFudWFsIHJlZnJlc2gpXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJQcmljZUNhY2hlKCkge1xyXG4gIHByaWNlQ2FjaGUucHJpY2VzID0ge307XHJcbiAgcHJpY2VDYWNoZS50aW1lc3RhbXAgPSAwO1xyXG4gIC8vIFByaWNlIGNhY2hlIGNsZWFyZWRcclxufVxyXG4iLCIvKipcclxuICogcG9wdXAuanNcclxuICpcclxuICogVUkgY29udHJvbGxlciBmb3IgSGVhcnRXYWxsZXQgcG9wdXBcclxuICovXHJcblxyXG5pbXBvcnQge1xyXG4gIGNyZWF0ZVdhbGxldCxcclxuICBpbXBvcnRGcm9tTW5lbW9uaWMsXHJcbiAgaW1wb3J0RnJvbVByaXZhdGVLZXksXHJcbiAgdW5sb2NrV2FsbGV0LFxyXG4gIHdhbGxldEV4aXN0cyxcclxuICBleHBvcnRQcml2YXRlS2V5LFxyXG4gIGV4cG9ydE1uZW1vbmljLFxyXG4gIGRlbGV0ZVdhbGxldCxcclxuICBtaWdyYXRlVG9NdWx0aVdhbGxldCxcclxuICBnZXRBbGxXYWxsZXRzLFxyXG4gIGdldEFjdGl2ZVdhbGxldCxcclxuICBzZXRBY3RpdmVXYWxsZXQsXHJcbiAgYWRkV2FsbGV0LFxyXG4gIHJlbmFtZVdhbGxldCxcclxuICBleHBvcnRQcml2YXRlS2V5Rm9yV2FsbGV0LFxyXG4gIGV4cG9ydE1uZW1vbmljRm9yV2FsbGV0XHJcbn0gZnJvbSAnLi4vY29yZS93YWxsZXQuanMnO1xyXG5pbXBvcnQgeyBzYXZlLCBsb2FkIH0gZnJvbSAnLi4vY29yZS9zdG9yYWdlLmpzJztcclxuaW1wb3J0IHsgc2hvcnRlbkFkZHJlc3MgfSBmcm9tICcuLi9jb3JlL3ZhbGlkYXRpb24uanMnO1xyXG5pbXBvcnQgKiBhcyBycGMgZnJvbSAnLi4vY29yZS9ycGMuanMnO1xyXG5pbXBvcnQgeyBldGhlcnMgfSBmcm9tICdldGhlcnMnO1xyXG5pbXBvcnQgUVJDb2RlIGZyb20gJ3FyY29kZSc7XHJcbmltcG9ydCAqIGFzIHRva2VucyBmcm9tICcuLi9jb3JlL3Rva2Vucy5qcyc7XHJcbmltcG9ydCB7IGZldGNoVG9rZW5QcmljZXMsIGdldFRva2VuVmFsdWVVU0QsIGZvcm1hdFVTRCB9IGZyb20gJy4uL2NvcmUvcHJpY2VPcmFjbGUuanMnO1xyXG5pbXBvcnQgKiBhcyBlcmMyMCBmcm9tICcuLi9jb3JlL2VyYzIwLmpzJztcclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gU0VDVVJJVFkgVVRJTElUSUVTXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbi8qKlxyXG4gKiBFc2NhcGVzIEhUTUwgc3BlY2lhbCBjaGFyYWN0ZXJzIHRvIHByZXZlbnQgWFNTIGF0dGFja3NcclxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUZXh0IHRvIGVzY2FwZVxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBIVE1MLXNhZmUgdGV4dFxyXG4gKi9cclxuZnVuY3Rpb24gZXNjYXBlSHRtbCh0ZXh0KSB7XHJcbiAgaWYgKHR5cGVvZiB0ZXh0ICE9PSAnc3RyaW5nJykgcmV0dXJuICcnO1xyXG4gIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIGRpdi50ZXh0Q29udGVudCA9IHRleHQ7XHJcbiAgcmV0dXJuIGRpdi5pbm5lckhUTUw7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYW5pdGl6ZXMgZXJyb3IgbWVzc2FnZXMgZm9yIHNhZmUgZGlzcGxheSBpbiBhbGVydHMgYW5kIFVJXHJcbiAqIFJlbW92ZXMgSFRNTCB0YWdzLCBzY3JpcHRzLCBhbmQgbGltaXRzIGxlbmd0aFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIEVycm9yIG1lc3NhZ2UgdG8gc2FuaXRpemVcclxuICogQHJldHVybnMge3N0cmluZ30gU2FuaXRpemVkIG1lc3NhZ2VcclxuICovXHJcbmZ1bmN0aW9uIHNhbml0aXplRXJyb3IobWVzc2FnZSkge1xyXG4gIGlmICh0eXBlb2YgbWVzc2FnZSAhPT0gJ3N0cmluZycpIHJldHVybiAnVW5rbm93biBlcnJvcic7XHJcbiAgXHJcbiAgLy8gUmVtb3ZlIG51bGwgYnl0ZXMgYW5kIGNvbnRyb2wgY2hhcmFjdGVycyAoZXhjZXB0IG5ld2xpbmVzIGFuZCB0YWJzKVxyXG4gIGxldCBzYW5pdGl6ZWQgPSBtZXNzYWdlLnJlcGxhY2UoL1tcXHgwMC1cXHgwOFxceDBCXFx4MENcXHgwRS1cXHgxRlxceDdGXS9nLCAnJyk7XHJcbiAgXHJcbiAgLy8gUmVtb3ZlIEhUTUwgdGFnc1xyXG4gIHNhbml0aXplZCA9IHNhbml0aXplZC5yZXBsYWNlKC88W14+XSo+L2csICcnKTtcclxuICBcclxuICAvLyBSZW1vdmUgc2NyaXB0LWxpa2UgY29udGVudFxyXG4gIHNhbml0aXplZCA9IHNhbml0aXplZC5yZXBsYWNlKC9qYXZhc2NyaXB0Oi9naSwgJycpO1xyXG4gIHNhbml0aXplZCA9IHNhbml0aXplZC5yZXBsYWNlKC9vblxcdytcXHMqPS9naSwgJycpO1xyXG4gIFxyXG4gIC8vIExpbWl0IGxlbmd0aCB0byBwcmV2ZW50IERvU1xyXG4gIGlmIChzYW5pdGl6ZWQubGVuZ3RoID4gMzAwKSB7XHJcbiAgICBzYW5pdGl6ZWQgPSBzYW5pdGl6ZWQuc3Vic3RyaW5nKDAsIDI5NykgKyAnLi4uJztcclxuICB9XHJcbiAgXHJcbiAgcmV0dXJuIHNhbml0aXplZCB8fCAnVW5rbm93biBlcnJvcic7XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gU1RBVEVcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuLy8gPT09PT0gU1RBVEUgPT09PT1cclxubGV0IGN1cnJlbnRTdGF0ZSA9IHtcclxuICBpc1VubG9ja2VkOiBmYWxzZSxcclxuICBhZGRyZXNzOiBudWxsLFxyXG4gIGJhbGFuY2U6ICcwJyxcclxuICBuZXR3b3JrOiAncHVsc2VjaGFpbicsIC8vIERlZmF1bHQgdG8gUHVsc2VDaGFpbiBNYWlubmV0XHJcbiAgc2Vzc2lvblRva2VuOiBudWxsLCAvLyBTZXNzaW9uIHRva2VuIGZvciBhdXRoZW50aWNhdGVkIG9wZXJhdGlvbnMgKHN0b3JlZCBpbiBtZW1vcnkgb25seSlcclxuICBzZXR0aW5nczoge1xyXG4gICAgYXV0b0xvY2tNaW51dGVzOiAxNSxcclxuICAgIHNob3dUZXN0TmV0d29ya3M6IHRydWUsXHJcbiAgICBkZWNpbWFsUGxhY2VzOiA4LFxyXG4gICAgdGhlbWU6ICdoaWdoLWNvbnRyYXN0JyxcclxuICAgIG1heEdhc1ByaWNlR3dlaTogMTAwMCAvLyBNYXhpbXVtIGdhcyBwcmljZSBpbiBHd2VpIChkZWZhdWx0IDEwMDApXHJcbiAgfSxcclxuICBuZXR3b3JrU2V0dGluZ3M6IG51bGwsIC8vIFdpbGwgYmUgbG9hZGVkIGZyb20gc3RvcmFnZSBvciB1c2UgZGVmYXVsdHNcclxuICBsYXN0QWN0aXZpdHlUaW1lOiBudWxsLCAvLyBUcmFjayBsYXN0IGFjdGl2aXR5IGZvciBhdXRvLWxvY2tcclxuICB0b2tlblByaWNlczogbnVsbCwgLy8gVG9rZW4gcHJpY2VzIGluIFVTRCAoY2FjaGVkIGZyb20gUHVsc2VYKVxyXG4gIGN1cnJlbnRUb2tlbkRldGFpbHM6IG51bGwgLy8gQ3VycmVudGx5IHZpZXdpbmcgdG9rZW4gZGV0YWlsc1xyXG59O1xyXG5cclxuLy8gQXV0by1sb2NrIHRpbWVyXHJcbmxldCBhdXRvTG9ja1RpbWVyID0gbnVsbDtcclxuXHJcbi8vIFJhdGUgbGltaXRpbmcgZm9yIHBhc3N3b3JkIGF0dGVtcHRzXHJcbmNvbnN0IFJBVEVfTElNSVRfS0VZID0gJ3Bhc3N3b3JkX2F0dGVtcHRzJztcclxuY29uc3QgTUFYX0FUVEVNUFRTID0gNTtcclxuY29uc3QgTE9DS09VVF9EVVJBVElPTl9NUyA9IDMwICogNjAgKiAxMDAwOyAvLyAzMCBtaW51dGVzXHJcblxyXG4vLyBOZXR3b3JrIG5hbWVzIGZvciBkaXNwbGF5XHJcbmNvbnN0IE5FVFdPUktfTkFNRVMgPSB7XHJcbiAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ1B1bHNlQ2hhaW4gVGVzdG5ldCBWNCcsXHJcbiAgJ3B1bHNlY2hhaW4nOiAnUHVsc2VDaGFpbiBNYWlubmV0JyxcclxuICAnZXRoZXJldW0nOiAnRXRoZXJldW0gTWFpbm5ldCcsXHJcbiAgJ3NlcG9saWEnOiAnU2Vwb2xpYSBUZXN0bmV0J1xyXG59O1xyXG5cclxuY29uc3QgQkxPQ0tfRVhQTE9SRVJTID0ge1xyXG4gICdwdWxzZWNoYWluVGVzdG5ldCc6IHtcclxuICAgIGJhc2U6ICdodHRwczovL3NjYW4udjQudGVzdG5ldC5wdWxzZWNoYWluLmNvbScsXHJcbiAgICB0eDogJy90eC97aGFzaH0nLFxyXG4gICAgYWRkcmVzczogJy9hZGRyZXNzL3thZGRyZXNzfScsXHJcbiAgICB0b2tlbjogJy90b2tlbi97YWRkcmVzc30nXHJcbiAgfSxcclxuICAncHVsc2VjaGFpbic6IHtcclxuICAgIGJhc2U6ICdodHRwczovL3NjYW4ubXlwaW5hdGEuY2xvdWQvaXBmcy9iYWZ5YmVpZW54eW95cmhuNXRzd2NsdmQzZ2RqeTVtdGtrd211MzdhcXRtbDZvbmJmN3huYjNvMjJwZS8nLFxyXG4gICAgdHg6ICcjL3R4L3toYXNofScsXHJcbiAgICBhZGRyZXNzOiAnIy9hZGRyZXNzL3thZGRyZXNzfScsXHJcbiAgICB0b2tlbjogJyMvdG9rZW4ve2FkZHJlc3N9J1xyXG4gIH0sXHJcbiAgJ2V0aGVyZXVtJzoge1xyXG4gICAgYmFzZTogJ2h0dHBzOi8vZXRoZXJzY2FuLmlvJyxcclxuICAgIHR4OiAnL3R4L3toYXNofScsXHJcbiAgICBhZGRyZXNzOiAnL2FkZHJlc3Mve2FkZHJlc3N9JyxcclxuICAgIHRva2VuOiAnL3Rva2VuL3thZGRyZXNzfSdcclxuICB9LFxyXG4gICdzZXBvbGlhJzoge1xyXG4gICAgYmFzZTogJ2h0dHBzOi8vc2Vwb2xpYS5ldGhlcnNjYW4uaW8nLFxyXG4gICAgdHg6ICcvdHgve2hhc2h9JyxcclxuICAgIGFkZHJlc3M6ICcvYWRkcmVzcy97YWRkcmVzc30nLFxyXG4gICAgdG9rZW46ICcvdG9rZW4ve2FkZHJlc3N9J1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBCdWlsZCBleHBsb3JlciBVUkwgZm9yIGEgc3BlY2lmaWMgdHlwZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVVJMIHR5cGUgKCd0eCcsICdhZGRyZXNzJywgJ3Rva2VuJylcclxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gVGhlIGhhc2ggb3IgYWRkcmVzcyB2YWx1ZVxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBDb21wbGV0ZSBleHBsb3JlciBVUkxcclxuICovXHJcbmZ1bmN0aW9uIGdldEV4cGxvcmVyVXJsKG5ldHdvcmssIHR5cGUsIHZhbHVlKSB7XHJcbiAgY29uc3QgZXhwbG9yZXIgPSBCTE9DS19FWFBMT1JFUlNbbmV0d29ya107XHJcbiAgaWYgKCFleHBsb3JlcikgcmV0dXJuICcnO1xyXG5cclxuICBjb25zdCBwYXR0ZXJuID0gZXhwbG9yZXJbdHlwZV07XHJcbiAgaWYgKCFwYXR0ZXJuKSByZXR1cm4gJyc7XHJcblxyXG4gIHJldHVybiBleHBsb3Jlci5iYXNlICsgcGF0dGVybi5yZXBsYWNlKGB7JHt0eXBlID09PSAndHgnID8gJ2hhc2gnIDogJ2FkZHJlc3MnfX1gLCB2YWx1ZSk7XHJcbn1cclxuXHJcbi8vID09PT09IElOSVRJQUxJWkFUSU9OID09PT09XHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBhc3luYyAoKSA9PiB7XHJcbiAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIGNvbm5lY3Rpb24gYXBwcm92YWwgcmVxdWVzdFxyXG4gIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XHJcbiAgY29uc3QgYWN0aW9uID0gdXJsUGFyYW1zLmdldCgnYWN0aW9uJyk7XHJcbiAgY29uc3Qgb3JpZ2luID0gdXJsUGFyYW1zLmdldCgnb3JpZ2luJyk7XHJcbiAgY29uc3QgcmVxdWVzdElkID0gdXJsUGFyYW1zLmdldCgncmVxdWVzdElkJyk7XHJcblxyXG4gIGlmIChhY3Rpb24gPT09ICdjb25uZWN0JyAmJiBvcmlnaW4gJiYgcmVxdWVzdElkKSB7XHJcbiAgICAvLyBTaG93IGNvbm5lY3Rpb24gYXBwcm92YWwgc2NyZWVuXHJcbiAgICBhd2FpdCBoYW5kbGVDb25uZWN0aW9uQXBwcm92YWxTY3JlZW4ob3JpZ2luLCByZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaWYgKGFjdGlvbiA9PT0gJ3RyYW5zYWN0aW9uJyAmJiByZXF1ZXN0SWQpIHtcclxuICAgIC8vIFNob3cgdHJhbnNhY3Rpb24gYXBwcm92YWwgc2NyZWVuXHJcbiAgICBzZXR1cEV2ZW50TGlzdGVuZXJzKCk7IC8vIFNldCB1cCBldmVudCBsaXN0ZW5lcnMgZmlyc3RcclxuICAgIGF3YWl0IGhhbmRsZVRyYW5zYWN0aW9uQXBwcm92YWxTY3JlZW4ocmVxdWVzdElkKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmIChhY3Rpb24gPT09ICdhZGRUb2tlbicgJiYgcmVxdWVzdElkKSB7XHJcbiAgICAvLyBTaG93IHRva2VuIGFkZCBhcHByb3ZhbCBzY3JlZW5cclxuICAgIGF3YWl0IGhhbmRsZVRva2VuQWRkQXBwcm92YWxTY3JlZW4ocmVxdWVzdElkKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmIChhY3Rpb24gPT09ICdzaWduJyAmJiByZXF1ZXN0SWQpIHtcclxuICAgIC8vIFNob3cgbWVzc2FnZSBzaWduaW5nIGFwcHJvdmFsIHNjcmVlblxyXG4gICAgYXdhaXQgaGFuZGxlTWVzc2FnZVNpZ25BcHByb3ZhbFNjcmVlbihyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaWYgKGFjdGlvbiA9PT0gJ3NpZ25UeXBlZCcgJiYgcmVxdWVzdElkKSB7XHJcbiAgICAvLyBTaG93IHR5cGVkIGRhdGEgc2lnbmluZyBhcHByb3ZhbCBzY3JlZW5cclxuICAgIGF3YWl0IGhhbmRsZVR5cGVkRGF0YVNpZ25BcHByb3ZhbFNjcmVlbihyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gTm9ybWFsIHBvcHVwIGZsb3dcclxuICAvLyBSdW4gbWlncmF0aW9uIGZpcnN0IChjb252ZXJ0cyBvbGQgc2luZ2xlLXdhbGxldCB0byBtdWx0aS13YWxsZXQgZm9ybWF0KVxyXG4gIGF3YWl0IG1pZ3JhdGVUb011bHRpV2FsbGV0KCk7XHJcblxyXG4gIGF3YWl0IGxvYWRTZXR0aW5ncygpO1xyXG4gIGF3YWl0IGxvYWROZXR3b3JrKCk7XHJcbiAgYXBwbHlUaGVtZSgpO1xyXG4gIGF3YWl0IGNoZWNrV2FsbGV0U3RhdHVzKCk7XHJcbiAgc2V0dXBFdmVudExpc3RlbmVycygpO1xyXG4gIHVwZGF0ZU5ldHdvcmtEaXNwbGF5cygpO1xyXG59KTtcclxuXHJcbi8vID09PT09IFNDUkVFTiBOQVZJR0FUSU9OID09PT09XHJcbmZ1bmN0aW9uIHNob3dTY3JlZW4oc2NyZWVuSWQpIHtcclxuICAvLyBIaWRlIGFsbCBzY3JlZW5zXHJcbiAgY29uc3Qgc2NyZWVucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tpZF49XCJzY3JlZW4tXCJdJyk7XHJcbiAgc2NyZWVucy5mb3JFYWNoKHNjcmVlbiA9PiBzY3JlZW4uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJykpO1xyXG5cclxuICAvLyBTaG93IHJlcXVlc3RlZCBzY3JlZW5cclxuICBjb25zdCBzY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzY3JlZW5JZCk7XHJcbiAgaWYgKHNjcmVlbikge1xyXG4gICAgc2NyZWVuLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgLy8gU2Nyb2xsIHRvIHRvcCB3aGVuIHNob3dpbmcgbmV3IHNjcmVlblxyXG4gICAgd2luZG93LnNjcm9sbFRvKDAsIDApO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY2hlY2tXYWxsZXRTdGF0dXMoKSB7XHJcbiAgY29uc3QgZXhpc3RzID0gYXdhaXQgd2FsbGV0RXhpc3RzKCk7XHJcblxyXG4gIGlmICghZXhpc3RzKSB7XHJcbiAgICAvLyBObyB3YWxsZXQgLSBzaG93IHNldHVwIHNjcmVlblxyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXNldHVwJyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIFdhbGxldCBleGlzdHMgLSBzaG93IHVubG9jayBzY3JlZW5cclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi11bmxvY2snKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFNFVFRJTkdTID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIGxvYWRTZXR0aW5ncygpIHtcclxuICBjb25zdCBzYXZlZCA9IGF3YWl0IGxvYWQoJ3NldHRpbmdzJyk7XHJcbiAgaWYgKHNhdmVkKSB7XHJcbiAgICBjdXJyZW50U3RhdGUuc2V0dGluZ3MgPSB7IC4uLmN1cnJlbnRTdGF0ZS5zZXR0aW5ncywgLi4uc2F2ZWQgfTtcclxuICB9XHJcblxyXG4gIC8vIExvYWQgbmV0d29yayBzZXR0aW5nc1xyXG4gIGNvbnN0IG5ldHdvcmtTZXR0aW5ncyA9IGF3YWl0IGxvYWQoJ25ldHdvcmtTZXR0aW5ncycpO1xyXG4gIGlmIChuZXR3b3JrU2V0dGluZ3MpIHtcclxuICAgIGN1cnJlbnRTdGF0ZS5uZXR3b3JrU2V0dGluZ3MgPSBuZXR3b3JrU2V0dGluZ3M7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzYXZlU2V0dGluZ3MoKSB7XHJcbiAgYXdhaXQgc2F2ZSgnc2V0dGluZ3MnLCBjdXJyZW50U3RhdGUuc2V0dGluZ3MpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBsb2FkTmV0d29yaygpIHtcclxuICBjb25zdCBzYXZlZCA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJyk7XHJcbiAgaWYgKHNhdmVkKSB7XHJcbiAgICBjdXJyZW50U3RhdGUubmV0d29yayA9IHNhdmVkO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2F2ZU5ldHdvcmsoKSB7XHJcbiAgYXdhaXQgc2F2ZSgnY3VycmVudE5ldHdvcmsnLCBjdXJyZW50U3RhdGUubmV0d29yayk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5VGhlbWUoKSB7XHJcbiAgLy8gUmVtb3ZlIGFsbCB0aGVtZSBjbGFzc2VzXHJcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCd0aGVtZS1oaWdoLWNvbnRyYXN0JywgJ3RoZW1lLXByb2Zlc3Npb25hbCcsICd0aGVtZS1hbWJlcicsICd0aGVtZS1jZ2EnLCAndGhlbWUtY2xhc3NpYycsICd0aGVtZS1oZWFydCcpO1xyXG5cclxuICAvLyBBcHBseSBjdXJyZW50IHRoZW1lXHJcbiAgaWYgKGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy50aGVtZSAhPT0gJ2hpZ2gtY29udHJhc3QnKSB7XHJcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoYHRoZW1lLSR7Y3VycmVudFN0YXRlLnNldHRpbmdzLnRoZW1lfWApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gRVZFTlQgTElTVEVORVJTID09PT09XHJcbmZ1bmN0aW9uIHNldHVwRXZlbnRMaXN0ZW5lcnMoKSB7XHJcbiAgLy8gU2V0dXAgc2NyZWVuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jcmVhdGUtd2FsbGV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgYXdhaXQgZ2VuZXJhdGVOZXdNbmVtb25pYygpO1xyXG4gICAgdXBkYXRlTmV0d29ya0Rpc3BsYXlzKCk7XHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tY3JlYXRlJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4taW1wb3J0LXdhbGxldCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIHVwZGF0ZU5ldHdvcmtEaXNwbGF5cygpO1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLWltcG9ydCcpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBOZXR3b3JrIHNlbGVjdGlvbiBvbiBzZXR1cCBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1zZWxlY3Qtc2V0dXAnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgIGN1cnJlbnRTdGF0ZS5uZXR3b3JrID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICBzYXZlTmV0d29yaygpO1xyXG4gICAgdXBkYXRlTmV0d29ya0Rpc3BsYXlzKCk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIENyZWF0ZSB3YWxsZXQgc2NyZWVuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Noay1zYXZlZC1tbmVtb25pYycpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgY29uc3QgcGFzc3dvcmRDcmVhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtY3JlYXRlJykudmFsdWU7XHJcbiAgICBjb25zdCBwYXNzd29yZENvbmZpcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtY29uZmlybScpLnZhbHVlO1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jcmVhdGUtc3VibWl0Jyk7XHJcblxyXG4gICAgYnRuLmRpc2FibGVkID0gIShlLnRhcmdldC5jaGVja2VkICYmIHBhc3N3b3JkQ3JlYXRlICYmIHBhc3N3b3JkQ29uZmlybSAmJiBwYXNzd29yZENyZWF0ZSA9PT0gcGFzc3dvcmRDb25maXJtKTtcclxuICB9KTtcclxuXHJcbiAgWydwYXNzd29yZC1jcmVhdGUnLCAncGFzc3dvcmQtY29uZmlybSddLmZvckVhY2goaWQgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcclxuICAgICAgY29uc3QgY2hlY2tlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGstc2F2ZWQtbW5lbW9uaWMnKS5jaGVja2VkO1xyXG4gICAgICBjb25zdCBwYXNzd29yZENyZWF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1jcmVhdGUnKS52YWx1ZTtcclxuICAgICAgY29uc3QgcGFzc3dvcmRDb25maXJtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLWNvbmZpcm0nKS52YWx1ZTtcclxuICAgICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jcmVhdGUtc3VibWl0Jyk7XHJcblxyXG4gICAgICBidG4uZGlzYWJsZWQgPSAhKGNoZWNrZWQgJiYgcGFzc3dvcmRDcmVhdGUgJiYgcGFzc3dvcmRDb25maXJtICYmIHBhc3N3b3JkQ3JlYXRlID09PSBwYXNzd29yZENvbmZpcm0pO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY3JlYXRlLXN1Ym1pdCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNyZWF0ZVdhbGxldCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtY3JlYXRlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLXNldHVwJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYmFjay1mcm9tLWNyZWF0ZScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1zZXR1cCcpKTtcclxuXHJcbiAgLy8gSW1wb3J0IHdhbGxldCBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1wb3J0LW1ldGhvZCcpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgY29uc3QgbW5lbW9uaWNHcm91cCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbXBvcnQtbW5lbW9uaWMtZ3JvdXAnKTtcclxuICAgIGNvbnN0IHByaXZhdGVrZXlHcm91cCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbXBvcnQtcHJpdmF0ZWtleS1ncm91cCcpO1xyXG5cclxuICAgIGlmIChlLnRhcmdldC52YWx1ZSA9PT0gJ21uZW1vbmljJykge1xyXG4gICAgICBtbmVtb25pY0dyb3VwLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICBwcml2YXRla2V5R3JvdXAuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtbmVtb25pY0dyb3VwLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICBwcml2YXRla2V5R3JvdXAuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4taW1wb3J0LXN1Ym1pdCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUltcG9ydFdhbGxldCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtaW1wb3J0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLXNldHVwJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYmFjay1mcm9tLWltcG9ydCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1zZXR1cCcpKTtcclxuXHJcbiAgLy8gVW5sb2NrIHNjcmVlblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdW5sb2NrJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlVW5sb2NrKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtdW5sb2NrJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgKGUpID0+IHtcclxuICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykge1xyXG4gICAgICBoYW5kbGVVbmxvY2soKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gQ3VzdG9tIG5ldHdvcmsgZHJvcGRvd25cclxuICBjb25zdCBuZXR3b3JrU2VsZWN0Q3VzdG9tID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmstc2VsZWN0LWN1c3RvbScpO1xyXG4gIGNvbnN0IG5ldHdvcmtEcm9wZG93bk1lbnUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1kcm9wZG93bi1tZW51Jyk7XHJcblxyXG4gIC8vIEluaXRpYWxpemUgZHJvcGRvd24gb3B0aW9uIGxvZ29zXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5ldHdvcmstb3B0aW9uIGltZycpLmZvckVhY2goaW1nID0+IHtcclxuICAgIGNvbnN0IGxvZ29GaWxlID0gaW1nLmdldEF0dHJpYnV0ZSgnZGF0YS1sb2dvJyk7XHJcbiAgICBpZiAobG9nb0ZpbGUpIHtcclxuICAgICAgaW1nLnNyYyA9IGNocm9tZS5ydW50aW1lLmdldFVSTChgYXNzZXRzL2xvZ29zLyR7bG9nb0ZpbGV9YCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIC8vIFRvZ2dsZSBkcm9wZG93blxyXG4gIG5ldHdvcmtTZWxlY3RDdXN0b20/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICBuZXR3b3JrRHJvcGRvd25NZW51LmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBIYW5kbGUgb3B0aW9uIHNlbGVjdGlvblxyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5uZXR3b3JrLW9wdGlvbicpLmZvckVhY2gob3B0aW9uID0+IHtcclxuICAgIG9wdGlvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIGNvbnN0IG5ldHdvcmsgPSBvcHRpb24uZ2V0QXR0cmlidXRlKCdkYXRhLW5ldHdvcmsnKTtcclxuICAgICAgY29uc3QgbmV0d29ya1RleHQgPSBvcHRpb24ucXVlcnlTZWxlY3Rvcignc3BhbicpLnRleHRDb250ZW50O1xyXG5cclxuICAgICAgY3VycmVudFN0YXRlLm5ldHdvcmsgPSBuZXR3b3JrO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1zZWxlY3RlZC10ZXh0JykudGV4dENvbnRlbnQgPSBuZXR3b3JrVGV4dDtcclxuICAgICAgbmV0d29ya0Ryb3Bkb3duTWVudS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgIHNhdmVOZXR3b3JrKCk7XHJcbiAgICAgIHVwZGF0ZU5ldHdvcmtEaXNwbGF5cygpO1xyXG4gICAgICBhd2FpdCBmZXRjaEJhbGFuY2UoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhvdmVyIGVmZmVjdCAtIGJvbGQgdGV4dFxyXG4gICAgb3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7XHJcbiAgICAgIG9wdGlvbi5xdWVyeVNlbGVjdG9yKCdzcGFuJykuc3R5bGUuZm9udFdlaWdodCA9ICdib2xkJztcclxuICAgIH0pO1xyXG4gICAgb3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XHJcbiAgICAgIG9wdGlvbi5xdWVyeVNlbGVjdG9yKCdzcGFuJykuc3R5bGUuZm9udFdlaWdodCA9ICdub3JtYWwnO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIENsb3NlIGRyb3Bkb3duIHdoZW4gY2xpY2tpbmcgb3V0c2lkZVxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgbmV0d29ya0Ryb3Bkb3duTWVudT8uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3YWxsZXQtc2VsZWN0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGFzeW5jIChlKSA9PiB7XHJcbiAgICBjb25zdCBzZWxlY3RlZFdhbGxldElkID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICBpZiAoc2VsZWN0ZWRXYWxsZXRJZCkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IHNldEFjdGl2ZVdhbGxldChzZWxlY3RlZFdhbGxldElkKTtcclxuICAgICAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgICAgICBjdXJyZW50U3RhdGUuYWRkcmVzcyA9IHdhbGxldC5hZGRyZXNzO1xyXG4gICAgICAgIGF3YWl0IHVwZGF0ZURhc2hib2FyZCgpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGFsZXJ0KCdFcnJvciBzd2l0Y2hpbmcgd2FsbGV0OiAnICsgc2FuaXRpemVFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1sb2NrJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlTG9jayk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1yZWZyZXNoJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgYXdhaXQgdXBkYXRlRGFzaGJvYXJkKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1zZXR0aW5ncycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGxvYWRTZXR0aW5nc1RvVUkoKTtcclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1zZXR0aW5ncycpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLW5ldHdvcmstc2V0dGluZ3MnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBsb2FkTmV0d29ya1NldHRpbmdzVG9VSSgpO1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLW5ldHdvcmstc2V0dGluZ3MnKTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20tbmV0d29yay1zZXR0aW5ncycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1zZXR0aW5ncycpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXNhdmUtbmV0d29yay1zZXR0aW5ncycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgIGF3YWl0IHNhdmVOZXR3b3JrU2V0dGluZ3MoKTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1yZXNldC1uZXR3b3JrLXNldHRpbmdzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgaWYgKGNvbmZpcm0oJ1Jlc2V0IGFsbCBuZXR3b3JrIHNldHRpbmdzIHRvIGRlZmF1bHRzPycpKSB7XHJcbiAgICAgIHJlc2V0TmV0d29ya1NldHRpbmdzVG9EZWZhdWx0cygpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS1hZGRyZXNzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQ29weUFkZHJlc3MpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tc2VuZCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3dTZW5kU2NyZWVuKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlY2VpdmUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93UmVjZWl2ZVNjcmVlbik7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi10b2tlbnMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93VG9rZW5zU2NyZWVuKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXR4LWhpc3RvcnknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93VHJhbnNhY3Rpb25IaXN0b3J5KTtcclxuXHJcbiAgLy8gU2VuZCBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS1zZW5kJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpO1xyXG4gICAgdXBkYXRlRGFzaGJvYXJkKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb25maXJtLXNlbmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTZW5kVHJhbnNhY3Rpb24pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2FuY2VsLXNlbmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tc2VuZC1tYXgnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTZW5kTWF4KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hc3NldC1zZWxlY3QnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlQXNzZXRDaGFuZ2UpO1xyXG5cclxuICAvLyBSZWNlaXZlIHNjcmVlblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYmFjay1mcm9tLXJlY2VpdmUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS1yZWNlaXZlLWFkZHJlc3MnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDb3B5UmVjZWl2ZUFkZHJlc3MpO1xyXG5cclxuICAvLyBUb2tlbnMgc2NyZWVuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20tdG9rZW5zJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWFkZC1jdXN0b20tdG9rZW4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93QWRkVG9rZW5Nb2RhbCk7XHJcblxyXG4gIC8vIFRva2VuIERldGFpbHMgc2NyZWVuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20tdG9rZW4tZGV0YWlscycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi10b2tlbnMnKTtcclxuICAgIGF3YWl0IHJlbmRlclRva2Vuc1NjcmVlbigpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWNvcHktYWRkcmVzcycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNvcHlUb2tlbkRldGFpbHNBZGRyZXNzKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXRva2VuLXNlbmQtbWF4Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlVG9rZW5TZW5kTWF4KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXRva2VuLXNlbmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVUb2tlblNlbmQpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWVuYWJsZS10b2dnbGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlVG9rZW5FbmFibGVUb2dnbGUpO1xyXG5cclxuICAvLyBUcmFuc2FjdGlvbiBIaXN0b3J5XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlbmRpbmctdHgtaW5kaWNhdG9yJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2hvd1RyYW5zYWN0aW9uSGlzdG9yeSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20tdHgtaGlzdG9yeScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlci1hbGwtdHhzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gcmVuZGVyVHJhbnNhY3Rpb25IaXN0b3J5KCdhbGwnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlci1wZW5kaW5nLXR4cycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHJlbmRlclRyYW5zYWN0aW9uSGlzdG9yeSgncGVuZGluZycpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsdGVyLWNvbmZpcm1lZC10eHMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiByZW5kZXJUcmFuc2FjdGlvbkhpc3RvcnkoJ2NvbmZpcm1lZCcpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsZWFyLXR4LWhpc3RvcnknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDbGVhclRyYW5zYWN0aW9uSGlzdG9yeSk7XHJcblxyXG4gIC8vIFRyYW5zYWN0aW9uIERldGFpbHNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS10eC1kZXRhaWxzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLXR4LWhpc3RvcnknKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LXR4LWhhc2gnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICBjb25zdCBoYXNoID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1oYXNoJykudGV4dENvbnRlbnQ7XHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChoYXNoKTtcclxuICAgICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LXR4LWhhc2gnKTtcclxuICAgICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gYnRuLnRleHRDb250ZW50O1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSAnQ09QSUVEISc7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGJ0bi50ZXh0Q29udGVudCA9IG9yaWdpbmFsVGV4dDtcclxuICAgICAgfSwgMjAwMCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBhbGVydCgnRmFpbGVkIHRvIGNvcHkgaGFzaCcpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tc3BlZWQtdXAtdHgnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTcGVlZFVwVHJhbnNhY3Rpb24pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2FuY2VsLXR4Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQ2FuY2VsVHJhbnNhY3Rpb24pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVmcmVzaC10eC1zdGF0dXMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZWZyZXNoVHJhbnNhY3Rpb25TdGF0dXMpO1xyXG5cclxuICAvLyBTcGVlZC11cCB0cmFuc2FjdGlvbiBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2Utc3BlZWQtdXAtbW9kYWwnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtc3BlZWQtdXAtdHgnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1zcGVlZC11cCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1zcGVlZC11cC10eCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29uZmlybS1zcGVlZC11cCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNvbmZpcm1TcGVlZFVwKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlZnJlc2gtZ2FzLXByaWNlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcmVmcmVzaEdhc1ByaWNlcyk7XHJcblxyXG4gIC8vIEdhcyBwcmljZSByZWZyZXNoIGJ1dHRvbnNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlZnJlc2gtYXBwcm92YWwtZ2FzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcmVmcmVzaEFwcHJvdmFsR2FzUHJpY2UpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVmcmVzaC1zZW5kLWdhcycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlZnJlc2hTZW5kR2FzUHJpY2UpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVmcmVzaC10b2tlbi1nYXMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZWZyZXNoVG9rZW5HYXNQcmljZSk7XHJcblxyXG4gIC8vIEFkZCB0b2tlbiBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtYWRkLXRva2VuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWFkZC10b2tlbicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2FuY2VsLWFkZC10b2tlbicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtdG9rZW4nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvbmZpcm0tYWRkLXRva2VuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQWRkQ3VzdG9tVG9rZW4pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC10b2tlbi1hZGRyZXNzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgaGFuZGxlVG9rZW5BZGRyZXNzSW5wdXQpO1xyXG5cclxuICAvLyBTZXR0aW5ncyBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS1zZXR0aW5ncycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctdGhlbWUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy50aGVtZSA9IGUudGFyZ2V0LnZhbHVlO1xyXG4gICAgYXBwbHlUaGVtZSgpO1xyXG4gICAgc2F2ZVNldHRpbmdzKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctZGVjaW1hbHMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5kZWNpbWFsUGxhY2VzID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgc2F2ZVNldHRpbmdzKCk7XHJcbiAgICB1cGRhdGVCYWxhbmNlRGlzcGxheSgpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLWF1dG9sb2NrJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XHJcbiAgICBjdXJyZW50U3RhdGUuc2V0dGluZ3MuYXV0b0xvY2tNaW51dGVzID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgc2F2ZVNldHRpbmdzKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctbWF4LWdhcy1wcmljZScpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgY3VycmVudFN0YXRlLnNldHRpbmdzLm1heEdhc1ByaWNlR3dlaSA9IHBhcnNlSW50KGUudGFyZ2V0LnZhbHVlKTtcclxuICAgIHNhdmVTZXR0aW5ncygpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLXNob3ctdGVzdG5ldHMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5zaG93VGVzdE5ldHdvcmtzID0gZS50YXJnZXQuY2hlY2tlZDtcclxuICAgIHNhdmVTZXR0aW5ncygpO1xyXG4gICAgdXBkYXRlTmV0d29ya1NlbGVjdG9yKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi12aWV3LXNlZWQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVWaWV3U2VlZCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1leHBvcnQta2V5Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlRXhwb3J0S2V5KTtcclxuXHJcbiAgLy8gUGFzc3dvcmQgcHJvbXB0IG1vZGFsXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1wYXNzd29yZC1wcm9tcHQtY29uZmlybScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1pbnB1dCcpLnZhbHVlO1xyXG4gICAgaWYgKHBhc3N3b3JkKSB7XHJcbiAgICAgIGNsb3NlUGFzc3dvcmRQcm9tcHQocGFzc3dvcmQpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXBhc3N3b3JkLXByb21wdC1jYW5jZWwnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBjbG9zZVBhc3N3b3JkUHJvbXB0KG51bGwpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLXBhc3N3b3JkLXByb21wdCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGNsb3NlUGFzc3dvcmRQcm9tcHQobnVsbCk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1wcm9tcHQtaW5wdXQnKT8uYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCAoZSkgPT4ge1xyXG4gICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XHJcbiAgICAgIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1pbnB1dCcpLnZhbHVlO1xyXG4gICAgICBpZiAocGFzc3dvcmQpIHtcclxuICAgICAgICBjbG9zZVBhc3N3b3JkUHJvbXB0KHBhc3N3b3JkKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBEaXNwbGF5IHNlY3JldCBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtZGlzcGxheS1zZWNyZXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZVNlY3JldE1vZGFsKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLWRpc3BsYXktc2VjcmV0LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlU2VjcmV0TW9kYWwpO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvcHktc2VjcmV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgY29uc3Qgc2VjcmV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpc3BsYXktc2VjcmV0LWNvbnRlbnQnKS50ZXh0Q29udGVudDtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHNlY3JldCk7XHJcbiAgICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS1zZWNyZXQnKTtcclxuICAgICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gYnRuLnRleHRDb250ZW50O1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSAnQ09QSUVEISc7XHJcbiAgICAgIGJ0bi5jbGFzc0xpc3QuYWRkKCd0ZXh0LXN1Y2Nlc3MnKTtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgYnRuLnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0O1xyXG4gICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCd0ZXh0LXN1Y2Nlc3MnKTtcclxuICAgICAgfSwgMjAwMCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBhbGVydCgnRmFpbGVkIHRvIGNvcHkgdG8gY2xpcGJvYXJkJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIC8vIE11bHRpLXdhbGxldCBtYW5hZ2VtZW50XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1tYW5hZ2Utd2FsbGV0cycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZU1hbmFnZVdhbGxldHMpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYmFjay1mcm9tLW1hbmFnZS13YWxsZXRzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLXNldHRpbmdzJykpO1xyXG5cclxuICAvLyBBZGQgd2FsbGV0IGJ1dHRvbnNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNyZWF0ZS1uZXctd2FsbGV0LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2hvd0FkZFdhbGxldE1vZGFsKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWltcG9ydC13YWxsZXQtbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93QWRkV2FsbGV0TW9kYWwpO1xyXG5cclxuICAvLyBBZGQgd2FsbGV0IG1vZGFsIC0gb3B0aW9uIHNlbGVjdGlvblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtd2FsbGV0LW9wdGlvbi1jcmVhdGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYWRkLXdhbGxldCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZ2VuZXJhdGVOZXdNbmVtb25pY011bHRpKCk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtY3JlYXRlLXdhbGxldC1tdWx0aScpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkLXdhbGxldC1vcHRpb24tbW5lbW9uaWMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYWRkLXdhbGxldCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1zZWVkLW11bHRpJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtd2FsbGV0LW9wdGlvbi1wcml2YXRla2V5Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWFkZC13YWxsZXQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1pbXBvcnQta2V5LW11bHRpJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtYWRkLXdhbGxldCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtd2FsbGV0JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIENyZWF0ZSB3YWxsZXQgbXVsdGkgbW9kYWxcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvbmZpcm0tY3JlYXRlLXdhbGxldC1tdWx0aScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNyZWF0ZU5ld1dhbGxldE11bHRpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1jcmVhdGUtd2FsbGV0LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWNyZWF0ZS13YWxsZXQtbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1uZXctd2FsbGV0LW5pY2tuYW1lJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0xLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0yLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZmljYXRpb24tZXJyb3ItbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLWNyZWF0ZS13YWxsZXQtbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtY3JlYXRlLXdhbGxldC1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LW5ldy13YWxsZXQtbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTEtbXVsdGknKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTItbXVsdGknKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTMtbXVsdGknKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmaWNhdGlvbi1lcnJvci1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBJbXBvcnQgc2VlZCBtdWx0aSBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29uZmlybS1pbXBvcnQtc2VlZC1tdWx0aScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUltcG9ydFNlZWRNdWx0aSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtaW1wb3J0LXNlZWQtbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LXNlZWQtbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtc2VlZC1uaWNrbmFtZScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXNlZWQtcGhyYXNlJykudmFsdWUgPSAnJztcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLWltcG9ydC1zZWVkLW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1zZWVkLW11bHRpJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXNlZWQtbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1zZWVkLXBocmFzZScpLnZhbHVlID0gJyc7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEltcG9ydCBwcml2YXRlIGtleSBtdWx0aSBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29uZmlybS1pbXBvcnQta2V5LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlSW1wb3J0S2V5TXVsdGkpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2FuY2VsLWltcG9ydC1rZXktbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LWtleS1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1rZXktbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1wcml2YXRlLWtleScpLnZhbHVlID0gJyc7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS1pbXBvcnQta2V5LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1rZXktbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQta2V5LW5pY2tuYW1lJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtcHJpdmF0ZS1rZXknKS52YWx1ZSA9ICcnO1xyXG4gIH0pO1xyXG5cclxuICAvLyBSZW5hbWUgd2FsbGV0IG1vZGFsXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb25maXJtLXJlbmFtZS13YWxsZXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVSZW5hbWVXYWxsZXRDb25maXJtKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1yZW5hbWUtd2FsbGV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXJlbmFtZS13YWxsZXQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGN1cnJlbnRSZW5hbWVXYWxsZXRJZCA9IG51bGw7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS1yZW5hbWUtd2FsbGV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXJlbmFtZS13YWxsZXQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGN1cnJlbnRSZW5hbWVXYWxsZXRJZCA9IG51bGw7XHJcbiAgfSk7XHJcblxyXG4gIC8vIFRyYW5zYWN0aW9uIHN1Y2Nlc3MgbW9kYWxcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLXR4LXN1Y2Nlc3MnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtdHgtc3VjY2VzcycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tb2stdHgtc3VjY2VzcycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC10eC1zdWNjZXNzJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LXR4LWhhc2gnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCB0eEhhc2ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc3VjY2Vzcy1oYXNoJykudGV4dENvbnRlbnQ7XHJcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHR4SGFzaCk7XHJcbiAgICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS10eC1oYXNoJyk7XHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGJ0bi50ZXh0Q29udGVudDtcclxuICAgICAgYnRuLnRleHRDb250ZW50ID0gJ0NvcGllZCEnO1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBidG4udGV4dENvbnRlbnQgPSBvcmlnaW5hbFRleHQ7XHJcbiAgICAgIH0sIDIwMDApO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgYWxlcnQoJ0ZhaWxlZCB0byBjb3B5IHRyYW5zYWN0aW9uIGhhc2gnKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gVHJhbnNhY3Rpb24gU3RhdHVzIEJ1dHRvbnMgKGluIGFwcHJvdmFsIHBvcHVwKVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdHgtc3RhdHVzLWV4cGxvcmVyJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgaWYgKCF0eFN0YXR1c0N1cnJlbnRIYXNoKSByZXR1cm47XHJcbiAgICBjb25zdCB1cmwgPSBnZXRFeHBsb3JlclVybChjdXJyZW50U3RhdGUubmV0d29yaywgJ3R4JywgdHhTdGF0dXNDdXJyZW50SGFzaCk7XHJcbiAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmwgfSk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtdHgtc3RhdHVzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ/Cfq4AgQ2xvc2UgYnV0dG9uIGNsaWNrZWQnKTtcclxuICAgIGlmICh0eFN0YXR1c1BvbGxJbnRlcnZhbCkge1xyXG4gICAgICBjbGVhckludGVydmFsKHR4U3RhdHVzUG9sbEludGVydmFsKTtcclxuICAgICAgdHhTdGF0dXNQb2xsSW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgd2luZG93LmNsb3NlKCk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdHgtc3RhdHVzLXNwZWVkLXVwJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKCF0eFN0YXR1c0N1cnJlbnRIYXNoIHx8ICF0eFN0YXR1c0N1cnJlbnRBZGRyZXNzKSByZXR1cm47XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gR2V0IHRyYW5zYWN0aW9uIGRldGFpbHNcclxuICAgICAgY29uc3QgdHhSZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnR0VUX1RYX0JZX0hBU0gnLFxyXG4gICAgICAgIGFkZHJlc3M6IHR4U3RhdHVzQ3VycmVudEFkZHJlc3MsXHJcbiAgICAgICAgdHhIYXNoOiB0eFN0YXR1c0N1cnJlbnRIYXNoXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKCF0eFJlc3BvbnNlLnN1Y2Nlc3MgfHwgIXR4UmVzcG9uc2UudHJhbnNhY3Rpb24pIHtcclxuICAgICAgICBhbGVydCgnQ291bGQgbm90IGxvYWQgdHJhbnNhY3Rpb24gZGV0YWlscycpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgdHggPSB0eFJlc3BvbnNlLnRyYW5zYWN0aW9uO1xyXG5cclxuICAgICAgLy8gU3RvcmUgc3RhdGUgZm9yIG1vZGFsXHJcbiAgICAgIHNwZWVkVXBNb2RhbFN0YXRlLnR4SGFzaCA9IHR4U3RhdHVzQ3VycmVudEhhc2g7XHJcbiAgICAgIHNwZWVkVXBNb2RhbFN0YXRlLmFkZHJlc3MgPSB0eFN0YXR1c0N1cnJlbnRBZGRyZXNzO1xyXG4gICAgICBzcGVlZFVwTW9kYWxTdGF0ZS5uZXR3b3JrID0gdHgubmV0d29yaztcclxuICAgICAgc3BlZWRVcE1vZGFsU3RhdGUub3JpZ2luYWxHYXNQcmljZSA9IHR4Lmdhc1ByaWNlO1xyXG5cclxuICAgICAgLy8gU2hvdyBtb2RhbCBhbmQgbG9hZCBnYXMgcHJpY2VzXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1zcGVlZC11cC10eCcpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICBhd2FpdCByZWZyZXNoR2FzUHJpY2VzKCk7XHJcblxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igb3BlbmluZyBzcGVlZC11cCBtb2RhbDonLCBlcnJvcik7XHJcbiAgICAgIGFsZXJ0KCdFcnJvciBsb2FkaW5nIGdhcyBwcmljZXMnKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi10eC1zdGF0dXMtY2FuY2VsJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKCF0eFN0YXR1c0N1cnJlbnRIYXNoIHx8ICF0eFN0YXR1c0N1cnJlbnRBZGRyZXNzKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ0NhbmNlbCBUcmFuc2FjdGlvbicsICdFbnRlciB5b3VyIHBhc3N3b3JkIHRvIGNhbmNlbCB0aGlzIHRyYW5zYWN0aW9uIGJ5IHNlbmRpbmcgYSAwLXZhbHVlIHJlcGxhY2VtZW50Jyk7XHJcbiAgICBpZiAoIXBhc3N3b3JkKSByZXR1cm47XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICAgIGNvbnN0IHNlc3Npb25SZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnQ1JFQVRFX1NFU1NJT04nLFxyXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcclxuICAgICAgICB3YWxsZXRJZDogYWN0aXZlV2FsbGV0LmlkLFxyXG4gICAgICAgIGR1cmF0aW9uTXM6IDYwMDAwXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKCFzZXNzaW9uUmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgIGFsZXJ0KCdJbnZhbGlkIHBhc3N3b3JkJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnQ0FOQ0VMX1RYJyxcclxuICAgICAgICBhZGRyZXNzOiB0eFN0YXR1c0N1cnJlbnRBZGRyZXNzLFxyXG4gICAgICAgIHR4SGFzaDogdHhTdGF0dXNDdXJyZW50SGFzaCxcclxuICAgICAgICBzZXNzaW9uVG9rZW46IHNlc3Npb25SZXNwb25zZS5zZXNzaW9uVG9rZW5cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgIGFsZXJ0KGBUcmFuc2FjdGlvbiBjYW5jZWxsZWQhXFxuQ2FuY2VsbGF0aW9uIFRYOiAke3Jlc3BvbnNlLnR4SGFzaC5zbGljZSgwLCAyMCl9Li4uXFxuXFxuVGhlIHdpbmRvdyB3aWxsIG5vdyBjbG9zZS5gKTtcclxuICAgICAgICBpZiAodHhTdGF0dXNQb2xsSW50ZXJ2YWwpIHtcclxuICAgICAgICAgIGNsZWFySW50ZXJ2YWwodHhTdGF0dXNQb2xsSW50ZXJ2YWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBhbGVydCgnRXJyb3IgY2FuY2VsbGluZyB0cmFuc2FjdGlvbjogJyArIHNhbml0aXplRXJyb3IocmVzcG9uc2UuZXJyb3IpKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgYWxlcnQoJ0Vycm9yOiAnICsgc2FuaXRpemVFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIC8vIEdsb2JhbCBhY3Rpdml0eSB0cmFja2luZyBmb3IgYXV0by1sb2NrXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZXNldEFjdGl2aXR5VGltZXIpO1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgcmVzZXRBY3Rpdml0eVRpbWVyKTtcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCByZXNldEFjdGl2aXR5VGltZXIpO1xyXG59XHJcblxyXG4vLyA9PT09PSBXQUxMRVQgQ1JFQVRJT04gPT09PT1cclxubGV0IGdlbmVyYXRlZE1uZW1vbmljID0gJyc7XHJcbmxldCB2ZXJpZmljYXRpb25Xb3JkcyA9IFtdOyAvLyBBcnJheSBvZiB7aW5kZXgsIHdvcmR9IGZvciB2ZXJpZmljYXRpb25cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlTmV3TW5lbW9uaWMoKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIEltcG9ydCBldGhlcnMgdG8gZ2VuZXJhdGUgbW5lbW9uaWNcclxuICAgIGNvbnN0IHsgZXRoZXJzIH0gPSBhd2FpdCBpbXBvcnQoJ2V0aGVycycpO1xyXG5cclxuICAgIC8vIEdlbmVyYXRlIGEgcmFuZG9tIHdhbGxldCB0byBnZXQgdGhlIG1uZW1vbmljXHJcbiAgICBjb25zdCByYW5kb21XYWxsZXQgPSBldGhlcnMuV2FsbGV0LmNyZWF0ZVJhbmRvbSgpO1xyXG4gICAgZ2VuZXJhdGVkTW5lbW9uaWMgPSByYW5kb21XYWxsZXQubW5lbW9uaWMucGhyYXNlO1xyXG5cclxuICAgIC8vIERpc3BsYXkgdGhlIG1uZW1vbmljXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW5lbW9uaWMtZGlzcGxheScpLnRleHRDb250ZW50ID0gZ2VuZXJhdGVkTW5lbW9uaWM7XHJcblxyXG4gICAgLy8gU2V0IHVwIHZlcmlmaWNhdGlvbiAoYXNrIGZvciAzIHJhbmRvbSB3b3JkcyB1c2luZyBjcnlwdG9ncmFwaGljYWxseSBzZWN1cmUgcmFuZG9tKVxyXG4gICAgY29uc3Qgd29yZHMgPSBnZW5lcmF0ZWRNbmVtb25pYy5zcGxpdCgnICcpO1xyXG4gICAgY29uc3QgcmFuZG9tQnl0ZXMgPSBuZXcgVWludDhBcnJheSgzKTtcclxuICAgIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMocmFuZG9tQnl0ZXMpO1xyXG4gICAgY29uc3QgaW5kaWNlcyA9IFtcclxuICAgICAgcmFuZG9tQnl0ZXNbMF0gJSA0LCAvLyBXb3JkIDEtNFxyXG4gICAgICA0ICsgKHJhbmRvbUJ5dGVzWzFdICUgNCksIC8vIFdvcmQgNS04XHJcbiAgICAgIDggKyAocmFuZG9tQnl0ZXNbMl0gJSA0KSAvLyBXb3JkIDktMTJcclxuICAgIF07XHJcblxyXG4gICAgdmVyaWZpY2F0aW9uV29yZHMgPSBpbmRpY2VzLm1hcChpID0+ICh7IGluZGV4OiBpLCB3b3JkOiB3b3Jkc1tpXSB9KSk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBVSSB3aXRoIHRoZSByYW5kb20gaW5kaWNlc1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTEtbnVtJykudGV4dENvbnRlbnQgPSAodmVyaWZpY2F0aW9uV29yZHNbMF0uaW5kZXggKyAxKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0yLW51bScpLnRleHRDb250ZW50ID0gKHZlcmlmaWNhdGlvbldvcmRzWzFdLmluZGV4ICsgMSk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMy1udW0nKS50ZXh0Q29udGVudCA9ICh2ZXJpZmljYXRpb25Xb3Jkc1syXS5pbmRleCArIDEpO1xyXG5cclxuICAgIC8vIENsZWFyIHRoZSB2ZXJpZmljYXRpb24gaW5wdXRzXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMicpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMycpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZpY2F0aW9uLWVycm9yJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdlbmVyYXRpbmcgbW5lbW9uaWM6JywgZXJyb3IpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21uZW1vbmljLWRpc3BsYXknKS50ZXh0Q29udGVudCA9ICdFcnJvciBnZW5lcmF0aW5nIG1uZW1vbmljLiBQbGVhc2UgdHJ5IGFnYWluLic7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDcmVhdGVXYWxsZXQoKSB7XHJcbiAgY29uc3QgcGFzc3dvcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtY3JlYXRlJykudmFsdWU7XHJcbiAgY29uc3QgcGFzc3dvcmRDb25maXJtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLWNvbmZpcm0nKS52YWx1ZTtcclxuICBjb25zdCBlcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjcmVhdGUtZXJyb3InKTtcclxuICBjb25zdCB2ZXJpZmljYXRpb25FcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZmljYXRpb24tZXJyb3InKTtcclxuXHJcbiAgLy8gVmFsaWRhdGVcclxuICBpZiAocGFzc3dvcmQgIT09IHBhc3N3b3JkQ29uZmlybSkge1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSAnUGFzc3dvcmRzIGRvIG5vdCBtYXRjaCc7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIEVuc3VyZSB3ZSBoYXZlIGEgbW5lbW9uaWNcclxuICBpZiAoIWdlbmVyYXRlZE1uZW1vbmljKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9ICdObyBtbmVtb25pYyBnZW5lcmF0ZWQuIFBsZWFzZSBnbyBiYWNrIGFuZCB0cnkgYWdhaW4uJztcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gVmVyaWZ5IHNlZWQgcGhyYXNlIHdvcmRzXHJcbiAgY29uc3Qgd29yZDEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMScpLnZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IHdvcmQyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTInKS52YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICBjb25zdCB3b3JkMyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zJykudmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIGlmICghd29yZDEgfHwgIXdvcmQyIHx8ICF3b3JkMykge1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYudGV4dENvbnRlbnQgPSAnUGxlYXNlIGVudGVyIGFsbCB2ZXJpZmljYXRpb24gd29yZHMgdG8gY29uZmlybSB5b3UgaGF2ZSBiYWNrZWQgdXAgeW91ciBzZWVkIHBocmFzZS4nO1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBpZiAod29yZDEgIT09IHZlcmlmaWNhdGlvbldvcmRzWzBdLndvcmQudG9Mb3dlckNhc2UoKSB8fFxyXG4gICAgICB3b3JkMiAhPT0gdmVyaWZpY2F0aW9uV29yZHNbMV0ud29yZC50b0xvd2VyQ2FzZSgpIHx8XHJcbiAgICAgIHdvcmQzICE9PSB2ZXJpZmljYXRpb25Xb3Jkc1syXS53b3JkLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgIHZlcmlmaWNhdGlvbkVycm9yRGl2LnRleHRDb250ZW50ID0gJ1ZlcmlmaWNhdGlvbiB3b3JkcyBkbyBub3QgbWF0Y2guIFBsZWFzZSBkb3VibGUtY2hlY2sgeW91ciBzZWVkIHBocmFzZSBiYWNrdXAuJztcclxuICAgIHZlcmlmaWNhdGlvbkVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgLy8gSW1wb3J0IHdhbGxldCBmcm9tIHRoZSBtbmVtb25pYyB3ZSBhbHJlYWR5IGdlbmVyYXRlZFxyXG4gICAgY29uc3QgeyBhZGRyZXNzIH0gPSBhd2FpdCBpbXBvcnRGcm9tTW5lbW9uaWMoZ2VuZXJhdGVkTW5lbW9uaWMsIHBhc3N3b3JkKTtcclxuXHJcbiAgICAvLyBTdWNjZXNzISBOYXZpZ2F0ZSB0byBkYXNoYm9hcmRcclxuICAgIGFsZXJ0KCdXYWxsZXQgY3JlYXRlZCBzdWNjZXNzZnVsbHkhJyk7XHJcbiAgICBjdXJyZW50U3RhdGUuYWRkcmVzcyA9IGFkZHJlc3M7XHJcbiAgICBjdXJyZW50U3RhdGUuaXNVbmxvY2tlZCA9IHRydWU7XHJcbiAgICBjdXJyZW50U3RhdGUubGFzdEFjdGl2aXR5VGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgLy8gU3RhcnQgYXV0by1sb2NrIHRpbWVyXHJcbiAgICBzdGFydEF1dG9Mb2NrVGltZXIoKTtcclxuXHJcbiAgICAvLyBDbGVhciB0aGUgZ2VuZXJhdGVkIG1uZW1vbmljIGZyb20gbWVtb3J5IGZvciBzZWN1cml0eVxyXG4gICAgZ2VuZXJhdGVkTW5lbW9uaWMgPSAnJztcclxuICAgIHZlcmlmaWNhdGlvbldvcmRzID0gW107XHJcblxyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpO1xyXG4gICAgdXBkYXRlRGFzaGJvYXJkKCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gV0FMTEVUIElNUE9SVCA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVJbXBvcnRXYWxsZXQoKSB7XHJcbiAgY29uc3QgbWV0aG9kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1tZXRob2QnKS52YWx1ZTtcclxuICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1pbXBvcnQnKS52YWx1ZTtcclxuICBjb25zdCBwYXNzd29yZENvbmZpcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtaW1wb3J0LWNvbmZpcm0nKS52YWx1ZTtcclxuICBjb25zdCBlcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbXBvcnQtZXJyb3InKTtcclxuXHJcbiAgLy8gVmFsaWRhdGVcclxuICBpZiAocGFzc3dvcmQgIT09IHBhc3N3b3JkQ29uZmlybSkge1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSAnUGFzc3dvcmRzIGRvIG5vdCBtYXRjaCc7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICBsZXQgYWRkcmVzcztcclxuICAgIGlmIChtZXRob2QgPT09ICdtbmVtb25pYycpIHtcclxuICAgICAgY29uc3QgbW5lbW9uaWMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1wb3J0LW1uZW1vbmljJykudmFsdWU7XHJcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGltcG9ydEZyb21NbmVtb25pYyhtbmVtb25pYywgcGFzc3dvcmQpO1xyXG4gICAgICBhZGRyZXNzID0gcmVzdWx0LmFkZHJlc3M7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBwcml2YXRlS2V5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1wcml2YXRla2V5JykudmFsdWU7XHJcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGltcG9ydEZyb21Qcml2YXRlS2V5KHByaXZhdGVLZXksIHBhc3N3b3JkKTtcclxuICAgICAgYWRkcmVzcyA9IHJlc3VsdC5hZGRyZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFN1Y2Nlc3MhXHJcbiAgICBhbGVydCgnV2FsbGV0IGltcG9ydGVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuICAgIGN1cnJlbnRTdGF0ZS5hZGRyZXNzID0gYWRkcmVzcztcclxuICAgIGN1cnJlbnRTdGF0ZS5pc1VubG9ja2VkID0gdHJ1ZTtcclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKTtcclxuICAgIHVwZGF0ZURhc2hib2FyZCgpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFVOTE9DSyA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVVbmxvY2soKSB7XHJcbiAgY29uc3QgcGFzc3dvcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtdW5sb2NrJykudmFsdWU7XHJcbiAgY29uc3QgZXJyb3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndW5sb2NrLWVycm9yJyk7XHJcblxyXG4gIC8vIENoZWNrIGlmIGxvY2tlZCBvdXQgZHVlIHRvIHRvbyBtYW55IGZhaWxlZCBhdHRlbXB0c1xyXG4gIGNvbnN0IGxvY2tvdXRJbmZvID0gYXdhaXQgY2hlY2tSYXRlTGltaXRMb2Nrb3V0KCk7XHJcbiAgaWYgKGxvY2tvdXRJbmZvLmlzTG9ja2VkT3V0KSB7XHJcbiAgICBjb25zdCByZW1haW5pbmdNaW51dGVzID0gTWF0aC5jZWlsKGxvY2tvdXRJbmZvLnJlbWFpbmluZ01zIC8gMTAwMCAvIDYwKTtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gYFRvbyBtYW55IGZhaWxlZCBhdHRlbXB0cy4gUGxlYXNlIHdhaXQgJHtyZW1haW5pbmdNaW51dGVzfSBtaW51dGUocykgYmVmb3JlIHRyeWluZyBhZ2Fpbi5gO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgLy8gVW5sb2NrIHdhbGxldCB3aXRoIGF1dG8tdXBncmFkZSBub3RpZmljYXRpb25cclxuICAgIGNvbnN0IHsgYWRkcmVzcywgc2lnbmVyLCB1cGdyYWRlZCwgaXRlcmF0aW9uc0JlZm9yZSwgaXRlcmF0aW9uc0FmdGVyIH0gPSBhd2FpdCB1bmxvY2tXYWxsZXQocGFzc3dvcmQsIHtcclxuICAgICAgb25VcGdyYWRlU3RhcnQ6IChpbmZvKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYPCflJAgQXV0by11cGdyYWRpbmcgd2FsbGV0IGVuY3J5cHRpb246ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSBpdGVyYXRpb25zYCk7XHJcbiAgICAgICAgLy8gU2hvdyB2aXN1YWwgZmVlZGJhY2sgaW4gVUlcclxuICAgICAgICBjb25zdCBzdGF0dXNEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBzdGF0dXNEaXYuY2xhc3NOYW1lID0gJ3N0YXR1cy1tZXNzYWdlIGluZm8nO1xyXG4gICAgICAgIHN0YXR1c0Rpdi50ZXh0Q29udGVudCA9IGDwn5SQIFVwZ3JhZGluZyB3YWxsZXQgc2VjdXJpdHkgdG8gJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSBpdGVyYXRpb25zLi4uYDtcclxuICAgICAgICBlcnJvckRpdi5wYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShzdGF0dXNEaXYsIGVycm9yRGl2KTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHN0YXR1c0Rpdi5yZW1vdmUoKSwgMzAwMCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNob3cgdXBncmFkZSBjb21wbGV0aW9uIG1lc3NhZ2UgaWYgd2FsbGV0IHdhcyB1cGdyYWRlZFxyXG4gICAgaWYgKHVwZ3JhZGVkKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGDinIUgV2FsbGV0IHVwZ3JhZGVkOiAke2l0ZXJhdGlvbnNCZWZvcmUudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aXRlcmF0aW9uc0FmdGVyLnRvTG9jYWxlU3RyaW5nKCl9IGl0ZXJhdGlvbnNgKTtcclxuICAgICAgY29uc3Qgc3RhdHVzRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIHN0YXR1c0Rpdi5jbGFzc05hbWUgPSAnc3RhdHVzLW1lc3NhZ2Ugc3VjY2Vzcyc7XHJcbiAgICAgIHN0YXR1c0Rpdi50ZXh0Q29udGVudCA9IGDinIUgU2VjdXJpdHkgdXBncmFkZWQ6ICR7aXRlcmF0aW9uc0JlZm9yZS50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpdGVyYXRpb25zQWZ0ZXIudG9Mb2NhbGVTdHJpbmcoKX0gaXRlcmF0aW9uc2A7XHJcbiAgICAgIGVycm9yRGl2LnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHN0YXR1c0RpdiwgZXJyb3JEaXYpO1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHN0YXR1c0Rpdi5yZW1vdmUoKSwgNTAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3VjY2VzcyEgQ2xlYXIgZmFpbGVkIGF0dGVtcHRzXHJcbiAgICBhd2FpdCBjbGVhckZhaWxlZEF0dGVtcHRzKCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHNlc3Npb24gdG9rZW4gaW4gc2VydmljZSB3b3JrZXJcclxuICAgIGNvbnN0IGFjdGl2ZVdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgY29uc3QgZHVyYXRpb25NcyA9IGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5hdXRvTG9ja01pbnV0ZXMgKiA2MCAqIDEwMDA7XHJcbiAgICBjb25zdCBzZXNzaW9uUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdDUkVBVEVfU0VTU0lPTicsXHJcbiAgICAgIHBhc3N3b3JkLFxyXG4gICAgICB3YWxsZXRJZDogYWN0aXZlV2FsbGV0LmlkLFxyXG4gICAgICBkdXJhdGlvbk1zXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXNlc3Npb25SZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGNyZWF0ZSBzZXNzaW9uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY3VycmVudFN0YXRlLmlzVW5sb2NrZWQgPSB0cnVlO1xyXG4gICAgY3VycmVudFN0YXRlLmFkZHJlc3MgPSBhZGRyZXNzO1xyXG4gICAgY3VycmVudFN0YXRlLnNlc3Npb25Ub2tlbiA9IHNlc3Npb25SZXNwb25zZS5zZXNzaW9uVG9rZW47XHJcbiAgICBjdXJyZW50U3RhdGUubGFzdEFjdGl2aXR5VGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgLy8gU3RhcnQgYXV0by1sb2NrIHRpbWVyXHJcbiAgICBzdGFydEF1dG9Mb2NrVGltZXIoKTtcclxuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJyk7XHJcbiAgICB1cGRhdGVEYXNoYm9hcmQoKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgLy8gUmVjb3JkIGZhaWxlZCBhdHRlbXB0XHJcbiAgICBhd2FpdCByZWNvcmRGYWlsZWRBdHRlbXB0KCk7XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgbm93IGxvY2tlZCBvdXRcclxuICAgIGNvbnN0IG5ld0xvY2tvdXRJbmZvID0gYXdhaXQgY2hlY2tSYXRlTGltaXRMb2Nrb3V0KCk7XHJcbiAgICBpZiAobmV3TG9ja291dEluZm8uaXNMb2NrZWRPdXQpIHtcclxuICAgICAgY29uc3QgcmVtYWluaW5nTWludXRlcyA9IE1hdGguY2VpbChuZXdMb2Nrb3V0SW5mby5yZW1haW5pbmdNcyAvIDEwMDAgLyA2MCk7XHJcbiAgICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gYFRvbyBtYW55IGZhaWxlZCBhdHRlbXB0cyAoJHtNQVhfQVRURU1QVFN9KS4gV2FsbGV0IGxvY2tlZCBmb3IgJHtyZW1haW5pbmdNaW51dGVzfSBtaW51dGVzLmA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBhdHRlbXB0c0xlZnQgPSBNQVhfQVRURU1QVFMgLSBuZXdMb2Nrb3V0SW5mby5hdHRlbXB0cztcclxuICAgICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBgJHtlcnJvci5tZXNzYWdlfSAoJHthdHRlbXB0c0xlZnR9IGF0dGVtcHQke2F0dGVtcHRzTGVmdCAhPT0gMSA/ICdzJyA6ICcnfSByZW1haW5pbmcpYDtcclxuICAgIH1cclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gTE9DSyA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVMb2NrKCkge1xyXG4gIC8vIEludmFsaWRhdGUgc2Vzc2lvbiBpbiBzZXJ2aWNlIHdvcmtlclxyXG4gIGlmIChjdXJyZW50U3RhdGUuc2Vzc2lvblRva2VuKSB7XHJcbiAgICBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdJTlZBTElEQVRFX1NFU1NJT04nLFxyXG4gICAgICBzZXNzaW9uVG9rZW46IGN1cnJlbnRTdGF0ZS5zZXNzaW9uVG9rZW5cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgY3VycmVudFN0YXRlLmlzVW5sb2NrZWQgPSBmYWxzZTtcclxuICBjdXJyZW50U3RhdGUuYWRkcmVzcyA9IG51bGw7XHJcbiAgY3VycmVudFN0YXRlLnNlc3Npb25Ub2tlbiA9IG51bGw7XHJcbiAgY3VycmVudFN0YXRlLmxhc3RBY3Rpdml0eVRpbWUgPSBudWxsO1xyXG4gIHN0b3BBdXRvTG9ja1RpbWVyKCk7XHJcbiAgc2hvd1NjcmVlbignc2NyZWVuLXVubG9jaycpO1xyXG59XHJcblxyXG4vLyA9PT09PSBBVVRPLUxPQ0sgVElNRVIgPT09PT1cclxuZnVuY3Rpb24gc3RhcnRBdXRvTG9ja1RpbWVyKCkge1xyXG4gIHN0b3BBdXRvTG9ja1RpbWVyKCk7IC8vIENsZWFyIGFueSBleGlzdGluZyB0aW1lclxyXG5cclxuICBjb25zdCBjaGVja0ludGVydmFsID0gMTAwMDA7IC8vIENoZWNrIGV2ZXJ5IDEwIHNlY29uZHNcclxuXHJcbiAgYXV0b0xvY2tUaW1lciA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgIGlmICghY3VycmVudFN0YXRlLmlzVW5sb2NrZWQgfHwgIWN1cnJlbnRTdGF0ZS5sYXN0QWN0aXZpdHlUaW1lKSB7XHJcbiAgICAgIHN0b3BBdXRvTG9ja1RpbWVyKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpZGxlVGltZSA9IERhdGUubm93KCkgLSBjdXJyZW50U3RhdGUubGFzdEFjdGl2aXR5VGltZTtcclxuICAgIGNvbnN0IGF1dG9Mb2NrTXMgPSBjdXJyZW50U3RhdGUuc2V0dGluZ3MuYXV0b0xvY2tNaW51dGVzICogNjAgKiAxMDAwO1xyXG5cclxuICAgIGlmIChpZGxlVGltZSA+PSBhdXRvTG9ja01zKSB7XHJcbiAgICAgIC8vIEF1dG8tbG9ja2luZyB3YWxsZXRcclxuICAgICAgaGFuZGxlTG9jaygpO1xyXG4gICAgfVxyXG4gIH0sIGNoZWNrSW50ZXJ2YWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdG9wQXV0b0xvY2tUaW1lcigpIHtcclxuICBpZiAoYXV0b0xvY2tUaW1lcikge1xyXG4gICAgY2xlYXJJbnRlcnZhbChhdXRvTG9ja1RpbWVyKTtcclxuICAgIGF1dG9Mb2NrVGltZXIgPSBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcmVzZXRBY3Rpdml0eVRpbWVyKCkge1xyXG4gIGlmIChjdXJyZW50U3RhdGUuaXNVbmxvY2tlZCkge1xyXG4gICAgY3VycmVudFN0YXRlLmxhc3RBY3Rpdml0eVRpbWUgPSBEYXRlLm5vdygpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gUkFURSBMSU1JVElORyA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiByZWNvcmRGYWlsZWRBdHRlbXB0KCkge1xyXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBsb2FkKFJBVEVfTElNSVRfS0VZKSB8fCB7IGF0dGVtcHRzOiAwLCBmaXJzdEF0dGVtcHRUaW1lOiBEYXRlLm5vdygpIH07XHJcblxyXG4gIC8vIElmIGZpcnN0IGF0dGVtcHQgb3IgYXR0ZW1wdHMgaGF2ZSBleHBpcmVkLCByZXNldFxyXG4gIGNvbnN0IHRpbWVTaW5jZUZpcnN0ID0gRGF0ZS5ub3coKSAtIGRhdGEuZmlyc3RBdHRlbXB0VGltZTtcclxuICBpZiAoZGF0YS5hdHRlbXB0cyA9PT0gMCB8fCB0aW1lU2luY2VGaXJzdCA+IExPQ0tPVVRfRFVSQVRJT05fTVMpIHtcclxuICAgIGRhdGEuYXR0ZW1wdHMgPSAxO1xyXG4gICAgZGF0YS5maXJzdEF0dGVtcHRUaW1lID0gRGF0ZS5ub3coKTtcclxuICB9IGVsc2Uge1xyXG4gICAgZGF0YS5hdHRlbXB0cyArPSAxO1xyXG4gIH1cclxuXHJcbiAgYXdhaXQgc2F2ZShSQVRFX0xJTUlUX0tFWSwgZGF0YSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGNoZWNrUmF0ZUxpbWl0TG9ja291dCgpIHtcclxuICBjb25zdCBkYXRhID0gYXdhaXQgbG9hZChSQVRFX0xJTUlUX0tFWSk7XHJcblxyXG4gIGlmICghZGF0YSB8fCBkYXRhLmF0dGVtcHRzID09PSAwKSB7XHJcbiAgICByZXR1cm4geyBpc0xvY2tlZE91dDogZmFsc2UsIGF0dGVtcHRzOiAwLCByZW1haW5pbmdNczogMCB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgdGltZVNpbmNlRmlyc3QgPSBEYXRlLm5vdygpIC0gZGF0YS5maXJzdEF0dGVtcHRUaW1lO1xyXG5cclxuICAvLyBJZiBsb2Nrb3V0IHBlcmlvZCBoYXMgZXhwaXJlZCwgY2xlYXIgYXR0ZW1wdHNcclxuICBpZiAodGltZVNpbmNlRmlyc3QgPiBMT0NLT1VUX0RVUkFUSU9OX01TKSB7XHJcbiAgICBhd2FpdCBjbGVhckZhaWxlZEF0dGVtcHRzKCk7XHJcbiAgICByZXR1cm4geyBpc0xvY2tlZE91dDogZmFsc2UsIGF0dGVtcHRzOiAwLCByZW1haW5pbmdNczogMCB9O1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgaWYgbG9ja2VkIG91dFxyXG4gIGlmIChkYXRhLmF0dGVtcHRzID49IE1BWF9BVFRFTVBUUykge1xyXG4gICAgY29uc3QgcmVtYWluaW5nTXMgPSBMT0NLT1VUX0RVUkFUSU9OX01TIC0gdGltZVNpbmNlRmlyc3Q7XHJcbiAgICByZXR1cm4geyBpc0xvY2tlZE91dDogdHJ1ZSwgYXR0ZW1wdHM6IGRhdGEuYXR0ZW1wdHMsIHJlbWFpbmluZ01zIH07XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyBpc0xvY2tlZE91dDogZmFsc2UsIGF0dGVtcHRzOiBkYXRhLmF0dGVtcHRzLCByZW1haW5pbmdNczogMCB9O1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBjbGVhckZhaWxlZEF0dGVtcHRzKCkge1xyXG4gIGF3YWl0IHNhdmUoUkFURV9MSU1JVF9LRVksIHsgYXR0ZW1wdHM6IDAsIGZpcnN0QXR0ZW1wdFRpbWU6IDAgfSk7XHJcbn1cclxuXHJcbi8vID09PT09IERBU0hCT0FSRCA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVEYXNoYm9hcmQoKSB7XHJcbiAgLy8gVXBkYXRlIGFkZHJlc3MgZGlzcGxheVxyXG4gIGNvbnN0IGFkZHJlc3NFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3YWxsZXQtYWRkcmVzcycpO1xyXG4gIGlmIChhZGRyZXNzRWwgJiYgY3VycmVudFN0YXRlLmFkZHJlc3MpIHtcclxuICAgIGFkZHJlc3NFbC50ZXh0Q29udGVudCA9IHNob3J0ZW5BZGRyZXNzKGN1cnJlbnRTdGF0ZS5hZGRyZXNzKTtcclxuICB9XHJcblxyXG4gIC8vIEZldGNoIGFuZCB1cGRhdGUgYmFsYW5jZVxyXG4gIGF3YWl0IGZldGNoQmFsYW5jZSgpO1xyXG5cclxuICAvLyBGZXRjaCBhbmQgdXBkYXRlIHRva2VuIHByaWNlcyAoYXN5bmMsIGRvbid0IGJsb2NrIGRhc2hib2FyZCBsb2FkKVxyXG4gIGZldGNoQW5kVXBkYXRlUHJpY2VzKCk7XHJcblxyXG4gIC8vIFVwZGF0ZSBuZXR3b3JrIHNlbGVjdG9yXHJcbiAgdXBkYXRlTmV0d29ya1NlbGVjdG9yKCk7XHJcbiAgdXBkYXRlTmV0d29ya0Rpc3BsYXlzKCk7XHJcblxyXG4gIC8vIFVwZGF0ZSB3YWxsZXQgc2VsZWN0b3JcclxuICBhd2FpdCB1cGRhdGVXYWxsZXRTZWxlY3RvcigpO1xyXG5cclxuICAvLyBVcGRhdGUgcGVuZGluZyB0cmFuc2FjdGlvbiBpbmRpY2F0b3JcclxuICBhd2FpdCB1cGRhdGVQZW5kaW5nVHhJbmRpY2F0b3IoKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlUmVjZW50VHJhbnNhY3Rpb25zKCkge1xyXG4gIGNvbnN0IHR4TGlzdEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWxpc3QnKTtcclxuICBpZiAoIXR4TGlzdEVsIHx8ICFjdXJyZW50U3RhdGUuYWRkcmVzcykgcmV0dXJuO1xyXG5cclxuICAvLyBTaG93IGxvYWRpbmcgc3RhdGVcclxuICB0eExpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPkxvYWRpbmcgdHJhbnNhY3Rpb25zLi4uPC9wPic7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB0cmFuc2FjdGlvbnMgPSBhd2FpdCBycGMuZ2V0UmVjZW50VHJhbnNhY3Rpb25zKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCBjdXJyZW50U3RhdGUuYWRkcmVzcywgMywgMTAwMCk7XHJcblxyXG4gICAgaWYgKHRyYW5zYWN0aW9ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgdHhMaXN0RWwuaW5uZXJIVE1MID0gJzxwIGNsYXNzPVwidGV4dC1jZW50ZXIgdGV4dC1kaW1cIj5ObyByZWNlbnQgdHJhbnNhY3Rpb25zPC9wPic7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgaHRtbCA9ICcnO1xyXG5cclxuICAgIGZvciAoY29uc3QgdHggb2YgdHJhbnNhY3Rpb25zKSB7XHJcbiAgICAgIGNvbnN0IHZhbHVlRXRoID0gZXRoZXJzLmZvcm1hdEV0aGVyKHR4LnZhbHVlKTtcclxuICAgICAgY29uc3QgZm9ybWF0dGVkID0gZm9ybWF0QmFsYW5jZVdpdGhDb21tYXModmFsdWVFdGgsIDE4KTtcclxuICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHR4LnRpbWVzdGFtcCAqIDEwMDApLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG4gICAgICBjb25zdCB0eXBlID0gdHgudHlwZSA9PT0gJ3NlbnQnID8gJ+KGkicgOiAn4oaQJztcclxuICAgICAgY29uc3QgdHlwZUNvbG9yID0gdHgudHlwZSA9PT0gJ3NlbnQnID8gJyNmZjQ0NDQnIDogJyM0NGZmNDQnO1xyXG4gICAgICBjb25zdCBleHBsb3JlclVybCA9IGdldEV4cGxvcmVyVXJsKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCAndHgnLCB0eC5oYXNoKTtcclxuXHJcbiAgICAgIGh0bWwgKz0gYFxyXG4gICAgICAgIDxkaXYgc3R5bGU9XCJwYWRkaW5nOiA4cHg7IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS10ZXJtaW5hbC1ib3JkZXIpOyBmb250LXNpemU6IDExcHg7XCI+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBtYXJnaW4tYm90dG9tOiA0cHg7XCI+XHJcbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiY29sb3I6ICR7dHlwZUNvbG9yfTtcIj4ke3R5cGV9ICR7dHgudHlwZSA9PT0gJ3NlbnQnID8gJ1NlbnQnIDogJ1JlY2VpdmVkJ308L3NwYW4+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC1kaW1cIj4ke2RhdGV9PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBhbGlnbi1pdGVtczogY2VudGVyO1wiPlxyXG4gICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtd2VpZ2h0OiBib2xkO1wiIHRpdGxlPVwiJHtmb3JtYXR0ZWQudG9vbHRpcH1cIj4ke2Zvcm1hdHRlZC5kaXNwbGF5fTwvc3Bhbj5cclxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7ZXhwbG9yZXJVcmx9XCIgdGFyZ2V0PVwiX2JsYW5rXCIgc3R5bGU9XCJjb2xvcjogdmFyKC0tdGVybWluYWwtZ3JlZW4pOyB0ZXh0LWRlY29yYXRpb246IG5vbmU7IGZvbnQtc2l6ZTogMTBweDtcIj5WSUVXIOKGkjwvYT5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICBgO1xyXG4gICAgfVxyXG5cclxuICAgIHR4TGlzdEVsLmlubmVySFRNTCA9IGh0bWw7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHRyYW5zYWN0aW9uczonLCBlcnJvcik7XHJcbiAgICB0eExpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPkVycm9yIGxvYWRpbmcgdHJhbnNhY3Rpb25zPC9wPic7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBVcGRhdGUgd2FsbGV0IHNlbGVjdG9yIGRyb3Bkb3duXHJcbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVdhbGxldFNlbGVjdG9yKCkge1xyXG4gIGNvbnN0IHdhbGxldFNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3YWxsZXQtc2VsZWN0Jyk7XHJcbiAgaWYgKCF3YWxsZXRTZWxlY3QpIHJldHVybjtcclxuXHJcbiAgY29uc3Qgd2FsbGV0c0RhdGEgPSBhd2FpdCBnZXRBbGxXYWxsZXRzKCk7XHJcblxyXG4gIGlmICh3YWxsZXRzRGF0YS53YWxsZXRMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgd2FsbGV0U2VsZWN0LmlubmVySFRNTCA9ICc8b3B0aW9uIHZhbHVlPVwiXCI+Tm8gd2FsbGV0czwvb3B0aW9uPic7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB3YWxsZXRTZWxlY3QuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gIHdhbGxldHNEYXRhLndhbGxldExpc3QuZm9yRWFjaCh3YWxsZXQgPT4ge1xyXG4gICAgY29uc3Qgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XHJcbiAgICBvcHRpb24udmFsdWUgPSB3YWxsZXQuaWQ7XHJcbiAgICBvcHRpb24udGV4dENvbnRlbnQgPSB3YWxsZXQubmlja25hbWUgfHwgJ1VubmFtZWQgV2FsbGV0JztcclxuXHJcbiAgICBpZiAod2FsbGV0LmlkID09PSB3YWxsZXRzRGF0YS5hY3RpdmVXYWxsZXRJZCkge1xyXG4gICAgICBvcHRpb24uc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHdhbGxldFNlbGVjdC5hcHBlbmRDaGlsZChvcHRpb24pO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBVcGRhdGUgbmV0d29yayBkaXNwbGF5cyBhY3Jvc3MgYWxsIHNjcmVlbnNcclxuZnVuY3Rpb24gdXBkYXRlTmV0d29ya0Rpc3BsYXlzKCkge1xyXG4gIGNvbnN0IG5ldHdvcmtOYW1lID0gTkVUV09SS19OQU1FU1tjdXJyZW50U3RhdGUubmV0d29ya10gfHwgJ1Vua25vd24gTmV0d29yayc7XHJcblxyXG4gIC8vIFNldHVwIHNjcmVlbiBzZWxlY3RvclxyXG4gIGNvbnN0IHNldHVwU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmstc2VsZWN0LXNldHVwJyk7XHJcbiAgaWYgKHNldHVwU2VsZWN0KSB7XHJcbiAgICBzZXR1cFNlbGVjdC52YWx1ZSA9IGN1cnJlbnRTdGF0ZS5uZXR3b3JrO1xyXG4gIH1cclxuXHJcbiAgLy8gQ3JlYXRlIHNjcmVlbiBkaXNwbGF5XHJcbiAgY29uc3QgY3JlYXRlRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrLWRpc3BsYXktY3JlYXRlJyk7XHJcbiAgaWYgKGNyZWF0ZURpc3BsYXkpIHtcclxuICAgIGNyZWF0ZURpc3BsYXkudGV4dENvbnRlbnQgPSBuZXR3b3JrTmFtZTtcclxuICB9XHJcblxyXG4gIC8vIEltcG9ydCBzY3JlZW4gZGlzcGxheVxyXG4gIGNvbnN0IGltcG9ydERpc3BsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1kaXNwbGF5LWltcG9ydCcpO1xyXG4gIGlmIChpbXBvcnREaXNwbGF5KSB7XHJcbiAgICBpbXBvcnREaXNwbGF5LnRleHRDb250ZW50ID0gbmV0d29ya05hbWU7XHJcbiAgfVxyXG5cclxuICAvLyBEYXNoYm9hcmQgY3VzdG9tIGRyb3Bkb3duXHJcbiAgY29uc3QgbmV0d29ya1NlbGVjdGVkVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrLXNlbGVjdGVkLXRleHQnKTtcclxuICBpZiAobmV0d29ya1NlbGVjdGVkVGV4dCkge1xyXG4gICAgbmV0d29ya1NlbGVjdGVkVGV4dC50ZXh0Q29udGVudCA9IG5ldHdvcmtOYW1lO1xyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRlIG5ldHdvcmsgc2VsZWN0b3IgbG9nb1xyXG4gIGNvbnN0IHNlbGVjdG9yTG9nb0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmstc2VsZWN0b3ItbG9nbycpO1xyXG4gIGlmIChzZWxlY3RvckxvZ29FbCkge1xyXG4gICAgY29uc3QgbmV0d29ya0xvZ29zID0ge1xyXG4gICAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAncGxzLnBuZycsXHJcbiAgICAgICdwdWxzZWNoYWluJzogJ3Bscy5wbmcnLFxyXG4gICAgICAnZXRoZXJldW0nOiAnZXRoLnBuZycsXHJcbiAgICAgICdzZXBvbGlhJzogJ2V0aC5wbmcnXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGxvZ29GaWxlID0gbmV0d29ya0xvZ29zW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXTtcclxuICAgIGlmIChsb2dvRmlsZSkge1xyXG4gICAgICBzZWxlY3RvckxvZ29FbC5zcmMgPSBjaHJvbWUucnVudGltZS5nZXRVUkwoYGFzc2V0cy9sb2dvcy8ke2xvZ29GaWxlfWApO1xyXG4gICAgICBzZWxlY3RvckxvZ29FbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNlbGVjdG9yTG9nb0VsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBmZXRjaEJhbGFuY2UoKSB7XHJcbiAgaWYgKCFjdXJyZW50U3RhdGUuYWRkcmVzcykge1xyXG4gICAgY3VycmVudFN0YXRlLmJhbGFuY2UgPSAnMCc7XHJcbiAgICB1cGRhdGVCYWxhbmNlRGlzcGxheSgpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBhd2FpdCBycGMuZ2V0QmFsYW5jZShjdXJyZW50U3RhdGUubmV0d29yaywgY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgY3VycmVudFN0YXRlLmJhbGFuY2UgPSBycGMuZm9ybWF0QmFsYW5jZShiYWxhbmNlV2VpLCBjdXJyZW50U3RhdGUuc2V0dGluZ3MuZGVjaW1hbFBsYWNlcyk7XHJcbiAgICB1cGRhdGVCYWxhbmNlRGlzcGxheSgpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBiYWxhbmNlOicsIGVycm9yKTtcclxuICAgIC8vIEtlZXAgcHJldmlvdXMgYmFsYW5jZSBvbiBlcnJvclxyXG4gICAgdXBkYXRlQmFsYW5jZURpc3BsYXkoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXRzIGEgYmFsYW5jZSBzdHJpbmcgd2l0aCBjb21tYXMgYW5kIHJldHVybnMgZGlzcGxheSArIHRvb2x0aXAgdmFsdWVzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYWxhbmNlU3RyaW5nIC0gQmFsYW5jZSBhcyBzdHJpbmcgKGUuZy4sIFwiMTIzNC41Njc4XCIpXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBmdWxsRGVjaW1hbHMgLSBGdWxsIHByZWNpc2lvbiBkZWNpbWFscyAoZGVmYXVsdCAxOClcclxuICogQHJldHVybnMge3tkaXNwbGF5OiBzdHJpbmcsIHRvb2x0aXA6IHN0cmluZ319XHJcbiAqL1xyXG5mdW5jdGlvbiBmb3JtYXRCYWxhbmNlV2l0aENvbW1hcyhiYWxhbmNlU3RyaW5nLCBmdWxsRGVjaW1hbHMgPSAxOCkge1xyXG4gIGNvbnN0IGJhbGFuY2UgPSBwYXJzZUZsb2F0KGJhbGFuY2VTdHJpbmcpO1xyXG4gIGlmIChpc05hTihiYWxhbmNlKSkge1xyXG4gICAgcmV0dXJuIHsgZGlzcGxheTogYmFsYW5jZVN0cmluZywgdG9vbHRpcDogYmFsYW5jZVN0cmluZyB9O1xyXG4gIH1cclxuXHJcbiAgLy8gRGlzcGxheSB2YWx1ZSAoa2VlcCBjdXJyZW50IGRlY2ltYWxzLCBhZGQgY29tbWFzKVxyXG4gIGNvbnN0IHBhcnRzID0gYmFsYW5jZVN0cmluZy5zcGxpdCgnLicpO1xyXG4gIHBhcnRzWzBdID0gcGFydHNbMF0ucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgJywnKTtcclxuICBjb25zdCBkaXNwbGF5VmFsdWUgPSBwYXJ0cy5qb2luKCcuJyk7XHJcblxyXG4gIC8vIEZ1bGwgcHJlY2lzaW9uIHZhbHVlIHdpdGggY29tbWFzXHJcbiAgY29uc3QgZnVsbFByZWNpc2lvbiA9IGJhbGFuY2UudG9GaXhlZChmdWxsRGVjaW1hbHMpO1xyXG4gIGNvbnN0IGZ1bGxQYXJ0cyA9IGZ1bGxQcmVjaXNpb24uc3BsaXQoJy4nKTtcclxuICBmdWxsUGFydHNbMF0gPSBmdWxsUGFydHNbMF0ucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgJywnKTtcclxuICBjb25zdCBmdWxsVmFsdWUgPSBmdWxsUGFydHMuam9pbignLicpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgZGlzcGxheTogZGlzcGxheVZhbHVlLFxyXG4gICAgdG9vbHRpcDogYEZ1bGwgcHJlY2lzaW9uOiAke2Z1bGxWYWx1ZX1gXHJcbiAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlQmFsYW5jZURpc3BsYXkoKSB7XHJcbiAgY29uc3QgYmFsYW5jZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhbGFuY2UtYW1vdW50Jyk7XHJcbiAgaWYgKGJhbGFuY2VFbCkge1xyXG4gICAgY29uc3QgZGVjaW1hbHMgPSBjdXJyZW50U3RhdGUuc2V0dGluZ3MuZGVjaW1hbFBsYWNlcztcclxuICAgIGNvbnN0IGJhbGFuY2UgPSBwYXJzZUZsb2F0KGN1cnJlbnRTdGF0ZS5iYWxhbmNlKTtcclxuXHJcbiAgICAvLyBGb3JtYXQgd2l0aCBjb21tYXMgZm9yIHJlYWRhYmlsaXR5XHJcbiAgICBjb25zdCBmb3JtYXR0ZWQgPSBiYWxhbmNlLnRvRml4ZWQoZGVjaW1hbHMpO1xyXG4gICAgY29uc3QgcGFydHMgPSBmb3JtYXR0ZWQuc3BsaXQoJy4nKTtcclxuICAgIHBhcnRzWzBdID0gcGFydHNbMF0ucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgJywnKTtcclxuICAgIGNvbnN0IGRpc3BsYXlWYWx1ZSA9IHBhcnRzLmpvaW4oJy4nKTtcclxuXHJcbiAgICBiYWxhbmNlRWwudGV4dENvbnRlbnQgPSBkaXNwbGF5VmFsdWU7XHJcblxyXG4gICAgLy8gU2V0IHRvb2x0aXAgd2l0aCBmdWxsIHByZWNpc2lvbiAoMTggZGVjaW1hbHMpIGFuZCBjb21tYXNcclxuICAgIGNvbnN0IGZ1bGxQcmVjaXNpb24gPSBiYWxhbmNlLnRvRml4ZWQoMTgpO1xyXG4gICAgY29uc3QgZnVsbFBhcnRzID0gZnVsbFByZWNpc2lvbi5zcGxpdCgnLicpO1xyXG4gICAgZnVsbFBhcnRzWzBdID0gZnVsbFBhcnRzWzBdLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csICcsJyk7XHJcbiAgICBjb25zdCBmdWxsVmFsdWUgPSBmdWxsUGFydHMuam9pbignLicpO1xyXG4gICAgYmFsYW5jZUVsLnRpdGxlID0gYEZ1bGwgcHJlY2lzaW9uOiAke2Z1bGxWYWx1ZX1gO1xyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRlIGJhbGFuY2Ugc3ltYm9sIGJhc2VkIG9uIG5ldHdvcmtcclxuICBjb25zdCBzeW1ib2xFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWxhbmNlLXN5bWJvbCcpO1xyXG4gIGlmIChzeW1ib2xFbCkge1xyXG4gICAgY29uc3Qgc3ltYm9scyA9IHtcclxuICAgICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3RQTFMnLFxyXG4gICAgICAncHVsc2VjaGFpbic6ICdQTFMnLFxyXG4gICAgICAnZXRoZXJldW0nOiAnRVRIJyxcclxuICAgICAgJ3NlcG9saWEnOiAnU0VQJ1xyXG4gICAgfTtcclxuICAgIHN5bWJvbEVsLnRleHRDb250ZW50ID0gc3ltYm9sc1tjdXJyZW50U3RhdGUubmV0d29ya10gfHwgJ1RPS0VOJztcclxuICB9XHJcblxyXG4gIC8vIFVwZGF0ZSBVU0QgdmFsdWUgaWYgcHJpY2VzIGFyZSBhdmFpbGFibGVcclxuICBjb25zdCB1c2RFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWxhbmNlLXVzZCcpO1xyXG4gIGlmICh1c2RFbCAmJiBjdXJyZW50U3RhdGUudG9rZW5QcmljZXMpIHtcclxuICAgIGNvbnN0IHRva2VuU3ltYm9sID0gY3VycmVudFN0YXRlLm5ldHdvcmsgPT09ICdwdWxzZWNoYWluVGVzdG5ldCcgPyAnUExTJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0YXRlLm5ldHdvcmsgPT09ICdwdWxzZWNoYWluJyA/ICdQTFMnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUubmV0d29yayA9PT0gJ2V0aGVyZXVtJyA/ICdFVEgnIDogJ1BMUyc7XHJcblxyXG4gICAgLy8gQ29udmVydCBiYWxhbmNlIHRvIHdlaSAoc3RyaW5nIHdpdGggMTggZGVjaW1hbHMpXHJcbiAgICBjb25zdCBiYWxhbmNlV2VpID0gZXRoZXJzLnBhcnNlRXRoZXIoY3VycmVudFN0YXRlLmJhbGFuY2UudG9TdHJpbmcoKSkudG9TdHJpbmcoKTtcclxuICAgIGNvbnN0IHVzZFZhbHVlID0gZ2V0VG9rZW5WYWx1ZVVTRCh0b2tlblN5bWJvbCwgYmFsYW5jZVdlaSwgMTgsIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcyk7XHJcblxyXG4gICAgaWYgKHVzZFZhbHVlICE9PSBudWxsKSB7XHJcbiAgICAgIHVzZEVsLnRleHRDb250ZW50ID0gZm9ybWF0VVNEKHVzZFZhbHVlKTtcclxuICAgICAgdXNkRWwuc3R5bGUuY29sb3IgPSAndmFyKC0tdGVybWluYWwtZmctZGltKSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB1c2RFbC50ZXh0Q29udGVudCA9ICfigJQnO1xyXG4gICAgICB1c2RFbC5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1mZy1kaW0pJztcclxuICAgIH1cclxuICB9IGVsc2UgaWYgKHVzZEVsKSB7XHJcbiAgICB1c2RFbC50ZXh0Q29udGVudCA9ICfigJQnO1xyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRlIG5ldHdvcmsgbG9nb1xyXG4gIGNvbnN0IGxvZ29FbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrLWxvZ28nKTtcclxuICBpZiAobG9nb0VsKSB7XHJcbiAgICBjb25zdCBuZXR3b3JrTG9nb3MgPSB7XHJcbiAgICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICdwbHMucG5nJyxcclxuICAgICAgJ3B1bHNlY2hhaW4nOiAncGxzLnBuZycsXHJcbiAgICAgICdldGhlcmV1bSc6ICdldGgucG5nJyxcclxuICAgICAgJ3NlcG9saWEnOiAnZXRoLnBuZydcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgbG9nb0ZpbGUgPSBuZXR3b3JrTG9nb3NbY3VycmVudFN0YXRlLm5ldHdvcmtdO1xyXG4gICAgaWYgKGxvZ29GaWxlKSB7XHJcbiAgICAgIGxvZ29FbC5zcmMgPSBjaHJvbWUucnVudGltZS5nZXRVUkwoYGFzc2V0cy9sb2dvcy8ke2xvZ29GaWxlfWApO1xyXG4gICAgICBsb2dvRWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsb2dvRWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGZXRjaCB0b2tlbiBwcmljZXMgZnJvbSBQdWxzZVggYW5kIHVwZGF0ZSBkaXNwbGF5XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBmZXRjaEFuZFVwZGF0ZVByaWNlcygpIHtcclxuICAvLyBPbmx5IGZldGNoIHByaWNlcyBmb3IgUHVsc2VDaGFpbiBuZXR3b3Jrc1xyXG4gIGlmIChjdXJyZW50U3RhdGUubmV0d29yayAhPT0gJ3B1bHNlY2hhaW4nICYmIGN1cnJlbnRTdGF0ZS5uZXR3b3JrICE9PSAncHVsc2VjaGFpblRlc3RuZXQnKSB7XHJcbiAgICBjb25zb2xlLmxvZygn8J+rgCBQcmljZSBmZXRjaGluZyBub3Qgc3VwcG9ydGVkIGZvcicsIGN1cnJlbnRTdGF0ZS5uZXR3b3JrKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIFNob3cgbG9hZGluZyBpbmRpY2F0b3JcclxuICBjb25zdCBsb2FkaW5nRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJpY2UtbG9hZGluZycpO1xyXG4gIGNvbnN0IHVzZEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhbGFuY2UtdXNkJyk7XHJcbiAgaWYgKGxvYWRpbmdFbCAmJiB1c2RFbCkge1xyXG4gICAgdXNkRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBsb2FkaW5nRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIoY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG4gICAgY29uc3QgcHJpY2VzID0gYXdhaXQgZmV0Y2hUb2tlblByaWNlcyhwcm92aWRlciwgY3VycmVudFN0YXRlLm5ldHdvcmsgPT09ICdwdWxzZWNoYWluVGVzdG5ldCcgPyAncHVsc2VjaGFpbicgOiBjdXJyZW50U3RhdGUubmV0d29yayk7XHJcblxyXG4gICAgaWYgKHByaWNlcykge1xyXG4gICAgICBjdXJyZW50U3RhdGUudG9rZW5QcmljZXMgPSBwcmljZXM7XHJcbiAgICAgIHVwZGF0ZUJhbGFuY2VEaXNwbGF5KCk7IC8vIFJlZnJlc2ggZGlzcGxheSB3aXRoIFVTRCB2YWx1ZXNcclxuICAgICAgLy8gUHJpY2VzIHVwZGF0ZWRcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdG9rZW4gcHJpY2VzOicsIGVycm9yKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgLy8gSGlkZSBsb2FkaW5nIGluZGljYXRvclxyXG4gICAgaWYgKGxvYWRpbmdFbCAmJiB1c2RFbCkge1xyXG4gICAgICBsb2FkaW5nRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgIHVzZEVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlTmV0d29ya1NlbGVjdG9yKCkge1xyXG4gIC8vIElmIHRlc3QgbmV0d29ya3MgYXJlIGhpZGRlbiwgaGlkZSB0ZXN0bmV0IG9wdGlvbnMgaW4gY3VzdG9tIGRyb3Bkb3duXHJcbiAgY29uc3Qgb3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5uZXR3b3JrLW9wdGlvbicpO1xyXG4gIG9wdGlvbnMuZm9yRWFjaChvcHRpb24gPT4ge1xyXG4gICAgY29uc3QgbmV0d29yayA9IG9wdGlvbi5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmV0d29yaycpO1xyXG4gICAgY29uc3QgaXNUZXN0bmV0ID0gbmV0d29yay5pbmNsdWRlcygnVGVzdG5ldCcpIHx8IG5ldHdvcmsgPT09ICdzZXBvbGlhJztcclxuICAgIGlmIChpc1Rlc3RuZXQgJiYgIWN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5zaG93VGVzdE5ldHdvcmtzKSB7XHJcbiAgICAgIG9wdGlvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb3B0aW9uLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vID09PT09IFNFTkQgPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gc2hvd1NlbmRTY3JlZW4oKSB7XHJcbiAgLy8gUG9wdWxhdGUgc2VuZCBzY3JlZW4gd2l0aCBjdXJyZW50IHdhbGxldCBpbmZvXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtZnJvbS1hZGRyZXNzJykudGV4dENvbnRlbnQgPSBjdXJyZW50U3RhdGUuYWRkcmVzcyB8fCAnMHgwMDAwLi4uMDAwMCc7XHJcblxyXG4gIC8vIFBvcHVsYXRlIGFzc2V0IHNlbGVjdG9yIHdpdGggbmF0aXZlICsgdG9rZW5zXHJcbiAgY29uc3QgYXNzZXRTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hc3NldC1zZWxlY3QnKTtcclxuICBjb25zdCBzeW1ib2xzID0ge1xyXG4gICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3RQTFMnLFxyXG4gICAgJ3B1bHNlY2hhaW4nOiAnUExTJyxcclxuICAgICdldGhlcmV1bSc6ICdFVEgnLFxyXG4gICAgJ3NlcG9saWEnOiAnU0VQJ1xyXG4gIH07XHJcblxyXG4gIGxldCBvcHRpb25zID0gYDxvcHRpb24gdmFsdWU9XCJuYXRpdmVcIj5OYXRpdmUgKCR7c3ltYm9sc1tjdXJyZW50U3RhdGUubmV0d29ya10gfHwgJ1RPS0VOJ30pPC9vcHRpb24+YDtcclxuXHJcbiAgY29uc3QgYWxsVG9rZW5zID0gYXdhaXQgdG9rZW5zLmdldEFsbFRva2VucyhjdXJyZW50U3RhdGUubmV0d29yayk7XHJcbiAgZm9yIChjb25zdCB0b2tlbiBvZiBhbGxUb2tlbnMpIHtcclxuICAgIG9wdGlvbnMgKz0gYDxvcHRpb24gdmFsdWU9XCIke2VzY2FwZUh0bWwodG9rZW4uYWRkcmVzcyl9XCI+JHtlc2NhcGVIdG1sKHRva2VuLnN5bWJvbCl9PC9vcHRpb24+YDtcclxuICB9XHJcblxyXG4gIGFzc2V0U2VsZWN0LmlubmVySFRNTCA9IG9wdGlvbnM7XHJcblxyXG4gIC8vIFNldCBpbml0aWFsIGJhbGFuY2Ugd2l0aCBmb3JtYXR0aW5nXHJcbiAgY29uc3QgYmFsYW5jZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYXZhaWxhYmxlLWJhbGFuY2UnKTtcclxuICBjb25zdCBmb3JtYXR0ZWQgPSBmb3JtYXRCYWxhbmNlV2l0aENvbW1hcyhjdXJyZW50U3RhdGUuYmFsYW5jZSwgMTgpO1xyXG4gIGJhbGFuY2VFbC50ZXh0Q29udGVudCA9IGZvcm1hdHRlZC5kaXNwbGF5O1xyXG4gIGJhbGFuY2VFbC50aXRsZSA9IGZvcm1hdHRlZC50b29sdGlwO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWJhbGFuY2Utc3ltYm9sJykudGV4dENvbnRlbnQgPSBzeW1ib2xzW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXSB8fCAnVE9LRU4nO1xyXG5cclxuICAvLyBDbGVhciBmb3JtXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtdG8tYWRkcmVzcycpLnZhbHVlID0gJyc7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYW1vdW50JykudmFsdWUgPSAnJztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1wYXNzd29yZCcpLnZhbHVlID0gJyc7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtZXJyb3InKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gU2hvdyBmb3JtIGFuZCBoaWRlIHN0YXR1cyBzZWN0aW9uIChyZXNldCBzdGF0ZSlcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1mb3JtJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtc3RhdHVzLXNlY3Rpb24nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgc2hvd1NjcmVlbignc2NyZWVuLXNlbmQnKTtcclxuXHJcbiAgLy8gUG9wdWxhdGUgZ2FzIHByaWNlcyBhbmQgbm9uY2VcclxuICBjb25zdCBzeW1ib2wgPSBzeW1ib2xzW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXSB8fCAnVE9LRU4nO1xyXG4gIGNvbnN0IHR4UmVxdWVzdCA9IHtcclxuICAgIGZyb206IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLFxyXG4gICAgdG86IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLCAvLyBEdW1teSBmb3IgZXN0aW1hdGlvblxyXG4gICAgdmFsdWU6ICcweDAnXHJcbiAgfTtcclxuICBhd2FpdCBwb3B1bGF0ZVNlbmRHYXNQcmljZXMoY3VycmVudFN0YXRlLm5ldHdvcmssIHR4UmVxdWVzdCwgc3ltYm9sKTtcclxuXHJcbiAgLy8gRmV0Y2ggYW5kIGRpc3BsYXkgbm9uY2VcclxuICB0cnkge1xyXG4gICAgY29uc3Qgbm9uY2VIZXggPSBhd2FpdCBycGMuZ2V0VHJhbnNhY3Rpb25Db3VudChjdXJyZW50U3RhdGUubmV0d29yaywgY3VycmVudFN0YXRlLmFkZHJlc3MsICdwZW5kaW5nJyk7XHJcbiAgICBjb25zdCBub25jZSA9IHBhcnNlSW50KG5vbmNlSGV4LCAxNik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXJyZW50LW5vbmNlJykudGV4dENvbnRlbnQgPSBub25jZTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgbm9uY2U6JywgZXJyb3IpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtY3VycmVudC1ub25jZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICB9XHJcblxyXG4gIC8vIFNldHVwIGN1c3RvbSBub25jZSBjaGVja2JveFxyXG4gIGNvbnN0IGN1c3RvbU5vbmNlQ2hlY2tib3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXN0b20tbm9uY2UtY2hlY2tib3gnKTtcclxuICBjb25zdCBjdXN0b21Ob25jZUNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWN1c3RvbS1ub25jZS1pbnB1dC1jb250YWluZXInKTtcclxuICBjdXN0b21Ob25jZUNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcclxuICBjdXN0b21Ob25jZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gUmVtb3ZlIG9sZCBsaXN0ZW5lciBpZiBleGlzdHMgYW5kIGFkZCBuZXcgb25lXHJcbiAgY29uc3QgbmV3Q2hlY2tib3ggPSBjdXN0b21Ob25jZUNoZWNrYm94LmNsb25lTm9kZSh0cnVlKTtcclxuICBjdXN0b21Ob25jZUNoZWNrYm94LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld0NoZWNrYm94LCBjdXN0b21Ob25jZUNoZWNrYm94KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtY3VzdG9tLW5vbmNlLWNoZWNrYm94JykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgIGlmIChlLnRhcmdldC5jaGVja2VkKSB7XHJcbiAgICAgIGN1c3RvbU5vbmNlQ29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICBjb25zdCBjdXJyZW50Tm9uY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXJyZW50LW5vbmNlJykudGV4dENvbnRlbnQ7XHJcbiAgICAgIGlmIChjdXJyZW50Tm9uY2UgIT09ICctLScgJiYgY3VycmVudE5vbmNlICE9PSAnRXJyb3InKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtY3VzdG9tLW5vbmNlJykudmFsdWUgPSBjdXJyZW50Tm9uY2U7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGN1c3RvbU5vbmNlQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVBc3NldENoYW5nZSgpIHtcclxuICBjb25zdCBhc3NldFNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWFzc2V0LXNlbGVjdCcpO1xyXG4gIGNvbnN0IHNlbGVjdGVkVmFsdWUgPSBhc3NldFNlbGVjdC52YWx1ZTtcclxuXHJcbiAgY29uc3Qgc3ltYm9scyA9IHtcclxuICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICd0UExTJyxcclxuICAgICdwdWxzZWNoYWluJzogJ1BMUycsXHJcbiAgICAnZXRoZXJldW0nOiAnRVRIJyxcclxuICAgICdzZXBvbGlhJzogJ1NFUCdcclxuICB9O1xyXG5cclxuICBjb25zdCBiYWxhbmNlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hdmFpbGFibGUtYmFsYW5jZScpO1xyXG5cclxuICBpZiAoc2VsZWN0ZWRWYWx1ZSA9PT0gJ25hdGl2ZScpIHtcclxuICAgIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdEJhbGFuY2VXaXRoQ29tbWFzKGN1cnJlbnRTdGF0ZS5iYWxhbmNlLCAxOCk7XHJcbiAgICBiYWxhbmNlRWwudGV4dENvbnRlbnQgPSBmb3JtYXR0ZWQuZGlzcGxheTtcclxuICAgIGJhbGFuY2VFbC50aXRsZSA9IGZvcm1hdHRlZC50b29sdGlwO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYmFsYW5jZS1zeW1ib2wnKS50ZXh0Q29udGVudCA9IHN5bWJvbHNbY3VycmVudFN0YXRlLm5ldHdvcmtdIHx8ICdUT0tFTic7XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIEdldCB0b2tlbiBiYWxhbmNlXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBhbGxUb2tlbnMgPSBhd2FpdCB0b2tlbnMuZ2V0QWxsVG9rZW5zKGN1cnJlbnRTdGF0ZS5uZXR3b3JrKTtcclxuICAgICAgY29uc3QgdG9rZW4gPSBhbGxUb2tlbnMuZmluZCh0ID0+IHQuYWRkcmVzcyA9PT0gc2VsZWN0ZWRWYWx1ZSk7XHJcblxyXG4gICAgICBpZiAodG9rZW4pIHtcclxuICAgICAgICBjb25zdCBiYWxhbmNlV2VpID0gYXdhaXQgZXJjMjAuZ2V0VG9rZW5CYWxhbmNlKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCB0b2tlbi5hZGRyZXNzLCBjdXJyZW50U3RhdGUuYWRkcmVzcyk7XHJcbiAgICAgICAgY29uc3QgcmF3QmFsYW5jZSA9IGVyYzIwLmZvcm1hdFRva2VuQmFsYW5jZShiYWxhbmNlV2VpLCB0b2tlbi5kZWNpbWFscywgNCk7XHJcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkID0gZm9ybWF0QmFsYW5jZVdpdGhDb21tYXMocmF3QmFsYW5jZSwgdG9rZW4uZGVjaW1hbHMpO1xyXG4gICAgICAgIGJhbGFuY2VFbC50ZXh0Q29udGVudCA9IGZvcm1hdHRlZC5kaXNwbGF5O1xyXG4gICAgICAgIGJhbGFuY2VFbC50aXRsZSA9IGZvcm1hdHRlZC50b29sdGlwO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWJhbGFuY2Utc3ltYm9sJykudGV4dENvbnRlbnQgPSB0b2tlbi5zeW1ib2w7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHRva2VuIGJhbGFuY2U6JywgZXJyb3IpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlU2VuZE1heCgpIHtcclxuICAvLyBTZXQgYW1vdW50IHRvIGF2YWlsYWJsZSBiYWxhbmNlIChtaW51cyBlc3RpbWF0ZWQgZ2FzKVxyXG4gIC8vIEZvciBzaW1wbGljaXR5LCB3ZSdsbCBqdXN0IHNldCB0byBjdXJyZW50IGJhbGFuY2VcclxuICAvLyBVc2VyIHNob3VsZCBsZWF2ZSBzb21lIGZvciBnYXNcclxuICBjb25zdCBiYWxhbmNlID0gcGFyc2VGbG9hdChjdXJyZW50U3RhdGUuYmFsYW5jZSk7XHJcbiAgaWYgKGJhbGFuY2UgPiAwKSB7XHJcbiAgICAvLyBMZWF2ZSBhIGJpdCBmb3IgZ2FzIChyb3VnaCBlc3RpbWF0ZTogMC4wMDEgZm9yIHNpbXBsZSB0cmFuc2ZlcilcclxuICAgIGNvbnN0IG1heFNlbmQgPSBNYXRoLm1heCgwLCBiYWxhbmNlIC0gMC4wMDEpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYW1vdW50JykudmFsdWUgPSBtYXhTZW5kLnRvU3RyaW5nKCk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZW5kVHJhbnNhY3Rpb24oKSB7XHJcbiAgY29uc3QgdG9BZGRyZXNzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtdG8tYWRkcmVzcycpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCBhbW91bnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hbW91bnQnKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgcGFzc3dvcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1wYXNzd29yZCcpLnZhbHVlO1xyXG4gIGNvbnN0IGFzc2V0U2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYXNzZXQtc2VsZWN0Jyk7XHJcbiAgY29uc3Qgc2VsZWN0ZWRBc3NldCA9IGFzc2V0U2VsZWN0LnZhbHVlO1xyXG4gIGNvbnN0IGVycm9yRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1lcnJvcicpO1xyXG5cclxuICBjb25zdCBzeW1ib2xzID0ge1xyXG4gICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3RQTFMnLFxyXG4gICAgJ3B1bHNlY2hhaW4nOiAnUExTJyxcclxuICAgICdldGhlcmV1bSc6ICdFVEgnLFxyXG4gICAgJ3NlcG9saWEnOiAnU0VQJ1xyXG4gIH07XHJcblxyXG4gIC8vIFZhbGlkYXRlIGlucHV0c1xyXG4gIGlmICghdG9BZGRyZXNzIHx8ICFhbW91bnQgfHwgIXBhc3N3b3JkKSB7XHJcbiAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ1BsZWFzZSBmaWxsIGluIGFsbCBmaWVsZHMnO1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIGFkZHJlc3MgZm9ybWF0XHJcbiAgaWYgKCF0b0FkZHJlc3MubWF0Y2goL14weFthLWZBLUYwLTldezQwfSQvKSkge1xyXG4gICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdJbnZhbGlkIHJlY2lwaWVudCBhZGRyZXNzJztcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSBhbW91bnRcclxuICBjb25zdCBhbW91bnROdW0gPSBwYXJzZUZsb2F0KGFtb3VudCk7XHJcbiAgaWYgKGlzTmFOKGFtb3VudE51bSkgfHwgYW1vdW50TnVtIDw9IDApIHtcclxuICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSAnSW52YWxpZCBhbW91bnQnO1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgIC8vIERpc2FibGUgc2VuZCBidXR0b24gdG8gcHJldmVudCBkb3VibGUtY2xpY2tpbmdcclxuICAgIGNvbnN0IHNlbmRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvbmZpcm0tc2VuZCcpO1xyXG4gICAgc2VuZEJ0bi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICBzZW5kQnRuLnN0eWxlLm9wYWNpdHkgPSAnMC41JztcclxuICAgIHNlbmRCdG4uc3R5bGUuY3Vyc29yID0gJ25vdC1hbGxvd2VkJztcclxuXHJcbiAgICAvLyBVbmxvY2sgd2FsbGV0IHdpdGggcGFzc3dvcmQgYW5kIGF1dG8tdXBncmFkZSBpZiBuZWVkZWRcclxuICAgIGNvbnN0IHsgc2lnbmVyLCB1cGdyYWRlZCwgaXRlcmF0aW9uc0JlZm9yZSwgaXRlcmF0aW9uc0FmdGVyIH0gPSBhd2FpdCB1bmxvY2tXYWxsZXQocGFzc3dvcmQsIHtcclxuICAgICAgb25VcGdyYWRlU3RhcnQ6IChpbmZvKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYPCflJAgQXV0by11cGdyYWRpbmcgd2FsbGV0OiAke2luZm8uY3VycmVudEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aW5mby5yZWNvbW1lbmRlZEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX1gKTtcclxuICAgICAgICBjb25zdCBzdGF0dXNEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBzdGF0dXNEaXYuY2xhc3NOYW1lID0gJ3N0YXR1cy1tZXNzYWdlIGluZm8nO1xyXG4gICAgICAgIHN0YXR1c0Rpdi50ZXh0Q29udGVudCA9ICfwn5SQIFVwZ3JhZGluZyB3YWxsZXQgc2VjdXJpdHkuLi4nO1xyXG4gICAgICAgIGVycm9yRWwucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoc3RhdHVzRGl2LCBlcnJvckVsKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHN0YXR1c0Rpdi5yZW1vdmUoKSwgMzAwMCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGlmICh1cGdyYWRlZCkge1xyXG4gICAgICBjb25zb2xlLmxvZyhg4pyFIFdhbGxldCB1cGdyYWRlZDogJHtpdGVyYXRpb25zQmVmb3JlLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2l0ZXJhdGlvbnNBZnRlci50b0xvY2FsZVN0cmluZygpfWApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCBzZWxlY3RlZCBnYXMgcHJpY2VcclxuICAgIGNvbnN0IGdhc1ByaWNlID0gZ2V0U2VsZWN0ZWRTZW5kR2FzUHJpY2UoKTtcclxuXHJcbiAgICAvLyBHZXQgY3VzdG9tIG5vbmNlIGlmIHByb3ZpZGVkXHJcbiAgICBjb25zdCBjdXN0b21Ob25jZUNoZWNrYm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtY3VzdG9tLW5vbmNlLWNoZWNrYm94Jyk7XHJcbiAgICBjb25zdCBjdXN0b21Ob25jZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtY3VzdG9tLW5vbmNlJyk7XHJcbiAgICBsZXQgY3VzdG9tTm9uY2UgPSBudWxsO1xyXG4gICAgaWYgKGN1c3RvbU5vbmNlQ2hlY2tib3guY2hlY2tlZCAmJiBjdXN0b21Ob25jZUlucHV0LnZhbHVlKSB7XHJcbiAgICAgIGN1c3RvbU5vbmNlID0gcGFyc2VJbnQoY3VzdG9tTm9uY2VJbnB1dC52YWx1ZSk7XHJcbiAgICAgIGlmIChpc05hTihjdXN0b21Ob25jZSkgfHwgY3VzdG9tTm9uY2UgPCAwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGN1c3RvbSBub25jZScpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IHByb3ZpZGVyIHdpdGggYXV0b21hdGljIGZhaWxvdmVyIGFuZCBjb25uZWN0IHNpZ25lclxyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIoY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG4gICAgY29uc3QgY29ubmVjdGVkU2lnbmVyID0gc2lnbmVyLmNvbm5lY3QocHJvdmlkZXIpO1xyXG5cclxuICAgIGxldCB0eFJlc3BvbnNlLCBzeW1ib2w7XHJcblxyXG4gICAgaWYgKHNlbGVjdGVkQXNzZXQgPT09ICduYXRpdmUnKSB7XHJcbiAgICAgIC8vIFNlbmQgbmF0aXZlIGN1cnJlbmN5XHJcbiAgICAgIGNvbnN0IHR4ID0ge1xyXG4gICAgICAgIHRvOiB0b0FkZHJlc3MsXHJcbiAgICAgICAgdmFsdWU6IGV0aGVycy5wYXJzZUV0aGVyKGFtb3VudClcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIEFkZCBnYXMgcHJpY2UgaWYgc2VsZWN0ZWRcclxuICAgICAgaWYgKGdhc1ByaWNlKSB7XHJcbiAgICAgICAgdHguZ2FzUHJpY2UgPSBnYXNQcmljZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQWRkIGN1c3RvbSBub25jZSBpZiBwcm92aWRlZFxyXG4gICAgICBpZiAoY3VzdG9tTm9uY2UgIT09IG51bGwpIHtcclxuICAgICAgICB0eC5ub25jZSA9IGN1c3RvbU5vbmNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0eFJlc3BvbnNlID0gYXdhaXQgY29ubmVjdGVkU2lnbmVyLnNlbmRUcmFuc2FjdGlvbih0eCk7XHJcbiAgICAgIHN5bWJvbCA9IHN5bWJvbHNbY3VycmVudFN0YXRlLm5ldHdvcmtdIHx8ICd0b2tlbnMnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gU2VuZCB0b2tlblxyXG4gICAgICBjb25zdCBhbGxUb2tlbnMgPSBhd2FpdCB0b2tlbnMuZ2V0QWxsVG9rZW5zKGN1cnJlbnRTdGF0ZS5uZXR3b3JrKTtcclxuICAgICAgY29uc3QgdG9rZW4gPSBhbGxUb2tlbnMuZmluZCh0ID0+IHQuYWRkcmVzcyA9PT0gc2VsZWN0ZWRBc3NldCk7XHJcblxyXG4gICAgICBpZiAoIXRva2VuKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUb2tlbiBub3QgZm91bmQnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgYW1vdW50V2VpID0gZXJjMjAucGFyc2VUb2tlbkFtb3VudChhbW91bnQsIHRva2VuLmRlY2ltYWxzKTtcclxuXHJcbiAgICAgIC8vIEZvciB0b2tlbiB0cmFuc2ZlcnMsIHdlIG5lZWQgdG8gcGFzcyBnYXMgb3B0aW9ucyB0byB0aGUgdHJhbnNmZXIgZnVuY3Rpb25cclxuICAgICAgY29uc3QgdHhPcHRpb25zID0ge307XHJcbiAgICAgIGlmIChnYXNQcmljZSkge1xyXG4gICAgICAgIHR4T3B0aW9ucy5nYXNQcmljZSA9IGdhc1ByaWNlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChjdXN0b21Ob25jZSAhPT0gbnVsbCkge1xyXG4gICAgICAgIHR4T3B0aW9ucy5ub25jZSA9IGN1c3RvbU5vbmNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBOb3RlOiBUaGlzIHJlcXVpcmVzIHVwZGF0aW5nIGVyYzIwLnRyYW5zZmVyVG9rZW4gdG8gYWNjZXB0IG9wdGlvbnNcclxuICAgICAgLy8gRm9yIG5vdywgd2UnbGwgc2VuZCB0aGUgdHJhbnNhY3Rpb24gbWFudWFsbHlcclxuICAgICAgY29uc3QgdG9rZW5Db250cmFjdCA9IG5ldyBldGhlcnMuQ29udHJhY3QoXHJcbiAgICAgICAgdG9rZW4uYWRkcmVzcyxcclxuICAgICAgICBbJ2Z1bmN0aW9uIHRyYW5zZmVyKGFkZHJlc3MgdG8sIHVpbnQyNTYgYW1vdW50KSByZXR1cm5zIChib29sKSddLFxyXG4gICAgICAgIGNvbm5lY3RlZFNpZ25lclxyXG4gICAgICApO1xyXG5cclxuICAgICAgdHhSZXNwb25zZSA9IGF3YWl0IHRva2VuQ29udHJhY3QudHJhbnNmZXIodG9BZGRyZXNzLCBhbW91bnRXZWksIHR4T3B0aW9ucyk7XHJcbiAgICAgIHN5bWJvbCA9IHRva2VuLnN5bWJvbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTYXZlIHRyYW5zYWN0aW9uIHRvIGhpc3RvcnkgYW5kIHN0YXJ0IG1vbml0b3JpbmdcclxuICAgIGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ1NBVkVfQU5EX01PTklUT1JfVFgnLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzcyxcclxuICAgICAgdHJhbnNhY3Rpb246IHtcclxuICAgICAgICBoYXNoOiB0eFJlc3BvbnNlLmhhc2gsXHJcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICAgIGZyb206IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLFxyXG4gICAgICAgIHRvOiB0b0FkZHJlc3MsXHJcbiAgICAgICAgdmFsdWU6IHNlbGVjdGVkQXNzZXQgPT09ICduYXRpdmUnID8gZXRoZXJzLnBhcnNlRXRoZXIoYW1vdW50KS50b1N0cmluZygpIDogJzAnLFxyXG4gICAgICAgIGdhc1ByaWNlOiBnYXNQcmljZSB8fCAoYXdhaXQgdHhSZXNwb25zZS5wcm92aWRlci5nZXRGZWVEYXRhKCkpLmdhc1ByaWNlLnRvU3RyaW5nKCksXHJcbiAgICAgICAgbm9uY2U6IHR4UmVzcG9uc2Uubm9uY2UsXHJcbiAgICAgICAgbmV0d29yazogY3VycmVudFN0YXRlLm5ldHdvcmssXHJcbiAgICAgICAgc3RhdHVzOiAncGVuZGluZycsXHJcbiAgICAgICAgYmxvY2tOdW1iZXI6IG51bGwsXHJcbiAgICAgICAgdHlwZTogc2VsZWN0ZWRBc3NldCA9PT0gJ25hdGl2ZScgPyAnc2VuZCcgOiAndG9rZW4nXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNlbmQgZGVza3RvcCBub3RpZmljYXRpb25cclxuICAgIGlmIChjaHJvbWUubm90aWZpY2F0aW9ucykge1xyXG4gICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBTZW50JyxcclxuICAgICAgICBtZXNzYWdlOiBgU2VuZGluZyAke2Ftb3VudH0gJHtzeW1ib2x9IHRvICR7dG9BZGRyZXNzLnNsaWNlKDAsIDEwKX0uLi5gLFxyXG4gICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNob3cgdHJhbnNhY3Rpb24gc3RhdHVzIHNjcmVlblxyXG4gICAgYXdhaXQgc2hvd1NlbmRUcmFuc2FjdGlvblN0YXR1cyh0eFJlc3BvbnNlLmhhc2gsIGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCBhbW91bnQsIHN5bWJvbCk7XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdTZW5kIHRyYW5zYWN0aW9uIGVycm9yOicsIGVycm9yKTtcclxuICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdpbmNvcnJlY3QgcGFzc3dvcmQnKVxyXG4gICAgICA/ICdJbmNvcnJlY3QgcGFzc3dvcmQnXHJcbiAgICAgIDogJ1RyYW5zYWN0aW9uIGZhaWxlZDogJyArIGVycm9yLm1lc3NhZ2U7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG5cclxuICAgIC8vIFJlLWVuYWJsZSBzZW5kIGJ1dHRvbiBvbiBlcnJvclxyXG4gICAgY29uc3Qgc2VuZEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29uZmlybS1zZW5kJyk7XHJcbiAgICBzZW5kQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICBzZW5kQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICBzZW5kQnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNob3dUcmFuc2FjdGlvblN1Y2Nlc3NNb2RhbCh0eEhhc2gpIHtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc3VjY2Vzcy1oYXNoJykudGV4dENvbnRlbnQgPSB0eEhhc2g7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXR4LXN1Y2Nlc3MnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gd2FpdEZvclRyYW5zYWN0aW9uQ29uZmlybWF0aW9uKHR4SGFzaCwgYW1vdW50LCBzeW1ib2wpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIoY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG5cclxuICAgIC8vIFdhaXQgZm9yIHRyYW5zYWN0aW9uIHRvIGJlIG1pbmVkICgxIGNvbmZpcm1hdGlvbilcclxuICAgIGNvbnN0IHJlY2VpcHQgPSBhd2FpdCBwcm92aWRlci53YWl0Rm9yVHJhbnNhY3Rpb24odHhIYXNoLCAxKTtcclxuXHJcbiAgICBpZiAocmVjZWlwdCAmJiByZWNlaXB0LnN0YXR1cyA9PT0gMSkge1xyXG4gICAgICAvLyBUcmFuc2FjdGlvbiBjb25maXJtZWQgc3VjY2Vzc2Z1bGx5XHJcbiAgICAgIGlmIChjaHJvbWUubm90aWZpY2F0aW9ucykge1xyXG4gICAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIENvbmZpcm1lZCcsXHJcbiAgICAgICAgICBtZXNzYWdlOiBgJHthbW91bnR9ICR7c3ltYm9sfSB0cmFuc2ZlciBjb25maXJtZWQgb24tY2hhaW4hYCxcclxuICAgICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEF1dG8tcmVmcmVzaCBiYWxhbmNlXHJcbiAgICAgIGF3YWl0IGZldGNoQmFsYW5jZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gVHJhbnNhY3Rpb24gZmFpbGVkXHJcbiAgICAgIGlmIChjaHJvbWUubm90aWZpY2F0aW9ucykge1xyXG4gICAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIEZhaWxlZCcsXHJcbiAgICAgICAgICBtZXNzYWdlOiAnVHJhbnNhY3Rpb24gd2FzIHJldmVydGVkIG9yIGZhaWxlZCBvbi1jaGFpbicsXHJcbiAgICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHdhaXRpbmcgZm9yIGNvbmZpcm1hdGlvbjonLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBSRUNFSVZFID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIHNob3dSZWNlaXZlU2NyZWVuKCkge1xyXG4gIGNvbnN0IGFkZHJlc3MgPSBjdXJyZW50U3RhdGUuYWRkcmVzcztcclxuXHJcbiAgLy8gVXBkYXRlIGFkZHJlc3MgZGlzcGxheVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWNlaXZlLWFkZHJlc3MnKS50ZXh0Q29udGVudCA9IGFkZHJlc3M7XHJcblxyXG4gIC8vIFVwZGF0ZSBuZXR3b3JrIGluZm9cclxuICBjb25zdCBuZXR3b3JrTmFtZXMgPSB7XHJcbiAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAnUHVsc2VDaGFpbiBUZXN0bmV0IFY0JyxcclxuICAgICdwdWxzZWNoYWluJzogJ1B1bHNlQ2hhaW4gTWFpbm5ldCcsXHJcbiAgICAnZXRoZXJldW0nOiAnRXRoZXJldW0gTWFpbm5ldCcsXHJcbiAgICAnc2Vwb2xpYSc6ICdTZXBvbGlhIFRlc3RuZXQnXHJcbiAgfTtcclxuICBjb25zdCBzeW1ib2xzID0ge1xyXG4gICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3RQTFMnLFxyXG4gICAgJ3B1bHNlY2hhaW4nOiAnUExTJyxcclxuICAgICdldGhlcmV1bSc6ICdFVEgnLFxyXG4gICAgJ3NlcG9saWEnOiAnU0VQJ1xyXG4gIH07XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlY2VpdmUtbmV0d29yay1uYW1lJykudGV4dENvbnRlbnQgPSBuZXR3b3JrTmFtZXNbY3VycmVudFN0YXRlLm5ldHdvcmtdIHx8ICdVbmtub3duIE5ldHdvcmsnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWNlaXZlLW5ldHdvcmstc3ltYm9sJykudGV4dENvbnRlbnQgPSBzeW1ib2xzW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXSB8fCAnVE9LRU4nO1xyXG5cclxuICAvLyBHZW5lcmF0ZSBRUiBjb2RlXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWNlaXZlLXFyLWNhbnZhcycpO1xyXG4gICAgYXdhaXQgUVJDb2RlLnRvQ2FudmFzKGNhbnZhcywgYWRkcmVzcywge1xyXG4gICAgICB3aWR0aDogMjAwLFxyXG4gICAgICBtYXJnaW46IDIsXHJcbiAgICAgIGNvbG9yOiB7XHJcbiAgICAgICAgZGFyazogZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5KS5nZXRQcm9wZXJ0eVZhbHVlKCctLXRlcm1pbmFsLWZnJykudHJpbSgpLFxyXG4gICAgICAgIGxpZ2h0OiBnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmJvZHkpLmdldFByb3BlcnR5VmFsdWUoJy0tdGVybWluYWwtYmcnKS50cmltKClcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdlbmVyYXRpbmcgUVIgY29kZTonLCBlcnJvcik7XHJcbiAgfVxyXG5cclxuICBzaG93U2NyZWVuKCdzY3JlZW4tcmVjZWl2ZScpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDb3B5UmVjZWl2ZUFkZHJlc3MoKSB7XHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGN1cnJlbnRTdGF0ZS5hZGRyZXNzKTtcclxuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS1yZWNlaXZlLWFkZHJlc3MnKTtcclxuICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGJ0bi50ZXh0Q29udGVudDtcclxuICAgIGJ0bi50ZXh0Q29udGVudCA9ICdDT1BJRUQhJztcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSBvcmlnaW5hbFRleHQ7XHJcbiAgICB9LCAyMDAwKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0ZhaWxlZCB0byBjb3B5IGFkZHJlc3MnKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFRPS0VOUyA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBzaG93VG9rZW5zU2NyZWVuKCkge1xyXG4gIC8vIFN3aXRjaCB0byBzY3JlZW4gZmlyc3Qgc28gdXNlciBzZWVzIGxvYWRpbmcgaW5kaWNhdG9yXHJcbiAgc2hvd1NjcmVlbignc2NyZWVuLXRva2VucycpO1xyXG5cclxuICAvLyBTbWFsbCBkZWxheSB0byBlbnN1cmUgc2NyZWVuIGlzIHZpc2libGUgYmVmb3JlIHN0YXJ0aW5nIHJlbmRlclxyXG4gIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCAxMCkpO1xyXG5cclxuICAvLyBOb3cgcmVuZGVyIHRva2VucyAobG9hZGluZyBpbmRpY2F0b3Igd2lsbCBiZSB2aXNpYmxlKVxyXG4gIGF3YWl0IHJlbmRlclRva2Vuc1NjcmVlbigpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZW5kZXJUb2tlbnNTY3JlZW4oKSB7XHJcbiAgY29uc3QgbmV0d29yayA9IGN1cnJlbnRTdGF0ZS5uZXR3b3JrO1xyXG5cclxuICAvLyBTaG93IGxvYWRpbmcsIGhpZGUgcGFuZWxzXHJcbiAgY29uc3QgbG9hZGluZ0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2Vucy1sb2FkaW5nJyk7XHJcbiAgY29uc3QgZGVmYXVsdFBhbmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlZmF1bHQtdG9rZW5zLXBhbmVsJyk7XHJcbiAgY29uc3QgY3VzdG9tUGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VzdG9tLXRva2Vucy1wYW5lbCcpO1xyXG5cclxuICBpZiAobG9hZGluZ0VsKSBsb2FkaW5nRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgaWYgKGRlZmF1bHRQYW5lbCkgZGVmYXVsdFBhbmVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIGlmIChjdXN0b21QYW5lbCkgY3VzdG9tUGFuZWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBSZW5kZXIgZGVmYXVsdCB0b2tlbnNcclxuICAgIGF3YWl0IHJlbmRlckRlZmF1bHRUb2tlbnMobmV0d29yayk7XHJcblxyXG4gICAgLy8gUmVuZGVyIGN1c3RvbSB0b2tlbnNcclxuICAgIGF3YWl0IHJlbmRlckN1c3RvbVRva2VucyhuZXR3b3JrKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgLy8gSGlkZSBsb2FkaW5nLCBzaG93IHBhbmVsc1xyXG4gICAgaWYgKGxvYWRpbmdFbCkgbG9hZGluZ0VsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgaWYgKGRlZmF1bHRQYW5lbCkgZGVmYXVsdFBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgaWYgKGN1c3RvbVBhbmVsKSBjdXN0b21QYW5lbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlbmRlckRlZmF1bHRUb2tlbnMobmV0d29yaykge1xyXG4gIGNvbnN0IGRlZmF1bHRUb2tlbnNFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWZhdWx0LXRva2Vucy1saXN0Jyk7XHJcbiAgY29uc3QgbmV0d29ya0RlZmF1bHRzID0gdG9rZW5zLkRFRkFVTFRfVE9LRU5TW25ldHdvcmtdIHx8IHt9O1xyXG4gIGNvbnN0IGVuYWJsZWREZWZhdWx0cyA9IGF3YWl0IHRva2Vucy5nZXRFbmFibGVkRGVmYXVsdFRva2VucyhuZXR3b3JrKTtcclxuXHJcbiAgaWYgKE9iamVjdC5rZXlzKG5ldHdvcmtEZWZhdWx0cykubGVuZ3RoID09PSAwKSB7XHJcbiAgICBkZWZhdWx0VG9rZW5zRWwuaW5uZXJIVE1MID0gJzxwIGNsYXNzPVwidGV4dC1jZW50ZXIgdGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDsgcGFkZGluZzogMTZweDtcIj5ObyBkZWZhdWx0IHRva2VucyBmb3IgdGhpcyBuZXR3b3JrPC9wPic7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBsZXQgaHRtbCA9ICcnO1xyXG4gIGZvciAoY29uc3Qgc3ltYm9sIGluIG5ldHdvcmtEZWZhdWx0cykge1xyXG4gICAgY29uc3QgdG9rZW4gPSBuZXR3b3JrRGVmYXVsdHNbc3ltYm9sXTtcclxuICAgIGNvbnN0IGlzRW5hYmxlZCA9IGVuYWJsZWREZWZhdWx0cy5pbmNsdWRlcyhzeW1ib2wpO1xyXG5cclxuICAgIC8vIEZldGNoIGJhbGFuY2UgaWYgZW5hYmxlZFxyXG4gICAgbGV0IGJhbGFuY2VUZXh0ID0gJy0nO1xyXG4gICAgbGV0IGJhbGFuY2VUb29sdGlwID0gJyc7XHJcbiAgICBsZXQgdXNkVmFsdWUgPSBudWxsO1xyXG4gICAgaWYgKGlzRW5hYmxlZCAmJiBjdXJyZW50U3RhdGUuYWRkcmVzcykge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBhd2FpdCBlcmMyMC5nZXRUb2tlbkJhbGFuY2UobmV0d29yaywgdG9rZW4uYWRkcmVzcywgY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgICAgIGNvbnN0IHJhd0JhbGFuY2UgPSBlcmMyMC5mb3JtYXRUb2tlbkJhbGFuY2UoYmFsYW5jZVdlaSwgdG9rZW4uZGVjaW1hbHMsIDQpO1xyXG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdEJhbGFuY2VXaXRoQ29tbWFzKHJhd0JhbGFuY2UsIHRva2VuLmRlY2ltYWxzKTtcclxuICAgICAgICBiYWxhbmNlVGV4dCA9IGZvcm1hdHRlZC5kaXNwbGF5O1xyXG4gICAgICAgIGJhbGFuY2VUb29sdGlwID0gZm9ybWF0dGVkLnRvb2x0aXA7XHJcblxyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBVU0QgdmFsdWUgaWYgcHJpY2VzIGF2YWlsYWJsZVxyXG4gICAgICAgIGlmIChjdXJyZW50U3RhdGUudG9rZW5QcmljZXMpIHtcclxuICAgICAgICAgIHVzZFZhbHVlID0gZ2V0VG9rZW5WYWx1ZVVTRChzeW1ib2wsIGJhbGFuY2VXZWksIHRva2VuLmRlY2ltYWxzLCBjdXJyZW50U3RhdGUudG9rZW5QcmljZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBiYWxhbmNlVGV4dCA9ICdFcnJvcic7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsb2dvVXJsID0gdG9rZW4ubG9nbyA/IGNocm9tZS5ydW50aW1lLmdldFVSTChgYXNzZXRzL2xvZ29zLyR7dG9rZW4ubG9nb31gKSA6ICcnO1xyXG5cclxuICAgIGh0bWwgKz0gYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwidG9rZW4taXRlbVwiIHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBwYWRkaW5nOiAxMnB4IDhweDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRlcm1pbmFsLWJvcmRlcik7XCI+XHJcbiAgICAgICAgJHt0b2tlbi5sb2dvID9cclxuICAgICAgICAgICh0b2tlbi5ob21lVXJsID9cclxuICAgICAgICAgICAgYDxpbWcgc3JjPVwiJHtsb2dvVXJsfVwiIGFsdD1cIiR7ZXNjYXBlSHRtbCh0b2tlbi5zeW1ib2wpfVwiIHN0eWxlPVwid2lkdGg6IDMycHg7IGhlaWdodDogMzJweDsgbWFyZ2luLXJpZ2h0OiAxMnB4OyBib3JkZXItcmFkaXVzOiA1MCU7IGN1cnNvcjogcG9pbnRlcjtcIiBjbGFzcz1cInRva2VuLWxvZ28tbGlua1wiIGRhdGEtdXJsPVwiJHt0b2tlbi5ob21lVXJsfVwiIHRpdGxlPVwiVmlzaXQgJHtlc2NhcGVIdG1sKHRva2VuLm5hbWUpfSBob21lcGFnZVwiIC8+YCA6XHJcbiAgICAgICAgICAgIGA8aW1nIHNyYz1cIiR7bG9nb1VybH1cIiBhbHQ9XCIke2VzY2FwZUh0bWwodG9rZW4uc3ltYm9sKX1cIiBzdHlsZT1cIndpZHRoOiAzMnB4OyBoZWlnaHQ6IDMycHg7IG1hcmdpbi1yaWdodDogMTJweDsgYm9yZGVyLXJhZGl1czogNTAlO1wiIC8+YCkgOlxyXG4gICAgICAgICAgJzxkaXYgc3R5bGU9XCJ3aWR0aDogMzJweDsgaGVpZ2h0OiAzMnB4OyBtYXJnaW4tcmlnaHQ6IDEycHg7IGJhY2tncm91bmQ6IHZhcigtLXRlcm1pbmFsLWJvcmRlcik7IGJvcmRlci1yYWRpdXM6IDUwJTtcIj48L2Rpdj4nfVxyXG4gICAgICAgIDxkaXYgc3R5bGU9XCJmbGV4OiAxO1wiPlxyXG4gICAgICAgICAgPHAgc3R5bGU9XCJmb250LXNpemU6IDE1cHg7IGZvbnQtd2VpZ2h0OiBib2xkO1wiPiR7ZXNjYXBlSHRtbCh0b2tlbi5zeW1ib2wpfTwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW0gJHt0b2tlbi5kZXhTY3JlZW5lclVybCA/ICd0b2tlbi1uYW1lLWxpbmsnIDogJyd9XCIgc3R5bGU9XCJmb250LXNpemU6IDEzcHg7ICR7dG9rZW4uZGV4U2NyZWVuZXJVcmwgPyAnY3Vyc29yOiBwb2ludGVyOyB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsnIDogJyd9XCIgJHt0b2tlbi5kZXhTY3JlZW5lclVybCA/IGBkYXRhLXVybD1cIiR7dG9rZW4uZGV4U2NyZWVuZXJVcmx9XCIgdGl0bGU9XCJWaWV3ICR7ZXNjYXBlSHRtbCh0b2tlbi5uYW1lKX0gb24gRGV4U2NyZWVuZXJcImAgOiAnJ30+JHtlc2NhcGVIdG1sKHRva2VuLm5hbWUpfTwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDsgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtbW9ubyk7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogNHB4O1wiPlxyXG4gICAgICAgICAgICA8c3BhbiBzdHlsZT1cIm1heC13aWR0aDogODBweDsgb3ZlcmZsb3c6IGhpZGRlbjsgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XCI+JHt0b2tlbi5hZGRyZXNzfTwvc3Bhbj5cclxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImNvcHktYWRkcmVzcy1idG5cIiBkYXRhLWFkZHJlc3M9XCIke3Rva2VuLmFkZHJlc3N9XCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiBub25lOyBib3JkZXI6IG5vbmU7IGNvbG9yOiB2YXIoLS10ZXJtaW5hbC1hY2NlbnQpOyBjdXJzb3I6IHBvaW50ZXI7IGZvbnQtc2l6ZTogMTFweDsgcGFkZGluZzogMnB4IDRweDtcIiB0aXRsZT1cIkNvcHkgY29udHJhY3QgYWRkcmVzc1wiPvCfk4s8L2J1dHRvbj5cclxuICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICR7aXNFbmFibGVkID8gYFxyXG4gICAgICAgICAgICA8cCBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDEzcHg7IGN1cnNvcjogaGVscDtcIiB0aXRsZT1cIiR7YmFsYW5jZVRvb2x0aXB9XCI+QmFsYW5jZTogJHtiYWxhbmNlVGV4dH08L3A+XHJcbiAgICAgICAgICAgICR7dXNkVmFsdWUgIT09IG51bGwgPyBgPHAgY2xhc3M9XCJ0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMnB4OyBtYXJnaW4tdG9wOiAycHg7XCI+JHtmb3JtYXRVU0QodXNkVmFsdWUpfTwvcD5gIDogJyd9XHJcbiAgICAgICAgICBgIDogJyd9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IG1hcmdpbi1sZWZ0OiA4cHg7XCI+XHJcbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwidmlldy10b2tlbi1kZXRhaWxzLWJ0blwiIGRhdGEtdG9rZW4tc3ltYm9sPVwiJHtzeW1ib2x9XCIgZGF0YS1pcy1kZWZhdWx0PVwidHJ1ZVwiIHN0eWxlPVwiYmFja2dyb3VuZDogdmFyKC0tdGVybWluYWwtYWNjZW50KTsgYm9yZGVyOiBub25lOyBjb2xvcjogIzAwMDsgY3Vyc29yOiBwb2ludGVyOyBmb250LXNpemU6IDE4cHg7IHBhZGRpbmc6IDRweCA4cHg7IGJvcmRlci1yYWRpdXM6IDRweDtcIiB0aXRsZT1cIlZpZXcgdG9rZW4gZGV0YWlsc1wiPuKEue+4jzwvYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIGA7XHJcbiAgfVxyXG5cclxuICBkZWZhdWx0VG9rZW5zRWwuaW5uZXJIVE1MID0gaHRtbDtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgdmlldyBkZXRhaWxzIGJ1dHRvbnNcclxuICBkZWZhdWx0VG9rZW5zRWwucXVlcnlTZWxlY3RvckFsbCgnLnZpZXctdG9rZW4tZGV0YWlscy1idG4nKS5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICBjb25zdCBzeW1ib2wgPSBlLnRhcmdldC5kYXRhc2V0LnRva2VuU3ltYm9sO1xyXG4gICAgICBjb25zdCBpc0RlZmF1bHQgPSBlLnRhcmdldC5kYXRhc2V0LmlzRGVmYXVsdCA9PT0gJ3RydWUnO1xyXG4gICAgICBzaG93VG9rZW5EZXRhaWxzKHN5bWJvbCwgaXNEZWZhdWx0KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBjb3B5IGFkZHJlc3MgYnV0dG9uc1xyXG4gIGRlZmF1bHRUb2tlbnNFbC5xdWVyeVNlbGVjdG9yQWxsKCcuY29weS1hZGRyZXNzLWJ0bicpLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFkZHJlc3MgPSBlLnRhcmdldC5kYXRhc2V0LmFkZHJlc3M7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoYWRkcmVzcyk7XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gZS50YXJnZXQudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgZS50YXJnZXQudGV4dENvbnRlbnQgPSAn4pyTJztcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIGUudGFyZ2V0LnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0O1xyXG4gICAgICAgIH0sIDEwMDApO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjb3B5IGFkZHJlc3M6JywgZXJyb3IpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgbG9nbyBjbGlja3MgKG9wZW4gaG9tZXBhZ2UpXHJcbiAgZGVmYXVsdFRva2Vuc0VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2tlbi1sb2dvLWxpbmsnKS5mb3JFYWNoKGltZyA9PiB7XHJcbiAgICBpbWcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICBjb25zdCB1cmwgPSBlLnRhcmdldC5kYXRhc2V0LnVybDtcclxuICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsIH0pO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIG5hbWUgY2xpY2tzIChvcGVuIERleFNjcmVlbmVyKVxyXG4gIGRlZmF1bHRUb2tlbnNFbC5xdWVyeVNlbGVjdG9yQWxsKCcudG9rZW4tbmFtZS1saW5rJykuZm9yRWFjaChwID0+IHtcclxuICAgIHAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICBjb25zdCB1cmwgPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC51cmw7XHJcbiAgICAgIGlmICh1cmwpIHtcclxuICAgICAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmwgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZW5kZXJDdXN0b21Ub2tlbnMobmV0d29yaykge1xyXG4gIGNvbnN0IGN1c3RvbVRva2Vuc0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N1c3RvbS10b2tlbnMtbGlzdCcpO1xyXG4gIGNvbnN0IGN1c3RvbVRva2VucyA9IGF3YWl0IHRva2Vucy5nZXRDdXN0b21Ub2tlbnMobmV0d29yayk7XHJcblxyXG4gIGlmIChjdXN0b21Ub2tlbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICBjdXN0b21Ub2tlbnNFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBwYWRkaW5nOiAxNnB4O1wiPk5vIGN1c3RvbSB0b2tlbnMgYWRkZWQ8L3A+JztcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGxldCBodG1sID0gJyc7XHJcbiAgZm9yIChjb25zdCB0b2tlbiBvZiBjdXN0b21Ub2tlbnMpIHtcclxuICAgIC8vIEZldGNoIGJhbGFuY2VcclxuICAgIGxldCBiYWxhbmNlVGV4dCA9ICctJztcclxuICAgIGxldCBiYWxhbmNlVG9vbHRpcCA9ICcnO1xyXG4gICAgbGV0IHVzZFZhbHVlID0gbnVsbDtcclxuICAgIGlmIChjdXJyZW50U3RhdGUuYWRkcmVzcykge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBhd2FpdCBlcmMyMC5nZXRUb2tlbkJhbGFuY2UobmV0d29yaywgdG9rZW4uYWRkcmVzcywgY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgICAgIGNvbnN0IHJhd0JhbGFuY2UgPSBlcmMyMC5mb3JtYXRUb2tlbkJhbGFuY2UoYmFsYW5jZVdlaSwgdG9rZW4uZGVjaW1hbHMsIDQpO1xyXG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdEJhbGFuY2VXaXRoQ29tbWFzKHJhd0JhbGFuY2UsIHRva2VuLmRlY2ltYWxzKTtcclxuICAgICAgICBiYWxhbmNlVGV4dCA9IGZvcm1hdHRlZC5kaXNwbGF5O1xyXG4gICAgICAgIGJhbGFuY2VUb29sdGlwID0gZm9ybWF0dGVkLnRvb2x0aXA7XHJcblxyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBVU0QgdmFsdWUgaWYgcHJpY2VzIGF2YWlsYWJsZSBhbmQgdG9rZW4gaXMga25vd25cclxuICAgICAgICBpZiAoY3VycmVudFN0YXRlLnRva2VuUHJpY2VzKSB7XHJcbiAgICAgICAgICB1c2RWYWx1ZSA9IGdldFRva2VuVmFsdWVVU0QodG9rZW4uc3ltYm9sLCBiYWxhbmNlV2VpLCB0b2tlbi5kZWNpbWFscywgY3VycmVudFN0YXRlLnRva2VuUHJpY2VzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgYmFsYW5jZVRleHQgPSAnRXJyb3InO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbG9nb1VybCA9IHRva2VuLmxvZ28gPyBjaHJvbWUucnVudGltZS5nZXRVUkwoYGFzc2V0cy9sb2dvcy8ke3Rva2VuLmxvZ299YCkgOiAnJztcclxuXHJcbiAgICBodG1sICs9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cInRva2VuLWl0ZW1cIiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgcGFkZGluZzogMTJweCA4cHg7IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS10ZXJtaW5hbC1ib3JkZXIpO1wiPlxyXG4gICAgICAgICR7dG9rZW4ubG9nbyA/XHJcbiAgICAgICAgICAodG9rZW4uaG9tZVVybCA/XHJcbiAgICAgICAgICAgIGA8aW1nIHNyYz1cIiR7bG9nb1VybH1cIiBhbHQ9XCIke2VzY2FwZUh0bWwodG9rZW4uc3ltYm9sKX1cIiBzdHlsZT1cIndpZHRoOiAzMnB4OyBoZWlnaHQ6IDMycHg7IG1hcmdpbi1yaWdodDogMTJweDsgYm9yZGVyLXJhZGl1czogNTAlOyBjdXJzb3I6IHBvaW50ZXI7XCIgY2xhc3M9XCJ0b2tlbi1sb2dvLWxpbmtcIiBkYXRhLXVybD1cIiR7dG9rZW4uaG9tZVVybH1cIiB0aXRsZT1cIlZpc2l0ICR7ZXNjYXBlSHRtbCh0b2tlbi5uYW1lKX0gaG9tZXBhZ2VcIiAvPmAgOlxyXG4gICAgICAgICAgICBgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgYWx0PVwiJHtlc2NhcGVIdG1sKHRva2VuLnN5bWJvbCl9XCIgc3R5bGU9XCJ3aWR0aDogMzJweDsgaGVpZ2h0OiAzMnB4OyBtYXJnaW4tcmlnaHQ6IDEycHg7IGJvcmRlci1yYWRpdXM6IDUwJTtcIiAvPmApIDpcclxuICAgICAgICAgICc8ZGl2IHN0eWxlPVwid2lkdGg6IDMycHg7IGhlaWdodDogMzJweDsgbWFyZ2luLXJpZ2h0OiAxMnB4OyBiYWNrZ3JvdW5kOiB2YXIoLS10ZXJtaW5hbC1ib3JkZXIpOyBib3JkZXItcmFkaXVzOiA1MCU7XCI+PC9kaXY+J31cclxuICAgICAgICA8ZGl2IHN0eWxlPVwiZmxleDogMTtcIj5cclxuICAgICAgICAgIDxwIHN0eWxlPVwiZm9udC1zaXplOiAxNXB4OyBmb250LXdlaWdodDogYm9sZDtcIj4ke2VzY2FwZUh0bWwodG9rZW4uc3ltYm9sKX08L3A+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cInRleHQtZGltICR7dG9rZW4uZGV4U2NyZWVuZXJVcmwgPyAndG9rZW4tbmFtZS1saW5rJyA6ICcnfVwiIHN0eWxlPVwiZm9udC1zaXplOiAxM3B4OyAke3Rva2VuLmRleFNjcmVlbmVyVXJsID8gJ2N1cnNvcjogcG9pbnRlcjsgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7JyA6ICcnfVwiICR7dG9rZW4uZGV4U2NyZWVuZXJVcmwgPyBgZGF0YS11cmw9XCIke3Rva2VuLmRleFNjcmVlbmVyVXJsfVwiIHRpdGxlPVwiVmlldyAke2VzY2FwZUh0bWwodG9rZW4ubmFtZSl9IG9uIERleFNjcmVlbmVyXCJgIDogJyd9PiR7ZXNjYXBlSHRtbCh0b2tlbi5uYW1lKX08L3A+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDExcHg7IGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LW1vbm8pOyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDRweDtcIj5cclxuICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJtYXgtd2lkdGg6IDgwcHg7IG92ZXJmbG93OiBoaWRkZW47IHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1wiPiR7dG9rZW4uYWRkcmVzc308L3NwYW4+XHJcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJjb3B5LWFkZHJlc3MtYnRuXCIgZGF0YS1hZGRyZXNzPVwiJHt0b2tlbi5hZGRyZXNzfVwiIHN0eWxlPVwiYmFja2dyb3VuZDogbm9uZTsgYm9yZGVyOiBub25lOyBjb2xvcjogdmFyKC0tdGVybWluYWwtYWNjZW50KTsgY3Vyc29yOiBwb2ludGVyOyBmb250LXNpemU6IDExcHg7IHBhZGRpbmc6IDJweCA0cHg7XCIgdGl0bGU9XCJDb3B5IGNvbnRyYWN0IGFkZHJlc3NcIj7wn5OLPC9idXR0b24+XHJcbiAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDEzcHg7IGN1cnNvcjogaGVscDtcIiB0aXRsZT1cIiR7YmFsYW5jZVRvb2x0aXB9XCI+QmFsYW5jZTogJHtiYWxhbmNlVGV4dH08L3A+XHJcbiAgICAgICAgICAke3VzZFZhbHVlICE9PSBudWxsID8gYDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTJweDsgbWFyZ2luLXRvcDogMnB4O1wiPiR7Zm9ybWF0VVNEKHVzZFZhbHVlKX08L3A+YCA6ICcnfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyBnYXA6IDZweDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgbWFyZ2luLWxlZnQ6IDhweDsgbWluLXdpZHRoOiA4MHB4O1wiPlxyXG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInZpZXctdG9rZW4tZGV0YWlscy1idG5cIiBkYXRhLXRva2VuLXN5bWJvbD1cIiR7dG9rZW4uc3ltYm9sfVwiIGRhdGEtaXMtZGVmYXVsdD1cImZhbHNlXCIgZGF0YS10b2tlbi1hZGRyZXNzPVwiJHt0b2tlbi5hZGRyZXNzfVwiIHN0eWxlPVwiYmFja2dyb3VuZDogdmFyKC0tdGVybWluYWwtYWNjZW50KTsgYm9yZGVyOiBub25lOyBjb2xvcjogIzAwMDsgY3Vyc29yOiBwb2ludGVyOyBmb250LXNpemU6IDE4cHg7IHBhZGRpbmc6IDRweCA4cHg7IGJvcmRlci1yYWRpdXM6IDRweDtcIiB0aXRsZT1cIlZpZXcgdG9rZW4gZGV0YWlsc1wiPuKEue+4jzwvYnV0dG9uPlxyXG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0bi1kYW5nZXIgYnRuLXNtYWxsIHJlbW92ZS10b2tlbi1idG5cIiBkYXRhLXRva2VuLWFkZHJlc3M9XCIke3Rva2VuLmFkZHJlc3N9XCIgc3R5bGU9XCJ3aWR0aDogMTAwJTsgZm9udC1zaXplOiA5cHg7IHBhZGRpbmc6IDJweCA0cHg7XCI+UkVNT1ZFPC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuICB9XHJcblxyXG4gIGN1c3RvbVRva2Vuc0VsLmlubmVySFRNTCA9IGh0bWw7XHJcblxyXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIHZpZXcgZGV0YWlscyBidXR0b25zXHJcbiAgY3VzdG9tVG9rZW5zRWwucXVlcnlTZWxlY3RvckFsbCgnLnZpZXctdG9rZW4tZGV0YWlscy1idG4nKS5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICBjb25zdCBzeW1ib2wgPSBlLnRhcmdldC5kYXRhc2V0LnRva2VuU3ltYm9sO1xyXG4gICAgICBjb25zdCBpc0RlZmF1bHQgPSBlLnRhcmdldC5kYXRhc2V0LmlzRGVmYXVsdCA9PT0gJ3RydWUnO1xyXG4gICAgICBjb25zdCBhZGRyZXNzID0gZS50YXJnZXQuZGF0YXNldC50b2tlbkFkZHJlc3M7XHJcbiAgICAgIHNob3dUb2tlbkRldGFpbHMoc3ltYm9sLCBpc0RlZmF1bHQsIGFkZHJlc3MpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIHJlbW92ZSBidXR0b25zXHJcbiAgY3VzdG9tVG9rZW5zRWwucXVlcnlTZWxlY3RvckFsbCgnLnJlbW92ZS10b2tlbi1idG4nKS5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZSkgPT4ge1xyXG4gICAgICBjb25zdCBhZGRyZXNzID0gZS50YXJnZXQuZGF0YXNldC50b2tlbkFkZHJlc3M7XHJcbiAgICAgIGlmIChjb25maXJtKCdSZW1vdmUgdGhpcyB0b2tlbiBmcm9tIHlvdXIgbGlzdD8nKSkge1xyXG4gICAgICAgIGF3YWl0IHRva2Vucy5yZW1vdmVDdXN0b21Ub2tlbihuZXR3b3JrLCBhZGRyZXNzKTtcclxuICAgICAgICBhd2FpdCByZW5kZXJUb2tlbnNTY3JlZW4oKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGNvcHkgYWRkcmVzcyBidXR0b25zXHJcbiAgY3VzdG9tVG9rZW5zRWwucXVlcnlTZWxlY3RvckFsbCgnLmNvcHktYWRkcmVzcy1idG4nKS5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZSkgPT4ge1xyXG4gICAgICBjb25zdCBhZGRyZXNzID0gZS50YXJnZXQuZGF0YXNldC5hZGRyZXNzO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGFkZHJlc3MpO1xyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGUudGFyZ2V0LnRleHRDb250ZW50O1xyXG4gICAgICAgIGUudGFyZ2V0LnRleHRDb250ZW50ID0gJ+Kckyc7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBlLnRhcmdldC50ZXh0Q29udGVudCA9IG9yaWdpbmFsVGV4dDtcclxuICAgICAgICB9LCAxMDAwKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY29weSBhZGRyZXNzOicsIGVycm9yKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGxvZ28gY2xpY2tzIChvcGVuIGhvbWVwYWdlKVxyXG4gIGN1c3RvbVRva2Vuc0VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2tlbi1sb2dvLWxpbmsnKS5mb3JFYWNoKGltZyA9PiB7XHJcbiAgICBpbWcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICBjb25zdCB1cmwgPSBlLnRhcmdldC5kYXRhc2V0LnVybDtcclxuICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsIH0pO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIG5hbWUgY2xpY2tzIChvcGVuIERleFNjcmVlbmVyKVxyXG4gIGN1c3RvbVRva2Vuc0VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2tlbi1uYW1lLWxpbmsnKS5mb3JFYWNoKHAgPT4ge1xyXG4gICAgcC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LnVybDtcclxuICAgICAgaWYgKHVybCkge1xyXG4gICAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybCB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vID09PT09IFRPS0VOIERFVEFJTFMgU0NSRUVOID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIHNob3dUb2tlbkRldGFpbHMoc3ltYm9sLCBpc0RlZmF1bHQsIGN1c3RvbUFkZHJlc3MgPSBudWxsKSB7XHJcbiAgY29uc3QgbmV0d29yayA9IGN1cnJlbnRTdGF0ZS5uZXR3b3JrO1xyXG5cclxuICAvLyBHZXQgdG9rZW4gZGF0YVxyXG4gIGxldCB0b2tlbkRhdGE7XHJcbiAgaWYgKGlzRGVmYXVsdCkge1xyXG4gICAgdG9rZW5EYXRhID0gdG9rZW5zLkRFRkFVTFRfVE9LRU5TW25ldHdvcmtdW3N5bWJvbF07XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIEZpbmQgaW4gY3VzdG9tIHRva2Vuc1xyXG4gICAgY29uc3QgY3VzdG9tVG9rZW5zID0gYXdhaXQgdG9rZW5zLmdldEN1c3RvbVRva2VucyhuZXR3b3JrKTtcclxuICAgIHRva2VuRGF0YSA9IGN1c3RvbVRva2Vucy5maW5kKHQgPT4gdC5hZGRyZXNzLnRvTG93ZXJDYXNlKCkgPT09IGN1c3RvbUFkZHJlc3MudG9Mb3dlckNhc2UoKSk7XHJcbiAgfVxyXG5cclxuICBpZiAoIXRva2VuRGF0YSkge1xyXG4gICAgY29uc29sZS5lcnJvcignVG9rZW4gbm90IGZvdW5kOicsIHN5bWJvbCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBTdG9yZSBjdXJyZW50IHRva2VuIGluIHN0YXRlXHJcbiAgY3VycmVudFN0YXRlLmN1cnJlbnRUb2tlbkRldGFpbHMgPSB7XHJcbiAgICAuLi50b2tlbkRhdGEsXHJcbiAgICBzeW1ib2wsXHJcbiAgICBpc0RlZmF1bHRcclxuICB9O1xyXG5cclxuICAvLyBVcGRhdGUgdGl0bGVcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy10aXRsZScpLnRleHRDb250ZW50ID0gc3ltYm9sLnRvVXBwZXJDYXNlKCk7XHJcblxyXG4gIC8vIFVwZGF0ZSB0b2tlbiBpbmZvXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtbmFtZScpLnRleHRDb250ZW50ID0gdG9rZW5EYXRhLm5hbWU7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtc3ltYm9sJykudGV4dENvbnRlbnQgPSBzeW1ib2w7XHJcblxyXG4gIC8vIFVwZGF0ZSBsb2dvXHJcbiAgY29uc3QgbG9nb0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWxvZ28tY29udGFpbmVyJyk7XHJcbiAgaWYgKHRva2VuRGF0YS5sb2dvKSB7XHJcbiAgICBjb25zdCBsb2dvVXJsID0gY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBhc3NldHMvbG9nb3MvJHt0b2tlbkRhdGEubG9nb31gKTtcclxuICAgIGxvZ29Db250YWluZXIuaW5uZXJIVE1MID0gYDxpbWcgc3JjPVwiJHtsb2dvVXJsfVwiIGFsdD1cIiR7c3ltYm9sfVwiIHN0eWxlPVwid2lkdGg6IDQ4cHg7IGhlaWdodDogNDhweDsgYm9yZGVyLXJhZGl1czogNTAlO1wiIC8+YDtcclxuICB9IGVsc2Uge1xyXG4gICAgbG9nb0NvbnRhaW5lci5pbm5lckhUTUwgPSAnPGRpdiBzdHlsZT1cIndpZHRoOiA0OHB4OyBoZWlnaHQ6IDQ4cHg7IGJhY2tncm91bmQ6IHZhcigtLXRlcm1pbmFsLWJvcmRlcik7IGJvcmRlci1yYWRpdXM6IDUwJTtcIj48L2Rpdj4nO1xyXG4gIH1cclxuXHJcbiAgLy8gRmV0Y2ggYW5kIHVwZGF0ZSBiYWxhbmNlXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBhd2FpdCBlcmMyMC5nZXRUb2tlbkJhbGFuY2UobmV0d29yaywgdG9rZW5EYXRhLmFkZHJlc3MsIGN1cnJlbnRTdGF0ZS5hZGRyZXNzKTtcclxuICAgIGNvbnN0IGJhbGFuY2VGb3JtYXR0ZWQgPSBlcmMyMC5mb3JtYXRUb2tlbkJhbGFuY2UoYmFsYW5jZVdlaSwgdG9rZW5EYXRhLmRlY2ltYWxzLCA4KTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWJhbGFuY2UnKS50ZXh0Q29udGVudCA9IGJhbGFuY2VGb3JtYXR0ZWQ7XHJcblxyXG4gICAgLy8gVXBkYXRlIFVTRCB2YWx1ZVxyXG4gICAgaWYgKGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcyAmJiBjdXJyZW50U3RhdGUudG9rZW5QcmljZXNbc3ltYm9sXSkge1xyXG4gICAgICBjb25zdCB1c2RWYWx1ZSA9IGdldFRva2VuVmFsdWVVU0Qoc3ltYm9sLCBiYWxhbmNlV2VpLCB0b2tlbkRhdGEuZGVjaW1hbHMsIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcyk7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWJhbGFuY2UtdXNkJykudGV4dENvbnRlbnQgPSBmb3JtYXRVU0QodXNkVmFsdWUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtYmFsYW5jZS11c2QnKS50ZXh0Q29udGVudCA9ICfigJQnO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB0b2tlbiBiYWxhbmNlOicsIGVycm9yKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWJhbGFuY2UnKS50ZXh0Q29udGVudCA9ICdFcnJvcic7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1iYWxhbmNlLXVzZCcpLnRleHRDb250ZW50ID0gJ+KAlCc7XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGUgcHJpY2VcclxuICBpZiAoY3VycmVudFN0YXRlLnRva2VuUHJpY2VzICYmIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlc1tzeW1ib2xdKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1wcmljZScpLnRleHRDb250ZW50ID0gZm9ybWF0VVNEKGN1cnJlbnRTdGF0ZS50b2tlblByaWNlc1tzeW1ib2xdKTtcclxuICB9IGVsc2Uge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtcHJpY2UnKS50ZXh0Q29udGVudCA9ICfigJQnO1xyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRlIGxpbmtzXHJcbiAgY29uc3QgaG9tZUxpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1ob21lLWxpbmsnKTtcclxuICBpZiAodG9rZW5EYXRhLmhvbWVVcmwpIHtcclxuICAgIGhvbWVMaW5rLmhyZWYgPSB0b2tlbkRhdGEuaG9tZVVybDtcclxuICAgIGhvbWVMaW5rLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBob21lTGluay5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGRleExpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1kZXgtbGluaycpO1xyXG4gIGlmICh0b2tlbkRhdGEuZGV4U2NyZWVuZXJVcmwpIHtcclxuICAgIGRleExpbmsuaHJlZiA9IHRva2VuRGF0YS5kZXhTY3JlZW5lclVybDtcclxuICAgIGRleExpbmsuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGRleExpbmsuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfVxyXG5cclxuICAvLyBTb3VyY2lmeSBsaW5rXHJcbiAgY29uc3QgY2hhaW5JZCA9IG5ldHdvcmsgPT09ICdwdWxzZWNoYWluJyA/IDM2OSA6IG5ldHdvcmsgPT09ICdwdWxzZWNoYWluVGVzdG5ldCcgPyA5NDMgOiAxO1xyXG4gIGNvbnN0IHNvdXJjaWZ5TGluayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXNvdXJjaWZ5LWxpbmsnKTtcclxuICBzb3VyY2lmeUxpbmsuaHJlZiA9IGBodHRwczovL3JlcG8uc291cmNpZnkuZGV2LyR7Y2hhaW5JZH0vJHt0b2tlbkRhdGEuYWRkcmVzc31gO1xyXG5cclxuICAvLyBDb250cmFjdCBhZGRyZXNzXHJcbiAgY29uc3Qgc2hvcnRBZGRyZXNzID0gYCR7dG9rZW5EYXRhLmFkZHJlc3Muc2xpY2UoMCwgNil9Li4uJHt0b2tlbkRhdGEuYWRkcmVzcy5zbGljZSgtNCl9YDtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1hZGRyZXNzLXNob3J0JykudGV4dENvbnRlbnQgPSBzaG9ydEFkZHJlc3M7XHJcblxyXG4gIC8vIE1hbmFnZW1lbnQgcGFuZWwgKHNob3cgb25seSBmb3IgZGVmYXVsdCB0b2tlbnMpXHJcbiAgY29uc3QgbWFuYWdlbWVudFBhbmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtbWFuYWdlbWVudC1wYW5lbCcpO1xyXG4gIGlmIChpc0RlZmF1bHQpIHtcclxuICAgIG1hbmFnZW1lbnRQYW5lbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuXHJcbiAgICAvLyBTZXQgdG9nZ2xlIHN0YXRlXHJcbiAgICBjb25zdCBlbmFibGVUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1lbmFibGUtdG9nZ2xlJyk7XHJcbiAgICBjb25zdCBlbmFibGVMYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWVuYWJsZS1sYWJlbCcpO1xyXG4gICAgY29uc3QgZW5hYmxlZFRva2VucyA9IGF3YWl0IHRva2Vucy5nZXRFbmFibGVkRGVmYXVsdFRva2VucyhuZXR3b3JrKTtcclxuICAgIGNvbnN0IGlzVG9rZW5FbmFibGVkID0gZW5hYmxlZFRva2Vucy5pbmNsdWRlcyhzeW1ib2wpO1xyXG5cclxuICAgIGVuYWJsZVRvZ2dsZS5jaGVja2VkID0gaXNUb2tlbkVuYWJsZWQ7XHJcbiAgICBlbmFibGVMYWJlbC50ZXh0Q29udGVudCA9IGlzVG9rZW5FbmFibGVkID8gJ0VuYWJsZWQnIDogJ0Rpc2FibGVkJztcclxuICB9IGVsc2Uge1xyXG4gICAgbWFuYWdlbWVudFBhbmVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2xlYXIgc2VuZCBmb3JtXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtcmVjaXBpZW50JykudmFsdWUgPSAnJztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1hbW91bnQnKS52YWx1ZSA9ICcnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXBhc3N3b3JkJykudmFsdWUgPSAnJztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1zZW5kLWVycm9yJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIC8vIFNob3cgZm9ybSBhbmQgaGlkZSBzdGF0dXMgc2VjdGlvbiAocmVzZXQgc3RhdGUpXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXNlbmQtZm9ybScpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1zZW5kLXN0YXR1cy1zZWN0aW9uJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIC8vIFNob3cgc2NyZWVuXHJcbiAgc2hvd1NjcmVlbignc2NyZWVuLXRva2VuLWRldGFpbHMnKTtcclxuXHJcbiAgLy8gUG9wdWxhdGUgZ2FzIHByaWNlcyBhbmQgbm9uY2VcclxuICBjb25zdCBuZXR3b3JrU3ltYm9scyA9IHtcclxuICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICd0UExTJyxcclxuICAgICdwdWxzZWNoYWluJzogJ1BMUycsXHJcbiAgICAnZXRoZXJldW0nOiAnRVRIJyxcclxuICAgICdzZXBvbGlhJzogJ1NFUCdcclxuICB9O1xyXG4gIGNvbnN0IG5ldHdvcmtTeW1ib2wgPSBuZXR3b3JrU3ltYm9sc1tuZXR3b3JrXSB8fCAnVE9LRU4nO1xyXG5cclxuICAvLyBDcmVhdGUgYSB0b2tlbiB0cmFuc2ZlciB0cmFuc2FjdGlvbiBmb3IgZ2FzIGVzdGltYXRpb25cclxuICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICBjb25zdCB0b2tlbkNvbnRyYWN0ID0gbmV3IGV0aGVycy5Db250cmFjdChcclxuICAgIHRva2VuRGF0YS5hZGRyZXNzLFxyXG4gICAgWydmdW5jdGlvbiB0cmFuc2ZlcihhZGRyZXNzIHRvLCB1aW50MjU2IGFtb3VudCkgcmV0dXJucyAoYm9vbCknXSxcclxuICAgIHByb3ZpZGVyXHJcbiAgKTtcclxuICBjb25zdCBkdW1teUFtb3VudCA9IGV0aGVycy5wYXJzZVVuaXRzKCcxJywgdG9rZW5EYXRhLmRlY2ltYWxzKTtcclxuICBjb25zdCB0eFJlcXVlc3QgPSB7XHJcbiAgICBmcm9tOiBjdXJyZW50U3RhdGUuYWRkcmVzcyxcclxuICAgIHRvOiB0b2tlbkRhdGEuYWRkcmVzcyxcclxuICAgIGRhdGE6IHRva2VuQ29udHJhY3QuaW50ZXJmYWNlLmVuY29kZUZ1bmN0aW9uRGF0YSgndHJhbnNmZXInLCBbY3VycmVudFN0YXRlLmFkZHJlc3MsIGR1bW15QW1vdW50XSlcclxuICB9O1xyXG5cclxuICBhd2FpdCBwb3B1bGF0ZVRva2VuR2FzUHJpY2VzKG5ldHdvcmssIHR4UmVxdWVzdCwgbmV0d29ya1N5bWJvbCk7XHJcblxyXG4gIC8vIEZldGNoIGFuZCBkaXNwbGF5IG5vbmNlXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5vbmNlSGV4ID0gYXdhaXQgcnBjLmdldFRyYW5zYWN0aW9uQ291bnQobmV0d29yaywgY3VycmVudFN0YXRlLmFkZHJlc3MsICdwZW5kaW5nJyk7XHJcbiAgICBjb25zdCBub25jZSA9IHBhcnNlSW50KG5vbmNlSGV4LCAxNik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tY3VycmVudC1ub25jZScpLnRleHRDb250ZW50ID0gbm9uY2U7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIG5vbmNlOicsIGVycm9yKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1jdXJyZW50LW5vbmNlJykudGV4dENvbnRlbnQgPSAnRXJyb3InO1xyXG4gIH1cclxuXHJcbiAgLy8gU2V0dXAgY3VzdG9tIG5vbmNlIGNoZWNrYm94XHJcbiAgY29uc3QgY3VzdG9tTm9uY2VDaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1jdXN0b20tbm9uY2UtY2hlY2tib3gnKTtcclxuICBjb25zdCBjdXN0b21Ob25jZUNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1jdXN0b20tbm9uY2UtaW5wdXQtY29udGFpbmVyJyk7XHJcbiAgY3VzdG9tTm9uY2VDaGVja2JveC5jaGVja2VkID0gZmFsc2U7XHJcbiAgY3VzdG9tTm9uY2VDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIC8vIFJlbW92ZSBvbGQgbGlzdGVuZXIgaWYgZXhpc3RzIGFuZCBhZGQgbmV3IG9uZVxyXG4gIGNvbnN0IG5ld0NoZWNrYm94ID0gY3VzdG9tTm9uY2VDaGVja2JveC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgY3VzdG9tTm9uY2VDaGVja2JveC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdDaGVja2JveCwgY3VzdG9tTm9uY2VDaGVja2JveCk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1jdXN0b20tbm9uY2UtY2hlY2tib3gnKS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgaWYgKGUudGFyZ2V0LmNoZWNrZWQpIHtcclxuICAgICAgY3VzdG9tTm9uY2VDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnROb25jZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1jdXJyZW50LW5vbmNlJykudGV4dENvbnRlbnQ7XHJcbiAgICAgIGlmIChjdXJyZW50Tm9uY2UgIT09ICctLScgJiYgY3VycmVudE5vbmNlICE9PSAnRXJyb3InKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1c3RvbS1ub25jZScpLnZhbHVlID0gY3VycmVudE5vbmNlO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjdXN0b21Ob25jZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQ29weVRva2VuRGV0YWlsc0FkZHJlc3MoKSB7XHJcbiAgY29uc3QgdG9rZW5EYXRhID0gY3VycmVudFN0YXRlLmN1cnJlbnRUb2tlbkRldGFpbHM7XHJcbiAgaWYgKCF0b2tlbkRhdGEpIHJldHVybjtcclxuXHJcbiAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodG9rZW5EYXRhLmFkZHJlc3MpLnRoZW4oKCkgPT4ge1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtY29weS1hZGRyZXNzJyk7XHJcbiAgICBjb25zdCBvcmlnaW5hbFRleHQgPSBidG4uaW5uZXJIVE1MO1xyXG4gICAgYnRuLmlubmVySFRNTCA9ICc8c3Bhbj7inJM8L3NwYW4+PHNwYW4+Q29waWVkITwvc3Bhbj4nO1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGJ0bi5pbm5lckhUTUwgPSBvcmlnaW5hbFRleHQ7XHJcbiAgICB9LCAyMDAwKTtcclxuICB9KTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVG9rZW5TZW5kTWF4KCkge1xyXG4gIGNvbnN0IHRva2VuRGF0YSA9IGN1cnJlbnRTdGF0ZS5jdXJyZW50VG9rZW5EZXRhaWxzO1xyXG4gIGlmICghdG9rZW5EYXRhKSByZXR1cm47XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBiYWxhbmNlV2VpID0gYXdhaXQgZXJjMjAuZ2V0VG9rZW5CYWxhbmNlKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCB0b2tlbkRhdGEuYWRkcmVzcywgY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgY29uc3QgYmFsYW5jZUZvcm1hdHRlZCA9IGVyYzIwLmZvcm1hdFRva2VuQmFsYW5jZShiYWxhbmNlV2VpLCB0b2tlbkRhdGEuZGVjaW1hbHMsIDE4KTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWFtb3VudCcpLnZhbHVlID0gYmFsYW5jZUZvcm1hdHRlZDtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBtYXggYmFsYW5jZTonLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUb2tlblNlbmQoKSB7XHJcbiAgY29uc3QgdG9rZW5EYXRhID0gY3VycmVudFN0YXRlLmN1cnJlbnRUb2tlbkRldGFpbHM7XHJcbiAgaWYgKCF0b2tlbkRhdGEpIHJldHVybjtcclxuXHJcbiAgY29uc3QgcmVjaXBpZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtcmVjaXBpZW50JykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IGFtb3VudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWFtb3VudCcpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXBhc3N3b3JkJykudmFsdWU7XHJcbiAgY29uc3QgZXJyb3JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXNlbmQtZXJyb3InKTtcclxuXHJcbiAgLy8gQ2xlYXIgcHJldmlvdXMgZXJyb3JzXHJcbiAgZXJyb3JFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gVmFsaWRhdGUgaW5wdXRzXHJcbiAgaWYgKCFyZWNpcGllbnQgfHwgIWFtb3VudCB8fCAhcGFzc3dvcmQpIHtcclxuICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSAnUGxlYXNlIGZpbGwgYWxsIGZpZWxkcyc7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaWYgKCFyZWNpcGllbnQuc3RhcnRzV2l0aCgnMHgnKSB8fCByZWNpcGllbnQubGVuZ3RoICE9PSA0Mikge1xyXG4gICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdJbnZhbGlkIHJlY2lwaWVudCBhZGRyZXNzJztcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgLy8gRGlzYWJsZSBzZW5kIGJ1dHRvbiB0byBwcmV2ZW50IGRvdWJsZS1jbGlja2luZ1xyXG4gICAgY29uc3Qgc2VuZEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdG9rZW4tc2VuZCcpO1xyXG4gICAgc2VuZEJ0bi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICBzZW5kQnRuLnN0eWxlLm9wYWNpdHkgPSAnMC41JztcclxuICAgIHNlbmRCdG4uc3R5bGUuY3Vyc29yID0gJ25vdC1hbGxvd2VkJztcclxuXHJcbiAgICBjb25zdCBhbW91bnRCTiA9IGV0aGVycy5wYXJzZVVuaXRzKGFtb3VudCwgdG9rZW5EYXRhLmRlY2ltYWxzKTtcclxuXHJcbiAgICAvLyBDaGVjayBiYWxhbmNlXHJcbiAgICBjb25zdCBiYWxhbmNlV2VpID0gYXdhaXQgZXJjMjAuZ2V0VG9rZW5CYWxhbmNlKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCB0b2tlbkRhdGEuYWRkcmVzcywgY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgaWYgKGFtb3VudEJOID4gYmFsYW5jZVdlaSkge1xyXG4gICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ0luc3VmZmljaWVudCBiYWxhbmNlJztcclxuICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgLy8gUmUtZW5hYmxlIGJ1dHRvbiBvbiB2YWxpZGF0aW9uIGVycm9yXHJcbiAgICAgIHNlbmRCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgc2VuZEJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICBzZW5kQnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVubG9jayB3YWxsZXQgd2l0aCBwYXNzd29yZCBhbmQgYXV0by11cGdyYWRlIGlmIG5lZWRlZFxyXG4gICAgbGV0IHNpZ25lcjtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHVubG9ja1Jlc3VsdCA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICAgIG9uVXBncmFkZVN0YXJ0OiAoaW5mbykgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coYPCflJAgQXV0by11cGdyYWRpbmcgd2FsbGV0OiAke2luZm8uY3VycmVudEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aW5mby5yZWNvbW1lbmRlZEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBzaWduZXIgPSB1bmxvY2tSZXN1bHQuc2lnbmVyO1xyXG5cclxuICAgICAgaWYgKHVubG9ja1Jlc3VsdC51cGdyYWRlZCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGDinIUgV2FsbGV0IHVwZ3JhZGVkOiAke3VubG9ja1Jlc3VsdC5pdGVyYXRpb25zQmVmb3JlLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke3VubG9ja1Jlc3VsdC5pdGVyYXRpb25zQWZ0ZXIudG9Mb2NhbGVTdHJpbmcoKX1gKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSBlcnIubWVzc2FnZSB8fCAnSW5jb3JyZWN0IHBhc3N3b3JkJztcclxuICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgLy8gUmUtZW5hYmxlIGJ1dHRvbiBvbiBwYXNzd29yZCBlcnJvclxyXG4gICAgICBzZW5kQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgIHNlbmRCdG4uc3R5bGUub3BhY2l0eSA9ICcxJztcclxuICAgICAgc2VuZEJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgc2VsZWN0ZWQgZ2FzIHByaWNlXHJcbiAgICBjb25zdCBnYXNQcmljZSA9IGdldFNlbGVjdGVkVG9rZW5HYXNQcmljZSgpO1xyXG5cclxuICAgIC8vIEdldCBjdXN0b20gbm9uY2UgaWYgcHJvdmlkZWRcclxuICAgIGNvbnN0IGN1c3RvbU5vbmNlQ2hlY2tib3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tY3VzdG9tLW5vbmNlLWNoZWNrYm94Jyk7XHJcbiAgICBjb25zdCBjdXN0b21Ob25jZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1c3RvbS1ub25jZScpO1xyXG4gICAgbGV0IGN1c3RvbU5vbmNlID0gbnVsbDtcclxuICAgIGlmIChjdXN0b21Ob25jZUNoZWNrYm94LmNoZWNrZWQgJiYgY3VzdG9tTm9uY2VJbnB1dC52YWx1ZSkge1xyXG4gICAgICBjdXN0b21Ob25jZSA9IHBhcnNlSW50KGN1c3RvbU5vbmNlSW5wdXQudmFsdWUpO1xyXG4gICAgICBpZiAoaXNOYU4oY3VzdG9tTm9uY2UpIHx8IGN1c3RvbU5vbmNlIDwgMCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjdXN0b20gbm9uY2UnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCBwcm92aWRlciB3aXRoIGF1dG9tYXRpYyBmYWlsb3ZlciBhbmQgY29ubmVjdCBzaWduZXJcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKGN1cnJlbnRTdGF0ZS5uZXR3b3JrKTtcclxuICAgIGNvbnN0IGNvbm5lY3RlZFNpZ25lciA9IHNpZ25lci5jb25uZWN0KHByb3ZpZGVyKTtcclxuXHJcbiAgICAvLyBTZW5kIHRva2VuIHdpdGggZ2FzIG9wdGlvbnNcclxuICAgIGNvbnN0IHRva2VuQ29udHJhY3QgPSBuZXcgZXRoZXJzLkNvbnRyYWN0KFxyXG4gICAgICB0b2tlbkRhdGEuYWRkcmVzcyxcclxuICAgICAgWydmdW5jdGlvbiB0cmFuc2ZlcihhZGRyZXNzIHRvLCB1aW50MjU2IGFtb3VudCkgcmV0dXJucyAoYm9vbCknXSxcclxuICAgICAgY29ubmVjdGVkU2lnbmVyXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHR4T3B0aW9ucyA9IHt9O1xyXG4gICAgaWYgKGdhc1ByaWNlKSB7XHJcbiAgICAgIHR4T3B0aW9ucy5nYXNQcmljZSA9IGdhc1ByaWNlO1xyXG4gICAgfVxyXG4gICAgaWYgKGN1c3RvbU5vbmNlICE9PSBudWxsKSB7XHJcbiAgICAgIHR4T3B0aW9ucy5ub25jZSA9IGN1c3RvbU5vbmNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgdG9rZW5Db250cmFjdC50cmFuc2ZlcihyZWNpcGllbnQsIGFtb3VudEJOLCB0eE9wdGlvbnMpO1xyXG5cclxuICAgIC8vIFNhdmUgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeSBhbmQgc3RhcnQgbW9uaXRvcmluZ1xyXG4gICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnU0FWRV9BTkRfTU9OSVRPUl9UWCcsXHJcbiAgICAgIGFkZHJlc3M6IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLFxyXG4gICAgICB0cmFuc2FjdGlvbjoge1xyXG4gICAgICAgIGhhc2g6IHR4Lmhhc2gsXHJcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICAgIGZyb206IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLFxyXG4gICAgICAgIHRvOiByZWNpcGllbnQsXHJcbiAgICAgICAgdmFsdWU6ICcwJyxcclxuICAgICAgICBnYXNQcmljZTogZ2FzUHJpY2UgfHwgKGF3YWl0IHR4LnByb3ZpZGVyLmdldEZlZURhdGEoKSkuZ2FzUHJpY2UudG9TdHJpbmcoKSxcclxuICAgICAgICBub25jZTogdHgubm9uY2UsXHJcbiAgICAgICAgbmV0d29yazogY3VycmVudFN0YXRlLm5ldHdvcmssXHJcbiAgICAgICAgc3RhdHVzOiAncGVuZGluZycsXHJcbiAgICAgICAgYmxvY2tOdW1iZXI6IG51bGwsXHJcbiAgICAgICAgdHlwZTogJ3Rva2VuJ1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTZW5kIGRlc2t0b3Agbm90aWZpY2F0aW9uXHJcbiAgICBpZiAoY2hyb21lLm5vdGlmaWNhdGlvbnMpIHtcclxuICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gU2VudCcsXHJcbiAgICAgICAgbWVzc2FnZTogYFNlbmRpbmcgJHthbW91bnR9ICR7dG9rZW5EYXRhLnN5bWJvbH0gdG8gJHtyZWNpcGllbnQuc2xpY2UoMCwgMTApfS4uLmAsXHJcbiAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2hvdyB0cmFuc2FjdGlvbiBzdGF0dXMgc2NyZWVuXHJcbiAgICBhd2FpdCBzaG93VG9rZW5TZW5kVHJhbnNhY3Rpb25TdGF0dXModHguaGFzaCwgY3VycmVudFN0YXRlLm5ldHdvcmssIGFtb3VudCwgdG9rZW5EYXRhLnN5bWJvbCk7XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzZW5kaW5nIHRva2VuOicsIGVycm9yKTtcclxuICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlIHx8ICdUcmFuc2FjdGlvbiBmYWlsZWQnO1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuXHJcbiAgICAvLyBSZS1lbmFibGUgc2VuZCBidXR0b24gb24gZXJyb3JcclxuICAgIGNvbnN0IHNlbmRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXRva2VuLXNlbmQnKTtcclxuICAgIHNlbmRCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIHNlbmRCdG4uc3R5bGUub3BhY2l0eSA9ICcxJztcclxuICAgIHNlbmRCdG4uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVG9rZW5FbmFibGVUb2dnbGUoZSkge1xyXG4gIGNvbnN0IHRva2VuRGF0YSA9IGN1cnJlbnRTdGF0ZS5jdXJyZW50VG9rZW5EZXRhaWxzO1xyXG4gIGlmICghdG9rZW5EYXRhIHx8ICF0b2tlbkRhdGEuaXNEZWZhdWx0KSByZXR1cm47XHJcblxyXG4gIGNvbnN0IGlzRW5hYmxlZCA9IGUudGFyZ2V0LmNoZWNrZWQ7XHJcbiAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1lbmFibGUtbGFiZWwnKTtcclxuXHJcbiAgLy8gVXBkYXRlIGxhYmVsXHJcbiAgbGFiZWwudGV4dENvbnRlbnQgPSBpc0VuYWJsZWQgPyAnRW5hYmxlZCcgOiAnRGlzYWJsZWQnO1xyXG5cclxuICAvLyBTYXZlIHRvIHN0b3JhZ2VcclxuICBhd2FpdCB0b2tlbnMudG9nZ2xlRGVmYXVsdFRva2VuKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCB0b2tlbkRhdGEuc3ltYm9sLCBpc0VuYWJsZWQpO1xyXG5cclxuICAvLyBOb3RlOiBXZSBkb24ndCByZS1yZW5kZXIgdGhlIHRva2VucyBzY3JlZW4gaGVyZSB0byBhdm9pZCBsZWF2aW5nIHRoZSBkZXRhaWxzIHBhZ2VcclxuICAvLyBUaGUgY2hhbmdlIHdpbGwgYmUgcmVmbGVjdGVkIHdoZW4gdGhlIHVzZXIgZ29lcyBiYWNrIHRvIHRoZSB0b2tlbnMgc2NyZWVuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNob3dBZGRUb2tlbk1vZGFsKCkge1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC10b2tlbi1hZGRyZXNzJykudmFsdWUgPSAnJztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tcHJldmlldycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtdG9rZW4tZXJyb3InKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYWRkLXRva2VuJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbn1cclxuXHJcbmxldCB0b2tlblZhbGlkYXRpb25UaW1lb3V0O1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUb2tlbkFkZHJlc3NJbnB1dChlKSB7XHJcbiAgY29uc3QgYWRkcmVzcyA9IGUudGFyZ2V0LnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCBwcmV2aWV3RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tcHJldmlldycpO1xyXG4gIGNvbnN0IGVycm9yRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkLXRva2VuLWVycm9yJyk7XHJcblxyXG4gIC8vIENsZWFyIHByZXZpb3VzIHRpbWVvdXRcclxuICBpZiAodG9rZW5WYWxpZGF0aW9uVGltZW91dCkge1xyXG4gICAgY2xlYXJUaW1lb3V0KHRva2VuVmFsaWRhdGlvblRpbWVvdXQpO1xyXG4gIH1cclxuXHJcbiAgLy8gSGlkZSBwcmV2aWV3IGFuZCBlcnJvclxyXG4gIHByZXZpZXdFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICBlcnJvckVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAvLyBCYXNpYyB2YWxpZGF0aW9uXHJcbiAgaWYgKCFhZGRyZXNzIHx8IGFkZHJlc3MubGVuZ3RoICE9PSA0MiB8fCAhYWRkcmVzcy5zdGFydHNXaXRoKCcweCcpKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBEZWJvdW5jZSB0aGUgdmFsaWRhdGlvblxyXG4gIHRva2VuVmFsaWRhdGlvblRpbWVvdXQgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IG5ldHdvcmsgPSBjdXJyZW50U3RhdGUubmV0d29yaztcclxuICAgICAgY29uc3QgbWV0YWRhdGEgPSBhd2FpdCBlcmMyMC5nZXRUb2tlbk1ldGFkYXRhKG5ldHdvcmssIGFkZHJlc3MpO1xyXG5cclxuICAgICAgLy8gU2hvdyBwcmV2aWV3XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1wcmV2aWV3LW5hbWUnKS50ZXh0Q29udGVudCA9IG1ldGFkYXRhLm5hbWU7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1wcmV2aWV3LXN5bWJvbCcpLnRleHRDb250ZW50ID0gbWV0YWRhdGEuc3ltYm9sO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tcHJldmlldy1kZWNpbWFscycpLnRleHRDb250ZW50ID0gbWV0YWRhdGEuZGVjaW1hbHM7XHJcbiAgICAgIHByZXZpZXdFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSAnSW52YWxpZCB0b2tlbiBjb250cmFjdCc7XHJcbiAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICB9XHJcbiAgfSwgNTAwKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQWRkQ3VzdG9tVG9rZW4oKSB7XHJcbiAgY29uc3QgYWRkcmVzcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC10b2tlbi1hZGRyZXNzJykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IGVycm9yRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkLXRva2VuLWVycm9yJyk7XHJcblxyXG4gIGlmICghYWRkcmVzcykge1xyXG4gICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdQbGVhc2UgZW50ZXIgYSB0b2tlbiBhZGRyZXNzJztcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGF3YWl0IHRva2Vucy5hZGRDdXN0b21Ub2tlbihjdXJyZW50U3RhdGUubmV0d29yaywgYWRkcmVzcyk7XHJcblxyXG4gICAgLy8gQ2xvc2UgbW9kYWwgYW5kIHJlZnJlc2ggc2NyZWVuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYWRkLXRva2VuJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBhd2FpdCByZW5kZXJUb2tlbnNTY3JlZW4oKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gU0VUVElOR1MgPT09PT1cclxuZnVuY3Rpb24gbG9hZFNldHRpbmdzVG9VSSgpIHtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0dGluZy1hdXRvbG9jaycpLnZhbHVlID0gY3VycmVudFN0YXRlLnNldHRpbmdzLmF1dG9Mb2NrTWludXRlcztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0dGluZy1kZWNpbWFscycpLnZhbHVlID0gY3VycmVudFN0YXRlLnNldHRpbmdzLmRlY2ltYWxQbGFjZXM7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctdGhlbWUnKS52YWx1ZSA9IGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy50aGVtZTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0dGluZy1zaG93LXRlc3RuZXRzJykuY2hlY2tlZCA9IGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5zaG93VGVzdE5ldHdvcmtzO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLW1heC1nYXMtcHJpY2UnKS52YWx1ZSA9IGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5tYXhHYXNQcmljZUd3ZWkgfHwgMTAwMDtcclxufVxyXG5cclxuLy8gTmV0d29yayBTZXR0aW5nc1xyXG5jb25zdCBORVRXT1JLX0tFWVMgPSBbJ3B1bHNlY2hhaW5UZXN0bmV0JywgJ3B1bHNlY2hhaW4nLCAnZXRoZXJldW0nLCAnc2Vwb2xpYSddO1xyXG5cclxuZnVuY3Rpb24gbG9hZE5ldHdvcmtTZXR0aW5nc1RvVUkoKSB7XHJcbiAgTkVUV09SS19LRVlTLmZvckVhY2gobmV0d29yayA9PiB7XHJcbiAgICAvLyBMb2FkIFJQQyBlbmRwb2ludFxyXG4gICAgY29uc3QgcnBjSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgcnBjLSR7bmV0d29ya31gKTtcclxuICAgIGlmIChycGNJbnB1dCkge1xyXG4gICAgICBycGNJbnB1dC52YWx1ZSA9IGN1cnJlbnRTdGF0ZS5uZXR3b3JrU2V0dGluZ3M/LltuZXR3b3JrXT8ucnBjIHx8ICcnO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExvYWQgRXhwbG9yZXIgc2V0dGluZ3NcclxuICAgIGNvbnN0IGV4cGxvcmVySW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgZXhwbG9yZXItJHtuZXR3b3JrfWApO1xyXG4gICAgaWYgKGV4cGxvcmVySW5wdXQpIHtcclxuICAgICAgZXhwbG9yZXJJbnB1dC52YWx1ZSA9IGN1cnJlbnRTdGF0ZS5uZXR3b3JrU2V0dGluZ3M/LltuZXR3b3JrXT8uZXhwbG9yZXJCYXNlIHx8ICcnO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHR4UGF0aElucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGV4cGxvcmVyLXR4LSR7bmV0d29ya31gKTtcclxuICAgIGlmICh0eFBhdGhJbnB1dCkge1xyXG4gICAgICB0eFBhdGhJbnB1dC52YWx1ZSA9IGN1cnJlbnRTdGF0ZS5uZXR3b3JrU2V0dGluZ3M/LltuZXR3b3JrXT8uZXhwbG9yZXJUeFBhdGggfHwgJyc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYWRkclBhdGhJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBleHBsb3Jlci1hZGRyLSR7bmV0d29ya31gKTtcclxuICAgIGlmIChhZGRyUGF0aElucHV0KSB7XHJcbiAgICAgIGFkZHJQYXRoSW5wdXQudmFsdWUgPSBjdXJyZW50U3RhdGUubmV0d29ya1NldHRpbmdzPy5bbmV0d29ya10/LmV4cGxvcmVyQWRkclBhdGggfHwgJyc7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVOZXR3b3JrU2V0dGluZ3MoKSB7XHJcbiAgY29uc3QgbmV0d29ya1NldHRpbmdzID0ge307XHJcblxyXG4gIE5FVFdPUktfS0VZUy5mb3JFYWNoKG5ldHdvcmsgPT4ge1xyXG4gICAgbmV0d29ya1NldHRpbmdzW25ldHdvcmtdID0ge1xyXG4gICAgICBycGM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBycGMtJHtuZXR3b3JrfWApPy52YWx1ZSB8fCAnJyxcclxuICAgICAgZXhwbG9yZXJCYXNlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgZXhwbG9yZXItJHtuZXR3b3JrfWApPy52YWx1ZSB8fCAnJyxcclxuICAgICAgZXhwbG9yZXJUeFBhdGg6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBleHBsb3Jlci10eC0ke25ldHdvcmt9YCk/LnZhbHVlIHx8ICcnLFxyXG4gICAgICBleHBsb3JlckFkZHJQYXRoOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgZXhwbG9yZXItYWRkci0ke25ldHdvcmt9YCk/LnZhbHVlIHx8ICcnXHJcbiAgICB9O1xyXG4gIH0pO1xyXG5cclxuICBhd2FpdCBzYXZlKCduZXR3b3JrU2V0dGluZ3MnLCBuZXR3b3JrU2V0dGluZ3MpO1xyXG4gIGN1cnJlbnRTdGF0ZS5uZXR3b3JrU2V0dGluZ3MgPSBuZXR3b3JrU2V0dGluZ3M7XHJcblxyXG4gIC8vIFVwZGF0ZSBydW50aW1lIHNldHRpbmdzXHJcbiAgYXBwbHlOZXR3b3JrU2V0dGluZ3MoKTtcclxuXHJcbiAgYWxlcnQoJ05ldHdvcmsgc2V0dGluZ3Mgc2F2ZWQhIENoYW5nZXMgd2lsbCB0YWtlIGVmZmVjdCBvbiBuZXh0IHJlbG9hZC4nKTtcclxuICBzaG93U2NyZWVuKCdzY3JlZW4tc2V0dGluZ3MnKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVzZXROZXR3b3JrU2V0dGluZ3NUb0RlZmF1bHRzKCkge1xyXG4gIE5FVFdPUktfS0VZUy5mb3JFYWNoKG5ldHdvcmsgPT4ge1xyXG4gICAgLy8gUmVzZXQgdG8gZGVmYXVsdCBSUEMgZW5kcG9pbnRzIGZyb20gcnBjLmpzXHJcbiAgICBjb25zdCBkZWZhdWx0UlBDcyA9IHtcclxuICAgICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ2h0dHBzOi8vcnBjLnY0LnRlc3RuZXQucHVsc2VjaGFpbi5jb20nLFxyXG4gICAgICAncHVsc2VjaGFpbic6ICdodHRwczovL3JwYy5wdWxzZWNoYWluLmNvbScsXHJcbiAgICAgICdldGhlcmV1bSc6ICdodHRwczovL2V0aC5sbGFtYXJwYy5jb20nLFxyXG4gICAgICAnc2Vwb2xpYSc6ICdodHRwczovL3JwYy5zZXBvbGlhLm9yZydcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgZGVmYXVsdEV4cGxvcmVycyA9IHtcclxuICAgICAgJ3B1bHNlY2hhaW5UZXN0bmV0Jzoge1xyXG4gICAgICAgIGJhc2U6ICdodHRwczovL3NjYW4udjQudGVzdG5ldC5wdWxzZWNoYWluLmNvbScsXHJcbiAgICAgICAgdHg6ICcvdHgve2hhc2h9JyxcclxuICAgICAgICBhZGRyOiAnL2FkZHJlc3Mve2FkZHJlc3N9J1xyXG4gICAgICB9LFxyXG4gICAgICAncHVsc2VjaGFpbic6IHtcclxuICAgICAgICBiYXNlOiAnaHR0cHM6Ly9zY2FuLm15cGluYXRhLmNsb3VkL2lwZnMvYmFmeWJlaWVueHlveXJobjV0c3djbHZkM2dkank1bXRra3dtdTM3YXF0bWw2b25iZjd4bmIzbzIycGUvJyxcclxuICAgICAgICB0eDogJyMvdHgve2hhc2h9JyxcclxuICAgICAgICBhZGRyOiAnIy9hZGRyZXNzL3thZGRyZXNzfSdcclxuICAgICAgfSxcclxuICAgICAgJ2V0aGVyZXVtJzoge1xyXG4gICAgICAgIGJhc2U6ICdodHRwczovL2V0aGVyc2Nhbi5pbycsXHJcbiAgICAgICAgdHg6ICcvdHgve2hhc2h9JyxcclxuICAgICAgICBhZGRyOiAnL2FkZHJlc3Mve2FkZHJlc3N9J1xyXG4gICAgICB9LFxyXG4gICAgICAnc2Vwb2xpYSc6IHtcclxuICAgICAgICBiYXNlOiAnaHR0cHM6Ly9zZXBvbGlhLmV0aGVyc2Nhbi5pbycsXHJcbiAgICAgICAgdHg6ICcvdHgve2hhc2h9JyxcclxuICAgICAgICBhZGRyOiAnL2FkZHJlc3Mve2FkZHJlc3N9J1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBycGMtJHtuZXR3b3JrfWApLnZhbHVlID0gZGVmYXVsdFJQQ3NbbmV0d29ya10gfHwgJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgZXhwbG9yZXItJHtuZXR3b3JrfWApLnZhbHVlID0gZGVmYXVsdEV4cGxvcmVyc1tuZXR3b3JrXT8uYmFzZSB8fCAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBleHBsb3Jlci10eC0ke25ldHdvcmt9YCkudmFsdWUgPSBkZWZhdWx0RXhwbG9yZXJzW25ldHdvcmtdPy50eCB8fCAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBleHBsb3Jlci1hZGRyLSR7bmV0d29ya31gKS52YWx1ZSA9IGRlZmF1bHRFeHBsb3JlcnNbbmV0d29ya10/LmFkZHIgfHwgJyc7XHJcbiAgfSk7XHJcblxyXG4gIGFsZXJ0KCdOZXR3b3JrIHNldHRpbmdzIHJlc2V0IHRvIGRlZmF1bHRzLiBDbGljayBTQVZFIHRvIGFwcGx5LicpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhcHBseU5ldHdvcmtTZXR0aW5ncygpIHtcclxuICAvLyBUaGlzIHdvdWxkIHVwZGF0ZSB0aGUgcnVudGltZSBSUEMgYW5kIGV4cGxvcmVyIGNvbmZpZ3NcclxuICAvLyBGb3Igbm93LCBzZXR0aW5ncyB0YWtlIGVmZmVjdCBvbiByZWxvYWRcclxufVxyXG5cclxuLy8gPT09PT0gUEFTU1dPUkQgUFJPTVBUIE1PREFMID09PT09XHJcbmxldCBwYXNzd29yZFByb21wdFJlc29sdmUgPSBudWxsO1xyXG5cclxuZnVuY3Rpb24gc2hvd1Bhc3N3b3JkUHJvbXB0KHRpdGxlLCBtZXNzYWdlKSB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICBwYXNzd29yZFByb21wdFJlc29sdmUgPSByZXNvbHZlO1xyXG5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1wcm9tcHQtdGl0bGUnKS50ZXh0Q29udGVudCA9IHRpdGxlO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1tZXNzYWdlJykudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1pbnB1dCcpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtcHJvbXB0LWVycm9yJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtcGFzc3dvcmQtcHJvbXB0JykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcblxyXG4gICAgLy8gRm9jdXMgdGhlIGlucHV0XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1pbnB1dCcpPy5mb2N1cygpO1xyXG4gICAgfSwgMTAwKTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xvc2VQYXNzd29yZFByb21wdChwYXNzd29yZCA9IG51bGwpIHtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtcGFzc3dvcmQtcHJvbXB0JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgaWYgKHBhc3N3b3JkUHJvbXB0UmVzb2x2ZSkge1xyXG4gICAgcGFzc3dvcmRQcm9tcHRSZXNvbHZlKHBhc3N3b3JkKTtcclxuICAgIHBhc3N3b3JkUHJvbXB0UmVzb2x2ZSA9IG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBESVNQTEFZIFNFQ1JFVCBNT0RBTCA9PT09PVxyXG5mdW5jdGlvbiBzaG93U2VjcmV0TW9kYWwodGl0bGUsIHNlY3JldCkge1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXNwbGF5LXNlY3JldC10aXRsZScpLnRleHRDb250ZW50ID0gdGl0bGU7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpc3BsYXktc2VjcmV0LWNvbnRlbnQnKS50ZXh0Q29udGVudCA9IHNlY3JldDtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtZGlzcGxheS1zZWNyZXQnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xvc2VTZWNyZXRNb2RhbCgpIHtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtZGlzcGxheS1zZWNyZXQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGlzcGxheS1zZWNyZXQtY29udGVudCcpLnRleHRDb250ZW50ID0gJyc7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVZpZXdTZWVkKCkge1xyXG4gIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgc2hvd1Bhc3N3b3JkUHJvbXB0KCdWaWV3IFNlZWQgUGhyYXNlJywgJ0VudGVyIHlvdXIgcGFzc3dvcmQgdG8gdmlldyB5b3VyIHNlZWQgcGhyYXNlJyk7XHJcbiAgaWYgKCFwYXNzd29yZCkgcmV0dXJuO1xyXG5cclxuICBjb25zdCBlcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1wcm9tcHQtZXJyb3InKTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG1uZW1vbmljID0gYXdhaXQgZXhwb3J0TW5lbW9uaWMocGFzc3dvcmQpO1xyXG4gICAgY2xvc2VQYXNzd29yZFByb21wdCgpO1xyXG5cclxuICAgIGlmIChtbmVtb25pYykge1xyXG4gICAgICBzaG93U2VjcmV0TW9kYWwoJ1lvdXIgU2VlZCBQaHJhc2UnLCBtbmVtb25pYyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhbGVydCgnVGhpcyB3YWxsZXQgd2FzIGltcG9ydGVkIHVzaW5nIGEgcHJpdmF0ZSBrZXkgYW5kIGhhcyBubyBzZWVkIHBocmFzZS4nKTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVFeHBvcnRLZXkoKSB7XHJcbiAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ0V4cG9ydCBQcml2YXRlIEtleScsICdFbnRlciB5b3VyIHBhc3N3b3JkIHRvIGV4cG9ydCB5b3VyIHByaXZhdGUga2V5Jyk7XHJcbiAgaWYgKCFwYXNzd29yZCkgcmV0dXJuO1xyXG5cclxuICBjb25zdCBlcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1wcm9tcHQtZXJyb3InKTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHByaXZhdGVLZXkgPSBhd2FpdCBleHBvcnRQcml2YXRlS2V5KHBhc3N3b3JkKTtcclxuICAgIGNsb3NlUGFzc3dvcmRQcm9tcHQoKTtcclxuICAgIHNob3dTZWNyZXRNb2RhbCgnWW91ciBQcml2YXRlIEtleScsIHByaXZhdGVLZXkpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcbn1cclxuXHJcblxyXG4vLyA9PT09PSBNVUxUSS1XQUxMRVQgTUFOQUdFTUVOVCA9PT09PVxyXG5sZXQgY3VycmVudFJlbmFtZVdhbGxldElkID0gbnVsbDtcclxubGV0IGdlbmVyYXRlZE1uZW1vbmljTXVsdGkgPSBudWxsO1xyXG5sZXQgdmVyaWZpY2F0aW9uV29yZHNNdWx0aSA9IFtdOyAvLyBBcnJheSBvZiB7aW5kZXgsIHdvcmR9IGZvciB2ZXJpZmljYXRpb25cclxuXHJcbi8vIFJlbmRlciB3YWxsZXQgbGlzdCBpbiBtYW5hZ2Ugd2FsbGV0cyBzY3JlZW5cclxuYXN5bmMgZnVuY3Rpb24gcmVuZGVyV2FsbGV0TGlzdCgpIHtcclxuICBjb25zdCB3YWxsZXRzRGF0YSA9IGF3YWl0IGdldEFsbFdhbGxldHMoKTtcclxuICBjb25zdCB3YWxsZXRMaXN0RGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhbGxldC1saXN0Jyk7XHJcbiAgY29uc3Qgd2FsbGV0Q291bnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2FsbGV0LWNvdW50Jyk7XHJcblxyXG4gIHdhbGxldENvdW50LnRleHRDb250ZW50ID0gd2FsbGV0c0RhdGEud2FsbGV0TGlzdC5sZW5ndGg7XHJcblxyXG4gIGlmICh3YWxsZXRzRGF0YS53YWxsZXRMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgd2FsbGV0TGlzdERpdi5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWRpbSB0ZXh0LWNlbnRlclwiPk5vIHdhbGxldHMgZm91bmQ8L3A+JztcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHdhbGxldExpc3REaXYuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gIHdhbGxldHNEYXRhLndhbGxldExpc3QuZm9yRWFjaCh3YWxsZXQgPT4ge1xyXG4gICAgY29uc3QgaXNBY3RpdmUgPSB3YWxsZXQuaWQgPT09IHdhbGxldHNEYXRhLmFjdGl2ZVdhbGxldElkO1xyXG4gICAgY29uc3Qgd2FsbGV0Q2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgd2FsbGV0Q2FyZC5jbGFzc05hbWUgPSAncGFuZWwgbWItMic7XHJcbiAgICBpZiAoaXNBY3RpdmUpIHtcclxuICAgICAgd2FsbGV0Q2FyZC5zdHlsZS5ib3JkZXJDb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1zdWNjZXNzKSc7XHJcbiAgICAgIHdhbGxldENhcmQuc3R5bGUuYm9yZGVyV2lkdGggPSAnMnB4JztcclxuICAgIH1cclxuXHJcbiAgICB3YWxsZXRDYXJkLmlubmVySFRNTCA9IGBcclxuICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7IG1hcmdpbi1ib3R0b206IDEycHg7XCI+XHJcbiAgICAgICAgPGRpdiBzdHlsZT1cImZsZXg6IDE7XCI+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC13ZWlnaHQ6IGJvbGQ7IGZvbnQtc2l6ZTogMTRweDsgbWFyZ2luLWJvdHRvbTogNHB4O1wiPlxyXG4gICAgICAgICAgICAke2lzQWN0aXZlID8gJ+KckyAnIDogJyd9JHtlc2NhcGVIdG1sKHdhbGxldC5uaWNrbmFtZSB8fCAnVW5uYW1lZCBXYWxsZXQnKX1cclxuICAgICAgICAgICAgJHtpc0FjdGl2ZSA/ICc8c3BhbiBjbGFzcz1cInRleHQtc3VjY2Vzc1wiIHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBtYXJnaW4tbGVmdDogOHB4O1wiPltBQ1RJVkVdPC9zcGFuPicgOiAnJ31cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDExcHg7IGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LW1vbm8pOyB3b3JkLWJyZWFrOiBicmVhay1hbGw7XCI+XHJcbiAgICAgICAgICAgICR7ZXNjYXBlSHRtbCh3YWxsZXQuYWRkcmVzcyB8fCAnQWRkcmVzcyBub3QgbG9hZGVkJyl9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMHB4OyBtYXJnaW4tdG9wOiA0cHg7XCI+XHJcbiAgICAgICAgICAgICR7d2FsbGV0LmltcG9ydE1ldGhvZCA9PT0gJ2NyZWF0ZScgPyAnQ3JlYXRlZCcgOiAnSW1wb3J0ZWQnfSDigKIgJHtuZXcgRGF0ZSh3YWxsZXQuY3JlYXRlZEF0KS50b0xvY2FsZURhdGVTdHJpbmcoKX1cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cImJ1dHRvbi1ncm91cFwiIHN0eWxlPVwiZ2FwOiA2cHg7XCI+XHJcbiAgICAgICAgJHshaXNBY3RpdmUgPyBgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc21hbGxcIiBkYXRhLXdhbGxldC1pZD1cIiR7d2FsbGV0LmlkfVwiIGRhdGEtYWN0aW9uPVwic3dpdGNoXCI+U1dJVENIPC9idXR0b24+YCA6ICcnfVxyXG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXNtYWxsXCIgZGF0YS13YWxsZXQtaWQ9XCIke3dhbGxldC5pZH1cIiBkYXRhLWFjdGlvbj1cInJlbmFtZVwiPlJFTkFNRTwvYnV0dG9uPlxyXG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXNtYWxsXCIgZGF0YS13YWxsZXQtaWQ9XCIke3dhbGxldC5pZH1cIiBkYXRhLWFjdGlvbj1cImV4cG9ydFwiPkVYUE9SVDwvYnV0dG9uPlxyXG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLWRhbmdlciBidG4tc21hbGxcIiBkYXRhLXdhbGxldC1pZD1cIiR7d2FsbGV0LmlkfVwiIGRhdGEtYWN0aW9uPVwiZGVsZXRlXCI+REVMRVRFPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcbiAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBidXR0b25zXHJcbiAgICBjb25zdCBidXR0b25zID0gd2FsbGV0Q2FyZC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKTtcclxuICAgIGJ1dHRvbnMuZm9yRWFjaChidG4gPT4ge1xyXG4gICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgd2FsbGV0SWQgPSBidG4uZGF0YXNldC53YWxsZXRJZDtcclxuICAgICAgICBjb25zdCBhY3Rpb24gPSBidG4uZGF0YXNldC5hY3Rpb247XHJcblxyXG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XHJcbiAgICAgICAgICBjYXNlICdzd2l0Y2gnOlxyXG4gICAgICAgICAgICBhd2FpdCBoYW5kbGVTd2l0Y2hXYWxsZXQod2FsbGV0SWQpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ3JlbmFtZSc6XHJcbiAgICAgICAgICAgIGhhbmRsZVJlbmFtZVdhbGxldFByb21wdCh3YWxsZXRJZCwgd2FsbGV0Lm5pY2tuYW1lKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdleHBvcnQnOlxyXG4gICAgICAgICAgICBhd2FpdCBoYW5kbGVFeHBvcnRGb3JXYWxsZXQod2FsbGV0SWQpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ2RlbGV0ZSc6XHJcbiAgICAgICAgICAgIGF3YWl0IGhhbmRsZURlbGV0ZVdhbGxldE11bHRpKHdhbGxldElkKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHdhbGxldExpc3REaXYuYXBwZW5kQ2hpbGQod2FsbGV0Q2FyZCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIE5hdmlnYXRlIHRvIG1hbmFnZSB3YWxsZXRzIHNjcmVlblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVNYW5hZ2VXYWxsZXRzKCkge1xyXG4gIGF3YWl0IHJlbmRlcldhbGxldExpc3QoKTtcclxuICBzaG93U2NyZWVuKCdzY3JlZW4tbWFuYWdlLXdhbGxldHMnKTtcclxufVxyXG5cclxuLy8gU2hvdyBhZGQgd2FsbGV0IG1vZGFsICh3aXRoIDMgb3B0aW9ucylcclxuZnVuY3Rpb24gc2hvd0FkZFdhbGxldE1vZGFsKCkge1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtd2FsbGV0JykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbn1cclxuXHJcbi8vIEdlbmVyYXRlIG1uZW1vbmljIGZvciBtdWx0aS13YWxsZXQgY3JlYXRpb25cclxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVOZXdNbmVtb25pY011bHRpKCkge1xyXG4gIGNvbnN0IHsgZXRoZXJzIH0gPSBhd2FpdCBpbXBvcnQoJ2V0aGVycycpO1xyXG4gIGNvbnN0IHJhbmRvbVdhbGxldCA9IGV0aGVycy5XYWxsZXQuY3JlYXRlUmFuZG9tKCk7XHJcbiAgZ2VuZXJhdGVkTW5lbW9uaWNNdWx0aSA9IHJhbmRvbVdhbGxldC5tbmVtb25pYy5waHJhc2U7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ211bHRpLW1uZW1vbmljLWRpc3BsYXknKS50ZXh0Q29udGVudCA9IGdlbmVyYXRlZE1uZW1vbmljTXVsdGk7XHJcblxyXG4gIC8vIFNldCB1cCB2ZXJpZmljYXRpb24gKGFzayBmb3IgMyByYW5kb20gd29yZHMgdXNpbmcgY3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIHJhbmRvbSlcclxuICBjb25zdCB3b3JkcyA9IGdlbmVyYXRlZE1uZW1vbmljTXVsdGkuc3BsaXQoJyAnKTtcclxuICBjb25zdCByYW5kb21CeXRlcyA9IG5ldyBVaW50OEFycmF5KDMpO1xyXG4gIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMocmFuZG9tQnl0ZXMpO1xyXG4gIGNvbnN0IGluZGljZXMgPSBbXHJcbiAgICByYW5kb21CeXRlc1swXSAlIDQsIC8vIFdvcmQgMS00XHJcbiAgICA0ICsgKHJhbmRvbUJ5dGVzWzFdICUgNCksIC8vIFdvcmQgNS04XHJcbiAgICA4ICsgKHJhbmRvbUJ5dGVzWzJdICUgNCkgLy8gV29yZCA5LTEyXHJcbiAgXTtcclxuXHJcbiAgdmVyaWZpY2F0aW9uV29yZHNNdWx0aSA9IGluZGljZXMubWFwKGkgPT4gKHsgaW5kZXg6IGksIHdvcmQ6IHdvcmRzW2ldIH0pKTtcclxuXHJcbiAgLy8gVXBkYXRlIFVJIHdpdGggcmFuZG9tIGluZGljZXNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMS1udW0tbXVsdGknKS50ZXh0Q29udGVudCA9ICh2ZXJpZmljYXRpb25Xb3Jkc011bHRpWzBdLmluZGV4ICsgMSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTItbnVtLW11bHRpJykudGV4dENvbnRlbnQgPSAodmVyaWZpY2F0aW9uV29yZHNNdWx0aVsxXS5pbmRleCArIDEpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zLW51bS1tdWx0aScpLnRleHRDb250ZW50ID0gKHZlcmlmaWNhdGlvbldvcmRzTXVsdGlbMl0uaW5kZXggKyAxKTtcclxufVxyXG5cclxuLy8gSGFuZGxlIGNyZWF0ZSBuZXcgd2FsbGV0IChtdWx0aSlcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ3JlYXRlTmV3V2FsbGV0TXVsdGkoKSB7XHJcbiAgY29uc3Qgbmlja25hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtbmV3LXdhbGxldC1uaWNrbmFtZScpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCB2ZXJpZmljYXRpb25FcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZmljYXRpb24tZXJyb3ItbXVsdGknKTtcclxuXHJcbiAgLy8gVmVyaWZ5IHNlZWQgcGhyYXNlIHdvcmRzXHJcbiAgY29uc3Qgd29yZDEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMS1tdWx0aScpLnZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IHdvcmQyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTItbXVsdGknKS52YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICBjb25zdCB3b3JkMyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zLW11bHRpJykudmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIGlmICghd29yZDEgfHwgIXdvcmQyIHx8ICF3b3JkMykge1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYudGV4dENvbnRlbnQgPSAnUGxlYXNlIGVudGVyIGFsbCB2ZXJpZmljYXRpb24gd29yZHMgdG8gY29uZmlybSB5b3UgaGF2ZSBiYWNrZWQgdXAgeW91ciBzZWVkIHBocmFzZS4nO1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBpZiAod29yZDEgIT09IHZlcmlmaWNhdGlvbldvcmRzTXVsdGlbMF0ud29yZC50b0xvd2VyQ2FzZSgpIHx8XHJcbiAgICAgIHdvcmQyICE9PSB2ZXJpZmljYXRpb25Xb3Jkc011bHRpWzFdLndvcmQudG9Mb3dlckNhc2UoKSB8fFxyXG4gICAgICB3b3JkMyAhPT0gdmVyaWZpY2F0aW9uV29yZHNNdWx0aVsyXS53b3JkLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgIHZlcmlmaWNhdGlvbkVycm9yRGl2LnRleHRDb250ZW50ID0gJ1ZlcmlmaWNhdGlvbiB3b3JkcyBkbyBub3QgbWF0Y2guIFBsZWFzZSBkb3VibGUtY2hlY2sgeW91ciBzZWVkIHBocmFzZSBiYWNrdXAuJztcclxuICAgIHZlcmlmaWNhdGlvbkVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2xlYXIgdmVyaWZpY2F0aW9uIGVycm9yXHJcbiAgdmVyaWZpY2F0aW9uRXJyb3JEaXYuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIC8vIENsb3NlIG1vZGFsIEJFRk9SRSBzaG93aW5nIHBhc3N3b3JkIHByb21wdFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1jcmVhdGUtd2FsbGV0LW11bHRpJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgc2hvd1Bhc3N3b3JkUHJvbXB0KCdFbnRlciBZb3VyIFBhc3N3b3JkJywgJ0VudGVyIHlvdXIgd2FsbGV0IHBhc3N3b3JkIHRvIGVuY3J5cHQgdGhlIG5ldyB3YWxsZXQnKTtcclxuXHJcbiAgaWYgKCFwYXNzd29yZCkge1xyXG4gICAgLy8gSWYgY2FuY2VsbGVkLCByZW9wZW4gdGhlIG1vZGFsXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtY3JlYXRlLXdhbGxldC1tdWx0aScpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IGFkZFdhbGxldCgnY3JlYXRlJywge30sIHBhc3N3b3JkLCBuaWNrbmFtZSB8fCBudWxsKTtcclxuXHJcbiAgICAvLyBDbGVhciBmb3JtXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtbmV3LXdhbGxldC1uaWNrbmFtZScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMS1tdWx0aScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMi1tdWx0aScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMy1tdWx0aScpLnZhbHVlID0gJyc7XHJcbiAgICBnZW5lcmF0ZWRNbmVtb25pY011bHRpID0gbnVsbDtcclxuICAgIHZlcmlmaWNhdGlvbldvcmRzTXVsdGkgPSBbXTtcclxuXHJcbiAgICAvLyBSZWZyZXNoIHdhbGxldCBsaXN0XHJcbiAgICBhd2FpdCByZW5kZXJXYWxsZXRMaXN0KCk7XHJcblxyXG4gICAgYWxlcnQoJ1dhbGxldCBjcmVhdGVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0Vycm9yIGNyZWF0aW5nIHdhbGxldDogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGltcG9ydCBmcm9tIHNlZWQgKG11bHRpKVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVJbXBvcnRTZWVkTXVsdGkoKSB7XHJcbiAgY29uc3Qgbmlja25hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXNlZWQtbmlja25hbWUnKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgbW5lbW9uaWMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXNlZWQtcGhyYXNlJykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IGVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1zZWVkLWVycm9yLW11bHRpJyk7XHJcblxyXG4gIGVycm9yRGl2LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICBpZiAoIW1uZW1vbmljKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9ICdQbGVhc2UgZW50ZXIgYSBzZWVkIHBocmFzZSc7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIENsb3NlIG1vZGFsIEJFRk9SRSBzaG93aW5nIHBhc3N3b3JkIHByb21wdFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1pbXBvcnQtc2VlZC1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICBjb25zdCBwYXNzd29yZCA9IGF3YWl0IHNob3dQYXNzd29yZFByb21wdCgnRW50ZXIgWW91ciBQYXNzd29yZCcsICdFbnRlciB5b3VyIHdhbGxldCBwYXNzd29yZCB0byBlbmNyeXB0IHRoZSBpbXBvcnRlZCB3YWxsZXQnKTtcclxuXHJcbiAgaWYgKCFwYXNzd29yZCkge1xyXG4gICAgLy8gSWYgY2FuY2VsbGVkLCByZW9wZW4gdGhlIG1vZGFsXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LXNlZWQtbXVsdGknKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBhZGRXYWxsZXQoJ21uZW1vbmljJywgeyBtbmVtb25pYyB9LCBwYXNzd29yZCwgbmlja25hbWUgfHwgbnVsbCk7XHJcblxyXG4gICAgLy8gQ2xlYXIgZm9ybVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1zZWVkLW5pY2tuYW1lJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtc2VlZC1waHJhc2UnKS52YWx1ZSA9ICcnO1xyXG5cclxuICAgIC8vIFJlZnJlc2ggd2FsbGV0IGxpc3RcclxuICAgIGF3YWl0IHJlbmRlcldhbGxldExpc3QoKTtcclxuXHJcbiAgICBhbGVydCgnV2FsbGV0IGltcG9ydGVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgLy8gU2hvdyBlcnJvciBhbmQgcmVvcGVuIG1vZGFsXHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1pbXBvcnQtc2VlZC1tdWx0aScpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGltcG9ydCBmcm9tIHByaXZhdGUga2V5IChtdWx0aSlcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlSW1wb3J0S2V5TXVsdGkoKSB7XHJcbiAgY29uc3Qgbmlja25hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LWtleS1uaWNrbmFtZScpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCBwcml2YXRlS2V5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1wcml2YXRlLWtleScpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCBlcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbXBvcnQta2V5LWVycm9yLW11bHRpJyk7XHJcblxyXG4gIGVycm9yRGl2LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICBpZiAoIXByaXZhdGVLZXkpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gJ1BsZWFzZSBlbnRlciBhIHByaXZhdGUga2V5JztcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2xvc2UgbW9kYWwgQkVGT1JFIHNob3dpbmcgcGFzc3dvcmQgcHJvbXB0XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1rZXktbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ0VudGVyIFlvdXIgUGFzc3dvcmQnLCAnRW50ZXIgeW91ciB3YWxsZXQgcGFzc3dvcmQgdG8gZW5jcnlwdCB0aGUgaW1wb3J0ZWQgd2FsbGV0Jyk7XHJcblxyXG4gIGlmICghcGFzc3dvcmQpIHtcclxuICAgIC8vIElmIGNhbmNlbGxlZCwgcmVvcGVuIHRoZSBtb2RhbFxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1rZXktbXVsdGknKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBhZGRXYWxsZXQoJ3ByaXZhdGVrZXknLCB7IHByaXZhdGVLZXkgfSwgcGFzc3dvcmQsIG5pY2tuYW1lIHx8IG51bGwpO1xyXG5cclxuICAgIC8vIENsZWFyIGZvcm1cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQta2V5LW5pY2tuYW1lJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtcHJpdmF0ZS1rZXknKS52YWx1ZSA9ICcnO1xyXG5cclxuICAgIC8vIFJlZnJlc2ggd2FsbGV0IGxpc3RcclxuICAgIGF3YWl0IHJlbmRlcldhbGxldExpc3QoKTtcclxuXHJcbiAgICBhbGVydCgnV2FsbGV0IGltcG9ydGVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgLy8gU2hvdyBlcnJvciBhbmQgcmVvcGVuIG1vZGFsXHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1pbXBvcnQta2V5LW11bHRpJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBTd2l0Y2ggdG8gYSBkaWZmZXJlbnQgd2FsbGV0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVN3aXRjaFdhbGxldCh3YWxsZXRJZCkge1xyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBzZXRBY3RpdmVXYWxsZXQod2FsbGV0SWQpO1xyXG5cclxuICAgIC8vIFJlZnJlc2ggd2FsbGV0IGxpc3QgdG8gc2hvdyBuZXcgYWN0aXZlIHdhbGxldFxyXG4gICAgYXdhaXQgcmVuZGVyV2FsbGV0TGlzdCgpO1xyXG5cclxuICAgIC8vIElmIHdlJ3JlIHVubG9ja2VkLCB1cGRhdGUgdGhlIGRhc2hib2FyZFxyXG4gICAgaWYgKGN1cnJlbnRTdGF0ZS5pc1VubG9ja2VkKSB7XHJcbiAgICAgIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgICBjdXJyZW50U3RhdGUuYWRkcmVzcyA9IHdhbGxldC5hZGRyZXNzO1xyXG4gICAgICB1cGRhdGVEYXNoYm9hcmQoKTtcclxuICAgIH1cclxuXHJcbiAgICBhbGVydCgnU3dpdGNoZWQgdG8gd2FsbGV0IHN1Y2Nlc3NmdWxseSEnKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0Vycm9yIHN3aXRjaGluZyB3YWxsZXQ6ICcgKyBlcnJvci5tZXNzYWdlKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFNob3cgcmVuYW1lIHdhbGxldCBwcm9tcHRcclxuZnVuY3Rpb24gaGFuZGxlUmVuYW1lV2FsbGV0UHJvbXB0KHdhbGxldElkLCBjdXJyZW50Tmlja25hbWUpIHtcclxuICBjdXJyZW50UmVuYW1lV2FsbGV0SWQgPSB3YWxsZXRJZDtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtcmVuYW1lLXdhbGxldC1uaWNrbmFtZScpLnZhbHVlID0gY3VycmVudE5pY2tuYW1lIHx8ICcnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1yZW5hbWUtd2FsbGV0JykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbn1cclxuXHJcbi8vIENvbmZpcm0gcmVuYW1lIHdhbGxldFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVSZW5hbWVXYWxsZXRDb25maXJtKCkge1xyXG4gIGNvbnN0IG5ld05pY2tuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LXJlbmFtZS13YWxsZXQtbmlja25hbWUnKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgZXJyb3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVuYW1lLWVycm9yJyk7XHJcblxyXG4gIGVycm9yRGl2LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICBpZiAoIW5ld05pY2tuYW1lKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9ICdOaWNrbmFtZSBjYW5ub3QgYmUgZW1wdHknO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgYXdhaXQgcmVuYW1lV2FsbGV0KGN1cnJlbnRSZW5hbWVXYWxsZXRJZCwgbmV3Tmlja25hbWUpO1xyXG5cclxuICAgIC8vIENsb3NlIG1vZGFsXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtcmVuYW1lLXdhbGxldCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgY3VycmVudFJlbmFtZVdhbGxldElkID0gbnVsbDtcclxuXHJcbiAgICAvLyBSZWZyZXNoIHdhbGxldCBsaXN0XHJcbiAgICBhd2FpdCByZW5kZXJXYWxsZXRMaXN0KCk7XHJcblxyXG4gICAgYWxlcnQoJ1dhbGxldCByZW5hbWVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBEZWxldGUgYSBzcGVjaWZpYyB3YWxsZXRcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlRGVsZXRlV2FsbGV0TXVsdGkod2FsbGV0SWQpIHtcclxuICBjb25zdCBjb25maXJtZWQgPSBjb25maXJtKFxyXG4gICAgJ+KaoO+4jyBXQVJOSU5HIOKaoO+4j1xcblxcbicgK1xyXG4gICAgJ1lvdSBhcmUgYWJvdXQgdG8gREVMRVRFIHRoaXMgd2FsbGV0IVxcblxcbicgK1xyXG4gICAgJ1RoaXMgYWN0aW9uIGlzIFBFUk1BTkVOVCBhbmQgQ0FOTk9UIGJlIHVuZG9uZS5cXG5cXG4nICtcclxuICAgICdNYWtlIHN1cmUgeW91IGhhdmUgd3JpdHRlbiBkb3duIHlvdXIgc2VlZCBwaHJhc2Ugb3IgcHJpdmF0ZSBrZXkuXFxuXFxuJyArXHJcbiAgICAnRG8geW91IHdhbnQgdG8gY29udGludWU/J1xyXG4gICk7XHJcblxyXG4gIGlmICghY29uZmlybWVkKSByZXR1cm47XHJcblxyXG4gIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgc2hvd1Bhc3N3b3JkUHJvbXB0KCdEZWxldGUgV2FsbGV0JywgJ0VudGVyIHlvdXIgcGFzc3dvcmQgdG8gZGVsZXRlIHRoaXMgd2FsbGV0Jyk7XHJcblxyXG4gIGlmICghcGFzc3dvcmQpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IGRlbGV0ZVdhbGxldCh3YWxsZXRJZCwgcGFzc3dvcmQpO1xyXG4gICAgY2xvc2VQYXNzd29yZFByb21wdCgpO1xyXG5cclxuICAgIC8vIFJlZnJlc2ggd2FsbGV0IGxpc3RcclxuICAgIGF3YWl0IHJlbmRlcldhbGxldExpc3QoKTtcclxuXHJcbiAgICAvLyBJZiB3ZSBkZWxldGVkIGFsbCB3YWxsZXRzLCBnbyBiYWNrIHRvIHNldHVwXHJcbiAgICBjb25zdCB3YWxsZXRzRGF0YSA9IGF3YWl0IGdldEFsbFdhbGxldHMoKTtcclxuICAgIGlmICh3YWxsZXRzRGF0YS53YWxsZXRMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBjdXJyZW50U3RhdGUuaXNVbmxvY2tlZCA9IGZhbHNlO1xyXG4gICAgICBjdXJyZW50U3RhdGUuYWRkcmVzcyA9IG51bGw7XHJcbiAgICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1zZXR1cCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGFsZXJ0KCdXYWxsZXQgZGVsZXRlZCBzdWNjZXNzZnVsbHkhJyk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGFsZXJ0KCdFcnJvciBkZWxldGluZyB3YWxsZXQ6ICcgKyBlcnJvci5tZXNzYWdlKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEV4cG9ydCBzZWVkL2tleSBmb3IgYSBzcGVjaWZpYyB3YWxsZXRcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlRXhwb3J0Rm9yV2FsbGV0KHdhbGxldElkKSB7XHJcbiAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ0V4cG9ydCBXYWxsZXQnLCAnRW50ZXIgeW91ciBwYXNzd29yZCB0byBleHBvcnQgd2FsbGV0IHNlY3JldHMnKTtcclxuXHJcbiAgaWYgKCFwYXNzd29yZCkgcmV0dXJuO1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gVHJ5IHRvIGdldCBtbmVtb25pYyBmaXJzdFxyXG4gICAgY29uc3QgbW5lbW9uaWMgPSBhd2FpdCBleHBvcnRNbmVtb25pY0ZvcldhbGxldCh3YWxsZXRJZCwgcGFzc3dvcmQpO1xyXG5cclxuICAgIGlmIChtbmVtb25pYykge1xyXG4gICAgICBzaG93U2VjcmV0TW9kYWwoJ1NlZWQgUGhyYXNlJywgbW5lbW9uaWMpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gTm8gbW5lbW9uaWMsIHNob3cgcHJpdmF0ZSBrZXlcclxuICAgICAgY29uc3QgcHJpdmF0ZUtleSA9IGF3YWl0IGV4cG9ydFByaXZhdGVLZXlGb3JXYWxsZXQod2FsbGV0SWQsIHBhc3N3b3JkKTtcclxuICAgICAgc2hvd1NlY3JldE1vZGFsKCdQcml2YXRlIEtleScsIHByaXZhdGVLZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlUGFzc3dvcmRQcm9tcHQoKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0Vycm9yIGV4cG9ydGluZyB3YWxsZXQ6ICcgKyBlcnJvci5tZXNzYWdlKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IENPTk5FQ1RJT04gQVBQUk9WQUwgPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ29ubmVjdGlvbkFwcHJvdmFsU2NyZWVuKG9yaWdpbiwgcmVxdWVzdElkKSB7XHJcbiAgLy8gTG9hZCBzZXR0aW5ncyBmb3IgdGhlbWVcclxuICBhd2FpdCBsb2FkU2V0dGluZ3MoKTtcclxuICBhcHBseVRoZW1lKCk7XHJcblxyXG4gIC8vIERpc3BsYXkgdGhlIG9yaWdpblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb25uZWN0aW9uLXNpdGUtb3JpZ2luJykudGV4dENvbnRlbnQgPSBvcmlnaW47XHJcblxyXG4gIC8vIEdldCBhY3RpdmUgd2FsbGV0IGFkZHJlc3NcclxuICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICBpZiAod2FsbGV0ICYmIHdhbGxldC5hZGRyZXNzKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29ubmVjdGlvbi13YWxsZXQtYWRkcmVzcycpLnRleHRDb250ZW50ID0gd2FsbGV0LmFkZHJlc3M7XHJcbiAgfSBlbHNlIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb25uZWN0aW9uLXdhbGxldC1hZGRyZXNzJykudGV4dENvbnRlbnQgPSAnTm8gd2FsbGV0IGZvdW5kJztcclxuICB9XHJcblxyXG4gIC8vIFNob3cgdGhlIGNvbm5lY3Rpb24gYXBwcm92YWwgc2NyZWVuXHJcbiAgc2hvd1NjcmVlbignc2NyZWVuLWNvbm5lY3Rpb24tYXBwcm92YWwnKTtcclxuXHJcbiAgLy8gU2V0dXAgYXBwcm92ZSBidXR0b25cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWFwcHJvdmUtY29ubmVjdGlvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgIHR5cGU6ICdDT05ORUNUSU9OX0FQUFJPVkFMJyxcclxuICAgICAgICByZXF1ZXN0SWQsXHJcbiAgICAgICAgYXBwcm92ZWQ6IHRydWVcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBDbG9zZSB0aGUgcG9wdXAgd2luZG93XHJcbiAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgYWxlcnQoJ0Vycm9yIGFwcHJvdmluZyBjb25uZWN0aW9uOiAnICsgc2FuaXRpemVFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIC8vIFNldHVwIHJlamVjdCBidXR0b25cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlamVjdC1jb25uZWN0aW9uJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogJ0NPTk5FQ1RJT05fQVBQUk9WQUwnLFxyXG4gICAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgICBhcHByb3ZlZDogZmFsc2VcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBDbG9zZSB0aGUgcG9wdXAgd2luZG93XHJcbiAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgYWxlcnQoJ0Vycm9yIHJlamVjdGluZyBjb25uZWN0aW9uOiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG4vLyA9PT09PSBUUkFOU0FDVElPTiBBUFBST1ZBTCA9PT09PVxyXG4vLyBQb3B1bGF0ZSBnYXMgcHJpY2Ugb3B0aW9uc1xyXG5hc3luYyBmdW5jdGlvbiBwb3B1bGF0ZUdhc1ByaWNlcyhuZXR3b3JrLCB0eFJlcXVlc3QsIHN5bWJvbCkge1xyXG4gIC8vIFN0b3JlIHBhcmFtcyBmb3IgcmVmcmVzaCBidXR0b25cclxuICBnYXNQcmljZVJlZnJlc2hTdGF0ZS5hcHByb3ZhbCA9IHsgbmV0d29yaywgdHhSZXF1ZXN0LCBzeW1ib2wgfTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIEZldGNoIGN1cnJlbnQgZ2FzIHByaWNlIGZyb20gUlBDXHJcbiAgICBjb25zdCBnYXNQcmljZUhleCA9IGF3YWl0IHJwYy5nZXRHYXNQcmljZShuZXR3b3JrKTtcclxuICAgIGNvbnN0IGdhc1ByaWNlV2VpID0gQmlnSW50KGdhc1ByaWNlSGV4KTtcclxuICAgIGNvbnN0IGdhc1ByaWNlR3dlaSA9IE51bWJlcihnYXNQcmljZVdlaSkgLyAxZTk7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHNsb3cgKDgwJSksIG5vcm1hbCAoMTAwJSksIGZhc3QgKDE1MCUpXHJcbiAgICBjb25zdCBzbG93R3dlaSA9IChnYXNQcmljZUd3ZWkgKiAwLjgpLnRvRml4ZWQoMik7XHJcbiAgICBjb25zdCBub3JtYWxHd2VpID0gZ2FzUHJpY2VHd2VpLnRvRml4ZWQoMik7XHJcbiAgICBjb25zdCBmYXN0R3dlaSA9IChnYXNQcmljZUd3ZWkgKiAxLjUpLnRvRml4ZWQoMik7XHJcblxyXG4gICAgLy8gVXBkYXRlIFVJXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FzLXNsb3ctcHJpY2UnKS50ZXh0Q29udGVudCA9IGAke3Nsb3dHd2VpfSBHd2VpYDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtbm9ybWFsLXByaWNlJykudGV4dENvbnRlbnQgPSBgJHtub3JtYWxHd2VpfSBHd2VpYDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtZmFzdC1wcmljZScpLnRleHRDb250ZW50ID0gYCR7ZmFzdEd3ZWl9IEd3ZWlgO1xyXG5cclxuICAgIC8vIEVzdGltYXRlIGdhcyBmb3IgdGhlIHRyYW5zYWN0aW9uXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBlc3RpbWF0ZWRHYXNIZXggPSBhd2FpdCBycGMuZXN0aW1hdGVHYXMobmV0d29yaywgdHhSZXF1ZXN0KTtcclxuICAgICAgY29uc3QgZXN0aW1hdGVkR2FzID0gQmlnSW50KGVzdGltYXRlZEdhc0hleCk7XHJcblxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZXN0aW1hdGVkLWdhcycpLnRleHRDb250ZW50ID0gZXN0aW1hdGVkR2FzLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAvLyBDYWxjdWxhdGUgbWF4IGZlZSBiYXNlZCBvbiBub3JtYWwgZ2FzIHByaWNlXHJcbiAgICAgIGNvbnN0IG1heEZlZVdlaSA9IGVzdGltYXRlZEdhcyAqIGdhc1ByaWNlV2VpO1xyXG4gICAgICBjb25zdCBtYXhGZWVFdGggPSBldGhlcnMuZm9ybWF0RXRoZXIobWF4RmVlV2VpLnRvU3RyaW5nKCkpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtbWF4LWZlZScpLnRleHRDb250ZW50ID0gYCR7cGFyc2VGbG9hdChtYXhGZWVFdGgpLnRvRml4ZWQoOCl9ICR7c3ltYm9sfWA7XHJcblxyXG4gICAgICAvLyBVcGRhdGUgbWF4IGZlZSB3aGVuIGdhcyBwcmljZSBzZWxlY3Rpb24gY2hhbmdlc1xyXG4gICAgICBjb25zdCB1cGRhdGVNYXhGZWUgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRTcGVlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJnYXMtc3BlZWRcIl06Y2hlY2tlZCcpPy52YWx1ZTtcclxuICAgICAgICBsZXQgc2VsZWN0ZWRHd2VpO1xyXG5cclxuICAgICAgICBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ3Nsb3cnKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KHNsb3dHd2VpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdub3JtYWwnKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KG5vcm1hbEd3ZWkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2Zhc3QnKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KGZhc3RHd2VpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdjdXN0b20nKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXN0b20tZ2FzLXByaWNlJykudmFsdWUpIHx8IHBhcnNlRmxvYXQobm9ybWFsR3dlaSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQobm9ybWFsR3dlaSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzZWxlY3RlZEdhc1ByaWNlV2VpID0gQmlnSW50KE1hdGguZmxvb3Ioc2VsZWN0ZWRHd2VpICogMWU5KSk7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRNYXhGZWVXZWkgPSBlc3RpbWF0ZWRHYXMgKiBzZWxlY3RlZEdhc1ByaWNlV2VpO1xyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkTWF4RmVlRXRoID0gZXRoZXJzLmZvcm1hdEV0aGVyKHNlbGVjdGVkTWF4RmVlV2VpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1tYXgtZmVlJykudGV4dENvbnRlbnQgPSBgJHtwYXJzZUZsb2F0KHNlbGVjdGVkTWF4RmVlRXRoKS50b0ZpeGVkKDgpfSAke3N5bWJvbH1gO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgZ2FzIHByaWNlIGNoYW5nZXNcclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbbmFtZT1cImdhcy1zcGVlZFwiXScpLmZvckVhY2gocmFkaW8gPT4ge1xyXG4gICAgICAgIHJhZGlvLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcclxuICAgICAgICAgIHVwZGF0ZU1heEZlZSgpO1xyXG5cclxuICAgICAgICAgIC8vIFVwZGF0ZSB2aXN1YWwgaGlnaGxpZ2h0aW5nIGZvciBhbGwgZ2FzIG9wdGlvbnNcclxuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYXMtb3B0aW9uJykuZm9yRWFjaChsYWJlbCA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gbGFiZWwucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImdhcy1zcGVlZFwiXScpO1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQgJiYgaW5wdXQuY2hlY2tlZCkge1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXN1Y2Nlc3MpJztcclxuICAgICAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJXaWR0aCA9ICcycHgnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLWJvcmRlciknO1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlcldpZHRoID0gJzFweCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIC8vIFNob3cvaGlkZSBjdXN0b20gaW5wdXQgYmFzZWQgb24gc2VsZWN0aW9uXHJcbiAgICAgICAgICBjb25zdCBjdXN0b21Db250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VzdG9tLWdhcy1pbnB1dC1jb250YWluZXInKTtcclxuICAgICAgICAgIGlmIChyYWRpby52YWx1ZSA9PT0gJ2N1c3RvbScgJiYgcmFkaW8uY2hlY2tlZCkge1xyXG4gICAgICAgICAgICBjdXN0b21Db250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIC8vIEZvY3VzIHRoZSBpbnB1dCB3aGVuIGN1c3RvbSBpcyBzZWxlY3RlZFxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VzdG9tLWdhcy1wcmljZScpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGN1c3RvbUNvbnRhaW5lcikge1xyXG4gICAgICAgICAgICBjdXN0b21Db250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgc2VsZWN0ZWQgYm9yZGVyIChOb3JtYWwgaXMgY2hlY2tlZCBieSBkZWZhdWx0KVxyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FzLW9wdGlvbicpLmZvckVhY2gobGFiZWwgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gbGFiZWwucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImdhcy1zcGVlZFwiXScpO1xyXG4gICAgICAgIGlmIChpbnB1dCAmJiBpbnB1dC5jaGVja2VkKSB7XHJcbiAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJDb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1zdWNjZXNzKSc7XHJcbiAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJXaWR0aCA9ICcycHgnO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBBdXRvLXNlbGVjdCBjdXN0b20gcmFkaW8gd2hlbiB0eXBpbmcgaW4gY3VzdG9tIGdhcyBwcmljZVxyXG4gICAgICBjb25zdCBjdXN0b21HYXNJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXN0b20tZ2FzLXByaWNlJyk7XHJcbiAgICAgIGN1c3RvbUdhc0lucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtY3VzdG9tLXJhZGlvJykuY2hlY2tlZCA9IHRydWU7XHJcbiAgICAgICAgdXBkYXRlTWF4RmVlKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIH0gY2F0Y2ggKGdhc0VzdGltYXRlRXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZXN0aW1hdGluZyBnYXM6JywgZ2FzRXN0aW1hdGVFcnJvcik7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1lc3RpbWF0ZWQtZ2FzJykudGV4dENvbnRlbnQgPSAnMjEwMDAgKGRlZmF1bHQpJztcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LW1heC1mZWUnKS50ZXh0Q29udGVudCA9ICdVbmFibGUgdG8gZXN0aW1hdGUnO1xyXG4gICAgfVxyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZ2FzIHByaWNlOicsIGVycm9yKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtc2xvdy1wcmljZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtbm9ybWFsLXByaWNlJykudGV4dENvbnRlbnQgPSAnRXJyb3InO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhcy1mYXN0LXByaWNlJykudGV4dENvbnRlbnQgPSAnRXJyb3InO1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IHNlbGVjdGVkIGdhcyBwcmljZSBpbiB3ZWlcclxuZnVuY3Rpb24gZ2V0U2VsZWN0ZWRHYXNQcmljZSgpIHtcclxuICBjb25zdCBzZWxlY3RlZFNwZWVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImdhcy1zcGVlZFwiXTpjaGVja2VkJyk/LnZhbHVlO1xyXG5cclxuICBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2N1c3RvbScpIHtcclxuICAgIGNvbnN0IGN1c3RvbUd3ZWkgPSBwYXJzZUZsb2F0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXN0b20tZ2FzLXByaWNlJykudmFsdWUpO1xyXG4gICAgaWYgKGN1c3RvbUd3ZWkgJiYgY3VzdG9tR3dlaSA+IDApIHtcclxuICAgICAgLy8gQ29udmVydCBHd2VpIHRvIFdlaSAobXVsdGlwbHkgYnkgMWU5KVxyXG4gICAgICByZXR1cm4gZXRoZXJzLnBhcnNlVW5pdHMoY3VzdG9tR3dlaS50b1N0cmluZygpLCAnZ3dlaScpLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBHZXQgdGhlIGRpc3BsYXllZCBHd2VpIHZhbHVlIGFuZCBjb252ZXJ0IHRvIHdlaVxyXG4gIGxldCBnd2VpVGV4dDtcclxuICBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ3Nsb3cnKSB7XHJcbiAgICBnd2VpVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtc2xvdy1wcmljZScpLnRleHRDb250ZW50O1xyXG4gIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2Zhc3QnKSB7XHJcbiAgICBnd2VpVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtZmFzdC1wcmljZScpLnRleHRDb250ZW50O1xyXG4gIH0gZWxzZSB7XHJcbiAgICBnd2VpVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtbm9ybWFsLXByaWNlJykudGV4dENvbnRlbnQ7XHJcbiAgfVxyXG5cclxuICBjb25zdCBnd2VpID0gcGFyc2VGbG9hdChnd2VpVGV4dCk7XHJcbiAgaWYgKGd3ZWkgJiYgZ3dlaSA+IDApIHtcclxuICAgIHJldHVybiBldGhlcnMucGFyc2VVbml0cyhnd2VpLnRvU3RyaW5nKCksICdnd2VpJykudG9TdHJpbmcoKTtcclxuICB9XHJcblxyXG4gIC8vIElmIGFsbCBlbHNlIGZhaWxzLCByZXR1cm4gbnVsbCB0byB1c2UgZGVmYXVsdFxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcblxyXG4vLyBGZXRjaCBhbmQgZGlzcGxheSBjdXJyZW50IG5vbmNlIGZvciB0cmFuc2FjdGlvblxyXG5hc3luYyBmdW5jdGlvbiBmZXRjaEFuZERpc3BsYXlOb25jZShhZGRyZXNzLCBuZXR3b3JrKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5vbmNlSGV4ID0gYXdhaXQgcnBjLmdldFRyYW5zYWN0aW9uQ291bnQobmV0d29yaywgYWRkcmVzcywgJ3BlbmRpbmcnKTtcclxuICAgIGNvbnN0IG5vbmNlID0gcGFyc2VJbnQobm9uY2VIZXgsIDE2KTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXJyZW50LW5vbmNlJykudGV4dENvbnRlbnQgPSBub25jZTtcclxuICAgIC8vIEN1cnJlbnQgbm9uY2UgZmV0Y2hlZFxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBub25jZTonLCBlcnJvcik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VycmVudC1ub25jZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFNFTkQgU0NSRUVOIEdBUyBQUklDRSBIRUxQRVJTID09PT09XHJcblxyXG4vLyBQb3B1bGF0ZSBnYXMgcHJpY2VzIGZvciBTZW5kIHNjcmVlblxyXG5hc3luYyBmdW5jdGlvbiBwb3B1bGF0ZVNlbmRHYXNQcmljZXMobmV0d29yaywgdHhSZXF1ZXN0LCBzeW1ib2wpIHtcclxuICAvLyBTdG9yZSBwYXJhbXMgZm9yIHJlZnJlc2ggYnV0dG9uXHJcbiAgZ2FzUHJpY2VSZWZyZXNoU3RhdGUuc2VuZCA9IHsgbmV0d29yaywgdHhSZXF1ZXN0LCBzeW1ib2wgfTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGdhc1ByaWNlSGV4ID0gYXdhaXQgcnBjLmdldEdhc1ByaWNlKG5ldHdvcmspO1xyXG4gICAgY29uc3QgZ2FzUHJpY2VXZWkgPSBCaWdJbnQoZ2FzUHJpY2VIZXgpO1xyXG4gICAgY29uc3QgZ2FzUHJpY2VHd2VpID0gTnVtYmVyKGdhc1ByaWNlV2VpKSAvIDFlOTtcclxuXHJcbiAgICBjb25zdCBzbG93R3dlaSA9IChnYXNQcmljZUd3ZWkgKiAwLjgpLnRvRml4ZWQoMik7XHJcbiAgICBjb25zdCBub3JtYWxHd2VpID0gZ2FzUHJpY2VHd2VpLnRvRml4ZWQoMik7XHJcbiAgICBjb25zdCBmYXN0R3dlaSA9IChnYXNQcmljZUd3ZWkgKiAxLjUpLnRvRml4ZWQoMik7XHJcblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtZ2FzLXNsb3ctcHJpY2UnKS50ZXh0Q29udGVudCA9IGAke3Nsb3dHd2VpfSBHd2VpYDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWdhcy1ub3JtYWwtcHJpY2UnKS50ZXh0Q29udGVudCA9IGAke25vcm1hbEd3ZWl9IEd3ZWlgO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtZ2FzLWZhc3QtcHJpY2UnKS50ZXh0Q29udGVudCA9IGAke2Zhc3RHd2VpfSBHd2VpYDtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBlc3RpbWF0ZWRHYXNIZXggPSBhd2FpdCBycGMuZXN0aW1hdGVHYXMobmV0d29yaywgdHhSZXF1ZXN0KTtcclxuICAgICAgY29uc3QgZXN0aW1hdGVkR2FzID0gQmlnSW50KGVzdGltYXRlZEdhc0hleCk7XHJcblxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1lc3RpbWF0ZWQtZ2FzJykudGV4dENvbnRlbnQgPSBlc3RpbWF0ZWRHYXMudG9TdHJpbmcoKTtcclxuXHJcbiAgICAgIGNvbnN0IG1heEZlZVdlaSA9IGVzdGltYXRlZEdhcyAqIGdhc1ByaWNlV2VpO1xyXG4gICAgICBjb25zdCBtYXhGZWVFdGggPSBldGhlcnMuZm9ybWF0RXRoZXIobWF4RmVlV2VpLnRvU3RyaW5nKCkpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1tYXgtZmVlJykudGV4dENvbnRlbnQgPSBgJHtwYXJzZUZsb2F0KG1heEZlZUV0aCkudG9GaXhlZCg4KX0gJHtzeW1ib2x9YDtcclxuXHJcbiAgICAgIGNvbnN0IHVwZGF0ZU1heEZlZSA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCBzZWxlY3RlZFNwZWVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInNlbmQtZ2FzLXNwZWVkXCJdOmNoZWNrZWQnKT8udmFsdWU7XHJcbiAgICAgICAgbGV0IHNlbGVjdGVkR3dlaTtcclxuXHJcbiAgICAgICAgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdzbG93Jykge1xyXG4gICAgICAgICAgc2VsZWN0ZWRHd2VpID0gcGFyc2VGbG9hdChzbG93R3dlaSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RlZFNwZWVkID09PSAnbm9ybWFsJykge1xyXG4gICAgICAgICAgc2VsZWN0ZWRHd2VpID0gcGFyc2VGbG9hdChub3JtYWxHd2VpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdmYXN0Jykge1xyXG4gICAgICAgICAgc2VsZWN0ZWRHd2VpID0gcGFyc2VGbG9hdChmYXN0R3dlaSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RlZFNwZWVkID09PSAnY3VzdG9tJykge1xyXG4gICAgICAgICAgc2VsZWN0ZWRHd2VpID0gcGFyc2VGbG9hdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXN0b20tZ2FzLXByaWNlJykudmFsdWUpIHx8IHBhcnNlRmxvYXQobm9ybWFsR3dlaSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQobm9ybWFsR3dlaSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzZWxlY3RlZEdhc1ByaWNlV2VpID0gQmlnSW50KE1hdGguZmxvb3Ioc2VsZWN0ZWRHd2VpICogMWU5KSk7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRNYXhGZWVXZWkgPSBlc3RpbWF0ZWRHYXMgKiBzZWxlY3RlZEdhc1ByaWNlV2VpO1xyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkTWF4RmVlRXRoID0gZXRoZXJzLmZvcm1hdEV0aGVyKHNlbGVjdGVkTWF4RmVlV2VpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLW1heC1mZWUnKS50ZXh0Q29udGVudCA9IGAke3BhcnNlRmxvYXQoc2VsZWN0ZWRNYXhGZWVFdGgpLnRvRml4ZWQoOCl9ICR7c3ltYm9sfWA7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFtuYW1lPVwic2VuZC1nYXMtc3BlZWRcIl0nKS5mb3JFYWNoKHJhZGlvID0+IHtcclxuICAgICAgICByYWRpby5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XHJcbiAgICAgICAgICB1cGRhdGVNYXhGZWUoKTtcclxuXHJcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FzLW9wdGlvbicpLmZvckVhY2gobGFiZWwgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnB1dCA9IGxhYmVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJzZW5kLWdhcy1zcGVlZFwiXScpO1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQgJiYgaW5wdXQuY2hlY2tlZCkge1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXN1Y2Nlc3MpJztcclxuICAgICAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJXaWR0aCA9ICcycHgnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLWJvcmRlciknO1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlcldpZHRoID0gJzFweCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGN1c3RvbUNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWN1c3RvbS1nYXMtaW5wdXQtY29udGFpbmVyJyk7XHJcbiAgICAgICAgICBpZiAocmFkaW8udmFsdWUgPT09ICdjdXN0b20nICYmIHJhZGlvLmNoZWNrZWQpIHtcclxuICAgICAgICAgICAgY3VzdG9tQ29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXN0b20tZ2FzLXByaWNlJykuZm9jdXMoKTtcclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoY3VzdG9tQ29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgIGN1c3RvbUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FzLW9wdGlvbicpLmZvckVhY2gobGFiZWwgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gbGFiZWwucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInNlbmQtZ2FzLXNwZWVkXCJdJyk7XHJcbiAgICAgICAgaWYgKGlucHV0ICYmIGlucHV0LmNoZWNrZWQpIHtcclxuICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXN1Y2Nlc3MpJztcclxuICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlcldpZHRoID0gJzJweCc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnN0IGN1c3RvbUdhc0lucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtY3VzdG9tLWdhcy1wcmljZScpO1xyXG4gICAgICBjdXN0b21HYXNJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1nYXMtY3VzdG9tLXJhZGlvJykuY2hlY2tlZCA9IHRydWU7XHJcbiAgICAgICAgdXBkYXRlTWF4RmVlKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIH0gY2F0Y2ggKGdhc0VzdGltYXRlRXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZXN0aW1hdGluZyBnYXM6JywgZ2FzRXN0aW1hdGVFcnJvcik7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWVzdGltYXRlZC1nYXMnKS50ZXh0Q29udGVudCA9ICcyMTAwMCAoZGVmYXVsdCknO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1tYXgtZmVlJykudGV4dENvbnRlbnQgPSAnVW5hYmxlIHRvIGVzdGltYXRlJztcclxuICAgIH1cclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1nYXMtc2xvdy1wcmljZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWdhcy1ub3JtYWwtcHJpY2UnKS50ZXh0Q29udGVudCA9ICdFcnJvcic7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1nYXMtZmFzdC1wcmljZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCBzZWxlY3RlZCBnYXMgcHJpY2UgZnJvbSBTZW5kIHNjcmVlblxyXG5mdW5jdGlvbiBnZXRTZWxlY3RlZFNlbmRHYXNQcmljZSgpIHtcclxuICBjb25zdCBzZWxlY3RlZFNwZWVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInNlbmQtZ2FzLXNwZWVkXCJdOmNoZWNrZWQnKT8udmFsdWU7XHJcblxyXG4gIGlmIChzZWxlY3RlZFNwZWVkID09PSAnY3VzdG9tJykge1xyXG4gICAgY29uc3QgY3VzdG9tR3dlaSA9IHBhcnNlRmxvYXQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtY3VzdG9tLWdhcy1wcmljZScpLnZhbHVlKTtcclxuICAgIGlmIChjdXN0b21Hd2VpICYmIGN1c3RvbUd3ZWkgPiAwKSB7XHJcbiAgICAgIHJldHVybiBldGhlcnMucGFyc2VVbml0cyhjdXN0b21Hd2VpLnRvU3RyaW5nKCksICdnd2VpJykudG9TdHJpbmcoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGxldCBnd2VpVGV4dDtcclxuICBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ3Nsb3cnKSB7XHJcbiAgICBnd2VpVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWdhcy1zbG93LXByaWNlJykudGV4dENvbnRlbnQ7XHJcbiAgfSBlbHNlIGlmIChzZWxlY3RlZFNwZWVkID09PSAnZmFzdCcpIHtcclxuICAgIGd3ZWlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtZ2FzLWZhc3QtcHJpY2UnKS50ZXh0Q29udGVudDtcclxuICB9IGVsc2Uge1xyXG4gICAgZ3dlaVRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1nYXMtbm9ybWFsLXByaWNlJykudGV4dENvbnRlbnQ7XHJcbiAgfVxyXG5cclxuICBjb25zdCBnd2VpID0gcGFyc2VGbG9hdChnd2VpVGV4dCk7XHJcbiAgaWYgKGd3ZWkgJiYgZ3dlaSA+IDApIHtcclxuICAgIHJldHVybiBldGhlcnMucGFyc2VVbml0cyhnd2VpLnRvU3RyaW5nKCksICdnd2VpJykudG9TdHJpbmcoKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcblxyXG4vLyBQb3B1bGF0ZSBnYXMgcHJpY2VzIGZvciBUb2tlbiBTZW5kXHJcbmFzeW5jIGZ1bmN0aW9uIHBvcHVsYXRlVG9rZW5HYXNQcmljZXMobmV0d29yaywgdHhSZXF1ZXN0LCBzeW1ib2wpIHtcclxuICAvLyBTdG9yZSBwYXJhbXMgZm9yIHJlZnJlc2ggYnV0dG9uXHJcbiAgZ2FzUHJpY2VSZWZyZXNoU3RhdGUudG9rZW4gPSB7IG5ldHdvcmssIHR4UmVxdWVzdCwgc3ltYm9sIH07XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBnYXNQcmljZUhleCA9IGF3YWl0IHJwYy5nZXRHYXNQcmljZShuZXR3b3JrKTtcclxuICAgIGNvbnN0IGdhc1ByaWNlV2VpID0gQmlnSW50KGdhc1ByaWNlSGV4KTtcclxuICAgIGNvbnN0IGdhc1ByaWNlR3dlaSA9IE51bWJlcihnYXNQcmljZVdlaSkgLyAxZTk7XHJcblxyXG4gICAgY29uc3Qgc2xvd0d3ZWkgPSAoZ2FzUHJpY2VHd2VpICogMC44KS50b0ZpeGVkKDIpO1xyXG4gICAgY29uc3Qgbm9ybWFsR3dlaSA9IGdhc1ByaWNlR3dlaS50b0ZpeGVkKDIpO1xyXG4gICAgY29uc3QgZmFzdEd3ZWkgPSAoZ2FzUHJpY2VHd2VpICogMS41KS50b0ZpeGVkKDIpO1xyXG5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1nYXMtc2xvdy1wcmljZScpLnRleHRDb250ZW50ID0gYCR7c2xvd0d3ZWl9IEd3ZWlgO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWdhcy1ub3JtYWwtcHJpY2UnKS50ZXh0Q29udGVudCA9IGAke25vcm1hbEd3ZWl9IEd3ZWlgO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWdhcy1mYXN0LXByaWNlJykudGV4dENvbnRlbnQgPSBgJHtmYXN0R3dlaX0gR3dlaWA7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZXN0aW1hdGVkR2FzSGV4ID0gYXdhaXQgcnBjLmVzdGltYXRlR2FzKG5ldHdvcmssIHR4UmVxdWVzdCk7XHJcbiAgICAgIGNvbnN0IGVzdGltYXRlZEdhcyA9IEJpZ0ludChlc3RpbWF0ZWRHYXNIZXgpO1xyXG5cclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWVzdGltYXRlZC1nYXMnKS50ZXh0Q29udGVudCA9IGVzdGltYXRlZEdhcy50b1N0cmluZygpO1xyXG5cclxuICAgICAgY29uc3QgbWF4RmVlV2VpID0gZXN0aW1hdGVkR2FzICogZ2FzUHJpY2VXZWk7XHJcbiAgICAgIGNvbnN0IG1heEZlZUV0aCA9IGV0aGVycy5mb3JtYXRFdGhlcihtYXhGZWVXZWkudG9TdHJpbmcoKSk7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1tYXgtZmVlJykudGV4dENvbnRlbnQgPSBgJHtwYXJzZUZsb2F0KG1heEZlZUV0aCkudG9GaXhlZCg4KX0gJHtzeW1ib2x9YDtcclxuXHJcbiAgICAgIGNvbnN0IHVwZGF0ZU1heEZlZSA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCBzZWxlY3RlZFNwZWVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInRva2VuLWdhcy1zcGVlZFwiXTpjaGVja2VkJyk/LnZhbHVlO1xyXG4gICAgICAgIGxldCBzZWxlY3RlZEd3ZWk7XHJcblxyXG4gICAgICAgIGlmIChzZWxlY3RlZFNwZWVkID09PSAnc2xvdycpIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQoc2xvd0d3ZWkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ25vcm1hbCcpIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQobm9ybWFsR3dlaSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RlZFNwZWVkID09PSAnZmFzdCcpIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQoZmFzdEd3ZWkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2N1c3RvbScpIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1c3RvbS1nYXMtcHJpY2UnKS52YWx1ZSkgfHwgcGFyc2VGbG9hdChub3JtYWxHd2VpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2VsZWN0ZWRHd2VpID0gcGFyc2VGbG9hdChub3JtYWxHd2VpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkR2FzUHJpY2VXZWkgPSBCaWdJbnQoTWF0aC5mbG9vcihzZWxlY3RlZEd3ZWkgKiAxZTkpKTtcclxuICAgICAgICBjb25zdCBzZWxlY3RlZE1heEZlZVdlaSA9IGVzdGltYXRlZEdhcyAqIHNlbGVjdGVkR2FzUHJpY2VXZWk7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRNYXhGZWVFdGggPSBldGhlcnMuZm9ybWF0RXRoZXIoc2VsZWN0ZWRNYXhGZWVXZWkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLW1heC1mZWUnKS50ZXh0Q29udGVudCA9IGAke3BhcnNlRmxvYXQoc2VsZWN0ZWRNYXhGZWVFdGgpLnRvRml4ZWQoOCl9ICR7c3ltYm9sfWA7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFtuYW1lPVwidG9rZW4tZ2FzLXNwZWVkXCJdJykuZm9yRWFjaChyYWRpbyA9PiB7XHJcbiAgICAgICAgcmFkaW8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xyXG4gICAgICAgICAgdXBkYXRlTWF4RmVlKCk7XHJcblxyXG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmdhcy1vcHRpb24nKS5mb3JFYWNoKGxhYmVsID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaW5wdXQgPSBsYWJlbC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwidG9rZW4tZ2FzLXNwZWVkXCJdJyk7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dCAmJiBpbnB1dC5jaGVja2VkKSB7XHJcbiAgICAgICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyQ29sb3IgPSAndmFyKC0tdGVybWluYWwtc3VjY2VzcyknO1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlcldpZHRoID0gJzJweCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyQ29sb3IgPSAndmFyKC0tdGVybWluYWwtYm9yZGVyKSc7XHJcbiAgICAgICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyV2lkdGggPSAnMXB4JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgY29uc3QgY3VzdG9tQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1c3RvbS1nYXMtaW5wdXQtY29udGFpbmVyJyk7XHJcbiAgICAgICAgICBpZiAocmFkaW8udmFsdWUgPT09ICdjdXN0b20nICYmIHJhZGlvLmNoZWNrZWQpIHtcclxuICAgICAgICAgICAgY3VzdG9tQ29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tY3VzdG9tLWdhcy1wcmljZScpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGN1c3RvbUNvbnRhaW5lcikge1xyXG4gICAgICAgICAgICBjdXN0b21Db250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmdhcy1vcHRpb24nKS5mb3JFYWNoKGxhYmVsID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IGxhYmVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJ0b2tlbi1nYXMtc3BlZWRcIl0nKTtcclxuICAgICAgICBpZiAoaW5wdXQgJiYgaW5wdXQuY2hlY2tlZCkge1xyXG4gICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyQ29sb3IgPSAndmFyKC0tdGVybWluYWwtc3VjY2VzcyknO1xyXG4gICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyV2lkdGggPSAnMnB4JztcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgY3VzdG9tR2FzSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tY3VzdG9tLWdhcy1wcmljZScpO1xyXG4gICAgICBjdXN0b21HYXNJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZ2FzLWN1c3RvbS1yYWRpbycpLmNoZWNrZWQgPSB0cnVlO1xyXG4gICAgICAgIHVwZGF0ZU1heEZlZSgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICB9IGNhdGNoIChnYXNFc3RpbWF0ZUVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGVzdGltYXRpbmcgZ2FzOicsIGdhc0VzdGltYXRlRXJyb3IpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZXN0aW1hdGVkLWdhcycpLnRleHRDb250ZW50ID0gJzY1MDAwIChkZWZhdWx0KSc7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1tYXgtZmVlJykudGV4dENvbnRlbnQgPSAnVW5hYmxlIHRvIGVzdGltYXRlJztcclxuICAgIH1cclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZ2FzLXNsb3ctcHJpY2UnKS50ZXh0Q29udGVudCA9ICdFcnJvcic7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZ2FzLW5vcm1hbC1wcmljZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1nYXMtZmFzdC1wcmljZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCBzZWxlY3RlZCBnYXMgcHJpY2UgZnJvbSBUb2tlbiBTZW5kXHJcbmZ1bmN0aW9uIGdldFNlbGVjdGVkVG9rZW5HYXNQcmljZSgpIHtcclxuICBjb25zdCBzZWxlY3RlZFNwZWVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInRva2VuLWdhcy1zcGVlZFwiXTpjaGVja2VkJyk/LnZhbHVlO1xyXG5cclxuICBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2N1c3RvbScpIHtcclxuICAgIGNvbnN0IGN1c3RvbUd3ZWkgPSBwYXJzZUZsb2F0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1jdXN0b20tZ2FzLXByaWNlJykudmFsdWUpO1xyXG4gICAgaWYgKGN1c3RvbUd3ZWkgJiYgY3VzdG9tR3dlaSA+IDApIHtcclxuICAgICAgcmV0dXJuIGV0aGVycy5wYXJzZVVuaXRzKGN1c3RvbUd3ZWkudG9TdHJpbmcoKSwgJ2d3ZWknKS50b1N0cmluZygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbGV0IGd3ZWlUZXh0O1xyXG4gIGlmIChzZWxlY3RlZFNwZWVkID09PSAnc2xvdycpIHtcclxuICAgIGd3ZWlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWdhcy1zbG93LXByaWNlJykudGV4dENvbnRlbnQ7XHJcbiAgfSBlbHNlIGlmIChzZWxlY3RlZFNwZWVkID09PSAnZmFzdCcpIHtcclxuICAgIGd3ZWlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWdhcy1mYXN0LXByaWNlJykudGV4dENvbnRlbnQ7XHJcbiAgfSBlbHNlIHtcclxuICAgIGd3ZWlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWdhcy1ub3JtYWwtcHJpY2UnKS50ZXh0Q29udGVudDtcclxuICB9XHJcblxyXG4gIGNvbnN0IGd3ZWkgPSBwYXJzZUZsb2F0KGd3ZWlUZXh0KTtcclxuICBpZiAoZ3dlaSAmJiBnd2VpID4gMCkge1xyXG4gICAgcmV0dXJuIGV0aGVycy5wYXJzZVVuaXRzKGd3ZWkudG9TdHJpbmcoKSwgJ2d3ZWknKS50b1N0cmluZygpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbi8vIFNob3cgdHJhbnNhY3Rpb24gc3RhdHVzIGZvciBTZW5kIHNjcmVlblxyXG5hc3luYyBmdW5jdGlvbiBzaG93U2VuZFRyYW5zYWN0aW9uU3RhdHVzKHR4SGFzaCwgbmV0d29yaywgYW1vdW50LCBzeW1ib2wpIHtcclxuICAvLyBIaWRlIHNlbmQgZm9ybVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWZvcm0nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gU2hvdyBzdGF0dXMgc2VjdGlvblxyXG4gIGNvbnN0IHN0YXR1c1NlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1zdGF0dXMtc2VjdGlvbicpO1xyXG4gIHN0YXR1c1NlY3Rpb24uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcblxyXG4gIC8vIFBvcHVsYXRlIHRyYW5zYWN0aW9uIGhhc2hcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1zdGF0dXMtaGFzaCcpLnRleHRDb250ZW50ID0gdHhIYXNoO1xyXG5cclxuICAvLyBTZXR1cCBWaWV3IG9uIEV4cGxvcmVyIGJ1dHRvblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tc2VuZC1zdGF0dXMtZXhwbG9yZXInKS5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgY29uc3QgdXJsID0gZ2V0RXhwbG9yZXJVcmwobmV0d29yaywgJ3R4JywgdHhIYXNoKTtcclxuICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybCB9KTtcclxuICB9O1xyXG5cclxuICAvLyBHZXQgYWN0aXZlIHdhbGxldCBhZGRyZXNzXHJcbiAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgY29uc3QgYWRkcmVzcyA9IHdhbGxldD8uYWRkcmVzcztcclxuXHJcbiAgLy8gUG9sbCBmb3IgdHJhbnNhY3Rpb24gc3RhdHVzXHJcbiAgbGV0IHBvbGxJbnRlcnZhbDtcclxuICBjb25zdCB1cGRhdGVTdGF0dXMgPSBhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnR0VUX1RYX0JZX0hBU0gnLFxyXG4gICAgICAgIGFkZHJlc3M6IGFkZHJlc3MsXHJcbiAgICAgICAgdHhIYXNoOiB0eEhhc2hcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAocmVzcG9uc2Uuc3VjY2VzcyAmJiByZXNwb25zZS50cmFuc2FjdGlvbikge1xyXG4gICAgICAgIGNvbnN0IHR4ID0gcmVzcG9uc2UudHJhbnNhY3Rpb247XHJcbiAgICAgICAgY29uc3Qgc3RhdHVzTWVzc2FnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLXN0YXR1cy1tZXNzYWdlJyk7XHJcbiAgICAgICAgY29uc3Qgc3RhdHVzRGV0YWlscyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLXN0YXR1cy1kZXRhaWxzJyk7XHJcbiAgICAgICAgY29uc3QgcGVuZGluZ0FjdGlvbnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1zdGF0dXMtcGVuZGluZy1hY3Rpb25zJyk7XHJcblxyXG4gICAgICAgIGlmICh0eC5zdGF0dXMgPT09ICdjb25maXJtZWQnKSB7XHJcbiAgICAgICAgICBzdGF0dXNNZXNzYWdlLnRleHRDb250ZW50ID0gJ+KchSBUcmFuc2FjdGlvbiBDb25maXJtZWQhJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMudGV4dENvbnRlbnQgPSBgQmxvY2s6ICR7dHguYmxvY2tOdW1iZXJ9YDtcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMuc3R5bGUuY29sb3IgPSAndmFyKC0tdGVybWluYWwtc3VjY2VzcyknO1xyXG4gICAgICAgICAgcGVuZGluZ0FjdGlvbnMuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgaWYgKHBvbGxJbnRlcnZhbCkge1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHBvbGxJbnRlcnZhbCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gTm90ZTogRGVza3RvcCBub3RpZmljYXRpb24gaXMgc2VudCBieSBiYWNrZ3JvdW5kIHNlcnZpY2Ugd29ya2VyXHJcbiAgICAgICAgICAvLyBObyBuZWVkIHRvIHNlbmQgYW5vdGhlciBvbmUgaGVyZSB0byBhdm9pZCBkdXBsaWNhdGVzXHJcblxyXG4gICAgICAgICAgLy8gQXV0by1jbG9zZSBhbmQgcmV0dXJuIHRvIGRhc2hib2FyZCBhZnRlciAyIHNlY29uZHNcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJyk7XHJcbiAgICAgICAgICAgIC8vIFJlZnJlc2ggZGFzaGJvYXJkXHJcbiAgICAgICAgICAgIHVwZGF0ZURhc2hib2FyZCgpO1xyXG4gICAgICAgICAgfSwgMjAwMCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eC5zdGF0dXMgPT09ICdmYWlsZWQnKSB7XHJcbiAgICAgICAgICBzdGF0dXNNZXNzYWdlLnRleHRDb250ZW50ID0gJ+KdjCBUcmFuc2FjdGlvbiBGYWlsZWQnO1xyXG4gICAgICAgICAgc3RhdHVzRGV0YWlscy50ZXh0Q29udGVudCA9ICdUaGUgdHJhbnNhY3Rpb24gd2FzIHJlamVjdGVkIG9yIHJlcGxhY2VkJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMuc3R5bGUuY29sb3IgPSAnI2ZmNDQ0NCc7XHJcbiAgICAgICAgICBwZW5kaW5nQWN0aW9ucy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgICBpZiAocG9sbEludGVydmFsKSB7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwocG9sbEludGVydmFsKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3RhdHVzTWVzc2FnZS50ZXh0Q29udGVudCA9ICfij7MgV2FpdGluZyBmb3IgY29uZmlybWF0aW9uLi4uJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMudGV4dENvbnRlbnQgPSAnVGhpcyB1c3VhbGx5IHRha2VzIDEwLTMwIHNlY29uZHMnO1xyXG4gICAgICAgICAgc3RhdHVzRGV0YWlscy5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1mZy1kaW0pJztcclxuICAgICAgICAgIHBlbmRpbmdBY3Rpb25zLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2hlY2tpbmcgdHJhbnNhY3Rpb24gc3RhdHVzOicsIGVycm9yKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBhd2FpdCB1cGRhdGVTdGF0dXMoKTtcclxuICBwb2xsSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCh1cGRhdGVTdGF0dXMsIDMwMDApO1xyXG5cclxuICAvLyBTZXR1cCBjbG9zZSBidXR0b25cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLXNlbmQtc3RhdHVzJykub25jbGljayA9ICgpID0+IHtcclxuICAgIGlmIChwb2xsSW50ZXJ2YWwpIHtcclxuICAgICAgY2xlYXJJbnRlcnZhbChwb2xsSW50ZXJ2YWwpO1xyXG4gICAgfVxyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpO1xyXG4gICAgdXBkYXRlRGFzaGJvYXJkKCk7XHJcbiAgfTtcclxuXHJcbiAgLy8gU2V0dXAgU3BlZWQgVXAgYnV0dG9uXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1zZW5kLXN0YXR1cy1zcGVlZC11cCcpLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAvLyBUT0RPOiBJbXBsZW1lbnQgc3BlZWQgdXAgdHJhbnNhY3Rpb24gZnVuY3Rpb25hbGl0eVxyXG4gICAgYWxlcnQoJ1NwZWVkIFVwIGZ1bmN0aW9uYWxpdHkgd2lsbCBiZSBpbXBsZW1lbnRlZCBpbiBhIGZ1dHVyZSB1cGRhdGUnKTtcclxuICB9O1xyXG5cclxuICAvLyBTZXR1cCBDYW5jZWwgYnV0dG9uXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1zZW5kLXN0YXR1cy1jYW5jZWwnKS5vbmNsaWNrID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgLy8gVE9ETzogSW1wbGVtZW50IGNhbmNlbCB0cmFuc2FjdGlvbiBmdW5jdGlvbmFsaXR5XHJcbiAgICBhbGVydCgnQ2FuY2VsIGZ1bmN0aW9uYWxpdHkgd2lsbCBiZSBpbXBsZW1lbnRlZCBpbiBhIGZ1dHVyZSB1cGRhdGUnKTtcclxuICB9O1xyXG59XHJcblxyXG4vLyBTaG93IHRyYW5zYWN0aW9uIHN0YXR1cyBmb3IgVG9rZW4gU2VuZFxyXG5hc3luYyBmdW5jdGlvbiBzaG93VG9rZW5TZW5kVHJhbnNhY3Rpb25TdGF0dXModHhIYXNoLCBuZXR3b3JrLCBhbW91bnQsIHN5bWJvbCkge1xyXG4gIC8vIEhpZGUgdG9rZW4gc2VuZCBmb3JtXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXNlbmQtZm9ybScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAvLyBTaG93IHN0YXR1cyBzZWN0aW9uXHJcbiAgY29uc3Qgc3RhdHVzU2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1zZW5kLXN0YXR1cy1zZWN0aW9uJyk7XHJcbiAgc3RhdHVzU2VjdGlvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gUG9wdWxhdGUgdHJhbnNhY3Rpb24gaGFzaFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1zZW5kLXN0YXR1cy1oYXNoJykudGV4dENvbnRlbnQgPSB0eEhhc2g7XHJcblxyXG4gIC8vIFNldHVwIFZpZXcgb24gRXhwbG9yZXIgYnV0dG9uXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi10b2tlbi1zZW5kLXN0YXR1cy1leHBsb3JlcicpLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICBjb25zdCB1cmwgPSBnZXRFeHBsb3JlclVybChuZXR3b3JrLCAndHgnLCB0eEhhc2gpO1xyXG4gICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsIH0pO1xyXG4gIH07XHJcblxyXG4gIC8vIEdldCBhY3RpdmUgd2FsbGV0IGFkZHJlc3NcclxuICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICBjb25zdCBhZGRyZXNzID0gd2FsbGV0Py5hZGRyZXNzO1xyXG5cclxuICAvLyBQb2xsIGZvciB0cmFuc2FjdGlvbiBzdGF0dXNcclxuICBsZXQgcG9sbEludGVydmFsO1xyXG4gIGNvbnN0IHVwZGF0ZVN0YXR1cyA9IGFzeW5jICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgIHR5cGU6ICdHRVRfVFhfQllfSEFTSCcsXHJcbiAgICAgICAgYWRkcmVzczogYWRkcmVzcyxcclxuICAgICAgICB0eEhhc2g6IHR4SGFzaFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzICYmIHJlc3BvbnNlLnRyYW5zYWN0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgdHggPSByZXNwb25zZS50cmFuc2FjdGlvbjtcclxuICAgICAgICBjb25zdCBzdGF0dXNNZXNzYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXNlbmQtc3RhdHVzLW1lc3NhZ2UnKTtcclxuICAgICAgICBjb25zdCBzdGF0dXNEZXRhaWxzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXNlbmQtc3RhdHVzLWRldGFpbHMnKTtcclxuICAgICAgICBjb25zdCBwZW5kaW5nQWN0aW9ucyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1zZW5kLXN0YXR1cy1wZW5kaW5nLWFjdGlvbnMnKTtcclxuXHJcbiAgICAgICAgaWYgKHR4LnN0YXR1cyA9PT0gJ2NvbmZpcm1lZCcpIHtcclxuICAgICAgICAgIHN0YXR1c01lc3NhZ2UudGV4dENvbnRlbnQgPSAn4pyFIFRyYW5zYWN0aW9uIENvbmZpcm1lZCEnO1xyXG4gICAgICAgICAgc3RhdHVzRGV0YWlscy50ZXh0Q29udGVudCA9IGBCbG9jazogJHt0eC5ibG9ja051bWJlcn1gO1xyXG4gICAgICAgICAgc3RhdHVzRGV0YWlscy5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1zdWNjZXNzKSc7XHJcbiAgICAgICAgICBwZW5kaW5nQWN0aW9ucy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgICBpZiAocG9sbEludGVydmFsKSB7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwocG9sbEludGVydmFsKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBOb3RlOiBEZXNrdG9wIG5vdGlmaWNhdGlvbiBpcyBzZW50IGJ5IGJhY2tncm91bmQgc2VydmljZSB3b3JrZXJcclxuICAgICAgICAgIC8vIE5vIG5lZWQgdG8gc2VuZCBhbm90aGVyIG9uZSBoZXJlIHRvIGF2b2lkIGR1cGxpY2F0ZXNcclxuXHJcbiAgICAgICAgICAvLyBBdXRvLWNsb3NlIGFuZCByZXR1cm4gdG8gdG9rZW5zIHNjcmVlbiBhZnRlciAyIHNlY29uZHNcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBzaG93U2NyZWVuKCdzY3JlZW4tdG9rZW5zJyk7XHJcbiAgICAgICAgICAgIC8vIFJlZnJlc2ggdG9rZW5zXHJcbiAgICAgICAgICAgIGxvYWRUb2tlbnNTY3JlZW4oKTtcclxuICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHguc3RhdHVzID09PSAnZmFpbGVkJykge1xyXG4gICAgICAgICAgc3RhdHVzTWVzc2FnZS50ZXh0Q29udGVudCA9ICfinYwgVHJhbnNhY3Rpb24gRmFpbGVkJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMudGV4dENvbnRlbnQgPSAnVGhlIHRyYW5zYWN0aW9uIHdhcyByZWplY3RlZCBvciByZXBsYWNlZCc7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnN0eWxlLmNvbG9yID0gJyNmZjQ0NDQnO1xyXG4gICAgICAgICAgcGVuZGluZ0FjdGlvbnMuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgaWYgKHBvbGxJbnRlcnZhbCkge1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHBvbGxJbnRlcnZhbCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHN0YXR1c01lc3NhZ2UudGV4dENvbnRlbnQgPSAn4o+zIFdhaXRpbmcgZm9yIGNvbmZpcm1hdGlvbi4uLic7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnRleHRDb250ZW50ID0gJ1RoaXMgdXN1YWxseSB0YWtlcyAxMC0zMCBzZWNvbmRzJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMuc3R5bGUuY29sb3IgPSAndmFyKC0tdGVybWluYWwtZmctZGltKSc7XHJcbiAgICAgICAgICBwZW5kaW5nQWN0aW9ucy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNoZWNraW5nIHRyYW5zYWN0aW9uIHN0YXR1czonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgYXdhaXQgdXBkYXRlU3RhdHVzKCk7XHJcbiAgcG9sbEludGVydmFsID0gc2V0SW50ZXJ2YWwodXBkYXRlU3RhdHVzLCAzMDAwKTtcclxuXHJcbiAgLy8gU2V0dXAgY2xvc2UgYnV0dG9uXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS10b2tlbi1zZW5kLXN0YXR1cycpLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICBpZiAocG9sbEludGVydmFsKSB7XHJcbiAgICAgIGNsZWFySW50ZXJ2YWwocG9sbEludGVydmFsKTtcclxuICAgIH1cclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi10b2tlbnMnKTtcclxuICAgIGxvYWRUb2tlbnNTY3JlZW4oKTtcclxuICB9O1xyXG5cclxuICAvLyBTZXR1cCBTcGVlZCBVcCBidXR0b25cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXRva2VuLXNlbmQtc3RhdHVzLXNwZWVkLXVwJykub25jbGljayA9IGFzeW5jICgpID0+IHtcclxuICAgIC8vIFRPRE86IEltcGxlbWVudCBzcGVlZCB1cCB0cmFuc2FjdGlvbiBmdW5jdGlvbmFsaXR5XHJcbiAgICBhbGVydCgnU3BlZWQgVXAgZnVuY3Rpb25hbGl0eSB3aWxsIGJlIGltcGxlbWVudGVkIGluIGEgZnV0dXJlIHVwZGF0ZScpO1xyXG4gIH07XHJcblxyXG4gIC8vIFNldHVwIENhbmNlbCBidXR0b25cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXRva2VuLXNlbmQtc3RhdHVzLWNhbmNlbCcpLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAvLyBUT0RPOiBJbXBsZW1lbnQgY2FuY2VsIHRyYW5zYWN0aW9uIGZ1bmN0aW9uYWxpdHlcclxuICAgIGFsZXJ0KCdDYW5jZWwgZnVuY3Rpb25hbGl0eSB3aWxsIGJlIGltcGxlbWVudGVkIGluIGEgZnV0dXJlIHVwZGF0ZScpO1xyXG4gIH07XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRyYW5zYWN0aW9uQXBwcm92YWxTY3JlZW4ocmVxdWVzdElkKSB7XHJcbiAgLy8gTG9hZCBzZXR0aW5ncyBmb3IgdGhlbWVcclxuICBhd2FpdCBsb2FkU2V0dGluZ3MoKTtcclxuICBhcHBseVRoZW1lKCk7XHJcblxyXG4gIC8vIEdldCB0cmFuc2FjdGlvbiByZXF1ZXN0IGRldGFpbHMgZnJvbSBiYWNrZ3JvdW5kXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX1RSQU5TQUNUSU9OX1JFUVVFU1QnLFxyXG4gICAgICByZXF1ZXN0SWRcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghcmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICBhbGVydCgnVHJhbnNhY3Rpb24gcmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcpO1xyXG4gICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgb3JpZ2luLCB0eFJlcXVlc3QgfSA9IHJlc3BvbnNlO1xyXG5cclxuICAgIC8vIEdldCBhY3RpdmUgd2FsbGV0XHJcbiAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBsb2FkKCdjdXJyZW50TmV0d29yaycpIHx8ICdwdWxzZWNoYWluVGVzdG5ldCc7XHJcblxyXG4gICAgLy8gUG9wdWxhdGUgdHJhbnNhY3Rpb24gZGV0YWlsc1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXNpdGUtb3JpZ2luJykudGV4dENvbnRlbnQgPSBvcmlnaW47XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZnJvbS1hZGRyZXNzJykudGV4dENvbnRlbnQgPSB3YWxsZXQ/LmFkZHJlc3MgfHwgJzB4MDAwMC4uLjAwMDAnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXRvLWFkZHJlc3MnKS50ZXh0Q29udGVudCA9IHR4UmVxdWVzdC50byB8fCAnQ29udHJhY3QgQ3JlYXRpb24nO1xyXG5cclxuICAgIC8vIEZvcm1hdCB2YWx1ZVxyXG4gICAgY29uc3Qgc3ltYm9scyA9IHtcclxuICAgICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3RQTFMnLFxyXG4gICAgICAncHVsc2VjaGFpbic6ICdQTFMnLFxyXG4gICAgICAnZXRoZXJldW0nOiAnRVRIJyxcclxuICAgICAgJ3NlcG9saWEnOiAnU0VQJ1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHN5bWJvbCA9IHN5bWJvbHNbbmV0d29ya10gfHwgJ1RPS0VOJztcclxuXHJcbiAgICBpZiAodHhSZXF1ZXN0LnZhbHVlKSB7XHJcbiAgICAgIGNvbnN0IHZhbHVlID0gZXRoZXJzLmZvcm1hdEV0aGVyKHR4UmVxdWVzdC52YWx1ZSk7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC12YWx1ZScpLnRleHRDb250ZW50ID0gYCR7dmFsdWV9ICR7c3ltYm9sfWA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtdmFsdWUnKS50ZXh0Q29udGVudCA9IGAwICR7c3ltYm9sfWA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2hvdyBkYXRhIHNlY3Rpb24gaWYgdGhlcmUncyBjb250cmFjdCBkYXRhXHJcbiAgICBpZiAodHhSZXF1ZXN0LmRhdGEgJiYgdHhSZXF1ZXN0LmRhdGEgIT09ICcweCcpIHtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRhdGEtc2VjdGlvbicpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGF0YScpLnRleHRDb250ZW50ID0gdHhSZXF1ZXN0LmRhdGE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGF0YS1zZWN0aW9uJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2hvdyB0aGUgdHJhbnNhY3Rpb24gYXBwcm92YWwgc2NyZWVuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tdHJhbnNhY3Rpb24tYXBwcm92YWwnKTtcclxuXHJcbiAgICAvLyBGZXRjaCBhbmQgcG9wdWxhdGUgZ2FzIHByaWNlIG9wdGlvbnNcclxuICAgIGF3YWl0IHBvcHVsYXRlR2FzUHJpY2VzKG5ldHdvcmssIHR4UmVxdWVzdCwgc3ltYm9sKTtcclxuXHJcbiAgICAvLyBGZXRjaCBhbmQgZGlzcGxheSBjdXJyZW50IG5vbmNlXHJcbiAgICBhd2FpdCBmZXRjaEFuZERpc3BsYXlOb25jZSh3YWxsZXQuYWRkcmVzcywgbmV0d29yayk7XHJcblxyXG4gICAgLy8gU2V0dXAgY3VzdG9tIG5vbmNlIGNoZWNrYm94XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VzdG9tLW5vbmNlLWNoZWNrYm94JykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N1c3RvbS1ub25jZS1pbnB1dC1jb250YWluZXInKTtcclxuICAgICAgaWYgKGUudGFyZ2V0LmNoZWNrZWQpIHtcclxuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgLy8gUHJlLWZpbGwgd2l0aCBjdXJyZW50IG5vbmNlXHJcbiAgICAgICAgY29uc3QgY3VycmVudE5vbmNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWN1cnJlbnQtbm9uY2UnKS50ZXh0Q29udGVudDtcclxuICAgICAgICBpZiAoY3VycmVudE5vbmNlICE9PSAnLS0nKSB7XHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VzdG9tLW5vbmNlJykudmFsdWUgPSBjdXJyZW50Tm9uY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2V0dXAgYXBwcm92ZSBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS10cmFuc2FjdGlvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBhcHByb3ZlQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1hcHByb3ZlLXRyYW5zYWN0aW9uJyk7XHJcbiAgICAgIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXBhc3N3b3JkJykudmFsdWU7XHJcbiAgICAgIGNvbnN0IGVycm9yRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZXJyb3InKTtcclxuXHJcbiAgICAgIGlmICghcGFzc3dvcmQpIHtcclxuICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ1BsZWFzZSBlbnRlciB5b3VyIHBhc3N3b3JkJztcclxuICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRGlzYWJsZSBidXR0b24gaW1tZWRpYXRlbHkgdG8gcHJldmVudCBkb3VibGUtY2xpY2tpbmdcclxuICAgICAgYXBwcm92ZUJ0bi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgIGFwcHJvdmVCdG4uc3R5bGUub3BhY2l0eSA9ICcwLjUnO1xyXG4gICAgICBhcHByb3ZlQnRuLnN0eWxlLmN1cnNvciA9ICdub3QtYWxsb3dlZCc7XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhIHRlbXBvcmFyeSBzZXNzaW9uIGZvciB0aGlzIHRyYW5zYWN0aW9uIHVzaW5nIHRoZSBlbnRlcmVkIHBhc3N3b3JkXHJcbiAgICAgICAgLy8gVGhpcyB2YWxpZGF0ZXMgdGhlIHBhc3N3b3JkIHdpdGhvdXQgcGFzc2luZyBpdCBmb3IgdGhlIGFjdHVhbCB0cmFuc2FjdGlvblxyXG4gICAgICAgIGNvbnN0IGFjdGl2ZVdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBTZXNzaW9uUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnQ1JFQVRFX1NFU1NJT04nLFxyXG4gICAgICAgICAgcGFzc3dvcmQsXHJcbiAgICAgICAgICB3YWxsZXRJZDogYWN0aXZlV2FsbGV0LmlkLFxyXG4gICAgICAgICAgZHVyYXRpb25NczogNjAwMDAgLy8gMSBtaW51dGUgdGVtcG9yYXJ5IHNlc3Npb25cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKCF0ZW1wU2Vzc2lvblJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwYXNzd29yZCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gR2V0IHNlbGVjdGVkIGdhcyBwcmljZVxyXG4gICAgICAgIGNvbnN0IGdhc1ByaWNlID0gZ2V0U2VsZWN0ZWRHYXNQcmljZSgpO1xyXG5cclxuICAgICAgICAvLyBHZXQgY3VzdG9tIG5vbmNlIGlmIHByb3ZpZGVkXHJcbiAgICAgICAgY29uc3QgY3VzdG9tTm9uY2VDaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXN0b20tbm9uY2UtY2hlY2tib3gnKTtcclxuICAgICAgICBjb25zdCBjdXN0b21Ob25jZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWN1c3RvbS1ub25jZScpO1xyXG4gICAgICAgIGxldCBjdXN0b21Ob25jZSA9IG51bGw7XHJcbiAgICAgICAgaWYgKGN1c3RvbU5vbmNlQ2hlY2tib3guY2hlY2tlZCAmJiBjdXN0b21Ob25jZUlucHV0LnZhbHVlKSB7XHJcbiAgICAgICAgICBjdXN0b21Ob25jZSA9IHBhcnNlSW50KGN1c3RvbU5vbmNlSW5wdXQudmFsdWUpO1xyXG4gICAgICAgICAgaWYgKGlzTmFOKGN1c3RvbU5vbmNlKSB8fCBjdXN0b21Ob25jZSA8IDApIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGN1c3RvbSBub25jZScpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnVFJBTlNBQ1RJT05fQVBQUk9WQUwnLFxyXG4gICAgICAgICAgcmVxdWVzdElkLFxyXG4gICAgICAgICAgYXBwcm92ZWQ6IHRydWUsXHJcbiAgICAgICAgICBzZXNzaW9uVG9rZW46IHRlbXBTZXNzaW9uUmVzcG9uc2Uuc2Vzc2lvblRva2VuLFxyXG4gICAgICAgICAgZ2FzUHJpY2UsXHJcbiAgICAgICAgICBjdXN0b21Ob25jZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgLy8gSGlkZSBhcHByb3ZhbCBmb3JtIGFuZCBzaG93IHN0YXR1cyBzZWN0aW9uXHJcbiAgICAgICAgICBzaG93VHJhbnNhY3Rpb25TdGF0dXMocmVzcG9uc2UudHhIYXNoLCBhY3RpdmVXYWxsZXQuYWRkcmVzcywgcmVxdWVzdElkKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IHJlc3BvbnNlLmVycm9yIHx8ICdUcmFuc2FjdGlvbiBmYWlsZWQnO1xyXG4gICAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAgIC8vIFJlLWVuYWJsZSBidXR0b24gb24gZXJyb3Igc28gdXNlciBjYW4gdHJ5IGFnYWluXHJcbiAgICAgICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIGVycm9yIHNvIHVzZXIgY2FuIHRyeSBhZ2FpblxyXG4gICAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNldHVwIHJlamVjdCBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVqZWN0LXRyYW5zYWN0aW9uJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgdHlwZTogJ1RSQU5TQUNUSU9OX0FQUFJPVkFMJyxcclxuICAgICAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgICAgIGFwcHJvdmVkOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBDbG9zZSB0aGUgcG9wdXAgd2luZG93XHJcbiAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgYWxlcnQoJ0Vycm9yIHJlamVjdGluZyB0cmFuc2FjdGlvbjogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGFsZXJ0KCdFcnJvciBsb2FkaW5nIHRyYW5zYWN0aW9uOiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgICB3aW5kb3cuY2xvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFRPS0VOIEFERCBBUFBST1ZBTCA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUb2tlbkFkZEFwcHJvdmFsU2NyZWVuKHJlcXVlc3RJZCkge1xyXG4gIC8vIExvYWQgc2V0dGluZ3MgZm9yIHRoZW1lXHJcbiAgYXdhaXQgbG9hZFNldHRpbmdzKCk7XHJcbiAgYXBwbHlUaGVtZSgpO1xyXG5cclxuICAvLyBHZXQgdG9rZW4gYWRkIHJlcXVlc3QgZGV0YWlscyBmcm9tIGJhY2tncm91bmRcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdHRVRfVE9LRU5fQUREX1JFUVVFU1QnLFxyXG4gICAgICByZXF1ZXN0SWRcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghcmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICBhbGVydCgnVG9rZW4gYWRkIHJlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnKTtcclxuICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB7IG9yaWdpbiwgdG9rZW5JbmZvIH0gPSByZXNwb25zZTtcclxuXHJcbiAgICAvLyBQb3B1bGF0ZSB0b2tlbiBkZXRhaWxzXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tc2l0ZS1vcmlnaW4nKS50ZXh0Q29udGVudCA9IG9yaWdpbjtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1zeW1ib2wnKS50ZXh0Q29udGVudCA9IHRva2VuSW5mby5zeW1ib2w7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tYWRkcmVzcycpLnRleHRDb250ZW50ID0gdG9rZW5JbmZvLmFkZHJlc3M7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGVjaW1hbHMnKS50ZXh0Q29udGVudCA9IHRva2VuSW5mby5kZWNpbWFscztcclxuXHJcbiAgICAvLyBTaG93IHRva2VuIGltYWdlIGlmIHByb3ZpZGVkXHJcbiAgICBpZiAodG9rZW5JbmZvLmltYWdlKSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1pbWFnZScpLnNyYyA9IHRva2VuSW5mby5pbWFnZTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWltYWdlLXNlY3Rpb24nKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1pbWFnZS1zZWN0aW9uJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2hvdyB0aGUgdG9rZW4gYXBwcm92YWwgc2NyZWVuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tYWRkLXRva2VuJyk7XHJcblxyXG4gICAgLy8gU2V0dXAgYXBwcm92ZSBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS10b2tlbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBhcHByb3ZlQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1hcHByb3ZlLXRva2VuJyk7XHJcbiAgICAgIGNvbnN0IGVycm9yRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZXJyb3InKTtcclxuXHJcbiAgICAgIC8vIERpc2FibGUgYnV0dG9uIGltbWVkaWF0ZWx5IHRvIHByZXZlbnQgZG91YmxlLWNsaWNraW5nXHJcbiAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMC41JztcclxuICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAnbm90LWFsbG93ZWQnO1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBTZW5kIGFwcHJvdmFsIHRvIGJhY2tncm91bmRcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICAgIHR5cGU6ICdUT0tFTl9BRERfQVBQUk9WQUwnLFxyXG4gICAgICAgICAgcmVxdWVzdElkLFxyXG4gICAgICAgICAgYXBwcm92ZWQ6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIC8vIEFkZCB0aGUgdG9rZW4gdG8gc3RvcmFnZSB1c2luZyBleGlzdGluZyB0b2tlbiBtYW5hZ2VtZW50XHJcbiAgICAgICAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgbG9hZCgnY3VycmVudE5ldHdvcmsnKSB8fCAncHVsc2VjaGFpblRlc3RuZXQnO1xyXG4gICAgICAgICAgYXdhaXQgdG9rZW5zLmFkZEN1c3RvbVRva2VuKG5ldHdvcmssIHRva2VuSW5mby5hZGRyZXNzLCB0b2tlbkluZm8uc3ltYm9sLCB0b2tlbkluZm8uZGVjaW1hbHMpO1xyXG5cclxuICAgICAgICAgIC8vIENsb3NlIHRoZSBwb3B1cCB3aW5kb3dcclxuICAgICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gcmVzcG9uc2UuZXJyb3IgfHwgJ0ZhaWxlZCB0byBhZGQgdG9rZW4nO1xyXG4gICAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAgIC8vIFJlLWVuYWJsZSBidXR0b24gb24gZXJyb3Igc28gdXNlciBjYW4gdHJ5IGFnYWluXHJcbiAgICAgICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIGVycm9yIHNvIHVzZXIgY2FuIHRyeSBhZ2FpblxyXG4gICAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNldHVwIHJlamVjdCBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVqZWN0LXRva2VuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgdHlwZTogJ1RPS0VOX0FERF9BUFBST1ZBTCcsXHJcbiAgICAgICAgICByZXF1ZXN0SWQsXHJcbiAgICAgICAgICBhcHByb3ZlZDogZmFsc2VcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQ2xvc2UgdGhlIHBvcHVwIHdpbmRvd1xyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGFsZXJ0KCdFcnJvciByZWplY3RpbmcgdG9rZW46ICcgKyBlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBhbGVydCgnRXJyb3IgbG9hZGluZyB0b2tlbiBhZGQgcmVxdWVzdDogJyArIHNhbml0aXplRXJyb3IoZXJyb3IubWVzc2FnZSkpO1xyXG4gICAgd2luZG93LmNsb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBNRVNTQUdFIFNJR05JTkcgQVBQUk9WQUwgSEFORExFUlMgPT09PT1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2VTaWduQXBwcm92YWxTY3JlZW4ocmVxdWVzdElkKSB7XHJcbiAgLy8gTG9hZCBzZXR0aW5ncyBmb3IgdGhlbWVcclxuICBhd2FpdCBsb2FkU2V0dGluZ3MoKTtcclxuICBhcHBseVRoZW1lKCk7XHJcblxyXG4gIC8vIEdldCBzaWduIHJlcXVlc3QgZGV0YWlscyBmcm9tIGJhY2tncm91bmRcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdHRVRfU0lHTl9SRVFVRVNUJyxcclxuICAgICAgcmVxdWVzdElkXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5vcmlnaW4pIHtcclxuICAgICAgYWxlcnQoJ1NpZ24gcmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcpO1xyXG4gICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgb3JpZ2luLCBtZXRob2QsIHNpZ25SZXF1ZXN0IH0gPSByZXNwb25zZTtcclxuICAgIGNvbnN0IHsgbWVzc2FnZSwgYWRkcmVzcyB9ID0gc2lnblJlcXVlc3Q7XHJcblxyXG4gICAgLy8gUG9wdWxhdGUgc2lnbiBkZXRhaWxzXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi1zaXRlLW9yaWdpbicpLnRleHRDb250ZW50ID0gb3JpZ2luO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tYWRkcmVzcycpLnRleHRDb250ZW50ID0gYWRkcmVzcztcclxuXHJcbiAgICAvLyBGb3JtYXQgbWVzc2FnZSBmb3IgZGlzcGxheVxyXG4gICAgY29uc3QgbWVzc2FnZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tbWVzc2FnZS1jb250ZW50Jyk7XHJcbiAgICBsZXQgZGlzcGxheU1lc3NhZ2UgPSBtZXNzYWdlO1xyXG5cclxuICAgIC8vIENoZWNrIGlmIG1lc3NhZ2UgaXMgaGV4LWVuY29kZWRcclxuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgbWVzc2FnZS5zdGFydHNXaXRoKCcweCcpKSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLW1lc3NhZ2UtaGV4LXdhcm5pbmcnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgLy8gVHJ5IHRvIGRlY29kZSBpZiBpdCdzIHJlYWRhYmxlIHRleHRcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBieXRlcyA9IGV0aGVycy5nZXRCeXRlcyhtZXNzYWdlKTtcclxuICAgICAgICBjb25zdCBkZWNvZGVkID0gZXRoZXJzLnRvVXRmOFN0cmluZyhieXRlcyk7XHJcbiAgICAgICAgaWYgKC9eW1xceDIwLVxceDdFXFxzXSskLy50ZXN0KGRlY29kZWQpKSB7XHJcbiAgICAgICAgICBkaXNwbGF5TWVzc2FnZSA9IGRlY29kZWQgKyAnXFxuXFxuW0hleDogJyArIG1lc3NhZ2UgKyAnXSc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICAvLyBLZWVwIGFzIGhleCBpZiBkZWNvZGluZyBmYWlsc1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi1tZXNzYWdlLWhleC13YXJuaW5nJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgbWVzc2FnZUVsLnRleHRDb250ZW50ID0gZGlzcGxheU1lc3NhZ2U7XHJcblxyXG4gICAgLy8gU2hvdyB0aGUgc2lnbmluZyBhcHByb3ZhbCBzY3JlZW5cclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1zaWduLW1lc3NhZ2UnKTtcclxuXHJcbiAgICAvLyBTZXR1cCBhcHByb3ZlIGJ1dHRvblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1hcHByb3ZlLXNpZ24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgICAgY29uc3QgYXBwcm92ZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS1zaWduJyk7XHJcbiAgICAgIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tcGFzc3dvcmQnKS52YWx1ZTtcclxuICAgICAgY29uc3QgZXJyb3JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLWVycm9yJyk7XHJcblxyXG4gICAgICBpZiAoIXBhc3N3b3JkKSB7XHJcbiAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdQbGVhc2UgZW50ZXIgeW91ciBwYXNzd29yZCc7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIERpc2FibGUgYnV0dG9uIGltbWVkaWF0ZWx5IHRvIHByZXZlbnQgZG91YmxlLWNsaWNraW5nXHJcbiAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMC41JztcclxuICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAnbm90LWFsbG93ZWQnO1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgYSB0ZW1wb3Jhcnkgc2Vzc2lvbiBmb3IgdGhpcyBzaWduaW5nIHVzaW5nIHRoZSBlbnRlcmVkIHBhc3N3b3JkXHJcbiAgICAgICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICAgICAgY29uc3QgdGVtcFNlc3Npb25SZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICAgIHR5cGU6ICdDUkVBVEVfU0VTU0lPTicsXHJcbiAgICAgICAgICBwYXNzd29yZCxcclxuICAgICAgICAgIHdhbGxldElkOiBhY3RpdmVXYWxsZXQuaWQsXHJcbiAgICAgICAgICBkdXJhdGlvbk1zOiA2MDAwMCAvLyAxIG1pbnV0ZSB0ZW1wb3Jhcnkgc2Vzc2lvblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoIXRlbXBTZXNzaW9uUmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHBhc3N3b3JkJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICAgIHR5cGU6ICdTSUdOX0FQUFJPVkFMJyxcclxuICAgICAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgICAgIGFwcHJvdmVkOiB0cnVlLFxyXG4gICAgICAgICAgc2Vzc2lvblRva2VuOiB0ZW1wU2Vzc2lvblJlc3BvbnNlLnNlc3Npb25Ub2tlblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgLy8gQ2xvc2UgdGhlIHBvcHVwIHdpbmRvd1xyXG4gICAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSByZXNwb25zZS5lcnJvciB8fCAnU2lnbmluZyBmYWlsZWQnO1xyXG4gICAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAgIC8vIFJlLWVuYWJsZSBidXR0b24gb24gZXJyb3Igc28gdXNlciBjYW4gdHJ5IGFnYWluXHJcbiAgICAgICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIGVycm9yIHNvIHVzZXIgY2FuIHRyeSBhZ2FpblxyXG4gICAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNldHVwIHJlamVjdCBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVqZWN0LXNpZ24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnU0lHTl9BUFBST1ZBTCcsXHJcbiAgICAgICAgICByZXF1ZXN0SWQsXHJcbiAgICAgICAgICBhcHByb3ZlZDogZmFsc2VcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQ2xvc2UgdGhlIHBvcHVwIHdpbmRvd1xyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGFsZXJ0KCdFcnJvciByZWplY3Rpbmcgc2lnbiByZXF1ZXN0OiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0Vycm9yIGxvYWRpbmcgc2lnbiByZXF1ZXN0OiAnICsgc2FuaXRpemVFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICB3aW5kb3cuY2xvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVR5cGVkRGF0YVNpZ25BcHByb3ZhbFNjcmVlbihyZXF1ZXN0SWQpIHtcclxuICAvLyBMb2FkIHNldHRpbmdzIGZvciB0aGVtZVxyXG4gIGF3YWl0IGxvYWRTZXR0aW5ncygpO1xyXG4gIGFwcGx5VGhlbWUoKTtcclxuXHJcbiAgLy8gR2V0IHNpZ24gcmVxdWVzdCBkZXRhaWxzIGZyb20gYmFja2dyb3VuZFxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0dFVF9TSUdOX1JFUVVFU1QnLFxyXG4gICAgICByZXF1ZXN0SWRcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLm9yaWdpbikge1xyXG4gICAgICBhbGVydCgnU2lnbiByZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyk7XHJcbiAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyBvcmlnaW4sIG1ldGhvZCwgc2lnblJlcXVlc3QgfSA9IHJlc3BvbnNlO1xyXG4gICAgY29uc3QgeyB0eXBlZERhdGEsIGFkZHJlc3MgfSA9IHNpZ25SZXF1ZXN0O1xyXG5cclxuICAgIC8vIFBvcHVsYXRlIHNpZ24gZGV0YWlsc1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tdHlwZWQtc2l0ZS1vcmlnaW4nKS50ZXh0Q29udGVudCA9IG9yaWdpbjtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLXR5cGVkLWFkZHJlc3MnKS50ZXh0Q29udGVudCA9IGFkZHJlc3M7XHJcblxyXG4gICAgLy8gUG9wdWxhdGUgZG9tYWluIGluZm9ybWF0aW9uXHJcbiAgICBpZiAodHlwZWREYXRhLmRvbWFpbikge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi10eXBlZC1kb21haW4tbmFtZScpLnRleHRDb250ZW50ID0gdHlwZWREYXRhLmRvbWFpbi5uYW1lIHx8ICdVbmtub3duJztcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tdHlwZWQtZG9tYWluLWNoYWluJykudGV4dENvbnRlbnQgPSB0eXBlZERhdGEuZG9tYWluLmNoYWluSWQgfHwgJy0tJztcclxuXHJcbiAgICAgIGlmICh0eXBlZERhdGEuZG9tYWluLnZlcmlmeWluZ0NvbnRyYWN0KSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tdHlwZWQtZG9tYWluLWNvbnRyYWN0JykudGV4dENvbnRlbnQgPSB0eXBlZERhdGEuZG9tYWluLnZlcmlmeWluZ0NvbnRyYWN0O1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLXR5cGVkLWRvbWFpbi1jb250cmFjdC1yb3cnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi10eXBlZC1kb21haW4tY29udHJhY3Qtcm93JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBGb3JtYXQgdHlwZWQgZGF0YSBmb3IgZGlzcGxheVxyXG4gICAgY29uc3QgbWVzc2FnZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tdHlwZWQtbWVzc2FnZS1jb250ZW50Jyk7XHJcbiAgICBjb25zdCBkaXNwbGF5RGF0YSA9IHtcclxuICAgICAgcHJpbWFyeVR5cGU6IHR5cGVkRGF0YS5wcmltYXJ5VHlwZSB8fCAnVW5rbm93bicsXHJcbiAgICAgIG1lc3NhZ2U6IHR5cGVkRGF0YS5tZXNzYWdlXHJcbiAgICB9O1xyXG4gICAgbWVzc2FnZUVsLnRleHRDb250ZW50ID0gSlNPTi5zdHJpbmdpZnkoZGlzcGxheURhdGEsIG51bGwsIDIpO1xyXG5cclxuICAgIC8vIFNob3cgdGhlIHNpZ25pbmcgYXBwcm92YWwgc2NyZWVuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tc2lnbi10eXBlZC1kYXRhJyk7XHJcblxyXG4gICAgLy8gU2V0dXAgYXBwcm92ZSBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS1zaWduLXR5cGVkJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFwcHJvdmVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWFwcHJvdmUtc2lnbi10eXBlZCcpO1xyXG4gICAgICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLXR5cGVkLXBhc3N3b3JkJykudmFsdWU7XHJcbiAgICAgIGNvbnN0IGVycm9yRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi10eXBlZC1lcnJvcicpO1xyXG5cclxuICAgICAgaWYgKCFwYXNzd29yZCkge1xyXG4gICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSAnUGxlYXNlIGVudGVyIHlvdXIgcGFzc3dvcmQnO1xyXG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBEaXNhYmxlIGJ1dHRvbiBpbW1lZGlhdGVseSB0byBwcmV2ZW50IGRvdWJsZS1jbGlja2luZ1xyXG4gICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzAuNSc7XHJcbiAgICAgIGFwcHJvdmVCdG4uc3R5bGUuY3Vyc29yID0gJ25vdC1hbGxvd2VkJztcclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IHNlc3Npb24gZm9yIHRoaXMgc2lnbmluZyB1c2luZyB0aGUgZW50ZXJlZCBwYXNzd29yZFxyXG4gICAgICAgIGNvbnN0IGFjdGl2ZVdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBTZXNzaW9uUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnQ1JFQVRFX1NFU1NJT04nLFxyXG4gICAgICAgICAgcGFzc3dvcmQsXHJcbiAgICAgICAgICB3YWxsZXRJZDogYWN0aXZlV2FsbGV0LmlkLFxyXG4gICAgICAgICAgZHVyYXRpb25NczogNjAwMDAgLy8gMSBtaW51dGUgdGVtcG9yYXJ5IHNlc3Npb25cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKCF0ZW1wU2Vzc2lvblJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwYXNzd29yZCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnU0lHTl9BUFBST1ZBTCcsXHJcbiAgICAgICAgICByZXF1ZXN0SWQsXHJcbiAgICAgICAgICBhcHByb3ZlZDogdHJ1ZSxcclxuICAgICAgICAgIHNlc3Npb25Ub2tlbjogdGVtcFNlc3Npb25SZXNwb25zZS5zZXNzaW9uVG9rZW5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIC8vIENsb3NlIHRoZSBwb3B1cCB3aW5kb3dcclxuICAgICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gcmVzcG9uc2UuZXJyb3IgfHwgJ1NpZ25pbmcgZmFpbGVkJztcclxuICAgICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIGVycm9yIHNvIHVzZXIgY2FuIHRyeSBhZ2FpblxyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgLy8gUmUtZW5hYmxlIGJ1dHRvbiBvbiBlcnJvciBzbyB1c2VyIGNhbiB0cnkgYWdhaW5cclxuICAgICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICAgIGFwcHJvdmVCdG4uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTZXR1cCByZWplY3QgYnV0dG9uXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlamVjdC1zaWduLXR5cGVkJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgdHlwZTogJ1NJR05fQVBQUk9WQUwnLFxyXG4gICAgICAgICAgcmVxdWVzdElkLFxyXG4gICAgICAgICAgYXBwcm92ZWQ6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIENsb3NlIHRoZSBwb3B1cCB3aW5kb3dcclxuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBhbGVydCgnRXJyb3IgcmVqZWN0aW5nIHNpZ24gcmVxdWVzdDogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGFsZXJ0KCdFcnJvciBsb2FkaW5nIHR5cGVkIGRhdGEgc2lnbiByZXF1ZXN0OiAnICsgc2FuaXRpemVFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICB3aW5kb3cuY2xvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFRSQU5TQUNUSU9OIEhJU1RPUlkgPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlUGVuZGluZ1R4SW5kaWNhdG9yKCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX1BFTkRJTkdfVFhfQ09VTlQnLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzc1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgaW5kaWNhdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlbmRpbmctdHgtaW5kaWNhdG9yJyk7XHJcbiAgICBjb25zdCB0ZXh0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGVuZGluZy10eC10ZXh0Jyk7XHJcblxyXG4gICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MgJiYgcmVzcG9uc2UuY291bnQgPiAwKSB7XHJcbiAgICAgIHRleHRFbC50ZXh0Q29udGVudCA9IGDimqDvuI8gJHtyZXNwb25zZS5jb3VudH0gUGVuZGluZyBUcmFuc2FjdGlvbiR7cmVzcG9uc2UuY291bnQgPiAxID8gJ3MnIDogJyd9YDtcclxuICAgICAgaW5kaWNhdG9yLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaW5kaWNhdG9yLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjaGVja2luZyBwZW5kaW5nIHRyYW5zYWN0aW9uczonLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzaG93VHJhbnNhY3Rpb25IaXN0b3J5KCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MpIHJldHVybjtcclxuXHJcbiAgc2hvd1NjcmVlbignc2NyZWVuLXR4LWhpc3RvcnknKTtcclxuICBhd2FpdCByZW5kZXJUcmFuc2FjdGlvbkhpc3RvcnkoJ2FsbCcpO1xyXG59XHJcblxyXG4vLyBSZWZyZXNoIHRyYW5zYWN0aW9uIGZyb20gdGhlIGxpc3Qgdmlld1xyXG5hc3luYyBmdW5jdGlvbiByZWZyZXNoVHJhbnNhY3Rpb25Gcm9tTGlzdCh0eEhhc2gpIHtcclxuICBpZiAoIWN1cnJlbnRTdGF0ZS5hZGRyZXNzKSByZXR1cm47XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBHZXQgdHJhbnNhY3Rpb24gdG8gZ2V0IG5ldHdvcmtcclxuICAgIGNvbnN0IHR4UmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdHRVRfVFhfQllfSEFTSCcsXHJcbiAgICAgIGFkZHJlc3M6IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLFxyXG4gICAgICB0eEhhc2g6IHR4SGFzaFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCF0eFJlc3BvbnNlLnN1Y2Nlc3MgfHwgIXR4UmVzcG9uc2UudHJhbnNhY3Rpb24pIHtcclxuICAgICAgYWxlcnQoJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCcpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbmV0d29yayA9IHR4UmVzcG9uc2UudHJhbnNhY3Rpb24ubmV0d29yaztcclxuXHJcbiAgICAvLyBSZWZyZXNoIHN0YXR1cyBmcm9tIGJsb2NrY2hhaW5cclxuICAgIGNvbnN0IHJlZnJlc2hSZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ1JFRlJFU0hfVFhfU1RBVFVTJyxcclxuICAgICAgYWRkcmVzczogY3VycmVudFN0YXRlLmFkZHJlc3MsXHJcbiAgICAgIHR4SGFzaDogdHhIYXNoLFxyXG4gICAgICBuZXR3b3JrOiBuZXR3b3JrXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXJlZnJlc2hSZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgIGFsZXJ0KCdFcnJvcjogJyArIHJlZnJlc2hSZXNwb25zZS5lcnJvcik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTaG93IGJyaWVmIG5vdGlmaWNhdGlvblxyXG4gICAgaWYgKHJlZnJlc2hSZXNwb25zZS5zdGF0dXMgPT09ICdjb25maXJtZWQnKSB7XHJcbiAgICAgIGFsZXJ0KGDinIUgVHJhbnNhY3Rpb24gY29uZmlybWVkIG9uIGJsb2NrICR7cmVmcmVzaFJlc3BvbnNlLmJsb2NrTnVtYmVyfSFgKTtcclxuICAgIH0gZWxzZSBpZiAocmVmcmVzaFJlc3BvbnNlLnN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcclxuICAgICAgYWxlcnQoJ+KdjCBUcmFuc2FjdGlvbiBmYWlsZWQgb24gYmxvY2tjaGFpbicpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWxlcnQoJ+KPsyBTdGlsbCBwZW5kaW5nIG9uIGJsb2NrY2hhaW4nKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZWZyZXNoIHRoZSB0cmFuc2FjdGlvbiBsaXN0IHRvIHNob3cgdXBkYXRlZCBzdGF0dXNcclxuICAgIGF3YWl0IHJlbmRlclRyYW5zYWN0aW9uSGlzdG9yeShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbaWRePVwiZmlsdGVyLVwiXVtjbGFzcyo9XCJhY3RpdmVcIl0nKT8uaWQucmVwbGFjZSgnZmlsdGVyLScsICcnKS5yZXBsYWNlKCctdHhzJywgJycpIHx8ICdhbGwnKTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHJlZnJlc2hpbmcgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgYWxlcnQoJ0Vycm9yIHJlZnJlc2hpbmcgc3RhdHVzJyk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZW5kZXJUcmFuc2FjdGlvbkhpc3RvcnkoZmlsdGVyID0gJ2FsbCcpIHtcclxuICBjb25zdCBsaXN0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtaGlzdG9yeS1saXN0Jyk7XHJcbiAgaWYgKCFjdXJyZW50U3RhdGUuYWRkcmVzcykge1xyXG4gICAgbGlzdEVsLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtZGltXCI+Tm8gYWRkcmVzcyBzZWxlY3RlZDwvcD4nO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgbGlzdEVsLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtZGltXCI+TG9hZGluZy4uLjwvcD4nO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdHRVRfVFhfSElTVE9SWScsXHJcbiAgICAgIGFkZHJlc3M6IGN1cnJlbnRTdGF0ZS5hZGRyZXNzXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlLnN1Y2Nlc3MgfHwgIXJlc3BvbnNlLnRyYW5zYWN0aW9ucyB8fCByZXNwb25zZS50cmFuc2FjdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGxpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPk5vIHRyYW5zYWN0aW9uczwvcD4nO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHRyYW5zYWN0aW9ucyA9IHJlc3BvbnNlLnRyYW5zYWN0aW9ucztcclxuXHJcbiAgICAvLyBBcHBseSBmaWx0ZXJcclxuICAgIGlmIChmaWx0ZXIgPT09ICdwZW5kaW5nJykge1xyXG4gICAgICB0cmFuc2FjdGlvbnMgPSB0cmFuc2FjdGlvbnMuZmlsdGVyKHR4ID0+IHR4LnN0YXR1cyA9PT0gJ3BlbmRpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoZmlsdGVyID09PSAnY29uZmlybWVkJykge1xyXG4gICAgICB0cmFuc2FjdGlvbnMgPSB0cmFuc2FjdGlvbnMuZmlsdGVyKHR4ID0+IHR4LnN0YXR1cyA9PT0gJ2NvbmZpcm1lZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0cmFuc2FjdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGxpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPk5vIHRyYW5zYWN0aW9ucyBpbiB0aGlzIGZpbHRlcjwvcD4nO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGh0bWwgPSAnJztcclxuICAgIGZvciAoY29uc3QgdHggb2YgdHJhbnNhY3Rpb25zKSB7XHJcbiAgICAgIGNvbnN0IHN0YXR1c0ljb24gPSB0eC5zdGF0dXMgPT09ICdwZW5kaW5nJyA/ICfij7MnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHguc3RhdHVzID09PSAnY29uZmlybWVkJyA/ICfinIUnIDogJ+KdjCc7XHJcbiAgICAgIGNvbnN0IHN0YXR1c0NvbG9yID0gdHguc3RhdHVzID09PSAncGVuZGluZycgPyAndmFyKC0tdGVybWluYWwtd2FybmluZyknIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHR4LnN0YXR1cyA9PT0gJ2NvbmZpcm1lZCcgPyAnIzQ0ZmY0NCcgOiAnI2ZmNDQ0NCc7XHJcblxyXG4gICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUodHgudGltZXN0YW1wKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICBjb25zdCB2YWx1ZUV0aCA9IGV0aGVycy5mb3JtYXRFdGhlcih0eC52YWx1ZSB8fCAnMCcpO1xyXG4gICAgICBjb25zdCBnYXNHd2VpID0gZXRoZXJzLmZvcm1hdFVuaXRzKHR4Lmdhc1ByaWNlIHx8ICcwJywgJ2d3ZWknKTtcclxuXHJcbiAgICAgIC8vIEFkZCByZWZyZXNoIGJ1dHRvbiBmb3IgcGVuZGluZyB0cmFuc2FjdGlvbnNcclxuICAgICAgY29uc3QgcmVmcmVzaEJ1dHRvbiA9IHR4LnN0YXR1cyA9PT0gJ3BlbmRpbmcnXHJcbiAgICAgICAgPyBgPGJ1dHRvbiBjbGFzcz1cImJ0bi1zbWFsbFwiIHN0eWxlPVwiZm9udC1zaXplOiA5cHg7IHBhZGRpbmc6IDRweCA4cHg7IG1hcmdpbi1sZWZ0OiA4cHg7XCIgZGF0YS1yZWZyZXNoLXR4PVwiJHt0eC5oYXNofVwiPvCflIQgUmVmcmVzaDwvYnV0dG9uPmBcclxuICAgICAgICA6ICcnO1xyXG5cclxuICAgICAgaHRtbCArPSBgXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInBhbmVsIG1iLTJcIiBzdHlsZT1cInBhZGRpbmc6IDEycHg7IGN1cnNvcjogcG9pbnRlcjsgYm9yZGVyLWNvbG9yOiAke3N0YXR1c0NvbG9yfTtcIiBkYXRhLXR4LWhhc2g9XCIke3R4Lmhhc2h9XCI+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBhbGlnbi1pdGVtczogY2VudGVyOyBtYXJnaW4tYm90dG9tOiA4cHg7XCI+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPlxyXG4gICAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiY29sb3I6ICR7c3RhdHVzQ29sb3J9OyBmb250LXNpemU6IDE0cHg7XCI+JHtzdGF0dXNJY29ufSAke3R4LnN0YXR1cy50b1VwcGVyQ2FzZSgpfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAke3JlZnJlc2hCdXR0b259XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDEwcHg7XCI+JHtkYXRlfTwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMHB4OyBtYXJnaW4tYm90dG9tOiA0cHg7XCI+SGFzaDogJHt0eC5oYXNoLnNsaWNlKDAsIDIwKX0uLi48L3A+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDEwcHg7IG1hcmdpbi1ib3R0b206IDRweDtcIj5WYWx1ZTogJHt2YWx1ZUV0aH0gJHtnZXROZXR3b3JrU3ltYm9sKHR4Lm5ldHdvcmspfTwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTBweDtcIj5HYXM6ICR7Z2FzR3dlaX0gR3dlaSDigKIgTm9uY2U6ICR7dHgubm9uY2V9PC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICBgO1xyXG4gICAgfVxyXG5cclxuICAgIGxpc3RFbC5pbm5lckhUTUwgPSBodG1sO1xyXG5cclxuICAgIC8vIEFkZCBjbGljayBoYW5kbGVycyBmb3IgdHJhbnNhY3Rpb24gaXRlbXNcclxuICAgIGxpc3RFbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS10eC1oYXNoXScpLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBjb25zdCB0eEhhc2ggPSBlbC5kYXRhc2V0LnR4SGFzaDtcclxuICAgICAgICBzaG93VHJhbnNhY3Rpb25EZXRhaWxzKHR4SGFzaCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQWRkIGNsaWNrIGhhbmRsZXJzIGZvciByZWZyZXNoIGJ1dHRvbnNcclxuICAgIGxpc3RFbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1yZWZyZXNoLXR4XScpLmZvckVhY2goYnRuID0+IHtcclxuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGUpID0+IHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7IC8vIFByZXZlbnQgZGVmYXVsdCBidXR0b24gYmVoYXZpb3JcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpOyAvLyBQcmV2ZW50IG9wZW5pbmcgdHJhbnNhY3Rpb24gZGV0YWlsc1xyXG4gICAgICAgIGNvbnN0IHR4SGFzaCA9IGJ0bi5kYXRhc2V0LnJlZnJlc2hUeDtcclxuICAgICAgICBhd2FpdCByZWZyZXNoVHJhbnNhY3Rpb25Gcm9tTGlzdCh0eEhhc2gpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgbG9hZGluZyB0cmFuc2FjdGlvbiBoaXN0b3J5OicsIGVycm9yKTtcclxuICAgIGxpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPkVycm9yIGxvYWRpbmcgdHJhbnNhY3Rpb25zPC9wPic7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBSZWZyZXNoIHRyYW5zYWN0aW9uIHN0YXR1cyBmcm9tIGJsb2NrY2hhaW5cclxuYXN5bmMgZnVuY3Rpb24gcmVmcmVzaFRyYW5zYWN0aW9uU3RhdHVzKCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MgfHwgIWN1cnJlbnRTdGF0ZS5jdXJyZW50VHhIYXNoKSByZXR1cm47XHJcblxyXG4gIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVmcmVzaC10eC1zdGF0dXMnKTtcclxuICBpZiAoIWJ0bikgcmV0dXJuO1xyXG5cclxuICB0cnkge1xyXG4gICAgYnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIGJ0bi50ZXh0Q29udGVudCA9ICfij7MgQ2hlY2tpbmcgYmxvY2tjaGFpbi4uLic7XHJcblxyXG4gICAgLy8gR2V0IGN1cnJlbnQgdHJhbnNhY3Rpb24gdG8gZ2V0IG5ldHdvcmtcclxuICAgIGNvbnN0IHR4UmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdHRVRfVFhfQllfSEFTSCcsXHJcbiAgICAgIGFkZHJlc3M6IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLFxyXG4gICAgICB0eEhhc2g6IGN1cnJlbnRTdGF0ZS5jdXJyZW50VHhIYXNoXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXR4UmVzcG9uc2Uuc3VjY2VzcyB8fCAhdHhSZXNwb25zZS50cmFuc2FjdGlvbikge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5ldHdvcmsgPSB0eFJlc3BvbnNlLnRyYW5zYWN0aW9uLm5ldHdvcms7XHJcblxyXG4gICAgLy8gUmVmcmVzaCBzdGF0dXMgZnJvbSBibG9ja2NoYWluXHJcbiAgICBjb25zdCByZWZyZXNoUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdSRUZSRVNIX1RYX1NUQVRVUycsXHJcbiAgICAgIGFkZHJlc3M6IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLFxyXG4gICAgICB0eEhhc2g6IGN1cnJlbnRTdGF0ZS5jdXJyZW50VHhIYXNoLFxyXG4gICAgICBuZXR3b3JrOiBuZXR3b3JrXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXJlZnJlc2hSZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihyZWZyZXNoUmVzcG9uc2UuZXJyb3IgfHwgJ0ZhaWxlZCB0byByZWZyZXNoIHN0YXR1cycpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNob3cgcmVzdWx0IG1lc3NhZ2VcclxuICAgIGlmIChyZWZyZXNoUmVzcG9uc2Uuc3RhdHVzID09PSAncGVuZGluZycpIHtcclxuICAgICAgYWxlcnQoJ+KciyBUcmFuc2FjdGlvbiBpcyBzdGlsbCBwZW5kaW5nIG9uIHRoZSBibG9ja2NoYWluLlxcblxcbkl0IGhhcyBub3QgYmVlbiBtaW5lZCB5ZXQuJyk7XHJcbiAgICB9IGVsc2UgaWYgKHJlZnJlc2hSZXNwb25zZS5zdGF0dXMgPT09ICdjb25maXJtZWQnKSB7XHJcbiAgICAgIGFsZXJ0KGDinIUgU3RhdHVzIHVwZGF0ZWQhXFxuXFxuVHJhbnNhY3Rpb24gaXMgQ09ORklSTUVEIG9uIGJsb2NrICR7cmVmcmVzaFJlc3BvbnNlLmJsb2NrTnVtYmVyfWApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWxlcnQoJ+KdjCBTdGF0dXMgdXBkYXRlZCFcXG5cXG5UcmFuc2FjdGlvbiBGQUlMRUQgb24gdGhlIGJsb2NrY2hhaW4uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVsb2FkIHRyYW5zYWN0aW9uIGRldGFpbHMgdG8gc2hvdyB1cGRhdGVkIHN0YXR1c1xyXG4gICAgYXdhaXQgc2hvd1RyYW5zYWN0aW9uRGV0YWlscyhjdXJyZW50U3RhdGUuY3VycmVudFR4SGFzaCk7XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciByZWZyZXNoaW5nIHRyYW5zYWN0aW9uIHN0YXR1czonLCBlcnJvcik7XHJcbiAgICBhbGVydCgnRXJyb3IgcmVmcmVzaGluZyBzdGF0dXM6ICcgKyBlcnJvci5tZXNzYWdlKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgYnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICBidG4udGV4dENvbnRlbnQgPSAn8J+UhCBSRUZSRVNIIFNUQVRVUyBGUk9NIEJMT0NLQ0hBSU4nO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2hvd1RyYW5zYWN0aW9uRGV0YWlscyh0eEhhc2gpIHtcclxuICBpZiAoIWN1cnJlbnRTdGF0ZS5hZGRyZXNzKSByZXR1cm47XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0dFVF9UWF9CWV9IQVNIJyxcclxuICAgICAgYWRkcmVzczogY3VycmVudFN0YXRlLmFkZHJlc3MsXHJcbiAgICAgIHR4SGFzaDogdHhIYXNoXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlLnN1Y2Nlc3MgfHwgIXJlc3BvbnNlLnRyYW5zYWN0aW9uKSB7XHJcbiAgICAgIGFsZXJ0KCdUcmFuc2FjdGlvbiBub3QgZm91bmQnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHR4ID0gcmVzcG9uc2UudHJhbnNhY3Rpb247XHJcblxyXG4gICAgLy8gU2hvdyBzY3JlZW5cclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi10eC1kZXRhaWxzJyk7XHJcblxyXG4gICAgLy8gUG9wdWxhdGUgZGV0YWlsc1xyXG4gICAgY29uc3Qgc3RhdHVzQmFkZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc3RhdHVzLWJhZGdlJyk7XHJcbiAgICBjb25zdCBzdGF0dXNUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXN0YXR1cy10ZXh0Jyk7XHJcblxyXG4gICAgaWYgKHR4LnN0YXR1cyA9PT0gJ3BlbmRpbmcnKSB7XHJcbiAgICAgIHN0YXR1c1RleHQudGV4dENvbnRlbnQgPSAn4o+zIFBFTkRJTkcnO1xyXG4gICAgICBzdGF0dXNCYWRnZS5zdHlsZS5ib3JkZXJDb2xvciA9ICd2YXIoLS10ZXJtaW5hbC13YXJuaW5nKSc7XHJcbiAgICAgIHN0YXR1c1RleHQuc3R5bGUuY29sb3IgPSAndmFyKC0tdGVybWluYWwtd2FybmluZyknO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtcGVuZGluZy1hY3Rpb25zJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kZXRhaWwtYmxvY2stc2VjdGlvbicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgfSBlbHNlIGlmICh0eC5zdGF0dXMgPT09ICdjb25maXJtZWQnKSB7XHJcbiAgICAgIHN0YXR1c1RleHQudGV4dENvbnRlbnQgPSAn4pyFIENPTkZJUk1FRCc7XHJcbiAgICAgIHN0YXR1c0JhZGdlLnN0eWxlLmJvcmRlckNvbG9yID0gJyM0NGZmNDQnO1xyXG4gICAgICBzdGF0dXNUZXh0LnN0eWxlLmNvbG9yID0gJyM0NGZmNDQnO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtcGVuZGluZy1hY3Rpb25zJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kZXRhaWwtYmxvY2stc2VjdGlvbicpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLWJsb2NrJykudGV4dENvbnRlbnQgPSB0eC5ibG9ja051bWJlciB8fCAnLS0nO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3RhdHVzVGV4dC50ZXh0Q29udGVudCA9ICfinYwgRkFJTEVEJztcclxuICAgICAgc3RhdHVzQmFkZ2Uuc3R5bGUuYm9yZGVyQ29sb3IgPSAnI2ZmNDQ0NCc7XHJcbiAgICAgIHN0YXR1c1RleHQuc3R5bGUuY29sb3IgPSAnI2ZmNDQ0NCc7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1wZW5kaW5nLWFjdGlvbnMnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1ibG9jay1zZWN0aW9uJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1oYXNoJykudGV4dENvbnRlbnQgPSB0eC5oYXNoO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1mcm9tJykudGV4dENvbnRlbnQgPSB0eC5mcm9tO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC10bycpLnRleHRDb250ZW50ID0gdHgudG8gfHwgJ0NvbnRyYWN0IENyZWF0aW9uJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kZXRhaWwtdmFsdWUnKS50ZXh0Q29udGVudCA9IGV0aGVycy5mb3JtYXRFdGhlcih0eC52YWx1ZSB8fCAnMCcpICsgJyAnICsgZ2V0TmV0d29ya1N5bWJvbCh0eC5uZXR3b3JrKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kZXRhaWwtbm9uY2UnKS50ZXh0Q29udGVudCA9IHR4Lm5vbmNlO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1nYXMtcHJpY2UnKS50ZXh0Q29udGVudCA9IGV0aGVycy5mb3JtYXRVbml0cyh0eC5nYXNQcmljZSB8fCAnMCcsICdnd2VpJykgKyAnIEd3ZWknO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1uZXR3b3JrJykudGV4dENvbnRlbnQgPSBnZXROZXR3b3JrTmFtZSh0eC5uZXR3b3JrKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kZXRhaWwtdGltZXN0YW1wJykudGV4dENvbnRlbnQgPSBuZXcgRGF0ZSh0eC50aW1lc3RhbXApLnRvTG9jYWxlU3RyaW5nKCk7XHJcblxyXG4gICAgLy8gU3RvcmUgY3VycmVudCB0eCBoYXNoIGZvciBzcGVlZCB1cC9jYW5jZWxcclxuICAgIGN1cnJlbnRTdGF0ZS5jdXJyZW50VHhIYXNoID0gdHguaGFzaDtcclxuXHJcbiAgICAvLyBTZXQgdXAgZXhwbG9yZXIgbGlua1xyXG4gICAgY29uc3QgZXhwbG9yZXJCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXZpZXctZXhwbG9yZXInKTtcclxuICAgIGV4cGxvcmVyQnRuLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGdldEV4cGxvcmVyVXJsKHR4Lm5ldHdvcmssICd0eCcsIHR4Lmhhc2gpO1xyXG4gICAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmwgfSk7XHJcbiAgICB9O1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgbG9hZGluZyB0cmFuc2FjdGlvbiBkZXRhaWxzOicsIGVycm9yKTtcclxuICAgIGFsZXJ0KCdFcnJvciBsb2FkaW5nIHRyYW5zYWN0aW9uIGRldGFpbHMnKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFN0YXRlIGZvciBnYXMgcHJpY2UgcmVmcmVzaCBhY3Jvc3MgZGlmZmVyZW50IGZvcm1zXHJcbmxldCBnYXNQcmljZVJlZnJlc2hTdGF0ZSA9IHtcclxuICBhcHByb3ZhbDogeyBuZXR3b3JrOiBudWxsLCB0eFJlcXVlc3Q6IG51bGwsIHN5bWJvbDogbnVsbCB9LFxyXG4gIHNlbmQ6IHsgbmV0d29yazogbnVsbCwgdHhSZXF1ZXN0OiBudWxsLCBzeW1ib2w6IG51bGwgfSxcclxuICB0b2tlbjogeyBuZXR3b3JrOiBudWxsLCB0eFJlcXVlc3Q6IG51bGwsIHN5bWJvbDogbnVsbCB9XHJcbn07XHJcblxyXG4vLyBTdGF0ZSBmb3Igc3BlZWQtdXAgbW9kYWxcclxubGV0IHNwZWVkVXBNb2RhbFN0YXRlID0ge1xyXG4gIHR4SGFzaDogbnVsbCxcclxuICBhZGRyZXNzOiBudWxsLFxyXG4gIG5ldHdvcms6IG51bGwsXHJcbiAgb3JpZ2luYWxHYXNQcmljZTogbnVsbCxcclxuICBjdXJyZW50R2FzUHJpY2U6IG51bGwsXHJcbiAgcmVjb21tZW5kZWRHYXNQcmljZTogbnVsbFxyXG59O1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3BlZWRVcFRyYW5zYWN0aW9uKCkge1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MgfHwgIWN1cnJlbnRTdGF0ZS5jdXJyZW50VHhIYXNoKSByZXR1cm47XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBHZXQgdHJhbnNhY3Rpb24gZGV0YWlsc1xyXG4gICAgY29uc3QgdHhSZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0dFVF9UWF9CWV9IQVNIJyxcclxuICAgICAgYWRkcmVzczogY3VycmVudFN0YXRlLmFkZHJlc3MsXHJcbiAgICAgIHR4SGFzaDogY3VycmVudFN0YXRlLmN1cnJlbnRUeEhhc2hcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghdHhSZXNwb25zZS5zdWNjZXNzIHx8ICF0eFJlc3BvbnNlLnRyYW5zYWN0aW9uKSB7XHJcbiAgICAgIGFsZXJ0KCdDb3VsZCBub3QgbG9hZCB0cmFuc2FjdGlvbiBkZXRhaWxzJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0eCA9IHR4UmVzcG9uc2UudHJhbnNhY3Rpb247XHJcblxyXG4gICAgLy8gU3RvcmUgc3RhdGUgZm9yIG1vZGFsXHJcbiAgICBzcGVlZFVwTW9kYWxTdGF0ZS50eEhhc2ggPSBjdXJyZW50U3RhdGUuY3VycmVudFR4SGFzaDtcclxuICAgIHNwZWVkVXBNb2RhbFN0YXRlLmFkZHJlc3MgPSBjdXJyZW50U3RhdGUuYWRkcmVzcztcclxuICAgIHNwZWVkVXBNb2RhbFN0YXRlLm5ldHdvcmsgPSB0eC5uZXR3b3JrO1xyXG4gICAgc3BlZWRVcE1vZGFsU3RhdGUub3JpZ2luYWxHYXNQcmljZSA9IHR4Lmdhc1ByaWNlO1xyXG5cclxuICAgIC8vIFNob3cgbW9kYWwgYW5kIGxvYWQgZ2FzIHByaWNlc1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXNwZWVkLXVwLXR4JykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICBhd2FpdCByZWZyZXNoR2FzUHJpY2VzKCk7XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBvcGVuaW5nIHNwZWVkLXVwIG1vZGFsOicsIGVycm9yKTtcclxuICAgIGFsZXJ0KCdFcnJvciBsb2FkaW5nIGdhcyBwcmljZXMnKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hHYXNQcmljZXMoKSB7XHJcbiAgY29uc3QgbG9hZGluZ0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwZWVkLXVwLWxvYWRpbmcnKTtcclxuICBjb25zdCByZWZyZXNoQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1yZWZyZXNoLWdhcy1wcmljZScpO1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gU2hvdyBsb2FkaW5nIHN0YXRlXHJcbiAgICBsb2FkaW5nRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZWZyZXNoQnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIHJlZnJlc2hCdG4udGV4dENvbnRlbnQgPSAn4o+zIExvYWRpbmcuLi4nO1xyXG5cclxuICAgIC8vIEZldGNoIGN1cnJlbnQgbmV0d29yayBnYXMgcHJpY2VcclxuICAgIGNvbnN0IGdhc1Jlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX0NVUlJFTlRfR0FTX1BSSUNFJyxcclxuICAgICAgbmV0d29yazogc3BlZWRVcE1vZGFsU3RhdGUubmV0d29ya1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFnYXNSZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihnYXNSZXNwb25zZS5lcnJvciB8fCAnRmFpbGVkIHRvIGZldGNoIGdhcyBwcmljZScpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFN0b3JlIGN1cnJlbnQgYW5kIGNhbGN1bGF0ZSByZWNvbW1lbmRlZCAoY3VycmVudCArIDEwJSlcclxuICAgIHNwZWVkVXBNb2RhbFN0YXRlLmN1cnJlbnRHYXNQcmljZSA9IGdhc1Jlc3BvbnNlLmdhc1ByaWNlO1xyXG4gICAgY29uc3QgY3VycmVudEd3ZWkgPSBwYXJzZUZsb2F0KGdhc1Jlc3BvbnNlLmdhc1ByaWNlR3dlaSk7XHJcbiAgICBjb25zdCByZWNvbW1lbmRlZEd3ZWkgPSAoY3VycmVudEd3ZWkgKiAxLjEpLnRvRml4ZWQoMik7XHJcbiAgICBzcGVlZFVwTW9kYWxTdGF0ZS5yZWNvbW1lbmRlZEdhc1ByaWNlID0gKEJpZ0ludChnYXNSZXNwb25zZS5nYXNQcmljZSkgKiBCaWdJbnQoMTEwKSAvIEJpZ0ludCgxMDApKS50b1N0cmluZygpO1xyXG5cclxuICAgIC8vIFVwZGF0ZSBVSVxyXG4gICAgY29uc3Qgb3JpZ2luYWxHd2VpID0gKE51bWJlcihzcGVlZFVwTW9kYWxTdGF0ZS5vcmlnaW5hbEdhc1ByaWNlKSAvIDFlOSkudG9GaXhlZCgyKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGVlZC11cC1vcmlnaW5hbC1nYXMnKS50ZXh0Q29udGVudCA9IGAke29yaWdpbmFsR3dlaX0gR3dlaWA7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3BlZWQtdXAtY3VycmVudC1nYXMnKS50ZXh0Q29udGVudCA9IGAke2N1cnJlbnRHd2VpfSBHd2VpYDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGVlZC11cC1yZWNvbW1lbmRlZC1nYXMnKS50ZXh0Q29udGVudCA9IGAke3JlY29tbWVuZGVkR3dlaX0gR3dlaWA7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIGFuZCBzaG93IGNvbXBhcmlzb25cclxuICAgIGNvbnN0IGNvbXBhcmlzb24gPSBjdXJyZW50R3dlaSAvIHBhcnNlRmxvYXQob3JpZ2luYWxHd2VpKTtcclxuICAgIGNvbnN0IG1lc3NhZ2VFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGVlZC11cC1jb21wYXJpc29uLW1lc3NhZ2UnKTtcclxuICAgIGlmIChjb21wYXJpc29uID4gMikge1xyXG4gICAgICBtZXNzYWdlRWwudGV4dENvbnRlbnQgPSBg4pqg77iPIE5ldHdvcmsgZ2FzIGlzICR7Y29tcGFyaXNvbi50b0ZpeGVkKDApfXggaGlnaGVyIHRoYW4geW91ciB0cmFuc2FjdGlvbiFgO1xyXG4gICAgICBtZXNzYWdlRWwuc3R5bGUuY29sb3IgPSAndmFyKC0tdGVybWluYWwtZGFuZ2VyKSc7XHJcbiAgICB9IGVsc2UgaWYgKGNvbXBhcmlzb24gPiAxLjIpIHtcclxuICAgICAgbWVzc2FnZUVsLnRleHRDb250ZW50ID0gYE5ldHdvcmsgZ2FzIGlzICR7Y29tcGFyaXNvbi50b0ZpeGVkKDEpfXggaGlnaGVyIHRoYW4geW91ciB0cmFuc2FjdGlvbmA7XHJcbiAgICAgIG1lc3NhZ2VFbC5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC13YXJuaW5nKSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtZXNzYWdlRWwudGV4dENvbnRlbnQgPSAnTmV0d29yayBnYXMgaXMgY2xvc2UgdG8geW91ciB0cmFuc2FjdGlvbiBwcmljZSc7XHJcbiAgICAgIG1lc3NhZ2VFbC5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1zdWNjZXNzKSc7XHJcbiAgICB9XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciByZWZyZXNoaW5nIGdhcyBwcmljZXM6JywgZXJyb3IpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwZWVkLXVwLWNvbXBhcmlzb24tbWVzc2FnZScpLnRleHRDb250ZW50ID0gYEVycm9yOiAke2Vycm9yLm1lc3NhZ2V9YDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGVlZC11cC1jb21wYXJpc29uLW1lc3NhZ2UnKS5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1kYW5nZXIpJztcclxuICB9IGZpbmFsbHkge1xyXG4gICAgbG9hZGluZ0VsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgcmVmcmVzaEJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgcmVmcmVzaEJ0bi50ZXh0Q29udGVudCA9ICfwn5SEIFJFRlJFU0ggR0FTIFBSSUNFJztcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGNvbmZpcm1TcGVlZFVwKCkge1xyXG4gIHRyeSB7XHJcbiAgICAvLyBHZXQgY3VzdG9tIGdhcyBwcmljZSBpZiBwcm92aWRlZFxyXG4gICAgY29uc3QgY3VzdG9tR2FzSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3BlZWQtdXAtY3VzdG9tLWdhcycpLnZhbHVlO1xyXG4gICAgbGV0IGdhc1ByaWNlVG9Vc2UgPSBzcGVlZFVwTW9kYWxTdGF0ZS5yZWNvbW1lbmRlZEdhc1ByaWNlO1xyXG5cclxuICAgIGlmIChjdXN0b21HYXNJbnB1dCAmJiBjdXN0b21HYXNJbnB1dC50cmltKCkgIT09ICcnKSB7XHJcbiAgICAgIGNvbnN0IGN1c3RvbUd3ZWkgPSBwYXJzZUZsb2F0KGN1c3RvbUdhc0lucHV0KTtcclxuICAgICAgaWYgKGlzTmFOKGN1c3RvbUd3ZWkpIHx8IGN1c3RvbUd3ZWkgPD0gMCkge1xyXG4gICAgICAgIGFsZXJ0KCdJbnZhbGlkIGdhcyBwcmljZS4gUGxlYXNlIGVudGVyIGEgcG9zaXRpdmUgbnVtYmVyLicpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICAvLyBDb252ZXJ0IEd3ZWkgdG8gV2VpXHJcbiAgICAgIGdhc1ByaWNlVG9Vc2UgPSAoQmlnSW50KE1hdGguZmxvb3IoY3VzdG9tR3dlaSAqIDFlOSkpKS50b1N0cmluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENsb3NlIG1vZGFsXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtc3BlZWQtdXAtdHgnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAvLyBHZXQgcGFzc3dvcmRcclxuICAgIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgc2hvd1Bhc3N3b3JkUHJvbXB0KCdTcGVlZCBVcCBUcmFuc2FjdGlvbicsICdFbnRlciB5b3VyIHBhc3N3b3JkIHRvIGNvbmZpcm0gc3BlZWQtdXAnKTtcclxuICAgIGlmICghcGFzc3dvcmQpIHJldHVybjtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGVtcG9yYXJ5IHNlc3Npb25cclxuICAgIGNvbnN0IGFjdGl2ZVdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgY29uc3Qgc2Vzc2lvblJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnQ1JFQVRFX1NFU1NJT04nLFxyXG4gICAgICBwYXNzd29yZDogcGFzc3dvcmQsXHJcbiAgICAgIHdhbGxldElkOiBhY3RpdmVXYWxsZXQuaWQsXHJcbiAgICAgIGR1cmF0aW9uTXM6IDYwMDAwXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXNlc3Npb25SZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgIGFsZXJ0KCdJbnZhbGlkIHBhc3N3b3JkJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTcGVlZCB1cCB0cmFuc2FjdGlvbiB3aXRoIGN1c3RvbSBnYXMgcHJpY2VcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnU1BFRURfVVBfVFgnLFxyXG4gICAgICBhZGRyZXNzOiBzcGVlZFVwTW9kYWxTdGF0ZS5hZGRyZXNzLFxyXG4gICAgICB0eEhhc2g6IHNwZWVkVXBNb2RhbFN0YXRlLnR4SGFzaCxcclxuICAgICAgc2Vzc2lvblRva2VuOiBzZXNzaW9uUmVzcG9uc2Uuc2Vzc2lvblRva2VuLFxyXG4gICAgICBjdXN0b21HYXNQcmljZTogZ2FzUHJpY2VUb1VzZVxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgYWxlcnQoYFRyYW5zYWN0aW9uIHNwZWQgdXAhXFxuTmV3IFRYOiAke3Jlc3BvbnNlLnR4SGFzaC5zbGljZSgwLCAyMCl9Li4uYCk7XHJcbiAgICAgIHNob3dUcmFuc2FjdGlvbkRldGFpbHMocmVzcG9uc2UudHhIYXNoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFsZXJ0KCdFcnJvciBzcGVlZGluZyB1cCB0cmFuc2FjdGlvbjogJyArIHJlc3BvbnNlLmVycm9yKTtcclxuICAgIH1cclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHNwZWVkaW5nIHVwIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIGFsZXJ0KCdFcnJvciBzcGVlZGluZyB1cCB0cmFuc2FjdGlvbicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gUmVmcmVzaCBnYXMgcHJpY2VzIGZvciB0cmFuc2FjdGlvbiBhcHByb3ZhbCBzY3JlZW5cclxuYXN5bmMgZnVuY3Rpb24gcmVmcmVzaEFwcHJvdmFsR2FzUHJpY2UoKSB7XHJcbiAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1yZWZyZXNoLWFwcHJvdmFsLWdhcycpO1xyXG4gIGlmICghYnRuIHx8ICFnYXNQcmljZVJlZnJlc2hTdGF0ZS5hcHByb3ZhbC5uZXR3b3JrKSByZXR1cm47XHJcblxyXG4gIHRyeSB7XHJcbiAgICBidG4uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgYnRuLnRleHRDb250ZW50ID0gJ+KPsyBMb2FkaW5nLi4uJztcclxuXHJcbiAgICBjb25zdCB7IG5ldHdvcmssIHR4UmVxdWVzdCwgc3ltYm9sIH0gPSBnYXNQcmljZVJlZnJlc2hTdGF0ZS5hcHByb3ZhbDtcclxuICAgIGF3YWl0IHBvcHVsYXRlR2FzUHJpY2VzKG5ldHdvcmssIHR4UmVxdWVzdCwgc3ltYm9sKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgcmVmcmVzaGluZyBnYXMgcHJpY2U6JywgZXJyb3IpO1xyXG4gICAgYWxlcnQoJ0Vycm9yIHJlZnJlc2hpbmcgZ2FzIHByaWNlJyk7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIGJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgYnRuLnRleHRDb250ZW50ID0gJ/CflIQgUkVGUkVTSCBHQVMgUFJJQ0UnO1xyXG4gIH1cclxufVxyXG5cclxuLy8gUmVmcmVzaCBnYXMgcHJpY2VzIGZvciBzZW5kIHNjcmVlblxyXG5hc3luYyBmdW5jdGlvbiByZWZyZXNoU2VuZEdhc1ByaWNlKCkge1xyXG4gIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVmcmVzaC1zZW5kLWdhcycpO1xyXG4gIGlmICghYnRuIHx8ICFnYXNQcmljZVJlZnJlc2hTdGF0ZS5zZW5kLm5ldHdvcmspIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGJ0bi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICBidG4udGV4dENvbnRlbnQgPSAn4o+zIExvYWRpbmcuLi4nO1xyXG5cclxuICAgIGNvbnN0IHsgbmV0d29yaywgdHhSZXF1ZXN0LCBzeW1ib2wgfSA9IGdhc1ByaWNlUmVmcmVzaFN0YXRlLnNlbmQ7XHJcbiAgICBhd2FpdCBwb3B1bGF0ZVNlbmRHYXNQcmljZXMobmV0d29yaywgdHhSZXF1ZXN0LCBzeW1ib2wpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciByZWZyZXNoaW5nIGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICBhbGVydCgnRXJyb3IgcmVmcmVzaGluZyBnYXMgcHJpY2UnKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgYnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICBidG4udGV4dENvbnRlbnQgPSAn8J+UhCBSRUZSRVNIIEdBUyBQUklDRSc7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBSZWZyZXNoIGdhcyBwcmljZXMgZm9yIHRva2VuIHNlbmQgc2NyZWVuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hUb2tlbkdhc1ByaWNlKCkge1xyXG4gIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVmcmVzaC10b2tlbi1nYXMnKTtcclxuICBpZiAoIWJ0biB8fCAhZ2FzUHJpY2VSZWZyZXNoU3RhdGUudG9rZW4ubmV0d29yaykgcmV0dXJuO1xyXG5cclxuICB0cnkge1xyXG4gICAgYnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIGJ0bi50ZXh0Q29udGVudCA9ICfij7MgTG9hZGluZy4uLic7XHJcblxyXG4gICAgY29uc3QgeyBuZXR3b3JrLCB0eFJlcXVlc3QsIHN5bWJvbCB9ID0gZ2FzUHJpY2VSZWZyZXNoU3RhdGUudG9rZW47XHJcbiAgICBhd2FpdCBwb3B1bGF0ZVRva2VuR2FzUHJpY2VzKG5ldHdvcmssIHR4UmVxdWVzdCwgc3ltYm9sKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgcmVmcmVzaGluZyBnYXMgcHJpY2U6JywgZXJyb3IpO1xyXG4gICAgYWxlcnQoJ0Vycm9yIHJlZnJlc2hpbmcgZ2FzIHByaWNlJyk7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIGJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgYnRuLnRleHRDb250ZW50ID0gJ/CflIQgUkVGUkVTSCBHQVMgUFJJQ0UnO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2FuY2VsVHJhbnNhY3Rpb24oKSB7XHJcbiAgaWYgKCFjdXJyZW50U3RhdGUuYWRkcmVzcyB8fCAhY3VycmVudFN0YXRlLmN1cnJlbnRUeEhhc2gpIHJldHVybjtcclxuXHJcbiAgaWYgKCFjb25maXJtKCdDYW5jZWwgdGhpcyB0cmFuc2FjdGlvbj8gQSBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gd2lsbCBiZSBzZW50LicpKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBjb25zdCBwYXNzd29yZCA9IGF3YWl0IHNob3dQYXNzd29yZFByb21wdCgnQ2FuY2VsIFRyYW5zYWN0aW9uJywgJ0VudGVyIHlvdXIgcGFzc3dvcmQgdG8gY2FuY2VsIHRoaXMgdHJhbnNhY3Rpb24gYnkgc2VuZGluZyBhIDAtdmFsdWUgcmVwbGFjZW1lbnQnKTtcclxuICBpZiAoIXBhc3N3b3JkKSByZXR1cm47XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBDcmVhdGUgdGVtcG9yYXJ5IHNlc3Npb25cclxuICAgIGNvbnN0IGFjdGl2ZVdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgY29uc3Qgc2Vzc2lvblJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnQ1JFQVRFX1NFU1NJT04nLFxyXG4gICAgICBwYXNzd29yZDogcGFzc3dvcmQsXHJcbiAgICAgIHdhbGxldElkOiBhY3RpdmVXYWxsZXQuaWQsXHJcbiAgICAgIGR1cmF0aW9uTXM6IDYwMDAwIC8vIDEgbWludXRlIHRlbXAgc2Vzc2lvblxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFzZXNzaW9uUmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICBhbGVydCgnSW52YWxpZCBwYXNzd29yZCcpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2FuY2VsIHRyYW5zYWN0aW9uXHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0NBTkNFTF9UWCcsXHJcbiAgICAgIGFkZHJlc3M6IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLFxyXG4gICAgICB0eEhhc2g6IGN1cnJlbnRTdGF0ZS5jdXJyZW50VHhIYXNoLFxyXG4gICAgICBzZXNzaW9uVG9rZW46IHNlc3Npb25SZXNwb25zZS5zZXNzaW9uVG9rZW5cclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgIGFsZXJ0KGBUcmFuc2FjdGlvbiBjYW5jZWxsZWQhXFxuQ2FuY2VsbGF0aW9uIFRYOiAke3Jlc3BvbnNlLnR4SGFzaC5zbGljZSgwLCAyMCl9Li4uYCk7XHJcbiAgICAgIC8vIFJlZnJlc2ggdG8gc2hvdyBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb25cclxuICAgICAgc2hvd1RyYW5zYWN0aW9uRGV0YWlscyhyZXNwb25zZS50eEhhc2gpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWxlcnQoJ0Vycm9yIGNhbmNlbGxpbmcgdHJhbnNhY3Rpb246ICcgKyByZXNwb25zZS5lcnJvcik7XHJcbiAgICB9XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjYW5jZWxsaW5nIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIGFsZXJ0KCdFcnJvciBjYW5jZWxsaW5nIHRyYW5zYWN0aW9uJyk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDbGVhclRyYW5zYWN0aW9uSGlzdG9yeSgpIHtcclxuICBpZiAoIWNvbmZpcm0oJ0NsZWFyIGFsbCB0cmFuc2FjdGlvbiBoaXN0b3J5IGZvciB0aGlzIGFkZHJlc3M/IFRoaXMgY2Fubm90IGJlIHVuZG9uZS4nKSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0NMRUFSX1RYX0hJU1RPUlknLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzc1xyXG4gICAgfSk7XHJcblxyXG4gICAgYWxlcnQoJ1RyYW5zYWN0aW9uIGhpc3RvcnkgY2xlYXJlZCcpO1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpO1xyXG4gICAgYXdhaXQgdXBkYXRlRGFzaGJvYXJkKCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNsZWFyaW5nIHRyYW5zYWN0aW9uIGhpc3Rvcnk6JywgZXJyb3IpO1xyXG4gICAgYWxlcnQoJ0Vycm9yIGNsZWFyaW5nIHRyYW5zYWN0aW9uIGhpc3RvcnknKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTaG93IHRyYW5zYWN0aW9uIHN0YXR1cyBhZnRlciBhcHByb3ZhbFxyXG4gKiBLZWVwcyBhcHByb3ZhbCB3aW5kb3cgb3BlbiB0byBzaG93IHR4IHN0YXR1c1xyXG4gKi9cclxubGV0IHR4U3RhdHVzUG9sbEludGVydmFsID0gbnVsbDtcclxubGV0IHR4U3RhdHVzQ3VycmVudEhhc2ggPSBudWxsO1xyXG5sZXQgdHhTdGF0dXNDdXJyZW50QWRkcmVzcyA9IG51bGw7XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzaG93VHJhbnNhY3Rpb25TdGF0dXModHhIYXNoLCBhZGRyZXNzLCByZXF1ZXN0SWQpIHtcclxuICAvLyBTaG93aW5nIHRyYW5zYWN0aW9uIHN0YXR1c1xyXG5cclxuICAvLyBTdG9yZSBjdXJyZW50IHRyYW5zYWN0aW9uIGhhc2ggYW5kIGFkZHJlc3NcclxuICB0eFN0YXR1c0N1cnJlbnRIYXNoID0gdHhIYXNoO1xyXG4gIHR4U3RhdHVzQ3VycmVudEFkZHJlc3MgPSBhZGRyZXNzO1xyXG5cclxuICAvLyBIaWRlIGFwcHJvdmFsIGZvcm1cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtYXBwcm92YWwtZm9ybScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAvLyBTaG93IHN0YXR1cyBzZWN0aW9uXHJcbiAgY29uc3Qgc3RhdHVzU2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1zdGF0dXMtc2VjdGlvbicpO1xyXG4gIHN0YXR1c1NlY3Rpb24uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcblxyXG4gIC8vIFBvcHVsYXRlIHRyYW5zYWN0aW9uIGhhc2hcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc3RhdHVzLWhhc2gnKS50ZXh0Q29udGVudCA9IHR4SGFzaDtcclxuXHJcbiAgLy8gUG9sbCBmb3IgdHJhbnNhY3Rpb24gc3RhdHVzIHVwZGF0ZXNcclxuICBjb25zdCB1cGRhdGVTdGF0dXMgPSBhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBQb2xsaW5nIHRyYW5zYWN0aW9uIHN0YXR1c1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnR0VUX1RYX0JZX0hBU0gnLFxyXG4gICAgICAgIGFkZHJlc3M6IHR4U3RhdHVzQ3VycmVudEFkZHJlc3MsXHJcbiAgICAgICAgdHhIYXNoOiB0eEhhc2hcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBTdGF0dXMgcG9sbCByZXNwb25zZVxyXG5cclxuICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MgJiYgcmVzcG9uc2UudHJhbnNhY3Rpb24pIHtcclxuICAgICAgICBjb25zdCB0eCA9IHJlc3BvbnNlLnRyYW5zYWN0aW9uO1xyXG4gICAgICAgIC8vIFRyYW5zYWN0aW9uIHN0YXR1cyB1cGRhdGVkXHJcblxyXG4gICAgICAgIGNvbnN0IHN0YXR1c01lc3NhZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc3RhdHVzLW1lc3NhZ2UnKTtcclxuICAgICAgICBjb25zdCBzdGF0dXNEZXRhaWxzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXN0YXR1cy1kZXRhaWxzJyk7XHJcbiAgICAgICAgY29uc3QgcGVuZGluZ0FjdGlvbnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc3RhdHVzLXBlbmRpbmctYWN0aW9ucycpO1xyXG5cclxuICAgICAgICBpZiAodHguc3RhdHVzID09PSAnY29uZmlybWVkJykge1xyXG4gICAgICAgICAgLy8gVHJhbnNhY3Rpb24gY29uZmlybWVkXHJcbiAgICAgICAgICBzdGF0dXNNZXNzYWdlLnRleHRDb250ZW50ID0gJ+KchSBUcmFuc2FjdGlvbiBDb25maXJtZWQhJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMudGV4dENvbnRlbnQgPSBgQmxvY2s6ICR7dHguYmxvY2tOdW1iZXJ9YDtcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMuc3R5bGUuY29sb3IgPSAndmFyKC0tdGVybWluYWwtc3VjY2VzcyknO1xyXG4gICAgICAgICAgcGVuZGluZ0FjdGlvbnMuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgLy8gU3RvcCBwb2xsaW5nXHJcbiAgICAgICAgICBpZiAodHhTdGF0dXNQb2xsSW50ZXJ2YWwpIHtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0eFN0YXR1c1BvbGxJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIHR4U3RhdHVzUG9sbEludGVydmFsID0gbnVsbDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBBdXRvLWNsb3NlIGFmdGVyIDIgc2Vjb25kc1xyXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICAgICAgfSwgMjAwMCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eC5zdGF0dXMgPT09ICdmYWlsZWQnKSB7XHJcbiAgICAgICAgICBzdGF0dXNNZXNzYWdlLnRleHRDb250ZW50ID0gJ+KdjCBUcmFuc2FjdGlvbiBGYWlsZWQnO1xyXG4gICAgICAgICAgc3RhdHVzRGV0YWlscy50ZXh0Q29udGVudCA9ICdUaGUgdHJhbnNhY3Rpb24gd2FzIHJlamVjdGVkIG9yIHJlcGxhY2VkJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMuc3R5bGUuY29sb3IgPSAnI2ZmNDQ0NCc7XHJcbiAgICAgICAgICBwZW5kaW5nQWN0aW9ucy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgICAvLyBTdG9wIHBvbGxpbmdcclxuICAgICAgICAgIGlmICh0eFN0YXR1c1BvbGxJbnRlcnZhbCkge1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHR4U3RhdHVzUG9sbEludGVydmFsKTtcclxuICAgICAgICAgICAgdHhTdGF0dXNQb2xsSW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIEF1dG8tY2xvc2UgYWZ0ZXIgMiBzZWNvbmRzXHJcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgICAgICB9LCAyMDAwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gU3RpbGwgcGVuZGluZ1xyXG4gICAgICAgICAgc3RhdHVzTWVzc2FnZS50ZXh0Q29udGVudCA9ICfij7MgV2FpdGluZyBmb3IgY29uZmlybWF0aW9uLi4uJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMudGV4dENvbnRlbnQgPSAnVGhpcyB1c3VhbGx5IHRha2VzIDEwLTMwIHNlY29uZHMnO1xyXG4gICAgICAgICAgc3RhdHVzRGV0YWlscy5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1mZy1kaW0pJztcclxuICAgICAgICAgIHBlbmRpbmdBY3Rpb25zLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ/Cfq4AgVHJhbnNhY3Rpb24gbm90IGZvdW5kIGluIHN0b3JhZ2U6JywgdHhIYXNoKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBjaGVja2luZyB0cmFuc2FjdGlvbiBzdGF0dXM6JywgZXJyb3IpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vIEluaXRpYWwgc3RhdHVzIGNoZWNrXHJcbiAgYXdhaXQgdXBkYXRlU3RhdHVzKCk7XHJcblxyXG4gIC8vIFBvbGwgZXZlcnkgMyBzZWNvbmRzXHJcbiAgdHhTdGF0dXNQb2xsSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCh1cGRhdGVTdGF0dXMsIDMwMDApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXROZXR3b3JrU3ltYm9sKG5ldHdvcmspIHtcclxuICBjb25zdCBzeW1ib2xzID0ge1xyXG4gICAgJ3B1bHNlY2hhaW4nOiAnUExTJyxcclxuICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICd0UExTJyxcclxuICAgICdldGhlcmV1bSc6ICdFVEgnLFxyXG4gICAgJ3NlcG9saWEnOiAnU2Vwb2xpYUVUSCdcclxuICB9O1xyXG4gIHJldHVybiBzeW1ib2xzW25ldHdvcmtdIHx8ICdFVEgnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXROZXR3b3JrTmFtZShuZXR3b3JrKSB7XHJcbiAgY29uc3QgbmFtZXMgPSB7XHJcbiAgICAncHVsc2VjaGFpbic6ICdQdWxzZUNoYWluIE1haW5uZXQnLFxyXG4gICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ1B1bHNlQ2hhaW4gVGVzdG5ldCBWNCcsXHJcbiAgICAnZXRoZXJldW0nOiAnRXRoZXJldW0gTWFpbm5ldCcsXHJcbiAgICAnc2Vwb2xpYSc6ICdTZXBvbGlhIFRlc3RuZXQnXHJcbiAgfTtcclxuICByZXR1cm4gbmFtZXNbbmV0d29ya10gfHwgbmV0d29yaztcclxufVxyXG5cclxuLy8gPT09PT0gVVRJTElUSUVTID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNvcHlBZGRyZXNzKCkge1xyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChjdXJyZW50U3RhdGUuYWRkcmVzcyk7XHJcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvcHktYWRkcmVzcycpO1xyXG4gICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gYnRuLnRleHRDb250ZW50O1xyXG4gICAgYnRuLnRleHRDb250ZW50ID0gJ0NPUElFRCEnO1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGJ0bi50ZXh0Q29udGVudCA9IG9yaWdpbmFsVGV4dDtcclxuICAgIH0sIDIwMDApO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBhbGVydCgnRmFpbGVkIHRvIGNvcHkgYWRkcmVzcycpO1xyXG4gIH1cclxufVxyXG4iXSwiZmlsZSI6InBvcHVwLmpzIn0=