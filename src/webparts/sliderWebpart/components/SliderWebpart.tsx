import * as React from 'react';
import styles from './SliderWebpart.module.scss';
import { ISliderWebpartProps } from './ISliderWebpartProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { ISliderWebpartState } from './ISliderWebpartState';

import pnp from 'sp-pnp-js';
import { ClassItem } from '../models/ClassItem';
import ReactHtmlParser from 'react-html-parser';
import './styles.css';

import { Swiper, SwiperSlide } from 'swiper/react/swiper-react';
import 'swiper/swiper.min.css';
import { Navigation, EffectFade, Pagination } from 'swiper';
import 'swiper/modules/navigation/navigation.min.css';
import 'swiper/modules/pagination/pagination.min.css';

const listName = "Publication";

export default class SliderWebpart extends React.Component<ISliderWebpartProps, ISliderWebpartState> {

  constructor(props: ISliderWebpartProps) {
    super(props);

    this.state = {
      displayItems: []
    }
  }

  public componentDidMount(): void {
    this._getItemsFromSPList();

    this.forceUpdate();
  }

  public render(): React.ReactElement<ISliderWebpartProps> {
    const pagination = {
      clickable: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + '">' + "</span>";
      }
    };
 
    return (
      <div className="swiper-main__container">
        <Swiper
          modules={[EffectFade, Pagination]}
          pagination={pagination}
          speed={800} 
          initialSlide={0}
          slidesPerView={1} 
          className="myswiper">
          { 
            this.state.displayItems.map((item) =>
              <SwiperSlide className="myswiperslide">
                <div className="swiper__card">
                  <div className="swiper-img__container">
                    <img className="swiper-card__image" src={JSON.parse(item.RollupImage).serverRelativeUrl}></img>
                  </div>
                  <div className="swiper-content__container">
                    <div className="swiper-card__title">
                      {item.Title}
                    </div>
                    <div className="swiper-card__content">
                      <p>{ReactHtmlParser(item.Content_EN)}</p>
                    </div>
                    <div className="swiper-button">
                      <a href={"https://waion365.sharepoint.com/sites/MTR-GIPDEV/SitePages/Showcase.aspx" + "?itemid=" + item.ID} className="learn__more">LEARN MORE</a>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            )
          }
        </Swiper>
      </div>
    );
  }

  private _getItemsFromSPList() {
    pnp.sp.web.lists.getByTitle(listName).items
      .top(5)
      .get()
      .then
      ((Response) => {
        console.log(Response);
        let collection = Response.map(item => new ClassItem(item));
        this.setState({ displayItems: collection })
      })
  }
}
