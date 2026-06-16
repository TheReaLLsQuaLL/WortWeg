import type { DailyMinutes, PrioritySkillId, StartLevelId, StudyStyleId, TargetLevelId, UserGoalId } from '../types/learningPlan';

export const goalOptions: Array<{ id: UserGoalId; label: string; descriptionTr: string }> = [
  { id: 'exam', label: 'Sınav', descriptionTr: 'A1/B1 sınav tarzı okuma, dinleme, yazma ve konuşma pratiği.' },
  { id: 'daily_life', label: 'Günlük yaşam', descriptionTr: 'Alışveriş, randevu, şehir ve günlük konuşma.' },
  { id: 'work', label: 'İş/Kariyer', descriptionTr: 'İş yeri, telefon, resmi e-posta ve kariyer dili.' },
  { id: 'travel', label: 'Seyahat', descriptionTr: 'Ulaşım, yön tarifi, otel, restoran ve acil durumlar.' },
  { id: 'family', label: 'Aile/Almanya’da yaşam', descriptionTr: 'Aile, ev, doktor, okul ve resmi formlar.' },
  { id: 'university', label: 'Üniversite/okul', descriptionTr: 'Okul, başvuru, sunum ve akademik becerilere hazırlık.' },
  { id: 'curiosity', label: 'Sadece merak', descriptionTr: 'Dengeli ve baskısız CEFR yolculuğu.' },
];

export const startLevelOptions: Array<{ id: StartLevelId; label: string }> = [
  { id: 'zero', label: 'Sıfırdan başlıyorum' },
  { id: 'some', label: 'Biraz biliyorum' },
  { id: 'A1', label: 'A1' },
  { id: 'A2', label: 'A2' },
  { id: 'B1', label: 'B1' },
];

export const targetLevelOptions: Array<{ id: TargetLevelId; label: string }> = [
  { id: 'A1', label: 'A1' },
  { id: 'A2', label: 'A2' },
  { id: 'B1', label: 'B1' },
  { id: 'B2', label: 'B2' },
];

export const dailyMinuteOptions: Array<{ id: DailyMinutes; label: string }> = [
  { id: 5, label: '5 dk' },
  { id: 10, label: '10 dk' },
  { id: 15, label: '15 dk' },
  { id: 20, label: '20+ dk' },
];

export const prioritySkillOptions: Array<{ id: PrioritySkillId; label: string }> = [
  { id: 'speaking', label: 'Konuşma' },
  { id: 'exam', label: 'Sınav' },
  { id: 'vocabulary', label: 'Kelime' },
  { id: 'grammar', label: 'Gramer' },
  { id: 'listening', label: 'Dinleme' },
  { id: 'writing', label: 'Yazma' },
];

export const studyStyleOptions: Array<{ id: StudyStyleId; label: string }> = [
  { id: 'fast', label: 'hızlı plan' },
  { id: 'balanced', label: 'dengeli plan' },
  { id: 'review_heavy', label: 'tekrar ağırlıklı plan' },
  { id: 'speaking_heavy', label: 'konuşma ağırlıklı plan' },
  { id: 'exam_heavy', label: 'sınav ağırlıklı plan' },
];
