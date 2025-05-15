import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryListPresentationComponent } from './category-list-presentation.component';

describe('CategoryListPresentationComponent', () => {
  let component: CategoryListPresentationComponent;
  let fixture: ComponentFixture<CategoryListPresentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoryListPresentationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryListPresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
