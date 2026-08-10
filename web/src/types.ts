import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from 'react';

export interface ProjectDetails {
  area: string;
  duration: string;
  style: string;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  details: ProjectDetails;
}

export type StatKey = 'years' | 'projects' | 'clients' | 'awards';

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export type Stats = Record<StatKey, Stat>;
export type PartialStats = Partial<Record<StatKey, Partial<Stat>>>;

export interface QuoteFormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
}

export interface SubmitStatus {
  type: 'success' | 'error';
  message: string;
}

export type QuoteInputChangeEvent =
  ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

export type QuoteFormSubmitEvent = FormEvent<HTMLFormElement>;

export interface ProjectsSliderProps {
  projects: Project[];
  currentSlide: number;
  setCurrentSlide: Dispatch<SetStateAction<number>>;
  progressWidth: number;
  handlePrevSlide: () => void;
  handleNextSlide: () => void;
}

export interface HeroProps {
  stats?: PartialStats;
}

export interface QuoteFormProps {
  formData: QuoteFormData;
  handleInputChange: (event: QuoteInputChangeEvent) => void;
  handleFormSubmit: (event: any, overridePayload?: any) => void | Promise<void>;
  submitStatus: SubmitStatus | null;
  isSubmitting: boolean;
}

export interface MapShape {
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
  rotate?: number;
}

export interface MapPoint {
  x: number;
  y: number;
}

export interface IndiaInteriorState {
  id: string;
  name: string;
  labelLines: string[];
  description: string;
  highlights: string[];
  images: string[];
  pin: MapPoint;
  label: MapPoint;
  shape: MapShape;
  accent: string;
}
