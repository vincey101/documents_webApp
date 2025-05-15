import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateOpenaiComponent } from './template-openai.component';

describe('TemplateOpenaiComponent', () => {
  let component: TemplateOpenaiComponent;
  let fixture: ComponentFixture<TemplateOpenaiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateOpenaiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateOpenaiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
