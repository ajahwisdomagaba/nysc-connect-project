import { successResponse, errorResponse } from '../utils/response.js';
//seed location datatset for the MVP Pilot

const LOCATIONS_DATA = [
    {
        state: 'Lagos',
        lgas: ['Ikeja', 'Kosofe']
    },
    {
        state: 'Oyo',
        lgas: ['Ibadan North']
    },
]
//GET /api/v1/locations/states
export const getStates = async (req, res) => {
    const states = LOCATIONS_DATA.map(location => location.state);
    return res.status(200).json({
        status: 'success',
        message: 'State retrieved successfully',
        data: { states }
    });
};

//GET /api/v1/locations/lgas?state=Lagos
export const getLgasByState = async (req, res) => {
    const { state } = req.query;

    if (!state) {
        return res.status(400).json({
            status: 'error',
            message: 'State is required'
        });
    }
const found = LOCATIONS_DATA.find((loc) => loc.state.toLowerCase() === state.trim().toLowerCase());

const lgas = found ? found.lgas : [];
return res.status(200).json({
    status: 'success',
    message: 'LGAs retrieved successfully',
    data: { state, lgas }
});
};