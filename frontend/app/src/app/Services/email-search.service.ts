
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { Email } from '../models/email';
import { EmailPriority } from '../models/enums';

export interface EmailSearchCriteria {
searchKeyword?: string;
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  startDate?: string; 
  endDate?: string;   
  priority?: EmailPriority;
  hasAttachments?: boolean;
  isRead?: boolean;
  isImportant?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface EmailFilterDTO{
    searchKeyword?: string;
    subject?: string;
    body?: string;
    from?: string;
    to?: string;
    priority?: EmailPriority;
    startDate?: string;
    endDate?: string;
    hasAttachments?: boolean;
    isRead?: boolean;
    isImportant?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
}
@Injectable({
  providedIn: 'root'
})
export class EmailSearchService {
    private apiUrl = 'http://localhost:8080/api/emails';

    constructor(private http: HttpClient) {}

     searchEmails(
    folderId: string,
    keyword: string,
    page: number = 0,
    size: number = 20,
    sortBy: string = 'sentDate',
    sortDirection: string = 'desc'
  ): Observable<Email[]> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<Email[]>(
      `${this.apiUrl}/folder/${folderId}/search-criteria`,
      { params }
    );
  }

  // filter emails with the cretira
  filterEmails(
    folderId: string,
    filterDTO: EmailFilterDTO
  ): Observable<Email[]> {
    return this.http.post<Email[]>(
      `${this.apiUrl}/folder/${folderId}/filter-criteria`,
      filterDTO
    );
  }

  // combine both of search and filtering 
  searchAndFilter(
    folderId: string, 
    filterDTO: EmailFilterDTO
  ): Observable<Email[]> {
    return this.http.post<Email[]>(
      `${this.apiUrl}/folder/${folderId}/search-filter-criteria`,
      filterDTO
    );
  }
      
  // convert dates to ISO 
  buildFilterDTO(criteria: EmailSearchCriteria): EmailFilterDTO {
    const filterDTO: EmailFilterDTO = {
      page: criteria.page || 0,
      size: criteria.size || 20,
      sortBy: criteria.sortBy || 'sentDate',
      sortDirection: criteria.sortDirection || 'desc'
    };

    if (criteria.searchKeyword){
        filterDTO.searchKeyword = criteria.searchKeyword;
    }

    if (criteria.searchKeyword) {
      filterDTO.searchKeyword = criteria.searchKeyword;
    }

    if (criteria.from) {
      filterDTO.from = criteria.from;
    }

    if (criteria.to) {
      filterDTO.to = criteria.to;
    }

    if (criteria.subject) {
      filterDTO.subject = criteria.subject;
    }

    if (criteria.body) {
      filterDTO.body = criteria.body;
    }

    if (criteria.startDate) {
      filterDTO.startDate = this.convertToISODateTime(criteria.startDate, true);
    }

    if (criteria.endDate) {
      filterDTO.endDate = this.convertToISODateTime(criteria.endDate, false);
    }

    if (criteria.priority) {
      filterDTO.priority = criteria.priority;
    }

    if (criteria.hasAttachments !== undefined) {
      filterDTO.hasAttachments = criteria.hasAttachments;
    }

    if (criteria.isRead !== undefined) {
      filterDTO.isRead = criteria.isRead;
    }

    if (criteria.isImportant !== undefined) {
      filterDTO.isImportant = criteria.isImportant;
    }

    return filterDTO;
  }


  private convertToISODateTime(dateStr: string, isStart: boolean): string {
    const date = new Date(dateStr);
    if(isStart){
        date.setHours(0, 0, 0, 0);
    }else{
        date.setHours(23, 59, 59, 999);
    }
    return date.toISOString();
  }
}