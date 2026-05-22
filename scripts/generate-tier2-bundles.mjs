// Generate complete merged tier-2 CSV bundles for M Grand Minori and Paragon Signature Suite
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const BASE = 'samples/bulk-import/tier-2-projects';
const SRC_MGM = 'samples/bulk-import/m-grand-minori';
const SRC_PSS = 'samples/bulk-import/paragon-signature-suite';

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, { encoding: 'utf-8' });
  console.log(`  written: ${path}`);
}

function replaceSlug(srcPath, oldSlug, newSlug) {
  return readFileSync(srcPath, 'utf-8').replaceAll(oldSlug, newSlug);
}

// ═══════════════════════════════════════════════════════════════════════════
// M GRAND MINORI
// ═══════════════════════════════════════════════════════════════════════════
const MGM = `${BASE}/m-grand-minori`;
const OLD_MGM = 'm-grand-minori-pelangi';
const NEW_MGM = 'm-grand-minori';

console.log('\n[M Grand Minori]');

// 01 project
write(`${MGM}/01-project.csv`,
`action,slug,name,displayName,legalName,description,developerSlug,propertyCategoryCode,propertyTypeCode,projectStatusCode,tenureTypeCode,titleTypeCode,stateName,regionName,areaName,address,latitude,longitude,totalUnits,launchYear,bookingFee,maintenanceFeePerSqft,isPublished,isForeignerEligible,landAreaAcres,bookingFeeBumi,sinkingFundPerSqft,isGatedCommunity,greenCertification
create,m-grand-minori,M Grand Minori,M Grand Minori,Dsara Sentral Sdn Bhd,59-storey serviced apartment with dual-key options at Taman Pelangi,developer-dsara-sentral,HIGHRISE,SERVICED_APARTMENT,PLANNING,FREEHOLD,STRATA,Johor,Johor Bahru,Taman Pelangi,"Jalan Sri Pelangi x Jalan Kuning, Taman Pelangi 80400 Johor Bahru",1.4842,103.7721,1733,2026,1000,0.40,yes,yes,5.99,1000,0.10,yes,GREENRE
`);

// 02 phases
write(`${MGM}/02-phases.csv`,
`action,projectSlug,phaseCode,phaseName,completionDate,constructionStatusCode
create,m-grand-minori,P1,Phase 1,2030-09-30,PLANNING
`);

// 03 towers
write(`${MGM}/03-towers.csv`,
`action,projectSlug,phaseName,towerNumber,towerName,floorCount,floorMin,floorMax
create,m-grand-minori,Phase 1,TOWER-A,Tower A,59,13,59
`);

// 04 layouts
write(`${MGM}/04-layouts.csv`,
`action,projectSlug,layoutCode,layoutName,bedrooms,bathrooms,builtUpSqft,studyRooms,hasBalcony,hasYard,virtualTourUrl,isDualKey,ceilingHeightM,furnishingStatus
create,m-grand-minori,TYPE_A,Studio,1,1,403,0,no,no,,no,3.0,UNFURNISHED
create,m-grand-minori,TYPE_B,1 Bedroom + 1 Bathroom,1,1,496,0,no,no,,no,3.0,UNFURNISHED
create,m-grand-minori,TYPE_C,1 Bedroom + 2 Bathroom (Dual Key),1,2,624,0,no,no,,yes,3.0,UNFURNISHED
create,m-grand-minori,TYPE_D,1+1 Bedroom + 1 Bathroom,1,1,630,1,no,no,,no,3.0,UNFURNISHED
create,m-grand-minori,TYPE_D1,1+1 Bedroom + 1 Bathroom (Corner),1,1,630,1,no,no,,no,3.0,UNFURNISHED
create,m-grand-minori,TYPE_E,3 Bedroom + 2 Bathroom (Dual Key),3,2,835,0,no,no,,yes,3.0,UNFURNISHED
`);

// 05 units – replace slug
const mgmUnits = replaceSlug(`${SRC_MGM}/units.csv`, OLD_MGM, NEW_MGM);
write(`${MGM}/05-units.csv`, mgmUnits);

