(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
/** Main SDK class, importing this provides access to everything */
Object.defineProperty(exports, "__esModule", { value: true });
var Errors_1 = require("./constants/Errors");
var FKPlatformError_1 = require("./errors/FKPlatformError");
var ModuleManager_1 = require("./managers/ModuleManager");
var AuthModuleImpl_1 = require("./modules/AuthModuleImpl");
var SetupHelper_1 = require("./SetupHelper");
var FKPlatform = /** @class */ (function () {
    /**
     * Pass in the given authorization credentials. You should have these with you secretly.
     * @constructor
     * @param clientID
     */
    function FKPlatform(clientID) {
        this.assertPlatformExists();
        this.clientID = clientID;
        this.assertClientIdentity();
        this.moduleManager = new ModuleManager_1.ModuleManager();
        //Initializing
        new AuthModuleImpl_1.AuthModuleImpl().init(clientID);
        if (FKPlatform.isReleaseMode()) {
            SetupHelper_1.SetupHelper.trySettingUpLocationChangeEvents();
        }
    }
    /**
     * Checks if your code is running inside Flipkart App/Platfrom. Should be used instead of UA checks.
     * TODO: Should be fast, will be frequently called.
     */
    FKPlatform.isPlatformAvailable = function () {
        return true;
    };
    FKPlatform.isReleaseMode = function () {
        return true;
    };
    /**
     * @returns ModuleManager which provides access to all bridge capabilties that flipkart platform enables.
     */
    FKPlatform.prototype.getModuleHelper = function () {
        this.assertPlatformExists();
        return this.moduleManager;
    };
    FKPlatform.prototype.assertPlatformExists = function () {
        if (!FKPlatform.isPlatformAvailable()) {
            throw new FKPlatformError_1.FKPlatformError(Errors_1.Errors.MESSAGE_PLATFORM_UNAVAILABLE);
        }
    };
    FKPlatform.prototype.assertClientIdentity = function () {
        if (!this.clientID || this.clientID === "") {
            throw new FKPlatformError_1.FKPlatformError(Errors_1.Errors.MESSAGE_CLIENT_ID_ABSENT);
        }
    };
    return FKPlatform;
}());
exports.default = FKPlatform;

},{"./SetupHelper":2,"./constants/Errors":4,"./errors/FKPlatformError":5,"./managers/ModuleManager":6,"./modules/AuthModuleImpl":10}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WindowManager_1 = require("./managers/WindowManager");
var FKPlatform_1 = require("./FKPlatform");
var NativeModuleManager_1 = require("./managers/modules/NativeModuleManager");
var LAST_WINDOW_LOCATION = "";
var pushStateOriginal = history.pushState;
var replaceStateOriginal = history.replaceState;
var SetupHelper = /** @class */ (function () {
    function SetupHelper() {
    }
    SetupHelper.trySettingUpForBrowser = function () {
        var windowObj = WindowManager_1.WindowManager.getWindow();
        if (windowObj && !windowObj.FKExtension) {
            require("es6-promise/auto"); //tslint:disable-line
            windowObj.FKExtension = {
                isPlatformAvailable: function () {
                    return FKPlatform_1.default.isPlatformAvailable();
                },
                newPlatformInstance: function (clientId) {
                    return new FKPlatform_1.default(clientId);
                },
            };
        }
    };
    SetupHelper.trySettingUpLocationChangeEvents = function () {
        var windowObj = WindowManager_1.WindowManager.getWindow();
        if (windowObj && windowObj.FKExtension) {
            history.pushState = function (data, title, url) {
                var args = [];
                for (var _i = 3; _i < arguments.length; _i++) {
                    args[_i - 3] = arguments[_i];
                }
                SetupHelper.notfiyLocationChange(url, false);
                pushStateOriginal.call.apply(pushStateOriginal, [history, data, title, url].concat(args));
            };
            history.replaceState = function (data, title, url) {
                var args = [];
                for (var _i = 3; _i < arguments.length; _i++) {
                    args[_i - 3] = arguments[_i];
                }
                SetupHelper.notfiyLocationChange(url, false);
                replaceStateOriginal.call.apply(replaceStateOriginal, [history, data, title, url].concat(args));
            };
            window.addEventListener("popstate", function (event) {
                if (event.state) {
                    SetupHelper.notfiyLocationChange(window.location.href, true);
                }
            });
        }
    };
    SetupHelper.trySettingUpForReactNative = function () {
        //TODO
    };
    SetupHelper.notfiyLocationChange = function (url, isBackNavigation) {
        var navigationModule = NativeModuleManager_1.NativeModuleHelper.getCurrentNativeModuleProvider().NavigationModule;
        if (url) {
            if (url !== LAST_WINDOW_LOCATION) {
                LAST_WINDOW_LOCATION = url;
                if (!url.startsWith("http")) {
                    url = location.protocol + "//" + window.location.hostname + url;
                }
                navigationModule.notifyPageLocationChange(url, !!isBackNavigation);
            }
        }
    };
    return SetupHelper;
}());
exports.SetupHelper = SetupHelper;

},{"./FKPlatform":1,"./managers/WindowManager":8,"./managers/modules/NativeModuleManager":9,"es6-promise/auto":13}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SetupHelper_1 = require("./SetupHelper");
SetupHelper_1.SetupHelper.trySettingUpForBrowser();

},{"./SetupHelper":2}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Errors = /** @class */ (function () {
    function Errors() {
    }
    Errors.MESSAGE_AUTH_ERROR = "Method called before authorization, make sure platform is available and" +
        " authorization is complete before calling this";
    Errors.MESSAGE_PLATFORM_UNAVAILABLE = "Flipkart platform is unavailable, make sure your app is in Flipkart environment";
    Errors.MESSAGE_CLIENT_ID_ABSENT = "Null or empty client id, cannot proceed without it";
    return Errors;
}());
exports.Errors = Errors;

},{}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var FKPlatformError = /** @class */ (function (_super) {
    __extends(FKPlatformError, _super);
    function FKPlatformError(message) {
        return _super.call(this, message) || this;
    }
    return FKPlatformError;
}(Error));
exports.FKPlatformError = FKPlatformError;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NavigationModuleImpl_1 = require("../modules/NavigationModuleImpl");
var PermissionsModuleImpl_1 = require("../modules/PermissionsModuleImpl");
var MODULE_NAME;
(function (MODULE_NAME) {
    MODULE_NAME[MODULE_NAME["PERMISSION_MODULE"] = 0] = "PERMISSION_MODULE";
    MODULE_NAME[MODULE_NAME["NAVIGATION_MODULE"] = 1] = "NAVIGATION_MODULE";
})(MODULE_NAME || (MODULE_NAME = {}));
var ModuleManager = /** @class */ (function () {
    function ModuleManager() {
        this.moduleMap = {};
        this.addModule(MODULE_NAME.PERMISSION_MODULE, new PermissionsModuleImpl_1.PermissionsModuleImpl());
        this.addModule(MODULE_NAME.NAVIGATION_MODULE, new NavigationModuleImpl_1.NavigationModuleImpl());
    }
    ModuleManager.prototype.getNavigationModule = function () {
        return this.getModule(MODULE_NAME.NAVIGATION_MODULE);
    };
    ModuleManager.prototype.getPermissionsModule = function () {
        return this.getModule(MODULE_NAME.PERMISSION_MODULE);
    };
    ModuleManager.prototype.addModule = function (moduleName, nativeModule) {
        this.moduleMap[moduleName] = nativeModule;
    };
    ModuleManager.prototype.getModule = function (moduleName) {
        return this.moduleMap[moduleName];
    };
    return ModuleManager;
}());
exports.ModuleManager = ModuleManager;

},{"../modules/NavigationModuleImpl":11,"../modules/PermissionsModuleImpl":12}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WindowManager_1 = require("./WindowManager");
var tcs_instanceqm_1 = require("tcs-instanceqm");
var NativeModuleCallbackManager = /** @class */ (function () {
    function NativeModuleCallbackManager() {
        var _this = this;
        this.nativeModuleResolve = function (response) {
            var queuedTask = _this.callbackQueue[response.requestId];
            if (queuedTask) {
                delete _this.callbackQueue[response.requestId];
                queuedTask.trySetResult(response);
            }
        };
        this.nativeModuleReject = function (error) {
            var queuedTask = _this.callbackQueue[error.requestId];
            if (queuedTask) {
                delete _this.callbackQueue[error.requestId];
                queuedTask.trySetError(error);
            }
        };
    }
    NativeModuleCallbackManager.getInstance = function () {
        NativeModuleCallbackManager.checkInit();
        return NativeModuleCallbackManager.nativeModuleCallbackManagerInstance;
    };
    NativeModuleCallbackManager.checkInit = function () {
        if (!NativeModuleCallbackManager.nativeModuleCallbackManagerInstance) {
            NativeModuleCallbackManager.callbackId = 0;
            NativeModuleCallbackManager.nativeModuleCallbackManagerInstance = new NativeModuleCallbackManager();
            NativeModuleCallbackManager.nativeModuleCallbackManagerInstance.callbackQueue = {};
        }
        var windowObj = WindowManager_1.WindowManager.getWindow();
        if (windowObj) {
            if (!windowObj.FKExtension.nativeModuleResolve) {
                windowObj.FKExtension.nativeModuleResolve = NativeModuleCallbackManager.nativeModuleCallbackManagerInstance.nativeModuleResolve;
            }
            if (!windowObj.FKExtension.nativeModuleReject) {
                windowObj.FKExtension.nativeModuleReject = NativeModuleCallbackManager.nativeModuleCallbackManagerInstance.nativeModuleReject;
            }
        }
    };
    NativeModuleCallbackManager.prototype.executeOnBridge = function (moduleInvoker) {
        var tcs = new tcs_instanceqm_1.TaskCompletionSource();
        var newRequestId = this.getNewCallbackId();
        this.queueCallbackIfRequired(newRequestId, tcs);
        moduleInvoker(newRequestId);
        return new Promise(function (resolve, reject) {
            tcs.getResultAsync().then(function (response) {
                resolve({
                    grantToken: response.grantToken,
                    result: response.result,
                });
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    NativeModuleCallbackManager.prototype.getNewCallbackId = function () {
        return NativeModuleCallbackManager.callbackId++ + "";
    };
    NativeModuleCallbackManager.prototype.queueCallbackIfRequired = function (requestId, task) {
        this.callbackQueue[requestId] = task;
    };
    return NativeModuleCallbackManager;
}());
exports.NativeModuleCallbackManager = NativeModuleCallbackManager;

},{"./WindowManager":8,"tcs-instanceqm":16}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WindowManager = /** @class */ (function () {
    function WindowManager() {
    }
    //Can return null e.g, when called in case runtime is React Native
    WindowManager.getWindow = function () {
        return window;
    };
    return WindowManager;
}());
exports.WindowManager = WindowManager;

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WindowManager_1 = require("../WindowManager");
//THIS ONE IS DUMMY, CAN BE REMOVED POST REACT NATIVE IMPLEMENTATION
var NativeModuleProviderImpl = /** @class */ (function () {
    function NativeModuleProviderImpl() {
    }
    return NativeModuleProviderImpl;
}());
exports.NativeModuleProviderImpl = NativeModuleProviderImpl;
//tslint-disable
var NativeModuleHelper = /** @class */ (function () {
    function NativeModuleHelper() {
    }
    NativeModuleHelper.getCurrentNativeModuleProvider = function () {
        var windowObj = WindowManager_1.WindowManager.getWindow();
        return windowObj ? windowObj : new NativeModuleProviderImpl();
    };
    return NativeModuleHelper;
}());
exports.NativeModuleHelper = NativeModuleHelper;
var NativeModule = /** @class */ (function () {
    function NativeModule(nativeModuleManager) {
        this.nativeModuleManager = nativeModuleManager;
    }
    return NativeModule;
}());
exports.NativeModule = NativeModule;

},{"../WindowManager":8}],10:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var NativeModuleManager_1 = require("../managers/modules/NativeModuleManager");
var AuthModuleImpl = /** @class */ (function (_super) {
    __extends(AuthModuleImpl, _super);
    function AuthModuleImpl() {
        return _super.call(this, NativeModuleManager_1.NativeModuleHelper.getCurrentNativeModuleProvider().AuthModule) || this;
    }
    AuthModuleImpl.prototype.init = function (clientId) {
        this.nativeModuleManager.init(clientId);
    };
    return AuthModuleImpl;
}(NativeModuleManager_1.NativeModule));
exports.AuthModuleImpl = AuthModuleImpl;

},{"../managers/modules/NativeModuleManager":9}],11:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var NativeModuleManager_1 = require("../managers/modules/NativeModuleManager");
var NavigationModuleImpl = /** @class */ (function (_super) {
    __extends(NavigationModuleImpl, _super);
    function NavigationModuleImpl() {
        return _super.call(this, NativeModuleManager_1.NativeModuleHelper.getCurrentNativeModuleProvider().NavigationModule) || this;
    }
    NavigationModuleImpl.prototype.exitSession = function () {
        this.nativeModuleManager.exitSession();
    };
    NavigationModuleImpl.prototype.exitToHomePage = function () {
        this.nativeModuleManager.exitToHomePage();
    };
    NavigationModuleImpl.prototype.startPayment = function (paymentToken) {
        this.nativeModuleManager.startPayment(paymentToken);
    };
    return NavigationModuleImpl;
}(NativeModuleManager_1.NativeModule));
exports.NavigationModuleImpl = NavigationModuleImpl;

},{"../managers/modules/NativeModuleManager":9}],12:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var NativeModuleManager_1 = require("../managers/modules/NativeModuleManager");
var NativeModuleCallbackManager_1 = require("../managers/NativeModuleCallbackManager");
var PermissionTypes;
(function (PermissionTypes) {
    PermissionTypes["READ_EMAIL"] = "READ_EMAIL";
    PermissionTypes["READ_PHONE_NUMBER"] = "READ_PHONE_NUMBER";
    PermissionTypes["READ_ADDRESSES"] = "READ_PHONE_NUMBER";
    PermissionTypes["PROFILE"] = "PROFILE";
})(PermissionTypes = exports.PermissionTypes || (exports.PermissionTypes = {}));
var PermissionsModuleImpl = /** @class */ (function (_super) {
    __extends(PermissionsModuleImpl, _super);
    function PermissionsModuleImpl() {
        return _super.call(this, NativeModuleManager_1.NativeModuleHelper.getCurrentNativeModuleProvider().PermissionsModule) || this;
    }
    PermissionsModuleImpl.prototype.getToken = function (permissions) {
        var _this = this;
        return NativeModuleCallbackManager_1.NativeModuleCallbackManager.getInstance().executeOnBridge(function (requestId) {
            _this.nativeModuleManager.getToken(requestId, permissions);
        });
    };
    return PermissionsModuleImpl;
}(NativeModuleManager_1.NativeModule));
exports.PermissionsModuleImpl = PermissionsModuleImpl;

},{"../managers/NativeModuleCallbackManager":7,"../managers/modules/NativeModuleManager":9}],13:[function(require,module,exports){
// This file can be required in Browserify and Node.js for automatic polyfill
// To use it:  require('es6-promise/auto');
'use strict';
module.exports = require('./').polyfill();

},{"./":14}],14:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   4.1.1
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}

