const Lang = {
    ko: {
        comment: '댓글',
        count: '개',
        makeComment: '의견을 남겨보세요.',
        like: '좋아요',
        delete: '삭제',
        alignNew: '최신순',
        alignLike: '좋아요순',
        newComment: '댓글작성'

    },
    ch: {
        comment: '回帖',
        count: '个',
        makeComment: '留下吧',
        like: '好啊',
        delete: '删除',
        alignNew: '制作顺序',
        alignLike: '好啊顺序',
        newComment: '回帖制作'
    }
};

(function() {
        function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
        }
        return "";
    }
    if(getCookie('educator_locale') === 'zh-CN') {
        window.lang = Lang.ch;
    }
    else {
        window.lang = Lang.ko;
    }

}());

class PostsShowBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        post: {},
        isLoading: false,
    }
  }
  componentDidMount() {
    this.setState({ isLoading: true });
    $.ajax({
      url: `/posts_api/${this.props.id}`,
      dataType: 'json',
      success: function(res) {
        this.setState({
          post: res.post,
          isLoading: false,
        });
      }.bind(this),
      error: function() {
        alert("데이터 불러오기에 실패했습니다. 네트워크 환경을 확인해주세요.");
      }
    });
  }
  render() {
    return (
      <div>
        <div className="container">
          <div className='row'>
            <div className="col-md-8 col-md-offset-2">
              <PostBox post={this.state.post} />
              <CommentsBox postId={this.props.id} userImage={this.state.post.currentUserImage} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class PostBox extends React.Component {
  render() {
    return (
      <div>
        <div className="postBox">
          <div className="post-header">
            <h2 className="title">{this.props.post.title}</h2>
            <p>{this.props.post.username} {moment(this.props.post.created_at).fromNow()}</p>
          </div>
          <div className="content" dangerouslySetInnerHTML={{
            __html: this.props.post.content }} />
        </div>
      </div>
    );
  }
}

class CommentsBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      isLoading: false,
    }
  }
  componentDidMount() {
    this.setState({ isLoading: true });
    $.ajax({
      url: `/posts_api/${this.props.postId}/comments_api`,
      dataType: 'json',
      success: function(res) {
        this.setState({
          comments: res.comments_api,
          isLoading: false,
        });
      }.bind(this),
      error: function() {
        alert("댓글 정보를 받아오는데 실패했습니다. 네트워크 연결 상태를 확인해주세요.");
      }
    });
  }
  handleCommentSubmit(comment) {
    $.ajax({
      url: `/posts_api/${this.props.postId}/comments_api`,
      method: 'POST',
      dataType: 'json',
      data: {comment: comment},
      success: function(res) {
        this.setState({
          comments: res.comments_api
        });
      }.bind(this),
      error: function() {
        alert("댓글 등록에 실패하였습니다. 다시 한 번 확인해주세요.");
      }
    });
  }
  handleDeleteSubmit(commentId) {
    $.ajax({
      url: `/posts_api/${this.props.postId}/comments_api/${commentId}`,
      method: 'DELETE',
      dataType: 'json',
      success: function(res) {
       this.setState({
          comments: res.comments_api
        });
     }.bind(this),
     error: function() {
      alert("댓글 삭제 과정 중 문제가 발생했습니다. 네트워크 연결상태를 확인해주세요.");
     }
    });
  }
  handleLikeSubmit(commentId) {
    $.ajax({
      url: `/posts_api/${this.props.postId}/comments_api/${commentId}/likes_api`,
      method: 'POST',
      dataType: 'json',
      success: function(res) {
        this.setState({
          comments: res.likes_api
        });
      }.bind(this),
      error: function() {
        alert("좋아요 등록 중 문제가 발생했습니다. 네트워크 연결상태를 확인해주세요.");
      }
    });
  }
  handleLikeDeleteSubmit(commentId, likeId) {
    $.ajax({
      url: `/posts_api/${this.props.postId}/comments_api/${commentId}/likes_api/${likeId}`,
      method: 'DELETE',
      dataType: 'json',
      success: function(res) {
        this.setState({
          comments: res.likes_api
        });
      }.bind(this),
      error: function() {
        alert("좋아요 취소 중 문제가 발생했습니다. 네트워크 연결상태를 확인해주세요");
      }
    });
  }
  render() {
    var list = this.state.comments.map((comment, index) => {
      var deleteBtn = (comment.mine) ? <span className="deleteBtn" onClick={this.handleDeleteSubmit.bind(this, comment.id)}>{lang.delete}</span> : '';
      if (comment.likes === 0 ) {
        // 첫 좋아요 누르게 시킬 것
        var likeBtn = <span className="likeBtn" onClick={this.handleLikeSubmit.bind(this, comment.id)}>{lang.like}</span>
      }
      else {
        if(comment.likeOrNot) {
          // 클릭시 좋아요 취소
          var likeBtn = <span className="likeBtn like" onClick={this.handleLikeDeleteSubmit.bind(this, comment.id, comment.myLikeId)}>{lang.like} {comment.likes}{lang.count}</span>
        }
        else {
          // 클릭시 좋아요
          var likeBtn = <span className="likeBtn" onClick={this.handleLikeSubmit.bind(this, comment.id)}>{lang.like} {comment.likes}{lang.count}</span>
        }
      }

      return (
        <div className="commentItemBox" key={index}>
          <div className="box-wrapper clearfix">
            <div className="img-wrapper">
              <img src={comment.userImage} />
            </div>
            <p className="userinfo"><span className="username">{comment.username}</span> - <span className="createdAt">{moment(comment.created_at).fromNow()}</span>
            {likeBtn}</p>
            <div className="comment">
              {comment.comment} {deleteBtn}
            </div>
          </div>
        </div>
      );
    });
    return (
      <div className="commentsBox">
        <div className="comments-header clearfix">
          <div className="header-left">
            {lang.comment} {this.state.comments.length}{lang.count}
          </div>
          <ul className="header-right list-inline">
            <li>{lang.alignNew}</li>
            <li>{lang.alignLike}</li>
          </ul>
        </div>
        {list}
        <CommentForm userImage={this.props.userImage} handleCommentSubmit={this.handleCommentSubmit.bind(this)} />
      </div>
    );
  }
}



class CommentForm extends React.Component {
    handleSubmit(e) {
        e.preventDefault();
        var comment = React.findDOMNode(this.refs.commentInput).value.trim();
        if (comment.length > 5 ) {
          this.props.handleCommentSubmit(comment);
          // Initialize Form
          React.findDOMNode(this.refs.commentInput).value = '';
        }
        else {
          // client validation
          alert("코멘트는 다섯 글자 이상 작성하야아 합니다!");
        }
    }
    render() {
        return (
          <div className="commentForm">
            <div className="inputWrapper clearfix">
              <div className='img-wrapper'>
                <img src={this.props.userImage} />
              </div>
              <form onSubmit={this.handleSubmit.bind(this)}>
                <div className="formBox">
                  <textarea className="form-control" ref="commentInput" placeholder={lang.makeComment} rows="2"></textarea>
                </div>
                <input type="submit" className="btn btn-default commentBtn" value={lang.newComment} />
              </form>
            </div>
          </div>
        );
    }
}
