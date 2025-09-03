function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL || "https://movopayment.vercel.app";

  return Response.json({
    accountAssociation: {
      header: "eyJmaWQiOjkyODc1NiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDMzRmZlYjlmYmI5NjBERDZDNzBGYTlhYjljMjU0NjhFZkM1M2YwMzcifQ",
      payload: "eyJkb21haW4iOiJtb3ZvcGF5bWVudC52ZXJjZWwuYXBwIn0",
      signature: "MHgxNmE2NWExMzY2OTVlYmRlMjg3MWZlNTk3NmZlZjYxODg5MGI2MTU1NDNiYzMyOTU2NTcwNjg0NDljOWIwYzFkMDhmN2FkZmM3ODFkMDZkZjlmNjEwZGIyZTEzZjZmNTI4NTE2MDAxMzRmNGMxZTA3MDE3NWEyODRiNmJlZTU1ZjFj"
    },
    miniapp: withValidProperties({
      version: "1",
      name: "MovoPayment",
      subtitle: "Multi-chain crypto bridge",
      description: "Swap crypto seamlessly across multiple blockchains. Send tokens to anyone, anywhere, and let them convert to fiat instantly.",
      iconUrl: `${URL}/icon.png`,
      splashImageUrl: `${URL}/splash.png`,
      splashBackgroundColor: "#000000",
      homeUrl: URL,
      primaryCategory: "finance",
      tags: ["crypto", "payment", "bridge", "multi-chain", "defi"],
      heroImageUrl: `${URL}/hero.png`,
      tagline: "Multi-chain crypto bridge",
      ogTitle: "MovoPayment",
      ogDescription: "Swap crypto seamlessly across multiple blockchains",
      ogImageUrl: `${URL}/hero.png`,
      requiredChains: ["eip155:1", "eip155:137", "eip155:56", "eip155:8453"],
      requiredCapabilities: ["wallet.getEthereumProvider", "actions.signIn"]
    }),
  });
}
