import {Component, EventEmitter, Input, Output} from "@angular/core";
import {MessageModel} from "./message.model";
import {MessageService} from "./message.service";

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.css']
})
export class MessageComponent {
    @Input() message: MessageModel;

    color = 'white';

    constructor(private messageService: MessageService) {}

    onEdit() {
        this.messageService.editMessage(this.message);
    }

    onDelete() {
        this.messageService.deleteMessage(this.message)
            .subscribe(console.log);
    }
}