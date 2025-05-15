import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivedDocumentListComponent } from './archived-document-list.component';

describe('ArchivedDocumentListComponent', () => {
  let component: ArchivedDocumentListComponent;
  let fixture: ComponentFixture<ArchivedDocumentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArchivedDocumentListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchivedDocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
