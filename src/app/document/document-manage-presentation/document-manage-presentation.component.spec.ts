import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentManagePresentationComponent } from './document-manage-presentation.component';

describe('DocumentManagePresentationComponent', () => {
  let component: DocumentManagePresentationComponent;
  let fixture: ComponentFixture<DocumentManagePresentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentManagePresentationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentManagePresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
