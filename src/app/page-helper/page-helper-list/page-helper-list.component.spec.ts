import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageHelperListComponent } from './page-helper-list.component';

describe('PageHelperListComponent', () => {
  let component: PageHelperListComponent;
  let fixture: ComponentFixture<PageHelperListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageHelperListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageHelperListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
