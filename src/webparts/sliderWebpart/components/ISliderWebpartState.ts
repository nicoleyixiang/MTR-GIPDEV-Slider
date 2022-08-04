import { ISPItem } from "../models/ISPItem";

export interface ISliderWebpartState {
    displayItems : ISPItem[];
    webUrl : string;
    isChinese : boolean;
}