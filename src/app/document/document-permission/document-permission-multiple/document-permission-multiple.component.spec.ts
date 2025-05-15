import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentPermissionMultipleComponent } from './document-permission-multiple.component';

describe('DocumentPermissionMultipleComponent', () => {
  let component: DocumentPermissionMultipleComponent;
  let fixture: ComponentFixture<DocumentPermissionMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentPermissionMultipleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentPermissionMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
