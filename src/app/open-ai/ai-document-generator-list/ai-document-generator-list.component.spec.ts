import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiDocumentGeneratorListComponent } from './ai-document-generator-list.component';

describe('AiDocumentGeneratorListComponent', () => {
  let component: AiDocumentGeneratorListComponent;
  let fixture: ComponentFixture<AiDocumentGeneratorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiDocumentGeneratorListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiDocumentGeneratorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
