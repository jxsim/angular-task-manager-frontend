import {NgbDate} from "@ng-bootstrap/ng-bootstrap";

export default class Task {
  id: string;
  taskDescription: string;
  priority: number;
  startDate: string | NgbDate;
  endDate: string | NgbDate;
  parentTask: string;
  isEnded: boolean;
}
