require('isomorphic-fetch')
const dotenv = require('dotenv')
const Koa = require('koa')
const KoaRouter = require('koa-router')
const cors = require('koa2-cors')
const send = require('koa-send')
const next = require('next')
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth')
const { verifyRequest } = require('@shopify/koa-shopify-auth')
const { receiveWebhook, registerWebhook } = require('@shopify/koa-shopify-webhooks');
const session = require('koa-session')
const koaBody = require('koa-body')
dotenv.config();
const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy')
const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy')

const getSubscriptionUrl = require('./requests/getSubcriptionUrl');
const getStorePlan = require('./requests/getStorePlan');
const getSubQuery = require('./requests/getSubQuery');
//const createUsageRecord = require('./requests/createUsageRecord');

const getShopID = require('./util')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const privacy = require('./privacy')

require('./db/mongoose')

const {
  SHOPIFY_API_SECRET_KEY,
  SHOPIFY_API_KEY,
  HOST
} = process.env

const server = new Koa()
const router = new KoaRouter()

const DiscordID = require('./models/discordID')
const Widget = require('./models/widget')
//const Usage = require('./models/usage')
const ShopRedact = require('./models/shopRedact')
const Billing = require('./models/billing')
const Free = require('./models/free')
const Custom = require('./models/custom')
const getShopId = require('./util')

var update = {}

// init middleware with resolver
server.use(cors({ origin: '*' }));
server.use(router.allowedMethods());
server.use(router.routes());

// server.use(async (ctx) => {
//   if (parseInt(ctx.status) === 404) {
//     ctx.status = 404
//     ctx.body = { msg: 'emmmmmmm, seems 404' };

//     ctx.redirect(`https://www.discordify.com/auth?shop=${ctx.cookies.get("shopOrigin")}`)
//   }
// })

router.get('/test-script.js', async (ctx, next) => {
  try {
    await send(ctx, 'script.js', { root: __dirname })
    //console.log(__dirname)
  } catch (e) {
    console.log(e)
  }
  await next()
})

