// import { EmailPriority } from "./enums";

// // export interface Email{
// //     from:string;

// //     to:string[];
// //     cc:string[];
// //     bcc:string[];

// //     subject:string;
// //     body:string;

// //     priority:EmailPriority;

// //     attachmentFiles: File[];

// // }
// export interface Email {
//   id?: string;
//   fromEmail: string;
//   to: string[];
//   cc: string[];
//   bcc: string[];
//   subject: string;
//   body: string;
//   priority: EmailPriority;
//   attachmentFiles?: File[];
// //   attachments?: Attachment[];

//   date?: Date;
//   read?: boolean;
//   archived?: boolean;
// }
// export interface Attachment {
//   id: string;
//   fileName: string;
//   fileType: string;
//   filePath: string;
//   fileSize: number;
// }
import { EmailPriority } from "./enums";

export interface Email {
  id: string;
  fromEmail: string;
  to: string[];
  toList: string[]; // Backend uses toList
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  priority: EmailPriority;
  attachmentFiles?: File[];
  attachments?: Attachment[];
 
  sentDate: string; // Backend uses sentDate
  isRead: boolean;
  archived: boolean;
   isImportant:boolean;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
}