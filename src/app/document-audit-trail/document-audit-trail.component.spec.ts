import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentAuditTrailComponent } from './document-audit-trail.component';

describe('DocumentAuditTrailComponent', () => {
  let component: DocumentAuditTrailComponent;
  let fixture: ComponentFixture<DocumentAuditTrailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentAuditTrailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentAuditTrailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
