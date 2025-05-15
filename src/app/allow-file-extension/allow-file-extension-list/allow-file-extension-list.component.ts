import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FeatherModule } from 'angular-feather';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { SharedModule } from '../../shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { CommonDialogService } from '../../core/common-dialog/common-dialog.service';
import { TranslationService } from '../../core/services/translation.service';
import { AllowFileExtensionService } from '../allow-file-extension.service';
import { BaseComponent } from 'src/app/base.component';
import { ToastrService } from 'ngx-toastr';
import { FileTypePipe } from '../../shared/pipes/file-type.pipe';
import { AllowFileExtension } from '@core/domain-classes/allow-file-extension';
import { FileType } from '@core/domain-classes/file-type.enum';

@Component({
  selector: 'app-allow-file-extension-list',
  standalone: true,
  imports: [FormsModule,
    TranslateModule,
    CommonModule,
    RouterModule,
    MatButtonModule,
    ReactiveFormsModule,
    FeatherModule,
    MatIconModule,
    MatCardModule,
    SharedModule,
    MatFormFieldModule,
    FileTypePipe,
    MatTableModule,
    MatInputModule],
  templateUrl: './allow-file-extension-list.component.html',
  styleUrl: './allow-file-extension-list.component.scss'
})

export class AllowFileExtensionListComponent extends BaseComponent implements OnInit {

  allowFileExtensions: AllowFileExtension[] = [];
  displayedColumns: string[] = ['action', 'type', 'extensions'];

  private allowFileExtensionService = inject(AllowFileExtensionService);
  private commonDialogService = inject(CommonDialogService);
  private translationService = inject(TranslationService);
  private toastrService = inject(ToastrService);

  ngOnInit(): void {
    this.getAllowFileExtensions();
  }

  getAllowFileExtensions() {
    this.sub$.sink = this.allowFileExtensionService.getAllowFileExtensions()
      .subscribe((settings: AllowFileExtension[]) => {
        this.allowFileExtensions = settings;
        this.allowFileExtensions.forEach((setting: AllowFileExtension) => {
          setting.extensions = setting.extensions.split(',').join(', ');
        });
      })
  }

  deleteAllowFileExtension(setting: AllowFileExtension) {
    this.sub$.sink = this.commonDialogService
      .deleteConformationDialog(`${this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} ${FileType[setting.fileType]}`)
      .subscribe((isTrue: boolean) => {
        if (isTrue) {
          this.sub$.sink = this.allowFileExtensionService.deleteAllowFileExtension(setting.id).subscribe(() => {
            this.toastrService.success(this.translationService.getValue('ALLOW_FILE_EXTENSION_DELETED_SUCCESSFULLY'));
            this.getAllowFileExtensions();
          });
        }
      });
  }
}
