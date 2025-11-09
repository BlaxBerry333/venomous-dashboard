"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { useQuery } from "@tanstack/react-query";
import { Card, Icon, Space, Typography } from "venomous-ui-react/components";

import { ROUTER_PATHS } from "@/client/routes";
import { useI18nLocale } from "@/utils/i18n/index.client";
import { useTRPC } from "@/utils/trpc/index.client";

const DashboardNotesListView = React.memo(() => {
  const router = useRouter();

  const { currentLocale } = useI18nLocale();

  const trpc = useTRPC();

  const queryOfMemos = useQuery(
    trpc.notes.getListMemos.queryOptions(undefined, {
      select: (data) => data.sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1)),
    }),
  );

  const queryOfArticles = useQuery(trpc.notes.getListArticles.queryOptions());

  console.log({
    queryOfMemos,
    queryOfArticles,
  });

  return (
    <Space.Grid columns={{ XS: 1, SM: 2, MD: 3, LG: 4, XL: 5, XXL: 6 }} spacing={16}>
      {queryOfMemos.data?.map((memo) => (
        <Card
          key={memo.id}
          onClick={() => router.push(`/${currentLocale}${ROUTER_PATHS.DASHBOARD.NOTES_DETAIL}?id=${memo.id}`)}
          style={{ width: "100%", height: 100, backgroundColor: memo.color, color: "#000000" }}
        >
          {memo.isPinned && <Icon icon="solar:pin-bold-duotone" width={24} style={{ color: "inherit", position: "absolute", top: 4, right: 4 }} />}
          <Typography.Paragraph ellipsis={3} style={{ color: "inherit" }} text={memo.content} />
        </Card>
      ))}
    </Space.Grid>
  );
});

DashboardNotesListView.displayName = "DashboardNotesListView";
export default DashboardNotesListView;
