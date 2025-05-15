import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { OpenAiDocuments } from "@core/domain-classes/open-ai-documents";
import { CommonError } from "@core/error-handler/common-error";
import { CommonHttpErrorService } from "@core/error-handler/common-http-error.service";
import { environment } from "@environments/environment";
import { catchError, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class OpenAIStreamService {
    constructor(private http: HttpClient,
        private commonHttpErrorService: CommonHttpErrorService
    ) { }

    streamDocument(prompt: string): Observable<string | CommonError> {
        return this.http.post('stream-document', { prompt }, {
            responseType: 'text',
            observe: 'body',
            reportProgress: true,
        }).pipe(catchError(this.commonHttpErrorService.handleError));
    }

    getOpenAiDocumentResponse(id: string): Observable<OpenAiDocuments | CommonError> {
        const url = `stream-document/${id}`;
        return this.http.get<OpenAiDocuments>(url)
            .pipe(catchError(this.commonHttpErrorService.handleError));
    }
}
