export type Category = {
  id: string;
  name: string;
  icon: string;
  order: number;
};

export type WebApp = {
  id: string;
  name: string;
  url: string;
  icon: string; // Can be a lucide-react icon name, a URL to a favicon, or a data URI
  categoryId: string;
  clip?: boolean;
  order: number;
};
