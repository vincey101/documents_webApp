import { Injectable } from '@angular/core';
import {
    Resolve,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';
import { AIPromptTemplate } from '@core/domain-classes/ai-prompt-template';
import { Observable, of } from 'rxjs';
import { AIPromptTemplateService } from '../template-open-ai.service';

@Injectable({ providedIn: 'root' })
export class TemplateOpenAiResolverService implements Resolve<AIPromptTemplate> {
    constructor(private aIPromptTemplateService: AIPromptTemplateService) { }
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<AIPromptTemplate> {
        const id = route.paramMap.get('id');
        if (id == 'new') {
            return of(null);
        }
        return this.aIPromptTemplateService.getAIPromptTemplate(id as string) as Observable<AIPromptTemplate>;
    }
}
