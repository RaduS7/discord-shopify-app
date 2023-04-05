const getStorePlan = async (ctx, accessToken, shop) => {
    const query = JSON.stringify({
        query: `{
        shop {
            name
            email
            plan {
              partnerDevelopment
            }
          }
      }`
    });

    // const response = await fetch(`https://${shop}/admin/api/2020-07/shop.json`, {
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         "X-Shopify-Access-Token": accessToken,
    //     },
    // })

    const response = await fetch(`https://${shop}/admin/api/2020-07/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "X-Shopify-Access-Token": accessToken,
        },
        body: query
    })

    const responseJson = await response.json();

    //console.log(responseJson)
    //console.log(responseJson.data.shop.plan)

    return {
        partnerDevelopment: responseJson.data.shop.plan.partnerDevelopment,
        email: responseJson.data.shop.email
    }
};

module.exports = getStorePlan;