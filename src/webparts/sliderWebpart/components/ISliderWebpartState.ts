import { ClassItem } from "../models/ClassItem";

export interface ISliderWebpartState {
    displayItems : ClassItem[];
    webUrl : string;
    isChinese : boolean;
}