// 06 sales-packages
write(`${MGM}/06-sales-packages.csv`,
`action,projectSlug,name,buyerTypeCode,rebatePercentage,cashBackAmount,validFrom,validTo,isActive
create,m-grand-minori,SPA Rebate 13%,LOCAL,13.00,,2026-01-01,,true
create,m-grand-minori,Cash Buyer Early Bird Rebate 10%,LOCAL,10.00,,2026-01-01,2026-12-31,true
create,m-grand-minori,Cash Buyer Normal Rebate 8%,LOCAL,8.00,,2026-01-01,,true
create,m-grand-minori,Free Legal Fees on SPA and LA,LOCAL,0.00,,2026-01-01,,true
create,m-grand-minori,Free Stamp Duty on Loan Agreement,LOCAL,0.00,,2026-01-01,,true
create,m-grand-minori,Free Digital Lock Set,LOCAL,0.00,,2026-01-01,,true
create,m-grand-minori,Free Air-Cond for Living and Bedroom,LOCAL,0.00,,2026-01-01,,true
create,m-grand-minori,Free Instant Water Heater,LOCAL,0.00,,2026-01-01,,true
create,m-grand-minori,Free Kitchen Cabinet with Hood and Hob,LOCAL,0.00,,2026-01-01,,true
create,m-grand-minori,Free 2-in-1 Washer and Dryer,LOCAL,0.00,,2026-01-01,,true
`);

// 07 nearby-places
write(`${MGM}/07-nearby-places.csv`,
`action,projectSlug,name,category,distance_km,sortOrder
create,m-grand-minori,Johor Causeway / CIQ,Transport,4.7,1
create,m-grand-minori,RTS Station,Transport,3.0,2
create,m-grand-minori,Larkin Sentral Bus Terminal,Transport,7.4,3
create,m-grand-minori,Plaza Pelangi,Shopping,1.5,4
create,m-grand-minori,KSL City Mall,Shopping,2.1,5
create,m-grand-minori,RNF Mall,Shopping,4.1,6
create,m-grand-minori,JB City Square,Shopping,4.4,7
create,m-grand-minori,Mid Valley Southkey,Shopping,5.7,8
create,m-grand-minori,Columbia Asia Hospital,Healthcare,4.5,9
create,m-grand-minori,KPJ Johor Specialist Hospital,Healthcare,5.5,10
create,m-grand-minori,Hospital Sultanah Aminah,Healthcare,5.7,11
create,m-grand-minori,SMK Taman Pelangi,Education,1.4,12
create,m-grand-minori,Foon Yew High School,Education,3.4,13
create,m-grand-minori,Tiara Sport World,Recreation,2.8,14
create,m-grand-minori,Istana Pasir Pelangi,Landmark,2.3,15
create,m-grand-minori,Menara MBJB,Landmark,2.4,16
create,m-grand-minori,Stulang Beach,Recreation,3.1,17
`);

// 08 pricing-snapshots (13% bumi discount = 15% off SPA)
write(`${MGM}/08-pricing-snapshots.csv`,
`action,projectSlug,phaseName,towerNumber,layoutCode,buyerTypeCode,viewKey,spaPriceMin,spaPriceMax,nettPriceMin,nettPriceMax,rebatePercentTotal,snapshotDate,sourceNote
create,m-grand-minori,Phase 1,TOWER-A,TYPE_A,LOCAL,,390000,400000,339300,348000,13.00,2026-01-01,Tower A indicative launch pricing
create,m-grand-minori,Phase 1,TOWER-A,TYPE_B,LOCAL,,465000,485000,404550,422050,13.00,2026-01-01,Tower A indicative launch pricing
create,m-grand-minori,Phase 1,TOWER-A,TYPE_C,LOCAL,,591000,621000,514170,540270,13.00,2026-01-01,Tower A indicative launch pricing
create,m-grand-minori,Phase 1,TOWER-A,TYPE_D,LOCAL,,609000,624000,529830,543120,13.00,2026-01-01,Tower A indicative launch pricing
create,m-grand-minori,Phase 1,TOWER-A,TYPE_D1,LOCAL,,610000,630000,530700,548100,13.00,2026-01-01,Tower A indicative launch pricing
create,m-grand-minori,Phase 1,TOWER-A,TYPE_E,LOCAL,,769000,800000,669030,696000,13.00,2026-01-01,Tower A indicative launch pricing
create,m-grand-minori,Phase 1,TOWER-A,TYPE_A,BUMIPUTERA,,331500,340000,288405,295800,13.00,2026-01-01,Tower A Bumi pricing (15% discount on SPA)
create,m-grand-minori,Phase 1,TOWER-A,TYPE_B,BUMIPUTERA,,395250,412250,343868,358658,13.00,2026-01-01,Tower A Bumi pricing (15% discount on SPA)
create,m-grand-minori,Phase 1,TOWER-A,TYPE_C,BUMIPUTERA,,502350,527850,437045,459430,13.00,2026-01-01,Tower A Bumi pricing (15% discount on SPA)
create,m-grand-minori,Phase 1,TOWER-A,TYPE_D,BUMIPUTERA,,517650,530400,450556,461448,13.00,2026-01-01,Tower A Bumi pricing (15% discount on SPA)
create,m-grand-minori,Phase 1,TOWER-A,TYPE_D1,BUMIPUTERA,,518500,535500,451095,465885,13.00,2026-01-01,Tower A Bumi pricing (15% discount on SPA)
create,m-grand-minori,Phase 1,TOWER-A,TYPE_E,BUMIPUTERA,,653650,680000,568676,591600,13.00,2026-01-01,Tower A Bumi pricing (15% discount on SPA)
`);

