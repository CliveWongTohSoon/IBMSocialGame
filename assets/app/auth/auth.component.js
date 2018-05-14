"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var AuthComponent = /** @class */ (function () {
    function AuthComponent() {
    }
    AuthComponent = __decorate([
        core_1.Component({
            selector: 'app-auth',
            template: "\n    <header class=\"row spacing\">\n        <nav class=\"col-md-8 col-md-offset-2\">\n            <ul class=\"nav nav-tabs\">\n                <li routerLinkActive=\"active\"><a [routerLink]=\"['signup']\">Sign Up</a></li>\n                <li routerLinkActive=\"active\"><a [routerLink]=\"['signin']\">Sign In</a></li>\n                <li routerLinkActive=\"active\"><a [routerLink]=\"['logout']\">Logout</a></li>\n            </ul>\n        </nav>\n    </header>\n    <div class=\"row spacing\">\n        <router-outlet></router-outlet>\n    </div>    \n    "
        })
    ], AuthComponent);
    return AuthComponent;
}());
exports.AuthComponent = AuthComponent;
