import React from "react";
// import Grid from "../elements/Grid";
// import Image from "../elements/Image";
// import Text from "../elements/Text";
import { Grid, Image, Text } from "../elements";

const Post = (props) => {
  return (
    <React.Fragment>
      <Grid>
        <Grid is_flex>
          <Image shape="circle" src={props.src} />
          <Text bold> {props.user_info.user_name}</Text>
          <Text>{props.insert_dt}</Text>
        </Grid>
        <Grid padding="16px">
          <Text>{props.contents}</Text>
        </Grid>
        <Grid>
          <Image shape="rectangle" src={props.src} />
        </Grid>
        <Grid padding="16px">
          <Text bold>댓글 {props.comment_cnt}개</Text>
        </Grid>

        <div>
          user profile / user naeme / insert_dt / is_me (edit btn: 로그인할때)
        </div>
        <div>contents</div>
        <div>image</div>
        <div>comment cnt</div>
      </Grid>
    </React.Fragment>
  );
};

Post.defaultProps = {
  user_info: {
    user_name: "hyeri",
    user_profile: "https://t1.daumcdn.net/cfile/blog/254E103A5523680A14",
  },
  image_url: "https://t1.daumcdn.net/cfile/blog/254E103A5523680A14",
  contents: "고양이네요!",
  comment_cnt: 10,
  insert_dt: "2022-05-01 10:00:00",
};

export default Post;
