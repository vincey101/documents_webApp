import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRolePermissionComponent } from './manage-role-permission.component';

describe('ManageRolePermissionComponent', () => {
  let component: ManageRolePermissionComponent;
  let fixture: ComponentFixture<ManageRolePermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageRolePermissionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageRolePermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
