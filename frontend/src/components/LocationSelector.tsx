import { useMemo, useState } from 'react';
import type { LocationItem } from '../types';
import {
  apiLocationMatchesCandidate,
  CAMPUS_BLOCKS,
  getLocationTypeForApi,
  LOCATION_CANDIDATES,
  LOCATION_TYPES,
  type LocationCandidate,
  type LocationTypeId,
} from '../data/locationCatalog';

interface LocationSelectorProps {
  locations: LocationItem[];
  locationsLoading: boolean;
  locationsError: string | null;
  onRetryLocations: () => void;
  selectedLocationId: string;
  onSelectLocation: (locationId: string) => void;
}

interface LocationOption {
  id: string;
  label: string;
  locationType: LocationTypeId;
  blockId?: string;
  floor?: number;
  source: LocationCandidate['source'] | 'registered';
  backendLocationId?: string;
  roomCode?: string;
  searchText: string;
}

function getOptions(locations: LocationItem[]): LocationOption[] {
  const registered = locations.map((location) => {
    const match = LOCATION_CANDIDATES.find((candidate) =>
      apiLocationMatchesCandidate(location, candidate),
    );
    return {
      id: `api:${location.id}`,
      label: match?.label ?? `${location.roomCode} — ${location.name}`,
      locationType: match?.locationType ?? getLocationTypeForApi(location.type),
      blockId: match?.blockId ?? location.roomCode.match(/^([A-Z]\d?)-/i)?.[1]?.toUpperCase(),
      floor: match ? match.floor : location.floor,
      source: 'registered' as const,
      backendLocationId: location.id,
      roomCode: location.roomCode,
      searchText: `${location.roomCode} ${location.name} ${location.type} ${location.buildingId} ${match?.aliases?.join(' ') ?? ''}`,
    };
  });

  const candidates = LOCATION_CANDIDATES
    .filter((candidate) =>
      !locations.some((location) => apiLocationMatchesCandidate(location, candidate)),
    )
    .map((candidate) => ({
      id: candidate.id,
      label: candidate.label,
      locationType: candidate.locationType,
      blockId: candidate.blockId,
      floor: candidate.floor,
      source: candidate.source,
      roomCode: candidate.roomCode,
      searchText: `${candidate.label} ${candidate.roomCode ?? ''} ${candidate.blockId ?? ''} ${candidate.aliases?.join(' ') ?? ''}`,
    }));

  return [...registered, ...candidates];
}

