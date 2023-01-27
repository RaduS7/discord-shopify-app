const createUsageRecord = async (ctx, accessToken, shop, gid) => {
  const mutation = JSON.stringify({
    query: `mutation {
            appUsageRecordCreate(
              subscriptionLineItemId: "${gid}"
              description: "Discordify Plan",
              price:{ amount: 1.00, currencyCode: USD}
            ) {
              userErrors {
                field
                message
              }
              appUsageRecord {
                id
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
    body: mutation
  })

  const responseJson = await response.json();

  return responseJson
};

module.exports = createUsageRecord;