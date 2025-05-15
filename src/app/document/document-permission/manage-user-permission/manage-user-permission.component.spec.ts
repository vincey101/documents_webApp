import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageUserPermissionComponent } from './manage-user-permission.component';

describe('ManageUserPermissionComponent', () => {
  let component: ManageUserPermissionComponent;
  let fixture: ComponentFixture<ManageUserPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageUserPermissionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageUserPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
