import { Component, OnInit, ViewChild } from '@angular/core';
import { DashboradService } from '../dashboard.service';

@Component({
  selector: 'app-document-by-category-chart',
  templateUrl: './document-by-category-chart.component.html',
  styleUrls: ['./document-by-category-chart.component.scss']
})
export class DocumentByCategoryChartComponent implements OnInit {
  single: any[] = [];
  view: any[] = [700, 400];
  constructor(private dashboardService: DashboradService) { }

  ngOnInit(): void {
    this.getDocumentCategoryChartData();
  }

  getDocumentCategoryChartData() {
    this.dashboardService.getDocumentByCategory().subscribe(data => {
      this.single = data.map(c => {
        return {
          name: c.categoryName,
          value: c.documentCount
        }
      });
    });
  }
}
