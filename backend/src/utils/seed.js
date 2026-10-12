import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Accommodation from '../models/Accommodation.js';

dotenv.config();

const pilotListings = [
  // --- LAGOS: IKEJA LGA (4 listings) ---
  {
    title: 'Self-contain lodge near Ikeja Secretariat',
    description: 'Clean self-contain apartment with tiled floor, running borehole water, and prepaid meter.',
    price: 320000,
    address: '14 Allen Avenue, Ikeja, Lagos',
    state: 'Lagos',
    lga: 'Ikeja',
    ppa_proximity: 'Approximately 7 minutes transit to State Secretariat / NYSC Camp',
    photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
    property_info: ['borehole_water', 'prepaid_meter', 'fenced_gate'],
    contact_phone: '+2348011223344',
    contact_whatsapp: '+2348011223344',
    source: 'Alumni Referral',
    status: 'active',
    verification_status: 'verified',
  },
  {
    title: 'Single room in shared flat for Corps Members',
    description: 'Furnished room in a 3-bedroom flat reserved strictly for serving corps members.',
    price: 180000,
    address: '6 Obafemi Awolowo Way, Ikeja, Lagos',
    state: 'Lagos',
    lga: 'Ikeja',
    ppa_proximity: 'Approximately 10 minutes walk to Ikeja Bus Terminal',
    photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
    property_info: ['generator_backup', 'fenced_gate', 'security_guard'],
    contact_phone: '+2348022334455',
    contact_whatsapp: '+2348022334455',
    source: 'Corper CDS Rep',
    status: 'active',
    verification_status: 'verified',
  },
  {
    title: 'Studio apartment near Computer Village PPA hub',
    description: 'Compact, quiet studio with personal bathroom and kitchenette.',
    price: 250000,
    address: '22 Medical Road, Ikeja, Lagos',
    state: 'Lagos',
    lga: 'Ikeja',
    ppa_proximity: 'Approximately 5 minutes walk to Ikeja LGA Secretariat',
    photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'],
    property_info: ['water_board', 'prepaid_meter'],
    contact_phone: '+2348033445566',
    contact_whatsapp: '+2348033445566',
    source: 'CDS President',
    status: 'active',
    verification_status: 'verified',
  },
  {
    title: 'Room and parlor mini flat near Oregun',
    description: 'Spacious flat with separate living room, balcony, and steady community transformer.',
    price: 450000,
    address: '8 Kudirat Abiola Way, Oregun, Ikeja, Lagos',
    state: 'Lagos',
    lga: 'Ikeja',
    ppa_proximity: 'Approximately 12 minutes transit to Ikeja PPA clusters',
    photos: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb'],
    property_info: ['car_park', 'borehole_water', 'fenced_gate'],
    contact_phone: '+2348044556677',
    contact_whatsapp: '+2348044556677',
    source: 'Verified Local Landlord',
    status: 'active',
    verification_status: 'verified',
  },

  // --- OYO: IBADAN NORTH LGA (4 listings) ---
  {
    title: 'Self-contain flat near University of Ibadan (UI)',
    description: 'Affordable self-contain unit popular with corps members posted to UI and nearby secondary schools.',
    price: 140000,
    address: 'Plot 4 Agbowo Community, Ibadan North, Oyo',
    state: 'Oyo',
    lga: 'Ibadan North',
    ppa_proximity: 'Approximately 5 minutes trek to UI Main Gate',
    photos: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'],
    property_info: ['borehole_water', 'steady_light', 'fenced_gate'],
    contact_phone: '+2348055667788',
    contact_whatsapp: '+2348055667788',
    source: 'Alumni Referral',
    status: 'active',
    verification_status: 'verified',
  },
  {
    title: 'Single room lodge at Bodija',
    description: 'Well-ventilated room with shared kitchen and bathroom facilities in a secured compound.',
    price: 90000,
    address: '19 Housing Corporation Road, Bodija, Ibadan North, Oyo',
    state: 'Oyo',
    lga: 'Ibadan North',
    ppa_proximity: 'Approximately 10 minutes to State Secretariat Agodi',
    photos: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9'],
    property_info: ['serene_environment', 'security_guard'],
    contact_phone: '+2348066778899',
    contact_whatsapp: '+2348066778899',
    source: 'Corper CDS Rep',
    status: 'active',
    verification_status: 'verified',
  },
  {
    title: 'Corpers lodge sharing unit - Sango / UI axis',
    description: 'Room in a 2-room flat with water, constant electricity line, and no landlord on premises.',
    price: 110000,
    address: 'Old Poly Road, Sango, Ibadan North, Oyo',
    state: 'Oyo',
    lga: 'Ibadan North',
    ppa_proximity: 'Approximately 8 minutes to Ibadan North LGA Secretariat',
    photos: ['https://images.unsplash.com/photo-1502005229762-ee152da92e06'],
    property_info: ['prepaid_meter', 'running_water'],
    contact_phone: '+2348077889900',
    contact_whatsapp: '+2348077889900',
    source: 'CDS President',
    status: 'active',
    verification_status: 'verified',
  },
  {
    title: 'Standard mini-flat near Secretariat Agodi',
    description: 'Modern room & parlor close to ministerial complex and state government agencies.',
    price: 220000,
    address: 'Behind Parliament Building, Agodi, Ibadan North, Oyo',
    state: 'Oyo',
    lga: 'Ibadan North',
    ppa_proximity: 'Approximately 3 minutes walk to Oyo State Secretariat',
    photos: ['https://images.unsplash.com/photo-1484154218962-a197022b5858'],
    property_info: ['water_tanker_supply', 'gated_compound', 'stable_power'],
    contact_phone: '+2348088990011',
    contact_whatsapp: '+2348088990011',
    source: 'Verified Local Landlord',
    status: 'active',
    verification_status: 'verified',
  },

  // --- LAGOS: KOSOFE LGA (4 listings) ---
  {
    title: 'Executive self-contain in Ogudu',
    description: 'Modern studio with fitted wardrobe, personal meter, and perimeter electric fence.',
    price: 380000,
    address: '11 Ogudu Road, Kosofe, Lagos',
    state: 'Lagos',
    lga: 'Kosofe',
    ppa_proximity: 'Approximately 15 minutes drive to Ikeja via Ojota bridge',
    photos: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
    property_info: ['electric_fence', 'borehole_water', 'tarred_road'],
    contact_phone: '+2348099001122',
    contact_whatsapp: '+2348099001122',
    source: 'Alumni Referral',
    status: 'active',
    verification_status: 'verified',
  },
  {
    title: 'Budget room in shared flat - Ojota axis',
    description: 'Ideal starter room for corpers seeking rapid transit connections across Lagos mainland.',
    price: 160000,
    address: '3 Kudirat Street, Ojota, Kosofe, Lagos',
    state: 'Lagos',
    lga: 'Kosofe',
    ppa_proximity: 'Approximately 5 minutes walk to Ojota main bus hub',
    photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
    property_info: ['water_storage_tank', 'gated_street'],
    contact_phone: '+2348100112233',
    contact_whatsapp: '+2348100112233',
    source: 'Corper CDS Rep',
    status: 'active',
  },
  {
    title: 'Gated self-contain in Ketu / Alapere',
    description: 'Quiet residential neighborhood with treated borehole water and private balcony.',
    price: 260000,
    address: 'Estate Gate 2, Alapere, Kosofe, Lagos',
    state: 'Lagos',
    lga: 'Kosofe',
    ppa_proximity: 'Approximately 10 minutes transit to Kosofe LGA Secretariat',
    photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
    property_info: ['security_guard', 'borehole_water'],
    contact_phone: '+2348111223344',
    contact_whatsapp: '+2348111223344',
    source: 'CDS President',
    status: 'active',
    verification_status: 'verified',
  },
  {
    title: 'Decent 1-bedroom flat in Mile 12 / Owode axis',
    description: 'Affordable full flat for corps members desiring private living quarters outside heavy traffic corridors.',
    price: 300000,
    address: '15 Ikorodu Road, Owode-Onirin, Kosofe, Lagos',
    state: 'Lagos',
    lga: 'Kosofe',
    ppa_proximity: 'Approximately 15 minutes BRT direct access route to PPA locations',
    photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'],
    property_info: ['fenced_gate', 'brt_access'],
    contact_phone: '+2348122334455',
    contact_whatsapp: '+2348122334455',
    source: 'Verified Local Landlord',
    status: 'active',
    verification_status: 'verified',
  },
];

const seedDatabase = async () => {
  try {
    if (!process.env.DATABASE_URI) {
      throw new Error('DATABASE_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.DATABASE_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing pilot listings
    await Accommodation.deleteMany({
      $or: [
        { state: 'Lagos', lga: { $in: ['Ikeja', 'Kosofe'] } },
        { state: 'Oyo', lga: 'Ibadan North' },
      ],
    });
    console.log('Cleared previous pilot accommodations.');

    // Insert seeded records
    const inserted = await Accommodation.insertMany(pilotListings);
    console.log(`Successfully seeded ${inserted.length} pilot accommodations across Ikeja, Ibadan North, and Kosofe!`);

    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();