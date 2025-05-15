import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { AllowFileExtensionService } from '../allow-file-extension.service';
import { BaseComponent } from 'src/app/base.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FeatherModule } from 'angular-feather';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { SharedModule } from '@shared/shared.module';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { AllowFileExtension } from '@core/domain-classes/allow-file-extension';
import { FileType } from '@core/domain-classes/file-type.enum';

@Component({
  selector: 'app-manage-allow-file-extension',
  standalone: true,
  imports: [
    FormsModule,
    TranslateModule,
    CommonModule,
    RouterModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    FeatherModule,
    MatIconModule,
    MatCardModule,
    SharedModule,
  ],
  templateUrl: './manage-allow-file-extension.component.html',
  styleUrl: './manage-allow-file-extension.component.scss',
})
export class ManageAllowFileExtensionComponent
  extends BaseComponent
  implements OnInit {
  isEditMode: boolean = false;
  allowFileExtensionForm: FormGroup;
  fileTypes: { key: string; value: number }[] = [];
  get extensions(): FormArray {
    return this.allowFileExtensionForm.get('extensions') as FormArray;
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private allowFileExtensionService: AllowFileExtensionService,
    private toastrService: ToastrService,
    private translationService: TranslationService
  ) {
    super();
  }

  createAllowFileExtensionForm() {
    this.allowFileExtensionForm = this.fb.group({
      id: [],
      fileType: [{ value: null, disabled: false }, [Validators.required]],
      extensions: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.fileTypes = this.getEnumValues(FileType);
    this.createAllowFileExtensionForm();

    this.sub$.sink = this.activeRoute.data.subscribe(
      (data: { allowFileExtension: AllowFileExtension }) => {
        if (data.allowFileExtension) {
          this.isEditMode = true;
          this.allowFileExtensionForm.patchValue({
            id: data.allowFileExtension.id,
            fileType: data.allowFileExtension.fileType
          });
          if (data.allowFileExtension.extensions && data.allowFileExtension.extensions.length > 0) {
            data.allowFileExtension.extensions.split(',').forEach((ext) => {
              this.extensions.push(this.buildExtension(ext));
            });
          }
          this.allowFileExtensionForm.get('fileType').disable();
        } else {
          this.extensions.push(this.buildExtension());
        }
      }
    );
  }
  addExtensionField(): void {
    this.extensions.push(this.buildExtension());
  }

  buildExtension(extension?: string): FormGroup {
    return this.fb.group({
      extension: [extension ? extension : '', [Validators.required, Validators.pattern(/^[a-zA-Z0-9,]*$/)]],
    });
  }

  getEnumValues(enumObj: any): { key: string; value: number }[] {
    return Object.keys(enumObj)
      .filter((key) => isNaN(Number(key)))
      .map((key) => ({
        key: key,
        value: enumObj[key],
      }));
  }

  removeExtensionField(index: number): void {
    this.extensions.removeAt(index);
  }

  saveAllowFileExtension() {
    if (this.allowFileExtensionForm.valid) {
      const allowFileExtension = this.createBuildObject();
      if (this.isEditMode) {
        this.sub$.sink = this.allowFileExtensionService
          .updateAllowFileExtension(allowFileExtension)
          .subscribe(() => {
            this.toastrService.success(
              this.translationService.getValue(
                'FILE_TYPE_EXTENSION_UPDATED_SUCCESSFULLY'
              )
            );
            this.router.navigate(['/allow-file-extension']);
          });
      } else {
        this.sub$.sink = this.allowFileExtensionService
          .addAllowFileExtension(allowFileExtension)
          .subscribe(() => {
            this.toastrService.success(
              this.translationService.getValue(
                'FILE_TYPE_EXTENSION_CREATED_SUCCESSFULLY'
              )
            );
            this.router.navigate(['/allow-file-extension']);
          });
      }
    } else {
      this.allowFileExtensionForm.markAllAsTouched();
    }
  }

  createBuildObject(): AllowFileExtension {
    const id = this.allowFileExtensionForm.get('id').value;
    const extensions = this.extensions.controls.map((x) => x.get('extension').value);
    const data: AllowFileExtension = {
      id: id,
      fileType: this.allowFileExtensionForm.get('fileType').value,
      extensions: extensions.join(','),
    };
    return data;
  }
}
