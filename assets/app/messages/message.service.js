"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var message_model_1 = require("./message.model");
var http_1 = require("@angular/common/http");
var core_1 = require("@angular/core");
require("rxjs/add/operator/map");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/catch");
var MessageService = /** @class */ (function () {
    function MessageService(http) {
        this.http = http;
        this.messages = [];
        this.messageIsEdit = new core_1.EventEmitter();
    }
    MessageService.prototype.addMessage = function (message) {
        var _this = this;
        // this.messages.push(message);
        // console.log(this.messages);
        var body = JSON.stringify(message);
        var headers = new http_1.HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.post('http://localhost:3000/message', body, { headers: headers })
            .map(function (response) {
            var result = response;
            var message = new message_model_1.MessageModel(result['obj'].content, 'Dummy', result['obj']._id, null);
            _this.messages.push(message);
        })
            .catch(function (error) { return Observable_1.Observable.throw(error); });
    };
    MessageService.prototype.getMessage = function () {
        var _this = this;
        return this.http.get('http://localhost:3000/message')
            .map(function (response) {
            var messages = response['obj'];
            var frontEndMessages = Object.keys(messages).map(function (key) {
                var content = messages[key].content;
                var id = messages[key]._id;
                return new message_model_1.MessageModel(content, 'Dummy', null, id);
            });
            _this.messages = frontEndMessages;
            return frontEndMessages;
        });
    };
    MessageService.prototype.editMessage = function (message) {
        this.messageIsEdit.emit(message);
    };
    MessageService.prototype.deleteMessage = function (message) {
        this.messages.splice(this.messages.indexOf(message), 1);
        return this.http
            .delete('http://localhost:3000/message/' + message.messageId);
    };
    MessageService.prototype.updateMessage = function (message) {
        var body = JSON.stringify(message);
        var headers = new http_1.HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.patch('http://localhost:3000/message/' + message.messageId, body, { headers: headers });
    };
    MessageService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.HttpClient])
    ], MessageService);
    return MessageService;
}());
exports.MessageService = MessageService;
