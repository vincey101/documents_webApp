import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiDocumentGeneratorFormComponent } from './ai-document-generator-form.component';

describe('AiDocumentGeneratorFormComponent', () => {
  let component: AiDocumentGeneratorFormComponent;
  let fixture: ComponentFixture<AiDocumentGeneratorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiDocumentGeneratorFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiDocumentGeneratorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
