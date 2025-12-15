// export interface Contact{
//     name:string;
//     emailAdresses:string[];
// }
// src/app/models/contact.ts
export interface Contact {
  id?: string;
  name: string;
  emailAddresses: string[];
  userId?: string;
}