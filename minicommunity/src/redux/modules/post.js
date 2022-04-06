import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { db, storage } from "../../shared/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import moment from "moment";
import { uploadString, ref, getDownloadURL } from "firebase/storage";

import { actionCreators as imageActions } from "./image";

const SET_POST = "SET_POST";
const ADD_POST = "ADD_POST";
const EDIT_POST = "EDIT_POST";

const setPost = createAction(SET_POST, (post_list) => ({ post_list }));
const addPost = createAction(ADD_POST, (post) => ({ post }));
const editPost = createAction(EDIT_POST, (post_id, post) => ({
  post_id,
  post,
}));

//리듀서가 사용할 초기값
const initialState = {
  list: [],
};

//초기값 (게시글 하나에 대한 초기값: 있어야 만들 때 편하다)
const initialPost = {
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

//Middlewares
const getPostFB = () => {
  return async function (dispatch, getState, { history }) {
    const docRef = collection(db, "post");
    const q = query(docRef, orderBy("insert_dt", "desc"));

    const sortedDB = await getDocs(q);

    // console.log(sortedDB);

    const post_list = [];

    sortedDB.forEach((doc) => {
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
      // console.log(post);
      post_list.push(post);
    });

    // console.log(post_list);
    dispatch(setPost(post_list));

    // postDB.forEach((doc) => {
    //   let _post = doc.data();
    //   let post = Object.keys(_post).reduce(
    //     //키 값 뽑아오기
    //     (acc, cur) => {
    //       if (cur.indexOf("user_") !== -1) {
    //         return {
    //           ...acc,
    //           user_info: { ...acc.user_info, [cur]: _post[cur] }, //use_info로 묶어주려고
    //         };
    //       }
    //       return { ...acc, [cur]: _post[cur] };
    //     },
    //     { id: doc.id, user_info: {} }
    //   ); //_post 에는 id 안들어 있으니 딕셔너리 형태로 형태 만들기

    //   post_list.push(post);
    // });

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

    dispatch(setPost(post_list));
  };
};

const addPostFB = (contents = "") => {
  return async function (dispatch, getState, { history }) {
    const postDB = await getDocs(collection(db, "post"));
    const _user = getState().user.user;

    // console.log(_user);

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

    const _image = getState().image.preview;

    const _uploadImage = ref(
      storage,
      `images/${user_info.user_id}_${new Date().getTime()}`
    );

    uploadString(_uploadImage, _image, "data_url").then((snapshot) => {
      getDownloadURL(_uploadImage)
        .then((url) => {
          console.log(url);
          console.log(typeof url);

          return url;
        })
        .then((url) => {
          const post_list = { ...user_info, ..._post, image_url: url };
          try {
            const docRef = addDoc(collection(db, "post"), post_list);
            const post = {
              ...user_info,
              ..._post,
              id: docRef.id,
              image_url: url,
            };

            // console.log(post);
            dispatch(addPost(post));
            history.replace("/");

            dispatch(imageActions.setPreview(null));
          } catch (e) {
            window.alert("앗! 포스트 작성에 문제가 있어요!");
            console.log("post 작성에 실패했어요!", e);
          }
        })
        .catch((err) => {
          window.alert("앗! 이미지 업로드에 문제가 있어요!");
          console.log("앗! 이미지 업로드에 문제가 있어요!", err);
        });
    });
  };
};

//변수에 값을 지정하는 이유는, 혹시나 값이 안들어오면 튕겨내기 위함.
const editPostFB = (post_id = null, post = {}) => {
  return function (dispatch, getState, { history }) {
    if (!post_id) {
      console.log("게시물 정보가 없어요!");
      return;
    }
    const _image = getState().image.preview;

    const _post_idx = getState().post.list.findIndex((p) => p.id === post_id);
    const _post = getState().post.list[_post_idx];
    // console.log(_post);

    const postDB = doc(collection(db, "post"), post_id);
    console.log(postDB);

    if (_image === _post.image_url) {
      updateDoc(postDB, post).then((doc) => {
        dispatch(editPost(post_id, { ...post }));
        history.replace("/");
      });

      return;
    } else {
      const user_id = getState().user.user.uid;
      const _image = getState().image.preview;

      const _uploadImage = ref(
        storage,
        `images/${user_id}_${new Date().getTime()}`
      );

      uploadString(_uploadImage, _image, "data_url").then((snapshot) => {
        getDownloadURL(_uploadImage)
          .then((url) => {
            // console.log(url);
            // console.log(typeof url);

            return url;
          })
          .then((url) => {
            updateDoc(postDB, { image_url: url }).then((doc) => {
              dispatch(editPost(post_id, { ...post, image_url: url }));
              history.replace("/");
            });
          })
          .catch((err) => {
            window.alert("앗! 이미지 업로드에 문제가 있어요!");
            console.log("앗! 이미지 업로드에 문제가 있어요!", err);
          });
      });
    }
  };
};

const getOnePostFB = (id) => {
  return function (dispatch, getState, { history }) {
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

      dispatch(setPost([post])); //paging은 무한스크롤때 하는 듯
    });
  };
};

//Reducer
export default handleActions(
  {
    [SET_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list.push(...action.payload.post_list);

        //중복제거: 위에서 포스트를 한개 가져온 상황에서, 만약에 내가 목록페이지로 돌아가면 다시 리스트를 가지고 오는데, 그때 위에서 가져온 포스트가 중복값으로 있을 수 있다.
        draft.list = draft.list.reduce((acc, cur) => {
          if (acc.findIndex((a) => a.id === cur.id) === -1) {
            return [...acc, cur];
          } else {
            //중복되는 값을 cur값으로 덮어씌우기
            acc[acc.findIndex((a) => a.id === cur.id)] = cur;
            return acc;
          }
        }, []);
      }),

    [ADD_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list.unshift(action.payload.post);
      }),
    [EDIT_POST]: (state, action) =>
      produce(state, (draft) => {
        let idx = draft.list.findIndex((p) => {
          return p.id === action.payload.post_id;
        });
        draft.list[idx] = { ...draft.list[idx], ...action.payload.post };
      }),
  },
  initialState
);

const actionCreators = {
  setPost,
  addPost,
  editPost,
  getPostFB,
  addPostFB,
  editPostFB,
  getOnePostFB,
};

export { actionCreators };
