import React from "react";
import { useSelector, useDispatch } from "react-redux";

import Post from "../components/Post";
import { actionCreators as postActions } from "../redux/modules/post";
import { Grid } from "../elements";

const PostList = (props) => {
  const post_list = useSelector((state) => state.post.list);
  const dispatch = useDispatch();

  const user_info = useSelector((state) => state.user.user);

  console.log(post_list);
  const { history } = props;

  React.useEffect(() => {
    if (post_list.length === 0) {
      dispatch(postActions.getPostFB());
    }
  }, []);

  return (
    <React.Fragment>
      <Grid bg="#eff6ff" padding="20px 0px">
        {post_list.map((p, idx) => {
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
