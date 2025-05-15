import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkDocumentUploadComponent } from './bulk-document-upload.component';

describe('BulkDocumentUploadComponent', () => {
  let component: BulkDocumentUploadComponent;
  let fixture: ComponentFixture<BulkDocumentUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkDocumentUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkDocumentUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
