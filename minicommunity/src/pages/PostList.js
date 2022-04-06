import React from "react";
import { useSelector, useDispatch } from "react-redux";

import Post from "../components/Post";
import { actionCreators as postActions } from "../redux/modules/post";
import { Grid } from "../elements";

const PostList = (props) => {
  const dispatch = useDispatch();
  const post_list = useSelector((state) => state.post.list);
  const user_info = useSelector((state) => state.user.user);

  const { history } = props;
  React.useEffect(() => {
    // 원래는 0일때 보여주는 건데, 상세페이지만들면서 리스트가 1일때 목록으로 돌아가는 경우가 생겨서 조건 바꿔줌.
    if (post_list.length < 2) {
      dispatch(postActions.getPostFB());
    }
  }, []);

  return (
    <React.Fragment>
      <Grid bg="#eff6ff" padding="20px 0px">
        {post_list.map((p, idx) => {
          console.log(p, user_info);

          //옵셔널 체이닝
          if (p.user_info.user_id === user_info?.uid) {
            return (
              <Grid
                bg="#fff"
                margin="8px 0px"
                key={p.id}
                _onClick={() => {
                  history.push(`/post/${p.id}`);
                }}
              >
                <Post {...p} is_me />
              </Grid>
            );
          } else {
            return (
              <Grid
                bg="#ffffff"
                key={p.id}
                _onClick={() => {
                  history.push(`/post/${p.id}`);
                }}
              >
                <Post {...p} />
              </Grid>
            );
          }
        })}
      </Grid>
    </React.Fragment>
  );
};

export default PostList;
