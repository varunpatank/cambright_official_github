// v.0.0.01 salah

"use client";

import { Chapter, NoteChapter } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { CheckCheck, Grip, Pencil, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChaptersListProps {
  items: NoteChapter[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}

export const ChaptersList = ({
  items,
  onReorder,
  onEdit,
}: ChaptersListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [chapters, setChapters] = useState(items);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setChapters(items);
  }, [items]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(chapters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedChapters = items.slice(startIndex, endIndex + 1);

    setChapters(items);
    const bulkUpdateData = updatedChapters.map((chapter) => ({
      id: chapter.id,
      position: items.findIndex((item) => item.id === chapter.id),
    }));
    onReorder(bulkUpdateData);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="chapters">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {chapters.map((chapter, index) => (
              <Draggable
                key={chapter.id}
                draggableId={chapter.id}
                index={index}
              >
                {(provided) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2 bg-n-7 border border-n-6 rounded-md text-sm mb-4 text-n-1",
                      chapter.isPublished &&
                        "bg-[#210337] border-purple-950 text-white"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={cn(
                        "px-2 py-3 border-r border-r-n-6 hover:bg-n-5 rounded-l-md transition",
                        chapter.isPublished &&
                          "border-r-n-7 hover:bg-purple-900"
                      )}
                      {...provided.dragHandleProps}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    <div className="flex-1">{chapter.title}</div>
                    <div className="flex items-center gap-2 pr-2 flex-wrap lg:flex-nowrap">
                      {/* Badge container */}
                      <div className="flex lg:flex-row flex-col items-start lg:items-center">
                        <Badge
                          className={cn(
                            "bg-slate-500 text-n-7 lg:mb-0 lg:mt-0 mb-2 mt-1 pointer-events-none",
                            chapter.isPublished && "bg-green-700 text-white"
                          )}
                        >
                          {chapter.isPublished && (
                            <>
                              <CheckCheck className="w-4 h-4 mr-[0.3rem]" />{" "}
                              Published
                            </>
                          )}
                          {!chapter.isPublished && <>Draft</>}
                        </Badge>
                        {chapter.sessionlink !== null && (
                          <Badge
                            className={cn(
                              "bg-blue-700 text-white lg:mb-0 lg:mt-0 mb-2 mt-1 ml-2 pointer-events-none"
                            )}
                          >
                            <PlayCircle className="w-4 h-4 mr-[0.3rem]" />
                            Meeting
                          </Badge>
                        )}
                      </div>
                      <div className="ml-auto">
                        <Pencil
                          onClick={() => onEdit(chapter.id)}
                          className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
