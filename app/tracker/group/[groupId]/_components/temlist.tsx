import React from "react";
import { TemplateSprintList } from "./sprint-list-templates";
import { useSearchParams } from "next/navigation";

const Temlist = async ({
  searchParams,
}: {
  searchParams?: { [key: string]: string | "" };
}) => {
  // Extract 'title' from the query parameters if available
  const titleFilter = searchParams?.title || undefined;

  return (
    <div>
      <TemplateSprintList titleFilter={titleFilter} />
    </div>
  );
};

export default Temlist;
