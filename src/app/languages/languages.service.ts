import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguagesService {
  constructor(private httpClient: HttpClient) {}

  getDefaultLanguage(): Observable<any> {
    const url = 'defaultlanguage';
    return this.httpClient.get<any>(url);
  }

  getLanguageById(id: string): Observable<any> {
    const url = `languageById/${id}/`;
    return this.httpClient.get<any>(url);
  }

  getLanguages(): Observable<any[]> {
    const url = 'languages';
    return this.httpClient.get<any[]>(url);
  }

  saveLanguages(language: any): Observable<any> {
    const url = 'languages';
    return this.httpClient.post(url, language);
  }

  deleteLanguages(id: any): Observable<any> {
    const url = `languages/${id}`;
    return this.httpClient.delete(url);
  }
}
