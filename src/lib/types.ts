export type Category = {
  id: string;
  name: string;
  icon: string;
};

export type WebApp = {
  id: string;
  name: string;
  url: string;
  icon: string; // Can be a lucide-react icon name, a URL to a favicon, or a data URI
  categoryId: string;
};


// Old type, no longer in use
export type AiDevelopment = {
  category: 'official' | 'tools' | 'products' | 'community';
  title: string;
  date: string;
  source: string;
  icon: string;
  shortDesc: string;
  details: string[];
  link: string;
};
