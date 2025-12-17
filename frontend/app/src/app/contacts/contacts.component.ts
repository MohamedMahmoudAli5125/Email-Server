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
        filteredContacts: Contact[] = [];

    showAddForm = false;
    showEditForm = false;
    editingContact: Contact | null = null;

     searchTerm: string = '';
    sortBy: string = 'name';
    sortOrder: string = 'asc';
    showAdvancedSearch: boolean = false;

        advancedSearchForm!: FormGroup;
    nameSuggestions: string[] = [];
    emailSuggestions: string[] = [];

    // Form for adding/editing contacts
    contactForm!: FormGroup;
    userId: string | null = null; 
    errorMessage: string | null = null;
    isLoading: boolean = false;
     isSearching: boolean = false;
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
          this.advancedSearchForm = this.fb.group({
            name: [''],
            email: [''],
            sortBy: ['name'],
            order: ['asc']
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
          this.searchTerm = ''; // Clear search when reloading
  this.showAdvancedSearch = false; // Close advanced search
  this.setFormDisabledState(true);

        this.contactService.getUserContacts(this.userId).subscribe(
            contacts => {
                this.contacts = contacts;
                                this.filteredContacts = [...contacts];

                this.isLoading = false;
                      this.setFormDisabledState(false);

                this.cdr.detectChanges();
                console.log('Contacts loaded:', contacts);
            },
            error => {
                console.error('Error loading contacts:', error);
                this.errorMessage = 'Failed to load contacts. Please try again.';
                this.isLoading = false;
                      this.setFormDisabledState(false);

                this.cdr.detectChanges();
            }
        );
    }
  onSearch() {
        if (!this.userId) return;
        
        this.isSearching = true;
        
        this.contactService.searchContacts(
            this.userId, 
            this.searchTerm, 
            this.sortBy, 
            this.sortOrder
        ).subscribe(
            contacts => {
                this.filteredContacts = contacts;
                this.isSearching = false;
                this.cdr.detectChanges();
            },
            error => {
                console.error('Error searching contacts:', error);
                this.isSearching = false;
                this.cdr.detectChanges();
            }
        );
    }
    onSort() {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        this.onSearch();
    }

   toggleSort(field: string) {
        if (this.sortBy === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = field;
            this.sortOrder = 'asc';
        }
        this.onSearch();
    }

    // Advanced search
    toggleAdvancedSearch() {
        this.showAdvancedSearch = !this.showAdvancedSearch;
        if (this.showAdvancedSearch) {
            this.advancedSearchForm.reset({
                sortBy: 'name',
                order: 'asc'
            });
        }
    }

    onAdvancedSearch() {
        if (!this.userId) return;
 this.isSearching = true;
  // Disable forms while searching
  this.setFormDisabledState(true);

        const formValue = this.advancedSearchForm.value;
        const searchParams: any = {};

        if (formValue.name) searchParams.name = formValue.name;
        if (formValue.email) searchParams.email = formValue.email;
        if (formValue.sortBy) searchParams.sortBy = formValue.sortBy;
        if (formValue.order) searchParams.order = formValue.order;


        this.contactService.advancedSearch(this.userId, searchParams).subscribe(
            contacts => {
                this.filteredContacts = contacts;
                this.isSearching = false;
                this.showAdvancedSearch = false;
                this.setFormDisabledState(false);
                this.cdr.detectChanges();
            },
            error => {
                console.error('Error in advanced search:', error);
                this.isSearching = false;
                this.setFormDisabledState(false);
                this.cdr.detectChanges();
            }
        );
    }
   onNameInput(event: any) {
        const prefix = event.target.value;
        if (prefix.length >= 2 && this.userId) {
            this.contactService.getContactNames(this.userId, prefix).subscribe(
                names => {
                    this.nameSuggestions = names;
                    this.cdr.detectChanges();
                }
            );
        } else {
            this.nameSuggestions = [];
        }
    }

    onEmailInput(event: any) {
        const prefix = event.target.value;
        if (prefix.length >= 2 && this.userId) {
            this.contactService.getContactEmails(this.userId, prefix).subscribe(
                emails => {
                    this.emailSuggestions = emails;
                    this.cdr.detectChanges();
                }
            );
        } else {
            this.emailSuggestions = [];
        }
    }

    selectSuggestion(suggestion: string, field: string) {
        this.advancedSearchForm.patchValue({ [field]: suggestion });
        if (field === 'name') {
            this.nameSuggestions = [];
        } else {
            this.emailSuggestions = [];
        }
    }

    // Apply search and sort locally (optional fallback)
    applySearchAndSort() {
        let result = [...this.contacts];

        // Apply search
        if (this.searchTerm) {
            const searchTerm = this.searchTerm.toLowerCase();
            result = result.filter(contact =>
                contact.name.toLowerCase().includes(searchTerm) ||
                contact.emailAddresses.some(email =>
                    email.toLowerCase().includes(searchTerm)
                )
            );
        }

        // Apply sort
        result.sort((a, b) => {
            let comparison = 0;
            
            switch (this.sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'emailCount':
                    comparison = a.emailAddresses.length - b.emailAddresses.length;
                    break;
            }
            
            return this.sortOrder === 'asc' ? comparison : -comparison;
        });

        this.filteredContacts = result;
    }

    // Clear search
    clearSearch() {
        this.searchTerm = '';
        this.sortBy = 'name';
        this.sortOrder = 'asc';
        this.filteredContacts = [...this.contacts];
        this.showAdvancedSearch = false;
    }
    setFormDisabledState(isDisabled: boolean) {
  if (isDisabled) {
    this.contactForm.disable();
    this.advancedSearchForm?.disable();
  } else {
    this.contactForm.enable();
    this.advancedSearchForm?.enable();
  }
}
    showAddContactForm() {
        this.showAddForm = true;
        this.showEditForm = false;
        this.contactForm.reset();
        this.emailFormArray.clear();
        this.addEmailField();
        this.errorMessage = null;
  this.setFormDisabledState(false);

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
        this.setFormDisabledState(false);
    }

    onSubmit() {
        if (this.contactForm.invalid || !this.userId || this.isLoading) {
            this.markFormGroupTouched(this.contactForm);
            return;
        }
        this.isLoading = true;
        this.setFormDisabledState(true);
        const formData = this.contactForm.value;
        const emails = formData.emailAddresses.map((emailObj: any) => emailObj.email.trim());
        const duplicateEmails = this.findDuplicateEmails(emails);
        if (duplicateEmails.length > 0) {
            this.errorMessage = `Duplicate emails found: ${duplicateEmails.join(', ')}`;
            this.isLoading = false;
            this.setFormDisabledState(false);
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
        this.filteredContacts = [...this.filteredContacts, newContact];

                    this.cancelForm();
                    this.isLoading = false;
                    this.setFormDisabledState(false);
                    console.log('Contact created:', newContact);
                    this.isLoading = false;
                    this.cdr.detectChanges();
                },
                error => {
                    console.error('Error creating contact:', error);
                    this.errorMessage = this.errorMessage || 'Failed to create contact. Please try again.';
                    this.isLoading = false;
                    this.setFormDisabledState(false);
                    this.cdr.detectChanges();
                }
            );
        } else if (this.showEditForm && this.editingContact) {

            // Update existing contact
            contactData.id = this.editingContact.id;
            this.contactService.updateContact(this.editingContact.id!, contactData).subscribe(
                updatedContact => {
                    const index = this.contacts.findIndex(c => c.id === updatedContact.id);
                    if (index !== -1) {
                        const updatedContacts = [...this.contacts];
  updatedContacts[index] = updatedContact;
          this.contacts = updatedContacts;
          this.filteredContacts = updatedContacts;
                    }
                    this.cancelForm();
                    this.isLoading = false;
                    this.setFormDisabledState(false);
                    this.cdr.detectChanges();
                },
                error => {
                    console.error('Error updating contact:', error);
                    this.errorMessage = error.message || 'Failed to update contact. Please try again.';
                    this.isLoading = false;
                    this.setFormDisabledState(false);
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
                this.filteredContacts = this.filteredContacts.filter(c => c.id !== contactId);
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
        this.setFormDisabledState(false);
         if (this.userId) {
    this.loadContacts();
  }
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