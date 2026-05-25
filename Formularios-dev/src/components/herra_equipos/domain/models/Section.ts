import { Question } from './Question';

export interface SectionImage {
  _id?: string;
  url: string;
  caption: string;
  order?: number;
}

export interface Section {
  _id?: string;
  title: string;
  description?: string;
  images?: SectionImage[];
  questions: Question[];
  order?: number;
  isParent?: boolean;
  parentId?: string | null;
  subsections?: Section[];
}
