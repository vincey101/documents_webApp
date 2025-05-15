import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentUploadNewVersionComponent } from './document-upload-new-version.component';

describe('DocumentUploadNewVersionComponent', () => {
  let component: DocumentUploadNewVersionComponent;
  let fixture: ComponentFixture<DocumentUploadNewVersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentUploadNewVersionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentUploadNewVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
