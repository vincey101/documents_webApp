import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileRequestDocumentListComponent } from './file-request-document-list.component';

describe('FileRequestDocumentListComponent', () => {
  let component: FileRequestDocumentListComponent;
  let fixture: ComponentFixture<FileRequestDocumentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileRequestDocumentListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileRequestDocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
