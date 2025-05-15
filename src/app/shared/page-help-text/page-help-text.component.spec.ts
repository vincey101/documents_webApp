import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageHelpTextComponent } from './page-help-text.component';

describe('PageHelpTextComponent', () => {
  let component: PageHelpTextComponent;
  let fixture: ComponentFixture<PageHelpTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageHelpTextComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageHelpTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
