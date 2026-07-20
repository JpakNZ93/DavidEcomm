import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { InspirationGrid } from "@/components/homepage/inspiration-grid";
import { getInspirationImages } from "@/lib/homepage";

export default async function InspirationPage() {
  const images = await getInspirationImages();

  return (
    <div className="section-space">
      <div className="site-shell space-y-8">
        <Breadcrumbs items={[{ label: "Inspiration" }]} />
        <section className="rounded-md bg-gray-50 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-500">
            Gallery
          </p>
          <h1 className="mt-3 font-heading text-4xl text-gray-900 md:text-5xl">
            Inspiration
          </h1>
          <p className="mt-4 max-w-2xl text-base text-gray-600">
            Explore styled spaces, premium finishes and product pairings across bathrooms, kitchens and laundries.
          </p>
        </section>
      </div>
      <InspirationGrid images={images} title="Styled spaces" />
    </div>
  );
}
