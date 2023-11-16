export interface VideoData {
    videoRenderer: VideoRenderer;
}

interface VideoRenderer {
    videoId:string;
    thumbnail: Thumbnail;
    title: Title;
    lengthText: LengthText;
}

interface Title {
    runs: Runs[];
}

interface LengthText {
    simpleText:string;
}

interface Runs {
    text:string;
}

interface Thumbnail {
    thumbnails: Thumbnails[];
}

interface Thumbnails {
    url:string;
    width:number;
    height:number;
}