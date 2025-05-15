import { Direction } from '@angular/cdk/bidi';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, Renderer2 } from '@angular/core';
import { TranslationService } from '@core/services/translation.service';
import { BaseComponent } from 'src/app/base.component';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: [],
})
export class LayoutComponent extends BaseComponent {
  direction: Direction;

  constructor(
    private translationService: TranslationService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    super();
    this.getLangDir();
  }

  getLangDir() {
    this.sub$.sink = this.translationService.lanDir$.subscribe(
      (c: Direction) => {
        this.direction = c;
        if (this.direction == 'rtl') {
          this.renderer.addClass(this.document.body, 'rtl');
        } else {
          this.renderer.removeClass(this.document.body, 'rtl');
        }
      }
    );
  }
}
