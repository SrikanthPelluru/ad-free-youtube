export interface VideoData {
    videoRenderer: VideoRenderer;
}

export interface VideoRenderer {
    videoId:string;
    thumbnail: Thumbnail;
    title: Title;
    lengthText: LengthText;
    publishedTimeText:PublishedTimeText;
    viewCountText:ViewCountText;
    longBylineText:LongBylineText;
}

export interface LongBylineText {
    runs: Runs[];
}

export interface ViewCountText {
    simpleText:string;
}

export interface PublishedTimeText {
    simpleText:string;
}

export interface Title {
    runs: Runs[];
}

interface LengthText {
    simpleText:string;
}

interface Runs {
    text:string;
}

export interface Thumbnail {
    thumbnails: Thumbnails[];
}

interface Thumbnails {
    url:string;
    width:number;
    height:number;
}