// 09-11 from source with slug fix
write(`${MGM}/09-tower-facing-groups.csv`, replaceSlug(`${SRC_MGM}/tower-facing-groups.csv`, OLD_MGM, NEW_MGM));
write(`${MGM}/10-tower-stacks.csv`, replaceSlug(`${SRC_MGM}/tower-stacks.csv`, OLD_MGM, NEW_MGM));
write(`${MGM}/11-tower-special-floors.csv`, replaceSlug(`${SRC_MGM}/tower-special-floors.csv`, OLD_MGM, NEW_MGM));

// ═══════════════════════════════════════════════════════════════════════════
// PARAGON SIGNATURE SUITE
// ═══════════════════════════════════════════════════════════════════════════
const PSS = `${BASE}/paragon-signature-suite`;
const OLD_PSS = 'paragon-signature-suites';
const NEW_PSS = 'paragon-signature-suite';

console.log('\n[Paragon Signature Suite]');

// 01 project
write(`${PSS}/01-project.csv`,
`action,slug,name,displayName,legalName,description,developerSlug,propertyCategoryCode,propertyTypeCode,projectStatusCode,tenureTypeCode,titleTypeCode,stateName,regionName,areaName,address,latitude,longitude,totalUnits,launchYear,bookingFee,maintenanceFeePerSqft,isPublished,isForeignerEligible,landAreaAcres,bookingFeeBumi,sinkingFundPerSqft,isGatedCommunity,greenCertification
create,paragon-signature-suite,Paragon Signature Suites,Paragon Signature,Paragon Urban Sdn Bhd,32-floor Airbnb-friendly serviced apartment near JB city core. GreenRE certified.,developer-paragon-urban,HIGHRISE,SERVICED_APARTMENT,UNDER_CONSTRUCTION,FREEHOLD,STRATA,Johor,Johor Bahru,Jalan Abdul Samad,Jalan Abdul Samad Johor Bahru,1.4728,103.7581,484,2026,1000,0.375,yes,yes,1.14,1000,0.10,yes,GREENRE
`);

// 02 phases
write(`${PSS}/02-phases.csv`,
`action,projectSlug,phaseCode,phaseName,completionDate,constructionStatusCode
create,paragon-signature-suite,P1,Phase 1,2029-06-30,UNDER_CONSTRUCTION
`);

// 03 towers
write(`${PSS}/03-towers.csv`,
`action,projectSlug,phaseName,towerNumber,towerName,floorCount,floorMin,floorMax
create,paragon-signature-suite,Phase 1,TOWER-1,Tower 1,32,11,32
`);

// 04 layouts
write(`${PSS}/04-layouts.csv`,
`action,projectSlug,layoutCode,layoutName,bedrooms,bathrooms,builtUpSqft,studyRooms,hasBalcony,hasYard,virtualTourUrl,isDualKey,ceilingHeightM,furnishingStatus
create,paragon-signature-suite,TYPE_A,1+1 Bedroom + 1 Bathroom,1,1,646,1,yes,no,,no,3.0,SEMI_FURNISHED
create,paragon-signature-suite,TYPE_B,1 Bedroom + 1 Bathroom,1,1,649,0,yes,no,,no,3.0,SEMI_FURNISHED
`);

// 05 units – replace slug
const pssUnits = replaceSlug(`${SRC_PSS}/units.csv`, OLD_PSS, NEW_PSS);
write(`${PSS}/05-units.csv`, pssUnits);

