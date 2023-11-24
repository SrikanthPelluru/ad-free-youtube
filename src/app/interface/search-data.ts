import { ReelItemRenderer } from "./initial-video-data";
import { VideoRenderer } from "./video-data";

export interface SearchData {
    itemSectionRenderer:ItemSectionRenderer;
}

interface ItemSectionRenderer {
    contents:ItemSectionRendererContents[];
}

interface ItemSectionRendererContents {
    videoRenderer:VideoRenderer;
    reelShelfRenderer:ReelShelfRenderer;
}

interface ReelShelfRenderer {
    items:Item[];
}

interface Item {
    reelItemRenderer:ReelItemRenderer;
}