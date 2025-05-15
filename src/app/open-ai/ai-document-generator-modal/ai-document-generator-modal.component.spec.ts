import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiDocumentGeneratorModalComponent } from './ai-document-generator-modal.component';

describe('AiDocumentGeneratorModalComponent', () => {
  let component: AiDocumentGeneratorModalComponent;
  let fixture: ComponentFixture<AiDocumentGeneratorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiDocumentGeneratorModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiDocumentGeneratorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
