var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet(obj, member, value, setter);
  },
  get _() {
    return __privateGet(obj, member, getter);
  }
});
var _plugin, _provider, _filter, _filterId, _paused, _emitPromise, _logFilter, _callbacks, _subs, _pending, _connect, _websocket, _configs, _height, _initialSyncPromise, _FallbackProvider_instances, getNextConfig_fn, addRunner_fn, initialSync_fn, checkQuorum_fn, waitForQuorum_fn, _noncePromise, _delta, _request, _providerInfo, _accent;
import { O as computeHmac, P as keccak256, Q as pbkdf2, R as randomBytes, S as ripemd160, T as scrypt, U as scryptSync, V as sha256, W as sha512, X as assertArgument, Y as hexlify, Z as concat, A as getBytes, _ as toUtf8Bytes, G as getAddress, $ as toTwos, a0 as zeroPadValue, a1 as toBeArray, a2 as dataLength, a3 as zeroPadBytes, B as toUtf8String, I as Interface, a4 as defineProperties, a5 as BaseContract, a6 as copyOverrides, a7 as resolveArgs, a8 as assert, a9 as getCreateAddress, aa as JsonRpcProvider, ab as Network, ac as FetchRequest, ad as resolveProperties, ae as AbstractProvider, af as toQuantity, ag as accessListify, ah as isError, ai as AbiCoder, aj as Transaction, C as Contract, ak as NetworkPlugin, al as JsonRpcApiProvider, am as UnmanagedSubscriber, an as makeError, ao as getBigInt, ap as getNumber, aq as AbstractSigner, ar as JsonRpcApiPollingProvider, as as isHexString, at as decodeOwl, au as WordlistOwl, av as LangEn, aw as BaseWallet, ax as Block, ay as ConstructorFragment, az as ContractEventPayload, aA as ContractTransactionReceipt, aB as ContractTransactionResponse, aC as ContractUnknownEventPayload, aD as EnsPlugin, aE as EnsResolver, aF as ErrorDescription, aG as ErrorFragment, aH as EtherSymbol, aI as EventFragment, aJ as EventLog, aK as EventPayload, aL as FallbackFragment, aM as FeeData, aN as FeeDataNetworkPlugin, aO as FetchCancelSignal, aP as FetchResponse, aQ as FetchUrlFeeDataNetworkPlugin, aR as FixedNumber, aS as Fragment, aT as FunctionFragment, aU as GasCostPlugin, aV as HDNodeVoidWallet, aW as HDNodeWallet, aX as Indexed, aY as JsonRpcSigner, aZ as Log, a_ as LogDescription, a$ as MessagePrefix, b0 as Mnemonic, b1 as MulticoinProviderPlugin, b2 as NamedFragment, b3 as ParamType, b4 as Result, b5 as Signature, b6 as SigningKey, b7 as StructFragment, b8 as TransactionDescription, b9 as TransactionReceipt, ba as TransactionResponse, bb as Typed, bc as TypedDataEncoder, bd as UndecodedEventLog, be as Utf8ErrorFuncs, bf as VoidSigner, bg as Wallet, bh as Wordlist, bi as ZeroAddress, bj as ZeroHash, bk as assertArgumentCount, bl as assertNormalize, bm as assertPrivate, bn as authorizationify, bo as checkResultErrors, bp as computeAddress, bq as copyRequest, br as dataSlice, bs as decodeBase58, bt as decodeBase64, bu as decodeRlp, bv as decryptCrowdsaleJson, bw as decryptKeystoreJson, bx as decryptKeystoreJsonSync, by as defaultPath, bz as dnsEncode, bA as encodeBase58, bB as encodeBase64, bC as encodeRlp, bD as encryptKeystoreJson, bE as encryptKeystoreJsonSync, bF as ensNormalize, z as formatEther, f as formatUnits, bG as fromTwos, bH as getAccountPath, bI as getBytesCopy, bJ as getCreate2Address, bK as getIcapAddress, bL as getIndexedAccountPath, bM as getUint, bN as hashAuthorization, bO as hashMessage, bP as id, i as isAddress, bQ as isAddressable, bR as isBytesLike, bS as isCallException, bT as isCrowdsaleJson, bU as isKeystoreJson, bV as isValidName, bW as mask, bX as namehash, o as parseEther, p as parseUnits, bY as recoverAddress, bZ as resolveAddress, b_ as stripZerosLeft, b$ as toBeHex, c0 as toBigInt, c1 as toNumber, c2 as toUtf8CodePoints, c3 as uuidV4, c4 as verifyAuthorization, c5 as verifyMessage, c6 as verifyTypedData, c7 as version } from "./rpc.js";
const N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
const WeiPerEther = BigInt("1000000000000000000");
const MaxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
const MinInt256 = BigInt("0x8000000000000000000000000000000000000000000000000000000000000000") * BigInt(-1);
const MaxInt256 = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
function lock() {
  computeHmac.lock();
  keccak256.lock();
  pbkdf2.lock();
  randomBytes.lock();
  ripemd160.lock();
  scrypt.lock();
  scryptSync.lock();
  sha256.lock();
  sha512.lock();
  randomBytes.lock();
}
const regexBytes = new RegExp("^bytes([0-9]+)$");
const regexNumber = new RegExp("^(u?int)([0-9]*)$");
const regexArray = new RegExp("^(.*)\\[([0-9]*)\\]$");
function _pack(type, value, isArray) {
  switch (type) {
    case "address":
      if (isArray) {
        return getBytes(zeroPadValue(value, 32));
      }
      return getBytes(getAddress(value));
    case "string":
      return toUtf8Bytes(value);
    case "bytes":
      return getBytes(value);
    case "bool":
      value = !!value ? "0x01" : "0x00";
      if (isArray) {
        return getBytes(zeroPadValue(value, 32));
      }
      return getBytes(value);
  }
  let match = type.match(regexNumber);
  if (match) {
    let signed = match[1] === "int";
    let size = parseInt(match[2] || "256");
    assertArgument((!match[2] || match[2] === String(size)) && size % 8 === 0 && size !== 0 && size <= 256, "invalid number type", "type", type);
    if (isArray) {
      size = 256;
    }
    if (signed) {
      value = toTwos(value, size);
    }
    return getBytes(zeroPadValue(toBeArray(value), size / 8));
  }
  match = type.match(regexBytes);
  if (match) {
    const size = parseInt(match[1]);
    assertArgument(String(size) === match[1] && size !== 0 && size <= 32, "invalid bytes type", "type", type);
    assertArgument(dataLength(value) === size, `invalid value for ${type}`, "value", value);
    if (isArray) {
      return getBytes(zeroPadBytes(value, 32));
    }
    return value;
  }
  match = type.match(regexArray);
  if (match && Array.isArray(value)) {
    const baseType = match[1];
    const count = parseInt(match[2] || String(value.length));
    assertArgument(count === value.length, `invalid array length for ${type}`, "value", value);
    const result = [];
    value.forEach(function(value2) {
      result.push(_pack(baseType, value2, true));
    });
    return getBytes(concat(result));
  }
  assertArgument(false, "invalid type", "type", type);
}
function solidityPacked(types, values) {
  assertArgument(types.length === values.length, "wrong number of values; expected ${ types.length }", "values", values);
  const tight = [];
  types.forEach(function(type, index) {
    tight.push(_pack(type, values[index]));
  });
  return hexlify(concat(tight));
}
function solidityPackedKeccak256(types, values) {
  return keccak256(solidityPacked(types, values));
}
function solidityPackedSha256(types, values) {
  return sha256(solidityPacked(types, values));
}
function encodeBytes32String(text) {
  const bytes = toUtf8Bytes(text);
  if (bytes.length > 31) {
    throw new Error("bytes32 string must be less than 32 bytes");
  }
  return zeroPadBytes(bytes, 32);
}
function decodeBytes32String(_bytes) {
  const data = getBytes(_bytes, "bytes");
  if (data.length !== 32) {
    throw new Error("invalid bytes32 - not 32 bytes long");
  }
  if (data[31] !== 0) {
    throw new Error("invalid bytes32 string - no null terminator");
  }
  let length = 31;
  while (data[length - 1] === 0) {
    length--;
  }
  return toUtf8String(data.slice(0, length));
}
class ContractFactory {
  /**
   *  Create a new **ContractFactory** with %%abi%% and %%bytecode%%,
   *  optionally connected to %%runner%%.
   *
   *  The %%bytecode%% may be the ``bytecode`` property within the
   *  standard Solidity JSON output.
   */
  constructor(abi, bytecode, runner) {
    /**
     *  The Contract Interface.
     */
    __publicField(this, "interface");
    /**
     *  The Contract deployment bytecode. Often called the initcode.
     */
    __publicField(this, "bytecode");
    /**
     *  The ContractRunner to deploy the Contract as.
     */
    __publicField(this, "runner");
    const iface = Interface.from(abi);
    if (bytecode instanceof Uint8Array) {
      bytecode = hexlify(getBytes(bytecode));
    } else {
      if (typeof bytecode === "object") {
        bytecode = bytecode.object;
      }
      if (!bytecode.startsWith("0x")) {
        bytecode = "0x" + bytecode;
      }
      bytecode = hexlify(getBytes(bytecode));
    }
    defineProperties(this, {
      bytecode,
      interface: iface,
      runner: runner || null
    });
  }
  attach(target) {
    return new BaseContract(target, this.interface, this.runner);
  }
  /**
   *  Resolves to the transaction to deploy the contract, passing %%args%%
   *  into the constructor.
   */
  async getDeployTransaction(...args) {
    let overrides = {};
    const fragment = this.interface.deploy;
    if (fragment.inputs.length + 1 === args.length) {
      overrides = await copyOverrides(args.pop());
    }
    if (fragment.inputs.length !== args.length) {
      throw new Error("incorrect number of arguments to constructor");
    }
    const resolvedArgs = await resolveArgs(this.runner, fragment.inputs, args);
    const data = concat([this.bytecode, this.interface.encodeDeploy(resolvedArgs)]);
    return Object.assign({}, overrides, { data });
  }
  /**
   *  Resolves to the Contract deployed by passing %%args%% into the
   *  constructor.
   *
   *  This will resolve to the Contract before it has been deployed to the
   *  network, so the [[BaseContract-waitForDeployment]] should be used before
   *  sending any transactions to it.
   */
  async deploy(...args) {
    const tx = await this.getDeployTransaction(...args);
    assert(this.runner && typeof this.runner.sendTransaction === "function", "factory runner does not support sending transactions", "UNSUPPORTED_OPERATION", {
      operation: "sendTransaction"
    });
    const sentTx = await this.runner.sendTransaction(tx);
    const address = getCreateAddress(sentTx);
    return new BaseContract(address, this.interface, this.runner, sentTx);
  }
  /**
   *  Return a new **ContractFactory** with the same ABI and bytecode,
   *  but connected to %%runner%%.
   */
  connect(runner) {
    return new ContractFactory(this.interface, this.bytecode, runner);
  }
  /**
   *  Create a new **ContractFactory** from the standard Solidity JSON output.
   */
  static fromSolidity(output, runner) {
    assertArgument(output != null, "bad compiler output", "output", output);
    if (typeof output === "string") {
      output = JSON.parse(output);
    }
    const abi = output.abi;
    let bytecode = "";
    if (output.bytecode) {
      bytecode = output.bytecode;
    } else if (output.evm && output.evm.bytecode) {
      bytecode = output.evm.bytecode;
    }
    return new this(abi, bytecode, runner);
  }
}
const shown = /* @__PURE__ */ new Set();
function showThrottleMessage(service) {
  if (shown.has(service)) {
    return;
  }
  shown.add(service);
  console.log("========= NOTICE =========");
  console.log(`Request-Rate Exceeded for ${service} (this message will not be repeated)`);
  console.log("");
  console.log("The default API keys for each service are provided as a highly-throttled,");
  console.log("community resource for low-traffic projects and early prototyping.");
  console.log("");
  console.log("While your application will continue to function, we highly recommended");
  console.log("signing up for your own API keys to improve performance, increase your");
  console.log("request rate/limit and enable other perks, such as metrics and advanced APIs.");
  console.log("");
  console.log("For more details: https://docs.ethers.org/api-keys/");
  console.log("==========================");
}
const defaultApiKey$1 = "9f7d929b018cdffb338517efa06f58359e86ff1ffd350bc889738523659e7972";
function getHost$5(name) {
  switch (name) {
    case "mainnet":
      return "rpc.ankr.com/eth";
    case "goerli":
      return "rpc.ankr.com/eth_goerli";
    case "sepolia":
      return "rpc.ankr.com/eth_sepolia";
    case "arbitrum":
      return "rpc.ankr.com/arbitrum";
    case "base":
      return "rpc.ankr.com/base";
    case "base-goerli":
      return "rpc.ankr.com/base_goerli";
    case "base-sepolia":
      return "rpc.ankr.com/base_sepolia";
    case "bnb":
      return "rpc.ankr.com/bsc";
    case "bnbt":
      return "rpc.ankr.com/bsc_testnet_chapel";
    case "matic":
      return "rpc.ankr.com/polygon";
    case "matic-mumbai":
      return "rpc.ankr.com/polygon_mumbai";
    case "optimism":
      return "rpc.ankr.com/optimism";
    case "optimism-goerli":
      return "rpc.ankr.com/optimism_testnet";
    case "optimism-sepolia":
      return "rpc.ankr.com/optimism_sepolia";
  }
  assertArgument(false, "unsupported network", "network", name);
}
class AnkrProvider extends JsonRpcProvider {
  /**
   *  Create a new **AnkrProvider**.
   *
   *  By default connecting to ``mainnet`` with a highly throttled
   *  API key.
   */
  constructor(_network, apiKey) {
    if (_network == null) {
      _network = "mainnet";
    }
    const network = Network.from(_network);
    if (apiKey == null) {
      apiKey = defaultApiKey$1;
    }
    const options = { polling: true, staticNetwork: network };
    const request = AnkrProvider.getRequest(network, apiKey);
    super(request, network, options);
    /**
     *  The API key for the Ankr connection.
     */
    __publicField(this, "apiKey");
    defineProperties(this, { apiKey });
  }
  _getProvider(chainId) {
    try {
      return new AnkrProvider(chainId, this.apiKey);
    } catch (error) {
    }
    return super._getProvider(chainId);
  }
  /**
   *  Returns a prepared request for connecting to %%network%% with
   *  %%apiKey%%.
   */
  static getRequest(network, apiKey) {
    if (apiKey == null) {
      apiKey = defaultApiKey$1;
    }
    const request = new FetchRequest(`https://${getHost$5(network.name)}/${apiKey}`);
    request.allowGzip = true;
    if (apiKey === defaultApiKey$1) {
      request.retryFunc = async (request2, response, attempt) => {
        showThrottleMessage("AnkrProvider");
        return true;
      };
    }
    return request;
  }
  getRpcError(payload, error) {
    if (payload.method === "eth_sendRawTransaction") {
      if (error && error.error && error.error.message === "INTERNAL_ERROR: could not replace existing tx") {
        error.error.message = "replacement transaction underpriced";
      }
    }
    return super.getRpcError(payload, error);
  }
  isCommunityResource() {
    return this.apiKey === defaultApiKey$1;
  }
}
const defaultApiKey = "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC";
function getHost$4(name) {
  switch (name) {
    case "mainnet":
      return "eth-mainnet.alchemyapi.io";
    case "goerli":
      return "eth-goerli.g.alchemy.com";
    case "sepolia":
      return "eth-sepolia.g.alchemy.com";
    case "arbitrum":
      return "arb-mainnet.g.alchemy.com";
    case "arbitrum-goerli":
      return "arb-goerli.g.alchemy.com";
    case "arbitrum-sepolia":
      return "arb-sepolia.g.alchemy.com";
    case "base":
      return "base-mainnet.g.alchemy.com";
    case "base-goerli":
      return "base-goerli.g.alchemy.com";
    case "base-sepolia":
      return "base-sepolia.g.alchemy.com";
    case "matic":
      return "polygon-mainnet.g.alchemy.com";
    case "matic-amoy":
      return "polygon-amoy.g.alchemy.com";
    case "matic-mumbai":
      return "polygon-mumbai.g.alchemy.com";
    case "optimism":
      return "opt-mainnet.g.alchemy.com";
    case "optimism-goerli":
      return "opt-goerli.g.alchemy.com";
    case "optimism-sepolia":
      return "opt-sepolia.g.alchemy.com";
  }
  assertArgument(false, "unsupported network", "network", name);
}
class AlchemyProvider extends JsonRpcProvider {
  constructor(_network, apiKey) {
    if (_network == null) {
      _network = "mainnet";
    }
    const network = Network.from(_network);
    if (apiKey == null) {
      apiKey = defaultApiKey;
    }
    const request = AlchemyProvider.getRequest(network, apiKey);
    super(request, network, { staticNetwork: network });
    __publicField(this, "apiKey");
    defineProperties(this, { apiKey });
  }
  _getProvider(chainId) {
    try {
      return new AlchemyProvider(chainId, this.apiKey);
    } catch (error) {
    }
    return super._getProvider(chainId);
  }
  async _perform(req) {
    if (req.method === "getTransactionResult") {
      const { trace, tx } = await resolveProperties({
        trace: this.send("trace_transaction", [req.hash]),
        tx: this.getTransaction(req.hash)
      });
      if (trace == null || tx == null) {
        return null;
      }
      let data;
      let error = false;
      try {
        data = trace[0].result.output;
        error = trace[0].error === "Reverted";
      } catch (error2) {
      }
      if (data) {
        assert(!error, "an error occurred during transaction executions", "CALL_EXCEPTION", {
          action: "getTransactionResult",
          data,
          reason: null,
          transaction: tx,
          invocation: null,
          revert: null
          // @TODO
        });
        return data;
      }
      assert(false, "could not parse trace result", "BAD_DATA", { value: trace });
    }
    return await super._perform(req);
  }
  isCommunityResource() {
    return this.apiKey === defaultApiKey;
  }
  static getRequest(network, apiKey) {
    if (apiKey == null) {
      apiKey = defaultApiKey;
    }
    const request = new FetchRequest(`https://${getHost$4(network.name)}/v2/${apiKey}`);
    request.allowGzip = true;
    if (apiKey === defaultApiKey) {
      request.retryFunc = async (request2, response, attempt) => {
        showThrottleMessage("alchemy");
        return true;
      };
    }
    return request;
  }
}
function getApiKey(name) {
  switch (name) {
    case "mainnet":
      return "39f1d67cedf8b7831010a665328c9197";
    case "arbitrum":
      return "0550c209db33c3abf4cc927e1e18cea1";
    case "bnb":
      return "98b5a77e531614387366f6fc5da097f8";
    case "matic":
      return "cd9d4d70377471aa7c142ec4a4205249";
  }
  assertArgument(false, "unsupported network", "network", name);
}
function getHost$3(name) {
  switch (name) {
    case "mainnet":
      return "ethereum-mainnet.core.chainstack.com";
    case "arbitrum":
      return "arbitrum-mainnet.core.chainstack.com";
    case "bnb":
      return "bsc-mainnet.core.chainstack.com";
    case "matic":
      return "polygon-mainnet.core.chainstack.com";
  }
  assertArgument(false, "unsupported network", "network", name);
}
class ChainstackProvider extends JsonRpcProvider {
  /**
   *  Creates a new **ChainstackProvider**.
   */
  constructor(_network, apiKey) {
    if (_network == null) {
      _network = "mainnet";
    }
    const network = Network.from(_network);
    if (apiKey == null) {
      apiKey = getApiKey(network.name);
    }
    const request = ChainstackProvider.getRequest(network, apiKey);
    super(request, network, { staticNetwork: network });
    /**
     *  The API key for the Chainstack connection.
     */
    __publicField(this, "apiKey");
    defineProperties(this, { apiKey });
  }
  _getProvider(chainId) {
    try {
      return new ChainstackProvider(chainId, this.apiKey);
    } catch (error) {
    }
    return super._getProvider(chainId);
  }
  isCommunityResource() {
    return this.apiKey === getApiKey(this._network.name);
  }
  /**
   *  Returns a prepared request for connecting to %%network%%
   *  with %%apiKey%% and %%projectSecret%%.
   */
  static getRequest(network, apiKey) {
    if (apiKey == null) {
      apiKey = getApiKey(network.name);
    }
    const request = new FetchRequest(`https://${getHost$3(network.name)}/${apiKey}`);
    request.allowGzip = true;
    if (apiKey === getApiKey(network.name)) {
      request.retryFunc = async (request2, response, attempt) => {
        showThrottleMessage("ChainstackProvider");
        return true;
      };
    }
    return request;
  }
}
class CloudflareProvider extends JsonRpcProvider {
  constructor(_network) {
    if (_network == null) {
      _network = "mainnet";
    }
    const network = Network.from(_network);
    assertArgument(network.name === "mainnet", "unsupported network", "network", _network);
    super("https://cloudflare-eth.com/", network, { staticNetwork: network });
  }
}
const THROTTLE = 2e3;
function isPromise(value) {
  return value && typeof value.then === "function";
}
const EtherscanPluginId = "org.ethers.plugins.provider.Etherscan";
class EtherscanPlugin extends NetworkPlugin {
  /**
   *  Creates a new **EtherscanProvider** which will use
   *  %%baseUrl%%.
   */
  constructor(baseUrl) {
    super(EtherscanPluginId);
    /**
     *  The Etherscan API base URL.
     */
    __publicField(this, "baseUrl");
    defineProperties(this, { baseUrl });
  }
  clone() {
    return new EtherscanPlugin(this.baseUrl);
  }
}
const skipKeys = ["enableCcipRead"];
let nextId = 1;
class EtherscanProvider extends AbstractProvider {
  /**
   *  Creates a new **EtherscanBaseProvider**.
   */
  constructor(_network, _apiKey) {
    const apiKey = _apiKey != null ? _apiKey : null;
    super();
    /**
     *  The connected network.
     */
    __publicField(this, "network");
    /**
     *  The API key or null if using the community provided bandwidth.
     */
    __publicField(this, "apiKey");
    __privateAdd(this, _plugin);
    const network = Network.from(_network);
    __privateSet(this, _plugin, network.getPlugin(EtherscanPluginId));
    defineProperties(this, { apiKey, network });
  }
  /**
   *  Returns the base URL.
   *
   *  If an [[EtherscanPlugin]] is configured on the
   *  [[EtherscanBaseProvider_network]], returns the plugin's
   *  baseUrl.
   *
   *  Deprecated; for Etherscan v2 the base is no longer a simply
   *  host, but instead a URL including a chainId parameter. Changing
   *  this to return a URL prefix could break some libraries, so it
   *  is left intact but will be removed in the future as it is unused.
   */
  getBaseUrl() {
    if (__privateGet(this, _plugin)) {
      return __privateGet(this, _plugin).baseUrl;
    }
    switch (this.network.name) {
      case "mainnet":
        return "https://api.etherscan.io";
      case "goerli":
        return "https://api-goerli.etherscan.io";
      case "sepolia":
        return "https://api-sepolia.etherscan.io";
      case "holesky":
        return "https://api-holesky.etherscan.io";
      case "arbitrum":
        return "https://api.arbiscan.io";
      case "arbitrum-goerli":
        return "https://api-goerli.arbiscan.io";
      case "base":
        return "https://api.basescan.org";
      case "base-sepolia":
        return "https://api-sepolia.basescan.org";
      case "bnb":
        return "https://api.bscscan.com";
      case "bnbt":
        return "https://api-testnet.bscscan.com";
      case "matic":
        return "https://api.polygonscan.com";
      case "matic-amoy":
        return "https://api-amoy.polygonscan.com";
      case "matic-mumbai":
        return "https://api-testnet.polygonscan.com";
      case "optimism":
        return "https://api-optimistic.etherscan.io";
      case "optimism-goerli":
        return "https://api-goerli-optimistic.etherscan.io";
    }
    assertArgument(false, "unsupported network", "network", this.network);
  }
  /**
   *  Returns the URL for the %%module%% and %%params%%.
   */
  getUrl(module, params) {
    let query = Object.keys(params).reduce((accum, key) => {
      const value = params[key];
      if (value != null) {
        accum += `&${key}=${value}`;
      }
      return accum;
    }, "");
    if (this.apiKey) {
      query += `&apikey=${this.apiKey}`;
    }
    return `https://api.etherscan.io/v2/api?chainid=${this.network.chainId}&module=${module}${query}`;
  }
  /**
   *  Returns the URL for using POST requests.
   */
  getPostUrl() {
    return `https://api.etherscan.io/v2/api?chainid=${this.network.chainId}`;
  }
  /**
   *  Returns the parameters for using POST requests.
   */
  getPostData(module, params) {
    params.module = module;
    params.apikey = this.apiKey;
    params.chainid = this.network.chainId;
    return params;
  }
  async detectNetwork() {
    return this.network;
  }
  /**
   *  Resolves to the result of calling %%module%% with %%params%%.
   *
   *  If %%post%%, the request is made as a POST request.
   */
  async fetch(module, params, post) {
    const id2 = nextId++;
    const url = post ? this.getPostUrl() : this.getUrl(module, params);
    const payload = post ? this.getPostData(module, params) : null;
    this.emit("debug", { action: "sendRequest", id: id2, url, payload });
    const request = new FetchRequest(url);
    request.setThrottleParams({ slotInterval: 1e3 });
    request.retryFunc = (req, resp, attempt) => {
      if (this.isCommunityResource()) {
        showThrottleMessage("Etherscan");
      }
      return Promise.resolve(true);
    };
    request.processFunc = async (request2, response2) => {
      const result2 = response2.hasBody() ? JSON.parse(toUtf8String(response2.body)) : {};
      const throttle = (typeof result2.result === "string" ? result2.result : "").toLowerCase().indexOf("rate limit") >= 0;
      if (module === "proxy") {
        if (result2 && result2.status == 0 && result2.message == "NOTOK" && throttle) {
          this.emit("debug", { action: "receiveError", id: id2, reason: "proxy-NOTOK", error: result2 });
          response2.throwThrottleError(result2.result, THROTTLE);
        }
      } else {
        if (throttle) {
          this.emit("debug", { action: "receiveError", id: id2, reason: "null result", error: result2.result });
          response2.throwThrottleError(result2.result, THROTTLE);
        }
      }
      return response2;
    };
    if (payload) {
      request.setHeader("content-type", "application/x-www-form-urlencoded; charset=UTF-8");
      request.body = Object.keys(payload).map((k) => `${k}=${payload[k]}`).join("&");
    }
    const response = await request.send();
    try {
      response.assertOk();
    } catch (error) {
      this.emit("debug", { action: "receiveError", id: id2, error, reason: "assertOk" });
      assert(false, "response error", "SERVER_ERROR", { request, response });
    }
    if (!response.hasBody()) {
      this.emit("debug", { action: "receiveError", id: id2, error: "missing body", reason: "null body" });
      assert(false, "missing response", "SERVER_ERROR", { request, response });
    }
    const result = JSON.parse(toUtf8String(response.body));
    if (module === "proxy") {
      if (result.jsonrpc != "2.0") {
        this.emit("debug", { action: "receiveError", id: id2, result, reason: "invalid JSON-RPC" });
        assert(false, "invalid JSON-RPC response (missing jsonrpc='2.0')", "SERVER_ERROR", { request, response, info: { result } });
      }
      if (result.error) {
        this.emit("debug", { action: "receiveError", id: id2, result, reason: "JSON-RPC error" });
        assert(false, "error response", "SERVER_ERROR", { request, response, info: { result } });
      }
      this.emit("debug", { action: "receiveRequest", id: id2, result });
      return result.result;
    } else {
      if (result.status == 0 && (result.message === "No records found" || result.message === "No transactions found")) {
        this.emit("debug", { action: "receiveRequest", id: id2, result });
        return result.result;
      }
      if (result.status != 1 || typeof result.message === "string" && !result.message.match(/^OK/)) {
        this.emit("debug", { action: "receiveError", id: id2, result });
        assert(false, "error response", "SERVER_ERROR", { request, response, info: { result } });
      }
      this.emit("debug", { action: "receiveRequest", id: id2, result });
      return result.result;
    }
  }
  /**
   *  Returns %%transaction%% normalized for the Etherscan API.
   */
  _getTransactionPostData(transaction) {
    const result = {};
    for (let key in transaction) {
      if (skipKeys.indexOf(key) >= 0) {
        continue;
      }
      if (transaction[key] == null) {
        continue;
      }
      let value = transaction[key];
      if (key === "type" && value === 0) {
        continue;
      }
      if (key === "blockTag" && value === "latest") {
        continue;
      }
      if ({ type: true, gasLimit: true, gasPrice: true, maxFeePerGs: true, maxPriorityFeePerGas: true, nonce: true, value: true }[key]) {
        value = toQuantity(value);
      } else if (key === "accessList") {
        value = "[" + accessListify(value).map((set) => {
          return `{address:"${set.address}",storageKeys:["${set.storageKeys.join('","')}"]}`;
        }).join(",") + "]";
      } else if (key === "blobVersionedHashes") {
        if (value.length === 0) {
          continue;
        }
        assert(false, "Etherscan API does not support blobVersionedHashes", "UNSUPPORTED_OPERATION", {
          operation: "_getTransactionPostData",
          info: { transaction }
        });
      } else {
        value = hexlify(value);
      }
      result[key] = value;
    }
    return result;
  }
  /**
   *  Throws the normalized Etherscan error.
   */
  _checkError(req, error, transaction) {
    let message = "";
    if (isError(error, "SERVER_ERROR")) {
      try {
        message = error.info.result.error.message;
      } catch (e) {
      }
      if (!message) {
        try {
          message = error.info.message;
        } catch (e) {
        }
      }
    }
    if (req.method === "estimateGas") {
      if (!message.match(/revert/i) && message.match(/insufficient funds/i)) {
        assert(false, "insufficient funds", "INSUFFICIENT_FUNDS", {
          transaction: req.transaction
        });
      }
    }
    if (req.method === "call" || req.method === "estimateGas") {
      if (message.match(/execution reverted/i)) {
        let data = "";
        try {
          data = error.info.result.error.data;
        } catch (error2) {
        }
        const e = AbiCoder.getBuiltinCallException(req.method, req.transaction, data);
        e.info = { request: req, error };
        throw e;
      }
    }
    if (message) {
      if (req.method === "broadcastTransaction") {
        const transaction2 = Transaction.from(req.signedTransaction);
        if (message.match(/replacement/i) && message.match(/underpriced/i)) {
          assert(false, "replacement fee too low", "REPLACEMENT_UNDERPRICED", {
            transaction: transaction2
          });
        }
        if (message.match(/insufficient funds/)) {
          assert(false, "insufficient funds for intrinsic transaction cost", "INSUFFICIENT_FUNDS", {
            transaction: transaction2
          });
        }
        if (message.match(/same hash was already imported|transaction nonce is too low|nonce too low/)) {
          assert(false, "nonce has already been used", "NONCE_EXPIRED", {
            transaction: transaction2
          });
        }
      }
    }
    throw error;
  }
  async _detectNetwork() {
    return this.network;
  }
  async _perform(req) {
    switch (req.method) {
      case "chainId":
        return this.network.chainId;
      case "getBlockNumber":
        return this.fetch("proxy", { action: "eth_blockNumber" });
      case "getGasPrice":
        return this.fetch("proxy", { action: "eth_gasPrice" });
      case "getPriorityFee":
        if (this.network.name === "mainnet") {
          return "1000000000";
        } else if (this.network.name === "optimism") {
          return "1000000";
        } else {
          throw new Error("fallback onto the AbstractProvider default");
        }
      case "getBalance":
        return this.fetch("account", {
          action: "balance",
          address: req.address,
          tag: req.blockTag
        });
      case "getTransactionCount":
        return this.fetch("proxy", {
          action: "eth_getTransactionCount",
          address: req.address,
          tag: req.blockTag
        });
      case "getCode":
        return this.fetch("proxy", {
          action: "eth_getCode",
          address: req.address,
          tag: req.blockTag
        });
      case "getStorage":
        return this.fetch("proxy", {
          action: "eth_getStorageAt",
          address: req.address,
          position: req.position,
          tag: req.blockTag
        });
      case "broadcastTransaction":
        return this.fetch("proxy", {
          action: "eth_sendRawTransaction",
          hex: req.signedTransaction
        }, true).catch((error) => {
          return this._checkError(req, error, req.signedTransaction);
        });
      case "getBlock":
        if ("blockTag" in req) {
          return this.fetch("proxy", {
            action: "eth_getBlockByNumber",
            tag: req.blockTag,
            boolean: req.includeTransactions ? "true" : "false"
          });
        }
        assert(false, "getBlock by blockHash not supported by Etherscan", "UNSUPPORTED_OPERATION", {
          operation: "getBlock(blockHash)"
        });
      case "getTransaction":
        return this.fetch("proxy", {
          action: "eth_getTransactionByHash",
          txhash: req.hash
        });
      case "getTransactionReceipt":
        return this.fetch("proxy", {
          action: "eth_getTransactionReceipt",
          txhash: req.hash
        });
      case "call": {
        if (req.blockTag !== "latest") {
          throw new Error("EtherscanProvider does not support blockTag for call");
        }
        const postData = this._getTransactionPostData(req.transaction);
        postData.module = "proxy";
        postData.action = "eth_call";
        try {
          return await this.fetch("proxy", postData, true);
        } catch (error) {
          return this._checkError(req, error, req.transaction);
        }
      }
      case "estimateGas": {
        const postData = this._getTransactionPostData(req.transaction);
        postData.module = "proxy";
        postData.action = "eth_estimateGas";
        try {
          return await this.fetch("proxy", postData, true);
        } catch (error) {
          return this._checkError(req, error, req.transaction);
        }
      }
    }
    return super._perform(req);
  }
  async getNetwork() {
    return this.network;
  }
  /**
   *  Resolves to the current price of ether.
   *
   *  This returns ``0`` on any network other than ``mainnet``.
   */
  async getEtherPrice() {
    if (this.network.name !== "mainnet") {
      return 0;
    }
    return parseFloat((await this.fetch("stats", { action: "ethprice" })).ethusd);
  }
  /**
   *  Resolves to a [Contract]] for %%address%%, using the
   *  Etherscan API to retreive the Contract ABI.
   */
  async getContract(_address) {
    let address = this._getAddress(_address);
    if (isPromise(address)) {
      address = await address;
    }
    try {
      const resp = await this.fetch("contract", {
        action: "getabi",
        address
      });
      const abi = JSON.parse(resp);
      return new Contract(address, abi, this);
    } catch (error) {
      return null;
    }
  }
  isCommunityResource() {
    return this.apiKey == null;
  }
}
_plugin = new WeakMap();
function getGlobal() {
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw new Error("unable to locate global object");
}
const _WebSocket = getGlobal().WebSocket;
class SocketSubscriber {
  /**
   *  Creates a new **SocketSubscriber** attached to %%provider%% listening
   *  to %%filter%%.
   */
  constructor(provider, filter) {
    __privateAdd(this, _provider);
    __privateAdd(this, _filter);
    __privateAdd(this, _filterId);
    __privateAdd(this, _paused);
    __privateAdd(this, _emitPromise);
    __privateSet(this, _provider, provider);
    __privateSet(this, _filter, JSON.stringify(filter));
    __privateSet(this, _filterId, null);
    __privateSet(this, _paused, null);
    __privateSet(this, _emitPromise, null);
  }
  /**
   *  The filter.
   */
  get filter() {
    return JSON.parse(__privateGet(this, _filter));
  }
  start() {
    __privateSet(this, _filterId, __privateGet(this, _provider).send("eth_subscribe", this.filter).then((filterId) => {
      __privateGet(this, _provider)._register(filterId, this);
      return filterId;
    }));
  }
  stop() {
    __privateGet(this, _filterId).then((filterId) => {
      if (__privateGet(this, _provider).destroyed) {
        return;
      }
      __privateGet(this, _provider).send("eth_unsubscribe", [filterId]);
    });
    __privateSet(this, _filterId, null);
  }
  // @TODO: pause should trap the current blockNumber, unsub, and on resume use getLogs
  //        and resume
  pause(dropWhilePaused) {
    assert(dropWhilePaused, "preserve logs while paused not supported by SocketSubscriber yet", "UNSUPPORTED_OPERATION", { operation: "pause(false)" });
    __privateSet(this, _paused, !!dropWhilePaused);
  }
  resume() {
    __privateSet(this, _paused, null);
  }
  /**
   *  @_ignore:
   */
  _handleMessage(message) {
    if (__privateGet(this, _filterId) == null) {
      return;
    }
    if (__privateGet(this, _paused) === null) {
      let emitPromise = __privateGet(this, _emitPromise);
      if (emitPromise == null) {
        emitPromise = this._emit(__privateGet(this, _provider), message);
      } else {
        emitPromise = emitPromise.then(async () => {
          await this._emit(__privateGet(this, _provider), message);
        });
      }
      __privateSet(this, _emitPromise, emitPromise.then(() => {
        if (__privateGet(this, _emitPromise) === emitPromise) {
          __privateSet(this, _emitPromise, null);
        }
      }));
    }
  }
  /**
   *  Sub-classes **must** override this to emit the events on the
   *  provider.
   */
  async _emit(provider, message) {
    throw new Error("sub-classes must implemente this; _emit");
  }
}
_provider = new WeakMap();
_filter = new WeakMap();
_filterId = new WeakMap();
_paused = new WeakMap();
_emitPromise = new WeakMap();
class SocketBlockSubscriber extends SocketSubscriber {
  /**
   *  @_ignore:
   */
  constructor(provider) {
    super(provider, ["newHeads"]);
  }
  async _emit(provider, message) {
    provider.emit("block", parseInt(message.number));
  }
}
class SocketPendingSubscriber extends SocketSubscriber {
  /**
   *  @_ignore:
   */
  constructor(provider) {
    super(provider, ["newPendingTransactions"]);
  }
  async _emit(provider, message) {
    provider.emit("pending", message);
  }
}
class SocketEventSubscriber extends SocketSubscriber {
  /**
   *  @_ignore:
   */
  constructor(provider, filter) {
    super(provider, ["logs", filter]);
    __privateAdd(this, _logFilter);
    __privateSet(this, _logFilter, JSON.stringify(filter));
  }
  /**
   *  The filter.
   */
  get logFilter() {
    return JSON.parse(__privateGet(this, _logFilter));
  }
  async _emit(provider, message) {
    provider.emit(this.logFilter, provider._wrapLog(message, provider._network));
  }
}
_logFilter = new WeakMap();
class SocketProvider extends JsonRpcApiProvider {
  /**
   *  Creates a new **SocketProvider** connected to %%network%%.
   *
   *  If unspecified, the network will be discovered.
   */
  constructor(network, _options) {
    const options = Object.assign({}, _options != null ? _options : {});
    assertArgument(options.batchMaxCount == null || options.batchMaxCount === 1, "sockets-based providers do not support batches", "options.batchMaxCount", _options);
    options.batchMaxCount = 1;
    if (options.staticNetwork == null) {
      options.staticNetwork = true;
    }
    super(network, options);
    __privateAdd(this, _callbacks);
    // Maps each filterId to its subscriber
    __privateAdd(this, _subs);
    // If any events come in before a subscriber has finished
    // registering, queue them
    __privateAdd(this, _pending);
    __privateSet(this, _callbacks, /* @__PURE__ */ new Map());
    __privateSet(this, _subs, /* @__PURE__ */ new Map());
    __privateSet(this, _pending, /* @__PURE__ */ new Map());
  }
  // This value is only valid after _start has been called
  /*
  get _network(): Network {
      if (this.#network == null) {
          throw new Error("this shouldn't happen");
      }
      return this.#network.clone();
  }
  */
  _getSubscriber(sub) {
    switch (sub.type) {
      case "close":
        return new UnmanagedSubscriber("close");
      case "block":
        return new SocketBlockSubscriber(this);
      case "pending":
        return new SocketPendingSubscriber(this);
      case "event":
        return new SocketEventSubscriber(this, sub.filter);
      case "orphan":
        if (sub.filter.orphan === "drop-log") {
          return new UnmanagedSubscriber("drop-log");
        }
    }
    return super._getSubscriber(sub);
  }
  /**
   *  Register a new subscriber. This is used internalled by Subscribers
   *  and generally is unecessary unless extending capabilities.
   */
  _register(filterId, subscriber) {
    __privateGet(this, _subs).set(filterId, subscriber);
    const pending = __privateGet(this, _pending).get(filterId);
    if (pending) {
      for (const message of pending) {
        subscriber._handleMessage(message);
      }
      __privateGet(this, _pending).delete(filterId);
    }
  }
  async _send(payload) {
    assertArgument(!Array.isArray(payload), "WebSocket does not support batch send", "payload", payload);
    const promise = new Promise((resolve, reject) => {
      __privateGet(this, _callbacks).set(payload.id, { payload, resolve, reject });
    });
    await this._waitUntilReady();
    await this._write(JSON.stringify(payload));
    return [await promise];
  }
  // Sub-classes must call this once they are connected
  /*
      async _start(): Promise<void> {
          if (this.#ready) { return; }
  
          for (const { payload } of this.#callbacks.values()) {
              await this._write(JSON.stringify(payload));
          }
  
          this.#ready = (async function() {
              await super._start();
          })();
      }
      */
  /**
   *  Sub-classes **must** call this with messages received over their
   *  transport to be processed and dispatched.
   */
  async _processMessage(message) {
    const result = JSON.parse(message);
    if (result && typeof result === "object" && "id" in result) {
      const callback = __privateGet(this, _callbacks).get(result.id);
      if (callback == null) {
        this.emit("error", makeError("received result for unknown id", "UNKNOWN_ERROR", {
          reasonCode: "UNKNOWN_ID",
          result
        }));
        return;
      }
      __privateGet(this, _callbacks).delete(result.id);
      callback.resolve(result);
    } else if (result && result.method === "eth_subscription") {
      const filterId = result.params.subscription;
      const subscriber = __privateGet(this, _subs).get(filterId);
      if (subscriber) {
        subscriber._handleMessage(result.params.result);
      } else {
        let pending = __privateGet(this, _pending).get(filterId);
        if (pending == null) {
          pending = [];
          __privateGet(this, _pending).set(filterId, pending);
        }
        pending.push(result.params.result);
      }
    } else {
      this.emit("error", makeError("received unexpected message", "UNKNOWN_ERROR", {
        reasonCode: "UNEXPECTED_MESSAGE",
        result
      }));
      return;
    }
  }
  /**
   *  Sub-classes **must** override this to send %%message%% over their
   *  transport.
   */
  async _write(message) {
    throw new Error("sub-classes must override this");
  }
}
_callbacks = new WeakMap();
_subs = new WeakMap();
_pending = new WeakMap();
class WebSocketProvider extends SocketProvider {
  constructor(url, network, options) {
    super(network, options);
    __privateAdd(this, _connect);
    __privateAdd(this, _websocket);
    if (typeof url === "string") {
      __privateSet(this, _connect, () => {
        return new _WebSocket(url);
      });
      __privateSet(this, _websocket, __privateGet(this, _connect).call(this));
    } else if (typeof url === "function") {
      __privateSet(this, _connect, url);
      __privateSet(this, _websocket, url());
    } else {
      __privateSet(this, _connect, null);
      __privateSet(this, _websocket, url);
    }
    this.websocket.onopen = async () => {
      try {
        await this._start();
        this.resume();
      } catch (error) {
        console.log("failed to start WebsocketProvider", error);
      }
    };
    this.websocket.onmessage = (message) => {
      this._processMessage(message.data);
    };
  }
  get websocket() {
    if (__privateGet(this, _websocket) == null) {
      throw new Error("websocket closed");
    }
    return __privateGet(this, _websocket);
  }
  async _write(message) {
    this.websocket.send(message);
  }
  async destroy() {
    if (__privateGet(this, _websocket) != null) {
      __privateGet(this, _websocket).close();
      __privateSet(this, _websocket, null);
    }
    super.destroy();
  }
}
_connect = new WeakMap();
_websocket = new WeakMap();
const defaultProjectId = "84842078b09946638c03157f83405213";
function getHost$2(name) {
  switch (name) {
    case "mainnet":
      return "mainnet.infura.io";
    case "goerli":
      return "goerli.infura.io";
    case "sepolia":
      return "sepolia.infura.io";
    case "arbitrum":
      return "arbitrum-mainnet.infura.io";
    case "arbitrum-goerli":
      return "arbitrum-goerli.infura.io";
    case "arbitrum-sepolia":
      return "arbitrum-sepolia.infura.io";
    case "base":
      return "base-mainnet.infura.io";
    case "base-goerlia":
    case "base-goerli":
      return "base-goerli.infura.io";
    case "base-sepolia":
      return "base-sepolia.infura.io";
    case "bnb":
      return "bsc-mainnet.infura.io";
    case "bnbt":
      return "bsc-testnet.infura.io";
    case "linea":
      return "linea-mainnet.infura.io";
    case "linea-goerli":
      return "linea-goerli.infura.io";
    case "linea-sepolia":
      return "linea-sepolia.infura.io";
    case "matic":
      return "polygon-mainnet.infura.io";
    case "matic-amoy":
      return "polygon-amoy.infura.io";
    case "matic-mumbai":
      return "polygon-mumbai.infura.io";
    case "optimism":
      return "optimism-mainnet.infura.io";
    case "optimism-goerli":
      return "optimism-goerli.infura.io";
    case "optimism-sepolia":
      return "optimism-sepolia.infura.io";
  }
  assertArgument(false, "unsupported network", "network", name);
}
class InfuraWebSocketProvider extends WebSocketProvider {
  /**
   *  Creates a new **InfuraWebSocketProvider**.
   */
  constructor(network, projectId) {
    const provider = new InfuraProvider(network, projectId);
    const req = provider._getConnection();
    assert(!req.credentials, "INFURA WebSocket project secrets unsupported", "UNSUPPORTED_OPERATION", { operation: "InfuraProvider.getWebSocketProvider()" });
    const url = req.url.replace(/^http/i, "ws").replace("/v3/", "/ws/v3/");
    super(url, provider._network);
    /**
     *  The Project ID for the INFURA connection.
     */
    __publicField(this, "projectId");
    /**
     *  The Project Secret.
     *
     *  If null, no authenticated requests are made. This should not
     *  be used outside of private contexts.
     */
    __publicField(this, "projectSecret");
    defineProperties(this, {
      projectId: provider.projectId,
      projectSecret: provider.projectSecret
    });
  }
  isCommunityResource() {
    return this.projectId === defaultProjectId;
  }
}
class InfuraProvider extends JsonRpcProvider {
  /**
   *  Creates a new **InfuraProvider**.
   */
  constructor(_network, projectId, projectSecret) {
    if (_network == null) {
      _network = "mainnet";
    }
    const network = Network.from(_network);
    if (projectId == null) {
      projectId = defaultProjectId;
    }
    if (projectSecret == null) {
      projectSecret = null;
    }
    const request = InfuraProvider.getRequest(network, projectId, projectSecret);
    super(request, network, { staticNetwork: network });
    /**
     *  The Project ID for the INFURA connection.
     */
    __publicField(this, "projectId");
    /**
     *  The Project Secret.
     *
     *  If null, no authenticated requests are made. This should not
     *  be used outside of private contexts.
     */
    __publicField(this, "projectSecret");
    defineProperties(this, { projectId, projectSecret });
  }
  _getProvider(chainId) {
    try {
      return new InfuraProvider(chainId, this.projectId, this.projectSecret);
    } catch (error) {
    }
    return super._getProvider(chainId);
  }
  isCommunityResource() {
    return this.projectId === defaultProjectId;
  }
  /**
   *  Creates a new **InfuraWebSocketProvider**.
   */
  static getWebSocketProvider(network, projectId) {
    return new InfuraWebSocketProvider(network, projectId);
  }
  /**
   *  Returns a prepared request for connecting to %%network%%
   *  with %%projectId%% and %%projectSecret%%.
   */
  static getRequest(network, projectId, projectSecret) {
    if (projectId == null) {
      projectId = defaultProjectId;
    }
    if (projectSecret == null) {
      projectSecret = null;
    }
    const request = new FetchRequest(`https://${getHost$2(network.name)}/v3/${projectId}`);
    request.allowGzip = true;
    if (projectSecret) {
      request.setCredentials("", projectSecret);
    }
    if (projectId === defaultProjectId) {
      request.retryFunc = async (request2, response, attempt) => {
        showThrottleMessage("InfuraProvider");
        return true;
      };
    }
    return request;
  }
}
const defaultToken = "919b412a057b5e9c9b6dce193c5a60242d6efadb";
function getHost$1(name) {
  switch (name) {
    case "mainnet":
      return "ethers.quiknode.pro";
    case "goerli":
      return "ethers.ethereum-goerli.quiknode.pro";
    case "sepolia":
      return "ethers.ethereum-sepolia.quiknode.pro";
    case "holesky":
      return "ethers.ethereum-holesky.quiknode.pro";
    case "arbitrum":
      return "ethers.arbitrum-mainnet.quiknode.pro";
    case "arbitrum-goerli":
      return "ethers.arbitrum-goerli.quiknode.pro";
    case "arbitrum-sepolia":
      return "ethers.arbitrum-sepolia.quiknode.pro";
    case "base":
      return "ethers.base-mainnet.quiknode.pro";
    case "base-goerli":
      return "ethers.base-goerli.quiknode.pro";
    case "base-spolia":
      return "ethers.base-sepolia.quiknode.pro";
    case "bnb":
      return "ethers.bsc.quiknode.pro";
    case "bnbt":
      return "ethers.bsc-testnet.quiknode.pro";
    case "matic":
      return "ethers.matic.quiknode.pro";
    case "matic-mumbai":
      return "ethers.matic-testnet.quiknode.pro";
    case "optimism":
      return "ethers.optimism.quiknode.pro";
    case "optimism-goerli":
      return "ethers.optimism-goerli.quiknode.pro";
    case "optimism-sepolia":
      return "ethers.optimism-sepolia.quiknode.pro";
    case "xdai":
      return "ethers.xdai.quiknode.pro";
  }
  assertArgument(false, "unsupported network", "network", name);
}
class QuickNodeProvider extends JsonRpcProvider {
  /**
   *  Creates a new **QuickNodeProvider**.
   */
  constructor(_network, token) {
    if (_network == null) {
      _network = "mainnet";
    }
    const network = Network.from(_network);
    if (token == null) {
      token = defaultToken;
    }
    const request = QuickNodeProvider.getRequest(network, token);
    super(request, network, { staticNetwork: network });
    /**
     *  The API token.
     */
    __publicField(this, "token");
    defineProperties(this, { token });
  }
  _getProvider(chainId) {
    try {
      return new QuickNodeProvider(chainId, this.token);
    } catch (error) {
    }
    return super._getProvider(chainId);
  }
  isCommunityResource() {
    return this.token === defaultToken;
  }
  /**
   *  Returns a new request prepared for %%network%% and the
   *  %%token%%.
   */
  static getRequest(network, token) {
    if (token == null) {
      token = defaultToken;
    }
    const request = new FetchRequest(`https://${getHost$1(network.name)}/${token}`);
    request.allowGzip = true;
    if (token === defaultToken) {
      request.retryFunc = async (request2, response, attempt) => {
        showThrottleMessage("QuickNodeProvider");
        return true;
      };
    }
    return request;
  }
}
const BN_1 = BigInt("1");
const BN_2 = BigInt("2");
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
}
function stall(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}
function getTime() {
  return (/* @__PURE__ */ new Date()).getTime();
}
function stringify(value) {
  return JSON.stringify(value, (key, value2) => {
    if (typeof value2 === "bigint") {
      return { type: "bigint", value: value2.toString() };
    }
    return value2;
  });
}
const defaultConfig = { stallTimeout: 400, priority: 1, weight: 1 };
const defaultState = {
  blockNumber: -2,
  requests: 0,
  lateResponses: 0,
  errorResponses: 0,
  outOfSync: -1,
  unsupportedEvents: 0,
  rollingDuration: 0,
  score: 0,
  _network: null,
  _updateNumber: null,
  _totalTime: 0,
  _lastFatalError: null,
  _lastFatalErrorTimestamp: 0
};
async function waitForSync(config, blockNumber) {
  while (config.blockNumber < 0 || config.blockNumber < blockNumber) {
    if (!config._updateNumber) {
      config._updateNumber = (async () => {
        try {
          const blockNumber2 = await config.provider.getBlockNumber();
          if (blockNumber2 > config.blockNumber) {
            config.blockNumber = blockNumber2;
          }
        } catch (error) {
          config.blockNumber = -2;
          config._lastFatalError = error;
          config._lastFatalErrorTimestamp = getTime();
        }
        config._updateNumber = null;
      })();
    }
    await config._updateNumber;
    config.outOfSync++;
    if (config._lastFatalError) {
      break;
    }
  }
}
function _normalize(value) {
  if (value == null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "[" + value.map(_normalize).join(",") + "]";
  }
  if (typeof value === "object" && typeof value.toJSON === "function") {
    return _normalize(value.toJSON());
  }
  switch (typeof value) {
    case "boolean":
    case "symbol":
      return value.toString();
    case "bigint":
    case "number":
      return BigInt(value).toString();
    case "string":
      return JSON.stringify(value);
    case "object": {
      const keys = Object.keys(value);
      keys.sort();
      return "{" + keys.map((k) => `${JSON.stringify(k)}:${_normalize(value[k])}`).join(",") + "}";
    }
  }
  console.log("Could not serialize", value);
  throw new Error("Hmm...");
}
function normalizeResult(method, value) {
  if ("error" in value) {
    const error = value.error;
    let tag;
    if (isError(error, "CALL_EXCEPTION")) {
      tag = _normalize(Object.assign({}, error, {
        shortMessage: void 0,
        reason: void 0,
        info: void 0
      }));
    } else {
      tag = _normalize(error);
    }
    return { tag, value: error };
  }
  const result = value.result;
  return { tag: _normalize(result), value: result };
}
function checkQuorum(quorum, results) {
  const tally = /* @__PURE__ */ new Map();
  for (const { value, tag, weight } of results) {
    const t = tally.get(tag) || { value, weight: 0 };
    t.weight += weight;
    tally.set(tag, t);
  }
  let best = null;
  for (const r of tally.values()) {
    if (r.weight >= quorum && (!best || r.weight > best.weight)) {
      best = r;
    }
  }
  if (best) {
    return best.value;
  }
  return void 0;
}
function getMedian(quorum, results) {
  let resultWeight = 0;
  const errorMap = /* @__PURE__ */ new Map();
  let bestError = null;
  const values = [];
  for (const { value, tag, weight } of results) {
    if (value instanceof Error) {
      const e = errorMap.get(tag) || { value, weight: 0 };
      e.weight += weight;
      errorMap.set(tag, e);
      if (bestError == null || e.weight > bestError.weight) {
        bestError = e;
      }
    } else {
      values.push(BigInt(value));
      resultWeight += weight;
    }
  }
  if (resultWeight < quorum) {
    if (bestError && bestError.weight >= quorum) {
      return bestError.value;
    }
    return void 0;
  }
  values.sort((a, b) => a < b ? -1 : b > a ? 1 : 0);
  const mid = Math.floor(values.length / 2);
  if (values.length % 2) {
    return values[mid];
  }
  return (values[mid - 1] + values[mid] + BN_1) / BN_2;
}
function getAnyResult(quorum, results) {
  const result = checkQuorum(quorum, results);
  if (result !== void 0) {
    return result;
  }
  for (const r of results) {
    if (r.value) {
      return r.value;
    }
  }
  return void 0;
}
function getFuzzyMode(quorum, results) {
  if (quorum === 1) {
    return getNumber(getMedian(quorum, results), "%internal");
  }
  const tally = /* @__PURE__ */ new Map();
  const add = (result, weight) => {
    const t = tally.get(result) || { result, weight: 0 };
    t.weight += weight;
    tally.set(result, t);
  };
  for (const { weight, value } of results) {
    const r = getNumber(value);
    add(r - 1, weight);
    add(r, weight);
    add(r + 1, weight);
  }
  let bestWeight = 0;
  let bestResult = void 0;
  for (const { weight, result } of tally.values()) {
    if (weight >= quorum && (weight > bestWeight || bestResult != null && weight === bestWeight && result > bestResult)) {
      bestWeight = weight;
      bestResult = result;
    }
  }
  return bestResult;
}
class FallbackProvider extends AbstractProvider {
  /**
   *  Creates a new **FallbackProvider** with %%providers%% connected to
   *  %%network%%.
   *
   *  If a [[Provider]] is included in %%providers%%, defaults are used
   *  for the configuration.
   */
  constructor(providers, network, options) {
    super(network, options);
    __privateAdd(this, _FallbackProvider_instances);
    /**
     *  The number of backends that must agree on a value before it is
     *  accpeted.
     */
    __publicField(this, "quorum");
    /**
     *  @_ignore:
     */
    __publicField(this, "eventQuorum");
    /**
     *  @_ignore:
     */
    __publicField(this, "eventWorkers");
    __privateAdd(this, _configs);
    __privateAdd(this, _height);
    __privateAdd(this, _initialSyncPromise);
    __privateSet(this, _configs, providers.map((p) => {
      if (p instanceof AbstractProvider) {
        return Object.assign({ provider: p }, defaultConfig, defaultState);
      } else {
        return Object.assign({}, defaultConfig, p, defaultState);
      }
    }));
    __privateSet(this, _height, -2);
    __privateSet(this, _initialSyncPromise, null);
    if (options && options.quorum != null) {
      this.quorum = options.quorum;
    } else {
      this.quorum = Math.ceil(__privateGet(this, _configs).reduce((accum, config) => {
        accum += config.weight;
        return accum;
      }, 0) / 2);
    }
    this.eventQuorum = 1;
    this.eventWorkers = 1;
    assertArgument(this.quorum <= __privateGet(this, _configs).reduce((a, c) => a + c.weight, 0), "quorum exceed provider weight", "quorum", this.quorum);
  }
  get providerConfigs() {
    return __privateGet(this, _configs).map((c) => {
      const result = Object.assign({}, c);
      for (const key in result) {
        if (key[0] === "_") {
          delete result[key];
        }
      }
      return result;
    });
  }
  async _detectNetwork() {
    return Network.from(getBigInt(await this._perform({ method: "chainId" })));
  }
  // @TODO: Add support to select providers to be the event subscriber
  //_getSubscriber(sub: Subscription): Subscriber {
  //    throw new Error("@TODO");
  //}
  /**
   *  Transforms a %%req%% into the correct method call on %%provider%%.
   */
  async _translatePerform(provider, req) {
    switch (req.method) {
      case "broadcastTransaction":
        return await provider.broadcastTransaction(req.signedTransaction);
      case "call":
        return await provider.call(Object.assign({}, req.transaction, { blockTag: req.blockTag }));
      case "chainId":
        return (await provider.getNetwork()).chainId;
      case "estimateGas":
        return await provider.estimateGas(req.transaction);
      case "getBalance":
        return await provider.getBalance(req.address, req.blockTag);
      case "getBlock": {
        const block = "blockHash" in req ? req.blockHash : req.blockTag;
        return await provider.getBlock(block, req.includeTransactions);
      }
      case "getBlockNumber":
        return await provider.getBlockNumber();
      case "getCode":
        return await provider.getCode(req.address, req.blockTag);
      case "getGasPrice":
        return (await provider.getFeeData()).gasPrice;
      case "getPriorityFee":
        return (await provider.getFeeData()).maxPriorityFeePerGas;
      case "getLogs":
        return await provider.getLogs(req.filter);
      case "getStorage":
        return await provider.getStorage(req.address, req.position, req.blockTag);
      case "getTransaction":
        return await provider.getTransaction(req.hash);
      case "getTransactionCount":
        return await provider.getTransactionCount(req.address, req.blockTag);
      case "getTransactionReceipt":
        return await provider.getTransactionReceipt(req.hash);
      case "getTransactionResult":
        return await provider.getTransactionResult(req.hash);
    }
  }
  async _perform(req) {
    if (req.method === "broadcastTransaction") {
      const results = __privateGet(this, _configs).map((c) => null);
      const broadcasts = __privateGet(this, _configs).map(async ({ provider, weight }, index) => {
        try {
          const result3 = await provider._perform(req);
          results[index] = Object.assign(normalizeResult(req.method, { result: result3 }), { weight });
        } catch (error) {
          results[index] = Object.assign(normalizeResult(req.method, { error }), { weight });
        }
      });
      while (true) {
        const done = results.filter((r) => r != null);
        for (const { value } of done) {
          if (!(value instanceof Error)) {
            return value;
          }
        }
        const result3 = checkQuorum(this.quorum, results.filter((r) => r != null));
        if (isError(result3, "INSUFFICIENT_FUNDS")) {
          throw result3;
        }
        const waiting = broadcasts.filter((b, i) => results[i] == null);
        if (waiting.length === 0) {
          break;
        }
        await Promise.race(waiting);
      }
      const result2 = getAnyResult(this.quorum, results);
      assert(result2 !== void 0, "problem multi-broadcasting", "SERVER_ERROR", {
        request: "%sub-requests",
        info: { request: req, results: results.map(stringify) }
      });
      if (result2 instanceof Error) {
        throw result2;
      }
      return result2;
    }
    await __privateMethod(this, _FallbackProvider_instances, initialSync_fn).call(this);
    const running = /* @__PURE__ */ new Set();
    let inflightQuorum = 0;
    while (true) {
      const runner = __privateMethod(this, _FallbackProvider_instances, addRunner_fn).call(this, running, req);
      if (runner == null) {
        break;
      }
      inflightQuorum += runner.config.weight;
      if (inflightQuorum >= this.quorum) {
        break;
      }
    }
    const result = await __privateMethod(this, _FallbackProvider_instances, waitForQuorum_fn).call(this, running, req);
    for (const runner of running) {
      if (runner.perform && runner.result == null) {
        runner.config.lateResponses++;
      }
    }
    return result;
  }
  async destroy() {
    for (const { provider } of __privateGet(this, _configs)) {
      provider.destroy();
    }
    super.destroy();
  }
}
_configs = new WeakMap();
_height = new WeakMap();
_initialSyncPromise = new WeakMap();
_FallbackProvider_instances = new WeakSet();
// Grab the next (random) config that is not already part of
// the running set
getNextConfig_fn = function(running) {
  const configs = Array.from(running).map((r) => r.config);
  const allConfigs = __privateGet(this, _configs).slice();
  shuffle(allConfigs);
  allConfigs.sort((a, b) => a.priority - b.priority);
  for (const config of allConfigs) {
    if (config._lastFatalError) {
      continue;
    }
    if (configs.indexOf(config) === -1) {
      return config;
    }
  }
  return null;
};
// Adds a new runner (if available) to running.
addRunner_fn = function(running, req) {
  const config = __privateMethod(this, _FallbackProvider_instances, getNextConfig_fn).call(this, running);
  if (config == null) {
    return null;
  }
  const runner = {
    config,
    result: null,
    didBump: false,
    perform: null,
    staller: null
  };
  const now = getTime();
  runner.perform = (async () => {
    try {
      config.requests++;
      const result = await this._translatePerform(config.provider, req);
      runner.result = { result };
    } catch (error) {
      config.errorResponses++;
      runner.result = { error };
    }
    const dt = getTime() - now;
    config._totalTime += dt;
    config.rollingDuration = 0.95 * config.rollingDuration + 0.05 * dt;
    runner.perform = null;
  })();
  runner.staller = (async () => {
    await stall(config.stallTimeout);
    runner.staller = null;
  })();
  running.add(runner);
  return runner;
};
initialSync_fn = async function() {
  let initialSync = __privateGet(this, _initialSyncPromise);
  if (!initialSync) {
    const promises = [];
    __privateGet(this, _configs).forEach((config) => {
      promises.push((async () => {
        await waitForSync(config, 0);
        if (!config._lastFatalError) {
          config._network = await config.provider.getNetwork();
        }
      })());
    });
    __privateSet(this, _initialSyncPromise, initialSync = (async () => {
      await Promise.all(promises);
      let chainId = null;
      for (const config of __privateGet(this, _configs)) {
        if (config._lastFatalError) {
          continue;
        }
        const network = config._network;
        if (chainId == null) {
          chainId = network.chainId;
        } else if (network.chainId !== chainId) {
          assert(false, "cannot mix providers on different networks", "UNSUPPORTED_OPERATION", {
            operation: "new FallbackProvider"
          });
        }
      }
    })());
  }
  await initialSync;
};
checkQuorum_fn = async function(running, req) {
  const results = [];
  for (const runner of running) {
    if (runner.result != null) {
      const { tag, value } = normalizeResult(req.method, runner.result);
      results.push({ tag, value, weight: runner.config.weight });
    }
  }
  if (results.reduce((a, r) => a + r.weight, 0) < this.quorum) {
    return void 0;
  }
  switch (req.method) {
    case "getBlockNumber": {
      if (__privateGet(this, _height) === -2) {
        __privateSet(this, _height, Math.ceil(getNumber(getMedian(this.quorum, __privateGet(this, _configs).filter((c) => !c._lastFatalError).map((c) => ({
          value: c.blockNumber,
          tag: getNumber(c.blockNumber).toString(),
          weight: c.weight
        }))))));
      }
      const mode = getFuzzyMode(this.quorum, results);
      if (mode === void 0) {
        return void 0;
      }
      if (mode > __privateGet(this, _height)) {
        __privateSet(this, _height, mode);
      }
      return __privateGet(this, _height);
    }
    case "getGasPrice":
    case "getPriorityFee":
    case "estimateGas":
      return getMedian(this.quorum, results);
    case "getBlock":
      if ("blockTag" in req && req.blockTag === "pending") {
        return getAnyResult(this.quorum, results);
      }
      return checkQuorum(this.quorum, results);
    case "call":
    case "chainId":
    case "getBalance":
    case "getTransactionCount":
    case "getCode":
    case "getStorage":
    case "getTransaction":
    case "getTransactionReceipt":
    case "getLogs":
      return checkQuorum(this.quorum, results);
    case "broadcastTransaction":
      return getAnyResult(this.quorum, results);
  }
  assert(false, "unsupported method", "UNSUPPORTED_OPERATION", {
    operation: `_perform(${stringify(req.method)})`
  });
};
waitForQuorum_fn = async function(running, req) {
  if (running.size === 0) {
    throw new Error("no runners?!");
  }
  const interesting = [];
  let newRunners = 0;
  for (const runner of running) {
    if (runner.perform) {
      interesting.push(runner.perform);
    }
    if (runner.staller) {
      interesting.push(runner.staller);
      continue;
    }
    if (runner.didBump) {
      continue;
    }
    runner.didBump = true;
    newRunners++;
  }
  const value = await __privateMethod(this, _FallbackProvider_instances, checkQuorum_fn).call(this, running, req);
  if (value !== void 0) {
    if (value instanceof Error) {
      throw value;
    }
    return value;
  }
  for (let i = 0; i < newRunners; i++) {
    __privateMethod(this, _FallbackProvider_instances, addRunner_fn).call(this, running, req);
  }
  assert(interesting.length > 0, "quorum not met", "SERVER_ERROR", {
    request: "%sub-requests",
    info: { request: req, results: Array.from(running).map((r) => stringify(r.result)) }
  });
  await Promise.race(interesting);
  return await __privateMethod(this, _FallbackProvider_instances, waitForQuorum_fn).call(this, running, req);
};
function isWebSocketLike(value) {
  return value && typeof value.send === "function" && typeof value.close === "function";
}
const Testnets = "goerli kovan sepolia classicKotti optimism-goerli arbitrum-goerli matic-mumbai bnbt".split(" ");
function getDefaultProvider(network, options) {
  if (options == null) {
    options = {};
  }
  const allowService = (name) => {
    if (options[name] === "-") {
      return false;
    }
    if (typeof options.exclusive === "string") {
      return name === options.exclusive;
    }
    if (Array.isArray(options.exclusive)) {
      return options.exclusive.indexOf(name) !== -1;
    }
    return true;
  };
  if (typeof network === "string" && network.match(/^https?:/)) {
    return new JsonRpcProvider(network);
  }
  if (typeof network === "string" && network.match(/^wss?:/) || isWebSocketLike(network)) {
    return new WebSocketProvider(network);
  }
  let staticNetwork = null;
  try {
    staticNetwork = Network.from(network);
  } catch (error) {
  }
  const providers = [];
  if (allowService("publicPolygon") && staticNetwork) {
    if (staticNetwork.name === "matic") {
      providers.push(new JsonRpcProvider("https://polygon-rpc.com/", staticNetwork, { staticNetwork }));
    } else if (staticNetwork.name === "matic-amoy") {
      providers.push(new JsonRpcProvider("https://rpc-amoy.polygon.technology/", staticNetwork, { staticNetwork }));
    }
  }
  if (allowService("alchemy")) {
    try {
      providers.push(new AlchemyProvider(network, options.alchemy));
    } catch (error) {
    }
  }
  if (allowService("ankr") && options.ankr != null) {
    try {
      providers.push(new AnkrProvider(network, options.ankr));
    } catch (error) {
    }
  }
  if (allowService("chainstack")) {
    try {
      providers.push(new ChainstackProvider(network, options.chainstack));
    } catch (error) {
    }
  }
  if (allowService("cloudflare")) {
    try {
      providers.push(new CloudflareProvider(network));
    } catch (error) {
    }
  }
  if (allowService("etherscan")) {
    try {
      providers.push(new EtherscanProvider(network, options.etherscan));
    } catch (error) {
    }
  }
  if (allowService("infura")) {
    try {
      let projectId = options.infura;
      let projectSecret = void 0;
      if (typeof projectId === "object") {
        projectSecret = projectId.projectSecret;
        projectId = projectId.projectId;
      }
      providers.push(new InfuraProvider(network, projectId, projectSecret));
    } catch (error) {
    }
  }
  if (allowService("quicknode")) {
    try {
      let token = options.quicknode;
      providers.push(new QuickNodeProvider(network, token));
    } catch (error) {
    }
  }
  assert(providers.length, "unsupported default network", "UNSUPPORTED_OPERATION", {
    operation: "getDefaultProvider"
  });
  if (providers.length === 1) {
    return providers[0];
  }
  let quorum = Math.floor(providers.length / 2);
  if (quorum > 2) {
    quorum = 2;
  }
  if (staticNetwork && Testnets.indexOf(staticNetwork.name) !== -1) {
    quorum = 1;
  }
  if (options && options.quorum) {
    quorum = options.quorum;
  }
  return new FallbackProvider(providers, void 0, { quorum });
}
const _NonceManager = class _NonceManager extends AbstractSigner {
  /**
   *  Creates a new **NonceManager** to manage %%signer%%.
   */
  constructor(signer) {
    super(signer.provider);
    /**
     *  The Signer being managed.
     */
    __publicField(this, "signer");
    __privateAdd(this, _noncePromise);
    __privateAdd(this, _delta);
    defineProperties(this, { signer });
    __privateSet(this, _noncePromise, null);
    __privateSet(this, _delta, 0);
  }
  async getAddress() {
    return this.signer.getAddress();
  }
  connect(provider) {
    return new _NonceManager(this.signer.connect(provider));
  }
  async getNonce(blockTag) {
    if (blockTag === "pending") {
      if (__privateGet(this, _noncePromise) == null) {
        __privateSet(this, _noncePromise, super.getNonce("pending"));
      }
      const delta = __privateGet(this, _delta);
      return await __privateGet(this, _noncePromise) + delta;
    }
    return super.getNonce(blockTag);
  }
  /**
   *  Manually increment the nonce. This may be useful when managng
   *  offline transactions.
   */
  increment() {
    __privateWrapper(this, _delta)._++;
  }
  /**
   *  Resets the nonce, causing the **NonceManager** to reload the current
   *  nonce from the blockchain on the next transaction.
   */
  reset() {
    __privateSet(this, _delta, 0);
    __privateSet(this, _noncePromise, null);
  }
  async sendTransaction(tx) {
    const noncePromise = this.getNonce("pending");
    this.increment();
    tx = await this.signer.populateTransaction(tx);
    tx.nonce = await noncePromise;
    return await this.signer.sendTransaction(tx);
  }
  signTransaction(tx) {
    return this.signer.signTransaction(tx);
  }
  signMessage(message) {
    return this.signer.signMessage(message);
  }
  signTypedData(domain, types, value) {
    return this.signer.signTypedData(domain, types, value);
  }
};
_noncePromise = new WeakMap();
_delta = new WeakMap();
let NonceManager = _NonceManager;
const _BrowserProvider = class _BrowserProvider extends JsonRpcApiPollingProvider {
  /**
   *  Connect to the %%ethereum%% provider, optionally forcing the
   *  %%network%%.
   */
  constructor(ethereum, network, _options) {
    const options = Object.assign({}, _options != null ? _options : {}, { batchMaxCount: 1 });
    assertArgument(ethereum && ethereum.request, "invalid EIP-1193 provider", "ethereum", ethereum);
    super(network, options);
    __privateAdd(this, _request);
    __privateAdd(this, _providerInfo);
    __privateSet(this, _providerInfo, null);
    if (_options && _options.providerInfo) {
      __privateSet(this, _providerInfo, _options.providerInfo);
    }
    __privateSet(this, _request, async (method, params) => {
      const payload = { method, params };
      this.emit("debug", { action: "sendEip1193Request", payload });
      try {
        const result = await ethereum.request(payload);
        this.emit("debug", { action: "receiveEip1193Result", result });
        return result;
      } catch (e) {
        const error = new Error(e.message);
        error.code = e.code;
        error.data = e.data;
        error.payload = payload;
        this.emit("debug", { action: "receiveEip1193Error", error });
        throw error;
      }
    });
  }
  get providerInfo() {
    return __privateGet(this, _providerInfo);
  }
  async send(method, params) {
    await this._start();
    return await super.send(method, params);
  }
  async _send(payload) {
    assertArgument(!Array.isArray(payload), "EIP-1193 does not support batch request", "payload", payload);
    try {
      const result = await __privateGet(this, _request).call(this, payload.method, payload.params || []);
      return [{ id: payload.id, result }];
    } catch (e) {
      return [{
        id: payload.id,
        error: { code: e.code, data: e.data, message: e.message }
      }];
    }
  }
  getRpcError(payload, error) {
    error = JSON.parse(JSON.stringify(error));
    switch (error.error.code || -1) {
      case 4001:
        error.error.message = `ethers-user-denied: ${error.error.message}`;
        break;
      case 4200:
        error.error.message = `ethers-unsupported: ${error.error.message}`;
        break;
    }
    return super.getRpcError(payload, error);
  }
  /**
   *  Resolves to ``true`` if the provider manages the %%address%%.
   */
  async hasSigner(address) {
    if (address == null) {
      address = 0;
    }
    const accounts = await this.send("eth_accounts", []);
    if (typeof address === "number") {
      return accounts.length > address;
    }
    address = address.toLowerCase();
    return accounts.filter((a) => a.toLowerCase() === address).length !== 0;
  }
  async getSigner(address) {
    if (address == null) {
      address = 0;
    }
    if (!await this.hasSigner(address)) {
      try {
        await __privateGet(this, _request).call(this, "eth_requestAccounts", []);
      } catch (error) {
        const payload = error.payload;
        throw this.getRpcError(payload, { id: payload.id, error });
      }
    }
    return await super.getSigner(address);
  }
  /**
   *  Discover and connect to a Provider in the Browser using the
   *  [[link-eip-6963]] discovery mechanism. If no providers are
   *  present, ``null`` is resolved.
   */
  static async discover(options) {
    if (options == null) {
      options = {};
    }
    if (options.provider) {
      return new _BrowserProvider(options.provider);
    }
    const context = options.window ? options.window : typeof window !== "undefined" ? window : null;
    if (context == null) {
      return null;
    }
    const anyProvider = options.anyProvider;
    if (anyProvider && context.ethereum) {
      return new _BrowserProvider(context.ethereum);
    }
    if (!("addEventListener" in context && "dispatchEvent" in context && "removeEventListener" in context)) {
      return null;
    }
    const timeout = options.timeout ? options.timeout : 300;
    if (timeout === 0) {
      return null;
    }
    return await new Promise((resolve, reject) => {
      let found = [];
      const addProvider = (event) => {
        found.push(event.detail);
        if (anyProvider) {
          finalize();
        }
      };
      const finalize = () => {
        clearTimeout(timer);
        if (found.length) {
          if (options && options.filter) {
            const filtered = options.filter(found.map((i) => Object.assign({}, i.info)));
            if (filtered == null) {
              resolve(null);
            } else if (filtered instanceof _BrowserProvider) {
              resolve(filtered);
            } else {
              let match = null;
              if (filtered.uuid) {
                const matches = found.filter((f) => filtered.uuid === f.info.uuid);
                match = matches[0];
              }
              if (match) {
                const { provider, info } = match;
                resolve(new _BrowserProvider(provider, void 0, {
                  providerInfo: info
                }));
              } else {
                reject(makeError("filter returned unknown info", "UNSUPPORTED_OPERATION", {
                  value: filtered
                }));
              }
            }
          } else {
            const { provider, info } = found[0];
            resolve(new _BrowserProvider(provider, void 0, {
              providerInfo: info
            }));
          }
        } else {
          resolve(null);
        }
        context.removeEventListener("eip6963:announceProvider", addProvider);
      };
      const timer = setTimeout(() => {
        finalize();
      }, timeout);
      context.addEventListener("eip6963:announceProvider", addProvider);
      context.dispatchEvent(new Event("eip6963:requestProvider"));
    });
  }
};
_request = new WeakMap();
_providerInfo = new WeakMap();
let BrowserProvider = _BrowserProvider;
function getUrl(name) {
  switch (name) {
    case "mainnet":
      return "https://eth.blockscout.com/api/eth-rpc";
    case "sepolia":
      return "https://eth-sepolia.blockscout.com/api/eth-rpc";
    case "holesky":
      return "https://eth-holesky.blockscout.com/api/eth-rpc";
    case "classic":
      return "https://etc.blockscout.com/api/eth-rpc";
    case "arbitrum":
      return "https://arbitrum.blockscout.com/api/eth-rpc";
    case "base":
      return "https://base.blockscout.com/api/eth-rpc";
    case "base-sepolia":
      return "https://base-sepolia.blockscout.com/api/eth-rpc";
    case "matic":
      return "https://polygon.blockscout.com/api/eth-rpc";
    case "optimism":
      return "https://optimism.blockscout.com/api/eth-rpc";
    case "optimism-sepolia":
      return "https://optimism-sepolia.blockscout.com/api/eth-rpc";
    case "xdai":
      return "https://gnosis.blockscout.com/api/eth-rpc";
  }
  assertArgument(false, "unsupported network", "network", name);
}
class BlockscoutProvider extends JsonRpcProvider {
  /**
   *  Creates a new **BlockscoutProvider**.
   */
  constructor(_network, apiKey) {
    if (_network == null) {
      _network = "mainnet";
    }
    const network = Network.from(_network);
    if (apiKey == null) {
      apiKey = null;
    }
    const request = BlockscoutProvider.getRequest(network);
    super(request, network, { staticNetwork: network });
    /**
     *  The API key.
     */
    __publicField(this, "apiKey");
    defineProperties(this, { apiKey });
  }
  _getProvider(chainId) {
    try {
      return new BlockscoutProvider(chainId, this.apiKey);
    } catch (error) {
    }
    return super._getProvider(chainId);
  }
  isCommunityResource() {
    return this.apiKey === null;
  }
  getRpcRequest(req) {
    const resp = super.getRpcRequest(req);
    if (resp && resp.method === "eth_estimateGas" && resp.args.length == 1) {
      resp.args = resp.args.slice();
      resp.args.push("latest");
    }
    return resp;
  }
  getRpcError(payload, _error) {
    const error = _error ? _error.error : null;
    if (error && error.code === -32015 && !isHexString(error.data || "", true)) {
      const panicCodes = {
        "assert(false)": "01",
        "arithmetic underflow or overflow": "11",
        "division or modulo by zero": "12",
        "out-of-bounds array access; popping on an empty array": "31",
        "out-of-bounds access of an array or bytesN": "32"
      };
      let panicCode = "";
      if (error.message === "VM execution error.") {
        panicCode = panicCodes[error.data] || "";
      } else if (panicCodes[error.message || ""]) {
        panicCode = panicCodes[error.message || ""];
      }
      if (panicCode) {
        error.message += ` (reverted: ${error.data})`;
        error.data = "0x4e487b7100000000000000000000000000000000000000000000000000000000000000" + panicCode;
      }
    } else if (error && error.code === -32e3) {
      if (error.message === "wrong transaction nonce") {
        error.message += " (nonce too low)";
      }
    }
    return super.getRpcError(payload, _error);
  }
  /**
   *  Returns a prepared request for connecting to %%network%%
   *  with %%apiKey%%.
   */
  static getRequest(network) {
    const request = new FetchRequest(getUrl(network.name));
    request.allowGzip = true;
    return request;
  }
}
const defaultApplicationId = "62e1ad51b37b8e00394bda3b";
function getHost(name) {
  switch (name) {
    case "mainnet":
      return "eth-mainnet.gateway.pokt.network";
    case "goerli":
      return "eth-goerli.gateway.pokt.network";
    case "matic":
      return "poly-mainnet.gateway.pokt.network";
    case "matic-mumbai":
      return "polygon-mumbai-rpc.gateway.pokt.network";
  }
  assertArgument(false, "unsupported network", "network", name);
}
class PocketProvider extends JsonRpcProvider {
  /**
   *  Create a new **PocketProvider**.
   *
   *  By default connecting to ``mainnet`` with a highly throttled
   *  API key.
   */
  constructor(_network, applicationId, applicationSecret) {
    if (_network == null) {
      _network = "mainnet";
    }
    const network = Network.from(_network);
    if (applicationId == null) {
      applicationId = defaultApplicationId;
    }
    if (applicationSecret == null) {
      applicationSecret = null;
    }
    const options = { staticNetwork: network };
    const request = PocketProvider.getRequest(network, applicationId, applicationSecret);
    super(request, network, options);
    /**
     *  The Application ID for the Pocket connection.
     */
    __publicField(this, "applicationId");
    /**
     *  The Application Secret for making authenticated requests
     *  to the Pocket connection.
     */
    __publicField(this, "applicationSecret");
    defineProperties(this, { applicationId, applicationSecret });
  }
  _getProvider(chainId) {
    try {
      return new PocketProvider(chainId, this.applicationId, this.applicationSecret);
    } catch (error) {
    }
    return super._getProvider(chainId);
  }
  /**
   *  Returns a prepared request for connecting to %%network%% with
   *  %%applicationId%%.
   */
  static getRequest(network, applicationId, applicationSecret) {
    if (applicationId == null) {
      applicationId = defaultApplicationId;
    }
    const request = new FetchRequest(`https://${getHost(network.name)}/v1/lb/${applicationId}`);
    request.allowGzip = true;
    if (applicationSecret) {
      request.setCredentials("", applicationSecret);
    }
    if (applicationId === defaultApplicationId) {
      request.retryFunc = async (request2, response, attempt) => {
        showThrottleMessage("PocketProvider");
        return true;
      };
    }
    return request;
  }
  isCommunityResource() {
    return this.applicationId === defaultApplicationId;
  }
}
const IpcSocketProvider = void 0;
const Base64 = ")!@#$%^&*(ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
function decodeBits(width, data) {
  const maxValue = (1 << width) - 1;
  const result = [];
  let accum = 0, bits = 0, flood = 0;
  for (let i = 0; i < data.length; i++) {
    accum = accum << 6 | Base64.indexOf(data[i]);
    bits += 6;
    while (bits >= width) {
      const value = accum >> bits - width;
      accum &= (1 << bits - width) - 1;
      bits -= width;
      if (value === 0) {
        flood += maxValue;
      } else {
        result.push(value + flood);
        flood = 0;
      }
    }
  }
  return result;
}
function decodeOwlA(data, accents) {
  let words = decodeOwl(data).join(",");
  accents.split(/,/g).forEach((accent) => {
    const match = accent.match(/^([a-z]*)([0-9]+)([0-9])(.*)$/);
    assertArgument(match !== null, "internal error parsing accents", "accents", accents);
    let posOffset = 0;
    const positions = decodeBits(parseInt(match[3]), match[4]);
    const charCode = parseInt(match[2]);
    const regex = new RegExp(`([${match[1]}])`, "g");
    words = words.replace(regex, (all, letter) => {
      const rem = --positions[posOffset];
      if (rem === 0) {
        letter = String.fromCharCode(letter.charCodeAt(0), charCode);
        posOffset++;
      }
      return letter;
    });
  });
  return words.split(",");
}
class WordlistOwlA extends WordlistOwl {
  /**
   *  Creates a new Wordlist for %%locale%% using the OWLA %%data%%
   *  and %%accent%% data and validated against the %%checksum%%.
   */
  constructor(locale, data, accent, checksum) {
    super(locale, data, checksum);
    __privateAdd(this, _accent);
    __privateSet(this, _accent, accent);
  }
  /**
   *  The OWLA-encoded accent data.
   */
  get _accent() {
    return __privateGet(this, _accent);
  }
  /**
   *  Decode all the words for the wordlist.
   */
  _decodeWords() {
    return decodeOwlA(this._data, this._accent);
  }
}
_accent = new WeakMap();
const wordlists = {
  en: LangEn.wordlist()
};
const ethers = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AbiCoder,
  AbstractProvider,
  AbstractSigner,
  AlchemyProvider,
  AnkrProvider,
  BaseContract,
  BaseWallet,
  Block,
  BlockscoutProvider,
  BrowserProvider,
  ChainstackProvider,
  CloudflareProvider,
  ConstructorFragment,
  Contract,
  ContractEventPayload,
  ContractFactory,
  ContractTransactionReceipt,
  ContractTransactionResponse,
  ContractUnknownEventPayload,
  EnsPlugin,
  EnsResolver,
  ErrorDescription,
  ErrorFragment,
  EtherSymbol,
  EtherscanPlugin,
  EtherscanProvider,
  EventFragment,
  EventLog,
  EventPayload,
  FallbackFragment,
  FallbackProvider,
  FeeData,
  FeeDataNetworkPlugin,
  FetchCancelSignal,
  FetchRequest,
  FetchResponse,
  FetchUrlFeeDataNetworkPlugin,
  FixedNumber,
  Fragment,
  FunctionFragment,
  GasCostPlugin,
  HDNodeVoidWallet,
  HDNodeWallet,
  Indexed,
  InfuraProvider,
  InfuraWebSocketProvider,
  Interface,
  IpcSocketProvider,
  JsonRpcApiProvider,
  JsonRpcProvider,
  JsonRpcSigner,
  LangEn,
  Log,
  LogDescription,
  MaxInt256,
  MaxUint256,
  MessagePrefix,
  MinInt256,
  Mnemonic,
  MulticoinProviderPlugin,
  N,
  NamedFragment,
  Network,
  NetworkPlugin,
  NonceManager,
  ParamType,
  PocketProvider,
  QuickNodeProvider,
  Result,
  Signature,
  SigningKey,
  SocketBlockSubscriber,
  SocketEventSubscriber,
  SocketPendingSubscriber,
  SocketProvider,
  SocketSubscriber,
  StructFragment,
  Transaction,
  TransactionDescription,
  TransactionReceipt,
  TransactionResponse,
  Typed,
  TypedDataEncoder,
  UndecodedEventLog,
  UnmanagedSubscriber,
  Utf8ErrorFuncs,
  VoidSigner,
  Wallet,
  WebSocketProvider,
  WeiPerEther,
  Wordlist,
  WordlistOwl,
  WordlistOwlA,
  ZeroAddress,
  ZeroHash,
  accessListify,
  assert,
  assertArgument,
  assertArgumentCount,
  assertNormalize,
  assertPrivate,
  authorizationify,
  checkResultErrors,
  computeAddress,
  computeHmac,
  concat,
  copyRequest,
  dataLength,
  dataSlice,
  decodeBase58,
  decodeBase64,
  decodeBytes32String,
  decodeRlp,
  decryptCrowdsaleJson,
  decryptKeystoreJson,
  decryptKeystoreJsonSync,
  defaultPath,
  defineProperties,
  dnsEncode,
  encodeBase58,
  encodeBase64,
  encodeBytes32String,
  encodeRlp,
  encryptKeystoreJson,
  encryptKeystoreJsonSync,
  ensNormalize,
  formatEther,
  formatUnits,
  fromTwos,
  getAccountPath,
  getAddress,
  getBigInt,
  getBytes,
  getBytesCopy,
  getCreate2Address,
  getCreateAddress,
  getDefaultProvider,
  getIcapAddress,
  getIndexedAccountPath,
  getNumber,
  getUint,
  hashAuthorization,
  hashMessage,
  hexlify,
  id,
  isAddress,
  isAddressable,
  isBytesLike,
  isCallException,
  isCrowdsaleJson,
  isError,
  isHexString,
  isKeystoreJson,
  isValidName,
  keccak256,
  lock,
  makeError,
  mask,
  namehash,
  parseEther,
  parseUnits,
  pbkdf2,
  randomBytes,
  recoverAddress,
  resolveAddress,
  resolveProperties,
  ripemd160,
  scrypt,
  scryptSync,
  sha256,
  sha512,
  showThrottleMessage,
  solidityPacked,
  solidityPackedKeccak256,
  solidityPackedSha256,
  stripZerosLeft,
  toBeArray,
  toBeHex,
  toBigInt,
  toNumber,
  toQuantity,
  toTwos,
  toUtf8Bytes,
  toUtf8CodePoints,
  toUtf8String,
  uuidV4,
  verifyAuthorization,
  verifyMessage,
  verifyTypedData,
  version,
  wordlists,
  zeroPadBytes,
  zeroPadValue
}, Symbol.toStringTag, { value: "Module" }));
export {
  AbiCoder,
  AbstractProvider,
  AbstractSigner,
  AlchemyProvider,
  AnkrProvider,
  BaseContract,
  BaseWallet,
  Block,
  BlockscoutProvider,
  BrowserProvider,
  ChainstackProvider,
  CloudflareProvider,
  ConstructorFragment,
  Contract,
  ContractEventPayload,
  ContractFactory,
  ContractTransactionReceipt,
  ContractTransactionResponse,
  ContractUnknownEventPayload,
  EnsPlugin,
  EnsResolver,
  ErrorDescription,
  ErrorFragment,
  EtherSymbol,
  EtherscanPlugin,
  EtherscanProvider,
  EventFragment,
  EventLog,
  EventPayload,
  FallbackFragment,
  FallbackProvider,
  FeeData,
  FeeDataNetworkPlugin,
  FetchCancelSignal,
  FetchRequest,
  FetchResponse,
  FetchUrlFeeDataNetworkPlugin,
  FixedNumber,
  Fragment,
  FunctionFragment,
  GasCostPlugin,
  HDNodeVoidWallet,
  HDNodeWallet,
  Indexed,
  InfuraProvider,
  InfuraWebSocketProvider,
  Interface,
  IpcSocketProvider,
  JsonRpcApiProvider,
  JsonRpcProvider,
  JsonRpcSigner,
  LangEn,
  Log,
  LogDescription,
  MaxInt256,
  MaxUint256,
  MessagePrefix,
  MinInt256,
  Mnemonic,
  MulticoinProviderPlugin,
  N,
  NamedFragment,
  Network,
  NetworkPlugin,
  NonceManager,
  ParamType,
  PocketProvider,
  QuickNodeProvider,
  Result,
  Signature,
  SigningKey,
  SocketBlockSubscriber,
  SocketEventSubscriber,
  SocketPendingSubscriber,
  SocketProvider,
  SocketSubscriber,
  StructFragment,
  Transaction,
  TransactionDescription,
  TransactionReceipt,
  TransactionResponse,
  Typed,
  TypedDataEncoder,
  UndecodedEventLog,
  UnmanagedSubscriber,
  Utf8ErrorFuncs,
  VoidSigner,
  Wallet,
  WebSocketProvider,
  WeiPerEther,
  Wordlist,
  WordlistOwl,
  WordlistOwlA,
  ZeroAddress,
  ZeroHash,
  accessListify,
  assert,
  assertArgument,
  assertArgumentCount,
  assertNormalize,
  assertPrivate,
  authorizationify,
  checkResultErrors,
  computeAddress,
  computeHmac,
  concat,
  copyRequest,
  dataLength,
  dataSlice,
  decodeBase58,
  decodeBase64,
  decodeBytes32String,
  decodeRlp,
  decryptCrowdsaleJson,
  decryptKeystoreJson,
  decryptKeystoreJsonSync,
  defaultPath,
  defineProperties,
  dnsEncode,
  encodeBase58,
  encodeBase64,
  encodeBytes32String,
  encodeRlp,
  encryptKeystoreJson,
  encryptKeystoreJsonSync,
  ensNormalize,
  ethers,
  formatEther,
  formatUnits,
  fromTwos,
  getAccountPath,
  getAddress,
  getBigInt,
  getBytes,
  getBytesCopy,
  getCreate2Address,
  getCreateAddress,
  getDefaultProvider,
  getIcapAddress,
  getIndexedAccountPath,
  getNumber,
  getUint,
  hashAuthorization,
  hashMessage,
  hexlify,
  id,
  isAddress,
  isAddressable,
  isBytesLike,
  isCallException,
  isCrowdsaleJson,
  isError,
  isHexString,
  isKeystoreJson,
  isValidName,
  keccak256,
  lock,
  makeError,
  mask,
  namehash,
  parseEther,
  parseUnits,
  pbkdf2,
  randomBytes,
  recoverAddress,
  resolveAddress,
  resolveProperties,
  ripemd160,
  scrypt,
  scryptSync,
  sha256,
  sha512,
  showThrottleMessage,
  solidityPacked,
  solidityPackedKeccak256,
  solidityPackedSha256,
  stripZerosLeft,
  toBeArray,
  toBeHex,
  toBigInt,
  toNumber,
  toQuantity,
  toTwos,
  toUtf8Bytes,
  toUtf8CodePoints,
  toUtf8String,
  uuidV4,
  verifyAuthorization,
  verifyMessage,
  verifyTypedData,
  version,
  wordlists,
  zeroPadBytes,
  zeroPadValue
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9jb25zdGFudHMvbnVtYmVycy5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9jcnlwdG8vaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vaGFzaC9zb2xpZGl0eS5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9hYmkvYnl0ZXMzMi5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9jb250cmFjdC9mYWN0b3J5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2V0aGVycy9saWIuZXNtL3Byb3ZpZGVycy9jb21tdW5pdHkuanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vcHJvdmlkZXJzL3Byb3ZpZGVyLWFua3IuanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vcHJvdmlkZXJzL3Byb3ZpZGVyLWFsY2hlbXkuanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vcHJvdmlkZXJzL3Byb3ZpZGVyLWNoYWluc3RhY2suanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vcHJvdmlkZXJzL3Byb3ZpZGVyLWNsb3VkZmxhcmUuanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vcHJvdmlkZXJzL3Byb3ZpZGVyLWV0aGVyc2Nhbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9wcm92aWRlcnMvd3MtYnJvd3Nlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9wcm92aWRlcnMvcHJvdmlkZXItc29ja2V0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2V0aGVycy9saWIuZXNtL3Byb3ZpZGVycy9wcm92aWRlci13ZWJzb2NrZXQuanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vcHJvdmlkZXJzL3Byb3ZpZGVyLWluZnVyYS5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9wcm92aWRlcnMvcHJvdmlkZXItcXVpY2tub2RlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2V0aGVycy9saWIuZXNtL3Byb3ZpZGVycy9wcm92aWRlci1mYWxsYmFjay5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9wcm92aWRlcnMvZGVmYXVsdC1wcm92aWRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9wcm92aWRlcnMvc2lnbmVyLW5vbmNlbWFuYWdlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9wcm92aWRlcnMvcHJvdmlkZXItYnJvd3Nlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9wcm92aWRlcnMvcHJvdmlkZXItYmxvY2tzY291dC5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9wcm92aWRlcnMvcHJvdmlkZXItcG9ja2V0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2V0aGVycy9saWIuZXNtL3Byb3ZpZGVycy9wcm92aWRlci1pcGNzb2NrZXQtYnJvd3Nlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS93b3JkbGlzdHMvYml0LXJlYWRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS93b3JkbGlzdHMvZGVjb2RlLW93bGEuanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vd29yZGxpc3RzL3dvcmRsaXN0LW93bGEuanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vd29yZGxpc3RzL3dvcmRsaXN0cy1icm93c2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiAgQSBjb25zdGFudCBmb3IgdGhlIG9yZGVyIE4gZm9yIHRoZSBzZWNwMjU2azEgY3VydmUuXHJcbiAqXHJcbiAqICAoKippLmUuKiogYGAweGZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZlYmFhZWRjZTZhZjQ4YTAzYmJmZDI1ZThjZDAzNjQxNDFuYGApXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgTiA9IEJpZ0ludChcIjB4ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmViYWFlZGNlNmFmNDhhMDNiYmZkMjVlOGNkMDM2NDE0MVwiKTtcclxuLyoqXHJcbiAqICBBIGNvbnN0YW50IGZvciB0aGUgbnVtYmVyIG9mIHdlaSBpbiBhIHNpbmdsZSBldGhlci5cclxuICpcclxuICogICgqKmkuZS4qKiBgYDEwMDAwMDAwMDAwMDAwMDAwMDBuYGApXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgV2VpUGVyRXRoZXIgPSBCaWdJbnQoXCIxMDAwMDAwMDAwMDAwMDAwMDAwXCIpO1xyXG4vKipcclxuICogIEEgY29uc3RhbnQgZm9yIHRoZSBtYXhpbXVtIHZhbHVlIGZvciBhIGBgdWludDI1NmBgLlxyXG4gKlxyXG4gKiAgKCoqaS5lLioqIGBgMHhmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmbmBgKVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IE1heFVpbnQyNTYgPSBCaWdJbnQoXCIweGZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZcIik7XHJcbi8qKlxyXG4gKiAgQSBjb25zdGFudCBmb3IgdGhlIG1pbmltdW0gdmFsdWUgZm9yIGFuIGBgaW50MjU2YGAuXHJcbiAqXHJcbiAqICAoKippLmUuKiogYGAtODAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMG5gYClcclxuICovXHJcbmV4cG9ydCBjb25zdCBNaW5JbnQyNTYgPSBCaWdJbnQoXCIweDgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDBcIikgKiBCaWdJbnQoLTEpO1xyXG4vKipcclxuICogIEEgY29uc3RhbnQgZm9yIHRoZSBtYXhpbXVtIHZhbHVlIGZvciBhbiBgYGludDI1NmBgLlxyXG4gKlxyXG4gKiAgKCoqaS5lLioqIGBgMHg3ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmbmBgKVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IE1heEludDI1NiA9IEJpZ0ludChcIjB4N2ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZlwiKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bnVtYmVycy5qcy5tYXAiLCIvKipcclxuICogIEEgZnVuZGFtZW50YWwgYnVpbGRpbmcgYmxvY2sgb2YgRXRoZXJldW0gaXMgdGhlIHVuZGVybHlpbmdcclxuICogIGNyeXB0b2dyYXBoaWMgcHJpbWl0aXZlcy5cclxuICpcclxuICogIEBfc2VjdGlvbjogYXBpL2NyeXB0bzpDcnlwdG9ncmFwaGljIEZ1bmN0aW9ucyAgIFthYm91dC1jcnlwdG9dXHJcbiAqL1xyXG5udWxsO1xyXG4vLyBXZSBpbXBvcnQgYWxsIHRoZXNlIHNvIHdlIGNhbiBleHBvcnQgbG9jaygpXHJcbmltcG9ydCB7IGNvbXB1dGVIbWFjIH0gZnJvbSBcIi4vaG1hYy5qc1wiO1xyXG5pbXBvcnQgeyBrZWNjYWsyNTYgfSBmcm9tIFwiLi9rZWNjYWsuanNcIjtcclxuaW1wb3J0IHsgcmlwZW1kMTYwIH0gZnJvbSBcIi4vcmlwZW1kMTYwLmpzXCI7XHJcbmltcG9ydCB7IHBia2RmMiB9IGZyb20gXCIuL3Bia2RmMi5qc1wiO1xyXG5pbXBvcnQgeyByYW5kb21CeXRlcyB9IGZyb20gXCIuL3JhbmRvbS5qc1wiO1xyXG5pbXBvcnQgeyBzY3J5cHQsIHNjcnlwdFN5bmMgfSBmcm9tIFwiLi9zY3J5cHQuanNcIjtcclxuaW1wb3J0IHsgc2hhMjU2LCBzaGE1MTIgfSBmcm9tIFwiLi9zaGEyLmpzXCI7XHJcbmV4cG9ydCB7IGNvbXB1dGVIbWFjLCByYW5kb21CeXRlcywga2VjY2FrMjU2LCByaXBlbWQxNjAsIHNoYTI1Niwgc2hhNTEyLCBwYmtkZjIsIHNjcnlwdCwgc2NyeXB0U3luYyB9O1xyXG5leHBvcnQgeyBTaWduaW5nS2V5IH0gZnJvbSBcIi4vc2lnbmluZy1rZXkuanNcIjtcclxuZXhwb3J0IHsgU2lnbmF0dXJlIH0gZnJvbSBcIi4vc2lnbmF0dXJlLmpzXCI7XHJcbi8qKlxyXG4gKiAgT25jZSBjYWxsZWQsIHByZXZlbnRzIGFueSBmdXR1cmUgY2hhbmdlIHRvIHRoZSB1bmRlcmx5aW5nIGNyeXB0b2dyYXBoaWNcclxuICogIHByaW1pdGl2ZXMgdXNpbmcgdGhlIGBgLnJlZ2lzdGVyYGAgZmVhdHVyZSBmb3IgaG9va3MuXHJcbiAqL1xyXG5mdW5jdGlvbiBsb2NrKCkge1xyXG4gICAgY29tcHV0ZUhtYWMubG9jaygpO1xyXG4gICAga2VjY2FrMjU2LmxvY2soKTtcclxuICAgIHBia2RmMi5sb2NrKCk7XHJcbiAgICByYW5kb21CeXRlcy5sb2NrKCk7XHJcbiAgICByaXBlbWQxNjAubG9jaygpO1xyXG4gICAgc2NyeXB0LmxvY2soKTtcclxuICAgIHNjcnlwdFN5bmMubG9jaygpO1xyXG4gICAgc2hhMjU2LmxvY2soKTtcclxuICAgIHNoYTUxMi5sb2NrKCk7XHJcbiAgICByYW5kb21CeXRlcy5sb2NrKCk7XHJcbn1cclxuZXhwb3J0IHsgbG9jayB9O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJpbXBvcnQgeyBnZXRBZGRyZXNzIH0gZnJvbSBcIi4uL2FkZHJlc3MvaW5kZXguanNcIjtcclxuaW1wb3J0IHsga2VjY2FrMjU2IGFzIF9rZWNjYWsyNTYsIHNoYTI1NiBhcyBfc2hhMjU2IH0gZnJvbSBcIi4uL2NyeXB0by9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyBjb25jYXQsIGRhdGFMZW5ndGgsIGdldEJ5dGVzLCBoZXhsaWZ5LCB0b0JlQXJyYXksIHRvVHdvcywgdG9VdGY4Qnl0ZXMsIHplcm9QYWRCeXRlcywgemVyb1BhZFZhbHVlLCBhc3NlcnRBcmd1bWVudCB9IGZyb20gXCIuLi91dGlscy9pbmRleC5qc1wiO1xyXG5jb25zdCByZWdleEJ5dGVzID0gbmV3IFJlZ0V4cChcIl5ieXRlcyhbMC05XSspJFwiKTtcclxuY29uc3QgcmVnZXhOdW1iZXIgPSBuZXcgUmVnRXhwKFwiXih1P2ludCkoWzAtOV0qKSRcIik7XHJcbmNvbnN0IHJlZ2V4QXJyYXkgPSBuZXcgUmVnRXhwKFwiXiguKilcXFxcWyhbMC05XSopXFxcXF0kXCIpO1xyXG5mdW5jdGlvbiBfcGFjayh0eXBlLCB2YWx1ZSwgaXNBcnJheSkge1xyXG4gICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgY2FzZSBcImFkZHJlc3NcIjpcclxuICAgICAgICAgICAgaWYgKGlzQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBnZXRCeXRlcyh6ZXJvUGFkVmFsdWUodmFsdWUsIDMyKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGdldEJ5dGVzKGdldEFkZHJlc3ModmFsdWUpKTtcclxuICAgICAgICBjYXNlIFwic3RyaW5nXCI6XHJcbiAgICAgICAgICAgIHJldHVybiB0b1V0ZjhCeXRlcyh2YWx1ZSk7XHJcbiAgICAgICAgY2FzZSBcImJ5dGVzXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBnZXRCeXRlcyh2YWx1ZSk7XHJcbiAgICAgICAgY2FzZSBcImJvb2xcIjpcclxuICAgICAgICAgICAgdmFsdWUgPSAoISF2YWx1ZSA/IFwiMHgwMVwiIDogXCIweDAwXCIpO1xyXG4gICAgICAgICAgICBpZiAoaXNBcnJheSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldEJ5dGVzKHplcm9QYWRWYWx1ZSh2YWx1ZSwgMzIpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZ2V0Qnl0ZXModmFsdWUpO1xyXG4gICAgfVxyXG4gICAgbGV0IG1hdGNoID0gdHlwZS5tYXRjaChyZWdleE51bWJlcik7XHJcbiAgICBpZiAobWF0Y2gpIHtcclxuICAgICAgICBsZXQgc2lnbmVkID0gKG1hdGNoWzFdID09PSBcImludFwiKTtcclxuICAgICAgICBsZXQgc2l6ZSA9IHBhcnNlSW50KG1hdGNoWzJdIHx8IFwiMjU2XCIpO1xyXG4gICAgICAgIGFzc2VydEFyZ3VtZW50KCghbWF0Y2hbMl0gfHwgbWF0Y2hbMl0gPT09IFN0cmluZyhzaXplKSkgJiYgKHNpemUgJSA4ID09PSAwKSAmJiBzaXplICE9PSAwICYmIHNpemUgPD0gMjU2LCBcImludmFsaWQgbnVtYmVyIHR5cGVcIiwgXCJ0eXBlXCIsIHR5cGUpO1xyXG4gICAgICAgIGlmIChpc0FycmF5KSB7XHJcbiAgICAgICAgICAgIHNpemUgPSAyNTY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzaWduZWQpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSB0b1R3b3ModmFsdWUsIHNpemUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZ2V0Qnl0ZXMoemVyb1BhZFZhbHVlKHRvQmVBcnJheSh2YWx1ZSksIHNpemUgLyA4KSk7XHJcbiAgICB9XHJcbiAgICBtYXRjaCA9IHR5cGUubWF0Y2gocmVnZXhCeXRlcyk7XHJcbiAgICBpZiAobWF0Y2gpIHtcclxuICAgICAgICBjb25zdCBzaXplID0gcGFyc2VJbnQobWF0Y2hbMV0pO1xyXG4gICAgICAgIGFzc2VydEFyZ3VtZW50KFN0cmluZyhzaXplKSA9PT0gbWF0Y2hbMV0gJiYgc2l6ZSAhPT0gMCAmJiBzaXplIDw9IDMyLCBcImludmFsaWQgYnl0ZXMgdHlwZVwiLCBcInR5cGVcIiwgdHlwZSk7XHJcbiAgICAgICAgYXNzZXJ0QXJndW1lbnQoZGF0YUxlbmd0aCh2YWx1ZSkgPT09IHNpemUsIGBpbnZhbGlkIHZhbHVlIGZvciAke3R5cGV9YCwgXCJ2YWx1ZVwiLCB2YWx1ZSk7XHJcbiAgICAgICAgaWYgKGlzQXJyYXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGdldEJ5dGVzKHplcm9QYWRCeXRlcyh2YWx1ZSwgMzIpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG4gICAgbWF0Y2ggPSB0eXBlLm1hdGNoKHJlZ2V4QXJyYXkpO1xyXG4gICAgaWYgKG1hdGNoICYmIEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XHJcbiAgICAgICAgY29uc3QgYmFzZVR5cGUgPSBtYXRjaFsxXTtcclxuICAgICAgICBjb25zdCBjb3VudCA9IHBhcnNlSW50KG1hdGNoWzJdIHx8IFN0cmluZyh2YWx1ZS5sZW5ndGgpKTtcclxuICAgICAgICBhc3NlcnRBcmd1bWVudChjb3VudCA9PT0gdmFsdWUubGVuZ3RoLCBgaW52YWxpZCBhcnJheSBsZW5ndGggZm9yICR7dHlwZX1gLCBcInZhbHVlXCIsIHZhbHVlKTtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcclxuICAgICAgICB2YWx1ZS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXN1bHQucHVzaChfcGFjayhiYXNlVHlwZSwgdmFsdWUsIHRydWUpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZ2V0Qnl0ZXMoY29uY2F0KHJlc3VsdCkpO1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0QXJndW1lbnQoZmFsc2UsIFwiaW52YWxpZCB0eXBlXCIsIFwidHlwZVwiLCB0eXBlKTtcclxufVxyXG4vLyBAVE9ETzogQXJyYXkgRW51bVxyXG4vKipcclxuICogICBDb21wdXRlcyB0aGUgW1tsaW5rLXNvbGMtcGFja2VkXV0gcmVwcmVzZW50YXRpb24gb2YgJSV2YWx1ZXMlJVxyXG4gKiAgIHJlc3BlY3RpdmVseSB0byB0aGVpciAlJXR5cGVzJSUuXHJcbiAqXHJcbiAqICAgQGV4YW1wbGU6XHJcbiAqICAgICAgIGFkZHIgPSBcIjB4OGJhMWYxMDk1NTFiZDQzMjgwMzAxMjY0NWFjMTM2ZGRkNjRkYmE3MlwiXHJcbiAqICAgICAgIHNvbGlkaXR5UGFja2VkKFsgXCJhZGRyZXNzXCIsIFwidWludFwiIF0sIFsgYWRkciwgNDUgXSk7XHJcbiAqICAgICAgIC8vX3Jlc3VsdDpcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzb2xpZGl0eVBhY2tlZCh0eXBlcywgdmFsdWVzKSB7XHJcbiAgICBhc3NlcnRBcmd1bWVudCh0eXBlcy5sZW5ndGggPT09IHZhbHVlcy5sZW5ndGgsIFwid3JvbmcgbnVtYmVyIG9mIHZhbHVlczsgZXhwZWN0ZWQgJHsgdHlwZXMubGVuZ3RoIH1cIiwgXCJ2YWx1ZXNcIiwgdmFsdWVzKTtcclxuICAgIGNvbnN0IHRpZ2h0ID0gW107XHJcbiAgICB0eXBlcy5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlLCBpbmRleCkge1xyXG4gICAgICAgIHRpZ2h0LnB1c2goX3BhY2sodHlwZSwgdmFsdWVzW2luZGV4XSkpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gaGV4bGlmeShjb25jYXQodGlnaHQpKTtcclxufVxyXG4vKipcclxuICogICBDb21wdXRlcyB0aGUgW1tsaW5rLXNvbGMtcGFja2VkXV0gW1trZWNjYWsyNTZdXSBoYXNoIG9mICUldmFsdWVzJSVcclxuICogICByZXNwZWN0aXZlbHkgdG8gdGhlaXIgJSV0eXBlcyUlLlxyXG4gKlxyXG4gKiAgIEBleGFtcGxlOlxyXG4gKiAgICAgICBhZGRyID0gXCIweDhiYTFmMTA5NTUxYmQ0MzI4MDMwMTI2NDVhYzEzNmRkZDY0ZGJhNzJcIlxyXG4gKiAgICAgICBzb2xpZGl0eVBhY2tlZEtlY2NhazI1NihbIFwiYWRkcmVzc1wiLCBcInVpbnRcIiBdLCBbIGFkZHIsIDQ1IF0pO1xyXG4gKiAgICAgICAvL19yZXN1bHQ6XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc29saWRpdHlQYWNrZWRLZWNjYWsyNTYodHlwZXMsIHZhbHVlcykge1xyXG4gICAgcmV0dXJuIF9rZWNjYWsyNTYoc29saWRpdHlQYWNrZWQodHlwZXMsIHZhbHVlcykpO1xyXG59XHJcbi8qKlxyXG4gKiAgIENvbXB1dGVzIHRoZSBbW2xpbmstc29sYy1wYWNrZWRdXSBbW3NoYTI1Nl1dIGhhc2ggb2YgJSV2YWx1ZXMlJVxyXG4gKiAgIHJlc3BlY3RpdmVseSB0byB0aGVpciAlJXR5cGVzJSUuXHJcbiAqXHJcbiAqICAgQGV4YW1wbGU6XHJcbiAqICAgICAgIGFkZHIgPSBcIjB4OGJhMWYxMDk1NTFiZDQzMjgwMzAxMjY0NWFjMTM2ZGRkNjRkYmE3MlwiXHJcbiAqICAgICAgIHNvbGlkaXR5UGFja2VkU2hhMjU2KFsgXCJhZGRyZXNzXCIsIFwidWludFwiIF0sIFsgYWRkciwgNDUgXSk7XHJcbiAqICAgICAgIC8vX3Jlc3VsdDpcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzb2xpZGl0eVBhY2tlZFNoYTI1Nih0eXBlcywgdmFsdWVzKSB7XHJcbiAgICByZXR1cm4gX3NoYTI1Nihzb2xpZGl0eVBhY2tlZCh0eXBlcywgdmFsdWVzKSk7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c29saWRpdHkuanMubWFwIiwiLyoqXHJcbiAqICBBYm91dCBieXRlczMyIHN0cmluZ3MuLi5cclxuICpcclxuICogIEBfZG9jbG9jOiBhcGkvdXRpbHM6Qnl0ZXMzMiBTdHJpbmdzXHJcbiAqL1xyXG5pbXBvcnQgeyBnZXRCeXRlcywgdG9VdGY4Qnl0ZXMsIHRvVXRmOFN0cmluZywgemVyb1BhZEJ5dGVzIH0gZnJvbSBcIi4uL3V0aWxzL2luZGV4LmpzXCI7XHJcbi8qKlxyXG4gKiAgRW5jb2RlcyAlJXRleHQlJSBhcyBhIEJ5dGVzMzIgc3RyaW5nLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZUJ5dGVzMzJTdHJpbmcodGV4dCkge1xyXG4gICAgLy8gR2V0IHRoZSBieXRlc1xyXG4gICAgY29uc3QgYnl0ZXMgPSB0b1V0ZjhCeXRlcyh0ZXh0KTtcclxuICAgIC8vIENoZWNrIHdlIGhhdmUgcm9vbSBmb3IgbnVsbC10ZXJtaW5hdGlvblxyXG4gICAgaWYgKGJ5dGVzLmxlbmd0aCA+IDMxKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYnl0ZXMzMiBzdHJpbmcgbXVzdCBiZSBsZXNzIHRoYW4gMzIgYnl0ZXNcIik7XHJcbiAgICB9XHJcbiAgICAvLyBaZXJvLXBhZCAoaW1wbGljaXRseSBudWxsLXRlcm1pbmF0ZXMpXHJcbiAgICByZXR1cm4gemVyb1BhZEJ5dGVzKGJ5dGVzLCAzMik7XHJcbn1cclxuLyoqXHJcbiAqICBFbmNvZGVzIHRoZSBCeXRlczMyLWVuY29kZWQgJSVieXRlcyUlIGludG8gYSBzdHJpbmcuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlQnl0ZXMzMlN0cmluZyhfYnl0ZXMpIHtcclxuICAgIGNvbnN0IGRhdGEgPSBnZXRCeXRlcyhfYnl0ZXMsIFwiYnl0ZXNcIik7XHJcbiAgICAvLyBNdXN0IGJlIDMyIGJ5dGVzIHdpdGggYSBudWxsLXRlcm1pbmF0aW9uXHJcbiAgICBpZiAoZGF0YS5sZW5ndGggIT09IDMyKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBieXRlczMyIC0gbm90IDMyIGJ5dGVzIGxvbmdcIik7XHJcbiAgICB9XHJcbiAgICBpZiAoZGF0YVszMV0gIT09IDApIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGJ5dGVzMzIgc3RyaW5nIC0gbm8gbnVsbCB0ZXJtaW5hdG9yXCIpO1xyXG4gICAgfVxyXG4gICAgLy8gRmluZCB0aGUgbnVsbCB0ZXJtaW5hdGlvblxyXG4gICAgbGV0IGxlbmd0aCA9IDMxO1xyXG4gICAgd2hpbGUgKGRhdGFbbGVuZ3RoIC0gMV0gPT09IDApIHtcclxuICAgICAgICBsZW5ndGgtLTtcclxuICAgIH1cclxuICAgIC8vIERldGVybWluZSB0aGUgc3RyaW5nIHZhbHVlXHJcbiAgICByZXR1cm4gdG9VdGY4U3RyaW5nKGRhdGEuc2xpY2UoMCwgbGVuZ3RoKSk7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Ynl0ZXMzMi5qcy5tYXAiLCJpbXBvcnQgeyBJbnRlcmZhY2UgfSBmcm9tIFwiLi4vYWJpL2luZGV4LmpzXCI7XHJcbmltcG9ydCB7IGdldENyZWF0ZUFkZHJlc3MgfSBmcm9tIFwiLi4vYWRkcmVzcy9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyBjb25jYXQsIGRlZmluZVByb3BlcnRpZXMsIGdldEJ5dGVzLCBoZXhsaWZ5LCBhc3NlcnQsIGFzc2VydEFyZ3VtZW50IH0gZnJvbSBcIi4uL3V0aWxzL2luZGV4LmpzXCI7XHJcbmltcG9ydCB7IEJhc2VDb250cmFjdCwgY29weU92ZXJyaWRlcywgcmVzb2x2ZUFyZ3MgfSBmcm9tIFwiLi9jb250cmFjdC5qc1wiO1xyXG4vLyBBID0gQXJndW1lbnRzIHRvIHRoZSBjb25zdHJ1Y3RvclxyXG4vLyBJID0gSW50ZXJmYWNlIG9mIGRlcGxveWVkIGNvbnRyYWN0c1xyXG4vKipcclxuICogIEEgKipDb250cmFjdEZhY3RvcnkqKiBpcyB1c2VkIHRvIGRlcGxveSBhIENvbnRyYWN0IHRvIHRoZSBibG9ja2NoYWluLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENvbnRyYWN0RmFjdG9yeSB7XHJcbiAgICAvKipcclxuICAgICAqICBUaGUgQ29udHJhY3QgSW50ZXJmYWNlLlxyXG4gICAgICovXHJcbiAgICBpbnRlcmZhY2U7XHJcbiAgICAvKipcclxuICAgICAqICBUaGUgQ29udHJhY3QgZGVwbG95bWVudCBieXRlY29kZS4gT2Z0ZW4gY2FsbGVkIHRoZSBpbml0Y29kZS5cclxuICAgICAqL1xyXG4gICAgYnl0ZWNvZGU7XHJcbiAgICAvKipcclxuICAgICAqICBUaGUgQ29udHJhY3RSdW5uZXIgdG8gZGVwbG95IHRoZSBDb250cmFjdCBhcy5cclxuICAgICAqL1xyXG4gICAgcnVubmVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiAgQ3JlYXRlIGEgbmV3ICoqQ29udHJhY3RGYWN0b3J5Kiogd2l0aCAlJWFiaSUlIGFuZCAlJWJ5dGVjb2RlJSUsXHJcbiAgICAgKiAgb3B0aW9uYWxseSBjb25uZWN0ZWQgdG8gJSVydW5uZXIlJS5cclxuICAgICAqXHJcbiAgICAgKiAgVGhlICUlYnl0ZWNvZGUlJSBtYXkgYmUgdGhlIGBgYnl0ZWNvZGVgYCBwcm9wZXJ0eSB3aXRoaW4gdGhlXHJcbiAgICAgKiAgc3RhbmRhcmQgU29saWRpdHkgSlNPTiBvdXRwdXQuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGFiaSwgYnl0ZWNvZGUsIHJ1bm5lcikge1xyXG4gICAgICAgIGNvbnN0IGlmYWNlID0gSW50ZXJmYWNlLmZyb20oYWJpKTtcclxuICAgICAgICAvLyBEZXJlZmVyZW5jZSBTb2xpZGl0eSBieXRlY29kZSBvYmplY3RzIGFuZCBhbGxvdyBhIG1pc3NpbmcgYDB4YC1wcmVmaXhcclxuICAgICAgICBpZiAoYnl0ZWNvZGUgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XHJcbiAgICAgICAgICAgIGJ5dGVjb2RlID0gaGV4bGlmeShnZXRCeXRlcyhieXRlY29kZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiAoYnl0ZWNvZGUpID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgICAgICBieXRlY29kZSA9IGJ5dGVjb2RlLm9iamVjdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWJ5dGVjb2RlLnN0YXJ0c1dpdGgoXCIweFwiKSkge1xyXG4gICAgICAgICAgICAgICAgYnl0ZWNvZGUgPSBcIjB4XCIgKyBieXRlY29kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBieXRlY29kZSA9IGhleGxpZnkoZ2V0Qnl0ZXMoYnl0ZWNvZGUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XHJcbiAgICAgICAgICAgIGJ5dGVjb2RlLCBpbnRlcmZhY2U6IGlmYWNlLCBydW5uZXI6IChydW5uZXIgfHwgbnVsbClcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGF0dGFjaCh0YXJnZXQpIHtcclxuICAgICAgICByZXR1cm4gbmV3IEJhc2VDb250cmFjdCh0YXJnZXQsIHRoaXMuaW50ZXJmYWNlLCB0aGlzLnJ1bm5lcik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqICBSZXNvbHZlcyB0byB0aGUgdHJhbnNhY3Rpb24gdG8gZGVwbG95IHRoZSBjb250cmFjdCwgcGFzc2luZyAlJWFyZ3MlJVxyXG4gICAgICogIGludG8gdGhlIGNvbnN0cnVjdG9yLlxyXG4gICAgICovXHJcbiAgICBhc3luYyBnZXREZXBsb3lUcmFuc2FjdGlvbiguLi5hcmdzKSB7XHJcbiAgICAgICAgbGV0IG92ZXJyaWRlcyA9IHt9O1xyXG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gdGhpcy5pbnRlcmZhY2UuZGVwbG95O1xyXG4gICAgICAgIGlmIChmcmFnbWVudC5pbnB1dHMubGVuZ3RoICsgMSA9PT0gYXJncy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgb3ZlcnJpZGVzID0gYXdhaXQgY29weU92ZXJyaWRlcyhhcmdzLnBvcCgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZyYWdtZW50LmlucHV0cy5sZW5ndGggIT09IGFyZ3MubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImluY29ycmVjdCBudW1iZXIgb2YgYXJndW1lbnRzIHRvIGNvbnN0cnVjdG9yXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCByZXNvbHZlZEFyZ3MgPSBhd2FpdCByZXNvbHZlQXJncyh0aGlzLnJ1bm5lciwgZnJhZ21lbnQuaW5wdXRzLCBhcmdzKTtcclxuICAgICAgICBjb25zdCBkYXRhID0gY29uY2F0KFt0aGlzLmJ5dGVjb2RlLCB0aGlzLmludGVyZmFjZS5lbmNvZGVEZXBsb3kocmVzb2x2ZWRBcmdzKV0pO1xyXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBvdmVycmlkZXMsIHsgZGF0YSB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogIFJlc29sdmVzIHRvIHRoZSBDb250cmFjdCBkZXBsb3llZCBieSBwYXNzaW5nICUlYXJncyUlIGludG8gdGhlXHJcbiAgICAgKiAgY29uc3RydWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICogIFRoaXMgd2lsbCByZXNvbHZlIHRvIHRoZSBDb250cmFjdCBiZWZvcmUgaXQgaGFzIGJlZW4gZGVwbG95ZWQgdG8gdGhlXHJcbiAgICAgKiAgbmV0d29yaywgc28gdGhlIFtbQmFzZUNvbnRyYWN0LXdhaXRGb3JEZXBsb3ltZW50XV0gc2hvdWxkIGJlIHVzZWQgYmVmb3JlXHJcbiAgICAgKiAgc2VuZGluZyBhbnkgdHJhbnNhY3Rpb25zIHRvIGl0LlxyXG4gICAgICovXHJcbiAgICBhc3luYyBkZXBsb3koLi4uYXJncykge1xyXG4gICAgICAgIGNvbnN0IHR4ID0gYXdhaXQgdGhpcy5nZXREZXBsb3lUcmFuc2FjdGlvbiguLi5hcmdzKTtcclxuICAgICAgICBhc3NlcnQodGhpcy5ydW5uZXIgJiYgdHlwZW9mICh0aGlzLnJ1bm5lci5zZW5kVHJhbnNhY3Rpb24pID09PSBcImZ1bmN0aW9uXCIsIFwiZmFjdG9yeSBydW5uZXIgZG9lcyBub3Qgc3VwcG9ydCBzZW5kaW5nIHRyYW5zYWN0aW9uc1wiLCBcIlVOU1VQUE9SVEVEX09QRVJBVElPTlwiLCB7XHJcbiAgICAgICAgICAgIG9wZXJhdGlvbjogXCJzZW5kVHJhbnNhY3Rpb25cIlxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnN0IHNlbnRUeCA9IGF3YWl0IHRoaXMucnVubmVyLnNlbmRUcmFuc2FjdGlvbih0eCk7XHJcbiAgICAgICAgY29uc3QgYWRkcmVzcyA9IGdldENyZWF0ZUFkZHJlc3Moc2VudFR4KTtcclxuICAgICAgICByZXR1cm4gbmV3IEJhc2VDb250cmFjdChhZGRyZXNzLCB0aGlzLmludGVyZmFjZSwgdGhpcy5ydW5uZXIsIHNlbnRUeCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqICBSZXR1cm4gYSBuZXcgKipDb250cmFjdEZhY3RvcnkqKiB3aXRoIHRoZSBzYW1lIEFCSSBhbmQgYnl0ZWNvZGUsXHJcbiAgICAgKiAgYnV0IGNvbm5lY3RlZCB0byAlJXJ1bm5lciUlLlxyXG4gICAgICovXHJcbiAgICBjb25uZWN0KHJ1bm5lcikge1xyXG4gICAgICAgIHJldHVybiBuZXcgQ29udHJhY3RGYWN0b3J5KHRoaXMuaW50ZXJmYWNlLCB0aGlzLmJ5dGVjb2RlLCBydW5uZXIpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiAgQ3JlYXRlIGEgbmV3ICoqQ29udHJhY3RGYWN0b3J5KiogZnJvbSB0aGUgc3RhbmRhcmQgU29saWRpdHkgSlNPTiBvdXRwdXQuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBmcm9tU29saWRpdHkob3V0cHV0LCBydW5uZXIpIHtcclxuICAgICAgICBhc3NlcnRBcmd1bWVudChvdXRwdXQgIT0gbnVsbCwgXCJiYWQgY29tcGlsZXIgb3V0cHV0XCIsIFwib3V0cHV0XCIsIG91dHB1dCk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAob3V0cHV0KSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBvdXRwdXQgPSBKU09OLnBhcnNlKG91dHB1dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGFiaSA9IG91dHB1dC5hYmk7XHJcbiAgICAgICAgbGV0IGJ5dGVjb2RlID0gXCJcIjtcclxuICAgICAgICBpZiAob3V0cHV0LmJ5dGVjb2RlKSB7XHJcbiAgICAgICAgICAgIGJ5dGVjb2RlID0gb3V0cHV0LmJ5dGVjb2RlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChvdXRwdXQuZXZtICYmIG91dHB1dC5ldm0uYnl0ZWNvZGUpIHtcclxuICAgICAgICAgICAgYnl0ZWNvZGUgPSBvdXRwdXQuZXZtLmJ5dGVjb2RlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IHRoaXMoYWJpLCBieXRlY29kZSwgcnVubmVyKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1mYWN0b3J5LmpzLm1hcCIsIi8qKlxyXG4gKiAgVGhlcmUgYXJlIG1hbnkgYXdlc29tZSBjb21tdW5pdHkgc2VydmljZXMgdGhhdCBwcm92aWRlIEV0aGVyZXVtXHJcbiAqICBub2RlcyBib3RoIGZvciBkZXZlbG9wZXJzIGp1c3Qgc3RhcnRpbmcgb3V0IGFuZCBmb3IgbGFyZ2Utc2NhbGVcclxuICogIGNvbW11bml0aWVzLlxyXG4gKlxyXG4gKiAgQF9zZWN0aW9uOiBhcGkvcHJvdmlkZXJzL3RoaXJkcGFydHk6IENvbW11bml0eSBQcm92aWRlcnMgIFt0aGlyZHBhcnR5XVxyXG4gKi9cclxuLy8gU2hvdyB0aGUgdGhyb3R0bGUgbWVzc2FnZSBvbmx5IG9uY2UgcGVyIHNlcnZpY2VcclxuY29uc3Qgc2hvd24gPSBuZXcgU2V0KCk7XHJcbi8qKlxyXG4gKiAgRGlzcGxheXMgYSB3YXJuaW5nIGluIHRoZSBjb25zb2xlIHdoZW4gdGhlIGNvbW11bml0eSByZXNvdXJjZSBpc1xyXG4gKiAgYmVpbmcgdXNlZCB0b28gaGVhdmlseSBieSB0aGUgYXBwLCByZWNvbW1lbmRpbmcgdGhlIGRldmVsb3BlclxyXG4gKiAgYWNxdWlyZSB0aGVpciBvd24gY3JlZGVudGlhbHMgaW5zdGVhZCBvZiB1c2luZyB0aGUgY29tbXVuaXR5XHJcbiAqICBjcmVkZW50aWFscy5cclxuICpcclxuICogIFRoZSBub3RpZmljYXRpb24gd2lsbCBvbmx5IG9jY3VyIG9uY2UgcGVyIHNlcnZpY2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2hvd1Rocm90dGxlTWVzc2FnZShzZXJ2aWNlKSB7XHJcbiAgICBpZiAoc2hvd24uaGFzKHNlcnZpY2UpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgc2hvd24uYWRkKHNlcnZpY2UpO1xyXG4gICAgY29uc29sZS5sb2coXCI9PT09PT09PT0gTk9USUNFID09PT09PT09PVwiKTtcclxuICAgIGNvbnNvbGUubG9nKGBSZXF1ZXN0LVJhdGUgRXhjZWVkZWQgZm9yICR7c2VydmljZX0gKHRoaXMgbWVzc2FnZSB3aWxsIG5vdCBiZSByZXBlYXRlZClgKTtcclxuICAgIGNvbnNvbGUubG9nKFwiXCIpO1xyXG4gICAgY29uc29sZS5sb2coXCJUaGUgZGVmYXVsdCBBUEkga2V5cyBmb3IgZWFjaCBzZXJ2aWNlIGFyZSBwcm92aWRlZCBhcyBhIGhpZ2hseS10aHJvdHRsZWQsXCIpO1xyXG4gICAgY29uc29sZS5sb2coXCJjb21tdW5pdHkgcmVzb3VyY2UgZm9yIGxvdy10cmFmZmljIHByb2plY3RzIGFuZCBlYXJseSBwcm90b3R5cGluZy5cIik7XHJcbiAgICBjb25zb2xlLmxvZyhcIlwiKTtcclxuICAgIGNvbnNvbGUubG9nKFwiV2hpbGUgeW91ciBhcHBsaWNhdGlvbiB3aWxsIGNvbnRpbnVlIHRvIGZ1bmN0aW9uLCB3ZSBoaWdobHkgcmVjb21tZW5kZWRcIik7XHJcbiAgICBjb25zb2xlLmxvZyhcInNpZ25pbmcgdXAgZm9yIHlvdXIgb3duIEFQSSBrZXlzIHRvIGltcHJvdmUgcGVyZm9ybWFuY2UsIGluY3JlYXNlIHlvdXJcIik7XHJcbiAgICBjb25zb2xlLmxvZyhcInJlcXVlc3QgcmF0ZS9saW1pdCBhbmQgZW5hYmxlIG90aGVyIHBlcmtzLCBzdWNoIGFzIG1ldHJpY3MgYW5kIGFkdmFuY2VkIEFQSXMuXCIpO1xyXG4gICAgY29uc29sZS5sb2coXCJcIik7XHJcbiAgICBjb25zb2xlLmxvZyhcIkZvciBtb3JlIGRldGFpbHM6IGh0dHBzOi9cXC9kb2NzLmV0aGVycy5vcmcvYXBpLWtleXMvXCIpO1xyXG4gICAgY29uc29sZS5sb2coXCI9PT09PT09PT09PT09PT09PT09PT09PT09PVwiKTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb21tdW5pdHkuanMubWFwIiwiLyoqXHJcbiAqICBbW2xpbmstYW5rcl1dIHByb3ZpZGVzIGEgdGhpcmQtcGFydHkgc2VydmljZSBmb3IgY29ubmVjdGluZyB0b1xyXG4gKiAgdmFyaW91cyBibG9ja2NoYWlucyBvdmVyIEpTT04tUlBDLlxyXG4gKlxyXG4gKiAgKipTdXBwb3J0ZWQgTmV0d29ya3MqKlxyXG4gKlxyXG4gKiAgLSBFdGhlcmV1bSBNYWlubmV0IChgYG1haW5uZXRgYClcclxuICogIC0gR29lcmxpIFRlc3RuZXQgKGBgZ29lcmxpYGApXHJcbiAqICAtIFNlcG9saWEgVGVzdG5ldCAoYGBzZXBvbGlhYGApXHJcbiAqICAtIEFyYml0cnVtIChgYGFyYml0cnVtYGApXHJcbiAqICAtIEJhc2UgKGBgYmFzZWBgKVxyXG4gKiAgLSBCYXNlIEdvZXJsaWEgVGVzdG5ldCAoYGBiYXNlLWdvZXJsaWBgKVxyXG4gKiAgLSBCYXNlIFNlcG9saWEgVGVzdG5ldCAoYGBiYXNlLXNlcG9saWFgYClcclxuICogIC0gQk5CIChgYGJuYmBgKVxyXG4gKiAgLSBCTkIgVGVzdG5ldCAoYGBibmJ0YGApXHJcbiAqICAtIE9wdGltaXNtIChgYG9wdGltaXNtYGApXHJcbiAqICAtIE9wdGltaXNtIEdvZXJsaSBUZXN0bmV0IChgYG9wdGltaXNtLWdvZXJsaWBgKVxyXG4gKiAgLSBPcHRpbWlzbSBTZXBvbGlhIFRlc3RuZXQgKGBgb3B0aW1pc20tc2Vwb2xpYWBgKVxyXG4gKiAgLSBQb2x5Z29uIChgYG1hdGljYGApXHJcbiAqICAtIFBvbHlnb24gTXVtYmFpIFRlc3RuZXQgKGBgbWF0aWMtbXVtYmFpYGApXHJcbiAqXHJcbiAqICBAX3N1YnNlY3Rpb246IGFwaS9wcm92aWRlcnMvdGhpcmRwYXJ0eTpBbmtyICBbcHJvdmlkZXJzLWFua3JdXHJcbiAqL1xyXG5pbXBvcnQgeyBkZWZpbmVQcm9wZXJ0aWVzLCBGZXRjaFJlcXVlc3QsIGFzc2VydEFyZ3VtZW50IH0gZnJvbSBcIi4uL3V0aWxzL2luZGV4LmpzXCI7XHJcbmltcG9ydCB7IHNob3dUaHJvdHRsZU1lc3NhZ2UgfSBmcm9tIFwiLi9jb21tdW5pdHkuanNcIjtcclxuaW1wb3J0IHsgTmV0d29yayB9IGZyb20gXCIuL25ldHdvcmsuanNcIjtcclxuaW1wb3J0IHsgSnNvblJwY1Byb3ZpZGVyIH0gZnJvbSBcIi4vcHJvdmlkZXItanNvbnJwYy5qc1wiO1xyXG5jb25zdCBkZWZhdWx0QXBpS2V5ID0gXCI5ZjdkOTI5YjAxOGNkZmZiMzM4NTE3ZWZhMDZmNTgzNTllODZmZjFmZmQzNTBiYzg4OTczODUyMzY1OWU3OTcyXCI7XHJcbmZ1bmN0aW9uIGdldEhvc3QobmFtZSkge1xyXG4gICAgc3dpdGNoIChuYW1lKSB7XHJcbiAgICAgICAgY2FzZSBcIm1haW5uZXRcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwicnBjLmFua3IuY29tL2V0aFwiO1xyXG4gICAgICAgIGNhc2UgXCJnb2VybGlcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwicnBjLmFua3IuY29tL2V0aF9nb2VybGlcIjtcclxuICAgICAgICBjYXNlIFwic2Vwb2xpYVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJycGMuYW5rci5jb20vZXRoX3NlcG9saWFcIjtcclxuICAgICAgICBjYXNlIFwiYXJiaXRydW1cIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwicnBjLmFua3IuY29tL2FyYml0cnVtXCI7XHJcbiAgICAgICAgY2FzZSBcImJhc2VcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwicnBjLmFua3IuY29tL2Jhc2VcIjtcclxuICAgICAgICBjYXNlIFwiYmFzZS1nb2VybGlcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwicnBjLmFua3IuY29tL2Jhc2VfZ29lcmxpXCI7XHJcbiAgICAgICAgY2FzZSBcImJhc2Utc2Vwb2xpYVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJycGMuYW5rci5jb20vYmFzZV9zZXBvbGlhXCI7XHJcbiAgICAgICAgY2FzZSBcImJuYlwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJycGMuYW5rci5jb20vYnNjXCI7XHJcbiAgICAgICAgY2FzZSBcImJuYnRcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwicnBjLmFua3IuY29tL2JzY190ZXN0bmV0X2NoYXBlbFwiO1xyXG4gICAgICAgIGNhc2UgXCJtYXRpY1wiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJycGMuYW5rci5jb20vcG9seWdvblwiO1xyXG4gICAgICAgIGNhc2UgXCJtYXRpYy1tdW1iYWlcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwicnBjLmFua3IuY29tL3BvbHlnb25fbXVtYmFpXCI7XHJcbiAgICAgICAgY2FzZSBcIm9wdGltaXNtXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcInJwYy5hbmtyLmNvbS9vcHRpbWlzbVwiO1xyXG4gICAgICAgIGNhc2UgXCJvcHRpbWlzbS1nb2VybGlcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwicnBjLmFua3IuY29tL29wdGltaXNtX3Rlc3RuZXRcIjtcclxuICAgICAgICBjYXNlIFwib3B0aW1pc20tc2Vwb2xpYVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJycGMuYW5rci5jb20vb3B0aW1pc21fc2Vwb2xpYVwiO1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0QXJndW1lbnQoZmFsc2UsIFwidW5zdXBwb3J0ZWQgbmV0d29ya1wiLCBcIm5ldHdvcmtcIiwgbmFtZSk7XHJcbn1cclxuLyoqXHJcbiAqICBUaGUgKipBbmtyUHJvdmlkZXIqKiBjb25uZWN0cyB0byB0aGUgW1tsaW5rLWFua3JdXVxyXG4gKiAgSlNPTi1SUEMgZW5kLXBvaW50cy5cclxuICpcclxuICogIEJ5IGRlZmF1bHQsIGEgaGlnaGx5LXRocm90dGxlZCBBUEkga2V5IGlzIHVzZWQsIHdoaWNoIGlzXHJcbiAqICBhcHByb3ByaWF0ZSBmb3IgcXVpY2sgcHJvdG90eXBlcyBhbmQgc2ltcGxlIHNjcmlwdHMuIFRvXHJcbiAqICBnYWluIGFjY2VzcyB0byBhbiBpbmNyZWFzZWQgcmF0ZS1saW1pdCwgaXQgaXMgaGlnaGx5XHJcbiAqICByZWNvbW1lbmRlZCB0byBbc2lnbiB1cCBoZXJlXShsaW5rLWFua3Itc2lnbnVwKS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBBbmtyUHJvdmlkZXIgZXh0ZW5kcyBKc29uUnBjUHJvdmlkZXIge1xyXG4gICAgLyoqXHJcbiAgICAgKiAgVGhlIEFQSSBrZXkgZm9yIHRoZSBBbmtyIGNvbm5lY3Rpb24uXHJcbiAgICAgKi9cclxuICAgIGFwaUtleTtcclxuICAgIC8qKlxyXG4gICAgICogIENyZWF0ZSBhIG5ldyAqKkFua3JQcm92aWRlcioqLlxyXG4gICAgICpcclxuICAgICAqICBCeSBkZWZhdWx0IGNvbm5lY3RpbmcgdG8gYGBtYWlubmV0YGAgd2l0aCBhIGhpZ2hseSB0aHJvdHRsZWRcclxuICAgICAqICBBUEkga2V5LlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihfbmV0d29yaywgYXBpS2V5KSB7XHJcbiAgICAgICAgaWYgKF9uZXR3b3JrID09IG51bGwpIHtcclxuICAgICAgICAgICAgX25ldHdvcmsgPSBcIm1haW5uZXRcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbmV0d29yayA9IE5ldHdvcmsuZnJvbShfbmV0d29yayk7XHJcbiAgICAgICAgaWYgKGFwaUtleSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGFwaUtleSA9IGRlZmF1bHRBcGlLZXk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEFua3IgZG9lcyBub3Qgc3VwcG9ydCBmaWx0ZXJJZCwgc28gd2UgZm9yY2UgcG9sbGluZ1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7IHBvbGxpbmc6IHRydWUsIHN0YXRpY05ldHdvcms6IG5ldHdvcmsgfTtcclxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gQW5rclByb3ZpZGVyLmdldFJlcXVlc3QobmV0d29yaywgYXBpS2V5KTtcclxuICAgICAgICBzdXBlcihyZXF1ZXN0LCBuZXR3b3JrLCBvcHRpb25zKTtcclxuICAgICAgICBkZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHsgYXBpS2V5IH0pO1xyXG4gICAgfVxyXG4gICAgX2dldFByb3ZpZGVyKGNoYWluSWQpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEFua3JQcm92aWRlcihjaGFpbklkLCB0aGlzLmFwaUtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnJvcikgeyB9XHJcbiAgICAgICAgcmV0dXJuIHN1cGVyLl9nZXRQcm92aWRlcihjaGFpbklkKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogIFJldHVybnMgYSBwcmVwYXJlZCByZXF1ZXN0IGZvciBjb25uZWN0aW5nIHRvICUlbmV0d29yayUlIHdpdGhcclxuICAgICAqICAlJWFwaUtleSUlLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0UmVxdWVzdChuZXR3b3JrLCBhcGlLZXkpIHtcclxuICAgICAgICBpZiAoYXBpS2V5ID09IG51bGwpIHtcclxuICAgICAgICAgICAgYXBpS2V5ID0gZGVmYXVsdEFwaUtleTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IG5ldyBGZXRjaFJlcXVlc3QoYGh0dHBzOi9cXC8ke2dldEhvc3QobmV0d29yay5uYW1lKX0vJHthcGlLZXl9YCk7XHJcbiAgICAgICAgcmVxdWVzdC5hbGxvd0d6aXAgPSB0cnVlO1xyXG4gICAgICAgIGlmIChhcGlLZXkgPT09IGRlZmF1bHRBcGlLZXkpIHtcclxuICAgICAgICAgICAgcmVxdWVzdC5yZXRyeUZ1bmMgPSBhc3luYyAocmVxdWVzdCwgcmVzcG9uc2UsIGF0dGVtcHQpID0+IHtcclxuICAgICAgICAgICAgICAgIHNob3dUaHJvdHRsZU1lc3NhZ2UoXCJBbmtyUHJvdmlkZXJcIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlcXVlc3Q7XHJcbiAgICB9XHJcbiAgICBnZXRScGNFcnJvcihwYXlsb2FkLCBlcnJvcikge1xyXG4gICAgICAgIGlmIChwYXlsb2FkLm1ldGhvZCA9PT0gXCJldGhfc2VuZFJhd1RyYW5zYWN0aW9uXCIpIHtcclxuICAgICAgICAgICAgaWYgKGVycm9yICYmIGVycm9yLmVycm9yICYmIGVycm9yLmVycm9yLm1lc3NhZ2UgPT09IFwiSU5URVJOQUxfRVJST1I6IGNvdWxkIG5vdCByZXBsYWNlIGV4aXN0aW5nIHR4XCIpIHtcclxuICAgICAgICAgICAgICAgIGVycm9yLmVycm9yLm1lc3NhZ2UgPSBcInJlcGxhY2VtZW50IHRyYW5zYWN0aW9uIHVuZGVycHJpY2VkXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1cGVyLmdldFJwY0Vycm9yKHBheWxvYWQsIGVycm9yKTtcclxuICAgIH1cclxuICAgIGlzQ29tbXVuaXR5UmVzb3VyY2UoKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmFwaUtleSA9PT0gZGVmYXVsdEFwaUtleSk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJvdmlkZXItYW5rci5qcy5tYXAiLCIvKipcclxuICogIFtbbGluay1hbGNoZW15XV0gcHJvdmlkZXMgYSB0aGlyZC1wYXJ0eSBzZXJ2aWNlIGZvciBjb25uZWN0aW5nIHRvXHJcbiAqICB2YXJpb3VzIGJsb2NrY2hhaW5zIG92ZXIgSlNPTi1SUEMuXHJcbiAqXHJcbiAqICAqKlN1cHBvcnRlZCBOZXR3b3JrcyoqXHJcbiAqXHJcbiAqICAtIEV0aGVyZXVtIE1haW5uZXQgKGBgbWFpbm5ldGBgKVxyXG4gKiAgLSBHb2VybGkgVGVzdG5ldCAoYGBnb2VybGlgYClcclxuICogIC0gU2Vwb2xpYSBUZXN0bmV0IChgYHNlcG9saWFgYClcclxuICogIC0gQXJiaXRydW0gKGBgYXJiaXRydW1gYClcclxuICogIC0gQXJiaXRydW0gR29lcmxpIFRlc3RuZXQgKGBgYXJiaXRydW0tZ29lcmxpYGApXHJcbiAqICAtIEFyYml0cnVtIFNlcG9saWEgVGVzdG5ldCAoYGBhcmJpdHJ1bS1zZXBvbGlhYGApXHJcbiAqICAtIEJhc2UgKGBgYmFzZWBgKVxyXG4gKiAgLSBCYXNlIEdvZXJsaWEgVGVzdG5ldCAoYGBiYXNlLWdvZXJsaWBgKVxyXG4gKiAgLSBCYXNlIFNlcG9saWEgVGVzdG5ldCAoYGBiYXNlLXNlcG9saWFgYClcclxuICogIC0gT3B0aW1pc20gKGBgb3B0aW1pc21gYClcclxuICogIC0gT3B0aW1pc20gR29lcmxpIFRlc3RuZXQgKGBgb3B0aW1pc20tZ29lcmxpYGApXHJcbiAqICAtIE9wdGltaXNtIFNlcG9saWEgVGVzdG5ldCAoYGBvcHRpbWlzbS1zZXBvbGlhYGApXHJcbiAqICAtIFBvbHlnb24gKGBgbWF0aWNgYClcclxuICogIC0gUG9seWdvbiBBbW95IFRlc3RuZXQgKGBgbWF0aWMtYW1veWBgKVxyXG4gKiAgLSBQb2x5Z29uIE11bWJhaSBUZXN0bmV0IChgYG1hdGljLW11bWJhaWBgKVxyXG4gKlxyXG4gKiAgQF9zdWJzZWN0aW9uOiBhcGkvcHJvdmlkZXJzL3RoaXJkcGFydHk6QWxjaGVteSAgW3Byb3ZpZGVycy1hbGNoZW15XVxyXG4gKi9cclxuaW1wb3J0IHsgZGVmaW5lUHJvcGVydGllcywgcmVzb2x2ZVByb3BlcnRpZXMsIGFzc2VydCwgYXNzZXJ0QXJndW1lbnQsIEZldGNoUmVxdWVzdCB9IGZyb20gXCIuLi91dGlscy9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyBzaG93VGhyb3R0bGVNZXNzYWdlIH0gZnJvbSBcIi4vY29tbXVuaXR5LmpzXCI7XHJcbmltcG9ydCB7IE5ldHdvcmsgfSBmcm9tIFwiLi9uZXR3b3JrLmpzXCI7XHJcbmltcG9ydCB7IEpzb25ScGNQcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLWpzb25ycGMuanNcIjtcclxuY29uc3QgZGVmYXVsdEFwaUtleSA9IFwiX2dnN3dTU2kwS01Cc2RLbkdWZkhEdWVxNnhNQjlFa0NcIjtcclxuZnVuY3Rpb24gZ2V0SG9zdChuYW1lKSB7XHJcbiAgICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgICAgICBjYXNlIFwibWFpbm5ldFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJldGgtbWFpbm5ldC5hbGNoZW15YXBpLmlvXCI7XHJcbiAgICAgICAgY2FzZSBcImdvZXJsaVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJldGgtZ29lcmxpLmcuYWxjaGVteS5jb21cIjtcclxuICAgICAgICBjYXNlIFwic2Vwb2xpYVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJldGgtc2Vwb2xpYS5nLmFsY2hlbXkuY29tXCI7XHJcbiAgICAgICAgY2FzZSBcImFyYml0cnVtXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImFyYi1tYWlubmV0LmcuYWxjaGVteS5jb21cIjtcclxuICAgICAgICBjYXNlIFwiYXJiaXRydW0tZ29lcmxpXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImFyYi1nb2VybGkuZy5hbGNoZW15LmNvbVwiO1xyXG4gICAgICAgIGNhc2UgXCJhcmJpdHJ1bS1zZXBvbGlhXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImFyYi1zZXBvbGlhLmcuYWxjaGVteS5jb21cIjtcclxuICAgICAgICBjYXNlIFwiYmFzZVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJiYXNlLW1haW5uZXQuZy5hbGNoZW15LmNvbVwiO1xyXG4gICAgICAgIGNhc2UgXCJiYXNlLWdvZXJsaVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJiYXNlLWdvZXJsaS5nLmFsY2hlbXkuY29tXCI7XHJcbiAgICAgICAgY2FzZSBcImJhc2Utc2Vwb2xpYVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJiYXNlLXNlcG9saWEuZy5hbGNoZW15LmNvbVwiO1xyXG4gICAgICAgIGNhc2UgXCJtYXRpY1wiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJwb2x5Z29uLW1haW5uZXQuZy5hbGNoZW15LmNvbVwiO1xyXG4gICAgICAgIGNhc2UgXCJtYXRpYy1hbW95XCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcInBvbHlnb24tYW1veS5nLmFsY2hlbXkuY29tXCI7XHJcbiAgICAgICAgY2FzZSBcIm1hdGljLW11bWJhaVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJwb2x5Z29uLW11bWJhaS5nLmFsY2hlbXkuY29tXCI7XHJcbiAgICAgICAgY2FzZSBcIm9wdGltaXNtXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcIm9wdC1tYWlubmV0LmcuYWxjaGVteS5jb21cIjtcclxuICAgICAgICBjYXNlIFwib3B0aW1pc20tZ29lcmxpXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcIm9wdC1nb2VybGkuZy5hbGNoZW15LmNvbVwiO1xyXG4gICAgICAgIGNhc2UgXCJvcHRpbWlzbS1zZXBvbGlhXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcIm9wdC1zZXBvbGlhLmcuYWxjaGVteS5jb21cIjtcclxuICAgIH1cclxuICAgIGFzc2VydEFyZ3VtZW50KGZhbHNlLCBcInVuc3VwcG9ydGVkIG5ldHdvcmtcIiwgXCJuZXR3b3JrXCIsIG5hbWUpO1xyXG59XHJcbi8qKlxyXG4gKiAgVGhlICoqQWxjaGVteVByb3ZpZGVyKiogY29ubmVjdHMgdG8gdGhlIFtbbGluay1hbGNoZW15XV1cclxuICogIEpTT04tUlBDIGVuZC1wb2ludHMuXHJcbiAqXHJcbiAqICBCeSBkZWZhdWx0LCBhIGhpZ2hseS10aHJvdHRsZWQgQVBJIGtleSBpcyB1c2VkLCB3aGljaCBpc1xyXG4gKiAgYXBwcm9wcmlhdGUgZm9yIHF1aWNrIHByb3RvdHlwZXMgYW5kIHNpbXBsZSBzY3JpcHRzLiBUb1xyXG4gKiAgZ2FpbiBhY2Nlc3MgdG8gYW4gaW5jcmVhc2VkIHJhdGUtbGltaXQsIGl0IGlzIGhpZ2hseVxyXG4gKiAgcmVjb21tZW5kZWQgdG8gW3NpZ24gdXAgaGVyZV0obGluay1hbGNoZW15LXNpZ251cCkuXHJcbiAqXHJcbiAqICBAX2RvY2xvYzogYXBpL3Byb3ZpZGVycy90aGlyZHBhcnR5XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQWxjaGVteVByb3ZpZGVyIGV4dGVuZHMgSnNvblJwY1Byb3ZpZGVyIHtcclxuICAgIGFwaUtleTtcclxuICAgIGNvbnN0cnVjdG9yKF9uZXR3b3JrLCBhcGlLZXkpIHtcclxuICAgICAgICBpZiAoX25ldHdvcmsgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBfbmV0d29yayA9IFwibWFpbm5ldFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBuZXR3b3JrID0gTmV0d29yay5mcm9tKF9uZXR3b3JrKTtcclxuICAgICAgICBpZiAoYXBpS2V5ID09IG51bGwpIHtcclxuICAgICAgICAgICAgYXBpS2V5ID0gZGVmYXVsdEFwaUtleTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IEFsY2hlbXlQcm92aWRlci5nZXRSZXF1ZXN0KG5ldHdvcmssIGFwaUtleSk7XHJcbiAgICAgICAgc3VwZXIocmVxdWVzdCwgbmV0d29yaywgeyBzdGF0aWNOZXR3b3JrOiBuZXR3b3JrIH0pO1xyXG4gICAgICAgIGRlZmluZVByb3BlcnRpZXModGhpcywgeyBhcGlLZXkgfSk7XHJcbiAgICB9XHJcbiAgICBfZ2V0UHJvdmlkZXIoY2hhaW5JZCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQWxjaGVteVByb3ZpZGVyKGNoYWluSWQsIHRoaXMuYXBpS2V5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7IH1cclxuICAgICAgICByZXR1cm4gc3VwZXIuX2dldFByb3ZpZGVyKGNoYWluSWQpO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgX3BlcmZvcm0ocmVxKSB7XHJcbiAgICAgICAgLy8gaHR0cHM6Ly9kb2NzLmFsY2hlbXkuY29tL3JlZmVyZW5jZS90cmFjZS10cmFuc2FjdGlvblxyXG4gICAgICAgIGlmIChyZXEubWV0aG9kID09PSBcImdldFRyYW5zYWN0aW9uUmVzdWx0XCIpIHtcclxuICAgICAgICAgICAgY29uc3QgeyB0cmFjZSwgdHggfSA9IGF3YWl0IHJlc29sdmVQcm9wZXJ0aWVzKHtcclxuICAgICAgICAgICAgICAgIHRyYWNlOiB0aGlzLnNlbmQoXCJ0cmFjZV90cmFuc2FjdGlvblwiLCBbcmVxLmhhc2hdKSxcclxuICAgICAgICAgICAgICAgIHR4OiB0aGlzLmdldFRyYW5zYWN0aW9uKHJlcS5oYXNoKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHRyYWNlID09IG51bGwgfHwgdHggPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGRhdGE7XHJcbiAgICAgICAgICAgIGxldCBlcnJvciA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHRyYWNlWzBdLnJlc3VsdC5vdXRwdXQ7XHJcbiAgICAgICAgICAgICAgICBlcnJvciA9ICh0cmFjZVswXS5lcnJvciA9PT0gXCJSZXZlcnRlZFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHsgfVxyXG4gICAgICAgICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KCFlcnJvciwgXCJhbiBlcnJvciBvY2N1cnJlZCBkdXJpbmcgdHJhbnNhY3Rpb24gZXhlY3V0aW9uc1wiLCBcIkNBTExfRVhDRVBUSU9OXCIsIHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwiZ2V0VHJhbnNhY3Rpb25SZXN1bHRcIixcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlYXNvbjogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbjogdHgsXHJcbiAgICAgICAgICAgICAgICAgICAgaW52b2NhdGlvbjogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICByZXZlcnQ6IG51bGwgLy8gQFRPRE9cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXNzZXJ0KGZhbHNlLCBcImNvdWxkIG5vdCBwYXJzZSB0cmFjZSByZXN1bHRcIiwgXCJCQURfREFUQVwiLCB7IHZhbHVlOiB0cmFjZSB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHN1cGVyLl9wZXJmb3JtKHJlcSk7XHJcbiAgICB9XHJcbiAgICBpc0NvbW11bml0eVJlc291cmNlKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5hcGlLZXkgPT09IGRlZmF1bHRBcGlLZXkpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldFJlcXVlc3QobmV0d29yaywgYXBpS2V5KSB7XHJcbiAgICAgICAgaWYgKGFwaUtleSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGFwaUtleSA9IGRlZmF1bHRBcGlLZXk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBuZXcgRmV0Y2hSZXF1ZXN0KGBodHRwczovXFwvJHtnZXRIb3N0KG5ldHdvcmsubmFtZSl9L3YyLyR7YXBpS2V5fWApO1xyXG4gICAgICAgIHJlcXVlc3QuYWxsb3dHemlwID0gdHJ1ZTtcclxuICAgICAgICBpZiAoYXBpS2V5ID09PSBkZWZhdWx0QXBpS2V5KSB7XHJcbiAgICAgICAgICAgIHJlcXVlc3QucmV0cnlGdW5jID0gYXN5bmMgKHJlcXVlc3QsIHJlc3BvbnNlLCBhdHRlbXB0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzaG93VGhyb3R0bGVNZXNzYWdlKFwiYWxjaGVteVwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVxdWVzdDtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcm92aWRlci1hbGNoZW15LmpzLm1hcCIsIi8qKlxyXG4gKiAgW1tsaW5rLWNoYWluc3RhY2tdXSBwcm92aWRlcyBhIHRoaXJkLXBhcnR5IHNlcnZpY2UgZm9yIGNvbm5lY3RpbmcgdG9cclxuICogIHZhcmlvdXMgYmxvY2tjaGFpbnMgb3ZlciBKU09OLVJQQy5cclxuICpcclxuICogICoqU3VwcG9ydGVkIE5ldHdvcmtzKipcclxuICpcclxuICogIC0gRXRoZXJldW0gTWFpbm5ldCAoYGBtYWlubmV0YGApXHJcbiAqICAtIEFyYml0cnVtIChgYGFyYml0cnVtYGApXHJcbiAqICAtIEJOQiBTbWFydCBDaGFpbiBNYWlubmV0IChgYGJuYmBgKVxyXG4gKiAgLSBQb2x5Z29uIChgYG1hdGljYGApXHJcbiAqXHJcbiAqICBAX3N1YnNlY3Rpb246IGFwaS9wcm92aWRlcnMvdGhpcmRwYXJ0eTpDaGFpbnN0YWNrICBbcHJvdmlkZXJzLWNoYWluc3RhY2tdXHJcbiAqL1xyXG5pbXBvcnQgeyBkZWZpbmVQcm9wZXJ0aWVzLCBGZXRjaFJlcXVlc3QsIGFzc2VydEFyZ3VtZW50IH0gZnJvbSBcIi4uL3V0aWxzL2luZGV4LmpzXCI7XHJcbmltcG9ydCB7IHNob3dUaHJvdHRsZU1lc3NhZ2UgfSBmcm9tIFwiLi9jb21tdW5pdHkuanNcIjtcclxuaW1wb3J0IHsgTmV0d29yayB9IGZyb20gXCIuL25ldHdvcmsuanNcIjtcclxuaW1wb3J0IHsgSnNvblJwY1Byb3ZpZGVyIH0gZnJvbSBcIi4vcHJvdmlkZXItanNvbnJwYy5qc1wiO1xyXG5mdW5jdGlvbiBnZXRBcGlLZXkobmFtZSkge1xyXG4gICAgc3dpdGNoIChuYW1lKSB7XHJcbiAgICAgICAgY2FzZSBcIm1haW5uZXRcIjogcmV0dXJuIFwiMzlmMWQ2N2NlZGY4Yjc4MzEwMTBhNjY1MzI4YzkxOTdcIjtcclxuICAgICAgICBjYXNlIFwiYXJiaXRydW1cIjogcmV0dXJuIFwiMDU1MGMyMDlkYjMzYzNhYmY0Y2M5MjdlMWUxOGNlYTFcIjtcclxuICAgICAgICBjYXNlIFwiYm5iXCI6IHJldHVybiBcIjk4YjVhNzdlNTMxNjE0Mzg3MzY2ZjZmYzVkYTA5N2Y4XCI7XHJcbiAgICAgICAgY2FzZSBcIm1hdGljXCI6IHJldHVybiBcImNkOWQ0ZDcwMzc3NDcxYWE3YzE0MmVjNGE0MjA1MjQ5XCI7XHJcbiAgICB9XHJcbiAgICBhc3NlcnRBcmd1bWVudChmYWxzZSwgXCJ1bnN1cHBvcnRlZCBuZXR3b3JrXCIsIFwibmV0d29ya1wiLCBuYW1lKTtcclxufVxyXG5mdW5jdGlvbiBnZXRIb3N0KG5hbWUpIHtcclxuICAgIHN3aXRjaCAobmFtZSkge1xyXG4gICAgICAgIGNhc2UgXCJtYWlubmV0XCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImV0aGVyZXVtLW1haW5uZXQuY29yZS5jaGFpbnN0YWNrLmNvbVwiO1xyXG4gICAgICAgIGNhc2UgXCJhcmJpdHJ1bVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJhcmJpdHJ1bS1tYWlubmV0LmNvcmUuY2hhaW5zdGFjay5jb21cIjtcclxuICAgICAgICBjYXNlIFwiYm5iXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImJzYy1tYWlubmV0LmNvcmUuY2hhaW5zdGFjay5jb21cIjtcclxuICAgICAgICBjYXNlIFwibWF0aWNcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwicG9seWdvbi1tYWlubmV0LmNvcmUuY2hhaW5zdGFjay5jb21cIjtcclxuICAgIH1cclxuICAgIGFzc2VydEFyZ3VtZW50KGZhbHNlLCBcInVuc3VwcG9ydGVkIG5ldHdvcmtcIiwgXCJuZXR3b3JrXCIsIG5hbWUpO1xyXG59XHJcbi8qKlxyXG4gKiAgVGhlICoqQ2hhaW5zdGFja1Byb3ZpZGVyKiogY29ubmVjdHMgdG8gdGhlIFtbbGluay1jaGFpbnN0YWNrXV1cclxuICogIEpTT04tUlBDIGVuZC1wb2ludHMuXHJcbiAqXHJcbiAqICBCeSBkZWZhdWx0LCBhIGhpZ2hseS10aHJvdHRsZWQgQVBJIGtleSBpcyB1c2VkLCB3aGljaCBpc1xyXG4gKiAgYXBwcm9wcmlhdGUgZm9yIHF1aWNrIHByb3RvdHlwZXMgYW5kIHNpbXBsZSBzY3JpcHRzLiBUb1xyXG4gKiAgZ2FpbiBhY2Nlc3MgdG8gYW4gaW5jcmVhc2VkIHJhdGUtbGltaXQsIGl0IGlzIGhpZ2hseVxyXG4gKiAgcmVjb21tZW5kZWQgdG8gW3NpZ24gdXAgaGVyZV0obGluay1jaGFpbnN0YWNrKS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDaGFpbnN0YWNrUHJvdmlkZXIgZXh0ZW5kcyBKc29uUnBjUHJvdmlkZXIge1xyXG4gICAgLyoqXHJcbiAgICAgKiAgVGhlIEFQSSBrZXkgZm9yIHRoZSBDaGFpbnN0YWNrIGNvbm5lY3Rpb24uXHJcbiAgICAgKi9cclxuICAgIGFwaUtleTtcclxuICAgIC8qKlxyXG4gICAgICogIENyZWF0ZXMgYSBuZXcgKipDaGFpbnN0YWNrUHJvdmlkZXIqKi5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoX25ldHdvcmssIGFwaUtleSkge1xyXG4gICAgICAgIGlmIChfbmV0d29yayA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIF9uZXR3b3JrID0gXCJtYWlubmV0XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5ldHdvcmsgPSBOZXR3b3JrLmZyb20oX25ldHdvcmspO1xyXG4gICAgICAgIGlmIChhcGlLZXkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBhcGlLZXkgPSBnZXRBcGlLZXkobmV0d29yay5uYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IENoYWluc3RhY2tQcm92aWRlci5nZXRSZXF1ZXN0KG5ldHdvcmssIGFwaUtleSk7XHJcbiAgICAgICAgc3VwZXIocmVxdWVzdCwgbmV0d29yaywgeyBzdGF0aWNOZXR3b3JrOiBuZXR3b3JrIH0pO1xyXG4gICAgICAgIGRlZmluZVByb3BlcnRpZXModGhpcywgeyBhcGlLZXkgfSk7XHJcbiAgICB9XHJcbiAgICBfZ2V0UHJvdmlkZXIoY2hhaW5JZCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ2hhaW5zdGFja1Byb3ZpZGVyKGNoYWluSWQsIHRoaXMuYXBpS2V5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7IH1cclxuICAgICAgICByZXR1cm4gc3VwZXIuX2dldFByb3ZpZGVyKGNoYWluSWQpO1xyXG4gICAgfVxyXG4gICAgaXNDb21tdW5pdHlSZXNvdXJjZSgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuYXBpS2V5ID09PSBnZXRBcGlLZXkodGhpcy5fbmV0d29yay5uYW1lKSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqICBSZXR1cm5zIGEgcHJlcGFyZWQgcmVxdWVzdCBmb3IgY29ubmVjdGluZyB0byAlJW5ldHdvcmslJVxyXG4gICAgICogIHdpdGggJSVhcGlLZXklJSBhbmQgJSVwcm9qZWN0U2VjcmV0JSUuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXRSZXF1ZXN0KG5ldHdvcmssIGFwaUtleSkge1xyXG4gICAgICAgIGlmIChhcGlLZXkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBhcGlLZXkgPSBnZXRBcGlLZXkobmV0d29yay5uYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IG5ldyBGZXRjaFJlcXVlc3QoYGh0dHBzOi9cXC8ke2dldEhvc3QobmV0d29yay5uYW1lKX0vJHthcGlLZXl9YCk7XHJcbiAgICAgICAgcmVxdWVzdC5hbGxvd0d6aXAgPSB0cnVlO1xyXG4gICAgICAgIGlmIChhcGlLZXkgPT09IGdldEFwaUtleShuZXR3b3JrLm5hbWUpKSB7XHJcbiAgICAgICAgICAgIHJlcXVlc3QucmV0cnlGdW5jID0gYXN5bmMgKHJlcXVlc3QsIHJlc3BvbnNlLCBhdHRlbXB0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzaG93VGhyb3R0bGVNZXNzYWdlKFwiQ2hhaW5zdGFja1Byb3ZpZGVyXCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXF1ZXN0O1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByb3ZpZGVyLWNoYWluc3RhY2suanMubWFwIiwiLyoqXHJcbiAqICBBYm91dCBDbG91ZGZsYXJlXHJcbiAqXHJcbiAqICBAX3N1YnNlY3Rpb246IGFwaS9wcm92aWRlcnMvdGhpcmRwYXJ0eTpDbG91ZGZsYXJlICBbcHJvdmlkZXJzLWNsb3VkZmxhcmVdXHJcbiAqL1xyXG5pbXBvcnQgeyBhc3NlcnRBcmd1bWVudCB9IGZyb20gXCIuLi91dGlscy9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyBOZXR3b3JrIH0gZnJvbSBcIi4vbmV0d29yay5qc1wiO1xyXG5pbXBvcnQgeyBKc29uUnBjUHJvdmlkZXIgfSBmcm9tIFwiLi9wcm92aWRlci1qc29ucnBjLmpzXCI7XHJcbi8qKlxyXG4gKiAgQWJvdXQgQ2xvdWRmbGFyZS4uLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENsb3VkZmxhcmVQcm92aWRlciBleHRlbmRzIEpzb25ScGNQcm92aWRlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihfbmV0d29yaykge1xyXG4gICAgICAgIGlmIChfbmV0d29yayA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIF9uZXR3b3JrID0gXCJtYWlubmV0XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5ldHdvcmsgPSBOZXR3b3JrLmZyb20oX25ldHdvcmspO1xyXG4gICAgICAgIGFzc2VydEFyZ3VtZW50KG5ldHdvcmsubmFtZSA9PT0gXCJtYWlubmV0XCIsIFwidW5zdXBwb3J0ZWQgbmV0d29ya1wiLCBcIm5ldHdvcmtcIiwgX25ldHdvcmspO1xyXG4gICAgICAgIHN1cGVyKFwiaHR0cHM6L1xcL2Nsb3VkZmxhcmUtZXRoLmNvbS9cIiwgbmV0d29yaywgeyBzdGF0aWNOZXR3b3JrOiBuZXR3b3JrIH0pO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByb3ZpZGVyLWNsb3VkZmxhcmUuanMubWFwIiwiLyoqXHJcbiAqICBbW2xpbmstZXRoZXJzY2FuXV0gcHJvdmlkZXMgYSB0aGlyZC1wYXJ0eSBzZXJ2aWNlIGZvciBjb25uZWN0aW5nIHRvXHJcbiAqICB2YXJpb3VzIGJsb2NrY2hhaW5zIG92ZXIgYSBjb21iaW5hdGlvbiBvZiBKU09OLVJQQyBhbmQgY3VzdG9tIEFQSVxyXG4gKiAgZW5kcG9pbnRzLlxyXG4gKlxyXG4gKiAgKipTdXBwb3J0ZWQgTmV0d29ya3MqKlxyXG4gKlxyXG4gKiAgLSBFdGhlcmV1bSBNYWlubmV0IChgYG1haW5uZXRgYClcclxuICogIC0gR29lcmxpIFRlc3RuZXQgKGBgZ29lcmxpYGApXHJcbiAqICAtIFNlcG9saWEgVGVzdG5ldCAoYGBzZXBvbGlhYGApXHJcbiAqICAtIEhvbGVza3kgVGVzdG5ldCAoYGBob2xlc2t5YGApXHJcbiAqICAtIEFyYml0cnVtIChgYGFyYml0cnVtYGApXHJcbiAqICAtIEFyYml0cnVtIEdvZXJsaSBUZXN0bmV0IChgYGFyYml0cnVtLWdvZXJsaWBgKVxyXG4gKiAgLSBCYXNlIChgYGJhc2VgYClcclxuICogIC0gQmFzZSBTZXBvbGlhIFRlc3RuZXQgKGBgYmFzZS1zZXBvbGlhYGApXHJcbiAqICAtIEJOQiBTbWFydCBDaGFpbiBNYWlubmV0IChgYGJuYmBgKVxyXG4gKiAgLSBCTkIgU21hcnQgQ2hhaW4gVGVzdG5ldCAoYGBibmJ0YGApXHJcbiAqICAtIE9wdGltaXNtIChgYG9wdGltaXNtYGApXHJcbiAqICAtIE9wdGltaXNtIEdvZXJsaSBUZXN0bmV0IChgYG9wdGltaXNtLWdvZXJsaWBgKVxyXG4gKiAgLSBQb2x5Z29uIChgYG1hdGljYGApXHJcbiAqICAtIFBvbHlnb24gTXVtYmFpIFRlc3RuZXQgKGBgbWF0aWMtbXVtYmFpYGApXHJcbiAqICAtIFBvbHlnb24gQW1veSBUZXN0bmV0IChgYG1hdGljLWFtb3lgYClcclxuICpcclxuICogIEBfc3Vic2VjdGlvbiBhcGkvcHJvdmlkZXJzL3RoaXJkcGFydHk6RXRoZXJzY2FuICBbcHJvdmlkZXJzLWV0aGVyc2Nhbl1cclxuICovXHJcbmltcG9ydCB7IEFiaUNvZGVyIH0gZnJvbSBcIi4uL2FiaS9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyBDb250cmFjdCB9IGZyb20gXCIuLi9jb250cmFjdC9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyBhY2Nlc3NMaXN0aWZ5LCBUcmFuc2FjdGlvbiB9IGZyb20gXCIuLi90cmFuc2FjdGlvbi9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyBkZWZpbmVQcm9wZXJ0aWVzLCBoZXhsaWZ5LCB0b1F1YW50aXR5LCBGZXRjaFJlcXVlc3QsIGFzc2VydCwgYXNzZXJ0QXJndW1lbnQsIGlzRXJyb3IsIFxyXG4vLyAgICBwYXJzZVVuaXRzLFxyXG50b1V0ZjhTdHJpbmcgfSBmcm9tIFwiLi4vdXRpbHMvaW5kZXguanNcIjtcclxuaW1wb3J0IHsgQWJzdHJhY3RQcm92aWRlciB9IGZyb20gXCIuL2Fic3RyYWN0LXByb3ZpZGVyLmpzXCI7XHJcbmltcG9ydCB7IE5ldHdvcmsgfSBmcm9tIFwiLi9uZXR3b3JrLmpzXCI7XHJcbmltcG9ydCB7IE5ldHdvcmtQbHVnaW4gfSBmcm9tIFwiLi9wbHVnaW5zLW5ldHdvcmsuanNcIjtcclxuaW1wb3J0IHsgc2hvd1Rocm90dGxlTWVzc2FnZSB9IGZyb20gXCIuL2NvbW11bml0eS5qc1wiO1xyXG5jb25zdCBUSFJPVFRMRSA9IDIwMDA7XHJcbmZ1bmN0aW9uIGlzUHJvbWlzZSh2YWx1ZSkge1xyXG4gICAgcmV0dXJuICh2YWx1ZSAmJiB0eXBlb2YgKHZhbHVlLnRoZW4pID09PSBcImZ1bmN0aW9uXCIpO1xyXG59XHJcbmNvbnN0IEV0aGVyc2NhblBsdWdpbklkID0gXCJvcmcuZXRoZXJzLnBsdWdpbnMucHJvdmlkZXIuRXRoZXJzY2FuXCI7XHJcbi8qKlxyXG4gKiAgQSBOZXR3b3JrIGNhbiBpbmNsdWRlIGFuICoqRXRoZXJzY2FuUGx1Z2luKiogdG8gcHJvdmlkZVxyXG4gKiAgYSBjdXN0b20gYmFzZSBVUkwuXHJcbiAqXHJcbiAqICBAX2RvY2xvYzogYXBpL3Byb3ZpZGVycy90aGlyZHBhcnR5OkV0aGVyc2NhblxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEV0aGVyc2NhblBsdWdpbiBleHRlbmRzIE5ldHdvcmtQbHVnaW4ge1xyXG4gICAgLyoqXHJcbiAgICAgKiAgVGhlIEV0aGVyc2NhbiBBUEkgYmFzZSBVUkwuXHJcbiAgICAgKi9cclxuICAgIGJhc2VVcmw7XHJcbiAgICAvKipcclxuICAgICAqICBDcmVhdGVzIGEgbmV3ICoqRXRoZXJzY2FuUHJvdmlkZXIqKiB3aGljaCB3aWxsIHVzZVxyXG4gICAgICogICUlYmFzZVVybCUlLlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihiYXNlVXJsKSB7XHJcbiAgICAgICAgc3VwZXIoRXRoZXJzY2FuUGx1Z2luSWQpO1xyXG4gICAgICAgIGRlZmluZVByb3BlcnRpZXModGhpcywgeyBiYXNlVXJsIH0pO1xyXG4gICAgfVxyXG4gICAgY2xvbmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBFdGhlcnNjYW5QbHVnaW4odGhpcy5iYXNlVXJsKTtcclxuICAgIH1cclxufVxyXG5jb25zdCBza2lwS2V5cyA9IFtcImVuYWJsZUNjaXBSZWFkXCJdO1xyXG5sZXQgbmV4dElkID0gMTtcclxuLyoqXHJcbiAqICBUaGUgKipFdGhlcnNjYW5CYXNlUHJvdmlkZXIqKiBpcyB0aGUgc3VwZXItY2xhc3Mgb2ZcclxuICogIFtbRXRoZXJzY2FuUHJvdmlkZXJdXSwgd2hpY2ggc2hvdWxkIGdlbmVyYWxseSBiZSB1c2VkIGluc3RlYWQuXHJcbiAqXHJcbiAqICBTaW5jZSB0aGUgKipFdGhlcnNjYW5Qcm92aWRlcioqIGluY2x1ZGVzIGFkZGl0aW9uYWwgY29kZSBmb3JcclxuICogIFtbQ29udHJhY3RdXSBhY2Nlc3MsIGluIC8vcmFyZSBjYXNlcy8vIHRoYXQgY29udHJhY3RzIGFyZSBub3RcclxuICogIHVzZWQsIHRoaXMgY2xhc3MgY2FuIHJlZHVjZSBjb2RlIHNpemUuXHJcbiAqXHJcbiAqICBAX2RvY2xvYzogYXBpL3Byb3ZpZGVycy90aGlyZHBhcnR5OkV0aGVyc2NhblxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEV0aGVyc2NhblByb3ZpZGVyIGV4dGVuZHMgQWJzdHJhY3RQcm92aWRlciB7XHJcbiAgICAvKipcclxuICAgICAqICBUaGUgY29ubmVjdGVkIG5ldHdvcmsuXHJcbiAgICAgKi9cclxuICAgIG5ldHdvcms7XHJcbiAgICAvKipcclxuICAgICAqICBUaGUgQVBJIGtleSBvciBudWxsIGlmIHVzaW5nIHRoZSBjb21tdW5pdHkgcHJvdmlkZWQgYmFuZHdpZHRoLlxyXG4gICAgICovXHJcbiAgICBhcGlLZXk7XHJcbiAgICAjcGx1Z2luO1xyXG4gICAgLyoqXHJcbiAgICAgKiAgQ3JlYXRlcyBhIG5ldyAqKkV0aGVyc2NhbkJhc2VQcm92aWRlcioqLlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihfbmV0d29yaywgX2FwaUtleSkge1xyXG4gICAgICAgIGNvbnN0IGFwaUtleSA9IChfYXBpS2V5ICE9IG51bGwpID8gX2FwaUtleSA6IG51bGw7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICBjb25zdCBuZXR3b3JrID0gTmV0d29yay5mcm9tKF9uZXR3b3JrKTtcclxuICAgICAgICB0aGlzLiNwbHVnaW4gPSBuZXR3b3JrLmdldFBsdWdpbihFdGhlcnNjYW5QbHVnaW5JZCk7XHJcbiAgICAgICAgZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7IGFwaUtleSwgbmV0d29yayB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogIFJldHVybnMgdGhlIGJhc2UgVVJMLlxyXG4gICAgICpcclxuICAgICAqICBJZiBhbiBbW0V0aGVyc2NhblBsdWdpbl1dIGlzIGNvbmZpZ3VyZWQgb24gdGhlXHJcbiAgICAgKiAgW1tFdGhlcnNjYW5CYXNlUHJvdmlkZXJfbmV0d29ya11dLCByZXR1cm5zIHRoZSBwbHVnaW4nc1xyXG4gICAgICogIGJhc2VVcmwuXHJcbiAgICAgKlxyXG4gICAgICogIERlcHJlY2F0ZWQ7IGZvciBFdGhlcnNjYW4gdjIgdGhlIGJhc2UgaXMgbm8gbG9uZ2VyIGEgc2ltcGx5XHJcbiAgICAgKiAgaG9zdCwgYnV0IGluc3RlYWQgYSBVUkwgaW5jbHVkaW5nIGEgY2hhaW5JZCBwYXJhbWV0ZXIuIENoYW5naW5nXHJcbiAgICAgKiAgdGhpcyB0byByZXR1cm4gYSBVUkwgcHJlZml4IGNvdWxkIGJyZWFrIHNvbWUgbGlicmFyaWVzLCBzbyBpdFxyXG4gICAgICogIGlzIGxlZnQgaW50YWN0IGJ1dCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIGZ1dHVyZSBhcyBpdCBpcyB1bnVzZWQuXHJcbiAgICAgKi9cclxuICAgIGdldEJhc2VVcmwoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuI3BsdWdpbikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy4jcGx1Z2luLmJhc2VVcmw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN3aXRjaCAodGhpcy5uZXR3b3JrLm5hbWUpIHtcclxuICAgICAgICAgICAgY2FzZSBcIm1haW5uZXRcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi9cXC9hcGkuZXRoZXJzY2FuLmlvXCI7XHJcbiAgICAgICAgICAgIGNhc2UgXCJnb2VybGlcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi9cXC9hcGktZ29lcmxpLmV0aGVyc2Nhbi5pb1wiO1xyXG4gICAgICAgICAgICBjYXNlIFwic2Vwb2xpYVwiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2FwaS1zZXBvbGlhLmV0aGVyc2Nhbi5pb1wiO1xyXG4gICAgICAgICAgICBjYXNlIFwiaG9sZXNreVwiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2FwaS1ob2xlc2t5LmV0aGVyc2Nhbi5pb1wiO1xyXG4gICAgICAgICAgICBjYXNlIFwiYXJiaXRydW1cIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi9cXC9hcGkuYXJiaXNjYW4uaW9cIjtcclxuICAgICAgICAgICAgY2FzZSBcImFyYml0cnVtLWdvZXJsaVwiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2FwaS1nb2VybGkuYXJiaXNjYW4uaW9cIjtcclxuICAgICAgICAgICAgY2FzZSBcImJhc2VcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi9cXC9hcGkuYmFzZXNjYW4ub3JnXCI7XHJcbiAgICAgICAgICAgIGNhc2UgXCJiYXNlLXNlcG9saWFcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi9cXC9hcGktc2Vwb2xpYS5iYXNlc2Nhbi5vcmdcIjtcclxuICAgICAgICAgICAgY2FzZSBcImJuYlwiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2FwaS5ic2NzY2FuLmNvbVwiO1xyXG4gICAgICAgICAgICBjYXNlIFwiYm5idFwiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2FwaS10ZXN0bmV0LmJzY3NjYW4uY29tXCI7XHJcbiAgICAgICAgICAgIGNhc2UgXCJtYXRpY1wiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2FwaS5wb2x5Z29uc2Nhbi5jb21cIjtcclxuICAgICAgICAgICAgY2FzZSBcIm1hdGljLWFtb3lcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi9cXC9hcGktYW1veS5wb2x5Z29uc2Nhbi5jb21cIjtcclxuICAgICAgICAgICAgY2FzZSBcIm1hdGljLW11bWJhaVwiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2FwaS10ZXN0bmV0LnBvbHlnb25zY2FuLmNvbVwiO1xyXG4gICAgICAgICAgICBjYXNlIFwib3B0aW1pc21cIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi9cXC9hcGktb3B0aW1pc3RpYy5ldGhlcnNjYW4uaW9cIjtcclxuICAgICAgICAgICAgY2FzZSBcIm9wdGltaXNtLWdvZXJsaVwiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2FwaS1nb2VybGktb3B0aW1pc3RpYy5ldGhlcnNjYW4uaW9cIjtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICB9XHJcbiAgICAgICAgYXNzZXJ0QXJndW1lbnQoZmFsc2UsIFwidW5zdXBwb3J0ZWQgbmV0d29ya1wiLCBcIm5ldHdvcmtcIiwgdGhpcy5uZXR3b3JrKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogIFJldHVybnMgdGhlIFVSTCBmb3IgdGhlICUlbW9kdWxlJSUgYW5kICUlcGFyYW1zJSUuXHJcbiAgICAgKi9cclxuICAgIGdldFVybChtb2R1bGUsIHBhcmFtcykge1xyXG4gICAgICAgIGxldCBxdWVyeSA9IE9iamVjdC5rZXlzKHBhcmFtcykucmVkdWNlKChhY2N1bSwga2V5KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyYW1zW2tleV07XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBhY2N1bSArPSBgJiR7a2V5fT0ke3ZhbHVlfWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGFjY3VtO1xyXG4gICAgICAgIH0sIFwiXCIpO1xyXG4gICAgICAgIGlmICh0aGlzLmFwaUtleSkge1xyXG4gICAgICAgICAgICBxdWVyeSArPSBgJmFwaWtleT0ke3RoaXMuYXBpS2V5fWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBgaHR0cHM6L1xcL2FwaS5ldGhlcnNjYW4uaW8vdjIvYXBpP2NoYWluaWQ9JHt0aGlzLm5ldHdvcmsuY2hhaW5JZH0mbW9kdWxlPSR7bW9kdWxlfSR7cXVlcnl9YDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogIFJldHVybnMgdGhlIFVSTCBmb3IgdXNpbmcgUE9TVCByZXF1ZXN0cy5cclxuICAgICAqL1xyXG4gICAgZ2V0UG9zdFVybCgpIHtcclxuICAgICAgICByZXR1cm4gYGh0dHBzOi9cXC9hcGkuZXRoZXJzY2FuLmlvL3YyL2FwaT9jaGFpbmlkPSR7dGhpcy5uZXR3b3JrLmNoYWluSWR9YDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogIFJldHVybnMgdGhlIHBhcmFtZXRlcnMgZm9yIHVzaW5nIFBPU1QgcmVxdWVzdHMuXHJcbiAgICAgKi9cclxuICAgIGdldFBvc3REYXRhKG1vZHVsZSwgcGFyYW1zKSB7XHJcbiAgICAgICAgcGFyYW1zLm1vZHVsZSA9IG1vZHVsZTtcclxuICAgICAgICBwYXJhbXMuYXBpa2V5ID0gdGhpcy5hcGlLZXk7XHJcbiAgICAgICAgcGFyYW1zLmNoYWluaWQgPSB0aGlzLm5ldHdvcmsuY2hhaW5JZDtcclxuICAgICAgICByZXR1cm4gcGFyYW1zO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgZGV0ZWN0TmV0d29yaygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5uZXR3b3JrO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiAgUmVzb2x2ZXMgdG8gdGhlIHJlc3VsdCBvZiBjYWxsaW5nICUlbW9kdWxlJSUgd2l0aCAlJXBhcmFtcyUlLlxyXG4gICAgICpcclxuICAgICAqICBJZiAlJXBvc3QlJSwgdGhlIHJlcXVlc3QgaXMgbWFkZSBhcyBhIFBPU1QgcmVxdWVzdC5cclxuICAgICAqL1xyXG4gICAgYXN5bmMgZmV0Y2gobW9kdWxlLCBwYXJhbXMsIHBvc3QpIHtcclxuICAgICAgICBjb25zdCBpZCA9IG5leHRJZCsrO1xyXG4gICAgICAgIGNvbnN0IHVybCA9IChwb3N0ID8gdGhpcy5nZXRQb3N0VXJsKCkgOiB0aGlzLmdldFVybChtb2R1bGUsIHBhcmFtcykpO1xyXG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSAocG9zdCA/IHRoaXMuZ2V0UG9zdERhdGEobW9kdWxlLCBwYXJhbXMpIDogbnVsbCk7XHJcbiAgICAgICAgdGhpcy5lbWl0KFwiZGVidWdcIiwgeyBhY3Rpb246IFwic2VuZFJlcXVlc3RcIiwgaWQsIHVybCwgcGF5bG9hZDogcGF5bG9hZCB9KTtcclxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gbmV3IEZldGNoUmVxdWVzdCh1cmwpO1xyXG4gICAgICAgIHJlcXVlc3Quc2V0VGhyb3R0bGVQYXJhbXMoeyBzbG90SW50ZXJ2YWw6IDEwMDAgfSk7XHJcbiAgICAgICAgcmVxdWVzdC5yZXRyeUZ1bmMgPSAocmVxLCByZXNwLCBhdHRlbXB0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQ29tbXVuaXR5UmVzb3VyY2UoKSkge1xyXG4gICAgICAgICAgICAgICAgc2hvd1Rocm90dGxlTWVzc2FnZShcIkV0aGVyc2NhblwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmVxdWVzdC5wcm9jZXNzRnVuYyA9IGFzeW5jIChyZXF1ZXN0LCByZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSByZXNwb25zZS5oYXNCb2R5KCkgPyBKU09OLnBhcnNlKHRvVXRmOFN0cmluZyhyZXNwb25zZS5ib2R5KSkgOiB7fTtcclxuICAgICAgICAgICAgY29uc3QgdGhyb3R0bGUgPSAoKHR5cGVvZiAocmVzdWx0LnJlc3VsdCkgPT09IFwic3RyaW5nXCIpID8gcmVzdWx0LnJlc3VsdCA6IFwiXCIpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihcInJhdGUgbGltaXRcIikgPj0gMDtcclxuICAgICAgICAgICAgaWYgKG1vZHVsZSA9PT0gXCJwcm94eVwiKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUaGlzIEpTT04gcmVzcG9uc2UgaW5kaWNhdGVzIHdlIGFyZSBiZWluZyB0aHJvdHRsZWRcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN0YXR1cyA9PSAwICYmIHJlc3VsdC5tZXNzYWdlID09IFwiTk9UT0tcIiAmJiB0aHJvdHRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcImRlYnVnXCIsIHsgYWN0aW9uOiBcInJlY2VpdmVFcnJvclwiLCBpZCwgcmVhc29uOiBcInByb3h5LU5PVE9LXCIsIGVycm9yOiByZXN1bHQgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UudGhyb3dUaHJvdHRsZUVycm9yKHJlc3VsdC5yZXN1bHQsIFRIUk9UVExFKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aHJvdHRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcImRlYnVnXCIsIHsgYWN0aW9uOiBcInJlY2VpdmVFcnJvclwiLCBpZCwgcmVhc29uOiBcIm51bGwgcmVzdWx0XCIsIGVycm9yOiByZXN1bHQucmVzdWx0IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLnRocm93VGhyb3R0bGVFcnJvcihyZXN1bHQucmVzdWx0LCBUSFJPVFRMRSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHBheWxvYWQpIHtcclxuICAgICAgICAgICAgcmVxdWVzdC5zZXRIZWFkZXIoXCJjb250ZW50LXR5cGVcIiwgXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLThcIik7XHJcbiAgICAgICAgICAgIHJlcXVlc3QuYm9keSA9IE9iamVjdC5rZXlzKHBheWxvYWQpLm1hcCgoaykgPT4gYCR7a309JHtwYXlsb2FkW2tdfWApLmpvaW4oXCImXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3Quc2VuZCgpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlLmFzc2VydE9rKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICB0aGlzLmVtaXQoXCJkZWJ1Z1wiLCB7IGFjdGlvbjogXCJyZWNlaXZlRXJyb3JcIiwgaWQsIGVycm9yLCByZWFzb246IFwiYXNzZXJ0T2tcIiB9KTtcclxuICAgICAgICAgICAgYXNzZXJ0KGZhbHNlLCBcInJlc3BvbnNlIGVycm9yXCIsIFwiU0VSVkVSX0VSUk9SXCIsIHsgcmVxdWVzdCwgcmVzcG9uc2UgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghcmVzcG9uc2UuaGFzQm9keSgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdChcImRlYnVnXCIsIHsgYWN0aW9uOiBcInJlY2VpdmVFcnJvclwiLCBpZCwgZXJyb3I6IFwibWlzc2luZyBib2R5XCIsIHJlYXNvbjogXCJudWxsIGJvZHlcIiB9KTtcclxuICAgICAgICAgICAgYXNzZXJ0KGZhbHNlLCBcIm1pc3NpbmcgcmVzcG9uc2VcIiwgXCJTRVJWRVJfRVJST1JcIiwgeyByZXF1ZXN0LCByZXNwb25zZSB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gSlNPTi5wYXJzZSh0b1V0ZjhTdHJpbmcocmVzcG9uc2UuYm9keSkpO1xyXG4gICAgICAgIGlmIChtb2R1bGUgPT09IFwicHJveHlcIikge1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0Lmpzb25ycGMgIT0gXCIyLjBcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KFwiZGVidWdcIiwgeyBhY3Rpb246IFwicmVjZWl2ZUVycm9yXCIsIGlkLCByZXN1bHQsIHJlYXNvbjogXCJpbnZhbGlkIEpTT04tUlBDXCIgfSk7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UsIFwiaW52YWxpZCBKU09OLVJQQyByZXNwb25zZSAobWlzc2luZyBqc29ucnBjPScyLjAnKVwiLCBcIlNFUlZFUl9FUlJPUlwiLCB7IHJlcXVlc3QsIHJlc3BvbnNlLCBpbmZvOiB7IHJlc3VsdCB9IH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQuZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcImRlYnVnXCIsIHsgYWN0aW9uOiBcInJlY2VpdmVFcnJvclwiLCBpZCwgcmVzdWx0LCByZWFzb246IFwiSlNPTi1SUEMgZXJyb3JcIiB9KTtcclxuICAgICAgICAgICAgICAgIGFzc2VydChmYWxzZSwgXCJlcnJvciByZXNwb25zZVwiLCBcIlNFUlZFUl9FUlJPUlwiLCB7IHJlcXVlc3QsIHJlc3BvbnNlLCBpbmZvOiB7IHJlc3VsdCB9IH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdChcImRlYnVnXCIsIHsgYWN0aW9uOiBcInJlY2VpdmVSZXF1ZXN0XCIsIGlkLCByZXN1bHQgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQucmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gZ2V0TG9ncywgZ2V0SGlzdG9yeSBoYXZlIHdlaXJkIHN1Y2Nlc3MgcmVzcG9uc2VzXHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09IDAgJiYgKHJlc3VsdC5tZXNzYWdlID09PSBcIk5vIHJlY29yZHMgZm91bmRcIiB8fCByZXN1bHQubWVzc2FnZSA9PT0gXCJObyB0cmFuc2FjdGlvbnMgZm91bmRcIikpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcImRlYnVnXCIsIHsgYWN0aW9uOiBcInJlY2VpdmVSZXF1ZXN0XCIsIGlkLCByZXN1bHQgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0LnJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyAhPSAxIHx8ICh0eXBlb2YgKHJlc3VsdC5tZXNzYWdlKSA9PT0gXCJzdHJpbmdcIiAmJiAhcmVzdWx0Lm1lc3NhZ2UubWF0Y2goL15PSy8pKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KFwiZGVidWdcIiwgeyBhY3Rpb246IFwicmVjZWl2ZUVycm9yXCIsIGlkLCByZXN1bHQgfSk7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UsIFwiZXJyb3IgcmVzcG9uc2VcIiwgXCJTRVJWRVJfRVJST1JcIiwgeyByZXF1ZXN0LCByZXNwb25zZSwgaW5mbzogeyByZXN1bHQgfSB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmVtaXQoXCJkZWJ1Z1wiLCB7IGFjdGlvbjogXCJyZWNlaXZlUmVxdWVzdFwiLCBpZCwgcmVzdWx0IH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqICBSZXR1cm5zICUldHJhbnNhY3Rpb24lJSBub3JtYWxpemVkIGZvciB0aGUgRXRoZXJzY2FuIEFQSS5cclxuICAgICAqL1xyXG4gICAgX2dldFRyYW5zYWN0aW9uUG9zdERhdGEodHJhbnNhY3Rpb24pIHtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSB7fTtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdHJhbnNhY3Rpb24pIHtcclxuICAgICAgICAgICAgaWYgKHNraXBLZXlzLmluZGV4T2Yoa2V5KSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHJhbnNhY3Rpb25ba2V5XSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0cmFuc2FjdGlvbltrZXldO1xyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSBcInR5cGVcIiAmJiB2YWx1ZSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gXCJibG9ja1RhZ1wiICYmIHZhbHVlID09PSBcImxhdGVzdFwiKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBRdWFudGl0eS10eXBlcyByZXF1aXJlIG5vIGxlYWRpbmcgemVybywgdW5sZXNzIDBcclxuICAgICAgICAgICAgaWYgKHsgdHlwZTogdHJ1ZSwgZ2FzTGltaXQ6IHRydWUsIGdhc1ByaWNlOiB0cnVlLCBtYXhGZWVQZXJHczogdHJ1ZSwgbWF4UHJpb3JpdHlGZWVQZXJHYXM6IHRydWUsIG5vbmNlOiB0cnVlLCB2YWx1ZTogdHJ1ZSB9W2tleV0pIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdG9RdWFudGl0eSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5ID09PSBcImFjY2Vzc0xpc3RcIikge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBcIltcIiArIGFjY2Vzc0xpc3RpZnkodmFsdWUpLm1hcCgoc2V0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGB7YWRkcmVzczpcIiR7c2V0LmFkZHJlc3N9XCIsc3RvcmFnZUtleXM6W1wiJHtzZXQuc3RvcmFnZUtleXMuam9pbignXCIsXCInKX1cIl19YDtcclxuICAgICAgICAgICAgICAgIH0pLmpvaW4oXCIsXCIpICsgXCJdXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5ID09PSBcImJsb2JWZXJzaW9uZWRIYXNoZXNcIikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gQFRPRE86IHVwZGF0ZSB0aGlzIG9uY2UgdGhlIEFQSSBzdXBwb3J0cyBibG9ic1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KGZhbHNlLCBcIkV0aGVyc2NhbiBBUEkgZG9lcyBub3Qgc3VwcG9ydCBibG9iVmVyc2lvbmVkSGFzaGVzXCIsIFwiVU5TVVBQT1JURURfT1BFUkFUSU9OXCIsIHtcclxuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb246IFwiX2dldFRyYW5zYWN0aW9uUG9zdERhdGFcIixcclxuICAgICAgICAgICAgICAgICAgICBpbmZvOiB7IHRyYW5zYWN0aW9uIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBoZXhsaWZ5KHZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiAgVGhyb3dzIHRoZSBub3JtYWxpemVkIEV0aGVyc2NhbiBlcnJvci5cclxuICAgICAqL1xyXG4gICAgX2NoZWNrRXJyb3IocmVxLCBlcnJvciwgdHJhbnNhY3Rpb24pIHtcclxuICAgICAgICAvLyBQdWxsIGFueSBtZXNzYWdlIG91dCBpZiwgcG9zc2libGVcclxuICAgICAgICBsZXQgbWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgaWYgKGlzRXJyb3IoZXJyb3IsIFwiU0VSVkVSX0VSUk9SXCIpKSB7XHJcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBhbiBlcnJvciBlbWl0dGVkIGJ5IGEgcHJveHkgY2FsbFxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGVycm9yLmluZm8ucmVzdWx0LmVycm9yLm1lc3NhZ2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGUpIHsgfVxyXG4gICAgICAgICAgICBpZiAoIW1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGVycm9yLmluZm8ubWVzc2FnZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gXCJlc3RpbWF0ZUdhc1wiKSB7XHJcbiAgICAgICAgICAgIGlmICghbWVzc2FnZS5tYXRjaCgvcmV2ZXJ0L2kpICYmIG1lc3NhZ2UubWF0Y2goL2luc3VmZmljaWVudCBmdW5kcy9pKSkge1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KGZhbHNlLCBcImluc3VmZmljaWVudCBmdW5kc1wiLCBcIklOU1VGRklDSUVOVF9GVU5EU1wiLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb246IHJlcS50cmFuc2FjdGlvblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09IFwiY2FsbFwiIHx8IHJlcS5tZXRob2QgPT09IFwiZXN0aW1hdGVHYXNcIikge1xyXG4gICAgICAgICAgICBpZiAobWVzc2FnZS5tYXRjaCgvZXhlY3V0aW9uIHJldmVydGVkL2kpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBlcnJvci5pbmZvLnJlc3VsdC5lcnJvci5kYXRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7IH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IGUgPSBBYmlDb2Rlci5nZXRCdWlsdGluQ2FsbEV4Y2VwdGlvbihyZXEubWV0aG9kLCByZXEudHJhbnNhY3Rpb24sIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgZS5pbmZvID0geyByZXF1ZXN0OiByZXEsIGVycm9yIH07XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChyZXEubWV0aG9kID09PSBcImJyb2FkY2FzdFRyYW5zYWN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uID0gVHJhbnNhY3Rpb24uZnJvbShyZXEuc2lnbmVkVHJhbnNhY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UubWF0Y2goL3JlcGxhY2VtZW50L2kpICYmIG1lc3NhZ2UubWF0Y2goL3VuZGVycHJpY2VkL2kpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGZhbHNlLCBcInJlcGxhY2VtZW50IGZlZSB0b28gbG93XCIsIFwiUkVQTEFDRU1FTlRfVU5ERVJQUklDRURcIiwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UubWF0Y2goL2luc3VmZmljaWVudCBmdW5kcy8pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGZhbHNlLCBcImluc3VmZmljaWVudCBmdW5kcyBmb3IgaW50cmluc2ljIHRyYW5zYWN0aW9uIGNvc3RcIiwgXCJJTlNVRkZJQ0lFTlRfRlVORFNcIiwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UubWF0Y2goL3NhbWUgaGFzaCB3YXMgYWxyZWFkeSBpbXBvcnRlZHx0cmFuc2FjdGlvbiBub25jZSBpcyB0b28gbG93fG5vbmNlIHRvbyBsb3cvKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChmYWxzZSwgXCJub25jZSBoYXMgYWxyZWFkeSBiZWVuIHVzZWRcIiwgXCJOT05DRV9FWFBJUkVEXCIsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBTb21ldGhpbmcgd2UgY291bGQgbm90IHByb2Nlc3NcclxuICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH1cclxuICAgIGFzeW5jIF9kZXRlY3ROZXR3b3JrKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5ldHdvcms7XHJcbiAgICB9XHJcbiAgICBhc3luYyBfcGVyZm9ybShyZXEpIHtcclxuICAgICAgICBzd2l0Y2ggKHJlcS5tZXRob2QpIHtcclxuICAgICAgICAgICAgY2FzZSBcImNoYWluSWRcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm5ldHdvcmsuY2hhaW5JZDtcclxuICAgICAgICAgICAgY2FzZSBcImdldEJsb2NrTnVtYmVyXCI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mZXRjaChcInByb3h5XCIsIHsgYWN0aW9uOiBcImV0aF9ibG9ja051bWJlclwiIH0pO1xyXG4gICAgICAgICAgICBjYXNlIFwiZ2V0R2FzUHJpY2VcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZldGNoKFwicHJveHlcIiwgeyBhY3Rpb246IFwiZXRoX2dhc1ByaWNlXCIgfSk7XHJcbiAgICAgICAgICAgIGNhc2UgXCJnZXRQcmlvcml0eUZlZVwiOlxyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0ZW1wb3JhcnkgdW50aWwgRXRoZXJzY2FuIGNvbXBsZXRlcyBzdXBwb3J0XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5uZXR3b3JrLm5hbWUgPT09IFwibWFpbm5ldFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiMTAwMDAwMDAwMFwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5uZXR3b3JrLm5hbWUgPT09IFwib3B0aW1pc21cIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIjEwMDAwMDBcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImZhbGxiYWNrIG9udG8gdGhlIEFic3RyYWN0UHJvdmlkZXIgZGVmYXVsdFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLyogV29ya2luZyB3aXRoIEV0aGVyc2NhbiB0byBnZXQgdGhpcyBhZGRlZDpcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRlc3QgPSBhd2FpdCB0aGlzLmZldGNoKFwicHJveHlcIiwge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJldGhfbWF4UHJpb3JpdHlGZWVQZXJHYXNcIlxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0ZXN0KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0O1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRFQlVHXCIsIGUpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAvKiBUaGlzIG1pZ2h0IGJlIHNhZmU7IGJ1dCBkdWUgdG8gcm91bmRpbmcgbmVpdGhlciBteXNlbGZcclxuICAgICAgICAgICAgICAgb3IgRXRoZXJzY2FuIGFyZSBuZWNlc3NhcmlseSBjb21mb3J0YWJsZSB3aXRoIHRoaXMuIDopXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmZldGNoKFwiZ2FzdHJhY2tlclwiLCB7IGFjdGlvbjogXCJnYXNvcmFjbGVcIiB9KTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBnYXNQcmljZSA9IHBhcnNlVW5pdHMocmVzdWx0LlNhZmVHYXNQcmljZSwgXCJnd2VpXCIpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYmFzZUZlZSA9IHBhcnNlVW5pdHMocmVzdWx0LnN1Z2dlc3RCYXNlRmVlLCBcImd3ZWlcIik7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmlvcml0eUZlZSA9IGdhc1ByaWNlIC0gYmFzZUZlZTtcclxuICAgICAgICAgICAgICAgIGlmIChwcmlvcml0eUZlZSA8IDApIHsgdGhyb3cgbmV3IEVycm9yKFwibmVnYXRpdmUgcHJpb3JpdHkgZmVlOyBkZWZlciB0byBhYnN0cmFjdCBwcm92aWRlciBkZWZhdWx0XCIpOyB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJpb3JpdHlGZWU7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRFQlVHXCIsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGNhc2UgXCJnZXRCYWxhbmNlXCI6XHJcbiAgICAgICAgICAgICAgICAvLyBSZXR1cm5zIGJhc2UtMTAgcmVzdWx0XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mZXRjaChcImFjY291bnRcIiwge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJiYWxhbmNlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYWRkcmVzczogcmVxLmFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgdGFnOiByZXEuYmxvY2tUYWdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjYXNlIFwiZ2V0VHJhbnNhY3Rpb25Db3VudFwiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2goXCJwcm94eVwiLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcImV0aF9nZXRUcmFuc2FjdGlvbkNvdW50XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYWRkcmVzczogcmVxLmFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgdGFnOiByZXEuYmxvY2tUYWdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjYXNlIFwiZ2V0Q29kZVwiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2goXCJwcm94eVwiLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcImV0aF9nZXRDb2RlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYWRkcmVzczogcmVxLmFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgdGFnOiByZXEuYmxvY2tUYWdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjYXNlIFwiZ2V0U3RvcmFnZVwiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2goXCJwcm94eVwiLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcImV0aF9nZXRTdG9yYWdlQXRcIixcclxuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiByZXEuYWRkcmVzcyxcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogcmVxLnBvc2l0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHRhZzogcmVxLmJsb2NrVGFnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2FzZSBcImJyb2FkY2FzdFRyYW5zYWN0aW9uXCI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mZXRjaChcInByb3h5XCIsIHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwiZXRoX3NlbmRSYXdUcmFuc2FjdGlvblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGhleDogcmVxLnNpZ25lZFRyYW5zYWN0aW9uXHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKS5jYXRjaCgoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY2hlY2tFcnJvcihyZXEsIGVycm9yLCByZXEuc2lnbmVkVHJhbnNhY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNhc2UgXCJnZXRCbG9ja1wiOlxyXG4gICAgICAgICAgICAgICAgaWYgKFwiYmxvY2tUYWdcIiBpbiByZXEpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mZXRjaChcInByb3h5XCIsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcImV0aF9nZXRCbG9ja0J5TnVtYmVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZzogcmVxLmJsb2NrVGFnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib29sZWFuOiAocmVxLmluY2x1ZGVUcmFuc2FjdGlvbnMgPyBcInRydWVcIiA6IFwiZmFsc2VcIilcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGFzc2VydChmYWxzZSwgXCJnZXRCbG9jayBieSBibG9ja0hhc2ggbm90IHN1cHBvcnRlZCBieSBFdGhlcnNjYW5cIiwgXCJVTlNVUFBPUlRFRF9PUEVSQVRJT05cIiwge1xyXG4gICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbjogXCJnZXRCbG9jayhibG9ja0hhc2gpXCJcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjYXNlIFwiZ2V0VHJhbnNhY3Rpb25cIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZldGNoKFwicHJveHlcIiwge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJldGhfZ2V0VHJhbnNhY3Rpb25CeUhhc2hcIixcclxuICAgICAgICAgICAgICAgICAgICB0eGhhc2g6IHJlcS5oYXNoXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2FzZSBcImdldFRyYW5zYWN0aW9uUmVjZWlwdFwiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2goXCJwcm94eVwiLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcImV0aF9nZXRUcmFuc2FjdGlvblJlY2VpcHRcIixcclxuICAgICAgICAgICAgICAgICAgICB0eGhhc2g6IHJlcS5oYXNoXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2FzZSBcImNhbGxcIjoge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcS5ibG9ja1RhZyAhPT0gXCJsYXRlc3RcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV0aGVyc2NhblByb3ZpZGVyIGRvZXMgbm90IHN1cHBvcnQgYmxvY2tUYWcgZm9yIGNhbGxcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwb3N0RGF0YSA9IHRoaXMuX2dldFRyYW5zYWN0aW9uUG9zdERhdGEocmVxLnRyYW5zYWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIHBvc3REYXRhLm1vZHVsZSA9IFwicHJveHlcIjtcclxuICAgICAgICAgICAgICAgIHBvc3REYXRhLmFjdGlvbiA9IFwiZXRoX2NhbGxcIjtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZmV0Y2goXCJwcm94eVwiLCBwb3N0RGF0YSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY2hlY2tFcnJvcihyZXEsIGVycm9yLCByZXEudHJhbnNhY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgXCJlc3RpbWF0ZUdhc1wiOiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwb3N0RGF0YSA9IHRoaXMuX2dldFRyYW5zYWN0aW9uUG9zdERhdGEocmVxLnRyYW5zYWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIHBvc3REYXRhLm1vZHVsZSA9IFwicHJveHlcIjtcclxuICAgICAgICAgICAgICAgIHBvc3REYXRhLmFjdGlvbiA9IFwiZXRoX2VzdGltYXRlR2FzXCI7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmZldGNoKFwicHJveHlcIiwgcG9zdERhdGEsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NoZWNrRXJyb3IocmVxLCBlcnJvciwgcmVxLnRyYW5zYWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZ2V0TG9nc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOZWVkcyB0byBjb21wbGFpbiBpZiBtb3JlIHRoYW4gb25lIGFkZHJlc3MgaXMgcGFzc2VkIGluXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhcmdzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0geyBhY3Rpb246IFwiZ2V0TG9nc1wiIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlci5mcm9tQmxvY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzLmZyb21CbG9jayA9IGNoZWNrTG9nVGFnKHBhcmFtcy5maWx0ZXIuZnJvbUJsb2NrKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlci50b0Jsb2NrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJncy50b0Jsb2NrID0gY2hlY2tMb2dUYWcocGFyYW1zLmZpbHRlci50b0Jsb2NrKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlci5hZGRyZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJncy5hZGRyZXNzID0gcGFyYW1zLmZpbHRlci5hZGRyZXNzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEBUT0RPOiBXZSBjYW4gaGFuZGxlIHNsaWdodGx5IG1vcmUgY29tcGxpY2F0ZWQgbG9ncyB1c2luZyB0aGUgbG9ncyBBUElcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbXMuZmlsdGVyLnRvcGljcyAmJiBwYXJhbXMuZmlsdGVyLnRvcGljcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXIudG9waWNzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLnRocm93RXJyb3IoXCJ1bnN1cHBvcnRlZCB0b3BpYyBjb3VudFwiLCBMb2dnZXIuRXJyb3JzLlVOU1VQUE9SVEVEX09QRVJBVElPTiwgeyB0b3BpY3M6IHBhcmFtcy5maWx0ZXIudG9waWNzIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlci50b3BpY3MubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvcGljMCA9IHBhcmFtcy5maWx0ZXIudG9waWNzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mKHRvcGljMCkgIT09IFwic3RyaW5nXCIgfHwgdG9waWMwLmxlbmd0aCAhPT0gNjYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci50aHJvd0Vycm9yKFwidW5zdXBwb3J0ZWQgdG9waWMgZm9ybWF0XCIsIExvZ2dlci5FcnJvcnMuVU5TVVBQT1JURURfT1BFUkFUSU9OLCB7IHRvcGljMDogdG9waWMwIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MudG9waWMwID0gdG9waWMwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2dzOiBBcnJheTxhbnk+ID0gYXdhaXQgdGhpcy5mZXRjaChcImxvZ3NcIiwgYXJncyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2FjaGUgdHhIYXNoID0+IGJsb2NrSGFzaFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJsb2NrczogeyBbdGFnOiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCBhbnkgbWlzc2luZyBibG9ja0hhc2ggdG8gdGhlIGxvZ3NcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9ncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvZyA9IGxvZ3NbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvZy5ibG9ja0hhc2ggIT0gbnVsbCkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChibG9ja3NbbG9nLmJsb2NrTnVtYmVyXSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJsb2NrID0gYXdhaXQgdGhpcy5nZXRCbG9jayhsb2cuYmxvY2tOdW1iZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmxvY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJsb2Nrc1tsb2cuYmxvY2tOdW1iZXJdID0gYmxvY2suaGFzaDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmJsb2NrSGFzaCA9IGJsb2Nrc1tsb2cuYmxvY2tOdW1iZXJdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2dzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1cGVyLl9wZXJmb3JtKHJlcSk7XHJcbiAgICB9XHJcbiAgICBhc3luYyBnZXROZXR3b3JrKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5ldHdvcms7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqICBSZXNvbHZlcyB0byB0aGUgY3VycmVudCBwcmljZSBvZiBldGhlci5cclxuICAgICAqXHJcbiAgICAgKiAgVGhpcyByZXR1cm5zIGBgMGBgIG9uIGFueSBuZXR3b3JrIG90aGVyIHRoYW4gYGBtYWlubmV0YGAuXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGdldEV0aGVyUHJpY2UoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubmV0d29yay5uYW1lICE9PSBcIm1haW5uZXRcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gMC4wO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCgoYXdhaXQgdGhpcy5mZXRjaChcInN0YXRzXCIsIHsgYWN0aW9uOiBcImV0aHByaWNlXCIgfSkpLmV0aHVzZCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqICBSZXNvbHZlcyB0byBhIFtDb250cmFjdF1dIGZvciAlJWFkZHJlc3MlJSwgdXNpbmcgdGhlXHJcbiAgICAgKiAgRXRoZXJzY2FuIEFQSSB0byByZXRyZWl2ZSB0aGUgQ29udHJhY3QgQUJJLlxyXG4gICAgICovXHJcbiAgICBhc3luYyBnZXRDb250cmFjdChfYWRkcmVzcykge1xyXG4gICAgICAgIGxldCBhZGRyZXNzID0gdGhpcy5fZ2V0QWRkcmVzcyhfYWRkcmVzcyk7XHJcbiAgICAgICAgaWYgKGlzUHJvbWlzZShhZGRyZXNzKSkge1xyXG4gICAgICAgICAgICBhZGRyZXNzID0gYXdhaXQgYWRkcmVzcztcclxuICAgICAgICB9XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IHRoaXMuZmV0Y2goXCJjb250cmFjdFwiLCB7XHJcbiAgICAgICAgICAgICAgICBhY3Rpb246IFwiZ2V0YWJpXCIsIGFkZHJlc3NcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGFiaSA9IEpTT04ucGFyc2UocmVzcCk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29udHJhY3QoYWRkcmVzcywgYWJpLCB0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlzQ29tbXVuaXR5UmVzb3VyY2UoKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmFwaUtleSA9PSBudWxsKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcm92aWRlci1ldGhlcnNjYW4uanMubWFwIiwiZnVuY3Rpb24gZ2V0R2xvYmFsKCkge1xyXG4gICAgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgcmV0dXJuIHdpbmRvdztcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHJldHVybiBnbG9iYWw7XHJcbiAgICB9XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuYWJsZSB0byBsb2NhdGUgZ2xvYmFsIG9iamVjdCcpO1xyXG59XHJcbjtcclxuY29uc3QgX1dlYlNvY2tldCA9IGdldEdsb2JhbCgpLldlYlNvY2tldDtcclxuZXhwb3J0IHsgX1dlYlNvY2tldCBhcyBXZWJTb2NrZXQgfTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d3MtYnJvd3Nlci5qcy5tYXAiLCIvKipcclxuICogIEdlbmVyaWMgbG9uZy1saXZlZCBzb2NrZXQgcHJvdmlkZXIuXHJcbiAqXHJcbiAqICBTdWItY2xhc3Npbmcgbm90ZXNcclxuICogIC0gYSBzdWItY2xhc3MgTVVTVCBjYWxsIHRoZSBgX3N0YXJ0KClgIG1ldGhvZCBvbmNlIGNvbm5lY3RlZFxyXG4gKiAgLSBhIHN1Yi1jbGFzcyBNVVNUIG92ZXJyaWRlIHRoZSBgX3dyaXRlKHN0cmluZylgIG1ldGhvZFxyXG4gKiAgLSBhIHN1Yi1jbGFzcyBNVVNUIGNhbGwgYF9wcm9jZXNzTWVzc2FnZShzdHJpbmcpYCBmb3IgZWFjaCBtZXNzYWdlXHJcbiAqXHJcbiAqICBAX3N1YnNlY3Rpb246IGFwaS9wcm92aWRlcnMvYWJzdHJhY3QtcHJvdmlkZXI6U29ja2V0IFByb3ZpZGVycyAgW2Fib3V0LXNvY2tldFByb3ZpZGVyXVxyXG4gKi9cclxuaW1wb3J0IHsgVW5tYW5hZ2VkU3Vic2NyaWJlciB9IGZyb20gXCIuL2Fic3RyYWN0LXByb3ZpZGVyLmpzXCI7XHJcbmltcG9ydCB7IGFzc2VydCwgYXNzZXJ0QXJndW1lbnQsIG1ha2VFcnJvciB9IGZyb20gXCIuLi91dGlscy9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyBKc29uUnBjQXBpUHJvdmlkZXIgfSBmcm9tIFwiLi9wcm92aWRlci1qc29ucnBjLmpzXCI7XHJcbi8qKlxyXG4gKiAgQSAqKlNvY2tldFN1YnNjcmliZXIqKiB1c2VzIGEgc29ja2V0IHRyYW5zcG9ydCB0byBoYW5kbGUgZXZlbnRzIGFuZFxyXG4gKiAgc2hvdWxkIHVzZSBbW19lbWl0XV0gdG8gbWFuYWdlIHRoZSBldmVudHMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU29ja2V0U3Vic2NyaWJlciB7XHJcbiAgICAjcHJvdmlkZXI7XHJcbiAgICAjZmlsdGVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiAgVGhlIGZpbHRlci5cclxuICAgICAqL1xyXG4gICAgZ2V0IGZpbHRlcigpIHsgcmV0dXJuIEpTT04ucGFyc2UodGhpcy4jZmlsdGVyKTsgfVxyXG4gICAgI2ZpbHRlcklkO1xyXG4gICAgI3BhdXNlZDtcclxuICAgICNlbWl0UHJvbWlzZTtcclxuICAgIC8qKlxyXG4gICAgICogIENyZWF0ZXMgYSBuZXcgKipTb2NrZXRTdWJzY3JpYmVyKiogYXR0YWNoZWQgdG8gJSVwcm92aWRlciUlIGxpc3RlbmluZ1xyXG4gICAgICogIHRvICUlZmlsdGVyJSUuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHByb3ZpZGVyLCBmaWx0ZXIpIHtcclxuICAgICAgICB0aGlzLiNwcm92aWRlciA9IHByb3ZpZGVyO1xyXG4gICAgICAgIHRoaXMuI2ZpbHRlciA9IEpTT04uc3RyaW5naWZ5KGZpbHRlcik7XHJcbiAgICAgICAgdGhpcy4jZmlsdGVySWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuI3BhdXNlZCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy4jZW1pdFByb21pc2UgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy4jZmlsdGVySWQgPSB0aGlzLiNwcm92aWRlci5zZW5kKFwiZXRoX3N1YnNjcmliZVwiLCB0aGlzLmZpbHRlcikudGhlbigoZmlsdGVySWQpID0+IHtcclxuICAgICAgICAgICAgO1xyXG4gICAgICAgICAgICB0aGlzLiNwcm92aWRlci5fcmVnaXN0ZXIoZmlsdGVySWQsIHRoaXMpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVySWQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBzdG9wKCkge1xyXG4gICAgICAgICh0aGlzLiNmaWx0ZXJJZCkudGhlbigoZmlsdGVySWQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuI3Byb3ZpZGVyLmRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuI3Byb3ZpZGVyLnNlbmQoXCJldGhfdW5zdWJzY3JpYmVcIiwgW2ZpbHRlcklkXSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy4jZmlsdGVySWQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgLy8gQFRPRE86IHBhdXNlIHNob3VsZCB0cmFwIHRoZSBjdXJyZW50IGJsb2NrTnVtYmVyLCB1bnN1YiwgYW5kIG9uIHJlc3VtZSB1c2UgZ2V0TG9nc1xyXG4gICAgLy8gICAgICAgIGFuZCByZXN1bWVcclxuICAgIHBhdXNlKGRyb3BXaGlsZVBhdXNlZCkge1xyXG4gICAgICAgIGFzc2VydChkcm9wV2hpbGVQYXVzZWQsIFwicHJlc2VydmUgbG9ncyB3aGlsZSBwYXVzZWQgbm90IHN1cHBvcnRlZCBieSBTb2NrZXRTdWJzY3JpYmVyIHlldFwiLCBcIlVOU1VQUE9SVEVEX09QRVJBVElPTlwiLCB7IG9wZXJhdGlvbjogXCJwYXVzZShmYWxzZSlcIiB9KTtcclxuICAgICAgICB0aGlzLiNwYXVzZWQgPSAhIWRyb3BXaGlsZVBhdXNlZDtcclxuICAgIH1cclxuICAgIHJlc3VtZSgpIHtcclxuICAgICAgICB0aGlzLiNwYXVzZWQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiAgQF9pZ25vcmU6XHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVNZXNzYWdlKG1lc3NhZ2UpIHtcclxuICAgICAgICBpZiAodGhpcy4jZmlsdGVySWQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLiNwYXVzZWQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IGVtaXRQcm9taXNlID0gdGhpcy4jZW1pdFByb21pc2U7XHJcbiAgICAgICAgICAgIGlmIChlbWl0UHJvbWlzZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBlbWl0UHJvbWlzZSA9IHRoaXMuX2VtaXQodGhpcy4jcHJvdmlkZXIsIG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZW1pdFByb21pc2UgPSBlbWl0UHJvbWlzZS50aGVuKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLl9lbWl0KHRoaXMuI3Byb3ZpZGVyLCBtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuI2VtaXRQcm9taXNlID0gZW1pdFByb21pc2UudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4jZW1pdFByb21pc2UgPT09IGVtaXRQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4jZW1pdFByb21pc2UgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqICBTdWItY2xhc3NlcyAqKm11c3QqKiBvdmVycmlkZSB0aGlzIHRvIGVtaXQgdGhlIGV2ZW50cyBvbiB0aGVcclxuICAgICAqICBwcm92aWRlci5cclxuICAgICAqL1xyXG4gICAgYXN5bmMgX2VtaXQocHJvdmlkZXIsIG1lc3NhZ2UpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzdWItY2xhc3NlcyBtdXN0IGltcGxlbWVudGUgdGhpczsgX2VtaXRcIik7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqICBBICoqU29ja2V0QmxvY2tTdWJzY3JpYmVyKiogbGlzdGVucyBmb3IgYGBuZXdIZWFkc2BgIGV2ZW50cyBhbmQgZW1pdHNcclxuICogIGBgXCJibG9ja1wiYGAgZXZlbnRzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFNvY2tldEJsb2NrU3Vic2NyaWJlciBleHRlbmRzIFNvY2tldFN1YnNjcmliZXIge1xyXG4gICAgLyoqXHJcbiAgICAgKiAgQF9pZ25vcmU6XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHByb3ZpZGVyKSB7XHJcbiAgICAgICAgc3VwZXIocHJvdmlkZXIsIFtcIm5ld0hlYWRzXCJdKTtcclxuICAgIH1cclxuICAgIGFzeW5jIF9lbWl0KHByb3ZpZGVyLCBtZXNzYWdlKSB7XHJcbiAgICAgICAgcHJvdmlkZXIuZW1pdChcImJsb2NrXCIsIHBhcnNlSW50KG1lc3NhZ2UubnVtYmVyKSk7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqICBBICoqU29ja2V0UGVuZGluZ1N1YnNjcmliZXIqKiBsaXN0ZW5zIGZvciBwZW5kaW5nIHRyYW5zYWNpdG9ucyBhbmQgZW1pdHNcclxuICogIGBgXCJwZW5kaW5nXCJgYCBldmVudHMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU29ja2V0UGVuZGluZ1N1YnNjcmliZXIgZXh0ZW5kcyBTb2NrZXRTdWJzY3JpYmVyIHtcclxuICAgIC8qKlxyXG4gICAgICogIEBfaWdub3JlOlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcihwcm92aWRlcikge1xyXG4gICAgICAgIHN1cGVyKHByb3ZpZGVyLCBbXCJuZXdQZW5kaW5nVHJhbnNhY3Rpb25zXCJdKTtcclxuICAgIH1cclxuICAgIGFzeW5jIF9lbWl0KHByb3ZpZGVyLCBtZXNzYWdlKSB7XHJcbiAgICAgICAgcHJvdmlkZXIuZW1pdChcInBlbmRpbmdcIiwgbWVzc2FnZSk7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqICBBICoqU29ja2V0RXZlbnRTdWJzY3JpYmVyKiogbGlzdGVucyBmb3IgZXZlbnQgbG9ncy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBTb2NrZXRFdmVudFN1YnNjcmliZXIgZXh0ZW5kcyBTb2NrZXRTdWJzY3JpYmVyIHtcclxuICAgICNsb2dGaWx0ZXI7XHJcbiAgICAvKipcclxuICAgICAqICBUaGUgZmlsdGVyLlxyXG4gICAgICovXHJcbiAgICBnZXQgbG9nRmlsdGVyKCkgeyByZXR1cm4gSlNPTi5wYXJzZSh0aGlzLiNsb2dGaWx0ZXIpOyB9XHJcbiAgICAvKipcclxuICAgICAqICBAX2lnbm9yZTpcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocHJvdmlkZXIsIGZpbHRlcikge1xyXG4gICAgICAgIHN1cGVyKHByb3ZpZGVyLCBbXCJsb2dzXCIsIGZpbHRlcl0pO1xyXG4gICAgICAgIHRoaXMuI2xvZ0ZpbHRlciA9IEpTT04uc3RyaW5naWZ5KGZpbHRlcik7XHJcbiAgICB9XHJcbiAgICBhc3luYyBfZW1pdChwcm92aWRlciwgbWVzc2FnZSkge1xyXG4gICAgICAgIHByb3ZpZGVyLmVtaXQodGhpcy5sb2dGaWx0ZXIsIHByb3ZpZGVyLl93cmFwTG9nKG1lc3NhZ2UsIHByb3ZpZGVyLl9uZXR3b3JrKSk7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqICBBICoqU29ja2V0UHJvdmlkZXIqKiBpcyBiYWNrZWQgYnkgYSBsb25nLWxpdmVkIGNvbm5lY3Rpb24gb3ZlciBhXHJcbiAqICBzb2NrZXQsIHdoaWNoIGNhbiBzdWJzY3JpYmUgYW5kIHJlY2VpdmUgcmVhbC10aW1lIG1lc3NhZ2VzIG92ZXJcclxuICogIGl0cyBjb21tdW5pY2F0aW9uIGNoYW5uZWwuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU29ja2V0UHJvdmlkZXIgZXh0ZW5kcyBKc29uUnBjQXBpUHJvdmlkZXIge1xyXG4gICAgI2NhbGxiYWNrcztcclxuICAgIC8vIE1hcHMgZWFjaCBmaWx0ZXJJZCB0byBpdHMgc3Vic2NyaWJlclxyXG4gICAgI3N1YnM7XHJcbiAgICAvLyBJZiBhbnkgZXZlbnRzIGNvbWUgaW4gYmVmb3JlIGEgc3Vic2NyaWJlciBoYXMgZmluaXNoZWRcclxuICAgIC8vIHJlZ2lzdGVyaW5nLCBxdWV1ZSB0aGVtXHJcbiAgICAjcGVuZGluZztcclxuICAgIC8qKlxyXG4gICAgICogIENyZWF0ZXMgYSBuZXcgKipTb2NrZXRQcm92aWRlcioqIGNvbm5lY3RlZCB0byAlJW5ldHdvcmslJS5cclxuICAgICAqXHJcbiAgICAgKiAgSWYgdW5zcGVjaWZpZWQsIHRoZSBuZXR3b3JrIHdpbGwgYmUgZGlzY292ZXJlZC5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IobmV0d29yaywgX29wdGlvbnMpIHtcclxuICAgICAgICAvLyBDb3B5IHRoZSBvcHRpb25zXHJcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIChfb3B0aW9ucyAhPSBudWxsKSA/IF9vcHRpb25zIDoge30pO1xyXG4gICAgICAgIC8vIFN1cHBvcnQgZm9yIGJhdGNoZXMgaXMgZ2VuZXJhbGx5IG5vdCBzdXBwb3J0ZWQgZm9yXHJcbiAgICAgICAgLy8gY29ubmVjdGlvbi1iYXNlIHByb3ZpZGVyczsgaWYgdGhpcyBjaGFuZ2VzIGluIHRoZSBmdXR1cmVcclxuICAgICAgICAvLyB0aGUgX3NlbmQgc2hvdWxkIGJlIHVwZGF0ZWQgdG8gcmVmbGVjdCB0aGlzXHJcbiAgICAgICAgYXNzZXJ0QXJndW1lbnQob3B0aW9ucy5iYXRjaE1heENvdW50ID09IG51bGwgfHwgb3B0aW9ucy5iYXRjaE1heENvdW50ID09PSAxLCBcInNvY2tldHMtYmFzZWQgcHJvdmlkZXJzIGRvIG5vdCBzdXBwb3J0IGJhdGNoZXNcIiwgXCJvcHRpb25zLmJhdGNoTWF4Q291bnRcIiwgX29wdGlvbnMpO1xyXG4gICAgICAgIG9wdGlvbnMuYmF0Y2hNYXhDb3VudCA9IDE7XHJcbiAgICAgICAgLy8gU29ja2V0LWJhc2VkIFByb3ZpZGVycyAoZ2VuZXJhbGx5KSBjYW5ub3QgY2hhbmdlIHRoZWlyIG5ldHdvcmssXHJcbiAgICAgICAgLy8gc2luY2UgdGhleSBoYXZlIGEgbG9uZy1saXZlZCBjb25uZWN0aW9uOyBidXQgbGV0IHBlb3BsZSBvdmVycmlkZVxyXG4gICAgICAgIC8vIHRoaXMgaWYgdGhleSBoYXZlIGp1c3QgY2F1c2UuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMuc3RhdGljTmV0d29yayA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMuc3RhdGljTmV0d29yayA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN1cGVyKG5ldHdvcmssIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuI2NhbGxiYWNrcyA9IG5ldyBNYXAoKTtcclxuICAgICAgICB0aGlzLiNzdWJzID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMuI3BlbmRpbmcgPSBuZXcgTWFwKCk7XHJcbiAgICB9XHJcbiAgICAvLyBUaGlzIHZhbHVlIGlzIG9ubHkgdmFsaWQgYWZ0ZXIgX3N0YXJ0IGhhcyBiZWVuIGNhbGxlZFxyXG4gICAgLypcclxuICAgIGdldCBfbmV0d29yaygpOiBOZXR3b3JrIHtcclxuICAgICAgICBpZiAodGhpcy4jbmV0d29yayA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRoaXMgc2hvdWxkbid0IGhhcHBlblwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuI25ldHdvcmsuY2xvbmUoKTtcclxuICAgIH1cclxuICAgICovXHJcbiAgICBfZ2V0U3Vic2NyaWJlcihzdWIpIHtcclxuICAgICAgICBzd2l0Y2ggKHN1Yi50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJjbG9zZVwiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVbm1hbmFnZWRTdWJzY3JpYmVyKFwiY2xvc2VcIik7XHJcbiAgICAgICAgICAgIGNhc2UgXCJibG9ja1wiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTb2NrZXRCbG9ja1N1YnNjcmliZXIodGhpcyk7XHJcbiAgICAgICAgICAgIGNhc2UgXCJwZW5kaW5nXCI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFNvY2tldFBlbmRpbmdTdWJzY3JpYmVyKHRoaXMpO1xyXG4gICAgICAgICAgICBjYXNlIFwiZXZlbnRcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU29ja2V0RXZlbnRTdWJzY3JpYmVyKHRoaXMsIHN1Yi5maWx0ZXIpO1xyXG4gICAgICAgICAgICBjYXNlIFwib3JwaGFuXCI6XHJcbiAgICAgICAgICAgICAgICAvLyBIYW5kbGVkIGF1dG8tbWF0aWNhbGx5IHdpdGhpbiBBYnN0cmFjdFByb3ZpZGVyXHJcbiAgICAgICAgICAgICAgICAvLyB3aGVuIHRoZSBsb2cucmVtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgIGlmIChzdWIuZmlsdGVyLm9ycGhhbiA9PT0gXCJkcm9wLWxvZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVbm1hbmFnZWRTdWJzY3JpYmVyKFwiZHJvcC1sb2dcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdXBlci5fZ2V0U3Vic2NyaWJlcihzdWIpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiAgUmVnaXN0ZXIgYSBuZXcgc3Vic2NyaWJlci4gVGhpcyBpcyB1c2VkIGludGVybmFsbGVkIGJ5IFN1YnNjcmliZXJzXHJcbiAgICAgKiAgYW5kIGdlbmVyYWxseSBpcyB1bmVjZXNzYXJ5IHVubGVzcyBleHRlbmRpbmcgY2FwYWJpbGl0aWVzLlxyXG4gICAgICovXHJcbiAgICBfcmVnaXN0ZXIoZmlsdGVySWQsIHN1YnNjcmliZXIpIHtcclxuICAgICAgICB0aGlzLiNzdWJzLnNldChmaWx0ZXJJZCwgc3Vic2NyaWJlcik7XHJcbiAgICAgICAgY29uc3QgcGVuZGluZyA9IHRoaXMuI3BlbmRpbmcuZ2V0KGZpbHRlcklkKTtcclxuICAgICAgICBpZiAocGVuZGluZykge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgcGVuZGluZykge1xyXG4gICAgICAgICAgICAgICAgc3Vic2NyaWJlci5faGFuZGxlTWVzc2FnZShtZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLiNwZW5kaW5nLmRlbGV0ZShmaWx0ZXJJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgYXN5bmMgX3NlbmQocGF5bG9hZCkge1xyXG4gICAgICAgIC8vIFdlYlNvY2tldCBwcm92aWRlciBkb2Vzbid0IGFjY2VwdCBiYXRjaGVzXHJcbiAgICAgICAgYXNzZXJ0QXJndW1lbnQoIUFycmF5LmlzQXJyYXkocGF5bG9hZCksIFwiV2ViU29ja2V0IGRvZXMgbm90IHN1cHBvcnQgYmF0Y2ggc2VuZFwiLCBcInBheWxvYWRcIiwgcGF5bG9hZCk7XHJcbiAgICAgICAgLy8gQFRPRE86IHN0cmluZ2lmeSBwYXlsb2FkcyBoZXJlIGFuZCBzdG9yZSB0byBwcmV2ZW50IG11dGF0aW9uc1xyXG4gICAgICAgIC8vIFByZXBhcmUgYSBwcm9taXNlIHRvIHJlc3BvbmQgdG9cclxuICAgICAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLiNjYWxsYmFja3Muc2V0KHBheWxvYWQuaWQsIHsgcGF5bG9hZCwgcmVzb2x2ZSwgcmVqZWN0IH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIFdhaXQgdW50aWwgdGhlIHNvY2tldCBpcyBjb25uZWN0ZWQgYmVmb3JlIHdyaXRpbmcgdG8gaXRcclxuICAgICAgICBhd2FpdCB0aGlzLl93YWl0VW50aWxSZWFkeSgpO1xyXG4gICAgICAgIC8vIFdyaXRlIHRoZSByZXF1ZXN0IHRvIHRoZSBzb2NrZXRcclxuICAgICAgICBhd2FpdCB0aGlzLl93cml0ZShKU09OLnN0cmluZ2lmeShwYXlsb2FkKSk7XHJcbiAgICAgICAgcmV0dXJuIFthd2FpdCBwcm9taXNlXTtcclxuICAgIH1cclxuICAgIC8vIFN1Yi1jbGFzc2VzIG11c3QgY2FsbCB0aGlzIG9uY2UgdGhleSBhcmUgY29ubmVjdGVkXHJcbiAgICAvKlxyXG4gICAgYXN5bmMgX3N0YXJ0KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGlmICh0aGlzLiNyZWFkeSkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgZm9yIChjb25zdCB7IHBheWxvYWQgfSBvZiB0aGlzLiNjYWxsYmFja3MudmFsdWVzKCkpIHtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5fd3JpdGUoSlNPTi5zdHJpbmdpZnkocGF5bG9hZCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy4jcmVhZHkgPSAoYXN5bmMgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHN1cGVyLl9zdGFydCgpO1xyXG4gICAgICAgIH0pKCk7XHJcbiAgICB9XHJcbiAgICAqL1xyXG4gICAgLyoqXHJcbiAgICAgKiAgU3ViLWNsYXNzZXMgKiptdXN0KiogY2FsbCB0aGlzIHdpdGggbWVzc2FnZXMgcmVjZWl2ZWQgb3ZlciB0aGVpclxyXG4gICAgICogIHRyYW5zcG9ydCB0byBiZSBwcm9jZXNzZWQgYW5kIGRpc3BhdGNoZWQuXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIF9wcm9jZXNzTWVzc2FnZShtZXNzYWdlKSB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gKEpTT04ucGFyc2UobWVzc2FnZSkpO1xyXG4gICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIChyZXN1bHQpID09PSBcIm9iamVjdFwiICYmIFwiaWRcIiBpbiByZXN1bHQpIHtcclxuICAgICAgICAgICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzLiNjYWxsYmFja3MuZ2V0KHJlc3VsdC5pZCk7XHJcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoXCJlcnJvclwiLCBtYWtlRXJyb3IoXCJyZWNlaXZlZCByZXN1bHQgZm9yIHVua25vd24gaWRcIiwgXCJVTktOT1dOX0VSUk9SXCIsIHtcclxuICAgICAgICAgICAgICAgICAgICByZWFzb25Db2RlOiBcIlVOS05PV05fSURcIixcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLiNjYWxsYmFja3MuZGVsZXRlKHJlc3VsdC5pZCk7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrLnJlc29sdmUocmVzdWx0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAocmVzdWx0ICYmIHJlc3VsdC5tZXRob2QgPT09IFwiZXRoX3N1YnNjcmlwdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcklkID0gcmVzdWx0LnBhcmFtcy5zdWJzY3JpcHRpb247XHJcbiAgICAgICAgICAgIGNvbnN0IHN1YnNjcmliZXIgPSB0aGlzLiNzdWJzLmdldChmaWx0ZXJJZCk7XHJcbiAgICAgICAgICAgIGlmIChzdWJzY3JpYmVyKSB7XHJcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLl9oYW5kbGVNZXNzYWdlKHJlc3VsdC5wYXJhbXMucmVzdWx0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBwZW5kaW5nID0gdGhpcy4jcGVuZGluZy5nZXQoZmlsdGVySWQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlbmRpbmcgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBlbmRpbmcgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiNwZW5kaW5nLnNldChmaWx0ZXJJZCwgcGVuZGluZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwZW5kaW5nLnB1c2gocmVzdWx0LnBhcmFtcy5yZXN1bHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVtaXQoXCJlcnJvclwiLCBtYWtlRXJyb3IoXCJyZWNlaXZlZCB1bmV4cGVjdGVkIG1lc3NhZ2VcIiwgXCJVTktOT1dOX0VSUk9SXCIsIHtcclxuICAgICAgICAgICAgICAgIHJlYXNvbkNvZGU6IFwiVU5FWFBFQ1RFRF9NRVNTQUdFXCIsXHJcbiAgICAgICAgICAgICAgICByZXN1bHRcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiAgU3ViLWNsYXNzZXMgKiptdXN0Kiogb3ZlcnJpZGUgdGhpcyB0byBzZW5kICUlbWVzc2FnZSUlIG92ZXIgdGhlaXJcclxuICAgICAqICB0cmFuc3BvcnQuXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIF93cml0ZShtZXNzYWdlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwic3ViLWNsYXNzZXMgbXVzdCBvdmVycmlkZSB0aGlzXCIpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByb3ZpZGVyLXNvY2tldC5qcy5tYXAiLCJpbXBvcnQgeyBXZWJTb2NrZXQgYXMgX1dlYlNvY2tldCB9IGZyb20gXCIuL3dzLmpzXCI7IC8qLWJyb3dzZXIqL1xyXG5pbXBvcnQgeyBTb2NrZXRQcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLXNvY2tldC5qc1wiO1xyXG4vKipcclxuICogIEEgSlNPTi1SUEMgcHJvdmlkZXIgd2hpY2ggaXMgYmFja2VkIGJ5IGEgV2ViU29ja2V0LlxyXG4gKlxyXG4gKiAgV2ViU29ja2V0cyBhcmUgb2Z0ZW4gcHJlZmVycmVkIGJlY2F1c2UgdGhleSByZXRhaW4gYSBsaXZlIGNvbm5lY3Rpb25cclxuICogIHRvIGEgc2VydmVyLCB3aGljaCBwZXJtaXRzIG1vcmUgaW5zdGFudCBhY2Nlc3MgdG8gZXZlbnRzLlxyXG4gKlxyXG4gKiAgSG93ZXZlciwgdGhpcyBpbmN1cnMgaGlnaGVyIHNlcnZlciBpbmZyYXN0dXJ0dXJlIGNvc3RzLCBzbyBhZGRpdGlvbmFsXHJcbiAqICByZXNvdXJjZXMgbWF5IGJlIHJlcXVpcmVkIHRvIGhvc3QgeW91ciBvd24gV2ViU29ja2V0IG5vZGVzIGFuZCBtYW55XHJcbiAqICB0aGlyZC1wYXJ0eSBzZXJ2aWNlcyBjaGFyZ2UgYWRkaXRpb25hbCBmZWVzIGZvciBXZWJTb2NrZXQgZW5kcG9pbnRzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFdlYlNvY2tldFByb3ZpZGVyIGV4dGVuZHMgU29ja2V0UHJvdmlkZXIge1xyXG4gICAgI2Nvbm5lY3Q7XHJcbiAgICAjd2Vic29ja2V0O1xyXG4gICAgZ2V0IHdlYnNvY2tldCgpIHtcclxuICAgICAgICBpZiAodGhpcy4jd2Vic29ja2V0ID09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwid2Vic29ja2V0IGNsb3NlZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuI3dlYnNvY2tldDtcclxuICAgIH1cclxuICAgIGNvbnN0cnVjdG9yKHVybCwgbmV0d29yaywgb3B0aW9ucykge1xyXG4gICAgICAgIHN1cGVyKG5ldHdvcmssIG9wdGlvbnMpO1xyXG4gICAgICAgIGlmICh0eXBlb2YgKHVybCkgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgdGhpcy4jY29ubmVjdCA9ICgpID0+IHsgcmV0dXJuIG5ldyBfV2ViU29ja2V0KHVybCk7IH07XHJcbiAgICAgICAgICAgIHRoaXMuI3dlYnNvY2tldCA9IHRoaXMuI2Nvbm5lY3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mICh1cmwpID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgdGhpcy4jY29ubmVjdCA9IHVybDtcclxuICAgICAgICAgICAgdGhpcy4jd2Vic29ja2V0ID0gdXJsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLiNjb25uZWN0ID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy4jd2Vic29ja2V0ID0gdXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLndlYnNvY2tldC5vbm9wZW4gPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLl9zdGFydCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXN1bWUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmFpbGVkIHRvIHN0YXJ0IFdlYnNvY2tldFByb3ZpZGVyXCIsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIC8vIEBUT0RPOiBub3cgd2hhdD8gQXR0ZW1wdCByZWNvbm5lY3Q/XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMud2Vic29ja2V0Lm9ubWVzc2FnZSA9IChtZXNzYWdlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NNZXNzYWdlKG1lc3NhZ2UuZGF0YSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgdGhpcy53ZWJzb2NrZXQub25jbG9zZSA9IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEBUT0RPOiBXaGF0IGV2ZW50LmNvZGUgc2hvdWxkIHdlIHJlY29ubmVjdCBvbj9cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWNvbm5lY3QgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVjb25uZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGF1c2UodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLiNjb25uZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiN3ZWJzb2NrZXQgPSB0aGlzLiNjb25uZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiN3ZWJzb2NrZXQub25vcGVuID0gLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAVE9ETzogdGhpcyByZXF1aXJlcyB0aGUgc3VwZXIgY2xhc3MgdG8gcmVicm9hZGNhc3Q7IG1vdmUgaXQgdGhlcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWNvbm5lY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICovXHJcbiAgICB9XHJcbiAgICBhc3luYyBfd3JpdGUobWVzc2FnZSkge1xyXG4gICAgICAgIHRoaXMud2Vic29ja2V0LnNlbmQobWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgICBhc3luYyBkZXN0cm95KCkge1xyXG4gICAgICAgIGlmICh0aGlzLiN3ZWJzb2NrZXQgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLiN3ZWJzb2NrZXQuY2xvc2UoKTtcclxuICAgICAgICAgICAgdGhpcy4jd2Vic29ja2V0ID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3VwZXIuZGVzdHJveSgpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByb3ZpZGVyLXdlYnNvY2tldC5qcy5tYXAiLCIvKipcclxuICogIFtbbGluay1pbmZ1cmFdXSBwcm92aWRlcyBhIHRoaXJkLXBhcnR5IHNlcnZpY2UgZm9yIGNvbm5lY3RpbmcgdG9cclxuICogIHZhcmlvdXMgYmxvY2tjaGFpbnMgb3ZlciBKU09OLVJQQy5cclxuICpcclxuICogICoqU3VwcG9ydGVkIE5ldHdvcmtzKipcclxuICpcclxuICogIC0gRXRoZXJldW0gTWFpbm5ldCAoYGBtYWlubmV0YGApXHJcbiAqICAtIEdvZXJsaSBUZXN0bmV0IChgYGdvZXJsaWBgKVxyXG4gKiAgLSBTZXBvbGlhIFRlc3RuZXQgKGBgc2Vwb2xpYWBgKVxyXG4gKiAgLSBBcmJpdHJ1bSAoYGBhcmJpdHJ1bWBgKVxyXG4gKiAgLSBBcmJpdHJ1bSBHb2VybGkgVGVzdG5ldCAoYGBhcmJpdHJ1bS1nb2VybGlgYClcclxuICogIC0gQXJiaXRydW0gU2Vwb2xpYSBUZXN0bmV0IChgYGFyYml0cnVtLXNlcG9saWFgYClcclxuICogIC0gQmFzZSAoYGBiYXNlYGApXHJcbiAqICAtIEJhc2UgR29lcmxpYSBUZXN0bmV0IChgYGJhc2UtZ29lcmxpYGApXHJcbiAqICAtIEJhc2UgU2Vwb2xpYSBUZXN0bmV0IChgYGJhc2Utc2Vwb2xpYWBgKVxyXG4gKiAgLSBCTkIgU21hcnQgQ2hhaW4gTWFpbm5ldCAoYGBibmJgYClcclxuICogIC0gQk5CIFNtYXJ0IENoYWluIFRlc3RuZXQgKGBgYm5idGBgKVxyXG4gKiAgLSBMaW5lYSAoYGBsaW5lYWBgKVxyXG4gKiAgLSBMaW5lYSBHb2VybGkgVGVzdG5ldCAoYGBsaW5lYS1nb2VybGlgYClcclxuICogIC0gTGluZWEgU2Vwb2xpYSBUZXN0bmV0IChgYGxpbmVhLXNlcG9saWFgYClcclxuICogIC0gT3B0aW1pc20gKGBgb3B0aW1pc21gYClcclxuICogIC0gT3B0aW1pc20gR29lcmxpIFRlc3RuZXQgKGBgb3B0aW1pc20tZ29lcmxpYGApXHJcbiAqICAtIE9wdGltaXNtIFNlcG9saWEgVGVzdG5ldCAoYGBvcHRpbWlzbS1zZXBvbGlhYGApXHJcbiAqICAtIFBvbHlnb24gKGBgbWF0aWNgYClcclxuICogIC0gUG9seWdvbiBBbW95IFRlc3RuZXQgKGBgbWF0aWMtYW1veWBgKVxyXG4gKiAgLSBQb2x5Z29uIE11bWJhaSBUZXN0bmV0IChgYG1hdGljLW11bWJhaWBgKVxyXG4gKlxyXG4gKiAgQF9zdWJzZWN0aW9uOiBhcGkvcHJvdmlkZXJzL3RoaXJkcGFydHk6SU5GVVJBICBbcHJvdmlkZXJzLWluZnVyYV1cclxuICovXHJcbmltcG9ydCB7IGRlZmluZVByb3BlcnRpZXMsIEZldGNoUmVxdWVzdCwgYXNzZXJ0LCBhc3NlcnRBcmd1bWVudCB9IGZyb20gXCIuLi91dGlscy9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyBzaG93VGhyb3R0bGVNZXNzYWdlIH0gZnJvbSBcIi4vY29tbXVuaXR5LmpzXCI7XHJcbmltcG9ydCB7IE5ldHdvcmsgfSBmcm9tIFwiLi9uZXR3b3JrLmpzXCI7XHJcbmltcG9ydCB7IEpzb25ScGNQcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLWpzb25ycGMuanNcIjtcclxuaW1wb3J0IHsgV2ViU29ja2V0UHJvdmlkZXIgfSBmcm9tIFwiLi9wcm92aWRlci13ZWJzb2NrZXQuanNcIjtcclxuY29uc3QgZGVmYXVsdFByb2plY3RJZCA9IFwiODQ4NDIwNzhiMDk5NDY2MzhjMDMxNTdmODM0MDUyMTNcIjtcclxuZnVuY3Rpb24gZ2V0SG9zdChuYW1lKSB7XHJcbiAgICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgICAgICBjYXNlIFwibWFpbm5ldFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJtYWlubmV0LmluZnVyYS5pb1wiO1xyXG4gICAgICAgIGNhc2UgXCJnb2VybGlcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiZ29lcmxpLmluZnVyYS5pb1wiO1xyXG4gICAgICAgIGNhc2UgXCJzZXBvbGlhXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcInNlcG9saWEuaW5mdXJhLmlvXCI7XHJcbiAgICAgICAgY2FzZSBcImFyYml0cnVtXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImFyYml0cnVtLW1haW5uZXQuaW5mdXJhLmlvXCI7XHJcbiAgICAgICAgY2FzZSBcImFyYml0cnVtLWdvZXJsaVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJhcmJpdHJ1bS1nb2VybGkuaW5mdXJhLmlvXCI7XHJcbiAgICAgICAgY2FzZSBcImFyYml0cnVtLXNlcG9saWFcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiYXJiaXRydW0tc2Vwb2xpYS5pbmZ1cmEuaW9cIjtcclxuICAgICAgICBjYXNlIFwiYmFzZVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJiYXNlLW1haW5uZXQuaW5mdXJhLmlvXCI7XHJcbiAgICAgICAgY2FzZSBcImJhc2UtZ29lcmxpYVwiOiAvLyBAVE9ETzogUmVtb3ZlIHRoaXMgdHlwbyBpbiB0aGUgZnV0dXJlIVxyXG4gICAgICAgIGNhc2UgXCJiYXNlLWdvZXJsaVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJiYXNlLWdvZXJsaS5pbmZ1cmEuaW9cIjtcclxuICAgICAgICBjYXNlIFwiYmFzZS1zZXBvbGlhXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImJhc2Utc2Vwb2xpYS5pbmZ1cmEuaW9cIjtcclxuICAgICAgICBjYXNlIFwiYm5iXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImJzYy1tYWlubmV0LmluZnVyYS5pb1wiO1xyXG4gICAgICAgIGNhc2UgXCJibmJ0XCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImJzYy10ZXN0bmV0LmluZnVyYS5pb1wiO1xyXG4gICAgICAgIGNhc2UgXCJsaW5lYVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJsaW5lYS1tYWlubmV0LmluZnVyYS5pb1wiO1xyXG4gICAgICAgIGNhc2UgXCJsaW5lYS1nb2VybGlcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwibGluZWEtZ29lcmxpLmluZnVyYS5pb1wiO1xyXG4gICAgICAgIGNhc2UgXCJsaW5lYS1zZXBvbGlhXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImxpbmVhLXNlcG9saWEuaW5mdXJhLmlvXCI7XHJcbiAgICAgICAgY2FzZSBcIm1hdGljXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcInBvbHlnb24tbWFpbm5ldC5pbmZ1cmEuaW9cIjtcclxuICAgICAgICBjYXNlIFwibWF0aWMtYW1veVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJwb2x5Z29uLWFtb3kuaW5mdXJhLmlvXCI7XHJcbiAgICAgICAgY2FzZSBcIm1hdGljLW11bWJhaVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJwb2x5Z29uLW11bWJhaS5pbmZ1cmEuaW9cIjtcclxuICAgICAgICBjYXNlIFwib3B0aW1pc21cIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwib3B0aW1pc20tbWFpbm5ldC5pbmZ1cmEuaW9cIjtcclxuICAgICAgICBjYXNlIFwib3B0aW1pc20tZ29lcmxpXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcIm9wdGltaXNtLWdvZXJsaS5pbmZ1cmEuaW9cIjtcclxuICAgICAgICBjYXNlIFwib3B0aW1pc20tc2Vwb2xpYVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJvcHRpbWlzbS1zZXBvbGlhLmluZnVyYS5pb1wiO1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0QXJndW1lbnQoZmFsc2UsIFwidW5zdXBwb3J0ZWQgbmV0d29ya1wiLCBcIm5ldHdvcmtcIiwgbmFtZSk7XHJcbn1cclxuLyoqXHJcbiAqICBUaGUgKipJbmZ1cmFXZWJTb2NrZXRQcm92aWRlcioqIGNvbm5lY3RzIHRvIHRoZSBbW2xpbmstaW5mdXJhXV1cclxuICogIFdlYlNvY2tldCBlbmQtcG9pbnRzLlxyXG4gKlxyXG4gKiAgQnkgZGVmYXVsdCwgYSBoaWdobHktdGhyb3R0bGVkIEFQSSBrZXkgaXMgdXNlZCwgd2hpY2ggaXNcclxuICogIGFwcHJvcHJpYXRlIGZvciBxdWljayBwcm90b3R5cGVzIGFuZCBzaW1wbGUgc2NyaXB0cy4gVG9cclxuICogIGdhaW4gYWNjZXNzIHRvIGFuIGluY3JlYXNlZCByYXRlLWxpbWl0LCBpdCBpcyBoaWdobHlcclxuICogIHJlY29tbWVuZGVkIHRvIFtzaWduIHVwIGhlcmVdKGxpbmstaW5mdXJhLXNpZ251cCkuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgSW5mdXJhV2ViU29ja2V0UHJvdmlkZXIgZXh0ZW5kcyBXZWJTb2NrZXRQcm92aWRlciB7XHJcbiAgICAvKipcclxuICAgICAqICBUaGUgUHJvamVjdCBJRCBmb3IgdGhlIElORlVSQSBjb25uZWN0aW9uLlxyXG4gICAgICovXHJcbiAgICBwcm9qZWN0SWQ7XHJcbiAgICAvKipcclxuICAgICAqICBUaGUgUHJvamVjdCBTZWNyZXQuXHJcbiAgICAgKlxyXG4gICAgICogIElmIG51bGwsIG5vIGF1dGhlbnRpY2F0ZWQgcmVxdWVzdHMgYXJlIG1hZGUuIFRoaXMgc2hvdWxkIG5vdFxyXG4gICAgICogIGJlIHVzZWQgb3V0c2lkZSBvZiBwcml2YXRlIGNvbnRleHRzLlxyXG4gICAgICovXHJcbiAgICBwcm9qZWN0U2VjcmV0O1xyXG4gICAgLyoqXHJcbiAgICAgKiAgQ3JlYXRlcyBhIG5ldyAqKkluZnVyYVdlYlNvY2tldFByb3ZpZGVyKiouXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG5ldHdvcmssIHByb2plY3RJZCkge1xyXG4gICAgICAgIGNvbnN0IHByb3ZpZGVyID0gbmV3IEluZnVyYVByb3ZpZGVyKG5ldHdvcmssIHByb2plY3RJZCk7XHJcbiAgICAgICAgY29uc3QgcmVxID0gcHJvdmlkZXIuX2dldENvbm5lY3Rpb24oKTtcclxuICAgICAgICBhc3NlcnQoIXJlcS5jcmVkZW50aWFscywgXCJJTkZVUkEgV2ViU29ja2V0IHByb2plY3Qgc2VjcmV0cyB1bnN1cHBvcnRlZFwiLCBcIlVOU1VQUE9SVEVEX09QRVJBVElPTlwiLCB7IG9wZXJhdGlvbjogXCJJbmZ1cmFQcm92aWRlci5nZXRXZWJTb2NrZXRQcm92aWRlcigpXCIgfSk7XHJcbiAgICAgICAgY29uc3QgdXJsID0gcmVxLnVybC5yZXBsYWNlKC9eaHR0cC9pLCBcIndzXCIpLnJlcGxhY2UoXCIvdjMvXCIsIFwiL3dzL3YzL1wiKTtcclxuICAgICAgICBzdXBlcih1cmwsIHByb3ZpZGVyLl9uZXR3b3JrKTtcclxuICAgICAgICBkZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcclxuICAgICAgICAgICAgcHJvamVjdElkOiBwcm92aWRlci5wcm9qZWN0SWQsXHJcbiAgICAgICAgICAgIHByb2plY3RTZWNyZXQ6IHByb3ZpZGVyLnByb2plY3RTZWNyZXRcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGlzQ29tbXVuaXR5UmVzb3VyY2UoKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLnByb2plY3RJZCA9PT0gZGVmYXVsdFByb2plY3RJZCk7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqICBUaGUgKipJbmZ1cmFQcm92aWRlcioqIGNvbm5lY3RzIHRvIHRoZSBbW2xpbmstaW5mdXJhXV1cclxuICogIEpTT04tUlBDIGVuZC1wb2ludHMuXHJcbiAqXHJcbiAqICBCeSBkZWZhdWx0LCBhIGhpZ2hseS10aHJvdHRsZWQgQVBJIGtleSBpcyB1c2VkLCB3aGljaCBpc1xyXG4gKiAgYXBwcm9wcmlhdGUgZm9yIHF1aWNrIHByb3RvdHlwZXMgYW5kIHNpbXBsZSBzY3JpcHRzLiBUb1xyXG4gKiAgZ2FpbiBhY2Nlc3MgdG8gYW4gaW5jcmVhc2VkIHJhdGUtbGltaXQsIGl0IGlzIGhpZ2hseVxyXG4gKiAgcmVjb21tZW5kZWQgdG8gW3NpZ24gdXAgaGVyZV0obGluay1pbmZ1cmEtc2lnbnVwKS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBJbmZ1cmFQcm92aWRlciBleHRlbmRzIEpzb25ScGNQcm92aWRlciB7XHJcbiAgICAvKipcclxuICAgICAqICBUaGUgUHJvamVjdCBJRCBmb3IgdGhlIElORlVSQSBjb25uZWN0aW9uLlxyXG4gICAgICovXHJcbiAgICBwcm9qZWN0SWQ7XHJcbiAgICAvKipcclxuICAgICAqICBUaGUgUHJvamVjdCBTZWNyZXQuXHJcbiAgICAgKlxyXG4gICAgICogIElmIG51bGwsIG5vIGF1dGhlbnRpY2F0ZWQgcmVxdWVzdHMgYXJlIG1hZGUuIFRoaXMgc2hvdWxkIG5vdFxyXG4gICAgICogIGJlIHVzZWQgb3V0c2lkZSBvZiBwcml2YXRlIGNvbnRleHRzLlxyXG4gICAgICovXHJcbiAgICBwcm9qZWN0U2VjcmV0O1xyXG4gICAgLyoqXHJcbiAgICAgKiAgQ3JlYXRlcyBhIG5ldyAqKkluZnVyYVByb3ZpZGVyKiouXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKF9uZXR3b3JrLCBwcm9qZWN0SWQsIHByb2plY3RTZWNyZXQpIHtcclxuICAgICAgICBpZiAoX25ldHdvcmsgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBfbmV0d29yayA9IFwibWFpbm5ldFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBuZXR3b3JrID0gTmV0d29yay5mcm9tKF9uZXR3b3JrKTtcclxuICAgICAgICBpZiAocHJvamVjdElkID09IG51bGwpIHtcclxuICAgICAgICAgICAgcHJvamVjdElkID0gZGVmYXVsdFByb2plY3RJZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHByb2plY3RTZWNyZXQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBwcm9qZWN0U2VjcmV0ID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IEluZnVyYVByb3ZpZGVyLmdldFJlcXVlc3QobmV0d29yaywgcHJvamVjdElkLCBwcm9qZWN0U2VjcmV0KTtcclxuICAgICAgICBzdXBlcihyZXF1ZXN0LCBuZXR3b3JrLCB7IHN0YXRpY05ldHdvcms6IG5ldHdvcmsgfSk7XHJcbiAgICAgICAgZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7IHByb2plY3RJZCwgcHJvamVjdFNlY3JldCB9KTtcclxuICAgIH1cclxuICAgIF9nZXRQcm92aWRlcihjaGFpbklkKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBJbmZ1cmFQcm92aWRlcihjaGFpbklkLCB0aGlzLnByb2plY3RJZCwgdGhpcy5wcm9qZWN0U2VjcmV0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7IH1cclxuICAgICAgICByZXR1cm4gc3VwZXIuX2dldFByb3ZpZGVyKGNoYWluSWQpO1xyXG4gICAgfVxyXG4gICAgaXNDb21tdW5pdHlSZXNvdXJjZSgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMucHJvamVjdElkID09PSBkZWZhdWx0UHJvamVjdElkKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogIENyZWF0ZXMgYSBuZXcgKipJbmZ1cmFXZWJTb2NrZXRQcm92aWRlcioqLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0V2ViU29ja2V0UHJvdmlkZXIobmV0d29yaywgcHJvamVjdElkKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBJbmZ1cmFXZWJTb2NrZXRQcm92aWRlcihuZXR3b3JrLCBwcm9qZWN0SWQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiAgUmV0dXJucyBhIHByZXBhcmVkIHJlcXVlc3QgZm9yIGNvbm5lY3RpbmcgdG8gJSVuZXR3b3JrJSVcclxuICAgICAqICB3aXRoICUlcHJvamVjdElkJSUgYW5kICUlcHJvamVjdFNlY3JldCUlLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0UmVxdWVzdChuZXR3b3JrLCBwcm9qZWN0SWQsIHByb2plY3RTZWNyZXQpIHtcclxuICAgICAgICBpZiAocHJvamVjdElkID09IG51bGwpIHtcclxuICAgICAgICAgICAgcHJvamVjdElkID0gZGVmYXVsdFByb2plY3RJZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHByb2plY3RTZWNyZXQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBwcm9qZWN0U2VjcmV0ID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IG5ldyBGZXRjaFJlcXVlc3QoYGh0dHBzOi9cXC8ke2dldEhvc3QobmV0d29yay5uYW1lKX0vdjMvJHtwcm9qZWN0SWR9YCk7XHJcbiAgICAgICAgcmVxdWVzdC5hbGxvd0d6aXAgPSB0cnVlO1xyXG4gICAgICAgIGlmIChwcm9qZWN0U2VjcmV0KSB7XHJcbiAgICAgICAgICAgIHJlcXVlc3Quc2V0Q3JlZGVudGlhbHMoXCJcIiwgcHJvamVjdFNlY3JldCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwcm9qZWN0SWQgPT09IGRlZmF1bHRQcm9qZWN0SWQpIHtcclxuICAgICAgICAgICAgcmVxdWVzdC5yZXRyeUZ1bmMgPSBhc3luYyAocmVxdWVzdCwgcmVzcG9uc2UsIGF0dGVtcHQpID0+IHtcclxuICAgICAgICAgICAgICAgIHNob3dUaHJvdHRsZU1lc3NhZ2UoXCJJbmZ1cmFQcm92aWRlclwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVxdWVzdDtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcm92aWRlci1pbmZ1cmEuanMubWFwIiwiLyoqXHJcbiAqICBbW2xpbmstcXVpY2tub2RlXV0gcHJvdmlkZXMgYSB0aGlyZC1wYXJ0eSBzZXJ2aWNlIGZvciBjb25uZWN0aW5nIHRvXHJcbiAqICB2YXJpb3VzIGJsb2NrY2hhaW5zIG92ZXIgSlNPTi1SUEMuXHJcbiAqXHJcbiAqICAqKlN1cHBvcnRlZCBOZXR3b3JrcyoqXHJcbiAqXHJcbiAqICAtIEV0aGVyZXVtIE1haW5uZXQgKGBgbWFpbm5ldGBgKVxyXG4gKiAgLSBHb2VybGkgVGVzdG5ldCAoYGBnb2VybGlgYClcclxuICogIC0gU2Vwb2xpYSBUZXN0bmV0IChgYHNlcG9saWFgYClcclxuICogIC0gSG9sZXNreSBUZXN0bmV0IChgYGhvbGVza3lgYClcclxuICogIC0gQXJiaXRydW0gKGBgYXJiaXRydW1gYClcclxuICogIC0gQXJiaXRydW0gR29lcmxpIFRlc3RuZXQgKGBgYXJiaXRydW0tZ29lcmxpYGApXHJcbiAqICAtIEFyYml0cnVtIFNlcG9saWEgVGVzdG5ldCAoYGBhcmJpdHJ1bS1zZXBvbGlhYGApXHJcbiAqICAtIEJhc2UgTWFpbm5ldCAoYGBiYXNlYGApO1xyXG4gKiAgLSBCYXNlIEdvZXJsaSBUZXN0bmV0IChgYGJhc2UtZ29lcmxpYGApO1xyXG4gKiAgLSBCYXNlIFNlcG9saWEgVGVzdG5ldCAoYGBiYXNlLXNlcG9saWFgYCk7XHJcbiAqICAtIEJOQiBTbWFydCBDaGFpbiBNYWlubmV0IChgYGJuYmBgKVxyXG4gKiAgLSBCTkIgU21hcnQgQ2hhaW4gVGVzdG5ldCAoYGBibmJ0YGApXHJcbiAqICAtIE9wdGltaXNtIChgYG9wdGltaXNtYGApXHJcbiAqICAtIE9wdGltaXNtIEdvZXJsaSBUZXN0bmV0IChgYG9wdGltaXNtLWdvZXJsaWBgKVxyXG4gKiAgLSBPcHRpbWlzbSBTZXBvbGlhIFRlc3RuZXQgKGBgb3B0aW1pc20tc2Vwb2xpYWBgKVxyXG4gKiAgLSBQb2x5Z29uIChgYG1hdGljYGApXHJcbiAqICAtIFBvbHlnb24gTXVtYmFpIFRlc3RuZXQgKGBgbWF0aWMtbXVtYmFpYGApXHJcbiAqXHJcbiAqICBAX3N1YnNlY3Rpb246IGFwaS9wcm92aWRlcnMvdGhpcmRwYXJ0eTpRdWlja05vZGUgIFtwcm92aWRlcnMtcXVpY2tub2RlXVxyXG4gKi9cclxuaW1wb3J0IHsgZGVmaW5lUHJvcGVydGllcywgRmV0Y2hSZXF1ZXN0LCBhc3NlcnRBcmd1bWVudCB9IGZyb20gXCIuLi91dGlscy9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyBzaG93VGhyb3R0bGVNZXNzYWdlIH0gZnJvbSBcIi4vY29tbXVuaXR5LmpzXCI7XHJcbmltcG9ydCB7IE5ldHdvcmsgfSBmcm9tIFwiLi9uZXR3b3JrLmpzXCI7XHJcbmltcG9ydCB7IEpzb25ScGNQcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLWpzb25ycGMuanNcIjtcclxuY29uc3QgZGVmYXVsdFRva2VuID0gXCI5MTliNDEyYTA1N2I1ZTljOWI2ZGNlMTkzYzVhNjAyNDJkNmVmYWRiXCI7XHJcbmZ1bmN0aW9uIGdldEhvc3QobmFtZSkge1xyXG4gICAgc3dpdGNoIChuYW1lKSB7XHJcbiAgICAgICAgY2FzZSBcIm1haW5uZXRcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiZXRoZXJzLnF1aWtub2RlLnByb1wiO1xyXG4gICAgICAgIGNhc2UgXCJnb2VybGlcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiZXRoZXJzLmV0aGVyZXVtLWdvZXJsaS5xdWlrbm9kZS5wcm9cIjtcclxuICAgICAgICBjYXNlIFwic2Vwb2xpYVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJldGhlcnMuZXRoZXJldW0tc2Vwb2xpYS5xdWlrbm9kZS5wcm9cIjtcclxuICAgICAgICBjYXNlIFwiaG9sZXNreVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJldGhlcnMuZXRoZXJldW0taG9sZXNreS5xdWlrbm9kZS5wcm9cIjtcclxuICAgICAgICBjYXNlIFwiYXJiaXRydW1cIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiZXRoZXJzLmFyYml0cnVtLW1haW5uZXQucXVpa25vZGUucHJvXCI7XHJcbiAgICAgICAgY2FzZSBcImFyYml0cnVtLWdvZXJsaVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJldGhlcnMuYXJiaXRydW0tZ29lcmxpLnF1aWtub2RlLnByb1wiO1xyXG4gICAgICAgIGNhc2UgXCJhcmJpdHJ1bS1zZXBvbGlhXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImV0aGVycy5hcmJpdHJ1bS1zZXBvbGlhLnF1aWtub2RlLnByb1wiO1xyXG4gICAgICAgIGNhc2UgXCJiYXNlXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImV0aGVycy5iYXNlLW1haW5uZXQucXVpa25vZGUucHJvXCI7XHJcbiAgICAgICAgY2FzZSBcImJhc2UtZ29lcmxpXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImV0aGVycy5iYXNlLWdvZXJsaS5xdWlrbm9kZS5wcm9cIjtcclxuICAgICAgICBjYXNlIFwiYmFzZS1zcG9saWFcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiZXRoZXJzLmJhc2Utc2Vwb2xpYS5xdWlrbm9kZS5wcm9cIjtcclxuICAgICAgICBjYXNlIFwiYm5iXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImV0aGVycy5ic2MucXVpa25vZGUucHJvXCI7XHJcbiAgICAgICAgY2FzZSBcImJuYnRcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiZXRoZXJzLmJzYy10ZXN0bmV0LnF1aWtub2RlLnByb1wiO1xyXG4gICAgICAgIGNhc2UgXCJtYXRpY1wiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJldGhlcnMubWF0aWMucXVpa25vZGUucHJvXCI7XHJcbiAgICAgICAgY2FzZSBcIm1hdGljLW11bWJhaVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJldGhlcnMubWF0aWMtdGVzdG5ldC5xdWlrbm9kZS5wcm9cIjtcclxuICAgICAgICBjYXNlIFwib3B0aW1pc21cIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiZXRoZXJzLm9wdGltaXNtLnF1aWtub2RlLnByb1wiO1xyXG4gICAgICAgIGNhc2UgXCJvcHRpbWlzbS1nb2VybGlcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiZXRoZXJzLm9wdGltaXNtLWdvZXJsaS5xdWlrbm9kZS5wcm9cIjtcclxuICAgICAgICBjYXNlIFwib3B0aW1pc20tc2Vwb2xpYVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJldGhlcnMub3B0aW1pc20tc2Vwb2xpYS5xdWlrbm9kZS5wcm9cIjtcclxuICAgICAgICBjYXNlIFwieGRhaVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJldGhlcnMueGRhaS5xdWlrbm9kZS5wcm9cIjtcclxuICAgIH1cclxuICAgIGFzc2VydEFyZ3VtZW50KGZhbHNlLCBcInVuc3VwcG9ydGVkIG5ldHdvcmtcIiwgXCJuZXR3b3JrXCIsIG5hbWUpO1xyXG59XHJcbi8qXHJcbkBUT0RPOlxyXG4gIFRoZXNlIG5ldHdvcmtzIGFyZSBub3QgY3VycmVudGx5IHByZXNlbnQgaW4gdGhlIE5ldHdvcmtcclxuICBkZWZhdWx0IGluY2x1ZGVkIG5ldHdvcmtzLiBSZXNlYXJjaCB0aGVtIGFuZCBlbnN1cmUgdGhleVxyXG4gIGFyZSBFVk0gY29tcGF0aWJsZSBhbmQgd29yayB3aXRoIGV0aGVyc1xyXG5cclxuICBodHRwOi8vZXRoZXJzLm1hdGljLWFtb3kucXVpa25vZGUucHJvXHJcblxyXG4gIGh0dHA6Ly9ldGhlcnMuYXZhbGFuY2hlLW1haW5uZXQucXVpa25vZGUucHJvXHJcbiAgaHR0cDovL2V0aGVycy5hdmFsYW5jaGUtdGVzdG5ldC5xdWlrbm9kZS5wcm9cclxuICBodHRwOi8vZXRoZXJzLmJsYXN0LXNlcG9saWEucXVpa25vZGUucHJvXHJcbiAgaHR0cDovL2V0aGVycy5jZWxvLW1haW5uZXQucXVpa25vZGUucHJvXHJcbiAgaHR0cDovL2V0aGVycy5mYW50b20ucXVpa25vZGUucHJvXHJcbiAgaHR0cDovL2V0aGVycy5pbXgtZGVtby5xdWlrbm9kZS5wcm9cclxuICBodHRwOi8vZXRoZXJzLmlteC1tYWlubmV0LnF1aWtub2RlLnByb1xyXG4gIGh0dHA6Ly9ldGhlcnMuaW14LXRlc3RuZXQucXVpa25vZGUucHJvXHJcbiAgaHR0cDovL2V0aGVycy5uZWFyLW1haW5uZXQucXVpa25vZGUucHJvXHJcbiAgaHR0cDovL2V0aGVycy5uZWFyLXRlc3RuZXQucXVpa25vZGUucHJvXHJcbiAgaHR0cDovL2V0aGVycy5ub3ZhLW1haW5uZXQucXVpa25vZGUucHJvXHJcbiAgaHR0cDovL2V0aGVycy5zY3JvbGwtbWFpbm5ldC5xdWlrbm9kZS5wcm9cclxuICBodHRwOi8vZXRoZXJzLnNjcm9sbC10ZXN0bmV0LnF1aWtub2RlLnByb1xyXG4gIGh0dHA6Ly9ldGhlcnMudHJvbi1tYWlubmV0LnF1aWtub2RlLnByb1xyXG4gIGh0dHA6Ly9ldGhlcnMuemtldm0tbWFpbm5ldC5xdWlrbm9kZS5wcm9cclxuICBodHRwOi8vZXRoZXJzLnprZXZtLXRlc3RuZXQucXVpa25vZGUucHJvXHJcbiAgaHR0cDovL2V0aGVycy56a3N5bmMtbWFpbm5ldC5xdWlrbm9kZS5wcm9cclxuICBodHRwOi8vZXRoZXJzLnprc3luYy10ZXN0bmV0LnF1aWtub2RlLnByb1xyXG4qL1xyXG4vKipcclxuICogIFRoZSAqKlF1aWNrTm9kZVByb3ZpZGVyKiogY29ubmVjdHMgdG8gdGhlIFtbbGluay1xdWlja25vZGVdXVxyXG4gKiAgSlNPTi1SUEMgZW5kLXBvaW50cy5cclxuICpcclxuICogIEJ5IGRlZmF1bHQsIGEgaGlnaGx5LXRocm90dGxlZCBBUEkgdG9rZW4gaXMgdXNlZCwgd2hpY2ggaXNcclxuICogIGFwcHJvcHJpYXRlIGZvciBxdWljayBwcm90b3R5cGVzIGFuZCBzaW1wbGUgc2NyaXB0cy4gVG9cclxuICogIGdhaW4gYWNjZXNzIHRvIGFuIGluY3JlYXNlZCByYXRlLWxpbWl0LCBpdCBpcyBoaWdobHlcclxuICogIHJlY29tbWVuZGVkIHRvIFtzaWduIHVwIGhlcmVdKGxpbmstcXVpY2tub2RlKS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBRdWlja05vZGVQcm92aWRlciBleHRlbmRzIEpzb25ScGNQcm92aWRlciB7XHJcbiAgICAvKipcclxuICAgICAqICBUaGUgQVBJIHRva2VuLlxyXG4gICAgICovXHJcbiAgICB0b2tlbjtcclxuICAgIC8qKlxyXG4gICAgICogIENyZWF0ZXMgYSBuZXcgKipRdWlja05vZGVQcm92aWRlcioqLlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihfbmV0d29yaywgdG9rZW4pIHtcclxuICAgICAgICBpZiAoX25ldHdvcmsgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBfbmV0d29yayA9IFwibWFpbm5ldFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBuZXR3b3JrID0gTmV0d29yay5mcm9tKF9uZXR3b3JrKTtcclxuICAgICAgICBpZiAodG9rZW4gPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0b2tlbiA9IGRlZmF1bHRUb2tlbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IFF1aWNrTm9kZVByb3ZpZGVyLmdldFJlcXVlc3QobmV0d29yaywgdG9rZW4pO1xyXG4gICAgICAgIHN1cGVyKHJlcXVlc3QsIG5ldHdvcmssIHsgc3RhdGljTmV0d29yazogbmV0d29yayB9KTtcclxuICAgICAgICBkZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHsgdG9rZW4gfSk7XHJcbiAgICB9XHJcbiAgICBfZ2V0UHJvdmlkZXIoY2hhaW5JZCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUXVpY2tOb2RlUHJvdmlkZXIoY2hhaW5JZCwgdGhpcy50b2tlbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnJvcikgeyB9XHJcbiAgICAgICAgcmV0dXJuIHN1cGVyLl9nZXRQcm92aWRlcihjaGFpbklkKTtcclxuICAgIH1cclxuICAgIGlzQ29tbXVuaXR5UmVzb3VyY2UoKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLnRva2VuID09PSBkZWZhdWx0VG9rZW4pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiAgUmV0dXJucyBhIG5ldyByZXF1ZXN0IHByZXBhcmVkIGZvciAlJW5ldHdvcmslJSBhbmQgdGhlXHJcbiAgICAgKiAgJSV0b2tlbiUlLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0UmVxdWVzdChuZXR3b3JrLCB0b2tlbikge1xyXG4gICAgICAgIGlmICh0b2tlbiA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRva2VuID0gZGVmYXVsdFRva2VuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gbmV3IEZldGNoUmVxdWVzdChgaHR0cHM6L1xcLyR7Z2V0SG9zdChuZXR3b3JrLm5hbWUpfS8ke3Rva2VufWApO1xyXG4gICAgICAgIHJlcXVlc3QuYWxsb3dHemlwID0gdHJ1ZTtcclxuICAgICAgICAvL2lmIChwcm9qZWN0U2VjcmV0KSB7IHJlcXVlc3Quc2V0Q3JlZGVudGlhbHMoXCJcIiwgcHJvamVjdFNlY3JldCk7IH1cclxuICAgICAgICBpZiAodG9rZW4gPT09IGRlZmF1bHRUb2tlbikge1xyXG4gICAgICAgICAgICByZXF1ZXN0LnJldHJ5RnVuYyA9IGFzeW5jIChyZXF1ZXN0LCByZXNwb25zZSwgYXR0ZW1wdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2hvd1Rocm90dGxlTWVzc2FnZShcIlF1aWNrTm9kZVByb3ZpZGVyXCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXF1ZXN0O1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByb3ZpZGVyLXF1aWNrbm9kZS5qcy5tYXAiLCIvKipcclxuICogIEEgKipGYWxsYmFja1Byb3ZpZGVyKiogcHJvdmlkZXMgcmVzaWxpZW5jZSwgc2VjdXJpdHkgYW5kIHBlcmZvcm1hbmNlXHJcbiAqICBpbiBhIHdheSB0aGF0IGlzIGN1c3RvbWl6YWJsZSBhbmQgY29uZmlndXJhYmxlLlxyXG4gKlxyXG4gKiAgQF9zZWN0aW9uOiBhcGkvcHJvdmlkZXJzL2ZhbGxiYWNrLXByb3ZpZGVyOkZhbGxiYWNrIFByb3ZpZGVyIFthYm91dC1mYWxsYmFjay1wcm92aWRlcl1cclxuICovXHJcbmltcG9ydCB7IGFzc2VydCwgYXNzZXJ0QXJndW1lbnQsIGdldEJpZ0ludCwgZ2V0TnVtYmVyLCBpc0Vycm9yIH0gZnJvbSBcIi4uL3V0aWxzL2luZGV4LmpzXCI7XHJcbmltcG9ydCB7IEFic3RyYWN0UHJvdmlkZXIgfSBmcm9tIFwiLi9hYnN0cmFjdC1wcm92aWRlci5qc1wiO1xyXG5pbXBvcnQgeyBOZXR3b3JrIH0gZnJvbSBcIi4vbmV0d29yay5qc1wiO1xyXG5jb25zdCBCTl8xID0gQmlnSW50KFwiMVwiKTtcclxuY29uc3QgQk5fMiA9IEJpZ0ludChcIjJcIik7XHJcbmZ1bmN0aW9uIHNodWZmbGUoYXJyYXkpIHtcclxuICAgIGZvciAobGV0IGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XHJcbiAgICAgICAgY29uc3QgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xyXG4gICAgICAgIGNvbnN0IHRtcCA9IGFycmF5W2ldO1xyXG4gICAgICAgIGFycmF5W2ldID0gYXJyYXlbal07XHJcbiAgICAgICAgYXJyYXlbal0gPSB0bXA7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gc3RhbGwoZHVyYXRpb24pIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4geyBzZXRUaW1lb3V0KHJlc29sdmUsIGR1cmF0aW9uKTsgfSk7XHJcbn1cclxuZnVuY3Rpb24gZ2V0VGltZSgpIHsgcmV0dXJuIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7IH1cclxuZnVuY3Rpb24gc3RyaW5naWZ5KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUsIChrZXksIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAodmFsdWUpID09PSBcImJpZ2ludFwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHR5cGU6IFwiYmlnaW50XCIsIHZhbHVlOiB2YWx1ZS50b1N0cmluZygpIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0pO1xyXG59XHJcbjtcclxuY29uc3QgZGVmYXVsdENvbmZpZyA9IHsgc3RhbGxUaW1lb3V0OiA0MDAsIHByaW9yaXR5OiAxLCB3ZWlnaHQ6IDEgfTtcclxuY29uc3QgZGVmYXVsdFN0YXRlID0ge1xyXG4gICAgYmxvY2tOdW1iZXI6IC0yLCByZXF1ZXN0czogMCwgbGF0ZVJlc3BvbnNlczogMCwgZXJyb3JSZXNwb25zZXM6IDAsXHJcbiAgICBvdXRPZlN5bmM6IC0xLCB1bnN1cHBvcnRlZEV2ZW50czogMCwgcm9sbGluZ0R1cmF0aW9uOiAwLCBzY29yZTogMCxcclxuICAgIF9uZXR3b3JrOiBudWxsLCBfdXBkYXRlTnVtYmVyOiBudWxsLCBfdG90YWxUaW1lOiAwLFxyXG4gICAgX2xhc3RGYXRhbEVycm9yOiBudWxsLCBfbGFzdEZhdGFsRXJyb3JUaW1lc3RhbXA6IDBcclxufTtcclxuYXN5bmMgZnVuY3Rpb24gd2FpdEZvclN5bmMoY29uZmlnLCBibG9ja051bWJlcikge1xyXG4gICAgd2hpbGUgKGNvbmZpZy5ibG9ja051bWJlciA8IDAgfHwgY29uZmlnLmJsb2NrTnVtYmVyIDwgYmxvY2tOdW1iZXIpIHtcclxuICAgICAgICBpZiAoIWNvbmZpZy5fdXBkYXRlTnVtYmVyKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5fdXBkYXRlTnVtYmVyID0gKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYmxvY2tOdW1iZXIgPSBhd2FpdCBjb25maWcucHJvdmlkZXIuZ2V0QmxvY2tOdW1iZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYmxvY2tOdW1iZXIgPiBjb25maWcuYmxvY2tOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLmJsb2NrTnVtYmVyID0gYmxvY2tOdW1iZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLmJsb2NrTnVtYmVyID0gLTI7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLl9sYXN0RmF0YWxFcnJvciA9IGVycm9yO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5fbGFzdEZhdGFsRXJyb3JUaW1lc3RhbXAgPSBnZXRUaW1lKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25maWcuX3VwZGF0ZU51bWJlciA9IG51bGw7XHJcbiAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IGNvbmZpZy5fdXBkYXRlTnVtYmVyO1xyXG4gICAgICAgIGNvbmZpZy5vdXRPZlN5bmMrKztcclxuICAgICAgICBpZiAoY29uZmlnLl9sYXN0RmF0YWxFcnJvcikge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gX25vcm1hbGl6ZSh2YWx1ZSkge1xyXG4gICAgaWYgKHZhbHVlID09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gXCJudWxsXCI7XHJcbiAgICB9XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gXCJbXCIgKyAodmFsdWUubWFwKF9ub3JtYWxpemUpKS5qb2luKFwiLFwiKSArIFwiXVwiO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiAodmFsdWUpID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiAodmFsdWUudG9KU09OKSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgcmV0dXJuIF9ub3JtYWxpemUodmFsdWUudG9KU09OKCkpO1xyXG4gICAgfVxyXG4gICAgc3dpdGNoICh0eXBlb2YgKHZhbHVlKSkge1xyXG4gICAgICAgIGNhc2UgXCJib29sZWFuXCI6XHJcbiAgICAgICAgY2FzZSBcInN5bWJvbFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcclxuICAgICAgICBjYXNlIFwiYmlnaW50XCI6XHJcbiAgICAgICAgY2FzZSBcIm51bWJlclwiOlxyXG4gICAgICAgICAgICByZXR1cm4gQmlnSW50KHZhbHVlKS50b1N0cmluZygpO1xyXG4gICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcclxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcclxuICAgICAgICBjYXNlIFwib2JqZWN0XCI6IHtcclxuICAgICAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcclxuICAgICAgICAgICAga2V5cy5zb3J0KCk7XHJcbiAgICAgICAgICAgIHJldHVybiBcIntcIiArIGtleXMubWFwKChrKSA9PiBgJHtKU09OLnN0cmluZ2lmeShrKX06JHtfbm9ybWFsaXplKHZhbHVlW2tdKX1gKS5qb2luKFwiLFwiKSArIFwifVwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNvbnNvbGUubG9nKFwiQ291bGQgbm90IHNlcmlhbGl6ZVwiLCB2YWx1ZSk7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJIbW0uLi5cIik7XHJcbn1cclxuZnVuY3Rpb24gbm9ybWFsaXplUmVzdWx0KG1ldGhvZCwgdmFsdWUpIHtcclxuICAgIGlmIChcImVycm9yXCIgaW4gdmFsdWUpIHtcclxuICAgICAgICBjb25zdCBlcnJvciA9IHZhbHVlLmVycm9yO1xyXG4gICAgICAgIGxldCB0YWc7XHJcbiAgICAgICAgaWYgKGlzRXJyb3IoZXJyb3IsIFwiQ0FMTF9FWENFUFRJT05cIikpIHtcclxuICAgICAgICAgICAgdGFnID0gX25vcm1hbGl6ZShPYmplY3QuYXNzaWduKHt9LCBlcnJvciwge1xyXG4gICAgICAgICAgICAgICAgc2hvcnRNZXNzYWdlOiB1bmRlZmluZWQsIHJlYXNvbjogdW5kZWZpbmVkLCBpbmZvOiB1bmRlZmluZWRcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGFnID0gX25vcm1hbGl6ZShlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7IHRhZywgdmFsdWU6IGVycm9yIH07XHJcbiAgICB9XHJcbiAgICBjb25zdCByZXN1bHQgPSB2YWx1ZS5yZXN1bHQ7XHJcbiAgICByZXR1cm4geyB0YWc6IF9ub3JtYWxpemUocmVzdWx0KSwgdmFsdWU6IHJlc3VsdCB9O1xyXG59XHJcbi8vIFRoaXMgc3RyYXRlZ3kgcGlja3MgdGhlIGhpZ2hlc3Qgd2VpZ2h0IHJlc3VsdCwgYXMgbG9uZyBhcyB0aGUgd2VpZ2h0IGlzXHJcbi8vIGVxdWFsIHRvIG9yIGdyZWF0ZXIgdGhhbiBxdW9ydW1cclxuZnVuY3Rpb24gY2hlY2tRdW9ydW0ocXVvcnVtLCByZXN1bHRzKSB7XHJcbiAgICBjb25zdCB0YWxseSA9IG5ldyBNYXAoKTtcclxuICAgIGZvciAoY29uc3QgeyB2YWx1ZSwgdGFnLCB3ZWlnaHQgfSBvZiByZXN1bHRzKSB7XHJcbiAgICAgICAgY29uc3QgdCA9IHRhbGx5LmdldCh0YWcpIHx8IHsgdmFsdWUsIHdlaWdodDogMCB9O1xyXG4gICAgICAgIHQud2VpZ2h0ICs9IHdlaWdodDtcclxuICAgICAgICB0YWxseS5zZXQodGFnLCB0KTtcclxuICAgIH1cclxuICAgIGxldCBiZXN0ID0gbnVsbDtcclxuICAgIGZvciAoY29uc3QgciBvZiB0YWxseS52YWx1ZXMoKSkge1xyXG4gICAgICAgIGlmIChyLndlaWdodCA+PSBxdW9ydW0gJiYgKCFiZXN0IHx8IHIud2VpZ2h0ID4gYmVzdC53ZWlnaHQpKSB7XHJcbiAgICAgICAgICAgIGJlc3QgPSByO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChiZXN0KSB7XHJcbiAgICAgICAgcmV0dXJuIGJlc3QudmFsdWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG59XHJcbmZ1bmN0aW9uIGdldE1lZGlhbihxdW9ydW0sIHJlc3VsdHMpIHtcclxuICAgIGxldCByZXN1bHRXZWlnaHQgPSAwO1xyXG4gICAgY29uc3QgZXJyb3JNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICBsZXQgYmVzdEVycm9yID0gbnVsbDtcclxuICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xyXG4gICAgZm9yIChjb25zdCB7IHZhbHVlLCB0YWcsIHdlaWdodCB9IG9mIHJlc3VsdHMpIHtcclxuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBFcnJvcikge1xyXG4gICAgICAgICAgICBjb25zdCBlID0gZXJyb3JNYXAuZ2V0KHRhZykgfHwgeyB2YWx1ZSwgd2VpZ2h0OiAwIH07XHJcbiAgICAgICAgICAgIGUud2VpZ2h0ICs9IHdlaWdodDtcclxuICAgICAgICAgICAgZXJyb3JNYXAuc2V0KHRhZywgZSk7XHJcbiAgICAgICAgICAgIGlmIChiZXN0RXJyb3IgPT0gbnVsbCB8fCBlLndlaWdodCA+IGJlc3RFcnJvci53ZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIGJlc3RFcnJvciA9IGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhbHVlcy5wdXNoKEJpZ0ludCh2YWx1ZSkpO1xyXG4gICAgICAgICAgICByZXN1bHRXZWlnaHQgKz0gd2VpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChyZXN1bHRXZWlnaHQgPCBxdW9ydW0pIHtcclxuICAgICAgICAvLyBXZSBoYXZlIHF1b3J1bSBmb3IgYW4gZXJyb3JcclxuICAgICAgICBpZiAoYmVzdEVycm9yICYmIGJlc3RFcnJvci53ZWlnaHQgPj0gcXVvcnVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiZXN0RXJyb3IudmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFdlIGRvIG5vdCBoYXZlIHF1b3J1bSBmb3IgYSByZXN1bHRcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgLy8gR2V0IHRoZSBzb3J0ZWQgdmFsdWVzXHJcbiAgICB2YWx1ZXMuc29ydCgoYSwgYikgPT4gKChhIDwgYikgPyAtMSA6IChiID4gYSkgPyAxIDogMCkpO1xyXG4gICAgY29uc3QgbWlkID0gTWF0aC5mbG9vcih2YWx1ZXMubGVuZ3RoIC8gMik7XHJcbiAgICAvLyBPZGQtbGVuZ3RoOyB0YWtlIHRoZSBtaWRkbGUgdmFsdWVcclxuICAgIGlmICh2YWx1ZXMubGVuZ3RoICUgMikge1xyXG4gICAgICAgIHJldHVybiB2YWx1ZXNbbWlkXTtcclxuICAgIH1cclxuICAgIC8vIEV2ZW4gbGVuZ3RoOyB0YWtlIHRoZSBjZWlsaW5nIG9mIHRoZSBtZWFuIG9mIHRoZSBjZW50ZXIgdHdvIHZhbHVlc1xyXG4gICAgcmV0dXJuICh2YWx1ZXNbbWlkIC0gMV0gKyB2YWx1ZXNbbWlkXSArIEJOXzEpIC8gQk5fMjtcclxufVxyXG5mdW5jdGlvbiBnZXRBbnlSZXN1bHQocXVvcnVtLCByZXN1bHRzKSB7XHJcbiAgICAvLyBJZiBhbnkgdmFsdWUgb3IgZXJyb3IgbWVldHMgcXVvcnVtLCB0aGF0IGlzIG91ciBwcmVmZXJyZWQgcmVzdWx0XHJcbiAgICBjb25zdCByZXN1bHQgPSBjaGVja1F1b3J1bShxdW9ydW0sIHJlc3VsdHMpO1xyXG4gICAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIC8vIE90aGVyd2lzZSwgZG8gd2UgaGF2ZSBhbnkgcmVzdWx0P1xyXG4gICAgZm9yIChjb25zdCByIG9mIHJlc3VsdHMpIHtcclxuICAgICAgICBpZiAoci52YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gci52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBOb3BlIVxyXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcclxufVxyXG5mdW5jdGlvbiBnZXRGdXp6eU1vZGUocXVvcnVtLCByZXN1bHRzKSB7XHJcbiAgICBpZiAocXVvcnVtID09PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldE51bWJlcihnZXRNZWRpYW4ocXVvcnVtLCByZXN1bHRzKSwgXCIlaW50ZXJuYWxcIik7XHJcbiAgICB9XHJcbiAgICBjb25zdCB0YWxseSA9IG5ldyBNYXAoKTtcclxuICAgIGNvbnN0IGFkZCA9IChyZXN1bHQsIHdlaWdodCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHQgPSB0YWxseS5nZXQocmVzdWx0KSB8fCB7IHJlc3VsdCwgd2VpZ2h0OiAwIH07XHJcbiAgICAgICAgdC53ZWlnaHQgKz0gd2VpZ2h0O1xyXG4gICAgICAgIHRhbGx5LnNldChyZXN1bHQsIHQpO1xyXG4gICAgfTtcclxuICAgIGZvciAoY29uc3QgeyB3ZWlnaHQsIHZhbHVlIH0gb2YgcmVzdWx0cykge1xyXG4gICAgICAgIGNvbnN0IHIgPSBnZXROdW1iZXIodmFsdWUpO1xyXG4gICAgICAgIGFkZChyIC0gMSwgd2VpZ2h0KTtcclxuICAgICAgICBhZGQociwgd2VpZ2h0KTtcclxuICAgICAgICBhZGQociArIDEsIHdlaWdodCk7XHJcbiAgICB9XHJcbiAgICBsZXQgYmVzdFdlaWdodCA9IDA7XHJcbiAgICBsZXQgYmVzdFJlc3VsdCA9IHVuZGVmaW5lZDtcclxuICAgIGZvciAoY29uc3QgeyB3ZWlnaHQsIHJlc3VsdCB9IG9mIHRhbGx5LnZhbHVlcygpKSB7XHJcbiAgICAgICAgLy8gVXNlIHRoaXMgcmVzdWx0LCBpZiB0aGlzIHJlc3VsdCBtZWV0cyBxdW9ydW0gYW5kIGhhcyBlaXRoZXI6XHJcbiAgICAgICAgLy8gLSBhIGJldHRlciB3ZWlnaHRcclxuICAgICAgICAvLyAtIG9yIGVxdWFsIHdlaWdodCwgYnV0IHRoZSByZXN1bHQgaXMgbGFyZ2VyXHJcbiAgICAgICAgaWYgKHdlaWdodCA+PSBxdW9ydW0gJiYgKHdlaWdodCA+IGJlc3RXZWlnaHQgfHwgKGJlc3RSZXN1bHQgIT0gbnVsbCAmJiB3ZWlnaHQgPT09IGJlc3RXZWlnaHQgJiYgcmVzdWx0ID4gYmVzdFJlc3VsdCkpKSB7XHJcbiAgICAgICAgICAgIGJlc3RXZWlnaHQgPSB3ZWlnaHQ7XHJcbiAgICAgICAgICAgIGJlc3RSZXN1bHQgPSByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJlc3RSZXN1bHQ7XHJcbn1cclxuLyoqXHJcbiAqICBBICoqRmFsbGJhY2tQcm92aWRlcioqIG1hbmFnZXMgc2V2ZXJhbCBbW1Byb3ZpZGVyc11dIHByb3ZpZGluZ1xyXG4gKiAgcmVzaWxpZW5jZSBieSBzd2l0Y2hpbmcgYmV0d2VlbiBzbG93IG9yIG1pc2JlaGF2aW5nIG5vZGVzLCBzZWN1cml0eVxyXG4gKiAgYnkgcmVxdWlyaW5nIG11bHRpcGxlIGJhY2tlbmRzIHRvIGFnZ3JlZSBhbmQgcGVyZm9ybWFuY2UgYnkgYWxsb3dpbmdcclxuICogIGZhc3RlciBiYWNrZW5kcyB0byByZXNwb25kIGVhcmxpZXIuXHJcbiAqXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRmFsbGJhY2tQcm92aWRlciBleHRlbmRzIEFic3RyYWN0UHJvdmlkZXIge1xyXG4gICAgLyoqXHJcbiAgICAgKiAgVGhlIG51bWJlciBvZiBiYWNrZW5kcyB0aGF0IG11c3QgYWdyZWUgb24gYSB2YWx1ZSBiZWZvcmUgaXQgaXNcclxuICAgICAqICBhY2NwZXRlZC5cclxuICAgICAqL1xyXG4gICAgcXVvcnVtO1xyXG4gICAgLyoqXHJcbiAgICAgKiAgQF9pZ25vcmU6XHJcbiAgICAgKi9cclxuICAgIGV2ZW50UXVvcnVtO1xyXG4gICAgLyoqXHJcbiAgICAgKiAgQF9pZ25vcmU6XHJcbiAgICAgKi9cclxuICAgIGV2ZW50V29ya2VycztcclxuICAgICNjb25maWdzO1xyXG4gICAgI2hlaWdodDtcclxuICAgICNpbml0aWFsU3luY1Byb21pc2U7XHJcbiAgICAvKipcclxuICAgICAqICBDcmVhdGVzIGEgbmV3ICoqRmFsbGJhY2tQcm92aWRlcioqIHdpdGggJSVwcm92aWRlcnMlJSBjb25uZWN0ZWQgdG9cclxuICAgICAqICAlJW5ldHdvcmslJS5cclxuICAgICAqXHJcbiAgICAgKiAgSWYgYSBbW1Byb3ZpZGVyXV0gaXMgaW5jbHVkZWQgaW4gJSVwcm92aWRlcnMlJSwgZGVmYXVsdHMgYXJlIHVzZWRcclxuICAgICAqICBmb3IgdGhlIGNvbmZpZ3VyYXRpb24uXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHByb3ZpZGVycywgbmV0d29yaywgb3B0aW9ucykge1xyXG4gICAgICAgIHN1cGVyKG5ldHdvcmssIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuI2NvbmZpZ3MgPSBwcm92aWRlcnMubWFwKChwKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChwIGluc3RhbmNlb2YgQWJzdHJhY3RQcm92aWRlcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oeyBwcm92aWRlcjogcCB9LCBkZWZhdWx0Q29uZmlnLCBkZWZhdWx0U3RhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRDb25maWcsIHAsIGRlZmF1bHRTdGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLiNoZWlnaHQgPSAtMjtcclxuICAgICAgICB0aGlzLiNpbml0aWFsU3luY1Byb21pc2UgPSBudWxsO1xyXG4gICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMucXVvcnVtICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5xdW9ydW0gPSBvcHRpb25zLnF1b3J1bTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucXVvcnVtID0gTWF0aC5jZWlsKHRoaXMuI2NvbmZpZ3MucmVkdWNlKChhY2N1bSwgY29uZmlnKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhY2N1bSArPSBjb25maWcud2VpZ2h0O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjY3VtO1xyXG4gICAgICAgICAgICB9LCAwKSAvIDIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmV2ZW50UXVvcnVtID0gMTtcclxuICAgICAgICB0aGlzLmV2ZW50V29ya2VycyA9IDE7XHJcbiAgICAgICAgYXNzZXJ0QXJndW1lbnQodGhpcy5xdW9ydW0gPD0gdGhpcy4jY29uZmlncy5yZWR1Y2UoKGEsIGMpID0+IChhICsgYy53ZWlnaHQpLCAwKSwgXCJxdW9ydW0gZXhjZWVkIHByb3ZpZGVyIHdlaWdodFwiLCBcInF1b3J1bVwiLCB0aGlzLnF1b3J1bSk7XHJcbiAgICB9XHJcbiAgICBnZXQgcHJvdmlkZXJDb25maWdzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLiNjb25maWdzLm1hcCgoYykgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBPYmplY3QuYXNzaWduKHt9LCBjKTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoa2V5WzBdID09PSBcIl9cIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSByZXN1bHRba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgX2RldGVjdE5ldHdvcmsoKSB7XHJcbiAgICAgICAgcmV0dXJuIE5ldHdvcmsuZnJvbShnZXRCaWdJbnQoYXdhaXQgdGhpcy5fcGVyZm9ybSh7IG1ldGhvZDogXCJjaGFpbklkXCIgfSkpKTtcclxuICAgIH1cclxuICAgIC8vIEBUT0RPOiBBZGQgc3VwcG9ydCB0byBzZWxlY3QgcHJvdmlkZXJzIHRvIGJlIHRoZSBldmVudCBzdWJzY3JpYmVyXHJcbiAgICAvL19nZXRTdWJzY3JpYmVyKHN1YjogU3Vic2NyaXB0aW9uKTogU3Vic2NyaWJlciB7XHJcbiAgICAvLyAgICB0aHJvdyBuZXcgRXJyb3IoXCJAVE9ET1wiKTtcclxuICAgIC8vfVxyXG4gICAgLyoqXHJcbiAgICAgKiAgVHJhbnNmb3JtcyBhICUlcmVxJSUgaW50byB0aGUgY29ycmVjdCBtZXRob2QgY2FsbCBvbiAlJXByb3ZpZGVyJSUuXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIF90cmFuc2xhdGVQZXJmb3JtKHByb3ZpZGVyLCByZXEpIHtcclxuICAgICAgICBzd2l0Y2ggKHJlcS5tZXRob2QpIHtcclxuICAgICAgICAgICAgY2FzZSBcImJyb2FkY2FzdFRyYW5zYWN0aW9uXCI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgcHJvdmlkZXIuYnJvYWRjYXN0VHJhbnNhY3Rpb24ocmVxLnNpZ25lZFRyYW5zYWN0aW9uKTtcclxuICAgICAgICAgICAgY2FzZSBcImNhbGxcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBwcm92aWRlci5jYWxsKE9iamVjdC5hc3NpZ24oe30sIHJlcS50cmFuc2FjdGlvbiwgeyBibG9ja1RhZzogcmVxLmJsb2NrVGFnIH0pKTtcclxuICAgICAgICAgICAgY2FzZSBcImNoYWluSWRcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiAoYXdhaXQgcHJvdmlkZXIuZ2V0TmV0d29yaygpKS5jaGFpbklkO1xyXG4gICAgICAgICAgICBjYXNlIFwiZXN0aW1hdGVHYXNcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBwcm92aWRlci5lc3RpbWF0ZUdhcyhyZXEudHJhbnNhY3Rpb24pO1xyXG4gICAgICAgICAgICBjYXNlIFwiZ2V0QmFsYW5jZVwiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHByb3ZpZGVyLmdldEJhbGFuY2UocmVxLmFkZHJlc3MsIHJlcS5ibG9ja1RhZyk7XHJcbiAgICAgICAgICAgIGNhc2UgXCJnZXRCbG9ja1wiOiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBibG9jayA9IChcImJsb2NrSGFzaFwiIGluIHJlcSkgPyByZXEuYmxvY2tIYXNoIDogcmVxLmJsb2NrVGFnO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHByb3ZpZGVyLmdldEJsb2NrKGJsb2NrLCByZXEuaW5jbHVkZVRyYW5zYWN0aW9ucyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBcImdldEJsb2NrTnVtYmVyXCI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgcHJvdmlkZXIuZ2V0QmxvY2tOdW1iZXIoKTtcclxuICAgICAgICAgICAgY2FzZSBcImdldENvZGVcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBwcm92aWRlci5nZXRDb2RlKHJlcS5hZGRyZXNzLCByZXEuYmxvY2tUYWcpO1xyXG4gICAgICAgICAgICBjYXNlIFwiZ2V0R2FzUHJpY2VcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiAoYXdhaXQgcHJvdmlkZXIuZ2V0RmVlRGF0YSgpKS5nYXNQcmljZTtcclxuICAgICAgICAgICAgY2FzZSBcImdldFByaW9yaXR5RmVlXCI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKGF3YWl0IHByb3ZpZGVyLmdldEZlZURhdGEoKSkubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICAgICAgICAgIGNhc2UgXCJnZXRMb2dzXCI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgcHJvdmlkZXIuZ2V0TG9ncyhyZXEuZmlsdGVyKTtcclxuICAgICAgICAgICAgY2FzZSBcImdldFN0b3JhZ2VcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBwcm92aWRlci5nZXRTdG9yYWdlKHJlcS5hZGRyZXNzLCByZXEucG9zaXRpb24sIHJlcS5ibG9ja1RhZyk7XHJcbiAgICAgICAgICAgIGNhc2UgXCJnZXRUcmFuc2FjdGlvblwiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uKHJlcS5oYXNoKTtcclxuICAgICAgICAgICAgY2FzZSBcImdldFRyYW5zYWN0aW9uQ291bnRcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbkNvdW50KHJlcS5hZGRyZXNzLCByZXEuYmxvY2tUYWcpO1xyXG4gICAgICAgICAgICBjYXNlIFwiZ2V0VHJhbnNhY3Rpb25SZWNlaXB0XCI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb25SZWNlaXB0KHJlcS5oYXNoKTtcclxuICAgICAgICAgICAgY2FzZSBcImdldFRyYW5zYWN0aW9uUmVzdWx0XCI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb25SZXN1bHQocmVxLmhhc2gpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIEdyYWIgdGhlIG5leHQgKHJhbmRvbSkgY29uZmlnIHRoYXQgaXMgbm90IGFscmVhZHkgcGFydCBvZlxyXG4gICAgLy8gdGhlIHJ1bm5pbmcgc2V0XHJcbiAgICAjZ2V0TmV4dENvbmZpZyhydW5uaW5nKSB7XHJcbiAgICAgICAgLy8gQFRPRE86IE1heWJlIGRvIGEgY2hlY2sgaGVyZSB0byBmYXZvdXIgKGhlYXZpbHkpIHByb3ZpZGVycyB0aGF0XHJcbiAgICAgICAgLy8gICAgICAgIGRvIG5vdCByZXF1aXJlIHdhaXRGb3JTeW5jIGFuZCBkaXNmYXZvdXIgcHJvdmlkZXJzIHRoYXRcclxuICAgICAgICAvLyAgICAgICAgc2VlbSBkb3duLWlzaCBvciBhcmUgYmVoYXZpbmcgc2xvd2x5XHJcbiAgICAgICAgY29uc3QgY29uZmlncyA9IEFycmF5LmZyb20ocnVubmluZykubWFwKChyKSA9PiByLmNvbmZpZyk7XHJcbiAgICAgICAgLy8gU2h1ZmZsZSB0aGUgc3RhdGVzLCBzb3J0ZWQgYnkgcHJpb3JpdHlcclxuICAgICAgICBjb25zdCBhbGxDb25maWdzID0gdGhpcy4jY29uZmlncy5zbGljZSgpO1xyXG4gICAgICAgIHNodWZmbGUoYWxsQ29uZmlncyk7XHJcbiAgICAgICAgYWxsQ29uZmlncy5zb3J0KChhLCBiKSA9PiAoYS5wcmlvcml0eSAtIGIucHJpb3JpdHkpKTtcclxuICAgICAgICBmb3IgKGNvbnN0IGNvbmZpZyBvZiBhbGxDb25maWdzKSB7XHJcbiAgICAgICAgICAgIGlmIChjb25maWcuX2xhc3RGYXRhbEVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY29uZmlncy5pbmRleE9mKGNvbmZpZykgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uZmlnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgLy8gQWRkcyBhIG5ldyBydW5uZXIgKGlmIGF2YWlsYWJsZSkgdG8gcnVubmluZy5cclxuICAgICNhZGRSdW5uZXIocnVubmluZywgcmVxKSB7XHJcbiAgICAgICAgY29uc3QgY29uZmlnID0gdGhpcy4jZ2V0TmV4dENvbmZpZyhydW5uaW5nKTtcclxuICAgICAgICAvLyBObyBydW5uZXJzIGF2YWlsYWJsZVxyXG4gICAgICAgIGlmIChjb25maWcgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IHJ1bm5lclxyXG4gICAgICAgIGNvbnN0IHJ1bm5lciA9IHtcclxuICAgICAgICAgICAgY29uZmlnLCByZXN1bHQ6IG51bGwsIGRpZEJ1bXA6IGZhbHNlLFxyXG4gICAgICAgICAgICBwZXJmb3JtOiBudWxsLCBzdGFsbGVyOiBudWxsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBub3cgPSBnZXRUaW1lKCk7XHJcbiAgICAgICAgLy8gU3RhcnQgcGVyZm9ybWluZyB0aGlzIG9wZXJhdGlvblxyXG4gICAgICAgIHJ1bm5lci5wZXJmb3JtID0gKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbmZpZy5yZXF1ZXN0cysrO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fdHJhbnNsYXRlUGVyZm9ybShjb25maWcucHJvdmlkZXIsIHJlcSk7XHJcbiAgICAgICAgICAgICAgICBydW5uZXIucmVzdWx0ID0geyByZXN1bHQgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbmZpZy5lcnJvclJlc3BvbnNlcysrO1xyXG4gICAgICAgICAgICAgICAgcnVubmVyLnJlc3VsdCA9IHsgZXJyb3IgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBkdCA9IChnZXRUaW1lKCkgLSBub3cpO1xyXG4gICAgICAgICAgICBjb25maWcuX3RvdGFsVGltZSArPSBkdDtcclxuICAgICAgICAgICAgY29uZmlnLnJvbGxpbmdEdXJhdGlvbiA9IDAuOTUgKiBjb25maWcucm9sbGluZ0R1cmF0aW9uICsgMC4wNSAqIGR0O1xyXG4gICAgICAgICAgICBydW5uZXIucGVyZm9ybSA9IG51bGw7XHJcbiAgICAgICAgfSkoKTtcclxuICAgICAgICAvLyBTdGFydCBhIHN0YWxsZXI7IHdoZW4gdGhpcyB0aW1lcyBvdXQsIGl0J3MgdGltZSB0byBmb3JjZVxyXG4gICAgICAgIC8vIGtpY2tpbmcgb2ZmIGFub3RoZXIgcnVubmVyIGJlY2F1c2Ugd2UgYXJlIHRha2luZyB0b28gbG9uZ1xyXG4gICAgICAgIHJ1bm5lci5zdGFsbGVyID0gKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgYXdhaXQgc3RhbGwoY29uZmlnLnN0YWxsVGltZW91dCk7XHJcbiAgICAgICAgICAgIHJ1bm5lci5zdGFsbGVyID0gbnVsbDtcclxuICAgICAgICB9KSgpO1xyXG4gICAgICAgIHJ1bm5pbmcuYWRkKHJ1bm5lcik7XHJcbiAgICAgICAgcmV0dXJuIHJ1bm5lcjtcclxuICAgIH1cclxuICAgIC8vIEluaXRpYWxpemVzIHRoZSBibG9ja051bWJlciBhbmQgbmV0d29yayBmb3IgZWFjaCBydW5uZXIgYW5kXHJcbiAgICAvLyBibG9ja3MgdW50aWwgaW5pdGlhbGl6ZWRcclxuICAgIGFzeW5jICNpbml0aWFsU3luYygpIHtcclxuICAgICAgICBsZXQgaW5pdGlhbFN5bmMgPSB0aGlzLiNpbml0aWFsU3luY1Byb21pc2U7XHJcbiAgICAgICAgaWYgKCFpbml0aWFsU3luYykge1xyXG4gICAgICAgICAgICBjb25zdCBwcm9taXNlcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLiNjb25maWdzLmZvckVhY2goKGNvbmZpZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaCgoYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHdhaXRGb3JTeW5jKGNvbmZpZywgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb25maWcuX2xhc3RGYXRhbEVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5fbmV0d29yayA9IGF3YWl0IGNvbmZpZy5wcm92aWRlci5nZXROZXR3b3JrKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSkoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLiNpbml0aWFsU3luY1Byb21pc2UgPSBpbml0aWFsU3luYyA9IChhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBXYWl0IGZvciBhbGwgcHJvdmlkZXJzIHRvIGhhdmUgYSBibG9jayBudW1iZXIgYW5kIG5ldHdvcmtcclxuICAgICAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcclxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGFsbCB0aGUgbmV0d29ya3MgbWF0Y2hcclxuICAgICAgICAgICAgICAgIGxldCBjaGFpbklkID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY29uZmlnIG9mIHRoaXMuI2NvbmZpZ3MpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnLl9sYXN0RmF0YWxFcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV0d29yayA9IChjb25maWcuX25ldHdvcmspO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFpbklkID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhaW5JZCA9IG5ldHdvcmsuY2hhaW5JZDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobmV0d29yay5jaGFpbklkICE9PSBjaGFpbklkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydChmYWxzZSwgXCJjYW5ub3QgbWl4IHByb3ZpZGVycyBvbiBkaWZmZXJlbnQgbmV0d29ya3NcIiwgXCJVTlNVUFBPUlRFRF9PUEVSQVRJT05cIiwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uOiBcIm5ldyBGYWxsYmFja1Byb3ZpZGVyXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhd2FpdCBpbml0aWFsU3luYztcclxuICAgIH1cclxuICAgIGFzeW5jICNjaGVja1F1b3J1bShydW5uaW5nLCByZXEpIHtcclxuICAgICAgICAvLyBHZXQgYWxsIHRoZSByZXN1bHQgb2JqZWN0c1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcclxuICAgICAgICBmb3IgKGNvbnN0IHJ1bm5lciBvZiBydW5uaW5nKSB7XHJcbiAgICAgICAgICAgIGlmIChydW5uZXIucmVzdWx0ICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHsgdGFnLCB2YWx1ZSB9ID0gbm9ybWFsaXplUmVzdWx0KHJlcS5tZXRob2QsIHJ1bm5lci5yZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgdGFnLCB2YWx1ZSwgd2VpZ2h0OiBydW5uZXIuY29uZmlnLndlaWdodCB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBBcmUgdGhlcmUgZW5vdWdoIHJlc3VsdHMgdG8gZXZlbnQgbWVldCBxdW9ydW0/XHJcbiAgICAgICAgaWYgKHJlc3VsdHMucmVkdWNlKChhLCByKSA9PiAoYSArIHIud2VpZ2h0KSwgMCkgPCB0aGlzLnF1b3J1bSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKHJlcS5tZXRob2QpIHtcclxuICAgICAgICAgICAgY2FzZSBcImdldEJsb2NrTnVtYmVyXCI6IHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIG5lZWQgdG8gZ2V0IHRoZSBib290c3RyYXAgYmxvY2sgaGVpZ2h0XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4jaGVpZ2h0ID09PSAtMikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuI2hlaWdodCA9IE1hdGguY2VpbChnZXROdW1iZXIoZ2V0TWVkaWFuKHRoaXMucXVvcnVtLCB0aGlzLiNjb25maWdzLmZpbHRlcigoYykgPT4gKCFjLl9sYXN0RmF0YWxFcnJvcikpLm1hcCgoYykgPT4gKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGMuYmxvY2tOdW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZzogZ2V0TnVtYmVyKGMuYmxvY2tOdW1iZXIpLnRvU3RyaW5nKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdlaWdodDogYy53ZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICB9KSkpKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSBtb2RlIGFjcm9zcyBhbGwgdGhlIHByb3ZpZGVycywgYWxsb3dpbmcgZm9yXHJcbiAgICAgICAgICAgICAgICAvLyBhIGxpdHRsZSBkcmlmdCBiZXR3ZWVuIGJsb2NrIGhlaWdodHNcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1vZGUgPSBnZXRGdXp6eU1vZGUodGhpcy5xdW9ydW0sIHJlc3VsdHMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1vZGUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobW9kZSA+IHRoaXMuI2hlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuI2hlaWdodCA9IG1vZGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy4jaGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgXCJnZXRHYXNQcmljZVwiOlxyXG4gICAgICAgICAgICBjYXNlIFwiZ2V0UHJpb3JpdHlGZWVcIjpcclxuICAgICAgICAgICAgY2FzZSBcImVzdGltYXRlR2FzXCI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0TWVkaWFuKHRoaXMucXVvcnVtLCByZXN1bHRzKTtcclxuICAgICAgICAgICAgY2FzZSBcImdldEJsb2NrXCI6XHJcbiAgICAgICAgICAgICAgICAvLyBQZW5kaW5nIGJsb2NrcyBhcmUgaW4gdGhlIG1lbXBvb2wgYW5kIGFscmVhZHlcclxuICAgICAgICAgICAgICAgIC8vIHF1aXRlIHVudHJ1c3R3b3J0aHk7IGp1c3QgZ3JhYiBhbnl0aGluZ1xyXG4gICAgICAgICAgICAgICAgaWYgKFwiYmxvY2tUYWdcIiBpbiByZXEgJiYgcmVxLmJsb2NrVGFnID09PSBcInBlbmRpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnZXRBbnlSZXN1bHQodGhpcy5xdW9ydW0sIHJlc3VsdHMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoZWNrUXVvcnVtKHRoaXMucXVvcnVtLCByZXN1bHRzKTtcclxuICAgICAgICAgICAgY2FzZSBcImNhbGxcIjpcclxuICAgICAgICAgICAgY2FzZSBcImNoYWluSWRcIjpcclxuICAgICAgICAgICAgY2FzZSBcImdldEJhbGFuY2VcIjpcclxuICAgICAgICAgICAgY2FzZSBcImdldFRyYW5zYWN0aW9uQ291bnRcIjpcclxuICAgICAgICAgICAgY2FzZSBcImdldENvZGVcIjpcclxuICAgICAgICAgICAgY2FzZSBcImdldFN0b3JhZ2VcIjpcclxuICAgICAgICAgICAgY2FzZSBcImdldFRyYW5zYWN0aW9uXCI6XHJcbiAgICAgICAgICAgIGNhc2UgXCJnZXRUcmFuc2FjdGlvblJlY2VpcHRcIjpcclxuICAgICAgICAgICAgY2FzZSBcImdldExvZ3NcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjaGVja1F1b3J1bSh0aGlzLnF1b3J1bSwgcmVzdWx0cyk7XHJcbiAgICAgICAgICAgIGNhc2UgXCJicm9hZGNhc3RUcmFuc2FjdGlvblwiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldEFueVJlc3VsdCh0aGlzLnF1b3J1bSwgcmVzdWx0cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFzc2VydChmYWxzZSwgXCJ1bnN1cHBvcnRlZCBtZXRob2RcIiwgXCJVTlNVUFBPUlRFRF9PUEVSQVRJT05cIiwge1xyXG4gICAgICAgICAgICBvcGVyYXRpb246IGBfcGVyZm9ybSgke3N0cmluZ2lmeShyZXEubWV0aG9kKX0pYFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgI3dhaXRGb3JRdW9ydW0ocnVubmluZywgcmVxKSB7XHJcbiAgICAgICAgaWYgKHJ1bm5pbmcuc2l6ZSA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJubyBydW5uZXJzPyFcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEFueSBwcm9taXNlcyB0aGF0IGFyZSBpbnRlcmVzdGluZyB0byB3YXRjaCBmb3I7IGFuIGV4cGlyZWQgc3RhbGxcclxuICAgICAgICAvLyBvciBhIHN1Y2Nlc3NmdWwgcGVyZm9ybVxyXG4gICAgICAgIGNvbnN0IGludGVyZXN0aW5nID0gW107XHJcbiAgICAgICAgbGV0IG5ld1J1bm5lcnMgPSAwO1xyXG4gICAgICAgIGZvciAoY29uc3QgcnVubmVyIG9mIHJ1bm5pbmcpIHtcclxuICAgICAgICAgICAgLy8gTm8gcmVzcG9uc2VzLCB5ZXQ7IGtlZXAgYW4gZXllIG9uIGl0XHJcbiAgICAgICAgICAgIGlmIChydW5uZXIucGVyZm9ybSkge1xyXG4gICAgICAgICAgICAgICAgaW50ZXJlc3RpbmcucHVzaChydW5uZXIucGVyZm9ybSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gU3RpbGwgc3RhbGxpbmcuLi5cclxuICAgICAgICAgICAgaWYgKHJ1bm5lci5zdGFsbGVyKSB7XHJcbiAgICAgICAgICAgICAgICBpbnRlcmVzdGluZy5wdXNoKHJ1bm5lci5zdGFsbGVyKTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFRoaXMgcnVubmVyIGhhcyBhbHJlYWR5IHRyaWdnZXJlZCBhbm90aGVyIHJ1bm5lclxyXG4gICAgICAgICAgICBpZiAocnVubmVyLmRpZEJ1bXApIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIEdvdCBhIHJlc3BvbnNlIChyZXN1bHQgb3IgZXJyb3IpIG9yIHN0YWxsZWQ7IGtpY2sgb2ZmIGFub3RoZXIgcnVubmVyXHJcbiAgICAgICAgICAgIHJ1bm5lci5kaWRCdW1wID0gdHJ1ZTtcclxuICAgICAgICAgICAgbmV3UnVubmVycysrO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBDaGVjayBpZiB3ZSBoYXZlIHJlYWNoZWQgcXVvcnVtIG9uIGEgcmVzdWx0IChvciBlcnJvcilcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IGF3YWl0IHRoaXMuI2NoZWNrUXVvcnVtKHJ1bm5pbmcsIHJlcSk7XHJcbiAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQWRkIGFueSBuZXcgcnVubmVycywgYmVjYXVzZSBhIHN0YWxsZXIgdGltZWQgb3V0IG9yIGEgcmVzdWx0XHJcbiAgICAgICAgLy8gb3IgZXJyb3IgcmVzcG9uc2UgY2FtZSBpbi5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5ld1J1bm5lcnM7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLiNhZGRSdW5uZXIocnVubmluZywgcmVxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQWxsIHByb3ZpZGVycyBoYXZlIHJldHVybmVkLCBhbmQgd2UgaGF2ZSBubyByZXN1bHRcclxuICAgICAgICBhc3NlcnQoaW50ZXJlc3RpbmcubGVuZ3RoID4gMCwgXCJxdW9ydW0gbm90IG1ldFwiLCBcIlNFUlZFUl9FUlJPUlwiLCB7XHJcbiAgICAgICAgICAgIHJlcXVlc3Q6IFwiJXN1Yi1yZXF1ZXN0c1wiLFxyXG4gICAgICAgICAgICBpbmZvOiB7IHJlcXVlc3Q6IHJlcSwgcmVzdWx0czogQXJyYXkuZnJvbShydW5uaW5nKS5tYXAoKHIpID0+IHN0cmluZ2lmeShyLnJlc3VsdCkpIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBXYWl0IGZvciBzb21lb25lIHRvIGVpdGhlciBjb21wbGV0ZSBpdHMgcGVyZm9ybSBvciBzdGFsbCBvdXRcclxuICAgICAgICBhd2FpdCBQcm9taXNlLnJhY2UoaW50ZXJlc3RpbmcpO1xyXG4gICAgICAgIC8vIFRoaXMgaXMgcmVjdXJzaXZlLCBidXQgYXQgd29yc3QgY2FzZSB0aGUgZGVwdGggaXMgMnggdGhlXHJcbiAgICAgICAgLy8gbnVtYmVyIG9mIHByb3ZpZGVycyAoZWFjaCBoYXMgYSBwZXJmb3JtIGFuZCBhIHN0YWxsZXIpXHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuI3dhaXRGb3JRdW9ydW0ocnVubmluZywgcmVxKTtcclxuICAgIH1cclxuICAgIGFzeW5jIF9wZXJmb3JtKHJlcSkge1xyXG4gICAgICAgIC8vIEJyb2FkY2FzdGluZyBhIHRyYW5zYWN0aW9uIGlzIHJhcmUgKGlzaCkgYW5kIGFscmVhZHkgaW5jdXJzXHJcbiAgICAgICAgLy8gYSBjb3N0IG9uIHRoZSB1c2VyLCBzbyBzcGFtbWluZyBpcyBzYWZlLWlzaC4gSnVzdCBzZW5kIGl0IHRvXHJcbiAgICAgICAgLy8gZXZlcnkgYmFja2VuZC5cclxuICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gXCJicm9hZGNhc3RUcmFuc2FjdGlvblwiKSB7XHJcbiAgICAgICAgICAgIC8vIE9uY2UgYW55IGJyb2FkY2FzdCBwcm92aWRlcyBhIHBvc2l0aXZlIHJlc3VsdCwgdXNlIGl0LiBOb1xyXG4gICAgICAgICAgICAvLyBuZWVkIHRvIHdhaXQgZm9yIGFueW9uZSBlbHNlXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSB0aGlzLiNjb25maWdzLm1hcCgoYykgPT4gbnVsbCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGJyb2FkY2FzdHMgPSB0aGlzLiNjb25maWdzLm1hcChhc3luYyAoeyBwcm92aWRlciwgd2VpZ2h0IH0sIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHByb3ZpZGVyLl9wZXJmb3JtKHJlcSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c1tpbmRleF0gPSBPYmplY3QuYXNzaWduKG5vcm1hbGl6ZVJlc3VsdChyZXEubWV0aG9kLCB7IHJlc3VsdCB9KSwgeyB3ZWlnaHQgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzW2luZGV4XSA9IE9iamVjdC5hc3NpZ24obm9ybWFsaXplUmVzdWx0KHJlcS5tZXRob2QsIHsgZXJyb3IgfSksIHsgd2VpZ2h0IH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gQXMgZWFjaCBwcm9taXNlIGZpbmlzaGVzLi4uXHJcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgYSB2YWxpZCBicm9hZGNhc3QgcmVzdWx0XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkb25lID0gcmVzdWx0cy5maWx0ZXIoKHIpID0+IChyICE9IG51bGwpKTtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgeyB2YWx1ZSB9IG9mIGRvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh2YWx1ZSBpbnN0YW5jZW9mIEVycm9yKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGEgbGVnaXQgYnJvYWRjYXN0IGVycm9yIChvbmUgd2hpY2ggd2UgY2Fubm90XHJcbiAgICAgICAgICAgICAgICAvLyByZWNvdmVyIGZyb207IHNvbWUgbm9kZXMgbWF5IHJldHVybiB0aGUgZm9sbG93aW5nIHJlZFxyXG4gICAgICAgICAgICAgICAgLy8gaGVycmluZyBldmVudHM6XHJcbiAgICAgICAgICAgICAgICAvLyAtIGFscmVkeSBzZWVuZCAoVU5LTk9XTl9FUlJPUilcclxuICAgICAgICAgICAgICAgIC8vIC0gTk9OQ0VfRVhQSVJFRFxyXG4gICAgICAgICAgICAgICAgLy8gLSBSRVBMQUNFTUVOVF9VTkRFUlBSSUNFRFxyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gY2hlY2tRdW9ydW0odGhpcy5xdW9ydW0sIHJlc3VsdHMuZmlsdGVyKChyKSA9PiAociAhPSBudWxsKSkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzRXJyb3IocmVzdWx0LCBcIklOU1VGRklDSUVOVF9GVU5EU1wiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IHJlc3VsdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIEtpY2sgb2ZmIHRoZSBuZXh0IHByb3ZpZGVyIChpZiBhbnkpXHJcbiAgICAgICAgICAgICAgICBjb25zdCB3YWl0aW5nID0gYnJvYWRjYXN0cy5maWx0ZXIoKGIsIGkpID0+IChyZXN1bHRzW2ldID09IG51bGwpKTtcclxuICAgICAgICAgICAgICAgIGlmICh3YWl0aW5nLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5yYWNlKHdhaXRpbmcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFVzZSBzdGFuZGFyZCBxdW9ydW0gcmVzdWx0czsgYW55IHJlc3VsdCB3YXMgcmV0dXJuZWQgYWJvdmUsXHJcbiAgICAgICAgICAgIC8vIHNvIHRoaXMgd2lsbCBmaW5kIGFueSBlcnJvciB0aGF0IG1ldCBxdW9ydW0gaWYgYW55XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGdldEFueVJlc3VsdCh0aGlzLnF1b3J1bSwgcmVzdWx0cyk7XHJcbiAgICAgICAgICAgIGFzc2VydChyZXN1bHQgIT09IHVuZGVmaW5lZCwgXCJwcm9ibGVtIG11bHRpLWJyb2FkY2FzdGluZ1wiLCBcIlNFUlZFUl9FUlJPUlwiLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0OiBcIiVzdWItcmVxdWVzdHNcIixcclxuICAgICAgICAgICAgICAgIGluZm86IHsgcmVxdWVzdDogcmVxLCByZXN1bHRzOiByZXN1bHRzLm1hcChzdHJpbmdpZnkpIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBFcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IHRoaXMuI2luaXRpYWxTeW5jKCk7XHJcbiAgICAgICAgLy8gQm9vdHN0cmFwIGVub3VnaCBydW5uZXJzIHRvIG1lZXQgcXVvcnVtXHJcbiAgICAgICAgY29uc3QgcnVubmluZyA9IG5ldyBTZXQoKTtcclxuICAgICAgICBsZXQgaW5mbGlnaHRRdW9ydW0gPSAwO1xyXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJ1bm5lciA9IHRoaXMuI2FkZFJ1bm5lcihydW5uaW5nLCByZXEpO1xyXG4gICAgICAgICAgICBpZiAocnVubmVyID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluZmxpZ2h0UXVvcnVtICs9IHJ1bm5lci5jb25maWcud2VpZ2h0O1xyXG4gICAgICAgICAgICBpZiAoaW5mbGlnaHRRdW9ydW0gPj0gdGhpcy5xdW9ydW0pIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuI3dhaXRGb3JRdW9ydW0ocnVubmluZywgcmVxKTtcclxuICAgICAgICAvLyBUcmFjayByZXF1ZXN0cyBzZW50IHRvIGEgcHJvdmlkZXIgdGhhdCBhcmUgc3RpbGxcclxuICAgICAgICAvLyBvdXRzdGFuZGluZyBhZnRlciBxdW9ydW0gaGFzIGJlZW4gb3RoZXJ3aXNlIGZvdW5kXHJcbiAgICAgICAgZm9yIChjb25zdCBydW5uZXIgb2YgcnVubmluZykge1xyXG4gICAgICAgICAgICBpZiAocnVubmVyLnBlcmZvcm0gJiYgcnVubmVyLnJlc3VsdCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBydW5uZXIuY29uZmlnLmxhdGVSZXNwb25zZXMrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgYXN5bmMgZGVzdHJveSgpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IHsgcHJvdmlkZXIgfSBvZiB0aGlzLiNjb25maWdzKSB7XHJcbiAgICAgICAgICAgIHByb3ZpZGVyLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3VwZXIuZGVzdHJveSgpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByb3ZpZGVyLWZhbGxiYWNrLmpzLm1hcCIsImltcG9ydCB7IGFzc2VydCB9IGZyb20gXCIuLi91dGlscy9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyBBbmtyUHJvdmlkZXIgfSBmcm9tIFwiLi9wcm92aWRlci1hbmtyLmpzXCI7XHJcbmltcG9ydCB7IEFsY2hlbXlQcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLWFsY2hlbXkuanNcIjtcclxuLy9pbXBvcnQgeyBCbG9ja3Njb3V0UHJvdmlkZXIgfSBmcm9tIFwiLi9wcm92aWRlci1ibG9ja3Njb3V0LmpzXCI7XHJcbmltcG9ydCB7IENoYWluc3RhY2tQcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLWNoYWluc3RhY2suanNcIjtcclxuaW1wb3J0IHsgQ2xvdWRmbGFyZVByb3ZpZGVyIH0gZnJvbSBcIi4vcHJvdmlkZXItY2xvdWRmbGFyZS5qc1wiO1xyXG5pbXBvcnQgeyBFdGhlcnNjYW5Qcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLWV0aGVyc2Nhbi5qc1wiO1xyXG5pbXBvcnQgeyBJbmZ1cmFQcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLWluZnVyYS5qc1wiO1xyXG4vL2ltcG9ydCB7IFBvY2tldFByb3ZpZGVyIH0gZnJvbSBcIi4vcHJvdmlkZXItcG9ja2V0LmpzXCI7XHJcbmltcG9ydCB7IFF1aWNrTm9kZVByb3ZpZGVyIH0gZnJvbSBcIi4vcHJvdmlkZXItcXVpY2tub2RlLmpzXCI7XHJcbmltcG9ydCB7IEZhbGxiYWNrUHJvdmlkZXIgfSBmcm9tIFwiLi9wcm92aWRlci1mYWxsYmFjay5qc1wiO1xyXG5pbXBvcnQgeyBKc29uUnBjUHJvdmlkZXIgfSBmcm9tIFwiLi9wcm92aWRlci1qc29ucnBjLmpzXCI7XHJcbmltcG9ydCB7IE5ldHdvcmsgfSBmcm9tIFwiLi9uZXR3b3JrLmpzXCI7XHJcbmltcG9ydCB7IFdlYlNvY2tldFByb3ZpZGVyIH0gZnJvbSBcIi4vcHJvdmlkZXItd2Vic29ja2V0LmpzXCI7XHJcbmZ1bmN0aW9uIGlzV2ViU29ja2V0TGlrZSh2YWx1ZSkge1xyXG4gICAgcmV0dXJuICh2YWx1ZSAmJiB0eXBlb2YgKHZhbHVlLnNlbmQpID09PSBcImZ1bmN0aW9uXCIgJiZcclxuICAgICAgICB0eXBlb2YgKHZhbHVlLmNsb3NlKSA9PT0gXCJmdW5jdGlvblwiKTtcclxufVxyXG5jb25zdCBUZXN0bmV0cyA9IFwiZ29lcmxpIGtvdmFuIHNlcG9saWEgY2xhc3NpY0tvdHRpIG9wdGltaXNtLWdvZXJsaSBhcmJpdHJ1bS1nb2VybGkgbWF0aWMtbXVtYmFpIGJuYnRcIi5zcGxpdChcIiBcIik7XHJcbi8qKlxyXG4gKiAgUmV0dXJucyBhIGRlZmF1bHQgcHJvdmlkZXIgZm9yICUlbmV0d29yayUlLlxyXG4gKlxyXG4gKiAgSWYgJSVuZXR3b3JrJSUgaXMgYSBbW1dlYlNvY2tldExpa2VdXSBvciBzdHJpbmcgdGhhdCBiZWdpbnMgd2l0aFxyXG4gKiAgYGBcIndzOlwiYGAgb3IgYGBcIndzczpcImBgLCBhIFtbV2ViU29ja2V0UHJvdmlkZXJdXSBpcyByZXR1cm5lZCBiYWNrZWRcclxuICogIGJ5IHRoYXQgV2ViU29ja2V0IG9yIFVSTC5cclxuICpcclxuICogIElmICUlbmV0d29yayUlIGlzIGEgc3RyaW5nIHRoYXQgYmVnaW5zIHdpdGggYGBcIkhUVFA6XCJgYCBvciBgYFwiSFRUUFM6XCJgYCxcclxuICogIGEgW1tKc29uUnBjUHJvdmlkZXJdXSBpcyByZXR1cm5lZCBjb25uZWN0ZWQgdG8gdGhhdCBVUkwuXHJcbiAqXHJcbiAqICBPdGhlcndpc2UsIGEgZGVmYXVsdCBwcm92aWRlciBpcyBjcmVhdGVkIGJhY2tlZCBieSB3ZWxsLWtub3duIHB1YmxpY1xyXG4gKiAgV2ViMyBiYWNrZW5kcyAoc3VjaCBhcyBbW2xpbmstaW5mdXJhXV0pIHVzaW5nIGNvbW11bml0eS1wcm92aWRlZCBBUElcclxuICogIGtleXMuXHJcbiAqXHJcbiAqICBUaGUgJSVvcHRpb25zJSUgYWxsb3dzIHNwZWNpZnlpbmcgY3VzdG9tIEFQSSBrZXlzIHBlciBiYWNrZW5kIChzZXR0aW5nXHJcbiAqICBhbiBBUEkga2V5IHRvIGBgXCItXCJgYCB3aWxsIG9taXQgdGhhdCBwcm92aWRlcikgYW5kIGBgb3B0aW9ucy5leGNsdXNpdmVgYFxyXG4gKiAgY2FuIGJlIHNldCB0byBlaXRoZXIgYSBiYWNrZW5kIG5hbWUgb3IgYW5kIGFycmF5IG9mIGJhY2tlbmQgbmFtZXMsIHdoaWNoXHJcbiAqICB3aWxsIHdoaXRlbGlzdCAqKm9ubHkqKiB0aG9zZSBiYWNrZW5kcy5cclxuICpcclxuICogIEN1cnJlbnQgYmFja2VuZCBzdHJpbmdzIHN1cHBvcnRlZCBhcmU6XHJcbiAqICAtIGBgXCJhbGNoZW15XCJgYFxyXG4gKiAgLSBgYFwiYW5rclwiYGBcclxuICogIC0gYGBcImNsb3VkZmxhcmVcImBgXHJcbiAqICAtIGBgXCJjaGFpbnN0YWNrXCJgYFxyXG4gKiAgLSBgYFwiZXRoZXJzY2FuXCJgYFxyXG4gKiAgLSBgYFwiaW5mdXJhXCJgYFxyXG4gKiAgLSBgYFwicHVibGljUG9seWdvblwiYGBcclxuICogIC0gYGBcInF1aWNrbm9kZVwiYGBcclxuICpcclxuICogIEBleGFtcGxlOlxyXG4gKiAgICAvLyBDb25uZWN0IHRvIGEgbG9jYWwgR2V0aCBub2RlXHJcbiAqICAgIHByb3ZpZGVyID0gZ2V0RGVmYXVsdFByb3ZpZGVyKFwiaHR0cDovL2xvY2FsaG9zdDo4NTQ1L1wiKTtcclxuICpcclxuICogICAgLy8gQ29ubmVjdCB0byBFdGhlcmV1bSBtYWlubmV0IHdpdGggYW55IGN1cnJlbnQgYW5kIGZ1dHVyZVxyXG4gKiAgICAvLyB0aGlyZC1wYXJ0eSBzZXJ2aWNlcyBhdmFpbGFibGVcclxuICogICAgcHJvdmlkZXIgPSBnZXREZWZhdWx0UHJvdmlkZXIoXCJtYWlubmV0XCIpO1xyXG4gKlxyXG4gKiAgICAvLyBDb25uZWN0IHRvIFBvbHlnb24sIGJ1dCBvbmx5IGFsbG93IEV0aGVyc2NhbiBhbmRcclxuICogICAgLy8gSU5GVVJBIGFuZCB1c2UgXCJNWV9BUElfS0VZXCIgaW4gY2FsbHMgdG8gRXRoZXJzY2FuLlxyXG4gKiAgICBwcm92aWRlciA9IGdldERlZmF1bHRQcm92aWRlcihcIm1hdGljXCIsIHtcclxuICogICAgICBldGhlcnNjYW46IFwiTVlfQVBJX0tFWVwiLFxyXG4gKiAgICAgIGV4Y2x1c2l2ZTogWyBcImV0aGVyc2NhblwiLCBcImluZnVyYVwiIF1cclxuICogICAgfSk7XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3ZpZGVyKG5ldHdvcmssIG9wdGlvbnMpIHtcclxuICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcclxuICAgICAgICBvcHRpb25zID0ge307XHJcbiAgICB9XHJcbiAgICBjb25zdCBhbGxvd1NlcnZpY2UgPSAobmFtZSkgPT4ge1xyXG4gICAgICAgIGlmIChvcHRpb25zW25hbWVdID09PSBcIi1cIikge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgKG9wdGlvbnMuZXhjbHVzaXZlKSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gKG5hbWUgPT09IG9wdGlvbnMuZXhjbHVzaXZlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob3B0aW9ucy5leGNsdXNpdmUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAob3B0aW9ucy5leGNsdXNpdmUuaW5kZXhPZihuYW1lKSAhPT0gLTEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH07XHJcbiAgICBpZiAodHlwZW9mIChuZXR3b3JrKSA9PT0gXCJzdHJpbmdcIiAmJiBuZXR3b3JrLm1hdGNoKC9eaHR0cHM/Oi8pKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBKc29uUnBjUHJvdmlkZXIobmV0d29yayk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIChuZXR3b3JrKSA9PT0gXCJzdHJpbmdcIiAmJiBuZXR3b3JrLm1hdGNoKC9ed3NzPzovKSB8fCBpc1dlYlNvY2tldExpa2UobmV0d29yaykpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFdlYlNvY2tldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgfVxyXG4gICAgLy8gR2V0IHRoZSBuZXR3b3JrIGFuZCBuYW1lLCBpZiBwb3NzaWJsZVxyXG4gICAgbGV0IHN0YXRpY05ldHdvcmsgPSBudWxsO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBzdGF0aWNOZXR3b3JrID0gTmV0d29yay5mcm9tKG5ldHdvcmspO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IH1cclxuICAgIGNvbnN0IHByb3ZpZGVycyA9IFtdO1xyXG4gICAgaWYgKGFsbG93U2VydmljZShcInB1YmxpY1BvbHlnb25cIikgJiYgc3RhdGljTmV0d29yaykge1xyXG4gICAgICAgIGlmIChzdGF0aWNOZXR3b3JrLm5hbWUgPT09IFwibWF0aWNcIikge1xyXG4gICAgICAgICAgICBwcm92aWRlcnMucHVzaChuZXcgSnNvblJwY1Byb3ZpZGVyKFwiaHR0cHM6L1xcL3BvbHlnb24tcnBjLmNvbS9cIiwgc3RhdGljTmV0d29yaywgeyBzdGF0aWNOZXR3b3JrIH0pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoc3RhdGljTmV0d29yay5uYW1lID09PSBcIm1hdGljLWFtb3lcIikge1xyXG4gICAgICAgICAgICBwcm92aWRlcnMucHVzaChuZXcgSnNvblJwY1Byb3ZpZGVyKFwiaHR0cHM6L1xcL3JwYy1hbW95LnBvbHlnb24udGVjaG5vbG9neS9cIiwgc3RhdGljTmV0d29yaywgeyBzdGF0aWNOZXR3b3JrIH0pKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoYWxsb3dTZXJ2aWNlKFwiYWxjaGVteVwiKSkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHByb3ZpZGVycy5wdXNoKG5ldyBBbGNoZW15UHJvdmlkZXIobmV0d29yaywgb3B0aW9ucy5hbGNoZW15KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnJvcikgeyB9XHJcbiAgICB9XHJcbiAgICBpZiAoYWxsb3dTZXJ2aWNlKFwiYW5rclwiKSAmJiBvcHRpb25zLmFua3IgIT0gbnVsbCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHByb3ZpZGVycy5wdXNoKG5ldyBBbmtyUHJvdmlkZXIobmV0d29yaywgb3B0aW9ucy5hbmtyKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnJvcikgeyB9XHJcbiAgICB9XHJcbiAgICAvKiBUZW1wb3JhcmlseSByZW1vdmUgdW50aWwgY3VzdG9tIGVycm9yIGlzc3VlIGlzIGZpeGVkXHJcbiAgICAgICAgaWYgKGFsbG93U2VydmljZShcImJsb2Nrc2NvdXRcIikpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHByb3ZpZGVycy5wdXNoKG5ldyBCbG9ja3Njb3V0UHJvdmlkZXIobmV0d29yaywgb3B0aW9ucy5ibG9ja3Njb3V0KSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7IH1cclxuICAgICAgICB9XHJcbiAgICAqL1xyXG4gICAgaWYgKGFsbG93U2VydmljZShcImNoYWluc3RhY2tcIikpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBwcm92aWRlcnMucHVzaChuZXcgQ2hhaW5zdGFja1Byb3ZpZGVyKG5ldHdvcmssIG9wdGlvbnMuY2hhaW5zdGFjaykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZXJyb3IpIHsgfVxyXG4gICAgfVxyXG4gICAgaWYgKGFsbG93U2VydmljZShcImNsb3VkZmxhcmVcIikpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBwcm92aWRlcnMucHVzaChuZXcgQ2xvdWRmbGFyZVByb3ZpZGVyKG5ldHdvcmspKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7IH1cclxuICAgIH1cclxuICAgIGlmIChhbGxvd1NlcnZpY2UoXCJldGhlcnNjYW5cIikpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBwcm92aWRlcnMucHVzaChuZXcgRXRoZXJzY2FuUHJvdmlkZXIobmV0d29yaywgb3B0aW9ucy5ldGhlcnNjYW4pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7IH1cclxuICAgIH1cclxuICAgIGlmIChhbGxvd1NlcnZpY2UoXCJpbmZ1cmFcIikpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgcHJvamVjdElkID0gb3B0aW9ucy5pbmZ1cmE7XHJcbiAgICAgICAgICAgIGxldCBwcm9qZWN0U2VjcmV0ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIChwcm9qZWN0SWQpID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9qZWN0U2VjcmV0ID0gcHJvamVjdElkLnByb2plY3RTZWNyZXQ7XHJcbiAgICAgICAgICAgICAgICBwcm9qZWN0SWQgPSBwcm9qZWN0SWQucHJvamVjdElkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHByb3ZpZGVycy5wdXNoKG5ldyBJbmZ1cmFQcm92aWRlcihuZXR3b3JrLCBwcm9qZWN0SWQsIHByb2plY3RTZWNyZXQpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7IH1cclxuICAgIH1cclxuICAgIC8qXHJcbiAgICAgICAgaWYgKG9wdGlvbnMucG9ja2V0ICE9PSBcIi1cIikge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGFwcElkID0gb3B0aW9ucy5wb2NrZXQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VjcmV0S2V5OiB1bmRlZmluZWQgfCBzdHJpbmcgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgbG9hZEJhbGFuY2VyOiB1bmRlZmluZWQgfCBib29sZWFuID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZihhcHBJZCkgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkQmFsYW5jZXIgPSAhIWFwcElkLmxvYWRCYWxhbmNlcjtcclxuICAgICAgICAgICAgICAgICAgICBzZWNyZXRLZXkgPSBhcHBJZC5zZWNyZXRLZXk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBwSWQgPSBhcHBJZC5hcHBJZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHByb3ZpZGVycy5wdXNoKG5ldyBQb2NrZXRQcm92aWRlcihuZXR3b3JrLCBhcHBJZCwgc2VjcmV0S2V5LCBsb2FkQmFsYW5jZXIpKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHsgY29uc29sZS5sb2coZXJyb3IpOyB9XHJcbiAgICAgICAgfVxyXG4gICAgKi9cclxuICAgIGlmIChhbGxvd1NlcnZpY2UoXCJxdWlja25vZGVcIikpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgdG9rZW4gPSBvcHRpb25zLnF1aWNrbm9kZTtcclxuICAgICAgICAgICAgcHJvdmlkZXJzLnB1c2gobmV3IFF1aWNrTm9kZVByb3ZpZGVyKG5ldHdvcmssIHRva2VuKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnJvcikgeyB9XHJcbiAgICB9XHJcbiAgICBhc3NlcnQocHJvdmlkZXJzLmxlbmd0aCwgXCJ1bnN1cHBvcnRlZCBkZWZhdWx0IG5ldHdvcmtcIiwgXCJVTlNVUFBPUlRFRF9PUEVSQVRJT05cIiwge1xyXG4gICAgICAgIG9wZXJhdGlvbjogXCJnZXREZWZhdWx0UHJvdmlkZXJcIlxyXG4gICAgfSk7XHJcbiAgICAvLyBObyBuZWVkIGZvciBhIEZhbGxiYWNrUHJvdmlkZXJcclxuICAgIGlmIChwcm92aWRlcnMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuIHByb3ZpZGVyc1swXTtcclxuICAgIH1cclxuICAgIC8vIFdlIHVzZSB0aGUgZmxvb3IgYmVjYXVzZSBwdWJsaWMgdGhpcmQtcGFydHkgcHJvdmlkZXJzIGNhbiBiZSB1bnJlbGlhYmxlLFxyXG4gICAgLy8gc28gYSBsb3cgbnVtYmVyIG9mIHByb3ZpZGVycyB3aXRoIGEgbGFyZ2UgcXVvcnVtIHdpbGwgZmFpbCB0b28gb2Z0ZW5cclxuICAgIGxldCBxdW9ydW0gPSBNYXRoLmZsb29yKHByb3ZpZGVycy5sZW5ndGggLyAyKTtcclxuICAgIGlmIChxdW9ydW0gPiAyKSB7XHJcbiAgICAgICAgcXVvcnVtID0gMjtcclxuICAgIH1cclxuICAgIC8vIFRlc3RuZXRzIGRvbid0IG5lZWQgYXMgc3Ryb25nIGEgc2VjdXJpdHkgZ2F1cmFudGVlIGFuZCBzcGVlZCBpc1xyXG4gICAgLy8gbW9yZSB1c2VmdWwgZHVyaW5nIHRlc3RpbmdcclxuICAgIGlmIChzdGF0aWNOZXR3b3JrICYmIFRlc3RuZXRzLmluZGV4T2Yoc3RhdGljTmV0d29yay5uYW1lKSAhPT0gLTEpIHtcclxuICAgICAgICBxdW9ydW0gPSAxO1xyXG4gICAgfVxyXG4gICAgLy8gUHJvdmlkZWQgb3ZlcnJpZGUgcW9ydW0gdGFrZXMgcHJpb3JpdHlcclxuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMucXVvcnVtKSB7XHJcbiAgICAgICAgcXVvcnVtID0gb3B0aW9ucy5xdW9ydW07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IEZhbGxiYWNrUHJvdmlkZXIocHJvdmlkZXJzLCB1bmRlZmluZWQsIHsgcXVvcnVtIH0pO1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRlZmF1bHQtcHJvdmlkZXIuanMubWFwIiwiaW1wb3J0IHsgZGVmaW5lUHJvcGVydGllcyB9IGZyb20gXCIuLi91dGlscy9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyBBYnN0cmFjdFNpZ25lciB9IGZyb20gXCIuL2Fic3RyYWN0LXNpZ25lci5qc1wiO1xyXG4vKipcclxuICogIEEgKipOb25jZU1hbmFnZXIqKiB3cmFwcyBhbm90aGVyIFtbU2lnbmVyXV0gYW5kIGF1dG9tYXRpY2FsbHkgbWFuYWdlc1xyXG4gKiAgdGhlIG5vbmNlLCBlbnN1cmluZyBzZXJpYWxpemVkIGFuZCBzZXF1ZW50aWFsIG5vbmNlcyBhcmUgdXNlZCBkdXJpbmdcclxuICogIHRyYW5zYWN0aW9uLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIE5vbmNlTWFuYWdlciBleHRlbmRzIEFic3RyYWN0U2lnbmVyIHtcclxuICAgIC8qKlxyXG4gICAgICogIFRoZSBTaWduZXIgYmVpbmcgbWFuYWdlZC5cclxuICAgICAqL1xyXG4gICAgc2lnbmVyO1xyXG4gICAgI25vbmNlUHJvbWlzZTtcclxuICAgICNkZWx0YTtcclxuICAgIC8qKlxyXG4gICAgICogIENyZWF0ZXMgYSBuZXcgKipOb25jZU1hbmFnZXIqKiB0byBtYW5hZ2UgJSVzaWduZXIlJS5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Ioc2lnbmVyKSB7XHJcbiAgICAgICAgc3VwZXIoc2lnbmVyLnByb3ZpZGVyKTtcclxuICAgICAgICBkZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHsgc2lnbmVyIH0pO1xyXG4gICAgICAgIHRoaXMuI25vbmNlUHJvbWlzZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy4jZGVsdGEgPSAwO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgZ2V0QWRkcmVzcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zaWduZXIuZ2V0QWRkcmVzcygpO1xyXG4gICAgfVxyXG4gICAgY29ubmVjdChwcm92aWRlcikge1xyXG4gICAgICAgIHJldHVybiBuZXcgTm9uY2VNYW5hZ2VyKHRoaXMuc2lnbmVyLmNvbm5lY3QocHJvdmlkZXIpKTtcclxuICAgIH1cclxuICAgIGFzeW5jIGdldE5vbmNlKGJsb2NrVGFnKSB7XHJcbiAgICAgICAgaWYgKGJsb2NrVGFnID09PSBcInBlbmRpbmdcIikge1xyXG4gICAgICAgICAgICBpZiAodGhpcy4jbm9uY2VQcm9taXNlID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuI25vbmNlUHJvbWlzZSA9IHN1cGVyLmdldE5vbmNlKFwicGVuZGluZ1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBkZWx0YSA9IHRoaXMuI2RlbHRhO1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IHRoaXMuI25vbmNlUHJvbWlzZSkgKyBkZWx0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1cGVyLmdldE5vbmNlKGJsb2NrVGFnKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogIE1hbnVhbGx5IGluY3JlbWVudCB0aGUgbm9uY2UuIFRoaXMgbWF5IGJlIHVzZWZ1bCB3aGVuIG1hbmFnbmdcclxuICAgICAqICBvZmZsaW5lIHRyYW5zYWN0aW9ucy5cclxuICAgICAqL1xyXG4gICAgaW5jcmVtZW50KCkge1xyXG4gICAgICAgIHRoaXMuI2RlbHRhKys7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqICBSZXNldHMgdGhlIG5vbmNlLCBjYXVzaW5nIHRoZSAqKk5vbmNlTWFuYWdlcioqIHRvIHJlbG9hZCB0aGUgY3VycmVudFxyXG4gICAgICogIG5vbmNlIGZyb20gdGhlIGJsb2NrY2hhaW4gb24gdGhlIG5leHQgdHJhbnNhY3Rpb24uXHJcbiAgICAgKi9cclxuICAgIHJlc2V0KCkge1xyXG4gICAgICAgIHRoaXMuI2RlbHRhID0gMDtcclxuICAgICAgICB0aGlzLiNub25jZVByb21pc2UgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgc2VuZFRyYW5zYWN0aW9uKHR4KSB7XHJcbiAgICAgICAgY29uc3Qgbm9uY2VQcm9taXNlID0gdGhpcy5nZXROb25jZShcInBlbmRpbmdcIik7XHJcbiAgICAgICAgdGhpcy5pbmNyZW1lbnQoKTtcclxuICAgICAgICB0eCA9IGF3YWl0IHRoaXMuc2lnbmVyLnBvcHVsYXRlVHJhbnNhY3Rpb24odHgpO1xyXG4gICAgICAgIHR4Lm5vbmNlID0gYXdhaXQgbm9uY2VQcm9taXNlO1xyXG4gICAgICAgIC8vIEBUT0RPOiBNYXliZSBoYW5kbGUgaW50ZXJlc3RpbmcvcmVjb3ZlcmFibGUgZXJyb3JzP1xyXG4gICAgICAgIC8vIExpa2UgZG9uJ3QgaW5jcmVtZW50IGlmIHRoZSB0eCB3YXMgY2VydGFpbmx5IG5vdCBzZW50XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc2lnbmVyLnNlbmRUcmFuc2FjdGlvbih0eCk7XHJcbiAgICB9XHJcbiAgICBzaWduVHJhbnNhY3Rpb24odHgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zaWduZXIuc2lnblRyYW5zYWN0aW9uKHR4KTtcclxuICAgIH1cclxuICAgIHNpZ25NZXNzYWdlKG1lc3NhZ2UpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zaWduZXIuc2lnbk1lc3NhZ2UobWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgICBzaWduVHlwZWREYXRhKGRvbWFpbiwgdHlwZXMsIHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2lnbmVyLnNpZ25UeXBlZERhdGEoZG9tYWluLCB0eXBlcywgdmFsdWUpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNpZ25lci1ub25jZW1hbmFnZXIuanMubWFwIiwiaW1wb3J0IHsgYXNzZXJ0QXJndW1lbnQsIG1ha2VFcnJvciB9IGZyb20gXCIuLi91dGlscy9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyBKc29uUnBjQXBpUG9sbGluZ1Byb3ZpZGVyIH0gZnJvbSBcIi4vcHJvdmlkZXItanNvbnJwYy5qc1wiO1xyXG47XHJcbi8qKlxyXG4gKiAgQSAqKkJyb3dzZXJQcm92aWRlcioqIGlzIGludGVuZGVkIHRvIHdyYXAgYW4gaW5qZWN0ZWQgcHJvdmlkZXIgd2hpY2hcclxuICogIGFkaGVyZXMgdG8gdGhlIFtbbGluay1laXAtMTE5M11dIHN0YW5kYXJkLCB3aGljaCBtb3N0IChpZiBub3QgYWxsKVxyXG4gKiAgY3VycmVudGx5IGRvLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEJyb3dzZXJQcm92aWRlciBleHRlbmRzIEpzb25ScGNBcGlQb2xsaW5nUHJvdmlkZXIge1xyXG4gICAgI3JlcXVlc3Q7XHJcbiAgICAjcHJvdmlkZXJJbmZvO1xyXG4gICAgLyoqXHJcbiAgICAgKiAgQ29ubmVjdCB0byB0aGUgJSVldGhlcmV1bSUlIHByb3ZpZGVyLCBvcHRpb25hbGx5IGZvcmNpbmcgdGhlXHJcbiAgICAgKiAgJSVuZXR3b3JrJSUuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGV0aGVyZXVtLCBuZXR3b3JrLCBfb3B0aW9ucykge1xyXG4gICAgICAgIC8vIENvcHkgdGhlIG9wdGlvbnNcclxuICAgICAgICBjb25zdCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgKChfb3B0aW9ucyAhPSBudWxsKSA/IF9vcHRpb25zIDoge30pLCB7IGJhdGNoTWF4Q291bnQ6IDEgfSk7XHJcbiAgICAgICAgYXNzZXJ0QXJndW1lbnQoZXRoZXJldW0gJiYgZXRoZXJldW0ucmVxdWVzdCwgXCJpbnZhbGlkIEVJUC0xMTkzIHByb3ZpZGVyXCIsIFwiZXRoZXJldW1cIiwgZXRoZXJldW0pO1xyXG4gICAgICAgIHN1cGVyKG5ldHdvcmssIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuI3Byb3ZpZGVySW5mbyA9IG51bGw7XHJcbiAgICAgICAgaWYgKF9vcHRpb25zICYmIF9vcHRpb25zLnByb3ZpZGVySW5mbykge1xyXG4gICAgICAgICAgICB0aGlzLiNwcm92aWRlckluZm8gPSBfb3B0aW9ucy5wcm92aWRlckluZm87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuI3JlcXVlc3QgPSBhc3luYyAobWV0aG9kLCBwYXJhbXMpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcGF5bG9hZCA9IHsgbWV0aG9kLCBwYXJhbXMgfTtcclxuICAgICAgICAgICAgdGhpcy5lbWl0KFwiZGVidWdcIiwgeyBhY3Rpb246IFwic2VuZEVpcDExOTNSZXF1ZXN0XCIsIHBheWxvYWQgfSk7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBldGhlcmV1bS5yZXF1ZXN0KHBheWxvYWQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KFwiZGVidWdcIiwgeyBhY3Rpb246IFwicmVjZWl2ZUVpcDExOTNSZXN1bHRcIiwgcmVzdWx0IH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoZS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIGVycm9yLmNvZGUgPSBlLmNvZGU7XHJcbiAgICAgICAgICAgICAgICBlcnJvci5kYXRhID0gZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgZXJyb3IucGF5bG9hZCA9IHBheWxvYWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoXCJkZWJ1Z1wiLCB7IGFjdGlvbjogXCJyZWNlaXZlRWlwMTE5M0Vycm9yXCIsIGVycm9yIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgZ2V0IHByb3ZpZGVySW5mbygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy4jcHJvdmlkZXJJbmZvO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgc2VuZChtZXRob2QsIHBhcmFtcykge1xyXG4gICAgICAgIGF3YWl0IHRoaXMuX3N0YXJ0KCk7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHN1cGVyLnNlbmQobWV0aG9kLCBwYXJhbXMpO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgX3NlbmQocGF5bG9hZCkge1xyXG4gICAgICAgIGFzc2VydEFyZ3VtZW50KCFBcnJheS5pc0FycmF5KHBheWxvYWQpLCBcIkVJUC0xMTkzIGRvZXMgbm90IHN1cHBvcnQgYmF0Y2ggcmVxdWVzdFwiLCBcInBheWxvYWRcIiwgcGF5bG9hZCk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy4jcmVxdWVzdChwYXlsb2FkLm1ldGhvZCwgcGF5bG9hZC5wYXJhbXMgfHwgW10pO1xyXG4gICAgICAgICAgICByZXR1cm4gW3sgaWQ6IHBheWxvYWQuaWQsIHJlc3VsdCB9XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFt7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHBheWxvYWQuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHsgY29kZTogZS5jb2RlLCBkYXRhOiBlLmRhdGEsIG1lc3NhZ2U6IGUubWVzc2FnZSB9XHJcbiAgICAgICAgICAgICAgICB9XTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXRScGNFcnJvcihwYXlsb2FkLCBlcnJvcikge1xyXG4gICAgICAgIGVycm9yID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShlcnJvcikpO1xyXG4gICAgICAgIC8vIEVJUC0xMTkzIGdpdmVzIHVzIHNvbWUgbWFjaGluZS1yZWFkYWJsZSBlcnJvciBjb2Rlcywgc28gcmV3cml0ZVxyXG4gICAgICAgIC8vIHRoZW0gaW50byBFdGhlcnMgc3RhbmRhcmQgZXJyb3JzLlxyXG4gICAgICAgIHN3aXRjaCAoZXJyb3IuZXJyb3IuY29kZSB8fCAtMSkge1xyXG4gICAgICAgICAgICBjYXNlIDQwMDE6XHJcbiAgICAgICAgICAgICAgICBlcnJvci5lcnJvci5tZXNzYWdlID0gYGV0aGVycy11c2VyLWRlbmllZDogJHtlcnJvci5lcnJvci5tZXNzYWdlfWA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA0MjAwOlxyXG4gICAgICAgICAgICAgICAgZXJyb3IuZXJyb3IubWVzc2FnZSA9IGBldGhlcnMtdW5zdXBwb3J0ZWQ6ICR7ZXJyb3IuZXJyb3IubWVzc2FnZX1gO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdXBlci5nZXRScGNFcnJvcihwYXlsb2FkLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqICBSZXNvbHZlcyB0byBgYHRydWVgYCBpZiB0aGUgcHJvdmlkZXIgbWFuYWdlcyB0aGUgJSVhZGRyZXNzJSUuXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGhhc1NpZ25lcihhZGRyZXNzKSB7XHJcbiAgICAgICAgaWYgKGFkZHJlc3MgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBhZGRyZXNzID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgYWNjb3VudHMgPSBhd2FpdCB0aGlzLnNlbmQoXCJldGhfYWNjb3VudHNcIiwgW10pO1xyXG4gICAgICAgIGlmICh0eXBlb2YgKGFkZHJlc3MpID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYWNjb3VudHMubGVuZ3RoID4gYWRkcmVzcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFkZHJlc3MgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgcmV0dXJuIGFjY291bnRzLmZpbHRlcigoYSkgPT4gKGEudG9Mb3dlckNhc2UoKSA9PT0gYWRkcmVzcykpLmxlbmd0aCAhPT0gMDtcclxuICAgIH1cclxuICAgIGFzeW5jIGdldFNpZ25lcihhZGRyZXNzKSB7XHJcbiAgICAgICAgaWYgKGFkZHJlc3MgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBhZGRyZXNzID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEoYXdhaXQgdGhpcy5oYXNTaWduZXIoYWRkcmVzcykpKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLiNyZXF1ZXN0KFwiZXRoX3JlcXVlc3RBY2NvdW50c1wiLCBbXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXlsb2FkID0gZXJyb3IucGF5bG9hZDtcclxuICAgICAgICAgICAgICAgIHRocm93IHRoaXMuZ2V0UnBjRXJyb3IocGF5bG9hZCwgeyBpZDogcGF5bG9hZC5pZCwgZXJyb3IgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHN1cGVyLmdldFNpZ25lcihhZGRyZXNzKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogIERpc2NvdmVyIGFuZCBjb25uZWN0IHRvIGEgUHJvdmlkZXIgaW4gdGhlIEJyb3dzZXIgdXNpbmcgdGhlXHJcbiAgICAgKiAgW1tsaW5rLWVpcC02OTYzXV0gZGlzY292ZXJ5IG1lY2hhbmlzbS4gSWYgbm8gcHJvdmlkZXJzIGFyZVxyXG4gICAgICogIHByZXNlbnQsIGBgbnVsbGBgIGlzIHJlc29sdmVkLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgZGlzY292ZXIob3B0aW9ucykge1xyXG4gICAgICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0aW9ucy5wcm92aWRlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJyb3dzZXJQcm92aWRlcihvcHRpb25zLnByb3ZpZGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY29udGV4dCA9IG9wdGlvbnMud2luZG93ID8gb3B0aW9ucy53aW5kb3cgOlxyXG4gICAgICAgICAgICAodHlwZW9mICh3aW5kb3cpICE9PSBcInVuZGVmaW5lZFwiKSA/IHdpbmRvdyA6IG51bGw7XHJcbiAgICAgICAgaWYgKGNvbnRleHQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgYW55UHJvdmlkZXIgPSBvcHRpb25zLmFueVByb3ZpZGVyO1xyXG4gICAgICAgIGlmIChhbnlQcm92aWRlciAmJiBjb250ZXh0LmV0aGVyZXVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQnJvd3NlclByb3ZpZGVyKGNvbnRleHQuZXRoZXJldW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIShcImFkZEV2ZW50TGlzdGVuZXJcIiBpbiBjb250ZXh0ICYmIFwiZGlzcGF0Y2hFdmVudFwiIGluIGNvbnRleHRcclxuICAgICAgICAgICAgJiYgXCJyZW1vdmVFdmVudExpc3RlbmVyXCIgaW4gY29udGV4dCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRpbWVvdXQgPSBvcHRpb25zLnRpbWVvdXQgPyBvcHRpb25zLnRpbWVvdXQgOiAzMDA7XHJcbiAgICAgICAgaWYgKHRpbWVvdXQgPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhd2FpdCAobmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZm91bmQgPSBbXTtcclxuICAgICAgICAgICAgY29uc3QgYWRkUHJvdmlkZXIgPSAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGZvdW5kLnB1c2goZXZlbnQuZGV0YWlsKTtcclxuICAgICAgICAgICAgICAgIGlmIChhbnlQcm92aWRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbmFsaXplKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbmFsaXplID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuICAgICAgICAgICAgICAgIGlmIChmb3VuZC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiBmaWx0ZXJpbmcgaXMgcHJvdmlkZWQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5maWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2FsbCBmaWx0ZXIsIHdpdGggYSBjb3BpZXMgb2YgZm91bmQgcHJvdmlkZXIgaW5mb3NcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsdGVyZWQgPSBvcHRpb25zLmZpbHRlcihmb3VuZC5tYXAoaSA9PiBPYmplY3QuYXNzaWduKHt9LCAoaS5pbmZvKSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlcmVkID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vIHByb3ZpZGVyIHNlbGVjdGVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZpbHRlcmVkIGluc3RhbmNlb2YgQnJvd3NlclByb3ZpZGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDdXN0b20gcHJvdmlkZXIgY3JlYXRlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmaWx0ZXJlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSBtYXRjaGluZyBwcm92aWRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNoID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJlZC51dWlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGZvdW5kLmZpbHRlcihmID0+IChmaWx0ZXJlZC51dWlkID09PSBmLmluZm8udXVpZCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEBUT0RPOiBXaGF0IHNob3VsZCBoYXBwZW4gaWYgbXVsdGlwbGUgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGZvciB0aGUgc2FtZSBVVUlEP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoID0gbWF0Y2hlc1swXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgcHJvdmlkZXIsIGluZm8gfSA9IG1hdGNoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IEJyb3dzZXJQcm92aWRlcihwcm92aWRlciwgdW5kZWZpbmVkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVySW5mbzogaW5mb1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChtYWtlRXJyb3IoXCJmaWx0ZXIgcmV0dXJuZWQgdW5rbm93biBpbmZvXCIsIFwiVU5TVVBQT1JURURfT1BFUkFUSU9OXCIsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZpbHRlcmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBQaWNrIHRoZSBmaXJzdCBmb3VuZCBwcm92aWRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7IHByb3ZpZGVyLCBpbmZvIH0gPSBmb3VuZFswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShuZXcgQnJvd3NlclByb3ZpZGVyKHByb3ZpZGVyLCB1bmRlZmluZWQsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVySW5mbzogaW5mb1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90aGluZyBmb3VuZFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlaXA2OTYzOmFubm91bmNlUHJvdmlkZXJcIiwgYWRkUHJvdmlkZXIpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4geyBmaW5hbGl6ZSgpOyB9LCB0aW1lb3V0KTtcclxuICAgICAgICAgICAgY29udGV4dC5hZGRFdmVudExpc3RlbmVyKFwiZWlwNjk2Mzphbm5vdW5jZVByb3ZpZGVyXCIsIGFkZFByb3ZpZGVyKTtcclxuICAgICAgICAgICAgY29udGV4dC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImVpcDY5NjM6cmVxdWVzdFByb3ZpZGVyXCIpKTtcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJvdmlkZXItYnJvd3Nlci5qcy5tYXAiLCIvKipcclxuICogIFtbbGluay1ibG9ja3Njb3V0XV0gcHJvdmlkZXMgYSB0aGlyZC1wYXJ0eSBzZXJ2aWNlIGZvciBjb25uZWN0aW5nIHRvXHJcbiAqICB2YXJpb3VzIGJsb2NrY2hhaW5zIG92ZXIgSlNPTi1SUEMuXHJcbiAqXHJcbiAqICAqKlN1cHBvcnRlZCBOZXR3b3JrcyoqXHJcbiAqXHJcbiAqICAtIEV0aGVyZXVtIE1haW5uZXQgKGBgbWFpbm5ldGBgKVxyXG4gKiAgLSBTZXBvbGlhIFRlc3RuZXQgKGBgc2Vwb2xpYWBgKVxyXG4gKiAgLSBIb2xlc2t5IFRlc3RuZXQgKGBgaG9sZXNreWBgKVxyXG4gKiAgLSBFdGhlcmV1bSBDbGFzc2ljIChgYGNsYXNzaWNgYClcclxuICogIC0gQXJiaXRydW0gKGBgYXJiaXRydW1gYClcclxuICogIC0gQmFzZSAoYGBiYXNlYGApXHJcbiAqICAtIEJhc2UgU2Vwb2xpYSBUZXN0bmV0IChgYGJhc2Utc2Vwb2xpYWBgKVxyXG4gKiAgLSBHbm9zaXMgKGBgeGRhaWBgKVxyXG4gKiAgLSBPcHRpbWlzbSAoYGBvcHRpbWlzbWBgKVxyXG4gKiAgLSBPcHRpbWlzbSBTZXBvbGlhIFRlc3RuZXQgKGBgb3B0aW1pc20tc2Vwb2xpYWBgKVxyXG4gKiAgLSBQb2x5Z29uIChgYG1hdGljYGApXHJcbiAqXHJcbiAqICBAX3N1YnNlY3Rpb246IGFwaS9wcm92aWRlcnMvdGhpcmRwYXJ0eTpCbG9ja3Njb3V0ICBbcHJvdmlkZXJzLWJsb2Nrc2NvdXRdXHJcbiAqL1xyXG5pbXBvcnQgeyBhc3NlcnRBcmd1bWVudCwgZGVmaW5lUHJvcGVydGllcywgRmV0Y2hSZXF1ZXN0LCBpc0hleFN0cmluZyB9IGZyb20gXCIuLi91dGlscy9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyBOZXR3b3JrIH0gZnJvbSBcIi4vbmV0d29yay5qc1wiO1xyXG5pbXBvcnQgeyBKc29uUnBjUHJvdmlkZXIgfSBmcm9tIFwiLi9wcm92aWRlci1qc29ucnBjLmpzXCI7XHJcbmZ1bmN0aW9uIGdldFVybChuYW1lKSB7XHJcbiAgICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgICAgICBjYXNlIFwibWFpbm5ldFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJodHRwczovXFwvZXRoLmJsb2Nrc2NvdXQuY29tL2FwaS9ldGgtcnBjXCI7XHJcbiAgICAgICAgY2FzZSBcInNlcG9saWFcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2V0aC1zZXBvbGlhLmJsb2Nrc2NvdXQuY29tL2FwaS9ldGgtcnBjXCI7XHJcbiAgICAgICAgY2FzZSBcImhvbGVza3lcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2V0aC1ob2xlc2t5LmJsb2Nrc2NvdXQuY29tL2FwaS9ldGgtcnBjXCI7XHJcbiAgICAgICAgY2FzZSBcImNsYXNzaWNcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2V0Yy5ibG9ja3Njb3V0LmNvbS9hcGkvZXRoLXJwY1wiO1xyXG4gICAgICAgIGNhc2UgXCJhcmJpdHJ1bVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJodHRwczovXFwvYXJiaXRydW0uYmxvY2tzY291dC5jb20vYXBpL2V0aC1ycGNcIjtcclxuICAgICAgICBjYXNlIFwiYmFzZVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJodHRwczovXFwvYmFzZS5ibG9ja3Njb3V0LmNvbS9hcGkvZXRoLXJwY1wiO1xyXG4gICAgICAgIGNhc2UgXCJiYXNlLXNlcG9saWFcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2Jhc2Utc2Vwb2xpYS5ibG9ja3Njb3V0LmNvbS9hcGkvZXRoLXJwY1wiO1xyXG4gICAgICAgIGNhc2UgXCJtYXRpY1wiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJodHRwczovXFwvcG9seWdvbi5ibG9ja3Njb3V0LmNvbS9hcGkvZXRoLXJwY1wiO1xyXG4gICAgICAgIGNhc2UgXCJvcHRpbWlzbVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJodHRwczovXFwvb3B0aW1pc20uYmxvY2tzY291dC5jb20vYXBpL2V0aC1ycGNcIjtcclxuICAgICAgICBjYXNlIFwib3B0aW1pc20tc2Vwb2xpYVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJodHRwczovXFwvb3B0aW1pc20tc2Vwb2xpYS5ibG9ja3Njb3V0LmNvbS9hcGkvZXRoLXJwY1wiO1xyXG4gICAgICAgIGNhc2UgXCJ4ZGFpXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi9cXC9nbm9zaXMuYmxvY2tzY291dC5jb20vYXBpL2V0aC1ycGNcIjtcclxuICAgIH1cclxuICAgIGFzc2VydEFyZ3VtZW50KGZhbHNlLCBcInVuc3VwcG9ydGVkIG5ldHdvcmtcIiwgXCJuZXR3b3JrXCIsIG5hbWUpO1xyXG59XHJcbi8qKlxyXG4gKiAgVGhlICoqQmxvY2tzY291dFByb3ZpZGVyKiogY29ubmVjdHMgdG8gdGhlIFtbbGluay1ibG9ja3Njb3V0XV1cclxuICogIEpTT04tUlBDIGVuZC1wb2ludHMuXHJcbiAqXHJcbiAqICBCeSBkZWZhdWx0LCBhIGhpZ2hseS10aHJvdHRsZWQgQVBJIGtleSBpcyB1c2VkLCB3aGljaCBpc1xyXG4gKiAgYXBwcm9wcmlhdGUgZm9yIHF1aWNrIHByb3RvdHlwZXMgYW5kIHNpbXBsZSBzY3JpcHRzLiBUb1xyXG4gKiAgZ2FpbiBhY2Nlc3MgdG8gYW4gaW5jcmVhc2VkIHJhdGUtbGltaXQsIGl0IGlzIGhpZ2hseVxyXG4gKiAgcmVjb21tZW5kZWQgdG8gW3NpZ24gdXAgaGVyZV0obGluay1ibG9ja3Njb3V0KS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBCbG9ja3Njb3V0UHJvdmlkZXIgZXh0ZW5kcyBKc29uUnBjUHJvdmlkZXIge1xyXG4gICAgLyoqXHJcbiAgICAgKiAgVGhlIEFQSSBrZXkuXHJcbiAgICAgKi9cclxuICAgIGFwaUtleTtcclxuICAgIC8qKlxyXG4gICAgICogIENyZWF0ZXMgYSBuZXcgKipCbG9ja3Njb3V0UHJvdmlkZXIqKi5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoX25ldHdvcmssIGFwaUtleSkge1xyXG4gICAgICAgIGlmIChfbmV0d29yayA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIF9uZXR3b3JrID0gXCJtYWlubmV0XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5ldHdvcmsgPSBOZXR3b3JrLmZyb20oX25ldHdvcmspO1xyXG4gICAgICAgIGlmIChhcGlLZXkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBhcGlLZXkgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gQmxvY2tzY291dFByb3ZpZGVyLmdldFJlcXVlc3QobmV0d29yayk7XHJcbiAgICAgICAgc3VwZXIocmVxdWVzdCwgbmV0d29yaywgeyBzdGF0aWNOZXR3b3JrOiBuZXR3b3JrIH0pO1xyXG4gICAgICAgIGRlZmluZVByb3BlcnRpZXModGhpcywgeyBhcGlLZXkgfSk7XHJcbiAgICB9XHJcbiAgICBfZ2V0UHJvdmlkZXIoY2hhaW5JZCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmxvY2tzY291dFByb3ZpZGVyKGNoYWluSWQsIHRoaXMuYXBpS2V5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7IH1cclxuICAgICAgICByZXR1cm4gc3VwZXIuX2dldFByb3ZpZGVyKGNoYWluSWQpO1xyXG4gICAgfVxyXG4gICAgaXNDb21tdW5pdHlSZXNvdXJjZSgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuYXBpS2V5ID09PSBudWxsKTtcclxuICAgIH1cclxuICAgIGdldFJwY1JlcXVlc3QocmVxKSB7XHJcbiAgICAgICAgLy8gQmxvY2tzY291dCBlbmZvcmNlcyB0aGUgVEFHIGFyZ3VtZW50IGZvciBlc3RpbWF0ZUdhc1xyXG4gICAgICAgIGNvbnN0IHJlc3AgPSBzdXBlci5nZXRScGNSZXF1ZXN0KHJlcSk7XHJcbiAgICAgICAgaWYgKHJlc3AgJiYgcmVzcC5tZXRob2QgPT09IFwiZXRoX2VzdGltYXRlR2FzXCIgJiYgcmVzcC5hcmdzLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgIHJlc3AuYXJncyA9IHJlc3AuYXJncy5zbGljZSgpO1xyXG4gICAgICAgICAgICByZXNwLmFyZ3MucHVzaChcImxhdGVzdFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3A7XHJcbiAgICB9XHJcbiAgICBnZXRScGNFcnJvcihwYXlsb2FkLCBfZXJyb3IpIHtcclxuICAgICAgICBjb25zdCBlcnJvciA9IF9lcnJvciA/IF9lcnJvci5lcnJvciA6IG51bGw7XHJcbiAgICAgICAgLy8gQmxvY2tzY291dCBjdXJyZW50bHkgZHJvcHMgdGhlIFZNIHJlc3VsdCBhbmQgcmVwbGFjZXMgaXQgd2l0aCBhXHJcbiAgICAgICAgLy8gaHVtYW4tcmVhZGFibGUgc3RyaW5nLCBzbyB3ZSBuZWVkIHRvIG1ha2UgaXQgbWFjaGluZS1yZWFkYWJsZS5cclxuICAgICAgICBpZiAoZXJyb3IgJiYgZXJyb3IuY29kZSA9PT0gLTMyMDE1ICYmICFpc0hleFN0cmluZyhlcnJvci5kYXRhIHx8IFwiXCIsIHRydWUpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhbmljQ29kZXMgPSB7XHJcbiAgICAgICAgICAgICAgICBcImFzc2VydChmYWxzZSlcIjogXCIwMVwiLFxyXG4gICAgICAgICAgICAgICAgXCJhcml0aG1ldGljIHVuZGVyZmxvdyBvciBvdmVyZmxvd1wiOiBcIjExXCIsXHJcbiAgICAgICAgICAgICAgICBcImRpdmlzaW9uIG9yIG1vZHVsbyBieSB6ZXJvXCI6IFwiMTJcIixcclxuICAgICAgICAgICAgICAgIFwib3V0LW9mLWJvdW5kcyBhcnJheSBhY2Nlc3M7IHBvcHBpbmcgb24gYW4gZW1wdHkgYXJyYXlcIjogXCIzMVwiLFxyXG4gICAgICAgICAgICAgICAgXCJvdXQtb2YtYm91bmRzIGFjY2VzcyBvZiBhbiBhcnJheSBvciBieXRlc05cIjogXCIzMlwiXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGxldCBwYW5pY0NvZGUgPSBcIlwiO1xyXG4gICAgICAgICAgICBpZiAoZXJyb3IubWVzc2FnZSA9PT0gXCJWTSBleGVjdXRpb24gZXJyb3IuXCIpIHtcclxuICAgICAgICAgICAgICAgIC8vIGV0aF9jYWxsIHBhc3NlcyB0aGlzIG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgIHBhbmljQ29kZSA9IHBhbmljQ29kZXNbZXJyb3IuZGF0YV0gfHwgXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChwYW5pY0NvZGVzW2Vycm9yLm1lc3NhZ2UgfHwgXCJcIl0pIHtcclxuICAgICAgICAgICAgICAgIHBhbmljQ29kZSA9IHBhbmljQ29kZXNbZXJyb3IubWVzc2FnZSB8fCBcIlwiXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFuaWNDb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBlcnJvci5tZXNzYWdlICs9IGAgKHJldmVydGVkOiAke2Vycm9yLmRhdGF9KWA7XHJcbiAgICAgICAgICAgICAgICBlcnJvci5kYXRhID0gXCIweDRlNDg3YjcxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDBcIiArIHBhbmljQ29kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChlcnJvciAmJiBlcnJvci5jb2RlID09PSAtMzIwMDApIHtcclxuICAgICAgICAgICAgaWYgKGVycm9yLm1lc3NhZ2UgPT09IFwid3JvbmcgdHJhbnNhY3Rpb24gbm9uY2VcIikge1xyXG4gICAgICAgICAgICAgICAgZXJyb3IubWVzc2FnZSArPSBcIiAobm9uY2UgdG9vIGxvdylcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VwZXIuZ2V0UnBjRXJyb3IocGF5bG9hZCwgX2Vycm9yKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogIFJldHVybnMgYSBwcmVwYXJlZCByZXF1ZXN0IGZvciBjb25uZWN0aW5nIHRvICUlbmV0d29yayUlXHJcbiAgICAgKiAgd2l0aCAlJWFwaUtleSUlLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0UmVxdWVzdChuZXR3b3JrKSB7XHJcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IG5ldyBGZXRjaFJlcXVlc3QoZ2V0VXJsKG5ldHdvcmsubmFtZSkpO1xyXG4gICAgICAgIHJlcXVlc3QuYWxsb3dHemlwID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gcmVxdWVzdDtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcm92aWRlci1ibG9ja3Njb3V0LmpzLm1hcCIsIi8qKlxyXG4gKiAgW1tsaW5rLXBvY2tldF1dIHByb3ZpZGVzIGEgdGhpcmQtcGFydHkgc2VydmljZSBmb3IgY29ubmVjdGluZyB0b1xyXG4gKiAgdmFyaW91cyBibG9ja2NoYWlucyBvdmVyIEpTT04tUlBDLlxyXG4gKlxyXG4gKiAgKipTdXBwb3J0ZWQgTmV0d29ya3MqKlxyXG4gKlxyXG4gKiAgLSBFdGhlcmV1bSBNYWlubmV0IChgYG1haW5uZXRgYClcclxuICogIC0gR29lcmxpIFRlc3RuZXQgKGBgZ29lcmxpYGApXHJcbiAqICAtIFBvbHlnb24gKGBgbWF0aWNgYClcclxuICogIC0gQXJiaXRydW0gKGBgYXJiaXRydW1gYClcclxuICpcclxuICogIEBfc3Vic2VjdGlvbjogYXBpL3Byb3ZpZGVycy90aGlyZHBhcnR5OlBvY2tldCAgW3Byb3ZpZGVycy1wb2NrZXRdXHJcbiAqL1xyXG5pbXBvcnQgeyBkZWZpbmVQcm9wZXJ0aWVzLCBGZXRjaFJlcXVlc3QsIGFzc2VydEFyZ3VtZW50IH0gZnJvbSBcIi4uL3V0aWxzL2luZGV4LmpzXCI7XHJcbmltcG9ydCB7IHNob3dUaHJvdHRsZU1lc3NhZ2UgfSBmcm9tIFwiLi9jb21tdW5pdHkuanNcIjtcclxuaW1wb3J0IHsgTmV0d29yayB9IGZyb20gXCIuL25ldHdvcmsuanNcIjtcclxuaW1wb3J0IHsgSnNvblJwY1Byb3ZpZGVyIH0gZnJvbSBcIi4vcHJvdmlkZXItanNvbnJwYy5qc1wiO1xyXG5jb25zdCBkZWZhdWx0QXBwbGljYXRpb25JZCA9IFwiNjJlMWFkNTFiMzdiOGUwMDM5NGJkYTNiXCI7XHJcbmZ1bmN0aW9uIGdldEhvc3QobmFtZSkge1xyXG4gICAgc3dpdGNoIChuYW1lKSB7XHJcbiAgICAgICAgY2FzZSBcIm1haW5uZXRcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiZXRoLW1haW5uZXQuZ2F0ZXdheS5wb2t0Lm5ldHdvcmtcIjtcclxuICAgICAgICBjYXNlIFwiZ29lcmxpXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImV0aC1nb2VybGkuZ2F0ZXdheS5wb2t0Lm5ldHdvcmtcIjtcclxuICAgICAgICBjYXNlIFwibWF0aWNcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwicG9seS1tYWlubmV0LmdhdGV3YXkucG9rdC5uZXR3b3JrXCI7XHJcbiAgICAgICAgY2FzZSBcIm1hdGljLW11bWJhaVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJwb2x5Z29uLW11bWJhaS1ycGMuZ2F0ZXdheS5wb2t0Lm5ldHdvcmtcIjtcclxuICAgIH1cclxuICAgIGFzc2VydEFyZ3VtZW50KGZhbHNlLCBcInVuc3VwcG9ydGVkIG5ldHdvcmtcIiwgXCJuZXR3b3JrXCIsIG5hbWUpO1xyXG59XHJcbi8qKlxyXG4gKiAgVGhlICoqUG9ja2V0UHJvdmlkZXIqKiBjb25uZWN0cyB0byB0aGUgW1tsaW5rLXBvY2tldF1dXHJcbiAqICBKU09OLVJQQyBlbmQtcG9pbnRzLlxyXG4gKlxyXG4gKiAgQnkgZGVmYXVsdCwgYSBoaWdobHktdGhyb3R0bGVkIEFQSSBrZXkgaXMgdXNlZCwgd2hpY2ggaXNcclxuICogIGFwcHJvcHJpYXRlIGZvciBxdWljayBwcm90b3R5cGVzIGFuZCBzaW1wbGUgc2NyaXB0cy4gVG9cclxuICogIGdhaW4gYWNjZXNzIHRvIGFuIGluY3JlYXNlZCByYXRlLWxpbWl0LCBpdCBpcyBoaWdobHlcclxuICogIHJlY29tbWVuZGVkIHRvIFtzaWduIHVwIGhlcmVdKGxpbmstcG9ja2V0LXNpZ251cCkuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUG9ja2V0UHJvdmlkZXIgZXh0ZW5kcyBKc29uUnBjUHJvdmlkZXIge1xyXG4gICAgLyoqXHJcbiAgICAgKiAgVGhlIEFwcGxpY2F0aW9uIElEIGZvciB0aGUgUG9ja2V0IGNvbm5lY3Rpb24uXHJcbiAgICAgKi9cclxuICAgIGFwcGxpY2F0aW9uSWQ7XHJcbiAgICAvKipcclxuICAgICAqICBUaGUgQXBwbGljYXRpb24gU2VjcmV0IGZvciBtYWtpbmcgYXV0aGVudGljYXRlZCByZXF1ZXN0c1xyXG4gICAgICogIHRvIHRoZSBQb2NrZXQgY29ubmVjdGlvbi5cclxuICAgICAqL1xyXG4gICAgYXBwbGljYXRpb25TZWNyZXQ7XHJcbiAgICAvKipcclxuICAgICAqICBDcmVhdGUgYSBuZXcgKipQb2NrZXRQcm92aWRlcioqLlxyXG4gICAgICpcclxuICAgICAqICBCeSBkZWZhdWx0IGNvbm5lY3RpbmcgdG8gYGBtYWlubmV0YGAgd2l0aCBhIGhpZ2hseSB0aHJvdHRsZWRcclxuICAgICAqICBBUEkga2V5LlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihfbmV0d29yaywgYXBwbGljYXRpb25JZCwgYXBwbGljYXRpb25TZWNyZXQpIHtcclxuICAgICAgICBpZiAoX25ldHdvcmsgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBfbmV0d29yayA9IFwibWFpbm5ldFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBuZXR3b3JrID0gTmV0d29yay5mcm9tKF9uZXR3b3JrKTtcclxuICAgICAgICBpZiAoYXBwbGljYXRpb25JZCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGFwcGxpY2F0aW9uSWQgPSBkZWZhdWx0QXBwbGljYXRpb25JZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGFwcGxpY2F0aW9uU2VjcmV0ID09IG51bGwpIHtcclxuICAgICAgICAgICAgYXBwbGljYXRpb25TZWNyZXQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBvcHRpb25zID0geyBzdGF0aWNOZXR3b3JrOiBuZXR3b3JrIH07XHJcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IFBvY2tldFByb3ZpZGVyLmdldFJlcXVlc3QobmV0d29yaywgYXBwbGljYXRpb25JZCwgYXBwbGljYXRpb25TZWNyZXQpO1xyXG4gICAgICAgIHN1cGVyKHJlcXVlc3QsIG5ldHdvcmssIG9wdGlvbnMpO1xyXG4gICAgICAgIGRlZmluZVByb3BlcnRpZXModGhpcywgeyBhcHBsaWNhdGlvbklkLCBhcHBsaWNhdGlvblNlY3JldCB9KTtcclxuICAgIH1cclxuICAgIF9nZXRQcm92aWRlcihjaGFpbklkKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQb2NrZXRQcm92aWRlcihjaGFpbklkLCB0aGlzLmFwcGxpY2F0aW9uSWQsIHRoaXMuYXBwbGljYXRpb25TZWNyZXQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZXJyb3IpIHsgfVxyXG4gICAgICAgIHJldHVybiBzdXBlci5fZ2V0UHJvdmlkZXIoY2hhaW5JZCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqICBSZXR1cm5zIGEgcHJlcGFyZWQgcmVxdWVzdCBmb3IgY29ubmVjdGluZyB0byAlJW5ldHdvcmslJSB3aXRoXHJcbiAgICAgKiAgJSVhcHBsaWNhdGlvbklkJSUuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXRSZXF1ZXN0KG5ldHdvcmssIGFwcGxpY2F0aW9uSWQsIGFwcGxpY2F0aW9uU2VjcmV0KSB7XHJcbiAgICAgICAgaWYgKGFwcGxpY2F0aW9uSWQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBhcHBsaWNhdGlvbklkID0gZGVmYXVsdEFwcGxpY2F0aW9uSWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBuZXcgRmV0Y2hSZXF1ZXN0KGBodHRwczovXFwvJHtnZXRIb3N0KG5ldHdvcmsubmFtZSl9L3YxL2xiLyR7YXBwbGljYXRpb25JZH1gKTtcclxuICAgICAgICByZXF1ZXN0LmFsbG93R3ppcCA9IHRydWU7XHJcbiAgICAgICAgaWYgKGFwcGxpY2F0aW9uU2VjcmV0KSB7XHJcbiAgICAgICAgICAgIHJlcXVlc3Quc2V0Q3JlZGVudGlhbHMoXCJcIiwgYXBwbGljYXRpb25TZWNyZXQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYXBwbGljYXRpb25JZCA9PT0gZGVmYXVsdEFwcGxpY2F0aW9uSWQpIHtcclxuICAgICAgICAgICAgcmVxdWVzdC5yZXRyeUZ1bmMgPSBhc3luYyAocmVxdWVzdCwgcmVzcG9uc2UsIGF0dGVtcHQpID0+IHtcclxuICAgICAgICAgICAgICAgIHNob3dUaHJvdHRsZU1lc3NhZ2UoXCJQb2NrZXRQcm92aWRlclwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVxdWVzdDtcclxuICAgIH1cclxuICAgIGlzQ29tbXVuaXR5UmVzb3VyY2UoKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmFwcGxpY2F0aW9uSWQgPT09IGRlZmF1bHRBcHBsaWNhdGlvbklkKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcm92aWRlci1wb2NrZXQuanMubWFwIiwiY29uc3QgSXBjU29ja2V0UHJvdmlkZXIgPSB1bmRlZmluZWQ7XHJcbmV4cG9ydCB7IElwY1NvY2tldFByb3ZpZGVyIH07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByb3ZpZGVyLWlwY3NvY2tldC1icm93c2VyLmpzLm1hcCIsImNvbnN0IEJhc2U2NCA9IFwiKSFAIyQlXiYqKEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXotX1wiO1xyXG4vKipcclxuICogIEBfaWdub3JlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlQml0cyh3aWR0aCwgZGF0YSkge1xyXG4gICAgY29uc3QgbWF4VmFsdWUgPSAoMSA8PCB3aWR0aCkgLSAxO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gW107XHJcbiAgICBsZXQgYWNjdW0gPSAwLCBiaXRzID0gMCwgZmxvb2QgPSAwO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgLy8gQWNjdW11bGF0ZSA2IGJpdHMgb2YgZGF0YVxyXG4gICAgICAgIGFjY3VtID0gKChhY2N1bSA8PCA2KSB8IEJhc2U2NC5pbmRleE9mKGRhdGFbaV0pKTtcclxuICAgICAgICBiaXRzICs9IDY7XHJcbiAgICAgICAgLy8gV2hpbGUgd2UgaGF2ZSBlbm91Z2ggZm9yIGEgd29yZC4uLlxyXG4gICAgICAgIHdoaWxlIChiaXRzID49IHdpZHRoKSB7XHJcbiAgICAgICAgICAgIC8vIC4uLnJlYWQgdGhlIHdvcmRcclxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSAoYWNjdW0gPj4gKGJpdHMgLSB3aWR0aCkpO1xyXG4gICAgICAgICAgICBhY2N1bSAmPSAoMSA8PCAoYml0cyAtIHdpZHRoKSkgLSAxO1xyXG4gICAgICAgICAgICBiaXRzIC09IHdpZHRoO1xyXG4gICAgICAgICAgICAvLyBBIHZhbHVlIG9mIDAgaW5kaWNhdGVzIHdlIGV4Y2VlZGVkIG1heFZhbHVlLCBpdFxyXG4gICAgICAgICAgICAvLyBmbG9vZHMgb3ZlciBpbnRvIHRoZSBuZXh0IHZhbHVlXHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgZmxvb2QgKz0gbWF4VmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSArIGZsb29kKTtcclxuICAgICAgICAgICAgICAgIGZsb29kID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Yml0LXJlYWRlci5qcy5tYXAiLCJpbXBvcnQgeyBhc3NlcnRBcmd1bWVudCB9IGZyb20gXCIuLi91dGlscy9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyBkZWNvZGVCaXRzIH0gZnJvbSBcIi4vYml0LXJlYWRlci5qc1wiO1xyXG5pbXBvcnQgeyBkZWNvZGVPd2wgfSBmcm9tIFwiLi9kZWNvZGUtb3dsLmpzXCI7XHJcbi8qKlxyXG4gKiAgQF9pZ25vcmVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVPd2xBKGRhdGEsIGFjY2VudHMpIHtcclxuICAgIGxldCB3b3JkcyA9IGRlY29kZU93bChkYXRhKS5qb2luKFwiLFwiKTtcclxuICAgIC8vIEluamVjdCB0aGUgYWNjZW50c1xyXG4gICAgYWNjZW50cy5zcGxpdCgvLC9nKS5mb3JFYWNoKChhY2NlbnQpID0+IHtcclxuICAgICAgICBjb25zdCBtYXRjaCA9IGFjY2VudC5tYXRjaCgvXihbYS16XSopKFswLTldKykoWzAtOV0pKC4qKSQvKTtcclxuICAgICAgICBhc3NlcnRBcmd1bWVudChtYXRjaCAhPT0gbnVsbCwgXCJpbnRlcm5hbCBlcnJvciBwYXJzaW5nIGFjY2VudHNcIiwgXCJhY2NlbnRzXCIsIGFjY2VudHMpO1xyXG4gICAgICAgIGxldCBwb3NPZmZzZXQgPSAwO1xyXG4gICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IGRlY29kZUJpdHMocGFyc2VJbnQobWF0Y2hbM10pLCBtYXRjaFs0XSk7XHJcbiAgICAgICAgY29uc3QgY2hhckNvZGUgPSBwYXJzZUludChtYXRjaFsyXSk7XHJcbiAgICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKGAoWyR7bWF0Y2hbMV19XSlgLCBcImdcIik7XHJcbiAgICAgICAgd29yZHMgPSB3b3Jkcy5yZXBsYWNlKHJlZ2V4LCAoYWxsLCBsZXR0ZXIpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcmVtID0gLS1wb3NpdGlvbnNbcG9zT2Zmc2V0XTtcclxuICAgICAgICAgICAgaWYgKHJlbSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0dGVyID0gU3RyaW5nLmZyb21DaGFyQ29kZShsZXR0ZXIuY2hhckNvZGVBdCgwKSwgY2hhckNvZGUpO1xyXG4gICAgICAgICAgICAgICAgcG9zT2Zmc2V0Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGxldHRlcjtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHdvcmRzLnNwbGl0KFwiLFwiKTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kZWNvZGUtb3dsYS5qcy5tYXAiLCJpbXBvcnQgeyBXb3JkbGlzdE93bCB9IGZyb20gXCIuL3dvcmRsaXN0LW93bC5qc1wiO1xyXG5pbXBvcnQgeyBkZWNvZGVPd2xBIH0gZnJvbSBcIi4vZGVjb2RlLW93bGEuanNcIjtcclxuLyoqXHJcbiAqICBBbiBPV0wtQSBmb3JtYXQgV29yZGxpc3QgZXh0ZW5kcyB0aGUgT1dMIGZvcm1hdCB0byBhZGQgYW5cclxuICogIG92ZXJsYXkgb250byBhbiBPV0wgZm9ybWF0IFdvcmRsaXN0IHRvIHN1cHBvcnQgZGlhY3JpdGljXHJcbiAqICBtYXJrcy5cclxuICpcclxuICogIFRoaXMgY2xhc3MgaXMgZ2VuZXJhbGx5IG5vdCB1c2VmdWwgdG8gbW9zdCBkZXZlbG9wZXJzIGFzXHJcbiAqICBpdCBpcyB1c2VkIG1haW5seSBpbnRlcm5hbGx5IHRvIGtlZXAgV29yZGxpc3RzIGZvciBsYW5ndWFnZXNcclxuICogIGJhc2VkIG9uIGxhdGluLTEgc21hbGwuXHJcbiAqXHJcbiAqICBJZiBuZWNlc3NhcnksIHRoZXJlIGFyZSB0b29scyB3aXRoaW4gdGhlIGBgZ2VuZXJhdGlvbi9gYCBmb2xkZXJcclxuICogIHRvIGNyZWF0ZSB0aGUgbmVjZXNzYXJ5IGRhdGEuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgV29yZGxpc3RPd2xBIGV4dGVuZHMgV29yZGxpc3RPd2wge1xyXG4gICAgI2FjY2VudDtcclxuICAgIC8qKlxyXG4gICAgICogIENyZWF0ZXMgYSBuZXcgV29yZGxpc3QgZm9yICUlbG9jYWxlJSUgdXNpbmcgdGhlIE9XTEEgJSVkYXRhJSVcclxuICAgICAqICBhbmQgJSVhY2NlbnQlJSBkYXRhIGFuZCB2YWxpZGF0ZWQgYWdhaW5zdCB0aGUgJSVjaGVja3N1bSUlLlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcihsb2NhbGUsIGRhdGEsIGFjY2VudCwgY2hlY2tzdW0pIHtcclxuICAgICAgICBzdXBlcihsb2NhbGUsIGRhdGEsIGNoZWNrc3VtKTtcclxuICAgICAgICB0aGlzLiNhY2NlbnQgPSBhY2NlbnQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqICBUaGUgT1dMQS1lbmNvZGVkIGFjY2VudCBkYXRhLlxyXG4gICAgICovXHJcbiAgICBnZXQgX2FjY2VudCgpIHsgcmV0dXJuIHRoaXMuI2FjY2VudDsgfVxyXG4gICAgLyoqXHJcbiAgICAgKiAgRGVjb2RlIGFsbCB0aGUgd29yZHMgZm9yIHRoZSB3b3JkbGlzdC5cclxuICAgICAqL1xyXG4gICAgX2RlY29kZVdvcmRzKCkge1xyXG4gICAgICAgIHJldHVybiBkZWNvZGVPd2xBKHRoaXMuX2RhdGEsIHRoaXMuX2FjY2VudCk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d29yZGxpc3Qtb3dsYS5qcy5tYXAiLCJpbXBvcnQgeyBMYW5nRW4gfSBmcm9tIFwiLi9sYW5nLWVuLmpzXCI7XHJcbmV4cG9ydCBjb25zdCB3b3JkbGlzdHMgPSB7XHJcbiAgICBlbjogTGFuZ0VuLndvcmRsaXN0KCksXHJcbn07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXdvcmRsaXN0cy1icm93c2VyLmpzLm1hcCJdLCJuYW1lcyI6WyJ2YWx1ZSIsIl9rZWNjYWsyNTYiLCJfc2hhMjU2IiwiZGVmYXVsdEFwaUtleSIsImdldEhvc3QiLCJyZXF1ZXN0IiwiZXJyb3IiLCJpZCIsInJlc3BvbnNlIiwicmVzdWx0IiwidHJhbnNhY3Rpb24iLCJibG9ja051bWJlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBS1ksTUFBQyxJQUFJLE9BQU8sb0VBQW9FO0FBTWhGLE1BQUMsY0FBYyxPQUFPLHFCQUFxQjtBQU0zQyxNQUFDLGFBQWEsT0FBTyxvRUFBb0U7QUFNekYsTUFBQyxZQUFZLE9BQU8sb0VBQW9FLElBQUksT0FBTyxFQUFFO0FBTXJHLE1BQUMsWUFBWSxPQUFPLG9FQUFvRTtBQ1BwRyxTQUFTLE9BQU87QUFDWixjQUFZLEtBQUk7QUFDaEIsWUFBVSxLQUFJO0FBQ2QsU0FBTyxLQUFJO0FBQ1gsY0FBWSxLQUFJO0FBQ2hCLFlBQVUsS0FBSTtBQUNkLFNBQU8sS0FBSTtBQUNYLGFBQVcsS0FBSTtBQUNmLFNBQU8sS0FBSTtBQUNYLFNBQU8sS0FBSTtBQUNYLGNBQVksS0FBSTtBQUNwQjtBQzlCQSxNQUFNLGFBQWEsSUFBSSxPQUFPLGlCQUFpQjtBQUMvQyxNQUFNLGNBQWMsSUFBSSxPQUFPLG1CQUFtQjtBQUNsRCxNQUFNLGFBQWEsSUFBSSxPQUFPLHNCQUFzQjtBQUNwRCxTQUFTLE1BQU0sTUFBTSxPQUFPLFNBQVM7QUFDakMsVUFBUSxNQUFJO0FBQUEsSUFDUixLQUFLO0FBQ0QsVUFBSSxTQUFTO0FBQ1QsZUFBTyxTQUFTLGFBQWEsT0FBTyxFQUFFLENBQUM7QUFBQSxNQUMzQztBQUNBLGFBQU8sU0FBUyxXQUFXLEtBQUssQ0FBQztBQUFBLElBQ3JDLEtBQUs7QUFDRCxhQUFPLFlBQVksS0FBSztBQUFBLElBQzVCLEtBQUs7QUFDRCxhQUFPLFNBQVMsS0FBSztBQUFBLElBQ3pCLEtBQUs7QUFDRCxjQUFTLENBQUMsQ0FBQyxRQUFRLFNBQVM7QUFDNUIsVUFBSSxTQUFTO0FBQ1QsZUFBTyxTQUFTLGFBQWEsT0FBTyxFQUFFLENBQUM7QUFBQSxNQUMzQztBQUNBLGFBQU8sU0FBUyxLQUFLO0FBQUEsRUFDakM7QUFD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RztBQUMxQjtBQ1pPLE1BQU0scUJBQXFCLFlBQVk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTTFDLFlBQVksUUFBUSxNQUFNLFFBQVEsVUFBVTtBQUN4QyxVQUFNLFFBQVEsTUFBTSxRQUFRO0FBTmhDO0FBT0ksdUJBQUssU0FBVTtBQUFBLEVBQ25CO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJQSxJQUFJLFVBQVU7QUFBRSxXQUFPLG1CQUFLO0FBQUEsRUFBUztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSXJDLGVBQWU7QUFDWCxXQUFPLFdBQVcsS0FBSyxPQUFPLEtBQUssT0FBTztBQUFBLEVBQzlDO0FBQ0o7QUFuQkk7QUNkUSxNQUFDLFlBQVk7QUFBQSxFQUNyQixJQUFJLE9BQU8sU0FBUTtBQUN2Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7IiwieF9nb29nbGVfaWdub3JlTGlzdCI6WzAsMSwyLDMsNCw1LDYsNyw4LDksMTAsMTEsMTIsMTMsMTQsMTUsMTYsMTcsMTgsMTksMjAsMjEsMjIsMjMsMjQsMjUsMjZdfQ==
