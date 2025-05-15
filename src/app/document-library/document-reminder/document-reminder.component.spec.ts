import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentReminderComponent } from './document-reminder.component';

describe('DocumentReminderComponent', () => {
  let component: DocumentReminderComponent;
  let fixture: ComponentFixture<DocumentReminderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentReminderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentReminderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
