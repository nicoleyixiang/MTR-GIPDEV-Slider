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
import './styles.scss';
import { TermItemSuggestion } from '@pnp/spfx-controls-react';

/* Constants */
const listName = "Publication";
const slidesToShow = 5;

/* Webpart */
export default class SliderWebpart extends React.Component<ISliderWebpartProps, ISliderWebpartState> {

  constructor(props: ISliderWebpartProps) {
    super(props);

    this.state = {
      displayItems: [],
      webUrl: "",
      isChinese: false
    }
  }

  public componentDidMount(): void {

    // Retrieving QueryString parameters from the url
    const urlParams = new URLSearchParams(window.location.search);
    const res = urlParams.get("preview");

    pnp.sp.web.select("ServerRelativeUrl").get().then((Response) => {
      this.setState({ webUrl: Response.ServerRelativeUrl });
    });

    // Checking for Chinese / English selection
    const url = window.location.href;
    if (url.indexOf("/CH/") !== -1) {
      console.log("Setting language to Chinese");
      this.setState({ isChinese: true });
    }

    if (res) {
      this._getItemsFromSPList(true);
    }
    else {
      this._getItemsFromSPList(false);
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
    return (
      <div className="swiper-main__container">
        <div className="publications__big-title">
          {this.state.isChinese ? "出版物" : "Publication"}
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
              <div className="row">
                <SwiperSlide className="myswiperslide">
                  <div className="swiper-img__container">
                    <img src={item.RollupImage ? JSON.parse(item.RollupImage).serverRelativeUrl : "https://outhink.com/wp-content/themes/outhink-theme/images/ip.jpg"}></img>
                  </div>
                  <div className="swiper-content__container">
                    <div className="swiper-card__title">
                      {item.Title}
                    </div>
                    <div className="swiper-description__text">
                      <RichText
                        className="slider__rich-text"
                        value={item.Content}
                        isEditMode={false}
                      />
                    </div>
                    <div className="swiper-button">
                      <a href={this.state.webUrl + (this.state.isChinese ? "/SitePages/CH/PublicationDetails.aspx" : "/SitePages/EN/PublicationDetails.aspx") + "?itemid=" + item.ID} className="learn__more">{this.state.isChinese ? "更多" : "LEARN MORE"}</a>
                    </div>
                  </div>
                </SwiperSlide>
              </div>
            )
          }
        </Swiper>
        <div>
          <a href={this.state.webUrl + (this.state.isChinese ? "/SitePages/CH/Publication.aspx" : "/SitePages/EN/Publication.aspx")} className="see__list">GO TO FULL LISTING</a>
        </div>
      </div>
    );
  }

  private async _getItemsFromSPList(isPreview: boolean) {
    // Getting the current date and time 
    const currDate = new Date();
    let nowString = currDate.toISOString();

    let filterString1 = "DisplayOrder ne null and OData__ModerationStatus eq '0' and PublishDate lt '" + nowString + "'  and UnpublishDate gt '" + nowString + "'";
    let filterString2 = "DisplayOrder eq null and OData__ModerationStatus eq '0' and PublishDate lt '" + nowString + "'  and UnpublishDate gt '" + nowString + "'";
    if (isPreview) {
      filterString1 = "DisplayOrder ne null and OData__ModerationStatus ne '1' and UnpublishDate gt '" + nowString + "'";
      filterString2 = "DisplayOrder eq null and OData__ModerationStatus ne '1' and UnpublishDate gt '" + nowString + "'";
    }

    // Retrieving list items that are published and approved (sorting by display order in ascending order)
    let items = await pnp.sp.web.lists.getByTitle(listName).items
      .filter(filterString1)
      .orderBy("DisplayOrder", true)
      .orderBy("PublishDate", false)
      .select("Title", "Title_CH", "Content_CH", "Content_EN", "ID", "DisplayOrder", "PublishDate", "RollupImage")
      .top(5)
      .get();

    items.sort(function (item1, item2) {
      if (item1.DisplayOrder === null) {
        return 1; // Positive number means item1 > item2 (put items with display order in front)
      }
      else if (item2.DisplayOrder === null) {
        return -1; // Negative number means item1 < item2 (put items with display order in front)
      }
      else if (item1.DisplayOrder - item2.DisplayOrder === 0) { // Sort by publish date if display order are tied  
        if (item1.PublishDate > item2.PublishDate) return -1;
        return 1;
      }
      return item1.DisplayOrder - item2.DisplayOrder; // Sort by display order (ascending)
    });

    // Retrieving more items if the number of items with display order logged is not enough 
    if (items && items.length < slidesToShow) {
      const diff = slidesToShow - items.length;
      console.log(diff);
      // Retrieving items (sorting by publish date in descending order)
      const publishDateItems = await pnp.sp.web.lists.getByTitle(listName).items
        .filter(filterString2)
        .orderBy("PublishDate", false)
        .select("Title", "Title_CH", "Content_CH", "Content_EN", "ID", "DisplayOrder", "PublishDate", "RollupImage")
        .top(diff)
        .get();
      items = items.concat(publishDateItems);
    }

    let classItems = items.map(item => new ClassItem(item, this.state.isChinese));
    this.setState({ displayItems: classItems })
  }
}