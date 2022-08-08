import { ISPItem } from "./ISPItem";

export class ClassItem {
    public Title : string;
    public Content : string;
    public Title_CH : string;
    public Content_EN : string;
    public Content_CH : string;
    public RollupImage : string;
    public ID : number;
    public DisplayOrder : number;
    public PublishDate : string;

    constructor(item : ISPItem, isChinese : boolean) {

        if (isChinese) { 
            this.Title = item.Title_CH;
            this.Content = item.Content_CH;
        }
        else {
            this.Title = item.Title;
            this.Content = item.Content_EN;
        }
        this.RollupImage = item.RollupImage;
        this.ID = item.ID;
    }
}