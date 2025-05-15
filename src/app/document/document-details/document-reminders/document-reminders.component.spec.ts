import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentRemindersComponent } from './document-reminders.component';

describe('DocumentRemindersComponent', () => {
  let component: DocumentRemindersComponent;
  let fixture: ComponentFixture<DocumentRemindersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentRemindersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentRemindersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
