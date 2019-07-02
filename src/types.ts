export interface IArtist {
  external_urls: {
    [propName: string]: string;
  };
  followers: {
    href?: string;
    total: number;
  };
  genres: string[];
  href: string;
  id: string;
  images: {
    height: number;
    url: string;
    width: number;
  }[];
  name: string;
  popularity: number;
  type: string;
  uri: string;
}

export interface IMargin {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface IArtistsListProps {
  width: number;
  height: number;
  margin: IMargin;
  data: IArtistListDataItem[];
}

export interface IArtistListDataItem {
  name: string;
  rank: number;
  image: string;
  id: string;
  topTracks: any;
}
