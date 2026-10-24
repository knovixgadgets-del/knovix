# Knovix home banner kit

1. Copy `public/banners/` into your frontend project's `public/` folder (offline fallback images).
2. Copy `src/components/HomeBannerCarousel.jsx` and `.css` into `src/components/`.
3. On the home page, replace the old banner/hero block with:

       import HomeBannerCarousel from '../components/HomeBannerCarousel';
       ...
       <HomeBannerCarousel />

The slides come from the backend (`/wp-json/knovix/v1/banners`) - change them in
wp-admin > WooCommerce > Knovix Banners. It uses `react-router-dom` for internal links
and `VITE_API_BASE_URL` for the backend address.
