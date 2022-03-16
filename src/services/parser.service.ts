import got from 'got';
import cheerio from 'cheerio';
import { Injectable, Logger } from '@nestjs/common';
import { IApartment } from 'src/interfaces/apartment.interface';

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);

  async startAvitoCatalog(): Promise<IApartment[]> {
    this.logger.log('avito parser started');

    const response = await got.get(
      'https://www.avito.ru/ulyanovsk/kvartiry/prodam/vtorichka-ASgBAQICAUSSA8YQAUDmBxSMUg?s=104',
    );

    const $ = cheerio.load(response.body);

    const catalog = $('div[data-marker=catalog-serp]');

    const items = catalog.find('div[data-marker=item]').map((_, item) => {
      const elementTitle = $(item).find('a[data-marker=item-title]');

      const platformId = $(item).attr('data-item-id');
      const title = elementTitle.find('h3').text();
      const href = `https://www.avito.ru${elementTitle.attr('href')}`;

      const price = Number.parseFloat(
        $(item)
          .find('span[data-marker=item-price]')
          .find('span')
          .text()
          .replace('₽₽', '')
          .split('\xa0')
          .join(''),
      );

      const address = $(item).find('[class*=geo-address-]').text();
      const street = address
        .replace('ул.', '')
        .replace('пр.', '')
        .replace('пр-т', '')
        .replace('б-р', '')
        .split(',')[0]
        .trim();

      this.logger.log(href);
      const house = address.split(',')[1]?.trim();

      const square = Number.parseFloat(
        title.split(', ')[1].split(' ')[0].split(',').join('.'),
      );

      const roomsData = title.split(',')[0];
      const rooms = Number.parseInt(
        roomsData.includes('-к.') ? roomsData.split('-')[0] : roomsData,
      );

      const floor = Number.parseInt(title.split(', ')[2].split('/')[0]);

      const pricePerMeter = Math.floor(price / square);

      return {
        platformId,
        title,
        href,
        price,
        pricePerMeter,
        street,
        house,
        rooms,
        square,
        floor,
      };
    });

    this.logger.log('avito parser end');

    return Array.from(items) || [];
  }
}
