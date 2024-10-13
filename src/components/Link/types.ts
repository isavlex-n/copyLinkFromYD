export interface DataType {
  antivirus_status: string;
  public_key:       string;
  public_url:       string;
  name:             string;
  exif:             Exif;
  created:          Date;
  size:             number;
  resource_id:      string;
  modified:         Date;
  mime_type:        string;
  comment_ids:      CommentIDS;
  sizes:            Size[];
  file:             string;
  media_type:       string;
  preview:          string;
  path:             string;
  sha256:           string;
  type:             string;
  md5:              string;
  revision:         number;
}

export interface CommentIDS {
  private_resource: string;
  public_resource:  string;
}

export interface Exif {
}

export interface Size {
  url:  string;
  name: string;
}