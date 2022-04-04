import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { db } from "../../shared/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import moment from "moment";

const SET_POST = "SET_POST";
const ADD_POST = "ADD_POST";

const setPost = createAction(SET_POST, (post_list) => ({ post_list }));
const addPost = createAction(ADD_POST, (post) => ({ post }));

//리듀서가 사용할 초기값
const initialState = {
  list: [],
};

//게시글 하나에 대한 초기값 (있어야 만들 때 편하다)
const initialPost = {
  id: 0,
  // user_info: {
  //   user_name: "hyeri",
  //   user_profile: "https://t1.daumcdn.net/cfile/blog/254E103A5523680A14",
  // },-> user redux에 넣어져 있는 값을 가져 올것임.
  image_url: "https://t1.daumcdn.net/cfile/blog/254E103A5523680A14",
  contents: "",
  comment_cnt: 0,
  insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
  // insert_dt: "2022-05-01 10:00:00",
};

const addPostFB = (contents = "") => {
  return async function (dispatch, getState, { history }) {
    const postDB = await getDocs(collection(db, "post"));
    const _user = getState().user.user;

    const user_info = {
      user_name: _user.user_name,
      user_id: _user.uid,
      user_profile: _user.user_profile,
    };
    const _post = {
      ...initialPost,
      contents: contents,
      insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
    };

    const post_list = { ...user_info, ..._post };
    try {
      const docRef = await addDoc(collection(db, "post"), post_list);
      const post = { user_info, ..._post, id: docRef.id };
      dispatch(addPost(post));
      history.replace("/");
    } catch (e) {
      console.log("post 작성에 실패했어요!", e);
    }
  };
};

const getPostFB = () => {
  return async function (dispatch, getState, { history }) {
    const postDB = await getDocs(collection(db, "post"));
    const post_list = [];

    postDB.forEach((doc) => {
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
      ); //_post 에는 id 안들어 있으니 딕셔너리 형태로 형태 만들기

      post_list.push(post);
    });

    //위에서는 자바스크립트 고수답게 reduce 사용해서 만들어 줌..
    // let post = {
    //   id: doc.id,
    //   user_info: {
    //     user_name: _post.user_name,
    //     user_profile: _post.user_profile,
    //     user_id: _post.user_id,
    //   },
    //   image_url: _post.image_url,
    //   contents: _post.contents,
    //   comment_cnt: 10,
    //   insert_dt: "2022-05-01 10:00:00",
    // };

    console.log(post_list);
    dispatch(setPost(post_list));
  };
};

export default handleActions(
  {
    [SET_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list = action.payload.post_list;
      }),

    [ADD_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list.unshift(action.payload.post);
      }),
  },
  initialState
);

const actionCreators = {
  setPost,
  addPost,
  getPostFB,
  addPostFB,
};

export { actionCreators };
