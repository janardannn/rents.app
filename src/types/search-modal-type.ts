// types/search-modal-type.ts

interface PlaceCoordinates {
    lng: number;
    lat: number;
}

interface PlaceDetails {
    name: string;
    address: string;
    coords: PlaceCoordinates;
}

export interface SearchModalType {
    location: string;
    placeDetails: PlaceDetails | null;
    propertyType: {
        pg: boolean;
        flat: boolean;
        shared: boolean;
    };
    ownerType: 'any' | 'owner' | 'broker';
    budget: [number, number];
}