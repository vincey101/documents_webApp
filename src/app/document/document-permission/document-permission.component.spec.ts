import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentPermissionComponent } from './document-permission.component';

describe('DocumentPermissionComponent', () => {
  let component: DocumentPermissionComponent;
  let fixture: ComponentFixture<DocumentPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentPermissionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
