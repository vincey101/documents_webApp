import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateOpenaiListComponent } from './template-openai-list.component';

describe('TemplateOpenaiListComponent', () => {
  let component: TemplateOpenaiListComponent;
  let fixture: ComponentFixture<TemplateOpenaiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateOpenaiListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateOpenaiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
