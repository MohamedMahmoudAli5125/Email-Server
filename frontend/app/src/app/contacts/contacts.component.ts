// src/app/contacts/contacts.component.ts
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactService } from '../Services/contact.service';
import { Contact } from '../models/contact';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
    selector: 'app-contacts',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './contacts.component.html',
    styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit,OnDestroy {
    contacts: Contact[] = [];
    showAddForm = false;
    showEditForm = false;
    editingContact: Contact | null = null;

    // Form for adding/editing contacts
    contactForm!: FormGroup;
    userId: string | null = null; // You'll need to get this from your auth service
    errorMessage: string | null = null;
    isLoading: boolean | undefined;
      private routeSub: Subscription | null = null;


    constructor(
        private contactService: ContactService,
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
            private route: ActivatedRoute


    ) {
        this.initForm();
    }

    ngOnInit() {
         this.routeSub = this.route.params.subscribe(() => {
      this.userId = this.authService.getUserId();
      if (this.userId) {
        this.loadContacts();
      } else {
        this.errorMessage = 'Please login to access contacts';
      }
    });
        // this.userId = this.authService.getUserId();
        // this.loadContacts();
    }
    ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

    initForm() {
        this.contactForm = this.fb.group({
            name: ['', [Validators.required]],
            emailAddresses: this.fb.array([this.createEmailField()], [Validators.required])
        });
    }
    get name() {
        return this.contactForm.get('name');
    }
    createEmailField(): FormGroup {
        return this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    get emailControls() {
        return (this.contactForm.get('emailAddresses') as FormArray).controls;
    }

    get emailFormArray(): FormArray {
        return this.contactForm.get('emailAddresses') as FormArray;
    }

    addEmailField() {
        this.emailFormArray.push(this.createEmailField());
    }

    removeEmailField(index: number) {
        if (this.emailFormArray.length > 1) {
            this.emailFormArray.removeAt(index);
        }
    }

    loadContacts() {
        if (!this.userId) {
            console.error('No userId found, cannot load contacts');
            this.errorMessage = 'User not found. Please login again.';

            return;
        }
        this.isLoading = true;
        this.errorMessage = null;

        this.contactService.getUserContacts(this.userId).subscribe(
            contacts => {
                this.contacts = contacts;
                this.isLoading = false;
                this.cdr.detectChanges();
                console.log('Contacts loaded:', contacts);
            },
            error => {
                console.error('Error loading contacts:', error);
                this.errorMessage = 'Failed to load contacts. Please try again.';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        );
    }

    showAddContactForm() {
        this.showAddForm = true;
        this.showEditForm = false;
        this.contactForm.reset();
        this.emailFormArray.clear();
        this.addEmailField();
        this.errorMessage = null;

    }

    showEditContactForm(contact: Contact) {
        this.editingContact = contact;
        this.showEditForm = true;
        this.showAddForm = false;
        this.errorMessage = null;


        this.contactForm.patchValue({
            name: contact.name
        });

        this.emailFormArray.clear();
        contact.emailAddresses.forEach(email => {
            this.emailFormArray.push(this.fb.group({
                email: [email, [Validators.required, Validators.email]]
            }));
        });
    }

    onSubmit() {
        if (this.contactForm.invalid || !this.userId) {
            this.markFormGroupTouched(this.contactForm);
            return;
        }
        const formData = this.contactForm.value;
        const emails = formData.emailAddresses.map((emailObj: any) => emailObj.email.trim());
        const duplicateEmails = this.findDuplicateEmails(emails);
        if (duplicateEmails.length > 0) {
            this.errorMessage = `Duplicate emails found: ${duplicateEmails.join(', ')}`;
            return;
        }
        const contactData: Contact = {
            name: formData.name.trim(),
            emailAddresses: emails
            // emailAddresses: formData.emailAddresses.map((emailObj: any) => emailObj.email.trim())
        };

        if (this.showAddForm) {
            // Create new contact
            this.isLoading = true;

            // if (!this.userId) {
            //   console.error('No userId found, cannot create contact');
            //   return;
            // }
            this.contactService.createContact(this.userId, contactData).subscribe(
                newContact => {
                    // this.contacts.push(newContact);
                    this.contacts = [...this.contacts, newContact];

                    this.cancelForm();
                    console.log('Contact created:', newContact);
                    this.isLoading = false;
                    this.cdr.detectChanges();
                },
                error => {
                    console.error('Error creating contact:', error);
                    this.errorMessage = this.errorMessage || 'Failed to create contact. Please try again.';
                    this.isLoading = false;
                    this.cdr.detectChanges();
                }
            );
        } else if (this.showEditForm && this.editingContact) {
            this.isLoading = true;

            // Update existing contact
            contactData.id = this.editingContact.id;
            this.contactService.updateContact(this.editingContact.id!, contactData).subscribe(
                updatedContact => {
                    const index = this.contacts.findIndex(c => c.id === updatedContact.id);
                    if (index !== -1) {
                        const updatedContacts = [...this.contacts];

                        this.contacts[index] = updatedContact;
                        this.contacts = updatedContacts;
                    }
                    this.cancelForm();
                    this.isLoading = false;
                    this.cdr.detectChanges();
                },
                error => {
                    console.error('Error updating contact:', error);
                    this.errorMessage = error.message || 'Failed to update contact. Please try again.';
                    this.isLoading = false;
                    this.cdr.detectChanges();
                }
            );
        }

    }
    private findDuplicateEmails(emails: string[]): string[] {
        const seen = new Set<string>();
        const duplicates = new Set<string>();

        for (const email of emails) {
            if (seen.has(email)) {
                duplicates.add(email);
            } else {
                seen.add(email);
            }
        }

        return Array.from(duplicates);
    }
      isDuplicateEmail(email: string, currentIndex: number): boolean {
    if (!email) return false;
    
    const emails = this.emailFormArray.controls
      .map((control, index) => {
        if (index === currentIndex) return null;
        return control.get('email')?.value?.trim();
      })
      .filter(email => email !== null) as string[];
    
    return emails.includes(email.trim());
  }
    checkEmailDuplicate(email: string, currentIndex: number) {
    if (!email || !this.userId) return;
    
    const trimmedEmail = email.trim();
    
    // First check for duplicates within the form
    if (this.isDuplicateEmail(trimmedEmail, currentIndex)) {
      // Error will be shown by the template binding
      return;
    }
    
    // For new contacts, check if email exists in other contacts
    if (this.showAddForm) {
      this.contactService.checkEmailInContacts(this.userId, trimmedEmail).subscribe({
        next: (response) => {
          if (response.existsInContacts && response.contact) {
            this.errorMessage = `Email "${trimmedEmail}" already exists in your contact "${response.contact.name}"`;
          } else if (this.errorMessage?.includes(trimmedEmail)) {
            // Clear error if it was about this email
            this.errorMessage = null;
          }
        },
        error: (error) => {
          console.error('Error checking email:', error);
        }
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
        // throw new Error('Method not implemented.');
         Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
    }

    deleteContact(contactId: string, event: Event) {
        event.stopPropagation();
        if (confirm('Are you sure you want to delete this contact?')) {
            this.contactService.deleteContact(contactId).subscribe(
                () => {
                    this.contacts = this.contacts.filter(c => c.id !== contactId);
                    this.cdr.detectChanges();
                    console.log('Change detection triggered after delete');
                },
                error => {
                    console.error('Error deleting contact:', error);
                    console.error('Error deleting contact:', error);
                    this.errorMessage = 'Failed to delete contact. Please try again.';
                    this.cdr.detectChanges();
                }
            );
        }
    }

    cancelForm() {
        this.showAddForm = false;
        this.showEditForm = false;
        this.editingContact = null;
        this.contactForm.reset();
        this.emailFormArray.clear();
        this.addEmailField();
        this.errorMessage = null;
    }
  navigateBack() {
    this.router.navigate(['/home']);
  }

  closeForm() {
    this.cancelForm();
  }

  // Add goBack method for the template
  goBack() {
    if (this.showAddForm || this.showEditForm) {
      this.closeForm();
    } else {
      this.navigateBack();
    }
  }

}