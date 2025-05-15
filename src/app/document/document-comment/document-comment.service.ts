import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentComment } from '@core/domain-classes/document-comment';

@Injectable({ providedIn: 'root' })
export class DocumentCommentService {
  constructor(private httpClient: HttpClient) {}

  getDocumentComment(documentId: string): Observable<DocumentComment[]> {
    const url = `documentComment/${documentId}`;
    return this.httpClient.get<DocumentComment[]>(url);
  }
  deleteDocumentComment(id: string): Observable<void> {
    const url = `documentComment/${id}`;
    return this.httpClient.delete<void>(url);
  }
  saveDocumentComment(
    documentComment: DocumentComment
  ): Observable<DocumentComment> {
    const url = 'documentComment';
    return this.httpClient.post<DocumentComment>(url, documentComment);
  }
}
