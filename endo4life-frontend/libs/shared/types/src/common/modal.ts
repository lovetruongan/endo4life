export interface IFileDataModal {
  id: string;
  url: string;
  alt?: string;
  thumbnail?: string;
  type?: "jpeg" | "pdf" | "hyperlink";
}
