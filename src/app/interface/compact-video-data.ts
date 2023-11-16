export interface CompactVideoData {
    compactVideoRenderer: CompactVideoRenderer;
}

interface CompactVideoRenderer {
    videoId:string;
    thumbnail:Thumbnail;
    title: SimpleTitle;
    lengthText: LengthText;
}

interface LengthText {
    simpleText:string;
}

interface SimpleTitle {
    simpleText:string;
}

interface Thumbnail {
    thumbnails: Thumbnails[];
}

interface Thumbnails {
    url:string;
    width:number;
    height:number;
}