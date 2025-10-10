"use client";

import React from "react";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/utils/trpc/index.client";

const DashboardNotesListView = React.memo(() => {
  const trpc = useTRPC();

  const queryOfMemos = useQuery(trpc.notes.getListMemos.queryOptions());
  const queryOfArticles = useQuery(trpc.notes.getListArticles.queryOptions());

  console.log({
    queryOfMemos,
    queryOfArticles,
  });

  return <>DashboardNotesListView</>;
});

DashboardNotesListView.displayName = "DashboardNotesListView";
export default DashboardNotesListView;
