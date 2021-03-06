import * as React from 'react';
import styles from './SliderWebpart.module.scss';
import { ISliderWebpartProps } from './ISliderWebpartProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { ISliderWebpartState } from './ISliderWebpartState';

import pnp from 'sp-pnp-js';
import { ClassItem } from '../models/ClassItem';
import ReactHtmlParser from 'react-html-parser';

import { RichText } from "@pnp/spfx-controls-react/lib/RichText";

import { Swiper, SwiperSlide } from 'swiper/react/swiper-react';
import 'swiper/swiper.min.css';
import { Navigation, EffectFade, Pagination } from 'swiper';
import 'swiper/modules/navigation/navigation.min.css';
import 'swiper/modules/pagination/pagination.min.css';

import './styles.css';

/* Constants */
const listName = "Publication";

/* Webpart */
export default class SliderWebpart extends React.Component<ISliderWebpartProps, ISliderWebpartState> {

  constructor(props: ISliderWebpartProps) {
    super(props);

    this.state = {
      displayItems: [],
      webUrl: ""
    }
  }

  public componentDidMount(): void {

    // Retrieving QueryString parameters from the url
    const urlParams = new URLSearchParams(window.location.search);
    const res = urlParams.get("preview");

    pnp.sp.web.select("ServerRelativeUrl").get().then((Response) => {
      this.setState({ webUrl: Response.ServerRelativeUrl });
    });

    console.log(res);

    if (res) {
      this._getPreviewSPListItems();
    }
    else {
      this._getItemsFromSPList();
    }

    this.forceUpdate();
  }

  public render(): React.ReactElement<ISliderWebpartProps> {
    const pagination = {
      clickable: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + '">' + "</span>";
      }
    };

    // const url = this.context.
    return (
      <div className="swiper-main__container">
        <div className="publications__big-title">
          Publication
        </div>
        <Swiper
          modules={[EffectFade, Pagination]}
          pagination={pagination}
          speed={800}
          initialSlide={1}
          slidesPerView={1}
          className="myswiper">
          {
            this.state.displayItems.map((item) =>
              <SwiperSlide className="myswiperslide">
                <div className="swiper-img__container">
                  <img src={item.RollupImage ? JSON.parse(item.RollupImage).serverRelativeUrl : "https://outhink.com/wp-content/themes/outhink-theme/images/ip.jpg"}></img>
                </div>
                <div className="swiper-content__container">
                  <div className="swiper-card__title">
                    {item.Title}
                  </div>
                  <div className="description__text">
                    {ReactHtmlParser(item.Content_EN)}
                  </div>
                  <div className="swiper-button">
                    <a href={this.state.webUrl + "/SitePages/PublicationDetails.aspx" + "?itemid=" + item.ID} className="learn__more">LEARN MORE</a>
                  </div>
                </div>
              </SwiperSlide>
            )
          }
        </Swiper>
        <div>
          <a href={this.state.webUrl + "/SitePages/Publications.aspx"} className="see__list">GO TO FULL LISTING</a>
        </div>
      </div>
    );
  }

  /* Controller Methods */
  private _getItemsFromSPList() {
    // Getting the current date and time 
    const currDate = new Date();
    let nowString = currDate.toISOString();

    // Retrieving list items that are published and approved 
    pnp.sp.web.lists.getByTitle(listName).items
      .filter("OData__ModerationStatus eq '0' and PublishDate lt '" + nowString + "'  and UnpublishDate gt '" + nowString + "'")
      .select("Title", "Content_EN", "ID", "DisplayOrder", "PublishDate", "RollupImage")
      .get().then
      ((Response) => { this._filterAndSet(Response) });
  }

  private _getPreviewSPListItems() {
    const currDate = new Date();
    let nowString = currDate.toISOString();

    // Retrieving list items that are Pending approval or Approved
    pnp.sp.web.lists.getByTitle(listName).items
      .filter("OData__ModerationStatus ne '1' and UnpublishDate gt '" + nowString + "'")
      .select("Title", "Content_EN", "ID", "DisplayOrder", "PublishDate", "RollupImage")
      .get().then
      ((Response) => {
        let filtered = Response.filter(item => item.OData__ModerationStatus !== 1);
        this._filterAndSet(filtered)
      });
  }

  // Filtering through the list results and setting up the data 
  private _filterAndSet(response) {
    console.log("Setting up the list items...");
    let displayOrderItems = response.filter(item => item.DisplayOrder !== null);
    let rest = response.filter(item => item.DisplayOrder === null);

    // Sorting items with display order fields in ascending order 
    displayOrderItems.sort(function (item1, item2) {
      if (item1.DisplayOrder === null) {
        return 1;
      }
      else if (item2.DisplayOrder === null) {
        return -1;
      }
      else if (item1.DisplayOrder - item2.DisplayOrder === 0) {
        if (item1.PublishDate > item2.PublishDate) return -1;
        return 1;
      }
      return item1.DisplayOrder - item2.DisplayOrder;
    });

    // Sorting the rest of the list by most recent first 
    rest.sort(function (item1, item2) {
      if (item1.PublishDate > item2.PublishDate) return -1;
      return 1;
    })

    // Combine both lists with display order items in front
    let allListItems = displayOrderItems.concat(rest);

    this.setState({ displayItems: allListItems.slice(0, 5) });
  }
}