server.use(async (ctx, next) => {
  var anext = false
  var shopID

  if (ctx.cookies.get("shopOrigin") && ctx.cookies.get("shopOrigin") == ctx.request.query.shop) {
    anext = true
    // console.log()
    // console.log("cookie = ", ctx.cookies.get("shopOrigin"))
    // console.log()
    //shopID = String(ctx.cookies.get("shopOrigin")).substr(0, String(ctx.cookies.get("shopOrigin")).length - 14);
    shopID = getShopId(ctx.cookies.get("shopOrigin"))
  }
  else if (ctx.request.query.shop) {
    // console.log()
    // console.log("Query Shop:", ctx.request.query.shop)
    // console.log()
    // console.log(ctx.request)
    //if (ctx.request.url.includes("/auth/inline") || ctx.request.url.includes("/auth/callback") || ctx.request.header.referer == 'https://partners.shopify.com/' || ctx.request.header.referer == 'https://apps.shopify.com/')
    if (ctx.request.url.includes('/test-script.js'))
      anext = false
    else
      anext = true

    shopID = getShopId(ctx.request.query.shop)
  }

  else {
    anext = true
  }

  //#region MONGODB ROUTES

  if (shopID != undefined && (update[shopID] == false || update[shopID] == undefined) && (ctx.request.query.shop != undefined || ctx.cookies.get("shopOrigin") != undefined)) {

    router.get(`/api/discordID/${shopID}`, async (ctx) => {
      try {
        const obj = await DiscordID.findOne({ shopID })
        if (obj) {
          ctx.status = 200
          ctx.body = {
            status: 'success',
            data: {
              serverID: obj.serverID,
              channelID: obj.channelID,
            }
          }
        }
        else {
          ctx.status = 400
          ctx.body = "Not found"
        }
      } catch (error) {
        ctx.status = 500
        ctx.body = error
      }
    });

    router.post(`/api/discordID/${shopID}`, koaBody(), async (ctx) => {
      if (ctx.cookies.get("shopOrigin")) {
        try {
          var obj = await DiscordID.findOne({ shopID })

          if (obj) {
            obj.serverID = ctx.request.body.serverID
            obj.channelID = ctx.request.body.channelID
            await obj.save()
            ctx.status = 200
            ctx.body = "Item Created";
          }
          else {
            const id = new DiscordID({
              serverID: ctx.request.body.serverID,
              channelID: ctx.request.body.channelID,
              shopID
            })
            await id.save()
            ctx.status = 200
            ctx.body = "Item Created";
          }
        } catch (error) {
          //console.log(error);
          ctx.status = 500
          ctx.body = error
        }
      } else {
        ctx.status = 401
        ctx.body = "Not authenticated"
      }
    })

    router.get(`/api/widget/${shopID}`, async (ctx) => {
      try {
        const obj = await Widget.findOne({ shopID })
        if (obj) {
          ctx.body = {
            status: 'success',
            data: {
              desktopPosition: obj.desktopPosition,
              mobilePosition: obj.mobilePosition,
              notificationText: obj.notificationText,
              notificationTimeout: obj.notificationTimeout,
              notificationAvatar: obj.notificationAvatar,
              mobile: obj.mobile,
              desktop: obj.desktop,
              color: obj.color,
              widgetEnabled: obj.widgetEnabled,
              shopID
            }
          }
          //console.log(obj)
        }
        else {
          ctx.body = "Not found"
        }
      } catch (error) {
        ctx.body = error
      }
    });

    router.post(`/api/widget/${shopID}`, koaBody(), async (ctx) => {
      if (ctx.cookies.get("shopOrigin")) {
        //console.log(ctx.request.body)
        try {
          var obj = await Widget.findOne({ shopID })

          if (obj) {
            obj.desktopPosition = ctx.request.body.desktopPosition
            obj.mobilePosition = ctx.request.body.mobilePosition
            obj.notificationText = ctx.request.body.notificationText
            obj.notificationTimeout = ctx.request.body.notificationTimeout
            obj.notificationAvatar = ctx.request.body.notificationAvatar
            obj.mobile = ctx.request.body.mobile
            obj.desktop = ctx.request.body.desktop
            obj.color = ctx.request.body.color
            obj.widgetEnabled = ctx.request.body.widgetEnabled
            await obj.save()
            ctx.status = 200
            ctx.body = "Item Created";
          }
          else {
            const id = new Widget({
              desktopPosition: ctx.request.body.desktopPosition,
              mobilePosition: ctx.request.body.mobilePosition,
              notificationText: ctx.request.body.notificationText,
              notificationTimeout: ctx.request.body.notificationTimeout,
              notificationAvatar: ctx.request.body.notificationAvatar,
              mobile: ctx.request.body.mobile,
              desktop: ctx.request.body.desktop,
              color: ctx.request.body.color,
              widgetEnabled: ctx.request.body.widgetEnabled,
              shopID
            })
            await id.save()
            ctx.status = 200
            ctx.body = "Item Created";
          }
        } catch (error) {
          //console.log(error);
          ctx.status = 500
          ctx.body = error
        }
      } else {
        ctx.status = 401
        ctx.body = "Not authenticated"
      }
    })

    update[shopID] = true
  }

  //#endregion

  if (anext)
    await next()
})

router.get('/favicon.ico', async (ctx) => {

  try {
    await send(ctx, 'favicon.ico', { root: __dirname })
    //console.log(__dirname)
  } catch (e) {
    console.log(e)
  }
})

router.get('/privacy', (ctx) => {
  ctx.body = privacy
})

const webhook = receiveWebhook({ secret: SHOPIFY_API_SECRET_KEY });

router.post('/webhooks/customers/redact', webhook, (ctx) => {
  console.log('received webhook customers/redact: ', ctx.state.webhook);
});

router.post('/webhooks/shop/redact', webhook, async (ctx) => {
  console.log('received webhook shop/redact: ', ctx.state.webhook);
  const sr = new ShopRedact({
    shop_id: ctx.state.webhook.payload.shop_id,
    shop_domain: ctx.state.webhook.payload.shop_domain,
  })
  await sr.save()
});