export function LocationSelector({
  locations,
  locationsLoading,
  locationsError,
  onRetryLocations,
  selectedLocationId,
  onSelectLocation,
}: LocationSelectorProps) {
  const options = useMemo(() => getOptions(locations), [locations]);
  const [locationType, setLocationType] = useState<LocationTypeId | ''>('');
  const [blockId, setBlockId] = useState('');
  const [floor, setFloor] = useState('');
  const [selectionId, setSelectionId] = useState('');
  const [search, setSearch] = useState('');
  const [otherLocation, setOtherLocation] = useState('');

  const externalSelection = options.find(
    (option) => option.backendLocationId === selectedLocationId,
  );
  const activeExternalSelection =
    externalSelection && externalSelection.id !== selectionId
      ? externalSelection
      : undefined;
  const currentType = activeExternalSelection?.locationType ?? locationType;
  const currentBlock = activeExternalSelection
    ? activeExternalSelection.blockId ?? ''
    : blockId;
  const currentFloor = activeExternalSelection
    ? activeExternalSelection.floor !== undefined
      ? String(activeExternalSelection.floor)
      : ''
    : floor;
  const currentSelectionId = activeExternalSelection
    ? activeExternalSelection.id
    : selectionId;

  const availableTypes = options.filter(
    (option) => !currentBlock || option.blockId === currentBlock || !option.blockId,
  );
  const availableBlocks = CAMPUS_BLOCKS.filter((block) =>
    (currentType === 'academic' && ['K1', 'K2', 'K3'].includes(block.id)) ||
      options.some(
        (option) =>
          option.locationType === currentType &&
          option.blockId === block.id &&
          !(currentType === 'laboratory' && ['D', 'F1', 'F2', 'F3', 'J1', 'J2', 'J3'].includes(block.id)),
      ),
  );
  const blockOptions = options.filter(
    (option) =>
      option.locationType === currentType &&
      (option.blockId === currentBlock ||
        (currentBlock === 'campus-wide' && !option.blockId)) &&
      !(currentType === 'laboratory' && ['D', 'F1', 'F2', 'F3', 'J1', 'J2', 'J3'].includes(currentBlock)),
  );
  const floors = [...new Set(blockOptions.flatMap((option) => option.floor === undefined ? [] : [option.floor]))]
    .sort((a, b) => a - b);
  const hasFloorOptions = floors.length > 0;
  const filteredOptions = blockOptions
    .filter(
      (option) =>
        (option.floor === undefined || (currentFloor && option.floor === Number(currentFloor))) &&
        option.searchText.toLowerCase().includes(search.trim().toLowerCase()),
    )
    .sort((a, b) => a.label.localeCompare(b.label));
  const selectedOption = options.find((option) => option.id === currentSelectionId);
  const selectedTypeLabel = LOCATION_TYPES.find((type) => type.id === currentType)?.label;
  const selectedSummary = selectedOption
    ? `${selectedOption.blockId ? `${selectedOption.blockId} · ` : ''}${selectedOption.floor !== undefined ? `${selectedOption.floor === 0 ? 'Ground floor' : `Floor ${selectedOption.floor}`} · ` : ''}${selectedOption.roomCode ? `${selectedOption.roomCode} · ` : ''}${selectedOption.label}`
    : otherLocation.trim();

  function clearLocationSelection() {
    setSelectionId('');
    setSearch('');
    setOtherLocation('');
    onSelectLocation('');
  }

  function changeType(nextType: LocationTypeId) {
    const canKeepBlock = options.some(
      (option) => option.locationType === nextType && option.blockId === currentBlock,
    );
    const nextBlock = canKeepBlock ? currentBlock : '';
    const canKeepFloor = options.some(
      (option) =>
        option.locationType === nextType &&
        option.blockId === nextBlock &&
        currentFloor !== '' &&
        option.floor === Number(currentFloor),
    );

    setLocationType(nextType);
    setBlockId(nextBlock);
    setFloor(canKeepFloor ? currentFloor : '');
    clearLocationSelection();
  }

  function changeBlock(nextBlock: string) {
    setLocationType(currentType);
    setBlockId(nextBlock);
    setFloor('');
    setSearch('');
    setSelectionId('');
    setOtherLocation('');
    onSelectLocation('');
  }

  function changeFloor(nextFloor: string) {
    setLocationType(currentType);
    setBlockId(currentBlock);
    setFloor(nextFloor);
    setSearch('');
    setSelectionId('');
    setOtherLocation('');
    onSelectLocation('');
  }

  function chooseOption(id: string) {
    setLocationType(currentType);
    setBlockId(currentBlock);
    setFloor(currentFloor);
    setSelectionId(id);
    setOtherLocation('');
    const selected = options.find((option) => option.id === id);
    onSelectLocation(selected?.backendLocationId ?? '');
  }

  function chooseNotListed() {
    setLocationType(currentType);
    setBlockId(currentBlock);
    setFloor(currentFloor);
    const id = `other:${currentBlock}:${currentFloor}`;
    setSelectionId(id);
    setOtherLocation('');
    onSelectLocation('');
  }

  const isCustomLocation = currentSelectionId.startsWith('other:');

  return (
    <section className="location-selector" aria-labelledby="report-location-heading">
      <div className="location-selector-heading">
        <span className="form-label" id="report-location-heading">Campus Room / Space *</span>
        <p>Choose a location type, then narrow it down to a block, floor, and place.</p>
      </div>
      {locationsLoading && <p className="location-selector-hint" role="status">Loading the registered campus locations…</p>}
      {locationsError && (
        <p className="location-selector-warning" role="alert">
          {locationsError}{' '}
          <button type="button" className="location-selector-retry" onClick={onRetryLocations}>Retry</button>
        </p>
      )}
      {!locationsLoading && !locationsError && locations.length === 0 && (
        <p className="location-selector-warning" role="status">
          The campus directory has no registered locations. Candidate rooms cannot be submitted until a location record is added.
        </p>
      )}

      <div className="location-selector-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="location-type">Location type</label>
          <select
            id="location-type"
            className="form-select"
            value={currentType}
            onChange={(event) => changeType(event.target.value as LocationTypeId)}
            disabled={locationsLoading}
            required
          >
            <option value="" disabled>Select a location type</option>
            {LOCATION_TYPES.map((type) => (
              <option
                key={type.id}
                value={type.id}
                disabled={type.id !== 'other' && !availableTypes.some((option) => option.locationType === type.id)}
              >
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {currentType && (
          <div className="form-group">
            <label className="form-label" htmlFor="location-block">Block / area</label>
            <select
              id="location-block"
              className="form-select"
              value={currentBlock}
              onChange={(event) => changeBlock(event.target.value)}
              disabled={locationsLoading}
              required
            >
              <option value="">Select a block or area</option>
              {availableBlocks.map((block) => (
                <option key={block.id} value={block.id}>{block.label}</option>
              ))}
              <option value="campus-wide">Campus-wide / not sure</option>
            </select>
          </div>
        )}

        {currentType && currentBlock && currentBlock !== 'campus-wide' && hasFloorOptions && (
          <div className="form-group">
            <label className="form-label" htmlFor="location-floor">Floor</label>
            <select
              id="location-floor"
              className="form-select"
              value={currentFloor}
              onChange={(event) => changeFloor(event.target.value)}
              disabled={locationsLoading}
            >
              <option value="">Any floor / select a facility</option>
              {floors.map((floorNumber) => (
                <option key={floorNumber} value={floorNumber}>
                  {floorNumber === 0 ? 'Ground floor' : `Floor ${floorNumber}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {currentType && currentBlock && (
        <div className="form-group location-selector-specific">
          <label className="form-label" htmlFor="location-search">Specific room / facility</label>
          <input
            id="location-search"
            className="form-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            disabled={locationsLoading}
            placeholder="Search rooms, halls, facilities, or aliases"
            aria-controls="location-options"
          />
          <select
            id="location-options"
            className="form-select"
            value={currentSelectionId.startsWith('other:') ? 'other' : currentSelectionId}
            onChange={(event) => event.target.value === 'other' ? chooseNotListed() : chooseOption(event.target.value)}
            disabled={locationsLoading}
            required
          >
            <option value="">Select a room or facility</option>
            {filteredOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
            <option value="other">Other / Not Listed</option>
          </select>
          {filteredOptions.length === 0 && (
            <p className="location-selector-hint">No listed locations match. Choose Other / Not Listed and describe the place.</p>
          )}
          {filteredOptions.some((option) => option.source !== 'registered') && (
            <p className="location-selector-hint">
              Candidate rooms and map-listed facilities are not yet in the dispatch directory and cannot be submitted until an existing location record is available.
            </p>
          )}
        </div>
      )}

      {isCustomLocation && (
        <div className="form-group">
          <label className="form-label" htmlFor="location-other">Describe the unlisted location *</label>
          <input
            id="location-other"
            className="form-input"
            value={otherLocation}
            onChange={(event) => setOtherLocation(event.target.value)}
            disabled={locationsLoading}
            placeholder="Building, floor, nearby landmark, or facility"
            required
            maxLength={160}
          />
        </div>
      )}

      {selectedSummary && (
        <div className="location-selection-summary" aria-live="polite">
          <span>Selected location</span>
          <strong>{selectedSummary}</strong>
          <button type="button" onClick={clearLocationSelection}>Change location</button>
        </div>
      )}

      {currentType && currentBlock === 'campus-wide' && (
        <p className="location-selector-warning" role="status">
          A campus-wide location is not linked to a dispatch record. Choose a listed block or facility to submit a report.
        </p>
      )}
      {selectedTypeLabel && selectedOption?.source === 'registered' && (
        <p className="location-selector-hint">This location is registered in the campus dispatch directory.</p>
      )}
      {currentType === 'academic' && ['K1', 'K2', 'K3'].includes(currentBlock) && (
        <p className="location-selector-hint">
          No classroom inventory is supplied for K blocks. Only locations returned by the dispatch directory can be submitted.
        </p>
      )}
    </section>
  );
}
