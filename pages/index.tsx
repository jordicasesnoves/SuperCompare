import type { NextPage } from 'next'
import { RESPONSE_LIMIT_DEFAULT } from 'next/dist/server/api-utils'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const Home: NextPage = () => {
  const router = useRouter()
  const { q } = router.query
  const [query, setQuery] = useState(q || '')
  const [products, setProducts] = useState<any[]>([])
  const [results, setResults] = useState<number>(0)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value as string)
  }

  const handleSearch = (): void => {
    router.push(`/?q=${query}`)
  }

  useEffect(() => {
    if (q) {
      setQuery(q || '')
      fetch(`/api/products?q=${q}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data)
          setResults(data.resultsCount)
          setProducts(data.products)
        })
    } else {
      setProducts([])
      setResults(0)
    }
  }, [q])

  return (
    <div className="bg-gray-100">
      <Head>
        <title>SuperCompare</title>
        <meta
          name="description"
          content="Compare prices between different supermarkets"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="max-w-7xl mx-auto py-16">
        <main>
          <h1 className="text-4xl font-bold mb-6 text-center">
            SuperCompare v0.1
          </h1>
          <div className="flex gap-x-6 gap-y-6">
            <input
              className="bg-white p-2 rounded"
              onChange={handleChange}
              onKeyDown={(e): void => {
                if (e.key === 'Enter') handleSearch()
              }}
              value={query}
              placeholder="Search for products"
            ></input>
            <button
              className="px-3 py-2 bg-sky-700 text-white rounded"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
          {results > 0 && (
            <div className="mt-6">
              <h3>
                <b>{results}</b> results found
              </h3>
            </div>
          )}
          <ul className="mt-6 flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {products?.map((product: any) => (
              <li
                className="bg-white rounded flex flex-col items-center px-4 py-2"
                key={product.id + product.supermarket}
              >
                <span>{product.supermarket}</span>
                <img src={product.imageURL} alt="product image" />
                <div className="flex flex-col">
                  <span>{product.name}</span>
                  <span>
                    <b>{product.price}€</b>
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <section>
            {results === 0 && (
              <div className="flex flex-col items-start">
                <h2 className="text-2xl font-bold">
                  No results found {q && `for '${q}'`}
                </h2>
                <p className="text-gray-600">
                  Use the search bar above to find products
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default Home
