import { COOKIE_TABLE } from "@spaceorder/db/constants/cookieTable.const";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { pathToQueryKey } from "@spaceorder/api/utils/pathToQueryKey";
import NavLogoLink from "./components/NavLogoLink";
import NavTableNumber from "./components/NavTableNumber";
import { StoreContext } from "@spaceorder/db/types/session.type";
import { Cart } from "@spaceorder/db/types/cart.type";
import { PublicOrderWithItem } from "@spaceorder/db/types/publicModel.type";
import { cookies } from "next/headers";
import SyncDaemon from "./components/daemon/SyncDaemon";

const STORE_CONTEXT_PATH = "/stores/v1/sessions/me/store-context";
const CART_LIST_PATH = "/carts/v1/sessions/carts";
const ORDER_HISTORY = "/orders/v1/sessions/orders";
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default async function NavigatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionToken = (await cookies()).get(COOKIE_TABLE.SESSION_TOKEN)?.value;

  const queryClient = new QueryClient();

  if (sessionToken) {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: pathToQueryKey(STORE_CONTEXT_PATH),
        queryFn: async () =>
          fetchWithSessionToken<StoreContext>(STORE_CONTEXT_PATH, sessionToken),
        staleTime: 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: pathToQueryKey(CART_LIST_PATH),
        queryFn: async () =>
          fetchWithSessionToken<Cart>(CART_LIST_PATH, sessionToken, {
            throwError: false,
          }),
        staleTime: 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: pathToQueryKey(ORDER_HISTORY),
        queryFn: async () =>
          fetchWithSessionToken<PublicOrderWithItem<"Wide">[]>(
            ORDER_HISTORY,
            sessionToken,
            {
              throwError: false,
            }
          ),
        staleTime: 60 * 1000,
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <header className="flex flex-col items-center sticky bg-white top-0 z-10">
        <nav className="w-full h-12 flex items-center justify-between px-4">
          <NavLogoLink />
          <NavTableNumber />
        </nav>
      </header>
      <main>
        <SyncDaemon />
        {children}
      </main>
    </HydrationBoundary>
  );
}

async function fetchWithSessionToken<ResponseType>(
  url: string,
  sessionToken: string,
  option?: { throwError: boolean }
): Promise<ResponseType> {
  const response = await fetch(`${baseUrl}${url}`, {
    headers: {
      Cookie: `${COOKIE_TABLE.SESSION_TOKEN}=${sessionToken}`,
    },
    cache: "no-store",
  });

  const { throwError = true } = option || {};

  if (throwError && !response.ok) {
    throw new Error(`Failed to fetch: ${url}, status: ${response.status}`);
  }

  return response.json();
}
