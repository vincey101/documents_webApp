import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PageHelper } from '@core/domain-classes/page-helper';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-page-help-preview',
  templateUrl: './page-help-preview.component.html',
  styleUrls: ['./page-help-preview.component.scss'],
})
export class PageHelpPreviewComponent implements OnInit {
  editor = ClassicEditor;
  config = {
    toolbar: [],
  };
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PageHelper,
    private dialogRef: MatDialogRef<PageHelpPreviewComponent>,
    private router: Router,
    private matDialogRef: MatDialog
  ) {}

  ngOnInit(): void {}

  onCancel(): void {
    this.dialogRef.close();
  }

  editPageHelper() {
    this.matDialogRef.closeAll();
    this.router.navigate(['/page-helper/manage/', this.data.id]);
  }
}
