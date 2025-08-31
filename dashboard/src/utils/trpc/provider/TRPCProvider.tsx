"use client";

import { createTRPCContext as createTRPCContextByTanstackQuery } from "@trpc/tanstack-react-query";
import type { TRPCAppRouter } from "../router";

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContextByTanstackQuery<TRPCAppRouter>();