router.post('/webhooks/customers/data_request', webhook, (ctx) => {
  console.log('received webhook customers/data_request: ', ctx.state.webhook);
});

app.prepare().then(() => {
  server.use(session({ secure: true, sameSite: 'none' }, server));
  server.keys = [SHOPIFY_API_SECRET_KEY];
  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: [
        'read_products',
        'write_products',
        'read_script_tags',
        'write_script_tags',
      ],
      async afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;

        ctx.cookies.set('shopOrigin', shop, {
          httpOnly: false,
          secure: true,
          sameSite: 'none'
        });

        //const shopID = shop.substr(0, shop.length - 14);
        const shopID = getShopID(shop)

        //ROUTE CREATION
        update[shopID] = false

        var billing = (await Billing.findOne({ shopID }))

        //#region TRIAL LOGIC        
        var date_ob = new Date()

        let date = date_ob.getDate()
        let month = date_ob.getMonth() + 1
        let year = date_ob.getFullYear();

        let today = { year, month, date }

        var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

        var trial;

        if (billing != undefined && billing.first_install_date.year == today.year) {

          var dif = 0

          if (billing.first_install_date.month == today.month) {
            dif = today.date - billing.first_install_date.date
          }
          else if (today.month - billing.first_install_date.month == 1) {
            if (billing.first_install_date.month - 1 == 1 && billing.first_install_date.year % 4 == 0)
              dif = 29 - billing.first_install_date.date + today.date
            else
              dif = days[billing.first_install_date.month - 1] - billing.first_install_date.date + today.date
          }
          else {
            dif = 7
          }

          trial = 7 - dif

          if (trial < 0)
            trial = 0
        }
        else {
          trial = 7
        }

        //#endregion        

        var custom = (await Custom.findOne({ shopID }))

        const { partnerDevelopment, email } = await getStorePlan(ctx, accessToken, shop)

        if ((await Free.find({ shopID })).length > 0) {
          ctx.redirect("/");
        }
        else if (!billing) {
          var confirmationUrl, gid

          if ((await Custom.find({ shopID })).length > 0) {
            const res = await getSubscriptionUrl(ctx, accessToken, shop, partnerDevelopment, custom.trial, custom.price);
            confirmationUrl = res.confirmationUrl
            gid = res.gid
          }
          else {
            const res = await getSubscriptionUrl(ctx, accessToken, shop, partnerDevelopment, trial, 4.99);
            confirmationUrl = res.confirmationUrl
            gid = res.gid
          }

          const id = new Billing({
            first_install_date: today,
            gid,
            email,
            shopID
          })

          await id.save()

          console.log("1 ", id)
          console.log(confirmationUrl);

          ctx.redirect(confirmationUrl);
        }
        else if (((await getSubQuery(ctx, accessToken, shop, billing.gid)).data.node == null || (await getSubQuery(ctx, accessToken, shop, billing.gid)).data.node.status != "ACTIVE")) {
          var confirmationUrl, gid

          if ((await Custom.find({ shopID })).length > 0) {
            const res = await getSubscriptionUrl(ctx, accessToken, shop, (await getStorePlan(ctx, accessToken, shop)).partnerDevelopment, custom.trial, custom.price);
            confirmationUrl = res.confirmationUrl
            gid = res.gid
          }
          else {
            const res = await getSubscriptionUrl(ctx, accessToken, shop, (await getStorePlan(ctx, accessToken, shop)).partnerDevelopment, trial, 4.99);
            confirmationUrl = res.confirmationUrl
            gid = res.gid
          }

          billing.gid = gid
          await billing.save()

          console.log("2")

          console.log(confirmationUrl)

          ctx.redirect(`/redirect?confurl=${confirmationUrl}`);
        }
        else {
          console.log("3")

          ctx.redirect("/");
        }
      },
    }),
  );

  server.use(graphQLProxy({ version: ApiVersion.July20 }))
  server.use(verifyRequest());

  server.use(async (ctx) => {
    await handle(ctx.req, ctx.res);

    ctx.respond = false;
    ctx.res.statusCode = 200;

    return
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});