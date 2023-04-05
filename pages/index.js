import {
  Button,
  Card,
  Layout,
  Page,
  Stack,
  TextField,
  Banner,
  Frame,
  Toast,
} from '@shopify/polaris';
import gql from 'graphql-tag'
import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import axios from 'axios';
import Cookies from 'js-cookie';
import getShopId from '../src/util'

const CREATE_SCRIPTTAG = gql`
    mutation scriptTagCreate($input: ScriptTagInput!) {
        scriptTagCreate(input: $input) {
           scriptTag {
             id
            }
           userErrors {
            field
            message
            }
        }
    }
`

const GET_STORE = gql`
  query getStore{ 
    scriptTags(first: 5) {
      edges {
          node {
              id
              src
              displayScope
          }
      }
  }

    shop { 
      myshopifyDomain 
    }      
  }
`

const urlScriptTags = `https://www.discordify.com/test-script.js`;

function AnnotatedLayout() {
  const [createScripts] = useMutation(CREATE_SCRIPTTAG);
  const [idset, setId] = useState(false);
  const [stop, setStop] = useState(true);
  const [textFieldValue, setTextFieldValue] = useState('');
  const [textFieldValueOld, setTextFieldValueOld] = useState('');
  const [textFieldValue1, setTextFieldValue1] = useState('');
  const [textFieldValueOld1, setTextFieldValueOld1] = useState('');
  const { loading, error, data } = useQuery(GET_STORE);
  const [first, setFirst] = useState(true);

  const handleTextFieldChange = useCallback(
    (value) => {
      if (/^\d+$/.test(value) || value == '')
        setTextFieldValue(value);
      //console.log(textFieldValue);
    },
    [],
  );

  const handleTextFieldChange1 = useCallback(
    (value) => {
      if (/^\d+$/.test(value) || value == '')
        setTextFieldValue1(value);
      //console.log(textFieldValue1);
    },
    [],
  );

  //toast
  const [active, setActive] = useState(false);

  const toastMarkup = active ? (
    <div style={{ zIndex: '999' }}>
      <Toast content="Settings Saved" onDismiss={() => { setActive(!active) }} />
    </div>
  ) : null;

  if (loading) return <div>Loading...</div>
  else if (error) {
    //console.log(Cookies.get("shopOrigin"));
    //location.replace(`https://discord-shopify-app.herokuapp.com/auth?shop=${Cookies.get("shopOrigin")}`)
    return <div>{error.message}</div>
  }

  // console.log(data.priceRules.edges[0].node.discountCodes.edges[0].node.id);
  // console.log(data.priceRules.edges[0].node.discountCodes.edges[0].node.code);
  //console.log(Cookie.get("shopOrigin"))

  //const shopURL = String(data.shop.myshopifyDomain).substr(0, String(data.shop.myshopifyDomain).length - 14)
  const shopURL = getShopId(data.shop.myshopifyDomain)

  if (first) {
    axios.get(`/api/discordID/${shopURL}`).then(result => {
      if (result.data.data.serverID != null) {
        setId(true);
        setTextFieldValue(result.data.data.serverID);
        setTextFieldValue1(result.data.data.channelID);
        setTextFieldValueOld(result.data.data.serverID);
        setTextFieldValueOld1(result.data.data.channelID);
      }
    }).catch(error => console.log(error));
    setFirst(false);
  }

  if (stop && data.scriptTags.edges[0] == undefined) {
    setStop(false);
    createScripts({
      variables: {
        input: {
          src: urlScriptTags,
          displayScope: "ALL"
        }
      },
      refetchQueries: [{ query: GET_STORE }]
    })
  }

  return (
    <Frame>
      <Page title="Discordify Server/Channel ID" >
        <Layout>
          {toastMarkup}
          <Layout.Section >
            <Banner
              status={(idset) ? "success" : "critical"}
              title={(idset) ? "Server/Channel ID Set" : "No Server/Channel ID Set"}
            >
            </Banner>
          </Layout.Section>
          <Layout.AnnotatedSection title="Step One" description={<p>Add Widgetbot to your server <a href="https://discord.com/oauth2/authorize?client_id=543225764036870167&scope=bot&permissions=537218112" target="_blank"><b>here</b></a>. Make sure you give Widgetbot all the permissions! <b> Do not remove Widgetbot from the server, if you remove the bot the widget won't work!</b></p>}>
            <Card sectioned >
              <img src="dis1.PNG" width="100%" height="410" />
            </Card>
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection title="Step Two" description="Type the ??guestmode command if you want people who don't have a discord account or are not already in your server to be able to choose a name on the spot and write messages. Type ??help for a full list of commands.">
            <Card sectioned >
              <img src="dis2.PNG" width="100%" height="410" />
            </Card>
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection title="Step Three" description='Type the ??crate command in the text channel you want to display in the widget after it loads. Copy the values from Server and Channel without the quotes, paste them bellow and submit. You can always come back here to change the IDs. Now go to Widget Settings to customize and enable your widget!'>
            < Card sectioned >
              <img src="dis3.PNG" width="100%" height="410" />
            </Card>
          </Layout.AnnotatedSection>
          <Layout.Section>
            <Card sectioned>
              <Stack spacing="extraLoose">
                <Stack.Item fill>
                  <TextField
                    label="Server ID"
                    placeholder="Paste your Discord Server ID here"
                    value={textFieldValue}
                    onChange={handleTextFieldChange}
                  >
                  </TextField>
                </Stack.Item>
              </Stack>
              <br />
              <Stack spacing="extraLoose">
                <Stack.Item fill>
                  <TextField
                    label="Channel ID"
                    placeholder="Paste your Discord Channel ID here"
                    value={textFieldValue1}
                    onChange={handleTextFieldChange1}
                  >
                  </TextField>
                </Stack.Item>
              </Stack>
              <br />
              <Stack distribution="trailing">
                <Button
                  primary
                  disabled={((textFieldValue == '' || textFieldValueOld == textFieldValue) && (textFieldValue1 == '' || textFieldValueOld1 == textFieldValue1)) ? true : false}
                  type="submit"
                  onClick={() => {
                    if (textFieldValue != '') {
                      setId(true);
                      setActive(true);
                      makeApiCall({ serverID: textFieldValue, channelID: textFieldValue1 }, shopURL);
                    }
                    else {
                      alert("Please paste in your ID first");
                    }
                  }}>
                  Submit
                </Button>
              </Stack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page >
    </Frame>
  )

  async function makeApiCall(appInfo, shopURL) {
    const url = `/api/discordID/${shopURL}`;
    setTextFieldValueOld(textFieldValue);
    setTextFieldValueOld1(textFieldValue1);
    axios.post(url, appInfo).then((result) => { }).catch((error) => { console.log(error.response) });
  }
}

export default AnnotatedLayout;