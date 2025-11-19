export interface PeaceAndSafeData {
  playerName: string;
  schoolName: string;
  coachName: string;
  presidentName: string;
  currentDate: string;
  playerId: string;
}

export interface PeaceAndSafeDocument {
  id?: string;
  player_id: string;
  document_url: string;
  created_at: string;
  coach_id: string;
}