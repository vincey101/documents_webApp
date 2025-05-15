import { TestBed } from '@angular/core/testing';

import { ArchiveDocumentService } from './archive-document.service';

describe('ArchiveDocumentService', () => {
  let service: ArchiveDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArchiveDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
