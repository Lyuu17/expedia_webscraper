import { writeFileSync } from 'fs';
import puppeteer from 'puppeteer-extra';
import stealthplugin from 'puppeteer-extra-plugin-stealth';
import { processHotelResult } from './processresult.js';

puppeteer.use(stealthplugin());

(async () => {
  try {
    const input_url
      = 'https://www.expedia.com/Hotel-Search?adults=1&d1=2023-05-01&d2=2023-05-02&destination=Venice%2C%20Italy%20%28VCE-Marco%20Polo%29&endDate=2023-05-02&latLong=45.504621%2C12.340189&regionId=4539222&rooms=1&selected=&semdtl=&sort=RECOMMENDED&startDate=2023-05-01&theme=&useRewards=false&userIntent=';

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.goto(input_url, { waitUntil: 'load' });

    await page.setViewport({
      width: 1200,
      height: 800
    });

    const data = [];

    const propery_listing_results = (await page.$$('[data-stid=section-results] [data-stid=property-listing-results] > div.uitk-spacing'))
      .filter(node => node.$('a[data-stid=open-hotel-information]') != null);
    {
      for await (const nodeResult of propery_listing_results) {
        try {
          const title = await nodeResult.$eval('h4', node => node.textContent);
          const hotel_url = await nodeResult.$eval('a[data-stid=open-hotel-information]', node => node.getAttribute('href'));

          const tempPage = await browser.newPage();
          await tempPage.setViewport({
            width: 1200,
            height: 800
          });
          const result = await processHotelResult(tempPage, hotel_url);
          tempPage.close();

          data.push({
            title: title,
            url: hotel_url,
            ...result
          });
        }
        catch(e) { }
      }
    }

    writeFileSync('./properties.json', JSON.stringify(data, null, 4), { flag: 'w' });

    await browser.close();
  } catch (error) { console.error(error); }
})();