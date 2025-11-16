const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["index.js","rpc.js"])))=>i.map(i=>d[i]);
import { f as formatUnits, p as parseUnits, g as getProvider, C as Contract, i as isAddress, l as load, s as save, I as Interface, m as migrateToMultiWallet, w as walletExists, a as setActiveWallet, b as getActiveWallet, c as importFromMnemonic, d as importFromPrivateKey, u as unlockWallet, e as shortenAddress, h as getAllWallets, j as getBalance, k as formatBalance, n as getTransactionCount, o as parseEther, q as getGasPrice, r as exportMnemonic, t as exportPrivateKey, v as addWallet, x as renameWallet, y as getSafeGasPrice, z as estimateGas, A as formatEther, B as getBytes, D as toUtf8String, E as deleteWallet, F as exportMnemonicForWallet, G as exportPrivateKeyForWallet } from "./rpc.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
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
    let allSettled = function(promises$2) {
      return Promise.all(promises$2.map((p) => Promise.resolve(p).then((value$1) => ({
        status: "fulfilled",
        value: value$1
      }), (reason) => ({
        status: "rejected",
        reason
      }))));
    };
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
    const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
    promise = allSettled(deps.map((dep) => {
      dep = assetsURL(dep);
      if (dep in seen) return;
      seen[dep] = true;
      const isCss = dep.endsWith(".css");
      const cssSelector = isCss ? '[rel="stylesheet"]' : "";
      if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) return;
      const link = document.createElement("link");
      link.rel = isCss ? "stylesheet" : scriptRel;
      if (!isCss) link.as = "script";
      link.crossOrigin = "";
      link.href = dep;
      if (cspNonce) link.setAttribute("nonce", cspNonce);
      document.head.appendChild(link);
      if (isCss) return new Promise((res, rej) => {
        link.addEventListener("load", res);
        link.addEventListener("error", () => rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`)));
      });
    }));
  }
  function handlePreloadError(err$2) {
    const e$1 = new Event("vite:preloadError", { cancelable: true });
    e$1.payload = err$2;
    window.dispatchEvent(e$1);
    if (!e$1.defaultPrevented) throw err$2;
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var browser = {};
var canPromise;
var hasRequiredCanPromise;
function requireCanPromise() {
  if (hasRequiredCanPromise) return canPromise;
  hasRequiredCanPromise = 1;
  canPromise = function() {
    return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
  };
  return canPromise;
}
var qrcode = {};
var utils$1 = {};
var hasRequiredUtils$1;
function requireUtils$1() {
  if (hasRequiredUtils$1) return utils$1;
  hasRequiredUtils$1 = 1;
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
  utils$1.toSJIS = function toSJIS(kanji) {
    return toSJISFunction(kanji);
  };
  return utils$1;
}
var errorCorrectionLevel = {};
var hasRequiredErrorCorrectionLevel;
function requireErrorCorrectionLevel() {
  if (hasRequiredErrorCorrectionLevel) return errorCorrectionLevel;
  hasRequiredErrorCorrectionLevel = 1;
  (function(exports$1) {
    exports$1.L = { bit: 1 };
    exports$1.M = { bit: 0 };
    exports$1.Q = { bit: 3 };
    exports$1.H = { bit: 2 };
    function fromString(string) {
      if (typeof string !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string.toLowerCase();
      switch (lcStr) {
        case "l":
        case "low":
          return exports$1.L;
        case "m":
        case "medium":
          return exports$1.M;
        case "q":
        case "quartile":
          return exports$1.Q;
        case "h":
        case "high":
          return exports$1.H;
        default:
          throw new Error("Unknown EC Level: " + string);
      }
    }
    exports$1.isValid = function isValid(level) {
      return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
    };
    exports$1.from = function from(value, defaultValue) {
      if (exports$1.isValid(value)) {
        return value;
      }
      try {
        return fromString(value);
      } catch (e) {
        return defaultValue;
      }
    };
  })(errorCorrectionLevel);
  return errorCorrectionLevel;
}
var bitBuffer;
var hasRequiredBitBuffer;
function requireBitBuffer() {
  if (hasRequiredBitBuffer) return bitBuffer;
  hasRequiredBitBuffer = 1;
  function BitBuffer() {
    this.buffer = [];
    this.length = 0;
  }
  BitBuffer.prototype = {
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
  bitBuffer = BitBuffer;
  return bitBuffer;
}
var bitMatrix;
var hasRequiredBitMatrix;
function requireBitMatrix() {
  if (hasRequiredBitMatrix) return bitMatrix;
  hasRequiredBitMatrix = 1;
  function BitMatrix(size) {
    if (!size || size < 1) {
      throw new Error("BitMatrix size must be defined and greater than 0");
    }
    this.size = size;
    this.data = new Uint8Array(size * size);
    this.reservedBit = new Uint8Array(size * size);
  }
  BitMatrix.prototype.set = function(row, col, value, reserved) {
    const index = row * this.size + col;
    this.data[index] = value;
    if (reserved) this.reservedBit[index] = true;
  };
  BitMatrix.prototype.get = function(row, col) {
    return this.data[row * this.size + col];
  };
  BitMatrix.prototype.xor = function(row, col, value) {
    this.data[row * this.size + col] ^= value;
  };
  BitMatrix.prototype.isReserved = function(row, col) {
    return this.reservedBit[row * this.size + col];
  };
  bitMatrix = BitMatrix;
  return bitMatrix;
}
var alignmentPattern = {};
var hasRequiredAlignmentPattern;
function requireAlignmentPattern() {
  if (hasRequiredAlignmentPattern) return alignmentPattern;
  hasRequiredAlignmentPattern = 1;
  (function(exports$1) {
    const getSymbolSize = requireUtils$1().getSymbolSize;
    exports$1.getRowColCoords = function getRowColCoords(version2) {
      if (version2 === 1) return [];
      const posCount = Math.floor(version2 / 7) + 2;
      const size = getSymbolSize(version2);
      const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
      const positions = [size - 7];
      for (let i = 1; i < posCount - 1; i++) {
        positions[i] = positions[i - 1] - intervals;
      }
      positions.push(6);
      return positions.reverse();
    };
    exports$1.getPositions = function getPositions(version2) {
      const coords = [];
      const pos = exports$1.getRowColCoords(version2);
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
  return alignmentPattern;
}
var finderPattern = {};
var hasRequiredFinderPattern;
function requireFinderPattern() {
  if (hasRequiredFinderPattern) return finderPattern;
  hasRequiredFinderPattern = 1;
  const getSymbolSize = requireUtils$1().getSymbolSize;
  const FINDER_PATTERN_SIZE = 7;
  finderPattern.getPositions = function getPositions(version2) {
    const size = getSymbolSize(version2);
    return [
      // top-left
      [0, 0],
      // top-right
      [size - FINDER_PATTERN_SIZE, 0],
      // bottom-left
      [0, size - FINDER_PATTERN_SIZE]
    ];
  };
  return finderPattern;
}
var maskPattern = {};
var hasRequiredMaskPattern;
function requireMaskPattern() {
  if (hasRequiredMaskPattern) return maskPattern;
  hasRequiredMaskPattern = 1;
  (function(exports$1) {
    exports$1.Patterns = {
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
    exports$1.isValid = function isValid(mask) {
      return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
    };
    exports$1.from = function from(value) {
      return exports$1.isValid(value) ? parseInt(value, 10) : void 0;
    };
    exports$1.getPenaltyN1 = function getPenaltyN1(data) {
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
    exports$1.getPenaltyN2 = function getPenaltyN2(data) {
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
    exports$1.getPenaltyN3 = function getPenaltyN3(data) {
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
    exports$1.getPenaltyN4 = function getPenaltyN4(data) {
      let darkCount = 0;
      const modulesCount = data.data.length;
      for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];
      const k = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
      return k * PenaltyScores.N4;
    };
    function getMaskAt(maskPattern2, i, j) {
      switch (maskPattern2) {
        case exports$1.Patterns.PATTERN000:
          return (i + j) % 2 === 0;
        case exports$1.Patterns.PATTERN001:
          return i % 2 === 0;
        case exports$1.Patterns.PATTERN010:
          return j % 3 === 0;
        case exports$1.Patterns.PATTERN011:
          return (i + j) % 3 === 0;
        case exports$1.Patterns.PATTERN100:
          return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
        case exports$1.Patterns.PATTERN101:
          return i * j % 2 + i * j % 3 === 0;
        case exports$1.Patterns.PATTERN110:
          return (i * j % 2 + i * j % 3) % 2 === 0;
        case exports$1.Patterns.PATTERN111:
          return (i * j % 3 + (i + j) % 2) % 2 === 0;
        default:
          throw new Error("bad maskPattern:" + maskPattern2);
      }
    }
    exports$1.applyMask = function applyMask(pattern, data) {
      const size = data.size;
      for (let col = 0; col < size; col++) {
        for (let row = 0; row < size; row++) {
          if (data.isReserved(row, col)) continue;
          data.xor(row, col, getMaskAt(pattern, row, col));
        }
      }
    };
    exports$1.getBestMask = function getBestMask(data, setupFormatFunc) {
      const numPatterns = Object.keys(exports$1.Patterns).length;
      let bestPattern = 0;
      let lowerPenalty = Infinity;
      for (let p = 0; p < numPatterns; p++) {
        setupFormatFunc(p);
        exports$1.applyMask(p, data);
        const penalty = exports$1.getPenaltyN1(data) + exports$1.getPenaltyN2(data) + exports$1.getPenaltyN3(data) + exports$1.getPenaltyN4(data);
        exports$1.applyMask(p, data);
        if (penalty < lowerPenalty) {
          lowerPenalty = penalty;
          bestPattern = p;
        }
      }
      return bestPattern;
    };
  })(maskPattern);
  return maskPattern;
}
var errorCorrectionCode = {};
var hasRequiredErrorCorrectionCode;
function requireErrorCorrectionCode() {
  if (hasRequiredErrorCorrectionCode) return errorCorrectionCode;
  hasRequiredErrorCorrectionCode = 1;
  const ECLevel = requireErrorCorrectionLevel();
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
      case ECLevel.L:
        return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 0];
      case ECLevel.M:
        return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 1];
      case ECLevel.Q:
        return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 2];
      case ECLevel.H:
        return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 3];
      default:
        return void 0;
    }
  };
  errorCorrectionCode.getTotalCodewordsCount = function getTotalCodewordsCount(version2, errorCorrectionLevel2) {
    switch (errorCorrectionLevel2) {
      case ECLevel.L:
        return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 0];
      case ECLevel.M:
        return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 1];
      case ECLevel.Q:
        return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 2];
      case ECLevel.H:
        return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 3];
      default:
        return void 0;
    }
  };
  return errorCorrectionCode;
}
var polynomial = {};
var galoisField = {};
var hasRequiredGaloisField;
function requireGaloisField() {
  if (hasRequiredGaloisField) return galoisField;
  hasRequiredGaloisField = 1;
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
  return galoisField;
}
var hasRequiredPolynomial;
function requirePolynomial() {
  if (hasRequiredPolynomial) return polynomial;
  hasRequiredPolynomial = 1;
  (function(exports$1) {
    const GF = requireGaloisField();
    exports$1.mul = function mul(p1, p2) {
      const coeff = new Uint8Array(p1.length + p2.length - 1);
      for (let i = 0; i < p1.length; i++) {
        for (let j = 0; j < p2.length; j++) {
          coeff[i + j] ^= GF.mul(p1[i], p2[j]);
        }
      }
      return coeff;
    };
    exports$1.mod = function mod(divident, divisor) {
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
    exports$1.generateECPolynomial = function generateECPolynomial(degree) {
      let poly = new Uint8Array([1]);
      for (let i = 0; i < degree; i++) {
        poly = exports$1.mul(poly, new Uint8Array([1, GF.exp(i)]));
      }
      return poly;
    };
  })(polynomial);
  return polynomial;
}
var reedSolomonEncoder;
var hasRequiredReedSolomonEncoder;
function requireReedSolomonEncoder() {
  if (hasRequiredReedSolomonEncoder) return reedSolomonEncoder;
  hasRequiredReedSolomonEncoder = 1;
  const Polynomial = requirePolynomial();
  function ReedSolomonEncoder(degree) {
    this.genPoly = void 0;
    this.degree = degree;
    if (this.degree) this.initialize(this.degree);
  }
  ReedSolomonEncoder.prototype.initialize = function initialize(degree) {
    this.degree = degree;
    this.genPoly = Polynomial.generateECPolynomial(this.degree);
  };
  ReedSolomonEncoder.prototype.encode = function encode(data) {
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
  reedSolomonEncoder = ReedSolomonEncoder;
  return reedSolomonEncoder;
}
var version = {};
var mode = {};
var versionCheck = {};
var hasRequiredVersionCheck;
function requireVersionCheck() {
  if (hasRequiredVersionCheck) return versionCheck;
  hasRequiredVersionCheck = 1;
  versionCheck.isValid = function isValid(version2) {
    return !isNaN(version2) && version2 >= 1 && version2 <= 40;
  };
  return versionCheck;
}
var regex = {};
var hasRequiredRegex;
function requireRegex() {
  if (hasRequiredRegex) return regex;
  hasRequiredRegex = 1;
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
  return regex;
}
var hasRequiredMode;
function requireMode() {
  if (hasRequiredMode) return mode;
  hasRequiredMode = 1;
  (function(exports$1) {
    const VersionCheck = requireVersionCheck();
    const Regex = requireRegex();
    exports$1.NUMERIC = {
      id: "Numeric",
      bit: 1 << 0,
      ccBits: [10, 12, 14]
    };
    exports$1.ALPHANUMERIC = {
      id: "Alphanumeric",
      bit: 1 << 1,
      ccBits: [9, 11, 13]
    };
    exports$1.BYTE = {
      id: "Byte",
      bit: 1 << 2,
      ccBits: [8, 16, 16]
    };
    exports$1.KANJI = {
      id: "Kanji",
      bit: 1 << 3,
      ccBits: [8, 10, 12]
    };
    exports$1.MIXED = {
      bit: -1
    };
    exports$1.getCharCountIndicator = function getCharCountIndicator(mode2, version2) {
      if (!mode2.ccBits) throw new Error("Invalid mode: " + mode2);
      if (!VersionCheck.isValid(version2)) {
        throw new Error("Invalid version: " + version2);
      }
      if (version2 >= 1 && version2 < 10) return mode2.ccBits[0];
      else if (version2 < 27) return mode2.ccBits[1];
      return mode2.ccBits[2];
    };
    exports$1.getBestModeForData = function getBestModeForData(dataStr) {
      if (Regex.testNumeric(dataStr)) return exports$1.NUMERIC;
      else if (Regex.testAlphanumeric(dataStr)) return exports$1.ALPHANUMERIC;
      else if (Regex.testKanji(dataStr)) return exports$1.KANJI;
      else return exports$1.BYTE;
    };
    exports$1.toString = function toString(mode2) {
      if (mode2 && mode2.id) return mode2.id;
      throw new Error("Invalid mode");
    };
    exports$1.isValid = function isValid(mode2) {
      return mode2 && mode2.bit && mode2.ccBits;
    };
    function fromString(string) {
      if (typeof string !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string.toLowerCase();
      switch (lcStr) {
        case "numeric":
          return exports$1.NUMERIC;
        case "alphanumeric":
          return exports$1.ALPHANUMERIC;
        case "kanji":
          return exports$1.KANJI;
        case "byte":
          return exports$1.BYTE;
        default:
          throw new Error("Unknown mode: " + string);
      }
    }
    exports$1.from = function from(value, defaultValue) {
      if (exports$1.isValid(value)) {
        return value;
      }
      try {
        return fromString(value);
      } catch (e) {
        return defaultValue;
      }
    };
  })(mode);
  return mode;
}
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  (function(exports$1) {
    const Utils = requireUtils$1();
    const ECCode = requireErrorCorrectionCode();
    const ECLevel = requireErrorCorrectionLevel();
    const Mode = requireMode();
    const VersionCheck = requireVersionCheck();
    const G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
    const G18_BCH = Utils.getBCHDigit(G18);
    function getBestVersionForDataLength(mode2, length, errorCorrectionLevel2) {
      for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
        if (length <= exports$1.getCapacity(currentVersion, errorCorrectionLevel2, mode2)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    function getReservedBitsCount(mode2, version2) {
      return Mode.getCharCountIndicator(mode2, version2) + 4;
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
        if (length <= exports$1.getCapacity(currentVersion, errorCorrectionLevel2, Mode.MIXED)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    exports$1.from = function from(value, defaultValue) {
      if (VersionCheck.isValid(value)) {
        return parseInt(value, 10);
      }
      return defaultValue;
    };
    exports$1.getCapacity = function getCapacity(version2, errorCorrectionLevel2, mode2) {
      if (!VersionCheck.isValid(version2)) {
        throw new Error("Invalid QR Code version");
      }
      if (typeof mode2 === "undefined") mode2 = Mode.BYTE;
      const totalCodewords = Utils.getSymbolTotalCodewords(version2);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version2, errorCorrectionLevel2);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
      if (mode2 === Mode.MIXED) return dataTotalCodewordsBits;
      const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode2, version2);
      switch (mode2) {
        case Mode.NUMERIC:
          return Math.floor(usableBits / 10 * 3);
        case Mode.ALPHANUMERIC:
          return Math.floor(usableBits / 11 * 2);
        case Mode.KANJI:
          return Math.floor(usableBits / 13);
        case Mode.BYTE:
        default:
          return Math.floor(usableBits / 8);
      }
    };
    exports$1.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel2) {
      let seg;
      const ecl = ECLevel.from(errorCorrectionLevel2, ECLevel.M);
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
    exports$1.getEncodedBits = function getEncodedBits(version2) {
      if (!VersionCheck.isValid(version2) || version2 < 7) {
        throw new Error("Invalid QR Code version");
      }
      let d = version2 << 12;
      while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
        d ^= G18 << Utils.getBCHDigit(d) - G18_BCH;
      }
      return version2 << 12 | d;
    };
  })(version);
  return version;
}
var formatInfo = {};
var hasRequiredFormatInfo;
function requireFormatInfo() {
  if (hasRequiredFormatInfo) return formatInfo;
  hasRequiredFormatInfo = 1;
  const Utils = requireUtils$1();
  const G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
  const G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
  const G15_BCH = Utils.getBCHDigit(G15);
  formatInfo.getEncodedBits = function getEncodedBits(errorCorrectionLevel2, mask) {
    const data = errorCorrectionLevel2.bit << 3 | mask;
    let d = data << 10;
    while (Utils.getBCHDigit(d) - G15_BCH >= 0) {
      d ^= G15 << Utils.getBCHDigit(d) - G15_BCH;
    }
    return (data << 10 | d) ^ G15_MASK;
  };
  return formatInfo;
}
var segments = {};
var numericData;
var hasRequiredNumericData;
function requireNumericData() {
  if (hasRequiredNumericData) return numericData;
  hasRequiredNumericData = 1;
  const Mode = requireMode();
  function NumericData(data) {
    this.mode = Mode.NUMERIC;
    this.data = data.toString();
  }
  NumericData.getBitsLength = function getBitsLength(length) {
    return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
  };
  NumericData.prototype.getLength = function getLength() {
    return this.data.length;
  };
  NumericData.prototype.getBitsLength = function getBitsLength() {
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
  numericData = NumericData;
  return numericData;
}
var alphanumericData;
var hasRequiredAlphanumericData;
function requireAlphanumericData() {
  if (hasRequiredAlphanumericData) return alphanumericData;
  hasRequiredAlphanumericData = 1;
  const Mode = requireMode();
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
    this.mode = Mode.ALPHANUMERIC;
    this.data = data;
  }
  AlphanumericData.getBitsLength = function getBitsLength(length) {
    return 11 * Math.floor(length / 2) + 6 * (length % 2);
  };
  AlphanumericData.prototype.getLength = function getLength() {
    return this.data.length;
  };
  AlphanumericData.prototype.getBitsLength = function getBitsLength() {
    return AlphanumericData.getBitsLength(this.data.length);
  };
  AlphanumericData.prototype.write = function write(bitBuffer2) {
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
  alphanumericData = AlphanumericData;
  return alphanumericData;
}
var byteData;
var hasRequiredByteData;
function requireByteData() {
  if (hasRequiredByteData) return byteData;
  hasRequiredByteData = 1;
  const Mode = requireMode();
  function ByteData(data) {
    this.mode = Mode.BYTE;
    if (typeof data === "string") {
      this.data = new TextEncoder().encode(data);
    } else {
      this.data = new Uint8Array(data);
    }
  }
  ByteData.getBitsLength = function getBitsLength(length) {
    return length * 8;
  };
  ByteData.prototype.getLength = function getLength() {
    return this.data.length;
  };
  ByteData.prototype.getBitsLength = function getBitsLength() {
    return ByteData.getBitsLength(this.data.length);
  };
  ByteData.prototype.write = function(bitBuffer2) {
    for (let i = 0, l = this.data.length; i < l; i++) {
      bitBuffer2.put(this.data[i], 8);
    }
  };
  byteData = ByteData;
  return byteData;
}
var kanjiData;
var hasRequiredKanjiData;
function requireKanjiData() {
  if (hasRequiredKanjiData) return kanjiData;
  hasRequiredKanjiData = 1;
  const Mode = requireMode();
  const Utils = requireUtils$1();
  function KanjiData(data) {
    this.mode = Mode.KANJI;
    this.data = data;
  }
  KanjiData.getBitsLength = function getBitsLength(length) {
    return length * 13;
  };
  KanjiData.prototype.getLength = function getLength() {
    return this.data.length;
  };
  KanjiData.prototype.getBitsLength = function getBitsLength() {
    return KanjiData.getBitsLength(this.data.length);
  };
  KanjiData.prototype.write = function(bitBuffer2) {
    let i;
    for (i = 0; i < this.data.length; i++) {
      let value = Utils.toSJIS(this.data[i]);
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
  kanjiData = KanjiData;
  return kanjiData;
}
var dijkstra = { exports: {} };
var hasRequiredDijkstra;
function requireDijkstra() {
  if (hasRequiredDijkstra) return dijkstra.exports;
  hasRequiredDijkstra = 1;
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
  return dijkstra.exports;
}
var hasRequiredSegments;
function requireSegments() {
  if (hasRequiredSegments) return segments;
  hasRequiredSegments = 1;
  (function(exports$1) {
    const Mode = requireMode();
    const NumericData = requireNumericData();
    const AlphanumericData = requireAlphanumericData();
    const ByteData = requireByteData();
    const KanjiData = requireKanjiData();
    const Regex = requireRegex();
    const Utils = requireUtils$1();
    const dijkstra2 = requireDijkstra();
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
      const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
      const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr);
      let byteSegs;
      let kanjiSegs;
      if (Utils.isKanjiModeEnabled()) {
        byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
        kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
      } else {
        byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
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
        case Mode.NUMERIC:
          return NumericData.getBitsLength(length);
        case Mode.ALPHANUMERIC:
          return AlphanumericData.getBitsLength(length);
        case Mode.KANJI:
          return KanjiData.getBitsLength(length);
        case Mode.BYTE:
          return ByteData.getBitsLength(length);
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
          case Mode.NUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.ALPHANUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.KANJI:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
            ]);
            break;
          case Mode.BYTE:
            nodes.push([
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
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
              graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode.getCharCountIndicator(node.mode, version2);
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
      const bestMode = Mode.getBestModeForData(data);
      mode2 = Mode.from(modesHint, bestMode);
      if (mode2 !== Mode.BYTE && mode2.bit < bestMode.bit) {
        throw new Error('"' + data + '" cannot be encoded with mode ' + Mode.toString(mode2) + ".\n Suggested mode is: " + Mode.toString(bestMode));
      }
      if (mode2 === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
        mode2 = Mode.BYTE;
      }
      switch (mode2) {
        case Mode.NUMERIC:
          return new NumericData(data);
        case Mode.ALPHANUMERIC:
          return new AlphanumericData(data);
        case Mode.KANJI:
          return new KanjiData(data);
        case Mode.BYTE:
          return new ByteData(data);
      }
    }
    exports$1.fromArray = function fromArray(array) {
      return array.reduce(function(acc, seg) {
        if (typeof seg === "string") {
          acc.push(buildSingleSegment(seg, null));
        } else if (seg.data) {
          acc.push(buildSingleSegment(seg.data, seg.mode));
        }
        return acc;
      }, []);
    };
    exports$1.fromString = function fromString(data, version2) {
      const segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled());
      const nodes = buildNodes(segs);
      const graph = buildGraph(nodes, version2);
      const path = dijkstra2.find_path(graph.map, "start", "end");
      const optimizedSegs = [];
      for (let i = 1; i < path.length - 1; i++) {
        optimizedSegs.push(graph.table[path[i]].node);
      }
      return exports$1.fromArray(mergeSegments(optimizedSegs));
    };
    exports$1.rawSplit = function rawSplit(data) {
      return exports$1.fromArray(
        getSegmentsFromString(data, Utils.isKanjiModeEnabled())
      );
    };
  })(segments);
  return segments;
}
var hasRequiredQrcode;
function requireQrcode() {
  if (hasRequiredQrcode) return qrcode;
  hasRequiredQrcode = 1;
  const Utils = requireUtils$1();
  const ECLevel = requireErrorCorrectionLevel();
  const BitBuffer = requireBitBuffer();
  const BitMatrix = requireBitMatrix();
  const AlignmentPattern = requireAlignmentPattern();
  const FinderPattern = requireFinderPattern();
  const MaskPattern = requireMaskPattern();
  const ECCode = requireErrorCorrectionCode();
  const ReedSolomonEncoder = requireReedSolomonEncoder();
  const Version = requireVersion();
  const FormatInfo = requireFormatInfo();
  const Mode = requireMode();
  const Segments = requireSegments();
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
    const totalCodewords = Utils.getSymbolTotalCodewords(version2);
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
    const totalCodewords = Utils.getSymbolTotalCodewords(version2);
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
    const moduleCount = Utils.getSymbolSize(version2);
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
        Utils.setToSJISFunction(options.toSJISFunc);
      }
    }
    return createSymbol(data, version2, errorCorrectionLevel2, mask);
  };
  return qrcode;
}
var canvas = {};
var utils = {};
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  (function(exports$1) {
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
    exports$1.getOptions = function getOptions(options) {
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
    exports$1.getScale = function getScale(qrSize, opts) {
      return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
    };
    exports$1.getImageWidth = function getImageWidth(qrSize, opts) {
      const scale = exports$1.getScale(qrSize, opts);
      return Math.floor((qrSize + opts.margin * 2) * scale);
    };
    exports$1.qrToImageData = function qrToImageData(imgData, qr, opts) {
      const size = qr.modules.size;
      const data = qr.modules.data;
      const scale = exports$1.getScale(size, opts);
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
  return utils;
}
var hasRequiredCanvas;
function requireCanvas() {
  if (hasRequiredCanvas) return canvas;
  hasRequiredCanvas = 1;
  (function(exports$1) {
    const Utils = requireUtils();
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
    exports$1.render = function render(qrData, canvas2, options) {
      let opts = options;
      let canvasEl = canvas2;
      if (typeof opts === "undefined" && (!canvas2 || !canvas2.getContext)) {
        opts = canvas2;
        canvas2 = void 0;
      }
      if (!canvas2) {
        canvasEl = getCanvasElement();
      }
      opts = Utils.getOptions(opts);
      const size = Utils.getImageWidth(qrData.modules.size, opts);
      const ctx = canvasEl.getContext("2d");
      const image = ctx.createImageData(size, size);
      Utils.qrToImageData(image.data, qrData, opts);
      clearCanvas(ctx, canvasEl, size);
      ctx.putImageData(image, 0, 0);
      return canvasEl;
    };
    exports$1.renderToDataURL = function renderToDataURL(qrData, canvas2, options) {
      let opts = options;
      if (typeof opts === "undefined" && (!canvas2 || !canvas2.getContext)) {
        opts = canvas2;
        canvas2 = void 0;
      }
      if (!opts) opts = {};
      const canvasEl = exports$1.render(qrData, canvas2, opts);
      const type = opts.type || "image/png";
      const rendererOpts = opts.rendererOpts || {};
      return canvasEl.toDataURL(type, rendererOpts.quality);
    };
  })(canvas);
  return canvas;
}
var svgTag = {};
var hasRequiredSvgTag;
function requireSvgTag() {
  if (hasRequiredSvgTag) return svgTag;
  hasRequiredSvgTag = 1;
  const Utils = requireUtils();
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
  return svgTag;
}
var hasRequiredBrowser;
function requireBrowser() {
  if (hasRequiredBrowser) return browser;
  hasRequiredBrowser = 1;
  const canPromise2 = requireCanPromise();
  const QRCode2 = requireQrcode();
  const CanvasRenderer = requireCanvas();
  const SvgRenderer = requireSvgTag();
  function renderCanvas(renderFunc, canvas2, text, opts, cb) {
    const args = [].slice.call(arguments, 1);
    const argsNum = args.length;
    const isLastArgCb = typeof args[argsNum - 1] === "function";
    if (!isLastArgCb && !canPromise2()) {
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
          const data = QRCode2.create(text, opts);
          resolve(renderFunc(data, canvas2, opts));
        } catch (e) {
          reject(e);
        }
      });
    }
    try {
      const data = QRCode2.create(text, opts);
      cb(null, renderFunc(data, canvas2, opts));
    } catch (e) {
      cb(e);
    }
  }
  browser.create = QRCode2.create;
  browser.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
  browser.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);
  browser.toString = renderCanvas.bind(null, function(data, _, opts) {
    return SvgRenderer.render(data, opts);
  });
  return browser;
}
var browserExports = requireBrowser();
const QRCode = /* @__PURE__ */ getDefaultExportFromCjs(browserExports);
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
  const isValid = await validateTokenContract(network, tokenAddress);
  if (!isValid) {
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
const ABI_CACHE_KEY_PREFIX = "abi_cache_";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1e3;
const COMMON_FUNCTIONS = {
  "0x095ea7b3": { name: "approve", description: "Approve token spending", category: "token" },
  "0xa9059cbb": { name: "transfer", description: "Transfer tokens", category: "token" },
  "0x23b872dd": { name: "transferFrom", description: "Transfer tokens from address", category: "token" },
  "0x38ed1739": { name: "swapExactTokensForTokens", description: "Swap exact tokens for tokens", category: "dex" },
  "0x7ff36ab5": { name: "swapExactETHForTokens", description: "Swap exact ETH for tokens", category: "dex" },
  "0x18cbafe5": { name: "swapExactTokensForETH", description: "Swap exact tokens for ETH", category: "dex" },
  "0xfb3bdb41": { name: "swapETHForExactTokens", description: "Swap ETH for exact tokens", category: "dex" },
  "0x8803dbee": { name: "swapTokensForExactTokens", description: "Swap tokens for exact tokens", category: "dex" },
  "0x40c10f19": { name: "mint", description: "Mint tokens", category: "token" },
  "0x42966c68": { name: "burn", description: "Burn tokens", category: "token" },
  "0xa694fc3a": { name: "stake", description: "Stake tokens", category: "defi" },
  "0x2e1a7d4d": { name: "withdraw", description: "Withdraw tokens", category: "defi" },
  "0xb6b55f25": { name: "deposit", description: "Deposit tokens", category: "defi" },
  "0x3ccfd60b": { name: "withdraw", description: "Withdraw", category: "defi" }
};
const EXPLORER_URLS = {
  369: "https://scan.mypinata.cloud/ipfs/bafybeienxyoyrhn5tswclvd3gdjy5mtkkwmu37aqtml6onbf7xnb3o22pe",
  943: "https://scan.v4.testnet.pulsechain.com",
  1: "https://etherscan.io",
  11155111: "https://sepolia.etherscan.io"
};
function getCachedABI(address, chainId) {
  try {
    const key = `${ABI_CACHE_KEY_PREFIX}${chainId}_${address.toLowerCase()}`;
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return data.abi;
  } catch (error) {
    console.error("Error reading ABI cache:", error);
    return null;
  }
}
function cacheABI(address, chainId, abi, source) {
  try {
    const key = `${ABI_CACHE_KEY_PREFIX}${chainId}_${address.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify({
      abi,
      source,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error("Error caching ABI:", error);
  }
}
async function fetchFromPulseScan(address, chainId) {
  try {
    const baseUrl = chainId === 369 ? "https://api.scan.pulsechain.com" : chainId === 943 ? "https://scan.v4.testnet.pulsechain.com" : null;
    if (!baseUrl) return null;
    const url = `${baseUrl}/api?module=contract&action=getabi&address=${address}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "1" && data.result && data.result !== "Contract source code not verified") {
      return {
        abi: JSON.parse(data.result),
        source: "pulsescan",
        verified: true
      };
    }
    return null;
  } catch (error) {
    console.error("PulseScan fetch error:", error);
    return null;
  }
}
async function fetchFromSourcify(address, chainId, matchType = "full_match") {
  try {
    const url = `https://repo.sourcify.dev/contracts/${matchType}/${chainId}/${address}/metadata.json`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const metadata = await response.json();
    if (metadata.output && metadata.output.abi) {
      return {
        abi: metadata.output.abi,
        source: `sourcify_${matchType}`,
        verified: true
      };
    }
    return null;
  } catch (error) {
    console.error(`Sourcify ${matchType} fetch error:`, error);
    return null;
  }
}
async function fetch4byteSignature(selector) {
  try {
    const url = `https://www.4byte.directory/api/v1/signatures/?hex_signature=${selector}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].text_signature;
    }
    return null;
  } catch (error) {
    console.error("4byte fetch error:", error);
    return null;
  }
}
async function getContractABI(address, chainId = 369) {
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    return null;
  }
  const cached = getCachedABI(address, chainId);
  if (cached) {
    console.log("🫀 ABI loaded from cache");
    return { abi: cached, source: "cache", verified: true };
  }
  console.log("🫀 Fetching ABI for", address);
  const pulseScanResult = await fetchFromPulseScan(address, chainId);
  if (pulseScanResult) {
    console.log("🫀 ABI found on PulseScan");
    cacheABI(address, chainId, pulseScanResult.abi, pulseScanResult.source);
    return pulseScanResult;
  }
  const sourcifyFullResult = await fetchFromSourcify(address, chainId, "full_match");
  if (sourcifyFullResult) {
    console.log("🫀 ABI found on Sourcify (full match)");
    cacheABI(address, chainId, sourcifyFullResult.abi, sourcifyFullResult.source);
    return sourcifyFullResult;
  }
  const sourcifyPartialResult = await fetchFromSourcify(address, chainId, "partial_match");
  if (sourcifyPartialResult) {
    console.log("🫀 ABI found on Sourcify (partial match)");
    cacheABI(address, chainId, sourcifyPartialResult.abi, sourcifyPartialResult.source);
    return sourcifyPartialResult;
  }
  console.log("🫀 No ABI found for contract");
  return null;
}
async function decodeTransaction(txRequest, chainId = 369) {
  const address = txRequest.to;
  const data = txRequest.data;
  if (!data || data === "0x" || data.length <= 2) {
    return {
      type: "transfer",
      description: "Simple Transfer",
      method: null,
      params: [],
      contract: null,
      explorerUrl: getExplorerUrl$1(chainId, address)
    };
  }
  const functionSelector = data.slice(0, 10);
  const commonFunc = COMMON_FUNCTIONS[functionSelector];
  if (commonFunc) {
    console.log("🫀 Recognized common function:", commonFunc.name);
  }
  const abiResult = await getContractABI(address, chainId);
  if (abiResult && abiResult.abi) {
    try {
      const contract = new Interface(abiResult.abi);
      const decoded = contract.parseTransaction({ data });
      return {
        type: "contract_call",
        description: commonFunc ? commonFunc.description : "Contract Interaction",
        method: decoded.name,
        signature: decoded.signature,
        params: formatParameters(decoded.fragment, decoded.args),
        contract: {
          address,
          verified: abiResult.verified,
          source: abiResult.source
        },
        explorerUrl: getExplorerUrl$1(chainId, address),
        category: commonFunc ? commonFunc.category : "contract"
      };
    } catch (error) {
      console.error("Error decoding with ABI:", error);
    }
  }
  let functionSignature = null;
  if (commonFunc) {
    functionSignature = commonFunc.name;
  } else {
    functionSignature = await fetch4byteSignature(functionSelector);
  }
  if (functionSignature) {
    return {
      type: "signature_match",
      description: commonFunc ? commonFunc.description : "Contract Call",
      method: functionSignature,
      signature: functionSignature,
      params: [],
      contract: {
        address,
        verified: false,
        source: "signature_only"
      },
      explorerUrl: getExplorerUrl$1(chainId, address),
      rawData: data,
      category: commonFunc ? commonFunc.category : "unknown"
    };
  }
  return {
    type: "unknown",
    description: "Unknown Contract Call",
    method: "Unknown",
    signature: null,
    params: [],
    contract: {
      address,
      verified: false,
      source: "unknown"
    },
    explorerUrl: getExplorerUrl$1(chainId, address),
    rawData: data,
    functionSelector
  };
}
function formatParameters(fragment, args) {
  const params = [];
  for (let i = 0; i < fragment.inputs.length; i++) {
    const input = fragment.inputs[i];
    const value = args[i];
    params.push({
      name: input.name || `param${i}`,
      type: input.type,
      value: formatValue(value, input.type)
    });
  }
  return params;
}
function formatValue(value, type) {
  try {
    if (type.includes("[]")) {
      if (Array.isArray(value)) {
        return value.map((v) => formatValue(v, type.replace("[]", "")));
      }
    }
    if (type.startsWith("uint") || type.startsWith("int")) {
      return value.toString();
    }
    if (type === "address") {
      return value;
    }
    if (type === "bool") {
      return value ? "true" : "false";
    }
    if (type === "bytes" || type.startsWith("bytes")) {
      if (typeof value === "string") {
        return value.length > 66 ? value.slice(0, 66) + "..." : value;
      }
    }
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  } catch (error) {
    console.error("Error formatting value:", error);
    return String(value);
  }
}
function getExplorerUrl$1(chainId, address) {
  const baseUrl = EXPLORER_URLS[chainId] || EXPLORER_URLS[369];
  if (chainId === 369) {
    return `${baseUrl}/#/address/${address}?tab=contract`;
  }
  return `${baseUrl}/address/${address}`;
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
    maxGasPriceGwei: 1e3,
    // Maximum gas price in Gwei (default 1000)
    allowEthSign: false
    // Allow dangerous eth_sign method (disabled by default for security)
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
  document.getElementById("btn-create-wallet")?.addEventListener("click", async () => {
    await generateNewMnemonic();
    updateNetworkDisplays();
    showScreen("screen-create");
  });
  document.getElementById("btn-import-wallet")?.addEventListener("click", () => {
    updateNetworkDisplays();
    showScreen("screen-import");
  });
  document.getElementById("network-select-setup")?.addEventListener("change", (e) => {
    currentState.network = e.target.value;
    saveNetwork();
    updateNetworkDisplays();
  });
  document.getElementById("chk-saved-mnemonic")?.addEventListener("change", (e) => {
    const passwordCreate = document.getElementById("password-create").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    const btn = document.getElementById("btn-create-submit");
    btn.disabled = !(e.target.checked && passwordCreate && passwordConfirm && passwordCreate === passwordConfirm);
  });
  ["password-create", "password-confirm"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", () => {
      const checked = document.getElementById("chk-saved-mnemonic").checked;
      const passwordCreate = document.getElementById("password-create").value;
      const passwordConfirm = document.getElementById("password-confirm").value;
      const btn = document.getElementById("btn-create-submit");
      btn.disabled = !(checked && passwordCreate && passwordConfirm && passwordCreate === passwordConfirm);
    });
  });
  document.getElementById("btn-create-submit")?.addEventListener("click", handleCreateWallet);
  document.getElementById("btn-cancel-create")?.addEventListener("click", () => showScreen("screen-setup"));
  document.getElementById("btn-back-from-create")?.addEventListener("click", () => showScreen("screen-setup"));
  document.getElementById("import-method")?.addEventListener("change", (e) => {
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
  document.getElementById("btn-import-submit")?.addEventListener("click", handleImportWallet);
  document.getElementById("btn-cancel-import")?.addEventListener("click", () => showScreen("screen-setup"));
  document.getElementById("btn-back-from-import")?.addEventListener("click", () => showScreen("screen-setup"));
  document.getElementById("btn-unlock")?.addEventListener("click", handleUnlock);
  document.getElementById("password-unlock")?.addEventListener("keypress", (e) => {
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
  networkSelectCustom?.addEventListener("click", (e) => {
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
    networkDropdownMenu?.classList.add("hidden");
  });
  document.getElementById("wallet-select")?.addEventListener("change", async (e) => {
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
  document.getElementById("btn-lock")?.addEventListener("click", handleLock);
  document.getElementById("btn-refresh")?.addEventListener("click", async () => {
    await updateDashboard();
  });
  document.getElementById("btn-settings")?.addEventListener("click", () => {
    loadSettingsToUI();
    showScreen("screen-settings");
  });
  document.getElementById("btn-network-settings")?.addEventListener("click", () => {
    loadNetworkSettingsToUI();
    showScreen("screen-network-settings");
  });
  document.getElementById("btn-back-from-network-settings")?.addEventListener("click", () => {
    showScreen("screen-settings");
  });
  document.getElementById("btn-save-network-settings")?.addEventListener("click", async () => {
    await saveNetworkSettings();
  });
  document.getElementById("btn-reset-network-settings")?.addEventListener("click", () => {
    if (confirm("Reset all network settings to defaults?")) {
      resetNetworkSettingsToDefaults();
    }
  });
  document.getElementById("btn-copy-address")?.addEventListener("click", handleCopyAddress);
  document.getElementById("btn-send")?.addEventListener("click", showSendScreen);
  document.getElementById("btn-receive")?.addEventListener("click", showReceiveScreen);
  document.getElementById("btn-tokens")?.addEventListener("click", showTokensScreen);
  document.getElementById("btn-tx-history")?.addEventListener("click", showTransactionHistory);
  document.getElementById("btn-back-from-send")?.addEventListener("click", () => {
    showScreen("screen-dashboard");
    updateDashboard();
  });
  document.getElementById("btn-confirm-send")?.addEventListener("click", handleSendTransaction);
  document.getElementById("btn-cancel-send")?.addEventListener("click", () => showScreen("screen-dashboard"));
  document.getElementById("btn-send-max")?.addEventListener("click", handleSendMax);
  document.getElementById("send-asset-select")?.addEventListener("change", handleAssetChange);
  document.getElementById("btn-back-from-receive")?.addEventListener("click", () => showScreen("screen-dashboard"));
  document.getElementById("btn-copy-receive-address")?.addEventListener("click", handleCopyReceiveAddress);
  document.getElementById("btn-back-from-tokens")?.addEventListener("click", () => showScreen("screen-dashboard"));
  document.getElementById("btn-add-custom-token")?.addEventListener("click", showAddTokenModal);
  document.getElementById("btn-back-from-token-details")?.addEventListener("click", async () => {
    showScreen("screen-tokens");
    await renderTokensScreen();
  });
  document.getElementById("token-details-copy-address")?.addEventListener("click", handleCopyTokenDetailsAddress);
  document.getElementById("btn-token-send-max")?.addEventListener("click", handleTokenSendMax);
  document.getElementById("btn-token-send")?.addEventListener("click", handleTokenSend);
  document.getElementById("token-details-enable-toggle")?.addEventListener("change", handleTokenEnableToggle);
  document.getElementById("pending-tx-indicator")?.addEventListener("click", showTransactionHistory);
  document.getElementById("btn-back-from-tx-history")?.addEventListener("click", () => showScreen("screen-dashboard"));
  document.getElementById("filter-all-txs")?.addEventListener("click", () => renderTransactionHistory("all"));
  document.getElementById("filter-pending-txs")?.addEventListener("click", () => renderTransactionHistory("pending"));
  document.getElementById("filter-confirmed-txs")?.addEventListener("click", () => renderTransactionHistory("confirmed"));
  document.getElementById("btn-clear-tx-history")?.addEventListener("click", handleClearTransactionHistory);
  document.getElementById("btn-back-from-tx-details")?.addEventListener("click", () => showScreen("screen-tx-history"));
  document.getElementById("btn-copy-tx-hash")?.addEventListener("click", async () => {
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
  document.getElementById("btn-speed-up-tx")?.addEventListener("click", handleSpeedUpTransaction);
  document.getElementById("btn-cancel-tx")?.addEventListener("click", handleCancelTransaction);
  document.getElementById("btn-refresh-tx-status")?.addEventListener("click", refreshTransactionStatus);
  document.getElementById("btn-close-speed-up-modal")?.addEventListener("click", () => {
    document.getElementById("modal-speed-up-tx").classList.add("hidden");
  });
  document.getElementById("btn-cancel-speed-up")?.addEventListener("click", () => {
    document.getElementById("modal-speed-up-tx").classList.add("hidden");
  });
  document.getElementById("btn-confirm-speed-up")?.addEventListener("click", confirmSpeedUp);
  document.getElementById("btn-refresh-gas-price")?.addEventListener("click", refreshGasPrices);
  document.getElementById("btn-close-cancel-modal")?.addEventListener("click", () => {
    document.getElementById("modal-cancel-tx").classList.add("hidden");
  });
  document.getElementById("btn-close-cancel")?.addEventListener("click", () => {
    document.getElementById("modal-cancel-tx").classList.add("hidden");
  });
  document.getElementById("btn-confirm-cancel")?.addEventListener("click", confirmCancelTransaction);
  document.getElementById("btn-refresh-cancel-gas-price")?.addEventListener("click", refreshCancelGasPrices);
  document.getElementById("btn-refresh-approval-gas")?.addEventListener("click", refreshApprovalGasPrice);
  document.getElementById("btn-refresh-send-gas")?.addEventListener("click", refreshSendGasPrice);
  document.getElementById("btn-refresh-token-gas")?.addEventListener("click", refreshTokenGasPrice);
  document.getElementById("btn-close-add-token")?.addEventListener("click", () => {
    document.getElementById("modal-add-token").classList.add("hidden");
  });
  document.getElementById("btn-cancel-add-token")?.addEventListener("click", () => {
    document.getElementById("modal-add-token").classList.add("hidden");
  });
  document.getElementById("btn-confirm-add-token")?.addEventListener("click", handleAddCustomToken);
  document.getElementById("input-token-address")?.addEventListener("input", handleTokenAddressInput);
  document.getElementById("btn-back-from-settings")?.addEventListener("click", () => showScreen("screen-dashboard"));
  document.getElementById("setting-theme")?.addEventListener("change", (e) => {
    currentState.settings.theme = e.target.value;
    applyTheme();
    saveSettings();
  });
  document.getElementById("setting-decimals")?.addEventListener("change", (e) => {
    currentState.settings.decimalPlaces = parseInt(e.target.value);
    saveSettings();
    updateBalanceDisplay();
  });
  document.getElementById("setting-autolock")?.addEventListener("change", (e) => {
    currentState.settings.autoLockMinutes = parseInt(e.target.value);
    saveSettings();
  });
  document.getElementById("setting-max-gas-price")?.addEventListener("change", (e) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value <= 0) {
      alert("Gas price must be a positive number");
      e.target.value = currentState.settings.maxGasPriceGwei || 1e3;
      return;
    }
    if (value > 1e5) {
      const confirmed = confirm(
        "Warning: Setting max gas price above 100,000 Gwei is extremely high.\n\nThis could allow massive transaction fees.\n\nAre you sure you want to set it to " + value + " Gwei?"
      );
      if (!confirmed) {
        e.target.value = currentState.settings.maxGasPriceGwei || 1e3;
        return;
      }
    }
    currentState.settings.maxGasPriceGwei = value;
    saveSettings();
  });
  document.getElementById("setting-show-testnets")?.addEventListener("change", (e) => {
    currentState.settings.showTestNetworks = e.target.checked;
    saveSettings();
    updateNetworkSelector();
  });
  document.getElementById("setting-allow-eth-sign")?.addEventListener("change", (e) => {
    if (e.target.checked) {
      const confirmed = confirm(
        "⚠️ DANGER: ENABLE eth_sign?\n\neth_sign is a DEPRECATED and DANGEROUS signing method.\n\nMalicious sites can use it to sign transactions that could drain your entire wallet.\n\nThis method should ONLY be enabled if:\n• You fully trust the site requesting it\n• You understand what data is being signed\n• The site cannot use personal_sign instead\n\nDo you want to enable this dangerous method?"
      );
      if (!confirmed) {
        e.target.checked = false;
        return;
      }
    }
    currentState.settings.allowEthSign = e.target.checked;
    saveSettings();
  });
  document.getElementById("btn-view-seed")?.addEventListener("click", handleViewSeed);
  document.getElementById("btn-export-key")?.addEventListener("click", handleExportKey);
  document.getElementById("btn-use-current-gas-price")?.addEventListener("click", handleUseCurrentGasPrice);
  document.getElementById("btn-password-prompt-confirm")?.addEventListener("click", () => {
    const password = document.getElementById("password-prompt-input").value;
    if (password) {
      closePasswordPrompt(password);
    }
  });
  document.getElementById("btn-password-prompt-cancel")?.addEventListener("click", () => {
    closePasswordPrompt(null);
  });
  document.getElementById("btn-close-password-prompt")?.addEventListener("click", () => {
    closePasswordPrompt(null);
  });
  document.getElementById("password-prompt-input")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const password = document.getElementById("password-prompt-input").value;
      if (password) {
        closePasswordPrompt(password);
      }
    }
  });
  document.getElementById("btn-close-display-secret")?.addEventListener("click", closeSecretModal);
  document.getElementById("btn-close-display-secret-btn")?.addEventListener("click", closeSecretModal);
  document.getElementById("btn-copy-secret")?.addEventListener("click", async () => {
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
  document.getElementById("btn-manage-wallets")?.addEventListener("click", handleManageWallets);
  document.getElementById("btn-back-from-manage-wallets")?.addEventListener("click", () => showScreen("screen-settings"));
  document.getElementById("btn-create-new-wallet-multi")?.addEventListener("click", showAddWalletModal);
  document.getElementById("btn-import-wallet-multi")?.addEventListener("click", showAddWalletModal);
  document.getElementById("add-wallet-option-create")?.addEventListener("click", () => {
    document.getElementById("modal-add-wallet").classList.add("hidden");
    generateNewMnemonicMulti();
    document.getElementById("modal-create-wallet-multi").classList.remove("hidden");
  });
  document.getElementById("add-wallet-option-mnemonic")?.addEventListener("click", () => {
    document.getElementById("modal-add-wallet").classList.add("hidden");
    document.getElementById("modal-import-seed-multi").classList.remove("hidden");
  });
  document.getElementById("add-wallet-option-privatekey")?.addEventListener("click", () => {
    document.getElementById("modal-add-wallet").classList.add("hidden");
    document.getElementById("modal-import-key-multi").classList.remove("hidden");
  });
  document.getElementById("btn-close-add-wallet")?.addEventListener("click", () => {
    document.getElementById("modal-add-wallet").classList.add("hidden");
  });
  document.getElementById("btn-confirm-create-wallet-multi")?.addEventListener("click", handleCreateNewWalletMulti);
  document.getElementById("btn-cancel-create-wallet-multi")?.addEventListener("click", () => {
    document.getElementById("modal-create-wallet-multi").classList.add("hidden");
    document.getElementById("input-new-wallet-nickname").value = "";
    document.getElementById("verify-word-1-multi").value = "";
    document.getElementById("verify-word-2-multi").value = "";
    document.getElementById("verify-word-3-multi").value = "";
    document.getElementById("verification-error-multi").classList.add("hidden");
  });
  document.getElementById("btn-close-create-wallet-multi")?.addEventListener("click", () => {
    document.getElementById("modal-create-wallet-multi").classList.add("hidden");
    document.getElementById("input-new-wallet-nickname").value = "";
    document.getElementById("verify-word-1-multi").value = "";
    document.getElementById("verify-word-2-multi").value = "";
    document.getElementById("verify-word-3-multi").value = "";
    document.getElementById("verification-error-multi").classList.add("hidden");
  });
  document.getElementById("btn-confirm-import-seed-multi")?.addEventListener("click", handleImportSeedMulti);
  document.getElementById("btn-cancel-import-seed-multi")?.addEventListener("click", () => {
    document.getElementById("modal-import-seed-multi").classList.add("hidden");
    document.getElementById("input-import-seed-nickname").value = "";
    document.getElementById("input-import-seed-phrase").value = "";
  });
  document.getElementById("btn-close-import-seed-multi")?.addEventListener("click", () => {
    document.getElementById("modal-import-seed-multi").classList.add("hidden");
    document.getElementById("input-import-seed-nickname").value = "";
    document.getElementById("input-import-seed-phrase").value = "";
  });
  document.getElementById("btn-confirm-import-key-multi")?.addEventListener("click", handleImportKeyMulti);
  document.getElementById("btn-cancel-import-key-multi")?.addEventListener("click", () => {
    document.getElementById("modal-import-key-multi").classList.add("hidden");
    document.getElementById("input-import-key-nickname").value = "";
    document.getElementById("input-import-private-key").value = "";
  });
  document.getElementById("btn-close-import-key-multi")?.addEventListener("click", () => {
    document.getElementById("modal-import-key-multi").classList.add("hidden");
    document.getElementById("input-import-key-nickname").value = "";
    document.getElementById("input-import-private-key").value = "";
  });
  document.getElementById("btn-confirm-rename-wallet")?.addEventListener("click", handleRenameWalletConfirm);
  document.getElementById("btn-cancel-rename-wallet")?.addEventListener("click", () => {
    document.getElementById("modal-rename-wallet").classList.add("hidden");
    currentRenameWalletId = null;
  });
  document.getElementById("btn-close-rename-wallet")?.addEventListener("click", () => {
    document.getElementById("modal-rename-wallet").classList.add("hidden");
    currentRenameWalletId = null;
  });
  document.getElementById("btn-close-tx-success")?.addEventListener("click", () => {
    document.getElementById("modal-tx-success").classList.add("hidden");
  });
  document.getElementById("btn-ok-tx-success")?.addEventListener("click", () => {
    document.getElementById("modal-tx-success").classList.add("hidden");
  });
  document.getElementById("btn-copy-tx-hash")?.addEventListener("click", async () => {
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
  document.getElementById("btn-tx-status-explorer")?.addEventListener("click", () => {
    if (!txStatusCurrentHash) return;
    const url = getExplorerUrl(currentState.network, "tx", txStatusCurrentHash);
    chrome.tabs.create({ url });
  });
  document.getElementById("btn-close-tx-status")?.addEventListener("click", () => {
    console.log("🫀 Close button clicked");
    if (txStatusPollInterval) {
      clearInterval(txStatusPollInterval);
      txStatusPollInterval = null;
    }
    window.close();
  });
  document.getElementById("btn-tx-status-speed-up")?.addEventListener("click", async () => {
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
  document.getElementById("btn-tx-status-cancel")?.addEventListener("click", async () => {
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
      cancelModalState.txHash = txStatusCurrentHash;
      cancelModalState.address = txStatusCurrentAddress;
      cancelModalState.network = tx.network;
      cancelModalState.originalGasPrice = tx.gasPrice;
      document.getElementById("modal-cancel-tx").classList.remove("hidden");
      await refreshCancelGasPrices();
    } catch (error) {
      console.error("Error opening cancel modal:", error);
      alert("Error loading gas prices");
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
    await QRCode.toCanvas(canvas2, address, {
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
  document.getElementById("setting-allow-eth-sign").checked = currentState.settings.allowEthSign || false;
  fetchCurrentGasPrice();
}
async function fetchCurrentGasPrice() {
  const labelEl = document.getElementById("current-gas-price-label");
  if (!labelEl) return;
  try {
    labelEl.textContent = "Loading current price...";
    const gasPrice = await getGasPrice(currentState.network);
    const gasPriceGwei = parseFloat(formatUnits(gasPrice, "gwei"));
    let displayPrice;
    if (gasPriceGwei < 1e-3) {
      displayPrice = gasPriceGwei.toFixed(6);
    } else if (gasPriceGwei < 1) {
      displayPrice = gasPriceGwei.toFixed(3);
    } else if (gasPriceGwei < 10) {
      displayPrice = gasPriceGwei.toFixed(2);
    } else {
      displayPrice = gasPriceGwei.toFixed(1);
    }
    const networkName = NETWORK_NAMES[currentState.network] || currentState.network;
    labelEl.textContent = `Current ${networkName} price: ${displayPrice} Gwei`;
    labelEl.style.color = "var(--terminal-success)";
  } catch (error) {
    console.error("Error fetching gas price:", error);
    labelEl.textContent = "Unable to fetch current price";
    labelEl.style.color = "var(--terminal-error)";
  }
}
async function handleUseCurrentGasPrice() {
  const inputEl = document.getElementById("setting-max-gas-price");
  const labelEl = document.getElementById("current-gas-price-label");
  if (!inputEl) return;
  try {
    const gasPrice = await getGasPrice(currentState.network);
    const gasPriceGwei = parseFloat(formatUnits(gasPrice, "gwei"));
    const bufferedPrice = gasPriceGwei * 1.2;
    let roundedPrice;
    if (bufferedPrice < 1) {
      roundedPrice = Math.ceil(bufferedPrice * 1e3) / 1e3;
    } else if (bufferedPrice < 10) {
      roundedPrice = Math.ceil(bufferedPrice * 100) / 100;
    } else {
      roundedPrice = Math.ceil(bufferedPrice * 10) / 10;
    }
    const finalPrice = Math.max(0.1, roundedPrice);
    inputEl.value = finalPrice;
    currentState.settings.maxGasPriceGwei = finalPrice;
    saveSettings();
    labelEl.textContent = `Set to ${finalPrice} Gwei (current + 20% buffer)`;
    labelEl.style.color = "var(--terminal-success)";
    setTimeout(() => fetchCurrentGasPrice(), 2e3);
  } catch (error) {
    console.error("Error setting gas price:", error);
    alert("Failed to fetch current gas price. Please try again.");
  }
}
const NETWORK_KEYS = ["pulsechainTestnet", "pulsechain", "ethereum", "sepolia"];
function loadNetworkSettingsToUI() {
  NETWORK_KEYS.forEach((network) => {
    const rpcInput = document.getElementById(`rpc-${network}`);
    if (rpcInput) {
      rpcInput.value = currentState.networkSettings?.[network]?.rpc || "";
    }
    const explorerInput = document.getElementById(`explorer-${network}`);
    if (explorerInput) {
      explorerInput.value = currentState.networkSettings?.[network]?.explorerBase || "";
    }
    const txPathInput = document.getElementById(`explorer-tx-${network}`);
    if (txPathInput) {
      txPathInput.value = currentState.networkSettings?.[network]?.explorerTxPath || "";
    }
    const addrPathInput = document.getElementById(`explorer-addr-${network}`);
    if (addrPathInput) {
      addrPathInput.value = currentState.networkSettings?.[network]?.explorerAddrPath || "";
    }
  });
}
async function saveNetworkSettings() {
  const networkSettings = {};
  NETWORK_KEYS.forEach((network) => {
    networkSettings[network] = {
      rpc: document.getElementById(`rpc-${network}`)?.value || "",
      explorerBase: document.getElementById(`explorer-${network}`)?.value || "",
      explorerTxPath: document.getElementById(`explorer-tx-${network}`)?.value || "",
      explorerAddrPath: document.getElementById(`explorer-addr-${network}`)?.value || ""
    };
  });
  await save("networkSettings", networkSettings);
  currentState.networkSettings = networkSettings;
  alert("Network settings saved! Changes will take effect on next reload.");
  showScreen("screen-settings");
}
function resetNetworkSettingsToDefaults() {
  NETWORK_KEYS.forEach((network) => {
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
    document.getElementById(`explorer-${network}`).value = defaultExplorers[network]?.base || "";
    document.getElementById(`explorer-tx-${network}`).value = defaultExplorers[network]?.tx || "";
    document.getElementById(`explorer-addr-${network}`).value = defaultExplorers[network]?.addr || "";
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
      document.getElementById("password-prompt-input")?.focus();
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
    const gasPriceHex = await getSafeGasPrice(network);
    const gasPriceWei = BigInt(gasPriceHex);
    const gasPriceGwei = Number(gasPriceWei) / 1e9;
    const slowGwei = (gasPriceGwei * 0.9).toFixed(2);
    const normalGwei = gasPriceGwei.toFixed(2);
    const fastGwei = (gasPriceGwei * 1.2).toFixed(2);
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
        const selectedSpeed = document.querySelector('input[name="gas-speed"]:checked')?.value;
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
  const selectedSpeed = document.querySelector('input[name="gas-speed"]:checked')?.value;
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
    const gasPriceHex = await getSafeGasPrice(network);
    const gasPriceWei = BigInt(gasPriceHex);
    const gasPriceGwei = Number(gasPriceWei) / 1e9;
    const slowGwei = (gasPriceGwei * 0.9).toFixed(2);
    const normalGwei = gasPriceGwei.toFixed(2);
    const fastGwei = (gasPriceGwei * 1.2).toFixed(2);
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
        const selectedSpeed = document.querySelector('input[name="send-gas-speed"]:checked')?.value;
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
  const selectedSpeed = document.querySelector('input[name="send-gas-speed"]:checked')?.value;
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
    const gasPriceHex = await getSafeGasPrice(network);
    const gasPriceWei = BigInt(gasPriceHex);
    const gasPriceGwei = Number(gasPriceWei) / 1e9;
    const slowGwei = (gasPriceGwei * 0.9).toFixed(2);
    const normalGwei = gasPriceGwei.toFixed(2);
    const fastGwei = (gasPriceGwei * 1.2).toFixed(2);
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
        const selectedSpeed = document.querySelector('input[name="token-gas-speed"]:checked')?.value;
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
  const selectedSpeed = document.querySelector('input[name="token-gas-speed"]:checked')?.value;
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
  const address = wallet?.address;
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
    try {
      const txResponse = await chrome.runtime.sendMessage({
        type: "GET_TX_BY_HASH",
        address,
        txHash
      });
      if (!txResponse.success || !txResponse.transaction) {
        alert("Could not load transaction details");
        return;
      }
      const tx = txResponse.transaction;
      cancelModalState.txHash = txHash;
      cancelModalState.address = address;
      cancelModalState.network = tx.network;
      cancelModalState.originalGasPrice = tx.gasPrice;
      document.getElementById("modal-cancel-tx").classList.remove("hidden");
      await refreshCancelGasPrices();
    } catch (error) {
      console.error("Error opening cancel modal:", error);
      alert("Error loading gas prices");
    }
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
  const address = wallet?.address;
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
    try {
      const txResponse = await chrome.runtime.sendMessage({
        type: "GET_TX_BY_HASH",
        address,
        txHash
      });
      if (!txResponse.success || !txResponse.transaction) {
        alert("Could not load transaction details");
        return;
      }
      const tx = txResponse.transaction;
      cancelModalState.txHash = txHash;
      cancelModalState.address = address;
      cancelModalState.network = tx.network;
      cancelModalState.originalGasPrice = tx.gasPrice;
      document.getElementById("modal-cancel-tx").classList.remove("hidden");
      await refreshCancelGasPrices();
    } catch (error) {
      console.error("Error opening cancel modal:", error);
      alert("Error loading gas prices");
    }
  };
}
function formatParameterValue(value, type) {
  try {
    if (type.includes("[]")) {
      if (Array.isArray(value)) {
        const elementType = type.replace("[]", "");
        const formattedElements = value.map((v, i) => {
          const formattedValue = formatParameterValue(v, elementType);
          return `[${i}]: ${formattedValue}`;
        });
        return formattedElements.join("<br>");
      }
    }
    if (type === "address") {
      const shortAddr = `${value.slice(0, 6)}...${value.slice(-4)}`;
      return `<span title="${value}" style="cursor: help;">${shortAddr}</span>`;
    }
    if (type.startsWith("uint") || type.startsWith("int")) {
      const valueStr = value.toString();
      if (valueStr.length > 18) {
        try {
          const etherValue = formatEther(valueStr);
          if (parseFloat(etherValue) > 1e-6) {
            return `${valueStr}<br><span style="color: var(--terminal-dim); font-size: 9px;">(≈ ${parseFloat(etherValue).toFixed(6)} tokens)</span>`;
          }
        } catch (e) {
        }
      }
      return valueStr;
    }
    if (type === "bool") {
      return value ? '<span style="color: var(--terminal-success);">true</span>' : '<span style="color: var(--terminal-warning);">false</span>';
    }
    if (type === "bytes" || type.startsWith("bytes")) {
      if (typeof value === "string") {
        if (value.length > 66) {
          return `${value.slice(0, 66)}...<br><span style="color: var(--terminal-dim); font-size: 9px;">(${value.length} chars)</span>`;
        }
        return value;
      }
    }
    if (type === "string") {
      if (value.length > 50) {
        return `${value.slice(0, 50)}...<br><span style="color: var(--terminal-dim); font-size: 9px;">(${value.length} chars)</span>`;
      }
      return value;
    }
    if (typeof value === "object" && value !== null) {
      const jsonStr = JSON.stringify(value, null, 2);
      if (jsonStr.length > 100) {
        return `<pre style="font-size: 9px; overflow-x: auto;">${jsonStr.slice(0, 100)}...</pre>`;
      }
      return `<pre style="font-size: 9px;">${jsonStr}</pre>`;
    }
    return String(value);
  } catch (error) {
    console.error("Error formatting parameter value:", error);
    return String(value);
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
    const wallet = await getActiveWallet();
    const network = await load("currentNetwork") || "pulsechainTestnet";
    document.getElementById("tx-site-origin").textContent = origin;
    document.getElementById("tx-from-address").textContent = wallet?.address || "0x0000...0000";
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
    let decodedTx = null;
    const chainIdMap = {
      "pulsechain": 369,
      "pulsechainTestnet": 943,
      "ethereum": 1,
      "sepolia": 11155111
    };
    const chainId = chainIdMap[network] || 369;
    document.getElementById("tx-contract-info").classList.add("hidden");
    document.getElementById("tx-function-name").textContent = "Decoding...";
    try {
      decodedTx = await decodeTransaction(txRequest, chainId);
      console.log("🫀 Decoded transaction:", decodedTx);
      if (decodedTx && decodedTx.type !== "transfer" && decodedTx.contract) {
        const contractInfo = document.getElementById("tx-contract-info");
        contractInfo.classList.remove("hidden");
        document.getElementById("tx-contract-address").textContent = decodedTx.contract.address;
        if (decodedTx.contract.verified) {
          document.getElementById("tx-verified-badge").classList.remove("hidden");
          document.getElementById("tx-unverified-badge").classList.add("hidden");
          contractInfo.style.borderColor = "var(--terminal-success)";
        } else {
          document.getElementById("tx-verified-badge").classList.add("hidden");
          document.getElementById("tx-unverified-badge").classList.remove("hidden");
          contractInfo.style.borderColor = "var(--terminal-warning)";
        }
        const contractLink = document.getElementById("tx-contract-link");
        contractLink.href = decodedTx.explorerUrl;
        document.getElementById("tx-function-name").textContent = decodedTx.method || "Unknown Function";
        document.getElementById("tx-function-description").textContent = decodedTx.description || "Contract interaction";
        if (decodedTx.params && decodedTx.params.length > 0) {
          const paramsSection = document.getElementById("tx-params-section");
          const paramsList = document.getElementById("tx-params-list");
          paramsSection.classList.remove("hidden");
          let paramsHTML = "";
          for (const param of decodedTx.params) {
            const valueDisplay = formatParameterValue(param.value, param.type);
            paramsHTML += `
              <div style="margin-bottom: 12px; padding: 8px; background: var(--terminal-bg); border: 1px solid var(--terminal-border); border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-size: 10px; color: var(--terminal-dim);">${param.name}</span>
                  <span style="font-size: 9px; color: var(--terminal-dim); font-family: var(--font-mono);">${param.type}</span>
                </div>
                <div style="font-size: 10px; font-family: var(--font-mono); word-break: break-all;">
                  ${valueDisplay}
                </div>
              </div>
            `;
          }
          paramsList.innerHTML = paramsHTML;
        } else {
          document.getElementById("tx-params-section").classList.add("hidden");
        }
      } else {
        document.getElementById("tx-contract-info").classList.add("hidden");
      }
      if (txRequest.data && txRequest.data !== "0x") {
        document.getElementById("tx-data-section").classList.remove("hidden");
        document.getElementById("tx-data").textContent = txRequest.data;
      } else {
        document.getElementById("tx-data-section").classList.add("hidden");
      }
    } catch (error) {
      console.error("Error decoding transaction:", error);
      document.getElementById("tx-contract-info").classList.add("hidden");
      if (txRequest.data && txRequest.data !== "0x") {
        document.getElementById("tx-data-section").classList.remove("hidden");
        document.getElementById("tx-data").textContent = txRequest.data;
      } else {
        document.getElementById("tx-data-section").classList.add("hidden");
      }
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
    const ethSignWarning = document.getElementById("eth-sign-danger-warning");
    if (method === "eth_sign") {
      ethSignWarning.classList.remove("hidden");
      console.warn("⚠️ DANGER: eth_sign request from", origin);
    } else {
      ethSignWarning.classList.add("hidden");
    }
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
    await renderTransactionHistory(document.querySelector('[id^="filter-"][class*="active"]')?.id.replace("filter-", "").replace("-txs", "") || "all");
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
let cancelModalState = {
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
async function refreshCancelGasPrices() {
  const loadingEl = document.getElementById("cancel-loading");
  const refreshBtn = document.getElementById("btn-refresh-cancel-gas-price");
  try {
    loadingEl.classList.remove("hidden");
    refreshBtn.disabled = true;
    refreshBtn.textContent = "⏳ Loading...";
    const gasResponse = await chrome.runtime.sendMessage({
      type: "GET_CURRENT_GAS_PRICE",
      network: cancelModalState.network
    });
    if (!gasResponse.success) {
      throw new Error(gasResponse.error || "Failed to fetch gas price");
    }
    cancelModalState.currentGasPrice = gasResponse.gasPrice;
    const currentGwei = parseFloat(gasResponse.gasPriceGwei);
    const recommendedGwei = (currentGwei * 1.1).toFixed(2);
    cancelModalState.recommendedGasPrice = (BigInt(gasResponse.gasPrice) * BigInt(110) / BigInt(100)).toString();
    const originalGwei = (Number(cancelModalState.originalGasPrice) / 1e9).toFixed(2);
    document.getElementById("cancel-original-gas").textContent = `${originalGwei} Gwei`;
    document.getElementById("cancel-current-gas").textContent = `${currentGwei} Gwei`;
    document.getElementById("cancel-recommended-gas").textContent = `${recommendedGwei} Gwei`;
    const comparison = currentGwei / parseFloat(originalGwei);
    const messageEl = document.getElementById("cancel-comparison-message");
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
    console.error("Error refreshing cancel gas prices:", error);
    document.getElementById("cancel-comparison-message").textContent = `Error: ${error.message}`;
    document.getElementById("cancel-comparison-message").style.color = "var(--terminal-danger)";
  } finally {
    loadingEl.classList.add("hidden");
    refreshBtn.disabled = false;
    refreshBtn.textContent = "🔄 REFRESH GAS PRICE";
  }
}
async function confirmCancelTransaction() {
  try {
    const customGasInput = document.getElementById("cancel-custom-gas").value;
    let gasPriceToUse = cancelModalState.recommendedGasPrice;
    if (customGasInput && customGasInput.trim() !== "") {
      const customGwei = parseFloat(customGasInput);
      if (isNaN(customGwei) || customGwei <= 0) {
        alert("Invalid gas price. Please enter a positive number.");
        return;
      }
      gasPriceToUse = BigInt(Math.floor(customGwei * 1e9)).toString();
    }
    document.getElementById("modal-cancel-tx").classList.add("hidden");
    const password = await showPasswordPrompt("Cancel Transaction", "Enter your password to confirm cancellation");
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
      type: "CANCEL_TX",
      address: cancelModalState.address,
      txHash: cancelModalState.txHash,
      sessionToken: sessionResponse.sessionToken,
      customGasPrice: gasPriceToUse
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
    cancelModalState.txHash = currentState.currentTxHash;
    cancelModalState.address = currentState.address;
    cancelModalState.network = tx.network;
    cancelModalState.originalGasPrice = tx.gasPrice;
    document.getElementById("modal-cancel-tx").classList.remove("hidden");
    await refreshCancelGasPrices();
  } catch (error) {
    console.error("Error opening cancel modal:", error);
    alert("Error loading gas prices");
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


//# sourceMappingURL=data:application/json;base64,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QUNUO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFDVDtBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQ1Q7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUNUO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFDVDtBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBSTtBQUFBLElBQ1Y7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUk7QUFBQSxJQUNWO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFJO0FBQUEsSUFDVjtBQUFBLElBQUc7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQ1g7QUFBQSxJQUFHO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUNYO0FBQUEsSUFBRztBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFDWDtBQUFBLElBQUc7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQ1g7QUFBQSxJQUFHO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUNYO0FBQUEsSUFBRztBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFDWDtBQUFBLElBQUc7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQ1g7QUFBQSxJQUFHO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUNYO0FBQUEsSUFBRztBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFDWDtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQ1o7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUNaO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFDWjtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQ1o7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUNaO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFDWjtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQ1o7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUNaO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFDWjtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQ1o7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUNaO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFDWjtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQ1o7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUNaO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFDWjtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQ1o7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQTtBQUdkLFFBQU0scUJBQXFCO0FBQUE7QUFBQSxJQUV6QjtBQUFBLElBQUc7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQ1g7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUNaO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFDWjtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQ1o7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUNaO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFDWjtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFBSztBQUFBLElBQ2I7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUs7QUFBQSxJQUNiO0FBQUEsSUFBSTtBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFDZDtBQUFBLElBQUk7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQ2Q7QUFBQSxJQUFJO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUNkO0FBQUEsSUFBSTtBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFDZDtBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQ2Y7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUNmO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFDZjtBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQ2Y7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUNmO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFDZjtBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQ2Y7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUNmO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFDZjtBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQ2Y7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUNmO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFDZjtBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQ2Y7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUNmO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFNO0FBQUEsSUFDaEI7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQU07QUFBQSxJQUNoQjtBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBTTtBQUFBLElBQ2hCO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFNO0FBQUEsSUFDaEI7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQU07QUFBQSxJQUNoQjtBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBTTtBQUFBLElBQ2hCO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFNO0FBQUEsSUFDaEI7QUFBQSxJQUFLO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUNqQjtBQUFBLElBQUs7QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQ2pCO0FBQUEsSUFBSztBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFDakI7QUFBQSxJQUFLO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUNqQjtBQUFBLElBQUs7QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQ2pCO0FBQUEsSUFBSztBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFDakI7QUFBQSxJQUFLO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQTtBQVduQix1Q0FBeUIsU0FBUyxlQUFnQkYsVUFBU0ksdUJBQXNCO0FBQy9FLFlBQVFBLHVCQUFvQjtBQUFBLE1BQzFCLEtBQUssUUFBUTtBQUNYLGVBQU8saUJBQWlCSixXQUFVLEtBQUssSUFBSSxDQUFDO0FBQUEsTUFDOUMsS0FBSyxRQUFRO0FBQ1gsZUFBTyxpQkFBaUJBLFdBQVUsS0FBSyxJQUFJLENBQUM7QUFBQSxNQUM5QyxLQUFLLFFBQVE7QUFDWCxlQUFPLGlCQUFpQkEsV0FBVSxLQUFLLElBQUksQ0FBQztBQUFBLE1BQzlDLEtBQUssUUFBUTtBQUNYLGVBQU8saUJBQWlCQSxXQUFVLEtBQUssSUFBSSxDQUFDO0FBQUEsTUFDOUM7QUFDRSxlQUFPO0FBQUE7RUFFYjtBQVVBLCtDQUFpQyxTQUFTLHVCQUF3QkEsVUFBU0ksdUJBQXNCO0FBQy9GLFlBQVFBLHVCQUFvQjtBQUFBLE1BQzFCLEtBQUssUUFBUTtBQUNYLGVBQU8sb0JBQW9CSixXQUFVLEtBQUssSUFBSSxDQUFDO0FBQUEsTUFDakQsS0FBSyxRQUFRO0FBQ1gsZUFBTyxvQkFBb0JBLFdBQVUsS0FBSyxJQUFJLENBQUM7QUFBQSxNQUNqRCxLQUFLLFFBQVE7QUFDWCxlQUFPLG9CQUFvQkEsV0FBVSxLQUFLLElBQUksQ0FBQztBQUFBLE1BQ2pELEtBQUssUUFBUTtBQUNYLGVBQU8sb0JBQW9CQSxXQUFVLEtBQUssSUFBSSxDQUFDO0FBQUEsTUFDakQ7QUFDRSxlQUFPO0FBQUE7RUFFYjs7Ozs7Ozs7O0FDdElBLFFBQU0sWUFBWSxJQUFJLFdBQVcsR0FBRztBQUNwQyxRQUFNLFlBQVksSUFBSSxXQUFXLEdBQUc7QUFTbkMsR0FBQyxTQUFTLGFBQWM7QUFDdkIsUUFBSSxJQUFJO0FBQ1IsYUFBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLEtBQUs7QUFDNUIsZ0JBQVUsQ0FBQyxJQUFJO0FBQ2YsZ0JBQVUsQ0FBQyxJQUFJO0FBRWYsWUFBTTtBQUlOLFVBQUksSUFBSSxLQUFPO0FBQ2IsYUFBSztBQUFBLE1BQ1g7QUFBQSxJQUNBO0FBTUUsYUFBUyxJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUs7QUFDOUIsZ0JBQVUsQ0FBQyxJQUFJLFVBQVUsSUFBSSxHQUFHO0FBQUEsSUFDcEM7QUFBQSxFQUNBLEdBQUM7QUFRRCxvQkFBYyxTQUFTLElBQUssR0FBRztBQUM3QixRQUFJLElBQUksRUFBRyxPQUFNLElBQUksTUFBTSxTQUFTLElBQUksR0FBRztBQUMzQyxXQUFPLFVBQVUsQ0FBQztBQUFBLEVBQ3BCO0FBUUEsb0JBQWMsU0FBUyxJQUFLLEdBQUc7QUFDN0IsV0FBTyxVQUFVLENBQUM7QUFBQSxFQUNwQjtBQVNBLG9CQUFjLFNBQVMsSUFBSyxHQUFHLEdBQUc7QUFDaEMsUUFBSSxNQUFNLEtBQUssTUFBTSxFQUFHLFFBQU87QUFJL0IsV0FBTyxVQUFVLFVBQVUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDO0FBQUEsRUFDOUM7Ozs7Ozs7O0FDcEVBLFVBQU0sS0FBS0UsbUJBQUE7QUFTWEQsY0FBQSxNQUFjLFNBQVMsSUFBSyxJQUFJLElBQUk7QUFDbEMsWUFBTSxRQUFRLElBQUksV0FBVyxHQUFHLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFFdEQsZUFBUyxJQUFJLEdBQUcsSUFBSSxHQUFHLFFBQVEsS0FBSztBQUNsQyxpQkFBUyxJQUFJLEdBQUcsSUFBSSxHQUFHLFFBQVEsS0FBSztBQUNsQyxnQkFBTSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFBQSxRQUN6QztBQUFBLE1BQ0E7QUFFRSxhQUFPO0FBQUEsSUFDVDtBQVNBQSxjQUFBLE1BQWMsU0FBUyxJQUFLLFVBQVUsU0FBUztBQUM3QyxVQUFJLFNBQVMsSUFBSSxXQUFXLFFBQVE7QUFFcEMsYUFBUSxPQUFPLFNBQVMsUUFBUSxVQUFXLEdBQUc7QUFDNUMsY0FBTSxRQUFRLE9BQU8sQ0FBQztBQUV0QixpQkFBUyxJQUFJLEdBQUcsSUFBSSxRQUFRLFFBQVEsS0FBSztBQUN2QyxpQkFBTyxDQUFDLEtBQUssR0FBRyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEtBQUs7QUFBQSxRQUMzQztBQUdJLFlBQUksU0FBUztBQUNiLGVBQU8sU0FBUyxPQUFPLFVBQVUsT0FBTyxNQUFNLE1BQU0sRUFBRztBQUN2RCxpQkFBUyxPQUFPLE1BQU0sTUFBTTtBQUFBLE1BQ2hDO0FBRUUsYUFBTztBQUFBLElBQ1Q7QUFTQUEsY0FBQSx1QkFBK0IsU0FBUyxxQkFBc0IsUUFBUTtBQUNwRSxVQUFJLE9BQU8sSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBQzdCLGVBQVMsSUFBSSxHQUFHLElBQUksUUFBUSxLQUFLO0FBQy9CLGVBQU9BLFVBQVEsSUFBSSxNQUFNLElBQUksV0FBVyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFBQSxNQUMzRDtBQUVFLGFBQU87QUFBQSxJQUNUO0FBQUE7Ozs7Ozs7O0FDN0RBLFFBQU0sYUFBYUMsa0JBQUE7QUFFbkIsV0FBUyxtQkFBb0IsUUFBUTtBQUNuQyxTQUFLLFVBQVU7QUFDZixTQUFLLFNBQVM7QUFFZCxRQUFJLEtBQUssT0FBUSxNQUFLLFdBQVcsS0FBSyxNQUFNO0FBQUEsRUFDOUM7QUFRQSxxQkFBbUIsVUFBVSxhQUFhLFNBQVMsV0FBWSxRQUFRO0FBRXJFLFNBQUssU0FBUztBQUNkLFNBQUssVUFBVSxXQUFXLHFCQUFxQixLQUFLLE1BQU07QUFBQSxFQUM1RDtBQVFBLHFCQUFtQixVQUFVLFNBQVMsU0FBUyxPQUFRLE1BQU07QUFDM0QsUUFBSSxDQUFDLEtBQUssU0FBUztBQUNqQixZQUFNLElBQUksTUFBTSx5QkFBeUI7QUFBQSxJQUM3QztBQUlFLFVBQU0sYUFBYSxJQUFJLFdBQVcsS0FBSyxTQUFTLEtBQUssTUFBTTtBQUMzRCxlQUFXLElBQUksSUFBSTtBQUluQixVQUFNLFlBQVksV0FBVyxJQUFJLFlBQVksS0FBSyxPQUFPO0FBS3pELFVBQU0sUUFBUSxLQUFLLFNBQVMsVUFBVTtBQUN0QyxRQUFJLFFBQVEsR0FBRztBQUNiLFlBQU0sT0FBTyxJQUFJLFdBQVcsS0FBSyxNQUFNO0FBQ3ZDLFdBQUssSUFBSSxXQUFXLEtBQUs7QUFFekIsYUFBTztBQUFBLElBQ1g7QUFFRSxXQUFPO0FBQUEsRUFDVDtBQUVBLHVCQUFpQjs7Ozs7Ozs7OztBQ2pEakIseUJBQWtCLFNBQVMsUUFBU0YsVUFBUztBQUMzQyxXQUFPLENBQUMsTUFBTUEsUUFBTyxLQUFLQSxZQUFXLEtBQUtBLFlBQVc7QUFBQSxFQUN2RDs7Ozs7Ozs7QUNSQSxRQUFNLFVBQVU7QUFDaEIsUUFBTSxlQUFlO0FBQ3JCLE1BQUksUUFBUTtBQUlaLFVBQVEsTUFBTSxRQUFRLE1BQU0sS0FBSztBQUVqQyxRQUFNLE9BQU8sK0JBQStCLFFBQVE7QUFFcEQsZ0JBQWdCLElBQUksT0FBTyxPQUFPLEdBQUc7QUFDckMscUJBQXFCLElBQUksT0FBTyx5QkFBeUIsR0FBRztBQUM1RCxlQUFlLElBQUksT0FBTyxNQUFNLEdBQUc7QUFDbkMsa0JBQWtCLElBQUksT0FBTyxTQUFTLEdBQUc7QUFDekMsdUJBQXVCLElBQUksT0FBTyxjQUFjLEdBQUc7QUFFbkQsUUFBTSxhQUFhLElBQUksT0FBTyxNQUFNLFFBQVEsR0FBRztBQUMvQyxRQUFNLGVBQWUsSUFBSSxPQUFPLE1BQU0sVUFBVSxHQUFHO0FBQ25ELFFBQU0sb0JBQW9CLElBQUksT0FBTyx3QkFBd0I7QUFFN0Qsb0JBQW9CLFNBQVMsVUFBVyxLQUFLO0FBQzNDLFdBQU8sV0FBVyxLQUFLLEdBQUc7QUFBQSxFQUM1QjtBQUVBLHNCQUFzQixTQUFTLFlBQWEsS0FBSztBQUMvQyxXQUFPLGFBQWEsS0FBSyxHQUFHO0FBQUEsRUFDOUI7QUFFQSwyQkFBMkIsU0FBUyxpQkFBa0IsS0FBSztBQUN6RCxXQUFPLGtCQUFrQixLQUFLLEdBQUc7QUFBQSxFQUNuQzs7Ozs7Ozs7QUM5QkEsVUFBTSxlQUFlRSxvQkFBQTtBQUNyQixVQUFNLFFBQVFHLGFBQUE7QUFTZEosY0FBQSxVQUFrQjtBQUFBLE1BQ2hCLElBQUk7QUFBQSxNQUNKLEtBQUssS0FBSztBQUFBLE1BQ1YsUUFBUSxDQUFDLElBQUksSUFBSSxFQUFFO0FBQUEsSUFDckI7QUFXQUEsY0FBQSxlQUF1QjtBQUFBLE1BQ3JCLElBQUk7QUFBQSxNQUNKLEtBQUssS0FBSztBQUFBLE1BQ1YsUUFBUSxDQUFDLEdBQUcsSUFBSSxFQUFFO0FBQUEsSUFDcEI7QUFPQUEsY0FBQSxPQUFlO0FBQUEsTUFDYixJQUFJO0FBQUEsTUFDSixLQUFLLEtBQUs7QUFBQSxNQUNWLFFBQVEsQ0FBQyxHQUFHLElBQUksRUFBRTtBQUFBLElBQ3BCO0FBV0FBLGNBQUEsUUFBZ0I7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLEtBQUssS0FBSztBQUFBLE1BQ1YsUUFBUSxDQUFDLEdBQUcsSUFBSSxFQUFFO0FBQUEsSUFDcEI7QUFRQUEsY0FBQSxRQUFnQjtBQUFBLE1BQ2QsS0FBSztBQUFBLElBQ1A7QUFVQUEsY0FBQSx3QkFBZ0MsU0FBUyxzQkFBdUJLLE9BQU1OLFVBQVM7QUFDN0UsVUFBSSxDQUFDTSxNQUFLLE9BQVEsT0FBTSxJQUFJLE1BQU0sbUJBQW1CQSxLQUFJO0FBRXpELFVBQUksQ0FBQyxhQUFhLFFBQVFOLFFBQU8sR0FBRztBQUNsQyxjQUFNLElBQUksTUFBTSxzQkFBc0JBLFFBQU87QUFBQSxNQUNqRDtBQUVFLFVBQUlBLFlBQVcsS0FBS0EsV0FBVSxHQUFJLFFBQU9NLE1BQUssT0FBTyxDQUFDO0FBQUEsZUFDN0NOLFdBQVUsR0FBSSxRQUFPTSxNQUFLLE9BQU8sQ0FBQztBQUMzQyxhQUFPQSxNQUFLLE9BQU8sQ0FBQztBQUFBLElBQ3RCO0FBUUFMLGNBQUEscUJBQTZCLFNBQVMsbUJBQW9CLFNBQVM7QUFDakUsVUFBSSxNQUFNLFlBQVksT0FBTyxFQUFHLFFBQU9BLFVBQVE7QUFBQSxlQUN0QyxNQUFNLGlCQUFpQixPQUFPLEVBQUcsUUFBT0EsVUFBUTtBQUFBLGVBQ2hELE1BQU0sVUFBVSxPQUFPLEVBQUcsUUFBT0EsVUFBUTtBQUFBLFVBQzdDLFFBQU9BLFVBQVE7QUFBQSxJQUN0QjtBQVFBQSxjQUFBLFdBQW1CLFNBQVMsU0FBVUssT0FBTTtBQUMxQyxVQUFJQSxTQUFRQSxNQUFLLEdBQUksUUFBT0EsTUFBSztBQUNqQyxZQUFNLElBQUksTUFBTSxjQUFjO0FBQUEsSUFDaEM7QUFRQUwsY0FBQSxVQUFrQixTQUFTLFFBQVNLLE9BQU07QUFDeEMsYUFBT0EsU0FBUUEsTUFBSyxPQUFPQSxNQUFLO0FBQUEsSUFDbEM7QUFRQSxhQUFTLFdBQVksUUFBUTtBQUMzQixVQUFJLE9BQU8sV0FBVyxVQUFVO0FBQzlCLGNBQU0sSUFBSSxNQUFNLHVCQUF1QjtBQUFBLE1BQzNDO0FBRUUsWUFBTSxRQUFRLE9BQU8sWUFBVztBQUVoQyxjQUFRLE9BQUs7QUFBQSxRQUNYLEtBQUs7QUFDSCxpQkFBT0wsVUFBUTtBQUFBLFFBQ2pCLEtBQUs7QUFDSCxpQkFBT0EsVUFBUTtBQUFBLFFBQ2pCLEtBQUs7QUFDSCxpQkFBT0EsVUFBUTtBQUFBLFFBQ2pCLEtBQUs7QUFDSCxpQkFBT0EsVUFBUTtBQUFBLFFBQ2pCO0FBQ0UsZ0JBQU0sSUFBSSxNQUFNLG1CQUFtQixNQUFNO0FBQUEsTUFDL0M7QUFBQSxJQUNBO0FBVUFBLGNBQUEsT0FBZSxTQUFTLEtBQU0sT0FBTyxjQUFjO0FBQ2pELFVBQUlBLFVBQVEsUUFBUSxLQUFLLEdBQUc7QUFDMUIsZUFBTztBQUFBLE1BQ1g7QUFFRSxVQUFJO0FBQ0YsZUFBTyxXQUFXLEtBQUs7QUFBQSxNQUMzQixTQUFXLEdBQUc7QUFDVixlQUFPO0FBQUEsTUFDWDtBQUFBLElBQ0E7QUFBQTs7Ozs7Ozs7QUN0S0EsVUFBTSxRQUFRQyxlQUFBO0FBQ2QsVUFBTSxTQUFTRywyQkFBQTtBQUNmLFVBQU0sVUFBVUUsNEJBQUE7QUFDaEIsVUFBTSxPQUFPQyxZQUFBO0FBQ2IsVUFBTSxlQUFlQyxvQkFBQTtBQUdyQixVQUFNLE1BQU8sS0FBSyxLQUFPLEtBQUssS0FBTyxLQUFLLEtBQU8sS0FBSyxJQUFNLEtBQUssSUFBTSxLQUFLLElBQU0sS0FBSyxJQUFNLEtBQUs7QUFDbEcsVUFBTSxVQUFVLE1BQU0sWUFBWSxHQUFHO0FBRXJDLGFBQVMsNEJBQTZCSCxPQUFNLFFBQVFGLHVCQUFzQjtBQUN4RSxlQUFTLGlCQUFpQixHQUFHLGtCQUFrQixJQUFJLGtCQUFrQjtBQUNuRSxZQUFJLFVBQVVILFVBQVEsWUFBWSxnQkFBZ0JHLHVCQUFzQkUsS0FBSSxHQUFHO0FBQzdFLGlCQUFPO0FBQUEsUUFDYjtBQUFBLE1BQ0E7QUFFRSxhQUFPO0FBQUEsSUFDVDtBQUVBLGFBQVMscUJBQXNCQSxPQUFNTixVQUFTO0FBRTVDLGFBQU8sS0FBSyxzQkFBc0JNLE9BQU1OLFFBQU8sSUFBSTtBQUFBLElBQ3JEO0FBRUEsYUFBUywwQkFBMkJVLFdBQVVWLFVBQVM7QUFDckQsVUFBSSxZQUFZO0FBRWhCLE1BQUFVLFVBQVMsUUFBUSxTQUFVLE1BQU07QUFDL0IsY0FBTSxlQUFlLHFCQUFxQixLQUFLLE1BQU1WLFFBQU87QUFDNUQscUJBQWEsZUFBZSxLQUFLLGNBQWE7QUFBQSxNQUNsRCxDQUFHO0FBRUQsYUFBTztBQUFBLElBQ1Q7QUFFQSxhQUFTLDJCQUE0QlUsV0FBVU4sdUJBQXNCO0FBQ25FLGVBQVMsaUJBQWlCLEdBQUcsa0JBQWtCLElBQUksa0JBQWtCO0FBQ25FLGNBQU0sU0FBUywwQkFBMEJNLFdBQVUsY0FBYztBQUNqRSxZQUFJLFVBQVVULFVBQVEsWUFBWSxnQkFBZ0JHLHVCQUFzQixLQUFLLEtBQUssR0FBRztBQUNuRixpQkFBTztBQUFBLFFBQ2I7QUFBQSxNQUNBO0FBRUUsYUFBTztBQUFBLElBQ1Q7QUFVQUgsY0FBQSxPQUFlLFNBQVMsS0FBTSxPQUFPLGNBQWM7QUFDakQsVUFBSSxhQUFhLFFBQVEsS0FBSyxHQUFHO0FBQy9CLGVBQU8sU0FBUyxPQUFPLEVBQUU7QUFBQSxNQUM3QjtBQUVFLGFBQU87QUFBQSxJQUNUO0FBV0FBLGNBQUEsY0FBc0IsU0FBUyxZQUFhRCxVQUFTSSx1QkFBc0JFLE9BQU07QUFDL0UsVUFBSSxDQUFDLGFBQWEsUUFBUU4sUUFBTyxHQUFHO0FBQ2xDLGNBQU0sSUFBSSxNQUFNLHlCQUF5QjtBQUFBLE1BQzdDO0FBR0UsVUFBSSxPQUFPTSxVQUFTLFlBQWEsQ0FBQUEsUUFBTyxLQUFLO0FBRzdDLFlBQU0saUJBQWlCLE1BQU0sd0JBQXdCTixRQUFPO0FBRzVELFlBQU0sbUJBQW1CLE9BQU8sdUJBQXVCQSxVQUFTSSxxQkFBb0I7QUFHcEYsWUFBTSwwQkFBMEIsaUJBQWlCLG9CQUFvQjtBQUVyRSxVQUFJRSxVQUFTLEtBQUssTUFBTyxRQUFPO0FBRWhDLFlBQU0sYUFBYSx5QkFBeUIscUJBQXFCQSxPQUFNTixRQUFPO0FBRzlFLGNBQVFNLE9BQUk7QUFBQSxRQUNWLEtBQUssS0FBSztBQUNSLGlCQUFPLEtBQUssTUFBTyxhQUFhLEtBQU0sQ0FBQztBQUFBLFFBRXpDLEtBQUssS0FBSztBQUNSLGlCQUFPLEtBQUssTUFBTyxhQUFhLEtBQU0sQ0FBQztBQUFBLFFBRXpDLEtBQUssS0FBSztBQUNSLGlCQUFPLEtBQUssTUFBTSxhQUFhLEVBQUU7QUFBQSxRQUVuQyxLQUFLLEtBQUs7QUFBQSxRQUNWO0FBQ0UsaUJBQU8sS0FBSyxNQUFNLGFBQWEsQ0FBQztBQUFBLE1BQ3RDO0FBQUEsSUFDQTtBQVVBTCxjQUFBLHdCQUFnQyxTQUFTLHNCQUF1QixNQUFNRyx1QkFBc0I7QUFDMUYsVUFBSTtBQUVKLFlBQU0sTUFBTSxRQUFRLEtBQUtBLHVCQUFzQixRQUFRLENBQUM7QUFFeEQsVUFBSSxNQUFNLFFBQVEsSUFBSSxHQUFHO0FBQ3ZCLFlBQUksS0FBSyxTQUFTLEdBQUc7QUFDbkIsaUJBQU8sMkJBQTJCLE1BQU0sR0FBRztBQUFBLFFBQ2pEO0FBRUksWUFBSSxLQUFLLFdBQVcsR0FBRztBQUNyQixpQkFBTztBQUFBLFFBQ2I7QUFFSSxjQUFNLEtBQUssQ0FBQztBQUFBLE1BQ2hCLE9BQVM7QUFDTCxjQUFNO0FBQUEsTUFDVjtBQUVFLGFBQU8sNEJBQTRCLElBQUksTUFBTSxJQUFJLFVBQVMsR0FBSSxHQUFHO0FBQUEsSUFDbkU7QUFZQUgsY0FBQSxpQkFBeUIsU0FBUyxlQUFnQkQsVUFBUztBQUN6RCxVQUFJLENBQUMsYUFBYSxRQUFRQSxRQUFPLEtBQUtBLFdBQVUsR0FBRztBQUNqRCxjQUFNLElBQUksTUFBTSx5QkFBeUI7QUFBQSxNQUM3QztBQUVFLFVBQUksSUFBSUEsWUFBVztBQUVuQixhQUFPLE1BQU0sWUFBWSxDQUFDLElBQUksV0FBVyxHQUFHO0FBQzFDLGFBQU0sT0FBUSxNQUFNLFlBQVksQ0FBQyxJQUFJO0FBQUEsTUFDekM7QUFFRSxhQUFRQSxZQUFXLEtBQU07QUFBQSxJQUMzQjtBQUFBOzs7Ozs7OztBQ2xLQSxRQUFNLFFBQVFFLGVBQUE7QUFFZCxRQUFNLE1BQU8sS0FBSyxLQUFPLEtBQUssSUFBTSxLQUFLLElBQU0sS0FBSyxJQUFNLEtBQUssSUFBTSxLQUFLLElBQU0sS0FBSztBQUNyRixRQUFNLFdBQVksS0FBSyxLQUFPLEtBQUssS0FBTyxLQUFLLEtBQU8sS0FBSyxJQUFNLEtBQUs7QUFDdEUsUUFBTSxVQUFVLE1BQU0sWUFBWSxHQUFHO0FBWXJDLDhCQUF5QixTQUFTLGVBQWdCRSx1QkFBc0IsTUFBTTtBQUM1RSxVQUFNLE9BQVNBLHNCQUFxQixPQUFPLElBQUs7QUFDaEQsUUFBSSxJQUFJLFFBQVE7QUFFaEIsV0FBTyxNQUFNLFlBQVksQ0FBQyxJQUFJLFdBQVcsR0FBRztBQUMxQyxXQUFNLE9BQVEsTUFBTSxZQUFZLENBQUMsSUFBSTtBQUFBLElBQ3pDO0FBS0UsWUFBUyxRQUFRLEtBQU0sS0FBSztBQUFBLEVBQzlCOzs7Ozs7Ozs7QUM1QkEsUUFBTSxPQUFPRixZQUFBO0FBRWIsV0FBUyxZQUFhLE1BQU07QUFDMUIsU0FBSyxPQUFPLEtBQUs7QUFDakIsU0FBSyxPQUFPLEtBQUssU0FBUTtBQUFBLEVBQzNCO0FBRUEsY0FBWSxnQkFBZ0IsU0FBUyxjQUFlLFFBQVE7QUFDMUQsV0FBTyxLQUFLLEtBQUssTUFBTSxTQUFTLENBQUMsS0FBTSxTQUFTLElBQU8sU0FBUyxJQUFLLElBQUksSUFBSztBQUFBLEVBQ2hGO0FBRUEsY0FBWSxVQUFVLFlBQVksU0FBUyxZQUFhO0FBQ3RELFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDbkI7QUFFQSxjQUFZLFVBQVUsZ0JBQWdCLFNBQVMsZ0JBQWlCO0FBQzlELFdBQU8sWUFBWSxjQUFjLEtBQUssS0FBSyxNQUFNO0FBQUEsRUFDbkQ7QUFFQSxjQUFZLFVBQVUsUUFBUSxTQUFTLE1BQU9TLFlBQVc7QUFDdkQsUUFBSSxHQUFHLE9BQU87QUFJZCxTQUFLLElBQUksR0FBRyxJQUFJLEtBQUssS0FBSyxLQUFLLFFBQVEsS0FBSyxHQUFHO0FBQzdDLGNBQVEsS0FBSyxLQUFLLE9BQU8sR0FBRyxDQUFDO0FBQzdCLGNBQVEsU0FBUyxPQUFPLEVBQUU7QUFFMUIsTUFBQUEsV0FBVSxJQUFJLE9BQU8sRUFBRTtBQUFBLElBQzNCO0FBSUUsVUFBTSxlQUFlLEtBQUssS0FBSyxTQUFTO0FBQ3hDLFFBQUksZUFBZSxHQUFHO0FBQ3BCLGNBQVEsS0FBSyxLQUFLLE9BQU8sQ0FBQztBQUMxQixjQUFRLFNBQVMsT0FBTyxFQUFFO0FBRTFCLE1BQUFBLFdBQVUsSUFBSSxPQUFPLGVBQWUsSUFBSSxDQUFDO0FBQUEsSUFDN0M7QUFBQSxFQUNBO0FBRUEsZ0JBQWlCOzs7Ozs7OztBQzFDakIsUUFBTSxPQUFPVCxZQUFBO0FBV2IsUUFBTSxrQkFBa0I7QUFBQSxJQUN0QjtBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQzdDO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFDNUQ7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUM1RDtBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsSUFBSztBQUFBLElBQUs7QUFBQSxJQUFLO0FBQUEsRUFDMUM7QUFFQSxXQUFTLGlCQUFrQixNQUFNO0FBQy9CLFNBQUssT0FBTyxLQUFLO0FBQ2pCLFNBQUssT0FBTztBQUFBLEVBQ2Q7QUFFQSxtQkFBaUIsZ0JBQWdCLFNBQVMsY0FBZSxRQUFRO0FBQy9ELFdBQU8sS0FBSyxLQUFLLE1BQU0sU0FBUyxDQUFDLElBQUksS0FBSyxTQUFTO0FBQUEsRUFDckQ7QUFFQSxtQkFBaUIsVUFBVSxZQUFZLFNBQVMsWUFBYTtBQUMzRCxXQUFPLEtBQUssS0FBSztBQUFBLEVBQ25CO0FBRUEsbUJBQWlCLFVBQVUsZ0JBQWdCLFNBQVMsZ0JBQWlCO0FBQ25FLFdBQU8saUJBQWlCLGNBQWMsS0FBSyxLQUFLLE1BQU07QUFBQSxFQUN4RDtBQUVBLG1CQUFpQixVQUFVLFFBQVEsU0FBUyxNQUFPUyxZQUFXO0FBQzVELFFBQUk7QUFJSixTQUFLLElBQUksR0FBRyxJQUFJLEtBQUssS0FBSyxLQUFLLFFBQVEsS0FBSyxHQUFHO0FBRTdDLFVBQUksUUFBUSxnQkFBZ0IsUUFBUSxLQUFLLEtBQUssQ0FBQyxDQUFDLElBQUk7QUFHcEQsZUFBUyxnQkFBZ0IsUUFBUSxLQUFLLEtBQUssSUFBSSxDQUFDLENBQUM7QUFHakQsTUFBQUEsV0FBVSxJQUFJLE9BQU8sRUFBRTtBQUFBLElBQzNCO0FBSUUsUUFBSSxLQUFLLEtBQUssU0FBUyxHQUFHO0FBQ3hCLE1BQUFBLFdBQVUsSUFBSSxnQkFBZ0IsUUFBUSxLQUFLLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUFBLElBQzFEO0FBQUEsRUFDQTtBQUVBLHFCQUFpQjs7Ozs7Ozs7QUMxRGpCLFFBQU0sT0FBT1QsWUFBQTtBQUViLFdBQVMsU0FBVSxNQUFNO0FBQ3ZCLFNBQUssT0FBTyxLQUFLO0FBQ2pCLFFBQUksT0FBUSxTQUFVLFVBQVU7QUFDOUIsV0FBSyxPQUFPLElBQUksWUFBVyxFQUFHLE9BQU8sSUFBSTtBQUFBLElBQzdDLE9BQVM7QUFDTCxXQUFLLE9BQU8sSUFBSSxXQUFXLElBQUk7QUFBQSxJQUNuQztBQUFBLEVBQ0E7QUFFQSxXQUFTLGdCQUFnQixTQUFTLGNBQWUsUUFBUTtBQUN2RCxXQUFPLFNBQVM7QUFBQSxFQUNsQjtBQUVBLFdBQVMsVUFBVSxZQUFZLFNBQVMsWUFBYTtBQUNuRCxXQUFPLEtBQUssS0FBSztBQUFBLEVBQ25CO0FBRUEsV0FBUyxVQUFVLGdCQUFnQixTQUFTLGdCQUFpQjtBQUMzRCxXQUFPLFNBQVMsY0FBYyxLQUFLLEtBQUssTUFBTTtBQUFBLEVBQ2hEO0FBRUEsV0FBUyxVQUFVLFFBQVEsU0FBVVMsWUFBVztBQUM5QyxhQUFTLElBQUksR0FBRyxJQUFJLEtBQUssS0FBSyxRQUFRLElBQUksR0FBRyxLQUFLO0FBQ2hELE1BQUFBLFdBQVUsSUFBSSxLQUFLLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFBQSxJQUNqQztBQUFBLEVBQ0E7QUFFQSxhQUFpQjs7Ozs7Ozs7QUM3QmpCLFFBQU0sT0FBT1QsWUFBQTtBQUNiLFFBQU0sUUFBUUcsZUFBQTtBQUVkLFdBQVMsVUFBVyxNQUFNO0FBQ3hCLFNBQUssT0FBTyxLQUFLO0FBQ2pCLFNBQUssT0FBTztBQUFBLEVBQ2Q7QUFFQSxZQUFVLGdCQUFnQixTQUFTLGNBQWUsUUFBUTtBQUN4RCxXQUFPLFNBQVM7QUFBQSxFQUNsQjtBQUVBLFlBQVUsVUFBVSxZQUFZLFNBQVMsWUFBYTtBQUNwRCxXQUFPLEtBQUssS0FBSztBQUFBLEVBQ25CO0FBRUEsWUFBVSxVQUFVLGdCQUFnQixTQUFTLGdCQUFpQjtBQUM1RCxXQUFPLFVBQVUsY0FBYyxLQUFLLEtBQUssTUFBTTtBQUFBLEVBQ2pEO0FBRUEsWUFBVSxVQUFVLFFBQVEsU0FBVU0sWUFBVztBQUMvQyxRQUFJO0FBS0osU0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLEtBQUssUUFBUSxLQUFLO0FBQ3JDLFVBQUksUUFBUSxNQUFNLE9BQU8sS0FBSyxLQUFLLENBQUMsQ0FBQztBQUdyQyxVQUFJLFNBQVMsU0FBVSxTQUFTLE9BQVE7QUFFdEMsaUJBQVM7QUFBQSxNQUdmLFdBQWUsU0FBUyxTQUFVLFNBQVMsT0FBUTtBQUU3QyxpQkFBUztBQUFBLE1BQ2YsT0FBVztBQUNMLGNBQU0sSUFBSTtBQUFBLFVBQ1IsNkJBQTZCLEtBQUssS0FBSyxDQUFDLElBQUk7QUFBQSxRQUNYO0FBQUEsTUFDekM7QUFJSSxlQUFXLFVBQVUsSUFBSyxPQUFRLE9BQVMsUUFBUTtBQUduRCxNQUFBQSxXQUFVLElBQUksT0FBTyxFQUFFO0FBQUEsSUFDM0I7QUFBQSxFQUNBO0FBRUEsY0FBaUI7Ozs7Ozs7OztBQzlCakIsUUFBSUMsWUFBVztBQUFBLE1BQ2IsOEJBQThCLFNBQVMsT0FBTyxHQUFHLEdBQUc7QUFHbEQsWUFBSSxlQUFlO0FBSW5CLFlBQUksUUFBUTtBQUNaLGNBQU0sQ0FBQyxJQUFJO0FBTVgsWUFBSSxPQUFPQSxVQUFTLGNBQWMsS0FBSTtBQUN0QyxhQUFLLEtBQUssR0FBRyxDQUFDO0FBRWQsWUFBSSxTQUNBLEdBQUcsR0FDSCxnQkFDQSxnQkFDQSxXQUNBLCtCQUNBLGdCQUNBO0FBQ0osZUFBTyxDQUFDLEtBQUssU0FBUztBQUdwQixvQkFBVSxLQUFLLElBQUc7QUFDbEIsY0FBSSxRQUFRO0FBQ1osMkJBQWlCLFFBQVE7QUFHekIsMkJBQWlCLE1BQU0sQ0FBQyxLQUFLO0FBSzdCLGVBQUssS0FBSyxnQkFBZ0I7QUFDeEIsZ0JBQUksZUFBZSxlQUFlLENBQUMsR0FBRztBQUVwQywwQkFBWSxlQUFlLENBQUM7QUFLNUIsOENBQWdDLGlCQUFpQjtBQU1qRCwrQkFBaUIsTUFBTSxDQUFDO0FBQ3hCLDRCQUFlLE9BQU8sTUFBTSxDQUFDLE1BQU07QUFDbkMsa0JBQUksZUFBZSxpQkFBaUIsK0JBQStCO0FBQ2pFLHNCQUFNLENBQUMsSUFBSTtBQUNYLHFCQUFLLEtBQUssR0FBRyw2QkFBNkI7QUFDMUMsNkJBQWEsQ0FBQyxJQUFJO0FBQUEsY0FDOUI7QUFBQSxZQUNBO0FBQUEsVUFDQTtBQUFBLFFBQ0E7QUFFSSxZQUFJLE9BQU8sTUFBTSxlQUFlLE9BQU8sTUFBTSxDQUFDLE1BQU0sYUFBYTtBQUMvRCxjQUFJLE1BQU0sQ0FBQywrQkFBK0IsR0FBRyxRQUFRLEdBQUcsR0FBRyxFQUFFLEtBQUssRUFBRTtBQUNwRSxnQkFBTSxJQUFJLE1BQU0sR0FBRztBQUFBLFFBQ3pCO0FBRUksZUFBTztBQUFBLE1BQ1g7QUFBQSxNQUVFLDZDQUE2QyxTQUFTLGNBQWMsR0FBRztBQUNyRSxZQUFJLFFBQVE7QUFDWixZQUFJLElBQUk7QUFFUixlQUFPLEdBQUc7QUFDUixnQkFBTSxLQUFLLENBQUM7QUFDRSx1QkFBYSxDQUFDO0FBQzVCLGNBQUksYUFBYSxDQUFDO0FBQUEsUUFDeEI7QUFDSSxjQUFNLFFBQU87QUFDYixlQUFPO0FBQUEsTUFDWDtBQUFBLE1BRUUsV0FBVyxTQUFTLE9BQU8sR0FBRyxHQUFHO0FBQy9CLFlBQUksZUFBZUEsVUFBUyw2QkFBNkIsT0FBTyxHQUFHLENBQUM7QUFDcEUsZUFBT0EsVUFBUztBQUFBLFVBQ2Q7QUFBQSxVQUFjO0FBQUEsUUFBQztBQUFBLE1BQ3JCO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLRSxlQUFlO0FBQUEsUUFDYixNQUFNLFNBQVUsTUFBTTtBQUNwQixjQUFJLElBQUlBLFVBQVMsZUFDYixJQUFJLElBQ0o7QUFDSixpQkFBTyxRQUFRO0FBQ2YsZUFBSyxPQUFPLEdBQUc7QUFDYixnQkFBSSxFQUFFLGVBQWUsR0FBRyxHQUFHO0FBQ3pCLGdCQUFFLEdBQUcsSUFBSSxFQUFFLEdBQUc7QUFBQSxZQUN4QjtBQUFBLFVBQ0E7QUFDTSxZQUFFLFFBQVE7QUFDVixZQUFFLFNBQVMsS0FBSyxVQUFVLEVBQUU7QUFDNUIsaUJBQU87QUFBQSxRQUNiO0FBQUEsUUFFSSxnQkFBZ0IsU0FBVSxHQUFHLEdBQUc7QUFDOUIsaUJBQU8sRUFBRSxPQUFPLEVBQUU7QUFBQSxRQUN4QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFNSSxNQUFNLFNBQVUsT0FBTyxNQUFNO0FBQzNCLGNBQUksT0FBTyxFQUFDLE9BQWMsS0FBVTtBQUNwQyxlQUFLLE1BQU0sS0FBSyxJQUFJO0FBQ3BCLGVBQUssTUFBTSxLQUFLLEtBQUssTUFBTTtBQUFBLFFBQ2pDO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFLSSxLQUFLLFdBQVk7QUFDZixpQkFBTyxLQUFLLE1BQU0sTUFBSztBQUFBLFFBQzdCO0FBQUEsUUFFSSxPQUFPLFdBQVk7QUFDakIsaUJBQU8sS0FBSyxNQUFNLFdBQVc7QUFBQSxRQUNuQztBQUFBLE1BQ0E7QUFBQTtBQUttQztBQUNqQyx1QkFBaUJBO0FBQUEsSUFDbkI7QUFBQTs7Ozs7Ozs7QUNwS0EsVUFBTSxPQUFPVixZQUFBO0FBQ2IsVUFBTSxjQUFjRyxtQkFBQTtBQUNwQixVQUFNLG1CQUFtQkUsd0JBQUE7QUFDekIsVUFBTSxXQUFXQyxnQkFBQTtBQUNqQixVQUFNLFlBQVlDLGlCQUFBO0FBQ2xCLFVBQU0sUUFBUUksYUFBQTtBQUNkLFVBQU0sUUFBUUMsZUFBQTtBQUNkLFVBQU1GLFlBQVdHLGdCQUFBO0FBUWpCLGFBQVMsb0JBQXFCLEtBQUs7QUFDakMsYUFBTyxTQUFTLG1CQUFtQixHQUFHLENBQUMsRUFBRTtBQUFBLElBQzNDO0FBVUEsYUFBUyxZQUFhQyxRQUFPVixPQUFNLEtBQUs7QUFDdEMsWUFBTUksWUFBVztBQUNqQixVQUFJO0FBRUosY0FBUSxTQUFTTSxPQUFNLEtBQUssR0FBRyxPQUFPLE1BQU07QUFDMUMsUUFBQU4sVUFBUyxLQUFLO0FBQUEsVUFDWixNQUFNLE9BQU8sQ0FBQztBQUFBLFVBQ2QsT0FBTyxPQUFPO0FBQUEsVUFDZCxNQUFNSjtBQUFBLFVBQ04sUUFBUSxPQUFPLENBQUMsRUFBRTtBQUFBLFNBQ25CO0FBQUEsTUFDTDtBQUVFLGFBQU9JO0FBQUEsSUFDVDtBQVNBLGFBQVMsc0JBQXVCLFNBQVM7QUFDdkMsWUFBTSxVQUFVLFlBQVksTUFBTSxTQUFTLEtBQUssU0FBUyxPQUFPO0FBQ2hFLFlBQU0sZUFBZSxZQUFZLE1BQU0sY0FBYyxLQUFLLGNBQWMsT0FBTztBQUMvRSxVQUFJO0FBQ0osVUFBSTtBQUVKLFVBQUksTUFBTSxzQkFBc0I7QUFDOUIsbUJBQVcsWUFBWSxNQUFNLE1BQU0sS0FBSyxNQUFNLE9BQU87QUFDckQsb0JBQVksWUFBWSxNQUFNLE9BQU8sS0FBSyxPQUFPLE9BQU87QUFBQSxNQUM1RCxPQUFTO0FBQ0wsbUJBQVcsWUFBWSxNQUFNLFlBQVksS0FBSyxNQUFNLE9BQU87QUFDM0Qsb0JBQVk7QUFBQSxNQUNoQjtBQUVFLFlBQU0sT0FBTyxRQUFRLE9BQU8sY0FBYyxVQUFVLFNBQVM7QUFFN0QsYUFBTyxLQUNKLEtBQUssU0FBVSxJQUFJLElBQUk7QUFDdEIsZUFBTyxHQUFHLFFBQVEsR0FBRztBQUFBLE1BQzNCLENBQUssRUFDQSxJQUFJLFNBQVUsS0FBSztBQUNsQixlQUFPO0FBQUEsVUFDTCxNQUFNLElBQUk7QUFBQSxVQUNWLE1BQU0sSUFBSTtBQUFBLFVBQ1YsUUFBUSxJQUFJO0FBQUEsUUFDcEI7QUFBQSxNQUNBLENBQUs7QUFBQSxJQUNMO0FBVUEsYUFBUyxxQkFBc0IsUUFBUUosT0FBTTtBQUMzQyxjQUFRQSxPQUFJO0FBQUEsUUFDVixLQUFLLEtBQUs7QUFDUixpQkFBTyxZQUFZLGNBQWMsTUFBTTtBQUFBLFFBQ3pDLEtBQUssS0FBSztBQUNSLGlCQUFPLGlCQUFpQixjQUFjLE1BQU07QUFBQSxRQUM5QyxLQUFLLEtBQUs7QUFDUixpQkFBTyxVQUFVLGNBQWMsTUFBTTtBQUFBLFFBQ3ZDLEtBQUssS0FBSztBQUNSLGlCQUFPLFNBQVMsY0FBYyxNQUFNO0FBQUEsTUFDMUM7QUFBQSxJQUNBO0FBUUEsYUFBUyxjQUFlLE1BQU07QUFDNUIsYUFBTyxLQUFLLE9BQU8sU0FBVSxLQUFLLE1BQU07QUFDdEMsY0FBTSxVQUFVLElBQUksU0FBUyxLQUFLLElBQUksSUFBSSxJQUFJLFNBQVMsQ0FBQyxJQUFJO0FBQzVELFlBQUksV0FBVyxRQUFRLFNBQVMsS0FBSyxNQUFNO0FBQ3pDLGNBQUksSUFBSSxTQUFTLENBQUMsRUFBRSxRQUFRLEtBQUs7QUFDakMsaUJBQU87QUFBQSxRQUNiO0FBRUksWUFBSSxLQUFLLElBQUk7QUFDYixlQUFPO0FBQUEsTUFDWCxHQUFLLEVBQUU7QUFBQSxJQUNQO0FBa0JBLGFBQVMsV0FBWSxNQUFNO0FBQ3pCLFlBQU0sUUFBUTtBQUNkLGVBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxRQUFRLEtBQUs7QUFDcEMsY0FBTSxNQUFNLEtBQUssQ0FBQztBQUVsQixnQkFBUSxJQUFJLE1BQUk7QUFBQSxVQUNkLEtBQUssS0FBSztBQUNSLGtCQUFNLEtBQUs7QUFBQSxjQUFDO0FBQUEsY0FDVixFQUFFLE1BQU0sSUFBSSxNQUFNLE1BQU0sS0FBSyxjQUFjLFFBQVEsSUFBSSxPQUFNO0FBQUEsY0FDN0QsRUFBRSxNQUFNLElBQUksTUFBTSxNQUFNLEtBQUssTUFBTSxRQUFRLElBQUksT0FBTTtBQUFBLGFBQ3REO0FBQ0Q7QUFBQSxVQUNGLEtBQUssS0FBSztBQUNSLGtCQUFNLEtBQUs7QUFBQSxjQUFDO0FBQUEsY0FDVixFQUFFLE1BQU0sSUFBSSxNQUFNLE1BQU0sS0FBSyxNQUFNLFFBQVEsSUFBSSxPQUFNO0FBQUEsYUFDdEQ7QUFDRDtBQUFBLFVBQ0YsS0FBSyxLQUFLO0FBQ1Isa0JBQU0sS0FBSztBQUFBLGNBQUM7QUFBQSxjQUNWLEVBQUUsTUFBTSxJQUFJLE1BQU0sTUFBTSxLQUFLLE1BQU0sUUFBUSxvQkFBb0IsSUFBSSxJQUFJLEVBQUM7QUFBQSxhQUN6RTtBQUNEO0FBQUEsVUFDRixLQUFLLEtBQUs7QUFDUixrQkFBTSxLQUFLO0FBQUEsY0FDVCxFQUFFLE1BQU0sSUFBSSxNQUFNLE1BQU0sS0FBSyxNQUFNLFFBQVEsb0JBQW9CLElBQUksSUFBSSxFQUFDO0FBQUEsYUFDekU7QUFBQSxRQUNUO0FBQUEsTUFDQTtBQUVFLGFBQU87QUFBQSxJQUNUO0FBY0EsYUFBUyxXQUFZLE9BQU9OLFVBQVM7QUFDbkMsWUFBTSxRQUFRO0FBQ2QsWUFBTSxRQUFRLEVBQUUsT0FBTyxHQUFFO0FBQ3pCLFVBQUksY0FBYyxDQUFDLE9BQU87QUFFMUIsZUFBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLFFBQVEsS0FBSztBQUNyQyxjQUFNLFlBQVksTUFBTSxDQUFDO0FBQ3pCLGNBQU0saUJBQWlCO0FBRXZCLGlCQUFTLElBQUksR0FBRyxJQUFJLFVBQVUsUUFBUSxLQUFLO0FBQ3pDLGdCQUFNLE9BQU8sVUFBVSxDQUFDO0FBQ3hCLGdCQUFNLE1BQU0sS0FBSyxJQUFJO0FBRXJCLHlCQUFlLEtBQUssR0FBRztBQUN2QixnQkFBTSxHQUFHLElBQUksRUFBRSxNQUFZLFdBQVcsRUFBQztBQUN2QyxnQkFBTSxHQUFHLElBQUk7QUFFYixtQkFBUyxJQUFJLEdBQUcsSUFBSSxZQUFZLFFBQVEsS0FBSztBQUMzQyxrQkFBTSxhQUFhLFlBQVksQ0FBQztBQUVoQyxnQkFBSSxNQUFNLFVBQVUsS0FBSyxNQUFNLFVBQVUsRUFBRSxLQUFLLFNBQVMsS0FBSyxNQUFNO0FBQ2xFLG9CQUFNLFVBQVUsRUFBRSxHQUFHLElBQ25CLHFCQUFxQixNQUFNLFVBQVUsRUFBRSxZQUFZLEtBQUssUUFBUSxLQUFLLElBQUksSUFDekUscUJBQXFCLE1BQU0sVUFBVSxFQUFFLFdBQVcsS0FBSyxJQUFJO0FBRTdELG9CQUFNLFVBQVUsRUFBRSxhQUFhLEtBQUs7QUFBQSxZQUM5QyxPQUFlO0FBQ0wsa0JBQUksTUFBTSxVQUFVLEVBQUcsT0FBTSxVQUFVLEVBQUUsWUFBWSxLQUFLO0FBRTFELG9CQUFNLFVBQVUsRUFBRSxHQUFHLElBQUkscUJBQXFCLEtBQUssUUFBUSxLQUFLLElBQUksSUFDbEUsSUFBSSxLQUFLLHNCQUFzQixLQUFLLE1BQU1BLFFBQU87QUFBQSxZQUM3RDtBQUFBLFVBQ0E7QUFBQSxRQUNBO0FBRUksc0JBQWM7QUFBQSxNQUNsQjtBQUVFLGVBQVMsSUFBSSxHQUFHLElBQUksWUFBWSxRQUFRLEtBQUs7QUFDM0MsY0FBTSxZQUFZLENBQUMsQ0FBQyxFQUFFLE1BQU07QUFBQSxNQUNoQztBQUVFLGFBQU8sRUFBRSxLQUFLLE9BQU8sTUFBWTtBQUFBLElBQ25DO0FBVUEsYUFBUyxtQkFBb0IsTUFBTSxXQUFXO0FBQzVDLFVBQUlNO0FBQ0osWUFBTSxXQUFXLEtBQUssbUJBQW1CLElBQUk7QUFFN0MsTUFBQUEsUUFBTyxLQUFLLEtBQUssV0FBVyxRQUFRO0FBR3BDLFVBQUlBLFVBQVMsS0FBSyxRQUFRQSxNQUFLLE1BQU0sU0FBUyxLQUFLO0FBQ2pELGNBQU0sSUFBSSxNQUFNLE1BQU0sT0FBTyxtQ0FDTyxLQUFLLFNBQVNBLEtBQUksSUFDcEQsNEJBQTRCLEtBQUssU0FBUyxRQUFRLENBQUM7QUFBQSxNQUN6RDtBQUdFLFVBQUlBLFVBQVMsS0FBSyxTQUFTLENBQUMsTUFBTSxtQkFBa0IsR0FBSTtBQUN0RCxRQUFBQSxRQUFPLEtBQUs7QUFBQSxNQUNoQjtBQUVFLGNBQVFBLE9BQUk7QUFBQSxRQUNWLEtBQUssS0FBSztBQUNSLGlCQUFPLElBQUksWUFBWSxJQUFJO0FBQUEsUUFFN0IsS0FBSyxLQUFLO0FBQ1IsaUJBQU8sSUFBSSxpQkFBaUIsSUFBSTtBQUFBLFFBRWxDLEtBQUssS0FBSztBQUNSLGlCQUFPLElBQUksVUFBVSxJQUFJO0FBQUEsUUFFM0IsS0FBSyxLQUFLO0FBQ1IsaUJBQU8sSUFBSSxTQUFTLElBQUk7QUFBQSxNQUM5QjtBQUFBLElBQ0E7QUFpQkFMLGNBQUEsWUFBb0IsU0FBUyxVQUFXLE9BQU87QUFDN0MsYUFBTyxNQUFNLE9BQU8sU0FBVSxLQUFLLEtBQUs7QUFDdEMsWUFBSSxPQUFPLFFBQVEsVUFBVTtBQUMzQixjQUFJLEtBQUssbUJBQW1CLEtBQUssSUFBSSxDQUFDO0FBQUEsUUFDNUMsV0FBZSxJQUFJLE1BQU07QUFDbkIsY0FBSSxLQUFLLG1CQUFtQixJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUM7QUFBQSxRQUNyRDtBQUVJLGVBQU87QUFBQSxNQUNYLEdBQUssRUFBRTtBQUFBLElBQ1A7QUFVQUEsY0FBQSxhQUFxQixTQUFTLFdBQVksTUFBTUQsVUFBUztBQUN2RCxZQUFNLE9BQU8sc0JBQXNCLE1BQU0sTUFBTSxtQkFBa0IsQ0FBRTtBQUVuRSxZQUFNLFFBQVEsV0FBVyxJQUFJO0FBQzdCLFlBQU0sUUFBUSxXQUFXLE9BQU9BLFFBQU87QUFDdkMsWUFBTSxPQUFPWSxVQUFTLFVBQVUsTUFBTSxLQUFLLFNBQVMsS0FBSztBQUV6RCxZQUFNLGdCQUFnQjtBQUN0QixlQUFTLElBQUksR0FBRyxJQUFJLEtBQUssU0FBUyxHQUFHLEtBQUs7QUFDeEMsc0JBQWMsS0FBSyxNQUFNLE1BQU0sS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJO0FBQUEsTUFDaEQ7QUFFRSxhQUFPWCxVQUFRLFVBQVUsY0FBYyxhQUFhLENBQUM7QUFBQSxJQUN2RDtBQVlBQSxjQUFBLFdBQW1CLFNBQVMsU0FBVSxNQUFNO0FBQzFDLGFBQU9BLFVBQVE7QUFBQSxRQUNiLHNCQUFzQixNQUFNLE1BQU0sbUJBQWtCLENBQUU7QUFBQSxNQUMxRDtBQUFBLElBQ0E7QUFBQTs7Ozs7OztBQ3pVQSxRQUFNLFFBQVFDLGVBQUE7QUFDZCxRQUFNLFVBQVVHLDRCQUFBO0FBQ2hCLFFBQU0sWUFBWUUsaUJBQUE7QUFDbEIsUUFBTSxZQUFZQyxpQkFBQTtBQUNsQixRQUFNLG1CQUFtQkMsd0JBQUE7QUFDekIsUUFBTSxnQkFBZ0JJLHFCQUFBO0FBQ3RCLFFBQU0sY0FBY0MsbUJBQUE7QUFDcEIsUUFBTSxTQUFTQywyQkFBQTtBQUNmLFFBQU0scUJBQXFCRSwwQkFBQTtBQUMzQixRQUFNLFVBQVVDLGVBQUE7QUFDaEIsUUFBTSxhQUFhQyxrQkFBQTtBQUNuQixRQUFNLE9BQU9DLFlBQUE7QUFDYixRQUFNLFdBQVdDLGdCQUFBO0FBa0NqQixXQUFTLG1CQUFvQixRQUFRckIsVUFBUztBQUM1QyxVQUFNLE9BQU8sT0FBTztBQUNwQixVQUFNLE1BQU0sY0FBYyxhQUFhQSxRQUFPO0FBRTlDLGFBQVMsSUFBSSxHQUFHLElBQUksSUFBSSxRQUFRLEtBQUs7QUFDbkMsWUFBTSxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDcEIsWUFBTSxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUM7QUFFcEIsZUFBUyxJQUFJLElBQUksS0FBSyxHQUFHLEtBQUs7QUFDNUIsWUFBSSxNQUFNLEtBQUssTUFBTSxRQUFRLE1BQU0sRUFBRztBQUV0QyxpQkFBUyxJQUFJLElBQUksS0FBSyxHQUFHLEtBQUs7QUFDNUIsY0FBSSxNQUFNLEtBQUssTUFBTSxRQUFRLE1BQU0sRUFBRztBQUV0QyxjQUFLLEtBQUssS0FBSyxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFDeEMsS0FBSyxLQUFLLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUN0QyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEdBQUk7QUFDeEMsbUJBQU8sSUFBSSxNQUFNLEdBQUcsTUFBTSxHQUFHLE1BQU0sSUFBSTtBQUFBLFVBQ2pELE9BQWU7QUFDTCxtQkFBTyxJQUFJLE1BQU0sR0FBRyxNQUFNLEdBQUcsT0FBTyxJQUFJO0FBQUEsVUFDbEQ7QUFBQSxRQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNBO0FBU0EsV0FBUyxtQkFBb0IsUUFBUTtBQUNuQyxVQUFNLE9BQU8sT0FBTztBQUVwQixhQUFTLElBQUksR0FBRyxJQUFJLE9BQU8sR0FBRyxLQUFLO0FBQ2pDLFlBQU0sUUFBUSxJQUFJLE1BQU07QUFDeEIsYUFBTyxJQUFJLEdBQUcsR0FBRyxPQUFPLElBQUk7QUFDNUIsYUFBTyxJQUFJLEdBQUcsR0FBRyxPQUFPLElBQUk7QUFBQSxJQUNoQztBQUFBLEVBQ0E7QUFVQSxXQUFTLHNCQUF1QixRQUFRQSxVQUFTO0FBQy9DLFVBQU0sTUFBTSxpQkFBaUIsYUFBYUEsUUFBTztBQUVqRCxhQUFTLElBQUksR0FBRyxJQUFJLElBQUksUUFBUSxLQUFLO0FBQ25DLFlBQU0sTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ3BCLFlBQU0sTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDO0FBRXBCLGVBQVMsSUFBSSxJQUFJLEtBQUssR0FBRyxLQUFLO0FBQzVCLGlCQUFTLElBQUksSUFBSSxLQUFLLEdBQUcsS0FBSztBQUM1QixjQUFJLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLE1BQU0sS0FDMUMsTUFBTSxLQUFLLE1BQU0sR0FBSTtBQUN0QixtQkFBTyxJQUFJLE1BQU0sR0FBRyxNQUFNLEdBQUcsTUFBTSxJQUFJO0FBQUEsVUFDakQsT0FBZTtBQUNMLG1CQUFPLElBQUksTUFBTSxHQUFHLE1BQU0sR0FBRyxPQUFPLElBQUk7QUFBQSxVQUNsRDtBQUFBLFFBQ0E7QUFBQSxNQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0E7QUFRQSxXQUFTLGlCQUFrQixRQUFRQSxVQUFTO0FBQzFDLFVBQU0sT0FBTyxPQUFPO0FBQ3BCLFVBQU0sT0FBTyxRQUFRLGVBQWVBLFFBQU87QUFDM0MsUUFBSSxLQUFLLEtBQUs7QUFFZCxhQUFTLElBQUksR0FBRyxJQUFJLElBQUksS0FBSztBQUMzQixZQUFNLEtBQUssTUFBTSxJQUFJLENBQUM7QUFDdEIsWUFBTSxJQUFJLElBQUksT0FBTyxJQUFJO0FBQ3pCLGFBQVEsUUFBUSxJQUFLLE9BQU87QUFFNUIsYUFBTyxJQUFJLEtBQUssS0FBSyxLQUFLLElBQUk7QUFDOUIsYUFBTyxJQUFJLEtBQUssS0FBSyxLQUFLLElBQUk7QUFBQSxJQUNsQztBQUFBLEVBQ0E7QUFTQSxXQUFTLGdCQUFpQixRQUFRSSx1QkFBc0JELGNBQWE7QUFDbkUsVUFBTSxPQUFPLE9BQU87QUFDcEIsVUFBTSxPQUFPLFdBQVcsZUFBZUMsdUJBQXNCRCxZQUFXO0FBQ3hFLFFBQUksR0FBRztBQUVQLFNBQUssSUFBSSxHQUFHLElBQUksSUFBSSxLQUFLO0FBQ3ZCLGFBQVEsUUFBUSxJQUFLLE9BQU87QUFHNUIsVUFBSSxJQUFJLEdBQUc7QUFDVCxlQUFPLElBQUksR0FBRyxHQUFHLEtBQUssSUFBSTtBQUFBLE1BQ2hDLFdBQWUsSUFBSSxHQUFHO0FBQ2hCLGVBQU8sSUFBSSxJQUFJLEdBQUcsR0FBRyxLQUFLLElBQUk7QUFBQSxNQUNwQyxPQUFXO0FBQ0wsZUFBTyxJQUFJLE9BQU8sS0FBSyxHQUFHLEdBQUcsS0FBSyxJQUFJO0FBQUEsTUFDNUM7QUFHSSxVQUFJLElBQUksR0FBRztBQUNULGVBQU8sSUFBSSxHQUFHLE9BQU8sSUFBSSxHQUFHLEtBQUssSUFBSTtBQUFBLE1BQzNDLFdBQWUsSUFBSSxHQUFHO0FBQ2hCLGVBQU8sSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxJQUFJO0FBQUEsTUFDN0MsT0FBVztBQUNMLGVBQU8sSUFBSSxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssSUFBSTtBQUFBLE1BQ3pDO0FBQUEsSUFDQTtBQUdFLFdBQU8sSUFBSSxPQUFPLEdBQUcsR0FBRyxHQUFHLElBQUk7QUFBQSxFQUNqQztBQVFBLFdBQVMsVUFBVyxRQUFRLE1BQU07QUFDaEMsVUFBTSxPQUFPLE9BQU87QUFDcEIsUUFBSSxNQUFNO0FBQ1YsUUFBSSxNQUFNLE9BQU87QUFDakIsUUFBSSxXQUFXO0FBQ2YsUUFBSSxZQUFZO0FBRWhCLGFBQVMsTUFBTSxPQUFPLEdBQUcsTUFBTSxHQUFHLE9BQU8sR0FBRztBQUMxQyxVQUFJLFFBQVEsRUFBRztBQUVmLGFBQU8sTUFBTTtBQUNYLGlCQUFTLElBQUksR0FBRyxJQUFJLEdBQUcsS0FBSztBQUMxQixjQUFJLENBQUMsT0FBTyxXQUFXLEtBQUssTUFBTSxDQUFDLEdBQUc7QUFDcEMsZ0JBQUksT0FBTztBQUVYLGdCQUFJLFlBQVksS0FBSyxRQUFRO0FBQzNCLHNCQUFVLEtBQUssU0FBUyxNQUFNLFdBQVksT0FBTztBQUFBLFlBQzdEO0FBRVUsbUJBQU8sSUFBSSxLQUFLLE1BQU0sR0FBRyxJQUFJO0FBQzdCO0FBRUEsZ0JBQUksYUFBYSxJQUFJO0FBQ25CO0FBQ0EseUJBQVc7QUFBQSxZQUN2QjtBQUFBLFVBQ0E7QUFBQSxRQUNBO0FBRU0sZUFBTztBQUVQLFlBQUksTUFBTSxLQUFLLFFBQVEsS0FBSztBQUMxQixpQkFBTztBQUNQLGdCQUFNLENBQUM7QUFDUDtBQUFBLFFBQ1I7QUFBQSxNQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0E7QUFVQSxXQUFTLFdBQVlILFVBQVNJLHVCQUFzQk0sV0FBVTtBQUU1RCxVQUFNLFNBQVMsSUFBSSxVQUFTO0FBRTVCLElBQUFBLFVBQVMsUUFBUSxTQUFVLE1BQU07QUFFL0IsYUFBTyxJQUFJLEtBQUssS0FBSyxLQUFLLENBQUM7QUFTM0IsYUFBTyxJQUFJLEtBQUssVUFBUyxHQUFJLEtBQUssc0JBQXNCLEtBQUssTUFBTVYsUUFBTyxDQUFDO0FBRzNFLFdBQUssTUFBTSxNQUFNO0FBQUEsSUFDckIsQ0FBRztBQUdELFVBQU0saUJBQWlCLE1BQU0sd0JBQXdCQSxRQUFPO0FBQzVELFVBQU0sbUJBQW1CLE9BQU8sdUJBQXVCQSxVQUFTSSxxQkFBb0I7QUFDcEYsVUFBTSwwQkFBMEIsaUJBQWlCLG9CQUFvQjtBQU9yRSxRQUFJLE9BQU8sb0JBQW9CLEtBQUssd0JBQXdCO0FBQzFELGFBQU8sSUFBSSxHQUFHLENBQUM7QUFBQSxJQUNuQjtBQU9FLFdBQU8sT0FBTyxvQkFBb0IsTUFBTSxHQUFHO0FBQ3pDLGFBQU8sT0FBTyxDQUFDO0FBQUEsSUFDbkI7QUFNRSxVQUFNLGlCQUFpQix5QkFBeUIsT0FBTyxnQkFBZSxLQUFNO0FBQzVFLGFBQVMsSUFBSSxHQUFHLElBQUksZUFBZSxLQUFLO0FBQ3RDLGFBQU8sSUFBSSxJQUFJLElBQUksS0FBTyxLQUFNLENBQUM7QUFBQSxJQUNyQztBQUVFLFdBQU8sZ0JBQWdCLFFBQVFKLFVBQVNJLHFCQUFvQjtBQUFBLEVBQzlEO0FBV0EsV0FBUyxnQkFBaUJPLFlBQVdYLFVBQVNJLHVCQUFzQjtBQUVsRSxVQUFNLGlCQUFpQixNQUFNLHdCQUF3QkosUUFBTztBQUc1RCxVQUFNLG1CQUFtQixPQUFPLHVCQUF1QkEsVUFBU0kscUJBQW9CO0FBR3BGLFVBQU0scUJBQXFCLGlCQUFpQjtBQUc1QyxVQUFNLGdCQUFnQixPQUFPLGVBQWVKLFVBQVNJLHFCQUFvQjtBQUd6RSxVQUFNLGlCQUFpQixpQkFBaUI7QUFDeEMsVUFBTSxpQkFBaUIsZ0JBQWdCO0FBRXZDLFVBQU0seUJBQXlCLEtBQUssTUFBTSxpQkFBaUIsYUFBYTtBQUV4RSxVQUFNLHdCQUF3QixLQUFLLE1BQU0scUJBQXFCLGFBQWE7QUFDM0UsVUFBTSx3QkFBd0Isd0JBQXdCO0FBR3RELFVBQU0sVUFBVSx5QkFBeUI7QUFHekMsVUFBTSxLQUFLLElBQUksbUJBQW1CLE9BQU87QUFFekMsUUFBSSxTQUFTO0FBQ2IsVUFBTSxTQUFTLElBQUksTUFBTSxhQUFhO0FBQ3RDLFVBQU0sU0FBUyxJQUFJLE1BQU0sYUFBYTtBQUN0QyxRQUFJLGNBQWM7QUFDbEIsVUFBTSxTQUFTLElBQUksV0FBV08sV0FBVSxNQUFNO0FBRzlDLGFBQVMsSUFBSSxHQUFHLElBQUksZUFBZSxLQUFLO0FBQ3RDLFlBQU0sV0FBVyxJQUFJLGlCQUFpQix3QkFBd0I7QUFHOUQsYUFBTyxDQUFDLElBQUksT0FBTyxNQUFNLFFBQVEsU0FBUyxRQUFRO0FBR2xELGFBQU8sQ0FBQyxJQUFJLEdBQUcsT0FBTyxPQUFPLENBQUMsQ0FBQztBQUUvQixnQkFBVTtBQUNWLG9CQUFjLEtBQUssSUFBSSxhQUFhLFFBQVE7QUFBQSxJQUNoRDtBQUlFLFVBQU0sT0FBTyxJQUFJLFdBQVcsY0FBYztBQUMxQyxRQUFJLFFBQVE7QUFDWixRQUFJLEdBQUc7QUFHUCxTQUFLLElBQUksR0FBRyxJQUFJLGFBQWEsS0FBSztBQUNoQyxXQUFLLElBQUksR0FBRyxJQUFJLGVBQWUsS0FBSztBQUNsQyxZQUFJLElBQUksT0FBTyxDQUFDLEVBQUUsUUFBUTtBQUN4QixlQUFLLE9BQU8sSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDO0FBQUEsUUFDbkM7QUFBQSxNQUNBO0FBQUEsSUFDQTtBQUdFLFNBQUssSUFBSSxHQUFHLElBQUksU0FBUyxLQUFLO0FBQzVCLFdBQUssSUFBSSxHQUFHLElBQUksZUFBZSxLQUFLO0FBQ2xDLGFBQUssT0FBTyxJQUFJLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFBQSxNQUNqQztBQUFBLElBQ0E7QUFFRSxXQUFPO0FBQUEsRUFDVDtBQVdBLFdBQVMsYUFBYyxNQUFNWCxVQUFTSSx1QkFBc0JELGNBQWE7QUFDdkUsUUFBSU87QUFFSixRQUFJLE1BQU0sUUFBUSxJQUFJLEdBQUc7QUFDdkIsTUFBQUEsWUFBVyxTQUFTLFVBQVUsSUFBSTtBQUFBLElBQ3RDLFdBQWEsT0FBTyxTQUFTLFVBQVU7QUFDbkMsVUFBSSxtQkFBbUJWO0FBRXZCLFVBQUksQ0FBQyxrQkFBa0I7QUFDckIsY0FBTSxjQUFjLFNBQVMsU0FBUyxJQUFJO0FBRzFDLDJCQUFtQixRQUFRLHNCQUFzQixhQUFhSSxxQkFBb0I7QUFBQSxNQUN4RjtBQUlJLE1BQUFNLFlBQVcsU0FBUyxXQUFXLE1BQU0sb0JBQW9CLEVBQUU7QUFBQSxJQUMvRCxPQUFTO0FBQ0wsWUFBTSxJQUFJLE1BQU0sY0FBYztBQUFBLElBQ2xDO0FBR0UsVUFBTSxjQUFjLFFBQVEsc0JBQXNCQSxXQUFVTixxQkFBb0I7QUFHaEYsUUFBSSxDQUFDLGFBQWE7QUFDaEIsWUFBTSxJQUFJLE1BQU0seURBQXlEO0FBQUEsSUFDN0U7QUFHRSxRQUFJLENBQUNKLFVBQVM7QUFDWixNQUFBQSxXQUFVO0FBQUEsSUFHZCxXQUFhQSxXQUFVLGFBQWE7QUFDaEMsWUFBTSxJQUFJO0FBQUEsUUFBTSwwSEFFMEMsY0FBYztBQUFBLE1BQzVFO0FBQUEsSUFDQTtBQUVFLFVBQU0sV0FBVyxXQUFXQSxVQUFTSSx1QkFBc0JNLFNBQVE7QUFHbkUsVUFBTSxjQUFjLE1BQU0sY0FBY1YsUUFBTztBQUMvQyxVQUFNLFVBQVUsSUFBSSxVQUFVLFdBQVc7QUFHekMsdUJBQW1CLFNBQVNBLFFBQU87QUFDbkMsdUJBQW1CLE9BQU87QUFDMUIsMEJBQXNCLFNBQVNBLFFBQU87QUFNdEMsb0JBQWdCLFNBQVNJLHVCQUFzQixDQUFDO0FBRWhELFFBQUlKLFlBQVcsR0FBRztBQUNoQix1QkFBaUIsU0FBU0EsUUFBTztBQUFBLElBQ3JDO0FBR0UsY0FBVSxTQUFTLFFBQVE7QUFFM0IsUUFBSSxNQUFNRyxZQUFXLEdBQUc7QUFFdEIsTUFBQUEsZUFBYyxZQUFZO0FBQUEsUUFBWTtBQUFBLFFBQ3BDLGdCQUFnQixLQUFLLE1BQU0sU0FBU0MscUJBQW9CO0FBQUEsTUFBQztBQUFBLElBQy9EO0FBR0UsZ0JBQVksVUFBVUQsY0FBYSxPQUFPO0FBRzFDLG9CQUFnQixTQUFTQyx1QkFBc0JELFlBQVc7QUFFMUQsV0FBTztBQUFBLE1BQ0w7QUFBQSxNQUNBLFNBQVNIO0FBQUEsTUFDVCxzQkFBc0JJO0FBQUEsTUFDdEIsYUFBYUQ7QUFBQSxNQUNiLFVBQVVPO0FBQUEsSUFDZDtBQUFBLEVBQ0E7QUFXQSxrQkFBaUIsU0FBUyxPQUFRLE1BQU0sU0FBUztBQUMvQyxRQUFJLE9BQU8sU0FBUyxlQUFlLFNBQVMsSUFBSTtBQUM5QyxZQUFNLElBQUksTUFBTSxlQUFlO0FBQUEsSUFDbkM7QUFFRSxRQUFJTix3QkFBdUIsUUFBUTtBQUNuQyxRQUFJSjtBQUNKLFFBQUk7QUFFSixRQUFJLE9BQU8sWUFBWSxhQUFhO0FBRWxDLE1BQUFJLHdCQUF1QixRQUFRLEtBQUssUUFBUSxzQkFBc0IsUUFBUSxDQUFDO0FBQzNFLE1BQUFKLFdBQVUsUUFBUSxLQUFLLFFBQVEsT0FBTztBQUN0QyxhQUFPLFlBQVksS0FBSyxRQUFRLFdBQVc7QUFFM0MsVUFBSSxRQUFRLFlBQVk7QUFDdEIsY0FBTSxrQkFBa0IsUUFBUSxVQUFVO0FBQUEsTUFDaEQ7QUFBQSxJQUNBO0FBRUUsV0FBTyxhQUFhLE1BQU1BLFVBQVNJLHVCQUFzQixJQUFJO0FBQUEsRUFDL0Q7Ozs7Ozs7Ozs7QUM5ZUEsYUFBUyxTQUFVLEtBQUs7QUFDdEIsVUFBSSxPQUFPLFFBQVEsVUFBVTtBQUMzQixjQUFNLElBQUksU0FBUTtBQUFBLE1BQ3RCO0FBRUUsVUFBSSxPQUFPLFFBQVEsVUFBVTtBQUMzQixjQUFNLElBQUksTUFBTSx1Q0FBdUM7QUFBQSxNQUMzRDtBQUVFLFVBQUksVUFBVSxJQUFJLE1BQUssRUFBRyxRQUFRLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRTtBQUNuRCxVQUFJLFFBQVEsU0FBUyxLQUFLLFFBQVEsV0FBVyxLQUFLLFFBQVEsU0FBUyxHQUFHO0FBQ3BFLGNBQU0sSUFBSSxNQUFNLHdCQUF3QixHQUFHO0FBQUEsTUFDL0M7QUFHRSxVQUFJLFFBQVEsV0FBVyxLQUFLLFFBQVEsV0FBVyxHQUFHO0FBQ2hELGtCQUFVLE1BQU0sVUFBVSxPQUFPLE1BQU0sSUFBSSxRQUFRLElBQUksU0FBVSxHQUFHO0FBQ2xFLGlCQUFPLENBQUMsR0FBRyxDQUFDO0FBQUEsUUFDbEIsQ0FBSyxDQUFDO0FBQUEsTUFDTjtBQUdFLFVBQUksUUFBUSxXQUFXLEVBQUcsU0FBUSxLQUFLLEtBQUssR0FBRztBQUUvQyxZQUFNLFdBQVcsU0FBUyxRQUFRLEtBQUssRUFBRSxHQUFHLEVBQUU7QUFFOUMsYUFBTztBQUFBLFFBQ0wsR0FBSSxZQUFZLEtBQU07QUFBQSxRQUN0QixHQUFJLFlBQVksS0FBTTtBQUFBLFFBQ3RCLEdBQUksWUFBWSxJQUFLO0FBQUEsUUFDckIsR0FBRyxXQUFXO0FBQUEsUUFDZCxLQUFLLE1BQU0sUUFBUSxNQUFNLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRTtBQUFBLE1BQzFDO0FBQUEsSUFDQTtBQUVBSCxjQUFBLGFBQXFCLFNBQVMsV0FBWSxTQUFTO0FBQ2pELFVBQUksQ0FBQyxRQUFTLFdBQVU7QUFDeEIsVUFBSSxDQUFDLFFBQVEsTUFBTyxTQUFRLFFBQVE7QUFFcEMsWUFBTSxTQUFTLE9BQU8sUUFBUSxXQUFXLGVBQ3ZDLFFBQVEsV0FBVyxRQUNuQixRQUFRLFNBQVMsSUFDZixJQUNBLFFBQVE7QUFFWixZQUFNLFFBQVEsUUFBUSxTQUFTLFFBQVEsU0FBUyxLQUFLLFFBQVEsUUFBUTtBQUNyRSxZQUFNLFFBQVEsUUFBUSxTQUFTO0FBRS9CLGFBQU87QUFBQSxRQUNMO0FBQUEsUUFDQSxPQUFPLFFBQVEsSUFBSTtBQUFBLFFBQ25CO0FBQUEsUUFDQSxPQUFPO0FBQUEsVUFDTCxNQUFNLFNBQVMsUUFBUSxNQUFNLFFBQVEsV0FBVztBQUFBLFVBQ2hELE9BQU8sU0FBUyxRQUFRLE1BQU0sU0FBUyxXQUFXO0FBQUE7UUFFcEQsTUFBTSxRQUFRO0FBQUEsUUFDZCxjQUFjLFFBQVEsZ0JBQWdCO0FBQUEsTUFDMUM7QUFBQSxJQUNBO0FBRUFBLGNBQUEsV0FBbUIsU0FBUyxTQUFVLFFBQVEsTUFBTTtBQUNsRCxhQUFPLEtBQUssU0FBUyxLQUFLLFNBQVMsU0FBUyxLQUFLLFNBQVMsSUFDdEQsS0FBSyxTQUFTLFNBQVMsS0FBSyxTQUFTLEtBQ3JDLEtBQUs7QUFBQSxJQUNYO0FBRUFBLGNBQUEsZ0JBQXdCLFNBQVMsY0FBZSxRQUFRLE1BQU07QUFDNUQsWUFBTSxRQUFRQSxVQUFRLFNBQVMsUUFBUSxJQUFJO0FBQzNDLGFBQU8sS0FBSyxPQUFPLFNBQVMsS0FBSyxTQUFTLEtBQUssS0FBSztBQUFBLElBQ3REO0FBRUFBLGNBQUEsZ0JBQXdCLFNBQVMsY0FBZSxTQUFTLElBQUksTUFBTTtBQUNqRSxZQUFNLE9BQU8sR0FBRyxRQUFRO0FBQ3hCLFlBQU0sT0FBTyxHQUFHLFFBQVE7QUFDeEIsWUFBTSxRQUFRQSxVQUFRLFNBQVMsTUFBTSxJQUFJO0FBQ3pDLFlBQU0sYUFBYSxLQUFLLE9BQU8sT0FBTyxLQUFLLFNBQVMsS0FBSyxLQUFLO0FBQzlELFlBQU0sZUFBZSxLQUFLLFNBQVM7QUFDbkMsWUFBTSxVQUFVLENBQUMsS0FBSyxNQUFNLE9BQU8sS0FBSyxNQUFNLElBQUk7QUFFbEQsZUFBUyxJQUFJLEdBQUcsSUFBSSxZQUFZLEtBQUs7QUFDbkMsaUJBQVMsSUFBSSxHQUFHLElBQUksWUFBWSxLQUFLO0FBQ25DLGNBQUksVUFBVSxJQUFJLGFBQWEsS0FBSztBQUNwQyxjQUFJLFVBQVUsS0FBSyxNQUFNO0FBRXpCLGNBQUksS0FBSyxnQkFBZ0IsS0FBSyxnQkFDNUIsSUFBSSxhQUFhLGdCQUFnQixJQUFJLGFBQWEsY0FBYztBQUNoRSxrQkFBTSxPQUFPLEtBQUssT0FBTyxJQUFJLGdCQUFnQixLQUFLO0FBQ2xELGtCQUFNLE9BQU8sS0FBSyxPQUFPLElBQUksZ0JBQWdCLEtBQUs7QUFDbEQsc0JBQVUsUUFBUSxLQUFLLE9BQU8sT0FBTyxJQUFJLElBQUksSUFBSSxDQUFDO0FBQUEsVUFDMUQ7QUFFTSxrQkFBUSxRQUFRLElBQUksUUFBUTtBQUM1QixrQkFBUSxRQUFRLElBQUksUUFBUTtBQUM1QixrQkFBUSxRQUFRLElBQUksUUFBUTtBQUM1QixrQkFBUSxNQUFNLElBQUksUUFBUTtBQUFBLFFBQ2hDO0FBQUEsTUFDQTtBQUFBLElBQ0E7QUFBQTs7Ozs7Ozs7QUNsR0EsVUFBTSxRQUFRQyxhQUFBO0FBRWQsYUFBUyxZQUFhLEtBQUtvQixTQUFRLE1BQU07QUFDdkMsVUFBSSxVQUFVLEdBQUcsR0FBR0EsUUFBTyxPQUFPQSxRQUFPLE1BQU07QUFFL0MsVUFBSSxDQUFDQSxRQUFPLE1BQU8sQ0FBQUEsUUFBTyxRQUFRO0FBQ2xDLE1BQUFBLFFBQU8sU0FBUztBQUNoQixNQUFBQSxRQUFPLFFBQVE7QUFDZixNQUFBQSxRQUFPLE1BQU0sU0FBUyxPQUFPO0FBQzdCLE1BQUFBLFFBQU8sTUFBTSxRQUFRLE9BQU87QUFBQSxJQUM5QjtBQUVBLGFBQVMsbUJBQW9CO0FBQzNCLFVBQUk7QUFDRixlQUFPLFNBQVMsY0FBYyxRQUFRO0FBQUEsTUFDMUMsU0FBVyxHQUFHO0FBQ1YsY0FBTSxJQUFJLE1BQU0sc0NBQXNDO0FBQUEsTUFDMUQ7QUFBQSxJQUNBO0FBRUFyQixjQUFBLFNBQWlCLFNBQVMsT0FBUSxRQUFRcUIsU0FBUSxTQUFTO0FBQ3pELFVBQUksT0FBTztBQUNYLFVBQUksV0FBV0E7QUFFZixVQUFJLE9BQU8sU0FBUyxnQkFBZ0IsQ0FBQ0EsV0FBVSxDQUFDQSxRQUFPLGFBQWE7QUFDbEUsZUFBT0E7QUFDUCxRQUFBQSxVQUFTO0FBQUEsTUFDYjtBQUVFLFVBQUksQ0FBQ0EsU0FBUTtBQUNYLG1CQUFXLGlCQUFnQjtBQUFBLE1BQy9CO0FBRUUsYUFBTyxNQUFNLFdBQVcsSUFBSTtBQUM1QixZQUFNLE9BQU8sTUFBTSxjQUFjLE9BQU8sUUFBUSxNQUFNLElBQUk7QUFFMUQsWUFBTSxNQUFNLFNBQVMsV0FBVyxJQUFJO0FBQ3BDLFlBQU0sUUFBUSxJQUFJLGdCQUFnQixNQUFNLElBQUk7QUFDNUMsWUFBTSxjQUFjLE1BQU0sTUFBTSxRQUFRLElBQUk7QUFFNUMsa0JBQVksS0FBSyxVQUFVLElBQUk7QUFDL0IsVUFBSSxhQUFhLE9BQU8sR0FBRyxDQUFDO0FBRTVCLGFBQU87QUFBQSxJQUNUO0FBRUFyQixjQUFBLGtCQUEwQixTQUFTLGdCQUFpQixRQUFRcUIsU0FBUSxTQUFTO0FBQzNFLFVBQUksT0FBTztBQUVYLFVBQUksT0FBTyxTQUFTLGdCQUFnQixDQUFDQSxXQUFVLENBQUNBLFFBQU8sYUFBYTtBQUNsRSxlQUFPQTtBQUNQLFFBQUFBLFVBQVM7QUFBQSxNQUNiO0FBRUUsVUFBSSxDQUFDLEtBQU0sUUFBTztBQUVsQixZQUFNLFdBQVdyQixVQUFRLE9BQU8sUUFBUXFCLFNBQVEsSUFBSTtBQUVwRCxZQUFNLE9BQU8sS0FBSyxRQUFRO0FBQzFCLFlBQU0sZUFBZSxLQUFLLGdCQUFnQjtBQUUxQyxhQUFPLFNBQVMsVUFBVSxNQUFNLGFBQWEsT0FBTztBQUFBLElBQ3REO0FBQUE7Ozs7Ozs7O0FDOURBLFFBQU0sUUFBUXBCLGFBQUE7QUFFZCxXQUFTLGVBQWdCLE9BQU8sUUFBUTtBQUN0QyxVQUFNLFFBQVEsTUFBTSxJQUFJO0FBQ3hCLFVBQU0sTUFBTSxTQUFTLE9BQU8sTUFBTSxNQUFNO0FBRXhDLFdBQU8sUUFBUSxJQUNYLE1BQU0sTUFBTSxTQUFTLGVBQWUsTUFBTSxRQUFRLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxNQUNoRTtBQUFBLEVBQ047QUFFQSxXQUFTLE9BQVEsS0FBSyxHQUFHLEdBQUc7QUFDMUIsUUFBSSxNQUFNLE1BQU07QUFDaEIsUUFBSSxPQUFPLE1BQU0sWUFBYSxRQUFPLE1BQU07QUFFM0MsV0FBTztBQUFBLEVBQ1Q7QUFFQSxXQUFTLFNBQVUsTUFBTSxNQUFNLFFBQVE7QUFDckMsUUFBSSxPQUFPO0FBQ1gsUUFBSSxTQUFTO0FBQ2IsUUFBSSxTQUFTO0FBQ2IsUUFBSSxhQUFhO0FBRWpCLGFBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxRQUFRLEtBQUs7QUFDcEMsWUFBTSxNQUFNLEtBQUssTUFBTSxJQUFJLElBQUk7QUFDL0IsWUFBTSxNQUFNLEtBQUssTUFBTSxJQUFJLElBQUk7QUFFL0IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFRLFVBQVM7QUFFOUIsVUFBSSxLQUFLLENBQUMsR0FBRztBQUNYO0FBRUEsWUFBSSxFQUFFLElBQUksS0FBSyxNQUFNLEtBQUssS0FBSyxJQUFJLENBQUMsSUFBSTtBQUN0QyxrQkFBUSxTQUNKLE9BQU8sS0FBSyxNQUFNLFFBQVEsTUFBTSxNQUFNLE1BQU0sSUFDNUMsT0FBTyxLQUFLLFFBQVEsQ0FBQztBQUV6QixtQkFBUztBQUNULG1CQUFTO0FBQUEsUUFDakI7QUFFTSxZQUFJLEVBQUUsTUFBTSxJQUFJLFFBQVEsS0FBSyxJQUFJLENBQUMsSUFBSTtBQUNwQyxrQkFBUSxPQUFPLEtBQUssVUFBVTtBQUM5Qix1QkFBYTtBQUFBLFFBQ3JCO0FBQUEsTUFDQSxPQUFXO0FBQ0w7QUFBQSxNQUNOO0FBQUEsSUFDQTtBQUVFLFdBQU87QUFBQSxFQUNUO0FBRUEsa0JBQWlCLFNBQVMsT0FBUSxRQUFRLFNBQVMsSUFBSTtBQUNyRCxVQUFNLE9BQU8sTUFBTSxXQUFXLE9BQU87QUFDckMsVUFBTSxPQUFPLE9BQU8sUUFBUTtBQUM1QixVQUFNLE9BQU8sT0FBTyxRQUFRO0FBQzVCLFVBQU0sYUFBYSxPQUFPLEtBQUssU0FBUztBQUV4QyxVQUFNLEtBQUssQ0FBQyxLQUFLLE1BQU0sTUFBTSxJQUN6QixLQUNBLFdBQVcsZUFBZSxLQUFLLE1BQU0sT0FBTyxNQUFNLElBQ2xELGNBQWMsYUFBYSxNQUFNLGFBQWE7QUFFbEQsVUFBTSxPQUNKLFdBQVcsZUFBZSxLQUFLLE1BQU0sTUFBTSxRQUFRLElBQ25ELFNBQVMsU0FBUyxNQUFNLE1BQU0sS0FBSyxNQUFNLElBQUk7QUFFL0MsVUFBTSxVQUFVLGtCQUF1QixhQUFhLE1BQU0sYUFBYTtBQUV2RSxVQUFNLFFBQVEsQ0FBQyxLQUFLLFFBQVEsS0FBSyxZQUFZLEtBQUssUUFBUSxlQUFlLEtBQUssUUFBUTtBQUV0RixVQUFNcUIsVUFBUyw2Q0FBNkMsUUFBUSxVQUFVLG1DQUFtQyxLQUFLLE9BQU87QUFFN0gsUUFBSSxPQUFPLE9BQU8sWUFBWTtBQUM1QixTQUFHLE1BQU1BLE9BQU07QUFBQSxJQUNuQjtBQUVFLFdBQU9BO0FBQUEsRUFDVDs7Ozs7OztBQy9FQSxRQUFNQyxjQUFhdEIsa0JBQUE7QUFFbkIsUUFBTXVCLFVBQVNwQixjQUFBO0FBQ2YsUUFBTSxpQkFBaUJFLGNBQUE7QUFDdkIsUUFBTSxjQUFjQyxjQUFBO0FBRXBCLFdBQVMsYUFBYyxZQUFZYyxTQUFRLE1BQU0sTUFBTSxJQUFJO0FBQ3pELFVBQU0sT0FBTyxHQUFHLE1BQU0sS0FBSyxXQUFXLENBQUM7QUFDdkMsVUFBTSxVQUFVLEtBQUs7QUFDckIsVUFBTSxjQUFjLE9BQU8sS0FBSyxVQUFVLENBQUMsTUFBTTtBQUVqRCxRQUFJLENBQUMsZUFBZSxDQUFDRSxlQUFjO0FBQ2pDLFlBQU0sSUFBSSxNQUFNLG9DQUFvQztBQUFBLElBQ3hEO0FBRUUsUUFBSSxhQUFhO0FBQ2YsVUFBSSxVQUFVLEdBQUc7QUFDZixjQUFNLElBQUksTUFBTSw0QkFBNEI7QUFBQSxNQUNsRDtBQUVJLFVBQUksWUFBWSxHQUFHO0FBQ2pCLGFBQUs7QUFDTCxlQUFPRjtBQUNQLFFBQUFBLFVBQVMsT0FBTztBQUFBLE1BQ3RCLFdBQWUsWUFBWSxHQUFHO0FBQ3hCLFlBQUlBLFFBQU8sY0FBYyxPQUFPLE9BQU8sYUFBYTtBQUNsRCxlQUFLO0FBQ0wsaUJBQU87QUFBQSxRQUNmLE9BQWE7QUFDTCxlQUFLO0FBQ0wsaUJBQU87QUFDUCxpQkFBT0E7QUFDUCxVQUFBQSxVQUFTO0FBQUEsUUFDakI7QUFBQSxNQUNBO0FBQUEsSUFDQSxPQUFTO0FBQ0wsVUFBSSxVQUFVLEdBQUc7QUFDZixjQUFNLElBQUksTUFBTSw0QkFBNEI7QUFBQSxNQUNsRDtBQUVJLFVBQUksWUFBWSxHQUFHO0FBQ2pCLGVBQU9BO0FBQ1AsUUFBQUEsVUFBUyxPQUFPO0FBQUEsTUFDdEIsV0FBZSxZQUFZLEtBQUssQ0FBQ0EsUUFBTyxZQUFZO0FBQzlDLGVBQU87QUFDUCxlQUFPQTtBQUNQLFFBQUFBLFVBQVM7QUFBQSxNQUNmO0FBRUksYUFBTyxJQUFJLFFBQVEsU0FBVSxTQUFTLFFBQVE7QUFDNUMsWUFBSTtBQUNGLGdCQUFNLE9BQU9HLFFBQU8sT0FBTyxNQUFNLElBQUk7QUFDckMsa0JBQVEsV0FBVyxNQUFNSCxTQUFRLElBQUksQ0FBQztBQUFBLFFBQzlDLFNBQWUsR0FBRztBQUNWLGlCQUFPLENBQUM7QUFBQSxRQUNoQjtBQUFBLE1BQ0EsQ0FBSztBQUFBLElBQ0w7QUFFRSxRQUFJO0FBQ0YsWUFBTSxPQUFPRyxRQUFPLE9BQU8sTUFBTSxJQUFJO0FBQ3JDLFNBQUcsTUFBTSxXQUFXLE1BQU1ILFNBQVEsSUFBSSxDQUFDO0FBQUEsSUFDM0MsU0FBVyxHQUFHO0FBQ1YsU0FBRyxDQUFDO0FBQUEsSUFDUjtBQUFBLEVBQ0E7QUFFQSxtQkFBaUJHLFFBQU87QUFDeEIscUJBQW1CLGFBQWEsS0FBSyxNQUFNLGVBQWUsTUFBTTtBQUNoRSxzQkFBb0IsYUFBYSxLQUFLLE1BQU0sZUFBZSxlQUFlO0FBRzFFLHFCQUFtQixhQUFhLEtBQUssTUFBTSxTQUFVLE1BQU0sR0FBRyxNQUFNO0FBQ2xFLFdBQU8sWUFBWSxPQUFPLE1BQU0sSUFBSTtBQUFBLEVBQ3RDLENBQUM7Ozs7O0FDakVELE1BQU0sWUFBWTtBQUFBO0FBQUEsRUFFaEI7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUE7QUFBQSxFQUdBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUE7QUFBQSxFQUdBO0FBQUEsRUFDQTtBQUNGO0FBUU8sZUFBZSxpQkFBaUIsU0FBUyxjQUFjO0FBQzVELFFBQU0sV0FBVyxNQUFNLFlBQVksT0FBTztBQUMxQyxTQUFPLElBQUlDLFNBQWdCLGNBQWMsV0FBVyxRQUFRO0FBQzlEO0FBUU8sZUFBZSxpQkFBaUIsU0FBUyxjQUFjO0FBQzVELE1BQUk7QUFDRixVQUFNLFdBQVcsTUFBTSxpQkFBaUIsU0FBUyxZQUFZO0FBRTdELFVBQU0sQ0FBQyxNQUFNLFFBQVEsUUFBUSxJQUFJLE1BQU0sUUFBUSxJQUFJO0FBQUEsTUFDakQsU0FBUyxLQUFJO0FBQUEsTUFDYixTQUFTLE9BQU07QUFBQSxNQUNmLFNBQVMsU0FBUTtBQUFBLElBQ3ZCLENBQUs7QUFFRCxXQUFPLEVBQUUsTUFBTSxRQUFRLFVBQVUsT0FBTyxRQUFRO0VBQ2xELFNBQVMsT0FBTztBQUNkLFVBQU0sSUFBSSxNQUFNLG1DQUFtQyxNQUFNLE9BQU8sRUFBRTtBQUFBLEVBQ3BFO0FBQ0Y7QUFTTyxlQUFlLGdCQUFnQixTQUFTLGNBQWMsZ0JBQWdCO0FBQzNFLE1BQUk7QUFDRixVQUFNLFdBQVcsTUFBTSxpQkFBaUIsU0FBUyxZQUFZO0FBQzdELFVBQU0sVUFBVSxNQUFNLFNBQVMsVUFBVSxjQUFjO0FBQ3ZELFdBQU8sUUFBUTtFQUNqQixTQUFTLE9BQU87QUFDZCxVQUFNLElBQUksTUFBTSxnQ0FBZ0MsTUFBTSxPQUFPLEVBQUU7QUFBQSxFQUNqRTtBQUNGO0FBU08sU0FBUyxtQkFBbUIsWUFBWSxVQUFVLGtCQUFrQixHQUFHO0FBQzVFLE1BQUk7QUFDRixVQUFNLFVBQVVDLFlBQW1CLFlBQVksUUFBUTtBQUN2RCxVQUFNLE1BQU0sV0FBVyxPQUFPO0FBQzlCLFdBQU8sSUFBSSxRQUFRLGVBQWU7QUFBQSxFQUNwQyxTQUFTLE9BQU87QUFDZCxXQUFPO0FBQUEsRUFDVDtBQUNGO0FBUU8sU0FBUyxpQkFBaUIsUUFBUSxVQUFVO0FBQ2pELFNBQU9DLFdBQWtCLFFBQVEsUUFBUSxFQUFFLFNBQVE7QUFDckQ7QUEwQk8sZUFBZSxzQkFBc0IsU0FBUyxjQUFjO0FBQ2pFLE1BQUk7QUFFRixRQUFJLENBQUNDLFVBQWlCLFlBQVksR0FBRztBQUNuQyxhQUFPO0FBQUEsSUFDVDtBQUdBLFVBQU0saUJBQWlCLFNBQVMsWUFBWTtBQUM1QyxXQUFPO0FBQUEsRUFDVCxTQUFTLE9BQU87QUFDZCxXQUFPO0FBQUEsRUFDVDtBQUNGO0FDcklBLE1BQU0seUJBQXlCO0FBR3hCLE1BQU0saUJBQWlCO0FBQUEsRUFDNUIsWUFBWTtBQUFBLElBQ1YsT0FBTztBQUFBLE1BQ0wsTUFBTTtBQUFBLE1BQ04sUUFBUTtBQUFBLE1BQ1IsU0FBUztBQUFBLE1BQ1QsVUFBVTtBQUFBLE1BQ1YsTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLE1BQ1QsZ0JBQWdCO0FBQUEsSUFDdEI7QUFBQSxJQUNJLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxNQUNULFVBQVU7QUFBQSxNQUNWLE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQSxNQUNULGdCQUFnQjtBQUFBLElBQ3RCO0FBQUEsSUFDSSxPQUFPO0FBQUEsTUFDTCxNQUFNO0FBQUEsTUFDTixRQUFRO0FBQUEsTUFDUixTQUFTO0FBQUEsTUFDVCxVQUFVO0FBQUEsTUFDVixNQUFNO0FBQUEsTUFDTixTQUFTO0FBQUEsTUFDVCxnQkFBZ0I7QUFBQSxJQUN0QjtBQUFBLElBQ0ksVUFBVTtBQUFBLE1BQ1IsTUFBTTtBQUFBLE1BQ04sUUFBUTtBQUFBLE1BQ1IsU0FBUztBQUFBLE1BQ1QsVUFBVTtBQUFBLE1BQ1YsTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLE1BQ1QsZ0JBQWdCO0FBQUEsSUFDdEI7QUFBQSxJQUNJLE9BQU87QUFBQSxNQUNMLE1BQU07QUFBQSxNQUNOLFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxNQUNULFVBQVU7QUFBQSxNQUNWLE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQSxNQUNULGdCQUFnQjtBQUFBLElBQ3RCO0FBQUEsSUFDSSxPQUFPO0FBQUEsTUFDTCxNQUFNO0FBQUEsTUFDTixRQUFRO0FBQUEsTUFDUixTQUFTO0FBQUEsTUFDVCxVQUFVO0FBQUEsTUFDVixNQUFNO0FBQUEsTUFDTixTQUFTO0FBQUEsTUFDVCxnQkFBZ0I7QUFBQSxJQUN0QjtBQUFBLElBQ0ksUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sUUFBUTtBQUFBLE1BQ1IsU0FBUztBQUFBLE1BQ1QsVUFBVTtBQUFBLE1BQ1YsTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLE1BQ1QsZ0JBQWdCO0FBQUEsSUFDdEI7QUFBQSxJQUNJLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxNQUNULFVBQVU7QUFBQSxNQUNWLE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQSxNQUNULGdCQUFnQjtBQUFBLElBQ3RCO0FBQUEsRUFDQTtBQUFBLEVBQ0UsbUJBQW1CO0FBQUEsSUFDakIsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sUUFBUTtBQUFBLE1BQ1IsU0FBUztBQUFBLE1BQ1QsVUFBVTtBQUFBLE1BQ1YsTUFBTTtBQUFBLElBQ1o7QUFBQSxFQUNBO0FBQUEsRUFDRSxVQUFVO0FBQUEsSUFDUixPQUFPO0FBQUEsTUFDTCxNQUFNO0FBQUEsTUFDTixRQUFRO0FBQUEsTUFDUixTQUFTO0FBQUEsTUFDVCxVQUFVO0FBQUEsTUFDVixNQUFNO0FBQUEsTUFDTixTQUFTO0FBQUEsTUFDVCxnQkFBZ0I7QUFBQSxJQUN0QjtBQUFBLEVBQ0E7QUFBQSxFQUNFLFNBQVM7QUFDWDtBQU9BLFNBQVMsY0FBYyxTQUFTO0FBQzlCLFNBQU8saUJBQWlCLE9BQU87QUFDakM7QUFPQSxTQUFTLG9CQUFvQixTQUFTO0FBQ3BDLFNBQU8sMEJBQTBCLE9BQU87QUFDMUM7QUFPTyxlQUFlLGdCQUFnQixTQUFTO0FBQzdDLFFBQU0sTUFBTSxjQUFjLE9BQU87QUFDakMsUUFBTSxTQUFTLE1BQU0sS0FBSyxHQUFHO0FBQzdCLFNBQU8sVUFBVTtBQUNuQjtBQU9PLGVBQWUsd0JBQXdCLFNBQVM7QUFDckQsUUFBTSxNQUFNLG9CQUFvQixPQUFPO0FBQ3ZDLFFBQU0sVUFBVSxNQUFNLEtBQUssR0FBRztBQUU5QixNQUFJLENBQUMsU0FBUztBQUNaLFdBQU8sT0FBTyxLQUFLLGVBQWUsT0FBTyxLQUFLLEVBQUU7QUFBQSxFQUNsRDtBQUNBLFNBQU87QUFDVDtBQU9PLGVBQWUsYUFBYSxTQUFTO0FBQzFDLFFBQU0sZUFBZSxNQUFNLGdCQUFnQixPQUFPO0FBQ2xELFFBQU0sa0JBQWtCLE1BQU0sd0JBQXdCLE9BQU87QUFFN0QsUUFBTSxnQkFBZ0I7QUFDdEIsUUFBTSxrQkFBa0IsZUFBZSxPQUFPLEtBQUs7QUFFbkQsYUFBVyxVQUFVLGlCQUFpQjtBQUNwQyxRQUFJLGdCQUFnQixNQUFNLEdBQUc7QUFDM0Isb0JBQWMsS0FBSztBQUFBLFFBQ2pCLEdBQUcsZ0JBQWdCLE1BQU07QUFBQSxRQUN6QixXQUFXO0FBQUEsTUFDbkIsQ0FBTztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBRUEsU0FBTyxDQUFDLEdBQUcsZUFBZSxHQUFHLFlBQVk7QUFDM0M7QUFTTyxlQUFlLGVBQWUsU0FBUyxjQUFjO0FBRTFELGlCQUFlLGFBQWE7QUFDNUIsTUFBSSxDQUFDLGFBQWEsV0FBVyxJQUFJLEtBQUssYUFBYSxXQUFXLElBQUk7QUFDaEUsVUFBTSxJQUFJLE1BQU0sOEJBQThCO0FBQUEsRUFDaEQ7QUFHQSxRQUFNLGtCQUFrQixlQUFlLE9BQU8sS0FBSztBQUNuRCxhQUFXLFVBQVUsaUJBQWlCO0FBQ3BDLFFBQUksZ0JBQWdCLE1BQU0sRUFBRSxRQUFRLGtCQUFrQixhQUFhLGVBQWU7QUFDaEYsWUFBTSxJQUFJLE1BQU0sNEJBQTRCLE1BQU0seUNBQXlDO0FBQUEsSUFDN0Y7QUFBQSxFQUNGO0FBR0EsUUFBTSxlQUFlLE1BQU0sZ0JBQWdCLE9BQU87QUFHbEQsTUFBSSxhQUFhLFVBQVUsd0JBQXdCO0FBQ2pELFVBQU0sSUFBSSxNQUFNLFdBQVcsc0JBQXNCLDRCQUE0QjtBQUFBLEVBQy9FO0FBR0EsUUFBTSxTQUFTLGFBQWE7QUFBQSxJQUMxQixPQUFLLEVBQUUsUUFBUSxZQUFXLE1BQU8sYUFBYSxZQUFXO0FBQUEsRUFDN0Q7QUFDRSxNQUFJLFFBQVE7QUFDVixVQUFNLElBQUksTUFBTSxxQkFBcUI7QUFBQSxFQUN2QztBQUdBLFFBQU0sVUFBVSxNQUFNLHNCQUFzQixTQUFTLFlBQVk7QUFDakUsTUFBSSxDQUFDLFNBQVM7QUFDWixVQUFNLElBQUksTUFBTSwrQkFBK0I7QUFBQSxFQUNqRDtBQUVBLFFBQU0sV0FBVyxNQUFNLGlCQUFpQixTQUFTLFlBQVk7QUFHN0QsUUFBTSxRQUFRO0FBQUEsSUFDWixTQUFTO0FBQUEsSUFDVCxNQUFNLFNBQVM7QUFBQSxJQUNmLFFBQVEsU0FBUztBQUFBLElBQ2pCLFVBQVUsU0FBUztBQUFBLElBQ25CLE1BQU07QUFBQSxJQUNOLFdBQVc7QUFBQSxJQUNYLFNBQVMsS0FBSyxJQUFHO0FBQUEsRUFDckI7QUFHRSxlQUFhLEtBQUssS0FBSztBQUd2QixRQUFNLE1BQU0sY0FBYyxPQUFPO0FBQ2pDLFFBQU0sS0FBSyxLQUFLLFlBQVk7QUFFNUIsU0FBTztBQUNUO0FBUU8sZUFBZSxrQkFBa0IsU0FBUyxjQUFjO0FBQzdELFFBQU0sZUFBZSxNQUFNLGdCQUFnQixPQUFPO0FBRWxELFFBQU0sV0FBVyxhQUFhO0FBQUEsSUFDNUIsT0FBSyxFQUFFLFFBQVEsWUFBVyxNQUFPLGFBQWEsWUFBVztBQUFBLEVBQzdEO0FBRUUsUUFBTSxNQUFNLGNBQWMsT0FBTztBQUNqQyxRQUFNLEtBQUssS0FBSyxRQUFRO0FBQzFCO0FBU08sZUFBZSxtQkFBbUIsU0FBUyxRQUFRLFNBQVM7QUFDakUsUUFBTSxnQkFBZ0IsTUFBTSx3QkFBd0IsT0FBTztBQUUzRCxNQUFJO0FBQ0osTUFBSSxTQUFTO0FBRVgsUUFBSSxDQUFDLGNBQWMsU0FBUyxNQUFNLEdBQUc7QUFDbkMsZ0JBQVUsQ0FBQyxHQUFHLGVBQWUsTUFBTTtBQUFBLElBQ3JDLE9BQU87QUFDTDtBQUFBLElBQ0Y7QUFBQSxFQUNGLE9BQU87QUFFTCxjQUFVLGNBQWMsT0FBTyxPQUFLLE1BQU0sTUFBTTtBQUFBLEVBQ2xEO0FBRUEsUUFBTSxNQUFNLG9CQUFvQixPQUFPO0FBQ3ZDLFFBQU0sS0FBSyxLQUFLLE9BQU87QUFDekI7QUNqUkEsTUFBTSx1QkFBdUI7QUFDN0IsTUFBTSxZQUFZLElBQUksS0FBSyxLQUFLLEtBQUs7QUFHckMsTUFBTSxtQkFBbUI7QUFBQSxFQUN2QixjQUFjLEVBQUUsTUFBTSxXQUFXLGFBQWEsMEJBQTBCLFVBQVUsUUFBTztBQUFBLEVBQ3pGLGNBQWMsRUFBRSxNQUFNLFlBQVksYUFBYSxtQkFBbUIsVUFBVSxRQUFPO0FBQUEsRUFDbkYsY0FBYyxFQUFFLE1BQU0sZ0JBQWdCLGFBQWEsZ0NBQWdDLFVBQVUsUUFBTztBQUFBLEVBQ3BHLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixhQUFhLGdDQUFnQyxVQUFVLE1BQUs7QUFBQSxFQUM5RyxjQUFjLEVBQUUsTUFBTSx5QkFBeUIsYUFBYSw2QkFBNkIsVUFBVSxNQUFLO0FBQUEsRUFDeEcsY0FBYyxFQUFFLE1BQU0seUJBQXlCLGFBQWEsNkJBQTZCLFVBQVUsTUFBSztBQUFBLEVBQ3hHLGNBQWMsRUFBRSxNQUFNLHlCQUF5QixhQUFhLDZCQUE2QixVQUFVLE1BQUs7QUFBQSxFQUN4RyxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsYUFBYSxnQ0FBZ0MsVUFBVSxNQUFLO0FBQUEsRUFDOUcsY0FBYyxFQUFFLE1BQU0sUUFBUSxhQUFhLGVBQWUsVUFBVSxRQUFPO0FBQUEsRUFDM0UsY0FBYyxFQUFFLE1BQU0sUUFBUSxhQUFhLGVBQWUsVUFBVSxRQUFPO0FBQUEsRUFDM0UsY0FBYyxFQUFFLE1BQU0sU0FBUyxhQUFhLGdCQUFnQixVQUFVLE9BQU07QUFBQSxFQUM1RSxjQUFjLEVBQUUsTUFBTSxZQUFZLGFBQWEsbUJBQW1CLFVBQVUsT0FBTTtBQUFBLEVBQ2xGLGNBQWMsRUFBRSxNQUFNLFdBQVcsYUFBYSxrQkFBa0IsVUFBVSxPQUFNO0FBQUEsRUFDaEYsY0FBYyxFQUFFLE1BQU0sWUFBWSxhQUFhLFlBQVksVUFBVSxPQUFNO0FBQzdFO0FBR0EsTUFBTSxnQkFBZ0I7QUFBQSxFQUNwQixLQUFLO0FBQUEsRUFDTCxLQUFLO0FBQUEsRUFDTCxHQUFHO0FBQUEsRUFDSCxVQUFVO0FBQ1o7QUFLQSxTQUFTLGFBQWEsU0FBUyxTQUFTO0FBQ3RDLE1BQUk7QUFDRixVQUFNLE1BQU0sR0FBRyxvQkFBb0IsR0FBRyxPQUFPLElBQUksUUFBUSxZQUFXLENBQUU7QUFDdEUsVUFBTSxTQUFTLGFBQWEsUUFBUSxHQUFHO0FBRXZDLFFBQUksQ0FBQyxPQUFRLFFBQU87QUFFcEIsVUFBTSxPQUFPLEtBQUssTUFBTSxNQUFNO0FBRzlCLFFBQUksS0FBSyxJQUFHLElBQUssS0FBSyxZQUFZLFdBQVc7QUFDM0MsbUJBQWEsV0FBVyxHQUFHO0FBQzNCLGFBQU87QUFBQSxJQUNUO0FBRUEsV0FBTyxLQUFLO0FBQUEsRUFDZCxTQUFTLE9BQU87QUFDZCxZQUFRLE1BQU0sNEJBQTRCLEtBQUs7QUFDL0MsV0FBTztBQUFBLEVBQ1Q7QUFDRjtBQUtBLFNBQVMsU0FBUyxTQUFTLFNBQVMsS0FBSyxRQUFRO0FBQy9DLE1BQUk7QUFDRixVQUFNLE1BQU0sR0FBRyxvQkFBb0IsR0FBRyxPQUFPLElBQUksUUFBUSxZQUFXLENBQUU7QUFDdEUsaUJBQWEsUUFBUSxLQUFLLEtBQUssVUFBVTtBQUFBLE1BQ3ZDO0FBQUEsTUFDQTtBQUFBLE1BQ0EsV0FBVyxLQUFLLElBQUc7QUFBQSxJQUN6QixDQUFLLENBQUM7QUFBQSxFQUNKLFNBQVMsT0FBTztBQUNkLFlBQVEsTUFBTSxzQkFBc0IsS0FBSztBQUFBLEVBQzNDO0FBQ0Y7QUFLQSxlQUFlLG1CQUFtQixTQUFTLFNBQVM7QUFDbEQsTUFBSTtBQUNGLFVBQU0sVUFBVSxZQUFZLE1BQ3hCLG9DQUNBLFlBQVksTUFDWiwyQ0FDQTtBQUVKLFFBQUksQ0FBQyxRQUFTLFFBQU87QUFFckIsVUFBTSxNQUFNLEdBQUcsT0FBTyw4Q0FBOEMsT0FBTztBQUMzRSxVQUFNLFdBQVcsTUFBTSxNQUFNLEdBQUc7QUFDaEMsVUFBTSxPQUFPLE1BQU0sU0FBUztBQUU1QixRQUFJLEtBQUssV0FBVyxPQUFPLEtBQUssVUFBVSxLQUFLLFdBQVcscUNBQXFDO0FBQzdGLGFBQU87QUFBQSxRQUNMLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTTtBQUFBLFFBQzNCLFFBQVE7QUFBQSxRQUNSLFVBQVU7QUFBQSxNQUNsQjtBQUFBLElBQ0k7QUFFQSxXQUFPO0FBQUEsRUFDVCxTQUFTLE9BQU87QUFDZCxZQUFRLE1BQU0sMEJBQTBCLEtBQUs7QUFDN0MsV0FBTztBQUFBLEVBQ1Q7QUFDRjtBQUtBLGVBQWUsa0JBQWtCLFNBQVMsU0FBUyxZQUFZLGNBQWM7QUFDM0UsTUFBSTtBQUNGLFVBQU0sTUFBTSx1Q0FBdUMsU0FBUyxJQUFJLE9BQU8sSUFBSSxPQUFPO0FBQ2xGLFVBQU0sV0FBVyxNQUFNLE1BQU0sR0FBRztBQUVoQyxRQUFJLENBQUMsU0FBUyxHQUFJLFFBQU87QUFFekIsVUFBTSxXQUFXLE1BQU0sU0FBUztBQUVoQyxRQUFJLFNBQVMsVUFBVSxTQUFTLE9BQU8sS0FBSztBQUMxQyxhQUFPO0FBQUEsUUFDTCxLQUFLLFNBQVMsT0FBTztBQUFBLFFBQ3JCLFFBQVEsWUFBWSxTQUFTO0FBQUEsUUFDN0IsVUFBVTtBQUFBLE1BQ2xCO0FBQUEsSUFDSTtBQUVBLFdBQU87QUFBQSxFQUNULFNBQVMsT0FBTztBQUNkLFlBQVEsTUFBTSxZQUFZLFNBQVMsaUJBQWlCLEtBQUs7QUFDekQsV0FBTztBQUFBLEVBQ1Q7QUFDRjtBQUtBLGVBQWUsb0JBQW9CLFVBQVU7QUFDM0MsTUFBSTtBQUNGLFVBQU0sTUFBTSxnRUFBZ0UsUUFBUTtBQUNwRixVQUFNLFdBQVcsTUFBTSxNQUFNLEdBQUc7QUFDaEMsVUFBTSxPQUFPLE1BQU0sU0FBUztBQUU1QixRQUFJLEtBQUssV0FBVyxLQUFLLFFBQVEsU0FBUyxHQUFHO0FBQzNDLGFBQU8sS0FBSyxRQUFRLENBQUMsRUFBRTtBQUFBLElBQ3pCO0FBRUEsV0FBTztBQUFBLEVBQ1QsU0FBUyxPQUFPO0FBQ2QsWUFBUSxNQUFNLHNCQUFzQixLQUFLO0FBQ3pDLFdBQU87QUFBQSxFQUNUO0FBQ0Y7QUFLTyxlQUFlLGVBQWUsU0FBUyxVQUFVLEtBQUs7QUFDM0QsTUFBSSxDQUFDLFdBQVcsWUFBWSw4Q0FBOEM7QUFDeEUsV0FBTztBQUFBLEVBQ1Q7QUFHQSxRQUFNLFNBQVMsYUFBYSxTQUFTLE9BQU87QUFDNUMsTUFBSSxRQUFRO0FBQ1YsWUFBUSxJQUFJLDBCQUEwQjtBQUN0QyxXQUFPLEVBQUUsS0FBSyxRQUFRLFFBQVEsU0FBUyxVQUFVO0VBQ25EO0FBRUEsVUFBUSxJQUFJLHVCQUF1QixPQUFPO0FBRzFDLFFBQU0sa0JBQWtCLE1BQU0sbUJBQW1CLFNBQVMsT0FBTztBQUNqRSxNQUFJLGlCQUFpQjtBQUNuQixZQUFRLElBQUksMkJBQTJCO0FBQ3ZDLGFBQVMsU0FBUyxTQUFTLGdCQUFnQixLQUFLLGdCQUFnQixNQUFNO0FBQ3RFLFdBQU87QUFBQSxFQUNUO0FBR0EsUUFBTSxxQkFBcUIsTUFBTSxrQkFBa0IsU0FBUyxTQUFTLFlBQVk7QUFDakYsTUFBSSxvQkFBb0I7QUFDdEIsWUFBUSxJQUFJLHVDQUF1QztBQUNuRCxhQUFTLFNBQVMsU0FBUyxtQkFBbUIsS0FBSyxtQkFBbUIsTUFBTTtBQUM1RSxXQUFPO0FBQUEsRUFDVDtBQUdBLFFBQU0sd0JBQXdCLE1BQU0sa0JBQWtCLFNBQVMsU0FBUyxlQUFlO0FBQ3ZGLE1BQUksdUJBQXVCO0FBQ3pCLFlBQVEsSUFBSSwwQ0FBMEM7QUFDdEQsYUFBUyxTQUFTLFNBQVMsc0JBQXNCLEtBQUssc0JBQXNCLE1BQU07QUFDbEYsV0FBTztBQUFBLEVBQ1Q7QUFFQSxVQUFRLElBQUksOEJBQThCO0FBQzFDLFNBQU87QUFDVDtBQUtPLGVBQWUsa0JBQWtCLFdBQVcsVUFBVSxLQUFLO0FBQ2hFLFFBQU0sVUFBVSxVQUFVO0FBQzFCLFFBQU0sT0FBTyxVQUFVO0FBR3ZCLE1BQUksQ0FBQyxRQUFRLFNBQVMsUUFBUSxLQUFLLFVBQVUsR0FBRztBQUM5QyxXQUFPO0FBQUEsTUFDTCxNQUFNO0FBQUEsTUFDTixhQUFhO0FBQUEsTUFDYixRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsTUFDUixVQUFVO0FBQUEsTUFDVixhQUFhQyxpQkFBZSxTQUFTLE9BQU87QUFBQSxJQUNsRDtBQUFBLEVBQ0U7QUFFQSxRQUFNLG1CQUFtQixLQUFLLE1BQU0sR0FBRyxFQUFFO0FBR3pDLFFBQU0sYUFBYSxpQkFBaUIsZ0JBQWdCO0FBQ3BELE1BQUksWUFBWTtBQUNkLFlBQVEsSUFBSSxrQ0FBa0MsV0FBVyxJQUFJO0FBQUEsRUFDL0Q7QUFHQSxRQUFNLFlBQVksTUFBTSxlQUFlLFNBQVMsT0FBTztBQUV2RCxNQUFJLGFBQWEsVUFBVSxLQUFLO0FBRTlCLFFBQUk7QUFDRixZQUFNLFdBQVcsSUFBSUMsVUFBaUIsVUFBVSxHQUFHO0FBQ25ELFlBQU0sVUFBVSxTQUFTLGlCQUFpQixFQUFFLEtBQUksQ0FBRTtBQUVsRCxhQUFPO0FBQUEsUUFDTCxNQUFNO0FBQUEsUUFDTixhQUFhLGFBQWEsV0FBVyxjQUFjO0FBQUEsUUFDbkQsUUFBUSxRQUFRO0FBQUEsUUFDaEIsV0FBVyxRQUFRO0FBQUEsUUFDbkIsUUFBUSxpQkFBaUIsUUFBUSxVQUFVLFFBQVEsSUFBSTtBQUFBLFFBQ3ZELFVBQVU7QUFBQSxVQUNSO0FBQUEsVUFDQSxVQUFVLFVBQVU7QUFBQSxVQUNwQixRQUFRLFVBQVU7QUFBQSxRQUM1QjtBQUFBLFFBQ1EsYUFBYUQsaUJBQWUsU0FBUyxPQUFPO0FBQUEsUUFDNUMsVUFBVSxhQUFhLFdBQVcsV0FBVztBQUFBLE1BQ3JEO0FBQUEsSUFDSSxTQUFTLE9BQU87QUFDZCxjQUFRLE1BQU0sNEJBQTRCLEtBQUs7QUFBQSxJQUNqRDtBQUFBLEVBQ0Y7QUFHQSxNQUFJLG9CQUFvQjtBQUN4QixNQUFJLFlBQVk7QUFDZCx3QkFBb0IsV0FBVztBQUFBLEVBQ2pDLE9BQU87QUFDTCx3QkFBb0IsTUFBTSxvQkFBb0IsZ0JBQWdCO0FBQUEsRUFDaEU7QUFFQSxNQUFJLG1CQUFtQjtBQUNyQixXQUFPO0FBQUEsTUFDTCxNQUFNO0FBQUEsTUFDTixhQUFhLGFBQWEsV0FBVyxjQUFjO0FBQUEsTUFDbkQsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLE1BQ1gsUUFBUTtBQUFBLE1BQ1IsVUFBVTtBQUFBLFFBQ1I7QUFBQSxRQUNBLFVBQVU7QUFBQSxRQUNWLFFBQVE7QUFBQSxNQUNoQjtBQUFBLE1BQ00sYUFBYUEsaUJBQWUsU0FBUyxPQUFPO0FBQUEsTUFDNUMsU0FBUztBQUFBLE1BQ1QsVUFBVSxhQUFhLFdBQVcsV0FBVztBQUFBLElBQ25EO0FBQUEsRUFDRTtBQUdBLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLGFBQWE7QUFBQSxJQUNiLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLFFBQVE7QUFBQSxJQUNSLFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQSxVQUFVO0FBQUEsTUFDVixRQUFRO0FBQUEsSUFDZDtBQUFBLElBQ0ksYUFBYUEsaUJBQWUsU0FBUyxPQUFPO0FBQUEsSUFDNUMsU0FBUztBQUFBLElBQ1Q7QUFBQSxFQUNKO0FBQ0E7QUFLQSxTQUFTLGlCQUFpQixVQUFVLE1BQU07QUFDeEMsUUFBTSxTQUFTO0FBRWYsV0FBUyxJQUFJLEdBQUcsSUFBSSxTQUFTLE9BQU8sUUFBUSxLQUFLO0FBQy9DLFVBQU0sUUFBUSxTQUFTLE9BQU8sQ0FBQztBQUMvQixVQUFNLFFBQVEsS0FBSyxDQUFDO0FBRXBCLFdBQU8sS0FBSztBQUFBLE1BQ1YsTUFBTSxNQUFNLFFBQVEsUUFBUSxDQUFDO0FBQUEsTUFDN0IsTUFBTSxNQUFNO0FBQUEsTUFDWixPQUFPLFlBQVksT0FBTyxNQUFNLElBQUk7QUFBQSxJQUMxQyxDQUFLO0FBQUEsRUFDSDtBQUVBLFNBQU87QUFDVDtBQUtBLFNBQVMsWUFBWSxPQUFPLE1BQU07QUFDaEMsTUFBSTtBQUNGLFFBQUksS0FBSyxTQUFTLElBQUksR0FBRztBQUV2QixVQUFJLE1BQU0sUUFBUSxLQUFLLEdBQUc7QUFDeEIsZUFBTyxNQUFNLElBQUksT0FBSyxZQUFZLEdBQUcsS0FBSyxRQUFRLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFBQSxNQUM5RDtBQUFBLElBQ0Y7QUFFQSxRQUFJLEtBQUssV0FBVyxNQUFNLEtBQUssS0FBSyxXQUFXLEtBQUssR0FBRztBQUVyRCxhQUFPLE1BQU07SUFDZjtBQUVBLFFBQUksU0FBUyxXQUFXO0FBRXRCLGFBQU87QUFBQSxJQUNUO0FBRUEsUUFBSSxTQUFTLFFBQVE7QUFFbkIsYUFBTyxRQUFRLFNBQVM7QUFBQSxJQUMxQjtBQUVBLFFBQUksU0FBUyxXQUFXLEtBQUssV0FBVyxPQUFPLEdBQUc7QUFFaEQsVUFBSSxPQUFPLFVBQVUsVUFBVTtBQUM3QixlQUFPLE1BQU0sU0FBUyxLQUFLLE1BQU0sTUFBTSxHQUFHLEVBQUUsSUFBSSxRQUFRO0FBQUEsTUFDMUQ7QUFBQSxJQUNGO0FBR0EsUUFBSSxPQUFPLFVBQVUsWUFBWSxVQUFVLE1BQU07QUFDL0MsYUFBTyxLQUFLLFVBQVUsS0FBSztBQUFBLElBQzdCO0FBRUEsV0FBTyxPQUFPLEtBQUs7QUFBQSxFQUNyQixTQUFTLE9BQU87QUFDZCxZQUFRLE1BQU0sMkJBQTJCLEtBQUs7QUFDOUMsV0FBTyxPQUFPLEtBQUs7QUFBQSxFQUNyQjtBQUNGO0FBS0EsU0FBU0EsaUJBQWUsU0FBUyxTQUFTO0FBQ3hDLFFBQU0sVUFBVSxjQUFjLE9BQU8sS0FBSyxjQUFjLEdBQUc7QUFHM0QsTUFBSSxZQUFZLEtBQUs7QUFDbkIsV0FBTyxHQUFHLE9BQU8sY0FBYyxPQUFPO0FBQUEsRUFDeEM7QUFHQSxTQUFPLEdBQUcsT0FBTyxZQUFZLE9BQU87QUFDdEM7QUMxWEEsTUFBTSxXQUFXO0FBQUEsRUFDZjtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0Y7QUFJQSxNQUFNLGVBQWU7QUFBQSxFQUNuQixZQUFZO0FBQUE7QUFBQSxJQUVWLFdBQVc7QUFBQTtBQUFBO0FBQUEsSUFHWCxXQUFXO0FBQUEsSUFDWCxZQUFZO0FBQUEsSUFDWixXQUFXO0FBQUE7QUFBQSxJQUNYLGNBQWM7QUFBQSxJQUNkLFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLFlBQVk7QUFBQSxJQUNaLGFBQWE7QUFBQSxFQUNqQjtBQUNBO0FBR0EsTUFBTSxrQkFBa0I7QUFBQSxFQUN0QixZQUFZO0FBQUEsSUFDVixNQUFNLEVBQUUsU0FBUyw4Q0FBOEMsVUFBVSxHQUFFO0FBQUEsSUFDM0UsS0FBSyxFQUFFLFNBQVMsOENBQThDLFVBQVUsR0FBRTtBQUFBLElBQzFFLEtBQUssRUFBRSxTQUFTLDhDQUE4QyxVQUFVLEVBQUM7QUFBQSxJQUN6RSxNQUFNLEVBQUUsU0FBUyw4Q0FBOEMsVUFBVSxHQUFFO0FBQUEsSUFDM0UsS0FBSyxFQUFFLFNBQVMsOENBQThDLFVBQVUsR0FBRTtBQUFBLElBQzFFLFFBQVEsRUFBRSxTQUFTLDhDQUE4QyxVQUFVLEdBQUU7QUFBQSxJQUM3RSxLQUFLLEVBQUUsU0FBUyw4Q0FBOEMsVUFBVSxHQUFFO0FBQUEsSUFDMUUsS0FBSyxFQUFFLFNBQVMsOENBQThDLFVBQVUsR0FBRTtBQUFBLElBQzFFLE1BQU0sRUFBRSxTQUFTLDhDQUE4QyxVQUFVLEdBQUU7QUFBQSxJQUMzRSxPQUFPLEVBQUUsU0FBUyw4Q0FBOEMsVUFBVSxHQUFFO0FBQUEsRUFDaEY7QUFDQTtBQUdBLE1BQU0sYUFBYTtBQUFBLEVBQ2pCLFFBQVE7QUFBQSxFQUNSLFdBQVc7QUFBQSxFQUNYLGdCQUFnQixJQUFJLEtBQUs7QUFBQTtBQUMzQjtBQUtBLGVBQWUsZ0JBQWdCLFVBQVUsYUFBYTtBQUNwRCxNQUFJO0FBQ0YsVUFBTSxlQUFlLElBQUlKLFNBQWdCLGFBQWEsVUFBVSxRQUFRO0FBQ3hFLFVBQU0sQ0FBQyxVQUFVLFFBQVEsSUFBSSxNQUFNLGFBQWEsWUFBVztBQUMzRCxVQUFNLFNBQVMsTUFBTSxhQUFhO0FBQ2xDLFVBQU0sU0FBUyxNQUFNLGFBQWE7QUFFbEMsV0FBTztBQUFBLE1BQ0wsVUFBVSxTQUFTLFNBQVE7QUFBQSxNQUMzQixVQUFVLFNBQVMsU0FBUTtBQUFBLE1BQzNCLFFBQVEsT0FBTyxZQUFXO0FBQUEsTUFDMUIsUUFBUSxPQUFPLFlBQVc7QUFBQSxJQUNoQztBQUFBLEVBQ0UsU0FBUyxPQUFPO0FBQ2QsWUFBUSxNQUFNLGlDQUFpQyxhQUFhLEtBQUs7QUFDakUsV0FBTztBQUFBLEVBQ1Q7QUFDRjtBQU1BLFNBQVMsZUFBZSxVQUFVLFVBQVUsWUFBWSxJQUFJLFlBQVksSUFBSTtBQUMxRSxRQUFNLEtBQUssV0FBV0MsWUFBbUIsVUFBVSxTQUFTLENBQUM7QUFDN0QsUUFBTSxLQUFLLFdBQVdBLFlBQW1CLFVBQVUsU0FBUyxDQUFDO0FBRTdELE1BQUksT0FBTyxFQUFHLFFBQU87QUFDckIsU0FBTyxLQUFLO0FBQ2Q7QUFPQSxlQUFlLFlBQVksVUFBVTtBQUNuQyxNQUFJO0FBRUYsVUFBTSxpQkFBaUIsYUFBYSxXQUFXO0FBQy9DLFVBQU0sY0FBYyxNQUFNLGdCQUFnQixVQUFVLGNBQWM7QUFFbEUsUUFBSSxhQUFhO0FBQ2YsWUFBTUssVUFBUyxnQkFBZ0I7QUFDL0IsWUFBTSxhQUFhQSxRQUFPLEtBQUssUUFBUSxZQUFXO0FBQ2xELFlBQU0sYUFBYUEsUUFBTyxJQUFJLFFBQVEsWUFBVztBQUVqRCxVQUFJQyxhQUFZO0FBQ2hCLFVBQUksWUFBWSxXQUFXLFlBQVk7QUFDckMsUUFBQUEsY0FBYSxZQUFZO0FBQ3pCLHFCQUFhLFlBQVk7QUFBQSxNQUMzQixPQUFPO0FBQ0wsUUFBQUEsY0FBYSxZQUFZO0FBQ3pCLHFCQUFhLFlBQVk7QUFBQSxNQUMzQjtBQUVBLFlBQU0sV0FBVyxlQUFlQSxhQUFZLFlBQVksSUFBSSxFQUFFO0FBQzlELGNBQVEsSUFBSSw4QkFBOEIsUUFBUTtBQUNsRCxhQUFPO0FBQUEsSUFDVDtBQUFBLEVBQ0YsU0FBUyxPQUFPO0FBQ2QsWUFBUSxLQUFLLHdEQUF3RCxNQUFNLE9BQU87QUFBQSxFQUNwRjtBQUtBLFVBQVEsSUFBSSw4Q0FBOEM7QUFHMUQsUUFBTSxpQkFBaUIsYUFBYSxXQUFXO0FBQy9DLFFBQU0sY0FBYyxNQUFNLGdCQUFnQixVQUFVLGNBQWM7QUFFbEUsTUFBSSxDQUFDLGFBQWE7QUFDaEIsWUFBUSxNQUFNLHdEQUF3RDtBQUN0RSxXQUFPO0FBQUEsRUFDVDtBQUVBLFFBQU0sU0FBUyxnQkFBZ0I7QUFFL0IsUUFBTSxhQUFhLE9BQU8sSUFBSSxRQUFRLFlBQVc7QUFFakQsTUFBSSxZQUFZO0FBQ2hCLE1BQUksWUFBWSxXQUFXLFlBQVk7QUFDckMsaUJBQWEsWUFBWTtBQUN6QixpQkFBYSxZQUFZO0FBQUEsRUFDM0IsT0FBTztBQUNMLGlCQUFhLFlBQVk7QUFDekIsaUJBQWEsWUFBWTtBQUFBLEVBQzNCO0FBR0EsUUFBTSxzQkFBc0IsV0FBV04sWUFBbUIsWUFBWSxDQUFDLENBQUM7QUFDeEUsUUFBTSxzQkFBc0IsV0FBV0EsWUFBbUIsWUFBWSxFQUFFLENBQUM7QUFDekUsUUFBTSxnQkFBZ0Isc0JBQXNCO0FBRzVDLFFBQU0sY0FBYztBQUdwQixRQUFNLGNBQWMsY0FBYztBQUlsQyxTQUFPO0FBQ1Q7QUFNQSxlQUFlLG1CQUFtQixVQUFVLGFBQWEsY0FBYyxlQUFlO0FBQ3BGLFFBQU0sV0FBVyxNQUFNLGdCQUFnQixVQUFVLFdBQVc7QUFFNUQsTUFBSSxDQUFDLFNBQVUsUUFBTztBQUd0QixRQUFNLGNBQWMsYUFBYTtBQUdqQyxNQUFJLGNBQWM7QUFDbEIsTUFBSSxTQUFTLFdBQVcsYUFBYTtBQUNuQyxtQkFBZSxTQUFTO0FBQ3hCLGlCQUFhLFNBQVM7QUFBQSxFQUN4QixXQUFXLFNBQVMsV0FBVyxhQUFhO0FBQzFDLG1CQUFlLFNBQVM7QUFDeEIsaUJBQWEsU0FBUztBQUFBLEVBQ3hCLE9BQU87QUFDTCxZQUFRLE1BQU0sNEJBQTRCLGNBQWMsV0FBVztBQUNuRSxXQUFPO0FBQUEsRUFDVDtBQUtBLFFBQU0sd0JBQXdCLFdBQVdBLFlBQW1CLGNBQWMsYUFBYSxDQUFDO0FBQ3hGLFFBQU0sc0JBQXNCLFdBQVdBLFlBQW1CLFlBQVksRUFBRSxDQUFDO0FBSXpFLE1BQUksMEJBQTBCLEVBQUcsUUFBTztBQUV4QyxRQUFNLGtCQUFrQixzQkFBc0I7QUFFOUMsU0FBTztBQUNUO0FBTU8sZUFBZSxpQkFBaUIsVUFBVSxVQUFVLGNBQWM7QUFFdkUsUUFBTSxNQUFNLEtBQUs7QUFDakIsTUFBSSxXQUFXLE9BQU8sT0FBTyxLQUFNLE1BQU0sV0FBVyxZQUFhLFdBQVcsZ0JBQWdCO0FBRTFGLFdBQU8sV0FBVyxPQUFPLE9BQU87QUFBQSxFQUNsQztBQUlBLE1BQUk7QUFDRixVQUFNLFNBQVM7QUFHZixVQUFNLGNBQWMsTUFBTSxZQUFZLFFBQVE7QUFDOUMsUUFBSSxDQUFDLGFBQWE7QUFDaEIsY0FBUSxLQUFLLDJCQUEyQjtBQUN4QyxhQUFPO0FBQUEsSUFDVDtBQUVBLFdBQU8sTUFBTTtBQUliLFVBQU0sUUFBUSxhQUFhLE9BQU87QUFDbEMsVUFBTSxTQUFTLGdCQUFnQixPQUFPO0FBR3RDLFVBQU0sZ0JBQWdCLE1BQU0sbUJBQW1CLFVBQVUsTUFBTSxTQUFTLE9BQU8sSUFBSSxTQUFTLE9BQU8sSUFBSSxRQUFRO0FBQy9HLFFBQUksZUFBZTtBQUNqQixhQUFPLE1BQU0sZ0JBQWdCO0FBQUEsSUFFL0I7QUFHQSxVQUFNLGlCQUFpQixNQUFNLG1CQUFtQixVQUFVLE1BQU0sVUFBVSxPQUFPLEtBQUssU0FBUyxPQUFPLEtBQUssUUFBUTtBQUNuSCxRQUFJLGdCQUFnQjtBQUNsQixhQUFPLE9BQU8saUJBQWlCO0FBQUEsSUFFakM7QUFHQSxVQUFNLGdCQUFnQixNQUFNLG1CQUFtQixVQUFVLE1BQU0sU0FBUyxPQUFPLElBQUksU0FBUyxPQUFPLElBQUksUUFBUTtBQUMvRyxRQUFJLGVBQWU7QUFDakIsYUFBTyxNQUFNLGdCQUFnQjtBQUFBLElBRS9CO0FBR0EsVUFBTSxtQkFBbUIsTUFBTSxtQkFBbUIsVUFBVSxNQUFNLFlBQVksT0FBTyxPQUFPLFNBQVMsT0FBTyxPQUFPLFFBQVE7QUFDM0gsUUFBSSxrQkFBa0I7QUFDcEIsYUFBTyxTQUFTLG1CQUFtQjtBQUFBLElBRXJDO0FBR0EsVUFBTSxnQkFBZ0IsTUFBTSxtQkFBbUIsVUFBVSxNQUFNLFNBQVMsT0FBTyxJQUFJLFNBQVMsT0FBTyxJQUFJLFFBQVE7QUFDL0csUUFBSSxlQUFlO0FBQ2pCLGFBQU8sTUFBTSxnQkFBZ0I7QUFBQSxJQUUvQjtBQUdBLFVBQU0sZ0JBQWdCLE1BQU0sbUJBQW1CLFVBQVUsTUFBTSxTQUFTLE9BQU8sSUFBSSxTQUFTLE9BQU8sSUFBSSxRQUFRO0FBQy9HLFFBQUksZUFBZTtBQUNqQixhQUFPLE1BQU0sZ0JBQWdCO0FBQUEsSUFFL0I7QUFHQSxVQUFNLGlCQUFpQixNQUFNLG1CQUFtQixVQUFVLE1BQU0sVUFBVSxPQUFPLEtBQUssU0FBUyxPQUFPLEtBQUssUUFBUTtBQUNuSCxRQUFJLGdCQUFnQjtBQUNsQixhQUFPLE9BQU8saUJBQWlCO0FBQUEsSUFFakM7QUFHQSxVQUFNLGtCQUFrQixNQUFNLG1CQUFtQixVQUFVLE1BQU0sV0FBVyxPQUFPLE1BQU0sU0FBUyxPQUFPLE1BQU0sUUFBUTtBQUN2SCxRQUFJLGlCQUFpQjtBQUNuQixhQUFPLFFBQVEsa0JBQWtCO0FBQUEsSUFFbkM7QUFHQSxlQUFXLE9BQU8sT0FBTyxJQUFJO0FBQzdCLGVBQVcsWUFBWTtBQUV2QixXQUFPO0FBQUEsRUFFVCxTQUFTLE9BQU87QUFDZCxZQUFRLE1BQU0sZ0NBQWdDLEtBQUs7QUFDbkQsV0FBTztBQUFBLEVBQ1Q7QUFDRjtBQVNPLFNBQVMsaUJBQWlCLGFBQWEsUUFBUSxVQUFVLFFBQVE7QUFDdEUsTUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLFdBQVcsR0FBRztBQUNuQyxXQUFPO0FBQUEsRUFDVDtBQUVBLFFBQU0sY0FBYyxXQUFXQSxZQUFtQixRQUFRLFFBQVEsQ0FBQztBQUNuRSxRQUFNLGFBQWEsT0FBTyxXQUFXO0FBRXJDLFNBQU8sY0FBYztBQUN2QjtBQUtPLFNBQVMsVUFBVSxPQUFPO0FBQy9CLE1BQUksVUFBVSxRQUFRLFVBQVUsUUFBVztBQUN6QyxXQUFPO0FBQUEsRUFDVDtBQUVBLE1BQUksUUFBUSxNQUFNO0FBQ2hCLFdBQU8sSUFBSSxNQUFNLFFBQVEsQ0FBQyxDQUFDO0FBQUEsRUFDN0IsV0FBVyxRQUFRLEdBQUc7QUFDcEIsV0FBTyxJQUFJLE1BQU0sUUFBUSxDQUFDLENBQUM7QUFBQSxFQUM3QixXQUFXLFFBQVEsS0FBSztBQUN0QixXQUFPLElBQUksTUFBTSxRQUFRLENBQUMsQ0FBQztBQUFBLEVBQzdCLE9BQU87QUFDTCxXQUFPLElBQUksTUFBTSxlQUFlLFNBQVMsRUFBRSx1QkFBdUIsR0FBRyx1QkFBdUIsRUFBQyxDQUFFLENBQUM7QUFBQSxFQUNsRztBQUNGO0FDMVNBLFNBQVMsV0FBVyxNQUFNO0FBQ3hCLE1BQUksT0FBTyxTQUFTLFNBQVUsUUFBTztBQUNyQyxRQUFNLE1BQU0sU0FBUyxjQUFjLEtBQUs7QUFDeEMsTUFBSSxjQUFjO0FBQ2xCLFNBQU8sSUFBSTtBQUNiO0FBUUEsU0FBUyxjQUFjLFNBQVM7QUFDOUIsTUFBSSxPQUFPLFlBQVksU0FBVSxRQUFPO0FBR3hDLE1BQUksWUFBWSxRQUFRLFFBQVEscUNBQXFDLEVBQUU7QUFHdkUsY0FBWSxVQUFVLFFBQVEsWUFBWSxFQUFFO0FBRzVDLGNBQVksVUFBVSxRQUFRLGlCQUFpQixFQUFFO0FBQ2pELGNBQVksVUFBVSxRQUFRLGVBQWUsRUFBRTtBQUcvQyxNQUFJLFVBQVUsU0FBUyxLQUFLO0FBQzFCLGdCQUFZLFVBQVUsVUFBVSxHQUFHLEdBQUcsSUFBSTtBQUFBLEVBQzVDO0FBRUEsU0FBTyxhQUFhO0FBQ3RCO0FBT0EsSUFBSSxlQUFlO0FBQUEsRUFDakIsWUFBWTtBQUFBLEVBQ1osU0FBUztBQUFBLEVBQ1QsU0FBUztBQUFBLEVBQ1QsU0FBUztBQUFBO0FBQUEsRUFDVCxjQUFjO0FBQUE7QUFBQSxFQUNkLFVBQVU7QUFBQSxJQUNSLGlCQUFpQjtBQUFBLElBQ2pCLGtCQUFrQjtBQUFBLElBQ2xCLGVBQWU7QUFBQSxJQUNmLE9BQU87QUFBQSxJQUNQLGlCQUFpQjtBQUFBO0FBQUEsSUFDakIsY0FBYztBQUFBO0FBQUEsRUFDbEI7QUFBQSxFQUNFLGlCQUFpQjtBQUFBO0FBQUEsRUFDakIsa0JBQWtCO0FBQUE7QUFBQSxFQUNsQixhQUFhO0FBQUE7QUFBQSxFQUNiLHFCQUFxQjtBQUFBO0FBQ3ZCO0FBR0EsSUFBSSxnQkFBZ0I7QUFHcEIsTUFBTSxpQkFBaUI7QUFDdkIsTUFBTSxlQUFlO0FBQ3JCLE1BQU0sc0JBQXNCLEtBQUssS0FBSztBQUd0QyxNQUFNLGdCQUFnQjtBQUFBLEVBQ3BCLHFCQUFxQjtBQUFBLEVBQ3JCLGNBQWM7QUFBQSxFQUNkLFlBQVk7QUFBQSxFQUNaLFdBQVc7QUFDYjtBQUVBLE1BQU0sa0JBQWtCO0FBQUEsRUFDdEIscUJBQXFCO0FBQUEsSUFDbkIsTUFBTTtBQUFBLElBQ04sSUFBSTtBQUFBLElBQ0osU0FBUztBQUFBLElBQ1QsT0FBTztBQUFBLEVBQ1g7QUFBQSxFQUNFLGNBQWM7QUFBQSxJQUNaLE1BQU07QUFBQSxJQUNOLElBQUk7QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULE9BQU87QUFBQSxFQUNYO0FBQUEsRUFDRSxZQUFZO0FBQUEsSUFDVixNQUFNO0FBQUEsSUFDTixJQUFJO0FBQUEsSUFDSixTQUFTO0FBQUEsSUFDVCxPQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0UsV0FBVztBQUFBLElBQ1QsTUFBTTtBQUFBLElBQ04sSUFBSTtBQUFBLElBQ0osU0FBUztBQUFBLElBQ1QsT0FBTztBQUFBLEVBQ1g7QUFDQTtBQVNBLFNBQVMsZUFBZSxTQUFTLE1BQU0sT0FBTztBQUM1QyxRQUFNLFdBQVcsZ0JBQWdCLE9BQU87QUFDeEMsTUFBSSxDQUFDLFNBQVUsUUFBTztBQUV0QixRQUFNLFVBQVUsU0FBUyxJQUFJO0FBQzdCLE1BQUksQ0FBQyxRQUFTLFFBQU87QUFFckIsU0FBTyxTQUFTLE9BQU8sUUFBUSxRQUFRLElBQW9CLE1BQWtCLEtBQUssS0FBSztBQUN6RjtBQUdBLFNBQVMsaUJBQWlCLG9CQUFvQixZQUFZO0FBRXhELFFBQU0sWUFBWSxJQUFJLGdCQUFnQixPQUFPLFNBQVMsTUFBTTtBQUM1RCxRQUFNLFNBQVMsVUFBVSxJQUFJLFFBQVE7QUFDckMsUUFBTSxTQUFTLFVBQVUsSUFBSSxRQUFRO0FBQ3JDLFFBQU0sWUFBWSxVQUFVLElBQUksV0FBVztBQUUzQyxNQUFJLFdBQVcsYUFBYSxVQUFVLFdBQVc7QUFFL0MsVUFBTSwrQkFBK0IsUUFBUSxTQUFTO0FBQ3REO0FBQUEsRUFDRjtBQUVBLE1BQUksV0FBVyxpQkFBaUIsV0FBVztBQUV6QztBQUNBLFVBQU0sZ0NBQWdDLFNBQVM7QUFDL0M7QUFBQSxFQUNGO0FBRUEsTUFBSSxXQUFXLGNBQWMsV0FBVztBQUV0QyxVQUFNLDZCQUE2QixTQUFTO0FBQzVDO0FBQUEsRUFDRjtBQUVBLE1BQUksV0FBVyxVQUFVLFdBQVc7QUFFbEMsVUFBTSxnQ0FBZ0MsU0FBUztBQUMvQztBQUFBLEVBQ0Y7QUFFQSxNQUFJLFdBQVcsZUFBZSxXQUFXO0FBRXZDLFVBQU0sa0NBQWtDLFNBQVM7QUFDakQ7QUFBQSxFQUNGO0FBSUEsUUFBTSxxQkFBb0I7QUFFMUIsUUFBTSxhQUFZO0FBQ2xCLFFBQU0sWUFBVztBQUNqQjtBQUNBLFFBQU0sa0JBQWlCO0FBQ3ZCO0FBQ0E7QUFDRixDQUFDO0FBR0QsU0FBUyxXQUFXLFVBQVU7QUFFNUIsUUFBTSxVQUFVLFNBQVMsaUJBQWlCLGlCQUFpQjtBQUMzRCxVQUFRLFFBQVEsQ0FBQU8sWUFBVUEsUUFBTyxVQUFVLElBQUksUUFBUSxDQUFDO0FBR3hELFFBQU0sU0FBUyxTQUFTLGVBQWUsUUFBUTtBQUMvQyxNQUFJLFFBQVE7QUFDVixXQUFPLFVBQVUsT0FBTyxRQUFRO0FBRWhDLFdBQU8sU0FBUyxHQUFHLENBQUM7QUFBQSxFQUN0QjtBQUNGO0FBRUEsZUFBZSxvQkFBb0I7QUFDakMsUUFBTSxTQUFTLE1BQU07QUFFckIsTUFBSSxDQUFDLFFBQVE7QUFFWCxlQUFXLGNBQWM7QUFBQSxFQUMzQixPQUFPO0FBRUwsZUFBVyxlQUFlO0FBQUEsRUFDNUI7QUFDRjtBQUdBLGVBQWUsZUFBZTtBQUM1QixRQUFNLFFBQVEsTUFBTSxLQUFLLFVBQVU7QUFDbkMsTUFBSSxPQUFPO0FBQ1QsaUJBQWEsV0FBVyxFQUFFLEdBQUcsYUFBYSxVQUFVLEdBQUc7RUFDekQ7QUFHQSxRQUFNLGtCQUFrQixNQUFNLEtBQUssaUJBQWlCO0FBQ3BELE1BQUksaUJBQWlCO0FBQ25CLGlCQUFhLGtCQUFrQjtBQUFBLEVBQ2pDO0FBQ0Y7QUFFQSxlQUFlLGVBQWU7QUFDNUIsUUFBTSxLQUFLLFlBQVksYUFBYSxRQUFRO0FBQzlDO0FBRUEsZUFBZSxjQUFjO0FBQzNCLFFBQU0sUUFBUSxNQUFNLEtBQUssZ0JBQWdCO0FBQ3pDLE1BQUksT0FBTztBQUNULGlCQUFhLFVBQVU7QUFBQSxFQUN6QjtBQUNGO0FBRUEsZUFBZSxjQUFjO0FBQzNCLFFBQU0sS0FBSyxrQkFBa0IsYUFBYSxPQUFPO0FBQ25EO0FBRUEsU0FBUyxhQUFhO0FBRXBCLFdBQVMsS0FBSyxVQUFVLE9BQU8sdUJBQXVCLHNCQUFzQixlQUFlLGFBQWEsaUJBQWlCLGFBQWE7QUFHdEksTUFBSSxhQUFhLFNBQVMsVUFBVSxpQkFBaUI7QUFDbkQsYUFBUyxLQUFLLFVBQVUsSUFBSSxTQUFTLGFBQWEsU0FBUyxLQUFLLEVBQUU7QUFBQSxFQUNwRTtBQUNGO0FBR0EsU0FBUyxzQkFBc0I7QUFFN0IsV0FBUyxlQUFlLG1CQUFtQixHQUFHLGlCQUFpQixTQUFTLFlBQVk7QUFDbEYsVUFBTSxvQkFBbUI7QUFDekI7QUFDQSxlQUFXLGVBQWU7QUFBQSxFQUM1QixDQUFDO0FBRUQsV0FBUyxlQUFlLG1CQUFtQixHQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDNUU7QUFDQSxlQUFXLGVBQWU7QUFBQSxFQUM1QixDQUFDO0FBR0QsV0FBUyxlQUFlLHNCQUFzQixHQUFHLGlCQUFpQixVQUFVLENBQUMsTUFBTTtBQUNqRixpQkFBYSxVQUFVLEVBQUUsT0FBTztBQUNoQztBQUNBO0VBQ0YsQ0FBQztBQUdELFdBQVMsZUFBZSxvQkFBb0IsR0FBRyxpQkFBaUIsVUFBVSxDQUFDLE1BQU07QUFDL0UsVUFBTSxpQkFBaUIsU0FBUyxlQUFlLGlCQUFpQixFQUFFO0FBQ2xFLFVBQU0sa0JBQWtCLFNBQVMsZUFBZSxrQkFBa0IsRUFBRTtBQUNwRSxVQUFNLE1BQU0sU0FBUyxlQUFlLG1CQUFtQjtBQUV2RCxRQUFJLFdBQVcsRUFBRSxFQUFFLE9BQU8sV0FBVyxrQkFBa0IsbUJBQW1CLG1CQUFtQjtBQUFBLEVBQy9GLENBQUM7QUFFRCxHQUFDLG1CQUFtQixrQkFBa0IsRUFBRSxRQUFRLFFBQU07QUFDcEQsYUFBUyxlQUFlLEVBQUUsR0FBRyxpQkFBaUIsU0FBUyxNQUFNO0FBQzNELFlBQU0sVUFBVSxTQUFTLGVBQWUsb0JBQW9CLEVBQUU7QUFDOUQsWUFBTSxpQkFBaUIsU0FBUyxlQUFlLGlCQUFpQixFQUFFO0FBQ2xFLFlBQU0sa0JBQWtCLFNBQVMsZUFBZSxrQkFBa0IsRUFBRTtBQUNwRSxZQUFNLE1BQU0sU0FBUyxlQUFlLG1CQUFtQjtBQUV2RCxVQUFJLFdBQVcsRUFBRSxXQUFXLGtCQUFrQixtQkFBbUIsbUJBQW1CO0FBQUEsSUFDdEYsQ0FBQztBQUFBLEVBQ0gsQ0FBQztBQUVELFdBQVMsZUFBZSxtQkFBbUIsR0FBRyxpQkFBaUIsU0FBUyxrQkFBa0I7QUFDMUYsV0FBUyxlQUFlLG1CQUFtQixHQUFHLGlCQUFpQixTQUFTLE1BQU0sV0FBVyxjQUFjLENBQUM7QUFDeEcsV0FBUyxlQUFlLHNCQUFzQixHQUFHLGlCQUFpQixTQUFTLE1BQU0sV0FBVyxjQUFjLENBQUM7QUFHM0csV0FBUyxlQUFlLGVBQWUsR0FBRyxpQkFBaUIsVUFBVSxDQUFDLE1BQU07QUFDMUUsVUFBTSxnQkFBZ0IsU0FBUyxlQUFlLHVCQUF1QjtBQUNyRSxVQUFNLGtCQUFrQixTQUFTLGVBQWUseUJBQXlCO0FBRXpFLFFBQUksRUFBRSxPQUFPLFVBQVUsWUFBWTtBQUNqQyxvQkFBYyxVQUFVLE9BQU8sUUFBUTtBQUN2QyxzQkFBZ0IsVUFBVSxJQUFJLFFBQVE7QUFBQSxJQUN4QyxPQUFPO0FBQ0wsb0JBQWMsVUFBVSxJQUFJLFFBQVE7QUFDcEMsc0JBQWdCLFVBQVUsT0FBTyxRQUFRO0FBQUEsSUFDM0M7QUFBQSxFQUNGLENBQUM7QUFFRCxXQUFTLGVBQWUsbUJBQW1CLEdBQUcsaUJBQWlCLFNBQVMsa0JBQWtCO0FBQzFGLFdBQVMsZUFBZSxtQkFBbUIsR0FBRyxpQkFBaUIsU0FBUyxNQUFNLFdBQVcsY0FBYyxDQUFDO0FBQ3hHLFdBQVMsZUFBZSxzQkFBc0IsR0FBRyxpQkFBaUIsU0FBUyxNQUFNLFdBQVcsY0FBYyxDQUFDO0FBRzNHLFdBQVMsZUFBZSxZQUFZLEdBQUcsaUJBQWlCLFNBQVMsWUFBWTtBQUM3RSxXQUFTLGVBQWUsaUJBQWlCLEdBQUcsaUJBQWlCLFlBQVksQ0FBQyxNQUFNO0FBQzlFLFFBQUksRUFBRSxRQUFRLFNBQVM7QUFDckI7SUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUdELFFBQU0sc0JBQXNCLFNBQVMsZUFBZSx1QkFBdUI7QUFDM0UsUUFBTSxzQkFBc0IsU0FBUyxlQUFlLHVCQUF1QjtBQUczRSxXQUFTLGlCQUFpQixxQkFBcUIsRUFBRSxRQUFRLFNBQU87QUFDOUQsVUFBTSxXQUFXLElBQUksYUFBYSxXQUFXO0FBQzdDLFFBQUksVUFBVTtBQUNaLFVBQUksTUFBTSxPQUFPLFFBQVEsT0FBTyxnQkFBZ0IsUUFBUSxFQUFFO0FBQUEsSUFDNUQ7QUFBQSxFQUNGLENBQUM7QUFHRCx1QkFBcUIsaUJBQWlCLFNBQVMsQ0FBQyxNQUFNO0FBQ3BELE1BQUUsZ0JBQWU7QUFDakIsd0JBQW9CLFVBQVUsT0FBTyxRQUFRO0FBQUEsRUFDL0MsQ0FBQztBQUdELFdBQVMsaUJBQWlCLGlCQUFpQixFQUFFLFFBQVEsWUFBVTtBQUM3RCxXQUFPLGlCQUFpQixTQUFTLE9BQU8sTUFBTTtBQUM1QyxRQUFFLGdCQUFlO0FBQ2pCLFlBQU0sVUFBVSxPQUFPLGFBQWEsY0FBYztBQUNsRCxZQUFNLGNBQWMsT0FBTyxjQUFjLE1BQU0sRUFBRTtBQUVqRCxtQkFBYSxVQUFVO0FBQ3ZCLGVBQVMsZUFBZSx1QkFBdUIsRUFBRSxjQUFjO0FBQy9ELDBCQUFvQixVQUFVLElBQUksUUFBUTtBQUUxQztBQUNBO0FBQ0EsWUFBTSxhQUFZO0FBQUEsSUFDcEIsQ0FBQztBQUdELFdBQU8saUJBQWlCLGNBQWMsTUFBTTtBQUMxQyxhQUFPLGNBQWMsTUFBTSxFQUFFLE1BQU0sYUFBYTtBQUFBLElBQ2xELENBQUM7QUFDRCxXQUFPLGlCQUFpQixjQUFjLE1BQU07QUFDMUMsYUFBTyxjQUFjLE1BQU0sRUFBRSxNQUFNLGFBQWE7QUFBQSxJQUNsRCxDQUFDO0FBQUEsRUFDSCxDQUFDO0FBR0QsV0FBUyxpQkFBaUIsU0FBUyxNQUFNO0FBQ3ZDLHlCQUFxQixVQUFVLElBQUksUUFBUTtBQUFBLEVBQzdDLENBQUM7QUFFRCxXQUFTLGVBQWUsZUFBZSxHQUFHLGlCQUFpQixVQUFVLE9BQU8sTUFBTTtBQUNoRixVQUFNLG1CQUFtQixFQUFFLE9BQU87QUFDbEMsUUFBSSxrQkFBa0I7QUFDcEIsVUFBSTtBQUNGLGNBQU0sZ0JBQWdCLGdCQUFnQjtBQUN0QyxjQUFNLFNBQVMsTUFBTTtBQUNyQixxQkFBYSxVQUFVLE9BQU87QUFDOUIsY0FBTSxnQkFBZTtBQUFBLE1BQ3ZCLFNBQVMsT0FBTztBQUNkLGNBQU0sNkJBQTZCLGNBQWMsTUFBTSxPQUFPLENBQUM7QUFBQSxNQUNqRTtBQUFBLElBQ0Y7QUFBQSxFQUNGLENBQUM7QUFFRCxXQUFTLGVBQWUsVUFBVSxHQUFHLGlCQUFpQixTQUFTLFVBQVU7QUFDekUsV0FBUyxlQUFlLGFBQWEsR0FBRyxpQkFBaUIsU0FBUyxZQUFZO0FBQzVFLFVBQU0sZ0JBQWU7QUFBQSxFQUN2QixDQUFDO0FBQ0QsV0FBUyxlQUFlLGNBQWMsR0FBRyxpQkFBaUIsU0FBUyxNQUFNO0FBQ3ZFO0FBQ0EsZUFBVyxpQkFBaUI7QUFBQSxFQUM5QixDQUFDO0FBRUQsV0FBUyxlQUFlLHNCQUFzQixHQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDL0U7QUFDQSxlQUFXLHlCQUF5QjtBQUFBLEVBQ3RDLENBQUM7QUFFRCxXQUFTLGVBQWUsZ0NBQWdDLEdBQUcsaUJBQWlCLFNBQVMsTUFBTTtBQUN6RixlQUFXLGlCQUFpQjtBQUFBLEVBQzlCLENBQUM7QUFFRCxXQUFTLGVBQWUsMkJBQTJCLEdBQUcsaUJBQWlCLFNBQVMsWUFBWTtBQUMxRixVQUFNLG9CQUFtQjtBQUFBLEVBQzNCLENBQUM7QUFFRCxXQUFTLGVBQWUsNEJBQTRCLEdBQUcsaUJBQWlCLFNBQVMsTUFBTTtBQUNyRixRQUFJLFFBQVEseUNBQXlDLEdBQUc7QUFDdEQ7SUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUNELFdBQVMsZUFBZSxrQkFBa0IsR0FBRyxpQkFBaUIsU0FBUyxpQkFBaUI7QUFDeEYsV0FBUyxlQUFlLFVBQVUsR0FBRyxpQkFBaUIsU0FBUyxjQUFjO0FBQzdFLFdBQVMsZUFBZSxhQUFhLEdBQUcsaUJBQWlCLFNBQVMsaUJBQWlCO0FBQ25GLFdBQVMsZUFBZSxZQUFZLEdBQUcsaUJBQWlCLFNBQVMsZ0JBQWdCO0FBQ2pGLFdBQVMsZUFBZSxnQkFBZ0IsR0FBRyxpQkFBaUIsU0FBUyxzQkFBc0I7QUFHM0YsV0FBUyxlQUFlLG9CQUFvQixHQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDN0UsZUFBVyxrQkFBa0I7QUFDN0I7RUFDRixDQUFDO0FBQ0QsV0FBUyxlQUFlLGtCQUFrQixHQUFHLGlCQUFpQixTQUFTLHFCQUFxQjtBQUM1RixXQUFTLGVBQWUsaUJBQWlCLEdBQUcsaUJBQWlCLFNBQVMsTUFBTSxXQUFXLGtCQUFrQixDQUFDO0FBQzFHLFdBQVMsZUFBZSxjQUFjLEdBQUcsaUJBQWlCLFNBQVMsYUFBYTtBQUNoRixXQUFTLGVBQWUsbUJBQW1CLEdBQUcsaUJBQWlCLFVBQVUsaUJBQWlCO0FBRzFGLFdBQVMsZUFBZSx1QkFBdUIsR0FBRyxpQkFBaUIsU0FBUyxNQUFNLFdBQVcsa0JBQWtCLENBQUM7QUFDaEgsV0FBUyxlQUFlLDBCQUEwQixHQUFHLGlCQUFpQixTQUFTLHdCQUF3QjtBQUd2RyxXQUFTLGVBQWUsc0JBQXNCLEdBQUcsaUJBQWlCLFNBQVMsTUFBTSxXQUFXLGtCQUFrQixDQUFDO0FBQy9HLFdBQVMsZUFBZSxzQkFBc0IsR0FBRyxpQkFBaUIsU0FBUyxpQkFBaUI7QUFHNUYsV0FBUyxlQUFlLDZCQUE2QixHQUFHLGlCQUFpQixTQUFTLFlBQVk7QUFDNUYsZUFBVyxlQUFlO0FBQzFCLFVBQU0sbUJBQWtCO0FBQUEsRUFDMUIsQ0FBQztBQUNELFdBQVMsZUFBZSw0QkFBNEIsR0FBRyxpQkFBaUIsU0FBUyw2QkFBNkI7QUFDOUcsV0FBUyxlQUFlLG9CQUFvQixHQUFHLGlCQUFpQixTQUFTLGtCQUFrQjtBQUMzRixXQUFTLGVBQWUsZ0JBQWdCLEdBQUcsaUJBQWlCLFNBQVMsZUFBZTtBQUNwRixXQUFTLGVBQWUsNkJBQTZCLEdBQUcsaUJBQWlCLFVBQVUsdUJBQXVCO0FBRzFHLFdBQVMsZUFBZSxzQkFBc0IsR0FBRyxpQkFBaUIsU0FBUyxzQkFBc0I7QUFDakcsV0FBUyxlQUFlLDBCQUEwQixHQUFHLGlCQUFpQixTQUFTLE1BQU0sV0FBVyxrQkFBa0IsQ0FBQztBQUNuSCxXQUFTLGVBQWUsZ0JBQWdCLEdBQUcsaUJBQWlCLFNBQVMsTUFBTSx5QkFBeUIsS0FBSyxDQUFDO0FBQzFHLFdBQVMsZUFBZSxvQkFBb0IsR0FBRyxpQkFBaUIsU0FBUyxNQUFNLHlCQUF5QixTQUFTLENBQUM7QUFDbEgsV0FBUyxlQUFlLHNCQUFzQixHQUFHLGlCQUFpQixTQUFTLE1BQU0seUJBQXlCLFdBQVcsQ0FBQztBQUN0SCxXQUFTLGVBQWUsc0JBQXNCLEdBQUcsaUJBQWlCLFNBQVMsNkJBQTZCO0FBR3hHLFdBQVMsZUFBZSwwQkFBMEIsR0FBRyxpQkFBaUIsU0FBUyxNQUFNLFdBQVcsbUJBQW1CLENBQUM7QUFDcEgsV0FBUyxlQUFlLGtCQUFrQixHQUFHLGlCQUFpQixTQUFTLFlBQVk7QUFDakYsVUFBTSxPQUFPLFNBQVMsZUFBZSxnQkFBZ0IsRUFBRTtBQUN2RCxRQUFJO0FBQ0YsWUFBTSxVQUFVLFVBQVUsVUFBVSxJQUFJO0FBQ3hDLFlBQU0sTUFBTSxTQUFTLGVBQWUsa0JBQWtCO0FBQ3RELFlBQU0sZUFBZSxJQUFJO0FBQ3pCLFVBQUksY0FBYztBQUNsQixpQkFBVyxNQUFNO0FBQ2YsWUFBSSxjQUFjO0FBQUEsTUFDcEIsR0FBRyxHQUFJO0FBQUEsSUFDVCxTQUFTLE9BQU87QUFDZCxZQUFNLHFCQUFxQjtBQUFBLElBQzdCO0FBQUEsRUFDRixDQUFDO0FBQ0QsV0FBUyxlQUFlLGlCQUFpQixHQUFHLGlCQUFpQixTQUFTLHdCQUF3QjtBQUM5RixXQUFTLGVBQWUsZUFBZSxHQUFHLGlCQUFpQixTQUFTLHVCQUF1QjtBQUMzRixXQUFTLGVBQWUsdUJBQXVCLEdBQUcsaUJBQWlCLFNBQVMsd0JBQXdCO0FBR3BHLFdBQVMsZUFBZSwwQkFBMEIsR0FBRyxpQkFBaUIsU0FBUyxNQUFNO0FBQ25GLGFBQVMsZUFBZSxtQkFBbUIsRUFBRSxVQUFVLElBQUksUUFBUTtBQUFBLEVBQ3JFLENBQUM7QUFDRCxXQUFTLGVBQWUscUJBQXFCLEdBQUcsaUJBQWlCLFNBQVMsTUFBTTtBQUM5RSxhQUFTLGVBQWUsbUJBQW1CLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFBQSxFQUNyRSxDQUFDO0FBQ0QsV0FBUyxlQUFlLHNCQUFzQixHQUFHLGlCQUFpQixTQUFTLGNBQWM7QUFDekYsV0FBUyxlQUFlLHVCQUF1QixHQUFHLGlCQUFpQixTQUFTLGdCQUFnQjtBQUc1RixXQUFTLGVBQWUsd0JBQXdCLEdBQUcsaUJBQWlCLFNBQVMsTUFBTTtBQUNqRixhQUFTLGVBQWUsaUJBQWlCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFBQSxFQUNuRSxDQUFDO0FBQ0QsV0FBUyxlQUFlLGtCQUFrQixHQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDM0UsYUFBUyxlQUFlLGlCQUFpQixFQUFFLFVBQVUsSUFBSSxRQUFRO0FBQUEsRUFDbkUsQ0FBQztBQUNELFdBQVMsZUFBZSxvQkFBb0IsR0FBRyxpQkFBaUIsU0FBUyx3QkFBd0I7QUFDakcsV0FBUyxlQUFlLDhCQUE4QixHQUFHLGlCQUFpQixTQUFTLHNCQUFzQjtBQUd6RyxXQUFTLGVBQWUsMEJBQTBCLEdBQUcsaUJBQWlCLFNBQVMsdUJBQXVCO0FBQ3RHLFdBQVMsZUFBZSxzQkFBc0IsR0FBRyxpQkFBaUIsU0FBUyxtQkFBbUI7QUFDOUYsV0FBUyxlQUFlLHVCQUF1QixHQUFHLGlCQUFpQixTQUFTLG9CQUFvQjtBQUdoRyxXQUFTLGVBQWUscUJBQXFCLEdBQUcsaUJBQWlCLFNBQVMsTUFBTTtBQUM5RSxhQUFTLGVBQWUsaUJBQWlCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFBQSxFQUNuRSxDQUFDO0FBQ0QsV0FBUyxlQUFlLHNCQUFzQixHQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDL0UsYUFBUyxlQUFlLGlCQUFpQixFQUFFLFVBQVUsSUFBSSxRQUFRO0FBQUEsRUFDbkUsQ0FBQztBQUNELFdBQVMsZUFBZSx1QkFBdUIsR0FBRyxpQkFBaUIsU0FBUyxvQkFBb0I7QUFDaEcsV0FBUyxlQUFlLHFCQUFxQixHQUFHLGlCQUFpQixTQUFTLHVCQUF1QjtBQUdqRyxXQUFTLGVBQWUsd0JBQXdCLEdBQUcsaUJBQWlCLFNBQVMsTUFBTSxXQUFXLGtCQUFrQixDQUFDO0FBQ2pILFdBQVMsZUFBZSxlQUFlLEdBQUcsaUJBQWlCLFVBQVUsQ0FBQyxNQUFNO0FBQzFFLGlCQUFhLFNBQVMsUUFBUSxFQUFFLE9BQU87QUFDdkM7QUFDQTtFQUNGLENBQUM7QUFDRCxXQUFTLGVBQWUsa0JBQWtCLEdBQUcsaUJBQWlCLFVBQVUsQ0FBQyxNQUFNO0FBQzdFLGlCQUFhLFNBQVMsZ0JBQWdCLFNBQVMsRUFBRSxPQUFPLEtBQUs7QUFDN0Q7QUFDQTtFQUNGLENBQUM7QUFDRCxXQUFTLGVBQWUsa0JBQWtCLEdBQUcsaUJBQWlCLFVBQVUsQ0FBQyxNQUFNO0FBQzdFLGlCQUFhLFNBQVMsa0JBQWtCLFNBQVMsRUFBRSxPQUFPLEtBQUs7QUFDL0Q7RUFDRixDQUFDO0FBQ0QsV0FBUyxlQUFlLHVCQUF1QixHQUFHLGlCQUFpQixVQUFVLENBQUMsTUFBTTtBQUNsRixVQUFNLFFBQVEsV0FBVyxFQUFFLE9BQU8sS0FBSztBQUV2QyxRQUFJLE1BQU0sS0FBSyxLQUFLLFNBQVMsR0FBRztBQUM5QixZQUFNLHFDQUFxQztBQUMzQyxRQUFFLE9BQU8sUUFBUSxhQUFhLFNBQVMsbUJBQW1CO0FBQzFEO0FBQUEsSUFDRjtBQUVBLFFBQUksUUFBUSxLQUFRO0FBQ2xCLFlBQU0sWUFBWTtBQUFBLFFBQ2hCLDhKQUV3QyxRQUFRO0FBQUEsTUFDeEQ7QUFDTSxVQUFJLENBQUMsV0FBVztBQUNkLFVBQUUsT0FBTyxRQUFRLGFBQWEsU0FBUyxtQkFBbUI7QUFDMUQ7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUNBLGlCQUFhLFNBQVMsa0JBQWtCO0FBQ3hDO0VBQ0YsQ0FBQztBQUNELFdBQVMsZUFBZSx1QkFBdUIsR0FBRyxpQkFBaUIsVUFBVSxDQUFDLE1BQU07QUFDbEYsaUJBQWEsU0FBUyxtQkFBbUIsRUFBRSxPQUFPO0FBQ2xEO0FBQ0E7RUFDRixDQUFDO0FBQ0QsV0FBUyxlQUFlLHdCQUF3QixHQUFHLGlCQUFpQixVQUFVLENBQUMsTUFBTTtBQUVuRixRQUFJLEVBQUUsT0FBTyxTQUFTO0FBQ3BCLFlBQU0sWUFBWTtBQUFBLFFBQ2hCO0FBQUEsTUFRUjtBQUVNLFVBQUksQ0FBQyxXQUFXO0FBRWQsVUFBRSxPQUFPLFVBQVU7QUFDbkI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUVBLGlCQUFhLFNBQVMsZUFBZSxFQUFFLE9BQU87QUFDOUM7RUFDRixDQUFDO0FBQ0QsV0FBUyxlQUFlLGVBQWUsR0FBRyxpQkFBaUIsU0FBUyxjQUFjO0FBQ2xGLFdBQVMsZUFBZSxnQkFBZ0IsR0FBRyxpQkFBaUIsU0FBUyxlQUFlO0FBQ3BGLFdBQVMsZUFBZSwyQkFBMkIsR0FBRyxpQkFBaUIsU0FBUyx3QkFBd0I7QUFHeEcsV0FBUyxlQUFlLDZCQUE2QixHQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDdEYsVUFBTSxXQUFXLFNBQVMsZUFBZSx1QkFBdUIsRUFBRTtBQUNsRSxRQUFJLFVBQVU7QUFDWiwwQkFBb0IsUUFBUTtBQUFBLElBQzlCO0FBQUEsRUFDRixDQUFDO0FBRUQsV0FBUyxlQUFlLDRCQUE0QixHQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDckYsd0JBQW9CLElBQUk7QUFBQSxFQUMxQixDQUFDO0FBRUQsV0FBUyxlQUFlLDJCQUEyQixHQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDcEYsd0JBQW9CLElBQUk7QUFBQSxFQUMxQixDQUFDO0FBRUQsV0FBUyxlQUFlLHVCQUF1QixHQUFHLGlCQUFpQixZQUFZLENBQUMsTUFBTTtBQUNwRixRQUFJLEVBQUUsUUFBUSxTQUFTO0FBQ3JCLFlBQU0sV0FBVyxTQUFTLGVBQWUsdUJBQXVCLEVBQUU7QUFDbEUsVUFBSSxVQUFVO0FBQ1osNEJBQW9CLFFBQVE7QUFBQSxNQUM5QjtBQUFBLElBQ0Y7QUFBQSxFQUNGLENBQUM7QUFHRCxXQUFTLGVBQWUsMEJBQTBCLEdBQUcsaUJBQWlCLFNBQVMsZ0JBQWdCO0FBQy9GLFdBQVMsZUFBZSw4QkFBOEIsR0FBRyxpQkFBaUIsU0FBUyxnQkFBZ0I7QUFFbkcsV0FBUyxlQUFlLGlCQUFpQixHQUFHLGlCQUFpQixTQUFTLFlBQVk7QUFDaEYsVUFBTSxTQUFTLFNBQVMsZUFBZSx3QkFBd0IsRUFBRTtBQUNqRSxRQUFJO0FBQ0YsWUFBTSxVQUFVLFVBQVUsVUFBVSxNQUFNO0FBQzFDLFlBQU0sTUFBTSxTQUFTLGVBQWUsaUJBQWlCO0FBQ3JELFlBQU0sZUFBZSxJQUFJO0FBQ3pCLFVBQUksY0FBYztBQUNsQixVQUFJLFVBQVUsSUFBSSxjQUFjO0FBQ2hDLGlCQUFXLE1BQU07QUFDZixZQUFJLGNBQWM7QUFDbEIsWUFBSSxVQUFVLE9BQU8sY0FBYztBQUFBLE1BQ3JDLEdBQUcsR0FBSTtBQUFBLElBQ1QsU0FBUyxPQUFPO0FBQ2QsWUFBTSw2QkFBNkI7QUFBQSxJQUNyQztBQUFBLEVBQ0YsQ0FBQztBQUdELFdBQVMsZUFBZSxvQkFBb0IsR0FBRyxpQkFBaUIsU0FBUyxtQkFBbUI7QUFDNUYsV0FBUyxlQUFlLDhCQUE4QixHQUFHLGlCQUFpQixTQUFTLE1BQU0sV0FBVyxpQkFBaUIsQ0FBQztBQUd0SCxXQUFTLGVBQWUsNkJBQTZCLEdBQUcsaUJBQWlCLFNBQVMsa0JBQWtCO0FBQ3BHLFdBQVMsZUFBZSx5QkFBeUIsR0FBRyxpQkFBaUIsU0FBUyxrQkFBa0I7QUFHaEcsV0FBUyxlQUFlLDBCQUEwQixHQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDbkYsYUFBUyxlQUFlLGtCQUFrQixFQUFFLFVBQVUsSUFBSSxRQUFRO0FBQ2xFO0FBQ0EsYUFBUyxlQUFlLDJCQUEyQixFQUFFLFVBQVUsT0FBTyxRQUFRO0FBQUEsRUFDaEYsQ0FBQztBQUVELFdBQVMsZUFBZSw0QkFBNEIsR0FBRyxpQkFBaUIsU0FBUyxNQUFNO0FBQ3JGLGFBQVMsZUFBZSxrQkFBa0IsRUFBRSxVQUFVLElBQUksUUFBUTtBQUNsRSxhQUFTLGVBQWUseUJBQXlCLEVBQUUsVUFBVSxPQUFPLFFBQVE7QUFBQSxFQUM5RSxDQUFDO0FBRUQsV0FBUyxlQUFlLDhCQUE4QixHQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDdkYsYUFBUyxlQUFlLGtCQUFrQixFQUFFLFVBQVUsSUFBSSxRQUFRO0FBQ2xFLGFBQVMsZUFBZSx3QkFBd0IsRUFBRSxVQUFVLE9BQU8sUUFBUTtBQUFBLEVBQzdFLENBQUM7QUFFRCxXQUFTLGVBQWUsc0JBQXNCLEdBQUcsaUJBQWlCLFNBQVMsTUFBTTtBQUMvRSxhQUFTLGVBQWUsa0JBQWtCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFBQSxFQUNwRSxDQUFDO0FBR0QsV0FBUyxlQUFlLGlDQUFpQyxHQUFHLGlCQUFpQixTQUFTLDBCQUEwQjtBQUNoSCxXQUFTLGVBQWUsZ0NBQWdDLEdBQUcsaUJBQWlCLFNBQVMsTUFBTTtBQUN6RixhQUFTLGVBQWUsMkJBQTJCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFDM0UsYUFBUyxlQUFlLDJCQUEyQixFQUFFLFFBQVE7QUFDN0QsYUFBUyxlQUFlLHFCQUFxQixFQUFFLFFBQVE7QUFDdkQsYUFBUyxlQUFlLHFCQUFxQixFQUFFLFFBQVE7QUFDdkQsYUFBUyxlQUFlLHFCQUFxQixFQUFFLFFBQVE7QUFDdkQsYUFBUyxlQUFlLDBCQUEwQixFQUFFLFVBQVUsSUFBSSxRQUFRO0FBQUEsRUFDNUUsQ0FBQztBQUNELFdBQVMsZUFBZSwrQkFBK0IsR0FBRyxpQkFBaUIsU0FBUyxNQUFNO0FBQ3hGLGFBQVMsZUFBZSwyQkFBMkIsRUFBRSxVQUFVLElBQUksUUFBUTtBQUMzRSxhQUFTLGVBQWUsMkJBQTJCLEVBQUUsUUFBUTtBQUM3RCxhQUFTLGVBQWUscUJBQXFCLEVBQUUsUUFBUTtBQUN2RCxhQUFTLGVBQWUscUJBQXFCLEVBQUUsUUFBUTtBQUN2RCxhQUFTLGVBQWUscUJBQXFCLEVBQUUsUUFBUTtBQUN2RCxhQUFTLGVBQWUsMEJBQTBCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFBQSxFQUM1RSxDQUFDO0FBR0QsV0FBUyxlQUFlLCtCQUErQixHQUFHLGlCQUFpQixTQUFTLHFCQUFxQjtBQUN6RyxXQUFTLGVBQWUsOEJBQThCLEdBQUcsaUJBQWlCLFNBQVMsTUFBTTtBQUN2RixhQUFTLGVBQWUseUJBQXlCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFDekUsYUFBUyxlQUFlLDRCQUE0QixFQUFFLFFBQVE7QUFDOUQsYUFBUyxlQUFlLDBCQUEwQixFQUFFLFFBQVE7QUFBQSxFQUM5RCxDQUFDO0FBQ0QsV0FBUyxlQUFlLDZCQUE2QixHQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDdEYsYUFBUyxlQUFlLHlCQUF5QixFQUFFLFVBQVUsSUFBSSxRQUFRO0FBQ3pFLGFBQVMsZUFBZSw0QkFBNEIsRUFBRSxRQUFRO0FBQzlELGFBQVMsZUFBZSwwQkFBMEIsRUFBRSxRQUFRO0FBQUEsRUFDOUQsQ0FBQztBQUdELFdBQVMsZUFBZSw4QkFBOEIsR0FBRyxpQkFBaUIsU0FBUyxvQkFBb0I7QUFDdkcsV0FBUyxlQUFlLDZCQUE2QixHQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDdEYsYUFBUyxlQUFlLHdCQUF3QixFQUFFLFVBQVUsSUFBSSxRQUFRO0FBQ3hFLGFBQVMsZUFBZSwyQkFBMkIsRUFBRSxRQUFRO0FBQzdELGFBQVMsZUFBZSwwQkFBMEIsRUFBRSxRQUFRO0FBQUEsRUFDOUQsQ0FBQztBQUNELFdBQVMsZUFBZSw0QkFBNEIsR0FBRyxpQkFBaUIsU0FBUyxNQUFNO0FBQ3JGLGFBQVMsZUFBZSx3QkFBd0IsRUFBRSxVQUFVLElBQUksUUFBUTtBQUN4RSxhQUFTLGVBQWUsMkJBQTJCLEVBQUUsUUFBUTtBQUM3RCxhQUFTLGVBQWUsMEJBQTBCLEVBQUUsUUFBUTtBQUFBLEVBQzlELENBQUM7QUFHRCxXQUFTLGVBQWUsMkJBQTJCLEdBQUcsaUJBQWlCLFNBQVMseUJBQXlCO0FBQ3pHLFdBQVMsZUFBZSwwQkFBMEIsR0FBRyxpQkFBaUIsU0FBUyxNQUFNO0FBQ25GLGFBQVMsZUFBZSxxQkFBcUIsRUFBRSxVQUFVLElBQUksUUFBUTtBQUNyRSw0QkFBd0I7QUFBQSxFQUMxQixDQUFDO0FBQ0QsV0FBUyxlQUFlLHlCQUF5QixHQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDbEYsYUFBUyxlQUFlLHFCQUFxQixFQUFFLFVBQVUsSUFBSSxRQUFRO0FBQ3JFLDRCQUF3QjtBQUFBLEVBQzFCLENBQUM7QUFHRCxXQUFTLGVBQWUsc0JBQXNCLEdBQUcsaUJBQWlCLFNBQVMsTUFBTTtBQUMvRSxhQUFTLGVBQWUsa0JBQWtCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFBQSxFQUNwRSxDQUFDO0FBQ0QsV0FBUyxlQUFlLG1CQUFtQixHQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDNUUsYUFBUyxlQUFlLGtCQUFrQixFQUFFLFVBQVUsSUFBSSxRQUFRO0FBQUEsRUFDcEUsQ0FBQztBQUNELFdBQVMsZUFBZSxrQkFBa0IsR0FBRyxpQkFBaUIsU0FBUyxZQUFZO0FBQ2pGLFFBQUk7QUFDRixZQUFNLFNBQVMsU0FBUyxlQUFlLGlCQUFpQixFQUFFO0FBQzFELFlBQU0sVUFBVSxVQUFVLFVBQVUsTUFBTTtBQUMxQyxZQUFNLE1BQU0sU0FBUyxlQUFlLGtCQUFrQjtBQUN0RCxZQUFNLGVBQWUsSUFBSTtBQUN6QixVQUFJLGNBQWM7QUFDbEIsaUJBQVcsTUFBTTtBQUNmLFlBQUksY0FBYztBQUFBLE1BQ3BCLEdBQUcsR0FBSTtBQUFBLElBQ1QsU0FBUyxPQUFPO0FBQ2QsWUFBTSxpQ0FBaUM7QUFBQSxJQUN6QztBQUFBLEVBQ0YsQ0FBQztBQUdELFdBQVMsZUFBZSx3QkFBd0IsR0FBRyxpQkFBaUIsU0FBUyxNQUFNO0FBQ2pGLFFBQUksQ0FBQyxvQkFBcUI7QUFDMUIsVUFBTSxNQUFNLGVBQWUsYUFBYSxTQUFTLE1BQU0sbUJBQW1CO0FBQzFFLFdBQU8sS0FBSyxPQUFPLEVBQUUsSUFBRyxDQUFFO0FBQUEsRUFDNUIsQ0FBQztBQUVELFdBQVMsZUFBZSxxQkFBcUIsR0FBRyxpQkFBaUIsU0FBUyxNQUFNO0FBQzlFLFlBQVEsSUFBSSx5QkFBeUI7QUFDckMsUUFBSSxzQkFBc0I7QUFDeEIsb0JBQWMsb0JBQW9CO0FBQ2xDLDZCQUF1QjtBQUFBLElBQ3pCO0FBQ0EsV0FBTyxNQUFLO0FBQUEsRUFDZCxDQUFDO0FBRUQsV0FBUyxlQUFlLHdCQUF3QixHQUFHLGlCQUFpQixTQUFTLFlBQVk7QUFDdkYsUUFBSSxDQUFDLHVCQUF1QixDQUFDLHVCQUF3QjtBQUVyRCxRQUFJO0FBRUYsWUFBTSxhQUFhLE1BQU0sT0FBTyxRQUFRLFlBQVk7QUFBQSxRQUNsRCxNQUFNO0FBQUEsUUFDTixTQUFTO0FBQUEsUUFDVCxRQUFRO0FBQUEsTUFDaEIsQ0FBTztBQUVELFVBQUksQ0FBQyxXQUFXLFdBQVcsQ0FBQyxXQUFXLGFBQWE7QUFDbEQsY0FBTSxvQ0FBb0M7QUFDMUM7QUFBQSxNQUNGO0FBRUEsWUFBTSxLQUFLLFdBQVc7QUFHdEIsd0JBQWtCLFNBQVM7QUFDM0Isd0JBQWtCLFVBQVU7QUFDNUIsd0JBQWtCLFVBQVUsR0FBRztBQUMvQix3QkFBa0IsbUJBQW1CLEdBQUc7QUFHeEMsZUFBUyxlQUFlLG1CQUFtQixFQUFFLFVBQVUsT0FBTyxRQUFRO0FBQ3RFLFlBQU0saUJBQWdCO0FBQUEsSUFFeEIsU0FBUyxPQUFPO0FBQ2QsY0FBUSxNQUFNLGlDQUFpQyxLQUFLO0FBQ3BELFlBQU0sMEJBQTBCO0FBQUEsSUFDbEM7QUFBQSxFQUNGLENBQUM7QUFFRCxXQUFTLGVBQWUsc0JBQXNCLEdBQUcsaUJBQWlCLFNBQVMsWUFBWTtBQUNyRixRQUFJLENBQUMsdUJBQXVCLENBQUMsdUJBQXdCO0FBRXJELFFBQUk7QUFFRixZQUFNLGFBQWEsTUFBTSxPQUFPLFFBQVEsWUFBWTtBQUFBLFFBQ2xELE1BQU07QUFBQSxRQUNOLFNBQVM7QUFBQSxRQUNULFFBQVE7QUFBQSxNQUNoQixDQUFPO0FBRUQsVUFBSSxDQUFDLFdBQVcsV0FBVyxDQUFDLFdBQVcsYUFBYTtBQUNsRCxjQUFNLG9DQUFvQztBQUMxQztBQUFBLE1BQ0Y7QUFFQSxZQUFNLEtBQUssV0FBVztBQUd0Qix1QkFBaUIsU0FBUztBQUMxQix1QkFBaUIsVUFBVTtBQUMzQix1QkFBaUIsVUFBVSxHQUFHO0FBQzlCLHVCQUFpQixtQkFBbUIsR0FBRztBQUd2QyxlQUFTLGVBQWUsaUJBQWlCLEVBQUUsVUFBVSxPQUFPLFFBQVE7QUFDcEUsWUFBTSx1QkFBc0I7QUFBQSxJQUM5QixTQUFTLE9BQU87QUFDZCxjQUFRLE1BQU0sK0JBQStCLEtBQUs7QUFDbEQsWUFBTSwwQkFBMEI7QUFBQSxJQUNsQztBQUFBLEVBQ0YsQ0FBQztBQUdELFdBQVMsaUJBQWlCLFNBQVMsa0JBQWtCO0FBQ3JELFdBQVMsaUJBQWlCLFlBQVksa0JBQWtCO0FBQ3hELFdBQVMsaUJBQWlCLFVBQVUsa0JBQWtCO0FBQ3hEO0FBR0EsSUFBSSxvQkFBb0I7QUFDeEIsSUFBSSxvQkFBb0I7QUFFeEIsZUFBZSxzQkFBc0I7QUFDbkMsTUFBSTtBQUVGLFVBQU0sRUFBRSxPQUFNLElBQUssTUFBSztBQUFBLHNCQUFBQyxZQUFBLE1BQUMsT0FBTyxZQUFRO0FBQUEsdUJBQUFBLFFBQUE7QUFBQTtBQUd4QyxVQUFNLGVBQWUsT0FBTyxPQUFPLGFBQVk7QUFDL0Msd0JBQW9CLGFBQWEsU0FBUztBQUcxQyxhQUFTLGVBQWUsa0JBQWtCLEVBQUUsY0FBYztBQUcxRCxVQUFNLFFBQVEsa0JBQWtCLE1BQU0sR0FBRztBQUN6QyxVQUFNLGNBQWMsSUFBSSxXQUFXLENBQUM7QUFDcEMsV0FBTyxnQkFBZ0IsV0FBVztBQUNsQyxVQUFNLFVBQVU7QUFBQSxNQUNkLFlBQVksQ0FBQyxJQUFJO0FBQUE7QUFBQSxNQUNqQixJQUFLLFlBQVksQ0FBQyxJQUFJO0FBQUE7QUFBQSxNQUN0QixJQUFLLFlBQVksQ0FBQyxJQUFJO0FBQUE7QUFBQSxJQUM1QjtBQUVJLHdCQUFvQixRQUFRLElBQUksUUFBTSxFQUFFLE9BQU8sR0FBRyxNQUFNLE1BQU0sQ0FBQyxFQUFDLEVBQUc7QUFHbkUsYUFBUyxlQUFlLG1CQUFtQixFQUFFLGNBQWUsa0JBQWtCLENBQUMsRUFBRSxRQUFRO0FBQ3pGLGFBQVMsZUFBZSxtQkFBbUIsRUFBRSxjQUFlLGtCQUFrQixDQUFDLEVBQUUsUUFBUTtBQUN6RixhQUFTLGVBQWUsbUJBQW1CLEVBQUUsY0FBZSxrQkFBa0IsQ0FBQyxFQUFFLFFBQVE7QUFHekYsYUFBUyxlQUFlLGVBQWUsRUFBRSxRQUFRO0FBQ2pELGFBQVMsZUFBZSxlQUFlLEVBQUUsUUFBUTtBQUNqRCxhQUFTLGVBQWUsZUFBZSxFQUFFLFFBQVE7QUFDakQsYUFBUyxlQUFlLG9CQUFvQixFQUFFLFVBQVUsSUFBSSxRQUFRO0FBQUEsRUFDdEUsU0FBUyxPQUFPO0FBQ2QsWUFBUSxNQUFNLDhCQUE4QixLQUFLO0FBQ2pELGFBQVMsZUFBZSxrQkFBa0IsRUFBRSxjQUFjO0FBQUEsRUFDNUQ7QUFDRjtBQUVBLGVBQWUscUJBQXFCO0FBQ2xDLFFBQU0sV0FBVyxTQUFTLGVBQWUsaUJBQWlCLEVBQUU7QUFDNUQsUUFBTSxrQkFBa0IsU0FBUyxlQUFlLGtCQUFrQixFQUFFO0FBQ3BFLFFBQU0sV0FBVyxTQUFTLGVBQWUsY0FBYztBQUN2RCxRQUFNLHVCQUF1QixTQUFTLGVBQWUsb0JBQW9CO0FBR3pFLE1BQUksYUFBYSxpQkFBaUI7QUFDaEMsYUFBUyxjQUFjO0FBQ3ZCLGFBQVMsVUFBVSxPQUFPLFFBQVE7QUFDbEM7QUFBQSxFQUNGO0FBR0EsTUFBSSxDQUFDLG1CQUFtQjtBQUN0QixhQUFTLGNBQWM7QUFDdkIsYUFBUyxVQUFVLE9BQU8sUUFBUTtBQUNsQztBQUFBLEVBQ0Y7QUFHQSxRQUFNLFFBQVEsU0FBUyxlQUFlLGVBQWUsRUFBRSxNQUFNLE9BQU87QUFDcEUsUUFBTSxRQUFRLFNBQVMsZUFBZSxlQUFlLEVBQUUsTUFBTSxPQUFPO0FBQ3BFLFFBQU0sUUFBUSxTQUFTLGVBQWUsZUFBZSxFQUFFLE1BQU0sT0FBTztBQUVwRSxNQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxPQUFPO0FBQzlCLHlCQUFxQixjQUFjO0FBQ25DLHlCQUFxQixVQUFVLE9BQU8sUUFBUTtBQUM5QztBQUFBLEVBQ0Y7QUFFQSxNQUFJLFVBQVUsa0JBQWtCLENBQUMsRUFBRSxLQUFLLFlBQVcsS0FDL0MsVUFBVSxrQkFBa0IsQ0FBQyxFQUFFLEtBQUssWUFBVyxLQUMvQyxVQUFVLGtCQUFrQixDQUFDLEVBQUUsS0FBSyxZQUFXLEdBQUk7QUFDckQseUJBQXFCLGNBQWM7QUFDbkMseUJBQXFCLFVBQVUsT0FBTyxRQUFRO0FBQzlDO0FBQUEsRUFDRjtBQUVBLE1BQUk7QUFDRixhQUFTLFVBQVUsSUFBSSxRQUFRO0FBQy9CLHlCQUFxQixVQUFVLElBQUksUUFBUTtBQUczQyxVQUFNLEVBQUUsUUFBTyxJQUFLLE1BQU0sbUJBQW1CLG1CQUFtQixRQUFRO0FBR3hFLFVBQU0sOEJBQThCO0FBQ3BDLGlCQUFhLFVBQVU7QUFDdkIsaUJBQWEsYUFBYTtBQUMxQixpQkFBYSxtQkFBbUIsS0FBSztBQUdyQztBQUdBLHdCQUFvQjtBQUNwQix3QkFBb0I7QUFFcEIsZUFBVyxrQkFBa0I7QUFDN0I7RUFDRixTQUFTLE9BQU87QUFDZCxhQUFTLGNBQWMsTUFBTTtBQUM3QixhQUFTLFVBQVUsT0FBTyxRQUFRO0FBQUEsRUFDcEM7QUFDRjtBQUdBLGVBQWUscUJBQXFCO0FBQ2xDLFFBQU0sU0FBUyxTQUFTLGVBQWUsZUFBZSxFQUFFO0FBQ3hELFFBQU0sV0FBVyxTQUFTLGVBQWUsaUJBQWlCLEVBQUU7QUFDNUQsUUFBTSxrQkFBa0IsU0FBUyxlQUFlLHlCQUF5QixFQUFFO0FBQzNFLFFBQU0sV0FBVyxTQUFTLGVBQWUsY0FBYztBQUd2RCxNQUFJLGFBQWEsaUJBQWlCO0FBQ2hDLGFBQVMsY0FBYztBQUN2QixhQUFTLFVBQVUsT0FBTyxRQUFRO0FBQ2xDO0FBQUEsRUFDRjtBQUVBLE1BQUk7QUFDRixhQUFTLFVBQVUsSUFBSSxRQUFRO0FBRS9CLFFBQUk7QUFDSixRQUFJLFdBQVcsWUFBWTtBQUN6QixZQUFNLFdBQVcsU0FBUyxlQUFlLGlCQUFpQixFQUFFO0FBQzVELFlBQU0sU0FBUyxNQUFNLG1CQUFtQixVQUFVLFFBQVE7QUFDMUQsZ0JBQVUsT0FBTztBQUFBLElBQ25CLE9BQU87QUFDTCxZQUFNLGFBQWEsU0FBUyxlQUFlLG1CQUFtQixFQUFFO0FBQ2hFLFlBQU0sU0FBUyxNQUFNLHFCQUFxQixZQUFZLFFBQVE7QUFDOUQsZ0JBQVUsT0FBTztBQUFBLElBQ25CO0FBR0EsVUFBTSwrQkFBK0I7QUFDckMsaUJBQWEsVUFBVTtBQUN2QixpQkFBYSxhQUFhO0FBQzFCLGVBQVcsa0JBQWtCO0FBQzdCO0VBQ0YsU0FBUyxPQUFPO0FBQ2QsYUFBUyxjQUFjLE1BQU07QUFDN0IsYUFBUyxVQUFVLE9BQU8sUUFBUTtBQUFBLEVBQ3BDO0FBQ0Y7QUFHQSxlQUFlLGVBQWU7QUFDNUIsUUFBTSxXQUFXLFNBQVMsZUFBZSxpQkFBaUIsRUFBRTtBQUM1RCxRQUFNLFdBQVcsU0FBUyxlQUFlLGNBQWM7QUFHdkQsUUFBTSxjQUFjLE1BQU07QUFDMUIsTUFBSSxZQUFZLGFBQWE7QUFDM0IsVUFBTSxtQkFBbUIsS0FBSyxLQUFLLFlBQVksY0FBYyxNQUFPLEVBQUU7QUFDdEUsYUFBUyxjQUFjLHlDQUF5QyxnQkFBZ0I7QUFDaEYsYUFBUyxVQUFVLE9BQU8sUUFBUTtBQUNsQztBQUFBLEVBQ0Y7QUFFQSxNQUFJO0FBQ0YsYUFBUyxVQUFVLElBQUksUUFBUTtBQUcvQixVQUFNLEVBQUUsU0FBUyxRQUFRLFVBQVUsa0JBQWtCLGdCQUFlLElBQUssTUFBTSxhQUFhLFVBQVU7QUFBQSxNQUNwRyxnQkFBZ0IsQ0FBQyxTQUFTO0FBQ3hCLGdCQUFRLElBQUksd0NBQXdDLEtBQUssa0JBQWtCLGVBQWMsQ0FBRSxNQUFNLEtBQUssc0JBQXNCLGVBQWMsQ0FBRSxhQUFhO0FBRXpKLGNBQU0sWUFBWSxTQUFTLGNBQWMsS0FBSztBQUM5QyxrQkFBVSxZQUFZO0FBQ3RCLGtCQUFVLGNBQWMsbUNBQW1DLEtBQUssc0JBQXNCLGVBQWMsQ0FBRTtBQUN0RyxpQkFBUyxjQUFjLGFBQWEsV0FBVyxRQUFRO0FBQ3ZELG1CQUFXLE1BQU0sVUFBVSxPQUFNLEdBQUksR0FBSTtBQUFBLE1BQzNDO0FBQUEsSUFDTixDQUFLO0FBR0QsUUFBSSxVQUFVO0FBQ1osY0FBUSxJQUFJLHNCQUFzQixpQkFBaUIsZUFBYyxDQUFFLE1BQU0sZ0JBQWdCLGdCQUFnQixhQUFhO0FBQ3RILFlBQU0sWUFBWSxTQUFTLGNBQWMsS0FBSztBQUM5QyxnQkFBVSxZQUFZO0FBQ3RCLGdCQUFVLGNBQWMsd0JBQXdCLGlCQUFpQixnQkFBZ0IsTUFBTSxnQkFBZ0IsZUFBYyxDQUFFO0FBQ3ZILGVBQVMsY0FBYyxhQUFhLFdBQVcsUUFBUTtBQUN2RCxpQkFBVyxNQUFNLFVBQVUsT0FBTSxHQUFJLEdBQUk7QUFBQSxJQUMzQztBQUdBLFVBQU0sb0JBQW1CO0FBR3pCLFVBQU0sZUFBZSxNQUFNO0FBQzNCLFVBQU0sYUFBYSxhQUFhLFNBQVMsa0JBQWtCLEtBQUs7QUFDaEUsVUFBTSxrQkFBa0IsTUFBTSxPQUFPLFFBQVEsWUFBWTtBQUFBLE1BQ3ZELE1BQU07QUFBQSxNQUNOO0FBQUEsTUFDQSxVQUFVLGFBQWE7QUFBQSxNQUN2QjtBQUFBLElBQ04sQ0FBSztBQUVELFFBQUksQ0FBQyxnQkFBZ0IsU0FBUztBQUM1QixZQUFNLElBQUksTUFBTSwwQkFBMEI7QUFBQSxJQUM1QztBQUVBLGlCQUFhLGFBQWE7QUFDMUIsaUJBQWEsVUFBVTtBQUN2QixpQkFBYSxlQUFlLGdCQUFnQjtBQUM1QyxpQkFBYSxtQkFBbUIsS0FBSztBQUdyQztBQUVBLGVBQVcsa0JBQWtCO0FBQzdCO0VBQ0YsU0FBUyxPQUFPO0FBRWQsVUFBTSxvQkFBbUI7QUFHekIsVUFBTSxpQkFBaUIsTUFBTTtBQUM3QixRQUFJLGVBQWUsYUFBYTtBQUM5QixZQUFNLG1CQUFtQixLQUFLLEtBQUssZUFBZSxjQUFjLE1BQU8sRUFBRTtBQUN6RSxlQUFTLGNBQWMsNkJBQTZCLFlBQVksd0JBQXdCLGdCQUFnQjtBQUFBLElBQzFHLE9BQU87QUFDTCxZQUFNLGVBQWUsZUFBZSxlQUFlO0FBQ25ELGVBQVMsY0FBYyxHQUFHLE1BQU0sT0FBTyxLQUFLLFlBQVksV0FBVyxpQkFBaUIsSUFBSSxNQUFNLEVBQUU7QUFBQSxJQUNsRztBQUNBLGFBQVMsVUFBVSxPQUFPLFFBQVE7QUFBQSxFQUNwQztBQUNGO0FBR0EsZUFBZSxhQUFhO0FBRTFCLE1BQUksYUFBYSxjQUFjO0FBQzdCLFVBQU0sT0FBTyxRQUFRLFlBQVk7QUFBQSxNQUMvQixNQUFNO0FBQUEsTUFDTixjQUFjLGFBQWE7QUFBQSxJQUNqQyxDQUFLO0FBQUEsRUFDSDtBQUVBLGVBQWEsYUFBYTtBQUMxQixlQUFhLFVBQVU7QUFDdkIsZUFBYSxlQUFlO0FBQzVCLGVBQWEsbUJBQW1CO0FBQ2hDO0FBQ0EsYUFBVyxlQUFlO0FBQzVCO0FBR0EsU0FBUyxxQkFBcUI7QUFDNUI7QUFFQSxRQUFNLGdCQUFnQjtBQUV0QixrQkFBZ0IsWUFBWSxNQUFNO0FBQ2hDLFFBQUksQ0FBQyxhQUFhLGNBQWMsQ0FBQyxhQUFhLGtCQUFrQjtBQUM5RDtBQUNBO0FBQUEsSUFDRjtBQUVBLFVBQU0sV0FBVyxLQUFLLElBQUcsSUFBSyxhQUFhO0FBQzNDLFVBQU0sYUFBYSxhQUFhLFNBQVMsa0JBQWtCLEtBQUs7QUFFaEUsUUFBSSxZQUFZLFlBQVk7QUFFMUI7SUFDRjtBQUFBLEVBQ0YsR0FBRyxhQUFhO0FBQ2xCO0FBRUEsU0FBUyxvQkFBb0I7QUFDM0IsTUFBSSxlQUFlO0FBQ2pCLGtCQUFjLGFBQWE7QUFDM0Isb0JBQWdCO0FBQUEsRUFDbEI7QUFDRjtBQUVBLFNBQVMscUJBQXFCO0FBQzVCLE1BQUksYUFBYSxZQUFZO0FBQzNCLGlCQUFhLG1CQUFtQixLQUFLO0VBQ3ZDO0FBQ0Y7QUFHQSxlQUFlLHNCQUFzQjtBQUNuQyxRQUFNLE9BQU8sTUFBTSxLQUFLLGNBQWMsS0FBSyxFQUFFLFVBQVUsR0FBRyxrQkFBa0IsS0FBSyxJQUFHLEVBQUU7QUFHdEYsUUFBTSxpQkFBaUIsS0FBSyxJQUFHLElBQUssS0FBSztBQUN6QyxNQUFJLEtBQUssYUFBYSxLQUFLLGlCQUFpQixxQkFBcUI7QUFDL0QsU0FBSyxXQUFXO0FBQ2hCLFNBQUssbUJBQW1CLEtBQUs7RUFDL0IsT0FBTztBQUNMLFNBQUssWUFBWTtBQUFBLEVBQ25CO0FBRUEsUUFBTSxLQUFLLGdCQUFnQixJQUFJO0FBQ2pDO0FBRUEsZUFBZSx3QkFBd0I7QUFDckMsUUFBTSxPQUFPLE1BQU0sS0FBSyxjQUFjO0FBRXRDLE1BQUksQ0FBQyxRQUFRLEtBQUssYUFBYSxHQUFHO0FBQ2hDLFdBQU8sRUFBRSxhQUFhLE9BQU8sVUFBVSxHQUFHLGFBQWE7RUFDekQ7QUFFQSxRQUFNLGlCQUFpQixLQUFLLElBQUcsSUFBSyxLQUFLO0FBR3pDLE1BQUksaUJBQWlCLHFCQUFxQjtBQUN4QyxVQUFNLG9CQUFtQjtBQUN6QixXQUFPLEVBQUUsYUFBYSxPQUFPLFVBQVUsR0FBRyxhQUFhO0VBQ3pEO0FBR0EsTUFBSSxLQUFLLFlBQVksY0FBYztBQUNqQyxVQUFNLGNBQWMsc0JBQXNCO0FBQzFDLFdBQU8sRUFBRSxhQUFhLE1BQU0sVUFBVSxLQUFLLFVBQVU7RUFDdkQ7QUFFQSxTQUFPLEVBQUUsYUFBYSxPQUFPLFVBQVUsS0FBSyxVQUFVLGFBQWE7QUFDckU7QUFFQSxlQUFlLHNCQUFzQjtBQUNuQyxRQUFNLEtBQUssZ0JBQWdCLEVBQUUsVUFBVSxHQUFHLGtCQUFrQixFQUFDLENBQUU7QUFDakU7QUFHQSxlQUFlLGtCQUFrQjtBQUUvQixRQUFNLFlBQVksU0FBUyxlQUFlLGdCQUFnQjtBQUMxRCxNQUFJLGFBQWEsYUFBYSxTQUFTO0FBQ3JDLGNBQVUsY0FBYyxlQUFlLGFBQWEsT0FBTztBQUFBLEVBQzdEO0FBR0EsUUFBTSxhQUFZO0FBR2xCO0FBR0E7QUFDQTtBQUdBLFFBQU0scUJBQW9CO0FBRzFCLFFBQU0seUJBQXdCO0FBQ2hDO0FBbURBLGVBQWUsdUJBQXVCO0FBQ3BDLFFBQU0sZUFBZSxTQUFTLGVBQWUsZUFBZTtBQUM1RCxNQUFJLENBQUMsYUFBYztBQUVuQixRQUFNLGNBQWMsTUFBTTtBQUUxQixNQUFJLFlBQVksV0FBVyxXQUFXLEdBQUc7QUFDdkMsaUJBQWEsWUFBWTtBQUN6QjtBQUFBLEVBQ0Y7QUFFQSxlQUFhLFlBQVk7QUFFekIsY0FBWSxXQUFXLFFBQVEsWUFBVTtBQUN2QyxVQUFNLFNBQVMsU0FBUyxjQUFjLFFBQVE7QUFDOUMsV0FBTyxRQUFRLE9BQU87QUFDdEIsV0FBTyxjQUFjLE9BQU8sWUFBWTtBQUV4QyxRQUFJLE9BQU8sT0FBTyxZQUFZLGdCQUFnQjtBQUM1QyxhQUFPLFdBQVc7QUFBQSxJQUNwQjtBQUVBLGlCQUFhLFlBQVksTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDSDtBQUdBLFNBQVMsd0JBQXdCO0FBQy9CLFFBQU0sY0FBYyxjQUFjLGFBQWEsT0FBTyxLQUFLO0FBRzNELFFBQU0sY0FBYyxTQUFTLGVBQWUsc0JBQXNCO0FBQ2xFLE1BQUksYUFBYTtBQUNmLGdCQUFZLFFBQVEsYUFBYTtBQUFBLEVBQ25DO0FBR0EsUUFBTSxnQkFBZ0IsU0FBUyxlQUFlLHdCQUF3QjtBQUN0RSxNQUFJLGVBQWU7QUFDakIsa0JBQWMsY0FBYztBQUFBLEVBQzlCO0FBR0EsUUFBTSxnQkFBZ0IsU0FBUyxlQUFlLHdCQUF3QjtBQUN0RSxNQUFJLGVBQWU7QUFDakIsa0JBQWMsY0FBYztBQUFBLEVBQzlCO0FBR0EsUUFBTSxzQkFBc0IsU0FBUyxlQUFlLHVCQUF1QjtBQUMzRSxNQUFJLHFCQUFxQjtBQUN2Qix3QkFBb0IsY0FBYztBQUFBLEVBQ3BDO0FBR0EsUUFBTSxpQkFBaUIsU0FBUyxlQUFlLHVCQUF1QjtBQUN0RSxNQUFJLGdCQUFnQjtBQUNsQixVQUFNLGVBQWU7QUFBQSxNQUNuQixxQkFBcUI7QUFBQSxNQUNyQixjQUFjO0FBQUEsTUFDZCxZQUFZO0FBQUEsTUFDWixXQUFXO0FBQUEsSUFDakI7QUFFSSxVQUFNLFdBQVcsYUFBYSxhQUFhLE9BQU87QUFDbEQsUUFBSSxVQUFVO0FBQ1oscUJBQWUsTUFBTSxPQUFPLFFBQVEsT0FBTyxnQkFBZ0IsUUFBUSxFQUFFO0FBQ3JFLHFCQUFlLE1BQU0sVUFBVTtBQUFBLElBQ2pDLE9BQU87QUFDTCxxQkFBZSxNQUFNLFVBQVU7QUFBQSxJQUNqQztBQUFBLEVBQ0Y7QUFDRjtBQUVBLGVBQWUsZUFBZTtBQUM1QixNQUFJLENBQUMsYUFBYSxTQUFTO0FBQ3pCLGlCQUFhLFVBQVU7QUFDdkI7QUFDQTtBQUFBLEVBQ0Y7QUFFQSxNQUFJO0FBQ0YsVUFBTSxhQUFhLE1BQU1DLFdBQWUsYUFBYSxTQUFTLGFBQWEsT0FBTztBQUNsRixpQkFBYSxVQUFVQyxjQUFrQixZQUFZLGFBQWEsU0FBUyxhQUFhO0FBQ3hGO0VBQ0YsU0FBUyxPQUFPO0FBQ2QsWUFBUSxNQUFNLDJCQUEyQixLQUFLO0FBRTlDO0VBQ0Y7QUFDRjtBQVFBLFNBQVMsd0JBQXdCLGVBQWUsZUFBZSxJQUFJO0FBQ2pFLFFBQU0sVUFBVSxXQUFXLGFBQWE7QUFDeEMsTUFBSSxNQUFNLE9BQU8sR0FBRztBQUNsQixXQUFPLEVBQUUsU0FBUyxlQUFlLFNBQVMsY0FBYTtBQUFBLEVBQ3pEO0FBR0EsUUFBTSxRQUFRLGNBQWMsTUFBTSxHQUFHO0FBQ3JDLFFBQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxFQUFFLFFBQVEseUJBQXlCLEdBQUc7QUFDeEQsUUFBTSxlQUFlLE1BQU0sS0FBSyxHQUFHO0FBR25DLFFBQU0sZ0JBQWdCLFFBQVEsUUFBUSxZQUFZO0FBQ2xELFFBQU0sWUFBWSxjQUFjLE1BQU0sR0FBRztBQUN6QyxZQUFVLENBQUMsSUFBSSxVQUFVLENBQUMsRUFBRSxRQUFRLHlCQUF5QixHQUFHO0FBQ2hFLFFBQU0sWUFBWSxVQUFVLEtBQUssR0FBRztBQUVwQyxTQUFPO0FBQUEsSUFDTCxTQUFTO0FBQUEsSUFDVCxTQUFTLG1CQUFtQixTQUFTO0FBQUEsRUFDekM7QUFDQTtBQUVBLFNBQVMsdUJBQXVCO0FBQzlCLFFBQU0sWUFBWSxTQUFTLGVBQWUsZ0JBQWdCO0FBQzFELE1BQUksV0FBVztBQUNiLFVBQU0sV0FBVyxhQUFhLFNBQVM7QUFDdkMsVUFBTSxVQUFVLFdBQVcsYUFBYSxPQUFPO0FBRy9DLFVBQU0sWUFBWSxRQUFRLFFBQVEsUUFBUTtBQUMxQyxVQUFNLFFBQVEsVUFBVSxNQUFNLEdBQUc7QUFDakMsVUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLEVBQUUsUUFBUSx5QkFBeUIsR0FBRztBQUN4RCxVQUFNLGVBQWUsTUFBTSxLQUFLLEdBQUc7QUFFbkMsY0FBVSxjQUFjO0FBR3hCLFVBQU0sZ0JBQWdCLFFBQVEsUUFBUSxFQUFFO0FBQ3hDLFVBQU0sWUFBWSxjQUFjLE1BQU0sR0FBRztBQUN6QyxjQUFVLENBQUMsSUFBSSxVQUFVLENBQUMsRUFBRSxRQUFRLHlCQUF5QixHQUFHO0FBQ2hFLFVBQU0sWUFBWSxVQUFVLEtBQUssR0FBRztBQUNwQyxjQUFVLFFBQVEsbUJBQW1CLFNBQVM7QUFBQSxFQUNoRDtBQUdBLFFBQU0sV0FBVyxTQUFTLGVBQWUsZ0JBQWdCO0FBQ3pELE1BQUksVUFBVTtBQUNaLFVBQU0sVUFBVTtBQUFBLE1BQ2QscUJBQXFCO0FBQUEsTUFDckIsY0FBYztBQUFBLE1BQ2QsWUFBWTtBQUFBLE1BQ1osV0FBVztBQUFBLElBQ2pCO0FBQ0ksYUFBUyxjQUFjLFFBQVEsYUFBYSxPQUFPLEtBQUs7QUFBQSxFQUMxRDtBQUdBLFFBQU0sUUFBUSxTQUFTLGVBQWUsYUFBYTtBQUNuRCxNQUFJLFNBQVMsYUFBYSxhQUFhO0FBQ3JDLFVBQU0sY0FBYyxhQUFhLFlBQVksc0JBQXNCLFFBQ2hELGFBQWEsWUFBWSxlQUFlLFFBQ3hDLGFBQWEsWUFBWSxhQUFhLFFBQVE7QUFHakUsVUFBTSxhQUFhQyxXQUFrQixhQUFhLFFBQVEsU0FBUSxDQUFFLEVBQUU7QUFDdEUsVUFBTSxXQUFXLGlCQUFpQixhQUFhLFlBQVksSUFBSSxhQUFhLFdBQVc7QUFFdkYsUUFBSSxhQUFhLE1BQU07QUFDckIsWUFBTSxjQUFjLFVBQVUsUUFBUTtBQUN0QyxZQUFNLE1BQU0sUUFBUTtBQUFBLElBQ3RCLE9BQU87QUFDTCxZQUFNLGNBQWM7QUFDcEIsWUFBTSxNQUFNLFFBQVE7QUFBQSxJQUN0QjtBQUFBLEVBQ0YsV0FBVyxPQUFPO0FBQ2hCLFVBQU0sY0FBYztBQUFBLEVBQ3RCO0FBR0EsUUFBTSxTQUFTLFNBQVMsZUFBZSxjQUFjO0FBQ3JELE1BQUksUUFBUTtBQUNWLFVBQU0sZUFBZTtBQUFBLE1BQ25CLHFCQUFxQjtBQUFBLE1BQ3JCLGNBQWM7QUFBQSxNQUNkLFlBQVk7QUFBQSxNQUNaLFdBQVc7QUFBQSxJQUNqQjtBQUVJLFVBQU0sV0FBVyxhQUFhLGFBQWEsT0FBTztBQUNsRCxRQUFJLFVBQVU7QUFDWixhQUFPLE1BQU0sT0FBTyxRQUFRLE9BQU8sZ0JBQWdCLFFBQVEsRUFBRTtBQUM3RCxhQUFPLE1BQU0sVUFBVTtBQUFBLElBQ3pCLE9BQU87QUFDTCxhQUFPLE1BQU0sVUFBVTtBQUFBLElBQ3pCO0FBQUEsRUFDRjtBQUNGO0FBS0EsZUFBZSx1QkFBdUI7QUFFcEMsTUFBSSxhQUFhLFlBQVksZ0JBQWdCLGFBQWEsWUFBWSxxQkFBcUI7QUFDekYsWUFBUSxJQUFJLHVDQUF1QyxhQUFhLE9BQU87QUFDdkU7QUFBQSxFQUNGO0FBR0EsUUFBTSxZQUFZLFNBQVMsZUFBZSxlQUFlO0FBQ3pELFFBQU0sUUFBUSxTQUFTLGVBQWUsYUFBYTtBQUNuRCxNQUFJLGFBQWEsT0FBTztBQUN0QixVQUFNLFVBQVUsSUFBSSxRQUFRO0FBQzVCLGNBQVUsVUFBVSxPQUFPLFFBQVE7QUFBQSxFQUNyQztBQUVBLE1BQUk7QUFDRixVQUFNLFdBQVcsTUFBTUMsWUFBZ0IsYUFBYSxPQUFPO0FBQzNELFVBQU0sU0FBUyxNQUFNLGlCQUFpQixVQUFVLGFBQWEsWUFBWSxzQkFBc0IsZUFBZSxhQUFhLE9BQU87QUFFbEksUUFBSSxRQUFRO0FBQ1YsbUJBQWEsY0FBYztBQUMzQjtJQUVGO0FBQUEsRUFDRixTQUFTLE9BQU87QUFDZCxZQUFRLE1BQU0sZ0NBQWdDLEtBQUs7QUFBQSxFQUNyRCxVQUFDO0FBRUMsUUFBSSxhQUFhLE9BQU87QUFDdEIsZ0JBQVUsVUFBVSxJQUFJLFFBQVE7QUFDaEMsWUFBTSxVQUFVLE9BQU8sUUFBUTtBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUNGO0FBRUEsU0FBUyx3QkFBd0I7QUFFL0IsUUFBTSxVQUFVLFNBQVMsaUJBQWlCLGlCQUFpQjtBQUMzRCxVQUFRLFFBQVEsWUFBVTtBQUN4QixVQUFNLFVBQVUsT0FBTyxhQUFhLGNBQWM7QUFDbEQsVUFBTSxZQUFZLFFBQVEsU0FBUyxTQUFTLEtBQUssWUFBWTtBQUM3RCxRQUFJLGFBQWEsQ0FBQyxhQUFhLFNBQVMsa0JBQWtCO0FBQ3hELGFBQU8sTUFBTSxVQUFVO0FBQUEsSUFDekIsT0FBTztBQUNMLGFBQU8sTUFBTSxVQUFVO0FBQUEsSUFDekI7QUFBQSxFQUNGLENBQUM7QUFDSDtBQUdBLGVBQWUsaUJBQWlCO0FBRTlCLFdBQVMsZUFBZSxtQkFBbUIsRUFBRSxjQUFjLGFBQWEsV0FBVztBQUduRixRQUFNLGNBQWMsU0FBUyxlQUFlLG1CQUFtQjtBQUMvRCxRQUFNLFVBQVU7QUFBQSxJQUNkLHFCQUFxQjtBQUFBLElBQ3JCLGNBQWM7QUFBQSxJQUNkLFlBQVk7QUFBQSxJQUNaLFdBQVc7QUFBQSxFQUNmO0FBRUUsTUFBSSxVQUFVLGtDQUFrQyxRQUFRLGFBQWEsT0FBTyxLQUFLLE9BQU87QUFFeEYsUUFBTSxZQUFZLE1BQU1DLGFBQW9CLGFBQWEsT0FBTztBQUNoRSxhQUFXLFNBQVMsV0FBVztBQUM3QixlQUFXLGtCQUFrQixXQUFXLE1BQU0sT0FBTyxDQUFDLEtBQUssV0FBVyxNQUFNLE1BQU0sQ0FBQztBQUFBLEVBQ3JGO0FBRUEsY0FBWSxZQUFZO0FBR3hCLFFBQU0sWUFBWSxTQUFTLGVBQWUsd0JBQXdCO0FBQ2xFLFFBQU0sWUFBWSx3QkFBd0IsYUFBYSxTQUFTLEVBQUU7QUFDbEUsWUFBVSxjQUFjLFVBQVU7QUFDbEMsWUFBVSxRQUFRLFVBQVU7QUFDNUIsV0FBUyxlQUFlLHFCQUFxQixFQUFFLGNBQWMsUUFBUSxhQUFhLE9BQU8sS0FBSztBQUc5RixXQUFTLGVBQWUsaUJBQWlCLEVBQUUsUUFBUTtBQUNuRCxXQUFTLGVBQWUsYUFBYSxFQUFFLFFBQVE7QUFDL0MsV0FBUyxlQUFlLGVBQWUsRUFBRSxRQUFRO0FBQ2pELFdBQVMsZUFBZSxZQUFZLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFHNUQsV0FBUyxlQUFlLFdBQVcsRUFBRSxVQUFVLE9BQU8sUUFBUTtBQUM5RCxXQUFTLGVBQWUscUJBQXFCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFFckUsYUFBVyxhQUFhO0FBR3hCLFFBQU0sU0FBUyxRQUFRLGFBQWEsT0FBTyxLQUFLO0FBQ2hELFFBQU0sWUFBWTtBQUFBLElBQ2hCLE1BQU0sYUFBYTtBQUFBLElBQ25CLElBQUksYUFBYTtBQUFBO0FBQUEsSUFDakIsT0FBTztBQUFBLEVBQ1g7QUFDRSxRQUFNLHNCQUFzQixhQUFhLFNBQVMsV0FBVyxNQUFNO0FBR25FLE1BQUk7QUFDRixVQUFNLFdBQVcsTUFBTUMsb0JBQXdCLGFBQWEsU0FBUyxhQUFhLFNBQVMsU0FBUztBQUNwRyxVQUFNLFFBQVEsU0FBUyxVQUFVLEVBQUU7QUFDbkMsYUFBUyxlQUFlLG9CQUFvQixFQUFFLGNBQWM7QUFBQSxFQUM5RCxTQUFTLE9BQU87QUFDZCxZQUFRLE1BQU0seUJBQXlCLEtBQUs7QUFDNUMsYUFBUyxlQUFlLG9CQUFvQixFQUFFLGNBQWM7QUFBQSxFQUM5RDtBQUdBLFFBQU0sc0JBQXNCLFNBQVMsZUFBZSw0QkFBNEI7QUFDaEYsUUFBTSx1QkFBdUIsU0FBUyxlQUFlLG1DQUFtQztBQUN4RixzQkFBb0IsVUFBVTtBQUM5Qix1QkFBcUIsVUFBVSxJQUFJLFFBQVE7QUFHM0MsUUFBTSxjQUFjLG9CQUFvQixVQUFVLElBQUk7QUFDdEQsc0JBQW9CLFdBQVcsYUFBYSxhQUFhLG1CQUFtQjtBQUU1RSxXQUFTLGVBQWUsNEJBQTRCLEVBQUUsaUJBQWlCLFVBQVUsQ0FBQyxNQUFNO0FBQ3RGLFFBQUksRUFBRSxPQUFPLFNBQVM7QUFDcEIsMkJBQXFCLFVBQVUsT0FBTyxRQUFRO0FBQzlDLFlBQU0sZUFBZSxTQUFTLGVBQWUsb0JBQW9CLEVBQUU7QUFDbkUsVUFBSSxpQkFBaUIsUUFBUSxpQkFBaUIsU0FBUztBQUNyRCxpQkFBUyxlQUFlLG1CQUFtQixFQUFFLFFBQVE7QUFBQSxNQUN2RDtBQUFBLElBQ0YsT0FBTztBQUNMLDJCQUFxQixVQUFVLElBQUksUUFBUTtBQUFBLElBQzdDO0FBQUEsRUFDRixDQUFDO0FBQ0g7QUFFQSxlQUFlLG9CQUFvQjtBQUNqQyxRQUFNLGNBQWMsU0FBUyxlQUFlLG1CQUFtQjtBQUMvRCxRQUFNLGdCQUFnQixZQUFZO0FBRWxDLFFBQU0sVUFBVTtBQUFBLElBQ2QscUJBQXFCO0FBQUEsSUFDckIsY0FBYztBQUFBLElBQ2QsWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLEVBQ2Y7QUFFRSxRQUFNLFlBQVksU0FBUyxlQUFlLHdCQUF3QjtBQUVsRSxNQUFJLGtCQUFrQixVQUFVO0FBQzlCLFVBQU0sWUFBWSx3QkFBd0IsYUFBYSxTQUFTLEVBQUU7QUFDbEUsY0FBVSxjQUFjLFVBQVU7QUFDbEMsY0FBVSxRQUFRLFVBQVU7QUFDNUIsYUFBUyxlQUFlLHFCQUFxQixFQUFFLGNBQWMsUUFBUSxhQUFhLE9BQU8sS0FBSztBQUFBLEVBQ2hHLE9BQU87QUFFTCxRQUFJO0FBQ0YsWUFBTSxZQUFZLE1BQU1ELGFBQW9CLGFBQWEsT0FBTztBQUNoRSxZQUFNLFFBQVEsVUFBVSxLQUFLLE9BQUssRUFBRSxZQUFZLGFBQWE7QUFFN0QsVUFBSSxPQUFPO0FBQ1QsY0FBTSxhQUFhLE1BQU1FLGdCQUFzQixhQUFhLFNBQVMsTUFBTSxTQUFTLGFBQWEsT0FBTztBQUN4RyxjQUFNLGFBQWFDLG1CQUF5QixZQUFZLE1BQU0sVUFBVSxDQUFDO0FBQ3pFLGNBQU0sWUFBWSx3QkFBd0IsWUFBWSxNQUFNLFFBQVE7QUFDcEUsa0JBQVUsY0FBYyxVQUFVO0FBQ2xDLGtCQUFVLFFBQVEsVUFBVTtBQUM1QixpQkFBUyxlQUFlLHFCQUFxQixFQUFFLGNBQWMsTUFBTTtBQUFBLE1BQ3JFO0FBQUEsSUFDRixTQUFTLE9BQU87QUFDZCxjQUFRLE1BQU0saUNBQWlDLEtBQUs7QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFDRjtBQUVBLFNBQVMsZ0JBQWdCO0FBSXZCLFFBQU0sVUFBVSxXQUFXLGFBQWEsT0FBTztBQUMvQyxNQUFJLFVBQVUsR0FBRztBQUVmLFVBQU0sVUFBVSxLQUFLLElBQUksR0FBRyxVQUFVLElBQUs7QUFDM0MsYUFBUyxlQUFlLGFBQWEsRUFBRSxRQUFRLFFBQVE7RUFDekQ7QUFDRjtBQUVBLGVBQWUsd0JBQXdCO0FBQ3JDLFFBQU0sWUFBWSxTQUFTLGVBQWUsaUJBQWlCLEVBQUUsTUFBTTtBQUNuRSxRQUFNLFNBQVMsU0FBUyxlQUFlLGFBQWEsRUFBRSxNQUFNO0FBQzVELFFBQU0sV0FBVyxTQUFTLGVBQWUsZUFBZSxFQUFFO0FBQzFELFFBQU0sY0FBYyxTQUFTLGVBQWUsbUJBQW1CO0FBQy9ELFFBQU0sZ0JBQWdCLFlBQVk7QUFDbEMsUUFBTSxVQUFVLFNBQVMsZUFBZSxZQUFZO0FBRXBELFFBQU0sVUFBVTtBQUFBLElBQ2QscUJBQXFCO0FBQUEsSUFDckIsY0FBYztBQUFBLElBQ2QsWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLEVBQ2Y7QUFHRSxNQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxVQUFVO0FBQ3RDLFlBQVEsY0FBYztBQUN0QixZQUFRLFVBQVUsT0FBTyxRQUFRO0FBQ2pDO0FBQUEsRUFDRjtBQUdBLE1BQUksQ0FBQyxVQUFVLE1BQU0scUJBQXFCLEdBQUc7QUFDM0MsWUFBUSxjQUFjO0FBQ3RCLFlBQVEsVUFBVSxPQUFPLFFBQVE7QUFDakM7QUFBQSxFQUNGO0FBR0EsUUFBTSxZQUFZLFdBQVcsTUFBTTtBQUNuQyxNQUFJLE1BQU0sU0FBUyxLQUFLLGFBQWEsR0FBRztBQUN0QyxZQUFRLGNBQWM7QUFDdEIsWUFBUSxVQUFVLE9BQU8sUUFBUTtBQUNqQztBQUFBLEVBQ0Y7QUFFQSxNQUFJO0FBQ0YsWUFBUSxVQUFVLElBQUksUUFBUTtBQUc5QixVQUFNLFVBQVUsU0FBUyxlQUFlLGtCQUFrQjtBQUMxRCxZQUFRLFdBQVc7QUFDbkIsWUFBUSxNQUFNLFVBQVU7QUFDeEIsWUFBUSxNQUFNLFNBQVM7QUFHdkIsVUFBTSxFQUFFLFFBQVEsVUFBVSxrQkFBa0Isb0JBQW9CLE1BQU0sYUFBYSxVQUFVO0FBQUEsTUFDM0YsZ0JBQWdCLENBQUMsU0FBUztBQUN4QixnQkFBUSxJQUFJLDZCQUE2QixLQUFLLGtCQUFrQixnQkFBZ0IsTUFBTSxLQUFLLHNCQUFzQixlQUFjLENBQUUsRUFBRTtBQUNuSSxjQUFNLFlBQVksU0FBUyxjQUFjLEtBQUs7QUFDOUMsa0JBQVUsWUFBWTtBQUN0QixrQkFBVSxjQUFjO0FBQ3hCLGdCQUFRLGNBQWMsYUFBYSxXQUFXLE9BQU87QUFDckQsbUJBQVcsTUFBTSxVQUFVLE9BQU0sR0FBSSxHQUFJO0FBQUEsTUFDM0M7QUFBQSxJQUNOLENBQUs7QUFFRCxRQUFJLFVBQVU7QUFDWixjQUFRLElBQUksc0JBQXNCLGlCQUFpQixnQkFBZ0IsTUFBTSxnQkFBZ0IsZUFBYyxDQUFFLEVBQUU7QUFBQSxJQUM3RztBQUdBLFVBQU0sV0FBVztBQUdqQixVQUFNLHNCQUFzQixTQUFTLGVBQWUsNEJBQTRCO0FBQ2hGLFVBQU0sbUJBQW1CLFNBQVMsZUFBZSxtQkFBbUI7QUFDcEUsUUFBSSxjQUFjO0FBQ2xCLFFBQUksb0JBQW9CLFdBQVcsaUJBQWlCLE9BQU87QUFDekQsb0JBQWMsU0FBUyxpQkFBaUIsS0FBSztBQUM3QyxVQUFJLE1BQU0sV0FBVyxLQUFLLGNBQWMsR0FBRztBQUN6QyxjQUFNLElBQUksTUFBTSxzQkFBc0I7QUFBQSxNQUN4QztBQUFBLElBQ0Y7QUFHQSxVQUFNLFdBQVcsTUFBTUosWUFBZ0IsYUFBYSxPQUFPO0FBQzNELFVBQU0sa0JBQWtCLE9BQU8sUUFBUSxRQUFRO0FBRS9DLFFBQUksWUFBWTtBQUVoQixRQUFJLGtCQUFrQixVQUFVO0FBRTlCLFlBQU0sS0FBSztBQUFBLFFBQ1QsSUFBSTtBQUFBLFFBQ0osT0FBT0QsV0FBa0IsTUFBTTtBQUFBLE1BQ3ZDO0FBR00sVUFBSSxVQUFVO0FBQ1osV0FBRyxXQUFXO0FBQUEsTUFDaEI7QUFHQSxVQUFJLGdCQUFnQixNQUFNO0FBQ3hCLFdBQUcsUUFBUTtBQUFBLE1BQ2I7QUFFQSxtQkFBYSxNQUFNLGdCQUFnQixnQkFBZ0IsRUFBRTtBQUNyRCxlQUFTLFFBQVEsYUFBYSxPQUFPLEtBQUs7QUFBQSxJQUM1QyxPQUFPO0FBRUwsWUFBTSxZQUFZLE1BQU1FLGFBQW9CLGFBQWEsT0FBTztBQUNoRSxZQUFNLFFBQVEsVUFBVSxLQUFLLE9BQUssRUFBRSxZQUFZLGFBQWE7QUFFN0QsVUFBSSxDQUFDLE9BQU87QUFDVixjQUFNLElBQUksTUFBTSxpQkFBaUI7QUFBQSxNQUNuQztBQUVBLFlBQU0sWUFBWUksaUJBQXVCLFFBQVEsTUFBTSxRQUFRO0FBRy9ELFlBQU0sWUFBWTtBQUNsQixVQUFJLFVBQVU7QUFDWixrQkFBVSxXQUFXO0FBQUEsTUFDdkI7QUFDQSxVQUFJLGdCQUFnQixNQUFNO0FBQ3hCLGtCQUFVLFFBQVE7QUFBQSxNQUNwQjtBQUlBLFlBQU0sZ0JBQWdCLElBQUlsQjtBQUFBQSxRQUN4QixNQUFNO0FBQUEsUUFDTixDQUFDLDhEQUE4RDtBQUFBLFFBQy9EO0FBQUEsTUFDUjtBQUVNLG1CQUFhLE1BQU0sY0FBYyxTQUFTLFdBQVcsV0FBVyxTQUFTO0FBQ3pFLGVBQVMsTUFBTTtBQUFBLElBQ2pCO0FBR0EsVUFBTSxPQUFPLFFBQVEsWUFBWTtBQUFBLE1BQy9CLE1BQU07QUFBQSxNQUNOLFNBQVMsYUFBYTtBQUFBLE1BQ3RCLGFBQWE7QUFBQSxRQUNYLE1BQU0sV0FBVztBQUFBLFFBQ2pCLFdBQVcsS0FBSyxJQUFHO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsSUFBSTtBQUFBLFFBQ0osT0FBTyxrQkFBa0IsV0FBV1ksV0FBa0IsTUFBTSxFQUFFLFNBQVEsSUFBSztBQUFBLFFBQzNFLFVBQVUsYUFBYSxNQUFNLFdBQVcsU0FBUyxXQUFVLEdBQUksU0FBUyxTQUFRO0FBQUEsUUFDaEYsT0FBTyxXQUFXO0FBQUEsUUFDbEIsU0FBUyxhQUFhO0FBQUEsUUFDdEIsUUFBUTtBQUFBLFFBQ1IsYUFBYTtBQUFBLFFBQ2IsTUFBTSxrQkFBa0IsV0FBVyxTQUFTO0FBQUEsTUFDcEQ7QUFBQSxJQUNBLENBQUs7QUFHRCxRQUFJLE9BQU8sZUFBZTtBQUN4QixhQUFPLGNBQWMsT0FBTztBQUFBLFFBQzFCLE1BQU07QUFBQSxRQUNOLFNBQVMsT0FBTyxRQUFRLE9BQU8sMkJBQTJCO0FBQUEsUUFDMUQsT0FBTztBQUFBLFFBQ1AsU0FBUyxXQUFXLE1BQU0sSUFBSSxNQUFNLE9BQU8sVUFBVSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQUEsUUFDakUsVUFBVTtBQUFBLE1BQ2xCLENBQU87QUFBQSxJQUNIO0FBR0EsVUFBTSwwQkFBMEIsV0FBVyxNQUFNLGFBQWEsU0FBUyxRQUFRLE1BQU07QUFBQSxFQUV2RixTQUFTLE9BQU87QUFDZCxZQUFRLE1BQU0sMkJBQTJCLEtBQUs7QUFDOUMsWUFBUSxjQUFjLE1BQU0sUUFBUSxTQUFTLG9CQUFvQixJQUM3RCx1QkFDQSx5QkFBeUIsTUFBTTtBQUNuQyxZQUFRLFVBQVUsT0FBTyxRQUFRO0FBR2pDLFVBQU0sVUFBVSxTQUFTLGVBQWUsa0JBQWtCO0FBQzFELFlBQVEsV0FBVztBQUNuQixZQUFRLE1BQU0sVUFBVTtBQUN4QixZQUFRLE1BQU0sU0FBUztBQUFBLEVBQ3pCO0FBQ0Y7QUE4Q0EsZUFBZSxvQkFBb0I7QUFDakMsUUFBTSxVQUFVLGFBQWE7QUFHN0IsV0FBUyxlQUFlLGlCQUFpQixFQUFFLGNBQWM7QUFHekQsUUFBTSxlQUFlO0FBQUEsSUFDbkIscUJBQXFCO0FBQUEsSUFDckIsY0FBYztBQUFBLElBQ2QsWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLEVBQ2Y7QUFDRSxRQUFNLFVBQVU7QUFBQSxJQUNkLHFCQUFxQjtBQUFBLElBQ3JCLGNBQWM7QUFBQSxJQUNkLFlBQVk7QUFBQSxJQUNaLFdBQVc7QUFBQSxFQUNmO0FBQ0UsV0FBUyxlQUFlLHNCQUFzQixFQUFFLGNBQWMsYUFBYSxhQUFhLE9BQU8sS0FBSztBQUNwRyxXQUFTLGVBQWUsd0JBQXdCLEVBQUUsY0FBYyxRQUFRLGFBQWEsT0FBTyxLQUFLO0FBR2pHLE1BQUk7QUFDRixVQUFNaEIsVUFBUyxTQUFTLGVBQWUsbUJBQW1CO0FBQzFELFVBQU0sT0FBTyxTQUFTQSxTQUFRLFNBQVM7QUFBQSxNQUNyQyxPQUFPO0FBQUEsTUFDUCxRQUFRO0FBQUEsTUFDUixPQUFPO0FBQUEsUUFDTCxNQUFNLGlCQUFpQixTQUFTLElBQUksRUFBRSxpQkFBaUIsZUFBZSxFQUFFLEtBQUk7QUFBQSxRQUM1RSxPQUFPLGlCQUFpQixTQUFTLElBQUksRUFBRSxpQkFBaUIsZUFBZSxFQUFFLEtBQUk7QUFBQSxNQUNyRjtBQUFBLElBQ0EsQ0FBSztBQUFBLEVBQ0gsU0FBUyxPQUFPO0FBQ2QsWUFBUSxNQUFNLDZCQUE2QixLQUFLO0FBQUEsRUFDbEQ7QUFFQSxhQUFXLGdCQUFnQjtBQUM3QjtBQUVBLGVBQWUsMkJBQTJCO0FBQ3hDLE1BQUk7QUFDRixVQUFNLFVBQVUsVUFBVSxVQUFVLGFBQWEsT0FBTztBQUN4RCxVQUFNLE1BQU0sU0FBUyxlQUFlLDBCQUEwQjtBQUM5RCxVQUFNLGVBQWUsSUFBSTtBQUN6QixRQUFJLGNBQWM7QUFDbEIsZUFBVyxNQUFNO0FBQ2YsVUFBSSxjQUFjO0FBQUEsSUFDcEIsR0FBRyxHQUFJO0FBQUEsRUFDVCxTQUFTLE9BQU87QUFDZCxVQUFNLHdCQUF3QjtBQUFBLEVBQ2hDO0FBQ0Y7QUFHQSxlQUFlLG1CQUFtQjtBQUVoQyxhQUFXLGVBQWU7QUFHMUIsUUFBTSxJQUFJLFFBQVEsYUFBVyxXQUFXLFNBQVMsRUFBRSxDQUFDO0FBR3BELFFBQU0sbUJBQWtCO0FBQzFCO0FBRUEsZUFBZSxxQkFBcUI7QUFDbEMsUUFBTSxVQUFVLGFBQWE7QUFHN0IsUUFBTSxZQUFZLFNBQVMsZUFBZSxnQkFBZ0I7QUFDMUQsUUFBTSxlQUFlLFNBQVMsZUFBZSxzQkFBc0I7QUFDbkUsUUFBTSxjQUFjLFNBQVMsZUFBZSxxQkFBcUI7QUFFakUsTUFBSSxVQUFXLFdBQVUsVUFBVSxPQUFPLFFBQVE7QUFDbEQsTUFBSSxhQUFjLGNBQWEsVUFBVSxJQUFJLFFBQVE7QUFDckQsTUFBSSxZQUFhLGFBQVksVUFBVSxJQUFJLFFBQVE7QUFFbkQsTUFBSTtBQUVGLFVBQU0sb0JBQW9CLE9BQU87QUFHakMsVUFBTSxtQkFBbUIsT0FBTztBQUFBLEVBQ2xDLFVBQUM7QUFFQyxRQUFJLFVBQVcsV0FBVSxVQUFVLElBQUksUUFBUTtBQUMvQyxRQUFJLGFBQWMsY0FBYSxVQUFVLE9BQU8sUUFBUTtBQUN4RCxRQUFJLFlBQWEsYUFBWSxVQUFVLE9BQU8sUUFBUTtBQUFBLEVBQ3hEO0FBQ0Y7QUFFQSxlQUFlLG9CQUFvQixTQUFTO0FBQzFDLFFBQU0sa0JBQWtCLFNBQVMsZUFBZSxxQkFBcUI7QUFDckUsUUFBTSxrQkFBa0J1QixlQUFzQixPQUFPLEtBQUs7QUFDMUQsUUFBTSxrQkFBa0IsTUFBTUMsd0JBQStCLE9BQU87QUFFcEUsTUFBSSxPQUFPLEtBQUssZUFBZSxFQUFFLFdBQVcsR0FBRztBQUM3QyxvQkFBZ0IsWUFBWTtBQUM1QjtBQUFBLEVBQ0Y7QUFFQSxNQUFJLE9BQU87QUFDWCxhQUFXLFVBQVUsaUJBQWlCO0FBQ3BDLFVBQU0sUUFBUSxnQkFBZ0IsTUFBTTtBQUNwQyxVQUFNLFlBQVksZ0JBQWdCLFNBQVMsTUFBTTtBQUdqRCxRQUFJLGNBQWM7QUFDbEIsUUFBSSxpQkFBaUI7QUFDckIsUUFBSSxXQUFXO0FBQ2YsUUFBSSxhQUFhLGFBQWEsU0FBUztBQUNyQyxVQUFJO0FBQ0YsY0FBTSxhQUFhLE1BQU1KLGdCQUFzQixTQUFTLE1BQU0sU0FBUyxhQUFhLE9BQU87QUFDM0YsY0FBTSxhQUFhQyxtQkFBeUIsWUFBWSxNQUFNLFVBQVUsQ0FBQztBQUN6RSxjQUFNLFlBQVksd0JBQXdCLFlBQVksTUFBTSxRQUFRO0FBQ3BFLHNCQUFjLFVBQVU7QUFDeEIseUJBQWlCLFVBQVU7QUFHM0IsWUFBSSxhQUFhLGFBQWE7QUFDNUIscUJBQVcsaUJBQWlCLFFBQVEsWUFBWSxNQUFNLFVBQVUsYUFBYSxXQUFXO0FBQUEsUUFDMUY7QUFBQSxNQUNGLFNBQVMsT0FBTztBQUNkLHNCQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBRUEsVUFBTSxVQUFVLE1BQU0sT0FBTyxPQUFPLFFBQVEsT0FBTyxnQkFBZ0IsTUFBTSxJQUFJLEVBQUUsSUFBSTtBQUVuRixZQUFRO0FBQUE7QUFBQSxVQUVGLE1BQU0sT0FDTCxNQUFNLFVBQ0wsYUFBYSxPQUFPLFVBQVUsV0FBVyxNQUFNLE1BQU0sQ0FBQyxtSUFBbUksTUFBTSxPQUFPLGtCQUFrQixXQUFXLE1BQU0sSUFBSSxDQUFDLGtCQUM5TyxhQUFhLE9BQU8sVUFBVSxXQUFXLE1BQU0sTUFBTSxDQUFDLG9GQUN4RCw0SEFBNEg7QUFBQTtBQUFBLDJEQUUzRSxXQUFXLE1BQU0sTUFBTSxDQUFDO0FBQUEsK0JBQ3BELE1BQU0saUJBQWlCLG9CQUFvQixFQUFFLDZCQUE2QixNQUFNLGlCQUFpQixpREFBaUQsRUFBRSxLQUFLLE1BQU0saUJBQWlCLGFBQWEsTUFBTSxjQUFjLGlCQUFpQixXQUFXLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLElBQUksV0FBVyxNQUFNLElBQUksQ0FBQztBQUFBO0FBQUEsd0ZBRWhQLE1BQU0sT0FBTztBQUFBLDZEQUN4QyxNQUFNLE9BQU87QUFBQTtBQUFBLFlBRTlELFlBQVk7QUFBQSxnRkFDd0QsY0FBYyxjQUFjLFdBQVc7QUFBQSxjQUN6RyxhQUFhLE9BQU8saUVBQWlFLFVBQVUsUUFBUSxDQUFDLFNBQVMsRUFBRTtBQUFBLGNBQ25ILEVBQUU7QUFBQTtBQUFBO0FBQUEsc0VBR3NELE1BQU07QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUkxRTtBQUVBLGtCQUFnQixZQUFZO0FBRzVCLGtCQUFnQixpQkFBaUIseUJBQXlCLEVBQUUsUUFBUSxTQUFPO0FBQ3pFLFFBQUksaUJBQWlCLFNBQVMsQ0FBQyxNQUFNO0FBQ25DLFlBQU0sU0FBUyxFQUFFLE9BQU8sUUFBUTtBQUNoQyxZQUFNLFlBQVksRUFBRSxPQUFPLFFBQVEsY0FBYztBQUNqRCx1QkFBaUIsUUFBUSxTQUFTO0FBQUEsSUFDcEMsQ0FBQztBQUFBLEVBQ0gsQ0FBQztBQUdELGtCQUFnQixpQkFBaUIsbUJBQW1CLEVBQUUsUUFBUSxTQUFPO0FBQ25FLFFBQUksaUJBQWlCLFNBQVMsT0FBTyxNQUFNO0FBQ3pDLFlBQU0sVUFBVSxFQUFFLE9BQU8sUUFBUTtBQUNqQyxVQUFJO0FBQ0YsY0FBTSxVQUFVLFVBQVUsVUFBVSxPQUFPO0FBQzNDLGNBQU0sZUFBZSxFQUFFLE9BQU87QUFDOUIsVUFBRSxPQUFPLGNBQWM7QUFDdkIsbUJBQVcsTUFBTTtBQUNmLFlBQUUsT0FBTyxjQUFjO0FBQUEsUUFDekIsR0FBRyxHQUFJO0FBQUEsTUFDVCxTQUFTLE9BQU87QUFDZCxnQkFBUSxNQUFNLDJCQUEyQixLQUFLO0FBQUEsTUFDaEQ7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNILENBQUM7QUFHRCxrQkFBZ0IsaUJBQWlCLGtCQUFrQixFQUFFLFFBQVEsU0FBTztBQUNsRSxRQUFJLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUNuQyxZQUFNLE1BQU0sRUFBRSxPQUFPLFFBQVE7QUFDN0IsYUFBTyxLQUFLLE9BQU8sRUFBRSxJQUFHLENBQUU7QUFBQSxJQUM1QixDQUFDO0FBQUEsRUFDSCxDQUFDO0FBR0Qsa0JBQWdCLGlCQUFpQixrQkFBa0IsRUFBRSxRQUFRLE9BQUs7QUFDaEUsTUFBRSxpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFDakMsWUFBTSxNQUFNLEVBQUUsY0FBYyxRQUFRO0FBQ3BDLFVBQUksS0FBSztBQUNQLGVBQU8sS0FBSyxPQUFPLEVBQUUsSUFBRyxDQUFFO0FBQUEsTUFDNUI7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNILENBQUM7QUFDSDtBQUVBLGVBQWUsbUJBQW1CLFNBQVM7QUFDekMsUUFBTSxpQkFBaUIsU0FBUyxlQUFlLG9CQUFvQjtBQUNuRSxRQUFNLGVBQWUsTUFBTUksZ0JBQXVCLE9BQU87QUFFekQsTUFBSSxhQUFhLFdBQVcsR0FBRztBQUM3QixtQkFBZSxZQUFZO0FBQzNCO0FBQUEsRUFDRjtBQUVBLE1BQUksT0FBTztBQUNYLGFBQVcsU0FBUyxjQUFjO0FBRWhDLFFBQUksY0FBYztBQUNsQixRQUFJLGlCQUFpQjtBQUNyQixRQUFJLFdBQVc7QUFDZixRQUFJLGFBQWEsU0FBUztBQUN4QixVQUFJO0FBQ0YsY0FBTSxhQUFhLE1BQU1MLGdCQUFzQixTQUFTLE1BQU0sU0FBUyxhQUFhLE9BQU87QUFDM0YsY0FBTSxhQUFhQyxtQkFBeUIsWUFBWSxNQUFNLFVBQVUsQ0FBQztBQUN6RSxjQUFNLFlBQVksd0JBQXdCLFlBQVksTUFBTSxRQUFRO0FBQ3BFLHNCQUFjLFVBQVU7QUFDeEIseUJBQWlCLFVBQVU7QUFHM0IsWUFBSSxhQUFhLGFBQWE7QUFDNUIscUJBQVcsaUJBQWlCLE1BQU0sUUFBUSxZQUFZLE1BQU0sVUFBVSxhQUFhLFdBQVc7QUFBQSxRQUNoRztBQUFBLE1BQ0YsU0FBUyxPQUFPO0FBQ2Qsc0JBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFFQSxVQUFNLFVBQVUsTUFBTSxPQUFPLE9BQU8sUUFBUSxPQUFPLGdCQUFnQixNQUFNLElBQUksRUFBRSxJQUFJO0FBRW5GLFlBQVE7QUFBQTtBQUFBLFVBRUYsTUFBTSxPQUNMLE1BQU0sVUFDTCxhQUFhLE9BQU8sVUFBVSxXQUFXLE1BQU0sTUFBTSxDQUFDLG1JQUFtSSxNQUFNLE9BQU8sa0JBQWtCLFdBQVcsTUFBTSxJQUFJLENBQUMsa0JBQzlPLGFBQWEsT0FBTyxVQUFVLFdBQVcsTUFBTSxNQUFNLENBQUMsb0ZBQ3hELDRIQUE0SDtBQUFBO0FBQUEsMkRBRTNFLFdBQVcsTUFBTSxNQUFNLENBQUM7QUFBQSwrQkFDcEQsTUFBTSxpQkFBaUIsb0JBQW9CLEVBQUUsNkJBQTZCLE1BQU0saUJBQWlCLGlEQUFpRCxFQUFFLEtBQUssTUFBTSxpQkFBaUIsYUFBYSxNQUFNLGNBQWMsaUJBQWlCLFdBQVcsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsSUFBSSxXQUFXLE1BQU0sSUFBSSxDQUFDO0FBQUE7QUFBQSx3RkFFaFAsTUFBTSxPQUFPO0FBQUEsNkRBQ3hDLE1BQU0sT0FBTztBQUFBO0FBQUEsOEVBRUksY0FBYyxjQUFjLFdBQVc7QUFBQSxZQUN6RyxhQUFhLE9BQU8saUVBQWlFLFVBQVUsUUFBUSxDQUFDLFNBQVMsRUFBRTtBQUFBO0FBQUE7QUFBQSxzRUFHekQsTUFBTSxNQUFNLGlEQUFpRCxNQUFNLE9BQU87QUFBQSxzRkFDMUQsTUFBTSxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJakc7QUFFQSxpQkFBZSxZQUFZO0FBRzNCLGlCQUFlLGlCQUFpQix5QkFBeUIsRUFBRSxRQUFRLFNBQU87QUFDeEUsUUFBSSxpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFDbkMsWUFBTSxTQUFTLEVBQUUsT0FBTyxRQUFRO0FBQ2hDLFlBQU0sWUFBWSxFQUFFLE9BQU8sUUFBUSxjQUFjO0FBQ2pELFlBQU0sVUFBVSxFQUFFLE9BQU8sUUFBUTtBQUNqQyx1QkFBaUIsUUFBUSxXQUFXLE9BQU87QUFBQSxJQUM3QyxDQUFDO0FBQUEsRUFDSCxDQUFDO0FBR0QsaUJBQWUsaUJBQWlCLG1CQUFtQixFQUFFLFFBQVEsU0FBTztBQUNsRSxRQUFJLGlCQUFpQixTQUFTLE9BQU8sTUFBTTtBQUN6QyxZQUFNLFVBQVUsRUFBRSxPQUFPLFFBQVE7QUFDakMsVUFBSSxRQUFRLG1DQUFtQyxHQUFHO0FBQ2hELGNBQU1LLGtCQUF5QixTQUFTLE9BQU87QUFDL0MsY0FBTSxtQkFBa0I7QUFBQSxNQUMxQjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0gsQ0FBQztBQUdELGlCQUFlLGlCQUFpQixtQkFBbUIsRUFBRSxRQUFRLFNBQU87QUFDbEUsUUFBSSxpQkFBaUIsU0FBUyxPQUFPLE1BQU07QUFDekMsWUFBTSxVQUFVLEVBQUUsT0FBTyxRQUFRO0FBQ2pDLFVBQUk7QUFDRixjQUFNLFVBQVUsVUFBVSxVQUFVLE9BQU87QUFDM0MsY0FBTSxlQUFlLEVBQUUsT0FBTztBQUM5QixVQUFFLE9BQU8sY0FBYztBQUN2QixtQkFBVyxNQUFNO0FBQ2YsWUFBRSxPQUFPLGNBQWM7QUFBQSxRQUN6QixHQUFHLEdBQUk7QUFBQSxNQUNULFNBQVMsT0FBTztBQUNkLGdCQUFRLE1BQU0sMkJBQTJCLEtBQUs7QUFBQSxNQUNoRDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0gsQ0FBQztBQUdELGlCQUFlLGlCQUFpQixrQkFBa0IsRUFBRSxRQUFRLFNBQU87QUFDakUsUUFBSSxpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFDbkMsWUFBTSxNQUFNLEVBQUUsT0FBTyxRQUFRO0FBQzdCLGFBQU8sS0FBSyxPQUFPLEVBQUUsSUFBRyxDQUFFO0FBQUEsSUFDNUIsQ0FBQztBQUFBLEVBQ0gsQ0FBQztBQUdELGlCQUFlLGlCQUFpQixrQkFBa0IsRUFBRSxRQUFRLE9BQUs7QUFDL0QsTUFBRSxpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFDakMsWUFBTSxNQUFNLEVBQUUsY0FBYyxRQUFRO0FBQ3BDLFVBQUksS0FBSztBQUNQLGVBQU8sS0FBSyxPQUFPLEVBQUUsSUFBRyxDQUFFO0FBQUEsTUFDNUI7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNILENBQUM7QUFDSDtBQUdBLGVBQWUsaUJBQWlCLFFBQVEsV0FBVyxnQkFBZ0IsTUFBTTtBQUN2RSxRQUFNLFVBQVUsYUFBYTtBQUc3QixNQUFJO0FBQ0osTUFBSSxXQUFXO0FBQ2IsZ0JBQVlILGVBQXNCLE9BQU8sRUFBRSxNQUFNO0FBQUEsRUFDbkQsT0FBTztBQUVMLFVBQU0sZUFBZSxNQUFNRSxnQkFBdUIsT0FBTztBQUN6RCxnQkFBWSxhQUFhLEtBQUssT0FBSyxFQUFFLFFBQVEsa0JBQWtCLGNBQWMsWUFBVyxDQUFFO0FBQUEsRUFDNUY7QUFFQSxNQUFJLENBQUMsV0FBVztBQUNkLFlBQVEsTUFBTSxvQkFBb0IsTUFBTTtBQUN4QztBQUFBLEVBQ0Y7QUFHQSxlQUFhLHNCQUFzQjtBQUFBLElBQ2pDLEdBQUc7QUFBQSxJQUNIO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFHRSxXQUFTLGVBQWUscUJBQXFCLEVBQUUsY0FBYyxPQUFPO0FBR3BFLFdBQVMsZUFBZSxvQkFBb0IsRUFBRSxjQUFjLFVBQVU7QUFDdEUsV0FBUyxlQUFlLHNCQUFzQixFQUFFLGNBQWM7QUFHOUQsUUFBTSxnQkFBZ0IsU0FBUyxlQUFlLDhCQUE4QjtBQUM1RSxNQUFJLFVBQVUsTUFBTTtBQUNsQixVQUFNLFVBQVUsT0FBTyxRQUFRLE9BQU8sZ0JBQWdCLFVBQVUsSUFBSSxFQUFFO0FBQ3RFLGtCQUFjLFlBQVksYUFBYSxPQUFPLFVBQVUsTUFBTTtBQUFBLEVBQ2hFLE9BQU87QUFDTCxrQkFBYyxZQUFZO0FBQUEsRUFDNUI7QUFHQSxNQUFJO0FBQ0YsVUFBTSxhQUFhLE1BQU1MLGdCQUFzQixTQUFTLFVBQVUsU0FBUyxhQUFhLE9BQU87QUFDL0YsVUFBTSxtQkFBbUJDLG1CQUF5QixZQUFZLFVBQVUsVUFBVSxDQUFDO0FBQ25GLGFBQVMsZUFBZSx1QkFBdUIsRUFBRSxjQUFjO0FBRy9ELFFBQUksYUFBYSxlQUFlLGFBQWEsWUFBWSxNQUFNLEdBQUc7QUFDaEUsWUFBTSxXQUFXLGlCQUFpQixRQUFRLFlBQVksVUFBVSxVQUFVLGFBQWEsV0FBVztBQUNsRyxlQUFTLGVBQWUsMkJBQTJCLEVBQUUsY0FBYyxVQUFVLFFBQVE7QUFBQSxJQUN2RixPQUFPO0FBQ0wsZUFBUyxlQUFlLDJCQUEyQixFQUFFLGNBQWM7QUFBQSxJQUNyRTtBQUFBLEVBQ0YsU0FBUyxPQUFPO0FBQ2QsWUFBUSxNQUFNLGlDQUFpQyxLQUFLO0FBQ3BELGFBQVMsZUFBZSx1QkFBdUIsRUFBRSxjQUFjO0FBQy9ELGFBQVMsZUFBZSwyQkFBMkIsRUFBRSxjQUFjO0FBQUEsRUFDckU7QUFHQSxNQUFJLGFBQWEsZUFBZSxhQUFhLFlBQVksTUFBTSxHQUFHO0FBQ2hFLGFBQVMsZUFBZSxxQkFBcUIsRUFBRSxjQUFjLFVBQVUsYUFBYSxZQUFZLE1BQU0sQ0FBQztBQUFBLEVBQ3pHLE9BQU87QUFDTCxhQUFTLGVBQWUscUJBQXFCLEVBQUUsY0FBYztBQUFBLEVBQy9EO0FBR0EsUUFBTSxXQUFXLFNBQVMsZUFBZSx5QkFBeUI7QUFDbEUsTUFBSSxVQUFVLFNBQVM7QUFDckIsYUFBUyxPQUFPLFVBQVU7QUFDMUIsYUFBUyxVQUFVLE9BQU8sUUFBUTtBQUFBLEVBQ3BDLE9BQU87QUFDTCxhQUFTLFVBQVUsSUFBSSxRQUFRO0FBQUEsRUFDakM7QUFFQSxRQUFNLFVBQVUsU0FBUyxlQUFlLHdCQUF3QjtBQUNoRSxNQUFJLFVBQVUsZ0JBQWdCO0FBQzVCLFlBQVEsT0FBTyxVQUFVO0FBQ3pCLFlBQVEsVUFBVSxPQUFPLFFBQVE7QUFBQSxFQUNuQyxPQUFPO0FBQ0wsWUFBUSxVQUFVLElBQUksUUFBUTtBQUFBLEVBQ2hDO0FBR0EsUUFBTSxVQUFVLFlBQVksZUFBZSxNQUFNLFlBQVksc0JBQXNCLE1BQU07QUFDekYsUUFBTSxlQUFlLFNBQVMsZUFBZSw2QkFBNkI7QUFDMUUsZUFBYSxPQUFPLDZCQUE2QixPQUFPLElBQUksVUFBVSxPQUFPO0FBRzdFLFFBQU0sZUFBZSxHQUFHLFVBQVUsUUFBUSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sVUFBVSxRQUFRLE1BQU0sRUFBRSxDQUFDO0FBQ3RGLFdBQVMsZUFBZSw2QkFBNkIsRUFBRSxjQUFjO0FBR3JFLFFBQU0sa0JBQWtCLFNBQVMsZUFBZSxnQ0FBZ0M7QUFDaEYsTUFBSSxXQUFXO0FBQ2Isb0JBQWdCLFVBQVUsT0FBTyxRQUFRO0FBR3pDLFVBQU0sZUFBZSxTQUFTLGVBQWUsNkJBQTZCO0FBQzFFLFVBQU0sY0FBYyxTQUFTLGVBQWUsNEJBQTRCO0FBQ3hFLFVBQU0sZ0JBQWdCLE1BQU1HLHdCQUErQixPQUFPO0FBQ2xFLFVBQU0saUJBQWlCLGNBQWMsU0FBUyxNQUFNO0FBRXBELGlCQUFhLFVBQVU7QUFDdkIsZ0JBQVksY0FBYyxpQkFBaUIsWUFBWTtBQUFBLEVBQ3pELE9BQU87QUFDTCxvQkFBZ0IsVUFBVSxJQUFJLFFBQVE7QUFBQSxFQUN4QztBQUdBLFdBQVMsZUFBZSx5QkFBeUIsRUFBRSxRQUFRO0FBQzNELFdBQVMsZUFBZSxzQkFBc0IsRUFBRSxRQUFRO0FBQ3hELFdBQVMsZUFBZSx3QkFBd0IsRUFBRSxRQUFRO0FBQzFELFdBQVMsZUFBZSwwQkFBMEIsRUFBRSxVQUFVLElBQUksUUFBUTtBQUcxRSxXQUFTLGVBQWUsaUJBQWlCLEVBQUUsVUFBVSxPQUFPLFFBQVE7QUFDcEUsV0FBUyxlQUFlLDJCQUEyQixFQUFFLFVBQVUsSUFBSSxRQUFRO0FBRzNFLGFBQVcsc0JBQXNCO0FBR2pDLFFBQU0saUJBQWlCO0FBQUEsSUFDckIscUJBQXFCO0FBQUEsSUFDckIsY0FBYztBQUFBLElBQ2QsWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLEVBQ2Y7QUFDRSxRQUFNLGdCQUFnQixlQUFlLE9BQU8sS0FBSztBQUdqRCxRQUFNLFdBQVcsTUFBTVAsWUFBZ0IsT0FBTztBQUM5QyxRQUFNLGdCQUFnQixJQUFJYjtBQUFBQSxJQUN4QixVQUFVO0FBQUEsSUFDVixDQUFDLDhEQUE4RDtBQUFBLElBQy9EO0FBQUEsRUFDSjtBQUNFLFFBQU0sY0FBY0UsV0FBa0IsS0FBSyxVQUFVLFFBQVE7QUFDN0QsUUFBTSxZQUFZO0FBQUEsSUFDaEIsTUFBTSxhQUFhO0FBQUEsSUFDbkIsSUFBSSxVQUFVO0FBQUEsSUFDZCxNQUFNLGNBQWMsVUFBVSxtQkFBbUIsWUFBWSxDQUFDLGFBQWEsU0FBUyxXQUFXLENBQUM7QUFBQSxFQUNwRztBQUVFLFFBQU0sdUJBQXVCLFNBQVMsV0FBVyxhQUFhO0FBRzlELE1BQUk7QUFDRixVQUFNLFdBQVcsTUFBTWEsb0JBQXdCLFNBQVMsYUFBYSxTQUFTLFNBQVM7QUFDdkYsVUFBTSxRQUFRLFNBQVMsVUFBVSxFQUFFO0FBQ25DLGFBQVMsZUFBZSxxQkFBcUIsRUFBRSxjQUFjO0FBQUEsRUFDL0QsU0FBUyxPQUFPO0FBQ2QsWUFBUSxNQUFNLHlCQUF5QixLQUFLO0FBQzVDLGFBQVMsZUFBZSxxQkFBcUIsRUFBRSxjQUFjO0FBQUEsRUFDL0Q7QUFHQSxRQUFNLHNCQUFzQixTQUFTLGVBQWUsNkJBQTZCO0FBQ2pGLFFBQU0sdUJBQXVCLFNBQVMsZUFBZSxvQ0FBb0M7QUFDekYsc0JBQW9CLFVBQVU7QUFDOUIsdUJBQXFCLFVBQVUsSUFBSSxRQUFRO0FBRzNDLFFBQU0sY0FBYyxvQkFBb0IsVUFBVSxJQUFJO0FBQ3RELHNCQUFvQixXQUFXLGFBQWEsYUFBYSxtQkFBbUI7QUFFNUUsV0FBUyxlQUFlLDZCQUE2QixFQUFFLGlCQUFpQixVQUFVLENBQUMsTUFBTTtBQUN2RixRQUFJLEVBQUUsT0FBTyxTQUFTO0FBQ3BCLDJCQUFxQixVQUFVLE9BQU8sUUFBUTtBQUM5QyxZQUFNLGVBQWUsU0FBUyxlQUFlLHFCQUFxQixFQUFFO0FBQ3BFLFVBQUksaUJBQWlCLFFBQVEsaUJBQWlCLFNBQVM7QUFDckQsaUJBQVMsZUFBZSxvQkFBb0IsRUFBRSxRQUFRO0FBQUEsTUFDeEQ7QUFBQSxJQUNGLE9BQU87QUFDTCwyQkFBcUIsVUFBVSxJQUFJLFFBQVE7QUFBQSxJQUM3QztBQUFBLEVBQ0YsQ0FBQztBQUNIO0FBRUEsU0FBUyxnQ0FBZ0M7QUFDdkMsUUFBTSxZQUFZLGFBQWE7QUFDL0IsTUFBSSxDQUFDLFVBQVc7QUFFaEIsWUFBVSxVQUFVLFVBQVUsVUFBVSxPQUFPLEVBQUUsS0FBSyxNQUFNO0FBQzFELFVBQU0sTUFBTSxTQUFTLGVBQWUsNEJBQTRCO0FBQ2hFLFVBQU0sZUFBZSxJQUFJO0FBQ3pCLFFBQUksWUFBWTtBQUNoQixlQUFXLE1BQU07QUFDZixVQUFJLFlBQVk7QUFBQSxJQUNsQixHQUFHLEdBQUk7QUFBQSxFQUNULENBQUM7QUFDSDtBQUVBLGVBQWUscUJBQXFCO0FBQ2xDLFFBQU0sWUFBWSxhQUFhO0FBQy9CLE1BQUksQ0FBQyxVQUFXO0FBRWhCLE1BQUk7QUFDRixVQUFNLGFBQWEsTUFBTUMsZ0JBQXNCLGFBQWEsU0FBUyxVQUFVLFNBQVMsYUFBYSxPQUFPO0FBQzVHLFVBQU0sbUJBQW1CQyxtQkFBeUIsWUFBWSxVQUFVLFVBQVUsRUFBRTtBQUNwRixhQUFTLGVBQWUsc0JBQXNCLEVBQUUsUUFBUTtBQUFBLEVBQzFELFNBQVMsT0FBTztBQUNkLFlBQVEsTUFBTSw4QkFBOEIsS0FBSztBQUFBLEVBQ25EO0FBQ0Y7QUFFQSxlQUFlLGtCQUFrQjtBQUMvQixRQUFNLFlBQVksYUFBYTtBQUMvQixNQUFJLENBQUMsVUFBVztBQUVoQixRQUFNLFlBQVksU0FBUyxlQUFlLHlCQUF5QixFQUFFLE1BQU07QUFDM0UsUUFBTSxTQUFTLFNBQVMsZUFBZSxzQkFBc0IsRUFBRSxNQUFNO0FBQ3JFLFFBQU0sV0FBVyxTQUFTLGVBQWUsd0JBQXdCLEVBQUU7QUFDbkUsUUFBTSxVQUFVLFNBQVMsZUFBZSwwQkFBMEI7QUFHbEUsVUFBUSxVQUFVLElBQUksUUFBUTtBQUc5QixNQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxVQUFVO0FBQ3RDLFlBQVEsY0FBYztBQUN0QixZQUFRLFVBQVUsT0FBTyxRQUFRO0FBQ2pDO0FBQUEsRUFDRjtBQUVBLE1BQUksQ0FBQyxVQUFVLFdBQVcsSUFBSSxLQUFLLFVBQVUsV0FBVyxJQUFJO0FBQzFELFlBQVEsY0FBYztBQUN0QixZQUFRLFVBQVUsT0FBTyxRQUFRO0FBQ2pDO0FBQUEsRUFDRjtBQUVBLE1BQUk7QUFFRixVQUFNLFVBQVUsU0FBUyxlQUFlLGdCQUFnQjtBQUN4RCxZQUFRLFdBQVc7QUFDbkIsWUFBUSxNQUFNLFVBQVU7QUFDeEIsWUFBUSxNQUFNLFNBQVM7QUFFdkIsVUFBTSxXQUFXZixXQUFrQixRQUFRLFVBQVUsUUFBUTtBQUc3RCxVQUFNLGFBQWEsTUFBTWMsZ0JBQXNCLGFBQWEsU0FBUyxVQUFVLFNBQVMsYUFBYSxPQUFPO0FBQzVHLFFBQUksV0FBVyxZQUFZO0FBQ3pCLGNBQVEsY0FBYztBQUN0QixjQUFRLFVBQVUsT0FBTyxRQUFRO0FBRWpDLGNBQVEsV0FBVztBQUNuQixjQUFRLE1BQU0sVUFBVTtBQUN4QixjQUFRLE1BQU0sU0FBUztBQUN2QjtBQUFBLElBQ0Y7QUFHQSxRQUFJO0FBQ0osUUFBSTtBQUNGLFlBQU0sZUFBZSxNQUFNLGFBQWEsVUFBVTtBQUFBLFFBQ2hELGdCQUFnQixDQUFDLFNBQVM7QUFDeEIsa0JBQVEsSUFBSSw2QkFBNkIsS0FBSyxrQkFBa0IsZ0JBQWdCLE1BQU0sS0FBSyxzQkFBc0IsZUFBYyxDQUFFLEVBQUU7QUFBQSxRQUNySTtBQUFBLE1BQ1IsQ0FBTztBQUNELGVBQVMsYUFBYTtBQUV0QixVQUFJLGFBQWEsVUFBVTtBQUN6QixnQkFBUSxJQUFJLHNCQUFzQixhQUFhLGlCQUFpQixnQkFBZ0IsTUFBTSxhQUFhLGdCQUFnQixlQUFjLENBQUUsRUFBRTtBQUFBLE1BQ3ZJO0FBQUEsSUFDRixTQUFTLEtBQUs7QUFDWixjQUFRLGNBQWMsSUFBSSxXQUFXO0FBQ3JDLGNBQVEsVUFBVSxPQUFPLFFBQVE7QUFFakMsY0FBUSxXQUFXO0FBQ25CLGNBQVEsTUFBTSxVQUFVO0FBQ3hCLGNBQVEsTUFBTSxTQUFTO0FBQ3ZCO0FBQUEsSUFDRjtBQUdBLFVBQU0sV0FBVztBQUdqQixVQUFNLHNCQUFzQixTQUFTLGVBQWUsNkJBQTZCO0FBQ2pGLFVBQU0sbUJBQW1CLFNBQVMsZUFBZSxvQkFBb0I7QUFDckUsUUFBSSxjQUFjO0FBQ2xCLFFBQUksb0JBQW9CLFdBQVcsaUJBQWlCLE9BQU87QUFDekQsb0JBQWMsU0FBUyxpQkFBaUIsS0FBSztBQUM3QyxVQUFJLE1BQU0sV0FBVyxLQUFLLGNBQWMsR0FBRztBQUN6QyxjQUFNLElBQUksTUFBTSxzQkFBc0I7QUFBQSxNQUN4QztBQUFBLElBQ0Y7QUFHQSxVQUFNLFdBQVcsTUFBTUgsWUFBZ0IsYUFBYSxPQUFPO0FBQzNELFVBQU0sa0JBQWtCLE9BQU8sUUFBUSxRQUFRO0FBRy9DLFVBQU0sZ0JBQWdCLElBQUliO0FBQUFBLE1BQ3hCLFVBQVU7QUFBQSxNQUNWLENBQUMsOERBQThEO0FBQUEsTUFDL0Q7QUFBQSxJQUNOO0FBRUksVUFBTSxZQUFZO0FBQ2xCLFFBQUksVUFBVTtBQUNaLGdCQUFVLFdBQVc7QUFBQSxJQUN2QjtBQUNBLFFBQUksZ0JBQWdCLE1BQU07QUFDeEIsZ0JBQVUsUUFBUTtBQUFBLElBQ3BCO0FBRUEsVUFBTSxLQUFLLE1BQU0sY0FBYyxTQUFTLFdBQVcsVUFBVSxTQUFTO0FBR3RFLFVBQU0sT0FBTyxRQUFRLFlBQVk7QUFBQSxNQUMvQixNQUFNO0FBQUEsTUFDTixTQUFTLGFBQWE7QUFBQSxNQUN0QixhQUFhO0FBQUEsUUFDWCxNQUFNLEdBQUc7QUFBQSxRQUNULFdBQVcsS0FBSyxJQUFHO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsVUFBVSxhQUFhLE1BQU0sR0FBRyxTQUFTLFdBQVUsR0FBSSxTQUFTLFNBQVE7QUFBQSxRQUN4RSxPQUFPLEdBQUc7QUFBQSxRQUNWLFNBQVMsYUFBYTtBQUFBLFFBQ3RCLFFBQVE7QUFBQSxRQUNSLGFBQWE7QUFBQSxRQUNiLE1BQU07QUFBQSxNQUNkO0FBQUEsSUFDQSxDQUFLO0FBR0QsUUFBSSxPQUFPLGVBQWU7QUFDeEIsYUFBTyxjQUFjLE9BQU87QUFBQSxRQUMxQixNQUFNO0FBQUEsUUFDTixTQUFTLE9BQU8sUUFBUSxPQUFPLDJCQUEyQjtBQUFBLFFBQzFELE9BQU87QUFBQSxRQUNQLFNBQVMsV0FBVyxNQUFNLElBQUksVUFBVSxNQUFNLE9BQU8sVUFBVSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQUEsUUFDM0UsVUFBVTtBQUFBLE1BQ2xCLENBQU87QUFBQSxJQUNIO0FBR0EsVUFBTSwrQkFBK0IsR0FBRyxNQUFNLGFBQWEsU0FBUyxRQUFRLFVBQVUsTUFBTTtBQUFBLEVBRTlGLFNBQVMsT0FBTztBQUNkLFlBQVEsTUFBTSx3QkFBd0IsS0FBSztBQUMzQyxZQUFRLGNBQWMsTUFBTSxXQUFXO0FBQ3ZDLFlBQVEsVUFBVSxPQUFPLFFBQVE7QUFHakMsVUFBTSxVQUFVLFNBQVMsZUFBZSxnQkFBZ0I7QUFDeEQsWUFBUSxXQUFXO0FBQ25CLFlBQVEsTUFBTSxVQUFVO0FBQ3hCLFlBQVEsTUFBTSxTQUFTO0FBQUEsRUFDekI7QUFDRjtBQUVBLGVBQWUsd0JBQXdCLEdBQUc7QUFDeEMsUUFBTSxZQUFZLGFBQWE7QUFDL0IsTUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLFVBQVc7QUFFeEMsUUFBTSxZQUFZLEVBQUUsT0FBTztBQUMzQixRQUFNLFFBQVEsU0FBUyxlQUFlLDRCQUE0QjtBQUdsRSxRQUFNLGNBQWMsWUFBWSxZQUFZO0FBRzVDLFFBQU11QixtQkFBMEIsYUFBYSxTQUFTLFVBQVUsUUFBUSxTQUFTO0FBSW5GO0FBRUEsU0FBUyxvQkFBb0I7QUFDM0IsV0FBUyxlQUFlLHFCQUFxQixFQUFFLFFBQVE7QUFDdkQsV0FBUyxlQUFlLGVBQWUsRUFBRSxVQUFVLElBQUksUUFBUTtBQUMvRCxXQUFTLGVBQWUsaUJBQWlCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFDakUsV0FBUyxlQUFlLGlCQUFpQixFQUFFLFVBQVUsT0FBTyxRQUFRO0FBQ3RFO0FBRUEsSUFBSTtBQUNKLGVBQWUsd0JBQXdCLEdBQUc7QUFDeEMsUUFBTSxVQUFVLEVBQUUsT0FBTyxNQUFNLEtBQUk7QUFDbkMsUUFBTSxZQUFZLFNBQVMsZUFBZSxlQUFlO0FBQ3pELFFBQU0sVUFBVSxTQUFTLGVBQWUsaUJBQWlCO0FBR3pELE1BQUksd0JBQXdCO0FBQzFCLGlCQUFhLHNCQUFzQjtBQUFBLEVBQ3JDO0FBR0EsWUFBVSxVQUFVLElBQUksUUFBUTtBQUNoQyxVQUFRLFVBQVUsSUFBSSxRQUFRO0FBRzlCLE1BQUksQ0FBQyxXQUFXLFFBQVEsV0FBVyxNQUFNLENBQUMsUUFBUSxXQUFXLElBQUksR0FBRztBQUNsRTtBQUFBLEVBQ0Y7QUFHQSwyQkFBeUIsV0FBVyxZQUFZO0FBQzlDLFFBQUk7QUFDRixZQUFNLFVBQVUsYUFBYTtBQUM3QixZQUFNLFdBQVcsTUFBTUMsaUJBQXVCLFNBQVMsT0FBTztBQUc5RCxlQUFTLGVBQWUsb0JBQW9CLEVBQUUsY0FBYyxTQUFTO0FBQ3JFLGVBQVMsZUFBZSxzQkFBc0IsRUFBRSxjQUFjLFNBQVM7QUFDdkUsZUFBUyxlQUFlLHdCQUF3QixFQUFFLGNBQWMsU0FBUztBQUN6RSxnQkFBVSxVQUFVLE9BQU8sUUFBUTtBQUFBLElBQ3JDLFNBQVMsT0FBTztBQUNkLGNBQVEsY0FBYztBQUN0QixjQUFRLFVBQVUsT0FBTyxRQUFRO0FBQUEsSUFDbkM7QUFBQSxFQUNGLEdBQUcsR0FBRztBQUNSO0FBRUEsZUFBZSx1QkFBdUI7QUFDcEMsUUFBTSxVQUFVLFNBQVMsZUFBZSxxQkFBcUIsRUFBRSxNQUFNO0FBQ3JFLFFBQU0sVUFBVSxTQUFTLGVBQWUsaUJBQWlCO0FBRXpELE1BQUksQ0FBQyxTQUFTO0FBQ1osWUFBUSxjQUFjO0FBQ3RCLFlBQVEsVUFBVSxPQUFPLFFBQVE7QUFDakM7QUFBQSxFQUNGO0FBRUEsTUFBSTtBQUNGLFlBQVEsVUFBVSxJQUFJLFFBQVE7QUFDOUIsVUFBTUMsZUFBc0IsYUFBYSxTQUFTLE9BQU87QUFHekQsYUFBUyxlQUFlLGlCQUFpQixFQUFFLFVBQVUsSUFBSSxRQUFRO0FBQ2pFLFVBQU0sbUJBQWtCO0FBQUEsRUFDMUIsU0FBUyxPQUFPO0FBQ2QsWUFBUSxjQUFjLE1BQU07QUFDNUIsWUFBUSxVQUFVLE9BQU8sUUFBUTtBQUFBLEVBQ25DO0FBQ0Y7QUFHQSxTQUFTLG1CQUFtQjtBQUMxQixXQUFTLGVBQWUsa0JBQWtCLEVBQUUsUUFBUSxhQUFhLFNBQVM7QUFDMUUsV0FBUyxlQUFlLGtCQUFrQixFQUFFLFFBQVEsYUFBYSxTQUFTO0FBQzFFLFdBQVMsZUFBZSxlQUFlLEVBQUUsUUFBUSxhQUFhLFNBQVM7QUFDdkUsV0FBUyxlQUFlLHVCQUF1QixFQUFFLFVBQVUsYUFBYSxTQUFTO0FBQ2pGLFdBQVMsZUFBZSx1QkFBdUIsRUFBRSxRQUFRLGFBQWEsU0FBUyxtQkFBbUI7QUFDbEcsV0FBUyxlQUFlLHdCQUF3QixFQUFFLFVBQVUsYUFBYSxTQUFTLGdCQUFnQjtBQUdsRztBQUNGO0FBS0EsZUFBZSx1QkFBdUI7QUFDcEMsUUFBTSxVQUFVLFNBQVMsZUFBZSx5QkFBeUI7QUFDakUsTUFBSSxDQUFDLFFBQVM7QUFFZCxNQUFJO0FBQ0YsWUFBUSxjQUFjO0FBR3RCLFVBQU0sV0FBVyxNQUFNQyxZQUFnQixhQUFhLE9BQU87QUFHM0QsVUFBTSxlQUFlLFdBQVd6QixZQUFtQixVQUFVLE1BQU0sQ0FBQztBQUdwRSxRQUFJO0FBQ0osUUFBSSxlQUFlLE1BQU87QUFDeEIscUJBQWUsYUFBYSxRQUFRLENBQUM7QUFBQSxJQUN2QyxXQUFXLGVBQWUsR0FBRztBQUMzQixxQkFBZSxhQUFhLFFBQVEsQ0FBQztBQUFBLElBQ3ZDLFdBQVcsZUFBZSxJQUFJO0FBQzVCLHFCQUFlLGFBQWEsUUFBUSxDQUFDO0FBQUEsSUFDdkMsT0FBTztBQUNMLHFCQUFlLGFBQWEsUUFBUSxDQUFDO0FBQUEsSUFDdkM7QUFFQSxVQUFNLGNBQWMsY0FBYyxhQUFhLE9BQU8sS0FBSyxhQUFhO0FBQ3hFLFlBQVEsY0FBYyxXQUFXLFdBQVcsV0FBVyxZQUFZO0FBQ25FLFlBQVEsTUFBTSxRQUFRO0FBQUEsRUFDeEIsU0FBUyxPQUFPO0FBQ2QsWUFBUSxNQUFNLDZCQUE2QixLQUFLO0FBQ2hELFlBQVEsY0FBYztBQUN0QixZQUFRLE1BQU0sUUFBUTtBQUFBLEVBQ3hCO0FBQ0Y7QUFLQSxlQUFlLDJCQUEyQjtBQUN4QyxRQUFNLFVBQVUsU0FBUyxlQUFlLHVCQUF1QjtBQUMvRCxRQUFNLFVBQVUsU0FBUyxlQUFlLHlCQUF5QjtBQUVqRSxNQUFJLENBQUMsUUFBUztBQUVkLE1BQUk7QUFFRixVQUFNLFdBQVcsTUFBTXlCLFlBQWdCLGFBQWEsT0FBTztBQUMzRCxVQUFNLGVBQWUsV0FBV3pCLFlBQW1CLFVBQVUsTUFBTSxDQUFDO0FBR3BFLFVBQU0sZ0JBQWdCLGVBQWU7QUFHckMsUUFBSTtBQUNKLFFBQUksZ0JBQWdCLEdBQUc7QUFDckIscUJBQWUsS0FBSyxLQUFLLGdCQUFnQixHQUFJLElBQUk7QUFBQSxJQUNuRCxXQUFXLGdCQUFnQixJQUFJO0FBQzdCLHFCQUFlLEtBQUssS0FBSyxnQkFBZ0IsR0FBRyxJQUFJO0FBQUEsSUFDbEQsT0FBTztBQUNMLHFCQUFlLEtBQUssS0FBSyxnQkFBZ0IsRUFBRSxJQUFJO0FBQUEsSUFDakQ7QUFHQSxVQUFNLGFBQWEsS0FBSyxJQUFJLEtBQUssWUFBWTtBQUc3QyxZQUFRLFFBQVE7QUFDaEIsaUJBQWEsU0FBUyxrQkFBa0I7QUFDeEM7QUFHQSxZQUFRLGNBQWMsVUFBVSxVQUFVO0FBQzFDLFlBQVEsTUFBTSxRQUFRO0FBR3RCLGVBQVcsTUFBTSx3QkFBd0IsR0FBSTtBQUFBLEVBQy9DLFNBQVMsT0FBTztBQUNkLFlBQVEsTUFBTSw0QkFBNEIsS0FBSztBQUMvQyxVQUFNLHNEQUFzRDtBQUFBLEVBQzlEO0FBQ0Y7QUFHQSxNQUFNLGVBQWUsQ0FBQyxxQkFBcUIsY0FBYyxZQUFZLFNBQVM7QUFFOUUsU0FBUywwQkFBMEI7QUFDakMsZUFBYSxRQUFRLGFBQVc7QUFFOUIsVUFBTSxXQUFXLFNBQVMsZUFBZSxPQUFPLE9BQU8sRUFBRTtBQUN6RCxRQUFJLFVBQVU7QUFDWixlQUFTLFFBQVEsYUFBYSxrQkFBa0IsT0FBTyxHQUFHLE9BQU87QUFBQSxJQUNuRTtBQUdBLFVBQU0sZ0JBQWdCLFNBQVMsZUFBZSxZQUFZLE9BQU8sRUFBRTtBQUNuRSxRQUFJLGVBQWU7QUFDakIsb0JBQWMsUUFBUSxhQUFhLGtCQUFrQixPQUFPLEdBQUcsZ0JBQWdCO0FBQUEsSUFDakY7QUFFQSxVQUFNLGNBQWMsU0FBUyxlQUFlLGVBQWUsT0FBTyxFQUFFO0FBQ3BFLFFBQUksYUFBYTtBQUNmLGtCQUFZLFFBQVEsYUFBYSxrQkFBa0IsT0FBTyxHQUFHLGtCQUFrQjtBQUFBLElBQ2pGO0FBRUEsVUFBTSxnQkFBZ0IsU0FBUyxlQUFlLGlCQUFpQixPQUFPLEVBQUU7QUFDeEUsUUFBSSxlQUFlO0FBQ2pCLG9CQUFjLFFBQVEsYUFBYSxrQkFBa0IsT0FBTyxHQUFHLG9CQUFvQjtBQUFBLElBQ3JGO0FBQUEsRUFDRixDQUFDO0FBQ0g7QUFFQSxlQUFlLHNCQUFzQjtBQUNuQyxRQUFNLGtCQUFrQjtBQUV4QixlQUFhLFFBQVEsYUFBVztBQUM5QixvQkFBZ0IsT0FBTyxJQUFJO0FBQUEsTUFDekIsS0FBSyxTQUFTLGVBQWUsT0FBTyxPQUFPLEVBQUUsR0FBRyxTQUFTO0FBQUEsTUFDekQsY0FBYyxTQUFTLGVBQWUsWUFBWSxPQUFPLEVBQUUsR0FBRyxTQUFTO0FBQUEsTUFDdkUsZ0JBQWdCLFNBQVMsZUFBZSxlQUFlLE9BQU8sRUFBRSxHQUFHLFNBQVM7QUFBQSxNQUM1RSxrQkFBa0IsU0FBUyxlQUFlLGlCQUFpQixPQUFPLEVBQUUsR0FBRyxTQUFTO0FBQUEsSUFDdEY7QUFBQSxFQUNFLENBQUM7QUFFRCxRQUFNLEtBQUssbUJBQW1CLGVBQWU7QUFDN0MsZUFBYSxrQkFBa0I7QUFLL0IsUUFBTSxrRUFBa0U7QUFDeEUsYUFBVyxpQkFBaUI7QUFDOUI7QUFFQSxTQUFTLGlDQUFpQztBQUN4QyxlQUFhLFFBQVEsYUFBVztBQUU5QixVQUFNLGNBQWM7QUFBQSxNQUNsQixxQkFBcUI7QUFBQSxNQUNyQixjQUFjO0FBQUEsTUFDZCxZQUFZO0FBQUEsTUFDWixXQUFXO0FBQUEsSUFDakI7QUFFSSxVQUFNLG1CQUFtQjtBQUFBLE1BQ3ZCLHFCQUFxQjtBQUFBLFFBQ25CLE1BQU07QUFBQSxRQUNOLElBQUk7QUFBQSxRQUNKLE1BQU07QUFBQSxNQUNkO0FBQUEsTUFDTSxjQUFjO0FBQUEsUUFDWixNQUFNO0FBQUEsUUFDTixJQUFJO0FBQUEsUUFDSixNQUFNO0FBQUEsTUFDZDtBQUFBLE1BQ00sWUFBWTtBQUFBLFFBQ1YsTUFBTTtBQUFBLFFBQ04sSUFBSTtBQUFBLFFBQ0osTUFBTTtBQUFBLE1BQ2Q7QUFBQSxNQUNNLFdBQVc7QUFBQSxRQUNULE1BQU07QUFBQSxRQUNOLElBQUk7QUFBQSxRQUNKLE1BQU07QUFBQSxNQUNkO0FBQUEsSUFDQTtBQUVJLGFBQVMsZUFBZSxPQUFPLE9BQU8sRUFBRSxFQUFFLFFBQVEsWUFBWSxPQUFPLEtBQUs7QUFDMUUsYUFBUyxlQUFlLFlBQVksT0FBTyxFQUFFLEVBQUUsUUFBUSxpQkFBaUIsT0FBTyxHQUFHLFFBQVE7QUFDMUYsYUFBUyxlQUFlLGVBQWUsT0FBTyxFQUFFLEVBQUUsUUFBUSxpQkFBaUIsT0FBTyxHQUFHLE1BQU07QUFDM0YsYUFBUyxlQUFlLGlCQUFpQixPQUFPLEVBQUUsRUFBRSxRQUFRLGlCQUFpQixPQUFPLEdBQUcsUUFBUTtBQUFBLEVBQ2pHLENBQUM7QUFFRCxRQUFNLDBEQUEwRDtBQUNsRTtBQVFBLElBQUksd0JBQXdCO0FBRTVCLFNBQVMsbUJBQW1CLE9BQU8sU0FBUztBQUMxQyxTQUFPLElBQUksUUFBUSxDQUFDLFlBQVk7QUFDOUIsNEJBQXdCO0FBRXhCLGFBQVMsZUFBZSx1QkFBdUIsRUFBRSxjQUFjO0FBQy9ELGFBQVMsZUFBZSx5QkFBeUIsRUFBRSxjQUFjO0FBQ2pFLGFBQVMsZUFBZSx1QkFBdUIsRUFBRSxRQUFRO0FBQ3pELGFBQVMsZUFBZSx1QkFBdUIsRUFBRSxVQUFVLElBQUksUUFBUTtBQUN2RSxhQUFTLGVBQWUsdUJBQXVCLEVBQUUsVUFBVSxPQUFPLFFBQVE7QUFHMUUsZUFBVyxNQUFNO0FBQ2YsZUFBUyxlQUFlLHVCQUF1QixHQUFHLE1BQUs7QUFBQSxJQUN6RCxHQUFHLEdBQUc7QUFBQSxFQUNSLENBQUM7QUFDSDtBQUVBLFNBQVMsb0JBQW9CLFdBQVcsTUFBTTtBQUM1QyxXQUFTLGVBQWUsdUJBQXVCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFDdkUsTUFBSSx1QkFBdUI7QUFDekIsMEJBQXNCLFFBQVE7QUFDOUIsNEJBQXdCO0FBQUEsRUFDMUI7QUFDRjtBQUdBLFNBQVMsZ0JBQWdCLE9BQU8sUUFBUTtBQUN0QyxXQUFTLGVBQWUsc0JBQXNCLEVBQUUsY0FBYztBQUM5RCxXQUFTLGVBQWUsd0JBQXdCLEVBQUUsY0FBYztBQUNoRSxXQUFTLGVBQWUsc0JBQXNCLEVBQUUsVUFBVSxPQUFPLFFBQVE7QUFDM0U7QUFFQSxTQUFTLG1CQUFtQjtBQUMxQixXQUFTLGVBQWUsc0JBQXNCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFDdEUsV0FBUyxlQUFlLHdCQUF3QixFQUFFLGNBQWM7QUFDbEU7QUFFQSxlQUFlLGlCQUFpQjtBQUM5QixRQUFNLFdBQVcsTUFBTSxtQkFBbUIsb0JBQW9CLDhDQUE4QztBQUM1RyxNQUFJLENBQUMsU0FBVTtBQUVmLFFBQU0sV0FBVyxTQUFTLGVBQWUsdUJBQXVCO0FBRWhFLE1BQUk7QUFDRixVQUFNLFdBQVcsTUFBTSxlQUFlLFFBQVE7QUFDOUM7QUFFQSxRQUFJLFVBQVU7QUFDWixzQkFBZ0Isb0JBQW9CLFFBQVE7QUFBQSxJQUM5QyxPQUFPO0FBQ0wsWUFBTSxzRUFBc0U7QUFBQSxJQUM5RTtBQUFBLEVBQ0YsU0FBUyxPQUFPO0FBQ2QsYUFBUyxjQUFjLE1BQU07QUFDN0IsYUFBUyxVQUFVLE9BQU8sUUFBUTtBQUFBLEVBQ3BDO0FBQ0Y7QUFFQSxlQUFlLGtCQUFrQjtBQUMvQixRQUFNLFdBQVcsTUFBTSxtQkFBbUIsc0JBQXNCLGdEQUFnRDtBQUNoSCxNQUFJLENBQUMsU0FBVTtBQUVmLFFBQU0sV0FBVyxTQUFTLGVBQWUsdUJBQXVCO0FBRWhFLE1BQUk7QUFDRixVQUFNLGFBQWEsTUFBTSxpQkFBaUIsUUFBUTtBQUNsRDtBQUNBLG9CQUFnQixvQkFBb0IsVUFBVTtBQUFBLEVBQ2hELFNBQVMsT0FBTztBQUNkLGFBQVMsY0FBYyxNQUFNO0FBQzdCLGFBQVMsVUFBVSxPQUFPLFFBQVE7QUFBQSxFQUNwQztBQUNGO0FBSUEsSUFBSSx3QkFBd0I7QUFDNUIsSUFBSSx5QkFBeUI7QUFDN0IsSUFBSSx5QkFBeUI7QUFHN0IsZUFBZSxtQkFBbUI7QUFDaEMsUUFBTSxjQUFjLE1BQU07QUFDMUIsUUFBTSxnQkFBZ0IsU0FBUyxlQUFlLGFBQWE7QUFDM0QsUUFBTSxjQUFjLFNBQVMsZUFBZSxjQUFjO0FBRTFELGNBQVksY0FBYyxZQUFZLFdBQVc7QUFFakQsTUFBSSxZQUFZLFdBQVcsV0FBVyxHQUFHO0FBQ3ZDLGtCQUFjLFlBQVk7QUFDMUI7QUFBQSxFQUNGO0FBRUEsZ0JBQWMsWUFBWTtBQUUxQixjQUFZLFdBQVcsUUFBUSxZQUFVO0FBQ3ZDLFVBQU0sV0FBVyxPQUFPLE9BQU8sWUFBWTtBQUMzQyxVQUFNLGFBQWEsU0FBUyxjQUFjLEtBQUs7QUFDL0MsZUFBVyxZQUFZO0FBQ3ZCLFFBQUksVUFBVTtBQUNaLGlCQUFXLE1BQU0sY0FBYztBQUMvQixpQkFBVyxNQUFNLGNBQWM7QUFBQSxJQUNqQztBQUVBLGVBQVcsWUFBWTtBQUFBO0FBQUE7QUFBQTtBQUFBLGNBSWIsV0FBVyxPQUFPLEVBQUUsR0FBRyxXQUFXLE9BQU8sWUFBWSxnQkFBZ0IsQ0FBQztBQUFBLGNBQ3RFLFdBQVcsMEZBQTBGLEVBQUU7QUFBQTtBQUFBO0FBQUEsY0FHdkcsV0FBVyxPQUFPLFdBQVcsb0JBQW9CLENBQUM7QUFBQTtBQUFBO0FBQUEsY0FHbEQsT0FBTyxpQkFBaUIsV0FBVyxZQUFZLFVBQVUsTUFBTSxJQUFJLEtBQUssT0FBTyxTQUFTLEVBQUUsbUJBQWtCLENBQUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBS2xILENBQUMsV0FBVyxpREFBaUQsT0FBTyxFQUFFLDJDQUEyQyxFQUFFO0FBQUEsd0RBQ3JFLE9BQU8sRUFBRTtBQUFBLHdEQUNULE9BQU8sRUFBRTtBQUFBLG1FQUNFLE9BQU8sRUFBRTtBQUFBO0FBQUE7QUFLeEUsVUFBTSxVQUFVLFdBQVcsaUJBQWlCLFFBQVE7QUFDcEQsWUFBUSxRQUFRLFNBQU87QUFDckIsVUFBSSxpQkFBaUIsU0FBUyxZQUFZO0FBQ3hDLGNBQU0sV0FBVyxJQUFJLFFBQVE7QUFDN0IsY0FBTSxTQUFTLElBQUksUUFBUTtBQUUzQixnQkFBUSxRQUFNO0FBQUEsVUFDWixLQUFLO0FBQ0gsa0JBQU0sbUJBQW1CLFFBQVE7QUFDakM7QUFBQSxVQUNGLEtBQUs7QUFDSCxxQ0FBeUIsVUFBVSxPQUFPLFFBQVE7QUFDbEQ7QUFBQSxVQUNGLEtBQUs7QUFDSCxrQkFBTSxzQkFBc0IsUUFBUTtBQUNwQztBQUFBLFVBQ0YsS0FBSztBQUNILGtCQUFNLHdCQUF3QixRQUFRO0FBQ3RDO0FBQUEsUUFDWjtBQUFBLE1BQ00sQ0FBQztBQUFBLElBQ0gsQ0FBQztBQUVELGtCQUFjLFlBQVksVUFBVTtBQUFBLEVBQ3RDLENBQUM7QUFDSDtBQUdBLGVBQWUsc0JBQXNCO0FBQ25DLFFBQU0saUJBQWdCO0FBQ3RCLGFBQVcsdUJBQXVCO0FBQ3BDO0FBR0EsU0FBUyxxQkFBcUI7QUFDNUIsV0FBUyxlQUFlLGtCQUFrQixFQUFFLFVBQVUsT0FBTyxRQUFRO0FBQ3ZFO0FBR0EsZUFBZSwyQkFBMkI7QUFDeEMsUUFBTSxFQUFFLE9BQU0sSUFBSztzQ0FBTSxPQUFPLFlBQVE7OztBQUN4QyxRQUFNLGVBQWUsT0FBTyxPQUFPLGFBQVk7QUFDL0MsMkJBQXlCLGFBQWEsU0FBUztBQUMvQyxXQUFTLGVBQWUsd0JBQXdCLEVBQUUsY0FBYztBQUdoRSxRQUFNLFFBQVEsdUJBQXVCLE1BQU0sR0FBRztBQUM5QyxRQUFNLGNBQWMsSUFBSSxXQUFXLENBQUM7QUFDcEMsU0FBTyxnQkFBZ0IsV0FBVztBQUNsQyxRQUFNLFVBQVU7QUFBQSxJQUNkLFlBQVksQ0FBQyxJQUFJO0FBQUE7QUFBQSxJQUNqQixJQUFLLFlBQVksQ0FBQyxJQUFJO0FBQUE7QUFBQSxJQUN0QixJQUFLLFlBQVksQ0FBQyxJQUFJO0FBQUE7QUFBQSxFQUMxQjtBQUVFLDJCQUF5QixRQUFRLElBQUksUUFBTSxFQUFFLE9BQU8sR0FBRyxNQUFNLE1BQU0sQ0FBQyxFQUFDLEVBQUc7QUFHeEUsV0FBUyxlQUFlLHlCQUF5QixFQUFFLGNBQWUsdUJBQXVCLENBQUMsRUFBRSxRQUFRO0FBQ3BHLFdBQVMsZUFBZSx5QkFBeUIsRUFBRSxjQUFlLHVCQUF1QixDQUFDLEVBQUUsUUFBUTtBQUNwRyxXQUFTLGVBQWUseUJBQXlCLEVBQUUsY0FBZSx1QkFBdUIsQ0FBQyxFQUFFLFFBQVE7QUFDdEc7QUFHQSxlQUFlLDZCQUE2QjtBQUMxQyxRQUFNLFdBQVcsU0FBUyxlQUFlLDJCQUEyQixFQUFFLE1BQU07QUFDNUUsUUFBTSx1QkFBdUIsU0FBUyxlQUFlLDBCQUEwQjtBQUcvRSxRQUFNLFFBQVEsU0FBUyxlQUFlLHFCQUFxQixFQUFFLE1BQU0sT0FBTztBQUMxRSxRQUFNLFFBQVEsU0FBUyxlQUFlLHFCQUFxQixFQUFFLE1BQU0sT0FBTztBQUMxRSxRQUFNLFFBQVEsU0FBUyxlQUFlLHFCQUFxQixFQUFFLE1BQU0sT0FBTztBQUUxRSxNQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxPQUFPO0FBQzlCLHlCQUFxQixjQUFjO0FBQ25DLHlCQUFxQixVQUFVLE9BQU8sUUFBUTtBQUM5QztBQUFBLEVBQ0Y7QUFFQSxNQUFJLFVBQVUsdUJBQXVCLENBQUMsRUFBRSxLQUFLLFlBQVcsS0FDcEQsVUFBVSx1QkFBdUIsQ0FBQyxFQUFFLEtBQUssWUFBVyxLQUNwRCxVQUFVLHVCQUF1QixDQUFDLEVBQUUsS0FBSyxZQUFXLEdBQUk7QUFDMUQseUJBQXFCLGNBQWM7QUFDbkMseUJBQXFCLFVBQVUsT0FBTyxRQUFRO0FBQzlDO0FBQUEsRUFDRjtBQUdBLHVCQUFxQixVQUFVLElBQUksUUFBUTtBQUczQyxXQUFTLGVBQWUsMkJBQTJCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFFM0UsUUFBTSxXQUFXLE1BQU0sbUJBQW1CLHVCQUF1QixzREFBc0Q7QUFFdkgsTUFBSSxDQUFDLFVBQVU7QUFFYixhQUFTLGVBQWUsMkJBQTJCLEVBQUUsVUFBVSxPQUFPLFFBQVE7QUFDOUU7QUFBQSxFQUNGO0FBRUEsTUFBSTtBQUNGLFVBQU0sVUFBVSxVQUFVLElBQUksVUFBVSxZQUFZLElBQUk7QUFHeEQsYUFBUyxlQUFlLDJCQUEyQixFQUFFLFFBQVE7QUFDN0QsYUFBUyxlQUFlLHFCQUFxQixFQUFFLFFBQVE7QUFDdkQsYUFBUyxlQUFlLHFCQUFxQixFQUFFLFFBQVE7QUFDdkQsYUFBUyxlQUFlLHFCQUFxQixFQUFFLFFBQVE7QUFDdkQsNkJBQXlCO0FBQ3pCLDZCQUF5QjtBQUd6QixVQUFNLGlCQUFnQjtBQUV0QixVQUFNLDhCQUE4QjtBQUFBLEVBQ3RDLFNBQVMsT0FBTztBQUNkLFVBQU0sNEJBQTRCLE1BQU0sT0FBTztBQUFBLEVBQ2pEO0FBQ0Y7QUFHQSxlQUFlLHdCQUF3QjtBQUNyQyxRQUFNLFdBQVcsU0FBUyxlQUFlLDRCQUE0QixFQUFFLE1BQU07QUFDN0UsUUFBTSxXQUFXLFNBQVMsZUFBZSwwQkFBMEIsRUFBRSxNQUFNO0FBQzNFLFFBQU0sV0FBVyxTQUFTLGVBQWUseUJBQXlCO0FBRWxFLFdBQVMsVUFBVSxJQUFJLFFBQVE7QUFFL0IsTUFBSSxDQUFDLFVBQVU7QUFDYixhQUFTLGNBQWM7QUFDdkIsYUFBUyxVQUFVLE9BQU8sUUFBUTtBQUNsQztBQUFBLEVBQ0Y7QUFHQSxXQUFTLGVBQWUseUJBQXlCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFFekUsUUFBTSxXQUFXLE1BQU0sbUJBQW1CLHVCQUF1QiwyREFBMkQ7QUFFNUgsTUFBSSxDQUFDLFVBQVU7QUFFYixhQUFTLGVBQWUseUJBQXlCLEVBQUUsVUFBVSxPQUFPLFFBQVE7QUFDNUU7QUFBQSxFQUNGO0FBRUEsTUFBSTtBQUNGLFVBQU0sVUFBVSxZQUFZLEVBQUUsU0FBUSxHQUFJLFVBQVUsWUFBWSxJQUFJO0FBR3BFLGFBQVMsZUFBZSw0QkFBNEIsRUFBRSxRQUFRO0FBQzlELGFBQVMsZUFBZSwwQkFBMEIsRUFBRSxRQUFRO0FBRzVELFVBQU0saUJBQWdCO0FBRXRCLFVBQU0sK0JBQStCO0FBQUEsRUFDdkMsU0FBUyxPQUFPO0FBRWQsYUFBUyxjQUFjLE1BQU07QUFDN0IsYUFBUyxVQUFVLE9BQU8sUUFBUTtBQUNsQyxhQUFTLGVBQWUseUJBQXlCLEVBQUUsVUFBVSxPQUFPLFFBQVE7QUFBQSxFQUM5RTtBQUNGO0FBR0EsZUFBZSx1QkFBdUI7QUFDcEMsUUFBTSxXQUFXLFNBQVMsZUFBZSwyQkFBMkIsRUFBRSxNQUFNO0FBQzVFLFFBQU0sYUFBYSxTQUFTLGVBQWUsMEJBQTBCLEVBQUUsTUFBTTtBQUM3RSxRQUFNLFdBQVcsU0FBUyxlQUFlLHdCQUF3QjtBQUVqRSxXQUFTLFVBQVUsSUFBSSxRQUFRO0FBRS9CLE1BQUksQ0FBQyxZQUFZO0FBQ2YsYUFBUyxjQUFjO0FBQ3ZCLGFBQVMsVUFBVSxPQUFPLFFBQVE7QUFDbEM7QUFBQSxFQUNGO0FBR0EsV0FBUyxlQUFlLHdCQUF3QixFQUFFLFVBQVUsSUFBSSxRQUFRO0FBRXhFLFFBQU0sV0FBVyxNQUFNLG1CQUFtQix1QkFBdUIsMkRBQTJEO0FBRTVILE1BQUksQ0FBQyxVQUFVO0FBRWIsYUFBUyxlQUFlLHdCQUF3QixFQUFFLFVBQVUsT0FBTyxRQUFRO0FBQzNFO0FBQUEsRUFDRjtBQUVBLE1BQUk7QUFDRixVQUFNLFVBQVUsY0FBYyxFQUFFLFdBQVUsR0FBSSxVQUFVLFlBQVksSUFBSTtBQUd4RSxhQUFTLGVBQWUsMkJBQTJCLEVBQUUsUUFBUTtBQUM3RCxhQUFTLGVBQWUsMEJBQTBCLEVBQUUsUUFBUTtBQUc1RCxVQUFNLGlCQUFnQjtBQUV0QixVQUFNLCtCQUErQjtBQUFBLEVBQ3ZDLFNBQVMsT0FBTztBQUVkLGFBQVMsY0FBYyxNQUFNO0FBQzdCLGFBQVMsVUFBVSxPQUFPLFFBQVE7QUFDbEMsYUFBUyxlQUFlLHdCQUF3QixFQUFFLFVBQVUsT0FBTyxRQUFRO0FBQUEsRUFDN0U7QUFDRjtBQUdBLGVBQWUsbUJBQW1CLFVBQVU7QUFDMUMsTUFBSTtBQUNGLFVBQU0sZ0JBQWdCLFFBQVE7QUFHOUIsVUFBTSxpQkFBZ0I7QUFHdEIsUUFBSSxhQUFhLFlBQVk7QUFDM0IsWUFBTSxTQUFTLE1BQU07QUFDckIsbUJBQWEsVUFBVSxPQUFPO0FBQzlCO0lBQ0Y7QUFFQSxVQUFNLGtDQUFrQztBQUFBLEVBQzFDLFNBQVMsT0FBTztBQUNkLFVBQU0sNkJBQTZCLE1BQU0sT0FBTztBQUFBLEVBQ2xEO0FBQ0Y7QUFHQSxTQUFTLHlCQUF5QixVQUFVLGlCQUFpQjtBQUMzRCwwQkFBd0I7QUFDeEIsV0FBUyxlQUFlLDhCQUE4QixFQUFFLFFBQVEsbUJBQW1CO0FBQ25GLFdBQVMsZUFBZSxxQkFBcUIsRUFBRSxVQUFVLE9BQU8sUUFBUTtBQUMxRTtBQUdBLGVBQWUsNEJBQTRCO0FBQ3pDLFFBQU0sY0FBYyxTQUFTLGVBQWUsOEJBQThCLEVBQUUsTUFBTTtBQUNsRixRQUFNLFdBQVcsU0FBUyxlQUFlLGNBQWM7QUFFdkQsV0FBUyxVQUFVLElBQUksUUFBUTtBQUUvQixNQUFJLENBQUMsYUFBYTtBQUNoQixhQUFTLGNBQWM7QUFDdkIsYUFBUyxVQUFVLE9BQU8sUUFBUTtBQUNsQztBQUFBLEVBQ0Y7QUFFQSxNQUFJO0FBQ0YsVUFBTSxhQUFhLHVCQUF1QixXQUFXO0FBR3JELGFBQVMsZUFBZSxxQkFBcUIsRUFBRSxVQUFVLElBQUksUUFBUTtBQUNyRSw0QkFBd0I7QUFHeEIsVUFBTSxpQkFBZ0I7QUFFdEIsVUFBTSw4QkFBOEI7QUFBQSxFQUN0QyxTQUFTLE9BQU87QUFDZCxhQUFTLGNBQWMsTUFBTTtBQUM3QixhQUFTLFVBQVUsT0FBTyxRQUFRO0FBQUEsRUFDcEM7QUFDRjtBQUdBLGVBQWUsd0JBQXdCLFVBQVU7QUFDL0MsUUFBTSxZQUFZO0FBQUEsSUFDaEI7QUFBQSxFQUtKO0FBRUUsTUFBSSxDQUFDLFVBQVc7QUFFaEIsUUFBTSxXQUFXLE1BQU0sbUJBQW1CLGlCQUFpQiwyQ0FBMkM7QUFFdEcsTUFBSSxDQUFDLFNBQVU7QUFFZixNQUFJO0FBQ0YsVUFBTSxhQUFhLFVBQVUsUUFBUTtBQUNyQztBQUdBLFVBQU0saUJBQWdCO0FBR3RCLFVBQU0sY0FBYyxNQUFNO0FBQzFCLFFBQUksWUFBWSxXQUFXLFdBQVcsR0FBRztBQUN2QyxtQkFBYSxhQUFhO0FBQzFCLG1CQUFhLFVBQVU7QUFDdkIsaUJBQVcsY0FBYztBQUFBLElBQzNCO0FBRUEsVUFBTSw4QkFBOEI7QUFBQSxFQUN0QyxTQUFTLE9BQU87QUFDZCxVQUFNLDRCQUE0QixNQUFNLE9BQU87QUFBQSxFQUNqRDtBQUNGO0FBR0EsZUFBZSxzQkFBc0IsVUFBVTtBQUM3QyxRQUFNLFdBQVcsTUFBTSxtQkFBbUIsaUJBQWlCLDhDQUE4QztBQUV6RyxNQUFJLENBQUMsU0FBVTtBQUVmLE1BQUk7QUFFRixVQUFNLFdBQVcsTUFBTSx3QkFBd0IsVUFBVSxRQUFRO0FBRWpFLFFBQUksVUFBVTtBQUNaLHNCQUFnQixlQUFlLFFBQVE7QUFBQSxJQUN6QyxPQUFPO0FBRUwsWUFBTSxhQUFhLE1BQU0sMEJBQTBCLFVBQVUsUUFBUTtBQUNyRSxzQkFBZ0IsZUFBZSxVQUFVO0FBQUEsSUFDM0M7QUFFQTtFQUNGLFNBQVMsT0FBTztBQUNkLFVBQU0sNkJBQTZCLE1BQU0sT0FBTztBQUFBLEVBQ2xEO0FBQ0Y7QUFHQSxlQUFlLCtCQUErQixRQUFRLFdBQVc7QUFFL0QsUUFBTSxhQUFZO0FBQ2xCO0FBR0EsV0FBUyxlQUFlLHdCQUF3QixFQUFFLGNBQWM7QUFHaEUsUUFBTSxTQUFTLE1BQU07QUFDckIsTUFBSSxVQUFVLE9BQU8sU0FBUztBQUM1QixhQUFTLGVBQWUsMkJBQTJCLEVBQUUsY0FBYyxPQUFPO0FBQUEsRUFDNUUsT0FBTztBQUNMLGFBQVMsZUFBZSwyQkFBMkIsRUFBRSxjQUFjO0FBQUEsRUFDckU7QUFHQSxhQUFXLDRCQUE0QjtBQUd2QyxXQUFTLGVBQWUsd0JBQXdCLEVBQUUsaUJBQWlCLFNBQVMsWUFBWTtBQUN0RixRQUFJO0FBQ0YsWUFBTSxPQUFPLFFBQVEsWUFBWTtBQUFBLFFBQy9CLE1BQU07QUFBQSxRQUNOO0FBQUEsUUFDQSxVQUFVO0FBQUEsTUFDbEIsQ0FBTztBQUdELGFBQU8sTUFBSztBQUFBLElBQ2QsU0FBUyxPQUFPO0FBQ2QsWUFBTSxpQ0FBaUMsY0FBYyxNQUFNLE9BQU8sQ0FBQztBQUFBLElBQ3JFO0FBQUEsRUFDRixDQUFDO0FBR0QsV0FBUyxlQUFlLHVCQUF1QixFQUFFLGlCQUFpQixTQUFTLFlBQVk7QUFDckYsUUFBSTtBQUNGLFlBQU0sT0FBTyxRQUFRLFlBQVk7QUFBQSxRQUMvQixNQUFNO0FBQUEsUUFDTjtBQUFBLFFBQ0EsVUFBVTtBQUFBLE1BQ2xCLENBQU87QUFHRCxhQUFPLE1BQUs7QUFBQSxJQUNkLFNBQVMsT0FBTztBQUNkLFlBQU0saUNBQWlDLE1BQU0sT0FBTztBQUNwRCxhQUFPLE1BQUs7QUFBQSxJQUNkO0FBQUEsRUFDRixDQUFDO0FBQ0g7QUFJQSxlQUFlLGtCQUFrQixTQUFTLFdBQVcsUUFBUTtBQUUzRCx1QkFBcUIsV0FBVyxFQUFFLFNBQVMsV0FBVyxPQUFNO0FBRTVELE1BQUk7QUFFRixVQUFNLGNBQWMsTUFBTTBCLGdCQUFvQixPQUFPO0FBQ3JELFVBQU0sY0FBYyxPQUFPLFdBQVc7QUFDdEMsVUFBTSxlQUFlLE9BQU8sV0FBVyxJQUFJO0FBSTNDLFVBQU0sWUFBWSxlQUFlLEtBQUssUUFBUSxDQUFDO0FBQy9DLFVBQU0sYUFBYSxhQUFhLFFBQVEsQ0FBQztBQUN6QyxVQUFNLFlBQVksZUFBZSxLQUFLLFFBQVEsQ0FBQztBQUcvQyxhQUFTLGVBQWUsZ0JBQWdCLEVBQUUsY0FBYyxHQUFHLFFBQVE7QUFDbkUsYUFBUyxlQUFlLGtCQUFrQixFQUFFLGNBQWMsR0FBRyxVQUFVO0FBQ3ZFLGFBQVMsZUFBZSxnQkFBZ0IsRUFBRSxjQUFjLEdBQUcsUUFBUTtBQUduRSxRQUFJO0FBQ0YsWUFBTSxrQkFBa0IsTUFBTUMsWUFBZ0IsU0FBUyxTQUFTO0FBQ2hFLFlBQU0sZUFBZSxPQUFPLGVBQWU7QUFFM0MsZUFBUyxlQUFlLGtCQUFrQixFQUFFLGNBQWMsYUFBYTtBQUd2RSxZQUFNLFlBQVksZUFBZTtBQUNqQyxZQUFNLFlBQVlDLFlBQW1CLFVBQVUsU0FBUSxDQUFFO0FBQ3pELGVBQVMsZUFBZSxZQUFZLEVBQUUsY0FBYyxHQUFHLFdBQVcsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDLElBQUksTUFBTTtBQUdqRyxZQUFNLGVBQWUsTUFBTTtBQUN6QixjQUFNLGdCQUFnQixTQUFTLGNBQWMsaUNBQWlDLEdBQUc7QUFDakYsWUFBSTtBQUVKLFlBQUksa0JBQWtCLFFBQVE7QUFDNUIseUJBQWUsV0FBVyxRQUFRO0FBQUEsUUFDcEMsV0FBVyxrQkFBa0IsVUFBVTtBQUNyQyx5QkFBZSxXQUFXLFVBQVU7QUFBQSxRQUN0QyxXQUFXLGtCQUFrQixRQUFRO0FBQ25DLHlCQUFlLFdBQVcsUUFBUTtBQUFBLFFBQ3BDLFdBQVcsa0JBQWtCLFVBQVU7QUFDckMseUJBQWUsV0FBVyxTQUFTLGVBQWUscUJBQXFCLEVBQUUsS0FBSyxLQUFLLFdBQVcsVUFBVTtBQUFBLFFBQzFHLE9BQU87QUFDTCx5QkFBZSxXQUFXLFVBQVU7QUFBQSxRQUN0QztBQUVBLGNBQU0sc0JBQXNCLE9BQU8sS0FBSyxNQUFNLGVBQWUsR0FBRyxDQUFDO0FBQ2pFLGNBQU0sb0JBQW9CLGVBQWU7QUFDekMsY0FBTSxvQkFBb0JBLFlBQW1CLGtCQUFrQixTQUFRLENBQUU7QUFDekUsaUJBQVMsZUFBZSxZQUFZLEVBQUUsY0FBYyxHQUFHLFdBQVcsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxNQUFNO0FBQUEsTUFDM0c7QUFHQSxlQUFTLGlCQUFpQix5QkFBeUIsRUFBRSxRQUFRLFdBQVM7QUFDcEUsY0FBTSxpQkFBaUIsVUFBVSxNQUFNO0FBQ3JDO0FBR0EsbUJBQVMsaUJBQWlCLGFBQWEsRUFBRSxRQUFRLFdBQVM7QUFDeEQsa0JBQU0sUUFBUSxNQUFNLGNBQWMseUJBQXlCO0FBQzNELGdCQUFJLFNBQVMsTUFBTSxTQUFTO0FBQzFCLG9CQUFNLE1BQU0sY0FBYztBQUMxQixvQkFBTSxNQUFNLGNBQWM7QUFBQSxZQUM1QixPQUFPO0FBQ0wsb0JBQU0sTUFBTSxjQUFjO0FBQzFCLG9CQUFNLE1BQU0sY0FBYztBQUFBLFlBQzVCO0FBQUEsVUFDRixDQUFDO0FBR0QsZ0JBQU0sa0JBQWtCLFNBQVMsZUFBZSw0QkFBNEI7QUFDNUUsY0FBSSxNQUFNLFVBQVUsWUFBWSxNQUFNLFNBQVM7QUFDN0MsNEJBQWdCLFVBQVUsT0FBTyxRQUFRO0FBRXpDLHVCQUFXLE1BQU07QUFDZix1QkFBUyxlQUFlLHFCQUFxQixFQUFFLE1BQUs7QUFBQSxZQUN0RCxHQUFHLEdBQUc7QUFBQSxVQUNSLFdBQVcsaUJBQWlCO0FBQzFCLDRCQUFnQixVQUFVLElBQUksUUFBUTtBQUFBLFVBQ3hDO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSCxDQUFDO0FBR0QsZUFBUyxpQkFBaUIsYUFBYSxFQUFFLFFBQVEsV0FBUztBQUN4RCxjQUFNLFFBQVEsTUFBTSxjQUFjLHlCQUF5QjtBQUMzRCxZQUFJLFNBQVMsTUFBTSxTQUFTO0FBQzFCLGdCQUFNLE1BQU0sY0FBYztBQUMxQixnQkFBTSxNQUFNLGNBQWM7QUFBQSxRQUM1QjtBQUFBLE1BQ0YsQ0FBQztBQUdELFlBQU0saUJBQWlCLFNBQVMsZUFBZSxxQkFBcUI7QUFDcEUscUJBQWUsaUJBQWlCLFNBQVMsTUFBTTtBQUM3QyxpQkFBUyxlQUFlLGtCQUFrQixFQUFFLFVBQVU7QUFDdEQ7TUFDRixDQUFDO0FBQUEsSUFFSCxTQUFTLGtCQUFrQjtBQUN6QixjQUFRLE1BQU0seUJBQXlCLGdCQUFnQjtBQUN2RCxlQUFTLGVBQWUsa0JBQWtCLEVBQUUsY0FBYztBQUMxRCxlQUFTLGVBQWUsWUFBWSxFQUFFLGNBQWM7QUFBQSxJQUN0RDtBQUFBLEVBRUYsU0FBUyxPQUFPO0FBQ2QsWUFBUSxNQUFNLDZCQUE2QixLQUFLO0FBQ2hELGFBQVMsZUFBZSxnQkFBZ0IsRUFBRSxjQUFjO0FBQ3hELGFBQVMsZUFBZSxrQkFBa0IsRUFBRSxjQUFjO0FBQzFELGFBQVMsZUFBZSxnQkFBZ0IsRUFBRSxjQUFjO0FBQUEsRUFDMUQ7QUFDRjtBQUdBLFNBQVMsc0JBQXNCO0FBQzdCLFFBQU0sZ0JBQWdCLFNBQVMsY0FBYyxpQ0FBaUMsR0FBRztBQUVqRixNQUFJLGtCQUFrQixVQUFVO0FBQzlCLFVBQU0sYUFBYSxXQUFXLFNBQVMsZUFBZSxxQkFBcUIsRUFBRSxLQUFLO0FBQ2xGLFFBQUksY0FBYyxhQUFhLEdBQUc7QUFFaEMsYUFBTzNCLFdBQWtCLFdBQVcsU0FBUSxHQUFJLE1BQU0sRUFBRTtJQUMxRDtBQUFBLEVBQ0Y7QUFHQSxNQUFJO0FBQ0osTUFBSSxrQkFBa0IsUUFBUTtBQUM1QixlQUFXLFNBQVMsZUFBZSxnQkFBZ0IsRUFBRTtBQUFBLEVBQ3ZELFdBQVcsa0JBQWtCLFFBQVE7QUFDbkMsZUFBVyxTQUFTLGVBQWUsZ0JBQWdCLEVBQUU7QUFBQSxFQUN2RCxPQUFPO0FBQ0wsZUFBVyxTQUFTLGVBQWUsa0JBQWtCLEVBQUU7QUFBQSxFQUN6RDtBQUVBLFFBQU0sT0FBTyxXQUFXLFFBQVE7QUFDaEMsTUFBSSxRQUFRLE9BQU8sR0FBRztBQUNwQixXQUFPQSxXQUFrQixLQUFLLFNBQVEsR0FBSSxNQUFNLEVBQUU7RUFDcEQ7QUFHQSxTQUFPO0FBQ1Q7QUFHQSxlQUFlLHFCQUFxQixTQUFTLFNBQVM7QUFDcEQsTUFBSTtBQUNGLFVBQU0sV0FBVyxNQUFNYSxvQkFBd0IsU0FBUyxTQUFTLFNBQVM7QUFDMUUsVUFBTSxRQUFRLFNBQVMsVUFBVSxFQUFFO0FBQ25DLGFBQVMsZUFBZSxrQkFBa0IsRUFBRSxjQUFjO0FBQUEsRUFFNUQsU0FBUyxPQUFPO0FBQ2QsWUFBUSxNQUFNLHlCQUF5QixLQUFLO0FBQzVDLGFBQVMsZUFBZSxrQkFBa0IsRUFBRSxjQUFjO0FBQUEsRUFDNUQ7QUFDRjtBQUtBLGVBQWUsc0JBQXNCLFNBQVMsV0FBVyxRQUFRO0FBRS9ELHVCQUFxQixPQUFPLEVBQUUsU0FBUyxXQUFXLE9BQU07QUFFeEQsTUFBSTtBQUVGLFVBQU0sY0FBYyxNQUFNWSxnQkFBb0IsT0FBTztBQUNyRCxVQUFNLGNBQWMsT0FBTyxXQUFXO0FBQ3RDLFVBQU0sZUFBZSxPQUFPLFdBQVcsSUFBSTtBQUUzQyxVQUFNLFlBQVksZUFBZSxLQUFLLFFBQVEsQ0FBQztBQUMvQyxVQUFNLGFBQWEsYUFBYSxRQUFRLENBQUM7QUFDekMsVUFBTSxZQUFZLGVBQWUsS0FBSyxRQUFRLENBQUM7QUFFL0MsYUFBUyxlQUFlLHFCQUFxQixFQUFFLGNBQWMsR0FBRyxRQUFRO0FBQ3hFLGFBQVMsZUFBZSx1QkFBdUIsRUFBRSxjQUFjLEdBQUcsVUFBVTtBQUM1RSxhQUFTLGVBQWUscUJBQXFCLEVBQUUsY0FBYyxHQUFHLFFBQVE7QUFFeEUsUUFBSTtBQUNGLFlBQU0sa0JBQWtCLE1BQU1DLFlBQWdCLFNBQVMsU0FBUztBQUNoRSxZQUFNLGVBQWUsT0FBTyxlQUFlO0FBRTNDLGVBQVMsZUFBZSxvQkFBb0IsRUFBRSxjQUFjLGFBQWE7QUFFekUsWUFBTSxZQUFZLGVBQWU7QUFDakMsWUFBTSxZQUFZQyxZQUFtQixVQUFVLFNBQVEsQ0FBRTtBQUN6RCxlQUFTLGVBQWUsY0FBYyxFQUFFLGNBQWMsR0FBRyxXQUFXLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxJQUFJLE1BQU07QUFFbkcsWUFBTSxlQUFlLE1BQU07QUFDekIsY0FBTSxnQkFBZ0IsU0FBUyxjQUFjLHNDQUFzQyxHQUFHO0FBQ3RGLFlBQUk7QUFFSixZQUFJLGtCQUFrQixRQUFRO0FBQzVCLHlCQUFlLFdBQVcsUUFBUTtBQUFBLFFBQ3BDLFdBQVcsa0JBQWtCLFVBQVU7QUFDckMseUJBQWUsV0FBVyxVQUFVO0FBQUEsUUFDdEMsV0FBVyxrQkFBa0IsUUFBUTtBQUNuQyx5QkFBZSxXQUFXLFFBQVE7QUFBQSxRQUNwQyxXQUFXLGtCQUFrQixVQUFVO0FBQ3JDLHlCQUFlLFdBQVcsU0FBUyxlQUFlLHVCQUF1QixFQUFFLEtBQUssS0FBSyxXQUFXLFVBQVU7QUFBQSxRQUM1RyxPQUFPO0FBQ0wseUJBQWUsV0FBVyxVQUFVO0FBQUEsUUFDdEM7QUFFQSxjQUFNLHNCQUFzQixPQUFPLEtBQUssTUFBTSxlQUFlLEdBQUcsQ0FBQztBQUNqRSxjQUFNLG9CQUFvQixlQUFlO0FBQ3pDLGNBQU0sb0JBQW9CQSxZQUFtQixrQkFBa0IsU0FBUSxDQUFFO0FBQ3pFLGlCQUFTLGVBQWUsY0FBYyxFQUFFLGNBQWMsR0FBRyxXQUFXLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxDQUFDLElBQUksTUFBTTtBQUFBLE1BQzdHO0FBRUEsZUFBUyxpQkFBaUIsOEJBQThCLEVBQUUsUUFBUSxXQUFTO0FBQ3pFLGNBQU0saUJBQWlCLFVBQVUsTUFBTTtBQUNyQztBQUVBLG1CQUFTLGlCQUFpQixhQUFhLEVBQUUsUUFBUSxXQUFTO0FBQ3hELGtCQUFNLFFBQVEsTUFBTSxjQUFjLDhCQUE4QjtBQUNoRSxnQkFBSSxTQUFTLE1BQU0sU0FBUztBQUMxQixvQkFBTSxNQUFNLGNBQWM7QUFDMUIsb0JBQU0sTUFBTSxjQUFjO0FBQUEsWUFDNUIsT0FBTztBQUNMLG9CQUFNLE1BQU0sY0FBYztBQUMxQixvQkFBTSxNQUFNLGNBQWM7QUFBQSxZQUM1QjtBQUFBLFVBQ0YsQ0FBQztBQUVELGdCQUFNLGtCQUFrQixTQUFTLGVBQWUsaUNBQWlDO0FBQ2pGLGNBQUksTUFBTSxVQUFVLFlBQVksTUFBTSxTQUFTO0FBQzdDLDRCQUFnQixVQUFVLE9BQU8sUUFBUTtBQUN6Qyx1QkFBVyxNQUFNO0FBQ2YsdUJBQVMsZUFBZSx1QkFBdUIsRUFBRSxNQUFLO0FBQUEsWUFDeEQsR0FBRyxHQUFHO0FBQUEsVUFDUixXQUFXLGlCQUFpQjtBQUMxQiw0QkFBZ0IsVUFBVSxJQUFJLFFBQVE7QUFBQSxVQUN4QztBQUFBLFFBQ0YsQ0FBQztBQUFBLE1BQ0gsQ0FBQztBQUVELGVBQVMsaUJBQWlCLGFBQWEsRUFBRSxRQUFRLFdBQVM7QUFDeEQsY0FBTSxRQUFRLE1BQU0sY0FBYyw4QkFBOEI7QUFDaEUsWUFBSSxTQUFTLE1BQU0sU0FBUztBQUMxQixnQkFBTSxNQUFNLGNBQWM7QUFDMUIsZ0JBQU0sTUFBTSxjQUFjO0FBQUEsUUFDNUI7QUFBQSxNQUNGLENBQUM7QUFFRCxZQUFNLGlCQUFpQixTQUFTLGVBQWUsdUJBQXVCO0FBQ3RFLHFCQUFlLGlCQUFpQixTQUFTLE1BQU07QUFDN0MsaUJBQVMsZUFBZSx1QkFBdUIsRUFBRSxVQUFVO0FBQzNEO01BQ0YsQ0FBQztBQUFBLElBRUgsU0FBUyxrQkFBa0I7QUFDekIsY0FBUSxNQUFNLHlCQUF5QixnQkFBZ0I7QUFDdkQsZUFBUyxlQUFlLG9CQUFvQixFQUFFLGNBQWM7QUFDNUQsZUFBUyxlQUFlLGNBQWMsRUFBRSxjQUFjO0FBQUEsSUFDeEQ7QUFBQSxFQUVGLFNBQVMsT0FBTztBQUNkLFlBQVEsTUFBTSw2QkFBNkIsS0FBSztBQUNoRCxhQUFTLGVBQWUscUJBQXFCLEVBQUUsY0FBYztBQUM3RCxhQUFTLGVBQWUsdUJBQXVCLEVBQUUsY0FBYztBQUMvRCxhQUFTLGVBQWUscUJBQXFCLEVBQUUsY0FBYztBQUFBLEVBQy9EO0FBQ0Y7QUFHQSxTQUFTLDBCQUEwQjtBQUNqQyxRQUFNLGdCQUFnQixTQUFTLGNBQWMsc0NBQXNDLEdBQUc7QUFFdEYsTUFBSSxrQkFBa0IsVUFBVTtBQUM5QixVQUFNLGFBQWEsV0FBVyxTQUFTLGVBQWUsdUJBQXVCLEVBQUUsS0FBSztBQUNwRixRQUFJLGNBQWMsYUFBYSxHQUFHO0FBQ2hDLGFBQU8zQixXQUFrQixXQUFXLFNBQVEsR0FBSSxNQUFNLEVBQUU7SUFDMUQ7QUFBQSxFQUNGO0FBRUEsTUFBSTtBQUNKLE1BQUksa0JBQWtCLFFBQVE7QUFDNUIsZUFBVyxTQUFTLGVBQWUscUJBQXFCLEVBQUU7QUFBQSxFQUM1RCxXQUFXLGtCQUFrQixRQUFRO0FBQ25DLGVBQVcsU0FBUyxlQUFlLHFCQUFxQixFQUFFO0FBQUEsRUFDNUQsT0FBTztBQUNMLGVBQVcsU0FBUyxlQUFlLHVCQUF1QixFQUFFO0FBQUEsRUFDOUQ7QUFFQSxRQUFNLE9BQU8sV0FBVyxRQUFRO0FBQ2hDLE1BQUksUUFBUSxPQUFPLEdBQUc7QUFDcEIsV0FBT0EsV0FBa0IsS0FBSyxTQUFRLEdBQUksTUFBTSxFQUFFO0VBQ3BEO0FBRUEsU0FBTztBQUNUO0FBR0EsZUFBZSx1QkFBdUIsU0FBUyxXQUFXLFFBQVE7QUFFaEUsdUJBQXFCLFFBQVEsRUFBRSxTQUFTLFdBQVcsT0FBTTtBQUV6RCxNQUFJO0FBRUYsVUFBTSxjQUFjLE1BQU15QixnQkFBb0IsT0FBTztBQUNyRCxVQUFNLGNBQWMsT0FBTyxXQUFXO0FBQ3RDLFVBQU0sZUFBZSxPQUFPLFdBQVcsSUFBSTtBQUUzQyxVQUFNLFlBQVksZUFBZSxLQUFLLFFBQVEsQ0FBQztBQUMvQyxVQUFNLGFBQWEsYUFBYSxRQUFRLENBQUM7QUFDekMsVUFBTSxZQUFZLGVBQWUsS0FBSyxRQUFRLENBQUM7QUFFL0MsYUFBUyxlQUFlLHNCQUFzQixFQUFFLGNBQWMsR0FBRyxRQUFRO0FBQ3pFLGFBQVMsZUFBZSx3QkFBd0IsRUFBRSxjQUFjLEdBQUcsVUFBVTtBQUM3RSxhQUFTLGVBQWUsc0JBQXNCLEVBQUUsY0FBYyxHQUFHLFFBQVE7QUFFekUsUUFBSTtBQUNGLFlBQU0sa0JBQWtCLE1BQU1DLFlBQWdCLFNBQVMsU0FBUztBQUNoRSxZQUFNLGVBQWUsT0FBTyxlQUFlO0FBRTNDLGVBQVMsZUFBZSxxQkFBcUIsRUFBRSxjQUFjLGFBQWE7QUFFMUUsWUFBTSxZQUFZLGVBQWU7QUFDakMsWUFBTSxZQUFZQyxZQUFtQixVQUFVLFNBQVEsQ0FBRTtBQUN6RCxlQUFTLGVBQWUsZUFBZSxFQUFFLGNBQWMsR0FBRyxXQUFXLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxJQUFJLE1BQU07QUFFcEcsWUFBTSxlQUFlLE1BQU07QUFDekIsY0FBTSxnQkFBZ0IsU0FBUyxjQUFjLHVDQUF1QyxHQUFHO0FBQ3ZGLFlBQUk7QUFFSixZQUFJLGtCQUFrQixRQUFRO0FBQzVCLHlCQUFlLFdBQVcsUUFBUTtBQUFBLFFBQ3BDLFdBQVcsa0JBQWtCLFVBQVU7QUFDckMseUJBQWUsV0FBVyxVQUFVO0FBQUEsUUFDdEMsV0FBVyxrQkFBa0IsUUFBUTtBQUNuQyx5QkFBZSxXQUFXLFFBQVE7QUFBQSxRQUNwQyxXQUFXLGtCQUFrQixVQUFVO0FBQ3JDLHlCQUFlLFdBQVcsU0FBUyxlQUFlLHdCQUF3QixFQUFFLEtBQUssS0FBSyxXQUFXLFVBQVU7QUFBQSxRQUM3RyxPQUFPO0FBQ0wseUJBQWUsV0FBVyxVQUFVO0FBQUEsUUFDdEM7QUFFQSxjQUFNLHNCQUFzQixPQUFPLEtBQUssTUFBTSxlQUFlLEdBQUcsQ0FBQztBQUNqRSxjQUFNLG9CQUFvQixlQUFlO0FBQ3pDLGNBQU0sb0JBQW9CQSxZQUFtQixrQkFBa0IsU0FBUSxDQUFFO0FBQ3pFLGlCQUFTLGVBQWUsZUFBZSxFQUFFLGNBQWMsR0FBRyxXQUFXLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxDQUFDLElBQUksTUFBTTtBQUFBLE1BQzlHO0FBRUEsZUFBUyxpQkFBaUIsK0JBQStCLEVBQUUsUUFBUSxXQUFTO0FBQzFFLGNBQU0saUJBQWlCLFVBQVUsTUFBTTtBQUNyQztBQUVBLG1CQUFTLGlCQUFpQixhQUFhLEVBQUUsUUFBUSxXQUFTO0FBQ3hELGtCQUFNLFFBQVEsTUFBTSxjQUFjLCtCQUErQjtBQUNqRSxnQkFBSSxTQUFTLE1BQU0sU0FBUztBQUMxQixvQkFBTSxNQUFNLGNBQWM7QUFDMUIsb0JBQU0sTUFBTSxjQUFjO0FBQUEsWUFDNUIsT0FBTztBQUNMLG9CQUFNLE1BQU0sY0FBYztBQUMxQixvQkFBTSxNQUFNLGNBQWM7QUFBQSxZQUM1QjtBQUFBLFVBQ0YsQ0FBQztBQUVELGdCQUFNLGtCQUFrQixTQUFTLGVBQWUsa0NBQWtDO0FBQ2xGLGNBQUksTUFBTSxVQUFVLFlBQVksTUFBTSxTQUFTO0FBQzdDLDRCQUFnQixVQUFVLE9BQU8sUUFBUTtBQUN6Qyx1QkFBVyxNQUFNO0FBQ2YsdUJBQVMsZUFBZSx3QkFBd0IsRUFBRSxNQUFLO0FBQUEsWUFDekQsR0FBRyxHQUFHO0FBQUEsVUFDUixXQUFXLGlCQUFpQjtBQUMxQiw0QkFBZ0IsVUFBVSxJQUFJLFFBQVE7QUFBQSxVQUN4QztBQUFBLFFBQ0YsQ0FBQztBQUFBLE1BQ0gsQ0FBQztBQUVELGVBQVMsaUJBQWlCLGFBQWEsRUFBRSxRQUFRLFdBQVM7QUFDeEQsY0FBTSxRQUFRLE1BQU0sY0FBYywrQkFBK0I7QUFDakUsWUFBSSxTQUFTLE1BQU0sU0FBUztBQUMxQixnQkFBTSxNQUFNLGNBQWM7QUFDMUIsZ0JBQU0sTUFBTSxjQUFjO0FBQUEsUUFDNUI7QUFBQSxNQUNGLENBQUM7QUFFRCxZQUFNLGlCQUFpQixTQUFTLGVBQWUsd0JBQXdCO0FBQ3ZFLHFCQUFlLGlCQUFpQixTQUFTLE1BQU07QUFDN0MsaUJBQVMsZUFBZSx3QkFBd0IsRUFBRSxVQUFVO0FBQzVEO01BQ0YsQ0FBQztBQUFBLElBRUgsU0FBUyxrQkFBa0I7QUFDekIsY0FBUSxNQUFNLHlCQUF5QixnQkFBZ0I7QUFDdkQsZUFBUyxlQUFlLHFCQUFxQixFQUFFLGNBQWM7QUFDN0QsZUFBUyxlQUFlLGVBQWUsRUFBRSxjQUFjO0FBQUEsSUFDekQ7QUFBQSxFQUVGLFNBQVMsT0FBTztBQUNkLFlBQVEsTUFBTSw2QkFBNkIsS0FBSztBQUNoRCxhQUFTLGVBQWUsc0JBQXNCLEVBQUUsY0FBYztBQUM5RCxhQUFTLGVBQWUsd0JBQXdCLEVBQUUsY0FBYztBQUNoRSxhQUFTLGVBQWUsc0JBQXNCLEVBQUUsY0FBYztBQUFBLEVBQ2hFO0FBQ0Y7QUFHQSxTQUFTLDJCQUEyQjtBQUNsQyxRQUFNLGdCQUFnQixTQUFTLGNBQWMsdUNBQXVDLEdBQUc7QUFFdkYsTUFBSSxrQkFBa0IsVUFBVTtBQUM5QixVQUFNLGFBQWEsV0FBVyxTQUFTLGVBQWUsd0JBQXdCLEVBQUUsS0FBSztBQUNyRixRQUFJLGNBQWMsYUFBYSxHQUFHO0FBQ2hDLGFBQU8zQixXQUFrQixXQUFXLFNBQVEsR0FBSSxNQUFNLEVBQUU7SUFDMUQ7QUFBQSxFQUNGO0FBRUEsTUFBSTtBQUNKLE1BQUksa0JBQWtCLFFBQVE7QUFDNUIsZUFBVyxTQUFTLGVBQWUsc0JBQXNCLEVBQUU7QUFBQSxFQUM3RCxXQUFXLGtCQUFrQixRQUFRO0FBQ25DLGVBQVcsU0FBUyxlQUFlLHNCQUFzQixFQUFFO0FBQUEsRUFDN0QsT0FBTztBQUNMLGVBQVcsU0FBUyxlQUFlLHdCQUF3QixFQUFFO0FBQUEsRUFDL0Q7QUFFQSxRQUFNLE9BQU8sV0FBVyxRQUFRO0FBQ2hDLE1BQUksUUFBUSxPQUFPLEdBQUc7QUFDcEIsV0FBT0EsV0FBa0IsS0FBSyxTQUFRLEdBQUksTUFBTSxFQUFFO0VBQ3BEO0FBRUEsU0FBTztBQUNUO0FBR0EsZUFBZSwwQkFBMEIsUUFBUSxTQUFTLFFBQVEsUUFBUTtBQUV4RSxXQUFTLGVBQWUsV0FBVyxFQUFFLFVBQVUsSUFBSSxRQUFRO0FBRzNELFFBQU0sZ0JBQWdCLFNBQVMsZUFBZSxxQkFBcUI7QUFDbkUsZ0JBQWMsVUFBVSxPQUFPLFFBQVE7QUFHdkMsV0FBUyxlQUFlLGtCQUFrQixFQUFFLGNBQWM7QUFHMUQsV0FBUyxlQUFlLDBCQUEwQixFQUFFLFVBQVUsTUFBTTtBQUNsRSxVQUFNLE1BQU0sZUFBZSxTQUFTLE1BQU0sTUFBTTtBQUNoRCxXQUFPLEtBQUssT0FBTyxFQUFFLElBQUcsQ0FBRTtBQUFBLEVBQzVCO0FBR0EsUUFBTSxTQUFTLE1BQU07QUFDckIsUUFBTSxVQUFVLFFBQVE7QUFHeEIsTUFBSTtBQUNKLFFBQU0sZUFBZSxZQUFZO0FBQy9CLFFBQUk7QUFDRixZQUFNLFdBQVcsTUFBTSxPQUFPLFFBQVEsWUFBWTtBQUFBLFFBQ2hELE1BQU07QUFBQSxRQUNOO0FBQUEsUUFDQTtBQUFBLE1BQ1IsQ0FBTztBQUVELFVBQUksU0FBUyxXQUFXLFNBQVMsYUFBYTtBQUM1QyxjQUFNLEtBQUssU0FBUztBQUNwQixjQUFNLGdCQUFnQixTQUFTLGVBQWUscUJBQXFCO0FBQ25FLGNBQU0sZ0JBQWdCLFNBQVMsZUFBZSxxQkFBcUI7QUFDbkUsY0FBTSxpQkFBaUIsU0FBUyxlQUFlLDZCQUE2QjtBQUU1RSxZQUFJLEdBQUcsV0FBVyxhQUFhO0FBQzdCLHdCQUFjLGNBQWM7QUFDNUIsd0JBQWMsY0FBYyxVQUFVLEdBQUcsV0FBVztBQUNwRCx3QkFBYyxNQUFNLFFBQVE7QUFDNUIseUJBQWUsVUFBVSxJQUFJLFFBQVE7QUFFckMsY0FBSSxjQUFjO0FBQ2hCLDBCQUFjLFlBQVk7QUFBQSxVQUM1QjtBQU1BLHFCQUFXLE1BQU07QUFDZix1QkFBVyxrQkFBa0I7QUFFN0I7VUFDRixHQUFHLEdBQUk7QUFBQSxRQUNULFdBQVcsR0FBRyxXQUFXLFVBQVU7QUFDakMsd0JBQWMsY0FBYztBQUM1Qix3QkFBYyxjQUFjO0FBQzVCLHdCQUFjLE1BQU0sUUFBUTtBQUM1Qix5QkFBZSxVQUFVLElBQUksUUFBUTtBQUVyQyxjQUFJLGNBQWM7QUFDaEIsMEJBQWMsWUFBWTtBQUFBLFVBQzVCO0FBQUEsUUFDRixPQUFPO0FBQ0wsd0JBQWMsY0FBYztBQUM1Qix3QkFBYyxjQUFjO0FBQzVCLHdCQUFjLE1BQU0sUUFBUTtBQUM1Qix5QkFBZSxVQUFVLE9BQU8sUUFBUTtBQUFBLFFBQzFDO0FBQUEsTUFDRjtBQUFBLElBQ0YsU0FBUyxPQUFPO0FBQ2QsY0FBUSxNQUFNLHNDQUFzQyxLQUFLO0FBQUEsSUFDM0Q7QUFBQSxFQUNGO0FBRUEsUUFBTSxhQUFZO0FBQ2xCLGlCQUFlLFlBQVksY0FBYyxHQUFJO0FBRzdDLFdBQVMsZUFBZSx1QkFBdUIsRUFBRSxVQUFVLE1BQU07QUFDL0QsUUFBSSxjQUFjO0FBQ2hCLG9CQUFjLFlBQVk7QUFBQSxJQUM1QjtBQUNBLGVBQVcsa0JBQWtCO0FBQzdCO0VBQ0Y7QUFHQSxXQUFTLGVBQWUsMEJBQTBCLEVBQUUsVUFBVSxZQUFZO0FBRXhFLFVBQU0sK0RBQStEO0FBQUEsRUFDdkU7QUFHQSxXQUFTLGVBQWUsd0JBQXdCLEVBQUUsVUFBVSxZQUFZO0FBQ3RFLFFBQUk7QUFFRixZQUFNLGFBQWEsTUFBTSxPQUFPLFFBQVEsWUFBWTtBQUFBLFFBQ2xELE1BQU07QUFBQSxRQUNOO0FBQUEsUUFDQTtBQUFBLE1BQ1IsQ0FBTztBQUVELFVBQUksQ0FBQyxXQUFXLFdBQVcsQ0FBQyxXQUFXLGFBQWE7QUFDbEQsY0FBTSxvQ0FBb0M7QUFDMUM7QUFBQSxNQUNGO0FBRUEsWUFBTSxLQUFLLFdBQVc7QUFHdEIsdUJBQWlCLFNBQVM7QUFDMUIsdUJBQWlCLFVBQVU7QUFDM0IsdUJBQWlCLFVBQVUsR0FBRztBQUM5Qix1QkFBaUIsbUJBQW1CLEdBQUc7QUFHdkMsZUFBUyxlQUFlLGlCQUFpQixFQUFFLFVBQVUsT0FBTyxRQUFRO0FBQ3BFLFlBQU0sdUJBQXNCO0FBQUEsSUFDOUIsU0FBUyxPQUFPO0FBQ2QsY0FBUSxNQUFNLCtCQUErQixLQUFLO0FBQ2xELFlBQU0sMEJBQTBCO0FBQUEsSUFDbEM7QUFBQSxFQUNGO0FBQ0Y7QUFHQSxlQUFlLCtCQUErQixRQUFRLFNBQVMsUUFBUSxRQUFRO0FBRTdFLFdBQVMsZUFBZSxpQkFBaUIsRUFBRSxVQUFVLElBQUksUUFBUTtBQUdqRSxRQUFNLGdCQUFnQixTQUFTLGVBQWUsMkJBQTJCO0FBQ3pFLGdCQUFjLFVBQVUsT0FBTyxRQUFRO0FBR3ZDLFdBQVMsZUFBZSx3QkFBd0IsRUFBRSxjQUFjO0FBR2hFLFdBQVMsZUFBZSxnQ0FBZ0MsRUFBRSxVQUFVLE1BQU07QUFDeEUsVUFBTSxNQUFNLGVBQWUsU0FBUyxNQUFNLE1BQU07QUFDaEQsV0FBTyxLQUFLLE9BQU8sRUFBRSxJQUFHLENBQUU7QUFBQSxFQUM1QjtBQUdBLFFBQU0sU0FBUyxNQUFNO0FBQ3JCLFFBQU0sVUFBVSxRQUFRO0FBR3hCLE1BQUk7QUFDSixRQUFNLGVBQWUsWUFBWTtBQUMvQixRQUFJO0FBQ0YsWUFBTSxXQUFXLE1BQU0sT0FBTyxRQUFRLFlBQVk7QUFBQSxRQUNoRCxNQUFNO0FBQUEsUUFDTjtBQUFBLFFBQ0E7QUFBQSxNQUNSLENBQU87QUFFRCxVQUFJLFNBQVMsV0FBVyxTQUFTLGFBQWE7QUFDNUMsY0FBTSxLQUFLLFNBQVM7QUFDcEIsY0FBTSxnQkFBZ0IsU0FBUyxlQUFlLDJCQUEyQjtBQUN6RSxjQUFNLGdCQUFnQixTQUFTLGVBQWUsMkJBQTJCO0FBQ3pFLGNBQU0saUJBQWlCLFNBQVMsZUFBZSxtQ0FBbUM7QUFFbEYsWUFBSSxHQUFHLFdBQVcsYUFBYTtBQUM3Qix3QkFBYyxjQUFjO0FBQzVCLHdCQUFjLGNBQWMsVUFBVSxHQUFHLFdBQVc7QUFDcEQsd0JBQWMsTUFBTSxRQUFRO0FBQzVCLHlCQUFlLFVBQVUsSUFBSSxRQUFRO0FBRXJDLGNBQUksY0FBYztBQUNoQiwwQkFBYyxZQUFZO0FBQUEsVUFDNUI7QUFNQSxxQkFBVyxNQUFNO0FBQ2YsdUJBQVcsZUFBZTtBQUUxQjtVQUNGLEdBQUcsR0FBSTtBQUFBLFFBQ1QsV0FBVyxHQUFHLFdBQVcsVUFBVTtBQUNqQyx3QkFBYyxjQUFjO0FBQzVCLHdCQUFjLGNBQWM7QUFDNUIsd0JBQWMsTUFBTSxRQUFRO0FBQzVCLHlCQUFlLFVBQVUsSUFBSSxRQUFRO0FBRXJDLGNBQUksY0FBYztBQUNoQiwwQkFBYyxZQUFZO0FBQUEsVUFDNUI7QUFBQSxRQUNGLE9BQU87QUFDTCx3QkFBYyxjQUFjO0FBQzVCLHdCQUFjLGNBQWM7QUFDNUIsd0JBQWMsTUFBTSxRQUFRO0FBQzVCLHlCQUFlLFVBQVUsT0FBTyxRQUFRO0FBQUEsUUFDMUM7QUFBQSxNQUNGO0FBQUEsSUFDRixTQUFTLE9BQU87QUFDZCxjQUFRLE1BQU0sc0NBQXNDLEtBQUs7QUFBQSxJQUMzRDtBQUFBLEVBQ0Y7QUFFQSxRQUFNLGFBQVk7QUFDbEIsaUJBQWUsWUFBWSxjQUFjLEdBQUk7QUFHN0MsV0FBUyxlQUFlLDZCQUE2QixFQUFFLFVBQVUsTUFBTTtBQUNyRSxRQUFJLGNBQWM7QUFDaEIsb0JBQWMsWUFBWTtBQUFBLElBQzVCO0FBQ0EsZUFBVyxlQUFlO0FBQzFCO0VBQ0Y7QUFHQSxXQUFTLGVBQWUsZ0NBQWdDLEVBQUUsVUFBVSxZQUFZO0FBRTlFLFVBQU0sK0RBQStEO0FBQUEsRUFDdkU7QUFHQSxXQUFTLGVBQWUsOEJBQThCLEVBQUUsVUFBVSxZQUFZO0FBQzVFLFFBQUk7QUFFRixZQUFNLGFBQWEsTUFBTSxPQUFPLFFBQVEsWUFBWTtBQUFBLFFBQ2xELE1BQU07QUFBQSxRQUNOO0FBQUEsUUFDQTtBQUFBLE1BQ1IsQ0FBTztBQUVELFVBQUksQ0FBQyxXQUFXLFdBQVcsQ0FBQyxXQUFXLGFBQWE7QUFDbEQsY0FBTSxvQ0FBb0M7QUFDMUM7QUFBQSxNQUNGO0FBRUEsWUFBTSxLQUFLLFdBQVc7QUFHdEIsdUJBQWlCLFNBQVM7QUFDMUIsdUJBQWlCLFVBQVU7QUFDM0IsdUJBQWlCLFVBQVUsR0FBRztBQUM5Qix1QkFBaUIsbUJBQW1CLEdBQUc7QUFHdkMsZUFBUyxlQUFlLGlCQUFpQixFQUFFLFVBQVUsT0FBTyxRQUFRO0FBQ3BFLFlBQU0sdUJBQXNCO0FBQUEsSUFDOUIsU0FBUyxPQUFPO0FBQ2QsY0FBUSxNQUFNLCtCQUErQixLQUFLO0FBQ2xELFlBQU0sMEJBQTBCO0FBQUEsSUFDbEM7QUFBQSxFQUNGO0FBQ0Y7QUFLQSxTQUFTLHFCQUFxQixPQUFPLE1BQU07QUFDekMsTUFBSTtBQUVGLFFBQUksS0FBSyxTQUFTLElBQUksR0FBRztBQUN2QixVQUFJLE1BQU0sUUFBUSxLQUFLLEdBQUc7QUFDeEIsY0FBTSxjQUFjLEtBQUssUUFBUSxNQUFNLEVBQUU7QUFDekMsY0FBTSxvQkFBb0IsTUFBTSxJQUFJLENBQUMsR0FBRyxNQUFNO0FBQzVDLGdCQUFNLGlCQUFpQixxQkFBcUIsR0FBRyxXQUFXO0FBQzFELGlCQUFPLElBQUksQ0FBQyxNQUFNLGNBQWM7QUFBQSxRQUNsQyxDQUFDO0FBQ0QsZUFBTyxrQkFBa0IsS0FBSyxNQUFNO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBR0EsUUFBSSxTQUFTLFdBQVc7QUFDdEIsWUFBTSxZQUFZLEdBQUcsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sTUFBTSxNQUFNLEVBQUUsQ0FBQztBQUMzRCxhQUFPLGdCQUFnQixLQUFLLDJCQUEyQixTQUFTO0FBQUEsSUFDbEU7QUFHQSxRQUFJLEtBQUssV0FBVyxNQUFNLEtBQUssS0FBSyxXQUFXLEtBQUssR0FBRztBQUNyRCxZQUFNLFdBQVcsTUFBTTtBQUd2QixVQUFJLFNBQVMsU0FBUyxJQUFJO0FBQ3hCLFlBQUk7QUFDRixnQkFBTSxhQUFhMkIsWUFBbUIsUUFBUTtBQUU5QyxjQUFJLFdBQVcsVUFBVSxJQUFJLE1BQVU7QUFDckMsbUJBQU8sR0FBRyxRQUFRLG9FQUFvRSxXQUFXLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUFBLFVBQ3pIO0FBQUEsUUFDRixTQUFTLEdBQUc7QUFBQSxRQUVaO0FBQUEsTUFDRjtBQUVBLGFBQU87QUFBQSxJQUNUO0FBR0EsUUFBSSxTQUFTLFFBQVE7QUFDbkIsYUFBTyxRQUFRLDhEQUE4RDtBQUFBLElBQy9FO0FBR0EsUUFBSSxTQUFTLFdBQVcsS0FBSyxXQUFXLE9BQU8sR0FBRztBQUNoRCxVQUFJLE9BQU8sVUFBVSxVQUFVO0FBQzdCLFlBQUksTUFBTSxTQUFTLElBQUk7QUFDckIsaUJBQU8sR0FBRyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMscUVBQXFFLE1BQU0sTUFBTTtBQUFBLFFBQy9HO0FBQ0EsZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBR0EsUUFBSSxTQUFTLFVBQVU7QUFDckIsVUFBSSxNQUFNLFNBQVMsSUFBSTtBQUNyQixlQUFPLEdBQUcsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLHFFQUFxRSxNQUFNLE1BQU07QUFBQSxNQUMvRztBQUNBLGFBQU87QUFBQSxJQUNUO0FBR0EsUUFBSSxPQUFPLFVBQVUsWUFBWSxVQUFVLE1BQU07QUFDL0MsWUFBTSxVQUFVLEtBQUssVUFBVSxPQUFPLE1BQU0sQ0FBQztBQUM3QyxVQUFJLFFBQVEsU0FBUyxLQUFLO0FBQ3hCLGVBQU8sa0RBQWtELFFBQVEsTUFBTSxHQUFHLEdBQUcsQ0FBQztBQUFBLE1BQ2hGO0FBQ0EsYUFBTyxnQ0FBZ0MsT0FBTztBQUFBLElBQ2hEO0FBRUEsV0FBTyxPQUFPLEtBQUs7QUFBQSxFQUNyQixTQUFTLE9BQU87QUFDZCxZQUFRLE1BQU0scUNBQXFDLEtBQUs7QUFDeEQsV0FBTyxPQUFPLEtBQUs7QUFBQSxFQUNyQjtBQUNGO0FBRUEsZUFBZSxnQ0FBZ0MsV0FBVztBQUV4RCxRQUFNLGFBQVk7QUFDbEI7QUFHQSxNQUFJO0FBQ0YsVUFBTSxXQUFXLE1BQU0sT0FBTyxRQUFRLFlBQVk7QUFBQSxNQUNoRCxNQUFNO0FBQUEsTUFDTjtBQUFBLElBQ04sQ0FBSztBQUVELFFBQUksQ0FBQyxTQUFTLFNBQVM7QUFDckIsWUFBTSwwQ0FBMEM7QUFDaEQsYUFBTyxNQUFLO0FBQ1o7QUFBQSxJQUNGO0FBRUEsVUFBTSxFQUFFLFFBQVEsVUFBUyxJQUFLO0FBRzlCLFVBQU0sU0FBUyxNQUFNO0FBQ3JCLFVBQU0sVUFBVSxNQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFHaEQsYUFBUyxlQUFlLGdCQUFnQixFQUFFLGNBQWM7QUFDeEQsYUFBUyxlQUFlLGlCQUFpQixFQUFFLGNBQWMsUUFBUSxXQUFXO0FBQzVFLGFBQVMsZUFBZSxlQUFlLEVBQUUsY0FBYyxVQUFVLE1BQU07QUFHdkUsVUFBTSxVQUFVO0FBQUEsTUFDZCxxQkFBcUI7QUFBQSxNQUNyQixjQUFjO0FBQUEsTUFDZCxZQUFZO0FBQUEsTUFDWixXQUFXO0FBQUEsSUFDakI7QUFDSSxVQUFNLFNBQVMsUUFBUSxPQUFPLEtBQUs7QUFFbkMsUUFBSSxVQUFVLE9BQU87QUFDbkIsWUFBTSxRQUFRQSxZQUFtQixVQUFVLEtBQUs7QUFDaEQsZUFBUyxlQUFlLFVBQVUsRUFBRSxjQUFjLEdBQUcsS0FBSyxJQUFJLE1BQU07QUFBQSxJQUN0RSxPQUFPO0FBQ0wsZUFBUyxlQUFlLFVBQVUsRUFBRSxjQUFjLEtBQUssTUFBTTtBQUFBLElBQy9EO0FBR0EsUUFBSSxZQUFZO0FBQ2hCLFVBQU0sYUFBYTtBQUFBLE1BQ2pCLGNBQWM7QUFBQSxNQUNkLHFCQUFxQjtBQUFBLE1BQ3JCLFlBQVk7QUFBQSxNQUNaLFdBQVc7QUFBQSxJQUNqQjtBQUNJLFVBQU0sVUFBVSxXQUFXLE9BQU8sS0FBSztBQUd2QyxhQUFTLGVBQWUsa0JBQWtCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFDbEUsYUFBUyxlQUFlLGtCQUFrQixFQUFFLGNBQWM7QUFFMUQsUUFBSTtBQUNGLGtCQUFZLE1BQU0sa0JBQWtCLFdBQVcsT0FBTztBQUN0RCxjQUFRLElBQUksMkJBQTJCLFNBQVM7QUFHaEQsVUFBSSxhQUFhLFVBQVUsU0FBUyxjQUFjLFVBQVUsVUFBVTtBQUNwRSxjQUFNLGVBQWUsU0FBUyxlQUFlLGtCQUFrQjtBQUMvRCxxQkFBYSxVQUFVLE9BQU8sUUFBUTtBQUd0QyxpQkFBUyxlQUFlLHFCQUFxQixFQUFFLGNBQWMsVUFBVSxTQUFTO0FBR2hGLFlBQUksVUFBVSxTQUFTLFVBQVU7QUFDL0IsbUJBQVMsZUFBZSxtQkFBbUIsRUFBRSxVQUFVLE9BQU8sUUFBUTtBQUN0RSxtQkFBUyxlQUFlLHFCQUFxQixFQUFFLFVBQVUsSUFBSSxRQUFRO0FBQ3JFLHVCQUFhLE1BQU0sY0FBYztBQUFBLFFBQ25DLE9BQU87QUFDTCxtQkFBUyxlQUFlLG1CQUFtQixFQUFFLFVBQVUsSUFBSSxRQUFRO0FBQ25FLG1CQUFTLGVBQWUscUJBQXFCLEVBQUUsVUFBVSxPQUFPLFFBQVE7QUFDeEUsdUJBQWEsTUFBTSxjQUFjO0FBQUEsUUFDbkM7QUFHQSxjQUFNLGVBQWUsU0FBUyxlQUFlLGtCQUFrQjtBQUMvRCxxQkFBYSxPQUFPLFVBQVU7QUFHOUIsaUJBQVMsZUFBZSxrQkFBa0IsRUFBRSxjQUFjLFVBQVUsVUFBVTtBQUM5RSxpQkFBUyxlQUFlLHlCQUF5QixFQUFFLGNBQWMsVUFBVSxlQUFlO0FBRzFGLFlBQUksVUFBVSxVQUFVLFVBQVUsT0FBTyxTQUFTLEdBQUc7QUFDbkQsZ0JBQU0sZ0JBQWdCLFNBQVMsZUFBZSxtQkFBbUI7QUFDakUsZ0JBQU0sYUFBYSxTQUFTLGVBQWUsZ0JBQWdCO0FBQzNELHdCQUFjLFVBQVUsT0FBTyxRQUFRO0FBRXZDLGNBQUksYUFBYTtBQUNqQixxQkFBVyxTQUFTLFVBQVUsUUFBUTtBQUNwQyxrQkFBTSxlQUFlLHFCQUFxQixNQUFNLE9BQU8sTUFBTSxJQUFJO0FBQ2pFLDBCQUFjO0FBQUE7QUFBQTtBQUFBLCtFQUdxRCxNQUFNLElBQUk7QUFBQSw2R0FDb0IsTUFBTSxJQUFJO0FBQUE7QUFBQTtBQUFBLG9CQUduRyxZQUFZO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFJdEI7QUFDQSxxQkFBVyxZQUFZO0FBQUEsUUFDekIsT0FBTztBQUNMLG1CQUFTLGVBQWUsbUJBQW1CLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFBQSxRQUNyRTtBQUFBLE1BQ0YsT0FBTztBQUNMLGlCQUFTLGVBQWUsa0JBQWtCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFBQSxNQUNwRTtBQUdBLFVBQUksVUFBVSxRQUFRLFVBQVUsU0FBUyxNQUFNO0FBQzdDLGlCQUFTLGVBQWUsaUJBQWlCLEVBQUUsVUFBVSxPQUFPLFFBQVE7QUFDcEUsaUJBQVMsZUFBZSxTQUFTLEVBQUUsY0FBYyxVQUFVO0FBQUEsTUFDN0QsT0FBTztBQUNMLGlCQUFTLGVBQWUsaUJBQWlCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFBQSxNQUNuRTtBQUFBLElBRUYsU0FBUyxPQUFPO0FBQ2QsY0FBUSxNQUFNLCtCQUErQixLQUFLO0FBQ2xELGVBQVMsZUFBZSxrQkFBa0IsRUFBRSxVQUFVLElBQUksUUFBUTtBQUdsRSxVQUFJLFVBQVUsUUFBUSxVQUFVLFNBQVMsTUFBTTtBQUM3QyxpQkFBUyxlQUFlLGlCQUFpQixFQUFFLFVBQVUsT0FBTyxRQUFRO0FBQ3BFLGlCQUFTLGVBQWUsU0FBUyxFQUFFLGNBQWMsVUFBVTtBQUFBLE1BQzdELE9BQU87QUFDTCxpQkFBUyxlQUFlLGlCQUFpQixFQUFFLFVBQVUsSUFBSSxRQUFRO0FBQUEsTUFDbkU7QUFBQSxJQUNGO0FBR0EsZUFBVyw2QkFBNkI7QUFHeEMsVUFBTSxrQkFBa0IsU0FBUyxXQUFXLE1BQU07QUFHbEQsVUFBTSxxQkFBcUIsT0FBTyxTQUFTLE9BQU87QUFHbEQsYUFBUyxlQUFlLDBCQUEwQixFQUFFLGlCQUFpQixVQUFVLENBQUMsTUFBTTtBQUNwRixZQUFNLFlBQVksU0FBUyxlQUFlLDhCQUE4QjtBQUN4RSxVQUFJLEVBQUUsT0FBTyxTQUFTO0FBQ3BCLGtCQUFVLFVBQVUsT0FBTyxRQUFRO0FBRW5DLGNBQU0sZUFBZSxTQUFTLGVBQWUsa0JBQWtCLEVBQUU7QUFDakUsWUFBSSxpQkFBaUIsTUFBTTtBQUN6QixtQkFBUyxlQUFlLGlCQUFpQixFQUFFLFFBQVE7QUFBQSxRQUNyRDtBQUFBLE1BQ0YsT0FBTztBQUNMLGtCQUFVLFVBQVUsSUFBSSxRQUFRO0FBQUEsTUFDbEM7QUFBQSxJQUNGLENBQUM7QUFHRCxhQUFTLGVBQWUseUJBQXlCLEVBQUUsaUJBQWlCLFNBQVMsWUFBWTtBQUN2RixZQUFNLGFBQWEsU0FBUyxlQUFlLHlCQUF5QjtBQUNwRSxZQUFNLFdBQVcsU0FBUyxlQUFlLGFBQWEsRUFBRTtBQUN4RCxZQUFNLFVBQVUsU0FBUyxlQUFlLFVBQVU7QUFFbEQsVUFBSSxDQUFDLFVBQVU7QUFDYixnQkFBUSxjQUFjO0FBQ3RCLGdCQUFRLFVBQVUsT0FBTyxRQUFRO0FBQ2pDO0FBQUEsTUFDRjtBQUdBLGlCQUFXLFdBQVc7QUFDdEIsaUJBQVcsTUFBTSxVQUFVO0FBQzNCLGlCQUFXLE1BQU0sU0FBUztBQUUxQixVQUFJO0FBQ0YsZ0JBQVEsVUFBVSxJQUFJLFFBQVE7QUFJOUIsY0FBTSxlQUFlLE1BQU07QUFDM0IsY0FBTSxzQkFBc0IsTUFBTSxPQUFPLFFBQVEsWUFBWTtBQUFBLFVBQzNELE1BQU07QUFBQSxVQUNOO0FBQUEsVUFDQSxVQUFVLGFBQWE7QUFBQSxVQUN2QixZQUFZO0FBQUE7QUFBQSxRQUN0QixDQUFTO0FBRUQsWUFBSSxDQUFDLG9CQUFvQixTQUFTO0FBQ2hDLGdCQUFNLElBQUksTUFBTSxrQkFBa0I7QUFBQSxRQUNwQztBQUdBLGNBQU0sV0FBVztBQUdqQixjQUFNLHNCQUFzQixTQUFTLGVBQWUsMEJBQTBCO0FBQzlFLGNBQU0sbUJBQW1CLFNBQVMsZUFBZSxpQkFBaUI7QUFDbEUsWUFBSSxjQUFjO0FBQ2xCLFlBQUksb0JBQW9CLFdBQVcsaUJBQWlCLE9BQU87QUFDekQsd0JBQWMsU0FBUyxpQkFBaUIsS0FBSztBQUM3QyxjQUFJLE1BQU0sV0FBVyxLQUFLLGNBQWMsR0FBRztBQUN6QyxrQkFBTSxJQUFJLE1BQU0sc0JBQXNCO0FBQUEsVUFDeEM7QUFBQSxRQUNGO0FBRUEsY0FBTUMsWUFBVyxNQUFNLE9BQU8sUUFBUSxZQUFZO0FBQUEsVUFDaEQsTUFBTTtBQUFBLFVBQ047QUFBQSxVQUNBLFVBQVU7QUFBQSxVQUNWLGNBQWMsb0JBQW9CO0FBQUEsVUFDbEM7QUFBQSxVQUNBO0FBQUEsUUFDVixDQUFTO0FBRUQsWUFBSUEsVUFBUyxTQUFTO0FBRXBCLGdDQUFzQkEsVUFBUyxRQUFRLGFBQWEsU0FBUyxTQUFTO0FBQUEsUUFDeEUsT0FBTztBQUNMLGtCQUFRLGNBQWNBLFVBQVMsU0FBUztBQUN4QyxrQkFBUSxVQUFVLE9BQU8sUUFBUTtBQUVqQyxxQkFBVyxXQUFXO0FBQ3RCLHFCQUFXLE1BQU0sVUFBVTtBQUMzQixxQkFBVyxNQUFNLFNBQVM7QUFBQSxRQUM1QjtBQUFBLE1BQ0YsU0FBUyxPQUFPO0FBQ2QsZ0JBQVEsY0FBYyxNQUFNO0FBQzVCLGdCQUFRLFVBQVUsT0FBTyxRQUFRO0FBRWpDLG1CQUFXLFdBQVc7QUFDdEIsbUJBQVcsTUFBTSxVQUFVO0FBQzNCLG1CQUFXLE1BQU0sU0FBUztBQUFBLE1BQzVCO0FBQUEsSUFDRixDQUFDO0FBR0QsYUFBUyxlQUFlLHdCQUF3QixFQUFFLGlCQUFpQixTQUFTLFlBQVk7QUFDdEYsVUFBSTtBQUNGLGNBQU0sT0FBTyxRQUFRLFlBQVk7QUFBQSxVQUMvQixNQUFNO0FBQUEsVUFDTjtBQUFBLFVBQ0EsVUFBVTtBQUFBLFFBQ3BCLENBQVM7QUFHRCxlQUFPLE1BQUs7QUFBQSxNQUNkLFNBQVMsT0FBTztBQUNkLGNBQU0sa0NBQWtDLE1BQU0sT0FBTztBQUNyRCxlQUFPLE1BQUs7QUFBQSxNQUNkO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFFSCxTQUFTLE9BQU87QUFDZCxVQUFNLGdDQUFnQyxNQUFNLE9BQU87QUFDbkQsV0FBTyxNQUFLO0FBQUEsRUFDZDtBQUNGO0FBR0EsZUFBZSw2QkFBNkIsV0FBVztBQUVyRCxRQUFNLGFBQVk7QUFDbEI7QUFHQSxNQUFJO0FBQ0YsVUFBTSxXQUFXLE1BQU0sT0FBTyxRQUFRLFlBQVk7QUFBQSxNQUNoRCxNQUFNO0FBQUEsTUFDTjtBQUFBLElBQ04sQ0FBSztBQUVELFFBQUksQ0FBQyxTQUFTLFNBQVM7QUFDckIsWUFBTSx3Q0FBd0M7QUFDOUMsYUFBTyxNQUFLO0FBQ1o7QUFBQSxJQUNGO0FBRUEsVUFBTSxFQUFFLFFBQVEsVUFBUyxJQUFLO0FBRzlCLGFBQVMsZUFBZSxtQkFBbUIsRUFBRSxjQUFjO0FBQzNELGFBQVMsZUFBZSxjQUFjLEVBQUUsY0FBYyxVQUFVO0FBQ2hFLGFBQVMsZUFBZSxlQUFlLEVBQUUsY0FBYyxVQUFVO0FBQ2pFLGFBQVMsZUFBZSxnQkFBZ0IsRUFBRSxjQUFjLFVBQVU7QUFHbEUsUUFBSSxVQUFVLE9BQU87QUFDbkIsZUFBUyxlQUFlLGFBQWEsRUFBRSxNQUFNLFVBQVU7QUFDdkQsZUFBUyxlQUFlLHFCQUFxQixFQUFFLFVBQVUsT0FBTyxRQUFRO0FBQUEsSUFDMUUsT0FBTztBQUNMLGVBQVMsZUFBZSxxQkFBcUIsRUFBRSxVQUFVLElBQUksUUFBUTtBQUFBLElBQ3ZFO0FBR0EsZUFBVyxrQkFBa0I7QUFHN0IsYUFBUyxlQUFlLG1CQUFtQixFQUFFLGlCQUFpQixTQUFTLFlBQVk7QUFDakYsWUFBTSxhQUFhLFNBQVMsZUFBZSxtQkFBbUI7QUFDOUQsWUFBTSxVQUFVLFNBQVMsZUFBZSxhQUFhO0FBR3JELGlCQUFXLFdBQVc7QUFDdEIsaUJBQVcsTUFBTSxVQUFVO0FBQzNCLGlCQUFXLE1BQU0sU0FBUztBQUUxQixVQUFJO0FBQ0YsZ0JBQVEsVUFBVSxJQUFJLFFBQVE7QUFHOUIsY0FBTUEsWUFBVyxNQUFNLE9BQU8sUUFBUSxZQUFZO0FBQUEsVUFDaEQsTUFBTTtBQUFBLFVBQ047QUFBQSxVQUNBLFVBQVU7QUFBQSxRQUNwQixDQUFTO0FBRUQsWUFBSUEsVUFBUyxTQUFTO0FBRXBCLGdCQUFNLFVBQVUsTUFBTSxLQUFLLGdCQUFnQixLQUFLO0FBQ2hELGdCQUFNTCxlQUFzQixTQUFTLFVBQVUsU0FBUyxVQUFVLFFBQVEsVUFBVSxRQUFRO0FBRzVGLGlCQUFPLE1BQUs7QUFBQSxRQUNkLE9BQU87QUFDTCxrQkFBUSxjQUFjSyxVQUFTLFNBQVM7QUFDeEMsa0JBQVEsVUFBVSxPQUFPLFFBQVE7QUFFakMscUJBQVcsV0FBVztBQUN0QixxQkFBVyxNQUFNLFVBQVU7QUFDM0IscUJBQVcsTUFBTSxTQUFTO0FBQUEsUUFDNUI7QUFBQSxNQUNGLFNBQVMsT0FBTztBQUNkLGdCQUFRLGNBQWMsTUFBTTtBQUM1QixnQkFBUSxVQUFVLE9BQU8sUUFBUTtBQUVqQyxtQkFBVyxXQUFXO0FBQ3RCLG1CQUFXLE1BQU0sVUFBVTtBQUMzQixtQkFBVyxNQUFNLFNBQVM7QUFBQSxNQUM1QjtBQUFBLElBQ0YsQ0FBQztBQUdELGFBQVMsZUFBZSxrQkFBa0IsRUFBRSxpQkFBaUIsU0FBUyxZQUFZO0FBQ2hGLFVBQUk7QUFDRixjQUFNLE9BQU8sUUFBUSxZQUFZO0FBQUEsVUFDL0IsTUFBTTtBQUFBLFVBQ047QUFBQSxVQUNBLFVBQVU7QUFBQSxRQUNwQixDQUFTO0FBR0QsZUFBTyxNQUFLO0FBQUEsTUFDZCxTQUFTLE9BQU87QUFDZCxjQUFNLDRCQUE0QixNQUFNLE9BQU87QUFDL0MsZUFBTyxNQUFLO0FBQUEsTUFDZDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBRUgsU0FBUyxPQUFPO0FBQ2QsVUFBTSxzQ0FBc0MsY0FBYyxNQUFNLE9BQU8sQ0FBQztBQUN4RSxXQUFPLE1BQUs7QUFBQSxFQUNkO0FBQ0Y7QUFJQSxlQUFlLGdDQUFnQyxXQUFXO0FBRXhELFFBQU0sYUFBWTtBQUNsQjtBQUdBLE1BQUk7QUFDRixVQUFNLFdBQVcsTUFBTSxPQUFPLFFBQVEsWUFBWTtBQUFBLE1BQ2hELE1BQU07QUFBQSxNQUNOO0FBQUEsSUFDTixDQUFLO0FBRUQsUUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLFFBQVE7QUFDakMsWUFBTSxtQ0FBbUM7QUFDekMsYUFBTyxNQUFLO0FBQ1o7QUFBQSxJQUNGO0FBRUEsVUFBTSxFQUFFLFFBQVEsUUFBUSxZQUFXLElBQUs7QUFDeEMsVUFBTSxFQUFFLFNBQVMsUUFBTyxJQUFLO0FBRzdCLGFBQVMsZUFBZSxrQkFBa0IsRUFBRSxjQUFjO0FBQzFELGFBQVMsZUFBZSxjQUFjLEVBQUUsY0FBYztBQUd0RCxVQUFNLGlCQUFpQixTQUFTLGVBQWUseUJBQXlCO0FBQ3hFLFFBQUksV0FBVyxZQUFZO0FBQ3pCLHFCQUFlLFVBQVUsT0FBTyxRQUFRO0FBQ3hDLGNBQVEsS0FBSyxvQ0FBb0MsTUFBTTtBQUFBLElBQ3pELE9BQU87QUFDTCxxQkFBZSxVQUFVLElBQUksUUFBUTtBQUFBLElBQ3ZDO0FBR0EsVUFBTSxZQUFZLFNBQVMsZUFBZSxzQkFBc0I7QUFDaEUsUUFBSSxpQkFBaUI7QUFHckIsUUFBSSxPQUFPLFlBQVksWUFBWSxRQUFRLFdBQVcsSUFBSSxHQUFHO0FBQzNELGVBQVMsZUFBZSwwQkFBMEIsRUFBRSxVQUFVLE9BQU8sUUFBUTtBQUU3RSxVQUFJO0FBQ0YsY0FBTSxRQUFRQyxTQUFnQixPQUFPO0FBQ3JDLGNBQU0sVUFBVUMsYUFBb0IsS0FBSztBQUN6QyxZQUFJLG1CQUFtQixLQUFLLE9BQU8sR0FBRztBQUNwQywyQkFBaUIsVUFBVSxlQUFlLFVBQVU7QUFBQSxRQUN0RDtBQUFBLE1BQ0YsUUFBUTtBQUFBLE1BRVI7QUFBQSxJQUNGLE9BQU87QUFDTCxlQUFTLGVBQWUsMEJBQTBCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFBQSxJQUM1RTtBQUVBLGNBQVUsY0FBYztBQUd4QixlQUFXLHFCQUFxQjtBQUdoQyxhQUFTLGVBQWUsa0JBQWtCLEVBQUUsaUJBQWlCLFNBQVMsWUFBWTtBQUNoRixZQUFNLGFBQWEsU0FBUyxlQUFlLGtCQUFrQjtBQUM3RCxZQUFNLFdBQVcsU0FBUyxlQUFlLGVBQWUsRUFBRTtBQUMxRCxZQUFNLFVBQVUsU0FBUyxlQUFlLFlBQVk7QUFFcEQsVUFBSSxDQUFDLFVBQVU7QUFDYixnQkFBUSxjQUFjO0FBQ3RCLGdCQUFRLFVBQVUsT0FBTyxRQUFRO0FBQ2pDO0FBQUEsTUFDRjtBQUdBLGlCQUFXLFdBQVc7QUFDdEIsaUJBQVcsTUFBTSxVQUFVO0FBQzNCLGlCQUFXLE1BQU0sU0FBUztBQUUxQixVQUFJO0FBQ0YsZ0JBQVEsVUFBVSxJQUFJLFFBQVE7QUFHOUIsY0FBTSxlQUFlLE1BQU07QUFDM0IsY0FBTSxzQkFBc0IsTUFBTSxPQUFPLFFBQVEsWUFBWTtBQUFBLFVBQzNELE1BQU07QUFBQSxVQUNOO0FBQUEsVUFDQSxVQUFVLGFBQWE7QUFBQSxVQUN2QixZQUFZO0FBQUE7QUFBQSxRQUN0QixDQUFTO0FBRUQsWUFBSSxDQUFDLG9CQUFvQixTQUFTO0FBQ2hDLGdCQUFNLElBQUksTUFBTSxrQkFBa0I7QUFBQSxRQUNwQztBQUVBLGNBQU1GLFlBQVcsTUFBTSxPQUFPLFFBQVEsWUFBWTtBQUFBLFVBQ2hELE1BQU07QUFBQSxVQUNOO0FBQUEsVUFDQSxVQUFVO0FBQUEsVUFDVixjQUFjLG9CQUFvQjtBQUFBLFFBQzVDLENBQVM7QUFFRCxZQUFJQSxVQUFTLFNBQVM7QUFFcEIsaUJBQU8sTUFBSztBQUFBLFFBQ2QsT0FBTztBQUNMLGtCQUFRLGNBQWNBLFVBQVMsU0FBUztBQUN4QyxrQkFBUSxVQUFVLE9BQU8sUUFBUTtBQUVqQyxxQkFBVyxXQUFXO0FBQ3RCLHFCQUFXLE1BQU0sVUFBVTtBQUMzQixxQkFBVyxNQUFNLFNBQVM7QUFBQSxRQUM1QjtBQUFBLE1BQ0YsU0FBUyxPQUFPO0FBQ2QsZ0JBQVEsY0FBYyxNQUFNO0FBQzVCLGdCQUFRLFVBQVUsT0FBTyxRQUFRO0FBRWpDLG1CQUFXLFdBQVc7QUFDdEIsbUJBQVcsTUFBTSxVQUFVO0FBQzNCLG1CQUFXLE1BQU0sU0FBUztBQUFBLE1BQzVCO0FBQUEsSUFDRixDQUFDO0FBR0QsYUFBUyxlQUFlLGlCQUFpQixFQUFFLGlCQUFpQixTQUFTLFlBQVk7QUFDL0UsVUFBSTtBQUNGLGNBQU0sT0FBTyxRQUFRLFlBQVk7QUFBQSxVQUMvQixNQUFNO0FBQUEsVUFDTjtBQUFBLFVBQ0EsVUFBVTtBQUFBLFFBQ3BCLENBQVM7QUFHRCxlQUFPLE1BQUs7QUFBQSxNQUNkLFNBQVMsT0FBTztBQUNkLGNBQU0sbUNBQW1DLE1BQU0sT0FBTztBQUN0RCxlQUFPLE1BQUs7QUFBQSxNQUNkO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFFSCxTQUFTLE9BQU87QUFDZCxVQUFNLGlDQUFpQyxjQUFjLE1BQU0sT0FBTyxDQUFDO0FBQ25FLFdBQU8sTUFBSztBQUFBLEVBQ2Q7QUFDRjtBQUVBLGVBQWUsa0NBQWtDLFdBQVc7QUFFMUQsUUFBTSxhQUFZO0FBQ2xCO0FBR0EsTUFBSTtBQUNGLFVBQU0sV0FBVyxNQUFNLE9BQU8sUUFBUSxZQUFZO0FBQUEsTUFDaEQsTUFBTTtBQUFBLE1BQ047QUFBQSxJQUNOLENBQUs7QUFFRCxRQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsUUFBUTtBQUNqQyxZQUFNLG1DQUFtQztBQUN6QyxhQUFPLE1BQUs7QUFDWjtBQUFBLElBQ0Y7QUFFQSxVQUFNLEVBQUUsUUFBUSxRQUFRLFlBQVcsSUFBSztBQUN4QyxVQUFNLEVBQUUsV0FBVyxRQUFPLElBQUs7QUFHL0IsYUFBUyxlQUFlLHdCQUF3QixFQUFFLGNBQWM7QUFDaEUsYUFBUyxlQUFlLG9CQUFvQixFQUFFLGNBQWM7QUFHNUQsUUFBSSxVQUFVLFFBQVE7QUFDcEIsZUFBUyxlQUFlLHdCQUF3QixFQUFFLGNBQWMsVUFBVSxPQUFPLFFBQVE7QUFDekYsZUFBUyxlQUFlLHlCQUF5QixFQUFFLGNBQWMsVUFBVSxPQUFPLFdBQVc7QUFFN0YsVUFBSSxVQUFVLE9BQU8sbUJBQW1CO0FBQ3RDLGlCQUFTLGVBQWUsNEJBQTRCLEVBQUUsY0FBYyxVQUFVLE9BQU87QUFDckYsaUJBQVMsZUFBZSxnQ0FBZ0MsRUFBRSxVQUFVLE9BQU8sUUFBUTtBQUFBLE1BQ3JGLE9BQU87QUFDTCxpQkFBUyxlQUFlLGdDQUFnQyxFQUFFLFVBQVUsSUFBSSxRQUFRO0FBQUEsTUFDbEY7QUFBQSxJQUNGO0FBR0EsVUFBTSxZQUFZLFNBQVMsZUFBZSw0QkFBNEI7QUFDdEUsVUFBTSxjQUFjO0FBQUEsTUFDbEIsYUFBYSxVQUFVLGVBQWU7QUFBQSxNQUN0QyxTQUFTLFVBQVU7QUFBQSxJQUN6QjtBQUNJLGNBQVUsY0FBYyxLQUFLLFVBQVUsYUFBYSxNQUFNLENBQUM7QUFHM0QsZUFBVyx3QkFBd0I7QUFHbkMsYUFBUyxlQUFlLHdCQUF3QixFQUFFLGlCQUFpQixTQUFTLFlBQVk7QUFDdEYsWUFBTSxhQUFhLFNBQVMsZUFBZSx3QkFBd0I7QUFDbkUsWUFBTSxXQUFXLFNBQVMsZUFBZSxxQkFBcUIsRUFBRTtBQUNoRSxZQUFNLFVBQVUsU0FBUyxlQUFlLGtCQUFrQjtBQUUxRCxVQUFJLENBQUMsVUFBVTtBQUNiLGdCQUFRLGNBQWM7QUFDdEIsZ0JBQVEsVUFBVSxPQUFPLFFBQVE7QUFDakM7QUFBQSxNQUNGO0FBR0EsaUJBQVcsV0FBVztBQUN0QixpQkFBVyxNQUFNLFVBQVU7QUFDM0IsaUJBQVcsTUFBTSxTQUFTO0FBRTFCLFVBQUk7QUFDRixnQkFBUSxVQUFVLElBQUksUUFBUTtBQUc5QixjQUFNLGVBQWUsTUFBTTtBQUMzQixjQUFNLHNCQUFzQixNQUFNLE9BQU8sUUFBUSxZQUFZO0FBQUEsVUFDM0QsTUFBTTtBQUFBLFVBQ047QUFBQSxVQUNBLFVBQVUsYUFBYTtBQUFBLFVBQ3ZCLFlBQVk7QUFBQTtBQUFBLFFBQ3RCLENBQVM7QUFFRCxZQUFJLENBQUMsb0JBQW9CLFNBQVM7QUFDaEMsZ0JBQU0sSUFBSSxNQUFNLGtCQUFrQjtBQUFBLFFBQ3BDO0FBRUEsY0FBTUEsWUFBVyxNQUFNLE9BQU8sUUFBUSxZQUFZO0FBQUEsVUFDaEQsTUFBTTtBQUFBLFVBQ047QUFBQSxVQUNBLFVBQVU7QUFBQSxVQUNWLGNBQWMsb0JBQW9CO0FBQUEsUUFDNUMsQ0FBUztBQUVELFlBQUlBLFVBQVMsU0FBUztBQUVwQixpQkFBTyxNQUFLO0FBQUEsUUFDZCxPQUFPO0FBQ0wsa0JBQVEsY0FBY0EsVUFBUyxTQUFTO0FBQ3hDLGtCQUFRLFVBQVUsT0FBTyxRQUFRO0FBRWpDLHFCQUFXLFdBQVc7QUFDdEIscUJBQVcsTUFBTSxVQUFVO0FBQzNCLHFCQUFXLE1BQU0sU0FBUztBQUFBLFFBQzVCO0FBQUEsTUFDRixTQUFTLE9BQU87QUFDZCxnQkFBUSxjQUFjLE1BQU07QUFDNUIsZ0JBQVEsVUFBVSxPQUFPLFFBQVE7QUFFakMsbUJBQVcsV0FBVztBQUN0QixtQkFBVyxNQUFNLFVBQVU7QUFDM0IsbUJBQVcsTUFBTSxTQUFTO0FBQUEsTUFDNUI7QUFBQSxJQUNGLENBQUM7QUFHRCxhQUFTLGVBQWUsdUJBQXVCLEVBQUUsaUJBQWlCLFNBQVMsWUFBWTtBQUNyRixVQUFJO0FBQ0YsY0FBTSxPQUFPLFFBQVEsWUFBWTtBQUFBLFVBQy9CLE1BQU07QUFBQSxVQUNOO0FBQUEsVUFDQSxVQUFVO0FBQUEsUUFDcEIsQ0FBUztBQUdELGVBQU8sTUFBSztBQUFBLE1BQ2QsU0FBUyxPQUFPO0FBQ2QsY0FBTSxtQ0FBbUMsTUFBTSxPQUFPO0FBQ3RELGVBQU8sTUFBSztBQUFBLE1BQ2Q7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUVILFNBQVMsT0FBTztBQUNkLFVBQU0sNENBQTRDLGNBQWMsTUFBTSxPQUFPLENBQUM7QUFDOUUsV0FBTyxNQUFLO0FBQUEsRUFDZDtBQUNGO0FBR0EsZUFBZSwyQkFBMkI7QUFDeEMsTUFBSSxDQUFDLGFBQWEsUUFBUztBQUUzQixNQUFJO0FBQ0YsVUFBTSxXQUFXLE1BQU0sT0FBTyxRQUFRLFlBQVk7QUFBQSxNQUNoRCxNQUFNO0FBQUEsTUFDTixTQUFTLGFBQWE7QUFBQSxJQUM1QixDQUFLO0FBRUQsVUFBTSxZQUFZLFNBQVMsZUFBZSxzQkFBc0I7QUFDaEUsVUFBTSxTQUFTLFNBQVMsZUFBZSxpQkFBaUI7QUFFeEQsUUFBSSxTQUFTLFdBQVcsU0FBUyxRQUFRLEdBQUc7QUFDMUMsYUFBTyxjQUFjLE1BQU0sU0FBUyxLQUFLLHVCQUF1QixTQUFTLFFBQVEsSUFBSSxNQUFNLEVBQUU7QUFDN0YsZ0JBQVUsVUFBVSxPQUFPLFFBQVE7QUFBQSxJQUNyQyxPQUFPO0FBQ0wsZ0JBQVUsVUFBVSxJQUFJLFFBQVE7QUFBQSxJQUNsQztBQUFBLEVBQ0YsU0FBUyxPQUFPO0FBQ2QsWUFBUSxNQUFNLHdDQUF3QyxLQUFLO0FBQUEsRUFDN0Q7QUFDRjtBQUVBLGVBQWUseUJBQXlCO0FBQ3RDLE1BQUksQ0FBQyxhQUFhLFFBQVM7QUFFM0IsYUFBVyxtQkFBbUI7QUFDOUIsUUFBTSx5QkFBeUIsS0FBSztBQUN0QztBQUdBLGVBQWUsMkJBQTJCLFFBQVE7QUFDaEQsTUFBSSxDQUFDLGFBQWEsUUFBUztBQUUzQixNQUFJO0FBRUYsVUFBTSxhQUFhLE1BQU0sT0FBTyxRQUFRLFlBQVk7QUFBQSxNQUNsRCxNQUFNO0FBQUEsTUFDTixTQUFTLGFBQWE7QUFBQSxNQUN0QjtBQUFBLElBQ04sQ0FBSztBQUVELFFBQUksQ0FBQyxXQUFXLFdBQVcsQ0FBQyxXQUFXLGFBQWE7QUFDbEQsWUFBTSx1QkFBdUI7QUFDN0I7QUFBQSxJQUNGO0FBRUEsVUFBTSxVQUFVLFdBQVcsWUFBWTtBQUd2QyxVQUFNLGtCQUFrQixNQUFNLE9BQU8sUUFBUSxZQUFZO0FBQUEsTUFDdkQsTUFBTTtBQUFBLE1BQ04sU0FBUyxhQUFhO0FBQUEsTUFDdEI7QUFBQSxNQUNBO0FBQUEsSUFDTixDQUFLO0FBRUQsUUFBSSxDQUFDLGdCQUFnQixTQUFTO0FBQzVCLFlBQU0sWUFBWSxnQkFBZ0IsS0FBSztBQUN2QztBQUFBLElBQ0Y7QUFHQSxRQUFJLGdCQUFnQixXQUFXLGFBQWE7QUFDMUMsWUFBTSxvQ0FBb0MsZ0JBQWdCLFdBQVcsR0FBRztBQUFBLElBQzFFLFdBQVcsZ0JBQWdCLFdBQVcsVUFBVTtBQUM5QyxZQUFNLG9DQUFvQztBQUFBLElBQzVDLE9BQU87QUFDTCxZQUFNLCtCQUErQjtBQUFBLElBQ3ZDO0FBR0EsVUFBTSx5QkFBeUIsU0FBUyxjQUFjLGtDQUFrQyxHQUFHLEdBQUcsUUFBUSxXQUFXLEVBQUUsRUFBRSxRQUFRLFFBQVEsRUFBRSxLQUFLLEtBQUs7QUFBQSxFQUVuSixTQUFTLE9BQU87QUFDZCxZQUFRLE1BQU0saUNBQWlDLEtBQUs7QUFDcEQsVUFBTSx5QkFBeUI7QUFBQSxFQUNqQztBQUNGO0FBRUEsZUFBZSx5QkFBeUIsU0FBUyxPQUFPO0FBQ3RELFFBQU0sU0FBUyxTQUFTLGVBQWUsaUJBQWlCO0FBQ3hELE1BQUksQ0FBQyxhQUFhLFNBQVM7QUFDekIsV0FBTyxZQUFZO0FBQ25CO0FBQUEsRUFDRjtBQUVBLFNBQU8sWUFBWTtBQUVuQixNQUFJO0FBQ0YsVUFBTSxXQUFXLE1BQU0sT0FBTyxRQUFRLFlBQVk7QUFBQSxNQUNoRCxNQUFNO0FBQUEsTUFDTixTQUFTLGFBQWE7QUFBQSxJQUM1QixDQUFLO0FBRUQsUUFBSSxDQUFDLFNBQVMsV0FBVyxDQUFDLFNBQVMsZ0JBQWdCLFNBQVMsYUFBYSxXQUFXLEdBQUc7QUFDckYsYUFBTyxZQUFZO0FBQ25CO0FBQUEsSUFDRjtBQUVBLFFBQUksZUFBZSxTQUFTO0FBRzVCLFFBQUksV0FBVyxXQUFXO0FBQ3hCLHFCQUFlLGFBQWEsT0FBTyxRQUFNLEdBQUcsV0FBVyxTQUFTO0FBQUEsSUFDbEUsV0FBVyxXQUFXLGFBQWE7QUFDakMscUJBQWUsYUFBYSxPQUFPLFFBQU0sR0FBRyxXQUFXLFdBQVc7QUFBQSxJQUNwRTtBQUVBLFFBQUksYUFBYSxXQUFXLEdBQUc7QUFDN0IsYUFBTyxZQUFZO0FBQ25CO0FBQUEsSUFDRjtBQUVBLFFBQUksT0FBTztBQUNYLGVBQVcsTUFBTSxjQUFjO0FBQzdCLFlBQU0sYUFBYSxHQUFHLFdBQVcsWUFBWSxNQUMzQixHQUFHLFdBQVcsY0FBYyxNQUFNO0FBQ3BELFlBQU0sY0FBYyxHQUFHLFdBQVcsWUFBWSw0QkFDM0IsR0FBRyxXQUFXLGNBQWMsWUFBWTtBQUUzRCxZQUFNLE9BQU8sSUFBSSxLQUFLLEdBQUcsU0FBUyxFQUFFO0FBQ3BDLFlBQU0sV0FBV0QsWUFBbUIsR0FBRyxTQUFTLEdBQUc7QUFDbkQsWUFBTSxVQUFVNUIsWUFBbUIsR0FBRyxZQUFZLEtBQUssTUFBTTtBQUc3RCxZQUFNLGdCQUFnQixHQUFHLFdBQVcsWUFDaEMsMEdBQTBHLEdBQUcsSUFBSSwwQkFDakg7QUFFSixjQUFRO0FBQUEsdUZBQ3lFLFdBQVcsb0JBQW9CLEdBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQSxvQ0FHekYsV0FBVyx1QkFBdUIsVUFBVSxJQUFJLEdBQUcsT0FBTyxhQUFhO0FBQUEsZ0JBQzNGLGFBQWE7QUFBQTtBQUFBLDhEQUVpQyxJQUFJO0FBQUE7QUFBQSxtRkFFaUIsR0FBRyxLQUFLLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFBQSxvRkFDbkIsUUFBUSxJQUFJLGlCQUFpQixHQUFHLE9BQU8sQ0FBQztBQUFBLDhEQUM5RCxPQUFPLGtCQUFrQixHQUFHLEtBQUs7QUFBQTtBQUFBO0FBQUEsSUFHM0Y7QUFFQSxXQUFPLFlBQVk7QUFHbkIsV0FBTyxpQkFBaUIsZ0JBQWdCLEVBQUUsUUFBUSxRQUFNO0FBQ3RELFNBQUcsaUJBQWlCLFNBQVMsTUFBTTtBQUNqQyxjQUFNLFNBQVMsR0FBRyxRQUFRO0FBQzFCLCtCQUF1QixNQUFNO0FBQUEsTUFDL0IsQ0FBQztBQUFBLElBQ0gsQ0FBQztBQUdELFdBQU8saUJBQWlCLG1CQUFtQixFQUFFLFFBQVEsU0FBTztBQUMxRCxVQUFJLGlCQUFpQixTQUFTLE9BQU8sTUFBTTtBQUN6QyxVQUFFLGVBQWM7QUFDaEIsVUFBRSxnQkFBZTtBQUNqQixjQUFNLFNBQVMsSUFBSSxRQUFRO0FBQzNCLGNBQU0sMkJBQTJCLE1BQU07QUFBQSxNQUN6QyxDQUFDO0FBQUEsSUFDSCxDQUFDO0FBQUEsRUFFSCxTQUFTLE9BQU87QUFDZCxZQUFRLE1BQU0sc0NBQXNDLEtBQUs7QUFDekQsV0FBTyxZQUFZO0FBQUEsRUFDckI7QUFDRjtBQUdBLGVBQWUsMkJBQTJCO0FBQ3hDLE1BQUksQ0FBQyxhQUFhLFdBQVcsQ0FBQyxhQUFhLGNBQWU7QUFFMUQsUUFBTSxNQUFNLFNBQVMsZUFBZSx1QkFBdUI7QUFDM0QsTUFBSSxDQUFDLElBQUs7QUFFVixNQUFJO0FBQ0YsUUFBSSxXQUFXO0FBQ2YsUUFBSSxjQUFjO0FBR2xCLFVBQU0sYUFBYSxNQUFNLE9BQU8sUUFBUSxZQUFZO0FBQUEsTUFDbEQsTUFBTTtBQUFBLE1BQ04sU0FBUyxhQUFhO0FBQUEsTUFDdEIsUUFBUSxhQUFhO0FBQUEsSUFDM0IsQ0FBSztBQUVELFFBQUksQ0FBQyxXQUFXLFdBQVcsQ0FBQyxXQUFXLGFBQWE7QUFDbEQsWUFBTSxJQUFJLE1BQU0sdUJBQXVCO0FBQUEsSUFDekM7QUFFQSxVQUFNLFVBQVUsV0FBVyxZQUFZO0FBR3ZDLFVBQU0sa0JBQWtCLE1BQU0sT0FBTyxRQUFRLFlBQVk7QUFBQSxNQUN2RCxNQUFNO0FBQUEsTUFDTixTQUFTLGFBQWE7QUFBQSxNQUN0QixRQUFRLGFBQWE7QUFBQSxNQUNyQjtBQUFBLElBQ04sQ0FBSztBQUVELFFBQUksQ0FBQyxnQkFBZ0IsU0FBUztBQUM1QixZQUFNLElBQUksTUFBTSxnQkFBZ0IsU0FBUywwQkFBMEI7QUFBQSxJQUNyRTtBQUdBLFFBQUksZ0JBQWdCLFdBQVcsV0FBVztBQUN4QyxZQUFNLGlGQUFpRjtBQUFBLElBQ3pGLFdBQVcsZ0JBQWdCLFdBQVcsYUFBYTtBQUNqRCxZQUFNOztBQUFBLG9DQUEwRCxnQkFBZ0IsV0FBVyxFQUFFO0FBQUEsSUFDL0YsT0FBTztBQUNMLFlBQU0sNERBQTREO0FBQUEsSUFDcEU7QUFHQSxVQUFNLHVCQUF1QixhQUFhLGFBQWE7QUFBQSxFQUV6RCxTQUFTLE9BQU87QUFDZCxZQUFRLE1BQU0sd0NBQXdDLEtBQUs7QUFDM0QsVUFBTSw4QkFBOEIsTUFBTSxPQUFPO0FBQUEsRUFDbkQsVUFBQztBQUNDLFFBQUksV0FBVztBQUNmLFFBQUksY0FBYztBQUFBLEVBQ3BCO0FBQ0Y7QUFFQSxlQUFlLHVCQUF1QixRQUFRO0FBQzVDLE1BQUksQ0FBQyxhQUFhLFFBQVM7QUFFM0IsTUFBSTtBQUNGLFVBQU0sV0FBVyxNQUFNLE9BQU8sUUFBUSxZQUFZO0FBQUEsTUFDaEQsTUFBTTtBQUFBLE1BQ04sU0FBUyxhQUFhO0FBQUEsTUFDdEI7QUFBQSxJQUNOLENBQUs7QUFFRCxRQUFJLENBQUMsU0FBUyxXQUFXLENBQUMsU0FBUyxhQUFhO0FBQzlDLFlBQU0sdUJBQXVCO0FBQzdCO0FBQUEsSUFDRjtBQUVBLFVBQU0sS0FBSyxTQUFTO0FBR3BCLGVBQVcsbUJBQW1CO0FBRzlCLFVBQU0sY0FBYyxTQUFTLGVBQWUsaUJBQWlCO0FBQzdELFVBQU0sYUFBYSxTQUFTLGVBQWUsZ0JBQWdCO0FBRTNELFFBQUksR0FBRyxXQUFXLFdBQVc7QUFDM0IsaUJBQVcsY0FBYztBQUN6QixrQkFBWSxNQUFNLGNBQWM7QUFDaEMsaUJBQVcsTUFBTSxRQUFRO0FBQ3pCLGVBQVMsZUFBZSxvQkFBb0IsRUFBRSxVQUFVLE9BQU8sUUFBUTtBQUN2RSxlQUFTLGVBQWUseUJBQXlCLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFBQSxJQUMzRSxXQUFXLEdBQUcsV0FBVyxhQUFhO0FBQ3BDLGlCQUFXLGNBQWM7QUFDekIsa0JBQVksTUFBTSxjQUFjO0FBQ2hDLGlCQUFXLE1BQU0sUUFBUTtBQUN6QixlQUFTLGVBQWUsb0JBQW9CLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFDcEUsZUFBUyxlQUFlLHlCQUF5QixFQUFFLFVBQVUsT0FBTyxRQUFRO0FBQzVFLGVBQVMsZUFBZSxpQkFBaUIsRUFBRSxjQUFjLEdBQUcsZUFBZTtBQUFBLElBQzdFLE9BQU87QUFDTCxpQkFBVyxjQUFjO0FBQ3pCLGtCQUFZLE1BQU0sY0FBYztBQUNoQyxpQkFBVyxNQUFNLFFBQVE7QUFDekIsZUFBUyxlQUFlLG9CQUFvQixFQUFFLFVBQVUsSUFBSSxRQUFRO0FBQ3BFLGVBQVMsZUFBZSx5QkFBeUIsRUFBRSxVQUFVLElBQUksUUFBUTtBQUFBLElBQzNFO0FBRUEsYUFBUyxlQUFlLGdCQUFnQixFQUFFLGNBQWMsR0FBRztBQUMzRCxhQUFTLGVBQWUsZ0JBQWdCLEVBQUUsY0FBYyxHQUFHO0FBQzNELGFBQVMsZUFBZSxjQUFjLEVBQUUsY0FBYyxHQUFHLE1BQU07QUFDL0QsYUFBUyxlQUFlLGlCQUFpQixFQUFFLGNBQWM0QixZQUFtQixHQUFHLFNBQVMsR0FBRyxJQUFJLE1BQU0saUJBQWlCLEdBQUcsT0FBTztBQUNoSSxhQUFTLGVBQWUsaUJBQWlCLEVBQUUsY0FBYyxHQUFHO0FBQzVELGFBQVMsZUFBZSxxQkFBcUIsRUFBRSxjQUFjNUIsWUFBbUIsR0FBRyxZQUFZLEtBQUssTUFBTSxJQUFJO0FBQzlHLGFBQVMsZUFBZSxtQkFBbUIsRUFBRSxjQUFjLGVBQWUsR0FBRyxPQUFPO0FBQ3BGLGFBQVMsZUFBZSxxQkFBcUIsRUFBRSxjQUFjLElBQUksS0FBSyxHQUFHLFNBQVMsRUFBRTtBQUdwRixpQkFBYSxnQkFBZ0IsR0FBRztBQUdoQyxVQUFNLGNBQWMsU0FBUyxlQUFlLG1CQUFtQjtBQUMvRCxnQkFBWSxVQUFVLE1BQU07QUFDMUIsWUFBTSxNQUFNLGVBQWUsR0FBRyxTQUFTLE1BQU0sR0FBRyxJQUFJO0FBQ3BELGFBQU8sS0FBSyxPQUFPLEVBQUUsSUFBRyxDQUFFO0FBQUEsSUFDNUI7QUFBQSxFQUVGLFNBQVMsT0FBTztBQUNkLFlBQVEsTUFBTSxzQ0FBc0MsS0FBSztBQUN6RCxVQUFNLG1DQUFtQztBQUFBLEVBQzNDO0FBQ0Y7QUFHQSxJQUFJLHVCQUF1QjtBQUFBLEVBQ3pCLFVBQVUsRUFBRSxTQUFTLE1BQU0sV0FBVyxNQUFNLFFBQVEsS0FBSTtBQUFBLEVBQ3hELE1BQU0sRUFBRSxTQUFTLE1BQU0sV0FBVyxNQUFNLFFBQVEsS0FBSTtBQUFBLEVBQ3BELE9BQU8sRUFBRSxTQUFTLE1BQU0sV0FBVyxNQUFNLFFBQVEsS0FBSTtBQUN2RDtBQUdBLElBQUksb0JBQW9CO0FBQUEsRUFDdEIsUUFBUTtBQUFBLEVBQ1IsU0FBUztBQUFBLEVBQ1QsU0FBUztBQUFBLEVBQ1Qsa0JBQWtCO0FBQUEsRUFDbEIsaUJBQWlCO0FBQUEsRUFDakIscUJBQXFCO0FBQ3ZCO0FBR0EsSUFBSSxtQkFBbUI7QUFBQSxFQUNyQixRQUFRO0FBQUEsRUFDUixTQUFTO0FBQUEsRUFDVCxTQUFTO0FBQUEsRUFDVCxrQkFBa0I7QUFBQSxFQUNsQixpQkFBaUI7QUFBQSxFQUNqQixxQkFBcUI7QUFDdkI7QUFFQSxlQUFlLDJCQUEyQjtBQUN4QyxNQUFJLENBQUMsYUFBYSxXQUFXLENBQUMsYUFBYSxjQUFlO0FBRTFELE1BQUk7QUFFRixVQUFNLGFBQWEsTUFBTSxPQUFPLFFBQVEsWUFBWTtBQUFBLE1BQ2xELE1BQU07QUFBQSxNQUNOLFNBQVMsYUFBYTtBQUFBLE1BQ3RCLFFBQVEsYUFBYTtBQUFBLElBQzNCLENBQUs7QUFFRCxRQUFJLENBQUMsV0FBVyxXQUFXLENBQUMsV0FBVyxhQUFhO0FBQ2xELFlBQU0sb0NBQW9DO0FBQzFDO0FBQUEsSUFDRjtBQUVBLFVBQU0sS0FBSyxXQUFXO0FBR3RCLHNCQUFrQixTQUFTLGFBQWE7QUFDeEMsc0JBQWtCLFVBQVUsYUFBYTtBQUN6QyxzQkFBa0IsVUFBVSxHQUFHO0FBQy9CLHNCQUFrQixtQkFBbUIsR0FBRztBQUd4QyxhQUFTLGVBQWUsbUJBQW1CLEVBQUUsVUFBVSxPQUFPLFFBQVE7QUFDdEUsVUFBTSxpQkFBZ0I7QUFBQSxFQUV4QixTQUFTLE9BQU87QUFDZCxZQUFRLE1BQU0saUNBQWlDLEtBQUs7QUFDcEQsVUFBTSwwQkFBMEI7QUFBQSxFQUNsQztBQUNGO0FBRUEsZUFBZSxtQkFBbUI7QUFDaEMsUUFBTSxZQUFZLFNBQVMsZUFBZSxrQkFBa0I7QUFDNUQsUUFBTSxhQUFhLFNBQVMsZUFBZSx1QkFBdUI7QUFFbEUsTUFBSTtBQUVGLGNBQVUsVUFBVSxPQUFPLFFBQVE7QUFDbkMsZUFBVyxXQUFXO0FBQ3RCLGVBQVcsY0FBYztBQUd6QixVQUFNLGNBQWMsTUFBTSxPQUFPLFFBQVEsWUFBWTtBQUFBLE1BQ25ELE1BQU07QUFBQSxNQUNOLFNBQVMsa0JBQWtCO0FBQUEsSUFDakMsQ0FBSztBQUVELFFBQUksQ0FBQyxZQUFZLFNBQVM7QUFDeEIsWUFBTSxJQUFJLE1BQU0sWUFBWSxTQUFTLDJCQUEyQjtBQUFBLElBQ2xFO0FBR0Esc0JBQWtCLGtCQUFrQixZQUFZO0FBQ2hELFVBQU0sY0FBYyxXQUFXLFlBQVksWUFBWTtBQUN2RCxVQUFNLG1CQUFtQixjQUFjLEtBQUssUUFBUSxDQUFDO0FBQ3JELHNCQUFrQix1QkFBdUIsT0FBTyxZQUFZLFFBQVEsSUFBSSxPQUFPLEdBQUcsSUFBSSxPQUFPLEdBQUcsR0FBRyxTQUFRO0FBRzNHLFVBQU0sZ0JBQWdCLE9BQU8sa0JBQWtCLGdCQUFnQixJQUFJLEtBQUssUUFBUSxDQUFDO0FBQ2pGLGFBQVMsZUFBZSx1QkFBdUIsRUFBRSxjQUFjLEdBQUcsWUFBWTtBQUM5RSxhQUFTLGVBQWUsc0JBQXNCLEVBQUUsY0FBYyxHQUFHLFdBQVc7QUFDNUUsYUFBUyxlQUFlLDBCQUEwQixFQUFFLGNBQWMsR0FBRyxlQUFlO0FBR3BGLFVBQU0sYUFBYSxjQUFjLFdBQVcsWUFBWTtBQUN4RCxVQUFNLFlBQVksU0FBUyxlQUFlLDZCQUE2QjtBQUN2RSxRQUFJLGFBQWEsR0FBRztBQUNsQixnQkFBVSxjQUFjLHFCQUFxQixXQUFXLFFBQVEsQ0FBQyxDQUFDO0FBQ2xFLGdCQUFVLE1BQU0sUUFBUTtBQUFBLElBQzFCLFdBQVcsYUFBYSxLQUFLO0FBQzNCLGdCQUFVLGNBQWMsa0JBQWtCLFdBQVcsUUFBUSxDQUFDLENBQUM7QUFDL0QsZ0JBQVUsTUFBTSxRQUFRO0FBQUEsSUFDMUIsT0FBTztBQUNMLGdCQUFVLGNBQWM7QUFDeEIsZ0JBQVUsTUFBTSxRQUFRO0FBQUEsSUFDMUI7QUFBQSxFQUVGLFNBQVMsT0FBTztBQUNkLFlBQVEsTUFBTSxnQ0FBZ0MsS0FBSztBQUNuRCxhQUFTLGVBQWUsNkJBQTZCLEVBQUUsY0FBYyxVQUFVLE1BQU0sT0FBTztBQUM1RixhQUFTLGVBQWUsNkJBQTZCLEVBQUUsTUFBTSxRQUFRO0FBQUEsRUFDdkUsVUFBQztBQUNDLGNBQVUsVUFBVSxJQUFJLFFBQVE7QUFDaEMsZUFBVyxXQUFXO0FBQ3RCLGVBQVcsY0FBYztBQUFBLEVBQzNCO0FBQ0Y7QUFFQSxlQUFlLGlCQUFpQjtBQUM5QixNQUFJO0FBRUYsVUFBTSxpQkFBaUIsU0FBUyxlQUFlLHFCQUFxQixFQUFFO0FBQ3RFLFFBQUksZ0JBQWdCLGtCQUFrQjtBQUV0QyxRQUFJLGtCQUFrQixlQUFlLEtBQUksTUFBTyxJQUFJO0FBQ2xELFlBQU0sYUFBYSxXQUFXLGNBQWM7QUFDNUMsVUFBSSxNQUFNLFVBQVUsS0FBSyxjQUFjLEdBQUc7QUFDeEMsY0FBTSxvREFBb0Q7QUFDMUQ7QUFBQSxNQUNGO0FBRUEsc0JBQWlCLE9BQU8sS0FBSyxNQUFNLGFBQWEsR0FBRyxDQUFDLEVBQUc7SUFDekQ7QUFHQSxhQUFTLGVBQWUsbUJBQW1CLEVBQUUsVUFBVSxJQUFJLFFBQVE7QUFHbkUsVUFBTSxXQUFXLE1BQU0sbUJBQW1CLHdCQUF3Qix5Q0FBeUM7QUFDM0csUUFBSSxDQUFDLFNBQVU7QUFHZixVQUFNLGVBQWUsTUFBTTtBQUMzQixVQUFNLGtCQUFrQixNQUFNLE9BQU8sUUFBUSxZQUFZO0FBQUEsTUFDdkQsTUFBTTtBQUFBLE1BQ047QUFBQSxNQUNBLFVBQVUsYUFBYTtBQUFBLE1BQ3ZCLFlBQVk7QUFBQSxJQUNsQixDQUFLO0FBRUQsUUFBSSxDQUFDLGdCQUFnQixTQUFTO0FBQzVCLFlBQU0sa0JBQWtCO0FBQ3hCO0FBQUEsSUFDRjtBQUdBLFVBQU0sV0FBVyxNQUFNLE9BQU8sUUFBUSxZQUFZO0FBQUEsTUFDaEQsTUFBTTtBQUFBLE1BQ04sU0FBUyxrQkFBa0I7QUFBQSxNQUMzQixRQUFRLGtCQUFrQjtBQUFBLE1BQzFCLGNBQWMsZ0JBQWdCO0FBQUEsTUFDOUIsZ0JBQWdCO0FBQUEsSUFDdEIsQ0FBSztBQUVELFFBQUksU0FBUyxTQUFTO0FBQ3BCLFlBQU07QUFBQSxVQUFpQyxTQUFTLE9BQU8sTUFBTSxHQUFHLEVBQUUsQ0FBQyxLQUFLO0FBQ3hFLDZCQUF1QixTQUFTLE1BQU07QUFBQSxJQUN4QyxPQUFPO0FBQ0wsWUFBTSxvQ0FBb0MsU0FBUyxLQUFLO0FBQUEsSUFDMUQ7QUFBQSxFQUVGLFNBQVMsT0FBTztBQUNkLFlBQVEsTUFBTSxrQ0FBa0MsS0FBSztBQUNyRCxVQUFNLCtCQUErQjtBQUFBLEVBQ3ZDO0FBQ0Y7QUFHQSxlQUFlLHlCQUF5QjtBQUN0QyxRQUFNLFlBQVksU0FBUyxlQUFlLGdCQUFnQjtBQUMxRCxRQUFNLGFBQWEsU0FBUyxlQUFlLDhCQUE4QjtBQUV6RSxNQUFJO0FBRUYsY0FBVSxVQUFVLE9BQU8sUUFBUTtBQUNuQyxlQUFXLFdBQVc7QUFDdEIsZUFBVyxjQUFjO0FBR3pCLFVBQU0sY0FBYyxNQUFNLE9BQU8sUUFBUSxZQUFZO0FBQUEsTUFDbkQsTUFBTTtBQUFBLE1BQ04sU0FBUyxpQkFBaUI7QUFBQSxJQUNoQyxDQUFLO0FBRUQsUUFBSSxDQUFDLFlBQVksU0FBUztBQUN4QixZQUFNLElBQUksTUFBTSxZQUFZLFNBQVMsMkJBQTJCO0FBQUEsSUFDbEU7QUFHQSxxQkFBaUIsa0JBQWtCLFlBQVk7QUFDL0MsVUFBTSxjQUFjLFdBQVcsWUFBWSxZQUFZO0FBQ3ZELFVBQU0sbUJBQW1CLGNBQWMsS0FBSyxRQUFRLENBQUM7QUFDckQscUJBQWlCLHVCQUF1QixPQUFPLFlBQVksUUFBUSxJQUFJLE9BQU8sR0FBRyxJQUFJLE9BQU8sR0FBRyxHQUFHLFNBQVE7QUFHMUcsVUFBTSxnQkFBZ0IsT0FBTyxpQkFBaUIsZ0JBQWdCLElBQUksS0FBSyxRQUFRLENBQUM7QUFDaEYsYUFBUyxlQUFlLHFCQUFxQixFQUFFLGNBQWMsR0FBRyxZQUFZO0FBQzVFLGFBQVMsZUFBZSxvQkFBb0IsRUFBRSxjQUFjLEdBQUcsV0FBVztBQUMxRSxhQUFTLGVBQWUsd0JBQXdCLEVBQUUsY0FBYyxHQUFHLGVBQWU7QUFHbEYsVUFBTSxhQUFhLGNBQWMsV0FBVyxZQUFZO0FBQ3hELFVBQU0sWUFBWSxTQUFTLGVBQWUsMkJBQTJCO0FBQ3JFLFFBQUksYUFBYSxHQUFHO0FBQ2xCLGdCQUFVLGNBQWMscUJBQXFCLFdBQVcsUUFBUSxDQUFDLENBQUM7QUFDbEUsZ0JBQVUsTUFBTSxRQUFRO0FBQUEsSUFDMUIsV0FBVyxhQUFhLEtBQUs7QUFDM0IsZ0JBQVUsY0FBYyxrQkFBa0IsV0FBVyxRQUFRLENBQUMsQ0FBQztBQUMvRCxnQkFBVSxNQUFNLFFBQVE7QUFBQSxJQUMxQixPQUFPO0FBQ0wsZ0JBQVUsY0FBYztBQUN4QixnQkFBVSxNQUFNLFFBQVE7QUFBQSxJQUMxQjtBQUFBLEVBRUYsU0FBUyxPQUFPO0FBQ2QsWUFBUSxNQUFNLHVDQUF1QyxLQUFLO0FBQzFELGFBQVMsZUFBZSwyQkFBMkIsRUFBRSxjQUFjLFVBQVUsTUFBTSxPQUFPO0FBQzFGLGFBQVMsZUFBZSwyQkFBMkIsRUFBRSxNQUFNLFFBQVE7QUFBQSxFQUNyRSxVQUFDO0FBQ0MsY0FBVSxVQUFVLElBQUksUUFBUTtBQUNoQyxlQUFXLFdBQVc7QUFDdEIsZUFBVyxjQUFjO0FBQUEsRUFDM0I7QUFDRjtBQUdBLGVBQWUsMkJBQTJCO0FBQ3hDLE1BQUk7QUFFRixVQUFNLGlCQUFpQixTQUFTLGVBQWUsbUJBQW1CLEVBQUU7QUFDcEUsUUFBSSxnQkFBZ0IsaUJBQWlCO0FBRXJDLFFBQUksa0JBQWtCLGVBQWUsS0FBSSxNQUFPLElBQUk7QUFDbEQsWUFBTSxhQUFhLFdBQVcsY0FBYztBQUM1QyxVQUFJLE1BQU0sVUFBVSxLQUFLLGNBQWMsR0FBRztBQUN4QyxjQUFNLG9EQUFvRDtBQUMxRDtBQUFBLE1BQ0Y7QUFFQSxzQkFBaUIsT0FBTyxLQUFLLE1BQU0sYUFBYSxHQUFHLENBQUMsRUFBRztJQUN6RDtBQUdBLGFBQVMsZUFBZSxpQkFBaUIsRUFBRSxVQUFVLElBQUksUUFBUTtBQUdqRSxVQUFNLFdBQVcsTUFBTSxtQkFBbUIsc0JBQXNCLDZDQUE2QztBQUM3RyxRQUFJLENBQUMsU0FBVTtBQUdmLFVBQU0sZUFBZSxNQUFNO0FBQzNCLFVBQU0sa0JBQWtCLE1BQU0sT0FBTyxRQUFRLFlBQVk7QUFBQSxNQUN2RCxNQUFNO0FBQUEsTUFDTjtBQUFBLE1BQ0EsVUFBVSxhQUFhO0FBQUEsTUFDdkIsWUFBWTtBQUFBLElBQ2xCLENBQUs7QUFFRCxRQUFJLENBQUMsZ0JBQWdCLFNBQVM7QUFDNUIsWUFBTSxrQkFBa0I7QUFDeEI7QUFBQSxJQUNGO0FBR0EsVUFBTSxXQUFXLE1BQU0sT0FBTyxRQUFRLFlBQVk7QUFBQSxNQUNoRCxNQUFNO0FBQUEsTUFDTixTQUFTLGlCQUFpQjtBQUFBLE1BQzFCLFFBQVEsaUJBQWlCO0FBQUEsTUFDekIsY0FBYyxnQkFBZ0I7QUFBQSxNQUM5QixnQkFBZ0I7QUFBQSxJQUN0QixDQUFLO0FBRUQsUUFBSSxTQUFTLFNBQVM7QUFDcEIsWUFBTTtBQUFBLG1CQUE0QyxTQUFTLE9BQU8sTUFBTSxHQUFHLEVBQUUsQ0FBQyxLQUFLO0FBQ25GLDZCQUF1QixTQUFTLE1BQU07QUFBQSxJQUN4QyxPQUFPO0FBQ0wsWUFBTSxtQ0FBbUMsU0FBUyxLQUFLO0FBQUEsSUFDekQ7QUFBQSxFQUVGLFNBQVMsT0FBTztBQUNkLFlBQVEsTUFBTSxpQ0FBaUMsS0FBSztBQUNwRCxVQUFNLDhCQUE4QjtBQUFBLEVBQ3RDO0FBQ0Y7QUFHQSxlQUFlLDBCQUEwQjtBQUN2QyxRQUFNLE1BQU0sU0FBUyxlQUFlLDBCQUEwQjtBQUM5RCxNQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFxQixTQUFTLFFBQVM7QUFFcEQsTUFBSTtBQUNGLFFBQUksV0FBVztBQUNmLFFBQUksY0FBYztBQUVsQixVQUFNLEVBQUUsU0FBUyxXQUFXLE9BQU0sSUFBSyxxQkFBcUI7QUFDNUQsVUFBTSxrQkFBa0IsU0FBUyxXQUFXLE1BQU07QUFBQSxFQUNwRCxTQUFTLE9BQU87QUFDZCxZQUFRLE1BQU0sK0JBQStCLEtBQUs7QUFDbEQsVUFBTSw0QkFBNEI7QUFBQSxFQUNwQyxVQUFDO0FBQ0MsUUFBSSxXQUFXO0FBQ2YsUUFBSSxjQUFjO0FBQUEsRUFDcEI7QUFDRjtBQUdBLGVBQWUsc0JBQXNCO0FBQ25DLFFBQU0sTUFBTSxTQUFTLGVBQWUsc0JBQXNCO0FBQzFELE1BQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLEtBQUssUUFBUztBQUVoRCxNQUFJO0FBQ0YsUUFBSSxXQUFXO0FBQ2YsUUFBSSxjQUFjO0FBRWxCLFVBQU0sRUFBRSxTQUFTLFdBQVcsT0FBTSxJQUFLLHFCQUFxQjtBQUM1RCxVQUFNLHNCQUFzQixTQUFTLFdBQVcsTUFBTTtBQUFBLEVBQ3hELFNBQVMsT0FBTztBQUNkLFlBQVEsTUFBTSwrQkFBK0IsS0FBSztBQUNsRCxVQUFNLDRCQUE0QjtBQUFBLEVBQ3BDLFVBQUM7QUFDQyxRQUFJLFdBQVc7QUFDZixRQUFJLGNBQWM7QUFBQSxFQUNwQjtBQUNGO0FBR0EsZUFBZSx1QkFBdUI7QUFDcEMsUUFBTSxNQUFNLFNBQVMsZUFBZSx1QkFBdUI7QUFDM0QsTUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsTUFBTSxRQUFTO0FBRWpELE1BQUk7QUFDRixRQUFJLFdBQVc7QUFDZixRQUFJLGNBQWM7QUFFbEIsVUFBTSxFQUFFLFNBQVMsV0FBVyxPQUFNLElBQUsscUJBQXFCO0FBQzVELFVBQU0sdUJBQXVCLFNBQVMsV0FBVyxNQUFNO0FBQUEsRUFDekQsU0FBUyxPQUFPO0FBQ2QsWUFBUSxNQUFNLCtCQUErQixLQUFLO0FBQ2xELFVBQU0sNEJBQTRCO0FBQUEsRUFDcEMsVUFBQztBQUNDLFFBQUksV0FBVztBQUNmLFFBQUksY0FBYztBQUFBLEVBQ3BCO0FBQ0Y7QUFFQSxlQUFlLDBCQUEwQjtBQUN2QyxNQUFJLENBQUMsYUFBYSxXQUFXLENBQUMsYUFBYSxjQUFlO0FBRTFELE1BQUk7QUFFRixVQUFNLGFBQWEsTUFBTSxPQUFPLFFBQVEsWUFBWTtBQUFBLE1BQ2xELE1BQU07QUFBQSxNQUNOLFNBQVMsYUFBYTtBQUFBLE1BQ3RCLFFBQVEsYUFBYTtBQUFBLElBQzNCLENBQUs7QUFFRCxRQUFJLENBQUMsV0FBVyxXQUFXLENBQUMsV0FBVyxhQUFhO0FBQ2xELFlBQU0sb0NBQW9DO0FBQzFDO0FBQUEsSUFDRjtBQUVBLFVBQU0sS0FBSyxXQUFXO0FBR3RCLHFCQUFpQixTQUFTLGFBQWE7QUFDdkMscUJBQWlCLFVBQVUsYUFBYTtBQUN4QyxxQkFBaUIsVUFBVSxHQUFHO0FBQzlCLHFCQUFpQixtQkFBbUIsR0FBRztBQUd2QyxhQUFTLGVBQWUsaUJBQWlCLEVBQUUsVUFBVSxPQUFPLFFBQVE7QUFDcEUsVUFBTSx1QkFBc0I7QUFBQSxFQUU5QixTQUFTLE9BQU87QUFDZCxZQUFRLE1BQU0sK0JBQStCLEtBQUs7QUFDbEQsVUFBTSwwQkFBMEI7QUFBQSxFQUNsQztBQUNGO0FBRUEsZUFBZSxnQ0FBZ0M7QUFDN0MsTUFBSSxDQUFDLFFBQVEsd0VBQXdFLEdBQUc7QUFDdEY7QUFBQSxFQUNGO0FBRUEsTUFBSTtBQUNGLFVBQU0sT0FBTyxRQUFRLFlBQVk7QUFBQSxNQUMvQixNQUFNO0FBQUEsTUFDTixTQUFTLGFBQWE7QUFBQSxJQUM1QixDQUFLO0FBRUQsVUFBTSw2QkFBNkI7QUFDbkMsZUFBVyxrQkFBa0I7QUFDN0IsVUFBTSxnQkFBZTtBQUFBLEVBQ3ZCLFNBQVMsT0FBTztBQUNkLFlBQVEsTUFBTSx1Q0FBdUMsS0FBSztBQUMxRCxVQUFNLG9DQUFvQztBQUFBLEVBQzVDO0FBQ0Y7QUFNQSxJQUFJLHVCQUF1QjtBQUMzQixJQUFJLHNCQUFzQjtBQUMxQixJQUFJLHlCQUF5QjtBQUU3QixlQUFlLHNCQUFzQixRQUFRLFNBQVMsV0FBVztBQUkvRCx3QkFBc0I7QUFDdEIsMkJBQXlCO0FBR3pCLFdBQVMsZUFBZSxrQkFBa0IsRUFBRSxVQUFVLElBQUksUUFBUTtBQUdsRSxRQUFNLGdCQUFnQixTQUFTLGVBQWUsbUJBQW1CO0FBQ2pFLGdCQUFjLFVBQVUsT0FBTyxRQUFRO0FBR3ZDLFdBQVMsZUFBZSxnQkFBZ0IsRUFBRSxjQUFjO0FBR3hELFFBQU0sZUFBZSxZQUFZO0FBQy9CLFFBQUk7QUFFRixZQUFNLFdBQVcsTUFBTSxPQUFPLFFBQVEsWUFBWTtBQUFBLFFBQ2hELE1BQU07QUFBQSxRQUNOLFNBQVM7QUFBQSxRQUNUO0FBQUEsTUFDUixDQUFPO0FBSUQsVUFBSSxTQUFTLFdBQVcsU0FBUyxhQUFhO0FBQzVDLGNBQU0sS0FBSyxTQUFTO0FBR3BCLGNBQU0sZ0JBQWdCLFNBQVMsZUFBZSxtQkFBbUI7QUFDakUsY0FBTSxnQkFBZ0IsU0FBUyxlQUFlLG1CQUFtQjtBQUNqRSxjQUFNLGlCQUFpQixTQUFTLGVBQWUsMkJBQTJCO0FBRTFFLFlBQUksR0FBRyxXQUFXLGFBQWE7QUFFN0Isd0JBQWMsY0FBYztBQUM1Qix3QkFBYyxjQUFjLFVBQVUsR0FBRyxXQUFXO0FBQ3BELHdCQUFjLE1BQU0sUUFBUTtBQUM1Qix5QkFBZSxVQUFVLElBQUksUUFBUTtBQUdyQyxjQUFJLHNCQUFzQjtBQUN4QiwwQkFBYyxvQkFBb0I7QUFDbEMsbUNBQXVCO0FBQUEsVUFDekI7QUFHQSxxQkFBVyxNQUFNO0FBQ2YsbUJBQU8sTUFBSztBQUFBLFVBQ2QsR0FBRyxHQUFJO0FBQUEsUUFDVCxXQUFXLEdBQUcsV0FBVyxVQUFVO0FBQ2pDLHdCQUFjLGNBQWM7QUFDNUIsd0JBQWMsY0FBYztBQUM1Qix3QkFBYyxNQUFNLFFBQVE7QUFDNUIseUJBQWUsVUFBVSxJQUFJLFFBQVE7QUFHckMsY0FBSSxzQkFBc0I7QUFDeEIsMEJBQWMsb0JBQW9CO0FBQ2xDLG1DQUF1QjtBQUFBLFVBQ3pCO0FBR0EscUJBQVcsTUFBTTtBQUNmLG1CQUFPLE1BQUs7QUFBQSxVQUNkLEdBQUcsR0FBSTtBQUFBLFFBQ1QsT0FBTztBQUVMLHdCQUFjLGNBQWM7QUFDNUIsd0JBQWMsY0FBYztBQUM1Qix3QkFBYyxNQUFNLFFBQVE7QUFDNUIseUJBQWUsVUFBVSxPQUFPLFFBQVE7QUFBQSxRQUMxQztBQUFBLE1BQ0YsT0FBTztBQUNMLGdCQUFRLEtBQUssd0NBQXdDLE1BQU07QUFBQSxNQUM3RDtBQUFBLElBQ0YsU0FBUyxPQUFPO0FBQ2QsY0FBUSxNQUFNLHlDQUF5QyxLQUFLO0FBQUEsSUFDOUQ7QUFBQSxFQUNGO0FBR0EsUUFBTSxhQUFZO0FBR2xCLHlCQUF1QixZQUFZLGNBQWMsR0FBSTtBQUN2RDtBQUVBLFNBQVMsaUJBQWlCLFNBQVM7QUFDakMsUUFBTSxVQUFVO0FBQUEsSUFDZCxjQUFjO0FBQUEsSUFDZCxxQkFBcUI7QUFBQSxJQUNyQixZQUFZO0FBQUEsSUFDWixXQUFXO0FBQUEsRUFDZjtBQUNFLFNBQU8sUUFBUSxPQUFPLEtBQUs7QUFDN0I7QUFFQSxTQUFTLGVBQWUsU0FBUztBQUMvQixRQUFNLFFBQVE7QUFBQSxJQUNaLGNBQWM7QUFBQSxJQUNkLHFCQUFxQjtBQUFBLElBQ3JCLFlBQVk7QUFBQSxJQUNaLFdBQVc7QUFBQSxFQUNmO0FBQ0UsU0FBTyxNQUFNLE9BQU8sS0FBSztBQUMzQjtBQUdBLGVBQWUsb0JBQW9CO0FBQ2pDLE1BQUk7QUFDRixVQUFNLFVBQVUsVUFBVSxVQUFVLGFBQWEsT0FBTztBQUN4RCxVQUFNLE1BQU0sU0FBUyxlQUFlLGtCQUFrQjtBQUN0RCxVQUFNLGVBQWUsSUFBSTtBQUN6QixRQUFJLGNBQWM7QUFDbEIsZUFBVyxNQUFNO0FBQ2YsVUFBSSxjQUFjO0FBQUEsSUFDcEIsR0FBRyxHQUFJO0FBQUEsRUFDVCxTQUFTLE9BQU87QUFDZCxVQUFNLHdCQUF3QjtBQUFBLEVBQ2hDO0FBQ0YiLCJuYW1lcyI6WyJ1dGlscyIsInZlcnNpb24iLCJleHBvcnRzIiwicmVxdWlyZSQkMCIsIm1hc2tQYXR0ZXJuIiwiZXJyb3JDb3JyZWN0aW9uTGV2ZWwiLCJyZXF1aXJlJCQxIiwibW9kZSIsInJlcXVpcmUkJDIiLCJyZXF1aXJlJCQzIiwicmVxdWlyZSQkNCIsInNlZ21lbnRzIiwiYml0QnVmZmVyIiwiZGlqa3N0cmEiLCJyZXF1aXJlJCQ1IiwicmVxdWlyZSQkNiIsInJlcXVpcmUkJDciLCJyZWdleCIsInJlcXVpcmUkJDgiLCJyZXF1aXJlJCQ5IiwicmVxdWlyZSQkMTAiLCJyZXF1aXJlJCQxMSIsInJlcXVpcmUkJDEyIiwiY2FudmFzIiwic3ZnVGFnIiwiY2FuUHJvbWlzZSIsIlFSQ29kZSIsImV0aGVycy5Db250cmFjdCIsImV0aGVycy5mb3JtYXRVbml0cyIsImV0aGVycy5wYXJzZVVuaXRzIiwiZXRoZXJzLmlzQWRkcmVzcyIsImdldEV4cGxvcmVyVXJsIiwiZXRoZXJzLkludGVyZmFjZSIsInRva2VucyIsInBsc1Jlc2VydmUiLCJzY3JlZW4iLCJldGhlcnMiLCJycGMuZ2V0QmFsYW5jZSIsInJwYy5mb3JtYXRCYWxhbmNlIiwiZXRoZXJzLnBhcnNlRXRoZXIiLCJycGMuZ2V0UHJvdmlkZXIiLCJ0b2tlbnMuZ2V0QWxsVG9rZW5zIiwicnBjLmdldFRyYW5zYWN0aW9uQ291bnQiLCJlcmMyMC5nZXRUb2tlbkJhbGFuY2UiLCJlcmMyMC5mb3JtYXRUb2tlbkJhbGFuY2UiLCJlcmMyMC5wYXJzZVRva2VuQW1vdW50IiwidG9rZW5zLkRFRkFVTFRfVE9LRU5TIiwidG9rZW5zLmdldEVuYWJsZWREZWZhdWx0VG9rZW5zIiwidG9rZW5zLmdldEN1c3RvbVRva2VucyIsInRva2Vucy5yZW1vdmVDdXN0b21Ub2tlbiIsInRva2Vucy50b2dnbGVEZWZhdWx0VG9rZW4iLCJlcmMyMC5nZXRUb2tlbk1ldGFkYXRhIiwidG9rZW5zLmFkZEN1c3RvbVRva2VuIiwicnBjLmdldEdhc1ByaWNlIiwicnBjLmdldFNhZmVHYXNQcmljZSIsInJwYy5lc3RpbWF0ZUdhcyIsImV0aGVycy5mb3JtYXRFdGhlciIsInJlc3BvbnNlIiwiZXRoZXJzLmdldEJ5dGVzIiwiZXRoZXJzLnRvVXRmOFN0cmluZyJdLCJpZ25vcmVMaXN0IjpbMCwxLDIsMyw0LDUsNiw3LDgsOSwxMCwxMSwxMiwxMywxNCwxNSwxNiwxNywxOCwxOSwyMCwyMSwyMiwyMywyNCwyNSwyNiwyN10sInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY2FuLXByb21pc2UuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL3V0aWxzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9lcnJvci1jb3JyZWN0aW9uLWxldmVsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9iaXQtYnVmZmVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9iaXQtbWF0cml4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9hbGlnbm1lbnQtcGF0dGVybi5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvZmluZGVyLXBhdHRlcm4uanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL21hc2stcGF0dGVybi5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvZXJyb3ItY29ycmVjdGlvbi1jb2RlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9nYWxvaXMtZmllbGQuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL3BvbHlub21pYWwuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL3JlZWQtc29sb21vbi1lbmNvZGVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS92ZXJzaW9uLWNoZWNrLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9yZWdleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvbW9kZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvdmVyc2lvbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvZm9ybWF0LWluZm8uanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL251bWVyaWMtZGF0YS5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYWxwaGFudW1lcmljLWRhdGEuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2J5dGUtZGF0YS5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUva2FuamktZGF0YS5qcyIsIi4uL25vZGVfbW9kdWxlcy9kaWprc3RyYWpzL2RpamtzdHJhLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9zZWdtZW50cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcXJjb2RlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvcmVuZGVyZXIvdXRpbHMuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9yZW5kZXJlci9jYW52YXMuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9yZW5kZXJlci9zdmctdGFnLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvYnJvd3Nlci5qcyIsIi4uL3NyYy9jb3JlL2VyYzIwLmpzIiwiLi4vc3JjL2NvcmUvdG9rZW5zLmpzIiwiLi4vc3JjL2NvcmUvY29udHJhY3REZWNvZGVyLmpzIiwiLi4vc3JjL2NvcmUvcHJpY2VPcmFjbGUuanMiLCIuLi9zcmMvcG9wdXAvcG9wdXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gY2FuLXByb21pc2UgaGFzIGEgY3Jhc2ggaW4gc29tZSB2ZXJzaW9ucyBvZiByZWFjdCBuYXRpdmUgdGhhdCBkb250IGhhdmVcbi8vIHN0YW5kYXJkIGdsb2JhbCBvYmplY3RzXG4vLyBodHRwczovL2dpdGh1Yi5jb20vc29sZGFpci9ub2RlLXFyY29kZS9pc3N1ZXMvMTU3XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdHlwZW9mIFByb21pc2UgPT09ICdmdW5jdGlvbicgJiYgUHJvbWlzZS5wcm90b3R5cGUgJiYgUHJvbWlzZS5wcm90b3R5cGUudGhlblxufVxuIiwibGV0IHRvU0pJU0Z1bmN0aW9uXG5jb25zdCBDT0RFV09SRFNfQ09VTlQgPSBbXG4gIDAsIC8vIE5vdCB1c2VkXG4gIDI2LCA0NCwgNzAsIDEwMCwgMTM0LCAxNzIsIDE5NiwgMjQyLCAyOTIsIDM0NixcbiAgNDA0LCA0NjYsIDUzMiwgNTgxLCA2NTUsIDczMywgODE1LCA5MDEsIDk5MSwgMTA4NSxcbiAgMTE1NiwgMTI1OCwgMTM2NCwgMTQ3NCwgMTU4OCwgMTcwNiwgMTgyOCwgMTkyMSwgMjA1MSwgMjE4NSxcbiAgMjMyMywgMjQ2NSwgMjYxMSwgMjc2MSwgMjg3NiwgMzAzNCwgMzE5NiwgMzM2MiwgMzUzMiwgMzcwNlxuXVxuXG4vKipcbiAqIFJldHVybnMgdGhlIFFSIENvZGUgc2l6ZSBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgIHNpemUgb2YgUVIgY29kZVxuICovXG5leHBvcnRzLmdldFN5bWJvbFNpemUgPSBmdW5jdGlvbiBnZXRTeW1ib2xTaXplICh2ZXJzaW9uKSB7XG4gIGlmICghdmVyc2lvbikgdGhyb3cgbmV3IEVycm9yKCdcInZlcnNpb25cIiBjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnKVxuICBpZiAodmVyc2lvbiA8IDEgfHwgdmVyc2lvbiA+IDQwKSB0aHJvdyBuZXcgRXJyb3IoJ1widmVyc2lvblwiIHNob3VsZCBiZSBpbiByYW5nZSBmcm9tIDEgdG8gNDAnKVxuICByZXR1cm4gdmVyc2lvbiAqIDQgKyAxN1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHRvdGFsIG51bWJlciBvZiBjb2Rld29yZHMgdXNlZCB0byBzdG9yZSBkYXRhIGFuZCBFQyBpbmZvcm1hdGlvbi5cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgRGF0YSBsZW5ndGggaW4gYml0c1xuICovXG5leHBvcnRzLmdldFN5bWJvbFRvdGFsQ29kZXdvcmRzID0gZnVuY3Rpb24gZ2V0U3ltYm9sVG90YWxDb2Rld29yZHMgKHZlcnNpb24pIHtcbiAgcmV0dXJuIENPREVXT1JEU19DT1VOVFt2ZXJzaW9uXVxufVxuXG4vKipcbiAqIEVuY29kZSBkYXRhIHdpdGggQm9zZS1DaGF1ZGh1cmktSG9jcXVlbmdoZW1cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGRhdGEgVmFsdWUgdG8gZW5jb2RlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgRW5jb2RlZCB2YWx1ZVxuICovXG5leHBvcnRzLmdldEJDSERpZ2l0ID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgbGV0IGRpZ2l0ID0gMFxuXG4gIHdoaWxlIChkYXRhICE9PSAwKSB7XG4gICAgZGlnaXQrK1xuICAgIGRhdGEgPj4+PSAxXG4gIH1cblxuICByZXR1cm4gZGlnaXRcbn1cblxuZXhwb3J0cy5zZXRUb1NKSVNGdW5jdGlvbiA9IGZ1bmN0aW9uIHNldFRvU0pJU0Z1bmN0aW9uIChmKSB7XG4gIGlmICh0eXBlb2YgZiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBFcnJvcignXCJ0b1NKSVNGdW5jXCIgaXMgbm90IGEgdmFsaWQgZnVuY3Rpb24uJylcbiAgfVxuXG4gIHRvU0pJU0Z1bmN0aW9uID0gZlxufVxuXG5leHBvcnRzLmlzS2FuamlNb2RlRW5hYmxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHR5cGVvZiB0b1NKSVNGdW5jdGlvbiAhPT0gJ3VuZGVmaW5lZCdcbn1cblxuZXhwb3J0cy50b1NKSVMgPSBmdW5jdGlvbiB0b1NKSVMgKGthbmppKSB7XG4gIHJldHVybiB0b1NKSVNGdW5jdGlvbihrYW5qaSlcbn1cbiIsImV4cG9ydHMuTCA9IHsgYml0OiAxIH1cbmV4cG9ydHMuTSA9IHsgYml0OiAwIH1cbmV4cG9ydHMuUSA9IHsgYml0OiAzIH1cbmV4cG9ydHMuSCA9IHsgYml0OiAyIH1cblxuZnVuY3Rpb24gZnJvbVN0cmluZyAoc3RyaW5nKSB7XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcignUGFyYW0gaXMgbm90IGEgc3RyaW5nJylcbiAgfVxuXG4gIGNvbnN0IGxjU3RyID0gc3RyaW5nLnRvTG93ZXJDYXNlKClcblxuICBzd2l0Y2ggKGxjU3RyKSB7XG4gICAgY2FzZSAnbCc6XG4gICAgY2FzZSAnbG93JzpcbiAgICAgIHJldHVybiBleHBvcnRzLkxcblxuICAgIGNhc2UgJ20nOlxuICAgIGNhc2UgJ21lZGl1bSc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5NXG5cbiAgICBjYXNlICdxJzpcbiAgICBjYXNlICdxdWFydGlsZSc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5RXG5cbiAgICBjYXNlICdoJzpcbiAgICBjYXNlICdoaWdoJzpcbiAgICAgIHJldHVybiBleHBvcnRzLkhcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gRUMgTGV2ZWw6ICcgKyBzdHJpbmcpXG4gIH1cbn1cblxuZXhwb3J0cy5pc1ZhbGlkID0gZnVuY3Rpb24gaXNWYWxpZCAobGV2ZWwpIHtcbiAgcmV0dXJuIGxldmVsICYmIHR5cGVvZiBsZXZlbC5iaXQgIT09ICd1bmRlZmluZWQnICYmXG4gICAgbGV2ZWwuYml0ID49IDAgJiYgbGV2ZWwuYml0IDwgNFxufVxuXG5leHBvcnRzLmZyb20gPSBmdW5jdGlvbiBmcm9tICh2YWx1ZSwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmIChleHBvcnRzLmlzVmFsaWQodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBmcm9tU3RyaW5nKHZhbHVlKVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICB9XG59XG4iLCJmdW5jdGlvbiBCaXRCdWZmZXIgKCkge1xuICB0aGlzLmJ1ZmZlciA9IFtdXG4gIHRoaXMubGVuZ3RoID0gMFxufVxuXG5CaXRCdWZmZXIucHJvdG90eXBlID0ge1xuXG4gIGdldDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgY29uc3QgYnVmSW5kZXggPSBNYXRoLmZsb29yKGluZGV4IC8gOClcbiAgICByZXR1cm4gKCh0aGlzLmJ1ZmZlcltidWZJbmRleF0gPj4+ICg3IC0gaW5kZXggJSA4KSkgJiAxKSA9PT0gMVxuICB9LFxuXG4gIHB1dDogZnVuY3Rpb24gKG51bSwgbGVuZ3RoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5wdXRCaXQoKChudW0gPj4+IChsZW5ndGggLSBpIC0gMSkpICYgMSkgPT09IDEpXG4gICAgfVxuICB9LFxuXG4gIGdldExlbmd0aEluQml0czogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmxlbmd0aFxuICB9LFxuXG4gIHB1dEJpdDogZnVuY3Rpb24gKGJpdCkge1xuICAgIGNvbnN0IGJ1ZkluZGV4ID0gTWF0aC5mbG9vcih0aGlzLmxlbmd0aCAvIDgpXG4gICAgaWYgKHRoaXMuYnVmZmVyLmxlbmd0aCA8PSBidWZJbmRleCkge1xuICAgICAgdGhpcy5idWZmZXIucHVzaCgwKVxuICAgIH1cblxuICAgIGlmIChiaXQpIHtcbiAgICAgIHRoaXMuYnVmZmVyW2J1ZkluZGV4XSB8PSAoMHg4MCA+Pj4gKHRoaXMubGVuZ3RoICUgOCkpXG4gICAgfVxuXG4gICAgdGhpcy5sZW5ndGgrK1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQml0QnVmZmVyXG4iLCIvKipcbiAqIEhlbHBlciBjbGFzcyB0byBoYW5kbGUgUVIgQ29kZSBzeW1ib2wgbW9kdWxlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzaXplIFN5bWJvbCBzaXplXG4gKi9cbmZ1bmN0aW9uIEJpdE1hdHJpeCAoc2l6ZSkge1xuICBpZiAoIXNpemUgfHwgc2l6ZSA8IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0JpdE1hdHJpeCBzaXplIG11c3QgYmUgZGVmaW5lZCBhbmQgZ3JlYXRlciB0aGFuIDAnKVxuICB9XG5cbiAgdGhpcy5zaXplID0gc2l6ZVxuICB0aGlzLmRhdGEgPSBuZXcgVWludDhBcnJheShzaXplICogc2l6ZSlcbiAgdGhpcy5yZXNlcnZlZEJpdCA9IG5ldyBVaW50OEFycmF5KHNpemUgKiBzaXplKVxufVxuXG4vKipcbiAqIFNldCBiaXQgdmFsdWUgYXQgc3BlY2lmaWVkIGxvY2F0aW9uXG4gKiBJZiByZXNlcnZlZCBmbGFnIGlzIHNldCwgdGhpcyBiaXQgd2lsbCBiZSBpZ25vcmVkIGR1cmluZyBtYXNraW5nIHByb2Nlc3NcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gIHJvd1xuICogQHBhcmFtIHtOdW1iZXJ9ICBjb2xcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdmFsdWVcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVzZXJ2ZWRcbiAqL1xuQml0TWF0cml4LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAocm93LCBjb2wsIHZhbHVlLCByZXNlcnZlZCkge1xuICBjb25zdCBpbmRleCA9IHJvdyAqIHRoaXMuc2l6ZSArIGNvbFxuICB0aGlzLmRhdGFbaW5kZXhdID0gdmFsdWVcbiAgaWYgKHJlc2VydmVkKSB0aGlzLnJlc2VydmVkQml0W2luZGV4XSA9IHRydWVcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGJpdCB2YWx1ZSBhdCBzcGVjaWZpZWQgbG9jYXRpb25cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICByb3dcbiAqIEBwYXJhbSAge051bWJlcn0gIGNvbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuQml0TWF0cml4LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgcmV0dXJuIHRoaXMuZGF0YVtyb3cgKiB0aGlzLnNpemUgKyBjb2xdXG59XG5cbi8qKlxuICogQXBwbGllcyB4b3Igb3BlcmF0b3IgYXQgc3BlY2lmaWVkIGxvY2F0aW9uXG4gKiAodXNlZCBkdXJpbmcgbWFza2luZyBwcm9jZXNzKVxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSAgcm93XG4gKiBAcGFyYW0ge051bWJlcn0gIGNvbFxuICogQHBhcmFtIHtCb29sZWFufSB2YWx1ZVxuICovXG5CaXRNYXRyaXgucHJvdG90eXBlLnhvciA9IGZ1bmN0aW9uIChyb3csIGNvbCwgdmFsdWUpIHtcbiAgdGhpcy5kYXRhW3JvdyAqIHRoaXMuc2l6ZSArIGNvbF0gXj0gdmFsdWVcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBiaXQgYXQgc3BlY2lmaWVkIGxvY2F0aW9uIGlzIHJlc2VydmVkXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9ICAgcm93XG4gKiBAcGFyYW0ge051bWJlcn0gICBjb2xcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbkJpdE1hdHJpeC5wcm90b3R5cGUuaXNSZXNlcnZlZCA9IGZ1bmN0aW9uIChyb3csIGNvbCkge1xuICByZXR1cm4gdGhpcy5yZXNlcnZlZEJpdFtyb3cgKiB0aGlzLnNpemUgKyBjb2xdXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQml0TWF0cml4XG4iLCIvKipcbiAqIEFsaWdubWVudCBwYXR0ZXJuIGFyZSBmaXhlZCByZWZlcmVuY2UgcGF0dGVybiBpbiBkZWZpbmVkIHBvc2l0aW9uc1xuICogaW4gYSBtYXRyaXggc3ltYm9sb2d5LCB3aGljaCBlbmFibGVzIHRoZSBkZWNvZGUgc29mdHdhcmUgdG8gcmUtc3luY2hyb25pc2VcbiAqIHRoZSBjb29yZGluYXRlIG1hcHBpbmcgb2YgdGhlIGltYWdlIG1vZHVsZXMgaW4gdGhlIGV2ZW50IG9mIG1vZGVyYXRlIGFtb3VudHNcbiAqIG9mIGRpc3RvcnRpb24gb2YgdGhlIGltYWdlLlxuICpcbiAqIEFsaWdubWVudCBwYXR0ZXJucyBhcmUgcHJlc2VudCBvbmx5IGluIFFSIENvZGUgc3ltYm9scyBvZiB2ZXJzaW9uIDIgb3IgbGFyZ2VyXG4gKiBhbmQgdGhlaXIgbnVtYmVyIGRlcGVuZHMgb24gdGhlIHN5bWJvbCB2ZXJzaW9uLlxuICovXG5cbmNvbnN0IGdldFN5bWJvbFNpemUgPSByZXF1aXJlKCcuL3V0aWxzJykuZ2V0U3ltYm9sU2l6ZVxuXG4vKipcbiAqIENhbGN1bGF0ZSB0aGUgcm93L2NvbHVtbiBjb29yZGluYXRlcyBvZiB0aGUgY2VudGVyIG1vZHVsZSBvZiBlYWNoIGFsaWdubWVudCBwYXR0ZXJuXG4gKiBmb3IgdGhlIHNwZWNpZmllZCBRUiBDb2RlIHZlcnNpb24uXG4gKlxuICogVGhlIGFsaWdubWVudCBwYXR0ZXJucyBhcmUgcG9zaXRpb25lZCBzeW1tZXRyaWNhbGx5IG9uIGVpdGhlciBzaWRlIG9mIHRoZSBkaWFnb25hbFxuICogcnVubmluZyBmcm9tIHRoZSB0b3AgbGVmdCBjb3JuZXIgb2YgdGhlIHN5bWJvbCB0byB0aGUgYm90dG9tIHJpZ2h0IGNvcm5lci5cbiAqXG4gKiBTaW5jZSBwb3NpdGlvbnMgYXJlIHNpbW1ldHJpY2FsIG9ubHkgaGFsZiBvZiB0aGUgY29vcmRpbmF0ZXMgYXJlIHJldHVybmVkLlxuICogRWFjaCBpdGVtIG9mIHRoZSBhcnJheSB3aWxsIHJlcHJlc2VudCBpbiB0dXJuIHRoZSB4IGFuZCB5IGNvb3JkaW5hdGUuXG4gKiBAc2VlIHtAbGluayBnZXRQb3NpdGlvbnN9XG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIGNvb3JkaW5hdGVcbiAqL1xuZXhwb3J0cy5nZXRSb3dDb2xDb29yZHMgPSBmdW5jdGlvbiBnZXRSb3dDb2xDb29yZHMgKHZlcnNpb24pIHtcbiAgaWYgKHZlcnNpb24gPT09IDEpIHJldHVybiBbXVxuXG4gIGNvbnN0IHBvc0NvdW50ID0gTWF0aC5mbG9vcih2ZXJzaW9uIC8gNykgKyAyXG4gIGNvbnN0IHNpemUgPSBnZXRTeW1ib2xTaXplKHZlcnNpb24pXG4gIGNvbnN0IGludGVydmFscyA9IHNpemUgPT09IDE0NSA/IDI2IDogTWF0aC5jZWlsKChzaXplIC0gMTMpIC8gKDIgKiBwb3NDb3VudCAtIDIpKSAqIDJcbiAgY29uc3QgcG9zaXRpb25zID0gW3NpemUgLSA3XSAvLyBMYXN0IGNvb3JkIGlzIGFsd2F5cyAoc2l6ZSAtIDcpXG5cbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBwb3NDb3VudCAtIDE7IGkrKykge1xuICAgIHBvc2l0aW9uc1tpXSA9IHBvc2l0aW9uc1tpIC0gMV0gLSBpbnRlcnZhbHNcbiAgfVxuXG4gIHBvc2l0aW9ucy5wdXNoKDYpIC8vIEZpcnN0IGNvb3JkIGlzIGFsd2F5cyA2XG5cbiAgcmV0dXJuIHBvc2l0aW9ucy5yZXZlcnNlKClcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIHBvc2l0aW9ucyBvZiBlYWNoIGFsaWdubWVudCBwYXR0ZXJuLlxuICogRWFjaCBhcnJheSdzIGVsZW1lbnQgcmVwcmVzZW50IHRoZSBjZW50ZXIgcG9pbnQgb2YgdGhlIHBhdHRlcm4gYXMgKHgsIHkpIGNvb3JkaW5hdGVzXG4gKlxuICogQ29vcmRpbmF0ZXMgYXJlIGNhbGN1bGF0ZWQgZXhwYW5kaW5nIHRoZSByb3cvY29sdW1uIGNvb3JkaW5hdGVzIHJldHVybmVkIGJ5IHtAbGluayBnZXRSb3dDb2xDb29yZHN9XG4gKiBhbmQgZmlsdGVyaW5nIG91dCB0aGUgaXRlbXMgdGhhdCBvdmVybGFwcyB3aXRoIGZpbmRlciBwYXR0ZXJuXG4gKlxuICogQGV4YW1wbGVcbiAqIEZvciBhIFZlcnNpb24gNyBzeW1ib2wge0BsaW5rIGdldFJvd0NvbENvb3Jkc30gcmV0dXJucyB2YWx1ZXMgNiwgMjIgYW5kIDM4LlxuICogVGhlIGFsaWdubWVudCBwYXR0ZXJucywgdGhlcmVmb3JlLCBhcmUgdG8gYmUgY2VudGVyZWQgb24gKHJvdywgY29sdW1uKVxuICogcG9zaXRpb25zICg2LDIyKSwgKDIyLDYpLCAoMjIsMjIpLCAoMjIsMzgpLCAoMzgsMjIpLCAoMzgsMzgpLlxuICogTm90ZSB0aGF0IHRoZSBjb29yZGluYXRlcyAoNiw2KSwgKDYsMzgpLCAoMzgsNikgYXJlIG9jY3VwaWVkIGJ5IGZpbmRlciBwYXR0ZXJuc1xuICogYW5kIGFyZSBub3QgdGhlcmVmb3JlIHVzZWQgZm9yIGFsaWdubWVudCBwYXR0ZXJucy5cbiAqXG4gKiBsZXQgcG9zID0gZ2V0UG9zaXRpb25zKDcpXG4gKiAvLyBbWzYsMjJdLCBbMjIsNl0sIFsyMiwyMl0sIFsyMiwzOF0sIFszOCwyMl0sIFszOCwzOF1dXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIGNvb3JkaW5hdGVzXG4gKi9cbmV4cG9ydHMuZ2V0UG9zaXRpb25zID0gZnVuY3Rpb24gZ2V0UG9zaXRpb25zICh2ZXJzaW9uKSB7XG4gIGNvbnN0IGNvb3JkcyA9IFtdXG4gIGNvbnN0IHBvcyA9IGV4cG9ydHMuZ2V0Um93Q29sQ29vcmRzKHZlcnNpb24pXG4gIGNvbnN0IHBvc0xlbmd0aCA9IHBvcy5sZW5ndGhcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc0xlbmd0aDsgaSsrKSB7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NMZW5ndGg7IGorKykge1xuICAgICAgLy8gU2tpcCBpZiBwb3NpdGlvbiBpcyBvY2N1cGllZCBieSBmaW5kZXIgcGF0dGVybnNcbiAgICAgIGlmICgoaSA9PT0gMCAmJiBqID09PSAwKSB8fCAvLyB0b3AtbGVmdFxuICAgICAgICAgIChpID09PSAwICYmIGogPT09IHBvc0xlbmd0aCAtIDEpIHx8IC8vIGJvdHRvbS1sZWZ0XG4gICAgICAgICAgKGkgPT09IHBvc0xlbmd0aCAtIDEgJiYgaiA9PT0gMCkpIHsgLy8gdG9wLXJpZ2h0XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGNvb3Jkcy5wdXNoKFtwb3NbaV0sIHBvc1tqXV0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvb3Jkc1xufVxuIiwiY29uc3QgZ2V0U3ltYm9sU2l6ZSA9IHJlcXVpcmUoJy4vdXRpbHMnKS5nZXRTeW1ib2xTaXplXG5jb25zdCBGSU5ERVJfUEFUVEVSTl9TSVpFID0gN1xuXG4vKipcbiAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgcG9zaXRpb25zIG9mIGVhY2ggZmluZGVyIHBhdHRlcm4uXG4gKiBFYWNoIGFycmF5J3MgZWxlbWVudCByZXByZXNlbnQgdGhlIHRvcC1sZWZ0IHBvaW50IG9mIHRoZSBwYXR0ZXJuIGFzICh4LCB5KSBjb29yZGluYXRlc1xuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICBBcnJheSBvZiBjb29yZGluYXRlc1xuICovXG5leHBvcnRzLmdldFBvc2l0aW9ucyA9IGZ1bmN0aW9uIGdldFBvc2l0aW9ucyAodmVyc2lvbikge1xuICBjb25zdCBzaXplID0gZ2V0U3ltYm9sU2l6ZSh2ZXJzaW9uKVxuXG4gIHJldHVybiBbXG4gICAgLy8gdG9wLWxlZnRcbiAgICBbMCwgMF0sXG4gICAgLy8gdG9wLXJpZ2h0XG4gICAgW3NpemUgLSBGSU5ERVJfUEFUVEVSTl9TSVpFLCAwXSxcbiAgICAvLyBib3R0b20tbGVmdFxuICAgIFswLCBzaXplIC0gRklOREVSX1BBVFRFUk5fU0laRV1cbiAgXVxufVxuIiwiLyoqXG4gKiBEYXRhIG1hc2sgcGF0dGVybiByZWZlcmVuY2VcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydHMuUGF0dGVybnMgPSB7XG4gIFBBVFRFUk4wMDA6IDAsXG4gIFBBVFRFUk4wMDE6IDEsXG4gIFBBVFRFUk4wMTA6IDIsXG4gIFBBVFRFUk4wMTE6IDMsXG4gIFBBVFRFUk4xMDA6IDQsXG4gIFBBVFRFUk4xMDE6IDUsXG4gIFBBVFRFUk4xMTA6IDYsXG4gIFBBVFRFUk4xMTE6IDdcbn1cblxuLyoqXG4gKiBXZWlnaHRlZCBwZW5hbHR5IHNjb3JlcyBmb3IgdGhlIHVuZGVzaXJhYmxlIGZlYXR1cmVzXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5jb25zdCBQZW5hbHR5U2NvcmVzID0ge1xuICBOMTogMyxcbiAgTjI6IDMsXG4gIE4zOiA0MCxcbiAgTjQ6IDEwXG59XG5cbi8qKlxuICogQ2hlY2sgaWYgbWFzayBwYXR0ZXJuIHZhbHVlIGlzIHZhbGlkXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSAgbWFzayAgICBNYXNrIHBhdHRlcm5cbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgdHJ1ZSBpZiB2YWxpZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydHMuaXNWYWxpZCA9IGZ1bmN0aW9uIGlzVmFsaWQgKG1hc2spIHtcbiAgcmV0dXJuIG1hc2sgIT0gbnVsbCAmJiBtYXNrICE9PSAnJyAmJiAhaXNOYU4obWFzaykgJiYgbWFzayA+PSAwICYmIG1hc2sgPD0gN1xufVxuXG4vKipcbiAqIFJldHVybnMgbWFzayBwYXR0ZXJuIGZyb20gYSB2YWx1ZS5cbiAqIElmIHZhbHVlIGlzIG5vdCB2YWxpZCwgcmV0dXJucyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ8U3RyaW5nfSB2YWx1ZSAgICAgICAgTWFzayBwYXR0ZXJuIHZhbHVlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgVmFsaWQgbWFzayBwYXR0ZXJuIG9yIHVuZGVmaW5lZFxuICovXG5leHBvcnRzLmZyb20gPSBmdW5jdGlvbiBmcm9tICh2YWx1ZSkge1xuICByZXR1cm4gZXhwb3J0cy5pc1ZhbGlkKHZhbHVlKSA/IHBhcnNlSW50KHZhbHVlLCAxMCkgOiB1bmRlZmluZWRcbn1cblxuLyoqXG4qIEZpbmQgYWRqYWNlbnQgbW9kdWxlcyBpbiByb3cvY29sdW1uIHdpdGggdGhlIHNhbWUgY29sb3JcbiogYW5kIGFzc2lnbiBhIHBlbmFsdHkgdmFsdWUuXG4qXG4qIFBvaW50czogTjEgKyBpXG4qIGkgaXMgdGhlIGFtb3VudCBieSB3aGljaCB0aGUgbnVtYmVyIG9mIGFkamFjZW50IG1vZHVsZXMgb2YgdGhlIHNhbWUgY29sb3IgZXhjZWVkcyA1XG4qL1xuZXhwb3J0cy5nZXRQZW5hbHR5TjEgPSBmdW5jdGlvbiBnZXRQZW5hbHR5TjEgKGRhdGEpIHtcbiAgY29uc3Qgc2l6ZSA9IGRhdGEuc2l6ZVxuICBsZXQgcG9pbnRzID0gMFxuICBsZXQgc2FtZUNvdW50Q29sID0gMFxuICBsZXQgc2FtZUNvdW50Um93ID0gMFxuICBsZXQgbGFzdENvbCA9IG51bGxcbiAgbGV0IGxhc3RSb3cgPSBudWxsXG5cbiAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgc2l6ZTsgcm93KyspIHtcbiAgICBzYW1lQ291bnRDb2wgPSBzYW1lQ291bnRSb3cgPSAwXG4gICAgbGFzdENvbCA9IGxhc3RSb3cgPSBudWxsXG5cbiAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBzaXplOyBjb2wrKykge1xuICAgICAgbGV0IG1vZHVsZSA9IGRhdGEuZ2V0KHJvdywgY29sKVxuICAgICAgaWYgKG1vZHVsZSA9PT0gbGFzdENvbCkge1xuICAgICAgICBzYW1lQ291bnRDb2wrK1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNhbWVDb3VudENvbCA+PSA1KSBwb2ludHMgKz0gUGVuYWx0eVNjb3Jlcy5OMSArIChzYW1lQ291bnRDb2wgLSA1KVxuICAgICAgICBsYXN0Q29sID0gbW9kdWxlXG4gICAgICAgIHNhbWVDb3VudENvbCA9IDFcbiAgICAgIH1cblxuICAgICAgbW9kdWxlID0gZGF0YS5nZXQoY29sLCByb3cpXG4gICAgICBpZiAobW9kdWxlID09PSBsYXN0Um93KSB7XG4gICAgICAgIHNhbWVDb3VudFJvdysrXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2FtZUNvdW50Um93ID49IDUpIHBvaW50cyArPSBQZW5hbHR5U2NvcmVzLk4xICsgKHNhbWVDb3VudFJvdyAtIDUpXG4gICAgICAgIGxhc3RSb3cgPSBtb2R1bGVcbiAgICAgICAgc2FtZUNvdW50Um93ID0gMVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzYW1lQ291bnRDb2wgPj0gNSkgcG9pbnRzICs9IFBlbmFsdHlTY29yZXMuTjEgKyAoc2FtZUNvdW50Q29sIC0gNSlcbiAgICBpZiAoc2FtZUNvdW50Um93ID49IDUpIHBvaW50cyArPSBQZW5hbHR5U2NvcmVzLk4xICsgKHNhbWVDb3VudFJvdyAtIDUpXG4gIH1cblxuICByZXR1cm4gcG9pbnRzXG59XG5cbi8qKlxuICogRmluZCAyeDIgYmxvY2tzIHdpdGggdGhlIHNhbWUgY29sb3IgYW5kIGFzc2lnbiBhIHBlbmFsdHkgdmFsdWVcbiAqXG4gKiBQb2ludHM6IE4yICogKG0gLSAxKSAqIChuIC0gMSlcbiAqL1xuZXhwb3J0cy5nZXRQZW5hbHR5TjIgPSBmdW5jdGlvbiBnZXRQZW5hbHR5TjIgKGRhdGEpIHtcbiAgY29uc3Qgc2l6ZSA9IGRhdGEuc2l6ZVxuICBsZXQgcG9pbnRzID0gMFxuXG4gIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHNpemUgLSAxOyByb3crKykge1xuICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IHNpemUgLSAxOyBjb2wrKykge1xuICAgICAgY29uc3QgbGFzdCA9IGRhdGEuZ2V0KHJvdywgY29sKSArXG4gICAgICAgIGRhdGEuZ2V0KHJvdywgY29sICsgMSkgK1xuICAgICAgICBkYXRhLmdldChyb3cgKyAxLCBjb2wpICtcbiAgICAgICAgZGF0YS5nZXQocm93ICsgMSwgY29sICsgMSlcblxuICAgICAgaWYgKGxhc3QgPT09IDQgfHwgbGFzdCA9PT0gMCkgcG9pbnRzKytcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcG9pbnRzICogUGVuYWx0eVNjb3Jlcy5OMlxufVxuXG4vKipcbiAqIEZpbmQgMToxOjM6MToxIHJhdGlvIChkYXJrOmxpZ2h0OmRhcms6bGlnaHQ6ZGFyaykgcGF0dGVybiBpbiByb3cvY29sdW1uLFxuICogcHJlY2VkZWQgb3IgZm9sbG93ZWQgYnkgbGlnaHQgYXJlYSA0IG1vZHVsZXMgd2lkZVxuICpcbiAqIFBvaW50czogTjMgKiBudW1iZXIgb2YgcGF0dGVybiBmb3VuZFxuICovXG5leHBvcnRzLmdldFBlbmFsdHlOMyA9IGZ1bmN0aW9uIGdldFBlbmFsdHlOMyAoZGF0YSkge1xuICBjb25zdCBzaXplID0gZGF0YS5zaXplXG4gIGxldCBwb2ludHMgPSAwXG4gIGxldCBiaXRzQ29sID0gMFxuICBsZXQgYml0c1JvdyA9IDBcblxuICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBzaXplOyByb3crKykge1xuICAgIGJpdHNDb2wgPSBiaXRzUm93ID0gMFxuICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IHNpemU7IGNvbCsrKSB7XG4gICAgICBiaXRzQ29sID0gKChiaXRzQ29sIDw8IDEpICYgMHg3RkYpIHwgZGF0YS5nZXQocm93LCBjb2wpXG4gICAgICBpZiAoY29sID49IDEwICYmIChiaXRzQ29sID09PSAweDVEMCB8fCBiaXRzQ29sID09PSAweDA1RCkpIHBvaW50cysrXG5cbiAgICAgIGJpdHNSb3cgPSAoKGJpdHNSb3cgPDwgMSkgJiAweDdGRikgfCBkYXRhLmdldChjb2wsIHJvdylcbiAgICAgIGlmIChjb2wgPj0gMTAgJiYgKGJpdHNSb3cgPT09IDB4NUQwIHx8IGJpdHNSb3cgPT09IDB4MDVEKSkgcG9pbnRzKytcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcG9pbnRzICogUGVuYWx0eVNjb3Jlcy5OM1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZSBwcm9wb3J0aW9uIG9mIGRhcmsgbW9kdWxlcyBpbiBlbnRpcmUgc3ltYm9sXG4gKlxuICogUG9pbnRzOiBONCAqIGtcbiAqXG4gKiBrIGlzIHRoZSByYXRpbmcgb2YgdGhlIGRldmlhdGlvbiBvZiB0aGUgcHJvcG9ydGlvbiBvZiBkYXJrIG1vZHVsZXNcbiAqIGluIHRoZSBzeW1ib2wgZnJvbSA1MCUgaW4gc3RlcHMgb2YgNSVcbiAqL1xuZXhwb3J0cy5nZXRQZW5hbHR5TjQgPSBmdW5jdGlvbiBnZXRQZW5hbHR5TjQgKGRhdGEpIHtcbiAgbGV0IGRhcmtDb3VudCA9IDBcbiAgY29uc3QgbW9kdWxlc0NvdW50ID0gZGF0YS5kYXRhLmxlbmd0aFxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbW9kdWxlc0NvdW50OyBpKyspIGRhcmtDb3VudCArPSBkYXRhLmRhdGFbaV1cblxuICBjb25zdCBrID0gTWF0aC5hYnMoTWF0aC5jZWlsKChkYXJrQ291bnQgKiAxMDAgLyBtb2R1bGVzQ291bnQpIC8gNSkgLSAxMClcblxuICByZXR1cm4gayAqIFBlbmFsdHlTY29yZXMuTjRcbn1cblxuLyoqXG4gKiBSZXR1cm4gbWFzayB2YWx1ZSBhdCBnaXZlbiBwb3NpdGlvblxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gbWFza1BhdHRlcm4gUGF0dGVybiByZWZlcmVuY2UgdmFsdWVcbiAqIEBwYXJhbSAge051bWJlcn0gaSAgICAgICAgICAgUm93XG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGogICAgICAgICAgIENvbHVtblxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICAgICBNYXNrIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGdldE1hc2tBdCAobWFza1BhdHRlcm4sIGksIGopIHtcbiAgc3dpdGNoIChtYXNrUGF0dGVybikge1xuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDAwOiByZXR1cm4gKGkgKyBqKSAlIDIgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjAwMTogcmV0dXJuIGkgJSAyID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4wMTA6IHJldHVybiBqICUgMyA9PT0gMFxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDExOiByZXR1cm4gKGkgKyBqKSAlIDMgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjEwMDogcmV0dXJuIChNYXRoLmZsb29yKGkgLyAyKSArIE1hdGguZmxvb3IoaiAvIDMpKSAlIDIgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjEwMTogcmV0dXJuIChpICogaikgJSAyICsgKGkgKiBqKSAlIDMgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjExMDogcmV0dXJuICgoaSAqIGopICUgMiArIChpICogaikgJSAzKSAlIDIgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjExMTogcmV0dXJuICgoaSAqIGopICUgMyArIChpICsgaikgJSAyKSAlIDIgPT09IDBcblxuICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcignYmFkIG1hc2tQYXR0ZXJuOicgKyBtYXNrUGF0dGVybilcbiAgfVxufVxuXG4vKipcbiAqIEFwcGx5IGEgbWFzayBwYXR0ZXJuIHRvIGEgQml0TWF0cml4XG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSAgICBwYXR0ZXJuIFBhdHRlcm4gcmVmZXJlbmNlIG51bWJlclxuICogQHBhcmFtICB7Qml0TWF0cml4fSBkYXRhICAgIEJpdE1hdHJpeCBkYXRhXG4gKi9cbmV4cG9ydHMuYXBwbHlNYXNrID0gZnVuY3Rpb24gYXBwbHlNYXNrIChwYXR0ZXJuLCBkYXRhKSB7XG4gIGNvbnN0IHNpemUgPSBkYXRhLnNpemVcblxuICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBzaXplOyBjb2wrKykge1xuICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHNpemU7IHJvdysrKSB7XG4gICAgICBpZiAoZGF0YS5pc1Jlc2VydmVkKHJvdywgY29sKSkgY29udGludWVcbiAgICAgIGRhdGEueG9yKHJvdywgY29sLCBnZXRNYXNrQXQocGF0dGVybiwgcm93LCBjb2wpKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGJlc3QgbWFzayBwYXR0ZXJuIGZvciBkYXRhXG4gKlxuICogQHBhcmFtICB7Qml0TWF0cml4fSBkYXRhXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IE1hc2sgcGF0dGVybiByZWZlcmVuY2UgbnVtYmVyXG4gKi9cbmV4cG9ydHMuZ2V0QmVzdE1hc2sgPSBmdW5jdGlvbiBnZXRCZXN0TWFzayAoZGF0YSwgc2V0dXBGb3JtYXRGdW5jKSB7XG4gIGNvbnN0IG51bVBhdHRlcm5zID0gT2JqZWN0LmtleXMoZXhwb3J0cy5QYXR0ZXJucykubGVuZ3RoXG4gIGxldCBiZXN0UGF0dGVybiA9IDBcbiAgbGV0IGxvd2VyUGVuYWx0eSA9IEluZmluaXR5XG5cbiAgZm9yIChsZXQgcCA9IDA7IHAgPCBudW1QYXR0ZXJuczsgcCsrKSB7XG4gICAgc2V0dXBGb3JtYXRGdW5jKHApXG4gICAgZXhwb3J0cy5hcHBseU1hc2socCwgZGF0YSlcblxuICAgIC8vIENhbGN1bGF0ZSBwZW5hbHR5XG4gICAgY29uc3QgcGVuYWx0eSA9XG4gICAgICBleHBvcnRzLmdldFBlbmFsdHlOMShkYXRhKSArXG4gICAgICBleHBvcnRzLmdldFBlbmFsdHlOMihkYXRhKSArXG4gICAgICBleHBvcnRzLmdldFBlbmFsdHlOMyhkYXRhKSArXG4gICAgICBleHBvcnRzLmdldFBlbmFsdHlONChkYXRhKVxuXG4gICAgLy8gVW5kbyBwcmV2aW91c2x5IGFwcGxpZWQgbWFza1xuICAgIGV4cG9ydHMuYXBwbHlNYXNrKHAsIGRhdGEpXG5cbiAgICBpZiAocGVuYWx0eSA8IGxvd2VyUGVuYWx0eSkge1xuICAgICAgbG93ZXJQZW5hbHR5ID0gcGVuYWx0eVxuICAgICAgYmVzdFBhdHRlcm4gPSBwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJlc3RQYXR0ZXJuXG59XG4iLCJjb25zdCBFQ0xldmVsID0gcmVxdWlyZSgnLi9lcnJvci1jb3JyZWN0aW9uLWxldmVsJylcclxuXHJcbmNvbnN0IEVDX0JMT0NLU19UQUJMRSA9IFtcclxuLy8gTCAgTSAgUSAgSFxyXG4gIDEsIDEsIDEsIDEsXHJcbiAgMSwgMSwgMSwgMSxcclxuICAxLCAxLCAyLCAyLFxyXG4gIDEsIDIsIDIsIDQsXHJcbiAgMSwgMiwgNCwgNCxcclxuICAyLCA0LCA0LCA0LFxyXG4gIDIsIDQsIDYsIDUsXHJcbiAgMiwgNCwgNiwgNixcclxuICAyLCA1LCA4LCA4LFxyXG4gIDQsIDUsIDgsIDgsXHJcbiAgNCwgNSwgOCwgMTEsXHJcbiAgNCwgOCwgMTAsIDExLFxyXG4gIDQsIDksIDEyLCAxNixcclxuICA0LCA5LCAxNiwgMTYsXHJcbiAgNiwgMTAsIDEyLCAxOCxcclxuICA2LCAxMCwgMTcsIDE2LFxyXG4gIDYsIDExLCAxNiwgMTksXHJcbiAgNiwgMTMsIDE4LCAyMSxcclxuICA3LCAxNCwgMjEsIDI1LFxyXG4gIDgsIDE2LCAyMCwgMjUsXHJcbiAgOCwgMTcsIDIzLCAyNSxcclxuICA5LCAxNywgMjMsIDM0LFxyXG4gIDksIDE4LCAyNSwgMzAsXHJcbiAgMTAsIDIwLCAyNywgMzIsXHJcbiAgMTIsIDIxLCAyOSwgMzUsXHJcbiAgMTIsIDIzLCAzNCwgMzcsXHJcbiAgMTIsIDI1LCAzNCwgNDAsXHJcbiAgMTMsIDI2LCAzNSwgNDIsXHJcbiAgMTQsIDI4LCAzOCwgNDUsXHJcbiAgMTUsIDI5LCA0MCwgNDgsXHJcbiAgMTYsIDMxLCA0MywgNTEsXHJcbiAgMTcsIDMzLCA0NSwgNTQsXHJcbiAgMTgsIDM1LCA0OCwgNTcsXHJcbiAgMTksIDM3LCA1MSwgNjAsXHJcbiAgMTksIDM4LCA1MywgNjMsXHJcbiAgMjAsIDQwLCA1NiwgNjYsXHJcbiAgMjEsIDQzLCA1OSwgNzAsXHJcbiAgMjIsIDQ1LCA2MiwgNzQsXHJcbiAgMjQsIDQ3LCA2NSwgNzcsXHJcbiAgMjUsIDQ5LCA2OCwgODFcclxuXVxyXG5cclxuY29uc3QgRUNfQ09ERVdPUkRTX1RBQkxFID0gW1xyXG4vLyBMICBNICBRICBIXHJcbiAgNywgMTAsIDEzLCAxNyxcclxuICAxMCwgMTYsIDIyLCAyOCxcclxuICAxNSwgMjYsIDM2LCA0NCxcclxuICAyMCwgMzYsIDUyLCA2NCxcclxuICAyNiwgNDgsIDcyLCA4OCxcclxuICAzNiwgNjQsIDk2LCAxMTIsXHJcbiAgNDAsIDcyLCAxMDgsIDEzMCxcclxuICA0OCwgODgsIDEzMiwgMTU2LFxyXG4gIDYwLCAxMTAsIDE2MCwgMTkyLFxyXG4gIDcyLCAxMzAsIDE5MiwgMjI0LFxyXG4gIDgwLCAxNTAsIDIyNCwgMjY0LFxyXG4gIDk2LCAxNzYsIDI2MCwgMzA4LFxyXG4gIDEwNCwgMTk4LCAyODgsIDM1MixcclxuICAxMjAsIDIxNiwgMzIwLCAzODQsXHJcbiAgMTMyLCAyNDAsIDM2MCwgNDMyLFxyXG4gIDE0NCwgMjgwLCA0MDgsIDQ4MCxcclxuICAxNjgsIDMwOCwgNDQ4LCA1MzIsXHJcbiAgMTgwLCAzMzgsIDUwNCwgNTg4LFxyXG4gIDE5NiwgMzY0LCA1NDYsIDY1MCxcclxuICAyMjQsIDQxNiwgNjAwLCA3MDAsXHJcbiAgMjI0LCA0NDIsIDY0NCwgNzUwLFxyXG4gIDI1MiwgNDc2LCA2OTAsIDgxNixcclxuICAyNzAsIDUwNCwgNzUwLCA5MDAsXHJcbiAgMzAwLCA1NjAsIDgxMCwgOTYwLFxyXG4gIDMxMiwgNTg4LCA4NzAsIDEwNTAsXHJcbiAgMzM2LCA2NDQsIDk1MiwgMTExMCxcclxuICAzNjAsIDcwMCwgMTAyMCwgMTIwMCxcclxuICAzOTAsIDcyOCwgMTA1MCwgMTI2MCxcclxuICA0MjAsIDc4NCwgMTE0MCwgMTM1MCxcclxuICA0NTAsIDgxMiwgMTIwMCwgMTQ0MCxcclxuICA0ODAsIDg2OCwgMTI5MCwgMTUzMCxcclxuICA1MTAsIDkyNCwgMTM1MCwgMTYyMCxcclxuICA1NDAsIDk4MCwgMTQ0MCwgMTcxMCxcclxuICA1NzAsIDEwMzYsIDE1MzAsIDE4MDAsXHJcbiAgNTcwLCAxMDY0LCAxNTkwLCAxODkwLFxyXG4gIDYwMCwgMTEyMCwgMTY4MCwgMTk4MCxcclxuICA2MzAsIDEyMDQsIDE3NzAsIDIxMDAsXHJcbiAgNjYwLCAxMjYwLCAxODYwLCAyMjIwLFxyXG4gIDcyMCwgMTMxNiwgMTk1MCwgMjMxMCxcclxuICA3NTAsIDEzNzIsIDIwNDAsIDI0MzBcclxuXVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGJsb2NrIHRoYXQgdGhlIFFSIENvZGUgc2hvdWxkIGNvbnRhaW5cclxuICogZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBhbmQgZXJyb3IgY29ycmVjdGlvbiBsZXZlbC5cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cclxuICogQHBhcmFtICB7TnVtYmVyfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICAgTnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gYmxvY2tzXHJcbiAqL1xyXG5leHBvcnRzLmdldEJsb2Nrc0NvdW50ID0gZnVuY3Rpb24gZ2V0QmxvY2tzQ291bnQgKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgc3dpdGNoIChlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gICAgY2FzZSBFQ0xldmVsLkw6XHJcbiAgICAgIHJldHVybiBFQ19CTE9DS1NfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAwXVxyXG4gICAgY2FzZSBFQ0xldmVsLk06XHJcbiAgICAgIHJldHVybiBFQ19CTE9DS1NfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAxXVxyXG4gICAgY2FzZSBFQ0xldmVsLlE6XHJcbiAgICAgIHJldHVybiBFQ19CTE9DS1NfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAyXVxyXG4gICAgY2FzZSBFQ0xldmVsLkg6XHJcbiAgICAgIHJldHVybiBFQ19CTE9DS1NfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAzXVxyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3JkcyB0byB1c2UgZm9yIHRoZSBzcGVjaWZpZWRcclxuICogdmVyc2lvbiBhbmQgZXJyb3IgY29ycmVjdGlvbiBsZXZlbC5cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cclxuICogQHBhcmFtICB7TnVtYmVyfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICAgTnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzXHJcbiAqL1xyXG5leHBvcnRzLmdldFRvdGFsQ29kZXdvcmRzQ291bnQgPSBmdW5jdGlvbiBnZXRUb3RhbENvZGV3b3Jkc0NvdW50ICh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gIHN3aXRjaCAoZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcclxuICAgIGNhc2UgRUNMZXZlbC5MOlxyXG4gICAgICByZXR1cm4gRUNfQ09ERVdPUkRTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMF1cclxuICAgIGNhc2UgRUNMZXZlbC5NOlxyXG4gICAgICByZXR1cm4gRUNfQ09ERVdPUkRTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMV1cclxuICAgIGNhc2UgRUNMZXZlbC5ROlxyXG4gICAgICByZXR1cm4gRUNfQ09ERVdPUkRTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMl1cclxuICAgIGNhc2UgRUNMZXZlbC5IOlxyXG4gICAgICByZXR1cm4gRUNfQ09ERVdPUkRTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgM11cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuICB9XHJcbn1cclxuIiwiY29uc3QgRVhQX1RBQkxFID0gbmV3IFVpbnQ4QXJyYXkoNTEyKVxuY29uc3QgTE9HX1RBQkxFID0gbmV3IFVpbnQ4QXJyYXkoMjU2KVxuLyoqXG4gKiBQcmVjb21wdXRlIHRoZSBsb2cgYW5kIGFudGktbG9nIHRhYmxlcyBmb3IgZmFzdGVyIGNvbXB1dGF0aW9uIGxhdGVyXG4gKlxuICogRm9yIGVhY2ggcG9zc2libGUgdmFsdWUgaW4gdGhlIGdhbG9pcyBmaWVsZCAyXjgsIHdlIHdpbGwgcHJlLWNvbXB1dGVcbiAqIHRoZSBsb2dhcml0aG0gYW5kIGFudGktbG9nYXJpdGhtIChleHBvbmVudGlhbCkgb2YgdGhpcyB2YWx1ZVxuICpcbiAqIHJlZiB7QGxpbmsgaHR0cHM6Ly9lbi53aWtpdmVyc2l0eS5vcmcvd2lraS9SZWVkJUUyJTgwJTkzU29sb21vbl9jb2Rlc19mb3JfY29kZXJzI0ludHJvZHVjdGlvbl90b19tYXRoZW1hdGljYWxfZmllbGRzfVxuICovXG47KGZ1bmN0aW9uIGluaXRUYWJsZXMgKCkge1xuICBsZXQgeCA9IDFcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAyNTU7IGkrKykge1xuICAgIEVYUF9UQUJMRVtpXSA9IHhcbiAgICBMT0dfVEFCTEVbeF0gPSBpXG5cbiAgICB4IDw8PSAxIC8vIG11bHRpcGx5IGJ5IDJcblxuICAgIC8vIFRoZSBRUiBjb2RlIHNwZWNpZmljYXRpb24gc2F5cyB0byB1c2UgYnl0ZS13aXNlIG1vZHVsbyAxMDAwMTExMDEgYXJpdGhtZXRpYy5cbiAgICAvLyBUaGlzIG1lYW5zIHRoYXQgd2hlbiBhIG51bWJlciBpcyAyNTYgb3IgbGFyZ2VyLCBpdCBzaG91bGQgYmUgWE9SZWQgd2l0aCAweDExRC5cbiAgICBpZiAoeCAmIDB4MTAwKSB7IC8vIHNpbWlsYXIgdG8geCA+PSAyNTYsIGJ1dCBhIGxvdCBmYXN0ZXIgKGJlY2F1c2UgMHgxMDAgPT0gMjU2KVxuICAgICAgeCBePSAweDExRFxuICAgIH1cbiAgfVxuXG4gIC8vIE9wdGltaXphdGlvbjogZG91YmxlIHRoZSBzaXplIG9mIHRoZSBhbnRpLWxvZyB0YWJsZSBzbyB0aGF0IHdlIGRvbid0IG5lZWQgdG8gbW9kIDI1NSB0b1xuICAvLyBzdGF5IGluc2lkZSB0aGUgYm91bmRzIChiZWNhdXNlIHdlIHdpbGwgbWFpbmx5IHVzZSB0aGlzIHRhYmxlIGZvciB0aGUgbXVsdGlwbGljYXRpb24gb2ZcbiAgLy8gdHdvIEdGIG51bWJlcnMsIG5vIG1vcmUpLlxuICAvLyBAc2VlIHtAbGluayBtdWx9XG4gIGZvciAobGV0IGkgPSAyNTU7IGkgPCA1MTI7IGkrKykge1xuICAgIEVYUF9UQUJMRVtpXSA9IEVYUF9UQUJMRVtpIC0gMjU1XVxuICB9XG59KCkpXG5cbi8qKlxuICogUmV0dXJucyBsb2cgdmFsdWUgb2YgbiBpbnNpZGUgR2Fsb2lzIEZpZWxkXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmV4cG9ydHMubG9nID0gZnVuY3Rpb24gbG9nIChuKSB7XG4gIGlmIChuIDwgMSkgdGhyb3cgbmV3IEVycm9yKCdsb2coJyArIG4gKyAnKScpXG4gIHJldHVybiBMT0dfVEFCTEVbbl1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFudGktbG9nIHZhbHVlIG9mIG4gaW5zaWRlIEdhbG9pcyBGaWVsZFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gblxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5leHBvcnRzLmV4cCA9IGZ1bmN0aW9uIGV4cCAobikge1xuICByZXR1cm4gRVhQX1RBQkxFW25dXG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbnVtYmVyIGluc2lkZSBHYWxvaXMgRmllbGRcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHhcbiAqIEBwYXJhbSAge051bWJlcn0geVxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5leHBvcnRzLm11bCA9IGZ1bmN0aW9uIG11bCAoeCwgeSkge1xuICBpZiAoeCA9PT0gMCB8fCB5ID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIHNob3VsZCBiZSBFWFBfVEFCTEVbKExPR19UQUJMRVt4XSArIExPR19UQUJMRVt5XSkgJSAyNTVdIGlmIEVYUF9UQUJMRSB3YXNuJ3Qgb3ZlcnNpemVkXG4gIC8vIEBzZWUge0BsaW5rIGluaXRUYWJsZXN9XG4gIHJldHVybiBFWFBfVEFCTEVbTE9HX1RBQkxFW3hdICsgTE9HX1RBQkxFW3ldXVxufVxuIiwiY29uc3QgR0YgPSByZXF1aXJlKCcuL2dhbG9pcy1maWVsZCcpXG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gcG9seW5vbWlhbHMgaW5zaWRlIEdhbG9pcyBGaWVsZFxuICpcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IHAxIFBvbHlub21pYWxcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IHAyIFBvbHlub21pYWxcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9ICAgIFByb2R1Y3Qgb2YgcDEgYW5kIHAyXG4gKi9cbmV4cG9ydHMubXVsID0gZnVuY3Rpb24gbXVsIChwMSwgcDIpIHtcbiAgY29uc3QgY29lZmYgPSBuZXcgVWludDhBcnJheShwMS5sZW5ndGggKyBwMi5sZW5ndGggLSAxKVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcDEubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHAyLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb2VmZltpICsgal0gXj0gR0YubXVsKHAxW2ldLCBwMltqXSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29lZmZcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgdGhlIHJlbWFpbmRlciBvZiBwb2x5bm9taWFscyBkaXZpc2lvblxuICpcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IGRpdmlkZW50IFBvbHlub21pYWxcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IGRpdmlzb3IgIFBvbHlub21pYWxcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9ICAgICAgICAgIFJlbWFpbmRlclxuICovXG5leHBvcnRzLm1vZCA9IGZ1bmN0aW9uIG1vZCAoZGl2aWRlbnQsIGRpdmlzb3IpIHtcbiAgbGV0IHJlc3VsdCA9IG5ldyBVaW50OEFycmF5KGRpdmlkZW50KVxuXG4gIHdoaWxlICgocmVzdWx0Lmxlbmd0aCAtIGRpdmlzb3IubGVuZ3RoKSA+PSAwKSB7XG4gICAgY29uc3QgY29lZmYgPSByZXN1bHRbMF1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGl2aXNvci5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0W2ldIF49IEdGLm11bChkaXZpc29yW2ldLCBjb2VmZilcbiAgICB9XG5cbiAgICAvLyByZW1vdmUgYWxsIHplcm9zIGZyb20gYnVmZmVyIGhlYWRcbiAgICBsZXQgb2Zmc2V0ID0gMFxuICAgIHdoaWxlIChvZmZzZXQgPCByZXN1bHQubGVuZ3RoICYmIHJlc3VsdFtvZmZzZXRdID09PSAwKSBvZmZzZXQrK1xuICAgIHJlc3VsdCA9IHJlc3VsdC5zbGljZShvZmZzZXQpXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbi8qKlxuICogR2VuZXJhdGUgYW4gaXJyZWR1Y2libGUgZ2VuZXJhdG9yIHBvbHlub21pYWwgb2Ygc3BlY2lmaWVkIGRlZ3JlZVxuICogKHVzZWQgYnkgUmVlZC1Tb2xvbW9uIGVuY29kZXIpXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBkZWdyZWUgRGVncmVlIG9mIHRoZSBnZW5lcmF0b3IgcG9seW5vbWlhbFxuICogQHJldHVybiB7VWludDhBcnJheX0gICAgQnVmZmVyIGNvbnRhaW5pbmcgcG9seW5vbWlhbCBjb2VmZmljaWVudHNcbiAqL1xuZXhwb3J0cy5nZW5lcmF0ZUVDUG9seW5vbWlhbCA9IGZ1bmN0aW9uIGdlbmVyYXRlRUNQb2x5bm9taWFsIChkZWdyZWUpIHtcbiAgbGV0IHBvbHkgPSBuZXcgVWludDhBcnJheShbMV0pXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGVncmVlOyBpKyspIHtcbiAgICBwb2x5ID0gZXhwb3J0cy5tdWwocG9seSwgbmV3IFVpbnQ4QXJyYXkoWzEsIEdGLmV4cChpKV0pKVxuICB9XG5cbiAgcmV0dXJuIHBvbHlcbn1cbiIsImNvbnN0IFBvbHlub21pYWwgPSByZXF1aXJlKCcuL3BvbHlub21pYWwnKVxuXG5mdW5jdGlvbiBSZWVkU29sb21vbkVuY29kZXIgKGRlZ3JlZSkge1xuICB0aGlzLmdlblBvbHkgPSB1bmRlZmluZWRcbiAgdGhpcy5kZWdyZWUgPSBkZWdyZWVcblxuICBpZiAodGhpcy5kZWdyZWUpIHRoaXMuaW5pdGlhbGl6ZSh0aGlzLmRlZ3JlZSlcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSBlbmNvZGVyLlxuICogVGhlIGlucHV0IHBhcmFtIHNob3VsZCBjb3JyZXNwb25kIHRvIHRoZSBudW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHMuXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBkZWdyZWVcbiAqL1xuUmVlZFNvbG9tb25FbmNvZGVyLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24gaW5pdGlhbGl6ZSAoZGVncmVlKSB7XG4gIC8vIGNyZWF0ZSBhbiBpcnJlZHVjaWJsZSBnZW5lcmF0b3IgcG9seW5vbWlhbFxuICB0aGlzLmRlZ3JlZSA9IGRlZ3JlZVxuICB0aGlzLmdlblBvbHkgPSBQb2x5bm9taWFsLmdlbmVyYXRlRUNQb2x5bm9taWFsKHRoaXMuZGVncmVlKVxufVxuXG4vKipcbiAqIEVuY29kZXMgYSBjaHVuayBvZiBkYXRhXG4gKlxuICogQHBhcmFtICB7VWludDhBcnJheX0gZGF0YSBCdWZmZXIgY29udGFpbmluZyBpbnB1dCBkYXRhXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICAgIEJ1ZmZlciBjb250YWluaW5nIGVuY29kZWQgZGF0YVxuICovXG5SZWVkU29sb21vbkVuY29kZXIucHJvdG90eXBlLmVuY29kZSA9IGZ1bmN0aW9uIGVuY29kZSAoZGF0YSkge1xuICBpZiAoIXRoaXMuZ2VuUG9seSkge1xuICAgIHRocm93IG5ldyBFcnJvcignRW5jb2RlciBub3QgaW5pdGlhbGl6ZWQnKVxuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIEVDIGZvciB0aGlzIGRhdGEgYmxvY2tcbiAgLy8gZXh0ZW5kcyBkYXRhIHNpemUgdG8gZGF0YStnZW5Qb2x5IHNpemVcbiAgY29uc3QgcGFkZGVkRGF0YSA9IG5ldyBVaW50OEFycmF5KGRhdGEubGVuZ3RoICsgdGhpcy5kZWdyZWUpXG4gIHBhZGRlZERhdGEuc2V0KGRhdGEpXG5cbiAgLy8gVGhlIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzIGFyZSB0aGUgcmVtYWluZGVyIGFmdGVyIGRpdmlkaW5nIHRoZSBkYXRhIGNvZGV3b3Jkc1xuICAvLyBieSBhIGdlbmVyYXRvciBwb2x5bm9taWFsXG4gIGNvbnN0IHJlbWFpbmRlciA9IFBvbHlub21pYWwubW9kKHBhZGRlZERhdGEsIHRoaXMuZ2VuUG9seSlcblxuICAvLyByZXR1cm4gRUMgZGF0YSBibG9ja3MgKGxhc3QgbiBieXRlLCB3aGVyZSBuIGlzIHRoZSBkZWdyZWUgb2YgZ2VuUG9seSlcbiAgLy8gSWYgY29lZmZpY2llbnRzIG51bWJlciBpbiByZW1haW5kZXIgYXJlIGxlc3MgdGhhbiBnZW5Qb2x5IGRlZ3JlZSxcbiAgLy8gcGFkIHdpdGggMHMgdG8gdGhlIGxlZnQgdG8gcmVhY2ggdGhlIG5lZWRlZCBudW1iZXIgb2YgY29lZmZpY2llbnRzXG4gIGNvbnN0IHN0YXJ0ID0gdGhpcy5kZWdyZWUgLSByZW1haW5kZXIubGVuZ3RoXG4gIGlmIChzdGFydCA+IDApIHtcbiAgICBjb25zdCBidWZmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5kZWdyZWUpXG4gICAgYnVmZi5zZXQocmVtYWluZGVyLCBzdGFydClcblxuICAgIHJldHVybiBidWZmXG4gIH1cblxuICByZXR1cm4gcmVtYWluZGVyXG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVlZFNvbG9tb25FbmNvZGVyXG4iLCIvKipcbiAqIENoZWNrIGlmIFFSIENvZGUgdmVyc2lvbiBpcyB2YWxpZFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gIHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgIHRydWUgaWYgdmFsaWQgdmVyc2lvbiwgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydHMuaXNWYWxpZCA9IGZ1bmN0aW9uIGlzVmFsaWQgKHZlcnNpb24pIHtcbiAgcmV0dXJuICFpc05hTih2ZXJzaW9uKSAmJiB2ZXJzaW9uID49IDEgJiYgdmVyc2lvbiA8PSA0MFxufVxuIiwiY29uc3QgbnVtZXJpYyA9ICdbMC05XSsnXG5jb25zdCBhbHBoYW51bWVyaWMgPSAnW0EtWiAkJSorXFxcXC0uLzpdKydcbmxldCBrYW5qaSA9ICcoPzpbdTMwMDAtdTMwM0ZdfFt1MzA0MC11MzA5Rl18W3UzMEEwLXUzMEZGXXwnICtcbiAgJ1t1RkYwMC11RkZFRl18W3U0RTAwLXU5RkFGXXxbdTI2MDUtdTI2MDZdfFt1MjE5MC11MjE5NV18dTIwM0J8JyArXG4gICdbdTIwMTB1MjAxNXUyMDE4dTIwMTl1MjAyNXUyMDI2dTIwMUN1MjAxRHUyMjI1dTIyNjBdfCcgK1xuICAnW3UwMzkxLXUwNDUxXXxbdTAwQTd1MDBBOHUwMEIxdTAwQjR1MDBEN3UwMEY3XSkrJ1xua2FuamkgPSBrYW5qaS5yZXBsYWNlKC91L2csICdcXFxcdScpXG5cbmNvbnN0IGJ5dGUgPSAnKD86KD8hW0EtWjAtOSAkJSorXFxcXC0uLzpdfCcgKyBrYW5qaSArICcpKD86LnxbXFxyXFxuXSkpKydcblxuZXhwb3J0cy5LQU5KSSA9IG5ldyBSZWdFeHAoa2FuamksICdnJylcbmV4cG9ydHMuQllURV9LQU5KSSA9IG5ldyBSZWdFeHAoJ1teQS1aMC05ICQlKitcXFxcLS4vOl0rJywgJ2cnKVxuZXhwb3J0cy5CWVRFID0gbmV3IFJlZ0V4cChieXRlLCAnZycpXG5leHBvcnRzLk5VTUVSSUMgPSBuZXcgUmVnRXhwKG51bWVyaWMsICdnJylcbmV4cG9ydHMuQUxQSEFOVU1FUklDID0gbmV3IFJlZ0V4cChhbHBoYW51bWVyaWMsICdnJylcblxuY29uc3QgVEVTVF9LQU5KSSA9IG5ldyBSZWdFeHAoJ14nICsga2FuamkgKyAnJCcpXG5jb25zdCBURVNUX05VTUVSSUMgPSBuZXcgUmVnRXhwKCdeJyArIG51bWVyaWMgKyAnJCcpXG5jb25zdCBURVNUX0FMUEhBTlVNRVJJQyA9IG5ldyBSZWdFeHAoJ15bQS1aMC05ICQlKitcXFxcLS4vOl0rJCcpXG5cbmV4cG9ydHMudGVzdEthbmppID0gZnVuY3Rpb24gdGVzdEthbmppIChzdHIpIHtcbiAgcmV0dXJuIFRFU1RfS0FOSkkudGVzdChzdHIpXG59XG5cbmV4cG9ydHMudGVzdE51bWVyaWMgPSBmdW5jdGlvbiB0ZXN0TnVtZXJpYyAoc3RyKSB7XG4gIHJldHVybiBURVNUX05VTUVSSUMudGVzdChzdHIpXG59XG5cbmV4cG9ydHMudGVzdEFscGhhbnVtZXJpYyA9IGZ1bmN0aW9uIHRlc3RBbHBoYW51bWVyaWMgKHN0cikge1xuICByZXR1cm4gVEVTVF9BTFBIQU5VTUVSSUMudGVzdChzdHIpXG59XG4iLCJjb25zdCBWZXJzaW9uQ2hlY2sgPSByZXF1aXJlKCcuL3ZlcnNpb24tY2hlY2snKVxuY29uc3QgUmVnZXggPSByZXF1aXJlKCcuL3JlZ2V4JylcblxuLyoqXG4gKiBOdW1lcmljIG1vZGUgZW5jb2RlcyBkYXRhIGZyb20gdGhlIGRlY2ltYWwgZGlnaXQgc2V0ICgwIC0gOSlcbiAqIChieXRlIHZhbHVlcyAzMEhFWCB0byAzOUhFWCkuXG4gKiBOb3JtYWxseSwgMyBkYXRhIGNoYXJhY3RlcnMgYXJlIHJlcHJlc2VudGVkIGJ5IDEwIGJpdHMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuZXhwb3J0cy5OVU1FUklDID0ge1xuICBpZDogJ051bWVyaWMnLFxuICBiaXQ6IDEgPDwgMCxcbiAgY2NCaXRzOiBbMTAsIDEyLCAxNF1cbn1cblxuLyoqXG4gKiBBbHBoYW51bWVyaWMgbW9kZSBlbmNvZGVzIGRhdGEgZnJvbSBhIHNldCBvZiA0NSBjaGFyYWN0ZXJzLFxuICogaS5lLiAxMCBudW1lcmljIGRpZ2l0cyAoMCAtIDkpLFxuICogICAgICAyNiBhbHBoYWJldGljIGNoYXJhY3RlcnMgKEEgLSBaKSxcbiAqICAgYW5kIDkgc3ltYm9scyAoU1AsICQsICUsICosICssIC0sIC4sIC8sIDopLlxuICogTm9ybWFsbHksIHR3byBpbnB1dCBjaGFyYWN0ZXJzIGFyZSByZXByZXNlbnRlZCBieSAxMSBiaXRzLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydHMuQUxQSEFOVU1FUklDID0ge1xuICBpZDogJ0FscGhhbnVtZXJpYycsXG4gIGJpdDogMSA8PCAxLFxuICBjY0JpdHM6IFs5LCAxMSwgMTNdXG59XG5cbi8qKlxuICogSW4gYnl0ZSBtb2RlLCBkYXRhIGlzIGVuY29kZWQgYXQgOCBiaXRzIHBlciBjaGFyYWN0ZXIuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuZXhwb3J0cy5CWVRFID0ge1xuICBpZDogJ0J5dGUnLFxuICBiaXQ6IDEgPDwgMixcbiAgY2NCaXRzOiBbOCwgMTYsIDE2XVxufVxuXG4vKipcbiAqIFRoZSBLYW5qaSBtb2RlIGVmZmljaWVudGx5IGVuY29kZXMgS2FuamkgY2hhcmFjdGVycyBpbiBhY2NvcmRhbmNlIHdpdGhcbiAqIHRoZSBTaGlmdCBKSVMgc3lzdGVtIGJhc2VkIG9uIEpJUyBYIDAyMDguXG4gKiBUaGUgU2hpZnQgSklTIHZhbHVlcyBhcmUgc2hpZnRlZCBmcm9tIHRoZSBKSVMgWCAwMjA4IHZhbHVlcy5cbiAqIEpJUyBYIDAyMDggZ2l2ZXMgZGV0YWlscyBvZiB0aGUgc2hpZnQgY29kZWQgcmVwcmVzZW50YXRpb24uXG4gKiBFYWNoIHR3by1ieXRlIGNoYXJhY3RlciB2YWx1ZSBpcyBjb21wYWN0ZWQgdG8gYSAxMy1iaXQgYmluYXJ5IGNvZGV3b3JkLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydHMuS0FOSkkgPSB7XG4gIGlkOiAnS2FuamknLFxuICBiaXQ6IDEgPDwgMyxcbiAgY2NCaXRzOiBbOCwgMTAsIDEyXVxufVxuXG4vKipcbiAqIE1peGVkIG1vZGUgd2lsbCBjb250YWluIGEgc2VxdWVuY2VzIG9mIGRhdGEgaW4gYSBjb21iaW5hdGlvbiBvZiBhbnkgb2ZcbiAqIHRoZSBtb2RlcyBkZXNjcmliZWQgYWJvdmVcbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnRzLk1JWEVEID0ge1xuICBiaXQ6IC0xXG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGJpdHMgbmVlZGVkIHRvIHN0b3JlIHRoZSBkYXRhIGxlbmd0aFxuICogYWNjb3JkaW5nIHRvIFFSIENvZGUgc3BlY2lmaWNhdGlvbnMuXG4gKlxuICogQHBhcmFtICB7TW9kZX0gICBtb2RlICAgIERhdGEgbW9kZVxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgIE51bWJlciBvZiBiaXRzXG4gKi9cbmV4cG9ydHMuZ2V0Q2hhckNvdW50SW5kaWNhdG9yID0gZnVuY3Rpb24gZ2V0Q2hhckNvdW50SW5kaWNhdG9yIChtb2RlLCB2ZXJzaW9uKSB7XG4gIGlmICghbW9kZS5jY0JpdHMpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBtb2RlOiAnICsgbW9kZSlcblxuICBpZiAoIVZlcnNpb25DaGVjay5pc1ZhbGlkKHZlcnNpb24pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHZlcnNpb246ICcgKyB2ZXJzaW9uKVxuICB9XG5cbiAgaWYgKHZlcnNpb24gPj0gMSAmJiB2ZXJzaW9uIDwgMTApIHJldHVybiBtb2RlLmNjQml0c1swXVxuICBlbHNlIGlmICh2ZXJzaW9uIDwgMjcpIHJldHVybiBtb2RlLmNjQml0c1sxXVxuICByZXR1cm4gbW9kZS5jY0JpdHNbMl1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtb3N0IGVmZmljaWVudCBtb2RlIHRvIHN0b3JlIHRoZSBzcGVjaWZpZWQgZGF0YVxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YVN0ciBJbnB1dCBkYXRhIHN0cmluZ1xuICogQHJldHVybiB7TW9kZX0gICAgICAgICAgIEJlc3QgbW9kZVxuICovXG5leHBvcnRzLmdldEJlc3RNb2RlRm9yRGF0YSA9IGZ1bmN0aW9uIGdldEJlc3RNb2RlRm9yRGF0YSAoZGF0YVN0cikge1xuICBpZiAoUmVnZXgudGVzdE51bWVyaWMoZGF0YVN0cikpIHJldHVybiBleHBvcnRzLk5VTUVSSUNcbiAgZWxzZSBpZiAoUmVnZXgudGVzdEFscGhhbnVtZXJpYyhkYXRhU3RyKSkgcmV0dXJuIGV4cG9ydHMuQUxQSEFOVU1FUklDXG4gIGVsc2UgaWYgKFJlZ2V4LnRlc3RLYW5qaShkYXRhU3RyKSkgcmV0dXJuIGV4cG9ydHMuS0FOSklcbiAgZWxzZSByZXR1cm4gZXhwb3J0cy5CWVRFXG59XG5cbi8qKlxuICogUmV0dXJuIG1vZGUgbmFtZSBhcyBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge01vZGV9IG1vZGUgTW9kZSBvYmplY3RcbiAqIEByZXR1cm5zIHtTdHJpbmd9ICBNb2RlIG5hbWVcbiAqL1xuZXhwb3J0cy50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nIChtb2RlKSB7XG4gIGlmIChtb2RlICYmIG1vZGUuaWQpIHJldHVybiBtb2RlLmlkXG4gIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBtb2RlJylcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBpbnB1dCBwYXJhbSBpcyBhIHZhbGlkIG1vZGUgb2JqZWN0XG4gKlxuICogQHBhcmFtICAge01vZGV9ICAgIG1vZGUgTW9kZSBvYmplY3RcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHZhbGlkIG1vZGUsIGZhbHNlIG90aGVyd2lzZVxuICovXG5leHBvcnRzLmlzVmFsaWQgPSBmdW5jdGlvbiBpc1ZhbGlkIChtb2RlKSB7XG4gIHJldHVybiBtb2RlICYmIG1vZGUuYml0ICYmIG1vZGUuY2NCaXRzXG59XG5cbi8qKlxuICogR2V0IG1vZGUgb2JqZWN0IGZyb20gaXRzIG5hbWVcbiAqXG4gKiBAcGFyYW0gICB7U3RyaW5nfSBzdHJpbmcgTW9kZSBuYW1lXG4gKiBAcmV0dXJucyB7TW9kZX0gICAgICAgICAgTW9kZSBvYmplY3RcbiAqL1xuZnVuY3Rpb24gZnJvbVN0cmluZyAoc3RyaW5nKSB7XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcignUGFyYW0gaXMgbm90IGEgc3RyaW5nJylcbiAgfVxuXG4gIGNvbnN0IGxjU3RyID0gc3RyaW5nLnRvTG93ZXJDYXNlKClcblxuICBzd2l0Y2ggKGxjU3RyKSB7XG4gICAgY2FzZSAnbnVtZXJpYyc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5OVU1FUklDXG4gICAgY2FzZSAnYWxwaGFudW1lcmljJzpcbiAgICAgIHJldHVybiBleHBvcnRzLkFMUEhBTlVNRVJJQ1xuICAgIGNhc2UgJ2thbmppJzpcbiAgICAgIHJldHVybiBleHBvcnRzLktBTkpJXG4gICAgY2FzZSAnYnl0ZSc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5CWVRFXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBtb2RlOiAnICsgc3RyaW5nKVxuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBtb2RlIGZyb20gYSB2YWx1ZS5cbiAqIElmIHZhbHVlIGlzIG5vdCBhIHZhbGlkIG1vZGUsIHJldHVybnMgZGVmYXVsdFZhbHVlXG4gKlxuICogQHBhcmFtICB7TW9kZXxTdHJpbmd9IHZhbHVlICAgICAgICBFbmNvZGluZyBtb2RlXG4gKiBAcGFyYW0gIHtNb2RlfSAgICAgICAgZGVmYXVsdFZhbHVlIEZhbGxiYWNrIHZhbHVlXG4gKiBAcmV0dXJuIHtNb2RlfSAgICAgICAgICAgICAgICAgICAgIEVuY29kaW5nIG1vZGVcbiAqL1xuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSAodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAoZXhwb3J0cy5pc1ZhbGlkKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh2YWx1ZSlcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgfVxufVxuIiwiY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcbmNvbnN0IEVDQ29kZSA9IHJlcXVpcmUoJy4vZXJyb3ItY29ycmVjdGlvbi1jb2RlJylcbmNvbnN0IEVDTGV2ZWwgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwnKVxuY29uc3QgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG5jb25zdCBWZXJzaW9uQ2hlY2sgPSByZXF1aXJlKCcuL3ZlcnNpb24tY2hlY2snKVxuXG4vLyBHZW5lcmF0b3IgcG9seW5vbWlhbCB1c2VkIHRvIGVuY29kZSB2ZXJzaW9uIGluZm9ybWF0aW9uXG5jb25zdCBHMTggPSAoMSA8PCAxMikgfCAoMSA8PCAxMSkgfCAoMSA8PCAxMCkgfCAoMSA8PCA5KSB8ICgxIDw8IDgpIHwgKDEgPDwgNSkgfCAoMSA8PCAyKSB8ICgxIDw8IDApXG5jb25zdCBHMThfQkNIID0gVXRpbHMuZ2V0QkNIRGlnaXQoRzE4KVxuXG5mdW5jdGlvbiBnZXRCZXN0VmVyc2lvbkZvckRhdGFMZW5ndGggKG1vZGUsIGxlbmd0aCwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcbiAgZm9yIChsZXQgY3VycmVudFZlcnNpb24gPSAxOyBjdXJyZW50VmVyc2lvbiA8PSA0MDsgY3VycmVudFZlcnNpb24rKykge1xuICAgIGlmIChsZW5ndGggPD0gZXhwb3J0cy5nZXRDYXBhY2l0eShjdXJyZW50VmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1vZGUpKSB7XG4gICAgICByZXR1cm4gY3VycmVudFZlcnNpb25cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkXG59XG5cbmZ1bmN0aW9uIGdldFJlc2VydmVkQml0c0NvdW50IChtb2RlLCB2ZXJzaW9uKSB7XG4gIC8vIENoYXJhY3RlciBjb3VudCBpbmRpY2F0b3IgKyBtb2RlIGluZGljYXRvciBiaXRzXG4gIHJldHVybiBNb2RlLmdldENoYXJDb3VudEluZGljYXRvcihtb2RlLCB2ZXJzaW9uKSArIDRcbn1cblxuZnVuY3Rpb24gZ2V0VG90YWxCaXRzRnJvbURhdGFBcnJheSAoc2VnbWVudHMsIHZlcnNpb24pIHtcbiAgbGV0IHRvdGFsQml0cyA9IDBcblxuICBzZWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgY29uc3QgcmVzZXJ2ZWRCaXRzID0gZ2V0UmVzZXJ2ZWRCaXRzQ291bnQoZGF0YS5tb2RlLCB2ZXJzaW9uKVxuICAgIHRvdGFsQml0cyArPSByZXNlcnZlZEJpdHMgKyBkYXRhLmdldEJpdHNMZW5ndGgoKVxuICB9KVxuXG4gIHJldHVybiB0b3RhbEJpdHNcbn1cblxuZnVuY3Rpb24gZ2V0QmVzdFZlcnNpb25Gb3JNaXhlZERhdGEgKHNlZ21lbnRzLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xuICBmb3IgKGxldCBjdXJyZW50VmVyc2lvbiA9IDE7IGN1cnJlbnRWZXJzaW9uIDw9IDQwOyBjdXJyZW50VmVyc2lvbisrKSB7XG4gICAgY29uc3QgbGVuZ3RoID0gZ2V0VG90YWxCaXRzRnJvbURhdGFBcnJheShzZWdtZW50cywgY3VycmVudFZlcnNpb24pXG4gICAgaWYgKGxlbmd0aCA8PSBleHBvcnRzLmdldENhcGFjaXR5KGN1cnJlbnRWZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgTW9kZS5NSVhFRCkpIHtcbiAgICAgIHJldHVybiBjdXJyZW50VmVyc2lvblxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWRcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHZlcnNpb24gbnVtYmVyIGZyb20gYSB2YWx1ZS5cbiAqIElmIHZhbHVlIGlzIG5vdCBhIHZhbGlkIHZlcnNpb24sIHJldHVybnMgZGVmYXVsdFZhbHVlXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfFN0cmluZ30gdmFsdWUgICAgICAgIFFSIENvZGUgdmVyc2lvblxuICogQHBhcmFtICB7TnVtYmVyfSAgICAgICAgZGVmYXVsdFZhbHVlIEZhbGxiYWNrIHZhbHVlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uIG51bWJlclxuICovXG5leHBvcnRzLmZyb20gPSBmdW5jdGlvbiBmcm9tICh2YWx1ZSwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmIChWZXJzaW9uQ2hlY2suaXNWYWxpZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQodmFsdWUsIDEwKVxuICB9XG5cbiAgcmV0dXJuIGRlZmF1bHRWYWx1ZVxufVxuXG4vKipcbiAqIFJldHVybnMgaG93IG11Y2ggZGF0YSBjYW4gYmUgc3RvcmVkIHdpdGggdGhlIHNwZWNpZmllZCBRUiBjb2RlIHZlcnNpb25cbiAqIGFuZCBlcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb24gKDEtNDApXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEBwYXJhbSAge01vZGV9ICAgbW9kZSAgICAgICAgICAgICAgICAgRGF0YSBtb2RlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgIFF1YW50aXR5IG9mIHN0b3JhYmxlIGRhdGFcbiAqL1xuZXhwb3J0cy5nZXRDYXBhY2l0eSA9IGZ1bmN0aW9uIGdldENhcGFjaXR5ICh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbW9kZSkge1xuICBpZiAoIVZlcnNpb25DaGVjay5pc1ZhbGlkKHZlcnNpb24pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFFSIENvZGUgdmVyc2lvbicpXG4gIH1cblxuICAvLyBVc2UgQnl0ZSBtb2RlIGFzIGRlZmF1bHRcbiAgaWYgKHR5cGVvZiBtb2RlID09PSAndW5kZWZpbmVkJykgbW9kZSA9IE1vZGUuQllURVxuXG4gIC8vIFRvdGFsIGNvZGV3b3JkcyBmb3IgdGhpcyBRUiBjb2RlIHZlcnNpb24gKERhdGEgKyBFcnJvciBjb3JyZWN0aW9uKVxuICBjb25zdCB0b3RhbENvZGV3b3JkcyA9IFV0aWxzLmdldFN5bWJvbFRvdGFsQ29kZXdvcmRzKHZlcnNpb24pXG5cbiAgLy8gVG90YWwgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzXG4gIGNvbnN0IGVjVG90YWxDb2Rld29yZHMgPSBFQ0NvZGUuZ2V0VG90YWxDb2Rld29yZHNDb3VudCh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcblxuICAvLyBUb3RhbCBudW1iZXIgb2YgZGF0YSBjb2Rld29yZHNcbiAgY29uc3QgZGF0YVRvdGFsQ29kZXdvcmRzQml0cyA9ICh0b3RhbENvZGV3b3JkcyAtIGVjVG90YWxDb2Rld29yZHMpICogOFxuXG4gIGlmIChtb2RlID09PSBNb2RlLk1JWEVEKSByZXR1cm4gZGF0YVRvdGFsQ29kZXdvcmRzQml0c1xuXG4gIGNvbnN0IHVzYWJsZUJpdHMgPSBkYXRhVG90YWxDb2Rld29yZHNCaXRzIC0gZ2V0UmVzZXJ2ZWRCaXRzQ291bnQobW9kZSwgdmVyc2lvbilcblxuICAvLyBSZXR1cm4gbWF4IG51bWJlciBvZiBzdG9yYWJsZSBjb2Rld29yZHNcbiAgc3dpdGNoIChtb2RlKSB7XG4gICAgY2FzZSBNb2RlLk5VTUVSSUM6XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcigodXNhYmxlQml0cyAvIDEwKSAqIDMpXG5cbiAgICBjYXNlIE1vZGUuQUxQSEFOVU1FUklDOlxuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKHVzYWJsZUJpdHMgLyAxMSkgKiAyKVxuXG4gICAgY2FzZSBNb2RlLktBTkpJOlxuICAgICAgcmV0dXJuIE1hdGguZmxvb3IodXNhYmxlQml0cyAvIDEzKVxuXG4gICAgY2FzZSBNb2RlLkJZVEU6XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKHVzYWJsZUJpdHMgLyA4KVxuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSB2ZXJzaW9uIG5lZWRlZCB0byBjb250YWluIHRoZSBhbW91bnQgb2YgZGF0YVxuICpcbiAqIEBwYXJhbSAge1NlZ21lbnR9IGRhdGEgICAgICAgICAgICAgICAgICAgIFNlZ21lbnQgb2YgZGF0YVxuICogQHBhcmFtICB7TnVtYmVyfSBbZXJyb3JDb3JyZWN0aW9uTGV2ZWw9SF0gRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuICogQHBhcmFtICB7TW9kZX0gbW9kZSAgICAgICAgICAgICAgICAgICAgICAgRGF0YSBtb2RlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cbiAqL1xuZXhwb3J0cy5nZXRCZXN0VmVyc2lvbkZvckRhdGEgPSBmdW5jdGlvbiBnZXRCZXN0VmVyc2lvbkZvckRhdGEgKGRhdGEsIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XG4gIGxldCBzZWdcblxuICBjb25zdCBlY2wgPSBFQ0xldmVsLmZyb20oZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIEVDTGV2ZWwuTSlcblxuICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgIGlmIChkYXRhLmxlbmd0aCA+IDEpIHtcbiAgICAgIHJldHVybiBnZXRCZXN0VmVyc2lvbkZvck1peGVkRGF0YShkYXRhLCBlY2wpXG4gICAgfVxuXG4gICAgaWYgKGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cblxuICAgIHNlZyA9IGRhdGFbMF1cbiAgfSBlbHNlIHtcbiAgICBzZWcgPSBkYXRhXG4gIH1cblxuICByZXR1cm4gZ2V0QmVzdFZlcnNpb25Gb3JEYXRhTGVuZ3RoKHNlZy5tb2RlLCBzZWcuZ2V0TGVuZ3RoKCksIGVjbClcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHZlcnNpb24gaW5mb3JtYXRpb24gd2l0aCByZWxhdGl2ZSBlcnJvciBjb3JyZWN0aW9uIGJpdHNcbiAqXG4gKiBUaGUgdmVyc2lvbiBpbmZvcm1hdGlvbiBpcyBpbmNsdWRlZCBpbiBRUiBDb2RlIHN5bWJvbHMgb2YgdmVyc2lvbiA3IG9yIGxhcmdlci5cbiAqIEl0IGNvbnNpc3RzIG9mIGFuIDE4LWJpdCBzZXF1ZW5jZSBjb250YWluaW5nIDYgZGF0YSBiaXRzLFxuICogd2l0aCAxMiBlcnJvciBjb3JyZWN0aW9uIGJpdHMgY2FsY3VsYXRlZCB1c2luZyB0aGUgKDE4LCA2KSBHb2xheSBjb2RlLlxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICBFbmNvZGVkIHZlcnNpb24gaW5mbyBiaXRzXG4gKi9cbmV4cG9ydHMuZ2V0RW5jb2RlZEJpdHMgPSBmdW5jdGlvbiBnZXRFbmNvZGVkQml0cyAodmVyc2lvbikge1xuICBpZiAoIVZlcnNpb25DaGVjay5pc1ZhbGlkKHZlcnNpb24pIHx8IHZlcnNpb24gPCA3KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFFSIENvZGUgdmVyc2lvbicpXG4gIH1cblxuICBsZXQgZCA9IHZlcnNpb24gPDwgMTJcblxuICB3aGlsZSAoVXRpbHMuZ2V0QkNIRGlnaXQoZCkgLSBHMThfQkNIID49IDApIHtcbiAgICBkIF49IChHMTggPDwgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE4X0JDSCkpXG4gIH1cblxuICByZXR1cm4gKHZlcnNpb24gPDwgMTIpIHwgZFxufVxuIiwiY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcblxuY29uc3QgRzE1ID0gKDEgPDwgMTApIHwgKDEgPDwgOCkgfCAoMSA8PCA1KSB8ICgxIDw8IDQpIHwgKDEgPDwgMikgfCAoMSA8PCAxKSB8ICgxIDw8IDApXG5jb25zdCBHMTVfTUFTSyA9ICgxIDw8IDE0KSB8ICgxIDw8IDEyKSB8ICgxIDw8IDEwKSB8ICgxIDw8IDQpIHwgKDEgPDwgMSlcbmNvbnN0IEcxNV9CQ0ggPSBVdGlscy5nZXRCQ0hEaWdpdChHMTUpXG5cbi8qKlxuICogUmV0dXJucyBmb3JtYXQgaW5mb3JtYXRpb24gd2l0aCByZWxhdGl2ZSBlcnJvciBjb3JyZWN0aW9uIGJpdHNcbiAqXG4gKiBUaGUgZm9ybWF0IGluZm9ybWF0aW9uIGlzIGEgMTUtYml0IHNlcXVlbmNlIGNvbnRhaW5pbmcgNSBkYXRhIGJpdHMsXG4gKiB3aXRoIDEwIGVycm9yIGNvcnJlY3Rpb24gYml0cyBjYWxjdWxhdGVkIHVzaW5nIHRoZSAoMTUsIDUpIEJDSCBjb2RlLlxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuICogQHBhcmFtICB7TnVtYmVyfSBtYXNrICAgICAgICAgICAgICAgICBNYXNrIHBhdHRlcm5cbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICAgRW5jb2RlZCBmb3JtYXQgaW5mb3JtYXRpb24gYml0c1xuICovXG5leHBvcnRzLmdldEVuY29kZWRCaXRzID0gZnVuY3Rpb24gZ2V0RW5jb2RlZEJpdHMgKGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrKSB7XG4gIGNvbnN0IGRhdGEgPSAoKGVycm9yQ29ycmVjdGlvbkxldmVsLmJpdCA8PCAzKSB8IG1hc2spXG4gIGxldCBkID0gZGF0YSA8PCAxMFxuXG4gIHdoaWxlIChVdGlscy5nZXRCQ0hEaWdpdChkKSAtIEcxNV9CQ0ggPj0gMCkge1xuICAgIGQgXj0gKEcxNSA8PCAoVXRpbHMuZ2V0QkNIRGlnaXQoZCkgLSBHMTVfQkNIKSlcbiAgfVxuXG4gIC8vIHhvciBmaW5hbCBkYXRhIHdpdGggbWFzayBwYXR0ZXJuIGluIG9yZGVyIHRvIGVuc3VyZSB0aGF0XG4gIC8vIG5vIGNvbWJpbmF0aW9uIG9mIEVycm9yIENvcnJlY3Rpb24gTGV2ZWwgYW5kIGRhdGEgbWFzayBwYXR0ZXJuXG4gIC8vIHdpbGwgcmVzdWx0IGluIGFuIGFsbC16ZXJvIGRhdGEgc3RyaW5nXG4gIHJldHVybiAoKGRhdGEgPDwgMTApIHwgZCkgXiBHMTVfTUFTS1xufVxuIiwiY29uc3QgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG5cbmZ1bmN0aW9uIE51bWVyaWNEYXRhIChkYXRhKSB7XG4gIHRoaXMubW9kZSA9IE1vZGUuTlVNRVJJQ1xuICB0aGlzLmRhdGEgPSBkYXRhLnRvU3RyaW5nKClcbn1cblxuTnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKGxlbmd0aCkge1xuICByZXR1cm4gMTAgKiBNYXRoLmZsb29yKGxlbmd0aCAvIDMpICsgKChsZW5ndGggJSAzKSA/ICgobGVuZ3RoICUgMykgKiAzICsgMSkgOiAwKVxufVxuXG5OdW1lcmljRGF0YS5wcm90b3R5cGUuZ2V0TGVuZ3RoID0gZnVuY3Rpb24gZ2V0TGVuZ3RoICgpIHtcbiAgcmV0dXJuIHRoaXMuZGF0YS5sZW5ndGhcbn1cblxuTnVtZXJpY0RhdGEucHJvdG90eXBlLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoICgpIHtcbiAgcmV0dXJuIE51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGgodGhpcy5kYXRhLmxlbmd0aClcbn1cblxuTnVtZXJpY0RhdGEucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKGJpdEJ1ZmZlcikge1xuICBsZXQgaSwgZ3JvdXAsIHZhbHVlXG5cbiAgLy8gVGhlIGlucHV0IGRhdGEgc3RyaW5nIGlzIGRpdmlkZWQgaW50byBncm91cHMgb2YgdGhyZWUgZGlnaXRzLFxuICAvLyBhbmQgZWFjaCBncm91cCBpcyBjb252ZXJ0ZWQgdG8gaXRzIDEwLWJpdCBiaW5hcnkgZXF1aXZhbGVudC5cbiAgZm9yIChpID0gMDsgaSArIDMgPD0gdGhpcy5kYXRhLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgZ3JvdXAgPSB0aGlzLmRhdGEuc3Vic3RyKGksIDMpXG4gICAgdmFsdWUgPSBwYXJzZUludChncm91cCwgMTApXG5cbiAgICBiaXRCdWZmZXIucHV0KHZhbHVlLCAxMClcbiAgfVxuXG4gIC8vIElmIHRoZSBudW1iZXIgb2YgaW5wdXQgZGlnaXRzIGlzIG5vdCBhbiBleGFjdCBtdWx0aXBsZSBvZiB0aHJlZSxcbiAgLy8gdGhlIGZpbmFsIG9uZSBvciB0d28gZGlnaXRzIGFyZSBjb252ZXJ0ZWQgdG8gNCBvciA3IGJpdHMgcmVzcGVjdGl2ZWx5LlxuICBjb25zdCByZW1haW5pbmdOdW0gPSB0aGlzLmRhdGEubGVuZ3RoIC0gaVxuICBpZiAocmVtYWluaW5nTnVtID4gMCkge1xuICAgIGdyb3VwID0gdGhpcy5kYXRhLnN1YnN0cihpKVxuICAgIHZhbHVlID0gcGFyc2VJbnQoZ3JvdXAsIDEwKVxuXG4gICAgYml0QnVmZmVyLnB1dCh2YWx1ZSwgcmVtYWluaW5nTnVtICogMyArIDEpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOdW1lcmljRGF0YVxuIiwiY29uc3QgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG5cbi8qKlxuICogQXJyYXkgb2YgY2hhcmFjdGVycyBhdmFpbGFibGUgaW4gYWxwaGFudW1lcmljIG1vZGVcbiAqXG4gKiBBcyBwZXIgUVIgQ29kZSBzcGVjaWZpY2F0aW9uLCB0byBlYWNoIGNoYXJhY3RlclxuICogaXMgYXNzaWduZWQgYSB2YWx1ZSBmcm9tIDAgdG8gNDQgd2hpY2ggaW4gdGhpcyBjYXNlIGNvaW5jaWRlc1xuICogd2l0aCB0aGUgYXJyYXkgaW5kZXhcbiAqXG4gKiBAdHlwZSB7QXJyYXl9XG4gKi9cbmNvbnN0IEFMUEhBX05VTV9DSEFSUyA9IFtcbiAgJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLFxuICAnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLCAnSicsICdLJywgJ0wnLCAnTScsXG4gICdOJywgJ08nLCAnUCcsICdRJywgJ1InLCAnUycsICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJyxcbiAgJyAnLCAnJCcsICclJywgJyonLCAnKycsICctJywgJy4nLCAnLycsICc6J1xuXVxuXG5mdW5jdGlvbiBBbHBoYW51bWVyaWNEYXRhIChkYXRhKSB7XG4gIHRoaXMubW9kZSA9IE1vZGUuQUxQSEFOVU1FUklDXG4gIHRoaXMuZGF0YSA9IGRhdGFcbn1cblxuQWxwaGFudW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAobGVuZ3RoKSB7XG4gIHJldHVybiAxMSAqIE1hdGguZmxvb3IobGVuZ3RoIC8gMikgKyA2ICogKGxlbmd0aCAlIDIpXG59XG5cbkFscGhhbnVtZXJpY0RhdGEucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uIGdldExlbmd0aCAoKSB7XG4gIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoXG59XG5cbkFscGhhbnVtZXJpY0RhdGEucHJvdG90eXBlLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoICgpIHtcbiAgcmV0dXJuIEFscGhhbnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aCh0aGlzLmRhdGEubGVuZ3RoKVxufVxuXG5BbHBoYW51bWVyaWNEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChiaXRCdWZmZXIpIHtcbiAgbGV0IGlcblxuICAvLyBJbnB1dCBkYXRhIGNoYXJhY3RlcnMgYXJlIGRpdmlkZWQgaW50byBncm91cHMgb2YgdHdvIGNoYXJhY3RlcnNcbiAgLy8gYW5kIGVuY29kZWQgYXMgMTEtYml0IGJpbmFyeSBjb2Rlcy5cbiAgZm9yIChpID0gMDsgaSArIDIgPD0gdGhpcy5kYXRhLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgLy8gVGhlIGNoYXJhY3RlciB2YWx1ZSBvZiB0aGUgZmlyc3QgY2hhcmFjdGVyIGlzIG11bHRpcGxpZWQgYnkgNDVcbiAgICBsZXQgdmFsdWUgPSBBTFBIQV9OVU1fQ0hBUlMuaW5kZXhPZih0aGlzLmRhdGFbaV0pICogNDVcblxuICAgIC8vIFRoZSBjaGFyYWN0ZXIgdmFsdWUgb2YgdGhlIHNlY29uZCBkaWdpdCBpcyBhZGRlZCB0byB0aGUgcHJvZHVjdFxuICAgIHZhbHVlICs9IEFMUEhBX05VTV9DSEFSUy5pbmRleE9mKHRoaXMuZGF0YVtpICsgMV0pXG5cbiAgICAvLyBUaGUgc3VtIGlzIHRoZW4gc3RvcmVkIGFzIDExLWJpdCBiaW5hcnkgbnVtYmVyXG4gICAgYml0QnVmZmVyLnB1dCh2YWx1ZSwgMTEpXG4gIH1cblxuICAvLyBJZiB0aGUgbnVtYmVyIG9mIGlucHV0IGRhdGEgY2hhcmFjdGVycyBpcyBub3QgYSBtdWx0aXBsZSBvZiB0d28sXG4gIC8vIHRoZSBjaGFyYWN0ZXIgdmFsdWUgb2YgdGhlIGZpbmFsIGNoYXJhY3RlciBpcyBlbmNvZGVkIGFzIGEgNi1iaXQgYmluYXJ5IG51bWJlci5cbiAgaWYgKHRoaXMuZGF0YS5sZW5ndGggJSAyKSB7XG4gICAgYml0QnVmZmVyLnB1dChBTFBIQV9OVU1fQ0hBUlMuaW5kZXhPZih0aGlzLmRhdGFbaV0pLCA2KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQWxwaGFudW1lcmljRGF0YVxuIiwiY29uc3QgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG5cbmZ1bmN0aW9uIEJ5dGVEYXRhIChkYXRhKSB7XG4gIHRoaXMubW9kZSA9IE1vZGUuQllURVxuICBpZiAodHlwZW9mIChkYXRhKSA9PT0gJ3N0cmluZycpIHtcbiAgICB0aGlzLmRhdGEgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoZGF0YSlcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmRhdGEgPSBuZXcgVWludDhBcnJheShkYXRhKVxuICB9XG59XG5cbkJ5dGVEYXRhLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoIChsZW5ndGgpIHtcbiAgcmV0dXJuIGxlbmd0aCAqIDhcbn1cblxuQnl0ZURhdGEucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uIGdldExlbmd0aCAoKSB7XG4gIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoXG59XG5cbkJ5dGVEYXRhLnByb3RvdHlwZS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAoKSB7XG4gIHJldHVybiBCeXRlRGF0YS5nZXRCaXRzTGVuZ3RoKHRoaXMuZGF0YS5sZW5ndGgpXG59XG5cbkJ5dGVEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChiaXRCdWZmZXIpIHtcbiAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLmRhdGEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgYml0QnVmZmVyLnB1dCh0aGlzLmRhdGFbaV0sIDgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCeXRlRGF0YVxuIiwiY29uc3QgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG5jb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuXG5mdW5jdGlvbiBLYW5qaURhdGEgKGRhdGEpIHtcbiAgdGhpcy5tb2RlID0gTW9kZS5LQU5KSVxuICB0aGlzLmRhdGEgPSBkYXRhXG59XG5cbkthbmppRGF0YS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAobGVuZ3RoKSB7XG4gIHJldHVybiBsZW5ndGggKiAxM1xufVxuXG5LYW5qaURhdGEucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uIGdldExlbmd0aCAoKSB7XG4gIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoXG59XG5cbkthbmppRGF0YS5wcm90b3R5cGUuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKCkge1xuICByZXR1cm4gS2FuamlEYXRhLmdldEJpdHNMZW5ndGgodGhpcy5kYXRhLmxlbmd0aClcbn1cblxuS2FuamlEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChiaXRCdWZmZXIpIHtcbiAgbGV0IGlcblxuICAvLyBJbiB0aGUgU2hpZnQgSklTIHN5c3RlbSwgS2FuamkgY2hhcmFjdGVycyBhcmUgcmVwcmVzZW50ZWQgYnkgYSB0d28gYnl0ZSBjb21iaW5hdGlvbi5cbiAgLy8gVGhlc2UgYnl0ZSB2YWx1ZXMgYXJlIHNoaWZ0ZWQgZnJvbSB0aGUgSklTIFggMDIwOCB2YWx1ZXMuXG4gIC8vIEpJUyBYIDAyMDggZ2l2ZXMgZGV0YWlscyBvZiB0aGUgc2hpZnQgY29kZWQgcmVwcmVzZW50YXRpb24uXG4gIGZvciAoaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgdmFsdWUgPSBVdGlscy50b1NKSVModGhpcy5kYXRhW2ldKVxuXG4gICAgLy8gRm9yIGNoYXJhY3RlcnMgd2l0aCBTaGlmdCBKSVMgdmFsdWVzIGZyb20gMHg4MTQwIHRvIDB4OUZGQzpcbiAgICBpZiAodmFsdWUgPj0gMHg4MTQwICYmIHZhbHVlIDw9IDB4OUZGQykge1xuICAgICAgLy8gU3VidHJhY3QgMHg4MTQwIGZyb20gU2hpZnQgSklTIHZhbHVlXG4gICAgICB2YWx1ZSAtPSAweDgxNDBcblxuICAgIC8vIEZvciBjaGFyYWN0ZXJzIHdpdGggU2hpZnQgSklTIHZhbHVlcyBmcm9tIDB4RTA0MCB0byAweEVCQkZcbiAgICB9IGVsc2UgaWYgKHZhbHVlID49IDB4RTA0MCAmJiB2YWx1ZSA8PSAweEVCQkYpIHtcbiAgICAgIC8vIFN1YnRyYWN0IDB4QzE0MCBmcm9tIFNoaWZ0IEpJUyB2YWx1ZVxuICAgICAgdmFsdWUgLT0gMHhDMTQwXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ0ludmFsaWQgU0pJUyBjaGFyYWN0ZXI6ICcgKyB0aGlzLmRhdGFbaV0gKyAnXFxuJyArXG4gICAgICAgICdNYWtlIHN1cmUgeW91ciBjaGFyc2V0IGlzIFVURi04JylcbiAgICB9XG5cbiAgICAvLyBNdWx0aXBseSBtb3N0IHNpZ25pZmljYW50IGJ5dGUgb2YgcmVzdWx0IGJ5IDB4QzBcbiAgICAvLyBhbmQgYWRkIGxlYXN0IHNpZ25pZmljYW50IGJ5dGUgdG8gcHJvZHVjdFxuICAgIHZhbHVlID0gKCgodmFsdWUgPj4+IDgpICYgMHhmZikgKiAweEMwKSArICh2YWx1ZSAmIDB4ZmYpXG5cbiAgICAvLyBDb252ZXJ0IHJlc3VsdCB0byBhIDEzLWJpdCBiaW5hcnkgc3RyaW5nXG4gICAgYml0QnVmZmVyLnB1dCh2YWx1ZSwgMTMpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBLYW5qaURhdGFcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogQ3JlYXRlZCAyMDA4LTA4LTE5LlxuICpcbiAqIERpamtzdHJhIHBhdGgtZmluZGluZyBmdW5jdGlvbnMuIEFkYXB0ZWQgZnJvbSB0aGUgRGlqa3N0YXIgUHl0aG9uIHByb2plY3QuXG4gKlxuICogQ29weXJpZ2h0IChDKSAyMDA4XG4gKiAgIFd5YXR0IEJhbGR3aW4gPHNlbGZAd3lhdHRiYWxkd2luLmNvbT5cbiAqICAgQWxsIHJpZ2h0cyByZXNlcnZlZFxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqXG4gKiAgIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gKiBUSEUgU09GVFdBUkUuXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG52YXIgZGlqa3N0cmEgPSB7XG4gIHNpbmdsZV9zb3VyY2Vfc2hvcnRlc3RfcGF0aHM6IGZ1bmN0aW9uKGdyYXBoLCBzLCBkKSB7XG4gICAgLy8gUHJlZGVjZXNzb3IgbWFwIGZvciBlYWNoIG5vZGUgdGhhdCBoYXMgYmVlbiBlbmNvdW50ZXJlZC5cbiAgICAvLyBub2RlIElEID0+IHByZWRlY2Vzc29yIG5vZGUgSURcbiAgICB2YXIgcHJlZGVjZXNzb3JzID0ge307XG5cbiAgICAvLyBDb3N0cyBvZiBzaG9ydGVzdCBwYXRocyBmcm9tIHMgdG8gYWxsIG5vZGVzIGVuY291bnRlcmVkLlxuICAgIC8vIG5vZGUgSUQgPT4gY29zdFxuICAgIHZhciBjb3N0cyA9IHt9O1xuICAgIGNvc3RzW3NdID0gMDtcblxuICAgIC8vIENvc3RzIG9mIHNob3J0ZXN0IHBhdGhzIGZyb20gcyB0byBhbGwgbm9kZXMgZW5jb3VudGVyZWQ7IGRpZmZlcnMgZnJvbVxuICAgIC8vIGBjb3N0c2AgaW4gdGhhdCBpdCBwcm92aWRlcyBlYXN5IGFjY2VzcyB0byB0aGUgbm9kZSB0aGF0IGN1cnJlbnRseSBoYXNcbiAgICAvLyB0aGUga25vd24gc2hvcnRlc3QgcGF0aCBmcm9tIHMuXG4gICAgLy8gWFhYOiBEbyB3ZSBhY3R1YWxseSBuZWVkIGJvdGggYGNvc3RzYCBhbmQgYG9wZW5gP1xuICAgIHZhciBvcGVuID0gZGlqa3N0cmEuUHJpb3JpdHlRdWV1ZS5tYWtlKCk7XG4gICAgb3Blbi5wdXNoKHMsIDApO1xuXG4gICAgdmFyIGNsb3Nlc3QsXG4gICAgICAgIHUsIHYsXG4gICAgICAgIGNvc3Rfb2Zfc190b191LFxuICAgICAgICBhZGphY2VudF9ub2RlcyxcbiAgICAgICAgY29zdF9vZl9lLFxuICAgICAgICBjb3N0X29mX3NfdG9fdV9wbHVzX2Nvc3Rfb2ZfZSxcbiAgICAgICAgY29zdF9vZl9zX3RvX3YsXG4gICAgICAgIGZpcnN0X3Zpc2l0O1xuICAgIHdoaWxlICghb3Blbi5lbXB0eSgpKSB7XG4gICAgICAvLyBJbiB0aGUgbm9kZXMgcmVtYWluaW5nIGluIGdyYXBoIHRoYXQgaGF2ZSBhIGtub3duIGNvc3QgZnJvbSBzLFxuICAgICAgLy8gZmluZCB0aGUgbm9kZSwgdSwgdGhhdCBjdXJyZW50bHkgaGFzIHRoZSBzaG9ydGVzdCBwYXRoIGZyb20gcy5cbiAgICAgIGNsb3Nlc3QgPSBvcGVuLnBvcCgpO1xuICAgICAgdSA9IGNsb3Nlc3QudmFsdWU7XG4gICAgICBjb3N0X29mX3NfdG9fdSA9IGNsb3Nlc3QuY29zdDtcblxuICAgICAgLy8gR2V0IG5vZGVzIGFkamFjZW50IHRvIHUuLi5cbiAgICAgIGFkamFjZW50X25vZGVzID0gZ3JhcGhbdV0gfHwge307XG5cbiAgICAgIC8vIC4uLmFuZCBleHBsb3JlIHRoZSBlZGdlcyB0aGF0IGNvbm5lY3QgdSB0byB0aG9zZSBub2RlcywgdXBkYXRpbmdcbiAgICAgIC8vIHRoZSBjb3N0IG9mIHRoZSBzaG9ydGVzdCBwYXRocyB0byBhbnkgb3IgYWxsIG9mIHRob3NlIG5vZGVzIGFzXG4gICAgICAvLyBuZWNlc3NhcnkuIHYgaXMgdGhlIG5vZGUgYWNyb3NzIHRoZSBjdXJyZW50IGVkZ2UgZnJvbSB1LlxuICAgICAgZm9yICh2IGluIGFkamFjZW50X25vZGVzKSB7XG4gICAgICAgIGlmIChhZGphY2VudF9ub2Rlcy5oYXNPd25Qcm9wZXJ0eSh2KSkge1xuICAgICAgICAgIC8vIEdldCB0aGUgY29zdCBvZiB0aGUgZWRnZSBydW5uaW5nIGZyb20gdSB0byB2LlxuICAgICAgICAgIGNvc3Rfb2ZfZSA9IGFkamFjZW50X25vZGVzW3ZdO1xuXG4gICAgICAgICAgLy8gQ29zdCBvZiBzIHRvIHUgcGx1cyB0aGUgY29zdCBvZiB1IHRvIHYgYWNyb3NzIGUtLXRoaXMgaXMgKmEqXG4gICAgICAgICAgLy8gY29zdCBmcm9tIHMgdG8gdiB0aGF0IG1heSBvciBtYXkgbm90IGJlIGxlc3MgdGhhbiB0aGUgY3VycmVudFxuICAgICAgICAgIC8vIGtub3duIGNvc3QgdG8gdi5cbiAgICAgICAgICBjb3N0X29mX3NfdG9fdV9wbHVzX2Nvc3Rfb2ZfZSA9IGNvc3Rfb2Zfc190b191ICsgY29zdF9vZl9lO1xuXG4gICAgICAgICAgLy8gSWYgd2UgaGF2ZW4ndCB2aXNpdGVkIHYgeWV0IE9SIGlmIHRoZSBjdXJyZW50IGtub3duIGNvc3QgZnJvbSBzIHRvXG4gICAgICAgICAgLy8gdiBpcyBncmVhdGVyIHRoYW4gdGhlIG5ldyBjb3N0IHdlIGp1c3QgZm91bmQgKGNvc3Qgb2YgcyB0byB1IHBsdXNcbiAgICAgICAgICAvLyBjb3N0IG9mIHUgdG8gdiBhY3Jvc3MgZSksIHVwZGF0ZSB2J3MgY29zdCBpbiB0aGUgY29zdCBsaXN0IGFuZFxuICAgICAgICAgIC8vIHVwZGF0ZSB2J3MgcHJlZGVjZXNzb3IgaW4gdGhlIHByZWRlY2Vzc29yIGxpc3QgKGl0J3Mgbm93IHUpLlxuICAgICAgICAgIGNvc3Rfb2Zfc190b192ID0gY29zdHNbdl07XG4gICAgICAgICAgZmlyc3RfdmlzaXQgPSAodHlwZW9mIGNvc3RzW3ZdID09PSAndW5kZWZpbmVkJyk7XG4gICAgICAgICAgaWYgKGZpcnN0X3Zpc2l0IHx8IGNvc3Rfb2Zfc190b192ID4gY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2UpIHtcbiAgICAgICAgICAgIGNvc3RzW3ZdID0gY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2U7XG4gICAgICAgICAgICBvcGVuLnB1c2godiwgY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2UpO1xuICAgICAgICAgICAgcHJlZGVjZXNzb3JzW3ZdID0gdTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGQgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjb3N0c1tkXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZhciBtc2cgPSBbJ0NvdWxkIG5vdCBmaW5kIGEgcGF0aCBmcm9tICcsIHMsICcgdG8gJywgZCwgJy4nXS5qb2luKCcnKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgIH1cblxuICAgIHJldHVybiBwcmVkZWNlc3NvcnM7XG4gIH0sXG5cbiAgZXh0cmFjdF9zaG9ydGVzdF9wYXRoX2Zyb21fcHJlZGVjZXNzb3JfbGlzdDogZnVuY3Rpb24ocHJlZGVjZXNzb3JzLCBkKSB7XG4gICAgdmFyIG5vZGVzID0gW107XG4gICAgdmFyIHUgPSBkO1xuICAgIHZhciBwcmVkZWNlc3NvcjtcbiAgICB3aGlsZSAodSkge1xuICAgICAgbm9kZXMucHVzaCh1KTtcbiAgICAgIHByZWRlY2Vzc29yID0gcHJlZGVjZXNzb3JzW3VdO1xuICAgICAgdSA9IHByZWRlY2Vzc29yc1t1XTtcbiAgICB9XG4gICAgbm9kZXMucmV2ZXJzZSgpO1xuICAgIHJldHVybiBub2RlcztcbiAgfSxcblxuICBmaW5kX3BhdGg6IGZ1bmN0aW9uKGdyYXBoLCBzLCBkKSB7XG4gICAgdmFyIHByZWRlY2Vzc29ycyA9IGRpamtzdHJhLnNpbmdsZV9zb3VyY2Vfc2hvcnRlc3RfcGF0aHMoZ3JhcGgsIHMsIGQpO1xuICAgIHJldHVybiBkaWprc3RyYS5leHRyYWN0X3Nob3J0ZXN0X3BhdGhfZnJvbV9wcmVkZWNlc3Nvcl9saXN0KFxuICAgICAgcHJlZGVjZXNzb3JzLCBkKTtcbiAgfSxcblxuICAvKipcbiAgICogQSB2ZXJ5IG5haXZlIHByaW9yaXR5IHF1ZXVlIGltcGxlbWVudGF0aW9uLlxuICAgKi9cbiAgUHJpb3JpdHlRdWV1ZToge1xuICAgIG1ha2U6IGZ1bmN0aW9uIChvcHRzKSB7XG4gICAgICB2YXIgVCA9IGRpamtzdHJhLlByaW9yaXR5UXVldWUsXG4gICAgICAgICAgdCA9IHt9LFxuICAgICAgICAgIGtleTtcbiAgICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuICAgICAgZm9yIChrZXkgaW4gVCkge1xuICAgICAgICBpZiAoVC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgdFtrZXldID0gVFtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0LnF1ZXVlID0gW107XG4gICAgICB0LnNvcnRlciA9IG9wdHMuc29ydGVyIHx8IFQuZGVmYXVsdF9zb3J0ZXI7XG4gICAgICByZXR1cm4gdDtcbiAgICB9LFxuXG4gICAgZGVmYXVsdF9zb3J0ZXI6IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gYS5jb3N0IC0gYi5jb3N0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBuZXcgaXRlbSB0byB0aGUgcXVldWUgYW5kIGVuc3VyZSB0aGUgaGlnaGVzdCBwcmlvcml0eSBlbGVtZW50XG4gICAgICogaXMgYXQgdGhlIGZyb250IG9mIHRoZSBxdWV1ZS5cbiAgICAgKi9cbiAgICBwdXNoOiBmdW5jdGlvbiAodmFsdWUsIGNvc3QpIHtcbiAgICAgIHZhciBpdGVtID0ge3ZhbHVlOiB2YWx1ZSwgY29zdDogY29zdH07XG4gICAgICB0aGlzLnF1ZXVlLnB1c2goaXRlbSk7XG4gICAgICB0aGlzLnF1ZXVlLnNvcnQodGhpcy5zb3J0ZXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIGhpZ2hlc3QgcHJpb3JpdHkgZWxlbWVudCBpbiB0aGUgcXVldWUuXG4gICAgICovXG4gICAgcG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZS5zaGlmdCgpO1xuICAgIH0sXG5cbiAgICBlbXB0eTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWUubGVuZ3RoID09PSAwO1xuICAgIH1cbiAgfVxufTtcblxuXG4vLyBub2RlLmpzIG1vZHVsZSBleHBvcnRzXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBkaWprc3RyYTtcbn1cbiIsImNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxuY29uc3QgTnVtZXJpY0RhdGEgPSByZXF1aXJlKCcuL251bWVyaWMtZGF0YScpXG5jb25zdCBBbHBoYW51bWVyaWNEYXRhID0gcmVxdWlyZSgnLi9hbHBoYW51bWVyaWMtZGF0YScpXG5jb25zdCBCeXRlRGF0YSA9IHJlcXVpcmUoJy4vYnl0ZS1kYXRhJylcbmNvbnN0IEthbmppRGF0YSA9IHJlcXVpcmUoJy4va2FuamktZGF0YScpXG5jb25zdCBSZWdleCA9IHJlcXVpcmUoJy4vcmVnZXgnKVxuY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcbmNvbnN0IGRpamtzdHJhID0gcmVxdWlyZSgnZGlqa3N0cmFqcycpXG5cbi8qKlxuICogUmV0dXJucyBVVEY4IGJ5dGUgbGVuZ3RoXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgSW5wdXQgc3RyaW5nXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICBOdW1iZXIgb2YgYnl0ZVxuICovXG5mdW5jdGlvbiBnZXRTdHJpbmdCeXRlTGVuZ3RoIChzdHIpIHtcbiAgcmV0dXJuIHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChzdHIpKS5sZW5ndGhcbn1cblxuLyoqXG4gKiBHZXQgYSBsaXN0IG9mIHNlZ21lbnRzIG9mIHRoZSBzcGVjaWZpZWQgbW9kZVxuICogZnJvbSBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSAge01vZGV9ICAgbW9kZSBTZWdtZW50IG1vZGVcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyICBTdHJpbmcgdG8gcHJvY2Vzc1xuICogQHJldHVybiB7QXJyYXl9ICAgICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqL1xuZnVuY3Rpb24gZ2V0U2VnbWVudHMgKHJlZ2V4LCBtb2RlLCBzdHIpIHtcbiAgY29uc3Qgc2VnbWVudHMgPSBbXVxuICBsZXQgcmVzdWx0XG5cbiAgd2hpbGUgKChyZXN1bHQgPSByZWdleC5leGVjKHN0cikpICE9PSBudWxsKSB7XG4gICAgc2VnbWVudHMucHVzaCh7XG4gICAgICBkYXRhOiByZXN1bHRbMF0sXG4gICAgICBpbmRleDogcmVzdWx0LmluZGV4LFxuICAgICAgbW9kZTogbW9kZSxcbiAgICAgIGxlbmd0aDogcmVzdWx0WzBdLmxlbmd0aFxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gc2VnbWVudHNcbn1cblxuLyoqXG4gKiBFeHRyYWN0cyBhIHNlcmllcyBvZiBzZWdtZW50cyB3aXRoIHRoZSBhcHByb3ByaWF0ZVxuICogbW9kZXMgZnJvbSBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YVN0ciBJbnB1dCBzdHJpbmdcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKi9cbmZ1bmN0aW9uIGdldFNlZ21lbnRzRnJvbVN0cmluZyAoZGF0YVN0cikge1xuICBjb25zdCBudW1TZWdzID0gZ2V0U2VnbWVudHMoUmVnZXguTlVNRVJJQywgTW9kZS5OVU1FUklDLCBkYXRhU3RyKVxuICBjb25zdCBhbHBoYU51bVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5BTFBIQU5VTUVSSUMsIE1vZGUuQUxQSEFOVU1FUklDLCBkYXRhU3RyKVxuICBsZXQgYnl0ZVNlZ3NcbiAgbGV0IGthbmppU2Vnc1xuXG4gIGlmIChVdGlscy5pc0thbmppTW9kZUVuYWJsZWQoKSkge1xuICAgIGJ5dGVTZWdzID0gZ2V0U2VnbWVudHMoUmVnZXguQllURSwgTW9kZS5CWVRFLCBkYXRhU3RyKVxuICAgIGthbmppU2VncyA9IGdldFNlZ21lbnRzKFJlZ2V4LktBTkpJLCBNb2RlLktBTkpJLCBkYXRhU3RyKVxuICB9IGVsc2Uge1xuICAgIGJ5dGVTZWdzID0gZ2V0U2VnbWVudHMoUmVnZXguQllURV9LQU5KSSwgTW9kZS5CWVRFLCBkYXRhU3RyKVxuICAgIGthbmppU2VncyA9IFtdXG4gIH1cblxuICBjb25zdCBzZWdzID0gbnVtU2Vncy5jb25jYXQoYWxwaGFOdW1TZWdzLCBieXRlU2Vncywga2FuamlTZWdzKVxuXG4gIHJldHVybiBzZWdzXG4gICAgLnNvcnQoZnVuY3Rpb24gKHMxLCBzMikge1xuICAgICAgcmV0dXJuIHMxLmluZGV4IC0gczIuaW5kZXhcbiAgICB9KVxuICAgIC5tYXAoZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YTogb2JqLmRhdGEsXG4gICAgICAgIG1vZGU6IG9iai5tb2RlLFxuICAgICAgICBsZW5ndGg6IG9iai5sZW5ndGhcbiAgICAgIH1cbiAgICB9KVxufVxuXG4vKipcbiAqIFJldHVybnMgaG93IG1hbnkgYml0cyBhcmUgbmVlZGVkIHRvIGVuY29kZSBhIHN0cmluZyBvZlxuICogc3BlY2lmaWVkIGxlbmd0aCB3aXRoIHRoZSBzcGVjaWZpZWQgbW9kZVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gbGVuZ3RoIFN0cmluZyBsZW5ndGhcbiAqIEBwYXJhbSAge01vZGV9IG1vZGUgICAgIFNlZ21lbnQgbW9kZVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgQml0IGxlbmd0aFxuICovXG5mdW5jdGlvbiBnZXRTZWdtZW50Qml0c0xlbmd0aCAobGVuZ3RoLCBtb2RlKSB7XG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgTW9kZS5OVU1FUklDOlxuICAgICAgcmV0dXJuIE51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGgobGVuZ3RoKVxuICAgIGNhc2UgTW9kZS5BTFBIQU5VTUVSSUM6XG4gICAgICByZXR1cm4gQWxwaGFudW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcbiAgICBjYXNlIE1vZGUuS0FOSkk6XG4gICAgICByZXR1cm4gS2FuamlEYXRhLmdldEJpdHNMZW5ndGgobGVuZ3RoKVxuICAgIGNhc2UgTW9kZS5CWVRFOlxuICAgICAgcmV0dXJuIEJ5dGVEYXRhLmdldEJpdHNMZW5ndGgobGVuZ3RoKVxuICB9XG59XG5cbi8qKlxuICogTWVyZ2VzIGFkamFjZW50IHNlZ21lbnRzIHdoaWNoIGhhdmUgdGhlIHNhbWUgbW9kZVxuICpcbiAqIEBwYXJhbSAge0FycmF5fSBzZWdzIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqL1xuZnVuY3Rpb24gbWVyZ2VTZWdtZW50cyAoc2Vncykge1xuICByZXR1cm4gc2Vncy5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgY3Vycikge1xuICAgIGNvbnN0IHByZXZTZWcgPSBhY2MubGVuZ3RoIC0gMSA+PSAwID8gYWNjW2FjYy5sZW5ndGggLSAxXSA6IG51bGxcbiAgICBpZiAocHJldlNlZyAmJiBwcmV2U2VnLm1vZGUgPT09IGN1cnIubW9kZSkge1xuICAgICAgYWNjW2FjYy5sZW5ndGggLSAxXS5kYXRhICs9IGN1cnIuZGF0YVxuICAgICAgcmV0dXJuIGFjY1xuICAgIH1cblxuICAgIGFjYy5wdXNoKGN1cnIpXG4gICAgcmV0dXJuIGFjY1xuICB9LCBbXSlcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBsaXN0IG9mIGFsbCBwb3NzaWJsZSBub2RlcyBjb21iaW5hdGlvbiB3aGljaFxuICogd2lsbCBiZSB1c2VkIHRvIGJ1aWxkIGEgc2VnbWVudHMgZ3JhcGguXG4gKlxuICogTm9kZXMgYXJlIGRpdmlkZWQgYnkgZ3JvdXBzLiBFYWNoIGdyb3VwIHdpbGwgY29udGFpbiBhIGxpc3Qgb2YgYWxsIHRoZSBtb2Rlc1xuICogaW4gd2hpY2ggaXMgcG9zc2libGUgdG8gZW5jb2RlIHRoZSBnaXZlbiB0ZXh0LlxuICpcbiAqIEZvciBleGFtcGxlIHRoZSB0ZXh0ICcxMjM0NScgY2FuIGJlIGVuY29kZWQgYXMgTnVtZXJpYywgQWxwaGFudW1lcmljIG9yIEJ5dGUuXG4gKiBUaGUgZ3JvdXAgZm9yICcxMjM0NScgd2lsbCBjb250YWluIHRoZW4gMyBvYmplY3RzLCBvbmUgZm9yIGVhY2hcbiAqIHBvc3NpYmxlIGVuY29kaW5nIG1vZGUuXG4gKlxuICogRWFjaCBub2RlIHJlcHJlc2VudHMgYSBwb3NzaWJsZSBzZWdtZW50LlxuICpcbiAqIEBwYXJhbSAge0FycmF5fSBzZWdzIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqL1xuZnVuY3Rpb24gYnVpbGROb2RlcyAoc2Vncykge1xuICBjb25zdCBub2RlcyA9IFtdXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2Vncy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHNlZyA9IHNlZ3NbaV1cblxuICAgIHN3aXRjaCAoc2VnLm1vZGUpIHtcbiAgICAgIGNhc2UgTW9kZS5OVU1FUklDOlxuICAgICAgICBub2Rlcy5wdXNoKFtzZWcsXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5BTFBIQU5VTUVSSUMsIGxlbmd0aDogc2VnLmxlbmd0aCB9LFxuICAgICAgICAgIHsgZGF0YTogc2VnLmRhdGEsIG1vZGU6IE1vZGUuQllURSwgbGVuZ3RoOiBzZWcubGVuZ3RoIH1cbiAgICAgICAgXSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgTW9kZS5BTFBIQU5VTUVSSUM6XG4gICAgICAgIG5vZGVzLnB1c2goW3NlZyxcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkJZVEUsIGxlbmd0aDogc2VnLmxlbmd0aCB9XG4gICAgICAgIF0pXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIE1vZGUuS0FOSkk6XG4gICAgICAgIG5vZGVzLnB1c2goW3NlZyxcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkJZVEUsIGxlbmd0aDogZ2V0U3RyaW5nQnl0ZUxlbmd0aChzZWcuZGF0YSkgfVxuICAgICAgICBdKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBNb2RlLkJZVEU6XG4gICAgICAgIG5vZGVzLnB1c2goW1xuICAgICAgICAgIHsgZGF0YTogc2VnLmRhdGEsIG1vZGU6IE1vZGUuQllURSwgbGVuZ3RoOiBnZXRTdHJpbmdCeXRlTGVuZ3RoKHNlZy5kYXRhKSB9XG4gICAgICAgIF0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5vZGVzXG59XG5cbi8qKlxuICogQnVpbGRzIGEgZ3JhcGggZnJvbSBhIGxpc3Qgb2Ygbm9kZXMuXG4gKiBBbGwgc2VnbWVudHMgaW4gZWFjaCBub2RlIGdyb3VwIHdpbGwgYmUgY29ubmVjdGVkIHdpdGggYWxsIHRoZSBzZWdtZW50cyBvZlxuICogdGhlIG5leHQgZ3JvdXAgYW5kIHNvIG9uLlxuICpcbiAqIEF0IGVhY2ggY29ubmVjdGlvbiB3aWxsIGJlIGFzc2lnbmVkIGEgd2VpZ2h0IGRlcGVuZGluZyBvbiB0aGVcbiAqIHNlZ21lbnQncyBieXRlIGxlbmd0aC5cbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gbm9kZXMgICAgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgIEdyYXBoIG9mIGFsbCBwb3NzaWJsZSBzZWdtZW50c1xuICovXG5mdW5jdGlvbiBidWlsZEdyYXBoIChub2RlcywgdmVyc2lvbikge1xuICBjb25zdCB0YWJsZSA9IHt9XG4gIGNvbnN0IGdyYXBoID0geyBzdGFydDoge30gfVxuICBsZXQgcHJldk5vZGVJZHMgPSBbJ3N0YXJ0J11cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgbm9kZUdyb3VwID0gbm9kZXNbaV1cbiAgICBjb25zdCBjdXJyZW50Tm9kZUlkcyA9IFtdXG5cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVHcm91cC5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3Qgbm9kZSA9IG5vZGVHcm91cFtqXVxuICAgICAgY29uc3Qga2V5ID0gJycgKyBpICsgalxuXG4gICAgICBjdXJyZW50Tm9kZUlkcy5wdXNoKGtleSlcbiAgICAgIHRhYmxlW2tleV0gPSB7IG5vZGU6IG5vZGUsIGxhc3RDb3VudDogMCB9XG4gICAgICBncmFwaFtrZXldID0ge31cblxuICAgICAgZm9yIChsZXQgbiA9IDA7IG4gPCBwcmV2Tm9kZUlkcy5sZW5ndGg7IG4rKykge1xuICAgICAgICBjb25zdCBwcmV2Tm9kZUlkID0gcHJldk5vZGVJZHNbbl1cblxuICAgICAgICBpZiAodGFibGVbcHJldk5vZGVJZF0gJiYgdGFibGVbcHJldk5vZGVJZF0ubm9kZS5tb2RlID09PSBub2RlLm1vZGUpIHtcbiAgICAgICAgICBncmFwaFtwcmV2Tm9kZUlkXVtrZXldID1cbiAgICAgICAgICAgIGdldFNlZ21lbnRCaXRzTGVuZ3RoKHRhYmxlW3ByZXZOb2RlSWRdLmxhc3RDb3VudCArIG5vZGUubGVuZ3RoLCBub2RlLm1vZGUpIC1cbiAgICAgICAgICAgIGdldFNlZ21lbnRCaXRzTGVuZ3RoKHRhYmxlW3ByZXZOb2RlSWRdLmxhc3RDb3VudCwgbm9kZS5tb2RlKVxuXG4gICAgICAgICAgdGFibGVbcHJldk5vZGVJZF0ubGFzdENvdW50ICs9IG5vZGUubGVuZ3RoXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRhYmxlW3ByZXZOb2RlSWRdKSB0YWJsZVtwcmV2Tm9kZUlkXS5sYXN0Q291bnQgPSBub2RlLmxlbmd0aFxuXG4gICAgICAgICAgZ3JhcGhbcHJldk5vZGVJZF1ba2V5XSA9IGdldFNlZ21lbnRCaXRzTGVuZ3RoKG5vZGUubGVuZ3RoLCBub2RlLm1vZGUpICtcbiAgICAgICAgICAgIDQgKyBNb2RlLmdldENoYXJDb3VudEluZGljYXRvcihub2RlLm1vZGUsIHZlcnNpb24pIC8vIHN3aXRjaCBjb3N0XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBwcmV2Tm9kZUlkcyA9IGN1cnJlbnROb2RlSWRzXG4gIH1cblxuICBmb3IgKGxldCBuID0gMDsgbiA8IHByZXZOb2RlSWRzLmxlbmd0aDsgbisrKSB7XG4gICAgZ3JhcGhbcHJldk5vZGVJZHNbbl1dLmVuZCA9IDBcbiAgfVxuXG4gIHJldHVybiB7IG1hcDogZ3JhcGgsIHRhYmxlOiB0YWJsZSB9XG59XG5cbi8qKlxuICogQnVpbGRzIGEgc2VnbWVudCBmcm9tIGEgc3BlY2lmaWVkIGRhdGEgYW5kIG1vZGUuXG4gKiBJZiBhIG1vZGUgaXMgbm90IHNwZWNpZmllZCwgdGhlIG1vcmUgc3VpdGFibGUgd2lsbCBiZSB1c2VkLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YSAgICAgICAgICAgICBJbnB1dCBkYXRhXG4gKiBAcGFyYW0gIHtNb2RlIHwgU3RyaW5nfSBtb2Rlc0hpbnQgRGF0YSBtb2RlXG4gKiBAcmV0dXJuIHtTZWdtZW50fSAgICAgICAgICAgICAgICAgU2VnbWVudFxuICovXG5mdW5jdGlvbiBidWlsZFNpbmdsZVNlZ21lbnQgKGRhdGEsIG1vZGVzSGludCkge1xuICBsZXQgbW9kZVxuICBjb25zdCBiZXN0TW9kZSA9IE1vZGUuZ2V0QmVzdE1vZGVGb3JEYXRhKGRhdGEpXG5cbiAgbW9kZSA9IE1vZGUuZnJvbShtb2Rlc0hpbnQsIGJlc3RNb2RlKVxuXG4gIC8vIE1ha2Ugc3VyZSBkYXRhIGNhbiBiZSBlbmNvZGVkXG4gIGlmIChtb2RlICE9PSBNb2RlLkJZVEUgJiYgbW9kZS5iaXQgPCBiZXN0TW9kZS5iaXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1wiJyArIGRhdGEgKyAnXCInICtcbiAgICAgICcgY2Fubm90IGJlIGVuY29kZWQgd2l0aCBtb2RlICcgKyBNb2RlLnRvU3RyaW5nKG1vZGUpICtcbiAgICAgICcuXFxuIFN1Z2dlc3RlZCBtb2RlIGlzOiAnICsgTW9kZS50b1N0cmluZyhiZXN0TW9kZSkpXG4gIH1cblxuICAvLyBVc2UgTW9kZS5CWVRFIGlmIEthbmppIHN1cHBvcnQgaXMgZGlzYWJsZWRcbiAgaWYgKG1vZGUgPT09IE1vZGUuS0FOSkkgJiYgIVV0aWxzLmlzS2FuamlNb2RlRW5hYmxlZCgpKSB7XG4gICAgbW9kZSA9IE1vZGUuQllURVxuICB9XG5cbiAgc3dpdGNoIChtb2RlKSB7XG4gICAgY2FzZSBNb2RlLk5VTUVSSUM6XG4gICAgICByZXR1cm4gbmV3IE51bWVyaWNEYXRhKGRhdGEpXG5cbiAgICBjYXNlIE1vZGUuQUxQSEFOVU1FUklDOlxuICAgICAgcmV0dXJuIG5ldyBBbHBoYW51bWVyaWNEYXRhKGRhdGEpXG5cbiAgICBjYXNlIE1vZGUuS0FOSkk6XG4gICAgICByZXR1cm4gbmV3IEthbmppRGF0YShkYXRhKVxuXG4gICAgY2FzZSBNb2RlLkJZVEU6XG4gICAgICByZXR1cm4gbmV3IEJ5dGVEYXRhKGRhdGEpXG4gIH1cbn1cblxuLyoqXG4gKiBCdWlsZHMgYSBsaXN0IG9mIHNlZ21lbnRzIGZyb20gYW4gYXJyYXkuXG4gKiBBcnJheSBjYW4gY29udGFpbiBTdHJpbmdzIG9yIE9iamVjdHMgd2l0aCBzZWdtZW50J3MgaW5mby5cbiAqXG4gKiBGb3IgZWFjaCBpdGVtIHdoaWNoIGlzIGEgc3RyaW5nLCB3aWxsIGJlIGdlbmVyYXRlZCBhIHNlZ21lbnQgd2l0aCB0aGUgZ2l2ZW5cbiAqIHN0cmluZyBhbmQgdGhlIG1vcmUgYXBwcm9wcmlhdGUgZW5jb2RpbmcgbW9kZS5cbiAqXG4gKiBGb3IgZWFjaCBpdGVtIHdoaWNoIGlzIGFuIG9iamVjdCwgd2lsbCBiZSBnZW5lcmF0ZWQgYSBzZWdtZW50IHdpdGggdGhlIGdpdmVuXG4gKiBkYXRhIGFuZCBtb2RlLlxuICogT2JqZWN0cyBtdXN0IGNvbnRhaW4gYXQgbGVhc3QgdGhlIHByb3BlcnR5IFwiZGF0YVwiLlxuICogSWYgcHJvcGVydHkgXCJtb2RlXCIgaXMgbm90IHByZXNlbnQsIHRoZSBtb3JlIHN1aXRhYmxlIG1vZGUgd2lsbCBiZSB1c2VkLlxuICpcbiAqIEBwYXJhbSAge0FycmF5fSBhcnJheSBBcnJheSBvZiBvYmplY3RzIHdpdGggc2VnbWVudHMgZGF0YVxuICogQHJldHVybiB7QXJyYXl9ICAgICAgIEFycmF5IG9mIFNlZ21lbnRzXG4gKi9cbmV4cG9ydHMuZnJvbUFycmF5ID0gZnVuY3Rpb24gZnJvbUFycmF5IChhcnJheSkge1xuICByZXR1cm4gYXJyYXkucmVkdWNlKGZ1bmN0aW9uIChhY2MsIHNlZykge1xuICAgIGlmICh0eXBlb2Ygc2VnID09PSAnc3RyaW5nJykge1xuICAgICAgYWNjLnB1c2goYnVpbGRTaW5nbGVTZWdtZW50KHNlZywgbnVsbCkpXG4gICAgfSBlbHNlIGlmIChzZWcuZGF0YSkge1xuICAgICAgYWNjLnB1c2goYnVpbGRTaW5nbGVTZWdtZW50KHNlZy5kYXRhLCBzZWcubW9kZSkpXG4gICAgfVxuXG4gICAgcmV0dXJuIGFjY1xuICB9LCBbXSlcbn1cblxuLyoqXG4gKiBCdWlsZHMgYW4gb3B0aW1pemVkIHNlcXVlbmNlIG9mIHNlZ21lbnRzIGZyb20gYSBzdHJpbmcsXG4gKiB3aGljaCB3aWxsIHByb2R1Y2UgdGhlIHNob3J0ZXN0IHBvc3NpYmxlIGJpdHN0cmVhbS5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGEgICAgSW5wdXQgc3RyaW5nXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgQXJyYXkgb2Ygc2VnbWVudHNcbiAqL1xuZXhwb3J0cy5mcm9tU3RyaW5nID0gZnVuY3Rpb24gZnJvbVN0cmluZyAoZGF0YSwgdmVyc2lvbikge1xuICBjb25zdCBzZWdzID0gZ2V0U2VnbWVudHNGcm9tU3RyaW5nKGRhdGEsIFV0aWxzLmlzS2FuamlNb2RlRW5hYmxlZCgpKVxuXG4gIGNvbnN0IG5vZGVzID0gYnVpbGROb2RlcyhzZWdzKVxuICBjb25zdCBncmFwaCA9IGJ1aWxkR3JhcGgobm9kZXMsIHZlcnNpb24pXG4gIGNvbnN0IHBhdGggPSBkaWprc3RyYS5maW5kX3BhdGgoZ3JhcGgubWFwLCAnc3RhcnQnLCAnZW5kJylcblxuICBjb25zdCBvcHRpbWl6ZWRTZWdzID0gW11cbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBwYXRoLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIG9wdGltaXplZFNlZ3MucHVzaChncmFwaC50YWJsZVtwYXRoW2ldXS5ub2RlKVxuICB9XG5cbiAgcmV0dXJuIGV4cG9ydHMuZnJvbUFycmF5KG1lcmdlU2VnbWVudHMob3B0aW1pemVkU2VncykpXG59XG5cbi8qKlxuICogU3BsaXRzIGEgc3RyaW5nIGluIHZhcmlvdXMgc2VnbWVudHMgd2l0aCB0aGUgbW9kZXMgd2hpY2hcbiAqIGJlc3QgcmVwcmVzZW50IHRoZWlyIGNvbnRlbnQuXG4gKiBUaGUgcHJvZHVjZWQgc2VnbWVudHMgYXJlIGZhciBmcm9tIGJlaW5nIG9wdGltaXplZC5cbiAqIFRoZSBvdXRwdXQgb2YgdGhpcyBmdW5jdGlvbiBpcyBvbmx5IHVzZWQgdG8gZXN0aW1hdGUgYSBRUiBDb2RlIHZlcnNpb25cbiAqIHdoaWNoIG1heSBjb250YWluIHRoZSBkYXRhLlxuICpcbiAqIEBwYXJhbSAge3N0cmluZ30gZGF0YSBJbnB1dCBzdHJpbmdcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICBBcnJheSBvZiBzZWdtZW50c1xuICovXG5leHBvcnRzLnJhd1NwbGl0ID0gZnVuY3Rpb24gcmF3U3BsaXQgKGRhdGEpIHtcbiAgcmV0dXJuIGV4cG9ydHMuZnJvbUFycmF5KFxuICAgIGdldFNlZ21lbnRzRnJvbVN0cmluZyhkYXRhLCBVdGlscy5pc0thbmppTW9kZUVuYWJsZWQoKSlcbiAgKVxufVxuIiwiY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcbmNvbnN0IEVDTGV2ZWwgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwnKVxuY29uc3QgQml0QnVmZmVyID0gcmVxdWlyZSgnLi9iaXQtYnVmZmVyJylcbmNvbnN0IEJpdE1hdHJpeCA9IHJlcXVpcmUoJy4vYml0LW1hdHJpeCcpXG5jb25zdCBBbGlnbm1lbnRQYXR0ZXJuID0gcmVxdWlyZSgnLi9hbGlnbm1lbnQtcGF0dGVybicpXG5jb25zdCBGaW5kZXJQYXR0ZXJuID0gcmVxdWlyZSgnLi9maW5kZXItcGF0dGVybicpXG5jb25zdCBNYXNrUGF0dGVybiA9IHJlcXVpcmUoJy4vbWFzay1wYXR0ZXJuJylcbmNvbnN0IEVDQ29kZSA9IHJlcXVpcmUoJy4vZXJyb3ItY29ycmVjdGlvbi1jb2RlJylcbmNvbnN0IFJlZWRTb2xvbW9uRW5jb2RlciA9IHJlcXVpcmUoJy4vcmVlZC1zb2xvbW9uLWVuY29kZXInKVxuY29uc3QgVmVyc2lvbiA9IHJlcXVpcmUoJy4vdmVyc2lvbicpXG5jb25zdCBGb3JtYXRJbmZvID0gcmVxdWlyZSgnLi9mb3JtYXQtaW5mbycpXG5jb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcbmNvbnN0IFNlZ21lbnRzID0gcmVxdWlyZSgnLi9zZWdtZW50cycpXG5cbi8qKlxuICogUVJDb2RlIGZvciBKYXZhU2NyaXB0XG4gKlxuICogbW9kaWZpZWQgYnkgUnlhbiBEYXkgZm9yIG5vZGVqcyBzdXBwb3J0XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEgUnlhbiBEYXlcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiAgIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKlxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFFSQ29kZSBmb3IgSmF2YVNjcmlwdFxuLy9cbi8vIENvcHlyaWdodCAoYykgMjAwOSBLYXp1aGlrbyBBcmFzZVxuLy9cbi8vIFVSTDogaHR0cDovL3d3dy5kLXByb2plY3QuY29tL1xuLy9cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbi8vICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbi8vXG4vLyBUaGUgd29yZCBcIlFSIENvZGVcIiBpcyByZWdpc3RlcmVkIHRyYWRlbWFyayBvZlxuLy8gREVOU08gV0FWRSBJTkNPUlBPUkFURURcbi8vICAgaHR0cDovL3d3dy5kZW5zby13YXZlLmNvbS9xcmNvZGUvZmFxcGF0ZW50LWUuaHRtbFxuLy9cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qL1xuXG4vKipcbiAqIEFkZCBmaW5kZXIgcGF0dGVybnMgYml0cyB0byBtYXRyaXhcbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCAgTW9kdWxlcyBtYXRyaXhcbiAqIEBwYXJhbSAge051bWJlcn0gICAgdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqL1xuZnVuY3Rpb24gc2V0dXBGaW5kZXJQYXR0ZXJuIChtYXRyaXgsIHZlcnNpb24pIHtcbiAgY29uc3Qgc2l6ZSA9IG1hdHJpeC5zaXplXG4gIGNvbnN0IHBvcyA9IEZpbmRlclBhdHRlcm4uZ2V0UG9zaXRpb25zKHZlcnNpb24pXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3MubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByb3cgPSBwb3NbaV1bMF1cbiAgICBjb25zdCBjb2wgPSBwb3NbaV1bMV1cblxuICAgIGZvciAobGV0IHIgPSAtMTsgciA8PSA3OyByKyspIHtcbiAgICAgIGlmIChyb3cgKyByIDw9IC0xIHx8IHNpemUgPD0gcm93ICsgcikgY29udGludWVcblxuICAgICAgZm9yIChsZXQgYyA9IC0xOyBjIDw9IDc7IGMrKykge1xuICAgICAgICBpZiAoY29sICsgYyA8PSAtMSB8fCBzaXplIDw9IGNvbCArIGMpIGNvbnRpbnVlXG5cbiAgICAgICAgaWYgKChyID49IDAgJiYgciA8PSA2ICYmIChjID09PSAwIHx8IGMgPT09IDYpKSB8fFxuICAgICAgICAgIChjID49IDAgJiYgYyA8PSA2ICYmIChyID09PSAwIHx8IHIgPT09IDYpKSB8fFxuICAgICAgICAgIChyID49IDIgJiYgciA8PSA0ICYmIGMgPj0gMiAmJiBjIDw9IDQpKSB7XG4gICAgICAgICAgbWF0cml4LnNldChyb3cgKyByLCBjb2wgKyBjLCB0cnVlLCB0cnVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1hdHJpeC5zZXQocm93ICsgciwgY29sICsgYywgZmFsc2UsIHRydWUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBZGQgdGltaW5nIHBhdHRlcm4gYml0cyB0byBtYXRyaXhcbiAqXG4gKiBOb3RlOiB0aGlzIGZ1bmN0aW9uIG11c3QgYmUgY2FsbGVkIGJlZm9yZSB7QGxpbmsgc2V0dXBBbGlnbm1lbnRQYXR0ZXJufVxuICpcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gbWF0cml4IE1vZHVsZXMgbWF0cml4XG4gKi9cbmZ1bmN0aW9uIHNldHVwVGltaW5nUGF0dGVybiAobWF0cml4KSB7XG4gIGNvbnN0IHNpemUgPSBtYXRyaXguc2l6ZVxuXG4gIGZvciAobGV0IHIgPSA4OyByIDwgc2l6ZSAtIDg7IHIrKykge1xuICAgIGNvbnN0IHZhbHVlID0gciAlIDIgPT09IDBcbiAgICBtYXRyaXguc2V0KHIsIDYsIHZhbHVlLCB0cnVlKVxuICAgIG1hdHJpeC5zZXQoNiwgciwgdmFsdWUsIHRydWUpXG4gIH1cbn1cblxuLyoqXG4gKiBBZGQgYWxpZ25tZW50IHBhdHRlcm5zIGJpdHMgdG8gbWF0cml4XG4gKlxuICogTm90ZTogdGhpcyBmdW5jdGlvbiBtdXN0IGJlIGNhbGxlZCBhZnRlciB7QGxpbmsgc2V0dXBUaW1pbmdQYXR0ZXJufVxuICpcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gbWF0cml4ICBNb2R1bGVzIG1hdHJpeFxuICogQHBhcmFtICB7TnVtYmVyfSAgICB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICovXG5mdW5jdGlvbiBzZXR1cEFsaWdubWVudFBhdHRlcm4gKG1hdHJpeCwgdmVyc2lvbikge1xuICBjb25zdCBwb3MgPSBBbGlnbm1lbnRQYXR0ZXJuLmdldFBvc2l0aW9ucyh2ZXJzaW9uKVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgcm93ID0gcG9zW2ldWzBdXG4gICAgY29uc3QgY29sID0gcG9zW2ldWzFdXG5cbiAgICBmb3IgKGxldCByID0gLTI7IHIgPD0gMjsgcisrKSB7XG4gICAgICBmb3IgKGxldCBjID0gLTI7IGMgPD0gMjsgYysrKSB7XG4gICAgICAgIGlmIChyID09PSAtMiB8fCByID09PSAyIHx8IGMgPT09IC0yIHx8IGMgPT09IDIgfHxcbiAgICAgICAgICAociA9PT0gMCAmJiBjID09PSAwKSkge1xuICAgICAgICAgIG1hdHJpeC5zZXQocm93ICsgciwgY29sICsgYywgdHJ1ZSwgdHJ1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdyArIHIsIGNvbCArIGMsIGZhbHNlLCB0cnVlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWRkIHZlcnNpb24gaW5mbyBiaXRzIHRvIG1hdHJpeFxuICpcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gbWF0cml4ICBNb2R1bGVzIG1hdHJpeFxuICogQHBhcmFtICB7TnVtYmVyfSAgICB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICovXG5mdW5jdGlvbiBzZXR1cFZlcnNpb25JbmZvIChtYXRyaXgsIHZlcnNpb24pIHtcbiAgY29uc3Qgc2l6ZSA9IG1hdHJpeC5zaXplXG4gIGNvbnN0IGJpdHMgPSBWZXJzaW9uLmdldEVuY29kZWRCaXRzKHZlcnNpb24pXG4gIGxldCByb3csIGNvbCwgbW9kXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxODsgaSsrKSB7XG4gICAgcm93ID0gTWF0aC5mbG9vcihpIC8gMylcbiAgICBjb2wgPSBpICUgMyArIHNpemUgLSA4IC0gM1xuICAgIG1vZCA9ICgoYml0cyA+PiBpKSAmIDEpID09PSAxXG5cbiAgICBtYXRyaXguc2V0KHJvdywgY29sLCBtb2QsIHRydWUpXG4gICAgbWF0cml4LnNldChjb2wsIHJvdywgbW9kLCB0cnVlKVxuICB9XG59XG5cbi8qKlxuICogQWRkIGZvcm1hdCBpbmZvIGJpdHMgdG8gbWF0cml4XG4gKlxuICogQHBhcmFtICB7Qml0TWF0cml4fSBtYXRyaXggICAgICAgICAgICAgICBNb2R1bGVzIG1hdHJpeFxuICogQHBhcmFtICB7RXJyb3JDb3JyZWN0aW9uTGV2ZWx9ICAgIGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEBwYXJhbSAge051bWJlcn0gICAgbWFza1BhdHRlcm4gICAgICAgICAgTWFzayBwYXR0ZXJuIHJlZmVyZW5jZSB2YWx1ZVxuICovXG5mdW5jdGlvbiBzZXR1cEZvcm1hdEluZm8gKG1hdHJpeCwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2tQYXR0ZXJuKSB7XG4gIGNvbnN0IHNpemUgPSBtYXRyaXguc2l6ZVxuICBjb25zdCBiaXRzID0gRm9ybWF0SW5mby5nZXRFbmNvZGVkQml0cyhlcnJvckNvcnJlY3Rpb25MZXZlbCwgbWFza1BhdHRlcm4pXG4gIGxldCBpLCBtb2RcblxuICBmb3IgKGkgPSAwOyBpIDwgMTU7IGkrKykge1xuICAgIG1vZCA9ICgoYml0cyA+PiBpKSAmIDEpID09PSAxXG5cbiAgICAvLyB2ZXJ0aWNhbFxuICAgIGlmIChpIDwgNikge1xuICAgICAgbWF0cml4LnNldChpLCA4LCBtb2QsIHRydWUpXG4gICAgfSBlbHNlIGlmIChpIDwgOCkge1xuICAgICAgbWF0cml4LnNldChpICsgMSwgOCwgbW9kLCB0cnVlKVxuICAgIH0gZWxzZSB7XG4gICAgICBtYXRyaXguc2V0KHNpemUgLSAxNSArIGksIDgsIG1vZCwgdHJ1ZSlcbiAgICB9XG5cbiAgICAvLyBob3Jpem9udGFsXG4gICAgaWYgKGkgPCA4KSB7XG4gICAgICBtYXRyaXguc2V0KDgsIHNpemUgLSBpIC0gMSwgbW9kLCB0cnVlKVxuICAgIH0gZWxzZSBpZiAoaSA8IDkpIHtcbiAgICAgIG1hdHJpeC5zZXQoOCwgMTUgLSBpIC0gMSArIDEsIG1vZCwgdHJ1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgbWF0cml4LnNldCg4LCAxNSAtIGkgLSAxLCBtb2QsIHRydWUpXG4gICAgfVxuICB9XG5cbiAgLy8gZml4ZWQgbW9kdWxlXG4gIG1hdHJpeC5zZXQoc2l6ZSAtIDgsIDgsIDEsIHRydWUpXG59XG5cbi8qKlxuICogQWRkIGVuY29kZWQgZGF0YSBiaXRzIHRvIG1hdHJpeFxuICpcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gIG1hdHJpeCBNb2R1bGVzIG1hdHJpeFxuICogQHBhcmFtICB7VWludDhBcnJheX0gZGF0YSAgIERhdGEgY29kZXdvcmRzXG4gKi9cbmZ1bmN0aW9uIHNldHVwRGF0YSAobWF0cml4LCBkYXRhKSB7XG4gIGNvbnN0IHNpemUgPSBtYXRyaXguc2l6ZVxuICBsZXQgaW5jID0gLTFcbiAgbGV0IHJvdyA9IHNpemUgLSAxXG4gIGxldCBiaXRJbmRleCA9IDdcbiAgbGV0IGJ5dGVJbmRleCA9IDBcblxuICBmb3IgKGxldCBjb2wgPSBzaXplIC0gMTsgY29sID4gMDsgY29sIC09IDIpIHtcbiAgICBpZiAoY29sID09PSA2KSBjb2wtLVxuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgMjsgYysrKSB7XG4gICAgICAgIGlmICghbWF0cml4LmlzUmVzZXJ2ZWQocm93LCBjb2wgLSBjKSkge1xuICAgICAgICAgIGxldCBkYXJrID0gZmFsc2VcblxuICAgICAgICAgIGlmIChieXRlSW5kZXggPCBkYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgZGFyayA9ICgoKGRhdGFbYnl0ZUluZGV4XSA+Pj4gYml0SW5kZXgpICYgMSkgPT09IDEpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbWF0cml4LnNldChyb3csIGNvbCAtIGMsIGRhcmspXG4gICAgICAgICAgYml0SW5kZXgtLVxuXG4gICAgICAgICAgaWYgKGJpdEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgYnl0ZUluZGV4KytcbiAgICAgICAgICAgIGJpdEluZGV4ID0gN1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByb3cgKz0gaW5jXG5cbiAgICAgIGlmIChyb3cgPCAwIHx8IHNpemUgPD0gcm93KSB7XG4gICAgICAgIHJvdyAtPSBpbmNcbiAgICAgICAgaW5jID0gLWluY1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZSBlbmNvZGVkIGNvZGV3b3JkcyBmcm9tIGRhdGEgaW5wdXRcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcGFyYW0gIHtFcnJvckNvcnJlY3Rpb25MZXZlbH0gICBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKiBAcGFyYW0gIHtCeXRlRGF0YX0gZGF0YSAgICAgICAgICAgICAgICAgRGF0YSBpbnB1dFxuICogQHJldHVybiB7VWludDhBcnJheX0gICAgICAgICAgICAgICAgICAgIEJ1ZmZlciBjb250YWluaW5nIGVuY29kZWQgY29kZXdvcmRzXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZURhdGEgKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBzZWdtZW50cykge1xuICAvLyBQcmVwYXJlIGRhdGEgYnVmZmVyXG4gIGNvbnN0IGJ1ZmZlciA9IG5ldyBCaXRCdWZmZXIoKVxuXG4gIHNlZ21lbnRzLmZvckVhY2goZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAvLyBwcmVmaXggZGF0YSB3aXRoIG1vZGUgaW5kaWNhdG9yICg0IGJpdHMpXG4gICAgYnVmZmVyLnB1dChkYXRhLm1vZGUuYml0LCA0KVxuXG4gICAgLy8gUHJlZml4IGRhdGEgd2l0aCBjaGFyYWN0ZXIgY291bnQgaW5kaWNhdG9yLlxuICAgIC8vIFRoZSBjaGFyYWN0ZXIgY291bnQgaW5kaWNhdG9yIGlzIGEgc3RyaW5nIG9mIGJpdHMgdGhhdCByZXByZXNlbnRzIHRoZVxuICAgIC8vIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgYXJlIGJlaW5nIGVuY29kZWQuXG4gICAgLy8gVGhlIGNoYXJhY3RlciBjb3VudCBpbmRpY2F0b3IgbXVzdCBiZSBwbGFjZWQgYWZ0ZXIgdGhlIG1vZGUgaW5kaWNhdG9yXG4gICAgLy8gYW5kIG11c3QgYmUgYSBjZXJ0YWluIG51bWJlciBvZiBiaXRzIGxvbmcsIGRlcGVuZGluZyBvbiB0aGUgUVIgdmVyc2lvblxuICAgIC8vIGFuZCBkYXRhIG1vZGVcbiAgICAvLyBAc2VlIHtAbGluayBNb2RlLmdldENoYXJDb3VudEluZGljYXRvcn0uXG4gICAgYnVmZmVyLnB1dChkYXRhLmdldExlbmd0aCgpLCBNb2RlLmdldENoYXJDb3VudEluZGljYXRvcihkYXRhLm1vZGUsIHZlcnNpb24pKVxuXG4gICAgLy8gYWRkIGJpbmFyeSBkYXRhIHNlcXVlbmNlIHRvIGJ1ZmZlclxuICAgIGRhdGEud3JpdGUoYnVmZmVyKVxuICB9KVxuXG4gIC8vIENhbGN1bGF0ZSByZXF1aXJlZCBudW1iZXIgb2YgYml0c1xuICBjb25zdCB0b3RhbENvZGV3b3JkcyA9IFV0aWxzLmdldFN5bWJvbFRvdGFsQ29kZXdvcmRzKHZlcnNpb24pXG4gIGNvbnN0IGVjVG90YWxDb2Rld29yZHMgPSBFQ0NvZGUuZ2V0VG90YWxDb2Rld29yZHNDb3VudCh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcbiAgY29uc3QgZGF0YVRvdGFsQ29kZXdvcmRzQml0cyA9ICh0b3RhbENvZGV3b3JkcyAtIGVjVG90YWxDb2Rld29yZHMpICogOFxuXG4gIC8vIEFkZCBhIHRlcm1pbmF0b3IuXG4gIC8vIElmIHRoZSBiaXQgc3RyaW5nIGlzIHNob3J0ZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIHJlcXVpcmVkIGJpdHMsXG4gIC8vIGEgdGVybWluYXRvciBvZiB1cCB0byBmb3VyIDBzIG11c3QgYmUgYWRkZWQgdG8gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIHN0cmluZy5cbiAgLy8gSWYgdGhlIGJpdCBzdHJpbmcgaXMgbW9yZSB0aGFuIGZvdXIgYml0cyBzaG9ydGVyIHRoYW4gdGhlIHJlcXVpcmVkIG51bWJlciBvZiBiaXRzLFxuICAvLyBhZGQgZm91ciAwcyB0byB0aGUgZW5kLlxuICBpZiAoYnVmZmVyLmdldExlbmd0aEluQml0cygpICsgNCA8PSBkYXRhVG90YWxDb2Rld29yZHNCaXRzKSB7XG4gICAgYnVmZmVyLnB1dCgwLCA0KVxuICB9XG5cbiAgLy8gSWYgdGhlIGJpdCBzdHJpbmcgaXMgZmV3ZXIgdGhhbiBmb3VyIGJpdHMgc2hvcnRlciwgYWRkIG9ubHkgdGhlIG51bWJlciBvZiAwcyB0aGF0XG4gIC8vIGFyZSBuZWVkZWQgdG8gcmVhY2ggdGhlIHJlcXVpcmVkIG51bWJlciBvZiBiaXRzLlxuXG4gIC8vIEFmdGVyIGFkZGluZyB0aGUgdGVybWluYXRvciwgaWYgdGhlIG51bWJlciBvZiBiaXRzIGluIHRoZSBzdHJpbmcgaXMgbm90IGEgbXVsdGlwbGUgb2YgOCxcbiAgLy8gcGFkIHRoZSBzdHJpbmcgb24gdGhlIHJpZ2h0IHdpdGggMHMgdG8gbWFrZSB0aGUgc3RyaW5nJ3MgbGVuZ3RoIGEgbXVsdGlwbGUgb2YgOC5cbiAgd2hpbGUgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSAlIDggIT09IDApIHtcbiAgICBidWZmZXIucHV0Qml0KDApXG4gIH1cblxuICAvLyBBZGQgcGFkIGJ5dGVzIGlmIHRoZSBzdHJpbmcgaXMgc3RpbGwgc2hvcnRlciB0aGFuIHRoZSB0b3RhbCBudW1iZXIgb2YgcmVxdWlyZWQgYml0cy5cbiAgLy8gRXh0ZW5kIHRoZSBidWZmZXIgdG8gZmlsbCB0aGUgZGF0YSBjYXBhY2l0eSBvZiB0aGUgc3ltYm9sIGNvcnJlc3BvbmRpbmcgdG9cbiAgLy8gdGhlIFZlcnNpb24gYW5kIEVycm9yIENvcnJlY3Rpb24gTGV2ZWwgYnkgYWRkaW5nIHRoZSBQYWQgQ29kZXdvcmRzIDExMTAxMTAwICgweEVDKVxuICAvLyBhbmQgMDAwMTAwMDEgKDB4MTEpIGFsdGVybmF0ZWx5LlxuICBjb25zdCByZW1haW5pbmdCeXRlID0gKGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMgLSBidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkpIC8gOFxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbWFpbmluZ0J5dGU7IGkrKykge1xuICAgIGJ1ZmZlci5wdXQoaSAlIDIgPyAweDExIDogMHhFQywgOClcbiAgfVxuXG4gIHJldHVybiBjcmVhdGVDb2Rld29yZHMoYnVmZmVyLCB2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcbn1cblxuLyoqXG4gKiBFbmNvZGUgaW5wdXQgZGF0YSB3aXRoIFJlZWQtU29sb21vbiBhbmQgcmV0dXJuIGNvZGV3b3JkcyB3aXRoXG4gKiByZWxhdGl2ZSBlcnJvciBjb3JyZWN0aW9uIGJpdHNcbiAqXG4gKiBAcGFyYW0gIHtCaXRCdWZmZXJ9IGJpdEJ1ZmZlciAgICAgICAgICAgIERhdGEgdG8gZW5jb2RlXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgIHZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxuICogQHBhcmFtICB7RXJyb3JDb3JyZWN0aW9uTGV2ZWx9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9ICAgICAgICAgICAgICAgICAgICAgQnVmZmVyIGNvbnRhaW5pbmcgZW5jb2RlZCBjb2Rld29yZHNcbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ29kZXdvcmRzIChiaXRCdWZmZXIsIHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XG4gIC8vIFRvdGFsIGNvZGV3b3JkcyBmb3IgdGhpcyBRUiBjb2RlIHZlcnNpb24gKERhdGEgKyBFcnJvciBjb3JyZWN0aW9uKVxuICBjb25zdCB0b3RhbENvZGV3b3JkcyA9IFV0aWxzLmdldFN5bWJvbFRvdGFsQ29kZXdvcmRzKHZlcnNpb24pXG5cbiAgLy8gVG90YWwgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzXG4gIGNvbnN0IGVjVG90YWxDb2Rld29yZHMgPSBFQ0NvZGUuZ2V0VG90YWxDb2Rld29yZHNDb3VudCh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcblxuICAvLyBUb3RhbCBudW1iZXIgb2YgZGF0YSBjb2Rld29yZHNcbiAgY29uc3QgZGF0YVRvdGFsQ29kZXdvcmRzID0gdG90YWxDb2Rld29yZHMgLSBlY1RvdGFsQ29kZXdvcmRzXG5cbiAgLy8gVG90YWwgbnVtYmVyIG9mIGJsb2Nrc1xuICBjb25zdCBlY1RvdGFsQmxvY2tzID0gRUNDb2RlLmdldEJsb2Nrc0NvdW50KHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKVxuXG4gIC8vIENhbGN1bGF0ZSBob3cgbWFueSBibG9ja3MgZWFjaCBncm91cCBzaG91bGQgY29udGFpblxuICBjb25zdCBibG9ja3NJbkdyb3VwMiA9IHRvdGFsQ29kZXdvcmRzICUgZWNUb3RhbEJsb2Nrc1xuICBjb25zdCBibG9ja3NJbkdyb3VwMSA9IGVjVG90YWxCbG9ja3MgLSBibG9ja3NJbkdyb3VwMlxuXG4gIGNvbnN0IHRvdGFsQ29kZXdvcmRzSW5Hcm91cDEgPSBNYXRoLmZsb29yKHRvdGFsQ29kZXdvcmRzIC8gZWNUb3RhbEJsb2NrcylcblxuICBjb25zdCBkYXRhQ29kZXdvcmRzSW5Hcm91cDEgPSBNYXRoLmZsb29yKGRhdGFUb3RhbENvZGV3b3JkcyAvIGVjVG90YWxCbG9ja3MpXG4gIGNvbnN0IGRhdGFDb2Rld29yZHNJbkdyb3VwMiA9IGRhdGFDb2Rld29yZHNJbkdyb3VwMSArIDFcblxuICAvLyBOdW1iZXIgb2YgRUMgY29kZXdvcmRzIGlzIHRoZSBzYW1lIGZvciBib3RoIGdyb3Vwc1xuICBjb25zdCBlY0NvdW50ID0gdG90YWxDb2Rld29yZHNJbkdyb3VwMSAtIGRhdGFDb2Rld29yZHNJbkdyb3VwMVxuXG4gIC8vIEluaXRpYWxpemUgYSBSZWVkLVNvbG9tb24gZW5jb2RlciB3aXRoIGEgZ2VuZXJhdG9yIHBvbHlub21pYWwgb2YgZGVncmVlIGVjQ291bnRcbiAgY29uc3QgcnMgPSBuZXcgUmVlZFNvbG9tb25FbmNvZGVyKGVjQ291bnQpXG5cbiAgbGV0IG9mZnNldCA9IDBcbiAgY29uc3QgZGNEYXRhID0gbmV3IEFycmF5KGVjVG90YWxCbG9ja3MpXG4gIGNvbnN0IGVjRGF0YSA9IG5ldyBBcnJheShlY1RvdGFsQmxvY2tzKVxuICBsZXQgbWF4RGF0YVNpemUgPSAwXG4gIGNvbnN0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGJpdEJ1ZmZlci5idWZmZXIpXG5cbiAgLy8gRGl2aWRlIHRoZSBidWZmZXIgaW50byB0aGUgcmVxdWlyZWQgbnVtYmVyIG9mIGJsb2Nrc1xuICBmb3IgKGxldCBiID0gMDsgYiA8IGVjVG90YWxCbG9ja3M7IGIrKykge1xuICAgIGNvbnN0IGRhdGFTaXplID0gYiA8IGJsb2Nrc0luR3JvdXAxID8gZGF0YUNvZGV3b3Jkc0luR3JvdXAxIDogZGF0YUNvZGV3b3Jkc0luR3JvdXAyXG5cbiAgICAvLyBleHRyYWN0IGEgYmxvY2sgb2YgZGF0YSBmcm9tIGJ1ZmZlclxuICAgIGRjRGF0YVtiXSA9IGJ1ZmZlci5zbGljZShvZmZzZXQsIG9mZnNldCArIGRhdGFTaXplKVxuXG4gICAgLy8gQ2FsY3VsYXRlIEVDIGNvZGV3b3JkcyBmb3IgdGhpcyBkYXRhIGJsb2NrXG4gICAgZWNEYXRhW2JdID0gcnMuZW5jb2RlKGRjRGF0YVtiXSlcblxuICAgIG9mZnNldCArPSBkYXRhU2l6ZVxuICAgIG1heERhdGFTaXplID0gTWF0aC5tYXgobWF4RGF0YVNpemUsIGRhdGFTaXplKVxuICB9XG5cbiAgLy8gQ3JlYXRlIGZpbmFsIGRhdGFcbiAgLy8gSW50ZXJsZWF2ZSB0aGUgZGF0YSBhbmQgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHMgZnJvbSBlYWNoIGJsb2NrXG4gIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheSh0b3RhbENvZGV3b3JkcylcbiAgbGV0IGluZGV4ID0gMFxuICBsZXQgaSwgclxuXG4gIC8vIEFkZCBkYXRhIGNvZGV3b3Jkc1xuICBmb3IgKGkgPSAwOyBpIDwgbWF4RGF0YVNpemU7IGkrKykge1xuICAgIGZvciAociA9IDA7IHIgPCBlY1RvdGFsQmxvY2tzOyByKyspIHtcbiAgICAgIGlmIChpIDwgZGNEYXRhW3JdLmxlbmd0aCkge1xuICAgICAgICBkYXRhW2luZGV4KytdID0gZGNEYXRhW3JdW2ldXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQXBwZWQgRUMgY29kZXdvcmRzXG4gIGZvciAoaSA9IDA7IGkgPCBlY0NvdW50OyBpKyspIHtcbiAgICBmb3IgKHIgPSAwOyByIDwgZWNUb3RhbEJsb2NrczsgcisrKSB7XG4gICAgICBkYXRhW2luZGV4KytdID0gZWNEYXRhW3JdW2ldXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRhdGFcbn1cblxuLyoqXG4gKiBCdWlsZCBRUiBDb2RlIHN5bWJvbFxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YSAgICAgICAgICAgICAgICAgSW5wdXQgc3RyaW5nXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxuICogQHBhcmFtICB7RXJyb3JDb3JyZXRpb25MZXZlbH0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgbGV2ZWxcbiAqIEBwYXJhbSAge01hc2tQYXR0ZXJufSBtYXNrUGF0dGVybiAgICAgTWFzayBwYXR0ZXJuXG4gKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAgICAgICAgICAgICAgIE9iamVjdCBjb250YWluaW5nIHN5bWJvbCBkYXRhXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVN5bWJvbCAoZGF0YSwgdmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2tQYXR0ZXJuKSB7XG4gIGxldCBzZWdtZW50c1xuXG4gIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgc2VnbWVudHMgPSBTZWdtZW50cy5mcm9tQXJyYXkoZGF0YSlcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICBsZXQgZXN0aW1hdGVkVmVyc2lvbiA9IHZlcnNpb25cblxuICAgIGlmICghZXN0aW1hdGVkVmVyc2lvbikge1xuICAgICAgY29uc3QgcmF3U2VnbWVudHMgPSBTZWdtZW50cy5yYXdTcGxpdChkYXRhKVxuXG4gICAgICAvLyBFc3RpbWF0ZSBiZXN0IHZlcnNpb24gdGhhdCBjYW4gY29udGFpbiByYXcgc3BsaXR0ZWQgc2VnbWVudHNcbiAgICAgIGVzdGltYXRlZFZlcnNpb24gPSBWZXJzaW9uLmdldEJlc3RWZXJzaW9uRm9yRGF0YShyYXdTZWdtZW50cywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXG4gICAgfVxuXG4gICAgLy8gQnVpbGQgb3B0aW1pemVkIHNlZ21lbnRzXG4gICAgLy8gSWYgZXN0aW1hdGVkIHZlcnNpb24gaXMgdW5kZWZpbmVkLCB0cnkgd2l0aCB0aGUgaGlnaGVzdCB2ZXJzaW9uXG4gICAgc2VnbWVudHMgPSBTZWdtZW50cy5mcm9tU3RyaW5nKGRhdGEsIGVzdGltYXRlZFZlcnNpb24gfHwgNDApXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRhdGEnKVxuICB9XG5cbiAgLy8gR2V0IHRoZSBtaW4gdmVyc2lvbiB0aGF0IGNhbiBjb250YWluIGRhdGFcbiAgY29uc3QgYmVzdFZlcnNpb24gPSBWZXJzaW9uLmdldEJlc3RWZXJzaW9uRm9yRGF0YShzZWdtZW50cywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXG5cbiAgLy8gSWYgbm8gdmVyc2lvbiBpcyBmb3VuZCwgZGF0YSBjYW5ub3QgYmUgc3RvcmVkXG4gIGlmICghYmVzdFZlcnNpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBhbW91bnQgb2YgZGF0YSBpcyB0b28gYmlnIHRvIGJlIHN0b3JlZCBpbiBhIFFSIENvZGUnKVxuICB9XG5cbiAgLy8gSWYgbm90IHNwZWNpZmllZCwgdXNlIG1pbiB2ZXJzaW9uIGFzIGRlZmF1bHRcbiAgaWYgKCF2ZXJzaW9uKSB7XG4gICAgdmVyc2lvbiA9IGJlc3RWZXJzaW9uXG5cbiAgLy8gQ2hlY2sgaWYgdGhlIHNwZWNpZmllZCB2ZXJzaW9uIGNhbiBjb250YWluIHRoZSBkYXRhXG4gIH0gZWxzZSBpZiAodmVyc2lvbiA8IGJlc3RWZXJzaW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcXG4nICtcbiAgICAgICdUaGUgY2hvc2VuIFFSIENvZGUgdmVyc2lvbiBjYW5ub3QgY29udGFpbiB0aGlzIGFtb3VudCBvZiBkYXRhLlxcbicgK1xuICAgICAgJ01pbmltdW0gdmVyc2lvbiByZXF1aXJlZCB0byBzdG9yZSBjdXJyZW50IGRhdGEgaXM6ICcgKyBiZXN0VmVyc2lvbiArICcuXFxuJ1xuICAgIClcbiAgfVxuXG4gIGNvbnN0IGRhdGFCaXRzID0gY3JlYXRlRGF0YSh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgc2VnbWVudHMpXG5cbiAgLy8gQWxsb2NhdGUgbWF0cml4IGJ1ZmZlclxuICBjb25zdCBtb2R1bGVDb3VudCA9IFV0aWxzLmdldFN5bWJvbFNpemUodmVyc2lvbilcbiAgY29uc3QgbW9kdWxlcyA9IG5ldyBCaXRNYXRyaXgobW9kdWxlQ291bnQpXG5cbiAgLy8gQWRkIGZ1bmN0aW9uIG1vZHVsZXNcbiAgc2V0dXBGaW5kZXJQYXR0ZXJuKG1vZHVsZXMsIHZlcnNpb24pXG4gIHNldHVwVGltaW5nUGF0dGVybihtb2R1bGVzKVxuICBzZXR1cEFsaWdubWVudFBhdHRlcm4obW9kdWxlcywgdmVyc2lvbilcblxuICAvLyBBZGQgdGVtcG9yYXJ5IGR1bW15IGJpdHMgZm9yIGZvcm1hdCBpbmZvIGp1c3QgdG8gc2V0IHRoZW0gYXMgcmVzZXJ2ZWQuXG4gIC8vIFRoaXMgaXMgbmVlZGVkIHRvIHByZXZlbnQgdGhlc2UgYml0cyBmcm9tIGJlaW5nIG1hc2tlZCBieSB7QGxpbmsgTWFza1BhdHRlcm4uYXBwbHlNYXNrfVxuICAvLyBzaW5jZSB0aGUgbWFza2luZyBvcGVyYXRpb24gbXVzdCBiZSBwZXJmb3JtZWQgb25seSBvbiB0aGUgZW5jb2RpbmcgcmVnaW9uLlxuICAvLyBUaGVzZSBibG9ja3Mgd2lsbCBiZSByZXBsYWNlZCB3aXRoIGNvcnJlY3QgdmFsdWVzIGxhdGVyIGluIGNvZGUuXG4gIHNldHVwRm9ybWF0SW5mbyhtb2R1bGVzLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgMClcblxuICBpZiAodmVyc2lvbiA+PSA3KSB7XG4gICAgc2V0dXBWZXJzaW9uSW5mbyhtb2R1bGVzLCB2ZXJzaW9uKVxuICB9XG5cbiAgLy8gQWRkIGRhdGEgY29kZXdvcmRzXG4gIHNldHVwRGF0YShtb2R1bGVzLCBkYXRhQml0cylcblxuICBpZiAoaXNOYU4obWFza1BhdHRlcm4pKSB7XG4gICAgLy8gRmluZCBiZXN0IG1hc2sgcGF0dGVyblxuICAgIG1hc2tQYXR0ZXJuID0gTWFza1BhdHRlcm4uZ2V0QmVzdE1hc2sobW9kdWxlcyxcbiAgICAgIHNldHVwRm9ybWF0SW5mby5iaW5kKG51bGwsIG1vZHVsZXMsIGVycm9yQ29ycmVjdGlvbkxldmVsKSlcbiAgfVxuXG4gIC8vIEFwcGx5IG1hc2sgcGF0dGVyblxuICBNYXNrUGF0dGVybi5hcHBseU1hc2sobWFza1BhdHRlcm4sIG1vZHVsZXMpXG5cbiAgLy8gUmVwbGFjZSBmb3JtYXQgaW5mbyBiaXRzIHdpdGggY29ycmVjdCB2YWx1ZXNcbiAgc2V0dXBGb3JtYXRJbmZvKG1vZHVsZXMsIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrUGF0dGVybilcblxuICByZXR1cm4ge1xuICAgIG1vZHVsZXM6IG1vZHVsZXMsXG4gICAgdmVyc2lvbjogdmVyc2lvbixcbiAgICBlcnJvckNvcnJlY3Rpb25MZXZlbDogZXJyb3JDb3JyZWN0aW9uTGV2ZWwsXG4gICAgbWFza1BhdHRlcm46IG1hc2tQYXR0ZXJuLFxuICAgIHNlZ21lbnRzOiBzZWdtZW50c1xuICB9XG59XG5cbi8qKlxuICogUVIgQ29kZVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nIHwgQXJyYXl9IGRhdGEgICAgICAgICAgICAgICAgIElucHV0IGRhdGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zICAgICAgICAgICAgICAgICAgICAgIE9wdGlvbmFsIGNvbmZpZ3VyYXRpb25zXG4gKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy52ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cbiAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLmVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG9wdGlvbnMudG9TSklTRnVuYyAgICAgICAgIEhlbHBlciBmdW5jIHRvIGNvbnZlcnQgdXRmOCB0byBzamlzXG4gKi9cbmV4cG9ydHMuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlIChkYXRhLCBvcHRpb25zKSB7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcgfHwgZGF0YSA9PT0gJycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGlucHV0IHRleHQnKVxuICB9XG5cbiAgbGV0IGVycm9yQ29ycmVjdGlvbkxldmVsID0gRUNMZXZlbC5NXG4gIGxldCB2ZXJzaW9uXG4gIGxldCBtYXNrXG5cbiAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIFVzZSBoaWdoZXIgZXJyb3IgY29ycmVjdGlvbiBsZXZlbCBhcyBkZWZhdWx0XG4gICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWwgPSBFQ0xldmVsLmZyb20ob3B0aW9ucy5lcnJvckNvcnJlY3Rpb25MZXZlbCwgRUNMZXZlbC5NKVxuICAgIHZlcnNpb24gPSBWZXJzaW9uLmZyb20ob3B0aW9ucy52ZXJzaW9uKVxuICAgIG1hc2sgPSBNYXNrUGF0dGVybi5mcm9tKG9wdGlvbnMubWFza1BhdHRlcm4pXG5cbiAgICBpZiAob3B0aW9ucy50b1NKSVNGdW5jKSB7XG4gICAgICBVdGlscy5zZXRUb1NKSVNGdW5jdGlvbihvcHRpb25zLnRvU0pJU0Z1bmMpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNyZWF0ZVN5bWJvbChkYXRhLCB2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbWFzaylcbn1cbiIsImZ1bmN0aW9uIGhleDJyZ2JhIChoZXgpIHtcbiAgaWYgKHR5cGVvZiBoZXggPT09ICdudW1iZXInKSB7XG4gICAgaGV4ID0gaGV4LnRvU3RyaW5nKClcbiAgfVxuXG4gIGlmICh0eXBlb2YgaGV4ICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcignQ29sb3Igc2hvdWxkIGJlIGRlZmluZWQgYXMgaGV4IHN0cmluZycpXG4gIH1cblxuICBsZXQgaGV4Q29kZSA9IGhleC5zbGljZSgpLnJlcGxhY2UoJyMnLCAnJykuc3BsaXQoJycpXG4gIGlmIChoZXhDb2RlLmxlbmd0aCA8IDMgfHwgaGV4Q29kZS5sZW5ndGggPT09IDUgfHwgaGV4Q29kZS5sZW5ndGggPiA4KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBjb2xvcjogJyArIGhleClcbiAgfVxuXG4gIC8vIENvbnZlcnQgZnJvbSBzaG9ydCB0byBsb25nIGZvcm0gKGZmZiAtPiBmZmZmZmYpXG4gIGlmIChoZXhDb2RlLmxlbmd0aCA9PT0gMyB8fCBoZXhDb2RlLmxlbmd0aCA9PT0gNCkge1xuICAgIGhleENvZGUgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBoZXhDb2RlLm1hcChmdW5jdGlvbiAoYykge1xuICAgICAgcmV0dXJuIFtjLCBjXVxuICAgIH0pKVxuICB9XG5cbiAgLy8gQWRkIGRlZmF1bHQgYWxwaGEgdmFsdWVcbiAgaWYgKGhleENvZGUubGVuZ3RoID09PSA2KSBoZXhDb2RlLnB1c2goJ0YnLCAnRicpXG5cbiAgY29uc3QgaGV4VmFsdWUgPSBwYXJzZUludChoZXhDb2RlLmpvaW4oJycpLCAxNilcblxuICByZXR1cm4ge1xuICAgIHI6IChoZXhWYWx1ZSA+PiAyNCkgJiAyNTUsXG4gICAgZzogKGhleFZhbHVlID4+IDE2KSAmIDI1NSxcbiAgICBiOiAoaGV4VmFsdWUgPj4gOCkgJiAyNTUsXG4gICAgYTogaGV4VmFsdWUgJiAyNTUsXG4gICAgaGV4OiAnIycgKyBoZXhDb2RlLnNsaWNlKDAsIDYpLmpvaW4oJycpXG4gIH1cbn1cblxuZXhwb3J0cy5nZXRPcHRpb25zID0gZnVuY3Rpb24gZ2V0T3B0aW9ucyAob3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fVxuICBpZiAoIW9wdGlvbnMuY29sb3IpIG9wdGlvbnMuY29sb3IgPSB7fVxuXG4gIGNvbnN0IG1hcmdpbiA9IHR5cGVvZiBvcHRpb25zLm1hcmdpbiA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICBvcHRpb25zLm1hcmdpbiA9PT0gbnVsbCB8fFxuICAgIG9wdGlvbnMubWFyZ2luIDwgMFxuICAgID8gNFxuICAgIDogb3B0aW9ucy5tYXJnaW5cblxuICBjb25zdCB3aWR0aCA9IG9wdGlvbnMud2lkdGggJiYgb3B0aW9ucy53aWR0aCA+PSAyMSA/IG9wdGlvbnMud2lkdGggOiB1bmRlZmluZWRcbiAgY29uc3Qgc2NhbGUgPSBvcHRpb25zLnNjYWxlIHx8IDRcblxuICByZXR1cm4ge1xuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBzY2FsZTogd2lkdGggPyA0IDogc2NhbGUsXG4gICAgbWFyZ2luOiBtYXJnaW4sXG4gICAgY29sb3I6IHtcbiAgICAgIGRhcms6IGhleDJyZ2JhKG9wdGlvbnMuY29sb3IuZGFyayB8fCAnIzAwMDAwMGZmJyksXG4gICAgICBsaWdodDogaGV4MnJnYmEob3B0aW9ucy5jb2xvci5saWdodCB8fCAnI2ZmZmZmZmZmJylcbiAgICB9LFxuICAgIHR5cGU6IG9wdGlvbnMudHlwZSxcbiAgICByZW5kZXJlck9wdHM6IG9wdGlvbnMucmVuZGVyZXJPcHRzIHx8IHt9XG4gIH1cbn1cblxuZXhwb3J0cy5nZXRTY2FsZSA9IGZ1bmN0aW9uIGdldFNjYWxlIChxclNpemUsIG9wdHMpIHtcbiAgcmV0dXJuIG9wdHMud2lkdGggJiYgb3B0cy53aWR0aCA+PSBxclNpemUgKyBvcHRzLm1hcmdpbiAqIDJcbiAgICA/IG9wdHMud2lkdGggLyAocXJTaXplICsgb3B0cy5tYXJnaW4gKiAyKVxuICAgIDogb3B0cy5zY2FsZVxufVxuXG5leHBvcnRzLmdldEltYWdlV2lkdGggPSBmdW5jdGlvbiBnZXRJbWFnZVdpZHRoIChxclNpemUsIG9wdHMpIHtcbiAgY29uc3Qgc2NhbGUgPSBleHBvcnRzLmdldFNjYWxlKHFyU2l6ZSwgb3B0cylcbiAgcmV0dXJuIE1hdGguZmxvb3IoKHFyU2l6ZSArIG9wdHMubWFyZ2luICogMikgKiBzY2FsZSlcbn1cblxuZXhwb3J0cy5xclRvSW1hZ2VEYXRhID0gZnVuY3Rpb24gcXJUb0ltYWdlRGF0YSAoaW1nRGF0YSwgcXIsIG9wdHMpIHtcbiAgY29uc3Qgc2l6ZSA9IHFyLm1vZHVsZXMuc2l6ZVxuICBjb25zdCBkYXRhID0gcXIubW9kdWxlcy5kYXRhXG4gIGNvbnN0IHNjYWxlID0gZXhwb3J0cy5nZXRTY2FsZShzaXplLCBvcHRzKVxuICBjb25zdCBzeW1ib2xTaXplID0gTWF0aC5mbG9vcigoc2l6ZSArIG9wdHMubWFyZ2luICogMikgKiBzY2FsZSlcbiAgY29uc3Qgc2NhbGVkTWFyZ2luID0gb3B0cy5tYXJnaW4gKiBzY2FsZVxuICBjb25zdCBwYWxldHRlID0gW29wdHMuY29sb3IubGlnaHQsIG9wdHMuY29sb3IuZGFya11cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHN5bWJvbFNpemU7IGkrKykge1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgc3ltYm9sU2l6ZTsgaisrKSB7XG4gICAgICBsZXQgcG9zRHN0ID0gKGkgKiBzeW1ib2xTaXplICsgaikgKiA0XG4gICAgICBsZXQgcHhDb2xvciA9IG9wdHMuY29sb3IubGlnaHRcblxuICAgICAgaWYgKGkgPj0gc2NhbGVkTWFyZ2luICYmIGogPj0gc2NhbGVkTWFyZ2luICYmXG4gICAgICAgIGkgPCBzeW1ib2xTaXplIC0gc2NhbGVkTWFyZ2luICYmIGogPCBzeW1ib2xTaXplIC0gc2NhbGVkTWFyZ2luKSB7XG4gICAgICAgIGNvbnN0IGlTcmMgPSBNYXRoLmZsb29yKChpIC0gc2NhbGVkTWFyZ2luKSAvIHNjYWxlKVxuICAgICAgICBjb25zdCBqU3JjID0gTWF0aC5mbG9vcigoaiAtIHNjYWxlZE1hcmdpbikgLyBzY2FsZSlcbiAgICAgICAgcHhDb2xvciA9IHBhbGV0dGVbZGF0YVtpU3JjICogc2l6ZSArIGpTcmNdID8gMSA6IDBdXG4gICAgICB9XG5cbiAgICAgIGltZ0RhdGFbcG9zRHN0KytdID0gcHhDb2xvci5yXG4gICAgICBpbWdEYXRhW3Bvc0RzdCsrXSA9IHB4Q29sb3IuZ1xuICAgICAgaW1nRGF0YVtwb3NEc3QrK10gPSBweENvbG9yLmJcbiAgICAgIGltZ0RhdGFbcG9zRHN0XSA9IHB4Q29sb3IuYVxuICAgIH1cbiAgfVxufVxuIiwiY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcblxuZnVuY3Rpb24gY2xlYXJDYW52YXMgKGN0eCwgY2FudmFzLCBzaXplKSB7XG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KVxuXG4gIGlmICghY2FudmFzLnN0eWxlKSBjYW52YXMuc3R5bGUgPSB7fVxuICBjYW52YXMuaGVpZ2h0ID0gc2l6ZVxuICBjYW52YXMud2lkdGggPSBzaXplXG4gIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBzaXplICsgJ3B4J1xuICBjYW52YXMuc3R5bGUud2lkdGggPSBzaXplICsgJ3B4J1xufVxuXG5mdW5jdGlvbiBnZXRDYW52YXNFbGVtZW50ICgpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignWW91IG5lZWQgdG8gc3BlY2lmeSBhIGNhbnZhcyBlbGVtZW50JylcbiAgfVxufVxuXG5leHBvcnRzLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlciAocXJEYXRhLCBjYW52YXMsIG9wdGlvbnMpIHtcbiAgbGV0IG9wdHMgPSBvcHRpb25zXG4gIGxldCBjYW52YXNFbCA9IGNhbnZhc1xuXG4gIGlmICh0eXBlb2Ygb3B0cyA9PT0gJ3VuZGVmaW5lZCcgJiYgKCFjYW52YXMgfHwgIWNhbnZhcy5nZXRDb250ZXh0KSkge1xuICAgIG9wdHMgPSBjYW52YXNcbiAgICBjYW52YXMgPSB1bmRlZmluZWRcbiAgfVxuXG4gIGlmICghY2FudmFzKSB7XG4gICAgY2FudmFzRWwgPSBnZXRDYW52YXNFbGVtZW50KClcbiAgfVxuXG4gIG9wdHMgPSBVdGlscy5nZXRPcHRpb25zKG9wdHMpXG4gIGNvbnN0IHNpemUgPSBVdGlscy5nZXRJbWFnZVdpZHRoKHFyRGF0YS5tb2R1bGVzLnNpemUsIG9wdHMpXG5cbiAgY29uc3QgY3R4ID0gY2FudmFzRWwuZ2V0Q29udGV4dCgnMmQnKVxuICBjb25zdCBpbWFnZSA9IGN0eC5jcmVhdGVJbWFnZURhdGEoc2l6ZSwgc2l6ZSlcbiAgVXRpbHMucXJUb0ltYWdlRGF0YShpbWFnZS5kYXRhLCBxckRhdGEsIG9wdHMpXG5cbiAgY2xlYXJDYW52YXMoY3R4LCBjYW52YXNFbCwgc2l6ZSlcbiAgY3R4LnB1dEltYWdlRGF0YShpbWFnZSwgMCwgMClcblxuICByZXR1cm4gY2FudmFzRWxcbn1cblxuZXhwb3J0cy5yZW5kZXJUb0RhdGFVUkwgPSBmdW5jdGlvbiByZW5kZXJUb0RhdGFVUkwgKHFyRGF0YSwgY2FudmFzLCBvcHRpb25zKSB7XG4gIGxldCBvcHRzID0gb3B0aW9uc1xuXG4gIGlmICh0eXBlb2Ygb3B0cyA9PT0gJ3VuZGVmaW5lZCcgJiYgKCFjYW52YXMgfHwgIWNhbnZhcy5nZXRDb250ZXh0KSkge1xuICAgIG9wdHMgPSBjYW52YXNcbiAgICBjYW52YXMgPSB1bmRlZmluZWRcbiAgfVxuXG4gIGlmICghb3B0cykgb3B0cyA9IHt9XG5cbiAgY29uc3QgY2FudmFzRWwgPSBleHBvcnRzLnJlbmRlcihxckRhdGEsIGNhbnZhcywgb3B0cylcblxuICBjb25zdCB0eXBlID0gb3B0cy50eXBlIHx8ICdpbWFnZS9wbmcnXG4gIGNvbnN0IHJlbmRlcmVyT3B0cyA9IG9wdHMucmVuZGVyZXJPcHRzIHx8IHt9XG5cbiAgcmV0dXJuIGNhbnZhc0VsLnRvRGF0YVVSTCh0eXBlLCByZW5kZXJlck9wdHMucXVhbGl0eSlcbn1cbiIsImNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5cbmZ1bmN0aW9uIGdldENvbG9yQXR0cmliIChjb2xvciwgYXR0cmliKSB7XG4gIGNvbnN0IGFscGhhID0gY29sb3IuYSAvIDI1NVxuICBjb25zdCBzdHIgPSBhdHRyaWIgKyAnPVwiJyArIGNvbG9yLmhleCArICdcIidcblxuICByZXR1cm4gYWxwaGEgPCAxXG4gICAgPyBzdHIgKyAnICcgKyBhdHRyaWIgKyAnLW9wYWNpdHk9XCInICsgYWxwaGEudG9GaXhlZCgyKS5zbGljZSgxKSArICdcIidcbiAgICA6IHN0clxufVxuXG5mdW5jdGlvbiBzdmdDbWQgKGNtZCwgeCwgeSkge1xuICBsZXQgc3RyID0gY21kICsgeFxuICBpZiAodHlwZW9mIHkgIT09ICd1bmRlZmluZWQnKSBzdHIgKz0gJyAnICsgeVxuXG4gIHJldHVybiBzdHJcbn1cblxuZnVuY3Rpb24gcXJUb1BhdGggKGRhdGEsIHNpemUsIG1hcmdpbikge1xuICBsZXQgcGF0aCA9ICcnXG4gIGxldCBtb3ZlQnkgPSAwXG4gIGxldCBuZXdSb3cgPSBmYWxzZVxuICBsZXQgbGluZUxlbmd0aCA9IDBcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjb2wgPSBNYXRoLmZsb29yKGkgJSBzaXplKVxuICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoaSAvIHNpemUpXG5cbiAgICBpZiAoIWNvbCAmJiAhbmV3Um93KSBuZXdSb3cgPSB0cnVlXG5cbiAgICBpZiAoZGF0YVtpXSkge1xuICAgICAgbGluZUxlbmd0aCsrXG5cbiAgICAgIGlmICghKGkgPiAwICYmIGNvbCA+IDAgJiYgZGF0YVtpIC0gMV0pKSB7XG4gICAgICAgIHBhdGggKz0gbmV3Um93XG4gICAgICAgICAgPyBzdmdDbWQoJ00nLCBjb2wgKyBtYXJnaW4sIDAuNSArIHJvdyArIG1hcmdpbilcbiAgICAgICAgICA6IHN2Z0NtZCgnbScsIG1vdmVCeSwgMClcblxuICAgICAgICBtb3ZlQnkgPSAwXG4gICAgICAgIG5ld1JvdyA9IGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGlmICghKGNvbCArIDEgPCBzaXplICYmIGRhdGFbaSArIDFdKSkge1xuICAgICAgICBwYXRoICs9IHN2Z0NtZCgnaCcsIGxpbmVMZW5ndGgpXG4gICAgICAgIGxpbmVMZW5ndGggPSAwXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG1vdmVCeSsrXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhdGhcbn1cblxuZXhwb3J0cy5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIgKHFyRGF0YSwgb3B0aW9ucywgY2IpIHtcbiAgY29uc3Qgb3B0cyA9IFV0aWxzLmdldE9wdGlvbnMob3B0aW9ucylcbiAgY29uc3Qgc2l6ZSA9IHFyRGF0YS5tb2R1bGVzLnNpemVcbiAgY29uc3QgZGF0YSA9IHFyRGF0YS5tb2R1bGVzLmRhdGFcbiAgY29uc3QgcXJjb2Rlc2l6ZSA9IHNpemUgKyBvcHRzLm1hcmdpbiAqIDJcblxuICBjb25zdCBiZyA9ICFvcHRzLmNvbG9yLmxpZ2h0LmFcbiAgICA/ICcnXG4gICAgOiAnPHBhdGggJyArIGdldENvbG9yQXR0cmliKG9wdHMuY29sb3IubGlnaHQsICdmaWxsJykgK1xuICAgICAgJyBkPVwiTTAgMGgnICsgcXJjb2Rlc2l6ZSArICd2JyArIHFyY29kZXNpemUgKyAnSDB6XCIvPidcblxuICBjb25zdCBwYXRoID1cbiAgICAnPHBhdGggJyArIGdldENvbG9yQXR0cmliKG9wdHMuY29sb3IuZGFyaywgJ3N0cm9rZScpICtcbiAgICAnIGQ9XCInICsgcXJUb1BhdGgoZGF0YSwgc2l6ZSwgb3B0cy5tYXJnaW4pICsgJ1wiLz4nXG5cbiAgY29uc3Qgdmlld0JveCA9ICd2aWV3Qm94PVwiJyArICcwIDAgJyArIHFyY29kZXNpemUgKyAnICcgKyBxcmNvZGVzaXplICsgJ1wiJ1xuXG4gIGNvbnN0IHdpZHRoID0gIW9wdHMud2lkdGggPyAnJyA6ICd3aWR0aD1cIicgKyBvcHRzLndpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBvcHRzLndpZHRoICsgJ1wiICdcblxuICBjb25zdCBzdmdUYWcgPSAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgJyArIHdpZHRoICsgdmlld0JveCArICcgc2hhcGUtcmVuZGVyaW5nPVwiY3Jpc3BFZGdlc1wiPicgKyBiZyArIHBhdGggKyAnPC9zdmc+XFxuJ1xuXG4gIGlmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYihudWxsLCBzdmdUYWcpXG4gIH1cblxuICByZXR1cm4gc3ZnVGFnXG59XG4iLCJcbmNvbnN0IGNhblByb21pc2UgPSByZXF1aXJlKCcuL2Nhbi1wcm9taXNlJylcblxuY29uc3QgUVJDb2RlID0gcmVxdWlyZSgnLi9jb3JlL3FyY29kZScpXG5jb25zdCBDYW52YXNSZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXIvY2FudmFzJylcbmNvbnN0IFN2Z1JlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlci9zdmctdGFnLmpzJylcblxuZnVuY3Rpb24gcmVuZGVyQ2FudmFzIChyZW5kZXJGdW5jLCBjYW52YXMsIHRleHQsIG9wdHMsIGNiKSB7XG4gIGNvbnN0IGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgY29uc3QgYXJnc051bSA9IGFyZ3MubGVuZ3RoXG4gIGNvbnN0IGlzTGFzdEFyZ0NiID0gdHlwZW9mIGFyZ3NbYXJnc051bSAtIDFdID09PSAnZnVuY3Rpb24nXG5cbiAgaWYgKCFpc0xhc3RBcmdDYiAmJiAhY2FuUHJvbWlzZSgpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYWxsYmFjayByZXF1aXJlZCBhcyBsYXN0IGFyZ3VtZW50JylcbiAgfVxuXG4gIGlmIChpc0xhc3RBcmdDYikge1xuICAgIGlmIChhcmdzTnVtIDwgMikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUb28gZmV3IGFyZ3VtZW50cyBwcm92aWRlZCcpXG4gICAgfVxuXG4gICAgaWYgKGFyZ3NOdW0gPT09IDIpIHtcbiAgICAgIGNiID0gdGV4dFxuICAgICAgdGV4dCA9IGNhbnZhc1xuICAgICAgY2FudmFzID0gb3B0cyA9IHVuZGVmaW5lZFxuICAgIH0gZWxzZSBpZiAoYXJnc051bSA9PT0gMykge1xuICAgICAgaWYgKGNhbnZhcy5nZXRDb250ZXh0ICYmIHR5cGVvZiBjYiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgY2IgPSBvcHRzXG4gICAgICAgIG9wdHMgPSB1bmRlZmluZWRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNiID0gb3B0c1xuICAgICAgICBvcHRzID0gdGV4dFxuICAgICAgICB0ZXh0ID0gY2FudmFzXG4gICAgICAgIGNhbnZhcyA9IHVuZGVmaW5lZFxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoYXJnc051bSA8IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVG9vIGZldyBhcmd1bWVudHMgcHJvdmlkZWQnKVxuICAgIH1cblxuICAgIGlmIChhcmdzTnVtID09PSAxKSB7XG4gICAgICB0ZXh0ID0gY2FudmFzXG4gICAgICBjYW52YXMgPSBvcHRzID0gdW5kZWZpbmVkXG4gICAgfSBlbHNlIGlmIChhcmdzTnVtID09PSAyICYmICFjYW52YXMuZ2V0Q29udGV4dCkge1xuICAgICAgb3B0cyA9IHRleHRcbiAgICAgIHRleHQgPSBjYW52YXNcbiAgICAgIGNhbnZhcyA9IHVuZGVmaW5lZFxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkYXRhID0gUVJDb2RlLmNyZWF0ZSh0ZXh0LCBvcHRzKVxuICAgICAgICByZXNvbHZlKHJlbmRlckZ1bmMoZGF0YSwgY2FudmFzLCBvcHRzKSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmVqZWN0KGUpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgZGF0YSA9IFFSQ29kZS5jcmVhdGUodGV4dCwgb3B0cylcbiAgICBjYihudWxsLCByZW5kZXJGdW5jKGRhdGEsIGNhbnZhcywgb3B0cykpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjYihlKVxuICB9XG59XG5cbmV4cG9ydHMuY3JlYXRlID0gUVJDb2RlLmNyZWF0ZVxuZXhwb3J0cy50b0NhbnZhcyA9IHJlbmRlckNhbnZhcy5iaW5kKG51bGwsIENhbnZhc1JlbmRlcmVyLnJlbmRlcilcbmV4cG9ydHMudG9EYXRhVVJMID0gcmVuZGVyQ2FudmFzLmJpbmQobnVsbCwgQ2FudmFzUmVuZGVyZXIucmVuZGVyVG9EYXRhVVJMKVxuXG4vLyBvbmx5IHN2ZyBmb3Igbm93LlxuZXhwb3J0cy50b1N0cmluZyA9IHJlbmRlckNhbnZhcy5iaW5kKG51bGwsIGZ1bmN0aW9uIChkYXRhLCBfLCBvcHRzKSB7XG4gIHJldHVybiBTdmdSZW5kZXJlci5yZW5kZXIoZGF0YSwgb3B0cylcbn0pXG4iLCIvKipcclxuICogY29yZS9lcmMyMC5qc1xyXG4gKlxyXG4gKiBFUkMtMjAgdG9rZW4gY29udHJhY3QgaW50ZXJmYWNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgZXRoZXJzIH0gZnJvbSAnZXRoZXJzJztcclxuaW1wb3J0IHsgZ2V0UHJvdmlkZXIgfSBmcm9tICcuL3JwYy5qcyc7XHJcblxyXG4vLyBTdGFuZGFyZCBFUkMtMjAgQUJJIChtaW5pbWFsIGludGVyZmFjZSB3ZSBuZWVkKVxyXG5jb25zdCBFUkMyMF9BQkkgPSBbXHJcbiAgLy8gUmVhZCBmdW5jdGlvbnNcclxuICAnZnVuY3Rpb24gbmFtZSgpIHZpZXcgcmV0dXJucyAoc3RyaW5nKScsXHJcbiAgJ2Z1bmN0aW9uIHN5bWJvbCgpIHZpZXcgcmV0dXJucyAoc3RyaW5nKScsXHJcbiAgJ2Z1bmN0aW9uIGRlY2ltYWxzKCkgdmlldyByZXR1cm5zICh1aW50OCknLFxyXG4gICdmdW5jdGlvbiB0b3RhbFN1cHBseSgpIHZpZXcgcmV0dXJucyAodWludDI1NiknLFxyXG4gICdmdW5jdGlvbiBiYWxhbmNlT2YoYWRkcmVzcyBhY2NvdW50KSB2aWV3IHJldHVybnMgKHVpbnQyNTYpJyxcclxuXHJcbiAgLy8gV3JpdGUgZnVuY3Rpb25zXHJcbiAgJ2Z1bmN0aW9uIHRyYW5zZmVyKGFkZHJlc3MgdG8sIHVpbnQyNTYgYW1vdW50KSByZXR1cm5zIChib29sKScsXHJcbiAgJ2Z1bmN0aW9uIGFwcHJvdmUoYWRkcmVzcyBzcGVuZGVyLCB1aW50MjU2IGFtb3VudCkgcmV0dXJucyAoYm9vbCknLFxyXG4gICdmdW5jdGlvbiBhbGxvd2FuY2UoYWRkcmVzcyBvd25lciwgYWRkcmVzcyBzcGVuZGVyKSB2aWV3IHJldHVybnMgKHVpbnQyNTYpJyxcclxuICAnZnVuY3Rpb24gdHJhbnNmZXJGcm9tKGFkZHJlc3MgZnJvbSwgYWRkcmVzcyB0bywgdWludDI1NiBhbW91bnQpIHJldHVybnMgKGJvb2wpJyxcclxuXHJcbiAgLy8gRXZlbnRzXHJcbiAgJ2V2ZW50IFRyYW5zZmVyKGFkZHJlc3MgaW5kZXhlZCBmcm9tLCBhZGRyZXNzIGluZGV4ZWQgdG8sIHVpbnQyNTYgdmFsdWUpJyxcclxuICAnZXZlbnQgQXBwcm92YWwoYWRkcmVzcyBpbmRleGVkIG93bmVyLCBhZGRyZXNzIGluZGV4ZWQgc3BlbmRlciwgdWludDI1NiB2YWx1ZSknXHJcbl07XHJcblxyXG4vKipcclxuICogR2V0cyBhbiBFUkMtMjAgY29udHJhY3QgaW5zdGFuY2VcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5BZGRyZXNzIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzc1xyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxldGhlcnMuQ29udHJhY3Q+fSBDb250cmFjdCBpbnN0YW5jZVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRva2VuQ29udHJhY3QobmV0d29yaywgdG9rZW5BZGRyZXNzKSB7XHJcbiAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBnZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICByZXR1cm4gbmV3IGV0aGVycy5Db250cmFjdCh0b2tlbkFkZHJlc3MsIEVSQzIwX0FCSSwgcHJvdmlkZXIpO1xyXG59XHJcblxyXG4vKipcclxuICogRmV0Y2hlcyB0b2tlbiBtZXRhZGF0YSAobmFtZSwgc3ltYm9sLCBkZWNpbWFscylcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5BZGRyZXNzIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzc1xyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx7bmFtZTogc3RyaW5nLCBzeW1ib2w6IHN0cmluZywgZGVjaW1hbHM6IG51bWJlcn0+fVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRva2VuTWV0YWRhdGEobmV0d29yaywgdG9rZW5BZGRyZXNzKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGNvbnRyYWN0ID0gYXdhaXQgZ2V0VG9rZW5Db250cmFjdChuZXR3b3JrLCB0b2tlbkFkZHJlc3MpO1xyXG5cclxuICAgIGNvbnN0IFtuYW1lLCBzeW1ib2wsIGRlY2ltYWxzXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgY29udHJhY3QubmFtZSgpLFxyXG4gICAgICBjb250cmFjdC5zeW1ib2woKSxcclxuICAgICAgY29udHJhY3QuZGVjaW1hbHMoKVxyXG4gICAgXSk7XHJcblxyXG4gICAgcmV0dXJuIHsgbmFtZSwgc3ltYm9sLCBkZWNpbWFsczogTnVtYmVyKGRlY2ltYWxzKSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBmZXRjaCB0b2tlbiBtZXRhZGF0YTogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgdG9rZW4gYmFsYW5jZSBmb3IgYW4gYWRkcmVzc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlbkFkZHJlc3MgLSBUb2tlbiBjb250cmFjdCBhZGRyZXNzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhY2NvdW50QWRkcmVzcyAtIEFjY291bnQgYWRkcmVzcyB0byBjaGVja1xyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBCYWxhbmNlIGluIHdlaSAoYXMgc3RyaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRva2VuQmFsYW5jZShuZXR3b3JrLCB0b2tlbkFkZHJlc3MsIGFjY291bnRBZGRyZXNzKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGNvbnRyYWN0ID0gYXdhaXQgZ2V0VG9rZW5Db250cmFjdChuZXR3b3JrLCB0b2tlbkFkZHJlc3MpO1xyXG4gICAgY29uc3QgYmFsYW5jZSA9IGF3YWl0IGNvbnRyYWN0LmJhbGFuY2VPZihhY2NvdW50QWRkcmVzcyk7XHJcbiAgICByZXR1cm4gYmFsYW5jZS50b1N0cmluZygpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBnZXQgdG9rZW4gYmFsYW5jZTogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdHMgdG9rZW4gYmFsYW5jZSBmcm9tIHdlaSB0byBodW1hbi1yZWFkYWJsZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFsYW5jZVdlaSAtIEJhbGFuY2UgaW4gd2VpXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWNpbWFscyAtIFRva2VuIGRlY2ltYWxzXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXNwbGF5RGVjaW1hbHMgLSBOdW1iZXIgb2YgZGVjaW1hbHMgdG8gZGlzcGxheSAoZGVmYXVsdCA0KVxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBGb3JtYXR0ZWQgYmFsYW5jZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFRva2VuQmFsYW5jZShiYWxhbmNlV2VpLCBkZWNpbWFscywgZGlzcGxheURlY2ltYWxzID0gNCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBiYWxhbmNlID0gZXRoZXJzLmZvcm1hdFVuaXRzKGJhbGFuY2VXZWksIGRlY2ltYWxzKTtcclxuICAgIGNvbnN0IG51bSA9IHBhcnNlRmxvYXQoYmFsYW5jZSk7XHJcbiAgICByZXR1cm4gbnVtLnRvRml4ZWQoZGlzcGxheURlY2ltYWxzKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmV0dXJuICcwLjAwMDAnO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFBhcnNlcyBodW1hbi1yZWFkYWJsZSBhbW91bnQgdG8gd2VpXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhbW91bnQgLSBIdW1hbi1yZWFkYWJsZSBhbW91bnRcclxuICogQHBhcmFtIHtudW1iZXJ9IGRlY2ltYWxzIC0gVG9rZW4gZGVjaW1hbHNcclxuICogQHJldHVybnMge3N0cmluZ30gQW1vdW50IGluIHdlaVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVG9rZW5BbW91bnQoYW1vdW50LCBkZWNpbWFscykge1xyXG4gIHJldHVybiBldGhlcnMucGFyc2VVbml0cyhhbW91bnQsIGRlY2ltYWxzKS50b1N0cmluZygpO1xyXG59XHJcblxyXG4vKipcclxuICogVHJhbnNmZXJzIHRva2Vuc1xyXG4gKiBAcGFyYW0ge2V0aGVycy5XYWxsZXR9IHNpZ25lciAtIFdhbGxldCBzaWduZXJcclxuICogQHBhcmFtIHtzdHJpbmd9IHRva2VuQWRkcmVzcyAtIFRva2VuIGNvbnRyYWN0IGFkZHJlc3NcclxuICogQHBhcmFtIHtzdHJpbmd9IHRvQWRkcmVzcyAtIFJlY2lwaWVudCBhZGRyZXNzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhbW91bnQgLSBBbW91bnQgaW4gd2VpIChhcyBzdHJpbmcpXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPGV0aGVycy5UcmFuc2FjdGlvblJlc3BvbnNlPn0gVHJhbnNhY3Rpb24gcmVzcG9uc2VcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0cmFuc2ZlclRva2VuKHNpZ25lciwgdG9rZW5BZGRyZXNzLCB0b0FkZHJlc3MsIGFtb3VudCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBjb250cmFjdCA9IG5ldyBldGhlcnMuQ29udHJhY3QodG9rZW5BZGRyZXNzLCBFUkMyMF9BQkksIHNpZ25lcik7XHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IGNvbnRyYWN0LnRyYW5zZmVyKHRvQWRkcmVzcywgYW1vdW50KTtcclxuICAgIHJldHVybiB0eDtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gdHJhbnNmZXIgdG9rZW46ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgaWYgYW4gYWRkcmVzcyBpcyBhIHZhbGlkIEVSQy0yMCB0b2tlbiBjb250cmFjdFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlbkFkZHJlc3MgLSBUb2tlbiBjb250cmFjdCBhZGRyZXNzXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fSBUcnVlIGlmIHZhbGlkIEVSQy0yMCBjb250cmFjdFxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlVG9rZW5Db250cmFjdChuZXR3b3JrLCB0b2tlbkFkZHJlc3MpIHtcclxuICB0cnkge1xyXG4gICAgLy8gQ2hlY2sgaWYgYWRkcmVzcyBpcyB2YWxpZFxyXG4gICAgaWYgKCFldGhlcnMuaXNBZGRyZXNzKHRva2VuQWRkcmVzcykpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRyeSB0byBmZXRjaCBiYXNpYyBtZXRhZGF0YVxyXG4gICAgYXdhaXQgZ2V0VG9rZW5NZXRhZGF0YShuZXR3b3JrLCB0b2tlbkFkZHJlc3MpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqIGNvcmUvdG9rZW5zLmpzXHJcbiAqXHJcbiAqIFRva2VuIG1hbmFnZW1lbnQgYW5kIHN0b3JhZ2VcclxuICovXHJcblxyXG5pbXBvcnQgeyBsb2FkLCBzYXZlIH0gZnJvbSAnLi9zdG9yYWdlLmpzJztcclxuaW1wb3J0IHsgZ2V0VG9rZW5NZXRhZGF0YSwgdmFsaWRhdGVUb2tlbkNvbnRyYWN0IH0gZnJvbSAnLi9lcmMyMC5qcyc7XHJcblxyXG4vLyBNYXhpbXVtIGN1c3RvbSB0b2tlbnMgcGVyIG5ldHdvcmtcclxuY29uc3QgTUFYX1RPS0VOU19QRVJfTkVUV09SSyA9IDIwO1xyXG5cclxuLy8gRGVmYXVsdC9wcmVzZXQgdG9rZW5zIChjYW4gYmUgZWFzaWx5IGFkZGVkL3JlbW92ZWQgYnkgdXNlcilcclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfVE9LRU5TID0ge1xyXG4gIHB1bHNlY2hhaW46IHtcclxuICAgICdIRVgnOiB7XHJcbiAgICAgIG5hbWU6ICdIRVgnLFxyXG4gICAgICBzeW1ib2w6ICdIRVgnLFxyXG4gICAgICBhZGRyZXNzOiAnMHgyYjU5MWU5OWFmZTlmMzJlYWE2MjE0ZjdiNzYyOTc2OGM0MGVlYjM5JyxcclxuICAgICAgZGVjaW1hbHM6IDgsXHJcbiAgICAgIGxvZ286ICdoZXgucG5nJyxcclxuICAgICAgaG9tZVVybDogJ2h0dHBzOi8vaGV4LmNvbScsXHJcbiAgICAgIGRleFNjcmVlbmVyVXJsOiAnaHR0cHM6Ly9kZXhzY3JlZW5lci5jb20vcHVsc2VjaGFpbi8weGYxZjRlZTYxMGIyYmFiYjA1YzYzNWY3MjZlZjhiMGM1NjhjOGRjNjUnXHJcbiAgICB9LFxyXG4gICAgJ1BMU1gnOiB7XHJcbiAgICAgIG5hbWU6ICdQdWxzZVgnLFxyXG4gICAgICBzeW1ib2w6ICdQTFNYJyxcclxuICAgICAgYWRkcmVzczogJzB4OTVCMzAzOTg3QTYwQzcxNTA0RDk5QWExYjEzQjREQTA3YjA3OTBhYicsXHJcbiAgICAgIGRlY2ltYWxzOiAxOCxcclxuICAgICAgbG9nbzogJ3Bsc3gucG5nJyxcclxuICAgICAgaG9tZVVybDogJ2h0dHBzOi8vcHVsc2V4LmNvbScsXHJcbiAgICAgIGRleFNjcmVlbmVyVXJsOiAnaHR0cHM6Ly9kZXhzY3JlZW5lci5jb20vcHVsc2VjaGFpbi8weDFiNDViOTE0ODc5MWQzYTEwNDE4NGNkNWRmZTVjZTU3MTkzYTNlZTknXHJcbiAgICB9LFxyXG4gICAgJ0lOQyc6IHtcclxuICAgICAgbmFtZTogJ0luY2VudGl2ZScsXHJcbiAgICAgIHN5bWJvbDogJ0lOQycsXHJcbiAgICAgIGFkZHJlc3M6ICcweDJmYTg3OEFiM0Y4N0NDMUM5NzM3RmMwNzExMDhGOTA0YzBCMEM5NWQnLFxyXG4gICAgICBkZWNpbWFsczogMTgsXHJcbiAgICAgIGxvZ286ICdpbmMuc3ZnJyxcclxuICAgICAgaG9tZVVybDogJ2h0dHBzOi8vaW5jZW50aXZldG9rZW4uaW8nLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL3B1bHNlY2hhaW4vMHhmODA4YmI2MjY1ZTljYTI3MDAyYzBhMDQ1NjJiZjUwZDRmZTM3ZWFhJ1xyXG4gICAgfSxcclxuICAgICdTYXZhbnQnOiB7XHJcbiAgICAgIG5hbWU6ICdTYXZhbnQnLFxyXG4gICAgICBzeW1ib2w6ICdTYXZhbnQnLFxyXG4gICAgICBhZGRyZXNzOiAnMHhmMTZlMTdlNGEwMWJmOTlCMEEwM0ZkM0FiNjk3YkM4NzkwNmUxODA5JyxcclxuICAgICAgZGVjaW1hbHM6IDE4LFxyXG4gICAgICBsb2dvOiAnc2F2YW50LTE5Mi5wbmcnLFxyXG4gICAgICBob21lVXJsOiAnaHR0cHM6Ly91c2NndmV0LmdpdGh1Yi5pby9TYXZhbnQvdHJhZGUuaHRtbCcsXHJcbiAgICAgIGRleFNjcmVlbmVyVXJsOiAnaHR0cHM6Ly9kZXhzY3JlZW5lci5jb20vcHVsc2VjaGFpbi8weGFhYTg4OTQ1ODRhYWYwMDkyMzcyZjBjNzUzNzY5YTUwZjYwNjA3NDInXHJcbiAgICB9LFxyXG4gICAgJ0hYUic6IHtcclxuICAgICAgbmFtZTogJ0hleFJld2FyZHMnLFxyXG4gICAgICBzeW1ib2w6ICdIWFInLFxyXG4gICAgICBhZGRyZXNzOiAnMHhDZkNiODlmMDA1NzZBNzc1ZDlmODE5NjFBMzdiYTdEQ2YxMkM3ZDlCJyxcclxuICAgICAgZGVjaW1hbHM6IDE4LFxyXG4gICAgICBsb2dvOiAnaGV4cmV3YXJkcy0xMDAwLnBuZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL3VzY2d2ZXQuZ2l0aHViLmlvL0hleFJld2FyZHMvJyxcclxuICAgICAgZGV4U2NyZWVuZXJVcmw6ICdodHRwczovL2RleHNjcmVlbmVyLmNvbS9wdWxzZWNoYWluLzB4ZDVhOGRlMDMzYzg2OTdjZWFhODQ0Y2E1OTZjYzc1ODNjNGY4ZjYxMidcclxuICAgIH0sXHJcbiAgICAnVEtSJzoge1xyXG4gICAgICBuYW1lOiAnVGFrZXInLFxyXG4gICAgICBzeW1ib2w6ICdUS1InLFxyXG4gICAgICBhZGRyZXNzOiAnMHhkOWU1OTAyMDA4OTkxNkE4RWZBN0RkMEI2MDVkNTUyMTlENzJkQjdCJyxcclxuICAgICAgZGVjaW1hbHM6IDE4LFxyXG4gICAgICBsb2dvOiAndGtyLnN2ZycsXHJcbiAgICAgIGhvbWVVcmw6ICdodHRwczovL3VzY2d2ZXQuZ2l0aHViLmlvL2pkYWktZGFwcC8nLFxyXG4gICAgICBkZXhTY3JlZW5lclVybDogJ2h0dHBzOi8vZGV4c2NyZWVuZXIuY29tL3B1bHNlY2hhaW4vMHgyMDVjNmQ0NGQ4NGU4MjYwNmU0ZTkyMWY4N2I1MWI3MWJhODVmMGYwJ1xyXG4gICAgfSxcclxuICAgICdKREFJJzoge1xyXG4gICAgICBuYW1lOiAnSkRBSSBVbnN0YWJsZWNvaW4nLFxyXG4gICAgICBzeW1ib2w6ICdKREFJJyxcclxuICAgICAgYWRkcmVzczogJzB4MTYxMEU3NUM5YjQ4QkY1NTAxMzc4MjA0NTJkRTQwNDliQjIyYkI3MicsXHJcbiAgICAgIGRlY2ltYWxzOiAxOCxcclxuICAgICAgbG9nbzogJ2pkYWkuc3ZnJyxcclxuICAgICAgaG9tZVVybDogJ2h0dHBzOi8vdXNjZ3ZldC5naXRodWIuaW8vamRhaS1kYXBwLycsXHJcbiAgICAgIGRleFNjcmVlbmVyVXJsOiAnaHR0cHM6Ly9kZXhzY3JlZW5lci5jb20vcHVsc2VjaGFpbi8weDcwNjU4Q2U2RDZDMDlhY2RFNjQ2RjZlYTlDNTdCYTY0ZjREYzM1MGYnXHJcbiAgICB9LFxyXG4gICAgJ1JpY2t5Jzoge1xyXG4gICAgICBuYW1lOiAnUmlja3knLFxyXG4gICAgICBzeW1ib2w6ICdSaWNreScsXHJcbiAgICAgIGFkZHJlc3M6ICcweDc5RkMwRTFkM0VDMDBkODFFNTQyM0RjQzAxQTYxN2IwZTEyNDVjMkInLFxyXG4gICAgICBkZWNpbWFsczogMTgsXHJcbiAgICAgIGxvZ286ICdyaWNreS5qcGcnLFxyXG4gICAgICBob21lVXJsOiAnaHR0cHM6Ly90cnV0aGJlaGluZHJpY2hhcmRoZWFydC5jb20vJyxcclxuICAgICAgZGV4U2NyZWVuZXJVcmw6ICdodHRwczovL2RleHNjcmVlbmVyLmNvbS9wdWxzZWNoYWluLzB4YmZlNWFlNDBiYmNhNzQ4Nzg0MTlhZDdkN2UxMTVhMzBjY2ZjNjJmMSdcclxuICAgIH1cclxuICB9LFxyXG4gIHB1bHNlY2hhaW5UZXN0bmV0OiB7XHJcbiAgICAnSEVBUlQnOiB7XHJcbiAgICAgIG5hbWU6ICdIZWFydFRva2VuJyxcclxuICAgICAgc3ltYm9sOiAnSEVBUlQnLFxyXG4gICAgICBhZGRyZXNzOiAnMHg3MzU3NDJEOGU1RmEzNWMxNjVkZWVlZDQ1NjBEZDkxQTE1QkExYUIyJyxcclxuICAgICAgZGVjaW1hbHM6IDE4LFxyXG4gICAgICBsb2dvOiAnaGVhcnQucG5nJ1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgZXRoZXJldW06IHtcclxuICAgICdIRVgnOiB7XHJcbiAgICAgIG5hbWU6ICdIRVgnLFxyXG4gICAgICBzeW1ib2w6ICdIRVgnLFxyXG4gICAgICBhZGRyZXNzOiAnMHgyYjU5MWU5OWFmZTlmMzJlYWE2MjE0ZjdiNzYyOTc2OGM0MGVlYjM5JyxcclxuICAgICAgZGVjaW1hbHM6IDgsXHJcbiAgICAgIGxvZ286ICdoZXgucG5nJyxcclxuICAgICAgaG9tZVVybDogJ2h0dHBzOi8vaGV4LmNvbScsXHJcbiAgICAgIGRleFNjcmVlbmVyVXJsOiAnaHR0cHM6Ly9kZXhzY3JlZW5lci5jb20vZXRoZXJldW0vMHg5ZTA5MDUyNDljZWVmZmZiOTYwNWUwMzRiNTM0NTQ0Njg0YTU4YmU2J1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgc2Vwb2xpYToge31cclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXRzIHN0b3JhZ2Uga2V5IGZvciBjdXN0b20gdG9rZW5zXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHJldHVybnMge3N0cmluZ31cclxuICovXHJcbmZ1bmN0aW9uIGdldFN0b3JhZ2VLZXkobmV0d29yaykge1xyXG4gIHJldHVybiBgY3VzdG9tX3Rva2Vuc18ke25ldHdvcmt9YDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgc3RvcmFnZSBrZXkgZm9yIGVuYWJsZWQgZGVmYXVsdCB0b2tlbnNcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0RGVmYXVsdFRva2Vuc0tleShuZXR3b3JrKSB7XHJcbiAgcmV0dXJuIGBlbmFibGVkX2RlZmF1bHRfdG9rZW5zXyR7bmV0d29ya31gO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyBhbGwgY3VzdG9tIHRva2VucyBmb3IgYSBuZXR3b3JrXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHJldHVybnMge1Byb21pc2U8QXJyYXk+fVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEN1c3RvbVRva2VucyhuZXR3b3JrKSB7XHJcbiAgY29uc3Qga2V5ID0gZ2V0U3RvcmFnZUtleShuZXR3b3JrKTtcclxuICBjb25zdCB0b2tlbnMgPSBhd2FpdCBsb2FkKGtleSk7XHJcbiAgcmV0dXJuIHRva2VucyB8fCBbXTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgZW5hYmxlZCBkZWZhdWx0IHRva2VucyBmb3IgYSBuZXR3b3JrXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHJldHVybnMge1Byb21pc2U8QXJyYXk8c3RyaW5nPj59IEFycmF5IG9mIGVuYWJsZWQgZGVmYXVsdCB0b2tlbiBzeW1ib2xzXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RW5hYmxlZERlZmF1bHRUb2tlbnMobmV0d29yaykge1xyXG4gIGNvbnN0IGtleSA9IGdldERlZmF1bHRUb2tlbnNLZXkobmV0d29yayk7XHJcbiAgY29uc3QgZW5hYmxlZCA9IGF3YWl0IGxvYWQoa2V5KTtcclxuICAvLyBJZiBub3RoaW5nIHN0b3JlZCwgYWxsIGRlZmF1bHRzIGFyZSBlbmFibGVkXHJcbiAgaWYgKCFlbmFibGVkKSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoREVGQVVMVF9UT0tFTlNbbmV0d29ya10gfHwge30pO1xyXG4gIH1cclxuICByZXR1cm4gZW5hYmxlZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgYWxsIHRva2VucyAoZGVmYXVsdCArIGN1c3RvbSkgZm9yIGEgbmV0d29ya1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn1cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBbGxUb2tlbnMobmV0d29yaykge1xyXG4gIGNvbnN0IGN1c3RvbVRva2VucyA9IGF3YWl0IGdldEN1c3RvbVRva2VucyhuZXR3b3JrKTtcclxuICBjb25zdCBlbmFibGVkRGVmYXVsdHMgPSBhd2FpdCBnZXRFbmFibGVkRGVmYXVsdFRva2VucyhuZXR3b3JrKTtcclxuXHJcbiAgY29uc3QgZGVmYXVsdFRva2VucyA9IFtdO1xyXG4gIGNvbnN0IG5ldHdvcmtEZWZhdWx0cyA9IERFRkFVTFRfVE9LRU5TW25ldHdvcmtdIHx8IHt9O1xyXG5cclxuICBmb3IgKGNvbnN0IHN5bWJvbCBvZiBlbmFibGVkRGVmYXVsdHMpIHtcclxuICAgIGlmIChuZXR3b3JrRGVmYXVsdHNbc3ltYm9sXSkge1xyXG4gICAgICBkZWZhdWx0VG9rZW5zLnB1c2goe1xyXG4gICAgICAgIC4uLm5ldHdvcmtEZWZhdWx0c1tzeW1ib2xdLFxyXG4gICAgICAgIGlzRGVmYXVsdDogdHJ1ZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBbLi4uZGVmYXVsdFRva2VucywgLi4uY3VzdG9tVG9rZW5zXTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZHMgYSBjdXN0b20gdG9rZW5cclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5BZGRyZXNzIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzc1xyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3Q+fSBBZGRlZCB0b2tlbiBvYmplY3RcclxuICogQHRocm93cyB7RXJyb3J9IElmIHRva2VuIGxpbWl0IHJlYWNoZWQsIGludmFsaWQgYWRkcmVzcywgb3IgYWxyZWFkeSBleGlzdHNcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhZGRDdXN0b21Ub2tlbihuZXR3b3JrLCB0b2tlbkFkZHJlc3MpIHtcclxuICAvLyBWYWxpZGF0ZSBhZGRyZXNzIGZvcm1hdFxyXG4gIHRva2VuQWRkcmVzcyA9IHRva2VuQWRkcmVzcy50cmltKCk7XHJcbiAgaWYgKCF0b2tlbkFkZHJlc3Muc3RhcnRzV2l0aCgnMHgnKSB8fCB0b2tlbkFkZHJlc3MubGVuZ3RoICE9PSA0Mikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHRva2VuIGFkZHJlc3MgZm9ybWF0Jyk7XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiBpdCdzIGEgZGVmYXVsdCB0b2tlblxyXG4gIGNvbnN0IG5ldHdvcmtEZWZhdWx0cyA9IERFRkFVTFRfVE9LRU5TW25ldHdvcmtdIHx8IHt9O1xyXG4gIGZvciAoY29uc3Qgc3ltYm9sIGluIG5ldHdvcmtEZWZhdWx0cykge1xyXG4gICAgaWYgKG5ldHdvcmtEZWZhdWx0c1tzeW1ib2xdLmFkZHJlc3MudG9Mb3dlckNhc2UoKSA9PT0gdG9rZW5BZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGlzIGlzIGEgZGVmYXVsdCB0b2tlbiAoJHtzeW1ib2x9KS4gVXNlIHRoZSBkZWZhdWx0IHRva2VucyBsaXN0IGluc3RlYWQuYCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBHZXQgY3VycmVudCBjdXN0b20gdG9rZW5zXHJcbiAgY29uc3QgY3VzdG9tVG9rZW5zID0gYXdhaXQgZ2V0Q3VzdG9tVG9rZW5zKG5ldHdvcmspO1xyXG5cclxuICAvLyBDaGVjayBsaW1pdFxyXG4gIGlmIChjdXN0b21Ub2tlbnMubGVuZ3RoID49IE1BWF9UT0tFTlNfUEVSX05FVFdPUkspIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgTWF4aW11bSAke01BWF9UT0tFTlNfUEVSX05FVFdPUkt9IGN1c3RvbSB0b2tlbnMgcGVyIG5ldHdvcmtgKTtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIGlmIGFscmVhZHkgZXhpc3RzXHJcbiAgY29uc3QgZXhpc3RzID0gY3VzdG9tVG9rZW5zLmZpbmQoXHJcbiAgICB0ID0+IHQuYWRkcmVzcy50b0xvd2VyQ2FzZSgpID09PSB0b2tlbkFkZHJlc3MudG9Mb3dlckNhc2UoKVxyXG4gICk7XHJcbiAgaWYgKGV4aXN0cykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdUb2tlbiBhbHJlYWR5IGFkZGVkJyk7XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSBjb250cmFjdCBhbmQgZmV0Y2ggbWV0YWRhdGFcclxuICBjb25zdCBpc1ZhbGlkID0gYXdhaXQgdmFsaWRhdGVUb2tlbkNvbnRyYWN0KG5ldHdvcmssIHRva2VuQWRkcmVzcyk7XHJcbiAgaWYgKCFpc1ZhbGlkKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgRVJDLTIwIHRva2VuIGNvbnRyYWN0Jyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBtZXRhZGF0YSA9IGF3YWl0IGdldFRva2VuTWV0YWRhdGEobmV0d29yaywgdG9rZW5BZGRyZXNzKTtcclxuXHJcbiAgLy8gQ3JlYXRlIHRva2VuIGVudHJ5XHJcbiAgY29uc3QgdG9rZW4gPSB7XHJcbiAgICBhZGRyZXNzOiB0b2tlbkFkZHJlc3MsXHJcbiAgICBuYW1lOiBtZXRhZGF0YS5uYW1lLFxyXG4gICAgc3ltYm9sOiBtZXRhZGF0YS5zeW1ib2wsXHJcbiAgICBkZWNpbWFsczogbWV0YWRhdGEuZGVjaW1hbHMsXHJcbiAgICBsb2dvOiBudWxsLFxyXG4gICAgaXNEZWZhdWx0OiBmYWxzZSxcclxuICAgIGFkZGVkQXQ6IERhdGUubm93KClcclxuICB9O1xyXG5cclxuICAvLyBBZGQgdG8gbGlzdFxyXG4gIGN1c3RvbVRva2Vucy5wdXNoKHRva2VuKTtcclxuXHJcbiAgLy8gU2F2ZVxyXG4gIGNvbnN0IGtleSA9IGdldFN0b3JhZ2VLZXkobmV0d29yayk7XHJcbiAgYXdhaXQgc2F2ZShrZXksIGN1c3RvbVRva2Vucyk7XHJcblxyXG4gIHJldHVybiB0b2tlbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlbW92ZXMgYSBjdXN0b20gdG9rZW5cclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5BZGRyZXNzIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzc1xyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW1vdmVDdXN0b21Ub2tlbihuZXR3b3JrLCB0b2tlbkFkZHJlc3MpIHtcclxuICBjb25zdCBjdXN0b21Ub2tlbnMgPSBhd2FpdCBnZXRDdXN0b21Ub2tlbnMobmV0d29yayk7XHJcblxyXG4gIGNvbnN0IGZpbHRlcmVkID0gY3VzdG9tVG9rZW5zLmZpbHRlcihcclxuICAgIHQgPT4gdC5hZGRyZXNzLnRvTG93ZXJDYXNlKCkgIT09IHRva2VuQWRkcmVzcy50b0xvd2VyQ2FzZSgpXHJcbiAgKTtcclxuXHJcbiAgY29uc3Qga2V5ID0gZ2V0U3RvcmFnZUtleShuZXR3b3JrKTtcclxuICBhd2FpdCBzYXZlKGtleSwgZmlsdGVyZWQpO1xyXG59XHJcblxyXG4vKipcclxuICogVG9nZ2xlcyBhIGRlZmF1bHQgdG9rZW4gb24vb2ZmXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHBhcmFtIHtzdHJpbmd9IHN5bWJvbCAtIFRva2VuIHN5bWJvbFxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGVuYWJsZWQgLSBFbmFibGUgb3IgZGlzYWJsZVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0b2dnbGVEZWZhdWx0VG9rZW4obmV0d29yaywgc3ltYm9sLCBlbmFibGVkKSB7XHJcbiAgY29uc3QgZW5hYmxlZFRva2VucyA9IGF3YWl0IGdldEVuYWJsZWREZWZhdWx0VG9rZW5zKG5ldHdvcmspO1xyXG5cclxuICBsZXQgdXBkYXRlZDtcclxuICBpZiAoZW5hYmxlZCkge1xyXG4gICAgLy8gQWRkIGlmIG5vdCBhbHJlYWR5IGluIGxpc3RcclxuICAgIGlmICghZW5hYmxlZFRva2Vucy5pbmNsdWRlcyhzeW1ib2wpKSB7XHJcbiAgICAgIHVwZGF0ZWQgPSBbLi4uZW5hYmxlZFRva2Vucywgc3ltYm9sXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybjsgLy8gQWxyZWFkeSBlbmFibGVkXHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIFJlbW92ZSBmcm9tIGxpc3RcclxuICAgIHVwZGF0ZWQgPSBlbmFibGVkVG9rZW5zLmZpbHRlcihzID0+IHMgIT09IHN5bWJvbCk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBrZXkgPSBnZXREZWZhdWx0VG9rZW5zS2V5KG5ldHdvcmspO1xyXG4gIGF3YWl0IHNhdmUoa2V5LCB1cGRhdGVkKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiBhIGRlZmF1bHQgdG9rZW4gaXMgZW5hYmxlZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzeW1ib2wgLSBUb2tlbiBzeW1ib2xcclxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNEZWZhdWx0VG9rZW5FbmFibGVkKG5ldHdvcmssIHN5bWJvbCkge1xyXG4gIGNvbnN0IGVuYWJsZWQgPSBhd2FpdCBnZXRFbmFibGVkRGVmYXVsdFRva2VucyhuZXR3b3JrKTtcclxuICByZXR1cm4gZW5hYmxlZC5pbmNsdWRlcyhzeW1ib2wpO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBDb250cmFjdCBEZWNvZGVyIFNlcnZpY2VcclxuICogTXVsdGktbGF5ZXIgQUJJIGZldGNoaW5nIGFuZCB0cmFuc2FjdGlvbiBkZWNvZGluZ1xyXG4gKlxyXG4gKiBGYWxsYmFjayBjaGFpbjpcclxuICogMS4gTG9jYWwgY2FjaGUgKGluc3RhbnQpXHJcbiAqIDIuIFB1bHNlU2NhbiBBUEkgKHZlcmlmaWVkIGNvbnRyYWN0cylcclxuICogMy4gU291cmNpZnkgZnVsbCBtYXRjaCAoZGVjZW50cmFsaXplZCB2ZXJpZmljYXRpb24pXHJcbiAqIDQuIFNvdXJjaWZ5IHBhcnRpYWwgbWF0Y2ggKHNpbWlsYXIgY29udHJhY3RzKVxyXG4gKiA1LiA0Ynl0ZSBkaXJlY3RvcnkgKGZ1bmN0aW9uIHNpZ25hdHVyZXMgb25seSlcclxuICovXHJcblxyXG5pbXBvcnQgeyBldGhlcnMgfSBmcm9tICdldGhlcnMnO1xyXG5cclxuLy8gQ2FjaGUgY29uZmlndXJhdGlvblxyXG5jb25zdCBBQklfQ0FDSEVfS0VZX1BSRUZJWCA9ICdhYmlfY2FjaGVfJztcclxuY29uc3QgQ0FDSEVfVFRMID0gNyAqIDI0ICogNjAgKiA2MCAqIDEwMDA7IC8vIDcgZGF5c1xyXG5cclxuLy8gQ29tbW9uIGZ1bmN0aW9uIHNpZ25hdHVyZXMgZm9yIGluc3RhbnQgcmVjb2duaXRpb25cclxuY29uc3QgQ09NTU9OX0ZVTkNUSU9OUyA9IHtcclxuICAnMHgwOTVlYTdiMyc6IHsgbmFtZTogJ2FwcHJvdmUnLCBkZXNjcmlwdGlvbjogJ0FwcHJvdmUgdG9rZW4gc3BlbmRpbmcnLCBjYXRlZ29yeTogJ3Rva2VuJyB9LFxyXG4gICcweGE5MDU5Y2JiJzogeyBuYW1lOiAndHJhbnNmZXInLCBkZXNjcmlwdGlvbjogJ1RyYW5zZmVyIHRva2VucycsIGNhdGVnb3J5OiAndG9rZW4nIH0sXHJcbiAgJzB4MjNiODcyZGQnOiB7IG5hbWU6ICd0cmFuc2ZlckZyb20nLCBkZXNjcmlwdGlvbjogJ1RyYW5zZmVyIHRva2VucyBmcm9tIGFkZHJlc3MnLCBjYXRlZ29yeTogJ3Rva2VuJyB9LFxyXG4gICcweDM4ZWQxNzM5JzogeyBuYW1lOiAnc3dhcEV4YWN0VG9rZW5zRm9yVG9rZW5zJywgZGVzY3JpcHRpb246ICdTd2FwIGV4YWN0IHRva2VucyBmb3IgdG9rZW5zJywgY2F0ZWdvcnk6ICdkZXgnIH0sXHJcbiAgJzB4N2ZmMzZhYjUnOiB7IG5hbWU6ICdzd2FwRXhhY3RFVEhGb3JUb2tlbnMnLCBkZXNjcmlwdGlvbjogJ1N3YXAgZXhhY3QgRVRIIGZvciB0b2tlbnMnLCBjYXRlZ29yeTogJ2RleCcgfSxcclxuICAnMHgxOGNiYWZlNSc6IHsgbmFtZTogJ3N3YXBFeGFjdFRva2Vuc0ZvckVUSCcsIGRlc2NyaXB0aW9uOiAnU3dhcCBleGFjdCB0b2tlbnMgZm9yIEVUSCcsIGNhdGVnb3J5OiAnZGV4JyB9LFxyXG4gICcweGZiM2JkYjQxJzogeyBuYW1lOiAnc3dhcEVUSEZvckV4YWN0VG9rZW5zJywgZGVzY3JpcHRpb246ICdTd2FwIEVUSCBmb3IgZXhhY3QgdG9rZW5zJywgY2F0ZWdvcnk6ICdkZXgnIH0sXHJcbiAgJzB4ODgwM2RiZWUnOiB7IG5hbWU6ICdzd2FwVG9rZW5zRm9yRXhhY3RUb2tlbnMnLCBkZXNjcmlwdGlvbjogJ1N3YXAgdG9rZW5zIGZvciBleGFjdCB0b2tlbnMnLCBjYXRlZ29yeTogJ2RleCcgfSxcclxuICAnMHg0MGMxMGYxOSc6IHsgbmFtZTogJ21pbnQnLCBkZXNjcmlwdGlvbjogJ01pbnQgdG9rZW5zJywgY2F0ZWdvcnk6ICd0b2tlbicgfSxcclxuICAnMHg0Mjk2NmM2OCc6IHsgbmFtZTogJ2J1cm4nLCBkZXNjcmlwdGlvbjogJ0J1cm4gdG9rZW5zJywgY2F0ZWdvcnk6ICd0b2tlbicgfSxcclxuICAnMHhhNjk0ZmMzYSc6IHsgbmFtZTogJ3N0YWtlJywgZGVzY3JpcHRpb246ICdTdGFrZSB0b2tlbnMnLCBjYXRlZ29yeTogJ2RlZmknIH0sXHJcbiAgJzB4MmUxYTdkNGQnOiB7IG5hbWU6ICd3aXRoZHJhdycsIGRlc2NyaXB0aW9uOiAnV2l0aGRyYXcgdG9rZW5zJywgY2F0ZWdvcnk6ICdkZWZpJyB9LFxyXG4gICcweGI2YjU1ZjI1JzogeyBuYW1lOiAnZGVwb3NpdCcsIGRlc2NyaXB0aW9uOiAnRGVwb3NpdCB0b2tlbnMnLCBjYXRlZ29yeTogJ2RlZmknIH0sXHJcbiAgJzB4M2NjZmQ2MGInOiB7IG5hbWU6ICd3aXRoZHJhdycsIGRlc2NyaXB0aW9uOiAnV2l0aGRyYXcnLCBjYXRlZ29yeTogJ2RlZmknIH1cclxufTtcclxuXHJcbi8vIEJsb2NrIGV4cGxvcmVyIFVSTHMgYnkgY2hhaW5cclxuY29uc3QgRVhQTE9SRVJfVVJMUyA9IHtcclxuICAzNjk6ICdodHRwczovL3NjYW4ubXlwaW5hdGEuY2xvdWQvaXBmcy9iYWZ5YmVpZW54eW95cmhuNXRzd2NsdmQzZ2RqeTVtdGtrd211MzdhcXRtbDZvbmJmN3huYjNvMjJwZScsXHJcbiAgOTQzOiAnaHR0cHM6Ly9zY2FuLnY0LnRlc3RuZXQucHVsc2VjaGFpbi5jb20nLFxyXG4gIDE6ICdodHRwczovL2V0aGVyc2Nhbi5pbycsXHJcbiAgMTExNTUxMTE6ICdodHRwczovL3NlcG9saWEuZXRoZXJzY2FuLmlvJ1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCBBQkkgZnJvbSBsb2NhbCBjYWNoZVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0Q2FjaGVkQUJJKGFkZHJlc3MsIGNoYWluSWQpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3Qga2V5ID0gYCR7QUJJX0NBQ0hFX0tFWV9QUkVGSVh9JHtjaGFpbklkfV8ke2FkZHJlc3MudG9Mb3dlckNhc2UoKX1gO1xyXG4gICAgY29uc3QgY2FjaGVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcclxuXHJcbiAgICBpZiAoIWNhY2hlZCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UoY2FjaGVkKTtcclxuXHJcbiAgICAvLyBDaGVjayBpZiBjYWNoZSBpcyBzdGlsbCB2YWxpZFxyXG4gICAgaWYgKERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcCA+IENBQ0hFX1RUTCkge1xyXG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGF0YS5hYmk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHJlYWRpbmcgQUJJIGNhY2hlOicsIGVycm9yKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFNhdmUgQUJJIHRvIGxvY2FsIGNhY2hlXHJcbiAqL1xyXG5mdW5jdGlvbiBjYWNoZUFCSShhZGRyZXNzLCBjaGFpbklkLCBhYmksIHNvdXJjZSkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBrZXkgPSBgJHtBQklfQ0FDSEVfS0VZX1BSRUZJWH0ke2NoYWluSWR9XyR7YWRkcmVzcy50b0xvd2VyQ2FzZSgpfWA7XHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgYWJpLFxyXG4gICAgICBzb3VyY2UsXHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxyXG4gICAgfSkpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjYWNoaW5nIEFCSTonLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogRmV0Y2ggQUJJIGZyb20gUHVsc2VTY2FuIChCbG9ja1Njb3V0KVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZmV0Y2hGcm9tUHVsc2VTY2FuKGFkZHJlc3MsIGNoYWluSWQpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgYmFzZVVybCA9IGNoYWluSWQgPT09IDM2OVxyXG4gICAgICA/ICdodHRwczovL2FwaS5zY2FuLnB1bHNlY2hhaW4uY29tJ1xyXG4gICAgICA6IGNoYWluSWQgPT09IDk0M1xyXG4gICAgICA/ICdodHRwczovL3NjYW4udjQudGVzdG5ldC5wdWxzZWNoYWluLmNvbSdcclxuICAgICAgOiBudWxsO1xyXG5cclxuICAgIGlmICghYmFzZVVybCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZVVybH0vYXBpP21vZHVsZT1jb250cmFjdCZhY3Rpb249Z2V0YWJpJmFkZHJlc3M9JHthZGRyZXNzfWA7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCk7XHJcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG5cclxuICAgIGlmIChkYXRhLnN0YXR1cyA9PT0gXCIxXCIgJiYgZGF0YS5yZXN1bHQgJiYgZGF0YS5yZXN1bHQgIT09IFwiQ29udHJhY3Qgc291cmNlIGNvZGUgbm90IHZlcmlmaWVkXCIpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBhYmk6IEpTT04ucGFyc2UoZGF0YS5yZXN1bHQpLFxyXG4gICAgICAgIHNvdXJjZTogJ3B1bHNlc2NhbicsXHJcbiAgICAgICAgdmVyaWZpZWQ6IHRydWVcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignUHVsc2VTY2FuIGZldGNoIGVycm9yOicsIGVycm9yKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZldGNoIEFCSSBmcm9tIFNvdXJjaWZ5XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBmZXRjaEZyb21Tb3VyY2lmeShhZGRyZXNzLCBjaGFpbklkLCBtYXRjaFR5cGUgPSAnZnVsbF9tYXRjaCcpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vcmVwby5zb3VyY2lmeS5kZXYvY29udHJhY3RzLyR7bWF0Y2hUeXBlfS8ke2NoYWluSWR9LyR7YWRkcmVzc30vbWV0YWRhdGEuanNvbmA7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCk7XHJcblxyXG4gICAgaWYgKCFyZXNwb25zZS5vaykgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgY29uc3QgbWV0YWRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcblxyXG4gICAgaWYgKG1ldGFkYXRhLm91dHB1dCAmJiBtZXRhZGF0YS5vdXRwdXQuYWJpKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgYWJpOiBtZXRhZGF0YS5vdXRwdXQuYWJpLFxyXG4gICAgICAgIHNvdXJjZTogYHNvdXJjaWZ5XyR7bWF0Y2hUeXBlfWAsXHJcbiAgICAgICAgdmVyaWZpZWQ6IHRydWVcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcihgU291cmNpZnkgJHttYXRjaFR5cGV9IGZldGNoIGVycm9yOmAsIGVycm9yKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZldGNoIGZ1bmN0aW9uIHNpZ25hdHVyZSBmcm9tIDRieXRlIGRpcmVjdG9yeVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZmV0Y2g0Ynl0ZVNpZ25hdHVyZShzZWxlY3Rvcikge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cuNGJ5dGUuZGlyZWN0b3J5L2FwaS92MS9zaWduYXR1cmVzLz9oZXhfc2lnbmF0dXJlPSR7c2VsZWN0b3J9YDtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsKTtcclxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcblxyXG4gICAgaWYgKGRhdGEucmVzdWx0cyAmJiBkYXRhLnJlc3VsdHMubGVuZ3RoID4gMCkge1xyXG4gICAgICByZXR1cm4gZGF0YS5yZXN1bHRzWzBdLnRleHRfc2lnbmF0dXJlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCc0Ynl0ZSBmZXRjaCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgY29udHJhY3QgQUJJIHdpdGggbXVsdGktbGF5ZXIgZmFsbGJhY2tcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDb250cmFjdEFCSShhZGRyZXNzLCBjaGFpbklkID0gMzY5KSB7XHJcbiAgaWYgKCFhZGRyZXNzIHx8IGFkZHJlc3MgPT09ICcweDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAnKSB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIC8vIExheWVyIDE6IENoZWNrIGNhY2hlXHJcbiAgY29uc3QgY2FjaGVkID0gZ2V0Q2FjaGVkQUJJKGFkZHJlc3MsIGNoYWluSWQpO1xyXG4gIGlmIChjYWNoZWQpIHtcclxuICAgIGNvbnNvbGUubG9nKCfwn6uAIEFCSSBsb2FkZWQgZnJvbSBjYWNoZScpO1xyXG4gICAgcmV0dXJuIHsgYWJpOiBjYWNoZWQsIHNvdXJjZTogJ2NhY2hlJywgdmVyaWZpZWQ6IHRydWUgfTtcclxuICB9XHJcblxyXG4gIGNvbnNvbGUubG9nKCfwn6uAIEZldGNoaW5nIEFCSSBmb3InLCBhZGRyZXNzKTtcclxuXHJcbiAgLy8gTGF5ZXIgMjogVHJ5IFB1bHNlU2NhblxyXG4gIGNvbnN0IHB1bHNlU2NhblJlc3VsdCA9IGF3YWl0IGZldGNoRnJvbVB1bHNlU2NhbihhZGRyZXNzLCBjaGFpbklkKTtcclxuICBpZiAocHVsc2VTY2FuUmVzdWx0KSB7XHJcbiAgICBjb25zb2xlLmxvZygn8J+rgCBBQkkgZm91bmQgb24gUHVsc2VTY2FuJyk7XHJcbiAgICBjYWNoZUFCSShhZGRyZXNzLCBjaGFpbklkLCBwdWxzZVNjYW5SZXN1bHQuYWJpLCBwdWxzZVNjYW5SZXN1bHQuc291cmNlKTtcclxuICAgIHJldHVybiBwdWxzZVNjYW5SZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvLyBMYXllciAzOiBUcnkgU291cmNpZnkgZnVsbCBtYXRjaFxyXG4gIGNvbnN0IHNvdXJjaWZ5RnVsbFJlc3VsdCA9IGF3YWl0IGZldGNoRnJvbVNvdXJjaWZ5KGFkZHJlc3MsIGNoYWluSWQsICdmdWxsX21hdGNoJyk7XHJcbiAgaWYgKHNvdXJjaWZ5RnVsbFJlc3VsdCkge1xyXG4gICAgY29uc29sZS5sb2coJ/Cfq4AgQUJJIGZvdW5kIG9uIFNvdXJjaWZ5IChmdWxsIG1hdGNoKScpO1xyXG4gICAgY2FjaGVBQkkoYWRkcmVzcywgY2hhaW5JZCwgc291cmNpZnlGdWxsUmVzdWx0LmFiaSwgc291cmNpZnlGdWxsUmVzdWx0LnNvdXJjZSk7XHJcbiAgICByZXR1cm4gc291cmNpZnlGdWxsUmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLy8gTGF5ZXIgNDogVHJ5IFNvdXJjaWZ5IHBhcnRpYWwgbWF0Y2hcclxuICBjb25zdCBzb3VyY2lmeVBhcnRpYWxSZXN1bHQgPSBhd2FpdCBmZXRjaEZyb21Tb3VyY2lmeShhZGRyZXNzLCBjaGFpbklkLCAncGFydGlhbF9tYXRjaCcpO1xyXG4gIGlmIChzb3VyY2lmeVBhcnRpYWxSZXN1bHQpIHtcclxuICAgIGNvbnNvbGUubG9nKCfwn6uAIEFCSSBmb3VuZCBvbiBTb3VyY2lmeSAocGFydGlhbCBtYXRjaCknKTtcclxuICAgIGNhY2hlQUJJKGFkZHJlc3MsIGNoYWluSWQsIHNvdXJjaWZ5UGFydGlhbFJlc3VsdC5hYmksIHNvdXJjaWZ5UGFydGlhbFJlc3VsdC5zb3VyY2UpO1xyXG4gICAgcmV0dXJuIHNvdXJjaWZ5UGFydGlhbFJlc3VsdDtcclxuICB9XHJcblxyXG4gIGNvbnNvbGUubG9nKCfwn6uAIE5vIEFCSSBmb3VuZCBmb3IgY29udHJhY3QnKTtcclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuLyoqXHJcbiAqIERlY29kZSB0cmFuc2FjdGlvbiBkYXRhXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjb2RlVHJhbnNhY3Rpb24odHhSZXF1ZXN0LCBjaGFpbklkID0gMzY5KSB7XHJcbiAgY29uc3QgYWRkcmVzcyA9IHR4UmVxdWVzdC50bztcclxuICBjb25zdCBkYXRhID0gdHhSZXF1ZXN0LmRhdGE7XHJcblxyXG4gIC8vIFNpbXBsZSBFVEggdHJhbnNmZXIgKG5vIGRhdGEpXHJcbiAgaWYgKCFkYXRhIHx8IGRhdGEgPT09ICcweCcgfHwgZGF0YS5sZW5ndGggPD0gMikge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogJ3RyYW5zZmVyJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdTaW1wbGUgVHJhbnNmZXInLFxyXG4gICAgICBtZXRob2Q6IG51bGwsXHJcbiAgICAgIHBhcmFtczogW10sXHJcbiAgICAgIGNvbnRyYWN0OiBudWxsLFxyXG4gICAgICBleHBsb3JlclVybDogZ2V0RXhwbG9yZXJVcmwoY2hhaW5JZCwgYWRkcmVzcylcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCBmdW5jdGlvblNlbGVjdG9yID0gZGF0YS5zbGljZSgwLCAxMCk7XHJcblxyXG4gIC8vIENoZWNrIGNvbW1vbiBmdW5jdGlvbnMgZmlyc3QgKGluc3RhbnQgcmVjb2duaXRpb24pXHJcbiAgY29uc3QgY29tbW9uRnVuYyA9IENPTU1PTl9GVU5DVElPTlNbZnVuY3Rpb25TZWxlY3Rvcl07XHJcbiAgaWYgKGNvbW1vbkZ1bmMpIHtcclxuICAgIGNvbnNvbGUubG9nKCfwn6uAIFJlY29nbml6ZWQgY29tbW9uIGZ1bmN0aW9uOicsIGNvbW1vbkZ1bmMubmFtZSk7XHJcbiAgfVxyXG5cclxuICAvLyBUcnkgdG8gZ2V0IGZ1bGwgQUJJXHJcbiAgY29uc3QgYWJpUmVzdWx0ID0gYXdhaXQgZ2V0Q29udHJhY3RBQkkoYWRkcmVzcywgY2hhaW5JZCk7XHJcblxyXG4gIGlmIChhYmlSZXN1bHQgJiYgYWJpUmVzdWx0LmFiaSkge1xyXG4gICAgLy8gRnVsbCBkZWNvZGUgd2l0aCBBQklcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGNvbnRyYWN0ID0gbmV3IGV0aGVycy5JbnRlcmZhY2UoYWJpUmVzdWx0LmFiaSk7XHJcbiAgICAgIGNvbnN0IGRlY29kZWQgPSBjb250cmFjdC5wYXJzZVRyYW5zYWN0aW9uKHsgZGF0YSB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgdHlwZTogJ2NvbnRyYWN0X2NhbGwnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiBjb21tb25GdW5jID8gY29tbW9uRnVuYy5kZXNjcmlwdGlvbiA6ICdDb250cmFjdCBJbnRlcmFjdGlvbicsXHJcbiAgICAgICAgbWV0aG9kOiBkZWNvZGVkLm5hbWUsXHJcbiAgICAgICAgc2lnbmF0dXJlOiBkZWNvZGVkLnNpZ25hdHVyZSxcclxuICAgICAgICBwYXJhbXM6IGZvcm1hdFBhcmFtZXRlcnMoZGVjb2RlZC5mcmFnbWVudCwgZGVjb2RlZC5hcmdzKSxcclxuICAgICAgICBjb250cmFjdDoge1xyXG4gICAgICAgICAgYWRkcmVzcyxcclxuICAgICAgICAgIHZlcmlmaWVkOiBhYmlSZXN1bHQudmVyaWZpZWQsXHJcbiAgICAgICAgICBzb3VyY2U6IGFiaVJlc3VsdC5zb3VyY2VcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4cGxvcmVyVXJsOiBnZXRFeHBsb3JlclVybChjaGFpbklkLCBhZGRyZXNzKSxcclxuICAgICAgICBjYXRlZ29yeTogY29tbW9uRnVuYyA/IGNvbW1vbkZ1bmMuY2F0ZWdvcnkgOiAnY29udHJhY3QnXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkZWNvZGluZyB3aXRoIEFCSTonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBGYWxsYmFjayB0byBmdW5jdGlvbiBzaWduYXR1cmUgbG9va3VwXHJcbiAgbGV0IGZ1bmN0aW9uU2lnbmF0dXJlID0gbnVsbDtcclxuICBpZiAoY29tbW9uRnVuYykge1xyXG4gICAgZnVuY3Rpb25TaWduYXR1cmUgPSBjb21tb25GdW5jLm5hbWU7XHJcbiAgfSBlbHNlIHtcclxuICAgIGZ1bmN0aW9uU2lnbmF0dXJlID0gYXdhaXQgZmV0Y2g0Ynl0ZVNpZ25hdHVyZShmdW5jdGlvblNlbGVjdG9yKTtcclxuICB9XHJcblxyXG4gIGlmIChmdW5jdGlvblNpZ25hdHVyZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogJ3NpZ25hdHVyZV9tYXRjaCcsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBjb21tb25GdW5jID8gY29tbW9uRnVuYy5kZXNjcmlwdGlvbiA6ICdDb250cmFjdCBDYWxsJyxcclxuICAgICAgbWV0aG9kOiBmdW5jdGlvblNpZ25hdHVyZSxcclxuICAgICAgc2lnbmF0dXJlOiBmdW5jdGlvblNpZ25hdHVyZSxcclxuICAgICAgcGFyYW1zOiBbXSxcclxuICAgICAgY29udHJhY3Q6IHtcclxuICAgICAgICBhZGRyZXNzLFxyXG4gICAgICAgIHZlcmlmaWVkOiBmYWxzZSxcclxuICAgICAgICBzb3VyY2U6ICdzaWduYXR1cmVfb25seSdcclxuICAgICAgfSxcclxuICAgICAgZXhwbG9yZXJVcmw6IGdldEV4cGxvcmVyVXJsKGNoYWluSWQsIGFkZHJlc3MpLFxyXG4gICAgICByYXdEYXRhOiBkYXRhLFxyXG4gICAgICBjYXRlZ29yeTogY29tbW9uRnVuYyA/IGNvbW1vbkZ1bmMuY2F0ZWdvcnkgOiAndW5rbm93bidcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBMYXN0IHJlc29ydCAtIHVua25vd25cclxuICByZXR1cm4ge1xyXG4gICAgdHlwZTogJ3Vua25vd24nLFxyXG4gICAgZGVzY3JpcHRpb246ICdVbmtub3duIENvbnRyYWN0IENhbGwnLFxyXG4gICAgbWV0aG9kOiAnVW5rbm93bicsXHJcbiAgICBzaWduYXR1cmU6IG51bGwsXHJcbiAgICBwYXJhbXM6IFtdLFxyXG4gICAgY29udHJhY3Q6IHtcclxuICAgICAgYWRkcmVzcyxcclxuICAgICAgdmVyaWZpZWQ6IGZhbHNlLFxyXG4gICAgICBzb3VyY2U6ICd1bmtub3duJ1xyXG4gICAgfSxcclxuICAgIGV4cGxvcmVyVXJsOiBnZXRFeHBsb3JlclVybChjaGFpbklkLCBhZGRyZXNzKSxcclxuICAgIHJhd0RhdGE6IGRhdGEsXHJcbiAgICBmdW5jdGlvblNlbGVjdG9yXHJcbiAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCBwYXJhbWV0ZXJzIGZvciBkaXNwbGF5XHJcbiAqL1xyXG5mdW5jdGlvbiBmb3JtYXRQYXJhbWV0ZXJzKGZyYWdtZW50LCBhcmdzKSB7XHJcbiAgY29uc3QgcGFyYW1zID0gW107XHJcblxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZnJhZ21lbnQuaW5wdXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjb25zdCBpbnB1dCA9IGZyYWdtZW50LmlucHV0c1tpXTtcclxuICAgIGNvbnN0IHZhbHVlID0gYXJnc1tpXTtcclxuXHJcbiAgICBwYXJhbXMucHVzaCh7XHJcbiAgICAgIG5hbWU6IGlucHV0Lm5hbWUgfHwgYHBhcmFtJHtpfWAsXHJcbiAgICAgIHR5cGU6IGlucHV0LnR5cGUsXHJcbiAgICAgIHZhbHVlOiBmb3JtYXRWYWx1ZSh2YWx1ZSwgaW5wdXQudHlwZSlcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHBhcmFtcztcclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB2YWx1ZSBiYXNlZCBvbiB0eXBlXHJcbiAqL1xyXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZSh2YWx1ZSwgdHlwZSkge1xyXG4gIHRyeSB7XHJcbiAgICBpZiAodHlwZS5pbmNsdWRlcygnW10nKSkge1xyXG4gICAgICAvLyBBcnJheSB0eXBlXHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiB2YWx1ZS5tYXAodiA9PiBmb3JtYXRWYWx1ZSh2LCB0eXBlLnJlcGxhY2UoJ1tdJywgJycpKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZS5zdGFydHNXaXRoKCd1aW50JykgfHwgdHlwZS5zdGFydHNXaXRoKCdpbnQnKSkge1xyXG4gICAgICAvLyBOdW1iZXIgdHlwZVxyXG4gICAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZSA9PT0gJ2FkZHJlc3MnKSB7XHJcbiAgICAgIC8vIEFkZHJlc3MgdHlwZVxyXG4gICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGUgPT09ICdib29sJykge1xyXG4gICAgICAvLyBCb29sZWFuIHR5cGVcclxuICAgICAgcmV0dXJuIHZhbHVlID8gJ3RydWUnIDogJ2ZhbHNlJztcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZSA9PT0gJ2J5dGVzJyB8fCB0eXBlLnN0YXJ0c1dpdGgoJ2J5dGVzJykpIHtcclxuICAgICAgLy8gQnl0ZXMgdHlwZVxyXG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPiA2NiA/IHZhbHVlLnNsaWNlKDAsIDY2KSArICcuLi4nIDogdmFsdWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBEZWZhdWx0OiBjb252ZXJ0IHRvIHN0cmluZ1xyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZm9ybWF0dGluZyB2YWx1ZTonLCBlcnJvcik7XHJcbiAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgYmxvY2sgZXhwbG9yZXIgVVJMXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRFeHBsb3JlclVybChjaGFpbklkLCBhZGRyZXNzKSB7XHJcbiAgY29uc3QgYmFzZVVybCA9IEVYUExPUkVSX1VSTFNbY2hhaW5JZF0gfHwgRVhQTE9SRVJfVVJMU1szNjldO1xyXG5cclxuICAvLyBQdWxzZUNoYWluIHVzZXMgaGFzaC1iYXNlZCByb3V0aW5nIHdpdGggSVBGUyBleHBsb3JlclxyXG4gIGlmIChjaGFpbklkID09PSAzNjkpIHtcclxuICAgIHJldHVybiBgJHtiYXNlVXJsfS8jL2FkZHJlc3MvJHthZGRyZXNzfT90YWI9Y29udHJhY3RgO1xyXG4gIH1cclxuXHJcbiAgLy8gT3RoZXIgY2hhaW5zIHVzZSBzdGFuZGFyZCBwYXRoLWJhc2VkIHJvdXRpbmdcclxuICByZXR1cm4gYCR7YmFzZVVybH0vYWRkcmVzcy8ke2FkZHJlc3N9YDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENsZWFyIGFsbCBjYWNoZWQgQUJJcyAoZm9yIHRyb3VibGVzaG9vdGluZylcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjbGVhckFCSUNhY2hlKCkge1xyXG4gIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhsb2NhbFN0b3JhZ2UpO1xyXG4gIGxldCBjbGVhcmVkID0gMDtcclxuXHJcbiAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xyXG4gICAgaWYgKGtleS5zdGFydHNXaXRoKEFCSV9DQUNIRV9LRVlfUFJFRklYKSkge1xyXG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpO1xyXG4gICAgICBjbGVhcmVkKys7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zb2xlLmxvZyhg8J+rgCBDbGVhcmVkICR7Y2xlYXJlZH0gY2FjaGVkIEFCSXNgKTtcclxuICByZXR1cm4gY2xlYXJlZDtcclxufVxyXG4iLCIvKipcclxuICogUHJpY2UgT3JhY2xlIC0gRmV0Y2hlcyB0b2tlbiBwcmljZXMgZnJvbSBQdWxzZVggbGlxdWlkaXR5IHBvb2xzXHJcbiAqIFVzZXMgb24tY2hhaW4gcmVzZXJ2ZSBkYXRhIHRvIGNhbGN1bGF0ZSByZWFsLXRpbWUgREVYIHByaWNlc1xyXG4gKiBQcml2YWN5LXByZXNlcnZpbmc6IG9ubHkgdXNlcyBSUEMgY2FsbHMsIG5vIGV4dGVybmFsIEFQSXNcclxuICovXHJcblxyXG5pbXBvcnQgeyBldGhlcnMgfSBmcm9tICdldGhlcnMnO1xyXG5cclxuLy8gUHVsc2VYIFYyIFBhaXIgQUJJIChvbmx5IGdldFJlc2VydmVzIGZ1bmN0aW9uKVxyXG5jb25zdCBQQUlSX0FCSSA9IFtcclxuICAnZnVuY3Rpb24gZ2V0UmVzZXJ2ZXMoKSBleHRlcm5hbCB2aWV3IHJldHVybnMgKHVpbnQxMTIgcmVzZXJ2ZTAsIHVpbnQxMTIgcmVzZXJ2ZTEsIHVpbnQzMiBibG9ja1RpbWVzdGFtcExhc3QpJyxcclxuICAnZnVuY3Rpb24gdG9rZW4wKCkgZXh0ZXJuYWwgdmlldyByZXR1cm5zIChhZGRyZXNzKScsXHJcbiAgJ2Z1bmN0aW9uIHRva2VuMSgpIGV4dGVybmFsIHZpZXcgcmV0dXJucyAoYWRkcmVzcyknXHJcbl07XHJcblxyXG4vLyBLbm93biBQdWxzZVggVjIgcGFpciBhZGRyZXNzZXMgb24gUHVsc2VDaGFpbiBtYWlubmV0XHJcbi8vIEFsbCBhZGRyZXNzZXMgYXJlIGNoZWNrc3VtbWVkIGZvciBldGhlcnMuanMgdjYgY29tcGF0aWJpbGl0eVxyXG5jb25zdCBQVUxTRVhfUEFJUlMgPSB7XHJcbiAgcHVsc2VjaGFpbjoge1xyXG4gICAgLy8gUExTL0RBSSAtIFByaWNlIGFuY2hvciBmb3IgVVNEIGNvbnZlcnNpb25cclxuICAgICdQTFNfREFJJzogJzB4RTU2MDQzNjcxZGY1NWRFNUNEZjg0NTk3MTA0MzNDMTAzMjRERTBhRScsIC8vIE1heSBub3QgZXhpc3QsIGZhbGxiYWNrIHRvIFVTRENcclxuXHJcbiAgICAvLyBNYWpvciB0b2tlbiBwYWlycyAoYWxsIHBhaXJlZCB3aXRoIFdQTFMpXHJcbiAgICAnSEVYX1BMUyc6ICcweGYxRjRlZTYxMGIyYkFiQjA1QzYzNUY3MjZlRjhCMEM1NjhjOGRjNjUnLFxyXG4gICAgJ1BMU1hfUExTJzogJzB4MWI0NWI5MTQ4NzkxZDNhMTA0MTg0Q2Q1REZFNUNFNTcxOTNhM2VlOScsXHJcbiAgICAnSU5DX1BMUyc6ICcweGY4MDhCYjYyNjVlOUNhMjcwMDJjMEEwNDU2MkJmNTBkNEZFMzdFQUEnLCAvLyBGcm9tIEdlY2tvVGVybWluYWwgKGNoZWNrc3VtbWVkKVxyXG4gICAgJ1NhdmFudF9QTFMnOiAnMHhhQUE4ODk0NTg0YUFGMDA5MjM3MmYwQzc1Mzc2OWE1MGY2MDYwNzQyJyxcclxuICAgICdIWFJfUExTJzogJzB4RDVBOGRlMDMzYzg2OTdjRWFhODQ0Q0E1OTZjYzc1ODNjNGY4RjYxMicsXHJcbiAgICAnVEtSX1BMUyc6ICcweDIwNUM2ZDQ0ZDg0RTgyNjA2RTRFOTIxZjg3YjUxYjcxYmE4NUYwZjAnLFxyXG4gICAgJ0pEQUlfUExTJzogJzB4NzA2NThDZTZENkMwOWFjZEU2NDZGNmVhOUM1N0JhNjRmNERjMzUwZicsXHJcbiAgICAnUmlja3lfUExTJzogJzB4YmZlNWFlNDBiYmNhNzQ4Nzg0MTlhZDdkN2UxMTVhMzBjY2ZjNjJmMSdcclxuICB9XHJcbn07XHJcblxyXG4vLyBUb2tlbiBhZGRyZXNzZXMgYW5kIGRlY2ltYWxzIGZvciBwcmljZSByb3V0aW5nIChhbGwgY2hlY2tzdW1tZWQpXHJcbmNvbnN0IFRPS0VOX0FERFJFU1NFUyA9IHtcclxuICBwdWxzZWNoYWluOiB7XHJcbiAgICBXUExTOiB7IGFkZHJlc3M6ICcweEExMDc3YTI5NGRERTFCMDliQjA3ODg0NGRmNDA3NThhNUQwZjlhMjcnLCBkZWNpbWFsczogMTggfSxcclxuICAgIERBSTogeyBhZGRyZXNzOiAnMHhlZkQ3NjZjQ2IzOEVhRjFkZmQ3MDE4NTNCRkNlMzEzNTkyMzlGMzA1JywgZGVjaW1hbHM6IDE4IH0sXHJcbiAgICBIRVg6IHsgYWRkcmVzczogJzB4MmI1OTFlOTlhZkU5ZjMyZUFBNjIxNGY3Qjc2Mjk3NjhjNDBFZWIzOScsIGRlY2ltYWxzOiA4IH0sXHJcbiAgICBQTFNYOiB7IGFkZHJlc3M6ICcweDk1QjMwMzk4N0E2MEM3MTUwNEQ5OUFhMWIxM0I0REEwN2IwNzkwYWInLCBkZWNpbWFsczogMTggfSxcclxuICAgIElOQzogeyBhZGRyZXNzOiAnMHgyRkE4NzhBYjNGODdDQzFDOTczN0ZjMDcxMTA4RjkwNGMwQjBDOTVkJywgZGVjaW1hbHM6IDE4IH0sXHJcbiAgICBTYXZhbnQ6IHsgYWRkcmVzczogJzB4ZjE2ZTE3ZTRhMDFiZjk5QjBBMDNGZDNBYjY5N2JDODc5MDZlMTgwOScsIGRlY2ltYWxzOiAxOCB9LFxyXG4gICAgSFhSOiB7IGFkZHJlc3M6ICcweENmQ2I4OWYwMDU3NkE3NzVkOWY4MTk2MUEzN2JhN0RDZjEyQzdkOUInLCBkZWNpbWFsczogMTggfSxcclxuICAgIFRLUjogeyBhZGRyZXNzOiAnMHhkOWU1OTAyMDA4OTkxNkE4RWZBN0RkMEI2MDVkNTUyMTlENzJkQjdCJywgZGVjaW1hbHM6IDE4IH0sXHJcbiAgICBKREFJOiB7IGFkZHJlc3M6ICcweDE2MTBFNzVDOWI0OEJGNTUwMTM3ODIwNDUyZEU0MDQ5YkIyMmJCNzInLCBkZWNpbWFsczogMTggfSxcclxuICAgIFJpY2t5OiB7IGFkZHJlc3M6ICcweDc5RkMwRTFkM0VDMDBkODFFNTQyM0RjQzAxQTYxN2IwZTEyNDVjMkInLCBkZWNpbWFsczogMTggfVxyXG4gIH1cclxufTtcclxuXHJcbi8vIFByaWNlIGNhY2hlICg1IG1pbnV0ZSBleHBpcnkpXHJcbmNvbnN0IHByaWNlQ2FjaGUgPSB7XHJcbiAgcHJpY2VzOiB7fSxcclxuICB0aW1lc3RhbXA6IDAsXHJcbiAgQ0FDSEVfRFVSQVRJT046IDUgKiA2MCAqIDEwMDAgLy8gNSBtaW51dGVzXHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHJlc2VydmVzIGZyb20gYSBQdWxzZVggcGFpciBjb250cmFjdFxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZ2V0UGFpclJlc2VydmVzKHByb3ZpZGVyLCBwYWlyQWRkcmVzcykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwYWlyQ29udHJhY3QgPSBuZXcgZXRoZXJzLkNvbnRyYWN0KHBhaXJBZGRyZXNzLCBQQUlSX0FCSSwgcHJvdmlkZXIpO1xyXG4gICAgY29uc3QgW3Jlc2VydmUwLCByZXNlcnZlMV0gPSBhd2FpdCBwYWlyQ29udHJhY3QuZ2V0UmVzZXJ2ZXMoKTtcclxuICAgIGNvbnN0IHRva2VuMCA9IGF3YWl0IHBhaXJDb250cmFjdC50b2tlbjAoKTtcclxuICAgIGNvbnN0IHRva2VuMSA9IGF3YWl0IHBhaXJDb250cmFjdC50b2tlbjEoKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXNlcnZlMDogcmVzZXJ2ZTAudG9TdHJpbmcoKSxcclxuICAgICAgcmVzZXJ2ZTE6IHJlc2VydmUxLnRvU3RyaW5nKCksXHJcbiAgICAgIHRva2VuMDogdG9rZW4wLnRvTG93ZXJDYXNlKCksXHJcbiAgICAgIHRva2VuMTogdG9rZW4xLnRvTG93ZXJDYXNlKClcclxuICAgIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHBhaXIgcmVzZXJ2ZXM6JywgcGFpckFkZHJlc3MsIGVycm9yKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZSBwcmljZSBvZiB0b2tlbjAgaW4gdGVybXMgb2YgdG9rZW4xIGZyb20gcmVzZXJ2ZXNcclxuICogcHJpY2UgPSByZXNlcnZlMSAvIHJlc2VydmUwXHJcbiAqL1xyXG5mdW5jdGlvbiBjYWxjdWxhdGVQcmljZShyZXNlcnZlMCwgcmVzZXJ2ZTEsIGRlY2ltYWxzMCA9IDE4LCBkZWNpbWFsczEgPSAxOCkge1xyXG4gIGNvbnN0IHIwID0gcGFyc2VGbG9hdChldGhlcnMuZm9ybWF0VW5pdHMocmVzZXJ2ZTAsIGRlY2ltYWxzMCkpO1xyXG4gIGNvbnN0IHIxID0gcGFyc2VGbG9hdChldGhlcnMuZm9ybWF0VW5pdHMocmVzZXJ2ZTEsIGRlY2ltYWxzMSkpO1xyXG5cclxuICBpZiAocjAgPT09IDApIHJldHVybiAwO1xyXG4gIHJldHVybiByMSAvIHIwO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IFBMUyBwcmljZSBpbiBVU0QgdXNpbmcgSEVYIGFzIGludGVybWVkaWFyeVxyXG4gKiAxLiBHZXQgSEVYL1BMUyByZXNlcnZlcyAtPiBIRVggcHJpY2UgaW4gUExTXHJcbiAqIDIuIFVzZSBrbm93biBIRVggVVNEIHByaWNlICh+JDAuMDEpIHRvIGNhbGN1bGF0ZSBQTFMgVVNEIHByaWNlXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRQTFNQcmljZShwcm92aWRlcikge1xyXG4gIHRyeSB7XHJcbiAgICAvLyBGaXJzdCB0cnkgdGhlIERBSSBwYWlyXHJcbiAgICBjb25zdCBkYWlQYWlyQWRkcmVzcyA9IFBVTFNFWF9QQUlSUy5wdWxzZWNoYWluLlBMU19EQUk7XHJcbiAgICBjb25zdCBkYWlSZXNlcnZlcyA9IGF3YWl0IGdldFBhaXJSZXNlcnZlcyhwcm92aWRlciwgZGFpUGFpckFkZHJlc3MpO1xyXG5cclxuICAgIGlmIChkYWlSZXNlcnZlcykge1xyXG4gICAgICBjb25zdCB0b2tlbnMgPSBUT0tFTl9BRERSRVNTRVMucHVsc2VjaGFpbjtcclxuICAgICAgY29uc3QgcGxzQWRkcmVzcyA9IHRva2Vucy5XUExTLmFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuICAgICAgY29uc3QgZGFpQWRkcmVzcyA9IHRva2Vucy5EQUkuYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgbGV0IHBsc1Jlc2VydmUsIGRhaVJlc2VydmU7XHJcbiAgICAgIGlmIChkYWlSZXNlcnZlcy50b2tlbjAgPT09IHBsc0FkZHJlc3MpIHtcclxuICAgICAgICBwbHNSZXNlcnZlID0gZGFpUmVzZXJ2ZXMucmVzZXJ2ZTA7XHJcbiAgICAgICAgZGFpUmVzZXJ2ZSA9IGRhaVJlc2VydmVzLnJlc2VydmUxO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsc1Jlc2VydmUgPSBkYWlSZXNlcnZlcy5yZXNlcnZlMTtcclxuICAgICAgICBkYWlSZXNlcnZlID0gZGFpUmVzZXJ2ZXMucmVzZXJ2ZTA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHBsc1ByaWNlID0gY2FsY3VsYXRlUHJpY2UocGxzUmVzZXJ2ZSwgZGFpUmVzZXJ2ZSwgMTgsIDE4KTtcclxuICAgICAgY29uc29sZS5sb2coJ+KckyBQTFMgcHJpY2UgZnJvbSBEQUkgcGFpcjonLCBwbHNQcmljZSk7XHJcbiAgICAgIHJldHVybiBwbHNQcmljZTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS53YXJuKCdDb3VsZCBub3QgZmV0Y2ggUExTL0RBSSBwcmljZSwgdHJ5aW5nIGFsdGVybmF0aXZlLi4uJywgZXJyb3IubWVzc2FnZSk7XHJcbiAgfVxyXG5cclxuICAvLyBGYWxsYmFjazogQ2FsY3VsYXRlIHRocm91Z2ggSEVYXHJcbiAgLy8gVXNlIENvaW5HZWNrby9Db2luTWFya2V0Q2FwIGtub3duIEhFWCBwcmljZSBhcyBhbmNob3JcclxuICAvLyBPciB1c2UgYSBoYXJkY29kZWQgcmVhc29uYWJsZSBlc3RpbWF0ZVxyXG4gIGNvbnNvbGUubG9nKCdVc2luZyBIRVgtYmFzZWQgcHJpY2UgZXN0aW1hdGlvbiBhcyBmYWxsYmFjaycpO1xyXG4gIFxyXG4gIC8vIEdldCBIRVgvUExTIHJlc2VydmVzXHJcbiAgY29uc3QgaGV4UGFpckFkZHJlc3MgPSBQVUxTRVhfUEFJUlMucHVsc2VjaGFpbi5IRVhfUExTO1xyXG4gIGNvbnN0IGhleFJlc2VydmVzID0gYXdhaXQgZ2V0UGFpclJlc2VydmVzKHByb3ZpZGVyLCBoZXhQYWlyQWRkcmVzcyk7XHJcbiAgXHJcbiAgaWYgKCFoZXhSZXNlcnZlcykge1xyXG4gICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGZldGNoIEhFWC9QTFMgcmVzZXJ2ZXMgZm9yIHByaWNlIGNhbGN1bGF0aW9uJyk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIGNvbnN0IHRva2VucyA9IFRPS0VOX0FERFJFU1NFUy5wdWxzZWNoYWluO1xyXG4gIGNvbnN0IHBsc0FkZHJlc3MgPSB0b2tlbnMuV1BMUy5hZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3QgaGV4QWRkcmVzcyA9IHRva2Vucy5IRVguYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICBsZXQgcGxzUmVzZXJ2ZSwgaGV4UmVzZXJ2ZTtcclxuICBpZiAoaGV4UmVzZXJ2ZXMudG9rZW4wID09PSBoZXhBZGRyZXNzKSB7XHJcbiAgICBoZXhSZXNlcnZlID0gaGV4UmVzZXJ2ZXMucmVzZXJ2ZTA7XHJcbiAgICBwbHNSZXNlcnZlID0gaGV4UmVzZXJ2ZXMucmVzZXJ2ZTE7XHJcbiAgfSBlbHNlIHtcclxuICAgIGhleFJlc2VydmUgPSBoZXhSZXNlcnZlcy5yZXNlcnZlMTtcclxuICAgIHBsc1Jlc2VydmUgPSBoZXhSZXNlcnZlcy5yZXNlcnZlMDtcclxuICB9XHJcblxyXG4gIC8vIENhbGN1bGF0ZSBIRVggcHJpY2UgaW4gUExTXHJcbiAgY29uc3QgaGV4UmVzZXJ2ZUZvcm1hdHRlZCA9IHBhcnNlRmxvYXQoZXRoZXJzLmZvcm1hdFVuaXRzKGhleFJlc2VydmUsIDgpKTsgLy8gSEVYIGhhcyA4IGRlY2ltYWxzXHJcbiAgY29uc3QgcGxzUmVzZXJ2ZUZvcm1hdHRlZCA9IHBhcnNlRmxvYXQoZXRoZXJzLmZvcm1hdFVuaXRzKHBsc1Jlc2VydmUsIDE4KSk7XHJcbiAgY29uc3QgaGV4UHJpY2VJblBscyA9IHBsc1Jlc2VydmVGb3JtYXR0ZWQgLyBoZXhSZXNlcnZlRm9ybWF0dGVkO1xyXG5cclxuICAvLyBVc2UgYXBwcm94aW1hdGUgSEVYIFVTRCBwcmljZSAodXBkYXRlIHRoaXMgcGVyaW9kaWNhbGx5IG9yIGZldGNoIGZyb20gQ29pbkdlY2tvIEFQSSlcclxuICBjb25zdCBoZXhVc2RQcmljZSA9IDAuMDE7IC8vIEFwcHJveGltYXRlIC0gYWRqdXN0IGJhc2VkIG9uIG1hcmtldFxyXG4gIFxyXG4gIC8vIENhbGN1bGF0ZSBQTFMgVVNEIHByaWNlOiBpZiAxIEhFWCA9IFggUExTLCBhbmQgMSBIRVggPSAkMC4wMSwgdGhlbiAxIFBMUyA9ICQwLjAxIC8gWFxyXG4gIGNvbnN0IHBsc1VzZFByaWNlID0gaGV4VXNkUHJpY2UgLyBoZXhQcmljZUluUGxzO1xyXG4gIFxyXG4gIC8vIEVzdGltYXRlZCBQTFMgcHJpY2UgdmlhIEhFWFxyXG4gIFxyXG4gIHJldHVybiBwbHNVc2RQcmljZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB0b2tlbiBwcmljZSBpbiBQTFMgZnJvbSBQdWxzZVggcGFpclxyXG4gKiBSZXR1cm5zOiBIb3cgbXVjaCBQTFMgZG9lcyAxIHRva2VuIGNvc3RcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFRva2VuUHJpY2VJblBMUyhwcm92aWRlciwgcGFpckFkZHJlc3MsIHRva2VuQWRkcmVzcywgdG9rZW5EZWNpbWFscykge1xyXG4gIGNvbnN0IHJlc2VydmVzID0gYXdhaXQgZ2V0UGFpclJlc2VydmVzKHByb3ZpZGVyLCBwYWlyQWRkcmVzcyk7XHJcblxyXG4gIGlmICghcmVzZXJ2ZXMpIHJldHVybiBudWxsO1xyXG5cclxuICBjb25zdCBwbHNBZGRyZXNzID0gVE9LRU5fQUREUkVTU0VTLnB1bHNlY2hhaW4uV1BMUy5hZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3QgdGFyZ2V0VG9rZW4gPSB0b2tlbkFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgLy8gRGV0ZXJtaW5lIHdoaWNoIHJlc2VydmUgaXMgdGhlIHRva2VuIGFuZCB3aGljaCBpcyBQTFNcclxuICBsZXQgdG9rZW5SZXNlcnZlLCBwbHNSZXNlcnZlO1xyXG4gIGlmIChyZXNlcnZlcy50b2tlbjAgPT09IHRhcmdldFRva2VuKSB7XHJcbiAgICB0b2tlblJlc2VydmUgPSByZXNlcnZlcy5yZXNlcnZlMDtcclxuICAgIHBsc1Jlc2VydmUgPSByZXNlcnZlcy5yZXNlcnZlMTtcclxuICB9IGVsc2UgaWYgKHJlc2VydmVzLnRva2VuMSA9PT0gdGFyZ2V0VG9rZW4pIHtcclxuICAgIHRva2VuUmVzZXJ2ZSA9IHJlc2VydmVzLnJlc2VydmUxO1xyXG4gICAgcGxzUmVzZXJ2ZSA9IHJlc2VydmVzLnJlc2VydmUwO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdUb2tlbiBub3QgZm91bmQgaW4gcGFpcjonLCB0b2tlbkFkZHJlc3MsIHBhaXJBZGRyZXNzKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2FsY3VsYXRlIHRva2VuIHByaWNlIGluIFBMU1xyXG4gIC8vIFByaWNlIG9mIHRva2VuIGluIFBMUyA9IHBsc1Jlc2VydmUgLyB0b2tlblJlc2VydmVcclxuICAvLyBUaGlzIGdpdmVzOiBIb3cgbWFueSBQTFMgcGVyIDEgdG9rZW5cclxuICBjb25zdCB0b2tlblJlc2VydmVGb3JtYXR0ZWQgPSBwYXJzZUZsb2F0KGV0aGVycy5mb3JtYXRVbml0cyh0b2tlblJlc2VydmUsIHRva2VuRGVjaW1hbHMpKTtcclxuICBjb25zdCBwbHNSZXNlcnZlRm9ybWF0dGVkID0gcGFyc2VGbG9hdChldGhlcnMuZm9ybWF0VW5pdHMocGxzUmVzZXJ2ZSwgMTgpKTtcclxuXHJcbiAgLy8gVG9rZW4gcmVzZXJ2ZXMgZmV0Y2hlZFxyXG5cclxuICBpZiAodG9rZW5SZXNlcnZlRm9ybWF0dGVkID09PSAwKSByZXR1cm4gMDtcclxuXHJcbiAgY29uc3QgdG9rZW5QcmljZUluUGxzID0gcGxzUmVzZXJ2ZUZvcm1hdHRlZCAvIHRva2VuUmVzZXJ2ZUZvcm1hdHRlZDtcclxuICAvLyBUb2tlbiBwcmljZSBjYWxjdWxhdGVkXHJcbiAgcmV0dXJuIHRva2VuUHJpY2VJblBscztcclxufVxyXG5cclxuLyoqXHJcbiAqIEZldGNoIGFsbCB0b2tlbiBwcmljZXMgaW4gVVNEXHJcbiAqIFJldHVybnM6IHsgUExTOiBwcmljZSwgSEVYOiBwcmljZSwgUExTWDogcHJpY2UsIElOQzogcHJpY2UsIC4uLiB9XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hUb2tlblByaWNlcyhwcm92aWRlciwgbmV0d29yayA9ICdwdWxzZWNoYWluJykge1xyXG4gIC8vIENoZWNrIGNhY2hlIGZpcnN0XHJcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICBpZiAocHJpY2VDYWNoZS5wcmljZXNbbmV0d29ya10gJiYgKG5vdyAtIHByaWNlQ2FjaGUudGltZXN0YW1wKSA8IHByaWNlQ2FjaGUuQ0FDSEVfRFVSQVRJT04pIHtcclxuICAgIC8vIFVzaW5nIGNhY2hlZCBwcmljZXNcclxuICAgIHJldHVybiBwcmljZUNhY2hlLnByaWNlc1tuZXR3b3JrXTtcclxuICB9XHJcblxyXG4gIC8vIEZldGNoaW5nIGZyZXNoIHByaWNlc1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcHJpY2VzID0ge307XHJcblxyXG4gICAgLy8gU3RlcCAxOiBHZXQgUExTIHByaWNlIGluIFVTRFxyXG4gICAgY29uc3QgcGxzVXNkUHJpY2UgPSBhd2FpdCBnZXRQTFNQcmljZShwcm92aWRlcik7XHJcbiAgICBpZiAoIXBsc1VzZFByaWNlKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybignQ291bGQgbm90IGZldGNoIFBMUyBwcmljZScpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcmljZXMuUExTID0gcGxzVXNkUHJpY2U7XHJcbiAgICAvLyBQTFMgcHJpY2UgZmV0Y2hlZFxyXG5cclxuICAgIC8vIFN0ZXAgMjogR2V0IG90aGVyIHRva2VuIHByaWNlcyBpbiBQTFMsIHRoZW4gY29udmVydCB0byBVU0RcclxuICAgIGNvbnN0IHBhaXJzID0gUFVMU0VYX1BBSVJTW25ldHdvcmtdO1xyXG4gICAgY29uc3QgdG9rZW5zID0gVE9LRU5fQUREUkVTU0VTW25ldHdvcmtdO1xyXG5cclxuICAgIC8vIEhFWCBwcmljZVxyXG4gICAgY29uc3QgaGV4UHJpY2VJblBscyA9IGF3YWl0IGdldFRva2VuUHJpY2VJblBMUyhwcm92aWRlciwgcGFpcnMuSEVYX1BMUywgdG9rZW5zLkhFWC5hZGRyZXNzLCB0b2tlbnMuSEVYLmRlY2ltYWxzKTtcclxuICAgIGlmIChoZXhQcmljZUluUGxzKSB7XHJcbiAgICAgIHByaWNlcy5IRVggPSBoZXhQcmljZUluUGxzICogcGxzVXNkUHJpY2U7XHJcbiAgICAgIC8vIEhFWCBwcmljZSBjYWxjdWxhdGVkXHJcbiAgICB9XHJcblxyXG4gICAgLy8gUExTWCBwcmljZVxyXG4gICAgY29uc3QgcGxzeFByaWNlSW5QbHMgPSBhd2FpdCBnZXRUb2tlblByaWNlSW5QTFMocHJvdmlkZXIsIHBhaXJzLlBMU1hfUExTLCB0b2tlbnMuUExTWC5hZGRyZXNzLCB0b2tlbnMuUExTWC5kZWNpbWFscyk7XHJcbiAgICBpZiAocGxzeFByaWNlSW5QbHMpIHtcclxuICAgICAgcHJpY2VzLlBMU1ggPSBwbHN4UHJpY2VJblBscyAqIHBsc1VzZFByaWNlO1xyXG4gICAgICAvLyBQTFNYIHByaWNlIGNhbGN1bGF0ZWRcclxuICAgIH1cclxuXHJcbiAgICAvLyBJTkMgcHJpY2VcclxuICAgIGNvbnN0IGluY1ByaWNlSW5QbHMgPSBhd2FpdCBnZXRUb2tlblByaWNlSW5QTFMocHJvdmlkZXIsIHBhaXJzLklOQ19QTFMsIHRva2Vucy5JTkMuYWRkcmVzcywgdG9rZW5zLklOQy5kZWNpbWFscyk7XHJcbiAgICBpZiAoaW5jUHJpY2VJblBscykge1xyXG4gICAgICBwcmljZXMuSU5DID0gaW5jUHJpY2VJblBscyAqIHBsc1VzZFByaWNlO1xyXG4gICAgICAvLyBJTkMgcHJpY2UgY2FsY3VsYXRlZFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNhdmFudCBwcmljZVxyXG4gICAgY29uc3Qgc2F2YW50UHJpY2VJblBscyA9IGF3YWl0IGdldFRva2VuUHJpY2VJblBMUyhwcm92aWRlciwgcGFpcnMuU2F2YW50X1BMUywgdG9rZW5zLlNhdmFudC5hZGRyZXNzLCB0b2tlbnMuU2F2YW50LmRlY2ltYWxzKTtcclxuICAgIGlmIChzYXZhbnRQcmljZUluUGxzKSB7XHJcbiAgICAgIHByaWNlcy5TYXZhbnQgPSBzYXZhbnRQcmljZUluUGxzICogcGxzVXNkUHJpY2U7XHJcbiAgICAgIC8vIFNhdmFudCBwcmljZSBjYWxjdWxhdGVkXHJcbiAgICB9XHJcblxyXG4gICAgLy8gSFhSIHByaWNlXHJcbiAgICBjb25zdCBoeHJQcmljZUluUGxzID0gYXdhaXQgZ2V0VG9rZW5QcmljZUluUExTKHByb3ZpZGVyLCBwYWlycy5IWFJfUExTLCB0b2tlbnMuSFhSLmFkZHJlc3MsIHRva2Vucy5IWFIuZGVjaW1hbHMpO1xyXG4gICAgaWYgKGh4clByaWNlSW5QbHMpIHtcclxuICAgICAgcHJpY2VzLkhYUiA9IGh4clByaWNlSW5QbHMgKiBwbHNVc2RQcmljZTtcclxuICAgICAgLy8gSFhSIHByaWNlIGNhbGN1bGF0ZWRcclxuICAgIH1cclxuXHJcbiAgICAvLyBUS1IgcHJpY2VcclxuICAgIGNvbnN0IHRrclByaWNlSW5QbHMgPSBhd2FpdCBnZXRUb2tlblByaWNlSW5QTFMocHJvdmlkZXIsIHBhaXJzLlRLUl9QTFMsIHRva2Vucy5US1IuYWRkcmVzcywgdG9rZW5zLlRLUi5kZWNpbWFscyk7XHJcbiAgICBpZiAodGtyUHJpY2VJblBscykge1xyXG4gICAgICBwcmljZXMuVEtSID0gdGtyUHJpY2VJblBscyAqIHBsc1VzZFByaWNlO1xyXG4gICAgICAvLyBUS1IgcHJpY2UgY2FsY3VsYXRlZFxyXG4gICAgfVxyXG5cclxuICAgIC8vIEpEQUkgcHJpY2VcclxuICAgIGNvbnN0IGpkYWlQcmljZUluUGxzID0gYXdhaXQgZ2V0VG9rZW5QcmljZUluUExTKHByb3ZpZGVyLCBwYWlycy5KREFJX1BMUywgdG9rZW5zLkpEQUkuYWRkcmVzcywgdG9rZW5zLkpEQUkuZGVjaW1hbHMpO1xyXG4gICAgaWYgKGpkYWlQcmljZUluUGxzKSB7XHJcbiAgICAgIHByaWNlcy5KREFJID0gamRhaVByaWNlSW5QbHMgKiBwbHNVc2RQcmljZTtcclxuICAgICAgLy8gSkRBSSBwcmljZSBjYWxjdWxhdGVkXHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmlja3kgcHJpY2VcclxuICAgIGNvbnN0IHJpY2t5UHJpY2VJblBscyA9IGF3YWl0IGdldFRva2VuUHJpY2VJblBMUyhwcm92aWRlciwgcGFpcnMuUmlja3lfUExTLCB0b2tlbnMuUmlja3kuYWRkcmVzcywgdG9rZW5zLlJpY2t5LmRlY2ltYWxzKTtcclxuICAgIGlmIChyaWNreVByaWNlSW5QbHMpIHtcclxuICAgICAgcHJpY2VzLlJpY2t5ID0gcmlja3lQcmljZUluUGxzICogcGxzVXNkUHJpY2U7XHJcbiAgICAgIC8vIFJpY2t5IHByaWNlIGNhbGN1bGF0ZWRcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgY2FjaGVcclxuICAgIHByaWNlQ2FjaGUucHJpY2VzW25ldHdvcmtdID0gcHJpY2VzO1xyXG4gICAgcHJpY2VDYWNoZS50aW1lc3RhbXAgPSBub3c7XHJcblxyXG4gICAgcmV0dXJuIHByaWNlcztcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHRva2VuIHByaWNlczonLCBlcnJvcik7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgVVNEIHZhbHVlIGZvciBhIHRva2VuIGFtb3VudFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5TeW1ib2wgLSBUb2tlbiBzeW1ib2wgKFBMUywgSEVYLCBQTFNYLCBJTkMsIGV0Yy4pXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhbW91bnQgLSBUb2tlbiBhbW91bnQgYXMgc3RyaW5nIChpbiBiYXNlIHVuaXRzKVxyXG4gKiBAcGFyYW0ge251bWJlcn0gZGVjaW1hbHMgLSBUb2tlbiBkZWNpbWFsc1xyXG4gKiBAcGFyYW0ge29iamVjdH0gcHJpY2VzIC0gUHJpY2UgZGF0YSBmcm9tIGZldGNoVG9rZW5QcmljZXMoKVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRva2VuVmFsdWVVU0QodG9rZW5TeW1ib2wsIGFtb3VudCwgZGVjaW1hbHMsIHByaWNlcykge1xyXG4gIGlmICghcHJpY2VzIHx8ICFwcmljZXNbdG9rZW5TeW1ib2xdKSB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIGNvbnN0IHRva2VuQW1vdW50ID0gcGFyc2VGbG9hdChldGhlcnMuZm9ybWF0VW5pdHMoYW1vdW50LCBkZWNpbWFscykpO1xyXG4gIGNvbnN0IHRva2VuUHJpY2UgPSBwcmljZXNbdG9rZW5TeW1ib2xdO1xyXG5cclxuICByZXR1cm4gdG9rZW5BbW91bnQgKiB0b2tlblByaWNlO1xyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IFVTRCB2YWx1ZSBmb3IgZGlzcGxheVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFVTRCh2YWx1ZSkge1xyXG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICByZXR1cm4gJ+KAlCc7XHJcbiAgfVxyXG5cclxuICBpZiAodmFsdWUgPCAwLjAxKSB7XHJcbiAgICByZXR1cm4gYCQke3ZhbHVlLnRvRml4ZWQoNil9YDtcclxuICB9IGVsc2UgaWYgKHZhbHVlIDwgMSkge1xyXG4gICAgcmV0dXJuIGAkJHt2YWx1ZS50b0ZpeGVkKDQpfWA7XHJcbiAgfSBlbHNlIGlmICh2YWx1ZSA8IDEwMCkge1xyXG4gICAgcmV0dXJuIGAkJHt2YWx1ZS50b0ZpeGVkKDIpfWA7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiBgJCR7dmFsdWUudG9Mb2NhbGVTdHJpbmcoJ2VuLVVTJywgeyBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IDIsIG1heGltdW1GcmFjdGlvbkRpZ2l0czogMiB9KX1gO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENsZWFyIHByaWNlIGNhY2hlICh1c2VmdWwgZm9yIHRlc3Rpbmcgb3IgbWFudWFsIHJlZnJlc2gpXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJQcmljZUNhY2hlKCkge1xyXG4gIHByaWNlQ2FjaGUucHJpY2VzID0ge307XHJcbiAgcHJpY2VDYWNoZS50aW1lc3RhbXAgPSAwO1xyXG4gIC8vIFByaWNlIGNhY2hlIGNsZWFyZWRcclxufVxyXG4iLCIvKipcclxuICogcG9wdXAuanNcclxuICpcclxuICogVUkgY29udHJvbGxlciBmb3IgSGVhcnRXYWxsZXQgcG9wdXBcclxuICovXHJcblxyXG5pbXBvcnQge1xyXG4gIGNyZWF0ZVdhbGxldCxcclxuICBpbXBvcnRGcm9tTW5lbW9uaWMsXHJcbiAgaW1wb3J0RnJvbVByaXZhdGVLZXksXHJcbiAgdW5sb2NrV2FsbGV0LFxyXG4gIHdhbGxldEV4aXN0cyxcclxuICBleHBvcnRQcml2YXRlS2V5LFxyXG4gIGV4cG9ydE1uZW1vbmljLFxyXG4gIGRlbGV0ZVdhbGxldCxcclxuICBtaWdyYXRlVG9NdWx0aVdhbGxldCxcclxuICBnZXRBbGxXYWxsZXRzLFxyXG4gIGdldEFjdGl2ZVdhbGxldCxcclxuICBzZXRBY3RpdmVXYWxsZXQsXHJcbiAgYWRkV2FsbGV0LFxyXG4gIHJlbmFtZVdhbGxldCxcclxuICBleHBvcnRQcml2YXRlS2V5Rm9yV2FsbGV0LFxyXG4gIGV4cG9ydE1uZW1vbmljRm9yV2FsbGV0XHJcbn0gZnJvbSAnLi4vY29yZS93YWxsZXQuanMnO1xyXG5pbXBvcnQgeyBzYXZlLCBsb2FkIH0gZnJvbSAnLi4vY29yZS9zdG9yYWdlLmpzJztcclxuaW1wb3J0IHsgc2hvcnRlbkFkZHJlc3MgfSBmcm9tICcuLi9jb3JlL3ZhbGlkYXRpb24uanMnO1xyXG5pbXBvcnQgKiBhcyBycGMgZnJvbSAnLi4vY29yZS9ycGMuanMnO1xyXG5pbXBvcnQgeyBldGhlcnMgfSBmcm9tICdldGhlcnMnO1xyXG5pbXBvcnQgUVJDb2RlIGZyb20gJ3FyY29kZSc7XHJcbmltcG9ydCAqIGFzIHRva2VucyBmcm9tICcuLi9jb3JlL3Rva2Vucy5qcyc7XHJcbmltcG9ydCB7IGRlY29kZVRyYW5zYWN0aW9uIH0gZnJvbSAnLi4vY29yZS9jb250cmFjdERlY29kZXIuanMnO1xyXG5pbXBvcnQgeyBmZXRjaFRva2VuUHJpY2VzLCBnZXRUb2tlblZhbHVlVVNELCBmb3JtYXRVU0QgfSBmcm9tICcuLi9jb3JlL3ByaWNlT3JhY2xlLmpzJztcclxuaW1wb3J0ICogYXMgZXJjMjAgZnJvbSAnLi4vY29yZS9lcmMyMC5qcyc7XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFNFQ1VSSVRZIFVUSUxJVElFU1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4vKipcclxuICogRXNjYXBlcyBIVE1MIHNwZWNpYWwgY2hhcmFjdGVycyB0byBwcmV2ZW50IFhTUyBhdHRhY2tzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGV4dCB0byBlc2NhcGVcclxuICogQHJldHVybnMge3N0cmluZ30gSFRNTC1zYWZlIHRleHRcclxuICovXHJcbmZ1bmN0aW9uIGVzY2FwZUh0bWwodGV4dCkge1xyXG4gIGlmICh0eXBlb2YgdGV4dCAhPT0gJ3N0cmluZycpIHJldHVybiAnJztcclxuICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICBkaXYudGV4dENvbnRlbnQgPSB0ZXh0O1xyXG4gIHJldHVybiBkaXYuaW5uZXJIVE1MO1xyXG59XHJcblxyXG4vKipcclxuICogU2FuaXRpemVzIGVycm9yIG1lc3NhZ2VzIGZvciBzYWZlIGRpc3BsYXkgaW4gYWxlcnRzIGFuZCBVSVxyXG4gKiBSZW1vdmVzIEhUTUwgdGFncywgc2NyaXB0cywgYW5kIGxpbWl0cyBsZW5ndGhcclxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBFcnJvciBtZXNzYWdlIHRvIHNhbml0aXplXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFNhbml0aXplZCBtZXNzYWdlXHJcbiAqL1xyXG5mdW5jdGlvbiBzYW5pdGl6ZUVycm9yKG1lc3NhZ2UpIHtcclxuICBpZiAodHlwZW9mIG1lc3NhZ2UgIT09ICdzdHJpbmcnKSByZXR1cm4gJ1Vua25vd24gZXJyb3InO1xyXG4gIFxyXG4gIC8vIFJlbW92ZSBudWxsIGJ5dGVzIGFuZCBjb250cm9sIGNoYXJhY3RlcnMgKGV4Y2VwdCBuZXdsaW5lcyBhbmQgdGFicylcclxuICBsZXQgc2FuaXRpemVkID0gbWVzc2FnZS5yZXBsYWNlKC9bXFx4MDAtXFx4MDhcXHgwQlxceDBDXFx4MEUtXFx4MUZcXHg3Rl0vZywgJycpO1xyXG4gIFxyXG4gIC8vIFJlbW92ZSBIVE1MIHRhZ3NcclxuICBzYW5pdGl6ZWQgPSBzYW5pdGl6ZWQucmVwbGFjZSgvPFtePl0qPi9nLCAnJyk7XHJcbiAgXHJcbiAgLy8gUmVtb3ZlIHNjcmlwdC1saWtlIGNvbnRlbnRcclxuICBzYW5pdGl6ZWQgPSBzYW5pdGl6ZWQucmVwbGFjZSgvamF2YXNjcmlwdDovZ2ksICcnKTtcclxuICBzYW5pdGl6ZWQgPSBzYW5pdGl6ZWQucmVwbGFjZSgvb25cXHcrXFxzKj0vZ2ksICcnKTtcclxuICBcclxuICAvLyBMaW1pdCBsZW5ndGggdG8gcHJldmVudCBEb1NcclxuICBpZiAoc2FuaXRpemVkLmxlbmd0aCA+IDMwMCkge1xyXG4gICAgc2FuaXRpemVkID0gc2FuaXRpemVkLnN1YnN0cmluZygwLCAyOTcpICsgJy4uLic7XHJcbiAgfVxyXG4gIFxyXG4gIHJldHVybiBzYW5pdGl6ZWQgfHwgJ1Vua25vd24gZXJyb3InO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFNUQVRFXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbi8vID09PT09IFNUQVRFID09PT09XHJcbmxldCBjdXJyZW50U3RhdGUgPSB7XHJcbiAgaXNVbmxvY2tlZDogZmFsc2UsXHJcbiAgYWRkcmVzczogbnVsbCxcclxuICBiYWxhbmNlOiAnMCcsXHJcbiAgbmV0d29yazogJ3B1bHNlY2hhaW4nLCAvLyBEZWZhdWx0IHRvIFB1bHNlQ2hhaW4gTWFpbm5ldFxyXG4gIHNlc3Npb25Ub2tlbjogbnVsbCwgLy8gU2Vzc2lvbiB0b2tlbiBmb3IgYXV0aGVudGljYXRlZCBvcGVyYXRpb25zIChzdG9yZWQgaW4gbWVtb3J5IG9ubHkpXHJcbiAgc2V0dGluZ3M6IHtcclxuICAgIGF1dG9Mb2NrTWludXRlczogMTUsXHJcbiAgICBzaG93VGVzdE5ldHdvcmtzOiB0cnVlLFxyXG4gICAgZGVjaW1hbFBsYWNlczogOCxcclxuICAgIHRoZW1lOiAnaGlnaC1jb250cmFzdCcsXHJcbiAgICBtYXhHYXNQcmljZUd3ZWk6IDEwMDAsIC8vIE1heGltdW0gZ2FzIHByaWNlIGluIEd3ZWkgKGRlZmF1bHQgMTAwMClcclxuICAgIGFsbG93RXRoU2lnbjogZmFsc2UgLy8gQWxsb3cgZGFuZ2Vyb3VzIGV0aF9zaWduIG1ldGhvZCAoZGlzYWJsZWQgYnkgZGVmYXVsdCBmb3Igc2VjdXJpdHkpXHJcbiAgfSxcclxuICBuZXR3b3JrU2V0dGluZ3M6IG51bGwsIC8vIFdpbGwgYmUgbG9hZGVkIGZyb20gc3RvcmFnZSBvciB1c2UgZGVmYXVsdHNcclxuICBsYXN0QWN0aXZpdHlUaW1lOiBudWxsLCAvLyBUcmFjayBsYXN0IGFjdGl2aXR5IGZvciBhdXRvLWxvY2tcclxuICB0b2tlblByaWNlczogbnVsbCwgLy8gVG9rZW4gcHJpY2VzIGluIFVTRCAoY2FjaGVkIGZyb20gUHVsc2VYKVxyXG4gIGN1cnJlbnRUb2tlbkRldGFpbHM6IG51bGwgLy8gQ3VycmVudGx5IHZpZXdpbmcgdG9rZW4gZGV0YWlsc1xyXG59O1xyXG5cclxuLy8gQXV0by1sb2NrIHRpbWVyXHJcbmxldCBhdXRvTG9ja1RpbWVyID0gbnVsbDtcclxuXHJcbi8vIFJhdGUgbGltaXRpbmcgZm9yIHBhc3N3b3JkIGF0dGVtcHRzXHJcbmNvbnN0IFJBVEVfTElNSVRfS0VZID0gJ3Bhc3N3b3JkX2F0dGVtcHRzJztcclxuY29uc3QgTUFYX0FUVEVNUFRTID0gNTtcclxuY29uc3QgTE9DS09VVF9EVVJBVElPTl9NUyA9IDMwICogNjAgKiAxMDAwOyAvLyAzMCBtaW51dGVzXHJcblxyXG4vLyBOZXR3b3JrIG5hbWVzIGZvciBkaXNwbGF5XHJcbmNvbnN0IE5FVFdPUktfTkFNRVMgPSB7XHJcbiAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ1B1bHNlQ2hhaW4gVGVzdG5ldCBWNCcsXHJcbiAgJ3B1bHNlY2hhaW4nOiAnUHVsc2VDaGFpbiBNYWlubmV0JyxcclxuICAnZXRoZXJldW0nOiAnRXRoZXJldW0gTWFpbm5ldCcsXHJcbiAgJ3NlcG9saWEnOiAnU2Vwb2xpYSBUZXN0bmV0J1xyXG59O1xyXG5cclxuY29uc3QgQkxPQ0tfRVhQTE9SRVJTID0ge1xyXG4gICdwdWxzZWNoYWluVGVzdG5ldCc6IHtcclxuICAgIGJhc2U6ICdodHRwczovL3NjYW4udjQudGVzdG5ldC5wdWxzZWNoYWluLmNvbScsXHJcbiAgICB0eDogJy90eC97aGFzaH0nLFxyXG4gICAgYWRkcmVzczogJy9hZGRyZXNzL3thZGRyZXNzfScsXHJcbiAgICB0b2tlbjogJy90b2tlbi97YWRkcmVzc30nXHJcbiAgfSxcclxuICAncHVsc2VjaGFpbic6IHtcclxuICAgIGJhc2U6ICdodHRwczovL3NjYW4ubXlwaW5hdGEuY2xvdWQvaXBmcy9iYWZ5YmVpZW54eW95cmhuNXRzd2NsdmQzZ2RqeTVtdGtrd211MzdhcXRtbDZvbmJmN3huYjNvMjJwZS8nLFxyXG4gICAgdHg6ICcjL3R4L3toYXNofScsXHJcbiAgICBhZGRyZXNzOiAnIy9hZGRyZXNzL3thZGRyZXNzfScsXHJcbiAgICB0b2tlbjogJyMvdG9rZW4ve2FkZHJlc3N9J1xyXG4gIH0sXHJcbiAgJ2V0aGVyZXVtJzoge1xyXG4gICAgYmFzZTogJ2h0dHBzOi8vZXRoZXJzY2FuLmlvJyxcclxuICAgIHR4OiAnL3R4L3toYXNofScsXHJcbiAgICBhZGRyZXNzOiAnL2FkZHJlc3Mve2FkZHJlc3N9JyxcclxuICAgIHRva2VuOiAnL3Rva2VuL3thZGRyZXNzfSdcclxuICB9LFxyXG4gICdzZXBvbGlhJzoge1xyXG4gICAgYmFzZTogJ2h0dHBzOi8vc2Vwb2xpYS5ldGhlcnNjYW4uaW8nLFxyXG4gICAgdHg6ICcvdHgve2hhc2h9JyxcclxuICAgIGFkZHJlc3M6ICcvYWRkcmVzcy97YWRkcmVzc30nLFxyXG4gICAgdG9rZW46ICcvdG9rZW4ve2FkZHJlc3N9J1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBCdWlsZCBleHBsb3JlciBVUkwgZm9yIGEgc3BlY2lmaWMgdHlwZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVVJMIHR5cGUgKCd0eCcsICdhZGRyZXNzJywgJ3Rva2VuJylcclxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gVGhlIGhhc2ggb3IgYWRkcmVzcyB2YWx1ZVxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBDb21wbGV0ZSBleHBsb3JlciBVUkxcclxuICovXHJcbmZ1bmN0aW9uIGdldEV4cGxvcmVyVXJsKG5ldHdvcmssIHR5cGUsIHZhbHVlKSB7XHJcbiAgY29uc3QgZXhwbG9yZXIgPSBCTE9DS19FWFBMT1JFUlNbbmV0d29ya107XHJcbiAgaWYgKCFleHBsb3JlcikgcmV0dXJuICcnO1xyXG5cclxuICBjb25zdCBwYXR0ZXJuID0gZXhwbG9yZXJbdHlwZV07XHJcbiAgaWYgKCFwYXR0ZXJuKSByZXR1cm4gJyc7XHJcblxyXG4gIHJldHVybiBleHBsb3Jlci5iYXNlICsgcGF0dGVybi5yZXBsYWNlKGB7JHt0eXBlID09PSAndHgnID8gJ2hhc2gnIDogJ2FkZHJlc3MnfX1gLCB2YWx1ZSk7XHJcbn1cclxuXHJcbi8vID09PT09IElOSVRJQUxJWkFUSU9OID09PT09XHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBhc3luYyAoKSA9PiB7XHJcbiAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIGNvbm5lY3Rpb24gYXBwcm92YWwgcmVxdWVzdFxyXG4gIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XHJcbiAgY29uc3QgYWN0aW9uID0gdXJsUGFyYW1zLmdldCgnYWN0aW9uJyk7XHJcbiAgY29uc3Qgb3JpZ2luID0gdXJsUGFyYW1zLmdldCgnb3JpZ2luJyk7XHJcbiAgY29uc3QgcmVxdWVzdElkID0gdXJsUGFyYW1zLmdldCgncmVxdWVzdElkJyk7XHJcblxyXG4gIGlmIChhY3Rpb24gPT09ICdjb25uZWN0JyAmJiBvcmlnaW4gJiYgcmVxdWVzdElkKSB7XHJcbiAgICAvLyBTaG93IGNvbm5lY3Rpb24gYXBwcm92YWwgc2NyZWVuXHJcbiAgICBhd2FpdCBoYW5kbGVDb25uZWN0aW9uQXBwcm92YWxTY3JlZW4ob3JpZ2luLCByZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaWYgKGFjdGlvbiA9PT0gJ3RyYW5zYWN0aW9uJyAmJiByZXF1ZXN0SWQpIHtcclxuICAgIC8vIFNob3cgdHJhbnNhY3Rpb24gYXBwcm92YWwgc2NyZWVuXHJcbiAgICBzZXR1cEV2ZW50TGlzdGVuZXJzKCk7IC8vIFNldCB1cCBldmVudCBsaXN0ZW5lcnMgZmlyc3RcclxuICAgIGF3YWl0IGhhbmRsZVRyYW5zYWN0aW9uQXBwcm92YWxTY3JlZW4ocmVxdWVzdElkKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmIChhY3Rpb24gPT09ICdhZGRUb2tlbicgJiYgcmVxdWVzdElkKSB7XHJcbiAgICAvLyBTaG93IHRva2VuIGFkZCBhcHByb3ZhbCBzY3JlZW5cclxuICAgIGF3YWl0IGhhbmRsZVRva2VuQWRkQXBwcm92YWxTY3JlZW4ocmVxdWVzdElkKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmIChhY3Rpb24gPT09ICdzaWduJyAmJiByZXF1ZXN0SWQpIHtcclxuICAgIC8vIFNob3cgbWVzc2FnZSBzaWduaW5nIGFwcHJvdmFsIHNjcmVlblxyXG4gICAgYXdhaXQgaGFuZGxlTWVzc2FnZVNpZ25BcHByb3ZhbFNjcmVlbihyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaWYgKGFjdGlvbiA9PT0gJ3NpZ25UeXBlZCcgJiYgcmVxdWVzdElkKSB7XHJcbiAgICAvLyBTaG93IHR5cGVkIGRhdGEgc2lnbmluZyBhcHByb3ZhbCBzY3JlZW5cclxuICAgIGF3YWl0IGhhbmRsZVR5cGVkRGF0YVNpZ25BcHByb3ZhbFNjcmVlbihyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gTm9ybWFsIHBvcHVwIGZsb3dcclxuICAvLyBSdW4gbWlncmF0aW9uIGZpcnN0IChjb252ZXJ0cyBvbGQgc2luZ2xlLXdhbGxldCB0byBtdWx0aS13YWxsZXQgZm9ybWF0KVxyXG4gIGF3YWl0IG1pZ3JhdGVUb011bHRpV2FsbGV0KCk7XHJcblxyXG4gIGF3YWl0IGxvYWRTZXR0aW5ncygpO1xyXG4gIGF3YWl0IGxvYWROZXR3b3JrKCk7XHJcbiAgYXBwbHlUaGVtZSgpO1xyXG4gIGF3YWl0IGNoZWNrV2FsbGV0U3RhdHVzKCk7XHJcbiAgc2V0dXBFdmVudExpc3RlbmVycygpO1xyXG4gIHVwZGF0ZU5ldHdvcmtEaXNwbGF5cygpO1xyXG59KTtcclxuXHJcbi8vID09PT09IFNDUkVFTiBOQVZJR0FUSU9OID09PT09XHJcbmZ1bmN0aW9uIHNob3dTY3JlZW4oc2NyZWVuSWQpIHtcclxuICAvLyBIaWRlIGFsbCBzY3JlZW5zXHJcbiAgY29uc3Qgc2NyZWVucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tpZF49XCJzY3JlZW4tXCJdJyk7XHJcbiAgc2NyZWVucy5mb3JFYWNoKHNjcmVlbiA9PiBzY3JlZW4uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJykpO1xyXG5cclxuICAvLyBTaG93IHJlcXVlc3RlZCBzY3JlZW5cclxuICBjb25zdCBzY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzY3JlZW5JZCk7XHJcbiAgaWYgKHNjcmVlbikge1xyXG4gICAgc2NyZWVuLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgLy8gU2Nyb2xsIHRvIHRvcCB3aGVuIHNob3dpbmcgbmV3IHNjcmVlblxyXG4gICAgd2luZG93LnNjcm9sbFRvKDAsIDApO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY2hlY2tXYWxsZXRTdGF0dXMoKSB7XHJcbiAgY29uc3QgZXhpc3RzID0gYXdhaXQgd2FsbGV0RXhpc3RzKCk7XHJcblxyXG4gIGlmICghZXhpc3RzKSB7XHJcbiAgICAvLyBObyB3YWxsZXQgLSBzaG93IHNldHVwIHNjcmVlblxyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXNldHVwJyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIFdhbGxldCBleGlzdHMgLSBzaG93IHVubG9jayBzY3JlZW5cclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi11bmxvY2snKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFNFVFRJTkdTID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIGxvYWRTZXR0aW5ncygpIHtcclxuICBjb25zdCBzYXZlZCA9IGF3YWl0IGxvYWQoJ3NldHRpbmdzJyk7XHJcbiAgaWYgKHNhdmVkKSB7XHJcbiAgICBjdXJyZW50U3RhdGUuc2V0dGluZ3MgPSB7IC4uLmN1cnJlbnRTdGF0ZS5zZXR0aW5ncywgLi4uc2F2ZWQgfTtcclxuICB9XHJcblxyXG4gIC8vIExvYWQgbmV0d29yayBzZXR0aW5nc1xyXG4gIGNvbnN0IG5ldHdvcmtTZXR0aW5ncyA9IGF3YWl0IGxvYWQoJ25ldHdvcmtTZXR0aW5ncycpO1xyXG4gIGlmIChuZXR3b3JrU2V0dGluZ3MpIHtcclxuICAgIGN1cnJlbnRTdGF0ZS5uZXR3b3JrU2V0dGluZ3MgPSBuZXR3b3JrU2V0dGluZ3M7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzYXZlU2V0dGluZ3MoKSB7XHJcbiAgYXdhaXQgc2F2ZSgnc2V0dGluZ3MnLCBjdXJyZW50U3RhdGUuc2V0dGluZ3MpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBsb2FkTmV0d29yaygpIHtcclxuICBjb25zdCBzYXZlZCA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJyk7XHJcbiAgaWYgKHNhdmVkKSB7XHJcbiAgICBjdXJyZW50U3RhdGUubmV0d29yayA9IHNhdmVkO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2F2ZU5ldHdvcmsoKSB7XHJcbiAgYXdhaXQgc2F2ZSgnY3VycmVudE5ldHdvcmsnLCBjdXJyZW50U3RhdGUubmV0d29yayk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5VGhlbWUoKSB7XHJcbiAgLy8gUmVtb3ZlIGFsbCB0aGVtZSBjbGFzc2VzXHJcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCd0aGVtZS1oaWdoLWNvbnRyYXN0JywgJ3RoZW1lLXByb2Zlc3Npb25hbCcsICd0aGVtZS1hbWJlcicsICd0aGVtZS1jZ2EnLCAndGhlbWUtY2xhc3NpYycsICd0aGVtZS1oZWFydCcpO1xyXG5cclxuICAvLyBBcHBseSBjdXJyZW50IHRoZW1lXHJcbiAgaWYgKGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy50aGVtZSAhPT0gJ2hpZ2gtY29udHJhc3QnKSB7XHJcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoYHRoZW1lLSR7Y3VycmVudFN0YXRlLnNldHRpbmdzLnRoZW1lfWApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gRVZFTlQgTElTVEVORVJTID09PT09XHJcbmZ1bmN0aW9uIHNldHVwRXZlbnRMaXN0ZW5lcnMoKSB7XHJcbiAgLy8gU2V0dXAgc2NyZWVuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jcmVhdGUtd2FsbGV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgYXdhaXQgZ2VuZXJhdGVOZXdNbmVtb25pYygpO1xyXG4gICAgdXBkYXRlTmV0d29ya0Rpc3BsYXlzKCk7XHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tY3JlYXRlJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4taW1wb3J0LXdhbGxldCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIHVwZGF0ZU5ldHdvcmtEaXNwbGF5cygpO1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLWltcG9ydCcpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBOZXR3b3JrIHNlbGVjdGlvbiBvbiBzZXR1cCBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1zZWxlY3Qtc2V0dXAnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgIGN1cnJlbnRTdGF0ZS5uZXR3b3JrID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICBzYXZlTmV0d29yaygpO1xyXG4gICAgdXBkYXRlTmV0d29ya0Rpc3BsYXlzKCk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIENyZWF0ZSB3YWxsZXQgc2NyZWVuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Noay1zYXZlZC1tbmVtb25pYycpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgY29uc3QgcGFzc3dvcmRDcmVhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtY3JlYXRlJykudmFsdWU7XHJcbiAgICBjb25zdCBwYXNzd29yZENvbmZpcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtY29uZmlybScpLnZhbHVlO1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jcmVhdGUtc3VibWl0Jyk7XHJcblxyXG4gICAgYnRuLmRpc2FibGVkID0gIShlLnRhcmdldC5jaGVja2VkICYmIHBhc3N3b3JkQ3JlYXRlICYmIHBhc3N3b3JkQ29uZmlybSAmJiBwYXNzd29yZENyZWF0ZSA9PT0gcGFzc3dvcmRDb25maXJtKTtcclxuICB9KTtcclxuXHJcbiAgWydwYXNzd29yZC1jcmVhdGUnLCAncGFzc3dvcmQtY29uZmlybSddLmZvckVhY2goaWQgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcclxuICAgICAgY29uc3QgY2hlY2tlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGstc2F2ZWQtbW5lbW9uaWMnKS5jaGVja2VkO1xyXG4gICAgICBjb25zdCBwYXNzd29yZENyZWF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1jcmVhdGUnKS52YWx1ZTtcclxuICAgICAgY29uc3QgcGFzc3dvcmRDb25maXJtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLWNvbmZpcm0nKS52YWx1ZTtcclxuICAgICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jcmVhdGUtc3VibWl0Jyk7XHJcblxyXG4gICAgICBidG4uZGlzYWJsZWQgPSAhKGNoZWNrZWQgJiYgcGFzc3dvcmRDcmVhdGUgJiYgcGFzc3dvcmRDb25maXJtICYmIHBhc3N3b3JkQ3JlYXRlID09PSBwYXNzd29yZENvbmZpcm0pO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY3JlYXRlLXN1Ym1pdCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNyZWF0ZVdhbGxldCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtY3JlYXRlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLXNldHVwJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYmFjay1mcm9tLWNyZWF0ZScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1zZXR1cCcpKTtcclxuXHJcbiAgLy8gSW1wb3J0IHdhbGxldCBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1wb3J0LW1ldGhvZCcpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgY29uc3QgbW5lbW9uaWNHcm91cCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbXBvcnQtbW5lbW9uaWMtZ3JvdXAnKTtcclxuICAgIGNvbnN0IHByaXZhdGVrZXlHcm91cCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbXBvcnQtcHJpdmF0ZWtleS1ncm91cCcpO1xyXG5cclxuICAgIGlmIChlLnRhcmdldC52YWx1ZSA9PT0gJ21uZW1vbmljJykge1xyXG4gICAgICBtbmVtb25pY0dyb3VwLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICBwcml2YXRla2V5R3JvdXAuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtbmVtb25pY0dyb3VwLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICBwcml2YXRla2V5R3JvdXAuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4taW1wb3J0LXN1Ym1pdCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUltcG9ydFdhbGxldCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtaW1wb3J0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLXNldHVwJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYmFjay1mcm9tLWltcG9ydCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1zZXR1cCcpKTtcclxuXHJcbiAgLy8gVW5sb2NrIHNjcmVlblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdW5sb2NrJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlVW5sb2NrKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtdW5sb2NrJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgKGUpID0+IHtcclxuICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykge1xyXG4gICAgICBoYW5kbGVVbmxvY2soKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gQ3VzdG9tIG5ldHdvcmsgZHJvcGRvd25cclxuICBjb25zdCBuZXR3b3JrU2VsZWN0Q3VzdG9tID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmstc2VsZWN0LWN1c3RvbScpO1xyXG4gIGNvbnN0IG5ldHdvcmtEcm9wZG93bk1lbnUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1kcm9wZG93bi1tZW51Jyk7XHJcblxyXG4gIC8vIEluaXRpYWxpemUgZHJvcGRvd24gb3B0aW9uIGxvZ29zXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5ldHdvcmstb3B0aW9uIGltZycpLmZvckVhY2goaW1nID0+IHtcclxuICAgIGNvbnN0IGxvZ29GaWxlID0gaW1nLmdldEF0dHJpYnV0ZSgnZGF0YS1sb2dvJyk7XHJcbiAgICBpZiAobG9nb0ZpbGUpIHtcclxuICAgICAgaW1nLnNyYyA9IGNocm9tZS5ydW50aW1lLmdldFVSTChgYXNzZXRzL2xvZ29zLyR7bG9nb0ZpbGV9YCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIC8vIFRvZ2dsZSBkcm9wZG93blxyXG4gIG5ldHdvcmtTZWxlY3RDdXN0b20/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICBuZXR3b3JrRHJvcGRvd25NZW51LmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBIYW5kbGUgb3B0aW9uIHNlbGVjdGlvblxyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5uZXR3b3JrLW9wdGlvbicpLmZvckVhY2gob3B0aW9uID0+IHtcclxuICAgIG9wdGlvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIGNvbnN0IG5ldHdvcmsgPSBvcHRpb24uZ2V0QXR0cmlidXRlKCdkYXRhLW5ldHdvcmsnKTtcclxuICAgICAgY29uc3QgbmV0d29ya1RleHQgPSBvcHRpb24ucXVlcnlTZWxlY3Rvcignc3BhbicpLnRleHRDb250ZW50O1xyXG5cclxuICAgICAgY3VycmVudFN0YXRlLm5ldHdvcmsgPSBuZXR3b3JrO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1zZWxlY3RlZC10ZXh0JykudGV4dENvbnRlbnQgPSBuZXR3b3JrVGV4dDtcclxuICAgICAgbmV0d29ya0Ryb3Bkb3duTWVudS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgIHNhdmVOZXR3b3JrKCk7XHJcbiAgICAgIHVwZGF0ZU5ldHdvcmtEaXNwbGF5cygpO1xyXG4gICAgICBhd2FpdCBmZXRjaEJhbGFuY2UoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhvdmVyIGVmZmVjdCAtIGJvbGQgdGV4dFxyXG4gICAgb3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7XHJcbiAgICAgIG9wdGlvbi5xdWVyeVNlbGVjdG9yKCdzcGFuJykuc3R5bGUuZm9udFdlaWdodCA9ICdib2xkJztcclxuICAgIH0pO1xyXG4gICAgb3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XHJcbiAgICAgIG9wdGlvbi5xdWVyeVNlbGVjdG9yKCdzcGFuJykuc3R5bGUuZm9udFdlaWdodCA9ICdub3JtYWwnO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIENsb3NlIGRyb3Bkb3duIHdoZW4gY2xpY2tpbmcgb3V0c2lkZVxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgbmV0d29ya0Ryb3Bkb3duTWVudT8uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3YWxsZXQtc2VsZWN0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGFzeW5jIChlKSA9PiB7XHJcbiAgICBjb25zdCBzZWxlY3RlZFdhbGxldElkID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICBpZiAoc2VsZWN0ZWRXYWxsZXRJZCkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IHNldEFjdGl2ZVdhbGxldChzZWxlY3RlZFdhbGxldElkKTtcclxuICAgICAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgICAgICBjdXJyZW50U3RhdGUuYWRkcmVzcyA9IHdhbGxldC5hZGRyZXNzO1xyXG4gICAgICAgIGF3YWl0IHVwZGF0ZURhc2hib2FyZCgpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGFsZXJ0KCdFcnJvciBzd2l0Y2hpbmcgd2FsbGV0OiAnICsgc2FuaXRpemVFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1sb2NrJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlTG9jayk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1yZWZyZXNoJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgYXdhaXQgdXBkYXRlRGFzaGJvYXJkKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1zZXR0aW5ncycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGxvYWRTZXR0aW5nc1RvVUkoKTtcclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1zZXR0aW5ncycpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLW5ldHdvcmstc2V0dGluZ3MnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBsb2FkTmV0d29ya1NldHRpbmdzVG9VSSgpO1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLW5ldHdvcmstc2V0dGluZ3MnKTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20tbmV0d29yay1zZXR0aW5ncycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1zZXR0aW5ncycpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXNhdmUtbmV0d29yay1zZXR0aW5ncycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgIGF3YWl0IHNhdmVOZXR3b3JrU2V0dGluZ3MoKTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1yZXNldC1uZXR3b3JrLXNldHRpbmdzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgaWYgKGNvbmZpcm0oJ1Jlc2V0IGFsbCBuZXR3b3JrIHNldHRpbmdzIHRvIGRlZmF1bHRzPycpKSB7XHJcbiAgICAgIHJlc2V0TmV0d29ya1NldHRpbmdzVG9EZWZhdWx0cygpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS1hZGRyZXNzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQ29weUFkZHJlc3MpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tc2VuZCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3dTZW5kU2NyZWVuKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlY2VpdmUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93UmVjZWl2ZVNjcmVlbik7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi10b2tlbnMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93VG9rZW5zU2NyZWVuKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXR4LWhpc3RvcnknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93VHJhbnNhY3Rpb25IaXN0b3J5KTtcclxuXHJcbiAgLy8gU2VuZCBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS1zZW5kJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpO1xyXG4gICAgdXBkYXRlRGFzaGJvYXJkKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb25maXJtLXNlbmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTZW5kVHJhbnNhY3Rpb24pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2FuY2VsLXNlbmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tc2VuZC1tYXgnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTZW5kTWF4KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hc3NldC1zZWxlY3QnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlQXNzZXRDaGFuZ2UpO1xyXG5cclxuICAvLyBSZWNlaXZlIHNjcmVlblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYmFjay1mcm9tLXJlY2VpdmUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJykpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS1yZWNlaXZlLWFkZHJlc3MnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDb3B5UmVjZWl2ZUFkZHJlc3MpO1xyXG5cclxuICAvLyBUb2tlbnMgc2NyZWVuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20tdG9rZW5zJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWFkZC1jdXN0b20tdG9rZW4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93QWRkVG9rZW5Nb2RhbCk7XHJcblxyXG4gIC8vIFRva2VuIERldGFpbHMgc2NyZWVuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20tdG9rZW4tZGV0YWlscycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi10b2tlbnMnKTtcclxuICAgIGF3YWl0IHJlbmRlclRva2Vuc1NjcmVlbigpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWNvcHktYWRkcmVzcycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNvcHlUb2tlbkRldGFpbHNBZGRyZXNzKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXRva2VuLXNlbmQtbWF4Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlVG9rZW5TZW5kTWF4KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXRva2VuLXNlbmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVUb2tlblNlbmQpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWVuYWJsZS10b2dnbGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlVG9rZW5FbmFibGVUb2dnbGUpO1xyXG5cclxuICAvLyBUcmFuc2FjdGlvbiBIaXN0b3J5XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlbmRpbmctdHgtaW5kaWNhdG9yJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2hvd1RyYW5zYWN0aW9uSGlzdG9yeSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1iYWNrLWZyb20tdHgtaGlzdG9yeScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlci1hbGwtdHhzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gcmVuZGVyVHJhbnNhY3Rpb25IaXN0b3J5KCdhbGwnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlci1wZW5kaW5nLXR4cycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHJlbmRlclRyYW5zYWN0aW9uSGlzdG9yeSgncGVuZGluZycpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsdGVyLWNvbmZpcm1lZC10eHMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiByZW5kZXJUcmFuc2FjdGlvbkhpc3RvcnkoJ2NvbmZpcm1lZCcpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsZWFyLXR4LWhpc3RvcnknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDbGVhclRyYW5zYWN0aW9uSGlzdG9yeSk7XHJcblxyXG4gIC8vIFRyYW5zYWN0aW9uIERldGFpbHNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS10eC1kZXRhaWxzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLXR4LWhpc3RvcnknKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LXR4LWhhc2gnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICBjb25zdCBoYXNoID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1oYXNoJykudGV4dENvbnRlbnQ7XHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChoYXNoKTtcclxuICAgICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LXR4LWhhc2gnKTtcclxuICAgICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gYnRuLnRleHRDb250ZW50O1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSAnQ09QSUVEISc7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGJ0bi50ZXh0Q29udGVudCA9IG9yaWdpbmFsVGV4dDtcclxuICAgICAgfSwgMjAwMCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBhbGVydCgnRmFpbGVkIHRvIGNvcHkgaGFzaCcpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tc3BlZWQtdXAtdHgnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTcGVlZFVwVHJhbnNhY3Rpb24pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2FuY2VsLXR4Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQ2FuY2VsVHJhbnNhY3Rpb24pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVmcmVzaC10eC1zdGF0dXMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZWZyZXNoVHJhbnNhY3Rpb25TdGF0dXMpO1xyXG5cclxuICAvLyBTcGVlZC11cCB0cmFuc2FjdGlvbiBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2Utc3BlZWQtdXAtbW9kYWwnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtc3BlZWQtdXAtdHgnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1zcGVlZC11cCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1zcGVlZC11cC10eCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29uZmlybS1zcGVlZC11cCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNvbmZpcm1TcGVlZFVwKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlZnJlc2gtZ2FzLXByaWNlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcmVmcmVzaEdhc1ByaWNlcyk7XHJcblxyXG4gIC8vIENhbmNlbCB0cmFuc2FjdGlvbiBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtY2FuY2VsLW1vZGFsJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWNhbmNlbC10eCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtY2FuY2VsJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWNhbmNlbC10eCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29uZmlybS1jYW5jZWwnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjb25maXJtQ2FuY2VsVHJhbnNhY3Rpb24pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVmcmVzaC1jYW5jZWwtZ2FzLXByaWNlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcmVmcmVzaENhbmNlbEdhc1ByaWNlcyk7XHJcblxyXG4gIC8vIEdhcyBwcmljZSByZWZyZXNoIGJ1dHRvbnNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlZnJlc2gtYXBwcm92YWwtZ2FzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcmVmcmVzaEFwcHJvdmFsR2FzUHJpY2UpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVmcmVzaC1zZW5kLWdhcycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlZnJlc2hTZW5kR2FzUHJpY2UpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVmcmVzaC10b2tlbi1nYXMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZWZyZXNoVG9rZW5HYXNQcmljZSk7XHJcblxyXG4gIC8vIEFkZCB0b2tlbiBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtYWRkLXRva2VuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWFkZC10b2tlbicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2FuY2VsLWFkZC10b2tlbicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtdG9rZW4nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvbmZpcm0tYWRkLXRva2VuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQWRkQ3VzdG9tVG9rZW4pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC10b2tlbi1hZGRyZXNzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgaGFuZGxlVG9rZW5BZGRyZXNzSW5wdXQpO1xyXG5cclxuICAvLyBTZXR0aW5ncyBzY3JlZW5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWJhY2stZnJvbS1zZXR0aW5ncycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctdGhlbWUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy50aGVtZSA9IGUudGFyZ2V0LnZhbHVlO1xyXG4gICAgYXBwbHlUaGVtZSgpO1xyXG4gICAgc2F2ZVNldHRpbmdzKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctZGVjaW1hbHMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICAgIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5kZWNpbWFsUGxhY2VzID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgc2F2ZVNldHRpbmdzKCk7XHJcbiAgICB1cGRhdGVCYWxhbmNlRGlzcGxheSgpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLWF1dG9sb2NrJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XHJcbiAgICBjdXJyZW50U3RhdGUuc2V0dGluZ3MuYXV0b0xvY2tNaW51dGVzID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgc2F2ZVNldHRpbmdzKCk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctbWF4LWdhcy1wcmljZScpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgY29uc3QgdmFsdWUgPSBwYXJzZUZsb2F0KGUudGFyZ2V0LnZhbHVlKTtcclxuICAgIC8vIFZhbGlkYXRlOiBtdXN0IGJlIHBvc2l0aXZlIG51bWJlclxyXG4gICAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA8PSAwKSB7XHJcbiAgICAgIGFsZXJ0KCdHYXMgcHJpY2UgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xyXG4gICAgICBlLnRhcmdldC52YWx1ZSA9IGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5tYXhHYXNQcmljZUd3ZWkgfHwgMTAwMDtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgLy8gVmFsaWRhdGU6IHJlYXNvbmFibGUgbWF4aW11bSAoMTAwLDAwMCBHd2VpID0gMC4wMDAxIEVUSCBwZXIgZ2FzKVxyXG4gICAgaWYgKHZhbHVlID4gMTAwMDAwKSB7XHJcbiAgICAgIGNvbnN0IGNvbmZpcm1lZCA9IGNvbmZpcm0oXHJcbiAgICAgICAgJ1dhcm5pbmc6IFNldHRpbmcgbWF4IGdhcyBwcmljZSBhYm92ZSAxMDAsMDAwIEd3ZWkgaXMgZXh0cmVtZWx5IGhpZ2guXFxuXFxuJyArXHJcbiAgICAgICAgJ1RoaXMgY291bGQgYWxsb3cgbWFzc2l2ZSB0cmFuc2FjdGlvbiBmZWVzLlxcblxcbicgK1xyXG4gICAgICAgICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gc2V0IGl0IHRvICcgKyB2YWx1ZSArICcgR3dlaT8nXHJcbiAgICAgICk7XHJcbiAgICAgIGlmICghY29uZmlybWVkKSB7XHJcbiAgICAgICAgZS50YXJnZXQudmFsdWUgPSBjdXJyZW50U3RhdGUuc2V0dGluZ3MubWF4R2FzUHJpY2VHd2VpIHx8IDEwMDA7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBjdXJyZW50U3RhdGUuc2V0dGluZ3MubWF4R2FzUHJpY2VHd2VpID0gdmFsdWU7XHJcbiAgICBzYXZlU2V0dGluZ3MoKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0dGluZy1zaG93LXRlc3RuZXRzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XHJcbiAgICBjdXJyZW50U3RhdGUuc2V0dGluZ3Muc2hvd1Rlc3ROZXR3b3JrcyA9IGUudGFyZ2V0LmNoZWNrZWQ7XHJcbiAgICBzYXZlU2V0dGluZ3MoKTtcclxuICAgIHVwZGF0ZU5ldHdvcmtTZWxlY3RvcigpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLWFsbG93LWV0aC1zaWduJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XHJcbiAgICAvLyBJZiB0cnlpbmcgdG8gZW5hYmxlLCBzaG93IHN0cm9uZyB3YXJuaW5nXHJcbiAgICBpZiAoZS50YXJnZXQuY2hlY2tlZCkge1xyXG4gICAgICBjb25zdCBjb25maXJtZWQgPSBjb25maXJtKFxyXG4gICAgICAgICfimqDvuI8gREFOR0VSOiBFTkFCTEUgZXRoX3NpZ24/XFxuXFxuJyArXHJcbiAgICAgICAgJ2V0aF9zaWduIGlzIGEgREVQUkVDQVRFRCBhbmQgREFOR0VST1VTIHNpZ25pbmcgbWV0aG9kLlxcblxcbicgK1xyXG4gICAgICAgICdNYWxpY2lvdXMgc2l0ZXMgY2FuIHVzZSBpdCB0byBzaWduIHRyYW5zYWN0aW9ucyB0aGF0IGNvdWxkIGRyYWluIHlvdXIgZW50aXJlIHdhbGxldC5cXG5cXG4nICtcclxuICAgICAgICAnVGhpcyBtZXRob2Qgc2hvdWxkIE9OTFkgYmUgZW5hYmxlZCBpZjpcXG4nICtcclxuICAgICAgICAn4oCiIFlvdSBmdWxseSB0cnVzdCB0aGUgc2l0ZSByZXF1ZXN0aW5nIGl0XFxuJyArXHJcbiAgICAgICAgJ+KAoiBZb3UgdW5kZXJzdGFuZCB3aGF0IGRhdGEgaXMgYmVpbmcgc2lnbmVkXFxuJyArXHJcbiAgICAgICAgJ+KAoiBUaGUgc2l0ZSBjYW5ub3QgdXNlIHBlcnNvbmFsX3NpZ24gaW5zdGVhZFxcblxcbicgK1xyXG4gICAgICAgICdEbyB5b3Ugd2FudCB0byBlbmFibGUgdGhpcyBkYW5nZXJvdXMgbWV0aG9kPydcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGlmICghY29uZmlybWVkKSB7XHJcbiAgICAgICAgLy8gVXNlciBjYW5jZWxsZWQsIHJldmVydCB0aGUgY2hlY2tib3hcclxuICAgICAgICBlLnRhcmdldC5jaGVja2VkID0gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY3VycmVudFN0YXRlLnNldHRpbmdzLmFsbG93RXRoU2lnbiA9IGUudGFyZ2V0LmNoZWNrZWQ7XHJcbiAgICBzYXZlU2V0dGluZ3MoKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXZpZXctc2VlZCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVZpZXdTZWVkKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWV4cG9ydC1rZXknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVFeHBvcnRLZXkpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdXNlLWN1cnJlbnQtZ2FzLXByaWNlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlVXNlQ3VycmVudEdhc1ByaWNlKTtcclxuXHJcbiAgLy8gUGFzc3dvcmQgcHJvbXB0IG1vZGFsXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1wYXNzd29yZC1wcm9tcHQtY29uZmlybScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1pbnB1dCcpLnZhbHVlO1xyXG4gICAgaWYgKHBhc3N3b3JkKSB7XHJcbiAgICAgIGNsb3NlUGFzc3dvcmRQcm9tcHQocGFzc3dvcmQpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXBhc3N3b3JkLXByb21wdC1jYW5jZWwnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBjbG9zZVBhc3N3b3JkUHJvbXB0KG51bGwpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLXBhc3N3b3JkLXByb21wdCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGNsb3NlUGFzc3dvcmRQcm9tcHQobnVsbCk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1wcm9tcHQtaW5wdXQnKT8uYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCAoZSkgPT4ge1xyXG4gICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XHJcbiAgICAgIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1pbnB1dCcpLnZhbHVlO1xyXG4gICAgICBpZiAocGFzc3dvcmQpIHtcclxuICAgICAgICBjbG9zZVBhc3N3b3JkUHJvbXB0KHBhc3N3b3JkKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBEaXNwbGF5IHNlY3JldCBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtZGlzcGxheS1zZWNyZXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZVNlY3JldE1vZGFsKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLWRpc3BsYXktc2VjcmV0LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlU2VjcmV0TW9kYWwpO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvcHktc2VjcmV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgY29uc3Qgc2VjcmV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpc3BsYXktc2VjcmV0LWNvbnRlbnQnKS50ZXh0Q29udGVudDtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHNlY3JldCk7XHJcbiAgICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS1zZWNyZXQnKTtcclxuICAgICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gYnRuLnRleHRDb250ZW50O1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSAnQ09QSUVEISc7XHJcbiAgICAgIGJ0bi5jbGFzc0xpc3QuYWRkKCd0ZXh0LXN1Y2Nlc3MnKTtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgYnRuLnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0O1xyXG4gICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCd0ZXh0LXN1Y2Nlc3MnKTtcclxuICAgICAgfSwgMjAwMCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBhbGVydCgnRmFpbGVkIHRvIGNvcHkgdG8gY2xpcGJvYXJkJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIC8vIE11bHRpLXdhbGxldCBtYW5hZ2VtZW50XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1tYW5hZ2Utd2FsbGV0cycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZU1hbmFnZVdhbGxldHMpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYmFjay1mcm9tLW1hbmFnZS13YWxsZXRzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1NjcmVlbignc2NyZWVuLXNldHRpbmdzJykpO1xyXG5cclxuICAvLyBBZGQgd2FsbGV0IGJ1dHRvbnNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNyZWF0ZS1uZXctd2FsbGV0LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2hvd0FkZFdhbGxldE1vZGFsKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWltcG9ydC13YWxsZXQtbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93QWRkV2FsbGV0TW9kYWwpO1xyXG5cclxuICAvLyBBZGQgd2FsbGV0IG1vZGFsIC0gb3B0aW9uIHNlbGVjdGlvblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtd2FsbGV0LW9wdGlvbi1jcmVhdGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYWRkLXdhbGxldCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZ2VuZXJhdGVOZXdNbmVtb25pY011bHRpKCk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtY3JlYXRlLXdhbGxldC1tdWx0aScpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkLXdhbGxldC1vcHRpb24tbW5lbW9uaWMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYWRkLXdhbGxldCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1zZWVkLW11bHRpJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtd2FsbGV0LW9wdGlvbi1wcml2YXRla2V5Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWFkZC13YWxsZXQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1pbXBvcnQta2V5LW11bHRpJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtYWRkLXdhbGxldCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtd2FsbGV0JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIENyZWF0ZSB3YWxsZXQgbXVsdGkgbW9kYWxcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvbmZpcm0tY3JlYXRlLXdhbGxldC1tdWx0aScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNyZWF0ZU5ld1dhbGxldE11bHRpKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1jcmVhdGUtd2FsbGV0LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWNyZWF0ZS13YWxsZXQtbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1uZXctd2FsbGV0LW5pY2tuYW1lJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0xLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0yLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zLW11bHRpJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZmljYXRpb24tZXJyb3ItbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLWNyZWF0ZS13YWxsZXQtbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtY3JlYXRlLXdhbGxldC1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LW5ldy13YWxsZXQtbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTEtbXVsdGknKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTItbXVsdGknKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTMtbXVsdGknKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmaWNhdGlvbi1lcnJvci1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBJbXBvcnQgc2VlZCBtdWx0aSBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29uZmlybS1pbXBvcnQtc2VlZC1tdWx0aScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUltcG9ydFNlZWRNdWx0aSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtaW1wb3J0LXNlZWQtbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LXNlZWQtbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtc2VlZC1uaWNrbmFtZScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXNlZWQtcGhyYXNlJykudmFsdWUgPSAnJztcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLWltcG9ydC1zZWVkLW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1zZWVkLW11bHRpJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXNlZWQtbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1zZWVkLXBocmFzZScpLnZhbHVlID0gJyc7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEltcG9ydCBwcml2YXRlIGtleSBtdWx0aSBtb2RhbFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29uZmlybS1pbXBvcnQta2V5LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlSW1wb3J0S2V5TXVsdGkpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2FuY2VsLWltcG9ydC1rZXktbXVsdGknKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LWtleS1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1rZXktbmlja25hbWUnKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1wcml2YXRlLWtleScpLnZhbHVlID0gJyc7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS1pbXBvcnQta2V5LW11bHRpJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1rZXktbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQta2V5LW5pY2tuYW1lJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtcHJpdmF0ZS1rZXknKS52YWx1ZSA9ICcnO1xyXG4gIH0pO1xyXG5cclxuICAvLyBSZW5hbWUgd2FsbGV0IG1vZGFsXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb25maXJtLXJlbmFtZS13YWxsZXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVSZW5hbWVXYWxsZXRDb25maXJtKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1yZW5hbWUtd2FsbGV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXJlbmFtZS13YWxsZXQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGN1cnJlbnRSZW5hbWVXYWxsZXRJZCA9IG51bGw7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS1yZW5hbWUtd2FsbGV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXJlbmFtZS13YWxsZXQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGN1cnJlbnRSZW5hbWVXYWxsZXRJZCA9IG51bGw7XHJcbiAgfSk7XHJcblxyXG4gIC8vIFRyYW5zYWN0aW9uIHN1Y2Nlc3MgbW9kYWxcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLXR4LXN1Y2Nlc3MnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtdHgtc3VjY2VzcycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tb2stdHgtc3VjY2VzcycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC10eC1zdWNjZXNzJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LXR4LWhhc2gnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCB0eEhhc2ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc3VjY2Vzcy1oYXNoJykudGV4dENvbnRlbnQ7XHJcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHR4SGFzaCk7XHJcbiAgICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS10eC1oYXNoJyk7XHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGJ0bi50ZXh0Q29udGVudDtcclxuICAgICAgYnRuLnRleHRDb250ZW50ID0gJ0NvcGllZCEnO1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBidG4udGV4dENvbnRlbnQgPSBvcmlnaW5hbFRleHQ7XHJcbiAgICAgIH0sIDIwMDApO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgYWxlcnQoJ0ZhaWxlZCB0byBjb3B5IHRyYW5zYWN0aW9uIGhhc2gnKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gVHJhbnNhY3Rpb24gU3RhdHVzIEJ1dHRvbnMgKGluIGFwcHJvdmFsIHBvcHVwKVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdHgtc3RhdHVzLWV4cGxvcmVyJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgaWYgKCF0eFN0YXR1c0N1cnJlbnRIYXNoKSByZXR1cm47XHJcbiAgICBjb25zdCB1cmwgPSBnZXRFeHBsb3JlclVybChjdXJyZW50U3RhdGUubmV0d29yaywgJ3R4JywgdHhTdGF0dXNDdXJyZW50SGFzaCk7XHJcbiAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmwgfSk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtdHgtc3RhdHVzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ/Cfq4AgQ2xvc2UgYnV0dG9uIGNsaWNrZWQnKTtcclxuICAgIGlmICh0eFN0YXR1c1BvbGxJbnRlcnZhbCkge1xyXG4gICAgICBjbGVhckludGVydmFsKHR4U3RhdHVzUG9sbEludGVydmFsKTtcclxuICAgICAgdHhTdGF0dXNQb2xsSW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgd2luZG93LmNsb3NlKCk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdHgtc3RhdHVzLXNwZWVkLXVwJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKCF0eFN0YXR1c0N1cnJlbnRIYXNoIHx8ICF0eFN0YXR1c0N1cnJlbnRBZGRyZXNzKSByZXR1cm47XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gR2V0IHRyYW5zYWN0aW9uIGRldGFpbHNcclxuICAgICAgY29uc3QgdHhSZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnR0VUX1RYX0JZX0hBU0gnLFxyXG4gICAgICAgIGFkZHJlc3M6IHR4U3RhdHVzQ3VycmVudEFkZHJlc3MsXHJcbiAgICAgICAgdHhIYXNoOiB0eFN0YXR1c0N1cnJlbnRIYXNoXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKCF0eFJlc3BvbnNlLnN1Y2Nlc3MgfHwgIXR4UmVzcG9uc2UudHJhbnNhY3Rpb24pIHtcclxuICAgICAgICBhbGVydCgnQ291bGQgbm90IGxvYWQgdHJhbnNhY3Rpb24gZGV0YWlscycpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgdHggPSB0eFJlc3BvbnNlLnRyYW5zYWN0aW9uO1xyXG5cclxuICAgICAgLy8gU3RvcmUgc3RhdGUgZm9yIG1vZGFsXHJcbiAgICAgIHNwZWVkVXBNb2RhbFN0YXRlLnR4SGFzaCA9IHR4U3RhdHVzQ3VycmVudEhhc2g7XHJcbiAgICAgIHNwZWVkVXBNb2RhbFN0YXRlLmFkZHJlc3MgPSB0eFN0YXR1c0N1cnJlbnRBZGRyZXNzO1xyXG4gICAgICBzcGVlZFVwTW9kYWxTdGF0ZS5uZXR3b3JrID0gdHgubmV0d29yaztcclxuICAgICAgc3BlZWRVcE1vZGFsU3RhdGUub3JpZ2luYWxHYXNQcmljZSA9IHR4Lmdhc1ByaWNlO1xyXG5cclxuICAgICAgLy8gU2hvdyBtb2RhbCBhbmQgbG9hZCBnYXMgcHJpY2VzXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1zcGVlZC11cC10eCcpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICBhd2FpdCByZWZyZXNoR2FzUHJpY2VzKCk7XHJcblxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igb3BlbmluZyBzcGVlZC11cCBtb2RhbDonLCBlcnJvcik7XHJcbiAgICAgIGFsZXJ0KCdFcnJvciBsb2FkaW5nIGdhcyBwcmljZXMnKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi10eC1zdGF0dXMtY2FuY2VsJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKCF0eFN0YXR1c0N1cnJlbnRIYXNoIHx8ICF0eFN0YXR1c0N1cnJlbnRBZGRyZXNzKSByZXR1cm47XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gR2V0IHRyYW5zYWN0aW9uIGRldGFpbHNcclxuICAgICAgY29uc3QgdHhSZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnR0VUX1RYX0JZX0hBU0gnLFxyXG4gICAgICAgIGFkZHJlc3M6IHR4U3RhdHVzQ3VycmVudEFkZHJlc3MsXHJcbiAgICAgICAgdHhIYXNoOiB0eFN0YXR1c0N1cnJlbnRIYXNoXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKCF0eFJlc3BvbnNlLnN1Y2Nlc3MgfHwgIXR4UmVzcG9uc2UudHJhbnNhY3Rpb24pIHtcclxuICAgICAgICBhbGVydCgnQ291bGQgbm90IGxvYWQgdHJhbnNhY3Rpb24gZGV0YWlscycpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgdHggPSB0eFJlc3BvbnNlLnRyYW5zYWN0aW9uO1xyXG5cclxuICAgICAgLy8gU3RvcmUgc3RhdGUgZm9yIG1vZGFsXHJcbiAgICAgIGNhbmNlbE1vZGFsU3RhdGUudHhIYXNoID0gdHhTdGF0dXNDdXJyZW50SGFzaDtcclxuICAgICAgY2FuY2VsTW9kYWxTdGF0ZS5hZGRyZXNzID0gdHhTdGF0dXNDdXJyZW50QWRkcmVzcztcclxuICAgICAgY2FuY2VsTW9kYWxTdGF0ZS5uZXR3b3JrID0gdHgubmV0d29yaztcclxuICAgICAgY2FuY2VsTW9kYWxTdGF0ZS5vcmlnaW5hbEdhc1ByaWNlID0gdHguZ2FzUHJpY2U7XHJcblxyXG4gICAgICAvLyBTaG93IG1vZGFsIGFuZCBsb2FkIGdhcyBwcmljZXNcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWNhbmNlbC10eCcpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICBhd2FpdCByZWZyZXNoQ2FuY2VsR2FzUHJpY2VzKCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBvcGVuaW5nIGNhbmNlbCBtb2RhbDonLCBlcnJvcik7XHJcbiAgICAgIGFsZXJ0KCdFcnJvciBsb2FkaW5nIGdhcyBwcmljZXMnKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gR2xvYmFsIGFjdGl2aXR5IHRyYWNraW5nIGZvciBhdXRvLWxvY2tcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlc2V0QWN0aXZpdHlUaW1lcik7XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCByZXNldEFjdGl2aXR5VGltZXIpO1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHJlc2V0QWN0aXZpdHlUaW1lcik7XHJcbn1cclxuXHJcbi8vID09PT09IFdBTExFVCBDUkVBVElPTiA9PT09PVxyXG5sZXQgZ2VuZXJhdGVkTW5lbW9uaWMgPSAnJztcclxubGV0IHZlcmlmaWNhdGlvbldvcmRzID0gW107IC8vIEFycmF5IG9mIHtpbmRleCwgd29yZH0gZm9yIHZlcmlmaWNhdGlvblxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVOZXdNbmVtb25pYygpIHtcclxuICB0cnkge1xyXG4gICAgLy8gSW1wb3J0IGV0aGVycyB0byBnZW5lcmF0ZSBtbmVtb25pY1xyXG4gICAgY29uc3QgeyBldGhlcnMgfSA9IGF3YWl0IGltcG9ydCgnZXRoZXJzJyk7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUgYSByYW5kb20gd2FsbGV0IHRvIGdldCB0aGUgbW5lbW9uaWNcclxuICAgIGNvbnN0IHJhbmRvbVdhbGxldCA9IGV0aGVycy5XYWxsZXQuY3JlYXRlUmFuZG9tKCk7XHJcbiAgICBnZW5lcmF0ZWRNbmVtb25pYyA9IHJhbmRvbVdhbGxldC5tbmVtb25pYy5waHJhc2U7XHJcblxyXG4gICAgLy8gRGlzcGxheSB0aGUgbW5lbW9uaWNcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtbmVtb25pYy1kaXNwbGF5JykudGV4dENvbnRlbnQgPSBnZW5lcmF0ZWRNbmVtb25pYztcclxuXHJcbiAgICAvLyBTZXQgdXAgdmVyaWZpY2F0aW9uIChhc2sgZm9yIDMgcmFuZG9tIHdvcmRzIHVzaW5nIGNyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSByYW5kb20pXHJcbiAgICBjb25zdCB3b3JkcyA9IGdlbmVyYXRlZE1uZW1vbmljLnNwbGl0KCcgJyk7XHJcbiAgICBjb25zdCByYW5kb21CeXRlcyA9IG5ldyBVaW50OEFycmF5KDMpO1xyXG4gICAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhyYW5kb21CeXRlcyk7XHJcbiAgICBjb25zdCBpbmRpY2VzID0gW1xyXG4gICAgICByYW5kb21CeXRlc1swXSAlIDQsIC8vIFdvcmQgMS00XHJcbiAgICAgIDQgKyAocmFuZG9tQnl0ZXNbMV0gJSA0KSwgLy8gV29yZCA1LThcclxuICAgICAgOCArIChyYW5kb21CeXRlc1syXSAlIDQpIC8vIFdvcmQgOS0xMlxyXG4gICAgXTtcclxuXHJcbiAgICB2ZXJpZmljYXRpb25Xb3JkcyA9IGluZGljZXMubWFwKGkgPT4gKHsgaW5kZXg6IGksIHdvcmQ6IHdvcmRzW2ldIH0pKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIFVJIHdpdGggdGhlIHJhbmRvbSBpbmRpY2VzXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMS1udW0nKS50ZXh0Q29udGVudCA9ICh2ZXJpZmljYXRpb25Xb3Jkc1swXS5pbmRleCArIDEpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTItbnVtJykudGV4dENvbnRlbnQgPSAodmVyaWZpY2F0aW9uV29yZHNbMV0uaW5kZXggKyAxKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zLW51bScpLnRleHRDb250ZW50ID0gKHZlcmlmaWNhdGlvbldvcmRzWzJdLmluZGV4ICsgMSk7XHJcblxyXG4gICAgLy8gQ2xlYXIgdGhlIHZlcmlmaWNhdGlvbiBpbnB1dHNcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0xJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0yJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZmljYXRpb24tZXJyb3InKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2VuZXJhdGluZyBtbmVtb25pYzonLCBlcnJvcik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW5lbW9uaWMtZGlzcGxheScpLnRleHRDb250ZW50ID0gJ0Vycm9yIGdlbmVyYXRpbmcgbW5lbW9uaWMuIFBsZWFzZSB0cnkgYWdhaW4uJztcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNyZWF0ZVdhbGxldCgpIHtcclxuICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1jcmVhdGUnKS52YWx1ZTtcclxuICBjb25zdCBwYXNzd29yZENvbmZpcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtY29uZmlybScpLnZhbHVlO1xyXG4gIGNvbnN0IGVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NyZWF0ZS1lcnJvcicpO1xyXG4gIGNvbnN0IHZlcmlmaWNhdGlvbkVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmaWNhdGlvbi1lcnJvcicpO1xyXG5cclxuICAvLyBWYWxpZGF0ZVxyXG4gIGlmIChwYXNzd29yZCAhPT0gcGFzc3dvcmRDb25maXJtKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9ICdQYXNzd29yZHMgZG8gbm90IG1hdGNoJztcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gRW5zdXJlIHdlIGhhdmUgYSBtbmVtb25pY1xyXG4gIGlmICghZ2VuZXJhdGVkTW5lbW9uaWMpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gJ05vIG1uZW1vbmljIGdlbmVyYXRlZC4gUGxlYXNlIGdvIGJhY2sgYW5kIHRyeSBhZ2Fpbi4nO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBWZXJpZnkgc2VlZCBwaHJhc2Ugd29yZHNcclxuICBjb25zdCB3b3JkMSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0xJykudmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3Qgd29yZDIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMicpLnZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IHdvcmQzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTMnKS52YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaWYgKCF3b3JkMSB8fCAhd29yZDIgfHwgIXdvcmQzKSB7XHJcbiAgICB2ZXJpZmljYXRpb25FcnJvckRpdi50ZXh0Q29udGVudCA9ICdQbGVhc2UgZW50ZXIgYWxsIHZlcmlmaWNhdGlvbiB3b3JkcyB0byBjb25maXJtIHlvdSBoYXZlIGJhY2tlZCB1cCB5b3VyIHNlZWQgcGhyYXNlLic7XHJcbiAgICB2ZXJpZmljYXRpb25FcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmICh3b3JkMSAhPT0gdmVyaWZpY2F0aW9uV29yZHNbMF0ud29yZC50b0xvd2VyQ2FzZSgpIHx8XHJcbiAgICAgIHdvcmQyICE9PSB2ZXJpZmljYXRpb25Xb3Jkc1sxXS53b3JkLnRvTG93ZXJDYXNlKCkgfHxcclxuICAgICAgd29yZDMgIT09IHZlcmlmaWNhdGlvbldvcmRzWzJdLndvcmQudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYudGV4dENvbnRlbnQgPSAnVmVyaWZpY2F0aW9uIHdvcmRzIGRvIG5vdCBtYXRjaC4gUGxlYXNlIGRvdWJsZS1jaGVjayB5b3VyIHNlZWQgcGhyYXNlIGJhY2t1cC4nO1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB2ZXJpZmljYXRpb25FcnJvckRpdi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAvLyBJbXBvcnQgd2FsbGV0IGZyb20gdGhlIG1uZW1vbmljIHdlIGFscmVhZHkgZ2VuZXJhdGVkXHJcbiAgICBjb25zdCB7IGFkZHJlc3MgfSA9IGF3YWl0IGltcG9ydEZyb21NbmVtb25pYyhnZW5lcmF0ZWRNbmVtb25pYywgcGFzc3dvcmQpO1xyXG5cclxuICAgIC8vIFN1Y2Nlc3MhIE5hdmlnYXRlIHRvIGRhc2hib2FyZFxyXG4gICAgYWxlcnQoJ1dhbGxldCBjcmVhdGVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuICAgIGN1cnJlbnRTdGF0ZS5hZGRyZXNzID0gYWRkcmVzcztcclxuICAgIGN1cnJlbnRTdGF0ZS5pc1VubG9ja2VkID0gdHJ1ZTtcclxuICAgIGN1cnJlbnRTdGF0ZS5sYXN0QWN0aXZpdHlUaW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAvLyBTdGFydCBhdXRvLWxvY2sgdGltZXJcclxuICAgIHN0YXJ0QXV0b0xvY2tUaW1lcigpO1xyXG5cclxuICAgIC8vIENsZWFyIHRoZSBnZW5lcmF0ZWQgbW5lbW9uaWMgZnJvbSBtZW1vcnkgZm9yIHNlY3VyaXR5XHJcbiAgICBnZW5lcmF0ZWRNbmVtb25pYyA9ICcnO1xyXG4gICAgdmVyaWZpY2F0aW9uV29yZHMgPSBbXTtcclxuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJyk7XHJcbiAgICB1cGRhdGVEYXNoYm9hcmQoKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBXQUxMRVQgSU1QT1JUID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUltcG9ydFdhbGxldCgpIHtcclxuICBjb25zdCBtZXRob2QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1wb3J0LW1ldGhvZCcpLnZhbHVlO1xyXG4gIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLWltcG9ydCcpLnZhbHVlO1xyXG4gIGNvbnN0IHBhc3N3b3JkQ29uZmlybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1pbXBvcnQtY29uZmlybScpLnZhbHVlO1xyXG4gIGNvbnN0IGVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1lcnJvcicpO1xyXG5cclxuICAvLyBWYWxpZGF0ZVxyXG4gIGlmIChwYXNzd29yZCAhPT0gcGFzc3dvcmRDb25maXJtKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9ICdQYXNzd29yZHMgZG8gbm90IG1hdGNoJztcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgIGxldCBhZGRyZXNzO1xyXG4gICAgaWYgKG1ldGhvZCA9PT0gJ21uZW1vbmljJykge1xyXG4gICAgICBjb25zdCBtbmVtb25pYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbXBvcnQtbW5lbW9uaWMnKS52YWx1ZTtcclxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaW1wb3J0RnJvbU1uZW1vbmljKG1uZW1vbmljLCBwYXNzd29yZCk7XHJcbiAgICAgIGFkZHJlc3MgPSByZXN1bHQuYWRkcmVzcztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IHByaXZhdGVLZXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1wb3J0LXByaXZhdGVrZXknKS52YWx1ZTtcclxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaW1wb3J0RnJvbVByaXZhdGVLZXkocHJpdmF0ZUtleSwgcGFzc3dvcmQpO1xyXG4gICAgICBhZGRyZXNzID0gcmVzdWx0LmFkZHJlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3VjY2VzcyFcclxuICAgIGFsZXJ0KCdXYWxsZXQgaW1wb3J0ZWQgc3VjY2Vzc2Z1bGx5IScpO1xyXG4gICAgY3VycmVudFN0YXRlLmFkZHJlc3MgPSBhZGRyZXNzO1xyXG4gICAgY3VycmVudFN0YXRlLmlzVW5sb2NrZWQgPSB0cnVlO1xyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpO1xyXG4gICAgdXBkYXRlRGFzaGJvYXJkKCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gVU5MT0NLID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVVubG9jaygpIHtcclxuICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC11bmxvY2snKS52YWx1ZTtcclxuICBjb25zdCBlcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1bmxvY2stZXJyb3InKTtcclxuXHJcbiAgLy8gQ2hlY2sgaWYgbG9ja2VkIG91dCBkdWUgdG8gdG9vIG1hbnkgZmFpbGVkIGF0dGVtcHRzXHJcbiAgY29uc3QgbG9ja291dEluZm8gPSBhd2FpdCBjaGVja1JhdGVMaW1pdExvY2tvdXQoKTtcclxuICBpZiAobG9ja291dEluZm8uaXNMb2NrZWRPdXQpIHtcclxuICAgIGNvbnN0IHJlbWFpbmluZ01pbnV0ZXMgPSBNYXRoLmNlaWwobG9ja291dEluZm8ucmVtYWluaW5nTXMgLyAxMDAwIC8gNjApO1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBgVG9vIG1hbnkgZmFpbGVkIGF0dGVtcHRzLiBQbGVhc2Ugd2FpdCAke3JlbWFpbmluZ01pbnV0ZXN9IG1pbnV0ZShzKSBiZWZvcmUgdHJ5aW5nIGFnYWluLmA7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAvLyBVbmxvY2sgd2FsbGV0IHdpdGggYXV0by11cGdyYWRlIG5vdGlmaWNhdGlvblxyXG4gICAgY29uc3QgeyBhZGRyZXNzLCBzaWduZXIsIHVwZ3JhZGVkLCBpdGVyYXRpb25zQmVmb3JlLCBpdGVyYXRpb25zQWZ0ZXIgfSA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICBvblVwZ3JhZGVTdGFydDogKGluZm8pID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhg8J+UkCBBdXRvLXVwZ3JhZGluZyB3YWxsZXQgZW5jcnlwdGlvbjogJHtpbmZvLmN1cnJlbnRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IGl0ZXJhdGlvbnNgKTtcclxuICAgICAgICAvLyBTaG93IHZpc3VhbCBmZWVkYmFjayBpbiBVSVxyXG4gICAgICAgIGNvbnN0IHN0YXR1c0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIHN0YXR1c0Rpdi5jbGFzc05hbWUgPSAnc3RhdHVzLW1lc3NhZ2UgaW5mbyc7XHJcbiAgICAgICAgc3RhdHVzRGl2LnRleHRDb250ZW50ID0gYPCflJAgVXBncmFkaW5nIHdhbGxldCBzZWN1cml0eSB0byAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IGl0ZXJhdGlvbnMuLi5gO1xyXG4gICAgICAgIGVycm9yRGl2LnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHN0YXR1c0RpdiwgZXJyb3JEaXYpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gc3RhdHVzRGl2LnJlbW92ZSgpLCAzMDAwKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2hvdyB1cGdyYWRlIGNvbXBsZXRpb24gbWVzc2FnZSBpZiB3YWxsZXQgd2FzIHVwZ3JhZGVkXHJcbiAgICBpZiAodXBncmFkZWQpIHtcclxuICAgICAgY29uc29sZS5sb2coYOKchSBXYWxsZXQgdXBncmFkZWQ6ICR7aXRlcmF0aW9uc0JlZm9yZS50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpdGVyYXRpb25zQWZ0ZXIudG9Mb2NhbGVTdHJpbmcoKX0gaXRlcmF0aW9uc2ApO1xyXG4gICAgICBjb25zdCBzdGF0dXNEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgc3RhdHVzRGl2LmNsYXNzTmFtZSA9ICdzdGF0dXMtbWVzc2FnZSBzdWNjZXNzJztcclxuICAgICAgc3RhdHVzRGl2LnRleHRDb250ZW50ID0gYOKchSBTZWN1cml0eSB1cGdyYWRlZDogJHtpdGVyYXRpb25zQmVmb3JlLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2l0ZXJhdGlvbnNBZnRlci50b0xvY2FsZVN0cmluZygpfSBpdGVyYXRpb25zYDtcclxuICAgICAgZXJyb3JEaXYucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoc3RhdHVzRGl2LCBlcnJvckRpdik7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gc3RhdHVzRGl2LnJlbW92ZSgpLCA1MDAwKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTdWNjZXNzISBDbGVhciBmYWlsZWQgYXR0ZW1wdHNcclxuICAgIGF3YWl0IGNsZWFyRmFpbGVkQXR0ZW1wdHMoKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgc2Vzc2lvbiB0b2tlbiBpbiBzZXJ2aWNlIHdvcmtlclxyXG4gICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBjb25zdCBkdXJhdGlvbk1zID0gY3VycmVudFN0YXRlLnNldHRpbmdzLmF1dG9Mb2NrTWludXRlcyAqIDYwICogMTAwMDtcclxuICAgIGNvbnN0IHNlc3Npb25SZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0NSRUFURV9TRVNTSU9OJyxcclxuICAgICAgcGFzc3dvcmQsXHJcbiAgICAgIHdhbGxldElkOiBhY3RpdmVXYWxsZXQuaWQsXHJcbiAgICAgIGR1cmF0aW9uTXNcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghc2Vzc2lvblJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIHNlc3Npb24nKTtcclxuICAgIH1cclxuXHJcbiAgICBjdXJyZW50U3RhdGUuaXNVbmxvY2tlZCA9IHRydWU7XHJcbiAgICBjdXJyZW50U3RhdGUuYWRkcmVzcyA9IGFkZHJlc3M7XHJcbiAgICBjdXJyZW50U3RhdGUuc2Vzc2lvblRva2VuID0gc2Vzc2lvblJlc3BvbnNlLnNlc3Npb25Ub2tlbjtcclxuICAgIGN1cnJlbnRTdGF0ZS5sYXN0QWN0aXZpdHlUaW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAvLyBTdGFydCBhdXRvLWxvY2sgdGltZXJcclxuICAgIHN0YXJ0QXV0b0xvY2tUaW1lcigpO1xyXG5cclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKTtcclxuICAgIHVwZGF0ZURhc2hib2FyZCgpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAvLyBSZWNvcmQgZmFpbGVkIGF0dGVtcHRcclxuICAgIGF3YWl0IHJlY29yZEZhaWxlZEF0dGVtcHQoKTtcclxuXHJcbiAgICAvLyBDaGVjayBpZiBub3cgbG9ja2VkIG91dFxyXG4gICAgY29uc3QgbmV3TG9ja291dEluZm8gPSBhd2FpdCBjaGVja1JhdGVMaW1pdExvY2tvdXQoKTtcclxuICAgIGlmIChuZXdMb2Nrb3V0SW5mby5pc0xvY2tlZE91dCkge1xyXG4gICAgICBjb25zdCByZW1haW5pbmdNaW51dGVzID0gTWF0aC5jZWlsKG5ld0xvY2tvdXRJbmZvLnJlbWFpbmluZ01zIC8gMTAwMCAvIDYwKTtcclxuICAgICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBgVG9vIG1hbnkgZmFpbGVkIGF0dGVtcHRzICgke01BWF9BVFRFTVBUU30pLiBXYWxsZXQgbG9ja2VkIGZvciAke3JlbWFpbmluZ01pbnV0ZXN9IG1pbnV0ZXMuYDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGF0dGVtcHRzTGVmdCA9IE1BWF9BVFRFTVBUUyAtIG5ld0xvY2tvdXRJbmZvLmF0dGVtcHRzO1xyXG4gICAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9IGAke2Vycm9yLm1lc3NhZ2V9ICgke2F0dGVtcHRzTGVmdH0gYXR0ZW1wdCR7YXR0ZW1wdHNMZWZ0ICE9PSAxID8gJ3MnIDogJyd9IHJlbWFpbmluZylgO1xyXG4gICAgfVxyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBMT0NLID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUxvY2soKSB7XHJcbiAgLy8gSW52YWxpZGF0ZSBzZXNzaW9uIGluIHNlcnZpY2Ugd29ya2VyXHJcbiAgaWYgKGN1cnJlbnRTdGF0ZS5zZXNzaW9uVG9rZW4pIHtcclxuICAgIGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0lOVkFMSURBVEVfU0VTU0lPTicsXHJcbiAgICAgIHNlc3Npb25Ub2tlbjogY3VycmVudFN0YXRlLnNlc3Npb25Ub2tlblxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBjdXJyZW50U3RhdGUuaXNVbmxvY2tlZCA9IGZhbHNlO1xyXG4gIGN1cnJlbnRTdGF0ZS5hZGRyZXNzID0gbnVsbDtcclxuICBjdXJyZW50U3RhdGUuc2Vzc2lvblRva2VuID0gbnVsbDtcclxuICBjdXJyZW50U3RhdGUubGFzdEFjdGl2aXR5VGltZSA9IG51bGw7XHJcbiAgc3RvcEF1dG9Mb2NrVGltZXIoKTtcclxuICBzaG93U2NyZWVuKCdzY3JlZW4tdW5sb2NrJyk7XHJcbn1cclxuXHJcbi8vID09PT09IEFVVE8tTE9DSyBUSU1FUiA9PT09PVxyXG5mdW5jdGlvbiBzdGFydEF1dG9Mb2NrVGltZXIoKSB7XHJcbiAgc3RvcEF1dG9Mb2NrVGltZXIoKTsgLy8gQ2xlYXIgYW55IGV4aXN0aW5nIHRpbWVyXHJcblxyXG4gIGNvbnN0IGNoZWNrSW50ZXJ2YWwgPSAxMDAwMDsgLy8gQ2hlY2sgZXZlcnkgMTAgc2Vjb25kc1xyXG5cclxuICBhdXRvTG9ja1RpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgaWYgKCFjdXJyZW50U3RhdGUuaXNVbmxvY2tlZCB8fCAhY3VycmVudFN0YXRlLmxhc3RBY3Rpdml0eVRpbWUpIHtcclxuICAgICAgc3RvcEF1dG9Mb2NrVGltZXIoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGlkbGVUaW1lID0gRGF0ZS5ub3coKSAtIGN1cnJlbnRTdGF0ZS5sYXN0QWN0aXZpdHlUaW1lO1xyXG4gICAgY29uc3QgYXV0b0xvY2tNcyA9IGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5hdXRvTG9ja01pbnV0ZXMgKiA2MCAqIDEwMDA7XHJcblxyXG4gICAgaWYgKGlkbGVUaW1lID49IGF1dG9Mb2NrTXMpIHtcclxuICAgICAgLy8gQXV0by1sb2NraW5nIHdhbGxldFxyXG4gICAgICBoYW5kbGVMb2NrKCk7XHJcbiAgICB9XHJcbiAgfSwgY2hlY2tJbnRlcnZhbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0b3BBdXRvTG9ja1RpbWVyKCkge1xyXG4gIGlmIChhdXRvTG9ja1RpbWVyKSB7XHJcbiAgICBjbGVhckludGVydmFsKGF1dG9Mb2NrVGltZXIpO1xyXG4gICAgYXV0b0xvY2tUaW1lciA9IG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZXNldEFjdGl2aXR5VGltZXIoKSB7XHJcbiAgaWYgKGN1cnJlbnRTdGF0ZS5pc1VubG9ja2VkKSB7XHJcbiAgICBjdXJyZW50U3RhdGUubGFzdEFjdGl2aXR5VGltZSA9IERhdGUubm93KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBSQVRFIExJTUlUSU5HID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIHJlY29yZEZhaWxlZEF0dGVtcHQoKSB7XHJcbiAgY29uc3QgZGF0YSA9IGF3YWl0IGxvYWQoUkFURV9MSU1JVF9LRVkpIHx8IHsgYXR0ZW1wdHM6IDAsIGZpcnN0QXR0ZW1wdFRpbWU6IERhdGUubm93KCkgfTtcclxuXHJcbiAgLy8gSWYgZmlyc3QgYXR0ZW1wdCBvciBhdHRlbXB0cyBoYXZlIGV4cGlyZWQsIHJlc2V0XHJcbiAgY29uc3QgdGltZVNpbmNlRmlyc3QgPSBEYXRlLm5vdygpIC0gZGF0YS5maXJzdEF0dGVtcHRUaW1lO1xyXG4gIGlmIChkYXRhLmF0dGVtcHRzID09PSAwIHx8IHRpbWVTaW5jZUZpcnN0ID4gTE9DS09VVF9EVVJBVElPTl9NUykge1xyXG4gICAgZGF0YS5hdHRlbXB0cyA9IDE7XHJcbiAgICBkYXRhLmZpcnN0QXR0ZW1wdFRpbWUgPSBEYXRlLm5vdygpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBkYXRhLmF0dGVtcHRzICs9IDE7XHJcbiAgfVxyXG5cclxuICBhd2FpdCBzYXZlKFJBVEVfTElNSVRfS0VZLCBkYXRhKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY2hlY2tSYXRlTGltaXRMb2Nrb3V0KCkge1xyXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBsb2FkKFJBVEVfTElNSVRfS0VZKTtcclxuXHJcbiAgaWYgKCFkYXRhIHx8IGRhdGEuYXR0ZW1wdHMgPT09IDApIHtcclxuICAgIHJldHVybiB7IGlzTG9ja2VkT3V0OiBmYWxzZSwgYXR0ZW1wdHM6IDAsIHJlbWFpbmluZ01zOiAwIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB0aW1lU2luY2VGaXJzdCA9IERhdGUubm93KCkgLSBkYXRhLmZpcnN0QXR0ZW1wdFRpbWU7XHJcblxyXG4gIC8vIElmIGxvY2tvdXQgcGVyaW9kIGhhcyBleHBpcmVkLCBjbGVhciBhdHRlbXB0c1xyXG4gIGlmICh0aW1lU2luY2VGaXJzdCA+IExPQ0tPVVRfRFVSQVRJT05fTVMpIHtcclxuICAgIGF3YWl0IGNsZWFyRmFpbGVkQXR0ZW1wdHMoKTtcclxuICAgIHJldHVybiB7IGlzTG9ja2VkT3V0OiBmYWxzZSwgYXR0ZW1wdHM6IDAsIHJlbWFpbmluZ01zOiAwIH07XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiBsb2NrZWQgb3V0XHJcbiAgaWYgKGRhdGEuYXR0ZW1wdHMgPj0gTUFYX0FUVEVNUFRTKSB7XHJcbiAgICBjb25zdCByZW1haW5pbmdNcyA9IExPQ0tPVVRfRFVSQVRJT05fTVMgLSB0aW1lU2luY2VGaXJzdDtcclxuICAgIHJldHVybiB7IGlzTG9ja2VkT3V0OiB0cnVlLCBhdHRlbXB0czogZGF0YS5hdHRlbXB0cywgcmVtYWluaW5nTXMgfTtcclxuICB9XHJcblxyXG4gIHJldHVybiB7IGlzTG9ja2VkT3V0OiBmYWxzZSwgYXR0ZW1wdHM6IGRhdGEuYXR0ZW1wdHMsIHJlbWFpbmluZ01zOiAwIH07XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGNsZWFyRmFpbGVkQXR0ZW1wdHMoKSB7XHJcbiAgYXdhaXQgc2F2ZShSQVRFX0xJTUlUX0tFWSwgeyBhdHRlbXB0czogMCwgZmlyc3RBdHRlbXB0VGltZTogMCB9KTtcclxufVxyXG5cclxuLy8gPT09PT0gREFTSEJPQVJEID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZURhc2hib2FyZCgpIHtcclxuICAvLyBVcGRhdGUgYWRkcmVzcyBkaXNwbGF5XHJcbiAgY29uc3QgYWRkcmVzc0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhbGxldC1hZGRyZXNzJyk7XHJcbiAgaWYgKGFkZHJlc3NFbCAmJiBjdXJyZW50U3RhdGUuYWRkcmVzcykge1xyXG4gICAgYWRkcmVzc0VsLnRleHRDb250ZW50ID0gc2hvcnRlbkFkZHJlc3MoY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gIH1cclxuXHJcbiAgLy8gRmV0Y2ggYW5kIHVwZGF0ZSBiYWxhbmNlXHJcbiAgYXdhaXQgZmV0Y2hCYWxhbmNlKCk7XHJcblxyXG4gIC8vIEZldGNoIGFuZCB1cGRhdGUgdG9rZW4gcHJpY2VzIChhc3luYywgZG9uJ3QgYmxvY2sgZGFzaGJvYXJkIGxvYWQpXHJcbiAgZmV0Y2hBbmRVcGRhdGVQcmljZXMoKTtcclxuXHJcbiAgLy8gVXBkYXRlIG5ldHdvcmsgc2VsZWN0b3JcclxuICB1cGRhdGVOZXR3b3JrU2VsZWN0b3IoKTtcclxuICB1cGRhdGVOZXR3b3JrRGlzcGxheXMoKTtcclxuXHJcbiAgLy8gVXBkYXRlIHdhbGxldCBzZWxlY3RvclxyXG4gIGF3YWl0IHVwZGF0ZVdhbGxldFNlbGVjdG9yKCk7XHJcblxyXG4gIC8vIFVwZGF0ZSBwZW5kaW5nIHRyYW5zYWN0aW9uIGluZGljYXRvclxyXG4gIGF3YWl0IHVwZGF0ZVBlbmRpbmdUeEluZGljYXRvcigpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVSZWNlbnRUcmFuc2FjdGlvbnMoKSB7XHJcbiAgY29uc3QgdHhMaXN0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtbGlzdCcpO1xyXG4gIGlmICghdHhMaXN0RWwgfHwgIWN1cnJlbnRTdGF0ZS5hZGRyZXNzKSByZXR1cm47XHJcblxyXG4gIC8vIFNob3cgbG9hZGluZyBzdGF0ZVxyXG4gIC8vIFNFQ1VSSVRZOiBpbm5lckhUTUwgaXMgc2FmZSBoZXJlIC0gc3RyaW5nIGlzIGhhcmRjb2RlZC4gRE8gTk9UIGFkZCBkeW5hbWljIGRhdGEgd2l0aG91dCBlc2NhcGluZy5cclxuICB0eExpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPkxvYWRpbmcgdHJhbnNhY3Rpb25zLi4uPC9wPic7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB0cmFuc2FjdGlvbnMgPSBhd2FpdCBycGMuZ2V0UmVjZW50VHJhbnNhY3Rpb25zKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCBjdXJyZW50U3RhdGUuYWRkcmVzcywgMywgMTAwMCk7XHJcblxyXG4gICAgaWYgKHRyYW5zYWN0aW9ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgLy8gU0VDVVJJVFk6IGlubmVySFRNTCBpcyBzYWZlIGhlcmUgLSBzdHJpbmcgaXMgaGFyZGNvZGVkLiBETyBOT1QgYWRkIGR5bmFtaWMgZGF0YSB3aXRob3V0IGVzY2FwaW5nLlxyXG4gICAgICB0eExpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPk5vIHJlY2VudCB0cmFuc2FjdGlvbnM8L3A+JztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBodG1sID0gJyc7XHJcblxyXG4gICAgZm9yIChjb25zdCB0eCBvZiB0cmFuc2FjdGlvbnMpIHtcclxuICAgICAgY29uc3QgdmFsdWVFdGggPSBldGhlcnMuZm9ybWF0RXRoZXIodHgudmFsdWUpO1xyXG4gICAgICBjb25zdCBmb3JtYXR0ZWQgPSBmb3JtYXRCYWxhbmNlV2l0aENvbW1hcyh2YWx1ZUV0aCwgMTgpO1xyXG4gICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUodHgudGltZXN0YW1wICogMTAwMCkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XHJcbiAgICAgIGNvbnN0IHR5cGUgPSB0eC50eXBlID09PSAnc2VudCcgPyAn4oaSJyA6ICfihpAnO1xyXG4gICAgICBjb25zdCB0eXBlQ29sb3IgPSB0eC50eXBlID09PSAnc2VudCcgPyAnI2ZmNDQ0NCcgOiAnIzQ0ZmY0NCc7XHJcbiAgICAgIGNvbnN0IGV4cGxvcmVyVXJsID0gZ2V0RXhwbG9yZXJVcmwoY3VycmVudFN0YXRlLm5ldHdvcmssICd0eCcsIHR4Lmhhc2gpO1xyXG5cclxuICAgICAgaHRtbCArPSBgXHJcbiAgICAgICAgPGRpdiBzdHlsZT1cInBhZGRpbmc6IDhweDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRlcm1pbmFsLWJvcmRlcik7IGZvbnQtc2l6ZTogMTFweDtcIj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IG1hcmdpbi1ib3R0b206IDRweDtcIj5cclxuICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJjb2xvcjogJHt0eXBlQ29sb3J9O1wiPiR7dHlwZX0gJHt0eC50eXBlID09PSAnc2VudCcgPyAnU2VudCcgOiAnUmVjZWl2ZWQnfTwvc3Bhbj5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LWRpbVwiPiR7ZGF0ZX08L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+XHJcbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC13ZWlnaHQ6IGJvbGQ7XCIgdGl0bGU9XCIke2Zvcm1hdHRlZC50b29sdGlwfVwiPiR7Zm9ybWF0dGVkLmRpc3BsYXl9PC9zcGFuPlxyXG4gICAgICAgICAgICA8YSBocmVmPVwiJHtleHBsb3JlclVybH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiBzdHlsZT1cImNvbG9yOiB2YXIoLS10ZXJtaW5hbC1ncmVlbik7IHRleHQtZGVjb3JhdGlvbjogbm9uZTsgZm9udC1zaXplOiAxMHB4O1wiPlZJRVcg4oaSPC9hPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIGA7XHJcbiAgICB9XHJcblxyXG4gICAgdHhMaXN0RWwuaW5uZXJIVE1MID0gaHRtbDtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdHJhbnNhY3Rpb25zOicsIGVycm9yKTtcclxuICAgIHR4TGlzdEVsLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtZGltXCI+RXJyb3IgbG9hZGluZyB0cmFuc2FjdGlvbnM8L3A+JztcclxuICB9XHJcbn1cclxuXHJcbi8vIFVwZGF0ZSB3YWxsZXQgc2VsZWN0b3IgZHJvcGRvd25cclxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlV2FsbGV0U2VsZWN0b3IoKSB7XHJcbiAgY29uc3Qgd2FsbGV0U2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhbGxldC1zZWxlY3QnKTtcclxuICBpZiAoIXdhbGxldFNlbGVjdCkgcmV0dXJuO1xyXG5cclxuICBjb25zdCB3YWxsZXRzRGF0YSA9IGF3YWl0IGdldEFsbFdhbGxldHMoKTtcclxuXHJcbiAgaWYgKHdhbGxldHNEYXRhLndhbGxldExpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICB3YWxsZXRTZWxlY3QuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJcIj5ObyB3YWxsZXRzPC9vcHRpb24+JztcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHdhbGxldFNlbGVjdC5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgd2FsbGV0c0RhdGEud2FsbGV0TGlzdC5mb3JFYWNoKHdhbGxldCA9PiB7XHJcbiAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuICAgIG9wdGlvbi52YWx1ZSA9IHdhbGxldC5pZDtcclxuICAgIG9wdGlvbi50ZXh0Q29udGVudCA9IHdhbGxldC5uaWNrbmFtZSB8fCAnVW5uYW1lZCBXYWxsZXQnO1xyXG5cclxuICAgIGlmICh3YWxsZXQuaWQgPT09IHdhbGxldHNEYXRhLmFjdGl2ZVdhbGxldElkKSB7XHJcbiAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgd2FsbGV0U2VsZWN0LmFwcGVuZENoaWxkKG9wdGlvbik7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIFVwZGF0ZSBuZXR3b3JrIGRpc3BsYXlzIGFjcm9zcyBhbGwgc2NyZWVuc1xyXG5mdW5jdGlvbiB1cGRhdGVOZXR3b3JrRGlzcGxheXMoKSB7XHJcbiAgY29uc3QgbmV0d29ya05hbWUgPSBORVRXT1JLX05BTUVTW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXSB8fCAnVW5rbm93biBOZXR3b3JrJztcclxuXHJcbiAgLy8gU2V0dXAgc2NyZWVuIHNlbGVjdG9yXHJcbiAgY29uc3Qgc2V0dXBTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1zZWxlY3Qtc2V0dXAnKTtcclxuICBpZiAoc2V0dXBTZWxlY3QpIHtcclxuICAgIHNldHVwU2VsZWN0LnZhbHVlID0gY3VycmVudFN0YXRlLm5ldHdvcms7XHJcbiAgfVxyXG5cclxuICAvLyBDcmVhdGUgc2NyZWVuIGRpc3BsYXlcclxuICBjb25zdCBjcmVhdGVEaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmstZGlzcGxheS1jcmVhdGUnKTtcclxuICBpZiAoY3JlYXRlRGlzcGxheSkge1xyXG4gICAgY3JlYXRlRGlzcGxheS50ZXh0Q29udGVudCA9IG5ldHdvcmtOYW1lO1xyXG4gIH1cclxuXHJcbiAgLy8gSW1wb3J0IHNjcmVlbiBkaXNwbGF5XHJcbiAgY29uc3QgaW1wb3J0RGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrLWRpc3BsYXktaW1wb3J0Jyk7XHJcbiAgaWYgKGltcG9ydERpc3BsYXkpIHtcclxuICAgIGltcG9ydERpc3BsYXkudGV4dENvbnRlbnQgPSBuZXR3b3JrTmFtZTtcclxuICB9XHJcblxyXG4gIC8vIERhc2hib2FyZCBjdXN0b20gZHJvcGRvd25cclxuICBjb25zdCBuZXR3b3JrU2VsZWN0ZWRUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmstc2VsZWN0ZWQtdGV4dCcpO1xyXG4gIGlmIChuZXR3b3JrU2VsZWN0ZWRUZXh0KSB7XHJcbiAgICBuZXR3b3JrU2VsZWN0ZWRUZXh0LnRleHRDb250ZW50ID0gbmV0d29ya05hbWU7XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGUgbmV0d29yayBzZWxlY3RvciBsb2dvXHJcbiAgY29uc3Qgc2VsZWN0b3JMb2dvRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yay1zZWxlY3Rvci1sb2dvJyk7XHJcbiAgaWYgKHNlbGVjdG9yTG9nb0VsKSB7XHJcbiAgICBjb25zdCBuZXR3b3JrTG9nb3MgPSB7XHJcbiAgICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICdwbHMucG5nJyxcclxuICAgICAgJ3B1bHNlY2hhaW4nOiAncGxzLnBuZycsXHJcbiAgICAgICdldGhlcmV1bSc6ICdldGgucG5nJyxcclxuICAgICAgJ3NlcG9saWEnOiAnZXRoLnBuZydcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgbG9nb0ZpbGUgPSBuZXR3b3JrTG9nb3NbY3VycmVudFN0YXRlLm5ldHdvcmtdO1xyXG4gICAgaWYgKGxvZ29GaWxlKSB7XHJcbiAgICAgIHNlbGVjdG9yTG9nb0VsLnNyYyA9IGNocm9tZS5ydW50aW1lLmdldFVSTChgYXNzZXRzL2xvZ29zLyR7bG9nb0ZpbGV9YCk7XHJcbiAgICAgIHNlbGVjdG9yTG9nb0VsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZWN0b3JMb2dvRWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGZldGNoQmFsYW5jZSgpIHtcclxuICBpZiAoIWN1cnJlbnRTdGF0ZS5hZGRyZXNzKSB7XHJcbiAgICBjdXJyZW50U3RhdGUuYmFsYW5jZSA9ICcwJztcclxuICAgIHVwZGF0ZUJhbGFuY2VEaXNwbGF5KCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgYmFsYW5jZVdlaSA9IGF3YWl0IHJwYy5nZXRCYWxhbmNlKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCBjdXJyZW50U3RhdGUuYWRkcmVzcyk7XHJcbiAgICBjdXJyZW50U3RhdGUuYmFsYW5jZSA9IHJwYy5mb3JtYXRCYWxhbmNlKGJhbGFuY2VXZWksIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5kZWNpbWFsUGxhY2VzKTtcclxuICAgIHVwZGF0ZUJhbGFuY2VEaXNwbGF5KCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGJhbGFuY2U6JywgZXJyb3IpO1xyXG4gICAgLy8gS2VlcCBwcmV2aW91cyBiYWxhbmNlIG9uIGVycm9yXHJcbiAgICB1cGRhdGVCYWxhbmNlRGlzcGxheSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdHMgYSBiYWxhbmNlIHN0cmluZyB3aXRoIGNvbW1hcyBhbmQgcmV0dXJucyBkaXNwbGF5ICsgdG9vbHRpcCB2YWx1ZXNcclxuICogQHBhcmFtIHtzdHJpbmd9IGJhbGFuY2VTdHJpbmcgLSBCYWxhbmNlIGFzIHN0cmluZyAoZS5nLiwgXCIxMjM0LjU2NzhcIilcclxuICogQHBhcmFtIHtudW1iZXJ9IGZ1bGxEZWNpbWFscyAtIEZ1bGwgcHJlY2lzaW9uIGRlY2ltYWxzIChkZWZhdWx0IDE4KVxyXG4gKiBAcmV0dXJucyB7e2Rpc3BsYXk6IHN0cmluZywgdG9vbHRpcDogc3RyaW5nfX1cclxuICovXHJcbmZ1bmN0aW9uIGZvcm1hdEJhbGFuY2VXaXRoQ29tbWFzKGJhbGFuY2VTdHJpbmcsIGZ1bGxEZWNpbWFscyA9IDE4KSB7XHJcbiAgY29uc3QgYmFsYW5jZSA9IHBhcnNlRmxvYXQoYmFsYW5jZVN0cmluZyk7XHJcbiAgaWYgKGlzTmFOKGJhbGFuY2UpKSB7XHJcbiAgICByZXR1cm4geyBkaXNwbGF5OiBiYWxhbmNlU3RyaW5nLCB0b29sdGlwOiBiYWxhbmNlU3RyaW5nIH07XHJcbiAgfVxyXG5cclxuICAvLyBEaXNwbGF5IHZhbHVlIChrZWVwIGN1cnJlbnQgZGVjaW1hbHMsIGFkZCBjb21tYXMpXHJcbiAgY29uc3QgcGFydHMgPSBiYWxhbmNlU3RyaW5nLnNwbGl0KCcuJyk7XHJcbiAgcGFydHNbMF0gPSBwYXJ0c1swXS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCAnLCcpO1xyXG4gIGNvbnN0IGRpc3BsYXlWYWx1ZSA9IHBhcnRzLmpvaW4oJy4nKTtcclxuXHJcbiAgLy8gRnVsbCBwcmVjaXNpb24gdmFsdWUgd2l0aCBjb21tYXNcclxuICBjb25zdCBmdWxsUHJlY2lzaW9uID0gYmFsYW5jZS50b0ZpeGVkKGZ1bGxEZWNpbWFscyk7XHJcbiAgY29uc3QgZnVsbFBhcnRzID0gZnVsbFByZWNpc2lvbi5zcGxpdCgnLicpO1xyXG4gIGZ1bGxQYXJ0c1swXSA9IGZ1bGxQYXJ0c1swXS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCAnLCcpO1xyXG4gIGNvbnN0IGZ1bGxWYWx1ZSA9IGZ1bGxQYXJ0cy5qb2luKCcuJyk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBkaXNwbGF5OiBkaXNwbGF5VmFsdWUsXHJcbiAgICB0b29sdGlwOiBgRnVsbCBwcmVjaXNpb246ICR7ZnVsbFZhbHVlfWBcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVCYWxhbmNlRGlzcGxheSgpIHtcclxuICBjb25zdCBiYWxhbmNlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFsYW5jZS1hbW91bnQnKTtcclxuICBpZiAoYmFsYW5jZUVsKSB7XHJcbiAgICBjb25zdCBkZWNpbWFscyA9IGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5kZWNpbWFsUGxhY2VzO1xyXG4gICAgY29uc3QgYmFsYW5jZSA9IHBhcnNlRmxvYXQoY3VycmVudFN0YXRlLmJhbGFuY2UpO1xyXG5cclxuICAgIC8vIEZvcm1hdCB3aXRoIGNvbW1hcyBmb3IgcmVhZGFiaWxpdHlcclxuICAgIGNvbnN0IGZvcm1hdHRlZCA9IGJhbGFuY2UudG9GaXhlZChkZWNpbWFscyk7XHJcbiAgICBjb25zdCBwYXJ0cyA9IGZvcm1hdHRlZC5zcGxpdCgnLicpO1xyXG4gICAgcGFydHNbMF0gPSBwYXJ0c1swXS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCAnLCcpO1xyXG4gICAgY29uc3QgZGlzcGxheVZhbHVlID0gcGFydHMuam9pbignLicpO1xyXG5cclxuICAgIGJhbGFuY2VFbC50ZXh0Q29udGVudCA9IGRpc3BsYXlWYWx1ZTtcclxuXHJcbiAgICAvLyBTZXQgdG9vbHRpcCB3aXRoIGZ1bGwgcHJlY2lzaW9uICgxOCBkZWNpbWFscykgYW5kIGNvbW1hc1xyXG4gICAgY29uc3QgZnVsbFByZWNpc2lvbiA9IGJhbGFuY2UudG9GaXhlZCgxOCk7XHJcbiAgICBjb25zdCBmdWxsUGFydHMgPSBmdWxsUHJlY2lzaW9uLnNwbGl0KCcuJyk7XHJcbiAgICBmdWxsUGFydHNbMF0gPSBmdWxsUGFydHNbMF0ucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgJywnKTtcclxuICAgIGNvbnN0IGZ1bGxWYWx1ZSA9IGZ1bGxQYXJ0cy5qb2luKCcuJyk7XHJcbiAgICBiYWxhbmNlRWwudGl0bGUgPSBgRnVsbCBwcmVjaXNpb246ICR7ZnVsbFZhbHVlfWA7XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGUgYmFsYW5jZSBzeW1ib2wgYmFzZWQgb24gbmV0d29ya1xyXG4gIGNvbnN0IHN5bWJvbEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhbGFuY2Utc3ltYm9sJyk7XHJcbiAgaWYgKHN5bWJvbEVsKSB7XHJcbiAgICBjb25zdCBzeW1ib2xzID0ge1xyXG4gICAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAndFBMUycsXHJcbiAgICAgICdwdWxzZWNoYWluJzogJ1BMUycsXHJcbiAgICAgICdldGhlcmV1bSc6ICdFVEgnLFxyXG4gICAgICAnc2Vwb2xpYSc6ICdTRVAnXHJcbiAgICB9O1xyXG4gICAgc3ltYm9sRWwudGV4dENvbnRlbnQgPSBzeW1ib2xzW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXSB8fCAnVE9LRU4nO1xyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRlIFVTRCB2YWx1ZSBpZiBwcmljZXMgYXJlIGF2YWlsYWJsZVxyXG4gIGNvbnN0IHVzZEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhbGFuY2UtdXNkJyk7XHJcbiAgaWYgKHVzZEVsICYmIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcykge1xyXG4gICAgY29uc3QgdG9rZW5TeW1ib2wgPSBjdXJyZW50U3RhdGUubmV0d29yayA9PT0gJ3B1bHNlY2hhaW5UZXN0bmV0JyA/ICdQTFMnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUubmV0d29yayA9PT0gJ3B1bHNlY2hhaW4nID8gJ1BMUycgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGF0ZS5uZXR3b3JrID09PSAnZXRoZXJldW0nID8gJ0VUSCcgOiAnUExTJztcclxuXHJcbiAgICAvLyBDb252ZXJ0IGJhbGFuY2UgdG8gd2VpIChzdHJpbmcgd2l0aCAxOCBkZWNpbWFscylcclxuICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBldGhlcnMucGFyc2VFdGhlcihjdXJyZW50U3RhdGUuYmFsYW5jZS50b1N0cmluZygpKS50b1N0cmluZygpO1xyXG4gICAgY29uc3QgdXNkVmFsdWUgPSBnZXRUb2tlblZhbHVlVVNEKHRva2VuU3ltYm9sLCBiYWxhbmNlV2VpLCAxOCwgY3VycmVudFN0YXRlLnRva2VuUHJpY2VzKTtcclxuXHJcbiAgICBpZiAodXNkVmFsdWUgIT09IG51bGwpIHtcclxuICAgICAgdXNkRWwudGV4dENvbnRlbnQgPSBmb3JtYXRVU0QodXNkVmFsdWUpO1xyXG4gICAgICB1c2RFbC5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1mZy1kaW0pJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHVzZEVsLnRleHRDb250ZW50ID0gJ+KAlCc7XHJcbiAgICAgIHVzZEVsLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLWZnLWRpbSknO1xyXG4gICAgfVxyXG4gIH0gZWxzZSBpZiAodXNkRWwpIHtcclxuICAgIHVzZEVsLnRleHRDb250ZW50ID0gJ+KAlCc7XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGUgbmV0d29yayBsb2dvXHJcbiAgY29uc3QgbG9nb0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmstbG9nbycpO1xyXG4gIGlmIChsb2dvRWwpIHtcclxuICAgIGNvbnN0IG5ldHdvcmtMb2dvcyA9IHtcclxuICAgICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3Bscy5wbmcnLFxyXG4gICAgICAncHVsc2VjaGFpbic6ICdwbHMucG5nJyxcclxuICAgICAgJ2V0aGVyZXVtJzogJ2V0aC5wbmcnLFxyXG4gICAgICAnc2Vwb2xpYSc6ICdldGgucG5nJ1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBsb2dvRmlsZSA9IG5ldHdvcmtMb2dvc1tjdXJyZW50U3RhdGUubmV0d29ya107XHJcbiAgICBpZiAobG9nb0ZpbGUpIHtcclxuICAgICAgbG9nb0VsLnNyYyA9IGNocm9tZS5ydW50aW1lLmdldFVSTChgYXNzZXRzL2xvZ29zLyR7bG9nb0ZpbGV9YCk7XHJcbiAgICAgIGxvZ29FbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxvZ29FbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZldGNoIHRva2VuIHByaWNlcyBmcm9tIFB1bHNlWCBhbmQgdXBkYXRlIGRpc3BsYXlcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGZldGNoQW5kVXBkYXRlUHJpY2VzKCkge1xyXG4gIC8vIE9ubHkgZmV0Y2ggcHJpY2VzIGZvciBQdWxzZUNoYWluIG5ldHdvcmtzXHJcbiAgaWYgKGN1cnJlbnRTdGF0ZS5uZXR3b3JrICE9PSAncHVsc2VjaGFpbicgJiYgY3VycmVudFN0YXRlLm5ldHdvcmsgIT09ICdwdWxzZWNoYWluVGVzdG5ldCcpIHtcclxuICAgIGNvbnNvbGUubG9nKCfwn6uAIFByaWNlIGZldGNoaW5nIG5vdCBzdXBwb3J0ZWQgZm9yJywgY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gU2hvdyBsb2FkaW5nIGluZGljYXRvclxyXG4gIGNvbnN0IGxvYWRpbmdFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcmljZS1sb2FkaW5nJyk7XHJcbiAgY29uc3QgdXNkRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFsYW5jZS11c2QnKTtcclxuICBpZiAobG9hZGluZ0VsICYmIHVzZEVsKSB7XHJcbiAgICB1c2RFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGxvYWRpbmdFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihjdXJyZW50U3RhdGUubmV0d29yayk7XHJcbiAgICBjb25zdCBwcmljZXMgPSBhd2FpdCBmZXRjaFRva2VuUHJpY2VzKHByb3ZpZGVyLCBjdXJyZW50U3RhdGUubmV0d29yayA9PT0gJ3B1bHNlY2hhaW5UZXN0bmV0JyA/ICdwdWxzZWNoYWluJyA6IGN1cnJlbnRTdGF0ZS5uZXR3b3JrKTtcclxuXHJcbiAgICBpZiAocHJpY2VzKSB7XHJcbiAgICAgIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcyA9IHByaWNlcztcclxuICAgICAgdXBkYXRlQmFsYW5jZURpc3BsYXkoKTsgLy8gUmVmcmVzaCBkaXNwbGF5IHdpdGggVVNEIHZhbHVlc1xyXG4gICAgICAvLyBQcmljZXMgdXBkYXRlZFxyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB0b2tlbiBwcmljZXM6JywgZXJyb3IpO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICAvLyBIaWRlIGxvYWRpbmcgaW5kaWNhdG9yXHJcbiAgICBpZiAobG9hZGluZ0VsICYmIHVzZEVsKSB7XHJcbiAgICAgIGxvYWRpbmdFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgdXNkRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVOZXR3b3JrU2VsZWN0b3IoKSB7XHJcbiAgLy8gSWYgdGVzdCBuZXR3b3JrcyBhcmUgaGlkZGVuLCBoaWRlIHRlc3RuZXQgb3B0aW9ucyBpbiBjdXN0b20gZHJvcGRvd25cclxuICBjb25zdCBvcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5ldHdvcmstb3B0aW9uJyk7XHJcbiAgb3B0aW9ucy5mb3JFYWNoKG9wdGlvbiA9PiB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gb3B0aW9uLmdldEF0dHJpYnV0ZSgnZGF0YS1uZXR3b3JrJyk7XHJcbiAgICBjb25zdCBpc1Rlc3RuZXQgPSBuZXR3b3JrLmluY2x1ZGVzKCdUZXN0bmV0JykgfHwgbmV0d29yayA9PT0gJ3NlcG9saWEnO1xyXG4gICAgaWYgKGlzVGVzdG5ldCAmJiAhY3VycmVudFN0YXRlLnNldHRpbmdzLnNob3dUZXN0TmV0d29ya3MpIHtcclxuICAgICAgb3B0aW9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBvcHRpb24uc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuLy8gPT09PT0gU0VORCA9PT09PVxyXG5hc3luYyBmdW5jdGlvbiBzaG93U2VuZFNjcmVlbigpIHtcclxuICAvLyBQb3B1bGF0ZSBzZW5kIHNjcmVlbiB3aXRoIGN1cnJlbnQgd2FsbGV0IGluZm9cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1mcm9tLWFkZHJlc3MnKS50ZXh0Q29udGVudCA9IGN1cnJlbnRTdGF0ZS5hZGRyZXNzIHx8ICcweDAwMDAuLi4wMDAwJztcclxuXHJcbiAgLy8gUG9wdWxhdGUgYXNzZXQgc2VsZWN0b3Igd2l0aCBuYXRpdmUgKyB0b2tlbnNcclxuICBjb25zdCBhc3NldFNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWFzc2V0LXNlbGVjdCcpO1xyXG4gIGNvbnN0IHN5bWJvbHMgPSB7XHJcbiAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAndFBMUycsXHJcbiAgICAncHVsc2VjaGFpbic6ICdQTFMnLFxyXG4gICAgJ2V0aGVyZXVtJzogJ0VUSCcsXHJcbiAgICAnc2Vwb2xpYSc6ICdTRVAnXHJcbiAgfTtcclxuXHJcbiAgbGV0IG9wdGlvbnMgPSBgPG9wdGlvbiB2YWx1ZT1cIm5hdGl2ZVwiPk5hdGl2ZSAoJHtzeW1ib2xzW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXSB8fCAnVE9LRU4nfSk8L29wdGlvbj5gO1xyXG5cclxuICBjb25zdCBhbGxUb2tlbnMgPSBhd2FpdCB0b2tlbnMuZ2V0QWxsVG9rZW5zKGN1cnJlbnRTdGF0ZS5uZXR3b3JrKTtcclxuICBmb3IgKGNvbnN0IHRva2VuIG9mIGFsbFRva2Vucykge1xyXG4gICAgb3B0aW9ucyArPSBgPG9wdGlvbiB2YWx1ZT1cIiR7ZXNjYXBlSHRtbCh0b2tlbi5hZGRyZXNzKX1cIj4ke2VzY2FwZUh0bWwodG9rZW4uc3ltYm9sKX08L29wdGlvbj5gO1xyXG4gIH1cclxuXHJcbiAgYXNzZXRTZWxlY3QuaW5uZXJIVE1MID0gb3B0aW9ucztcclxuXHJcbiAgLy8gU2V0IGluaXRpYWwgYmFsYW5jZSB3aXRoIGZvcm1hdHRpbmdcclxuICBjb25zdCBiYWxhbmNlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hdmFpbGFibGUtYmFsYW5jZScpO1xyXG4gIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdEJhbGFuY2VXaXRoQ29tbWFzKGN1cnJlbnRTdGF0ZS5iYWxhbmNlLCAxOCk7XHJcbiAgYmFsYW5jZUVsLnRleHRDb250ZW50ID0gZm9ybWF0dGVkLmRpc3BsYXk7XHJcbiAgYmFsYW5jZUVsLnRpdGxlID0gZm9ybWF0dGVkLnRvb2x0aXA7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYmFsYW5jZS1zeW1ib2wnKS50ZXh0Q29udGVudCA9IHN5bWJvbHNbY3VycmVudFN0YXRlLm5ldHdvcmtdIHx8ICdUT0tFTic7XHJcblxyXG4gIC8vIENsZWFyIGZvcm1cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC10by1hZGRyZXNzJykudmFsdWUgPSAnJztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hbW91bnQnKS52YWx1ZSA9ICcnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLXBhc3N3b3JkJykudmFsdWUgPSAnJztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1lcnJvcicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAvLyBTaG93IGZvcm0gYW5kIGhpZGUgc3RhdHVzIHNlY3Rpb24gKHJlc2V0IHN0YXRlKVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWZvcm0nKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1zdGF0dXMtc2VjdGlvbicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICBzaG93U2NyZWVuKCdzY3JlZW4tc2VuZCcpO1xyXG5cclxuICAvLyBQb3B1bGF0ZSBnYXMgcHJpY2VzIGFuZCBub25jZVxyXG4gIGNvbnN0IHN5bWJvbCA9IHN5bWJvbHNbY3VycmVudFN0YXRlLm5ldHdvcmtdIHx8ICdUT0tFTic7XHJcbiAgY29uc3QgdHhSZXF1ZXN0ID0ge1xyXG4gICAgZnJvbTogY3VycmVudFN0YXRlLmFkZHJlc3MsXHJcbiAgICB0bzogY3VycmVudFN0YXRlLmFkZHJlc3MsIC8vIER1bW15IGZvciBlc3RpbWF0aW9uXHJcbiAgICB2YWx1ZTogJzB4MCdcclxuICB9O1xyXG4gIGF3YWl0IHBvcHVsYXRlU2VuZEdhc1ByaWNlcyhjdXJyZW50U3RhdGUubmV0d29yaywgdHhSZXF1ZXN0LCBzeW1ib2wpO1xyXG5cclxuICAvLyBGZXRjaCBhbmQgZGlzcGxheSBub25jZVxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBub25jZUhleCA9IGF3YWl0IHJwYy5nZXRUcmFuc2FjdGlvbkNvdW50KGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCBjdXJyZW50U3RhdGUuYWRkcmVzcywgJ3BlbmRpbmcnKTtcclxuICAgIGNvbnN0IG5vbmNlID0gcGFyc2VJbnQobm9uY2VIZXgsIDE2KTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWN1cnJlbnQtbm9uY2UnKS50ZXh0Q29udGVudCA9IG5vbmNlO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBub25jZTonLCBlcnJvcik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXJyZW50LW5vbmNlJykudGV4dENvbnRlbnQgPSAnRXJyb3InO1xyXG4gIH1cclxuXHJcbiAgLy8gU2V0dXAgY3VzdG9tIG5vbmNlIGNoZWNrYm94XHJcbiAgY29uc3QgY3VzdG9tTm9uY2VDaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWN1c3RvbS1ub25jZS1jaGVja2JveCcpO1xyXG4gIGNvbnN0IGN1c3RvbU5vbmNlQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtY3VzdG9tLW5vbmNlLWlucHV0LWNvbnRhaW5lcicpO1xyXG4gIGN1c3RvbU5vbmNlQ2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xyXG4gIGN1c3RvbU5vbmNlQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAvLyBSZW1vdmUgb2xkIGxpc3RlbmVyIGlmIGV4aXN0cyBhbmQgYWRkIG5ldyBvbmVcclxuICBjb25zdCBuZXdDaGVja2JveCA9IGN1c3RvbU5vbmNlQ2hlY2tib3guY2xvbmVOb2RlKHRydWUpO1xyXG4gIGN1c3RvbU5vbmNlQ2hlY2tib3gucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmV3Q2hlY2tib3gsIGN1c3RvbU5vbmNlQ2hlY2tib3gpO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXN0b20tbm9uY2UtY2hlY2tib3gnKS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgaWYgKGUudGFyZ2V0LmNoZWNrZWQpIHtcclxuICAgICAgY3VzdG9tTm9uY2VDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnROb25jZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWN1cnJlbnQtbm9uY2UnKS50ZXh0Q29udGVudDtcclxuICAgICAgaWYgKGN1cnJlbnROb25jZSAhPT0gJy0tJyAmJiBjdXJyZW50Tm9uY2UgIT09ICdFcnJvcicpIHtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXN0b20tbm9uY2UnKS52YWx1ZSA9IGN1cnJlbnROb25jZTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY3VzdG9tTm9uY2VDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFzc2V0Q2hhbmdlKCkge1xyXG4gIGNvbnN0IGFzc2V0U2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYXNzZXQtc2VsZWN0Jyk7XHJcbiAgY29uc3Qgc2VsZWN0ZWRWYWx1ZSA9IGFzc2V0U2VsZWN0LnZhbHVlO1xyXG5cclxuICBjb25zdCBzeW1ib2xzID0ge1xyXG4gICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3RQTFMnLFxyXG4gICAgJ3B1bHNlY2hhaW4nOiAnUExTJyxcclxuICAgICdldGhlcmV1bSc6ICdFVEgnLFxyXG4gICAgJ3NlcG9saWEnOiAnU0VQJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGJhbGFuY2VFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWF2YWlsYWJsZS1iYWxhbmNlJyk7XHJcblxyXG4gIGlmIChzZWxlY3RlZFZhbHVlID09PSAnbmF0aXZlJykge1xyXG4gICAgY29uc3QgZm9ybWF0dGVkID0gZm9ybWF0QmFsYW5jZVdpdGhDb21tYXMoY3VycmVudFN0YXRlLmJhbGFuY2UsIDE4KTtcclxuICAgIGJhbGFuY2VFbC50ZXh0Q29udGVudCA9IGZvcm1hdHRlZC5kaXNwbGF5O1xyXG4gICAgYmFsYW5jZUVsLnRpdGxlID0gZm9ybWF0dGVkLnRvb2x0aXA7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1iYWxhbmNlLXN5bWJvbCcpLnRleHRDb250ZW50ID0gc3ltYm9sc1tjdXJyZW50U3RhdGUubmV0d29ya10gfHwgJ1RPS0VOJztcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gR2V0IHRva2VuIGJhbGFuY2VcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGFsbFRva2VucyA9IGF3YWl0IHRva2Vucy5nZXRBbGxUb2tlbnMoY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG4gICAgICBjb25zdCB0b2tlbiA9IGFsbFRva2Vucy5maW5kKHQgPT4gdC5hZGRyZXNzID09PSBzZWxlY3RlZFZhbHVlKTtcclxuXHJcbiAgICAgIGlmICh0b2tlbikge1xyXG4gICAgICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBhd2FpdCBlcmMyMC5nZXRUb2tlbkJhbGFuY2UoY3VycmVudFN0YXRlLm5ldHdvcmssIHRva2VuLmFkZHJlc3MsIGN1cnJlbnRTdGF0ZS5hZGRyZXNzKTtcclxuICAgICAgICBjb25zdCByYXdCYWxhbmNlID0gZXJjMjAuZm9ybWF0VG9rZW5CYWxhbmNlKGJhbGFuY2VXZWksIHRva2VuLmRlY2ltYWxzLCA0KTtcclxuICAgICAgICBjb25zdCBmb3JtYXR0ZWQgPSBmb3JtYXRCYWxhbmNlV2l0aENvbW1hcyhyYXdCYWxhbmNlLCB0b2tlbi5kZWNpbWFscyk7XHJcbiAgICAgICAgYmFsYW5jZUVsLnRleHRDb250ZW50ID0gZm9ybWF0dGVkLmRpc3BsYXk7XHJcbiAgICAgICAgYmFsYW5jZUVsLnRpdGxlID0gZm9ybWF0dGVkLnRvb2x0aXA7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtYmFsYW5jZS1zeW1ib2wnKS50ZXh0Q29udGVudCA9IHRva2VuLnN5bWJvbDtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdG9rZW4gYmFsYW5jZTonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVTZW5kTWF4KCkge1xyXG4gIC8vIFNldCBhbW91bnQgdG8gYXZhaWxhYmxlIGJhbGFuY2UgKG1pbnVzIGVzdGltYXRlZCBnYXMpXHJcbiAgLy8gRm9yIHNpbXBsaWNpdHksIHdlJ2xsIGp1c3Qgc2V0IHRvIGN1cnJlbnQgYmFsYW5jZVxyXG4gIC8vIFVzZXIgc2hvdWxkIGxlYXZlIHNvbWUgZm9yIGdhc1xyXG4gIGNvbnN0IGJhbGFuY2UgPSBwYXJzZUZsb2F0KGN1cnJlbnRTdGF0ZS5iYWxhbmNlKTtcclxuICBpZiAoYmFsYW5jZSA+IDApIHtcclxuICAgIC8vIExlYXZlIGEgYml0IGZvciBnYXMgKHJvdWdoIGVzdGltYXRlOiAwLjAwMSBmb3Igc2ltcGxlIHRyYW5zZmVyKVxyXG4gICAgY29uc3QgbWF4U2VuZCA9IE1hdGgubWF4KDAsIGJhbGFuY2UgLSAwLjAwMSk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hbW91bnQnKS52YWx1ZSA9IG1heFNlbmQudG9TdHJpbmcoKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNlbmRUcmFuc2FjdGlvbigpIHtcclxuICBjb25zdCB0b0FkZHJlc3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC10by1hZGRyZXNzJykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IGFtb3VudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWFtb3VudCcpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLXBhc3N3b3JkJykudmFsdWU7XHJcbiAgY29uc3QgYXNzZXRTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1hc3NldC1zZWxlY3QnKTtcclxuICBjb25zdCBzZWxlY3RlZEFzc2V0ID0gYXNzZXRTZWxlY3QudmFsdWU7XHJcbiAgY29uc3QgZXJyb3JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWVycm9yJyk7XHJcblxyXG4gIGNvbnN0IHN5bWJvbHMgPSB7XHJcbiAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAndFBMUycsXHJcbiAgICAncHVsc2VjaGFpbic6ICdQTFMnLFxyXG4gICAgJ2V0aGVyZXVtJzogJ0VUSCcsXHJcbiAgICAnc2Vwb2xpYSc6ICdTRVAnXHJcbiAgfTtcclxuXHJcbiAgLy8gVmFsaWRhdGUgaW5wdXRzXHJcbiAgaWYgKCF0b0FkZHJlc3MgfHwgIWFtb3VudCB8fCAhcGFzc3dvcmQpIHtcclxuICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSAnUGxlYXNlIGZpbGwgaW4gYWxsIGZpZWxkcyc7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgYWRkcmVzcyBmb3JtYXRcclxuICBpZiAoIXRvQWRkcmVzcy5tYXRjaCgvXjB4W2EtZkEtRjAtOV17NDB9JC8pKSB7XHJcbiAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ0ludmFsaWQgcmVjaXBpZW50IGFkZHJlc3MnO1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIGFtb3VudFxyXG4gIGNvbnN0IGFtb3VudE51bSA9IHBhcnNlRmxvYXQoYW1vdW50KTtcclxuICBpZiAoaXNOYU4oYW1vdW50TnVtKSB8fCBhbW91bnROdW0gPD0gMCkge1xyXG4gICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdJbnZhbGlkIGFtb3VudCc7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgLy8gRGlzYWJsZSBzZW5kIGJ1dHRvbiB0byBwcmV2ZW50IGRvdWJsZS1jbGlja2luZ1xyXG4gICAgY29uc3Qgc2VuZEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29uZmlybS1zZW5kJyk7XHJcbiAgICBzZW5kQnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIHNlbmRCdG4uc3R5bGUub3BhY2l0eSA9ICcwLjUnO1xyXG4gICAgc2VuZEJ0bi5zdHlsZS5jdXJzb3IgPSAnbm90LWFsbG93ZWQnO1xyXG5cclxuICAgIC8vIFVubG9jayB3YWxsZXQgd2l0aCBwYXNzd29yZCBhbmQgYXV0by11cGdyYWRlIGlmIG5lZWRlZFxyXG4gICAgY29uc3QgeyBzaWduZXIsIHVwZ3JhZGVkLCBpdGVyYXRpb25zQmVmb3JlLCBpdGVyYXRpb25zQWZ0ZXIgfSA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICBvblVwZ3JhZGVTdGFydDogKGluZm8pID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhg8J+UkCBBdXRvLXVwZ3JhZGluZyB3YWxsZXQ6ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfWApO1xyXG4gICAgICAgIGNvbnN0IHN0YXR1c0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIHN0YXR1c0Rpdi5jbGFzc05hbWUgPSAnc3RhdHVzLW1lc3NhZ2UgaW5mbyc7XHJcbiAgICAgICAgc3RhdHVzRGl2LnRleHRDb250ZW50ID0gJ/CflJAgVXBncmFkaW5nIHdhbGxldCBzZWN1cml0eS4uLic7XHJcbiAgICAgICAgZXJyb3JFbC5wYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShzdGF0dXNEaXYsIGVycm9yRWwpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gc3RhdHVzRGl2LnJlbW92ZSgpLCAzMDAwKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKHVwZ3JhZGVkKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGDinIUgV2FsbGV0IHVwZ3JhZGVkOiAke2l0ZXJhdGlvbnNCZWZvcmUudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aXRlcmF0aW9uc0FmdGVyLnRvTG9jYWxlU3RyaW5nKCl9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IHNlbGVjdGVkIGdhcyBwcmljZVxyXG4gICAgY29uc3QgZ2FzUHJpY2UgPSBnZXRTZWxlY3RlZFNlbmRHYXNQcmljZSgpO1xyXG5cclxuICAgIC8vIEdldCBjdXN0b20gbm9uY2UgaWYgcHJvdmlkZWRcclxuICAgIGNvbnN0IGN1c3RvbU5vbmNlQ2hlY2tib3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXN0b20tbm9uY2UtY2hlY2tib3gnKTtcclxuICAgIGNvbnN0IGN1c3RvbU5vbmNlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXN0b20tbm9uY2UnKTtcclxuICAgIGxldCBjdXN0b21Ob25jZSA9IG51bGw7XHJcbiAgICBpZiAoY3VzdG9tTm9uY2VDaGVja2JveC5jaGVja2VkICYmIGN1c3RvbU5vbmNlSW5wdXQudmFsdWUpIHtcclxuICAgICAgY3VzdG9tTm9uY2UgPSBwYXJzZUludChjdXN0b21Ob25jZUlucHV0LnZhbHVlKTtcclxuICAgICAgaWYgKGlzTmFOKGN1c3RvbU5vbmNlKSB8fCBjdXN0b21Ob25jZSA8IDApIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY3VzdG9tIG5vbmNlJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgcHJvdmlkZXIgd2l0aCBhdXRvbWF0aWMgZmFpbG92ZXIgYW5kIGNvbm5lY3Qgc2lnbmVyXHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihjdXJyZW50U3RhdGUubmV0d29yayk7XHJcbiAgICBjb25zdCBjb25uZWN0ZWRTaWduZXIgPSBzaWduZXIuY29ubmVjdChwcm92aWRlcik7XHJcblxyXG4gICAgbGV0IHR4UmVzcG9uc2UsIHN5bWJvbDtcclxuXHJcbiAgICBpZiAoc2VsZWN0ZWRBc3NldCA9PT0gJ25hdGl2ZScpIHtcclxuICAgICAgLy8gU2VuZCBuYXRpdmUgY3VycmVuY3lcclxuICAgICAgY29uc3QgdHggPSB7XHJcbiAgICAgICAgdG86IHRvQWRkcmVzcyxcclxuICAgICAgICB2YWx1ZTogZXRoZXJzLnBhcnNlRXRoZXIoYW1vdW50KVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gQWRkIGdhcyBwcmljZSBpZiBzZWxlY3RlZFxyXG4gICAgICBpZiAoZ2FzUHJpY2UpIHtcclxuICAgICAgICB0eC5nYXNQcmljZSA9IGdhc1ByaWNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBZGQgY3VzdG9tIG5vbmNlIGlmIHByb3ZpZGVkXHJcbiAgICAgIGlmIChjdXN0b21Ob25jZSAhPT0gbnVsbCkge1xyXG4gICAgICAgIHR4Lm5vbmNlID0gY3VzdG9tTm9uY2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHR4UmVzcG9uc2UgPSBhd2FpdCBjb25uZWN0ZWRTaWduZXIuc2VuZFRyYW5zYWN0aW9uKHR4KTtcclxuICAgICAgc3ltYm9sID0gc3ltYm9sc1tjdXJyZW50U3RhdGUubmV0d29ya10gfHwgJ3Rva2Vucyc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBTZW5kIHRva2VuXHJcbiAgICAgIGNvbnN0IGFsbFRva2VucyA9IGF3YWl0IHRva2Vucy5nZXRBbGxUb2tlbnMoY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG4gICAgICBjb25zdCB0b2tlbiA9IGFsbFRva2Vucy5maW5kKHQgPT4gdC5hZGRyZXNzID09PSBzZWxlY3RlZEFzc2V0KTtcclxuXHJcbiAgICAgIGlmICghdG9rZW4pIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Rva2VuIG5vdCBmb3VuZCcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBhbW91bnRXZWkgPSBlcmMyMC5wYXJzZVRva2VuQW1vdW50KGFtb3VudCwgdG9rZW4uZGVjaW1hbHMpO1xyXG5cclxuICAgICAgLy8gRm9yIHRva2VuIHRyYW5zZmVycywgd2UgbmVlZCB0byBwYXNzIGdhcyBvcHRpb25zIHRvIHRoZSB0cmFuc2ZlciBmdW5jdGlvblxyXG4gICAgICBjb25zdCB0eE9wdGlvbnMgPSB7fTtcclxuICAgICAgaWYgKGdhc1ByaWNlKSB7XHJcbiAgICAgICAgdHhPcHRpb25zLmdhc1ByaWNlID0gZ2FzUHJpY2U7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGN1c3RvbU5vbmNlICE9PSBudWxsKSB7XHJcbiAgICAgICAgdHhPcHRpb25zLm5vbmNlID0gY3VzdG9tTm9uY2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE5vdGU6IFRoaXMgcmVxdWlyZXMgdXBkYXRpbmcgZXJjMjAudHJhbnNmZXJUb2tlbiB0byBhY2NlcHQgb3B0aW9uc1xyXG4gICAgICAvLyBGb3Igbm93LCB3ZSdsbCBzZW5kIHRoZSB0cmFuc2FjdGlvbiBtYW51YWxseVxyXG4gICAgICBjb25zdCB0b2tlbkNvbnRyYWN0ID0gbmV3IGV0aGVycy5Db250cmFjdChcclxuICAgICAgICB0b2tlbi5hZGRyZXNzLFxyXG4gICAgICAgIFsnZnVuY3Rpb24gdHJhbnNmZXIoYWRkcmVzcyB0bywgdWludDI1NiBhbW91bnQpIHJldHVybnMgKGJvb2wpJ10sXHJcbiAgICAgICAgY29ubmVjdGVkU2lnbmVyXHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0eFJlc3BvbnNlID0gYXdhaXQgdG9rZW5Db250cmFjdC50cmFuc2Zlcih0b0FkZHJlc3MsIGFtb3VudFdlaSwgdHhPcHRpb25zKTtcclxuICAgICAgc3ltYm9sID0gdG9rZW4uc3ltYm9sO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNhdmUgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeSBhbmQgc3RhcnQgbW9uaXRvcmluZ1xyXG4gICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnU0FWRV9BTkRfTU9OSVRPUl9UWCcsXHJcbiAgICAgIGFkZHJlc3M6IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLFxyXG4gICAgICB0cmFuc2FjdGlvbjoge1xyXG4gICAgICAgIGhhc2g6IHR4UmVzcG9uc2UuaGFzaCxcclxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgICAgZnJvbTogY3VycmVudFN0YXRlLmFkZHJlc3MsXHJcbiAgICAgICAgdG86IHRvQWRkcmVzcyxcclxuICAgICAgICB2YWx1ZTogc2VsZWN0ZWRBc3NldCA9PT0gJ25hdGl2ZScgPyBldGhlcnMucGFyc2VFdGhlcihhbW91bnQpLnRvU3RyaW5nKCkgOiAnMCcsXHJcbiAgICAgICAgZ2FzUHJpY2U6IGdhc1ByaWNlIHx8IChhd2FpdCB0eFJlc3BvbnNlLnByb3ZpZGVyLmdldEZlZURhdGEoKSkuZ2FzUHJpY2UudG9TdHJpbmcoKSxcclxuICAgICAgICBub25jZTogdHhSZXNwb25zZS5ub25jZSxcclxuICAgICAgICBuZXR3b3JrOiBjdXJyZW50U3RhdGUubmV0d29yayxcclxuICAgICAgICBzdGF0dXM6ICdwZW5kaW5nJyxcclxuICAgICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgICB0eXBlOiBzZWxlY3RlZEFzc2V0ID09PSAnbmF0aXZlJyA/ICdzZW5kJyA6ICd0b2tlbidcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2VuZCBkZXNrdG9wIG5vdGlmaWNhdGlvblxyXG4gICAgaWYgKGNocm9tZS5ub3RpZmljYXRpb25zKSB7XHJcbiAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIFNlbnQnLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBTZW5kaW5nICR7YW1vdW50fSAke3N5bWJvbH0gdG8gJHt0b0FkZHJlc3Muc2xpY2UoMCwgMTApfS4uLmAsXHJcbiAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2hvdyB0cmFuc2FjdGlvbiBzdGF0dXMgc2NyZWVuXHJcbiAgICBhd2FpdCBzaG93U2VuZFRyYW5zYWN0aW9uU3RhdHVzKHR4UmVzcG9uc2UuaGFzaCwgY3VycmVudFN0YXRlLm5ldHdvcmssIGFtb3VudCwgc3ltYm9sKTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ1NlbmQgdHJhbnNhY3Rpb24gZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ2luY29ycmVjdCBwYXNzd29yZCcpXHJcbiAgICAgID8gJ0luY29ycmVjdCBwYXNzd29yZCdcclxuICAgICAgOiAnVHJhbnNhY3Rpb24gZmFpbGVkOiAnICsgZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcblxyXG4gICAgLy8gUmUtZW5hYmxlIHNlbmQgYnV0dG9uIG9uIGVycm9yXHJcbiAgICBjb25zdCBzZW5kQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb25maXJtLXNlbmQnKTtcclxuICAgIHNlbmRCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIHNlbmRCdG4uc3R5bGUub3BhY2l0eSA9ICcxJztcclxuICAgIHNlbmRCdG4uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2hvd1RyYW5zYWN0aW9uU3VjY2Vzc01vZGFsKHR4SGFzaCkge1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1zdWNjZXNzLWhhc2gnKS50ZXh0Q29udGVudCA9IHR4SGFzaDtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtdHgtc3VjY2VzcycpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiB3YWl0Rm9yVHJhbnNhY3Rpb25Db25maXJtYXRpb24odHhIYXNoLCBhbW91bnQsIHN5bWJvbCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihjdXJyZW50U3RhdGUubmV0d29yayk7XHJcblxyXG4gICAgLy8gV2FpdCBmb3IgdHJhbnNhY3Rpb24gdG8gYmUgbWluZWQgKDEgY29uZmlybWF0aW9uKVxyXG4gICAgY29uc3QgcmVjZWlwdCA9IGF3YWl0IHByb3ZpZGVyLndhaXRGb3JUcmFuc2FjdGlvbih0eEhhc2gsIDEpO1xyXG5cclxuICAgIGlmIChyZWNlaXB0ICYmIHJlY2VpcHQuc3RhdHVzID09PSAxKSB7XHJcbiAgICAgIC8vIFRyYW5zYWN0aW9uIGNvbmZpcm1lZCBzdWNjZXNzZnVsbHlcclxuICAgICAgaWYgKGNocm9tZS5ub3RpZmljYXRpb25zKSB7XHJcbiAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gQ29uZmlybWVkJyxcclxuICAgICAgICAgIG1lc3NhZ2U6IGAke2Ftb3VudH0gJHtzeW1ib2x9IHRyYW5zZmVyIGNvbmZpcm1lZCBvbi1jaGFpbiFgLFxyXG4gICAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQXV0by1yZWZyZXNoIGJhbGFuY2VcclxuICAgICAgYXdhaXQgZmV0Y2hCYWxhbmNlKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBUcmFuc2FjdGlvbiBmYWlsZWRcclxuICAgICAgaWYgKGNocm9tZS5ub3RpZmljYXRpb25zKSB7XHJcbiAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gRmFpbGVkJyxcclxuICAgICAgICAgIG1lc3NhZ2U6ICdUcmFuc2FjdGlvbiB3YXMgcmV2ZXJ0ZWQgb3IgZmFpbGVkIG9uLWNoYWluJyxcclxuICAgICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3Igd2FpdGluZyBmb3IgY29uZmlybWF0aW9uOicsIGVycm9yKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IFJFQ0VJVkUgPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gc2hvd1JlY2VpdmVTY3JlZW4oKSB7XHJcbiAgY29uc3QgYWRkcmVzcyA9IGN1cnJlbnRTdGF0ZS5hZGRyZXNzO1xyXG5cclxuICAvLyBVcGRhdGUgYWRkcmVzcyBkaXNwbGF5XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlY2VpdmUtYWRkcmVzcycpLnRleHRDb250ZW50ID0gYWRkcmVzcztcclxuXHJcbiAgLy8gVXBkYXRlIG5ldHdvcmsgaW5mb1xyXG4gIGNvbnN0IG5ldHdvcmtOYW1lcyA9IHtcclxuICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICdQdWxzZUNoYWluIFRlc3RuZXQgVjQnLFxyXG4gICAgJ3B1bHNlY2hhaW4nOiAnUHVsc2VDaGFpbiBNYWlubmV0JyxcclxuICAgICdldGhlcmV1bSc6ICdFdGhlcmV1bSBNYWlubmV0JyxcclxuICAgICdzZXBvbGlhJzogJ1NlcG9saWEgVGVzdG5ldCdcclxuICB9O1xyXG4gIGNvbnN0IHN5bWJvbHMgPSB7XHJcbiAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAndFBMUycsXHJcbiAgICAncHVsc2VjaGFpbic6ICdQTFMnLFxyXG4gICAgJ2V0aGVyZXVtJzogJ0VUSCcsXHJcbiAgICAnc2Vwb2xpYSc6ICdTRVAnXHJcbiAgfTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVjZWl2ZS1uZXR3b3JrLW5hbWUnKS50ZXh0Q29udGVudCA9IG5ldHdvcmtOYW1lc1tjdXJyZW50U3RhdGUubmV0d29ya10gfHwgJ1Vua25vd24gTmV0d29yayc7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlY2VpdmUtbmV0d29yay1zeW1ib2wnKS50ZXh0Q29udGVudCA9IHN5bWJvbHNbY3VycmVudFN0YXRlLm5ldHdvcmtdIHx8ICdUT0tFTic7XHJcblxyXG4gIC8vIEdlbmVyYXRlIFFSIGNvZGVcclxuICB0cnkge1xyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlY2VpdmUtcXItY2FudmFzJyk7XHJcbiAgICBhd2FpdCBRUkNvZGUudG9DYW52YXMoY2FudmFzLCBhZGRyZXNzLCB7XHJcbiAgICAgIHdpZHRoOiAyMDAsXHJcbiAgICAgIG1hcmdpbjogMixcclxuICAgICAgY29sb3I6IHtcclxuICAgICAgICBkYXJrOiBnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmJvZHkpLmdldFByb3BlcnR5VmFsdWUoJy0tdGVybWluYWwtZmcnKS50cmltKCksXHJcbiAgICAgICAgbGlnaHQ6IGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuYm9keSkuZ2V0UHJvcGVydHlWYWx1ZSgnLS10ZXJtaW5hbC1iZycpLnRyaW0oKVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2VuZXJhdGluZyBRUiBjb2RlOicsIGVycm9yKTtcclxuICB9XHJcblxyXG4gIHNob3dTY3JlZW4oJ3NjcmVlbi1yZWNlaXZlJyk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNvcHlSZWNlaXZlQWRkcmVzcygpIHtcclxuICB0cnkge1xyXG4gICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jb3B5LXJlY2VpdmUtYWRkcmVzcycpO1xyXG4gICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gYnRuLnRleHRDb250ZW50O1xyXG4gICAgYnRuLnRleHRDb250ZW50ID0gJ0NPUElFRCEnO1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGJ0bi50ZXh0Q29udGVudCA9IG9yaWdpbmFsVGV4dDtcclxuICAgIH0sIDIwMDApO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBhbGVydCgnRmFpbGVkIHRvIGNvcHkgYWRkcmVzcycpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gVE9LRU5TID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIHNob3dUb2tlbnNTY3JlZW4oKSB7XHJcbiAgLy8gU3dpdGNoIHRvIHNjcmVlbiBmaXJzdCBzbyB1c2VyIHNlZXMgbG9hZGluZyBpbmRpY2F0b3JcclxuICBzaG93U2NyZWVuKCdzY3JlZW4tdG9rZW5zJyk7XHJcblxyXG4gIC8vIFNtYWxsIGRlbGF5IHRvIGVuc3VyZSBzY3JlZW4gaXMgdmlzaWJsZSBiZWZvcmUgc3RhcnRpbmcgcmVuZGVyXHJcbiAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDEwKSk7XHJcblxyXG4gIC8vIE5vdyByZW5kZXIgdG9rZW5zIChsb2FkaW5nIGluZGljYXRvciB3aWxsIGJlIHZpc2libGUpXHJcbiAgYXdhaXQgcmVuZGVyVG9rZW5zU2NyZWVuKCk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlbmRlclRva2Vuc1NjcmVlbigpIHtcclxuICBjb25zdCBuZXR3b3JrID0gY3VycmVudFN0YXRlLm5ldHdvcms7XHJcblxyXG4gIC8vIFNob3cgbG9hZGluZywgaGlkZSBwYW5lbHNcclxuICBjb25zdCBsb2FkaW5nRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW5zLWxvYWRpbmcnKTtcclxuICBjb25zdCBkZWZhdWx0UGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGVmYXVsdC10b2tlbnMtcGFuZWwnKTtcclxuICBjb25zdCBjdXN0b21QYW5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdXN0b20tdG9rZW5zLXBhbmVsJyk7XHJcblxyXG4gIGlmIChsb2FkaW5nRWwpIGxvYWRpbmdFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICBpZiAoZGVmYXVsdFBhbmVsKSBkZWZhdWx0UGFuZWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgaWYgKGN1c3RvbVBhbmVsKSBjdXN0b21QYW5lbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFJlbmRlciBkZWZhdWx0IHRva2Vuc1xyXG4gICAgYXdhaXQgcmVuZGVyRGVmYXVsdFRva2VucyhuZXR3b3JrKTtcclxuXHJcbiAgICAvLyBSZW5kZXIgY3VzdG9tIHRva2Vuc1xyXG4gICAgYXdhaXQgcmVuZGVyQ3VzdG9tVG9rZW5zKG5ldHdvcmspO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICAvLyBIaWRlIGxvYWRpbmcsIHNob3cgcGFuZWxzXHJcbiAgICBpZiAobG9hZGluZ0VsKSBsb2FkaW5nRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBpZiAoZGVmYXVsdFBhbmVsKSBkZWZhdWx0UGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICBpZiAoY3VzdG9tUGFuZWwpIGN1c3RvbVBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcmVuZGVyRGVmYXVsdFRva2VucyhuZXR3b3JrKSB7XHJcbiAgY29uc3QgZGVmYXVsdFRva2Vuc0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlZmF1bHQtdG9rZW5zLWxpc3QnKTtcclxuICBjb25zdCBuZXR3b3JrRGVmYXVsdHMgPSB0b2tlbnMuREVGQVVMVF9UT0tFTlNbbmV0d29ya10gfHwge307XHJcbiAgY29uc3QgZW5hYmxlZERlZmF1bHRzID0gYXdhaXQgdG9rZW5zLmdldEVuYWJsZWREZWZhdWx0VG9rZW5zKG5ldHdvcmspO1xyXG5cclxuICBpZiAoT2JqZWN0LmtleXMobmV0d29ya0RlZmF1bHRzKS5sZW5ndGggPT09IDApIHtcclxuICAgIGRlZmF1bHRUb2tlbnNFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBwYWRkaW5nOiAxNnB4O1wiPk5vIGRlZmF1bHQgdG9rZW5zIGZvciB0aGlzIG5ldHdvcms8L3A+JztcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGxldCBodG1sID0gJyc7XHJcbiAgZm9yIChjb25zdCBzeW1ib2wgaW4gbmV0d29ya0RlZmF1bHRzKSB7XHJcbiAgICBjb25zdCB0b2tlbiA9IG5ldHdvcmtEZWZhdWx0c1tzeW1ib2xdO1xyXG4gICAgY29uc3QgaXNFbmFibGVkID0gZW5hYmxlZERlZmF1bHRzLmluY2x1ZGVzKHN5bWJvbCk7XHJcblxyXG4gICAgLy8gRmV0Y2ggYmFsYW5jZSBpZiBlbmFibGVkXHJcbiAgICBsZXQgYmFsYW5jZVRleHQgPSAnLSc7XHJcbiAgICBsZXQgYmFsYW5jZVRvb2x0aXAgPSAnJztcclxuICAgIGxldCB1c2RWYWx1ZSA9IG51bGw7XHJcbiAgICBpZiAoaXNFbmFibGVkICYmIGN1cnJlbnRTdGF0ZS5hZGRyZXNzKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgYmFsYW5jZVdlaSA9IGF3YWl0IGVyYzIwLmdldFRva2VuQmFsYW5jZShuZXR3b3JrLCB0b2tlbi5hZGRyZXNzLCBjdXJyZW50U3RhdGUuYWRkcmVzcyk7XHJcbiAgICAgICAgY29uc3QgcmF3QmFsYW5jZSA9IGVyYzIwLmZvcm1hdFRva2VuQmFsYW5jZShiYWxhbmNlV2VpLCB0b2tlbi5kZWNpbWFscywgNCk7XHJcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkID0gZm9ybWF0QmFsYW5jZVdpdGhDb21tYXMocmF3QmFsYW5jZSwgdG9rZW4uZGVjaW1hbHMpO1xyXG4gICAgICAgIGJhbGFuY2VUZXh0ID0gZm9ybWF0dGVkLmRpc3BsYXk7XHJcbiAgICAgICAgYmFsYW5jZVRvb2x0aXAgPSBmb3JtYXR0ZWQudG9vbHRpcDtcclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIFVTRCB2YWx1ZSBpZiBwcmljZXMgYXZhaWxhYmxlXHJcbiAgICAgICAgaWYgKGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcykge1xyXG4gICAgICAgICAgdXNkVmFsdWUgPSBnZXRUb2tlblZhbHVlVVNEKHN5bWJvbCwgYmFsYW5jZVdlaSwgdG9rZW4uZGVjaW1hbHMsIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGJhbGFuY2VUZXh0ID0gJ0Vycm9yJztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxvZ29VcmwgPSB0b2tlbi5sb2dvID8gY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBhc3NldHMvbG9nb3MvJHt0b2tlbi5sb2dvfWApIDogJyc7XHJcblxyXG4gICAgaHRtbCArPSBgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJ0b2tlbi1pdGVtXCIgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IHBhZGRpbmc6IDEycHggOHB4OyBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tdGVybWluYWwtYm9yZGVyKTtcIj5cclxuICAgICAgICAke3Rva2VuLmxvZ28gP1xyXG4gICAgICAgICAgKHRva2VuLmhvbWVVcmwgP1xyXG4gICAgICAgICAgICBgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgYWx0PVwiJHtlc2NhcGVIdG1sKHRva2VuLnN5bWJvbCl9XCIgc3R5bGU9XCJ3aWR0aDogMzJweDsgaGVpZ2h0OiAzMnB4OyBtYXJnaW4tcmlnaHQ6IDEycHg7IGJvcmRlci1yYWRpdXM6IDUwJTsgY3Vyc29yOiBwb2ludGVyO1wiIGNsYXNzPVwidG9rZW4tbG9nby1saW5rXCIgZGF0YS11cmw9XCIke3Rva2VuLmhvbWVVcmx9XCIgdGl0bGU9XCJWaXNpdCAke2VzY2FwZUh0bWwodG9rZW4ubmFtZSl9IGhvbWVwYWdlXCIgLz5gIDpcclxuICAgICAgICAgICAgYDxpbWcgc3JjPVwiJHtsb2dvVXJsfVwiIGFsdD1cIiR7ZXNjYXBlSHRtbCh0b2tlbi5zeW1ib2wpfVwiIHN0eWxlPVwid2lkdGg6IDMycHg7IGhlaWdodDogMzJweDsgbWFyZ2luLXJpZ2h0OiAxMnB4OyBib3JkZXItcmFkaXVzOiA1MCU7XCIgLz5gKSA6XHJcbiAgICAgICAgICAnPGRpdiBzdHlsZT1cIndpZHRoOiAzMnB4OyBoZWlnaHQ6IDMycHg7IG1hcmdpbi1yaWdodDogMTJweDsgYmFja2dyb3VuZDogdmFyKC0tdGVybWluYWwtYm9yZGVyKTsgYm9yZGVyLXJhZGl1czogNTAlO1wiPjwvZGl2Pid9XHJcbiAgICAgICAgPGRpdiBzdHlsZT1cImZsZXg6IDE7XCI+XHJcbiAgICAgICAgICA8cCBzdHlsZT1cImZvbnQtc2l6ZTogMTVweDsgZm9udC13ZWlnaHQ6IGJvbGQ7XCI+JHtlc2NhcGVIdG1sKHRva2VuLnN5bWJvbCl9PC9wPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LWRpbSAke3Rva2VuLmRleFNjcmVlbmVyVXJsID8gJ3Rva2VuLW5hbWUtbGluaycgOiAnJ31cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTNweDsgJHt0b2tlbi5kZXhTY3JlZW5lclVybCA/ICdjdXJzb3I6IHBvaW50ZXI7IHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOycgOiAnJ31cIiAke3Rva2VuLmRleFNjcmVlbmVyVXJsID8gYGRhdGEtdXJsPVwiJHt0b2tlbi5kZXhTY3JlZW5lclVybH1cIiB0aXRsZT1cIlZpZXcgJHtlc2NhcGVIdG1sKHRva2VuLm5hbWUpfSBvbiBEZXhTY3JlZW5lclwiYCA6ICcnfT4ke2VzY2FwZUh0bWwodG9rZW4ubmFtZSl9PC9wPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBmb250LWZhbWlseTogdmFyKC0tZm9udC1tb25vKTsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiA0cHg7XCI+XHJcbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwibWF4LXdpZHRoOiA4MHB4OyBvdmVyZmxvdzogaGlkZGVuOyB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcIj4ke3Rva2VuLmFkZHJlc3N9PC9zcGFuPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiY29weS1hZGRyZXNzLWJ0blwiIGRhdGEtYWRkcmVzcz1cIiR7dG9rZW4uYWRkcmVzc31cIiBzdHlsZT1cImJhY2tncm91bmQ6IG5vbmU7IGJvcmRlcjogbm9uZTsgY29sb3I6IHZhcigtLXRlcm1pbmFsLWFjY2VudCk7IGN1cnNvcjogcG9pbnRlcjsgZm9udC1zaXplOiAxMXB4OyBwYWRkaW5nOiAycHggNHB4O1wiIHRpdGxlPVwiQ29weSBjb250cmFjdCBhZGRyZXNzXCI+8J+TizwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgJHtpc0VuYWJsZWQgPyBgXHJcbiAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTNweDsgY3Vyc29yOiBoZWxwO1wiIHRpdGxlPVwiJHtiYWxhbmNlVG9vbHRpcH1cIj5CYWxhbmNlOiAke2JhbGFuY2VUZXh0fTwvcD5cclxuICAgICAgICAgICAgJHt1c2RWYWx1ZSAhPT0gbnVsbCA/IGA8cCBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDEycHg7IG1hcmdpbi10b3A6IDJweDtcIj4ke2Zvcm1hdFVTRCh1c2RWYWx1ZSl9PC9wPmAgOiAnJ31cclxuICAgICAgICAgIGAgOiAnJ31cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgbWFyZ2luLWxlZnQ6IDhweDtcIj5cclxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJ2aWV3LXRva2VuLWRldGFpbHMtYnRuXCIgZGF0YS10b2tlbi1zeW1ib2w9XCIke3N5bWJvbH1cIiBkYXRhLWlzLWRlZmF1bHQ9XCJ0cnVlXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiB2YXIoLS10ZXJtaW5hbC1hY2NlbnQpOyBib3JkZXI6IG5vbmU7IGNvbG9yOiAjMDAwOyBjdXJzb3I6IHBvaW50ZXI7IGZvbnQtc2l6ZTogMThweDsgcGFkZGluZzogNHB4IDhweDsgYm9yZGVyLXJhZGl1czogNHB4O1wiIHRpdGxlPVwiVmlldyB0b2tlbiBkZXRhaWxzXCI+4oS577iPPC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuICB9XHJcblxyXG4gIGRlZmF1bHRUb2tlbnNFbC5pbm5lckhUTUwgPSBodG1sO1xyXG5cclxuICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciB2aWV3IGRldGFpbHMgYnV0dG9uc1xyXG4gIGRlZmF1bHRUb2tlbnNFbC5xdWVyeVNlbGVjdG9yQWxsKCcudmlldy10b2tlbi1kZXRhaWxzLWJ0bicpLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHN5bWJvbCA9IGUudGFyZ2V0LmRhdGFzZXQudG9rZW5TeW1ib2w7XHJcbiAgICAgIGNvbnN0IGlzRGVmYXVsdCA9IGUudGFyZ2V0LmRhdGFzZXQuaXNEZWZhdWx0ID09PSAndHJ1ZSc7XHJcbiAgICAgIHNob3dUb2tlbkRldGFpbHMoc3ltYm9sLCBpc0RlZmF1bHQpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGNvcHkgYWRkcmVzcyBidXR0b25zXHJcbiAgZGVmYXVsdFRva2Vuc0VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb3B5LWFkZHJlc3MtYnRuJykuZm9yRWFjaChidG4gPT4ge1xyXG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGUpID0+IHtcclxuICAgICAgY29uc3QgYWRkcmVzcyA9IGUudGFyZ2V0LmRhdGFzZXQuYWRkcmVzcztcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChhZGRyZXNzKTtcclxuICAgICAgICBjb25zdCBvcmlnaW5hbFRleHQgPSBlLnRhcmdldC50ZXh0Q29udGVudDtcclxuICAgICAgICBlLnRhcmdldC50ZXh0Q29udGVudCA9ICfinJMnO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgZS50YXJnZXQudGV4dENvbnRlbnQgPSBvcmlnaW5hbFRleHQ7XHJcbiAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNvcHkgYWRkcmVzczonLCBlcnJvcik7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBsb2dvIGNsaWNrcyAob3BlbiBob21lcGFnZSlcclxuICBkZWZhdWx0VG9rZW5zRWwucXVlcnlTZWxlY3RvckFsbCgnLnRva2VuLWxvZ28tbGluaycpLmZvckVhY2goaW1nID0+IHtcclxuICAgIGltZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGUudGFyZ2V0LmRhdGFzZXQudXJsO1xyXG4gICAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmwgfSk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgbmFtZSBjbGlja3MgKG9wZW4gRGV4U2NyZWVuZXIpXHJcbiAgZGVmYXVsdFRva2Vuc0VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2tlbi1uYW1lLWxpbmsnKS5mb3JFYWNoKHAgPT4ge1xyXG4gICAgcC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LnVybDtcclxuICAgICAgaWYgKHVybCkge1xyXG4gICAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybCB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlbmRlckN1c3RvbVRva2VucyhuZXR3b3JrKSB7XHJcbiAgY29uc3QgY3VzdG9tVG9rZW5zRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VzdG9tLXRva2Vucy1saXN0Jyk7XHJcbiAgY29uc3QgY3VzdG9tVG9rZW5zID0gYXdhaXQgdG9rZW5zLmdldEN1c3RvbVRva2VucyhuZXR3b3JrKTtcclxuXHJcbiAgaWYgKGN1c3RvbVRva2Vucy5sZW5ndGggPT09IDApIHtcclxuICAgIGN1c3RvbVRva2Vuc0VsLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDExcHg7IHBhZGRpbmc6IDE2cHg7XCI+Tm8gY3VzdG9tIHRva2VucyBhZGRlZDwvcD4nO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgbGV0IGh0bWwgPSAnJztcclxuICBmb3IgKGNvbnN0IHRva2VuIG9mIGN1c3RvbVRva2Vucykge1xyXG4gICAgLy8gRmV0Y2ggYmFsYW5jZVxyXG4gICAgbGV0IGJhbGFuY2VUZXh0ID0gJy0nO1xyXG4gICAgbGV0IGJhbGFuY2VUb29sdGlwID0gJyc7XHJcbiAgICBsZXQgdXNkVmFsdWUgPSBudWxsO1xyXG4gICAgaWYgKGN1cnJlbnRTdGF0ZS5hZGRyZXNzKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgYmFsYW5jZVdlaSA9IGF3YWl0IGVyYzIwLmdldFRva2VuQmFsYW5jZShuZXR3b3JrLCB0b2tlbi5hZGRyZXNzLCBjdXJyZW50U3RhdGUuYWRkcmVzcyk7XHJcbiAgICAgICAgY29uc3QgcmF3QmFsYW5jZSA9IGVyYzIwLmZvcm1hdFRva2VuQmFsYW5jZShiYWxhbmNlV2VpLCB0b2tlbi5kZWNpbWFscywgNCk7XHJcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkID0gZm9ybWF0QmFsYW5jZVdpdGhDb21tYXMocmF3QmFsYW5jZSwgdG9rZW4uZGVjaW1hbHMpO1xyXG4gICAgICAgIGJhbGFuY2VUZXh0ID0gZm9ybWF0dGVkLmRpc3BsYXk7XHJcbiAgICAgICAgYmFsYW5jZVRvb2x0aXAgPSBmb3JtYXR0ZWQudG9vbHRpcDtcclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIFVTRCB2YWx1ZSBpZiBwcmljZXMgYXZhaWxhYmxlIGFuZCB0b2tlbiBpcyBrbm93blxyXG4gICAgICAgIGlmIChjdXJyZW50U3RhdGUudG9rZW5QcmljZXMpIHtcclxuICAgICAgICAgIHVzZFZhbHVlID0gZ2V0VG9rZW5WYWx1ZVVTRCh0b2tlbi5zeW1ib2wsIGJhbGFuY2VXZWksIHRva2VuLmRlY2ltYWxzLCBjdXJyZW50U3RhdGUudG9rZW5QcmljZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBiYWxhbmNlVGV4dCA9ICdFcnJvcic7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsb2dvVXJsID0gdG9rZW4ubG9nbyA/IGNocm9tZS5ydW50aW1lLmdldFVSTChgYXNzZXRzL2xvZ29zLyR7dG9rZW4ubG9nb31gKSA6ICcnO1xyXG5cclxuICAgIGh0bWwgKz0gYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwidG9rZW4taXRlbVwiIHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBwYWRkaW5nOiAxMnB4IDhweDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRlcm1pbmFsLWJvcmRlcik7XCI+XHJcbiAgICAgICAgJHt0b2tlbi5sb2dvID9cclxuICAgICAgICAgICh0b2tlbi5ob21lVXJsID9cclxuICAgICAgICAgICAgYDxpbWcgc3JjPVwiJHtsb2dvVXJsfVwiIGFsdD1cIiR7ZXNjYXBlSHRtbCh0b2tlbi5zeW1ib2wpfVwiIHN0eWxlPVwid2lkdGg6IDMycHg7IGhlaWdodDogMzJweDsgbWFyZ2luLXJpZ2h0OiAxMnB4OyBib3JkZXItcmFkaXVzOiA1MCU7IGN1cnNvcjogcG9pbnRlcjtcIiBjbGFzcz1cInRva2VuLWxvZ28tbGlua1wiIGRhdGEtdXJsPVwiJHt0b2tlbi5ob21lVXJsfVwiIHRpdGxlPVwiVmlzaXQgJHtlc2NhcGVIdG1sKHRva2VuLm5hbWUpfSBob21lcGFnZVwiIC8+YCA6XHJcbiAgICAgICAgICAgIGA8aW1nIHNyYz1cIiR7bG9nb1VybH1cIiBhbHQ9XCIke2VzY2FwZUh0bWwodG9rZW4uc3ltYm9sKX1cIiBzdHlsZT1cIndpZHRoOiAzMnB4OyBoZWlnaHQ6IDMycHg7IG1hcmdpbi1yaWdodDogMTJweDsgYm9yZGVyLXJhZGl1czogNTAlO1wiIC8+YCkgOlxyXG4gICAgICAgICAgJzxkaXYgc3R5bGU9XCJ3aWR0aDogMzJweDsgaGVpZ2h0OiAzMnB4OyBtYXJnaW4tcmlnaHQ6IDEycHg7IGJhY2tncm91bmQ6IHZhcigtLXRlcm1pbmFsLWJvcmRlcik7IGJvcmRlci1yYWRpdXM6IDUwJTtcIj48L2Rpdj4nfVxyXG4gICAgICAgIDxkaXYgc3R5bGU9XCJmbGV4OiAxO1wiPlxyXG4gICAgICAgICAgPHAgc3R5bGU9XCJmb250LXNpemU6IDE1cHg7IGZvbnQtd2VpZ2h0OiBib2xkO1wiPiR7ZXNjYXBlSHRtbCh0b2tlbi5zeW1ib2wpfTwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW0gJHt0b2tlbi5kZXhTY3JlZW5lclVybCA/ICd0b2tlbi1uYW1lLWxpbmsnIDogJyd9XCIgc3R5bGU9XCJmb250LXNpemU6IDEzcHg7ICR7dG9rZW4uZGV4U2NyZWVuZXJVcmwgPyAnY3Vyc29yOiBwb2ludGVyOyB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsnIDogJyd9XCIgJHt0b2tlbi5kZXhTY3JlZW5lclVybCA/IGBkYXRhLXVybD1cIiR7dG9rZW4uZGV4U2NyZWVuZXJVcmx9XCIgdGl0bGU9XCJWaWV3ICR7ZXNjYXBlSHRtbCh0b2tlbi5uYW1lKX0gb24gRGV4U2NyZWVuZXJcImAgOiAnJ30+JHtlc2NhcGVIdG1sKHRva2VuLm5hbWUpfTwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDsgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtbW9ubyk7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogNHB4O1wiPlxyXG4gICAgICAgICAgICA8c3BhbiBzdHlsZT1cIm1heC13aWR0aDogODBweDsgb3ZlcmZsb3c6IGhpZGRlbjsgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XCI+JHt0b2tlbi5hZGRyZXNzfTwvc3Bhbj5cclxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImNvcHktYWRkcmVzcy1idG5cIiBkYXRhLWFkZHJlc3M9XCIke3Rva2VuLmFkZHJlc3N9XCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiBub25lOyBib3JkZXI6IG5vbmU7IGNvbG9yOiB2YXIoLS10ZXJtaW5hbC1hY2NlbnQpOyBjdXJzb3I6IHBvaW50ZXI7IGZvbnQtc2l6ZTogMTFweDsgcGFkZGluZzogMnB4IDRweDtcIiB0aXRsZT1cIkNvcHkgY29udHJhY3QgYWRkcmVzc1wiPvCfk4s8L2J1dHRvbj5cclxuICAgICAgICAgIDwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTNweDsgY3Vyc29yOiBoZWxwO1wiIHRpdGxlPVwiJHtiYWxhbmNlVG9vbHRpcH1cIj5CYWxhbmNlOiAke2JhbGFuY2VUZXh0fTwvcD5cclxuICAgICAgICAgICR7dXNkVmFsdWUgIT09IG51bGwgPyBgPHAgY2xhc3M9XCJ0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMnB4OyBtYXJnaW4tdG9wOiAycHg7XCI+JHtmb3JtYXRVU0QodXNkVmFsdWUpfTwvcD5gIDogJyd9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IGdhcDogNnB4OyBhbGlnbi1pdGVtczogY2VudGVyOyBtYXJnaW4tbGVmdDogOHB4OyBtaW4td2lkdGg6IDgwcHg7XCI+XHJcbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwidmlldy10b2tlbi1kZXRhaWxzLWJ0blwiIGRhdGEtdG9rZW4tc3ltYm9sPVwiJHt0b2tlbi5zeW1ib2x9XCIgZGF0YS1pcy1kZWZhdWx0PVwiZmFsc2VcIiBkYXRhLXRva2VuLWFkZHJlc3M9XCIke3Rva2VuLmFkZHJlc3N9XCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiB2YXIoLS10ZXJtaW5hbC1hY2NlbnQpOyBib3JkZXI6IG5vbmU7IGNvbG9yOiAjMDAwOyBjdXJzb3I6IHBvaW50ZXI7IGZvbnQtc2l6ZTogMThweDsgcGFkZGluZzogNHB4IDhweDsgYm9yZGVyLXJhZGl1czogNHB4O1wiIHRpdGxlPVwiVmlldyB0b2tlbiBkZXRhaWxzXCI+4oS577iPPC9idXR0b24+XHJcbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuLWRhbmdlciBidG4tc21hbGwgcmVtb3ZlLXRva2VuLWJ0blwiIGRhdGEtdG9rZW4tYWRkcmVzcz1cIiR7dG9rZW4uYWRkcmVzc31cIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBmb250LXNpemU6IDlweDsgcGFkZGluZzogMnB4IDRweDtcIj5SRU1PVkU8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG4gIH1cclxuXHJcbiAgY3VzdG9tVG9rZW5zRWwuaW5uZXJIVE1MID0gaHRtbDtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgdmlldyBkZXRhaWxzIGJ1dHRvbnNcclxuICBjdXN0b21Ub2tlbnNFbC5xdWVyeVNlbGVjdG9yQWxsKCcudmlldy10b2tlbi1kZXRhaWxzLWJ0bicpLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHN5bWJvbCA9IGUudGFyZ2V0LmRhdGFzZXQudG9rZW5TeW1ib2w7XHJcbiAgICAgIGNvbnN0IGlzRGVmYXVsdCA9IGUudGFyZ2V0LmRhdGFzZXQuaXNEZWZhdWx0ID09PSAndHJ1ZSc7XHJcbiAgICAgIGNvbnN0IGFkZHJlc3MgPSBlLnRhcmdldC5kYXRhc2V0LnRva2VuQWRkcmVzcztcclxuICAgICAgc2hvd1Rva2VuRGV0YWlscyhzeW1ib2wsIGlzRGVmYXVsdCwgYWRkcmVzcyk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgcmVtb3ZlIGJ1dHRvbnNcclxuICBjdXN0b21Ub2tlbnNFbC5xdWVyeVNlbGVjdG9yQWxsKCcucmVtb3ZlLXRva2VuLWJ0bicpLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFkZHJlc3MgPSBlLnRhcmdldC5kYXRhc2V0LnRva2VuQWRkcmVzcztcclxuICAgICAgaWYgKGNvbmZpcm0oJ1JlbW92ZSB0aGlzIHRva2VuIGZyb20geW91ciBsaXN0PycpKSB7XHJcbiAgICAgICAgYXdhaXQgdG9rZW5zLnJlbW92ZUN1c3RvbVRva2VuKG5ldHdvcmssIGFkZHJlc3MpO1xyXG4gICAgICAgIGF3YWl0IHJlbmRlclRva2Vuc1NjcmVlbigpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgY29weSBhZGRyZXNzIGJ1dHRvbnNcclxuICBjdXN0b21Ub2tlbnNFbC5xdWVyeVNlbGVjdG9yQWxsKCcuY29weS1hZGRyZXNzLWJ0bicpLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFkZHJlc3MgPSBlLnRhcmdldC5kYXRhc2V0LmFkZHJlc3M7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoYWRkcmVzcyk7XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gZS50YXJnZXQudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgZS50YXJnZXQudGV4dENvbnRlbnQgPSAn4pyTJztcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIGUudGFyZ2V0LnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0O1xyXG4gICAgICAgIH0sIDEwMDApO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjb3B5IGFkZHJlc3M6JywgZXJyb3IpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgbG9nbyBjbGlja3MgKG9wZW4gaG9tZXBhZ2UpXHJcbiAgY3VzdG9tVG9rZW5zRWwucXVlcnlTZWxlY3RvckFsbCgnLnRva2VuLWxvZ28tbGluaycpLmZvckVhY2goaW1nID0+IHtcclxuICAgIGltZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGUudGFyZ2V0LmRhdGFzZXQudXJsO1xyXG4gICAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmwgfSk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgbmFtZSBjbGlja3MgKG9wZW4gRGV4U2NyZWVuZXIpXHJcbiAgY3VzdG9tVG9rZW5zRWwucXVlcnlTZWxlY3RvckFsbCgnLnRva2VuLW5hbWUtbGluaycpLmZvckVhY2gocCA9PiB7XHJcbiAgICBwLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICAgICAgY29uc3QgdXJsID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudXJsO1xyXG4gICAgICBpZiAodXJsKSB7XHJcbiAgICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gPT09PT0gVE9LRU4gREVUQUlMUyBTQ1JFRU4gPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gc2hvd1Rva2VuRGV0YWlscyhzeW1ib2wsIGlzRGVmYXVsdCwgY3VzdG9tQWRkcmVzcyA9IG51bGwpIHtcclxuICBjb25zdCBuZXR3b3JrID0gY3VycmVudFN0YXRlLm5ldHdvcms7XHJcblxyXG4gIC8vIEdldCB0b2tlbiBkYXRhXHJcbiAgbGV0IHRva2VuRGF0YTtcclxuICBpZiAoaXNEZWZhdWx0KSB7XHJcbiAgICB0b2tlbkRhdGEgPSB0b2tlbnMuREVGQVVMVF9UT0tFTlNbbmV0d29ya11bc3ltYm9sXTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gRmluZCBpbiBjdXN0b20gdG9rZW5zXHJcbiAgICBjb25zdCBjdXN0b21Ub2tlbnMgPSBhd2FpdCB0b2tlbnMuZ2V0Q3VzdG9tVG9rZW5zKG5ldHdvcmspO1xyXG4gICAgdG9rZW5EYXRhID0gY3VzdG9tVG9rZW5zLmZpbmQodCA9PiB0LmFkZHJlc3MudG9Mb3dlckNhc2UoKSA9PT0gY3VzdG9tQWRkcmVzcy50b0xvd2VyQ2FzZSgpKTtcclxuICB9XHJcblxyXG4gIGlmICghdG9rZW5EYXRhKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdUb2tlbiBub3QgZm91bmQ6Jywgc3ltYm9sKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIFN0b3JlIGN1cnJlbnQgdG9rZW4gaW4gc3RhdGVcclxuICBjdXJyZW50U3RhdGUuY3VycmVudFRva2VuRGV0YWlscyA9IHtcclxuICAgIC4uLnRva2VuRGF0YSxcclxuICAgIHN5bWJvbCxcclxuICAgIGlzRGVmYXVsdFxyXG4gIH07XHJcblxyXG4gIC8vIFVwZGF0ZSB0aXRsZVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXRpdGxlJykudGV4dENvbnRlbnQgPSBzeW1ib2wudG9VcHBlckNhc2UoKTtcclxuXHJcbiAgLy8gVXBkYXRlIHRva2VuIGluZm9cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1uYW1lJykudGV4dENvbnRlbnQgPSB0b2tlbkRhdGEubmFtZTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1zeW1ib2wnKS50ZXh0Q29udGVudCA9IHN5bWJvbDtcclxuXHJcbiAgLy8gVXBkYXRlIGxvZ29cclxuICBjb25zdCBsb2dvQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtbG9nby1jb250YWluZXInKTtcclxuICBpZiAodG9rZW5EYXRhLmxvZ28pIHtcclxuICAgIGNvbnN0IGxvZ29VcmwgPSBjaHJvbWUucnVudGltZS5nZXRVUkwoYGFzc2V0cy9sb2dvcy8ke3Rva2VuRGF0YS5sb2dvfWApO1xyXG4gICAgbG9nb0NvbnRhaW5lci5pbm5lckhUTUwgPSBgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgYWx0PVwiJHtzeW1ib2x9XCIgc3R5bGU9XCJ3aWR0aDogNDhweDsgaGVpZ2h0OiA0OHB4OyBib3JkZXItcmFkaXVzOiA1MCU7XCIgLz5gO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsb2dvQ29udGFpbmVyLmlubmVySFRNTCA9ICc8ZGl2IHN0eWxlPVwid2lkdGg6IDQ4cHg7IGhlaWdodDogNDhweDsgYmFja2dyb3VuZDogdmFyKC0tdGVybWluYWwtYm9yZGVyKTsgYm9yZGVyLXJhZGl1czogNTAlO1wiPjwvZGl2Pic7XHJcbiAgfVxyXG5cclxuICAvLyBGZXRjaCBhbmQgdXBkYXRlIGJhbGFuY2VcclxuICB0cnkge1xyXG4gICAgY29uc3QgYmFsYW5jZVdlaSA9IGF3YWl0IGVyYzIwLmdldFRva2VuQmFsYW5jZShuZXR3b3JrLCB0b2tlbkRhdGEuYWRkcmVzcywgY3VycmVudFN0YXRlLmFkZHJlc3MpO1xyXG4gICAgY29uc3QgYmFsYW5jZUZvcm1hdHRlZCA9IGVyYzIwLmZvcm1hdFRva2VuQmFsYW5jZShiYWxhbmNlV2VpLCB0b2tlbkRhdGEuZGVjaW1hbHMsIDgpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtYmFsYW5jZScpLnRleHRDb250ZW50ID0gYmFsYW5jZUZvcm1hdHRlZDtcclxuXHJcbiAgICAvLyBVcGRhdGUgVVNEIHZhbHVlXHJcbiAgICBpZiAoY3VycmVudFN0YXRlLnRva2VuUHJpY2VzICYmIGN1cnJlbnRTdGF0ZS50b2tlblByaWNlc1tzeW1ib2xdKSB7XHJcbiAgICAgIGNvbnN0IHVzZFZhbHVlID0gZ2V0VG9rZW5WYWx1ZVVTRChzeW1ib2wsIGJhbGFuY2VXZWksIHRva2VuRGF0YS5kZWNpbWFscywgY3VycmVudFN0YXRlLnRva2VuUHJpY2VzKTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtYmFsYW5jZS11c2QnKS50ZXh0Q29udGVudCA9IGZvcm1hdFVTRCh1c2RWYWx1ZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1iYWxhbmNlLXVzZCcpLnRleHRDb250ZW50ID0gJ+KAlCc7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHRva2VuIGJhbGFuY2U6JywgZXJyb3IpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtYmFsYW5jZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWJhbGFuY2UtdXNkJykudGV4dENvbnRlbnQgPSAn4oCUJztcclxuICB9XHJcblxyXG4gIC8vIFVwZGF0ZSBwcmljZVxyXG4gIGlmIChjdXJyZW50U3RhdGUudG9rZW5QcmljZXMgJiYgY3VycmVudFN0YXRlLnRva2VuUHJpY2VzW3N5bWJvbF0pIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXByaWNlJykudGV4dENvbnRlbnQgPSBmb3JtYXRVU0QoY3VycmVudFN0YXRlLnRva2VuUHJpY2VzW3N5bWJvbF0pO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1wcmljZScpLnRleHRDb250ZW50ID0gJ+KAlCc7XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGUgbGlua3NcclxuICBjb25zdCBob21lTGluayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWhvbWUtbGluaycpO1xyXG4gIGlmICh0b2tlbkRhdGEuaG9tZVVybCkge1xyXG4gICAgaG9tZUxpbmsuaHJlZiA9IHRva2VuRGF0YS5ob21lVXJsO1xyXG4gICAgaG9tZUxpbmsuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGhvbWVMaW5rLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZGV4TGluayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWRleC1saW5rJyk7XHJcbiAgaWYgKHRva2VuRGF0YS5kZXhTY3JlZW5lclVybCkge1xyXG4gICAgZGV4TGluay5ocmVmID0gdG9rZW5EYXRhLmRleFNjcmVlbmVyVXJsO1xyXG4gICAgZGV4TGluay5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9IGVsc2Uge1xyXG4gICAgZGV4TGluay5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9XHJcblxyXG4gIC8vIFNvdXJjaWZ5IGxpbmtcclxuICBjb25zdCBjaGFpbklkID0gbmV0d29yayA9PT0gJ3B1bHNlY2hhaW4nID8gMzY5IDogbmV0d29yayA9PT0gJ3B1bHNlY2hhaW5UZXN0bmV0JyA/IDk0MyA6IDE7XHJcbiAgY29uc3Qgc291cmNpZnlMaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtc291cmNpZnktbGluaycpO1xyXG4gIHNvdXJjaWZ5TGluay5ocmVmID0gYGh0dHBzOi8vcmVwby5zb3VyY2lmeS5kZXYvJHtjaGFpbklkfS8ke3Rva2VuRGF0YS5hZGRyZXNzfWA7XHJcblxyXG4gIC8vIENvbnRyYWN0IGFkZHJlc3NcclxuICBjb25zdCBzaG9ydEFkZHJlc3MgPSBgJHt0b2tlbkRhdGEuYWRkcmVzcy5zbGljZSgwLCA2KX0uLi4ke3Rva2VuRGF0YS5hZGRyZXNzLnNsaWNlKC00KX1gO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWFkZHJlc3Mtc2hvcnQnKS50ZXh0Q29udGVudCA9IHNob3J0QWRkcmVzcztcclxuXHJcbiAgLy8gTWFuYWdlbWVudCBwYW5lbCAoc2hvdyBvbmx5IGZvciBkZWZhdWx0IHRva2VucylcclxuICBjb25zdCBtYW5hZ2VtZW50UGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1tYW5hZ2VtZW50LXBhbmVsJyk7XHJcbiAgaWYgKGlzRGVmYXVsdCkge1xyXG4gICAgbWFuYWdlbWVudFBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG5cclxuICAgIC8vIFNldCB0b2dnbGUgc3RhdGVcclxuICAgIGNvbnN0IGVuYWJsZVRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWVuYWJsZS10b2dnbGUnKTtcclxuICAgIGNvbnN0IGVuYWJsZUxhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtZW5hYmxlLWxhYmVsJyk7XHJcbiAgICBjb25zdCBlbmFibGVkVG9rZW5zID0gYXdhaXQgdG9rZW5zLmdldEVuYWJsZWREZWZhdWx0VG9rZW5zKG5ldHdvcmspO1xyXG4gICAgY29uc3QgaXNUb2tlbkVuYWJsZWQgPSBlbmFibGVkVG9rZW5zLmluY2x1ZGVzKHN5bWJvbCk7XHJcblxyXG4gICAgZW5hYmxlVG9nZ2xlLmNoZWNrZWQgPSBpc1Rva2VuRW5hYmxlZDtcclxuICAgIGVuYWJsZUxhYmVsLnRleHRDb250ZW50ID0gaXNUb2tlbkVuYWJsZWQgPyAnRW5hYmxlZCcgOiAnRGlzYWJsZWQnO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBtYW5hZ2VtZW50UGFuZWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgfVxyXG5cclxuICAvLyBDbGVhciBzZW5kIGZvcm1cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1yZWNpcGllbnQnKS52YWx1ZSA9ICcnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWFtb3VudCcpLnZhbHVlID0gJyc7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtcGFzc3dvcmQnKS52YWx1ZSA9ICcnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLXNlbmQtZXJyb3InKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gU2hvdyBmb3JtIGFuZCBoaWRlIHN0YXR1cyBzZWN0aW9uIChyZXNldCBzdGF0ZSlcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tc2VuZC1mb3JtJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXNlbmQtc3RhdHVzLXNlY3Rpb24nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gU2hvdyBzY3JlZW5cclxuICBzaG93U2NyZWVuKCdzY3JlZW4tdG9rZW4tZGV0YWlscycpO1xyXG5cclxuICAvLyBQb3B1bGF0ZSBnYXMgcHJpY2VzIGFuZCBub25jZVxyXG4gIGNvbnN0IG5ldHdvcmtTeW1ib2xzID0ge1xyXG4gICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3RQTFMnLFxyXG4gICAgJ3B1bHNlY2hhaW4nOiAnUExTJyxcclxuICAgICdldGhlcmV1bSc6ICdFVEgnLFxyXG4gICAgJ3NlcG9saWEnOiAnU0VQJ1xyXG4gIH07XHJcbiAgY29uc3QgbmV0d29ya1N5bWJvbCA9IG5ldHdvcmtTeW1ib2xzW25ldHdvcmtdIHx8ICdUT0tFTic7XHJcblxyXG4gIC8vIENyZWF0ZSBhIHRva2VuIHRyYW5zZmVyIHRyYW5zYWN0aW9uIGZvciBnYXMgZXN0aW1hdGlvblxyXG4gIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gIGNvbnN0IHRva2VuQ29udHJhY3QgPSBuZXcgZXRoZXJzLkNvbnRyYWN0KFxyXG4gICAgdG9rZW5EYXRhLmFkZHJlc3MsXHJcbiAgICBbJ2Z1bmN0aW9uIHRyYW5zZmVyKGFkZHJlc3MgdG8sIHVpbnQyNTYgYW1vdW50KSByZXR1cm5zIChib29sKSddLFxyXG4gICAgcHJvdmlkZXJcclxuICApO1xyXG4gIGNvbnN0IGR1bW15QW1vdW50ID0gZXRoZXJzLnBhcnNlVW5pdHMoJzEnLCB0b2tlbkRhdGEuZGVjaW1hbHMpO1xyXG4gIGNvbnN0IHR4UmVxdWVzdCA9IHtcclxuICAgIGZyb206IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLFxyXG4gICAgdG86IHRva2VuRGF0YS5hZGRyZXNzLFxyXG4gICAgZGF0YTogdG9rZW5Db250cmFjdC5pbnRlcmZhY2UuZW5jb2RlRnVuY3Rpb25EYXRhKCd0cmFuc2ZlcicsIFtjdXJyZW50U3RhdGUuYWRkcmVzcywgZHVtbXlBbW91bnRdKVxyXG4gIH07XHJcblxyXG4gIGF3YWl0IHBvcHVsYXRlVG9rZW5HYXNQcmljZXMobmV0d29yaywgdHhSZXF1ZXN0LCBuZXR3b3JrU3ltYm9sKTtcclxuXHJcbiAgLy8gRmV0Y2ggYW5kIGRpc3BsYXkgbm9uY2VcclxuICB0cnkge1xyXG4gICAgY29uc3Qgbm9uY2VIZXggPSBhd2FpdCBycGMuZ2V0VHJhbnNhY3Rpb25Db3VudChuZXR3b3JrLCBjdXJyZW50U3RhdGUuYWRkcmVzcywgJ3BlbmRpbmcnKTtcclxuICAgIGNvbnN0IG5vbmNlID0gcGFyc2VJbnQobm9uY2VIZXgsIDE2KTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1jdXJyZW50LW5vbmNlJykudGV4dENvbnRlbnQgPSBub25jZTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgbm9uY2U6JywgZXJyb3IpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1cnJlbnQtbm9uY2UnKS50ZXh0Q29udGVudCA9ICdFcnJvcic7XHJcbiAgfVxyXG5cclxuICAvLyBTZXR1cCBjdXN0b20gbm9uY2UgY2hlY2tib3hcclxuICBjb25zdCBjdXN0b21Ob25jZUNoZWNrYm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1c3RvbS1ub25jZS1jaGVja2JveCcpO1xyXG4gIGNvbnN0IGN1c3RvbU5vbmNlQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1c3RvbS1ub25jZS1pbnB1dC1jb250YWluZXInKTtcclxuICBjdXN0b21Ob25jZUNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcclxuICBjdXN0b21Ob25jZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gUmVtb3ZlIG9sZCBsaXN0ZW5lciBpZiBleGlzdHMgYW5kIGFkZCBuZXcgb25lXHJcbiAgY29uc3QgbmV3Q2hlY2tib3ggPSBjdXN0b21Ob25jZUNoZWNrYm94LmNsb25lTm9kZSh0cnVlKTtcclxuICBjdXN0b21Ob25jZUNoZWNrYm94LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld0NoZWNrYm94LCBjdXN0b21Ob25jZUNoZWNrYm94KTtcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1c3RvbS1ub25jZS1jaGVja2JveCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XHJcbiAgICBpZiAoZS50YXJnZXQuY2hlY2tlZCkge1xyXG4gICAgICBjdXN0b21Ob25jZUNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgY29uc3QgY3VycmVudE5vbmNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1cnJlbnQtbm9uY2UnKS50ZXh0Q29udGVudDtcclxuICAgICAgaWYgKGN1cnJlbnROb25jZSAhPT0gJy0tJyAmJiBjdXJyZW50Tm9uY2UgIT09ICdFcnJvcicpIHtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tY3VzdG9tLW5vbmNlJykudmFsdWUgPSBjdXJyZW50Tm9uY2U7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGN1c3RvbU5vbmNlQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb3B5VG9rZW5EZXRhaWxzQWRkcmVzcygpIHtcclxuICBjb25zdCB0b2tlbkRhdGEgPSBjdXJyZW50U3RhdGUuY3VycmVudFRva2VuRGV0YWlscztcclxuICBpZiAoIXRva2VuRGF0YSkgcmV0dXJuO1xyXG5cclxuICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0b2tlbkRhdGEuYWRkcmVzcykudGhlbigoKSA9PiB7XHJcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1jb3B5LWFkZHJlc3MnKTtcclxuICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGJ0bi5pbm5lckhUTUw7XHJcbiAgICBidG4uaW5uZXJIVE1MID0gJzxzcGFuPuKckzwvc3Bhbj48c3Bhbj5Db3BpZWQhPC9zcGFuPic7XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgYnRuLmlubmVySFRNTCA9IG9yaWdpbmFsVGV4dDtcclxuICAgIH0sIDIwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUb2tlblNlbmRNYXgoKSB7XHJcbiAgY29uc3QgdG9rZW5EYXRhID0gY3VycmVudFN0YXRlLmN1cnJlbnRUb2tlbkRldGFpbHM7XHJcbiAgaWYgKCF0b2tlbkRhdGEpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBhd2FpdCBlcmMyMC5nZXRUb2tlbkJhbGFuY2UoY3VycmVudFN0YXRlLm5ldHdvcmssIHRva2VuRGF0YS5hZGRyZXNzLCBjdXJyZW50U3RhdGUuYWRkcmVzcyk7XHJcbiAgICBjb25zdCBiYWxhbmNlRm9ybWF0dGVkID0gZXJjMjAuZm9ybWF0VG9rZW5CYWxhbmNlKGJhbGFuY2VXZWksIHRva2VuRGF0YS5kZWNpbWFscywgMTgpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtYW1vdW50JykudmFsdWUgPSBiYWxhbmNlRm9ybWF0dGVkO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIG1heCBiYWxhbmNlOicsIGVycm9yKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRva2VuU2VuZCgpIHtcclxuICBjb25zdCB0b2tlbkRhdGEgPSBjdXJyZW50U3RhdGUuY3VycmVudFRva2VuRGV0YWlscztcclxuICBpZiAoIXRva2VuRGF0YSkgcmV0dXJuO1xyXG5cclxuICBjb25zdCByZWNpcGllbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZGV0YWlscy1yZWNpcGllbnQnKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgYW1vdW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtYW1vdW50JykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtcGFzc3dvcmQnKS52YWx1ZTtcclxuICBjb25zdCBlcnJvckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRldGFpbHMtc2VuZC1lcnJvcicpO1xyXG5cclxuICAvLyBDbGVhciBwcmV2aW91cyBlcnJvcnNcclxuICBlcnJvckVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAvLyBWYWxpZGF0ZSBpbnB1dHNcclxuICBpZiAoIXJlY2lwaWVudCB8fCAhYW1vdW50IHx8ICFwYXNzd29yZCkge1xyXG4gICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdQbGVhc2UgZmlsbCBhbGwgZmllbGRzJztcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBpZiAoIXJlY2lwaWVudC5zdGFydHNXaXRoKCcweCcpIHx8IHJlY2lwaWVudC5sZW5ndGggIT09IDQyKSB7XHJcbiAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ0ludmFsaWQgcmVjaXBpZW50IGFkZHJlc3MnO1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBEaXNhYmxlIHNlbmQgYnV0dG9uIHRvIHByZXZlbnQgZG91YmxlLWNsaWNraW5nXHJcbiAgICBjb25zdCBzZW5kQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi10b2tlbi1zZW5kJyk7XHJcbiAgICBzZW5kQnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIHNlbmRCdG4uc3R5bGUub3BhY2l0eSA9ICcwLjUnO1xyXG4gICAgc2VuZEJ0bi5zdHlsZS5jdXJzb3IgPSAnbm90LWFsbG93ZWQnO1xyXG5cclxuICAgIGNvbnN0IGFtb3VudEJOID0gZXRoZXJzLnBhcnNlVW5pdHMoYW1vdW50LCB0b2tlbkRhdGEuZGVjaW1hbHMpO1xyXG5cclxuICAgIC8vIENoZWNrIGJhbGFuY2VcclxuICAgIGNvbnN0IGJhbGFuY2VXZWkgPSBhd2FpdCBlcmMyMC5nZXRUb2tlbkJhbGFuY2UoY3VycmVudFN0YXRlLm5ldHdvcmssIHRva2VuRGF0YS5hZGRyZXNzLCBjdXJyZW50U3RhdGUuYWRkcmVzcyk7XHJcbiAgICBpZiAoYW1vdW50Qk4gPiBiYWxhbmNlV2VpKSB7XHJcbiAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSAnSW5zdWZmaWNpZW50IGJhbGFuY2UnO1xyXG4gICAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIHZhbGlkYXRpb24gZXJyb3JcclxuICAgICAgc2VuZEJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICBzZW5kQnRuLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgIHNlbmRCdG4uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVW5sb2NrIHdhbGxldCB3aXRoIHBhc3N3b3JkIGFuZCBhdXRvLXVwZ3JhZGUgaWYgbmVlZGVkXHJcbiAgICBsZXQgc2lnbmVyO1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgdW5sb2NrUmVzdWx0ID0gYXdhaXQgdW5sb2NrV2FsbGV0KHBhc3N3b3JkLCB7XHJcbiAgICAgICAgb25VcGdyYWRlU3RhcnQ6IChpbmZvKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhg8J+UkCBBdXRvLXVwZ3JhZGluZyB3YWxsZXQ6ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHNpZ25lciA9IHVubG9ja1Jlc3VsdC5zaWduZXI7XHJcblxyXG4gICAgICBpZiAodW5sb2NrUmVzdWx0LnVwZ3JhZGVkKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYOKchSBXYWxsZXQgdXBncmFkZWQ6ICR7dW5sb2NrUmVzdWx0Lml0ZXJhdGlvbnNCZWZvcmUudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7dW5sb2NrUmVzdWx0Lml0ZXJhdGlvbnNBZnRlci50b0xvY2FsZVN0cmluZygpfWApO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IGVyci5tZXNzYWdlIHx8ICdJbmNvcnJlY3QgcGFzc3dvcmQnO1xyXG4gICAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIHBhc3N3b3JkIGVycm9yXHJcbiAgICAgIHNlbmRCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgc2VuZEJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICBzZW5kQnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCBzZWxlY3RlZCBnYXMgcHJpY2VcclxuICAgIGNvbnN0IGdhc1ByaWNlID0gZ2V0U2VsZWN0ZWRUb2tlbkdhc1ByaWNlKCk7XHJcblxyXG4gICAgLy8gR2V0IGN1c3RvbSBub25jZSBpZiBwcm92aWRlZFxyXG4gICAgY29uc3QgY3VzdG9tTm9uY2VDaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1jdXN0b20tbm9uY2UtY2hlY2tib3gnKTtcclxuICAgIGNvbnN0IGN1c3RvbU5vbmNlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tY3VzdG9tLW5vbmNlJyk7XHJcbiAgICBsZXQgY3VzdG9tTm9uY2UgPSBudWxsO1xyXG4gICAgaWYgKGN1c3RvbU5vbmNlQ2hlY2tib3guY2hlY2tlZCAmJiBjdXN0b21Ob25jZUlucHV0LnZhbHVlKSB7XHJcbiAgICAgIGN1c3RvbU5vbmNlID0gcGFyc2VJbnQoY3VzdG9tTm9uY2VJbnB1dC52YWx1ZSk7XHJcbiAgICAgIGlmIChpc05hTihjdXN0b21Ob25jZSkgfHwgY3VzdG9tTm9uY2UgPCAwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGN1c3RvbSBub25jZScpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IHByb3ZpZGVyIHdpdGggYXV0b21hdGljIGZhaWxvdmVyIGFuZCBjb25uZWN0IHNpZ25lclxyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIoY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG4gICAgY29uc3QgY29ubmVjdGVkU2lnbmVyID0gc2lnbmVyLmNvbm5lY3QocHJvdmlkZXIpO1xyXG5cclxuICAgIC8vIFNlbmQgdG9rZW4gd2l0aCBnYXMgb3B0aW9uc1xyXG4gICAgY29uc3QgdG9rZW5Db250cmFjdCA9IG5ldyBldGhlcnMuQ29udHJhY3QoXHJcbiAgICAgIHRva2VuRGF0YS5hZGRyZXNzLFxyXG4gICAgICBbJ2Z1bmN0aW9uIHRyYW5zZmVyKGFkZHJlc3MgdG8sIHVpbnQyNTYgYW1vdW50KSByZXR1cm5zIChib29sKSddLFxyXG4gICAgICBjb25uZWN0ZWRTaWduZXJcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgdHhPcHRpb25zID0ge307XHJcbiAgICBpZiAoZ2FzUHJpY2UpIHtcclxuICAgICAgdHhPcHRpb25zLmdhc1ByaWNlID0gZ2FzUHJpY2U7XHJcbiAgICB9XHJcbiAgICBpZiAoY3VzdG9tTm9uY2UgIT09IG51bGwpIHtcclxuICAgICAgdHhPcHRpb25zLm5vbmNlID0gY3VzdG9tTm9uY2U7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdHggPSBhd2FpdCB0b2tlbkNvbnRyYWN0LnRyYW5zZmVyKHJlY2lwaWVudCwgYW1vdW50Qk4sIHR4T3B0aW9ucyk7XHJcblxyXG4gICAgLy8gU2F2ZSB0cmFuc2FjdGlvbiB0byBoaXN0b3J5IGFuZCBzdGFydCBtb25pdG9yaW5nXHJcbiAgICBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdTQVZFX0FORF9NT05JVE9SX1RYJyxcclxuICAgICAgYWRkcmVzczogY3VycmVudFN0YXRlLmFkZHJlc3MsXHJcbiAgICAgIHRyYW5zYWN0aW9uOiB7XHJcbiAgICAgICAgaGFzaDogdHguaGFzaCxcclxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgICAgZnJvbTogY3VycmVudFN0YXRlLmFkZHJlc3MsXHJcbiAgICAgICAgdG86IHJlY2lwaWVudCxcclxuICAgICAgICB2YWx1ZTogJzAnLFxyXG4gICAgICAgIGdhc1ByaWNlOiBnYXNQcmljZSB8fCAoYXdhaXQgdHgucHJvdmlkZXIuZ2V0RmVlRGF0YSgpKS5nYXNQcmljZS50b1N0cmluZygpLFxyXG4gICAgICAgIG5vbmNlOiB0eC5ub25jZSxcclxuICAgICAgICBuZXR3b3JrOiBjdXJyZW50U3RhdGUubmV0d29yayxcclxuICAgICAgICBzdGF0dXM6ICdwZW5kaW5nJyxcclxuICAgICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgICB0eXBlOiAndG9rZW4nXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNlbmQgZGVza3RvcCBub3RpZmljYXRpb25cclxuICAgIGlmIChjaHJvbWUubm90aWZpY2F0aW9ucykge1xyXG4gICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBTZW50JyxcclxuICAgICAgICBtZXNzYWdlOiBgU2VuZGluZyAke2Ftb3VudH0gJHt0b2tlbkRhdGEuc3ltYm9sfSB0byAke3JlY2lwaWVudC5zbGljZSgwLCAxMCl9Li4uYCxcclxuICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTaG93IHRyYW5zYWN0aW9uIHN0YXR1cyBzY3JlZW5cclxuICAgIGF3YWl0IHNob3dUb2tlblNlbmRUcmFuc2FjdGlvblN0YXR1cyh0eC5oYXNoLCBjdXJyZW50U3RhdGUubmV0d29yaywgYW1vdW50LCB0b2tlbkRhdGEuc3ltYm9sKTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHNlbmRpbmcgdG9rZW46JywgZXJyb3IpO1xyXG4gICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2UgfHwgJ1RyYW5zYWN0aW9uIGZhaWxlZCc7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG5cclxuICAgIC8vIFJlLWVuYWJsZSBzZW5kIGJ1dHRvbiBvbiBlcnJvclxyXG4gICAgY29uc3Qgc2VuZEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdG9rZW4tc2VuZCcpO1xyXG4gICAgc2VuZEJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgc2VuZEJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgc2VuZEJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUb2tlbkVuYWJsZVRvZ2dsZShlKSB7XHJcbiAgY29uc3QgdG9rZW5EYXRhID0gY3VycmVudFN0YXRlLmN1cnJlbnRUb2tlbkRldGFpbHM7XHJcbiAgaWYgKCF0b2tlbkRhdGEgfHwgIXRva2VuRGF0YS5pc0RlZmF1bHQpIHJldHVybjtcclxuXHJcbiAgY29uc3QgaXNFbmFibGVkID0gZS50YXJnZXQuY2hlY2tlZDtcclxuICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1kZXRhaWxzLWVuYWJsZS1sYWJlbCcpO1xyXG5cclxuICAvLyBVcGRhdGUgbGFiZWxcclxuICBsYWJlbC50ZXh0Q29udGVudCA9IGlzRW5hYmxlZCA/ICdFbmFibGVkJyA6ICdEaXNhYmxlZCc7XHJcblxyXG4gIC8vIFNhdmUgdG8gc3RvcmFnZVxyXG4gIGF3YWl0IHRva2Vucy50b2dnbGVEZWZhdWx0VG9rZW4oY3VycmVudFN0YXRlLm5ldHdvcmssIHRva2VuRGF0YS5zeW1ib2wsIGlzRW5hYmxlZCk7XHJcblxyXG4gIC8vIE5vdGU6IFdlIGRvbid0IHJlLXJlbmRlciB0aGUgdG9rZW5zIHNjcmVlbiBoZXJlIHRvIGF2b2lkIGxlYXZpbmcgdGhlIGRldGFpbHMgcGFnZVxyXG4gIC8vIFRoZSBjaGFuZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgd2hlbiB0aGUgdXNlciBnb2VzIGJhY2sgdG8gdGhlIHRva2VucyBzY3JlZW5cclxufVxyXG5cclxuZnVuY3Rpb24gc2hvd0FkZFRva2VuTW9kYWwoKSB7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LXRva2VuLWFkZHJlc3MnKS52YWx1ZSA9ICcnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1wcmV2aWV3JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZC10b2tlbi1lcnJvcicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtdG9rZW4nKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxufVxyXG5cclxubGV0IHRva2VuVmFsaWRhdGlvblRpbWVvdXQ7XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRva2VuQWRkcmVzc0lucHV0KGUpIHtcclxuICBjb25zdCBhZGRyZXNzID0gZS50YXJnZXQudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IHByZXZpZXdFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1wcmV2aWV3Jyk7XHJcbiAgY29uc3QgZXJyb3JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtdG9rZW4tZXJyb3InKTtcclxuXHJcbiAgLy8gQ2xlYXIgcHJldmlvdXMgdGltZW91dFxyXG4gIGlmICh0b2tlblZhbGlkYXRpb25UaW1lb3V0KSB7XHJcbiAgICBjbGVhclRpbWVvdXQodG9rZW5WYWxpZGF0aW9uVGltZW91dCk7XHJcbiAgfVxyXG5cclxuICAvLyBIaWRlIHByZXZpZXcgYW5kIGVycm9yXHJcbiAgcHJldmlld0VsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIGVycm9yRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIC8vIEJhc2ljIHZhbGlkYXRpb25cclxuICBpZiAoIWFkZHJlc3MgfHwgYWRkcmVzcy5sZW5ndGggIT09IDQyIHx8ICFhZGRyZXNzLnN0YXJ0c1dpdGgoJzB4JykpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIERlYm91bmNlIHRoZSB2YWxpZGF0aW9uXHJcbiAgdG9rZW5WYWxpZGF0aW9uVGltZW91dCA9IHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgbmV0d29yayA9IGN1cnJlbnRTdGF0ZS5uZXR3b3JrO1xyXG4gICAgICBjb25zdCBtZXRhZGF0YSA9IGF3YWl0IGVyYzIwLmdldFRva2VuTWV0YWRhdGEobmV0d29yaywgYWRkcmVzcyk7XHJcblxyXG4gICAgICAvLyBTaG93IHByZXZpZXdcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXByZXZpZXctbmFtZScpLnRleHRDb250ZW50ID0gbWV0YWRhdGEubmFtZTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXByZXZpZXctc3ltYm9sJykudGV4dENvbnRlbnQgPSBtZXRhZGF0YS5zeW1ib2w7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1wcmV2aWV3LWRlY2ltYWxzJykudGV4dENvbnRlbnQgPSBtZXRhZGF0YS5kZWNpbWFscztcclxuICAgICAgcHJldmlld0VsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdJbnZhbGlkIHRva2VuIGNvbnRyYWN0JztcclxuICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIH1cclxuICB9LCA1MDApO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVBZGRDdXN0b21Ub2tlbigpIHtcclxuICBjb25zdCBhZGRyZXNzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LXRva2VuLWFkZHJlc3MnKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgZXJyb3JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtdG9rZW4tZXJyb3InKTtcclxuXHJcbiAgaWYgKCFhZGRyZXNzKSB7XHJcbiAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ1BsZWFzZSBlbnRlciBhIHRva2VuIGFkZHJlc3MnO1xyXG4gICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgYXdhaXQgdG9rZW5zLmFkZEN1c3RvbVRva2VuKGN1cnJlbnRTdGF0ZS5uZXR3b3JrLCBhZGRyZXNzKTtcclxuXHJcbiAgICAvLyBDbG9zZSBtb2RhbCBhbmQgcmVmcmVzaCBzY3JlZW5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtdG9rZW4nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIGF3YWl0IHJlbmRlclRva2Vuc1NjcmVlbigpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBlcnJvckVsLnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBTRVRUSU5HUyA9PT09PVxyXG5mdW5jdGlvbiBsb2FkU2V0dGluZ3NUb1VJKCkge1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLWF1dG9sb2NrJykudmFsdWUgPSBjdXJyZW50U3RhdGUuc2V0dGluZ3MuYXV0b0xvY2tNaW51dGVzO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLWRlY2ltYWxzJykudmFsdWUgPSBjdXJyZW50U3RhdGUuc2V0dGluZ3MuZGVjaW1hbFBsYWNlcztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0dGluZy10aGVtZScpLnZhbHVlID0gY3VycmVudFN0YXRlLnNldHRpbmdzLnRoZW1lO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLXNob3ctdGVzdG5ldHMnKS5jaGVja2VkID0gY3VycmVudFN0YXRlLnNldHRpbmdzLnNob3dUZXN0TmV0d29ya3M7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmctbWF4LWdhcy1wcmljZScpLnZhbHVlID0gY3VycmVudFN0YXRlLnNldHRpbmdzLm1heEdhc1ByaWNlR3dlaSB8fCAxMDAwO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5nLWFsbG93LWV0aC1zaWduJykuY2hlY2tlZCA9IGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5hbGxvd0V0aFNpZ24gfHwgZmFsc2U7XHJcblxyXG4gIC8vIEZldGNoIGFuZCBkaXNwbGF5IGN1cnJlbnQgbmV0d29yayBnYXMgcHJpY2VcclxuICBmZXRjaEN1cnJlbnRHYXNQcmljZSgpO1xyXG59XHJcblxyXG4vKipcclxuICogRmV0Y2hlcyBjdXJyZW50IGdhcyBwcmljZSBmcm9tIHRoZSBuZXR3b3JrIGFuZCBkaXNwbGF5cyBpdFxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZmV0Y2hDdXJyZW50R2FzUHJpY2UoKSB7XHJcbiAgY29uc3QgbGFiZWxFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdXJyZW50LWdhcy1wcmljZS1sYWJlbCcpO1xyXG4gIGlmICghbGFiZWxFbCkgcmV0dXJuO1xyXG5cclxuICB0cnkge1xyXG4gICAgbGFiZWxFbC50ZXh0Q29udGVudCA9ICdMb2FkaW5nIGN1cnJlbnQgcHJpY2UuLi4nO1xyXG5cclxuICAgIC8vIEdldCBnYXMgcHJpY2UgZnJvbSBSUENcclxuICAgIGNvbnN0IGdhc1ByaWNlID0gYXdhaXQgcnBjLmdldEdhc1ByaWNlKGN1cnJlbnRTdGF0ZS5uZXR3b3JrKTtcclxuXHJcbiAgICAvLyBDb252ZXJ0IGZyb20gV2VpIHRvIEd3ZWkgKDEgR3dlaSA9IDFlOSBXZWkpXHJcbiAgICBjb25zdCBnYXNQcmljZUd3ZWkgPSBwYXJzZUZsb2F0KGV0aGVycy5mb3JtYXRVbml0cyhnYXNQcmljZSwgJ2d3ZWknKSk7XHJcblxyXG4gICAgLy8gRm9ybWF0IG5pY2VseVxyXG4gICAgbGV0IGRpc3BsYXlQcmljZTtcclxuICAgIGlmIChnYXNQcmljZUd3ZWkgPCAwLjAwMSkge1xyXG4gICAgICBkaXNwbGF5UHJpY2UgPSBnYXNQcmljZUd3ZWkudG9GaXhlZCg2KTsgLy8gVmVyeSBsb3cgKFB1bHNlQ2hhaW4pXHJcbiAgICB9IGVsc2UgaWYgKGdhc1ByaWNlR3dlaSA8IDEpIHtcclxuICAgICAgZGlzcGxheVByaWNlID0gZ2FzUHJpY2VHd2VpLnRvRml4ZWQoMyk7XHJcbiAgICB9IGVsc2UgaWYgKGdhc1ByaWNlR3dlaSA8IDEwKSB7XHJcbiAgICAgIGRpc3BsYXlQcmljZSA9IGdhc1ByaWNlR3dlaS50b0ZpeGVkKDIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZGlzcGxheVByaWNlID0gZ2FzUHJpY2VHd2VpLnRvRml4ZWQoMSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbmV0d29ya05hbWUgPSBORVRXT1JLX05BTUVTW2N1cnJlbnRTdGF0ZS5uZXR3b3JrXSB8fCBjdXJyZW50U3RhdGUubmV0d29yaztcclxuICAgIGxhYmVsRWwudGV4dENvbnRlbnQgPSBgQ3VycmVudCAke25ldHdvcmtOYW1lfSBwcmljZTogJHtkaXNwbGF5UHJpY2V9IEd3ZWlgO1xyXG4gICAgbGFiZWxFbC5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1zdWNjZXNzKSc7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICBsYWJlbEVsLnRleHRDb250ZW50ID0gJ1VuYWJsZSB0byBmZXRjaCBjdXJyZW50IHByaWNlJztcclxuICAgIGxhYmVsRWwuc3R5bGUuY29sb3IgPSAndmFyKC0tdGVybWluYWwtZXJyb3IpJztcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBIYW5kbGVzIFwiVVNFIENVUlJFTlQgTkVUV09SSyBQUklDRVwiIGJ1dHRvbiBjbGlja1xyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVXNlQ3VycmVudEdhc1ByaWNlKCkge1xyXG4gIGNvbnN0IGlucHV0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0dGluZy1tYXgtZ2FzLXByaWNlJyk7XHJcbiAgY29uc3QgbGFiZWxFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdXJyZW50LWdhcy1wcmljZS1sYWJlbCcpO1xyXG5cclxuICBpZiAoIWlucHV0RWwpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIEdldCBjdXJyZW50IGdhcyBwcmljZVxyXG4gICAgY29uc3QgZ2FzUHJpY2UgPSBhd2FpdCBycGMuZ2V0R2FzUHJpY2UoY3VycmVudFN0YXRlLm5ldHdvcmspO1xyXG4gICAgY29uc3QgZ2FzUHJpY2VHd2VpID0gcGFyc2VGbG9hdChldGhlcnMuZm9ybWF0VW5pdHMoZ2FzUHJpY2UsICdnd2VpJykpO1xyXG5cclxuICAgIC8vIEFkZCAyMCUgYnVmZmVyIGZvciBzYWZldHkgKGdhcyBwcmljZXMgY2FuIHNwaWtlKVxyXG4gICAgY29uc3QgYnVmZmVyZWRQcmljZSA9IGdhc1ByaWNlR3dlaSAqIDEuMjtcclxuXHJcbiAgICAvLyBSb3VuZCB0byByZWFzb25hYmxlIHByZWNpc2lvblxyXG4gICAgbGV0IHJvdW5kZWRQcmljZTtcclxuICAgIGlmIChidWZmZXJlZFByaWNlIDwgMSkge1xyXG4gICAgICByb3VuZGVkUHJpY2UgPSBNYXRoLmNlaWwoYnVmZmVyZWRQcmljZSAqIDEwMDApIC8gMTAwMDsgLy8gUm91bmQgdG8gMyBkZWNpbWFsc1xyXG4gICAgfSBlbHNlIGlmIChidWZmZXJlZFByaWNlIDwgMTApIHtcclxuICAgICAgcm91bmRlZFByaWNlID0gTWF0aC5jZWlsKGJ1ZmZlcmVkUHJpY2UgKiAxMDApIC8gMTAwOyAvLyBSb3VuZCB0byAyIGRlY2ltYWxzXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByb3VuZGVkUHJpY2UgPSBNYXRoLmNlaWwoYnVmZmVyZWRQcmljZSAqIDEwKSAvIDEwOyAvLyBSb3VuZCB0byAxIGRlY2ltYWxcclxuICAgIH1cclxuXHJcbiAgICAvLyBFbnN1cmUgbWluaW11bSBvZiAwLjEgR3dlaVxyXG4gICAgY29uc3QgZmluYWxQcmljZSA9IE1hdGgubWF4KDAuMSwgcm91bmRlZFByaWNlKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgaW5wdXQgYW5kIHNldHRpbmdzXHJcbiAgICBpbnB1dEVsLnZhbHVlID0gZmluYWxQcmljZTtcclxuICAgIGN1cnJlbnRTdGF0ZS5zZXR0aW5ncy5tYXhHYXNQcmljZUd3ZWkgPSBmaW5hbFByaWNlO1xyXG4gICAgc2F2ZVNldHRpbmdzKCk7XHJcblxyXG4gICAgLy8gVXBkYXRlIGxhYmVsIHRvIHNob3cgd2hhdCB3YXMgc2V0XHJcbiAgICBsYWJlbEVsLnRleHRDb250ZW50ID0gYFNldCB0byAke2ZpbmFsUHJpY2V9IEd3ZWkgKGN1cnJlbnQgKyAyMCUgYnVmZmVyKWA7XHJcbiAgICBsYWJlbEVsLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXN1Y2Nlc3MpJztcclxuXHJcbiAgICAvLyBSZWZyZXNoIGRpc3BsYXkgYWZ0ZXIgMiBzZWNvbmRzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IGZldGNoQ3VycmVudEdhc1ByaWNlKCksIDIwMDApO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzZXR0aW5nIGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICBhbGVydCgnRmFpbGVkIHRvIGZldGNoIGN1cnJlbnQgZ2FzIHByaWNlLiBQbGVhc2UgdHJ5IGFnYWluLicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gTmV0d29yayBTZXR0aW5nc1xyXG5jb25zdCBORVRXT1JLX0tFWVMgPSBbJ3B1bHNlY2hhaW5UZXN0bmV0JywgJ3B1bHNlY2hhaW4nLCAnZXRoZXJldW0nLCAnc2Vwb2xpYSddO1xyXG5cclxuZnVuY3Rpb24gbG9hZE5ldHdvcmtTZXR0aW5nc1RvVUkoKSB7XHJcbiAgTkVUV09SS19LRVlTLmZvckVhY2gobmV0d29yayA9PiB7XHJcbiAgICAvLyBMb2FkIFJQQyBlbmRwb2ludFxyXG4gICAgY29uc3QgcnBjSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgcnBjLSR7bmV0d29ya31gKTtcclxuICAgIGlmIChycGNJbnB1dCkge1xyXG4gICAgICBycGNJbnB1dC52YWx1ZSA9IGN1cnJlbnRTdGF0ZS5uZXR3b3JrU2V0dGluZ3M/LltuZXR3b3JrXT8ucnBjIHx8ICcnO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExvYWQgRXhwbG9yZXIgc2V0dGluZ3NcclxuICAgIGNvbnN0IGV4cGxvcmVySW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgZXhwbG9yZXItJHtuZXR3b3JrfWApO1xyXG4gICAgaWYgKGV4cGxvcmVySW5wdXQpIHtcclxuICAgICAgZXhwbG9yZXJJbnB1dC52YWx1ZSA9IGN1cnJlbnRTdGF0ZS5uZXR3b3JrU2V0dGluZ3M/LltuZXR3b3JrXT8uZXhwbG9yZXJCYXNlIHx8ICcnO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHR4UGF0aElucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGV4cGxvcmVyLXR4LSR7bmV0d29ya31gKTtcclxuICAgIGlmICh0eFBhdGhJbnB1dCkge1xyXG4gICAgICB0eFBhdGhJbnB1dC52YWx1ZSA9IGN1cnJlbnRTdGF0ZS5uZXR3b3JrU2V0dGluZ3M/LltuZXR3b3JrXT8uZXhwbG9yZXJUeFBhdGggfHwgJyc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYWRkclBhdGhJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBleHBsb3Jlci1hZGRyLSR7bmV0d29ya31gKTtcclxuICAgIGlmIChhZGRyUGF0aElucHV0KSB7XHJcbiAgICAgIGFkZHJQYXRoSW5wdXQudmFsdWUgPSBjdXJyZW50U3RhdGUubmV0d29ya1NldHRpbmdzPy5bbmV0d29ya10/LmV4cGxvcmVyQWRkclBhdGggfHwgJyc7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVOZXR3b3JrU2V0dGluZ3MoKSB7XHJcbiAgY29uc3QgbmV0d29ya1NldHRpbmdzID0ge307XHJcblxyXG4gIE5FVFdPUktfS0VZUy5mb3JFYWNoKG5ldHdvcmsgPT4ge1xyXG4gICAgbmV0d29ya1NldHRpbmdzW25ldHdvcmtdID0ge1xyXG4gICAgICBycGM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBycGMtJHtuZXR3b3JrfWApPy52YWx1ZSB8fCAnJyxcclxuICAgICAgZXhwbG9yZXJCYXNlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgZXhwbG9yZXItJHtuZXR3b3JrfWApPy52YWx1ZSB8fCAnJyxcclxuICAgICAgZXhwbG9yZXJUeFBhdGg6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBleHBsb3Jlci10eC0ke25ldHdvcmt9YCk/LnZhbHVlIHx8ICcnLFxyXG4gICAgICBleHBsb3JlckFkZHJQYXRoOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgZXhwbG9yZXItYWRkci0ke25ldHdvcmt9YCk/LnZhbHVlIHx8ICcnXHJcbiAgICB9O1xyXG4gIH0pO1xyXG5cclxuICBhd2FpdCBzYXZlKCduZXR3b3JrU2V0dGluZ3MnLCBuZXR3b3JrU2V0dGluZ3MpO1xyXG4gIGN1cnJlbnRTdGF0ZS5uZXR3b3JrU2V0dGluZ3MgPSBuZXR3b3JrU2V0dGluZ3M7XHJcblxyXG4gIC8vIFVwZGF0ZSBydW50aW1lIHNldHRpbmdzXHJcbiAgYXBwbHlOZXR3b3JrU2V0dGluZ3MoKTtcclxuXHJcbiAgYWxlcnQoJ05ldHdvcmsgc2V0dGluZ3Mgc2F2ZWQhIENoYW5nZXMgd2lsbCB0YWtlIGVmZmVjdCBvbiBuZXh0IHJlbG9hZC4nKTtcclxuICBzaG93U2NyZWVuKCdzY3JlZW4tc2V0dGluZ3MnKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVzZXROZXR3b3JrU2V0dGluZ3NUb0RlZmF1bHRzKCkge1xyXG4gIE5FVFdPUktfS0VZUy5mb3JFYWNoKG5ldHdvcmsgPT4ge1xyXG4gICAgLy8gUmVzZXQgdG8gZGVmYXVsdCBSUEMgZW5kcG9pbnRzIGZyb20gcnBjLmpzXHJcbiAgICBjb25zdCBkZWZhdWx0UlBDcyA9IHtcclxuICAgICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ2h0dHBzOi8vcnBjLnY0LnRlc3RuZXQucHVsc2VjaGFpbi5jb20nLFxyXG4gICAgICAncHVsc2VjaGFpbic6ICdodHRwczovL3JwYy5wdWxzZWNoYWluLmNvbScsXHJcbiAgICAgICdldGhlcmV1bSc6ICdodHRwczovL2V0aC5sbGFtYXJwYy5jb20nLFxyXG4gICAgICAnc2Vwb2xpYSc6ICdodHRwczovL3JwYy5zZXBvbGlhLm9yZydcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgZGVmYXVsdEV4cGxvcmVycyA9IHtcclxuICAgICAgJ3B1bHNlY2hhaW5UZXN0bmV0Jzoge1xyXG4gICAgICAgIGJhc2U6ICdodHRwczovL3NjYW4udjQudGVzdG5ldC5wdWxzZWNoYWluLmNvbScsXHJcbiAgICAgICAgdHg6ICcvdHgve2hhc2h9JyxcclxuICAgICAgICBhZGRyOiAnL2FkZHJlc3Mve2FkZHJlc3N9J1xyXG4gICAgICB9LFxyXG4gICAgICAncHVsc2VjaGFpbic6IHtcclxuICAgICAgICBiYXNlOiAnaHR0cHM6Ly9zY2FuLm15cGluYXRhLmNsb3VkL2lwZnMvYmFmeWJlaWVueHlveXJobjV0c3djbHZkM2dkank1bXRra3dtdTM3YXF0bWw2b25iZjd4bmIzbzIycGUvJyxcclxuICAgICAgICB0eDogJyMvdHgve2hhc2h9JyxcclxuICAgICAgICBhZGRyOiAnIy9hZGRyZXNzL3thZGRyZXNzfSdcclxuICAgICAgfSxcclxuICAgICAgJ2V0aGVyZXVtJzoge1xyXG4gICAgICAgIGJhc2U6ICdodHRwczovL2V0aGVyc2Nhbi5pbycsXHJcbiAgICAgICAgdHg6ICcvdHgve2hhc2h9JyxcclxuICAgICAgICBhZGRyOiAnL2FkZHJlc3Mve2FkZHJlc3N9J1xyXG4gICAgICB9LFxyXG4gICAgICAnc2Vwb2xpYSc6IHtcclxuICAgICAgICBiYXNlOiAnaHR0cHM6Ly9zZXBvbGlhLmV0aGVyc2Nhbi5pbycsXHJcbiAgICAgICAgdHg6ICcvdHgve2hhc2h9JyxcclxuICAgICAgICBhZGRyOiAnL2FkZHJlc3Mve2FkZHJlc3N9J1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBycGMtJHtuZXR3b3JrfWApLnZhbHVlID0gZGVmYXVsdFJQQ3NbbmV0d29ya10gfHwgJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgZXhwbG9yZXItJHtuZXR3b3JrfWApLnZhbHVlID0gZGVmYXVsdEV4cGxvcmVyc1tuZXR3b3JrXT8uYmFzZSB8fCAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBleHBsb3Jlci10eC0ke25ldHdvcmt9YCkudmFsdWUgPSBkZWZhdWx0RXhwbG9yZXJzW25ldHdvcmtdPy50eCB8fCAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBleHBsb3Jlci1hZGRyLSR7bmV0d29ya31gKS52YWx1ZSA9IGRlZmF1bHRFeHBsb3JlcnNbbmV0d29ya10/LmFkZHIgfHwgJyc7XHJcbiAgfSk7XHJcblxyXG4gIGFsZXJ0KCdOZXR3b3JrIHNldHRpbmdzIHJlc2V0IHRvIGRlZmF1bHRzLiBDbGljayBTQVZFIHRvIGFwcGx5LicpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhcHBseU5ldHdvcmtTZXR0aW5ncygpIHtcclxuICAvLyBUaGlzIHdvdWxkIHVwZGF0ZSB0aGUgcnVudGltZSBSUEMgYW5kIGV4cGxvcmVyIGNvbmZpZ3NcclxuICAvLyBGb3Igbm93LCBzZXR0aW5ncyB0YWtlIGVmZmVjdCBvbiByZWxvYWRcclxufVxyXG5cclxuLy8gPT09PT0gUEFTU1dPUkQgUFJPTVBUIE1PREFMID09PT09XHJcbmxldCBwYXNzd29yZFByb21wdFJlc29sdmUgPSBudWxsO1xyXG5cclxuZnVuY3Rpb24gc2hvd1Bhc3N3b3JkUHJvbXB0KHRpdGxlLCBtZXNzYWdlKSB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICBwYXNzd29yZFByb21wdFJlc29sdmUgPSByZXNvbHZlO1xyXG5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1wcm9tcHQtdGl0bGUnKS50ZXh0Q29udGVudCA9IHRpdGxlO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1tZXNzYWdlJykudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1pbnB1dCcpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQtcHJvbXB0LWVycm9yJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtcGFzc3dvcmQtcHJvbXB0JykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcblxyXG4gICAgLy8gRm9jdXMgdGhlIGlucHV0XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkLXByb21wdC1pbnB1dCcpPy5mb2N1cygpO1xyXG4gICAgfSwgMTAwKTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xvc2VQYXNzd29yZFByb21wdChwYXNzd29yZCA9IG51bGwpIHtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtcGFzc3dvcmQtcHJvbXB0JykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgaWYgKHBhc3N3b3JkUHJvbXB0UmVzb2x2ZSkge1xyXG4gICAgcGFzc3dvcmRQcm9tcHRSZXNvbHZlKHBhc3N3b3JkKTtcclxuICAgIHBhc3N3b3JkUHJvbXB0UmVzb2x2ZSA9IG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBESVNQTEFZIFNFQ1JFVCBNT0RBTCA9PT09PVxyXG5mdW5jdGlvbiBzaG93U2VjcmV0TW9kYWwodGl0bGUsIHNlY3JldCkge1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXNwbGF5LXNlY3JldC10aXRsZScpLnRleHRDb250ZW50ID0gdGl0bGU7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpc3BsYXktc2VjcmV0LWNvbnRlbnQnKS50ZXh0Q29udGVudCA9IHNlY3JldDtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtZGlzcGxheS1zZWNyZXQnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xvc2VTZWNyZXRNb2RhbCgpIHtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtZGlzcGxheS1zZWNyZXQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGlzcGxheS1zZWNyZXQtY29udGVudCcpLnRleHRDb250ZW50ID0gJyc7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVZpZXdTZWVkKCkge1xyXG4gIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgc2hvd1Bhc3N3b3JkUHJvbXB0KCdWaWV3IFNlZWQgUGhyYXNlJywgJ0VudGVyIHlvdXIgcGFzc3dvcmQgdG8gdmlldyB5b3VyIHNlZWQgcGhyYXNlJyk7XHJcbiAgaWYgKCFwYXNzd29yZCkgcmV0dXJuO1xyXG5cclxuICBjb25zdCBlcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1wcm9tcHQtZXJyb3InKTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG1uZW1vbmljID0gYXdhaXQgZXhwb3J0TW5lbW9uaWMocGFzc3dvcmQpO1xyXG4gICAgY2xvc2VQYXNzd29yZFByb21wdCgpO1xyXG5cclxuICAgIGlmIChtbmVtb25pYykge1xyXG4gICAgICBzaG93U2VjcmV0TW9kYWwoJ1lvdXIgU2VlZCBQaHJhc2UnLCBtbmVtb25pYyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhbGVydCgnVGhpcyB3YWxsZXQgd2FzIGltcG9ydGVkIHVzaW5nIGEgcHJpdmF0ZSBrZXkgYW5kIGhhcyBubyBzZWVkIHBocmFzZS4nKTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVFeHBvcnRLZXkoKSB7XHJcbiAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ0V4cG9ydCBQcml2YXRlIEtleScsICdFbnRlciB5b3VyIHBhc3N3b3JkIHRvIGV4cG9ydCB5b3VyIHByaXZhdGUga2V5Jyk7XHJcbiAgaWYgKCFwYXNzd29yZCkgcmV0dXJuO1xyXG5cclxuICBjb25zdCBlcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZC1wcm9tcHQtZXJyb3InKTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHByaXZhdGVLZXkgPSBhd2FpdCBleHBvcnRQcml2YXRlS2V5KHBhc3N3b3JkKTtcclxuICAgIGNsb3NlUGFzc3dvcmRQcm9tcHQoKTtcclxuICAgIHNob3dTZWNyZXRNb2RhbCgnWW91ciBQcml2YXRlIEtleScsIHByaXZhdGVLZXkpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICB9XHJcbn1cclxuXHJcblxyXG4vLyA9PT09PSBNVUxUSS1XQUxMRVQgTUFOQUdFTUVOVCA9PT09PVxyXG5sZXQgY3VycmVudFJlbmFtZVdhbGxldElkID0gbnVsbDtcclxubGV0IGdlbmVyYXRlZE1uZW1vbmljTXVsdGkgPSBudWxsO1xyXG5sZXQgdmVyaWZpY2F0aW9uV29yZHNNdWx0aSA9IFtdOyAvLyBBcnJheSBvZiB7aW5kZXgsIHdvcmR9IGZvciB2ZXJpZmljYXRpb25cclxuXHJcbi8vIFJlbmRlciB3YWxsZXQgbGlzdCBpbiBtYW5hZ2Ugd2FsbGV0cyBzY3JlZW5cclxuYXN5bmMgZnVuY3Rpb24gcmVuZGVyV2FsbGV0TGlzdCgpIHtcclxuICBjb25zdCB3YWxsZXRzRGF0YSA9IGF3YWl0IGdldEFsbFdhbGxldHMoKTtcclxuICBjb25zdCB3YWxsZXRMaXN0RGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhbGxldC1saXN0Jyk7XHJcbiAgY29uc3Qgd2FsbGV0Q291bnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2FsbGV0LWNvdW50Jyk7XHJcblxyXG4gIHdhbGxldENvdW50LnRleHRDb250ZW50ID0gd2FsbGV0c0RhdGEud2FsbGV0TGlzdC5sZW5ndGg7XHJcblxyXG4gIGlmICh3YWxsZXRzRGF0YS53YWxsZXRMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgd2FsbGV0TGlzdERpdi5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWRpbSB0ZXh0LWNlbnRlclwiPk5vIHdhbGxldHMgZm91bmQ8L3A+JztcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHdhbGxldExpc3REaXYuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gIHdhbGxldHNEYXRhLndhbGxldExpc3QuZm9yRWFjaCh3YWxsZXQgPT4ge1xyXG4gICAgY29uc3QgaXNBY3RpdmUgPSB3YWxsZXQuaWQgPT09IHdhbGxldHNEYXRhLmFjdGl2ZVdhbGxldElkO1xyXG4gICAgY29uc3Qgd2FsbGV0Q2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgd2FsbGV0Q2FyZC5jbGFzc05hbWUgPSAncGFuZWwgbWItMic7XHJcbiAgICBpZiAoaXNBY3RpdmUpIHtcclxuICAgICAgd2FsbGV0Q2FyZC5zdHlsZS5ib3JkZXJDb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1zdWNjZXNzKSc7XHJcbiAgICAgIHdhbGxldENhcmQuc3R5bGUuYm9yZGVyV2lkdGggPSAnMnB4JztcclxuICAgIH1cclxuXHJcbiAgICB3YWxsZXRDYXJkLmlubmVySFRNTCA9IGBcclxuICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7IG1hcmdpbi1ib3R0b206IDEycHg7XCI+XHJcbiAgICAgICAgPGRpdiBzdHlsZT1cImZsZXg6IDE7XCI+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC13ZWlnaHQ6IGJvbGQ7IGZvbnQtc2l6ZTogMTRweDsgbWFyZ2luLWJvdHRvbTogNHB4O1wiPlxyXG4gICAgICAgICAgICAke2lzQWN0aXZlID8gJ+KckyAnIDogJyd9JHtlc2NhcGVIdG1sKHdhbGxldC5uaWNrbmFtZSB8fCAnVW5uYW1lZCBXYWxsZXQnKX1cclxuICAgICAgICAgICAgJHtpc0FjdGl2ZSA/ICc8c3BhbiBjbGFzcz1cInRleHQtc3VjY2Vzc1wiIHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBtYXJnaW4tbGVmdDogOHB4O1wiPltBQ1RJVkVdPC9zcGFuPicgOiAnJ31cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDExcHg7IGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LW1vbm8pOyB3b3JkLWJyZWFrOiBicmVhay1hbGw7XCI+XHJcbiAgICAgICAgICAgICR7ZXNjYXBlSHRtbCh3YWxsZXQuYWRkcmVzcyB8fCAnQWRkcmVzcyBub3QgbG9hZGVkJyl9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMHB4OyBtYXJnaW4tdG9wOiA0cHg7XCI+XHJcbiAgICAgICAgICAgICR7d2FsbGV0LmltcG9ydE1ldGhvZCA9PT0gJ2NyZWF0ZScgPyAnQ3JlYXRlZCcgOiAnSW1wb3J0ZWQnfSDigKIgJHtuZXcgRGF0ZSh3YWxsZXQuY3JlYXRlZEF0KS50b0xvY2FsZURhdGVTdHJpbmcoKX1cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cImJ1dHRvbi1ncm91cFwiIHN0eWxlPVwiZ2FwOiA2cHg7XCI+XHJcbiAgICAgICAgJHshaXNBY3RpdmUgPyBgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc21hbGxcIiBkYXRhLXdhbGxldC1pZD1cIiR7d2FsbGV0LmlkfVwiIGRhdGEtYWN0aW9uPVwic3dpdGNoXCI+U1dJVENIPC9idXR0b24+YCA6ICcnfVxyXG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXNtYWxsXCIgZGF0YS13YWxsZXQtaWQ9XCIke3dhbGxldC5pZH1cIiBkYXRhLWFjdGlvbj1cInJlbmFtZVwiPlJFTkFNRTwvYnV0dG9uPlxyXG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXNtYWxsXCIgZGF0YS13YWxsZXQtaWQ9XCIke3dhbGxldC5pZH1cIiBkYXRhLWFjdGlvbj1cImV4cG9ydFwiPkVYUE9SVDwvYnV0dG9uPlxyXG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLWRhbmdlciBidG4tc21hbGxcIiBkYXRhLXdhbGxldC1pZD1cIiR7d2FsbGV0LmlkfVwiIGRhdGEtYWN0aW9uPVwiZGVsZXRlXCI+REVMRVRFPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcbiAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBidXR0b25zXHJcbiAgICBjb25zdCBidXR0b25zID0gd2FsbGV0Q2FyZC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKTtcclxuICAgIGJ1dHRvbnMuZm9yRWFjaChidG4gPT4ge1xyXG4gICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgd2FsbGV0SWQgPSBidG4uZGF0YXNldC53YWxsZXRJZDtcclxuICAgICAgICBjb25zdCBhY3Rpb24gPSBidG4uZGF0YXNldC5hY3Rpb247XHJcblxyXG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XHJcbiAgICAgICAgICBjYXNlICdzd2l0Y2gnOlxyXG4gICAgICAgICAgICBhd2FpdCBoYW5kbGVTd2l0Y2hXYWxsZXQod2FsbGV0SWQpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ3JlbmFtZSc6XHJcbiAgICAgICAgICAgIGhhbmRsZVJlbmFtZVdhbGxldFByb21wdCh3YWxsZXRJZCwgd2FsbGV0Lm5pY2tuYW1lKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdleHBvcnQnOlxyXG4gICAgICAgICAgICBhd2FpdCBoYW5kbGVFeHBvcnRGb3JXYWxsZXQod2FsbGV0SWQpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ2RlbGV0ZSc6XHJcbiAgICAgICAgICAgIGF3YWl0IGhhbmRsZURlbGV0ZVdhbGxldE11bHRpKHdhbGxldElkKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHdhbGxldExpc3REaXYuYXBwZW5kQ2hpbGQod2FsbGV0Q2FyZCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIE5hdmlnYXRlIHRvIG1hbmFnZSB3YWxsZXRzIHNjcmVlblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVNYW5hZ2VXYWxsZXRzKCkge1xyXG4gIGF3YWl0IHJlbmRlcldhbGxldExpc3QoKTtcclxuICBzaG93U2NyZWVuKCdzY3JlZW4tbWFuYWdlLXdhbGxldHMnKTtcclxufVxyXG5cclxuLy8gU2hvdyBhZGQgd2FsbGV0IG1vZGFsICh3aXRoIDMgb3B0aW9ucylcclxuZnVuY3Rpb24gc2hvd0FkZFdhbGxldE1vZGFsKCkge1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1hZGQtd2FsbGV0JykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbn1cclxuXHJcbi8vIEdlbmVyYXRlIG1uZW1vbmljIGZvciBtdWx0aS13YWxsZXQgY3JlYXRpb25cclxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVOZXdNbmVtb25pY011bHRpKCkge1xyXG4gIGNvbnN0IHsgZXRoZXJzIH0gPSBhd2FpdCBpbXBvcnQoJ2V0aGVycycpO1xyXG4gIGNvbnN0IHJhbmRvbVdhbGxldCA9IGV0aGVycy5XYWxsZXQuY3JlYXRlUmFuZG9tKCk7XHJcbiAgZ2VuZXJhdGVkTW5lbW9uaWNNdWx0aSA9IHJhbmRvbVdhbGxldC5tbmVtb25pYy5waHJhc2U7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ211bHRpLW1uZW1vbmljLWRpc3BsYXknKS50ZXh0Q29udGVudCA9IGdlbmVyYXRlZE1uZW1vbmljTXVsdGk7XHJcblxyXG4gIC8vIFNldCB1cCB2ZXJpZmljYXRpb24gKGFzayBmb3IgMyByYW5kb20gd29yZHMgdXNpbmcgY3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIHJhbmRvbSlcclxuICBjb25zdCB3b3JkcyA9IGdlbmVyYXRlZE1uZW1vbmljTXVsdGkuc3BsaXQoJyAnKTtcclxuICBjb25zdCByYW5kb21CeXRlcyA9IG5ldyBVaW50OEFycmF5KDMpO1xyXG4gIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMocmFuZG9tQnl0ZXMpO1xyXG4gIGNvbnN0IGluZGljZXMgPSBbXHJcbiAgICByYW5kb21CeXRlc1swXSAlIDQsIC8vIFdvcmQgMS00XHJcbiAgICA0ICsgKHJhbmRvbUJ5dGVzWzFdICUgNCksIC8vIFdvcmQgNS04XHJcbiAgICA4ICsgKHJhbmRvbUJ5dGVzWzJdICUgNCkgLy8gV29yZCA5LTEyXHJcbiAgXTtcclxuXHJcbiAgdmVyaWZpY2F0aW9uV29yZHNNdWx0aSA9IGluZGljZXMubWFwKGkgPT4gKHsgaW5kZXg6IGksIHdvcmQ6IHdvcmRzW2ldIH0pKTtcclxuXHJcbiAgLy8gVXBkYXRlIFVJIHdpdGggcmFuZG9tIGluZGljZXNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMS1udW0tbXVsdGknKS50ZXh0Q29udGVudCA9ICh2ZXJpZmljYXRpb25Xb3Jkc011bHRpWzBdLmluZGV4ICsgMSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTItbnVtLW11bHRpJykudGV4dENvbnRlbnQgPSAodmVyaWZpY2F0aW9uV29yZHNNdWx0aVsxXS5pbmRleCArIDEpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zLW51bS1tdWx0aScpLnRleHRDb250ZW50ID0gKHZlcmlmaWNhdGlvbldvcmRzTXVsdGlbMl0uaW5kZXggKyAxKTtcclxufVxyXG5cclxuLy8gSGFuZGxlIGNyZWF0ZSBuZXcgd2FsbGV0IChtdWx0aSlcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ3JlYXRlTmV3V2FsbGV0TXVsdGkoKSB7XHJcbiAgY29uc3Qgbmlja25hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtbmV3LXdhbGxldC1uaWNrbmFtZScpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCB2ZXJpZmljYXRpb25FcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZmljYXRpb24tZXJyb3ItbXVsdGknKTtcclxuXHJcbiAgLy8gVmVyaWZ5IHNlZWQgcGhyYXNlIHdvcmRzXHJcbiAgY29uc3Qgd29yZDEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMS1tdWx0aScpLnZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IHdvcmQyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcmlmeS13b3JkLTItbXVsdGknKS52YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICBjb25zdCB3b3JkMyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJpZnktd29yZC0zLW11bHRpJykudmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIGlmICghd29yZDEgfHwgIXdvcmQyIHx8ICF3b3JkMykge1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYudGV4dENvbnRlbnQgPSAnUGxlYXNlIGVudGVyIGFsbCB2ZXJpZmljYXRpb24gd29yZHMgdG8gY29uZmlybSB5b3UgaGF2ZSBiYWNrZWQgdXAgeW91ciBzZWVkIHBocmFzZS4nO1xyXG4gICAgdmVyaWZpY2F0aW9uRXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBpZiAod29yZDEgIT09IHZlcmlmaWNhdGlvbldvcmRzTXVsdGlbMF0ud29yZC50b0xvd2VyQ2FzZSgpIHx8XHJcbiAgICAgIHdvcmQyICE9PSB2ZXJpZmljYXRpb25Xb3Jkc011bHRpWzFdLndvcmQudG9Mb3dlckNhc2UoKSB8fFxyXG4gICAgICB3b3JkMyAhPT0gdmVyaWZpY2F0aW9uV29yZHNNdWx0aVsyXS53b3JkLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgIHZlcmlmaWNhdGlvbkVycm9yRGl2LnRleHRDb250ZW50ID0gJ1ZlcmlmaWNhdGlvbiB3b3JkcyBkbyBub3QgbWF0Y2guIFBsZWFzZSBkb3VibGUtY2hlY2sgeW91ciBzZWVkIHBocmFzZSBiYWNrdXAuJztcclxuICAgIHZlcmlmaWNhdGlvbkVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2xlYXIgdmVyaWZpY2F0aW9uIGVycm9yXHJcbiAgdmVyaWZpY2F0aW9uRXJyb3JEaXYuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIC8vIENsb3NlIG1vZGFsIEJFRk9SRSBzaG93aW5nIHBhc3N3b3JkIHByb21wdFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1jcmVhdGUtd2FsbGV0LW11bHRpJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgc2hvd1Bhc3N3b3JkUHJvbXB0KCdFbnRlciBZb3VyIFBhc3N3b3JkJywgJ0VudGVyIHlvdXIgd2FsbGV0IHBhc3N3b3JkIHRvIGVuY3J5cHQgdGhlIG5ldyB3YWxsZXQnKTtcclxuXHJcbiAgaWYgKCFwYXNzd29yZCkge1xyXG4gICAgLy8gSWYgY2FuY2VsbGVkLCByZW9wZW4gdGhlIG1vZGFsXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtY3JlYXRlLXdhbGxldC1tdWx0aScpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IGFkZFdhbGxldCgnY3JlYXRlJywge30sIHBhc3N3b3JkLCBuaWNrbmFtZSB8fCBudWxsKTtcclxuXHJcbiAgICAvLyBDbGVhciBmb3JtXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtbmV3LXdhbGxldC1uaWNrbmFtZScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMS1tdWx0aScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMi1tdWx0aScpLnZhbHVlID0gJyc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyaWZ5LXdvcmQtMy1tdWx0aScpLnZhbHVlID0gJyc7XHJcbiAgICBnZW5lcmF0ZWRNbmVtb25pY011bHRpID0gbnVsbDtcclxuICAgIHZlcmlmaWNhdGlvbldvcmRzTXVsdGkgPSBbXTtcclxuXHJcbiAgICAvLyBSZWZyZXNoIHdhbGxldCBsaXN0XHJcbiAgICBhd2FpdCByZW5kZXJXYWxsZXRMaXN0KCk7XHJcblxyXG4gICAgYWxlcnQoJ1dhbGxldCBjcmVhdGVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0Vycm9yIGNyZWF0aW5nIHdhbGxldDogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGltcG9ydCBmcm9tIHNlZWQgKG11bHRpKVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVJbXBvcnRTZWVkTXVsdGkoKSB7XHJcbiAgY29uc3Qgbmlja25hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXNlZWQtbmlja25hbWUnKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgbW5lbW9uaWMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LXNlZWQtcGhyYXNlJykudmFsdWUudHJpbSgpO1xyXG4gIGNvbnN0IGVycm9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1zZWVkLWVycm9yLW11bHRpJyk7XHJcblxyXG4gIGVycm9yRGl2LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICBpZiAoIW1uZW1vbmljKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9ICdQbGVhc2UgZW50ZXIgYSBzZWVkIHBocmFzZSc7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIENsb3NlIG1vZGFsIEJFRk9SRSBzaG93aW5nIHBhc3N3b3JkIHByb21wdFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1pbXBvcnQtc2VlZC1tdWx0aScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICBjb25zdCBwYXNzd29yZCA9IGF3YWl0IHNob3dQYXNzd29yZFByb21wdCgnRW50ZXIgWW91ciBQYXNzd29yZCcsICdFbnRlciB5b3VyIHdhbGxldCBwYXNzd29yZCB0byBlbmNyeXB0IHRoZSBpbXBvcnRlZCB3YWxsZXQnKTtcclxuXHJcbiAgaWYgKCFwYXNzd29yZCkge1xyXG4gICAgLy8gSWYgY2FuY2VsbGVkLCByZW9wZW4gdGhlIG1vZGFsXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtaW1wb3J0LXNlZWQtbXVsdGknKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBhZGRXYWxsZXQoJ21uZW1vbmljJywgeyBtbmVtb25pYyB9LCBwYXNzd29yZCwgbmlja25hbWUgfHwgbnVsbCk7XHJcblxyXG4gICAgLy8gQ2xlYXIgZm9ybVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1zZWVkLW5pY2tuYW1lJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtc2VlZC1waHJhc2UnKS52YWx1ZSA9ICcnO1xyXG5cclxuICAgIC8vIFJlZnJlc2ggd2FsbGV0IGxpc3RcclxuICAgIGF3YWl0IHJlbmRlcldhbGxldExpc3QoKTtcclxuXHJcbiAgICBhbGVydCgnV2FsbGV0IGltcG9ydGVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgLy8gU2hvdyBlcnJvciBhbmQgcmVvcGVuIG1vZGFsXHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1pbXBvcnQtc2VlZC1tdWx0aScpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGltcG9ydCBmcm9tIHByaXZhdGUga2V5IChtdWx0aSlcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlSW1wb3J0S2V5TXVsdGkoKSB7XHJcbiAgY29uc3Qgbmlja25hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtaW1wb3J0LWtleS1uaWNrbmFtZScpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCBwcml2YXRlS2V5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LWltcG9ydC1wcml2YXRlLWtleScpLnZhbHVlLnRyaW0oKTtcclxuICBjb25zdCBlcnJvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbXBvcnQta2V5LWVycm9yLW11bHRpJyk7XHJcblxyXG4gIGVycm9yRGl2LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICBpZiAoIXByaXZhdGVLZXkpIHtcclxuICAgIGVycm9yRGl2LnRleHRDb250ZW50ID0gJ1BsZWFzZSBlbnRlciBhIHByaXZhdGUga2V5JztcclxuICAgIGVycm9yRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2xvc2UgbW9kYWwgQkVGT1JFIHNob3dpbmcgcGFzc3dvcmQgcHJvbXB0XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1rZXktbXVsdGknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ0VudGVyIFlvdXIgUGFzc3dvcmQnLCAnRW50ZXIgeW91ciB3YWxsZXQgcGFzc3dvcmQgdG8gZW5jcnlwdCB0aGUgaW1wb3J0ZWQgd2FsbGV0Jyk7XHJcblxyXG4gIGlmICghcGFzc3dvcmQpIHtcclxuICAgIC8vIElmIGNhbmNlbGxlZCwgcmVvcGVuIHRoZSBtb2RhbFxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWltcG9ydC1rZXktbXVsdGknKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBhZGRXYWxsZXQoJ3ByaXZhdGVrZXknLCB7IHByaXZhdGVLZXkgfSwgcGFzc3dvcmQsIG5pY2tuYW1lIHx8IG51bGwpO1xyXG5cclxuICAgIC8vIENsZWFyIGZvcm1cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQta2V5LW5pY2tuYW1lJykudmFsdWUgPSAnJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1pbXBvcnQtcHJpdmF0ZS1rZXknKS52YWx1ZSA9ICcnO1xyXG5cclxuICAgIC8vIFJlZnJlc2ggd2FsbGV0IGxpc3RcclxuICAgIGF3YWl0IHJlbmRlcldhbGxldExpc3QoKTtcclxuXHJcbiAgICBhbGVydCgnV2FsbGV0IGltcG9ydGVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgLy8gU2hvdyBlcnJvciBhbmQgcmVvcGVuIG1vZGFsXHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICBlcnJvckRpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1pbXBvcnQta2V5LW11bHRpJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBTd2l0Y2ggdG8gYSBkaWZmZXJlbnQgd2FsbGV0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVN3aXRjaFdhbGxldCh3YWxsZXRJZCkge1xyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBzZXRBY3RpdmVXYWxsZXQod2FsbGV0SWQpO1xyXG5cclxuICAgIC8vIFJlZnJlc2ggd2FsbGV0IGxpc3QgdG8gc2hvdyBuZXcgYWN0aXZlIHdhbGxldFxyXG4gICAgYXdhaXQgcmVuZGVyV2FsbGV0TGlzdCgpO1xyXG5cclxuICAgIC8vIElmIHdlJ3JlIHVubG9ja2VkLCB1cGRhdGUgdGhlIGRhc2hib2FyZFxyXG4gICAgaWYgKGN1cnJlbnRTdGF0ZS5pc1VubG9ja2VkKSB7XHJcbiAgICAgIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgICBjdXJyZW50U3RhdGUuYWRkcmVzcyA9IHdhbGxldC5hZGRyZXNzO1xyXG4gICAgICB1cGRhdGVEYXNoYm9hcmQoKTtcclxuICAgIH1cclxuXHJcbiAgICBhbGVydCgnU3dpdGNoZWQgdG8gd2FsbGV0IHN1Y2Nlc3NmdWxseSEnKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0Vycm9yIHN3aXRjaGluZyB3YWxsZXQ6ICcgKyBlcnJvci5tZXNzYWdlKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFNob3cgcmVuYW1lIHdhbGxldCBwcm9tcHRcclxuZnVuY3Rpb24gaGFuZGxlUmVuYW1lV2FsbGV0UHJvbXB0KHdhbGxldElkLCBjdXJyZW50Tmlja25hbWUpIHtcclxuICBjdXJyZW50UmVuYW1lV2FsbGV0SWQgPSB3YWxsZXRJZDtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtcmVuYW1lLXdhbGxldC1uaWNrbmFtZScpLnZhbHVlID0gY3VycmVudE5pY2tuYW1lIHx8ICcnO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1yZW5hbWUtd2FsbGV0JykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbn1cclxuXHJcbi8vIENvbmZpcm0gcmVuYW1lIHdhbGxldFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVSZW5hbWVXYWxsZXRDb25maXJtKCkge1xyXG4gIGNvbnN0IG5ld05pY2tuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0LXJlbmFtZS13YWxsZXQtbmlja25hbWUnKS52YWx1ZS50cmltKCk7XHJcbiAgY29uc3QgZXJyb3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVuYW1lLWVycm9yJyk7XHJcblxyXG4gIGVycm9yRGl2LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICBpZiAoIW5ld05pY2tuYW1lKSB7XHJcbiAgICBlcnJvckRpdi50ZXh0Q29udGVudCA9ICdOaWNrbmFtZSBjYW5ub3QgYmUgZW1wdHknO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgYXdhaXQgcmVuYW1lV2FsbGV0KGN1cnJlbnRSZW5hbWVXYWxsZXRJZCwgbmV3Tmlja25hbWUpO1xyXG5cclxuICAgIC8vIENsb3NlIG1vZGFsXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtcmVuYW1lLXdhbGxldCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgY3VycmVudFJlbmFtZVdhbGxldElkID0gbnVsbDtcclxuXHJcbiAgICAvLyBSZWZyZXNoIHdhbGxldCBsaXN0XHJcbiAgICBhd2FpdCByZW5kZXJXYWxsZXRMaXN0KCk7XHJcblxyXG4gICAgYWxlcnQoJ1dhbGxldCByZW5hbWVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgZXJyb3JEaXYudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgZXJyb3JEaXYuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBEZWxldGUgYSBzcGVjaWZpYyB3YWxsZXRcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlRGVsZXRlV2FsbGV0TXVsdGkod2FsbGV0SWQpIHtcclxuICBjb25zdCBjb25maXJtZWQgPSBjb25maXJtKFxyXG4gICAgJ+KaoO+4jyBXQVJOSU5HIOKaoO+4j1xcblxcbicgK1xyXG4gICAgJ1lvdSBhcmUgYWJvdXQgdG8gREVMRVRFIHRoaXMgd2FsbGV0IVxcblxcbicgK1xyXG4gICAgJ1RoaXMgYWN0aW9uIGlzIFBFUk1BTkVOVCBhbmQgQ0FOTk9UIGJlIHVuZG9uZS5cXG5cXG4nICtcclxuICAgICdNYWtlIHN1cmUgeW91IGhhdmUgd3JpdHRlbiBkb3duIHlvdXIgc2VlZCBwaHJhc2Ugb3IgcHJpdmF0ZSBrZXkuXFxuXFxuJyArXHJcbiAgICAnRG8geW91IHdhbnQgdG8gY29udGludWU/J1xyXG4gICk7XHJcblxyXG4gIGlmICghY29uZmlybWVkKSByZXR1cm47XHJcblxyXG4gIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgc2hvd1Bhc3N3b3JkUHJvbXB0KCdEZWxldGUgV2FsbGV0JywgJ0VudGVyIHlvdXIgcGFzc3dvcmQgdG8gZGVsZXRlIHRoaXMgd2FsbGV0Jyk7XHJcblxyXG4gIGlmICghcGFzc3dvcmQpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IGRlbGV0ZVdhbGxldCh3YWxsZXRJZCwgcGFzc3dvcmQpO1xyXG4gICAgY2xvc2VQYXNzd29yZFByb21wdCgpO1xyXG5cclxuICAgIC8vIFJlZnJlc2ggd2FsbGV0IGxpc3RcclxuICAgIGF3YWl0IHJlbmRlcldhbGxldExpc3QoKTtcclxuXHJcbiAgICAvLyBJZiB3ZSBkZWxldGVkIGFsbCB3YWxsZXRzLCBnbyBiYWNrIHRvIHNldHVwXHJcbiAgICBjb25zdCB3YWxsZXRzRGF0YSA9IGF3YWl0IGdldEFsbFdhbGxldHMoKTtcclxuICAgIGlmICh3YWxsZXRzRGF0YS53YWxsZXRMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBjdXJyZW50U3RhdGUuaXNVbmxvY2tlZCA9IGZhbHNlO1xyXG4gICAgICBjdXJyZW50U3RhdGUuYWRkcmVzcyA9IG51bGw7XHJcbiAgICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1zZXR1cCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGFsZXJ0KCdXYWxsZXQgZGVsZXRlZCBzdWNjZXNzZnVsbHkhJyk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGFsZXJ0KCdFcnJvciBkZWxldGluZyB3YWxsZXQ6ICcgKyBlcnJvci5tZXNzYWdlKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEV4cG9ydCBzZWVkL2tleSBmb3IgYSBzcGVjaWZpYyB3YWxsZXRcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlRXhwb3J0Rm9yV2FsbGV0KHdhbGxldElkKSB7XHJcbiAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ0V4cG9ydCBXYWxsZXQnLCAnRW50ZXIgeW91ciBwYXNzd29yZCB0byBleHBvcnQgd2FsbGV0IHNlY3JldHMnKTtcclxuXHJcbiAgaWYgKCFwYXNzd29yZCkgcmV0dXJuO1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gVHJ5IHRvIGdldCBtbmVtb25pYyBmaXJzdFxyXG4gICAgY29uc3QgbW5lbW9uaWMgPSBhd2FpdCBleHBvcnRNbmVtb25pY0ZvcldhbGxldCh3YWxsZXRJZCwgcGFzc3dvcmQpO1xyXG5cclxuICAgIGlmIChtbmVtb25pYykge1xyXG4gICAgICBzaG93U2VjcmV0TW9kYWwoJ1NlZWQgUGhyYXNlJywgbW5lbW9uaWMpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gTm8gbW5lbW9uaWMsIHNob3cgcHJpdmF0ZSBrZXlcclxuICAgICAgY29uc3QgcHJpdmF0ZUtleSA9IGF3YWl0IGV4cG9ydFByaXZhdGVLZXlGb3JXYWxsZXQod2FsbGV0SWQsIHBhc3N3b3JkKTtcclxuICAgICAgc2hvd1NlY3JldE1vZGFsKCdQcml2YXRlIEtleScsIHByaXZhdGVLZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlUGFzc3dvcmRQcm9tcHQoKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0Vycm9yIGV4cG9ydGluZyB3YWxsZXQ6ICcgKyBlcnJvci5tZXNzYWdlKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IENPTk5FQ1RJT04gQVBQUk9WQUwgPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ29ubmVjdGlvbkFwcHJvdmFsU2NyZWVuKG9yaWdpbiwgcmVxdWVzdElkKSB7XHJcbiAgLy8gTG9hZCBzZXR0aW5ncyBmb3IgdGhlbWVcclxuICBhd2FpdCBsb2FkU2V0dGluZ3MoKTtcclxuICBhcHBseVRoZW1lKCk7XHJcblxyXG4gIC8vIERpc3BsYXkgdGhlIG9yaWdpblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb25uZWN0aW9uLXNpdGUtb3JpZ2luJykudGV4dENvbnRlbnQgPSBvcmlnaW47XHJcblxyXG4gIC8vIEdldCBhY3RpdmUgd2FsbGV0IGFkZHJlc3NcclxuICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICBpZiAod2FsbGV0ICYmIHdhbGxldC5hZGRyZXNzKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29ubmVjdGlvbi13YWxsZXQtYWRkcmVzcycpLnRleHRDb250ZW50ID0gd2FsbGV0LmFkZHJlc3M7XHJcbiAgfSBlbHNlIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb25uZWN0aW9uLXdhbGxldC1hZGRyZXNzJykudGV4dENvbnRlbnQgPSAnTm8gd2FsbGV0IGZvdW5kJztcclxuICB9XHJcblxyXG4gIC8vIFNob3cgdGhlIGNvbm5lY3Rpb24gYXBwcm92YWwgc2NyZWVuXHJcbiAgc2hvd1NjcmVlbignc2NyZWVuLWNvbm5lY3Rpb24tYXBwcm92YWwnKTtcclxuXHJcbiAgLy8gU2V0dXAgYXBwcm92ZSBidXR0b25cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWFwcHJvdmUtY29ubmVjdGlvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgIHR5cGU6ICdDT05ORUNUSU9OX0FQUFJPVkFMJyxcclxuICAgICAgICByZXF1ZXN0SWQsXHJcbiAgICAgICAgYXBwcm92ZWQ6IHRydWVcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBDbG9zZSB0aGUgcG9wdXAgd2luZG93XHJcbiAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgYWxlcnQoJ0Vycm9yIGFwcHJvdmluZyBjb25uZWN0aW9uOiAnICsgc2FuaXRpemVFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIC8vIFNldHVwIHJlamVjdCBidXR0b25cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlamVjdC1jb25uZWN0aW9uJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogJ0NPTk5FQ1RJT05fQVBQUk9WQUwnLFxyXG4gICAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgICBhcHByb3ZlZDogZmFsc2VcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBDbG9zZSB0aGUgcG9wdXAgd2luZG93XHJcbiAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgYWxlcnQoJ0Vycm9yIHJlamVjdGluZyBjb25uZWN0aW9uOiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG4vLyA9PT09PSBUUkFOU0FDVElPTiBBUFBST1ZBTCA9PT09PVxyXG4vLyBQb3B1bGF0ZSBnYXMgcHJpY2Ugb3B0aW9uc1xyXG5hc3luYyBmdW5jdGlvbiBwb3B1bGF0ZUdhc1ByaWNlcyhuZXR3b3JrLCB0eFJlcXVlc3QsIHN5bWJvbCkge1xyXG4gIC8vIFN0b3JlIHBhcmFtcyBmb3IgcmVmcmVzaCBidXR0b25cclxuICBnYXNQcmljZVJlZnJlc2hTdGF0ZS5hcHByb3ZhbCA9IHsgbmV0d29yaywgdHhSZXF1ZXN0LCBzeW1ib2wgfTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIEZldGNoIFNBRkUgZ2FzIHByaWNlIGZyb20gUlBDICh1c2VzIGJhc2UgZmVlICogMiB0byBwcmV2ZW50IHN0dWNrIHRyYW5zYWN0aW9ucylcclxuICAgIGNvbnN0IGdhc1ByaWNlSGV4ID0gYXdhaXQgcnBjLmdldFNhZmVHYXNQcmljZShuZXR3b3JrKTtcclxuICAgIGNvbnN0IGdhc1ByaWNlV2VpID0gQmlnSW50KGdhc1ByaWNlSGV4KTtcclxuICAgIGNvbnN0IGdhc1ByaWNlR3dlaSA9IE51bWJlcihnYXNQcmljZVdlaSkgLyAxZTk7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHNsb3cgKDkwJSksIG5vcm1hbCAoMTAwJSksIGZhc3QgKDEyMCUpXHJcbiAgICAvLyBOb3RlOiBzbG93IGlzIDkwJSBpbnN0ZWFkIG9mIDgwJSB0byBlbnN1cmUgaXQncyBzdGlsbCBhYm92ZSBiYXNlIGZlZVxyXG4gICAgY29uc3Qgc2xvd0d3ZWkgPSAoZ2FzUHJpY2VHd2VpICogMC45KS50b0ZpeGVkKDIpO1xyXG4gICAgY29uc3Qgbm9ybWFsR3dlaSA9IGdhc1ByaWNlR3dlaS50b0ZpeGVkKDIpO1xyXG4gICAgY29uc3QgZmFzdEd3ZWkgPSAoZ2FzUHJpY2VHd2VpICogMS4yKS50b0ZpeGVkKDIpO1xyXG5cclxuICAgIC8vIFVwZGF0ZSBVSVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhcy1zbG93LXByaWNlJykudGV4dENvbnRlbnQgPSBgJHtzbG93R3dlaX0gR3dlaWA7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FzLW5vcm1hbC1wcmljZScpLnRleHRDb250ZW50ID0gYCR7bm9ybWFsR3dlaX0gR3dlaWA7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FzLWZhc3QtcHJpY2UnKS50ZXh0Q29udGVudCA9IGAke2Zhc3RHd2VpfSBHd2VpYDtcclxuXHJcbiAgICAvLyBFc3RpbWF0ZSBnYXMgZm9yIHRoZSB0cmFuc2FjdGlvblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZXN0aW1hdGVkR2FzSGV4ID0gYXdhaXQgcnBjLmVzdGltYXRlR2FzKG5ldHdvcmssIHR4UmVxdWVzdCk7XHJcbiAgICAgIGNvbnN0IGVzdGltYXRlZEdhcyA9IEJpZ0ludChlc3RpbWF0ZWRHYXNIZXgpO1xyXG5cclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWVzdGltYXRlZC1nYXMnKS50ZXh0Q29udGVudCA9IGVzdGltYXRlZEdhcy50b1N0cmluZygpO1xyXG5cclxuICAgICAgLy8gQ2FsY3VsYXRlIG1heCBmZWUgYmFzZWQgb24gbm9ybWFsIGdhcyBwcmljZVxyXG4gICAgICBjb25zdCBtYXhGZWVXZWkgPSBlc3RpbWF0ZWRHYXMgKiBnYXNQcmljZVdlaTtcclxuICAgICAgY29uc3QgbWF4RmVlRXRoID0gZXRoZXJzLmZvcm1hdEV0aGVyKG1heEZlZVdlaS50b1N0cmluZygpKTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LW1heC1mZWUnKS50ZXh0Q29udGVudCA9IGAke3BhcnNlRmxvYXQobWF4RmVlRXRoKS50b0ZpeGVkKDgpfSAke3N5bWJvbH1gO1xyXG5cclxuICAgICAgLy8gVXBkYXRlIG1heCBmZWUgd2hlbiBnYXMgcHJpY2Ugc2VsZWN0aW9uIGNoYW5nZXNcclxuICAgICAgY29uc3QgdXBkYXRlTWF4RmVlID0gKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkU3BlZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiZ2FzLXNwZWVkXCJdOmNoZWNrZWQnKT8udmFsdWU7XHJcbiAgICAgICAgbGV0IHNlbGVjdGVkR3dlaTtcclxuXHJcbiAgICAgICAgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdzbG93Jykge1xyXG4gICAgICAgICAgc2VsZWN0ZWRHd2VpID0gcGFyc2VGbG9hdChzbG93R3dlaSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RlZFNwZWVkID09PSAnbm9ybWFsJykge1xyXG4gICAgICAgICAgc2VsZWN0ZWRHd2VpID0gcGFyc2VGbG9hdChub3JtYWxHd2VpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdmYXN0Jykge1xyXG4gICAgICAgICAgc2VsZWN0ZWRHd2VpID0gcGFyc2VGbG9hdChmYXN0R3dlaSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RlZFNwZWVkID09PSAnY3VzdG9tJykge1xyXG4gICAgICAgICAgc2VsZWN0ZWRHd2VpID0gcGFyc2VGbG9hdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VzdG9tLWdhcy1wcmljZScpLnZhbHVlKSB8fCBwYXJzZUZsb2F0KG5vcm1hbEd3ZWkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KG5vcm1hbEd3ZWkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRHYXNQcmljZVdlaSA9IEJpZ0ludChNYXRoLmZsb29yKHNlbGVjdGVkR3dlaSAqIDFlOSkpO1xyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkTWF4RmVlV2VpID0gZXN0aW1hdGVkR2FzICogc2VsZWN0ZWRHYXNQcmljZVdlaTtcclxuICAgICAgICBjb25zdCBzZWxlY3RlZE1heEZlZUV0aCA9IGV0aGVycy5mb3JtYXRFdGhlcihzZWxlY3RlZE1heEZlZVdlaS50b1N0cmluZygpKTtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtbWF4LWZlZScpLnRleHRDb250ZW50ID0gYCR7cGFyc2VGbG9hdChzZWxlY3RlZE1heEZlZUV0aCkudG9GaXhlZCg4KX0gJHtzeW1ib2x9YDtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGdhcyBwcmljZSBjaGFuZ2VzXHJcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W25hbWU9XCJnYXMtc3BlZWRcIl0nKS5mb3JFYWNoKHJhZGlvID0+IHtcclxuICAgICAgICByYWRpby5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XHJcbiAgICAgICAgICB1cGRhdGVNYXhGZWUoKTtcclxuXHJcbiAgICAgICAgICAvLyBVcGRhdGUgdmlzdWFsIGhpZ2hsaWdodGluZyBmb3IgYWxsIGdhcyBvcHRpb25zXHJcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FzLW9wdGlvbicpLmZvckVhY2gobGFiZWwgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnB1dCA9IGxhYmVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJnYXMtc3BlZWRcIl0nKTtcclxuICAgICAgICAgICAgaWYgKGlucHV0ICYmIGlucHV0LmNoZWNrZWQpIHtcclxuICAgICAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJDb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1zdWNjZXNzKSc7XHJcbiAgICAgICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyV2lkdGggPSAnMnB4JztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJDb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1ib3JkZXIpJztcclxuICAgICAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJXaWR0aCA9ICcxcHgnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAvLyBTaG93L2hpZGUgY3VzdG9tIGlucHV0IGJhc2VkIG9uIHNlbGVjdGlvblxyXG4gICAgICAgICAgY29uc3QgY3VzdG9tQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N1c3RvbS1nYXMtaW5wdXQtY29udGFpbmVyJyk7XHJcbiAgICAgICAgICBpZiAocmFkaW8udmFsdWUgPT09ICdjdXN0b20nICYmIHJhZGlvLmNoZWNrZWQpIHtcclxuICAgICAgICAgICAgY3VzdG9tQ29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICAvLyBGb2N1cyB0aGUgaW5wdXQgd2hlbiBjdXN0b20gaXMgc2VsZWN0ZWRcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWN1c3RvbS1nYXMtcHJpY2UnKS5mb2N1cygpO1xyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChjdXN0b21Db250YWluZXIpIHtcclxuICAgICAgICAgICAgY3VzdG9tQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIEluaXRpYWxpemUgdGhlIHNlbGVjdGVkIGJvcmRlciAoTm9ybWFsIGlzIGNoZWNrZWQgYnkgZGVmYXVsdClcclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmdhcy1vcHRpb24nKS5mb3JFYWNoKGxhYmVsID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IGxhYmVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJnYXMtc3BlZWRcIl0nKTtcclxuICAgICAgICBpZiAoaW5wdXQgJiYgaW5wdXQuY2hlY2tlZCkge1xyXG4gICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyQ29sb3IgPSAndmFyKC0tdGVybWluYWwtc3VjY2VzcyknO1xyXG4gICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyV2lkdGggPSAnMnB4JztcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQXV0by1zZWxlY3QgY3VzdG9tIHJhZGlvIHdoZW4gdHlwaW5nIGluIGN1c3RvbSBnYXMgcHJpY2VcclxuICAgICAgY29uc3QgY3VzdG9tR2FzSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VzdG9tLWdhcy1wcmljZScpO1xyXG4gICAgICBjdXN0b21HYXNJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FzLWN1c3RvbS1yYWRpbycpLmNoZWNrZWQgPSB0cnVlO1xyXG4gICAgICAgIHVwZGF0ZU1heEZlZSgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICB9IGNhdGNoIChnYXNFc3RpbWF0ZUVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGVzdGltYXRpbmcgZ2FzOicsIGdhc0VzdGltYXRlRXJyb3IpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZXN0aW1hdGVkLWdhcycpLnRleHRDb250ZW50ID0gJzIxMDAwIChkZWZhdWx0KSc7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1tYXgtZmVlJykudGV4dENvbnRlbnQgPSAnVW5hYmxlIHRvIGVzdGltYXRlJztcclxuICAgIH1cclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FzLXNsb3ctcHJpY2UnKS50ZXh0Q29udGVudCA9ICdFcnJvcic7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FzLW5vcm1hbC1wcmljZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYXMtZmFzdC1wcmljZScpLnRleHRDb250ZW50ID0gJ0Vycm9yJztcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCBzZWxlY3RlZCBnYXMgcHJpY2UgaW4gd2VpXHJcbmZ1bmN0aW9uIGdldFNlbGVjdGVkR2FzUHJpY2UoKSB7XHJcbiAgY29uc3Qgc2VsZWN0ZWRTcGVlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJnYXMtc3BlZWRcIl06Y2hlY2tlZCcpPy52YWx1ZTtcclxuXHJcbiAgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdjdXN0b20nKSB7XHJcbiAgICBjb25zdCBjdXN0b21Hd2VpID0gcGFyc2VGbG9hdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VzdG9tLWdhcy1wcmljZScpLnZhbHVlKTtcclxuICAgIGlmIChjdXN0b21Hd2VpICYmIGN1c3RvbUd3ZWkgPiAwKSB7XHJcbiAgICAgIC8vIENvbnZlcnQgR3dlaSB0byBXZWkgKG11bHRpcGx5IGJ5IDFlOSlcclxuICAgICAgcmV0dXJuIGV0aGVycy5wYXJzZVVuaXRzKGN1c3RvbUd3ZWkudG9TdHJpbmcoKSwgJ2d3ZWknKS50b1N0cmluZygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gR2V0IHRoZSBkaXNwbGF5ZWQgR3dlaSB2YWx1ZSBhbmQgY29udmVydCB0byB3ZWlcclxuICBsZXQgZ3dlaVRleHQ7XHJcbiAgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdzbG93Jykge1xyXG4gICAgZ3dlaVRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FzLXNsb3ctcHJpY2UnKS50ZXh0Q29udGVudDtcclxuICB9IGVsc2UgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdmYXN0Jykge1xyXG4gICAgZ3dlaVRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FzLWZhc3QtcHJpY2UnKS50ZXh0Q29udGVudDtcclxuICB9IGVsc2Uge1xyXG4gICAgZ3dlaVRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FzLW5vcm1hbC1wcmljZScpLnRleHRDb250ZW50O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZ3dlaSA9IHBhcnNlRmxvYXQoZ3dlaVRleHQpO1xyXG4gIGlmIChnd2VpICYmIGd3ZWkgPiAwKSB7XHJcbiAgICByZXR1cm4gZXRoZXJzLnBhcnNlVW5pdHMoZ3dlaS50b1N0cmluZygpLCAnZ3dlaScpLnRvU3RyaW5nKCk7XHJcbiAgfVxyXG5cclxuICAvLyBJZiBhbGwgZWxzZSBmYWlscywgcmV0dXJuIG51bGwgdG8gdXNlIGRlZmF1bHRcclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuLy8gRmV0Y2ggYW5kIGRpc3BsYXkgY3VycmVudCBub25jZSBmb3IgdHJhbnNhY3Rpb25cclxuYXN5bmMgZnVuY3Rpb24gZmV0Y2hBbmREaXNwbGF5Tm9uY2UoYWRkcmVzcywgbmV0d29yaykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBub25jZUhleCA9IGF3YWl0IHJwYy5nZXRUcmFuc2FjdGlvbkNvdW50KG5ldHdvcmssIGFkZHJlc3MsICdwZW5kaW5nJyk7XHJcbiAgICBjb25zdCBub25jZSA9IHBhcnNlSW50KG5vbmNlSGV4LCAxNik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VycmVudC1ub25jZScpLnRleHRDb250ZW50ID0gbm9uY2U7XHJcbiAgICAvLyBDdXJyZW50IG5vbmNlIGZldGNoZWRcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgbm9uY2U6JywgZXJyb3IpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWN1cnJlbnQtbm9uY2UnKS50ZXh0Q29udGVudCA9ICdFcnJvcic7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBTRU5EIFNDUkVFTiBHQVMgUFJJQ0UgSEVMUEVSUyA9PT09PVxyXG5cclxuLy8gUG9wdWxhdGUgZ2FzIHByaWNlcyBmb3IgU2VuZCBzY3JlZW5cclxuYXN5bmMgZnVuY3Rpb24gcG9wdWxhdGVTZW5kR2FzUHJpY2VzKG5ldHdvcmssIHR4UmVxdWVzdCwgc3ltYm9sKSB7XHJcbiAgLy8gU3RvcmUgcGFyYW1zIGZvciByZWZyZXNoIGJ1dHRvblxyXG4gIGdhc1ByaWNlUmVmcmVzaFN0YXRlLnNlbmQgPSB7IG5ldHdvcmssIHR4UmVxdWVzdCwgc3ltYm9sIH07XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBVc2Ugc2FmZSBnYXMgcHJpY2UgdG8gcHJldmVudCBzdHVjayB0cmFuc2FjdGlvbnNcclxuICAgIGNvbnN0IGdhc1ByaWNlSGV4ID0gYXdhaXQgcnBjLmdldFNhZmVHYXNQcmljZShuZXR3b3JrKTtcclxuICAgIGNvbnN0IGdhc1ByaWNlV2VpID0gQmlnSW50KGdhc1ByaWNlSGV4KTtcclxuICAgIGNvbnN0IGdhc1ByaWNlR3dlaSA9IE51bWJlcihnYXNQcmljZVdlaSkgLyAxZTk7XHJcblxyXG4gICAgY29uc3Qgc2xvd0d3ZWkgPSAoZ2FzUHJpY2VHd2VpICogMC45KS50b0ZpeGVkKDIpO1xyXG4gICAgY29uc3Qgbm9ybWFsR3dlaSA9IGdhc1ByaWNlR3dlaS50b0ZpeGVkKDIpO1xyXG4gICAgY29uc3QgZmFzdEd3ZWkgPSAoZ2FzUHJpY2VHd2VpICogMS4yKS50b0ZpeGVkKDIpO1xyXG5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWdhcy1zbG93LXByaWNlJykudGV4dENvbnRlbnQgPSBgJHtzbG93R3dlaX0gR3dlaWA7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1nYXMtbm9ybWFsLXByaWNlJykudGV4dENvbnRlbnQgPSBgJHtub3JtYWxHd2VpfSBHd2VpYDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWdhcy1mYXN0LXByaWNlJykudGV4dENvbnRlbnQgPSBgJHtmYXN0R3dlaX0gR3dlaWA7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZXN0aW1hdGVkR2FzSGV4ID0gYXdhaXQgcnBjLmVzdGltYXRlR2FzKG5ldHdvcmssIHR4UmVxdWVzdCk7XHJcbiAgICAgIGNvbnN0IGVzdGltYXRlZEdhcyA9IEJpZ0ludChlc3RpbWF0ZWRHYXNIZXgpO1xyXG5cclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtZXN0aW1hdGVkLWdhcycpLnRleHRDb250ZW50ID0gZXN0aW1hdGVkR2FzLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICBjb25zdCBtYXhGZWVXZWkgPSBlc3RpbWF0ZWRHYXMgKiBnYXNQcmljZVdlaTtcclxuICAgICAgY29uc3QgbWF4RmVlRXRoID0gZXRoZXJzLmZvcm1hdEV0aGVyKG1heEZlZVdlaS50b1N0cmluZygpKTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtbWF4LWZlZScpLnRleHRDb250ZW50ID0gYCR7cGFyc2VGbG9hdChtYXhGZWVFdGgpLnRvRml4ZWQoOCl9ICR7c3ltYm9sfWA7XHJcblxyXG4gICAgICBjb25zdCB1cGRhdGVNYXhGZWUgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRTcGVlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJzZW5kLWdhcy1zcGVlZFwiXTpjaGVja2VkJyk/LnZhbHVlO1xyXG4gICAgICAgIGxldCBzZWxlY3RlZEd3ZWk7XHJcblxyXG4gICAgICAgIGlmIChzZWxlY3RlZFNwZWVkID09PSAnc2xvdycpIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQoc2xvd0d3ZWkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ25vcm1hbCcpIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQobm9ybWFsR3dlaSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RlZFNwZWVkID09PSAnZmFzdCcpIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQoZmFzdEd3ZWkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2N1c3RvbScpIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtY3VzdG9tLWdhcy1wcmljZScpLnZhbHVlKSB8fCBwYXJzZUZsb2F0KG5vcm1hbEd3ZWkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KG5vcm1hbEd3ZWkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRHYXNQcmljZVdlaSA9IEJpZ0ludChNYXRoLmZsb29yKHNlbGVjdGVkR3dlaSAqIDFlOSkpO1xyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkTWF4RmVlV2VpID0gZXN0aW1hdGVkR2FzICogc2VsZWN0ZWRHYXNQcmljZVdlaTtcclxuICAgICAgICBjb25zdCBzZWxlY3RlZE1heEZlZUV0aCA9IGV0aGVycy5mb3JtYXRFdGhlcihzZWxlY3RlZE1heEZlZVdlaS50b1N0cmluZygpKTtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1tYXgtZmVlJykudGV4dENvbnRlbnQgPSBgJHtwYXJzZUZsb2F0KHNlbGVjdGVkTWF4RmVlRXRoKS50b0ZpeGVkKDgpfSAke3N5bWJvbH1gO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbbmFtZT1cInNlbmQtZ2FzLXNwZWVkXCJdJykuZm9yRWFjaChyYWRpbyA9PiB7XHJcbiAgICAgICAgcmFkaW8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xyXG4gICAgICAgICAgdXBkYXRlTWF4RmVlKCk7XHJcblxyXG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmdhcy1vcHRpb24nKS5mb3JFYWNoKGxhYmVsID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaW5wdXQgPSBsYWJlbC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwic2VuZC1nYXMtc3BlZWRcIl0nKTtcclxuICAgICAgICAgICAgaWYgKGlucHV0ICYmIGlucHV0LmNoZWNrZWQpIHtcclxuICAgICAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJDb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1zdWNjZXNzKSc7XHJcbiAgICAgICAgICAgICAgbGFiZWwuc3R5bGUuYm9yZGVyV2lkdGggPSAnMnB4JztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJDb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1ib3JkZXIpJztcclxuICAgICAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJXaWR0aCA9ICcxcHgnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBjb25zdCBjdXN0b21Db250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1jdXN0b20tZ2FzLWlucHV0LWNvbnRhaW5lcicpO1xyXG4gICAgICAgICAgaWYgKHJhZGlvLnZhbHVlID09PSAnY3VzdG9tJyAmJiByYWRpby5jaGVja2VkKSB7XHJcbiAgICAgICAgICAgIGN1c3RvbUNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtY3VzdG9tLWdhcy1wcmljZScpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGN1c3RvbUNvbnRhaW5lcikge1xyXG4gICAgICAgICAgICBjdXN0b21Db250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmdhcy1vcHRpb24nKS5mb3JFYWNoKGxhYmVsID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IGxhYmVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJzZW5kLWdhcy1zcGVlZFwiXScpO1xyXG4gICAgICAgIGlmIChpbnB1dCAmJiBpbnB1dC5jaGVja2VkKSB7XHJcbiAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJDb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1zdWNjZXNzKSc7XHJcbiAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJXaWR0aCA9ICcycHgnO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb25zdCBjdXN0b21HYXNJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWN1c3RvbS1nYXMtcHJpY2UnKTtcclxuICAgICAgY3VzdG9tR2FzSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtZ2FzLWN1c3RvbS1yYWRpbycpLmNoZWNrZWQgPSB0cnVlO1xyXG4gICAgICAgIHVwZGF0ZU1heEZlZSgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICB9IGNhdGNoIChnYXNFc3RpbWF0ZUVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGVzdGltYXRpbmcgZ2FzOicsIGdhc0VzdGltYXRlRXJyb3IpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1lc3RpbWF0ZWQtZ2FzJykudGV4dENvbnRlbnQgPSAnMjEwMDAgKGRlZmF1bHQpJztcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtbWF4LWZlZScpLnRleHRDb250ZW50ID0gJ1VuYWJsZSB0byBlc3RpbWF0ZSc7XHJcbiAgICB9XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBnYXMgcHJpY2U6JywgZXJyb3IpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtZ2FzLXNsb3ctcHJpY2UnKS50ZXh0Q29udGVudCA9ICdFcnJvcic7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1nYXMtbm9ybWFsLXByaWNlJykudGV4dENvbnRlbnQgPSAnRXJyb3InO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtZ2FzLWZhc3QtcHJpY2UnKS50ZXh0Q29udGVudCA9ICdFcnJvcic7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgc2VsZWN0ZWQgZ2FzIHByaWNlIGZyb20gU2VuZCBzY3JlZW5cclxuZnVuY3Rpb24gZ2V0U2VsZWN0ZWRTZW5kR2FzUHJpY2UoKSB7XHJcbiAgY29uc3Qgc2VsZWN0ZWRTcGVlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJzZW5kLWdhcy1zcGVlZFwiXTpjaGVja2VkJyk/LnZhbHVlO1xyXG5cclxuICBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2N1c3RvbScpIHtcclxuICAgIGNvbnN0IGN1c3RvbUd3ZWkgPSBwYXJzZUZsb2F0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWN1c3RvbS1nYXMtcHJpY2UnKS52YWx1ZSk7XHJcbiAgICBpZiAoY3VzdG9tR3dlaSAmJiBjdXN0b21Hd2VpID4gMCkge1xyXG4gICAgICByZXR1cm4gZXRoZXJzLnBhcnNlVW5pdHMoY3VzdG9tR3dlaS50b1N0cmluZygpLCAnZ3dlaScpLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBsZXQgZ3dlaVRleHQ7XHJcbiAgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdzbG93Jykge1xyXG4gICAgZ3dlaVRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1nYXMtc2xvdy1wcmljZScpLnRleHRDb250ZW50O1xyXG4gIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2Zhc3QnKSB7XHJcbiAgICBnd2VpVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZW5kLWdhcy1mYXN0LXByaWNlJykudGV4dENvbnRlbnQ7XHJcbiAgfSBlbHNlIHtcclxuICAgIGd3ZWlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtZ2FzLW5vcm1hbC1wcmljZScpLnRleHRDb250ZW50O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZ3dlaSA9IHBhcnNlRmxvYXQoZ3dlaVRleHQpO1xyXG4gIGlmIChnd2VpICYmIGd3ZWkgPiAwKSB7XHJcbiAgICByZXR1cm4gZXRoZXJzLnBhcnNlVW5pdHMoZ3dlaS50b1N0cmluZygpLCAnZ3dlaScpLnRvU3RyaW5nKCk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuLy8gUG9wdWxhdGUgZ2FzIHByaWNlcyBmb3IgVG9rZW4gU2VuZFxyXG5hc3luYyBmdW5jdGlvbiBwb3B1bGF0ZVRva2VuR2FzUHJpY2VzKG5ldHdvcmssIHR4UmVxdWVzdCwgc3ltYm9sKSB7XHJcbiAgLy8gU3RvcmUgcGFyYW1zIGZvciByZWZyZXNoIGJ1dHRvblxyXG4gIGdhc1ByaWNlUmVmcmVzaFN0YXRlLnRva2VuID0geyBuZXR3b3JrLCB0eFJlcXVlc3QsIHN5bWJvbCB9O1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gVXNlIHNhZmUgZ2FzIHByaWNlIHRvIHByZXZlbnQgc3R1Y2sgdHJhbnNhY3Rpb25zXHJcbiAgICBjb25zdCBnYXNQcmljZUhleCA9IGF3YWl0IHJwYy5nZXRTYWZlR2FzUHJpY2UobmV0d29yayk7XHJcbiAgICBjb25zdCBnYXNQcmljZVdlaSA9IEJpZ0ludChnYXNQcmljZUhleCk7XHJcbiAgICBjb25zdCBnYXNQcmljZUd3ZWkgPSBOdW1iZXIoZ2FzUHJpY2VXZWkpIC8gMWU5O1xyXG5cclxuICAgIGNvbnN0IHNsb3dHd2VpID0gKGdhc1ByaWNlR3dlaSAqIDAuOSkudG9GaXhlZCgyKTtcclxuICAgIGNvbnN0IG5vcm1hbEd3ZWkgPSBnYXNQcmljZUd3ZWkudG9GaXhlZCgyKTtcclxuICAgIGNvbnN0IGZhc3RHd2VpID0gKGdhc1ByaWNlR3dlaSAqIDEuMikudG9GaXhlZCgyKTtcclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZ2FzLXNsb3ctcHJpY2UnKS50ZXh0Q29udGVudCA9IGAke3Nsb3dHd2VpfSBHd2VpYDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1nYXMtbm9ybWFsLXByaWNlJykudGV4dENvbnRlbnQgPSBgJHtub3JtYWxHd2VpfSBHd2VpYDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1nYXMtZmFzdC1wcmljZScpLnRleHRDb250ZW50ID0gYCR7ZmFzdEd3ZWl9IEd3ZWlgO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGVzdGltYXRlZEdhc0hleCA9IGF3YWl0IHJwYy5lc3RpbWF0ZUdhcyhuZXR3b3JrLCB0eFJlcXVlc3QpO1xyXG4gICAgICBjb25zdCBlc3RpbWF0ZWRHYXMgPSBCaWdJbnQoZXN0aW1hdGVkR2FzSGV4KTtcclxuXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1lc3RpbWF0ZWQtZ2FzJykudGV4dENvbnRlbnQgPSBlc3RpbWF0ZWRHYXMudG9TdHJpbmcoKTtcclxuXHJcbiAgICAgIGNvbnN0IG1heEZlZVdlaSA9IGVzdGltYXRlZEdhcyAqIGdhc1ByaWNlV2VpO1xyXG4gICAgICBjb25zdCBtYXhGZWVFdGggPSBldGhlcnMuZm9ybWF0RXRoZXIobWF4RmVlV2VpLnRvU3RyaW5nKCkpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tbWF4LWZlZScpLnRleHRDb250ZW50ID0gYCR7cGFyc2VGbG9hdChtYXhGZWVFdGgpLnRvRml4ZWQoOCl9ICR7c3ltYm9sfWA7XHJcblxyXG4gICAgICBjb25zdCB1cGRhdGVNYXhGZWUgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRTcGVlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJ0b2tlbi1nYXMtc3BlZWRcIl06Y2hlY2tlZCcpPy52YWx1ZTtcclxuICAgICAgICBsZXQgc2VsZWN0ZWRHd2VpO1xyXG5cclxuICAgICAgICBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ3Nsb3cnKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KHNsb3dHd2VpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdub3JtYWwnKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KG5vcm1hbEd3ZWkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2Zhc3QnKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KGZhc3RHd2VpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdjdXN0b20nKSB7XHJcbiAgICAgICAgICBzZWxlY3RlZEd3ZWkgPSBwYXJzZUZsb2F0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1jdXN0b20tZ2FzLXByaWNlJykudmFsdWUpIHx8IHBhcnNlRmxvYXQobm9ybWFsR3dlaSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNlbGVjdGVkR3dlaSA9IHBhcnNlRmxvYXQobm9ybWFsR3dlaSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzZWxlY3RlZEdhc1ByaWNlV2VpID0gQmlnSW50KE1hdGguZmxvb3Ioc2VsZWN0ZWRHd2VpICogMWU5KSk7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRNYXhGZWVXZWkgPSBlc3RpbWF0ZWRHYXMgKiBzZWxlY3RlZEdhc1ByaWNlV2VpO1xyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkTWF4RmVlRXRoID0gZXRoZXJzLmZvcm1hdEV0aGVyKHNlbGVjdGVkTWF4RmVlV2VpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1tYXgtZmVlJykudGV4dENvbnRlbnQgPSBgJHtwYXJzZUZsb2F0KHNlbGVjdGVkTWF4RmVlRXRoKS50b0ZpeGVkKDgpfSAke3N5bWJvbH1gO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbbmFtZT1cInRva2VuLWdhcy1zcGVlZFwiXScpLmZvckVhY2gocmFkaW8gPT4ge1xyXG4gICAgICAgIHJhZGlvLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcclxuICAgICAgICAgIHVwZGF0ZU1heEZlZSgpO1xyXG5cclxuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYXMtb3B0aW9uJykuZm9yRWFjaChsYWJlbCA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gbGFiZWwucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInRva2VuLWdhcy1zcGVlZFwiXScpO1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQgJiYgaW5wdXQuY2hlY2tlZCkge1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXN1Y2Nlc3MpJztcclxuICAgICAgICAgICAgICBsYWJlbC5zdHlsZS5ib3JkZXJXaWR0aCA9ICcycHgnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLWJvcmRlciknO1xyXG4gICAgICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlcldpZHRoID0gJzFweCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGN1c3RvbUNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1jdXN0b20tZ2FzLWlucHV0LWNvbnRhaW5lcicpO1xyXG4gICAgICAgICAgaWYgKHJhZGlvLnZhbHVlID09PSAnY3VzdG9tJyAmJiByYWRpby5jaGVja2VkKSB7XHJcbiAgICAgICAgICAgIGN1c3RvbUNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1c3RvbS1nYXMtcHJpY2UnKS5mb2N1cygpO1xyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChjdXN0b21Db250YWluZXIpIHtcclxuICAgICAgICAgICAgY3VzdG9tQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYXMtb3B0aW9uJykuZm9yRWFjaChsYWJlbCA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBsYWJlbC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwidG9rZW4tZ2FzLXNwZWVkXCJdJyk7XHJcbiAgICAgICAgaWYgKGlucHV0ICYmIGlucHV0LmNoZWNrZWQpIHtcclxuICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXN1Y2Nlc3MpJztcclxuICAgICAgICAgIGxhYmVsLnN0eWxlLmJvcmRlcldpZHRoID0gJzJweCc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnN0IGN1c3RvbUdhc0lucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWN1c3RvbS1nYXMtcHJpY2UnKTtcclxuICAgICAgY3VzdG9tR2FzSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWdhcy1jdXN0b20tcmFkaW8nKS5jaGVja2VkID0gdHJ1ZTtcclxuICAgICAgICB1cGRhdGVNYXhGZWUoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgfSBjYXRjaCAoZ2FzRXN0aW1hdGVFcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBlc3RpbWF0aW5nIGdhczonLCBnYXNFc3RpbWF0ZUVycm9yKTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWVzdGltYXRlZC1nYXMnKS50ZXh0Q29udGVudCA9ICc2NTAwMCAoZGVmYXVsdCknO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tbWF4LWZlZScpLnRleHRDb250ZW50ID0gJ1VuYWJsZSB0byBlc3RpbWF0ZSc7XHJcbiAgICB9XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBnYXMgcHJpY2U6JywgZXJyb3IpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWdhcy1zbG93LXByaWNlJykudGV4dENvbnRlbnQgPSAnRXJyb3InO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWdhcy1ub3JtYWwtcHJpY2UnKS50ZXh0Q29udGVudCA9ICdFcnJvcic7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tZ2FzLWZhc3QtcHJpY2UnKS50ZXh0Q29udGVudCA9ICdFcnJvcic7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgc2VsZWN0ZWQgZ2FzIHByaWNlIGZyb20gVG9rZW4gU2VuZFxyXG5mdW5jdGlvbiBnZXRTZWxlY3RlZFRva2VuR2FzUHJpY2UoKSB7XHJcbiAgY29uc3Qgc2VsZWN0ZWRTcGVlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJ0b2tlbi1nYXMtc3BlZWRcIl06Y2hlY2tlZCcpPy52YWx1ZTtcclxuXHJcbiAgaWYgKHNlbGVjdGVkU3BlZWQgPT09ICdjdXN0b20nKSB7XHJcbiAgICBjb25zdCBjdXN0b21Hd2VpID0gcGFyc2VGbG9hdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tY3VzdG9tLWdhcy1wcmljZScpLnZhbHVlKTtcclxuICAgIGlmIChjdXN0b21Hd2VpICYmIGN1c3RvbUd3ZWkgPiAwKSB7XHJcbiAgICAgIHJldHVybiBldGhlcnMucGFyc2VVbml0cyhjdXN0b21Hd2VpLnRvU3RyaW5nKCksICdnd2VpJykudG9TdHJpbmcoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGxldCBnd2VpVGV4dDtcclxuICBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ3Nsb3cnKSB7XHJcbiAgICBnd2VpVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1nYXMtc2xvdy1wcmljZScpLnRleHRDb250ZW50O1xyXG4gIH0gZWxzZSBpZiAoc2VsZWN0ZWRTcGVlZCA9PT0gJ2Zhc3QnKSB7XHJcbiAgICBnd2VpVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1nYXMtZmFzdC1wcmljZScpLnRleHRDb250ZW50O1xyXG4gIH0gZWxzZSB7XHJcbiAgICBnd2VpVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1nYXMtbm9ybWFsLXByaWNlJykudGV4dENvbnRlbnQ7XHJcbiAgfVxyXG5cclxuICBjb25zdCBnd2VpID0gcGFyc2VGbG9hdChnd2VpVGV4dCk7XHJcbiAgaWYgKGd3ZWkgJiYgZ3dlaSA+IDApIHtcclxuICAgIHJldHVybiBldGhlcnMucGFyc2VVbml0cyhnd2VpLnRvU3RyaW5nKCksICdnd2VpJykudG9TdHJpbmcoKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcblxyXG4vLyBTaG93IHRyYW5zYWN0aW9uIHN0YXR1cyBmb3IgU2VuZCBzY3JlZW5cclxuYXN5bmMgZnVuY3Rpb24gc2hvd1NlbmRUcmFuc2FjdGlvblN0YXR1cyh0eEhhc2gsIG5ldHdvcmssIGFtb3VudCwgc3ltYm9sKSB7XHJcbiAgLy8gSGlkZSBzZW5kIGZvcm1cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1mb3JtJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIC8vIFNob3cgc3RhdHVzIHNlY3Rpb25cclxuICBjb25zdCBzdGF0dXNTZWN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtc3RhdHVzLXNlY3Rpb24nKTtcclxuICBzdGF0dXNTZWN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG5cclxuICAvLyBQb3B1bGF0ZSB0cmFuc2FjdGlvbiBoYXNoXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtc3RhdHVzLWhhc2gnKS50ZXh0Q29udGVudCA9IHR4SGFzaDtcclxuXHJcbiAgLy8gU2V0dXAgVmlldyBvbiBFeHBsb3JlciBidXR0b25cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXNlbmQtc3RhdHVzLWV4cGxvcmVyJykub25jbGljayA9ICgpID0+IHtcclxuICAgIGNvbnN0IHVybCA9IGdldEV4cGxvcmVyVXJsKG5ldHdvcmssICd0eCcsIHR4SGFzaCk7XHJcbiAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmwgfSk7XHJcbiAgfTtcclxuXHJcbiAgLy8gR2V0IGFjdGl2ZSB3YWxsZXQgYWRkcmVzc1xyXG4gIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gIGNvbnN0IGFkZHJlc3MgPSB3YWxsZXQ/LmFkZHJlc3M7XHJcblxyXG4gIC8vIFBvbGwgZm9yIHRyYW5zYWN0aW9uIHN0YXR1c1xyXG4gIGxldCBwb2xsSW50ZXJ2YWw7XHJcbiAgY29uc3QgdXBkYXRlU3RhdHVzID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogJ0dFVF9UWF9CWV9IQVNIJyxcclxuICAgICAgICBhZGRyZXNzOiBhZGRyZXNzLFxyXG4gICAgICAgIHR4SGFzaDogdHhIYXNoXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MgJiYgcmVzcG9uc2UudHJhbnNhY3Rpb24pIHtcclxuICAgICAgICBjb25zdCB0eCA9IHJlc3BvbnNlLnRyYW5zYWN0aW9uO1xyXG4gICAgICAgIGNvbnN0IHN0YXR1c01lc3NhZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1zdGF0dXMtbWVzc2FnZScpO1xyXG4gICAgICAgIGNvbnN0IHN0YXR1c0RldGFpbHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZC1zdGF0dXMtZGV0YWlscycpO1xyXG4gICAgICAgIGNvbnN0IHBlbmRpbmdBY3Rpb25zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmQtc3RhdHVzLXBlbmRpbmctYWN0aW9ucycpO1xyXG5cclxuICAgICAgICBpZiAodHguc3RhdHVzID09PSAnY29uZmlybWVkJykge1xyXG4gICAgICAgICAgc3RhdHVzTWVzc2FnZS50ZXh0Q29udGVudCA9ICfinIUgVHJhbnNhY3Rpb24gQ29uZmlybWVkISc7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnRleHRDb250ZW50ID0gYEJsb2NrOiAke3R4LmJsb2NrTnVtYmVyfWA7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXN1Y2Nlc3MpJztcclxuICAgICAgICAgIHBlbmRpbmdBY3Rpb25zLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAgIGlmIChwb2xsSW50ZXJ2YWwpIHtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChwb2xsSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIE5vdGU6IERlc2t0b3Agbm90aWZpY2F0aW9uIGlzIHNlbnQgYnkgYmFja2dyb3VuZCBzZXJ2aWNlIHdvcmtlclxyXG4gICAgICAgICAgLy8gTm8gbmVlZCB0byBzZW5kIGFub3RoZXIgb25lIGhlcmUgdG8gYXZvaWQgZHVwbGljYXRlc1xyXG5cclxuICAgICAgICAgIC8vIEF1dG8tY2xvc2UgYW5kIHJldHVybiB0byBkYXNoYm9hcmQgYWZ0ZXIgMiBzZWNvbmRzXHJcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgc2hvd1NjcmVlbignc2NyZWVuLWRhc2hib2FyZCcpO1xyXG4gICAgICAgICAgICAvLyBSZWZyZXNoIGRhc2hib2FyZFxyXG4gICAgICAgICAgICB1cGRhdGVEYXNoYm9hcmQoKTtcclxuICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHguc3RhdHVzID09PSAnZmFpbGVkJykge1xyXG4gICAgICAgICAgc3RhdHVzTWVzc2FnZS50ZXh0Q29udGVudCA9ICfinYwgVHJhbnNhY3Rpb24gRmFpbGVkJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMudGV4dENvbnRlbnQgPSAnVGhlIHRyYW5zYWN0aW9uIHdhcyByZWplY3RlZCBvciByZXBsYWNlZCc7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnN0eWxlLmNvbG9yID0gJyNmZjQ0NDQnO1xyXG4gICAgICAgICAgcGVuZGluZ0FjdGlvbnMuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgaWYgKHBvbGxJbnRlcnZhbCkge1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHBvbGxJbnRlcnZhbCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHN0YXR1c01lc3NhZ2UudGV4dENvbnRlbnQgPSAn4o+zIFdhaXRpbmcgZm9yIGNvbmZpcm1hdGlvbi4uLic7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnRleHRDb250ZW50ID0gJ1RoaXMgdXN1YWxseSB0YWtlcyAxMC0zMCBzZWNvbmRzJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMuc3R5bGUuY29sb3IgPSAndmFyKC0tdGVybWluYWwtZmctZGltKSc7XHJcbiAgICAgICAgICBwZW5kaW5nQWN0aW9ucy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNoZWNraW5nIHRyYW5zYWN0aW9uIHN0YXR1czonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgYXdhaXQgdXBkYXRlU3RhdHVzKCk7XHJcbiAgcG9sbEludGVydmFsID0gc2V0SW50ZXJ2YWwodXBkYXRlU3RhdHVzLCAzMDAwKTtcclxuXHJcbiAgLy8gU2V0dXAgY2xvc2UgYnV0dG9uXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS1zZW5kLXN0YXR1cycpLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICBpZiAocG9sbEludGVydmFsKSB7XHJcbiAgICAgIGNsZWFySW50ZXJ2YWwocG9sbEludGVydmFsKTtcclxuICAgIH1cclxuICAgIHNob3dTY3JlZW4oJ3NjcmVlbi1kYXNoYm9hcmQnKTtcclxuICAgIHVwZGF0ZURhc2hib2FyZCgpO1xyXG4gIH07XHJcblxyXG4gIC8vIFNldHVwIFNwZWVkIFVwIGJ1dHRvblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tc2VuZC1zdGF0dXMtc3BlZWQtdXAnKS5vbmNsaWNrID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgLy8gVE9ETzogSW1wbGVtZW50IHNwZWVkIHVwIHRyYW5zYWN0aW9uIGZ1bmN0aW9uYWxpdHlcclxuICAgIGFsZXJ0KCdTcGVlZCBVcCBmdW5jdGlvbmFsaXR5IHdpbGwgYmUgaW1wbGVtZW50ZWQgaW4gYSBmdXR1cmUgdXBkYXRlJyk7XHJcbiAgfTtcclxuXHJcbiAgLy8gU2V0dXAgQ2FuY2VsIGJ1dHRvblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tc2VuZC1zdGF0dXMtY2FuY2VsJykub25jbGljayA9IGFzeW5jICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIEdldCB0cmFuc2FjdGlvbiBkZXRhaWxzXHJcbiAgICAgIGNvbnN0IHR4UmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogJ0dFVF9UWF9CWV9IQVNIJyxcclxuICAgICAgICBhZGRyZXNzOiBhZGRyZXNzLFxyXG4gICAgICAgIHR4SGFzaDogdHhIYXNoXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKCF0eFJlc3BvbnNlLnN1Y2Nlc3MgfHwgIXR4UmVzcG9uc2UudHJhbnNhY3Rpb24pIHtcclxuICAgICAgICBhbGVydCgnQ291bGQgbm90IGxvYWQgdHJhbnNhY3Rpb24gZGV0YWlscycpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgdHggPSB0eFJlc3BvbnNlLnRyYW5zYWN0aW9uO1xyXG5cclxuICAgICAgLy8gU3RvcmUgc3RhdGUgZm9yIG1vZGFsXHJcbiAgICAgIGNhbmNlbE1vZGFsU3RhdGUudHhIYXNoID0gdHhIYXNoO1xyXG4gICAgICBjYW5jZWxNb2RhbFN0YXRlLmFkZHJlc3MgPSBhZGRyZXNzO1xyXG4gICAgICBjYW5jZWxNb2RhbFN0YXRlLm5ldHdvcmsgPSB0eC5uZXR3b3JrO1xyXG4gICAgICBjYW5jZWxNb2RhbFN0YXRlLm9yaWdpbmFsR2FzUHJpY2UgPSB0eC5nYXNQcmljZTtcclxuXHJcbiAgICAgIC8vIFNob3cgbW9kYWwgYW5kIGxvYWQgZ2FzIHByaWNlc1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtY2FuY2VsLXR4JykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIGF3YWl0IHJlZnJlc2hDYW5jZWxHYXNQcmljZXMoKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIG9wZW5pbmcgY2FuY2VsIG1vZGFsOicsIGVycm9yKTtcclxuICAgICAgYWxlcnQoJ0Vycm9yIGxvYWRpbmcgZ2FzIHByaWNlcycpO1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuXHJcbi8vIFNob3cgdHJhbnNhY3Rpb24gc3RhdHVzIGZvciBUb2tlbiBTZW5kXHJcbmFzeW5jIGZ1bmN0aW9uIHNob3dUb2tlblNlbmRUcmFuc2FjdGlvblN0YXR1cyh0eEhhc2gsIG5ldHdvcmssIGFtb3VudCwgc3ltYm9sKSB7XHJcbiAgLy8gSGlkZSB0b2tlbiBzZW5kIGZvcm1cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tc2VuZC1mb3JtJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIC8vIFNob3cgc3RhdHVzIHNlY3Rpb25cclxuICBjb25zdCBzdGF0dXNTZWN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXNlbmQtc3RhdHVzLXNlY3Rpb24nKTtcclxuICBzdGF0dXNTZWN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG5cclxuICAvLyBQb3B1bGF0ZSB0cmFuc2FjdGlvbiBoYXNoXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXNlbmQtc3RhdHVzLWhhc2gnKS50ZXh0Q29udGVudCA9IHR4SGFzaDtcclxuXHJcbiAgLy8gU2V0dXAgVmlldyBvbiBFeHBsb3JlciBidXR0b25cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXRva2VuLXNlbmQtc3RhdHVzLWV4cGxvcmVyJykub25jbGljayA9ICgpID0+IHtcclxuICAgIGNvbnN0IHVybCA9IGdldEV4cGxvcmVyVXJsKG5ldHdvcmssICd0eCcsIHR4SGFzaCk7XHJcbiAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmwgfSk7XHJcbiAgfTtcclxuXHJcbiAgLy8gR2V0IGFjdGl2ZSB3YWxsZXQgYWRkcmVzc1xyXG4gIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gIGNvbnN0IGFkZHJlc3MgPSB3YWxsZXQ/LmFkZHJlc3M7XHJcblxyXG4gIC8vIFBvbGwgZm9yIHRyYW5zYWN0aW9uIHN0YXR1c1xyXG4gIGxldCBwb2xsSW50ZXJ2YWw7XHJcbiAgY29uc3QgdXBkYXRlU3RhdHVzID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogJ0dFVF9UWF9CWV9IQVNIJyxcclxuICAgICAgICBhZGRyZXNzOiBhZGRyZXNzLFxyXG4gICAgICAgIHR4SGFzaDogdHhIYXNoXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MgJiYgcmVzcG9uc2UudHJhbnNhY3Rpb24pIHtcclxuICAgICAgICBjb25zdCB0eCA9IHJlc3BvbnNlLnRyYW5zYWN0aW9uO1xyXG4gICAgICAgIGNvbnN0IHN0YXR1c01lc3NhZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tc2VuZC1zdGF0dXMtbWVzc2FnZScpO1xyXG4gICAgICAgIGNvbnN0IHN0YXR1c0RldGFpbHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tc2VuZC1zdGF0dXMtZGV0YWlscycpO1xyXG4gICAgICAgIGNvbnN0IHBlbmRpbmdBY3Rpb25zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXNlbmQtc3RhdHVzLXBlbmRpbmctYWN0aW9ucycpO1xyXG5cclxuICAgICAgICBpZiAodHguc3RhdHVzID09PSAnY29uZmlybWVkJykge1xyXG4gICAgICAgICAgc3RhdHVzTWVzc2FnZS50ZXh0Q29udGVudCA9ICfinIUgVHJhbnNhY3Rpb24gQ29uZmlybWVkISc7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnRleHRDb250ZW50ID0gYEJsb2NrOiAke3R4LmJsb2NrTnVtYmVyfWA7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXN1Y2Nlc3MpJztcclxuICAgICAgICAgIHBlbmRpbmdBY3Rpb25zLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAgIGlmIChwb2xsSW50ZXJ2YWwpIHtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChwb2xsSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIE5vdGU6IERlc2t0b3Agbm90aWZpY2F0aW9uIGlzIHNlbnQgYnkgYmFja2dyb3VuZCBzZXJ2aWNlIHdvcmtlclxyXG4gICAgICAgICAgLy8gTm8gbmVlZCB0byBzZW5kIGFub3RoZXIgb25lIGhlcmUgdG8gYXZvaWQgZHVwbGljYXRlc1xyXG5cclxuICAgICAgICAgIC8vIEF1dG8tY2xvc2UgYW5kIHJldHVybiB0byB0b2tlbnMgc2NyZWVuIGFmdGVyIDIgc2Vjb25kc1xyXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHNob3dTY3JlZW4oJ3NjcmVlbi10b2tlbnMnKTtcclxuICAgICAgICAgICAgLy8gUmVmcmVzaCB0b2tlbnNcclxuICAgICAgICAgICAgbG9hZFRva2Vuc1NjcmVlbigpO1xyXG4gICAgICAgICAgfSwgMjAwMCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eC5zdGF0dXMgPT09ICdmYWlsZWQnKSB7XHJcbiAgICAgICAgICBzdGF0dXNNZXNzYWdlLnRleHRDb250ZW50ID0gJ+KdjCBUcmFuc2FjdGlvbiBGYWlsZWQnO1xyXG4gICAgICAgICAgc3RhdHVzRGV0YWlscy50ZXh0Q29udGVudCA9ICdUaGUgdHJhbnNhY3Rpb24gd2FzIHJlamVjdGVkIG9yIHJlcGxhY2VkJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMuc3R5bGUuY29sb3IgPSAnI2ZmNDQ0NCc7XHJcbiAgICAgICAgICBwZW5kaW5nQWN0aW9ucy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgICBpZiAocG9sbEludGVydmFsKSB7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwocG9sbEludGVydmFsKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3RhdHVzTWVzc2FnZS50ZXh0Q29udGVudCA9ICfij7MgV2FpdGluZyBmb3IgY29uZmlybWF0aW9uLi4uJztcclxuICAgICAgICAgIHN0YXR1c0RldGFpbHMudGV4dENvbnRlbnQgPSAnVGhpcyB1c3VhbGx5IHRha2VzIDEwLTMwIHNlY29uZHMnO1xyXG4gICAgICAgICAgc3RhdHVzRGV0YWlscy5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1mZy1kaW0pJztcclxuICAgICAgICAgIHBlbmRpbmdBY3Rpb25zLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2hlY2tpbmcgdHJhbnNhY3Rpb24gc3RhdHVzOicsIGVycm9yKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBhd2FpdCB1cGRhdGVTdGF0dXMoKTtcclxuICBwb2xsSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCh1cGRhdGVTdGF0dXMsIDMwMDApO1xyXG5cclxuICAvLyBTZXR1cCBjbG9zZSBidXR0b25cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLXRva2VuLXNlbmQtc3RhdHVzJykub25jbGljayA9ICgpID0+IHtcclxuICAgIGlmIChwb2xsSW50ZXJ2YWwpIHtcclxuICAgICAgY2xlYXJJbnRlcnZhbChwb2xsSW50ZXJ2YWwpO1xyXG4gICAgfVxyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXRva2VucycpO1xyXG4gICAgbG9hZFRva2Vuc1NjcmVlbigpO1xyXG4gIH07XHJcblxyXG4gIC8vIFNldHVwIFNwZWVkIFVwIGJ1dHRvblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdG9rZW4tc2VuZC1zdGF0dXMtc3BlZWQtdXAnKS5vbmNsaWNrID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgLy8gVE9ETzogSW1wbGVtZW50IHNwZWVkIHVwIHRyYW5zYWN0aW9uIGZ1bmN0aW9uYWxpdHlcclxuICAgIGFsZXJ0KCdTcGVlZCBVcCBmdW5jdGlvbmFsaXR5IHdpbGwgYmUgaW1wbGVtZW50ZWQgaW4gYSBmdXR1cmUgdXBkYXRlJyk7XHJcbiAgfTtcclxuXHJcbiAgLy8gU2V0dXAgQ2FuY2VsIGJ1dHRvblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdG9rZW4tc2VuZC1zdGF0dXMtY2FuY2VsJykub25jbGljayA9IGFzeW5jICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIEdldCB0cmFuc2FjdGlvbiBkZXRhaWxzXHJcbiAgICAgIGNvbnN0IHR4UmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogJ0dFVF9UWF9CWV9IQVNIJyxcclxuICAgICAgICBhZGRyZXNzOiBhZGRyZXNzLFxyXG4gICAgICAgIHR4SGFzaDogdHhIYXNoXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKCF0eFJlc3BvbnNlLnN1Y2Nlc3MgfHwgIXR4UmVzcG9uc2UudHJhbnNhY3Rpb24pIHtcclxuICAgICAgICBhbGVydCgnQ291bGQgbm90IGxvYWQgdHJhbnNhY3Rpb24gZGV0YWlscycpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgdHggPSB0eFJlc3BvbnNlLnRyYW5zYWN0aW9uO1xyXG5cclxuICAgICAgLy8gU3RvcmUgc3RhdGUgZm9yIG1vZGFsXHJcbiAgICAgIGNhbmNlbE1vZGFsU3RhdGUudHhIYXNoID0gdHhIYXNoO1xyXG4gICAgICBjYW5jZWxNb2RhbFN0YXRlLmFkZHJlc3MgPSBhZGRyZXNzO1xyXG4gICAgICBjYW5jZWxNb2RhbFN0YXRlLm5ldHdvcmsgPSB0eC5uZXR3b3JrO1xyXG4gICAgICBjYW5jZWxNb2RhbFN0YXRlLm9yaWdpbmFsR2FzUHJpY2UgPSB0eC5nYXNQcmljZTtcclxuXHJcbiAgICAgIC8vIFNob3cgbW9kYWwgYW5kIGxvYWQgZ2FzIHByaWNlc1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtY2FuY2VsLXR4JykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIGF3YWl0IHJlZnJlc2hDYW5jZWxHYXNQcmljZXMoKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIG9wZW5pbmcgY2FuY2VsIG1vZGFsOicsIGVycm9yKTtcclxuICAgICAgYWxlcnQoJ0Vycm9yIGxvYWRpbmcgZ2FzIHByaWNlcycpO1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgcGFyYW1ldGVyIHZhbHVlIGZvciBkaXNwbGF5IGJhc2VkIG9uIHR5cGVcclxuICovXHJcbmZ1bmN0aW9uIGZvcm1hdFBhcmFtZXRlclZhbHVlKHZhbHVlLCB0eXBlKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIEhhbmRsZSBhcnJheXNcclxuICAgIGlmICh0eXBlLmluY2x1ZGVzKCdbXScpKSB7XHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRUeXBlID0gdHlwZS5yZXBsYWNlKCdbXScsICcnKTtcclxuICAgICAgICBjb25zdCBmb3JtYXR0ZWRFbGVtZW50cyA9IHZhbHVlLm1hcCgodiwgaSkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZm9ybWF0dGVkVmFsdWUgPSBmb3JtYXRQYXJhbWV0ZXJWYWx1ZSh2LCBlbGVtZW50VHlwZSk7XHJcbiAgICAgICAgICByZXR1cm4gYFske2l9XTogJHtmb3JtYXR0ZWRWYWx1ZX1gO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBmb3JtYXR0ZWRFbGVtZW50cy5qb2luKCc8YnI+Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBIYW5kbGUgYWRkcmVzc2VzXHJcbiAgICBpZiAodHlwZSA9PT0gJ2FkZHJlc3MnKSB7XHJcbiAgICAgIGNvbnN0IHNob3J0QWRkciA9IGAke3ZhbHVlLnNsaWNlKDAsIDYpfS4uLiR7dmFsdWUuc2xpY2UoLTQpfWA7XHJcbiAgICAgIHJldHVybiBgPHNwYW4gdGl0bGU9XCIke3ZhbHVlfVwiIHN0eWxlPVwiY3Vyc29yOiBoZWxwO1wiPiR7c2hvcnRBZGRyfTwvc3Bhbj5gO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEhhbmRsZSBudW1iZXJzICh1aW50L2ludClcclxuICAgIGlmICh0eXBlLnN0YXJ0c1dpdGgoJ3VpbnQnKSB8fCB0eXBlLnN0YXJ0c1dpdGgoJ2ludCcpKSB7XHJcbiAgICAgIGNvbnN0IHZhbHVlU3RyID0gdmFsdWUudG9TdHJpbmcoKTtcclxuXHJcbiAgICAgIC8vIEZvciBsYXJnZSBudW1iZXJzLCB0cnkgdG8gc2hvdyBib3RoIHJhdyBhbmQgZm9ybWF0dGVkXHJcbiAgICAgIGlmICh2YWx1ZVN0ci5sZW5ndGggPiAxOCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBldGhlclZhbHVlID0gZXRoZXJzLmZvcm1hdEV0aGVyKHZhbHVlU3RyKTtcclxuICAgICAgICAgIC8vIE9ubHkgc2hvdyBldGhlciBjb252ZXJzaW9uIGlmIGl0IG1ha2VzIHNlbnNlICg+IDAuMDAwMDAxKVxyXG4gICAgICAgICAgaWYgKHBhcnNlRmxvYXQoZXRoZXJWYWx1ZSkgPiAwLjAwMDAwMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYCR7dmFsdWVTdHJ9PGJyPjxzcGFuIHN0eWxlPVwiY29sb3I6IHZhcigtLXRlcm1pbmFsLWRpbSk7IGZvbnQtc2l6ZTogOXB4O1wiPijiiYggJHtwYXJzZUZsb2F0KGV0aGVyVmFsdWUpLnRvRml4ZWQoNil9IHRva2Vucyk8L3NwYW4+YDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAvLyBJZiBjb252ZXJzaW9uIGZhaWxzLCBqdXN0IHNob3cgcmF3XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdmFsdWVTdHI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGFuZGxlIGJvb2xlYW5zXHJcbiAgICBpZiAodHlwZSA9PT0gJ2Jvb2wnKSB7XHJcbiAgICAgIHJldHVybiB2YWx1ZSA/ICc8c3BhbiBzdHlsZT1cImNvbG9yOiB2YXIoLS10ZXJtaW5hbC1zdWNjZXNzKTtcIj50cnVlPC9zcGFuPicgOiAnPHNwYW4gc3R5bGU9XCJjb2xvcjogdmFyKC0tdGVybWluYWwtd2FybmluZyk7XCI+ZmFsc2U8L3NwYW4+JztcclxuICAgIH1cclxuXHJcbiAgICAvLyBIYW5kbGUgYnl0ZXNcclxuICAgIGlmICh0eXBlID09PSAnYnl0ZXMnIHx8IHR5cGUuc3RhcnRzV2l0aCgnYnl0ZXMnKSkge1xyXG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiA2Nikge1xyXG4gICAgICAgICAgcmV0dXJuIGAke3ZhbHVlLnNsaWNlKDAsIDY2KX0uLi48YnI+PHNwYW4gc3R5bGU9XCJjb2xvcjogdmFyKC0tdGVybWluYWwtZGltKTsgZm9udC1zaXplOiA5cHg7XCI+KCR7dmFsdWUubGVuZ3RofSBjaGFycyk8L3NwYW4+YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGFuZGxlIHN0cmluZ3NcclxuICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xyXG4gICAgICBpZiAodmFsdWUubGVuZ3RoID4gNTApIHtcclxuICAgICAgICByZXR1cm4gYCR7dmFsdWUuc2xpY2UoMCwgNTApfS4uLjxicj48c3BhbiBzdHlsZT1cImNvbG9yOiB2YXIoLS10ZXJtaW5hbC1kaW0pOyBmb250LXNpemU6IDlweDtcIj4oJHt2YWx1ZS5sZW5ndGh9IGNoYXJzKTwvc3Bhbj5gO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBEZWZhdWx0OiBjb252ZXJ0IHRvIHN0cmluZ1xyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcclxuICAgICAgY29uc3QganNvblN0ciA9IEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCAyKTtcclxuICAgICAgaWYgKGpzb25TdHIubGVuZ3RoID4gMTAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGA8cHJlIHN0eWxlPVwiZm9udC1zaXplOiA5cHg7IG92ZXJmbG93LXg6IGF1dG87XCI+JHtqc29uU3RyLnNsaWNlKDAsIDEwMCl9Li4uPC9wcmU+YDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYDxwcmUgc3R5bGU9XCJmb250LXNpemU6IDlweDtcIj4ke2pzb25TdHJ9PC9wcmU+YDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZm9ybWF0dGluZyBwYXJhbWV0ZXIgdmFsdWU6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUcmFuc2FjdGlvbkFwcHJvdmFsU2NyZWVuKHJlcXVlc3RJZCkge1xyXG4gIC8vIExvYWQgc2V0dGluZ3MgZm9yIHRoZW1lXHJcbiAgYXdhaXQgbG9hZFNldHRpbmdzKCk7XHJcbiAgYXBwbHlUaGVtZSgpO1xyXG5cclxuICAvLyBHZXQgdHJhbnNhY3Rpb24gcmVxdWVzdCBkZXRhaWxzIGZyb20gYmFja2dyb3VuZFxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0dFVF9UUkFOU0FDVElPTl9SRVFVRVNUJyxcclxuICAgICAgcmVxdWVzdElkXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgYWxlcnQoJ1RyYW5zYWN0aW9uIHJlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnKTtcclxuICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB7IG9yaWdpbiwgdHhSZXF1ZXN0IH0gPSByZXNwb25zZTtcclxuXHJcbiAgICAvLyBHZXQgYWN0aXZlIHdhbGxldFxyXG4gICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgbG9hZCgnY3VycmVudE5ldHdvcmsnKSB8fCAncHVsc2VjaGFpblRlc3RuZXQnO1xyXG5cclxuICAgIC8vIFBvcHVsYXRlIHRyYW5zYWN0aW9uIGRldGFpbHNcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1zaXRlLW9yaWdpbicpLnRleHRDb250ZW50ID0gb3JpZ2luO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWZyb20tYWRkcmVzcycpLnRleHRDb250ZW50ID0gd2FsbGV0Py5hZGRyZXNzIHx8ICcweDAwMDAuLi4wMDAwJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC10by1hZGRyZXNzJykudGV4dENvbnRlbnQgPSB0eFJlcXVlc3QudG8gfHwgJ0NvbnRyYWN0IENyZWF0aW9uJztcclxuXHJcbiAgICAvLyBGb3JtYXQgdmFsdWVcclxuICAgIGNvbnN0IHN5bWJvbHMgPSB7XHJcbiAgICAgICdwdWxzZWNoYWluVGVzdG5ldCc6ICd0UExTJyxcclxuICAgICAgJ3B1bHNlY2hhaW4nOiAnUExTJyxcclxuICAgICAgJ2V0aGVyZXVtJzogJ0VUSCcsXHJcbiAgICAgICdzZXBvbGlhJzogJ1NFUCdcclxuICAgIH07XHJcbiAgICBjb25zdCBzeW1ib2wgPSBzeW1ib2xzW25ldHdvcmtdIHx8ICdUT0tFTic7XHJcblxyXG4gICAgaWYgKHR4UmVxdWVzdC52YWx1ZSkge1xyXG4gICAgICBjb25zdCB2YWx1ZSA9IGV0aGVycy5mb3JtYXRFdGhlcih0eFJlcXVlc3QudmFsdWUpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtdmFsdWUnKS50ZXh0Q29udGVudCA9IGAke3ZhbHVlfSAke3N5bWJvbH1gO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXZhbHVlJykudGV4dENvbnRlbnQgPSBgMCAke3N5bWJvbH1gO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIERlY29kZSB0cmFuc2FjdGlvbiBkYXRhXHJcbiAgICBsZXQgZGVjb2RlZFR4ID0gbnVsbDtcclxuICAgIGNvbnN0IGNoYWluSWRNYXAgPSB7XHJcbiAgICAgICdwdWxzZWNoYWluJzogMzY5LFxyXG4gICAgICAncHVsc2VjaGFpblRlc3RuZXQnOiA5NDMsXHJcbiAgICAgICdldGhlcmV1bSc6IDEsXHJcbiAgICAgICdzZXBvbGlhJzogMTExNTUxMTFcclxuICAgIH07XHJcbiAgICBjb25zdCBjaGFpbklkID0gY2hhaW5JZE1hcFtuZXR3b3JrXSB8fCAzNjk7XHJcblxyXG4gICAgLy8gU2hvdyBsb2FkaW5nIHN0YXRlXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY29udHJhY3QtaW5mbycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWZ1bmN0aW9uLW5hbWUnKS50ZXh0Q29udGVudCA9ICdEZWNvZGluZy4uLic7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgZGVjb2RlZFR4ID0gYXdhaXQgZGVjb2RlVHJhbnNhY3Rpb24odHhSZXF1ZXN0LCBjaGFpbklkKTtcclxuICAgICAgY29uc29sZS5sb2coJ/Cfq4AgRGVjb2RlZCB0cmFuc2FjdGlvbjonLCBkZWNvZGVkVHgpO1xyXG5cclxuICAgICAgLy8gU2hvdyBjb250cmFjdCBpbmZvIGlmIGl0J3MgYSBjb250cmFjdCBpbnRlcmFjdGlvblxyXG4gICAgICBpZiAoZGVjb2RlZFR4ICYmIGRlY29kZWRUeC50eXBlICE9PSAndHJhbnNmZXInICYmIGRlY29kZWRUeC5jb250cmFjdCkge1xyXG4gICAgICAgIGNvbnN0IGNvbnRyYWN0SW5mbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jb250cmFjdC1pbmZvJyk7XHJcbiAgICAgICAgY29udHJhY3RJbmZvLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgY29udHJhY3QgYWRkcmVzc1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jb250cmFjdC1hZGRyZXNzJykudGV4dENvbnRlbnQgPSBkZWNvZGVkVHguY29udHJhY3QuYWRkcmVzcztcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHZlcmlmaWNhdGlvbiBiYWRnZVxyXG4gICAgICAgIGlmIChkZWNvZGVkVHguY29udHJhY3QudmVyaWZpZWQpIHtcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC12ZXJpZmllZC1iYWRnZScpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXVudmVyaWZpZWQtYmFkZ2UnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgICAgIGNvbnRyYWN0SW5mby5zdHlsZS5ib3JkZXJDb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1zdWNjZXNzKSc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC12ZXJpZmllZC1iYWRnZScpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXVudmVyaWZpZWQtYmFkZ2UnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAgIGNvbnRyYWN0SW5mby5zdHlsZS5ib3JkZXJDb2xvciA9ICd2YXIoLS10ZXJtaW5hbC13YXJuaW5nKSc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBVcGRhdGUgZXhwbG9yZXIgbGlua1xyXG4gICAgICAgIGNvbnN0IGNvbnRyYWN0TGluayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jb250cmFjdC1saW5rJyk7XHJcbiAgICAgICAgY29udHJhY3RMaW5rLmhyZWYgPSBkZWNvZGVkVHguZXhwbG9yZXJVcmw7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBmdW5jdGlvbiBpbmZvXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWZ1bmN0aW9uLW5hbWUnKS50ZXh0Q29udGVudCA9IGRlY29kZWRUeC5tZXRob2QgfHwgJ1Vua25vd24gRnVuY3Rpb24nO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1mdW5jdGlvbi1kZXNjcmlwdGlvbicpLnRleHRDb250ZW50ID0gZGVjb2RlZFR4LmRlc2NyaXB0aW9uIHx8ICdDb250cmFjdCBpbnRlcmFjdGlvbic7XHJcblxyXG4gICAgICAgIC8vIFNob3cgcGFyYW1ldGVycyBpZiBhdmFpbGFibGVcclxuICAgICAgICBpZiAoZGVjb2RlZFR4LnBhcmFtcyAmJiBkZWNvZGVkVHgucGFyYW1zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIGNvbnN0IHBhcmFtc1NlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtcGFyYW1zLXNlY3Rpb24nKTtcclxuICAgICAgICAgIGNvbnN0IHBhcmFtc0xpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtcGFyYW1zLWxpc3QnKTtcclxuICAgICAgICAgIHBhcmFtc1NlY3Rpb24uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgbGV0IHBhcmFtc0hUTUwgPSAnJztcclxuICAgICAgICAgIGZvciAoY29uc3QgcGFyYW0gb2YgZGVjb2RlZFR4LnBhcmFtcykge1xyXG4gICAgICAgICAgICBjb25zdCB2YWx1ZURpc3BsYXkgPSBmb3JtYXRQYXJhbWV0ZXJWYWx1ZShwYXJhbS52YWx1ZSwgcGFyYW0udHlwZSk7XHJcbiAgICAgICAgICAgIHBhcmFtc0hUTUwgKz0gYFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJtYXJnaW4tYm90dG9tOiAxMnB4OyBwYWRkaW5nOiA4cHg7IGJhY2tncm91bmQ6IHZhcigtLXRlcm1pbmFsLWJnKTsgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tdGVybWluYWwtYm9yZGVyKTsgYm9yZGVyLXJhZGl1czogNHB4O1wiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgbWFyZ2luLWJvdHRvbTogNHB4O1wiPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTBweDsgY29sb3I6IHZhcigtLXRlcm1pbmFsLWRpbSk7XCI+JHtwYXJhbS5uYW1lfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDlweDsgY29sb3I6IHZhcigtLXRlcm1pbmFsLWRpbSk7IGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LW1vbm8pO1wiPiR7cGFyYW0udHlwZX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6IDEwcHg7IGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LW1vbm8pOyB3b3JkLWJyZWFrOiBicmVhay1hbGw7XCI+XHJcbiAgICAgICAgICAgICAgICAgICR7dmFsdWVEaXNwbGF5fVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBwYXJhbXNMaXN0LmlubmVySFRNTCA9IHBhcmFtc0hUTUw7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1wYXJhbXMtc2VjdGlvbicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY29udHJhY3QtaW5mbycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTaG93IHJhdyBkYXRhIHNlY3Rpb24gZm9yIGFkdmFuY2VkIHVzZXJzXHJcbiAgICAgIGlmICh0eFJlcXVlc3QuZGF0YSAmJiB0eFJlcXVlc3QuZGF0YSAhPT0gJzB4Jykge1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kYXRhLXNlY3Rpb24nKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGF0YScpLnRleHRDb250ZW50ID0gdHhSZXF1ZXN0LmRhdGE7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRhdGEtc2VjdGlvbicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVjb2RpbmcgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY29udHJhY3QtaW5mbycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgLy8gU2hvdyByYXcgZGF0YSBhcyBmYWxsYmFja1xyXG4gICAgICBpZiAodHhSZXF1ZXN0LmRhdGEgJiYgdHhSZXF1ZXN0LmRhdGEgIT09ICcweCcpIHtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGF0YS1zZWN0aW9uJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRhdGEnKS50ZXh0Q29udGVudCA9IHR4UmVxdWVzdC5kYXRhO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kYXRhLXNlY3Rpb24nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNob3cgdGhlIHRyYW5zYWN0aW9uIGFwcHJvdmFsIHNjcmVlblxyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXRyYW5zYWN0aW9uLWFwcHJvdmFsJyk7XHJcblxyXG4gICAgLy8gRmV0Y2ggYW5kIHBvcHVsYXRlIGdhcyBwcmljZSBvcHRpb25zXHJcbiAgICBhd2FpdCBwb3B1bGF0ZUdhc1ByaWNlcyhuZXR3b3JrLCB0eFJlcXVlc3QsIHN5bWJvbCk7XHJcblxyXG4gICAgLy8gRmV0Y2ggYW5kIGRpc3BsYXkgY3VycmVudCBub25jZVxyXG4gICAgYXdhaXQgZmV0Y2hBbmREaXNwbGF5Tm9uY2Uod2FsbGV0LmFkZHJlc3MsIG5ldHdvcmspO1xyXG5cclxuICAgIC8vIFNldHVwIGN1c3RvbSBub25jZSBjaGVja2JveFxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWN1c3RvbS1ub25jZS1jaGVja2JveCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdXN0b20tbm9uY2UtaW5wdXQtY29udGFpbmVyJyk7XHJcbiAgICAgIGlmIChlLnRhcmdldC5jaGVja2VkKSB7XHJcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIC8vIFByZS1maWxsIHdpdGggY3VycmVudCBub25jZVxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnROb25jZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXJyZW50LW5vbmNlJykudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgaWYgKGN1cnJlbnROb25jZSAhPT0gJy0tJykge1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWN1c3RvbS1ub25jZScpLnZhbHVlID0gY3VycmVudE5vbmNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNldHVwIGFwcHJvdmUgYnV0dG9uXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWFwcHJvdmUtdHJhbnNhY3Rpb24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgICAgY29uc3QgYXBwcm92ZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS10cmFuc2FjdGlvbicpO1xyXG4gICAgICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1wYXNzd29yZCcpLnZhbHVlO1xyXG4gICAgICBjb25zdCBlcnJvckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWVycm9yJyk7XHJcblxyXG4gICAgICBpZiAoIXBhc3N3b3JkKSB7XHJcbiAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9ICdQbGVhc2UgZW50ZXIgeW91ciBwYXNzd29yZCc7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIERpc2FibGUgYnV0dG9uIGltbWVkaWF0ZWx5IHRvIHByZXZlbnQgZG91YmxlLWNsaWNraW5nXHJcbiAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICBhcHByb3ZlQnRuLnN0eWxlLm9wYWNpdHkgPSAnMC41JztcclxuICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAnbm90LWFsbG93ZWQnO1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgYSB0ZW1wb3Jhcnkgc2Vzc2lvbiBmb3IgdGhpcyB0cmFuc2FjdGlvbiB1c2luZyB0aGUgZW50ZXJlZCBwYXNzd29yZFxyXG4gICAgICAgIC8vIFRoaXMgdmFsaWRhdGVzIHRoZSBwYXNzd29yZCB3aXRob3V0IHBhc3NpbmcgaXQgZm9yIHRoZSBhY3R1YWwgdHJhbnNhY3Rpb25cclxuICAgICAgICBjb25zdCBhY3RpdmVXYWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgICAgICBjb25zdCB0ZW1wU2Vzc2lvblJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgdHlwZTogJ0NSRUFURV9TRVNTSU9OJyxcclxuICAgICAgICAgIHBhc3N3b3JkLFxyXG4gICAgICAgICAgd2FsbGV0SWQ6IGFjdGl2ZVdhbGxldC5pZCxcclxuICAgICAgICAgIGR1cmF0aW9uTXM6IDYwMDAwIC8vIDEgbWludXRlIHRlbXBvcmFyeSBzZXNzaW9uXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICghdGVtcFNlc3Npb25SZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcGFzc3dvcmQnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEdldCBzZWxlY3RlZCBnYXMgcHJpY2VcclxuICAgICAgICBjb25zdCBnYXNQcmljZSA9IGdldFNlbGVjdGVkR2FzUHJpY2UoKTtcclxuXHJcbiAgICAgICAgLy8gR2V0IGN1c3RvbSBub25jZSBpZiBwcm92aWRlZFxyXG4gICAgICAgIGNvbnN0IGN1c3RvbU5vbmNlQ2hlY2tib3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtY3VzdG9tLW5vbmNlLWNoZWNrYm94Jyk7XHJcbiAgICAgICAgY29uc3QgY3VzdG9tTm9uY2VJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1jdXN0b20tbm9uY2UnKTtcclxuICAgICAgICBsZXQgY3VzdG9tTm9uY2UgPSBudWxsO1xyXG4gICAgICAgIGlmIChjdXN0b21Ob25jZUNoZWNrYm94LmNoZWNrZWQgJiYgY3VzdG9tTm9uY2VJbnB1dC52YWx1ZSkge1xyXG4gICAgICAgICAgY3VzdG9tTm9uY2UgPSBwYXJzZUludChjdXN0b21Ob25jZUlucHV0LnZhbHVlKTtcclxuICAgICAgICAgIGlmIChpc05hTihjdXN0b21Ob25jZSkgfHwgY3VzdG9tTm9uY2UgPCAwKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjdXN0b20gbm9uY2UnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgdHlwZTogJ1RSQU5TQUNUSU9OX0FQUFJPVkFMJyxcclxuICAgICAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgICAgIGFwcHJvdmVkOiB0cnVlLFxyXG4gICAgICAgICAgc2Vzc2lvblRva2VuOiB0ZW1wU2Vzc2lvblJlc3BvbnNlLnNlc3Npb25Ub2tlbixcclxuICAgICAgICAgIGdhc1ByaWNlLFxyXG4gICAgICAgICAgY3VzdG9tTm9uY2VcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIC8vIEhpZGUgYXBwcm92YWwgZm9ybSBhbmQgc2hvdyBzdGF0dXMgc2VjdGlvblxyXG4gICAgICAgICAgc2hvd1RyYW5zYWN0aW9uU3RhdHVzKHJlc3BvbnNlLnR4SGFzaCwgYWN0aXZlV2FsbGV0LmFkZHJlc3MsIHJlcXVlc3RJZCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSByZXNwb25zZS5lcnJvciB8fCAnVHJhbnNhY3Rpb24gZmFpbGVkJztcclxuICAgICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIGVycm9yIHNvIHVzZXIgY2FuIHRyeSBhZ2FpblxyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgLy8gUmUtZW5hYmxlIGJ1dHRvbiBvbiBlcnJvciBzbyB1c2VyIGNhbiB0cnkgYWdhaW5cclxuICAgICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICAgIGFwcHJvdmVCdG4uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTZXR1cCByZWplY3QgYnV0dG9uXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlamVjdC10cmFuc2FjdGlvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICAgIHR5cGU6ICdUUkFOU0FDVElPTl9BUFBST1ZBTCcsXHJcbiAgICAgICAgICByZXF1ZXN0SWQsXHJcbiAgICAgICAgICBhcHByb3ZlZDogZmFsc2VcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQ2xvc2UgdGhlIHBvcHVwIHdpbmRvd1xyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGFsZXJ0KCdFcnJvciByZWplY3RpbmcgdHJhbnNhY3Rpb246ICcgKyBlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBhbGVydCgnRXJyb3IgbG9hZGluZyB0cmFuc2FjdGlvbjogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgd2luZG93LmNsb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBUT0tFTiBBREQgQVBQUk9WQUwgPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVG9rZW5BZGRBcHByb3ZhbFNjcmVlbihyZXF1ZXN0SWQpIHtcclxuICAvLyBMb2FkIHNldHRpbmdzIGZvciB0aGVtZVxyXG4gIGF3YWl0IGxvYWRTZXR0aW5ncygpO1xyXG4gIGFwcGx5VGhlbWUoKTtcclxuXHJcbiAgLy8gR2V0IHRva2VuIGFkZCByZXF1ZXN0IGRldGFpbHMgZnJvbSBiYWNrZ3JvdW5kXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX1RPS0VOX0FERF9SRVFVRVNUJyxcclxuICAgICAgcmVxdWVzdElkXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgYWxlcnQoJ1Rva2VuIGFkZCByZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyk7XHJcbiAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyBvcmlnaW4sIHRva2VuSW5mbyB9ID0gcmVzcG9uc2U7XHJcblxyXG4gICAgLy8gUG9wdWxhdGUgdG9rZW4gZGV0YWlsc1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLXNpdGUtb3JpZ2luJykudGV4dENvbnRlbnQgPSBvcmlnaW47XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4tc3ltYm9sJykudGV4dENvbnRlbnQgPSB0b2tlbkluZm8uc3ltYm9sO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWFkZHJlc3MnKS50ZXh0Q29udGVudCA9IHRva2VuSW5mby5hZGRyZXNzO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWRlY2ltYWxzJykudGV4dENvbnRlbnQgPSB0b2tlbkluZm8uZGVjaW1hbHM7XHJcblxyXG4gICAgLy8gU2hvdyB0b2tlbiBpbWFnZSBpZiBwcm92aWRlZFxyXG4gICAgaWYgKHRva2VuSW5mby5pbWFnZSkge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4taW1hZ2UnKS5zcmMgPSB0b2tlbkluZm8uaW1hZ2U7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2tlbi1pbWFnZS1zZWN0aW9uJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW4taW1hZ2Utc2VjdGlvbicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNob3cgdGhlIHRva2VuIGFwcHJvdmFsIHNjcmVlblxyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLWFkZC10b2tlbicpO1xyXG5cclxuICAgIC8vIFNldHVwIGFwcHJvdmUgYnV0dG9uXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWFwcHJvdmUtdG9rZW4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgICAgY29uc3QgYXBwcm92ZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS10b2tlbicpO1xyXG4gICAgICBjb25zdCBlcnJvckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rva2VuLWVycm9yJyk7XHJcblxyXG4gICAgICAvLyBEaXNhYmxlIGJ1dHRvbiBpbW1lZGlhdGVseSB0byBwcmV2ZW50IGRvdWJsZS1jbGlja2luZ1xyXG4gICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzAuNSc7XHJcbiAgICAgIGFwcHJvdmVCdG4uc3R5bGUuY3Vyc29yID0gJ25vdC1hbGxvd2VkJztcclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgLy8gU2VuZCBhcHByb3ZhbCB0byBiYWNrZ3JvdW5kXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnVE9LRU5fQUREX0FQUFJPVkFMJyxcclxuICAgICAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgICAgIGFwcHJvdmVkOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAvLyBBZGQgdGhlIHRva2VuIHRvIHN0b3JhZ2UgdXNpbmcgZXhpc3RpbmcgdG9rZW4gbWFuYWdlbWVudFxyXG4gICAgICAgICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJykgfHwgJ3B1bHNlY2hhaW5UZXN0bmV0JztcclxuICAgICAgICAgIGF3YWl0IHRva2Vucy5hZGRDdXN0b21Ub2tlbihuZXR3b3JrLCB0b2tlbkluZm8uYWRkcmVzcywgdG9rZW5JbmZvLnN5bWJvbCwgdG9rZW5JbmZvLmRlY2ltYWxzKTtcclxuXHJcbiAgICAgICAgICAvLyBDbG9zZSB0aGUgcG9wdXAgd2luZG93XHJcbiAgICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IHJlc3BvbnNlLmVycm9yIHx8ICdGYWlsZWQgdG8gYWRkIHRva2VuJztcclxuICAgICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIGVycm9yIHNvIHVzZXIgY2FuIHRyeSBhZ2FpblxyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgLy8gUmUtZW5hYmxlIGJ1dHRvbiBvbiBlcnJvciBzbyB1c2VyIGNhbiB0cnkgYWdhaW5cclxuICAgICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICAgIGFwcHJvdmVCdG4uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTZXR1cCByZWplY3QgYnV0dG9uXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlamVjdC10b2tlbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICAgIHR5cGU6ICdUT0tFTl9BRERfQVBQUk9WQUwnLFxyXG4gICAgICAgICAgcmVxdWVzdElkLFxyXG4gICAgICAgICAgYXBwcm92ZWQ6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIENsb3NlIHRoZSBwb3B1cCB3aW5kb3dcclxuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBhbGVydCgnRXJyb3IgcmVqZWN0aW5nIHRva2VuOiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWxlcnQoJ0Vycm9yIGxvYWRpbmcgdG9rZW4gYWRkIHJlcXVlc3Q6ICcgKyBzYW5pdGl6ZUVycm9yKGVycm9yLm1lc3NhZ2UpKTtcclxuICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gTUVTU0FHRSBTSUdOSU5HIEFQUFJPVkFMIEhBTkRMRVJTID09PT09XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVNZXNzYWdlU2lnbkFwcHJvdmFsU2NyZWVuKHJlcXVlc3RJZCkge1xyXG4gIC8vIExvYWQgc2V0dGluZ3MgZm9yIHRoZW1lXHJcbiAgYXdhaXQgbG9hZFNldHRpbmdzKCk7XHJcbiAgYXBwbHlUaGVtZSgpO1xyXG5cclxuICAvLyBHZXQgc2lnbiByZXF1ZXN0IGRldGFpbHMgZnJvbSBiYWNrZ3JvdW5kXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX1NJR05fUkVRVUVTVCcsXHJcbiAgICAgIHJlcXVlc3RJZFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2Uub3JpZ2luKSB7XHJcbiAgICAgIGFsZXJ0KCdTaWduIHJlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnKTtcclxuICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB7IG9yaWdpbiwgbWV0aG9kLCBzaWduUmVxdWVzdCB9ID0gcmVzcG9uc2U7XHJcbiAgICBjb25zdCB7IG1lc3NhZ2UsIGFkZHJlc3MgfSA9IHNpZ25SZXF1ZXN0O1xyXG5cclxuICAgIC8vIFBvcHVsYXRlIHNpZ24gZGV0YWlsc1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tc2l0ZS1vcmlnaW4nKS50ZXh0Q29udGVudCA9IG9yaWdpbjtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLWFkZHJlc3MnKS50ZXh0Q29udGVudCA9IGFkZHJlc3M7XHJcblxyXG4gICAgLy8gU2hvdyBEQU5HRVIgd2FybmluZyBpZiB0aGlzIGlzIGV0aF9zaWduXHJcbiAgICBjb25zdCBldGhTaWduV2FybmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdldGgtc2lnbi1kYW5nZXItd2FybmluZycpO1xyXG4gICAgaWYgKG1ldGhvZCA9PT0gJ2V0aF9zaWduJykge1xyXG4gICAgICBldGhTaWduV2FybmluZy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgY29uc29sZS53YXJuKCfimqDvuI8gREFOR0VSOiBldGhfc2lnbiByZXF1ZXN0IGZyb20nLCBvcmlnaW4pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZXRoU2lnbldhcm5pbmcuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRm9ybWF0IG1lc3NhZ2UgZm9yIGRpc3BsYXlcclxuICAgIGNvbnN0IG1lc3NhZ2VFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLW1lc3NhZ2UtY29udGVudCcpO1xyXG4gICAgbGV0IGRpc3BsYXlNZXNzYWdlID0gbWVzc2FnZTtcclxuXHJcbiAgICAvLyBDaGVjayBpZiBtZXNzYWdlIGlzIGhleC1lbmNvZGVkXHJcbiAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnICYmIG1lc3NhZ2Uuc3RhcnRzV2l0aCgnMHgnKSkge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi1tZXNzYWdlLWhleC13YXJuaW5nJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIC8vIFRyeSB0byBkZWNvZGUgaWYgaXQncyByZWFkYWJsZSB0ZXh0XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgYnl0ZXMgPSBldGhlcnMuZ2V0Qnl0ZXMobWVzc2FnZSk7XHJcbiAgICAgICAgY29uc3QgZGVjb2RlZCA9IGV0aGVycy50b1V0ZjhTdHJpbmcoYnl0ZXMpO1xyXG4gICAgICAgIGlmICgvXltcXHgyMC1cXHg3RVxcc10rJC8udGVzdChkZWNvZGVkKSkge1xyXG4gICAgICAgICAgZGlzcGxheU1lc3NhZ2UgPSBkZWNvZGVkICsgJ1xcblxcbltIZXg6ICcgKyBtZXNzYWdlICsgJ10nO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgLy8gS2VlcCBhcyBoZXggaWYgZGVjb2RpbmcgZmFpbHNcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tbWVzc2FnZS1oZXgtd2FybmluZycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgfVxyXG5cclxuICAgIG1lc3NhZ2VFbC50ZXh0Q29udGVudCA9IGRpc3BsYXlNZXNzYWdlO1xyXG5cclxuICAgIC8vIFNob3cgdGhlIHNpZ25pbmcgYXBwcm92YWwgc2NyZWVuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tc2lnbi1tZXNzYWdlJyk7XHJcblxyXG4gICAgLy8gU2V0dXAgYXBwcm92ZSBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS1zaWduJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFwcHJvdmVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWFwcHJvdmUtc2lnbicpO1xyXG4gICAgICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLXBhc3N3b3JkJykudmFsdWU7XHJcbiAgICAgIGNvbnN0IGVycm9yRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi1lcnJvcicpO1xyXG5cclxuICAgICAgaWYgKCFwYXNzd29yZCkge1xyXG4gICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSAnUGxlYXNlIGVudGVyIHlvdXIgcGFzc3dvcmQnO1xyXG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBEaXNhYmxlIGJ1dHRvbiBpbW1lZGlhdGVseSB0byBwcmV2ZW50IGRvdWJsZS1jbGlja2luZ1xyXG4gICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzAuNSc7XHJcbiAgICAgIGFwcHJvdmVCdG4uc3R5bGUuY3Vyc29yID0gJ25vdC1hbGxvd2VkJztcclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IHNlc3Npb24gZm9yIHRoaXMgc2lnbmluZyB1c2luZyB0aGUgZW50ZXJlZCBwYXNzd29yZFxyXG4gICAgICAgIGNvbnN0IGFjdGl2ZVdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBTZXNzaW9uUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnQ1JFQVRFX1NFU1NJT04nLFxyXG4gICAgICAgICAgcGFzc3dvcmQsXHJcbiAgICAgICAgICB3YWxsZXRJZDogYWN0aXZlV2FsbGV0LmlkLFxyXG4gICAgICAgICAgZHVyYXRpb25NczogNjAwMDAgLy8gMSBtaW51dGUgdGVtcG9yYXJ5IHNlc3Npb25cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKCF0ZW1wU2Vzc2lvblJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwYXNzd29yZCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnU0lHTl9BUFBST1ZBTCcsXHJcbiAgICAgICAgICByZXF1ZXN0SWQsXHJcbiAgICAgICAgICBhcHByb3ZlZDogdHJ1ZSxcclxuICAgICAgICAgIHNlc3Npb25Ub2tlbjogdGVtcFNlc3Npb25SZXNwb25zZS5zZXNzaW9uVG9rZW5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIC8vIENsb3NlIHRoZSBwb3B1cCB3aW5kb3dcclxuICAgICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gcmVzcG9uc2UuZXJyb3IgfHwgJ1NpZ25pbmcgZmFpbGVkJztcclxuICAgICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAvLyBSZS1lbmFibGUgYnV0dG9uIG9uIGVycm9yIHNvIHVzZXIgY2FuIHRyeSBhZ2FpblxyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgLy8gUmUtZW5hYmxlIGJ1dHRvbiBvbiBlcnJvciBzbyB1c2VyIGNhbiB0cnkgYWdhaW5cclxuICAgICAgICBhcHByb3ZlQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgYXBwcm92ZUJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICAgIGFwcHJvdmVCdG4uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTZXR1cCByZWplY3QgYnV0dG9uXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlamVjdC1zaWduJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgdHlwZTogJ1NJR05fQVBQUk9WQUwnLFxyXG4gICAgICAgICAgcmVxdWVzdElkLFxyXG4gICAgICAgICAgYXBwcm92ZWQ6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIENsb3NlIHRoZSBwb3B1cCB3aW5kb3dcclxuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBhbGVydCgnRXJyb3IgcmVqZWN0aW5nIHNpZ24gcmVxdWVzdDogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGFsZXJ0KCdFcnJvciBsb2FkaW5nIHNpZ24gcmVxdWVzdDogJyArIHNhbml0aXplRXJyb3IoZXJyb3IubWVzc2FnZSkpO1xyXG4gICAgd2luZG93LmNsb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUeXBlZERhdGFTaWduQXBwcm92YWxTY3JlZW4ocmVxdWVzdElkKSB7XHJcbiAgLy8gTG9hZCBzZXR0aW5ncyBmb3IgdGhlbWVcclxuICBhd2FpdCBsb2FkU2V0dGluZ3MoKTtcclxuICBhcHBseVRoZW1lKCk7XHJcblxyXG4gIC8vIEdldCBzaWduIHJlcXVlc3QgZGV0YWlscyBmcm9tIGJhY2tncm91bmRcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdHRVRfU0lHTl9SRVFVRVNUJyxcclxuICAgICAgcmVxdWVzdElkXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5vcmlnaW4pIHtcclxuICAgICAgYWxlcnQoJ1NpZ24gcmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcpO1xyXG4gICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgb3JpZ2luLCBtZXRob2QsIHNpZ25SZXF1ZXN0IH0gPSByZXNwb25zZTtcclxuICAgIGNvbnN0IHsgdHlwZWREYXRhLCBhZGRyZXNzIH0gPSBzaWduUmVxdWVzdDtcclxuXHJcbiAgICAvLyBQb3B1bGF0ZSBzaWduIGRldGFpbHNcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLXR5cGVkLXNpdGUtb3JpZ2luJykudGV4dENvbnRlbnQgPSBvcmlnaW47XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi10eXBlZC1hZGRyZXNzJykudGV4dENvbnRlbnQgPSBhZGRyZXNzO1xyXG5cclxuICAgIC8vIFBvcHVsYXRlIGRvbWFpbiBpbmZvcm1hdGlvblxyXG4gICAgaWYgKHR5cGVkRGF0YS5kb21haW4pIHtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tdHlwZWQtZG9tYWluLW5hbWUnKS50ZXh0Q29udGVudCA9IHR5cGVkRGF0YS5kb21haW4ubmFtZSB8fCAnVW5rbm93bic7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLXR5cGVkLWRvbWFpbi1jaGFpbicpLnRleHRDb250ZW50ID0gdHlwZWREYXRhLmRvbWFpbi5jaGFpbklkIHx8ICctLSc7XHJcblxyXG4gICAgICBpZiAodHlwZWREYXRhLmRvbWFpbi52ZXJpZnlpbmdDb250cmFjdCkge1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLXR5cGVkLWRvbWFpbi1jb250cmFjdCcpLnRleHRDb250ZW50ID0gdHlwZWREYXRhLmRvbWFpbi52ZXJpZnlpbmdDb250cmFjdDtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi10eXBlZC1kb21haW4tY29udHJhY3Qtcm93JykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tdHlwZWQtZG9tYWluLWNvbnRyYWN0LXJvdycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRm9ybWF0IHR5cGVkIGRhdGEgZm9yIGRpc3BsYXlcclxuICAgIGNvbnN0IG1lc3NhZ2VFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduLXR5cGVkLW1lc3NhZ2UtY29udGVudCcpO1xyXG4gICAgY29uc3QgZGlzcGxheURhdGEgPSB7XHJcbiAgICAgIHByaW1hcnlUeXBlOiB0eXBlZERhdGEucHJpbWFyeVR5cGUgfHwgJ1Vua25vd24nLFxyXG4gICAgICBtZXNzYWdlOiB0eXBlZERhdGEubWVzc2FnZVxyXG4gICAgfTtcclxuICAgIG1lc3NhZ2VFbC50ZXh0Q29udGVudCA9IEpTT04uc3RyaW5naWZ5KGRpc3BsYXlEYXRhLCBudWxsLCAyKTtcclxuXHJcbiAgICAvLyBTaG93IHRoZSBzaWduaW5nIGFwcHJvdmFsIHNjcmVlblxyXG4gICAgc2hvd1NjcmVlbignc2NyZWVuLXNpZ24tdHlwZWQtZGF0YScpO1xyXG5cclxuICAgIC8vIFNldHVwIGFwcHJvdmUgYnV0dG9uXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWFwcHJvdmUtc2lnbi10eXBlZCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBhcHByb3ZlQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1hcHByb3ZlLXNpZ24tdHlwZWQnKTtcclxuICAgICAgY29uc3QgcGFzc3dvcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbi10eXBlZC1wYXNzd29yZCcpLnZhbHVlO1xyXG4gICAgICBjb25zdCBlcnJvckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ24tdHlwZWQtZXJyb3InKTtcclxuXHJcbiAgICAgIGlmICghcGFzc3dvcmQpIHtcclxuICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gJ1BsZWFzZSBlbnRlciB5b3VyIHBhc3N3b3JkJztcclxuICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRGlzYWJsZSBidXR0b24gaW1tZWRpYXRlbHkgdG8gcHJldmVudCBkb3VibGUtY2xpY2tpbmdcclxuICAgICAgYXBwcm92ZUJ0bi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgIGFwcHJvdmVCdG4uc3R5bGUub3BhY2l0eSA9ICcwLjUnO1xyXG4gICAgICBhcHByb3ZlQnRuLnN0eWxlLmN1cnNvciA9ICdub3QtYWxsb3dlZCc7XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhIHRlbXBvcmFyeSBzZXNzaW9uIGZvciB0aGlzIHNpZ25pbmcgdXNpbmcgdGhlIGVudGVyZWQgcGFzc3dvcmRcclxuICAgICAgICBjb25zdCBhY3RpdmVXYWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgICAgICBjb25zdCB0ZW1wU2Vzc2lvblJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgdHlwZTogJ0NSRUFURV9TRVNTSU9OJyxcclxuICAgICAgICAgIHBhc3N3b3JkLFxyXG4gICAgICAgICAgd2FsbGV0SWQ6IGFjdGl2ZVdhbGxldC5pZCxcclxuICAgICAgICAgIGR1cmF0aW9uTXM6IDYwMDAwIC8vIDEgbWludXRlIHRlbXBvcmFyeSBzZXNzaW9uXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICghdGVtcFNlc3Npb25SZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcGFzc3dvcmQnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgdHlwZTogJ1NJR05fQVBQUk9WQUwnLFxyXG4gICAgICAgICAgcmVxdWVzdElkLFxyXG4gICAgICAgICAgYXBwcm92ZWQ6IHRydWUsXHJcbiAgICAgICAgICBzZXNzaW9uVG9rZW46IHRlbXBTZXNzaW9uUmVzcG9uc2Uuc2Vzc2lvblRva2VuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAvLyBDbG9zZSB0aGUgcG9wdXAgd2luZG93XHJcbiAgICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IHJlc3BvbnNlLmVycm9yIHx8ICdTaWduaW5nIGZhaWxlZCc7XHJcbiAgICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgLy8gUmUtZW5hYmxlIGJ1dHRvbiBvbiBlcnJvciBzbyB1c2VyIGNhbiB0cnkgYWdhaW5cclxuICAgICAgICAgIGFwcHJvdmVCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgIGFwcHJvdmVCdG4uc3R5bGUub3BhY2l0eSA9ICcxJztcclxuICAgICAgICAgIGFwcHJvdmVCdG4uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gZXJyb3IubWVzc2FnZTtcclxuICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIC8vIFJlLWVuYWJsZSBidXR0b24gb24gZXJyb3Igc28gdXNlciBjYW4gdHJ5IGFnYWluXHJcbiAgICAgICAgYXBwcm92ZUJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGFwcHJvdmVCdG4uc3R5bGUub3BhY2l0eSA9ICcxJztcclxuICAgICAgICBhcHByb3ZlQnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2V0dXAgcmVqZWN0IGJ1dHRvblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1yZWplY3Qtc2lnbi10eXBlZCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICAgIHR5cGU6ICdTSUdOX0FQUFJPVkFMJyxcclxuICAgICAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgICAgIGFwcHJvdmVkOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBDbG9zZSB0aGUgcG9wdXAgd2luZG93XHJcbiAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgYWxlcnQoJ0Vycm9yIHJlamVjdGluZyBzaWduIHJlcXVlc3Q6ICcgKyBlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBhbGVydCgnRXJyb3IgbG9hZGluZyB0eXBlZCBkYXRhIHNpZ24gcmVxdWVzdDogJyArIHNhbml0aXplRXJyb3IoZXJyb3IubWVzc2FnZSkpO1xyXG4gICAgd2luZG93LmNsb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBUUkFOU0FDVElPTiBISVNUT1JZID09PT09XHJcbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVBlbmRpbmdUeEluZGljYXRvcigpIHtcclxuICBpZiAoIWN1cnJlbnRTdGF0ZS5hZGRyZXNzKSByZXR1cm47XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0dFVF9QRU5ESU5HX1RYX0NPVU5UJyxcclxuICAgICAgYWRkcmVzczogY3VycmVudFN0YXRlLmFkZHJlc3NcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGluZGljYXRvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwZW5kaW5nLXR4LWluZGljYXRvcicpO1xyXG4gICAgY29uc3QgdGV4dEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlbmRpbmctdHgtdGV4dCcpO1xyXG5cclxuICAgIGlmIChyZXNwb25zZS5zdWNjZXNzICYmIHJlc3BvbnNlLmNvdW50ID4gMCkge1xyXG4gICAgICB0ZXh0RWwudGV4dENvbnRlbnQgPSBg4pqg77iPICR7cmVzcG9uc2UuY291bnR9IFBlbmRpbmcgVHJhbnNhY3Rpb24ke3Jlc3BvbnNlLmNvdW50ID4gMSA/ICdzJyA6ICcnfWA7XHJcbiAgICAgIGluZGljYXRvci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGluZGljYXRvci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgY2hlY2tpbmcgcGVuZGluZyB0cmFuc2FjdGlvbnM6JywgZXJyb3IpO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2hvd1RyYW5zYWN0aW9uSGlzdG9yeSgpIHtcclxuICBpZiAoIWN1cnJlbnRTdGF0ZS5hZGRyZXNzKSByZXR1cm47XHJcblxyXG4gIHNob3dTY3JlZW4oJ3NjcmVlbi10eC1oaXN0b3J5Jyk7XHJcbiAgYXdhaXQgcmVuZGVyVHJhbnNhY3Rpb25IaXN0b3J5KCdhbGwnKTtcclxufVxyXG5cclxuLy8gUmVmcmVzaCB0cmFuc2FjdGlvbiBmcm9tIHRoZSBsaXN0IHZpZXdcclxuYXN5bmMgZnVuY3Rpb24gcmVmcmVzaFRyYW5zYWN0aW9uRnJvbUxpc3QodHhIYXNoKSB7XHJcbiAgaWYgKCFjdXJyZW50U3RhdGUuYWRkcmVzcykgcmV0dXJuO1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gR2V0IHRyYW5zYWN0aW9uIHRvIGdldCBuZXR3b3JrXHJcbiAgICBjb25zdCB0eFJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX1RYX0JZX0hBU0gnLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzcyxcclxuICAgICAgdHhIYXNoOiB0eEhhc2hcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghdHhSZXNwb25zZS5zdWNjZXNzIHx8ICF0eFJlc3BvbnNlLnRyYW5zYWN0aW9uKSB7XHJcbiAgICAgIGFsZXJ0KCdUcmFuc2FjdGlvbiBub3QgZm91bmQnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5ldHdvcmsgPSB0eFJlc3BvbnNlLnRyYW5zYWN0aW9uLm5ldHdvcms7XHJcblxyXG4gICAgLy8gUmVmcmVzaCBzdGF0dXMgZnJvbSBibG9ja2NoYWluXHJcbiAgICBjb25zdCByZWZyZXNoUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdSRUZSRVNIX1RYX1NUQVRVUycsXHJcbiAgICAgIGFkZHJlc3M6IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLFxyXG4gICAgICB0eEhhc2g6IHR4SGFzaCxcclxuICAgICAgbmV0d29yazogbmV0d29ya1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFyZWZyZXNoUmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICBhbGVydCgnRXJyb3I6ICcgKyByZWZyZXNoUmVzcG9uc2UuZXJyb3IpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2hvdyBicmllZiBub3RpZmljYXRpb25cclxuICAgIGlmIChyZWZyZXNoUmVzcG9uc2Uuc3RhdHVzID09PSAnY29uZmlybWVkJykge1xyXG4gICAgICBhbGVydChg4pyFIFRyYW5zYWN0aW9uIGNvbmZpcm1lZCBvbiBibG9jayAke3JlZnJlc2hSZXNwb25zZS5ibG9ja051bWJlcn0hYCk7XHJcbiAgICB9IGVsc2UgaWYgKHJlZnJlc2hSZXNwb25zZS5zdGF0dXMgPT09ICdmYWlsZWQnKSB7XHJcbiAgICAgIGFsZXJ0KCfinYwgVHJhbnNhY3Rpb24gZmFpbGVkIG9uIGJsb2NrY2hhaW4nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFsZXJ0KCfij7MgU3RpbGwgcGVuZGluZyBvbiBibG9ja2NoYWluJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVmcmVzaCB0aGUgdHJhbnNhY3Rpb24gbGlzdCB0byBzaG93IHVwZGF0ZWQgc3RhdHVzXHJcbiAgICBhd2FpdCByZW5kZXJUcmFuc2FjdGlvbkhpc3RvcnkoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2lkXj1cImZpbHRlci1cIl1bY2xhc3MqPVwiYWN0aXZlXCJdJyk/LmlkLnJlcGxhY2UoJ2ZpbHRlci0nLCAnJykucmVwbGFjZSgnLXR4cycsICcnKSB8fCAnYWxsJyk7XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciByZWZyZXNoaW5nIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIGFsZXJ0KCdFcnJvciByZWZyZXNoaW5nIHN0YXR1cycpO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcmVuZGVyVHJhbnNhY3Rpb25IaXN0b3J5KGZpbHRlciA9ICdhbGwnKSB7XHJcbiAgY29uc3QgbGlzdEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWhpc3RvcnktbGlzdCcpO1xyXG4gIGlmICghY3VycmVudFN0YXRlLmFkZHJlc3MpIHtcclxuICAgIGxpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPk5vIGFkZHJlc3Mgc2VsZWN0ZWQ8L3A+JztcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGxpc3RFbC5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LWRpbVwiPkxvYWRpbmcuLi48L3A+JztcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX1RYX0hJU1RPUlknLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzc1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFyZXNwb25zZS5zdWNjZXNzIHx8ICFyZXNwb25zZS50cmFuc2FjdGlvbnMgfHwgcmVzcG9uc2UudHJhbnNhY3Rpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBsaXN0RWwuaW5uZXJIVE1MID0gJzxwIGNsYXNzPVwidGV4dC1jZW50ZXIgdGV4dC1kaW1cIj5ObyB0cmFuc2FjdGlvbnM8L3A+JztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCB0cmFuc2FjdGlvbnMgPSByZXNwb25zZS50cmFuc2FjdGlvbnM7XHJcblxyXG4gICAgLy8gQXBwbHkgZmlsdGVyXHJcbiAgICBpZiAoZmlsdGVyID09PSAncGVuZGluZycpIHtcclxuICAgICAgdHJhbnNhY3Rpb25zID0gdHJhbnNhY3Rpb25zLmZpbHRlcih0eCA9PiB0eC5zdGF0dXMgPT09ICdwZW5kaW5nJyk7XHJcbiAgICB9IGVsc2UgaWYgKGZpbHRlciA9PT0gJ2NvbmZpcm1lZCcpIHtcclxuICAgICAgdHJhbnNhY3Rpb25zID0gdHJhbnNhY3Rpb25zLmZpbHRlcih0eCA9PiB0eC5zdGF0dXMgPT09ICdjb25maXJtZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHJhbnNhY3Rpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBsaXN0RWwuaW5uZXJIVE1MID0gJzxwIGNsYXNzPVwidGV4dC1jZW50ZXIgdGV4dC1kaW1cIj5ObyB0cmFuc2FjdGlvbnMgaW4gdGhpcyBmaWx0ZXI8L3A+JztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBodG1sID0gJyc7XHJcbiAgICBmb3IgKGNvbnN0IHR4IG9mIHRyYW5zYWN0aW9ucykge1xyXG4gICAgICBjb25zdCBzdGF0dXNJY29uID0gdHguc3RhdHVzID09PSAncGVuZGluZycgPyAn4o+zJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR4LnN0YXR1cyA9PT0gJ2NvbmZpcm1lZCcgPyAn4pyFJyA6ICfinYwnO1xyXG4gICAgICBjb25zdCBzdGF0dXNDb2xvciA9IHR4LnN0YXR1cyA9PT0gJ3BlbmRpbmcnID8gJ3ZhcigtLXRlcm1pbmFsLXdhcm5pbmcpJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICB0eC5zdGF0dXMgPT09ICdjb25maXJtZWQnID8gJyM0NGZmNDQnIDogJyNmZjQ0NDQnO1xyXG5cclxuICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHR4LnRpbWVzdGFtcCkudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgICAgY29uc3QgdmFsdWVFdGggPSBldGhlcnMuZm9ybWF0RXRoZXIodHgudmFsdWUgfHwgJzAnKTtcclxuICAgICAgY29uc3QgZ2FzR3dlaSA9IGV0aGVycy5mb3JtYXRVbml0cyh0eC5nYXNQcmljZSB8fCAnMCcsICdnd2VpJyk7XHJcblxyXG4gICAgICAvLyBBZGQgcmVmcmVzaCBidXR0b24gZm9yIHBlbmRpbmcgdHJhbnNhY3Rpb25zXHJcbiAgICAgIGNvbnN0IHJlZnJlc2hCdXR0b24gPSB0eC5zdGF0dXMgPT09ICdwZW5kaW5nJ1xyXG4gICAgICAgID8gYDxidXR0b24gY2xhc3M9XCJidG4tc21hbGxcIiBzdHlsZT1cImZvbnQtc2l6ZTogOXB4OyBwYWRkaW5nOiA0cHggOHB4OyBtYXJnaW4tbGVmdDogOHB4O1wiIGRhdGEtcmVmcmVzaC10eD1cIiR7dHguaGFzaH1cIj7wn5SEIFJlZnJlc2g8L2J1dHRvbj5gXHJcbiAgICAgICAgOiAnJztcclxuXHJcbiAgICAgIGh0bWwgKz0gYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJwYW5lbCBtYi0yXCIgc3R5bGU9XCJwYWRkaW5nOiAxMnB4OyBjdXJzb3I6IHBvaW50ZXI7IGJvcmRlci1jb2xvcjogJHtzdGF0dXNDb2xvcn07XCIgZGF0YS10eC1oYXNoPVwiJHt0eC5oYXNofVwiPlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgYWxpZ24taXRlbXM6IGNlbnRlcjsgbWFyZ2luLWJvdHRvbTogOHB4O1wiPlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjtcIj5cclxuICAgICAgICAgICAgICA8c3BhbiBzdHlsZT1cImNvbG9yOiAke3N0YXR1c0NvbG9yfTsgZm9udC1zaXplOiAxNHB4O1wiPiR7c3RhdHVzSWNvbn0gJHt0eC5zdGF0dXMudG9VcHBlckNhc2UoKX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgJHtyZWZyZXNoQnV0dG9ufVxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMHB4O1wiPiR7ZGF0ZX08L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1kaW1cIiBzdHlsZT1cImZvbnQtc2l6ZTogMTBweDsgbWFyZ2luLWJvdHRvbTogNHB4O1wiPkhhc2g6ICR7dHguaGFzaC5zbGljZSgwLCAyMCl9Li4uPC9wPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LWRpbVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMHB4OyBtYXJnaW4tYm90dG9tOiA0cHg7XCI+VmFsdWU6ICR7dmFsdWVFdGh9ICR7Z2V0TmV0d29ya1N5bWJvbCh0eC5uZXR3b3JrKX08L3A+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cInRleHQtZGltXCIgc3R5bGU9XCJmb250LXNpemU6IDEwcHg7XCI+R2FzOiAke2dhc0d3ZWl9IEd3ZWkg4oCiIE5vbmNlOiAke3R4Lm5vbmNlfTwvcD5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgYDtcclxuICAgIH1cclxuXHJcbiAgICBsaXN0RWwuaW5uZXJIVE1MID0gaHRtbDtcclxuXHJcbiAgICAvLyBBZGQgY2xpY2sgaGFuZGxlcnMgZm9yIHRyYW5zYWN0aW9uIGl0ZW1zXHJcbiAgICBsaXN0RWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdHgtaGFzaF0nKS5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdHhIYXNoID0gZWwuZGF0YXNldC50eEhhc2g7XHJcbiAgICAgICAgc2hvd1RyYW5zYWN0aW9uRGV0YWlscyh0eEhhc2gpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFkZCBjbGljayBoYW5kbGVycyBmb3IgcmVmcmVzaCBidXR0b25zXHJcbiAgICBsaXN0RWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtcmVmcmVzaC10eF0nKS5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpOyAvLyBQcmV2ZW50IGRlZmF1bHQgYnV0dG9uIGJlaGF2aW9yXHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTsgLy8gUHJldmVudCBvcGVuaW5nIHRyYW5zYWN0aW9uIGRldGFpbHNcclxuICAgICAgICBjb25zdCB0eEhhc2ggPSBidG4uZGF0YXNldC5yZWZyZXNoVHg7XHJcbiAgICAgICAgYXdhaXQgcmVmcmVzaFRyYW5zYWN0aW9uRnJvbUxpc3QodHhIYXNoKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGxvYWRpbmcgdHJhbnNhY3Rpb24gaGlzdG9yeTonLCBlcnJvcik7XHJcbiAgICBsaXN0RWwuaW5uZXJIVE1MID0gJzxwIGNsYXNzPVwidGV4dC1jZW50ZXIgdGV4dC1kaW1cIj5FcnJvciBsb2FkaW5nIHRyYW5zYWN0aW9uczwvcD4nO1xyXG4gIH1cclxufVxyXG5cclxuLy8gUmVmcmVzaCB0cmFuc2FjdGlvbiBzdGF0dXMgZnJvbSBibG9ja2NoYWluXHJcbmFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hUcmFuc2FjdGlvblN0YXR1cygpIHtcclxuICBpZiAoIWN1cnJlbnRTdGF0ZS5hZGRyZXNzIHx8ICFjdXJyZW50U3RhdGUuY3VycmVudFR4SGFzaCkgcmV0dXJuO1xyXG5cclxuICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlZnJlc2gtdHgtc3RhdHVzJyk7XHJcbiAgaWYgKCFidG4pIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGJ0bi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICBidG4udGV4dENvbnRlbnQgPSAn4o+zIENoZWNraW5nIGJsb2NrY2hhaW4uLi4nO1xyXG5cclxuICAgIC8vIEdldCBjdXJyZW50IHRyYW5zYWN0aW9uIHRvIGdldCBuZXR3b3JrXHJcbiAgICBjb25zdCB0eFJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX1RYX0JZX0hBU0gnLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzcyxcclxuICAgICAgdHhIYXNoOiBjdXJyZW50U3RhdGUuY3VycmVudFR4SGFzaFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCF0eFJlc3BvbnNlLnN1Y2Nlc3MgfHwgIXR4UmVzcG9uc2UudHJhbnNhY3Rpb24pIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUcmFuc2FjdGlvbiBub3QgZm91bmQnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBuZXR3b3JrID0gdHhSZXNwb25zZS50cmFuc2FjdGlvbi5uZXR3b3JrO1xyXG5cclxuICAgIC8vIFJlZnJlc2ggc3RhdHVzIGZyb20gYmxvY2tjaGFpblxyXG4gICAgY29uc3QgcmVmcmVzaFJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnUkVGUkVTSF9UWF9TVEFUVVMnLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzcyxcclxuICAgICAgdHhIYXNoOiBjdXJyZW50U3RhdGUuY3VycmVudFR4SGFzaCxcclxuICAgICAgbmV0d29yazogbmV0d29ya1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFyZWZyZXNoUmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IocmVmcmVzaFJlc3BvbnNlLmVycm9yIHx8ICdGYWlsZWQgdG8gcmVmcmVzaCBzdGF0dXMnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTaG93IHJlc3VsdCBtZXNzYWdlXHJcbiAgICBpZiAocmVmcmVzaFJlc3BvbnNlLnN0YXR1cyA9PT0gJ3BlbmRpbmcnKSB7XHJcbiAgICAgIGFsZXJ0KCfinIsgVHJhbnNhY3Rpb24gaXMgc3RpbGwgcGVuZGluZyBvbiB0aGUgYmxvY2tjaGFpbi5cXG5cXG5JdCBoYXMgbm90IGJlZW4gbWluZWQgeWV0LicpO1xyXG4gICAgfSBlbHNlIGlmIChyZWZyZXNoUmVzcG9uc2Uuc3RhdHVzID09PSAnY29uZmlybWVkJykge1xyXG4gICAgICBhbGVydChg4pyFIFN0YXR1cyB1cGRhdGVkIVxcblxcblRyYW5zYWN0aW9uIGlzIENPTkZJUk1FRCBvbiBibG9jayAke3JlZnJlc2hSZXNwb25zZS5ibG9ja051bWJlcn1gKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFsZXJ0KCfinYwgU3RhdHVzIHVwZGF0ZWQhXFxuXFxuVHJhbnNhY3Rpb24gRkFJTEVEIG9uIHRoZSBibG9ja2NoYWluLicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbG9hZCB0cmFuc2FjdGlvbiBkZXRhaWxzIHRvIHNob3cgdXBkYXRlZCBzdGF0dXNcclxuICAgIGF3YWl0IHNob3dUcmFuc2FjdGlvbkRldGFpbHMoY3VycmVudFN0YXRlLmN1cnJlbnRUeEhhc2gpO1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgcmVmcmVzaGluZyB0cmFuc2FjdGlvbiBzdGF0dXM6JywgZXJyb3IpO1xyXG4gICAgYWxlcnQoJ0Vycm9yIHJlZnJlc2hpbmcgc3RhdHVzOiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIGJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgYnRuLnRleHRDb250ZW50ID0gJ/CflIQgUkVGUkVTSCBTVEFUVVMgRlJPTSBCTE9DS0NIQUlOJztcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNob3dUcmFuc2FjdGlvbkRldGFpbHModHhIYXNoKSB7XHJcbiAgaWYgKCFjdXJyZW50U3RhdGUuYWRkcmVzcykgcmV0dXJuO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdHRVRfVFhfQllfSEFTSCcsXHJcbiAgICAgIGFkZHJlc3M6IGN1cnJlbnRTdGF0ZS5hZGRyZXNzLFxyXG4gICAgICB0eEhhc2g6IHR4SGFzaFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFyZXNwb25zZS5zdWNjZXNzIHx8ICFyZXNwb25zZS50cmFuc2FjdGlvbikge1xyXG4gICAgICBhbGVydCgnVHJhbnNhY3Rpb24gbm90IGZvdW5kJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0eCA9IHJlc3BvbnNlLnRyYW5zYWN0aW9uO1xyXG5cclxuICAgIC8vIFNob3cgc2NyZWVuXHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tdHgtZGV0YWlscycpO1xyXG5cclxuICAgIC8vIFBvcHVsYXRlIGRldGFpbHNcclxuICAgIGNvbnN0IHN0YXR1c0JhZGdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXN0YXR1cy1iYWRnZScpO1xyXG4gICAgY29uc3Qgc3RhdHVzVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1zdGF0dXMtdGV4dCcpO1xyXG5cclxuICAgIGlmICh0eC5zdGF0dXMgPT09ICdwZW5kaW5nJykge1xyXG4gICAgICBzdGF0dXNUZXh0LnRleHRDb250ZW50ID0gJ+KPsyBQRU5ESU5HJztcclxuICAgICAgc3RhdHVzQmFkZ2Uuc3R5bGUuYm9yZGVyQ29sb3IgPSAndmFyKC0tdGVybWluYWwtd2FybmluZyknO1xyXG4gICAgICBzdGF0dXNUZXh0LnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXdhcm5pbmcpJztcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXBlbmRpbmctYWN0aW9ucycpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLWJsb2NrLXNlY3Rpb24nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgIH0gZWxzZSBpZiAodHguc3RhdHVzID09PSAnY29uZmlybWVkJykge1xyXG4gICAgICBzdGF0dXNUZXh0LnRleHRDb250ZW50ID0gJ+KchSBDT05GSVJNRUQnO1xyXG4gICAgICBzdGF0dXNCYWRnZS5zdHlsZS5ib3JkZXJDb2xvciA9ICcjNDRmZjQ0JztcclxuICAgICAgc3RhdHVzVGV4dC5zdHlsZS5jb2xvciA9ICcjNDRmZjQ0JztcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXBlbmRpbmctYWN0aW9ucycpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLWJsb2NrLXNlY3Rpb24nKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LWRldGFpbC1ibG9jaycpLnRleHRDb250ZW50ID0gdHguYmxvY2tOdW1iZXIgfHwgJy0tJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHN0YXR1c1RleHQudGV4dENvbnRlbnQgPSAn4p2MIEZBSUxFRCc7XHJcbiAgICAgIHN0YXR1c0JhZGdlLnN0eWxlLmJvcmRlckNvbG9yID0gJyNmZjQ0NDQnO1xyXG4gICAgICBzdGF0dXNUZXh0LnN0eWxlLmNvbG9yID0gJyNmZjQ0NDQnO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtcGVuZGluZy1hY3Rpb25zJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kZXRhaWwtYmxvY2stc2VjdGlvbicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kZXRhaWwtaGFzaCcpLnRleHRDb250ZW50ID0gdHguaGFzaDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kZXRhaWwtZnJvbScpLnRleHRDb250ZW50ID0gdHguZnJvbTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kZXRhaWwtdG8nKS50ZXh0Q29udGVudCA9IHR4LnRvIHx8ICdDb250cmFjdCBDcmVhdGlvbic7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLXZhbHVlJykudGV4dENvbnRlbnQgPSBldGhlcnMuZm9ybWF0RXRoZXIodHgudmFsdWUgfHwgJzAnKSArICcgJyArIGdldE5ldHdvcmtTeW1ib2wodHgubmV0d29yayk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLW5vbmNlJykudGV4dENvbnRlbnQgPSB0eC5ub25jZTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kZXRhaWwtZ2FzLXByaWNlJykudGV4dENvbnRlbnQgPSBldGhlcnMuZm9ybWF0VW5pdHModHguZ2FzUHJpY2UgfHwgJzAnLCAnZ3dlaScpICsgJyBHd2VpJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1kZXRhaWwtbmV0d29yaycpLnRleHRDb250ZW50ID0gZ2V0TmV0d29ya05hbWUodHgubmV0d29yayk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtZGV0YWlsLXRpbWVzdGFtcCcpLnRleHRDb250ZW50ID0gbmV3IERhdGUodHgudGltZXN0YW1wKS50b0xvY2FsZVN0cmluZygpO1xyXG5cclxuICAgIC8vIFN0b3JlIGN1cnJlbnQgdHggaGFzaCBmb3Igc3BlZWQgdXAvY2FuY2VsXHJcbiAgICBjdXJyZW50U3RhdGUuY3VycmVudFR4SGFzaCA9IHR4Lmhhc2g7XHJcblxyXG4gICAgLy8gU2V0IHVwIGV4cGxvcmVyIGxpbmtcclxuICAgIGNvbnN0IGV4cGxvcmVyQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi12aWV3LWV4cGxvcmVyJyk7XHJcbiAgICBleHBsb3JlckJ0bi5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCB1cmwgPSBnZXRFeHBsb3JlclVybCh0eC5uZXR3b3JrLCAndHgnLCB0eC5oYXNoKTtcclxuICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGxvYWRpbmcgdHJhbnNhY3Rpb24gZGV0YWlsczonLCBlcnJvcik7XHJcbiAgICBhbGVydCgnRXJyb3IgbG9hZGluZyB0cmFuc2FjdGlvbiBkZXRhaWxzJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBTdGF0ZSBmb3IgZ2FzIHByaWNlIHJlZnJlc2ggYWNyb3NzIGRpZmZlcmVudCBmb3Jtc1xyXG5sZXQgZ2FzUHJpY2VSZWZyZXNoU3RhdGUgPSB7XHJcbiAgYXBwcm92YWw6IHsgbmV0d29yazogbnVsbCwgdHhSZXF1ZXN0OiBudWxsLCBzeW1ib2w6IG51bGwgfSxcclxuICBzZW5kOiB7IG5ldHdvcms6IG51bGwsIHR4UmVxdWVzdDogbnVsbCwgc3ltYm9sOiBudWxsIH0sXHJcbiAgdG9rZW46IHsgbmV0d29yazogbnVsbCwgdHhSZXF1ZXN0OiBudWxsLCBzeW1ib2w6IG51bGwgfVxyXG59O1xyXG5cclxuLy8gU3RhdGUgZm9yIHNwZWVkLXVwIG1vZGFsXHJcbmxldCBzcGVlZFVwTW9kYWxTdGF0ZSA9IHtcclxuICB0eEhhc2g6IG51bGwsXHJcbiAgYWRkcmVzczogbnVsbCxcclxuICBuZXR3b3JrOiBudWxsLFxyXG4gIG9yaWdpbmFsR2FzUHJpY2U6IG51bGwsXHJcbiAgY3VycmVudEdhc1ByaWNlOiBudWxsLFxyXG4gIHJlY29tbWVuZGVkR2FzUHJpY2U6IG51bGxcclxufTtcclxuXHJcbi8vIFN0YXRlIGZvciBjYW5jZWwgdHJhbnNhY3Rpb24gbW9kYWxcclxubGV0IGNhbmNlbE1vZGFsU3RhdGUgPSB7XHJcbiAgdHhIYXNoOiBudWxsLFxyXG4gIGFkZHJlc3M6IG51bGwsXHJcbiAgbmV0d29yazogbnVsbCxcclxuICBvcmlnaW5hbEdhc1ByaWNlOiBudWxsLFxyXG4gIGN1cnJlbnRHYXNQcmljZTogbnVsbCxcclxuICByZWNvbW1lbmRlZEdhc1ByaWNlOiBudWxsXHJcbn07XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTcGVlZFVwVHJhbnNhY3Rpb24oKSB7XHJcbiAgaWYgKCFjdXJyZW50U3RhdGUuYWRkcmVzcyB8fCAhY3VycmVudFN0YXRlLmN1cnJlbnRUeEhhc2gpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIEdldCB0cmFuc2FjdGlvbiBkZXRhaWxzXHJcbiAgICBjb25zdCB0eFJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX1RYX0JZX0hBU0gnLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzcyxcclxuICAgICAgdHhIYXNoOiBjdXJyZW50U3RhdGUuY3VycmVudFR4SGFzaFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCF0eFJlc3BvbnNlLnN1Y2Nlc3MgfHwgIXR4UmVzcG9uc2UudHJhbnNhY3Rpb24pIHtcclxuICAgICAgYWxlcnQoJ0NvdWxkIG5vdCBsb2FkIHRyYW5zYWN0aW9uIGRldGFpbHMnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHR4ID0gdHhSZXNwb25zZS50cmFuc2FjdGlvbjtcclxuXHJcbiAgICAvLyBTdG9yZSBzdGF0ZSBmb3IgbW9kYWxcclxuICAgIHNwZWVkVXBNb2RhbFN0YXRlLnR4SGFzaCA9IGN1cnJlbnRTdGF0ZS5jdXJyZW50VHhIYXNoO1xyXG4gICAgc3BlZWRVcE1vZGFsU3RhdGUuYWRkcmVzcyA9IGN1cnJlbnRTdGF0ZS5hZGRyZXNzO1xyXG4gICAgc3BlZWRVcE1vZGFsU3RhdGUubmV0d29yayA9IHR4Lm5ldHdvcms7XHJcbiAgICBzcGVlZFVwTW9kYWxTdGF0ZS5vcmlnaW5hbEdhc1ByaWNlID0gdHguZ2FzUHJpY2U7XHJcblxyXG4gICAgLy8gU2hvdyBtb2RhbCBhbmQgbG9hZCBnYXMgcHJpY2VzXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtc3BlZWQtdXAtdHgnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIGF3YWl0IHJlZnJlc2hHYXNQcmljZXMoKTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIG9wZW5pbmcgc3BlZWQtdXAgbW9kYWw6JywgZXJyb3IpO1xyXG4gICAgYWxlcnQoJ0Vycm9yIGxvYWRpbmcgZ2FzIHByaWNlcycpO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcmVmcmVzaEdhc1ByaWNlcygpIHtcclxuICBjb25zdCBsb2FkaW5nRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3BlZWQtdXAtbG9hZGluZycpO1xyXG4gIGNvbnN0IHJlZnJlc2hCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlZnJlc2gtZ2FzLXByaWNlJyk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBTaG93IGxvYWRpbmcgc3RhdGVcclxuICAgIGxvYWRpbmdFbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIHJlZnJlc2hCdG4uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgcmVmcmVzaEJ0bi50ZXh0Q29udGVudCA9ICfij7MgTG9hZGluZy4uLic7XHJcblxyXG4gICAgLy8gRmV0Y2ggY3VycmVudCBuZXR3b3JrIGdhcyBwcmljZVxyXG4gICAgY29uc3QgZ2FzUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdHRVRfQ1VSUkVOVF9HQVNfUFJJQ0UnLFxyXG4gICAgICBuZXR3b3JrOiBzcGVlZFVwTW9kYWxTdGF0ZS5uZXR3b3JrXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIWdhc1Jlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGdhc1Jlc3BvbnNlLmVycm9yIHx8ICdGYWlsZWQgdG8gZmV0Y2ggZ2FzIHByaWNlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3RvcmUgY3VycmVudCBhbmQgY2FsY3VsYXRlIHJlY29tbWVuZGVkIChjdXJyZW50ICsgMTAlKVxyXG4gICAgc3BlZWRVcE1vZGFsU3RhdGUuY3VycmVudEdhc1ByaWNlID0gZ2FzUmVzcG9uc2UuZ2FzUHJpY2U7XHJcbiAgICBjb25zdCBjdXJyZW50R3dlaSA9IHBhcnNlRmxvYXQoZ2FzUmVzcG9uc2UuZ2FzUHJpY2VHd2VpKTtcclxuICAgIGNvbnN0IHJlY29tbWVuZGVkR3dlaSA9IChjdXJyZW50R3dlaSAqIDEuMSkudG9GaXhlZCgyKTtcclxuICAgIHNwZWVkVXBNb2RhbFN0YXRlLnJlY29tbWVuZGVkR2FzUHJpY2UgPSAoQmlnSW50KGdhc1Jlc3BvbnNlLmdhc1ByaWNlKSAqIEJpZ0ludCgxMTApIC8gQmlnSW50KDEwMCkpLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgLy8gVXBkYXRlIFVJXHJcbiAgICBjb25zdCBvcmlnaW5hbEd3ZWkgPSAoTnVtYmVyKHNwZWVkVXBNb2RhbFN0YXRlLm9yaWdpbmFsR2FzUHJpY2UpIC8gMWU5KS50b0ZpeGVkKDIpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwZWVkLXVwLW9yaWdpbmFsLWdhcycpLnRleHRDb250ZW50ID0gYCR7b3JpZ2luYWxHd2VpfSBHd2VpYDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGVlZC11cC1jdXJyZW50LWdhcycpLnRleHRDb250ZW50ID0gYCR7Y3VycmVudEd3ZWl9IEd3ZWlgO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwZWVkLXVwLXJlY29tbWVuZGVkLWdhcycpLnRleHRDb250ZW50ID0gYCR7cmVjb21tZW5kZWRHd2VpfSBHd2VpYDtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgYW5kIHNob3cgY29tcGFyaXNvblxyXG4gICAgY29uc3QgY29tcGFyaXNvbiA9IGN1cnJlbnRHd2VpIC8gcGFyc2VGbG9hdChvcmlnaW5hbEd3ZWkpO1xyXG4gICAgY29uc3QgbWVzc2FnZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwZWVkLXVwLWNvbXBhcmlzb24tbWVzc2FnZScpO1xyXG4gICAgaWYgKGNvbXBhcmlzb24gPiAyKSB7XHJcbiAgICAgIG1lc3NhZ2VFbC50ZXh0Q29udGVudCA9IGDimqDvuI8gTmV0d29yayBnYXMgaXMgJHtjb21wYXJpc29uLnRvRml4ZWQoMCl9eCBoaWdoZXIgdGhhbiB5b3VyIHRyYW5zYWN0aW9uIWA7XHJcbiAgICAgIG1lc3NhZ2VFbC5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1kYW5nZXIpJztcclxuICAgIH0gZWxzZSBpZiAoY29tcGFyaXNvbiA+IDEuMikge1xyXG4gICAgICBtZXNzYWdlRWwudGV4dENvbnRlbnQgPSBgTmV0d29yayBnYXMgaXMgJHtjb21wYXJpc29uLnRvRml4ZWQoMSl9eCBoaWdoZXIgdGhhbiB5b3VyIHRyYW5zYWN0aW9uYDtcclxuICAgICAgbWVzc2FnZUVsLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXdhcm5pbmcpJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG1lc3NhZ2VFbC50ZXh0Q29udGVudCA9ICdOZXR3b3JrIGdhcyBpcyBjbG9zZSB0byB5b3VyIHRyYW5zYWN0aW9uIHByaWNlJztcclxuICAgICAgbWVzc2FnZUVsLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLXN1Y2Nlc3MpJztcclxuICAgIH1cclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHJlZnJlc2hpbmcgZ2FzIHByaWNlczonLCBlcnJvcik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3BlZWQtdXAtY29tcGFyaXNvbi1tZXNzYWdlJykudGV4dENvbnRlbnQgPSBgRXJyb3I6ICR7ZXJyb3IubWVzc2FnZX1gO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwZWVkLXVwLWNvbXBhcmlzb24tbWVzc2FnZScpLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLWRhbmdlciknO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICBsb2FkaW5nRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICByZWZyZXNoQnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICByZWZyZXNoQnRuLnRleHRDb250ZW50ID0gJ/CflIQgUkVGUkVTSCBHQVMgUFJJQ0UnO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY29uZmlybVNwZWVkVXAoKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIEdldCBjdXN0b20gZ2FzIHByaWNlIGlmIHByb3ZpZGVkXHJcbiAgICBjb25zdCBjdXN0b21HYXNJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGVlZC11cC1jdXN0b20tZ2FzJykudmFsdWU7XHJcbiAgICBsZXQgZ2FzUHJpY2VUb1VzZSA9IHNwZWVkVXBNb2RhbFN0YXRlLnJlY29tbWVuZGVkR2FzUHJpY2U7XHJcblxyXG4gICAgaWYgKGN1c3RvbUdhc0lucHV0ICYmIGN1c3RvbUdhc0lucHV0LnRyaW0oKSAhPT0gJycpIHtcclxuICAgICAgY29uc3QgY3VzdG9tR3dlaSA9IHBhcnNlRmxvYXQoY3VzdG9tR2FzSW5wdXQpO1xyXG4gICAgICBpZiAoaXNOYU4oY3VzdG9tR3dlaSkgfHwgY3VzdG9tR3dlaSA8PSAwKSB7XHJcbiAgICAgICAgYWxlcnQoJ0ludmFsaWQgZ2FzIHByaWNlLiBQbGVhc2UgZW50ZXIgYSBwb3NpdGl2ZSBudW1iZXIuJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIENvbnZlcnQgR3dlaSB0byBXZWlcclxuICAgICAgZ2FzUHJpY2VUb1VzZSA9IChCaWdJbnQoTWF0aC5mbG9vcihjdXN0b21Hd2VpICogMWU5KSkpLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2xvc2UgbW9kYWxcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1zcGVlZC11cC10eCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgIC8vIEdldCBwYXNzd29yZFxyXG4gICAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ1NwZWVkIFVwIFRyYW5zYWN0aW9uJywgJ0VudGVyIHlvdXIgcGFzc3dvcmQgdG8gY29uZmlybSBzcGVlZC11cCcpO1xyXG4gICAgaWYgKCFwYXNzd29yZCkgcmV0dXJuO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0ZW1wb3Jhcnkgc2Vzc2lvblxyXG4gICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBjb25zdCBzZXNzaW9uUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdDUkVBVEVfU0VTU0lPTicsXHJcbiAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcclxuICAgICAgd2FsbGV0SWQ6IGFjdGl2ZVdhbGxldC5pZCxcclxuICAgICAgZHVyYXRpb25NczogNjAwMDBcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghc2Vzc2lvblJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgYWxlcnQoJ0ludmFsaWQgcGFzc3dvcmQnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNwZWVkIHVwIHRyYW5zYWN0aW9uIHdpdGggY3VzdG9tIGdhcyBwcmljZVxyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdTUEVFRF9VUF9UWCcsXHJcbiAgICAgIGFkZHJlc3M6IHNwZWVkVXBNb2RhbFN0YXRlLmFkZHJlc3MsXHJcbiAgICAgIHR4SGFzaDogc3BlZWRVcE1vZGFsU3RhdGUudHhIYXNoLFxyXG4gICAgICBzZXNzaW9uVG9rZW46IHNlc3Npb25SZXNwb25zZS5zZXNzaW9uVG9rZW4sXHJcbiAgICAgIGN1c3RvbUdhc1ByaWNlOiBnYXNQcmljZVRvVXNlXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICBhbGVydChgVHJhbnNhY3Rpb24gc3BlZCB1cCFcXG5OZXcgVFg6ICR7cmVzcG9uc2UudHhIYXNoLnNsaWNlKDAsIDIwKX0uLi5gKTtcclxuICAgICAgc2hvd1RyYW5zYWN0aW9uRGV0YWlscyhyZXNwb25zZS50eEhhc2gpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWxlcnQoJ0Vycm9yIHNwZWVkaW5nIHVwIHRyYW5zYWN0aW9uOiAnICsgcmVzcG9uc2UuZXJyb3IpO1xyXG4gICAgfVxyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3Igc3BlZWRpbmcgdXAgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgYWxlcnQoJ0Vycm9yIHNwZWVkaW5nIHVwIHRyYW5zYWN0aW9uJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBSZWZyZXNoIGdhcyBwcmljZXMgZm9yIGNhbmNlbCB0cmFuc2FjdGlvbiBtb2RhbFxyXG5hc3luYyBmdW5jdGlvbiByZWZyZXNoQ2FuY2VsR2FzUHJpY2VzKCkge1xyXG4gIGNvbnN0IGxvYWRpbmdFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW5jZWwtbG9hZGluZycpO1xyXG4gIGNvbnN0IHJlZnJlc2hCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXJlZnJlc2gtY2FuY2VsLWdhcy1wcmljZScpO1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gU2hvdyBsb2FkaW5nIHN0YXRlXHJcbiAgICBsb2FkaW5nRWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICByZWZyZXNoQnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIHJlZnJlc2hCdG4udGV4dENvbnRlbnQgPSAn4o+zIExvYWRpbmcuLi4nO1xyXG5cclxuICAgIC8vIEZldGNoIGN1cnJlbnQgbmV0d29yayBnYXMgcHJpY2VcclxuICAgIGNvbnN0IGdhc1Jlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX0NVUlJFTlRfR0FTX1BSSUNFJyxcclxuICAgICAgbmV0d29yazogY2FuY2VsTW9kYWxTdGF0ZS5uZXR3b3JrXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIWdhc1Jlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGdhc1Jlc3BvbnNlLmVycm9yIHx8ICdGYWlsZWQgdG8gZmV0Y2ggZ2FzIHByaWNlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3RvcmUgY3VycmVudCBhbmQgY2FsY3VsYXRlIHJlY29tbWVuZGVkIChjdXJyZW50ICsgMTAlKVxyXG4gICAgY2FuY2VsTW9kYWxTdGF0ZS5jdXJyZW50R2FzUHJpY2UgPSBnYXNSZXNwb25zZS5nYXNQcmljZTtcclxuICAgIGNvbnN0IGN1cnJlbnRHd2VpID0gcGFyc2VGbG9hdChnYXNSZXNwb25zZS5nYXNQcmljZUd3ZWkpO1xyXG4gICAgY29uc3QgcmVjb21tZW5kZWRHd2VpID0gKGN1cnJlbnRHd2VpICogMS4xKS50b0ZpeGVkKDIpO1xyXG4gICAgY2FuY2VsTW9kYWxTdGF0ZS5yZWNvbW1lbmRlZEdhc1ByaWNlID0gKEJpZ0ludChnYXNSZXNwb25zZS5nYXNQcmljZSkgKiBCaWdJbnQoMTEwKSAvIEJpZ0ludCgxMDApKS50b1N0cmluZygpO1xyXG5cclxuICAgIC8vIFVwZGF0ZSBVSVxyXG4gICAgY29uc3Qgb3JpZ2luYWxHd2VpID0gKE51bWJlcihjYW5jZWxNb2RhbFN0YXRlLm9yaWdpbmFsR2FzUHJpY2UpIC8gMWU5KS50b0ZpeGVkKDIpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbmNlbC1vcmlnaW5hbC1nYXMnKS50ZXh0Q29udGVudCA9IGAke29yaWdpbmFsR3dlaX0gR3dlaWA7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FuY2VsLWN1cnJlbnQtZ2FzJykudGV4dENvbnRlbnQgPSBgJHtjdXJyZW50R3dlaX0gR3dlaWA7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FuY2VsLXJlY29tbWVuZGVkLWdhcycpLnRleHRDb250ZW50ID0gYCR7cmVjb21tZW5kZWRHd2VpfSBHd2VpYDtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgYW5kIHNob3cgY29tcGFyaXNvblxyXG4gICAgY29uc3QgY29tcGFyaXNvbiA9IGN1cnJlbnRHd2VpIC8gcGFyc2VGbG9hdChvcmlnaW5hbEd3ZWkpO1xyXG4gICAgY29uc3QgbWVzc2FnZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbmNlbC1jb21wYXJpc29uLW1lc3NhZ2UnKTtcclxuICAgIGlmIChjb21wYXJpc29uID4gMikge1xyXG4gICAgICBtZXNzYWdlRWwudGV4dENvbnRlbnQgPSBg4pqg77iPIE5ldHdvcmsgZ2FzIGlzICR7Y29tcGFyaXNvbi50b0ZpeGVkKDApfXggaGlnaGVyIHRoYW4geW91ciB0cmFuc2FjdGlvbiFgO1xyXG4gICAgICBtZXNzYWdlRWwuc3R5bGUuY29sb3IgPSAndmFyKC0tdGVybWluYWwtZGFuZ2VyKSc7XHJcbiAgICB9IGVsc2UgaWYgKGNvbXBhcmlzb24gPiAxLjIpIHtcclxuICAgICAgbWVzc2FnZUVsLnRleHRDb250ZW50ID0gYE5ldHdvcmsgZ2FzIGlzICR7Y29tcGFyaXNvbi50b0ZpeGVkKDEpfXggaGlnaGVyIHRoYW4geW91ciB0cmFuc2FjdGlvbmA7XHJcbiAgICAgIG1lc3NhZ2VFbC5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC13YXJuaW5nKSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtZXNzYWdlRWwudGV4dENvbnRlbnQgPSAnTmV0d29yayBnYXMgaXMgY2xvc2UgdG8geW91ciB0cmFuc2FjdGlvbiBwcmljZSc7XHJcbiAgICAgIG1lc3NhZ2VFbC5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1zdWNjZXNzKSc7XHJcbiAgICB9XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciByZWZyZXNoaW5nIGNhbmNlbCBnYXMgcHJpY2VzOicsIGVycm9yKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW5jZWwtY29tcGFyaXNvbi1tZXNzYWdlJykudGV4dENvbnRlbnQgPSBgRXJyb3I6ICR7ZXJyb3IubWVzc2FnZX1gO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbmNlbC1jb21wYXJpc29uLW1lc3NhZ2UnKS5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1kYW5nZXIpJztcclxuICB9IGZpbmFsbHkge1xyXG4gICAgbG9hZGluZ0VsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgcmVmcmVzaEJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgcmVmcmVzaEJ0bi50ZXh0Q29udGVudCA9ICfwn5SEIFJFRlJFU0ggR0FTIFBSSUNFJztcclxuICB9XHJcbn1cclxuXHJcbi8vIENvbmZpcm0gY2FuY2VsIHRyYW5zYWN0aW9uXHJcbmFzeW5jIGZ1bmN0aW9uIGNvbmZpcm1DYW5jZWxUcmFuc2FjdGlvbigpIHtcclxuICB0cnkge1xyXG4gICAgLy8gR2V0IGN1c3RvbSBnYXMgcHJpY2UgaWYgcHJvdmlkZWRcclxuICAgIGNvbnN0IGN1c3RvbUdhc0lucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbmNlbC1jdXN0b20tZ2FzJykudmFsdWU7XHJcbiAgICBsZXQgZ2FzUHJpY2VUb1VzZSA9IGNhbmNlbE1vZGFsU3RhdGUucmVjb21tZW5kZWRHYXNQcmljZTtcclxuXHJcbiAgICBpZiAoY3VzdG9tR2FzSW5wdXQgJiYgY3VzdG9tR2FzSW5wdXQudHJpbSgpICE9PSAnJykge1xyXG4gICAgICBjb25zdCBjdXN0b21Hd2VpID0gcGFyc2VGbG9hdChjdXN0b21HYXNJbnB1dCk7XHJcbiAgICAgIGlmIChpc05hTihjdXN0b21Hd2VpKSB8fCBjdXN0b21Hd2VpIDw9IDApIHtcclxuICAgICAgICBhbGVydCgnSW52YWxpZCBnYXMgcHJpY2UuIFBsZWFzZSBlbnRlciBhIHBvc2l0aXZlIG51bWJlci4nKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgLy8gQ29udmVydCBHd2VpIHRvIFdlaVxyXG4gICAgICBnYXNQcmljZVRvVXNlID0gKEJpZ0ludChNYXRoLmZsb29yKGN1c3RvbUd3ZWkgKiAxZTkpKSkudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDbG9zZSBtb2RhbFxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWNhbmNlbC10eCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgIC8vIEdldCBwYXNzd29yZFxyXG4gICAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCBzaG93UGFzc3dvcmRQcm9tcHQoJ0NhbmNlbCBUcmFuc2FjdGlvbicsICdFbnRlciB5b3VyIHBhc3N3b3JkIHRvIGNvbmZpcm0gY2FuY2VsbGF0aW9uJyk7XHJcbiAgICBpZiAoIXBhc3N3b3JkKSByZXR1cm47XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRlbXBvcmFyeSBzZXNzaW9uXHJcbiAgICBjb25zdCBhY3RpdmVXYWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgIGNvbnN0IHNlc3Npb25SZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ0NSRUFURV9TRVNTSU9OJyxcclxuICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkLFxyXG4gICAgICB3YWxsZXRJZDogYWN0aXZlV2FsbGV0LmlkLFxyXG4gICAgICBkdXJhdGlvbk1zOiA2MDAwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFzZXNzaW9uUmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICBhbGVydCgnSW52YWxpZCBwYXNzd29yZCcpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2FuY2VsIHRyYW5zYWN0aW9uIHdpdGggY3VzdG9tIGdhcyBwcmljZVxyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdDQU5DRUxfVFgnLFxyXG4gICAgICBhZGRyZXNzOiBjYW5jZWxNb2RhbFN0YXRlLmFkZHJlc3MsXHJcbiAgICAgIHR4SGFzaDogY2FuY2VsTW9kYWxTdGF0ZS50eEhhc2gsXHJcbiAgICAgIHNlc3Npb25Ub2tlbjogc2Vzc2lvblJlc3BvbnNlLnNlc3Npb25Ub2tlbixcclxuICAgICAgY3VzdG9tR2FzUHJpY2U6IGdhc1ByaWNlVG9Vc2VcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgIGFsZXJ0KGBUcmFuc2FjdGlvbiBjYW5jZWxsZWQhXFxuQ2FuY2VsbGF0aW9uIFRYOiAke3Jlc3BvbnNlLnR4SGFzaC5zbGljZSgwLCAyMCl9Li4uYCk7XHJcbiAgICAgIHNob3dUcmFuc2FjdGlvbkRldGFpbHMocmVzcG9uc2UudHhIYXNoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFsZXJ0KCdFcnJvciBjYW5jZWxsaW5nIHRyYW5zYWN0aW9uOiAnICsgcmVzcG9uc2UuZXJyb3IpO1xyXG4gICAgfVxyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgY2FuY2VsbGluZyB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICBhbGVydCgnRXJyb3IgY2FuY2VsbGluZyB0cmFuc2FjdGlvbicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gUmVmcmVzaCBnYXMgcHJpY2VzIGZvciB0cmFuc2FjdGlvbiBhcHByb3ZhbCBzY3JlZW5cclxuYXN5bmMgZnVuY3Rpb24gcmVmcmVzaEFwcHJvdmFsR2FzUHJpY2UoKSB7XHJcbiAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1yZWZyZXNoLWFwcHJvdmFsLWdhcycpO1xyXG4gIGlmICghYnRuIHx8ICFnYXNQcmljZVJlZnJlc2hTdGF0ZS5hcHByb3ZhbC5uZXR3b3JrKSByZXR1cm47XHJcblxyXG4gIHRyeSB7XHJcbiAgICBidG4uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgYnRuLnRleHRDb250ZW50ID0gJ+KPsyBMb2FkaW5nLi4uJztcclxuXHJcbiAgICBjb25zdCB7IG5ldHdvcmssIHR4UmVxdWVzdCwgc3ltYm9sIH0gPSBnYXNQcmljZVJlZnJlc2hTdGF0ZS5hcHByb3ZhbDtcclxuICAgIGF3YWl0IHBvcHVsYXRlR2FzUHJpY2VzKG5ldHdvcmssIHR4UmVxdWVzdCwgc3ltYm9sKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgcmVmcmVzaGluZyBnYXMgcHJpY2U6JywgZXJyb3IpO1xyXG4gICAgYWxlcnQoJ0Vycm9yIHJlZnJlc2hpbmcgZ2FzIHByaWNlJyk7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIGJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgYnRuLnRleHRDb250ZW50ID0gJ/CflIQgUkVGUkVTSCBHQVMgUFJJQ0UnO1xyXG4gIH1cclxufVxyXG5cclxuLy8gUmVmcmVzaCBnYXMgcHJpY2VzIGZvciBzZW5kIHNjcmVlblxyXG5hc3luYyBmdW5jdGlvbiByZWZyZXNoU2VuZEdhc1ByaWNlKCkge1xyXG4gIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVmcmVzaC1zZW5kLWdhcycpO1xyXG4gIGlmICghYnRuIHx8ICFnYXNQcmljZVJlZnJlc2hTdGF0ZS5zZW5kLm5ldHdvcmspIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGJ0bi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICBidG4udGV4dENvbnRlbnQgPSAn4o+zIExvYWRpbmcuLi4nO1xyXG5cclxuICAgIGNvbnN0IHsgbmV0d29yaywgdHhSZXF1ZXN0LCBzeW1ib2wgfSA9IGdhc1ByaWNlUmVmcmVzaFN0YXRlLnNlbmQ7XHJcbiAgICBhd2FpdCBwb3B1bGF0ZVNlbmRHYXNQcmljZXMobmV0d29yaywgdHhSZXF1ZXN0LCBzeW1ib2wpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciByZWZyZXNoaW5nIGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICBhbGVydCgnRXJyb3IgcmVmcmVzaGluZyBnYXMgcHJpY2UnKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgYnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICBidG4udGV4dENvbnRlbnQgPSAn8J+UhCBSRUZSRVNIIEdBUyBQUklDRSc7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBSZWZyZXNoIGdhcyBwcmljZXMgZm9yIHRva2VuIHNlbmQgc2NyZWVuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hUb2tlbkdhc1ByaWNlKCkge1xyXG4gIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcmVmcmVzaC10b2tlbi1nYXMnKTtcclxuICBpZiAoIWJ0biB8fCAhZ2FzUHJpY2VSZWZyZXNoU3RhdGUudG9rZW4ubmV0d29yaykgcmV0dXJuO1xyXG5cclxuICB0cnkge1xyXG4gICAgYnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIGJ0bi50ZXh0Q29udGVudCA9ICfij7MgTG9hZGluZy4uLic7XHJcblxyXG4gICAgY29uc3QgeyBuZXR3b3JrLCB0eFJlcXVlc3QsIHN5bWJvbCB9ID0gZ2FzUHJpY2VSZWZyZXNoU3RhdGUudG9rZW47XHJcbiAgICBhd2FpdCBwb3B1bGF0ZVRva2VuR2FzUHJpY2VzKG5ldHdvcmssIHR4UmVxdWVzdCwgc3ltYm9sKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgcmVmcmVzaGluZyBnYXMgcHJpY2U6JywgZXJyb3IpO1xyXG4gICAgYWxlcnQoJ0Vycm9yIHJlZnJlc2hpbmcgZ2FzIHByaWNlJyk7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIGJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgYnRuLnRleHRDb250ZW50ID0gJ/CflIQgUkVGUkVTSCBHQVMgUFJJQ0UnO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2FuY2VsVHJhbnNhY3Rpb24oKSB7XHJcbiAgaWYgKCFjdXJyZW50U3RhdGUuYWRkcmVzcyB8fCAhY3VycmVudFN0YXRlLmN1cnJlbnRUeEhhc2gpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIEdldCB0cmFuc2FjdGlvbiBkZXRhaWxzXHJcbiAgICBjb25zdCB0eFJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnR0VUX1RYX0JZX0hBU0gnLFxyXG4gICAgICBhZGRyZXNzOiBjdXJyZW50U3RhdGUuYWRkcmVzcyxcclxuICAgICAgdHhIYXNoOiBjdXJyZW50U3RhdGUuY3VycmVudFR4SGFzaFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCF0eFJlc3BvbnNlLnN1Y2Nlc3MgfHwgIXR4UmVzcG9uc2UudHJhbnNhY3Rpb24pIHtcclxuICAgICAgYWxlcnQoJ0NvdWxkIG5vdCBsb2FkIHRyYW5zYWN0aW9uIGRldGFpbHMnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHR4ID0gdHhSZXNwb25zZS50cmFuc2FjdGlvbjtcclxuXHJcbiAgICAvLyBTdG9yZSBzdGF0ZSBmb3IgbW9kYWxcclxuICAgIGNhbmNlbE1vZGFsU3RhdGUudHhIYXNoID0gY3VycmVudFN0YXRlLmN1cnJlbnRUeEhhc2g7XHJcbiAgICBjYW5jZWxNb2RhbFN0YXRlLmFkZHJlc3MgPSBjdXJyZW50U3RhdGUuYWRkcmVzcztcclxuICAgIGNhbmNlbE1vZGFsU3RhdGUubmV0d29yayA9IHR4Lm5ldHdvcms7XHJcbiAgICBjYW5jZWxNb2RhbFN0YXRlLm9yaWdpbmFsR2FzUHJpY2UgPSB0eC5nYXNQcmljZTtcclxuXHJcbiAgICAvLyBTaG93IG1vZGFsIGFuZCBsb2FkIGdhcyBwcmljZXNcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1jYW5jZWwtdHgnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIGF3YWl0IHJlZnJlc2hDYW5jZWxHYXNQcmljZXMoKTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIG9wZW5pbmcgY2FuY2VsIG1vZGFsOicsIGVycm9yKTtcclxuICAgIGFsZXJ0KCdFcnJvciBsb2FkaW5nIGdhcyBwcmljZXMnKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNsZWFyVHJhbnNhY3Rpb25IaXN0b3J5KCkge1xyXG4gIGlmICghY29uZmlybSgnQ2xlYXIgYWxsIHRyYW5zYWN0aW9uIGhpc3RvcnkgZm9yIHRoaXMgYWRkcmVzcz8gVGhpcyBjYW5ub3QgYmUgdW5kb25lLicpKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICB0eXBlOiAnQ0xFQVJfVFhfSElTVE9SWScsXHJcbiAgICAgIGFkZHJlc3M6IGN1cnJlbnRTdGF0ZS5hZGRyZXNzXHJcbiAgICB9KTtcclxuXHJcbiAgICBhbGVydCgnVHJhbnNhY3Rpb24gaGlzdG9yeSBjbGVhcmVkJyk7XHJcbiAgICBzaG93U2NyZWVuKCdzY3JlZW4tZGFzaGJvYXJkJyk7XHJcbiAgICBhd2FpdCB1cGRhdGVEYXNoYm9hcmQoKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgY2xlYXJpbmcgdHJhbnNhY3Rpb24gaGlzdG9yeTonLCBlcnJvcik7XHJcbiAgICBhbGVydCgnRXJyb3IgY2xlYXJpbmcgdHJhbnNhY3Rpb24gaGlzdG9yeScpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFNob3cgdHJhbnNhY3Rpb24gc3RhdHVzIGFmdGVyIGFwcHJvdmFsXHJcbiAqIEtlZXBzIGFwcHJvdmFsIHdpbmRvdyBvcGVuIHRvIHNob3cgdHggc3RhdHVzXHJcbiAqL1xyXG5sZXQgdHhTdGF0dXNQb2xsSW50ZXJ2YWwgPSBudWxsO1xyXG5sZXQgdHhTdGF0dXNDdXJyZW50SGFzaCA9IG51bGw7XHJcbmxldCB0eFN0YXR1c0N1cnJlbnRBZGRyZXNzID0gbnVsbDtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNob3dUcmFuc2FjdGlvblN0YXR1cyh0eEhhc2gsIGFkZHJlc3MsIHJlcXVlc3RJZCkge1xyXG4gIC8vIFNob3dpbmcgdHJhbnNhY3Rpb24gc3RhdHVzXHJcblxyXG4gIC8vIFN0b3JlIGN1cnJlbnQgdHJhbnNhY3Rpb24gaGFzaCBhbmQgYWRkcmVzc1xyXG4gIHR4U3RhdHVzQ3VycmVudEhhc2ggPSB0eEhhc2g7XHJcbiAgdHhTdGF0dXNDdXJyZW50QWRkcmVzcyA9IGFkZHJlc3M7XHJcblxyXG4gIC8vIEhpZGUgYXBwcm92YWwgZm9ybVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1hcHByb3ZhbC1mb3JtJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gIC8vIFNob3cgc3RhdHVzIHNlY3Rpb25cclxuICBjb25zdCBzdGF0dXNTZWN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R4LXN0YXR1cy1zZWN0aW9uJyk7XHJcbiAgc3RhdHVzU2VjdGlvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuXHJcbiAgLy8gUG9wdWxhdGUgdHJhbnNhY3Rpb24gaGFzaFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1zdGF0dXMtaGFzaCcpLnRleHRDb250ZW50ID0gdHhIYXNoO1xyXG5cclxuICAvLyBQb2xsIGZvciB0cmFuc2FjdGlvbiBzdGF0dXMgdXBkYXRlc1xyXG4gIGNvbnN0IHVwZGF0ZVN0YXR1cyA9IGFzeW5jICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIFBvbGxpbmcgdHJhbnNhY3Rpb24gc3RhdHVzXHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgIHR5cGU6ICdHRVRfVFhfQllfSEFTSCcsXHJcbiAgICAgICAgYWRkcmVzczogdHhTdGF0dXNDdXJyZW50QWRkcmVzcyxcclxuICAgICAgICB0eEhhc2g6IHR4SGFzaFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFN0YXR1cyBwb2xsIHJlc3BvbnNlXHJcblxyXG4gICAgICBpZiAocmVzcG9uc2Uuc3VjY2VzcyAmJiByZXNwb25zZS50cmFuc2FjdGlvbikge1xyXG4gICAgICAgIGNvbnN0IHR4ID0gcmVzcG9uc2UudHJhbnNhY3Rpb247XHJcbiAgICAgICAgLy8gVHJhbnNhY3Rpb24gc3RhdHVzIHVwZGF0ZWRcclxuXHJcbiAgICAgICAgY29uc3Qgc3RhdHVzTWVzc2FnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1zdGF0dXMtbWVzc2FnZScpO1xyXG4gICAgICAgIGNvbnN0IHN0YXR1c0RldGFpbHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHgtc3RhdHVzLWRldGFpbHMnKTtcclxuICAgICAgICBjb25zdCBwZW5kaW5nQWN0aW9ucyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0eC1zdGF0dXMtcGVuZGluZy1hY3Rpb25zJyk7XHJcblxyXG4gICAgICAgIGlmICh0eC5zdGF0dXMgPT09ICdjb25maXJtZWQnKSB7XHJcbiAgICAgICAgICAvLyBUcmFuc2FjdGlvbiBjb25maXJtZWRcclxuICAgICAgICAgIHN0YXR1c01lc3NhZ2UudGV4dENvbnRlbnQgPSAn4pyFIFRyYW5zYWN0aW9uIENvbmZpcm1lZCEnO1xyXG4gICAgICAgICAgc3RhdHVzRGV0YWlscy50ZXh0Q29udGVudCA9IGBCbG9jazogJHt0eC5ibG9ja051bWJlcn1gO1xyXG4gICAgICAgICAgc3RhdHVzRGV0YWlscy5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXJtaW5hbC1zdWNjZXNzKSc7XHJcbiAgICAgICAgICBwZW5kaW5nQWN0aW9ucy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgICAvLyBTdG9wIHBvbGxpbmdcclxuICAgICAgICAgIGlmICh0eFN0YXR1c1BvbGxJbnRlcnZhbCkge1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHR4U3RhdHVzUG9sbEludGVydmFsKTtcclxuICAgICAgICAgICAgdHhTdGF0dXNQb2xsSW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIEF1dG8tY2xvc2UgYWZ0ZXIgMiBzZWNvbmRzXHJcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgICAgICB9LCAyMDAwKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR4LnN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcclxuICAgICAgICAgIHN0YXR1c01lc3NhZ2UudGV4dENvbnRlbnQgPSAn4p2MIFRyYW5zYWN0aW9uIEZhaWxlZCc7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnRleHRDb250ZW50ID0gJ1RoZSB0cmFuc2FjdGlvbiB3YXMgcmVqZWN0ZWQgb3IgcmVwbGFjZWQnO1xyXG4gICAgICAgICAgc3RhdHVzRGV0YWlscy5zdHlsZS5jb2xvciA9ICcjZmY0NDQ0JztcclxuICAgICAgICAgIHBlbmRpbmdBY3Rpb25zLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAgIC8vIFN0b3AgcG9sbGluZ1xyXG4gICAgICAgICAgaWYgKHR4U3RhdHVzUG9sbEludGVydmFsKSB7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodHhTdGF0dXNQb2xsSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICB0eFN0YXR1c1BvbGxJbnRlcnZhbCA9IG51bGw7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gQXV0by1jbG9zZSBhZnRlciAyIHNlY29uZHNcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBTdGlsbCBwZW5kaW5nXHJcbiAgICAgICAgICBzdGF0dXNNZXNzYWdlLnRleHRDb250ZW50ID0gJ+KPsyBXYWl0aW5nIGZvciBjb25maXJtYXRpb24uLi4nO1xyXG4gICAgICAgICAgc3RhdHVzRGV0YWlscy50ZXh0Q29udGVudCA9ICdUaGlzIHVzdWFsbHkgdGFrZXMgMTAtMzAgc2Vjb25kcyc7XHJcbiAgICAgICAgICBzdGF0dXNEZXRhaWxzLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRlcm1pbmFsLWZnLWRpbSknO1xyXG4gICAgICAgICAgcGVuZGluZ0FjdGlvbnMuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnNvbGUud2Fybign8J+rgCBUcmFuc2FjdGlvbiBub3QgZm91bmQgaW4gc3RvcmFnZTonLCB0eEhhc2gpO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIGNoZWNraW5nIHRyYW5zYWN0aW9uIHN0YXR1czonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLy8gSW5pdGlhbCBzdGF0dXMgY2hlY2tcclxuICBhd2FpdCB1cGRhdGVTdGF0dXMoKTtcclxuXHJcbiAgLy8gUG9sbCBldmVyeSAzIHNlY29uZHNcclxuICB0eFN0YXR1c1BvbGxJbnRlcnZhbCA9IHNldEludGVydmFsKHVwZGF0ZVN0YXR1cywgMzAwMCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE5ldHdvcmtTeW1ib2wobmV0d29yaykge1xyXG4gIGNvbnN0IHN5bWJvbHMgPSB7XHJcbiAgICAncHVsc2VjaGFpbic6ICdQTFMnLFxyXG4gICAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ3RQTFMnLFxyXG4gICAgJ2V0aGVyZXVtJzogJ0VUSCcsXHJcbiAgICAnc2Vwb2xpYSc6ICdTZXBvbGlhRVRIJ1xyXG4gIH07XHJcbiAgcmV0dXJuIHN5bWJvbHNbbmV0d29ya10gfHwgJ0VUSCc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE5ldHdvcmtOYW1lKG5ldHdvcmspIHtcclxuICBjb25zdCBuYW1lcyA9IHtcclxuICAgICdwdWxzZWNoYWluJzogJ1B1bHNlQ2hhaW4gTWFpbm5ldCcsXHJcbiAgICAncHVsc2VjaGFpblRlc3RuZXQnOiAnUHVsc2VDaGFpbiBUZXN0bmV0IFY0JyxcclxuICAgICdldGhlcmV1bSc6ICdFdGhlcmV1bSBNYWlubmV0JyxcclxuICAgICdzZXBvbGlhJzogJ1NlcG9saWEgVGVzdG5ldCdcclxuICB9O1xyXG4gIHJldHVybiBuYW1lc1tuZXR3b3JrXSB8fCBuZXR3b3JrO1xyXG59XHJcblxyXG4vLyA9PT09PSBVVElMSVRJRVMgPT09PT1cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ29weUFkZHJlc3MoKSB7XHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGN1cnJlbnRTdGF0ZS5hZGRyZXNzKTtcclxuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29weS1hZGRyZXNzJyk7XHJcbiAgICBjb25zdCBvcmlnaW5hbFRleHQgPSBidG4udGV4dENvbnRlbnQ7XHJcbiAgICBidG4udGV4dENvbnRlbnQgPSAnQ09QSUVEISc7XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgYnRuLnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0O1xyXG4gICAgfSwgMjAwMCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGFsZXJ0KCdGYWlsZWQgdG8gY29weSBhZGRyZXNzJyk7XHJcbiAgfVxyXG59XHJcbiJdLCJmaWxlIjoicG9wdXAuanMifQ==