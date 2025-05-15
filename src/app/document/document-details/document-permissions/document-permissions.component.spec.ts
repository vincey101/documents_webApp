import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentPermissionsComponent } from './document-permissions.component';

describe('DocumentPermissionsComponent', () => {
  let component: DocumentPermissionsComponent;
  let fixture: ComponentFixture<DocumentPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentPermissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
