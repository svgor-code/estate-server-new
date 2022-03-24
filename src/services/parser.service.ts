import got from 'got';
import cheerio from 'cheerio';
import { Injectable, Logger } from '@nestjs/common';
import {
  IApartment,
  ApartmentStatusEnum,
} from 'src/interfaces/apartment.interface';
import { ApartmentService } from './apartment.service';

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);

  constructor(private apartmentService: ApartmentService) {}

  async parseAvitoCatalog(): Promise<{
    apartments: IApartment[];
    status: boolean;
    error?: Error;
  }> {
    try {
      this.logger.log('avito catalog parser started');

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

        this.logger.log(`${title} ${href} ${address}`);

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
          address,
        };
      });

      const apartments = Array.from(items) || [];

      await this.apartmentService.create({ apartments });

      return {
        apartments,
        status: true,
      };
    } catch (error) {
      this.logger.error(error);

      return {
        apartments: [],
        status: false,
        error,
      };
    }
  }

  async parseAvitoItem(id: string): Promise<{
    status: ApartmentStatusEnum | null;
    success: boolean;
    error?: Error;
  }> {
    try {
      const { href } = await this.apartmentService.getById(id);

      this.logger.log(`Start parse apartament ${href}`);

      const response = await got.get(href);
      const $ = cheerio.load(response.body);

      const isDeleted = response.url !== href;
      const isClosed = !!$('.item-closed-warning').html();

      let status = ApartmentStatusEnum.PUBLISHED;

      if (isDeleted) {
        status = ApartmentStatusEnum.DELETED;
      }

      if (isClosed) {
        status = ApartmentStatusEnum.CLOSED;
      }

      await this.apartmentService.updateStatus({ id, status });

      return {
        status,
        success: true,
      };
    } catch (error) {
      this.logger.error(error);

      return {
        status: null,
        success: false,
        error,
      };
    }
  }
}
