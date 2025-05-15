import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllowFileExtensionListComponent } from './allow-file-extension-list.component';

describe('AllowFileExtensionListComponent', () => {
  let component: AllowFileExtensionListComponent;
  let fixture: ComponentFixture<AllowFileExtensionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllowFileExtensionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllowFileExtensionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
