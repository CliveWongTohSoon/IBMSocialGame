"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./polyfills");
var platform_browser_1 = require("@angular/platform-browser");
var core_1 = require("@angular/core");
var app_module_ngfactory_1 = require("./app.module.ngfactory");
core_1.enableProdMode();
platform_browser_1.platformBrowser().bootstrapModuleFactory(app_module_ngfactory_1.AppModuleNgFactory);
