export interface Dashboard {
  Quantity: number;
  Category: string;
}
export interface ChartData {
  labels: string[],
  datasets: [{
    label: string,
    backgroundColor: any,
    borderColor?: string,
    data: number[]
  }]
}
