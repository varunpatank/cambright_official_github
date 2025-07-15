// v.0.0.01 salah

"use client";

import { Course } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  CheckCheck,
  GitPullRequestDraft,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { id } = row.original;
      const title = row.getValue("title") || null;
      return (
        <>
          {title && (
            <Link href={`/tutor/courses/${id}`}>
              <Button
                className={
                  "bg-purple-950 hover:bg-purple-900 text-white line-clamp-1"
                }
              >
                {`${title}`}
              </Button>
            </Link>
          )}
          {!title && <p className="text-muted-foreground">none</p>}
        </>
      );
    },
  },
  {
    accessorKey: "sessionlink",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Meeting
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const meetingLink = row.getValue("sessionlink") || null;
      return (
        <>
          {meetingLink && (
            <Link href={meetingLink} rel="noopener noreferrer" target="_blank">
              <Button className={"bg-blue-900 hover:bg-blue-700 text-white"}>
                Join
              </Button>
            </Link>
          )}
          {!meetingLink && <p className="text-muted-foreground">none</p>}
        </>
      );
    },
  },
  {
    accessorKey: "isPublished",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished") || false;
      return (
        <Badge
          className={cn(
            "bg-slate-500 text-n-8 lg:mb-0 lg:mt-0 mb-2 mt-1 pointer-events-none",
            isPublished && "bg-green-700 text-white"
          )}
        >
          {isPublished && (
            <>
              <CheckCheck className="w-4 h-4 mr-[0.3rem]" /> Published
            </>
          )}
          {!isPublished && (
            <>
              <GitPullRequestDraft className="w-4 h-4 mr-[0.3rem]" /> Draft
            </>
          )}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { id } = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="h-4 w-8 p-0
                 hover:bg-slate-800
                            bg-n-7
                 "
              variant={"default"}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/tutor/courses/${id}`}>
              <DropdownMenuItem className="cursor-pointer">
                <Pencil
                  onClick={() => {}}
                  className="w-4 h-4 cursor-pointer hover:opacity-75 transition mr-2"
                />{" "}
                Edit
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
