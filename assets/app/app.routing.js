"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var messages_component_1 = require("./messages/messages.component");
var auth_component_1 = require("./auth/auth.component");
var auth_routes_1 = require("./auth/auth.routes");
var game_component_1 = require("./game/game.component");
var APP_ROUTES = [
    { path: 'game', component: game_component_1.GameComponent },
    { path: 'messages', component: messages_component_1.MessagesComponent },
    { path: 'auth', component: auth_component_1.AuthComponent, children: auth_routes_1.AUTH_ROUTES },
    { path: '', redirectTo: '/messages', pathMatch: 'full' }
];
exports.routing = router_1.RouterModule.forRoot(APP_ROUTES);
