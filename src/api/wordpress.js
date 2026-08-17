const WORDPRESS_API =
  `${import.meta.env.VITE_API_BASE_URL}/wp-json/knovix/v1`;

export async function getProducts() {
  const response = await fetch(`${WORDPRESS_API}/products`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch products: ${response.status}`
    );
  }

  return response.json();
}

export async function getProduct(id) {
  const response = await fetch(
    `${WORDPRESS_API}/products/${id}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch product: ${response.status}`
    );
  }

  return response.json();
}

export async function getCategories() {
  const response = await fetch(
    `${WORDPRESS_API}/categories`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch categories: ${response.status}`
    );
  }

  return response.json();
}