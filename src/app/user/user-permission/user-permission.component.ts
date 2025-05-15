import { Component, OnInit } from '@angular/core';
import { Operation } from '@core/domain-classes/operation';
import { PageService } from '@core/services/page.service';
import { forkJoin, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseComponent } from 'src/app/base.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from '@core/domain-classes/user';
import { UserService } from '../user.service';
import { TranslationService } from '@core/services/translation.service';
import { Page } from '@core/domain-classes/page';
import { ActionService } from '@core/services/action.service';
import { CommonError } from '@core/error-handler/common-error';

@Component({
  selector: 'app-user-permission',
  templateUrl: './user-permission.component.html',
  styleUrls: ['./user-permission.component.css'],
})
export class UserPermissionComponent extends BaseComponent implements OnInit {
  pages: Page[];
  user: User;

  screens$: Observable<Screen[]>;
  operations$: Observable<Operation[]>;

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    private pageService: PageService,
    private actionService: ActionService,
    private userService: UserService,
    public translationService: TranslationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.sub$.sink = this.activeRoute.data.subscribe((data: { user: User }) => {
      this.user = data.user;
    });

    const getActionRequest = this.actionService.getAll();
    const getPageRequest = this.pageService.getAll();
    forkJoin({ getActionRequest, getPageRequest }).subscribe((response) => {
      this.pages = response.getPageRequest;
      this.pages = this.pages.map((p: any) => {
        const pageActions = response.getActionRequest.filter(
          (c) => c.pageId == p.id
        );
        const result = Object.assign({}, p, { pageActions: pageActions });
        return result;
      });
    });
  }

  manageUserClaimAction(user: User): void {
    this.sub$.sink = this.userService
      .updateUserClaim(user.userClaims, user.id)
      .subscribe(
        () => {
          this.toastrService.success(
            this.translationService.getValue(
              'USER_PERMISSION_UPDATED_SUCCESSFULLY'
            )
          );
          this.router.navigate(['/users']);
        },
        (err: CommonError) => {
          this.toastrService.error(err.error['message']);
        }
      );
  }
}
