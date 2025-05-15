import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiDocumentGeneratorComponent } from './ai-document-generator.component';

describe('AiDocumentGeneratorComponent', () => {
  let component: AiDocumentGeneratorComponent;
  let fixture: ComponentFixture<AiDocumentGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiDocumentGeneratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiDocumentGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
