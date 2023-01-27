import App from 'next/app';
import Head from 'next/head';
import { AppProvider } from '@shopify/polaris';
import { Provider } from '@shopify/app-bridge-react';
import '@shopify/polaris/styles.css';
import translations from '@shopify/polaris/locales/en.json';
import Cookies from 'js-cookie';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import React from 'react';

const client = new ApolloClient({
  fetchOptions: {
    credentials: 'include',
  }
});

class MyApp extends App {

  static async getInitialProps(server) {
    var shopOrigin = server.ctx.query.shop
    return { shopOrigin }
  }

  render() {
    var { Component, pageProps, shopOrigin } = this.props;
    //console.log(shopOrigin)
    if (Cookies.get("shopOrigin") != undefined) {
      shopOrigin = Cookies.get("shopOrigin")
      //console.log("---------")
      //console.log("Il aveam")
      //console.log("---------")
    }
    else {
      Cookies.set("shopOrigin", shopOrigin, {
        httpOnly: false,
        secure: true,
        sameSite: 'none'
      })
      //this.setState({ refreshed: true })
      //console.log("---------")
      //console.log("L-am setat acum")
      //console.log("---------")
    }

    const config = { apiKey: API_KEY, shopOrigin, forceRedirect: true };

    return (
      <React.Fragment>
        <Head>
          <title>Discordify</title>
          <meta charSet="utf-8" />
        </Head>
        <Provider config={config}>
          <AppProvider i18n={translations}>
            <ApolloProvider client={client}>
              <Component {...pageProps} />
            </ApolloProvider>
          </AppProvider>
        </Provider>
      </React.Fragment>
    );
  }
}

export default MyApp;
