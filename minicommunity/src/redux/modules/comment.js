import { createAction, handleActions } from "redux-actions";
import { actionCreators as postActions } from "./post";
import { produce } from "immer";

import { db } from "../../shared/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  orderBy,
  query,
  where,
  getDoc,
  increment,
} from "firebase/firestore";

import "moment";
import moment from "moment";

const SET_COMMENT = "SET_COMMENT";
const ADD_COMMENT = "ADD_COMMENT";

const LOADING = "LOADING";

const setComment = createAction(SET_COMMENT, (post_id, comment_list) => ({
  post_id,
  comment_list,
}));
const addComment = createAction(ADD_COMMENT, (post_id, comment) => ({
  post_id,
  comment,
}));

const loading = createAction(LOADING, (is_loading) => ({ is_loading }));

const initialState = {
  list: {},
  is_loading: false,
};

const addCommentFB = (post_id, contents) => {
  return function (dispatch, getState, { history }) {
    const docRef = collection(db, "comment");
    const user_info = getState().user.user;

    let comment = {
      post_id: post_id,
      user_id: user_info.uid,
      user_name: user_info.user_name,
      user_profile: user_info.user_profile,
      contents: contents,
      insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
    };

    addDoc(docRef, comment).then((post_data) => {
      const postDB = doc(collection(db, "post"), post_id);
      const post = getState().post.list.find((l) => l.id === post_id);

      comment = { ...comment, id: post_data.id };
      updateDoc(postDB, { comment_cnt: increment(1) }).then((_post) => {
        dispatch(addComment(post_id, comment));

        if (post) {
          dispatch(
            postActions.editPost(post_id, {
              comment_cnt: parseInt(post.comment_cnt) + 1,
            })
          );
        }
        // dispatch()
      });
    });
  };
};

const getCommentFB = (post_id = null) => {
  return function (dispatch, getState, { history }) {
    if (!post_id) {
      return;
    }
    const docRef = collection(db, "comment");
    const q = query(
      docRef,
      where("post_id", "==", post_id),
      orderBy("insert_dt", "desc")
    );

    getDocs(q)
      .then((doc) => {
        let list = [];
        doc.forEach((doc) => {
          let _post = doc.data();
          list.push({ ..._post, id: doc.id });
        });
        dispatch(setComment(post_id, list));
      })
      .catch((err) => {
        console.log("댓글정보를 가져올 수 없습니다.");
        console.log(err);
      });
  };
};

export default handleActions(
  {
    [SET_COMMENT]: (state, action) =>
      produce(state, (draft) => {
        // 댓글리스트를 매번 스토어에서 받아오는 것은 비효율적. 리덕스에 딕셔너리로 넣고 사용하자. let data = {[post_id]: com_list, ...}
        draft.list[action.payload.post_id] = action.payload.comment_list;
      }),

    [ADD_COMMENT]: (state, action) =>
      produce(state, (draft) => {
        draft.list[action.payload.post_id].unshift(action.payload.comment);
      }),
  },
  initialState
);

const actionCreators = {
  getCommentFB,
  setComment,
  addComment,
  addCommentFB,
};

export { actionCreators };
