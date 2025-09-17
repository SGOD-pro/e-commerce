  export const GRAPHQL_ENDPOINT = 'http://localhost:8000/products/graphql';
  export async function graphqlRequest<T>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data;
    } catch (error) {
      console.error('GraphQL Request Error:', error);
      throw error;
    }
  }

export const PRODUCTS_QUERY = `
  query GetProducts(
    $categories: [String!]
    $minPrice: Float
    $maxPrice: Float
    $minRating: Float
    $ratingNumber:Int
    $search: String
    $sortBy: String
    $sortDir: Int
    $limit: Int
    $offset: Int
  ) {
    products(
      categories: $categories
      minPrice: $minPrice
      maxPrice: $maxPrice
      minRating: $minRating
      ratingNumber:$ratingNumber
      search: $search
      sortBy: $sortBy
      sortDir: $sortDir
      limit: $limit
      offset: $offset
    ) {
      id
      title
      description
      features
      categories
      store
      brand
      material
      color
      averageRating
      ratingNumber
      price
      images {
        large
        variant
      }
    }
  }
`;


export const PRODUCT_BY_ID_QUERY = `
  query GetProductById($id: ID!) {
    productById(id: $id) {
      id
      title
      description
      features
      categories
      store
      brand
      material
      color
      averageRating
      ratingNumber
      price
      images {
        thumb
        large
        variant
        hiRes
      }
    }
  }
`;
export const PRODUCTS_COUNT_QUERY = `
  query GetProductsCount(
    $categories: [String!]
    $minPrice: Float
    $maxPrice: Float
    $minRating: Float
    $search: String
  ) {
    productsCount(
      categories: $categories
      minPrice: $minPrice
      maxPrice: $maxPrice
      minRating: $minRating
      search: $search
    )
  }
`;
export const ALL_CATEGORIES_QUERY = `
  query GetAllCategories {
  allCategories {
    name
    count
    image
  }
}

`;
