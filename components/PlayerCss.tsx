// v0.0.01 salah

import Player from "./Player";

const MyVideoPage = () => {
  const videoJsOptions = {
    techOrder: ["html5"],
    autoplay: false,
    controls: true,
    sources: [
      {
        src: "...",
        type: "video/mp4",
      },
    ],
  };

  return (
    <div>
      <Player {...videoJsOptions} />
    </div>
  );
};

export default MyVideoPage;
