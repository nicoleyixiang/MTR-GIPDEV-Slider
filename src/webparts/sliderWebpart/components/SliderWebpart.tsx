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
  }

  public render(): React.ReactElement<ISliderWebpartProps> {
    const pagination = {
      clickable: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + '">' + "</span>";
      }
    }; 
 
    return (
      <div className="main__container">
        <Swiper
          modules={[EffectFade, Pagination]}
          pagination={pagination}
          speed={800}
          initialSlide={1}
          slidesPerView={1}
          loop 
          className="myswiper">
          { 
            this.state.displayItems.map((item) =>
              <SwiperSlide className="myswiperslide">
                <div className="card">
                  <div className="img__container">
                    <img className="card__image" src={JSON.parse(item.RollupImage).serverRelativeUrl}></img>
                  </div>
                  <div className="content__container">
                    <div className="card__title">
                      {item.Title}
                    </div>
                    <div className="card__content">
                      <p>{ReactHtmlParser(item.Content_EN)}</p>
                    </div>
                    <div className="footer__content">
                      <a href={"https://waion365.sharepoint.com/sites/MTR-GIPDEV/SitePages/Showcase.aspx" + "?itemid=" + item.ID} className="back__button">LEARN MORE</a>
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
