import React from "react";

class InstagramCard extends React.Component {
  render() {
    const {
      className,
      imageUrl,
      loading,
      hasImage,
      comments
    } = this.props;

    return (
      <div className="instagram-card">
      {
        loading ? <div>loading</div>  : <img src={imageUrl} />
      }
      {
        comments.map(comment => (<Comment key={comment.id} text={comment.text} user={comment.profile} />))
      }
      </div>
    );
  }
}

export default InstagramCard;
