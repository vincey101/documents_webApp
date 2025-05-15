import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDocumentStatusComponent } from './manage-document-status.component';

describe('ManageDocumentStatusComponent', () => {
  let component: ManageDocumentStatusComponent;
  let fixture: ComponentFixture<ManageDocumentStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageDocumentStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageDocumentStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
