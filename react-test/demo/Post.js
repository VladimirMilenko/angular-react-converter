import React from "react";
import Profile from "./Profile";
import Comment from "./Comment";

class Post extends React.Component {
  render() {
    const { post, comments, postLoading, commentsLoading } = this.props;

    return (
      <article className="post">
        {postLoading ? (
          <div className="post__photo">
            <div>Loading</div>
          </div>
        ) : (
          <div className="post__photo">
            <img
              className="post__img"
              src={post.images.standard_resolution.url}
            />
          </div>
        )}
        <div className="post__content">
          {commentsLoading ? (
            <div>Loading</div>
          ) : (
              <div>
                   <Profile
              profile_picture={post.user.profile_picture}
              username={post.user.username}
            />
            <div className="comments">
              {comments.map(comment => (
                <Comment text={comment.text} from={comment.from.username} />
              ))}
            </div>
            </div>
          )}
        </div>
      </article>
    );
  }
}

export default Post;