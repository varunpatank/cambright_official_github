import { useEffect, useState } from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
  shouldLoadMore: boolean;
  loadMore: () => void;
  count: number;
};

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoadMore,
  loadMore,
  count,
}: ChatScrollProps) => {
  const [lastScrollTop, setLastScrollTop] = useState<number>(0);

  useEffect(() => {
    const topDiv = chatRef.current;

    if (!topDiv) return;

    const handleScroll = () => {
      const scrollTop = topDiv.scrollTop;
      const scrollDifference = lastScrollTop - scrollTop;
      const scrollHeight = topDiv.scrollTop;
      const scrollto = window.scrollY + window.innerHeight;
      const reached = topDiv.scrollHeight === scrollto;

      console.log("Scroll event fired");
      console.log("scrollTop:", scrollTop);
      console.log("scrollDifference:", scrollDifference);
      console.log("scroller:", scrollHeight);

      // Load more messages if the user has scrolled up by more than 290 pixels
      if (scrollTop === scrollHeight && shouldLoadMore) {
        console.log("Loading more messages in 2 seconds...");
        setTimeout(() => {
          loadMore();
        }, 250);
      }

      setLastScrollTop(scrollTop);
    };

    topDiv.addEventListener("scroll", handleScroll);

    return () => {
      topDiv.removeEventListener("scroll", handleScroll);
    };
  }, [shouldLoadMore, loadMore, chatRef, lastScrollTop]);

  useEffect(() => {
    const topDiv = chatRef.current;

    if (!topDiv) return;

    if (count > 0) {
      // Scroll to the bottom when new messages are loaded
      topDiv.scrollTop = topDiv.scrollHeight;
      console.log("Scrolling to the bottom");
    }
  }, [count, chatRef]);
};
