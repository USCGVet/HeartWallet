import { P as computeHmac, Q as keccak256, R as pbkdf2, S as randomBytes, T as ripemd160, U as scrypt, V as scryptSync, W as sha256, X as sha512, Y as assertArgument, Z as hexlify, _ as concat, B as getBytes, $ as toUtf8Bytes, H as getAddress, a0 as toTwos, a1 as zeroPadValue, a2 as toBeArray, a3 as dataLength, a4 as zeroPadBytes, D as toUtf8String, I as Interface, a5 as defineProperties, a6 as BaseContract, a7 as copyOverrides, a8 as resolveArgs, a9 as assert, aa as getCreateAddress, ab as JsonRpcProvider, ac as Network, ad as FetchRequest, ae as resolveProperties, af as AbstractProvider, ag as toQuantity, ah as accessListify, ai as isError, aj as AbiCoder, ak as Transaction, C as Contract, al as NetworkPlugin, am as JsonRpcApiProvider, an as UnmanagedSubscriber, ao as makeError, ap as getBigInt, aq as getNumber, ar as AbstractSigner, as as JsonRpcApiPollingProvider, at as isHexString, au as decodeOwl, av as WordlistOwl, aw as LangEn, ax as BaseWallet, ay as Block, az as ConstructorFragment, aA as ContractEventPayload, aB as ContractTransactionReceipt, aC as ContractTransactionResponse, aD as ContractUnknownEventPayload, aE as EnsPlugin, aF as EnsResolver, aG as ErrorDescription, aH as ErrorFragment, aI as EtherSymbol, aJ as EventFragment, aK as EventLog, aL as EventPayload, aM as FallbackFragment, aN as FeeData, aO as FeeDataNetworkPlugin, aP as FetchCancelSignal, aQ as FetchResponse, aR as FetchUrlFeeDataNetworkPlugin, aS as FixedNumber, aT as Fragment, aU as FunctionFragment, aV as GasCostPlugin, aW as HDNodeVoidWallet, aX as HDNodeWallet, aY as Indexed, aZ as JsonRpcSigner, a_ as Log, a$ as LogDescription, b0 as MessagePrefix, b1 as Mnemonic, b2 as MulticoinProviderPlugin, b3 as NamedFragment, b4 as ParamType, b5 as Result, b6 as Signature, b7 as SigningKey, b8 as StructFragment, b9 as TransactionDescription, ba as TransactionReceipt, bb as TransactionResponse, bc as Typed, bd as TypedDataEncoder, be as UndecodedEventLog, bf as Utf8ErrorFuncs, bg as VoidSigner, bh as Wallet, bi as Wordlist, bj as ZeroAddress, bk as ZeroHash, bl as assertArgumentCount, bm as assertNormalize, bn as assertPrivate, bo as authorizationify, bp as checkResultErrors, bq as computeAddress, br as copyRequest, bs as dataSlice, bt as decodeBase58, bu as decodeBase64, bv as decodeRlp, bw as decryptCrowdsaleJson, bx as decryptKeystoreJson, by as decryptKeystoreJsonSync, bz as defaultPath, bA as dnsEncode, bB as encodeBase58, bC as encodeBase64, bD as encodeRlp, bE as encryptKeystoreJson, bF as encryptKeystoreJsonSync, bG as ensNormalize, A as formatEther, f as formatUnits, bH as fromTwos, bI as getAccountPath, bJ as getBytesCopy, bK as getCreate2Address, bL as getIcapAddress, bM as getIndexedAccountPath, bN as getUint, bO as hashAuthorization, bP as hashMessage, bQ as id, i as isAddress, bR as isAddressable, bS as isBytesLike, bT as isCallException, bU as isCrowdsaleJson, bV as isKeystoreJson, bW as isValidName, bX as mask, bY as namehash, o as parseEther, p as parseUnits, bZ as recoverAddress, b_ as resolveAddress, b$ as stripZerosLeft, c0 as toBeHex, c1 as toBigInt, c2 as toNumber, c3 as toUtf8CodePoints, c4 as uuidV4, c5 as verifyAuthorization, c6 as verifyMessage, c7 as verifyTypedData, c8 as version } from "./rpc.js";
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
   *  The Contract Interface.
   */
  interface;
  /**
   *  The Contract deployment bytecode. Often called the initcode.
   */
  bytecode;
  /**
   *  The ContractRunner to deploy the Contract as.
   */
  runner;
  /**
   *  Create a new **ContractFactory** with %%abi%% and %%bytecode%%,
   *  optionally connected to %%runner%%.
   *
   *  The %%bytecode%% may be the ``bytecode`` property within the
   *  standard Solidity JSON output.
   */
  constructor(abi, bytecode, runner) {
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
   *  The API key for the Ankr connection.
   */
  apiKey;
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
  apiKey;
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
   *  The API key for the Chainstack connection.
   */
  apiKey;
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
   *  The Etherscan API base URL.
   */
  baseUrl;
  /**
   *  Creates a new **EtherscanProvider** which will use
   *  %%baseUrl%%.
   */
  constructor(baseUrl) {
    super(EtherscanPluginId);
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
   *  The connected network.
   */
  network;
  /**
   *  The API key or null if using the community provided bandwidth.
   */
  apiKey;
  #plugin;
  /**
   *  Creates a new **EtherscanBaseProvider**.
   */
  constructor(_network, _apiKey) {
    const apiKey = _apiKey != null ? _apiKey : null;
    super();
    const network = Network.from(_network);
    this.#plugin = network.getPlugin(EtherscanPluginId);
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
    if (this.#plugin) {
      return this.#plugin.baseUrl;
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
      /* Working with Etherscan to get this added:
      try {
          const test = await this.fetch("proxy", {
              action: "eth_maxPriorityFeePerGas"
          });
          console.log(test);
          return test;
      } catch (e) {
          console.log("DEBUG", e);
          throw e;
      }
      */
      /* This might be safe; but due to rounding neither myself
         or Etherscan are necessarily comfortable with this. :)
      try {
          const result = await this.fetch("gastracker", { action: "gasoracle" });
          console.log(result);
          const gasPrice = parseUnits(result.SafeGasPrice, "gwei");
          const baseFee = parseUnits(result.suggestBaseFee, "gwei");
          const priorityFee = gasPrice - baseFee;
          if (priorityFee < 0) { throw new Error("negative priority fee; defer to abstract provider default"); }
          return priorityFee;
      } catch (error) {
          console.log("DEBUG", error);
          throw error;
      }
      */
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
  #provider;
  #filter;
  /**
   *  The filter.
   */
  get filter() {
    return JSON.parse(this.#filter);
  }
  #filterId;
  #paused;
  #emitPromise;
  /**
   *  Creates a new **SocketSubscriber** attached to %%provider%% listening
   *  to %%filter%%.
   */
  constructor(provider, filter) {
    this.#provider = provider;
    this.#filter = JSON.stringify(filter);
    this.#filterId = null;
    this.#paused = null;
    this.#emitPromise = null;
  }
  start() {
    this.#filterId = this.#provider.send("eth_subscribe", this.filter).then((filterId) => {
      this.#provider._register(filterId, this);
      return filterId;
    });
  }
  stop() {
    this.#filterId.then((filterId) => {
      if (this.#provider.destroyed) {
        return;
      }
      this.#provider.send("eth_unsubscribe", [filterId]);
    });
    this.#filterId = null;
  }
  // @TODO: pause should trap the current blockNumber, unsub, and on resume use getLogs
  //        and resume
  pause(dropWhilePaused) {
    assert(dropWhilePaused, "preserve logs while paused not supported by SocketSubscriber yet", "UNSUPPORTED_OPERATION", { operation: "pause(false)" });
    this.#paused = !!dropWhilePaused;
  }
  resume() {
    this.#paused = null;
  }
  /**
   *  @_ignore:
   */
  _handleMessage(message) {
    if (this.#filterId == null) {
      return;
    }
    if (this.#paused === null) {
      let emitPromise = this.#emitPromise;
      if (emitPromise == null) {
        emitPromise = this._emit(this.#provider, message);
      } else {
        emitPromise = emitPromise.then(async () => {
          await this._emit(this.#provider, message);
        });
      }
      this.#emitPromise = emitPromise.then(() => {
        if (this.#emitPromise === emitPromise) {
          this.#emitPromise = null;
        }
      });
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
  #logFilter;
  /**
   *  The filter.
   */
  get logFilter() {
    return JSON.parse(this.#logFilter);
  }
  /**
   *  @_ignore:
   */
  constructor(provider, filter) {
    super(provider, ["logs", filter]);
    this.#logFilter = JSON.stringify(filter);
  }
  async _emit(provider, message) {
    provider.emit(this.logFilter, provider._wrapLog(message, provider._network));
  }
}
class SocketProvider extends JsonRpcApiProvider {
  #callbacks;
  // Maps each filterId to its subscriber
  #subs;
  // If any events come in before a subscriber has finished
  // registering, queue them
  #pending;
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
    this.#callbacks = /* @__PURE__ */ new Map();
    this.#subs = /* @__PURE__ */ new Map();
    this.#pending = /* @__PURE__ */ new Map();
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
    this.#subs.set(filterId, subscriber);
    const pending = this.#pending.get(filterId);
    if (pending) {
      for (const message of pending) {
        subscriber._handleMessage(message);
      }
      this.#pending.delete(filterId);
    }
  }
  async _send(payload) {
    assertArgument(!Array.isArray(payload), "WebSocket does not support batch send", "payload", payload);
    const promise = new Promise((resolve, reject) => {
      this.#callbacks.set(payload.id, { payload, resolve, reject });
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
      const callback = this.#callbacks.get(result.id);
      if (callback == null) {
        this.emit("error", makeError("received result for unknown id", "UNKNOWN_ERROR", {
          reasonCode: "UNKNOWN_ID",
          result
        }));
        return;
      }
      this.#callbacks.delete(result.id);
      callback.resolve(result);
    } else if (result && result.method === "eth_subscription") {
      const filterId = result.params.subscription;
      const subscriber = this.#subs.get(filterId);
      if (subscriber) {
        subscriber._handleMessage(result.params.result);
      } else {
        let pending = this.#pending.get(filterId);
        if (pending == null) {
          pending = [];
          this.#pending.set(filterId, pending);
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
class WebSocketProvider extends SocketProvider {
  #connect;
  #websocket;
  get websocket() {
    if (this.#websocket == null) {
      throw new Error("websocket closed");
    }
    return this.#websocket;
  }
  constructor(url, network, options) {
    super(network, options);
    if (typeof url === "string") {
      this.#connect = () => {
        return new _WebSocket(url);
      };
      this.#websocket = this.#connect();
    } else if (typeof url === "function") {
      this.#connect = url;
      this.#websocket = url();
    } else {
      this.#connect = null;
      this.#websocket = url;
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
  async _write(message) {
    this.websocket.send(message);
  }
  async destroy() {
    if (this.#websocket != null) {
      this.#websocket.close();
      this.#websocket = null;
    }
    super.destroy();
  }
}
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
    // @TODO: Remove this typo in the future!
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
   *  The Project ID for the INFURA connection.
   */
  projectId;
  /**
   *  The Project Secret.
   *
   *  If null, no authenticated requests are made. This should not
   *  be used outside of private contexts.
   */
  projectSecret;
  /**
   *  Creates a new **InfuraWebSocketProvider**.
   */
  constructor(network, projectId) {
    const provider = new InfuraProvider(network, projectId);
    const req = provider._getConnection();
    assert(!req.credentials, "INFURA WebSocket project secrets unsupported", "UNSUPPORTED_OPERATION", { operation: "InfuraProvider.getWebSocketProvider()" });
    const url = req.url.replace(/^http/i, "ws").replace("/v3/", "/ws/v3/");
    super(url, provider._network);
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
   *  The Project ID for the INFURA connection.
   */
  projectId;
  /**
   *  The Project Secret.
   *
   *  If null, no authenticated requests are made. This should not
   *  be used outside of private contexts.
   */
  projectSecret;
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
   *  The API token.
   */
  token;
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
   *  The number of backends that must agree on a value before it is
   *  accpeted.
   */
  quorum;
  /**
   *  @_ignore:
   */
  eventQuorum;
  /**
   *  @_ignore:
   */
  eventWorkers;
  #configs;
  #height;
  #initialSyncPromise;
  /**
   *  Creates a new **FallbackProvider** with %%providers%% connected to
   *  %%network%%.
   *
   *  If a [[Provider]] is included in %%providers%%, defaults are used
   *  for the configuration.
   */
  constructor(providers, network, options) {
    super(network, options);
    this.#configs = providers.map((p) => {
      if (p instanceof AbstractProvider) {
        return Object.assign({ provider: p }, defaultConfig, defaultState);
      } else {
        return Object.assign({}, defaultConfig, p, defaultState);
      }
    });
    this.#height = -2;
    this.#initialSyncPromise = null;
    if (options && options.quorum != null) {
      this.quorum = options.quorum;
    } else {
      this.quorum = Math.ceil(this.#configs.reduce((accum, config) => {
        accum += config.weight;
        return accum;
      }, 0) / 2);
    }
    this.eventQuorum = 1;
    this.eventWorkers = 1;
    assertArgument(this.quorum <= this.#configs.reduce((a, c) => a + c.weight, 0), "quorum exceed provider weight", "quorum", this.quorum);
  }
  get providerConfigs() {
    return this.#configs.map((c) => {
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
  // Grab the next (random) config that is not already part of
  // the running set
  #getNextConfig(running) {
    const configs = Array.from(running).map((r) => r.config);
    const allConfigs = this.#configs.slice();
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
  }
  // Adds a new runner (if available) to running.
  #addRunner(running, req) {
    const config = this.#getNextConfig(running);
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
  }
  // Initializes the blockNumber and network for each runner and
  // blocks until initialized
  async #initialSync() {
    let initialSync = this.#initialSyncPromise;
    if (!initialSync) {
      const promises = [];
      this.#configs.forEach((config) => {
        promises.push((async () => {
          await waitForSync(config, 0);
          if (!config._lastFatalError) {
            config._network = await config.provider.getNetwork();
          }
        })());
      });
      this.#initialSyncPromise = initialSync = (async () => {
        await Promise.all(promises);
        let chainId = null;
        for (const config of this.#configs) {
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
      })();
    }
    await initialSync;
  }
  async #checkQuorum(running, req) {
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
        if (this.#height === -2) {
          this.#height = Math.ceil(getNumber(getMedian(this.quorum, this.#configs.filter((c) => !c._lastFatalError).map((c) => ({
            value: c.blockNumber,
            tag: getNumber(c.blockNumber).toString(),
            weight: c.weight
          })))));
        }
        const mode = getFuzzyMode(this.quorum, results);
        if (mode === void 0) {
          return void 0;
        }
        if (mode > this.#height) {
          this.#height = mode;
        }
        return this.#height;
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
  }
  async #waitForQuorum(running, req) {
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
    const value = await this.#checkQuorum(running, req);
    if (value !== void 0) {
      if (value instanceof Error) {
        throw value;
      }
      return value;
    }
    for (let i = 0; i < newRunners; i++) {
      this.#addRunner(running, req);
    }
    assert(interesting.length > 0, "quorum not met", "SERVER_ERROR", {
      request: "%sub-requests",
      info: { request: req, results: Array.from(running).map((r) => stringify(r.result)) }
    });
    await Promise.race(interesting);
    return await this.#waitForQuorum(running, req);
  }
  async _perform(req) {
    if (req.method === "broadcastTransaction") {
      const results = this.#configs.map((c) => null);
      const broadcasts = this.#configs.map(async ({ provider, weight }, index) => {
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
    await this.#initialSync();
    const running = /* @__PURE__ */ new Set();
    let inflightQuorum = 0;
    while (true) {
      const runner = this.#addRunner(running, req);
      if (runner == null) {
        break;
      }
      inflightQuorum += runner.config.weight;
      if (inflightQuorum >= this.quorum) {
        break;
      }
    }
    const result = await this.#waitForQuorum(running, req);
    for (const runner of running) {
      if (runner.perform && runner.result == null) {
        runner.config.lateResponses++;
      }
    }
    return result;
  }
  async destroy() {
    for (const { provider } of this.#configs) {
      provider.destroy();
    }
    super.destroy();
  }
}
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
class NonceManager extends AbstractSigner {
  /**
   *  The Signer being managed.
   */
  signer;
  #noncePromise;
  #delta;
  /**
   *  Creates a new **NonceManager** to manage %%signer%%.
   */
  constructor(signer) {
    super(signer.provider);
    defineProperties(this, { signer });
    this.#noncePromise = null;
    this.#delta = 0;
  }
  async getAddress() {
    return this.signer.getAddress();
  }
  connect(provider) {
    return new NonceManager(this.signer.connect(provider));
  }
  async getNonce(blockTag) {
    if (blockTag === "pending") {
      if (this.#noncePromise == null) {
        this.#noncePromise = super.getNonce("pending");
      }
      const delta = this.#delta;
      return await this.#noncePromise + delta;
    }
    return super.getNonce(blockTag);
  }
  /**
   *  Manually increment the nonce. This may be useful when managng
   *  offline transactions.
   */
  increment() {
    this.#delta++;
  }
  /**
   *  Resets the nonce, causing the **NonceManager** to reload the current
   *  nonce from the blockchain on the next transaction.
   */
  reset() {
    this.#delta = 0;
    this.#noncePromise = null;
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
}
class BrowserProvider extends JsonRpcApiPollingProvider {
  #request;
  #providerInfo;
  /**
   *  Connect to the %%ethereum%% provider, optionally forcing the
   *  %%network%%.
   */
  constructor(ethereum, network, _options) {
    const options = Object.assign({}, _options != null ? _options : {}, { batchMaxCount: 1 });
    assertArgument(ethereum && ethereum.request, "invalid EIP-1193 provider", "ethereum", ethereum);
    super(network, options);
    this.#providerInfo = null;
    if (_options && _options.providerInfo) {
      this.#providerInfo = _options.providerInfo;
    }
    this.#request = async (method, params) => {
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
    };
  }
  get providerInfo() {
    return this.#providerInfo;
  }
  async send(method, params) {
    await this._start();
    return await super.send(method, params);
  }
  async _send(payload) {
    assertArgument(!Array.isArray(payload), "EIP-1193 does not support batch request", "payload", payload);
    try {
      const result = await this.#request(payload.method, payload.params || []);
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
        await this.#request("eth_requestAccounts", []);
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
      return new BrowserProvider(options.provider);
    }
    const context = options.window ? options.window : typeof window !== "undefined" ? window : null;
    if (context == null) {
      return null;
    }
    const anyProvider = options.anyProvider;
    if (anyProvider && context.ethereum) {
      return new BrowserProvider(context.ethereum);
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
            } else if (filtered instanceof BrowserProvider) {
              resolve(filtered);
            } else {
              let match = null;
              if (filtered.uuid) {
                const matches = found.filter((f) => filtered.uuid === f.info.uuid);
                match = matches[0];
              }
              if (match) {
                const { provider, info } = match;
                resolve(new BrowserProvider(provider, void 0, {
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
            resolve(new BrowserProvider(provider, void 0, {
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
}
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
   *  The API key.
   */
  apiKey;
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
   *  The Application ID for the Pocket connection.
   */
  applicationId;
  /**
   *  The Application Secret for making authenticated requests
   *  to the Pocket connection.
   */
  applicationSecret;
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
  #accent;
  /**
   *  Creates a new Wordlist for %%locale%% using the OWLA %%data%%
   *  and %%accent%% data and validated against the %%checksum%%.
   */
  constructor(locale, data, accent, checksum) {
    super(locale, data, checksum);
    this.#accent = accent;
  }
  /**
   *  The OWLA-encoded accent data.
   */
  get _accent() {
    return this.#accent;
  }
  /**
   *  Decode all the words for the wordlist.
   */
  _decodeWords() {
    return decodeOwlA(this._data, this._accent);
  }
}
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9jb25zdGFudHMvbnVtYmVycy5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9jcnlwdG8vaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vaGFzaC9zb2xpZGl0eS5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9hYmkvYnl0ZXMzMi5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9jb250cmFjdC9mYWN0b3J5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2V0aGVycy9saWIuZXNtL3Byb3ZpZGVycy9jb21tdW5pdHkuanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vcHJvdmlkZXJzL3Byb3ZpZGVyLWFua3IuanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vcHJvdmlkZXJzL3Byb3ZpZGVyLWFsY2hlbXkuanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vcHJvdmlkZXJzL3Byb3ZpZGVyLWNoYWluc3RhY2suanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vcHJvdmlkZXJzL3Byb3ZpZGVyLWNsb3VkZmxhcmUuanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vcHJvdmlkZXJzL3Byb3ZpZGVyLWV0aGVyc2Nhbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9wcm92aWRlcnMvd3MtYnJvd3Nlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9wcm92aWRlcnMvcHJvdmlkZXItc29ja2V0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2V0aGVycy9saWIuZXNtL3Byb3ZpZGVycy9wcm92aWRlci13ZWJzb2NrZXQuanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vcHJvdmlkZXJzL3Byb3ZpZGVyLWluZnVyYS5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9wcm92aWRlcnMvcHJvdmlkZXItcXVpY2tub2RlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2V0aGVycy9saWIuZXNtL3Byb3ZpZGVycy9wcm92aWRlci1mYWxsYmFjay5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9wcm92aWRlcnMvZGVmYXVsdC1wcm92aWRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9wcm92aWRlcnMvc2lnbmVyLW5vbmNlbWFuYWdlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9wcm92aWRlcnMvcHJvdmlkZXItYnJvd3Nlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9wcm92aWRlcnMvcHJvdmlkZXItYmxvY2tzY291dC5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS9wcm92aWRlcnMvcHJvdmlkZXItcG9ja2V0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2V0aGVycy9saWIuZXNtL3Byb3ZpZGVycy9wcm92aWRlci1pcGNzb2NrZXQtYnJvd3Nlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS93b3JkbGlzdHMvYml0LXJlYWRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9ldGhlcnMvbGliLmVzbS93b3JkbGlzdHMvZGVjb2RlLW93bGEuanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vd29yZGxpc3RzL3dvcmRsaXN0LW93bGEuanMiLCIuLi9ub2RlX21vZHVsZXMvZXRoZXJzL2xpYi5lc20vd29yZGxpc3RzL3dvcmRsaXN0cy1icm93c2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogIEEgY29uc3RhbnQgZm9yIHRoZSBvcmRlciBOIGZvciB0aGUgc2VjcDI1NmsxIGN1cnZlLlxuICpcbiAqICAoKippLmUuKiogYGAweGZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZlYmFhZWRjZTZhZjQ4YTAzYmJmZDI1ZThjZDAzNjQxNDFuYGApXG4gKi9cbmV4cG9ydCBjb25zdCBOID0gQmlnSW50KFwiMHhmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZWJhYWVkY2U2YWY0OGEwM2JiZmQyNWU4Y2QwMzY0MTQxXCIpO1xuLyoqXG4gKiAgQSBjb25zdGFudCBmb3IgdGhlIG51bWJlciBvZiB3ZWkgaW4gYSBzaW5nbGUgZXRoZXIuXG4gKlxuICogICgqKmkuZS4qKiBgYDEwMDAwMDAwMDAwMDAwMDAwMDBuYGApXG4gKi9cbmV4cG9ydCBjb25zdCBXZWlQZXJFdGhlciA9IEJpZ0ludChcIjEwMDAwMDAwMDAwMDAwMDAwMDBcIik7XG4vKipcbiAqICBBIGNvbnN0YW50IGZvciB0aGUgbWF4aW11bSB2YWx1ZSBmb3IgYSBgYHVpbnQyNTZgYC5cbiAqXG4gKiAgKCoqaS5lLioqIGBgMHhmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmbmBgKVxuICovXG5leHBvcnQgY29uc3QgTWF4VWludDI1NiA9IEJpZ0ludChcIjB4ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZlwiKTtcbi8qKlxuICogIEEgY29uc3RhbnQgZm9yIHRoZSBtaW5pbXVtIHZhbHVlIGZvciBhbiBgYGludDI1NmBgLlxuICpcbiAqICAoKippLmUuKiogYGAtODAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMG5gYClcbiAqL1xuZXhwb3J0IGNvbnN0IE1pbkludDI1NiA9IEJpZ0ludChcIjB4ODAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMFwiKSAqIEJpZ0ludCgtMSk7XG4vKipcbiAqICBBIGNvbnN0YW50IGZvciB0aGUgbWF4aW11bSB2YWx1ZSBmb3IgYW4gYGBpbnQyNTZgYC5cbiAqXG4gKiAgKCoqaS5lLioqIGBgMHg3ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmbmBgKVxuICovXG5leHBvcnQgY29uc3QgTWF4SW50MjU2ID0gQmlnSW50KFwiMHg3ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmXCIpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bnVtYmVycy5qcy5tYXAiLCIvKipcbiAqICBBIGZ1bmRhbWVudGFsIGJ1aWxkaW5nIGJsb2NrIG9mIEV0aGVyZXVtIGlzIHRoZSB1bmRlcmx5aW5nXG4gKiAgY3J5cHRvZ3JhcGhpYyBwcmltaXRpdmVzLlxuICpcbiAqICBAX3NlY3Rpb246IGFwaS9jcnlwdG86Q3J5cHRvZ3JhcGhpYyBGdW5jdGlvbnMgICBbYWJvdXQtY3J5cHRvXVxuICovXG5udWxsO1xuLy8gV2UgaW1wb3J0IGFsbCB0aGVzZSBzbyB3ZSBjYW4gZXhwb3J0IGxvY2soKVxuaW1wb3J0IHsgY29tcHV0ZUhtYWMgfSBmcm9tIFwiLi9obWFjLmpzXCI7XG5pbXBvcnQgeyBrZWNjYWsyNTYgfSBmcm9tIFwiLi9rZWNjYWsuanNcIjtcbmltcG9ydCB7IHJpcGVtZDE2MCB9IGZyb20gXCIuL3JpcGVtZDE2MC5qc1wiO1xuaW1wb3J0IHsgcGJrZGYyIH0gZnJvbSBcIi4vcGJrZGYyLmpzXCI7XG5pbXBvcnQgeyByYW5kb21CeXRlcyB9IGZyb20gXCIuL3JhbmRvbS5qc1wiO1xuaW1wb3J0IHsgc2NyeXB0LCBzY3J5cHRTeW5jIH0gZnJvbSBcIi4vc2NyeXB0LmpzXCI7XG5pbXBvcnQgeyBzaGEyNTYsIHNoYTUxMiB9IGZyb20gXCIuL3NoYTIuanNcIjtcbmV4cG9ydCB7IGNvbXB1dGVIbWFjLCByYW5kb21CeXRlcywga2VjY2FrMjU2LCByaXBlbWQxNjAsIHNoYTI1Niwgc2hhNTEyLCBwYmtkZjIsIHNjcnlwdCwgc2NyeXB0U3luYyB9O1xuZXhwb3J0IHsgU2lnbmluZ0tleSB9IGZyb20gXCIuL3NpZ25pbmcta2V5LmpzXCI7XG5leHBvcnQgeyBTaWduYXR1cmUgfSBmcm9tIFwiLi9zaWduYXR1cmUuanNcIjtcbi8qKlxuICogIE9uY2UgY2FsbGVkLCBwcmV2ZW50cyBhbnkgZnV0dXJlIGNoYW5nZSB0byB0aGUgdW5kZXJseWluZyBjcnlwdG9ncmFwaGljXG4gKiAgcHJpbWl0aXZlcyB1c2luZyB0aGUgYGAucmVnaXN0ZXJgYCBmZWF0dXJlIGZvciBob29rcy5cbiAqL1xuZnVuY3Rpb24gbG9jaygpIHtcbiAgICBjb21wdXRlSG1hYy5sb2NrKCk7XG4gICAga2VjY2FrMjU2LmxvY2soKTtcbiAgICBwYmtkZjIubG9jaygpO1xuICAgIHJhbmRvbUJ5dGVzLmxvY2soKTtcbiAgICByaXBlbWQxNjAubG9jaygpO1xuICAgIHNjcnlwdC5sb2NrKCk7XG4gICAgc2NyeXB0U3luYy5sb2NrKCk7XG4gICAgc2hhMjU2LmxvY2soKTtcbiAgICBzaGE1MTIubG9jaygpO1xuICAgIHJhbmRvbUJ5dGVzLmxvY2soKTtcbn1cbmV4cG9ydCB7IGxvY2sgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsImltcG9ydCB7IGdldEFkZHJlc3MgfSBmcm9tIFwiLi4vYWRkcmVzcy9pbmRleC5qc1wiO1xuaW1wb3J0IHsga2VjY2FrMjU2IGFzIF9rZWNjYWsyNTYsIHNoYTI1NiBhcyBfc2hhMjU2IH0gZnJvbSBcIi4uL2NyeXB0by9pbmRleC5qc1wiO1xuaW1wb3J0IHsgY29uY2F0LCBkYXRhTGVuZ3RoLCBnZXRCeXRlcywgaGV4bGlmeSwgdG9CZUFycmF5LCB0b1R3b3MsIHRvVXRmOEJ5dGVzLCB6ZXJvUGFkQnl0ZXMsIHplcm9QYWRWYWx1ZSwgYXNzZXJ0QXJndW1lbnQgfSBmcm9tIFwiLi4vdXRpbHMvaW5kZXguanNcIjtcbmNvbnN0IHJlZ2V4Qnl0ZXMgPSBuZXcgUmVnRXhwKFwiXmJ5dGVzKFswLTldKykkXCIpO1xuY29uc3QgcmVnZXhOdW1iZXIgPSBuZXcgUmVnRXhwKFwiXih1P2ludCkoWzAtOV0qKSRcIik7XG5jb25zdCByZWdleEFycmF5ID0gbmV3IFJlZ0V4cChcIl4oLiopXFxcXFsoWzAtOV0qKVxcXFxdJFwiKTtcbmZ1bmN0aW9uIF9wYWNrKHR5cGUsIHZhbHVlLCBpc0FycmF5KSB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgXCJhZGRyZXNzXCI6XG4gICAgICAgICAgICBpZiAoaXNBcnJheSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXRCeXRlcyh6ZXJvUGFkVmFsdWUodmFsdWUsIDMyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZ2V0Qnl0ZXMoZ2V0QWRkcmVzcyh2YWx1ZSkpO1xuICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAgICByZXR1cm4gdG9VdGY4Qnl0ZXModmFsdWUpO1xuICAgICAgICBjYXNlIFwiYnl0ZXNcIjpcbiAgICAgICAgICAgIHJldHVybiBnZXRCeXRlcyh2YWx1ZSk7XG4gICAgICAgIGNhc2UgXCJib29sXCI6XG4gICAgICAgICAgICB2YWx1ZSA9ICghIXZhbHVlID8gXCIweDAxXCIgOiBcIjB4MDBcIik7XG4gICAgICAgICAgICBpZiAoaXNBcnJheSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXRCeXRlcyh6ZXJvUGFkVmFsdWUodmFsdWUsIDMyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZ2V0Qnl0ZXModmFsdWUpO1xuICAgIH1cbiAgICBsZXQgbWF0Y2ggPSB0eXBlLm1hdGNoKHJlZ2V4TnVtYmVyKTtcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgbGV0IHNpZ25lZCA9IChtYXRjaFsxXSA9PT0gXCJpbnRcIik7XG4gICAgICAgIGxldCBzaXplID0gcGFyc2VJbnQobWF0Y2hbMl0gfHwgXCIyNTZcIik7XG4gICAgICAgIGFzc2VydEFyZ3VtZW50KCghbWF0Y2hbMl0gfHwgbWF0Y2hbMl0gPT09IFN0cmluZyhzaXplKSkgJiYgKHNpemUgJSA4ID09PSAwKSAmJiBzaXplICE9PSAwICYmIHNpemUgPD0gMjU2LCBcImludmFsaWQgbnVtYmVyIHR5cGVcIiwgXCJ0eXBlXCIsIHR5cGUpO1xuICAgICAgICBpZiAoaXNBcnJheSkge1xuICAgICAgICAgICAgc2l6ZSA9IDI1NjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2lnbmVkKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHRvVHdvcyh2YWx1ZSwgc2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdldEJ5dGVzKHplcm9QYWRWYWx1ZSh0b0JlQXJyYXkodmFsdWUpLCBzaXplIC8gOCkpO1xuICAgIH1cbiAgICBtYXRjaCA9IHR5cGUubWF0Y2gocmVnZXhCeXRlcyk7XG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIGNvbnN0IHNpemUgPSBwYXJzZUludChtYXRjaFsxXSk7XG4gICAgICAgIGFzc2VydEFyZ3VtZW50KFN0cmluZyhzaXplKSA9PT0gbWF0Y2hbMV0gJiYgc2l6ZSAhPT0gMCAmJiBzaXplIDw9IDMyLCBcImludmFsaWQgYnl0ZXMgdHlwZVwiLCBcInR5cGVcIiwgdHlwZSk7XG4gICAgICAgIGFzc2VydEFyZ3VtZW50KGRhdGFMZW5ndGgodmFsdWUpID09PSBzaXplLCBgaW52YWxpZCB2YWx1ZSBmb3IgJHt0eXBlfWAsIFwidmFsdWVcIiwgdmFsdWUpO1xuICAgICAgICBpZiAoaXNBcnJheSkge1xuICAgICAgICAgICAgcmV0dXJuIGdldEJ5dGVzKHplcm9QYWRCeXRlcyh2YWx1ZSwgMzIpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIG1hdGNoID0gdHlwZS5tYXRjaChyZWdleEFycmF5KTtcbiAgICBpZiAobWF0Y2ggJiYgQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgY29uc3QgYmFzZVR5cGUgPSBtYXRjaFsxXTtcbiAgICAgICAgY29uc3QgY291bnQgPSBwYXJzZUludChtYXRjaFsyXSB8fCBTdHJpbmcodmFsdWUubGVuZ3RoKSk7XG4gICAgICAgIGFzc2VydEFyZ3VtZW50KGNvdW50ID09PSB2YWx1ZS5sZW5ndGgsIGBpbnZhbGlkIGFycmF5IGxlbmd0aCBmb3IgJHt0eXBlfWAsIFwidmFsdWVcIiwgdmFsdWUpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICAgICAgdmFsdWUuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKF9wYWNrKGJhc2VUeXBlLCB2YWx1ZSwgdHJ1ZSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGdldEJ5dGVzKGNvbmNhdChyZXN1bHQpKTtcbiAgICB9XG4gICAgYXNzZXJ0QXJndW1lbnQoZmFsc2UsIFwiaW52YWxpZCB0eXBlXCIsIFwidHlwZVwiLCB0eXBlKTtcbn1cbi8vIEBUT0RPOiBBcnJheSBFbnVtXG4vKipcbiAqICAgQ29tcHV0ZXMgdGhlIFtbbGluay1zb2xjLXBhY2tlZF1dIHJlcHJlc2VudGF0aW9uIG9mICUldmFsdWVzJSVcbiAqICAgcmVzcGVjdGl2ZWx5IHRvIHRoZWlyICUldHlwZXMlJS5cbiAqXG4gKiAgIEBleGFtcGxlOlxuICogICAgICAgYWRkciA9IFwiMHg4YmExZjEwOTU1MWJkNDMyODAzMDEyNjQ1YWMxMzZkZGQ2NGRiYTcyXCJcbiAqICAgICAgIHNvbGlkaXR5UGFja2VkKFsgXCJhZGRyZXNzXCIsIFwidWludFwiIF0sIFsgYWRkciwgNDUgXSk7XG4gKiAgICAgICAvL19yZXN1bHQ6XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzb2xpZGl0eVBhY2tlZCh0eXBlcywgdmFsdWVzKSB7XG4gICAgYXNzZXJ0QXJndW1lbnQodHlwZXMubGVuZ3RoID09PSB2YWx1ZXMubGVuZ3RoLCBcIndyb25nIG51bWJlciBvZiB2YWx1ZXM7IGV4cGVjdGVkICR7IHR5cGVzLmxlbmd0aCB9XCIsIFwidmFsdWVzXCIsIHZhbHVlcyk7XG4gICAgY29uc3QgdGlnaHQgPSBbXTtcbiAgICB0eXBlcy5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlLCBpbmRleCkge1xuICAgICAgICB0aWdodC5wdXNoKF9wYWNrKHR5cGUsIHZhbHVlc1tpbmRleF0pKTtcbiAgICB9KTtcbiAgICByZXR1cm4gaGV4bGlmeShjb25jYXQodGlnaHQpKTtcbn1cbi8qKlxuICogICBDb21wdXRlcyB0aGUgW1tsaW5rLXNvbGMtcGFja2VkXV0gW1trZWNjYWsyNTZdXSBoYXNoIG9mICUldmFsdWVzJSVcbiAqICAgcmVzcGVjdGl2ZWx5IHRvIHRoZWlyICUldHlwZXMlJS5cbiAqXG4gKiAgIEBleGFtcGxlOlxuICogICAgICAgYWRkciA9IFwiMHg4YmExZjEwOTU1MWJkNDMyODAzMDEyNjQ1YWMxMzZkZGQ2NGRiYTcyXCJcbiAqICAgICAgIHNvbGlkaXR5UGFja2VkS2VjY2FrMjU2KFsgXCJhZGRyZXNzXCIsIFwidWludFwiIF0sIFsgYWRkciwgNDUgXSk7XG4gKiAgICAgICAvL19yZXN1bHQ6XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzb2xpZGl0eVBhY2tlZEtlY2NhazI1Nih0eXBlcywgdmFsdWVzKSB7XG4gICAgcmV0dXJuIF9rZWNjYWsyNTYoc29saWRpdHlQYWNrZWQodHlwZXMsIHZhbHVlcykpO1xufVxuLyoqXG4gKiAgIENvbXB1dGVzIHRoZSBbW2xpbmstc29sYy1wYWNrZWRdXSBbW3NoYTI1Nl1dIGhhc2ggb2YgJSV2YWx1ZXMlJVxuICogICByZXNwZWN0aXZlbHkgdG8gdGhlaXIgJSV0eXBlcyUlLlxuICpcbiAqICAgQGV4YW1wbGU6XG4gKiAgICAgICBhZGRyID0gXCIweDhiYTFmMTA5NTUxYmQ0MzI4MDMwMTI2NDVhYzEzNmRkZDY0ZGJhNzJcIlxuICogICAgICAgc29saWRpdHlQYWNrZWRTaGEyNTYoWyBcImFkZHJlc3NcIiwgXCJ1aW50XCIgXSwgWyBhZGRyLCA0NSBdKTtcbiAqICAgICAgIC8vX3Jlc3VsdDpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNvbGlkaXR5UGFja2VkU2hhMjU2KHR5cGVzLCB2YWx1ZXMpIHtcbiAgICByZXR1cm4gX3NoYTI1Nihzb2xpZGl0eVBhY2tlZCh0eXBlcywgdmFsdWVzKSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zb2xpZGl0eS5qcy5tYXAiLCIvKipcbiAqICBBYm91dCBieXRlczMyIHN0cmluZ3MuLi5cbiAqXG4gKiAgQF9kb2Nsb2M6IGFwaS91dGlsczpCeXRlczMyIFN0cmluZ3NcbiAqL1xuaW1wb3J0IHsgZ2V0Qnl0ZXMsIHRvVXRmOEJ5dGVzLCB0b1V0ZjhTdHJpbmcsIHplcm9QYWRCeXRlcyB9IGZyb20gXCIuLi91dGlscy9pbmRleC5qc1wiO1xuLyoqXG4gKiAgRW5jb2RlcyAlJXRleHQlJSBhcyBhIEJ5dGVzMzIgc3RyaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlQnl0ZXMzMlN0cmluZyh0ZXh0KSB7XG4gICAgLy8gR2V0IHRoZSBieXRlc1xuICAgIGNvbnN0IGJ5dGVzID0gdG9VdGY4Qnl0ZXModGV4dCk7XG4gICAgLy8gQ2hlY2sgd2UgaGF2ZSByb29tIGZvciBudWxsLXRlcm1pbmF0aW9uXG4gICAgaWYgKGJ5dGVzLmxlbmd0aCA+IDMxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImJ5dGVzMzIgc3RyaW5nIG11c3QgYmUgbGVzcyB0aGFuIDMyIGJ5dGVzXCIpO1xuICAgIH1cbiAgICAvLyBaZXJvLXBhZCAoaW1wbGljaXRseSBudWxsLXRlcm1pbmF0ZXMpXG4gICAgcmV0dXJuIHplcm9QYWRCeXRlcyhieXRlcywgMzIpO1xufVxuLyoqXG4gKiAgRW5jb2RlcyB0aGUgQnl0ZXMzMi1lbmNvZGVkICUlYnl0ZXMlJSBpbnRvIGEgc3RyaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlQnl0ZXMzMlN0cmluZyhfYnl0ZXMpIHtcbiAgICBjb25zdCBkYXRhID0gZ2V0Qnl0ZXMoX2J5dGVzLCBcImJ5dGVzXCIpO1xuICAgIC8vIE11c3QgYmUgMzIgYnl0ZXMgd2l0aCBhIG51bGwtdGVybWluYXRpb25cbiAgICBpZiAoZGF0YS5sZW5ndGggIT09IDMyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgYnl0ZXMzMiAtIG5vdCAzMiBieXRlcyBsb25nXCIpO1xuICAgIH1cbiAgICBpZiAoZGF0YVszMV0gIT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBieXRlczMyIHN0cmluZyAtIG5vIG51bGwgdGVybWluYXRvclwiKTtcbiAgICB9XG4gICAgLy8gRmluZCB0aGUgbnVsbCB0ZXJtaW5hdGlvblxuICAgIGxldCBsZW5ndGggPSAzMTtcbiAgICB3aGlsZSAoZGF0YVtsZW5ndGggLSAxXSA9PT0gMCkge1xuICAgICAgICBsZW5ndGgtLTtcbiAgICB9XG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBzdHJpbmcgdmFsdWVcbiAgICByZXR1cm4gdG9VdGY4U3RyaW5nKGRhdGEuc2xpY2UoMCwgbGVuZ3RoKSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1ieXRlczMyLmpzLm1hcCIsImltcG9ydCB7IEludGVyZmFjZSB9IGZyb20gXCIuLi9hYmkvaW5kZXguanNcIjtcbmltcG9ydCB7IGdldENyZWF0ZUFkZHJlc3MgfSBmcm9tIFwiLi4vYWRkcmVzcy9pbmRleC5qc1wiO1xuaW1wb3J0IHsgY29uY2F0LCBkZWZpbmVQcm9wZXJ0aWVzLCBnZXRCeXRlcywgaGV4bGlmeSwgYXNzZXJ0LCBhc3NlcnRBcmd1bWVudCB9IGZyb20gXCIuLi91dGlscy9pbmRleC5qc1wiO1xuaW1wb3J0IHsgQmFzZUNvbnRyYWN0LCBjb3B5T3ZlcnJpZGVzLCByZXNvbHZlQXJncyB9IGZyb20gXCIuL2NvbnRyYWN0LmpzXCI7XG4vLyBBID0gQXJndW1lbnRzIHRvIHRoZSBjb25zdHJ1Y3RvclxuLy8gSSA9IEludGVyZmFjZSBvZiBkZXBsb3llZCBjb250cmFjdHNcbi8qKlxuICogIEEgKipDb250cmFjdEZhY3RvcnkqKiBpcyB1c2VkIHRvIGRlcGxveSBhIENvbnRyYWN0IHRvIHRoZSBibG9ja2NoYWluLlxuICovXG5leHBvcnQgY2xhc3MgQ29udHJhY3RGYWN0b3J5IHtcbiAgICAvKipcbiAgICAgKiAgVGhlIENvbnRyYWN0IEludGVyZmFjZS5cbiAgICAgKi9cbiAgICBpbnRlcmZhY2U7XG4gICAgLyoqXG4gICAgICogIFRoZSBDb250cmFjdCBkZXBsb3ltZW50IGJ5dGVjb2RlLiBPZnRlbiBjYWxsZWQgdGhlIGluaXRjb2RlLlxuICAgICAqL1xuICAgIGJ5dGVjb2RlO1xuICAgIC8qKlxuICAgICAqICBUaGUgQ29udHJhY3RSdW5uZXIgdG8gZGVwbG95IHRoZSBDb250cmFjdCBhcy5cbiAgICAgKi9cbiAgICBydW5uZXI7XG4gICAgLyoqXG4gICAgICogIENyZWF0ZSBhIG5ldyAqKkNvbnRyYWN0RmFjdG9yeSoqIHdpdGggJSVhYmklJSBhbmQgJSVieXRlY29kZSUlLFxuICAgICAqICBvcHRpb25hbGx5IGNvbm5lY3RlZCB0byAlJXJ1bm5lciUlLlxuICAgICAqXG4gICAgICogIFRoZSAlJWJ5dGVjb2RlJSUgbWF5IGJlIHRoZSBgYGJ5dGVjb2RlYGAgcHJvcGVydHkgd2l0aGluIHRoZVxuICAgICAqICBzdGFuZGFyZCBTb2xpZGl0eSBKU09OIG91dHB1dC5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihhYmksIGJ5dGVjb2RlLCBydW5uZXIpIHtcbiAgICAgICAgY29uc3QgaWZhY2UgPSBJbnRlcmZhY2UuZnJvbShhYmkpO1xuICAgICAgICAvLyBEZXJlZmVyZW5jZSBTb2xpZGl0eSBieXRlY29kZSBvYmplY3RzIGFuZCBhbGxvdyBhIG1pc3NpbmcgYDB4YC1wcmVmaXhcbiAgICAgICAgaWYgKGJ5dGVjb2RlIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgICAgICAgICAgYnl0ZWNvZGUgPSBoZXhsaWZ5KGdldEJ5dGVzKGJ5dGVjb2RlKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIChieXRlY29kZSkgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICBieXRlY29kZSA9IGJ5dGVjb2RlLm9iamVjdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghYnl0ZWNvZGUuc3RhcnRzV2l0aChcIjB4XCIpKSB7XG4gICAgICAgICAgICAgICAgYnl0ZWNvZGUgPSBcIjB4XCIgKyBieXRlY29kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ5dGVjb2RlID0gaGV4bGlmeShnZXRCeXRlcyhieXRlY29kZSkpO1xuICAgICAgICB9XG4gICAgICAgIGRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICAgICAgYnl0ZWNvZGUsIGludGVyZmFjZTogaWZhY2UsIHJ1bm5lcjogKHJ1bm5lciB8fCBudWxsKVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXR0YWNoKHRhcmdldCkge1xuICAgICAgICByZXR1cm4gbmV3IEJhc2VDb250cmFjdCh0YXJnZXQsIHRoaXMuaW50ZXJmYWNlLCB0aGlzLnJ1bm5lcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqICBSZXNvbHZlcyB0byB0aGUgdHJhbnNhY3Rpb24gdG8gZGVwbG95IHRoZSBjb250cmFjdCwgcGFzc2luZyAlJWFyZ3MlJVxuICAgICAqICBpbnRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICAgKi9cbiAgICBhc3luYyBnZXREZXBsb3lUcmFuc2FjdGlvbiguLi5hcmdzKSB7XG4gICAgICAgIGxldCBvdmVycmlkZXMgPSB7fTtcbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSB0aGlzLmludGVyZmFjZS5kZXBsb3k7XG4gICAgICAgIGlmIChmcmFnbWVudC5pbnB1dHMubGVuZ3RoICsgMSA9PT0gYXJncy5sZW5ndGgpIHtcbiAgICAgICAgICAgIG92ZXJyaWRlcyA9IGF3YWl0IGNvcHlPdmVycmlkZXMoYXJncy5wb3AoKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZyYWdtZW50LmlucHV0cy5sZW5ndGggIT09IGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbmNvcnJlY3QgbnVtYmVyIG9mIGFyZ3VtZW50cyB0byBjb25zdHJ1Y3RvclwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXNvbHZlZEFyZ3MgPSBhd2FpdCByZXNvbHZlQXJncyh0aGlzLnJ1bm5lciwgZnJhZ21lbnQuaW5wdXRzLCBhcmdzKTtcbiAgICAgICAgY29uc3QgZGF0YSA9IGNvbmNhdChbdGhpcy5ieXRlY29kZSwgdGhpcy5pbnRlcmZhY2UuZW5jb2RlRGVwbG95KHJlc29sdmVkQXJncyldKTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlcywgeyBkYXRhIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgUmVzb2x2ZXMgdG8gdGhlIENvbnRyYWN0IGRlcGxveWVkIGJ5IHBhc3NpbmcgJSVhcmdzJSUgaW50byB0aGVcbiAgICAgKiAgY29uc3RydWN0b3IuXG4gICAgICpcbiAgICAgKiAgVGhpcyB3aWxsIHJlc29sdmUgdG8gdGhlIENvbnRyYWN0IGJlZm9yZSBpdCBoYXMgYmVlbiBkZXBsb3llZCB0byB0aGVcbiAgICAgKiAgbmV0d29yaywgc28gdGhlIFtbQmFzZUNvbnRyYWN0LXdhaXRGb3JEZXBsb3ltZW50XV0gc2hvdWxkIGJlIHVzZWQgYmVmb3JlXG4gICAgICogIHNlbmRpbmcgYW55IHRyYW5zYWN0aW9ucyB0byBpdC5cbiAgICAgKi9cbiAgICBhc3luYyBkZXBsb3koLi4uYXJncykge1xuICAgICAgICBjb25zdCB0eCA9IGF3YWl0IHRoaXMuZ2V0RGVwbG95VHJhbnNhY3Rpb24oLi4uYXJncyk7XG4gICAgICAgIGFzc2VydCh0aGlzLnJ1bm5lciAmJiB0eXBlb2YgKHRoaXMucnVubmVyLnNlbmRUcmFuc2FjdGlvbikgPT09IFwiZnVuY3Rpb25cIiwgXCJmYWN0b3J5IHJ1bm5lciBkb2VzIG5vdCBzdXBwb3J0IHNlbmRpbmcgdHJhbnNhY3Rpb25zXCIsIFwiVU5TVVBQT1JURURfT1BFUkFUSU9OXCIsIHtcbiAgICAgICAgICAgIG9wZXJhdGlvbjogXCJzZW5kVHJhbnNhY3Rpb25cIlxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgc2VudFR4ID0gYXdhaXQgdGhpcy5ydW5uZXIuc2VuZFRyYW5zYWN0aW9uKHR4KTtcbiAgICAgICAgY29uc3QgYWRkcmVzcyA9IGdldENyZWF0ZUFkZHJlc3Moc2VudFR4KTtcbiAgICAgICAgcmV0dXJuIG5ldyBCYXNlQ29udHJhY3QoYWRkcmVzcywgdGhpcy5pbnRlcmZhY2UsIHRoaXMucnVubmVyLCBzZW50VHgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgUmV0dXJuIGEgbmV3ICoqQ29udHJhY3RGYWN0b3J5Kiogd2l0aCB0aGUgc2FtZSBBQkkgYW5kIGJ5dGVjb2RlLFxuICAgICAqICBidXQgY29ubmVjdGVkIHRvICUlcnVubmVyJSUuXG4gICAgICovXG4gICAgY29ubmVjdChydW5uZXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb250cmFjdEZhY3RvcnkodGhpcy5pbnRlcmZhY2UsIHRoaXMuYnl0ZWNvZGUsIHJ1bm5lcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqICBDcmVhdGUgYSBuZXcgKipDb250cmFjdEZhY3RvcnkqKiBmcm9tIHRoZSBzdGFuZGFyZCBTb2xpZGl0eSBKU09OIG91dHB1dC5cbiAgICAgKi9cbiAgICBzdGF0aWMgZnJvbVNvbGlkaXR5KG91dHB1dCwgcnVubmVyKSB7XG4gICAgICAgIGFzc2VydEFyZ3VtZW50KG91dHB1dCAhPSBudWxsLCBcImJhZCBjb21waWxlciBvdXRwdXRcIiwgXCJvdXRwdXRcIiwgb3V0cHV0KTtcbiAgICAgICAgaWYgKHR5cGVvZiAob3V0cHV0KSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgb3V0cHV0ID0gSlNPTi5wYXJzZShvdXRwdXQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFiaSA9IG91dHB1dC5hYmk7XG4gICAgICAgIGxldCBieXRlY29kZSA9IFwiXCI7XG4gICAgICAgIGlmIChvdXRwdXQuYnl0ZWNvZGUpIHtcbiAgICAgICAgICAgIGJ5dGVjb2RlID0gb3V0cHV0LmJ5dGVjb2RlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG91dHB1dC5ldm0gJiYgb3V0cHV0LmV2bS5ieXRlY29kZSkge1xuICAgICAgICAgICAgYnl0ZWNvZGUgPSBvdXRwdXQuZXZtLmJ5dGVjb2RlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgdGhpcyhhYmksIGJ5dGVjb2RlLCBydW5uZXIpO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZhY3RvcnkuanMubWFwIiwiLyoqXG4gKiAgVGhlcmUgYXJlIG1hbnkgYXdlc29tZSBjb21tdW5pdHkgc2VydmljZXMgdGhhdCBwcm92aWRlIEV0aGVyZXVtXG4gKiAgbm9kZXMgYm90aCBmb3IgZGV2ZWxvcGVycyBqdXN0IHN0YXJ0aW5nIG91dCBhbmQgZm9yIGxhcmdlLXNjYWxlXG4gKiAgY29tbXVuaXRpZXMuXG4gKlxuICogIEBfc2VjdGlvbjogYXBpL3Byb3ZpZGVycy90aGlyZHBhcnR5OiBDb21tdW5pdHkgUHJvdmlkZXJzICBbdGhpcmRwYXJ0eV1cbiAqL1xuLy8gU2hvdyB0aGUgdGhyb3R0bGUgbWVzc2FnZSBvbmx5IG9uY2UgcGVyIHNlcnZpY2VcbmNvbnN0IHNob3duID0gbmV3IFNldCgpO1xuLyoqXG4gKiAgRGlzcGxheXMgYSB3YXJuaW5nIGluIHRoZSBjb25zb2xlIHdoZW4gdGhlIGNvbW11bml0eSByZXNvdXJjZSBpc1xuICogIGJlaW5nIHVzZWQgdG9vIGhlYXZpbHkgYnkgdGhlIGFwcCwgcmVjb21tZW5kaW5nIHRoZSBkZXZlbG9wZXJcbiAqICBhY3F1aXJlIHRoZWlyIG93biBjcmVkZW50aWFscyBpbnN0ZWFkIG9mIHVzaW5nIHRoZSBjb21tdW5pdHlcbiAqICBjcmVkZW50aWFscy5cbiAqXG4gKiAgVGhlIG5vdGlmaWNhdGlvbiB3aWxsIG9ubHkgb2NjdXIgb25jZSBwZXIgc2VydmljZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dUaHJvdHRsZU1lc3NhZ2Uoc2VydmljZSkge1xuICAgIGlmIChzaG93bi5oYXMoc2VydmljZSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzaG93bi5hZGQoc2VydmljZSk7XG4gICAgY29uc29sZS5sb2coXCI9PT09PT09PT0gTk9USUNFID09PT09PT09PVwiKTtcbiAgICBjb25zb2xlLmxvZyhgUmVxdWVzdC1SYXRlIEV4Y2VlZGVkIGZvciAke3NlcnZpY2V9ICh0aGlzIG1lc3NhZ2Ugd2lsbCBub3QgYmUgcmVwZWF0ZWQpYCk7XG4gICAgY29uc29sZS5sb2coXCJcIik7XG4gICAgY29uc29sZS5sb2coXCJUaGUgZGVmYXVsdCBBUEkga2V5cyBmb3IgZWFjaCBzZXJ2aWNlIGFyZSBwcm92aWRlZCBhcyBhIGhpZ2hseS10aHJvdHRsZWQsXCIpO1xuICAgIGNvbnNvbGUubG9nKFwiY29tbXVuaXR5IHJlc291cmNlIGZvciBsb3ctdHJhZmZpYyBwcm9qZWN0cyBhbmQgZWFybHkgcHJvdG90eXBpbmcuXCIpO1xuICAgIGNvbnNvbGUubG9nKFwiXCIpO1xuICAgIGNvbnNvbGUubG9nKFwiV2hpbGUgeW91ciBhcHBsaWNhdGlvbiB3aWxsIGNvbnRpbnVlIHRvIGZ1bmN0aW9uLCB3ZSBoaWdobHkgcmVjb21tZW5kZWRcIik7XG4gICAgY29uc29sZS5sb2coXCJzaWduaW5nIHVwIGZvciB5b3VyIG93biBBUEkga2V5cyB0byBpbXByb3ZlIHBlcmZvcm1hbmNlLCBpbmNyZWFzZSB5b3VyXCIpO1xuICAgIGNvbnNvbGUubG9nKFwicmVxdWVzdCByYXRlL2xpbWl0IGFuZCBlbmFibGUgb3RoZXIgcGVya3MsIHN1Y2ggYXMgbWV0cmljcyBhbmQgYWR2YW5jZWQgQVBJcy5cIik7XG4gICAgY29uc29sZS5sb2coXCJcIik7XG4gICAgY29uc29sZS5sb2coXCJGb3IgbW9yZSBkZXRhaWxzOiBodHRwczovXFwvZG9jcy5ldGhlcnMub3JnL2FwaS1rZXlzL1wiKTtcbiAgICBjb25zb2xlLmxvZyhcIj09PT09PT09PT09PT09PT09PT09PT09PT09XCIpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29tbXVuaXR5LmpzLm1hcCIsIi8qKlxuICogIFtbbGluay1hbmtyXV0gcHJvdmlkZXMgYSB0aGlyZC1wYXJ0eSBzZXJ2aWNlIGZvciBjb25uZWN0aW5nIHRvXG4gKiAgdmFyaW91cyBibG9ja2NoYWlucyBvdmVyIEpTT04tUlBDLlxuICpcbiAqICAqKlN1cHBvcnRlZCBOZXR3b3JrcyoqXG4gKlxuICogIC0gRXRoZXJldW0gTWFpbm5ldCAoYGBtYWlubmV0YGApXG4gKiAgLSBHb2VybGkgVGVzdG5ldCAoYGBnb2VybGlgYClcbiAqICAtIFNlcG9saWEgVGVzdG5ldCAoYGBzZXBvbGlhYGApXG4gKiAgLSBBcmJpdHJ1bSAoYGBhcmJpdHJ1bWBgKVxuICogIC0gQmFzZSAoYGBiYXNlYGApXG4gKiAgLSBCYXNlIEdvZXJsaWEgVGVzdG5ldCAoYGBiYXNlLWdvZXJsaWBgKVxuICogIC0gQmFzZSBTZXBvbGlhIFRlc3RuZXQgKGBgYmFzZS1zZXBvbGlhYGApXG4gKiAgLSBCTkIgKGBgYm5iYGApXG4gKiAgLSBCTkIgVGVzdG5ldCAoYGBibmJ0YGApXG4gKiAgLSBPcHRpbWlzbSAoYGBvcHRpbWlzbWBgKVxuICogIC0gT3B0aW1pc20gR29lcmxpIFRlc3RuZXQgKGBgb3B0aW1pc20tZ29lcmxpYGApXG4gKiAgLSBPcHRpbWlzbSBTZXBvbGlhIFRlc3RuZXQgKGBgb3B0aW1pc20tc2Vwb2xpYWBgKVxuICogIC0gUG9seWdvbiAoYGBtYXRpY2BgKVxuICogIC0gUG9seWdvbiBNdW1iYWkgVGVzdG5ldCAoYGBtYXRpYy1tdW1iYWlgYClcbiAqXG4gKiAgQF9zdWJzZWN0aW9uOiBhcGkvcHJvdmlkZXJzL3RoaXJkcGFydHk6QW5rciAgW3Byb3ZpZGVycy1hbmtyXVxuICovXG5pbXBvcnQgeyBkZWZpbmVQcm9wZXJ0aWVzLCBGZXRjaFJlcXVlc3QsIGFzc2VydEFyZ3VtZW50IH0gZnJvbSBcIi4uL3V0aWxzL2luZGV4LmpzXCI7XG5pbXBvcnQgeyBzaG93VGhyb3R0bGVNZXNzYWdlIH0gZnJvbSBcIi4vY29tbXVuaXR5LmpzXCI7XG5pbXBvcnQgeyBOZXR3b3JrIH0gZnJvbSBcIi4vbmV0d29yay5qc1wiO1xuaW1wb3J0IHsgSnNvblJwY1Byb3ZpZGVyIH0gZnJvbSBcIi4vcHJvdmlkZXItanNvbnJwYy5qc1wiO1xuY29uc3QgZGVmYXVsdEFwaUtleSA9IFwiOWY3ZDkyOWIwMThjZGZmYjMzODUxN2VmYTA2ZjU4MzU5ZTg2ZmYxZmZkMzUwYmM4ODk3Mzg1MjM2NTllNzk3MlwiO1xuZnVuY3Rpb24gZ2V0SG9zdChuYW1lKSB7XG4gICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgIGNhc2UgXCJtYWlubmV0XCI6XG4gICAgICAgICAgICByZXR1cm4gXCJycGMuYW5rci5jb20vZXRoXCI7XG4gICAgICAgIGNhc2UgXCJnb2VybGlcIjpcbiAgICAgICAgICAgIHJldHVybiBcInJwYy5hbmtyLmNvbS9ldGhfZ29lcmxpXCI7XG4gICAgICAgIGNhc2UgXCJzZXBvbGlhXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJycGMuYW5rci5jb20vZXRoX3NlcG9saWFcIjtcbiAgICAgICAgY2FzZSBcImFyYml0cnVtXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJycGMuYW5rci5jb20vYXJiaXRydW1cIjtcbiAgICAgICAgY2FzZSBcImJhc2VcIjpcbiAgICAgICAgICAgIHJldHVybiBcInJwYy5hbmtyLmNvbS9iYXNlXCI7XG4gICAgICAgIGNhc2UgXCJiYXNlLWdvZXJsaVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwicnBjLmFua3IuY29tL2Jhc2VfZ29lcmxpXCI7XG4gICAgICAgIGNhc2UgXCJiYXNlLXNlcG9saWFcIjpcbiAgICAgICAgICAgIHJldHVybiBcInJwYy5hbmtyLmNvbS9iYXNlX3NlcG9saWFcIjtcbiAgICAgICAgY2FzZSBcImJuYlwiOlxuICAgICAgICAgICAgcmV0dXJuIFwicnBjLmFua3IuY29tL2JzY1wiO1xuICAgICAgICBjYXNlIFwiYm5idFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwicnBjLmFua3IuY29tL2JzY190ZXN0bmV0X2NoYXBlbFwiO1xuICAgICAgICBjYXNlIFwibWF0aWNcIjpcbiAgICAgICAgICAgIHJldHVybiBcInJwYy5hbmtyLmNvbS9wb2x5Z29uXCI7XG4gICAgICAgIGNhc2UgXCJtYXRpYy1tdW1iYWlcIjpcbiAgICAgICAgICAgIHJldHVybiBcInJwYy5hbmtyLmNvbS9wb2x5Z29uX211bWJhaVwiO1xuICAgICAgICBjYXNlIFwib3B0aW1pc21cIjpcbiAgICAgICAgICAgIHJldHVybiBcInJwYy5hbmtyLmNvbS9vcHRpbWlzbVwiO1xuICAgICAgICBjYXNlIFwib3B0aW1pc20tZ29lcmxpXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJycGMuYW5rci5jb20vb3B0aW1pc21fdGVzdG5ldFwiO1xuICAgICAgICBjYXNlIFwib3B0aW1pc20tc2Vwb2xpYVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwicnBjLmFua3IuY29tL29wdGltaXNtX3NlcG9saWFcIjtcbiAgICB9XG4gICAgYXNzZXJ0QXJndW1lbnQoZmFsc2UsIFwidW5zdXBwb3J0ZWQgbmV0d29ya1wiLCBcIm5ldHdvcmtcIiwgbmFtZSk7XG59XG4vKipcbiAqICBUaGUgKipBbmtyUHJvdmlkZXIqKiBjb25uZWN0cyB0byB0aGUgW1tsaW5rLWFua3JdXVxuICogIEpTT04tUlBDIGVuZC1wb2ludHMuXG4gKlxuICogIEJ5IGRlZmF1bHQsIGEgaGlnaGx5LXRocm90dGxlZCBBUEkga2V5IGlzIHVzZWQsIHdoaWNoIGlzXG4gKiAgYXBwcm9wcmlhdGUgZm9yIHF1aWNrIHByb3RvdHlwZXMgYW5kIHNpbXBsZSBzY3JpcHRzLiBUb1xuICogIGdhaW4gYWNjZXNzIHRvIGFuIGluY3JlYXNlZCByYXRlLWxpbWl0LCBpdCBpcyBoaWdobHlcbiAqICByZWNvbW1lbmRlZCB0byBbc2lnbiB1cCBoZXJlXShsaW5rLWFua3Itc2lnbnVwKS5cbiAqL1xuZXhwb3J0IGNsYXNzIEFua3JQcm92aWRlciBleHRlbmRzIEpzb25ScGNQcm92aWRlciB7XG4gICAgLyoqXG4gICAgICogIFRoZSBBUEkga2V5IGZvciB0aGUgQW5rciBjb25uZWN0aW9uLlxuICAgICAqL1xuICAgIGFwaUtleTtcbiAgICAvKipcbiAgICAgKiAgQ3JlYXRlIGEgbmV3ICoqQW5rclByb3ZpZGVyKiouXG4gICAgICpcbiAgICAgKiAgQnkgZGVmYXVsdCBjb25uZWN0aW5nIHRvIGBgbWFpbm5ldGBgIHdpdGggYSBoaWdobHkgdGhyb3R0bGVkXG4gICAgICogIEFQSSBrZXkuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoX25ldHdvcmssIGFwaUtleSkge1xuICAgICAgICBpZiAoX25ldHdvcmsgPT0gbnVsbCkge1xuICAgICAgICAgICAgX25ldHdvcmsgPSBcIm1haW5uZXRcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXR3b3JrID0gTmV0d29yay5mcm9tKF9uZXR3b3JrKTtcbiAgICAgICAgaWYgKGFwaUtleSA9PSBudWxsKSB7XG4gICAgICAgICAgICBhcGlLZXkgPSBkZWZhdWx0QXBpS2V5O1xuICAgICAgICB9XG4gICAgICAgIC8vIEFua3IgZG9lcyBub3Qgc3VwcG9ydCBmaWx0ZXJJZCwgc28gd2UgZm9yY2UgcG9sbGluZ1xuICAgICAgICBjb25zdCBvcHRpb25zID0geyBwb2xsaW5nOiB0cnVlLCBzdGF0aWNOZXR3b3JrOiBuZXR3b3JrIH07XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBBbmtyUHJvdmlkZXIuZ2V0UmVxdWVzdChuZXR3b3JrLCBhcGlLZXkpO1xuICAgICAgICBzdXBlcihyZXF1ZXN0LCBuZXR3b3JrLCBvcHRpb25zKTtcbiAgICAgICAgZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7IGFwaUtleSB9KTtcbiAgICB9XG4gICAgX2dldFByb3ZpZGVyKGNoYWluSWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQW5rclByb3ZpZGVyKGNoYWluSWQsIHRoaXMuYXBpS2V5KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHsgfVxuICAgICAgICByZXR1cm4gc3VwZXIuX2dldFByb3ZpZGVyKGNoYWluSWQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgUmV0dXJucyBhIHByZXBhcmVkIHJlcXVlc3QgZm9yIGNvbm5lY3RpbmcgdG8gJSVuZXR3b3JrJSUgd2l0aFxuICAgICAqICAlJWFwaUtleSUlLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRSZXF1ZXN0KG5ldHdvcmssIGFwaUtleSkge1xuICAgICAgICBpZiAoYXBpS2V5ID09IG51bGwpIHtcbiAgICAgICAgICAgIGFwaUtleSA9IGRlZmF1bHRBcGlLZXk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IG5ldyBGZXRjaFJlcXVlc3QoYGh0dHBzOi9cXC8ke2dldEhvc3QobmV0d29yay5uYW1lKX0vJHthcGlLZXl9YCk7XG4gICAgICAgIHJlcXVlc3QuYWxsb3dHemlwID0gdHJ1ZTtcbiAgICAgICAgaWYgKGFwaUtleSA9PT0gZGVmYXVsdEFwaUtleSkge1xuICAgICAgICAgICAgcmVxdWVzdC5yZXRyeUZ1bmMgPSBhc3luYyAocmVxdWVzdCwgcmVzcG9uc2UsIGF0dGVtcHQpID0+IHtcbiAgICAgICAgICAgICAgICBzaG93VGhyb3R0bGVNZXNzYWdlKFwiQW5rclByb3ZpZGVyXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9XG4gICAgZ2V0UnBjRXJyb3IocGF5bG9hZCwgZXJyb3IpIHtcbiAgICAgICAgaWYgKHBheWxvYWQubWV0aG9kID09PSBcImV0aF9zZW5kUmF3VHJhbnNhY3Rpb25cIikge1xuICAgICAgICAgICAgaWYgKGVycm9yICYmIGVycm9yLmVycm9yICYmIGVycm9yLmVycm9yLm1lc3NhZ2UgPT09IFwiSU5URVJOQUxfRVJST1I6IGNvdWxkIG5vdCByZXBsYWNlIGV4aXN0aW5nIHR4XCIpIHtcbiAgICAgICAgICAgICAgICBlcnJvci5lcnJvci5tZXNzYWdlID0gXCJyZXBsYWNlbWVudCB0cmFuc2FjdGlvbiB1bmRlcnByaWNlZFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXBlci5nZXRScGNFcnJvcihwYXlsb2FkLCBlcnJvcik7XG4gICAgfVxuICAgIGlzQ29tbXVuaXR5UmVzb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5hcGlLZXkgPT09IGRlZmF1bHRBcGlLZXkpO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByb3ZpZGVyLWFua3IuanMubWFwIiwiLyoqXG4gKiAgW1tsaW5rLWFsY2hlbXldXSBwcm92aWRlcyBhIHRoaXJkLXBhcnR5IHNlcnZpY2UgZm9yIGNvbm5lY3RpbmcgdG9cbiAqICB2YXJpb3VzIGJsb2NrY2hhaW5zIG92ZXIgSlNPTi1SUEMuXG4gKlxuICogICoqU3VwcG9ydGVkIE5ldHdvcmtzKipcbiAqXG4gKiAgLSBFdGhlcmV1bSBNYWlubmV0IChgYG1haW5uZXRgYClcbiAqICAtIEdvZXJsaSBUZXN0bmV0IChgYGdvZXJsaWBgKVxuICogIC0gU2Vwb2xpYSBUZXN0bmV0IChgYHNlcG9saWFgYClcbiAqICAtIEFyYml0cnVtIChgYGFyYml0cnVtYGApXG4gKiAgLSBBcmJpdHJ1bSBHb2VybGkgVGVzdG5ldCAoYGBhcmJpdHJ1bS1nb2VybGlgYClcbiAqICAtIEFyYml0cnVtIFNlcG9saWEgVGVzdG5ldCAoYGBhcmJpdHJ1bS1zZXBvbGlhYGApXG4gKiAgLSBCYXNlIChgYGJhc2VgYClcbiAqICAtIEJhc2UgR29lcmxpYSBUZXN0bmV0IChgYGJhc2UtZ29lcmxpYGApXG4gKiAgLSBCYXNlIFNlcG9saWEgVGVzdG5ldCAoYGBiYXNlLXNlcG9saWFgYClcbiAqICAtIE9wdGltaXNtIChgYG9wdGltaXNtYGApXG4gKiAgLSBPcHRpbWlzbSBHb2VybGkgVGVzdG5ldCAoYGBvcHRpbWlzbS1nb2VybGlgYClcbiAqICAtIE9wdGltaXNtIFNlcG9saWEgVGVzdG5ldCAoYGBvcHRpbWlzbS1zZXBvbGlhYGApXG4gKiAgLSBQb2x5Z29uIChgYG1hdGljYGApXG4gKiAgLSBQb2x5Z29uIEFtb3kgVGVzdG5ldCAoYGBtYXRpYy1hbW95YGApXG4gKiAgLSBQb2x5Z29uIE11bWJhaSBUZXN0bmV0IChgYG1hdGljLW11bWJhaWBgKVxuICpcbiAqICBAX3N1YnNlY3Rpb246IGFwaS9wcm92aWRlcnMvdGhpcmRwYXJ0eTpBbGNoZW15ICBbcHJvdmlkZXJzLWFsY2hlbXldXG4gKi9cbmltcG9ydCB7IGRlZmluZVByb3BlcnRpZXMsIHJlc29sdmVQcm9wZXJ0aWVzLCBhc3NlcnQsIGFzc2VydEFyZ3VtZW50LCBGZXRjaFJlcXVlc3QgfSBmcm9tIFwiLi4vdXRpbHMvaW5kZXguanNcIjtcbmltcG9ydCB7IHNob3dUaHJvdHRsZU1lc3NhZ2UgfSBmcm9tIFwiLi9jb21tdW5pdHkuanNcIjtcbmltcG9ydCB7IE5ldHdvcmsgfSBmcm9tIFwiLi9uZXR3b3JrLmpzXCI7XG5pbXBvcnQgeyBKc29uUnBjUHJvdmlkZXIgfSBmcm9tIFwiLi9wcm92aWRlci1qc29ucnBjLmpzXCI7XG5jb25zdCBkZWZhdWx0QXBpS2V5ID0gXCJfZ2c3d1NTaTBLTUJzZEtuR1ZmSER1ZXE2eE1COUVrQ1wiO1xuZnVuY3Rpb24gZ2V0SG9zdChuYW1lKSB7XG4gICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgIGNhc2UgXCJtYWlubmV0XCI6XG4gICAgICAgICAgICByZXR1cm4gXCJldGgtbWFpbm5ldC5hbGNoZW15YXBpLmlvXCI7XG4gICAgICAgIGNhc2UgXCJnb2VybGlcIjpcbiAgICAgICAgICAgIHJldHVybiBcImV0aC1nb2VybGkuZy5hbGNoZW15LmNvbVwiO1xuICAgICAgICBjYXNlIFwic2Vwb2xpYVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiZXRoLXNlcG9saWEuZy5hbGNoZW15LmNvbVwiO1xuICAgICAgICBjYXNlIFwiYXJiaXRydW1cIjpcbiAgICAgICAgICAgIHJldHVybiBcImFyYi1tYWlubmV0LmcuYWxjaGVteS5jb21cIjtcbiAgICAgICAgY2FzZSBcImFyYml0cnVtLWdvZXJsaVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiYXJiLWdvZXJsaS5nLmFsY2hlbXkuY29tXCI7XG4gICAgICAgIGNhc2UgXCJhcmJpdHJ1bS1zZXBvbGlhXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJhcmItc2Vwb2xpYS5nLmFsY2hlbXkuY29tXCI7XG4gICAgICAgIGNhc2UgXCJiYXNlXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJiYXNlLW1haW5uZXQuZy5hbGNoZW15LmNvbVwiO1xuICAgICAgICBjYXNlIFwiYmFzZS1nb2VybGlcIjpcbiAgICAgICAgICAgIHJldHVybiBcImJhc2UtZ29lcmxpLmcuYWxjaGVteS5jb21cIjtcbiAgICAgICAgY2FzZSBcImJhc2Utc2Vwb2xpYVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiYmFzZS1zZXBvbGlhLmcuYWxjaGVteS5jb21cIjtcbiAgICAgICAgY2FzZSBcIm1hdGljXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJwb2x5Z29uLW1haW5uZXQuZy5hbGNoZW15LmNvbVwiO1xuICAgICAgICBjYXNlIFwibWF0aWMtYW1veVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwicG9seWdvbi1hbW95LmcuYWxjaGVteS5jb21cIjtcbiAgICAgICAgY2FzZSBcIm1hdGljLW11bWJhaVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwicG9seWdvbi1tdW1iYWkuZy5hbGNoZW15LmNvbVwiO1xuICAgICAgICBjYXNlIFwib3B0aW1pc21cIjpcbiAgICAgICAgICAgIHJldHVybiBcIm9wdC1tYWlubmV0LmcuYWxjaGVteS5jb21cIjtcbiAgICAgICAgY2FzZSBcIm9wdGltaXNtLWdvZXJsaVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwib3B0LWdvZXJsaS5nLmFsY2hlbXkuY29tXCI7XG4gICAgICAgIGNhc2UgXCJvcHRpbWlzbS1zZXBvbGlhXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJvcHQtc2Vwb2xpYS5nLmFsY2hlbXkuY29tXCI7XG4gICAgfVxuICAgIGFzc2VydEFyZ3VtZW50KGZhbHNlLCBcInVuc3VwcG9ydGVkIG5ldHdvcmtcIiwgXCJuZXR3b3JrXCIsIG5hbWUpO1xufVxuLyoqXG4gKiAgVGhlICoqQWxjaGVteVByb3ZpZGVyKiogY29ubmVjdHMgdG8gdGhlIFtbbGluay1hbGNoZW15XV1cbiAqICBKU09OLVJQQyBlbmQtcG9pbnRzLlxuICpcbiAqICBCeSBkZWZhdWx0LCBhIGhpZ2hseS10aHJvdHRsZWQgQVBJIGtleSBpcyB1c2VkLCB3aGljaCBpc1xuICogIGFwcHJvcHJpYXRlIGZvciBxdWljayBwcm90b3R5cGVzIGFuZCBzaW1wbGUgc2NyaXB0cy4gVG9cbiAqICBnYWluIGFjY2VzcyB0byBhbiBpbmNyZWFzZWQgcmF0ZS1saW1pdCwgaXQgaXMgaGlnaGx5XG4gKiAgcmVjb21tZW5kZWQgdG8gW3NpZ24gdXAgaGVyZV0obGluay1hbGNoZW15LXNpZ251cCkuXG4gKlxuICogIEBfZG9jbG9jOiBhcGkvcHJvdmlkZXJzL3RoaXJkcGFydHlcbiAqL1xuZXhwb3J0IGNsYXNzIEFsY2hlbXlQcm92aWRlciBleHRlbmRzIEpzb25ScGNQcm92aWRlciB7XG4gICAgYXBpS2V5O1xuICAgIGNvbnN0cnVjdG9yKF9uZXR3b3JrLCBhcGlLZXkpIHtcbiAgICAgICAgaWYgKF9uZXR3b3JrID09IG51bGwpIHtcbiAgICAgICAgICAgIF9uZXR3b3JrID0gXCJtYWlubmV0XCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV0d29yayA9IE5ldHdvcmsuZnJvbShfbmV0d29yayk7XG4gICAgICAgIGlmIChhcGlLZXkgPT0gbnVsbCkge1xuICAgICAgICAgICAgYXBpS2V5ID0gZGVmYXVsdEFwaUtleTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gQWxjaGVteVByb3ZpZGVyLmdldFJlcXVlc3QobmV0d29yaywgYXBpS2V5KTtcbiAgICAgICAgc3VwZXIocmVxdWVzdCwgbmV0d29yaywgeyBzdGF0aWNOZXR3b3JrOiBuZXR3b3JrIH0pO1xuICAgICAgICBkZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHsgYXBpS2V5IH0pO1xuICAgIH1cbiAgICBfZ2V0UHJvdmlkZXIoY2hhaW5JZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBBbGNoZW15UHJvdmlkZXIoY2hhaW5JZCwgdGhpcy5hcGlLZXkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikgeyB9XG4gICAgICAgIHJldHVybiBzdXBlci5fZ2V0UHJvdmlkZXIoY2hhaW5JZCk7XG4gICAgfVxuICAgIGFzeW5jIF9wZXJmb3JtKHJlcSkge1xuICAgICAgICAvLyBodHRwczovL2RvY3MuYWxjaGVteS5jb20vcmVmZXJlbmNlL3RyYWNlLXRyYW5zYWN0aW9uXG4gICAgICAgIGlmIChyZXEubWV0aG9kID09PSBcImdldFRyYW5zYWN0aW9uUmVzdWx0XCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgdHJhY2UsIHR4IH0gPSBhd2FpdCByZXNvbHZlUHJvcGVydGllcyh7XG4gICAgICAgICAgICAgICAgdHJhY2U6IHRoaXMuc2VuZChcInRyYWNlX3RyYW5zYWN0aW9uXCIsIFtyZXEuaGFzaF0pLFxuICAgICAgICAgICAgICAgIHR4OiB0aGlzLmdldFRyYW5zYWN0aW9uKHJlcS5oYXNoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodHJhY2UgPT0gbnVsbCB8fCB0eCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgZGF0YTtcbiAgICAgICAgICAgIGxldCBlcnJvciA9IGZhbHNlO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBkYXRhID0gdHJhY2VbMF0ucmVzdWx0Lm91dHB1dDtcbiAgICAgICAgICAgICAgICBlcnJvciA9ICh0cmFjZVswXS5lcnJvciA9PT0gXCJSZXZlcnRlZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikgeyB9XG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIGFzc2VydCghZXJyb3IsIFwiYW4gZXJyb3Igb2NjdXJyZWQgZHVyaW5nIHRyYW5zYWN0aW9uIGV4ZWN1dGlvbnNcIiwgXCJDQUxMX0VYQ0VQVElPTlwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJnZXRUcmFuc2FjdGlvblJlc3VsdFwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgICAgICAgICByZWFzb246IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uOiB0eCxcbiAgICAgICAgICAgICAgICAgICAgaW52b2NhdGlvbjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgcmV2ZXJ0OiBudWxsIC8vIEBUT0RPXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhc3NlcnQoZmFsc2UsIFwiY291bGQgbm90IHBhcnNlIHRyYWNlIHJlc3VsdFwiLCBcIkJBRF9EQVRBXCIsIHsgdmFsdWU6IHRyYWNlIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhd2FpdCBzdXBlci5fcGVyZm9ybShyZXEpO1xuICAgIH1cbiAgICBpc0NvbW11bml0eVJlc291cmNlKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuYXBpS2V5ID09PSBkZWZhdWx0QXBpS2V5KTtcbiAgICB9XG4gICAgc3RhdGljIGdldFJlcXVlc3QobmV0d29yaywgYXBpS2V5KSB7XG4gICAgICAgIGlmIChhcGlLZXkgPT0gbnVsbCkge1xuICAgICAgICAgICAgYXBpS2V5ID0gZGVmYXVsdEFwaUtleTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gbmV3IEZldGNoUmVxdWVzdChgaHR0cHM6L1xcLyR7Z2V0SG9zdChuZXR3b3JrLm5hbWUpfS92Mi8ke2FwaUtleX1gKTtcbiAgICAgICAgcmVxdWVzdC5hbGxvd0d6aXAgPSB0cnVlO1xuICAgICAgICBpZiAoYXBpS2V5ID09PSBkZWZhdWx0QXBpS2V5KSB7XG4gICAgICAgICAgICByZXF1ZXN0LnJldHJ5RnVuYyA9IGFzeW5jIChyZXF1ZXN0LCByZXNwb25zZSwgYXR0ZW1wdCkgPT4ge1xuICAgICAgICAgICAgICAgIHNob3dUaHJvdHRsZU1lc3NhZ2UoXCJhbGNoZW15XCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcm92aWRlci1hbGNoZW15LmpzLm1hcCIsIi8qKlxuICogIFtbbGluay1jaGFpbnN0YWNrXV0gcHJvdmlkZXMgYSB0aGlyZC1wYXJ0eSBzZXJ2aWNlIGZvciBjb25uZWN0aW5nIHRvXG4gKiAgdmFyaW91cyBibG9ja2NoYWlucyBvdmVyIEpTT04tUlBDLlxuICpcbiAqICAqKlN1cHBvcnRlZCBOZXR3b3JrcyoqXG4gKlxuICogIC0gRXRoZXJldW0gTWFpbm5ldCAoYGBtYWlubmV0YGApXG4gKiAgLSBBcmJpdHJ1bSAoYGBhcmJpdHJ1bWBgKVxuICogIC0gQk5CIFNtYXJ0IENoYWluIE1haW5uZXQgKGBgYm5iYGApXG4gKiAgLSBQb2x5Z29uIChgYG1hdGljYGApXG4gKlxuICogIEBfc3Vic2VjdGlvbjogYXBpL3Byb3ZpZGVycy90aGlyZHBhcnR5OkNoYWluc3RhY2sgIFtwcm92aWRlcnMtY2hhaW5zdGFja11cbiAqL1xuaW1wb3J0IHsgZGVmaW5lUHJvcGVydGllcywgRmV0Y2hSZXF1ZXN0LCBhc3NlcnRBcmd1bWVudCB9IGZyb20gXCIuLi91dGlscy9pbmRleC5qc1wiO1xuaW1wb3J0IHsgc2hvd1Rocm90dGxlTWVzc2FnZSB9IGZyb20gXCIuL2NvbW11bml0eS5qc1wiO1xuaW1wb3J0IHsgTmV0d29yayB9IGZyb20gXCIuL25ldHdvcmsuanNcIjtcbmltcG9ydCB7IEpzb25ScGNQcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLWpzb25ycGMuanNcIjtcbmZ1bmN0aW9uIGdldEFwaUtleShuYW1lKSB7XG4gICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgIGNhc2UgXCJtYWlubmV0XCI6IHJldHVybiBcIjM5ZjFkNjdjZWRmOGI3ODMxMDEwYTY2NTMyOGM5MTk3XCI7XG4gICAgICAgIGNhc2UgXCJhcmJpdHJ1bVwiOiByZXR1cm4gXCIwNTUwYzIwOWRiMzNjM2FiZjRjYzkyN2UxZTE4Y2VhMVwiO1xuICAgICAgICBjYXNlIFwiYm5iXCI6IHJldHVybiBcIjk4YjVhNzdlNTMxNjE0Mzg3MzY2ZjZmYzVkYTA5N2Y4XCI7XG4gICAgICAgIGNhc2UgXCJtYXRpY1wiOiByZXR1cm4gXCJjZDlkNGQ3MDM3NzQ3MWFhN2MxNDJlYzRhNDIwNTI0OVwiO1xuICAgIH1cbiAgICBhc3NlcnRBcmd1bWVudChmYWxzZSwgXCJ1bnN1cHBvcnRlZCBuZXR3b3JrXCIsIFwibmV0d29ya1wiLCBuYW1lKTtcbn1cbmZ1bmN0aW9uIGdldEhvc3QobmFtZSkge1xuICAgIHN3aXRjaCAobmFtZSkge1xuICAgICAgICBjYXNlIFwibWFpbm5ldFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiZXRoZXJldW0tbWFpbm5ldC5jb3JlLmNoYWluc3RhY2suY29tXCI7XG4gICAgICAgIGNhc2UgXCJhcmJpdHJ1bVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiYXJiaXRydW0tbWFpbm5ldC5jb3JlLmNoYWluc3RhY2suY29tXCI7XG4gICAgICAgIGNhc2UgXCJibmJcIjpcbiAgICAgICAgICAgIHJldHVybiBcImJzYy1tYWlubmV0LmNvcmUuY2hhaW5zdGFjay5jb21cIjtcbiAgICAgICAgY2FzZSBcIm1hdGljXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJwb2x5Z29uLW1haW5uZXQuY29yZS5jaGFpbnN0YWNrLmNvbVwiO1xuICAgIH1cbiAgICBhc3NlcnRBcmd1bWVudChmYWxzZSwgXCJ1bnN1cHBvcnRlZCBuZXR3b3JrXCIsIFwibmV0d29ya1wiLCBuYW1lKTtcbn1cbi8qKlxuICogIFRoZSAqKkNoYWluc3RhY2tQcm92aWRlcioqIGNvbm5lY3RzIHRvIHRoZSBbW2xpbmstY2hhaW5zdGFja11dXG4gKiAgSlNPTi1SUEMgZW5kLXBvaW50cy5cbiAqXG4gKiAgQnkgZGVmYXVsdCwgYSBoaWdobHktdGhyb3R0bGVkIEFQSSBrZXkgaXMgdXNlZCwgd2hpY2ggaXNcbiAqICBhcHByb3ByaWF0ZSBmb3IgcXVpY2sgcHJvdG90eXBlcyBhbmQgc2ltcGxlIHNjcmlwdHMuIFRvXG4gKiAgZ2FpbiBhY2Nlc3MgdG8gYW4gaW5jcmVhc2VkIHJhdGUtbGltaXQsIGl0IGlzIGhpZ2hseVxuICogIHJlY29tbWVuZGVkIHRvIFtzaWduIHVwIGhlcmVdKGxpbmstY2hhaW5zdGFjaykuXG4gKi9cbmV4cG9ydCBjbGFzcyBDaGFpbnN0YWNrUHJvdmlkZXIgZXh0ZW5kcyBKc29uUnBjUHJvdmlkZXIge1xuICAgIC8qKlxuICAgICAqICBUaGUgQVBJIGtleSBmb3IgdGhlIENoYWluc3RhY2sgY29ubmVjdGlvbi5cbiAgICAgKi9cbiAgICBhcGlLZXk7XG4gICAgLyoqXG4gICAgICogIENyZWF0ZXMgYSBuZXcgKipDaGFpbnN0YWNrUHJvdmlkZXIqKi5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihfbmV0d29yaywgYXBpS2V5KSB7XG4gICAgICAgIGlmIChfbmV0d29yayA9PSBudWxsKSB7XG4gICAgICAgICAgICBfbmV0d29yayA9IFwibWFpbm5ldFwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ldHdvcmsgPSBOZXR3b3JrLmZyb20oX25ldHdvcmspO1xuICAgICAgICBpZiAoYXBpS2V5ID09IG51bGwpIHtcbiAgICAgICAgICAgIGFwaUtleSA9IGdldEFwaUtleShuZXR3b3JrLm5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBDaGFpbnN0YWNrUHJvdmlkZXIuZ2V0UmVxdWVzdChuZXR3b3JrLCBhcGlLZXkpO1xuICAgICAgICBzdXBlcihyZXF1ZXN0LCBuZXR3b3JrLCB7IHN0YXRpY05ldHdvcms6IG5ldHdvcmsgfSk7XG4gICAgICAgIGRlZmluZVByb3BlcnRpZXModGhpcywgeyBhcGlLZXkgfSk7XG4gICAgfVxuICAgIF9nZXRQcm92aWRlcihjaGFpbklkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IENoYWluc3RhY2tQcm92aWRlcihjaGFpbklkLCB0aGlzLmFwaUtleSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7IH1cbiAgICAgICAgcmV0dXJuIHN1cGVyLl9nZXRQcm92aWRlcihjaGFpbklkKTtcbiAgICB9XG4gICAgaXNDb21tdW5pdHlSZXNvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmFwaUtleSA9PT0gZ2V0QXBpS2V5KHRoaXMuX25ldHdvcmsubmFtZSkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgUmV0dXJucyBhIHByZXBhcmVkIHJlcXVlc3QgZm9yIGNvbm5lY3RpbmcgdG8gJSVuZXR3b3JrJSVcbiAgICAgKiAgd2l0aCAlJWFwaUtleSUlIGFuZCAlJXByb2plY3RTZWNyZXQlJS5cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0UmVxdWVzdChuZXR3b3JrLCBhcGlLZXkpIHtcbiAgICAgICAgaWYgKGFwaUtleSA9PSBudWxsKSB7XG4gICAgICAgICAgICBhcGlLZXkgPSBnZXRBcGlLZXkobmV0d29yay5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gbmV3IEZldGNoUmVxdWVzdChgaHR0cHM6L1xcLyR7Z2V0SG9zdChuZXR3b3JrLm5hbWUpfS8ke2FwaUtleX1gKTtcbiAgICAgICAgcmVxdWVzdC5hbGxvd0d6aXAgPSB0cnVlO1xuICAgICAgICBpZiAoYXBpS2V5ID09PSBnZXRBcGlLZXkobmV0d29yay5uYW1lKSkge1xuICAgICAgICAgICAgcmVxdWVzdC5yZXRyeUZ1bmMgPSBhc3luYyAocmVxdWVzdCwgcmVzcG9uc2UsIGF0dGVtcHQpID0+IHtcbiAgICAgICAgICAgICAgICBzaG93VGhyb3R0bGVNZXNzYWdlKFwiQ2hhaW5zdGFja1Byb3ZpZGVyXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcm92aWRlci1jaGFpbnN0YWNrLmpzLm1hcCIsIi8qKlxuICogIEFib3V0IENsb3VkZmxhcmVcbiAqXG4gKiAgQF9zdWJzZWN0aW9uOiBhcGkvcHJvdmlkZXJzL3RoaXJkcGFydHk6Q2xvdWRmbGFyZSAgW3Byb3ZpZGVycy1jbG91ZGZsYXJlXVxuICovXG5pbXBvcnQgeyBhc3NlcnRBcmd1bWVudCB9IGZyb20gXCIuLi91dGlscy9pbmRleC5qc1wiO1xuaW1wb3J0IHsgTmV0d29yayB9IGZyb20gXCIuL25ldHdvcmsuanNcIjtcbmltcG9ydCB7IEpzb25ScGNQcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLWpzb25ycGMuanNcIjtcbi8qKlxuICogIEFib3V0IENsb3VkZmxhcmUuLi5cbiAqL1xuZXhwb3J0IGNsYXNzIENsb3VkZmxhcmVQcm92aWRlciBleHRlbmRzIEpzb25ScGNQcm92aWRlciB7XG4gICAgY29uc3RydWN0b3IoX25ldHdvcmspIHtcbiAgICAgICAgaWYgKF9uZXR3b3JrID09IG51bGwpIHtcbiAgICAgICAgICAgIF9uZXR3b3JrID0gXCJtYWlubmV0XCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV0d29yayA9IE5ldHdvcmsuZnJvbShfbmV0d29yayk7XG4gICAgICAgIGFzc2VydEFyZ3VtZW50KG5ldHdvcmsubmFtZSA9PT0gXCJtYWlubmV0XCIsIFwidW5zdXBwb3J0ZWQgbmV0d29ya1wiLCBcIm5ldHdvcmtcIiwgX25ldHdvcmspO1xuICAgICAgICBzdXBlcihcImh0dHBzOi9cXC9jbG91ZGZsYXJlLWV0aC5jb20vXCIsIG5ldHdvcmssIHsgc3RhdGljTmV0d29yazogbmV0d29yayB9KTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcm92aWRlci1jbG91ZGZsYXJlLmpzLm1hcCIsIi8qKlxuICogIFtbbGluay1ldGhlcnNjYW5dXSBwcm92aWRlcyBhIHRoaXJkLXBhcnR5IHNlcnZpY2UgZm9yIGNvbm5lY3RpbmcgdG9cbiAqICB2YXJpb3VzIGJsb2NrY2hhaW5zIG92ZXIgYSBjb21iaW5hdGlvbiBvZiBKU09OLVJQQyBhbmQgY3VzdG9tIEFQSVxuICogIGVuZHBvaW50cy5cbiAqXG4gKiAgKipTdXBwb3J0ZWQgTmV0d29ya3MqKlxuICpcbiAqICAtIEV0aGVyZXVtIE1haW5uZXQgKGBgbWFpbm5ldGBgKVxuICogIC0gR29lcmxpIFRlc3RuZXQgKGBgZ29lcmxpYGApXG4gKiAgLSBTZXBvbGlhIFRlc3RuZXQgKGBgc2Vwb2xpYWBgKVxuICogIC0gSG9sZXNreSBUZXN0bmV0IChgYGhvbGVza3lgYClcbiAqICAtIEFyYml0cnVtIChgYGFyYml0cnVtYGApXG4gKiAgLSBBcmJpdHJ1bSBHb2VybGkgVGVzdG5ldCAoYGBhcmJpdHJ1bS1nb2VybGlgYClcbiAqICAtIEJhc2UgKGBgYmFzZWBgKVxuICogIC0gQmFzZSBTZXBvbGlhIFRlc3RuZXQgKGBgYmFzZS1zZXBvbGlhYGApXG4gKiAgLSBCTkIgU21hcnQgQ2hhaW4gTWFpbm5ldCAoYGBibmJgYClcbiAqICAtIEJOQiBTbWFydCBDaGFpbiBUZXN0bmV0IChgYGJuYnRgYClcbiAqICAtIE9wdGltaXNtIChgYG9wdGltaXNtYGApXG4gKiAgLSBPcHRpbWlzbSBHb2VybGkgVGVzdG5ldCAoYGBvcHRpbWlzbS1nb2VybGlgYClcbiAqICAtIFBvbHlnb24gKGBgbWF0aWNgYClcbiAqICAtIFBvbHlnb24gTXVtYmFpIFRlc3RuZXQgKGBgbWF0aWMtbXVtYmFpYGApXG4gKiAgLSBQb2x5Z29uIEFtb3kgVGVzdG5ldCAoYGBtYXRpYy1hbW95YGApXG4gKlxuICogIEBfc3Vic2VjdGlvbiBhcGkvcHJvdmlkZXJzL3RoaXJkcGFydHk6RXRoZXJzY2FuICBbcHJvdmlkZXJzLWV0aGVyc2Nhbl1cbiAqL1xuaW1wb3J0IHsgQWJpQ29kZXIgfSBmcm9tIFwiLi4vYWJpL2luZGV4LmpzXCI7XG5pbXBvcnQgeyBDb250cmFjdCB9IGZyb20gXCIuLi9jb250cmFjdC9pbmRleC5qc1wiO1xuaW1wb3J0IHsgYWNjZXNzTGlzdGlmeSwgVHJhbnNhY3Rpb24gfSBmcm9tIFwiLi4vdHJhbnNhY3Rpb24vaW5kZXguanNcIjtcbmltcG9ydCB7IGRlZmluZVByb3BlcnRpZXMsIGhleGxpZnksIHRvUXVhbnRpdHksIEZldGNoUmVxdWVzdCwgYXNzZXJ0LCBhc3NlcnRBcmd1bWVudCwgaXNFcnJvciwgXG4vLyAgICBwYXJzZVVuaXRzLFxudG9VdGY4U3RyaW5nIH0gZnJvbSBcIi4uL3V0aWxzL2luZGV4LmpzXCI7XG5pbXBvcnQgeyBBYnN0cmFjdFByb3ZpZGVyIH0gZnJvbSBcIi4vYWJzdHJhY3QtcHJvdmlkZXIuanNcIjtcbmltcG9ydCB7IE5ldHdvcmsgfSBmcm9tIFwiLi9uZXR3b3JrLmpzXCI7XG5pbXBvcnQgeyBOZXR3b3JrUGx1Z2luIH0gZnJvbSBcIi4vcGx1Z2lucy1uZXR3b3JrLmpzXCI7XG5pbXBvcnQgeyBzaG93VGhyb3R0bGVNZXNzYWdlIH0gZnJvbSBcIi4vY29tbXVuaXR5LmpzXCI7XG5jb25zdCBUSFJPVFRMRSA9IDIwMDA7XG5mdW5jdGlvbiBpc1Byb21pc2UodmFsdWUpIHtcbiAgICByZXR1cm4gKHZhbHVlICYmIHR5cGVvZiAodmFsdWUudGhlbikgPT09IFwiZnVuY3Rpb25cIik7XG59XG5jb25zdCBFdGhlcnNjYW5QbHVnaW5JZCA9IFwib3JnLmV0aGVycy5wbHVnaW5zLnByb3ZpZGVyLkV0aGVyc2NhblwiO1xuLyoqXG4gKiAgQSBOZXR3b3JrIGNhbiBpbmNsdWRlIGFuICoqRXRoZXJzY2FuUGx1Z2luKiogdG8gcHJvdmlkZVxuICogIGEgY3VzdG9tIGJhc2UgVVJMLlxuICpcbiAqICBAX2RvY2xvYzogYXBpL3Byb3ZpZGVycy90aGlyZHBhcnR5OkV0aGVyc2NhblxuICovXG5leHBvcnQgY2xhc3MgRXRoZXJzY2FuUGx1Z2luIGV4dGVuZHMgTmV0d29ya1BsdWdpbiB7XG4gICAgLyoqXG4gICAgICogIFRoZSBFdGhlcnNjYW4gQVBJIGJhc2UgVVJMLlxuICAgICAqL1xuICAgIGJhc2VVcmw7XG4gICAgLyoqXG4gICAgICogIENyZWF0ZXMgYSBuZXcgKipFdGhlcnNjYW5Qcm92aWRlcioqIHdoaWNoIHdpbGwgdXNlXG4gICAgICogICUlYmFzZVVybCUlLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGJhc2VVcmwpIHtcbiAgICAgICAgc3VwZXIoRXRoZXJzY2FuUGx1Z2luSWQpO1xuICAgICAgICBkZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHsgYmFzZVVybCB9KTtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgRXRoZXJzY2FuUGx1Z2luKHRoaXMuYmFzZVVybCk7XG4gICAgfVxufVxuY29uc3Qgc2tpcEtleXMgPSBbXCJlbmFibGVDY2lwUmVhZFwiXTtcbmxldCBuZXh0SWQgPSAxO1xuLyoqXG4gKiAgVGhlICoqRXRoZXJzY2FuQmFzZVByb3ZpZGVyKiogaXMgdGhlIHN1cGVyLWNsYXNzIG9mXG4gKiAgW1tFdGhlcnNjYW5Qcm92aWRlcl1dLCB3aGljaCBzaG91bGQgZ2VuZXJhbGx5IGJlIHVzZWQgaW5zdGVhZC5cbiAqXG4gKiAgU2luY2UgdGhlICoqRXRoZXJzY2FuUHJvdmlkZXIqKiBpbmNsdWRlcyBhZGRpdGlvbmFsIGNvZGUgZm9yXG4gKiAgW1tDb250cmFjdF1dIGFjY2VzcywgaW4gLy9yYXJlIGNhc2VzLy8gdGhhdCBjb250cmFjdHMgYXJlIG5vdFxuICogIHVzZWQsIHRoaXMgY2xhc3MgY2FuIHJlZHVjZSBjb2RlIHNpemUuXG4gKlxuICogIEBfZG9jbG9jOiBhcGkvcHJvdmlkZXJzL3RoaXJkcGFydHk6RXRoZXJzY2FuXG4gKi9cbmV4cG9ydCBjbGFzcyBFdGhlcnNjYW5Qcm92aWRlciBleHRlbmRzIEFic3RyYWN0UHJvdmlkZXIge1xuICAgIC8qKlxuICAgICAqICBUaGUgY29ubmVjdGVkIG5ldHdvcmsuXG4gICAgICovXG4gICAgbmV0d29yaztcbiAgICAvKipcbiAgICAgKiAgVGhlIEFQSSBrZXkgb3IgbnVsbCBpZiB1c2luZyB0aGUgY29tbXVuaXR5IHByb3ZpZGVkIGJhbmR3aWR0aC5cbiAgICAgKi9cbiAgICBhcGlLZXk7XG4gICAgI3BsdWdpbjtcbiAgICAvKipcbiAgICAgKiAgQ3JlYXRlcyBhIG5ldyAqKkV0aGVyc2NhbkJhc2VQcm92aWRlcioqLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKF9uZXR3b3JrLCBfYXBpS2V5KSB7XG4gICAgICAgIGNvbnN0IGFwaUtleSA9IChfYXBpS2V5ICE9IG51bGwpID8gX2FwaUtleSA6IG51bGw7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGNvbnN0IG5ldHdvcmsgPSBOZXR3b3JrLmZyb20oX25ldHdvcmspO1xuICAgICAgICB0aGlzLiNwbHVnaW4gPSBuZXR3b3JrLmdldFBsdWdpbihFdGhlcnNjYW5QbHVnaW5JZCk7XG4gICAgICAgIGRlZmluZVByb3BlcnRpZXModGhpcywgeyBhcGlLZXksIG5ldHdvcmsgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqICBSZXR1cm5zIHRoZSBiYXNlIFVSTC5cbiAgICAgKlxuICAgICAqICBJZiBhbiBbW0V0aGVyc2NhblBsdWdpbl1dIGlzIGNvbmZpZ3VyZWQgb24gdGhlXG4gICAgICogIFtbRXRoZXJzY2FuQmFzZVByb3ZpZGVyX25ldHdvcmtdXSwgcmV0dXJucyB0aGUgcGx1Z2luJ3NcbiAgICAgKiAgYmFzZVVybC5cbiAgICAgKlxuICAgICAqICBEZXByZWNhdGVkOyBmb3IgRXRoZXJzY2FuIHYyIHRoZSBiYXNlIGlzIG5vIGxvbmdlciBhIHNpbXBseVxuICAgICAqICBob3N0LCBidXQgaW5zdGVhZCBhIFVSTCBpbmNsdWRpbmcgYSBjaGFpbklkIHBhcmFtZXRlci4gQ2hhbmdpbmdcbiAgICAgKiAgdGhpcyB0byByZXR1cm4gYSBVUkwgcHJlZml4IGNvdWxkIGJyZWFrIHNvbWUgbGlicmFyaWVzLCBzbyBpdFxuICAgICAqICBpcyBsZWZ0IGludGFjdCBidXQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBmdXR1cmUgYXMgaXQgaXMgdW51c2VkLlxuICAgICAqL1xuICAgIGdldEJhc2VVcmwoKSB7XG4gICAgICAgIGlmICh0aGlzLiNwbHVnaW4pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiNwbHVnaW4uYmFzZVVybDtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKHRoaXMubmV0d29yay5uYW1lKSB7XG4gICAgICAgICAgICBjYXNlIFwibWFpbm5ldFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi9cXC9hcGkuZXRoZXJzY2FuLmlvXCI7XG4gICAgICAgICAgICBjYXNlIFwiZ29lcmxpXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2FwaS1nb2VybGkuZXRoZXJzY2FuLmlvXCI7XG4gICAgICAgICAgICBjYXNlIFwic2Vwb2xpYVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi9cXC9hcGktc2Vwb2xpYS5ldGhlcnNjYW4uaW9cIjtcbiAgICAgICAgICAgIGNhc2UgXCJob2xlc2t5XCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2FwaS1ob2xlc2t5LmV0aGVyc2Nhbi5pb1wiO1xuICAgICAgICAgICAgY2FzZSBcImFyYml0cnVtXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2FwaS5hcmJpc2Nhbi5pb1wiO1xuICAgICAgICAgICAgY2FzZSBcImFyYml0cnVtLWdvZXJsaVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi9cXC9hcGktZ29lcmxpLmFyYmlzY2FuLmlvXCI7XG4gICAgICAgICAgICBjYXNlIFwiYmFzZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi9cXC9hcGkuYmFzZXNjYW4ub3JnXCI7XG4gICAgICAgICAgICBjYXNlIFwiYmFzZS1zZXBvbGlhXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2FwaS1zZXBvbGlhLmJhc2VzY2FuLm9yZ1wiO1xuICAgICAgICAgICAgY2FzZSBcImJuYlwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi9cXC9hcGkuYnNjc2Nhbi5jb21cIjtcbiAgICAgICAgICAgIGNhc2UgXCJibmJ0XCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2FwaS10ZXN0bmV0LmJzY3NjYW4uY29tXCI7XG4gICAgICAgICAgICBjYXNlIFwibWF0aWNcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJodHRwczovXFwvYXBpLnBvbHlnb25zY2FuLmNvbVwiO1xuICAgICAgICAgICAgY2FzZSBcIm1hdGljLWFtb3lcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJodHRwczovXFwvYXBpLWFtb3kucG9seWdvbnNjYW4uY29tXCI7XG4gICAgICAgICAgICBjYXNlIFwibWF0aWMtbXVtYmFpXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2FwaS10ZXN0bmV0LnBvbHlnb25zY2FuLmNvbVwiO1xuICAgICAgICAgICAgY2FzZSBcIm9wdGltaXNtXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2FwaS1vcHRpbWlzdGljLmV0aGVyc2Nhbi5pb1wiO1xuICAgICAgICAgICAgY2FzZSBcIm9wdGltaXNtLWdvZXJsaVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi9cXC9hcGktZ29lcmxpLW9wdGltaXN0aWMuZXRoZXJzY2FuLmlvXCI7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICB9XG4gICAgICAgIGFzc2VydEFyZ3VtZW50KGZhbHNlLCBcInVuc3VwcG9ydGVkIG5ldHdvcmtcIiwgXCJuZXR3b3JrXCIsIHRoaXMubmV0d29yayk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqICBSZXR1cm5zIHRoZSBVUkwgZm9yIHRoZSAlJW1vZHVsZSUlIGFuZCAlJXBhcmFtcyUlLlxuICAgICAqL1xuICAgIGdldFVybChtb2R1bGUsIHBhcmFtcykge1xuICAgICAgICBsZXQgcXVlcnkgPSBPYmplY3Qua2V5cyhwYXJhbXMpLnJlZHVjZSgoYWNjdW0sIGtleSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJhbXNba2V5XTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgYWNjdW0gKz0gYCYke2tleX09JHt2YWx1ZX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFjY3VtO1xuICAgICAgICB9LCBcIlwiKTtcbiAgICAgICAgaWYgKHRoaXMuYXBpS2V5KSB7XG4gICAgICAgICAgICBxdWVyeSArPSBgJmFwaWtleT0ke3RoaXMuYXBpS2V5fWA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGBodHRwczovXFwvYXBpLmV0aGVyc2Nhbi5pby92Mi9hcGk/Y2hhaW5pZD0ke3RoaXMubmV0d29yay5jaGFpbklkfSZtb2R1bGU9JHttb2R1bGV9JHtxdWVyeX1gO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgUmV0dXJucyB0aGUgVVJMIGZvciB1c2luZyBQT1NUIHJlcXVlc3RzLlxuICAgICAqL1xuICAgIGdldFBvc3RVcmwoKSB7XG4gICAgICAgIHJldHVybiBgaHR0cHM6L1xcL2FwaS5ldGhlcnNjYW4uaW8vdjIvYXBpP2NoYWluaWQ9JHt0aGlzLm5ldHdvcmsuY2hhaW5JZH1gO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgUmV0dXJucyB0aGUgcGFyYW1ldGVycyBmb3IgdXNpbmcgUE9TVCByZXF1ZXN0cy5cbiAgICAgKi9cbiAgICBnZXRQb3N0RGF0YShtb2R1bGUsIHBhcmFtcykge1xuICAgICAgICBwYXJhbXMubW9kdWxlID0gbW9kdWxlO1xuICAgICAgICBwYXJhbXMuYXBpa2V5ID0gdGhpcy5hcGlLZXk7XG4gICAgICAgIHBhcmFtcy5jaGFpbmlkID0gdGhpcy5uZXR3b3JrLmNoYWluSWQ7XG4gICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfVxuICAgIGFzeW5jIGRldGVjdE5ldHdvcmsoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5ldHdvcms7XG4gICAgfVxuICAgIC8qKlxuICAgICAqICBSZXNvbHZlcyB0byB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgJSVtb2R1bGUlJSB3aXRoICUlcGFyYW1zJSUuXG4gICAgICpcbiAgICAgKiAgSWYgJSVwb3N0JSUsIHRoZSByZXF1ZXN0IGlzIG1hZGUgYXMgYSBQT1NUIHJlcXVlc3QuXG4gICAgICovXG4gICAgYXN5bmMgZmV0Y2gobW9kdWxlLCBwYXJhbXMsIHBvc3QpIHtcbiAgICAgICAgY29uc3QgaWQgPSBuZXh0SWQrKztcbiAgICAgICAgY29uc3QgdXJsID0gKHBvc3QgPyB0aGlzLmdldFBvc3RVcmwoKSA6IHRoaXMuZ2V0VXJsKG1vZHVsZSwgcGFyYW1zKSk7XG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSAocG9zdCA/IHRoaXMuZ2V0UG9zdERhdGEobW9kdWxlLCBwYXJhbXMpIDogbnVsbCk7XG4gICAgICAgIHRoaXMuZW1pdChcImRlYnVnXCIsIHsgYWN0aW9uOiBcInNlbmRSZXF1ZXN0XCIsIGlkLCB1cmwsIHBheWxvYWQ6IHBheWxvYWQgfSk7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBuZXcgRmV0Y2hSZXF1ZXN0KHVybCk7XG4gICAgICAgIHJlcXVlc3Quc2V0VGhyb3R0bGVQYXJhbXMoeyBzbG90SW50ZXJ2YWw6IDEwMDAgfSk7XG4gICAgICAgIHJlcXVlc3QucmV0cnlGdW5jID0gKHJlcSwgcmVzcCwgYXR0ZW1wdCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNDb21tdW5pdHlSZXNvdXJjZSgpKSB7XG4gICAgICAgICAgICAgICAgc2hvd1Rocm90dGxlTWVzc2FnZShcIkV0aGVyc2NhblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3QucHJvY2Vzc0Z1bmMgPSBhc3luYyAocmVxdWVzdCwgcmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc3BvbnNlLmhhc0JvZHkoKSA/IEpTT04ucGFyc2UodG9VdGY4U3RyaW5nKHJlc3BvbnNlLmJvZHkpKSA6IHt9O1xuICAgICAgICAgICAgY29uc3QgdGhyb3R0bGUgPSAoKHR5cGVvZiAocmVzdWx0LnJlc3VsdCkgPT09IFwic3RyaW5nXCIpID8gcmVzdWx0LnJlc3VsdCA6IFwiXCIpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihcInJhdGUgbGltaXRcIikgPj0gMDtcbiAgICAgICAgICAgIGlmIChtb2R1bGUgPT09IFwicHJveHlcIikge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgSlNPTiByZXNwb25zZSBpbmRpY2F0ZXMgd2UgYXJlIGJlaW5nIHRocm90dGxlZFxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN0YXR1cyA9PSAwICYmIHJlc3VsdC5tZXNzYWdlID09IFwiTk9UT0tcIiAmJiB0aHJvdHRsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoXCJkZWJ1Z1wiLCB7IGFjdGlvbjogXCJyZWNlaXZlRXJyb3JcIiwgaWQsIHJlYXNvbjogXCJwcm94eS1OT1RPS1wiLCBlcnJvcjogcmVzdWx0IH0pO1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZS50aHJvd1Rocm90dGxlRXJyb3IocmVzdWx0LnJlc3VsdCwgVEhST1RUTEUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0aHJvdHRsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoXCJkZWJ1Z1wiLCB7IGFjdGlvbjogXCJyZWNlaXZlRXJyb3JcIiwgaWQsIHJlYXNvbjogXCJudWxsIHJlc3VsdFwiLCBlcnJvcjogcmVzdWx0LnJlc3VsdCB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UudGhyb3dUaHJvdHRsZUVycm9yKHJlc3VsdC5yZXN1bHQsIFRIUk9UVExFKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChwYXlsb2FkKSB7XG4gICAgICAgICAgICByZXF1ZXN0LnNldEhlYWRlcihcImNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD1VVEYtOFwiKTtcbiAgICAgICAgICAgIHJlcXVlc3QuYm9keSA9IE9iamVjdC5rZXlzKHBheWxvYWQpLm1hcCgoaykgPT4gYCR7a309JHtwYXlsb2FkW2tdfWApLmpvaW4oXCImXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxdWVzdC5zZW5kKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXNwb25zZS5hc3NlcnRPaygpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwiZGVidWdcIiwgeyBhY3Rpb246IFwicmVjZWl2ZUVycm9yXCIsIGlkLCBlcnJvciwgcmVhc29uOiBcImFzc2VydE9rXCIgfSk7XG4gICAgICAgICAgICBhc3NlcnQoZmFsc2UsIFwicmVzcG9uc2UgZXJyb3JcIiwgXCJTRVJWRVJfRVJST1JcIiwgeyByZXF1ZXN0LCByZXNwb25zZSB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJlc3BvbnNlLmhhc0JvZHkoKSkge1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwiZGVidWdcIiwgeyBhY3Rpb246IFwicmVjZWl2ZUVycm9yXCIsIGlkLCBlcnJvcjogXCJtaXNzaW5nIGJvZHlcIiwgcmVhc29uOiBcIm51bGwgYm9keVwiIH0pO1xuICAgICAgICAgICAgYXNzZXJ0KGZhbHNlLCBcIm1pc3NpbmcgcmVzcG9uc2VcIiwgXCJTRVJWRVJfRVJST1JcIiwgeyByZXF1ZXN0LCByZXNwb25zZSB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN1bHQgPSBKU09OLnBhcnNlKHRvVXRmOFN0cmluZyhyZXNwb25zZS5ib2R5KSk7XG4gICAgICAgIGlmIChtb2R1bGUgPT09IFwicHJveHlcIikge1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5qc29ucnBjICE9IFwiMi4wXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoXCJkZWJ1Z1wiLCB7IGFjdGlvbjogXCJyZWNlaXZlRXJyb3JcIiwgaWQsIHJlc3VsdCwgcmVhc29uOiBcImludmFsaWQgSlNPTi1SUENcIiB9KTtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UsIFwiaW52YWxpZCBKU09OLVJQQyByZXNwb25zZSAobWlzc2luZyBqc29ucnBjPScyLjAnKVwiLCBcIlNFUlZFUl9FUlJPUlwiLCB7IHJlcXVlc3QsIHJlc3BvbnNlLCBpbmZvOiB7IHJlc3VsdCB9IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3VsdC5lcnJvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcImRlYnVnXCIsIHsgYWN0aW9uOiBcInJlY2VpdmVFcnJvclwiLCBpZCwgcmVzdWx0LCByZWFzb246IFwiSlNPTi1SUEMgZXJyb3JcIiB9KTtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UsIFwiZXJyb3IgcmVzcG9uc2VcIiwgXCJTRVJWRVJfRVJST1JcIiwgeyByZXF1ZXN0LCByZXNwb25zZSwgaW5mbzogeyByZXN1bHQgfSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZW1pdChcImRlYnVnXCIsIHsgYWN0aW9uOiBcInJlY2VpdmVSZXF1ZXN0XCIsIGlkLCByZXN1bHQgfSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGdldExvZ3MsIGdldEhpc3RvcnkgaGF2ZSB3ZWlyZCBzdWNjZXNzIHJlc3BvbnNlc1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT0gMCAmJiAocmVzdWx0Lm1lc3NhZ2UgPT09IFwiTm8gcmVjb3JkcyBmb3VuZFwiIHx8IHJlc3VsdC5tZXNzYWdlID09PSBcIk5vIHRyYW5zYWN0aW9ucyBmb3VuZFwiKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcImRlYnVnXCIsIHsgYWN0aW9uOiBcInJlY2VpdmVSZXF1ZXN0XCIsIGlkLCByZXN1bHQgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5yZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyAhPSAxIHx8ICh0eXBlb2YgKHJlc3VsdC5tZXNzYWdlKSA9PT0gXCJzdHJpbmdcIiAmJiAhcmVzdWx0Lm1lc3NhZ2UubWF0Y2goL15PSy8pKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcImRlYnVnXCIsIHsgYWN0aW9uOiBcInJlY2VpdmVFcnJvclwiLCBpZCwgcmVzdWx0IH0pO1xuICAgICAgICAgICAgICAgIGFzc2VydChmYWxzZSwgXCJlcnJvciByZXNwb25zZVwiLCBcIlNFUlZFUl9FUlJPUlwiLCB7IHJlcXVlc3QsIHJlc3BvbnNlLCBpbmZvOiB7IHJlc3VsdCB9IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5lbWl0KFwiZGVidWdcIiwgeyBhY3Rpb246IFwicmVjZWl2ZVJlcXVlc3RcIiwgaWQsIHJlc3VsdCB9KTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQucmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqICBSZXR1cm5zICUldHJhbnNhY3Rpb24lJSBub3JtYWxpemVkIGZvciB0aGUgRXRoZXJzY2FuIEFQSS5cbiAgICAgKi9cbiAgICBfZ2V0VHJhbnNhY3Rpb25Qb3N0RGF0YSh0cmFuc2FjdGlvbikge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICBpZiAoc2tpcEtleXMuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0cmFuc2FjdGlvbltrZXldID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRyYW5zYWN0aW9uW2tleV07XG4gICAgICAgICAgICBpZiAoa2V5ID09PSBcInR5cGVcIiAmJiB2YWx1ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGtleSA9PT0gXCJibG9ja1RhZ1wiICYmIHZhbHVlID09PSBcImxhdGVzdFwiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBRdWFudGl0eS10eXBlcyByZXF1aXJlIG5vIGxlYWRpbmcgemVybywgdW5sZXNzIDBcbiAgICAgICAgICAgIGlmICh7IHR5cGU6IHRydWUsIGdhc0xpbWl0OiB0cnVlLCBnYXNQcmljZTogdHJ1ZSwgbWF4RmVlUGVyR3M6IHRydWUsIG1heFByaW9yaXR5RmVlUGVyR2FzOiB0cnVlLCBub25jZTogdHJ1ZSwgdmFsdWU6IHRydWUgfVtrZXldKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0b1F1YW50aXR5KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleSA9PT0gXCJhY2Nlc3NMaXN0XCIpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IFwiW1wiICsgYWNjZXNzTGlzdGlmeSh2YWx1ZSkubWFwKChzZXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGB7YWRkcmVzczpcIiR7c2V0LmFkZHJlc3N9XCIsc3RvcmFnZUtleXM6W1wiJHtzZXQuc3RvcmFnZUtleXMuam9pbignXCIsXCInKX1cIl19YDtcbiAgICAgICAgICAgICAgICB9KS5qb2luKFwiLFwiKSArIFwiXVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5ID09PSBcImJsb2JWZXJzaW9uZWRIYXNoZXNcIikge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEBUT0RPOiB1cGRhdGUgdGhpcyBvbmNlIHRoZSBBUEkgc3VwcG9ydHMgYmxvYnNcbiAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UsIFwiRXRoZXJzY2FuIEFQSSBkb2VzIG5vdCBzdXBwb3J0IGJsb2JWZXJzaW9uZWRIYXNoZXNcIiwgXCJVTlNVUFBPUlRFRF9PUEVSQVRJT05cIiwge1xuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb246IFwiX2dldFRyYW5zYWN0aW9uUG9zdERhdGFcIixcbiAgICAgICAgICAgICAgICAgICAgaW5mbzogeyB0cmFuc2FjdGlvbiB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGhleGxpZnkodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgVGhyb3dzIHRoZSBub3JtYWxpemVkIEV0aGVyc2NhbiBlcnJvci5cbiAgICAgKi9cbiAgICBfY2hlY2tFcnJvcihyZXEsIGVycm9yLCB0cmFuc2FjdGlvbikge1xuICAgICAgICAvLyBQdWxsIGFueSBtZXNzYWdlIG91dCBpZiwgcG9zc2libGVcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBcIlwiO1xuICAgICAgICBpZiAoaXNFcnJvcihlcnJvciwgXCJTRVJWRVJfRVJST1JcIikpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBhbiBlcnJvciBlbWl0dGVkIGJ5IGEgcHJveHkgY2FsbFxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gZXJyb3IuaW5mby5yZXN1bHQuZXJyb3IubWVzc2FnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7IH1cbiAgICAgICAgICAgIGlmICghbWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBlcnJvci5pbmZvLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gXCJlc3RpbWF0ZUdhc1wiKSB7XG4gICAgICAgICAgICBpZiAoIW1lc3NhZ2UubWF0Y2goL3JldmVydC9pKSAmJiBtZXNzYWdlLm1hdGNoKC9pbnN1ZmZpY2llbnQgZnVuZHMvaSkpIHtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UsIFwiaW5zdWZmaWNpZW50IGZ1bmRzXCIsIFwiSU5TVUZGSUNJRU5UX0ZVTkRTXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb246IHJlcS50cmFuc2FjdGlvblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyZXEubWV0aG9kID09PSBcImNhbGxcIiB8fCByZXEubWV0aG9kID09PSBcImVzdGltYXRlR2FzXCIpIHtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLm1hdGNoKC9leGVjdXRpb24gcmV2ZXJ0ZWQvaSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IGVycm9yLmluZm8ucmVzdWx0LmVycm9yLmRhdGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikgeyB9XG4gICAgICAgICAgICAgICAgY29uc3QgZSA9IEFiaUNvZGVyLmdldEJ1aWx0aW5DYWxsRXhjZXB0aW9uKHJlcS5tZXRob2QsIHJlcS50cmFuc2FjdGlvbiwgZGF0YSk7XG4gICAgICAgICAgICAgICAgZS5pbmZvID0geyByZXF1ZXN0OiByZXEsIGVycm9yIH07XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobWVzc2FnZSkge1xuICAgICAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09IFwiYnJvYWRjYXN0VHJhbnNhY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uID0gVHJhbnNhY3Rpb24uZnJvbShyZXEuc2lnbmVkVHJhbnNhY3Rpb24pO1xuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLm1hdGNoKC9yZXBsYWNlbWVudC9pKSAmJiBtZXNzYWdlLm1hdGNoKC91bmRlcnByaWNlZC9pKSkge1xuICAgICAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UsIFwicmVwbGFjZW1lbnQgZmVlIHRvbyBsb3dcIiwgXCJSRVBMQUNFTUVOVF9VTkRFUlBSSUNFRFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UubWF0Y2goL2luc3VmZmljaWVudCBmdW5kcy8pKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChmYWxzZSwgXCJpbnN1ZmZpY2llbnQgZnVuZHMgZm9yIGludHJpbnNpYyB0cmFuc2FjdGlvbiBjb3N0XCIsIFwiSU5TVUZGSUNJRU5UX0ZVTkRTXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobWVzc2FnZS5tYXRjaCgvc2FtZSBoYXNoIHdhcyBhbHJlYWR5IGltcG9ydGVkfHRyYW5zYWN0aW9uIG5vbmNlIGlzIHRvbyBsb3d8bm9uY2UgdG9vIGxvdy8pKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChmYWxzZSwgXCJub25jZSBoYXMgYWxyZWFkeSBiZWVuIHVzZWRcIiwgXCJOT05DRV9FWFBJUkVEXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBTb21ldGhpbmcgd2UgY291bGQgbm90IHByb2Nlc3NcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICAgIGFzeW5jIF9kZXRlY3ROZXR3b3JrKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXR3b3JrO1xuICAgIH1cbiAgICBhc3luYyBfcGVyZm9ybShyZXEpIHtcbiAgICAgICAgc3dpdGNoIChyZXEubWV0aG9kKSB7XG4gICAgICAgICAgICBjYXNlIFwiY2hhaW5JZFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm5ldHdvcmsuY2hhaW5JZDtcbiAgICAgICAgICAgIGNhc2UgXCJnZXRCbG9ja051bWJlclwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZldGNoKFwicHJveHlcIiwgeyBhY3Rpb246IFwiZXRoX2Jsb2NrTnVtYmVyXCIgfSk7XG4gICAgICAgICAgICBjYXNlIFwiZ2V0R2FzUHJpY2VcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mZXRjaChcInByb3h5XCIsIHsgYWN0aW9uOiBcImV0aF9nYXNQcmljZVwiIH0pO1xuICAgICAgICAgICAgY2FzZSBcImdldFByaW9yaXR5RmVlXCI6XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0ZW1wb3JhcnkgdW50aWwgRXRoZXJzY2FuIGNvbXBsZXRlcyBzdXBwb3J0XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubmV0d29yay5uYW1lID09PSBcIm1haW5uZXRcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIxMDAwMDAwMDAwXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMubmV0d29yay5uYW1lID09PSBcIm9wdGltaXNtXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiMTAwMDAwMFwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZmFsbGJhY2sgb250byB0aGUgQWJzdHJhY3RQcm92aWRlciBkZWZhdWx0XCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIFdvcmtpbmcgd2l0aCBFdGhlcnNjYW4gdG8gZ2V0IHRoaXMgYWRkZWQ6XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRlc3QgPSBhd2FpdCB0aGlzLmZldGNoKFwicHJveHlcIiwge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwiZXRoX21heFByaW9yaXR5RmVlUGVyR2FzXCJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0ZXN0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVzdDtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRFQlVHXCIsIGUpO1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgLyogVGhpcyBtaWdodCBiZSBzYWZlOyBidXQgZHVlIHRvIHJvdW5kaW5nIG5laXRoZXIgbXlzZWxmXG4gICAgICAgICAgICAgICBvciBFdGhlcnNjYW4gYXJlIG5lY2Vzc2FyaWx5IGNvbWZvcnRhYmxlIHdpdGggdGhpcy4gOilcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5mZXRjaChcImdhc3RyYWNrZXJcIiwgeyBhY3Rpb246IFwiZ2Fzb3JhY2xlXCIgfSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0KTtcbiAgICAgICAgICAgICAgICBjb25zdCBnYXNQcmljZSA9IHBhcnNlVW5pdHMocmVzdWx0LlNhZmVHYXNQcmljZSwgXCJnd2VpXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VGZWUgPSBwYXJzZVVuaXRzKHJlc3VsdC5zdWdnZXN0QmFzZUZlZSwgXCJnd2VpXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByaW9yaXR5RmVlID0gZ2FzUHJpY2UgLSBiYXNlRmVlO1xuICAgICAgICAgICAgICAgIGlmIChwcmlvcml0eUZlZSA8IDApIHsgdGhyb3cgbmV3IEVycm9yKFwibmVnYXRpdmUgcHJpb3JpdHkgZmVlOyBkZWZlciB0byBhYnN0cmFjdCBwcm92aWRlciBkZWZhdWx0XCIpOyB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByaW9yaXR5RmVlO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRFQlVHXCIsIGVycm9yKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBjYXNlIFwiZ2V0QmFsYW5jZVwiOlxuICAgICAgICAgICAgICAgIC8vIFJldHVybnMgYmFzZS0xMCByZXN1bHRcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mZXRjaChcImFjY291bnRcIiwge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwiYmFsYW5jZVwiLFxuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiByZXEuYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgdGFnOiByZXEuYmxvY2tUYWdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhc2UgXCJnZXRUcmFuc2FjdGlvbkNvdW50XCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2goXCJwcm94eVwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJldGhfZ2V0VHJhbnNhY3Rpb25Db3VudFwiLFxuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiByZXEuYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgdGFnOiByZXEuYmxvY2tUYWdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhc2UgXCJnZXRDb2RlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2goXCJwcm94eVwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJldGhfZ2V0Q29kZVwiLFxuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiByZXEuYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgdGFnOiByZXEuYmxvY2tUYWdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhc2UgXCJnZXRTdG9yYWdlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2goXCJwcm94eVwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJldGhfZ2V0U3RvcmFnZUF0XCIsXG4gICAgICAgICAgICAgICAgICAgIGFkZHJlc3M6IHJlcS5hZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogcmVxLnBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICB0YWc6IHJlcS5ibG9ja1RhZ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2FzZSBcImJyb2FkY2FzdFRyYW5zYWN0aW9uXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2goXCJwcm94eVwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJldGhfc2VuZFJhd1RyYW5zYWN0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIGhleDogcmVxLnNpZ25lZFRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9jaGVja0Vycm9yKHJlcSwgZXJyb3IsIHJlcS5zaWduZWRUcmFuc2FjdGlvbik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjYXNlIFwiZ2V0QmxvY2tcIjpcbiAgICAgICAgICAgICAgICBpZiAoXCJibG9ja1RhZ1wiIGluIHJlcSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mZXRjaChcInByb3h5XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJldGhfZ2V0QmxvY2tCeU51bWJlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnOiByZXEuYmxvY2tUYWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBib29sZWFuOiAocmVxLmluY2x1ZGVUcmFuc2FjdGlvbnMgPyBcInRydWVcIiA6IFwiZmFsc2VcIilcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFzc2VydChmYWxzZSwgXCJnZXRCbG9jayBieSBibG9ja0hhc2ggbm90IHN1cHBvcnRlZCBieSBFdGhlcnNjYW5cIiwgXCJVTlNVUFBPUlRFRF9PUEVSQVRJT05cIiwge1xuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb246IFwiZ2V0QmxvY2soYmxvY2tIYXNoKVwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjYXNlIFwiZ2V0VHJhbnNhY3Rpb25cIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mZXRjaChcInByb3h5XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcImV0aF9nZXRUcmFuc2FjdGlvbkJ5SGFzaFwiLFxuICAgICAgICAgICAgICAgICAgICB0eGhhc2g6IHJlcS5oYXNoXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjYXNlIFwiZ2V0VHJhbnNhY3Rpb25SZWNlaXB0XCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2goXCJwcm94eVwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJldGhfZ2V0VHJhbnNhY3Rpb25SZWNlaXB0XCIsXG4gICAgICAgICAgICAgICAgICAgIHR4aGFzaDogcmVxLmhhc2hcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhc2UgXCJjYWxsXCI6IHtcbiAgICAgICAgICAgICAgICBpZiAocmVxLmJsb2NrVGFnICE9PSBcImxhdGVzdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV0aGVyc2NhblByb3ZpZGVyIGRvZXMgbm90IHN1cHBvcnQgYmxvY2tUYWcgZm9yIGNhbGxcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHBvc3REYXRhID0gdGhpcy5fZ2V0VHJhbnNhY3Rpb25Qb3N0RGF0YShyZXEudHJhbnNhY3Rpb24pO1xuICAgICAgICAgICAgICAgIHBvc3REYXRhLm1vZHVsZSA9IFwicHJveHlcIjtcbiAgICAgICAgICAgICAgICBwb3N0RGF0YS5hY3Rpb24gPSBcImV0aF9jYWxsXCI7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZmV0Y2goXCJwcm94eVwiLCBwb3N0RGF0YSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY2hlY2tFcnJvcihyZXEsIGVycm9yLCByZXEudHJhbnNhY3Rpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCJlc3RpbWF0ZUdhc1wiOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcG9zdERhdGEgPSB0aGlzLl9nZXRUcmFuc2FjdGlvblBvc3REYXRhKHJlcS50cmFuc2FjdGlvbik7XG4gICAgICAgICAgICAgICAgcG9zdERhdGEubW9kdWxlID0gXCJwcm94eVwiO1xuICAgICAgICAgICAgICAgIHBvc3REYXRhLmFjdGlvbiA9IFwiZXRoX2VzdGltYXRlR2FzXCI7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZmV0Y2goXCJwcm94eVwiLCBwb3N0RGF0YSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY2hlY2tFcnJvcihyZXEsIGVycm9yLCByZXEudHJhbnNhY3Rpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZ2V0TG9nc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTmVlZHMgdG8gY29tcGxhaW4gaWYgbW9yZSB0aGFuIG9uZSBhZGRyZXNzIGlzIHBhc3NlZCBpblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFyZ3M6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7IGFjdGlvbjogXCJnZXRMb2dzXCIgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXIuZnJvbUJsb2NrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MuZnJvbUJsb2NrID0gY2hlY2tMb2dUYWcocGFyYW1zLmZpbHRlci5mcm9tQmxvY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbXMuZmlsdGVyLnRvQmxvY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJncy50b0Jsb2NrID0gY2hlY2tMb2dUYWcocGFyYW1zLmZpbHRlci50b0Jsb2NrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlci5hZGRyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MuYWRkcmVzcyA9IHBhcmFtcy5maWx0ZXIuYWRkcmVzcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAVE9ETzogV2UgY2FuIGhhbmRsZSBzbGlnaHRseSBtb3JlIGNvbXBsaWNhdGVkIGxvZ3MgdXNpbmcgdGhlIGxvZ3MgQVBJXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXIudG9waWNzICYmIHBhcmFtcy5maWx0ZXIudG9waWNzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXIudG9waWNzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci50aHJvd0Vycm9yKFwidW5zdXBwb3J0ZWQgdG9waWMgY291bnRcIiwgTG9nZ2VyLkVycm9ycy5VTlNVUFBPUlRFRF9PUEVSQVRJT04sIHsgdG9waWNzOiBwYXJhbXMuZmlsdGVyLnRvcGljcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlci50b3BpY3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b3BpYzAgPSBwYXJhbXMuZmlsdGVyLnRvcGljc1swXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YodG9waWMwKSAhPT0gXCJzdHJpbmdcIiB8fCB0b3BpYzAubGVuZ3RoICE9PSA2Nikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci50aHJvd0Vycm9yKFwidW5zdXBwb3J0ZWQgdG9waWMgZm9ybWF0XCIsIExvZ2dlci5FcnJvcnMuVU5TVVBQT1JURURfT1BFUkFUSU9OLCB7IHRvcGljMDogdG9waWMwIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJncy50b3BpYzAgPSB0b3BpYzA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2dzOiBBcnJheTxhbnk+ID0gYXdhaXQgdGhpcy5mZXRjaChcImxvZ3NcIiwgYXJncyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDYWNoZSB0eEhhc2ggPT4gYmxvY2tIYXNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJsb2NrczogeyBbdGFnOiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIGFueSBtaXNzaW5nIGJsb2NrSGFzaCB0byB0aGUgbG9nc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2cgPSBsb2dzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9nLmJsb2NrSGFzaCAhPSBudWxsKSB7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChibG9ja3NbbG9nLmJsb2NrTnVtYmVyXSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBibG9jayA9IGF3YWl0IHRoaXMuZ2V0QmxvY2sobG9nLmJsb2NrTnVtYmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChibG9jaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJsb2Nrc1tsb2cuYmxvY2tOdW1iZXJdID0gYmxvY2suaGFzaDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5ibG9ja0hhc2ggPSBibG9ja3NbbG9nLmJsb2NrTnVtYmVyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9ncztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXBlci5fcGVyZm9ybShyZXEpO1xuICAgIH1cbiAgICBhc3luYyBnZXROZXR3b3JrKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXR3b3JrO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgUmVzb2x2ZXMgdG8gdGhlIGN1cnJlbnQgcHJpY2Ugb2YgZXRoZXIuXG4gICAgICpcbiAgICAgKiAgVGhpcyByZXR1cm5zIGBgMGBgIG9uIGFueSBuZXR3b3JrIG90aGVyIHRoYW4gYGBtYWlubmV0YGAuXG4gICAgICovXG4gICAgYXN5bmMgZ2V0RXRoZXJQcmljZSgpIHtcbiAgICAgICAgaWYgKHRoaXMubmV0d29yay5uYW1lICE9PSBcIm1haW5uZXRcIikge1xuICAgICAgICAgICAgcmV0dXJuIDAuMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCgoYXdhaXQgdGhpcy5mZXRjaChcInN0YXRzXCIsIHsgYWN0aW9uOiBcImV0aHByaWNlXCIgfSkpLmV0aHVzZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqICBSZXNvbHZlcyB0byBhIFtDb250cmFjdF1dIGZvciAlJWFkZHJlc3MlJSwgdXNpbmcgdGhlXG4gICAgICogIEV0aGVyc2NhbiBBUEkgdG8gcmV0cmVpdmUgdGhlIENvbnRyYWN0IEFCSS5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRDb250cmFjdChfYWRkcmVzcykge1xuICAgICAgICBsZXQgYWRkcmVzcyA9IHRoaXMuX2dldEFkZHJlc3MoX2FkZHJlc3MpO1xuICAgICAgICBpZiAoaXNQcm9taXNlKGFkZHJlc3MpKSB7XG4gICAgICAgICAgICBhZGRyZXNzID0gYXdhaXQgYWRkcmVzcztcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IHRoaXMuZmV0Y2goXCJjb250cmFjdFwiLCB7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBcImdldGFiaVwiLCBhZGRyZXNzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IGFiaSA9IEpTT04ucGFyc2UocmVzcCk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbnRyYWN0KGFkZHJlc3MsIGFiaSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpc0NvbW11bml0eVJlc291cmNlKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuYXBpS2V5ID09IG51bGwpO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByb3ZpZGVyLWV0aGVyc2Nhbi5qcy5tYXAiLCJmdW5jdGlvbiBnZXRHbG9iYWwoKSB7XG4gICAgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3c7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gZ2xvYmFsO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuYWJsZSB0byBsb2NhdGUgZ2xvYmFsIG9iamVjdCcpO1xufVxuO1xuY29uc3QgX1dlYlNvY2tldCA9IGdldEdsb2JhbCgpLldlYlNvY2tldDtcbmV4cG9ydCB7IF9XZWJTb2NrZXQgYXMgV2ViU29ja2V0IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD13cy1icm93c2VyLmpzLm1hcCIsIi8qKlxuICogIEdlbmVyaWMgbG9uZy1saXZlZCBzb2NrZXQgcHJvdmlkZXIuXG4gKlxuICogIFN1Yi1jbGFzc2luZyBub3Rlc1xuICogIC0gYSBzdWItY2xhc3MgTVVTVCBjYWxsIHRoZSBgX3N0YXJ0KClgIG1ldGhvZCBvbmNlIGNvbm5lY3RlZFxuICogIC0gYSBzdWItY2xhc3MgTVVTVCBvdmVycmlkZSB0aGUgYF93cml0ZShzdHJpbmcpYCBtZXRob2RcbiAqICAtIGEgc3ViLWNsYXNzIE1VU1QgY2FsbCBgX3Byb2Nlc3NNZXNzYWdlKHN0cmluZylgIGZvciBlYWNoIG1lc3NhZ2VcbiAqXG4gKiAgQF9zdWJzZWN0aW9uOiBhcGkvcHJvdmlkZXJzL2Fic3RyYWN0LXByb3ZpZGVyOlNvY2tldCBQcm92aWRlcnMgIFthYm91dC1zb2NrZXRQcm92aWRlcl1cbiAqL1xuaW1wb3J0IHsgVW5tYW5hZ2VkU3Vic2NyaWJlciB9IGZyb20gXCIuL2Fic3RyYWN0LXByb3ZpZGVyLmpzXCI7XG5pbXBvcnQgeyBhc3NlcnQsIGFzc2VydEFyZ3VtZW50LCBtYWtlRXJyb3IgfSBmcm9tIFwiLi4vdXRpbHMvaW5kZXguanNcIjtcbmltcG9ydCB7IEpzb25ScGNBcGlQcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLWpzb25ycGMuanNcIjtcbi8qKlxuICogIEEgKipTb2NrZXRTdWJzY3JpYmVyKiogdXNlcyBhIHNvY2tldCB0cmFuc3BvcnQgdG8gaGFuZGxlIGV2ZW50cyBhbmRcbiAqICBzaG91bGQgdXNlIFtbX2VtaXRdXSB0byBtYW5hZ2UgdGhlIGV2ZW50cy5cbiAqL1xuZXhwb3J0IGNsYXNzIFNvY2tldFN1YnNjcmliZXIge1xuICAgICNwcm92aWRlcjtcbiAgICAjZmlsdGVyO1xuICAgIC8qKlxuICAgICAqICBUaGUgZmlsdGVyLlxuICAgICAqL1xuICAgIGdldCBmaWx0ZXIoKSB7IHJldHVybiBKU09OLnBhcnNlKHRoaXMuI2ZpbHRlcik7IH1cbiAgICAjZmlsdGVySWQ7XG4gICAgI3BhdXNlZDtcbiAgICAjZW1pdFByb21pc2U7XG4gICAgLyoqXG4gICAgICogIENyZWF0ZXMgYSBuZXcgKipTb2NrZXRTdWJzY3JpYmVyKiogYXR0YWNoZWQgdG8gJSVwcm92aWRlciUlIGxpc3RlbmluZ1xuICAgICAqICB0byAlJWZpbHRlciUlLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByb3ZpZGVyLCBmaWx0ZXIpIHtcbiAgICAgICAgdGhpcy4jcHJvdmlkZXIgPSBwcm92aWRlcjtcbiAgICAgICAgdGhpcy4jZmlsdGVyID0gSlNPTi5zdHJpbmdpZnkoZmlsdGVyKTtcbiAgICAgICAgdGhpcy4jZmlsdGVySWQgPSBudWxsO1xuICAgICAgICB0aGlzLiNwYXVzZWQgPSBudWxsO1xuICAgICAgICB0aGlzLiNlbWl0UHJvbWlzZSA9IG51bGw7XG4gICAgfVxuICAgIHN0YXJ0KCkge1xuICAgICAgICB0aGlzLiNmaWx0ZXJJZCA9IHRoaXMuI3Byb3ZpZGVyLnNlbmQoXCJldGhfc3Vic2NyaWJlXCIsIHRoaXMuZmlsdGVyKS50aGVuKChmaWx0ZXJJZCkgPT4ge1xuICAgICAgICAgICAgO1xuICAgICAgICAgICAgdGhpcy4jcHJvdmlkZXIuX3JlZ2lzdGVyKGZpbHRlcklkLCB0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJJZDtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN0b3AoKSB7XG4gICAgICAgICh0aGlzLiNmaWx0ZXJJZCkudGhlbigoZmlsdGVySWQpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLiNwcm92aWRlci5kZXN0cm95ZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLiNwcm92aWRlci5zZW5kKFwiZXRoX3Vuc3Vic2NyaWJlXCIsIFtmaWx0ZXJJZF0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy4jZmlsdGVySWQgPSBudWxsO1xuICAgIH1cbiAgICAvLyBAVE9ETzogcGF1c2Ugc2hvdWxkIHRyYXAgdGhlIGN1cnJlbnQgYmxvY2tOdW1iZXIsIHVuc3ViLCBhbmQgb24gcmVzdW1lIHVzZSBnZXRMb2dzXG4gICAgLy8gICAgICAgIGFuZCByZXN1bWVcbiAgICBwYXVzZShkcm9wV2hpbGVQYXVzZWQpIHtcbiAgICAgICAgYXNzZXJ0KGRyb3BXaGlsZVBhdXNlZCwgXCJwcmVzZXJ2ZSBsb2dzIHdoaWxlIHBhdXNlZCBub3Qgc3VwcG9ydGVkIGJ5IFNvY2tldFN1YnNjcmliZXIgeWV0XCIsIFwiVU5TVVBQT1JURURfT1BFUkFUSU9OXCIsIHsgb3BlcmF0aW9uOiBcInBhdXNlKGZhbHNlKVwiIH0pO1xuICAgICAgICB0aGlzLiNwYXVzZWQgPSAhIWRyb3BXaGlsZVBhdXNlZDtcbiAgICB9XG4gICAgcmVzdW1lKCkge1xuICAgICAgICB0aGlzLiNwYXVzZWQgPSBudWxsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgQF9pZ25vcmU6XG4gICAgICovXG4gICAgX2hhbmRsZU1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICBpZiAodGhpcy4jZmlsdGVySWQgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLiNwYXVzZWQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGxldCBlbWl0UHJvbWlzZSA9IHRoaXMuI2VtaXRQcm9taXNlO1xuICAgICAgICAgICAgaWYgKGVtaXRQcm9taXNlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBlbWl0UHJvbWlzZSA9IHRoaXMuX2VtaXQodGhpcy4jcHJvdmlkZXIsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZW1pdFByb21pc2UgPSBlbWl0UHJvbWlzZS50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5fZW1pdCh0aGlzLiNwcm92aWRlciwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLiNlbWl0UHJvbWlzZSA9IGVtaXRQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLiNlbWl0UHJvbWlzZSA9PT0gZW1pdFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4jZW1pdFByb21pc2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqICBTdWItY2xhc3NlcyAqKm11c3QqKiBvdmVycmlkZSB0aGlzIHRvIGVtaXQgdGhlIGV2ZW50cyBvbiB0aGVcbiAgICAgKiAgcHJvdmlkZXIuXG4gICAgICovXG4gICAgYXN5bmMgX2VtaXQocHJvdmlkZXIsIG1lc3NhZ2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwic3ViLWNsYXNzZXMgbXVzdCBpbXBsZW1lbnRlIHRoaXM7IF9lbWl0XCIpO1xuICAgIH1cbn1cbi8qKlxuICogIEEgKipTb2NrZXRCbG9ja1N1YnNjcmliZXIqKiBsaXN0ZW5zIGZvciBgYG5ld0hlYWRzYGAgZXZlbnRzIGFuZCBlbWl0c1xuICogIGBgXCJibG9ja1wiYGAgZXZlbnRzLlxuICovXG5leHBvcnQgY2xhc3MgU29ja2V0QmxvY2tTdWJzY3JpYmVyIGV4dGVuZHMgU29ja2V0U3Vic2NyaWJlciB7XG4gICAgLyoqXG4gICAgICogIEBfaWdub3JlOlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByb3ZpZGVyKSB7XG4gICAgICAgIHN1cGVyKHByb3ZpZGVyLCBbXCJuZXdIZWFkc1wiXSk7XG4gICAgfVxuICAgIGFzeW5jIF9lbWl0KHByb3ZpZGVyLCBtZXNzYWdlKSB7XG4gICAgICAgIHByb3ZpZGVyLmVtaXQoXCJibG9ja1wiLCBwYXJzZUludChtZXNzYWdlLm51bWJlcikpO1xuICAgIH1cbn1cbi8qKlxuICogIEEgKipTb2NrZXRQZW5kaW5nU3Vic2NyaWJlcioqIGxpc3RlbnMgZm9yIHBlbmRpbmcgdHJhbnNhY2l0b25zIGFuZCBlbWl0c1xuICogIGBgXCJwZW5kaW5nXCJgYCBldmVudHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBTb2NrZXRQZW5kaW5nU3Vic2NyaWJlciBleHRlbmRzIFNvY2tldFN1YnNjcmliZXIge1xuICAgIC8qKlxuICAgICAqICBAX2lnbm9yZTpcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihwcm92aWRlcikge1xuICAgICAgICBzdXBlcihwcm92aWRlciwgW1wibmV3UGVuZGluZ1RyYW5zYWN0aW9uc1wiXSk7XG4gICAgfVxuICAgIGFzeW5jIF9lbWl0KHByb3ZpZGVyLCBtZXNzYWdlKSB7XG4gICAgICAgIHByb3ZpZGVyLmVtaXQoXCJwZW5kaW5nXCIsIG1lc3NhZ2UpO1xuICAgIH1cbn1cbi8qKlxuICogIEEgKipTb2NrZXRFdmVudFN1YnNjcmliZXIqKiBsaXN0ZW5zIGZvciBldmVudCBsb2dzLlxuICovXG5leHBvcnQgY2xhc3MgU29ja2V0RXZlbnRTdWJzY3JpYmVyIGV4dGVuZHMgU29ja2V0U3Vic2NyaWJlciB7XG4gICAgI2xvZ0ZpbHRlcjtcbiAgICAvKipcbiAgICAgKiAgVGhlIGZpbHRlci5cbiAgICAgKi9cbiAgICBnZXQgbG9nRmlsdGVyKCkgeyByZXR1cm4gSlNPTi5wYXJzZSh0aGlzLiNsb2dGaWx0ZXIpOyB9XG4gICAgLyoqXG4gICAgICogIEBfaWdub3JlOlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByb3ZpZGVyLCBmaWx0ZXIpIHtcbiAgICAgICAgc3VwZXIocHJvdmlkZXIsIFtcImxvZ3NcIiwgZmlsdGVyXSk7XG4gICAgICAgIHRoaXMuI2xvZ0ZpbHRlciA9IEpTT04uc3RyaW5naWZ5KGZpbHRlcik7XG4gICAgfVxuICAgIGFzeW5jIF9lbWl0KHByb3ZpZGVyLCBtZXNzYWdlKSB7XG4gICAgICAgIHByb3ZpZGVyLmVtaXQodGhpcy5sb2dGaWx0ZXIsIHByb3ZpZGVyLl93cmFwTG9nKG1lc3NhZ2UsIHByb3ZpZGVyLl9uZXR3b3JrKSk7XG4gICAgfVxufVxuLyoqXG4gKiAgQSAqKlNvY2tldFByb3ZpZGVyKiogaXMgYmFja2VkIGJ5IGEgbG9uZy1saXZlZCBjb25uZWN0aW9uIG92ZXIgYVxuICogIHNvY2tldCwgd2hpY2ggY2FuIHN1YnNjcmliZSBhbmQgcmVjZWl2ZSByZWFsLXRpbWUgbWVzc2FnZXMgb3ZlclxuICogIGl0cyBjb21tdW5pY2F0aW9uIGNoYW5uZWwuXG4gKi9cbmV4cG9ydCBjbGFzcyBTb2NrZXRQcm92aWRlciBleHRlbmRzIEpzb25ScGNBcGlQcm92aWRlciB7XG4gICAgI2NhbGxiYWNrcztcbiAgICAvLyBNYXBzIGVhY2ggZmlsdGVySWQgdG8gaXRzIHN1YnNjcmliZXJcbiAgICAjc3VicztcbiAgICAvLyBJZiBhbnkgZXZlbnRzIGNvbWUgaW4gYmVmb3JlIGEgc3Vic2NyaWJlciBoYXMgZmluaXNoZWRcbiAgICAvLyByZWdpc3RlcmluZywgcXVldWUgdGhlbVxuICAgICNwZW5kaW5nO1xuICAgIC8qKlxuICAgICAqICBDcmVhdGVzIGEgbmV3ICoqU29ja2V0UHJvdmlkZXIqKiBjb25uZWN0ZWQgdG8gJSVuZXR3b3JrJSUuXG4gICAgICpcbiAgICAgKiAgSWYgdW5zcGVjaWZpZWQsIHRoZSBuZXR3b3JrIHdpbGwgYmUgZGlzY292ZXJlZC5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihuZXR3b3JrLCBfb3B0aW9ucykge1xuICAgICAgICAvLyBDb3B5IHRoZSBvcHRpb25zXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCAoX29wdGlvbnMgIT0gbnVsbCkgPyBfb3B0aW9ucyA6IHt9KTtcbiAgICAgICAgLy8gU3VwcG9ydCBmb3IgYmF0Y2hlcyBpcyBnZW5lcmFsbHkgbm90IHN1cHBvcnRlZCBmb3JcbiAgICAgICAgLy8gY29ubmVjdGlvbi1iYXNlIHByb3ZpZGVyczsgaWYgdGhpcyBjaGFuZ2VzIGluIHRoZSBmdXR1cmVcbiAgICAgICAgLy8gdGhlIF9zZW5kIHNob3VsZCBiZSB1cGRhdGVkIHRvIHJlZmxlY3QgdGhpc1xuICAgICAgICBhc3NlcnRBcmd1bWVudChvcHRpb25zLmJhdGNoTWF4Q291bnQgPT0gbnVsbCB8fCBvcHRpb25zLmJhdGNoTWF4Q291bnQgPT09IDEsIFwic29ja2V0cy1iYXNlZCBwcm92aWRlcnMgZG8gbm90IHN1cHBvcnQgYmF0Y2hlc1wiLCBcIm9wdGlvbnMuYmF0Y2hNYXhDb3VudFwiLCBfb3B0aW9ucyk7XG4gICAgICAgIG9wdGlvbnMuYmF0Y2hNYXhDb3VudCA9IDE7XG4gICAgICAgIC8vIFNvY2tldC1iYXNlZCBQcm92aWRlcnMgKGdlbmVyYWxseSkgY2Fubm90IGNoYW5nZSB0aGVpciBuZXR3b3JrLFxuICAgICAgICAvLyBzaW5jZSB0aGV5IGhhdmUgYSBsb25nLWxpdmVkIGNvbm5lY3Rpb247IGJ1dCBsZXQgcGVvcGxlIG92ZXJyaWRlXG4gICAgICAgIC8vIHRoaXMgaWYgdGhleSBoYXZlIGp1c3QgY2F1c2UuXG4gICAgICAgIGlmIChvcHRpb25zLnN0YXRpY05ldHdvcmsgPT0gbnVsbCkge1xuICAgICAgICAgICAgb3B0aW9ucy5zdGF0aWNOZXR3b3JrID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlcihuZXR3b3JrLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy4jY2FsbGJhY2tzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLiNzdWJzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLiNwZW5kaW5nID0gbmV3IE1hcCgpO1xuICAgIH1cbiAgICAvLyBUaGlzIHZhbHVlIGlzIG9ubHkgdmFsaWQgYWZ0ZXIgX3N0YXJ0IGhhcyBiZWVuIGNhbGxlZFxuICAgIC8qXG4gICAgZ2V0IF9uZXR3b3JrKCk6IE5ldHdvcmsge1xuICAgICAgICBpZiAodGhpcy4jbmV0d29yayA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0aGlzIHNob3VsZG4ndCBoYXBwZW5cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuI25ldHdvcmsuY2xvbmUoKTtcbiAgICB9XG4gICAgKi9cbiAgICBfZ2V0U3Vic2NyaWJlcihzdWIpIHtcbiAgICAgICAgc3dpdGNoIChzdWIudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcImNsb3NlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVbm1hbmFnZWRTdWJzY3JpYmVyKFwiY2xvc2VcIik7XG4gICAgICAgICAgICBjYXNlIFwiYmxvY2tcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFNvY2tldEJsb2NrU3Vic2NyaWJlcih0aGlzKTtcbiAgICAgICAgICAgIGNhc2UgXCJwZW5kaW5nXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTb2NrZXRQZW5kaW5nU3Vic2NyaWJlcih0aGlzKTtcbiAgICAgICAgICAgIGNhc2UgXCJldmVudFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU29ja2V0RXZlbnRTdWJzY3JpYmVyKHRoaXMsIHN1Yi5maWx0ZXIpO1xuICAgICAgICAgICAgY2FzZSBcIm9ycGhhblwiOlxuICAgICAgICAgICAgICAgIC8vIEhhbmRsZWQgYXV0by1tYXRpY2FsbHkgd2l0aGluIEFic3RyYWN0UHJvdmlkZXJcbiAgICAgICAgICAgICAgICAvLyB3aGVuIHRoZSBsb2cucmVtb3ZlZCA9IHRydWVcbiAgICAgICAgICAgICAgICBpZiAoc3ViLmZpbHRlci5vcnBoYW4gPT09IFwiZHJvcC1sb2dcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFVubWFuYWdlZFN1YnNjcmliZXIoXCJkcm9wLWxvZ1wiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1cGVyLl9nZXRTdWJzY3JpYmVyKHN1Yik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqICBSZWdpc3RlciBhIG5ldyBzdWJzY3JpYmVyLiBUaGlzIGlzIHVzZWQgaW50ZXJuYWxsZWQgYnkgU3Vic2NyaWJlcnNcbiAgICAgKiAgYW5kIGdlbmVyYWxseSBpcyB1bmVjZXNzYXJ5IHVubGVzcyBleHRlbmRpbmcgY2FwYWJpbGl0aWVzLlxuICAgICAqL1xuICAgIF9yZWdpc3RlcihmaWx0ZXJJZCwgc3Vic2NyaWJlcikge1xuICAgICAgICB0aGlzLiNzdWJzLnNldChmaWx0ZXJJZCwgc3Vic2NyaWJlcik7XG4gICAgICAgIGNvbnN0IHBlbmRpbmcgPSB0aGlzLiNwZW5kaW5nLmdldChmaWx0ZXJJZCk7XG4gICAgICAgIGlmIChwZW5kaW5nKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgcGVuZGluZykge1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIuX2hhbmRsZU1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLiNwZW5kaW5nLmRlbGV0ZShmaWx0ZXJJZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgX3NlbmQocGF5bG9hZCkge1xuICAgICAgICAvLyBXZWJTb2NrZXQgcHJvdmlkZXIgZG9lc24ndCBhY2NlcHQgYmF0Y2hlc1xuICAgICAgICBhc3NlcnRBcmd1bWVudCghQXJyYXkuaXNBcnJheShwYXlsb2FkKSwgXCJXZWJTb2NrZXQgZG9lcyBub3Qgc3VwcG9ydCBiYXRjaCBzZW5kXCIsIFwicGF5bG9hZFwiLCBwYXlsb2FkKTtcbiAgICAgICAgLy8gQFRPRE86IHN0cmluZ2lmeSBwYXlsb2FkcyBoZXJlIGFuZCBzdG9yZSB0byBwcmV2ZW50IG11dGF0aW9uc1xuICAgICAgICAvLyBQcmVwYXJlIGEgcHJvbWlzZSB0byByZXNwb25kIHRvXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLiNjYWxsYmFja3Muc2V0KHBheWxvYWQuaWQsIHsgcGF5bG9hZCwgcmVzb2x2ZSwgcmVqZWN0IH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gV2FpdCB1bnRpbCB0aGUgc29ja2V0IGlzIGNvbm5lY3RlZCBiZWZvcmUgd3JpdGluZyB0byBpdFxuICAgICAgICBhd2FpdCB0aGlzLl93YWl0VW50aWxSZWFkeSgpO1xuICAgICAgICAvLyBXcml0ZSB0aGUgcmVxdWVzdCB0byB0aGUgc29ja2V0XG4gICAgICAgIGF3YWl0IHRoaXMuX3dyaXRlKEpTT04uc3RyaW5naWZ5KHBheWxvYWQpKTtcbiAgICAgICAgcmV0dXJuIFthd2FpdCBwcm9taXNlXTtcbiAgICB9XG4gICAgLy8gU3ViLWNsYXNzZXMgbXVzdCBjYWxsIHRoaXMgb25jZSB0aGV5IGFyZSBjb25uZWN0ZWRcbiAgICAvKlxuICAgIGFzeW5jIF9zdGFydCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKHRoaXMuI3JlYWR5KSB7IHJldHVybjsgfVxuXG4gICAgICAgIGZvciAoY29uc3QgeyBwYXlsb2FkIH0gb2YgdGhpcy4jY2FsbGJhY2tzLnZhbHVlcygpKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLl93cml0ZShKU09OLnN0cmluZ2lmeShwYXlsb2FkKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLiNyZWFkeSA9IChhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGF3YWl0IHN1cGVyLl9zdGFydCgpO1xuICAgICAgICB9KSgpO1xuICAgIH1cbiAgICAqL1xuICAgIC8qKlxuICAgICAqICBTdWItY2xhc3NlcyAqKm11c3QqKiBjYWxsIHRoaXMgd2l0aCBtZXNzYWdlcyByZWNlaXZlZCBvdmVyIHRoZWlyXG4gICAgICogIHRyYW5zcG9ydCB0byBiZSBwcm9jZXNzZWQgYW5kIGRpc3BhdGNoZWQuXG4gICAgICovXG4gICAgYXN5bmMgX3Byb2Nlc3NNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gKEpTT04ucGFyc2UobWVzc2FnZSkpO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiAocmVzdWx0KSA9PT0gXCJvYmplY3RcIiAmJiBcImlkXCIgaW4gcmVzdWx0KSB7XG4gICAgICAgICAgICBjb25zdCBjYWxsYmFjayA9IHRoaXMuI2NhbGxiYWNrcy5nZXQocmVzdWx0LmlkKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KFwiZXJyb3JcIiwgbWFrZUVycm9yKFwicmVjZWl2ZWQgcmVzdWx0IGZvciB1bmtub3duIGlkXCIsIFwiVU5LTk9XTl9FUlJPUlwiLCB7XG4gICAgICAgICAgICAgICAgICAgIHJlYXNvbkNvZGU6IFwiVU5LTk9XTl9JRFwiLFxuICAgICAgICAgICAgICAgICAgICByZXN1bHRcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy4jY2FsbGJhY2tzLmRlbGV0ZShyZXN1bHQuaWQpO1xuICAgICAgICAgICAgY2FsbGJhY2sucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHJlc3VsdCAmJiByZXN1bHQubWV0aG9kID09PSBcImV0aF9zdWJzY3JpcHRpb25cIikge1xuICAgICAgICAgICAgY29uc3QgZmlsdGVySWQgPSByZXN1bHQucGFyYW1zLnN1YnNjcmlwdGlvbjtcbiAgICAgICAgICAgIGNvbnN0IHN1YnNjcmliZXIgPSB0aGlzLiNzdWJzLmdldChmaWx0ZXJJZCk7XG4gICAgICAgICAgICBpZiAoc3Vic2NyaWJlcikge1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIuX2hhbmRsZU1lc3NhZ2UocmVzdWx0LnBhcmFtcy5yZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IHBlbmRpbmcgPSB0aGlzLiNwZW5kaW5nLmdldChmaWx0ZXJJZCk7XG4gICAgICAgICAgICAgICAgaWYgKHBlbmRpbmcgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nID0gW107XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuI3BlbmRpbmcuc2V0KGZpbHRlcklkLCBwZW5kaW5nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGVuZGluZy5wdXNoKHJlc3VsdC5wYXJhbXMucmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdChcImVycm9yXCIsIG1ha2VFcnJvcihcInJlY2VpdmVkIHVuZXhwZWN0ZWQgbWVzc2FnZVwiLCBcIlVOS05PV05fRVJST1JcIiwge1xuICAgICAgICAgICAgICAgIHJlYXNvbkNvZGU6IFwiVU5FWFBFQ1RFRF9NRVNTQUdFXCIsXG4gICAgICAgICAgICAgICAgcmVzdWx0XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogIFN1Yi1jbGFzc2VzICoqbXVzdCoqIG92ZXJyaWRlIHRoaXMgdG8gc2VuZCAlJW1lc3NhZ2UlJSBvdmVyIHRoZWlyXG4gICAgICogIHRyYW5zcG9ydC5cbiAgICAgKi9cbiAgICBhc3luYyBfd3JpdGUobWVzc2FnZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzdWItY2xhc3NlcyBtdXN0IG92ZXJyaWRlIHRoaXNcIik7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJvdmlkZXItc29ja2V0LmpzLm1hcCIsImltcG9ydCB7IFdlYlNvY2tldCBhcyBfV2ViU29ja2V0IH0gZnJvbSBcIi4vd3MuanNcIjsgLyotYnJvd3NlciovXG5pbXBvcnQgeyBTb2NrZXRQcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLXNvY2tldC5qc1wiO1xuLyoqXG4gKiAgQSBKU09OLVJQQyBwcm92aWRlciB3aGljaCBpcyBiYWNrZWQgYnkgYSBXZWJTb2NrZXQuXG4gKlxuICogIFdlYlNvY2tldHMgYXJlIG9mdGVuIHByZWZlcnJlZCBiZWNhdXNlIHRoZXkgcmV0YWluIGEgbGl2ZSBjb25uZWN0aW9uXG4gKiAgdG8gYSBzZXJ2ZXIsIHdoaWNoIHBlcm1pdHMgbW9yZSBpbnN0YW50IGFjY2VzcyB0byBldmVudHMuXG4gKlxuICogIEhvd2V2ZXIsIHRoaXMgaW5jdXJzIGhpZ2hlciBzZXJ2ZXIgaW5mcmFzdHVydHVyZSBjb3N0cywgc28gYWRkaXRpb25hbFxuICogIHJlc291cmNlcyBtYXkgYmUgcmVxdWlyZWQgdG8gaG9zdCB5b3VyIG93biBXZWJTb2NrZXQgbm9kZXMgYW5kIG1hbnlcbiAqICB0aGlyZC1wYXJ0eSBzZXJ2aWNlcyBjaGFyZ2UgYWRkaXRpb25hbCBmZWVzIGZvciBXZWJTb2NrZXQgZW5kcG9pbnRzLlxuICovXG5leHBvcnQgY2xhc3MgV2ViU29ja2V0UHJvdmlkZXIgZXh0ZW5kcyBTb2NrZXRQcm92aWRlciB7XG4gICAgI2Nvbm5lY3Q7XG4gICAgI3dlYnNvY2tldDtcbiAgICBnZXQgd2Vic29ja2V0KCkge1xuICAgICAgICBpZiAodGhpcy4jd2Vic29ja2V0ID09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIndlYnNvY2tldCBjbG9zZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuI3dlYnNvY2tldDtcbiAgICB9XG4gICAgY29uc3RydWN0b3IodXJsLCBuZXR3b3JrLCBvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG5ldHdvcmssIG9wdGlvbnMpO1xuICAgICAgICBpZiAodHlwZW9mICh1cmwpID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICB0aGlzLiNjb25uZWN0ID0gKCkgPT4geyByZXR1cm4gbmV3IF9XZWJTb2NrZXQodXJsKTsgfTtcbiAgICAgICAgICAgIHRoaXMuI3dlYnNvY2tldCA9IHRoaXMuI2Nvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgKHVybCkgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdGhpcy4jY29ubmVjdCA9IHVybDtcbiAgICAgICAgICAgIHRoaXMuI3dlYnNvY2tldCA9IHVybCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4jY29ubmVjdCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLiN3ZWJzb2NrZXQgPSB1cmw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53ZWJzb2NrZXQub25vcGVuID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLl9zdGFydCgpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdW1lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZhaWxlZCB0byBzdGFydCBXZWJzb2NrZXRQcm92aWRlclwiLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgLy8gQFRPRE86IG5vdyB3aGF0PyBBdHRlbXB0IHJlY29ubmVjdD9cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy53ZWJzb2NrZXQub25tZXNzYWdlID0gKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NNZXNzYWdlKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIC8qXG4gICAgICAgICAgICAgICAgdGhpcy53ZWJzb2NrZXQub25jbG9zZSA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBAVE9ETzogV2hhdCBldmVudC5jb2RlIHNob3VsZCB3ZSByZWNvbm5lY3Qgb24/XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlY29ubmVjdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVjb25uZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhdXNlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuI2Nvbm5lY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiN3ZWJzb2NrZXQgPSB0aGlzLiNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4jd2Vic29ja2V0Lm9ub3BlbiA9IC4uLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEBUT0RPOiB0aGlzIHJlcXVpcmVzIHRoZSBzdXBlciBjbGFzcyB0byByZWJyb2FkY2FzdDsgbW92ZSBpdCB0aGVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAqL1xuICAgIH1cbiAgICBhc3luYyBfd3JpdGUobWVzc2FnZSkge1xuICAgICAgICB0aGlzLndlYnNvY2tldC5zZW5kKG1lc3NhZ2UpO1xuICAgIH1cbiAgICBhc3luYyBkZXN0cm95KCkge1xuICAgICAgICBpZiAodGhpcy4jd2Vic29ja2V0ICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuI3dlYnNvY2tldC5jbG9zZSgpO1xuICAgICAgICAgICAgdGhpcy4jd2Vic29ja2V0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBzdXBlci5kZXN0cm95KCk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJvdmlkZXItd2Vic29ja2V0LmpzLm1hcCIsIi8qKlxuICogIFtbbGluay1pbmZ1cmFdXSBwcm92aWRlcyBhIHRoaXJkLXBhcnR5IHNlcnZpY2UgZm9yIGNvbm5lY3RpbmcgdG9cbiAqICB2YXJpb3VzIGJsb2NrY2hhaW5zIG92ZXIgSlNPTi1SUEMuXG4gKlxuICogICoqU3VwcG9ydGVkIE5ldHdvcmtzKipcbiAqXG4gKiAgLSBFdGhlcmV1bSBNYWlubmV0IChgYG1haW5uZXRgYClcbiAqICAtIEdvZXJsaSBUZXN0bmV0IChgYGdvZXJsaWBgKVxuICogIC0gU2Vwb2xpYSBUZXN0bmV0IChgYHNlcG9saWFgYClcbiAqICAtIEFyYml0cnVtIChgYGFyYml0cnVtYGApXG4gKiAgLSBBcmJpdHJ1bSBHb2VybGkgVGVzdG5ldCAoYGBhcmJpdHJ1bS1nb2VybGlgYClcbiAqICAtIEFyYml0cnVtIFNlcG9saWEgVGVzdG5ldCAoYGBhcmJpdHJ1bS1zZXBvbGlhYGApXG4gKiAgLSBCYXNlIChgYGJhc2VgYClcbiAqICAtIEJhc2UgR29lcmxpYSBUZXN0bmV0IChgYGJhc2UtZ29lcmxpYGApXG4gKiAgLSBCYXNlIFNlcG9saWEgVGVzdG5ldCAoYGBiYXNlLXNlcG9saWFgYClcbiAqICAtIEJOQiBTbWFydCBDaGFpbiBNYWlubmV0IChgYGJuYmBgKVxuICogIC0gQk5CIFNtYXJ0IENoYWluIFRlc3RuZXQgKGBgYm5idGBgKVxuICogIC0gTGluZWEgKGBgbGluZWFgYClcbiAqICAtIExpbmVhIEdvZXJsaSBUZXN0bmV0IChgYGxpbmVhLWdvZXJsaWBgKVxuICogIC0gTGluZWEgU2Vwb2xpYSBUZXN0bmV0IChgYGxpbmVhLXNlcG9saWFgYClcbiAqICAtIE9wdGltaXNtIChgYG9wdGltaXNtYGApXG4gKiAgLSBPcHRpbWlzbSBHb2VybGkgVGVzdG5ldCAoYGBvcHRpbWlzbS1nb2VybGlgYClcbiAqICAtIE9wdGltaXNtIFNlcG9saWEgVGVzdG5ldCAoYGBvcHRpbWlzbS1zZXBvbGlhYGApXG4gKiAgLSBQb2x5Z29uIChgYG1hdGljYGApXG4gKiAgLSBQb2x5Z29uIEFtb3kgVGVzdG5ldCAoYGBtYXRpYy1hbW95YGApXG4gKiAgLSBQb2x5Z29uIE11bWJhaSBUZXN0bmV0IChgYG1hdGljLW11bWJhaWBgKVxuICpcbiAqICBAX3N1YnNlY3Rpb246IGFwaS9wcm92aWRlcnMvdGhpcmRwYXJ0eTpJTkZVUkEgIFtwcm92aWRlcnMtaW5mdXJhXVxuICovXG5pbXBvcnQgeyBkZWZpbmVQcm9wZXJ0aWVzLCBGZXRjaFJlcXVlc3QsIGFzc2VydCwgYXNzZXJ0QXJndW1lbnQgfSBmcm9tIFwiLi4vdXRpbHMvaW5kZXguanNcIjtcbmltcG9ydCB7IHNob3dUaHJvdHRsZU1lc3NhZ2UgfSBmcm9tIFwiLi9jb21tdW5pdHkuanNcIjtcbmltcG9ydCB7IE5ldHdvcmsgfSBmcm9tIFwiLi9uZXR3b3JrLmpzXCI7XG5pbXBvcnQgeyBKc29uUnBjUHJvdmlkZXIgfSBmcm9tIFwiLi9wcm92aWRlci1qc29ucnBjLmpzXCI7XG5pbXBvcnQgeyBXZWJTb2NrZXRQcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLXdlYnNvY2tldC5qc1wiO1xuY29uc3QgZGVmYXVsdFByb2plY3RJZCA9IFwiODQ4NDIwNzhiMDk5NDY2MzhjMDMxNTdmODM0MDUyMTNcIjtcbmZ1bmN0aW9uIGdldEhvc3QobmFtZSkge1xuICAgIHN3aXRjaCAobmFtZSkge1xuICAgICAgICBjYXNlIFwibWFpbm5ldFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwibWFpbm5ldC5pbmZ1cmEuaW9cIjtcbiAgICAgICAgY2FzZSBcImdvZXJsaVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiZ29lcmxpLmluZnVyYS5pb1wiO1xuICAgICAgICBjYXNlIFwic2Vwb2xpYVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwic2Vwb2xpYS5pbmZ1cmEuaW9cIjtcbiAgICAgICAgY2FzZSBcImFyYml0cnVtXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJhcmJpdHJ1bS1tYWlubmV0LmluZnVyYS5pb1wiO1xuICAgICAgICBjYXNlIFwiYXJiaXRydW0tZ29lcmxpXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJhcmJpdHJ1bS1nb2VybGkuaW5mdXJhLmlvXCI7XG4gICAgICAgIGNhc2UgXCJhcmJpdHJ1bS1zZXBvbGlhXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJhcmJpdHJ1bS1zZXBvbGlhLmluZnVyYS5pb1wiO1xuICAgICAgICBjYXNlIFwiYmFzZVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiYmFzZS1tYWlubmV0LmluZnVyYS5pb1wiO1xuICAgICAgICBjYXNlIFwiYmFzZS1nb2VybGlhXCI6IC8vIEBUT0RPOiBSZW1vdmUgdGhpcyB0eXBvIGluIHRoZSBmdXR1cmUhXG4gICAgICAgIGNhc2UgXCJiYXNlLWdvZXJsaVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiYmFzZS1nb2VybGkuaW5mdXJhLmlvXCI7XG4gICAgICAgIGNhc2UgXCJiYXNlLXNlcG9saWFcIjpcbiAgICAgICAgICAgIHJldHVybiBcImJhc2Utc2Vwb2xpYS5pbmZ1cmEuaW9cIjtcbiAgICAgICAgY2FzZSBcImJuYlwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiYnNjLW1haW5uZXQuaW5mdXJhLmlvXCI7XG4gICAgICAgIGNhc2UgXCJibmJ0XCI6XG4gICAgICAgICAgICByZXR1cm4gXCJic2MtdGVzdG5ldC5pbmZ1cmEuaW9cIjtcbiAgICAgICAgY2FzZSBcImxpbmVhXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJsaW5lYS1tYWlubmV0LmluZnVyYS5pb1wiO1xuICAgICAgICBjYXNlIFwibGluZWEtZ29lcmxpXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJsaW5lYS1nb2VybGkuaW5mdXJhLmlvXCI7XG4gICAgICAgIGNhc2UgXCJsaW5lYS1zZXBvbGlhXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJsaW5lYS1zZXBvbGlhLmluZnVyYS5pb1wiO1xuICAgICAgICBjYXNlIFwibWF0aWNcIjpcbiAgICAgICAgICAgIHJldHVybiBcInBvbHlnb24tbWFpbm5ldC5pbmZ1cmEuaW9cIjtcbiAgICAgICAgY2FzZSBcIm1hdGljLWFtb3lcIjpcbiAgICAgICAgICAgIHJldHVybiBcInBvbHlnb24tYW1veS5pbmZ1cmEuaW9cIjtcbiAgICAgICAgY2FzZSBcIm1hdGljLW11bWJhaVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwicG9seWdvbi1tdW1iYWkuaW5mdXJhLmlvXCI7XG4gICAgICAgIGNhc2UgXCJvcHRpbWlzbVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwib3B0aW1pc20tbWFpbm5ldC5pbmZ1cmEuaW9cIjtcbiAgICAgICAgY2FzZSBcIm9wdGltaXNtLWdvZXJsaVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwib3B0aW1pc20tZ29lcmxpLmluZnVyYS5pb1wiO1xuICAgICAgICBjYXNlIFwib3B0aW1pc20tc2Vwb2xpYVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwib3B0aW1pc20tc2Vwb2xpYS5pbmZ1cmEuaW9cIjtcbiAgICB9XG4gICAgYXNzZXJ0QXJndW1lbnQoZmFsc2UsIFwidW5zdXBwb3J0ZWQgbmV0d29ya1wiLCBcIm5ldHdvcmtcIiwgbmFtZSk7XG59XG4vKipcbiAqICBUaGUgKipJbmZ1cmFXZWJTb2NrZXRQcm92aWRlcioqIGNvbm5lY3RzIHRvIHRoZSBbW2xpbmstaW5mdXJhXV1cbiAqICBXZWJTb2NrZXQgZW5kLXBvaW50cy5cbiAqXG4gKiAgQnkgZGVmYXVsdCwgYSBoaWdobHktdGhyb3R0bGVkIEFQSSBrZXkgaXMgdXNlZCwgd2hpY2ggaXNcbiAqICBhcHByb3ByaWF0ZSBmb3IgcXVpY2sgcHJvdG90eXBlcyBhbmQgc2ltcGxlIHNjcmlwdHMuIFRvXG4gKiAgZ2FpbiBhY2Nlc3MgdG8gYW4gaW5jcmVhc2VkIHJhdGUtbGltaXQsIGl0IGlzIGhpZ2hseVxuICogIHJlY29tbWVuZGVkIHRvIFtzaWduIHVwIGhlcmVdKGxpbmstaW5mdXJhLXNpZ251cCkuXG4gKi9cbmV4cG9ydCBjbGFzcyBJbmZ1cmFXZWJTb2NrZXRQcm92aWRlciBleHRlbmRzIFdlYlNvY2tldFByb3ZpZGVyIHtcbiAgICAvKipcbiAgICAgKiAgVGhlIFByb2plY3QgSUQgZm9yIHRoZSBJTkZVUkEgY29ubmVjdGlvbi5cbiAgICAgKi9cbiAgICBwcm9qZWN0SWQ7XG4gICAgLyoqXG4gICAgICogIFRoZSBQcm9qZWN0IFNlY3JldC5cbiAgICAgKlxuICAgICAqICBJZiBudWxsLCBubyBhdXRoZW50aWNhdGVkIHJlcXVlc3RzIGFyZSBtYWRlLiBUaGlzIHNob3VsZCBub3RcbiAgICAgKiAgYmUgdXNlZCBvdXRzaWRlIG9mIHByaXZhdGUgY29udGV4dHMuXG4gICAgICovXG4gICAgcHJvamVjdFNlY3JldDtcbiAgICAvKipcbiAgICAgKiAgQ3JlYXRlcyBhIG5ldyAqKkluZnVyYVdlYlNvY2tldFByb3ZpZGVyKiouXG4gICAgICovXG4gICAgY29uc3RydWN0b3IobmV0d29yaywgcHJvamVjdElkKSB7XG4gICAgICAgIGNvbnN0IHByb3ZpZGVyID0gbmV3IEluZnVyYVByb3ZpZGVyKG5ldHdvcmssIHByb2plY3RJZCk7XG4gICAgICAgIGNvbnN0IHJlcSA9IHByb3ZpZGVyLl9nZXRDb25uZWN0aW9uKCk7XG4gICAgICAgIGFzc2VydCghcmVxLmNyZWRlbnRpYWxzLCBcIklORlVSQSBXZWJTb2NrZXQgcHJvamVjdCBzZWNyZXRzIHVuc3VwcG9ydGVkXCIsIFwiVU5TVVBQT1JURURfT1BFUkFUSU9OXCIsIHsgb3BlcmF0aW9uOiBcIkluZnVyYVByb3ZpZGVyLmdldFdlYlNvY2tldFByb3ZpZGVyKClcIiB9KTtcbiAgICAgICAgY29uc3QgdXJsID0gcmVxLnVybC5yZXBsYWNlKC9eaHR0cC9pLCBcIndzXCIpLnJlcGxhY2UoXCIvdjMvXCIsIFwiL3dzL3YzL1wiKTtcbiAgICAgICAgc3VwZXIodXJsLCBwcm92aWRlci5fbmV0d29yayk7XG4gICAgICAgIGRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICAgICAgcHJvamVjdElkOiBwcm92aWRlci5wcm9qZWN0SWQsXG4gICAgICAgICAgICBwcm9qZWN0U2VjcmV0OiBwcm92aWRlci5wcm9qZWN0U2VjcmV0XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpc0NvbW11bml0eVJlc291cmNlKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMucHJvamVjdElkID09PSBkZWZhdWx0UHJvamVjdElkKTtcbiAgICB9XG59XG4vKipcbiAqICBUaGUgKipJbmZ1cmFQcm92aWRlcioqIGNvbm5lY3RzIHRvIHRoZSBbW2xpbmstaW5mdXJhXV1cbiAqICBKU09OLVJQQyBlbmQtcG9pbnRzLlxuICpcbiAqICBCeSBkZWZhdWx0LCBhIGhpZ2hseS10aHJvdHRsZWQgQVBJIGtleSBpcyB1c2VkLCB3aGljaCBpc1xuICogIGFwcHJvcHJpYXRlIGZvciBxdWljayBwcm90b3R5cGVzIGFuZCBzaW1wbGUgc2NyaXB0cy4gVG9cbiAqICBnYWluIGFjY2VzcyB0byBhbiBpbmNyZWFzZWQgcmF0ZS1saW1pdCwgaXQgaXMgaGlnaGx5XG4gKiAgcmVjb21tZW5kZWQgdG8gW3NpZ24gdXAgaGVyZV0obGluay1pbmZ1cmEtc2lnbnVwKS5cbiAqL1xuZXhwb3J0IGNsYXNzIEluZnVyYVByb3ZpZGVyIGV4dGVuZHMgSnNvblJwY1Byb3ZpZGVyIHtcbiAgICAvKipcbiAgICAgKiAgVGhlIFByb2plY3QgSUQgZm9yIHRoZSBJTkZVUkEgY29ubmVjdGlvbi5cbiAgICAgKi9cbiAgICBwcm9qZWN0SWQ7XG4gICAgLyoqXG4gICAgICogIFRoZSBQcm9qZWN0IFNlY3JldC5cbiAgICAgKlxuICAgICAqICBJZiBudWxsLCBubyBhdXRoZW50aWNhdGVkIHJlcXVlc3RzIGFyZSBtYWRlLiBUaGlzIHNob3VsZCBub3RcbiAgICAgKiAgYmUgdXNlZCBvdXRzaWRlIG9mIHByaXZhdGUgY29udGV4dHMuXG4gICAgICovXG4gICAgcHJvamVjdFNlY3JldDtcbiAgICAvKipcbiAgICAgKiAgQ3JlYXRlcyBhIG5ldyAqKkluZnVyYVByb3ZpZGVyKiouXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoX25ldHdvcmssIHByb2plY3RJZCwgcHJvamVjdFNlY3JldCkge1xuICAgICAgICBpZiAoX25ldHdvcmsgPT0gbnVsbCkge1xuICAgICAgICAgICAgX25ldHdvcmsgPSBcIm1haW5uZXRcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXR3b3JrID0gTmV0d29yay5mcm9tKF9uZXR3b3JrKTtcbiAgICAgICAgaWYgKHByb2plY3RJZCA9PSBudWxsKSB7XG4gICAgICAgICAgICBwcm9qZWN0SWQgPSBkZWZhdWx0UHJvamVjdElkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcm9qZWN0U2VjcmV0ID09IG51bGwpIHtcbiAgICAgICAgICAgIHByb2plY3RTZWNyZXQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBJbmZ1cmFQcm92aWRlci5nZXRSZXF1ZXN0KG5ldHdvcmssIHByb2plY3RJZCwgcHJvamVjdFNlY3JldCk7XG4gICAgICAgIHN1cGVyKHJlcXVlc3QsIG5ldHdvcmssIHsgc3RhdGljTmV0d29yazogbmV0d29yayB9KTtcbiAgICAgICAgZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7IHByb2plY3RJZCwgcHJvamVjdFNlY3JldCB9KTtcbiAgICB9XG4gICAgX2dldFByb3ZpZGVyKGNoYWluSWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgSW5mdXJhUHJvdmlkZXIoY2hhaW5JZCwgdGhpcy5wcm9qZWN0SWQsIHRoaXMucHJvamVjdFNlY3JldCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7IH1cbiAgICAgICAgcmV0dXJuIHN1cGVyLl9nZXRQcm92aWRlcihjaGFpbklkKTtcbiAgICB9XG4gICAgaXNDb21tdW5pdHlSZXNvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLnByb2plY3RJZCA9PT0gZGVmYXVsdFByb2plY3RJZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqICBDcmVhdGVzIGEgbmV3ICoqSW5mdXJhV2ViU29ja2V0UHJvdmlkZXIqKi5cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0V2ViU29ja2V0UHJvdmlkZXIobmV0d29yaywgcHJvamVjdElkKSB7XG4gICAgICAgIHJldHVybiBuZXcgSW5mdXJhV2ViU29ja2V0UHJvdmlkZXIobmV0d29yaywgcHJvamVjdElkKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogIFJldHVybnMgYSBwcmVwYXJlZCByZXF1ZXN0IGZvciBjb25uZWN0aW5nIHRvICUlbmV0d29yayUlXG4gICAgICogIHdpdGggJSVwcm9qZWN0SWQlJSBhbmQgJSVwcm9qZWN0U2VjcmV0JSUuXG4gICAgICovXG4gICAgc3RhdGljIGdldFJlcXVlc3QobmV0d29yaywgcHJvamVjdElkLCBwcm9qZWN0U2VjcmV0KSB7XG4gICAgICAgIGlmIChwcm9qZWN0SWQgPT0gbnVsbCkge1xuICAgICAgICAgICAgcHJvamVjdElkID0gZGVmYXVsdFByb2plY3RJZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvamVjdFNlY3JldCA9PSBudWxsKSB7XG4gICAgICAgICAgICBwcm9qZWN0U2VjcmV0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gbmV3IEZldGNoUmVxdWVzdChgaHR0cHM6L1xcLyR7Z2V0SG9zdChuZXR3b3JrLm5hbWUpfS92My8ke3Byb2plY3RJZH1gKTtcbiAgICAgICAgcmVxdWVzdC5hbGxvd0d6aXAgPSB0cnVlO1xuICAgICAgICBpZiAocHJvamVjdFNlY3JldCkge1xuICAgICAgICAgICAgcmVxdWVzdC5zZXRDcmVkZW50aWFscyhcIlwiLCBwcm9qZWN0U2VjcmV0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvamVjdElkID09PSBkZWZhdWx0UHJvamVjdElkKSB7XG4gICAgICAgICAgICByZXF1ZXN0LnJldHJ5RnVuYyA9IGFzeW5jIChyZXF1ZXN0LCByZXNwb25zZSwgYXR0ZW1wdCkgPT4ge1xuICAgICAgICAgICAgICAgIHNob3dUaHJvdHRsZU1lc3NhZ2UoXCJJbmZ1cmFQcm92aWRlclwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJvdmlkZXItaW5mdXJhLmpzLm1hcCIsIi8qKlxuICogIFtbbGluay1xdWlja25vZGVdXSBwcm92aWRlcyBhIHRoaXJkLXBhcnR5IHNlcnZpY2UgZm9yIGNvbm5lY3RpbmcgdG9cbiAqICB2YXJpb3VzIGJsb2NrY2hhaW5zIG92ZXIgSlNPTi1SUEMuXG4gKlxuICogICoqU3VwcG9ydGVkIE5ldHdvcmtzKipcbiAqXG4gKiAgLSBFdGhlcmV1bSBNYWlubmV0IChgYG1haW5uZXRgYClcbiAqICAtIEdvZXJsaSBUZXN0bmV0IChgYGdvZXJsaWBgKVxuICogIC0gU2Vwb2xpYSBUZXN0bmV0IChgYHNlcG9saWFgYClcbiAqICAtIEhvbGVza3kgVGVzdG5ldCAoYGBob2xlc2t5YGApXG4gKiAgLSBBcmJpdHJ1bSAoYGBhcmJpdHJ1bWBgKVxuICogIC0gQXJiaXRydW0gR29lcmxpIFRlc3RuZXQgKGBgYXJiaXRydW0tZ29lcmxpYGApXG4gKiAgLSBBcmJpdHJ1bSBTZXBvbGlhIFRlc3RuZXQgKGBgYXJiaXRydW0tc2Vwb2xpYWBgKVxuICogIC0gQmFzZSBNYWlubmV0IChgYGJhc2VgYCk7XG4gKiAgLSBCYXNlIEdvZXJsaSBUZXN0bmV0IChgYGJhc2UtZ29lcmxpYGApO1xuICogIC0gQmFzZSBTZXBvbGlhIFRlc3RuZXQgKGBgYmFzZS1zZXBvbGlhYGApO1xuICogIC0gQk5CIFNtYXJ0IENoYWluIE1haW5uZXQgKGBgYm5iYGApXG4gKiAgLSBCTkIgU21hcnQgQ2hhaW4gVGVzdG5ldCAoYGBibmJ0YGApXG4gKiAgLSBPcHRpbWlzbSAoYGBvcHRpbWlzbWBgKVxuICogIC0gT3B0aW1pc20gR29lcmxpIFRlc3RuZXQgKGBgb3B0aW1pc20tZ29lcmxpYGApXG4gKiAgLSBPcHRpbWlzbSBTZXBvbGlhIFRlc3RuZXQgKGBgb3B0aW1pc20tc2Vwb2xpYWBgKVxuICogIC0gUG9seWdvbiAoYGBtYXRpY2BgKVxuICogIC0gUG9seWdvbiBNdW1iYWkgVGVzdG5ldCAoYGBtYXRpYy1tdW1iYWlgYClcbiAqXG4gKiAgQF9zdWJzZWN0aW9uOiBhcGkvcHJvdmlkZXJzL3RoaXJkcGFydHk6UXVpY2tOb2RlICBbcHJvdmlkZXJzLXF1aWNrbm9kZV1cbiAqL1xuaW1wb3J0IHsgZGVmaW5lUHJvcGVydGllcywgRmV0Y2hSZXF1ZXN0LCBhc3NlcnRBcmd1bWVudCB9IGZyb20gXCIuLi91dGlscy9pbmRleC5qc1wiO1xuaW1wb3J0IHsgc2hvd1Rocm90dGxlTWVzc2FnZSB9IGZyb20gXCIuL2NvbW11bml0eS5qc1wiO1xuaW1wb3J0IHsgTmV0d29yayB9IGZyb20gXCIuL25ldHdvcmsuanNcIjtcbmltcG9ydCB7IEpzb25ScGNQcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLWpzb25ycGMuanNcIjtcbmNvbnN0IGRlZmF1bHRUb2tlbiA9IFwiOTE5YjQxMmEwNTdiNWU5YzliNmRjZTE5M2M1YTYwMjQyZDZlZmFkYlwiO1xuZnVuY3Rpb24gZ2V0SG9zdChuYW1lKSB7XG4gICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgIGNhc2UgXCJtYWlubmV0XCI6XG4gICAgICAgICAgICByZXR1cm4gXCJldGhlcnMucXVpa25vZGUucHJvXCI7XG4gICAgICAgIGNhc2UgXCJnb2VybGlcIjpcbiAgICAgICAgICAgIHJldHVybiBcImV0aGVycy5ldGhlcmV1bS1nb2VybGkucXVpa25vZGUucHJvXCI7XG4gICAgICAgIGNhc2UgXCJzZXBvbGlhXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJldGhlcnMuZXRoZXJldW0tc2Vwb2xpYS5xdWlrbm9kZS5wcm9cIjtcbiAgICAgICAgY2FzZSBcImhvbGVza3lcIjpcbiAgICAgICAgICAgIHJldHVybiBcImV0aGVycy5ldGhlcmV1bS1ob2xlc2t5LnF1aWtub2RlLnByb1wiO1xuICAgICAgICBjYXNlIFwiYXJiaXRydW1cIjpcbiAgICAgICAgICAgIHJldHVybiBcImV0aGVycy5hcmJpdHJ1bS1tYWlubmV0LnF1aWtub2RlLnByb1wiO1xuICAgICAgICBjYXNlIFwiYXJiaXRydW0tZ29lcmxpXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJldGhlcnMuYXJiaXRydW0tZ29lcmxpLnF1aWtub2RlLnByb1wiO1xuICAgICAgICBjYXNlIFwiYXJiaXRydW0tc2Vwb2xpYVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiZXRoZXJzLmFyYml0cnVtLXNlcG9saWEucXVpa25vZGUucHJvXCI7XG4gICAgICAgIGNhc2UgXCJiYXNlXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJldGhlcnMuYmFzZS1tYWlubmV0LnF1aWtub2RlLnByb1wiO1xuICAgICAgICBjYXNlIFwiYmFzZS1nb2VybGlcIjpcbiAgICAgICAgICAgIHJldHVybiBcImV0aGVycy5iYXNlLWdvZXJsaS5xdWlrbm9kZS5wcm9cIjtcbiAgICAgICAgY2FzZSBcImJhc2Utc3BvbGlhXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJldGhlcnMuYmFzZS1zZXBvbGlhLnF1aWtub2RlLnByb1wiO1xuICAgICAgICBjYXNlIFwiYm5iXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJldGhlcnMuYnNjLnF1aWtub2RlLnByb1wiO1xuICAgICAgICBjYXNlIFwiYm5idFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiZXRoZXJzLmJzYy10ZXN0bmV0LnF1aWtub2RlLnByb1wiO1xuICAgICAgICBjYXNlIFwibWF0aWNcIjpcbiAgICAgICAgICAgIHJldHVybiBcImV0aGVycy5tYXRpYy5xdWlrbm9kZS5wcm9cIjtcbiAgICAgICAgY2FzZSBcIm1hdGljLW11bWJhaVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiZXRoZXJzLm1hdGljLXRlc3RuZXQucXVpa25vZGUucHJvXCI7XG4gICAgICAgIGNhc2UgXCJvcHRpbWlzbVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiZXRoZXJzLm9wdGltaXNtLnF1aWtub2RlLnByb1wiO1xuICAgICAgICBjYXNlIFwib3B0aW1pc20tZ29lcmxpXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJldGhlcnMub3B0aW1pc20tZ29lcmxpLnF1aWtub2RlLnByb1wiO1xuICAgICAgICBjYXNlIFwib3B0aW1pc20tc2Vwb2xpYVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiZXRoZXJzLm9wdGltaXNtLXNlcG9saWEucXVpa25vZGUucHJvXCI7XG4gICAgICAgIGNhc2UgXCJ4ZGFpXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJldGhlcnMueGRhaS5xdWlrbm9kZS5wcm9cIjtcbiAgICB9XG4gICAgYXNzZXJ0QXJndW1lbnQoZmFsc2UsIFwidW5zdXBwb3J0ZWQgbmV0d29ya1wiLCBcIm5ldHdvcmtcIiwgbmFtZSk7XG59XG4vKlxuQFRPRE86XG4gIFRoZXNlIG5ldHdvcmtzIGFyZSBub3QgY3VycmVudGx5IHByZXNlbnQgaW4gdGhlIE5ldHdvcmtcbiAgZGVmYXVsdCBpbmNsdWRlZCBuZXR3b3Jrcy4gUmVzZWFyY2ggdGhlbSBhbmQgZW5zdXJlIHRoZXlcbiAgYXJlIEVWTSBjb21wYXRpYmxlIGFuZCB3b3JrIHdpdGggZXRoZXJzXG5cbiAgaHR0cDovL2V0aGVycy5tYXRpYy1hbW95LnF1aWtub2RlLnByb1xuXG4gIGh0dHA6Ly9ldGhlcnMuYXZhbGFuY2hlLW1haW5uZXQucXVpa25vZGUucHJvXG4gIGh0dHA6Ly9ldGhlcnMuYXZhbGFuY2hlLXRlc3RuZXQucXVpa25vZGUucHJvXG4gIGh0dHA6Ly9ldGhlcnMuYmxhc3Qtc2Vwb2xpYS5xdWlrbm9kZS5wcm9cbiAgaHR0cDovL2V0aGVycy5jZWxvLW1haW5uZXQucXVpa25vZGUucHJvXG4gIGh0dHA6Ly9ldGhlcnMuZmFudG9tLnF1aWtub2RlLnByb1xuICBodHRwOi8vZXRoZXJzLmlteC1kZW1vLnF1aWtub2RlLnByb1xuICBodHRwOi8vZXRoZXJzLmlteC1tYWlubmV0LnF1aWtub2RlLnByb1xuICBodHRwOi8vZXRoZXJzLmlteC10ZXN0bmV0LnF1aWtub2RlLnByb1xuICBodHRwOi8vZXRoZXJzLm5lYXItbWFpbm5ldC5xdWlrbm9kZS5wcm9cbiAgaHR0cDovL2V0aGVycy5uZWFyLXRlc3RuZXQucXVpa25vZGUucHJvXG4gIGh0dHA6Ly9ldGhlcnMubm92YS1tYWlubmV0LnF1aWtub2RlLnByb1xuICBodHRwOi8vZXRoZXJzLnNjcm9sbC1tYWlubmV0LnF1aWtub2RlLnByb1xuICBodHRwOi8vZXRoZXJzLnNjcm9sbC10ZXN0bmV0LnF1aWtub2RlLnByb1xuICBodHRwOi8vZXRoZXJzLnRyb24tbWFpbm5ldC5xdWlrbm9kZS5wcm9cbiAgaHR0cDovL2V0aGVycy56a2V2bS1tYWlubmV0LnF1aWtub2RlLnByb1xuICBodHRwOi8vZXRoZXJzLnprZXZtLXRlc3RuZXQucXVpa25vZGUucHJvXG4gIGh0dHA6Ly9ldGhlcnMuemtzeW5jLW1haW5uZXQucXVpa25vZGUucHJvXG4gIGh0dHA6Ly9ldGhlcnMuemtzeW5jLXRlc3RuZXQucXVpa25vZGUucHJvXG4qL1xuLyoqXG4gKiAgVGhlICoqUXVpY2tOb2RlUHJvdmlkZXIqKiBjb25uZWN0cyB0byB0aGUgW1tsaW5rLXF1aWNrbm9kZV1dXG4gKiAgSlNPTi1SUEMgZW5kLXBvaW50cy5cbiAqXG4gKiAgQnkgZGVmYXVsdCwgYSBoaWdobHktdGhyb3R0bGVkIEFQSSB0b2tlbiBpcyB1c2VkLCB3aGljaCBpc1xuICogIGFwcHJvcHJpYXRlIGZvciBxdWljayBwcm90b3R5cGVzIGFuZCBzaW1wbGUgc2NyaXB0cy4gVG9cbiAqICBnYWluIGFjY2VzcyB0byBhbiBpbmNyZWFzZWQgcmF0ZS1saW1pdCwgaXQgaXMgaGlnaGx5XG4gKiAgcmVjb21tZW5kZWQgdG8gW3NpZ24gdXAgaGVyZV0obGluay1xdWlja25vZGUpLlxuICovXG5leHBvcnQgY2xhc3MgUXVpY2tOb2RlUHJvdmlkZXIgZXh0ZW5kcyBKc29uUnBjUHJvdmlkZXIge1xuICAgIC8qKlxuICAgICAqICBUaGUgQVBJIHRva2VuLlxuICAgICAqL1xuICAgIHRva2VuO1xuICAgIC8qKlxuICAgICAqICBDcmVhdGVzIGEgbmV3ICoqUXVpY2tOb2RlUHJvdmlkZXIqKi5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihfbmV0d29yaywgdG9rZW4pIHtcbiAgICAgICAgaWYgKF9uZXR3b3JrID09IG51bGwpIHtcbiAgICAgICAgICAgIF9uZXR3b3JrID0gXCJtYWlubmV0XCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV0d29yayA9IE5ldHdvcmsuZnJvbShfbmV0d29yayk7XG4gICAgICAgIGlmICh0b2tlbiA9PSBudWxsKSB7XG4gICAgICAgICAgICB0b2tlbiA9IGRlZmF1bHRUb2tlbjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gUXVpY2tOb2RlUHJvdmlkZXIuZ2V0UmVxdWVzdChuZXR3b3JrLCB0b2tlbik7XG4gICAgICAgIHN1cGVyKHJlcXVlc3QsIG5ldHdvcmssIHsgc3RhdGljTmV0d29yazogbmV0d29yayB9KTtcbiAgICAgICAgZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7IHRva2VuIH0pO1xuICAgIH1cbiAgICBfZ2V0UHJvdmlkZXIoY2hhaW5JZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBRdWlja05vZGVQcm92aWRlcihjaGFpbklkLCB0aGlzLnRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHsgfVxuICAgICAgICByZXR1cm4gc3VwZXIuX2dldFByb3ZpZGVyKGNoYWluSWQpO1xuICAgIH1cbiAgICBpc0NvbW11bml0eVJlc291cmNlKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMudG9rZW4gPT09IGRlZmF1bHRUb2tlbik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqICBSZXR1cm5zIGEgbmV3IHJlcXVlc3QgcHJlcGFyZWQgZm9yICUlbmV0d29yayUlIGFuZCB0aGVcbiAgICAgKiAgJSV0b2tlbiUlLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRSZXF1ZXN0KG5ldHdvcmssIHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlbiA9PSBudWxsKSB7XG4gICAgICAgICAgICB0b2tlbiA9IGRlZmF1bHRUb2tlbjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gbmV3IEZldGNoUmVxdWVzdChgaHR0cHM6L1xcLyR7Z2V0SG9zdChuZXR3b3JrLm5hbWUpfS8ke3Rva2VufWApO1xuICAgICAgICByZXF1ZXN0LmFsbG93R3ppcCA9IHRydWU7XG4gICAgICAgIC8vaWYgKHByb2plY3RTZWNyZXQpIHsgcmVxdWVzdC5zZXRDcmVkZW50aWFscyhcIlwiLCBwcm9qZWN0U2VjcmV0KTsgfVxuICAgICAgICBpZiAodG9rZW4gPT09IGRlZmF1bHRUb2tlbikge1xuICAgICAgICAgICAgcmVxdWVzdC5yZXRyeUZ1bmMgPSBhc3luYyAocmVxdWVzdCwgcmVzcG9uc2UsIGF0dGVtcHQpID0+IHtcbiAgICAgICAgICAgICAgICBzaG93VGhyb3R0bGVNZXNzYWdlKFwiUXVpY2tOb2RlUHJvdmlkZXJcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByb3ZpZGVyLXF1aWNrbm9kZS5qcy5tYXAiLCIvKipcbiAqICBBICoqRmFsbGJhY2tQcm92aWRlcioqIHByb3ZpZGVzIHJlc2lsaWVuY2UsIHNlY3VyaXR5IGFuZCBwZXJmb3JtYW5jZVxuICogIGluIGEgd2F5IHRoYXQgaXMgY3VzdG9taXphYmxlIGFuZCBjb25maWd1cmFibGUuXG4gKlxuICogIEBfc2VjdGlvbjogYXBpL3Byb3ZpZGVycy9mYWxsYmFjay1wcm92aWRlcjpGYWxsYmFjayBQcm92aWRlciBbYWJvdXQtZmFsbGJhY2stcHJvdmlkZXJdXG4gKi9cbmltcG9ydCB7IGFzc2VydCwgYXNzZXJ0QXJndW1lbnQsIGdldEJpZ0ludCwgZ2V0TnVtYmVyLCBpc0Vycm9yIH0gZnJvbSBcIi4uL3V0aWxzL2luZGV4LmpzXCI7XG5pbXBvcnQgeyBBYnN0cmFjdFByb3ZpZGVyIH0gZnJvbSBcIi4vYWJzdHJhY3QtcHJvdmlkZXIuanNcIjtcbmltcG9ydCB7IE5ldHdvcmsgfSBmcm9tIFwiLi9uZXR3b3JrLmpzXCI7XG5jb25zdCBCTl8xID0gQmlnSW50KFwiMVwiKTtcbmNvbnN0IEJOXzIgPSBCaWdJbnQoXCIyXCIpO1xuZnVuY3Rpb24gc2h1ZmZsZShhcnJheSkge1xuICAgIGZvciAobGV0IGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgICAgIGNvbnN0IGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaSArIDEpKTtcbiAgICAgICAgY29uc3QgdG1wID0gYXJyYXlbaV07XG4gICAgICAgIGFycmF5W2ldID0gYXJyYXlbal07XG4gICAgICAgIGFycmF5W2pdID0gdG1wO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHN0YWxsKGR1cmF0aW9uKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7IHNldFRpbWVvdXQocmVzb2x2ZSwgZHVyYXRpb24pOyB9KTtcbn1cbmZ1bmN0aW9uIGdldFRpbWUoKSB7IHJldHVybiAobmV3IERhdGUoKSkuZ2V0VGltZSgpOyB9XG5mdW5jdGlvbiBzdHJpbmdpZnkodmFsdWUpIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUsIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgKHZhbHVlKSA9PT0gXCJiaWdpbnRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJiaWdpbnRcIiwgdmFsdWU6IHZhbHVlLnRvU3RyaW5nKCkgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSk7XG59XG47XG5jb25zdCBkZWZhdWx0Q29uZmlnID0geyBzdGFsbFRpbWVvdXQ6IDQwMCwgcHJpb3JpdHk6IDEsIHdlaWdodDogMSB9O1xuY29uc3QgZGVmYXVsdFN0YXRlID0ge1xuICAgIGJsb2NrTnVtYmVyOiAtMiwgcmVxdWVzdHM6IDAsIGxhdGVSZXNwb25zZXM6IDAsIGVycm9yUmVzcG9uc2VzOiAwLFxuICAgIG91dE9mU3luYzogLTEsIHVuc3VwcG9ydGVkRXZlbnRzOiAwLCByb2xsaW5nRHVyYXRpb246IDAsIHNjb3JlOiAwLFxuICAgIF9uZXR3b3JrOiBudWxsLCBfdXBkYXRlTnVtYmVyOiBudWxsLCBfdG90YWxUaW1lOiAwLFxuICAgIF9sYXN0RmF0YWxFcnJvcjogbnVsbCwgX2xhc3RGYXRhbEVycm9yVGltZXN0YW1wOiAwXG59O1xuYXN5bmMgZnVuY3Rpb24gd2FpdEZvclN5bmMoY29uZmlnLCBibG9ja051bWJlcikge1xuICAgIHdoaWxlIChjb25maWcuYmxvY2tOdW1iZXIgPCAwIHx8IGNvbmZpZy5ibG9ja051bWJlciA8IGJsb2NrTnVtYmVyKSB7XG4gICAgICAgIGlmICghY29uZmlnLl91cGRhdGVOdW1iZXIpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fdXBkYXRlTnVtYmVyID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBibG9ja051bWJlciA9IGF3YWl0IGNvbmZpZy5wcm92aWRlci5nZXRCbG9ja051bWJlcigpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmxvY2tOdW1iZXIgPiBjb25maWcuYmxvY2tOdW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5ibG9ja051bWJlciA9IGJsb2NrTnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuYmxvY2tOdW1iZXIgPSAtMjtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLl9sYXN0RmF0YWxFcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuX2xhc3RGYXRhbEVycm9yVGltZXN0YW1wID0gZ2V0VGltZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25maWcuX3VwZGF0ZU51bWJlciA9IG51bGw7XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IGNvbmZpZy5fdXBkYXRlTnVtYmVyO1xuICAgICAgICBjb25maWcub3V0T2ZTeW5jKys7XG4gICAgICAgIGlmIChjb25maWcuX2xhc3RGYXRhbEVycm9yKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIF9ub3JtYWxpemUodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gXCJudWxsXCI7XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gXCJbXCIgKyAodmFsdWUubWFwKF9ub3JtYWxpemUpKS5qb2luKFwiLFwiKSArIFwiXVwiO1xuICAgIH1cbiAgICBpZiAodHlwZW9mICh2YWx1ZSkgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mICh2YWx1ZS50b0pTT04pID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIF9ub3JtYWxpemUodmFsdWUudG9KU09OKCkpO1xuICAgIH1cbiAgICBzd2l0Y2ggKHR5cGVvZiAodmFsdWUpKSB7XG4gICAgICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgICAgIGNhc2UgXCJzeW1ib2xcIjpcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICAgICAgICBjYXNlIFwiYmlnaW50XCI6XG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgICAgIHJldHVybiBCaWdJbnQodmFsdWUpLnRvU3RyaW5nKCk7XG4gICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgIGNhc2UgXCJvYmplY3RcIjoge1xuICAgICAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgICAgICAgICAgIGtleXMuc29ydCgpO1xuICAgICAgICAgICAgcmV0dXJuIFwie1wiICsga2V5cy5tYXAoKGspID0+IGAke0pTT04uc3RyaW5naWZ5KGspfToke19ub3JtYWxpemUodmFsdWVba10pfWApLmpvaW4oXCIsXCIpICsgXCJ9XCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2coXCJDb3VsZCBub3Qgc2VyaWFsaXplXCIsIHZhbHVlKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJIbW0uLi5cIik7XG59XG5mdW5jdGlvbiBub3JtYWxpemVSZXN1bHQobWV0aG9kLCB2YWx1ZSkge1xuICAgIGlmIChcImVycm9yXCIgaW4gdmFsdWUpIHtcbiAgICAgICAgY29uc3QgZXJyb3IgPSB2YWx1ZS5lcnJvcjtcbiAgICAgICAgbGV0IHRhZztcbiAgICAgICAgaWYgKGlzRXJyb3IoZXJyb3IsIFwiQ0FMTF9FWENFUFRJT05cIikpIHtcbiAgICAgICAgICAgIHRhZyA9IF9ub3JtYWxpemUoT2JqZWN0LmFzc2lnbih7fSwgZXJyb3IsIHtcbiAgICAgICAgICAgICAgICBzaG9ydE1lc3NhZ2U6IHVuZGVmaW5lZCwgcmVhc29uOiB1bmRlZmluZWQsIGluZm86IHVuZGVmaW5lZFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGFnID0gX25vcm1hbGl6ZShlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgdGFnLCB2YWx1ZTogZXJyb3IgfTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0ID0gdmFsdWUucmVzdWx0O1xuICAgIHJldHVybiB7IHRhZzogX25vcm1hbGl6ZShyZXN1bHQpLCB2YWx1ZTogcmVzdWx0IH07XG59XG4vLyBUaGlzIHN0cmF0ZWd5IHBpY2tzIHRoZSBoaWdoZXN0IHdlaWdodCByZXN1bHQsIGFzIGxvbmcgYXMgdGhlIHdlaWdodCBpc1xuLy8gZXF1YWwgdG8gb3IgZ3JlYXRlciB0aGFuIHF1b3J1bVxuZnVuY3Rpb24gY2hlY2tRdW9ydW0ocXVvcnVtLCByZXN1bHRzKSB7XG4gICAgY29uc3QgdGFsbHkgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCB7IHZhbHVlLCB0YWcsIHdlaWdodCB9IG9mIHJlc3VsdHMpIHtcbiAgICAgICAgY29uc3QgdCA9IHRhbGx5LmdldCh0YWcpIHx8IHsgdmFsdWUsIHdlaWdodDogMCB9O1xuICAgICAgICB0LndlaWdodCArPSB3ZWlnaHQ7XG4gICAgICAgIHRhbGx5LnNldCh0YWcsIHQpO1xuICAgIH1cbiAgICBsZXQgYmVzdCA9IG51bGw7XG4gICAgZm9yIChjb25zdCByIG9mIHRhbGx5LnZhbHVlcygpKSB7XG4gICAgICAgIGlmIChyLndlaWdodCA+PSBxdW9ydW0gJiYgKCFiZXN0IHx8IHIud2VpZ2h0ID4gYmVzdC53ZWlnaHQpKSB7XG4gICAgICAgICAgICBiZXN0ID0gcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYmVzdCkge1xuICAgICAgICByZXR1cm4gYmVzdC52YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbmZ1bmN0aW9uIGdldE1lZGlhbihxdW9ydW0sIHJlc3VsdHMpIHtcbiAgICBsZXQgcmVzdWx0V2VpZ2h0ID0gMDtcbiAgICBjb25zdCBlcnJvck1hcCA9IG5ldyBNYXAoKTtcbiAgICBsZXQgYmVzdEVycm9yID0gbnVsbDtcbiAgICBjb25zdCB2YWx1ZXMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHsgdmFsdWUsIHRhZywgd2VpZ2h0IH0gb2YgcmVzdWx0cykge1xuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZSA9IGVycm9yTWFwLmdldCh0YWcpIHx8IHsgdmFsdWUsIHdlaWdodDogMCB9O1xuICAgICAgICAgICAgZS53ZWlnaHQgKz0gd2VpZ2h0O1xuICAgICAgICAgICAgZXJyb3JNYXAuc2V0KHRhZywgZSk7XG4gICAgICAgICAgICBpZiAoYmVzdEVycm9yID09IG51bGwgfHwgZS53ZWlnaHQgPiBiZXN0RXJyb3Iud2VpZ2h0KSB7XG4gICAgICAgICAgICAgICAgYmVzdEVycm9yID0gZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlcy5wdXNoKEJpZ0ludCh2YWx1ZSkpO1xuICAgICAgICAgICAgcmVzdWx0V2VpZ2h0ICs9IHdlaWdodDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAocmVzdWx0V2VpZ2h0IDwgcXVvcnVtKSB7XG4gICAgICAgIC8vIFdlIGhhdmUgcXVvcnVtIGZvciBhbiBlcnJvclxuICAgICAgICBpZiAoYmVzdEVycm9yICYmIGJlc3RFcnJvci53ZWlnaHQgPj0gcXVvcnVtKSB7XG4gICAgICAgICAgICByZXR1cm4gYmVzdEVycm9yLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdlIGRvIG5vdCBoYXZlIHF1b3J1bSBmb3IgYSByZXN1bHRcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLy8gR2V0IHRoZSBzb3J0ZWQgdmFsdWVzXG4gICAgdmFsdWVzLnNvcnQoKGEsIGIpID0+ICgoYSA8IGIpID8gLTEgOiAoYiA+IGEpID8gMSA6IDApKTtcbiAgICBjb25zdCBtaWQgPSBNYXRoLmZsb29yKHZhbHVlcy5sZW5ndGggLyAyKTtcbiAgICAvLyBPZGQtbGVuZ3RoOyB0YWtlIHRoZSBtaWRkbGUgdmFsdWVcbiAgICBpZiAodmFsdWVzLmxlbmd0aCAlIDIpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlc1ttaWRdO1xuICAgIH1cbiAgICAvLyBFdmVuIGxlbmd0aDsgdGFrZSB0aGUgY2VpbGluZyBvZiB0aGUgbWVhbiBvZiB0aGUgY2VudGVyIHR3byB2YWx1ZXNcbiAgICByZXR1cm4gKHZhbHVlc1ttaWQgLSAxXSArIHZhbHVlc1ttaWRdICsgQk5fMSkgLyBCTl8yO1xufVxuZnVuY3Rpb24gZ2V0QW55UmVzdWx0KHF1b3J1bSwgcmVzdWx0cykge1xuICAgIC8vIElmIGFueSB2YWx1ZSBvciBlcnJvciBtZWV0cyBxdW9ydW0sIHRoYXQgaXMgb3VyIHByZWZlcnJlZCByZXN1bHRcbiAgICBjb25zdCByZXN1bHQgPSBjaGVja1F1b3J1bShxdW9ydW0sIHJlc3VsdHMpO1xuICAgIGlmIChyZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICAvLyBPdGhlcndpc2UsIGRvIHdlIGhhdmUgYW55IHJlc3VsdD9cbiAgICBmb3IgKGNvbnN0IHIgb2YgcmVzdWx0cykge1xuICAgICAgICBpZiAoci52YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHIudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gTm9wZSFcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gZ2V0RnV6enlNb2RlKHF1b3J1bSwgcmVzdWx0cykge1xuICAgIGlmIChxdW9ydW0gPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIGdldE51bWJlcihnZXRNZWRpYW4ocXVvcnVtLCByZXN1bHRzKSwgXCIlaW50ZXJuYWxcIik7XG4gICAgfVxuICAgIGNvbnN0IHRhbGx5ID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IGFkZCA9IChyZXN1bHQsIHdlaWdodCkgPT4ge1xuICAgICAgICBjb25zdCB0ID0gdGFsbHkuZ2V0KHJlc3VsdCkgfHwgeyByZXN1bHQsIHdlaWdodDogMCB9O1xuICAgICAgICB0LndlaWdodCArPSB3ZWlnaHQ7XG4gICAgICAgIHRhbGx5LnNldChyZXN1bHQsIHQpO1xuICAgIH07XG4gICAgZm9yIChjb25zdCB7IHdlaWdodCwgdmFsdWUgfSBvZiByZXN1bHRzKSB7XG4gICAgICAgIGNvbnN0IHIgPSBnZXROdW1iZXIodmFsdWUpO1xuICAgICAgICBhZGQociAtIDEsIHdlaWdodCk7XG4gICAgICAgIGFkZChyLCB3ZWlnaHQpO1xuICAgICAgICBhZGQociArIDEsIHdlaWdodCk7XG4gICAgfVxuICAgIGxldCBiZXN0V2VpZ2h0ID0gMDtcbiAgICBsZXQgYmVzdFJlc3VsdCA9IHVuZGVmaW5lZDtcbiAgICBmb3IgKGNvbnN0IHsgd2VpZ2h0LCByZXN1bHQgfSBvZiB0YWxseS52YWx1ZXMoKSkge1xuICAgICAgICAvLyBVc2UgdGhpcyByZXN1bHQsIGlmIHRoaXMgcmVzdWx0IG1lZXRzIHF1b3J1bSBhbmQgaGFzIGVpdGhlcjpcbiAgICAgICAgLy8gLSBhIGJldHRlciB3ZWlnaHRcbiAgICAgICAgLy8gLSBvciBlcXVhbCB3ZWlnaHQsIGJ1dCB0aGUgcmVzdWx0IGlzIGxhcmdlclxuICAgICAgICBpZiAod2VpZ2h0ID49IHF1b3J1bSAmJiAod2VpZ2h0ID4gYmVzdFdlaWdodCB8fCAoYmVzdFJlc3VsdCAhPSBudWxsICYmIHdlaWdodCA9PT0gYmVzdFdlaWdodCAmJiByZXN1bHQgPiBiZXN0UmVzdWx0KSkpIHtcbiAgICAgICAgICAgIGJlc3RXZWlnaHQgPSB3ZWlnaHQ7XG4gICAgICAgICAgICBiZXN0UmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBiZXN0UmVzdWx0O1xufVxuLyoqXG4gKiAgQSAqKkZhbGxiYWNrUHJvdmlkZXIqKiBtYW5hZ2VzIHNldmVyYWwgW1tQcm92aWRlcnNdXSBwcm92aWRpbmdcbiAqICByZXNpbGllbmNlIGJ5IHN3aXRjaGluZyBiZXR3ZWVuIHNsb3cgb3IgbWlzYmVoYXZpbmcgbm9kZXMsIHNlY3VyaXR5XG4gKiAgYnkgcmVxdWlyaW5nIG11bHRpcGxlIGJhY2tlbmRzIHRvIGFnZ3JlZSBhbmQgcGVyZm9ybWFuY2UgYnkgYWxsb3dpbmdcbiAqICBmYXN0ZXIgYmFja2VuZHMgdG8gcmVzcG9uZCBlYXJsaWVyLlxuICpcbiAqL1xuZXhwb3J0IGNsYXNzIEZhbGxiYWNrUHJvdmlkZXIgZXh0ZW5kcyBBYnN0cmFjdFByb3ZpZGVyIHtcbiAgICAvKipcbiAgICAgKiAgVGhlIG51bWJlciBvZiBiYWNrZW5kcyB0aGF0IG11c3QgYWdyZWUgb24gYSB2YWx1ZSBiZWZvcmUgaXQgaXNcbiAgICAgKiAgYWNjcGV0ZWQuXG4gICAgICovXG4gICAgcXVvcnVtO1xuICAgIC8qKlxuICAgICAqICBAX2lnbm9yZTpcbiAgICAgKi9cbiAgICBldmVudFF1b3J1bTtcbiAgICAvKipcbiAgICAgKiAgQF9pZ25vcmU6XG4gICAgICovXG4gICAgZXZlbnRXb3JrZXJzO1xuICAgICNjb25maWdzO1xuICAgICNoZWlnaHQ7XG4gICAgI2luaXRpYWxTeW5jUHJvbWlzZTtcbiAgICAvKipcbiAgICAgKiAgQ3JlYXRlcyBhIG5ldyAqKkZhbGxiYWNrUHJvdmlkZXIqKiB3aXRoICUlcHJvdmlkZXJzJSUgY29ubmVjdGVkIHRvXG4gICAgICogICUlbmV0d29yayUlLlxuICAgICAqXG4gICAgICogIElmIGEgW1tQcm92aWRlcl1dIGlzIGluY2x1ZGVkIGluICUlcHJvdmlkZXJzJSUsIGRlZmF1bHRzIGFyZSB1c2VkXG4gICAgICogIGZvciB0aGUgY29uZmlndXJhdGlvbi5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihwcm92aWRlcnMsIG5ldHdvcmssIG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIobmV0d29yaywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuI2NvbmZpZ3MgPSBwcm92aWRlcnMubWFwKChwKSA9PiB7XG4gICAgICAgICAgICBpZiAocCBpbnN0YW5jZW9mIEFic3RyYWN0UHJvdmlkZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7IHByb3ZpZGVyOiBwIH0sIGRlZmF1bHRDb25maWcsIGRlZmF1bHRTdGF0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdENvbmZpZywgcCwgZGVmYXVsdFN0YXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuI2hlaWdodCA9IC0yO1xuICAgICAgICB0aGlzLiNpbml0aWFsU3luY1Byb21pc2UgPSBudWxsO1xuICAgICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnF1b3J1bSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnF1b3J1bSA9IG9wdGlvbnMucXVvcnVtO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5xdW9ydW0gPSBNYXRoLmNlaWwodGhpcy4jY29uZmlncy5yZWR1Y2UoKGFjY3VtLCBjb25maWcpID0+IHtcbiAgICAgICAgICAgICAgICBhY2N1bSArPSBjb25maWcud2VpZ2h0O1xuICAgICAgICAgICAgICAgIHJldHVybiBhY2N1bTtcbiAgICAgICAgICAgIH0sIDApIC8gMik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ldmVudFF1b3J1bSA9IDE7XG4gICAgICAgIHRoaXMuZXZlbnRXb3JrZXJzID0gMTtcbiAgICAgICAgYXNzZXJ0QXJndW1lbnQodGhpcy5xdW9ydW0gPD0gdGhpcy4jY29uZmlncy5yZWR1Y2UoKGEsIGMpID0+IChhICsgYy53ZWlnaHQpLCAwKSwgXCJxdW9ydW0gZXhjZWVkIHByb3ZpZGVyIHdlaWdodFwiLCBcInF1b3J1bVwiLCB0aGlzLnF1b3J1bSk7XG4gICAgfVxuICAgIGdldCBwcm92aWRlckNvbmZpZ3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiNjb25maWdzLm1hcCgoYykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gT2JqZWN0LmFzc2lnbih7fSwgYyk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5WzBdID09PSBcIl9cIikge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgcmVzdWx0W2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jIF9kZXRlY3ROZXR3b3JrKCkge1xuICAgICAgICByZXR1cm4gTmV0d29yay5mcm9tKGdldEJpZ0ludChhd2FpdCB0aGlzLl9wZXJmb3JtKHsgbWV0aG9kOiBcImNoYWluSWRcIiB9KSkpO1xuICAgIH1cbiAgICAvLyBAVE9ETzogQWRkIHN1cHBvcnQgdG8gc2VsZWN0IHByb3ZpZGVycyB0byBiZSB0aGUgZXZlbnQgc3Vic2NyaWJlclxuICAgIC8vX2dldFN1YnNjcmliZXIoc3ViOiBTdWJzY3JpcHRpb24pOiBTdWJzY3JpYmVyIHtcbiAgICAvLyAgICB0aHJvdyBuZXcgRXJyb3IoXCJAVE9ET1wiKTtcbiAgICAvL31cbiAgICAvKipcbiAgICAgKiAgVHJhbnNmb3JtcyBhICUlcmVxJSUgaW50byB0aGUgY29ycmVjdCBtZXRob2QgY2FsbCBvbiAlJXByb3ZpZGVyJSUuXG4gICAgICovXG4gICAgYXN5bmMgX3RyYW5zbGF0ZVBlcmZvcm0ocHJvdmlkZXIsIHJlcSkge1xuICAgICAgICBzd2l0Y2ggKHJlcS5tZXRob2QpIHtcbiAgICAgICAgICAgIGNhc2UgXCJicm9hZGNhc3RUcmFuc2FjdGlvblwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBwcm92aWRlci5icm9hZGNhc3RUcmFuc2FjdGlvbihyZXEuc2lnbmVkVHJhbnNhY3Rpb24pO1xuICAgICAgICAgICAgY2FzZSBcImNhbGxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgcHJvdmlkZXIuY2FsbChPYmplY3QuYXNzaWduKHt9LCByZXEudHJhbnNhY3Rpb24sIHsgYmxvY2tUYWc6IHJlcS5ibG9ja1RhZyB9KSk7XG4gICAgICAgICAgICBjYXNlIFwiY2hhaW5JZFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiAoYXdhaXQgcHJvdmlkZXIuZ2V0TmV0d29yaygpKS5jaGFpbklkO1xuICAgICAgICAgICAgY2FzZSBcImVzdGltYXRlR2FzXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHByb3ZpZGVyLmVzdGltYXRlR2FzKHJlcS50cmFuc2FjdGlvbik7XG4gICAgICAgICAgICBjYXNlIFwiZ2V0QmFsYW5jZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBwcm92aWRlci5nZXRCYWxhbmNlKHJlcS5hZGRyZXNzLCByZXEuYmxvY2tUYWcpO1xuICAgICAgICAgICAgY2FzZSBcImdldEJsb2NrXCI6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBibG9jayA9IChcImJsb2NrSGFzaFwiIGluIHJlcSkgPyByZXEuYmxvY2tIYXNoIDogcmVxLmJsb2NrVGFnO1xuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBwcm92aWRlci5nZXRCbG9jayhibG9jaywgcmVxLmluY2x1ZGVUcmFuc2FjdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBcImdldEJsb2NrTnVtYmVyXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHByb3ZpZGVyLmdldEJsb2NrTnVtYmVyKCk7XG4gICAgICAgICAgICBjYXNlIFwiZ2V0Q29kZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBwcm92aWRlci5nZXRDb2RlKHJlcS5hZGRyZXNzLCByZXEuYmxvY2tUYWcpO1xuICAgICAgICAgICAgY2FzZSBcImdldEdhc1ByaWNlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBwcm92aWRlci5nZXRGZWVEYXRhKCkpLmdhc1ByaWNlO1xuICAgICAgICAgICAgY2FzZSBcImdldFByaW9yaXR5RmVlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBwcm92aWRlci5nZXRGZWVEYXRhKCkpLm1heFByaW9yaXR5RmVlUGVyR2FzO1xuICAgICAgICAgICAgY2FzZSBcImdldExvZ3NcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgcHJvdmlkZXIuZ2V0TG9ncyhyZXEuZmlsdGVyKTtcbiAgICAgICAgICAgIGNhc2UgXCJnZXRTdG9yYWdlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHByb3ZpZGVyLmdldFN0b3JhZ2UocmVxLmFkZHJlc3MsIHJlcS5wb3NpdGlvbiwgcmVxLmJsb2NrVGFnKTtcbiAgICAgICAgICAgIGNhc2UgXCJnZXRUcmFuc2FjdGlvblwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbihyZXEuaGFzaCk7XG4gICAgICAgICAgICBjYXNlIFwiZ2V0VHJhbnNhY3Rpb25Db3VudFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbkNvdW50KHJlcS5hZGRyZXNzLCByZXEuYmxvY2tUYWcpO1xuICAgICAgICAgICAgY2FzZSBcImdldFRyYW5zYWN0aW9uUmVjZWlwdFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvblJlY2VpcHQocmVxLmhhc2gpO1xuICAgICAgICAgICAgY2FzZSBcImdldFRyYW5zYWN0aW9uUmVzdWx0XCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uUmVzdWx0KHJlcS5oYXNoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBHcmFiIHRoZSBuZXh0IChyYW5kb20pIGNvbmZpZyB0aGF0IGlzIG5vdCBhbHJlYWR5IHBhcnQgb2ZcbiAgICAvLyB0aGUgcnVubmluZyBzZXRcbiAgICAjZ2V0TmV4dENvbmZpZyhydW5uaW5nKSB7XG4gICAgICAgIC8vIEBUT0RPOiBNYXliZSBkbyBhIGNoZWNrIGhlcmUgdG8gZmF2b3VyIChoZWF2aWx5KSBwcm92aWRlcnMgdGhhdFxuICAgICAgICAvLyAgICAgICAgZG8gbm90IHJlcXVpcmUgd2FpdEZvclN5bmMgYW5kIGRpc2Zhdm91ciBwcm92aWRlcnMgdGhhdFxuICAgICAgICAvLyAgICAgICAgc2VlbSBkb3duLWlzaCBvciBhcmUgYmVoYXZpbmcgc2xvd2x5XG4gICAgICAgIGNvbnN0IGNvbmZpZ3MgPSBBcnJheS5mcm9tKHJ1bm5pbmcpLm1hcCgocikgPT4gci5jb25maWcpO1xuICAgICAgICAvLyBTaHVmZmxlIHRoZSBzdGF0ZXMsIHNvcnRlZCBieSBwcmlvcml0eVxuICAgICAgICBjb25zdCBhbGxDb25maWdzID0gdGhpcy4jY29uZmlncy5zbGljZSgpO1xuICAgICAgICBzaHVmZmxlKGFsbENvbmZpZ3MpO1xuICAgICAgICBhbGxDb25maWdzLnNvcnQoKGEsIGIpID0+IChhLnByaW9yaXR5IC0gYi5wcmlvcml0eSkpO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbmZpZyBvZiBhbGxDb25maWdzKSB7XG4gICAgICAgICAgICBpZiAoY29uZmlnLl9sYXN0RmF0YWxFcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvbmZpZ3MuaW5kZXhPZihjb25maWcpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25maWc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8vIEFkZHMgYSBuZXcgcnVubmVyIChpZiBhdmFpbGFibGUpIHRvIHJ1bm5pbmcuXG4gICAgI2FkZFJ1bm5lcihydW5uaW5nLCByZXEpIHtcbiAgICAgICAgY29uc3QgY29uZmlnID0gdGhpcy4jZ2V0TmV4dENvbmZpZyhydW5uaW5nKTtcbiAgICAgICAgLy8gTm8gcnVubmVycyBhdmFpbGFibGVcbiAgICAgICAgaWYgKGNvbmZpZyA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAvLyBDcmVhdGUgYSBuZXcgcnVubmVyXG4gICAgICAgIGNvbnN0IHJ1bm5lciA9IHtcbiAgICAgICAgICAgIGNvbmZpZywgcmVzdWx0OiBudWxsLCBkaWRCdW1wOiBmYWxzZSxcbiAgICAgICAgICAgIHBlcmZvcm06IG51bGwsIHN0YWxsZXI6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgbm93ID0gZ2V0VGltZSgpO1xuICAgICAgICAvLyBTdGFydCBwZXJmb3JtaW5nIHRoaXMgb3BlcmF0aW9uXG4gICAgICAgIHJ1bm5lci5wZXJmb3JtID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLnJlcXVlc3RzKys7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fdHJhbnNsYXRlUGVyZm9ybShjb25maWcucHJvdmlkZXIsIHJlcSk7XG4gICAgICAgICAgICAgICAgcnVubmVyLnJlc3VsdCA9IHsgcmVzdWx0IH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25maWcuZXJyb3JSZXNwb25zZXMrKztcbiAgICAgICAgICAgICAgICBydW5uZXIucmVzdWx0ID0geyBlcnJvciB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZHQgPSAoZ2V0VGltZSgpIC0gbm93KTtcbiAgICAgICAgICAgIGNvbmZpZy5fdG90YWxUaW1lICs9IGR0O1xuICAgICAgICAgICAgY29uZmlnLnJvbGxpbmdEdXJhdGlvbiA9IDAuOTUgKiBjb25maWcucm9sbGluZ0R1cmF0aW9uICsgMC4wNSAqIGR0O1xuICAgICAgICAgICAgcnVubmVyLnBlcmZvcm0gPSBudWxsO1xuICAgICAgICB9KSgpO1xuICAgICAgICAvLyBTdGFydCBhIHN0YWxsZXI7IHdoZW4gdGhpcyB0aW1lcyBvdXQsIGl0J3MgdGltZSB0byBmb3JjZVxuICAgICAgICAvLyBraWNraW5nIG9mZiBhbm90aGVyIHJ1bm5lciBiZWNhdXNlIHdlIGFyZSB0YWtpbmcgdG9vIGxvbmdcbiAgICAgICAgcnVubmVyLnN0YWxsZXIgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgYXdhaXQgc3RhbGwoY29uZmlnLnN0YWxsVGltZW91dCk7XG4gICAgICAgICAgICBydW5uZXIuc3RhbGxlciA9IG51bGw7XG4gICAgICAgIH0pKCk7XG4gICAgICAgIHJ1bm5pbmcuYWRkKHJ1bm5lcik7XG4gICAgICAgIHJldHVybiBydW5uZXI7XG4gICAgfVxuICAgIC8vIEluaXRpYWxpemVzIHRoZSBibG9ja051bWJlciBhbmQgbmV0d29yayBmb3IgZWFjaCBydW5uZXIgYW5kXG4gICAgLy8gYmxvY2tzIHVudGlsIGluaXRpYWxpemVkXG4gICAgYXN5bmMgI2luaXRpYWxTeW5jKCkge1xuICAgICAgICBsZXQgaW5pdGlhbFN5bmMgPSB0aGlzLiNpbml0aWFsU3luY1Byb21pc2U7XG4gICAgICAgIGlmICghaW5pdGlhbFN5bmMpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb21pc2VzID0gW107XG4gICAgICAgICAgICB0aGlzLiNjb25maWdzLmZvckVhY2goKGNvbmZpZykgPT4ge1xuICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2goKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgd2FpdEZvclN5bmMoY29uZmlnLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb25maWcuX2xhc3RGYXRhbEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcuX25ldHdvcmsgPSBhd2FpdCBjb25maWcucHJvdmlkZXIuZ2V0TmV0d29yaygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuI2luaXRpYWxTeW5jUHJvbWlzZSA9IGluaXRpYWxTeW5jID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBXYWl0IGZvciBhbGwgcHJvdmlkZXJzIHRvIGhhdmUgYSBibG9jayBudW1iZXIgYW5kIG5ldHdvcmtcbiAgICAgICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgYWxsIHRoZSBuZXR3b3JrcyBtYXRjaFxuICAgICAgICAgICAgICAgIGxldCBjaGFpbklkID0gbnVsbDtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNvbmZpZyBvZiB0aGlzLiNjb25maWdzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcuX2xhc3RGYXRhbEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXR3b3JrID0gKGNvbmZpZy5fbmV0d29yayk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFpbklkID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYWluSWQgPSBuZXR3b3JrLmNoYWluSWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobmV0d29yay5jaGFpbklkICE9PSBjaGFpbklkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UsIFwiY2Fubm90IG1peCBwcm92aWRlcnMgb24gZGlmZmVyZW50IG5ldHdvcmtzXCIsIFwiVU5TVVBQT1JURURfT1BFUkFUSU9OXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb246IFwibmV3IEZhbGxiYWNrUHJvdmlkZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IGluaXRpYWxTeW5jO1xuICAgIH1cbiAgICBhc3luYyAjY2hlY2tRdW9ydW0ocnVubmluZywgcmVxKSB7XG4gICAgICAgIC8vIEdldCBhbGwgdGhlIHJlc3VsdCBvYmplY3RzXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBydW5uZXIgb2YgcnVubmluZykge1xuICAgICAgICAgICAgaWYgKHJ1bm5lci5yZXN1bHQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgdGFnLCB2YWx1ZSB9ID0gbm9ybWFsaXplUmVzdWx0KHJlcS5tZXRob2QsIHJ1bm5lci5yZXN1bHQpO1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IHRhZywgdmFsdWUsIHdlaWdodDogcnVubmVyLmNvbmZpZy53ZWlnaHQgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gQXJlIHRoZXJlIGVub3VnaCByZXN1bHRzIHRvIGV2ZW50IG1lZXQgcXVvcnVtP1xuICAgICAgICBpZiAocmVzdWx0cy5yZWR1Y2UoKGEsIHIpID0+IChhICsgci53ZWlnaHQpLCAwKSA8IHRoaXMucXVvcnVtKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAocmVxLm1ldGhvZCkge1xuICAgICAgICAgICAgY2FzZSBcImdldEJsb2NrTnVtYmVyXCI6IHtcbiAgICAgICAgICAgICAgICAvLyBXZSBuZWVkIHRvIGdldCB0aGUgYm9vdHN0cmFwIGJsb2NrIGhlaWdodFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLiNoZWlnaHQgPT09IC0yKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuI2hlaWdodCA9IE1hdGguY2VpbChnZXROdW1iZXIoZ2V0TWVkaWFuKHRoaXMucXVvcnVtLCB0aGlzLiNjb25maWdzLmZpbHRlcigoYykgPT4gKCFjLl9sYXN0RmF0YWxFcnJvcikpLm1hcCgoYykgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjLmJsb2NrTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnOiBnZXROdW1iZXIoYy5ibG9ja051bWJlcikudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdlaWdodDogYy53ZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgfSkpKSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSBtb2RlIGFjcm9zcyBhbGwgdGhlIHByb3ZpZGVycywgYWxsb3dpbmcgZm9yXG4gICAgICAgICAgICAgICAgLy8gYSBsaXR0bGUgZHJpZnQgYmV0d2VlbiBibG9jayBoZWlnaHRzXG4gICAgICAgICAgICAgICAgY29uc3QgbW9kZSA9IGdldEZ1enp5TW9kZSh0aGlzLnF1b3J1bSwgcmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgaWYgKG1vZGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobW9kZSA+IHRoaXMuI2hlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiNoZWlnaHQgPSBtb2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy4jaGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBcImdldEdhc1ByaWNlXCI6XG4gICAgICAgICAgICBjYXNlIFwiZ2V0UHJpb3JpdHlGZWVcIjpcbiAgICAgICAgICAgIGNhc2UgXCJlc3RpbWF0ZUdhc1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiBnZXRNZWRpYW4odGhpcy5xdW9ydW0sIHJlc3VsdHMpO1xuICAgICAgICAgICAgY2FzZSBcImdldEJsb2NrXCI6XG4gICAgICAgICAgICAgICAgLy8gUGVuZGluZyBibG9ja3MgYXJlIGluIHRoZSBtZW1wb29sIGFuZCBhbHJlYWR5XG4gICAgICAgICAgICAgICAgLy8gcXVpdGUgdW50cnVzdHdvcnRoeTsganVzdCBncmFiIGFueXRoaW5nXG4gICAgICAgICAgICAgICAgaWYgKFwiYmxvY2tUYWdcIiBpbiByZXEgJiYgcmVxLmJsb2NrVGFnID09PSBcInBlbmRpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ2V0QW55UmVzdWx0KHRoaXMucXVvcnVtLCByZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoZWNrUXVvcnVtKHRoaXMucXVvcnVtLCByZXN1bHRzKTtcbiAgICAgICAgICAgIGNhc2UgXCJjYWxsXCI6XG4gICAgICAgICAgICBjYXNlIFwiY2hhaW5JZFwiOlxuICAgICAgICAgICAgY2FzZSBcImdldEJhbGFuY2VcIjpcbiAgICAgICAgICAgIGNhc2UgXCJnZXRUcmFuc2FjdGlvbkNvdW50XCI6XG4gICAgICAgICAgICBjYXNlIFwiZ2V0Q29kZVwiOlxuICAgICAgICAgICAgY2FzZSBcImdldFN0b3JhZ2VcIjpcbiAgICAgICAgICAgIGNhc2UgXCJnZXRUcmFuc2FjdGlvblwiOlxuICAgICAgICAgICAgY2FzZSBcImdldFRyYW5zYWN0aW9uUmVjZWlwdFwiOlxuICAgICAgICAgICAgY2FzZSBcImdldExvZ3NcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hlY2tRdW9ydW0odGhpcy5xdW9ydW0sIHJlc3VsdHMpO1xuICAgICAgICAgICAgY2FzZSBcImJyb2FkY2FzdFRyYW5zYWN0aW9uXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldEFueVJlc3VsdCh0aGlzLnF1b3J1bSwgcmVzdWx0cyk7XG4gICAgICAgIH1cbiAgICAgICAgYXNzZXJ0KGZhbHNlLCBcInVuc3VwcG9ydGVkIG1ldGhvZFwiLCBcIlVOU1VQUE9SVEVEX09QRVJBVElPTlwiLCB7XG4gICAgICAgICAgICBvcGVyYXRpb246IGBfcGVyZm9ybSgke3N0cmluZ2lmeShyZXEubWV0aG9kKX0pYFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMgI3dhaXRGb3JRdW9ydW0ocnVubmluZywgcmVxKSB7XG4gICAgICAgIGlmIChydW5uaW5nLnNpemUgPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIm5vIHJ1bm5lcnM/IVwiKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBbnkgcHJvbWlzZXMgdGhhdCBhcmUgaW50ZXJlc3RpbmcgdG8gd2F0Y2ggZm9yOyBhbiBleHBpcmVkIHN0YWxsXG4gICAgICAgIC8vIG9yIGEgc3VjY2Vzc2Z1bCBwZXJmb3JtXG4gICAgICAgIGNvbnN0IGludGVyZXN0aW5nID0gW107XG4gICAgICAgIGxldCBuZXdSdW5uZXJzID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBydW5uZXIgb2YgcnVubmluZykge1xuICAgICAgICAgICAgLy8gTm8gcmVzcG9uc2VzLCB5ZXQ7IGtlZXAgYW4gZXllIG9uIGl0XG4gICAgICAgICAgICBpZiAocnVubmVyLnBlcmZvcm0pIHtcbiAgICAgICAgICAgICAgICBpbnRlcmVzdGluZy5wdXNoKHJ1bm5lci5wZXJmb3JtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFN0aWxsIHN0YWxsaW5nLi4uXG4gICAgICAgICAgICBpZiAocnVubmVyLnN0YWxsZXIpIHtcbiAgICAgICAgICAgICAgICBpbnRlcmVzdGluZy5wdXNoKHJ1bm5lci5zdGFsbGVyKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRoaXMgcnVubmVyIGhhcyBhbHJlYWR5IHRyaWdnZXJlZCBhbm90aGVyIHJ1bm5lclxuICAgICAgICAgICAgaWYgKHJ1bm5lci5kaWRCdW1wKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBHb3QgYSByZXNwb25zZSAocmVzdWx0IG9yIGVycm9yKSBvciBzdGFsbGVkOyBraWNrIG9mZiBhbm90aGVyIHJ1bm5lclxuICAgICAgICAgICAgcnVubmVyLmRpZEJ1bXAgPSB0cnVlO1xuICAgICAgICAgICAgbmV3UnVubmVycysrO1xuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIGlmIHdlIGhhdmUgcmVhY2hlZCBxdW9ydW0gb24gYSByZXN1bHQgKG9yIGVycm9yKVxuICAgICAgICBjb25zdCB2YWx1ZSA9IGF3YWl0IHRoaXMuI2NoZWNrUXVvcnVtKHJ1bm5pbmcsIHJlcSk7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgIHRocm93IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFkZCBhbnkgbmV3IHJ1bm5lcnMsIGJlY2F1c2UgYSBzdGFsbGVyIHRpbWVkIG91dCBvciBhIHJlc3VsdFxuICAgICAgICAvLyBvciBlcnJvciByZXNwb25zZSBjYW1lIGluLlxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5ld1J1bm5lcnM7IGkrKykge1xuICAgICAgICAgICAgdGhpcy4jYWRkUnVubmVyKHJ1bm5pbmcsIHJlcSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWxsIHByb3ZpZGVycyBoYXZlIHJldHVybmVkLCBhbmQgd2UgaGF2ZSBubyByZXN1bHRcbiAgICAgICAgYXNzZXJ0KGludGVyZXN0aW5nLmxlbmd0aCA+IDAsIFwicXVvcnVtIG5vdCBtZXRcIiwgXCJTRVJWRVJfRVJST1JcIiwge1xuICAgICAgICAgICAgcmVxdWVzdDogXCIlc3ViLXJlcXVlc3RzXCIsXG4gICAgICAgICAgICBpbmZvOiB7IHJlcXVlc3Q6IHJlcSwgcmVzdWx0czogQXJyYXkuZnJvbShydW5uaW5nKS5tYXAoKHIpID0+IHN0cmluZ2lmeShyLnJlc3VsdCkpIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFdhaXQgZm9yIHNvbWVvbmUgdG8gZWl0aGVyIGNvbXBsZXRlIGl0cyBwZXJmb3JtIG9yIHN0YWxsIG91dFxuICAgICAgICBhd2FpdCBQcm9taXNlLnJhY2UoaW50ZXJlc3RpbmcpO1xuICAgICAgICAvLyBUaGlzIGlzIHJlY3Vyc2l2ZSwgYnV0IGF0IHdvcnN0IGNhc2UgdGhlIGRlcHRoIGlzIDJ4IHRoZVxuICAgICAgICAvLyBudW1iZXIgb2YgcHJvdmlkZXJzIChlYWNoIGhhcyBhIHBlcmZvcm0gYW5kIGEgc3RhbGxlcilcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuI3dhaXRGb3JRdW9ydW0ocnVubmluZywgcmVxKTtcbiAgICB9XG4gICAgYXN5bmMgX3BlcmZvcm0ocmVxKSB7XG4gICAgICAgIC8vIEJyb2FkY2FzdGluZyBhIHRyYW5zYWN0aW9uIGlzIHJhcmUgKGlzaCkgYW5kIGFscmVhZHkgaW5jdXJzXG4gICAgICAgIC8vIGEgY29zdCBvbiB0aGUgdXNlciwgc28gc3BhbW1pbmcgaXMgc2FmZS1pc2guIEp1c3Qgc2VuZCBpdCB0b1xuICAgICAgICAvLyBldmVyeSBiYWNrZW5kLlxuICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gXCJicm9hZGNhc3RUcmFuc2FjdGlvblwiKSB7XG4gICAgICAgICAgICAvLyBPbmNlIGFueSBicm9hZGNhc3QgcHJvdmlkZXMgYSBwb3NpdGl2ZSByZXN1bHQsIHVzZSBpdC4gTm9cbiAgICAgICAgICAgIC8vIG5lZWQgdG8gd2FpdCBmb3IgYW55b25lIGVsc2VcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSB0aGlzLiNjb25maWdzLm1hcCgoYykgPT4gbnVsbCk7XG4gICAgICAgICAgICBjb25zdCBicm9hZGNhc3RzID0gdGhpcy4jY29uZmlncy5tYXAoYXN5bmMgKHsgcHJvdmlkZXIsIHdlaWdodCB9LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHByb3ZpZGVyLl9wZXJmb3JtKHJlcSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gT2JqZWN0LmFzc2lnbihub3JtYWxpemVSZXN1bHQocmVxLm1ldGhvZCwgeyByZXN1bHQgfSksIHsgd2VpZ2h0IH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c1tpbmRleF0gPSBPYmplY3QuYXNzaWduKG5vcm1hbGl6ZVJlc3VsdChyZXEubWV0aG9kLCB7IGVycm9yIH0pLCB7IHdlaWdodCB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIEFzIGVhY2ggcHJvbWlzZSBmaW5pc2hlcy4uLlxuICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgYSB2YWxpZCBicm9hZGNhc3QgcmVzdWx0XG4gICAgICAgICAgICAgICAgY29uc3QgZG9uZSA9IHJlc3VsdHMuZmlsdGVyKChyKSA9PiAociAhPSBudWxsKSk7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB7IHZhbHVlIH0gb2YgZG9uZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoISh2YWx1ZSBpbnN0YW5jZW9mIEVycm9yKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBhIGxlZ2l0IGJyb2FkY2FzdCBlcnJvciAob25lIHdoaWNoIHdlIGNhbm5vdFxuICAgICAgICAgICAgICAgIC8vIHJlY292ZXIgZnJvbTsgc29tZSBub2RlcyBtYXkgcmV0dXJuIHRoZSBmb2xsb3dpbmcgcmVkXG4gICAgICAgICAgICAgICAgLy8gaGVycmluZyBldmVudHM6XG4gICAgICAgICAgICAgICAgLy8gLSBhbHJlZHkgc2VlbmQgKFVOS05PV05fRVJST1IpXG4gICAgICAgICAgICAgICAgLy8gLSBOT05DRV9FWFBJUkVEXG4gICAgICAgICAgICAgICAgLy8gLSBSRVBMQUNFTUVOVF9VTkRFUlBSSUNFRFxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNoZWNrUXVvcnVtKHRoaXMucXVvcnVtLCByZXN1bHRzLmZpbHRlcigocikgPT4gKHIgIT0gbnVsbCkpKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNFcnJvcihyZXN1bHQsIFwiSU5TVUZGSUNJRU5UX0ZVTkRTXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gS2ljayBvZmYgdGhlIG5leHQgcHJvdmlkZXIgKGlmIGFueSlcbiAgICAgICAgICAgICAgICBjb25zdCB3YWl0aW5nID0gYnJvYWRjYXN0cy5maWx0ZXIoKGIsIGkpID0+IChyZXN1bHRzW2ldID09IG51bGwpKTtcbiAgICAgICAgICAgICAgICBpZiAod2FpdGluZy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGF3YWl0IFByb21pc2UucmFjZSh3YWl0aW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFVzZSBzdGFuZGFyZCBxdW9ydW0gcmVzdWx0czsgYW55IHJlc3VsdCB3YXMgcmV0dXJuZWQgYWJvdmUsXG4gICAgICAgICAgICAvLyBzbyB0aGlzIHdpbGwgZmluZCBhbnkgZXJyb3IgdGhhdCBtZXQgcXVvcnVtIGlmIGFueVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZ2V0QW55UmVzdWx0KHRoaXMucXVvcnVtLCByZXN1bHRzKTtcbiAgICAgICAgICAgIGFzc2VydChyZXN1bHQgIT09IHVuZGVmaW5lZCwgXCJwcm9ibGVtIG11bHRpLWJyb2FkY2FzdGluZ1wiLCBcIlNFUlZFUl9FUlJPUlwiLCB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdDogXCIlc3ViLXJlcXVlc3RzXCIsXG4gICAgICAgICAgICAgICAgaW5mbzogeyByZXF1ZXN0OiByZXEsIHJlc3VsdHM6IHJlc3VsdHMubWFwKHN0cmluZ2lmeSkgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IHRoaXMuI2luaXRpYWxTeW5jKCk7XG4gICAgICAgIC8vIEJvb3RzdHJhcCBlbm91Z2ggcnVubmVycyB0byBtZWV0IHF1b3J1bVxuICAgICAgICBjb25zdCBydW5uaW5nID0gbmV3IFNldCgpO1xuICAgICAgICBsZXQgaW5mbGlnaHRRdW9ydW0gPSAwO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgY29uc3QgcnVubmVyID0gdGhpcy4jYWRkUnVubmVyKHJ1bm5pbmcsIHJlcSk7XG4gICAgICAgICAgICBpZiAocnVubmVyID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluZmxpZ2h0UXVvcnVtICs9IHJ1bm5lci5jb25maWcud2VpZ2h0O1xuICAgICAgICAgICAgaWYgKGluZmxpZ2h0UXVvcnVtID49IHRoaXMucXVvcnVtKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy4jd2FpdEZvclF1b3J1bShydW5uaW5nLCByZXEpO1xuICAgICAgICAvLyBUcmFjayByZXF1ZXN0cyBzZW50IHRvIGEgcHJvdmlkZXIgdGhhdCBhcmUgc3RpbGxcbiAgICAgICAgLy8gb3V0c3RhbmRpbmcgYWZ0ZXIgcXVvcnVtIGhhcyBiZWVuIG90aGVyd2lzZSBmb3VuZFxuICAgICAgICBmb3IgKGNvbnN0IHJ1bm5lciBvZiBydW5uaW5nKSB7XG4gICAgICAgICAgICBpZiAocnVubmVyLnBlcmZvcm0gJiYgcnVubmVyLnJlc3VsdCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcnVubmVyLmNvbmZpZy5sYXRlUmVzcG9uc2VzKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgYXN5bmMgZGVzdHJveSgpIHtcbiAgICAgICAgZm9yIChjb25zdCB7IHByb3ZpZGVyIH0gb2YgdGhpcy4jY29uZmlncykge1xuICAgICAgICAgICAgcHJvdmlkZXIuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcm92aWRlci1mYWxsYmFjay5qcy5tYXAiLCJpbXBvcnQgeyBhc3NlcnQgfSBmcm9tIFwiLi4vdXRpbHMvaW5kZXguanNcIjtcbmltcG9ydCB7IEFua3JQcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLWFua3IuanNcIjtcbmltcG9ydCB7IEFsY2hlbXlQcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLWFsY2hlbXkuanNcIjtcbi8vaW1wb3J0IHsgQmxvY2tzY291dFByb3ZpZGVyIH0gZnJvbSBcIi4vcHJvdmlkZXItYmxvY2tzY291dC5qc1wiO1xuaW1wb3J0IHsgQ2hhaW5zdGFja1Byb3ZpZGVyIH0gZnJvbSBcIi4vcHJvdmlkZXItY2hhaW5zdGFjay5qc1wiO1xuaW1wb3J0IHsgQ2xvdWRmbGFyZVByb3ZpZGVyIH0gZnJvbSBcIi4vcHJvdmlkZXItY2xvdWRmbGFyZS5qc1wiO1xuaW1wb3J0IHsgRXRoZXJzY2FuUHJvdmlkZXIgfSBmcm9tIFwiLi9wcm92aWRlci1ldGhlcnNjYW4uanNcIjtcbmltcG9ydCB7IEluZnVyYVByb3ZpZGVyIH0gZnJvbSBcIi4vcHJvdmlkZXItaW5mdXJhLmpzXCI7XG4vL2ltcG9ydCB7IFBvY2tldFByb3ZpZGVyIH0gZnJvbSBcIi4vcHJvdmlkZXItcG9ja2V0LmpzXCI7XG5pbXBvcnQgeyBRdWlja05vZGVQcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLXF1aWNrbm9kZS5qc1wiO1xuaW1wb3J0IHsgRmFsbGJhY2tQcm92aWRlciB9IGZyb20gXCIuL3Byb3ZpZGVyLWZhbGxiYWNrLmpzXCI7XG5pbXBvcnQgeyBKc29uUnBjUHJvdmlkZXIgfSBmcm9tIFwiLi9wcm92aWRlci1qc29ucnBjLmpzXCI7XG5pbXBvcnQgeyBOZXR3b3JrIH0gZnJvbSBcIi4vbmV0d29yay5qc1wiO1xuaW1wb3J0IHsgV2ViU29ja2V0UHJvdmlkZXIgfSBmcm9tIFwiLi9wcm92aWRlci13ZWJzb2NrZXQuanNcIjtcbmZ1bmN0aW9uIGlzV2ViU29ja2V0TGlrZSh2YWx1ZSkge1xuICAgIHJldHVybiAodmFsdWUgJiYgdHlwZW9mICh2YWx1ZS5zZW5kKSA9PT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgIHR5cGVvZiAodmFsdWUuY2xvc2UpID09PSBcImZ1bmN0aW9uXCIpO1xufVxuY29uc3QgVGVzdG5ldHMgPSBcImdvZXJsaSBrb3ZhbiBzZXBvbGlhIGNsYXNzaWNLb3R0aSBvcHRpbWlzbS1nb2VybGkgYXJiaXRydW0tZ29lcmxpIG1hdGljLW11bWJhaSBibmJ0XCIuc3BsaXQoXCIgXCIpO1xuLyoqXG4gKiAgUmV0dXJucyBhIGRlZmF1bHQgcHJvdmlkZXIgZm9yICUlbmV0d29yayUlLlxuICpcbiAqICBJZiAlJW5ldHdvcmslJSBpcyBhIFtbV2ViU29ja2V0TGlrZV1dIG9yIHN0cmluZyB0aGF0IGJlZ2lucyB3aXRoXG4gKiAgYGBcIndzOlwiYGAgb3IgYGBcIndzczpcImBgLCBhIFtbV2ViU29ja2V0UHJvdmlkZXJdXSBpcyByZXR1cm5lZCBiYWNrZWRcbiAqICBieSB0aGF0IFdlYlNvY2tldCBvciBVUkwuXG4gKlxuICogIElmICUlbmV0d29yayUlIGlzIGEgc3RyaW5nIHRoYXQgYmVnaW5zIHdpdGggYGBcIkhUVFA6XCJgYCBvciBgYFwiSFRUUFM6XCJgYCxcbiAqICBhIFtbSnNvblJwY1Byb3ZpZGVyXV0gaXMgcmV0dXJuZWQgY29ubmVjdGVkIHRvIHRoYXQgVVJMLlxuICpcbiAqICBPdGhlcndpc2UsIGEgZGVmYXVsdCBwcm92aWRlciBpcyBjcmVhdGVkIGJhY2tlZCBieSB3ZWxsLWtub3duIHB1YmxpY1xuICogIFdlYjMgYmFja2VuZHMgKHN1Y2ggYXMgW1tsaW5rLWluZnVyYV1dKSB1c2luZyBjb21tdW5pdHktcHJvdmlkZWQgQVBJXG4gKiAga2V5cy5cbiAqXG4gKiAgVGhlICUlb3B0aW9ucyUlIGFsbG93cyBzcGVjaWZ5aW5nIGN1c3RvbSBBUEkga2V5cyBwZXIgYmFja2VuZCAoc2V0dGluZ1xuICogIGFuIEFQSSBrZXkgdG8gYGBcIi1cImBgIHdpbGwgb21pdCB0aGF0IHByb3ZpZGVyKSBhbmQgYGBvcHRpb25zLmV4Y2x1c2l2ZWBgXG4gKiAgY2FuIGJlIHNldCB0byBlaXRoZXIgYSBiYWNrZW5kIG5hbWUgb3IgYW5kIGFycmF5IG9mIGJhY2tlbmQgbmFtZXMsIHdoaWNoXG4gKiAgd2lsbCB3aGl0ZWxpc3QgKipvbmx5KiogdGhvc2UgYmFja2VuZHMuXG4gKlxuICogIEN1cnJlbnQgYmFja2VuZCBzdHJpbmdzIHN1cHBvcnRlZCBhcmU6XG4gKiAgLSBgYFwiYWxjaGVteVwiYGBcbiAqICAtIGBgXCJhbmtyXCJgYFxuICogIC0gYGBcImNsb3VkZmxhcmVcImBgXG4gKiAgLSBgYFwiY2hhaW5zdGFja1wiYGBcbiAqICAtIGBgXCJldGhlcnNjYW5cImBgXG4gKiAgLSBgYFwiaW5mdXJhXCJgYFxuICogIC0gYGBcInB1YmxpY1BvbHlnb25cImBgXG4gKiAgLSBgYFwicXVpY2tub2RlXCJgYFxuICpcbiAqICBAZXhhbXBsZTpcbiAqICAgIC8vIENvbm5lY3QgdG8gYSBsb2NhbCBHZXRoIG5vZGVcbiAqICAgIHByb3ZpZGVyID0gZ2V0RGVmYXVsdFByb3ZpZGVyKFwiaHR0cDovL2xvY2FsaG9zdDo4NTQ1L1wiKTtcbiAqXG4gKiAgICAvLyBDb25uZWN0IHRvIEV0aGVyZXVtIG1haW5uZXQgd2l0aCBhbnkgY3VycmVudCBhbmQgZnV0dXJlXG4gKiAgICAvLyB0aGlyZC1wYXJ0eSBzZXJ2aWNlcyBhdmFpbGFibGVcbiAqICAgIHByb3ZpZGVyID0gZ2V0RGVmYXVsdFByb3ZpZGVyKFwibWFpbm5ldFwiKTtcbiAqXG4gKiAgICAvLyBDb25uZWN0IHRvIFBvbHlnb24sIGJ1dCBvbmx5IGFsbG93IEV0aGVyc2NhbiBhbmRcbiAqICAgIC8vIElORlVSQSBhbmQgdXNlIFwiTVlfQVBJX0tFWVwiIGluIGNhbGxzIHRvIEV0aGVyc2Nhbi5cbiAqICAgIHByb3ZpZGVyID0gZ2V0RGVmYXVsdFByb3ZpZGVyKFwibWF0aWNcIiwge1xuICogICAgICBldGhlcnNjYW46IFwiTVlfQVBJX0tFWVwiLFxuICogICAgICBleGNsdXNpdmU6IFsgXCJldGhlcnNjYW5cIiwgXCJpbmZ1cmFcIiBdXG4gKiAgICB9KTtcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRQcm92aWRlcihuZXR3b3JrLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgfVxuICAgIGNvbnN0IGFsbG93U2VydmljZSA9IChuYW1lKSA9PiB7XG4gICAgICAgIGlmIChvcHRpb25zW25hbWVdID09PSBcIi1cIikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgKG9wdGlvbnMuZXhjbHVzaXZlKSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcmV0dXJuIChuYW1lID09PSBvcHRpb25zLmV4Y2x1c2l2ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob3B0aW9ucy5leGNsdXNpdmUpKSB7XG4gICAgICAgICAgICByZXR1cm4gKG9wdGlvbnMuZXhjbHVzaXZlLmluZGV4T2YobmFtZSkgIT09IC0xKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICAgIGlmICh0eXBlb2YgKG5ldHdvcmspID09PSBcInN0cmluZ1wiICYmIG5ldHdvcmsubWF0Y2goL15odHRwcz86LykpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBKc29uUnBjUHJvdmlkZXIobmV0d29yayk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgKG5ldHdvcmspID09PSBcInN0cmluZ1wiICYmIG5ldHdvcmsubWF0Y2goL153c3M/Oi8pIHx8IGlzV2ViU29ja2V0TGlrZShuZXR3b3JrKSkge1xuICAgICAgICByZXR1cm4gbmV3IFdlYlNvY2tldFByb3ZpZGVyKG5ldHdvcmspO1xuICAgIH1cbiAgICAvLyBHZXQgdGhlIG5ldHdvcmsgYW5kIG5hbWUsIGlmIHBvc3NpYmxlXG4gICAgbGV0IHN0YXRpY05ldHdvcmsgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICAgIHN0YXRpY05ldHdvcmsgPSBOZXR3b3JrLmZyb20obmV0d29yayk7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikgeyB9XG4gICAgY29uc3QgcHJvdmlkZXJzID0gW107XG4gICAgaWYgKGFsbG93U2VydmljZShcInB1YmxpY1BvbHlnb25cIikgJiYgc3RhdGljTmV0d29yaykge1xuICAgICAgICBpZiAoc3RhdGljTmV0d29yay5uYW1lID09PSBcIm1hdGljXCIpIHtcbiAgICAgICAgICAgIHByb3ZpZGVycy5wdXNoKG5ldyBKc29uUnBjUHJvdmlkZXIoXCJodHRwczovXFwvcG9seWdvbi1ycGMuY29tL1wiLCBzdGF0aWNOZXR3b3JrLCB7IHN0YXRpY05ldHdvcmsgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHN0YXRpY05ldHdvcmsubmFtZSA9PT0gXCJtYXRpYy1hbW95XCIpIHtcbiAgICAgICAgICAgIHByb3ZpZGVycy5wdXNoKG5ldyBKc29uUnBjUHJvdmlkZXIoXCJodHRwczovXFwvcnBjLWFtb3kucG9seWdvbi50ZWNobm9sb2d5L1wiLCBzdGF0aWNOZXR3b3JrLCB7IHN0YXRpY05ldHdvcmsgfSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhbGxvd1NlcnZpY2UoXCJhbGNoZW15XCIpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwcm92aWRlcnMucHVzaChuZXcgQWxjaGVteVByb3ZpZGVyKG5ldHdvcmssIG9wdGlvbnMuYWxjaGVteSkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikgeyB9XG4gICAgfVxuICAgIGlmIChhbGxvd1NlcnZpY2UoXCJhbmtyXCIpICYmIG9wdGlvbnMuYW5rciAhPSBudWxsKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwcm92aWRlcnMucHVzaChuZXcgQW5rclByb3ZpZGVyKG5ldHdvcmssIG9wdGlvbnMuYW5rcikpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikgeyB9XG4gICAgfVxuICAgIC8qIFRlbXBvcmFyaWx5IHJlbW92ZSB1bnRpbCBjdXN0b20gZXJyb3IgaXNzdWUgaXMgZml4ZWRcbiAgICAgICAgaWYgKGFsbG93U2VydmljZShcImJsb2Nrc2NvdXRcIikpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcHJvdmlkZXJzLnB1c2gobmV3IEJsb2Nrc2NvdXRQcm92aWRlcihuZXR3b3JrLCBvcHRpb25zLmJsb2Nrc2NvdXQpKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7IH1cbiAgICAgICAgfVxuICAgICovXG4gICAgaWYgKGFsbG93U2VydmljZShcImNoYWluc3RhY2tcIikpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHByb3ZpZGVycy5wdXNoKG5ldyBDaGFpbnN0YWNrUHJvdmlkZXIobmV0d29yaywgb3B0aW9ucy5jaGFpbnN0YWNrKSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7IH1cbiAgICB9XG4gICAgaWYgKGFsbG93U2VydmljZShcImNsb3VkZmxhcmVcIikpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHByb3ZpZGVycy5wdXNoKG5ldyBDbG91ZGZsYXJlUHJvdmlkZXIobmV0d29yaykpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikgeyB9XG4gICAgfVxuICAgIGlmIChhbGxvd1NlcnZpY2UoXCJldGhlcnNjYW5cIikpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHByb3ZpZGVycy5wdXNoKG5ldyBFdGhlcnNjYW5Qcm92aWRlcihuZXR3b3JrLCBvcHRpb25zLmV0aGVyc2NhbikpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikgeyB9XG4gICAgfVxuICAgIGlmIChhbGxvd1NlcnZpY2UoXCJpbmZ1cmFcIikpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBwcm9qZWN0SWQgPSBvcHRpb25zLmluZnVyYTtcbiAgICAgICAgICAgIGxldCBwcm9qZWN0U2VjcmV0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiAocHJvamVjdElkKSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIHByb2plY3RTZWNyZXQgPSBwcm9qZWN0SWQucHJvamVjdFNlY3JldDtcbiAgICAgICAgICAgICAgICBwcm9qZWN0SWQgPSBwcm9qZWN0SWQucHJvamVjdElkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJvdmlkZXJzLnB1c2gobmV3IEluZnVyYVByb3ZpZGVyKG5ldHdvcmssIHByb2plY3RJZCwgcHJvamVjdFNlY3JldCkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikgeyB9XG4gICAgfVxuICAgIC8qXG4gICAgICAgIGlmIChvcHRpb25zLnBvY2tldCAhPT0gXCItXCIpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IGFwcElkID0gb3B0aW9ucy5wb2NrZXQ7XG4gICAgICAgICAgICAgICAgbGV0IHNlY3JldEtleTogdW5kZWZpbmVkIHwgc3RyaW5nID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGxldCBsb2FkQmFsYW5jZXI6IHVuZGVmaW5lZCB8IGJvb2xlYW4gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZihhcHBJZCkgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZEJhbGFuY2VyID0gISFhcHBJZC5sb2FkQmFsYW5jZXI7XG4gICAgICAgICAgICAgICAgICAgIHNlY3JldEtleSA9IGFwcElkLnNlY3JldEtleTtcbiAgICAgICAgICAgICAgICAgICAgYXBwSWQgPSBhcHBJZC5hcHBJZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcHJvdmlkZXJzLnB1c2gobmV3IFBvY2tldFByb3ZpZGVyKG5ldHdvcmssIGFwcElkLCBzZWNyZXRLZXksIGxvYWRCYWxhbmNlcikpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHsgY29uc29sZS5sb2coZXJyb3IpOyB9XG4gICAgICAgIH1cbiAgICAqL1xuICAgIGlmIChhbGxvd1NlcnZpY2UoXCJxdWlja25vZGVcIikpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCB0b2tlbiA9IG9wdGlvbnMucXVpY2tub2RlO1xuICAgICAgICAgICAgcHJvdmlkZXJzLnB1c2gobmV3IFF1aWNrTm9kZVByb3ZpZGVyKG5ldHdvcmssIHRva2VuKSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7IH1cbiAgICB9XG4gICAgYXNzZXJ0KHByb3ZpZGVycy5sZW5ndGgsIFwidW5zdXBwb3J0ZWQgZGVmYXVsdCBuZXR3b3JrXCIsIFwiVU5TVVBQT1JURURfT1BFUkFUSU9OXCIsIHtcbiAgICAgICAgb3BlcmF0aW9uOiBcImdldERlZmF1bHRQcm92aWRlclwiXG4gICAgfSk7XG4gICAgLy8gTm8gbmVlZCBmb3IgYSBGYWxsYmFja1Byb3ZpZGVyXG4gICAgaWYgKHByb3ZpZGVycy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHByb3ZpZGVyc1swXTtcbiAgICB9XG4gICAgLy8gV2UgdXNlIHRoZSBmbG9vciBiZWNhdXNlIHB1YmxpYyB0aGlyZC1wYXJ0eSBwcm92aWRlcnMgY2FuIGJlIHVucmVsaWFibGUsXG4gICAgLy8gc28gYSBsb3cgbnVtYmVyIG9mIHByb3ZpZGVycyB3aXRoIGEgbGFyZ2UgcXVvcnVtIHdpbGwgZmFpbCB0b28gb2Z0ZW5cbiAgICBsZXQgcXVvcnVtID0gTWF0aC5mbG9vcihwcm92aWRlcnMubGVuZ3RoIC8gMik7XG4gICAgaWYgKHF1b3J1bSA+IDIpIHtcbiAgICAgICAgcXVvcnVtID0gMjtcbiAgICB9XG4gICAgLy8gVGVzdG5ldHMgZG9uJ3QgbmVlZCBhcyBzdHJvbmcgYSBzZWN1cml0eSBnYXVyYW50ZWUgYW5kIHNwZWVkIGlzXG4gICAgLy8gbW9yZSB1c2VmdWwgZHVyaW5nIHRlc3RpbmdcbiAgICBpZiAoc3RhdGljTmV0d29yayAmJiBUZXN0bmV0cy5pbmRleE9mKHN0YXRpY05ldHdvcmsubmFtZSkgIT09IC0xKSB7XG4gICAgICAgIHF1b3J1bSA9IDE7XG4gICAgfVxuICAgIC8vIFByb3ZpZGVkIG92ZXJyaWRlIHFvcnVtIHRha2VzIHByaW9yaXR5XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5xdW9ydW0pIHtcbiAgICAgICAgcXVvcnVtID0gb3B0aW9ucy5xdW9ydW07XG4gICAgfVxuICAgIHJldHVybiBuZXcgRmFsbGJhY2tQcm92aWRlcihwcm92aWRlcnMsIHVuZGVmaW5lZCwgeyBxdW9ydW0gfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kZWZhdWx0LXByb3ZpZGVyLmpzLm1hcCIsImltcG9ydCB7IGRlZmluZVByb3BlcnRpZXMgfSBmcm9tIFwiLi4vdXRpbHMvaW5kZXguanNcIjtcbmltcG9ydCB7IEFic3RyYWN0U2lnbmVyIH0gZnJvbSBcIi4vYWJzdHJhY3Qtc2lnbmVyLmpzXCI7XG4vKipcbiAqICBBICoqTm9uY2VNYW5hZ2VyKiogd3JhcHMgYW5vdGhlciBbW1NpZ25lcl1dIGFuZCBhdXRvbWF0aWNhbGx5IG1hbmFnZXNcbiAqICB0aGUgbm9uY2UsIGVuc3VyaW5nIHNlcmlhbGl6ZWQgYW5kIHNlcXVlbnRpYWwgbm9uY2VzIGFyZSB1c2VkIGR1cmluZ1xuICogIHRyYW5zYWN0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgTm9uY2VNYW5hZ2VyIGV4dGVuZHMgQWJzdHJhY3RTaWduZXIge1xuICAgIC8qKlxuICAgICAqICBUaGUgU2lnbmVyIGJlaW5nIG1hbmFnZWQuXG4gICAgICovXG4gICAgc2lnbmVyO1xuICAgICNub25jZVByb21pc2U7XG4gICAgI2RlbHRhO1xuICAgIC8qKlxuICAgICAqICBDcmVhdGVzIGEgbmV3ICoqTm9uY2VNYW5hZ2VyKiogdG8gbWFuYWdlICUlc2lnbmVyJSUuXG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc2lnbmVyKSB7XG4gICAgICAgIHN1cGVyKHNpZ25lci5wcm92aWRlcik7XG4gICAgICAgIGRlZmluZVByb3BlcnRpZXModGhpcywgeyBzaWduZXIgfSk7XG4gICAgICAgIHRoaXMuI25vbmNlUHJvbWlzZSA9IG51bGw7XG4gICAgICAgIHRoaXMuI2RlbHRhID0gMDtcbiAgICB9XG4gICAgYXN5bmMgZ2V0QWRkcmVzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2lnbmVyLmdldEFkZHJlc3MoKTtcbiAgICB9XG4gICAgY29ubmVjdChwcm92aWRlcikge1xuICAgICAgICByZXR1cm4gbmV3IE5vbmNlTWFuYWdlcih0aGlzLnNpZ25lci5jb25uZWN0KHByb3ZpZGVyKSk7XG4gICAgfVxuICAgIGFzeW5jIGdldE5vbmNlKGJsb2NrVGFnKSB7XG4gICAgICAgIGlmIChibG9ja1RhZyA9PT0gXCJwZW5kaW5nXCIpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLiNub25jZVByb21pc2UgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuI25vbmNlUHJvbWlzZSA9IHN1cGVyLmdldE5vbmNlKFwicGVuZGluZ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRlbHRhID0gdGhpcy4jZGVsdGE7XG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IHRoaXMuI25vbmNlUHJvbWlzZSkgKyBkZWx0YTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXIuZ2V0Tm9uY2UoYmxvY2tUYWcpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgTWFudWFsbHkgaW5jcmVtZW50IHRoZSBub25jZS4gVGhpcyBtYXkgYmUgdXNlZnVsIHdoZW4gbWFuYWduZ1xuICAgICAqICBvZmZsaW5lIHRyYW5zYWN0aW9ucy5cbiAgICAgKi9cbiAgICBpbmNyZW1lbnQoKSB7XG4gICAgICAgIHRoaXMuI2RlbHRhKys7XG4gICAgfVxuICAgIC8qKlxuICAgICAqICBSZXNldHMgdGhlIG5vbmNlLCBjYXVzaW5nIHRoZSAqKk5vbmNlTWFuYWdlcioqIHRvIHJlbG9hZCB0aGUgY3VycmVudFxuICAgICAqICBub25jZSBmcm9tIHRoZSBibG9ja2NoYWluIG9uIHRoZSBuZXh0IHRyYW5zYWN0aW9uLlxuICAgICAqL1xuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLiNkZWx0YSA9IDA7XG4gICAgICAgIHRoaXMuI25vbmNlUHJvbWlzZSA9IG51bGw7XG4gICAgfVxuICAgIGFzeW5jIHNlbmRUcmFuc2FjdGlvbih0eCkge1xuICAgICAgICBjb25zdCBub25jZVByb21pc2UgPSB0aGlzLmdldE5vbmNlKFwicGVuZGluZ1wiKTtcbiAgICAgICAgdGhpcy5pbmNyZW1lbnQoKTtcbiAgICAgICAgdHggPSBhd2FpdCB0aGlzLnNpZ25lci5wb3B1bGF0ZVRyYW5zYWN0aW9uKHR4KTtcbiAgICAgICAgdHgubm9uY2UgPSBhd2FpdCBub25jZVByb21pc2U7XG4gICAgICAgIC8vIEBUT0RPOiBNYXliZSBoYW5kbGUgaW50ZXJlc3RpbmcvcmVjb3ZlcmFibGUgZXJyb3JzP1xuICAgICAgICAvLyBMaWtlIGRvbid0IGluY3JlbWVudCBpZiB0aGUgdHggd2FzIGNlcnRhaW5seSBub3Qgc2VudFxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zaWduZXIuc2VuZFRyYW5zYWN0aW9uKHR4KTtcbiAgICB9XG4gICAgc2lnblRyYW5zYWN0aW9uKHR4KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNpZ25lci5zaWduVHJhbnNhY3Rpb24odHgpO1xuICAgIH1cbiAgICBzaWduTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNpZ25lci5zaWduTWVzc2FnZShtZXNzYWdlKTtcbiAgICB9XG4gICAgc2lnblR5cGVkRGF0YShkb21haW4sIHR5cGVzLCB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaWduZXIuc2lnblR5cGVkRGF0YShkb21haW4sIHR5cGVzLCB2YWx1ZSk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2lnbmVyLW5vbmNlbWFuYWdlci5qcy5tYXAiLCJpbXBvcnQgeyBhc3NlcnRBcmd1bWVudCwgbWFrZUVycm9yIH0gZnJvbSBcIi4uL3V0aWxzL2luZGV4LmpzXCI7XG5pbXBvcnQgeyBKc29uUnBjQXBpUG9sbGluZ1Byb3ZpZGVyIH0gZnJvbSBcIi4vcHJvdmlkZXItanNvbnJwYy5qc1wiO1xuO1xuLyoqXG4gKiAgQSAqKkJyb3dzZXJQcm92aWRlcioqIGlzIGludGVuZGVkIHRvIHdyYXAgYW4gaW5qZWN0ZWQgcHJvdmlkZXIgd2hpY2hcbiAqICBhZGhlcmVzIHRvIHRoZSBbW2xpbmstZWlwLTExOTNdXSBzdGFuZGFyZCwgd2hpY2ggbW9zdCAoaWYgbm90IGFsbClcbiAqICBjdXJyZW50bHkgZG8uXG4gKi9cbmV4cG9ydCBjbGFzcyBCcm93c2VyUHJvdmlkZXIgZXh0ZW5kcyBKc29uUnBjQXBpUG9sbGluZ1Byb3ZpZGVyIHtcbiAgICAjcmVxdWVzdDtcbiAgICAjcHJvdmlkZXJJbmZvO1xuICAgIC8qKlxuICAgICAqICBDb25uZWN0IHRvIHRoZSAlJWV0aGVyZXVtJSUgcHJvdmlkZXIsIG9wdGlvbmFsbHkgZm9yY2luZyB0aGVcbiAgICAgKiAgJSVuZXR3b3JrJSUuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZXRoZXJldW0sIG5ldHdvcmssIF9vcHRpb25zKSB7XG4gICAgICAgIC8vIENvcHkgdGhlIG9wdGlvbnNcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sICgoX29wdGlvbnMgIT0gbnVsbCkgPyBfb3B0aW9ucyA6IHt9KSwgeyBiYXRjaE1heENvdW50OiAxIH0pO1xuICAgICAgICBhc3NlcnRBcmd1bWVudChldGhlcmV1bSAmJiBldGhlcmV1bS5yZXF1ZXN0LCBcImludmFsaWQgRUlQLTExOTMgcHJvdmlkZXJcIiwgXCJldGhlcmV1bVwiLCBldGhlcmV1bSk7XG4gICAgICAgIHN1cGVyKG5ldHdvcmssIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLiNwcm92aWRlckluZm8gPSBudWxsO1xuICAgICAgICBpZiAoX29wdGlvbnMgJiYgX29wdGlvbnMucHJvdmlkZXJJbmZvKSB7XG4gICAgICAgICAgICB0aGlzLiNwcm92aWRlckluZm8gPSBfb3B0aW9ucy5wcm92aWRlckluZm87XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4jcmVxdWVzdCA9IGFzeW5jIChtZXRob2QsIHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGF5bG9hZCA9IHsgbWV0aG9kLCBwYXJhbXMgfTtcbiAgICAgICAgICAgIHRoaXMuZW1pdChcImRlYnVnXCIsIHsgYWN0aW9uOiBcInNlbmRFaXAxMTkzUmVxdWVzdFwiLCBwYXlsb2FkIH0pO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBldGhlcmV1bS5yZXF1ZXN0KHBheWxvYWQpO1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcImRlYnVnXCIsIHsgYWN0aW9uOiBcInJlY2VpdmVFaXAxMTkzUmVzdWx0XCIsIHJlc3VsdCB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGVycm9yLmNvZGUgPSBlLmNvZGU7XG4gICAgICAgICAgICAgICAgZXJyb3IuZGF0YSA9IGUuZGF0YTtcbiAgICAgICAgICAgICAgICBlcnJvci5wYXlsb2FkID0gcGF5bG9hZDtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoXCJkZWJ1Z1wiLCB7IGFjdGlvbjogXCJyZWNlaXZlRWlwMTE5M0Vycm9yXCIsIGVycm9yIH0pO1xuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbiAgICBnZXQgcHJvdmlkZXJJbmZvKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4jcHJvdmlkZXJJbmZvO1xuICAgIH1cbiAgICBhc3luYyBzZW5kKG1ldGhvZCwgcGFyYW1zKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuX3N0YXJ0KCk7XG4gICAgICAgIHJldHVybiBhd2FpdCBzdXBlci5zZW5kKG1ldGhvZCwgcGFyYW1zKTtcbiAgICB9XG4gICAgYXN5bmMgX3NlbmQocGF5bG9hZCkge1xuICAgICAgICBhc3NlcnRBcmd1bWVudCghQXJyYXkuaXNBcnJheShwYXlsb2FkKSwgXCJFSVAtMTE5MyBkb2VzIG5vdCBzdXBwb3J0IGJhdGNoIHJlcXVlc3RcIiwgXCJwYXlsb2FkXCIsIHBheWxvYWQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy4jcmVxdWVzdChwYXlsb2FkLm1ldGhvZCwgcGF5bG9hZC5wYXJhbXMgfHwgW10pO1xuICAgICAgICAgICAgcmV0dXJuIFt7IGlkOiBwYXlsb2FkLmlkLCByZXN1bHQgfV07XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICBpZDogcGF5bG9hZC5pZCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHsgY29kZTogZS5jb2RlLCBkYXRhOiBlLmRhdGEsIG1lc3NhZ2U6IGUubWVzc2FnZSB9XG4gICAgICAgICAgICAgICAgfV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0UnBjRXJyb3IocGF5bG9hZCwgZXJyb3IpIHtcbiAgICAgICAgZXJyb3IgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGVycm9yKSk7XG4gICAgICAgIC8vIEVJUC0xMTkzIGdpdmVzIHVzIHNvbWUgbWFjaGluZS1yZWFkYWJsZSBlcnJvciBjb2Rlcywgc28gcmV3cml0ZVxuICAgICAgICAvLyB0aGVtIGludG8gRXRoZXJzIHN0YW5kYXJkIGVycm9ycy5cbiAgICAgICAgc3dpdGNoIChlcnJvci5lcnJvci5jb2RlIHx8IC0xKSB7XG4gICAgICAgICAgICBjYXNlIDQwMDE6XG4gICAgICAgICAgICAgICAgZXJyb3IuZXJyb3IubWVzc2FnZSA9IGBldGhlcnMtdXNlci1kZW5pZWQ6ICR7ZXJyb3IuZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0MjAwOlxuICAgICAgICAgICAgICAgIGVycm9yLmVycm9yLm1lc3NhZ2UgPSBgZXRoZXJzLXVuc3VwcG9ydGVkOiAke2Vycm9yLmVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXIuZ2V0UnBjRXJyb3IocGF5bG9hZCwgZXJyb3IpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgUmVzb2x2ZXMgdG8gYGB0cnVlYGAgaWYgdGhlIHByb3ZpZGVyIG1hbmFnZXMgdGhlICUlYWRkcmVzcyUlLlxuICAgICAqL1xuICAgIGFzeW5jIGhhc1NpZ25lcihhZGRyZXNzKSB7XG4gICAgICAgIGlmIChhZGRyZXNzID09IG51bGwpIHtcbiAgICAgICAgICAgIGFkZHJlc3MgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFjY291bnRzID0gYXdhaXQgdGhpcy5zZW5kKFwiZXRoX2FjY291bnRzXCIsIFtdKTtcbiAgICAgICAgaWYgKHR5cGVvZiAoYWRkcmVzcykgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIHJldHVybiAoYWNjb3VudHMubGVuZ3RoID4gYWRkcmVzcyk7XG4gICAgICAgIH1cbiAgICAgICAgYWRkcmVzcyA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuIGFjY291bnRzLmZpbHRlcigoYSkgPT4gKGEudG9Mb3dlckNhc2UoKSA9PT0gYWRkcmVzcykpLmxlbmd0aCAhPT0gMDtcbiAgICB9XG4gICAgYXN5bmMgZ2V0U2lnbmVyKGFkZHJlc3MpIHtcbiAgICAgICAgaWYgKGFkZHJlc3MgPT0gbnVsbCkge1xuICAgICAgICAgICAgYWRkcmVzcyA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoYXdhaXQgdGhpcy5oYXNTaWduZXIoYWRkcmVzcykpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuI3JlcXVlc3QoXCJldGhfcmVxdWVzdEFjY291bnRzXCIsIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBheWxvYWQgPSBlcnJvci5wYXlsb2FkO1xuICAgICAgICAgICAgICAgIHRocm93IHRoaXMuZ2V0UnBjRXJyb3IocGF5bG9hZCwgeyBpZDogcGF5bG9hZC5pZCwgZXJyb3IgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF3YWl0IHN1cGVyLmdldFNpZ25lcihhZGRyZXNzKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogIERpc2NvdmVyIGFuZCBjb25uZWN0IHRvIGEgUHJvdmlkZXIgaW4gdGhlIEJyb3dzZXIgdXNpbmcgdGhlXG4gICAgICogIFtbbGluay1laXAtNjk2M11dIGRpc2NvdmVyeSBtZWNoYW5pc20uIElmIG5vIHByb3ZpZGVycyBhcmVcbiAgICAgKiAgcHJlc2VudCwgYGBudWxsYGAgaXMgcmVzb2x2ZWQuXG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGRpc2NvdmVyKG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLnByb3ZpZGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEJyb3dzZXJQcm92aWRlcihvcHRpb25zLnByb3ZpZGVyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb250ZXh0ID0gb3B0aW9ucy53aW5kb3cgPyBvcHRpb25zLndpbmRvdyA6XG4gICAgICAgICAgICAodHlwZW9mICh3aW5kb3cpICE9PSBcInVuZGVmaW5lZFwiKSA/IHdpbmRvdyA6IG51bGw7XG4gICAgICAgIGlmIChjb250ZXh0ID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFueVByb3ZpZGVyID0gb3B0aW9ucy5hbnlQcm92aWRlcjtcbiAgICAgICAgaWYgKGFueVByb3ZpZGVyICYmIGNvbnRleHQuZXRoZXJldW0pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQnJvd3NlclByb3ZpZGVyKGNvbnRleHQuZXRoZXJldW0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiYWRkRXZlbnRMaXN0ZW5lclwiIGluIGNvbnRleHQgJiYgXCJkaXNwYXRjaEV2ZW50XCIgaW4gY29udGV4dFxuICAgICAgICAgICAgJiYgXCJyZW1vdmVFdmVudExpc3RlbmVyXCIgaW4gY29udGV4dCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRpbWVvdXQgPSBvcHRpb25zLnRpbWVvdXQgPyBvcHRpb25zLnRpbWVvdXQgOiAzMDA7XG4gICAgICAgIGlmICh0aW1lb3V0ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXdhaXQgKG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCBmb3VuZCA9IFtdO1xuICAgICAgICAgICAgY29uc3QgYWRkUHJvdmlkZXIgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBmb3VuZC5wdXNoKGV2ZW50LmRldGFpbCk7XG4gICAgICAgICAgICAgICAgaWYgKGFueVByb3ZpZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IGZpbmFsaXplID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICAgICAgaWYgKGZvdW5kLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiBmaWx0ZXJpbmcgaXMgcHJvdmlkZWQ6XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDYWxsIGZpbHRlciwgd2l0aCBhIGNvcGllcyBvZiBmb3VuZCBwcm92aWRlciBpbmZvc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsdGVyZWQgPSBvcHRpb25zLmZpbHRlcihmb3VuZC5tYXAoaSA9PiBPYmplY3QuYXNzaWduKHt9LCAoaS5pbmZvKSkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJlZCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm8gcHJvdmlkZXIgc2VsZWN0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZmlsdGVyZWQgaW5zdGFuY2VvZiBCcm93c2VyUHJvdmlkZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDdXN0b20gcHJvdmlkZXIgY3JlYXRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmlsdGVyZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgbWF0Y2hpbmcgcHJvdmlkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2ggPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJlZC51dWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBmb3VuZC5maWx0ZXIoZiA9PiAoZmlsdGVyZWQudXVpZCA9PT0gZi5pbmZvLnV1aWQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQFRPRE86IFdoYXQgc2hvdWxkIGhhcHBlbiBpZiBtdWx0aXBsZSB2YWx1ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGZvciB0aGUgc2FtZSBVVUlEP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IG1hdGNoZXNbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7IHByb3ZpZGVyLCBpbmZvIH0gPSBtYXRjaDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShuZXcgQnJvd3NlclByb3ZpZGVyKHByb3ZpZGVyLCB1bmRlZmluZWQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVySW5mbzogaW5mb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobWFrZUVycm9yKFwiZmlsdGVyIHJldHVybmVkIHVua25vd24gaW5mb1wiLCBcIlVOU1VQUE9SVEVEX09QRVJBVElPTlwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZmlsdGVyZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFBpY2sgdGhlIGZpcnN0IGZvdW5kIHByb3ZpZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7IHByb3ZpZGVyLCBpbmZvIH0gPSBmb3VuZFswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IEJyb3dzZXJQcm92aWRlcihwcm92aWRlciwgdW5kZWZpbmVkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJJbmZvOiBpbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGhpbmcgZm91bmRcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udGV4dC5yZW1vdmVFdmVudExpc3RlbmVyKFwiZWlwNjk2Mzphbm5vdW5jZVByb3ZpZGVyXCIsIGFkZFByb3ZpZGVyKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4geyBmaW5hbGl6ZSgpOyB9LCB0aW1lb3V0KTtcbiAgICAgICAgICAgIGNvbnRleHQuYWRkRXZlbnRMaXN0ZW5lcihcImVpcDY5NjM6YW5ub3VuY2VQcm92aWRlclwiLCBhZGRQcm92aWRlcik7XG4gICAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiZWlwNjk2MzpyZXF1ZXN0UHJvdmlkZXJcIikpO1xuICAgICAgICB9KSk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJvdmlkZXItYnJvd3Nlci5qcy5tYXAiLCIvKipcbiAqICBbW2xpbmstYmxvY2tzY291dF1dIHByb3ZpZGVzIGEgdGhpcmQtcGFydHkgc2VydmljZSBmb3IgY29ubmVjdGluZyB0b1xuICogIHZhcmlvdXMgYmxvY2tjaGFpbnMgb3ZlciBKU09OLVJQQy5cbiAqXG4gKiAgKipTdXBwb3J0ZWQgTmV0d29ya3MqKlxuICpcbiAqICAtIEV0aGVyZXVtIE1haW5uZXQgKGBgbWFpbm5ldGBgKVxuICogIC0gU2Vwb2xpYSBUZXN0bmV0IChgYHNlcG9saWFgYClcbiAqICAtIEhvbGVza3kgVGVzdG5ldCAoYGBob2xlc2t5YGApXG4gKiAgLSBFdGhlcmV1bSBDbGFzc2ljIChgYGNsYXNzaWNgYClcbiAqICAtIEFyYml0cnVtIChgYGFyYml0cnVtYGApXG4gKiAgLSBCYXNlIChgYGJhc2VgYClcbiAqICAtIEJhc2UgU2Vwb2xpYSBUZXN0bmV0IChgYGJhc2Utc2Vwb2xpYWBgKVxuICogIC0gR25vc2lzIChgYHhkYWlgYClcbiAqICAtIE9wdGltaXNtIChgYG9wdGltaXNtYGApXG4gKiAgLSBPcHRpbWlzbSBTZXBvbGlhIFRlc3RuZXQgKGBgb3B0aW1pc20tc2Vwb2xpYWBgKVxuICogIC0gUG9seWdvbiAoYGBtYXRpY2BgKVxuICpcbiAqICBAX3N1YnNlY3Rpb246IGFwaS9wcm92aWRlcnMvdGhpcmRwYXJ0eTpCbG9ja3Njb3V0ICBbcHJvdmlkZXJzLWJsb2Nrc2NvdXRdXG4gKi9cbmltcG9ydCB7IGFzc2VydEFyZ3VtZW50LCBkZWZpbmVQcm9wZXJ0aWVzLCBGZXRjaFJlcXVlc3QsIGlzSGV4U3RyaW5nIH0gZnJvbSBcIi4uL3V0aWxzL2luZGV4LmpzXCI7XG5pbXBvcnQgeyBOZXR3b3JrIH0gZnJvbSBcIi4vbmV0d29yay5qc1wiO1xuaW1wb3J0IHsgSnNvblJwY1Byb3ZpZGVyIH0gZnJvbSBcIi4vcHJvdmlkZXItanNvbnJwYy5qc1wiO1xuZnVuY3Rpb24gZ2V0VXJsKG5hbWUpIHtcbiAgICBzd2l0Y2ggKG5hbWUpIHtcbiAgICAgICAgY2FzZSBcIm1haW5uZXRcIjpcbiAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi9cXC9ldGguYmxvY2tzY291dC5jb20vYXBpL2V0aC1ycGNcIjtcbiAgICAgICAgY2FzZSBcInNlcG9saWFcIjpcbiAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi9cXC9ldGgtc2Vwb2xpYS5ibG9ja3Njb3V0LmNvbS9hcGkvZXRoLXJwY1wiO1xuICAgICAgICBjYXNlIFwiaG9sZXNreVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2V0aC1ob2xlc2t5LmJsb2Nrc2NvdXQuY29tL2FwaS9ldGgtcnBjXCI7XG4gICAgICAgIGNhc2UgXCJjbGFzc2ljXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJodHRwczovXFwvZXRjLmJsb2Nrc2NvdXQuY29tL2FwaS9ldGgtcnBjXCI7XG4gICAgICAgIGNhc2UgXCJhcmJpdHJ1bVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL2FyYml0cnVtLmJsb2Nrc2NvdXQuY29tL2FwaS9ldGgtcnBjXCI7XG4gICAgICAgIGNhc2UgXCJiYXNlXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJodHRwczovXFwvYmFzZS5ibG9ja3Njb3V0LmNvbS9hcGkvZXRoLXJwY1wiO1xuICAgICAgICBjYXNlIFwiYmFzZS1zZXBvbGlhXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJodHRwczovXFwvYmFzZS1zZXBvbGlhLmJsb2Nrc2NvdXQuY29tL2FwaS9ldGgtcnBjXCI7XG4gICAgICAgIGNhc2UgXCJtYXRpY1wiOlxuICAgICAgICAgICAgcmV0dXJuIFwiaHR0cHM6L1xcL3BvbHlnb24uYmxvY2tzY291dC5jb20vYXBpL2V0aC1ycGNcIjtcbiAgICAgICAgY2FzZSBcIm9wdGltaXNtXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJodHRwczovXFwvb3B0aW1pc20uYmxvY2tzY291dC5jb20vYXBpL2V0aC1ycGNcIjtcbiAgICAgICAgY2FzZSBcIm9wdGltaXNtLXNlcG9saWFcIjpcbiAgICAgICAgICAgIHJldHVybiBcImh0dHBzOi9cXC9vcHRpbWlzbS1zZXBvbGlhLmJsb2Nrc2NvdXQuY29tL2FwaS9ldGgtcnBjXCI7XG4gICAgICAgIGNhc2UgXCJ4ZGFpXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJodHRwczovXFwvZ25vc2lzLmJsb2Nrc2NvdXQuY29tL2FwaS9ldGgtcnBjXCI7XG4gICAgfVxuICAgIGFzc2VydEFyZ3VtZW50KGZhbHNlLCBcInVuc3VwcG9ydGVkIG5ldHdvcmtcIiwgXCJuZXR3b3JrXCIsIG5hbWUpO1xufVxuLyoqXG4gKiAgVGhlICoqQmxvY2tzY291dFByb3ZpZGVyKiogY29ubmVjdHMgdG8gdGhlIFtbbGluay1ibG9ja3Njb3V0XV1cbiAqICBKU09OLVJQQyBlbmQtcG9pbnRzLlxuICpcbiAqICBCeSBkZWZhdWx0LCBhIGhpZ2hseS10aHJvdHRsZWQgQVBJIGtleSBpcyB1c2VkLCB3aGljaCBpc1xuICogIGFwcHJvcHJpYXRlIGZvciBxdWljayBwcm90b3R5cGVzIGFuZCBzaW1wbGUgc2NyaXB0cy4gVG9cbiAqICBnYWluIGFjY2VzcyB0byBhbiBpbmNyZWFzZWQgcmF0ZS1saW1pdCwgaXQgaXMgaGlnaGx5XG4gKiAgcmVjb21tZW5kZWQgdG8gW3NpZ24gdXAgaGVyZV0obGluay1ibG9ja3Njb3V0KS5cbiAqL1xuZXhwb3J0IGNsYXNzIEJsb2Nrc2NvdXRQcm92aWRlciBleHRlbmRzIEpzb25ScGNQcm92aWRlciB7XG4gICAgLyoqXG4gICAgICogIFRoZSBBUEkga2V5LlxuICAgICAqL1xuICAgIGFwaUtleTtcbiAgICAvKipcbiAgICAgKiAgQ3JlYXRlcyBhIG5ldyAqKkJsb2Nrc2NvdXRQcm92aWRlcioqLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKF9uZXR3b3JrLCBhcGlLZXkpIHtcbiAgICAgICAgaWYgKF9uZXR3b3JrID09IG51bGwpIHtcbiAgICAgICAgICAgIF9uZXR3b3JrID0gXCJtYWlubmV0XCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV0d29yayA9IE5ldHdvcmsuZnJvbShfbmV0d29yayk7XG4gICAgICAgIGlmIChhcGlLZXkgPT0gbnVsbCkge1xuICAgICAgICAgICAgYXBpS2V5ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gQmxvY2tzY291dFByb3ZpZGVyLmdldFJlcXVlc3QobmV0d29yayk7XG4gICAgICAgIHN1cGVyKHJlcXVlc3QsIG5ldHdvcmssIHsgc3RhdGljTmV0d29yazogbmV0d29yayB9KTtcbiAgICAgICAgZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7IGFwaUtleSB9KTtcbiAgICB9XG4gICAgX2dldFByb3ZpZGVyKGNoYWluSWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmxvY2tzY291dFByb3ZpZGVyKGNoYWluSWQsIHRoaXMuYXBpS2V5KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHsgfVxuICAgICAgICByZXR1cm4gc3VwZXIuX2dldFByb3ZpZGVyKGNoYWluSWQpO1xuICAgIH1cbiAgICBpc0NvbW11bml0eVJlc291cmNlKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuYXBpS2V5ID09PSBudWxsKTtcbiAgICB9XG4gICAgZ2V0UnBjUmVxdWVzdChyZXEpIHtcbiAgICAgICAgLy8gQmxvY2tzY291dCBlbmZvcmNlcyB0aGUgVEFHIGFyZ3VtZW50IGZvciBlc3RpbWF0ZUdhc1xuICAgICAgICBjb25zdCByZXNwID0gc3VwZXIuZ2V0UnBjUmVxdWVzdChyZXEpO1xuICAgICAgICBpZiAocmVzcCAmJiByZXNwLm1ldGhvZCA9PT0gXCJldGhfZXN0aW1hdGVHYXNcIiAmJiByZXNwLmFyZ3MubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgIHJlc3AuYXJncyA9IHJlc3AuYXJncy5zbGljZSgpO1xuICAgICAgICAgICAgcmVzcC5hcmdzLnB1c2goXCJsYXRlc3RcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3A7XG4gICAgfVxuICAgIGdldFJwY0Vycm9yKHBheWxvYWQsIF9lcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvciA9IF9lcnJvciA/IF9lcnJvci5lcnJvciA6IG51bGw7XG4gICAgICAgIC8vIEJsb2Nrc2NvdXQgY3VycmVudGx5IGRyb3BzIHRoZSBWTSByZXN1bHQgYW5kIHJlcGxhY2VzIGl0IHdpdGggYVxuICAgICAgICAvLyBodW1hbi1yZWFkYWJsZSBzdHJpbmcsIHNvIHdlIG5lZWQgdG8gbWFrZSBpdCBtYWNoaW5lLXJlYWRhYmxlLlxuICAgICAgICBpZiAoZXJyb3IgJiYgZXJyb3IuY29kZSA9PT0gLTMyMDE1ICYmICFpc0hleFN0cmluZyhlcnJvci5kYXRhIHx8IFwiXCIsIHRydWUpKSB7XG4gICAgICAgICAgICBjb25zdCBwYW5pY0NvZGVzID0ge1xuICAgICAgICAgICAgICAgIFwiYXNzZXJ0KGZhbHNlKVwiOiBcIjAxXCIsXG4gICAgICAgICAgICAgICAgXCJhcml0aG1ldGljIHVuZGVyZmxvdyBvciBvdmVyZmxvd1wiOiBcIjExXCIsXG4gICAgICAgICAgICAgICAgXCJkaXZpc2lvbiBvciBtb2R1bG8gYnkgemVyb1wiOiBcIjEyXCIsXG4gICAgICAgICAgICAgICAgXCJvdXQtb2YtYm91bmRzIGFycmF5IGFjY2VzczsgcG9wcGluZyBvbiBhbiBlbXB0eSBhcnJheVwiOiBcIjMxXCIsXG4gICAgICAgICAgICAgICAgXCJvdXQtb2YtYm91bmRzIGFjY2VzcyBvZiBhbiBhcnJheSBvciBieXRlc05cIjogXCIzMlwiXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGV0IHBhbmljQ29kZSA9IFwiXCI7XG4gICAgICAgICAgICBpZiAoZXJyb3IubWVzc2FnZSA9PT0gXCJWTSBleGVjdXRpb24gZXJyb3IuXCIpIHtcbiAgICAgICAgICAgICAgICAvLyBldGhfY2FsbCBwYXNzZXMgdGhpcyBtZXNzYWdlXG4gICAgICAgICAgICAgICAgcGFuaWNDb2RlID0gcGFuaWNDb2Rlc1tlcnJvci5kYXRhXSB8fCBcIlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocGFuaWNDb2Rlc1tlcnJvci5tZXNzYWdlIHx8IFwiXCJdKSB7XG4gICAgICAgICAgICAgICAgcGFuaWNDb2RlID0gcGFuaWNDb2Rlc1tlcnJvci5tZXNzYWdlIHx8IFwiXCJdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhbmljQ29kZSkge1xuICAgICAgICAgICAgICAgIGVycm9yLm1lc3NhZ2UgKz0gYCAocmV2ZXJ0ZWQ6ICR7ZXJyb3IuZGF0YX0pYDtcbiAgICAgICAgICAgICAgICBlcnJvci5kYXRhID0gXCIweDRlNDg3YjcxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDBcIiArIHBhbmljQ29kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChlcnJvciAmJiBlcnJvci5jb2RlID09PSAtMzIwMDApIHtcbiAgICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlID09PSBcIndyb25nIHRyYW5zYWN0aW9uIG5vbmNlXCIpIHtcbiAgICAgICAgICAgICAgICBlcnJvci5tZXNzYWdlICs9IFwiIChub25jZSB0b28gbG93KVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXBlci5nZXRScGNFcnJvcihwYXlsb2FkLCBfZXJyb3IpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgUmV0dXJucyBhIHByZXBhcmVkIHJlcXVlc3QgZm9yIGNvbm5lY3RpbmcgdG8gJSVuZXR3b3JrJSVcbiAgICAgKiAgd2l0aCAlJWFwaUtleSUlLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRSZXF1ZXN0KG5ldHdvcmspIHtcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IG5ldyBGZXRjaFJlcXVlc3QoZ2V0VXJsKG5ldHdvcmsubmFtZSkpO1xuICAgICAgICByZXF1ZXN0LmFsbG93R3ppcCA9IHRydWU7XG4gICAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByb3ZpZGVyLWJsb2Nrc2NvdXQuanMubWFwIiwiLyoqXG4gKiAgW1tsaW5rLXBvY2tldF1dIHByb3ZpZGVzIGEgdGhpcmQtcGFydHkgc2VydmljZSBmb3IgY29ubmVjdGluZyB0b1xuICogIHZhcmlvdXMgYmxvY2tjaGFpbnMgb3ZlciBKU09OLVJQQy5cbiAqXG4gKiAgKipTdXBwb3J0ZWQgTmV0d29ya3MqKlxuICpcbiAqICAtIEV0aGVyZXVtIE1haW5uZXQgKGBgbWFpbm5ldGBgKVxuICogIC0gR29lcmxpIFRlc3RuZXQgKGBgZ29lcmxpYGApXG4gKiAgLSBQb2x5Z29uIChgYG1hdGljYGApXG4gKiAgLSBBcmJpdHJ1bSAoYGBhcmJpdHJ1bWBgKVxuICpcbiAqICBAX3N1YnNlY3Rpb246IGFwaS9wcm92aWRlcnMvdGhpcmRwYXJ0eTpQb2NrZXQgIFtwcm92aWRlcnMtcG9ja2V0XVxuICovXG5pbXBvcnQgeyBkZWZpbmVQcm9wZXJ0aWVzLCBGZXRjaFJlcXVlc3QsIGFzc2VydEFyZ3VtZW50IH0gZnJvbSBcIi4uL3V0aWxzL2luZGV4LmpzXCI7XG5pbXBvcnQgeyBzaG93VGhyb3R0bGVNZXNzYWdlIH0gZnJvbSBcIi4vY29tbXVuaXR5LmpzXCI7XG5pbXBvcnQgeyBOZXR3b3JrIH0gZnJvbSBcIi4vbmV0d29yay5qc1wiO1xuaW1wb3J0IHsgSnNvblJwY1Byb3ZpZGVyIH0gZnJvbSBcIi4vcHJvdmlkZXItanNvbnJwYy5qc1wiO1xuY29uc3QgZGVmYXVsdEFwcGxpY2F0aW9uSWQgPSBcIjYyZTFhZDUxYjM3YjhlMDAzOTRiZGEzYlwiO1xuZnVuY3Rpb24gZ2V0SG9zdChuYW1lKSB7XG4gICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgIGNhc2UgXCJtYWlubmV0XCI6XG4gICAgICAgICAgICByZXR1cm4gXCJldGgtbWFpbm5ldC5nYXRld2F5LnBva3QubmV0d29ya1wiO1xuICAgICAgICBjYXNlIFwiZ29lcmxpXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJldGgtZ29lcmxpLmdhdGV3YXkucG9rdC5uZXR3b3JrXCI7XG4gICAgICAgIGNhc2UgXCJtYXRpY1wiOlxuICAgICAgICAgICAgcmV0dXJuIFwicG9seS1tYWlubmV0LmdhdGV3YXkucG9rdC5uZXR3b3JrXCI7XG4gICAgICAgIGNhc2UgXCJtYXRpYy1tdW1iYWlcIjpcbiAgICAgICAgICAgIHJldHVybiBcInBvbHlnb24tbXVtYmFpLXJwYy5nYXRld2F5LnBva3QubmV0d29ya1wiO1xuICAgIH1cbiAgICBhc3NlcnRBcmd1bWVudChmYWxzZSwgXCJ1bnN1cHBvcnRlZCBuZXR3b3JrXCIsIFwibmV0d29ya1wiLCBuYW1lKTtcbn1cbi8qKlxuICogIFRoZSAqKlBvY2tldFByb3ZpZGVyKiogY29ubmVjdHMgdG8gdGhlIFtbbGluay1wb2NrZXRdXVxuICogIEpTT04tUlBDIGVuZC1wb2ludHMuXG4gKlxuICogIEJ5IGRlZmF1bHQsIGEgaGlnaGx5LXRocm90dGxlZCBBUEkga2V5IGlzIHVzZWQsIHdoaWNoIGlzXG4gKiAgYXBwcm9wcmlhdGUgZm9yIHF1aWNrIHByb3RvdHlwZXMgYW5kIHNpbXBsZSBzY3JpcHRzLiBUb1xuICogIGdhaW4gYWNjZXNzIHRvIGFuIGluY3JlYXNlZCByYXRlLWxpbWl0LCBpdCBpcyBoaWdobHlcbiAqICByZWNvbW1lbmRlZCB0byBbc2lnbiB1cCBoZXJlXShsaW5rLXBvY2tldC1zaWdudXApLlxuICovXG5leHBvcnQgY2xhc3MgUG9ja2V0UHJvdmlkZXIgZXh0ZW5kcyBKc29uUnBjUHJvdmlkZXIge1xuICAgIC8qKlxuICAgICAqICBUaGUgQXBwbGljYXRpb24gSUQgZm9yIHRoZSBQb2NrZXQgY29ubmVjdGlvbi5cbiAgICAgKi9cbiAgICBhcHBsaWNhdGlvbklkO1xuICAgIC8qKlxuICAgICAqICBUaGUgQXBwbGljYXRpb24gU2VjcmV0IGZvciBtYWtpbmcgYXV0aGVudGljYXRlZCByZXF1ZXN0c1xuICAgICAqICB0byB0aGUgUG9ja2V0IGNvbm5lY3Rpb24uXG4gICAgICovXG4gICAgYXBwbGljYXRpb25TZWNyZXQ7XG4gICAgLyoqXG4gICAgICogIENyZWF0ZSBhIG5ldyAqKlBvY2tldFByb3ZpZGVyKiouXG4gICAgICpcbiAgICAgKiAgQnkgZGVmYXVsdCBjb25uZWN0aW5nIHRvIGBgbWFpbm5ldGBgIHdpdGggYSBoaWdobHkgdGhyb3R0bGVkXG4gICAgICogIEFQSSBrZXkuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoX25ldHdvcmssIGFwcGxpY2F0aW9uSWQsIGFwcGxpY2F0aW9uU2VjcmV0KSB7XG4gICAgICAgIGlmIChfbmV0d29yayA9PSBudWxsKSB7XG4gICAgICAgICAgICBfbmV0d29yayA9IFwibWFpbm5ldFwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ldHdvcmsgPSBOZXR3b3JrLmZyb20oX25ldHdvcmspO1xuICAgICAgICBpZiAoYXBwbGljYXRpb25JZCA9PSBudWxsKSB7XG4gICAgICAgICAgICBhcHBsaWNhdGlvbklkID0gZGVmYXVsdEFwcGxpY2F0aW9uSWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFwcGxpY2F0aW9uU2VjcmV0ID09IG51bGwpIHtcbiAgICAgICAgICAgIGFwcGxpY2F0aW9uU2VjcmV0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvcHRpb25zID0geyBzdGF0aWNOZXR3b3JrOiBuZXR3b3JrIH07XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBQb2NrZXRQcm92aWRlci5nZXRSZXF1ZXN0KG5ldHdvcmssIGFwcGxpY2F0aW9uSWQsIGFwcGxpY2F0aW9uU2VjcmV0KTtcbiAgICAgICAgc3VwZXIocmVxdWVzdCwgbmV0d29yaywgb3B0aW9ucyk7XG4gICAgICAgIGRlZmluZVByb3BlcnRpZXModGhpcywgeyBhcHBsaWNhdGlvbklkLCBhcHBsaWNhdGlvblNlY3JldCB9KTtcbiAgICB9XG4gICAgX2dldFByb3ZpZGVyKGNoYWluSWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUG9ja2V0UHJvdmlkZXIoY2hhaW5JZCwgdGhpcy5hcHBsaWNhdGlvbklkLCB0aGlzLmFwcGxpY2F0aW9uU2VjcmV0KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHsgfVxuICAgICAgICByZXR1cm4gc3VwZXIuX2dldFByb3ZpZGVyKGNoYWluSWQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgUmV0dXJucyBhIHByZXBhcmVkIHJlcXVlc3QgZm9yIGNvbm5lY3RpbmcgdG8gJSVuZXR3b3JrJSUgd2l0aFxuICAgICAqICAlJWFwcGxpY2F0aW9uSWQlJS5cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0UmVxdWVzdChuZXR3b3JrLCBhcHBsaWNhdGlvbklkLCBhcHBsaWNhdGlvblNlY3JldCkge1xuICAgICAgICBpZiAoYXBwbGljYXRpb25JZCA9PSBudWxsKSB7XG4gICAgICAgICAgICBhcHBsaWNhdGlvbklkID0gZGVmYXVsdEFwcGxpY2F0aW9uSWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IG5ldyBGZXRjaFJlcXVlc3QoYGh0dHBzOi9cXC8ke2dldEhvc3QobmV0d29yay5uYW1lKX0vdjEvbGIvJHthcHBsaWNhdGlvbklkfWApO1xuICAgICAgICByZXF1ZXN0LmFsbG93R3ppcCA9IHRydWU7XG4gICAgICAgIGlmIChhcHBsaWNhdGlvblNlY3JldCkge1xuICAgICAgICAgICAgcmVxdWVzdC5zZXRDcmVkZW50aWFscyhcIlwiLCBhcHBsaWNhdGlvblNlY3JldCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFwcGxpY2F0aW9uSWQgPT09IGRlZmF1bHRBcHBsaWNhdGlvbklkKSB7XG4gICAgICAgICAgICByZXF1ZXN0LnJldHJ5RnVuYyA9IGFzeW5jIChyZXF1ZXN0LCByZXNwb25zZSwgYXR0ZW1wdCkgPT4ge1xuICAgICAgICAgICAgICAgIHNob3dUaHJvdHRsZU1lc3NhZ2UoXCJQb2NrZXRQcm92aWRlclwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfVxuICAgIGlzQ29tbXVuaXR5UmVzb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5hcHBsaWNhdGlvbklkID09PSBkZWZhdWx0QXBwbGljYXRpb25JZCk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJvdmlkZXItcG9ja2V0LmpzLm1hcCIsImNvbnN0IElwY1NvY2tldFByb3ZpZGVyID0gdW5kZWZpbmVkO1xuZXhwb3J0IHsgSXBjU29ja2V0UHJvdmlkZXIgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByb3ZpZGVyLWlwY3NvY2tldC1icm93c2VyLmpzLm1hcCIsImNvbnN0IEJhc2U2NCA9IFwiKSFAIyQlXiYqKEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXotX1wiO1xuLyoqXG4gKiAgQF9pZ25vcmVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZUJpdHMod2lkdGgsIGRhdGEpIHtcbiAgICBjb25zdCBtYXhWYWx1ZSA9ICgxIDw8IHdpZHRoKSAtIDE7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgbGV0IGFjY3VtID0gMCwgYml0cyA9IDAsIGZsb29kID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gQWNjdW11bGF0ZSA2IGJpdHMgb2YgZGF0YVxuICAgICAgICBhY2N1bSA9ICgoYWNjdW0gPDwgNikgfCBCYXNlNjQuaW5kZXhPZihkYXRhW2ldKSk7XG4gICAgICAgIGJpdHMgKz0gNjtcbiAgICAgICAgLy8gV2hpbGUgd2UgaGF2ZSBlbm91Z2ggZm9yIGEgd29yZC4uLlxuICAgICAgICB3aGlsZSAoYml0cyA+PSB3aWR0aCkge1xuICAgICAgICAgICAgLy8gLi4ucmVhZCB0aGUgd29yZFxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSAoYWNjdW0gPj4gKGJpdHMgLSB3aWR0aCkpO1xuICAgICAgICAgICAgYWNjdW0gJj0gKDEgPDwgKGJpdHMgLSB3aWR0aCkpIC0gMTtcbiAgICAgICAgICAgIGJpdHMgLT0gd2lkdGg7XG4gICAgICAgICAgICAvLyBBIHZhbHVlIG9mIDAgaW5kaWNhdGVzIHdlIGV4Y2VlZGVkIG1heFZhbHVlLCBpdFxuICAgICAgICAgICAgLy8gZmxvb2RzIG92ZXIgaW50byB0aGUgbmV4dCB2YWx1ZVxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgZmxvb2QgKz0gbWF4VmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSArIGZsb29kKTtcbiAgICAgICAgICAgICAgICBmbG9vZCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJpdC1yZWFkZXIuanMubWFwIiwiaW1wb3J0IHsgYXNzZXJ0QXJndW1lbnQgfSBmcm9tIFwiLi4vdXRpbHMvaW5kZXguanNcIjtcbmltcG9ydCB7IGRlY29kZUJpdHMgfSBmcm9tIFwiLi9iaXQtcmVhZGVyLmpzXCI7XG5pbXBvcnQgeyBkZWNvZGVPd2wgfSBmcm9tIFwiLi9kZWNvZGUtb3dsLmpzXCI7XG4vKipcbiAqICBAX2lnbm9yZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlT3dsQShkYXRhLCBhY2NlbnRzKSB7XG4gICAgbGV0IHdvcmRzID0gZGVjb2RlT3dsKGRhdGEpLmpvaW4oXCIsXCIpO1xuICAgIC8vIEluamVjdCB0aGUgYWNjZW50c1xuICAgIGFjY2VudHMuc3BsaXQoLywvZykuZm9yRWFjaCgoYWNjZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gYWNjZW50Lm1hdGNoKC9eKFthLXpdKikoWzAtOV0rKShbMC05XSkoLiopJC8pO1xuICAgICAgICBhc3NlcnRBcmd1bWVudChtYXRjaCAhPT0gbnVsbCwgXCJpbnRlcm5hbCBlcnJvciBwYXJzaW5nIGFjY2VudHNcIiwgXCJhY2NlbnRzXCIsIGFjY2VudHMpO1xuICAgICAgICBsZXQgcG9zT2Zmc2V0ID0gMDtcbiAgICAgICAgY29uc3QgcG9zaXRpb25zID0gZGVjb2RlQml0cyhwYXJzZUludChtYXRjaFszXSksIG1hdGNoWzRdKTtcbiAgICAgICAgY29uc3QgY2hhckNvZGUgPSBwYXJzZUludChtYXRjaFsyXSk7XG4gICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgKFske21hdGNoWzFdfV0pYCwgXCJnXCIpO1xuICAgICAgICB3b3JkcyA9IHdvcmRzLnJlcGxhY2UocmVnZXgsIChhbGwsIGxldHRlcikgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVtID0gLS1wb3NpdGlvbnNbcG9zT2Zmc2V0XTtcbiAgICAgICAgICAgIGlmIChyZW0gPT09IDApIHtcbiAgICAgICAgICAgICAgICBsZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGxldHRlci5jaGFyQ29kZUF0KDApLCBjaGFyQ29kZSk7XG4gICAgICAgICAgICAgICAgcG9zT2Zmc2V0Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbGV0dGVyO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gd29yZHMuc3BsaXQoXCIsXCIpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGVjb2RlLW93bGEuanMubWFwIiwiaW1wb3J0IHsgV29yZGxpc3RPd2wgfSBmcm9tIFwiLi93b3JkbGlzdC1vd2wuanNcIjtcbmltcG9ydCB7IGRlY29kZU93bEEgfSBmcm9tIFwiLi9kZWNvZGUtb3dsYS5qc1wiO1xuLyoqXG4gKiAgQW4gT1dMLUEgZm9ybWF0IFdvcmRsaXN0IGV4dGVuZHMgdGhlIE9XTCBmb3JtYXQgdG8gYWRkIGFuXG4gKiAgb3ZlcmxheSBvbnRvIGFuIE9XTCBmb3JtYXQgV29yZGxpc3QgdG8gc3VwcG9ydCBkaWFjcml0aWNcbiAqICBtYXJrcy5cbiAqXG4gKiAgVGhpcyBjbGFzcyBpcyBnZW5lcmFsbHkgbm90IHVzZWZ1bCB0byBtb3N0IGRldmVsb3BlcnMgYXNcbiAqICBpdCBpcyB1c2VkIG1haW5seSBpbnRlcm5hbGx5IHRvIGtlZXAgV29yZGxpc3RzIGZvciBsYW5ndWFnZXNcbiAqICBiYXNlZCBvbiBsYXRpbi0xIHNtYWxsLlxuICpcbiAqICBJZiBuZWNlc3NhcnksIHRoZXJlIGFyZSB0b29scyB3aXRoaW4gdGhlIGBgZ2VuZXJhdGlvbi9gYCBmb2xkZXJcbiAqICB0byBjcmVhdGUgdGhlIG5lY2Vzc2FyeSBkYXRhLlxuICovXG5leHBvcnQgY2xhc3MgV29yZGxpc3RPd2xBIGV4dGVuZHMgV29yZGxpc3RPd2wge1xuICAgICNhY2NlbnQ7XG4gICAgLyoqXG4gICAgICogIENyZWF0ZXMgYSBuZXcgV29yZGxpc3QgZm9yICUlbG9jYWxlJSUgdXNpbmcgdGhlIE9XTEEgJSVkYXRhJSVcbiAgICAgKiAgYW5kICUlYWNjZW50JSUgZGF0YSBhbmQgdmFsaWRhdGVkIGFnYWluc3QgdGhlICUlY2hlY2tzdW0lJS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihsb2NhbGUsIGRhdGEsIGFjY2VudCwgY2hlY2tzdW0pIHtcbiAgICAgICAgc3VwZXIobG9jYWxlLCBkYXRhLCBjaGVja3N1bSk7XG4gICAgICAgIHRoaXMuI2FjY2VudCA9IGFjY2VudDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogIFRoZSBPV0xBLWVuY29kZWQgYWNjZW50IGRhdGEuXG4gICAgICovXG4gICAgZ2V0IF9hY2NlbnQoKSB7IHJldHVybiB0aGlzLiNhY2NlbnQ7IH1cbiAgICAvKipcbiAgICAgKiAgRGVjb2RlIGFsbCB0aGUgd29yZHMgZm9yIHRoZSB3b3JkbGlzdC5cbiAgICAgKi9cbiAgICBfZGVjb2RlV29yZHMoKSB7XG4gICAgICAgIHJldHVybiBkZWNvZGVPd2xBKHRoaXMuX2RhdGEsIHRoaXMuX2FjY2VudCk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d29yZGxpc3Qtb3dsYS5qcy5tYXAiLCJpbXBvcnQgeyBMYW5nRW4gfSBmcm9tIFwiLi9sYW5nLWVuLmpzXCI7XG5leHBvcnQgY29uc3Qgd29yZGxpc3RzID0ge1xuICAgIGVuOiBMYW5nRW4ud29yZGxpc3QoKSxcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD13b3JkbGlzdHMtYnJvd3Nlci5qcy5tYXAiXSwibmFtZXMiOlsidmFsdWUiLCJfa2VjY2FrMjU2IiwiX3NoYTI1NiIsImRlZmF1bHRBcGlLZXkiLCJnZXRIb3N0IiwicmVxdWVzdCIsImVycm9yIiwiaWQiLCJyZXNwb25zZSIsInJlc3VsdCIsInRyYW5zYWN0aW9uIiwiYmxvY2tOdW1iZXIiXSwibWFwcGluZ3MiOiI7QUFLWSxNQUFDLElBQUksT0FBTyxvRUFBb0U7QUFNaEYsTUFBQyxjQUFjLE9BQU8scUJBQXFCO0FBTTNDLE1BQUMsYUFBYSxPQUFPLG9FQUFvRTtBQU16RixNQUFDLFlBQVksT0FBTyxvRUFBb0UsSUFBSSxPQUFPLEVBQUU7QUFNckcsTUFBQyxZQUFZLE9BQU8sb0VBQW9FO0FDUHBHLFNBQVMsT0FBTztBQUNaLGNBQVksS0FBSTtBQUNoQixZQUFVLEtBQUk7QUFDZCxTQUFPLEtBQUk7QUFDWCxjQUFZLEtBQUk7QUFDaEIsWUFBVSxLQUFJO0FBQ2QsU0FBTyxLQUFJO0FBQ1gsYUFBVyxLQUFJO0FBQ2YsU0FBTyxLQUFJO0FBQ1gsU0FBTyxLQUFJO0FBQ1gsY0FBWSxLQUFJO0FBQ3BCO0FDOUJBLE1BQU0sYUFBYSxJQUFJLE9BQU8saUJBQWlCO0FBQy9DLE1BQU0sY0FBYyxJQUFJLE9BQU8sbUJBQW1CO0FBQ2xELE1BQU0sYUFBYSxJQUFJLE9BQU8sc0JBQXNCO0FBQ3BELFNBQVMsTUFBTSxNQUFNLE9BQU8sU0FBUztBQUNqQyxVQUFRLE1BQUk7QUFBQSxJQUNSLEtBQUs7QUFDRCxVQUFJLFNBQVM7QUFDVCxlQUFPLFNBQVMsYUFBYSxPQUFPLEVBQUUsQ0FBQztBQUFBLE1BQzNDO0FBQ0EsYUFBTyxTQUFTLFdBQVcsS0FBSyxDQUFDO0FBQUEsSUFDckMsS0FBSztBQUNELGFBQU8sWUFBWSxLQUFLO0FBQUEsSUFDNUIsS0FBSztBQUNELGFBQU8s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
