import React from "react";
import Post from "../components/Post";
import CommentList from "../components/CommentList";
import CommentWrite from "../components/CommentWrite";
import { Grid } from "../elements";

import Permit from "../shared/Permit";

import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import { actionCreators as postActions } from "../redux/modules/post";

const PostDetail = (props) => {
  const dispatch = useDispatch();
  const { history } = props;
  const id = props.match.params.id;
  console.log(id); //맞게 가져옴

  const user_info = useSelector((state) => state.user.user); //로그인을 안하니 유저정보가 null이 되서 오류

  const post_list = useSelector((state) => state.post.list);

  const post_idx = post_list.findIndex((p) => p.id === id);
  const post = post_list[post_idx];

  // console.log(post_data); // 맞게 들어감, firestore 저장 후, 새로고침 하면 없어짐

  React.useEffect(() => {
    if (post) {
      return;
    }
    dispatch(postActions.getOnePostFB(id));
  }, []);

  return (
    <React.Fragment>
      {post && (
        <Post {...post} is_me={post.user_info.user_id === user_info?.uid} />
      )}
      <Permit>
        <CommentWrite post_id={id} />
      </Permit>
      <CommentList post_id={id} />
    </React.Fragment>
  );
};

export default PostDetail;
