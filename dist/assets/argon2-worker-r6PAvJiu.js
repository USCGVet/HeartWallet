(function() {
  "use strict";
  const U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
  const _32n = /* @__PURE__ */ BigInt(32);
  function fromBig(n, le = false) {
    if (le)
      return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
    return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
  }
  const rotrSH = (h, l, s) => h >>> s | l << 32 - s;
  const rotrSL = (h, l, s) => h << 32 - s | l >>> s;
  const rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
  const rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
  const rotr32H = (_h, l) => l;
  const rotr32L = (h, _l) => h;
  function add(Ah, Al, Bh, Bl) {
    const l = (Al >>> 0) + (Bl >>> 0);
    return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
  }
  const add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
  const add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
  function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
  }
  function anumber(n, title = "") {
    if (!Number.isSafeInteger(n) || n < 0) {
      const prefix = title && `"${title}" `;
      throw new Error(`${prefix}expected integer >= 0, got ${n}`);
    }
  }
  function abytes(value, length, title = "") {
    const bytes = isBytes(value);
    const len = value?.length;
    const needsLen = length !== void 0;
    if (!bytes || needsLen && len !== length) {
      const prefix = title && `"${title}" `;
      const ofLen = needsLen ? ` of length ${length}` : "";
      const got = bytes ? `length=${len}` : `type=${typeof value}`;
      throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
    }
    return value;
  }
  function aexists(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished)
      throw new Error("Hash#digest() has already been called");
  }
  function aoutput(out, instance) {
    abytes(out, void 0, "digestInto() output");
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error('"digestInto() output" expected to be of length >=' + min);
    }
  }
  function u8(arr) {
    return new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  function u32(arr) {
    return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
  }
  function clean(...arrays) {
    for (let i = 0; i < arrays.length; i++) {
      arrays[i].fill(0);
    }
  }
  const isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
  function byteSwap(word) {
    return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
  }
  const swap8IfBE = isLE ? (n) => n : (n) => byteSwap(n);
  function byteSwap32(arr) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = byteSwap(arr[i]);
    }
    return arr;
  }
  const swap32IfBE = isLE ? (u) => u : byteSwap32;
  const nextTick = async () => {
  };
  function utf8ToBytes(str) {
    if (typeof str !== "string")
      throw new Error("string expected");
    return new Uint8Array(new TextEncoder().encode(str));
  }
  function kdfInputToBytes(data, errorTitle = "") {
    if (typeof data === "string")
      return utf8ToBytes(data);
    return abytes(data, void 0, errorTitle);
  }
  function createHasher(hashCons, info = {}) {
    const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
    const tmp = hashCons(void 0);
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (opts) => hashCons(opts);
    Object.assign(hashC, info);
    return Object.freeze(hashC);
  }
  const BSIGMA = /* @__PURE__ */ Uint8Array.from([
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    14,
    10,
    4,
    8,
    9,
    15,
    13,
    6,
    1,
    12,
    0,
    2,
    11,
    7,
    5,
    3,
    11,
    8,
    12,
    0,
    5,
    2,
    15,
    13,
    10,
    14,
    3,
    6,
    7,
    1,
    9,
    4,
    7,
    9,
    3,
    1,
    13,
    12,
    11,
    14,
    2,
    6,
    5,
    10,
    4,
    0,
    15,
    8,
    9,
    0,
    5,
    7,
    2,
    4,
    10,
    15,
    14,
    1,
    11,
    12,
    6,
    8,
    3,
    13,
    2,
    12,
    6,
    10,
    0,
    11,
    8,
    3,
    4,
    13,
    7,
    5,
    15,
    14,
    1,
    9,
    12,
    5,
    1,
    15,
    14,
    13,
    4,
    10,
    0,
    7,
    6,
    3,
    9,
    2,
    8,
    11,
    13,
    11,
    7,
    14,
    12,
    1,
    3,
    9,
    5,
    0,
    15,
    4,
    8,
    6,
    2,
    10,
    6,
    15,
    14,
    9,
    11,
    3,
    0,
    8,
    12,
    2,
    13,
    7,
    1,
    4,
    10,
    5,
    10,
    2,
    8,
    4,
    7,
    6,
    1,
    5,
    15,
    11,
    9,
    14,
    3,
    12,
    13,
    0,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    14,
    10,
    4,
    8,
    9,
    15,
    13,
    6,
    1,
    12,
    0,
    2,
    11,
    7,
    5,
    3,
    // Blake1, unused in others
    11,
    8,
    12,
    0,
    5,
    2,
    15,
    13,
    10,
    14,
    3,
    6,
    7,
    1,
    9,
    4,
    7,
    9,
    3,
    1,
    13,
    12,
    11,
    14,
    2,
    6,
    5,
    10,
    4,
    0,
    15,
    8,
    9,
    0,
    5,
    7,
    2,
    4,
    10,
    15,
    14,
    1,
    11,
    12,
    6,
    8,
    3,
    13,
    2,
    12,
    6,
    10,
    0,
    11,
    8,
    3,
    4,
    13,
    7,
    5,
    15,
    14,
    1,
    9
  ]);
  const B2B_IV = /* @__PURE__ */ Uint32Array.from([
    4089235720,
    1779033703,
    2227873595,
    3144134277,
    4271175723,
    1013904242,
    1595750129,
    2773480762,
    2917565137,
    1359893119,
    725511199,
    2600822924,
    4215389547,
    528734635,
    327033209,
    1541459225
  ]);
  const BBUF = /* @__PURE__ */ new Uint32Array(32);
  function G1b(a, b, c, d, msg, x) {
    const Xl = msg[x], Xh = msg[x + 1];
    let Al = BBUF[2 * a], Ah = BBUF[2 * a + 1];
    let Bl = BBUF[2 * b], Bh = BBUF[2 * b + 1];
    let Cl = BBUF[2 * c], Ch = BBUF[2 * c + 1];
    let Dl = BBUF[2 * d], Dh = BBUF[2 * d + 1];
    let ll = add3L(Al, Bl, Xl);
    Ah = add3H(ll, Ah, Bh, Xh);
    Al = ll | 0;
    ({ Dh, Dl } = { Dh: Dh ^ Ah, Dl: Dl ^ Al });
    ({ Dh, Dl } = { Dh: rotr32H(Dh, Dl), Dl: rotr32L(Dh) });
    ({ h: Ch, l: Cl } = add(Ch, Cl, Dh, Dl));
    ({ Bh, Bl } = { Bh: Bh ^ Ch, Bl: Bl ^ Cl });
    ({ Bh, Bl } = { Bh: rotrSH(Bh, Bl, 24), Bl: rotrSL(Bh, Bl, 24) });
    BBUF[2 * a] = Al, BBUF[2 * a + 1] = Ah;
    BBUF[2 * b] = Bl, BBUF[2 * b + 1] = Bh;
    BBUF[2 * c] = Cl, BBUF[2 * c + 1] = Ch;
    BBUF[2 * d] = Dl, BBUF[2 * d + 1] = Dh;
  }
  function G2b(a, b, c, d, msg, x) {
    const Xl = msg[x], Xh = msg[x + 1];
    let Al = BBUF[2 * a], Ah = BBUF[2 * a + 1];
    let Bl = BBUF[2 * b], Bh = BBUF[2 * b + 1];
    let Cl = BBUF[2 * c], Ch = BBUF[2 * c + 1];
    let Dl = BBUF[2 * d], Dh = BBUF[2 * d + 1];
    let ll = add3L(Al, Bl, Xl);
    Ah = add3H(ll, Ah, Bh, Xh);
    Al = ll | 0;
    ({ Dh, Dl } = { Dh: Dh ^ Ah, Dl: Dl ^ Al });
    ({ Dh, Dl } = { Dh: rotrSH(Dh, Dl, 16), Dl: rotrSL(Dh, Dl, 16) });
    ({ h: Ch, l: Cl } = add(Ch, Cl, Dh, Dl));
    ({ Bh, Bl } = { Bh: Bh ^ Ch, Bl: Bl ^ Cl });
    ({ Bh, Bl } = { Bh: rotrBH(Bh, Bl, 63), Bl: rotrBL(Bh, Bl, 63) });
    BBUF[2 * a] = Al, BBUF[2 * a + 1] = Ah;
    BBUF[2 * b] = Bl, BBUF[2 * b + 1] = Bh;
    BBUF[2 * c] = Cl, BBUF[2 * c + 1] = Ch;
    BBUF[2 * d] = Dl, BBUF[2 * d + 1] = Dh;
  }
  function checkBlake2Opts(outputLen, opts = {}, keyLen, saltLen, persLen) {
    anumber(keyLen);
    if (outputLen < 0 || outputLen > keyLen)
      throw new Error("outputLen bigger than keyLen");
    const { key, salt, personalization } = opts;
    if (key !== void 0 && (key.length < 1 || key.length > keyLen))
      throw new Error('"key" expected to be undefined or of length=1..' + keyLen);
    if (salt !== void 0)
      abytes(salt, saltLen, "salt");
    if (personalization !== void 0)
      abytes(personalization, persLen, "personalization");
  }
  class _BLAKE2 {
    buffer;
    buffer32;
    finished = false;
    destroyed = false;
    length = 0;
    pos = 0;
    blockLen;
    outputLen;
    constructor(blockLen, outputLen) {
      anumber(blockLen);
      anumber(outputLen);
      this.blockLen = blockLen;
      this.outputLen = outputLen;
      this.buffer = new Uint8Array(blockLen);
      this.buffer32 = u32(this.buffer);
    }
    update(data) {
      aexists(this);
      abytes(data);
      const { blockLen, buffer, buffer32 } = this;
      const len = data.length;
      const offset = data.byteOffset;
      const buf = data.buffer;
      for (let pos = 0; pos < len; ) {
        if (this.pos === blockLen) {
          swap32IfBE(buffer32);
          this.compress(buffer32, 0, false);
          swap32IfBE(buffer32);
          this.pos = 0;
        }
        const take = Math.min(blockLen - this.pos, len - pos);
        const dataOffset = offset + pos;
        if (take === blockLen && !(dataOffset % 4) && pos + take < len) {
          const data32 = new Uint32Array(buf, dataOffset, Math.floor((len - pos) / 4));
          swap32IfBE(data32);
          for (let pos32 = 0; pos + blockLen < len; pos32 += buffer32.length, pos += blockLen) {
            this.length += blockLen;
            this.compress(data32, pos32, false);
          }
          swap32IfBE(data32);
          continue;
        }
        buffer.set(data.subarray(pos, pos + take), this.pos);
        this.pos += take;
        this.length += take;
        pos += take;
      }
      return this;
    }
    digestInto(out) {
      aexists(this);
      aoutput(out, this);
      const { pos, buffer32 } = this;
      this.finished = true;
      clean(this.buffer.subarray(pos));
      swap32IfBE(buffer32);
      this.compress(buffer32, 0, true);
      swap32IfBE(buffer32);
      const out32 = u32(out);
      this.get().forEach((v, i) => out32[i] = swap8IfBE(v));
    }
    digest() {
      const { buffer, outputLen } = this;
      this.digestInto(buffer);
      const res = buffer.slice(0, outputLen);
      this.destroy();
      return res;
    }
    _cloneInto(to) {
      const { buffer, length, finished, destroyed, outputLen, pos } = this;
      to ||= new this.constructor({ dkLen: outputLen });
      to.set(...this.get());
      to.buffer.set(buffer);
      to.destroyed = destroyed;
      to.finished = finished;
      to.length = length;
      to.pos = pos;
      to.outputLen = outputLen;
      return to;
    }
    clone() {
      return this._cloneInto();
    }
  }
  class _BLAKE2b extends _BLAKE2 {
    // Same as SHA-512, but LE
    v0l = B2B_IV[0] | 0;
    v0h = B2B_IV[1] | 0;
    v1l = B2B_IV[2] | 0;
    v1h = B2B_IV[3] | 0;
    v2l = B2B_IV[4] | 0;
    v2h = B2B_IV[5] | 0;
    v3l = B2B_IV[6] | 0;
    v3h = B2B_IV[7] | 0;
    v4l = B2B_IV[8] | 0;
    v4h = B2B_IV[9] | 0;
    v5l = B2B_IV[10] | 0;
    v5h = B2B_IV[11] | 0;
    v6l = B2B_IV[12] | 0;
    v6h = B2B_IV[13] | 0;
    v7l = B2B_IV[14] | 0;
    v7h = B2B_IV[15] | 0;
    constructor(opts = {}) {
      const olen = opts.dkLen === void 0 ? 64 : opts.dkLen;
      super(128, olen);
      checkBlake2Opts(olen, opts, 64, 16, 16);
      let { key, personalization, salt } = opts;
      let keyLength = 0;
      if (key !== void 0) {
        abytes(key, void 0, "key");
        keyLength = key.length;
      }
      this.v0l ^= this.outputLen | keyLength << 8 | 1 << 16 | 1 << 24;
      if (salt !== void 0) {
        abytes(salt, void 0, "salt");
        const slt = u32(salt);
        this.v4l ^= swap8IfBE(slt[0]);
        this.v4h ^= swap8IfBE(slt[1]);
        this.v5l ^= swap8IfBE(slt[2]);
        this.v5h ^= swap8IfBE(slt[3]);
      }
      if (personalization !== void 0) {
        abytes(personalization, void 0, "personalization");
        const pers = u32(personalization);
        this.v6l ^= swap8IfBE(pers[0]);
        this.v6h ^= swap8IfBE(pers[1]);
        this.v7l ^= swap8IfBE(pers[2]);
        this.v7h ^= swap8IfBE(pers[3]);
      }
      if (key !== void 0) {
        const tmp = new Uint8Array(this.blockLen);
        tmp.set(key);
        this.update(tmp);
      }
    }
    // prettier-ignore
    get() {
      let { v0l, v0h, v1l, v1h, v2l, v2h, v3l, v3h, v4l, v4h, v5l, v5h, v6l, v6h, v7l, v7h } = this;
      return [v0l, v0h, v1l, v1h, v2l, v2h, v3l, v3h, v4l, v4h, v5l, v5h, v6l, v6h, v7l, v7h];
    }
    // prettier-ignore
    set(v0l, v0h, v1l, v1h, v2l, v2h, v3l, v3h, v4l, v4h, v5l, v5h, v6l, v6h, v7l, v7h) {
      this.v0l = v0l | 0;
      this.v0h = v0h | 0;
      this.v1l = v1l | 0;
      this.v1h = v1h | 0;
      this.v2l = v2l | 0;
      this.v2h = v2h | 0;
      this.v3l = v3l | 0;
      this.v3h = v3h | 0;
      this.v4l = v4l | 0;
      this.v4h = v4h | 0;
      this.v5l = v5l | 0;
      this.v5h = v5h | 0;
      this.v6l = v6l | 0;
      this.v6h = v6h | 0;
      this.v7l = v7l | 0;
      this.v7h = v7h | 0;
    }
    compress(msg, offset, isLast) {
      this.get().forEach((v, i) => BBUF[i] = v);
      BBUF.set(B2B_IV, 16);
      let { h, l } = fromBig(BigInt(this.length));
      BBUF[24] = B2B_IV[8] ^ l;
      BBUF[25] = B2B_IV[9] ^ h;
      if (isLast) {
        BBUF[28] = ~BBUF[28];
        BBUF[29] = ~BBUF[29];
      }
      let j = 0;
      const s = BSIGMA;
      for (let i = 0; i < 12; i++) {
        G1b(0, 4, 8, 12, msg, offset + 2 * s[j++]);
        G2b(0, 4, 8, 12, msg, offset + 2 * s[j++]);
        G1b(1, 5, 9, 13, msg, offset + 2 * s[j++]);
        G2b(1, 5, 9, 13, msg, offset + 2 * s[j++]);
        G1b(2, 6, 10, 14, msg, offset + 2 * s[j++]);
        G2b(2, 6, 10, 14, msg, offset + 2 * s[j++]);
        G1b(3, 7, 11, 15, msg, offset + 2 * s[j++]);
        G2b(3, 7, 11, 15, msg, offset + 2 * s[j++]);
        G1b(0, 5, 10, 15, msg, offset + 2 * s[j++]);
        G2b(0, 5, 10, 15, msg, offset + 2 * s[j++]);
        G1b(1, 6, 11, 12, msg, offset + 2 * s[j++]);
        G2b(1, 6, 11, 12, msg, offset + 2 * s[j++]);
        G1b(2, 7, 8, 13, msg, offset + 2 * s[j++]);
        G2b(2, 7, 8, 13, msg, offset + 2 * s[j++]);
        G1b(3, 4, 9, 14, msg, offset + 2 * s[j++]);
        G2b(3, 4, 9, 14, msg, offset + 2 * s[j++]);
      }
      this.v0l ^= BBUF[0] ^ BBUF[16];
      this.v0h ^= BBUF[1] ^ BBUF[17];
      this.v1l ^= BBUF[2] ^ BBUF[18];
      this.v1h ^= BBUF[3] ^ BBUF[19];
      this.v2l ^= BBUF[4] ^ BBUF[20];
      this.v2h ^= BBUF[5] ^ BBUF[21];
      this.v3l ^= BBUF[6] ^ BBUF[22];
      this.v3h ^= BBUF[7] ^ BBUF[23];
      this.v4l ^= BBUF[8] ^ BBUF[24];
      this.v4h ^= BBUF[9] ^ BBUF[25];
      this.v5l ^= BBUF[10] ^ BBUF[26];
      this.v5h ^= BBUF[11] ^ BBUF[27];
      this.v6l ^= BBUF[12] ^ BBUF[28];
      this.v6h ^= BBUF[13] ^ BBUF[29];
      this.v7l ^= BBUF[14] ^ BBUF[30];
      this.v7h ^= BBUF[15] ^ BBUF[31];
      clean(BBUF);
    }
    destroy() {
      this.destroyed = true;
      clean(this.buffer32);
      this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
  }
  const blake2b = /* @__PURE__ */ createHasher((opts) => new _BLAKE2b(opts));
  const AT = { Argond2d: 0, Argon2i: 1, Argon2id: 2 };
  const ARGON2_SYNC_POINTS = 4;
  const abytesOrZero = (buf, errorTitle = "") => {
    if (buf === void 0)
      return Uint8Array.of();
    return kdfInputToBytes(buf, errorTitle);
  };
  function mul(a, b) {
    const aL = a & 65535;
    const aH = a >>> 16;
    const bL = b & 65535;
    const bH = b >>> 16;
    const ll = Math.imul(aL, bL);
    const hl = Math.imul(aH, bL);
    const lh = Math.imul(aL, bH);
    const hh = Math.imul(aH, bH);
    const carry = (ll >>> 16) + (hl & 65535) + lh;
    const high = hh + (hl >>> 16) + (carry >>> 16) | 0;
    const low = carry << 16 | ll & 65535;
    return { h: high, l: low };
  }
  function mul2(a, b) {
    const { h, l } = mul(a, b);
    return { h: (h << 1 | l >>> 31) & 4294967295, l: l << 1 & 4294967295 };
  }
  function blamka(Ah, Al, Bh, Bl) {
    const { h: Ch, l: Cl } = mul2(Al, Bl);
    const Rll = add3L(Al, Bl, Cl);
    return { h: add3H(Rll, Ah, Bh, Ch), l: Rll | 0 };
  }
  const A2_BUF = new Uint32Array(256);
  function G(a, b, c, d) {
    let Al = A2_BUF[2 * a], Ah = A2_BUF[2 * a + 1];
    let Bl = A2_BUF[2 * b], Bh = A2_BUF[2 * b + 1];
    let Cl = A2_BUF[2 * c], Ch = A2_BUF[2 * c + 1];
    let Dl = A2_BUF[2 * d], Dh = A2_BUF[2 * d + 1];
    ({ h: Ah, l: Al } = blamka(Ah, Al, Bh, Bl));
    ({ Dh, Dl } = { Dh: Dh ^ Ah, Dl: Dl ^ Al });
    ({ Dh, Dl } = { Dh: rotr32H(Dh, Dl), Dl: rotr32L(Dh) });
    ({ h: Ch, l: Cl } = blamka(Ch, Cl, Dh, Dl));
    ({ Bh, Bl } = { Bh: Bh ^ Ch, Bl: Bl ^ Cl });
    ({ Bh, Bl } = { Bh: rotrSH(Bh, Bl, 24), Bl: rotrSL(Bh, Bl, 24) });
    ({ h: Ah, l: Al } = blamka(Ah, Al, Bh, Bl));
    ({ Dh, Dl } = { Dh: Dh ^ Ah, Dl: Dl ^ Al });
    ({ Dh, Dl } = { Dh: rotrSH(Dh, Dl, 16), Dl: rotrSL(Dh, Dl, 16) });
    ({ h: Ch, l: Cl } = blamka(Ch, Cl, Dh, Dl));
    ({ Bh, Bl } = { Bh: Bh ^ Ch, Bl: Bl ^ Cl });
    ({ Bh, Bl } = { Bh: rotrBH(Bh, Bl, 63), Bl: rotrBL(Bh, Bl, 63) });
    A2_BUF[2 * a] = Al, A2_BUF[2 * a + 1] = Ah;
    A2_BUF[2 * b] = Bl, A2_BUF[2 * b + 1] = Bh;
    A2_BUF[2 * c] = Cl, A2_BUF[2 * c + 1] = Ch;
    A2_BUF[2 * d] = Dl, A2_BUF[2 * d + 1] = Dh;
  }
  function P(v00, v01, v02, v03, v04, v05, v06, v07, v08, v09, v10, v11, v12, v13, v14, v15) {
    G(v00, v04, v08, v12);
    G(v01, v05, v09, v13);
    G(v02, v06, v10, v14);
    G(v03, v07, v11, v15);
    G(v00, v05, v10, v15);
    G(v01, v06, v11, v12);
    G(v02, v07, v08, v13);
    G(v03, v04, v09, v14);
  }
  function block(x, xPos, yPos, outPos, needXor) {
    for (let i = 0; i < 256; i++)
      A2_BUF[i] = x[xPos + i] ^ x[yPos + i];
    for (let i = 0; i < 128; i += 16) {
      P(i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9, i + 10, i + 11, i + 12, i + 13, i + 14, i + 15);
    }
    for (let i = 0; i < 16; i += 2) {
      P(i, i + 1, i + 16, i + 17, i + 32, i + 33, i + 48, i + 49, i + 64, i + 65, i + 80, i + 81, i + 96, i + 97, i + 112, i + 113);
    }
    if (needXor)
      for (let i = 0; i < 256; i++)
        x[outPos + i] ^= A2_BUF[i] ^ x[xPos + i] ^ x[yPos + i];
    else
      for (let i = 0; i < 256; i++)
        x[outPos + i] = A2_BUF[i] ^ x[xPos + i] ^ x[yPos + i];
    clean(A2_BUF);
  }
  function Hp(A, dkLen) {
    const A8 = u8(A);
    const T = new Uint32Array(1);
    const T8 = u8(T);
    T[0] = dkLen;
    if (dkLen <= 64)
      return blake2b.create({ dkLen }).update(T8).update(A8).digest();
    const out = new Uint8Array(dkLen);
    let V = blake2b.create({}).update(T8).update(A8).digest();
    let pos = 0;
    out.set(V.subarray(0, 32));
    pos += 32;
    for (; dkLen - pos > 64; pos += 32) {
      const Vh = blake2b.create({}).update(V);
      Vh.digestInto(V);
      Vh.destroy();
      out.set(V.subarray(0, 32), pos);
    }
    out.set(blake2b(V, { dkLen: dkLen - pos }), pos);
    clean(V, T);
    return u32(out);
  }
  function indexAlpha(r, s, laneLen, segmentLen, index, randL, sameLane = false) {
    let area;
    if (r === 0) {
      if (s === 0)
        area = index - 1;
      else if (sameLane)
        area = s * segmentLen + index - 1;
      else
        area = s * segmentLen + (index == 0 ? -1 : 0);
    } else if (sameLane)
      area = laneLen - segmentLen + index - 1;
    else
      area = laneLen - segmentLen + (index == 0 ? -1 : 0);
    const startPos = r !== 0 && s !== ARGON2_SYNC_POINTS - 1 ? (s + 1) * segmentLen : 0;
    const rel = area - 1 - mul(area, mul(randL, randL).h).h;
    return (startPos + rel) % laneLen;
  }
  const maxUint32 = Math.pow(2, 32);
  function isU32(num) {
    return Number.isSafeInteger(num) && num >= 0 && num < maxUint32;
  }
  function argon2Opts(opts) {
    const merged = {
      version: 19,
      dkLen: 32,
      maxmem: maxUint32 - 1,
      asyncTick: 10
    };
    for (let [k, v] of Object.entries(opts))
      if (v !== void 0)
        merged[k] = v;
    const { dkLen, p, m, t, version, onProgress, asyncTick } = merged;
    if (!isU32(dkLen) || dkLen < 4)
      throw new Error('"dkLen" must be 4..');
    if (!isU32(p) || p < 1 || p >= Math.pow(2, 24))
      throw new Error('"p" must be 1..2^24');
    if (!isU32(m))
      throw new Error('"m" must be 0..2^32');
    if (!isU32(t) || t < 1)
      throw new Error('"t" (iterations) must be 1..2^32');
    if (onProgress !== void 0 && typeof onProgress !== "function")
      throw new Error('"progressCb" must be a function');
    anumber(asyncTick, "asyncTick");
    if (!isU32(m) || m < 8 * p)
      throw new Error('"m" (memory) must be at least 8*p bytes');
    if (version !== 16 && version !== 19)
      throw new Error('"version" must be 0x10 or 0x13, got ' + version);
    return merged;
  }
  function argon2Init(password, salt, type, opts) {
    password = kdfInputToBytes(password, "password");
    salt = kdfInputToBytes(salt, "salt");
    if (!isU32(password.length))
      throw new Error('"password" must be less of length 1..4Gb');
    if (!isU32(salt.length) || salt.length < 8)
      throw new Error('"salt" must be of length 8..4Gb');
    if (!Object.values(AT).includes(type))
      throw new Error('"type" was invalid');
    let { p, dkLen, m, t, version, key, personalization, maxmem, onProgress, asyncTick } = argon2Opts(opts);
    key = abytesOrZero(key, "key");
    personalization = abytesOrZero(personalization, "personalization");
    const h = blake2b.create();
    const BUF = new Uint32Array(1);
    const BUF8 = u8(BUF);
    for (let item of [p, dkLen, m, t, version, type]) {
      BUF[0] = item;
      h.update(BUF8);
    }
    for (let i of [password, salt, key, personalization]) {
      BUF[0] = i.length;
      h.update(BUF8).update(i);
    }
    const H0 = new Uint32Array(18);
    const H0_8 = u8(H0);
    h.digestInto(H0_8);
    const lanes = p;
    const mP = 4 * p * Math.floor(m / (ARGON2_SYNC_POINTS * p));
    const laneLen = Math.floor(mP / p);
    const segmentLen = Math.floor(laneLen / ARGON2_SYNC_POINTS);
    const memUsed = mP * 256;
    if (!isU32(maxmem) || memUsed > maxmem)
      throw new Error('"maxmem" expected <2**32, got: maxmem=' + maxmem + ", memused=" + memUsed);
    const B = new Uint32Array(memUsed);
    for (let l = 0; l < p; l++) {
      const i = 256 * laneLen * l;
      H0[17] = l;
      H0[16] = 0;
      B.set(Hp(H0, 1024), i);
      H0[16] = 1;
      B.set(Hp(H0, 1024), i + 256);
    }
    let perBlock = () => {
    };
    if (onProgress) {
      const totalBlock = t * ARGON2_SYNC_POINTS * p * segmentLen;
      const callbackPer = Math.max(Math.floor(totalBlock / 1e4), 1);
      let blockCnt = 0;
      perBlock = () => {
        blockCnt++;
        if (onProgress && (!(blockCnt % callbackPer) || blockCnt === totalBlock))
          onProgress(blockCnt / totalBlock);
      };
    }
    clean(BUF, H0);
    return { type, mP, p, t, version, B, laneLen, lanes, segmentLen, dkLen, perBlock, asyncTick };
  }
  function argon2Output(B, p, laneLen, dkLen) {
    const B_final = new Uint32Array(256);
    for (let l = 0; l < p; l++)
      for (let j = 0; j < 256; j++)
        B_final[j] ^= B[256 * (laneLen * l + laneLen - 1) + j];
    const res = u8(Hp(B_final, dkLen));
    clean(B_final);
    return res;
  }
  function processBlock(B, address, l, r, s, index, laneLen, segmentLen, lanes, offset, prev, dataIndependent, needXor) {
    if (offset % laneLen)
      prev = offset - 1;
    let randL, randH;
    if (dataIndependent) {
      let i128 = index % 128;
      if (i128 === 0) {
        address[256 + 12]++;
        block(address, 256, 2 * 256, 0, false);
        block(address, 0, 2 * 256, 0, false);
      }
      randL = address[2 * i128];
      randH = address[2 * i128 + 1];
    } else {
      const T = 256 * prev;
      randL = B[T];
      randH = B[T + 1];
    }
    const refLane = r === 0 && s === 0 ? l : randH % lanes;
    const refPos = indexAlpha(r, s, laneLen, segmentLen, index, randL, refLane == l);
    const refBlock = laneLen * refLane + refPos;
    block(B, 256 * prev, 256 * refBlock, offset * 256, needXor);
  }
  async function argon2Async(type, password, salt, opts) {
    const { mP, p, t, version, B, laneLen, lanes, segmentLen, dkLen, perBlock, asyncTick } = argon2Init(password, salt, type, opts);
    const address = new Uint32Array(3 * 256);
    address[256 + 6] = mP;
    address[256 + 8] = t;
    address[256 + 10] = type;
    let ts = Date.now();
    for (let r = 0; r < t; r++) {
      const needXor = r !== 0 && version === 19;
      address[256 + 0] = r;
      for (let s = 0; s < ARGON2_SYNC_POINTS; s++) {
        address[256 + 4] = s;
        const dataIndependent = r === 0 && s < 2;
        for (let l = 0; l < p; l++) {
          address[256 + 2] = l;
          address[256 + 12] = 0;
          let startPos = 0;
          if (r === 0 && s === 0) {
            startPos = 2;
            if (dataIndependent) {
              address[256 + 12]++;
              block(address, 256, 2 * 256, 0, false);
              block(address, 0, 2 * 256, 0, false);
            }
          }
          let offset = l * laneLen + s * segmentLen + startPos;
          let prev = offset % laneLen ? offset - 1 : offset + laneLen - 1;
          for (let index = startPos; index < segmentLen; index++, offset++, prev++) {
            perBlock();
            processBlock(B, address, l, r, s, index, laneLen, segmentLen, lanes, offset, prev, dataIndependent, needXor);
            const diff = Date.now() - ts;
            if (!(diff >= 0 && diff < asyncTick)) {
              await nextTick();
              ts += diff;
            }
          }
        }
      }
    }
    clean(address);
    return argon2Output(B, p, laneLen, dkLen);
  }
  const argon2idAsync = (password, salt, opts) => argon2Async(AT.Argon2id, password, salt, opts);
  self.onmessage = async (e) => {
    const { password, salt, params } = e.data;
    try {
      const encoder = new TextEncoder();
      const passwordBytes = encoder.encode(password);
      const saltBytes = new Uint8Array(salt);
      const result = await argon2idAsync(
        passwordBytes,
        saltBytes,
        {
          m: params.memory,
          t: params.iterations,
          p: params.parallelism || 1,
          dkLen: 32,
          asyncTick: 5,
          // Yield every 5ms (doesn't block UI since we're in worker)
          onProgress: (progress) => {
            self.postMessage({
              type: "progress",
              progress
            });
          }
        }
      );
      self.postMessage({
        type: "complete",
        result: Array.from(result)
        // Convert Uint8Array to regular array for postMessage
      });
    } catch (error) {
      self.postMessage({
        type: "error",
        error: error.message
      });
    }
  };
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJnb24yLXdvcmtlci1yNlBBdkppdS5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9oYXNoZXMvX3U2NC5qcyIsIi4uL25vZGVfbW9kdWxlcy9Abm9ibGUvaGFzaGVzL3V0aWxzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9oYXNoZXMvX2JsYWtlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9oYXNoZXMvYmxha2UyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9oYXNoZXMvYXJnb24yLmpzIiwiLi4vc3JjL3dvcmtlcnMvYXJnb24yLXdvcmtlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEludGVybmFsIGhlbHBlcnMgZm9yIHU2NC4gQmlnVWludDY0QXJyYXkgaXMgdG9vIHNsb3cgYXMgcGVyIDIwMjUsIHNvIHdlIGltcGxlbWVudCBpdCB1c2luZyBVaW50MzJBcnJheS5cbiAqIEB0b2RvIHJlLWNoZWNrIGh0dHBzOi8vaXNzdWVzLmNocm9taXVtLm9yZy9pc3N1ZXMvNDIyMTI1ODhcbiAqIEBtb2R1bGVcbiAqL1xuY29uc3QgVTMyX01BU0s2NCA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMiAqKiAzMiAtIDEpO1xuY29uc3QgXzMybiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMzIpO1xuZnVuY3Rpb24gZnJvbUJpZyhuLCBsZSA9IGZhbHNlKSB7XG4gICAgaWYgKGxlKVxuICAgICAgICByZXR1cm4geyBoOiBOdW1iZXIobiAmIFUzMl9NQVNLNjQpLCBsOiBOdW1iZXIoKG4gPj4gXzMybikgJiBVMzJfTUFTSzY0KSB9O1xuICAgIHJldHVybiB7IGg6IE51bWJlcigobiA+PiBfMzJuKSAmIFUzMl9NQVNLNjQpIHwgMCwgbDogTnVtYmVyKG4gJiBVMzJfTUFTSzY0KSB8IDAgfTtcbn1cbmZ1bmN0aW9uIHNwbGl0KGxzdCwgbGUgPSBmYWxzZSkge1xuICAgIGNvbnN0IGxlbiA9IGxzdC5sZW5ndGg7XG4gICAgbGV0IEFoID0gbmV3IFVpbnQzMkFycmF5KGxlbik7XG4gICAgbGV0IEFsID0gbmV3IFVpbnQzMkFycmF5KGxlbik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBjb25zdCB7IGgsIGwgfSA9IGZyb21CaWcobHN0W2ldLCBsZSk7XG4gICAgICAgIFtBaFtpXSwgQWxbaV1dID0gW2gsIGxdO1xuICAgIH1cbiAgICByZXR1cm4gW0FoLCBBbF07XG59XG5jb25zdCB0b0JpZyA9IChoLCBsKSA9PiAoQmlnSW50KGggPj4+IDApIDw8IF8zMm4pIHwgQmlnSW50KGwgPj4+IDApO1xuLy8gZm9yIFNoaWZ0IGluIFswLCAzMilcbmNvbnN0IHNoclNIID0gKGgsIF9sLCBzKSA9PiBoID4+PiBzO1xuY29uc3Qgc2hyU0wgPSAoaCwgbCwgcykgPT4gKGggPDwgKDMyIC0gcykpIHwgKGwgPj4+IHMpO1xuLy8gUmlnaHQgcm90YXRlIGZvciBTaGlmdCBpbiBbMSwgMzIpXG5jb25zdCByb3RyU0ggPSAoaCwgbCwgcykgPT4gKGggPj4+IHMpIHwgKGwgPDwgKDMyIC0gcykpO1xuY29uc3Qgcm90clNMID0gKGgsIGwsIHMpID0+IChoIDw8ICgzMiAtIHMpKSB8IChsID4+PiBzKTtcbi8vIFJpZ2h0IHJvdGF0ZSBmb3IgU2hpZnQgaW4gKDMyLCA2NCksIE5PVEU6IDMyIGlzIHNwZWNpYWwgY2FzZS5cbmNvbnN0IHJvdHJCSCA9IChoLCBsLCBzKSA9PiAoaCA8PCAoNjQgLSBzKSkgfCAobCA+Pj4gKHMgLSAzMikpO1xuY29uc3Qgcm90ckJMID0gKGgsIGwsIHMpID0+IChoID4+PiAocyAtIDMyKSkgfCAobCA8PCAoNjQgLSBzKSk7XG4vLyBSaWdodCByb3RhdGUgZm9yIHNoaWZ0PT09MzIgKGp1c3Qgc3dhcHMgbCZoKVxuY29uc3Qgcm90cjMySCA9IChfaCwgbCkgPT4gbDtcbmNvbnN0IHJvdHIzMkwgPSAoaCwgX2wpID0+IGg7XG4vLyBMZWZ0IHJvdGF0ZSBmb3IgU2hpZnQgaW4gWzEsIDMyKVxuY29uc3Qgcm90bFNIID0gKGgsIGwsIHMpID0+IChoIDw8IHMpIHwgKGwgPj4+ICgzMiAtIHMpKTtcbmNvbnN0IHJvdGxTTCA9IChoLCBsLCBzKSA9PiAobCA8PCBzKSB8IChoID4+PiAoMzIgLSBzKSk7XG4vLyBMZWZ0IHJvdGF0ZSBmb3IgU2hpZnQgaW4gKDMyLCA2NCksIE5PVEU6IDMyIGlzIHNwZWNpYWwgY2FzZS5cbmNvbnN0IHJvdGxCSCA9IChoLCBsLCBzKSA9PiAobCA8PCAocyAtIDMyKSkgfCAoaCA+Pj4gKDY0IC0gcykpO1xuY29uc3Qgcm90bEJMID0gKGgsIGwsIHMpID0+IChoIDw8IChzIC0gMzIpKSB8IChsID4+PiAoNjQgLSBzKSk7XG4vLyBKUyB1c2VzIDMyLWJpdCBzaWduZWQgaW50ZWdlcnMgZm9yIGJpdHdpc2Ugb3BlcmF0aW9ucyB3aGljaCBtZWFucyB3ZSBjYW5ub3Rcbi8vIHNpbXBsZSB0YWtlIGNhcnJ5IG91dCBvZiBsb3cgYml0IHN1bSBieSBzaGlmdCwgd2UgbmVlZCB0byB1c2UgZGl2aXNpb24uXG5mdW5jdGlvbiBhZGQoQWgsIEFsLCBCaCwgQmwpIHtcbiAgICBjb25zdCBsID0gKEFsID4+PiAwKSArIChCbCA+Pj4gMCk7XG4gICAgcmV0dXJuIHsgaDogKEFoICsgQmggKyAoKGwgLyAyICoqIDMyKSB8IDApKSB8IDAsIGw6IGwgfCAwIH07XG59XG4vLyBBZGRpdGlvbiB3aXRoIG1vcmUgdGhhbiAyIGVsZW1lbnRzXG5jb25zdCBhZGQzTCA9IChBbCwgQmwsIENsKSA9PiAoQWwgPj4+IDApICsgKEJsID4+PiAwKSArIChDbCA+Pj4gMCk7XG5jb25zdCBhZGQzSCA9IChsb3csIEFoLCBCaCwgQ2gpID0+IChBaCArIEJoICsgQ2ggKyAoKGxvdyAvIDIgKiogMzIpIHwgMCkpIHwgMDtcbmNvbnN0IGFkZDRMID0gKEFsLCBCbCwgQ2wsIERsKSA9PiAoQWwgPj4+IDApICsgKEJsID4+PiAwKSArIChDbCA+Pj4gMCkgKyAoRGwgPj4+IDApO1xuY29uc3QgYWRkNEggPSAobG93LCBBaCwgQmgsIENoLCBEaCkgPT4gKEFoICsgQmggKyBDaCArIERoICsgKChsb3cgLyAyICoqIDMyKSB8IDApKSB8IDA7XG5jb25zdCBhZGQ1TCA9IChBbCwgQmwsIENsLCBEbCwgRWwpID0+IChBbCA+Pj4gMCkgKyAoQmwgPj4+IDApICsgKENsID4+PiAwKSArIChEbCA+Pj4gMCkgKyAoRWwgPj4+IDApO1xuY29uc3QgYWRkNUggPSAobG93LCBBaCwgQmgsIENoLCBEaCwgRWgpID0+IChBaCArIEJoICsgQ2ggKyBEaCArIEVoICsgKChsb3cgLyAyICoqIDMyKSB8IDApKSB8IDA7XG4vLyBwcmV0dGllci1pZ25vcmVcbmV4cG9ydCB7IGFkZCwgYWRkM0gsIGFkZDNMLCBhZGQ0SCwgYWRkNEwsIGFkZDVILCBhZGQ1TCwgZnJvbUJpZywgcm90bEJILCByb3RsQkwsIHJvdGxTSCwgcm90bFNMLCByb3RyMzJILCByb3RyMzJMLCByb3RyQkgsIHJvdHJCTCwgcm90clNILCByb3RyU0wsIHNoclNILCBzaHJTTCwgc3BsaXQsIHRvQmlnIH07XG4vLyBwcmV0dGllci1pZ25vcmVcbmNvbnN0IHU2NCA9IHtcbiAgICBmcm9tQmlnLCBzcGxpdCwgdG9CaWcsXG4gICAgc2hyU0gsIHNoclNMLFxuICAgIHJvdHJTSCwgcm90clNMLCByb3RyQkgsIHJvdHJCTCxcbiAgICByb3RyMzJILCByb3RyMzJMLFxuICAgIHJvdGxTSCwgcm90bFNMLCByb3RsQkgsIHJvdGxCTCxcbiAgICBhZGQsIGFkZDNMLCBhZGQzSCwgYWRkNEwsIGFkZDRILCBhZGQ1SCwgYWRkNUwsXG59O1xuZXhwb3J0IGRlZmF1bHQgdTY0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9X3U2NC5qcy5tYXAiLCIvKipcbiAqIFV0aWxpdGllcyBmb3IgaGV4LCBieXRlcywgQ1NQUk5HLlxuICogQG1vZHVsZVxuICovXG4vKiEgbm9ibGUtaGFzaGVzIC0gTUlUIExpY2Vuc2UgKGMpIDIwMjIgUGF1bCBNaWxsZXIgKHBhdWxtaWxsci5jb20pICovXG4vKiogQ2hlY2tzIGlmIHNvbWV0aGluZyBpcyBVaW50OEFycmF5LiBCZSBjYXJlZnVsOiBub2RlanMgQnVmZmVyIHdpbGwgcmV0dXJuIHRydWUuICovXG5leHBvcnQgZnVuY3Rpb24gaXNCeXRlcyhhKSB7XG4gICAgcmV0dXJuIGEgaW5zdGFuY2VvZiBVaW50OEFycmF5IHx8IChBcnJheUJ1ZmZlci5pc1ZpZXcoYSkgJiYgYS5jb25zdHJ1Y3Rvci5uYW1lID09PSAnVWludDhBcnJheScpO1xufVxuLyoqIEFzc2VydHMgc29tZXRoaW5nIGlzIHBvc2l0aXZlIGludGVnZXIuICovXG5leHBvcnQgZnVuY3Rpb24gYW51bWJlcihuLCB0aXRsZSA9ICcnKSB7XG4gICAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcihuKSB8fCBuIDwgMCkge1xuICAgICAgICBjb25zdCBwcmVmaXggPSB0aXRsZSAmJiBgXCIke3RpdGxlfVwiIGA7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtwcmVmaXh9ZXhwZWN0ZWQgaW50ZWdlciA+PSAwLCBnb3QgJHtufWApO1xuICAgIH1cbn1cbi8qKiBBc3NlcnRzIHNvbWV0aGluZyBpcyBVaW50OEFycmF5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFieXRlcyh2YWx1ZSwgbGVuZ3RoLCB0aXRsZSA9ICcnKSB7XG4gICAgY29uc3QgYnl0ZXMgPSBpc0J5dGVzKHZhbHVlKTtcbiAgICBjb25zdCBsZW4gPSB2YWx1ZT8ubGVuZ3RoO1xuICAgIGNvbnN0IG5lZWRzTGVuID0gbGVuZ3RoICE9PSB1bmRlZmluZWQ7XG4gICAgaWYgKCFieXRlcyB8fCAobmVlZHNMZW4gJiYgbGVuICE9PSBsZW5ndGgpKSB7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IHRpdGxlICYmIGBcIiR7dGl0bGV9XCIgYDtcbiAgICAgICAgY29uc3Qgb2ZMZW4gPSBuZWVkc0xlbiA/IGAgb2YgbGVuZ3RoICR7bGVuZ3RofWAgOiAnJztcbiAgICAgICAgY29uc3QgZ290ID0gYnl0ZXMgPyBgbGVuZ3RoPSR7bGVufWAgOiBgdHlwZT0ke3R5cGVvZiB2YWx1ZX1gO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IocHJlZml4ICsgJ2V4cGVjdGVkIFVpbnQ4QXJyYXknICsgb2ZMZW4gKyAnLCBnb3QgJyArIGdvdCk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn1cbi8qKiBBc3NlcnRzIHNvbWV0aGluZyBpcyBoYXNoICovXG5leHBvcnQgZnVuY3Rpb24gYWhhc2goaCkge1xuICAgIGlmICh0eXBlb2YgaCAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgaC5jcmVhdGUgIT09ICdmdW5jdGlvbicpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSGFzaCBtdXN0IHdyYXBwZWQgYnkgdXRpbHMuY3JlYXRlSGFzaGVyJyk7XG4gICAgYW51bWJlcihoLm91dHB1dExlbik7XG4gICAgYW51bWJlcihoLmJsb2NrTGVuKTtcbn1cbi8qKiBBc3NlcnRzIGEgaGFzaCBpbnN0YW5jZSBoYXMgbm90IGJlZW4gZGVzdHJveWVkIC8gZmluaXNoZWQgKi9cbmV4cG9ydCBmdW5jdGlvbiBhZXhpc3RzKGluc3RhbmNlLCBjaGVja0ZpbmlzaGVkID0gdHJ1ZSkge1xuICAgIGlmIChpbnN0YW5jZS5kZXN0cm95ZWQpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSGFzaCBpbnN0YW5jZSBoYXMgYmVlbiBkZXN0cm95ZWQnKTtcbiAgICBpZiAoY2hlY2tGaW5pc2hlZCAmJiBpbnN0YW5jZS5maW5pc2hlZClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIYXNoI2RpZ2VzdCgpIGhhcyBhbHJlYWR5IGJlZW4gY2FsbGVkJyk7XG59XG4vKiogQXNzZXJ0cyBvdXRwdXQgaXMgcHJvcGVybHktc2l6ZWQgYnl0ZSBhcnJheSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFvdXRwdXQob3V0LCBpbnN0YW5jZSkge1xuICAgIGFieXRlcyhvdXQsIHVuZGVmaW5lZCwgJ2RpZ2VzdEludG8oKSBvdXRwdXQnKTtcbiAgICBjb25zdCBtaW4gPSBpbnN0YW5jZS5vdXRwdXRMZW47XG4gICAgaWYgKG91dC5sZW5ndGggPCBtaW4pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcImRpZ2VzdEludG8oKSBvdXRwdXRcIiBleHBlY3RlZCB0byBiZSBvZiBsZW5ndGggPj0nICsgbWluKTtcbiAgICB9XG59XG4vKiogQ2FzdCB1OCAvIHUxNiAvIHUzMiB0byB1OC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1OChhcnIpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXJyLmJ1ZmZlciwgYXJyLmJ5dGVPZmZzZXQsIGFyci5ieXRlTGVuZ3RoKTtcbn1cbi8qKiBDYXN0IHU4IC8gdTE2IC8gdTMyIHRvIHUzMi4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1MzIoYXJyKSB7XG4gICAgcmV0dXJuIG5ldyBVaW50MzJBcnJheShhcnIuYnVmZmVyLCBhcnIuYnl0ZU9mZnNldCwgTWF0aC5mbG9vcihhcnIuYnl0ZUxlbmd0aCAvIDQpKTtcbn1cbi8qKiBaZXJvaXplIGEgYnl0ZSBhcnJheS4gV2FybmluZzogSlMgcHJvdmlkZXMgbm8gZ3VhcmFudGVlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbiguLi5hcnJheXMpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBhcnJheXNbaV0uZmlsbCgwKTtcbiAgICB9XG59XG4vKiogQ3JlYXRlIERhdGFWaWV3IG9mIGFuIGFycmF5IGZvciBlYXN5IGJ5dGUtbGV2ZWwgbWFuaXB1bGF0aW9uLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVZpZXcoYXJyKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRhVmlldyhhcnIuYnVmZmVyLCBhcnIuYnl0ZU9mZnNldCwgYXJyLmJ5dGVMZW5ndGgpO1xufVxuLyoqIFRoZSByb3RhdGUgcmlnaHQgKGNpcmN1bGFyIHJpZ2h0IHNoaWZ0KSBvcGVyYXRpb24gZm9yIHVpbnQzMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdHIod29yZCwgc2hpZnQpIHtcbiAgICByZXR1cm4gKHdvcmQgPDwgKDMyIC0gc2hpZnQpKSB8ICh3b3JkID4+PiBzaGlmdCk7XG59XG4vKiogVGhlIHJvdGF0ZSBsZWZ0IChjaXJjdWxhciBsZWZ0IHNoaWZ0KSBvcGVyYXRpb24gZm9yIHVpbnQzMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGwod29yZCwgc2hpZnQpIHtcbiAgICByZXR1cm4gKHdvcmQgPDwgc2hpZnQpIHwgKCh3b3JkID4+PiAoMzIgLSBzaGlmdCkpID4+PiAwKTtcbn1cbi8qKiBJcyBjdXJyZW50IHBsYXRmb3JtIGxpdHRsZS1lbmRpYW4/IE1vc3QgYXJlLiBCaWctRW5kaWFuIHBsYXRmb3JtOiBJQk0gKi9cbmV4cG9ydCBjb25zdCBpc0xFID0gLyogQF9fUFVSRV9fICovICgoKSA9PiBuZXcgVWludDhBcnJheShuZXcgVWludDMyQXJyYXkoWzB4MTEyMjMzNDRdKS5idWZmZXIpWzBdID09PSAweDQ0KSgpO1xuLyoqIFRoZSBieXRlIHN3YXAgb3BlcmF0aW9uIGZvciB1aW50MzIgKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlU3dhcCh3b3JkKSB7XG4gICAgcmV0dXJuICgoKHdvcmQgPDwgMjQpICYgMHhmZjAwMDAwMCkgfFxuICAgICAgICAoKHdvcmQgPDwgOCkgJiAweGZmMDAwMCkgfFxuICAgICAgICAoKHdvcmQgPj4+IDgpICYgMHhmZjAwKSB8XG4gICAgICAgICgod29yZCA+Pj4gMjQpICYgMHhmZikpO1xufVxuLyoqIENvbmRpdGlvbmFsbHkgYnl0ZSBzd2FwIGlmIG9uIGEgYmlnLWVuZGlhbiBwbGF0Zm9ybSAqL1xuZXhwb3J0IGNvbnN0IHN3YXA4SWZCRSA9IGlzTEVcbiAgICA/IChuKSA9PiBuXG4gICAgOiAobikgPT4gYnl0ZVN3YXAobik7XG4vKiogSW4gcGxhY2UgYnl0ZSBzd2FwIGZvciBVaW50MzJBcnJheSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVTd2FwMzIoYXJyKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJyW2ldID0gYnl0ZVN3YXAoYXJyW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGFycjtcbn1cbmV4cG9ydCBjb25zdCBzd2FwMzJJZkJFID0gaXNMRVxuICAgID8gKHUpID0+IHVcbiAgICA6IGJ5dGVTd2FwMzI7XG4vLyBCdWlsdC1pbiBoZXggY29udmVyc2lvbiBodHRwczovL2Nhbml1c2UuY29tL21kbi1qYXZhc2NyaXB0X2J1aWx0aW5zX3VpbnQ4YXJyYXlfZnJvbWhleFxuY29uc3QgaGFzSGV4QnVpbHRpbiA9IC8qIEBfX1BVUkVfXyAqLyAoKCkgPT4gXG4vLyBAdHMtaWdub3JlXG50eXBlb2YgVWludDhBcnJheS5mcm9tKFtdKS50b0hleCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgVWludDhBcnJheS5mcm9tSGV4ID09PSAnZnVuY3Rpb24nKSgpO1xuLy8gQXJyYXkgd2hlcmUgaW5kZXggMHhmMCAoMjQwKSBpcyBtYXBwZWQgdG8gc3RyaW5nICdmMCdcbmNvbnN0IGhleGVzID0gLyogQF9fUFVSRV9fICovIEFycmF5LmZyb20oeyBsZW5ndGg6IDI1NiB9LCAoXywgaSkgPT4gaS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSk7XG4vKipcbiAqIENvbnZlcnQgYnl0ZSBhcnJheSB0byBoZXggc3RyaW5nLiBVc2VzIGJ1aWx0LWluIGZ1bmN0aW9uLCB3aGVuIGF2YWlsYWJsZS5cbiAqIEBleGFtcGxlIGJ5dGVzVG9IZXgoVWludDhBcnJheS5mcm9tKFsweGNhLCAweGZlLCAweDAxLCAweDIzXSkpIC8vICdjYWZlMDEyMydcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVzVG9IZXgoYnl0ZXMpIHtcbiAgICBhYnl0ZXMoYnl0ZXMpO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBpZiAoaGFzSGV4QnVpbHRpbilcbiAgICAgICAgcmV0dXJuIGJ5dGVzLnRvSGV4KCk7XG4gICAgLy8gcHJlLWNhY2hpbmcgaW1wcm92ZXMgdGhlIHNwZWVkIDZ4XG4gICAgbGV0IGhleCA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaGV4ICs9IGhleGVzW2J5dGVzW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIGhleDtcbn1cbi8vIFdlIHVzZSBvcHRpbWl6ZWQgdGVjaG5pcXVlIHRvIGNvbnZlcnQgaGV4IHN0cmluZyB0byBieXRlIGFycmF5XG5jb25zdCBhc2NpaXMgPSB7IF8wOiA0OCwgXzk6IDU3LCBBOiA2NSwgRjogNzAsIGE6IDk3LCBmOiAxMDIgfTtcbmZ1bmN0aW9uIGFzY2lpVG9CYXNlMTYoY2gpIHtcbiAgICBpZiAoY2ggPj0gYXNjaWlzLl8wICYmIGNoIDw9IGFzY2lpcy5fOSlcbiAgICAgICAgcmV0dXJuIGNoIC0gYXNjaWlzLl8wOyAvLyAnMicgPT4gNTAtNDhcbiAgICBpZiAoY2ggPj0gYXNjaWlzLkEgJiYgY2ggPD0gYXNjaWlzLkYpXG4gICAgICAgIHJldHVybiBjaCAtIChhc2NpaXMuQSAtIDEwKTsgLy8gJ0InID0+IDY2LSg2NS0xMClcbiAgICBpZiAoY2ggPj0gYXNjaWlzLmEgJiYgY2ggPD0gYXNjaWlzLmYpXG4gICAgICAgIHJldHVybiBjaCAtIChhc2NpaXMuYSAtIDEwKTsgLy8gJ2InID0+IDk4LSg5Ny0xMClcbiAgICByZXR1cm47XG59XG4vKipcbiAqIENvbnZlcnQgaGV4IHN0cmluZyB0byBieXRlIGFycmF5LiBVc2VzIGJ1aWx0LWluIGZ1bmN0aW9uLCB3aGVuIGF2YWlsYWJsZS5cbiAqIEBleGFtcGxlIGhleFRvQnl0ZXMoJ2NhZmUwMTIzJykgLy8gVWludDhBcnJheS5mcm9tKFsweGNhLCAweGZlLCAweDAxLCAweDIzXSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhleFRvQnl0ZXMoaGV4KSB7XG4gICAgaWYgKHR5cGVvZiBoZXggIT09ICdzdHJpbmcnKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2hleCBzdHJpbmcgZXhwZWN0ZWQsIGdvdCAnICsgdHlwZW9mIGhleCk7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGlmIChoYXNIZXhCdWlsdGluKVxuICAgICAgICByZXR1cm4gVWludDhBcnJheS5mcm9tSGV4KGhleCk7XG4gICAgY29uc3QgaGwgPSBoZXgubGVuZ3RoO1xuICAgIGNvbnN0IGFsID0gaGwgLyAyO1xuICAgIGlmIChobCAlIDIpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaGV4IHN0cmluZyBleHBlY3RlZCwgZ290IHVucGFkZGVkIGhleCBvZiBsZW5ndGggJyArIGhsKTtcbiAgICBjb25zdCBhcnJheSA9IG5ldyBVaW50OEFycmF5KGFsKTtcbiAgICBmb3IgKGxldCBhaSA9IDAsIGhpID0gMDsgYWkgPCBhbDsgYWkrKywgaGkgKz0gMikge1xuICAgICAgICBjb25zdCBuMSA9IGFzY2lpVG9CYXNlMTYoaGV4LmNoYXJDb2RlQXQoaGkpKTtcbiAgICAgICAgY29uc3QgbjIgPSBhc2NpaVRvQmFzZTE2KGhleC5jaGFyQ29kZUF0KGhpICsgMSkpO1xuICAgICAgICBpZiAobjEgPT09IHVuZGVmaW5lZCB8fCBuMiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBjaGFyID0gaGV4W2hpXSArIGhleFtoaSArIDFdO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdoZXggc3RyaW5nIGV4cGVjdGVkLCBnb3Qgbm9uLWhleCBjaGFyYWN0ZXIgXCInICsgY2hhciArICdcIiBhdCBpbmRleCAnICsgaGkpO1xuICAgICAgICB9XG4gICAgICAgIGFycmF5W2FpXSA9IG4xICogMTYgKyBuMjsgLy8gbXVsdGlwbHkgZmlyc3Qgb2N0ZXQsIGUuZy4gJ2EzJyA9PiAxMCoxNiszID0+IDE2MCArIDMgPT4gMTYzXG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbn1cbi8qKlxuICogVGhlcmUgaXMgbm8gc2V0SW1tZWRpYXRlIGluIGJyb3dzZXIgYW5kIHNldFRpbWVvdXQgaXMgc2xvdy5cbiAqIENhbGwgb2YgYXN5bmMgZm4gd2lsbCByZXR1cm4gUHJvbWlzZSwgd2hpY2ggd2lsbCBiZSBmdWxsZmlsZWQgb25seSBvblxuICogbmV4dCBzY2hlZHVsZXIgcXVldWUgcHJvY2Vzc2luZyBzdGVwIGFuZCB0aGlzIGlzIGV4YWN0bHkgd2hhdCB3ZSBuZWVkLlxuICovXG5leHBvcnQgY29uc3QgbmV4dFRpY2sgPSBhc3luYyAoKSA9PiB7IH07XG4vKiogUmV0dXJucyBjb250cm9sIHRvIHRocmVhZCBlYWNoICd0aWNrJyBtcyB0byBhdm9pZCBibG9ja2luZy4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhc3luY0xvb3AoaXRlcnMsIHRpY2ssIGNiKSB7XG4gICAgbGV0IHRzID0gRGF0ZS5ub3coKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZXJzOyBpKyspIHtcbiAgICAgICAgY2IoaSk7XG4gICAgICAgIC8vIERhdGUubm93KCkgaXMgbm90IG1vbm90b25pYywgc28gaW4gY2FzZSBpZiBjbG9jayBnb2VzIGJhY2t3YXJkcyB3ZSByZXR1cm4gcmV0dXJuIGNvbnRyb2wgdG9vXG4gICAgICAgIGNvbnN0IGRpZmYgPSBEYXRlLm5vdygpIC0gdHM7XG4gICAgICAgIGlmIChkaWZmID49IDAgJiYgZGlmZiA8IHRpY2spXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgYXdhaXQgbmV4dFRpY2soKTtcbiAgICAgICAgdHMgKz0gZGlmZjtcbiAgICB9XG59XG4vKipcbiAqIENvbnZlcnRzIHN0cmluZyB0byBieXRlcyB1c2luZyBVVEY4IGVuY29kaW5nLlxuICogQnVpbHQtaW4gZG9lc24ndCB2YWxpZGF0ZSBpbnB1dCB0byBiZSBzdHJpbmc6IHdlIGRvIHRoZSBjaGVjay5cbiAqIEBleGFtcGxlIHV0ZjhUb0J5dGVzKCdhYmMnKSAvLyBVaW50OEFycmF5LmZyb20oWzk3LCA5OCwgOTldKVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXRmOFRvQnl0ZXMoc3RyKSB7XG4gICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0cmluZyBleHBlY3RlZCcpO1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc3RyKSk7IC8vIGh0dHBzOi8vYnVnemlsLmxhLzE2ODE4MDlcbn1cbi8qKlxuICogSGVscGVyIGZvciBLREZzOiBjb25zdW1lcyB1aW50OGFycmF5IG9yIHN0cmluZy5cbiAqIFdoZW4gc3RyaW5nIGlzIHBhc3NlZCwgZG9lcyB1dGY4IGRlY29kaW5nLCB1c2luZyBUZXh0RGVjb2Rlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGtkZklucHV0VG9CeXRlcyhkYXRhLCBlcnJvclRpdGxlID0gJycpIHtcbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKVxuICAgICAgICByZXR1cm4gdXRmOFRvQnl0ZXMoZGF0YSk7XG4gICAgcmV0dXJuIGFieXRlcyhkYXRhLCB1bmRlZmluZWQsIGVycm9yVGl0bGUpO1xufVxuLyoqIENvcGllcyBzZXZlcmFsIFVpbnQ4QXJyYXlzIGludG8gb25lLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmNhdEJ5dGVzKC4uLmFycmF5cykge1xuICAgIGxldCBzdW0gPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGEgPSBhcnJheXNbaV07XG4gICAgICAgIGFieXRlcyhhKTtcbiAgICAgICAgc3VtICs9IGEubGVuZ3RoO1xuICAgIH1cbiAgICBjb25zdCByZXMgPSBuZXcgVWludDhBcnJheShzdW0pO1xuICAgIGZvciAobGV0IGkgPSAwLCBwYWQgPSAwOyBpIDwgYXJyYXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGEgPSBhcnJheXNbaV07XG4gICAgICAgIHJlcy5zZXQoYSwgcGFkKTtcbiAgICAgICAgcGFkICs9IGEubGVuZ3RoO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuLyoqIE1lcmdlcyBkZWZhdWx0IG9wdGlvbnMgYW5kIHBhc3NlZCBvcHRpb25zLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrT3B0cyhkZWZhdWx0cywgb3B0cykge1xuICAgIGlmIChvcHRzICE9PSB1bmRlZmluZWQgJiYge30udG9TdHJpbmcuY2FsbChvcHRzKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignb3B0aW9ucyBtdXN0IGJlIG9iamVjdCBvciB1bmRlZmluZWQnKTtcbiAgICBjb25zdCBtZXJnZWQgPSBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCBvcHRzKTtcbiAgICByZXR1cm4gbWVyZ2VkO1xufVxuLyoqIENyZWF0ZXMgZnVuY3Rpb24gd2l0aCBvdXRwdXRMZW4sIGJsb2NrTGVuLCBjcmVhdGUgcHJvcGVydGllcyBmcm9tIGEgY2xhc3MgY29uc3RydWN0b3IuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSGFzaGVyKGhhc2hDb25zLCBpbmZvID0ge30pIHtcbiAgICBjb25zdCBoYXNoQyA9IChtc2csIG9wdHMpID0+IGhhc2hDb25zKG9wdHMpLnVwZGF0ZShtc2cpLmRpZ2VzdCgpO1xuICAgIGNvbnN0IHRtcCA9IGhhc2hDb25zKHVuZGVmaW5lZCk7XG4gICAgaGFzaEMub3V0cHV0TGVuID0gdG1wLm91dHB1dExlbjtcbiAgICBoYXNoQy5ibG9ja0xlbiA9IHRtcC5ibG9ja0xlbjtcbiAgICBoYXNoQy5jcmVhdGUgPSAob3B0cykgPT4gaGFzaENvbnMob3B0cyk7XG4gICAgT2JqZWN0LmFzc2lnbihoYXNoQywgaW5mbyk7XG4gICAgcmV0dXJuIE9iamVjdC5mcmVlemUoaGFzaEMpO1xufVxuLyoqIENyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSBQUk5HLiBVc2VzIGludGVybmFsIE9TLWxldmVsIGBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiByYW5kb21CeXRlcyhieXRlc0xlbmd0aCA9IDMyKSB7XG4gICAgY29uc3QgY3IgPSB0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcgPyBnbG9iYWxUaGlzLmNyeXB0byA6IG51bGw7XG4gICAgaWYgKHR5cGVvZiBjcj8uZ2V0UmFuZG9tVmFsdWVzICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyeXB0by5nZXRSYW5kb21WYWx1ZXMgbXVzdCBiZSBkZWZpbmVkJyk7XG4gICAgcmV0dXJuIGNyLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShieXRlc0xlbmd0aCkpO1xufVxuLyoqIENyZWF0ZXMgT0lEIG9wdHMgZm9yIE5JU1QgaGFzaGVzLCB3aXRoIHByZWZpeCAwNiAwOSA2MCA4NiA0OCAwMSA2NSAwMyAwNCAwMi4gKi9cbmV4cG9ydCBjb25zdCBvaWROaXN0ID0gKHN1ZmZpeCkgPT4gKHtcbiAgICBvaWQ6IFVpbnQ4QXJyYXkuZnJvbShbMHgwNiwgMHgwOSwgMHg2MCwgMHg4NiwgMHg0OCwgMHgwMSwgMHg2NSwgMHgwMywgMHgwNCwgMHgwMiwgc3VmZml4XSksXG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXV0aWxzLmpzLm1hcCIsIi8qKlxuICogSW50ZXJuYWwgaGVscGVycyBmb3IgYmxha2UgaGFzaC5cbiAqIEBtb2R1bGVcbiAqL1xuaW1wb3J0IHsgcm90ciB9IGZyb20gXCIuL3V0aWxzLmpzXCI7XG4vKipcbiAqIEludGVybmFsIGJsYWtlIHZhcmlhYmxlLlxuICogRm9yIEJMQUtFMmIsIHRoZSB0d28gZXh0cmEgcGVybXV0YXRpb25zIGZvciByb3VuZHMgMTAgYW5kIDExIGFyZSBTSUdNQVsxMC4uMTFdID0gU0lHTUFbMC4uMV0uXG4gKi9cbi8vIHByZXR0aWVyLWlnbm9yZVxuZXhwb3J0IGNvbnN0IEJTSUdNQSA9IC8qIEBfX1BVUkVfXyAqLyBVaW50OEFycmF5LmZyb20oW1xuICAgIDAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMSwgMTIsIDEzLCAxNCwgMTUsXG4gICAgMTQsIDEwLCA0LCA4LCA5LCAxNSwgMTMsIDYsIDEsIDEyLCAwLCAyLCAxMSwgNywgNSwgMyxcbiAgICAxMSwgOCwgMTIsIDAsIDUsIDIsIDE1LCAxMywgMTAsIDE0LCAzLCA2LCA3LCAxLCA5LCA0LFxuICAgIDcsIDksIDMsIDEsIDEzLCAxMiwgMTEsIDE0LCAyLCA2LCA1LCAxMCwgNCwgMCwgMTUsIDgsXG4gICAgOSwgMCwgNSwgNywgMiwgNCwgMTAsIDE1LCAxNCwgMSwgMTEsIDEyLCA2LCA4LCAzLCAxMyxcbiAgICAyLCAxMiwgNiwgMTAsIDAsIDExLCA4LCAzLCA0LCAxMywgNywgNSwgMTUsIDE0LCAxLCA5LFxuICAgIDEyLCA1LCAxLCAxNSwgMTQsIDEzLCA0LCAxMCwgMCwgNywgNiwgMywgOSwgMiwgOCwgMTEsXG4gICAgMTMsIDExLCA3LCAxNCwgMTIsIDEsIDMsIDksIDUsIDAsIDE1LCA0LCA4LCA2LCAyLCAxMCxcbiAgICA2LCAxNSwgMTQsIDksIDExLCAzLCAwLCA4LCAxMiwgMiwgMTMsIDcsIDEsIDQsIDEwLCA1LFxuICAgIDEwLCAyLCA4LCA0LCA3LCA2LCAxLCA1LCAxNSwgMTEsIDksIDE0LCAzLCAxMiwgMTMsIDAsXG4gICAgMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0LCAxNSxcbiAgICAxNCwgMTAsIDQsIDgsIDksIDE1LCAxMywgNiwgMSwgMTIsIDAsIDIsIDExLCA3LCA1LCAzLFxuICAgIC8vIEJsYWtlMSwgdW51c2VkIGluIG90aGVyc1xuICAgIDExLCA4LCAxMiwgMCwgNSwgMiwgMTUsIDEzLCAxMCwgMTQsIDMsIDYsIDcsIDEsIDksIDQsXG4gICAgNywgOSwgMywgMSwgMTMsIDEyLCAxMSwgMTQsIDIsIDYsIDUsIDEwLCA0LCAwLCAxNSwgOCxcbiAgICA5LCAwLCA1LCA3LCAyLCA0LCAxMCwgMTUsIDE0LCAxLCAxMSwgMTIsIDYsIDgsIDMsIDEzLFxuICAgIDIsIDEyLCA2LCAxMCwgMCwgMTEsIDgsIDMsIDQsIDEzLCA3LCA1LCAxNSwgMTQsIDEsIDksXG5dKTtcbi8vIE1peGluZyBmdW5jdGlvbiBHIHNwbGl0dGVkIGluIHR3byBoYWxmc1xuZXhwb3J0IGZ1bmN0aW9uIEcxcyhhLCBiLCBjLCBkLCB4KSB7XG4gICAgYSA9IChhICsgYiArIHgpIHwgMDtcbiAgICBkID0gcm90cihkIF4gYSwgMTYpO1xuICAgIGMgPSAoYyArIGQpIHwgMDtcbiAgICBiID0gcm90cihiIF4gYywgMTIpO1xuICAgIHJldHVybiB7IGEsIGIsIGMsIGQgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBHMnMoYSwgYiwgYywgZCwgeCkge1xuICAgIGEgPSAoYSArIGIgKyB4KSB8IDA7XG4gICAgZCA9IHJvdHIoZCBeIGEsIDgpO1xuICAgIGMgPSAoYyArIGQpIHwgMDtcbiAgICBiID0gcm90cihiIF4gYywgNyk7XG4gICAgcmV0dXJuIHsgYSwgYiwgYywgZCB9O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9X2JsYWtlLmpzLm1hcCIsIi8qKlxuICogYmxha2UyYiAoNjQtYml0KSAmIGJsYWtlMnMgKDggdG8gMzItYml0KSBoYXNoIGZ1bmN0aW9ucy5cbiAqIGIgY291bGQgaGF2ZSBiZWVuIGZhc3RlciwgYnV0IHRoZXJlIGlzIG5vIGZhc3QgdTY0IGluIGpzLCBzbyBzIGlzIDEuNXggZmFzdGVyLlxuICogQG1vZHVsZVxuICovXG5pbXBvcnQgeyBCU0lHTUEsIEcxcywgRzJzIH0gZnJvbSBcIi4vX2JsYWtlLmpzXCI7XG5pbXBvcnQgeyBTSEEyNTZfSVYgfSBmcm9tIFwiLi9fbWQuanNcIjtcbmltcG9ydCAqIGFzIHU2NCBmcm9tIFwiLi9fdTY0LmpzXCI7XG4vLyBwcmV0dGllci1pZ25vcmVcbmltcG9ydCB7IGFieXRlcywgYWV4aXN0cywgYW51bWJlciwgYW91dHB1dCwgY2xlYW4sIGNyZWF0ZUhhc2hlciwgc3dhcDMySWZCRSwgc3dhcDhJZkJFLCB1MzIgfSBmcm9tIFwiLi91dGlscy5qc1wiO1xuLy8gU2FtZSBhcyBTSEE1MTJfSVYsIGJ1dCBzd2FwcGVkIGVuZGlhbm5lc3M6IExFIGluc3RlYWQgb2YgQkUuIGl2WzFdIGlzIGl2WzBdLCBldGMuXG5jb25zdCBCMkJfSVYgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gICAgMHhmM2JjYzkwOCwgMHg2YTA5ZTY2NywgMHg4NGNhYTczYiwgMHhiYjY3YWU4NSwgMHhmZTk0ZjgyYiwgMHgzYzZlZjM3MiwgMHg1ZjFkMzZmMSwgMHhhNTRmZjUzYSxcbiAgICAweGFkZTY4MmQxLCAweDUxMGU1MjdmLCAweDJiM2U2YzFmLCAweDliMDU2ODhjLCAweGZiNDFiZDZiLCAweDFmODNkOWFiLCAweDEzN2UyMTc5LCAweDViZTBjZDE5LFxuXSk7XG4vLyBUZW1wb3JhcnkgYnVmZmVyXG5jb25zdCBCQlVGID0gLyogQF9fUFVSRV9fICovIG5ldyBVaW50MzJBcnJheSgzMik7XG4vLyBNaXhpbmcgZnVuY3Rpb24gRyBzcGxpdHRlZCBpbiB0d28gaGFsZnNcbmZ1bmN0aW9uIEcxYihhLCBiLCBjLCBkLCBtc2csIHgpIHtcbiAgICAvLyBOT1RFOiBWIGlzIExFIGhlcmVcbiAgICBjb25zdCBYbCA9IG1zZ1t4XSwgWGggPSBtc2dbeCArIDFdOyAvLyBwcmV0dGllci1pZ25vcmVcbiAgICBsZXQgQWwgPSBCQlVGWzIgKiBhXSwgQWggPSBCQlVGWzIgKiBhICsgMV07IC8vIHByZXR0aWVyLWlnbm9yZVxuICAgIGxldCBCbCA9IEJCVUZbMiAqIGJdLCBCaCA9IEJCVUZbMiAqIGIgKyAxXTsgLy8gcHJldHRpZXItaWdub3JlXG4gICAgbGV0IENsID0gQkJVRlsyICogY10sIENoID0gQkJVRlsyICogYyArIDFdOyAvLyBwcmV0dGllci1pZ25vcmVcbiAgICBsZXQgRGwgPSBCQlVGWzIgKiBkXSwgRGggPSBCQlVGWzIgKiBkICsgMV07IC8vIHByZXR0aWVyLWlnbm9yZVxuICAgIC8vIHZbYV0gPSAodlthXSArIHZbYl0gKyB4KSB8IDA7XG4gICAgbGV0IGxsID0gdTY0LmFkZDNMKEFsLCBCbCwgWGwpO1xuICAgIEFoID0gdTY0LmFkZDNIKGxsLCBBaCwgQmgsIFhoKTtcbiAgICBBbCA9IGxsIHwgMDtcbiAgICAvLyB2W2RdID0gcm90cih2W2RdIF4gdlthXSwgMzIpXG4gICAgKHsgRGgsIERsIH0gPSB7IERoOiBEaCBeIEFoLCBEbDogRGwgXiBBbCB9KTtcbiAgICAoeyBEaCwgRGwgfSA9IHsgRGg6IHU2NC5yb3RyMzJIKERoLCBEbCksIERsOiB1NjQucm90cjMyTChEaCwgRGwpIH0pO1xuICAgIC8vIHZbY10gPSAodltjXSArIHZbZF0pIHwgMDtcbiAgICAoeyBoOiBDaCwgbDogQ2wgfSA9IHU2NC5hZGQoQ2gsIENsLCBEaCwgRGwpKTtcbiAgICAvLyB2W2JdID0gcm90cih2W2JdIF4gdltjXSwgMjQpXG4gICAgKHsgQmgsIEJsIH0gPSB7IEJoOiBCaCBeIENoLCBCbDogQmwgXiBDbCB9KTtcbiAgICAoeyBCaCwgQmwgfSA9IHsgQmg6IHU2NC5yb3RyU0goQmgsIEJsLCAyNCksIEJsOiB1NjQucm90clNMKEJoLCBCbCwgMjQpIH0pO1xuICAgICgoQkJVRlsyICogYV0gPSBBbCksIChCQlVGWzIgKiBhICsgMV0gPSBBaCkpO1xuICAgICgoQkJVRlsyICogYl0gPSBCbCksIChCQlVGWzIgKiBiICsgMV0gPSBCaCkpO1xuICAgICgoQkJVRlsyICogY10gPSBDbCksIChCQlVGWzIgKiBjICsgMV0gPSBDaCkpO1xuICAgICgoQkJVRlsyICogZF0gPSBEbCksIChCQlVGWzIgKiBkICsgMV0gPSBEaCkpO1xufVxuZnVuY3Rpb24gRzJiKGEsIGIsIGMsIGQsIG1zZywgeCkge1xuICAgIC8vIE5PVEU6IFYgaXMgTEUgaGVyZVxuICAgIGNvbnN0IFhsID0gbXNnW3hdLCBYaCA9IG1zZ1t4ICsgMV07IC8vIHByZXR0aWVyLWlnbm9yZVxuICAgIGxldCBBbCA9IEJCVUZbMiAqIGFdLCBBaCA9IEJCVUZbMiAqIGEgKyAxXTsgLy8gcHJldHRpZXItaWdub3JlXG4gICAgbGV0IEJsID0gQkJVRlsyICogYl0sIEJoID0gQkJVRlsyICogYiArIDFdOyAvLyBwcmV0dGllci1pZ25vcmVcbiAgICBsZXQgQ2wgPSBCQlVGWzIgKiBjXSwgQ2ggPSBCQlVGWzIgKiBjICsgMV07IC8vIHByZXR0aWVyLWlnbm9yZVxuICAgIGxldCBEbCA9IEJCVUZbMiAqIGRdLCBEaCA9IEJCVUZbMiAqIGQgKyAxXTsgLy8gcHJldHRpZXItaWdub3JlXG4gICAgLy8gdlthXSA9ICh2W2FdICsgdltiXSArIHgpIHwgMDtcbiAgICBsZXQgbGwgPSB1NjQuYWRkM0woQWwsIEJsLCBYbCk7XG4gICAgQWggPSB1NjQuYWRkM0gobGwsIEFoLCBCaCwgWGgpO1xuICAgIEFsID0gbGwgfCAwO1xuICAgIC8vIHZbZF0gPSByb3RyKHZbZF0gXiB2W2FdLCAxNilcbiAgICAoeyBEaCwgRGwgfSA9IHsgRGg6IERoIF4gQWgsIERsOiBEbCBeIEFsIH0pO1xuICAgICh7IERoLCBEbCB9ID0geyBEaDogdTY0LnJvdHJTSChEaCwgRGwsIDE2KSwgRGw6IHU2NC5yb3RyU0woRGgsIERsLCAxNikgfSk7XG4gICAgLy8gdltjXSA9ICh2W2NdICsgdltkXSkgfCAwO1xuICAgICh7IGg6IENoLCBsOiBDbCB9ID0gdTY0LmFkZChDaCwgQ2wsIERoLCBEbCkpO1xuICAgIC8vIHZbYl0gPSByb3RyKHZbYl0gXiB2W2NdLCA2MylcbiAgICAoeyBCaCwgQmwgfSA9IHsgQmg6IEJoIF4gQ2gsIEJsOiBCbCBeIENsIH0pO1xuICAgICh7IEJoLCBCbCB9ID0geyBCaDogdTY0LnJvdHJCSChCaCwgQmwsIDYzKSwgQmw6IHU2NC5yb3RyQkwoQmgsIEJsLCA2MykgfSk7XG4gICAgKChCQlVGWzIgKiBhXSA9IEFsKSwgKEJCVUZbMiAqIGEgKyAxXSA9IEFoKSk7XG4gICAgKChCQlVGWzIgKiBiXSA9IEJsKSwgKEJCVUZbMiAqIGIgKyAxXSA9IEJoKSk7XG4gICAgKChCQlVGWzIgKiBjXSA9IENsKSwgKEJCVUZbMiAqIGMgKyAxXSA9IENoKSk7XG4gICAgKChCQlVGWzIgKiBkXSA9IERsKSwgKEJCVUZbMiAqIGQgKyAxXSA9IERoKSk7XG59XG5mdW5jdGlvbiBjaGVja0JsYWtlMk9wdHMob3V0cHV0TGVuLCBvcHRzID0ge30sIGtleUxlbiwgc2FsdExlbiwgcGVyc0xlbikge1xuICAgIGFudW1iZXIoa2V5TGVuKTtcbiAgICBpZiAob3V0cHV0TGVuIDwgMCB8fCBvdXRwdXRMZW4gPiBrZXlMZW4pXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignb3V0cHV0TGVuIGJpZ2dlciB0aGFuIGtleUxlbicpO1xuICAgIGNvbnN0IHsga2V5LCBzYWx0LCBwZXJzb25hbGl6YXRpb24gfSA9IG9wdHM7XG4gICAgaWYgKGtleSAhPT0gdW5kZWZpbmVkICYmIChrZXkubGVuZ3RoIDwgMSB8fCBrZXkubGVuZ3RoID4ga2V5TGVuKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcImtleVwiIGV4cGVjdGVkIHRvIGJlIHVuZGVmaW5lZCBvciBvZiBsZW5ndGg9MS4uJyArIGtleUxlbik7XG4gICAgaWYgKHNhbHQgIT09IHVuZGVmaW5lZClcbiAgICAgICAgYWJ5dGVzKHNhbHQsIHNhbHRMZW4sICdzYWx0Jyk7XG4gICAgaWYgKHBlcnNvbmFsaXphdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgICBhYnl0ZXMocGVyc29uYWxpemF0aW9uLCBwZXJzTGVuLCAncGVyc29uYWxpemF0aW9uJyk7XG59XG4vKiogSW50ZXJuYWwgYmFzZSBjbGFzcyBmb3IgQkxBS0UyLiAqL1xuZXhwb3J0IGNsYXNzIF9CTEFLRTIge1xuICAgIGJ1ZmZlcjtcbiAgICBidWZmZXIzMjtcbiAgICBmaW5pc2hlZCA9IGZhbHNlO1xuICAgIGRlc3Ryb3llZCA9IGZhbHNlO1xuICAgIGxlbmd0aCA9IDA7XG4gICAgcG9zID0gMDtcbiAgICBibG9ja0xlbjtcbiAgICBvdXRwdXRMZW47XG4gICAgY29uc3RydWN0b3IoYmxvY2tMZW4sIG91dHB1dExlbikge1xuICAgICAgICBhbnVtYmVyKGJsb2NrTGVuKTtcbiAgICAgICAgYW51bWJlcihvdXRwdXRMZW4pO1xuICAgICAgICB0aGlzLmJsb2NrTGVuID0gYmxvY2tMZW47XG4gICAgICAgIHRoaXMub3V0cHV0TGVuID0gb3V0cHV0TGVuO1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGJsb2NrTGVuKTtcbiAgICAgICAgdGhpcy5idWZmZXIzMiA9IHUzMih0aGlzLmJ1ZmZlcik7XG4gICAgfVxuICAgIHVwZGF0ZShkYXRhKSB7XG4gICAgICAgIGFleGlzdHModGhpcyk7XG4gICAgICAgIGFieXRlcyhkYXRhKTtcbiAgICAgICAgLy8gTWFpbiBkaWZmZXJlbmNlIHdpdGggb3RoZXIgaGFzaGVzOiB0aGVyZSBpcyBmbGFnIGZvciBsYXN0IGJsb2NrLFxuICAgICAgICAvLyBzbyB3ZSBjYW5ub3QgcHJvY2VzcyBjdXJyZW50IGJsb2NrIGJlZm9yZSB3ZSBrbm93IHRoYXQgdGhlcmVcbiAgICAgICAgLy8gaXMgdGhlIG5leHQgb25lLiBUaGlzIHNpZ25pZmljYW50bHkgY29tcGxpY2F0ZXMgbG9naWMgYW5kIHJlZHVjZXMgYWJpbGl0eVxuICAgICAgICAvLyB0byBkbyB6ZXJvLWNvcHkgcHJvY2Vzc2luZ1xuICAgICAgICBjb25zdCB7IGJsb2NrTGVuLCBidWZmZXIsIGJ1ZmZlcjMyIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCBsZW4gPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gZGF0YS5ieXRlT2Zmc2V0O1xuICAgICAgICBjb25zdCBidWYgPSBkYXRhLmJ1ZmZlcjtcbiAgICAgICAgZm9yIChsZXQgcG9zID0gMDsgcG9zIDwgbGVuOykge1xuICAgICAgICAgICAgLy8gSWYgYnVmZmVyIGlzIGZ1bGwgYW5kIHdlIHN0aWxsIGhhdmUgaW5wdXQgKGRvbid0IHByb2Nlc3MgbGFzdCBibG9jaywgc2FtZSBhcyBibGFrZTJzKVxuICAgICAgICAgICAgaWYgKHRoaXMucG9zID09PSBibG9ja0xlbikge1xuICAgICAgICAgICAgICAgIHN3YXAzMklmQkUoYnVmZmVyMzIpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29tcHJlc3MoYnVmZmVyMzIsIDAsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBzd2FwMzJJZkJFKGJ1ZmZlcjMyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBvcyA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0YWtlID0gTWF0aC5taW4oYmxvY2tMZW4gLSB0aGlzLnBvcywgbGVuIC0gcG9zKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGFPZmZzZXQgPSBvZmZzZXQgKyBwb3M7XG4gICAgICAgICAgICAvLyBmdWxsIGJsb2NrICYmIGFsaWduZWQgdG8gNCBieXRlcyAmJiBub3QgbGFzdCBpbiBpbnB1dFxuICAgICAgICAgICAgaWYgKHRha2UgPT09IGJsb2NrTGVuICYmICEoZGF0YU9mZnNldCAlIDQpICYmIHBvcyArIHRha2UgPCBsZW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhMzIgPSBuZXcgVWludDMyQXJyYXkoYnVmLCBkYXRhT2Zmc2V0LCBNYXRoLmZsb29yKChsZW4gLSBwb3MpIC8gNCkpO1xuICAgICAgICAgICAgICAgIHN3YXAzMklmQkUoZGF0YTMyKTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwb3MzMiA9IDA7IHBvcyArIGJsb2NrTGVuIDwgbGVuOyBwb3MzMiArPSBidWZmZXIzMi5sZW5ndGgsIHBvcyArPSBibG9ja0xlbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxlbmd0aCArPSBibG9ja0xlbjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wcmVzcyhkYXRhMzIsIHBvczMyLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN3YXAzMklmQkUoZGF0YTMyKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ1ZmZlci5zZXQoZGF0YS5zdWJhcnJheShwb3MsIHBvcyArIHRha2UpLCB0aGlzLnBvcyk7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSB0YWtlO1xuICAgICAgICAgICAgdGhpcy5sZW5ndGggKz0gdGFrZTtcbiAgICAgICAgICAgIHBvcyArPSB0YWtlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBkaWdlc3RJbnRvKG91dCkge1xuICAgICAgICBhZXhpc3RzKHRoaXMpO1xuICAgICAgICBhb3V0cHV0KG91dCwgdGhpcyk7XG4gICAgICAgIGNvbnN0IHsgcG9zLCBidWZmZXIzMiB9ID0gdGhpcztcbiAgICAgICAgdGhpcy5maW5pc2hlZCA9IHRydWU7XG4gICAgICAgIC8vIFBhZGRpbmdcbiAgICAgICAgY2xlYW4odGhpcy5idWZmZXIuc3ViYXJyYXkocG9zKSk7XG4gICAgICAgIHN3YXAzMklmQkUoYnVmZmVyMzIpO1xuICAgICAgICB0aGlzLmNvbXByZXNzKGJ1ZmZlcjMyLCAwLCB0cnVlKTtcbiAgICAgICAgc3dhcDMySWZCRShidWZmZXIzMik7XG4gICAgICAgIGNvbnN0IG91dDMyID0gdTMyKG91dCk7XG4gICAgICAgIHRoaXMuZ2V0KCkuZm9yRWFjaCgodiwgaSkgPT4gKG91dDMyW2ldID0gc3dhcDhJZkJFKHYpKSk7XG4gICAgfVxuICAgIGRpZ2VzdCgpIHtcbiAgICAgICAgY29uc3QgeyBidWZmZXIsIG91dHB1dExlbiB9ID0gdGhpcztcbiAgICAgICAgdGhpcy5kaWdlc3RJbnRvKGJ1ZmZlcik7XG4gICAgICAgIGNvbnN0IHJlcyA9IGJ1ZmZlci5zbGljZSgwLCBvdXRwdXRMZW4pO1xuICAgICAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgX2Nsb25lSW50byh0bykge1xuICAgICAgICBjb25zdCB7IGJ1ZmZlciwgbGVuZ3RoLCBmaW5pc2hlZCwgZGVzdHJveWVkLCBvdXRwdXRMZW4sIHBvcyB9ID0gdGhpcztcbiAgICAgICAgdG8gfHw9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKHsgZGtMZW46IG91dHB1dExlbiB9KTtcbiAgICAgICAgdG8uc2V0KC4uLnRoaXMuZ2V0KCkpO1xuICAgICAgICB0by5idWZmZXIuc2V0KGJ1ZmZlcik7XG4gICAgICAgIHRvLmRlc3Ryb3llZCA9IGRlc3Ryb3llZDtcbiAgICAgICAgdG8uZmluaXNoZWQgPSBmaW5pc2hlZDtcbiAgICAgICAgdG8ubGVuZ3RoID0gbGVuZ3RoO1xuICAgICAgICB0by5wb3MgPSBwb3M7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdG8ub3V0cHV0TGVuID0gb3V0cHV0TGVuO1xuICAgICAgICByZXR1cm4gdG87XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2xvbmVJbnRvKCk7XG4gICAgfVxufVxuLyoqIEludGVybmFsIGJsYWtlMmIgaGFzaCBjbGFzcy4gKi9cbmV4cG9ydCBjbGFzcyBfQkxBS0UyYiBleHRlbmRzIF9CTEFLRTIge1xuICAgIC8vIFNhbWUgYXMgU0hBLTUxMiwgYnV0IExFXG4gICAgdjBsID0gQjJCX0lWWzBdIHwgMDtcbiAgICB2MGggPSBCMkJfSVZbMV0gfCAwO1xuICAgIHYxbCA9IEIyQl9JVlsyXSB8IDA7XG4gICAgdjFoID0gQjJCX0lWWzNdIHwgMDtcbiAgICB2MmwgPSBCMkJfSVZbNF0gfCAwO1xuICAgIHYyaCA9IEIyQl9JVls1XSB8IDA7XG4gICAgdjNsID0gQjJCX0lWWzZdIHwgMDtcbiAgICB2M2ggPSBCMkJfSVZbN10gfCAwO1xuICAgIHY0bCA9IEIyQl9JVls4XSB8IDA7XG4gICAgdjRoID0gQjJCX0lWWzldIHwgMDtcbiAgICB2NWwgPSBCMkJfSVZbMTBdIHwgMDtcbiAgICB2NWggPSBCMkJfSVZbMTFdIHwgMDtcbiAgICB2NmwgPSBCMkJfSVZbMTJdIHwgMDtcbiAgICB2NmggPSBCMkJfSVZbMTNdIHwgMDtcbiAgICB2N2wgPSBCMkJfSVZbMTRdIHwgMDtcbiAgICB2N2ggPSBCMkJfSVZbMTVdIHwgMDtcbiAgICBjb25zdHJ1Y3RvcihvcHRzID0ge30pIHtcbiAgICAgICAgY29uc3Qgb2xlbiA9IG9wdHMuZGtMZW4gPT09IHVuZGVmaW5lZCA/IDY0IDogb3B0cy5ka0xlbjtcbiAgICAgICAgc3VwZXIoMTI4LCBvbGVuKTtcbiAgICAgICAgY2hlY2tCbGFrZTJPcHRzKG9sZW4sIG9wdHMsIDY0LCAxNiwgMTYpO1xuICAgICAgICBsZXQgeyBrZXksIHBlcnNvbmFsaXphdGlvbiwgc2FsdCB9ID0gb3B0cztcbiAgICAgICAgbGV0IGtleUxlbmd0aCA9IDA7XG4gICAgICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgYWJ5dGVzKGtleSwgdW5kZWZpbmVkLCAna2V5Jyk7XG4gICAgICAgICAgICBrZXlMZW5ndGggPSBrZXkubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudjBsIF49IHRoaXMub3V0cHV0TGVuIHwgKGtleUxlbmd0aCA8PCA4KSB8ICgweDAxIDw8IDE2KSB8ICgweDAxIDw8IDI0KTtcbiAgICAgICAgaWYgKHNhbHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgYWJ5dGVzKHNhbHQsIHVuZGVmaW5lZCwgJ3NhbHQnKTtcbiAgICAgICAgICAgIGNvbnN0IHNsdCA9IHUzMihzYWx0KTtcbiAgICAgICAgICAgIHRoaXMudjRsIF49IHN3YXA4SWZCRShzbHRbMF0pO1xuICAgICAgICAgICAgdGhpcy52NGggXj0gc3dhcDhJZkJFKHNsdFsxXSk7XG4gICAgICAgICAgICB0aGlzLnY1bCBePSBzd2FwOElmQkUoc2x0WzJdKTtcbiAgICAgICAgICAgIHRoaXMudjVoIF49IHN3YXA4SWZCRShzbHRbM10pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwZXJzb25hbGl6YXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgYWJ5dGVzKHBlcnNvbmFsaXphdGlvbiwgdW5kZWZpbmVkLCAncGVyc29uYWxpemF0aW9uJyk7XG4gICAgICAgICAgICBjb25zdCBwZXJzID0gdTMyKHBlcnNvbmFsaXphdGlvbik7XG4gICAgICAgICAgICB0aGlzLnY2bCBePSBzd2FwOElmQkUocGVyc1swXSk7XG4gICAgICAgICAgICB0aGlzLnY2aCBePSBzd2FwOElmQkUocGVyc1sxXSk7XG4gICAgICAgICAgICB0aGlzLnY3bCBePSBzd2FwOElmQkUocGVyc1syXSk7XG4gICAgICAgICAgICB0aGlzLnY3aCBePSBzd2FwOElmQkUocGVyc1szXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBQYWQgdG8gYmxvY2tMZW4gYW5kIHVwZGF0ZVxuICAgICAgICAgICAgY29uc3QgdG1wID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5ibG9ja0xlbik7XG4gICAgICAgICAgICB0bXAuc2V0KGtleSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSh0bXApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIHByZXR0aWVyLWlnbm9yZVxuICAgIGdldCgpIHtcbiAgICAgICAgbGV0IHsgdjBsLCB2MGgsIHYxbCwgdjFoLCB2MmwsIHYyaCwgdjNsLCB2M2gsIHY0bCwgdjRoLCB2NWwsIHY1aCwgdjZsLCB2NmgsIHY3bCwgdjdoIH0gPSB0aGlzO1xuICAgICAgICByZXR1cm4gW3YwbCwgdjBoLCB2MWwsIHYxaCwgdjJsLCB2MmgsIHYzbCwgdjNoLCB2NGwsIHY0aCwgdjVsLCB2NWgsIHY2bCwgdjZoLCB2N2wsIHY3aF07XG4gICAgfVxuICAgIC8vIHByZXR0aWVyLWlnbm9yZVxuICAgIHNldCh2MGwsIHYwaCwgdjFsLCB2MWgsIHYybCwgdjJoLCB2M2wsIHYzaCwgdjRsLCB2NGgsIHY1bCwgdjVoLCB2NmwsIHY2aCwgdjdsLCB2N2gpIHtcbiAgICAgICAgdGhpcy52MGwgPSB2MGwgfCAwO1xuICAgICAgICB0aGlzLnYwaCA9IHYwaCB8IDA7XG4gICAgICAgIHRoaXMudjFsID0gdjFsIHwgMDtcbiAgICAgICAgdGhpcy52MWggPSB2MWggfCAwO1xuICAgICAgICB0aGlzLnYybCA9IHYybCB8IDA7XG4gICAgICAgIHRoaXMudjJoID0gdjJoIHwgMDtcbiAgICAgICAgdGhpcy52M2wgPSB2M2wgfCAwO1xuICAgICAgICB0aGlzLnYzaCA9IHYzaCB8IDA7XG4gICAgICAgIHRoaXMudjRsID0gdjRsIHwgMDtcbiAgICAgICAgdGhpcy52NGggPSB2NGggfCAwO1xuICAgICAgICB0aGlzLnY1bCA9IHY1bCB8IDA7XG4gICAgICAgIHRoaXMudjVoID0gdjVoIHwgMDtcbiAgICAgICAgdGhpcy52NmwgPSB2NmwgfCAwO1xuICAgICAgICB0aGlzLnY2aCA9IHY2aCB8IDA7XG4gICAgICAgIHRoaXMudjdsID0gdjdsIHwgMDtcbiAgICAgICAgdGhpcy52N2ggPSB2N2ggfCAwO1xuICAgIH1cbiAgICBjb21wcmVzcyhtc2csIG9mZnNldCwgaXNMYXN0KSB7XG4gICAgICAgIHRoaXMuZ2V0KCkuZm9yRWFjaCgodiwgaSkgPT4gKEJCVUZbaV0gPSB2KSk7IC8vIEZpcnN0IGhhbGYgZnJvbSBzdGF0ZS5cbiAgICAgICAgQkJVRi5zZXQoQjJCX0lWLCAxNik7IC8vIFNlY29uZCBoYWxmIGZyb20gSVYuXG4gICAgICAgIGxldCB7IGgsIGwgfSA9IHU2NC5mcm9tQmlnKEJpZ0ludCh0aGlzLmxlbmd0aCkpO1xuICAgICAgICBCQlVGWzI0XSA9IEIyQl9JVls4XSBeIGw7IC8vIExvdyB3b3JkIG9mIHRoZSBvZmZzZXQuXG4gICAgICAgIEJCVUZbMjVdID0gQjJCX0lWWzldIF4gaDsgLy8gSGlnaCB3b3JkLlxuICAgICAgICAvLyBJbnZlcnQgYWxsIGJpdHMgZm9yIGxhc3QgYmxvY2tcbiAgICAgICAgaWYgKGlzTGFzdCkge1xuICAgICAgICAgICAgQkJVRlsyOF0gPSB+QkJVRlsyOF07XG4gICAgICAgICAgICBCQlVGWzI5XSA9IH5CQlVGWzI5XTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgaiA9IDA7XG4gICAgICAgIGNvbnN0IHMgPSBCU0lHTUE7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgICAgICAgRzFiKDAsIDQsIDgsIDEyLCBtc2csIG9mZnNldCArIDIgKiBzW2orK10pO1xuICAgICAgICAgICAgRzJiKDAsIDQsIDgsIDEyLCBtc2csIG9mZnNldCArIDIgKiBzW2orK10pO1xuICAgICAgICAgICAgRzFiKDEsIDUsIDksIDEzLCBtc2csIG9mZnNldCArIDIgKiBzW2orK10pO1xuICAgICAgICAgICAgRzJiKDEsIDUsIDksIDEzLCBtc2csIG9mZnNldCArIDIgKiBzW2orK10pO1xuICAgICAgICAgICAgRzFiKDIsIDYsIDEwLCAxNCwgbXNnLCBvZmZzZXQgKyAyICogc1tqKytdKTtcbiAgICAgICAgICAgIEcyYigyLCA2LCAxMCwgMTQsIG1zZywgb2Zmc2V0ICsgMiAqIHNbaisrXSk7XG4gICAgICAgICAgICBHMWIoMywgNywgMTEsIDE1LCBtc2csIG9mZnNldCArIDIgKiBzW2orK10pO1xuICAgICAgICAgICAgRzJiKDMsIDcsIDExLCAxNSwgbXNnLCBvZmZzZXQgKyAyICogc1tqKytdKTtcbiAgICAgICAgICAgIEcxYigwLCA1LCAxMCwgMTUsIG1zZywgb2Zmc2V0ICsgMiAqIHNbaisrXSk7XG4gICAgICAgICAgICBHMmIoMCwgNSwgMTAsIDE1LCBtc2csIG9mZnNldCArIDIgKiBzW2orK10pO1xuICAgICAgICAgICAgRzFiKDEsIDYsIDExLCAxMiwgbXNnLCBvZmZzZXQgKyAyICogc1tqKytdKTtcbiAgICAgICAgICAgIEcyYigxLCA2LCAxMSwgMTIsIG1zZywgb2Zmc2V0ICsgMiAqIHNbaisrXSk7XG4gICAgICAgICAgICBHMWIoMiwgNywgOCwgMTMsIG1zZywgb2Zmc2V0ICsgMiAqIHNbaisrXSk7XG4gICAgICAgICAgICBHMmIoMiwgNywgOCwgMTMsIG1zZywgb2Zmc2V0ICsgMiAqIHNbaisrXSk7XG4gICAgICAgICAgICBHMWIoMywgNCwgOSwgMTQsIG1zZywgb2Zmc2V0ICsgMiAqIHNbaisrXSk7XG4gICAgICAgICAgICBHMmIoMywgNCwgOSwgMTQsIG1zZywgb2Zmc2V0ICsgMiAqIHNbaisrXSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52MGwgXj0gQkJVRlswXSBeIEJCVUZbMTZdO1xuICAgICAgICB0aGlzLnYwaCBePSBCQlVGWzFdIF4gQkJVRlsxN107XG4gICAgICAgIHRoaXMudjFsIF49IEJCVUZbMl0gXiBCQlVGWzE4XTtcbiAgICAgICAgdGhpcy52MWggXj0gQkJVRlszXSBeIEJCVUZbMTldO1xuICAgICAgICB0aGlzLnYybCBePSBCQlVGWzRdIF4gQkJVRlsyMF07XG4gICAgICAgIHRoaXMudjJoIF49IEJCVUZbNV0gXiBCQlVGWzIxXTtcbiAgICAgICAgdGhpcy52M2wgXj0gQkJVRls2XSBeIEJCVUZbMjJdO1xuICAgICAgICB0aGlzLnYzaCBePSBCQlVGWzddIF4gQkJVRlsyM107XG4gICAgICAgIHRoaXMudjRsIF49IEJCVUZbOF0gXiBCQlVGWzI0XTtcbiAgICAgICAgdGhpcy52NGggXj0gQkJVRls5XSBeIEJCVUZbMjVdO1xuICAgICAgICB0aGlzLnY1bCBePSBCQlVGWzEwXSBeIEJCVUZbMjZdO1xuICAgICAgICB0aGlzLnY1aCBePSBCQlVGWzExXSBeIEJCVUZbMjddO1xuICAgICAgICB0aGlzLnY2bCBePSBCQlVGWzEyXSBeIEJCVUZbMjhdO1xuICAgICAgICB0aGlzLnY2aCBePSBCQlVGWzEzXSBeIEJCVUZbMjldO1xuICAgICAgICB0aGlzLnY3bCBePSBCQlVGWzE0XSBeIEJCVUZbMzBdO1xuICAgICAgICB0aGlzLnY3aCBePSBCQlVGWzE1XSBeIEJCVUZbMzFdO1xuICAgICAgICBjbGVhbihCQlVGKTtcbiAgICB9XG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICBjbGVhbih0aGlzLmJ1ZmZlcjMyKTtcbiAgICAgICAgdGhpcy5zZXQoMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCk7XG4gICAgfVxufVxuLyoqXG4gKiBCbGFrZTJiIGhhc2ggZnVuY3Rpb24uIDY0LWJpdC4gMS41eCBzbG93ZXIgdGhhbiBibGFrZTJzIGluIEpTLlxuICogQHBhcmFtIG1zZyAtIG1lc3NhZ2UgdGhhdCB3b3VsZCBiZSBoYXNoZWRcbiAqIEBwYXJhbSBvcHRzIC0gZGtMZW4gb3V0cHV0IGxlbmd0aCwga2V5IGZvciBNQUMgbW9kZSwgc2FsdCwgcGVyc29uYWxpemF0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBibGFrZTJiID0gLyogQF9fUFVSRV9fICovIGNyZWF0ZUhhc2hlcigob3B0cykgPT4gbmV3IF9CTEFLRTJiKG9wdHMpKTtcbi8qKiBCTEFLRTItY29tcHJlc3MgY29yZSBtZXRob2QuICovXG4vLyBwcmV0dGllci1pZ25vcmVcbmV4cG9ydCBmdW5jdGlvbiBjb21wcmVzcyhzLCBvZmZzZXQsIG1zZywgcm91bmRzLCB2MCwgdjEsIHYyLCB2MywgdjQsIHY1LCB2NiwgdjcsIHY4LCB2OSwgdjEwLCB2MTEsIHYxMiwgdjEzLCB2MTQsIHYxNSkge1xuICAgIGxldCBqID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJvdW5kczsgaSsrKSB7XG4gICAgICAgICh7IGE6IHYwLCBiOiB2NCwgYzogdjgsIGQ6IHYxMiB9ID0gRzFzKHYwLCB2NCwgdjgsIHYxMiwgbXNnW29mZnNldCArIHNbaisrXV0pKTtcbiAgICAgICAgKHsgYTogdjAsIGI6IHY0LCBjOiB2OCwgZDogdjEyIH0gPSBHMnModjAsIHY0LCB2OCwgdjEyLCBtc2dbb2Zmc2V0ICsgc1tqKytdXSkpO1xuICAgICAgICAoeyBhOiB2MSwgYjogdjUsIGM6IHY5LCBkOiB2MTMgfSA9IEcxcyh2MSwgdjUsIHY5LCB2MTMsIG1zZ1tvZmZzZXQgKyBzW2orK11dKSk7XG4gICAgICAgICh7IGE6IHYxLCBiOiB2NSwgYzogdjksIGQ6IHYxMyB9ID0gRzJzKHYxLCB2NSwgdjksIHYxMywgbXNnW29mZnNldCArIHNbaisrXV0pKTtcbiAgICAgICAgKHsgYTogdjIsIGI6IHY2LCBjOiB2MTAsIGQ6IHYxNCB9ID0gRzFzKHYyLCB2NiwgdjEwLCB2MTQsIG1zZ1tvZmZzZXQgKyBzW2orK11dKSk7XG4gICAgICAgICh7IGE6IHYyLCBiOiB2NiwgYzogdjEwLCBkOiB2MTQgfSA9IEcycyh2MiwgdjYsIHYxMCwgdjE0LCBtc2dbb2Zmc2V0ICsgc1tqKytdXSkpO1xuICAgICAgICAoeyBhOiB2MywgYjogdjcsIGM6IHYxMSwgZDogdjE1IH0gPSBHMXModjMsIHY3LCB2MTEsIHYxNSwgbXNnW29mZnNldCArIHNbaisrXV0pKTtcbiAgICAgICAgKHsgYTogdjMsIGI6IHY3LCBjOiB2MTEsIGQ6IHYxNSB9ID0gRzJzKHYzLCB2NywgdjExLCB2MTUsIG1zZ1tvZmZzZXQgKyBzW2orK11dKSk7XG4gICAgICAgICh7IGE6IHYwLCBiOiB2NSwgYzogdjEwLCBkOiB2MTUgfSA9IEcxcyh2MCwgdjUsIHYxMCwgdjE1LCBtc2dbb2Zmc2V0ICsgc1tqKytdXSkpO1xuICAgICAgICAoeyBhOiB2MCwgYjogdjUsIGM6IHYxMCwgZDogdjE1IH0gPSBHMnModjAsIHY1LCB2MTAsIHYxNSwgbXNnW29mZnNldCArIHNbaisrXV0pKTtcbiAgICAgICAgKHsgYTogdjEsIGI6IHY2LCBjOiB2MTEsIGQ6IHYxMiB9ID0gRzFzKHYxLCB2NiwgdjExLCB2MTIsIG1zZ1tvZmZzZXQgKyBzW2orK11dKSk7XG4gICAgICAgICh7IGE6IHYxLCBiOiB2NiwgYzogdjExLCBkOiB2MTIgfSA9IEcycyh2MSwgdjYsIHYxMSwgdjEyLCBtc2dbb2Zmc2V0ICsgc1tqKytdXSkpO1xuICAgICAgICAoeyBhOiB2MiwgYjogdjcsIGM6IHY4LCBkOiB2MTMgfSA9IEcxcyh2MiwgdjcsIHY4LCB2MTMsIG1zZ1tvZmZzZXQgKyBzW2orK11dKSk7XG4gICAgICAgICh7IGE6IHYyLCBiOiB2NywgYzogdjgsIGQ6IHYxMyB9ID0gRzJzKHYyLCB2NywgdjgsIHYxMywgbXNnW29mZnNldCArIHNbaisrXV0pKTtcbiAgICAgICAgKHsgYTogdjMsIGI6IHY0LCBjOiB2OSwgZDogdjE0IH0gPSBHMXModjMsIHY0LCB2OSwgdjE0LCBtc2dbb2Zmc2V0ICsgc1tqKytdXSkpO1xuICAgICAgICAoeyBhOiB2MywgYjogdjQsIGM6IHY5LCBkOiB2MTQgfSA9IEcycyh2MywgdjQsIHY5LCB2MTQsIG1zZ1tvZmZzZXQgKyBzW2orK11dKSk7XG4gICAgfVxuICAgIHJldHVybiB7IHYwLCB2MSwgdjIsIHYzLCB2NCwgdjUsIHY2LCB2NywgdjgsIHY5LCB2MTAsIHYxMSwgdjEyLCB2MTMsIHYxNCwgdjE1IH07XG59XG5jb25zdCBCMlNfSVYgPSAvKiBAX19QVVJFX18gKi8gU0hBMjU2X0lWLnNsaWNlKCk7XG4vKiogSW50ZXJuYWwgYmxha2UycyBoYXNoIGNsYXNzLiAqL1xuZXhwb3J0IGNsYXNzIF9CTEFLRTJzIGV4dGVuZHMgX0JMQUtFMiB7XG4gICAgLy8gSW50ZXJuYWwgc3RhdGUsIHNhbWUgYXMgU0hBLTI1NlxuICAgIHYwID0gQjJTX0lWWzBdIHwgMDtcbiAgICB2MSA9IEIyU19JVlsxXSB8IDA7XG4gICAgdjIgPSBCMlNfSVZbMl0gfCAwO1xuICAgIHYzID0gQjJTX0lWWzNdIHwgMDtcbiAgICB2NCA9IEIyU19JVls0XSB8IDA7XG4gICAgdjUgPSBCMlNfSVZbNV0gfCAwO1xuICAgIHY2ID0gQjJTX0lWWzZdIHwgMDtcbiAgICB2NyA9IEIyU19JVls3XSB8IDA7XG4gICAgY29uc3RydWN0b3Iob3B0cyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IG9sZW4gPSBvcHRzLmRrTGVuID09PSB1bmRlZmluZWQgPyAzMiA6IG9wdHMuZGtMZW47XG4gICAgICAgIHN1cGVyKDY0LCBvbGVuKTtcbiAgICAgICAgY2hlY2tCbGFrZTJPcHRzKG9sZW4sIG9wdHMsIDMyLCA4LCA4KTtcbiAgICAgICAgbGV0IHsga2V5LCBwZXJzb25hbGl6YXRpb24sIHNhbHQgfSA9IG9wdHM7XG4gICAgICAgIGxldCBrZXlMZW5ndGggPSAwO1xuICAgICAgICBpZiAoa2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGFieXRlcyhrZXksIHVuZGVmaW5lZCwgJ2tleScpO1xuICAgICAgICAgICAga2V5TGVuZ3RoID0ga2V5Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnYwIF49IHRoaXMub3V0cHV0TGVuIHwgKGtleUxlbmd0aCA8PCA4KSB8ICgweDAxIDw8IDE2KSB8ICgweDAxIDw8IDI0KTtcbiAgICAgICAgaWYgKHNhbHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgYWJ5dGVzKHNhbHQsIHVuZGVmaW5lZCwgJ3NhbHQnKTtcbiAgICAgICAgICAgIGNvbnN0IHNsdCA9IHUzMihzYWx0KTtcbiAgICAgICAgICAgIHRoaXMudjQgXj0gc3dhcDhJZkJFKHNsdFswXSk7XG4gICAgICAgICAgICB0aGlzLnY1IF49IHN3YXA4SWZCRShzbHRbMV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwZXJzb25hbGl6YXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgYWJ5dGVzKHBlcnNvbmFsaXphdGlvbiwgdW5kZWZpbmVkLCAncGVyc29uYWxpemF0aW9uJyk7XG4gICAgICAgICAgICBjb25zdCBwZXJzID0gdTMyKHBlcnNvbmFsaXphdGlvbik7XG4gICAgICAgICAgICB0aGlzLnY2IF49IHN3YXA4SWZCRShwZXJzWzBdKTtcbiAgICAgICAgICAgIHRoaXMudjcgXj0gc3dhcDhJZkJFKHBlcnNbMV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gUGFkIHRvIGJsb2NrTGVuIGFuZCB1cGRhdGVcbiAgICAgICAgICAgIGNvbnN0IHRtcCA9IG5ldyBVaW50OEFycmF5KHRoaXMuYmxvY2tMZW4pO1xuICAgICAgICAgICAgdG1wLnNldChrZXkpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGUodG1wKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQoKSB7XG4gICAgICAgIGNvbnN0IHsgdjAsIHYxLCB2MiwgdjMsIHY0LCB2NSwgdjYsIHY3IH0gPSB0aGlzO1xuICAgICAgICByZXR1cm4gW3YwLCB2MSwgdjIsIHYzLCB2NCwgdjUsIHY2LCB2N107XG4gICAgfVxuICAgIC8vIHByZXR0aWVyLWlnbm9yZVxuICAgIHNldCh2MCwgdjEsIHYyLCB2MywgdjQsIHY1LCB2NiwgdjcpIHtcbiAgICAgICAgdGhpcy52MCA9IHYwIHwgMDtcbiAgICAgICAgdGhpcy52MSA9IHYxIHwgMDtcbiAgICAgICAgdGhpcy52MiA9IHYyIHwgMDtcbiAgICAgICAgdGhpcy52MyA9IHYzIHwgMDtcbiAgICAgICAgdGhpcy52NCA9IHY0IHwgMDtcbiAgICAgICAgdGhpcy52NSA9IHY1IHwgMDtcbiAgICAgICAgdGhpcy52NiA9IHY2IHwgMDtcbiAgICAgICAgdGhpcy52NyA9IHY3IHwgMDtcbiAgICB9XG4gICAgY29tcHJlc3MobXNnLCBvZmZzZXQsIGlzTGFzdCkge1xuICAgICAgICBjb25zdCB7IGgsIGwgfSA9IHU2NC5mcm9tQmlnKEJpZ0ludCh0aGlzLmxlbmd0aCkpO1xuICAgICAgICAvLyBwcmV0dGllci1pZ25vcmVcbiAgICAgICAgY29uc3QgeyB2MCwgdjEsIHYyLCB2MywgdjQsIHY1LCB2NiwgdjcsIHY4LCB2OSwgdjEwLCB2MTEsIHYxMiwgdjEzLCB2MTQsIHYxNSB9ID0gY29tcHJlc3MoQlNJR01BLCBvZmZzZXQsIG1zZywgMTAsIHRoaXMudjAsIHRoaXMudjEsIHRoaXMudjIsIHRoaXMudjMsIHRoaXMudjQsIHRoaXMudjUsIHRoaXMudjYsIHRoaXMudjcsIEIyU19JVlswXSwgQjJTX0lWWzFdLCBCMlNfSVZbMl0sIEIyU19JVlszXSwgbCBeIEIyU19JVls0XSwgaCBeIEIyU19JVls1XSwgaXNMYXN0ID8gfkIyU19JVls2XSA6IEIyU19JVls2XSwgQjJTX0lWWzddKTtcbiAgICAgICAgdGhpcy52MCBePSB2MCBeIHY4O1xuICAgICAgICB0aGlzLnYxIF49IHYxIF4gdjk7XG4gICAgICAgIHRoaXMudjIgXj0gdjIgXiB2MTA7XG4gICAgICAgIHRoaXMudjMgXj0gdjMgXiB2MTE7XG4gICAgICAgIHRoaXMudjQgXj0gdjQgXiB2MTI7XG4gICAgICAgIHRoaXMudjUgXj0gdjUgXiB2MTM7XG4gICAgICAgIHRoaXMudjYgXj0gdjYgXiB2MTQ7XG4gICAgICAgIHRoaXMudjcgXj0gdjcgXiB2MTU7XG4gICAgfVxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgY2xlYW4odGhpcy5idWZmZXIzMik7XG4gICAgICAgIHRoaXMuc2V0KDAsIDAsIDAsIDAsIDAsIDAsIDAsIDApO1xuICAgIH1cbn1cbi8qKlxuICogQmxha2UycyBoYXNoIGZ1bmN0aW9uLiBGb2N1c2VzIG9uIDgtYml0IHRvIDMyLWJpdCBwbGF0Zm9ybXMuIDEuNXggZmFzdGVyIHRoYW4gYmxha2UyYiBpbiBKUy5cbiAqIEBwYXJhbSBtc2cgLSBtZXNzYWdlIHRoYXQgd291bGQgYmUgaGFzaGVkXG4gKiBAcGFyYW0gb3B0cyAtIGRrTGVuIG91dHB1dCBsZW5ndGgsIGtleSBmb3IgTUFDIG1vZGUsIHNhbHQsIHBlcnNvbmFsaXphdGlvblxuICovXG5leHBvcnQgY29uc3QgYmxha2UycyA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVIYXNoZXIoKG9wdHMpID0+IG5ldyBfQkxBS0UycyhvcHRzKSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1ibGFrZTIuanMubWFwIiwiLyoqXG4gKiBBcmdvbjIgS0RGIGZyb20gUkZDIDkxMDYuIENhbiBiZSB1c2VkIHRvIGNyZWF0ZSBhIGtleSBmcm9tIHBhc3N3b3JkIGFuZCBzYWx0LlxuICogV2Ugc3VnZ2VzdCB0byB1c2UgU2NyeXB0LiBKUyBBcmdvbiBpcyAyLTEweCBzbG93ZXIgdGhhbiBuYXRpdmUgY29kZSBiZWNhdXNlIG9mIDY0LWJpdG5lc3M6XG4gKiAqIGFyZ29uIHVzZXMgdWludDY0LCBidXQgSlMgZG9lc24ndCBoYXZlIGZhc3QgdWludDY0YXJyYXlcbiAqICogdWludDY0IG11bHRpcGxpY2F0aW9uIGlzIDEvMyBvZiB0aW1lXG4gKiAqIGBQYCBmdW5jdGlvbiB3b3VsZCBiZSB2ZXJ5IG5pY2Ugd2l0aCB1NjQsIGJlY2F1c2UgbW9zdCBvZiB2YWx1ZSB3aWxsIGJlIGluIHJlZ2lzdGVycyxcbiAqICAgaG92ZXdlciB3aXRoIHUzMiBpdCB3aWxsIHJlcXVpcmUgMzIgcmVnaXN0ZXJzLCB3aGljaCBpcyB0b28gbXVjaC5cbiAqICogSlMgYXJyYXlzIGRvIHNsb3cgYm91bmQgY2hlY2tzLCBzbyByZWFkaW5nIGZyb20gYEEyX0JVRmAgc2xvd3MgaXQgZG93blxuICogQG1vZHVsZVxuICovXG5pbXBvcnQgeyBhZGQzSCwgYWRkM0wsIHJvdHIzMkgsIHJvdHIzMkwsIHJvdHJCSCwgcm90ckJMLCByb3RyU0gsIHJvdHJTTCB9IGZyb20gXCIuL191NjQuanNcIjtcbmltcG9ydCB7IGJsYWtlMmIgfSBmcm9tIFwiLi9ibGFrZTIuanNcIjtcbmltcG9ydCB7IGFudW1iZXIsIGNsZWFuLCBrZGZJbnB1dFRvQnl0ZXMsIG5leHRUaWNrLCB1MzIsIHU4IH0gZnJvbSBcIi4vdXRpbHMuanNcIjtcbmNvbnN0IEFUID0geyBBcmdvbmQyZDogMCwgQXJnb24yaTogMSwgQXJnb24yaWQ6IDIgfTtcbmNvbnN0IEFSR09OMl9TWU5DX1BPSU5UUyA9IDQ7XG5jb25zdCBhYnl0ZXNPclplcm8gPSAoYnVmLCBlcnJvclRpdGxlID0gJycpID0+IHtcbiAgICBpZiAoYnVmID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiBVaW50OEFycmF5Lm9mKCk7XG4gICAgcmV0dXJuIGtkZklucHV0VG9CeXRlcyhidWYsIGVycm9yVGl0bGUpO1xufTtcbi8vIHUzMiAqIHUzMiA9IHU2NFxuZnVuY3Rpb24gbXVsKGEsIGIpIHtcbiAgICBjb25zdCBhTCA9IGEgJiAweGZmZmY7XG4gICAgY29uc3QgYUggPSBhID4+PiAxNjtcbiAgICBjb25zdCBiTCA9IGIgJiAweGZmZmY7XG4gICAgY29uc3QgYkggPSBiID4+PiAxNjtcbiAgICBjb25zdCBsbCA9IE1hdGguaW11bChhTCwgYkwpO1xuICAgIGNvbnN0IGhsID0gTWF0aC5pbXVsKGFILCBiTCk7XG4gICAgY29uc3QgbGggPSBNYXRoLmltdWwoYUwsIGJIKTtcbiAgICBjb25zdCBoaCA9IE1hdGguaW11bChhSCwgYkgpO1xuICAgIGNvbnN0IGNhcnJ5ID0gKGxsID4+PiAxNikgKyAoaGwgJiAweGZmZmYpICsgbGg7XG4gICAgY29uc3QgaGlnaCA9IChoaCArIChobCA+Pj4gMTYpICsgKGNhcnJ5ID4+PiAxNikpIHwgMDtcbiAgICBjb25zdCBsb3cgPSAoY2FycnkgPDwgMTYpIHwgKGxsICYgMHhmZmZmKTtcbiAgICByZXR1cm4geyBoOiBoaWdoLCBsOiBsb3cgfTtcbn1cbmZ1bmN0aW9uIG11bDIoYSwgYikge1xuICAgIC8vIDIgKiBhICogYiAodmlhIHNoaWZ0cylcbiAgICBjb25zdCB7IGgsIGwgfSA9IG11bChhLCBiKTtcbiAgICByZXR1cm4geyBoOiAoKGggPDwgMSkgfCAobCA+Pj4gMzEpKSAmIDB4ZmZmZl9mZmZmLCBsOiAobCA8PCAxKSAmIDB4ZmZmZl9mZmZmIH07XG59XG4vLyBCbGFNa2EgcGVybXV0YXRpb24gZm9yIEFyZ29uMlxuLy8gQSArIEIgKyAoMiAqIHUzMihBKSAqIHUzMihCKSlcbmZ1bmN0aW9uIGJsYW1rYShBaCwgQWwsIEJoLCBCbCkge1xuICAgIGNvbnN0IHsgaDogQ2gsIGw6IENsIH0gPSBtdWwyKEFsLCBCbCk7XG4gICAgLy8gQSArIEIgKyAoMiAqIEEgKiBCKVxuICAgIGNvbnN0IFJsbCA9IGFkZDNMKEFsLCBCbCwgQ2wpO1xuICAgIHJldHVybiB7IGg6IGFkZDNIKFJsbCwgQWgsIEJoLCBDaCksIGw6IFJsbCB8IDAgfTtcbn1cbi8vIFRlbXBvcmFyeSBibG9jayBidWZmZXJcbmNvbnN0IEEyX0JVRiA9IG5ldyBVaW50MzJBcnJheSgyNTYpOyAvLyAxMDI0IGJ5dGVzIChtYXRyaXggMTZ4MTYpXG5mdW5jdGlvbiBHKGEsIGIsIGMsIGQpIHtcbiAgICBsZXQgQWwgPSBBMl9CVUZbMiAqIGFdLCBBaCA9IEEyX0JVRlsyICogYSArIDFdOyAvLyBwcmV0dGllci1pZ25vcmVcbiAgICBsZXQgQmwgPSBBMl9CVUZbMiAqIGJdLCBCaCA9IEEyX0JVRlsyICogYiArIDFdOyAvLyBwcmV0dGllci1pZ25vcmVcbiAgICBsZXQgQ2wgPSBBMl9CVUZbMiAqIGNdLCBDaCA9IEEyX0JVRlsyICogYyArIDFdOyAvLyBwcmV0dGllci1pZ25vcmVcbiAgICBsZXQgRGwgPSBBMl9CVUZbMiAqIGRdLCBEaCA9IEEyX0JVRlsyICogZCArIDFdOyAvLyBwcmV0dGllci1pZ25vcmVcbiAgICAoeyBoOiBBaCwgbDogQWwgfSA9IGJsYW1rYShBaCwgQWwsIEJoLCBCbCkpO1xuICAgICh7IERoLCBEbCB9ID0geyBEaDogRGggXiBBaCwgRGw6IERsIF4gQWwgfSk7XG4gICAgKHsgRGgsIERsIH0gPSB7IERoOiByb3RyMzJIKERoLCBEbCksIERsOiByb3RyMzJMKERoLCBEbCkgfSk7XG4gICAgKHsgaDogQ2gsIGw6IENsIH0gPSBibGFta2EoQ2gsIENsLCBEaCwgRGwpKTtcbiAgICAoeyBCaCwgQmwgfSA9IHsgQmg6IEJoIF4gQ2gsIEJsOiBCbCBeIENsIH0pO1xuICAgICh7IEJoLCBCbCB9ID0geyBCaDogcm90clNIKEJoLCBCbCwgMjQpLCBCbDogcm90clNMKEJoLCBCbCwgMjQpIH0pO1xuICAgICh7IGg6IEFoLCBsOiBBbCB9ID0gYmxhbWthKEFoLCBBbCwgQmgsIEJsKSk7XG4gICAgKHsgRGgsIERsIH0gPSB7IERoOiBEaCBeIEFoLCBEbDogRGwgXiBBbCB9KTtcbiAgICAoeyBEaCwgRGwgfSA9IHsgRGg6IHJvdHJTSChEaCwgRGwsIDE2KSwgRGw6IHJvdHJTTChEaCwgRGwsIDE2KSB9KTtcbiAgICAoeyBoOiBDaCwgbDogQ2wgfSA9IGJsYW1rYShDaCwgQ2wsIERoLCBEbCkpO1xuICAgICh7IEJoLCBCbCB9ID0geyBCaDogQmggXiBDaCwgQmw6IEJsIF4gQ2wgfSk7XG4gICAgKHsgQmgsIEJsIH0gPSB7IEJoOiByb3RyQkgoQmgsIEJsLCA2MyksIEJsOiByb3RyQkwoQmgsIEJsLCA2MykgfSk7XG4gICAgKChBMl9CVUZbMiAqIGFdID0gQWwpLCAoQTJfQlVGWzIgKiBhICsgMV0gPSBBaCkpO1xuICAgICgoQTJfQlVGWzIgKiBiXSA9IEJsKSwgKEEyX0JVRlsyICogYiArIDFdID0gQmgpKTtcbiAgICAoKEEyX0JVRlsyICogY10gPSBDbCksIChBMl9CVUZbMiAqIGMgKyAxXSA9IENoKSk7XG4gICAgKChBMl9CVUZbMiAqIGRdID0gRGwpLCAoQTJfQlVGWzIgKiBkICsgMV0gPSBEaCkpO1xufVxuLy8gcHJldHRpZXItaWdub3JlXG5mdW5jdGlvbiBQKHYwMCwgdjAxLCB2MDIsIHYwMywgdjA0LCB2MDUsIHYwNiwgdjA3LCB2MDgsIHYwOSwgdjEwLCB2MTEsIHYxMiwgdjEzLCB2MTQsIHYxNSkge1xuICAgIEcodjAwLCB2MDQsIHYwOCwgdjEyKTtcbiAgICBHKHYwMSwgdjA1LCB2MDksIHYxMyk7XG4gICAgRyh2MDIsIHYwNiwgdjEwLCB2MTQpO1xuICAgIEcodjAzLCB2MDcsIHYxMSwgdjE1KTtcbiAgICBHKHYwMCwgdjA1LCB2MTAsIHYxNSk7XG4gICAgRyh2MDEsIHYwNiwgdjExLCB2MTIpO1xuICAgIEcodjAyLCB2MDcsIHYwOCwgdjEzKTtcbiAgICBHKHYwMywgdjA0LCB2MDksIHYxNCk7XG59XG5mdW5jdGlvbiBibG9jayh4LCB4UG9zLCB5UG9zLCBvdXRQb3MsIG5lZWRYb3IpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDI1NjsgaSsrKVxuICAgICAgICBBMl9CVUZbaV0gPSB4W3hQb3MgKyBpXSBeIHhbeVBvcyArIGldO1xuICAgIC8vIGNvbHVtbnMgKDgpXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMjg7IGkgKz0gMTYpIHtcbiAgICAgICAgLy8gcHJldHRpZXItaWdub3JlXG4gICAgICAgIFAoaSwgaSArIDEsIGkgKyAyLCBpICsgMywgaSArIDQsIGkgKyA1LCBpICsgNiwgaSArIDcsIGkgKyA4LCBpICsgOSwgaSArIDEwLCBpICsgMTEsIGkgKyAxMiwgaSArIDEzLCBpICsgMTQsIGkgKyAxNSk7XG4gICAgfVxuICAgIC8vIHJvd3MgKDgpXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjsgaSArPSAyKSB7XG4gICAgICAgIC8vIHByZXR0aWVyLWlnbm9yZVxuICAgICAgICBQKGksIGkgKyAxLCBpICsgMTYsIGkgKyAxNywgaSArIDMyLCBpICsgMzMsIGkgKyA0OCwgaSArIDQ5LCBpICsgNjQsIGkgKyA2NSwgaSArIDgwLCBpICsgODEsIGkgKyA5NiwgaSArIDk3LCBpICsgMTEyLCBpICsgMTEzKTtcbiAgICB9XG4gICAgaWYgKG5lZWRYb3IpXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjU2OyBpKyspXG4gICAgICAgICAgICB4W291dFBvcyArIGldIF49IEEyX0JVRltpXSBeIHhbeFBvcyArIGldIF4geFt5UG9zICsgaV07XG4gICAgZWxzZVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDI1NjsgaSsrKVxuICAgICAgICAgICAgeFtvdXRQb3MgKyBpXSA9IEEyX0JVRltpXSBeIHhbeFBvcyArIGldIF4geFt5UG9zICsgaV07XG4gICAgY2xlYW4oQTJfQlVGKTtcbn1cbi8vIFZhcmlhYmxlLUxlbmd0aCBIYXNoIEZ1bmN0aW9uIEgnXG5mdW5jdGlvbiBIcChBLCBka0xlbikge1xuICAgIGNvbnN0IEE4ID0gdTgoQSk7XG4gICAgY29uc3QgVCA9IG5ldyBVaW50MzJBcnJheSgxKTtcbiAgICBjb25zdCBUOCA9IHU4KFQpO1xuICAgIFRbMF0gPSBka0xlbjtcbiAgICAvLyBGYXN0IHBhdGhcbiAgICBpZiAoZGtMZW4gPD0gNjQpXG4gICAgICAgIHJldHVybiBibGFrZTJiLmNyZWF0ZSh7IGRrTGVuIH0pLnVwZGF0ZShUOCkudXBkYXRlKEE4KS5kaWdlc3QoKTtcbiAgICBjb25zdCBvdXQgPSBuZXcgVWludDhBcnJheShka0xlbik7XG4gICAgbGV0IFYgPSBibGFrZTJiLmNyZWF0ZSh7fSkudXBkYXRlKFQ4KS51cGRhdGUoQTgpLmRpZ2VzdCgpO1xuICAgIGxldCBwb3MgPSAwO1xuICAgIC8vIEZpcnN0IGJsb2NrXG4gICAgb3V0LnNldChWLnN1YmFycmF5KDAsIDMyKSk7XG4gICAgcG9zICs9IDMyO1xuICAgIC8vIFJlc3QgYmxvY2tzXG4gICAgZm9yICg7IGRrTGVuIC0gcG9zID4gNjQ7IHBvcyArPSAzMikge1xuICAgICAgICBjb25zdCBWaCA9IGJsYWtlMmIuY3JlYXRlKHt9KS51cGRhdGUoVik7XG4gICAgICAgIFZoLmRpZ2VzdEludG8oVik7XG4gICAgICAgIFZoLmRlc3Ryb3koKTtcbiAgICAgICAgb3V0LnNldChWLnN1YmFycmF5KDAsIDMyKSwgcG9zKTtcbiAgICB9XG4gICAgLy8gTGFzdCBibG9ja1xuICAgIG91dC5zZXQoYmxha2UyYihWLCB7IGRrTGVuOiBka0xlbiAtIHBvcyB9KSwgcG9zKTtcbiAgICBjbGVhbihWLCBUKTtcbiAgICByZXR1cm4gdTMyKG91dCk7XG59XG4vLyBVc2VkIG9ubHkgaW5zaWRlIHByb2Nlc3MgYmxvY2shXG5mdW5jdGlvbiBpbmRleEFscGhhKHIsIHMsIGxhbmVMZW4sIHNlZ21lbnRMZW4sIGluZGV4LCByYW5kTCwgc2FtZUxhbmUgPSBmYWxzZSkge1xuICAgIC8vIFRoaXMgaXMgdWdseSwgYnV0IGNsb3NlIGVub3VnaCB0byByZWZlcmVuY2UgaW1wbGVtZW50YXRpb24uXG4gICAgbGV0IGFyZWE7XG4gICAgaWYgKHIgPT09IDApIHtcbiAgICAgICAgaWYgKHMgPT09IDApXG4gICAgICAgICAgICBhcmVhID0gaW5kZXggLSAxO1xuICAgICAgICBlbHNlIGlmIChzYW1lTGFuZSlcbiAgICAgICAgICAgIGFyZWEgPSBzICogc2VnbWVudExlbiArIGluZGV4IC0gMTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXJlYSA9IHMgKiBzZWdtZW50TGVuICsgKGluZGV4ID09IDAgPyAtMSA6IDApO1xuICAgIH1cbiAgICBlbHNlIGlmIChzYW1lTGFuZSlcbiAgICAgICAgYXJlYSA9IGxhbmVMZW4gLSBzZWdtZW50TGVuICsgaW5kZXggLSAxO1xuICAgIGVsc2VcbiAgICAgICAgYXJlYSA9IGxhbmVMZW4gLSBzZWdtZW50TGVuICsgKGluZGV4ID09IDAgPyAtMSA6IDApO1xuICAgIGNvbnN0IHN0YXJ0UG9zID0gciAhPT0gMCAmJiBzICE9PSBBUkdPTjJfU1lOQ19QT0lOVFMgLSAxID8gKHMgKyAxKSAqIHNlZ21lbnRMZW4gOiAwO1xuICAgIGNvbnN0IHJlbCA9IGFyZWEgLSAxIC0gbXVsKGFyZWEsIG11bChyYW5kTCwgcmFuZEwpLmgpLmg7XG4gICAgcmV0dXJuIChzdGFydFBvcyArIHJlbCkgJSBsYW5lTGVuO1xufVxuY29uc3QgbWF4VWludDMyID0gTWF0aC5wb3coMiwgMzIpO1xuZnVuY3Rpb24gaXNVMzIobnVtKSB7XG4gICAgcmV0dXJuIE51bWJlci5pc1NhZmVJbnRlZ2VyKG51bSkgJiYgbnVtID49IDAgJiYgbnVtIDwgbWF4VWludDMyO1xufVxuZnVuY3Rpb24gYXJnb24yT3B0cyhvcHRzKSB7XG4gICAgY29uc3QgbWVyZ2VkID0ge1xuICAgICAgICB2ZXJzaW9uOiAweDEzLFxuICAgICAgICBka0xlbjogMzIsXG4gICAgICAgIG1heG1lbTogbWF4VWludDMyIC0gMSxcbiAgICAgICAgYXN5bmNUaWNrOiAxMCxcbiAgICB9O1xuICAgIGZvciAobGV0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhvcHRzKSlcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIG1lcmdlZFtrXSA9IHY7XG4gICAgY29uc3QgeyBka0xlbiwgcCwgbSwgdCwgdmVyc2lvbiwgb25Qcm9ncmVzcywgYXN5bmNUaWNrIH0gPSBtZXJnZWQ7XG4gICAgaWYgKCFpc1UzMihka0xlbikgfHwgZGtMZW4gPCA0KVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wiZGtMZW5cIiBtdXN0IGJlIDQuLicpO1xuICAgIGlmICghaXNVMzIocCkgfHwgcCA8IDEgfHwgcCA+PSBNYXRoLnBvdygyLCAyNCkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignXCJwXCIgbXVzdCBiZSAxLi4yXjI0Jyk7XG4gICAgaWYgKCFpc1UzMihtKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcIm1cIiBtdXN0IGJlIDAuLjJeMzInKTtcbiAgICBpZiAoIWlzVTMyKHQpIHx8IHQgPCAxKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1widFwiIChpdGVyYXRpb25zKSBtdXN0IGJlIDEuLjJeMzInKTtcbiAgICBpZiAob25Qcm9ncmVzcyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvblByb2dyZXNzICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wicHJvZ3Jlc3NDYlwiIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgIGFudW1iZXIoYXN5bmNUaWNrLCAnYXN5bmNUaWNrJyk7XG4gICAgLypcbiAgICBNZW1vcnkgc2l6ZSBtIE1VU1QgYmUgYW4gaW50ZWdlciBudW1iZXIgb2Yga2liaWJ5dGVzIGZyb20gOCpwIHRvIDJeKDMyKS0xLiBUaGUgYWN0dWFsIG51bWJlciBvZiBibG9ja3MgaXMgbScsIHdoaWNoIGlzIG0gcm91bmRlZCBkb3duIHRvIHRoZSBuZWFyZXN0IG11bHRpcGxlIG9mIDQqcC5cbiAgICAqL1xuICAgIGlmICghaXNVMzIobSkgfHwgbSA8IDggKiBwKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wibVwiIChtZW1vcnkpIG11c3QgYmUgYXQgbGVhc3QgOCpwIGJ5dGVzJyk7XG4gICAgaWYgKHZlcnNpb24gIT09IDB4MTAgJiYgdmVyc2lvbiAhPT0gMHgxMylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcInZlcnNpb25cIiBtdXN0IGJlIDB4MTAgb3IgMHgxMywgZ290ICcgKyB2ZXJzaW9uKTtcbiAgICByZXR1cm4gbWVyZ2VkO1xufVxuZnVuY3Rpb24gYXJnb24ySW5pdChwYXNzd29yZCwgc2FsdCwgdHlwZSwgb3B0cykge1xuICAgIHBhc3N3b3JkID0ga2RmSW5wdXRUb0J5dGVzKHBhc3N3b3JkLCAncGFzc3dvcmQnKTtcbiAgICBzYWx0ID0ga2RmSW5wdXRUb0J5dGVzKHNhbHQsICdzYWx0Jyk7XG4gICAgaWYgKCFpc1UzMihwYXNzd29yZC5sZW5ndGgpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wicGFzc3dvcmRcIiBtdXN0IGJlIGxlc3Mgb2YgbGVuZ3RoIDEuLjRHYicpO1xuICAgIGlmICghaXNVMzIoc2FsdC5sZW5ndGgpIHx8IHNhbHQubGVuZ3RoIDwgOClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcInNhbHRcIiBtdXN0IGJlIG9mIGxlbmd0aCA4Li40R2InKTtcbiAgICBpZiAoIU9iamVjdC52YWx1ZXMoQVQpLmluY2x1ZGVzKHR5cGUpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1widHlwZVwiIHdhcyBpbnZhbGlkJyk7XG4gICAgbGV0IHsgcCwgZGtMZW4sIG0sIHQsIHZlcnNpb24sIGtleSwgcGVyc29uYWxpemF0aW9uLCBtYXhtZW0sIG9uUHJvZ3Jlc3MsIGFzeW5jVGljayB9ID0gYXJnb24yT3B0cyhvcHRzKTtcbiAgICAvLyBWYWxpZGF0aW9uXG4gICAga2V5ID0gYWJ5dGVzT3JaZXJvKGtleSwgJ2tleScpO1xuICAgIHBlcnNvbmFsaXphdGlvbiA9IGFieXRlc09yWmVybyhwZXJzb25hbGl6YXRpb24sICdwZXJzb25hbGl6YXRpb24nKTtcbiAgICAvLyBIXzAgPSBIXig2NCkoTEUzMihwKSB8fCBMRTMyKFQpIHx8IExFMzIobSkgfHwgTEUzMih0KSB8fFxuICAgIC8vICAgICAgIExFMzIodikgfHwgTEUzMih5KSB8fCBMRTMyKGxlbmd0aChQKSkgfHwgUCB8fFxuICAgIC8vICAgICAgIExFMzIobGVuZ3RoKFMpKSB8fCBTIHx8ICBMRTMyKGxlbmd0aChLKSkgfHwgSyB8fFxuICAgIC8vICAgICAgIExFMzIobGVuZ3RoKFgpKSB8fCBYKVxuICAgIGNvbnN0IGggPSBibGFrZTJiLmNyZWF0ZSgpO1xuICAgIGNvbnN0IEJVRiA9IG5ldyBVaW50MzJBcnJheSgxKTtcbiAgICBjb25zdCBCVUY4ID0gdTgoQlVGKTtcbiAgICBmb3IgKGxldCBpdGVtIG9mIFtwLCBka0xlbiwgbSwgdCwgdmVyc2lvbiwgdHlwZV0pIHtcbiAgICAgICAgQlVGWzBdID0gaXRlbTtcbiAgICAgICAgaC51cGRhdGUoQlVGOCk7XG4gICAgfVxuICAgIGZvciAobGV0IGkgb2YgW3Bhc3N3b3JkLCBzYWx0LCBrZXksIHBlcnNvbmFsaXphdGlvbl0pIHtcbiAgICAgICAgQlVGWzBdID0gaS5sZW5ndGg7IC8vIEJVRiBpcyB1MzIgYXJyYXksIHRoaXMgaXMgdmFsaWRcbiAgICAgICAgaC51cGRhdGUoQlVGOCkudXBkYXRlKGkpO1xuICAgIH1cbiAgICBjb25zdCBIMCA9IG5ldyBVaW50MzJBcnJheSgxOCk7XG4gICAgY29uc3QgSDBfOCA9IHU4KEgwKTtcbiAgICBoLmRpZ2VzdEludG8oSDBfOCk7XG4gICAgLy8gMjU2IHUzMiA9IDEwMjQgKEJMT0NLX1NJWkUpLCBmaWxscyBBMl9CVUYgb24gcHJvY2Vzc2luZ1xuICAgIC8vIFBhcmFtc1xuICAgIGNvbnN0IGxhbmVzID0gcDtcbiAgICAvLyBtJyA9IDQgKiBwICogZmxvb3IgKG0gLyA0cClcbiAgICBjb25zdCBtUCA9IDQgKiBwICogTWF0aC5mbG9vcihtIC8gKEFSR09OMl9TWU5DX1BPSU5UUyAqIHApKTtcbiAgICAvL3EgPSBtJyAvIHAgY29sdW1uc1xuICAgIGNvbnN0IGxhbmVMZW4gPSBNYXRoLmZsb29yKG1QIC8gcCk7XG4gICAgY29uc3Qgc2VnbWVudExlbiA9IE1hdGguZmxvb3IobGFuZUxlbiAvIEFSR09OMl9TWU5DX1BPSU5UUyk7XG4gICAgY29uc3QgbWVtVXNlZCA9IG1QICogMjU2O1xuICAgIGlmICghaXNVMzIobWF4bWVtKSB8fCBtZW1Vc2VkID4gbWF4bWVtKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wibWF4bWVtXCIgZXhwZWN0ZWQgPDIqKjMyLCBnb3Q6IG1heG1lbT0nICsgbWF4bWVtICsgJywgbWVtdXNlZD0nICsgbWVtVXNlZCk7XG4gICAgY29uc3QgQiA9IG5ldyBVaW50MzJBcnJheShtZW1Vc2VkKTtcbiAgICAvLyBGaWxsIGZpcnN0IGJsb2Nrc1xuICAgIGZvciAobGV0IGwgPSAwOyBsIDwgcDsgbCsrKSB7XG4gICAgICAgIGNvbnN0IGkgPSAyNTYgKiBsYW5lTGVuICogbDtcbiAgICAgICAgLy8gQltpXVswXSA9IEgnXigxMDI0KShIXzAgfHwgTEUzMigwKSB8fCBMRTMyKGkpKVxuICAgICAgICBIMFsxN10gPSBsO1xuICAgICAgICBIMFsxNl0gPSAwO1xuICAgICAgICBCLnNldChIcChIMCwgMTAyNCksIGkpO1xuICAgICAgICAvLyBCW2ldWzFdID0gSCdeKDEwMjQpKEhfMCB8fCBMRTMyKDEpIHx8IExFMzIoaSkpXG4gICAgICAgIEgwWzE2XSA9IDE7XG4gICAgICAgIEIuc2V0KEhwKEgwLCAxMDI0KSwgaSArIDI1Nik7XG4gICAgfVxuICAgIGxldCBwZXJCbG9jayA9ICgpID0+IHsgfTtcbiAgICBpZiAob25Qcm9ncmVzcykge1xuICAgICAgICBjb25zdCB0b3RhbEJsb2NrID0gdCAqIEFSR09OMl9TWU5DX1BPSU5UUyAqIHAgKiBzZWdtZW50TGVuO1xuICAgICAgICAvLyBJbnZva2UgY2FsbGJhY2sgaWYgcHJvZ3Jlc3MgY2hhbmdlcyBmcm9tIDEwLjAxIHRvIDEwLjAyXG4gICAgICAgIC8vIEFsbG93cyB0byBkcmF3IHNtb290aCBwcm9ncmVzcyBiYXIgb24gdXAgdG8gOEsgc2NyZWVuXG4gICAgICAgIGNvbnN0IGNhbGxiYWNrUGVyID0gTWF0aC5tYXgoTWF0aC5mbG9vcih0b3RhbEJsb2NrIC8gMTAwMDApLCAxKTtcbiAgICAgICAgbGV0IGJsb2NrQ250ID0gMDtcbiAgICAgICAgcGVyQmxvY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBibG9ja0NudCsrO1xuICAgICAgICAgICAgaWYgKG9uUHJvZ3Jlc3MgJiYgKCEoYmxvY2tDbnQgJSBjYWxsYmFja1BlcikgfHwgYmxvY2tDbnQgPT09IHRvdGFsQmxvY2spKVxuICAgICAgICAgICAgICAgIG9uUHJvZ3Jlc3MoYmxvY2tDbnQgLyB0b3RhbEJsb2NrKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY2xlYW4oQlVGLCBIMCk7XG4gICAgcmV0dXJuIHsgdHlwZSwgbVAsIHAsIHQsIHZlcnNpb24sIEIsIGxhbmVMZW4sIGxhbmVzLCBzZWdtZW50TGVuLCBka0xlbiwgcGVyQmxvY2ssIGFzeW5jVGljayB9O1xufVxuZnVuY3Rpb24gYXJnb24yT3V0cHV0KEIsIHAsIGxhbmVMZW4sIGRrTGVuKSB7XG4gICAgY29uc3QgQl9maW5hbCA9IG5ldyBVaW50MzJBcnJheSgyNTYpO1xuICAgIGZvciAobGV0IGwgPSAwOyBsIDwgcDsgbCsrKVxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDI1NjsgaisrKVxuICAgICAgICAgICAgQl9maW5hbFtqXSBePSBCWzI1NiAqIChsYW5lTGVuICogbCArIGxhbmVMZW4gLSAxKSArIGpdO1xuICAgIGNvbnN0IHJlcyA9IHU4KEhwKEJfZmluYWwsIGRrTGVuKSk7XG4gICAgY2xlYW4oQl9maW5hbCk7XG4gICAgcmV0dXJuIHJlcztcbn1cbmZ1bmN0aW9uIHByb2Nlc3NCbG9jayhCLCBhZGRyZXNzLCBsLCByLCBzLCBpbmRleCwgbGFuZUxlbiwgc2VnbWVudExlbiwgbGFuZXMsIG9mZnNldCwgcHJldiwgZGF0YUluZGVwZW5kZW50LCBuZWVkWG9yKSB7XG4gICAgaWYgKG9mZnNldCAlIGxhbmVMZW4pXG4gICAgICAgIHByZXYgPSBvZmZzZXQgLSAxO1xuICAgIGxldCByYW5kTCwgcmFuZEg7XG4gICAgaWYgKGRhdGFJbmRlcGVuZGVudCkge1xuICAgICAgICBsZXQgaTEyOCA9IGluZGV4ICUgMTI4O1xuICAgICAgICBpZiAoaTEyOCA9PT0gMCkge1xuICAgICAgICAgICAgYWRkcmVzc1syNTYgKyAxMl0rKztcbiAgICAgICAgICAgIGJsb2NrKGFkZHJlc3MsIDI1NiwgMiAqIDI1NiwgMCwgZmFsc2UpO1xuICAgICAgICAgICAgYmxvY2soYWRkcmVzcywgMCwgMiAqIDI1NiwgMCwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIHJhbmRMID0gYWRkcmVzc1syICogaTEyOF07XG4gICAgICAgIHJhbmRIID0gYWRkcmVzc1syICogaTEyOCArIDFdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgVCA9IDI1NiAqIHByZXY7XG4gICAgICAgIHJhbmRMID0gQltUXTtcbiAgICAgICAgcmFuZEggPSBCW1QgKyAxXTtcbiAgICB9XG4gICAgLy8gYWRkcmVzcyBibG9ja1xuICAgIGNvbnN0IHJlZkxhbmUgPSByID09PSAwICYmIHMgPT09IDAgPyBsIDogcmFuZEggJSBsYW5lcztcbiAgICBjb25zdCByZWZQb3MgPSBpbmRleEFscGhhKHIsIHMsIGxhbmVMZW4sIHNlZ21lbnRMZW4sIGluZGV4LCByYW5kTCwgcmVmTGFuZSA9PSBsKTtcbiAgICBjb25zdCByZWZCbG9jayA9IGxhbmVMZW4gKiByZWZMYW5lICsgcmVmUG9zO1xuICAgIC8vIEJbaV1bal0gPSBHKEJbaV1bai0xXSwgQltsXVt6XSlcbiAgICBibG9jayhCLCAyNTYgKiBwcmV2LCAyNTYgKiByZWZCbG9jaywgb2Zmc2V0ICogMjU2LCBuZWVkWG9yKTtcbn1cbmZ1bmN0aW9uIGFyZ29uMih0eXBlLCBwYXNzd29yZCwgc2FsdCwgb3B0cykge1xuICAgIGNvbnN0IHsgbVAsIHAsIHQsIHZlcnNpb24sIEIsIGxhbmVMZW4sIGxhbmVzLCBzZWdtZW50TGVuLCBka0xlbiwgcGVyQmxvY2sgfSA9IGFyZ29uMkluaXQocGFzc3dvcmQsIHNhbHQsIHR5cGUsIG9wdHMpO1xuICAgIC8vIFByZS1sb29wIHNldHVwXG4gICAgLy8gW2FkZHJlc3MsIGlucHV0LCB6ZXJvX2Jsb2NrXSBmb3JtYXQgc28gd2UgY2FuIHBhc3Mgc2luZ2xlIFUzMiB0byBibG9jayBmdW5jdGlvblxuICAgIGNvbnN0IGFkZHJlc3MgPSBuZXcgVWludDMyQXJyYXkoMyAqIDI1Nik7XG4gICAgYWRkcmVzc1syNTYgKyA2XSA9IG1QO1xuICAgIGFkZHJlc3NbMjU2ICsgOF0gPSB0O1xuICAgIGFkZHJlc3NbMjU2ICsgMTBdID0gdHlwZTtcbiAgICBmb3IgKGxldCByID0gMDsgciA8IHQ7IHIrKykge1xuICAgICAgICBjb25zdCBuZWVkWG9yID0gciAhPT0gMCAmJiB2ZXJzaW9uID09PSAweDEzO1xuICAgICAgICBhZGRyZXNzWzI1NiArIDBdID0gcjtcbiAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBBUkdPTjJfU1lOQ19QT0lOVFM7IHMrKykge1xuICAgICAgICAgICAgYWRkcmVzc1syNTYgKyA0XSA9IHM7XG4gICAgICAgICAgICBjb25zdCBkYXRhSW5kZXBlbmRlbnQgPSB0eXBlID09IEFULkFyZ29uMmkgfHwgKHR5cGUgPT0gQVQuQXJnb24yaWQgJiYgciA9PT0gMCAmJiBzIDwgMik7XG4gICAgICAgICAgICBmb3IgKGxldCBsID0gMDsgbCA8IHA7IGwrKykge1xuICAgICAgICAgICAgICAgIGFkZHJlc3NbMjU2ICsgMl0gPSBsO1xuICAgICAgICAgICAgICAgIGFkZHJlc3NbMjU2ICsgMTJdID0gMDtcbiAgICAgICAgICAgICAgICBsZXQgc3RhcnRQb3MgPSAwO1xuICAgICAgICAgICAgICAgIGlmIChyID09PSAwICYmIHMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRQb3MgPSAyO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YUluZGVwZW5kZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzWzI1NiArIDEyXSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2soYWRkcmVzcywgMjU2LCAyICogMjU2LCAwLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBibG9jayhhZGRyZXNzLCAwLCAyICogMjU2LCAwLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gY3VycmVudCBibG9jayBwb3N0aW9uXG4gICAgICAgICAgICAgICAgbGV0IG9mZnNldCA9IGwgKiBsYW5lTGVuICsgcyAqIHNlZ21lbnRMZW4gKyBzdGFydFBvcztcbiAgICAgICAgICAgICAgICAvLyBwcmV2aW91cyBibG9jayBwb3NpdGlvblxuICAgICAgICAgICAgICAgIGxldCBwcmV2ID0gb2Zmc2V0ICUgbGFuZUxlbiA/IG9mZnNldCAtIDEgOiBvZmZzZXQgKyBsYW5lTGVuIC0gMTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IHN0YXJ0UG9zOyBpbmRleCA8IHNlZ21lbnRMZW47IGluZGV4KyssIG9mZnNldCsrLCBwcmV2KyspIHtcbiAgICAgICAgICAgICAgICAgICAgcGVyQmxvY2soKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0Jsb2NrKEIsIGFkZHJlc3MsIGwsIHIsIHMsIGluZGV4LCBsYW5lTGVuLCBzZWdtZW50TGVuLCBsYW5lcywgb2Zmc2V0LCBwcmV2LCBkYXRhSW5kZXBlbmRlbnQsIG5lZWRYb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjbGVhbihhZGRyZXNzKTtcbiAgICByZXR1cm4gYXJnb24yT3V0cHV0KEIsIHAsIGxhbmVMZW4sIGRrTGVuKTtcbn1cbi8qKiBhcmdvbjJkIEdQVS1yZXNpc3RhbnQgdmVyc2lvbi4gKi9cbmV4cG9ydCBjb25zdCBhcmdvbjJkID0gKHBhc3N3b3JkLCBzYWx0LCBvcHRzKSA9PiBhcmdvbjIoQVQuQXJnb25kMmQsIHBhc3N3b3JkLCBzYWx0LCBvcHRzKTtcbi8qKiBhcmdvbjJpIHNpZGUtY2hhbm5lbC1yZXNpc3RhbnQgdmVyc2lvbi4gKi9cbmV4cG9ydCBjb25zdCBhcmdvbjJpID0gKHBhc3N3b3JkLCBzYWx0LCBvcHRzKSA9PiBhcmdvbjIoQVQuQXJnb24yaSwgcGFzc3dvcmQsIHNhbHQsIG9wdHMpO1xuLyoqIGFyZ29uMmlkLCBjb21iaW5pbmcgaStkLCB0aGUgbW9zdCBwb3B1bGFyIHZlcnNpb24gZnJvbSBSRkMgOTEwNiAqL1xuZXhwb3J0IGNvbnN0IGFyZ29uMmlkID0gKHBhc3N3b3JkLCBzYWx0LCBvcHRzKSA9PiBhcmdvbjIoQVQuQXJnb24yaWQsIHBhc3N3b3JkLCBzYWx0LCBvcHRzKTtcbmFzeW5jIGZ1bmN0aW9uIGFyZ29uMkFzeW5jKHR5cGUsIHBhc3N3b3JkLCBzYWx0LCBvcHRzKSB7XG4gICAgY29uc3QgeyBtUCwgcCwgdCwgdmVyc2lvbiwgQiwgbGFuZUxlbiwgbGFuZXMsIHNlZ21lbnRMZW4sIGRrTGVuLCBwZXJCbG9jaywgYXN5bmNUaWNrIH0gPSBhcmdvbjJJbml0KHBhc3N3b3JkLCBzYWx0LCB0eXBlLCBvcHRzKTtcbiAgICAvLyBQcmUtbG9vcCBzZXR1cFxuICAgIC8vIFthZGRyZXNzLCBpbnB1dCwgemVyb19ibG9ja10gZm9ybWF0IHNvIHdlIGNhbiBwYXNzIHNpbmdsZSBVMzIgdG8gYmxvY2sgZnVuY3Rpb25cbiAgICBjb25zdCBhZGRyZXNzID0gbmV3IFVpbnQzMkFycmF5KDMgKiAyNTYpO1xuICAgIGFkZHJlc3NbMjU2ICsgNl0gPSBtUDtcbiAgICBhZGRyZXNzWzI1NiArIDhdID0gdDtcbiAgICBhZGRyZXNzWzI1NiArIDEwXSA9IHR5cGU7XG4gICAgbGV0IHRzID0gRGF0ZS5ub3coKTtcbiAgICBmb3IgKGxldCByID0gMDsgciA8IHQ7IHIrKykge1xuICAgICAgICBjb25zdCBuZWVkWG9yID0gciAhPT0gMCAmJiB2ZXJzaW9uID09PSAweDEzO1xuICAgICAgICBhZGRyZXNzWzI1NiArIDBdID0gcjtcbiAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBBUkdPTjJfU1lOQ19QT0lOVFM7IHMrKykge1xuICAgICAgICAgICAgYWRkcmVzc1syNTYgKyA0XSA9IHM7XG4gICAgICAgICAgICBjb25zdCBkYXRhSW5kZXBlbmRlbnQgPSB0eXBlID09IEFULkFyZ29uMmkgfHwgKHR5cGUgPT0gQVQuQXJnb24yaWQgJiYgciA9PT0gMCAmJiBzIDwgMik7XG4gICAgICAgICAgICBmb3IgKGxldCBsID0gMDsgbCA8IHA7IGwrKykge1xuICAgICAgICAgICAgICAgIGFkZHJlc3NbMjU2ICsgMl0gPSBsO1xuICAgICAgICAgICAgICAgIGFkZHJlc3NbMjU2ICsgMTJdID0gMDtcbiAgICAgICAgICAgICAgICBsZXQgc3RhcnRQb3MgPSAwO1xuICAgICAgICAgICAgICAgIGlmIChyID09PSAwICYmIHMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRQb3MgPSAyO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YUluZGVwZW5kZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzWzI1NiArIDEyXSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2soYWRkcmVzcywgMjU2LCAyICogMjU2LCAwLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBibG9jayhhZGRyZXNzLCAwLCAyICogMjU2LCAwLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gY3VycmVudCBibG9jayBwb3N0aW9uXG4gICAgICAgICAgICAgICAgbGV0IG9mZnNldCA9IGwgKiBsYW5lTGVuICsgcyAqIHNlZ21lbnRMZW4gKyBzdGFydFBvcztcbiAgICAgICAgICAgICAgICAvLyBwcmV2aW91cyBibG9jayBwb3NpdGlvblxuICAgICAgICAgICAgICAgIGxldCBwcmV2ID0gb2Zmc2V0ICUgbGFuZUxlbiA/IG9mZnNldCAtIDEgOiBvZmZzZXQgKyBsYW5lTGVuIC0gMTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IHN0YXJ0UG9zOyBpbmRleCA8IHNlZ21lbnRMZW47IGluZGV4KyssIG9mZnNldCsrLCBwcmV2KyspIHtcbiAgICAgICAgICAgICAgICAgICAgcGVyQmxvY2soKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0Jsb2NrKEIsIGFkZHJlc3MsIGwsIHIsIHMsIGluZGV4LCBsYW5lTGVuLCBzZWdtZW50TGVuLCBsYW5lcywgb2Zmc2V0LCBwcmV2LCBkYXRhSW5kZXBlbmRlbnQsIG5lZWRYb3IpO1xuICAgICAgICAgICAgICAgICAgICAvLyBEYXRlLm5vdygpIGlzIG5vdCBtb25vdG9uaWMsIHNvIGluIGNhc2UgaWYgY2xvY2sgZ29lcyBiYWNrd2FyZHMgd2UgcmV0dXJuIHJldHVybiBjb250cm9sIHRvb1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkaWZmID0gRGF0ZS5ub3coKSAtIHRzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIShkaWZmID49IDAgJiYgZGlmZiA8IGFzeW5jVGljaykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IG5leHRUaWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cyArPSBkaWZmO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNsZWFuKGFkZHJlc3MpO1xuICAgIHJldHVybiBhcmdvbjJPdXRwdXQoQiwgcCwgbGFuZUxlbiwgZGtMZW4pO1xufVxuLyoqIGFyZ29uMmQgYXN5bmMgR1BVLXJlc2lzdGFudCB2ZXJzaW9uLiAqL1xuZXhwb3J0IGNvbnN0IGFyZ29uMmRBc3luYyA9IChwYXNzd29yZCwgc2FsdCwgb3B0cykgPT4gYXJnb24yQXN5bmMoQVQuQXJnb25kMmQsIHBhc3N3b3JkLCBzYWx0LCBvcHRzKTtcbi8qKiBhcmdvbjJpIGFzeW5jIHNpZGUtY2hhbm5lbC1yZXNpc3RhbnQgdmVyc2lvbi4gKi9cbmV4cG9ydCBjb25zdCBhcmdvbjJpQXN5bmMgPSAocGFzc3dvcmQsIHNhbHQsIG9wdHMpID0+IGFyZ29uMkFzeW5jKEFULkFyZ29uMmksIHBhc3N3b3JkLCBzYWx0LCBvcHRzKTtcbi8qKiBhcmdvbjJpZCBhc3luYywgY29tYmluaW5nIGkrZCwgdGhlIG1vc3QgcG9wdWxhciB2ZXJzaW9uIGZyb20gUkZDIDkxMDYgKi9cbmV4cG9ydCBjb25zdCBhcmdvbjJpZEFzeW5jID0gKHBhc3N3b3JkLCBzYWx0LCBvcHRzKSA9PiBhcmdvbjJBc3luYyhBVC5BcmdvbjJpZCwgcGFzc3dvcmQsIHNhbHQsIG9wdHMpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXJnb24yLmpzLm1hcCIsIi8qKlxyXG4gKiBhcmdvbjItd29ya2VyLmpzXHJcbiAqXHJcbiAqIFdlYiBXb3JrZXIgZm9yIEFyZ29uMmlkIGtleSBkZXJpdmF0aW9uXHJcbiAqIFJ1bnMgaW4gc2VwYXJhdGUgdGhyZWFkIHRvIHByZXZlbnQgVUkgYmxvY2tpbmdcclxuICovXHJcblxyXG5pbXBvcnQgeyBhcmdvbjJpZEFzeW5jIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9hcmdvbjIuanMnO1xyXG5cclxuLyoqXHJcbiAqIExpc3RlbiBmb3IgbWVzc2FnZXMgZnJvbSBtYWluIHRocmVhZFxyXG4gKiBFeHBlY3RlZCBtZXNzYWdlIGZvcm1hdDogeyBwYXNzd29yZCwgc2FsdCwgcGFyYW1zIH1cclxuICovXHJcbnNlbGYub25tZXNzYWdlID0gYXN5bmMgKGUpID0+IHtcclxuICBjb25zdCB7IHBhc3N3b3JkLCBzYWx0LCBwYXJhbXMgfSA9IGUuZGF0YTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIENvbnZlcnQgcGFzc3dvcmQgc3RyaW5nIHRvIFVpbnQ4QXJyYXlcclxuICAgIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuICAgIGNvbnN0IHBhc3N3b3JkQnl0ZXMgPSBlbmNvZGVyLmVuY29kZShwYXNzd29yZCk7XHJcblxyXG4gICAgLy8gQ29udmVydCBzYWx0IGZyb20gYXJyYXkgdG8gVWludDhBcnJheSBpZiBuZWVkZWRcclxuICAgIGNvbnN0IHNhbHRCeXRlcyA9IG5ldyBVaW50OEFycmF5KHNhbHQpO1xyXG5cclxuICAgIC8vIFJ1biBBcmdvbjJpZCBjb21wdXRhdGlvbiB3aXRoIHByb2dyZXNzIGNhbGxiYWNrc1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXJnb24yaWRBc3luYyhcclxuICAgICAgcGFzc3dvcmRCeXRlcyxcclxuICAgICAgc2FsdEJ5dGVzLFxyXG4gICAgICB7XHJcbiAgICAgICAgbTogcGFyYW1zLm1lbW9yeSxcclxuICAgICAgICB0OiBwYXJhbXMuaXRlcmF0aW9ucyxcclxuICAgICAgICBwOiBwYXJhbXMucGFyYWxsZWxpc20gfHwgMSxcclxuICAgICAgICBka0xlbjogMzIsXHJcbiAgICAgICAgYXN5bmNUaWNrOiA1LCAvLyBZaWVsZCBldmVyeSA1bXMgKGRvZXNuJ3QgYmxvY2sgVUkgc2luY2Ugd2UncmUgaW4gd29ya2VyKVxyXG4gICAgICAgIG9uUHJvZ3Jlc3M6IChwcm9ncmVzcykgPT4ge1xyXG4gICAgICAgICAgLy8gU2VuZCBwcm9ncmVzcyB1cGRhdGVzIGJhY2sgdG8gbWFpbiB0aHJlYWRcclxuICAgICAgICAgIHNlbGYucG9zdE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgICB0eXBlOiAncHJvZ3Jlc3MnLFxyXG4gICAgICAgICAgICBwcm9ncmVzczogcHJvZ3Jlc3NcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBTZW5kIHJlc3VsdCBiYWNrIHRvIG1haW4gdGhyZWFkXHJcbiAgICBzZWxmLnBvc3RNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ2NvbXBsZXRlJyxcclxuICAgICAgcmVzdWx0OiBBcnJheS5mcm9tKHJlc3VsdCkgLy8gQ29udmVydCBVaW50OEFycmF5IHRvIHJlZ3VsYXIgYXJyYXkgZm9yIHBvc3RNZXNzYWdlXHJcbiAgICB9KTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIC8vIFNlbmQgZXJyb3IgYmFjayB0byBtYWluIHRocmVhZFxyXG4gICAgc2VsZi5wb3N0TWVzc2FnZSh7XHJcbiAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlXHJcbiAgICB9KTtcclxuICB9XHJcbn07XHJcbiJdLCJuYW1lcyI6WyJ1NjQuYWRkM0wiLCJ1NjQuYWRkM0giLCJ1NjQucm90cjMySCIsInU2NC5yb3RyMzJMIiwidTY0LmFkZCIsInU2NC5yb3RyU0giLCJ1NjQucm90clNMIiwidTY0LnJvdHJCSCIsInU2NC5yb3RyQkwiLCJ1NjQuZnJvbUJpZyJdLCJtYXBwaW5ncyI6Ijs7QUFLQSxRQUFNLGFBQTZCLHVCQUFPLEtBQUssS0FBSyxDQUFDO0FBQ3JELFFBQU0sT0FBdUIsdUJBQU8sRUFBRTtBQUN0QyxXQUFTLFFBQVEsR0FBRyxLQUFLLE9BQU87QUFDNUIsUUFBSTtBQUNBLGFBQU8sRUFBRSxHQUFHLE9BQU8sSUFBSSxVQUFVLEdBQUcsR0FBRyxPQUFRLEtBQUssT0FBUSxVQUFVLEVBQUM7QUFDM0UsV0FBTyxFQUFFLEdBQUcsT0FBUSxLQUFLLE9BQVEsVUFBVSxJQUFJLEdBQUcsR0FBRyxPQUFPLElBQUksVUFBVSxJQUFJLEVBQUM7QUFBQSxFQUNuRjtBQWdCQSxRQUFNLFNBQVMsQ0FBQyxHQUFHLEdBQUcsTUFBTyxNQUFNLElBQU0sS0FBTSxLQUFLO0FBQ3BELFFBQU0sU0FBUyxDQUFDLEdBQUcsR0FBRyxNQUFPLEtBQU0sS0FBSyxJQUFPLE1BQU07QUFFckQsUUFBTSxTQUFTLENBQUMsR0FBRyxHQUFHLE1BQU8sS0FBTSxLQUFLLElBQU8sTUFBTyxJQUFJO0FBQzFELFFBQU0sU0FBUyxDQUFDLEdBQUcsR0FBRyxNQUFPLE1BQU8sSUFBSSxLQUFRLEtBQU0sS0FBSztBQUUzRCxRQUFNLFVBQVUsQ0FBQyxJQUFJLE1BQU07QUFDM0IsUUFBTSxVQUFVLENBQUMsR0FBRyxPQUFPO0FBUzNCLFdBQVMsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJO0FBQ3pCLFVBQU0sS0FBSyxPQUFPLE1BQU0sT0FBTztBQUMvQixX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QUFBQSxJQUNuRDtBQUFBLElBQUk7QUFBQSxJQUFHO0FBQUEsSUFBSTtBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQ25EO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFJO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFJO0FBQUEsSUFDbkQ7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUFHO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUNsRDtBQUFBLElBQUc7QUFBQSxJQUFJO0FBQUEsSUFBRztBQUFBLElBQUk7QUFBQSxJQUFHO0FBQUEsSUFBSTtBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUk7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFBRztBQUFBLElBQ25EO0FBQUEsSUFBSTtBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFBRztBQUFBLElBQUk7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFDbEQ7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUc7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBSTtBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUNsRDtBQUFBLElBQUc7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUc7QUFBQSxJQUFJO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBSTtBQUFBLElBQUc7QUFBQSxJQUFJO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBSTtBQUFBLElBQ25EO0FBQUEsSUFBSTtBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUc7QUFBQSxJQUFJO0FBQUEsSUFBRztBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFDbkQ7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUNsRDtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUk7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUk7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBO0FBQUEsSUFFbkQ7QUFBQSxJQUFJO0FBQUEsSUFBRztBQUFBLElBQUk7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFJO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUFJO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUFHO0FBQUEsSUFBRztBQUFBLElBQUc7QUFBQSxJQUNuRDtBQUFBLElBQUc7QUFB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QUcsR0FBRyxHQUFHLEtBQUssR0FBRztBQUU3QixVQUFNLEtBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLElBQUksQ0FBQztBQUNqQyxRQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLEtBQUssSUFBSSxJQUFJLENBQUM7QUFDekMsUUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDO0FBQ3pDLFFBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssS0FBSyxJQUFJLElBQUksQ0FBQztBQUN6QyxRQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLEtBQUssSUFBSSxJQUFJLENBQUM7QUFFekMsUUFBSSxLQUFLTixNQUFVLElBQUksSUFBSSxFQUFFO0FBQzdCLFNBQUtDLE1BQVUsSUFBSSxJQUFJLElBQUksRUFBRTtBQUM3QixTQUFLLEtBQUs7QUFFVixLQUFDLEVBQUUsSUFBSSxHQUFFLElBQUssRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLEtBQUssR0FBRTtBQUN4QyxLQUFDLEVBQUUsSUFBSSxHQUFFLElBQUssRUFBRSxJQUFJSSxPQUFXLElBQUksSUFBSSxFQUFFLEdBQUcsSUFBSUMsT0FBVyxJQUFJLElBQUksRUFBRSxFQUFDO0FBRXRFLEtBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxHQUFFLElBQUtGLElBQVEsSUFBSSxJQUFJLElBQUksRUFBRTtBQUUxQyxLQUFDLEVBQUUsSUFBSSxHQUFFLElBQUssRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLEtBQUssR0FBRTtBQUN4QyxLQUFDLEVBQUUsSUFBSSxHQUFFLElBQUssRUFBRSxJQUFJRyxPQUFXLElBQUksSUFBSSxFQUFFLEdBQUcsSUFBSUMsT0FBVyxJQUFJLElBQUksRUFBRSxFQUFDO0FBQ3RFLElBQUUsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSTtBQUN4QyxJQUFFLEtBQUssSUFBSSxDQUFDLElBQUksSUFBTSxL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QUN4QyxLQUFDLEVBQUUsSUFBSSxHQUFFLElBQUssRUFBRSxJQUFJLFFBQVEsSUFBSSxFQUFFLEdBQUcsSUFBSSxRQUFRLEVBQU0sRUFBQztBQUN4RCxLQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsR0FBRSxJQUFLLE9BQU8sSUFBSSxJQUFJLElBQUksRUFBRTtBQUN6QyxLQUFDLEVBQUUsSUFBSSxHQUFFLElBQUssRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLEtBQUssR0FBRTtBQUN4QyxLQUFDLEVBQUUsSUFBSSxHQUFFLElBQUssRUFBRSxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUUsR0FBRyxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUUsRUFBQztBQUM5RCxLQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsR0FBRSxJQUFLLE9BQU8sSUFBSSxJQUFJLElBQUksRUFBRTtBQUN6QyxLQUFDLEVBQUUsSUFBSSxHQUFFLElBQUssRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLEtBQUssR0FBRTtBQUN4QyxLQUFDLEVBQUUsSUFBSSxHQUFFLElBQUssRUFBRSxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUUsR0FBRyxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUUsRUFBQztBQUM5RCxLQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsR0FBRSxJQUFLLE9BQU8sSUFBSSxJQUFJLElBQUksRUFBRTtBQUN6QyxLQUFDLEVBQUUsSUFBSSxHQUFFLElBQUssRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLEtBQUssR0FBRTtBQUN4QyxLQUFDLEVBQUUsSUFBSSxHQUFFLElBQUssRUFBRSxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUUsR0FBRyxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUUsRUFBQztBQUM5RCxJQUFFLE9BQU8sSUFBSSxDQUFDLElBQUksSUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLElBQUk7QUFDNUMsSUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLElBQU0sT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJO0FBQzVDLElBQUUsT0FB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
