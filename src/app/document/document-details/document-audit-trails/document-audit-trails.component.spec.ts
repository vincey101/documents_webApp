import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentAuditTrailsComponent } from './document-audit-trails.component';

describe('DocumentAuditTrailsComponent', () => {
  let component: DocumentAuditTrailsComponent;
  let fixture: ComponentFixture<DocumentAuditTrailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentAuditTrailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentAuditTrailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