// 06 sales-packages
write(`${PSS}/06-sales-packages.csv`,
`action,projectSlug,name,buyerTypeCode,rebatePercentage,cashBackAmount,validFrom,validTo,isActive
create,paragon-signature-suite,SPA Rebate 20%,LOCAL,20.00,,2026-01-01,,true
create,paragon-signature-suite,Move-In Bonus 2%,LOCAL,2.00,,2026-01-01,2025-08-31,true
create,paragon-signature-suite,Cash Buyer Extra Rebate 3%,LOCAL,3.00,,2026-01-01,,true
create,paragon-signature-suite,Free SPA and LA Legal Fees,LOCAL,0.00,,2026-01-01,,true
create,paragon-signature-suite,Free Stamp Duty on LA,LOCAL,0.00,,2026-01-01,,true
create,paragon-signature-suite,"Loyalty Reward RM5000 for Repeat Purchase",LOCAL,0.00,5000,2026-01-01,,true
create,paragon-signature-suite,Free Two Years Shuttle Bus,LOCAL,0.00,,2026-01-01,,true
`);

// 07 nearby-places
write(`${PSS}/07-nearby-places.csv`,
`action,projectSlug,name,category,distance_km,sortOrder
create,paragon-signature-suite,KPJ Johor Specialist Hospital,Healthcare,1.6,1
create,paragon-signature-suite,Hospital Sultanah Aminah,Healthcare,3.3,2
create,paragon-signature-suite,Big Pharmacy,Healthcare,3.0,3
create,paragon-signature-suite,KPJ Puteri Specialist,Healthcare,6.4,4
create,paragon-signature-suite,Columbia Asia Hospital Tebrau,Healthcare,6.6,5
create,paragon-signature-suite,Plaza Pelangi,Shopping,3.5,6
create,paragon-signature-suite,Johor Bahru City Square,Shopping,4.5,7
create,paragon-signature-suite,KSL City Mall,Shopping,4.6,8
create,paragon-signature-suite,Mid Valley Southkey,Shopping,5.0,9
create,paragon-signature-suite,Paradigm Mall JB,Shopping,12.5,10
create,paragon-signature-suite,SJK(C) Foon Yew 2,Education,1.9,11
create,paragon-signature-suite,SMK Sultan Ismail,Education,2.2,12
create,paragon-signature-suite,English College JB,Education,2.3,13
create,paragon-signature-suite,Monash University Malaysia,Education,2.9,14
create,paragon-signature-suite,Foon Yew High School,Education,5.4,15
create,paragon-signature-suite,Johor Zoo,Recreation,4.0,16
create,paragon-signature-suite,Johor Golf and Country Club,Recreation,6.3,17
create,paragon-signature-suite,Beletime Danga Bay,Recreation,5.2,18
create,paragon-signature-suite,Famous Cafe,Dining,0.1,19
create,paragon-signature-suite,KFC Seri Gelam,Dining,0.7,20
`);

// 08 pricing-snapshots (20%+2% early = 22% nett; 20% standard)
write(`${PSS}/08-pricing-snapshots.csv`,
`action,projectSlug,phaseName,towerNumber,layoutCode,buyerTypeCode,viewKey,spaPriceMin,spaPriceMax,nettPriceMin,nettPriceMax,rebatePercentTotal,snapshotDate,sourceNote
create,paragon-signature-suite,Phase 1,TOWER-1,TYPE_A,LOCAL,golf_club_view,581400,602400,455817,472281,22.00,2025-08-01,Launch early bird 20%+2% rebate
create,paragon-signature-suite,Phase 1,TOWER-1,TYPE_B,LOCAL,singapore_view,631285,648285,494927,508255,22.00,2025-08-01,Launch early bird 20%+2% rebate
create,paragon-signature-suite,Phase 1,TOWER-1,TYPE_A,LOCAL,golf_club_view,581400,602400,465120,481920,20.00,2026-01-01,Standard 20% rebate
create,paragon-signature-suite,Phase 1,TOWER-1,TYPE_B,LOCAL,singapore_view,631285,648285,505028,518628,20.00,2026-01-01,Standard 20% rebate
`);

// 09-11 from source with slug fix
write(`${PSS}/09-tower-facing-groups.csv`, replaceSlug(`${SRC_PSS}/tower-facing-groups.csv`, OLD_PSS, NEW_PSS));
write(`${PSS}/10-tower-stacks.csv`, replaceSlug(`${SRC_PSS}/tower-stacks.csv`, OLD_PSS, NEW_PSS));
write(`${PSS}/11-tower-special-floors.csv`, replaceSlug(`${SRC_PSS}/tower-special-floors.csv`, OLD_PSS, NEW_PSS));

console.log('\nAll done.');
