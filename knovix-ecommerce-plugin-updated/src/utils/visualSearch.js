// Lightweight, on-device "search by photo".
//
// There's no product-recognition API behind this catalog, so rather than
// faking a match, this does a real (if simple) image comparison entirely
// in the browser: it samples the average color of the shopper's photo and
// of each product photo, then ranks the catalog by how close those colors
// are. It's an honest "visually similar" ranking, not object recognition —
// callers should present it that way (see Shop.jsx's visual-search notice).

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // Needed to read pixel data back out of the canvas for images that
    // aren't same-origin (our product photos are served from Unsplash).
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Could not load image: ${src}`))
    img.src = src
  })
}

// Downsamples the image onto a tiny canvas and averages every pixel's RGB —
// cheap, and stable to cropping/resizing differences between photos.
function averageColorFromImage(img, size = 16) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, size, size)

  const { data } = ctx.getImageData(0, 0, size, size)
  let r = 0
  let g = 0
  let b = 0
  let count = 0
  for (let i = 0; i < data.length; i += 4) {
    // Skip fully transparent pixels so they don't drag the average toward black.
    if (data[i + 3] === 0) continue
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
    count++
  }
  if (count === 0) return [255, 255, 255]
  return [r / count, g / count, b / count]
}

async function averageColorFromSrc(src) {
  const img = await loadImage(src)
  return averageColorFromImage(img)
}

function colorDistance([r1, g1, b1], [r2, g2, b2]) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

// Ranks `products` by visual closeness to the photo at `photoSrc` (a data
// URL or any loadable image URL). Products whose image can't be analyzed
// (network hiccup, blocked CORS, etc.) are pushed to the end rather than
// dropped, so the shopper still sees the full catalog.
export async function rankProductsByPhoto(photoSrc, products) {
  const targetColor = await averageColorFromSrc(photoSrc)

  const scored = await Promise.all(
    products.map(async (product) => {
      try {
        const color = await averageColorFromSrc(product.image)
        return { product, distance: colorDistance(targetColor, color) }
      } catch {
        return { product, distance: Infinity }
      }
    })
  )

  return scored
    .sort((a, b) => a.distance - b.distance)
    .map((entry) => entry.product)
}
