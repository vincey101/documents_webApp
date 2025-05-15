import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentLibraryListComponent } from './document-library-list.component';

describe('DocumentLibraryListComponent', () => {
  let component: DocumentLibraryListComponent;
  let fixture: ComponentFixture<DocumentLibraryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentLibraryListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentLibraryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
