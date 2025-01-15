import { Component, OnInit } from '@angular/core';

import {
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  RowComponent,
  ColComponent,
  FormSelectDirective
} from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';

import { DefaultValuesService } from '../../shared/services/default-values.service';
import { DashboardRepositoryService } from '../../shared/services/network/dashboard-repository.service';
import { ShowToastService } from '../../shared/services/show-toast.service';
import { ChartData } from '../../interfaces/dashboard.model';
import { ErrorMessage } from '../../interfaces/error.model';
import { Operations, Entities, ColorClasses } from '../../shared/enums.model';

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [CardComponent, CardBodyComponent, RowComponent, ColComponent, FormSelectDirective, ChartjsComponent, CardHeaderComponent]
})
export class DashboardComponent implements OnInit {
  overviewData!: ChartData;
  stickerData!: ChartData;
  tagData!: ChartData;
  categoryData!: ChartData;
  donutData!: ChartData;
  chartType: string = 'tag';

  constructor(
    private dashboardRepository: DashboardRepositoryService,
    private defaults: DefaultValuesService,
    private toast: ShowToastService
  ) { }

  ngOnInit(): void {
    this.getOverview();
    this.getSticker();
    this.getTag();
    this.getCategory();
  }
  getColor = (quantity: number): string[] => {
    const colors: string[] = [];
    const makeColor = (colorNum: number, colors: number) => {
      return (colors <= 1)
        ? (100 * Math.random()) % 360
        : (colorNum * (360 / colors)) % 360;
    };
    const getRandomColor = (i: number, quantity: number): string =>
      `hsl(${makeColor(i, quantity)},${25 + 70 * Math.random()}%,${65 + 10 * Math.random()}%`;
    for (let i = 0; i < quantity; i++) {
      colors.push(getRandomColor(i, quantity));
    }

    return colors;
  }
  getOverview() {
    this.dashboardRepository
      .getOverview()
      .subscribe({
        next: (response) => {
          this.overviewData = {
            labels: response.map((element) => element.Category),
            datasets: [{
              label: 'Cantidad',
              backgroundColor: this.getColor(1)[0],
              data: response.map((element) => element.Quantity)
            }]
          };
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.get, Entities.chart);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }
  getSticker() {
    this.dashboardRepository
      .getSticker()
      .subscribe({
        next: (response) => {
          this.stickerData = {
            labels: response.map((element) => element.Category),
            datasets: [{
              label: 'Cantidad',
              backgroundColor: this.getColor(1)[0],
              borderColor: this.getColor(1)[0],
              data: response.map((element) => element.Quantity)
            }]
          };
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.get, Entities.chart);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }
  getCategory() {
    this.dashboardRepository
      .getCategory()
      .subscribe({
        next: (response) => {
          this.categoryData = {
            labels: response.map((element) => element.Category),
            datasets: [{
              label: 'Cantidad',
              backgroundColor: this.getColor(response.length),
              data: response.map((element) => element.Quantity)
            }]
          };
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.get, Entities.chart);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }
  getTag() {
    this.dashboardRepository
      .getTag()
      .subscribe({
        next: (response) => {
          this.tagData = {
            labels: response.map((element) => element.Category),
            datasets: [{
              label: 'Cantidad',
              backgroundColor: this.getColor(response.length),
              data: response.map((element) => element.Quantity)
            }]
          };
          this.donutData = this.tagData;
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.get, Entities.chart);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }
  handleChangeChartType(event: any) {
    switch (event?.target?.value) {
      case "tag": this.donutData = this.tagData; break;
      case "category": this.donutData = this.categoryData; break;
      default: return;
    }
  }
}
