import {Component, OnInit} from "@angular/core";
import {MessageService} from "./message.service";
import {MessageModel} from "./message.model";
import {NgForm} from "@angular/forms";

@Component({
    selector: 'app-message-input',
    templateUrl: './message-input.component.html'
})
export class MessageInputComponent implements OnInit {

    message: MessageModel;

    constructor(private messageService: MessageService) {}

    onSave(message: string) {
        const newMessage = new MessageModel(message, 'Clive');
        this.messageService.addMessage(newMessage);
    }

    onSubmit(form: NgForm) {
        // console.log(form.value.content);
        if (this.message) {
            // Edit
            this.message.content = form.value.content;
            this.messageService.updateMessage(this.message)
                .subscribe(console.log);
            this.message = null;
        } else {
            // Create
            const newMessage = new MessageModel(form.value.content, 'Clive');
            this.messageService.addMessage(newMessage)
                .subscribe(
                    data => console.log(data),
                    err => console.log(err)
                );
        }

        form.resetForm();
    }

    onClear(form: NgForm) {
        this.message = null;
        form.resetForm();
    }

    ngOnInit() {
        this.messageService.messageIsEdit.subscribe(
            (message: MessageModel) => this.message = message
        );
    }
}