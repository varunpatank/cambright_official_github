// v0.0.01 salah

import { useCallback, useEffect, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@videojs/themes/dist/forest/index.css";

interface PlayerProps {
  techOrder: string[];
  autoplay: boolean;
  controls: boolean;
  onReady?: () => void;
  onEnded?: () => void; // This should be fine as void
  sources: {
    src: string;
    type: string;
  }[];
}

const Player = (props: PlayerProps) => {
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  const onVideo = useCallback((el: HTMLVideoElement) => {
    setVideoEl(el);
  }, []);

  useEffect(() => {
    if (videoEl == null) {
      return;
    }

    const player = videojs(videoEl, {
      ...props,
      controlBar: {},
      // Add better error handling for MinIO videos
      html5: {
        vhs: {
          overrideNative: true,
        },
        nativeVideoTracks: false,
        nativeAudioTracks: false,
        nativeTextTracks: false,
      },
      // Handle CORS and loading issues
      preload: 'metadata',
      responsive: true,
      fluid: true,
    });

    player.on("loadeddata", () => {
      console.log("Video loaded successfully");
      if (props.onReady) {
        props.onReady(); // Call the onReady callback
      }
    });
    
    player.on("error", (e: any) => {
      console.error("Video player error:", e);
      console.error("Error details:", player.error());
    });
    
    player.on("ended", () => {
      if (props.onEnded) {
        props.onEnded(); // Call the onEnded callback
      }
    });
    
    // Handle player cleanup and reset when props change
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
      }
    };
  }, [props, videoEl]);

  useEffect(() => {
    if (videoEl && videoEl.src !== props.sources[0].src) {
      videoEl.src = props.sources[0].src; // Update source
    }
  }, [props.sources, videoEl]);

  return (
    <div data-vjs-player>
      <video
        ref={onVideo}
        className="video-js vjs-theme-forest vjs-16-9"
        playsInline
      />
    </div>
  );
};

export default Player;
