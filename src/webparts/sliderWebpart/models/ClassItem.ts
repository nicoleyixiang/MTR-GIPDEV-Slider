import { ISPItem } from "./ISPItem";

export class ClassItem {
    public Title : string;
    public Content_EN : string;
    public RollupImage : string;
    public ID : number;

    constructor(item : ISPItem) {
        this.Title = item.Title;
        this.Content_EN = item.Content_EN;
        this.RollupImage = item.RollupImage;
        this.ID = item.ID;
    }
}