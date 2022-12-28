import React from "react";
import StoryWrapper from "./StoryWrapper";

const SmallStoryWrapper: typeof StoryWrapper = (props) => {
  return (
    <StoryWrapper
      {...props}
      style={{ minHeight: "none" }}
      showForceRefresh={false}
    />
  );
};

export default SmallStoryWrapper;
