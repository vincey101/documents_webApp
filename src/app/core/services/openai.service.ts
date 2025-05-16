import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OpenAIService {
  private apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent';
  private apiKey = ''; //Gemini Api key

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    console.error('Full error object:', error);
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error?.error?.message) {
        errorMessage = `Gemini API Error: ${error.error.error.message}`;
      } else if (error.error?.message) {
        errorMessage = `API Error: ${error.error.message}`;
      } else if (typeof error.error === 'string') {
        try {
          const parsedError = JSON.parse(error.error);
          errorMessage = `Gemini API Error: ${parsedError.error?.message || JSON.stringify(parsedError)}`;
        } catch (e) {
          errorMessage = `Error: ${error.error}`;
        }
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }
    
    console.error('Error details:', {
      status: error.status,
      statusText: error.statusText,
      message: errorMessage,
      error: error.error
    });
    
    return throwError(() => new Error(errorMessage));
  }

  generateContent(prompt: string): Observable<any> {
    if (!prompt || prompt.trim().length === 0) {
      return throwError(() => new Error('Prompt cannot be empty'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('x-goog-api-key', this.apiKey);

    const body = {
      contents: [{
        parts: [{
          text: prompt.trim()
        }]
      }],
      generationConfig: {
        maxOutputTokens: 600,
        temperature: 0.5
      }
    };

    console.log('Making request to Gemini API with:', {
      url: this.apiUrl,
      body: body
    });

    return this.http.post<any>(this.apiUrl, body, { 
      headers: headers,
      withCredentials: false
    }).pipe(
      map(response => {
        console.log('Raw Gemini API response:', response);
        
        if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error('Invalid response format from Gemini API');
        }
        
        const content = response.candidates[0].content.parts[0].text;
        console.log('Successfully processed response:', { content });
        
        return { content };
      }),
      catchError(this.handleError)
    );
  }
}