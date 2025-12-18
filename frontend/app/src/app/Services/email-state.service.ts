// ============================================
// src/app/services/email-state.service.ts
// NEW SERVICE to manage shared state
// ============================================
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EmailSearchCriteria } from './email-search.service';

export interface EmailListState {
  isSearching: boolean;
  sortByPriority: boolean;
  searchTerm: string;
  filters: EmailSearchCriteria;
  currentPage: number;
  folderId: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailStateService {
  private defaultState: EmailListState = {
    isSearching: false,
    sortByPriority: false,
    searchTerm: '',
    filters: {
      searchKeyword: '',
      from: '',
      to: '',
      subject: '',
      body: '',
      startDate: '',
      endDate: '',
      priority: undefined,
      hasAttachments: undefined,
      isRead: undefined,
      isImportant: undefined,
      page: 0,
      size: 20,
      sortBy: 'sentDate',
      sortDirection: 'desc'
    },
    currentPage: 0,
    folderId: ''
  };

  private stateSubject = new BehaviorSubject<EmailListState>(this.defaultState);
  public state$: Observable<EmailListState> = this.stateSubject.asObservable();

  constructor() {}

  // Update the entire state
  setState(state: EmailListState) {
    this.stateSubject.next(state);
  }

  // Get current state
  getState(): EmailListState {
    return this.stateSubject.value;
  }

  // Update specific properties
  updateState(partial: Partial<EmailListState>) {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partial });
  }

  // Reset to default state
  resetState() {
    this.stateSubject.next(this.defaultState);
  }

  // Check if there's an active search/filter
  hasActiveState(): boolean {
    const state = this.stateSubject.value;
    return state.isSearching || state.sortByPriority;
  }
}