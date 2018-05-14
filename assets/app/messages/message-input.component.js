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
var core_1 = require("@angular/core");
var message_service_1 = require("./message.service");
var message_model_1 = require("./message.model");
var MessageInputComponent = /** @class */ (function () {
    function MessageInputComponent(messageService) {
        this.messageService = messageService;
    }
    MessageInputComponent.prototype.onSave = function (message) {
        var newMessage = new message_model_1.MessageModel(message, 'Clive');
        this.messageService.addMessage(newMessage);
    };
    MessageInputComponent.prototype.onSubmit = function (form) {
        // console.log(form.value.content);
        if (this.message) {
            // Edit
            this.message.content = form.value.content;
            this.messageService.updateMessage(this.message)
                .subscribe(console.log);
            this.message = null;
        }
        else {
            // Create
            var newMessage = new message_model_1.MessageModel(form.value.content, 'Clive');
            this.messageService.addMessage(newMessage)
                .subscribe(function (data) { return console.log(data); }, function (err) { return console.log(err); });
        }
        form.resetForm();
    };
    MessageInputComponent.prototype.onClear = function (form) {
        this.message = null;
        form.resetForm();
    };
    MessageInputComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.messageService.messageIsEdit.subscribe(function (message) { return _this.message = message; });
    };
    MessageInputComponent = __decorate([
        core_1.Component({
            selector: 'app-message-input',
            templateUrl: './message-input.component.html'
        }),
        __metadata("design:paramtypes", [message_service_1.MessageService])
    ], MessageInputComponent);
    return MessageInputComponent;
}());
exports.MessageInputComponent = MessageInputComponent;
