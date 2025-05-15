import { DataSource } from '@angular/cdk/table';
import { HttpResponse } from '@angular/common/http';
import { ResponseHeader } from '@core/domain-classes/response-header';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AIPromptTemplateService } from '../template-open-ai.service';
import { OpenAiDocuments } from '@core/domain-classes/open-ai-documents';
import { OpenAiDocumentResource } from '@core/domain-classes/open-ai-document-resource';

export class OpenAiDocumentDataSource implements DataSource<OpenAiDocuments> {
    private openAiDocumentSubject = new BehaviorSubject<OpenAiDocuments[]>([]);
    private responseHeaderSubject = new BehaviorSubject<ResponseHeader>(null);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();
    private _count: number = 0;

    public get count(): number {
        return this._count;
    }

    public responseHeaderSubject$ = this.responseHeaderSubject.asObservable();

    constructor(private aIPromptTemplateService: AIPromptTemplateService) { }

    connect(): Observable<OpenAiDocuments[]> {
        return this.openAiDocumentSubject.asObservable();
    }

    disconnect(): void {
        this.openAiDocumentSubject.complete();
        this.loadingSubject.complete();
    }

    loadOpenAiDocuments(openAiDocumentResource: OpenAiDocumentResource) {
        this.loadingSubject.next(true);
        this.aIPromptTemplateService.getOpenAiDocuments(openAiDocumentResource).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )
            .subscribe((resp: HttpResponse<OpenAiDocuments[]>) => {
                const paginationParam = new ResponseHeader();
                paginationParam.pageSize = parseInt(resp.headers.get('pageSize'));
                paginationParam.totalCount = parseInt(resp.headers.get('totalCount'));
                paginationParam.skip = parseInt(resp.headers.get('skip'));
                this.responseHeaderSubject.next(paginationParam);
                const openAiDocuments = [...resp.body];
                this._count = openAiDocuments.length;
                this.openAiDocumentSubject.next(openAiDocuments);
            });
    }

}
