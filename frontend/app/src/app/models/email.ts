import { EmailPriority } from "./enums";

export interface Email{
    from:string;

    to:string[];
    cc:string[];
    bcc:string[];

    subject:string;
    body:string;

    priority:EmailPriority;

    attachmentFiles: File[];

}