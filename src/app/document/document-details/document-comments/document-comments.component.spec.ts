import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentCommentsComponent } from './document-comments.component';

describe('DocumentCommentsComponent', () => {
  let component: DocumentCommentsComponent;
  let fixture: ComponentFixture<DocumentCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentCommentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
