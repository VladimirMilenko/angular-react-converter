import { Component, Input } from "@angular/core";
@Component({
  selector: "comment",
  templateUrl: "./comment.component.html",
  styleUrls: ["./comment.styles.scss"]
})
export class Comment {
  @Input()
  from;
  @Input()
  text;
}