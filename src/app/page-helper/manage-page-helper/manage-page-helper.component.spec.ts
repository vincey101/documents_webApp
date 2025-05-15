import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePageHelperComponent } from './manage-page-helper.component';

describe('ManagePageHelperComponent', () => {
  let component: ManagePageHelperComponent;
  let fixture: ComponentFixture<ManagePageHelperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagePageHelperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePageHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
