import { Thumbnail, Title, VideoRenderer, ViewCountText } from "./video-data";

export interface YoutubeInitialData {
    richGridRenderer:RichGridRenderer;
}

interface RichGridRenderer {
    contents: Contents[];
}

interface Contents {
    richSectionRenderer:RichSectionRenderer;
    richItemRenderer:RichItemRenderer;
}

interface RichSectionRenderer {
    content:Content;
}

export interface RichItemRenderer {
    content:RichItemRendererContent;
}

interface RichItemRendererContent {
    reelItemRenderer:ReelItemRenderer;
    videoRenderer:VideoRenderer;
}

export interface ReelItemRenderer {
    videoId:string;
    headline:Headline;
    thumbnail:Thumbnail;
    viewCountText:ViewCountText;
}

interface Headline {
    simpleText:string;
}

interface Content {
    richShelfRenderer:RichShelfRenderer;
}

interface RichShelfRenderer {
    title:Title;
    contents: RichShelfRendererContents[];
}

interface RichShelfRendererContents {
    richItemRenderer:RichItemRenderer;
}