var _isArray = undefined;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = undefined;
var customSchedulerFn = undefined;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var r = require;
    var vertx = r('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = undefined;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var _arguments = arguments;

  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;

  if (_state) {
    (function () {
      var callback = _arguments[_state - 1];
      asap(function () {
        return invokeCallback(_state, child, callback, parent._result);
      });
    })();
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(16);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var GET_THEN_ERROR = new ErrorObject();

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    GET_THEN_ERROR.error = error;
    return GET_THEN_ERROR;
  }
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === GET_THEN_ERROR) {
      reject(promise, GET_THEN_ERROR.error);
      GET_THEN_ERROR.error = null;
    } else if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;

  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = undefined,
      callback = undefined,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function ErrorObject() {
  this.error = null;
}

var TRY_CATCH_ERROR = new ErrorObject();

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = undefined,
      error = undefined,
      succeeded = undefined,
      failed = undefined;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value.error = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
      resolve(promise, value);
    } else if (failed) {
      reject(promise, error);
    } else if (settled === FULFILLED) {
      fulfill(promise, value);
    } else if (settled === REJECTED) {
      reject(promise, value);
    }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function Enumerator$1(Constructor, input) {
  this._instanceConstructor = Constructor;
  this.promise = new Constructor(noop);

  if (!this.promise[PROMISE_ID]) {
    makePromise(this.promise);
  }

  if (isArray(input)) {
    this.length = input.length;
    this._remaining = input.length;

    this._result = new Array(this.length);

    if (this.length === 0) {
      fulfill(this.promise, this._result);
    } else {
      this.length = this.length || 0;
      this._enumerate(input);
      if (this._remaining === 0) {
        fulfill(this.promise, this._result);
      }
    }
  } else {
    reject(this.promise, validationError());
  }
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

Enumerator$1.prototype._enumerate = function (input) {
  for (var i = 0; this._state === PENDING && i < input.length; i++) {
    this._eachEntry(input[i], i);
  }
};

Enumerator$1.prototype._eachEntry = function (entry, i) {
  var c = this._instanceConstructor;
  var resolve$$1 = c.resolve;

  if (resolve$$1 === resolve$1) {
    var _then = getThen(entry);

    if (_then === then && entry._state !== PENDING) {
      this._settledAt(entry._state, i, entry._result);
    } else if (typeof _then !== 'function') {
      this._remaining--;
      this._result[i] = entry;
    } else if (c === Promise$2) {
      var promise = new c(noop);
      handleMaybeThenable(promise, entry, _then);
      this._willSettleAt(promise, i);
    } else {
      this._willSettleAt(new c(function (resolve$$1) {
        return resolve$$1(entry);
      }), i);
    }
  } else {
    this._willSettleAt(resolve$$1(entry), i);
  }
};

Enumerator$1.prototype._settledAt = function (state, i, value) {
  var promise = this.promise;

  if (promise._state === PENDING) {
    this._remaining--;

    if (state === REJECTED) {
      reject(promise, value);
    } else {
      this._result[i] = value;
    }
  }

  if (this._remaining === 0) {
    fulfill(promise, this._result);
  }
};

Enumerator$1.prototype._willSettleAt = function (promise, i) {
  var enumerator = this;

  subscribe(promise, undefined, function (value) {
    return enumerator._settledAt(FULFILLED, i, value);
  }, function (reason) {
    return enumerator._settledAt(REJECTED, i, reason);
  });
};

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all$1(entries) {
  return new Enumerator$1(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race$1(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {function} resolver
  Useful for tooling.
  @constructor
*/
function Promise$2(resolver) {
  this[PROMISE_ID] = nextId();
  this._result = this._state = undefined;
  this._subscribers = [];

  if (noop !== resolver) {
    typeof resolver !== 'function' && needsResolver();
    this instanceof Promise$2 ? initializePromise(this, resolver) : needsNew();
  }
}

Promise$2.all = all$1;
Promise$2.race = race$1;
Promise$2.resolve = resolve$1;
Promise$2.reject = reject$1;
Promise$2._setScheduler = setScheduler;
Promise$2._setAsap = setAsap;
Promise$2._asap = asap;

Promise$2.prototype = {
  constructor: Promise$2,

  /**
    The primary way of interacting with a promise is through its `then` method,
    which registers callbacks to receive either a promise's eventual value or the
    reason why the promise cannot be fulfilled.
  
    ```js
    findUser().then(function(user){
      // user is available
    }, function(reason){
      // user is unavailable, and you are given the reason why
    });
    ```
  
    Chaining
    --------
  
    The return value of `then` is itself a promise.  This second, 'downstream'
    promise is resolved with the return value of the first promise's fulfillment
    or rejection handler, or rejected if the handler throws an exception.
  
    ```js
    findUser().then(function (user) {
      return user.name;
    }, function (reason) {
      return 'default name';
    }).then(function (userName) {
      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
      // will be `'default name'`
    });
  
    findUser().then(function (user) {
      throw new Error('Found user, but still unhappy');
    }, function (reason) {
      throw new Error('`findUser` rejected and we're unhappy');
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
    });
    ```
    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
  
    ```js
    findUser().then(function (user) {
      throw new PedagogicalException('Upstream error');
    }).then(function (value) {
      // never reached
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // The `PedgagocialException` is propagated all the way down to here
    });
    ```
  
    Assimilation
    ------------
  
    Sometimes the value you want to propagate to a downstream promise can only be
    retrieved asynchronously. This can be achieved by returning a promise in the
    fulfillment or rejection handler. The downstream promise will then be pending
    until the returned promise is settled. This is called *assimilation*.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // The user's comments are now available
    });
    ```
  
    If the assimliated promise rejects, then the downstream promise will also reject.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // If `findCommentsByAuthor` fulfills, we'll have the value here
    }, function (reason) {
      // If `findCommentsByAuthor` rejects, we'll have the reason here
    });
    ```
  
    Simple Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let result;
  
    try {
      result = findResult();
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
    findResult(function(result, err){
      if (err) {
        // failure
      } else {
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findResult().then(function(result){
      // success
    }, function(reason){
      // failure
    });
    ```
  
    Advanced Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let author, books;
  
    try {
      author = findAuthor();
      books  = findBooksByAuthor(author);
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
  
    function foundBooks(books) {
  
    }
  
    function failure(reason) {
  
    }
  
    findAuthor(function(author, err){
      if (err) {
        failure(err);
        // failure
      } else {
        try {
          findBoooksByAuthor(author, function(books, err) {
            if (err) {
              failure(err);
            } else {
              try {
                foundBooks(books);
              } catch(reason) {
                failure(reason);
              }
            }
          });
        } catch(error) {
          failure(err);
        }
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findAuthor().
      then(findBooksByAuthor).
      then(function(books){
        // found books
    }).catch(function(reason){
      // something went wrong
    });
    ```
  
    @method then
    @param {Function} onFulfilled
    @param {Function} onRejected
    Useful for tooling.
    @return {Promise}
  */
  then: then,

  /**
    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
    as the catch block of a try/catch statement.
  
    ```js
    function findAuthor(){
      throw new Error('couldn't find that author');
    }
  
    // synchronous
    try {
      findAuthor();
    } catch(reason) {
      // something went wrong
    }
  
    // async with promises
    findAuthor().catch(function(reason){
      // something went wrong
    });
    ```
  
    @method catch
    @param {Function} onRejection
    Useful for tooling.
    @return {Promise}
  */
  'catch': function _catch(onRejection) {
    return this.then(null, onRejection);
  }
};

/*global self*/
function polyfill$1() {
    var local = undefined;

    if (typeof global !== 'undefined') {
        local = global;
    } else if (typeof self !== 'undefined') {
        local = self;
    } else {
        try {
            local = Function('return this')();
        } catch (e) {
            throw new Error('polyfill failed because global object is unavailable in this environment');
        }
    }

    var P = local.Promise;

    if (P) {
        var promiseToString = null;
        try {
            promiseToString = Object.prototype.toString.call(P.resolve());
        } catch (e) {
            // silently ignored
        }

        if (promiseToString === '[object Promise]' && !P.cast) {
            return;
        }
    }

    local.Promise = Promise$2;
}

// Strange compat..
Promise$2.polyfill = polyfill$1;
Promise$2.Promise = Promise$2;

return Promise$2;

})));



}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":19}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TaskCompletionSource_1 = require("./tasks/TaskCompletionSource");
var InstanceQM = /** @class */ (function () {
    function InstanceQM(instanceCount, initialInstances) {
        this.clientStack = [];
        this.requestQueue = [];
        if (!initialInstances || initialInstances.length !== instanceCount) {
            throw { message: "No of instances passes should be equal to instanceCount" };
        }
        for (var i = 0; i < instanceCount; i++) {
            this.clientStack.push(initialInstances[i]);
        }
    }
    InstanceQM.prototype.getQueueSize = function () {
        return this.requestQueue.length;
    };
    InstanceQM.prototype.releaseInstance = function (instance) {
        if (this.requestQueue.length > 0) {
            this.requestQueue.shift().trySetResult(instance);
        }
        else {
            this.clientStack.push(instance);
        }
    };
    InstanceQM.prototype.getFreeInstanceAsync = function () {
        var tcs = new TaskCompletionSource_1.TaskCompletionSource();
        this.requestQueue.push(tcs);
        this._processQueue();
        return tcs.getResultAsync();
    };
    InstanceQM.prototype._processQueue = function () {
        if (this.clientStack.length > 0) {
            this.requestQueue.shift().trySetResult(this.clientStack.shift());
        }
    };
    return InstanceQM;
}());
exports.default = InstanceQM;

},{"./tasks/TaskCompletionSource":18}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TaskCompletionSource_1 = require("./tasks/TaskCompletionSource");
exports.TaskCompletionSource = TaskCompletionSource_1.TaskCompletionSource;
var InstanceQM_1 = require("./InstanceQM");
exports.InstanceQM = InstanceQM_1.default;

},{"./InstanceQM":15,"./tasks/TaskCompletionSource":18}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Task = /** @class */ (function () {
    function Task() {
        var _this = this;
        this.promise = new Promise(function (resolve, reject) {
            _this.resolveMethod = resolve;
            _this.rejectMethod = reject;
        });
    }
    Task.Yield = function () {
        return new Promise(function (resolve) {
            setTimeout(resolve, 0);
        });
    };
    Task.Delay = function (milliseconds) {
        return new Promise(function (resolve) {
            setTimeout(resolve, milliseconds);
        });
    };
    Task.prototype.resolve = function (value) {
        this.resolveMethod(value);
    };
    Task.prototype.reject = function (error) {
        this.rejectMethod(error);
    };
    Task.prototype.getResultAsync = function () {
        return this.promise;
    };
    return Task;
}());
exports.Task = Task;

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Task_1 = require("./Task");
var TaskCompletionSource = /** @class */ (function () {
    function TaskCompletionSource() {
        this.task = new Task_1.Task();
        this.isResultSet = false;
    }
    TaskCompletionSource.prototype.cancel = function (error) {
        this.trySetError(error);
    };
    TaskCompletionSource.prototype.setResult = function (result) {
        if (this.isResultSet) {
            throw new Error("result/error has been set before");
        }
        else {
            this.isResultSet = true;
            this.task.resolve(result);
        }
    };
    TaskCompletionSource.prototype.getResultAsync = function () {
        return this.task.getResultAsync();
    };
    TaskCompletionSource.prototype.trySetResult = function (result) {
        if (!this.isResultSet) {
            this.setResult(result);
        }
    };
    TaskCompletionSource.prototype.setError = function (error) {
        if (this.isResultSet) {
            throw new Error("result/error has been set before");
        }
        else {
            this.isResultSet = true;
            this.task.reject(error);
        }
    };
    TaskCompletionSource.prototype.trySetError = function (error) {
        if (!this.isResultSet) {
            this.setError(error);
        }
    };
    return TaskCompletionSource;
}());
exports.TaskCompletionSource = TaskCompletionSource;

},{"./Task":17}],19:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[3]);
