import { Component, OnInit } from '@angular/core';
import { PageHelper } from '@core/domain-classes/page-helper';
import { BaseComponent } from 'src/app/base.component';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { PageHelperService } from '../page-helper.service';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-manage-page-helper',
  templateUrl: './manage-page-helper.component.html',
  styleUrls: ['./manage-page-helper.component.css'],
})
export class ManagePageHelperComponent extends BaseComponent implements OnInit {
  pageHelper: PageHelper;
  pageHelperForm: UntypedFormGroup;
  editor = ClassicEditor;
  config = {
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        '|',
        'bulletedList',
        'numberedList',
        '|',
        'insertTable',
        '|',
        '|',
        'undo',
        'redo',
      ],
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
    },
    language: 'en',
  };

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private pageHelperService: PageHelperService,
    private toastrService: ToastrService,
    private translationService: TranslationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createPageHelperForm();
    this.sub$.sink = this.activeRoute.data.subscribe(
      (data: { pageHelper: PageHelper }) => {
        if (data.pageHelper) {
          this.pageHelperForm.patchValue(data.pageHelper);
          this.pageHelper = data.pageHelper;
        }
      }
    );
  }

  createPageHelperForm() {
    this.pageHelperForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });
  }

  createBuildObject(): PageHelper {
    const pageHelper: PageHelper = {
      id: this.pageHelperForm.get('id').value,
      name: this.pageHelperForm.get('name').value,
      description: this.pageHelperForm.get('description').value,
    };
    return pageHelper;
  }

  update() {
    if (this.pageHelperForm.valid) {
      const pageHelper = this.createBuildObject();
      this.sub$.sink = this.pageHelperService
        .updatePageHelper(pageHelper)
        .subscribe(() => {
          this.toastrService.success(
            this.translationService.getValue('PAGE_HELPER_UPDATED_SUCCESSFULLY')
          );
          this.router.navigate(['/page-helper']);
        });
    } else {
      this.pageHelperForm.markAllAsTouched();
      this.toastrService.error(
        this.translationService.getValue('PLEASE_ENTER_PROPER_DATA')
      );
    }
  }
}
