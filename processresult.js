import { scroll } from "./utils.js";

export const processHotelResult = async (page, url) => {
  await page.goto(`https://expedia.com${url}`, { waitUntil: 'domcontentloaded' });

  await scroll(page, 5000);

  const amenities_list = await page.$$eval('div[data-stid=hotel-amenities-list] li > span', nodes => nodes.map(node => node.textContent));

  const rates_divelems = await page.$$('div[data-stid=section-room-list] > div > div.uitk-layout-grid-item');
  const rates_list = await Promise.all(rates_divelems.map(async e => {
    // (await e.$('div[data-stid=section-roomtype] > button')).click();

    return {
      title: await e.$eval('h3.uitk-heading', node => node.textContent),
      // stuff: await e.$$eval('li', nodes => nodes.map(node => node.textContent)),
      price: await e.$eval('div[data-test-id=price-summary-message-line] > div > span > div', node => node.textContent).catch(() => 'Sold out'),
      // amenities: await e.$$eval('section[role="dialog"] div.uitk-layout-grid-item ul > li > span', nodes => nodes.map(node => node.textContent))
    }
  }));

  const address = await page.$eval('div[data-stid="content-hotel-address"]', node => node.textContent);

  const coords = {
    latitude: await page.$eval('meta[itemprop="latitude"]', node => node.getAttribute('content')),
    longitude: await page.$eval('meta[itemprop="longitude"]', node => node.getAttribute('content'))
  };

  return {
    amenities: amenities_list,
    rates: rates_list,
    address: address,
    coords: coords
  }
}