import { TestBed } from '@angular/core/testing';

import { DocumentLibraryService } from './document-library.service';

describe('DocumentLibraryService', () => {
  let service: DocumentLibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentLibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
