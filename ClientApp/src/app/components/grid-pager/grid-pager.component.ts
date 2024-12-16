import { Component, input, OnInit, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageItemDirective, PageLinkDirective, PaginationComponent } from '@coreui/angular';

@Component({
  selector: 'app-grid-pager',
  standalone: true,
  imports: [PageItemDirective, PageLinkDirective, PaginationComponent, RouterLink],
  templateUrl: './grid-pager.component.html',
  styleUrl: './grid-pager.component.scss'
})
export class GridPagerComponent implements OnInit{
  items = input<any[]>([]);
  itemsPerPage = input<number>(10);
  totalItems = input<number>(0);
  currentPage = input<number>(1);
  pageNumber = output<number>();
  pageNumbers: number[] = [];

  ngOnInit(): void {
    this.initializePageNumbers();
  }

  initializePageNumbers(): void {
    for (let i = 1; i <= Math.ceil(this.totalItems() / this.itemsPerPage()); i++) {
      this.pageNumbers.push(i);
    }   
  }

  setCurrentPage(page: any) {
    let pageNumber: number = 0;
    switch (page) {
      case 'P': pageNumber = this.currentPage() - 1; break;
      case 'N': pageNumber = this.currentPage() + 1; break;
      default: pageNumber = page; break;
    }
    this.pageNumber.emit(pageNumber);
  }
}
