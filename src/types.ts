import React from 'react';

export type ToolId = 
  | 'dashboard'
  | 'guide'
  | 'master-data'
  | 'voice-intake'
  | 'templates'
  | 'ai-check'
  | 'care-plan-1'
  | 'care-plan-2'
  | 'care-plan-3'
  | 'care-plan-4'
  | 'care-plan-5'
  | 'care-plan-6'
  | 'family-summary'
  | 'small-scale-plan'
  | 'progress-record'
  | 'meeting-minutes'
  | 'home-modification'
  | 'assessment-23'
  | 'certification-info'
  | 'prevention-plan'
  | 'certification-survey'
  | 'minor-change'
  | 'ai-care-basic';

export interface Tool {
  id: ToolId;
  title: string;
  icon: React.ReactNode;
  category: string;
}
