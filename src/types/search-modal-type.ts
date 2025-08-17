export interface SearchModalType {
    location: string;
    placeDetails: any;
    propertyType: {
        pg: boolean;
        flat: boolean;
        shared: boolean;
    };
    ownerType: 'any' | 'owner' | 'broker';
    budget: [number, number];
};