import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageHelperListPresentationComponent } from './page-helper-list-presentation.component';

describe('PageHelperListPresentationComponent', () => {
  let component: PageHelperListPresentationComponent;
  let fixture: ComponentFixture<PageHelperListPresentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageHelperListPresentationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageHelperListPresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
