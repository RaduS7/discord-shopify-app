const getSubscriptionQuery = async (ctx, accessToken, shop, gid) => {

  const query = JSON.stringify({
    query: `query {
      node(id: "${gid}") {
        ...on AppSubscription {          
          createdAt
          currentPeriodEnd
          id
          name
          status
          test
          lineItems {
            plan {
              pricingDetails {
                ...on AppRecurringPricing {
                  interval
                  price {
                    amount
                    currencyCode
                  }
    
                }  
              }
            }
          }
        }
      }
    }`
  });

  const response = await fetch(`https://${shop}/admin/api/2020-07/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "X-Shopify-Access-Token": accessToken,
    },
    body: query
  })

  const responseJson = await response.json();

  return responseJson
}

module.exports = getSubscriptionQuery;