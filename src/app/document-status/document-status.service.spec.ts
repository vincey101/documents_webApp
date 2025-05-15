import { TestBed } from '@angular/core/testing';

import { DocumentStatusService } from './document-status.service';

describe('DocumentStatusService', () => {
  let service: DocumentStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
