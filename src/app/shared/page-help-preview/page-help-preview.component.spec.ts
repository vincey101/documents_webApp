import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageHelpPreviewComponent } from './page-help-preview.component';

describe('PageHelpPreviewComponent', () => {
  let component: PageHelpPreviewComponent;
  let fixture: ComponentFixture<PageHelpPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageHelpPreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageHelpPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
