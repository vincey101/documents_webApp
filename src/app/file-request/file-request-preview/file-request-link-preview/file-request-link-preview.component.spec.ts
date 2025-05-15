import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileRequestLinkPreviewComponent } from './file-request-link-preview.component';

describe('FileRequestLinkPreviewComponent', () => {
  let component: FileRequestLinkPreviewComponent;
  let fixture: ComponentFixture<FileRequestLinkPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileRequestLinkPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileRequestLinkPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
