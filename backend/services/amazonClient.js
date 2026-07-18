import axios from "axios";
import aws4 from "aws4";
import { config } from "../config.js";

const PAAPI_ENDPOINT = `https://${config.host}/paapi5/searchitems`;

function buildSearchPayload({ keyword, page = 1, browseNode }) {
  const payload = {
    Keywords: keyword,
    PartnerTag: config.partnerTag,
    PartnerType: config.partnerType,
    Marketplace: "www.amazon.com",
    ItemCount: 10,
    Resources: [
      "Images.Primary.Medium",
      "ItemInfo.Title",
      "Offers.Listings.Price",
      "CustomerReviews.Count",
      "CustomerReviews.StarRating",
      "ItemInfo.ByLineInfo"
    ]
  };

  if (page) {
    payload.ItemPage = page;
  }

  if (browseNode) {
    payload.BrowseNodeId = browseNode;
  }

  return payload;
}

async function signedPost(url, body) {
  const urlObj = new URL(url);

  const requestOptions = {
    host: urlObj.host,
    method: "POST",
    path: urlObj.pathname,
    service: "ProductAdvertisingAPI",
    region: config.region,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Accept": "application/json"
    },
    body: JSON.stringify(body)
  };

  aws4.sign(requestOptions, {
    accessKeyId: config.accessKey,
    secretAccessKey: config.secretKey
  });

  const headers = requestOptions.headers;

  const response = await axios.post(url, body, { headers });
  return response.data;
}

function normalizeItems(response) {
  const items = response?.SearchResult?.Items || [];

  return items.map((item) => {
    const title =
      item?.ItemInfo?.Title?.DisplayValue ||
      item?.ItemInfo?.ByLineInfo?.Brand?.DisplayValue;
    const image =
      item?.Images?.Primary?.Medium?.URL ||
      item?.Images?.Primary?.Large?.URL ||
      "";

    const offer = item?.Offers?.Listings?.[0];
    const amount = offer?.Price?.DisplayAmount;

    const rating =
      item?.CustomerReviews?.StarRating?.DisplayValue ||
      item?.CustomerReviews?.StarRating;

    return {
      asin: item?.ASIN,
      title: title || "Untitled product",
      image,
      price: amount || null,
      rating: rating || null,
      url: item?.DetailPageURL || null
    };
  });
}

export async function searchItems({ keyword, page = 1, category }) {
  const payload = buildSearchPayload({
    keyword,
    page,
    browseNode: undefined, // could be mapped from `category` later if needed
  });

  const raw = await signedPost(PAAPI_ENDPOINT, payload);
  return normalizeItems(raw);
}

