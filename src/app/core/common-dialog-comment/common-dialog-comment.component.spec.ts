import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonDialogCommentComponent } from './common-dialog-comment.component';

describe('CommonDialogCommentComponent', () => {
  let component: CommonDialogCommentComponent;
  let fixture: ComponentFixture<CommonDialogCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonDialogCommentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonDialogCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
