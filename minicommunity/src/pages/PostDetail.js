import React from "react";
import Post from "../components/Post";
import CommentList from "../components/CommentList";
import CommentWrite from "../components/CommentWrite";
import { Grid } from "../elements";

import { useSelector } from "react-redux";
import { db } from "../shared/firebase";
import { doc, getDoc } from "firebase/firestore";

const PostDetail = (props) => {
  const { history } = props;
  const id = props.match.params.id;
  console.log(id); //맞게 가져옴

  const user_info = useSelector((state) => state.user.user); //로그인을 안하니 유저정보가 null이 되서 오류

  const post_list = useSelector((state) => state.post.list);

  const post_idx = post_list.findIndex((p) => p.id === id);
  const post_data = post_list[post_idx];

  console.log(post_data); // 맞게 들어감, firestore 저장 후, 새로고침 하면 없어짐

  const [post, setPost] = React.useState(post_data ? post_data : null);

  React.useEffect(() => {
    if (post) {
      return;
    }
    const docRef = doc(db, "post", id);
    getDoc(docRef).then((doc) => {
      console.log(doc);
      console.log(doc.data());

      let _post = doc.data();
      let post = Object.keys(_post).reduce(
        //키 값 뽑아오기
        (acc, cur) => {
          if (cur.indexOf("user_") !== -1) {
            return {
              ...acc,
              user_info: { ...acc.user_info, [cur]: _post[cur] }, //use_info로 묶어주려고
            };
          }
          return { ...acc, [cur]: _post[cur] };
        },
        { id: doc.id, user_info: {} }
      );

      setPost(post);
    });
  }, []);

  return (
    <React.Fragment>
      {post && (
        <Post {...post} is_me={post.user_info.user_id === user_info.uid} />
      )}
      <CommentWrite />
      <CommentList />
    </React.Fragment>
  );
};

export default PostDetail;
