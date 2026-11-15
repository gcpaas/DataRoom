import thumbnail from './thumbnail.png'
import { ChartPlugin } from '../type/ChartPlugin'
export class DrCandlestickChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrCandlestickChart', 'K线图', 'K线图、蜡烛图、行情、candlestick、OHLC', thumbnail, tags)
  }
}
