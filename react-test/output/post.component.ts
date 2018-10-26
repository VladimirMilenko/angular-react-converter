import { Component, Input } from "@angular/core";
@Component({
  selector: "post",
  templateUrl: "./post.component.html",
  styleUrls: ["./post.styles.scss"]
})
export class Post {
  @Input()
  postLoading;
  @Input()
  post;
  @Input()
  commentsLoading;
  @Input()
  comments;
}