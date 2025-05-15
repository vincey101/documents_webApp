import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFileRequestComponent } from './manage-file-request.component';

describe('ManageFileRequestComponent', () => {
  let component: ManageFileRequestComponent;
  let fixture: ComponentFixture<ManageFileRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFileRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFileRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
