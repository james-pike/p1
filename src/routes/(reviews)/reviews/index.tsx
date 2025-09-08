import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

import Reviews from "~/components/Reviews";
import { getReviews, Review, tursoClient } from "~/lib/turso";

export const useReviewsLoader = routeLoader$<Review[]>(async (event) => {
  const client = await tursoClient(event);
  const reviews = await getReviews(client);
  console.log("Fetched reviews:", reviews); // 👈 debug
  return reviews;
});


export default component$(() => {
    const reviewsData = useReviewsLoader();
  
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  return (
  <Reviews reviewsData={reviewsData.value} />
  );
});
