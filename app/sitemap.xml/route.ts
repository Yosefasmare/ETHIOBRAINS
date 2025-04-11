// app/sitemap.xml/route.ts
export async function GET() {
    const baseUrl = "https://ethiobrains.vercel.app";
  
    const routes = [
      "", // homepage
      "about",
      "privacy",
      "terms",
      "auth"
      // Add more routes as needed
    ];
  
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${routes
        .map(
          (route) => `
        <url>
          <loc>${baseUrl}/${route}</loc>
          <changefreq>weekly</changefreq>
          <priority>${route === "" ? "1.0" : "0.8"}</priority>
        </url>
      `
        )
        .join("")}
    </urlset>`;
  
    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }
  