export type LocationTypeId =
  | 'academic'
  | 'laboratory'
  | 'common'
  | 'office'
  | 'facility'
  | 'outdoor'
  | 'other';

export type LocationSource = 'user-supplied' | 'map-derived' | 'inferred';

export interface LocationCandidate {
  id: string;
  label: string;
  locationType: LocationTypeId;
  blockId?: string;
  floor?: number;
  roomCode?: string;
  aliases?: string[];
  source: LocationSource;
}

export const LOCATION_TYPES: { id: LocationTypeId; label: string }[] = [
  { id: 'academic', label: 'Academic block / classroom' },
  { id: 'laboratory', label: 'Laboratory' },
  { id: 'common', label: 'Common area / hall' },
  { id: 'office', label: 'Office / administrative facility' },
  { id: 'facility', label: 'Library / help desk / other facility' },
  { id: 'outdoor', label: 'Sports / outdoor facility' },
  { id: 'other', label: 'Other campus location' },
];

export const CAMPUS_BLOCKS = [
  { id: 'A', label: 'A Block (existing directory)' },
  { id: 'C', label: 'C Block' },
  { id: 'D', label: 'D Block' },
  ...['E', 'F', 'I', 'J', 'K'].flatMap((block) =>
    [1, 2, 3].map((subBlock) => ({
      id: `${block}${subBlock}`,
      label: `${block}${subBlock} Block`,
    })),
  ),
  { id: 'H6', label: 'H6' },
  { id: 'L3', label: 'L3 Block' },
  { id: 'Gate 1', label: 'Gate 1' },
] as const;

const roomCandidates: LocationCandidate[] = ['C', 'D'].flatMap((blockId) =>
  [1, 2, 3].flatMap((floor) =>
    Array.from({ length: 10 }, (_, index) => {
      const roomCode = `${floor}${String(index + 1).padStart(2, '0')}`;
      return {
        id: `room-${blockId}-${roomCode}`,
        label: `Room ${roomCode}`,
        locationType: 'academic',
        blockId,
        floor,
        roomCode: `${blockId}-${roomCode}`,
        source: 'inferred',
      };
    }),
  ),
);

const subBlockRoomCandidates: LocationCandidate[] = ['E', 'F', 'I', 'J'].flatMap(
  (block) =>
    [1, 2, 3].flatMap((subBlock) =>
      [1, 2, 3].flatMap((floor) =>
        Array.from({ length: 18 }, (_, index) => {
          const roomCode = `${floor}${String(index + 1).padStart(2, '0')}`;
          const blockId = `${block}${subBlock}`;
          return {
            id: `room-${blockId}-${roomCode}`,
            label: `Room ${roomCode}`,
            locationType: 'academic',
            blockId,
            floor,
            roomCode: `${blockId}-${roomCode}`,
            source: 'inferred',
          };
        }),
      ),
    ),
);

