import { getAllListings } from "~/services/listingsService";
import type { Route } from "./+types/sitemap";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const listings = await getAllListings();
    const baseUrl = "https://baltic-auto.net";

    const staticUrls = [
      "",
      "/businesses",
      "/about",
      "/pricing",
      "/privacy-policy",
      "/terms-of-service",
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static Pages
    staticUrls.forEach(url => {
      xml += `  <url>\n    <loc>${baseUrl}${url}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${url === "" ? "1.0" : "0.8"}</priority>\n  </url>\n`;
    });

    // Dynamic Listings
    listings.forEach(listing => {
      const id = listing.id;
      const lastMod = listing.createdAt ? (typeof listing.createdAt === "string" ? listing.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]) : new Date().toISOString().split("T")[0];

      xml += `  <url>\n    <loc>${baseUrl}/listing/${id}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
