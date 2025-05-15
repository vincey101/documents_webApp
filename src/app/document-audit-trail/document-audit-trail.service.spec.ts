import { TestBed } from '@angular/core/testing';

import { DocumentAuditTrailService } from './document-audit-trail.service';

describe('DocumentAuditTrailService', () => {
  let service: DocumentAuditTrailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentAuditTrailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
