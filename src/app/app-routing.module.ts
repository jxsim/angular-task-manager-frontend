import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {TaskComponent} from "./task/task.component";
import {AddTaskComponent} from "./task/new/add-task.component";
import {UpdateTaskComponent} from "./task/update/update-task.component";


const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'tasks', component: TaskComponent },
  { path: 'tasks/new', component: AddTaskComponent },
  { path: 'tasks/:id/edit', component: UpdateTaskComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
