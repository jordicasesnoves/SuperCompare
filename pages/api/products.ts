// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

type Product = {
  id: string
  name: string
  brand: string
  price: number
  description?: string
  imageURL: string
  supermarket: 'mercadona' | 'consum'
  size?: number
  sizeFormat?: 'kg' | 'l'
}

type Data = {
  results: {
    consum: number
    mercadona: number
  }
  resultsCount: number
  products: Product[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { query } = req

  /* URL Params */
  const { q } = query

  const consumUrl = `https://tienda.consum.es/api/rest/V1.0/catalog/product?q=${q}`
  const { data: consumData } = await axios.get(consumUrl, {
    headers: {
      'x-tol-zone': '0'
    }
  })

  const mercadonaUrl = `https://7uzjkl1dj0-dsn.algolia.net/1/indexes/products_prod_vlc1_es/query?x-algolia-agent=Algolia%20for%20JavaScript%20(3.35.1)%3B%20Browser&x-algolia-application-id=7UZJKL1DJ0&x-algolia-api-key=9d8f2e39e90df472b4f2e559a116fe17`
  const { data: mercadonaData } = await axios.post(
    mercadonaUrl,
    `{"params":"query=${q}"}`,
    {
      headers: { 'Content-Type': 'text/plain' }
    }
  )

  console.log(consumData.products[0])

  // id, name, price, brand, image, supermarket
  const consumParsedData: Product[] = consumData.products.map(
    (product: any) => {
      const name = product.productData.name
      const desc = product.productData.description
      const sizeAndFormat = desc.replace(name, '')

      // find 'L' 'ml' 'kg' 'g'
      const sizeFormat = sizeAndFormat.match(/[lkgmg]/g)
      console.log(sizeFormat)
      return {
        id: product.id,
        name: product.productData.name,
        brand: product.productData.brand.name,
        price: parseFloat(
          product.priceData.prices[0].value.centAmount.toFixed(2)
        ),
        /*         size: product.productData.description.. */
        description: product.productData.description,
        imageURL: product.productData.imageURL,
        supermarket: 'consum'
      }
    }
  )

  const mercadonaParsedData: Product[] = mercadonaData.hits.map(
    (product: any) => ({
      id: parseInt(product.id),
      name: product.display_name,
      brand: product.brand,
      price: parseFloat(product.price_instructions.unit_price),
      size: product.price_instructions.unit_size,
      sizeFormat: product.price_instructions.size_format,
      imageURL: product.thumbnail,
      supermarket: 'mercadona'
    })
  )

  const results = {
    consum: consumParsedData.length,
    mercadona: mercadonaData.nbHits
  }

  const resultsCount = consumParsedData.length + mercadonaData.nbHits
  const products = [...consumParsedData, ...mercadonaParsedData]
  res
    .status(200)
    .json({ results: results, resultsCount: resultsCount, products: products })
}
