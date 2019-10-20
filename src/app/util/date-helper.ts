
import * as moment from 'moment';
import {NgbDate, NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";

export function formatStartDate(date: NgbDateStruct) {
  return `${date.year}-${date.month}-${date.day}`;
}

export function parseDate(date) {
  const momentDate = moment(date).toObject();
  return new NgbDate(momentDate.years, momentDate.months + 1, momentDate.date);
}
