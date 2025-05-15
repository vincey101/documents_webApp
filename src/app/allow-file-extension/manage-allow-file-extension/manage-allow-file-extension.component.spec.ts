import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAllowFileExtensionComponent } from './manage-allow-file-extension.component';

describe('ManageAllowFileExtensionComponent', () => {
  let component: ManageAllowFileExtensionComponent;
  let fixture: ComponentFixture<ManageAllowFileExtensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageAllowFileExtensionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAllowFileExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
