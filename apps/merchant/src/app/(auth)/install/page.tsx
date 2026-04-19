import { redirect } from "next/navigation";
import { shopify } from "@/lib/shopify";

type SearchParams = Promise<{ shop?: string; hmac?: string; timestamp?: string }>;

export default async function InstallPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const shop = params.shop;

  if (!shop) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Install BuyEase
          </h1>
          <form action="/install" method="get">
            <input
              name="shop"
              type="text"
              placeholder="your-store.myshopify.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Install App
            </button>
          </form>
        </div>
      </main>
    );
  }

  const authRoute = await shopify.auth.begin({
    shop,
    callbackPath: "/callback",
    isOnline: false,
    rawRequest: new Request(`https://${process.env.SHOPIFY_APP_URL}/install?shop=${shop}`),
  });

  redirect(authRoute.headers.get("Location") ?? "/");
}