const sharedSpaceCandidates: LocationCandidate[] = [
  'C',
  'D',
  ...['E', 'F', 'I', 'J'].flatMap((block) =>
    [1, 2, 3].map((subBlock) => `${block}${subBlock}`),
  ),
].flatMap((blockId) =>
  [1, 2, 3].flatMap((floor) =>
    ['Corridor', 'Staircase', 'Lift / elevator lobby', 'Washroom', 'Floor foyer / common area', 'Other area on this floor'].map(
      (label) => ({
        id: `shared-${blockId}-${floor}-${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
        label,
        locationType: 'common',
        blockId,
        floor,
        source: 'inferred',
      }),
    ),
  ),
);

const facilityCandidates: LocationCandidate[] = [
  { id: 'e1-foyer', label: 'E1 Foyer', locationType: 'common', blockId: 'E1', aliases: ['Foyer'], source: 'user-supplied' },
  { id: 'e2-foyer', label: 'E2 Foyer', locationType: 'common', blockId: 'E2', aliases: ['Foyer'], source: 'user-supplied' },
  { id: 'e3-foyer', label: 'E3 Foyer', locationType: 'common', blockId: 'E3', aliases: ['Foyer'], source: 'user-supplied' },
  { id: 'e2-reception', label: 'E2 Reception', locationType: 'facility', blockId: 'E2', aliases: ['Reception'], source: 'user-supplied' },
  { id: 'e2-lounge', label: 'E2 Lounge', locationType: 'common', blockId: 'E2', aliases: ['Lounge'], source: 'user-supplied' },
  { id: 'e2-seminar-hall', label: 'E2 Seminar Hall', locationType: 'common', blockId: 'E2', aliases: ['Seminar Hall', 'E2 Block Auditorium', 'E2 Auditorium'], source: 'user-supplied' },
  { id: 'f1-seminar-hall', label: 'F1 Seminar Hall', locationType: 'common', blockId: 'F1', aliases: ['Seminar Hall'], source: 'user-supplied' },
  { id: 'f1-mdp-hall', label: 'F1 MDP Hall', locationType: 'common', blockId: 'F1', aliases: ['MDP Hall'], source: 'user-supplied' },
  { id: 'f2-seminar-hall', label: 'F2 Seminar Hall', locationType: 'common', blockId: 'F2', aliases: ['Seminar Hall'], source: 'user-supplied' },
  { id: 'f2-mdp-hall', label: 'F2 MDP Hall', locationType: 'common', blockId: 'F2', aliases: ['MDP Hall'], source: 'user-supplied' },
  { id: 'f3-mdp-hall', label: 'F3 MDP Hall', locationType: 'common', blockId: 'F3', aliases: ['MDP Hall'], source: 'user-supplied' },
  { id: 'f3-seminar-hall', label: 'F3 Seminar Hall', locationType: 'common', blockId: 'F3', aliases: ['Seminar Hall'], source: 'map-derived' },
  { id: 'f2-auditorium', label: 'F2 Auditorium', locationType: 'common', blockId: 'F2', aliases: ['Auditorium'], source: 'map-derived' },
  { id: 'i2-auditorium-moot-court', label: 'I2 Auditorium / Moot Court', locationType: 'common', blockId: 'I2', aliases: ['Auditorium', 'Moot Court'], source: 'map-derived' },
  { id: 'l3-auditorium', label: 'L3 Block Auditorium', locationType: 'common', blockId: 'L3', aliases: ['Auditorium'], source: 'map-derived' },
  { id: 'a-seminar-hall', label: 'A Block Seminar Hall', locationType: 'common', blockId: 'A', aliases: ['Seminar Hall'], source: 'map-derived' },
  { id: 'i2-lounge', label: 'I2 Lounge', locationType: 'common', blockId: 'I2', aliases: ['Lounge'], source: 'map-derived' },
  { id: 'f2-lounge', label: 'F2 Lounge', locationType: 'common', blockId: 'F2', aliases: ['Lounge'], source: 'map-derived' },
  { id: 'accounts-office', label: 'Accounts Office', locationType: 'office', blockId: 'A', source: 'map-derived' },
  { id: 'administration-office', label: 'Administration Office', locationType: 'office', blockId: 'D', source: 'map-derived' },
  { id: 'admission-office', label: 'Admission Office', locationType: 'office', blockId: 'J2', source: 'map-derived' },
  { id: 'counselling-office', label: 'Counselling Office', locationType: 'office', blockId: 'H6', source: 'map-derived' },
  { id: 'hostel-office', label: 'Hostel Office', locationType: 'office', blockId: 'H6', source: 'map-derived' },
  { id: 'id-card-office', label: 'ID Card Office', locationType: 'office', blockId: 'E1', source: 'map-derived' },
  { id: 'international-affairs-office', label: 'International Affairs Office', locationType: 'office', blockId: 'E2', source: 'map-derived' },
  { id: 'registrar-office', label: 'Registrar Office', locationType: 'office', blockId: 'E2', source: 'map-derived' },
  { id: 'examination-office', label: 'Examination Office', locationType: 'office', blockId: 'E2', source: 'map-derived' },
  { id: 'vice-chancellors-office', label: "Vice Chancellor's Office", locationType: 'office', blockId: 'E2', source: 'map-derived' },
  { id: 'incubator', label: 'Incubator', locationType: 'facility', blockId: 'E3', source: 'map-derived' },
  { id: 'central-library', label: 'Central Library', locationType: 'facility', blockId: 'J2', source: 'map-derived' },
  { id: 'laptop-help-desk', label: 'Laptop Help Desk', locationType: 'facility', blockId: 'F2', source: 'map-derived' },
  { id: 'clinic', label: 'Clinic', locationType: 'facility', blockId: 'D', source: 'map-derived' },
  { id: 'laundry', label: 'Laundry', locationType: 'facility', blockId: 'D', source: 'map-derived' },
  { id: 'security-office', label: 'Security Office', locationType: 'office', blockId: 'Gate 1', source: 'map-derived' },
  { id: 'bank-atm', label: 'Bank / ATM', locationType: 'facility', source: 'map-derived' },
  { id: 'book-shop', label: 'Book shop', locationType: 'facility', source: 'map-derived' },
  { id: 'general-store', label: 'General store', locationType: 'facility', source: 'map-derived' },
  { id: 'cafeterias-food-outlets', label: 'Cafeteria / food outlet', locationType: 'facility', source: 'map-derived' },
  { id: 'sports-facilities', label: 'Sports facility', locationType: 'outdoor', source: 'map-derived' },
  { id: 'swimming-pool', label: 'Swimming pool', locationType: 'outdoor', source: 'map-derived' },
  { id: 'sports-fields-courts', label: 'Sports field / court', locationType: 'outdoor', source: 'map-derived' },
  { id: 'parking-area', label: 'Parking area', locationType: 'outdoor', source: 'map-derived' },
  { id: 'campus-gate', label: 'Campus gate', locationType: 'outdoor', source: 'map-derived' },
  { id: 'courtyard', label: 'Courtyard / mapped common area', locationType: 'outdoor', source: 'map-derived' },
];

export const LOCATION_CANDIDATES: LocationCandidate[] = [
  ...roomCandidates,
  ...subBlockRoomCandidates,
  ...sharedSpaceCandidates,
  { id: 'e2-lab-5la1', label: 'Lab 5LA1', locationType: 'laboratory', blockId: 'E2', floor: 5, roomCode: 'E2-5LA1', source: 'user-supplied' },
  ...facilityCandidates,
];

export function inferBlockId(roomCode: string): string | undefined {
  return roomCode.match(/^([A-Z]\d?)-/i)?.[1]?.toUpperCase();
}

export function getLocationTypeForApi(type: string): LocationTypeId {
  switch (type.toUpperCase()) {
    case 'LAB':
      return 'laboratory';
    case 'CORRIDOR':
    case 'WASHROOM':
      return 'common';
    case 'CLASSROOM':
      return 'academic';
    default:
      return 'facility';
  }
}

export function normalizeLocationText(value: string): string {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, '');
}

export function apiLocationMatchesCandidate(
  location: { roomCode: string; name: string; floor: number; type: string },
  candidate: LocationCandidate,
): boolean {
  if (candidate.blockId && inferBlockId(location.roomCode) !== candidate.blockId) return false;
  if (candidate.floor !== undefined && location.floor !== candidate.floor) return false;

  const knownCodes = [candidate.roomCode, candidate.label, ...(candidate.aliases ?? [])]
    .filter((code): code is string => Boolean(code))
    .map(normalizeLocationText);
  const apiCodes = [location.roomCode, location.name].map(normalizeLocationText);
  return knownCodes.some((code) => apiCodes.includes(code));
}
